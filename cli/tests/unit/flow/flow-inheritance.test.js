/**
 * Tests for SPEC-FLOW-001: Flow Inheritance
 * AC Coverage: AC-4, AC-5, AC-6
 */

import { describe, it, expect } from 'vitest';
import { resolveInheritance } from '../../../src/flow/flow-inheritance.js';

// 共用的 base flow fixtures
const sddFlow = {
  id: 'sdd',
  name: 'Spec-Driven Development',
  stages: [
    {
      id: 'discuss', name: 'Discuss',
      steps: [{ command: '/brainstorm', required: false }]
    },
    {
      id: 'design', name: 'Design',
      steps: [{ command: '/sdd', required: true }]
    },
    {
      id: 'derive', name: 'Derive',
      steps: [{ command: '/derive', required: true }],
      gates: [{ type: 'blocking', run: 'npm test', expect: 'exit_code_0' }]
    },
    {
      id: 'implement', name: 'Implement',
      steps: [{ command: '/tdd', required: true }],
      gates: [{ type: 'warning', threshold: 80, ref: 'coverage-gate' }]
    },
    {
      id: 'verify', name: 'Verify',
      steps: [{ command: '/checkin', required: true }]
    },
    {
      id: 'ship', name: 'Ship',
      steps: [
        { command: '/commit', required: true },
        { command: '/pr', required: true }
      ]
    }
  ]
};

describe('SPEC-FLOW-001: Flow Inheritance', () => {
  // ============================================================
  // AC-4: extends 繼承機制正確合併 stages/steps/gates
  // ============================================================
  describe('AC-4: extends 繼承', () => {
    it('should inherit all stages, steps and gates from base flow', () => {
      // Arrange
      const childFlow = {
        id: 'child',
        name: 'Child Flow',
        extends: 'sdd'
      };
      const flowRegistry = { sdd: sddFlow };

      // Act
      const resolved = resolveInheritance(childFlow, flowRegistry);

      // Assert
      expect(resolved.stages).toHaveLength(6);
      expect(resolved.stages[0].id).toBe('discuss');
      expect(resolved.stages[5].id).toBe('ship');
      expect(resolved.stages[2].gates).toHaveLength(1);
    });

    it('should preserve child flow id and name', () => {
      const childFlow = {
        id: 'my-team',
        name: '我的團隊流程',
        extends: 'sdd'
      };
      const flowRegistry = { sdd: sddFlow };

      const resolved = resolveInheritance(childFlow, flowRegistry);

      expect(resolved.id).toBe('my-team');
      expect(resolved.name).toBe('我的團隊流程');
    });
  });

  // ============================================================
  // AC-5: overrides/insert/remove_steps 操作
  // ============================================================
  describe('AC-5: overrides 操作', () => {
    it('should add steps to inherited stage via add_steps', () => {
      const childFlow = {
        id: 'secure-flow',
        name: 'Secure Flow',
        extends: 'sdd',
        overrides: [{
          stage: 'derive',
          add_steps: [{ command: '/security', required: true }]
        }]
      };
      const flowRegistry = { sdd: sddFlow };

      const resolved = resolveInheritance(childFlow, flowRegistry);

      const deriveStage = resolved.stages.find(s => s.id === 'derive');
      expect(deriveStage.steps).toHaveLength(2);
      expect(deriveStage.steps[1].command).toBe('/security');
    });

    it('should override gate threshold via modify_gates', () => {
      const childFlow = {
        id: 'strict-flow',
        name: 'Strict Flow',
        extends: 'sdd',
        overrides: [{
          stage: 'implement',
          modify_gates: [{ ref: 'coverage-gate', threshold: 90 }]
        }]
      };
      const flowRegistry = { sdd: sddFlow };

      const resolved = resolveInheritance(childFlow, flowRegistry);

      const implStage = resolved.stages.find(s => s.id === 'implement');
      const coverageGate = implStage.gates.find(g => g.ref === 'coverage-gate');
      expect(coverageGate.threshold).toBe(90);
    });

    it('should insert new stage after specified stage', () => {
      const childFlow = {
        id: 'review-flow',
        name: 'Review Flow',
        extends: 'sdd',
        insert: [{
          after: 'design',
          stage: {
            id: 'security-review',
            name: 'Security Review',
            steps: [{ command: '/scan', required: true }]
          }
        }]
      };
      const flowRegistry = { sdd: sddFlow };

      const resolved = resolveInheritance(childFlow, flowRegistry);

      const stageIds = resolved.stages.map(s => s.id);
      const designIdx = stageIds.indexOf('design');
      const securityIdx = stageIds.indexOf('security-review');
      const deriveIdx = stageIds.indexOf('derive');

      expect(securityIdx).toBe(designIdx + 1);
      expect(deriveIdx).toBe(securityIdx + 1);
      expect(resolved.stages).toHaveLength(7);
    });

    it('should remove steps via remove_steps', () => {
      const childFlow = {
        id: 'no-pr-flow',
        name: 'No PR Flow',
        extends: 'sdd',
        overrides: [{
          stage: 'ship',
          remove_steps: ['/pr']
        }]
      };
      const flowRegistry = { sdd: sddFlow };

      const resolved = resolveInheritance(childFlow, flowRegistry);

      const shipStage = resolved.stages.find(s => s.id === 'ship');
      const commands = shipStage.steps.map(s => s.command);
      expect(commands).not.toContain('/pr');
      expect(commands).toContain('/commit');
    });
  });

  // ============================================================
  // AC-6: 多層繼承
  // ============================================================
  describe('AC-6: 多層繼承', () => {
    it('should resolve multi-level inheritance chain', () => {
      const orgFlow = {
        id: 'org-flow',
        name: 'Org Flow',
        extends: 'sdd',
        overrides: [{
          stage: 'derive',
          add_steps: [{ command: '/security', required: true }]
        }]
      };
      const teamFlow = {
        id: 'team-flow',
        name: 'Team Flow',
        extends: 'org-flow',
        overrides: [{
          stage: 'implement',
          modify_gates: [{ ref: 'coverage-gate', threshold: 95 }]
        }]
      };
      const flowRegistry = { sdd: sddFlow, 'org-flow': orgFlow };

      const resolved = resolveInheritance(teamFlow, flowRegistry);

      // org 層的 /security 存在
      const deriveStage = resolved.stages.find(s => s.id === 'derive');
      expect(deriveStage.steps.some(s => s.command === '/security')).toBe(true);

      // team 層的 coverage threshold 為 95
      const implStage = resolved.stages.find(s => s.id === 'implement');
      const gate = implStage.gates.find(g => g.ref === 'coverage-gate');
      expect(gate.threshold).toBe(95);
    });

    it('should enforce maximum inheritance depth of 5', () => {
      // 建立 6 層繼承鏈
      const flowRegistry = { sdd: sddFlow };
      let parentId = 'sdd';
      for (let i = 1; i <= 5; i++) {
        const id = `level-${i}`;
        flowRegistry[id] = { id, name: `Level ${i}`, extends: parentId };
        parentId = id;
      }
      const tooDeep = { id: 'level-6', name: 'Level 6', extends: 'level-5' };

      expect(() => resolveInheritance(tooDeep, flowRegistry)).toThrow(/depth|5/i);
    });

    it('should throw error when base flow not found', () => {
      const childFlow = { id: 'orphan', name: 'Orphan', extends: 'nonexistent' };
      const flowRegistry = {};

      expect(() => resolveInheritance(childFlow, flowRegistry)).toThrow(/nonexistent/);
    });
  });
});
