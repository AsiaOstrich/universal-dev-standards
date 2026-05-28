import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  lintCanonical,
  lintLocale,
  lintAll,
  partitionFindings,
} from '../../../src/lint/i18n.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/lint-i18n-test');

function makeUdsTree(root) {
  mkdirSync(join(root, 'skills'), { recursive: true });
  mkdirSync(join(root, 'core'), { recursive: true });
  mkdirSync(join(root, 'locales', 'zh-TW', 'skills'), { recursive: true });
  mkdirSync(join(root, 'locales', 'zh-TW', 'core'), { recursive: true });
}

describe('lint/i18n', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
  });

  // ---------------------------------------------------------------
  // lintCanonical
  // ---------------------------------------------------------------
  describe('lintCanonical', () => {
    it('flags canonical SKILL.md with CJK in description as error', () => {
      const skillPath = join(TEST_DIR, 'SKILL.md');
      writeFileSync(skillPath, [
        '---',
        'name: foo',
        'description: "[UDS] 建立架構決策記錄"',
        '---',
        '',
        '# Foo',
        '',
      ].join('\n'));

      const findings = lintCanonical(skillPath);
      const err = findings.find(f => f.rule === 'canonical:description-must-be-ascii');
      expect(err).toBeDefined();
      expect(err.severity).toBe('error');
      expect(err.line).toBeGreaterThan(0);
    });

    it('does not flag canonical SKILL.md with ASCII-only description', () => {
      const skillPath = join(TEST_DIR, 'SKILL.md');
      writeFileSync(skillPath, [
        '---',
        'name: foo',
        'description: "[UDS] Create architecture decision records"',
        '---',
        '',
        '# Foo',
        '',
      ].join('\n'));

      const findings = lintCanonical(skillPath);
      const err = findings.find(f => f.rule === 'canonical:description-must-be-ascii');
      expect(err).toBeUndefined();
    });

    it('warns when L3 body contains non-English example response in non-code fence', () => {
      const skillPath = join(TEST_DIR, 'SKILL.md');
      writeFileSync(skillPath, [
        '---',
        'name: foo',
        'description: "[UDS] Example skill"',
        '---',
        '',
        '# Foo',
        '',
        'Output template:',
        '',
        '```markdown',
        '## 結果',
        '請查閱範例',
        '```',
        '',
      ].join('\n'));

      const findings = lintCanonical(skillPath);
      const warn = findings.find(f => f.rule === 'canonical:l3-language-consistency');
      expect(warn).toBeDefined();
      expect(warn.severity).toBe('warn');
    });
  });

  // ---------------------------------------------------------------
  // lintLocale
  // ---------------------------------------------------------------
  describe('lintLocale', () => {
    it('flags locale variant missing source frontmatter as error', () => {
      const path = join(TEST_DIR, 'SKILL.md');
      writeFileSync(path, [
        '# 標題',
        '',
        '本檔案沒有 frontmatter。',
        '',
      ].join('\n'));

      const findings = lintLocale(path, 'zh-TW');
      const err = findings.find(f => f.rule === 'locale:must-have-source-frontmatter');
      expect(err).toBeDefined();
      expect(err.severity).toBe('error');
    });

    it('flags locale variant missing source_version field as error', () => {
      const path = join(TEST_DIR, 'SKILL.md');
      writeFileSync(path, [
        '---',
        'name: foo',
        'source: ../../skills/foo/SKILL.md',
        'translation_version: 1.0.0',
        'description: "[UDS] 範例技能"',
        '---',
        '',
        '# 標題',
      ].join('\n'));

      const findings = lintLocale(path, 'zh-TW');
      const err = findings.find(f => f.rule === 'locale:must-have-source-frontmatter');
      expect(err).toBeDefined();
      expect(err.message).toContain('source_version');
    });

    it('flags zh-TW locale variant with ASCII-only description as error', () => {
      const path = join(TEST_DIR, 'SKILL.md');
      writeFileSync(path, [
        '---',
        'name: foo',
        'source: ../../skills/foo/SKILL.md',
        'source_version: 1.0.0',
        'translation_version: 1.0.0',
        'description: "[UDS] Example skill"',
        '---',
        '',
        '# Title',
      ].join('\n'));

      const findings = lintLocale(path, 'zh-TW');
      const err = findings.find(f => f.rule === 'locale:description-must-match-language');
      expect(err).toBeDefined();
      expect(err.severity).toBe('error');
    });

    it('does not flag zh-TW locale variant with CJK description', () => {
      const path = join(TEST_DIR, 'SKILL.md');
      writeFileSync(path, [
        '---',
        'name: foo',
        'source: ../../skills/foo/SKILL.md',
        'source_version: 1.0.0',
        'translation_version: 1.0.0',
        'description: "[UDS] 範例技能"',
        '---',
        '',
        '# 標題',
      ].join('\n'));

      const findings = lintLocale(path, 'zh-TW');
      const langErr = findings.find(f => f.rule === 'locale:description-must-match-language');
      expect(langErr).toBeUndefined();
    });

    it('fires drift warning when translation_version lags > 2 minor versions', () => {
      // Set up a tree where source has version 1.5.0 and locale claims 1.2.0
      makeUdsTree(TEST_DIR);
      const srcPath = join(TEST_DIR, 'skills', 'foo', 'SKILL.md');
      mkdirSync(dirname(srcPath), { recursive: true });
      writeFileSync(srcPath, [
        '---',
        'name: foo',
        'description: "[UDS] Example skill"',
        'version: 1.5.0',
        '---',
        '',
        '# Foo',
      ].join('\n'));

      const localePath = join(TEST_DIR, 'locales', 'zh-TW', 'skills', 'foo', 'SKILL.md');
      mkdirSync(dirname(localePath), { recursive: true });
      writeFileSync(localePath, [
        '---',
        'name: foo',
        'source: ../../../../skills/foo/SKILL.md',
        'source_version: 1.2.0',
        'translation_version: 1.2.0',
        'description: "[UDS] 範例技能"',
        '---',
        '',
        '# 範例',
      ].join('\n'));

      const findings = lintLocale(localePath, 'zh-TW');
      const drift = findings.find(f => f.rule === 'translation-drift-warn');
      expect(drift).toBeDefined();
      expect(drift.severity).toBe('warn');
      expect(drift.message).toContain('1.5.0');
    });

    it('does not fire drift warning when versions are in sync', () => {
      makeUdsTree(TEST_DIR);
      const srcPath = join(TEST_DIR, 'skills', 'foo', 'SKILL.md');
      mkdirSync(dirname(srcPath), { recursive: true });
      writeFileSync(srcPath, [
        '---',
        'name: foo',
        'description: "[UDS] Example skill"',
        'version: 1.2.0',
        '---',
        '',
        '# Foo',
      ].join('\n'));

      const localePath = join(TEST_DIR, 'locales', 'zh-TW', 'skills', 'foo', 'SKILL.md');
      mkdirSync(dirname(localePath), { recursive: true });
      writeFileSync(localePath, [
        '---',
        'name: foo',
        'source: ../../../../skills/foo/SKILL.md',
        'source_version: 1.2.0',
        'translation_version: 1.2.0',
        'description: "[UDS] 範例技能"',
        '---',
        '',
        '# 範例',
      ].join('\n'));

      const findings = lintLocale(localePath, 'zh-TW');
      const drift = findings.find(f => f.rule === 'translation-drift-warn');
      expect(drift).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------
  // lintAll + partitionFindings
  // ---------------------------------------------------------------
  describe('lintAll', () => {
    it('returns empty findings for a clean tree', () => {
      makeUdsTree(TEST_DIR);
      mkdirSync(join(TEST_DIR, 'skills', 'foo'), { recursive: true });
      writeFileSync(join(TEST_DIR, 'skills', 'foo', 'SKILL.md'), [
        '---',
        'name: foo',
        'description: "[UDS] Example skill"',
        'version: 1.0.0',
        '---',
        '',
        '# Foo',
      ].join('\n'));

      const findings = lintAll({ projectPath: TEST_DIR });
      const { errors } = partitionFindings(findings);
      expect(errors).toEqual([]);
    });

    it('aggregates findings from canonical + locale tree', () => {
      makeUdsTree(TEST_DIR);
      // Canonical with CJK in description (error)
      const skillDir = join(TEST_DIR, 'skills', 'foo');
      mkdirSync(skillDir, { recursive: true });
      writeFileSync(join(skillDir, 'SKILL.md'), [
        '---',
        'name: foo',
        'description: "[UDS] 範例技能"',
        '---',
        '',
        '# Foo',
      ].join('\n'));

      // Locale missing frontmatter (error)
      const localeSkillDir = join(TEST_DIR, 'locales', 'zh-TW', 'skills', 'foo');
      mkdirSync(localeSkillDir, { recursive: true });
      writeFileSync(join(localeSkillDir, 'SKILL.md'), '# 沒有 frontmatter\n');

      const findings = lintAll({ projectPath: TEST_DIR });
      const { errors } = partitionFindings(findings);
      expect(errors.length).toBeGreaterThanOrEqual(2);
      expect(errors.some(e => e.rule === 'canonical:description-must-be-ascii')).toBe(true);
      expect(errors.some(e => e.rule === 'locale:must-have-source-frontmatter')).toBe(true);
    });
  });
});
