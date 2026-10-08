/**
 * Test helper: run the UDS CLI as it is run after `npm install`, not as it is run from a checkout.
 *
 * Why: from a checkout, `PathResolver` finds every source file in the repo, so a test that runs the CLI
 * there cannot tell "read from the installed package" from "read from the repo" — and cannot make a
 * package that lacks a file. Here:
 *   1. a staging copy of the sources is made (real files, no symlinks) and `npm pack` really runs in it, so
 *      `prepack` (cli/scripts/prepack.mjs) and the `files` list of package.json decide what is in the tarball;
 *   2. the tarball is extracted into a throwaway directory with nothing above it that carries `core/`,
 *      `ai/` or `extensions/` — `PathResolver` also looks in `<package>/..`, and a repo root there would
 *      rescue a missing file and make the test measure the checkout again;
 *   3. the CLI that runs is `node <extracted package>/bin/uds.js`.
 *
 * Network: `blockNetworkPreload()` fails every https/http/fetch call at once and writes the target to a log,
 * so "the CLI never went to the network" is a log read back, not an absence of output.
 * `fakeGithubPreload()` additionally ANSWERS requests for GitHub raw content — with the packaged file plus an
 * upstream-only line — so a CLI that still compared against GitHub `main` would show a difference that is not
 * the adopter's. HOME and every XDG_* variable point to a throwaway directory.
 *
 * (cli/tests/e2e/extensions-packaged-offline.test.js — XSPEC-452 — carries its own copy of the same
 * technique; it is left untouched because its test names and cut lines are evidence for that spec.)
 */

import { spawn } from 'child_process';
import {
  mkdtempSync, mkdirSync, cpSync, symlinkSync, readdirSync, readFileSync, existsSync, rmSync, realpathSync,
  writeFileSync
} from 'fs';
import { tmpdir } from 'os';
import { join, resolve, relative } from 'path';
import { isolatedEnv } from '../../../scripts/lib/isolated-home.mjs';
import { resolveNpm } from '../../../scripts/beta-acceptance/lib/install.mjs';

export const REAL_CLI_DIR = resolve(import.meta.dirname, '../..');
export const REAL_REPO = resolve(REAL_CLI_DIR, '..');

// Real directories of the repo that prepack bundles (see cli/scripts/prepack.mjs) — copied, never symlinked:
// cpSync would copy a symlink as a symlink and npm never packs symlinks.
const REPO_DIRS_FOR_PREPACK = ['ai', 'core', 'locales', 'skills', 'templates', 'extensions'];

/**
 * Directory link type. 'junction' needs no privilege on Windows (a 'dir' symlink needs Developer Mode or an
 * elevated user); POSIX ignores the argument and makes an ordinary symlink.
 */
export const LINK_TYPE = 'junction';

/** The line a fake "GitHub main" adds to every file it serves — never part of any installed file. */
export const UPSTREAM_ONLY_LINE = 'UPSTREAM-ONLY-LINE-THAT-GITHUB-MAIN-ADDED-AFTER-YOU-INSTALLED';

const BLOCK_NETWORK = `
const https = require('https');
const http = require('http');
const { appendFileSync, readFileSync, existsSync } = require('fs');
const { join } = require('path');
const { EventEmitter } = require('events');
const log = process.env.UDS_TEST_NET_LOG;
const fakeDir = process.env.UDS_TEST_FAKE_GITHUB_DIR; // when set, GitHub raw requests are answered from here
const upstreamLine = process.env.UDS_TEST_UPSTREAM_LINE;
function note(what) { if (log) appendFileSync(log, String(what) + '\\n'); }
function targetOf(args) {
  return typeof args[0] === 'string' ? args[0] : (args[0] && (args[0].href || args[0].host || args[0].hostname)) || '?';
}
function blocked(...args) {
  const target = targetOf(args);
  note(target);
  const req = new EventEmitter();
  req.end = () => req; req.destroy = () => req; req.setTimeout = () => req; req.write = () => true;
  const prefix = 'https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/';
  const cb = args.find((a) => typeof a === 'function');
  if (fakeDir && target.startsWith(prefix) && cb) {
    const file = join(fakeDir, target.slice(prefix.length));
    setImmediate(() => {
      const res = new EventEmitter();
      res.headers = {};
      if (!existsSync(file)) { res.statusCode = 404; cb(res); res.emit('end'); return; }
      res.statusCode = 200;
      cb(res);
      res.emit('data', Buffer.from(readFileSync(file, 'utf-8') + '\\n' + upstreamLine + '\\n'));
      res.emit('end');
    });
    return req;
  }
  const err = new Error('network blocked by the test (' + target + ')');
  err.code = 'UDS_TEST_NETWORK_BLOCKED';
  setImmediate(() => req.emit('error', err));
  return req;
}
for (const m of [https, http]) { m.get = blocked; m.request = blocked; }
globalThis.fetch = async (url) => { note(url); const e = new Error('network blocked by the test'); e.code = 'UDS_TEST_NETWORK_BLOCKED'; throw e; };
`;

