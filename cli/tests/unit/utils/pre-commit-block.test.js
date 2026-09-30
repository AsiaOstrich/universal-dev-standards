/**
 * The block `uds init` writes into `.husky/pre-commit` — executed for real.
 *
 * The block replaced a one-line `npx` + bare name `uds`, which asked the npm
 * registry for a package that is not this project when nothing was installed.
 * These tests run the block under a real POSIX shell with a PATH that has NO
 * node and NO real UDS, and with `npx`/`npm` stubs that record any call, so
 * "never involves npm" is measured rather than asserted from the text.
 *
 * A shell script's text tells you almost nothing about what it does when the
 * thing it looks for is missing — that branch is the whole point here, so each
 * outcome (installed locally, on PATH, missing, stranger's `uds`, failing check)
 * gets its own run.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync, chmodSync } from 'fs';
import { spawnSync } from 'child_process';
import { join } from 'path';
import { tmpdir } from 'os';
import { buildPreCommitBlock, stripUdsHookBlock, UDS_HOOK_MARKER, UDS_HOOK_END_MARKER } from '../../../src/utils/git-hooks.js';

let dir;
let logFile;

function stub(path, body) {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, `#!/bin/sh\n${body}\n`);
  chmodSync(path, 0o755);
}

/** A PATH directory whose `npx`/`npm` record that they were called and then fail. */
function npmSpies(binDir) {
  for (const n of ['npx', 'npm', 'pnpm', 'yarn', 'bunx']) {
    stub(join(binDir, n), `echo "${n} $*" >> "${logFile}"; exit 99`);
  }
}

/** Run a hook script under sh in `dir` with a PATH that names only `extra` and system dirs. */
function runHook(script, { extraPath = [], sh = '/bin/sh' } = {}) {
  writeFileSync(join(dir, 'hook.sh'), script);
  const r = spawnSync(sh, [join(dir, 'hook.sh')], {
    cwd: dir,
    encoding: 'utf-8',
    env: { PATH: [...extraPath, '/usr/bin', '/bin'].join(':'), HOME: dir, LOG: logFile }
  });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

const calls = () => (existsSync(logFile) ? readFileSync(logFile, 'utf-8') : '');

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'uds-precommit-block-'));
  logFile = join(dir, 'calls.log');
});
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

const shells = ['/bin/sh', ...['/bin/dash', '/bin/bash'].filter((p) => existsSync(p))];

// On Windows git runs the hook with its own bundled sh, not a `/bin/sh` path, and npm's
// extensionless bin shim is what `command -v` would find there. This suite runs POSIX
// shells and does not cover that; the Windows behaviour of the block is [UNVERIFIED].
describe.skipIf(process.platform === 'win32').each(shells)('the pre-commit block under %s', (sh) => {
  const block = `#!/bin/sh\n${buildPreCommitBlock()}`;

  it('runs the CLI installed in this project, and passes its exit status through', () => {
    stub(join(dir, 'node_modules', '.bin', 'universal-dev-standards'), 'echo "ran-local $*" >> "$LOG"; exit 0');
    const r = runHook(block, { sh });
    expect(r.status).toBe(0);
    expect(calls()).toBe('ran-local check\n');
  });

  it('runs a CLI that is on PATH when the project has none', () => {
    const globalBin = join(dir, 'globalbin');
    stub(join(globalBin, 'universal-dev-standards'), 'echo "ran-global $*" >> "$LOG"; exit 0');
    const r = runHook(block, { sh, extraPath: [globalBin] });
    expect(r.status).toBe(0);
    expect(calls()).toBe('ran-global check\n');
  });

  it('prefers the project\'s copy over one on PATH', () => {
    stub(join(dir, 'node_modules', '.bin', 'universal-dev-standards'), 'echo local >> "$LOG"');
    const globalBin = join(dir, 'globalbin');
    stub(join(globalBin, 'universal-dev-standards'), 'echo global >> "$LOG"');
    runHook(block, { sh, extraPath: [globalBin] });
    expect(calls()).toBe('local\n');
  });

  it('a failing check stops the commit with the check\'s own status', () => {
    stub(join(dir, 'node_modules', '.bin', 'universal-dev-standards'), 'exit 3');
    expect(runHook(block, { sh }).status).toBe(3);
  });

  it('NOT installed: exits non-zero, says what to install, and never calls npm/npx/pnpm/yarn/bunx', () => {
    const spies = join(dir, 'spies');
    npmSpies(spies);
    const r = runHook(block, { sh, extraPath: [spies] });
    expect(r.status).not.toBe(0);
    expect(r.out).toContain('is not installed');
    expect(r.out).toContain('npm install --save-dev universal-dev-standards');
    // The whole point: nothing asked a package runner for anything.
    expect(calls()).toBe('');
  });

  it('a stranger\'s `uds` on PATH or in node_modules/.bin is never run — only the full package name is looked up', () => {
    stub(join(dir, 'node_modules', '.bin', 'uds'), 'echo STRANGER-local >> "$LOG"');
    const globalBin = join(dir, 'globalbin');
    stub(join(globalBin, 'uds'), 'echo STRANGER-global >> "$LOG"');
    const r = runHook(block, { sh, extraPath: [globalBin] });
    expect(r.status).not.toBe(0);
    expect(calls()).toBe('');
  });

  it('a block that fails still stops the commit when the adopter has commands after it', () => {
    // No `set -e` in a husky hook: without `|| exit $?` the missing-CLI branch would
    // be a silent skip of the check the moment anything followed the block.
    const r = runHook(`${block}echo "adopter-command-ran" >> "$LOG"\n`, { sh });
    expect(r.status).not.toBe(0);
    expect(calls()).toBe('');
  });

  it('does not leak its PATH change into the adopter\'s own commands', () => {
    stub(join(dir, 'node_modules', '.bin', 'universal-dev-standards'), 'exit 0');
    const r = runHook(`${block}echo "PATH=$PATH" >> "$LOG"\n`, { sh });
    expect(r.status).toBe(0);
    expect(calls()).not.toContain('node_modules/.bin');
  });

  it('keeps extra arguments (older UDS wrote `--standard checkin-standards`)', () => {
    stub(join(dir, 'node_modules', '.bin', 'universal-dev-standards'), 'echo "$*" >> "$LOG"');
    const withArgs = `#!/bin/sh\n${buildPreCommitBlock({ args: '--standard checkin-standards' })}`;
    runHook(withArgs, { sh });
    expect(calls()).toBe('check --standard checkin-standards\n');
  });
});

describe('the block\'s text', () => {
  it('never contains a package runner followed by the bare name', () => {
    expect(buildPreCommitBlock()).not.toMatch(/\b(?:npx|bunx|pnpx|dlx|exec)\s+(?:-\S+\s+)*uds\b/);
  });

  it('is removed whole by its markers and nothing else is touched', () => {
    const before = `#!/bin/sh\nnpm run lint\n\n${buildPreCommitBlock()}npm test\n`;
    const { content, removed } = stripUdsHookBlock(before);
    expect(removed).toBe(true);
    expect(content).toBe('#!/bin/sh\nnpm run lint\n\nnpm test\n');
  });

  it('leaves a block alone when its end marker was removed (no longer provably ours)', () => {
    const cut = buildPreCommitBlock().replace(`${UDS_HOOK_END_MARKER}\n`, '');
    const { content, removed } = stripUdsHookBlock(cut);
    expect(removed).toBe(false);
    expect(content).toBe(cut);
    expect(content).toContain(UDS_HOOK_MARKER);
  });
});
