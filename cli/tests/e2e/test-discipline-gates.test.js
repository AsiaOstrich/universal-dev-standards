/**
 * E2E: the test-discipline gates an adopter gets from `uds init` and meets on every commit
 * (XSPEC-444 R5 — fake-test and stub scanners that really ship; R2 — code changed without a test).
 *
 * What this proves, and how. Every arm below goes through a product entry — `uds init`, a real
 * `git commit` that fires the pre-commit hook `uds init` wrote (which runs `universal-dev-standards
 * check`), `uds check --standard`, `uds update`, `uds uninstall`, `uds audit --score` — and reads
 * back an effect: a file on disk, a manifest record, the warning text with the file and the test
 * name in it, whether git recorded the commit. Calling a helper and asserting on its return value
 * is not what this file does (those are in tests/unit/utils/test-policy.test.js and
 * tests/unit/templates/).
 *
 * The wires that make it red when cut (each is one line of the CLI source):
 *   - cli/src/commands/init.js        `const gateResult = installGateScripts(projectPath, installRecorder);`   (R5 ships)
 *   - cli/src/commands/check.js       `runTestQualityGates(projectPath);`                                       (R5 runs)
 *   - cli/src/commands/check.js       `runTestChangeCheck(projectPath);`                                        (R2 runs)
 * and the strength of the detection (each makes a detector blind; see the mutation list in the commit message):
 *   - templates/gates/check-anti-fake-tests.mjs   `if (real > 0) continue;`
 *   - templates/gates/check-stubs.mjs             `if (IGNORED_NAMES.test(m[1]) || declaredNear(lines, line)) continue;`
 *   - cli/src/utils/test-change-check.js          `else if (result.source.length > 0 && result.tests.length === 0) result.verdict = 'warn';`
 *
 * "Warn first": a commit that carries a fake test, an empty function, or code with no test is let
 * through, and the arms read back that git really recorded it. "mode: block" is the one tightening
 * step; its arms read back that git recorded nothing.
 *
 * Isolation: a staged copy of the CLI (cli/bin + cli/src copied at test time, so a mutation of the
 * source is what runs; repo root is the real repo via symlinks; no cli/bundled/ — a gitignored
 * build product that can be older than the sources). HOME and every XDG_* point to a throwaway
 * directory, the network is blocked and logged, and every child process gets an environment without
 * the variables `git rev-parse --local-env-vars` names (when this suite runs from UDS's own
 * pre-commit hook, GIT_DIR / GIT_INDEX_FILE point at the UDS repo and a nested `git commit` would
 * write into it). POSIX only: the pre-commit hook is shell.
 */

