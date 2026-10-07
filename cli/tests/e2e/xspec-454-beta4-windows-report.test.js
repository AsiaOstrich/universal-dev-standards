/**
 * E2E: the four defects a Windows tester found in 6.14.0-beta.4 (dev-platform XSPEC-454 R1-R4).
 *
 * Every test spawns the real CLI (`node cli/bin/uds.js ...`) in a throwaway project and reads back what
 * landed on disk / on stdout / in the network and process logs. Nothing here calls a function below the
 * CLI entry.
 *
 *   R1  `uds update --rollback` undoes what `--apply`, `--apply --skills` and `--apply --commands` did —
 *       every file byte for byte, new skill folders removed — and says so item by item.
 *   R2  `uds check` counts a missing/changed skill file against the verdict, and an existing project whose
 *       manifest lists skill files UDS never installed ("phantoms") does not start failing because of it.
 *   R3  `uds audit --offline` exists and makes no network request and starts no `gh`/browser/clipboard process.
 *   R4  `uds update --commands` prints the number of tools and the number of commands as two different
 *       numbers, in every language.
 *
 * What is staged, and why (same as init-every-declared-locale.test.js): a copy of cli/bin + cli/src made at
 * test time, so a mutation of the source is what runs; its repo root is the real repo (symlinks) and it has no
 * `cli/bundled/`. HOME and every XDG_* variable point to a throwaway directory. A preload makes every network
 * call fail at once and logs it, and logs every child process (failing the ones that would reach GitHub, a
 * browser or the clipboard).
 *
 * Every test sets up everything it needs inside itself (the template project is built on first use), so each
 * one also passes when selected on its own.
 *
 * Wires that make these red when cut (each is one line of CLI source):
 *   R1  cli/src/commands/update.js          finalizeBackup(projectPath, backup.backupId);
 *       cli/src/reconciler/plan-executor.js finalizeBackup(projectPath, backupId);
 *   R2  cli/src/commands/check.js           pruneForeignSkillHashes(manifest);
 *       cli/src/commands/check.js           const skillIssues = skillIssuesOf(skillsIntegrity);
 *   R3  cli/bin/uds.js                      if (actionCommand?.opts?.().offline) return;
 *   R4  cli/src/commands/update.js          spinner.succeed(commandsUpdatedMessage(msg, commandsInstallations, result, locations));
 */

import { it, expect, afterAll } from 'vitest';
import { spawn } from 'child_process';
import {
  mkdtempSync, mkdirSync, cpSync, symlinkSync, readdirSync, readFileSync, existsSync, rmSync,
  realpathSync, writeFileSync, lstatSync, readlinkSync
} from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { createHash } from 'crypto';
import { isolatedEnv } from '../../../scripts/lib/isolated-home.mjs';
import { computeFileHash } from '../../src/utils/hasher.js';

const REAL_CLI_DIR = resolve(import.meta.dirname, '../..');
const REAL_REPO = resolve(REAL_CLI_DIR, '..');

// ─────────────────────────── harness ───────────────────────────

