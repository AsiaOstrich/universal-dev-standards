/**
 * Run the steps and judge each one (dev-platform XSPEC-469 R2 and R3).
 *
 * A step is one command plus what must be true afterwards: the exit code, text that must / must not be in the
 * output, files to read back. Steps that name the same `workspace` share a folder and a throwaway home, in file
 * order (an `init`, then an `update`); every other step gets its own. A failed setup step (`smoke: true`) fails the
 * steps after it in its workspace without running them; a failed feature step does not. No step touches the real home folder.
 *
 * Statuses: pass | fail | skip (not this platform) | unconfirmed (a person has to look, nobody answered) |
 * human-confirmed (a person looked and said yes). `unconfirmed` is NOT a pass and never counts as one.
 *
 * Standard library only.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { isolatedEnv } from '../../lib/isolated-home.mjs';
import { runProcess } from './process.mjs';
import { appliesTo } from './steps.mjs';

const HOME_SUBDIRS = ['AppData/Roaming', 'AppData/Local', '.config', '.local/share', '.cache', '.local/state'];
/** git variables that, when this program is started from a hook, would point a sandbox `git` at the caller's repository. */
const GIT_LEAK_KEYS = ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_PREFIX', 'GIT_OBJECT_DIRECTORY', 'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_ALTERNATE_OBJECT_DIRECTORIES'];

const toPosix = (p) => p.split(sep).join('/');

/**
 * `{node}` `{bin}` `{pkg}` `{work}` `{home}` `{sandbox}` (and `{nodePosix}` `{binPosix}` `{workPosix}` `{homePosix}`: the same with
 * forward slashes, for text a POSIX shell or a YAML file will read), and `{shipped}`: the folder that
 * holds the standards, skills and locale docs the package ships (`<pkg>/bundled` in a published package; the
 * repository root when the package under test is a source checkout).
 */
export function expandTokens(text, tokens) {
  return String(text).replace(/\{(node|nodePosix|bin|binPosix|pkg|shipped|work|workPosix|home|homePosix|sandbox)\}/g, (_, k) => tokens[k]);
}

const isInside = (base, target) => {
  const back = relative(resolve(base), resolve(target));
  return back === '' || (!back.startsWith('..') && !isAbsolute(back));
};

/** Resolve a relative path under `base`; refuse to leave it. */
export function safeJoin(base, rel) {
  if (isAbsolute(rel)) throw new Error(`path must be relative: ${rel}`);
  const full = resolve(base, rel);
  const back = relative(base, full);
  if (back === '' ? false : back.startsWith('..') || isAbsolute(back)) throw new Error(`path leaves its folder: ${rel}`);
  return full;
}

/** `<pkg>/bundled` for a published package; the repository root (one level above `cli/`) for a source checkout. */
export function shippedDir(pkgDir) {
  const bundled = join(pkgDir, 'bundled');
  return existsSync(bundled) ? bundled : dirname(pkgDir);
}

/** Make the folder and home of a workspace, once. */
export function ensureWorkspace(sandbox, name) {
  const work = join(sandbox, 'work', name);
  const home = join(sandbox, 'home', name);
  mkdirSync(work, { recursive: true });
  mkdirSync(home, { recursive: true });
  for (const d of HOME_SUBDIRS) mkdirSync(join(home, d), { recursive: true });
  return { work, home };
}

export function stepEnv({ home, extra = {}, base = process.env }) {
  const env = isolatedEnv(home, base);
  for (const k of GIT_LEAK_KEYS) delete env[k];
  Object.assign(env, {
    UDS_NO_UPDATE_CHECK: '1',
    UDS_LOCALE: 'en',
    LANG: 'en_US.UTF-8',
    LC_ALL: 'en_US.UTF-8',
    NO_COLOR: '1',
    FORCE_COLOR: '0',
    NO_UPDATE_NOTIFIER: '1',
    GIT_AUTHOR_NAME: 'UDS Acceptance',
    GIT_AUTHOR_EMAIL: 'acceptance@example.invalid',
    GIT_COMMITTER_NAME: 'UDS Acceptance',
    GIT_COMMITTER_EMAIL: 'acceptance@example.invalid',
    GIT_CONFIG_NOSYSTEM: '1',
    ...extra,
  });
  return env;
}