import { it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import {
  mkdtempSync, mkdirSync, cpSync, symlinkSync, readdirSync, readFileSync, writeFileSync, existsSync, rmSync,
  realpathSync, chmodSync, renameSync
} from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { isolatedEnv } from '../../../scripts/lib/isolated-home.mjs';

const REAL_CLI_DIR = resolve(import.meta.dirname, '../..');
const REAL_REPO = resolve(REAL_CLI_DIR, '..');
const TEMPLATE_DIR = join(REAL_REPO, 'templates', 'gates');
const SCANNERS = ['check-anti-fake-tests.mjs', 'check-stubs.mjs'];
const posix = process.platform !== 'win32';

let sandbox;
let cliPath;
let netLog;
let home;

function gitLocalEnvVars() {
  const r = spawnSync('git', ['rev-parse', '--local-env-vars'], { encoding: 'utf8' });
  return r.stdout.split('\n').map((s) => s.trim()).filter(Boolean);
}

/** An environment that cannot reach whatever repo the ambient one points at, and cannot touch the real HOME. */
function cleanEnv(extra = {}) {
  const env = { ...isolatedEnv(home, process.env) };
  for (const name of gitLocalEnvVars()) delete env[name];
  // `uds init` refuses to touch hooks when VITEST is set (it protects UDS's own repo from its own
  // tests); the child works in a throwaway directory and must see what a user would.
  for (const name of Object.keys(env)) if (name === 'VITEST' || name.startsWith('VITEST_')) delete env[name];
  return {
    ...env,
    FORCE_COLOR: '0',
    NO_COLOR: '1',
    UDS_NO_UPDATE_CHECK: '1',
    UDS_TEST_NET_LOG: netLog,
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0',
    NODE_OPTIONS: [process.env.NODE_OPTIONS, `--require=${join(sandbox, 'block-network.cjs')}`].filter(Boolean).join(' '),
    ...extra
  };
}

const BLOCK_NETWORK = `
const https = require('https');
const http = require('http');
const { appendFileSync } = require('fs');
const { EventEmitter } = require('events');
const log = process.env.UDS_TEST_NET_LOG;
function note(what) { if (log) appendFileSync(log, String(what) + '\\n'); }
function blocked(...args) {
  const target = typeof args[0] === 'string' ? args[0] : (args[0] && (args[0].href || args[0].host || args[0].hostname)) || '?';
  note(target);
  const req = new EventEmitter();
  req.end = () => req; req.destroy = () => req; req.setTimeout = () => req; req.write = () => true;
  const err = new Error('network blocked by the test (' + target + ')');
  err.code = 'UDS_TEST_NETWORK_BLOCKED';
  setImmediate(() => req.emit('error', err));
  return req;
}
for (const m of [https, http]) { m.get = blocked; m.request = blocked; }
globalThis.fetch = async (url) => { note(url); const e = new Error('network blocked by the test'); e.code = 'UDS_TEST_NETWORK_BLOCKED'; throw e; };
`;

/** A runnable copy of the CLI whose sources come from the real repo and which has no bundled/. */
function stageCli(root) {
  const cli = join(root, 'cli');
  mkdirSync(cli, { recursive: true });
  cpSync(join(REAL_CLI_DIR, 'bin'), join(cli, 'bin'), { recursive: true });
  cpSync(join(REAL_CLI_DIR, 'src'), join(cli, 'src'), { recursive: true });
  for (const f of ['package.json', 'standards-registry.json']) cpSync(join(REAL_CLI_DIR, f), join(cli, f));
  symlinkSync(realpathSync(join(REAL_CLI_DIR, 'node_modules')), join(cli, 'node_modules'), 'dir');
  for (const name of readdirSync(REAL_REPO)) {
    if (['cli', '.git', 'node_modules'].includes(name)) continue;
    symlinkSync(join(REAL_REPO, name), join(root, name));
  }
  return join(cli, 'bin', 'uds.js');
}

beforeAll(() => {
  // Everything this file needs is set up here, so each test also passes when selected on its own.
  sandbox = mkdtempSync(join(tmpdir(), 'uds-test-discipline-'));
  home = join(sandbox, 'home');
  mkdirSync(home, { recursive: true });
  netLog = join(sandbox, 'net.log');
  writeFileSync(join(sandbox, 'block-network.cjs'), BLOCK_NETWORK);
  cliPath = stageCli(join(sandbox, 'stage'));
}, 120000);

afterAll(() => {
  if (sandbox && sandbox.includes('uds-test-discipline-')) rmSync(sandbox, { recursive: true, force: true });
});

// ─── helpers ────────────────────────────────────────────────────────────────

function run(cmd, args, cwd, env = cleanEnv()) {
  const r = spawnSync(cmd, args, { cwd, env, encoding: 'utf8', timeout: 120000 });
  return { code: r.status, out: r.stdout || '', err: r.stderr || '', all: `${r.stdout || ''}${r.stderr || ''}` };
}
const git = (args, cwd) => run('git', args, cwd);
const uds = (args, cwd) => run(process.execPath, [cliPath, ...args], cwd);

const write = (dir, rel, text) => {
  mkdirSync(join(dir, rel, '..'), { recursive: true });
  writeFileSync(join(dir, rel), text);
};
const read = (dir, rel) => readFileSync(join(dir, rel), 'utf8');
const commitCount = (dir) => {
  const r = git(['rev-list', '--count', 'HEAD'], dir);
  return r.code === 0 ? Number(r.out.trim()) : 0;
};
const setPolicy = (dir, policy) => write(dir, '.standards/test-policy.json', JSON.stringify(policy, null, 2));

/**
 * A throwaway git project with no language marker (so `uds init` writes the native hook and no
 * linter runs), initialised by the real `uds init`, with a shim that makes the hook's
 * `universal-dev-standards` command the staged CLI — the shape `npm i -D` leaves — and a first
 * commit made through that hook.
 */
function newProject({ baseline = true, node = false } = {}) {
  const dir = mkdtempSync(join(sandbox, 'p-'));
  expect(git(['init', '-q', '-b', 'main'], dir).code).toBe(0);
  git(['config', '--local', 'user.name', 'T'], dir);
  git(['config', '--local', 'user.email', 't@example.invalid'], dir);
  git(['config', '--local', 'commit.gpgsign', 'false'], dir);
  // A Node project (package.json) gets the husky pre-commit; anything else gets the native .git/hooks one.
  if (node) writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'adopter', version: '1.0.0' }));
  const init = uds(['init', '--yes'], dir);
  expect(init.code, init.all).toBe(0);
  const bin = join(dir, 'node_modules', '.bin');
  mkdirSync(bin, { recursive: true });
  const shim = join(bin, 'universal-dev-standards');
  writeFileSync(shim, `#!/bin/sh\nexec "${process.execPath}" "${cliPath}" "$@"\n`);
  chmodSync(shim, 0o755);
  if (baseline) {
    // The project's own first commit, through the hook. It carries scripts/ and .standards/, which
    // is not what a test below is about; it only gives later commits a parent to be a diff against.
    git(['add', '-A', '--', '.'], dir);
    const c = git(['commit', '-q', '-m', 'baseline'], dir);
    expect(c.code, c.all).toBe(0);
  }
  return { dir, init };
}

