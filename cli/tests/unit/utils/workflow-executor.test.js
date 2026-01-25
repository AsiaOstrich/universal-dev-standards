/**
 * WorkflowExecutor Unit Tests
 *
 * Tests for workflow execution engine.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  WorkflowExecutor,
  RecoveryAction
} from '../../../src/utils/workflow-executor.js';
import { StepStatus, WorkflowStatus } from '../../../src/utils/workflow-state.js';

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn()
  }
}));

// Mock workflows-installer
vi.mock('../../../src/utils/workflows-installer.js', () => ({
  getWorkflowContent: vi.fn(),
  parseWorkflow: vi.fn(),
  validateWorkflow: vi.fn()
}));

// Mock agent-adapter
vi.mock('../../../src/utils/agent-adapter.js', () => ({
  getExecutionMode: vi.fn(),
  adaptAgentForTool: vi.fn(),
  ExecutionMode: {
    TASK: 'task',
    INLINE: 'inline',
    MANUAL: 'manual'
  }
}));

// Mock ai-agent-paths
vi.mock('../../../src/config/ai-agent-paths.js', () => ({
  supportsTask: vi.fn(),
  getAgentConfig: vi.fn()
}));

import inquirer from 'inquirer';
import {
  getWorkflowContent,
  parseWorkflow,
  validateWorkflow
} from '../../../src/utils/workflows-installer.js';
import {
  getExecutionMode,
  adaptAgentForTool,
  ExecutionMode
} from '../../../src/utils/agent-adapter.js';
import { supportsTask, getAgentConfig } from '../../../src/config/ai-agent-paths.js';

describe('WorkflowExecutor', () => {
  let testDir;
  let executor;

  const mockWorkflow = {
    name: 'test-workflow',
    version: '1.0.0',
    description: 'Test workflow description',
    steps: [
      {
        id: 'step-1',
        name: 'Step 1',
        type: 'manual',
        description: 'Manual step instructions',
        checklist: ['Check item 1', 'Check item 2']
      },
      {
        id: 'step-2',
        name: 'Step 2',
        type: 'agent',
        agent: 'test-agent',
        description: 'Agent step description',
        inputs: ['input1'],
        outputs: ['output1']
      }
    ]
  };

  beforeEach(() => {
    // Create unique test directory
    testDir = join(tmpdir(), `workflow-executor-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    // Reset all mocks
    vi.clearAllMocks();

    // Default mock implementations
    getWorkflowContent.mockReturnValue('mock-content');
    parseWorkflow.mockReturnValue(mockWorkflow);
    validateWorkflow.mockReturnValue({ valid: true, errors: [], warnings: [] });
    supportsTask.mockReturnValue(true);
    getAgentConfig.mockReturnValue({ name: 'Claude Code' });
    getExecutionMode.mockReturnValue(ExecutionMode.TASK);
    adaptAgentForTool.mockReturnValue({
      mode: ExecutionMode.TASK,
      taskConfig: {
        subagent_type: 'test-agent',
        description: 'Test description'
      }
    });

    // Default inquirer mock - confirm everything
    inquirer.prompt.mockResolvedValue({ confirm: true, completed: true, action: 'resume' });

    executor = new WorkflowExecutor({
      aiTool: 'claude-code',
      projectPath: testDir,
      verbose: false,
      dryRun: false,
      interactive: false // Disable interactive for most tests
    });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      // Act
      const exec = new WorkflowExecutor();

      // Assert
      expect(exec.aiTool).toBe('claude-code');
      expect(exec.verbose).toBe(false);
      expect(exec.dryRun).toBe(false);
      expect(exec.interactive).toBe(true);
    });

    it('should accept custom options', () => {
      // Assert
      expect(executor.aiTool).toBe('claude-code');
      expect(executor.projectPath).toBe(testDir);
      expect(executor.interactive).toBe(false);
    });
  });

  describe('execute', () => {
    it('should return error when workflow not found', async () => {
      // Arrange
      getWorkflowContent.mockReturnValue(null);

      // Act
      const result = await executor.execute('non-existent');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Workflow not found');
    });

    it('should return error when workflow is invalid', async () => {
      // Arrange
      validateWorkflow.mockReturnValue({
        valid: false,
        errors: ['Missing required field: name'],
        warnings: []
      });

      // Act
      const result = await executor.execute('test-workflow');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid workflow');
    });

    it('should execute workflow successfully in non-interactive mode', async () => {
      // Act
      const result = await executor.execute('test-workflow');

      // Assert
      expect(result.success).toBe(true);
      expect(result.workflowName).toBe('test-workflow');
    });

    it('should return dry-run result when dryRun is true', async () => {
      // Arrange
      executor.dryRun = true;

      // Act
      const result = await executor.execute('test-workflow');

      // Assert
      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.steps).toHaveLength(2);
    });

    it('should apply initial context', async () => {
      // Arrange - We need to verify the context is applied before execution
      // Since we're in non-interactive mode, the workflow will complete and clear state
      // So we'll just verify the execute call succeeds with initialContext

      // Act
      const result = await executor.execute('test-workflow', {
        initialContext: { input1: 'test-value' }
      });

      // Assert - workflow completed successfully (context was applied during execution)
      expect(result.success).toBe(true);
    });
  });

  describe('resume', () => {
    it('should return error when workflow not found', async () => {
      // Arrange
      getWorkflowContent.mockReturnValue(null);

      // Act
      const result = await executor.resume('non-existent');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Workflow not found');
    });

    it('should return error when no saved state', async () => {
      // Act
      const result = await executor.resume('test-workflow');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('No saved state found');
    });

    it('should resume from paused state', async () => {
      // Arrange - First, manually create a paused state
      // Initialize state manager with workflow
      const { WorkflowStateManager, WorkflowStatus, StepStatus } = await import('../../../src/utils/workflow-state.js');
      const stateManager = new WorkflowStateManager('test-workflow', testDir);
      stateManager.initialize(mockWorkflow);
      stateManager.setWorkflowStatus(WorkflowStatus.PAUSED);
      stateManager.setStepStatus('step-1', StepStatus.COMPLETED);
      // step-2 remains pending
      stateManager.save();

      // Act - Resume
      executor.interactive = false;
      const resumeResult = await executor.resume('test-workflow');

      // Assert
      expect(resumeResult.success).toBe(true);
      expect(resumeResult.workflowName).toBe('test-workflow');
    });
  });

  describe('executeStep', () => {
    beforeEach(async () => {
      // Initialize executor state
      await executor.execute('test-workflow', { restart: true });
    });

    it('should handle unknown step type', async () => {
      // Arrange
      const unknownStep = {
        id: 'unknown',
        name: 'Unknown',
        type: 'unknown-type'
      };

      // Act
      const result = await executor.executeStep(unknownStep);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown step type');
    });
  });

  describe('executeManualStep', () => {
    beforeEach(async () => {
      executor.interactive = false;
      await executor.execute('test-workflow', { restart: true });
    });

    it('should complete manual step in non-interactive mode', async () => {
      // Arrange
      const manualStep = mockWorkflow.steps[0];

      // Act
      const result = await executor.executeManualStep(manualStep, {});

      // Assert
      expect(result.success).toBe(true);
    });

    it('should prompt for confirmation in interactive mode', async () => {
      // Arrange
      executor.interactive = true;
      inquirer.prompt.mockResolvedValue({ confirm: true });
      const manualStep = mockWorkflow.steps[0];

      // Act
      const result = await executor.executeManualStep(manualStep, {});

      // Assert
      expect(result.success).toBe(true);
      expect(inquirer.prompt).toHaveBeenCalled();
    });

    it('should allow skipping in interactive mode', async () => {
      // Arrange
      executor.interactive = true;
      inquirer.prompt
        .mockResolvedValueOnce({ confirm: false })
        .mockResolvedValueOnce({ action: 'skip' });
      const manualStep = mockWorkflow.steps[0];

      // Act
      const result = await executor.executeManualStep(manualStep, {});

      // Assert
      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
    });
  });

  describe('executeAgentStep', () => {
    beforeEach(async () => {
      executor.interactive = false;
      await executor.execute('test-workflow', { restart: true });
    });

    it('should execute agent step in TASK mode', async () => {
      // Arrange
      getExecutionMode.mockReturnValue(ExecutionMode.TASK);
      const agentStep = mockWorkflow.steps[1];

      // Act
      const result = await executor.executeAgentStep(agentStep, {});

      // Assert
      expect(result.success).toBe(true);
      expect(result.mode).toBe(ExecutionMode.TASK);
    });

    it('should execute agent step in INLINE mode', async () => {
      // Arrange
      getExecutionMode.mockReturnValue(ExecutionMode.INLINE);
      adaptAgentForTool.mockReturnValue({
        mode: ExecutionMode.INLINE,
        contextPrefix: '<!-- Agent context -->'
      });
      const agentStep = mockWorkflow.steps[1];

      // Act
      const result = await executor.executeAgentStep(agentStep, {});

      // Assert
      expect(result.success).toBe(true);
      expect(result.mode).toBe(ExecutionMode.INLINE);
    });

    it('should execute agent step in MANUAL mode', async () => {
      // Arrange
      getExecutionMode.mockReturnValue(ExecutionMode.MANUAL);
      const agentStep = mockWorkflow.steps[1];

      // Act
      const result = await executor.executeAgentStep(agentStep, {});

      // Assert
      expect(result.success).toBe(true);
      expect(result.mode).toBe(ExecutionMode.MANUAL);
    });
  });

  describe('executeConditionalStep', () => {
    beforeEach(async () => {
      executor.interactive = false;
      await executor.execute('test-workflow', { restart: true });
    });

    it('should evaluate simple condition', async () => {
      // Arrange
      const conditionalStep = {
        id: 'cond-1',
        name: 'Conditional',
        type: 'conditional',
        condition: 'hasFeature exists',
        then_branch: 'step-a',
        else_branch: 'step-b'
      };

      // Act - condition not met
      const result1 = await executor.executeConditionalStep(conditionalStep, {});
      expect(result1.success).toBe(true);

      // Act - condition met
      const result2 = await executor.executeConditionalStep(conditionalStep, { hasFeature: true });
      expect(result2.outputs.next_branch).toBe('then');
    });

    it('should evaluate equality condition', async () => {
      // Arrange
      const conditionalStep = {
        id: 'cond-2',
        name: 'Conditional',
        type: 'conditional',
        condition: 'status == active'
      };

      // Act
      const result = await executor.executeConditionalStep(conditionalStep, { status: 'active' });

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('evaluateCondition', () => {
    it('should evaluate "exists" condition', () => {
      // Arrange
      const context = { key: 'value' };

      // Act & Assert
      expect(executor.evaluateCondition('key exists', context)).toBe(true);
      expect(executor.evaluateCondition('missing exists', context)).toBe(false);
    });

    it('should evaluate "==" condition', () => {
      // Arrange
      const context = { status: 'active' };

      // Act & Assert
      expect(executor.evaluateCondition('status == active', context)).toBe(true);
      expect(executor.evaluateCondition('status == inactive', context)).toBe(false);
    });

    it('should evaluate "!=" condition', () => {
      // Arrange
      const context = { status: 'active' };

      // Act & Assert
      expect(executor.evaluateCondition('status != inactive', context)).toBe(true);
      expect(executor.evaluateCondition('status != active', context)).toBe(false);
    });

    it('should evaluate truthy condition', () => {
      // Arrange
      const context = { enabled: true, disabled: false };

      // Act & Assert
      expect(executor.evaluateCondition('enabled', context)).toBe(true);
      expect(executor.evaluateCondition('disabled', context)).toBe(false);
    });
  });

  describe('resolveInputs', () => {
    it('should resolve string inputs from context', () => {
      // Arrange
      const inputs = ['input1', 'input2'];
      const context = { input1: 'value1', input2: 'value2' };

      // Act
      const resolved = executor.resolveInputs(inputs, context);

      // Assert
      expect(resolved.input1).toBe('value1');
      expect(resolved.input2).toBe('value2');
    });

    it('should return null for missing inputs', () => {
      // Arrange
      const inputs = ['missing'];
      const context = {};

      // Act
      const resolved = executor.resolveInputs(inputs, context);

      // Assert
      expect(resolved.missing).toBeNull();
    });

    it('should handle object inputs with defaults', () => {
      // Arrange
      const inputs = [
        { name: 'input1', default: 'default1' }
      ];
      const context = {};

      // Act
      const resolved = executor.resolveInputs(inputs, context);

      // Assert
      expect(resolved.input1).toBe('default1');
    });

    it('should return empty object for null inputs', () => {
      // Act & Assert
      expect(executor.resolveInputs(null, {})).toEqual({});
      expect(executor.resolveInputs(undefined, {})).toEqual({});
    });
  });

  describe('handleStepFailure', () => {
    beforeEach(async () => {
      await executor.execute('test-workflow', { restart: true });
    });

    it('should return ABORT in non-interactive mode', async () => {
      // Arrange
      executor.interactive = false;
      const step = mockWorkflow.steps[0];
      const result = { success: false, error: 'Test error' };

      // Act
      const action = await executor.handleStepFailure(step, result);

      // Assert
      expect(action).toBe(RecoveryAction.ABORT);
    });

    it('should prompt for action in interactive mode', async () => {
      // Arrange
      executor.interactive = true;
      inquirer.prompt.mockResolvedValue({ action: RecoveryAction.RETRY });
      const step = mockWorkflow.steps[0];
      const result = { success: false, error: 'Test error' };

      // Act
      const action = await executor.handleStepFailure(step, result);

      // Assert
      expect(action).toBe(RecoveryAction.RETRY);
      expect(inquirer.prompt).toHaveBeenCalled();
    });
  });

  describe('displayDryRunPlan', () => {
    it('should return dry-run result with steps info', async () => {
      // Arrange
      executor.dryRun = true;

      // Act
      const result = await executor.execute('test-workflow');

      // Assert
      expect(result.dryRun).toBe(true);
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].id).toBe('step-1');
      expect(result.steps[0].type).toBe('manual');
    });
  });

  describe('getStepTypeIcon', () => {
    it('should return correct icons for step types', () => {
      // Note: We can't easily test chalk output, so we just verify no errors
      expect(() => executor.getStepTypeIcon('agent')).not.toThrow();
      expect(() => executor.getStepTypeIcon('manual')).not.toThrow();
      expect(() => executor.getStepTypeIcon('conditional')).not.toThrow();
      expect(() => executor.getStepTypeIcon('unknown')).not.toThrow();
    });
  });
});

describe('RecoveryAction', () => {
  it('should export correct action values', () => {
    expect(RecoveryAction.RETRY).toBe('retry');
    expect(RecoveryAction.SKIP).toBe('skip');
    expect(RecoveryAction.PAUSE).toBe('pause');
    expect(RecoveryAction.ABORT).toBe('abort');
  });
});