/** Run the `prepare` operations of a step. Each writes inside the step's folder or throwaway home. */
export function applyPrepare(ops, tokens) {
  for (const op of ops || []) {
    if (typeof op.writeFile === 'string') {
      const base = op.in === 'home' ? tokens.home : tokens.work;
      const file = safeJoin(base, op.writeFile);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, expandTokens(op.content ?? '', tokens), { encoding: 'utf-8', mode: op.executable ? 0o755 : 0o644 });
    } else if (typeof op.removeFile === 'string') {
      rmSync(safeJoin(op.in === 'home' ? tokens.home : tokens.work, op.removeFile), { recursive: true, force: true });
    } else if (typeof op.mkdir === 'string') {
      mkdirSync(safeJoin(op.in === 'home' ? tokens.home : tokens.work, op.mkdir), { recursive: true });
    } else if (Array.isArray(op.git) && op.git.length) {
      // run git in the step's folder (stage a file, for example); a failure stops the step with git's own message
      const r = spawnSync('git', op.git.map((a) => expandTokens(a, tokens)), { cwd: tokens.work, env: stepEnv({ home: tokens.home }), encoding: 'utf-8', windowsHide: true });
      if (r.status !== 0) throw new Error(`git ${op.git.join(' ')} failed (${r.error ? r.error.message : r.stderr.trim() || `exit ${r.status}`})`);
    } else if (op.gitInit === true) {
      // a repository for steps that need one (no commit is made); same environment as the steps
      const r = spawnSync('git', ['init', '-q'], { cwd: tokens.work, env: stepEnv({ home: tokens.home }), encoding: 'utf-8', windowsHide: true });
      if (r.status !== 0) throw new Error(`gitInit: git init failed (${r.error ? r.error.message : r.stderr.trim() || `exit ${r.status}`})`);
    } else if (op.setManifest && typeof op.setManifest === 'object') {
      // set fields of .standards/manifest.json by dotted key, e.g. {"upstream.version": "6.0.0"} (an older project)
      const manifestPath = safeJoin(tokens.work, '.standards/manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      for (const [dotted, value] of Object.entries(op.setManifest)) {
        const keys = dotted.split('.');
        let node = manifest;
        for (const k of keys.slice(0, -1)) {
          if (typeof node[k] !== 'object' || node[k] === null) throw new Error(`setManifest: "${dotted}" — "${k}" is not an object in the manifest`);
          node = node[k];
        }
        node[keys[keys.length - 1]] = value;
      }
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
    } else if (op.manifestPush && typeof op.manifestPush === 'object') {
      // append names to arrays of .standards/manifest.json by dotted key, e.g. {"skills.names": ["_shared"]} (ghost names)
      const manifestPath = safeJoin(tokens.work, '.standards/manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      for (const [dotted, values] of Object.entries(op.manifestPush)) {
        let node = manifest;
        const keys = dotted.split('.');
        for (const k of keys.slice(0, -1)) node = node[k];
        const list = node && node[keys[keys.length - 1]];
        if (!Array.isArray(list)) throw new Error(`manifestPush: "${dotted}" is not a list in the manifest`);
        for (const v of values) if (!list.includes(v)) list.push(v);
      }
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
    } else if (typeof op.forgetStandard === 'string') {
      // Make a project look like one set up by an older UDS that never had this standard: delete the file and
      // every manifest trace of it. (What `uds update --plan` then calls "available upstream, not installed".)
      const id = op.forgetStandard;
      const manifestPath = safeJoin(tokens.work, '.standards/manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      const named = (entry) => entry === id || entry.endsWith(`/${id}.ai.yaml`) || entry.endsWith(`/${id}.md`);
      const before = manifest.standards.length;
      manifest.standards = manifest.standards.filter((e) => !named(e));
      for (const key of Object.keys(manifest.fileHashes || {})) if (key.endsWith(`/${id}.ai.yaml`) || key.endsWith(`/${id}.md`)) delete manifest.fileHashes[key];
      if (manifest.standards.length === before) throw new Error(`forgetStandard: the manifest does not list "${id}"`);
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
      rmSync(safeJoin(tokens.work, `.standards/${id}.ai.yaml`), { force: true });
      rmSync(safeJoin(tokens.work, `.standards/${id}.md`), { force: true });
    } else {
      throw new Error(`unknown prepare operation: ${JSON.stringify(op)}`);
    }
  }
}

const normalizeNewlines = (s) => String(s).replace(/\r\n/g, '\n');

/** What the command wrote, stdout then stderr, newlines normalised so a Windows CRLF does not break a match. */
export function combinedOutput(run) {
  const out = normalizeNewlines(run.stdout || '');
  const err = normalizeNewlines(run.stderr || '');
  return out && err ? `${out}\n${err}` : out + err;
}