/** Stage exactly `paths` (add / modify / delete) and commit through the hook. */
function commit(dir, paths, message = 'change') {
  const a = git(['add', '-A', '--', ...paths], dir);
  expect(a.code, a.all).toBe(0);
  return git(['commit', '-q', '-m', message], dir);
}

// ─── R5: the scanners ship, and the commit hook warns about fakes by name ───

it('uds init writes the fake-test and stub scanners into the project, and a commit that carries a test with no assertion, a tautology and an empty function is warned about by name through the real pre-commit hook but still goes through (XSPEC-444 R5)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir, init } = newProject();

  // 1. What `uds init` shipped: both scanners, byte-identical to the templates, recorded for uninstall.
  expect(init.all).toContain('scripts/check-anti-fake-tests.mjs');
  expect(init.all).toContain('scripts/check-stubs.mjs');
  for (const f of SCANNERS) {
    expect(read(dir, `scripts/${f}`), `scripts/${f} is the shipped template`).toBe(readFileSync(join(TEMPLATE_DIR, f), 'utf8'));
  }
  const manifest = JSON.parse(read(dir, '.standards/manifest.json'));
  for (const f of SCANNERS) {
    expect(manifest.installedArtifacts.files[`scripts/${f}`]?.kind, `install record for scripts/${f}`).toBe('gate-script');
  }

  // 2. A commit with fakes: warned by file, line, rule and test name — and let through.
  write(dir, 'tests/fake.test.js', [
    "it('does nothing', () => { const a = 1; });",
    "it('always passes', () => { expect(true).toBe(true); });",
    "it('adds', () => { expect(1 + 1).toBe(2); });",
    ''
  ].join('\n'));
  write(dir, 'src/order.js', 'function saveOrder(order) {}\nexport function total(a, b) { return a + b; }\n');
  const before = commitCount(dir);
  const r = commit(dir, ['tests/fake.test.js', 'src/order.js']);
  expect(r.code, r.all).toBe(0);
  expect(r.all).toContain('tests/fake.test.js:1  no-assertion  "does nothing"');
  expect(r.all).toContain('tests/fake.test.js:2  tautology  "always passes"');
  expect(r.all).not.toContain('"adds"'); // the real test is not reported
  expect(r.all).toContain('src/order.js:1  empty-function  saveOrder');
  expect(r.all).toContain('warning only');
  expect(commitCount(dir), 'git recorded the commit: warning, not a block').toBe(before + 1);

  // 3. The same scripts, run on their own, are a hard failure (that is how an adopter enforces them in CI).
  const solo = run(process.execPath, [join(dir, 'scripts', 'check-anti-fake-tests.mjs')], dir);
  expect(solo.code).toBe(1);
  expect(solo.out).toContain('RESULT: 2 finding(s)');
  const soloStubs = run(process.execPath, [join(dir, 'scripts', 'check-stubs.mjs')], dir);
  expect(soloStubs.code).toBe(1);
  expect(soloStubs.out).toContain('src/order.js:1');
});

