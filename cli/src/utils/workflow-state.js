/**
 * Workflow State Manager
 *
 * Manages persistent state for workflow execution.
 * Enables pause/resume functionality and tracks step progress.
 *
 * @version 1.0.0
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

/**
 * Step status enumeration
 */
export const StepStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
};

/**
 * Workflow execution status enumeration
 */
export const WorkflowStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * WorkflowStateManager
 *
 * Manages workflow execution state persistence.
 */
export class WorkflowStateManager {
  /**
   * Create a WorkflowStateManager instance
   * @param {string} workflowName - Name of the workflow
   * @param {string} projectPath - Project root path
   */
  constructor(workflowName, projectPath) {
    this.workflowName = workflowName;
    this.projectPath = projectPath;
    this.stateDir = join(projectPath, '.standards', 'workflow-state');
    this.statePath = join(this.stateDir, `${workflowName}.json`);
    this.state = null;
  }

  /**
   * Initialize state for a new workflow execution
   * @param {Object} workflow - Parsed workflow definition
   * @returns {Object} Initial state
   */
  initialize(workflow) {
    const steps = {};

    if (workflow.steps && Array.isArray(workflow.steps)) {
      for (const step of workflow.steps) {
        steps[step.id] = {
          status: StepStatus.PENDING,
          startedAt: null,
          completedAt: null,
          outputs: {},
          error: null
        };
      }
    }

    this.state = {
      workflowName: this.workflowName,
      workflowVersion: workflow.version || '1.0.0',
      status: WorkflowStatus.NOT_STARTED,
      startedAt: null,
      updatedAt: new Date().toISOString(),
      completedAt: null,
      currentStepId: null,
      steps,
      context: {}, // Accumulated context from step outputs
      metadata: {
        aiTool: null,
        projectPath: this.projectPath
      }
    };

    return this.state;
  }

  /**
   * Load existing state from file
   * @returns {Object|null} Loaded state or null if not exists
   */
  load() {
    if (!existsSync(this.statePath)) {
      return null;
    }

    try {
      const content = readFileSync(this.statePath, 'utf-8');
      this.state = JSON.parse(content);
      return this.state;
    } catch {
      return null;
    }
  }

