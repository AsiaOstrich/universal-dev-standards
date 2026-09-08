/**
 * AI Agent Paths Configuration
 *
 * Centralized configuration for all supported AI coding assistants.
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
    tier: 'complete',
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
    tier: 'complete',
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
    tier: 'complete',
    skills: {
      project: '.cursor/skills/',
      user: join(homedir(), '.cursor', 'skills')
    },
    commands: {
      project: '.cursor/commands/',
      user: join(homedir(), '.cursor', 'commands')
    },
    agents: {
      project: '.cursor/agents/',
      user: join(homedir(), '.cursor', 'agents')
    },
    workflows: null, // Not supported
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/',
    supportsSkills: true, // SKILL.md support since v2.4 (Jan 22, 2026)
    supportsTask: false, // No Task tool support
    supportsAgents: true // Can load agents as inline context
  },
  'cline': {
    name: 'Cline',
    tier: 'partial',
    skills: {
      project: '.cline/skills/',
      user: join(homedir(), '.cline', 'skills')
    },
    commands: null, // Uses workflow files
    agents: {
      project: '.cline/agents/',
      user: join(homedir(), '.cline', 'agents')
    },
    workflows: {
      // Official path per docs.cline.bot/features/slash-commands/workflows
      project: '.cline/workflows/',
      user: join(homedir(), '.cline', 'workflows')
    },
    supportsMarketplace: false,
    fallbackSkillsPath: '.claude/skills/',
    supportsSkills: true,
    supportsTask: false,
    supportsAgents: true
  },
  'roo-code': {
    name: 'Roo Code',
    tier: 'complete',
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
    // 🔴 Was '.claude/skills/', with no provenance. Roo Code's docs ENUMERATE where it
    // looks for skills — `.roo/skills/`, `.agents/skills/`, and their `~` twins — and
    // `.claude/skills/` is not among them. An enumerated discovery list that omits a
    // path is a statement, not silence (same shape as the Codex list that this field
    // was falsified against by measurement).
    //
    // ⚠️ Docs only, 2026-09-08: NOT measured, because there is no Roo Code CLI on this
    // machine. Acting on it anyway because the asymmetry is one-sided — wrong here
    // means skills land in `.roo/skills/`, which the docs confirm is read; leaving it
    // meant `uds init` routed Roo Code to Claude's marketplace and installed **zero**
    // skills, which is what it actually did until this change.
    // (roocodeinc.github.io/Roo-Code/features/skills)
    fallbackSkillsPath: null,
    supportsSkills: true,
    supportsTask: true,
    supportsAgents: true
  },
  'codex': {
    name: 'OpenAI Codex',
    tier: 'partial',
    // Verified against the official docs 2026-07-23 (developers.openai.com/codex/skills):
    // Codex discovers skills in $CWD/.agents/skills, parent directories, $REPO_ROOT/.agents/skills
    // and $HOME/.agents/skills. Note the plural `.agents/`.
    //
    // These were previously '.codex/skills/' and '~/.codex/skills', which Codex never reads —
    // a directory UDS invented. Skills installed there were invisible, which is why a
    // behavioural probe against Codex failed while Codex itself was behaving correctly
    // (see integrations/verification/codex/2026-07-23.md).
    skills: {
      project: '.agents/skills/',
      user: join(homedir(), '.agents', 'skills')
    },
    commands: null, // Uses system commands
    // NOT verified. The official skills docs describe `agents/openai.yaml` as a file *inside*
    // a skill directory, not a separate top-level agents location. Left as-is rather than
    // guessed at: an unverified path fails silently, which is the failure mode being fixed above.
    agents: {
      project: '.codex/agents/',
      user: join(homedir(), '.codex', 'agents')
    },
    workflows: null,
    supportsMarketplace: false,
    // 🔴 Was '.claude/skills/'. MEASURED FALSE 2026-09-08 (XSPEC-408 §18.3): two probe
    // arms differing only in install path. At `.agents/skills` Codex reported "Skill
    // descriptions were shortened to fit the 2% skills context budget — Codex can
    // still see every skill", 18,096 input tokens. At `.claude/skills` it said
    // nothing, 15,235. The discovery list documented above never included that
    // directory; this field asserted otherwise with no provenance, and `check.js`
    // printed it to adopters as "Can use fallback".
    fallbackSkillsPath: null,
    supportsSkills: true,
    supportsTask: false,
    supportsAgents: true
  },
  'copilot': {
    name: 'GitHub Copilot',
    tier: 'partial',
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
    tier: 'partial',
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
    tier: 'preview',
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
    supportsSkills: true, // Stable since v0.27.0 (Feb 2026)
    supportsTask: false,
    supportsAgents: true
  },
  'antigravity': {
    name: 'Google Antigravity',
    tier: 'minimal',
    // Skills path CONFIRMED 2026-09-08, three independent ways:
    //   1. The agy 1.0.14 binary carries the literal template
    //      `{workspace}/.agents/skills/{skill_name}/SKILL.md`.
    //   2. The guide shipped with the tool
    //      (~/.gemini/antigravity-cli/builtin/skills/antigravity_guide/references/ide.md)
    //      says `<project-root>/.agents/` holds "project-specific rules, custom skills,
    //      and plugins".
    //   3. A live two-arm run: a skill at `.agents/skills/` was listed back with its
    //      description verbatim; a decoy at `.agent/skills/` was not listed at all.
    //
    // 🔴 BOTH candidates previously recorded here were wrong — the official-plugin path
    // and `.agent/skills/` (singular). Neither had been tested; declining to install was
    // the right call for six months, and the answer came from the tool's own binary, not
    // from either document.
    //
    // 🔴 PRECONDITION the adopter must meet: agy only discovers `.agents/` when the
    // directory is a registered Antigravity project (~/.gemini/projects.json). Measured:
    // the same probe repo returned only the builtin skill before `agy --new-project` and
    // both skills after. Installing here is correct, but a user who never opens the
    // project in Antigravity will see nothing — that is the tool's condition, not ours.
    //
    // No `user` path: the binary has exactly one skills template and it is
    // workspace-scoped. A user-level path would be invented, which is how the two wrong
    // candidates above got written down in the first place.
    skills: {
      project: '.agents/skills/'
    },
    commands: null,
    agents: null,
    workflows: null,
    supportsMarketplace: false,
    fallbackSkillsPath: null,
    supportsSkills: true,
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
 * Get the tier classification for a specific AI agent
 * @param {string} agent - Agent identifier
 * @returns {string} Tier: 'complete', 'partial', 'preview', or 'minimal'
 */
