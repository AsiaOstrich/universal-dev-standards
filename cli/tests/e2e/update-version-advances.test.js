/**
 * XSPEC-382 R5 — behaviour, not shape.
 *
 * There is already a regression test for this fix
 * (tests/commands/update-manifest-overwrite.test.js). Every one of its
 * assertions is a regex over source text: it checks that the two functions
 * *contain* `readManifest(projectPath)` and do not write `manifest` back
 * wholesale. That pins the shape of the fix, and it would stay green for a
 * refactor that calls `readManifest`, ignores the result, and writes the stale
 * object anyway.
 *
 * The claim R5 actually makes is behavioural: pass `--skills` and the version
 * marker advances. Nothing in the suite observed that. This does.
 *
 * Verified non-vacuous by hand on 2026-08-18 with two copies of the CLI
 * differing only in those two functions, run against identical projects
 * seeded to the same probe version:
 *   fixed   6.0.0-probe → 6.7.1
 *   broken  6.0.0-probe → 6.0.0-probe
 *
 * The scenario is load-bearing and was got wrong once: a bare `uds init`
 * produces `skills.installed: false` with zero installations, so
 * `updateSkillsOnly` has nothing to write and the defect cannot occur. Written
 * that way this test passed with the fix REVERTED — it observed nothing. The
 * `skillsLocation: 'project'` below is what puts 55 skills on disk and is what
 * makes this test capable of failing at all.
 *
 * That measurement also caught a broken harness first. The initial attempt
 * pre-populated the project with skill directories; backing them up failed
 * with ENOTSUP on that filesystem, the reconciler reported an error, and
 * `results.every(r => r.success)` went false — so NEITHER arm reached the code
 * that writes the version, and both ended on the probe value. Reading only the
 * final number said "the fix does not work", which was false. Hence
 * `expect(stdout).not.toMatch(/completed with errors/)` below: a harness that
 * cannot fail loudly produces confident wrong answers.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import {
  runNonInteractive,
  runCommand,
  createTempDir,
  cleanupTempDir,
  setupTestDir,
  fileExists
} from '../utils/cli-runner.js';

const PROBE = '0.0.0-behaviour-probe';
const MANIFEST = '.standards/manifest.json';

async function readManifestJson(dir) {
  return JSON.parse(await readFile(join(dir, MANIFEST), 'utf8'));
}

/** Seed the installed version marker with a value no release will ever have. */
async function seedProbeVersion(dir) {
  const path = join(dir, MANIFEST);
  const m = JSON.parse(await readFile(path, 'utf8'));
  m.upstream = { ...(m.upstream || {}), version: PROBE };
  await writeFile(path, `${JSON.stringify(m, null, 2)}\n`);
}

describe('E2E: uds update advances the version marker (XSPEC-382 R5)', () => {
  let dir;

  beforeEach(async () => {
    dir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(dir);
  });

  it('advances upstream.version when --skills is passed', async () => {
    await setupTestDir(dir, {});
    const init = await runNonInteractive({ skillsLocation: 'project' }, dir, 180000);
    expect(init.exitCode).toBe(0);
    expect(await fileExists(join(dir, MANIFEST))).toBe(true);

    await seedProbeVersion(dir);
    expect((await readManifestJson(dir)).upstream.version).toBe(PROBE);

    const res = await runCommand('update', { apply: true, yes: true, skills: true }, dir, 180000);

    // The harness must be able to fail. If reconciliation errored, the version
    // was never going to be written for reasons that have nothing to do with
    // this fix, and the assertion below would be measuring the wrong thing.
    expect(res.stdout + res.stderr).not.toMatch(/completed with errors/);

    const after = (await readManifestJson(dir)).upstream.version;
    expect(after).not.toBe(PROBE);
  }, 300000);

  it('does not need a second pass without --skills to record the version', async () => {
    // This is the symptom as it was actually reported: four of five adopter
    // repos sat on the old version while their own `skills.version` had already
    // moved, and the only one that advanced was the one with no skills
    // installed. One run should be enough.
    await setupTestDir(dir, {});
    const init = await runNonInteractive({ skillsLocation: 'project' }, dir, 180000);
    expect(init.exitCode).toBe(0);

    await seedProbeVersion(dir);
    const res = await runCommand('update', { apply: true, yes: true, skills: true }, dir, 180000);
    expect(res.stdout + res.stderr).not.toMatch(/completed with errors/);

    const m = await readManifestJson(dir);
    // Both markers describe the same install, so they must not disagree. Two
    // version fields contradicting each other inside one manifest is what made
    // the original report legible at all.
    if (m.skills?.version) {
      expect(m.upstream.version).toBe(m.skills.version);
    }
    expect(m.upstream.version).not.toBe(PROBE);
  }, 300000);
});
