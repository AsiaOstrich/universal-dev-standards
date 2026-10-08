/**
 * E2E: the Chinese skill texts are in the npm package and install with the network cut; a copy of UDS that
 * lacks them installs English and SAYS so (dev-platform XSPEC-468 R3).
 *
 * What the spec assumed, and what was measured: XSPEC-468 R3 was written on the belief that the Traditional and
 * Simplified Chinese texts (about 4.6 MB and 4.1 MB) are not in the npm package, so an offline install could
 * only produce English. They are in it: `cli/scripts/prepack.mjs` bundles `locales/` into `bundled/locales/`
 * and the `files` list of `package.json` ships `bundled`. This test measures the PACKAGE, not a checkout:
 *   1. a staging copy of the sources is made (real files, no symlinks) and `npm pack` really runs in it;
 *   2. the tarball is extracted like `npm install <tgz>` lays it down, with nothing above it that could rescue
 *      a missing file (`PathResolver` also looks in `<package>/..`);
 *   3. the CLI that runs is `node <extracted package>/bin/uds.js`, every https/http/fetch call fails at once
 *      and is logged, and any logged call is a failure.
 *
 * The one thing that CAN produce English by accident is a copy of UDS whose locale pack is absent (a partial or
 * damaged install). The installer used to fall back to English there with exit 0 and no word about it, the same
 * shape as `zh-CN` becoming English in XSPEC-451. The second and third tests remove the pack from a copy of the
 * installed package and read what `uds init` and `uds update` say.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/init.js   await installSkills(config.skillsConfig, projectPath, msg, skillsResults);
 * Mutations done by hand (not a cut line), each seen red:
 *   - findLocalePackSkillsDir() made to answer with the English folder when the pack is absent (the old silent
 *     fallback): the "says so" tests go red;
 *   - `{ src: 'locales', dest: 'locales' }` taken out of BUNDLE_DIRS in prepack.mjs: the "installs with the
 *     network cut" test goes red (the package has no pack, so the install says it is English).
 *
 * Each `it` builds only what it needs (lazily, once), so each also passes when selected on its own.
 */

import { it, expect, afterAll } from 'vitest';
import { spawn } from 'child_process';
import {
  mkdtempSync, mkdirSync, cpSync, symlinkSync, readdirSync, readFileSync, existsSync, rmSync, realpathSync, writeFileSync
} from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { isolatedEnv } from '../../../scripts/lib/isolated-home.mjs';

const REAL_CLI_DIR = resolve(import.meta.dirname, '../..');
const REAL_REPO = resolve(REAL_CLI_DIR, '..');
const REPO_DIRS_FOR_PREPACK = ['ai', 'core', 'locales', 'skills', 'templates', 'extensions'];

const CHINESE_HEADING = '# Commit Message 助手';

let sandbox;
const memo = new Map();
function once(key, build) {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
}
const sandboxDir = () => {
  if (!sandbox) sandbox = mkdtempSync(join(tmpdir(), 'uds-test-locale-pack-'));
  return sandbox;
};
afterAll(() => {
  if (sandbox && sandbox.includes('uds-test-locale-pack-')) rmSync(sandbox, { recursive: true, force: true });
});

const BLOCK_NETWORK = `
const https = require('https');
const http = require('http');
const { appendFileSync } = require('fs');
const { EventEmitter } = require('events');
const log = process.env.UDS_TEST_NET_LOG;
function note(what) { if (log) appendFileSync(log, String(what) + '\\n'); }
function blocked(...args) {
  const target = typeof args[0] === 'string' ? args[0] : (args[0] && (args[0].href || args[0].host || args[0].hostname)) || '?';
  note(target);
  const req = new EventEmitter();
  req.end = () => req; req.destroy = () => req; req.setTimeout = () => req; req.write = () => true;
  const err = new Error('network blocked by the test (' + target + ')');
  err.code = 'UDS_TEST_NETWORK_BLOCKED';
  setImmediate(() => req.emit('error', err));
  return req;
}
for (const m of [https, http]) { m.get = blocked; m.request = blocked; }
globalThis.fetch = async (url) => { note(url); const e = new Error('network blocked by the test'); e.code = 'UDS_TEST_NETWORK_BLOCKED'; throw e; };
`;

