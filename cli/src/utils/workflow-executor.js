/**
 * Workflow Executor
 *
 * Core execution engine for UDS workflows.
 * Handles step execution, context passing, and progress tracking.
 *
 * @version 1.0.0
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { WorkflowStateManager, StepStatus, WorkflowStatus } from './workflow-state.js';
import {
  getWorkflowContent,
  parseWorkflow,
  validateWorkflow
} from './workflows-installer.js';
import {
  getExecutionMode,
  adaptAgentForTool,
  ExecutionMode
} from './agent-adapter.js';
import { supportsTask, getAgentConfig } from '../config/ai-agent-paths.js';

/**
 * Error recovery action enumeration
 */
export const RecoveryAction = {
  RETRY: 'retry',
  SKIP: 'skip',
  PAUSE: 'pause',
  ABORT: 'abort'
};

/**
 * WorkflowExecutor
 *
 * Executes workflow definitions step by step.
 */
export class WorkflowExecutor {
  /**
   * Create a WorkflowExecutor instance
   * @param {Object} options - Executor options
   * @param {string} options.aiTool - Target AI tool (default: 'claude-code')
   * @param {string} options.projectPath - Project root path
   * @param {boolean} options.verbose - Enable verbose output
   * @param {boolean} options.dryRun - Show steps without executing
   * @param {boolean} options.interactive - Enable interactive prompts (default: true)
   */
  constructor(options = {}) {
    this.aiTool = options.aiTool || 'claude-code';
    this.projectPath = options.projectPath || process.cwd();
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.interactive = options.interactive !== false;
    this.stateManager = null;
    this.workflow = null;
    this.stepOrder = [];
  }