  /**
   * Save current state to file
   * @returns {boolean} Success status
   */
  save() {
    if (!this.state) {
      return false;
    }

    try {
      // Ensure directory exists
      if (!existsSync(this.stateDir)) {
        mkdirSync(this.stateDir, { recursive: true });
      }

      this.state.updatedAt = new Date().toISOString();
      writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear state file (after completion or manual reset)
   * @returns {boolean} Success status
   */
  clear() {
    try {
      if (existsSync(this.statePath)) {
        unlinkSync(this.statePath);
      }
      this.state = null;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if state exists (can resume)
   * @returns {boolean} True if resumable state exists
   */
  exists() {
    return existsSync(this.statePath);
  }

  /**
   * Check if workflow can be resumed
   * @returns {boolean} True if workflow can be resumed
   */
  canResume() {
    if (!this.state) {
      this.load();
    }

    if (!this.state) {
      return false;
    }

    // Can resume if in progress or paused
    return [WorkflowStatus.IN_PROGRESS, WorkflowStatus.PAUSED].includes(this.state.status);
  }

  /**
   * Get the resume point (next pending or in_progress step)
   * @returns {string|null} Step ID to resume from
   */
  getResumePoint() {
    if (!this.state || !this.state.steps) {
      return null;
    }

    // First, check if there's a step in progress
    for (const [stepId, stepState] of Object.entries(this.state.steps)) {
      if (stepState.status === StepStatus.IN_PROGRESS) {
        return stepId;
      }
    }

    // Otherwise, find first pending step
    for (const [stepId, stepState] of Object.entries(this.state.steps)) {
      if (stepState.status === StepStatus.PENDING) {
        return stepId;
      }
    }

    return null;
  }

  /**
   * Get status of a specific step
   * @param {string} stepId - Step identifier
   * @returns {string|null} Step status or null if not found
   */
  getStepStatus(stepId) {
    if (!this.state || !this.state.steps || !this.state.steps[stepId]) {
      return null;
    }
    return this.state.steps[stepId].status;
  }

  /**
   * Set status of a specific step
   * @param {string} stepId - Step identifier
   * @param {string} status - New status
   * @param {Object} outputs - Step outputs (optional)
   * @param {string} error - Error message (optional)
   * @returns {boolean} Success status
   */
  setStepStatus(stepId, status, outputs = null, error = null) {
    if (!this.state || !this.state.steps || !this.state.steps[stepId]) {
      return false;
    }

    const stepState = this.state.steps[stepId];
    stepState.status = status;

    if (status === StepStatus.IN_PROGRESS) {
      stepState.startedAt = new Date().toISOString();
      this.state.currentStepId = stepId;
    }

    if (status === StepStatus.COMPLETED || status === StepStatus.FAILED) {
      stepState.completedAt = new Date().toISOString();
    }

    if (outputs) {
      stepState.outputs = outputs;
      // Merge outputs into accumulated context
      Object.assign(this.state.context, outputs);
    }

    if (error) {
      stepState.error = error;
    }

    return this.save();
  }

  /**
   * Get outputs from a specific step
   * @param {string} stepId - Step identifier
   * @returns {Object} Step outputs
   */
  getStepOutputs(stepId) {
    if (!this.state || !this.state.steps || !this.state.steps[stepId]) {
      return {};
    }
    return this.state.steps[stepId].outputs || {};
  }

  /**
   * Get accumulated context (all outputs from completed steps)
   * @returns {Object} Accumulated context
   */
  getContext() {
    return this.state?.context || {};
  }

  /**
   * Set context value
   * @param {string} key - Context key
   * @param {*} value - Context value
   */
  setContext(key, value) {
    if (!this.state) {
      return;
    }
    this.state.context[key] = value;
  }

  /**
   * Get next pending step
   * @param {Array} stepOrder - Ordered list of step IDs
   * @returns {string|null} Next pending step ID
   */
  getNextPendingStep(stepOrder) {
    if (!this.state || !this.state.steps) {
      return null;
    }

    for (const stepId of stepOrder) {
      const stepState = this.state.steps[stepId];
      if (stepState && stepState.status === StepStatus.PENDING) {
        return stepId;
      }
    }

    return null;
  }

  /**
   * Update workflow status
   * @param {string} status - New workflow status
   * @returns {boolean} Success status
   */
  setWorkflowStatus(status) {
    if (!this.state) {
      return false;
    }

    this.state.status = status;

    if (status === WorkflowStatus.IN_PROGRESS && !this.state.startedAt) {
      this.state.startedAt = new Date().toISOString();
    }

    if (status === WorkflowStatus.COMPLETED || status === WorkflowStatus.FAILED) {
      this.state.completedAt = new Date().toISOString();
    }

    return this.save();
  }

  /**
   * Set metadata value
   * @param {string} key - Metadata key
   * @param {*} value - Metadata value
   */
  setMetadata(key, value) {
    if (!this.state) {
      return;
    }
    this.state.metadata[key] = value;
    this.save();
  }

  /**
   * Get workflow summary
   * @returns {Object} Summary of workflow state
   */
  getSummary() {
    if (!this.state) {
      return null;
    }

    const steps = this.state.steps;
    const stepIds = Object.keys(steps);

    const summary = {
      workflowName: this.state.workflowName,
      status: this.state.status,
      startedAt: this.state.startedAt,
      completedAt: this.state.completedAt,
      currentStepId: this.state.currentStepId,
      progress: {
        total: stepIds.length,
        completed: 0,
        failed: 0,
        pending: 0,
        skipped: 0,
        inProgress: 0
      }
    };

    for (const stepId of stepIds) {
      const status = steps[stepId].status;
      switch (status) {
        case StepStatus.COMPLETED:
          summary.progress.completed++;
          break;
        case StepStatus.FAILED:
          summary.progress.failed++;
          break;
        case StepStatus.PENDING:
          summary.progress.pending++;
          break;
        case StepStatus.SKIPPED:
          summary.progress.skipped++;
          break;
        case StepStatus.IN_PROGRESS:
          summary.progress.inProgress++;
          break;
      }
    }

    summary.progress.percentage = Math.round(
      ((summary.progress.completed + summary.progress.skipped) / summary.progress.total) * 100
    );

    return summary;
  }

  /**
   * Get the current state object
   * @returns {Object|null} Current state
   */
  getState() {
    return this.state;
  }
}

export default WorkflowStateManager;
