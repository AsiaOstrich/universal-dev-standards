// [Source: docs/specs/SPEC-HOOKS-001-core-standard-hooks.md]
// [Generated] TDD skeleton for check-logging-standard.js
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect } from 'vitest';

import { hasUnstructuredLogging } from '../../../../scripts/hooks/check-logging-standard.js';

describe('SPEC-HOOKS-001 / REQ-3: 結構化日誌檢查 Hook', () => {
  // [Source: SPEC-HOOKS-001:REQ-3]

  describe('非結構化日誌被標記', () => {
    it('should flag console.log calls', () => {
      // Arrange
      const code = 'console.log("debug info");';
      // Act
      const result = hasUnstructuredLogging(code);
      // Assert
      expect(result).toBe(true);
    });

    it('should flag console.warn calls', () => {
      expect(hasUnstructuredLogging('console.warn("warning");')).toBe(true);
    });

    it('should flag console.error calls', () => {
      expect(hasUnstructuredLogging('console.error("error");')).toBe(true);
    });

    it('should flag console.info calls', () => {
      expect(hasUnstructuredLogging('console.info("info");')).toBe(true);
    });

    it('should flag console.debug calls', () => {
      expect(hasUnstructuredLogging('console.debug("debug");')).toBe(true);
    });
  });

  describe('結構化日誌通過檢查', () => {
    it('should pass code using logger.info with JSON', () => {
      // Arrange
      const code = 'logger.info({ event: "startup", duration: 150 });';
      // Act
      const result = hasUnstructuredLogging(code);
      // Assert
      expect(result).toBe(false);
    });

    it('should pass code with no logging calls', () => {
      const code = 'const x = 1 + 2;';
      expect(hasUnstructuredLogging(code)).toBe(false);
    });

    it('should pass code using structured winston logger', () => {
      const code = 'winston.log("info", { message: "started", timestamp: Date.now() });';
      expect(hasUnstructuredLogging(code)).toBe(false);
    });
  });
});
