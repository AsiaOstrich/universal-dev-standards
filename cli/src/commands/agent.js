/**
 * Agent Command
 *
 * CLI commands for listing and installing UDS agents.
 *
 * @version 1.0.0
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import {
  getAvailableAgentNames,
  getAgentContent,
  parseAgentFrontmatter,
  installAgentsForTool,
  getInstalledAgentsForTool
} from '../utils/agents-installer.js';
import {
  getExecutionMode,
  ExecutionMode,
  getAllToolsWithModes
} from '../utils/agent-adapter.js';
import {
  getAgentsSupportedAgents,
  getAgentConfig
} from '../config/ai-agent-paths.js';
import { setLanguage, isLanguageExplicitlySet } from '../i18n/messages.js';
import { readManifest, isInitialized } from '../utils/copier.js';

/**
 * Agent list command - list available and installed agents
 */
export async function agentListCommand(options) {
  const projectPath = process.cwd();

  // Set UI language based on project's display_language if initialized
  if (!isLanguageExplicitlySet() && isInitialized(projectPath)) {
    const manifest = readManifest(projectPath);
    if (manifest?.options?.display_language) {
      const uiLang = manifest.options.display_language;
      setLanguage(uiLang);
    }
  }

  console.log();
  console.log(chalk.bold('📦 UDS Agents'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  // List available agents
  const availableAgents = getAvailableAgentNames();

  if (availableAgents.length === 0) {
    console.log(chalk.yellow('No agents available.'));
    console.log();
    return;
  }

  console.log(chalk.bold('Available Agents:'));
  console.log();

  for (const agentName of availableAgents) {
    const content = getAgentContent(agentName);
    const frontmatter = parseAgentFrontmatter(content || '');

    const roleIcon = getRoleIcon(frontmatter.role);
    const description = frontmatter.description
      ? truncateDescription(frontmatter.description)
      : 'No description';

    console.log(`  ${roleIcon} ${chalk.cyan(agentName)}`);
    console.log(`    ${chalk.gray(description)}`);

    if (frontmatter.expertise) {
      const expertise = Array.isArray(frontmatter.expertise)
        ? frontmatter.expertise
        : [frontmatter.expertise];
      console.log(`    ${chalk.gray('Expertise:')} ${expertise.join(', ')}`);
    }
    console.log();
  }

  // Show installation status if --installed flag
  if (options.installed) {
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.bold('Installation Status:'));
    console.log();

    const supportedTools = getAgentsSupportedAgents();

    for (const tool of supportedTools) {
      const config = getAgentConfig(tool);
      const mode = getExecutionMode(tool);
      const modeLabel = getModeLabel(mode);

      // Check project level
      const projectInfo = getInstalledAgentsForTool(tool, 'project', projectPath);
      // Check user level
      const userInfo = getInstalledAgentsForTool(tool, 'user');

      if (projectInfo || userInfo) {
        console.log(`  ${chalk.blue(config.name)} ${chalk.gray(`[${modeLabel}]`)}`);

        if (projectInfo) {
          console.log(`    ${chalk.green('✓')} Project: ${projectInfo.count} agents`);
        }
        if (userInfo) {
          console.log(`    ${chalk.green('✓')} User: ${userInfo.count} agents`);
        }
        console.log();
      }
    }
  }

  // Show supported AI tools
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.bold('Supported AI Tools:'));
  console.log();

  const toolsWithModes = getAllToolsWithModes();

  for (const tool of toolsWithModes) {
    if (!tool.supportsAgents) continue;

    const modeLabel = getModeLabel(tool.mode);
    const icon = tool.supportsTask ? chalk.green('●') : chalk.yellow('○');

    console.log(`  ${icon} ${tool.name} ${chalk.gray(`[${modeLabel}]`)}`);
  }

  console.log();
  console.log(chalk.gray('Legend:'));
  console.log(`  ${chalk.green('●')} Full Task tool support (subagent execution)`);
  console.log(`  ${chalk.yellow('○')} Inline mode (context injection)`);
  console.log();
}

