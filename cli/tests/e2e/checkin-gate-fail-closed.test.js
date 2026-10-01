/**
 * E2E: the check-in gates fail closed (XSPEC-444 R1, AC-1 / AC-3 / AC-5).
 *
 * Why this file exists. `checkin-standards.ai.yaml` shipped a validator written
 * as `(npm test --if-present || echo "No test script")`. `--if-present` already
 * covers "there is no test script"; the `|| echo` therefore did exactly one thing:
 * turn a FAILING test into exit 0. The check an adopter ran before every commit
 * could not say no. The same shape was found in two more places the sweep
 * covered — the pipeline-security-gates validator (`grep | head -1 || echo`, where
 * `head` always exits 0) and the native git hook `uds init` writes for non-Node
 * projects (`uds check 2>/dev/null || true`, then "Pre-commit checks passed").
 *
 * Every arm below goes through a product entry — `uds check --standard <id>`,
 * `uds init`, or a real `git commit` that fires the hook — and reads back an
 * effect: an exit code, a marker file the project's own script wrote, or whether
 * git actually recorded a commit. Calling a helper function and asserting on its
 * return value is not what this file does.
 *
 * Isolation. Every project is a throwaway `mkdtemp` directory. Every child
 * process gets an environment with the variables `git rev-parse --local-env-vars`
 * names removed: when this suite runs from inside a git hook (UDS's own
 * pre-commit), GIT_DIR / GIT_INDEX_FILE point at the UDS repo, and a nested
 * `git init` / `git commit` would otherwise write into it (UDS 2026-09 polluted
 * its own .git/config that way). One arm proves the cleaning works by handing the
 * helper a poisoned environment that points at a decoy repo.
 *
 * POSIX only: the gate commands and the hook are shell, and the quoting of the
 * inline-node validator under cmd.exe has not been verified.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import {
  mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, chmodSync, symlinkSync
} from 'fs';
import { tmpdir } from 'os';
import { buildPreCommitBlock } from '../../src/utils/git-hooks.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_PATH = join(__dirname, '../../bin/uds.js');
const REPO_ROOT = join(__dirname, '../../..');
const SHIPPED_CHECKIN = join(REPO_ROOT, 'ai/standards/checkin-standards.ai.yaml');
const SHIPPED_PIPELINE = join(REPO_ROOT, 'ai/standards/pipeline-security-gates.ai.yaml');

const posix = process.platform !== 'win32';
const itPosix = posix ? it : it.skip;

// ─── environment hygiene ────────────────────────────────────────────────────

/** The variables git itself says it sets for a hook / nested invocation. */
function gitLocalEnvVars() {
  const r = spawnSync('git', ['rev-parse', '--local-env-vars'], { encoding: 'utf8' });
  return r.stdout.split('\n').map((s) => s.trim()).filter(Boolean);
}

/** A child-process environment that cannot reach whatever repo the ambient one points at. */
function cleanEnv(base = process.env, extra = {}) {
  const env = { ...base };
  for (const name of gitLocalEnvVars()) delete env[name];
  // A user running the CLI is not inside a test runner. `uds init` refuses to touch
  // hooks when VITEST is set (it protects UDS's own repo from its own tests); the
  // child here runs in a throwaway directory, so it must see what a user would.
  for (const name of Object.keys(env)) if (name === 'VITEST' || name.startsWith('VITEST_')) delete env[name];
  return {
    ...env,
    HOME: HOME_DIR,
    FORCE_COLOR: '0',
    NO_COLOR: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0',
    ...extra
  };
}

let HOME_DIR;
let gitOnly;
const made = [];

function tmp(prefix) {
  const d = mkdtempSync(join(tmpdir(), prefix));
  made.push(d);
  return d;
}

beforeEach(() => {
  gitOnly = undefined;
  HOME_DIR = tmp('uds-test-checkin-home-');
});

afterEach(() => {
  for (const d of made.splice(0)) rmSync(d, { recursive: true, force: true });
});

// ─── helpers ────────────────────────────────────────────────────────────────

function run(cmd, args, cwd, env = cleanEnv()) {
  const r = spawnSync(cmd, args, { cwd, env, encoding: 'utf8', timeout: 60000 });
  return { code: r.status, out: r.stdout || '', err: r.stderr || '', all: `${r.stdout || ''}${r.stderr || ''}` };
}

