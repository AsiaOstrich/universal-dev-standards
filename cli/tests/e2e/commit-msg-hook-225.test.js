/**
 * E2E: `uds init` installs git's own commit-msg hook by default, so a malformed commit message is refused for every
 * AI tool (or none), not only for Claude Code behind `--with-hooks` (dev-platform decision 659甲, board #225; this is
 * what XSPEC-357 R8 AC-8.4 asked for, "a violation of an installed standard is detected").
 *
 * Every case runs the real `uds init` (or `update`, `check`, `uninstall`) in a throwaway git repository, then does what
 * the adopter does: `git commit -m ...`. What is read back is git's own answer (exit code, and whether a commit was made),
 * not the CLI's output. Each case that proves a refusal also has its control: the same project, a well-formed message, is
 * committed, so a hook that refuses everything for any reason would not pass.
 *
 * POSIX only: the hook is a `sh` script and the stand-in for an installed CLI (installCliShim) is one too. The same text is
 * checked for POSIX-only syntax (no bash-isms: Git for Windows runs hooks with its own `sh`) in
 * tests/unit/utils/commit-msg-hook.test.js, which runs everywhere.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/init.js        const result = ensureCommitMsgHook(...); // wire:init-installs-commit-msg-hook
 *   cli/src/commands/update.js      installIfMissing: wantOn ... // wire:update-commit-msg-hook  (update installs only with --git-hooks)
 *   cli/src/utils/commit-msg-hook.js  'not-installed': [chalk.cyan, 'commitMsgHookNotInstalledHint']  (update's hint line)
 *   cli/src/commands/check.js       const verdict = await runCommitMsgCheck(...); // wire:check-commit-msg-entry
 *   cli/src/uninstallers/hook-uninstaller.js   proof.state === 'proven' || ...  // wire:uninstall-removes-commit-msg-hook
 *   cli/src/utils/commit-msg-hook.js  if (!isUdsCommitMsgHook(existing)) return { state: 'yielded-existing' ... }  (the step-aside)
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync, appendFileSync, existsSync, chmodSync, statSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { out, gitEnv, runProgram, commitCount, installCliShim } from '../utils/xspec-482.js';

const h = createHarness('commit-msg-225');
afterAll(() => h.cleanup());
const posix = process.platform !== 'win32';
const WHY_SKIP = 'the commit-msg hook and the CLI stand-in are sh scripts; their syntax is checked on every platform in tests/unit/utils/commit-msg-hook.test.js';

const BAD = 'fixed stuff';
const GOOD = 'feat(auth): add token refresh. 新增 token 更新。';
const HOOK = '.git/hooks/commit-msg';

let envCache = null;
function env() {
  if (!envCache) envCache = gitEnv(h.makeDir('git-home'));
  return envCache;
}
const git = (args, cwd) => runProgram('git', args, cwd, env());
const read = (dir, rel) => readFileSync(join(dir, rel), 'utf-8');
const manifestOf = (dir) => JSON.parse(read(dir, '.standards/manifest.json'));

/**
 * A throwaway git project. `before(dir)` runs before `uds init` (an adopter's own hook, a core.hooksPath ...),
 * `node: true` adds a package.json (init then wires husky), `initArgs` are extra `init` arguments. The CLI is made
 * resolvable the way `npm i -D` leaves it. Nothing is committed: each test makes its own first commit.
 */
async function project({ node = false, before = null, initArgs = [] } = {}) {
  const dir = h.makeDir('proj');
  expect(git(['init', '-q', '-b', 'main'], dir).code).toBe(0);
  git(['config', '--local', 'commit.gpgsign', 'false'], dir);
  if (node) writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'adopter', version: '1.0.0' }));
  mkdirSync(join(dir, '.claude'), { recursive: true });
  if (before) before(dir);
  const init = await h.runCli(['init', '--yes', '--skills-location', 'project', ...initArgs], dir, { env: { VITEST: '' } });
  expect(init.code, out(init)).toBe(0);
  installCliShim(dir, h.cliPath());
  return { dir, init: out(init) };
}

let changes = 0;
/**
 * Commit everything with `message`; `{code, all}`. Every call changes a file first, so a refusal is the hook's and never
 * git's own "nothing to commit" (a test that reads "not zero" must know WHY it is not zero).
 */