it('with "mode": "block" in the policy file a commit that carries a fake test is refused and git records nothing (XSPEC-444 R5)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject();
  setPolicy(dir, { mode: 'block' });
  write(dir, 'tests/fake.test.js', "it('does nothing', () => { const a = 1; });\n");
  const before = commitCount(dir);
  const r = commit(dir, ['tests/fake.test.js']);
  expect(r.code).not.toBe(0);
  expect(r.all).toContain('BLOCKED');
  expect(r.all).toContain('tests/fake.test.js:1  no-assertion  "does nothing"');
  expect(commitCount(dir), 'git recorded nothing').toBe(before);

  // control: the same project, a real test → goes through
  write(dir, 'tests/fake.test.js', "it('adds', () => { expect(1 + 1).toBe(2); });\n");
  const ok = commit(dir, ['tests/fake.test.js']);
  expect(ok.code, ok.all).toBe(0);
  expect(commitCount(dir)).toBe(before + 1);
});

it('in a Node project, where uds init writes the husky pre-commit instead of the native one, the same commit is warned about by name and the scanners are written there too (XSPEC-444 R5)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject({ node: true });
  expect(existsSync(join(dir, '.husky', 'pre-commit')), 'the husky hook is the one in use').toBe(true);
  expect(existsSync(join(dir, '.git', 'hooks', 'pre-commit'))).toBe(false);
  for (const f of SCANNERS) expect(existsSync(join(dir, 'scripts', f))).toBe(true);
  write(dir, 'tests/fake.test.js', "it('does nothing', () => { const a = 1; });\n");
  write(dir, 'src/order.js', 'function saveOrder(order) {}\n');
  const before = commitCount(dir);
  const r = commit(dir, ['tests/fake.test.js', 'src/order.js']);
  expect(r.code, r.all).toBe(0);
  expect(r.all).toContain('tests/fake.test.js:1  no-assertion  "does nothing"');
  expect(r.all).toContain('src/order.js:1  empty-function  saveOrder');
  expect(r.all).not.toContain('[test-change]'); // a test file is in this commit
  expect(commitCount(dir)).toBe(before + 1);

  // the code-without-test check runs on this path too
  write(dir, 'src/order.js', 'function saveOrder(order) { return order; }\n');
  const codeOnly = commit(dir, ['src/order.js']);
  expect(codeOnly.code, codeOnly.all).toBe(0);
  expect(codeOnly.all).toContain('changes 1 code file(s) and touches no test file');
  expect(codeOnly.all).toContain('- src/order.js');
});

it('a commit with only real tests and real functions is reported clean by both scanners, and says so (XSPEC-444 R5)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject();
  write(dir, 'tests/good.test.js', "it('adds', () => { expect(add(1, 2)).toBe(3); });\n");
  write(dir, 'src/add.js', 'export function add(a, b) { return a + b; }\n');
  const r = commit(dir, ['tests/good.test.js', 'src/add.js']);
  expect(r.code, r.all).toBe(0);
  expect(r.all).toContain('[anti-fake-test] scripts/check-anti-fake-tests.mjs: nothing found');
  expect(r.all).toContain('[stub] scripts/check-stubs.mjs: nothing found');
  expect(r.all).not.toContain('found 1 finding');
  expect(r.all).not.toMatch(/⚠ \[(anti-fake-test|stub|test-change)\]/);
});

