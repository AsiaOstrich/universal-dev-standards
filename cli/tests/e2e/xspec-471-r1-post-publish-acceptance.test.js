/**
 * E2E: after a release was published, the acceptance steps run against the published package on three systems, the
 * report becomes a job summary and an artifact, and a package that is not on npm is reported as that
 * (dev-platform XSPEC-471 R1).
 *
 * What can be tested here, and what cannot. A workflow runs on GitHub; no test in this repository can start it. So:
 *   - the four programs the workflow calls (resolve-version, wait-for-npm, ci-summary, fetch-ci-reports) are started as the
 *     workflow starts them, in real child processes. The registry is a real HTTP server on 127.0.0.1 that the test controls
 *     and reads back; `gh` is a small program that answers from a fixture and records how it was called;
 *   - the workflow file is read as YAML, and the command line of each of its steps is taken FROM THE FILE and executed (or
 *     parsed by the program's own argument parser), so a flag misspelt in the workflow, or a report folder that the run step
 *     and the summary step disagree about, turns a test red. That proves the file says it and that the programs accept what it
 *     says; it does not prove that GitHub did it. AC-1 ("three platforms really ran after a real publish") can only be read
 *     from the Actions page.
 *
 * Wires that make these red when cut (one line of source each):
 *   scripts/beta-acceptance/wait-for-npm.mjs     if (doc.version !== version) return { kind: 'absent'
 *   scripts/beta-acceptance/resolve-version.mjs  if (typeof version !== 'string' || !EXACT_VERSION.test(version)) {
 *   scripts/beta-acceptance/ci-summary.mjs       if (problems.length) red = true;
 *   scripts/beta-acceptance/fetch-ci-reports.mjs copyFileSync(join(dir, file), target);
 *   .github/workflows/post-publish-acceptance.yml   --non-interactive
 */

import { it, expect, afterAll } from 'vitest';
import { spawn, spawnSync } from 'child_process';
import { createServer } from 'http';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';
import { copyProgram, REPO, runAcceptance, scratch, weaken, writeInstaller, writeSteps } from '../utils/xspec-469.js';
import { parseArgs } from '../../../scripts/beta-acceptance/run.mjs';
import { pickArtifacts } from '../../../scripts/beta-acceptance/fetch-ci-reports.mjs';

const tmp = scratch('uds-xspec471-r1-');
afterAll(() => tmp.cleanup());

const ACCEPT = join(REPO, 'scripts', 'beta-acceptance');
const WAIT = join(ACCEPT, 'wait-for-npm.mjs');
const RESOLVE = join(ACCEPT, 'resolve-version.mjs');
const SUMMARY = join(ACCEPT, 'ci-summary.mjs');
const FETCH = join(ACCEPT, 'fetch-ci-reports.mjs');
const WORKFLOW = join(REPO, '.github', 'workflows', 'post-publish-acceptance.yml');

