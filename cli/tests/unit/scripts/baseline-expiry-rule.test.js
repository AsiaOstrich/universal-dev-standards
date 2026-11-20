/**
 * The baseline-expiry rule (dev-platform decision 616乙, 2026-11-20), tested where CI meets it.
 *
 * A baseline is a list of things somebody chose not to fix yet; its expiry date is the clock on THAT
 * list, not on the gate:
 *   - empty list                       -> the date is not looked at
 *   - non-empty, date present, future  -> pass
 *   - non-empty, date past             -> fail, message names the date
 *   - non-empty, no valid date         -> fail, message says there is no date
 *
 * Entry tests run the gate scripts themselves with `--baseline <fixture>` and read the exit code and
 * the message, as CI does. Dates are fixed (2000-01-01 is always past, 2999-12-31 never arrived), so
 * nothing here depends on the day the test runs. The two failure messages differ on purpose, so a cut
 * that removes one rule turns only the arm that guards it red.
 *
 * Wires that make these red when cut:
 *   cli/scripts/lib/baseline-expiry.mjs            if (size === 0) return { state: 'empty', failed: false };
 *   cli/scripts/lib/baseline-expiry.mjs            if (!isValidIsoDate(expires)) return { state: 'no-expiry', failed: true };
 *   cli/scripts/check-module-reachability.mjs      const expiry = judgeBaselineExpiry({ size: baseline.modules.length
 *   scripts/check-shipped-stamp-consistency.ts     const expiry = judgeBaselineExpiry({ size: baseline.entries.length
 *
 * The command-existence gate takes ~20 s per run, so its four arms live in its own `--self-test`
 * (run by CI and by pre-release-check step 26); the orphan-matrix arms live in
 * tests/e2e/xspec-458-r4-orphan-matrix.test.js.
 */
import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { judgeBaselineExpiry } from '../../../scripts/lib/baseline-expiry.mjs';

const CLI = resolve(import.meta.dirname, '../../..');
const REPO = resolve(CLI, '..');
const PAST = '2000-01-01';
const FUTURE = '2999-12-31';
const TODAY = '2026-01-01';

const scratch = mkdtempSync(join(tmpdir(), 'uds-baseline-expiry-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

let counter = 0;
const writeJson = (name, value) => {
  const path = join(scratch, `${++counter}-${name}`);
  writeFileSync(path, JSON.stringify(value));
  return path;
};
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

function runNode(script, args) {
  const r = spawnSync(process.execPath, [script, ...args], { cwd: REPO, encoding: 'utf8', timeout: 120000 });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || ''), stdout: r.stdout || '' };
}

// ── the rule itself ────────────────────────────────────────────────────────────────────────────────

it('baseline-expiry rule: empty never reads the date; non-empty fails when expired or when the date is missing or malformed', () => {
  const judge = (size, expires) => judgeBaselineExpiry({ size, expires, today: TODAY }).state;
  expect(judge(0, PAST)).toBe('empty');
  expect(judge(0, undefined)).toBe('empty');
  expect(judge(0, 'not a date')).toBe('empty');
  expect(judge(3, FUTURE)).toBe('ok');
  expect(judge(3, TODAY), 'the expiry day itself is still inside the clock').toBe('ok');
  expect(judge(3, PAST)).toBe('expired');
  for (const bad of [undefined, null, '', 'tomorrow', '2999-13-01', '2999-02-30', '2999/12/31', 20991231]) {
    expect(judge(3, bad), `non-empty with expires=${JSON.stringify(bad)}`).toBe('no-expiry');
  }
  expect(judgeBaselineExpiry({ size: 3, expires: PAST, today: TODAY }).failed).toBe(true);
  expect(judgeBaselineExpiry({ size: 0, expires: PAST, today: TODAY }).failed).toBe(false);
  expect(() => judgeBaselineExpiry({ size: 1, expires: FUTURE, today: 'nope' })).toThrow(/today/);
});

// ── check-module-reachability.mjs (fast: ~50 ms per run) ───────────────────────────────────────────

const REACH = join(CLI, 'scripts', 'check-module-reachability.mjs');
const reachModules = () => readJson(join(CLI, 'scripts', 'reachability-baseline.json')).modules;

it('check-module-reachability: an empty baseline with a past date is not judged on the date', () => {
  const baseline = writeJson('reach-empty.json', { modules: [], expires: PAST });
  const r = runNode(REACH, ['--baseline', baseline]);
  // The real tree has one baselined module, so an empty baseline leaves it as a NEW finding (exit 1 for
  // that reason). What this arm pins is only that the date is not the reason.
  expect(r.out).toContain('基線為空，不檢查到期');
  expect(r.out).not.toContain('基線已於');
  expect(r.out).not.toContain('沒有有效的到期日');
  const json = JSON.parse(runNode(REACH, ['--baseline', baseline, '--json']).stdout);
  expect(json.baselineState).toBe('empty');
  expect(json.baselineExpired).toBe(false);
});

