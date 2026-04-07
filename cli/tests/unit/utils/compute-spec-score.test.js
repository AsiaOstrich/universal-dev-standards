// [Source: specs/superspec-borrowing-phase1-2-spec.md]
// [Generated] TDD tests for computeSpecScore — AC-14, AC-15

import { describe, it, expect } from 'vitest';
import { StandardValidator } from '../../../src/utils/standard-validator.js';

function makeStandardSpec() {
  return {
    specMode: 'standard',
    title: 'Login Feature',
    intent: 'Allow users to authenticate with email and password',
    scope: 'cli/src/auth.js',
    type: 'feature',
    acceptance: [
      '[ ] AC-1: Login succeeds with valid credentials',
      '[ ] AC-2: Login fails with invalid password',
    ],
    dependsOn: ['SPEC-001'],
    notes: 'This addresses the auth redesign',
    // Fields used for scoring heuristics:
    confirmed: true,
  };
}

function makeBoostSpec() {
  return {
    ...makeStandardSpec(),
    specMode: 'boost',
    approach: 'conventional',
    // Boost-mode content sections (simulated as non-empty strings):
    motivation: 'Users need secure authentication to protect account data',
    detailedDesign: 'Use bcrypt for password hashing, JWT for session tokens',
    risks: [{ risk: 'Token leakage', impact: 'high', mitigation: 'Short TTL' }],
    openQuestions: [],
    // Additional boost fields for cross-validation:
    userStories: ['As a user, I want to login'],
    nonFunctionalRequirements: ['Response time < 200ms'],
    edgeCases: ['Empty password', 'Unicode email'],
    dataModelChanges: 'Add sessions table',
    tasks: [
      { description: 'Implement login endpoint', filePath: 'cli/src/auth.js' },
      { description: 'Add password validation', filePath: 'cli/src/auth.js' },
    ],
  };
}

describe('XSPEC-005 AC-14+15: computeSpecScore()', () => {
  const validator = new StandardValidator('.');

  // ─── AC-14: standard mode /10 ───

  describe('AC-14: standard mode returns /10 score', () => {
    it('should return maxScore of 10', () => {
      // Arrange
      const spec = makeStandardSpec();

      // Act
      const result = validator.computeSpecScore(spec, 'standard');

      // Assert
      expect(result.maxScore).toBe(10);
    });

    it('should return exactly 10 checklist items', () => {
      // Arrange
      const spec = makeStandardSpec();

      // Act
      const result = validator.computeSpecScore(spec, 'standard');

      // Assert
      expect(result.items).toHaveLength(10);
    });

    it('should return score ≤ maxScore', () => {
      // Arrange
      const spec = makeStandardSpec();

      // Act
      const result = validator.computeSpecScore(spec, 'standard');

      // Assert
      expect(result.score).toBeLessThanOrEqual(result.maxScore);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should score higher for a well-formed spec', () => {
      // Arrange
      const goodSpec = makeStandardSpec();
      const bareSpec = { specMode: 'standard', title: '', intent: '', acceptance: [] };

      // Act
      const goodResult = validator.computeSpecScore(goodSpec, 'standard');
      const bareResult = validator.computeSpecScore(bareSpec, 'standard');

      // Assert
      expect(goodResult.score).toBeGreaterThan(bareResult.score);
    });

    it('should include passed boolean for each item', () => {
      // Arrange
      const spec = makeStandardSpec();

      // Act
      const result = validator.computeSpecScore(spec, 'standard');

      // Assert
      for (const item of result.items) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('passed');
        expect(typeof item.passed).toBe('boolean');
      }
    });
  });

  // ─── AC-15: boost mode /25 ───

  describe('AC-15: boost mode returns /25 score', () => {
    it('should return maxScore of 25', () => {
      // Arrange
      const spec = makeBoostSpec();

      // Act
      const result = validator.computeSpecScore(spec, 'boost');

      // Assert
      expect(result.maxScore).toBe(25);
    });

    it('should return exactly 25 checklist items', () => {
      // Arrange
      const spec = makeBoostSpec();

      // Act
      const result = validator.computeSpecScore(spec, 'boost');

      // Assert
      expect(result.items).toHaveLength(25);
    });

    it('should include the standard 10 items plus 15 boost items', () => {
      // Arrange
      const spec = makeBoostSpec();

      // Act
      const result = validator.computeSpecScore(spec, 'boost');

      // Assert — first 10 IDs should match standard, items 11-25 are boost-specific
      expect(result.items[0].id).toBe(1);
      expect(result.items[9].id).toBe(10);
      expect(result.items[10].id).toBe(11);
      expect(result.items[24].id).toBe(25);
    });

    it('should score higher than standard maxScore for a well-formed boost spec', () => {
      // Arrange
      const spec = makeBoostSpec();

      // Act
      const result = validator.computeSpecScore(spec, 'boost');

      // Assert
      expect(result.score).toBeGreaterThan(10); // should beat standard max
    });

    it('should default to standard mode when specMode not specified', () => {
      // Arrange
      const spec = makeStandardSpec();

      // Act
      const result = validator.computeSpecScore(spec);

      // Assert
      expect(result.maxScore).toBe(10);
    });
  });
});