/** @returns {string[]} the expectations that did not hold; empty = all held */
export function evaluateExpect(expect = {}, run, tokens) {
  const failures = [];
  const wanted = expect.exit === undefined ? [0] : [].concat(expect.exit);
  if (run.spawnError) failures.push(`could not start the command: ${run.spawnError}`);
  else if (run.timedOut) failures.push('timed out');
  else if (!wanted.includes(run.exitCode)) failures.push(`exit code ${run.exitCode === null ? `none (signal ${run.signal})` : run.exitCode}, expected ${wanted.join(' or ')}`);
  const text = combinedOutput(run);
  for (const needle of (expect.contains || []).map((n) => expandTokens(n, tokens))) {
    if (!text.includes(needle)) failures.push(`output does not contain ${JSON.stringify(needle)}`);
  }
  for (const needle of (expect.notContains || []).map((n) => expandTokens(n, tokens))) {
    if (text.includes(needle)) failures.push(`output contains ${JSON.stringify(needle)}, which it must not`);
  }
  for (const pattern of expect.matches || []) {
    if (!new RegExp(pattern, 'm').test(text)) failures.push(`output does not match /${pattern}/`);
  }
  for (const f of expect.files || []) {
    let full;
    try {
      const expanded = expandTokens(f.path, tokens);
      // a file the package ships may be read by absolute path (after {shipped}/{pkg}); anything else stays inside the step's folder
      full = isAbsolute(expanded) && [tokens.shipped, tokens.pkg].some((root) => isInside(root, expanded)) ? expanded : safeJoin(tokens.work, expanded);
    } catch (e) { failures.push(`file ${f.path}: ${e.message}`); continue; }
    const mustExist = f.exists !== false;
    const there = existsSync(full);
    if (mustExist && !there) { failures.push(`file ${f.path} was not created`); continue; }
    if (!mustExist) {
      if (there) failures.push(`file ${f.path} exists, expected it to be absent`);
      continue;
    }
    if (!(f.contains || []).length && !(f.notContains || []).length) continue; // existence was the whole check (it may be a folder)
    const content = normalizeNewlines(readFileSync(full, 'utf-8'));
    for (const needle of f.contains || []) if (!content.includes(needle)) failures.push(`file ${f.path} does not contain ${JSON.stringify(needle)}`);
    for (const needle of f.notContains || []) if (content.includes(needle)) failures.push(`file ${f.path} contains ${JSON.stringify(needle)}, which it must not`);
  }
  return failures;
}

const EXCERPT_HEAD = 2000;
const EXCERPT_TAIL = 800;

/** A short, path-scrubbed piece of the output for the report. */
export function excerpt(text, scrub = []) {
  let t = normalizeNewlines(text).trim();
  for (const [from, to] of scrub) if (from) t = t.split(from).join(to);
  if (t.length <= EXCERPT_HEAD + EXCERPT_TAIL) return t;
  return `${t.slice(0, EXCERPT_HEAD)}\n... (${t.length - EXCERPT_HEAD - EXCERPT_TAIL} characters omitted) ...\n${t.slice(-EXCERPT_TAIL)}`;
}