const git = (args, cwd, env) => run('git', args, cwd, env);
const uds = (args, cwd, env) => run(process.execPath, [CLI_PATH, ...args], cwd, env);

/** A project directory whose installed standards are copies of the shipped ones (what `uds init` copies). */
function project({ pkg, rawPkg, withChangelog = false } = {}) {
  const dir = tmp('uds-test-checkin-');
  mkdirSync(join(dir, '.standards'));
  writeFileSync(join(dir, '.standards', 'checkin-standards.ai.yaml'), readFileSync(SHIPPED_CHECKIN));
  writeFileSync(join(dir, '.standards', 'pipeline-security-gates.ai.yaml'), readFileSync(SHIPPED_PIPELINE));
  if (rawPkg !== undefined) writeFileSync(join(dir, 'package.json'), rawPkg);
  else if (pkg !== undefined) writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg));
  if (withChangelog) writeFileSync(join(dir, 'CHANGELOG.md'), '# Changelog\n');
  return dir;
}

/** An npm script that writes a marker file in the project, so a read-back proves it really ran. */
const writes = (marker) => `node -e "require('fs').writeFileSync('${marker}','ran')"`;
const exits = (code) => `node -e "process.exit(${code})"`;

function checkin(dir) {
  return uds(['check', '--standard', 'checkin-standards'], dir);
}

// ─── A. the check-in gate, from `uds check --standard checkin-standards` ───

describe('uds check --standard checkin-standards — fail closed', () => {
  itPosix('a failing test script fails the check (exit non-zero), and says it was the test', () => {
    const dir = project({ pkg: { scripts: { lint: writes('lint.ran'), test: exits(3) } }, withChangelog: true });
    const r = checkin(dir);
    expect(r.code).not.toBe(0);
    expect(r.all).toContain('Validation Failed');
    expect(r.all).toContain('FAILED: npm run test exited with 3');
    // the lint ran first and passed — the failure is attributed to the test, not smeared
    expect(existsSync(join(dir, 'lint.ran'))).toBe(true);
    // the "no script" hint is for ABSENCE only; a script that failed must never produce it
    expect(r.all).not.toContain('No test script');
  });

  itPosix('a failing lint script fails the check (exit non-zero) and the test script is not reached', () => {
    const dir = project({ pkg: { scripts: { lint: exits(2), test: writes('test.ran') } }, withChangelog: true });
    const r = checkin(dir);
    expect(r.code).not.toBe(0);
    expect(r.all).toContain('FAILED: npm run lint exited with 2');
    expect(r.all).not.toContain('No lint script');
    expect(existsSync(join(dir, 'test.ran'))).toBe(false);
  });

  itPosix('a project with no lint and no test script passes, and prints that they are missing', () => {
    const dir = project({ pkg: { name: 'x', scripts: { build: exits(0) } }, withChangelog: true });
    const r = checkin(dir);
    expect(r.code).toBe(0);
    expect(r.all).toContain('Validation Passed');
    expect(r.all).toContain('No lint script');
    expect(r.all).toContain('No test script');
  });

  itPosix('the placeholder `npm init` writes for "test" counts as no test script, not as a failing one', () => {
    const dir = project({
      pkg: { scripts: { test: 'echo "Error: no test specified" && exit 1', lint: writes('lint.ran') } },
      withChangelog: true
    });
    const r = checkin(dir);
    expect(r.code).toBe(0);
    expect(r.all).toContain('No test script');
    expect(r.all).not.toContain('No lint script');
    expect(existsSync(join(dir, 'lint.ran'))).toBe(true);
  });

  itPosix('a project with no package.json (not an npm project) passes, and says nothing was run', () => {
    const dir = project({});
    const r = checkin(dir);
    expect(r.code).toBe(0);
    expect(r.all).toContain('No package.json');
    expect(r.all).toContain('NOT run');
  });

  itPosix('control: lint and test both pass → exit 0, both really ran, no "no script" hint', () => {
    const dir = project({ pkg: { scripts: { lint: writes('lint.ran'), test: writes('test.ran') } }, withChangelog: true });
    const r = checkin(dir);
    expect(r.code).toBe(0);
    expect(r.all).toContain('Validation Passed');
    expect(readFileSync(join(dir, 'lint.ran'), 'utf8')).toBe('ran');
    expect(readFileSync(join(dir, 'test.ran'), 'utf8')).toBe('ran');
    expect(r.all).not.toContain('No lint script');
    expect(r.all).not.toContain('No test script');
    expect(r.all).not.toContain('No CHANGELOG.md');
  });

  itPosix('a package.json that exists but cannot be parsed fails the check instead of being read as "no scripts"', () => {
    const dir = project({ rawPkg: '{ not json' });
    const r = checkin(dir);
    expect(r.code).not.toBe(0);
    expect(r.all).toContain('package.json cannot be read');
  });

  itPosix('a package.json with a UTF-8 BOM is read normally', () => {
    const dir = project({ rawPkg: `\uFEFF${JSON.stringify({ scripts: { test: exits(5) } })}` });
    const r = checkin(dir);
    expect(r.code).not.toBe(0);
    expect(r.all).toContain('FAILED: npm run test exited with 5');
  });

  itPosix('a missing CHANGELOG.md is a hint, never a failure', () => {
    const dir = project({ pkg: { scripts: { test: writes('test.ran') } } });
    const r = checkin(dir);
    expect(r.code).toBe(0);
    expect(r.all).toContain('No CHANGELOG.md');
  });

  itPosix('--json carries the same verdict: success=false when the test fails', () => {
    const dir = project({ pkg: { scripts: { test: exits(1) } } });
    const r = uds(['check', '--standard', 'checkin-standards', '--json'], dir);
    expect(r.code).not.toBe(0);
    expect(JSON.parse(r.out).success).toBe(false);
  });
});