function commit(dir, message, extra = []) {
  writeFileSync(join(dir, `change-${++changes}.txt`), `${changes}\n`);
  git(['add', '-A', '--', '.'], dir);
  return git(['commit', '-q', '-m', message, ...extra], dir);
}

/** A hook of the adopter's own: writes a line to a file when it runs and lets the commit through. */
const OWN_HOOK = '#!/bin/sh\necho "own commit-msg hook ran" > .own-hook-ran\nexit 0\n';
const putExec = (dir, rel, text) => {
  mkdirSync(join(dir, rel, '..'), { recursive: true });
  writeFileSync(join(dir, rel), text);
  chmodSync(join(dir, rel), 0o755);
};

// ── the default: installed, and it stops a bad message ────────────────────────────────────────────

it('`uds init` installs the commit-msg hook: git refuses a malformed message and records nothing, and commits a well-formed one (#225)', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir, init } = await project();
  expect(init, 'init says it installed the hook').toContain('Installed the git commit-msg hook');
  expect(existsSync(join(dir, HOOK)), 'fixture: the hook file is where git looks').toBe(true);
  expect(statSync(join(dir, HOOK)).mode & 0o111, 'and it is executable').not.toBe(0);
  const before = commitCount(dir, env());

  const refused = commit(dir, BAD);
  expect(refused.code, refused.all).not.toBe(0);
  expect(refused.all, 'the author is told what the format is').toContain('Expected: <type>(<scope>): <subject>');
  expect(commitCount(dir, env()), 'git recorded nothing').toBe(before);

  const accepted = commit(dir, GOOD);
  expect(accepted.code, accepted.all).toBe(0);
  expect(commitCount(dir, env())).toBe(before + 1);
  expect(git(['log', '-1', '--format=%s'], dir).out.trim()).toBe(GOOD);
}, 240000);

it('in a Node project, where init points core.hooksPath at .husky, the hook goes to .husky/commit-msg and stops a bad message there too', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir } = await project({ node: true });
  expect(git(['config', '--local', '--get', 'core.hooksPath'], dir).out.trim(), 'fixture: git looks in .husky').toBe('.husky');
  expect(existsSync(join(dir, '.husky/commit-msg')), 'the hook is in the directory git looks in').toBe(true);
  expect(existsSync(join(dir, HOOK)), 'and not in the directory git no longer reads').toBe(false);
  const before = commitCount(dir, env());

  const refused = commit(dir, BAD);
  expect(refused.code, refused.all).not.toBe(0);
  expect(refused.all).toContain('Invalid commit message format');
  expect(commitCount(dir, env())).toBe(before);

  const accepted = commit(dir, GOOD);
  expect(accepted.code, accepted.all).toBe(0);
}, 240000);

it('the hook judges the message with the rules of the installed option files: a type the project lists is accepted, one it does not is refused', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir } = await project();
  const before = commitCount(dir, env());

  const security = commit(dir, 'security(auth): rotate keys. 輪替金鑰。'); // `security` comes from the installed option file, not from the Conventional Commits list
  expect(security.code, security.all).toBe(0);
  const unknown = commit(dir, 'wibble(auth): rotate keys');
  expect(unknown.code, unknown.all).not.toBe(0);
  expect(unknown.all).toMatch(/Valid types: .*security/);
  expect(commitCount(dir, env())).toBe(before + 1);
}, 240000);

it('commits git writes itself (a merge, a revert, a fixup) are not refused', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir } = await project();
  expect(commit(dir, GOOD).code).toBe(0);
  git(['checkout', '-q', '-b', 'side'], dir);
  writeFileSync(join(dir, 'side.txt'), 'side\n');
  expect(commit(dir, 'feat(side): add a file. 新增檔案。').code).toBe(0);
  git(['checkout', '-q', 'main'], dir);
  writeFileSync(join(dir, 'main.txt'), 'main\n');
  expect(commit(dir, 'feat(main): add a file. 新增檔案。').code).toBe(0);

  const merge = git(['merge', '--no-ff', '--no-edit', 'side'], dir);
  expect(merge.code, `git writes "Merge branch ..."; refusing it would break every merge\n${merge.all}`).toBe(0);
  const revert = git(['revert', '--no-edit', 'HEAD~1'], dir);
  expect(revert.code, `git writes 'Revert "..."'\n${revert.all}`).toBe(0);
  writeFileSync(join(dir, 'fix.txt'), 'fix\n');
  git(['add', '-A', '--', '.'], dir);
  const fixup = git(['commit', '-q', '--fixup', 'HEAD~1'], dir);
  expect(fixup.code, `git writes "fixup! ..."\n${fixup.all}`).toBe(0);
  expect(commit(dir, BAD).code, 'control: the hook is live in this same repository, a message of the author\'s own is still refused').not.toBe(0);
}, 240000);

