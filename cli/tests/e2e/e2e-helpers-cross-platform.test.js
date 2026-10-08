/**
 * E2E: the helpers the end-to-end tests stand on work on Windows, and the first CI run on three systems
 * (XSPEC-469 R4, run 37742737838) said where they did not. Evidence for dev-platform XSPEC-469 R4.
 *
 * Three causes, each shown here without a Windows machine:
 *   1. `npm` is `npm.cmd` on Windows; Node cannot start it without a shell ("spawn npm ENOENT", 9 tests). The
 *      packaged-CLI helper now starts npm through `resolveNpm`. Reproduced on any system by taking `npm` off
 *      PATH: a helper that spawns a bare `npm` fails exactly the way a `.cmd` does.
 *   2. `path.join` gives backslashes on Windows, so `f.path.includes('.standards/')` was false for every file
 *      the runner listed (2 tests). Reproduced with `path.win32` and an injected separator.
 *   3. `runInteractive` answered by position in stdout chunks; the "cancel" test then installed instead of
 *      cancelling on a machine that split stdout differently (Ubuntu). `runPrompted` answers by what the
 *      prompt asks, checked below by the effect: the cancel answer reaches the final question and nothing is written.
 *
 *   4. The staged-CLI harness linked repo entries with a 'dir' symlink and an untyped symlink; both need a
 *      privilege or give the wrong link type on Windows. Checked by injecting the platform and the symlink call.
 *
 * Wires that make these red when cut (one line each):
 *   cli/tests/utils/packaged-cli.js   const npm = resolveNpm({ env: process.env });
 *   cli/tests/utils/cli-runner.js     return sep === '/' ? p : p.split(sep).join('/');
 *   cli/tests/utils/staged-cli-harness.js  if (isDirectory) return symlink(target, link, 'junction');
 *   cli/tests/utils/cli-runner.js     const ruleIndex = rules.findIndex((r) => r.when.test(prompt));
 */

