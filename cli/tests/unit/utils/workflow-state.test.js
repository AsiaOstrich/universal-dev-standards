/**
 * WorkflowStateManager Unit Tests
 *
 * Tests for workflow execution state management.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  WorkflowStateManager,
  StepStatus,
  WorkflowStatus
} from '../../../src/utils/workflow-state.js';

describe('WorkflowStateManager', () => {
  let testDir;
  let stateManager;
  const workflowName = 'test-workflow';

  const mockWorkflow = {
    name: 'test-workflow',
    version: '1.0.0',
    steps: [
      { id: 'step-1', name: 'Step 1', type: 'agent' },
      { id: 'step-2', name: 'Step 2', type: 'manual' },
      { id: 'step-3', name: 'Step 3', type: 'conditional' }
    ]
  };

  beforeEach(() => {
    // Create unique test directory
    testDir = join(tmpdir(), `workflow-state-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    stateManager = new WorkflowStateManager(workflowName, testDir);
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    it('should initialize with correct paths', () => {
      // Assert
      expect(stateManager.workflowName).toBe(workflowName);
      expect(stateManager.projectPath).toBe(testDir);
      expect(stateManager.stateDir).toBe(join(testDir, '.standards', 'workflow-state'));
      expect(stateManager.statePath).toBe(join(testDir, '.standards', 'workflow-state', `${workflowName}.json`));
    });
  });

  describe('initialize', () => {
    it('should create initial state with all steps pending', () => {
      // Act
      const state = stateManager.initialize(mockWorkflow);

      // Assert
      expect(state.workflowName).toBe(workflowName);
      expect(state.workflowVersion).toBe('1.0.0');
      expect(state.status).toBe(WorkflowStatus.NOT_STARTED);
      expect(state.steps).toHaveProperty('step-1');
      expect(state.steps).toHaveProperty('step-2');
      expect(state.steps).toHaveProperty('step-3');
      expect(state.steps['step-1'].status).toBe(StepStatus.PENDING);
      expect(state.steps['step-2'].status).toBe(StepStatus.PENDING);
      expect(state.steps['step-3'].status).toBe(StepStatus.PENDING);
    });

    it('should handle workflow without steps', () => {
      // Arrange
      const emptyWorkflow = { name: 'empty', version: '1.0.0' };

      // Act
      const state = stateManager.initialize(emptyWorkflow);

      // Assert
      expect(state.steps).toEqual({});
    });

    it('should use default version if not provided', () => {
      // Arrange
      const noVersionWorkflow = { name: 'no-version', steps: [] };

      // Act
      const state = stateManager.initialize(noVersionWorkflow);

      // Assert
      expect(state.workflowVersion).toBe('1.0.0');
    });
  });

  describe('save and load', () => {
    it('should save state to file', () => {
      // Arrange
      stateManager.initialize(mockWorkflow);

      // Act
      const saved = stateManager.save();

      // Assert
      expect(saved).toBe(true);
      expect(existsSync(stateManager.statePath)).toBe(true);
    });

    it('should load state from file', () => {
      // Arrange
      stateManager.initialize(mockWorkflow);
      stateManager.save();

      // Create new instance
      const newManager = new WorkflowStateManager(workflowName, testDir);

      // Act
      const loaded = newManager.load();

      // Assert
      expect(loaded).not.toBeNull();
      expect(loaded.workflowName).toBe(workflowName);
      expect(loaded.steps).toHaveProperty('step-1');
    });

    it('should return null when loading non-existent state', () => {
      // Act
      const loaded = stateManager.load();

      // Assert
      expect(loaded).toBeNull();
    });

    it('should return false when saving without initialization', () => {
      // Act
      const saved = stateManager.save();

      // Assert
      expect(saved).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove state file', () => {
      // Arrange
      stateManager.initialize(mockWorkflow);
      stateManager.save();
      expect(existsSync(stateManager.statePath)).toBe(true);

      // Act
      const cleared = stateManager.clear();

      // Assert
      expect(cleared).toBe(true);
      expect(existsSync(stateManager.statePath)).toBe(false);
      expect(stateManager.state).toBeNull();
    });

    it('should return true even if file does not exist', () => {
      // Act
      const cleared = stateManager.clear();

      // Assert
      expect(cleared).toBe(true);
    });
  });

  describe('exists', () => {
    it('should return false when no state file', () => {
      // Act & Assert
      expect(stateManager.exists()).toBe(false);
    });

    it('should return true when state file exists', () => {
      // Arrange
      stateManager.initialize(mockWorkflow);
      stateManager.save();

      // Act & Assert
      expect(stateManager.exists()).toBe(true);
    });
  });

  describe('canResume', () => {
    it('should return false when no state', () => {
      // Act & Assert
      expect(stateManager.canResume()).toBe(false);
    });

    it('should return true when status is IN_PROGRESS', () => {
      // Arrange
      stateManager.initialize(mockWorkflow);
      stateManager.state.status = WorkflowStatus.IN_PROGRESS;

      // Act & Assert
      expect(stateManager.canResume()).toBe(true);
    });

    it('should return true when status is PAUSED', () => {
      // Arrange
      stateManager.initialize(mockWorkflow);
      stateManager.state.status = WorkflowStatus.PAUSED;

      // Act & Assert
      expect(stateManager.canResume()).toBe(true);
    });

    it('should return false when status is COMPLETED', () => {
      // Arrange
      stateManager.initialize(mockWorkflow);
      stateManager.state.status = WorkflowStatus.COMPLETED;

      // Act & Assert
      expect(stateManager.canResume()).toBe(false);
    });

    it('should return false when status is FAILED', () => {
      // Arrange
      stateManager.initialize(mockWorkflow);
      stateManager.state.status = WorkflowStatus.FAILED;

      // Act & Assert
      expect(stateManager.canResume()).toBe(false);
    });
  });

  describe('getResumePoint', () => {
    it('should return null when no state', () => {
      // Act & Assert
      expect(stateManager.getResumePoint()).toBeNull();
    });

    it('should return in_progress step if exists', () => {
      // Arrange
      stateManager.initialize(mockWorkflow);
      stateManager.state.steps['step-1'].status = StepStatus.COMPLETED;
      stateManager.state.steps['step-2'].status = StepStatus.IN_PROGRESS;

      // Act
      const resumePoint = stateManager.getResumePoint();

      // Assert
      expect(resumePoint).toBe('step-2');
    });

    it('should return first pending step if no in_progress', () => {
      // Arrange
      stateManager.initialize(mockWorkflow);
      stateManager.state.steps['step-1'].status = StepStatus.COMPLETED;

      // Act
      const resumePoint = stateManager.getResumePoint();

      // Assert
      expect(resumePoint).toBe('step-2');
    });

    it('should return null if all steps completed', () => {
      // Arrange
      stateManager.initialize(mockWorkflow);
      stateManager.state.steps['step-1'].status = StepStatus.COMPLETED;
      stateManager.state.steps['step-2'].status = StepStatus.COMPLETED;
      stateManager.state.steps['step-3'].status = StepStatus.COMPLETED;

      // Act
      const resumePoint = stateManager.getResumePoint();

      // Assert
      expect(resumePoint).toBeNull();
    });
  });

  describe('getStepStatus and setStepStatus', () => {
    beforeEach(() => {
      stateManager.initialize(mockWorkflow);
    });

    it('should get step status', () => {
      // Act & Assert
      expect(stateManager.getStepStatus('step-1')).toBe(StepStatus.PENDING);
    });

    it('should return null for non-existent step', () => {
      // Act & Assert
      expect(stateManager.getStepStatus('non-existent')).toBeNull();
    });

    it('should set step status', () => {
      // Act
      stateManager.setStepStatus('step-1', StepStatus.IN_PROGRESS);

      // Assert
      expect(stateManager.getStepStatus('step-1')).toBe(StepStatus.IN_PROGRESS);
    });

    it('should set startedAt when status is IN_PROGRESS', () => {
      // Act
      stateManager.setStepStatus('step-1', StepStatus.IN_PROGRESS);

      // Assert
      expect(stateManager.state.steps['step-1'].startedAt).not.toBeNull();
      expect(stateManager.state.currentStepId).toBe('step-1');
    });

    it('should set completedAt when status is COMPLETED', () => {
      // Act
      stateManager.setStepStatus('step-1', StepStatus.COMPLETED);

      // Assert
      expect(stateManager.state.steps['step-1'].completedAt).not.toBeNull();
    });

    it('should set outputs and merge to context', () => {
      // Act
      stateManager.setStepStatus('step-1', StepStatus.COMPLETED, { result: 'success' });

      // Assert
      expect(stateManager.state.steps['step-1'].outputs).toEqual({ result: 'success' });
      expect(stateManager.state.context.result).toBe('success');
    });

    it('should set error message', () => {
      // Act
      stateManager.setStepStatus('step-1', StepStatus.FAILED, null, 'Something went wrong');

      // Assert
      expect(stateManager.state.steps['step-1'].error).toBe('Something went wrong');
    });

    it('should return false for non-existent step', () => {
      // Act
      const result = stateManager.setStepStatus('non-existent', StepStatus.COMPLETED);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getStepOutputs', () => {
    beforeEach(() => {
      stateManager.initialize(mockWorkflow);
    });

    it('should return outputs for step', () => {
      // Arrange
      stateManager.setStepStatus('step-1', StepStatus.COMPLETED, { data: 'test' });

      // Act
      const outputs = stateManager.getStepOutputs('step-1');

      // Assert
      expect(outputs).toEqual({ data: 'test' });
    });

    it('should return empty object for non-existent step', () => {
      // Act
      const outputs = stateManager.getStepOutputs('non-existent');

      // Assert
      expect(outputs).toEqual({});
    });
  });

  describe('context management', () => {
    beforeEach(() => {
      stateManager.initialize(mockWorkflow);
    });

    it('should get empty context initially', () => {
      // Act & Assert
      expect(stateManager.getContext()).toEqual({});
    });

    it('should set context value', () => {
      // Act
      stateManager.setContext('key', 'value');

      // Assert
      expect(stateManager.getContext().key).toBe('value');
    });

    it('should get context with accumulated outputs', () => {
      // Arrange
      stateManager.setStepStatus('step-1', StepStatus.COMPLETED, { output1: 'val1' });
      stateManager.setStepStatus('step-2', StepStatus.COMPLETED, { output2: 'val2' });

      // Act
      const context = stateManager.getContext();

      // Assert
      expect(context.output1).toBe('val1');
      expect(context.output2).toBe('val2');
    });
  });

  describe('getNextPendingStep', () => {
    beforeEach(() => {
      stateManager.initialize(mockWorkflow);
    });

    it('should return first pending step in order', () => {
      // Arrange
      const stepOrder = ['step-1', 'step-2', 'step-3'];

      // Act
      const next = stateManager.getNextPendingStep(stepOrder);

      // Assert
      expect(next).toBe('step-1');
    });

    it('should skip completed steps', () => {
      // Arrange
      const stepOrder = ['step-1', 'step-2', 'step-3'];
      stateManager.setStepStatus('step-1', StepStatus.COMPLETED);

      // Act
      const next = stateManager.getNextPendingStep(stepOrder);

      // Assert
      expect(next).toBe('step-2');
    });

    it('should return null if all complete', () => {
      // Arrange
      const stepOrder = ['step-1', 'step-2', 'step-3'];
      stateManager.setStepStatus('step-1', StepStatus.COMPLETED);
      stateManager.setStepStatus('step-2', StepStatus.COMPLETED);
      stateManager.setStepStatus('step-3', StepStatus.COMPLETED);

      // Act
      const next = stateManager.getNextPendingStep(stepOrder);

      // Assert
      expect(next).toBeNull();
    });
  });

  describe('setWorkflowStatus', () => {
    beforeEach(() => {
      stateManager.initialize(mockWorkflow);
    });

    it('should update workflow status', () => {
      // Act
      stateManager.setWorkflowStatus(WorkflowStatus.IN_PROGRESS);

      // Assert
      expect(stateManager.state.status).toBe(WorkflowStatus.IN_PROGRESS);
    });

    it('should set startedAt when IN_PROGRESS', () => {
      // Act
      stateManager.setWorkflowStatus(WorkflowStatus.IN_PROGRESS);

      // Assert
      expect(stateManager.state.startedAt).not.toBeNull();
    });

    it('should set completedAt when COMPLETED', () => {
      // Act
      stateManager.setWorkflowStatus(WorkflowStatus.COMPLETED);

      // Assert
      expect(stateManager.state.completedAt).not.toBeNull();
    });

    it('should set completedAt when FAILED', () => {
      // Act
      stateManager.setWorkflowStatus(WorkflowStatus.FAILED);

      // Assert
      expect(stateManager.state.completedAt).not.toBeNull();
    });
  });

  describe('getSummary', () => {
    beforeEach(() => {
      stateManager.initialize(mockWorkflow);
    });

    it('should return null when no state', () => {
      // Arrange
      const emptyManager = new WorkflowStateManager('empty', testDir);

      // Act & Assert
      expect(emptyManager.getSummary()).toBeNull();
    });

    it('should return correct progress counts', () => {
      // Arrange
      stateManager.setStepStatus('step-1', StepStatus.COMPLETED);
      stateManager.setStepStatus('step-2', StepStatus.IN_PROGRESS);
      // step-3 remains PENDING

      // Act
      const summary = stateManager.getSummary();

      // Assert
      expect(summary.progress.total).toBe(3);
      expect(summary.progress.completed).toBe(1);
      expect(summary.progress.inProgress).toBe(1);
      expect(summary.progress.pending).toBe(1);
    });

    it('should calculate percentage correctly', () => {
      // Arrange
      stateManager.setStepStatus('step-1', StepStatus.COMPLETED);
      stateManager.setStepStatus('step-2', StepStatus.COMPLETED);
      // step-3 remains PENDING

      // Act
      const summary = stateManager.getSummary();

      // Assert
      expect(summary.progress.percentage).toBe(67); // 2/3 = 66.67%, rounded to 67
    });

    it('should include skipped in percentage', () => {
      // Arrange
      stateManager.setStepStatus('step-1', StepStatus.COMPLETED);
      stateManager.setStepStatus('step-2', StepStatus.SKIPPED);
      stateManager.setStepStatus('step-3', StepStatus.COMPLETED);

      // Act
      const summary = stateManager.getSummary();

      // Assert
      expect(summary.progress.percentage).toBe(100);
      expect(summary.progress.skipped).toBe(1);
    });
  });

  describe('setMetadata', () => {
    beforeEach(() => {
      stateManager.initialize(mockWorkflow);
    });

    it('should set metadata value', () => {
      // Act
      stateManager.setMetadata('aiTool', 'claude-code');

      // Assert
      expect(stateManager.state.metadata.aiTool).toBe('claude-code');
    });

    it('should do nothing when no state', () => {
      // Arrange
      const emptyManager = new WorkflowStateManager('empty', testDir);

      // Act - should not throw
      emptyManager.setMetadata('key', 'value');

      // Assert
      expect(emptyManager.state).toBeNull();
    });
  });

  describe('getState', () => {
    it('should return null before initialization', () => {
      // Act & Assert
      expect(stateManager.getState()).toBeNull();
    });

    it('should return state after initialization', () => {
      // Arrange
      stateManager.initialize(mockWorkflow);

      // Act
      const state = stateManager.getState();

      // Assert
      expect(state).not.toBeNull();
      expect(state.workflowName).toBe(workflowName);
    });
  });
});
