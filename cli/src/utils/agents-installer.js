/**
 * Agents Installer
 *
 * Provides installation and management of AGENT.md definitions
 * across all supported AI coding assistants.
 *
 * @version 1.0.0
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import {
  getAgentConfig,
  getAgentsDirForAgent,
  supportsAgents
} from '../config/ai-agent-paths.js';
import { computeFileHash } from './hasher.js';

// Get the CLI package root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_ROOT = join(__dirname, '..', '..');
const BUNDLED_DIR = join(CLI_ROOT, 'bundled');

/**
 * Get the Agents source directory.
 * Prioritizes bundled directory (npm install), falls back to development path.
 * @returns {string} Path to agents source directory
 */
function getAgentsSourceDir() {
  const bundledPath = join(BUNDLED_DIR, 'skills', 'claude-code', 'agents');
  if (existsSync(bundledPath)) {
    return bundledPath;
  }
  // Development environment fallback
  return join(CLI_ROOT, '..', 'skills', 'claude-code', 'agents');
}

const AGENTS_LOCAL_DIR = getAgentsSourceDir();

/**
 * Get list of available agent names from local directory
 * @returns {string[]} Array of agent names (without .md extension)
 */
export function getAvailableAgentNames() {
  if (!existsSync(AGENTS_LOCAL_DIR)) {
    return [];
  }

  const NON_AGENT_ITEMS = ['README.md', '.DS_Store', '.manifest.json'];

  try {
    return readdirSync(AGENTS_LOCAL_DIR)
      .filter(file => {
        if (NON_AGENT_ITEMS.includes(file)) return false;
        if (!file.endsWith('.md')) return false;
        const itemPath = join(AGENTS_LOCAL_DIR, file);
        return statSync(itemPath).isFile();
      })
      .map(file => basename(file, '.md'));
  } catch {
    return [];
  }
}

/**
 * Get agent definition content
 * @param {string} agentName - Agent name (without .md)
 * @returns {string|null} Agent content or null if not found
 */
export function getAgentContent(agentName) {
  const sourcePath = join(AGENTS_LOCAL_DIR, `${agentName}.md`);
  if (!existsSync(sourcePath)) {
    return null;
  }
  return readFileSync(sourcePath, 'utf-8');
}

/**
 * Parse agent frontmatter to extract metadata
 * @param {string} content - Agent file content
 * @returns {Object} Parsed frontmatter fields
 */
export function parseAgentFrontmatter(content) {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return {};
  }

  const frontmatter = {};
  const lines = frontmatterMatch[1].split('\n');

  for (const line of lines) {
    const match = line.match(/^(\w[\w-]*):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      // Handle arrays (simple case)
      if (value.startsWith('[') && value.endsWith(']')) {
        frontmatter[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/"/g, ''));
      } else {
        frontmatter[key] = value.trim();
      }
    }
  }

  return frontmatter;
}

/**
 * Install agents for a specific AI tool
 * @param {string} agent - AI tool identifier (e.g., 'claude-code', 'opencode')
 * @param {string} level - 'user' or 'project'
 * @param {string[]} agentNames - Array of agent names to install (null = all)
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {Object} Installation result
 */
export async function installAgentsForTool(agent, level, agentNames = null, projectPath = null) {
  const config = getAgentConfig(agent);
  if (!config || !supportsAgents(agent)) {
    return {
      success: false,
      agent,
      level,
      error: `AI tool '${agent}' does not support agents installation`,
      installed: [],
      errors: []
    };
  }

  // Get target directory
  const targetDir = getAgentsDirForAgent(agent, level, projectPath);
  if (!targetDir) {
    return {
      success: false,
      agent,
      level,
      error: `Could not determine target directory for ${agent} at ${level} level`,
      installed: [],
      errors: []
    };
  }

  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // Get agents to install
  const availableAgents = getAvailableAgentNames();
  const toInstall = agentNames || availableAgents;

  const results = {
    success: true,
    agent,
    level,
    targetDir,
    installed: [],
    errors: [],
    fileHashes: {}
  };

  for (const agentName of toInstall) {
    const result = installSingleAgent(agentName, targetDir, agent);
    if (result.success) {
      results.installed.push(agentName);
    } else {
      results.errors.push({ agent: agentName, error: result.error });
      results.success = false;
    }
  }

  // Write manifest
  if (results.installed.length > 0) {
    writeAgentsManifest(agent, level, targetDir, results.installed);

    // Compute file hashes for tracking
    const now = new Date().toISOString();
    for (const agentName of results.installed) {
      const filePath = join(targetDir, `${agentName}.md`);
      const hashInfo = computeFileHash(filePath);
      if (hashInfo) {
        results.fileHashes[`${agent}/${agentName}.md`] = {
          ...hashInfo,
          installedAt: now
        };
      }
    }
  }

  return results;
}

/**
 * Install a single agent to target directory
 * @param {string} agentName - Agent name (without .md)
 * @param {string} targetDir - Target directory
 * @param {string} aiTool - AI tool identifier (for potential transformation)
 * @returns {Object} Result
 */
