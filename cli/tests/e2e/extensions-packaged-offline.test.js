/**
 * E2E: the npm package carries `extensions/`, and `uds init` installs every extension option from it with the
 * network cut. Evidence for dev-platform XSPEC-452 R1, R2 and R3.
 *
 * Why this exists: `extensions/` (language style guides, framework patterns, locale packs) was not in the
 * published package — 0 of its files. `uds init --lang csharp` / `--locale zh-tw` therefore downloaded them
 * from GitHub `main` at install time. Offline installs failed, the file was whatever `main` held that day
 * rather than the one that belongs to the installed version, and a file that existed nowhere
 * (`extensions/locales/zh-cn.md`, XSPEC-451) hid behind that fallback for months. Every existing install test
 * ran against the repo checkout (where `extensions/` is right there), so none of them could see it.
 *
 * What is different about this test: it measures the PACKAGE, not a checkout.
 *   1. A staging copy of the sources is made (real files, no symlinks) and `npm pack` really runs in it — so
 *      `prepack` (cli/scripts/prepack.mjs) and the `files` list of package.json decide what is in the tarball.
 *      (Packing the real cli/ would rewrite the gitignored cli/bundled/ that other tests read.)
 *   2. The tarball is extracted to a throwaway directory — what `npm install <tgz>` lays down — and its runtime
 *      dependencies are linked from the real cli/node_modules (an offline test cannot `npm install` them).
 *      Nothing above that directory carries `extensions/`: `PathResolver` also looks in `<package>/..`, and a
 *      repo root there would rescue a missing file and make this measure the checkout again.
 *   3. The CLI that runs is `node <extracted package>/bin/uds.js`. The option list is read FROM THAT INSTALLED
 *      PACKAGE (`EXTENSION_MAPPINGS` of its standards-installer.js), never written here: an option added
 *      tomorrow is covered tomorrow, and one added without its file turns this red BY NAME.
 *
 * The wires that make it red when cut (the ones the evidence checker cuts, each a cross-module call):
 *   - cli/scripts/prepack.mjs                       `cpSync(srcPath, destPath, { recursive: true });`  (R1: nothing is bundled)
 *   - cli/src/installers/standards-installer.js     `await copyExtension(`                             (R2, R3: the install reads the package)
 * Mutations done by hand (they are not a cut line, so the checker cannot take them as a `cut`), each seen red:
 *   - taking `{ src: 'extensions', dest: 'extensions' }` out of BUNDLE_DIRS in prepack.mjs (R1 and R3 red);
 *   - putting a GitHub fallback back into `copyExtension` in cli/src/utils/copier.js: the R2 test goes red (a
 *     missing file is downloaded instead of failing) while R3 stays green — with a complete package the
 *     fallback is never reached, which is why R2 has its own test;
 *   - deleting one extension file from the repo before packing (R1, R2 and R3 red, naming the option).
 *
 * Network: every https/http/fetch call is blocked AND written to a log; any entry is a failure that names the
 * option. `UDS_NO_UPDATE_CHECK=1` keeps the npm-registry version check (a legitimate, unrelated call) out of it.
 * HOME and every XDG_* variable point to a throwaway directory.
 *
 * XSPEC-453 R2 adds one test here: the tarball carries exactly the declared extension files and no
 * `extensions/languages/php/` — two never-referenced duplicates (37 KB) that XSPEC-452's whole-directory
 * bundling had started to ship. Its wire is the same prepack line as R1 (no bundling → nothing to equal the
 * declared set); the duplicate itself is a file, so the second mutation is putting it back (seen red).
 *
 * Each `it` builds only what it needs (lazily, once), so each also passes when selected on its own.
 */

import { it, expect, afterAll } from 'vitest';
import { spawn } from 'child_process';
import {
  mkdtempSync, mkdirSync, cpSync, symlinkSync, readdirSync, readFileSync, existsSync, rmSync, realpathSync,
  writeFileSync, statSync
} from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { isolatedEnv } from '../../../scripts/lib/isolated-home.mjs';