// ─── B. the pipeline-security-gates validator (same swallow shape) ──────────

describe('uds check --standard pipeline-security-gates — fail closed', () => {
  function pipelineProject(workflow) {
    const dir = project({});
    if (workflow !== undefined) {
      mkdirSync(join(dir, '.github', 'workflows'), { recursive: true });
      writeFileSync(join(dir, '.github', 'workflows', 'ci.yml'), workflow);
    }
    return dir;
  }

  itPosix('no CI pipeline mentions a security gate → fails (it used to pass: `head` always exits 0)', () => {
    const dir = pipelineProject('name: ci\non: push\njobs:\n  b:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm test\n');
    const r = uds(['check', '--standard', 'pipeline-security-gates'], dir);
    expect(r.code).not.toBe(0);
    expect(r.all).toContain('Validation Failed');
  });

  itPosix('no CI files at all → fails', () => {
    const r = uds(['check', '--standard', 'pipeline-security-gates'], pipelineProject(undefined));
    expect(r.code).not.toBe(0);
  });

  itPosix('control: a workflow that runs a secrets scan passes', () => {
    const dir = pipelineProject('name: ci\njobs:\n  s:\n    steps:\n      - run: gitleaks detect # secrets scan\n');
    const r = uds(['check', '--standard', 'pipeline-security-gates'], dir);
    expect(r.code).toBe(0);
    expect(r.all).toContain('Validation Passed');
  });
});

// ─── C. from a real git hook ────────────────────────────────────────────────

/** A throwaway git repo with a local identity (never touches any other repo's config). */
function repo(env = cleanEnv()) {
  const dir = tmp('uds-test-checkin-repo-');
  expect(git(['init', '-q', '-b', 'main'], dir, env).code).toBe(0);
  git(['config', '--local', 'user.name', 'T'], dir, env);
  git(['config', '--local', 'user.email', 't@example.invalid'], dir, env);
  git(['config', '--local', 'commit.gpgsign', 'false'], dir, env);
  return dir;
}

/** node_modules/.bin/universal-dev-standards → this worktree's CLI: the shape `npm i -D` leaves. */
function installCliShim(dir) {
  const bin = join(dir, 'node_modules', '.bin');
  mkdirSync(bin, { recursive: true });
  const shim = join(bin, 'universal-dev-standards');
  writeFileSync(shim, `#!/bin/sh\nexec "${process.execPath}" "${CLI_PATH}" "$@"\n`);
  chmodSync(shim, 0o755);
}

function hasCommit(dir, env = cleanEnv()) {
  return git(['rev-parse', '--verify', '-q', 'HEAD'], dir, env).code === 0;
}

function commitAll(dir, env = cleanEnv()) {
  git(['add', '-A', '--', '.'], dir, env);
  return git(['commit', '-q', '-m', 'test commit'], dir, env);
}