/** The command line as a person would type it (for the report; never executed from this string). */
export function displayCommand(step) {
  if (step.inspect) return '(read the files; no command | 讀檔，不執行指令)';
  const parts = step.uds ? ['uds', ...step.uds] : step.shim ? ['uds', ...step.shim] : step.run;
  return parts.map((p) => (/[\s"']/.test(p) ? JSON.stringify(p) : p)).join(' ');
}

const YES = /^(y|yes|ok|okay|是|對|通過|正常)$/i;
const NO = /^(n|no|否|不|不對|有問題)$/i;
export function parseAnswer(raw) {
  if (raw === undefined || raw === null) return null;
  const a = String(raw).trim();
  if (YES.test(a)) return 'yes';
  if (NO.test(a)) return 'no';
  return null;
}

/**
 * Run every step in order.
 *
 * @param {{ steps: object[], sandbox: string, binPath: string, pkgDir: string, shimPath?: string|null, platform: string, answers?: Record<string,string>, ask?: ((step: object, run: object) => Promise<string|null>)|null, timeoutMs?: number, log?: (line: string) => void, only?: string[]|null }} o
 */
export async function runSteps({ steps, sandbox, binPath, pkgDir, shimPath = null, platform, answers = {}, ask = null, timeoutMs = 120000, log = () => {}, only = null }) {
  const results = [];
  const failedWorkspaces = new Map();
  const wsCache = new Map();
  const scrubBase = [[sandbox, '<sandbox>']];
  if (sandbox.startsWith('/private/')) scrubBase.push([sandbox.slice('/private'.length), '<sandbox>']);

  for (const step of steps) {
    const base = { id: step.id, title: step.title, titleZh: step.titleZh, platform: step.platform, changelog: step.changelog || [], command: displayCommand(step) };
    if (only && !only.includes(step.id)) continue;
    if (!appliesTo(step, platform)) {
      results.push({ ...base, ran: false, status: 'skip', reason: `step is for ${step.platform}; this machine is ${platform}`, failures: [], exitCode: null, durationMs: 0, output: '' });
      continue;
    }
    if (step.shim && !shimPath) {
      results.push({ ...base, ran: false, status: 'skip', reason: 'this package was not installed through npm (--local-bin or an injected installer), so there is no `uds` command on a path to start', failures: [], exitCode: null, durationMs: 0, output: '' });
      continue;
    }
    const wsName = step.workspace || step.id;
    if (!wsCache.has(wsName)) wsCache.set(wsName, ensureWorkspace(sandbox, wsName));
    const { work, home } = wsCache.get(wsName);
    const tokens = { node: process.execPath, nodePosix: toPosix(process.execPath), bin: binPath, binPosix: toPosix(binPath), pkg: pkgDir, shipped: shippedDir(pkgDir), work, workPosix: toPosix(work), home, homePosix: toPosix(home), sandbox };
    const scrub = [...scrubBase, [work, '<work>'], [home, '<home>']];
    if (failedWorkspaces.has(wsName)) {
      results.push({ ...base, ran: false, status: 'fail', failures: [`an earlier step of the same workspace (${failedWorkspaces.get(wsName)}) failed, so this one could not run`], exitCode: null, durationMs: 0, output: '' });
      continue;
    }
    let status;
    let failures = [];
    let run = { exitCode: null, stdout: '', stderr: '', durationMs: 0, signal: null };
    let humanRecord;
    try {
      applyPrepare(step.prepare, tokens);
      const interactive = typeof ask === 'function';
      const inherit = Boolean(step.human && step.human.inherit && interactive);
      log(`  ... ${step.id}`);
      if (step.inspect) {
        // no command: read files the package shipped (or the earlier steps left) and judge them
        run = { exitCode: 0, signal: null, stdout: '', stderr: '', timedOut: false, spawnError: null, durationMs: 0 };
      } else {
        let argv;
        let viaShell = false;
        if (step.shim) {
          // the command a person types: node_modules/.bin/uds (uds.cmd on Windows, which only a shell can start)
          if (!existsSync(shimPath)) throw new Error(`npm installed no ${shimPath}: the package's "bin" did not become a command`);
          argv = [shimPath, ...step.shim.map((a) => expandTokens(a, tokens))];
          viaShell = process.platform === 'win32';
        } else {
          argv = step.uds ? [process.execPath, binPath, ...step.uds.map((a) => expandTokens(a, tokens))] : step.run.map((a) => expandTokens(a, tokens));
        }
        run = await runProcess({
          file: viaShell ? `"${argv[0]}"` : argv[0],
          args: argv.slice(1),
          shell: viaShell,
          cwd: step.cwd ? safeJoin(work, expandTokens(step.cwd, tokens)) : work,
          env: stepEnv({ home, extra: Object.fromEntries(Object.entries(step.env || {}).map(([k, v]) => [k, expandTokens(v, tokens)])) }),
          stdin: step.stdin === undefined ? undefined : expandTokens(step.stdin, tokens),
          timeoutMs: (step.timeoutSec ? step.timeoutSec * 1000 : timeoutMs),
          inherit,
        });
      }
      failures = inherit ? evaluateExpect({ exit: (step.expect || {}).exit }, run, tokens) : evaluateExpect(step.expect, run, tokens);
      status = failures.length ? 'fail' : 'pass';
      if (status === 'pass' && step.human) {
        let answer = parseAnswer(answers[step.id]);
        if (answer === null && interactive) answer = parseAnswer(await ask(step, run));
        humanRecord = { prompt: step.human.prompt, promptZh: step.human.promptZh, answer: answer || 'none' };
        if (answer === 'yes') status = 'human-confirmed';
        else if (answer === 'no') { status = 'fail'; failures.push('a person looked at it and said it is not right'); }
        else status = 'unconfirmed';
      }
    } catch (e) {
      status = 'fail';
      failures.push(`the step could not be set up or run: ${e.message}`);
    }
    // Only a failed SETUP step (marked smoke: the init a workspace is built on) blocks the steps after it. A feature step
    // that fails does not: the next steps stand or fall on their own, so one missing feature is one red line, not thirty.
    if (status === 'fail' && step.smoke) failedWorkspaces.set(wsName, step.id);
    results.push({
      ...base,
      ran: true,
      status,
      failures,
      exitCode: run.exitCode,
      durationMs: run.durationMs,
      output: excerpt(combinedOutput(run), scrub),
      ...(humanRecord ? { human: humanRecord } : {}),
    });
  }
  return results;
}