const REAL_CLI_DIR = resolve(import.meta.dirname, '../..');
const REAL_REPO = resolve(REAL_CLI_DIR, '..');

// Real directories of the repo that prepack bundles (see cli/scripts/prepack.mjs) — copied, never symlinked:
// cpSync would copy a symlink as a symlink and npm never packs symlinks.
const REPO_DIRS_FOR_PREPACK = ['ai', 'core', 'locales', 'skills', 'templates', 'extensions'];

let sandbox;
const memo = new Map();
/** Run `build` once per key; concurrent callers share the same promise. */
function once(key, build) {
  if (!memo.has(key)) memo.set(key, build());
  return memo.get(key);
}
const sandboxDir = () => {
  if (!sandbox) sandbox = mkdtempSync(join(tmpdir(), 'uds-test-ext-packaged-'));
  return sandbox;
};

afterAll(() => {
  if (sandbox && sandbox.includes('uds-test-ext-packaged-')) rmSync(sandbox, { recursive: true, force: true });
});

/** Preload that fails every network call at once and writes the target to a log. */
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

/** Every file under `root`, relative and forward-slashed (OS junk skipped: npm never packs it). */
function filesUnder(root) {
  const out = [];
  (function walk(dir) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name !== '.DS_Store') out.push(full.slice(root.length + 1).split('\\').join('/'));
    }
  })(root);
  return out.sort();
}

/** Stage real sources → `npm pack` → extract the tarball like an install would → option list from the install. */
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
    const pkgDir = join(pkgParent, 'package'); // npm tarballs always unpack to package/
    symlinkSync(realpathSync(join(REAL_CLI_DIR, 'node_modules')), join(pkgDir, 'node_modules'), 'dir');

    // The option list is read from the INSTALLED package, not from this test.
    const read = await run('node', ['--input-type=module', '-e',
      'import { EXTENSION_MAPPINGS } from "./src/installers/standards-installer.js"; console.log(JSON.stringify(EXTENSION_MAPPINGS));'],
    pkgDir, baseEnv(home));
    if (read.code !== 0) throw new Error(`could not read EXTENSION_MAPPINGS from the installed package: ${read.stderr}`);
    const mappings = JSON.parse(read.stdout.trim().split('\n').pop());
    const options = Object.entries(mappings).map(([id, path]) => ({
      id,
      path,
      flag: path.startsWith('extensions/languages/') ? '--lang'
        : path.startsWith('extensions/frameworks/') ? '--framework'
          : path.startsWith('extensions/locales/') ? '--locale' : null
    }));
    return { root, tgz: join(dest, tgz), pkgDir, options };
  });
}

/** `uds init` of the packaged CLI for one option, network blocked and logged, in a throwaway project. */
async function initWithOption(pkgDir, option, label) {
  const root = sandboxDir();
  const preload = join(root, 'block-network.cjs');
  if (!existsSync(preload)) writeFileSync(preload, BLOCK_NETWORK);
  const home = join(root, `home-${label}-${option.id}`);
  const project = join(root, `project-${label}-${option.id}`);
  const netLog = join(root, `net-${label}-${option.id}.log`);
  mkdirSync(home, { recursive: true });
  // `.claude/` is Claude Code's detector marker; without a detected tool `uds init` takes the legacy path,
  // which ignores the option flags.
  mkdirSync(join(project, '.claude'), { recursive: true });
  const env = {
    ...baseEnv(home),
    UDS_TEST_NET_LOG: netLog,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, `--require=${preload}`].filter(Boolean).join(' ')
  };
  const result = await run('node', [join(pkgDir, 'bin', 'uds.js'), 'init', '--yes', '--skills-location', 'project', option.flag, option.id],
    project, env);
  const attempts = existsSync(netLog) ? readFileSync(netLog, 'utf-8').split('\n').filter(Boolean) : [];
  return { ...result, project, attempts };
}