describe('a real git commit through the pre-commit hook', () => {
  /**
   * The hook that runs the check-in gate is the one older UDS versions wrote —
   * `check --standard checkin-standards` — which `uds update` keeps as the block's
   * args (legacy-hook-migration.js). A fresh `uds init` writes the plain `check`,
   * which never evaluates a standard's physical_spec; that is a separate question
   * (XSPEC-444 R7) and not changed here. The block is installed where git looks by
   * default, so the repo's config is left alone. (`uds init` in a Node project would
   * run `npm install --save-dev husky` — network — so it is not used for this arm;
   * the `uds init` entry is exercised in the non-Node describe below.)
   */
  function nodeProjectWithGateHook(scripts) {
    const env = cleanEnv();
    const dir = repo(env);
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'p', version: '1.0.0', scripts }));
    mkdirSync(join(dir, '.standards'));
    writeFileSync(join(dir, '.standards', 'checkin-standards.ai.yaml'), readFileSync(SHIPPED_CHECKIN));
    const hook = join(dir, '.git', 'hooks', 'pre-commit');
    mkdirSync(dirname(hook), { recursive: true });
    writeFileSync(hook, `#!/bin/sh\n${buildPreCommitBlock({ args: '--standard checkin-standards' })}`);
    chmodSync(hook, 0o755);
    installCliShim(dir);
    return { dir, env };
  }

  itPosix('a failing test script blocks the commit: git records nothing', () => {
    const { dir, env } = nodeProjectWithGateHook({ test: exits(1) });
    const r = commitAll(dir, env);
    expect(r.code).not.toBe(0);
    expect(r.all).toContain('FAILED: npm run test exited with 1');
    expect(hasCommit(dir, env)).toBe(false);
  });

  itPosix('a passing test script lets the commit through: git records it, and the test really ran', () => {
    const { dir, env } = nodeProjectWithGateHook({ test: writes('test.ran') });
    const r = commitAll(dir, env);
    expect(r.code).toBe(0);
    expect(hasCommit(dir, env)).toBe(true);
    expect(readFileSync(join(dir, 'test.ran'), 'utf8')).toBe('ran');
  });

  itPosix('a project with no test script is not blocked by the gate', () => {
    const { dir, env } = nodeProjectWithGateHook({ build: exits(0) });
    const r = commitAll(dir, env);
    expect(r.code).toBe(0);
    expect(hasCommit(dir, env)).toBe(true);
    expect(r.all).toContain('No test script');
  });

  itPosix('the environment cleaning holds: a hook-style environment aimed at another repo does not leak into the project', () => {
    // This is what the ambient environment looks like when the suite runs from a
    // git hook. Without cleanEnv() the project repo's `git init`/`commit` would be
    // redirected into the decoy.
    const decoy = tmp('uds-test-checkin-decoy-');
    const decoyEnvBase = { ...process.env };
    expect(git(['init', '-q', '-b', 'main'], decoy, cleanEnv()).code).toBe(0);
    decoyEnvBase.GIT_DIR = join(decoy, '.git');
    decoyEnvBase.GIT_WORK_TREE = decoy;
    decoyEnvBase.GIT_INDEX_FILE = join(decoy, '.git', 'index');
    const env = cleanEnv(decoyEnvBase);
    const decoyConfigBefore = readFileSync(join(decoy, '.git', 'config'), 'utf8');

    const dir = repo(env);
    writeFileSync(join(dir, 'a.txt'), 'a');
    const r = commitAll(dir, env);

    expect(r.code).toBe(0);
    expect(hasCommit(dir, env)).toBe(true);
    // the decoy saw none of it
    expect(git(['rev-parse', '--verify', '-q', 'HEAD'], decoy, cleanEnv()).code).not.toBe(0);
    expect(readFileSync(join(decoy, '.git', 'config'), 'utf8')).toBe(decoyConfigBefore);
  });

  it('control for the cleaner: git reports GIT_DIR among its local variables (an empty list would clean nothing)', () => {
    expect(gitLocalEnvVars()).toContain('GIT_DIR');
    expect(gitLocalEnvVars()).toContain('GIT_INDEX_FILE');
  });
});

