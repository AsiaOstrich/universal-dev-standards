/**
 * Unified Skills and Commands Installer
 *
 * Provides a unified interface for installing skills and slash commands
 * across all supported AI coding assistants.
 *
 * @version 1.0.0
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync, copyFileSync, statSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import {
  getAgentConfig,
  getSkillsDirForAgent,
  getCommandsDirForAgent
} from '../config/ai-agent-paths.js';
import { computeDirectoryHashes, computeFileHash } from './hasher.js';

// Get the CLI package root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_ROOT = join(__dirname, '..', '..');
const BUNDLED_DIR = join(CLI_ROOT, 'bundled');

/**
 * Get the Skills source directory.
 * Prioritizes bundled directory (npm install), falls back to development path.
 * @returns {string} Path to skills source directory
 */
function getSkillsSourceDir() {
  const bundledPath = join(BUNDLED_DIR, 'skills', 'claude-code');
  if (existsSync(bundledPath)) {
    return bundledPath;
  }
  // Development environment fallback
  return join(CLI_ROOT, '..', 'skills', 'claude-code');
}

const SKILLS_LOCAL_DIR = getSkillsSourceDir();
const COMMANDS_LOCAL_DIR = join(SKILLS_LOCAL_DIR, 'commands');

/**
 * Get list of available skill names from local directory
 * @returns {string[]} Array of skill names
 */
export function getAvailableSkillNames() {
  if (!existsSync(SKILLS_LOCAL_DIR)) {
    return [];
  }

  const NON_SKILL_ITEMS = [
    'README.md', 'CONTRIBUTING.template.md',
    'commands', '.manifest.json', '.DS_Store'
  ];

  try {
    return readdirSync(SKILLS_LOCAL_DIR)
      .filter(item => {
        if (NON_SKILL_ITEMS.includes(item)) return false;
        const itemPath = join(SKILLS_LOCAL_DIR, item);
        return statSync(itemPath).isDirectory();
      });
  } catch {
    return [];
  }
}

/**
 * Get list of available command names from local directory
 * @returns {string[]} Array of command names (without .md extension)
 */
export function getAvailableCommandNames() {
  if (!existsSync(COMMANDS_LOCAL_DIR)) {
    return [];
  }

  try {
    return readdirSync(COMMANDS_LOCAL_DIR)
      .filter(file => file.endsWith('.md') && file !== 'README.md')
      .map(file => basename(file, '.md'));
  } catch {
    return [];
  }
}

/**
 * Install skills for a specific AI agent
 * @param {string} agent - Agent identifier (e.g., 'opencode', 'cursor')
 * @param {string} level - 'user' or 'project'
 * @param {string[]} skillNames - Array of skill names to install (null = all)
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {Object} Installation result
 */
export async function installSkillsForAgent(agent, level, skillNames = null, projectPath = null) {
  const config = getAgentConfig(agent);
  if (!config || !config.skills) {
    return {
      success: false,
      agent,
      level,
      error: `Agent '${agent}' does not support skills installation`,
      installed: [],
      errors: []
    };
  }

  // Get target directory
  const targetDir = getSkillsDirForAgent(agent, level, projectPath);
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

  // Get skills to install
  const availableSkills = getAvailableSkillNames();
  const toInstall = skillNames || availableSkills;

  const results = {
    success: true,
    agent,
    level,
    targetDir,
    installed: [],
    errors: [],
    fileHashes: {} // New: file hashes for installed skills
  };

  for (const skillName of toInstall) {
    const result = installSingleSkill(skillName, targetDir);
    if (result.success) {
      results.installed.push(skillName);
    } else {
      results.errors.push({ skill: skillName, error: result.error });
      results.success = false;
    }
  }

  // Write manifest
  if (results.installed.length > 0) {
    writeSkillsManifestForAgent(agent, level, targetDir);

    // Compute file hashes for tracking
    // Key format: agent/level/skillName/filename (e.g., "opencode/project/commit-standards/SKILL.md")
    const baseKey = `${agent}/${level}`;
    results.fileHashes = computeDirectoryHashes(targetDir, baseKey);
  }

  return results;
}

/**
 * Install a single skill to a target directory
 * @param {string} skillName - Skill name
 * @param {string} targetBaseDir - Target base directory
 * @returns {Object} Result
 */
