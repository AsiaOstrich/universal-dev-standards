/**
 * Tests for SHARED-08: i18n System Specification
 * Generated from: docs/specs/cli/shared/i18n-system.md
 * Generated at: 2026-01-25T00:00:00Z
 * AC Coverage: AC-1, AC-2, AC-3, AC-4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  messages,
  setLanguage,
  setLanguageExplicit,
  isLanguageExplicitlySet,
  getLanguage,
  t,
  msg,
  detectLanguage
} from '../../../src/i18n/messages.js';

describe('SHARED-08: i18n System Specification', () => {
  // Reset state before each test
  beforeEach(() => {
    setLanguage('en');
  });

  describe('AC-1: Language Setting Switches All Messages', () => {
    it('should return zh-tw when setLanguage is called with zh-tw', () => {
      // Arrange
      expect(getLanguage()).toBe('en'); // Initial state

      // Act
      setLanguage('zh-tw');

      // Assert
      expect(getLanguage()).toBe('zh-tw');
    });

    it('should return Traditional Chinese messages object after language switch', () => {
      // Arrange
      setLanguage('zh-tw');

      // Act
      const msgs = t();

      // Assert
      expect(msgs).toBe(messages['zh-tw']);
      expect(msgs.recommended).toBe('推薦');
    });

    it('should return Traditional Chinese strings for all msg() calls', () => {
      // Arrange
      setLanguage('zh-tw');

      // Act
      const title = msg('contentMode.title');

      // Assert - After SPEC-004 i18n cleanup, titles are translated
      expect(title).toBe('內容模式:');
    });

    it('should fall back to en for invalid language code', () => {
      // Arrange & Act
      setLanguage('invalid-lang');

      // Assert
      expect(getLanguage()).toBe('en');
    });
  });

  describe('AC-2: msg() Correctly Handles Nested Path Lookup', () => {
    it('should traverse nested path and return correct value', () => {
      // Arrange
      setLanguage('en');

      // Act
      const result = msg('commands.init.title');

      // Assert
      expect(result).toBe('Universal Development Standards - Initialize');
    });

    it('should return undefined for non-existent paths', () => {
      // Arrange
      setLanguage('en');

      // Act
      const result = msg('nonexistent.path.here');

      // Assert
      expect(result).toBeUndefined();
    });

    it('should handle partial valid paths', () => {
      // Arrange
      setLanguage('en');

      // Act
      const result = msg('contentMode');

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should return undefined when path goes through non-object', () => {
      // Arrange
      setLanguage('en');

      // Act - 'recommended' is a string, not an object
      const result = msg('recommended.nested');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('AC-3: Missing Key Returns Fallback Gracefully', () => {
    it('should fall back to English when language not found', () => {
      // Arrange - Force an invalid language in internal state
      // This tests the t() fallback behavior

      // Act
      setLanguage('nonexistent');
      const msgs = t();

      // Assert
      expect(msgs).toBe(messages.en);
    });

    it('should not throw errors for missing keys', () => {
      // Arrange
      setLanguage('zh-tw');

      // Act & Assert - Should not throw
      expect(() => msg('this.does.not.exist')).not.toThrow();
    });

    it('should return undefined for partial paths without crashing', () => {
      // Arrange
      setLanguage('en');

      // Act
      const result = msg('commands.nonexistent.deeply.nested');

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('AC-4: detectLanguage Handles Locale Formats Correctly', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
      // Restore environment
      process.env = { ...originalEnv };
    });

    it('should return zh-tw for explicit zh-tw locale', () => {
      // Arrange & Act
      const result = detectLanguage('zh-tw');

      // Assert
      expect(result).toBe('zh-tw');
    });

    it('should return zh-cn for explicit zh-cn locale', () => {
      // Arrange & Act
      const result = detectLanguage('zh-cn');

      // Assert
      expect(result).toBe('zh-cn');
    });

    it('should return en for null locale with no env vars', () => {
      // Arrange
      delete process.env.LANG;
      delete process.env.LC_ALL;
      delete process.env.LC_MESSAGES;

      // Act
      const result = detectLanguage(null);

      // Assert
      expect(result).toBe('en');
    });

    it('should detect zh-tw from LANG environment variable', () => {
      // Arrange
      process.env.LANG = 'zh_TW.UTF-8';

      // Act
      const result = detectLanguage(null);

      // Assert
      expect(result).toBe('zh-tw');
    });

    it('should detect zh-cn from LANG environment variable', () => {
      // Arrange
      process.env.LANG = 'zh_CN.UTF-8';

      // Act
      const result = detectLanguage(null);

      // Assert
      expect(result).toBe('zh-cn');
    });

    it('should detect language from LC_ALL when LANG not set', () => {
      // Arrange
      delete process.env.LANG;
      process.env.LC_ALL = 'zh_TW.UTF-8';

      // Act
      const result = detectLanguage(null);

      // Assert
      expect(result).toBe('zh-tw');
    });

    it('should return en when env vars contain non-Chinese locale', () => {
      // Arrange
      process.env.LANG = 'en_US.UTF-8';

      // Act
      const result = detectLanguage(null);

      // Assert
      expect(result).toBe('en');
    });
  });

  describe('Additional: setLanguageExplicit and isLanguageExplicitlySet', () => {
    it('should mark language as explicitly set', () => {
      // Arrange
      expect(isLanguageExplicitlySet()).toBe(false);

      // Act
      setLanguageExplicit('zh-tw');

      // Assert
      expect(isLanguageExplicitlySet()).toBe(true);
      expect(getLanguage()).toBe('zh-tw');
    });
  });
});