function installsForEveryOption() {
  return once('installs', async () => {
    const pkg = await packAndExtract();
    const runs = await Promise.all(pkg.options.map(async (o) => [o.id, await initWithOption(pkg.pkgDir, o, 'ok')]));
    return { ...pkg, runs: Object.fromEntries(runs) };
  });
}

function installsWithOneFileMissing() {
  return once('broken', async () => {
    const pkg = await packAndExtract();
    const runs = await Promise.all(pkg.options.map(async (o) => {
      // A fresh copy of the installed package that lacks exactly this option's file.
      const copyRoot = join(sandboxDir(), 'broken', o.id);
      mkdirSync(copyRoot, { recursive: true });
      const copyDir = join(copyRoot, 'package');
      cpSync(pkg.pkgDir, copyDir, { recursive: true, filter: (src) => !src.endsWith('node_modules') });
      symlinkSync(realpathSync(join(REAL_CLI_DIR, 'node_modules')), join(copyDir, 'node_modules'), 'dir');
      const victim = join(copyDir, 'bundled', o.path);
      const existed = existsSync(victim);
      rmSync(victim, { force: true });
      return [o.id, { existed, gone: !existsSync(victim), ...(await initWithOption(copyDir, o, 'missing')) }];
    }));
    return { ...pkg, runs: Object.fromEntries(runs) };
  });
}

const base = (p) => p.split('/').pop();

// No describe wrapper on purpose: the full test name is then just the it() title, which is what
// both vitest -t (joins parents with " > ") and the JSON reporter (joins with " ") agree on.

it('npm pack puts every file of extensions/ into the tarball, byte-identical to the repo source (XSPEC-452 R1)', async () => {
  const pkg = await packAndExtract();
  const source = filesUnder(join(REAL_REPO, 'extensions'));
  const packaged = existsSync(join(pkg.pkgDir, 'bundled', 'extensions')) ? filesUnder(join(pkg.pkgDir, 'bundled', 'extensions')) : [];

  // The denominator: the repo really has extension files, and the installer's options all point into it.
  expect(source.length, 'extensions/ in the repo must not be empty').toBeGreaterThanOrEqual(5);
  expect(pkg.options.length, 'the installer declares extension options').toBeGreaterThanOrEqual(5);

  const problems = [];
  for (const o of pkg.options) {
    if (!existsSync(join(pkg.pkgDir, 'bundled', o.path))) problems.push(`[${o.id}] ${o.path} is not in the tarball (bundled/${o.path})`);
  }
  for (const rel of source) {
    const inPackage = join(pkg.pkgDir, 'bundled', 'extensions', rel);
    if (!existsSync(inPackage)) problems.push(`extensions/${rel} is not in the tarball`);
    else if (!readFileSync(inPackage).equals(readFileSync(join(REAL_REPO, 'extensions', rel)))) problems.push(`extensions/${rel} differs from the repo source`);
  }
  for (const rel of packaged) if (!source.includes(rel)) problems.push(`extensions/${rel} is in the tarball but not in the repo`);
  expect(problems, `repo files=${source.length} packaged=${packaged.length}\n${problems.join('\n')}`).toEqual([]);
}, 600000);

