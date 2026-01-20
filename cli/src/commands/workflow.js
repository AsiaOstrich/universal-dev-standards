/**
 * Workflow Command
 *
 * CLI commands for listing and installing UDS workflows.
 *
 * @version 1.0.0
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import {
  getAvailableWorkflowNames,
  getWorkflowContent,
  parseWorkflow,
  installWorkflowsForTool,
  getInstalledWorkflowsForTool
} from '../utils/workflows-installer.js';
import {
  getWorkflowsSupportedAgents,
  getAgentConfig,
  supportsTask
} from '../config/ai-agent-paths.js';
import { setLanguage, isLanguageExplicitlySet } from '../i18n/messages.js';
import { readManifest, isInitialized } from '../utils/copier.js';

/**
 * Workflow list command - list available and installed workflows
 */
export async function workflowListCommand(options) {
  const projectPath = process.cwd();

  // Set UI language based on project's commit_language if initialized
  if (!isLanguageExplicitlySet() && isInitialized(projectPath)) {
    const manifest = readManifest(projectPath);
    if (manifest?.options?.commit_language) {
      const langMap = {
        'traditional-chinese': 'zh-tw',
        'simplified-chinese': 'zh-cn',
        english: 'en',
        bilingual: 'en'
      };
      const uiLang = langMap[manifest.options.commit_language] || 'en';
      setLanguage(uiLang);
    }
  }

  console.log();
  console.log(chalk.bold('🔄 UDS Workflows'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  // List available workflows
  const availableWorkflows = getAvailableWorkflowNames();

  if (availableWorkflows.length === 0) {
    console.log(chalk.yellow('No workflows available.'));
    console.log();
    return;
  }

  console.log(chalk.bold('Available Workflows:'));
  console.log();

  for (const workflowName of availableWorkflows) {
    const content = getWorkflowContent(workflowName);
    const workflow = parseWorkflow(content || '');

    const categoryIcon = getCategoryIcon(workflow.metadata?.category);
    const description = workflow.description
      ? truncateDescription(workflow.description)
      : 'No description';
    const steps = workflow.steps?.length || 0;

    console.log(`  ${categoryIcon} ${chalk.cyan(workflowName)}`);
    console.log(`    ${chalk.gray(description)}`);
    console.log(`    ${chalk.gray(`Steps: ${steps}`)}`);

    if (workflow.metadata?.difficulty) {
      const difficultyColor = getDifficultyColor(workflow.metadata.difficulty);
      console.log(`    ${chalk.gray('Difficulty:')} ${difficultyColor(workflow.metadata.difficulty)}`);
    }
    console.log();
  }

  // Show installation status if --installed flag
  if (options.installed) {
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.bold('Installation Status:'));
    console.log();

    const supportedTools = getWorkflowsSupportedAgents();

    for (const tool of supportedTools) {
      const config = getAgentConfig(tool);

      // Check project level
      const projectInfo = getInstalledWorkflowsForTool(tool, 'project', projectPath);
      // Check user level
      const userInfo = getInstalledWorkflowsForTool(tool, 'user');

      if (projectInfo || userInfo) {
        console.log(`  ${chalk.blue(config.name)}`);

        if (projectInfo) {
          console.log(`    ${chalk.green('✓')} Project: ${projectInfo.count} workflows`);
        }
        if (userInfo) {
          console.log(`    ${chalk.green('✓')} User: ${userInfo.count} workflows`);
        }
        console.log();
      }
    }
  }

  // Show supported AI tools
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.bold('Supported AI Tools:'));
  console.log();

  const supportedTools = getWorkflowsSupportedAgents();

  for (const tool of supportedTools) {
    const config = getAgentConfig(tool);
    const hasTask = supportsTask(tool);
    const icon = hasTask ? chalk.green('●') : chalk.yellow('○');
    const modeNote = hasTask ? 'auto-execute' : 'guided checklist';

    console.log(`  ${icon} ${config.name} ${chalk.gray(`[${modeNote}]`)}`);
  }

  console.log();
  console.log(chalk.gray('Note: Workflows marked ● can auto-execute steps with Task tool'));
  console.log();
}

/**
 * Workflow install command - install workflows for AI tool
 */
