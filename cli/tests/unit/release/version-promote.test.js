/**
 * Tests for SPEC-RELEASE-01: Version Promote Utilities
 * AC Coverage: AC-2 (RC Lifecycle), AC-3 (RC Promotion)
 * [Source: docs/specs/system/SPEC-RELEASE-01-manual-deployment-mode.md]
 */

import { describe, it, expect } from 'vitest';
import {
  parseRCVersion,
  incrementRC,
  promoteVersion,
  formatGitTag,
  createPromotionRecord,
} from '../../../src/utils/version-promote.js';

describe('version-promote', () => {
  // ============================================================
  // AC-2: RC Version Lifecycle
  // ============================================================

  describe('parseRCVersion', () => {
    it('should parse valid RC version string', () => {
      // Arrange
      const version = '1.2.0-rc.1';

      // Act
      const parsed = parseRCVersion(version);

      // Assert
      expect(parsed.major).toBe(1);
      expect(parsed.minor).toBe(2);
      expect(parsed.patch).toBe(0);
      expect(parsed.preRelease).toBe('rc');
      expect(parsed.preReleaseNumber).toBe(1);
    });

    it('should parse v-prefixed RC version', () => {
      const parsed = parseRCVersion('v1.2.0-rc.1');
      expect(parsed.major).toBe(1);
      expect(parsed.preRelease).toBe('rc');
      expect(parsed.preReleaseNumber).toBe(1);
    });

    it('should parse RC with high iteration number', () => {
      // Arrange
      const version = '3.10.5-rc.15';

      // Act
      const parsed = parseRCVersion(version);

      // Assert
      expect(parsed.major).toBe(3);
      expect(parsed.minor).toBe(10);
      expect(parsed.patch).toBe(5);
      expect(parsed.preReleaseNumber).toBe(15);
    });

    it('should return null for non-RC version', () => {
      // Arrange
      const version = '1.2.0';

      // Act
      const parsed = parseRCVersion(version);

      // Assert
      expect(parsed).toBeNull();
    });

    it('should return null for beta version', () => {
      // Arrange
      const version = '1.2.0-beta.1';

      // Act
      const parsed = parseRCVersion(version);

      // Assert
      expect(parsed).toBeNull();
    });

    it('should throw for invalid format', () => {
      // Arrange & Act & Assert
      expect(() => parseRCVersion('not-a-version')).toThrow();
    });
  });

  describe('incrementRC', () => {
    it('should increment rc.1 to rc.2', () => {
      // Arrange
      const current = '1.2.0-rc.1';

      // Act
      const next = incrementRC(current);

      // Assert
      expect(next).toBe('1.2.0-rc.2');
    });

    it('should increment rc.9 to rc.10', () => {
      // Arrange
      const current = '1.2.0-rc.9';

      // Act
      const next = incrementRC(current);

      // Assert
      expect(next).toBe('1.2.0-rc.10');
    });

    it('should throw for non-RC version', () => {
      // Arrange & Act & Assert
      expect(() => incrementRC('1.2.0')).toThrow();
    });
  });

  describe('formatGitTag', () => {
    it('should add v prefix to version', () => {
      // Arrange & Act & Assert
      expect(formatGitTag('1.2.0-rc.1')).toBe('v1.2.0-rc.1');
    });

    it('should add v prefix to stable version', () => {
      // Arrange & Act & Assert
      expect(formatGitTag('1.2.0')).toBe('v1.2.0');
    });

    it('should not double-prefix if already has v', () => {
      // Arrange & Act & Assert
      expect(formatGitTag('v1.2.0')).toBe('v1.2.0');
    });
  });

  // ============================================================
  // AC-3: RC Promotion to Stable
  // ============================================================

  describe('promoteVersion', () => {
    it('should strip rc suffix to produce stable version', () => {
      // Arrange
      const rcVersion = '1.2.0-rc.2';

      // Act
      const stable = promoteVersion(rcVersion);

      // Assert
      expect(stable).toBe('1.2.0');
    });

    it('should strip rc.1 suffix', () => {
      // Arrange & Act & Assert
      expect(promoteVersion('3.0.0-rc.1')).toBe('3.0.0');
    });

    it('should throw for non-RC version', () => {
      // Arrange & Act & Assert
      expect(() => promoteVersion('1.2.0')).toThrow();
    });

    it('should throw for beta version', () => {
      // Arrange & Act & Assert
      expect(() => promoteVersion('1.2.0-beta.1')).toThrow();
    });
  });

  describe('createPromotionRecord', () => {
    it('should record promotion source and target', () => {
      // Arrange
      const from = '1.2.0-rc.2';
      const to = '1.2.0';

      // Act
      const record = createPromotionRecord(from, to);

      // Assert
      expect(record.promoted_from).toBe('1.2.0-rc.2');
      expect(record.version).toBe('1.2.0');
      expect(record).toHaveProperty('promoted_at');
    });
  });
});