// ── stepping aside ────────────────────────────────────────────────────────────────────────────────

it('an existing commit-msg hook of the adopter is not touched: init says how to wire the UDS check by hand, and their hook is the one that runs', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir, init } = await project({ before: (d) => putExec(d, HOOK, OWN_HOOK) });
  expect(read(dir, HOOK), 'byte for byte what they wrote').toBe(OWN_HOOK);
  expect(init).toContain('git commit-msg check NOT installed');
  expect(init, 'one line saying how to wire it by hand').toContain('universal-dev-standards check --commit-msg');

  const made = commit(dir, BAD); // their hook lets everything through: the message is not UDS's to judge here
  expect(made.code, made.all).toBe(0);
  expect(existsSync(join(dir, '.own-hook-ran')), 'their hook ran').toBe(true);
  expect(manifestOf(dir).installedArtifacts?.files?.[HOOK], 'and no install record claims the file for UDS').toBeUndefined();
}, 240000);

it('a core.hooksPath that is not UDS\'s is left alone: nothing is written to .git/hooks or to their hook directory, and the setting stays as it was', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir, init } = await project({
    before: (d) => {
      putExec(d, '.githooks/pre-commit', OWN_HOOK); // their directory has no commit-msg: what is not written there is the point
      git(['config', '--local', 'core.hooksPath', '.githooks'], d);
    }
  });
  expect(existsSync(join(dir, HOOK)), 'nothing in the directory git does not read').toBe(false);
  expect(existsSync(join(dir, '.githooks/commit-msg')), 'nothing added to the directory they manage').toBe(false);
  expect(read(dir, '.githooks/pre-commit')).toBe(OWN_HOOK);
  expect(git(['config', '--local', '--get', 'core.hooksPath'], dir).out.trim()).toBe('.githooks');
  expect(init).toContain('core.hooksPath is set to ".githooks"');
  expect(init).toContain('universal-dev-standards check --commit-msg');
}, 240000);

it('a UDS hook someone edited is kept by `uds update`, which says so; an untouched one is brought up to date', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir } = await project();
  const original = read(dir, HOOK);
  writeFileSync(join(dir, HOOK), `${original}echo "my own addition" >&2\n`);

  const edited = await h.runCli(['update', '--apply', '--yes', '--offline'], dir, { env: { VITEST: '' } });
  expect(edited.code, out(edited)).toBe(0);
  expect(read(dir, HOOK), 'the edited file is theirs now').toBe(`${original}echo "my own addition" >&2\n`);
  expect(out(edited)).toContain('was edited since UDS wrote it');

  // An older UDS hook text that nobody touched: same marker, other text, and the install record still matches it.
  const old = original.replace('# Skip it once: `git commit --no-verify`.', '# an older wording');
  writeFileSync(join(dir, HOOK), old);
  const manifest = manifestOf(dir);
  const { createHash } = await import('crypto');
  manifest.installedArtifacts.files[HOOK].hash = `sha256:${createHash('sha256').update(old).digest('hex')}`;
  manifest.installedArtifacts.files[HOOK].size = Buffer.byteLength(old);
  writeFileSync(join(dir, '.standards/manifest.json'), JSON.stringify(manifest, null, 2));
  const updated = await h.runCli(['update', '--apply', '--yes', '--offline'], dir, { env: { VITEST: '' } });
  expect(updated.code, out(updated)).toBe(0);
  expect(read(dir, HOOK), 'the untouched older text is replaced by the current one').toBe(original);
}, 300000);

// ── turning it off, and update ────────────────────────────────────────────────────────────────────

