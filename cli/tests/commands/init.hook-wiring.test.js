/**
 * setupHuskyHook — the pre-commit check must ACTUALLY run, not merely exist.
 *
 * Regression cover for the fix described in git-hooks.js: `uds init` used to
 * write `.husky/pre-commit` (or `.git/hooks/pre-commit` for non-Node
 * projects) without ever confirming git would execute it. Verified against
 * three real adopters (2026-09-26): all three had the file, none had
 * `core.hooksPath` set, and the check had never once run on commit —
 * silently, with no error.
 *
 * These tests use REAL `git init` repositories and REAL `git commit` calls —
 * per the standing rule "measure whether it's working, not whether it ran":
 * a hook file existing on disk is not evidence it executes. The strongest
 * proof available is exactly this: make the hook observably change the repo
 * (write a marker file) and commit for real.
 *
 * We do NOT let the real `npx uds check` run inside these throwaway repos
 * (no network, no real package installed): once `setupHuskyHook` has wired
 * things, we overwrite the hook body with a small marker script before
 * committing.
 *
 * Global/system git config is neutralized so results do not depend on the
 * machine running the tests.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync, chmodSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { getLocalHooksPathConfig } from '../../src/utils/git-hooks.js';

vi.mock('chalk', () => ({
  default: { bold: (s) => s, gray: (s) => s, green: (s) => s, yellow: (s) => s, red: (s) => s, cyan: (s) => s }
}));

const { setupHuskyHook } = await import('../../src/commands/init.js');

let dir;
let savedEnv;
const MARKER = 'MARKER';

function git(args, cwd = dir) {
  return execSync(`git ${args}`, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
}

function initRepo() {
  git('init -q -b main');
  git('config --local user.name test');
  git('config --local user.email test@test.com');
  writeFileSync(join(dir, '.gitignore'), '');
  git('add .gitignore');
  git('commit -q -m init');
}

function markerExists() {
  return existsSync(join(dir, MARKER));
}

/** Replace whatever's at `hookPath` with a script that just touches MARKER —
 * proves git actually executes THIS FILE, without invoking the real `uds`. */
function replaceWithMarkerScript(hookPath) {
  writeFileSync(hookPath, `touch ${MARKER}\n`);
  chmodSync(hookPath, 0o755);
}

function commit(message = 'work') {
  writeFileSync(join(dir, `file-${Date.now()}-${Math.random()}`), 'x');
  git('add -A');
  return execSync(`git -c user.name=test -c user.email=test@test.com commit -q -m "${message}"`, {
    cwd: dir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']
  });
}

function commitFails(message = 'work') {
  writeFileSync(join(dir, `file-${Date.now()}-${Math.random()}`), 'x');
  git('add -A');
  try {
    execSync(`git -c user.name=test -c user.email=test@test.com commit -q -m "${message}"`, {
      cwd: dir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']
    });
    return false;
  } catch {
    return true;
  }
}

function logCount() {
  return git('log --oneline').trim().split('\n').filter(Boolean).length;
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'uds-init-hook-'));
  savedEnv = { GLOBAL: process.env.GIT_CONFIG_GLOBAL, SYSTEM: process.env.GIT_CONFIG_SYSTEM };
  process.env.GIT_CONFIG_GLOBAL = '/dev/null';
  process.env.GIT_CONFIG_SYSTEM = '/dev/null';
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  process.env.GIT_CONFIG_GLOBAL = savedEnv.GLOBAL;
  process.env.GIT_CONFIG_SYSTEM = savedEnv.SYSTEM;
});