  /**
   * Execute a workflow by name
   * @param {string} workflowName - Name of the workflow to execute
   * @param {Object} options - Execution options
   * @param {Object} options.initialContext - Initial context values
   * @param {boolean} options.restart - Force restart from beginning
   * @returns {Object} Execution result
   */
  async execute(workflowName, options = {}) {
    // Load workflow definition
    const content = getWorkflowContent(workflowName);
    if (!content) {
      return {
        success: false,
        error: `Workflow not found: ${workflowName}`,
        workflowName
      };
    }

    this.workflow = parseWorkflow(content);

    // Validate workflow
    const validation = validateWorkflow(this.workflow);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid workflow: ${validation.errors.join(', ')}`,
        workflowName,
        validationErrors: validation.errors
      };
    }

    // Build step order
    this.stepOrder = this.workflow.steps.map(step => step.id);

    // Initialize or load state
    this.stateManager = new WorkflowStateManager(workflowName, this.projectPath);

    const existingState = this.stateManager.load();

    if (existingState && !options.restart) {
      // Check if can resume
      if (this.stateManager.canResume()) {
        if (this.interactive) {
          const { action } = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'Previous execution found. What would you like to do?',
            choices: [
              { name: 'Resume from where it stopped', value: 'resume' },
              { name: 'Start fresh (discard previous state)', value: 'restart' }
            ]
          }]);

          if (action === 'restart') {
            this.stateManager.clear();
            this.stateManager.initialize(this.workflow);
          }
        }
      } else {
        // Previous state exists but completed or failed - ask to restart
        this.stateManager.clear();
        this.stateManager.initialize(this.workflow);
      }
    } else {
      this.stateManager.initialize(this.workflow);
    }

    // Display workflow info
    this.displayWorkflowHeader();

    // Check dry-run mode - don't persist state for dry-run
    if (this.dryRun) {
      return this.displayDryRunPlan();
    }

    // Set metadata (only when actually executing)
    this.stateManager.setMetadata('aiTool', this.aiTool);

    // Apply initial context if provided
    if (options.initialContext) {
      for (const [key, value] of Object.entries(options.initialContext)) {
        this.stateManager.setContext(key, value);
      }
      this.stateManager.save();
    }

    // Execute steps
    return await this.executeSteps();
  }

  /**
   * Resume a paused workflow
   * @param {string} workflowName - Name of the workflow to resume
   * @returns {Object} Execution result
   */
  async resume(workflowName) {
    // Load workflow definition
    const content = getWorkflowContent(workflowName);
    if (!content) {
      return {
        success: false,
        error: `Workflow not found: ${workflowName}`,
        workflowName
      };
    }

    this.workflow = parseWorkflow(content);
    this.stepOrder = this.workflow.steps.map(step => step.id);

    // Load existing state
    this.stateManager = new WorkflowStateManager(workflowName, this.projectPath);
    const existingState = this.stateManager.load();

    if (!existingState) {
      return {
        success: false,
        error: 'No saved state found for this workflow',
        workflowName
      };
    }

    if (!this.stateManager.canResume()) {
      return {
        success: false,
        error: 'Workflow cannot be resumed (already completed or not started)',
        workflowName,
        status: existingState.status
      };
    }

    console.log();
    console.log(chalk.cyan(`Resuming workflow: ${workflowName}`));

    const summary = this.stateManager.getSummary();
    console.log(chalk.gray(`Progress: ${summary.progress.completed}/${summary.progress.total} steps completed`));
    console.log();

    return await this.executeSteps();
  }

  /**
   * Execute remaining steps
   * @returns {Object} Execution result
   */
  async executeSteps() {
    this.stateManager.setWorkflowStatus(WorkflowStatus.IN_PROGRESS);

    for (const stepId of this.stepOrder) {
      const stepStatus = this.stateManager.getStepStatus(stepId);

      // Skip completed or skipped steps
      if (stepStatus === StepStatus.COMPLETED || stepStatus === StepStatus.SKIPPED) {
        if (this.verbose) {
          console.log(chalk.gray(`  Skipping step ${stepId} (${stepStatus})`));
        }
        continue;
      }

      // Find step definition
      const step = this.workflow.steps.find(s => s.id === stepId);
      if (!step) {
        console.log(chalk.red(`  Step definition not found: ${stepId}`));
        continue;
      }

      // Execute the step
      const result = await this.executeStep(step);

      if (!result.success) {
        // Handle step failure
        const action = await this.handleStepFailure(step, result);

        switch (action) {
          case RecoveryAction.RETRY: {
            // Re-execute the step
            const retryResult = await this.executeStep(step);
            if (!retryResult.success) {
              this.stateManager.setStepStatus(stepId, StepStatus.FAILED, null, retryResult.error);
              this.stateManager.setWorkflowStatus(WorkflowStatus.FAILED);
              return {
                success: false,
                error: `Step ${stepId} failed after retry: ${retryResult.error}`,
                workflowName: this.workflow.name,
                failedStep: stepId
              };
            }
            break;
          }

          case RecoveryAction.SKIP:
            this.stateManager.setStepStatus(stepId, StepStatus.SKIPPED);
            console.log(chalk.yellow(`  Skipped step: ${step.name}`));
            continue;

          case RecoveryAction.PAUSE:
            this.stateManager.setWorkflowStatus(WorkflowStatus.PAUSED);
            return {
              success: false,
              paused: true,
              error: `Workflow paused at step: ${stepId}`,
              workflowName: this.workflow.name,
              pausedAt: stepId
            };

          case RecoveryAction.ABORT:
          default:
            this.stateManager.setStepStatus(stepId, StepStatus.FAILED, null, result.error);
            this.stateManager.setWorkflowStatus(WorkflowStatus.FAILED);
            return {
              success: false,
              error: `Workflow aborted at step ${stepId}: ${result.error}`,
              workflowName: this.workflow.name,
              failedStep: stepId
            };
        }
      }
    }

    // All steps completed
    this.stateManager.setWorkflowStatus(WorkflowStatus.COMPLETED);

    const summary = this.stateManager.getSummary();
    this.displayCompletionSummary(summary);

    // Clear state file on successful completion
    this.stateManager.clear();

    return {
      success: true,
      workflowName: this.workflow.name,
      summary
    };
  }

  /**
   * Execute a single step
   * @param {Object} step - Step definition
   * @returns {Object} Step execution result
   */
  async executeStep(step) {
    const context = this.stateManager.getContext();

    this.displayStepHeader(step);
    this.stateManager.setStepStatus(step.id, StepStatus.IN_PROGRESS);

    try {
      let result;

      switch (step.type) {
        case 'agent':
          result = await this.executeAgentStep(step, context);
          break;
        case 'manual':
          result = await this.executeManualStep(step, context);
          break;
        case 'conditional':
          result = await this.executeConditionalStep(step, context);
          break;
        default:
          result = {
            success: false,
            error: `Unknown step type: ${step.type}`
          };
      }

      if (result.success) {
        this.stateManager.setStepStatus(step.id, StepStatus.COMPLETED, result.outputs);
        this.displayStepSuccess(step);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  }

  /**
   * Execute an agent step
   * @param {Object} step - Step definition
   * @param {Object} context - Current execution context
   * @returns {Object} Execution result
   */
  async executeAgentStep(step, context) {
    const executionMode = getExecutionMode(this.aiTool);

    console.log(chalk.gray(`  Agent: ${step.agent}`));
    console.log(chalk.gray(`  Execution mode: ${executionMode}`));

    // Resolve inputs from context
    const inputs = this.resolveInputs(step.inputs, context);

    if (this.verbose && Object.keys(inputs).length > 0) {
      console.log(chalk.gray(`  Inputs: ${Object.keys(inputs).join(', ')}`));
    }

    switch (executionMode) {
      case ExecutionMode.TASK:
        return await this.executeAgentWithTask(step, inputs, context);

      case ExecutionMode.INLINE:
        return await this.executeAgentInline(step, inputs, context);

      case ExecutionMode.MANUAL:
      default:
        return await this.executeAgentManual(step, inputs, context);
    }
  }

  /**
   * Execute agent step using Task tool (Claude Code, OpenCode)
   * @param {Object} step - Step definition
   * @param {Object} inputs - Resolved inputs
   * @param {Object} context - Current context
   * @returns {Object} Execution result
   */
  async executeAgentWithTask(step, _inputs, _context) {
    // Build agent configuration for Task tool
    const agentConfig = {
      name: step.agent,
      description: step.description,
      role: 'workflow-step'
    };

    const adapted = adaptAgentForTool(agentConfig, this.aiTool);

    // For Task mode, we provide instructions for the AI to spawn a subagent
    console.log();
    console.log(chalk.cyan('  📋 Agent Task Instructions:'));
    console.log(chalk.gray('  ─'.repeat(25)));
    console.log();
    console.log(chalk.white(`  Use the Task tool to spawn a ${step.agent} agent:`));
    console.log();
    console.log(chalk.yellow(`  subagent_type: "${adapted.taskConfig.subagent_type}"`));
    console.log(chalk.yellow(`  description: "${adapted.taskConfig.description}"`));
    console.log();

    if (step.description) {
      console.log(chalk.white('  Step description:'));
      const descLines = step.description.trim().split('\n');
      for (const line of descLines) {
        console.log(chalk.gray(`    ${line.trim()}`));
      }
      console.log();
    }

    // Show expected outputs
    if (step.outputs && step.outputs.length > 0) {
      console.log(chalk.white('  Expected outputs:'));
      for (const output of step.outputs) {
        console.log(chalk.gray(`    - ${output}`));
      }
      console.log();
    }

    // Interactive confirmation
    if (this.interactive) {
      const { completed, outputs } = await this.promptAgentCompletion(step);
      return {
        success: completed,
        outputs: outputs || {},
        mode: ExecutionMode.TASK
      };
    }

    return { success: true, outputs: {}, mode: ExecutionMode.TASK };
  }

  /**
   * Execute agent step in inline mode (Cursor, etc.)
   * @param {Object} step - Step definition
   * @param {Object} inputs - Resolved inputs
   * @param {Object} context - Current context
   * @returns {Object} Execution result
   */
  async executeAgentInline(step, _inputs, _context) {
    const agentConfig = {
      name: step.agent,
      description: step.description,
      role: 'workflow-step'
    };

    const adapted = adaptAgentForTool(agentConfig, this.aiTool);

    console.log();
    console.log(chalk.cyan('  📋 Agent Context (copy to AI):'));
    console.log(chalk.gray('  ─'.repeat(25)));
    console.log();
    console.log(adapted.contextPrefix);

    if (step.description) {
      console.log(chalk.white('  Task:'));
      const descLines = step.description.trim().split('\n');
      for (const line of descLines) {
        console.log(chalk.gray(`    ${line.trim()}`));
      }
      console.log();
    }

    if (this.interactive) {
      const { completed, outputs } = await this.promptAgentCompletion(step);
      return {
        success: completed,
        outputs: outputs || {},
        mode: ExecutionMode.INLINE
      };
    }

    return { success: true, outputs: {}, mode: ExecutionMode.INLINE };
  }

  /**
   * Execute agent step in manual mode
   * @param {Object} step - Step definition
   * @param {Object} inputs - Resolved inputs
   * @param {Object} context - Current context
   * @returns {Object} Execution result
   */
  async executeAgentManual(step, _inputs, _context) {
    console.log();
    console.log(chalk.cyan('  📋 Manual Agent Instructions:'));
    console.log(chalk.gray('  ─'.repeat(25)));
    console.log();

    console.log(chalk.white(`  Agent: ${step.agent}`));
    console.log();

    if (step.description) {
      console.log(chalk.white('  Instructions:'));
      const descLines = step.description.trim().split('\n');
      for (const line of descLines) {
        console.log(chalk.gray(`    ${line.trim()}`));
      }
      console.log();
    }

    if (step.checklist && step.checklist.length > 0) {
      console.log(chalk.white('  Checklist:'));
      for (const item of step.checklist) {
        console.log(chalk.gray(`    ☐ ${item}`));
      }
      console.log();
    }

    if (this.interactive) {
      const { completed, outputs } = await this.promptAgentCompletion(step);
      return {
        success: completed,
        outputs: outputs || {},
        mode: ExecutionMode.MANUAL
      };
    }

    return { success: true, outputs: {}, mode: ExecutionMode.MANUAL };
  }

  /**
   * Execute a manual step
   * @param {Object} step - Step definition
   * @param {Object} context - Current execution context
   * @returns {Object} Execution result
   */
  async executeManualStep(step, _context) {
    console.log();

    // Show instructions
    if (step.instructions) {
      console.log(chalk.white('  Instructions:'));
      const lines = step.instructions.trim().split('\n');
      for (const line of lines) {
        console.log(chalk.gray(`    ${line.trim()}`));
      }
      console.log();
    }

    // Show checklist
    if (step.checklist && step.checklist.length > 0) {
      console.log(chalk.white('  Checklist:'));
      for (const item of step.checklist) {
        console.log(chalk.gray(`    ☐ ${item}`));
      }
      console.log();
    }

    // Interactive confirmation
    if (this.interactive) {
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Have you completed this step?',
        default: true
      }]);

      if (!confirm) {
        const { action } = await inquirer.prompt([{
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'Mark as complete anyway', value: 'complete' },
            { name: 'Skip this step', value: 'skip' },
            { name: 'Pause workflow', value: 'pause' }
          ]
        }]);

        if (action === 'skip') {
          return { success: true, skipped: true, outputs: {} };
        } else if (action === 'pause') {
          return { success: false, error: 'User paused workflow' };
        }
      }
    }

    return { success: true, outputs: {} };
  }

  /**
   * Execute a conditional step
   * @param {Object} step - Step definition
   * @param {Object} context - Current execution context
   * @returns {Object} Execution result
   */
  async executeConditionalStep(step, context) {
    console.log();
    console.log(chalk.white('  Evaluating condition...'));

    // Simple condition evaluation based on context
    if (step.condition) {
      const conditionMet = this.evaluateCondition(step.condition, context);

      if (conditionMet) {
        console.log(chalk.green(`  Condition met: ${step.condition}`));
        if (step.then_branch) {
          return { success: true, outputs: { next_branch: 'then' } };
        }
      } else {
        console.log(chalk.yellow(`  Condition not met: ${step.condition}`));
        if (step.else_branch) {
          return { success: true, outputs: { next_branch: 'else' } };
        }
      }
    }

    // If interactive, ask user to choose
    if (this.interactive && step.decisions) {
      console.log(chalk.white('  Available decisions:'));

      const choices = Object.entries(step.decisions).map(([key, value]) => ({
        name: `${key}: ${value.condition || 'No condition'}`,
        value: key
      }));

      const { decision } = await inquirer.prompt([{
        type: 'list',
        name: 'decision',
        message: 'Select decision:',
        choices
      }]);

      return { success: true, outputs: { decision } };
    }

    return { success: true, outputs: {} };
  }

  /**
   * Evaluate a condition expression
   * @param {string} condition - Condition string
   * @param {Object} context - Current context
   * @returns {boolean} Condition result
   */
  evaluateCondition(condition, context) {
    // Simple condition evaluation
    // Supports: "key exists", "key == value", "key != value"

    if (condition.includes(' exists')) {
      const key = condition.replace(' exists', '').trim();
      return context[key] !== undefined;
    }

    if (condition.includes('==')) {
      const [key, value] = condition.split('==').map(s => s.trim());
      return String(context[key]) === value;
    }

    if (condition.includes('!=')) {
      const [key, value] = condition.split('!=').map(s => s.trim());
      return String(context[key]) !== value;
    }

    // Check if key is truthy
    return Boolean(context[condition.trim()]);
  }

  /**
   * Resolve inputs from context
   * @param {Array} inputs - Input definitions
   * @param {Object} context - Current context
   * @returns {Object} Resolved inputs
   */
  resolveInputs(inputs, context) {
    if (!inputs || !Array.isArray(inputs)) {
      return {};
    }

    const resolved = {};
    for (const input of inputs) {
      if (typeof input === 'string') {
        resolved[input] = context[input] || null;
      } else if (typeof input === 'object' && input.name) {
        resolved[input.name] = context[input.name] || input.default || null;
      }
    }
    return resolved;
  }

  /**
   * Handle step failure with recovery options
   * @param {Object} step - Failed step
   * @param {Object} result - Failure result
   * @returns {string} Recovery action
   */
  async handleStepFailure(step, result) {
    console.log();
    console.log(chalk.red(`  ✗ Step failed: ${result.error}`));
    console.log();

    if (!this.interactive) {
      return RecoveryAction.ABORT;
    }

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'How would you like to proceed?',
      choices: [
        { name: 'Retry this step', value: RecoveryAction.RETRY },
        { name: 'Skip and continue', value: RecoveryAction.SKIP },
        { name: 'Pause (resume later)', value: RecoveryAction.PAUSE },
        { name: 'Abort workflow', value: RecoveryAction.ABORT }
      ]
    }]);

    return action;
  }

  /**
   * Prompt for agent step completion
   * @param {Object} step - Step definition
   * @returns {Object} Completion info
   */
  async promptAgentCompletion(step) {
    const { completed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'completed',
      message: 'Has the agent completed this task?',
      default: true
    }]);

    if (!completed) {
      return { completed: false, outputs: null };
    }

    // Optionally collect outputs
    const outputs = {};

    if (step.outputs && step.outputs.length > 0) {
      const { collectOutputs } = await inquirer.prompt([{
        type: 'confirm',
        name: 'collectOutputs',
        message: 'Would you like to record any outputs?',
        default: false
      }]);

      if (collectOutputs) {
        for (const output of step.outputs) {
          const { value } = await inquirer.prompt([{
            type: 'input',
            name: 'value',
            message: `Enter value for "${output}" (or leave empty):`,
            default: ''
          }]);

          if (value) {
            outputs[output] = value;
          }
        }
      }
    }

    return { completed: true, outputs };
  }

  /**
   * Display workflow header
   */
  displayWorkflowHeader() {
    console.log();
    console.log(chalk.bold(`🔄 Executing Workflow: ${this.workflow.name}`));
    console.log(chalk.gray('─'.repeat(50)));

    if (this.workflow.description) {
      const desc = this.workflow.description.trim().split('\n')[0];
      console.log(chalk.gray(desc));
    }

    console.log();
    console.log(chalk.gray(`AI Tool: ${getAgentConfig(this.aiTool)?.name || this.aiTool}`));
    console.log(chalk.gray(`Steps: ${this.workflow.steps?.length || 0}`));
    console.log(chalk.gray(`Mode: ${supportsTask(this.aiTool) ? 'Auto-execute' : 'Guided'}`));
    console.log();
  }

  /**
   * Display step header
   * @param {Object} step - Step definition
   */
  displayStepHeader(step) {
    const stepIndex = this.stepOrder.indexOf(step.id) + 1;
    const total = this.stepOrder.length;
    const typeIcon = this.getStepTypeIcon(step.type);

    console.log(chalk.gray('─'.repeat(50)));
    console.log();
    console.log(chalk.cyan(`${typeIcon} Step ${stepIndex}/${total}: ${step.name}`));

    if (step.phase) {
      console.log(chalk.gray(`  Phase: ${step.phase}`));
    }
  }

  /**
   * Display step success
   * @param {Object} step - Step definition
   */
  displayStepSuccess(step) {
    console.log();
    console.log(chalk.green(`  ✓ ${step.name} completed`));
    console.log();
  }

  /**
   * Display dry-run plan
   * @returns {Object} Dry-run result
   */
  displayDryRunPlan() {
    console.log(chalk.yellow('DRY RUN - No steps will be executed'));
    console.log();
    console.log(chalk.bold('Execution Plan:'));
    console.log();

    for (let i = 0; i < this.workflow.steps.length; i++) {
      const step = this.workflow.steps[i];
      const icon = this.getStepTypeIcon(step.type);

      console.log(`  ${i + 1}. ${icon} ${step.name}`);
      console.log(chalk.gray(`     Type: ${step.type}`));

      if (step.agent) {
        console.log(chalk.gray(`     Agent: ${step.agent}`));
      }

      if (step.inputs && step.inputs.length > 0) {
        console.log(chalk.gray(`     Inputs: ${step.inputs.join(', ')}`));
      }

      if (step.outputs && step.outputs.length > 0) {
        console.log(chalk.gray(`     Outputs: ${step.outputs.join(', ')}`));
      }

      console.log();
    }

    return {
      success: true,
      dryRun: true,
      workflowName: this.workflow.name,
      steps: this.workflow.steps.map(s => ({
        id: s.id,
        name: s.name,
        type: s.type
      }))
    };
  }

  /**
   * Display completion summary
   * @param {Object} summary - Workflow summary
   */
  displayCompletionSummary(summary) {
    console.log(chalk.gray('─'.repeat(50)));
    console.log();
    console.log(chalk.green.bold('✓ Workflow completed successfully!'));
    console.log();
    console.log(chalk.gray(`  Completed: ${summary.progress.completed}/${summary.progress.total} steps`));

    if (summary.progress.skipped > 0) {
      console.log(chalk.gray(`  Skipped: ${summary.progress.skipped} steps`));
    }

    console.log();
  }

  /**
   * Get icon for step type
   * @param {string} type - Step type
   * @returns {string} Icon
   */
  getStepTypeIcon(type) {
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
}

export default WorkflowExecutor;