it('`uds init --no-git-hooks` installs no commit-msg hook and records the choice; `uds update` does not install it afterwards', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir } = await project({ initArgs: ['--no-git-hooks'] });
  expect(existsSync(join(dir, HOOK)), 'no hook was written').toBe(false);
  expect(manifestOf(dir).gitHooks, 'the choice is in the manifest, where every clone and every later update reads it').toEqual({ commitMsg: 'off' });
  expect(commit(dir, BAD).code, 'so a malformed message is committed').toBe(0);

  const update = await h.runCli(['update', '--apply', '--yes', '--offline'], dir, { env: { VITEST: '' } });
  expect(update.code, out(update)).toBe(0);
  expect(existsSync(join(dir, HOOK)), 'update did not put back what the project turned off').toBe(false);
  expect(manifestOf(dir).gitHooks, 'and the choice is still recorded').toEqual({ commitMsg: 'off' });
  expect(out(update), 'a project that opted out is not asked again').not.toContain(HINT);

  // The run above had nothing to change, so the manifest may not have been written at all. These two make update
  // rewrite it (a standard edited by hand is put back; --force rewrites everything) and the choice must come through both.
  const standard = join(dir, '.standards/testing.ai.yaml');
  appendFileSync(standard, '\n# edited by hand\n');
  const restored = await h.runCli(['update', '--apply', '--yes', '--offline'], dir, { env: { VITEST: '' } });
  expect(restored.code, out(restored)).toBe(0);
  expect(readFileSync(standard, 'utf-8'), 'fixture: update did rewrite files, so it rewrote the manifest too').not.toContain('edited by hand');
  const forced = await h.runCli(['update', '--force', '--yes', '--offline'], dir, { env: { VITEST: '' } });
  expect(forced.code, out(forced)).toBe(0);
  expect(manifestOf(dir).gitHooks, 'the choice survived the manifest being rewritten').toEqual({ commitMsg: 'off' });
  expect(existsSync(join(dir, HOOK)), 'and no hook came back').toBe(false);
  expect(commit(dir, BAD).code, 'so a malformed message is still committed').toBe(0);
}, 400000);

const HINT = 'This project has no git commit-msg hook';

it('`uds update` does not install the hook into a project that has none, and says what it would do and how to turn it on and off (decision 680乙)', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir } = await project();
  const { unlinkSync } = await import('fs');
  unlinkSync(join(dir, HOOK));
  expect(commit(dir, BAD).code, 'fixture: with no hook, a bad message goes through').toBe(0);

  for (const args of [['update', '--plan', '--offline'], ['update', '--apply', '--yes', '--offline']]) {
    const run = await h.runCli(args, dir, { env: { VITEST: '' } });
    expect(run.code, out(run)).toBe(0);
    expect(existsSync(join(dir, HOOK)), `${args[1]} installed nothing`).toBe(false);
    expect(out(run), 'the hint says what the hook does').toContain(`${HINT}. UDS can install one that refuses a commit whose message is not in the form <type>(<scope>): <subject>`);
    expect(out(run), 'how to turn it on').toContain('Turn it on: uds update --git-hooks');
    expect(out(run), 'and how to stop being asked').toContain('uds update --no-git-hooks');
  }
  expect(commit(dir, BAD).code, 'still no hook: a malformed message still goes through').toBe(0);
  expect(manifestOf(dir).gitHooks, 'the hint records nothing').toBeUndefined();
}, 300000);

it('`uds update --git-hooks` installs the hook (--plan only says it would), and the hook then refuses a bad message', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir } = await project();
  const { unlinkSync } = await import('fs');
  unlinkSync(join(dir, HOOK));

  const plan = await h.runCli(['update', '--git-hooks', '--plan', '--offline'], dir, { env: { VITEST: '' } });
  expect(out(plan)).toContain('Would install the git commit-msg hook');
  expect(existsSync(join(dir, HOOK)), '--plan writes nothing').toBe(false);

  const on = await h.runCli(['update', '--git-hooks', '--yes', '--offline'], dir, { env: { VITEST: '' } });
  expect(on.code, out(on)).toBe(0);
  expect(out(on)).toContain('Installed the git commit-msg hook');
  expect(commit(dir, BAD).code, 'the hook now refuses').not.toBe(0);
  expect(commit(dir, GOOD).code, 'control: and passes a well-formed one').toBe(0);
}, 300000);