describe('the native hook `uds init` writes for a non-Node project can say no', () => {
  // PATH for the hook: stub dir first, then a directory holding nothing but `git`
  // (symlinked). The system dirs are NOT on it — a machine that has a real `go`, or a
  // globally installed universal-dev-standards, must not change what these arms see.
  function gitOnlyDir() {
    if (!gitOnly) {
      gitOnly = tmp('uds-test-checkin-gitonly-');
      const found = spawnSync('sh', ['-c', 'command -v git'], { encoding: 'utf8' }).stdout.trim();
      expect(found).not.toBe('');
      symlinkSync(found, join(gitOnly, 'git'));
    }
    return gitOnly;
  }

  /** `uds init` in a Go-shaped git repo → .git/hooks/pre-commit; no package.json, so no husky. */
  function nativeHookRepo() {
    const env = cleanEnv();
    const dir = repo(env);
    writeFileSync(join(dir, 'go.mod'), 'module example.invalid/x\n');
    const init = uds(['init', '--yes'], dir, env);
    expect(init.code).toBe(0);
    expect(init.all).toContain('Installed .git/hooks/pre-commit');
    const hook = readFileSync(join(dir, '.git', 'hooks', 'pre-commit'), 'utf8');
    return { dir, hook };
  }

  /** A directory of stub executables, first on PATH, with only the system dirs behind it. */
  function stubs(files) {
    const d = tmp('uds-test-checkin-stubs-');
    for (const [name, body] of Object.entries(files)) {
      writeFileSync(join(d, name), `#!/bin/sh\n${body}\n`);
      chmodSync(join(d, name), 0o755);
    }
    return d;
  }

  const withPath = (...dirs) => cleanEnv(process.env, { PATH: [...dirs, gitOnlyDir()].join(':') });

  itPosix('the script no longer contains the constructs that swallowed every failure', () => {
    const { hook } = nativeHookRepo();
    expect(hook).not.toMatch(/\|\|\s*true/);
    expect(hook).not.toMatch(/uds check 2>\/dev\/null/);
  });

  itPosix('the UDS check exiting non-zero blocks the commit (it used to be `|| true`)', () => {
    const { dir } = nativeHookRepo();
    const bin = stubs({ 'universal-dev-standards': 'echo "stub check: failing" >&2; exit 1' });
    const env = withPath(bin);
    const r = commitAll(dir, env);
    expect(r.code).not.toBe(0);
    expect(r.all).toContain('stub check: failing');
    expect(r.all).not.toContain('Pre-commit checks passed');
    expect(hasCommit(dir, env)).toBe(false);
  });

  itPosix('the UDS check exiting zero lets the commit through, and the stub was really called with `check`', () => {
    const { dir } = nativeHookRepo();
    const bin = stubs({ 'universal-dev-standards': 'echo "$@" > "$STUB_LOG"; exit 0' });
    const log = join(tmp('uds-test-checkin-log-'), 'calls');
    const env = withPath(bin);
    env.STUB_LOG = log;
    const r = commitAll(dir, env);
    expect(r.code).toBe(0);
    expect(r.all).toContain('Pre-commit checks passed');
    expect(hasCommit(dir, env)).toBe(true);
    expect(readFileSync(log, 'utf8').trim()).toBe('check');
  });

  itPosix('the UDS CLI not being installed blocks the commit and says how to fix it (it used to skip in silence)', () => {
    const { dir } = nativeHookRepo();
    const env = withPath();
    const r = commitAll(dir, env);
    expect(r.code).not.toBe(0);
    expect(r.all).toContain('is not installed');
    // the message names the file the adopter actually has, not the husky one
    expect(r.all).toContain('remove this block from .git/hooks/pre-commit');
    expect(r.all).not.toContain('.husky/pre-commit');
    expect(r.all).not.toContain('Pre-commit checks passed');
    expect(hasCommit(dir, env)).toBe(false);
  });

  itPosix('an installed linter that fails blocks the commit', () => {
    const { dir } = nativeHookRepo();
    const bin = stubs({
      go: 'echo "stub go vet: finding" >&2; exit 1',
      'universal-dev-standards': 'exit 0'
    });
    const env = withPath(bin);
    const r = commitAll(dir, env);
    expect(r.code).not.toBe(0);
    expect(r.all).toContain('stub go vet: finding');
    expect(hasCommit(dir, env)).toBe(false);
  });

  itPosix('a linter that is not installed is skipped, not treated as a failure', () => {
    const { dir } = nativeHookRepo();
    const bin = stubs({ 'universal-dev-standards': 'exit 0' });
    const env = withPath(bin);
    const r = commitAll(dir, env);
    expect(r.code).toBe(0);
    expect(hasCommit(dir, env)).toBe(true);
  });
});
