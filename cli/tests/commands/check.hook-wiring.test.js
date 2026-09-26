/**
 * checkPreCommitWiring (check.js) — surfaces "a UDS pre-commit hook file
 * exists, but git will not actually run it" to adopters who already have the
 * defect (see git-hooks.js for the full origin story). Read-only: never
 * writes to the project or to git config.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, chmodSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';

vi.mock('chalk', () => ({
  default: { bold: (s) => s, gray: (s) => s, green: (s) => s, yellow: (s) => s, red: (s) => s, cyan: (s) => s }
}));

import { checkPreCommitWiring } from '../../src/commands/check.js';
import { getLocalHooksPathConfig, wireGitHooksPath } from '../../src/utils/git-hooks.js';
import { t } from '../../src/i18n/messages.js';

const msg = t().commands.check; // default language is 'en'

let dir;
let logs;
let spy;

function git(args, cwd = dir) {
  return execSync(`git ${args}`, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'uds-check-hook-'));
  process.env.GIT_CONFIG_GLOBAL = '/dev/null';
  process.env.GIT_CONFIG_SYSTEM = '/dev/null';
  git('init -q -b main');
  logs = [];
  spy = vi.spyOn(console, 'log').mockImplementation((...args) => { logs.push(args.join(' ')); });
});

afterEach(() => {
  spy.mockRestore();
  rmSync(dir, { recursive: true, force: true });
});

function writeHuskyHook() {
  mkdirSync(join(dir, '.husky'), { recursive: true });
  writeFileSync(join(dir, '.husky', 'pre-commit'), '# UDS Standard Check\nnpx uds check\n');
  chmodSync(join(dir, '.husky', 'pre-commit'), 0o755);
}

function writeLegacyHuskyHook() {
  mkdirSync(join(dir, '.husky'), { recursive: true });
  writeFileSync(
    join(dir, '.husky', 'pre-commit'),
    '#!/usr/bin/env sh\n. "$(dirname -- "$0")/_/husky.sh"\n\n# UDS Standard Check\nnpx uds check\n'
  );
  chmodSync(join(dir, '.husky', 'pre-commit'), 0o755);
}

describe('checkPreCommitWiring', () => {
  it('is silent when nothing UDS-managed is installed', () => {
    checkPreCommitWiring(dir, msg);
    expect(logs.join('\n')).toBe('');
  });

  it('is silent once the hook is actually wired', () => {
    writeHuskyHook();
    wireGitHooksPath(dir, '.husky');
    checkPreCommitWiring(dir, msg);
    expect(logs.join('\n')).toBe('');
  });

  it('warns "exists but will not run" for the original defect (hooksPath unset)', () => {
    writeHuskyHook();
    checkPreCommitWiring(dir, msg);
    const out = logs.join('\n');
    expect(out).toContain('.husky/pre-commit');
    expect(out).toMatch(/will not run it/);
    expect(out).toContain('git config --local core.hooksPath .husky');
  });

  it('warns about an existing core.hooksPath override without suggesting to clobber it', () => {
    writeHuskyHook();
    git('config --local core.hooksPath tools/hooks');
    checkPreCommitWiring(dir, msg);
    const out = logs.join('\n');
    expect(out).toContain('tools/hooks');
    expect(out).toMatch(/will not override it/);
  });

  it('flags legacy husky v8 syntax with a removal hint', () => {
    writeLegacyHuskyHook();
    checkPreCommitWiring(dir, msg);
    const out = logs.join('\n');
    expect(out).toMatch(/husky\.sh/);
  });

  // Regression for the 2026-09-27 real-world incident: a dispatched agent's
  // fix told adopters to run `git config --local core.hooksPath .husky`.
  // Followed literally on a real adopter's legacy `.husky/pre-commit` (still
  // sourcing `_/husky.sh`), that single instruction made git execute the file
  // directly and fail EVERY commit with "No such file or directory" — worse
  // than the original defect. The advice for a legacy template must never be
  // "just set hooksPath" in isolation; it must say to remove the `_/husky.sh`
  // line FIRST.
  it('never suggests hooksPath alone for a legacy template (hooksPath unset)', () => {
    writeLegacyHuskyHook();
    checkPreCommitWiring(dir, msg);
    const out = logs.join('\n');
    // The plain, non-legacy fix message must not appear in isolation.
    expect(out).not.toContain('Fix (per-clone');
    // The combined instruction must mention removing the line, in order,
    // before the hooksPath command.
    expect(out).toMatch(/\(1\)[\s\S]*_\/husky\.sh[\s\S]*\(2\)[\s\S]*core\.hooksPath \.husky/);
  });

  it('also warns about the legacy line when core.hooksPath is overridden elsewhere', () => {
    writeLegacyHuskyHook();
    git('config --local core.hooksPath tools/hooks');
    checkPreCommitWiring(dir, msg);
    const out = logs.join('\n');
    expect(out).toContain('tools/hooks');
    expect(out).toMatch(/husky\.sh/);
  });

  it('never modifies git config or the filesystem (read-only)', () => {
    writeHuskyHook();
    checkPreCommitWiring(dir, msg);
    expect(getLocalHooksPathConfig(dir)).toBeNull();
  });
});
