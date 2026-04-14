/**
 * Actual State Scanner
 * Scans the disk to determine what UDS artifacts actually exist in a project.
 *
 * When a manifest exists, uses it as the primary source of truth.
 * When no manifest exists (or it's corrupt), falls back to Legacy Discovery:
 * scanning known UDS paths and markers to reconstruct a synthetic manifest.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { readManifest } from '../core/manifest.js';
import { computeFileHash, computeIntegrationBlockHash } from '../utils/hasher.js';
import { SUPPORTED_AI_TOOLS, UDS_MARKERS } from '../core/constants.js';
import { getSkillsDirForAgent, getCommandsDirForAgent } from '../config/ai-agent-paths.js';

/**
 * Scan the actual state of UDS artifacts on disk.
 *
 * @param {string} projectPath - Project root path
 * @param {Object} [manifest] - Existing manifest (if available). If null, will attempt to read from disk.
 * @returns {import('./desired-state-calculator.js').UDSState}
 */
export function scanActualState(projectPath, manifest = undefined) {
  // If no manifest provided, try to read from disk
  if (manifest === undefined) {
    manifest = readManifest(projectPath);
  }

  const state = {
    standards: new Map(),
    options: new Map(),
    integrations: new Map(),
    skills: new Map(),
    commands: new Map(),
    hook: new Map(),
    manifest: manifest
  };

  // Scan .standards/ directory for standard and option files
  scanStandardsDir(state, projectPath);

  // Scan integration files (CLAUDE.md, .cursorrules, etc.)
  scanIntegrations(state, projectPath);

  // Scan skill directories
  scanSkills(state, projectPath, manifest);

  // Scan command directories
  scanCommands(state, projectPath, manifest);

  // Scan hook files
  scanHook(state, projectPath);

  return state;
}

/**
 * Legacy Discovery: scan the project when no manifest exists.
 * Reconstructs a synthetic manifest from discovered UDS artifacts.
 *
 * @param {string} projectPath
 * @returns {{ state: import('./desired-state-calculator.js').UDSState, syntheticManifest: Object }}
 */
export function legacyDiscovery(projectPath) {
  const discovered = {
    standards: [],
    integrations: [],
    hasSkills: false,
    hasCommands: false,
    skillInstallations: [],
    commandInstallations: []
  };

  // 1. Check .standards/ directory
  const standardsDir = join(projectPath, '.standards');
  if (existsSync(standardsDir)) {
    try {
      const files = readdirSync(standardsDir);
      for (const file of files) {
        if (file.endsWith('.ai.yaml') || file.endsWith('.md')) {
          if (file !== 'manifest.json') {
            // Extract standard ID from filename (e.g., 'commit-message.ai.yaml' -> 'commit-message')
            const id = file.replace(/\.(ai\.yaml|md)$/, '');
            discovered.standards.push(id);
          }
        }
      }
    } catch {
      // Directory read failed, continue
    }
  }

  // 2. Check integration files for UDS markers
  for (const [toolName, toolConfig] of Object.entries(SUPPORTED_AI_TOOLS)) {
    const filePath = join(projectPath, toolConfig.file);
    if (existsSync(filePath)) {
      if (hasUDSMarkers(filePath, toolConfig.format)) {
        discovered.integrations.push(toolName);
      }
    }
  }

  // 3. Scan for skill installations
  const knownAgents = ['claude-code', 'cursor', 'windsurf', 'cline', 'opencode', 'gemini-cli'];
  for (const agent of knownAgents) {
    const projectSkillsDir = getSkillsDirForAgent(agent, 'project', projectPath);
    if (projectSkillsDir && existsSync(projectSkillsDir)) {
      discovered.hasSkills = true;
      discovered.skillInstallations.push({ agent, level: 'project' });
    }
  }

  // 4. Scan for command installations
  for (const agent of knownAgents) {
    const projectCmdsDir = getCommandsDirForAgent(agent, 'project', projectPath);
    if (projectCmdsDir && existsSync(projectCmdsDir)) {
      discovered.hasCommands = true;
      discovered.commandInstallations.push({ agent, level: 'project' });
    }
  }

  // Build synthetic manifest
  const syntheticManifest = {
    version: '3.3.0',
    upstream: {
      repo: 'AsiaOstrich/universal-dev-standards',
      version: 'unknown',  // Triggers full update
      installed: new Date().toISOString()
    },
    format: 'ai',
    contentMode: 'index',
    standards: discovered.standards,
    extensions: [],
    integrations: discovered.integrations,
    integrationConfigs: {},
    options: {},
    aiTools: discovered.integrations,
    skills: {
      installed: discovered.hasSkills,
      location: 'project',
      names: [],
      version: null,
      installations: discovered.skillInstallations
    },
    commands: {
      installed: discovered.hasCommands,
      names: [],
      version: null,
      installations: discovered.commandInstallations
    },
    methodology: null,
    fileHashes: {},
    skillHashes: {},
    commandHashes: {},
    integrationBlockHashes: {}
  };

  // Scan actual state using the synthetic manifest
  const state = scanActualState(projectPath, syntheticManifest);

  return { state, syntheticManifest };
}

