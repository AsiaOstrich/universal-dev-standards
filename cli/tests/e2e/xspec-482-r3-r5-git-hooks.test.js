/**
 * E2E: the pre-commit hook UDS writes stops a commit that changes an installed standard, and `uds update` brings
 * the hooks that older UDS releases wrote (which let every commit through) to it (dev-platform XSPEC-482 R3 and R5,
 * beta.12 findings: macOS N3, Linux N2).
 *
 *   R3  the native hook ran `universal-dev-standards check` without `--ci`; with a standard file edited that prints
 *       "issues" and exits 0, so `git commit` went through. The hook now runs `check --ci` and says why it stopped.
 *   R5  a project set up by 6.11.0 (or any release up to 6.13.1) has `uds check 2>/dev/null || true` in
 *       `.git/hooks/pre-commit`; a project set up by a beta has the block without `--ci`. `uds update --plan` named
 *       neither and `--apply` did not touch them. Now the plan lists the swap, `--apply` does it when the file is
 *       exactly what UDS wrote, and a file someone edited is left alone and named.
 *
 * Real `git commit` through the real hook, in throwaway repositories. The older hooks are the files the published
 * packages wrote (tests/fixtures/older-uds-hooks/, with their provenance); one test also installs the real
 * `universal-dev-standards@6.11.0` from npm and lets it set the project up. POSIX only: the hook is a shell script.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/init.js         const hookContent = buildNativePreCommitHook(); // wire:init-native-hook-check-ci
 *   cli/src/commands/update.js       const native = migrateOlderNativeHook(projectPath, { plan }); // wire:update-migrates-native-hook
 *   cli/src/commands/update.js       if (huskyCi.state === 'migrated') console.log(...); // wire:update-migrates-husky-ci
 *   cli/src/utils/git-hooks.js       `${UDS_BIN_NAME} check${ci ? ' --ci' : ''}` (the command the block runs)
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync, existsSync, chmodSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { out, gitEnv, runProgram, commitCount, installCliShim, installPublishedUds, cleanPublished } from '../utils/xspec-482.js';

const h = createHarness('xspec482-r3-r5');
afterAll(() => { h.cleanup(); cleanPublished(); });
const posix = process.platform !== 'win32';

const FIXTURES = resolve(import.meta.dirname, '../fixtures/older-uds-hooks');
const fixture = (name) => readFileSync(join(FIXTURES, name), 'utf-8');
const NATIVE = '.git/hooks/pre-commit';
const HUSKY = '.husky/pre-commit';
const STANDARD = '.standards/testing.ai.yaml';

let envCache = null;
function env() {
  if (!envCache) {
    const home = h.makeDir('git-home');
    envCache = gitEnv(home);
  }
  return envCache;
}
const git = (args, cwd) => runProgram('git', args, cwd, env());

/**
 * A throwaway git project set up by the CURRENT `uds init` (no package.json -> the native hook; `node: true` -> the
 * husky one), with a shim so the hook's `universal-dev-standards` is the staged CLI, and a first commit made through
 * the hook.
 */
async function gitProject({ node = false, baseline = true } = {}) {
  const dir = h.makeDir('gitproj');
  expect(git(['init', '-q', '-b', 'main'], dir).code).toBe(0);
  git(['config', '--local', 'commit.gpgsign', 'false'], dir);
  if (node) writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'adopter', version: '1.0.0' }));
  mkdirSync(join(dir, '.claude'), { recursive: true });
  const init = await h.runCli(['init', '--yes', '--skills-location', 'project'], dir, { env: { VITEST: '' } });
  expect(init.code, out(init)).toBe(0);
  installCliShim(dir, h.cliPath());
  if (baseline) {
    git(['add', '-A', '--', '.'], dir);
    const c = git(['commit', '-q', '-m', 'baseline'], dir);
    expect(c.code, c.all).toBe(0);
  }
  return dir;
}

/** Append a line to an installed standard (what "someone edited a standard file" is) and try to commit it. */
function tamperAndCommit(dir) {
  writeFileSync(join(dir, STANDARD), `${readFileSync(join(dir, STANDARD), 'utf-8')}\n# edited by hand\n`);
  git(['add', '-A', '--', STANDARD], dir);
  return git(['commit', '-q', '-m', 'edit a standard'], dir);
}

const putHook = (dir, rel, text) => {
  writeFileSync(join(dir, rel), text);
  chmodSync(join(dir, rel), 0o755);
};
const readHook = (dir, rel) => readFileSync(join(dir, rel), 'utf-8');
const APPLY = ['update', '--apply', '--yes', '--offline'];

// ── R3 ──────────────────────────────────────────────────────────────────────

