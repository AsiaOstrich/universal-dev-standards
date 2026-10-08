/**
 * Harness for tests that run the REAL CLI (`node cli/bin/uds.js ...`) in a throwaway project and read back
 * what it did: stdout, exit code, files, and every network call and child process it made.
 * Used by the XSPEC-456 end-to-end tests.
 *
 * What is staged, and why (same approach as init-every-declared-locale.test.js): a copy of cli/bin + cli/src
 * made at test time, so a mutation of the source is what runs; its repo root is the real repo (symlinks) and it
 * has no `cli/bundled/` (a gitignored build product that, where it exists, can be older than the sources).
 * HOME and every XDG_* variable point to a throwaway directory.
 *
 * A preload (`--require`) makes every network call fail at once (and logs the URL), and logs every child
 * process the CLI starts. `gh`, browsers and clipboard tools are refused instead of run.
 *
 * Everything a test needs is created by the harness on first use, so each test also passes when selected on
 * its own (`vitest -t "<full name>"`).
 */

import { spawn } from 'child_process';
import {
  mkdtempSync, mkdirSync, cpSync, symlinkSync, readdirSync, existsSync, readFileSync, rmSync,
  realpathSync, writeFileSync, statSync
} from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { isolatedEnv } from '../../../scripts/lib/isolated-home.mjs';

export const REAL_CLI_DIR = resolve(import.meta.dirname, '../..');
export const REAL_REPO = resolve(REAL_CLI_DIR, '..');

/**
 * Put `target` (a directory or a file of the repo) at `link` inside the staged tree.
 * Windows (windows-latest, XSPEC-469 R4): a 'dir' symlink and any file symlink need a privilege the user may
 * not have, and a symlink created without a type to a directory becomes a file-type link. So a directory gets
 * a 'junction' (no privilege, absolute target) and a file is copied; POSIX keeps the plain symlink.
 * `platform` and `symlink` are parameters so the Windows choice can be checked on any system.
 */
export function linkRepoEntry(link, target, { platform = process.platform, symlink = symlinkSync } = {}) {
  const isDirectory = statSync(target).isDirectory();
  if (platform !== 'win32') return symlink(target, link);
  if (isDirectory) return symlink(target, link, 'junction');
  return cpSync(target, link);
}

/** Text without the terminal control codes (colours, cursor moves) a prompt library prints. */
export const stripAnsi = (text) => text.replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '');

const PRELOAD = `
const https = require('https');
const http = require('http');
const cp = require('child_process');
const { appendFileSync } = require('fs');
const { EventEmitter } = require('events');
const netLog = process.env.UDS_TEST_NET_LOG;
const procLog = process.env.UDS_TEST_PROC_LOG;
const note = (file, what) => { if (file) appendFileSync(file, String(what) + '\\n'); };

function blocked(...args) {
  const target = typeof args[0] === 'string' ? args[0] : (args[0] && (args[0].href || args[0].host || args[0].hostname)) || '?';
  note(netLog, target);
  const req = new EventEmitter();
  req.end = () => req; req.destroy = () => req; req.setTimeout = () => req; req.write = () => true;
  const err = new Error('network blocked by the test (' + target + ')');
  err.code = 'UDS_TEST_NETWORK_BLOCKED';
  setImmediate(() => req.emit('error', err));
  return req;
}
for (const m of [https, http]) { m.get = blocked; m.request = blocked; }
globalThis.fetch = async (url) => { note(netLog, url); const e = new Error('network blocked by the test'); e.code = 'UDS_TEST_NETWORK_BLOCKED'; throw e; };

const DENY = /^(gh|open|xdg-open|pbcopy|pbpaste|clip|clip\\.exe|start|xclip|xsel|wl-copy|wl-paste|explorer|explorer\\.exe)$/i;
const base = (s) => String(s).trim().split(/[\\\\/]/).pop();
const firstWord = (s) => base(String(s).trim().split(/\\s+/)[0] || '');
const denied = (file) => DENY.test(file);
const refusal = (file) => { const e = new Error('command blocked by the test: ' + file); e.code = 'ENOENT'; return e; };

for (const name of ['execSync', 'execFileSync']) {
  const real = cp[name];
  cp[name] = function (cmd, ...rest) {
    const file = name === 'execSync' ? firstWord(cmd) : base(cmd);
    if (denied(file)) { note(procLog, 'DENIED ' + cmd); throw refusal(file); }
    note(procLog, 'ran ' + cmd);
    return real.call(this, cmd, ...rest);
  };
}
{
  const real = cp.spawnSync;
  cp.spawnSync = function (cmd, ...rest) {
    if (denied(base(cmd))) { note(procLog, 'DENIED ' + cmd); return { status: null, signal: null, error: refusal(cmd), stdout: Buffer.alloc(0), stderr: Buffer.alloc(0), output: null, pid: 0 }; }
    note(procLog, 'ran ' + cmd);
    return real.call(this, cmd, ...rest);
  };
}
{
  const real = cp.spawn;
  cp.spawn = function (cmd, ...rest) {
    if (denied(base(cmd))) {
      note(procLog, 'DENIED ' + cmd);
      const child = new EventEmitter();
      child.stdout = new EventEmitter(); child.stderr = new EventEmitter(); child.stdin = { write() {}, end() {} };
      child.kill = () => true;
      setImmediate(() => child.emit('error', refusal(cmd)));
      return child;
    }
    note(procLog, 'ran ' + cmd);
    return real.call(this, cmd, ...rest);
  };
}
for (const name of ['exec', 'execFile']) {
  const real = cp[name];
  cp[name] = function (cmd, ...rest) {
    const file = name === 'exec' ? firstWord(cmd) : base(cmd);
    if (denied(file)) {
      note(procLog, 'DENIED ' + cmd);
      const cb = rest.find((a) => typeof a === 'function');
      const child = new EventEmitter();
      child.stdout = new EventEmitter(); child.stderr = new EventEmitter(); child.stdin = { write() {}, end() {} };
      setImmediate(() => { if (cb) cb(refusal(file), '', ''); else child.emit('error', refusal(file)); });
      return child;
    }
    note(procLog, 'ran ' + cmd);
    return real.call(this, cmd, ...rest);
  };
  // util.promisify(exec) must still resolve to { stdout, stderr } (the real exec carries that in a custom hook).
  cp[name][require('util').promisify.custom] = (...args) => new Promise((resolve, reject) => {
    cp[name](...args, (err, stdout, stderr) => (err ? reject(Object.assign(err, { stdout, stderr })) : resolve({ stdout, stderr })));
  });
}
`;

