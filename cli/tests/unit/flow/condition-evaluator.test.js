/**
 * Tests for SPEC-FLOW-001: Condition Evaluator
 * AC Coverage: AC-1 (conditions)
 */

import { describe, it, expect } from 'vitest';
import { evaluateCondition } from '../../../src/flow/condition-evaluator.js';

describe('SPEC-FLOW-001: Condition Evaluator', () => {
  // ============================================================
  // Level 1：命名條件
  // ============================================================
  describe('Level 1: 命名條件', () => {
    it('should return true for scope_includes_api when scope includes api', () => {
      const context = { scope: ['api', 'database'] };
      expect(evaluateCondition('scope_includes_api', context)).toBe(true);
    });

    it('should return false for scope_includes_api when scope does not include api', () => {
      const context = { scope: ['frontend'] };
      expect(evaluateCondition('scope_includes_api', context)).toBe(false);
    });

    it('should return true for scope_includes_database when scope includes database', () => {
      const context = { scope: ['database'] };
      expect(evaluateCondition('scope_includes_database', context)).toBe(true);
    });

    it('should return true for scope_includes_frontend when scope includes frontend', () => {
      const context = { scope: ['frontend'] };
      expect(evaluateCondition('scope_includes_frontend', context)).toBe(true);
    });

    it('should return true for has_spec when context has spec', () => {
      const context = { has_spec: true };
      expect(evaluateCondition('has_spec', context)).toBe(true);
    });

    it('should return false for has_spec when context has no spec', () => {
      const context = { has_spec: false };
      expect(evaluateCondition('has_spec', context)).toBe(false);
    });

    it('should return true for has_tests when context has tests', () => {
      const context = { has_tests: true };
      expect(evaluateCondition('has_tests', context)).toBe(true);
    });

    it('should return true for is_hotfix when context is hotfix', () => {
      const context = { is_hotfix: true };
      expect(evaluateCondition('is_hotfix', context)).toBe(true);
    });

    it('should return false for unknown named condition', () => {
      const context = { scope: ['api'] };
      expect(evaluateCondition('unknown_condition', context)).toBe(false);
    });
  });

  // ============================================================
  // Level 2：屬性比對
  // ============================================================
  describe('Level 2: 屬性比對', () => {
    it('should match "includes" operator', () => {
      const condition = { scope: 'includes api' };
      const context = { scope: ['api', 'frontend'] };
      expect(evaluateCondition(condition, context)).toBe(true);
    });

    it('should not match "includes" when value absent', () => {
      const condition = { scope: 'includes database' };
      const context = { scope: ['api', 'frontend'] };
      expect(evaluateCondition(condition, context)).toBe(false);
    });

    it('should match "equals" operator', () => {
      const condition = { branch_type: 'equals feature' };
      const context = { branch_type: 'feature' };
      expect(evaluateCondition(condition, context)).toBe(true);
    });

    it('should not match "equals" when different', () => {
      const condition = { branch_type: 'equals feature' };
      const context = { branch_type: 'fix' };
      expect(evaluateCondition(condition, context)).toBe(false);
    });

    it('should match "matches" operator with glob pattern', () => {
      const condition = { files_changed: 'matches **/*.controller.js' };
      const context = { files_changed: ['src/api/user.controller.js', 'README.md'] };
      expect(evaluateCondition(condition, context)).toBe(true);
    });

    it('should not match "matches" when no files match glob', () => {
      const condition = { files_changed: 'matches **/*.controller.js' };
      const context = { files_changed: ['src/utils/helper.js'] };
      expect(evaluateCondition(condition, context)).toBe(false);
    });

    it('should require ALL conditions to match (AND semantics)', () => {
      const condition = {
        scope: 'includes api',
        branch_type: 'equals feature'
      };
      // 只滿足 scope，不滿足 branch_type
      const context = { scope: ['api'], branch_type: 'fix' };
      expect(evaluateCondition(condition, context)).toBe(false);
    });

    it('should return true when ALL conditions match', () => {
      const condition = {
        scope: 'includes api',
        branch_type: 'equals feature'
      };
      const context = { scope: ['api'], branch_type: 'feature' };
      expect(evaluateCondition(condition, context)).toBe(true);
    });
  });
});
