/**
 * E2E: the end-to-end tests run on ubuntu, windows and macos when main is pushed, and the job says how many tests
 * were skipped (dev-platform XSPEC-469 R4).
 *
 * What can be tested here, and what cannot. A workflow runs on GitHub; no test in this repository can start it. So:
 *   - `scripts/ci-vitest-summary.mjs` is a program, and is started as the workflow starts it, on a result file that a
 *     real vitest run wrote (a passing test and a test that calls `ctx.skip()`);
 *   - the workflow file is read as YAML and its job is checked for the properties R4 asks for (three systems on a
 *     push, Ubuntu for a pull request, the skip count written, the zero-ran failure). That proves the file says it,
 *     not that GitHub did it. AC-3 ("the three jobs really ran") can only be read from the Actions page after a push.
 *
 * Wire that makes the summary tests red when cut (one line of source):
 *   scripts/ci-vitest-summary.mjs   const s = summarize(result);
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';
import { REPO, scratch, weaken } from '../utils/xspec-469.js';

const tmp = scratch('uds-xspec469-r4-');
afterAll(() => tmp.cleanup());

const SUMMARY = join(REPO, 'scripts', 'ci-vitest-summary.mjs');
const VITEST = join(REPO, 'cli', 'node_modules', 'vitest', 'vitest.mjs');
const summary = (resultFile, extra = [], script = SUMMARY, env = {}) => {
  const r = spawnSync(process.execPath, [script, resultFile, ...extra], { encoding: 'utf-8', env: { ...process.env, ...env, GITHUB_STEP_SUMMARY: env.GITHUB_STEP_SUMMARY || '' } });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, out: `${r.stdout}${r.stderr}` };
};

/** Run a real vitest on a tiny project of two tests, one of which skips itself the way the e2e tests do on Windows. */
function realVitestResult(bodyOfSecondTest) {
  const dir = tmp.next('mini');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'mini.test.js'), `it('passes', () => { expect(1 + 1).toBe(2); });\nit('needs a POSIX shell', (ctx) => { ${bodyOfSecondTest} });\n`);
  const out = join(dir, 'result.json');
  const r = spawnSync(process.execPath, [VITEST, 'run', '--root', dir, '--globals', '--reporter=dot', '--reporter=json', `--outputFile.json=${out}`], { encoding: 'utf-8', timeout: 120000 });
  expect(readFileSync(out, 'utf-8').length, `control: vitest wrote its result (${r.stdout}${r.stderr})`).toBeGreaterThan(10);
  return out;
}

it('after a real vitest run with one passing test and one test that skips itself, the summary prints ran 1, passed 1, skipped 1, names the skipped test, writes it to the job summary file, and exits 0 (XSPEC-469 R4)', () => {
  const result = realVitestResult('ctx.skip();');
  const stepSummary = tmp.next('step-summary.md');
  const r = summary(result, ['--title', 'E2E tests on windows-latest'], SUMMARY, { GITHUB_STEP_SUMMARY: stepSummary });
  expect(r.code, r.out).toBe(0);
  expect(r.stdout).toContain('### E2E tests on windows-latest');
  expect(r.stdout).toContain('| 1 | 1 | 0 | 1 | 0 |');
  expect(r.stdout).toContain('1 skipped test(s) — they did not run on this system, they did not pass');
  expect(r.stdout).toContain('- needs a POSIX shell');
  // the same text went to the file GitHub shows as the job summary
  expect(readFileSync(stepSummary, 'utf-8')).toContain('| 1 | 1 | 0 | 1 | 0 |');
});