it('with files staged the scanners judge only those files: a fake test committed earlier is not charged to a commit that adds a real one, while a scan of the whole project still lists it (XSPEC-444 R5)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject();
  write(dir, 'tests/old.test.js', "it('old and fake', () => { const a = 1; });\n");
  expect(commit(dir, ['tests/old.test.js']).code).toBe(0);

  write(dir, 'tests/new.test.js', "it('new and real', () => { expect(f()).toBe(1); });\n");
  const r = commit(dir, ['tests/new.test.js']);
  expect(r.code, r.all).toBe(0);
  expect(r.all).toContain('nothing found in the staged files');
  expect(r.all).not.toContain('old and fake');

  // control: the same project scanned as a whole (what a CI run does) does list the old one
  const whole = run(process.execPath, [join(dir, 'scripts', 'check-anti-fake-tests.mjs')], dir);
  expect(whole.code).toBe(1);
  expect(whole.out).toContain('tests/old.test.js:1  no-assertion  "old and fake"');
});

it('a test file in a language the scanner has no rule for is listed as NOT scanned instead of being counted as clean (XSPEC-444 R5)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject();
  write(dir, 'tests/thing_test.zig', 'test "nothing" {}\n');
  write(dir, 'tests/good.test.js', "it('adds', () => { expect(add(1, 2)).toBe(3); });\n");
  const r = commit(dir, ['tests/thing_test.zig', 'tests/good.test.js']);
  expect(r.code, r.all).toBe(0);
  expect(r.all).toContain('NOT scanned');
  expect(r.all).toContain('tests/thing_test.zig');
  expect(r.all).toContain('.zig');
});

it('uds init never overwrites a scanner the project already has, and uds uninstall removes the ones it wrote only while they are unchanged (XSPEC-444 R5)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  // 1. a file that is already there is kept, and has no install record
  const dir = mkdtempSync(join(sandbox, 'p-'));
  git(['init', '-q', '-b', 'main'], dir);
  write(dir, 'scripts/check-stubs.mjs', '// my own scanner\n');
  const init = uds(['init', '--yes'], dir);
  expect(init.code, init.all).toBe(0);
  expect(read(dir, 'scripts/check-stubs.mjs')).toBe('// my own scanner\n');
  expect(init.all).toContain('scripts/check-stubs.mjs already exists');
  const manifest = JSON.parse(read(dir, '.standards/manifest.json'));
  expect(manifest.installedArtifacts.files['scripts/check-stubs.mjs'], 'no record for a file UDS did not write').toBeUndefined();
  expect(manifest.installedArtifacts.files['scripts/check-anti-fake-tests.mjs']?.kind).toBe('gate-script');

  // 2. uninstall: the unchanged one goes, the edited one stays
  write(dir, 'scripts/check-anti-fake-tests.mjs', `${read(dir, 'scripts/check-anti-fake-tests.mjs')}// edited by me\n`);
  const edited = uds(['uninstall', '--yes'], dir);
  expect(edited.code, edited.all).toBe(0);
  expect(existsSync(join(dir, 'scripts/check-anti-fake-tests.mjs')), 'an edited scanner is kept').toBe(true);
  expect(read(dir, 'scripts/check-stubs.mjs'), 'a scanner UDS did not write is untouched').toBe('// my own scanner\n');

  const other = mkdtempSync(join(sandbox, 'p-'));
  git(['init', '-q', '-b', 'main'], other);
  expect(uds(['init', '--yes'], other).code).toBe(0);
  expect(existsSync(join(other, 'scripts/check-stubs.mjs'))).toBe(true);
  const gone = uds(['uninstall', '--yes'], other);
  expect(gone.code, gone.all).toBe(0);
  expect(existsSync(join(other, 'scripts/check-stubs.mjs')), 'an unchanged scanner UDS wrote is removed').toBe(false);
  expect(existsSync(join(other, 'scripts/check-anti-fake-tests.mjs'))).toBe(false);
});