/**
 * Scan .standards/ directory for actual standard and option files.
 */
function scanStandardsDir(state, projectPath) {
  const standardsDir = join(projectPath, '.standards');
  if (!existsSync(standardsDir)) return;

  // Scan top-level standards
  try {
    const files = readdirSync(standardsDir);
    for (const file of files) {
      const fullPath = join(standardsDir, file);
      if (!statSync(fullPath).isFile()) continue;
      if (file === 'manifest.json') continue;

      const relativePath = `.standards/${file}`;
      const hashInfo = computeFileHash(fullPath);

      state.standards.set(relativePath, {
        relativePath,
        hash: hashInfo?.hash || null,
        size: hashInfo?.size || null,
        category: 'standard',
        sourcePath: null,
        metadata: { scanned: true }
      });
    }
  } catch {
    // Ignore read errors
  }

  // Scan options subdirectory
  const optionsDir = join(standardsDir, 'options');
  if (existsSync(optionsDir)) {
    scanDirectoryRecursive(optionsDir, (fullPath, relPath) => {
      const relativePath = `.standards/options/${relPath}`;
      const hashInfo = computeFileHash(fullPath);

      state.options.set(relativePath, {
        relativePath,
        hash: hashInfo?.hash || null,
        size: hashInfo?.size || null,
        category: 'option',
        sourcePath: null,
        metadata: { scanned: true }
      });
    });
  }
}

/**
 * Scan integration files for UDS content.
 */
function scanIntegrations(state, projectPath) {
  for (const [toolName, toolConfig] of Object.entries(SUPPORTED_AI_TOOLS)) {
    const filePath = join(projectPath, toolConfig.file);
    if (!existsSync(filePath)) continue;

    const blockHash = computeIntegrationBlockHash(filePath);
    const fileHash = computeFileHash(filePath);

    state.integrations.set(toolConfig.file, {
      relativePath: toolConfig.file,
      hash: blockHash?.blockHash || fileHash?.hash || null,
      size: blockHash?.blockSize || fileHash?.size || null,
      category: 'integration',
      sourcePath: null,
      metadata: {
        toolName,
        format: toolConfig.format,
        hasMarkers: !!blockHash,
        fullHash: fileHash?.hash || null,
        fullSize: fileHash?.size || null,
        blockHash: blockHash || null
      }
    });
  }
}

/**
 * Scan skill installations.
 */
function scanSkills(state, projectPath, manifest) {
  if (!manifest?.skills?.installations) return;

  for (const installation of manifest.skills.installations) {
    const { agent, level } = installation;
    const skillsDir = getSkillsDirForAgent(agent, level, projectPath);
    if (!skillsDir || !existsSync(skillsDir)) continue;

    try {
      const entries = readdirSync(skillsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const skillName = entry.name;
        const key = `skill:${agent}:${level}:${skillName}`;
        const relPath = level === 'project'
          ? getRelativePath(projectPath, join(skillsDir, skillName))
          : join(skillsDir, skillName);

        state.skills.set(key, {
          relativePath: relPath,
          hash: null,  // Directory-level hashes tracked in manifest.skillHashes
          size: null,
          category: 'skill',
          sourcePath: null,
          metadata: { agent, level, skillName, scanned: true }
        });
      }
    } catch {
      // Ignore read errors
    }
  }
}

