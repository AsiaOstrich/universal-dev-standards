/**
 * The installed-standards index said "options 0" on every project.
 *
 * Reported 2026-09-16 by an adopter upgrading a .NET Framework project on
 * Windows: their CLAUDE.md read "73 條（core 76、options 0）" while the manifest
 * held 73 standards of which 7 were options. Reproduced on a clean 6.9.0 install
 * here, so it is not an artefact of their upgrade path.
 *
 * `generateStandardsIndex` classifies an entry as an option by looking for an
 * `/options/` segment in its path — and `uds init` handed it basenames
 * (`init.js`: `standardsResults.standards.map(s => basename(s))`), which is
 * precisely the reduction `buildToolIntegrationConfig`'s own docblock warns
 * against. `contentLayout: flat` installs option files with no directory at all,
 * so nothing downstream can recover the distinction once it is gone.
 *
 * This test asserts the user-visible sentence, not the intermediate list,
 * because the intermediate list is where the bug hid for two releases.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { mkdir, readFile } from 'fs/promises';
import { runNonInteractive, createTempDir, cleanupTempDir } from '../utils/cli-runner.js';

describe('E2E: installed standards index counts options', () => {
  let testDir;

  beforeEach(async () => {
    testDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(testDir);
  });

  it('reports the same core/options split the manifest holds', async () => {
    // Claude Code is detected by the directory; without it no CLAUDE.md is
    // written and the index block has nowhere to land.
    await mkdir(join(testDir, '.claude'), { recursive: true });

    const run = await runNonInteractive(
      { mode: 'full', format: 'ai', contentLayout: 'flat', contentMode: 'index', skillsLocation: 'none' },
      testDir,
      120000
    );
    expect(run.exitCode, `init failed:\n${run.stdout}\n${run.stderr}`).toBe(0);

    const manifest = JSON.parse(
      await readFile(join(testDir, '.standards', 'manifest.json'), 'utf8')
    );
    const expectedOptions = manifest.standards.filter((s) => String(s).includes('options/')).length;
    const expectedTotal = manifest.standards.length;

    // Guard the guard: a manifest with no options would make this test vacuous.
    expect(expectedOptions).toBeGreaterThan(0);

    const claudeMd = await readFile(join(testDir, 'CLAUDE.md'), 'utf8');
    const m = claudeMd.match(/\*\*(\d+)\*\*[^\n]*?\((\d+)\s*core,\s*(\d+)\s*options\)/i)
      || claudeMd.match(/\*\*(\d+)\*\*[^\n]*?core\s*(\d+)[、,]\s*options\s*(\d+)/);
    expect(m, `index sentence not found in CLAUDE.md`).toBeTruthy();

    const [, total, core, options] = m;
    expect(Number(options)).toBe(expectedOptions);
    expect(Number(core)).toBe(expectedTotal - expectedOptions);
    expect(Number(total)).toBe(expectedTotal);
  });
});