it('uds update writes the scanners into a project that was initialised without them, and says what it writes (XSPEC-444 R5)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject({ baseline: false });
  for (const f of SCANNERS) rmSync(join(dir, 'scripts', f));
  // `uds update` only reaches its offers when there is something to update, so the project is made to look
  // like one initialised by an older UDS.
  const manifestPath = join(dir, '.standards', 'manifest.json');
  const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
  m.upstream.version = '6.13.0';
  writeFileSync(manifestPath, JSON.stringify(m, null, 2));
  const u = uds(['update', '--yes'], dir);
  expect(u.all).toContain('Fake-test and stub scanners');
  for (const f of SCANNERS) {
    expect(existsSync(join(dir, 'scripts', f)), `scripts/${f} written by update`).toBe(true);
    expect(read(dir, `scripts/${f}`)).toBe(readFileSync(join(TEMPLATE_DIR, f), 'utf8'));
  }
});

it('uds check --standard full-coverage-testing runs the scanners: it fails when a scanner is missing and when a fake test exists, and passes when clean (XSPEC-444 R5)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const dir = mkdtempSync(join(sandbox, 'p-'));
  mkdirSync(join(dir, '.standards'));
  writeFileSync(join(dir, '.standards', 'full-coverage-testing.ai.yaml'), readFileSync(join(REAL_REPO, 'ai/standards/full-coverage-testing.ai.yaml')));

  const missing = uds(['check', '--standard', 'full-coverage-testing'], dir);
  expect(missing.code).not.toBe(0);
  expect(missing.all).toContain('MISSING: scripts/check-anti-fake-tests.mjs');

  for (const f of SCANNERS) write(dir, `scripts/${f}`, readFileSync(join(TEMPLATE_DIR, f), 'utf8'));
  write(dir, 'tests/a.test.js', "it('adds', () => { expect(add(1, 2)).toBe(3); });\n");
  const clean = uds(['check', '--standard', 'full-coverage-testing'], dir);
  expect(clean.code, clean.all).toBe(0);
  expect(clean.all).toContain('Validation Passed');

  write(dir, 'tests/b.test.js', "it('nothing', () => { const a = 1; });\n");
  const fake = uds(['check', '--standard', 'full-coverage-testing'], dir);
  expect(fake.code).not.toBe(0);
  expect(fake.all).toContain('tests/b.test.js:1  no-assertion  "nothing"');
});

it('uds audit --score no longer reports the always-zero has_tests in the coverage dimension, and the coverage score still follows the check scripts (XSPEC-444 R5)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject({ baseline: false });
  const first = uds(['audit', '--score', '--format', 'json'], dir);
  expect(first.code, first.all).toBe(0);
  const scored = JSON.parse(first.out.slice(first.out.indexOf('{')));
  const details = scored.dimensions.coverage.details;
  expect(Object.keys(details).sort()).toEqual(['has_check_script', 'total']);
  expect(details).not.toHaveProperty('has_tests');
  expect(scored.dimensions.coverage.score).toBe(0);

  // give every installed standard both of its check scripts → the dimension reaches 100 (it could not before the fix only if it had been capped; it was not)
  const ids = JSON.parse(read(dir, '.standards/manifest.json')).standards.map((s) => String(s).split('/').pop().replace('.ai.yaml', ''));
  for (const id of ids) {
    write(dir, `scripts/check-${id}.sh`, '#!/bin/sh\n');
    write(dir, `scripts/check-${id}-sync.sh`, '#!/bin/sh\n');
  }
  const full = JSON.parse((() => { const r = uds(['audit', '--score', '--format', 'json'], dir); return r.out.slice(r.out.indexOf('{')); })());
  expect(full.dimensions.coverage.score).toBe(100);
  expect(full.dimensions.coverage.details.has_check_script).toBe(ids.length * 2);
});

