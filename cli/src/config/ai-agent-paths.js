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
 * - agents: Paths for agent definitions (if supported)
 * - workflows: Paths for workflow definitions (if supported)
 * - supportsMarketplace: Whether the agent supports a marketplace (Claude Code only)
 * - fallbackSkillsPath: Alternative path the agent can read skills from
 * - supportsSkills: Whether the agent supports SKILL.md format
 * - supportsTask: Whether the agent supports Task tool for subagent execution
 * - supportsAgents: Whether the agent supports AGENT.md format
 */
export const AI_AGENT_PATHS = {
  'claude-code': {
    name: 'Claude Code',
    skills: {
      project: '.claude/skills/',
      user: join(homedir(), '.claude', 'skills')
    },
    // v2.1.3+: Commands and Skills merged, unified to Skills
    // See: "Merged slash commands and skills, simplifying the mental model with no change in behavior."
    commands: null,
    agents: {
      project: '.claude/agents/',
      user: join(homedir(), '.claude', 'agents')
    },
    workflows: {
      project: '.claude/workflows/',
      user: join(homedir(), '.claude', 'workflows')
    },
    supportsMarketplace: true,
    fallbackSkillsPath: null, // Native implementation
    supportsSkills: true,
    supportsTask: true,
    supportsAgents: true
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
    agents: {
      project: '.opencode/agents/',
      user: join(homedir(), '.config', 'opencode', 'agents')
    },
    workflows: {
      project: '.opencode/workflows/',
      user: join(homedir(), '.config', 'opencode', 'workflows')
    },
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/', // Can read Claude skills
    supportsSkills: true,
    supportsTask: true,
    supportsAgents: true
  },
  'cursor': {
    name: 'Cursor',
    skills: {
      project: '.cursor/skills/',
      user: join(homedir(), '.cursor', 'skills')
    },
    commands: null, // Rules only, no SKILL.md support yet
    agents: {
      project: '.cursor/agents/',
      user: join(homedir(), '.cursor', 'agents')
    },
    workflows: null, // Not supported
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/',
    supportsSkills: false, // Uses .mdc rules format
    supportsTask: false, // No Task tool support
    supportsAgents: true // Can load agents as inline context
  },
  'cline': {
    name: 'Cline',
    skills: {
      project: '.clinerules/skills/',
      user: join(homedir(), '.clinerules', 'skills')
    },
    commands: null, // Uses workflow files
    agents: {
      project: '.clinerules/agents/',
      user: join(homedir(), '.clinerules', 'agents')
    },
    workflows: {
      // Official path per docs.cline.bot/features/slash-commands/workflows
      project: '.clinerules/workflows/',
      user: join(homedir(), '.clinerules', 'workflows')
    },
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/',
    supportsSkills: true,
    supportsTask: false,
    supportsAgents: true
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
    agents: {
      project: '.roo/agents/',
      user: join(homedir(), '.roo', 'agents')
    },
    workflows: {
      project: '.roo/workflows/',
      user: join(homedir(), '.roo', 'workflows')
    },
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/',
    supportsSkills: true,
    supportsTask: true,
    supportsAgents: true
  },
  'codex': {
    name: 'OpenAI Codex',
    skills: {
      project: '.codex/skills/',
      user: join(homedir(), '.codex', 'skills')
    },
    commands: null, // Uses system commands
    agents: {
      project: '.codex/agents/',
      user: join(homedir(), '.codex', 'agents')
    },
    workflows: null,
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/',
    supportsSkills: true,
    supportsTask: false,
    supportsAgents: true
  },
  'copilot': {
    name: 'GitHub Copilot',
    skills: {
      project: '.github/skills/',
      user: join(homedir(), '.copilot', 'skills')
    },
    commands: {
      project: '.github/prompts/',
      // Note: Custom prompts only work in VS Code IDE, not CLI or Cloud
      // See: docs.github.com/copilot/get-started/getting-started-with-prompts-for-copilot-chat
      user: null
    },
    agents: {
      project: '.github/agents/',
      user: join(homedir(), '.copilot', 'agents')
    },
    workflows: null,
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/', // Legacy support
    supportsSkills: true,
    supportsTask: false,
    supportsAgents: true
  },
  'windsurf': {
    name: 'Windsurf',
    skills: {
      project: '.windsurf/skills/',
      user: join(homedir(), '.codeium', 'windsurf', 'skills')
    },
    commands: null, // Uses rulebook
    agents: {
      project: '.windsurf/agents/',
      user: join(homedir(), '.codeium', 'windsurf', 'agents')
    },
    workflows: {
      // Official path per docs.windsurf.com/windsurf/cascade/workflows
      project: '.windsurf/rules/',
      user: join(homedir(), '.codeium', 'windsurf', 'rules')
    },
    supportsMarketplace: false,
    fallbackSkillsPath: null,
    supportsSkills: true,
    supportsTask: false,
    supportsAgents: true
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
    agents: {
      project: '.gemini/agents/',
      user: join(homedir(), '.gemini', 'agents')
    },
    workflows: {
      project: '.gemini/workflows/',
      user: join(homedir(), '.gemini', 'workflows')
    },
    // Gemini CLI uses TOML format for commands, not Markdown
    // See: cloud.google.com/blog/topics/developers-practitioners/gemini-cli-custom-slash-commands
    commandFormat: 'toml',
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/',
    supportsSkills: true, // Preview support
    supportsTask: false,
    supportsAgents: true
  },
  'antigravity': {
    name: 'Google Antigravity',
    skills: {
      project: '.antigravity/skills/',
      user: join(homedir(), '.antigravity', 'skills')
    },
    commands: null,
    agents: null,
    workflows: null,
    supportsMarketplace: false,
    fallbackSkillsPath: null,
    supportsSkills: false,
    supportsTask: false,
    supportsAgents: false
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
 * Get agents directory path for an AI tool
 * @param {string} agent - Agent identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {string|null} Agents directory path or null if not supported
 */
export function getAgentsDirForAgent(agent, level = 'project', projectPath = null) {
  const config = AI_AGENT_PATHS[agent];
  if (!config || !config.agents) return null;

  if (level === 'user') {
    return config.agents.user || null;
  } else if (level === 'project' && projectPath) {
    return config.agents.project ? join(projectPath, config.agents.project) : null;
  }
  return null;
}

/**
 * Get workflows directory path for an AI tool
 * @param {string} agent - Agent identifier
 * @param {string} level - 'user' or 'project'
 * @param {string} projectPath - Project root path (required for project level)
 * @returns {string|null} Workflows directory path or null if not supported
 */
export function getWorkflowsDirForAgent(agent, level = 'project', projectPath = null) {
  const config = AI_AGENT_PATHS[agent];
  if (!config || !config.workflows) return null;

  if (level === 'user') {
    return config.workflows.user || null;
  } else if (level === 'project' && projectPath) {
    return config.workflows.project ? join(projectPath, config.workflows.project) : null;
  }
  return null;
}

/**
 * Get all agents that support AGENT.md format
 * @returns {string[]} Array of agent identifiers
 */
export function getAgentsSupportedAgents() {
  return Object.entries(AI_AGENT_PATHS)
    .filter(([, config]) => config.supportsAgents && config.agents)
    .map(([agent]) => agent);
}

/**
 * Get all agents that support Task tool (subagent execution)
 * @returns {string[]} Array of agent identifiers
 */
export function getTaskSupportedAgents() {
  return Object.entries(AI_AGENT_PATHS)
    .filter(([, config]) => config.supportsTask)
    .map(([agent]) => agent);
}

/**
 * Get all agents that support workflow definitions
 * @returns {string[]} Array of agent identifiers
 */
export function getWorkflowsSupportedAgents() {
  return Object.entries(AI_AGENT_PATHS)
    .filter(([, config]) => config.workflows !== null)
    .map(([agent]) => agent);
}

/**
 * Check if an agent supports Task tool (subagent execution)
 * @param {string} agent - Agent identifier
 * @returns {boolean} True if Task tool is supported
 */
export function supportsTask(agent) {
  const config = AI_AGENT_PATHS[agent];
  return config?.supportsTask || false;
}

/**
 * Check if an agent supports AGENT.md format
 * @param {string} agent - Agent identifier
 * @returns {boolean} True if agents are supported
 */
export function supportsAgents(agent) {
  const config = AI_AGENT_PATHS[agent];
  return config?.supportsAgents || false;
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

/**
 * List of all available agents (from skills/claude-code/agents/)
 */
export const AVAILABLE_AGENTS = [
  { name: 'code-architect', description: 'Software architecture and system design specialist' },
  { name: 'test-specialist', description: 'Testing strategy and test implementation expert' },
  { name: 'reviewer', description: 'Code review and quality assessment specialist' },
  { name: 'doc-writer', description: 'Documentation and technical writing specialist' },
  { name: 'spec-analyst', description: 'Specification analysis and requirement extraction expert' }
];

/**
 * List of all available workflows (from skills/claude-code/workflows/)
 */
export const AVAILABLE_WORKFLOWS = [
  { name: 'integrated-flow', description: 'Complete ATDD → SDD → BDD → TDD workflow' },
  { name: 'feature-dev', description: 'Feature development workflow' },
  { name: 'code-review', description: 'Code review workflow' }
];

export default AI_AGENT_PATHS;
