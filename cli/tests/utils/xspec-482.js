/**
 * Helpers shared by the XSPEC-482 end-to-end tests (beta.12 untested-items findings).
 * Every test using them spawns the real CLI through tests/utils/staged-cli-harness.js.
 */

import { readFileSync, writeFileSync, mkdirSync, chmodSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';
import { join } from 'path';
import { stripAnsi, REAL_CLI_DIR } from './staged-cli-harness.js';
import { isolatedEnv } from '../../../scripts/lib/isolated-home.mjs';

export const DOWN = '\x1b[B';
export const ENTER = '\r';

export const readManifest = (dir) => JSON.parse(readFileSync(join(dir, '.standards', 'manifest.json'), 'utf-8'));
export const writeManifest = (dir, manifest) => writeFileSync(join(dir, '.standards', 'manifest.json'), JSON.stringify(manifest, null, 2));

/** stdout + stderr of one run, without terminal codes. */
export const out = (run) => stripAnsi(`${run.stdout}\n${run.stderr}`);

/**
 * What a person types. `answers` maps a piece of the question's text to the keys typed when that question is on
 * the screen (each question is answered once, because the screen of the next question starts after our reply);
 * every other prompt gets Enter, i.e. its default.
 */
export function typist(answers = {}) {
  const seen = new Set();
  return (screen) => {
    for (const [pattern, keys] of Object.entries(answers)) {
      if (screen.includes(pattern) && !seen.has(pattern)) {
        seen.add(pattern);
        return keys;
      }
    }
    return ENTER;
  };
}

/**
 * Preload (CommonJS) that makes chosen file writes fail the way a read-only file does, on any system (a chmod does
 * nothing on Windows and nothing to root). The fault is injected below the product, in `fs`, so the product's own error
 * handling is what is measured. `UDS_TEST_FS_FAULTS` is a JSON list of `{ fn, contains, code }`: a call of `fs[fn]`
 * whose destination path (separators normalised to "/") contains `contains` throws an error with that code.
 */
export const FS_FAULT_PRELOAD = `
const fs = require('fs');
const wrap = (fn) => {
  const real = fs[fn];
  fs[fn] = function (...args) {
    const dest = String(fn === 'copyFileSync' ? args[1] : args[0]).replace(/\\\\/g, '/');
    const specs = JSON.parse(process.env.UDS_TEST_FS_FAULTS || '[]');
    for (const spec of specs) {
      if (spec.fn === fn && dest.includes(spec.contains)) {
        const err = new Error(spec.code + ': permission denied, ' + (fn === 'copyFileSync' ? 'copyfile' : 'open') + " '" + dest + "'");
        err.code = spec.code;
        throw err;
      }
    }
    return real.apply(this, args);
  };
};
for (const fn of ['copyFileSync', 'writeFileSync']) wrap(fn);
`;

/** Write the preload into `dir` and return `{ preloads, env }` to pass to `runCli` for the given faults. */
export function faultsFor(dir, faults) {
  const file = join(dir, 'fs-fault-preload.cjs');
  writeFileSync(file, FS_FAULT_PRELOAD);
  return { preloads: [file], env: { UDS_TEST_FS_FAULTS: JSON.stringify(faults) } };
}

// ── real git, real hooks ─────────────────────────────────────────────────────────────────────────

/** Names of the GIT_* variables git sets for a hook (GIT_DIR, GIT_INDEX_FILE ...): a nested `git commit` must not inherit them. */
function gitLocalEnvVars() {
  const r = spawnSync('git', ['rev-parse', '--local-env-vars'], { encoding: 'utf8' });
  return r.stdout.split('\n').map((x) => x.trim()).filter(Boolean);
}

/** An environment that reaches neither the real HOME, nor the real git config, nor the repo this suite runs in. */
export function gitEnv(home) {
  const env = { ...isolatedEnv(home, process.env) };
  for (const name of gitLocalEnvVars()) delete env[name];
  return {
    ...env,
    VITEST: '', // `uds init` writes no hook while VITEST is set; the child works in a throwaway directory and must see what a user would
    FORCE_COLOR: '0',
    NO_COLOR: '1',
    UDS_NO_UPDATE_CHECK: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0',
    GIT_AUTHOR_NAME: 'T', GIT_AUTHOR_EMAIL: 't@example.invalid', GIT_COMMITTER_NAME: 'T', GIT_COMMITTER_EMAIL: 't@example.invalid'
  };
}

/** Run a program; `{ code, all }` where all is stdout then stderr. */
export function runProgram(cmd, args, cwd, env, { input } = {}) {
  const r = spawnSync(cmd, args, { cwd, env, encoding: 'utf8', timeout: 120000, ...(input !== undefined ? { input } : {}) });
  return { code: r.status, out: r.stdout || '', err: r.stderr || '', all: `${r.stdout || ''}${r.stderr || ''}` };
}

/** Number of commits on HEAD (0 before the first). */
export function commitCount(dir, env) {
  const r = runProgram('git', ['rev-list', '--count', 'HEAD'], dir, env);
  return r.code === 0 ? Number(r.out.trim()) : 0;
}

/** Make `universal-dev-standards` resolvable the way `npm i -D` leaves it: a shim in node_modules/.bin that runs `cliPath`. */
export function installCliShim(dir, cliPath) {
  const bin = join(dir, 'node_modules', '.bin');
  mkdirSync(bin, { recursive: true });
  const shim = join(bin, 'universal-dev-standards');
  writeFileSync(shim, `#!/bin/sh\nexec "${process.execPath}" "${cliPath}" "$@"\n`);
  chmodSync(shim, 0o755);
}

// ── a real published UDS, installed from npm ───────────────────────────────────────────────────────


const published = new Map();

/**
 * Install `universal-dev-standards@<version>` from the npm registry into a throwaway folder, once per test file.
 * Resolves to `{ bin, env, dir, why }`: `bin` is its `bin/uds.js` (null with `why` set when the registry cannot be
 * reached, so a caller can skip with the reason instead of failing offline), `env` an isolated environment for running it.
 */
export function installPublishedUds(version, home) {
  if (!published.has(version)) {
    published.set(version, (() => {
      const dir = mkdtempSync(join(tmpdir(), `uds-test-published-${version}-`));
      const env = { ...gitEnv(home), npm_config_update_notifier: 'false', npm_config_audit: 'false', npm_config_fund: 'false' };
      writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'old-uds-holder', version: '1.0.0' }));
      const install = runProgram(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install', `universal-dev-standards@${version}`, '--no-audit', '--no-fund'], dir, env);
      const bin = join(dir, 'node_modules', 'universal-dev-standards', 'bin', 'uds.js');
      if (install.code !== 0) return { bin: null, env, dir, why: `cannot install universal-dev-standards@${version} from npm (offline?): ${install.all.slice(-200)}` };
      const got = JSON.parse(readFileSync(join(dir, 'node_modules', 'universal-dev-standards', 'package.json'), 'utf-8')).version;
      if (got !== version) return { bin: null, env, dir, why: `npm installed ${got}, not ${version}` };
      return { bin, env, dir, why: null };
    })());
  }
  return published.get(version);
}