export function getAgentTier(agent) {
  const config = AI_AGENT_PATHS[agent];
  return config?.tier || 'partial';
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
 * Get the on-disk file extension used for an agent's slash commands.
 *
 * The command *name* (`commit`) and the installed *file* (`commit.toml` for
 * Gemini CLI, `commit.md` for everyone else) are not the same string. Any code
 * that maps one to the other must go through here — a hard-coded `.md` strip
 * silently drops every Gemini command on the floor, and because the mismatch
 * produces a well-formed name that simply never matches, nothing errors.
 * (XSPEC-343 R2: 30 of machine-setup's 86 proposed deletions were exactly this.)
 *
 * @param {string} agent - Agent identifier
 * @returns {string} Extension including the leading dot
 */
export function getCommandFileExtension(agent) {
  const config = AI_AGENT_PATHS[agent];
  return config?.commandFormat === 'toml' ? '.toml' : '.md';
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
 * List of all available slash commands (from skills/)
 * Note: Since Claude Code v2.1.3+, Skills and Commands are merged.
 * The `name` field in SKILL.md directly becomes the slash command.
 *
 * This list includes:
 * - 16 commands from Action Skills (SKILL.md files with `name` field)
 * - 12 commands from Commands-only files (no corresponding Skill)
 * Total: 28 available commands
 *
 * Reference-only Skills (no `name` field, not slash commands):
 * testing-guide, project-structure-guide, git-workflow-guide,
 * error-code-guide, logging-guide, ai-collaboration-standards,
 * ai-friendly-architecture, ai-instruction-standards, documentation-guide
 */
export const AVAILABLE_COMMANDS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Core Development Workflow (Action Skills)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'commit', description: 'Generate commit messages following Conventional Commits' },
  { name: 'code-review', description: 'Perform code review with checklist' },
  { name: 'checkin', description: 'Pre-commit quality gates verification' },
  { name: 'release', description: 'Guide release process' },
  { name: 'changelog', description: 'Generate changelog entries' },

  // ═══════════════════════════════════════════════════════════════════════════
  // Testing Methodologies (Action Skills)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'tdd', description: 'Guide TDD workflow (Red-Green-Refactor)' },
  { name: 'bdd', description: 'Guide BDD workflow (Gherkin, Given-When-Then)' },
  { name: 'atdd', description: 'Guide ATDD workflow (acceptance criteria)' },
  { name: 'coverage', description: 'Analyze test coverage (8 dimensions)' },
  { name: 'ac-coverage', description: 'Generate AC traceability matrix and coverage report' },
  { name: 'journey-test', description: 'Generate user journey test plan (TESTPLAN) and E2E skeletons' },

  // ═══════════════════════════════════════════════════════════════════════════
  // Specification and Requirements (Action Skills)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'sdd', description: 'Spec-driven development guide' },
  { name: 'sdd-retro', description: 'Create retroactive specs for untracked commits' },
  { name: 'requirement', description: 'Write requirements following INVEST' },
  { name: 'derive', description: 'Forward derivation (spec to BDD/TDD)' },
  { name: 'reverse', description: 'Reverse engineer code to SDD specs' },
  { name: 'discover', description: 'Assess project health and risks before adding features' },
  { name: 'brainstorm', description: 'Structured AI-assisted ideation and exploration' },

  // ═══════════════════════════════════════════════════════════════════════════
  // Derivation Commands (Commands-only, specific transformations)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'derive-bdd', description: 'Derive BDD Gherkin scenarios from SDD specification' },
  { name: 'derive-tdd', description: 'Derive TDD test skeletons from SDD specification' },
  { name: 'derive-atdd', description: 'Derive ATDD acceptance tests from SDD specification' },
  { name: 'derive-all', description: 'Derive all test structures (BDD, TDD, ATDD) from spec' },

  // ═══════════════════════════════════════════════════════════════════════════
  // Reverse Engineering Commands (Commands-only, specific transformations)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'reverse-sdd', description: 'Reverse engineer code into SDD specification document' },
  { name: 'reverse-bdd', description: 'Transform SDD acceptance criteria to BDD scenarios' },
  { name: 'reverse-tdd', description: 'Analyze BDD-TDD coverage gaps' },

  // ═══════════════════════════════════════════════════════════════════════════
  // Documentation and Code Quality (Action Skills + Commands-only)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'docs', description: 'Manage, guide, and generate documentation' },
  { name: 'docgen', description: 'Generate usage documentation' },
  { name: 'guide', description: 'Access UDS guides and references' },
  { name: 'refactor', description: 'Refactoring and legacy modernization guide' },

  // ═══════════════════════════════════════════════════════════════════════════
  // Development Methodology (Action Skills)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'methodology', description: 'Development methodology selection' },
  { name: 'dev-workflow', description: 'Guide for mapping development phases to UDS commands' },
  { name: 'skill-builder', description: 'Identify repeated processes and build Skills with the right depth' },

  // ═══════════════════════════════════════════════════════════════════════════
  // Operations and Infrastructure (Action Skills)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'security', description: 'Security review and vulnerability assessment' },
  { name: 'scan', description: 'Automated security scanning and dependency audit' },
  { name: 'api-design', description: 'API design following REST, GraphQL, gRPC best practices' },
  { name: 'database', description: 'Database design, migration planning, and query optimization' },
  { name: 'ci-cd', description: 'CI/CD pipeline design, configuration, and optimization' },
  { name: 'incident', description: 'Incident response, root cause analysis, and post-mortem' },
  { name: 'pr', description: 'Pull request creation, review automation, and merge strategy' },
  { name: 'metrics', description: 'Development metrics, code quality indicators, and project health' },
  { name: 'durable', description: 'Workflow fault recovery with checkpoints, retries, and rollback' },
  { name: 'migrate', description: 'Code migration, framework upgrades, and tech modernization' },
  { name: 'audit', description: 'Audit standards compliance and generate reports' },

  // ═══════════════════════════════════════════════════════════════════════════
  // Observability / SRE (Commands-only)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'e2e', description: 'Generate E2E test scaffolding from BDD scenarios' },
  { name: 'observability', description: 'Guide observability instrumentation (logs, metrics, traces)' },
  { name: 'runbook', description: 'Author operational runbooks for incidents and routine procedures' },
  { name: 'slo', description: 'Define SLOs, SLIs, and error budgets' },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLI Management (Commands-only, UDS CLI specific)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: 'init', description: 'Initialize UDS standards in project' },
  { name: 'update', description: 'Update standards to latest version' },
  { name: 'check', description: 'Verify standards adoption status' },
  { name: 'config', description: 'Configure project standards settings' }
];

/**
 * List of all available agents (from skills/agents/)
 */
export const AVAILABLE_AGENTS = [
  { name: 'code-architect', description: 'Software architecture and system design specialist' },
  { name: 'test-specialist', description: 'Testing strategy and test implementation expert' },
  { name: 'reviewer', description: 'Code review and quality assessment specialist' },
  { name: 'doc-writer', description: 'Documentation and technical writing specialist' },
  { name: 'spec-analyst', description: 'Specification analysis and requirement extraction expert' }
];

/**
 * List of all available workflows (from skills/workflows/)
 */
export const AVAILABLE_WORKFLOWS = [
  { name: 'integrated-flow', description: 'Complete ATDD → SDD → BDD → TDD workflow' },
  { name: 'feature-dev', description: 'Feature development workflow' },
  { name: 'code-review', description: 'Code review workflow' }
];

export default AI_AGENT_PATHS;