export function run(cmd, args, cwd, env, timeoutMs = 120000, { shell = false } = {}) {
  return new Promise((done) => {
    const proc = spawn(cmd, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'], shell });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('error', (e) => { stderr += `spawn failed: ${e.message}`; });
    const timer = setTimeout(() => proc.kill('SIGTERM'), timeoutMs);
    proc.on('close', (code) => {
      clearTimeout(timer);
      done({ code, stdout, stderr });
    });
  });
}

export const baseEnv = (home) => ({ ...isolatedEnv(home, process.env), FORCE_COLOR: '0', UDS_NO_UPDATE_CHECK: '1', HUSKY: '0' });

/**
 * One world per test file: a sandbox directory, the packed-and-extracted package (built once, lazily), and
 * helpers to install into / run against throwaway projects. Call `dispose()` from `afterAll`.
 */
export function createPackagedWorld(prefix) {
  let sandbox;
  const memo = new Map();
  const once = (key, build) => {
    if (!memo.has(key)) memo.set(key, build());
    return memo.get(key);
  };
  const sandboxDir = () => {
    if (!sandbox) sandbox = mkdtempSync(join(tmpdir(), `${prefix}-`));
    return sandbox;
  };

  /** Stage real sources → `npm pack` → extract like an install would. */
  const packAndExtract = () => once('pack', async () => {
    const root = sandboxDir();
    const home = join(root, 'home-pack');
    mkdirSync(home, { recursive: true });
    const stage = join(root, 'stage');
    const cli = join(stage, 'cli');
    mkdirSync(cli, { recursive: true });
    for (const d of ['bin', 'src', 'scripts']) cpSync(join(REAL_CLI_DIR, d), join(cli, d), { recursive: true });
    for (const f of ['package.json', 'standards-registry.json', 'README.md']) cpSync(join(REAL_CLI_DIR, f), join(cli, f));
    for (const d of REPO_DIRS_FOR_PREPACK) cpSync(join(REAL_REPO, d), join(stage, d), { recursive: true });
    mkdirSync(join(stage, 'scripts'), { recursive: true });
    cpSync(join(REAL_REPO, 'scripts', 'hooks'), join(stage, 'scripts', 'hooks'), { recursive: true });
    cpSync(join(REAL_REPO, 'scripts', 'setup-husky.mjs'), join(stage, 'scripts', 'setup-husky.mjs'));

    const dest = join(root, 'tarball');
    mkdirSync(dest, { recursive: true });
    // `npm` is `npm.cmd` on Windows and Node cannot start a .cmd without a shell (spawn npm ENOENT, which is how
    // this failed on windows-latest). resolveNpm starts npm-cli.js with node itself, and only falls back to
    // `npm.cmd` through a shell when it cannot find it.
    const npm = resolveNpm({ env: process.env });
    const packed = await run(npm.file, [...npm.prefixArgs, 'pack', '--pack-destination', dest], cli, baseEnv(home), 300000, { shell: npm.shell });
    const tgz = existsSync(dest) ? readdirSync(dest).find((f) => f.endsWith('.tgz')) : null;
    if (packed.code !== 0 || !tgz) {
      throw new Error(`npm pack failed (exit ${packed.code}): ${packed.stdout.slice(-400)}\n${packed.stderr.slice(-400)}`);
    }

    const pkgParent = join(root, 'installed');
    mkdirSync(pkgParent, { recursive: true });
    // Relative names, run from `dest`: GNU tar (the one Git for Windows puts first on PATH) reads `D:\...` as
    // "host D, file ..." and fails; a bare file name and a relative -C mean the same to GNU tar and bsdtar.
    const untar = await run('tar', ['-xzf', tgz, '-C', relative(dest, pkgParent)], dest, baseEnv(home));
    if (untar.code !== 0) throw new Error(`tar failed: ${untar.stderr}`);
    const pkgDir = join(pkgParent, 'package'); // npm tarballs always unpack to package/
    symlinkSync(realpathSync(join(REAL_CLI_DIR, 'node_modules')), join(pkgDir, 'node_modules'), LINK_TYPE);

    const mappings = await readExtensionMappings(pkgDir, home);
    const version = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf-8')).version;
    return { root, pkgDir, mappings, version };
  });

  /** A fresh copy of the installed package, for tests that must break it. */
  const copyPackage = async (label) => {
    const pkg = await packAndExtract();
    const copyRoot = join(sandboxDir(), 'copies', label);
    mkdirSync(copyRoot, { recursive: true });
    const copyDir = join(copyRoot, 'package');
    cpSync(pkg.pkgDir, copyDir, { recursive: true, filter: (src) => !src.endsWith('node_modules') });
    symlinkSync(realpathSync(join(REAL_CLI_DIR, 'node_modules')), join(copyDir, 'node_modules'), LINK_TYPE);
    return copyDir;
  };

  const preloadFile = () => {
    const file = join(sandboxDir(), 'block-network.cjs');
    if (!existsSync(file)) writeFileSync(file, BLOCK_NETWORK);
    return file;
  };

  /**
   * Run `<pkgDir>/bin/uds.js <args>` in `project` with the network blocked and logged.
   * `fakeGithubDir`: answer GitHub raw requests from that directory (each file plus UPSTREAM_ONLY_LINE).
   */
  const uds = async (pkgDir, args, project, label, { fakeGithubDir } = {}) => {
    const root = sandboxDir();
    const home = join(root, `home-${label}`);
    const netLog = join(root, `net-${label}.log`);
    mkdirSync(home, { recursive: true });
    const env = {
      ...baseEnv(home),
      UDS_TEST_NET_LOG: netLog,
      NODE_OPTIONS: [process.env.NODE_OPTIONS, `--require=${preloadFile()}`].filter(Boolean).join(' ')
    };
    if (fakeGithubDir) {
      env.UDS_TEST_FAKE_GITHUB_DIR = fakeGithubDir;
      env.UDS_TEST_UPSTREAM_LINE = UPSTREAM_ONLY_LINE;
    }
    const result = await run('node', [join(pkgDir, 'bin', 'uds.js'), ...args], project, env);
    const attempts = existsSync(netLog) ? readFileSync(netLog, 'utf-8').split('\n').filter(Boolean) : [];
    return { ...result, attempts, output: `${result.stdout}\n${result.stderr}` };
  };

  /**
   * `uds init` of the installed package into a fresh throwaway project with the given extension options,
   * network blocked. `.claude/` is Claude Code's detector marker; without a detected tool `uds init` takes
   * the legacy path, which ignores the option flags.
   */
  const initProject = async (pkgDir, label, extraArgs = []) => {
    const project = join(sandboxDir(), `project-${label}`);
    mkdirSync(join(project, '.claude'), { recursive: true });
    const result = await uds(pkgDir, ['init', '--yes', '--skills-location', 'project', ...extraArgs], project, `init-${label}`);
    return { project, init: result };
  };

  const dispose = () => {
    if (sandbox && sandbox.includes(`${prefix}-`)) rmSync(sandbox, { recursive: true, force: true });
  };

  return { sandboxDir, packAndExtract, copyPackage, uds, initProject, dispose };
}

/** The installer's extension option list, read FROM the installed package (never written in a test). */
async function readExtensionMappings(pkgDir, home) {
  const read = await run('node', ['--input-type=module', '-e',
    'import { EXTENSION_MAPPINGS } from "./src/installers/standards-installer.js"; console.log(JSON.stringify(EXTENSION_MAPPINGS));'],
  pkgDir, baseEnv(home));
  if (read.code !== 0) throw new Error(`could not read EXTENSION_MAPPINGS from the installed package: ${read.stderr}`);
  return JSON.parse(read.stdout.trim().split('\n').pop());
}
