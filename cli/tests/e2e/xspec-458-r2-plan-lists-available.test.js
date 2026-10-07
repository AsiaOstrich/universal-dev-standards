/**
 * E2E: `uds update --plan` and `--apply` say what UDS ships and the project lacks (dev-platform XSPEC-458 R2).
 *
 * The report: `uds update --plan --offline` proposed three skill folders, three standard updates and two block
 * migrations, and said nothing about `open-work-tracking`, which the project did not have. `--apply` then
 * printed a green "up to date".
 *
 * Every test spawns the real CLI in a throwaway project built from the manifest a real UDS 6.11.0 wrote
 * (tests/fixtures/upgrade-from-6.11.0), and reads back what was printed and what was written.
 *
 * "Information only" is proven with a twin: the same commands on a CLI whose available-standards answer is
 * always empty. Same plan counts, same exit code, same text before the new section; the new section is the
 * only difference.
 *
 * Wires that make these red when cut (each is one line of CLI source):
 *   cli/src/commands/update.js   printAvailableStandardsSection(result.manifest || manifest, { phase: 'plan' });
 *   cli/src/commands/update.js   printAvailableStandardsSection(result.manifest || planResult.manifest, { phase: 'apply' });
 */

import { it, expect, afterAll } from 'vitest';
import { existsSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import {
  makeUpgradeProject, readFixtureManifest, expectedAvailableIds, idsInAvailableSection, planCounts, removeOpenWorkTracking, OFF_OVERRIDES
} from '../utils/xspec-458.js';

const h = createHarness('xspec458-r2');
const off = createHarness('xspec458-r2-off', { overrides: OFF_OVERRIDES });
afterAll(() => { h.cleanup(); off.cleanup(); });

const NONE = 'Available upstream, not installed: none.';

it('uds update --plan --offline names open-work-tracking under "Available upstream, not installed", and its plan counts, exit code and text before that section equal a CLI without the section (XSPEC-458 R2)', async () => {
  const manifest = readFixtureManifest();
  const dir = makeUpgradeProject(h);
  const twinDir = makeUpgradeProject(off);

  const real = await h.runCli(['update', '--plan', '--offline'], dir);
  const twin = await off.runCli(['update', '--plan', '--offline'], twinDir);
  expect(real.code, real.stdout + real.stderr).toBe(0);
  expect(twin.code, twin.stdout + twin.stderr).toBe(0);

  // The section: named, grouped by category, one line per standard.
  expect(real.stdout).toContain('Available upstream, not installed (');
  expect(idsInAvailableSection(real.stdout)).toEqual(expectedAvailableIds(manifest));
  expect(real.stdout).toMatch(/\n {2}reference \(\d+\)\n {4}open-work-tracking — /);
  expect(real.stdout).toContain('uds update --apply --add-standard <id>');

  // Control: the twin really is "without the section" (it says nothing is available).
  expect(twin.stdout).toContain(NONE);
  expect(idsInAvailableSection(twin.stdout)).toEqual([]);

  // Information only: the plan is the same plan.
  const realCounts = planCounts(real.stdout);
  expect(realCounts, 'control: the plan has a Summary to compare').not.toBeNull();
  expect(Object.values(realCounts).reduce((a, b) => a + b, 0), 'control: the plan is not empty').toBeGreaterThan(0);
  expect(planCounts(twin.stdout)).toEqual(realCounts);
  const upToTheSection = (out) => out.slice(0, out.indexOf('Available upstream, not installed'));
  expect(upToTheSection(real.stdout)).toBe(upToTheSection(twin.stdout));

  // And --plan wrote nothing: the standard is not installed and the manifest has not gained it.
  expect(existsSync(join(dir, '.standards', 'open-work-tracking.ai.yaml'))).toBe(false);
  expect(JSON.parse(readFileSync(join(dir, '.standards', 'manifest.json'), 'utf-8')).standards.some((s) => s.includes('open-work-tracking'))).toBe(false);
});

it('uds update --plan --offline says "none" out loud for a project that has everything UDS installs by default (XSPEC-458 R2)', async () => {
  const dir = await h.newProject();
  const run = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout, 'the section is present, and says there is nothing').toContain(NONE);
  expect(idsInAvailableSection(run.stdout)).toEqual([]);
  // The count of the other categories is the same kind of honesty: they exist, they are not offered here.
  expect(run.stdout).toMatch(/Not listed above: \d+ more standard\(s\) in categories `uds init` never installs/);
});

it('uds update --apply ends with how many standards are available and the command that installs one, installs none of them, and exits 0 (XSPEC-458 R2)', async () => {
  const dir = await h.newProject();
  // A project missing one standard UDS installs by default.
  removeOpenWorkTracking(dir);

  // Something to apply, so this is the "ran the plan" ending and not the "up to date" one.
  const aged = join(dir, '.standards', 'checkin-standards.ai.yaml');
  writeFileSync(aged, '# older edition (XSPEC-458 R2 test)\n' + readFileSync(aged, 'utf-8'));

  const run = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout).toContain('Reconciliation complete');
  expect(run.stdout).toMatch(/1 standard\(s\) UDS ships are not installed in this project/);
  expect(run.stdout).toContain('uds update --apply --add-standard <id>');
  expect(existsSync(join(dir, '.standards', 'open-work-tracking.ai.yaml')), '--apply on its own does not install it').toBe(false);

  // The "Everything is up to date" ending says it too, instead of leaving "up to date" as the last word.
  const again = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(again.code, again.stdout + again.stderr).toBe(0);
  expect(again.stdout).toContain('Everything is up to date');
  expect(again.stdout).toMatch(/1 standard\(s\) UDS ships are not installed in this project/);
});