it('`uds update --no-git-hooks` removes the hook UDS installed and keeps it off; `--git-hooks` turns it back on', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir } = await project();
  expect(existsSync(join(dir, HOOK))).toBe(true);

  const off = await h.runCli(['update', '--no-git-hooks', '--yes', '--offline'], dir, { env: { VITEST: '' } });
  expect(off.code, out(off)).toBe(0);
  expect(existsSync(join(dir, HOOK)), 'UDS removed its own, untouched hook').toBe(false);
  expect(manifestOf(dir).gitHooks).toEqual({ commitMsg: 'off' });
  expect(commit(dir, BAD).code).toBe(0);

  const plain = await h.runCli(['update', '--apply', '--yes', '--offline'], dir, { env: { VITEST: '' } });
  expect(plain.code, out(plain)).toBe(0);
  expect(existsSync(join(dir, HOOK)), 'a plain update leaves it off').toBe(false);
  expect(out(plain), 'and does not ask again').not.toContain(HINT);

  const on = await h.runCli(['update', '--git-hooks', '--yes', '--offline'], dir, { env: { VITEST: '' } });
  expect(on.code, out(on)).toBe(0);
  expect(manifestOf(dir).gitHooks, 'the opt-out is cleared').toBeUndefined();
  expect(commit(dir, BAD).code, 'and the hook refuses again').not.toBe(0);
}, 360000);

it('`uds update --no-git-hooks` does not remove a commit-msg hook that is not UDS\'s', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir } = await project({ before: (d) => putExec(d, HOOK, OWN_HOOK) });
  const off = await h.runCli(['update', '--no-git-hooks', '--yes', '--offline'], dir, { env: { VITEST: '' } });
  expect(off.code, out(off)).toBe(0);
  expect(read(dir, HOOK)).toBe(OWN_HOOK);
}, 300000);

// ── what `uds check` says ─────────────────────────────────────────────────────────────────────────

it('`uds check` reports the hook as active, off, someone else\'s, or missing, and only "active" reads as checked; none of them changes the exit code', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const check = (dir) => h.runCli(['check', '--ci', '--offline'], dir, { env: { VITEST: '' } });

  const active = await project();
  const a = await check(active.dir);
  expect(out(a)).toContain('[commit-msg] git hook active (.git/hooks/commit-msg)');
  expect(a.code, out(a)).toBe(0);

  const off = await project({ initArgs: ['--no-git-hooks'] });
  const o = await check(off.dir);
  expect(out(o)).toContain('[commit-msg] git hook is off');
  expect(out(o)).not.toContain('git hook active');
  expect(o.code, out(o)).toBe(0);

  const other = await project({ before: (d) => putExec(d, HOOK, OWN_HOOK) });
  const y = await check(other.dir);
  expect(out(y), 'someone else\'s hook is named as not running the UDS check').toContain('does not run the UDS check');
  expect(out(y)).not.toContain('git hook active');
  expect(out(y), 'and the verdict does not say the project is compliant while UDS is not checking commit messages').not.toContain('Project is compliant with standards');
  expect(out(y)).toContain('UDS does not check commit messages in this clone');
  expect(y.code, out(y), 'the exit code is the verdict of the standards files, which are intact').toBe(0);

  const elsewhere = await project({
    before: (d) => {
      putExec(d, '.githooks/pre-commit', OWN_HOOK);
      git(['config', '--local', 'core.hooksPath', '.githooks'], d);
    }
  });
  const e = await check(elsewhere.dir);
  expect(out(e), 'a core.hooksPath that UDS stepped aside for is named').toContain('core.hooksPath is ".githooks"');
  expect(out(e)).not.toContain('Project is compliant with standards');
  expect(e.code, out(e)).toBe(0);

  const missing = await project();
  const { unlinkSync } = await import('fs');
  unlinkSync(join(missing.dir, HOOK));
  const m = await check(missing.dir);
  expect(out(m)).toContain('has no git commit-msg hook');
  expect(out(m), 'check says how to turn it on and what it does').toContain('uds update --git-hooks');
  expect(out(m)).toContain('refuses a commit whose message is not <type>(<scope>): <subject>');
  expect(out(m)).not.toContain('git hook active');
  expect(m.code, out(m)).toBe(0);

  const wired = await project({ before: (d) => putExec(d, HOOK, '#!/bin/sh\nuniversal-dev-standards check --commit-msg "$1"\n') });
  const w = await check(wired.dir);
  expect(out(w), 'an adopter who wired the line in by hand is active, not "left alone"').toContain('git hook active');
}, 600000);