function run(cmd, args, cwd, env, timeoutMs = 120000) {
  return new Promise((done) => {
    const proc = spawn(cmd, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
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

const baseEnv = (home) => ({ ...isolatedEnv(home, process.env), FORCE_COLOR: '0', UDS_NO_UPDATE_CHECK: '1', HUSKY: '0' });

/** Stage real sources, `npm pack`, extract the tarball the way an install would. */
function packAndExtract() {
  return once('pack', async () => {
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
    const packed = await run('npm', ['pack', '--pack-destination', dest], cli, baseEnv(home), 300000);
    const tgz = existsSync(dest) ? readdirSync(dest).find((f) => f.endsWith('.tgz')) : null;
    if (packed.code !== 0 || !tgz) {
      throw new Error(`npm pack failed (exit ${packed.code}): ${packed.stdout.slice(-400)}\n${packed.stderr.slice(-400)}`);
    }
    const pkgParent = join(root, 'installed');
    mkdirSync(pkgParent, { recursive: true });
    const untar = await run('tar', ['-xzf', join(dest, tgz), '-C', pkgParent], root, baseEnv(home));
    if (untar.code !== 0) throw new Error(`tar failed: ${untar.stderr}`);
    const pkgDir = join(pkgParent, 'package');
    symlinkSync(realpathSync(join(REAL_CLI_DIR, 'node_modules')), join(pkgDir, 'node_modules'), 'dir');
    return { root, pkgDir };
  });
}

/** A copy of the installed package, optionally without one locale pack (`bundled/locales/<name>`). */
function copyOfPackage(label, withoutPack = null) {
  return once(`copy-${label}`, async () => {
    const { pkgDir } = await packAndExtract();
    const parent = join(sandboxDir(), 'copies', label);
    mkdirSync(parent, { recursive: true });
    const copyDir = join(parent, 'package');
    cpSync(pkgDir, copyDir, { recursive: true, filter: (src) => !src.endsWith('node_modules') });
    symlinkSync(realpathSync(join(REAL_CLI_DIR, 'node_modules')), join(copyDir, 'node_modules'), 'dir');
    if (withoutPack) rmSync(join(copyDir, 'bundled', 'locales', withoutPack), { recursive: true, force: true });
    return copyDir;
  });
}

let counter = 0;
/** One CLI run of an installed package, network blocked and logged, in the given project. */
async function runPackaged(pkgDir, args, project) {
  const root = sandboxDir();
  const n = ++counter;
  const preload = join(root, 'block-network.cjs');
  if (!existsSync(preload)) writeFileSync(preload, BLOCK_NETWORK);
  const home = join(root, `home-run-${n}`);
  const netLog = join(root, `net-${n}.log`);
  mkdirSync(home, { recursive: true });
  const env = {
    ...baseEnv(home),
    UDS_TEST_NET_LOG: netLog,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, `--require=${preload}`].filter(Boolean).join(' ')
  };
  const result = await run('node', [join(pkgDir, 'bin', 'uds.js'), '--ui-lang', 'en', ...args], project, env);
  const attempts = existsSync(netLog) ? readFileSync(netLog, 'utf-8').split('\n').filter(Boolean) : [];
  return { ...result, attempts };
}

/** A throwaway project with Claude Code's marker, so the skills go to .claude/skills. */
function newProject(label) {
  const project = join(sandboxDir(), 'projects', `${label}-${++counter}`);
  mkdirSync(join(project, '.claude'), { recursive: true });
  return project;
}

const skillText = (project) => readFileSync(join(project, '.claude', 'skills', 'commit-standards', 'SKILL.md'), 'utf-8');

// No describe wrapper on purpose: the full test name is the it() title.

it('uds init --locale zh-tw and --locale zh-cn from the packed tarball install the Chinese skill texts with the network cut, without any request or locale warning (XSPEC-468 R3)', async () => {
  const pkgDir = await copyOfPackage('complete');
  // The experiment's premise: the Chinese packs are in the tarball.
  expect(existsSync(join(pkgDir, 'bundled', 'locales', 'zh-TW', 'skills', 'commit-standards', 'SKILL.md'))).toBe(true);
  expect(existsSync(join(pkgDir, 'bundled', 'locales', 'zh-CN', 'skills', 'commit-standards', 'SKILL.md'))).toBe(true);

  for (const locale of ['zh-tw', 'zh-cn']) {
    const project = newProject(`complete-${locale}`);
    const r = await runPackaged(pkgDir, ['init', '--yes', '--skills-location', 'project', '--locale', locale], project);
    const out = `${r.stdout}\n${r.stderr}`;
    expect(r.code, `[${locale}] ${out.slice(-600)}`).toBe(0);
    expect(r.attempts, `[${locale}] network requests`).toEqual([]);
    expect(skillText(project), `[${locale}] the installed skill is the Chinese text`).toContain(CHINESE_HEADING);
    expect(out, `[${locale}] no warning that the pack is missing`).not.toContain('skill texts are not in this copy of UDS');
    expect(out, `[${locale}] no per-skill fallback warning`).not.toContain('Locale fallback');
  }
}, 600000);

it('uds init --locale zh-tw from a copy of UDS that lacks the zh-TW skill texts installs English, says so, and does not blame the network (XSPEC-468 R3)', async () => {
  const brokenDir = await copyOfPackage('without-zh-tw', 'zh-TW');
  expect(existsSync(join(brokenDir, 'bundled', 'locales', 'zh-TW'))).toBe(false);

  const project = newProject('lacks-zh-tw');
  const r = await runPackaged(brokenDir, ['init', '--yes', '--skills-location', 'project', '--locale', 'zh-tw'], project);
  const out = `${r.stdout}\n${r.stderr}`;
  // A fallback that is announced is not a failure: exit 0, English files, a message that names the cause.
  expect(r.code, out.slice(-600)).toBe(0);
  expect(r.attempts, 'network requests').toEqual([]);
  expect(skillText(project)).not.toContain(CHINESE_HEADING);
  expect(out).toContain('The zh-TW skill texts are not in this copy of UDS, so the skills were installed in English.');
  expect(out).toContain('this is not about your network');
  expect(out).toContain('npm install -g universal-dev-standards');
  expect(out).toContain('uds update --apply --skills --locale zh-tw');
  // Said once, not once per skill.
  expect(out.split('skill texts are not in this copy of UDS').length - 1).toBe(1);

  // Control arm, same copy: the zh-CN pack is still there, so zh-cn installs Chinese and says nothing.
  const cn = newProject('lacks-zh-tw-but-zh-cn');
  const rc = await runPackaged(brokenDir, ['init', '--yes', '--skills-location', 'project', '--locale', 'zh-cn'], cn);
  expect(rc.code, `${rc.stdout}\n${rc.stderr}`.slice(-600)).toBe(0);
  expect(skillText(cn)).toContain(CHINESE_HEADING);
  expect(`${rc.stdout}\n${rc.stderr}`).not.toContain('skill texts are not in this copy of UDS');
}, 600000);

it('uds update --apply --skills --locale zh-tw says the same from a copy that lacks the pack, and the command it names installs the Chinese texts from a complete copy (XSPEC-468 R3)', async () => {
  const brokenDir = await copyOfPackage('without-zh-tw-update', 'zh-TW');
  const completeDir = await copyOfPackage('complete-update');

  // A project that was installed in English from the broken copy (what the adopter has after the warning).
  const project = newProject('update-after-warning');
  const first = await runPackaged(brokenDir, ['init', '--yes', '--skills-location', 'project', '--locale', 'zh-tw'], project);
  expect(first.code, `${first.stdout}\n${first.stderr}`.slice(-600)).toBe(0);
  expect(skillText(project)).not.toContain(CHINESE_HEADING);

  // update from the same broken copy: still English, and it says so again.
  const again = await runPackaged(brokenDir, ['update', '--apply', '--skills', '--yes', '--locale', 'zh-tw'], project);
  const againOut = `${again.stdout}\n${again.stderr}`;
  expect(again.code, againOut.slice(-600)).toBe(0);
  expect(againOut).toContain('The zh-TW skill texts are not in this copy of UDS, so the skills were installed in English.');
  expect(skillText(project)).not.toContain(CHINESE_HEADING);

  // The fix the message names, run from a complete copy: Chinese texts, no warning.
  const fixed = await runPackaged(completeDir, ['update', '--apply', '--skills', '--yes', '--locale', 'zh-tw'], project);
  const fixedOut = `${fixed.stdout}\n${fixed.stderr}`;
  expect(fixed.code, fixedOut.slice(-600)).toBe(0);
  expect(fixed.attempts, 'network requests').toEqual([]);
  expect(fixedOut).not.toContain('skill texts are not in this copy of UDS');
  expect(skillText(project)).toContain(CHINESE_HEADING);
}, 600000);
