/**
 * Tests for SPEC-FLOW-001: Flow CLI Commands
 * AC Coverage: AC-12, AC-13, AC-14, AC-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listFlows,
  validateFlowById,
  diffFlows
} from '../../../src/flow/flow-commands.js';

// Shared fixtures
const sddBuiltIn = {
  id: 'sdd', name: 'Spec-Driven Development', _source: 'built-in',
  stages: [
    { id: 'discuss', name: 'Discuss', steps: [{ command: '/brainstorm' }] },
    { id: 'design', name: 'Design', steps: [{ command: '/sdd' }] },
    { id: 'implement', name: 'Implement', steps: [{ command: '/tdd' }] }
  ]
};

const customFlow = {
  id: 'my-flow', name: '我的流程', extends: 'sdd', _source: 'custom',
  stages: [
    { id: 'discuss', name: 'Discuss', steps: [{ command: '/brainstorm' }] },
    { id: 'design', name: 'Design', steps: [{ command: '/sdd' }] },
    { id: 'security', name: 'Security', steps: [{ command: '/scan' }] },
    { id: 'implement', name: 'Implement', steps: [{ command: '/tdd' }, { command: '/security' }] }
  ]
};

describe('SPEC-FLOW-001: Flow CLI', () => {
  // ============================================================
  // AC-13: uds flow list
  // ============================================================
  describe('AC-13: listFlows', () => {
    it('should list all flows with built-in and custom labels', () => {
      // Arrange
      const flows = [sddBuiltIn, customFlow];

      // Act
      const result = listFlows(flows);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('sdd');
      expect(result[0].label).toBe('built-in');
      expect(result[0].stageCount).toBe(3);

      expect(result[1].id).toBe('my-flow');
      expect(result[1].label).toBe('custom');
      expect(result[1].extends).toBe('sdd');
      expect(result[1].stageCount).toBe(4);
    });

    it('should return empty array when no flows available', () => {
      const result = listFlows([]);
      expect(result).toEqual([]);
    });
  });

  // ============================================================
  // AC-14: uds flow validate
  // ============================================================
  describe('AC-14: validateFlowById', () => {
    it('should return no errors for valid flow', () => {
      // Arrange
      const flows = { sdd: sddBuiltIn };
      const availableCommands = ['/brainstorm', '/sdd', '/tdd'];

      // Act
      const result = validateFlowById('sdd', flows, { availableCommands });

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should report errors for flow with invalid commands', () => {
      // Arrange
      const badFlow = {
        id: 'bad', name: 'Bad', _source: 'custom',
        stages: [{ id: 's1', name: 'S1', steps: [{ command: '/fake' }] }]
      };
      const flows = { bad: badFlow };
      const availableCommands = ['/sdd', '/tdd'];

      // Act
      const result = validateFlowById('bad', flows, { availableCommands });

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toMatch(/\/fake/);
    });

    it('should report duplicate stage IDs', () => {
      const dupFlow = {
        id: 'dup', name: 'Dup', _source: 'custom',
        stages: [
          { id: 'plan', name: 'Plan 1', steps: [{ command: '/sdd' }] },
          { id: 'plan', name: 'Plan 2', steps: [{ command: '/tdd' }] }
        ]
      };
      const flows = { dup: dupFlow };

      const result = validateFlowById('dup', flows, { availableCommands: ['/sdd', '/tdd'] });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.message.match(/duplicate|重複/i))).toBe(true);
    });

    it('should return error when flow not found', () => {
      const result = validateFlowById('nonexistent', {}, { availableCommands: [] });

      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toMatch(/nonexistent/);
    });
  });

  // ============================================================
  // AC-15: uds flow diff
  // ============================================================
  describe('AC-15: diffFlows', () => {
    it('should detect added stages', () => {
      // Act
      const diff = diffFlows(sddBuiltIn, customFlow);

      // Assert
      expect(diff.stages.added).toContain('security');
    });

    it('should detect added steps in existing stage', () => {
      const diff = diffFlows(sddBuiltIn, customFlow);

      const implChanges = diff.steps.modified.find(m => m.stageId === 'implement');
      expect(implChanges).toBeDefined();
      expect(implChanges.added).toContain('/security');
    });

    it('should detect removed stages', () => {
      // Arrange — customFlow 少了一個 stage
      const smallerFlow = {
        id: 'small', name: 'Small', _source: 'custom',
        stages: [
          { id: 'discuss', name: 'Discuss', steps: [{ command: '/brainstorm' }] }
        ]
      };

      // Act
      const diff = diffFlows(sddBuiltIn, smallerFlow);

      // Assert
      expect(diff.stages.removed).toContain('design');
      expect(diff.stages.removed).toContain('implement');
    });

    it('should return empty diff for identical flows', () => {
      const diff = diffFlows(sddBuiltIn, sddBuiltIn);

      expect(diff.stages.added).toHaveLength(0);
      expect(diff.stages.removed).toHaveLength(0);
      expect(diff.steps.modified).toHaveLength(0);
    });
  });
});
