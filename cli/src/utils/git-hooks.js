/**
 * Git pre-commit hook wiring — shared by `uds init` (writer, see
 * setupHuskyHook in ../commands/init.js) and `uds check` (read-only
 * detector, see checkPreCommitHookWiring in ../commands/check.js).
 *
 * Origin: `uds init` writes `.husky/pre-commit`, but never made git actually
 * run it. It relied on husky's own bootstrap (`npm install` triggering the
 * `prepare` script, which husky uses to set `core.hooksPath`), which only
 * fires the NEXT time `npm install` runs — never, if the adopter's
 * `node_modules` already existed. Verified 2026-09-26 against three real
 * adopters (asiaostrich-telemetry-server, asiaostrich-telemetry-client,
 * machine-setup): all three have `.husky/pre-commit` calling `npx uds check`,
 * none has `core.hooksPath` set, and the hook has never once run.
 * (That `npx uds check` form was itself replaced — see buildPreCommitBlock.)
 *
 * Fix: set `core.hooksPath` directly ourselves. This is exactly what husky's
 * own `index.js` does internally (verified against husky ^9.1.7's source:
 * `git config core.hooksPath ${dir}/_`, then a shim under `_/` that execs the
 * real script one directory up) — we do the equivalent for `.husky` directly
 * so the hook is live immediately after `uds init`, independent of whether
 * husky is installed or `npm install` ever runs again.
 */
import { existsSync, readFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname, basename, isAbsolute } from 'path';

/** Read `core.hooksPath` from LOCAL git config only (never global/system) — the
 * scope we write to, and the only one that could conflict with what we set.
 * @returns {string|null} the configured value, or null if unset
 */