it('a run where every test skipped itself exits 1 ("skipped is not passed"), and so does a run with a failing test; an empty result file exits 2 (XSPEC-469 R4)', () => {
  // vitest's own exit code is 0 for "all skipped"; the summary is what turns it red
  const allSkipped = tmp.next('all-skipped.json');
  writeFileSync(allSkipped, JSON.stringify({
    numTotalTests: 2, numPassedTests: 0, numFailedTests: 0, numPendingTests: 2, numTodoTests: 0,
    testResults: [{ name: 'a.test.js', assertionResults: [{ status: 'skipped', fullName: 'one' }, { status: 'skipped', fullName: 'two' }] }],
  }));
  const a = summary(allSkipped);
  expect(a.code, a.out).toBe(1);
  expect(a.stderr).toContain('FAIL: no test ran (2 skipped, 0 todo). Skipped is not passed.');

  const failing = realVitestResult('expect(1).toBe(2);');
  const b = summary(failing);
  expect(b.code, b.out).toBe(1);
  expect(b.stdout).toContain('| 2 | 1 | 1 | 0 | 0 |');
  expect(b.stderr).toContain('FAIL: 1 test(s) failed.');

  const empty = tmp.next('empty.json');
  writeFileSync(empty, JSON.stringify({ numTotalTests: 0, numPassedTests: 0, numFailedTests: 0, numPendingTests: 0, numTodoTests: 0, testResults: [] }));
  const c = summary(empty);
  expect(c.code, c.out).toBe(1);
  expect(c.stderr).toContain('no test ran');
});

it('a result file that is missing, is not JSON, is not a vitest result, or whose own total disagrees with the count exits 2 and says which (XSPEC-469 R4)', () => {
  const a = summary(join(tmp.dir, 'there-is-no-such-file.json'));
  expect(a.code, a.out).toBe(2);
  expect(a.stderr).toContain('CANNOT READ');
  expect(a.stderr).toContain('probably stopped before it wrote it');

  const notJson = tmp.next('x.json');
  writeFileSync(notJson, '{ not json');
  expect(summary(notJson).code).toBe(2);

  const other = tmp.next('other.json');
  writeFileSync(other, JSON.stringify({ hello: 'world' }));
  const c = summary(other);
  expect(c.code, c.out).toBe(2);
  expect(c.stderr).toContain('is JSON but not a vitest result');

  const lies = tmp.next('lies.json');
  writeFileSync(lies, JSON.stringify({ numTotalTests: 9, testResults: [{ name: 'a', assertionResults: [{ status: 'passed', fullName: 'x' }] }] }));
  const d = summary(lies);
  expect(d.code, d.out).toBe(2);
  expect(d.stderr).toContain('the file says 9 tests and I counted 1');
});

it('weakening the summary turns the property red: counting skipped tests as passed, or exiting 0 when nothing ran, is caught (XSPEC-469 R4)', () => {
  const allSkipped = tmp.next('all-skipped.json');
  writeFileSync(allSkipped, JSON.stringify({
    numTotalTests: 2, numPassedTests: 0, numFailedTests: 0, numPendingTests: 2, numTodoTests: 0,
    testResults: [{ name: 'a.test.js', assertionResults: [{ status: 'skipped', fullName: 'one' }, { status: 'skipped', fullName: 'two' }] }],
  }));
  const holds = (script) => summary(allSkipped, [], script).code === 1;

  expect(holds(SUMMARY), 'control').toBe(true);

  const copyWith = (from, to) => {
    const dir = tmp.next('copy');
    mkdirSync(dir, { recursive: true });
    const file = join(dir, 'ci-vitest-summary.mjs');
    writeFileSync(file, readFileSync(SUMMARY, 'utf-8'));
    weaken(file, from, to);
    return file;
  };
  expect(holds(copyWith('if (s.ran === 0) {', 'if (false) {')), 'nothing ran but exit 0').toBe(false);
  expect(holds(copyWith('ran: passed + failed,', 'ran: passed + failed + skipped,')), 'skipped counted as ran').toBe(false);
});

// ───────────────────────────── the workflow file ─────────────────────────────

const workflow = () => load(readFileSync(join(REPO, '.github', 'workflows', 'ci.yml'), 'utf-8'));