import { it, expect, afterAll } from 'vitest';
import { win32, join } from 'path';
import { mkdtempSync, symlinkSync, existsSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { toPosix, currentPrompt, runPrompted, createTempDir, cleanupTempDir } from '../utils/cli-runner.js';
import { createPackagedWorld } from '../utils/packaged-cli.js';
import { linkRepoEntry, REAL_REPO } from '../utils/staged-cli-harness.js';

const world = createPackagedWorld('uds-test-e2e-helpers');
afterAll(() => world.dispose());

it('the path the runner lists for a file under .standards uses forward slashes even where path.join does not (XSPEC-469 R4, windows-latest init-flow Scenario C)', () => {
  const asWindowsJoinsIt = win32.join('.standards', 'anti-hallucination.md');
  expect(asWindowsJoinsIt, 'control: this really is what Windows path.join returns').toBe('.standards\\anti-hallucination.md');
  expect(toPosix(asWindowsJoinsIt, '\\')).toBe('.standards/anti-hallucination.md');
  expect(toPosix(asWindowsJoinsIt, '\\').includes('.standards/')).toBe(true);
  expect(toPosix('.standards/x.md', '/')).toBe('.standards/x.md');
});

it('packing the CLI does not need an `npm` file on PATH: Windows has only npm.cmd, which Node cannot start directly (XSPEC-469 R4, windows-latest check-diff and extensions tests)', async (ctx) => {
  // This test reproduces the Windows failure on POSIX (a PATH without `npm`, built from /bin/sh and /usr/bin/tar);
  // on Windows the real thing runs in check-diff-installed-version and extensions-packaged-offline.
  if (process.platform === 'win32') ctx.skip();
  // PATH holds `tar`, `sh` and `node` but no `npm`: a bare `spawn("npm")` now fails the way it fails on Windows (ENOENT).
  const bin = mkdtempSync(join(tmpdir(), 'uds-test-path-'));
  const savedPath = process.env.PATH;
  try {
    const tar = ['/usr/bin/tar', '/bin/tar'].find((p) => existsSync(p));
    expect(tar, 'control: a tar exists to put on the restricted PATH').toBeTruthy();
    symlinkSync(tar, join(bin, 'tar'));
    symlinkSync('/bin/sh', join(bin, 'sh')); // npm runs the prepack script through sh
    symlinkSync(process.execPath, join(bin, 'node')); // ... which runs `node scripts/prepack.mjs`
    expect(existsSync(join(bin, 'npm')), 'control: there is no npm on the restricted PATH').toBe(false);
    process.env.PATH = bin;
    const pkg = await world.packAndExtract();
    expect(existsSync(join(pkg.pkgDir, 'bin', 'uds.js')), 'the tarball was packed and extracted').toBe(true);
    expect(JSON.parse(readFileSync(join(pkg.pkgDir, 'package.json'), 'utf-8')).version).toBe(pkg.version);
  } finally {
    process.env.PATH = savedPath;
    rmSync(bin, { recursive: true, force: true });
  }
}, 600000);

it('currentPrompt sees only the question that is waiting, never the echo of the one just answered (XSPEC-469 R4, ubuntu init-flow cancel)', () => {
  expect(currentPrompt('✔ Which AI tools are you using? Claude Code\n\nAGENTS.md\n')).toBeNull();
  expect(currentPrompt('✔ Which AI tools are you using? Claude Code\n? Generate AGENTS.md? (Y/n)')).toBe('? Generate AGENTS.md? (Y/n)');
  expect(currentPrompt('? Select a thing:\n❯ one\n  two\n')).toContain('❯ one');
  expect(currentPrompt('? Proceed with installation? (Y/n) n✔ Proceed with installation? No\nInstallation cancelled.')).toBeNull();
  // the tick is `√` where the terminal has no unicode (inquirer's Windows fallback)
  expect(currentPrompt('? Generate AGENTS.md? (Y/n) Y\n√ Generate AGENTS.md? Yes')).toBeNull();
  expect(currentPrompt('no prompt here')).toBeNull();
});

it('uds init answered by prompt: the cancel answer reaches the final question, the CLI says it cancelled, and no manifest is written (XSPEC-469 R4)', async () => {
  const dir = await createTempDir();
  try {
    const r = await runPrompted([
      { when: /Which AI tools/i, keys: ' \r' },
      { when: /Proceed with installation/i, keys: 'n\r' }
    ], dir, { timeout: 100000 });
    expect(r.timedOut).toBe(false);
    expect(r.answers.length, 'many prompts were answered, not just the last').toBeGreaterThan(5);
    expect(r.answers.filter((a) => a.rule === 1)).toHaveLength(1);
    expect(r.answers[r.answers.length - 1].prompt).toMatch(/Proceed with installation/i);
    expect(r.stdout).toContain('Installation cancelled');
    expect(existsSync(join(dir, '.standards', 'manifest.json'))).toBe(false);
    // and the other direction: answered "yes" to the same question, it installs — so the "n" is what cancelled
    const dir2 = await createTempDir();
    try {
      const y = await runPrompted([{ when: /Which AI tools/i, keys: ' \r' }, { when: /Proceed with installation/i, keys: 'y\r' }], dir2, { timeout: 100000 });
      expect(y.exitCode).toBe(0);
      expect(existsSync(join(dir2, '.standards', 'manifest.json'))).toBe(true);
    } finally {
      await cleanupTempDir(dir2);
    }
  } finally {
    await cleanupTempDir(dir);
  }
}, 240000);

it('the staged harness links a repo directory as a junction and copies a repo file on Windows, and keeps the plain symlink elsewhere (XSPEC-469 R4)', () => {
  const dirTarget = join(REAL_REPO, 'core');
  const fileTarget = join(REAL_REPO, 'package.json');
  expect(existsSync(dirTarget) && existsSync(fileTarget), 'control: the repo has a core/ directory and a package.json').toBe(true);
  const calls = [];
  const symlink = (...a) => calls.push(a);
  const out = mkdtempSync(join(tmpdir(), 'uds-test-link-'));
  try {
    linkRepoEntry(join(out, 'core'), dirTarget, { platform: 'win32', symlink });
    expect(calls, 'a directory on Windows').toEqual([[dirTarget, join(out, 'core'), 'junction']]);

    calls.length = 0;
    linkRepoEntry(join(out, 'package.json'), fileTarget, { platform: 'win32', symlink });
    expect(calls, 'a file on Windows is not symlinked').toEqual([]);
    expect(readFileSync(join(out, 'package.json'), 'utf-8'), 'it is copied').toBe(readFileSync(fileTarget, 'utf-8'));

    linkRepoEntry(join(out, 'core2'), dirTarget, { platform: 'linux', symlink });
    linkRepoEntry(join(out, 'pkg2'), fileTarget, { platform: 'darwin', symlink });
    expect(calls, 'POSIX keeps the plain symlink').toEqual([[dirTarget, join(out, 'core2')], [fileTarget, join(out, 'pkg2')]]);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
