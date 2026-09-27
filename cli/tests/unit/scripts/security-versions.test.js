// Regression tests for scripts/lib/security-versions.mjs — the SECURITY.md
// "Supported Versions" table generator shared by scripts/bump-version.mjs and
// scripts/generate-docs.mjs.
//
// Root cause under test: bump-version.mjs used to carry its own regex patch
// that found "the row with a bare X.Y.Z version" to identify the "Latest
// stable" row. On a pre-release -> pre-release bump (6.13.0-beta.1 ->
// 6.13.0-beta.2, the actual 2026-09-26 incident) the new version itself has a
// hyphen and never matches "bare X.Y.Z", so the patch fell through to the
// unrelated stable row and overwrote ITS version with the new pre-release
// version, leaving the stale pre-release row untouched. Fixed by generating
// the whole block from (version, stableVersion) instead of patching one
// matched row in place — these tests exercise all four version-type
// transitions across all three shipped languages, writing to temp file
// copies only (never the repo's real SECURITY.md files).

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  buildSecurityTables,
  syncSecurityVersions,
  detectLang
} from '../../../../scripts/lib/security-versions.mjs';

const MARKER_START = '<!-- UDS_SUPPORTED_VERSIONS_START -->';
const MARKER_END = '<!-- UDS_SUPPORTED_VERSIONS_END -->';

function wrapBlock(body) {
  return `# Security Policy\n\n${MARKER_START}\n${body}\n${MARKER_END}\n\n## Rest of file\n`;
}

function stableOnlyBody(version) {
  return `| Version | Supported | 支援狀態 |\n|---------|-----------|--------|\n| ${version} | ✅ Latest stable | 最新正式版 |\n| < ${version.split('.')[0]}.0.0 | ❌ End of life | 已終止支援 |`;
}

function prereleaseBody(preVersion, stableVersion) {
  return `| Version | Supported | 支援狀態 |\n|---------|-----------|--------|\n| ${preVersion} | ✅ Pre-release | 預發布版本 |\n| ${stableVersion} | ✅ Latest stable | 最新正式版 |\n| < ${stableVersion.split('.')[0]}.0.0 | ❌ End of life | 已終止支援 |`;
}

/** Extract the row whose label matches, from a written file's table block. */
function findRow(content, labelPattern) {
  const lines = content.split('\n');
  return lines.find((l) => labelPattern.test(l));
}

function rowVersion(row) {
  if (!row) return undefined;
  return row.replace(/^\|\s*/, '').replace(/\s*\|.*/, '');
}

describe('security-versions: buildSecurityTables()', () => {
  it('produces three languages, no missing key', () => {
    const tables = buildSecurityTables('6.13.0', '6.12.0');
    expect(Object.keys(tables).sort()).toEqual(['cn', 'en', 'zh']);
    for (const lang of ['en', 'zh', 'cn']) {
      expect(tables[lang]).toContain('6.13.0');
    }
  });

  it('detectLang reads zh-TW / zh-CN from the path, defaults to en', () => {
    expect(detectLang('/x/locales/zh-TW/SECURITY.md')).toBe('zh');
    expect(detectLang('/x/locales/zh-CN/SECURITY.md')).toBe('cn');
    expect(detectLang('/x/SECURITY.md')).toBe('en');
  });
});