it('the native pre-commit hook `uds init` writes stops a commit that edits an installed standard, says why, and git records nothing (XSPEC-482 R3)', async (ctx) => {
  if (!posix) ctx.skip(); // the hook is a shell script
  const dir = await gitProject();
  expect(existsSync(join(dir, NATIVE)), 'fixture: the native hook is the one in use').toBe(true);
  const before = commitCount(dir, env());

  const blocked = tamperAndCommit(dir);
  expect(blocked.code, blocked.all).not.toBe(0);
  expect(blocked.all, 'the check names the file').toContain(STANDARD);
  expect(blocked.all, 'and the hook says the commit was stopped').toContain('This commit is blocked: the UDS check found the issues listed above');
  expect(commitCount(dir, env()), 'git recorded nothing').toBe(before);

  // Put the standard back (the very command the hook names): the same commit goes through.
  const restore = runProgram(process.execPath, [h.cliPath(), 'check', '--restore', '--offline'], dir, env());
  expect(restore.code, restore.all).toBe(0);
  git(['add', '-A', '--', '.'], dir);
  const ok = git(['commit', '-q', '-m', 'nothing edited'], dir);
  expect(ok.code, ok.all).toBe(0);
}, 240000);

it('a plain `check` exits 0 on the same edited standard while `check --ci` exits 1 (control: why the hook must pass --ci)', async (ctx) => {
  if (!posix) ctx.skip();
  const dir = await gitProject();
  writeFileSync(join(dir, STANDARD), `${readFileSync(join(dir, STANDARD), 'utf-8')}\n# edited by hand\n`);
  const plain = runProgram(process.execPath, [h.cliPath(), 'check', '--offline'], dir, env());
  expect(plain.all).toContain(STANDARD);
  expect(plain.code, 'plain check reports and exits 0').toBe(0);
  const ci = runProgram(process.execPath, [h.cliPath(), 'check', '--ci', '--offline'], dir, env());
  expect(ci.code, ci.all).toBe(1);
}, 240000);

it('the husky pre-commit hook `uds init` writes in a Node project stops a commit that edits an installed standard too (XSPEC-482 R3)', async (ctx) => {
  if (!posix) ctx.skip();
  const dir = await gitProject({ node: true });
  expect(existsSync(join(dir, HUSKY)), 'fixture: the husky hook is the one in use').toBe(true);
  const before = commitCount(dir, env());
  const blocked = tamperAndCommit(dir);
  expect(blocked.code, blocked.all).not.toBe(0);
  expect(blocked.all).toContain(STANDARD);
  expect(blocked.all).toContain('This commit is blocked');
  expect(commitCount(dir, env())).toBe(before);
}, 240000);

// ── R5: the hooks older releases wrote ───────────────────────────────────────

/** What the current `uds init` writes as the native hook, taken from a second throwaway repository (not recomputed from the CLI's own function). */
async function freshNativeHook() {
  const dir = await gitProject({ baseline: false });
  return readHook(dir, NATIVE);
}

it('a project set up by UDS 6.11.0 lets an edited standard through; `update --plan` lists the hook swap and writes nothing; `update --apply` swaps it and the same edit is then refused (XSPEC-482 R5)', async (ctx) => {
  if (!posix) ctx.skip();
  const expected = await freshNativeHook();
  const dir = await gitProject();
  putHook(dir, NATIVE, fixture('native-6.11.0.pre-commit'));
  const before = commitCount(dir, env());

  // The old hook, as a user lives with it: the edit is committed.
  const through = tamperAndCommit(dir);
  expect(through.code, through.all).toBe(0);
  expect(commitCount(dir, env())).toBe(before + 1);
  git(['reset', '-q', '--hard', 'HEAD~1'], dir);

  // Plan: names the swap, writes nothing.
  const plan = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(plan.code, out(plan)).toBe(0);
  expect(out(plan)).toContain('.git/hooks/pre-commit: would replace the hook an older UDS wrote');
  expect(out(plan)).toContain('uds check 2>/dev/null || true');
  expect(readHook(dir, NATIVE), 'plan wrote nothing').toBe(fixture('native-6.11.0.pre-commit'));
  // Same through the hooks-only plan.
  const planHooks = await h.runCli(['update', '--plan', '--with-hooks', '--offline'], dir);
  expect(out(planHooks)).toContain('.git/hooks/pre-commit: would replace the hook an older UDS wrote');
  expect(readHook(dir, NATIVE)).toBe(fixture('native-6.11.0.pre-commit'));

  // Apply: the file is now what the current init writes, still executable, and records its authorship.
  const apply = await h.runCli(APPLY, dir);
  expect(apply.code, out(apply)).toBe(0);
  expect(out(apply)).toContain('.git/hooks/pre-commit: replaced the hook an older UDS wrote');
  expect(readHook(dir, NATIVE)).toBe(expected);
  expect(readHook(dir, NATIVE)).toContain('universal-dev-standards check --ci');
  expect(statSync(join(dir, NATIVE)).mode & 0o111, 'still executable').not.toBe(0);

  // And the same edit that went through is now refused.
  const after = commitCount(dir, env());
  const blocked = tamperAndCommit(dir);
  expect(blocked.code, blocked.all).not.toBe(0);
  expect(commitCount(dir, env())).toBe(after);
}, 300000);

