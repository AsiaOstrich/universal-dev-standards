// Integration test for the SECURITY.md label-aware check added to
// scripts/check-version-sync.sh (2026-09-26 incident: a "Latest stable" row
// silently ended up holding a pre-release-looking version). The pre-existing
// check only compared the FIRST data row's version against package.json's
// version — a position-based proxy that happened to catch that specific
// incident (the stale pre-release row no longer matched), but never verified
// that a row's LABEL matches its OWN version's shape. This test constructs a
// case the position check cannot catch (both rows hold the same version, so
// position matches) to prove the label check is doing independent work, not
// just restating the position check.
//
// check-version-sync.sh resolves its ROOT_DIR from its own script location
// (`dirname "${BASH_SOURCE[0]}"`), not from cwd — so to run it in isolation
// this test copies the real script into a throwaway fixture tree's own
// scripts/ directory, alongside minimal cli/package.json +
// cli/standards-registry.json (required — the script exits before reaching
// the SECURITY.md section without them) and the SECURITY.md files under
// test. Every other file the real script optionally checks (package-lock,
// plugin/marketplace, uds-manifest, READMEs, locale CHANGELOGs) is left out
// on purpose: the script treats those as [SKIP] when absent, so omitting
// them keeps this fixture from asserting anything about sections unrelated
// to this test.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'child_process';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, cpSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REAL_SCRIPT = join(__dirname, '../../../../scripts/check-version-sync.sh');

const MARKER_START = '<!-- UDS_SUPPORTED_VERSIONS_START -->';
const MARKER_END = '<!-- UDS_SUPPORTED_VERSIONS_END -->';

function securityBody(rows) {
  return [
    '| Version | Supported | 支援狀態 |',
    '|---------|-----------|--------|',
    ...rows,
    '| < 6.0.0 | ❌ End of life | 已終止支援 |'
  ].join('\n');
}

function writeSecurityFile(path, rows) {
  writeFileSync(path, `# Security\n\n${MARKER_START}\n${securityBody(rows)}\n${MARKER_END}\n`, 'utf8');
}

describe('check-version-sync.sh: SECURITY.md label-aware check', () => {
  let dir;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'uds-check-version-sync-'));
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    mkdirSync(join(dir, 'cli'), { recursive: true });
    mkdirSync(join(dir, 'locales', 'zh-TW'), { recursive: true });
    mkdirSync(join(dir, 'locales', 'zh-CN'), { recursive: true });

    cpSync(REAL_SCRIPT, join(dir, 'scripts', 'check-version-sync.sh'));

    writeFileSync(
      join(dir, 'cli', 'package.json'),
      JSON.stringify({ name: 'fixture', version: '6.13.0-beta.2' }, null, 2),
      'utf8'
    );
    writeFileSync(
      join(dir, 'cli', 'standards-registry.json'),
      JSON.stringify(
        {
          version: '6.13.0-beta.2',
          repositories: {
            standards: { version: '6.13.0-beta.2' },
            skills: { version: '6.13.0-beta.2' }
          }
        },
        null,
        2
      ),
      'utf8'
    );
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function seedAllThree(rows) {
    writeSecurityFile(join(dir, 'SECURITY.md'), rows);
    writeSecurityFile(join(dir, 'locales', 'zh-TW', 'SECURITY.md'), rows);
    writeSecurityFile(join(dir, 'locales', 'zh-CN', 'SECURITY.md'), rows);
  }

  // eslint-disable-next-line no-control-regex
  const ANSI = /\x1b\[[0-9;]*m/g;

  function runChecker() {
    try {
      const stdout = execFileSync('bash', [join(dir, 'scripts', 'check-version-sync.sh')], {
        encoding: 'utf8'
      });
      return { status: 0, output: stdout.replace(ANSI, '') };
    } catch (err) {
      return { status: err.status, output: ((err.stdout || '') + (err.stderr || '')).replace(ANSI, '') };
    }
  }

  it('passes on a correctly labeled pre-release table', () => {
    seedAllThree(['| 6.13.0-beta.2 | ✅ Pre-release | 預發布版本 |', '| 6.12.0 | ✅ Latest stable | 最新正式版 |']);
    const { status, output } = runChecker();
    expect(status).toBe(0);
    expect(output).toContain('All versions are in sync!');
  });

  it('flags the 2026-09-26 shape: Latest stable row holding a pre-release version, even though the FIRST row already fails the position check', () => {
    // Reproduces the actual incident's file shape exactly: stale pre-release
    // row (still beta.1) + stable row corrupted to the new beta.2.
    seedAllThree(['| 6.13.0-beta.1 | ✅ Pre-release | 預發布版本 |', '| 6.13.0-beta.2 | ✅ Latest stable | 最新正式版 |']);
    const { status, output } = runChecker();
    expect(status).toBe(1);
    expect(output).toMatch(/row labeled Latest stable.*pre-release-looking version/);
  });

  it('flags a mislabeled table the POSITION-based check alone would miss (both rows hold the same version)', () => {
    // Position check passes here: the first data row's version (6.13.0-beta.2)
    // matches package.json's version. Only the label-aware check can catch
    // that the second row's "Latest stable" label sits on a pre-release
    // version.
    seedAllThree(['| 6.13.0-beta.2 | ✅ Pre-release | 預發布版本 |', '| 6.13.0-beta.2 | ✅ Latest stable | 最新正式版 |']);
    const { status, output } = runChecker();
    expect(status).toBe(1);
    expect(output).toMatch(/SECURITY\.md version: 6\.13\.0-beta\.2\n/); // position check itself reports OK
    expect(output).toContain('[OK]     SECURITY.md version: 6.13.0-beta.2');
    expect(output).toMatch(/row labeled Latest stable.*pre-release-looking version/);
  });

  it('flags the reverse mislabel: Pre-release row holding a non-pre-release version', () => {
    seedAllThree(['| 6.13.0 | ✅ Pre-release | 預發布版本 |', '| 6.12.0 | ✅ Latest stable | 最新正式版 |']);
    const { output } = runChecker();
    expect(output).toMatch(/row labeled Pre-release.*version with no pre-release suffix/);
  });

  it('checks all three shipped languages independently', () => {
    writeSecurityFile(join(dir, 'SECURITY.md'), ['| 6.13.0-beta.2 | ✅ Pre-release | 預發布版本 |', '| 6.12.0 | ✅ Latest stable | 最新正式版 |']);
    // Only the zh-TW file is mislabeled.
    writeSecurityFile(join(dir, 'locales', 'zh-TW', 'SECURITY.md'), [
      '| 6.13.0-beta.2 | ✅ 預發布版本 |',
      '| 6.13.0-beta.2 | ✅ 最新正式版 |'
    ]);
    writeSecurityFile(join(dir, 'locales', 'zh-CN', 'SECURITY.md'), ['| 6.13.0-beta.2 | ✅ 预发布版本 |', '| 6.12.0 | ✅ 最新正式版 |']);

    const { status, output } = runChecker();
    expect(status).toBe(1);
    expect(output).toContain('locales/zh-TW/SECURITY.md: row labeled Latest stable/最新正式版');
    expect(output).not.toContain('locales/zh-CN/SECURITY.md: row labeled');
  });
});