it('the policy file an adopter puts under .standards/ survives uds update, twice (XSPEC-444 R2)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject({ baseline: false });
  const policy = JSON.stringify({ mode: 'warn', exempt: [{ pattern: 'src/gen/**', reason: 'generated by protoc' }] }, null, 2);
  write(dir, '.standards/test-policy.json', policy);
  const manifestPath = join(dir, '.standards', 'manifest.json');
  for (let round = 1; round <= 2; round++) {
    // `uds update` removes files it can prove it wrote and that are no longer shipped; a project's own policy is neither.
    const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
    m.upstream.version = '6.13.0';
    writeFileSync(manifestPath, JSON.stringify(m, null, 2));
    const u = uds(['update', '--yes'], dir);
    expect(u.all, `update round ${round}`).toContain('Standards updated successfully');
    expect(existsSync(join(dir, '.standards', 'test-policy.json')), `policy present after update ${round}`).toBe(true);
    expect(read(dir, '.standards/test-policy.json')).toBe(policy);
  }
});

// ─── R2: code changed without a test ────────────────────────────────────────

it('a commit that changes only a code file prints the code-without-test warning naming the file and is let through, and a commit that also changes a test file prints none (XSPEC-444 R2)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject();
  write(dir, 'src/billing.js', 'export function fee(a) { return a * 2; }\n');
  const before = commitCount(dir);
  const r = commit(dir, ['src/billing.js']);
  expect(r.code, r.all).toBe(0);
  expect(r.all).toContain('[test-change]');
  expect(r.all).toContain('changes 1 code file(s) and touches no test file');
  expect(r.all).toContain('- src/billing.js');
  expect(r.all).toContain('Warning only');
  expect(commitCount(dir), 'a warning does not stop the commit').toBe(before + 1);

  // control: the same kind of change together with a test → no warning
  write(dir, 'src/billing.js', 'export function fee(a) { return a * 3; }\n');
  write(dir, 'tests/billing.test.js', "it('fees', () => { expect(fee(2)).toBe(6); });\n");
  const ok = commit(dir, ['src/billing.js', 'tests/billing.test.js']);
  expect(ok.code, ok.all).toBe(0);
  expect(ok.all).not.toContain('[test-change]');
  expect(commitCount(dir)).toBe(before + 2);
});

it('a changed file of a type UDS does not recognise is listed and never read as fine, and telling the policy what the extension is turns it into a code file (XSPEC-444 R2)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject();
  write(dir, 'lib/engine.zig', 'pub fn run() void {}\n');
  const r = commit(dir, ['lib/engine.zig']);
  expect(r.code, r.all).toBe(0);
  expect(r.all).toContain('[test-change]');
  expect(r.all).toContain('are of a type UDS does not recognize');
  expect(r.all).toContain('- lib/engine.zig');
  expect(r.all).toContain('"sourceExtensions"'); // says how to classify it
  expect(r.all).not.toContain('touches no test file'); // unknown is not claimed to be code

  // the project declares .zig as code → the same change is now a code change without a test
  setPolicy(dir, { sourceExtensions: ['zig'] });
  write(dir, 'lib/engine.zig', 'pub fn run() void { }\n');
  const known = commit(dir, ['lib/engine.zig']);
  expect(known.code, known.all).toBe(0);
  expect(known.all).toContain('changes 1 code file(s) and touches no test file');
  expect(known.all).not.toContain('does not recognize');
});