/**
 * Agent install command - install agents for AI tool
 */
export async function agentInstallCommand(agentName, options) {
  const projectPath = process.cwd();

  console.log();
  console.log(chalk.bold('📦 Install UDS Agents'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  // Determine which agents to install
  let agentsToInstall = null; // null = all
  if (agentName && agentName !== 'all') {
    const availableAgents = getAvailableAgentNames();
    if (!availableAgents.includes(agentName)) {
      console.log(chalk.red(`Agent not found: ${agentName}`));
      console.log(chalk.gray(`Available agents: ${availableAgents.join(', ')}`));
      console.log();
      return;
    }
    agentsToInstall = [agentName];
  }

  // Determine target AI tool
  let targetTool = options.tool || 'claude-code';
  const supportedTools = getAgentsSupportedAgents();

  if (!supportedTools.includes(targetTool)) {
    console.log(chalk.red(`AI tool '${targetTool}' does not support agents.`));
    console.log(chalk.gray(`Supported tools: ${supportedTools.join(', ')}`));
    console.log();
    return;
  }

  // Determine installation level
  let level = options.global ? 'user' : 'project';

  // Interactive mode if no options specified
  if (!options.yes && !options.tool && !options.global) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'tool',
        message: 'Select AI tool:',
        choices: supportedTools.map(t => {
          const config = getAgentConfig(t);
          const mode = getExecutionMode(t);
          return {
            name: `${config.name} [${getModeLabel(mode)}]`,
            value: t
          };
        }),
        default: 'claude-code'
      },
      {
        type: 'list',
        name: 'level',
        message: 'Installation level:',
        choices: [
          { name: 'Project (.claude/agents/)', value: 'project' },
          { name: 'User (~/.claude/agents/)', value: 'user' }
        ],
        default: 'project'
      }
    ]);

    targetTool = answers.tool;
    level = answers.level;
  }

  // Perform installation
  console.log(chalk.gray(`Installing agents for ${getAgentConfig(targetTool).name}...`));
  console.log();

  const result = await installAgentsForTool(
    targetTool,
    level,
    agentsToInstall,
    level === 'project' ? projectPath : null
  );

  if (result.success) {
    console.log(chalk.green(`✓ Installed ${result.installed.length} agent(s)`));

    for (const agent of result.installed) {
      console.log(`  ${chalk.green('✓')} ${agent}`);
    }

    console.log();
    console.log(chalk.gray(`Location: ${result.targetDir}`));

    // Show execution mode info
    const mode = getExecutionMode(targetTool);
    if (mode === ExecutionMode.TASK) {
      console.log();
      console.log(chalk.cyan('Agents will be executed as subagents using Task tool.'));
    } else if (mode === ExecutionMode.INLINE) {
      console.log();
      console.log(chalk.yellow('Note: This tool uses inline mode (context injection).'));
      console.log(chalk.gray('Agents will be loaded as context, not as independent subagents.'));
    }
  } else {
    console.log(chalk.red('✗ Installation failed'));
    if (result.error) {
      console.log(chalk.red(`  ${result.error}`));
    }
    for (const err of result.errors) {
      console.log(chalk.red(`  ${err.agent}: ${err.error}`));
    }
  }

  console.log();
}

/**
 * Agent info command - show details about an agent
 */
