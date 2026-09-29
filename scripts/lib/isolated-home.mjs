#!/usr/bin/env node
/**
 * isolated-home — a throwaway HOME for every subprocess that runs the UDS CLI.
 * 每個會執行 UDS CLI 的子行程都用拋棄式的 HOME。
 *
 * 🔴 Why this exists (2026-09-29): `bash scripts/pre-release-check.sh` wrote 54
 * skill folders and a `.manifest.json` into the maintainer's REAL
 * `~/.claude/skills/`, where a user-level skill shadows the project-level one
 * (his project uses the zh-TW skills; the English test build covered them).
 * Reproduced: `scripts/check-upgrade-fidelity.sh` — its `uds update` and its
 * previous-release `npx ... init` both inherited the real HOME. The check that
 * was first suspected (check-adopter-instruction-files.ts) wrote nothing.
 *
 * `cwd: <mkdtemp>` isolates the PROJECT, not the user. `uds init -y` and
 * `uds update` write to user-level locations (~/.claude/skills, ~/.uds, ...)
 * whatever the cwd is, so a test fixture in a temp dir is still a write to the
 * real home unless HOME itself is replaced.
 *
 * What is replaced, and why each one:
 *   HOME                       POSIX; os.homedir() reads it on every call
 *   USERPROFILE                Windows os.homedir()
 *   HOMEDRIVE / HOMEPATH       Windows fallbacks some tools read directly
 *   APPDATA / LOCALAPPDATA     Windows per-user data
 *   XDG_CONFIG_HOME / XDG_DATA_HOME / XDG_CACHE_HOME / XDG_STATE_HOME
 *                              tools that honour XDG ignore HOME when these are set
 *   CODEX_HOME                 Codex's own override of ~/.codex
 * The npm cache is deliberately kept pointing at the REAL cache
 * (`npm_config_cache`): `npx` resolves packages through it, and an empty cache
 * would turn every run into a re-download. It is a cache, not something UDS writes.
 *
 * ONE list. The bash callers do not keep a copy of it: they run
 *   node scripts/lib/isolated-home.mjs env <dir>
 * and read KEY=VALUE lines (see scripts/lib/isolated-home.sh).
 *
 * @module scripts/lib/isolated-home
 */

import { mkdtempSync, mkdirSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Every variable that decides where a per-user file lands. Exported so a test can assert coverage. */
export const HOME_ENV_KEYS = [
  'HOME', 'USERPROFILE', 'HOMEDRIVE', 'HOMEPATH', 'APPDATA', 'LOCALAPPDATA',
  'XDG_CONFIG_HOME', 'XDG_DATA_HOME', 'XDG_CACHE_HOME', 'XDG_STATE_HOME', 'CODEX_HOME',
];

/**
 * The environment for a process that must not touch the real home.
 * @param {string} home  the throwaway home directory (must already exist)
 * @param {NodeJS.ProcessEnv} [base]
 * @returns {Record<string,string>}
 */
export function isolatedEnv(home, base = process.env) {
  const p = parse(home);
  const realHome = base.HOME || base.USERPROFILE || homedir();
  const env = {
    ...base,
    HOME: home,
    USERPROFILE: home,
    HOMEDRIVE: p.root ? p.root.replace(/[\\/]+$/, '') : '',
    HOMEPATH: home.slice(p.root ? p.root.length - 1 : 0),
    APPDATA: join(home, 'AppData', 'Roaming'),
    LOCALAPPDATA: join(home, 'AppData', 'Local'),
    XDG_CONFIG_HOME: join(home, '.config'),
    XDG_DATA_HOME: join(home, '.local', 'share'),
    XDG_CACHE_HOME: join(home, '.cache'),
    XDG_STATE_HOME: join(home, '.local', 'state'),
    CODEX_HOME: join(home, '.codex'),
  };
  // Keep npx's package cache; see the header.
  if (!base.npm_config_cache && !base.NPM_CONFIG_CACHE) env.npm_config_cache = join(realHome, '.npm');
  return env;
}

/**
 * Make a fresh throwaway home and the environment that points at it.
 * @returns {{ home: string, env: Record<string,string>, cleanup: () => void }}
 */
export function isolatedHome({ prefix = 'uds-home-', base = process.env } = {}) {
  const home = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  for (const d of ['AppData/Roaming', 'AppData/Local', '.config', '.local/share', '.cache', '.local/state']) {
    mkdirSync(join(home, d), { recursive: true });
  }
  return {
    home,
    env: isolatedEnv(home, base),
    cleanup: () => rmSync(home, { recursive: true, force: true }),
  };
}

// CLI, for the bash callers: `node isolated-home.mjs env <dir>` prints KEY=VALUE lines.
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd, dir] = process.argv.slice(2);
  if (cmd !== 'env' || !dir) {
    console.error('usage: isolated-home.mjs env <existing-dir>');
    process.exit(2);
  }
  const env = isolatedEnv(dir);
  for (const k of [...HOME_ENV_KEYS, 'npm_config_cache']) if (env[k] !== undefined && env[k] !== process.env[k]) console.log(`${k}=${env[k]}`);
}