// ── the entry the hook runs ───────────────────────────────────────────────────────────────────────

it('`uds check --commit-msg <file>` judges the message like git will record it, and makes no network call', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir } = await project();
  const file = join(dir, 'MSG');
  const run = async (text) => {
    writeFileSync(file, text);
    return h.runCli(['check', '--commit-msg', file], dir, { env: { VITEST: '' } });
  };

  const bad = await run(`${BAD}\n`);
  expect(bad.code, out(bad)).toBe(1);
  expect(bad.stderr).toContain('Invalid commit message format: "fixed stuff"');
  expect(bad.netLog, 'no network, no update notice, on every commit').toEqual([]);

  expect((await run(`${GOOD}\n`)).code).toBe(0);
  // What `git commit` (no -m) leaves in the file: the template's comment lines, and `--verbose`'s diff after the scissors line.
  expect((await run(`${GOOD}\n\n# Please enter the commit message for your changes.\n# On branch main\n`)).code, 'comment lines are not the message').toBe(0);
  expect((await run(`# a comment first\n${BAD}\n`)).code, 'the first line that is not a comment is the header').toBe(1);
  expect((await run(`${GOOD}\n# ------------------------ >8 ------------------------\ndiff --git a/x b/x\n`)).code, 'nothing after the scissors line is judged').toBe(0);
  expect((await run('\n')).code, 'an empty message is git\'s to refuse, not the hook\'s').toBe(0);
}, 300000);

it('when the UDS CLI cannot be found the hook says so and stops the commit (the same fail-closed rule as the pre-commit hook)', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir } = await project();
  const file = join(dir, 'MSG');
  writeFileSync(file, `${GOOD}\n`);
  // A PATH with a shell and nothing else, and no node_modules/.bin in the project: no `universal-dev-standards` anywhere.
  const { rmSync } = await import('fs');
  rmSync(join(dir, 'node_modules'), { recursive: true, force: true });
  const r = runProgram('/bin/sh', [join(dir, HOOK), file], dir, { PATH: '/usr/bin:/bin' });
  expect(r.code, r.all).toBe(1);
  expect(r.all).toContain('the UDS CLI (universal-dev-standards) is not installed');
}, 240000);

// ── not a git repository, and uninstall ───────────────────────────────────────────────────────────

it('in a folder that is not a git repository init skips the hook and says why', async () => {
  const dir = h.makeDir('nogit');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  const init = await h.runCli(['init', '--yes', '--skills-location', 'project'], dir, { env: { VITEST: '' } });
  expect(init.code, out(init)).toBe(0);
  expect(out(init)).toContain('not a git repository');
  expect(existsSync(join(dir, '.git')), 'init did not create one').toBe(false);
});

it('`uds uninstall` removes the commit-msg hook UDS wrote, and keeps one that was edited', async (ctx) => {
  if (!posix) ctx.skip(WHY_SKIP);
  const { dir } = await project();
  expect(existsSync(join(dir, HOOK))).toBe(true);
  const gone = await h.runCli(['uninstall', '--yes'], dir, { env: { VITEST: '' } });
  expect(gone.code, out(gone)).toBe(0);
  expect(existsSync(join(dir, HOOK)), 'UDS removed its own hook').toBe(false);

  const edited = await project();
  writeFileSync(join(edited.dir, HOOK), `${read(edited.dir, HOOK)}echo mine >&2\n`);
  const kept = await h.runCli(['uninstall', '--yes'], edited.dir, { env: { VITEST: '' } });
  expect(kept.code, out(kept)).toBe(0);
  expect(existsSync(join(edited.dir, HOOK)), 'an edited hook has something of theirs in it').toBe(true);
  expect(out(kept)).toContain('commit-msg (kept');
}, 300000);
