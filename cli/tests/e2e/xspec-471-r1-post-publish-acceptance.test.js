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
 *   scripts/beta-acceptance/wait-for-npm.mjs     if (!entry) return { kind: 'absent'
 *   scripts/beta-acceptance/wait-for-npm.mjs     if (npm.kind !== 'found') return npm;
 *   scripts/beta-acceptance/lib/install.mjs      if (!isVersionNotVisibleYet(seen)) break;
 *   scripts/beta-acceptance/lib/install.mjs      await sleep(wait);
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
import { copyProgram, REPO, runAcceptance, scratch, weaken, writeFakePackage, writeInstaller, writeSteps } from '../utils/xspec-469.js';
import { resolveNpm } from '../../../scripts/beta-acceptance/lib/install.mjs';
import { parseArgs } from '../../../scripts/beta-acceptance/run.mjs';
import { pickArtifacts } from '../../../scripts/beta-acceptance/fetch-ci-reports.mjs';

const tmp = scratch('uds-xspec471-r1-');
afterAll(() => tmp.cleanup());

const ACCEPT = join(REPO, 'scripts', 'beta-acceptance');
const WAIT = join(ACCEPT, 'wait-for-npm.mjs');
const RUN = join(ACCEPT, 'run.mjs');
const NPM_CACHE = tmp.next('npm-cache'); // npm keeps a package document for minutes; every test run starts with none
const RESOLVE = join(ACCEPT, 'resolve-version.mjs');
const SUMMARY = join(ACCEPT, 'ci-summary.mjs');
const FETCH = join(ACCEPT, 'fetch-ci-reports.mjs');
const WORKFLOW = join(REPO, '.github', 'workflows', 'post-publish-acceptance.yml');

/** Start a program the way the workflow does (a real child process) and wait for it. Async: the registry lives in this process. */
function start(script, args, { env = {}, cwd = REPO } = {}) {
  return new Promise((done) => {
    const child = spawn(process.execPath, [script, ...args], { cwd, env: { ...process.env, npm_config_cache: NPM_CACHE, GITHUB_ACTIONS: '', GITHUB_STEP_SUMMARY: '', GITHUB_OUTPUT: '', ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => { stdout += c; });
    child.stderr.on('data', (c) => { stderr += c; });
    child.on('close', (code) => done({ code, stdout, stderr, out: `${stdout}${stderr}` }));
  });
}

// ───────────────────────────── a registry the test controls ─────────────────────────────

const WAIT_VERSION = '6.14.0-beta.7';

/**
 * A registry that answers like npm's, and that the test reads back. It tells apart who is asking (by User-Agent): the
 * programs under test use Node's fetch ("own"), `npm view` and `npm install` send "npm/...". Each side counts its own requests.
 *
 *   packumentStatuses   the answer of the PACKAGE document (`/universal-dev-standards`, the one `npm install` reads) to the 1st, 2nd, ...
 *                       request of the program itself; the last one repeats.
 *   packumentVersions   the versions that each 200 of the package document lists (1st, 2nd, ... 200; the last repeats).
 *   npmStatuses / npmVersions   the same for requests from npm (default: always 200 and always listing the version).
 *   tarballStatuses     the answer of the tarball URL (GET and HEAD) to the 1st, 2nd, ...; the last repeats.
 *   tarball             bytes served as the tarball (default: empty).
 *   versionDocument     also serve `/universal-dev-standards/<version>` with 200 and a tarball for ANY version: what the first
 *                       version of wait-for-npm trusted, and what `npm install` never reads (2026-10-10, run 37969191195).
 */
async function registry({ version = WAIT_VERSION, packumentStatuses = [200], packumentVersions = [[version]], npmStatuses = null, npmVersions = null, tarballStatuses = [200], tarball = null, versionDocument = true }) {
  const requests = [];
  const counters = { own: 0, npm: 0, ownVersions: 0, npmVersions: 0, tarball: 0 };
  const lists = { own: [packumentStatuses, packumentVersions], npm: [npmStatuses || [200], npmVersions || [[version]]] };
  const next = (list, key) => list[Math.min(counters[key]++, list.length - 1)];
  const server = createServer((req, res) => {
    const who = /^npm\//.test(req.headers['user-agent'] || '') ? 'npm' : 'own';
    requests.push(`${who === 'npm' ? 'NPM ' : ''}${req.method} ${req.url}`);
    const base = `http://127.0.0.1:${server.address().port}`;
    if (req.url === '/universal-dev-standards' && req.method === 'GET') {
      const status = next(lists[who][0], who);
      if (status !== 200) {
        res.writeHead(status, { 'content-type': 'application/json' });
        res.end('{"error":"x"}');
        return;
      }
      const listed = next(lists[who][1], `${who}Versions`);
      const versions = Object.fromEntries(listed.map((v) => [v, { name: 'universal-dev-standards', version: v, dist: { tarball: `${base}/tarballs/uds.tgz` } }]));
      // as the real registry: a client may keep the document for 5 minutes and asks again with its ETag after that
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'public, max-age=300', etag: `"${listed.join(',') || 'none'}"` });
      res.end(JSON.stringify({ name: 'universal-dev-standards', 'dist-tags': listed.length ? { latest: listed[listed.length - 1] } : {}, versions }));
    } else if (versionDocument && req.method === 'GET' && /^\/universal-dev-standards\/[^/]+$/.test(req.url)) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ name: 'universal-dev-standards', version: decodeURIComponent(req.url.split('/')[2]), dist: { tarball: `${base}/tarballs/uds.tgz` } }));
    } else if (req.url === '/tarballs/uds.tgz') {
      const status = next(tarballStatuses, 'tarball');
      res.writeHead(status, tarball ? { 'content-type': 'application/octet-stream', 'content-length': tarball.length } : {});
      res.end(req.method === 'HEAD' || status !== 200 ? undefined : tarball || undefined);
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

const waitFor = async (reg, extra = [], version = WAIT_VERSION, env = {}) =>
  start(WAIT, ['--version', version, '--timeout-sec', '1', '--interval-sec', '0.1', ...extra], { env: { npm_config_registry: reg.url, ...env } });

const PACKUMENT = /^GET \/universal-dev-standards$/;
const NPM_PACKUMENT = /^NPM GET \/universal-dev-standards$/;

// ───────────────────────────── wait-for-npm ─────────────────────────────

it('keeps asking until the package document lists the version, its tarball answers and npm itself resolves it, then exits 0 without waiting any fixed time (XSPEC-471 R1)', async () => {
  const reg = await registry({ packumentStatuses: [404, 404, 200], tarballStatuses: [404, 200] });
  try {
    const r = await start(WAIT, ['--version', WAIT_VERSION, '--timeout-sec', '60', '--interval-sec', '0.1'], { env: { npm_config_registry: reg.url } });
    expect(r.code, r.out).toBe(0);
    expect(r.stdout).toContain(`OK: universal-dev-standards@${WAIT_VERSION} is on the registry`);
    // read back from the server: the package document was asked for four times (404, 404, 200 with the tarball not yet there, 200),
    // the tarball twice (once not yet there), and npm resolved it once, only after all of that
    expect(reg.count(PACKUMENT)).toBe(4);
    expect(reg.count(/^HEAD \/tarballs\/uds\.tgz$/)).toBe(2);
    expect(reg.count(NPM_PACKUMENT)).toBe(1);
    expect(reg.requests.findIndex((q) => NPM_PACKUMENT.test(q)), 'npm is asked only after the tarball answered').toBeGreaterThan(reg.requests.lastIndexOf('HEAD /tarballs/uds.tgz'));
  } finally {
    await reg.close();
  }
});

it('the 2026-10-10 incident: a version document that already answers 200 does not count while the package document that npm install reads does not list the version yet (XSPEC-471 R1)', async () => {
  // run 37969191195: GET /universal-dev-standards/6.14.0-beta.8 was 200 with a reachable tarball on the 8th poll, `npm install` of the same version failed at once.
  // Here the version document answers 200 from the first request; the package document lists the version only from its 4th answer.
  const reg = await registry({ packumentVersions: [[], [], [], [WAIT_VERSION]], versionDocument: true });
  try {
    const r = await start(WAIT, ['--version', WAIT_VERSION, '--timeout-sec', '60', '--interval-sec', '0.1'], { env: { npm_config_registry: reg.url } });
    expect(r.code, r.out).toBe(0);
    expect(reg.count(PACKUMENT), 'found only from the 4th answer of the package document').toBe(4);
    expect(r.stdout).toMatch(/attempt 1,.*: absent/);
    expect(r.stdout).toMatch(/attempt 4,.*: found/);
    expect(reg.count(/^GET \/universal-dev-standards\/./), 'the version document is not what is asked').toBe(0);
  } finally {
    await reg.close();
  }

  // and when the package document never lists it, the version document alone cannot make the package "published"
  const never = await registry({ packumentVersions: [[]], versionDocument: true });
  try {
    const r = await waitFor(never);
    expect(r.code, r.out).toBe(1);
    expect(r.stderr).toContain('NOT PUBLISHED');
    expect(r.stderr).toContain('套件未上架，不是平台失敗');
    expect(r.stderr).toContain(`do not include ${WAIT_VERSION}`);
  } finally {
    await never.close();
  }
});

it('npm itself has the last word: when the package document and tarball are fine but npm view still says "no such version", it keeps waiting, and when npm view breaks for another reason the result is "could not ask", not "not published" (XSPEC-471 R1)', async () => {
  // npm's own 1st request gets a document without the version (another edge, an older cache); its 2nd gets the version
  const edge = await registry({ npmVersions: [[], [WAIT_VERSION]] });
  try {
    const r = await start(WAIT, ['--version', WAIT_VERSION, '--timeout-sec', '60', '--interval-sec', '0.1'], { env: { npm_config_registry: edge.url } });
    expect(r.code, r.out).toBe(0);
    expect(r.stdout).toMatch(/attempt 1,.*: absent — npm view .*E404/);
    expect(r.stdout).toMatch(/attempt 2,.*: found/);
    expect(edge.count(PACKUMENT)).toBe(2);
    expect(edge.count(NPM_PACKUMENT)).toBe(2);
  } finally {
    await edge.close();
  }

  // npm is refused (403) while the program's own client is not: that is "could not ask" (exit 2) at the limit
  const refused = await registry({ npmStatuses: [403] });
  try {
    const r = await waitFor(refused);
    expect(r.code, r.out).toBe(2);
    expect(r.stderr).toContain('COULD NOT ASK');
    expect(r.out).not.toContain('NOT PUBLISHED');
    expect(r.out).not.toContain('套件未上架');
  } finally {
    await refused.close();
  }
});

it('a version that never appears exits 1 and says, in English and Chinese, in the log and in the job summary, that the package is not published and this is not a platform failure (XSPEC-471 R1)', async () => {
  const reg = await registry({ packumentStatuses: [404] });
  try {
    const summary = tmp.next('summary.md');
    const r = await waitFor(reg, [], WAIT_VERSION, { GITHUB_STEP_SUMMARY: summary });
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

it('a registry that answers with errors exits 2 and does NOT claim the package is missing; a package document without the version, and a tarball that stays 404, both count as not published (XSPEC-471 R1)', async () => {
  const broken = await registry({ packumentStatuses: [503] });
  try {
    const r = await waitFor(broken);
    expect(r.code, r.out).toBe(2);
    expect(r.stderr).toContain('COULD NOT ASK');
    expect(r.out).not.toContain('套件未上架');
    expect(r.out).not.toContain('NOT PUBLISHED');
  } finally {
    await broken.close();
  }

  const other = await registry({ packumentVersions: [['9.9.9']] });
  try {
    const r = await waitFor(other);
    expect(r.code, r.out).toBe(1);
    expect(r.stderr).toContain('NOT PUBLISHED');
    expect(r.stderr).toContain(`do not include ${WAIT_VERSION}`);
  } finally {
    await other.close();
  }

  const noTarball = await registry({ tarballStatuses: [404] });
  try {
    const r = await waitFor(noTarball);
    expect(r.code, r.out).toBe(1);
    expect(r.stderr).toContain('its tarball');
  } finally {
    await noTarball.close();
  }
});

it('arguments that would put something else into the registry URL or the command line are refused with exit 2 before any request (XSPEC-471 R1)', async () => {
  const reg = await registry({});
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

it('weakening the wait program turns the properties red: no package-document check, no npm check, a document for the wrong version, or a missing tarball would be taken for a resolvable package (XSPEC-471 R1)', async () => {
  const copyWith = (from, to) => {
    const root = tmp.next('copy');
    const file = join(copyProgram(root), 'wait-for-npm.mjs');
    weaken(file, from, to);
    return file;
  };
  const short = ['--version', WAIT_VERSION, '--timeout-sec', '1', '--interval-sec', '0.1'];
  const wrongVersion = () => registry({ packumentVersions: [['9.9.9']] });

  // control: the unweakened program says "not published" for the document that lists another version (same arm as above)
  const control = await wrongVersion();
  try {
    expect((await start(WAIT, short, { env: { npm_config_registry: control.url } })).code).toBe(1);
  } finally {
    await control.close();
  }

  // weakened: the package document is not checked for the version, so the program goes on to the (dead) tarball and cannot tell
  const noCompare = copyWith("if (!entry) return { kind: 'absent'", "if (false) return { kind: 'absent'");
  const a = await wrongVersion();
  try {
    expect((await start(noCompare, short, { env: { npm_config_registry: a.url } })).code, 'a document for another version was not rejected as "absent"').not.toBe(1);
  } finally {
    await a.close();
  }

  // weakened: what npm view says is not looked at, so the first fine-looking answer ends the wait
  const noNpm = copyWith("if (npm.kind !== 'found') return npm;", 'if (false) return npm;');
  const edge = await registry({ npmVersions: [[], [WAIT_VERSION]] });
  try {
    const r = await start(noNpm, ['--version', WAIT_VERSION, '--timeout-sec', '60', '--interval-sec', '0.1'], { env: { npm_config_registry: edge.url } });
    expect(r.code, r.out).toBe(0);
    expect(r.stdout, 'without the npm question the wait ends at the first poll').toMatch(/attempt 1,.*: found/);
  } finally {
    await edge.close();
  }

  // weakened: a 404 on the tarball is an error, not "not there yet", so "not published" becomes "could not ask"
  const noTarball404 = copyWith("if (head.status === 404) return { kind: 'absent'", "if (false) return { kind: 'absent'");
  const b = await registry({ tarballStatuses: [404] });
  try {
    expect((await start(noTarball404, short, { env: { npm_config_registry: b.url } })).code).toBe(2);
  } finally {
    await b.close();
  }
});


// ───────────────────────────── npm install of the published version (run.mjs) ─────────────────────────────

const INSTALL_VERSION = '1.2.3';

/** The bytes of a real package tarball (made by `npm pack`, offline), so that npm can really install what the registry serves. */
function packFakePackage() {
  const dir = writeFakePackage(tmp.next('pkg'), INSTALL_VERSION);
  const dest = tmp.next('packed');
  mkdirSync(dest);
  const npm = resolveNpm();
  const r = spawnSync(npm.file, [...npm.prefixArgs, 'pack', dir, '--pack-destination', dest, '--offline', '--silent', '--no-update-notifier'], { encoding: 'utf-8', shell: npm.shell, env: { ...process.env, npm_config_cache: tmp.next('npm-cache') } });
  if (r.status !== 0) throw new Error(`npm pack failed: ${r.stdout}${r.stderr}`);
  return readFileSync(join(dest, readdirSync(dest).find((n) => n.endsWith('.tgz'))));
}

/** `node run.mjs --version 1.2.3` against the test registry, as the workflow runs it; waits are shortened from seconds to milliseconds. */
async function installRun(reg, extra = [], env = {}) {
  const outDir = tmp.next('out');
  const steps = writeSteps(tmp.next('steps.json'), [{ id: 'prints-version', title: 'prints its version', uds: ['--version'], expect: { contains: [INSTALL_VERSION] } }]);
  const r = await start(RUN, ['--version', INSTALL_VERSION, '--steps', steps, '--non-interactive', '--out', outDir, '--install-retry-wait', '0.05', ...extra], { env: { npm_config_registry: reg.url, npm_config_cache: tmp.next('npm-cache'), npm_config_fetch_retries: '0', ...env } });
  const json = existsSync(outDir) ? readdirSync(outDir).filter((n) => n.endsWith('.json')).map((n) => JSON.parse(readFileSync(join(outDir, n), 'utf-8'))) : [];
  return { ...r, report: json[0] };
}

it('npm install that is told "no such version" twice (the registry has not caught up) is tried again, prints the retries, and the run goes on to pass (XSPEC-471 R1)', async () => {
  const tarball = packFakePackage();
  // ETARGET: the package document is there but does not list the version yet; E404: the package document is not there yet
  for (const arm of [
    { name: 'ETARGET', opts: { npmVersions: [[], [], [INSTALL_VERSION]] }, said: 'ETARGET' },
    { name: 'E404', opts: { npmStatuses: [404, 404, 200] }, said: 'E404' },
  ]) {
    const reg = await registry({ version: INSTALL_VERSION, tarball, ...arm.opts });
    try {
      const r = await installRun(reg);
      expect(r.code, `${arm.name}: ${r.out}`).toBe(0);
      expect(reg.count(NPM_PACKUMENT), `${arm.name}: npm asked for the package document three times`).toBe(3);
      expect(r.stdout, arm.name).toContain('npm install attempt 1/5 failed');
      expect(r.stdout, arm.name).toContain('npm install attempt 2/5 failed');
      expect(r.stdout, arm.name).toContain('retrying in 0.05 s');
      expect(r.stdout, arm.name).toContain(arm.said);
      expect(r.stdout, `${arm.name}: no third failure`).not.toContain('attempt 3/5 failed');
      // read back: the package really was installed on the 3rd attempt, and the run says so in its report
      expect(r.report.counts, arm.name).toMatchObject({ passed: 1, failed: 0 });
      expect(r.report.uds.version, arm.name).toBe(INSTALL_VERSION);
      expect(r.report.notes.join('\n'), arm.name).toContain('npm install needed 3 attempts');
    } finally {
      await reg.close();
    }
  }
});

it('npm install that fails for any other reason is not tried again, and one that keeps being told "no such version" gives up after the number of attempts it was given (XSPEC-471 R1)', async () => {
  const tarball = packFakePackage();
  // 403: not a "version not found" answer, so one attempt only
  const refused = await registry({ version: INSTALL_VERSION, tarball, npmStatuses: [403] });
  try {
    const r = await installRun(refused);
    expect(r.code, r.out).toBe(2);
    expect(refused.count(NPM_PACKUMENT), 'asked once').toBe(1);
    expect(r.stdout).not.toContain('retrying');
    expect(r.out).toContain('install failed');
    expect(r.report.install.ok).toBe(false);
  } finally {
    await refused.close();
  }

  // never there: the limit is --install-retries
  for (const attempts of [3, 1]) {
    const never = await registry({ version: INSTALL_VERSION, tarball, npmVersions: [[]] });
    try {
      const r = await installRun(never, ['--install-retries', String(attempts)]);
      expect(r.code, r.out).toBe(2);
      expect(never.count(NPM_PACKUMENT), `--install-retries ${attempts}`).toBe(attempts);
      expect(r.stdout).toContain(`attempt ${attempts}/${attempts} failed`);
      expect(r.stdout).toContain('no attempts left');
      expect(r.out).toContain('install failed');
    } finally {
      await never.close();
    }
  }
});

it('the retries stop at the time limit, and a bad --install-retries or --install-retry-wait is refused with exit 2 before anything is installed (XSPEC-471 R1)', async () => {
  for (const bad of [['--install-retries', '0'], ['--install-retries', '2.5'], ['--install-retries', 'many'], ['--install-retry-wait', '-1'], ['--install-retry-wait', 'soon']]) {
    const reg = await registry({ version: INSTALL_VERSION });
    try {
      const r = await installRun(reg, bad);
      expect(r.code, `${bad.join(' ')}: ${r.out}`).toBe(2);
      expect(reg.requests, `${bad.join(' ')}: nothing was asked`).toEqual([]);
    } finally {
      await reg.close();
    }
  }

  // a first wait of 200 s is already beyond the 180 s limit: it gives up after the first attempt, without sleeping
  const slow = await registry({ version: INSTALL_VERSION, npmVersions: [[]] });
  try {
    const started = Date.now();
    const r = await installRun(slow, ['--install-retry-wait', '200']);
    expect(Date.now() - started, 'it did not sleep 200 s').toBeLessThan(60000);
    expect(r.code, r.out).toBe(2);
    expect(slow.count(NPM_PACKUMENT)).toBe(1);
    expect(r.stdout).toContain('180 s limit would be passed');
  } finally {
    await slow.close();
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

  // an event that carries no tag name passes an empty --tag; that is nothing to compare, not an error
  const empty = await start(RESOLVE, ['--from-package', pkg, '--tag', '']);
  expect(empty.code, empty.out).toBe(0);
  expect(empty.stdout.trim()).toBe('version=6.14.0-beta.8');

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
function platformReport(platform, { version = '6.14.0-beta.7', verdict = 'pass', failed = 0, kind = 'npm-registry', label = 'ci-test', finishedAt = '2026-10-10T01:02:03.000Z' } = {}) {
  const base = realReport([AUTO], { version }).json;
  return {
    ...base,
    verdict,
    uds: { ...base.uds, version, installKind: kind },
    environment: { ...base.environment, platform },
    counts: { ...base.counts, failed },
    label,
    finishedAt,
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
      // the older upload is listed first on purpose: picking the first one seen would be wrong
      art(2, `acceptance-ci-windows-${V}`, 99, '2026-10-09T01:00:00Z'),
      art(1, `acceptance-ci-windows-${V}`, 100, '2026-10-10T01:00:00Z'),
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
    'ci-macos__uds-beta-acceptance-6.14.0-macos-20261010-010204.json',
    'ci-macos__uds-beta-acceptance-6.14.0-macos-20261010-010204.md',
    'ci-windows__uds-beta-acceptance-6.14.0-windows-20261010-010203.json',
    'ci-windows__uds-beta-acceptance-6.14.0-windows-20261010-010203.md',
  ]);
  const placed = JSON.parse(readFileSync(join(dest, 'ci-windows__uds-beta-acceptance-6.14.0-windows-20261010-010203.json'), 'utf-8'));
  expect(placed.verdict).toBe('pass');
  expect(r.stdout).toContain('platform windows: has a report');
  expect(r.stdout).toContain('platform macos: has a report');
  expect(r.stdout).toContain('platform linux: NO report in the folder');
  // which downloads were made: runs 100 for windows and macos, never the older run or the expired and decoy artifacts
  const downloads = gh.calls().filter((a) => a[0] === 'run').map((a) => `${a[2]} ${a[a.indexOf('-n') + 1]}`).sort();
  expect(downloads).toEqual([`100 acceptance-ci-macos-${V}`, `100 acceptance-ci-windows-${V}`]);
});

it('two jobs of one platform whose reports have the same file name (finished in the same second) both end up in the folder (XSPEC-471 R1)', async () => {
  const V = '6.14.0';
  const same = 'uds-beta-acceptance-6.14.0-windows-20261010-010203';
  const gh = ghFixture({
    artifacts: [
      art(1, `acceptance-ci-windows-${V}`, 100, '2026-10-10T01:00:00Z'),
      art(2, `acceptance-ci-windows-cmd-${V}`, 100, '2026-10-10T01:00:00Z'),
      art(3, `acceptance-ci-windows-gitbash-${V}`, 100, '2026-10-10T01:00:00Z'),
    ],
    files: {
      [`100--acceptance-ci-windows-${V}`]: reportFiles(platformReport('windows', { version: V, label: 'ci-windows' }), same),
      [`100--acceptance-ci-windows-cmd-${V}`]: reportFiles(platformReport('windows', { version: V, label: 'ci-windows-cmd', verdict: 'fail', failed: 1 }), same),
      [`100--acceptance-ci-windows-gitbash-${V}`]: reportFiles(platformReport('windows', { version: V, label: 'ci-windows-gitbash' }), same),
    },
  });
  const dest = tmp.next('dest');
  const r = await fetchReports(gh, [V, '--dest', dest, '--no-generate']);
  expect(r.code, r.out).toBe(0);
  const jsons = readdirSync(dest).filter((n) => n.endsWith('.json')).sort();
  expect(jsons).toEqual([`ci-windows-cmd__${same}.json`, `ci-windows-gitbash__${same}.json`, `ci-windows__${same}.json`]);
  // each one still holds its own report: the failing shell was not overwritten by a passing one
  expect(JSON.parse(readFileSync(join(dest, `ci-windows-cmd__${same}.json`), 'utf-8')).verdict).toBe('fail');
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
  expect(readdirSync(dest).sort()).toEqual(['ci-macos__good-macos.json', 'ci-macos__good-macos.md']);
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
  expect(existsSync(join(root, 'scripts', 'beta-acceptance', 'reports', V, `ci-windows__uds-beta-acceptance-${V}-windows-20261010-010203.json`))).toBe(true);
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

it('when one platform has reports from several shells, the PRE-RELEASE block shows the worst one, so a failing shell is not hidden by a passing one that finished later (XSPEC-471 R1)', () => {
  const V = '6.14.0-beta.7';
  const reports = tmp.next('reports');
  mkdirSync(join(reports, V), { recursive: true });
  const put = (name, r) => writeFileSync(join(reports, V, `${name}.json`), JSON.stringify(r));
  put('a-pwsh', platformReport('windows', { label: 'ci-windows', finishedAt: '2026-10-10T01:00:00.000Z' }));
  put('b-cmd-fail', platformReport('windows', { label: 'ci-windows-cmd', verdict: 'fail', failed: 2, finishedAt: '2026-10-10T01:10:00.000Z' }));
  put('c-gitbash', platformReport('windows', { label: 'ci-windows-gitbash', finishedAt: '2026-10-10T01:20:00.000Z' }));
  const doc = tmp.next('PRE-RELEASE.md');
  copyFileSync(join(REPO, 'docs', 'PRE-RELEASE.md'), doc);
  const gen = (extra = []) => spawnSync(process.execPath, [join(ACCEPT, 'generate-pre-release.mjs'), '--doc', doc, '--reports', reports, '--version', V, ...extra], { encoding: 'utf-8' });
  const r = gen();
  expect(r.status, r.stdout + r.stderr).toBe(0);
  const windows = readFileSync(doc, 'utf-8').split('\n').find((l) => l.startsWith('| Windows |'));
  expect(windows).toContain('Failed 有失敗：2 step(s) 步');
  expect(windows).toContain('3 runs on this platform');

  // a re-run of the same shell replaces its earlier run: the cmd shell passes the second time
  put('d-cmd-rerun', platformReport('windows', { label: 'ci-windows-cmd', finishedAt: '2026-10-10T02:00:00.000Z' }));
  expect(gen().status).toBe(0);
  const after = readFileSync(doc, 'utf-8').split('\n').find((l) => l.startsWith('| Windows |'));
  expect(after).toContain('Verified 已驗證');
  expect(after).toContain('3 runs on this platform');
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
  // the programs come from the released commit after a release, and from the branch it was started on for a manual start: an old tag does not have them
  const resolveCheckout = stepNamed(workflow().jobs.resolve, 'Checkout');
  expect(resolveCheckout.with.ref).toBe("${{ github.event_name == 'workflow_run' && github.event.workflow_run.head_sha || github.sha }}");
  expect(resolveCheckout.with.ref, 'a typed ref must not choose where the programs come from').not.toContain('inputs');
});

it('the order is wait for npm, run, summary, upload, and the summary and upload run when the run failed but not when the wait did (XSPEC-471 R1)', () => {
  const names = accept().steps.map((s) => s.name);
  expect(names).toEqual(['Checkout', 'Checkout the list of the tested version', 'Use the list of the tested version', 'Setup Node.js', 'Wait until the version can be installed', 'Run acceptance (bash)', 'Run acceptance (pwsh)', 'Run acceptance (cmd)', 'Summarize the report', 'Upload the report']);
  for (const n of ['Summarize the report', 'Upload the report']) {
    const s = stepNamed(accept(), n);
    expect(s.if, n).toContain('always()');
    expect(s.if, n).toContain("steps.wait.outcome == 'success'");
  }
  // the run steps carry no `success()` condition of their own beyond the shell: they follow the wait step, so a missing package stops the job there
  for (const sh of ['bash', 'pwsh', 'cmd']) expect(stepNamed(accept(), `Run acceptance (${sh})`).if).not.toContain('always()');
});

it('a manual start with a ref takes only steps.json from that ref, the other steps are skipped when the list already comes from the same commit, and the typed ref is checked before it becomes an output (XSPEC-471 R1)', (ctx) => {
  const job = accept();
  const second = stepNamed(job, 'Checkout the list of the tested version');
  const use = stepNamed(job, 'Use the list of the tested version');
  const differs = '${{ needs.resolve.outputs.steps_ref != needs.resolve.outputs.ref }}';
  expect(second.if).toBe(differs);
  expect(use.if).toBe(differs);
  expect(second.with).toMatchObject({ ref: '${{ needs.resolve.outputs.steps_ref }}', path: 'version-source', 'sparse-checkout': 'scripts/beta-acceptance/steps.json' });
  expect(use.run).toBe('cp version-source/scripts/beta-acceptance/steps.json scripts/beta-acceptance/steps.json');
  expect(use.shell).toBe('bash');

  if (process.platform === 'win32') ctx.skip(); // the copy step and the pin step are bash scripts
  // run the copy as written: the list of the tested version replaces the default list
  const work = tmp.next('job');
  mkdirSync(join(work, 'version-source', 'scripts', 'beta-acceptance'), { recursive: true });
  mkdirSync(join(work, 'scripts', 'beta-acceptance'), { recursive: true });
  writeFileSync(join(work, 'version-source', 'scripts', 'beta-acceptance', 'steps.json'), '{"list":"of the tested version"}');
  writeFileSync(join(work, 'scripts', 'beta-acceptance', 'steps.json'), '{"list":"of the branch"}');
  const cp = spawnSync('bash', ['-c', use.run], { cwd: work, encoding: 'utf-8' });
  expect(cp.status, cp.stderr).toBe(0);
  expect(readFileSync(join(work, 'scripts', 'beta-acceptance', 'steps.json'), 'utf-8')).toBe('{"list":"of the tested version"}');

  // the pin step: a plain ref becomes an output, text that is not a ref is refused and writes nothing
  const pin = stepNamed(workflow().jobs.resolve, 'Pin the commits');
  const repoDir = tmp.next('repo');
  mkdirSync(repoDir);
  const git = (args) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { cwd: repoDir, encoding: 'utf-8' });
  git(['init', '-q']);
  git(['commit', '-q', '--allow-empty', '-m', 'x']);
  const pinWith = (STEPS_REF) => {
    const out = tmp.next('github-output');
    const r = spawnSync('bash', ['-c', pin.run], { cwd: repoDir, encoding: 'utf-8', env: { ...process.env, STEPS_REF, GITHUB_OUTPUT: out } });
    return { r, out: existsSync(out) ? readFileSync(out, 'utf-8') : null };
  };
  const ok = pinWith('v6.14.0-beta.7');
  expect(ok.r.status, ok.r.stderr).toBe(0);
  expect(ok.out).toMatch(/^ref=[0-9a-f]{40}\nsteps_ref=v6\.14\.0-beta\.7\n$/);
  const bad = pinWith('main\nversion=9.9.9');
  expect(bad.r.status).not.toBe(0);
  expect(bad.out, 'a ref with a newline must not be able to write another output').toBeNull();
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
  const there = await registry({ version: VERSION });
  try {
    const r = await start(wait.script, wait.args, { env: { npm_config_registry: there.url } });
    expect(r.code, r.out).toBe(0);
    expect(there.requests[0], 'it asks for the package document, the one npm install reads').toBe('GET /universal-dev-standards');
  } finally {
    await there.close();
  }
  const absent = await registry({ version: VERSION, packumentStatuses: [404] });
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
