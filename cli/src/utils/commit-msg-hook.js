/**
 * The git `commit-msg` hook `uds init` installs by default (dev-platform decision 659甲, board #225; `uds update` only installs it
 * with an explicit `--git-hooks` and otherwise says how to turn it on, decision 680乙).
 *
 * Why it exists: before this, a malformed commit message was refused only for Claude Code, only with `--with-hooks`
 * (a PreToolUse hook on its Bash tool). Every other tool's project had no commit-time check of the message at all.
 * This hook is git's own, so it does not care which AI tool (or none) made the commit.
 *
 * ONE judgement, not two. The hook runs `universal-dev-standards check --commit-msg "$1"`, and that entry loads
 * `scripts/hooks/validate-commit-msg.mjs` from the CLI package and calls its `validateCommitMessage` /
 * `allowedTypes`: the same functions the Claude Code PreToolUse hook runs. It deliberately does NOT use
 * `commit-message-judge.js` (what `uds simulate` runs), because that one also enforces the standard's 72-character
 * `subject-max-length`, and the bilingual one-line subject (`<English>. <中文>.`) this ecosystem writes is routinely
 * 130+ characters: the default hook would refuse most bilingual projects' own commits.
 *
 * Where it goes, and when it steps aside (the decision's "已有 hook／core.hooksPath 就讓開"):
 *   - git's hooks directory is the default one (no `core.hooksPath` in any scope)  -> `<that dir>/commit-msg`.
 *   - `core.hooksPath` is `<project>/.husky` AND `.husky/pre-commit` carries UDS's own block: that is the wiring
 *     `uds init` itself makes for a Node project (see wireGitHooksPath), so it is UDS's directory -> `.husky/commit-msg`.
 *     (Reading the decision to the letter, "core.hooksPath is set -> step aside", would leave every Node project
 *     without the check, because init sets it there; and a file written to `.git/hooks` would then never be run.)
 *   - any other `core.hooksPath` (husky 9's `.husky/_`, `.githooks`, a global one) -> not touched.
 *   - a `commit-msg` that is not UDS's -> not touched. A UDS one that someone edited -> not touched.
 *   In every "not touched" case the caller prints one line saying how to wire it by hand.
 *
 * @module utils/commit-msg-hook
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { execFileSync } from 'child_process';
import { join, resolve, relative, dirname, basename, isAbsolute } from 'path';
import { pathToFileURL } from 'url';
import chalk from 'chalk';
import { getEffectiveHooksDir, hookRunsUdsCheck, UDS_BIN_NAME } from './git-hooks.js';
import { hooksSourceDir } from '../installers/hooks-installer.js';
import { RECORD_KINDS, recordFile, proveUnchanged } from '../core/install-records.js';

/** The line UDS recognises its own hook by (line 2 of the file). Delete it to take the file over. */
export const COMMIT_MSG_HOOK_MARKER = '# UDS commit-msg hook';

/** What the hook runs. `check --commit-msg <file>` is the only entry; see runCommitMsgCheck. */
export const COMMIT_MSG_COMMAND = `${UDS_BIN_NAME} check --commit-msg`;

/** `manifest.gitHooks` when the project turned the hook off (`uds init --no-git-hooks`). */
export const GIT_HOOKS_KEY = 'gitHooks';

const lf = (text) => String(text).replace(/\r\n/g, '\n');

/**
 * The whole file. POSIX `sh` only (no bash syntax): Git for Windows runs hooks with its own `sh`.
 * Same CLI lookup as the pre-commit block (this project's node_modules/.bin, then PATH, never npx: the bare name
 * `uds` on the npm registry is somebody else's package) and the same fail-closed rule: when the CLI is not there
 * the hook says so and stops the commit, because a hook that skips in silence is a check that is not running.
 * @returns {string} LF line endings
 */
export function buildCommitMsgHook() {
  return [
    '#!/bin/sh',
    COMMIT_MSG_HOOK_MARKER,
    '# Written by `uds init` (or `uds update --git-hooks`). It judges the commit message with the same rules the Claude Code hook uses.',
    '# Turn it off: `uds update --no-git-hooks`. To keep your own edits, delete the marker line above;',
    '# UDS then leaves this file alone. Skip it once: `git commit --no-verify`.',
    '(',
    '  PATH="$PWD/node_modules/.bin:$PATH"',
    `  if command -v ${UDS_BIN_NAME} >/dev/null 2>&1; then`,
    `    ${COMMIT_MSG_COMMAND} "$1"`,
    '    exit $?',
    '  fi',
    `  echo "[UDS] The commit-msg check cannot run: the UDS CLI (${UDS_BIN_NAME}) is not installed." >&2`,
    `  echo "[UDS] Install it:  npm install --save-dev ${UDS_BIN_NAME}   (or: npm install -g ${UDS_BIN_NAME})" >&2`,
    '  echo "[UDS] This commit is blocked until it is installed, or until you delete this file, or use --no-verify." >&2',
    '  exit 1',
    ') || exit $?',
    ''
  ].join('\n');
}