export async function workflowInstallCommand(workflowName, options) {
  const projectPath = process.cwd();

  console.log();
  console.log(chalk.bold('🔄 Install UDS Workflows'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  // Determine which workflows to install
  let workflowsToInstall = null; // null = all
  if (workflowName && workflowName !== 'all') {
    const availableWorkflows = getAvailableWorkflowNames();
    if (!availableWorkflows.includes(workflowName)) {
      console.log(chalk.red(`Workflow not found: ${workflowName}`));
      console.log(chalk.gray(`Available workflows: ${availableWorkflows.join(', ')}`));
      console.log();
      return;
    }
    workflowsToInstall = [workflowName];
  }

  // Determine target AI tool
  let targetTool = options.tool || 'claude-code';
  const supportedTools = getWorkflowsSupportedAgents();

  if (!supportedTools.includes(targetTool)) {
    console.log(chalk.red(`AI tool '${targetTool}' does not support workflows.`));
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
          const hasTask = supportsTask(t);
          const mode = hasTask ? 'auto-execute' : 'guided';
          return {
            name: `${config.name} [${mode}]`,
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
          { name: 'Project (.claude/workflows/)', value: 'project' },
          { name: 'User (~/.claude/workflows/)', value: 'user' }
        ],
        default: 'project'
      }
    ]);

    targetTool = answers.tool;
    level = answers.level;
  }

  // Perform installation
  console.log(chalk.gray(`Installing workflows for ${getAgentConfig(targetTool).name}...`));
  console.log();

  const result = await installWorkflowsForTool(
    targetTool,
    level,
    workflowsToInstall,
    level === 'project' ? projectPath : null
  );

  if (result.success) {
    console.log(chalk.green(`✓ Installed ${result.installed.length} workflow(s)`));

    for (const workflow of result.installed) {
      console.log(`  ${chalk.green('✓')} ${workflow}`);
    }

    console.log();
    console.log(chalk.gray(`Location: ${result.targetDir}`));

    // Show execution mode info
    if (supportsTask(targetTool)) {
      console.log();
      console.log(chalk.cyan('Workflows can be auto-executed with Task tool support.'));
    } else {
      console.log();
      console.log(chalk.yellow('Note: This tool will use guided checklist mode.'));
      console.log(chalk.gray('Workflows will be presented as step-by-step guides.'));
    }
  } else {
    console.log(chalk.red('✗ Installation failed'));
    if (result.error) {
      console.log(chalk.red(`  ${result.error}`));
    }
    for (const err of result.errors) {
      console.log(chalk.red(`  ${err.workflow}: ${err.error}`));
    }
  }

  console.log();
}

/**
 * Workflow info command - show details about a workflow
 */
export async function workflowInfoCommand(workflowName, _options) {
  if (!workflowName) {
    console.log(chalk.red('Please specify a workflow name.'));
    console.log(chalk.gray('Usage: uds workflow info <workflow-name>'));
    return;
  }

  const content = getWorkflowContent(workflowName);

  if (!content) {
    console.log(chalk.red(`Workflow not found: ${workflowName}`));
    const available = getAvailableWorkflowNames();
    console.log(chalk.gray(`Available workflows: ${available.join(', ')}`));
    return;
  }

  const workflow = parseWorkflow(content);

  console.log();
  console.log(chalk.bold(`🔄 Workflow: ${workflowName}`));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  console.log(`${chalk.bold('Name:')} ${workflow.name || workflowName}`);
  console.log(`${chalk.bold('Version:')} ${workflow.version || '1.0.0'}`);

  if (workflow.metadata) {
    if (workflow.metadata.category) {
      console.log(`${chalk.bold('Category:')} ${workflow.metadata.category}`);
    }
    if (workflow.metadata.difficulty) {
      const difficultyColor = getDifficultyColor(workflow.metadata.difficulty);
      console.log(`${chalk.bold('Difficulty:')} ${difficultyColor(workflow.metadata.difficulty)}`);
    }
    if (workflow.metadata.estimated_steps) {
      console.log(`${chalk.bold('Estimated Steps:')} ${workflow.metadata.estimated_steps}`);
    }
  }

  if (workflow.description) {
    console.log();
    console.log(chalk.bold('Description:'));
    console.log(chalk.gray(cleanDescription(workflow.description)));
  }

  if (workflow.prerequisites && workflow.prerequisites.length > 0) {
    console.log();
    console.log(chalk.bold('Prerequisites:'));
    for (const prereq of workflow.prerequisites) {
      console.log(`  • ${prereq}`);
    }
  }

  if (workflow.steps && workflow.steps.length > 0) {
    console.log();
    console.log(chalk.bold('Steps:'));
    console.log();

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const typeIcon = getStepTypeIcon(step.type);
      const phaseLabel = step.phase ? chalk.gray(`[${step.phase}]`) : '';

      console.log(`  ${chalk.cyan(`${i + 1}.`)} ${typeIcon} ${step.name} ${phaseLabel}`);

      if (step.agent) {
        console.log(`     ${chalk.gray('Agent:')} ${step.agent}`);
      }
      if (step.description) {
        const desc = cleanDescription(step.description).substring(0, 60);
        console.log(`     ${chalk.gray(desc)}${step.description.length > 60 ? '...' : ''}`);
      }
    }
  }

  if (workflow.outputs && workflow.outputs.length > 0) {
    console.log();
    console.log(chalk.bold('Outputs:'));
    for (const output of workflow.outputs) {
      console.log(`  • ${output.name}: ${output.description || 'No description'}`);
    }
  }

  console.log();
}

/**
 * Get category icon
 * @param {string} category - Workflow category
 * @returns {string} Icon
 */
function getCategoryIcon(category) {
  switch (category) {
    case 'development':
      return chalk.green('⚙');
    case 'review':
      return chalk.yellow('👁');
    case 'testing':
      return chalk.blue('🧪');
    case 'documentation':
      return chalk.magenta('📝');
    default:
      return chalk.gray('○');
  }
}

/**
 * Get step type icon
 * @param {string} type - Step type
 * @returns {string} Icon
 */
function getStepTypeIcon(type) {
  switch (type) {
    case 'agent':
      return chalk.green('●');
    case 'manual':
      return chalk.yellow('○');
    case 'conditional':
      return chalk.blue('◇');
    default:
      return chalk.gray('○');
  }
}

/**
 * Get difficulty color function
 * @param {string} difficulty - Difficulty level
 * @returns {Function} Chalk color function
 */
function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case 'beginner':
      return chalk.green;
    case 'intermediate':
      return chalk.yellow;
    case 'advanced':
      return chalk.red;
    default:
      return chalk.gray;
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
  workflowListCommand,
  workflowInstallCommand,
  workflowInfoCommand
};
