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
 *   cli/tests/utils/cli-runner.js     if (unusedRules.length > 0 && !timedOut && !allowUnused) {
 *
 * XSPEC-516 R1: the helper answers by what each prompt asks, so changing the ORDER of the questions changes nothing
 * (checked on a fixture program that asks the same two questions both ways round), and a rule whose question never
 * appears fails the test instead of leaving the default answer in place. The real `uds init` is answered the same way
 * in tests/e2e/init-flow.test.js ("multiple AI tools", "cancelling installation").
 */

import { it, expect, afterAll } from 'vitest';
import { win32, join } from 'path';
import { mkdtempSync, symlinkSync, existsSync, rmSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
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
  // PATH holds `tar`, `gzip`, `sh` and `node` but no `npm`: a bare `spawn("npm")` now fails the way it fails on Windows (ENOENT).
  const bin = mkdtempSync(join(tmpdir(), 'uds-test-path-'));
  const savedPath = process.env.PATH;
  try {
    // Every program the pack/extract path starts, found where this system keeps it. GNU tar (Ubuntu) starts
    // `gzip` itself to read a .tgz; macOS's bsdtar has gzip built in, which is why this first passed only on macOS.
    for (const name of ['tar', 'gzip', 'sh']) {
      const found = ['/usr/bin', '/bin'].map((d) => join(d, name)).find((p) => existsSync(p));
      expect(found, `control: ${name} exists on this system`).toBeTruthy();
      symlinkSync(found, join(bin, name));
    }
    symlinkSync(process.execPath, join(bin, 'node')); // `node scripts/prepack.mjs`, started by npm through sh
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

// ── XSPEC-516 R1: answered by the prompt's text, whatever order the questions come in ───────────────────────

const ORDER_CLI = fileURLToPath(new URL('../fixtures/prompt-order-cli.mjs', import.meta.url));
// A is answered "no" (its default is yes) and B "yes" (its default is no): a key that reaches the wrong question,
// or none at all, shows in answers.json.
const RULES_BY_TEXT = [
  { when: /Install the extras/, keys: 'n\r' },
  { when: /Delete everything/, keys: 'y\r' }
];

for (const order of ['A,B', 'B,A']) {
  it(`the same answers reach the same questions when they are asked in the order ${order} (XSPEC-516 R1)`, async () => {
    const dir = await createTempDir();
    try {
      const r = await runPrompted(RULES_BY_TEXT, dir, { entry: ORDER_CLI, command: ['ask'], args: [order], timeout: 20000, idleMs: 150 });
      expect(r.timedOut, `answered: ${JSON.stringify(r.answers)}`).toBe(false);
      expect(r.exitCode).toBe(0);
      // Read back what the program recorded: each question got ITS answer, not the next one in line.
      expect(JSON.parse(readFileSync(join(dir, 'answers.json'), 'utf-8'))).toEqual({ A: false, B: true });
      expect(r.answers.map((a) => a.prompt)).toEqual(order.split(',').map((k) => (k === 'A' ? '? Install the extras? (Y/n)' : '? Delete everything? (y/N)')));
      expect(r.unusedRules).toEqual([]);
    } finally {
      await cleanupTempDir(dir);
    }
  });
}

it('a question nobody has a rule for takes the default, and a rule whose question never appears fails the run (XSPEC-516 R1)', async () => {
  const dir = await createTempDir();
  try {
    // Only B has a rule: A is asked, matches nothing, and takes its default (yes). Nothing is sent to A that was meant for B.
    const r = await runPrompted([RULES_BY_TEXT[1]], dir, { entry: ORDER_CLI, command: ['ask'], args: ['A,B'], timeout: 20000, idleMs: 150 });
    expect(JSON.parse(readFileSync(join(dir, 'answers.json'), 'utf-8'))).toEqual({ A: true, B: true });
    expect(r.answers.map((a) => a.rule)).toEqual([-1, 0]);

    // A rule for a question the program never asks: the run rejects, naming the rule, instead of passing on defaults.
    await expect(runPrompted([{ when: /Never asked/, keys: 'y\r' }], dir, { entry: ORDER_CLI, command: ['ask'], args: ['A,B'], timeout: 20000, idleMs: 150 }))
      .rejects.toThrow(/no prompt matched rule\(s\) #0 \/Never asked\//);
    // ... unless the caller says the prompt is optional.
    const optional = await runPrompted([{ when: /Never asked/, keys: 'y\r' }], dir, { entry: ORDER_CLI, command: ['ask'], args: ['A,B'], timeout: 20000, idleMs: 150, allowUnused: true });
    expect(optional.unusedRules).toEqual([0]);
  } finally {
    await cleanupTempDir(dir);
  }
});
