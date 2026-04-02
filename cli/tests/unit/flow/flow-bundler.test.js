/**
 * Tests for SPEC-FLOW-001: Flow Bundler (Export/Import)
 * AC Coverage: AC-16, AC-17
 */

import { describe, it, expect } from 'vitest';
import { exportBundle, importBundle, validateBundle } from '../../../src/flow/flow-bundler.js';

const sampleFlow = {
  id: 'my-flow',
  name: '我的流程',
  extends: 'sdd',
  stages: [
    { id: 'plan', name: 'Plan', steps: [{ command: '/brainstorm' }],
      gates: [{ type: 'blocking', ref: 'security-gate' }] }
  ]
};

const sampleGates = {
  'security-gate': {
    id: 'security-gate', name: '安全閘門', type: 'blocking',
    checks: [{ run: 'npm audit', expect: 'exit_code_0' }]
  }
};

describe('SPEC-FLOW-001: Flow Bundler', () => {
  // ============================================================
  // AC-16: Export
  // ============================================================
  describe('AC-16: exportBundle', () => {
    it('should create bundle with flow and referenced gates', () => {
      const bundle = exportBundle(sampleFlow, sampleGates, { projectName: 'test-project' });

      expect(bundle.bundle_version).toBe('1.0');
      expect(bundle.exported_from).toBe('test-project');
      expect(bundle.exported_at).toBeDefined();
      expect(bundle.flow.id).toBe('my-flow');
      expect(bundle.gates).toHaveLength(1);
      expect(bundle.gates[0].id).toBe('security-gate');
    });

    it('should export empty gates when flow has no gate refs', () => {
      const noGateFlow = {
        id: 'simple', name: 'Simple',
        stages: [{ id: 'build', name: 'Build', steps: [{ command: '/tdd' }] }]
      };

      const bundle = exportBundle(noGateFlow, {});

      expect(bundle.gates).toHaveLength(0);
    });

    it('should only include gates that are referenced by the flow', () => {
      const extraGates = {
        ...sampleGates,
        'unused-gate': { id: 'unused-gate', name: 'Unused', type: 'warning', checks: [] }
      };

      const bundle = exportBundle(sampleFlow, extraGates);

      expect(bundle.gates).toHaveLength(1);
      expect(bundle.gates[0].id).toBe('security-gate');
    });
  });

  // ============================================================
  // AC-17: Import + Validation
  // ============================================================
  describe('AC-17: importBundle', () => {
    it('should extract flow and gates from bundle', () => {
      const bundle = {
        bundle_version: '1.0',
        exported_at: '2026-04-02T10:00:00Z',
        flow: sampleFlow,
        gates: [sampleGates['security-gate']]
      };

      const result = importBundle(bundle);

      expect(result.flow.id).toBe('my-flow');
      expect(result.gates).toHaveLength(1);
      expect(result.gates[0].id).toBe('security-gate');
    });

    it('should detect conflicts with existing flows', () => {
      const bundle = {
        bundle_version: '1.0',
        flow: sampleFlow,
        gates: []
      };
      const existingFlowIds = ['my-flow'];

      const result = importBundle(bundle, { existingFlowIds });

      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]).toBe('my-flow');
    });

    it('should report no conflicts when flow is new', () => {
      const bundle = {
        bundle_version: '1.0',
        flow: sampleFlow,
        gates: []
      };

      const result = importBundle(bundle, { existingFlowIds: ['other-flow'] });

      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('AC-17: validateBundle', () => {
    it('should pass validation for valid bundle', () => {
      const bundle = {
        bundle_version: '1.0',
        flow: sampleFlow,
        gates: [sampleGates['security-gate']]
      };

      const errors = validateBundle(bundle, { availableBaseFlows: ['sdd'] });

      expect(errors).toHaveLength(0);
    });

    it('should report error when extends references non-existent base flow', () => {
      const bundle = {
        bundle_version: '1.0',
        flow: { ...sampleFlow, extends: 'nonexistent' },
        gates: []
      };

      const errors = validateBundle(bundle, { availableBaseFlows: ['sdd', 'tdd'] });

      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(/nonexistent/);
    });

    it('should pass when flow has no extends', () => {
      const bundle = {
        bundle_version: '1.0',
        flow: { id: 'standalone', name: 'Standalone', stages: [{ id: 's1', name: 'S1', steps: [{ command: '/tdd' }] }] },
        gates: []
      };

      const errors = validateBundle(bundle, { availableBaseFlows: [] });

      expect(errors).toHaveLength(0);
    });
  });
});
