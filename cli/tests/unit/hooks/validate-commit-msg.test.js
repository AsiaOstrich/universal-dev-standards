// [Source: docs/specs/SPEC-HOOKS-001-core-standard-hooks.md]
// [Generated] TDD skeleton for validate-commit-msg.js
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect } from 'vitest';

import { validateCommitMessage } from '../../../../scripts/hooks/validate-commit-msg.js';

describe('SPEC-HOOKS-001 / REQ-1: Commit Message 驗證 Hook', () => {
  // [Source: SPEC-HOOKS-001:AC-2]

  describe('AC-2: 合規的 commit message 通過驗證', () => {
    it('should accept "feat(core): add hook support"', () => {
      // Arrange
      const msg = 'feat(core): add hook support';
      // Act
      const result = validateCommitMessage(msg);
      // Assert
      expect(result).toBe(true);
    });

    it('should accept "fix: resolve crash on startup"', () => {
      // Arrange
      const msg = 'fix: resolve crash on startup';
      // Act
      const result = validateCommitMessage(msg);
      // Assert
      expect(result).toBe(true);
    });

    it('should accept "docs(readme): update installation guide"', () => {
      const msg = 'docs(readme): update installation guide';
      expect(validateCommitMessage(msg)).toBe(true);
    });
  });

  describe('AC-2: 不合規的 commit message 被攔截', () => {
    it('should reject "bad message"', () => {
      // Arrange
      const msg = 'bad message';
      // Act
      const result = validateCommitMessage(msg);
      // Assert
      expect(result).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateCommitMessage('')).toBe(false);
    });

    it('should reject message without colon separator', () => {
      expect(validateCommitMessage('feat add something')).toBe(false);
    });

    it('should reject message with invalid type', () => {
      expect(validateCommitMessage('invalid(scope): some message')).toBe(false);
    });

    it('should reject message without space after colon', () => {
      expect(validateCommitMessage('feat:no space')).toBe(false);
    });
  });

  describe('AC-2: 支援所有標準 commit type', () => {
    const validTypes = [
      'feat', 'fix', 'docs', 'chore', 'test',
      'refactor', 'style', 'perf', 'ci', 'build', 'revert',
    ];

    validTypes.forEach((type) => {
      it(`should accept type "${type}"`, () => {
        // Arrange
        const msg = `${type}(scope): description`;
        // Act & Assert
        expect(validateCommitMessage(msg)).toBe(true);
      });
    });
  });
});
