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
import { buildFlowFromAnswers } from '../../../src/commands/flow.js';

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

describe('SPEC-FLOW-001: Flow Commands (Core Logic)', () => {
  // ============================================================
  // AC-13: uds flow list
  // ============================================================
  describe('AC-13: listFlows', () => {
    it('should list all flows with built-in and custom labels', () => {
      const flows = [sddBuiltIn, customFlow];
      const result = listFlows(flows);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('sdd');
      expect(result[0].label).toBe('built-in');
      expect(result[0].stageCount).toBe(3);
      expect(result[1].id).toBe('my-flow');
      expect(result[1].label).toBe('custom');
      expect(result[1].extends).toBe('sdd');
    });

    it('should return empty array when no flows available', () => {
      expect(listFlows([])).toEqual([]);
    });
  });

  // ============================================================
  // AC-14: uds flow validate
  // ============================================================
  describe('AC-14: validateFlowById', () => {
    it('should return no errors for valid flow', () => {
      const flows = { sdd: sddBuiltIn };
      const result = validateFlowById('sdd', flows, { availableCommands: ['/brainstorm', '/sdd', '/tdd'] });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should report errors for flow with invalid commands', () => {
      const badFlow = {
        id: 'bad', name: 'Bad', _source: 'custom',
        stages: [{ id: 's1', name: 'S1', steps: [{ command: '/fake' }] }]
      };
      const result = validateFlowById('bad', { bad: badFlow }, { availableCommands: ['/sdd'] });
      expect(result.valid).toBe(false);
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
      const result = validateFlowById('dup', { dup: dupFlow }, { availableCommands: ['/sdd', '/tdd'] });
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
      const diff = diffFlows(sddBuiltIn, customFlow);
      expect(diff.stages.added).toContain('security');
    });

    it('should detect added steps in existing stage', () => {
      const diff = diffFlows(sddBuiltIn, customFlow);
      const implChanges = diff.steps.modified.find(m => m.stageId === 'implement');
      expect(implChanges).toBeDefined();
      expect(implChanges.added).toContain('/security');
    });

    it('should detect removed stages', () => {
      const smallerFlow = {
        id: 'small', name: 'Small', _source: 'custom',
        stages: [{ id: 'discuss', name: 'Discuss', steps: [{ command: '/brainstorm' }] }]
      };
      const diff = diffFlows(sddBuiltIn, smallerFlow);
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

describe('SPEC-FLOW-001: Flow CLI (AC-12 Interactive Create)', () => {
  // ============================================================
  // AC-12: buildFlowFromAnswers — 從互動式回答建立 Flow YAML
  // ============================================================
  describe('AC-12: buildFlowFromAnswers', () => {
    it('should build flow from scratch when no base selected', () => {
      const answers = {
        id: 'my-team',
        name: '我的團隊流程',
        base: null,
        stages: [
          { id: 'plan', name: '規劃', commands: ['/brainstorm', '/requirement'] },
          { id: 'build', name: '建置', commands: ['/tdd'] }
        ]
      };

      const flow = buildFlowFromAnswers(answers);

      expect(flow.id).toBe('my-team');
      expect(flow.name).toBe('我的團隊流程');
      expect(flow.extends).toBeUndefined();
      expect(flow.stages).toHaveLength(2);
      expect(flow.stages[0].steps).toHaveLength(2);
      expect(flow.stages[0].steps[0].command).toBe('/brainstorm');
    });

    it('should build flow with extends when base is selected', () => {
      const answers = {
        id: 'secure-sdd',
        name: 'Secure SDD',
        base: 'sdd',
        stages: []
      };

      const flow = buildFlowFromAnswers(answers);

      expect(flow.id).toBe('secure-sdd');
      expect(flow.extends).toBe('sdd');
    });

    it('should set default config values', () => {
      const answers = {
        id: 'simple',
        name: 'Simple',
        base: null,
        stages: [{ id: 'build', name: 'Build', commands: ['/tdd'] }]
      };

      const flow = buildFlowFromAnswers(answers);

      expect(flow.config.enforcement).toBe('suggest');
      expect(flow.config.state_persistence).toBe(true);
      expect(flow.config.gate_timeout).toBe(30);
    });

    it('should generate valid YAML output', () => {
      const answers = {
        id: 'yaml-test',
        name: 'YAML Test',
        base: null,
        stages: [{ id: 'build', name: 'Build', commands: ['/tdd'] }]
      };

      const flow = buildFlowFromAnswers(answers);

      // Should be serializable (no circular refs, no functions)
      expect(() => JSON.stringify(flow)).not.toThrow();
      expect(flow.id).toBe('yaml-test');
    });
  });
});