/** Start a program the way the workflow does (a real child process) and wait for it. Async: the registry lives in this process. */
function start(script, args, { env = {}, cwd = REPO } = {}) {
  return new Promise((done) => {
    const child = spawn(process.execPath, [script, ...args], { cwd, env: { ...process.env, GITHUB_ACTIONS: '', GITHUB_STEP_SUMMARY: '', GITHUB_OUTPUT: '', ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => { stdout += c; });
    child.stderr.on('data', (c) => { stderr += c; });
    child.on('close', (code) => done({ code, stdout, stderr, out: `${stdout}${stderr}` }));
  });
}

// ───────────────────────────── a registry the test controls ─────────────────────────────

/**
 * `versionStatuses` / `tarballStatuses`: the answer to the 1st, 2nd, ... request; the last one repeats.
 * `versionBody`: what a 200 on the version document says (default: the version asked for).
 */
async function registry({ versionStatuses, tarballStatuses = [200], versionBody = null }) {
  const requests = [];
  const counters = { version: 0, tarball: 0 };
  const server = createServer((req, res) => {
    requests.push(`${req.method} ${req.url}`);
    const next = (list, key) => list[Math.min(counters[key]++, list.length - 1)];
    const m = /^\/universal-dev-standards\/(.+)$/.exec(req.url);
    if (m && req.method === 'GET') {
      const status = next(versionStatuses, 'version');
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(status === 200 ? JSON.stringify(versionBody || { name: 'universal-dev-standards', version: decodeURIComponent(m[1]), dist: { tarball: `http://127.0.0.1:${server.address().port}/tarballs/uds.tgz` } }) : '{"error":"x"}');
    } else if (req.url === '/tarballs/uds.tgz') {
      res.writeHead(next(tarballStatuses, 'tarball'));
      res.end();
    } else {
      res.writeHead(500);
      res.end();
    }
  });
  await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    requests,
    count: (re) => requests.filter((r) => re.test(r)).length,
    close: () => new Promise((closed) => server.close(closed)),
  };
}

const waitFor = async (reg, extra = [], version = '6.14.0-beta.7', env = {}) =>
  start(WAIT, ['--version', version, '--timeout-sec', '1', '--interval-sec', '0.1', ...extra], { env: { npm_config_registry: reg.url, ...env } });

// ───────────────────────────── wait-for-npm ─────────────────────────────

it('keeps asking until the registry resolves the version and its tarball, then exits 0 without waiting any fixed time (XSPEC-471 R1)', async () => {
  const reg = await registry({ versionStatuses: [404, 404, 200], tarballStatuses: [404, 200] });
  try {
    const r = await start(WAIT, ['--version', '6.14.0-beta.7', '--timeout-sec', '20', '--interval-sec', '0.1'], { env: { npm_config_registry: reg.url } });
    expect(r.code, r.out).toBe(0);
    expect(r.stdout).toContain('OK: universal-dev-standards@6.14.0-beta.7 is on the registry');
    // read back from the server: the version document was asked for three times, then the tarball twice (once not yet there)
    expect(reg.count(/^GET \/universal-dev-standards\/6\.14\.0-beta\.7$/)).toBe(4);
    expect(reg.count(/^HEAD \/tarballs\/uds\.tgz$/)).toBe(2);
  } finally {
    await reg.close();
  }
});

it('a version that never appears exits 1 and says, in English and Chinese, in the log and in the job summary, that the package is not published and this is not a platform failure (XSPEC-471 R1)', async () => {
  const reg = await registry({ versionStatuses: [404] });
  try {
    const summary = tmp.next('summary.md');
    const r = await waitFor(reg, [], '6.14.0-beta.7', { GITHUB_STEP_SUMMARY: summary });
    expect(r.code, r.out).toBe(1);
    expect(r.stderr).toContain('NOT PUBLISHED');
    expect(r.stderr).toContain('套件未上架，不是平台失敗');
    expect(r.stderr).toContain('NOT a platform failure');
    expect(readFileSync(summary, 'utf-8')).toContain('套件未上架，不是平台失敗');
    // it asked more than once before giving up (polling, not one look)
    expect(reg.count(/^GET /)).toBeGreaterThan(2);
  } finally {
    await reg.close();
  }
});

it('a registry that answers with errors exits 2 and does NOT claim the package is missing; a version document for another version, and a tarball that stays 404, both count as not published (XSPEC-471 R1)', async () => {
  const broken = await registry({ versionStatuses: [503] });
  try {
    const r = await waitFor(broken);
    expect(r.code, r.out).toBe(2);
    expect(r.stderr).toContain('COULD NOT ASK');
    expect(r.out).not.toContain('套件未上架');
    expect(r.out).not.toContain('NOT PUBLISHED');
  } finally {
    await broken.close();
  }

  const other = await registry({ versionStatuses: [200], versionBody: { version: '9.9.9', dist: { tarball: 'http://127.0.0.1:1/never' } } });
  try {
    const r = await waitFor(other);
    expect(r.code, r.out).toBe(1);
    expect(r.stderr).toContain('NOT PUBLISHED');
    expect(r.stderr).toContain('not 6.14.0-beta.7');
  } finally {
    await other.close();
  }

  const noTarball = await registry({ versionStatuses: [200], tarballStatuses: [404] });
  try {
    const r = await waitFor(noTarball);
    expect(r.code, r.out).toBe(1);
    expect(r.stderr).toContain('its tarball');
  } finally {
    await noTarball.close();
  }
});

it('arguments that would put something else into the registry URL or the command line are refused with exit 2 before any request (XSPEC-471 R1)', async () => {
  const reg = await registry({ versionStatuses: [200] });
  try {
    for (const bad of ['6.14.0/../x', '6.14.0 && echo hi', '$(id)', '']) {
      const r = await start(WAIT, ['--version', bad], { env: { npm_config_registry: reg.url } });
      expect(r.code, `${bad}: ${r.out}`).toBe(2);
    }
    expect((await start(WAIT, [], { env: { npm_config_registry: reg.url } })).code).toBe(2);
    expect(reg.requests, 'no request was made for a refused argument').toEqual([]);
  } finally {
    await reg.close();
  }
});

it('weakening the wait program turns the properties red: a document for the wrong version, or a missing tarball, would be taken for a resolvable package (XSPEC-471 R1)', async () => {
  const copyWith = (from, to) => {
    const root = tmp.next('copy');
    const file = join(copyProgram(root), 'wait-for-npm.mjs');
    weaken(file, from, to);
    return file;
  };
  const wrongVersion = () => registry({ versionStatuses: [200], versionBody: { version: '9.9.9', dist: { tarball: 'http://127.0.0.1:1/never' } } });

  // control: the unweakened program says "not published" for the wrong-version document (same arm as above)
  const control = await wrongVersion();
  try {
    expect((await start(WAIT, ['--version', '6.14.0-beta.7', '--timeout-sec', '1', '--interval-sec', '0.1'], { env: { npm_config_registry: control.url } })).code).toBe(1);
  } finally {
    await control.close();
  }

  // weakened: the version in the document is not compared, so the program goes on to the tarball (here a dead address) and cannot tell
  const noCompare = copyWith("if (doc.version !== version) return { kind: 'absent'", "if (false) return { kind: 'absent'");
  const a = await wrongVersion();
  try {
    expect((await start(noCompare, ['--version', '6.14.0-beta.7', '--timeout-sec', '1', '--interval-sec', '0.1'], { env: { npm_config_registry: a.url } })).code, 'a document for another version was not rejected as "absent"').not.toBe(1);
  } finally {
    await a.close();
  }

  // weakened: a 404 on the tarball is an error, not "not there yet", so "not published" becomes "could not ask"
  const noTarball404 = copyWith("if (head.status === 404) return { kind: 'absent'", "if (false) return { kind: 'absent'");
  const b = await registry({ versionStatuses: [200], tarballStatuses: [404] });
  try {
    expect((await start(noTarball404, ['--version', '6.14.0-beta.7', '--timeout-sec', '1', '--interval-sec', '0.1'], { env: { npm_config_registry: b.url } })).code).toBe(2);
  } finally {
    await b.close();
  }
});

// ───────────────────────────── resolve-version ─────────────────────────────

it('the version comes from package.json or from what was typed, is written to the step output, and a tag that disagrees is only a warning (XSPEC-471 R1)', async () => {
  const pkg = tmp.next('package.json');
  writeFileSync(pkg, JSON.stringify({ name: 'universal-dev-standards', version: '6.14.0-beta.8' }));
  const out = tmp.next('github-output');
  const a = await start(RESOLVE, ['--from-package', pkg, '--tag', 'v6.14.0-beta.8'], { env: { GITHUB_OUTPUT: out } });
  expect(a.code, a.out).toBe(0);
  expect(a.stdout.trim()).toBe('version=6.14.0-beta.8');
  expect(readFileSync(out, 'utf-8')).toBe('version=6.14.0-beta.8\n');
  expect(a.stderr).not.toContain('WARNING');

  const b = await start(RESOLVE, ['--from-package', pkg, '--tag', 'v6.14.0']);
  expect(b.code, b.out).toBe(0);
  expect(b.stdout.trim()).toBe('version=6.14.0-beta.8');
  expect(b.stderr).toContain('WARNING');
  expect(b.stderr).toContain('v6.14.0');

  const c = await start(RESOLVE, ['--version', '6.13.2']);
  expect(c.code, c.out).toBe(0);
  expect(c.stdout.trim()).toBe('version=6.13.2');
});

it('a dist-tag, a range, a shortened or padded version, or text that is a shell command exits 2 and writes no output (XSPEC-471 R1)', async () => {
  for (const bad of ['beta', 'latest', '^6.14.0', '6.14', '6.14.0 ', '6.14.0; echo hi', '$(id)', '../6.14.0', 'v6.14.0']) {
    const out = tmp.next('github-output');
    const r = await start(RESOLVE, ['--version', bad], { env: { GITHUB_OUTPUT: out } });
    expect(r.code, `${JSON.stringify(bad)}: ${r.out}`).toBe(2);
    expect(existsSync(out), `${JSON.stringify(bad)} must write nothing`).toBe(false);
  }
  const noSource = await start(RESOLVE, []);
  expect(noSource.code).toBe(2);
  const both = await start(RESOLVE, ['--version', '6.14.0', '--from-package', join(REPO, 'cli', 'package.json')]);
  expect(both.code).toBe(2);
  const missing = await start(RESOLVE, ['--from-package', join(tmp.dir, 'no-such-package.json')]);
  expect(missing.code, missing.out).toBe(2);
  expect(missing.stderr).toContain('cannot read the version');
});

it('weakening the version check lets a dist-tag through and the property turns red (XSPEC-471 R1)', async () => {
  const root = tmp.next('copy');
  const file = join(copyProgram(root), 'resolve-version.mjs');
  weaken(file, "if (typeof version !== 'string' || !EXACT_VERSION.test(version)) {", 'if (false) {');
  const r = await start(file, ['--version', 'beta']);
  expect(r.code, 'a dist-tag was accepted').toBe(0);
  expect((await start(RESOLVE, ['--version', 'beta'])).code, 'control').toBe(2);
});

// ───────────────────────────── reports made by the real program ─────────────────────────────

const AUTO = { id: 'automatic', title: 'an automatic step', uds: ['echo', 'fine'], expect: { contains: ['fine'] } };
const BAD = { id: 'wrong-exit', title: 'a step whose command exits 1', uds: ['exit', '1'], expect: { exit: 0, contains: ['exiting with 0'] } };
const MANUAL = { id: 'looks-right', title: 'a step that needs a person', uds: ['echo', 'look'], expect: { contains: ['look'] }, human: { prompt: 'Is it readable?', promptZh: '能閱讀嗎？' } };

/**
 * A report written by the real run.mjs with an injected installer, with its install kind changed to the registry's, because
 * a post-publish report is that and the summary refuses anything else. The platform and the steps are the real ones.
 */
function realReport(steps, { version = '6.14.0-beta.7', kind = 'npm-registry' } = {}) {
  const outDir = tmp.next('reports');
  const installer = writeInstaller(tmp.next('installer.mjs'), version);
  const r = runAcceptance(['--installer', installer, '--steps', writeSteps(tmp.next('steps.json'), steps), '--version', version, '--label', 'ci-test', '--non-interactive'], { outDir });
  const [file] = readdirSync(outDir).filter((n) => n.endsWith('.json'));
  const json = JSON.parse(readFileSync(join(outDir, file), 'utf-8'));
  json.uds.installKind = kind;
  writeFileSync(join(outDir, file), JSON.stringify(json));
  return { outDir, file, json, runCode: r.code };
}

const summarize = async (outDir, extra = [], env = {}) => {
  const summary = tmp.next('step-summary.md');
  const r = await start(SUMMARY, ['--dir', outDir, '--label', 'ci-test', ...extra], { env: { GITHUB_STEP_SUMMARY: summary, ...env } });
  return { ...r, summary: existsSync(summary) ? readFileSync(summary, 'utf-8') : '' };
};

// ───────────────────────────── ci-summary ─────────────────────────────

it('a report with a failed automated step makes the job red and the summary names the step and what did not hold (XSPEC-471 R1)', async () => {
  const { outDir, runCode } = realReport([AUTO, BAD]);
  expect(runCode, 'control: the run itself reports the failure').toBe(1);
  const r = await summarize(outDir, ['--version', '6.14.0-beta.7']);
  expect(r.code, r.out).toBe(1);
  expect(r.summary).toContain('RED 失敗');
  expect(r.summary).toContain('| 1 | 1 | 0 | 0 | 0 |');
  expect(r.summary).toContain('Failed steps | 失敗的步驟 (1)');
  expect(r.summary).toContain('`wrong-exit` — a step whose command exits 1');
  expect(r.summary).toContain('exit code');
  expect(r.summary).not.toContain('`automatic` —');
});

it('a report whose automated steps all passed is green, and manual items nobody confirmed are listed as not confirmed and are not failures (XSPEC-471 R1)', async () => {
  const { outDir } = realReport([AUTO, MANUAL]);
  const r = await summarize(outDir, ['--version', '6.14.0-beta.7']);
  expect(r.code, r.out).toBe(0);
  expect(r.summary).toContain('GREEN 通過');
  expect(r.summary).toContain('| 1 | 0 | 1 | 0 | 0 |');
  expect(r.summary).toContain('Manual items not confirmed (not failures)');
  expect(r.summary).toContain('`looks-right`');
  expect(r.summary).not.toContain('Failed steps');
});

it('no report at all, a report for another version, and a package that was not installed from the registry each make the job red, with the reason (XSPEC-471 R1)', async () => {
  const empty = tmp.next('empty');
  mkdirSync(empty);
  const none = await summarize(empty);
  expect(none.code, none.out).toBe(1);
  expect(none.summary).toContain('there is no acceptance report');

  const missingDir = await summarize(join(tmp.dir, 'does-not-exist'));
  expect(missingDir.code).toBe(1);

  const { outDir } = realReport([AUTO]);
  const wrongVersion = await summarize(outDir, ['--version', '9.9.9']);
  expect(wrongVersion.code, wrongVersion.out).toBe(1);
  expect(wrongVersion.summary).toContain('not 9.9.9');

  const injected = realReport([AUTO], { kind: 'injected-installer' });
  const notRegistry = await summarize(injected.outDir);
  expect(notRegistry.code, notRegistry.out).toBe(1);
  expect(notRegistry.summary).toContain('was not installed from the npm registry (injected-installer)');
});

it('a run that tested nothing, or could not run, is red even though no step failed (XSPEC-471 R1)', async () => {
  const nothing = realReport([MANUAL]);
  expect(nothing.json.verdict).toBe('no-steps');
  const a = await summarize(nothing.outDir);
  expect(a.code, a.out).toBe(1);
  expect(a.summary).toContain('no step passed');

  const outDir = tmp.next('reports');
  const r = runAcceptance(['--installer', writeInstaller(tmp.next('installer.mjs'), '1.0.0'), '--steps', writeSteps(tmp.next('steps.json'), [AUTO]), '--version', '2.0.0', '--non-interactive'], { outDir });
  expect(r.code, 'control: the run could not finish').toBe(2);
  const [file] = readdirSync(outDir).filter((n) => n.endsWith('.json'));
  const json = JSON.parse(readFileSync(join(outDir, file), 'utf-8'));
  json.uds.installKind = 'npm-registry';
  writeFileSync(join(outDir, file), JSON.stringify(json));
  const b = await summarize(outDir);
  expect(b.code, b.out).toBe(1);
  expect(b.summary).toContain('the run could not finish');
});

it('weakening the summary so that a failed step no longer turns the job red is caught (XSPEC-471 R1)', async () => {
  const { outDir } = realReport([AUTO, BAD]);
  const root = tmp.next('copy');
  const file = join(copyProgram(root), 'ci-summary.mjs');
  weaken(file, 'if (problems.length) red = true;', 'if (false) red = true;');
  const weak = await start(file, ['--dir', outDir, '--label', 'ci-test']);
  expect(weak.code, 'a failed step left the job green').toBe(0);
  expect((await summarize(outDir)).code, 'control').toBe(1);
});

// ───────────────────────────── fetch-ci-reports ─────────────────────────────

const FAKE_GH = `
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const args = process.argv.slice(2);
const fx = JSON.parse(readFileSync(process.env.FAKE_GH_FIXTURE, 'utf-8'));
appendFileSync(fx.log, JSON.stringify(args) + '\\n');
if (fx.failApi && args[0] === 'api') { console.error('HTTP 401: bad credentials'); process.exit(1); }
if (args[0] === 'repo') { console.log(fx.repo); process.exit(0); }
if (args[0] === 'api') {
  const page = Number(/&page=(\\d+)/.exec(args[args.length - 1])[1]);
  console.log(JSON.stringify({ total_count: fx.artifacts.length, artifacts: page === 1 ? fx.artifacts : [] }));
  process.exit(0);
}
if (args[0] === 'run' && args[1] === 'download') {
  const name = args[args.indexOf('-n') + 1];
  const dir = args[args.indexOf('-D') + 1];
  const run = args[2];
  const source = join(fx.files, run + '--' + name);
  if (!existsSync(source)) { console.error('no artifact ' + name + ' in run ' + run); process.exit(1); }
  mkdirSync(dir, { recursive: true });
  cpSync(source, dir, { recursive: true });
  process.exit(0);
}
console.error('fake gh does not know: ' + args.join(' '));
process.exit(64);
`;

/** A fixture for the fake gh: the artifact list, and the files each (run, artifact) holds. */
function ghFixture({ artifacts, files, repo = 'AsiaOstrich/universal-dev-standards', failApi = false }) {
  const dir = tmp.next('gh');
  mkdirSync(join(dir, 'files'), { recursive: true });
  const program = join(dir, 'fake-gh.mjs');
  writeFileSync(program, FAKE_GH);
  for (const [key, entries] of Object.entries(files)) {
    mkdirSync(join(dir, 'files', key), { recursive: true });
    for (const [name, content] of Object.entries(entries)) writeFileSync(join(dir, 'files', key, name), content);
  }
  const fixture = join(dir, 'fixture.json');
  const log = join(dir, 'calls.log');
  writeFileSync(log, '');
  writeFileSync(fixture, JSON.stringify({ artifacts, files: join(dir, 'files'), log, repo, failApi }));
  return { program, fixture, calls: () => readFileSync(log, 'utf-8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) };
}

/** A report as one platform's job would have uploaded it (the shape is the real run's; the platform and counts are set). */
function platformReport(platform, { version = '6.14.0-beta.7', verdict = 'pass', failed = 0, kind = 'npm-registry' } = {}) {
  const base = realReport([AUTO], { version }).json;
  return {
    ...base,
    verdict,
    uds: { ...base.uds, version, installKind: kind },
    environment: { ...base.environment, platform },
    counts: { ...base.counts, failed },
    finishedAt: '2026-10-10T01:02:03.000Z',
  };
}
const reportFiles = (report, name) => ({ [`${name}.json`]: JSON.stringify(report), [`${name}.md`]: `# report ${name}\n` });
const art = (id, name, run, createdAt, expired = false) => ({ id, name, expired, created_at: createdAt, workflow_run: { id: run } });

const fetchReports = (gh, args, { cwd = REPO, script = FETCH } = {}) =>
  start(script, ['--version', ...args.slice(0, 1), '--gh-js', gh.program, ...args.slice(1)], { env: { FAKE_GH_FIXTURE: gh.fixture }, cwd });

it('downloads the newest artifact of each label for exactly this version and places the reports in the version folder, leaving out expired artifacts, older uploads, another version and other artifacts (XSPEC-471 R1)', async () => {
  const V = '6.14.0';
  const win = platformReport('windows', { version: V });
  const mac = platformReport('macos', { version: V });
  const oldWin = platformReport('windows', { version: V, verdict: 'fail', failed: 2 });
  const gh = ghFixture({
    artifacts: [
      art(1, `acceptance-ci-windows-${V}`, 100, '2026-10-10T01:00:00Z'),
      art(2, `acceptance-ci-windows-${V}`, 99, '2026-10-09T01:00:00Z'),
      art(3, `acceptance-ci-macos-${V}`, 100, '2026-10-10T01:00:00Z'),
      art(4, `acceptance-ci-linux-${V}`, 100, '2026-10-10T01:00:00Z', true),
      art(5, `acceptance-ci-linux-${V}-beta.7`, 98, '2026-10-10T02:00:00Z'),
      art(6, 'coverage-report', 100, '2026-10-10T01:00:00Z'),
    ],
    files: {
      [`100--acceptance-ci-windows-${V}`]: reportFiles(win, 'uds-beta-acceptance-6.14.0-windows-20261010-010203'),
      [`99--acceptance-ci-windows-${V}`]: reportFiles(oldWin, 'uds-beta-acceptance-6.14.0-windows-20261009-010203'),
      [`100--acceptance-ci-macos-${V}`]: reportFiles(mac, 'uds-beta-acceptance-6.14.0-macos-20261010-010204'),
    },
  });
  const dest = tmp.next('dest');
  const r = await fetchReports(gh, [V, '--dest', dest, '--no-generate']);
  expect(r.code, r.out).toBe(0);
  expect(readdirSync(dest).sort()).toEqual([
    'uds-beta-acceptance-6.14.0-macos-20261010-010204.json',
    'uds-beta-acceptance-6.14.0-macos-20261010-010204.md',
    'uds-beta-acceptance-6.14.0-windows-20261010-010203.json',
    'uds-beta-acceptance-6.14.0-windows-20261010-010203.md',
  ]);
  const placed = JSON.parse(readFileSync(join(dest, 'uds-beta-acceptance-6.14.0-windows-20261010-010203.json'), 'utf-8'));
  expect(placed.verdict).toBe('pass');
  expect(r.stdout).toContain('platform windows: has a report');
  expect(r.stdout).toContain('platform macos: has a report');
  expect(r.stdout).toContain('platform linux: NO report in the folder');
  // which downloads were made: runs 100 for windows and macos, never the older run or the expired and decoy artifacts
  const downloads = gh.calls().filter((a) => a[0] === 'run').map((a) => `${a[2]} ${a[a.indexOf('-n') + 1]}`).sort();
  expect(downloads).toEqual([`100 acceptance-ci-macos-${V}`, `100 acceptance-ci-windows-${V}`]);
});

it('a report that is for another version, or was not installed from the registry, is refused with exit 1 and is not placed; what is valid still is (XSPEC-471 R1)', async () => {
  const V = '6.14.0';
  const gh = ghFixture({
    artifacts: [
      art(1, `acceptance-ci-windows-${V}`, 100, '2026-10-10T01:00:00Z'),
      art(2, `acceptance-ci-macos-${V}`, 100, '2026-10-10T01:00:00Z'),
      art(3, `acceptance-ci-linux-${V}`, 100, '2026-10-10T01:00:00Z'),
    ],
    files: {
      [`100--acceptance-ci-windows-${V}`]: reportFiles(platformReport('windows', { version: '6.14.0-beta.6' }), 'wrong-version'),
      [`100--acceptance-ci-macos-${V}`]: reportFiles(platformReport('macos', { version: V }), 'good-macos'),
      [`100--acceptance-ci-linux-${V}`]: reportFiles(platformReport('linux', { version: V, kind: 'local-source' }), 'from-folder'),
    },
  });
  const dest = tmp.next('dest');
  const r = await fetchReports(gh, [V, '--dest', dest, '--no-generate']);
  expect(r.code, r.out).toBe(1);
  expect(r.stderr).toContain('REFUSED acceptance-ci-windows-6.14.0/wrong-version.json');
  expect(r.stderr).toContain('not 6.14.0');
  expect(r.stderr).toContain('REFUSED acceptance-ci-linux-6.14.0/from-folder.json');
  expect(r.stderr).toContain('not installed from the npm registry (local-source)');
  expect(readdirSync(dest).sort()).toEqual(['good-macos.json', 'good-macos.md']);
});

it('says so and exits 1 when no artifact matches, and exits 2 when gh itself fails, so "nothing there" and "could not ask" differ (XSPEC-471 R1)', async () => {
  const none = ghFixture({ artifacts: [art(1, 'acceptance-ci-windows-1.0.0', 5, '2026-10-10T01:00:00Z')], files: {} });
  const a = await fetchReports(none, ['6.14.0', '--dest', tmp.next('dest'), '--no-generate']);
  expect(a.code, a.out).toBe(1);
  expect(a.stderr).toContain('no artifact named acceptance-ci-<label>-6.14.0');

  const broken = ghFixture({ artifacts: [], files: {}, failApi: true });
  const b = await fetchReports(broken, ['6.14.0', '--dest', tmp.next('dest'), '--no-generate']);
  expect(b.code, b.out).toBe(2);
  expect(b.stderr).toContain('gh api failed');
  expect(b.stderr).toContain('bad credentials');
});

it('asks gh for the repository artifact list and downloads with the run id, the artifact name and a directory, in the form the real gh takes (XSPEC-471 R1)', async () => {
  const V = '6.14.0';
  const gh = ghFixture({
    artifacts: [art(1, `acceptance-ci-linux-${V}`, 321, '2026-10-10T01:00:00Z')],
    files: { [`321--acceptance-ci-linux-${V}`]: reportFiles(platformReport('linux', { version: V }), 'linux-report') },
    repo: 'Some/Repo',
  });
  const r = await fetchReports(gh, [V, '--dest', tmp.next('dest'), '--no-generate']);
  expect(r.code, r.out).toBe(0);
  const calls = gh.calls();
  expect(calls[0]).toEqual(['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
  expect(calls[1]).toEqual(['api', '--method', 'GET', 'repos/Some/Repo/actions/artifacts?per_page=100&page=1']);
  const download = calls[2];
  expect(download.slice(0, 5)).toEqual(['run', 'download', '321', '-R', 'Some/Repo']);
  expect(download.slice(5, 7)).toEqual(['-n', `acceptance-ci-linux-${V}`]);
  expect(download[7]).toBe('-D');
});

it('when the version is the one in cli/package.json, the PRE-RELEASE "verified on" block is regenerated from the placed reports (XSPEC-471 R1)', async () => {
  const V = '6.14.0-beta.7';
  const root = tmp.next('root');
  const program = copyProgram(root);
  mkdirSync(join(root, 'docs'), { recursive: true });
  mkdirSync(join(root, 'cli'), { recursive: true });
  copyFileSync(join(REPO, 'docs', 'PRE-RELEASE.md'), join(root, 'docs', 'PRE-RELEASE.md'));
  copyFileSync(join(REPO, 'CHANGELOG.md'), join(root, 'CHANGELOG.md'));
  writeFileSync(join(root, 'cli', 'package.json'), JSON.stringify({ name: 'universal-dev-standards', version: V }));
  // the copy has no reports folder, so one run of the generator makes every platform "not yet verified" whatever the repository says today
  const reset = spawnSync(process.execPath, [join(program, 'generate-pre-release.mjs')], { cwd: root, encoding: 'utf-8' });
  expect(reset.status, reset.stdout + reset.stderr).toBe(0);
  const before = readFileSync(join(root, 'docs', 'PRE-RELEASE.md'), 'utf-8');
  expect(before, 'control: nothing is verified in the copy yet').toMatch(/\| Windows \| Not yet verified/);

  const gh = ghFixture({
    artifacts: [art(1, `acceptance-ci-windows-${V}`, 100, '2026-10-10T01:00:00Z')],
    files: { [`100--acceptance-ci-windows-${V}`]: reportFiles(platformReport('windows', { version: V }), `uds-beta-acceptance-${V}-windows-20261010-010203`) },
  });
  const r = await fetchReports(gh, [V], { cwd: root, script: join(program, 'fetch-ci-reports.mjs') });
  expect(r.code, r.out).toBe(0);
  expect(existsSync(join(root, 'scripts', 'beta-acceptance', 'reports', V, `uds-beta-acceptance-${V}-windows-20261010-010203.json`))).toBe(true);
  const after = readFileSync(join(root, 'docs', 'PRE-RELEASE.md'), 'utf-8');
  expect(after).toMatch(/\| Windows \| Verified 已驗證 \|/);
  expect(after).toMatch(/\| macOS \| Not yet verified/);
});

it('weakening the fetch program so that it places nothing, or does not refuse a report for another version, is caught (XSPEC-471 R1)', async () => {
  const V = '6.14.0';
  const gh = () => ghFixture({
    artifacts: [art(1, `acceptance-ci-windows-${V}`, 100, '2026-10-10T01:00:00Z')],
    files: { [`100--acceptance-ci-windows-${V}`]: reportFiles(platformReport('windows', { version: '6.14.0-beta.6' }), 'wrong-version') },
  });
  const copyWith = (from, to) => {
    const file = join(copyProgram(tmp.next('copy')), 'fetch-ci-reports.mjs');
    weaken(file, from, to);
    return file;
  };

  const dest = tmp.next('dest');
  const control = await fetchReports(gh(), [V, '--dest', dest, '--no-generate']);
  expect(control.code, 'control').toBe(1);
  expect(readdirSync(dest)).toEqual([]);

  const noRefusal = copyWith('if (reasons.length) {', 'if (false) {');
  const dest2 = tmp.next('dest');
  await fetchReports(gh(), [V, '--dest', dest2, '--no-generate'], { script: noRefusal });
  expect(readdirSync(dest2).length, 'a report for another version was placed').toBeGreaterThan(0);
});

// ───────────────────────────── the workflow file, and the commands it runs ─────────────────────────────

const workflow = () => load(readFileSync(WORKFLOW, 'utf-8'));
const accept = () => workflow().jobs.accept;
const stepNamed = (job, name) => {
  const s = job.steps.find((x) => x.name === name);
  expect(s, `a step named "${name}"`).toBeTruthy();
  return s;
};
const VERSION = '9.8.7-test.1';

/** The command line of a step as the file has it, with the two expressions it may contain filled in, split into words. */
function commandOf(step, label = 'ci-test') {
  const text = step.run
    .replaceAll('${{ needs.resolve.outputs.version }}', VERSION)
    .replaceAll('${{ matrix.label }}', label);
  expect(text, 'the step uses an expression this test does not know').not.toContain('${{');
  const words = [];
  const re = /"([^"]*)"|(\S+)/g;
  for (let m = re.exec(text); m; m = re.exec(text)) words.push(m[1] !== undefined ? m[1] : m[2]);
  expect(words[0]).toBe('node');
  return { script: join(REPO, words[1]), args: words.slice(2), text };
}

it('the workflow starts after "Publish to npm" finished, only for a successful release, or by hand with a version, and has no fixed wait (XSPEC-471 R1)', () => {
  const wf = workflow();
  const publish = load(readFileSync(join(REPO, '.github', 'workflows', 'publish.yml'), 'utf-8'));
  expect(wf.on.workflow_run.workflows).toEqual([publish.name]);
  expect(wf.on.workflow_run.types).toEqual(['completed']);
  expect(wf.on.workflow_dispatch.inputs.version.required).toBe(true);
  expect(wf.on.workflow_dispatch.inputs.ref.required).toBe(false);
  expect(wf.on.release, 'it must not start from the release event: that is the fixed wait that went red twice').toBeUndefined();
  expect(wf.permissions).toEqual({ contents: 'read' });

  const gate = wf.jobs.resolve.if;
  // a manual start of publish.yml also ends "success" with nothing published; only a release counts
  expect(gate).toContain("github.event.workflow_run.conclusion == 'success'");
  expect(gate).toContain("github.event.workflow_run.event == 'release'");
  expect(gate).toContain("github.event_name == 'workflow_dispatch'");
  expect(accept().needs).toBe('resolve');
  expect(readFileSync(WORKFLOW, 'utf-8')).not.toMatch(/\bsleep\b/);
});

it('the acceptance job runs on Linux, macOS and Windows (from pwsh, cmd and Git Bash), without one red system hiding the others (XSPEC-471 R1)', () => {
  const job = accept();
  expect(job.strategy['fail-fast']).toBe(false);
  expect(job['runs-on']).toBe('${{ matrix.os }}');
  const rows = job.strategy.matrix.include.map((m) => `${m.os}|${m.shell}|${m.label}`);
  expect(rows).toEqual([
    'ubuntu-latest|bash|ci-linux',
    'macos-latest|bash|ci-macos',
    'windows-latest|pwsh|ci-windows',
    'windows-latest|cmd|ci-windows-cmd',
    'windows-latest|bash|ci-windows-gitbash',
  ]);
  // `shell:` cannot take an expression, so there is one step per shell and the matrix picks it with `if:`; the command is the same text
  const runSteps = ['bash', 'pwsh', 'cmd'].map((sh) => stepNamed(job, `Run acceptance (${sh})`));
  runSteps.forEach((s, i) => {
    const sh = ['bash', 'pwsh', 'cmd'][i];
    expect(s.shell).toBe(sh);
    expect(s.if).toBe(`\${{ matrix.shell == '${sh}' }}`);
    expect(s.run).toBe(runSteps[0].run);
  });
  expect([...new Set(job.strategy.matrix.include.map((m) => m.shell))].sort(), 'every shell of the matrix has a step').toEqual(['bash', 'cmd', 'pwsh']);
  // the checkout is the commit that resolve pinned, so every system tests the same list
  expect(stepNamed(job, 'Checkout').with.ref).toBe('${{ needs.resolve.outputs.ref }}');
  const resolveCheckout = stepNamed(workflow().jobs.resolve, 'Checkout');
  expect(resolveCheckout.with.ref).toContain('github.event.workflow_run.head_sha');
});

it('the order is wait for npm, run, summary, upload, and the summary and upload run when the run failed but not when the wait did (XSPEC-471 R1)', () => {
  const names = accept().steps.map((s) => s.name);
  expect(names).toEqual(['Checkout', 'Setup Node.js', 'Wait until the version can be installed', 'Run acceptance (bash)', 'Run acceptance (pwsh)', 'Run acceptance (cmd)', 'Summarize the report', 'Upload the report']);
  for (const n of ['Summarize the report', 'Upload the report']) {
    const s = stepNamed(accept(), n);
    expect(s.if, n).toContain('always()');
    expect(s.if, n).toContain("steps.wait.outcome == 'success'");
  }
  // the run steps carry no `success()` condition of their own beyond the shell: they follow the wait step, so a missing package stops the job there
  for (const sh of ['bash', 'pwsh', 'cmd']) expect(stepNamed(accept(), `Run acceptance (${sh})`).if).not.toContain('always()');
});

it('no run step puts the typed version, the tag or the ref into script text; they reach the programs through env only (XSPEC-471 R1)', () => {
  const wf = workflow();
  for (const [jobName, job] of Object.entries(wf.jobs)) {
    for (const s of job.steps) {
      if (!s.run) continue;
      expect(s.run, `${jobName}/${s.name}`).not.toMatch(/\$\{\{\s*(inputs|github\.event)\b/);
    }
  }
  const resolveStep = stepNamed(wf.jobs.resolve, 'Resolve the published version');
  expect(Object.keys(resolveStep.env).sort()).toEqual(['EVENT_NAME', 'INPUT_VERSION', 'RELEASE_TAG']);
});

it('the run step of the workflow, as written, is accepted by run.mjs, asks for no questions, and writes the folder that the summary reads and the upload takes (XSPEC-471 R1)', async () => {
  const run = commandOf(stepNamed(accept(), 'Run acceptance (cmd)'), 'ci-windows-cmd');
  expect(run.script).toBe(join(ACCEPT, 'run.mjs'));
  const opts = parseArgs(run.args);
  expect(opts).toMatchObject({ version: VERSION, versionGiven: true, label: 'ci-windows-cmd', nonInteractive: true });

  // run it from the workflow's own words (plus the two options that stand in for the registry), then read the report with the workflow's own summary command
  const work = tmp.next('job');
  mkdirSync(work);
  const installer = writeInstaller(tmp.next('installer.mjs'), VERSION);
  const steps = writeSteps(tmp.next('steps.json'), [AUTO, MANUAL]);
  const r = await start(run.script, [...run.args, '--installer', installer, '--steps', steps], { cwd: work });
  expect(r.code, r.out).toBe(0);
  const dirName = run.args[run.args.indexOf('--out') + 1];
  const files = readdirSync(join(work, dirName)).filter((n) => n.endsWith('.json'));
  expect(files.length).toBe(1);
  const reportPath = join(work, dirName, files[0]);
  const report = JSON.parse(readFileSync(reportPath, 'utf-8'));
  expect(report.label).toBe('ci-windows-cmd');
  expect(report.counts).toMatchObject({ passed: 1, humanUnconfirmed: 1, failed: 0 });
  report.uds.installKind = 'npm-registry'; // an injected installer stands in for the registry here
  writeFileSync(reportPath, JSON.stringify(report));

  const sum = commandOf(stepNamed(accept(), 'Summarize the report'), 'ci-windows-cmd');
  const summaryFile = tmp.next('step-summary.md');
  const s = await start(sum.script, sum.args, { cwd: work, env: { GITHUB_STEP_SUMMARY: summaryFile } });
  expect(s.code, s.out).toBe(0);
  expect(readFileSync(summaryFile, 'utf-8')).toContain('Post-publish acceptance — ci-windows-cmd (');
  expect(readFileSync(summaryFile, 'utf-8')).toContain('| 1 | 0 | 1 | 0 | 0 |');

  const upload = stepNamed(accept(), 'Upload the report');
  expect(upload.with.path, 'the upload takes the folder the run wrote').toBe(`${dirName}/`);
  expect(upload.with['if-no-files-found']).toBe('error');
});

it('the wait step of the workflow, as written, succeeds against a registry that has the version and fails with the "not published" message against one that has not (XSPEC-471 R1)', async () => {
  const wait = commandOf(stepNamed(accept(), 'Wait until the version can be installed'));
  expect(wait.script).toBe(WAIT);
  const there = await registry({ versionStatuses: [200] });
  try {
    const r = await start(wait.script, wait.args, { env: { npm_config_registry: there.url } });
    expect(r.code, r.out).toBe(0);
    expect(there.requests[0]).toBe(`GET /universal-dev-standards/${VERSION}`);
  } finally {
    await there.close();
  }
  const absent = await registry({ versionStatuses: [404] });
  try {
    // the workflow's own limit is 20 minutes; the test shortens it, which is the one thing it adds
    const r = await start(wait.script, [...wait.args, '--timeout-sec', '1', '--interval-sec', '0.1'], { env: { npm_config_registry: absent.url } });
    expect(r.code, r.out).toBe(1);
    expect(r.stderr).toContain('套件未上架，不是平台失敗');
  } finally {
    await absent.close();
  }
});

it('the artifact name the workflow gives is the name fetch-ci-reports looks for, for every label of the matrix (XSPEC-471 R1)', () => {
  const upload = stepNamed(accept(), 'Upload the report');
  for (const m of accept().strategy.matrix.include) {
    const name = upload.with.name.replaceAll('${{ matrix.label }}', m.label).replaceAll('${{ needs.resolve.outputs.version }}', VERSION);
    expect(name).not.toContain('${{');
    const { picked } = pickArtifacts([{ id: 1, name, expired: false, created_at: '2026-10-10T00:00:00Z', workflow_run: { id: 5 } }], VERSION);
    expect(picked.map((p) => p.label), name).toEqual([m.label]);
  }
});

it('the resolve step of the workflow, run in bash as written, gives the version of a release from package.json and refuses a typed dist-tag (XSPEC-471 R1)', (ctx) => {
  if (process.platform === 'win32') ctx.skip(); // the step is a POSIX shell script
  const step = stepNamed(workflow().jobs.resolve, 'Resolve the published version');
  const bash = (env) => spawnSync('bash', ['-c', step.run], { cwd: REPO, encoding: 'utf-8', env: { ...process.env, GITHUB_ACTIONS: '', ...env } });

  const out = tmp.next('github-output');
  const release = bash({ EVENT_NAME: 'workflow_run', INPUT_VERSION: '', RELEASE_TAG: 'v0.0.0-nomatch', GITHUB_OUTPUT: out });
  expect(release.status, release.stdout + release.stderr).toBe(0);
  expect(readFileSync(out, 'utf-8')).toMatch(/^version=\d+\.\d+\.\d+/);
  expect(release.stderr, 'a tag that is not the version is a warning').toContain('WARNING');

  const typedOut = tmp.next('github-output');
  const typed = bash({ EVENT_NAME: 'workflow_dispatch', INPUT_VERSION: '6.14.0-beta.7', RELEASE_TAG: '', GITHUB_OUTPUT: typedOut });
  expect(typed.status, typed.stdout + typed.stderr).toBe(0);
  expect(readFileSync(typedOut, 'utf-8')).toBe('version=6.14.0-beta.7\n');

  const refusedOut = tmp.next('github-output');
  const tag = bash({ EVENT_NAME: 'workflow_dispatch', INPUT_VERSION: 'beta', RELEASE_TAG: '', GITHUB_OUTPUT: refusedOut });
  expect(tag.status, 'a dist-tag typed by hand must stop the workflow').not.toBe(0);
  expect(existsSync(refusedOut)).toBe(false);
});

it('removing --non-interactive from the workflow, or pointing the summary at another folder, turns the properties red (XSPEC-471 R1)', () => {
  const text = readFileSync(WORKFLOW, 'utf-8');
  const stepsOf = (t) => load(t).jobs.accept.steps;
  const parsed = (t) => parseArgs(commandOf(stepsOf(t).find((s) => s.name === 'Run acceptance (bash)')).args);
  expect(parsed(text).nonInteractive, 'control').toBe(true);
  expect(parsed(text.replaceAll(' --non-interactive', '')).nonInteractive, 'weakened workflow').toBe(false);

  const dirOf = (t, name) => { const w = commandOf(stepsOf(t).find((s) => s.name === name)).args; return w[w.indexOf(name.startsWith('Run acceptance') ? '--out' : '--dir') + 1]; };
  expect(dirOf(text, 'Run acceptance (bash)')).toBe(dirOf(text, 'Summarize the report'));
  const moved = text.replace('--dir uds-beta-acceptance-reports', '--dir somewhere-else');
  expect(dirOf(moved, 'Run acceptance (bash)')).not.toBe(dirOf(moved, 'Summarize the report'));
});