/** Remove what installPublishedUds put on disk (call from afterAll). */
export function cleanPublished() {
  for (const { dir } of published.values()) rmSync(dir, { recursive: true, force: true });
  published.clear();
}

// ── a real terminal ──────────────────────────────────────────────────────────────────────────────

const PTY_RUN = join(import.meta.dirname, 'pty-run.py');

/** Is a pseudo-terminal available here? (python3 with the standard `pty` module; not on Windows.) */
export function ptyAvailable() {
  if (process.platform === 'win32') return false;
  const r = spawnSync('python3', ['-c', 'import pty, termios'], { encoding: 'utf8' });
  return r.status === 0;
}

/**
 * Run `cmd` on a pseudo-terminal of the given size and answer its prompts (see pty-run.py).
 * @param {{cmd: string[], cwd: string, env: Object, cols?: number, rows?: number, timeout?: number, script?: Array<{expect: string, send: string}>}} spec
 * @returns {{code: number|null, timedOut: boolean, out: string, unanswered: string[]}}
 */
export function runInPty(spec) {
  const r = spawnSync('python3', [PTY_RUN, JSON.stringify(spec)], { encoding: 'utf8', timeout: ((spec.timeout || 30) + 20) * 1000 });
  if (r.status !== 0) throw new Error(`pty-run failed (${r.status}): ${r.stderr}`);
  const parsed = JSON.parse(r.stdout);
  return { ...parsed, out: stripAnsi(parsed.out) };
}

// ── what the manifest lists ─────────────────────────────────────────────────────────────────────


/**
 * Does `manifest.standards` list the standard whose AI source is `aiSource` (e.g. `ai/standards/error-codes.ai.yaml`)?
 * `uds init` used to write the file path; since XSPEC-482 R6 it leaves the manifest in the form `uds update` writes, which
 * lists the registry id. The id is looked up in the registry file, not derived from the file name.
 */
export function manifestListsStandard(manifest, aiSource) {
  if (manifest.standards.includes(aiSource)) return true;
  const registry = JSON.parse(readFileSync(join(REAL_CLI_DIR, 'standards-registry.json'), 'utf-8'));
  const entry = registry.standards.find((s) => s.source === aiSource || s.source?.ai === aiSource);
  return Boolean(entry && manifest.standards.includes(entry.id));
}
