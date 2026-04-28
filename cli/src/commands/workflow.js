/**
 * Workflow Command
 *
 * CLI commands for listing and installing UDS workflows.
 *
 * @version 1.0.0
 * @deprecated XSPEC-095 (2026-04-28): This command is superseded by `devap workflow`.
 *   The orchestration logic has been extracted to DevAP:
 *   - Core module: dev-autopilot/packages/core/src/workflow-state/ + core/src/flow/
 *   - CLI command: dev-autopilot/packages/cli/src/commands/workflow.ts
 *
 *   棄用理由：UDS 專注於活動定義，DevAP 承擔流程編排（XSPEC-086 / DEC-049）。
 *   UDS 5.x 仍維持本命令可用（向後相容），UDS 6.0.0 將移除。
 *   建議遷移：`uds workflow ...` → `devap workflow list/execute/status`
 */

import chalk from 'chalk';
import { select } from '@inquirer/prompts';
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
import { WorkflowExecutor } from '../utils/workflow-executor.js';
import { WorkflowStateManager } from '../utils/workflow-state.js';

/**
 * Workflow list command - list available and installed workflows
 */
export async function workflowListCommand(options) {
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
    const selectedTool = await select({
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
    });

    const selectedLevel = await select({
      message: 'Installation level:',
      choices: [
        { name: 'Project (.claude/workflows/)', value: 'project' },
        { name: 'User (~/.claude/workflows/)', value: 'user' }
      ],
      default: 'project'
    });

    targetTool = selectedTool;
    level = selectedLevel;
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

/**
 * Workflow execute command - execute a workflow step by step
 * @param {string} workflowName - Name of the workflow to execute
 * @param {Object} options - Command options
 */
export async function workflowExecuteCommand(workflowName, options) {
  const projectPath = process.cwd();

  // Set UI language based on project's display_language if initialized
  if (!isLanguageExplicitlySet() && isInitialized(projectPath)) {
    const manifest = readManifest(projectPath);
    if (manifest?.options?.display_language) {
      const uiLang = manifest.options.display_language;
      setLanguage(uiLang);
    }
  }

  // Validate workflow name
  if (!workflowName) {
    console.log(chalk.red('Please specify a workflow name.'));
    console.log(chalk.gray('Usage: uds workflow execute <workflow-name>'));
    console.log();

    const available = getAvailableWorkflowNames();
    if (available.length > 0) {
      console.log(chalk.gray('Available workflows:'));
      for (const name of available) {
        console.log(chalk.gray(`  - ${name}`));
      }
    }
    return;
  }

  // Check if workflow exists
  const content = getWorkflowContent(workflowName);
  if (!content) {
    console.log(chalk.red(`Workflow not found: ${workflowName}`));
    const available = getAvailableWorkflowNames();
    console.log(chalk.gray(`Available workflows: ${available.join(', ')}`));
    return;
  }

  // Determine target AI tool
  let targetTool = options.tool || 'claude-code';
  const supportedTools = getWorkflowsSupportedAgents();

  if (!supportedTools.includes(targetTool)) {
    console.log(chalk.red(`AI tool '${targetTool}' does not support workflows.`));
    console.log(chalk.gray(`Supported tools: ${supportedTools.join(', ')}`));
    return;
  }

  // Check for resume mode
  if (options.resume) {
    const stateManager = new WorkflowStateManager(workflowName, projectPath);
    if (!stateManager.exists()) {
      console.log(chalk.yellow('No saved state found for this workflow.'));
      console.log(chalk.gray('Starting fresh execution...'));
      console.log();
      options.resume = false;
    } else if (!stateManager.canResume()) {
      console.log(chalk.yellow('Workflow state exists but cannot be resumed.'));
      console.log(chalk.gray('Starting fresh execution...'));
      console.log();
      options.resume = false;
    }
  }

  // Create executor
  const executor = new WorkflowExecutor({
    aiTool: targetTool,
    projectPath,
    verbose: options.verbose || false,
    dryRun: options.dryRun || false,
    interactive: !options.yes
  });

  // Execute or resume
  let result;
  if (options.resume) {
    result = await executor.resume(workflowName);
  } else {
    result = await executor.execute(workflowName, {
      restart: options.restart || false
    });
  }

  // Handle result
  if (!result.success) {
    if (result.paused) {
      console.log();
      console.log(chalk.yellow('Workflow paused.'));
      console.log(chalk.gray('Run with --resume to continue from where you left off:'));
      console.log(chalk.gray(`  uds workflow execute ${workflowName} --resume`));
    } else {
      console.log();
      console.log(chalk.red(`Workflow execution failed: ${result.error}`));

      if (result.failedStep) {
        console.log(chalk.gray(`Failed at step: ${result.failedStep}`));
      }
    }
    return;
  }

  // Success
  if (result.dryRun) {
    console.log();
    console.log(chalk.cyan('Dry run complete. No changes were made.'));
    console.log(chalk.gray('Remove --dry-run to execute the workflow.'));
  }

  console.log();
}

/**
 * Workflow status command - show current execution status
 * @param {string} workflowName - Name of the workflow
 * @param {Object} options - Command options
 */
export async function workflowStatusCommand(workflowName, _options) {
  const projectPath = process.cwd();

  if (!workflowName) {
    // List all workflows with saved state
    console.log();
    console.log(chalk.bold('📊 Workflow Execution Status'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log();

    const available = getAvailableWorkflowNames();
    let foundAny = false;

    for (const name of available) {
      const stateManager = new WorkflowStateManager(name, projectPath);
      if (stateManager.exists()) {
        stateManager.load();
        const summary = stateManager.getSummary();

        if (summary) {
          foundAny = true;
          const statusIcon = getStatusIcon(summary.status);
          console.log(`  ${statusIcon} ${chalk.cyan(name)}`);
          console.log(`    Status: ${summary.status}`);
          console.log(`    Progress: ${summary.progress.completed}/${summary.progress.total} steps`);

          if (summary.currentStepId) {
            console.log(`    Current: ${summary.currentStepId}`);
          }

          console.log();
        }
      }
    }

    if (!foundAny) {
      console.log(chalk.gray('No workflows currently in progress.'));
      console.log();
    }

    return;
  }

  // Show status for specific workflow
  const stateManager = new WorkflowStateManager(workflowName, projectPath);

  if (!stateManager.exists()) {
    console.log(chalk.yellow(`No execution state found for workflow: ${workflowName}`));
    return;
  }

  stateManager.load();
  const summary = stateManager.getSummary();
  const state = stateManager.getState();

  console.log();
  console.log(chalk.bold(`📊 Workflow Status: ${workflowName}`));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  console.log(`Status: ${getStatusIcon(summary.status)} ${summary.status}`);
  console.log(`Progress: ${summary.progress.completed}/${summary.progress.total} steps (${summary.progress.percentage}%)`);

  if (summary.startedAt) {
    console.log(`Started: ${summary.startedAt}`);
  }

  if (summary.completedAt) {
    console.log(`Completed: ${summary.completedAt}`);
  }

  console.log();
  console.log(chalk.bold('Steps:'));
  console.log();

  for (const [stepId, stepState] of Object.entries(state.steps)) {
    const statusIcon = getStepStatusIcon(stepState.status);
    console.log(`  ${statusIcon} ${stepId}: ${stepState.status}`);

    if (stepState.error) {
      console.log(chalk.red(`    Error: ${stepState.error}`));
    }
  }

  console.log();

  if (stateManager.canResume()) {
    console.log(chalk.cyan('To resume: uds workflow execute ' + workflowName + ' --resume'));
    console.log();
  }
}

/**
 * Get status icon for workflow status
 * @param {string} status - Workflow status
 * @returns {string} Icon
 */
function getStatusIcon(status) {
  switch (status) {
    case 'completed':
      return chalk.green('✓');
    case 'in_progress':
      return chalk.yellow('◐');
    case 'paused':
      return chalk.blue('⏸');
    case 'failed':
      return chalk.red('✗');
    default:
      return chalk.gray('○');
  }
}

/**
 * Get status icon for step status
 * @param {string} status - Step status
 * @returns {string} Icon
 */
function getStepStatusIcon(status) {
  switch (status) {
    case 'completed':
      return chalk.green('✓');
    case 'in_progress':
      return chalk.yellow('◐');
    case 'pending':
      return chalk.gray('○');
    case 'failed':
      return chalk.red('✗');
    case 'skipped':
      return chalk.gray('⊘');
    default:
      return chalk.gray('○');
  }
}

export default {
  workflowListCommand,
  workflowInstallCommand,
  workflowInfoCommand,
  workflowExecuteCommand,
  workflowStatusCommand
};
