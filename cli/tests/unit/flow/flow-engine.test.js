/**
 * Tests for SPEC-FLOW-001: Flow Engine — State Machine
 * AC Coverage: AC-10, AC-11
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FlowEngine } from '../../../src/flow/flow-engine.js';

describe('SPEC-FLOW-001: Flow Engine', () => {
  let engine;
  let mockFs;

  const sampleFlow = {
    id: 'test-flow',
    name: 'Test Flow',
    stages: [
      { id: 'plan', name: 'Plan', steps: [{ command: '/brainstorm', required: true }] },
      { id: 'design', name: 'Design', steps: [{ command: '/sdd', required: true }] },
      { id: 'implement', name: 'Implement', steps: [{ command: '/tdd', required: true }] }
    ],
    config: { enforcement: 'suggest', state_persistence: true, gate_timeout: 30 }
  };

  beforeEach(() => {
    mockFs = {
      existsSync: vi.fn().mockReturnValue(false),
      readFileSync: vi.fn(),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn()
    };
    engine = new FlowEngine(sampleFlow, { fs: mockFs, stateDir: '/tmp/.workflow-state' });
  });

  // ============================================================
  // AC-10: 流程狀態正確持久化並可恢復
  // ============================================================
  describe('AC-10: 狀態持久化與恢復', () => {
    it('should initialize flow at first stage', () => {
      // Act
      const state = engine.start();

      // Assert
      expect(state.workflow).toBe('test-flow');
      expect(state.current_phase).toBe('plan');
      expect(state.status).toBe('in-progress');
      expect(state.phases_completed).toEqual([]);
    });

    it('should save state when transitioning to next stage', () => {
      // Arrange
      engine.start();

      // Act
      engine.completeStage('plan');

      // Assert
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const savedContent = mockFs.writeFileSync.mock.calls[mockFs.writeFileSync.mock.calls.length - 1][1];
      const savedState = JSON.parse(savedContent);
      expect(savedState.current_phase).toBe('design');
      expect(savedState.phases_completed).toContain('plan');
    });

    it('should detect and offer to resume interrupted flow', () => {
      // Arrange — 模擬存在中斷的狀態檔案
      const existingState = {
        workflow: 'test-flow',
        current_phase: 'design',
        status: 'in-progress',
        updated: new Date().toISOString(),
        phases_completed: ['plan']
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(existingState));

      // Act
      const resumeInfo = engine.checkResumable();

      // Assert
      expect(resumeInfo.resumable).toBe(true);
      expect(resumeInfo.currentPhase).toBe('design');
      expect(resumeInfo.flowName).toBe('test-flow');
      expect(resumeInfo.stale).toBe(false);
    });

    it('should resume flow from saved state', () => {
      // Arrange
      const existingState = {
        workflow: 'test-flow',
        current_phase: 'design',
        status: 'in-progress',
        updated: new Date().toISOString(),
        phases_completed: ['plan']
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(existingState));

      // Act
      const state = engine.resume();

      // Assert
      expect(state.current_phase).toBe('design');
      expect(state.phases_completed).toContain('plan');
    });

    it('should warn when flow state is older than 7 days', () => {
      // Arrange — 8 天前的狀態
      const staleDate = new Date();
      staleDate.setDate(staleDate.getDate() - 8);
      const staleState = {
        workflow: 'test-flow',
        current_phase: 'design',
        status: 'in-progress',
        updated: staleDate.toISOString(),
        phases_completed: ['plan']
      };
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(staleState));

      // Act
      const resumeInfo = engine.checkResumable();

      // Assert
      expect(resumeInfo.resumable).toBe(true);
      expect(resumeInfo.stale).toBe(true);
      expect(resumeInfo.staleDays).toBeGreaterThanOrEqual(8);
    });

    it('should mark flow as completed when last stage is done', () => {
      // Arrange
      engine.start();
      engine.completeStage('plan');
      engine.completeStage('design');

      // Act
      engine.completeStage('implement');

      // Assert
      const savedContent = mockFs.writeFileSync.mock.calls[mockFs.writeFileSync.mock.calls.length - 1][1];
      const savedState = JSON.parse(savedContent);
      expect(savedState.status).toBe('completed');
      expect(savedState.phases_completed).toEqual(['plan', 'design', 'implement']);
    });

    it('should support abandoning a flow', () => {
      // Arrange
      engine.start();

      // Act
      engine.abandon();

      // Assert
      const savedContent = mockFs.writeFileSync.mock.calls[mockFs.writeFileSync.mock.calls.length - 1][1];
      const savedState = JSON.parse(savedContent);
      expect(savedState.status).toBe('abandoned');
    });

    it('should return not resumable when no state file exists', () => {
      mockFs.existsSync.mockReturnValue(false);

      const resumeInfo = engine.checkResumable();

      expect(resumeInfo.resumable).toBe(false);
    });
  });

  // ============================================================
  // AC-11: 狀態格式與 workflow-state-protocol 相容
  // ============================================================
  describe('AC-11: workflow-state-protocol 相容性', () => {
    it('should produce state with all required protocol fields', () => {
      // Act
      engine.start();

      // Assert
      const savedContent = mockFs.writeFileSync.mock.calls[0][1];
      const state = JSON.parse(savedContent);

      expect(state).toHaveProperty('workflow');
      expect(state).toHaveProperty('current_phase');
      expect(state).toHaveProperty('status');
      expect(state).toHaveProperty('updated');
      expect(state).toHaveProperty('phases_completed');
    });

    it('should use valid status values', () => {
      engine.start();

      const savedContent = mockFs.writeFileSync.mock.calls[0][1];
      const state = JSON.parse(savedContent);

      const validStatuses = ['in-progress', 'paused', 'completed', 'abandoned'];
      expect(validStatuses).toContain(state.status);
    });

    it('should use ISO 8601 format for updated field', () => {
      engine.start();

      const savedContent = mockFs.writeFileSync.mock.calls[0][1];
      const state = JSON.parse(savedContent);

      // ISO 8601 validation
      const parsed = new Date(state.updated);
      expect(parsed.toISOString()).toBe(state.updated);
    });

    it('should save state to correct file path', () => {
      engine.start();

      const savedPath = mockFs.writeFileSync.mock.calls[0][0];
      expect(savedPath).toMatch(/\.workflow-state/);
      expect(savedPath).toMatch(/flow-test-flow/);
    });
  });
});
