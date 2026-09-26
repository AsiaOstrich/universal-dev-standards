/**
 * git-hooks.js — the actual fix for "uds init writes a pre-commit hook but
 * never confirmed git would run it" (2026-09-26, three real adopters found
 * with a silently-never-running `.husky/pre-commit`: asiaostrich-telemetry-
 * server, asiaostrich-telemetry-client, machine-setup — none had
 * `core.hooksPath` set).
 *
 * These tests use REAL `git init` repositories, not fake `.git` directories:
 * `git config --local` and `git rev-parse --git-path hooks` both refuse to
 * run outside a repository git recognizes as valid (verified empirically —
 * a bare `mkdirSync('.git')` is NOT enough, `git config --local` exits 128
 * with "fatal: --local can only be used inside a git repository").
 *
 * Global/system git config is neutralized (GIT_CONFIG_GLOBAL/SYSTEM=/dev/null)
 * so results do not depend on the machine running the tests.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, chmodSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  getLocalHooksPathConfig,
  getEffectiveHooksDir,
  wireGitHooksPath,
  checkPreCommitHookWiring,
  hasLegacyHuskyShLine,
  stripLegacyHuskyShLine
} from '../../../src/utils/git-hooks.js';

let dir;
const GIT_ENV = { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null' };

function git(args, cwd = dir) {
  return execSync(`git ${args}`, { cwd, env: GIT_ENV, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
}

function initRepo() {
  git('init -q -b main');
}

function writeHuskyHook(content = '#!/bin/sh\n# UDS Standard Check\nnpx uds check\n') {
  mkdirSync(join(dir, '.husky'), { recursive: true });
  writeFileSync(join(dir, '.husky', 'pre-commit'), content);
  chmodSync(join(dir, '.husky', 'pre-commit'), 0o755);
}

beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'uds-git-hooks-')); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe('getLocalHooksPathConfig', () => {
  it('returns null when unset', () => {
    initRepo();
    expect(getLocalHooksPathConfig(dir)).toBeNull();
  });

  it('returns the configured value', () => {
    initRepo();
    git('config --local core.hooksPath .husky');
    expect(getLocalHooksPathConfig(dir)).toBe('.husky');
  });
});

describe('getEffectiveHooksDir', () => {
  it('defaults to .git/hooks when unset', () => {
    initRepo();
    expect(getEffectiveHooksDir(dir)).toBe(join(dir, '.git', 'hooks'));
  });

  it('follows core.hooksPath when set', () => {
    initRepo();
    git('config --local core.hooksPath .husky');
    expect(getEffectiveHooksDir(dir)).toBe(join(dir, '.husky'));
  });

  it('returns null outside a git repository (never guesses)', () => {
    // no git init at all
    expect(getEffectiveHooksDir(dir)).toBeNull();
  });
});

describe('wireGitHooksPath', () => {
  it('sets core.hooksPath when unset and no native hook exists', () => {
    initRepo();
    const result = wireGitHooksPath(dir, '.husky');
    expect(result.wired).toBe(true);
    expect(getLocalHooksPathConfig(dir)).toBe('.husky');
  });

  it('does not override an existing different core.hooksPath', () => {
    initRepo();
    git('config --local core.hooksPath tools/hooks');
    const result = wireGitHooksPath(dir, '.husky');
    expect(result.wired).toBe(false);
    expect(result.reason).toMatch(/tools\/hooks/);
    // must be untouched
    expect(getLocalHooksPathConfig(dir)).toBe('tools/hooks');
  });

  it('is a no-op (already wired) when hooksPath already points at the target', () => {
    initRepo();
    git('config --local core.hooksPath .husky');
    const result = wireGitHooksPath(dir, '.husky');
    expect(result.wired).toBe(true);
  });

  it('does not override an existing native .git/hooks/pre-commit', () => {
    initRepo();
    mkdirSync(join(dir, '.git', 'hooks'), { recursive: true });
    writeFileSync(join(dir, '.git', 'hooks', 'pre-commit'), '#!/bin/sh\necho mine\n');
    const result = wireGitHooksPath(dir, '.husky');
    expect(result.wired).toBe(false);
    expect(result.reason).toMatch(/\.git\/hooks\/pre-commit/);
    expect(getLocalHooksPathConfig(dir)).toBeNull();
  });
});

describe('checkPreCommitHookWiring', () => {
  it('is not relevant when no UDS-managed hook file exists', () => {
    initRepo();
    expect(checkPreCommitHookWiring(dir).relevant).toBe(false);
  });

  it('is not relevant outside a git repository', () => {
    // No `git init` — .git does not exist at all.
    expect(checkPreCommitHookWiring(dir).relevant).toBe(false);
  });

  it('reports NOT wired: the original defect (.husky/pre-commit present, hooksPath unset)', () => {
    initRepo();
    writeHuskyHook();
    const result = checkPreCommitHookWiring(dir);
    expect(result.relevant).toBe(true);
    expect(result.wired).toBe(false);
    expect(result.hookFile).toBe('.husky/pre-commit');
    expect(result.configuredHooksPath).toBeNull();
  });

  it('reports wired after wireGitHooksPath runs (direct wiring)', () => {
    initRepo();
    writeHuskyHook();
    wireGitHooksPath(dir, '.husky');
    const result = checkPreCommitHookWiring(dir);
    expect(result.wired).toBe(true);
  });

  it('recognizes husky\'s own bootstrap shape (core.hooksPath = .husky/_ with a shim)', () => {
    initRepo();
    writeHuskyHook();
    // Emulate what `npx husky` itself does (verified against husky ^9.1.7's
    // index.js): hooksPath points one level deeper, at a shim directory whose
    // files forward to the real script one directory up.
    mkdirSync(join(dir, '.husky', '_'), { recursive: true });
    writeFileSync(join(dir, '.husky', '_', 'pre-commit'), '#!/usr/bin/env sh\n. "$(dirname "$0")/h"\n');
    git('config --local core.hooksPath .husky/_');
    const result = checkPreCommitHookWiring(dir);
    expect(result.wired).toBe(true);
  });

  it('reports NOT wired when core.hooksPath points somewhere else entirely', () => {
    initRepo();
    writeHuskyHook();
    git('config --local core.hooksPath tools/hooks');
    const result = checkPreCommitHookWiring(dir);
    expect(result.wired).toBe(false);
    expect(result.configuredHooksPath).toBe('tools/hooks');
  });

  it('flags legacy husky v8 syntax (`_/husky.sh` sourcing)', () => {
    initRepo();
    writeHuskyHook('#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n# UDS Standard Check\nnpx uds check\n');
    const result = checkPreCommitHookWiring(dir);
    expect(result.legacyV8).toBe(true);
  });

  it('reports the native (non-Node) hook path when core.hooksPath is overridden elsewhere', () => {
    initRepo();
    mkdirSync(join(dir, '.git', 'hooks'), { recursive: true });
    writeFileSync(join(dir, '.git', 'hooks', 'pre-commit'), '#!/bin/sh\n# UDS pre-commit hook\nuds check\n');
    chmodSync(join(dir, '.git', 'hooks', 'pre-commit'), 0o755);
    git('config --local core.hooksPath tools/hooks');
    const result = checkPreCommitHookWiring(dir);
    expect(result.relevant).toBe(true);
    expect(result.wired).toBe(false);
    expect(result.hookFile).toBe('.git/hooks/pre-commit');
    expect(result.configuredHooksPath).toBe('tools/hooks');
  });

  it('reports wired for the native (non-Node) default install', () => {
    initRepo();
    mkdirSync(join(dir, '.git', 'hooks'), { recursive: true });
    writeFileSync(join(dir, '.git', 'hooks', 'pre-commit'), '#!/bin/sh\n# UDS pre-commit hook\nuds check\n');
    chmodSync(join(dir, '.git', 'hooks', 'pre-commit'), 0o755);
    const result = checkPreCommitHookWiring(dir);
    expect(result.wired).toBe(true);
  });
});

describe('stripLegacyHuskyShLine / hasLegacyHuskyShLine', () => {
  it('detects the exact husky v8 sourcing line', () => {
    expect(hasLegacyHuskyShLine('#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n')).toBe(true);
  });

  it('does not false-positive on ordinary content', () => {
    expect(hasLegacyHuskyShLine('# UDS Standard Check\nnpx uds check\n')).toBe(false);
  });

  it('removes only the sourcing line, keeping everything else in order', () => {
    const before = '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\nnpm run lint\n# UDS Standard Check\nnpx uds check\n';
    const { content, removed } = stripLegacyHuskyShLine(before);
    expect(removed).toBe(true);
    expect(content).not.toMatch(/_\/husky\.sh/);
    expect(content).toContain('#!/usr/bin/env sh');
    expect(content).toContain('npm run lint');
    expect(content).toContain('npx uds check');
  });

  it('is a no-op when the line is not present', () => {
    const before = '# UDS Standard Check\nnpx uds check\n';
    const { content, removed } = stripLegacyHuskyShLine(before);
    expect(removed).toBe(false);
    expect(content).toBe(before);
  });
});

describe('real-world incident reproduction (2026-09-27): hooksPath alone on a legacy template breaks every commit', () => {
  function commitCmd(message) {
    return `-c user.name=t -c user.email=t@t.com commit -q --allow-empty -m ${message}`;
  }

  it('following the hooksPath-only fix on a legacy template makes git commit fail', () => {
    initRepo();
    git(commitCmd('init'));
    writeHuskyHook('#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n# UDS Standard Check\nnpx uds check\n');

    // This is exactly the advice `uds check` used to give in isolation.
    wireGitHooksPath(dir, '.husky');

    const before = git('log --oneline').trim().split('\n').filter(Boolean).length;
    let failed = false;
    let stderr = '';
    try {
      git(commitCmd('test'));
    } catch (e) {
      failed = true;
      stderr = String(e.stderr || e.message || '');
    }
    expect(failed).toBe(true);
    expect(stderr).toMatch(/No such file or directory/);
    const after = git('log --oneline').trim().split('\n').filter(Boolean).length;
    expect(after).toBe(before);
  });

  it('removing the legacy line first, then wiring hooksPath, lets the commit succeed', () => {
    initRepo();
    git(commitCmd('init'));
    writeHuskyHook('#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n# UDS Standard Check\nnpx uds check\n');

    const raw = readFileSync(join(dir, '.husky', 'pre-commit'), 'utf-8');
    const { content } = stripLegacyHuskyShLine(raw);
    writeFileSync(join(dir, '.husky', 'pre-commit'), content);
    wireGitHooksPath(dir, '.husky');

    expect(() => git(commitCmd('test'))).not.toThrow();
  });
});
