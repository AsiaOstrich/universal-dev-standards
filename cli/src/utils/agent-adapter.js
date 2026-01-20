/**
 * Agent Adapter
 *
 * Provides cross-tool adaptation for AGENT.md definitions.
 * Adapts agents for different execution modes based on AI tool capabilities.
 *
 * @version 1.0.0
 */

import { supportsTask, supportsAgents, getAgentConfig } from '../config/ai-agent-paths.js';

/**
 * Execution modes for agents
 */
export const ExecutionMode = {
  TASK: 'task',         // Use Task tool to spawn independent subagent (Claude Code, OpenCode)
  INLINE: 'inline',     // Inject agent content as context prefix (Cursor, Windsurf, etc.)
  MANUAL: 'manual'      // Generate manual instructions (unsupported tools)
};

/**
 * Determine the execution mode for an agent on a specific AI tool
 * @param {string} aiTool - AI tool identifier
 * @returns {string} Execution mode
 */
export function getExecutionMode(aiTool) {
  if (supportsTask(aiTool)) {
    return ExecutionMode.TASK;
  }
  if (supportsAgents(aiTool)) {
    return ExecutionMode.INLINE;
  }
  return ExecutionMode.MANUAL;
}

/**
 * Adapt agent configuration for a specific AI tool
 * @param {Object} agentConfig - Parsed agent configuration
 * @param {string} aiTool - Target AI tool identifier
 * @returns {Object} Adapted configuration
 */
export function adaptAgentForTool(agentConfig, aiTool) {
  const mode = getExecutionMode(aiTool);

  switch (mode) {
    case ExecutionMode.TASK:
      return adaptForTaskMode(agentConfig, aiTool);
    case ExecutionMode.INLINE:
      return adaptForInlineMode(agentConfig, aiTool);
    case ExecutionMode.MANUAL:
      return adaptForManualMode(agentConfig, aiTool);
    default:
      return { mode: ExecutionMode.MANUAL, error: `Unknown mode for ${aiTool}` };
  }
}

/**
 * Adapt agent for Task tool execution mode
 * @param {Object} agentConfig - Agent configuration
 * @param {string} aiTool - AI tool identifier
 * @returns {Object} Task mode configuration
 */
function adaptForTaskMode(agentConfig, aiTool) {
  const taskConfig = {
    subagent_type: agentConfig.name || 'general-purpose',
    description: truncateDescription(agentConfig.description),
    model: agentConfig.model || 'sonnet',
  };

  // Map allowed/disallowed tools to Task tool format
  if (agentConfig['allowed-tools']) {
    taskConfig.allowedTools = parseToolList(agentConfig['allowed-tools']);
  }
  if (agentConfig['disallowed-tools']) {
    taskConfig.disallowedTools = parseToolList(agentConfig['disallowed-tools']);
  }

  // Add skill dependencies as context
  if (agentConfig.skills && agentConfig.skills.length > 0) {
    taskConfig.skillDependencies = agentConfig.skills;
  }

  return {
    mode: ExecutionMode.TASK,
    aiTool,
    taskConfig,
    triggers: agentConfig.triggers || {}
  };
}

/**
 * Adapt agent for inline context injection mode
 * @param {Object} agentConfig - Agent configuration
 * @param {string} aiTool - AI tool identifier
 * @returns {Object} Inline mode configuration
 */
function adaptForInlineMode(agentConfig, aiTool) {
  // Generate context prefix for tools that don't support Task tool
  const contextPrefix = generateInlineContextPrefix(agentConfig);

  return {
    mode: ExecutionMode.INLINE,
    aiTool,
    contextPrefix,
    triggers: agentConfig.triggers || {},
    note: 'This tool does not support subagent execution. Agent will be injected as context.'
  };
}

/**
 * Adapt agent for manual instruction mode
 * @param {Object} agentConfig - Agent configuration
 * @param {string} aiTool - AI tool identifier
 * @returns {Object} Manual mode configuration
 */
function adaptForManualMode(agentConfig, aiTool) {
  const instructions = generateManualInstructions(agentConfig);

  return {
    mode: ExecutionMode.MANUAL,
    aiTool,
    instructions,
    note: 'This tool does not support agents. Use these instructions manually.'
  };
}

/**
 * Generate inline context prefix for injection mode
 * @param {Object} agentConfig - Agent configuration
 * @returns {string} Context prefix
 */