describe('security-versions: syncSecurityVersions() — four version-type transitions', () => {
  let dir;
  let files; // { en, zhTW, zhCN }

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'uds-security-versions-'));
    files = {
      en: join(dir, 'SECURITY.md'),
      zhTW: join(dir, 'zh-TW-SECURITY.md'),
      zhCN: join(dir, 'zh-CN-SECURITY.md')
    };
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function seed(bodyBuilder) {
    writeFileSync(files.en, wrapBlock(bodyBuilder('en')), 'utf8');
    writeFileSync(files.zhTW, wrapBlock(bodyBuilder('zh')), 'utf8');
    writeFileSync(files.zhCN, wrapBlock(bodyBuilder('cn')), 'utf8');
  }

  function run(version, stableVersion) {
    return syncSecurityVersions(version, stableVersion, [files.en, files.zhTW, files.zhCN]);
  }

  it('stable -> stable: replaces the single stable row, no pre-release row appears', () => {
    seed(() => stableOnlyBody('6.12.0'));
    const results = run('6.13.0', '6.12.0');
    expect(results.every((r) => r.status === 'ok')).toBe(true);

    for (const path of [files.en, files.zhTW, files.zhCN]) {
      const content = readFileSync(path, 'utf8');
      expect(content).toMatch(/6\.13\.0.*✅.*(Latest stable|最新正式版)/);
      expect(content).not.toMatch(/Pre-release|預發布版本|预发布版本/);
      expect(content).not.toContain('6.12.0'); // old stable version fully gone
    }
  });

  it('stable -> pre-release: adds a pre-release row, leaves the stable row untouched', () => {
    seed(() => stableOnlyBody('6.12.0'));
    const results = run('6.13.0-beta.1', '6.12.0');
    expect(results.every((r) => r.status === 'ok')).toBe(true);

    for (const path of [files.en, files.zhTW, files.zhCN]) {
      const content = readFileSync(path, 'utf8');
      const preRow = findRow(content, /Pre-release|預發布版本|预发布版本/);
      const stableRow = findRow(content, /Latest stable|最新正式版/);
      expect(rowVersion(preRow)).toBe('6.13.0-beta.1');
      expect(rowVersion(stableRow)).toBe('6.12.0');
    }
  });

  it('pre-release -> pre-release: replaces ONLY the pre-release row; the stable row must not change (the 6.13.0-beta.2 regression)', () => {
    seed(() => prereleaseBody('6.13.0-beta.1', '6.12.0'));
    const results = run('6.13.0-beta.2', '6.12.0');
    expect(results.every((r) => r.status === 'ok')).toBe(true);

    for (const path of [files.en, files.zhTW, files.zhCN]) {
      const content = readFileSync(path, 'utf8');
      const preRow = findRow(content, /Pre-release|預發布版本|预发布版本/);
      const stableRow = findRow(content, /Latest stable|最新正式版/);

      // The defect: the stable row's version got overwritten with the new
      // pre-release version while its label stayed "Latest stable".
      expect(rowVersion(stableRow)).toBe('6.12.0');
      expect(rowVersion(stableRow)).not.toContain('-');

      // The defect's other half: the pre-release row was left stale.
      expect(rowVersion(preRow)).toBe('6.13.0-beta.2');
      expect(rowVersion(preRow)).not.toBe('6.13.0-beta.1');
    }
  });

  it('pre-release -> stable: removes the pre-release row, stable row becomes the new version', () => {
    seed(() => prereleaseBody('6.13.0-beta.2', '6.12.0'));
    const results = run('6.13.0', '6.12.0');
    expect(results.every((r) => r.status === 'ok')).toBe(true);

    for (const path of [files.en, files.zhTW, files.zhCN]) {
      const content = readFileSync(path, 'utf8');
      expect(content).not.toMatch(/Pre-release|預發布版本|预发布版本/);
      expect(content).not.toContain('beta');
      const stableRow = findRow(content, /Latest stable|最新正式版/);
      expect(rowVersion(stableRow)).toBe('6.13.0');
    }
  });

  it('reports "skip" for a missing file and "no-match" for a file with no marker block, without touching the untouched files', () => {
    seed(() => stableOnlyBody('6.12.0'));
    const missing = join(dir, 'does-not-exist.md');
    const noMarker = join(dir, 'no-marker.md');
    writeFileSync(noMarker, '# no marker block here\n', 'utf8');

    const results = syncSecurityVersions('6.13.0', '6.12.0', [files.en, missing, noMarker]);
    expect(results[0].status).toBe('ok');
    expect(results[1].status).toBe('skip');
    expect(results[2].status).toBe('no-match');
    expect(existsSync(missing)).toBe(false);
    expect(readFileSync(noMarker, 'utf8')).toBe('# no marker block here\n');
  });
});