export async function agentInfoCommand(agentName, _options) {
  if (!agentName) {
    console.log(chalk.red('Please specify an agent name.'));
    console.log(chalk.gray('Usage: uds agent info <agent-name>'));
    return;
  }

  const content = getAgentContent(agentName);

  if (!content) {
    console.log(chalk.red(`Agent not found: ${agentName}`));
    const available = getAvailableAgentNames();
    console.log(chalk.gray(`Available agents: ${available.join(', ')}`));
    return;
  }

  const frontmatter = parseAgentFrontmatter(content);

  console.log();
  console.log(chalk.bold(`📦 Agent: ${agentName}`));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  console.log(`${chalk.bold('Name:')} ${frontmatter.name || agentName}`);
  console.log(`${chalk.bold('Role:')} ${frontmatter.role || 'specialist'}`);
  console.log(`${chalk.bold('Version:')} ${frontmatter.version || '1.0.0'}`);

  if (frontmatter.description) {
    console.log();
    console.log(chalk.bold('Description:'));
    console.log(chalk.gray(cleanDescription(frontmatter.description)));
  }

  if (frontmatter.expertise) {
    console.log();
    console.log(chalk.bold('Expertise:'));
    const expertise = Array.isArray(frontmatter.expertise)
      ? frontmatter.expertise
      : [frontmatter.expertise];
    for (const exp of expertise) {
      console.log(`  • ${exp}`);
    }
  }

  if (frontmatter['allowed-tools']) {
    console.log();
    console.log(chalk.bold('Allowed Tools:'));
    const tools = Array.isArray(frontmatter['allowed-tools'])
      ? frontmatter['allowed-tools']
      : [frontmatter['allowed-tools']];
    for (const tool of tools) {
      console.log(`  ${chalk.green('✓')} ${tool}`);
    }
  }

  if (frontmatter['disallowed-tools']) {
    console.log();
    console.log(chalk.bold('Disallowed Tools:'));
    const tools = Array.isArray(frontmatter['disallowed-tools'])
      ? frontmatter['disallowed-tools']
      : [frontmatter['disallowed-tools']];
    for (const tool of tools) {
      console.log(`  ${chalk.red('✗')} ${tool}`);
    }
  }

  if (frontmatter.skills) {
    console.log();
    console.log(chalk.bold('Skill Dependencies:'));
    const skills = Array.isArray(frontmatter.skills)
      ? frontmatter.skills
      : [frontmatter.skills];
    for (const skill of skills) {
      console.log(`  • ${skill}`);
    }
  }

  if (frontmatter.triggers) {
    console.log();
    console.log(chalk.bold('Triggers:'));
    if (frontmatter.triggers.keywords) {
      console.log(`  Keywords: ${frontmatter.triggers.keywords.join(', ')}`);
    }
    if (frontmatter.triggers.commands) {
      console.log(`  Commands: ${frontmatter.triggers.commands.join(', ')}`);
    }
  }

  console.log();
}

/**
 * Get role icon
 * @param {string} role - Agent role
 * @returns {string} Icon
 */
function getRoleIcon(role) {
  switch (role) {
    case 'orchestrator':
      return chalk.magenta('◆');
    case 'reviewer':
      return chalk.yellow('◇');
    case 'specialist':
    default:
      return chalk.blue('●');
  }
}

/**
 * Get mode label
 * @param {string} mode - Execution mode
 * @returns {string} Label
 */
function getModeLabel(mode) {
  switch (mode) {
    case ExecutionMode.TASK:
      return 'task';
    case ExecutionMode.INLINE:
      return 'inline';
    case ExecutionMode.MANUAL:
      return 'manual';
    default:
      return mode;
  }
}

/**
 * Truncate description for display
 * @param {string} description - Full description
 * @returns {string} Truncated description
 */
function truncateDescription(description) {
  const cleaned = cleanDescription(description);
  const firstLine = cleaned.split('\n')[0].trim();
  if (firstLine.length <= 60) return firstLine;
  return firstLine.substring(0, 57) + '...';
}

/**
 * Clean description text
 * @param {string} description - Description text
 * @returns {string} Cleaned description
 */
function cleanDescription(description) {
  if (!description) return '';
  return description
    .replace(/^\|?\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default {
  agentListCommand,
  agentInstallCommand,
  agentInfoCommand
};