it('check-module-reachability: a non-empty baseline whose date has not arrived passes', () => {
  const baseline = writeJson('reach-future.json', { modules: reachModules(), expires: FUTURE });
  const r = runNode(REACH, ['--baseline', baseline]);
  expect(r.code, r.out).toBe(0);
  expect(r.out).not.toContain('基線已於');
});

it('check-module-reachability: a non-empty baseline past its date fails, naming the date', () => {
  const baseline = writeJson('reach-expired.json', { modules: reachModules(), expires: PAST });
  const r = runNode(REACH, ['--baseline', baseline]);
  expect(r.code, r.out).toBe(1);
  expect(r.out).toContain(`基線已於 ${PAST} 到期`);
});

it('check-module-reachability: a non-empty baseline with no expiry date fails, saying there is no date', () => {
  const baseline = writeJson('reach-nodate.json', { modules: reachModules() });
  const r = runNode(REACH, ['--baseline', baseline]);
  expect(r.code, r.out).toBe(1);
  expect(r.out).toContain('卻沒有有效的到期日');
  expect(r.out).not.toContain('基線已於');
});

// ── check-shipped-stamp-consistency.ts (needs the root tsx; CI's cli jobs install only cli/) ───────

const SHIPPED = join(REPO, 'scripts', 'check-shipped-stamp-consistency.ts');
const TSX = join(REPO, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx');
const shippedEntries = () => readJson(join(REPO, 'scripts', 'shipped-stamp-consistency-baseline.json')).entries;

function runShipped(ctx, baseline, extra = []) {
  if (!existsSync(TSX)) ctx.skip(`root dependencies (tsx) are not installed at ${TSX}; run \`npm ci\` in the repo root`);
  // tsx.cmd on Windows cannot be spawned without a shell.
  const r = spawnSync(TSX, [SHIPPED, '--baseline', baseline, ...extra], {
    cwd: REPO,
    encoding: 'utf8',
    timeout: 120000,
    shell: process.platform === 'win32'
  });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || ''), stdout: r.stdout || '' };
}

it('check-shipped-stamp-consistency: an empty baseline with a past date is not judged on the date', (ctx) => {
  const baseline = writeJson('stamp-empty.json', { recorded: PAST, expires: PAST, why: 'fixture', howToShrink: 'fixture', entries: [] });
  // The real tree has baselined findings, so an empty baseline leaves them as new (exit 1 for that reason);
  // this arm pins only that the date is not the reason.
  const r = runShipped(ctx, baseline);
  expect(r.out).toContain('Baseline is empty: its expiry date is not checked.');
  expect(r.out).not.toContain('Baseline expired on');
  expect(r.out).not.toContain('no valid expiry date');
  const json = JSON.parse(runShipped(ctx, baseline, ['--json']).stdout);
  expect(json.baselineState).toBe('empty');
  expect(json.baselineExpired).toBe(false);
});

it('check-shipped-stamp-consistency: a non-empty baseline whose date has not arrived passes', (ctx) => {
  const baseline = writeJson('stamp-future.json', { recorded: PAST, expires: FUTURE, why: 'fixture', howToShrink: 'fixture', entries: shippedEntries() });
  const r = runShipped(ctx, baseline);
  expect(r.code, r.out).toBe(0);
  expect(r.out).not.toContain('Baseline expired on');
});

it('check-shipped-stamp-consistency: a non-empty baseline past its date fails, naming the date', (ctx) => {
  const baseline = writeJson('stamp-expired.json', { recorded: PAST, expires: PAST, why: 'fixture', howToShrink: 'fixture', entries: shippedEntries() });
  const r = runShipped(ctx, baseline);
  expect(r.code, r.out).toBe(1);
  expect(r.out).toContain(`Baseline expired on ${PAST}`);
});

it('check-shipped-stamp-consistency: a non-empty baseline with no expiry date fails, saying there is no date', (ctx) => {
  const baseline = writeJson('stamp-nodate.json', { recorded: PAST, why: 'fixture', howToShrink: 'fixture', entries: shippedEntries() });
  const r = runShipped(ctx, baseline);
  expect(r.code, r.out).toBe(1);
  expect(r.out).toContain('no valid expiry date');
  expect(r.out).not.toContain('Baseline expired on');
});
