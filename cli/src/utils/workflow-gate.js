/**
 * WorkflowGate — Phase Transition Validator
 *
 * Connects WorkflowStateManager to the workflow definitions to validate
 * that prerequisites are met before allowing phase transitions.
 *
 * @version 1.0.0
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { execSync } from 'child_process';
import { WORKFLOW_DEFINITIONS } from '../config/workflow-definitions.js';
import { WorkflowStateManager, WorkflowStatus } from './workflow-state.js';

/**
 * Gate result status
 */
export const GateResult = {
  ALLOWED: 'allowed',
  BLOCKED: 'blocked',
  WARNING: 'warning'
};

/**
 * Enforcement modes
 */
export const EnforcementMode = {
  ENFORCE: 'enforce',
  SUGGEST: 'suggest',
  OFF: 'off'
};

/**
 * WorkflowGate — validates phase transitions for workflows
 */
export class WorkflowGate {
  /**
   * @param {string} projectPath - Project root path
   */
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.enforcementMode = this._loadEnforcementMode();
  }

  /**
   * Load enforcement mode from project config
   * @returns {string} Enforcement mode
   * @private
   */
  _loadEnforcementMode() {
    const configPath = join(this.projectPath, '.uds', 'config.yaml');
    if (!existsSync(configPath)) {
      return EnforcementMode.ENFORCE; // default
    }

    try {
      const content = readFileSync(configPath, 'utf-8');
      const match = content.match(/enforcement_mode:\s*(\w+)/);
      if (match && Object.values(EnforcementMode).includes(match[1])) {
        return match[1];
      }
    } catch {
      // Fall through to default
    }

    return EnforcementMode.ENFORCE;
  }

  /**
   * Check if a phase transition is allowed
   * @param {string} workflowName - Workflow type (sdd, tdd, bdd)
   * @param {string} targetPhase - Target phase to transition to
   * @param {Object} [options] - Additional options
   * @param {string} [options.specFile] - Specific spec file to check
   * @returns {Object} Gate result: { status, checks, message, guidance }
   */
  checkGate(workflowName, targetPhase, options = {}) {
    // If enforcement is off, always allow
    if (this.enforcementMode === EnforcementMode.OFF) {
      return {
        status: GateResult.ALLOWED,
        checks: [],
        message: 'Workflow enforcement is off',
        guidance: null
      };
    }

    const workflow = WORKFLOW_DEFINITIONS[workflowName];
    if (!workflow) {
      return {
        status: GateResult.ALLOWED,
        checks: [],
        message: `Unknown workflow: ${workflowName}`,
        guidance: null
      };
    }

    // Get checks for the target phase
    const phaseChecks = workflow.checks?.[targetPhase] || [];
    const results = [];

    for (const check of phaseChecks) {
      const result = this._executeCheck(check, options);
      results.push(result);
    }

    // Check for existing workflow state (offer resume)
    const resumeInfo = this._checkForResumableState(workflowName);

    // Determine overall result
    const failedChecks = results.filter(r => !r.passed);

    if (failedChecks.length === 0) {
      return {
        status: GateResult.ALLOWED,
        checks: results,
        message: `All prerequisites met for ${workflowName}:${targetPhase}`,
        guidance: null,
        resumeInfo
      };
    }

    // In suggest mode, return warning instead of blocked
    const status = this.enforcementMode === EnforcementMode.SUGGEST
      ? GateResult.WARNING
      : GateResult.BLOCKED;

    const guidance = failedChecks
      .map(c => `- ${c.checkId}: ${c.guidance}`)
      .join('\n');

    return {
      status,
      checks: results,
      message: `Phase ${targetPhase} prerequisites not met`,
      guidance,
      resumeInfo
    };
  }

  /**
   * Execute a single prerequisite check
   * @param {Object} check - Check definition
   * @param {Object} options - Additional options
   * @returns {Object} Check result
   * @private
   */
  _executeCheck(check, options) {
    // If check has a shell command, execute it
    if (check.check) {
      try {
        let cmd = check.check;
        // Replace SPEC-XXX with actual spec file if provided
        if (options.specFile) {
          cmd = cmd.replace('SPEC-XXX.md', basename(options.specFile));
        }

        const output = execSync(cmd, {
          cwd: this.projectPath,
          encoding: 'utf-8',
          timeout: 5000,
          stdio: ['pipe', 'pipe', 'pipe']
        }).trim();

        const passed = check.expectedCondition === 'non_empty'
          ? output.length > 0
          : output === check.expectedCondition;

        return {
          checkId: check.id,
          passed,
          description: check.description,
          guidance: check.guidance,
          output
        };
      } catch {
        // Command failed (e.g., no files found by glob)
        return {
          checkId: check.id,
          passed: false,
          description: check.description,
          guidance: check.guidance,
          output: ''
        };
      }
    }

    // For checks without commands (manual/contextual checks), return as needing manual verification
    return {
      checkId: check.id,
      passed: true, // Cannot verify automatically, assume ok
      description: check.description,
      guidance: check.guidance,
      output: 'manual_check'
    };
  }

  /**
   * Check for existing resumable workflow state
   * @param {string} workflowName - Workflow type
   * @returns {Object|null} Resume info or null
   * @private
   */
  _checkForResumableState(workflowName) {
    const stateManager = new WorkflowStateManager(workflowName, this.projectPath);
    const state = stateManager.load();

    if (!state) return null;

    if (stateManager.canResume()) {
      const summary = stateManager.getSummary();
      return {
        canResume: true,
        workflowName: state.workflowName,
        currentStep: state.currentStepId,
        status: state.status,
        progress: summary?.progress,
        updatedAt: state.updatedAt
      };
    }

    return null;
  }

  /**
   * List all active workflows in the project
   * @returns {Array} List of active workflow summaries
   */
  listActiveWorkflows() {
    const stateDir = join(this.projectPath, '.standards', 'workflow-state');
    if (!existsSync(stateDir)) return [];

    const activeWorkflows = [];

    try {
      const files = readdirSync(stateDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const workflowName = file.replace('.json', '');
        const stateManager = new WorkflowStateManager(workflowName, this.projectPath);
        const state = stateManager.load();

        if (state && [WorkflowStatus.IN_PROGRESS, WorkflowStatus.PAUSED].includes(state.status)) {
          const summary = stateManager.getSummary();
          activeWorkflows.push({
            workflowName: state.workflowName,
            status: state.status,
            currentStep: state.currentStepId,
            progress: summary?.progress,
            updatedAt: state.updatedAt,
            startedAt: state.startedAt
          });
        }
      }
    } catch {
      // Return empty if can't read
    }

    return activeWorkflows;
  }

  /**
   * Get a formatted report of active workflows (for session start)
   * @returns {string|null} Formatted report or null if no active workflows
   */
  getSessionStartReport() {
    const activeWorkflows = this.listActiveWorkflows();

    if (activeWorkflows.length === 0) return null;

    const lines = ['## Active Workflows | 進行中的工作流程', ''];

    for (const wf of activeWorkflows) {
      const progress = wf.progress
        ? `${wf.progress.completed}/${wf.progress.total} steps (${wf.progress.percentage}%)`
        : 'unknown';

      lines.push(`- **${wf.workflowName}** — ${wf.status}`);
      lines.push(`  - Current step: ${wf.currentStep || 'N/A'}`);
      lines.push(`  - Progress: ${progress}`);
      lines.push(`  - Last updated: ${wf.updatedAt}`);
      lines.push('');
    }

    lines.push('> Resume with the corresponding workflow command (e.g., `/sdd implement`)');
    lines.push('> 使用對應的工作流程命令恢復（例如 `/sdd implement`）');

    return lines.join('\n');
  }
}

export default WorkflowGate;