function generateInlineContextPrefix(agentConfig) {
  const lines = [
    `<!-- UDS Agent: ${agentConfig.name} -->`,
    `<!-- Role: ${agentConfig.role || 'specialist'} -->`,
    ''
  ];

  if (agentConfig.expertise && agentConfig.expertise.length > 0) {
    lines.push(`## Agent Expertise: ${agentConfig.expertise.join(', ')}`);
    lines.push('');
  }

  if (agentConfig.description) {
    lines.push('## Agent Purpose');
    lines.push(cleanDescription(agentConfig.description));
    lines.push('');
  }

  // Add tool permission hints
  if (agentConfig['allowed-tools']) {
    const tools = parseToolList(agentConfig['allowed-tools']);
    lines.push(`## Allowed Operations: ${tools.join(', ')}`);
  }
  if (agentConfig['disallowed-tools']) {
    const tools = parseToolList(agentConfig['disallowed-tools']);
    lines.push(`## Restricted Operations: ${tools.join(', ')}`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate manual instructions for unsupported tools
 * @param {Object} agentConfig - Agent configuration
 * @returns {string} Manual instructions
 */
function generateManualInstructions(agentConfig) {
  const lines = [
    `# ${agentConfig.name} Agent Instructions`,
    '',
    '## How to Use This Agent Manually',
    '',
    '1. Copy the agent content below into your AI assistant\'s context',
    '2. Provide your task after the agent instructions',
    '3. The AI will act according to the agent\'s role and expertise',
    '',
    '## Agent Information',
    '',
    `- **Name**: ${agentConfig.name}`,
    `- **Role**: ${agentConfig.role || 'specialist'}`,
  ];

  if (agentConfig.expertise) {
    lines.push(`- **Expertise**: ${agentConfig.expertise.join(', ')}`);
  }

  if (agentConfig.description) {
    lines.push('');
    lines.push('## Purpose');
    lines.push(cleanDescription(agentConfig.description));
  }

  if (agentConfig.triggers && agentConfig.triggers.keywords) {
    lines.push('');
    lines.push('## Trigger Keywords');
    lines.push(`Use this agent when: ${agentConfig.triggers.keywords.join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Parse tool list from various formats
 * @param {string|string[]} tools - Tool list
 * @returns {string[]} Normalized tool list
 */
function parseToolList(tools) {
  if (Array.isArray(tools)) {
    return tools;
  }
  if (typeof tools === 'string') {
    // Handle comma-separated or bracket-enclosed format
    return tools
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }
  return [];
}

/**
 * Truncate description for Task tool (short description)
 * @param {string} description - Full description
 * @returns {string} Truncated description (max 50 chars)
 */
function truncateDescription(description) {
  if (!description) return 'UDS Agent';
  const cleaned = cleanDescription(description);
  const firstLine = cleaned.split('\n')[0].trim();
  if (firstLine.length <= 50) return firstLine;
  return firstLine.substring(0, 47) + '...';
}

/**
 * Clean description text
 * @param {string} description - Description text
 * @returns {string} Cleaned description
 */
function cleanDescription(description) {
  if (!description) return '';
  return description
    .replace(/^\|?\s*/, '')  // Remove leading pipe and spaces (YAML multiline)
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();
}

/**
 * Get all supported AI tools and their execution modes
 * @returns {Object[]} Array of tool info objects
 */
export function getAllToolsWithModes() {
  const tools = [
    'claude-code', 'opencode', 'cursor', 'cline',
    'roo-code', 'codex', 'copilot', 'windsurf', 'gemini-cli'
  ];

  return tools.map(tool => {
    const config = getAgentConfig(tool);
    return {
      id: tool,
      name: config?.name || tool,
      mode: getExecutionMode(tool),
      supportsTask: supportsTask(tool),
      supportsAgents: supportsAgents(tool)
    };
  });
}

/**
 * Check if an agent is compatible with a specific AI tool
 * @param {Object} agentConfig - Agent configuration
 * @param {string} aiTool - AI tool identifier
 * @returns {Object} Compatibility info
 */
export function checkAgentToolCompatibility(agentConfig, aiTool) {
  const mode = getExecutionMode(aiTool);

  const result = {
    compatible: true,
    mode,
    warnings: [],
    features: {
      taskExecution: mode === ExecutionMode.TASK,
      toolPermissions: mode === ExecutionMode.TASK,
      skillDependencies: mode === ExecutionMode.TASK,
      triggers: true
    }
  };

  // Check tool permissions compatibility
  if (agentConfig['allowed-tools'] && mode !== ExecutionMode.TASK) {
    result.warnings.push('Tool permissions will be ignored (inline/manual mode)');
  }

  // Check model preference compatibility
  if (agentConfig.model && mode !== ExecutionMode.TASK) {
    result.warnings.push('Model preference will be ignored (inline/manual mode)');
  }

  // Check skill dependencies
  if (agentConfig.skills && agentConfig.skills.length > 0 && mode !== ExecutionMode.TASK) {
    result.warnings.push('Skill dependencies require manual loading (inline/manual mode)');
  }

  return result;
}

export default {
  ExecutionMode,
  getExecutionMode,
  adaptAgentForTool,
  getAllToolsWithModes,
  checkAgentToolCompatibility
};