/** Is `content` a hook UDS wrote (carries the marker)? */
export function isUdsCommitMsgHook(content) {
  return typeof content === 'string' && lf(content).split('\n').slice(0, 3).some((l) => l.trim() === COMMIT_MSG_HOOK_MARKER);
}

/** Does `content` already run the UDS commit-message check, whoever wrote it (a hand-wired line counts)? */
export function runsUdsCommitMsgCheck(content) {
  return typeof content === 'string' && /\b(?:uds|universal-dev-standards)\s+check\s+--commit-msg\b/.test(content);
}

// ── what the hook judges ────────────────────────────────────────────────────────────────────────

/** Subjects git writes itself. They are not the author's message: judging them would refuse every `git merge`. */
const GIT_GENERATED = /^(Merge |Revert "|fixup! |squash! |amend! )/;

/**
 * The message as git will record it: comment lines (`#`, and everything after the `>8` scissors line that
 * `commit --verbose` adds) dropped, surrounding blank lines trimmed. What is left is what gets judged.
 */
export function messageForJudging(raw) {
  const lines = lf(raw).split('\n');
  const scissors = lines.findIndex((l) => /^# -{24} >8 -{24}$/.test(l));
  return (scissors === -1 ? lines : lines.slice(0, scissors)).filter((l) => !l.startsWith('#')).join('\n').trim();
}

/**
 * `uds check --commit-msg <file>`: the entry the git hook runs.
 * @param {string} projectPath
 * @param {string} file - the message file git passes to the hook
 * @returns {Promise<{code: 0|1|2, lines: string[]}>} 0 = fine (or nothing to judge), 1 = malformed, 2 = could not judge.
 *   2 stops the commit, like 1: "cannot decide" is not a pass.
 */
export async function runCommitMsgCheck(projectPath, file) {
  let raw;
  try {
    raw = readFileSync(file, 'utf-8');
  } catch (e) {
    return { code: 2, lines: [`[UDS] Cannot read the commit message file "${file}": ${e.message}`] };
  }
  const message = messageForJudging(raw);
  // Empty: git decides (it aborts, unless the author asked for an empty message). Generated: not the author's text.
  if (message === '' || GIT_GENERATED.test(message)) return { code: 0, lines: [] };

  const validatorFile = hooksSourceDir() && join(hooksSourceDir(), 'validate-commit-msg.mjs');
  if (!validatorFile || !existsSync(validatorFile)) {
    return { code: 2, lines: ['[UDS] The commit-message validator (scripts/hooks/validate-commit-msg.mjs) is not part of this UDS install, so the message was not judged.'] };
  }
  let validator;
  try {
    validator = await import(pathToFileURL(validatorFile).href);
  } catch (e) {
    return { code: 2, lines: [`[UDS] Cannot load the commit-message validator: ${e.message}`] };
  }
  const types = validator.allowedTypes(projectPath);
  if (validator.validateCommitMessage(message, types)) return { code: 0, lines: [] };
  const shown = message.split('\n')[0];
  return {
    code: 1,
    lines: [
      `[UDS] Invalid commit message format: "${shown}"`,
      '[UDS]   Expected: <type>(<scope>): <subject>',
      `[UDS]   Valid types: ${types.join(', ')}`,
      '[UDS] The commit was not made. Fix the message and commit again (or skip once with --no-verify).'
    ]
  };
}

// ── where the hook goes ─────────────────────────────────────────────────────────────────────────

/** `core.hooksPath` in ANY scope (local, global, system), or null. The local-only reader in git-hooks.js is not enough here. */
function anyHooksPathConfig(projectPath) {
  try {
    const out = execFileSync('git', ['config', '--get', 'core.hooksPath'], { cwd: projectPath, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    return out || null;
  } catch {
    return null; // exit 1 = unset; git missing is handled by getEffectiveHooksDir below
  }
}

/**
 * Which file would the hook be written to, or why not.
 * @returns {{ok: true, file: string, rel: string|null} | {ok: false, why: 'no-git'|'unknown-dir'|'hooks-path', hooksPath?: string}}
 *   `rel` is the project-relative path for an install record (null when the file is outside the project, e.g. a worktree's shared dir).
 */
export function commitMsgTarget(projectPath) {
  if (!existsSync(join(projectPath, '.git'))) return { ok: false, why: 'no-git' };
  const dir = getEffectiveHooksDir(projectPath);
  if (!dir) return { ok: false, why: 'unknown-dir' };

  const configured = anyHooksPathConfig(projectPath);
  if (configured) {
    const huskyDir = join(projectPath, '.husky');
    const ownWiring = resolve(dir) === resolve(huskyDir) && existsSync(join(huskyDir, 'pre-commit')) && safeHasUdsCheck(join(huskyDir, 'pre-commit'));
    if (!ownWiring) return { ok: false, why: 'hooks-path', hooksPath: configured };
  }
  const file = join(dir, 'commit-msg');
  const rel = relative(projectPath, file);
  return { ok: true, file, rel: rel.startsWith('..') || isAbsolute(rel) ? null : rel.split('\\').join('/') };
}

function safeHasUdsCheck(path) {
  try { return hookRunsUdsCheck(readFileSync(path, 'utf-8')); } catch { return false; }
}

/** Has the project turned the git hooks off? Read from the raw manifest (`gitHooks.commitMsg === 'off'`). */
export function gitHooksDisabled(manifest) {
  return manifest?.[GIT_HOOKS_KEY]?.commitMsg === 'off';
}

/**
 * Install, update or leave the commit-msg hook.
 *
 * @param {string} projectPath
 * @param {object} opts
 * @param {object|null} [opts.manifest] - the manifest as on disk (install records, the opt-out)
 * @param {boolean} [opts.disable] - `--no-git-hooks` was given: remove OUR hook if it is provably ours, write nothing
 * @param {boolean} [opts.plan] - decide and report, write nothing
 * @param {boolean} [opts.installIfMissing] - false (what a plain `uds update` passes, decision 680乙): a hook that is not there is
 *   NOT written, the state is `not-installed` and the caller says how to turn it on. An existing UDS hook is still brought up to date.
 * @param {object} [opts.recorder] - receives the install record of a file written
 * @returns {{state: 'not-installed'|'installed'|'updated'|'current'|'would-install'|'would-update'|'disabled'|'removed'|'would-remove'|'kept-disabled'
 *   |'yielded-existing'|'yielded-edited'|'yielded-hooks-path'|'no-git'|'unknown-dir'|'error', file?: string, hooksPath?: string, writeFailure?: string}}
 */
export function ensureCommitMsgHook(projectPath, { manifest = null, disable = false, plan = false, recorder = null, installIfMissing = true } = {}) {
  const target = commitMsgTarget(projectPath);

  if (disable || gitHooksDisabled(manifest)) {
    // The opt-out. With an explicit flag, take our own hook away too; never touch anything that is not provably ours.
    if (!disable || !target.ok || !existsSync(target.file)) return { state: 'disabled' };
    const existing = readFileSync(target.file, 'utf-8');
    const provablyOurs = lf(existing) === buildCommitMsgHook() || (target.rel && proveUnchanged(manifest, projectPath, target.rel).state === 'proven');
    if (!isUdsCommitMsgHook(existing) || !provablyOurs) return { state: 'kept-disabled', file: target.file };
    if (!plan) unlinkSync(target.file);
    return { state: plan ? 'would-remove' : 'removed', file: target.file };
  }

  if (!target.ok) return { state: target.why === 'hooks-path' ? 'yielded-hooks-path' : target.why, hooksPath: target.hooksPath };

  const want = buildCommitMsgHook();
  const write = (state) => {
    if (plan) return { state: state === 'installed' ? 'would-install' : 'would-update', file: target.file };
    try {
      mkdirSync(dirname(target.file), { recursive: true });
      writeFileSync(target.file, want, { mode: 0o755 });
      if (recorder && target.rel) recordFile(recorder, projectPath, target.rel, RECORD_KINDS.GIT_HOOK);
      return { state, file: target.file };
    } catch (e) {
      return { state: 'error', file: target.file, writeFailure: e.message };
    }
  };

  if (!existsSync(target.file)) return installIfMissing ? write('installed') : { state: 'not-installed', file: target.file };

  const existing = readFileSync(target.file, 'utf-8');
  if (lf(existing) === want) return { state: 'current', file: target.file };
  if (!isUdsCommitMsgHook(existing)) {
    // Somebody else's. If it already runs the UDS check (wired in by hand, as the message tells them to), there is nothing to do.
    return runsUdsCommitMsgCheck(existing) ? { state: 'current', file: target.file } : { state: 'yielded-existing', file: target.file };
  }
  // UDS's marker, other text: an older UDS's version, or one somebody edited. Replace it only when the install
  // record proves nobody edited it; otherwise it is theirs now.
  if (target.rel && proveUnchanged(manifest, projectPath, target.rel).state === 'proven') return write('updated');
  return { state: 'yielded-edited', file: target.file };
}

/**
 * What `uds check` reports. Four states, none of which may read as "all good" except `active`:
 *   active        the hook git will run does the UDS check (UDS wrote it, or the adopter wired the line in by hand)
 *   disabled      the project turned it off (`--no-git-hooks`)
 *   yielded       something else owns commit-msg (an existing hook) and does not run the UDS check
 *   not-installed nothing is there and nobody opted out (a fresh clone, or a project from before this hook)
 * @returns {{state: 'active'|'disabled'|'yielded'|'not-installed'|'not-applicable', file?: string, hooksPath?: string}}
 */
export function commitMsgHookStatus(projectPath, manifest) {
  if (!existsSync(join(projectPath, '.git'))) return { state: 'not-applicable' };
  if (gitHooksDisabled(manifest)) return { state: 'disabled' };

  const dir = getEffectiveHooksDir(projectPath);
  if (!dir) return { state: 'not-applicable' }; // cannot tell where git looks: never guess "unwired"

  // husky 9 points git at `<dir>/_`, whose files only forward to the real script one level up.
  const candidates = [join(dir, 'commit-msg')];
  if (basename(dir) === '_') candidates.push(join(dirname(dir), 'commit-msg'));

  let found = null;
  for (const file of candidates) {
    let content;
    try { content = readFileSync(file, 'utf-8'); } catch { continue; }
    if (isUdsCommitMsgHook(content) || runsUdsCommitMsgCheck(content)) return { state: 'active', file };
    found = found || file;
  }
  if (found) return { state: 'yielded', file: found };
  const hooksPath = anyHooksPathConfig(projectPath);
  return hooksPath ? { state: 'not-installed', hooksPath } : { state: 'not-installed' };
}

// ── the project's choice, and what is said about it ─────────────────────────────────────────────

/**
 * Record (or clear) the opt-out in `.standards/manifest.json`, read and written as RAW JSON like persistRecorder does
 * (`readManifest` migrates on read, so a read-modify-write through it would change every other field).
 * It lives in the manifest, not in `.git`, because the choice belongs to the project: a teammate's clone, and every
 * later `uds update`, must see it. `manifest`, when given, is changed to match so a later write of it keeps the choice.
 * @returns {boolean} false when there is no manifest to record it in
 */
export function recordGitHooksChoice(projectPath, off, manifest = null) {
  const apply = (m) => {
    const next = { ...(m[GIT_HOOKS_KEY] || {}) };
    if (off) next.commitMsg = 'off'; else delete next.commitMsg;
    if (Object.keys(next).length > 0) m[GIT_HOOKS_KEY] = next; else delete m[GIT_HOOKS_KEY];
  };
  if (manifest) apply(manifest);
  const path = join(projectPath, '.standards', 'manifest.json');
  if (!existsSync(path)) return false;
  let raw;
  try { raw = JSON.parse(readFileSync(path, 'utf-8')); } catch { return false; }
  if (!raw || typeof raw !== 'object') return false;
  apply(raw);
  writeFileSync(path, JSON.stringify(raw, null, 2));
  return true;
}

const fill = (text, vars) => Object.entries(vars).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), text);

/**
 * Say what `ensureCommitMsgHook` did, in the user's language. One line per outcome (a hook that was left alone says how to
 * wire it by hand); a plain "already there" is a quiet grey line.
 * @param {ReturnType<typeof ensureCommitMsgHook>} result
 * @param {object} common - `t().commands.common`
 */
export function reportCommitMsgHook(result, common, projectPath, log = console.log) {
  const file = result.file ? relative(projectPath, result.file).split('\\').join('/') || result.file : '';
  const say = (colour, key) => log(colour(`  ${fill(common[key], { file, path: result.hooksPath ?? '', error: result.writeFailure ?? '' })}`));
  const table = {
    installed: [chalk.green, 'commitMsgHookInstalled'],
    updated: [chalk.green, 'commitMsgHookUpdated'],
    current: [chalk.gray, 'commitMsgHookCurrent'],
    'not-installed': [chalk.cyan, 'commitMsgHookNotInstalledHint'],
    'would-install': [chalk.cyan, 'commitMsgHookWouldInstall'],
    'would-update': [chalk.cyan, 'commitMsgHookWouldUpdate'],
    disabled: [chalk.gray, 'commitMsgHookDisabled'],
    removed: [chalk.green, 'commitMsgHookRemoved'],
    'would-remove': [chalk.cyan, 'commitMsgHookWouldRemove'],
    'kept-disabled': [chalk.yellow, 'commitMsgHookKeptDisabled'],
    'yielded-existing': [chalk.yellow, 'commitMsgHookYieldedExisting'],
    'yielded-edited': [chalk.yellow, 'commitMsgHookYieldedEdited'],
    'yielded-hooks-path': [chalk.yellow, 'commitMsgHookYieldedHooksPath'],
    'no-git': [chalk.gray, 'commitMsgHookNoGit'],
    'unknown-dir': [chalk.yellow, 'commitMsgHookUnknownDir'],
    error: [chalk.red, 'commitMsgHookError']
  };
  const row = table[result.state];
  if (row) say(...row);
}
