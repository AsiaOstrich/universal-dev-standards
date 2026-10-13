/**
 * E2E: when `uds update --apply` cannot write something, the run fails where a script can see it, says which
 * file and why, and says how to finish (dev-platform XSPEC-482 R2 and R10, beta.12 macOS findings N2, N5, N6).
 *
 *   R2   `update --apply` printed "Reconciliation completed with errors: N failed" and exited 0, so CI never saw it.
 *   R10  a failed skills batch printed one line "Unknown error" per skill, with neither a path nor a cause; and the
 *        CHANGELOG claim "a run that has an error leaves the records alone" was wider than the behaviour (only the
 *        batch that failed, and the overall upstream version, keep their old record; a batch that succeeded moves
 *        on, and a second `--apply` completes what is left). The run now says so.
 *
 * Every test runs the real CLI in a throwaway project. The write failures come from a preload that makes `fs` throw
 * EACCES for chosen paths (tests/utils/xspec-482.js), so they happen on Windows and as root too. What is read back:
 * the exit code, the lines printed, the files on disk and the manifest's version records.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/update.js            process.exitCode = 1; // wire:apply-fails-exit-1
 *   cli/src/reconciler/plan-executor.js   results.push(judgeBatchAction(action, installResult, 'skill')); // wire:skill-batch-names-its-failures
 */

import { it, expect, afterAll } from 'vitest';
import { rmSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { readManifest, writeManifest, out, faultsFor } from '../utils/xspec-482.js';

const h = createHarness('xspec482-r2-r10');
afterAll(() => h.cleanup());

const APPLY = ['update', '--apply', '--yes', '--offline'];
const STANDARD = '.standards/testing.ai.yaml';
const SKILL_DIR = '.claude/skills/commit-standards';

/** A project where one standard file and one skill folder are gone and the records are old, as after a 6.11.0 upgrade. */
async function agedProject({ dropStandard = false, dropSkill = false } = {}) {
  const dir = await h.newProject();
  const manifest = readManifest(dir);
  const shipped = { skills: manifest.skills.version, upstream: manifest.upstream.version };
  manifest.skills.version = '6.11.0';
  manifest.upstream.version = '6.11.0';
  writeManifest(dir, manifest);
  if (dropStandard) rmSync(join(dir, STANDARD), { force: true });
  if (dropSkill) rmSync(join(dir, SKILL_DIR), { recursive: true, force: true });
  return { dir, shipped };
}

it('uds update --apply exits 1 and lists the failed file when a standard file cannot be written (XSPEC-482 R2)', async () => {
  const { dir } = await agedProject({ dropStandard: true });
  expect(existsSync(join(dir, STANDARD)), 'fixture: the standard is gone').toBe(false);

  const run = await h.runCli(APPLY, dir, faultsFor(h.makeDir('fault'), [{ fn: 'copyFileSync', contains: STANDARD, code: 'EACCES' }]));
  expect(run.code, out(run)).toBe(1);
  expect(out(run)).toContain('Reconciliation completed with errors: 1 failed');
  expect(out(run)).toContain('Errors (1):');
  expect(out(run)).toContain('EACCES');
  expect(out(run), 'names the file').toContain(STANDARD);
  // Read back: the file really was not written.
  expect(existsSync(join(dir, STANDARD))).toBe(false);
}, 180000);

it('uds update --apply with nothing failing exits 0 and puts the missing standard back (control for the exit code)', async () => {
  const { dir } = await agedProject({ dropStandard: true });
  const run = await h.runCli(APPLY, dir);
  expect(run.code, out(run)).toBe(0);
  expect(out(run)).toContain('Reconciliation complete');
  expect(out(run)).not.toContain('completed with errors');
  expect(existsSync(join(dir, STANDARD))).toBe(true);
}, 180000);

it('uds update --apply whose skills batch fails exits 1 and names the skill folder and the cause on each failed line, not "Unknown error" (XSPEC-482 R10)', async () => {
  const { dir, shipped } = await agedProject({ dropSkill: true });
  expect(existsSync(join(dir, SKILL_DIR)), 'fixture: the skill folder is gone').toBe(false);

  const run = await h.runCli(APPLY, dir, faultsFor(h.makeDir('fault'), [{ fn: 'writeFileSync', contains: `${SKILL_DIR}/`, code: 'EACCES' }]));
  expect(run.code, out(run)).toBe(1);
  expect(out(run)).not.toContain('Unknown error');
  expect(out(run), 'path and cause on the failed line').toMatch(new RegExp(`${SKILL_DIR}: EACCES: permission denied`));
  // Only the skill that failed is counted as failed (the others in the same batch were not planned: one action, one failure).
  expect(out(run)).toContain('Reconciliation completed with errors: 1 failed');
  // The failed batch keeps its old record, and so does the overall version.
  const after = readManifest(dir);
  expect(after.skills.version).toBe('6.11.0');
  expect(after.upstream.version).toBe('6.11.0');
  expect(shipped.skills, 'control: the shipped version really is newer').not.toBe('6.11.0');
}, 180000);

it('a run that fails on a standard but whose skills batch succeeds records the new skills version, keeps the old overall version, says so, and a second --apply completes (XSPEC-482 R10)', async () => {
  const { dir, shipped } = await agedProject({ dropStandard: true, dropSkill: true });

  const first = await h.runCli(APPLY, dir, faultsFor(h.makeDir('fault'), [{ fn: 'copyFileSync', contains: STANDARD, code: 'EACCES' }]));
  expect(first.code, out(first)).toBe(1);
  const midway = readManifest(dir);
  // The batch that succeeded moved on; the overall record did not.
  expect(existsSync(join(dir, SKILL_DIR, 'SKILL.md'))).toBe(true);
  expect(midway.skills.version).toBe(shipped.skills);
  expect(midway.upstream.version).toBe('6.11.0');
  // The output says exactly that, and what to run.
  expect(out(first)).toContain('The overall version record did not advance');
  expect(out(first)).toContain('a batch that succeeded has already recorded its new version');
  expect(out(first)).toContain('run `uds update --apply` again');

  // Run it again with nothing failing: the rest is done and the overall record catches up.
  const second = await h.runCli(APPLY, dir);
  expect(second.code, out(second)).toBe(0);
  expect(existsSync(join(dir, STANDARD))).toBe(true);
  expect(readFileSync(join(dir, STANDARD), 'utf-8').length).toBeGreaterThan(100);
  expect(readManifest(dir).upstream.version).toBe(shipped.upstream);
}, 240000);