/**
 * Scan command installations.
 */
function scanCommands(state, projectPath, manifest) {
  if (!manifest?.commands?.installations) return;

  for (const installation of manifest.commands.installations) {
    const { agent, level } = installation;
    const cmdsDir = getCommandsDirForAgent(agent, level, projectPath);
    if (!cmdsDir || !existsSync(cmdsDir)) continue;

    try {
      const entries = readdirSync(cmdsDir, { withFileTypes: true });
      for (const entry of entries) {
        // Commands can be files (.md) or directories
        const cmdName = entry.name.replace(/\.md$/, '');
        const key = `command:${agent}:${level}:${cmdName}`;
        const relPath = level === 'project'
          ? getRelativePath(projectPath, join(cmdsDir, entry.name))
          : join(cmdsDir, entry.name);

        state.commands.set(key, {
          relativePath: relPath,
          hash: null,
          size: null,
          category: 'command',
          sourcePath: null,
          metadata: { agent, level, commandName: cmdName, scanned: true }
        });
      }
    } catch {
      // Ignore read errors
    }
  }
}

/**
 * Scan .husky/pre-commit for UDS hook entries.
 */
function scanHook(state, projectPath) {
  const hookPath = join(projectPath, '.husky', 'pre-commit');
  if (!existsSync(hookPath)) return;

  try {
    const content = readFileSync(hookPath, 'utf-8');
    // Check for UDS-related lines
    const udsLines = content.split('\n').filter(line =>
      line.includes('uds') || line.includes('UDS') || line.includes('.standards')
    );

    if (udsLines.length > 0) {
      state.hook.set('.husky/pre-commit', {
        relativePath: '.husky/pre-commit',
        hash: computeFileHash(join(projectPath, '.husky', 'pre-commit'))?.hash || null,
        size: null,
        category: 'hook',
        sourcePath: null,
        metadata: { udsLines, scanned: true }
      });
    }
  } catch {
    // Ignore read errors
  }

  // Also scan native .git/hooks/pre-commit (installed by uds init for non-Node projects)
  const nativeHookPath = join(projectPath, '.git', 'hooks', 'pre-commit');
  if (existsSync(nativeHookPath)) {
    try {
      const content = readFileSync(nativeHookPath, 'utf-8');
      const udsLines = content.split('\n').filter(line =>
        line.includes('uds') || line.includes('UDS') || line.includes('.standards')
      );

      if (udsLines.length > 0) {
        state.hook.set('.git/hooks/pre-commit', {
          relativePath: '.git/hooks/pre-commit',
          hash: computeFileHash(join(projectPath, '.git', 'hooks', 'pre-commit'))?.hash || null,
          size: null,
          category: 'hook',
          sourcePath: null,
          metadata: { udsLines, scanned: true, type: 'native' }
        });
      }
    } catch {
      // Ignore read errors
    }
  }
}

/**
 * Check if a file contains UDS markers.
 * @param {string} filePath
 * @param {string} format - 'markdown'|'plaintext'|'yaml'
 * @returns {boolean}
 */
function hasUDSMarkers(filePath, format) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const markers = UDS_MARKERS[format] || UDS_MARKERS.markdown;
    return content.includes(markers.start) && content.includes(markers.end);
  } catch {
    return false;
  }
}

/**
 * Recursively scan a directory and invoke callback for each file.
 */
function scanDirectoryRecursive(dirPath, callback, baseDir = dirPath) {
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanDirectoryRecursive(fullPath, callback, baseDir);
      } else if (entry.isFile()) {
        const relPath = relative(baseDir, fullPath);
        callback(fullPath, relPath);
      }
    }
  } catch {
    // Ignore read errors
  }
}

/**
 * Get relative path from project root.
 */
function getRelativePath(projectPath, absPath) {
  if (absPath.startsWith(projectPath)) {
    let rel = absPath.slice(projectPath.length);
    if (rel.startsWith('/') || rel.startsWith('\\')) {
      rel = rel.slice(1);
    }
    return rel;
  }
  return absPath;
}
