/**
 * AI Agent Paths Configuration
 *
 * Centralized configuration for all supported AI coding assistants.
 * Based on docs/AI-AGENT-ROADMAP.md specifications.
 *
 * @version 1.0.0
 */

import { join } from 'path';
import { homedir } from 'os';

/**
 * AI Agent path configurations
 *
 * Each agent configuration includes:
 * - name: Display name for the AI agent
 * - skills: Paths for skills installation (project and user level)
 * - commands: Paths for slash commands (if supported)
 * - supportsMarketplace: Whether the agent supports a marketplace (Claude Code only)
 * - fallbackSkillsPath: Alternative path the agent can read skills from
 * - supportsSkills: Whether the agent supports SKILL.md format
 */
export const AI_AGENT_PATHS = {
  'claude-code': {
    name: 'Claude Code',
    skills: {
      project: '.claude/skills/',
      user: join(homedir(), '.claude', 'skills')
    },
    commands: null, // Built-in, no file-based commands
    supportsMarketplace: true,
    fallbackSkillsPath: null, // Native implementation
    supportsSkills: true
  },
  'opencode': {
    name: 'OpenCode',
    skills: {
      project: '.opencode/skill/',
      user: join(homedir(), '.config', 'opencode', 'skill')
    },
    commands: {
      project: '.opencode/command/',
      user: join(homedir(), '.config', 'opencode', 'command')
    },
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/', // Can read Claude skills
    supportsSkills: true
  },
  'cursor': {
    name: 'Cursor',
    skills: {
      project: '.cursor/skills/',
      user: join(homedir(), '.cursor', 'skills')
    },
    commands: null, // Rules only, no SKILL.md support yet
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/',
    supportsSkills: false // Uses .mdc rules format
  },
  'cline': {
    name: 'Cline',
    skills: {
      project: '.cline/skills/',
      user: join(homedir(), '.cline', 'skills')
    },
    commands: null, // Uses workflow files
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/',
    supportsSkills: true
  },
  'roo-code': {
    name: 'Roo Code',
    skills: {
      project: '.roo/skills/',
      user: join(homedir(), '.roo', 'skills')
    },
    commands: {
      project: '.roo/commands/',
      user: join(homedir(), '.roo', 'commands')
    },
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/',
    supportsSkills: true
  },
  'codex': {
    name: 'OpenAI Codex',
    skills: {
      project: '.codex/skills/',
      user: join(homedir(), '.codex', 'skills')
    },
    commands: null, // Uses system commands
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/',
    supportsSkills: true
  },
  'copilot': {
    name: 'GitHub Copilot',
    skills: {
      project: '.github/skills/',
      user: join(homedir(), '.copilot', 'skills')
    },
    commands: {
      project: '.github/prompts/',
      user: join(homedir(), '.copilot', 'prompts')
    },
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/', // Legacy support
    supportsSkills: true
  },
  'windsurf': {
    name: 'Windsurf',
    skills: {
      project: '.windsurf/skills/',
      user: join(homedir(), '.codeium', 'windsurf', 'skills')
    },
    commands: null, // Uses rulebook
    supportsMarketplace: false,
    fallbackSkillsPath: null,
    supportsSkills: true
  },
  'gemini-cli': {
    name: 'Gemini CLI',
    skills: {
      project: '.gemini/skills/',
      user: join(homedir(), '.gemini', 'skills')
    },
    commands: {
      project: '.gemini/commands/',
      user: join(homedir(), '.gemini', 'commands')
    },
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/',
    supportsSkills: true // Preview support
  },
  'antigravity': {
    name: 'Google Antigravity',
    skills: {
      project: '.antigravity/skills/',
      user: join(homedir(), '.antigravity', 'skills')
    },
    commands: null,
    supportsMarketplace: false,
    fallbackSkillsPath: null,
    supportsSkills: false
  }
};

/**
 * Get the configuration for a specific AI agent
 * @param {string} agent - Agent identifier (e.g., 'claude-code', 'opencode')
 * @returns {Object|null} Agent configuration or null if not found
 */
export function getAgentConfig(agent) {
  return AI_AGENT_PATHS[agent] || null;
}

/**
 * Get skills directory path for an agent
 * @param {string} agent - Agent identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {string|null} Skills directory path or null if not supported
 */
export function getSkillsDirForAgent(agent, level = 'user', projectPath = null) {
  const config = AI_AGENT_PATHS[agent];
  if (!config || !config.skills) return null;

  if (level === 'user') {
    return config.skills.user;
  } else if (level === 'project' && projectPath) {
    return join(projectPath, config.skills.project);
  }
  return null;
}

/**
 * Get commands directory path for an agent
 * @param {string} agent - Agent identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {string|null} Commands directory path or null if not supported
 */
export function getCommandsDirForAgent(agent, level = 'project', projectPath = null) {
  const config = AI_AGENT_PATHS[agent];
  if (!config || !config.commands) return null;

  if (level === 'user') {
    return config.commands.user || null;
  } else if (level === 'project' && projectPath) {
    return config.commands.project ? join(projectPath, config.commands.project) : null;
  }
  return null;
}

/**
 * Get all agents that support skills installation
 * @returns {string[]} Array of agent identifiers
 */
export function getSkillsSupportedAgents() {
  return Object.entries(AI_AGENT_PATHS)
    .filter(([, config]) => config.supportsSkills && config.skills)
    .map(([agent]) => agent);
}

/**
 * Get all agents that support slash commands
 * @returns {string[]} Array of agent identifiers
 */
export function getCommandsSupportedAgents() {
  return Object.entries(AI_AGENT_PATHS)
    .filter(([, config]) => config.commands !== null)
    .map(([agent]) => agent);
}

/**
 * Check if an agent supports marketplace installation
 * @param {string} agent - Agent identifier
 * @returns {boolean} True if marketplace is supported
 */
export function supportsMarketplace(agent) {
  const config = AI_AGENT_PATHS[agent];
  return config?.supportsMarketplace || false;
}

/**
 * Get the fallback skills path for an agent
 * @param {string} agent - Agent identifier
 * @returns {string|null} Fallback path or null
 */
export function getFallbackSkillsPath(agent) {
  const config = AI_AGENT_PATHS[agent];
  return config?.fallbackSkillsPath || null;
}

/**
 * Get display name for an agent
 * @param {string} agent - Agent identifier
 * @returns {string} Display name or the agent identifier if not found
 */
export function getAgentDisplayName(agent) {
  const config = AI_AGENT_PATHS[agent];
  return config?.name || agent;
}

/**
 * List of all available slash commands (from skills/claude-code/commands/)
 */
export const AVAILABLE_COMMANDS = [
  { name: 'commit', description: 'Generate commit messages following Conventional Commits' },
  { name: 'review', description: 'Perform code review with checklist' },
  { name: 'tdd', description: 'Guide TDD workflow (Red-Green-Refactor)' },
  { name: 'bdd', description: 'Guide BDD workflow' },
  { name: 'coverage', description: 'Analyze test coverage' },
  { name: 'requirement', description: 'Write requirements following INVEST' },
  { name: 'check', description: 'Check-in verification' },
  { name: 'release', description: 'Guide release process' },
  { name: 'changelog', description: 'Generate changelog entries' },
  { name: 'docs', description: 'Generate documentation' },
  { name: 'spec', description: 'Spec-driven development guide' },
  { name: 'methodology', description: 'Development methodology selection' },
  { name: 'config', description: 'Project structure configuration' },
  { name: 'init', description: 'Initialize standards' },
  { name: 'update', description: 'Update standards' }
];

export default AI_AGENT_PATHS;