function installSingleSkill(skillName, targetBaseDir) {
  const sourceDir = join(SKILLS_LOCAL_DIR, skillName);
  const targetDir = join(targetBaseDir, skillName);

  if (!existsSync(sourceDir)) {
    return {
      success: false,
      skillName,
      error: `Skill not found: ${skillName}`
    };
  }

  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  try {
    const files = readdirSync(sourceDir);
    for (const fileName of files) {
      const sourcePath = join(sourceDir, fileName);
      const targetPath = join(targetDir, fileName);

      // Skip directories for now (could be extended to handle subdirs)
      if (statSync(sourcePath).isDirectory()) continue;

      copyFileSync(sourcePath, targetPath);
    }

    return { success: true, skillName, path: targetDir };
  } catch (error) {
    return {
      success: false,
      skillName,
      error: error.message
    };
  }
}

/**
 * Write skills manifest for an agent
 * @param {string} agent - Agent identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} targetDir - Target directory
 */
function writeSkillsManifestForAgent(agent, level, targetDir) {
  const manifestPath = join(targetDir, '.manifest.json');
  const { version } = JSON.parse(
    readFileSync(join(CLI_ROOT, 'package.json'), 'utf-8')
  );

  const manifest = {
    version,
    source: 'universal-dev-standards',
    agent,
    level,
    installedDate: new Date().toISOString().split('T')[0]
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Install slash commands for a specific AI agent
 * @param {string} agent - Agent identifier (e.g., 'opencode', 'copilot')
 * @param {string} level - 'user' or 'project'
 * @param {string[]} commandNames - Array of command names to install (null = all)
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {Object} Installation result
 */
export async function installCommandsForAgent(agent, level = 'project', commandNames = null, projectPath = null) {
  const config = getAgentConfig(agent);
  if (!config || !config.commands) {
    return {
      success: false,
      agent,
      level,
      error: `Agent '${agent}' does not support slash commands`,
      installed: [],
      errors: []
    };
  }

  // Get target directory
  const targetDir = getCommandsDirForAgent(agent, level, projectPath);
  if (!targetDir) {
    return {
      success: false,
      agent,
      level,
      error: `Could not determine commands directory for ${agent} at ${level} level`,
      installed: [],
      errors: []
    };
  }

  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // Get commands to install
  const availableCommands = getAvailableCommandNames();
  const toInstall = commandNames || availableCommands;

  const results = {
    success: true,
    agent,
    level,
    targetDir,
    installed: [],
    errors: [],
    fileHashes: {} // New: file hashes for installed commands
  };

  for (const cmdName of toInstall) {
    const result = installSingleCommand(cmdName, targetDir, agent);
    if (result.success) {
      results.installed.push(cmdName);
    } else {
      results.errors.push({ command: cmdName, error: result.error });
      results.success = false;
    }
  }

  // Write manifest
  if (results.installed.length > 0) {
    writeCommandsManifest(agent, level, targetDir, results.installed);

    // Compute file hashes for tracking
    // Key format: agent/filename (e.g., "opencode/commit.md")
    const now = new Date().toISOString();
    for (const cmdName of results.installed) {
      const ext = getCommandFileExtension(agent);
      const filePath = join(targetDir, `${cmdName}${ext}`);
      const hashInfo = computeFileHash(filePath);
      if (hashInfo) {
        results.fileHashes[`${agent}/${cmdName}${ext}`] = {
          ...hashInfo,
          installedAt: now
        };
      }
    }
  }

  return results;
}

/**
 * Get the appropriate file extension for commands based on agent
 * @param {string} agent - Agent identifier
 * @returns {string} File extension (including the dot)
 */
function getCommandFileExtension(agent) {
  // Gemini CLI uses TOML format
  if (agent === 'gemini-cli') {
    return '.toml';
  }
  // Most agents use markdown
  return '.md';
}

/**
 * Install a single command to target directory
 * @param {string} cmdName - Command name (without .md)
 * @param {string} targetDir - Target directory
 * @param {string} agent - Agent identifier (for potential format transformation)
 * @returns {Object} Result
 */
function installSingleCommand(cmdName, targetDir, agent) {
  const sourcePath = join(COMMANDS_LOCAL_DIR, `${cmdName}.md`);
  const targetExt = getCommandFileExtension(agent);
  const targetPath = join(targetDir, `${cmdName}${targetExt}`);

  if (!existsSync(sourcePath)) {
    return {
      success: false,
      command: cmdName,
      error: `Command not found: ${cmdName}`
    };
  }

  try {
    let content = readFileSync(sourcePath, 'utf-8');

    // Transform content if needed for specific agents
    content = transformCommandForAgent(content, cmdName, agent);

    writeFileSync(targetPath, content);
    return { success: true, command: cmdName, path: targetPath };
  } catch (error) {
    return {
      success: false,
      command: cmdName,
      error: error.message
    };
  }
}

/**
 * Transform command content for a specific agent if needed
 * @param {string} content - Original command content
 * @param {string} cmdName - Command name
 * @param {string} agent - Agent identifier
 * @returns {string} Transformed content
 */
function transformCommandForAgent(content, cmdName, agent) {
  // Currently, most agents use the same format as Claude Code
  // This function can be extended for agent-specific transformations

  // Example: OpenCode might need different frontmatter fields
  if (agent === 'opencode') {
    // OpenCode uses the same YAML frontmatter format
    // No transformation needed currently
    return content;
  }

  if (agent === 'copilot') {
    // GitHub Copilot prompts might need different format
    // For now, keep the same format
    return content;
  }

  if (agent === 'gemini-cli') {
    // Gemini CLI uses TOML for commands
    return convertMarkdownToGeminiToml(content, cmdName);
  }

  return content;
}

/**
 * Convert markdown command with YAML frontmatter to Gemini CLI TOML format
 * @param {string} content - Markdown content with YAML frontmatter
 * @param {string} cmdName - Command name (for fallback description)
 * @returns {string} TOML formatted content
 */
function convertMarkdownToGeminiToml(content, cmdName) {
  // Parse YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    // No frontmatter, wrap entire content as prompt
    return `description = "${cmdName} command"\n\nprompt = """\n${content}\n"""`;
  }

  const [, frontmatterText, promptContent] = frontmatterMatch;

  // Parse frontmatter fields
  let description = `${cmdName} command`;
  let argumentHint = null;

  // Extract description from YAML
  const descMatch = frontmatterText.match(/^description:\s*(.+)$/m);
  if (descMatch) {
    description = descMatch[1].trim();
  }

  // Extract argument-hint from YAML
  const argHintMatch = frontmatterText.match(/^argument-hint:\s*(.+)$/m);
  if (argHintMatch) {
    argumentHint = argHintMatch[1].trim();
  }

  // Build TOML content
  let toml = `# ${cmdName} command - converted from UDS\n`;
  toml += `description = "${escapeTomlString(description)}"\n\n`;

  // Add argument placeholder if the command accepts arguments
  let prompt = promptContent.trim();
  if (argumentHint) {
    // Insert argument handling instruction at the beginning
    const argInstruction = '\n## Arguments\nUser provided: {{args}}\n';
    prompt = argInstruction + '\n' + prompt;
  }

  // Multi-line string in TOML uses triple quotes
  toml += `prompt = """\n${prompt}\n"""`;

  return toml;
}

/**
 * Escape special characters for TOML string
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeTomlString(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Write commands manifest
 * @param {string} agent - Agent identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} targetDir - Target directory
 * @param {string[]} commands - List of installed commands
 */
function writeCommandsManifest(agent, level, targetDir, commands) {
  const manifestPath = join(targetDir, '.manifest.json');
  const { version } = JSON.parse(
    readFileSync(join(CLI_ROOT, 'package.json'), 'utf-8')
  );

  const manifest = {
    version,
    source: 'universal-dev-standards',
    agent,
    level,
    commands,
    installedDate: new Date().toISOString().split('T')[0]
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Get installed skills info for an agent
 * @param {string} agent - Agent identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {Object|null} Installed skills info or null
 */
export function getInstalledSkillsInfoForAgent(agent, level, projectPath = null) {
  const targetDir = getSkillsDirForAgent(agent, level, projectPath);
  if (!targetDir || !existsSync(targetDir)) {
    return null;
  }

  const manifestPath = join(targetDir, '.manifest.json');

  // Check if manifest exists
  if (!existsSync(manifestPath)) {
    // No manifest - check if there are actual skill files (SKILL.md in subdirectories)
    try {
      const entries = readdirSync(targetDir, { withFileTypes: true });
      const skillDirs = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));

      // Check if any subdirectory contains a SKILL.md file
      const hasSkillFiles = skillDirs.some(dir => {
        const skillFile = join(targetDir, dir.name, 'SKILL.md');
        return existsSync(skillFile);
      });

      if (!hasSkillFiles) {
        // Empty directory or no valid skills - not installed
        return null;
      }

      // Has skill files but no manifest
      return {
        installed: true,
        version: null,
        source: 'unknown',
        agent,
        level,
        path: targetDir
      };
    } catch {
      // Error reading directory - assume not installed
      return null;
    }
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    return {
      installed: true,
      version: manifest.version || null,
      source: manifest.source || 'universal-dev-standards',
      agent,
      level,
      path: targetDir,
      installedDate: manifest.installedDate || null
    };
  } catch {
    return {
      installed: true,
      version: null,
      source: 'unknown',
      agent,
      level,
      path: targetDir
    };
  }
}

/**
 * Get installed commands info for an agent
 * @param {string} agent - Agent identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {Object|null} Installed commands info or null
 */
export function getInstalledCommandsForAgent(agent, level = 'project', projectPath = null) {
  const targetDir = getCommandsDirForAgent(agent, level, projectPath);
  if (!targetDir || !existsSync(targetDir)) {
    return null;
  }

  const manifestPath = join(targetDir, '.manifest.json');

  // Count command files (handle both .md and .toml based on agent)
  let commandFiles = [];
  try {
    commandFiles = readdirSync(targetDir)
      .filter(f => {
        // For Gemini CLI, look for .toml files
        if (agent === 'gemini-cli') {
          return f.endsWith('.toml');
        }
        // For other agents, look for .md files (excluding README)
        return f.endsWith('.md') && f !== 'README.md';
      });
  } catch {
    return null;
  }

  if (commandFiles.length === 0) {
    return null;
  }

  // Get command names without extension
  const getCommandName = (filename) => {
    if (filename.endsWith('.toml')) return basename(filename, '.toml');
    return basename(filename, '.md');
  };

  if (!existsSync(manifestPath)) {
    return {
      installed: true,
      count: commandFiles.length,
      commands: commandFiles.map(getCommandName),
      version: null,
      agent,
      level,
      path: targetDir
    };
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    return {
      installed: true,
      count: commandFiles.length,
      commands: manifest.commands || commandFiles.map(getCommandName),
      version: manifest.version || null,
      agent,
      level,
      path: targetDir,
      installedDate: manifest.installedDate || null
    };
  } catch {
    return {
      installed: true,
      count: commandFiles.length,
      commands: commandFiles.map(getCommandName),
      version: null,
      agent,
      level,
      path: targetDir
    };
  }
}

/**
 * Install skills to multiple agents at once
 * @param {Array<{agent: string, level: string}>} installations - Array of installation targets
 * @param {string[]} skillNames - Skills to install (null = all)
 * @param {string} projectPath - Project root path
 * @returns {Object} Combined results
 */
export async function installSkillsToMultipleAgents(installations, skillNames = null, projectPath = null) {
  const results = {
    success: true,
    installations: [],
    totalInstalled: 0,
    totalErrors: 0,
    allFileHashes: {} // New: combined file hashes from all installations
  };

  for (const { agent, level } of installations) {
    const result = await installSkillsForAgent(agent, level, skillNames, projectPath);
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

/**
 * Install commands to multiple agents at once
 * @param {Array<{agent: string, level: string}> | string[]} installations - Array of installation targets
 *        Can be either [{agent, level}] objects or simple agent strings (defaults to 'project' level)
 * @param {string[]} commandNames - Commands to install (null = all)
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {Object} Combined results
 */
export async function installCommandsToMultipleAgents(installations, commandNames = null, projectPath = null) {
  const results = {
    success: true,
    installations: [],
    totalInstalled: 0,
    totalErrors: 0,
    allFileHashes: {} // New: combined file hashes from all installations
  };

  for (const item of installations) {
    // Support both {agent, level} objects and simple agent strings (backward compatibility)
    const agent = typeof item === 'string' ? item : item.agent;
    const level = typeof item === 'string' ? 'project' : (item.level || 'project');

    const config = getAgentConfig(agent);
    if (!config?.commands) continue; // Skip agents that don't support commands

    const result = await installCommandsForAgent(agent, level, commandNames, projectPath);
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
  installSkillsForAgent,
  installCommandsForAgent,
  getInstalledSkillsInfoForAgent,
  getInstalledCommandsForAgent,
  installSkillsToMultipleAgents,
  installCommandsToMultipleAgents,
  getAvailableSkillNames,
  getAvailableCommandNames
};
