import { describe, it, expect } from 'vitest';
import { displayLanguageToLocale, isLocalizedLocale } from '../../../src/utils/locale.js';

describe('Locale Utils', () => {
  describe('displayLanguageToLocale', () => {
    it('should map zh-tw to zh-TW', () => {
      expect(displayLanguageToLocale('zh-tw')).toBe('zh-TW');
    });

    it('should map zh-cn to zh-CN', () => {
      expect(displayLanguageToLocale('zh-cn')).toBe('zh-CN');
    });

    it('should map en to en', () => {
      expect(displayLanguageToLocale('en')).toBe('en');
    });

    it('should handle uppercase input', () => {
      expect(displayLanguageToLocale('ZH-TW')).toBe('zh-TW');
    });

    it('should default to en for null', () => {
      expect(displayLanguageToLocale(null)).toBe('en');
    });

    it('should default to en for undefined', () => {
      expect(displayLanguageToLocale(undefined)).toBe('en');
    });

    it('should default to en for unknown language', () => {
      expect(displayLanguageToLocale('ja-jp')).toBe('en');
    });
  });

  describe('isLocalizedLocale', () => {
    it('should return true for zh-TW', () => {
      expect(isLocalizedLocale('zh-TW')).toBe(true);
    });

    it('should return true for zh-CN', () => {
      expect(isLocalizedLocale('zh-CN')).toBe(true);
    });

    it('should return false for en', () => {
      expect(isLocalizedLocale('en')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isLocalizedLocale(null)).toBeFalsy();
    });

    it('should return false for empty string', () => {
      expect(isLocalizedLocale('')).toBeFalsy();
    });
  });
});
