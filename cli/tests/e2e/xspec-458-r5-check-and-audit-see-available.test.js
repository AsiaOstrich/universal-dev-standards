/**
 * E2E: `uds check` and `uds audit` can see what UDS ships and the project lacks (dev-platform XSPEC-458 R5).
 *
 * The report: `uds audit` was silent. Its "unused standards" start from what is installed, its "orphans" look at
 * files inside `.standards/`, and its coverage score counts only installed standards, so a standard that was
 * never installed could not lower any number.
 *
 * Every test spawns the real CLI in a throwaway project built from the manifest a real UDS 6.11.0 wrote
 * (tests/fixtures/upgrade-from-6.11.0). "Does not change the verdict or the score" is proven with a twin: the
 * same commands on a CLI whose available-standards answer is always empty.
 *
 * Wires that make these red when cut (each is one line of CLI source):
 *   cli/src/commands/check.js          printAvailableStandardsCheckLine(manifest);
 *   cli/src/utils/friction-detector.js const { offered } = getAvailableStandards(manifest);
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { makeUpgradeProject, removeOpenWorkTracking, OFF_OVERRIDES } from '../utils/xspec-458.js';

const h = createHarness('xspec458-r5');
const off = createHarness('xspec458-r5-off', { overrides: OFF_OVERRIDES });
afterAll(() => { h.cleanup(); off.cleanup(); });

/** Coverage is "how many installed standards have a check script"; give the project some, so that dimension is not 0 either way. */
function addCheckScripts(dir) {
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  for (const id of ['anti-hallucination', 'commit-message', 'testing']) writeFileSync(join(dir, 'scripts', `check-${id}.sh`), '#!/bin/sh\nexit 0\n');
}

const withoutLine = (stdout, pattern) => stdout.split('\n').filter((l) => !pattern.test(l)).join('\n');

it('uds check prints "1 upstream standard(s) not installed" and points at uds update --plan, and its verdict line and exit code equal a CLI without that line, with and without --ci (XSPEC-458 R5)', async () => {
  const dir = makeUpgradeProject(h);
  const twinDir = makeUpgradeProject(off);

  for (const flags of [[], ['--ci']]) {
    const real = await h.runCli(['check', '--offline', ...flags], dir);
    const twin = await off.runCli(['check', '--offline', ...flags], twinDir);
    expect(real.stdout, `uds check ${flags.join(' ')}`).toMatch(/1 upstream standard\(s\) not installed — run `uds update --plan` to see them/);
    expect(twin.stdout, 'control: the twin does not say it').not.toMatch(/upstream standard\(s\) not installed/);

    // The verdict and the exit code are the twin's.
    expect(real.code, `exit code ${flags.join(' ')}`).toBe(twin.code);
    const verdict = (out) => out.split('\n').filter((l) => /compliant|Issues detected|issues detected/i.test(l));
    expect(verdict(real.stdout).length, 'control: the check printed a verdict').toBeGreaterThan(0);
    expect(verdict(real.stdout)).toEqual(verdict(twin.stdout));
    // Everything else is the same too: the only added text is that line (the twin prints its "none" line).
    const strip = (out) => withoutLine(out, /upstream standard\(s\) not installed|Upstream standards not installed/);
    expect(strip(real.stdout)).toBe(strip(twin.stdout));
  }
});

it('uds check --ci still ends "compliant" with exit code 0 for a project whose only difference from a clean install is one available standard (XSPEC-458 R5)', async () => {
  // The 6.11.0 project above already has other findings, so on its own it could not show a verdict that got worse.
  const dir = await h.newProject();
  removeOpenWorkTracking(dir);
  const run = await h.runCli(['check', '--ci', '--offline'], dir);
  expect(run.stdout, 'control: the line is there').toMatch(/1 upstream standard\(s\) not installed/);
  expect(run.stdout).toContain('Project is compliant with standards');
  expect(run.code, run.stdout + run.stderr).toBe(0);
});

it('uds check says "Upstream standards not installed: none" for a project that has everything, instead of staying silent (XSPEC-458 R5)', async () => {
  const dir = await h.newProject();
  const run = await h.runCli(['check', '--offline'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout).toContain('Upstream standards not installed: none');
});

it('uds audit --friction lists one LOW finding "1 available standard(s) not installed" naming open-work-tracking, while uds audit --score is the same as on a CLI without the finding (XSPEC-458 R5)', async () => {
  const dir = makeUpgradeProject(h);
  const twinDir = makeUpgradeProject(off);
  addCheckScripts(dir);
  addCheckScripts(twinDir);

  const friction = await h.runCli(['audit', '--friction', '--offline'], dir);
  expect(friction.code, friction.stdout + friction.stderr).toBe(0);
  expect(friction.stdout).toMatch(/\[LOW\] 1 available standard\(s\) not installed/);
  expect(friction.stdout).toContain('open-work-tracking');
  expect(friction.stdout).toContain('uds update --apply --add-standard <id>');
  const twinFriction = await off.runCli(['audit', '--friction', '--offline'], twinDir);
  expect(twinFriction.stdout, 'control: without the feature there is no such finding').not.toMatch(/available standard\(s\) not installed/);

  // One finding, structured, in the JSON the report tooling reads.
  const json = await h.runCli(['audit', '--friction', '--offline', '--format', 'json'], dir);
  const frictions = JSON.parse(json.stdout).frictions;
  const mine = frictions.filter((f) => f.type === 'not-installed');
  expect(mine).toHaveLength(1);
  expect(mine[0].severity).toBe('LOW');

  // The score is not moved: same JSON as the twin (every dimension, every number).
  const score = await h.runCli(['audit', '--score', '--offline', '--format', 'json'], dir);
  const twinScore = await off.runCli(['audit', '--score', '--offline', '--format', 'json'], twinDir);
  expect(score.code, score.stdout + score.stderr).toBe(0);
  const a = JSON.parse(score.stdout);
  const b = JSON.parse(twinScore.stdout);
  expect(typeof a.score, 'control: the score is a number').toBe('number');
  expect(a.dimensions.coverage.score, 'control: coverage is not 0, so a change to it would show').toBeGreaterThan(0);
  expect(a.score).toBe(b.score);
  expect(a.dimensions).toEqual(b.dimensions);
});

it('uds audit --report does not offer the "available standards" finding as feedback for UDS maintainers, and says why instead of "no issues" (XSPEC-458 R5)', async () => {
  // A project with nothing else wrong: the available-standards finding is the only one the audit has.
  const dir = await h.newProject();
  removeOpenWorkTracking(dir);
  const run = await h.runCli(['audit', '--friction', '--report', '--dry-run', '--yes', '--offline'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout, 'control: the audit itself still lists the finding').toMatch(/\[LOW\] 1 available standard\(s\) not installed/);
  expect(run.stdout, 'it is not put forward for submission').not.toMatch(/\[Friction\]/);
  expect(run.stdout, 'and the report step says why, instead of "no issues"').toContain('Nothing to send');
  expect(run.stdout, 'a finding that is only the project\'s own does not advertise feedback submission').not.toContain('Submit feedback');

  // With other findings present (the 6.11.0 project has modified files), the report is built from those and
  // still leaves this one out.
  const upgrade = makeUpgradeProject(h);
  const other = await h.runCli(['audit', '--friction', '--report', '--dry-run', '--yes', '--offline'], upgrade);
  expect(other.stdout).toMatch(/\[LOW\] 1 available standard\(s\) not installed/);
  expect(other.stdout).not.toMatch(/\[Friction\] 1 available standard/);
});
