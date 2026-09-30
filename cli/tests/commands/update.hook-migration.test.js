/**
 * `uds update` swaps the pre-commit line older UDS versions wrote.
 *
 * Run as a real subprocess against a real temp project, because the property
 * that matters is positional and only shows end to end: the swap must happen
 * for an adopter whose standards are ALREADY current — `updateCommand` returns
 * early there ("Standards are up to date"), and that adopter is exactly the one
 * still carrying the old line. (`pruneRetiredHashes` in the same function is the
 * earlier case of the same trap.)
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { createManifest, writeManifest } from '../../src/core/manifest.js';
import { getRepositoryInfo } from '../../src/utils/registry.js';
import { hasBareUdsRunner, hookRunsUdsCheck } from '../../src/utils/git-hooks.js';

const BIN = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'bin', 'uds.js');
const LEGACY = '#!/bin/sh\n\n# UDS Standard Check\nnpx uds check\n';

let dir;
const hook = () => readFileSync(join(dir, '.husky', 'pre-commit'), 'utf-8');

function project({ upstream, hookText = LEGACY }) {
  spawnSync('git', ['init', '-q', '-b', 'main'], { cwd: dir });
  mkdirSync(join(dir, '.husky'), { recursive: true });
  writeFileSync(join(dir, '.husky', 'pre-commit'), hookText);
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x', version: '1.0.0' }));
  writeManifest(createManifest({ upstream: { version: upstream } }), dir);
}

function uds(args) {
  const r = spawnSync(process.execPath, [BIN, ...args, '--offline', '--ui-lang', 'en'], {
    cwd: dir,
    encoding: 'utf-8',
    // No CI/TTY prompts, and no chance of reaching the network or the developer's own config.
    env: { ...process.env, HOME: dir, UDS_LOCALE: '', CI: '1' }
  });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

const CURRENT = getRepositoryInfo().standards.version;

beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'uds-update-hook-')); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe('uds update — legacy pre-commit line', () => {
  it('swaps it for an adopter whose standards are already up to date (the early-return case)', () => {
    project({ upstream: CURRENT });
    const r = uds(['update', '--yes']);
    expect(r.out).toContain('Standards are up to date');
    expect(hasBareUdsRunner(hook())).toBe(false);
    expect(hookRunsUdsCheck(hook())).toBe(true);
    expect(r.out).toContain('.husky/pre-commit: replaced the line an older UDS wrote');
  });

  it('swaps it when an update is available too', () => {
    project({ upstream: '3.0.0' });
    uds(['update', '--yes']);
    expect(hasBareUdsRunner(hook())).toBe(false);
  });

  it('--plan says what it would do and writes nothing', () => {
    project({ upstream: CURRENT });
    const r = uds(['update', '--plan']);
    expect(r.out).toContain('would replace the line an older UDS wrote');
    expect(hook()).toBe(LEGACY);
  });

  it('a line the adopter edited is left alone, and the report names its line number', () => {
    const own = '#!/bin/sh\n# UDS Standard Check\nnpx uds check --ci\n';
    project({ upstream: CURRENT, hookText: own });
    const r = uds(['update', '--yes']);
    expect(hook()).toBe(own);
    expect(r.out).toContain('line 3');
    expect(r.out).toContain('universal-dev-standards check');
  });

  it('--with-hooks reaches it too', () => {
    project({ upstream: CURRENT });
    uds(['update', '--with-hooks', '--plan', '--ai-tool', 'claude-code']);
    // plan: untouched
    expect(hook()).toBe(LEGACY);
    uds(['update', '--with-hooks', '--ai-tool', 'claude-code']);
    expect(hasBareUdsRunner(hook())).toBe(false);
  });

  it('a run narrowed to something else does not touch the hook', () => {
    project({ upstream: CURRENT });
    uds(['update', '--plan', '--skills']);
    expect(hook()).toBe(LEGACY);
  });

  it('does nothing to a hook that is already current', () => {
    project({ upstream: CURRENT });
    uds(['update', '--yes']);
    const once = hook();
    const r = uds(['update', '--yes']);
    expect(hook()).toBe(once);
    expect(r.out).not.toContain('replaced the line an older UDS wrote');
  });
});