export function getLocalHooksPathConfig(projectPath) {
  try {
    const out = execSync('git config --local --get core.hooksPath', {
      cwd: projectPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    return out || null;
  } catch {
    // `git config --get` exits 1 when the key is unset — that is not an error.
    return null;
  }
}

/**
 * The hooks directory git will ACTUALLY use right now, honoring `core.hooksPath`
 * (local, global or system — whichever git resolves) and falling back to
 * `.git/hooks` when unset. This is `git rev-parse --git-path hooks`, chosen
 * over reading `core.hooksPath` ourselves because it matches what git itself
 * resolves, including the worktree/`.git`-is-a-file case.
 * @returns {string|null} absolute path, or null if it could not be determined
 *   (e.g. not a git repository, or git is not on PATH) — callers must treat
 *   that as "unknown", never as "unwired".
 */
export function getEffectiveHooksDir(projectPath) {
  try {
    const out = execSync('git rev-parse --git-path hooks', {
      cwd: projectPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    if (!out) return null;
    return isAbsolute(out) ? out : join(projectPath, out);
  } catch {
    return null;
  }
}

/**
 * Point git's hook directory at `targetRelDir` (e.g. `.husky`) so a
 * pre-commit hook UDS writes there actually runs — without depending on
 * husky (or any npm install) ever executing.
 *
 * Never overrides:
 *   - an adopter's own `core.hooksPath` pointed anywhere else — we do not
 *     know what they use it for, and clobbering it could break hooks for
 *     every event, not just pre-commit.
 *   - an existing native `.git/hooks/pre-commit`, when `core.hooksPath` is
 *     unset (git's default is `.git/hooks`) — setting `core.hooksPath` in
 *     that case would silently stop git from ever running that file again.
 *
 * @param {string} projectPath
 * @param {string} targetRelDir - relative to projectPath, e.g. '.husky'
 * @returns {{wired: boolean, reason?: string, hint?: string}}
 */
export function wireGitHooksPath(projectPath, targetRelDir) {
  const targetAbs = join(projectPath, targetRelDir);
  const configured = getLocalHooksPathConfig(projectPath);

  if (configured) {
    const configuredAbs = isAbsolute(configured) ? configured : join(projectPath, configured);
    if (configuredAbs === targetAbs) {
      return { wired: true };
    }
    return {
      wired: false,
      reason: `git core.hooksPath is already set to "${configured}"`,
      hint: `UDS will not override an existing core.hooksPath. Confirm the hook script there also runs \`universal-dev-standards check\` (the installed CLI — not the short name "uds", which on the npm registry is an unrelated package), or switch it yourself: git config --local core.hooksPath ${targetRelDir}`
    };
  }

  // Unset → git's default is `.git/hooks`. An existing hook there is the
  // adopter's own (or from a tool that writes it directly, not via
  // core.hooksPath); switching hooksPath now would silently stop git from
  // ever running it again.
  const nativeHookPath = join(projectPath, '.git', 'hooks', 'pre-commit');
  if (existsSync(nativeHookPath)) {
    return {
      wired: false,
      reason: '.git/hooks/pre-commit already exists',
      hint: 'UDS will not overwrite or bypass an existing .git/hooks/pre-commit. Add a "universal-dev-standards check" line to it manually (it needs the UDS CLI installed in this project or on PATH), or remove it and re-run `uds init`.'
    };
  }

  try {
    execSync(`git config --local core.hooksPath ${targetRelDir}`, {
      cwd: projectPath,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { wired: true };
  } catch (e) {
    return {
      wired: false,
      reason: `could not set git core.hooksPath (${e.message})`,
      hint: `Run manually: git config --local core.hooksPath ${targetRelDir}`
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// What UDS writes into `.husky/pre-commit`.
//
// 🔴 This used to be the single line `npx uds check`. `npx` resolves a bare
// command name from node_modules/.bin and PATH first, and only when neither has
// it does it go to the npm registry — and the registry package named `uds` is
// NOT this project (it is an unrelated package by another maintainer, no
// `bin`, last published 2022). So a clone with no UDS installed had a commit
// hook that asked npm for a stranger's package by name. It failed today only
// because that package has no executable; the day its owner publishes one with a
// `uds` bin, every adopter's every commit runs the stranger's code.
//
// Measured 2026-09-30 against a local fake registry that logs each request
// (npm 10.9.9, 11.20.0, 12.1.0 — identical): `npx --no-install uds` STILL fetches
// the package metadata for `uds` (GET /uds), so `--no-install` is not a fix; and
// `npx --no-install --package=universal-dev-standards uds` does not find a
// GLOBAL install at all (it goes to the registry for our own name and fails).
// Neither is usable, so the hook does not involve npm at all: it looks in this
// project's node_modules/.bin, then on PATH, and it looks for the bin named
// after the full package name — `universal-dev-standards` is a name only this
// project can publish, `uds` is a name anyone's package can also claim.
// ─────────────────────────────────────────────────────────────────────────────

/** First line of the block UDS writes (also the marker older UDS versions wrote). */
export const UDS_HOOK_MARKER = '# UDS Standard Check';
/** Last line of the block — lets uninstall remove the whole block, not guess line by line. */
export const UDS_HOOK_END_MARKER = '# End UDS Standard Check';
/** The bin every UDS release has shipped since the rename; named after the package on purpose. */
export const UDS_BIN_NAME = 'universal-dev-standards';
/** A hook line that runs the UDS check — the old short form or the current full-name form. */
export const UDS_CHECK_COMMAND_RE = /\b(?:uds|universal-dev-standards)\s+check\b/;

/**
 * Any place a hook script runs the bare name `uds` through a package runner
 * (npx, bunx, pnpm dlx, yarn dlx, npm exec ...). Broader than the two exact lines UDS
 * ever wrote (see legacy-hook-migration.js): this finds lines to TELL the
 * adopter about, not lines UDS may change.
 */
export const BARE_UDS_RUNNER_RE = /\b(?:npx|bunx|pnpx|pnpm\s+dlx|yarn\s+dlx|npm\s+exec|npm\s+x)\s+(?:-\S+\s+)*uds\b/;

/** Does this hook script still run the bare name `uds` through a package runner? */
export function hasBareUdsRunner(content) {
  return typeof content === 'string' && content.split('\n').some((l) => BARE_UDS_RUNNER_RE.test(l));
}

/** Does hook script `content` run the UDS check, in either the old or the current form? */
export function hookRunsUdsCheck(content) {
  return typeof content === 'string' && UDS_CHECK_COMMAND_RE.test(content);
}

/**
 * The block `uds init` appends to `.husky/pre-commit` (and `uds update` swaps in
 * for the old one-liner). POSIX sh; runs in git-bash on Windows.
 *
 * - The subshell keeps the PATH change from leaking into the adopter's own
 *   commands in the same hook file.
 * - `|| exit $?` makes both outcomes stop the commit even when the adopter has
 *   put more commands after this block. Without it the "not installed" branch
 *   would be a silent skip of the check, which is what this must never be.
 * - Not installed: say what is missing and how to fix it, exit non-zero. It
 *   neither skips the check nor downloads anything.
 *
 * @param {{args?: string, hookFile?: string}} [opts]
 *   args     — extra arguments to keep on the check command
 *              (e.g. `--standard checkin-standards`, which older UDS versions wrote).
 *   hookFile — the file the block is written into, named in the "blocked" message so
 *              it points at the file the adopter actually has (default `.husky/pre-commit`;
 *              the native hook passes `.git/hooks/pre-commit`).
 * @returns {string} the block, LF line endings, ending with a newline
 */
export function buildPreCommitBlock({ args = '', hookFile = '.husky/pre-commit' } = {}) {
  const cmd = args ? `${UDS_BIN_NAME} check ${args}` : `${UDS_BIN_NAME} check`;
  return [
    UDS_HOOK_MARKER,
    '# Runs the UDS CLI installed in this project (node_modules/.bin) or on PATH.',
    '# It never asks npm to fetch anything: the short name "uds" on the npm registry',
    '# belongs to an unrelated package, and npx would download and run it.',
    '(',
    '  PATH="$PWD/node_modules/.bin:$PATH"',
    `  if command -v ${UDS_BIN_NAME} >/dev/null 2>&1; then`,
    `    ${cmd}`,
    '    exit $?',
    '  fi',
    `  echo "[UDS] Pre-commit check cannot run: the UDS CLI (${UDS_BIN_NAME}) is not installed." >&2`,
    `  echo "[UDS] Install it:  npm install --save-dev ${UDS_BIN_NAME}   (or: npm install -g ${UDS_BIN_NAME})" >&2`,
    `  echo "[UDS] This commit is blocked until it is installed, or until you remove this block from ${hookFile}." >&2`,
    '  exit 1',
    ') || exit $?',
    UDS_HOOK_END_MARKER,
    ''
  ].join('\n');
}

/**
 * Remove the block buildPreCommitBlock() writes — from the marker line through
 * the end-marker line, inclusive — and nothing else. A block whose end marker is
 * gone (the adopter cut into it) is left alone: what remains of it is no longer
 * provably UDS's, and the caller's line-level fallback deals with the lines it can name.
 * @returns {{content: string, removed: boolean}}
 */
export function stripUdsHookBlock(content) {
  const lines = content.split('\n');
  const out = [];
  let removed = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === UDS_HOOK_MARKER) {
      let end = -1;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() === UDS_HOOK_END_MARKER) { end = j; break; }
        // Another marker before an end marker means this block is not well-formed.
        if (lines[j].trim() === UDS_HOOK_MARKER) break;
      }
      if (end !== -1) {
        i = end;
        removed = true;
        continue;
      }
    }
    out.push(lines[i]);
  }
  return { content: out.join('\n'), removed };
}

/** Does `filePath` contain a hook line UDS manages (the old one-liner or the current block)? */
function hasUdsMarker(filePath) {
  try {
    return hookRunsUdsCheck(readFileSync(filePath, 'utf-8'));
  } catch {
    return false;
  }
}

/**
 * Does `content` begin with a shebang line (`#!...`)?
 *
 * Why this matters on Windows and nowhere else: POSIX git, on ENOEXEC (a
 * script with no shebang), silently retries the exec via `/bin/sh` — that
 * fallback is why a husky v9 hook with no shebang has always worked on macOS
 * and Linux. Git for Windows has no such fallback: without a shebang line it
 * cannot resolve an interpreter at all, and fails EVERY commit with
 * `error: cannot spawn <hookfile>: No such file or directory` — the exact
 * message measured 2026-09-27 in CI (windows-latest) for both a husky hook
 * (which has never carried a shebang) and a `.git/hooks/pre-commit` test
 * fixture that also happened to lack one; a sibling fixture carrying
 * `#!/bin/sh` executed correctly. The message names the hook file, not the
 * missing interpreter, which is why this was first mistaken for a wiring
 * problem rather than a content problem.
 */
export function hasShebang(content) {
  return typeof content === 'string' && content.startsWith('#!');
}

/**
 * Prepend `#!/bin/sh` when `content` has no shebang; a no-op otherwise. Never
 * touches an existing shebang (an adopter may already declare bash or another
 * interpreter) and never rewrites any other line — pairs with
 * stripLegacyHuskyShLine below, which makes the same promise for the v8
 * sourcing line.
 * @returns {{content: string, added: boolean}}
 */
export function ensureShebang(content) {
  if (hasShebang(content)) return { content, added: false };
  return { content: `#!/bin/sh\n${content}`, added: true };
}

/**
 * husky v8's `_/husky.sh` sourcing line — the exact shape husky itself
 * generated before v9 (`. "$(dirname -- "$0")/_/husky.sh"`, with minor
 * `dirname` argument variations). The directory it sources (`.husky/_/`)
 * only exists after husky's OWN bootstrap has actually run; once git
 * executes the hook file directly — which `wireGitHooksPath` above makes it
 * do, by pointing `core.hooksPath` straight at `.husky` instead of at
 * husky's shim — a hook still carrying this line fails on EVERY commit with
 * "No such file or directory", worse than the original defect. Verified
 * against a real adopter's exact legacy template after following the
 * hooksPath-only advice this module used to give (2026-09-27).
 *
 * Shared by the detector (checkPreCommitHookWiring, below) and the writer
 * (setupHuskyHook's rewrite step, init.js) so they can never disagree on
 * what counts as this line.
 */
export const LEGACY_HUSKY_SH_LINE = /^\s*(\.|source)\s+.*_\/husky\.sh["']?\s*$/;

/** Does `content` contain husky v8's `_/husky.sh` sourcing line? */
export function hasLegacyHuskyShLine(content) {
  return content.split('\n').some((line) => LEGACY_HUSKY_SH_LINE.test(line));
}

/**
 * Remove husky v8's `_/husky.sh` sourcing line from `content`, if present.
 * Everything else — the adopter's own commands, an existing `uds check`
 * line, a shebang — is left exactly as it was, in its original order.
 * @returns {{content: string, removed: boolean}}
 */
export function stripLegacyHuskyShLine(content) {
  const lines = content.split('\n');
  const kept = lines.filter((line) => !LEGACY_HUSKY_SH_LINE.test(line));
  return { content: kept.join('\n'), removed: kept.length !== lines.length };
}

/**
 * Read-only detector for `uds check`: a UDS-managed pre-commit hook file
 * exists, but is it actually on git's execution path?
 *
 * Handles three wiring shapes as "wired":
 *   1. Direct — `core.hooksPath` points straight at the UDS-managed file's
 *      directory (what `wireGitHooksPath` above sets up).
 *   2. husky's own bootstrap — `core.hooksPath` points at `<dir>/_` (a shim
 *      directory husky itself creates via `npx husky`/the `prepare` script);
 *      the shim at `<dir>/_/pre-commit` forwards to `<dir>/pre-commit`, the
 *      UDS-managed file, one directory up.
 *   3. Non-Node native install — `.git/hooks/pre-commit` IS the UDS-managed
 *      file, and `core.hooksPath` is unset (git's default).
 *
 * Also reports `missingShebang`, independent of `wired`: a hook file that
 * IS on git's execution path can still fail every commit on Windows if it
 * has no `#!` line (see hasShebang above) — a portability defect, not a
 * wiring defect, so it is surfaced even when `wired: true`.
 *
 * @param {string} projectPath
 * @returns {{relevant: boolean, wired?: boolean, hookFile?: string,
 *   configuredHooksPath?: string|null, effectiveHooksDir?: string|null,
 *   legacyV8?: boolean, missingShebang?: boolean, legacyBareUds?: boolean}}
 *   `relevant: false` means there is nothing UDS-managed to report on (no
 *   hook file, or hooks-dir could not be determined — never guess "unwired"
 *   from a failed lookup).
 */
export function checkPreCommitHookWiring(projectPath) {
  if (!existsSync(join(projectPath, '.git'))) return { relevant: false };

  const huskyHookPath = join(projectPath, '.husky', 'pre-commit');
  const nativeHookPath = join(projectPath, '.git', 'hooks', 'pre-commit');
  const hasHuskyHook = existsSync(huskyHookPath) && hasUdsMarker(huskyHookPath);
  const hasNativeHook = existsSync(nativeHookPath) && hasUdsMarker(nativeHookPath);

  if (!hasHuskyHook && !hasNativeHook) return { relevant: false };

  const effectiveHooksDir = getEffectiveHooksDir(projectPath);
  if (!effectiveHooksDir) return { relevant: false }; // can't determine — do not guess

  // The UDS-managed source file — not the resolved effectiveFile below, which
  // for husky's shim shape (case 2) is a forwarding script we do not own —
  // is the one whose first line actually decides whether Windows can spawn it.
  const hookFile = hasHuskyHook ? '.husky/pre-commit' : '.git/hooks/pre-commit';
  const managedPath = hasHuskyHook ? huskyHookPath : nativeHookPath;
  const missingShebang = (() => {
    try { return !hasShebang(readFileSync(managedPath, 'utf-8')); } catch { return false; }
  })();

  // Independent of wiring, like missingShebang: the file can be wired and still ask
  // npm for the bare name `uds` (see buildPreCommitBlock). Only the husky file is
  // examined — that is the one UDS wrote the old one-liner into.
  const legacyBareUds = hasHuskyHook && (() => {
    try { return hasBareUdsRunner(readFileSync(huskyHookPath, 'utf-8')); } catch { return false; }
  })();

  const effectiveFile = join(effectiveHooksDir, 'pre-commit');
  let wired = false;
  if (existsSync(effectiveFile)) {
    if (hasUdsMarker(effectiveFile)) {
      wired = true;
    } else if (basename(effectiveHooksDir) === '_') {
      // husky-style shim dir: the real script lives one directory up.
      const delegated = join(dirname(effectiveHooksDir), 'pre-commit');
      wired = existsSync(delegated) && hasUdsMarker(delegated);
    }
  }

  if (wired) return { relevant: true, wired: true, hookFile, missingShebang, legacyBareUds };

  const legacyV8 = hasHuskyHook && (() => {
    try { return hasLegacyHuskyShLine(readFileSync(huskyHookPath, 'utf-8')); } catch { return false; }
  })();

  return {
    relevant: true,
    wired: false,
    hookFile,
    configuredHooksPath: getLocalHooksPathConfig(projectPath),
    effectiveHooksDir,
    legacyV8,
    missingShebang,
    legacyBareUds
  };
}