/**
 * @param {string} label - Short name used in the sandbox directory
 * @param {{ overrides?: Object<string, string> }} [opts] - `overrides` maps a path under `cli/` (e.g.
 *   `src/utils/foo.js`) to the source text that replaces that file in the STAGED copy only. It builds a
 *   "feature switched off" twin of the CLI: run the same commands on both and the difference is the feature.
 * @returns {{ runCli: Function, newProject: Function, sandbox: Function, cleanup: Function }}
 */
export function createHarness(label, { overrides = {} } = {}) {
  let sandbox = null;
  let stagedCli = null;
  let preloadPath = null;
  let counter = 0;
  const templates = {};

  function ensureSandbox() {
    if (sandbox) return sandbox;
    sandbox = realpathSync(mkdtempSync(join(tmpdir(), `uds-test-${label}-`)));
    preloadPath = join(sandbox, 'preload.cjs');
    writeFileSync(preloadPath, PRELOAD);
    const root = join(sandbox, 'stage');
    const cli = join(root, 'cli');
    mkdirSync(cli, { recursive: true });
    cpSync(join(REAL_CLI_DIR, 'bin'), join(cli, 'bin'), { recursive: true });
    cpSync(join(REAL_CLI_DIR, 'src'), join(cli, 'src'), { recursive: true });
    for (const [rel, source] of Object.entries(overrides)) {
      const target = join(cli, rel);
      if (!existsSync(target)) throw new Error(`harness override targets a file that is not in the staged CLI: ${rel}`);
      writeFileSync(target, source);
    }
    for (const f of ['package.json', 'standards-registry.json']) cpSync(join(REAL_CLI_DIR, f), join(cli, f));
    symlinkSync(realpathSync(join(REAL_CLI_DIR, 'node_modules')), join(cli, 'node_modules'), 'junction'); // a 'dir' symlink needs a privilege on Windows
    for (const name of readdirSync(REAL_REPO)) {
      if (['cli', '.git', 'node_modules'].includes(name)) continue;
      linkRepoEntry(join(root, name), join(REAL_REPO, name));
    }
    stagedCli = join(cli, 'bin', 'uds.js');
    return sandbox;
  }

  /** A fresh empty directory inside the sandbox. */
  function makeDir(name = 'dir') {
    ensureSandbox();
    const dir = join(sandbox, `${name}-${++counter}`);
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  /**
   * One CLI run: { code, stdout, stderr, netLog: string[], procLog: string[] }.
   * `ui` pins the output language; it defaults to English so assertions do not depend on the machine's LANG.
   * `preloads` is a list of extra CommonJS files loaded with `--require` after the harness's own (a test's fault injector).
   */
  function runCli(args, cwd, { ui = 'en', env: extraEnv = {}, preloads = [], drive = null, idleMs = 700, maxSends = 80 } = {}) {
    ensureSandbox();
    const id = ++counter;
    const home = join(sandbox, `home-${id}`);
    mkdirSync(home, { recursive: true });
    const netFile = join(sandbox, `net-${id}.log`);
    const procFile = join(sandbox, `proc-${id}.log`);
    const env = {
      ...isolatedEnv(home, process.env),
      FORCE_COLOR: '0',
      UDS_NO_UPDATE_CHECK: '1',
      UDS_TEST_NET_LOG: netFile,
      UDS_TEST_PROC_LOG: procFile,
      NODE_OPTIONS: [process.env.NODE_OPTIONS, `--require=${preloadPath}`, ...preloads.map((p) => `--require=${p}`)].filter(Boolean).join(' '),
      ...extraEnv
    };
    const full = [...(ui ? ['--ui-lang', ui] : []), ...args];
    return new Promise((done) => {
      const proc = spawn('node', [stagedCli, ...full], { cwd, env, stdio: [drive ? 'pipe' : 'ignore', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';
      // `drive` answers prompts: when the CLI has been quiet for `idleMs` and the screen ends like a question,
      // `drive(textPrintedSinceLastAnswer)` returns what to type (or null to keep waiting). The screen text
      // is ANSI-stripped. `maxSends` stops a loop that never ends.
      let screen = '';
      let sends = 0;
      let idle = null;
      // Quiet is not enough: on a slow machine the CLI can be quiet while it is still working, and a key typed
      // before the question is drawn waits in the input buffer and answers the NEXT question (the update question
      // of the uds.project.yaml wizard would get the default, no). So a key is typed only when the screen ends
      // the way a question ends: a select or checkbox footer, a (Y/n) confirm, or a text input ending in a colon (with its default, in parentheses, after it).
      // (Whitespace is dropped first: the library wraps a long question at the terminal width, even inside "(y/N)".)
      const endsLikeAQuestion = (text) => /(⏎(select|submit)|\(Y\/n\)|\(y\/N\)|:(\([^()]*\))?)$/.test(text.replace(/\s+/g, ''));
      const armIdle = () => {
        if (!drive) return;
        clearTimeout(idle);
        idle = setTimeout(() => {
          if (proc.exitCode !== null || sends >= maxSends) return;
          const plain = stripAnsi(screen);
          const answer = endsLikeAQuestion(plain) ? drive(plain) : null;
          if (answer !== null && answer !== undefined) {
            sends += 1;
            screen = '';
            proc.stdin.write(answer);
          }
          armIdle();
        }, idleMs);
      };
      proc.stdout.on('data', (d) => { stdout += d.toString(); screen += d.toString(); armIdle(); });
      proc.stderr.on('data', (d) => { stderr += d.toString(); });
      if (drive) { proc.stdin.on('error', () => {}); armIdle(); }
      const timer = setTimeout(() => proc.kill('SIGTERM'), 150000);
      proc.on('close', (code) => {
        clearTimeout(timer);
        clearTimeout(idle);
        const lines = (f) => (existsSync(f) ? readFileSync(f, 'utf-8').split('\n').filter(Boolean) : []);
        done({ code, stdout, stderr, netLog: lines(netFile), procLog: lines(procFile) });
      });
    });
  }

  async function buildTemplate(name) {
    ensureSandbox();
    const dir = join(sandbox, `template-${name}`);
    mkdirSync(join(dir, '.claude'), { recursive: true });
    const run = await runCli(['init', '--yes', '--skills-location', 'project'], dir);
    if (run.code !== 0) throw new Error(`fixture: uds init failed (${run.code}): ${run.stdout}\n${run.stderr}`);
    return dir;
  }

  /** A copy of a project initialised by `uds init --yes --skills-location project` (Claude Code detected, no package.json). */
  async function newProject(name = 'claude') {
    if (!templates[name]) templates[name] = buildTemplate(name);
    const tpl = await templates[name];
    const dir = join(sandbox, `project-${++counter}`);
    cpSync(tpl, dir, { recursive: true, verbatimSymlinks: true });
    return dir;
  }

  function cleanup() {
    if (sandbox && sandbox.includes(`uds-test-${label}-`)) rmSync(sandbox, { recursive: true, force: true });
  }

  return { runCli, newProject, makeDir, cleanup };
}
