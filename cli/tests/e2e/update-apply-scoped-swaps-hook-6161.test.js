/**
 * E2E: `uds update --apply --skills` (and `--commands`) swaps the pre-commit hook an older UDS wrote (dev-platform #310 item 1,
 * decision 667甲).
 *
 * The hook UDS 5.x .. 6.13.1 wrote, `uds check 2>/dev/null || true`, hides every failure and lets every commit through. The swap
 * ran only for forms with no scope flag, so `uds update --apply --yes --skills` (the very command `--plan --skills` tells the
 * user to run) replaced the skills and left the hook that waves every commit through, while `--plan --skills` listed nothing
 * about it. Now a MODE (`--apply`, `--force`, `--plan`) is never narrowed by a scope flag; a scope flag alone (`--skills`) still is.
 *
 * Real `git commit` through the real hook, in a throwaway repository, with the hook text the published 6.11.0 package wrote
 * (tests/fixtures/older-uds-hooks/). POSIX only: the hook is a shell script.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/update.js   `|| !!options.apply || !!options.force || !!options.plan; // wire:apply-scoped-migrates-hook`
 *   (without it a scope flag narrows the swap away again: `--apply --skills` leaves the old hook, `--plan --skills` lists nothing)
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync, chmodSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { out, gitEnv, runProgram, commitCount, installCliShim } from '../utils/xspec-482.js';

const h = createHarness('hook6161');
afterAll(() => h.cleanup());
const posix = process.platform !== 'win32';

const OLD_HOOK = readFileSync(resolve(import.meta.dirname, '../fixtures/older-uds-hooks/native-6.11.0.pre-commit'), 'utf-8');
const NATIVE = '.git/hooks/pre-commit';
const STANDARD = '.standards/testing.ai.yaml';

let envCache = null;
const env = () => (envCache ??= gitEnv(h.makeDir('git-home')));
const git = (args, cwd) => runProgram('git', args, cwd, env());
const hook = (dir) => readFileSync(join(dir, NATIVE), 'utf-8');

/** A git project set up by the current `uds init` whose pre-commit hook is replaced by the one UDS 6.11.0 wrote. */
async function projectWithOldHook() {
  const dir = h.makeDir('gitproj');
  expect(git(['init', '-q', '-b', 'main'], dir).code).toBe(0);
  git(['config', '--local', 'commit.gpgsign', 'false'], dir);
  mkdirSync(join(dir, '.claude'), { recursive: true });
  const init = await h.runCli(['init', '--yes', '--skills-location', 'project'], dir, { env: { VITEST: '' } });
  expect(init.code, out(init)).toBe(0);
  installCliShim(dir, h.cliPath());
  git(['add', '-A', '--', '.'], dir);
  expect(git(['commit', '-q', '-m', 'baseline'], dir).code).toBe(0);
  writeFileSync(join(dir, NATIVE), OLD_HOOK);
  chmodSync(join(dir, NATIVE), 0o755);
  return dir;
}

/** Edit an installed standard and try to commit it: the old hook lets it through, the current one refuses. */
function tamperAndCommit(dir) {
  writeFileSync(join(dir, STANDARD), `${readFileSync(join(dir, STANDARD), 'utf-8')}\n# edited by hand\n`);
  git(['add', '-A', '--', STANDARD], dir);
  return git(['commit', '-q', '-m', 'edit a standard'], dir);
}

it('`update --plan --skills` lists the old pre-commit hook swap and writes nothing, and the command it ends with is the one that does it (#310)', async (ctx) => {
  if (!posix) ctx.skip();
  const dir = await projectWithOldHook();
  const plan = await h.runCli(['update', '--plan', '--skills', '--offline'], dir);
  expect(plan.code, out(plan)).toBe(0);
  expect(out(plan)).toContain('.git/hooks/pre-commit: would replace the hook an older UDS wrote');
  expect(out(plan)).toContain('Run `uds update --apply --yes --skills` to apply.');
  expect(hook(dir), 'plan wrote nothing').toBe(OLD_HOOK);
}, 240000);

it('`update --apply --yes --skills` swaps the old hook that lets every commit through, and the same edit is then refused (#310)', async (ctx) => {
  if (!posix) ctx.skip();
  const dir = await projectWithOldHook();
  const before = commitCount(dir, env());
  // the old hook, as a user lives with it: the edit is committed
  const through = tamperAndCommit(dir);
  expect(through.code, through.all).toBe(0);
  git(['reset', '-q', '--hard', 'HEAD~1'], dir);

  const apply = await h.runCli(['update', '--apply', '--yes', '--skills', '--offline'], dir);
  expect(apply.code, out(apply)).toBe(0);
  expect(out(apply)).toContain('.git/hooks/pre-commit: replaced the hook an older UDS wrote');
  expect(hook(dir)).not.toContain('2>/dev/null || true');
  expect(hook(dir)).toContain('universal-dev-standards check --ci');
  expect(statSync(join(dir, NATIVE)).mode & 0o111, 'still executable').not.toBe(0);

  const after = commitCount(dir, env());
  const blocked = tamperAndCommit(dir);
  expect(blocked.code, blocked.all).not.toBe(0);
  expect(commitCount(dir, env()), 'git recorded nothing').toBe(after);
  expect(after).toBe(before);
}, 300000);

it('`update --apply --yes --commands` swaps it too (#310)', async (ctx) => {
  if (!posix) ctx.skip();
  const dir = await projectWithOldHook();
  const apply = await h.runCli(['update', '--apply', '--yes', '--commands', '--offline'], dir);
  expect(apply.code, out(apply)).toBe(0);
  expect(hook(dir)).toContain('universal-dev-standards check --ci');
  expect(hook(dir)).not.toContain('2>/dev/null || true');
}, 240000);

it('a scope flag alone (`update --skills --yes`, no mode) still leaves the hook: narrowed runs stay narrowed (#310)', async (ctx) => {
  if (!posix) ctx.skip();
  const dir = await projectWithOldHook();
  const run = await h.runCli(['update', '--skills', '--yes', '--offline'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(hook(dir)).toBe(OLD_HOOK);
}, 240000);