it('the hook of a 6.14.0 beta (native file and husky block, `check` without --ci) is swapped by `update --apply`, and the lines around the husky block stay (XSPEC-482 R5)', async (ctx) => {
  if (!posix) ctx.skip();
  const expectedNative = await freshNativeHook();
  const native = await gitProject();
  putHook(native, NATIVE, fixture('native-6.14.0-beta.12.pre-commit'));
  const plan = await h.runCli(['update', '--plan', '--offline'], native);
  expect(out(plan)).toContain('would replace the hook an older UDS wrote (UDS 6.14.0 betas');
  expect((await h.runCli(APPLY, native)).code).toBe(0);
  expect(readHook(native, NATIVE)).toBe(expectedNative);

  // Husky: the adopter's own line before the block stays; only the block changes.
  const node = await gitProject({ node: true });
  const current = readHook(node, HUSKY);
  const old = fixture('husky-6.14.0-beta.12.pre-commit');
  putHook(node, HUSKY, `${old.replace('# UDS Standard Check', 'echo "mine first"\n# UDS Standard Check')}`);
  const planH = await h.runCli(['update', '--plan', '--offline'], node);
  expect(out(planH)).toContain('.husky/pre-commit: would change the UDS block to run `check --ci`');
  const applyH = await h.runCli(APPLY, node);
  expect(applyH.code, out(applyH)).toBe(0);
  expect(out(applyH)).toContain('.husky/pre-commit: the UDS block now runs `check --ci`');
  const after = readHook(node, HUSKY);
  expect(after).toContain('echo "mine first"');
  expect(after).toContain('universal-dev-standards check --ci');
  expect(after).not.toMatch(/universal-dev-standards check\n/);
  expect(after.replace('echo "mine first"\n', ''), 'apart from the adopter\'s line, exactly what a fresh init writes').toBe(current);
}, 300000);

it('a hook that is not exactly what UDS wrote keeps its always-pass line: `update --apply` leaves the file byte for byte and names the line and what to write (XSPEC-482 R5)', async (ctx) => {
  if (!posix) ctx.skip();
  const dir = await gitProject();
  const edited = `${fixture('native-6.11.0.pre-commit').replace('echo "Pre-commit checks passed"', 'echo "my own step"\necho "Pre-commit checks passed"')}`;
  putHook(dir, NATIVE, edited);
  const line = edited.split('\n').findIndex((l) => l.includes('uds check 2>/dev/null || true')) + 1;

  const apply = await h.runCli(APPLY, dir);
  expect(apply.code, out(apply)).toBe(0);
  expect(readHook(dir, NATIVE), 'not overwritten').toBe(edited);
  expect(out(apply)).toContain(`.git/hooks/pre-commit line ${line} ("uds check 2>/dev/null || true") runs the UDS check and lets the commit through whatever it finds`);
  expect(out(apply)).toContain('universal-dev-standards check --ci');
}, 240000);

it('a hook UDS wrote just now is not mentioned by `update --plan` (control: the plan lists a swap only when there is one)', async (ctx) => {
  if (!posix) ctx.skip();
  const dir = await gitProject();
  const plan = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(plan.code, out(plan)).toBe(0);
  expect(out(plan)).not.toContain('.git/hooks/pre-commit');
  expect(out(plan)).not.toContain('.husky/pre-commit');
}, 240000);

// ── R5: set up by the real published 6.11.0 ──────────────────────────────────

it('a project the real universal-dev-standards@6.11.0 from npm set up: update --apply replaces its always-pass hook, and the swapped hook refuses an edited standard (XSPEC-482 R5)', async (ctx) => {
  if (!posix) ctx.skip();
  // The old CLI is installed into a throwaway folder; the network is needed for this one test only.
  const old = installPublishedUds('6.11.0', h.makeDir('npm-home'));
  if (!old.bin) ctx.skip(old.why);

  const dir = h.makeDir('real-6-11');
  git(['init', '-q', '-b', 'main'], dir);
  mkdirSync(join(dir, '.claude'), { recursive: true });
  const init = runProgram(process.execPath, [old.bin, 'init', '--yes', '--skills-location', 'project'], dir, old.env);
  expect(init.code, init.all).toBe(0);
  expect(readHook(dir, NATIVE), 'fixture: 6.11.0 wrote the always-pass hook').toBe(fixture('native-6.11.0.pre-commit'));
  installCliShim(dir, h.cliPath());

  const apply = await h.runCli(APPLY, dir);
  expect(apply.code, out(apply)).toBe(0);
  expect(readHook(dir, NATIVE)).toBe(await freshNativeHook());

  git(['add', '-A', '--', '.'], dir);
  expect(git(['commit', '-q', '-m', 'baseline'], dir).code).toBe(0);
  const before = commitCount(dir, env());
  const blocked = tamperAndCommit(dir);
  expect(blocked.code, blocked.all).not.toBe(0);
  expect(commitCount(dir, env())).toBe(before);
}, 600000);