describe('setupHuskyHook — Node project, the wiring actually runs', () => {
  it('sets core.hooksPath to .husky', async () => {
    initRepo();
    writeFileSync(join(dir, 'package.json'), JSON.stringify({
      name: 'fixture', version: '1.0.0', devDependencies: { husky: '^9.1.7' }
    }));

    await setupHuskyHook(dir, { allowInTest: true });

    expect(getLocalHooksPathConfig(dir)).toBe('.husky');
  });

  it('the pre-commit hook ACTUALLY executes on a real git commit (not merely exists)', async () => {
    initRepo();
    writeFileSync(join(dir, 'package.json'), JSON.stringify({
      name: 'fixture', version: '1.0.0', devDependencies: { husky: '^9.1.7' }
    }));

    await setupHuskyHook(dir, { allowInTest: true });
    // Swap the body so the real (network-touching) `npx uds check` never runs
    // in this throwaway repo — the file path and its wiring are what we test.
    replaceWithMarkerScript(join(dir, '.husky', 'pre-commit'));

    expect(markerExists()).toBe(false);
    commit();
    expect(markerExists()).toBe(true);
  });

  it('a failing hook actually blocks the commit (strongest proof it runs)', async () => {
    initRepo();
    writeFileSync(join(dir, 'package.json'), JSON.stringify({
      name: 'fixture', version: '1.0.0', devDependencies: { husky: '^9.1.7' }
    }));

    await setupHuskyHook(dir, { allowInTest: true });
    writeFileSync(join(dir, '.husky', 'pre-commit'), 'exit 1\n');
    chmodSync(join(dir, '.husky', 'pre-commit'), 0o755);

    const before = logCount();
    expect(commitFails()).toBe(true);
    expect(logCount()).toBe(before);
  });

  it('does NOT override an existing, different core.hooksPath — and the hook does not run', async () => {
    initRepo();
    writeFileSync(join(dir, 'package.json'), JSON.stringify({
      name: 'fixture', version: '1.0.0', devDependencies: { husky: '^9.1.7' }
    }));
    mkdirSync(join(dir, 'tools', 'hooks'), { recursive: true });
    git('config --local core.hooksPath tools/hooks');

    await setupHuskyHook(dir, { allowInTest: true });

    expect(getLocalHooksPathConfig(dir)).toBe('tools/hooks');
    // The husky file was still written...
    replaceWithMarkerScript(join(dir, '.husky', 'pre-commit'));
    // ...but git is not looking at .husky, so it must not run.
    commit();
    expect(markerExists()).toBe(false);
  });

  it('does NOT override an existing native .git/hooks/pre-commit, and does not touch its content', async () => {
    initRepo();
    writeFileSync(join(dir, 'package.json'), JSON.stringify({
      name: 'fixture', version: '1.0.0', devDependencies: { husky: '^9.1.7' }
    }));
    mkdirSync(join(dir, '.git', 'hooks'), { recursive: true });
    const nativeHook = join(dir, '.git', 'hooks', 'pre-commit');
    writeFileSync(nativeHook, `touch ${MARKER}\n`);
    chmodSync(nativeHook, 0o755);

    await setupHuskyHook(dir, { allowInTest: true });

    expect(getLocalHooksPathConfig(dir)).toBeNull();
    expect(readFileSync(nativeHook, 'utf-8')).toBe(`touch ${MARKER}\n`);
    // The adopter's own native hook is still what runs.
    commit();
    expect(markerExists()).toBe(true);
  });
});

describe('setupHuskyHook — non-Node project, native hook actually runs', () => {
  it('writes an executable .git/hooks/pre-commit that git actually runs', async () => {
    initRepo();

    await setupHuskyHook(dir, { allowInTest: true });

    const nativeHook = join(dir, '.git', 'hooks', 'pre-commit');
    expect(existsSync(nativeHook)).toBe(true);
    replaceWithMarkerScript(nativeHook);
    commit();
    expect(markerExists()).toBe(true);
  });

  it('does not clobber an existing foreign .git/hooks/pre-commit', async () => {
    initRepo();
    mkdirSync(join(dir, '.git', 'hooks'), { recursive: true });
    const nativeHook = join(dir, '.git', 'hooks', 'pre-commit');
    writeFileSync(nativeHook, `touch ${MARKER}\n`);
    chmodSync(nativeHook, 0o755);

    await setupHuskyHook(dir, { allowInTest: true });

    expect(readFileSync(nativeHook, 'utf-8')).toBe(`touch ${MARKER}\n`);
    commit();
    expect(markerExists()).toBe(true);
  });

  it('does not write anything when core.hooksPath already points elsewhere', async () => {
    initRepo();
    mkdirSync(join(dir, 'tools', 'hooks'), { recursive: true });
    git('config --local core.hooksPath tools/hooks');

    await setupHuskyHook(dir, { allowInTest: true });

    expect(existsSync(join(dir, '.git', 'hooks', 'pre-commit'))).toBe(false);
    expect(getLocalHooksPathConfig(dir)).toBe('tools/hooks');
  });
});

describe('setupHuskyHook — guards', () => {
  it('does nothing outside a git repository (honest — no crash, no silent write)', async () => {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x' }));

    await expect(setupHuskyHook(dir, { allowInTest: true })).resolves.not.toThrow();

    expect(existsSync(join(dir, '.husky'))).toBe(false);
  });
});