it('uds init from the packed tarball installs every declared extension option with the network cut, byte-identical to the packaged file (XSPEC-452 R3)', async () => {
  const { pkgDir, options, runs } = await installsForEveryOption();
  expect(options.length, `declared options: ${options.map((o) => o.id).join(', ')}`).toBeGreaterThanOrEqual(5);
  const kinds = new Set(options.map((o) => o.flag));
  expect(kinds, 'languages, frameworks and locales are all declared').toEqual(new Set(['--lang', '--framework', '--locale']));

  const problems = [];
  for (const o of options) {
    const tag = `[${o.id}] `;
    const r = runs[o.id];
    const out = `${r.stdout}\n${r.stderr}`;
    if (r.code !== 0) {
      const why = out.split('\n').filter((l) => /rolled back|not found|failed|blocked|Error/i.test(l)).slice(0, 3).join(' | ');
      problems.push(`${tag}uds init exited ${r.code}${why ? ` — ${why.trim()}` : ''}`);
    }
    if (/rolled back/i.test(out)) problems.push(`${tag}the install was rolled back`);
    if (r.attempts.length > 0) problems.push(`${tag}tried the network: ${r.attempts.join(', ')}`);

    const installed = join(r.project, '.standards', base(o.path));
    const packaged = join(pkgDir, 'bundled', o.path);
    if (!existsSync(packaged)) problems.push(`${tag}the package has no bundled/${o.path}`);
    else if (!existsSync(installed)) problems.push(`${tag}.standards/${base(o.path)} was not installed`);
    else {
      if (!readFileSync(installed).equals(readFileSync(packaged))) problems.push(`${tag}.standards/${base(o.path)} differs from the packaged bundled/${o.path}`);
      if (!readFileSync(installed).equals(readFileSync(join(REAL_REPO, o.path)))) problems.push(`${tag}.standards/${base(o.path)} differs from the repo source ${o.path}`);
    }

    let manifest = null;
    try { manifest = JSON.parse(readFileSync(join(r.project, '.standards', 'manifest.json'), 'utf-8')); } catch { /* reported below */ }
    if (!manifest) problems.push(`${tag}.standards/manifest.json is missing or unreadable`);
    else if (!(manifest.extensions || []).includes(o.path)) problems.push(`${tag}manifest extensions ${JSON.stringify(manifest.extensions)} does not list ${o.path}`);
  }
  expect(problems, `options checked: ${options.map((o) => o.id).join(', ')}\n${problems.join('\n')}`).toEqual([]);
}, 600000);

it('uds init fails and names the file when the package lacks a declared extension file, without trying to download it (XSPEC-452 R2)', async () => {
  const { options, runs } = await installsWithOneFileMissing();
  expect(options.length).toBeGreaterThanOrEqual(5);

  const problems = [];
  for (const o of options) {
    const tag = `[${o.id}] `;
    const r = runs[o.id];
    const out = `${r.stdout}\n${r.stderr}`;
    // The experiment itself: the file existed in the package and is now gone.
    if (!r.existed || !r.gone) problems.push(`${tag}test setup: bundled/${o.path} existed=${r.existed} removed=${r.gone}`);
    // A failed install exits non-zero.
    if (r.code === 0) problems.push(`${tag}uds init exited 0 although the package lacks ${o.path}`);
    // And says WHICH file.
    if (!out.includes(o.path)) problems.push(`${tag}the output does not name ${o.path}`);
    // And never reaches for the network to make up for it.
    if (r.attempts.length > 0) problems.push(`${tag}tried to download instead of failing: ${r.attempts.join(', ')}`);
    // And leaves no half-install behind.
    if (existsSync(join(r.project, '.standards', base(o.path)))) problems.push(`${tag}.standards/${base(o.path)} exists although its source is missing`);
  }
  expect(problems, `options checked: ${options.map((o) => o.id).join(', ')}\n${problems.join('\n')}`).toEqual([]);
}, 600000);

it('the packed tarball carries exactly the declared extension files and no extensions/languages/php/ duplicate (XSPEC-453 R2)', async () => {
  const pkg = await packAndExtract();
  const bundled = join(pkg.pkgDir, 'bundled', 'extensions');
  const packaged = existsSync(bundled) ? filesUnder(bundled) : [];
  // What the installer can install — read from the installed package, never written here. Every other file
  // under extensions/ is one nothing can reach: a dead duplicate that ships to every adopter anyway.
  const declared = pkg.options.map((o) => o.path.replace(/^extensions\//, '')).sort();

  expect(declared.length, 'the installer declares extension options').toBeGreaterThanOrEqual(5);
  expect(packaged.filter((f) => f.startsWith('languages/php/')), 'extensions/languages/php/ is a retired duplicate').toEqual([]);
  expect(packaged, `declared=${declared.length} packaged=${packaged.length}`).toEqual(declared);
  expect(existsSync(join(REAL_REPO, 'extensions', 'languages', 'php')), 'the repo source no longer has extensions/languages/php/').toBe(false);
}, 600000);