it('ci.yml is valid YAML and its e2e job runs on all three systems for a push and on Ubuntu alone for a pull request, without cancelling the other systems when one is red (XSPEC-469 R4)', () => {
  const ci = workflow();
  expect(ci.on.push.branches).toEqual(['main']);
  expect(ci.on.pull_request.branches).toEqual(['main']);
  const e2e = ci.jobs.e2e;

  // the matrix expression: fromJSON(<push> && '<three systems>' || '<one system>')
  const expr = e2e.strategy.matrix.os;
  expect(expr).toMatch(/^\$\{\{ fromJSON\(github\.event_name == 'push' && '(\[.*?\])' \|\| '(\[.*?\])'\) \}\}$/);
  const [, onPush, onPull] = /fromJSON\(github\.event_name == 'push' && '(\[.*?\])' \|\| '(\[.*?\])'\)/.exec(expr);
  expect(JSON.parse(onPush)).toEqual(['ubuntu-latest', 'windows-latest', 'macos-latest']);
  expect(JSON.parse(onPull)).toEqual(['ubuntu-latest']);
  expect(e2e.strategy['fail-fast'], 'one red system must not hide the other two').toBe(false);
  expect(e2e['runs-on']).toBe('${{ matrix.os }}');
  expect(e2e.name).toContain('${{ matrix.os }}');

  // a push always runs it (no path filter, so it cannot be skipped into a false green); a pull request only when cli/** changed
  expect(e2e.if).toContain("github.event_name == 'push'");
  expect(e2e.if).toContain("github.event_name == 'pull_request' && needs.changes.outputs.cli == 'true'");
  // the Windows unit-test job of the matrix `test` is still there
  expect(ci.jobs.test.strategy.matrix.include.some((m) => m.os === 'windows-latest')).toBe(true);
});

it('a run for a push to main is not cancelled by the next push, while a pull request run still is (XSPEC-469 R4)', () => {
  const ci = workflow();
  expect(ci.concurrency.group).toBe('${{ github.workflow }}-${{ github.ref }}');
  expect(ci.concurrency['cancel-in-progress']).toBe("${{ github.event_name == 'pull_request' }}");
});

it('the e2e job writes a JSON result and a final step that always runs turns it into a count of ran, passed, failed and skipped tests (XSPEC-469 R4)', () => {
  const steps = workflow().jobs.e2e.steps;
  const run = steps.find((s) => s.name === 'Run E2E tests');
  expect(run.run).toContain('npm run test:e2e');
  expect(run.run).toContain('--reporter=json');
  expect(run.run).toContain('--outputFile.json=../e2e-result.json');
  const count = steps.find((s) => s.name === 'Count what ran and what was skipped');
  expect(count.run).toContain('node ../scripts/ci-vitest-summary.mjs ../e2e-result.json');
  expect(count.if, 'it runs when the tests failed too').toContain('always()');
  expect(steps.indexOf(count)).toBeGreaterThan(steps.indexOf(run));
  expect(count.run).toContain('${{ matrix.os }}');
});

it('the beta-acceptance job runs both checks with Node alone, on every push and pull request (XSPEC-469 R1, R5)', () => {
  const job = workflow().jobs['beta-acceptance'];
  expect(job.if, 'no condition: it cannot be skipped into a false green').toBeUndefined();
  expect(job.needs).toBeUndefined();
  const commands = job.steps.map((s) => s.run).filter(Boolean);
  expect(commands).toEqual([
    'node scripts/beta-acceptance/check-steps.mjs',
    'node scripts/beta-acceptance/generate-pre-release.mjs --check',
  ]);
});

it('the end-to-end tests that need a POSIX shell skip themselves on Windows with ctx.skip(), so the job counts them as skipped instead of red (XSPEC-469 R4)', () => {
  for (const f of ['xspec-459-r4-standard-sync', 'xspec-460-r3-r5-r6-standard-text', 'xspec-463-r5-scan-gate-standard-install', 'xspec-464-r4-standard-text']) {
    const text = readFileSync(join(REPO, 'cli', 'tests', 'e2e', `${f}.test.js`), 'utf-8');
    // every test that calls the bash helper has the guard in its first lines
    const tests = text.split(/\n(?=it\()/).filter((t) => t.startsWith('it(') && /\bsh\(/.test(t));
    expect(tests.length, f).toBeGreaterThan(0);
    for (const t of tests) expect(t.split('\n').slice(0, 4).join('\n'), `${f}: ${t.slice(0, 60)}`).toContain("if (process.platform === 'win32') ctx.skip();");
  }
});