/**
 * Preload run before the CLI.
 *  - every http/https/fetch call fails at once (non-retryable code) and its URL goes to UDS_TEST_NET_LOG;
 *  - every child process is logged to UDS_TEST_PROC_LOG; the ones that would reach GitHub, a browser or the
 *    clipboard (gh, open, xdg-open, pbcopy, clip, ...) are logged as DENIED and fail instead of running;
 *  - UDS_TEST_FAKE_TTY=1 makes stdout look like a terminal, which is the only way the "newer version
 *    available" check after a command is allowed to run at all.
 */
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
function denied(file) { return DENY.test(file); }
function fail(kind, file) {
  const e = new Error('command blocked by the test: ' + file);
  e.code = 'ENOENT';
  return e;
}
for (const name of ['execSync', 'execFileSync']) {
  const real = cp[name];
  cp[name] = function (cmd, ...rest) {
    const file = name === 'execSync' ? firstWord(cmd) : base(cmd);
    if (denied(file)) { note(procLog, 'DENIED ' + cmd); throw fail(name, file); }
    note(procLog, 'ran ' + cmd);
    return real.call(this, cmd, ...rest);
  };
}
{
  const real = cp.spawnSync;
  cp.spawnSync = function (cmd, ...rest) {
    if (denied(base(cmd))) { note(procLog, 'DENIED ' + cmd); return { status: null, signal: null, error: fail('spawnSync', cmd), stdout: Buffer.alloc(0), stderr: Buffer.alloc(0), output: null, pid: 0 }; }
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
      setImmediate(() => child.emit('error', fail('spawn', cmd)));
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
      setImmediate(() => { if (cb) cb(fail(name, file), '', ''); else child.emit('error', fail(name, file)); });
      return child;
    }
    note(procLog, 'ran ' + cmd);
    return real.call(this, cmd, ...rest);
  };
}
if (process.env.UDS_TEST_FAKE_TTY === '1') process.stdout.isTTY = true;
`;

let sandbox = null;
let stagedCli = null;
let preloadPath = null;
let templatePromise = null;
let counter = 0;

function ensureSandbox() {
  if (sandbox) return sandbox;
  sandbox = realpathSync(mkdtempSync(join(tmpdir(), 'uds-test-xspec454-')));
  preloadPath = join(sandbox, 'preload.cjs');
  writeFileSync(preloadPath, PRELOAD);
  const root = join(sandbox, 'stage');
  const cli = join(root, 'cli');
  mkdirSync(cli, { recursive: true });
  cpSync(join(REAL_CLI_DIR, 'bin'), join(cli, 'bin'), { recursive: true });
  cpSync(join(REAL_CLI_DIR, 'src'), join(cli, 'src'), { recursive: true });
  for (const f of ['package.json', 'standards-registry.json']) cpSync(join(REAL_CLI_DIR, f), join(cli, f));
  symlinkSync(realpathSync(join(REAL_CLI_DIR, 'node_modules')), join(cli, 'node_modules'), 'dir');
  for (const name of readdirSync(REAL_REPO)) {
    if (['cli', '.git', 'node_modules'].includes(name)) continue;
    symlinkSync(join(REAL_REPO, name), join(root, name));
  }
  stagedCli = join(cli, 'bin', 'uds.js');
  return sandbox;
}

afterAll(() => {
  if (sandbox && sandbox.includes('uds-test-xspec454-')) rmSync(sandbox, { recursive: true, force: true });
});

/** One CLI run: { code, stdout, stderr, netLog: string[], procLog: string[] }. */
function runCli(args, cwd, { fakeTty = false, ui = null } = {}) {
  ensureSandbox();
  const id = ++counter;
  const home = join(sandbox, `home-${id}`);
  mkdirSync(home, { recursive: true });
  const netFile = join(sandbox, `net-${id}.log`);
  const procFile = join(sandbox, `proc-${id}.log`);
  const env = {
    ...isolatedEnv(home, process.env),
    FORCE_COLOR: '0',
    UDS_TEST_NET_LOG: netFile,
    UDS_TEST_PROC_LOG: procFile,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, `--require=${preloadPath}`].filter(Boolean).join(' ')
  };
  if (fakeTty) {
    // The version notice only runs on a terminal, outside CI, and unless the user turned it off.
    env.UDS_TEST_FAKE_TTY = '1';
    delete env.CI;
    delete env.CONTINUOUS_INTEGRATION;
    delete env.UDS_NO_UPDATE_CHECK;
  } else {
    env.UDS_NO_UPDATE_CHECK = '1';
  }
  const full = [...(ui ? ['--ui-lang', ui] : []), ...args];
  return new Promise((done) => {
    const proc = spawn('node', [stagedCli, ...full], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    const timer = setTimeout(() => proc.kill('SIGTERM'), 150000);
    proc.on('close', (code) => {
      clearTimeout(timer);
      const lines = (f) => (existsSync(f) ? readFileSync(f, 'utf-8').split('\n').filter(Boolean) : []);
      done({ code, stdout, stderr, netLog: lines(netFile), procLog: lines(procFile) });
    });
  });
}

/** An initialised project. `claude` adds `.claude/`; AGENTS.md always makes codex and opencode appear. */
async function buildTemplate(name, { claude }) {
  ensureSandbox();
  const dir = join(sandbox, `template-${name}`);
  mkdirSync(dir, { recursive: true });
  if (claude) mkdirSync(join(dir, '.claude'), { recursive: true });
  writeFileSync(join(dir, 'AGENTS.md'), '# project notes\n');
  const run = await runCli(['init', '--yes', '--skills-location', 'project'], dir);
  if (run.code !== 0) throw new Error(`fixture: uds init failed (${run.code}): ${run.stdout}\n${run.stderr}`);
  return dir;
}

const templates = {};
function template(name, opts) {
  if (!templates[name]) templates[name] = buildTemplate(name, opts);
  return templates[name];
}

async function newProject(name, opts) {
  const tpl = await template(name, opts);
  const dir = join(sandbox, `project-${++counter}`);
  cpSync(tpl, dir, { recursive: true, verbatimSymlinks: true });
  return dir;
}

const readJson = (p) => JSON.parse(readFileSync(p, 'utf-8'));
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2));

/** Everything in the project except git and the backups themselves: relative path -> content signature. */
function snapshotTree(root, rel = '', out = new Map()) {
  for (const e of readdirSync(join(root, rel), { withFileTypes: true })) {
    if (e.name === '.git' || e.name.startsWith('.uds-backup-') || e.name === '.uds-backups') continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    const abs = join(root, r);
    if (lstatSync(abs).isSymbolicLink()) out.set(r, `link:${readlinkSync(abs)}`);
    else if (e.isDirectory()) { out.set(r + '/', 'dir'); snapshotTree(root, r, out); }
    else out.set(r, createHash('sha256').update(readFileSync(abs)).digest('hex'));
  }
  return out;
}

/** What differs between two snapshots, as readable lines. Directories only count when they hold nothing. */
function diffTrees(before, after) {
  const lines = [];
  for (const [k, v] of before) {
    if (k.endsWith('/')) continue;
    if (!after.has(k)) lines.push(`missing after: ${k}`);
    else if (after.get(k) !== v) lines.push(`changed: ${k}`);
  }
  for (const k of after.keys()) {
    if (k.endsWith('/')) continue;
    if (!before.has(k)) lines.push(`added: ${k}`);
  }
  for (const k of before.keys()) {
    if (k.endsWith('/') && !after.has(k)) lines.push(`directory missing after: ${k}`);
  }
  for (const k of after.keys()) {
    if (k.endsWith('/') && !before.has(k)) lines.push(`directory added: ${k}`);
  }
  return lines;
}

/** The skills UDS ships (a directory holding SKILL.md), read from the repo, not from the CLI under test. */
function shippedSkills() {
  return new Set(
    readdirSync(join(REAL_REPO, 'skills'), { withFileTypes: true })
      .filter((e) => e.isDirectory() && existsSync(join(REAL_REPO, 'skills', e.name, 'SKILL.md')))
      .map((e) => e.name)
  );
}

const SKILL_ROOTS = [['claude-code', '.claude/skills'], ['codex', '.agents/skills'], ['opencode', '.opencode/skill']];

/**
 * Make an initialised project look like one installed by an OLDER UDS, whose manifest is internally
 * consistent (so `uds check` is clean) while `uds update --apply` has real work to do:
 *   - a standard is an older edition (its recorded hash matches what is on disk);
 *   - the comprehension-ladder skill (not shipped by 6.11.0) is absent everywhere;
 *   - one slash command is absent.
 */
function ageProject(dir) {
  const mPath = join(dir, '.standards', 'manifest.json');
  const m = readJson(mPath);

  const stdRel = '.standards/checkin-standards.ai.yaml';
  const stdAbs = join(dir, stdRel);
  expect(existsSync(stdAbs), 'fixture: the standard to age exists').toBe(true);
  writeFileSync(stdAbs, '# older edition (XSPEC-454 test fixture)\n' + readFileSync(stdAbs, 'utf-8'));
  const h = computeFileHash(stdAbs);
  m.fileHashes[stdRel] = { ...m.fileHashes[stdRel], hash: h.hash, size: h.size };

  for (const [, base] of SKILL_ROOTS) rmSync(join(dir, base, 'comprehension-ladder'), { recursive: true, force: true });
  for (const key of Object.keys(m.skillHashes)) if (key.includes('/comprehension-ladder/')) delete m.skillHashes[key];
  m.skills.names = (m.skills.names || []).filter((n) => n !== 'comprehension-ladder');

  const cmdDir = join(dir, '.opencode', 'command');
  expect(existsSync(join(cmdDir, 'atdd.md')), 'fixture: the command to remove exists').toBe(true);
  rmSync(join(cmdDir, 'atdd.md'));
  delete m.commandHashes['opencode/atdd.md'];
  m.commands.names = (m.commands.names || []).filter((n) => n !== 'atdd');

  writeJson(mPath, m);
}

// Backups live in `.uds-backups/<id>` (XSPEC-456 R7); the ids returned are relative to the project, like `backupId`.
const backupDirs = (dir) => [
  ...readdirSync(dir).filter((n) => n.startsWith('.uds-backup-')),
  ...(existsSync(join(dir, '.uds-backups'))
    ? readdirSync(join(dir, '.uds-backups'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => `.uds-backups/${e.name}`)
    : [])
].sort();

// ─────────────────────────── R1 ───────────────────────────

it('uds update --rollback undoes --apply, --apply --skills and --apply --commands in one go: every file byte for byte, new skill folders gone, check passes (XSPEC-454 R1)', async () => {
  const dir = await newProject('claude', { claude: true });
  ageProject(dir);
  // A skill that is the adopter's own, sitting in the same folder as the ones UDS installs.
  const ownSkill = join(dir, '.claude', 'skills', 'my-own-skill', 'SKILL.md');
  mkdirSync(join(dir, '.claude', 'skills', 'my-own-skill'), { recursive: true });
  writeFileSync(ownSkill, '# mine, as I wrote it before the upgrade\n');

  // Precondition: the aged project is one `uds check` calls clean, and the three steps have real work.
  const clean = await runCli(['check', '--offline', '--ci'], dir);
  expect(clean.code, clean.stdout + clean.stderr).toBe(0);
  expect(clean.stdout).toMatch(/Project is compliant/);
  const before = snapshotTree(dir);

  // The reproduction the tester followed.
  for (const step of [
    ['update', '--apply', '--yes', '--offline'],
    ['update', '--apply', '--yes', '--skills', '--offline'],
    ['update', '--apply', '--yes', '--commands', '--offline']
  ]) {
    const r = await runCli(step, dir);
    expect(r.code, `${step.join(' ')}\n${r.stdout}\n${r.stderr}`).toBe(0);
    expect(r.stdout, step.join(' ')).toMatch(/Backup: \.uds-backups\//);
  }

  // Control arm: the three steps really changed the project (otherwise "identical afterwards" proves nothing).
  const upgraded = diffTrees(before, snapshotTree(dir));
  expect(upgraded.some((l) => /added: .*comprehension-ladder\/SKILL\.md/.test(l)), upgraded.join('\n')).toBe(true);
  expect(upgraded.some((l) => /changed: \.standards\/checkin-standards\.ai\.yaml/.test(l)), upgraded.join('\n')).toBe(true);
  expect(upgraded.some((l) => /added: \.opencode\/command\/atdd\.md/.test(l)), upgraded.join('\n')).toBe(true);
  expect(upgraded.some((l) => /changed: \.standards\/manifest\.json/.test(l)), upgraded.join('\n')).toBe(true);
  expect(backupDirs(dir).length, 'one backup per step').toBe(3);

  // The adopter keeps working after the upgrade. The rollback is of what UDS did, so it must not write
  // an older copy of the adopter's own skill back over that edit.
  writeFileSync(ownSkill, '# mine, edited after the upgrade\n');

  const rb = await runCli(['update', '--rollback', '--yes'], dir);
  expect(rb.code, rb.stdout + rb.stderr).toBe(0);
  expect(rb.stdout).toMatch(/Rollback successful/);
  expect(rb.stdout).toMatch(/3 consecutive updates were undone together/);
  expect(rb.stdout).not.toMatch(/Not restored|did NOT complete/);

  // Read back: the whole project, not the files the old rollback happened to remember.
  const afterRollback = diffTrees(before, snapshotTree(dir));
  expect(afterRollback, 'everything UDS changed is back; the only difference is the adopter\'s own edit').toEqual(['changed: .claude/skills/my-own-skill/SKILL.md']);
  expect(readFileSync(ownSkill, 'utf-8')).toBe('# mine, edited after the upgrade\n');

  const after = await runCli(['check', '--offline', '--ci'], dir);
  expect(after.code, after.stdout).toBe(0);
  expect(after.stdout).toMatch(/Project is compliant/);
  expect(after.stdout).not.toMatch(/\((modified|missing)\)/);
}, 600000);

it('uds update --rollback does not end in success when a backup cannot be restored: it names the file, exits non-zero and says how to retry (XSPEC-454 R1)', async () => {
  const dir = await newProject('claude', { claude: true });
  ageProject(dir);
  for (const step of [
    ['update', '--apply', '--yes', '--offline'],
    ['update', '--apply', '--yes', '--commands', '--offline']
  ]) {
    const r = await runCli(step, dir);
    expect(r.code, `${step.join(' ')}\n${r.stdout}`).toBe(0);
  }
  const [oldest] = backupDirs(dir);
  expect(oldest, 'the first step left a backup').toBeTruthy();
  // The oldest backup loses the manifest it was supposed to give back.
  const lost = join(dir, oldest, '.standards', 'manifest.json');
  expect(existsSync(lost), 'fixture: the backup holds the manifest').toBe(true);
  rmSync(lost);

  const rb = await runCli(['update', '--rollback', '--yes'], dir);
  expect(rb.code, rb.stdout).not.toBe(0);
  expect(rb.stdout).not.toMatch(/Rollback successful/);
  expect(rb.stdout).toMatch(/Rollback did NOT complete/);
  expect(rb.stdout).toMatch(/Backup file missing: \.standards\/manifest\.json/);
  expect(rb.stdout).toMatch(/run `uds update --rollback` again/);
}, 600000);

// ─────────────────────────── R2 ───────────────────────────

it('uds check --ci passes for an existing project whose manifest lists phantom skill files, and uds update then drops those records (XSPEC-454 R2)', async () => {
  const dir = await newProject('claude', { claude: true });
  ageProject(dir);

  // What the tester's project had: records for files an old CLI copied into the skills folder and a later
  // update removed (agents/, workflows/, _shared/, for two tools), plus a record for a skill that is the
  // adopter's own and that the adopter has since edited.
  const mPath = join(dir, '.standards', 'manifest.json');
  const m = readJson(mPath);
  const phantomFiles = [
    'agents/README.md', 'agents/code-architect.md', 'agents/reviewer.md',
    'workflows/README.md', 'workflows/release.workflow.yaml', '_shared/README.md'
  ];
  const phantomKeys = [];
  for (const agent of ['claude-code', 'opencode']) {
    for (const f of phantomFiles) {
      const key = `${agent}/project/${f}`;
      phantomKeys.push(key);
      m.skillHashes[key] = { hash: 'sha256:' + '0'.repeat(64), size: 10, installedAt: '2026-01-01T00:00:00.000Z' };
    }
  }
  mkdirSync(join(dir, '.claude', 'skills', 'my-own-skill'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'skills', 'my-own-skill', 'SKILL.md'), '# mine, as I first wrote it\n');
  m.skillHashes['claude-code/project/my-own-skill/SKILL.md'] = { hash: 'sha256:' + '1'.repeat(64), size: 5, installedAt: '2026-01-01T00:00:00.000Z' };
  writeJson(mPath, m);

  // 1. check: the phantoms are not listed and do not fail the verdict.
  const first = await runCli(['check', '--offline', '--ci'], dir);
  expect(first.code, first.stdout).toBe(0);
  expect(first.stdout).toMatch(/Project is compliant/);
  expect(first.stdout).not.toMatch(/project\/(agents|workflows|_shared)\//);
  expect(first.stdout).not.toMatch(/my-own-skill/);
  expect(first.stdout, 'it says what it ignored').toMatch(/\d+ skill record\(s\) ignored/);

  // 2. the upgrade: the records are dropped from the manifest, for good.
  const up = await runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(up.code, up.stdout + up.stderr).toBe(0);
  const shipped = shippedSkills();
  const kept = Object.keys(readJson(mPath).skillHashes);
  const foreign = kept.filter((k) => !shipped.has(k.split('/')[2]));
  expect(foreign, `records that do not describe a shipped skill: ${foreign.join(', ')}`).toEqual([]);
  for (const k of phantomKeys) expect(kept, k).not.toContain(k);
  expect(kept.length, 'the real skill records are all still there').toBeGreaterThan(100);

  // 3. and afterwards check is still green (it does not suddenly fail after the upgrade).
  const second = await runCli(['check', '--offline', '--ci'], dir);
  expect(second.code, second.stdout).toBe(0);
  expect(second.stdout).toMatch(/Project is compliant/);
  expect(second.stdout).not.toMatch(/ignored/);
}, 600000);

it('uds check --ci names a deleted skill file and an edited one, does not say the project is compliant, exits 1, and passes again after uds update --skills (XSPEC-454 R2)', async () => {
  const dir = await newProject('claude', { claude: true });

  const baseline = await runCli(['check', '--offline', '--ci'], dir);
  expect(baseline.code, baseline.stdout).toBe(0);
  expect(baseline.stdout).toMatch(/Project is compliant/);

  rmSync(join(dir, '.claude', 'skills', 'commit-standards', 'SKILL.md'));
  const edited = join(dir, '.agents', 'skills', 'testing-guide', 'SKILL.md');
  writeFileSync(edited, readFileSync(edited, 'utf-8') + '\nan edit that is not UDS\n');

  const bad = await runCli(['check', '--offline', '--ci'], dir);
  expect(bad.code, bad.stdout).toBe(1);
  expect(bad.stdout).toMatch(/claude-code\/project\/commit-standards\/SKILL\.md \(missing\)/);
  expect(bad.stdout).toMatch(/codex\/project\/testing-guide\/SKILL\.md \(modified\)/);
  expect(bad.stdout).not.toMatch(/Project is compliant/);
  expect(bad.stdout).toMatch(/Some issues detected/);
  expect(bad.stdout).toMatch(/uds update --apply --skills/);

  // Without --ci the exit code stays 0 (that is how `check` treats every other kind of finding), but the
  // words must not claim compliance.
  const plain = await runCli(['check', '--offline'], dir);
  expect(plain.stdout).not.toMatch(/Project is compliant/);
  expect(plain.stdout).toMatch(/commit-standards\/SKILL\.md \(missing\)/);

  // The way back that the message points at.
  const fix = await runCli(['update', '--apply', '--yes', '--skills', '--offline'], dir);
  expect(fix.code, fix.stdout + fix.stderr).toBe(0);
  const good = await runCli(['check', '--offline', '--ci'], dir);
  expect(good.code, good.stdout).toBe(0);
  expect(good.stdout).toMatch(/Project is compliant/);
}, 600000);

it('uds init records only the skills it installed: the adopter\'s own skill folder and a stray agents/ folder in the skills folder are not tracked, so editing them cannot fail check (XSPEC-454 R2)', async () => {
  ensureSandbox();
  const dir = join(sandbox, `project-${++counter}`);
  mkdirSync(join(dir, '.claude', 'skills', 'my-own-skill'), { recursive: true });
  mkdirSync(join(dir, '.claude', 'skills', 'agents'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'skills', 'my-own-skill', 'SKILL.md'), '# mine\n');
  writeFileSync(join(dir, '.claude', 'skills', 'agents', 'README.md'), '# left by an older tool\n');

  const init = await runCli(['init', '--yes', '--skills-location', 'project'], dir);
  expect(init.code, init.stdout + init.stderr).toBe(0);

  const shipped = shippedSkills();
  const keys = Object.keys(readJson(join(dir, '.standards', 'manifest.json')).skillHashes);
  expect(keys.length, 'skill records were written at all').toBeGreaterThan(100);
  const foreign = keys.filter((k) => !shipped.has(k.split('/')[2]));
  expect(foreign, `records that do not describe a shipped skill: ${foreign.join(', ')}`).toEqual([]);

  // Editing what is yours, or what an older tool left, does not turn the project red.
  writeFileSync(join(dir, '.claude', 'skills', 'my-own-skill', 'SKILL.md'), '# mine, edited\n');
  rmSync(join(dir, '.claude', 'skills', 'agents'), { recursive: true, force: true });
  const check = await runCli(['check', '--offline', '--ci'], dir);
  expect(check.code, check.stdout).toBe(0);
  expect(check.stdout).toMatch(/Project is compliant/);
}, 300000);

it('uds check --ci ignores command records it cannot vouch for (a retired command, commands installed at user level), and uds update then drops the retired one (XSPEC-454 R2)', async () => {
  const dir = await newProject('agents-only', { claude: false });
  ageProject(dir);

  // What an older project can carry: a record for a command UDS no longer ships (its file is long gone),
  // and records for commands that were installed at user level — the files are in the home directory,
  // so inside the project they can only ever read "missing".
  const mPath = join(dir, '.standards', 'manifest.json');
  const m = readJson(mPath);
  const rec = { hash: 'sha256:' + '0'.repeat(64), size: 10, installedAt: '2026-01-01T00:00:00.000Z' };
  m.commandHashes['opencode/retired-command.md'] = rec;
  m.commandHashes['gemini-cli/commit.toml'] = rec;
  m.commands.installations = [...m.commands.installations, { agent: 'gemini-cli', level: 'user' }];
  writeJson(mPath, m);

  const first = await runCli(['check', '--offline', '--ci'], dir);
  expect(first.code, first.stdout).toBe(0);
  expect(first.stdout).toMatch(/Project is compliant/);
  expect(first.stdout).not.toMatch(/retired-command|gemini-cli\/commit\.toml/);
  expect(first.stdout, 'it says what it set aside').toMatch(/1 command record\(s\) ignored: they describe commands UDS does not ship/);
  expect(first.stdout).toMatch(/1 command record\(s\) ignored: those commands are installed at user level/);

  const up = await runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(up.code, up.stdout + up.stderr).toBe(0);
  const after = readJson(mPath).commandHashes;
  expect(Object.keys(after), 'the retired command record is gone for good').not.toContain('opencode/retired-command.md');
  expect(Object.keys(after).filter((k) => k.startsWith('opencode/')).length, 'the real command records are all still there').toBeGreaterThan(40);

  const second = await runCli(['check', '--offline', '--ci'], dir);
  expect(second.code, second.stdout).toBe(0);
  expect(second.stdout).toMatch(/Project is compliant/);
  expect(second.stdout).not.toMatch(/does not ship/);
}, 600000);

it('uds check --ci names a deleted command file and an edited one, does not say the project is compliant, exits 1, and passes again after uds update --commands (XSPEC-454 R2)', async () => {
  const dir = await newProject('agents-only', { claude: false });

  const baseline = await runCli(['check', '--offline', '--ci'], dir);
  expect(baseline.code, baseline.stdout).toBe(0);
  expect(baseline.stdout).toMatch(/Project is compliant/);

  rmSync(join(dir, '.opencode', 'command', 'commit.md'));
  const edited = join(dir, '.opencode', 'command', 'tdd.md');
  writeFileSync(edited, readFileSync(edited, 'utf-8') + '\nan edit that is not UDS\n');

  const bad = await runCli(['check', '--offline', '--ci'], dir);
  expect(bad.code, bad.stdout).toBe(1);
  expect(bad.stdout).toMatch(/opencode\/commit\.md \(missing\)/);
  expect(bad.stdout).toMatch(/opencode\/tdd\.md \(modified\)/);
  expect(bad.stdout).not.toMatch(/Project is compliant/);
  expect(bad.stdout).toMatch(/Some issues detected/);
  expect(bad.stdout).toMatch(/uds update --apply --commands/);

  const plain = await runCli(['check', '--offline'], dir);
  expect(plain.stdout).not.toMatch(/Project is compliant/);

  const fix = await runCli(['update', '--apply', '--yes', '--commands', '--offline'], dir);
  expect(fix.code, fix.stdout + fix.stderr).toBe(0);
  const good = await runCli(['check', '--offline', '--ci'], dir);
  expect(good.code, good.stdout).toBe(0);
  expect(good.stdout).toMatch(/Project is compliant/);
}, 600000);

// ─────────────────────────── R3 ───────────────────────────

it('uds audit --offline runs to completion and makes no network request, while the same run without --offline does ask the registry (XSPEC-454 R3)', async () => {
  const dir = await newProject('claude', { claude: true });

  // Control arm first: in this harness (terminal, not CI, update notice not disabled) the CLI DOES go to the
  // registry when it is allowed to. If it did not, "no request" below would prove nothing.
  const online = await runCli(['audit', '--quiet'], dir, { fakeTty: true });
  expect(online.code, online.stdout + online.stderr).toBe(0);
  expect(online.netLog.join('\n'), 'the harness can see the registry request').toMatch(/registry\.npmjs\.org/);

  const offline = await runCli(['audit', '--offline'], dir, { fakeTty: true });
  expect(offline.code, `${offline.stdout}\n${offline.stderr}`).toBe(0);
  expect(offline.stderr).not.toMatch(/unknown option/);
  expect(offline.stdout, 'the audit itself ran').toMatch(/Health/i);
  expect(offline.netLog, 'audit --offline asked the network for something').toEqual([]);

  // The same promise on the command the flag already existed on: it used to be ignored by the version notice.
  const check = await runCli(['check', '--offline'], dir, { fakeTty: true });
  expect(check.code, check.stdout + check.stderr).toBe(0);
  expect(check.netLog, 'check --offline asked the network for something').toEqual([]);
}, 300000);

it('uds audit --offline --report says it does not submit in every language, and starts no gh, browser or clipboard process (XSPEC-454 R3)', async () => {
  const dir = await newProject('claude', { claude: true });
  // A healthy project has nothing to report, and the report path is never reached. Give it a finding.
  rmSync(join(dir, '.standards', 'checkin-standards.ai.yaml'));

  // Control arm: without --offline the report path DOES reach for gh / the clipboard, and the harness sees it.
  const online = await runCli(['audit', '--report', '--yes'], dir);
  expect(online.procLog.filter((l) => l.startsWith('DENIED')).length, `online report: ${online.procLog.join(' | ')}`).toBeGreaterThan(0);

  for (const [ui, notice] of [
    ['en', /Offline mode: the report is not submitted/],
    ['zh-tw', /離線模式：不提交回報/],
    ['zh-cn', /离线模式：不提交回报/]
  ]) {
    const r = await runCli(['audit', '--offline', '--report', '--yes'], dir, { fakeTty: true, ui });
    expect(r.code, `${ui}: ${r.stdout}\n${r.stderr}`).toBe(0);
    expect(r.stdout, ui).toMatch(notice);
    expect(r.procLog.filter((l) => l.startsWith('DENIED')), `${ui}: a process that reaches GitHub, a browser or the clipboard was started`).toEqual([]);
    expect(r.netLog, ui).toEqual([]);
  }

  // A preview is not a submission, so it still works offline.
  const dry = await runCli(['audit', '--offline', '--report', '--dry-run'], dir);
  expect(dry.code, dry.stdout + dry.stderr).toBe(0);
  expect(dry.stdout).toMatch(/Dry run/);
  expect(dry.procLog.filter((l) => l.startsWith('DENIED'))).toEqual([]);
}, 300000);

// ─────────────────────────── R4 ───────────────────────────

it('uds update --commands says how many tools and how many commands, as two different numbers, in English, Traditional and Simplified Chinese (XSPEC-454 R4)', async () => {
  // Only OpenCode takes slash commands here: AGENTS.md is the only marker, there is no .claude/.
  const dir = await newProject('agents-only', { claude: false });
  const m = readJson(join(dir, '.standards', 'manifest.json'));
  const commandTools = [...new Set(m.commands.installations.map((i) => i.agent))];
  expect(commandTools, 'fixture: exactly one tool takes commands').toEqual(['opencode']);
  const commandsOnDisk = readdirSync(join(dir, '.opencode', 'command')).filter((f) => f.endsWith('.md')).length;
  expect(commandsOnDisk, 'fixture: many commands, so tools and commands cannot be confused').toBeGreaterThan(20);

  const cases = [
    ['en', new RegExp(`Updated ${commandsOnDisk} commands for 1 AI tool\\(s\\)`), new RegExp(`${commandsOnDisk} AI tools`)],
    ['zh-tw', new RegExp(`已為 1 個 AI 工具更新 ${commandsOnDisk} 個斜線命令`), new RegExp(`${commandsOnDisk} 個 AI 工具`)],
    ['zh-cn', new RegExp(`已为 1 个 AI 工具更新 ${commandsOnDisk} 个斜线命令`), new RegExp(`${commandsOnDisk} 个 AI 工具`)]
  ];
  for (const [ui, expected, wrong] of cases) {
    const r = await runCli(['update', '--apply', '--yes', '--commands', '--offline'], dir, { ui });
    expect(r.code, `${ui}: ${r.stdout}\n${r.stderr}`).toBe(0);
    expect(r.stdout, ui).toMatch(expected);
    expect(r.stdout, `${ui}: the command count must not be reported as a tool count`).not.toMatch(wrong);
  }
}, 300000);
