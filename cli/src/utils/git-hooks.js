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
      hint: `UDS will not override an existing core.hooksPath. Confirm the hook script there also runs \`npx uds check\`, or switch it yourself: git config --local core.hooksPath ${targetRelDir}`
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
      hint: 'UDS will not overwrite or bypass an existing .git/hooks/pre-commit. Add "npx uds check" to it manually, or remove it and re-run `uds init`.'
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

/** Does `filePath` contain the marker UDS writes into a hook it manages? */
function hasUdsMarker(filePath) {
  try {
    return readFileSync(filePath, 'utf-8').includes('uds check');
  } catch {
    return false;
  }
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
 * @param {string} projectPath
 * @returns {{relevant: boolean, wired?: boolean, hookFile?: string,
 *   configuredHooksPath?: string|null, effectiveHooksDir?: string|null,
 *   legacyV8?: boolean}}
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

  if (wired) return { relevant: true, wired: true };

  const hookFile = hasHuskyHook ? '.husky/pre-commit' : '.git/hooks/pre-commit';
  const legacyV8 = hasHuskyHook && (() => {
    try { return readFileSync(huskyHookPath, 'utf-8').includes('husky.sh'); } catch { return false; }
  })();

  return {
    relevant: true,
    wired: false,
    hookFile,
    configuredHooksPath: getLocalHooksPathConfig(projectPath),
    effectiveHooksDir,
    legacyV8
  };
}