it('documentation, configuration, deletions and a pure rename do not trigger the code-without-test warning, and the rename is recorded with its reason (XSPEC-444 R2)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject();
  write(dir, 'src/old-name.js', 'export const answer = 42;\n');
  expect(commit(dir, ['src/old-name.js']).code).toBe(0);

  write(dir, 'README.md', '# hello\n');
  write(dir, 'config/app.json', '{"a":1}\n');
  const docs = commit(dir, ['README.md', 'config/app.json']);
  expect(docs.code, docs.all).toBe(0);
  expect(docs.all).not.toContain('[test-change]');

  renameSync(join(dir, 'src/old-name.js'), join(dir, 'src/new-name.js'));
  const renamed = commit(dir, ['src/old-name.js', 'src/new-name.js']);
  expect(renamed.code, renamed.all).toBe(0);
  expect(renamed.all).not.toContain('touches no test file');
  expect(renamed.all).toContain('src/new-name.js — pure rename of src/old-name.js');

  rmSync(join(dir, 'src/new-name.js'));
  const deleted = commit(dir, ['src/new-name.js']);
  expect(deleted.code, deleted.all).toBe(0);
  expect(deleted.all).not.toContain('[test-change]');
});

it('a policy exemption is honored and recorded only when it carries a reason; one without a reason is reported and not honored (XSPEC-444 R2)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject();
  setPolicy(dir, { exempt: [{ pattern: 'src/gen/**', reason: 'generated by protoc' }] });
  write(dir, 'src/gen/api.js', 'export const api = {};\n');
  const honored = commit(dir, ['src/gen/api.js']);
  expect(honored.code, honored.all).toBe(0);
  expect(honored.all).not.toContain('touches no test file');
  expect(honored.all).toContain('src/gen/api.js — policy exemption "src/gen/**": generated by protoc');

  setPolicy(dir, { exempt: [{ pattern: 'src/gen/**' }] });
  write(dir, 'src/gen/api.js', 'export const api = { v: 2 };\n');
  const bare = commit(dir, ['src/gen/api.js']);
  expect(bare.code, bare.all).toBe(0);
  expect(bare.all).toContain('has no "reason" and is NOT honored');
  expect(bare.all).toContain('touches no test file');
});

it('with "mode": "block" a code change with no test is refused and git records nothing, while a test change, a documentation change and an unrecognised file type are let through (XSPEC-444 R2)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject();
  setPolicy(dir, { mode: 'block' });
  const before = commitCount(dir);

  write(dir, 'src/pay.js', 'export function pay() { return 1; }\n');
  const refused = commit(dir, ['src/pay.js']);
  expect(refused.code).not.toBe(0);
  expect(refused.all).toContain('BLOCKED');
  expect(refused.all).toContain('- src/pay.js');
  expect(commitCount(dir), 'git recorded nothing').toBe(before);
  // XSPEC-454 R2 (same class): a check that blocks must not also end by calling the project compliant.
  expect(refused.all).not.toContain('Project is compliant');
  expect(refused.all).toContain('Some issues detected');

  write(dir, 'tests/pay.test.js', "it('pays', () => { expect(pay()).toBe(1); });\n");
  const withTest = commit(dir, ['src/pay.js', 'tests/pay.test.js']);
  expect(withTest.code, withTest.all).toBe(0);
  expect(commitCount(dir)).toBe(before + 1);

  write(dir, 'README.md', '# docs\n');
  expect(commit(dir, ['README.md']).code).toBe(0);

  write(dir, 'lib/unknown.zig', 'pub fn x() void {}\n');
  const unknown = commit(dir, ['lib/unknown.zig']);
  expect(unknown.code, 'an unrecognised type never blocks').toBe(0);
  expect(unknown.all).toContain('does not recognize');
});

it('an unreadable policy file is reported and the defaults stay in effect: it cannot silently turn the check off (XSPEC-444 R2)', (ctx) => {
  if (!posix) ctx.skip(); // shown as SKIPPED on Windows, never as a pass that asserted nothing
  const { dir } = newProject();
  write(dir, '.standards/test-policy.json', '{ not json');
  write(dir, 'src/a.js', 'export const a = 1;\n');
  const r = commit(dir, ['src/a.js']);
  expect(r.code, r.all).toBe(0);
  expect(r.all).toContain('test-policy.json cannot be read');
  expect(r.all).toContain('defaults are in effect');
  expect(r.all).toContain('touches no test file');
});
