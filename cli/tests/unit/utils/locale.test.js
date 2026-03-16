import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { displayLanguageToLocale, isLocalizedLocale, detectLocaleFromStandards } from '../../../src/utils/locale.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/locale-test');

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

  describe('detectLocaleFromStandards', () => {
    beforeEach(() => {
      if (existsSync(TEST_DIR)) {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
      mkdirSync(TEST_DIR, { recursive: true });
    });

    afterEach(() => {
      if (existsSync(TEST_DIR)) {
        rmSync(TEST_DIR, { recursive: true, force: true });
      }
    });

    it('should return zh-TW when .standards/zh-tw.md exists', () => {
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });
      writeFileSync(join(standardsDir, 'zh-tw.md'), '# zh-TW locale');

      expect(detectLocaleFromStandards(TEST_DIR)).toBe('zh-TW');
    });

    it('should return zh-CN when .standards/zh-cn.md exists', () => {
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });
      writeFileSync(join(standardsDir, 'zh-cn.md'), '# zh-CN locale');

      expect(detectLocaleFromStandards(TEST_DIR)).toBe('zh-CN');
    });

    it('should return null when no locale file exists', () => {
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });

      expect(detectLocaleFromStandards(TEST_DIR)).toBeNull();
    });

    it('should return null when .standards directory does not exist', () => {
      expect(detectLocaleFromStandards(TEST_DIR)).toBeNull();
    });

    it('should return null when projectPath is null', () => {
      expect(detectLocaleFromStandards(null)).toBeNull();
    });
  });
});
