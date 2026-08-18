/**
 * Actual State Scanner
 * Scans the disk to determine what UDS artifacts actually exist in a project.
 *
 * When a manifest exists, uses it as the primary source of truth.
 * When no manifest exists (or it's corrupt), falls back to Legacy Discovery:
 * scanning known UDS paths and markers to reconstruct a synthetic manifest.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { join, relative } from 'path';
import { readManifest } from '../core/manifest.js';
import { computeFileHash, computeIntegrationBlockHash } from '../utils/hasher.js';
import { SUPPORTED_AI_TOOLS, UDS_MARKERS } from '../core/constants.js';
import { getSkillsDirForAgent, getCommandsDirForAgent, getCommandFileExtension } from '../config/ai-agent-paths.js';
import { getSkillsSourceEntryNames, getAvailableCommandNames } from '../utils/skills-installer.js';

/**
 * Files UDS writes into a skills/commands directory for its own bookkeeping.
 * They are not skills or commands and must never be diffed as such — the
 * scanner used to report `.manifest.json` as a stray command, which made the
 * reconciler propose deleting its own installation record. (XSPEC-343 R2)
 */
const INSTALLER_BOOKKEEPING_FILES = new Set(['.manifest.json']);

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
 * Read a directory, tolerating the read itself failing (race, permissions).
 *
 * Deliberately narrow: only `readdirSync` is wrapped. The scan loops used to sit
 * inside the same `catch {}`, so any programming error in the loop body became
 * "this agent has no skills/commands" — an empty actual state indistinguishable
 * from a genuinely empty directory, which downstream reads as "nothing to delete,
 * install everything".
 */
function readDirEntries(dirPath) {
  try {
    return readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }
}

let _sourceEntries = null;
let _shippedCommands = null;

/** Directory names UDS ships under `skills/`, cached per process. */
function sourceEntryNames() {
  if (_sourceEntries === null) _sourceEntries = getSkillsSourceEntryNames();
  return _sourceEntries;
}

/** Command names UDS ships, cached per process. */
function shippedCommandNames() {
  if (_shippedCommands === null) _shippedCommands = new Set(getAvailableCommandNames());
  return _shippedCommands;
}

/**
 * Did UDS put this skill directory here?
 *
 * Two positive signals, either is enough:
 *   1. a directory of the same name exists in UDS's own `skills/` tree — this
 *      also covers the non-skill siblings (`_shared`, `agents`, …) that an older
 *      CLI copied in by mistake, so they stay cleanable;
 *   2. `manifest.skillHashes` records a file under it — authoritative when
 *      present, though in practice it is sparse (dev-platform: 2 entries for 78
 *      installed skills), which is exactly why signal 1 has to carry the weight.
 *
 * Anything else is the adopter's own, and is warned about rather than deleted.
 */
// A directory whose name exists in UDS's own `skills/` tree was put there by UDS.
// That is the only positive signal, and everything else is the adopter's.
//
// `manifest.skillHashes` USED TO BE a second signal here ("authoritative whenever
// present"). That was only ever safe because the hasher was broken: a trailing
// separator in three skill paths made it record 2 entries for 78 installed skills,
// so the clause almost never fired. Fixing the hasher (6.2.2) populated the same
// map with every file under the skills folder — including the adopter's own — and
// each one of those became a deletion candidate, re-opening the exact defect this
// function was written to close. The lesson is not about hashes: a broken tool's
// sparse output was used as evidence that reading it was safe.
//
// The cost of the narrow signal is unchanged and still deliberate: skills UDS used
// to ship and has since removed are warned about rather than deleted, because
// nothing on disk distinguishes them from the adopter's own work. Leaving a few
// stale directories with a warning is a better way to fail than deleting files
// somebody hand-wrote.
/**
 * Hash an installed skill directory the way the desired side hashes a resolved
 * one: top-level files only, sorted by name, name and content both fed in.
 *
 * Written against `computeSkillContentHash`'s format rather than calling it,
 * because the input here is paths on disk and there is nothing gained by
 * materialising a second array first. The format is the contract; if it changes
 * in one place and not the other every skill reports as changed, which the
 * paired tests in `skill-content-hash.test.js` exist to catch.
 */
function hashInstalledSkillDir(dirPath) {
  let entries;
  try {
    entries = readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return null;
  }

  const names = entries.filter((e) => e.isFile()).map((e) => e.name).sort();
  if (names.length === 0) return null;

  const h = createHash('sha256');
  for (const name of names) {
    let content;
    try {
      content = readFileSync(join(dirPath, name), 'utf-8');
    } catch {
      // Unreadable file → no trustworthy hash. Returning a partial one would
      // claim the directory matches upstream when part of it was never read.
      return null;
    }
    h.update(name);
    h.update('\0');
    h.update(content);
    h.update('\0');
  }
  return `sha256:${h.digest('hex')}`;
}

function isUdsProvenance(skillName) {
  return sourceEntryNames().has(skillName);
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

    for (const entry of readDirEntries(skillsDir)) {
      if (!entry.isDirectory()) continue;
      const skillName = entry.name;
      const key = `skill:${agent}:${level}:${skillName}`;
      const relPath = level === 'project'
        ? getRelativePath(projectPath, join(skillsDir, skillName))
        : join(skillsDir, skillName);

      // Content hash of what is actually installed, over the same file set and
      // the same algorithm the desired side uses (XSPEC-382 R1).
      //
      // Computed ONLY for UDS-managed skills. An adopter's own skill has no
      // desired counterpart, so a hash for it could only ever feed a comparison
      // against nothing — and this scanner has already been the site of a
      // defect that proposed deleting fourteen of dev-platform's hand-written
      // skills. It does not get a second chance to reason about them.
      const udsManaged = isUdsProvenance(skillName);
      state.skills.set(key, {
        relativePath: relPath,
        hash: udsManaged ? hashInstalledSkillDir(join(skillsDir, skillName)) : null,
        size: null,
        category: 'skill',
        sourcePath: null,
        metadata: {
          agent,
          level,
          skillName,
          scanned: true,
          // Whether UDS is the thing that put this directory here. Everything in
          // the skills folder used to be assumed UDS-managed, so a plan for a repo
          // with hand-written skills proposed deleting them: dev-platform's would
          // have removed fourteen. (XSPEC-343 R2)
          udsManaged
        }
      });
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

    const ext = getCommandFileExtension(agent);

    for (const entry of readDirEntries(cmdsDir)) {
      if (INSTALLER_BOOKKEEPING_FILES.has(entry.name)) continue;

      // Commands are files named `<name><ext>` (or, for some agents, directories).
      // Stripping a hard-coded `.md` left every Gemini command as `commit.toml`,
      // which never matches the desired key `commit`, so all of them were
      // proposed for deletion.
      const cmdName = entry.name.endsWith(ext)
        ? entry.name.slice(0, -ext.length)
        : entry.name;
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
        metadata: {
          agent,
          level,
          commandName: cmdName,
          scanned: true,
          udsManaged: shippedCommandNames().has(cmdName)
        }
      });
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