function installSingleAgent(agentName, targetDir, aiTool) {
  const sourcePath = join(AGENTS_LOCAL_DIR, `${agentName}.md`);
  const targetPath = join(targetDir, `${agentName}.md`);

  if (!existsSync(sourcePath)) {
    return {
      success: false,
      agent: agentName,
      error: `Agent not found: ${agentName}`
    };
  }

  try {
    let content = readFileSync(sourcePath, 'utf-8');

    // Transform content if needed for specific AI tools
    content = transformAgentForTool(content, agentName, aiTool);

    writeFileSync(targetPath, content);
    return { success: true, agent: agentName, path: targetPath };
  } catch (error) {
    return {
      success: false,
      agent: agentName,
      error: error.message
    };
  }
}

/**
 * Transform agent content for a specific AI tool if needed
 * @param {string} content - Original agent content
 * @param {string} agentName - Agent name
 * @param {string} aiTool - AI tool identifier
 * @returns {string} Transformed content
 */
function transformAgentForTool(content, agentName, aiTool) {
  // Claude Code and OpenCode use the same format (supports Task tool)
  if (aiTool === 'claude-code' || aiTool === 'opencode' || aiTool === 'roo-code') {
    return content;
  }

  // For tools that don't support Task tool, add inline mode header
  // This helps the tool understand to inject the agent as context
  const inlineModeHeader = `<!-- UDS Agent: ${agentName} -->
<!-- Execution Mode: inline (inject as context) -->

`;

  // Check if content already has the header
  if (content.includes('<!-- UDS Agent:')) {
    return content;
  }

  return inlineModeHeader + content;
}

/**
 * Write agents manifest
 * @param {string} aiTool - AI tool identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} targetDir - Target directory
 * @param {string[]} agents - List of installed agents
 */
function writeAgentsManifest(aiTool, level, targetDir, agents) {
  const manifestPath = join(targetDir, '.manifest.json');
  const { version } = JSON.parse(
    readFileSync(join(CLI_ROOT, 'package.json'), 'utf-8')
  );

  const manifest = {
    version,
    source: 'universal-dev-standards',
    type: 'agents',
    aiTool,
    level,
    agents,
    installedDate: new Date().toISOString().split('T')[0]
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Get installed agents info for an AI tool
 * @param {string} aiTool - AI tool identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {Object|null} Installed agents info or null
 */
export function getInstalledAgentsForTool(aiTool, level = 'project', projectPath = null) {
  const targetDir = getAgentsDirForAgent(aiTool, level, projectPath);
  if (!targetDir || !existsSync(targetDir)) {
    return null;
  }

  const manifestPath = join(targetDir, '.manifest.json');

  // Count agent files
  let agentFiles = [];
  try {
    agentFiles = readdirSync(targetDir)
      .filter(f => f.endsWith('.md') && f !== 'README.md');
  } catch {
    return null;
  }

  if (agentFiles.length === 0) {
    return null;
  }

  const getAgentName = (filename) => basename(filename, '.md');

  if (!existsSync(manifestPath)) {
    return {
      installed: true,
      count: agentFiles.length,
      agents: agentFiles.map(getAgentName),
      version: null,
      aiTool,
      level,
      path: targetDir
    };
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    return {
      installed: true,
      count: agentFiles.length,
      agents: manifest.agents || agentFiles.map(getAgentName),
      version: manifest.version || null,
      aiTool,
      level,
      path: targetDir,
      installedDate: manifest.installedDate || null
    };
  } catch {
    return {
      installed: true,
      count: agentFiles.length,
      agents: agentFiles.map(getAgentName),
      version: null,
      aiTool,
      level,
      path: targetDir
    };
  }
}

/**
 * Install agents to multiple AI tools at once
 * @param {Array<{agent: string, level: string}>} installations - Array of installation targets
 * @param {string[]} agentNames - Agents to install (null = all)
 * @param {string} projectPath - Project root path
 * @returns {Object} Combined results
 */
export async function installAgentsToMultipleTools(installations, agentNames = null, projectPath = null) {
  const results = {
    success: true,
    installations: [],
    totalInstalled: 0,
    totalErrors: 0,
    allFileHashes: {}
  };

  for (const { agent, level } of installations) {
    const result = await installAgentsForTool(agent, level, agentNames, projectPath);
    results.installations.push(result);

    if (!result.success) {
      results.success = false;
    }
    results.totalInstalled += result.installed.length;
    results.totalErrors += result.errors.length;

    // Merge file hashes from this installation
    if (result.fileHashes) {
      Object.assign(results.allFileHashes, result.fileHashes);
    }
  }

  return results;
}

export default {
  installAgentsForTool,
  getInstalledAgentsForTool,
  installAgentsToMultipleTools,
  getAvailableAgentNames,
  getAgentContent,
  parseAgentFrontmatter
};
