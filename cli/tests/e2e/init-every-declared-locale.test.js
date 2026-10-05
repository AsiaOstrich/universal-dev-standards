/**
 * E2E: `uds init --locale <x>` works for EVERY locale the installer declares — not just the ones somebody
 * happened to try. Evidence for dev-platform XSPEC-451 R1 and R2.
 *
 * Why this exists: the installer declared `zh-cn` (cli/src/installers/standards-installer.js
 * EXTENSION_MAPPINGS) while the file it maps to, extensions/locales/zh-cn.md, did not exist. `uds init
 * --locale zh-cn` therefore failed and rolled the whole install back, and no test noticed — the only
 * test that ran zh-CN worked around it by calling a function one level below the CLI.
 *
 * What it does: for each declared locale it spawns the real CLI
 * (`node cli/bin/uds.js init --yes --skills-location project --locale <id>`) in a throwaway project and reads
 * back what landed. The list of locales is NOT written here: it is read from the installer itself (the union of
 * `LOCALE_MAP` in cli/src/utils/locale.js and every `extensions/locales/*` entry of `EXTENSION_MAPPINGS`),
 * so a locale added tomorrow is covered tomorrow, and one added without its file turns this red BY NAME.
 *
 * The wires that make it red when cut (each is one line of the CLI source):
 *   - cli/src/installers/standards-installer.js  `copyStandard(EXTENSION_MAPPINGS[localeExtension]`  (the locale pack)
 *   - cli/src/utils/skills-installer.js          `writeFileSync(join(targetDir, file.name), file.content, 'utf-8');`  (the skills)
 *
 * What is read back, per locale (every problem is reported as `[<locale>] ...`, so the failing locale is named):
 *   1. `uds init` exits 0 and did not roll back.
 *   2. The mapping exists, and the file it points to exists in the repo.
 *   3. For a Chinese locale, `.standards/<id>.md` is on disk and byte-identical to the shipped pack; `en` installs
 *      no locale pack at all.
 *   4. The manifest records the locale: display language, the extension, the skills locale.
 *   5. Every installed skill's body is identical to that locale's shipped copy (a stale or English copy shows up).
 *   6. The pack is written in the locale's own script: the Simplified pack has no Traditional-only character and
 *      the Traditional pack has no Simplified-only one. The detector must prove it can fire first (control arm:
 *      it must fire on the OTHER script's installed pack), otherwise "clean" proves nothing.
 *   7. The run never tried the network (it is blocked and logged): a missing local file would otherwise be
 *      "fixed" by a download from GitHub and the test would pass on a connected machine and fail offline.
 *
 * What is staged, and why (same reason as comprehension-ladder-skill-installed.test.js): a copy of cli/bin + cli/src
 * made at test time (so a mutation of the source is what runs), whose repo root is the real repo (symlinks) and
 * which has no `cli/bundled/` — a gitignored build product that, where it exists, can be older than the sources.
 * HOME and every XDG_* variable point to a throwaway directory.
 */

import { it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import {
  mkdtempSync, mkdirSync, cpSync, symlinkSync, readdirSync, readFileSync, existsSync, rmSync,
  realpathSync, writeFileSync
} from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { isolatedEnv } from '../../../scripts/lib/isolated-home.mjs';
import { EXTENSION_MAPPINGS } from '../../src/installers/standards-installer.js';
import localeUtils from '../../src/utils/locale.js';

const REAL_CLI_DIR = resolve(import.meta.dirname, '../..');
const REAL_REPO = resolve(REAL_CLI_DIR, '..');

/** Every locale the installer declares, read from the installer itself (never written out here). */
const DECLARED = [...new Set([
  ...Object.keys(localeUtils.LOCALE_MAP),
  ...Object.entries(EXTENSION_MAPPINGS)
    .filter(([, path]) => path.startsWith('extensions/locales/'))
    .map(([id]) => id)
])].sort();

// A small set of characters that exist in only one script. (Not a converter: just enough to tell the two
// packs apart; the control arm below proves the detector fires.)
const TRADITIONAL_ONLY = [...'體資認證檔設錯軟庫戶碼測試號線與籤時統類務過載說項階確讀寫編數據驗'];
const SIMPLIFIED_ONLY = [...'体资认证档设错软库户码测试号线与签时统类务过载说项阶确读写编数据验'];
const hits = (text, chars) => chars.filter((c) => text.includes(c));

const installs = {}; // locale id -> { run, project, netLog }
let sandbox;

/** A runnable copy of the CLI whose sources come from the real repo and which has no bundled/. */
function stageCli(root) {
  const cli = join(root, 'cli');
  mkdirSync(cli, { recursive: true });
  cpSync(join(REAL_CLI_DIR, 'bin'), join(cli, 'bin'), { recursive: true });
  cpSync(join(REAL_CLI_DIR, 'src'), join(cli, 'src'), { recursive: true });
  for (const f of ['package.json', 'standards-registry.json']) {
    cpSync(join(REAL_CLI_DIR, f), join(cli, f));
  }
  symlinkSync(realpathSync(join(REAL_CLI_DIR, 'node_modules')), join(cli, 'node_modules'), 'dir');
  for (const name of readdirSync(REAL_REPO)) {
    if (['cli', '.git', 'node_modules'].includes(name)) continue;
    symlinkSync(join(REAL_REPO, name), join(root, name));
  }
  return join(cli, 'bin', 'uds.js');
}

/**
 * Preload that makes every network call fail at once (non-retryable code) and writes the URL to a log.
 * The CLI falls back to downloading from GitHub when a local file is missing; with the network blocked that
 * fallback cannot hide a missing file, and the log says it was attempted.
 */
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

function runCli(cliPath, args, cwd, env, timeoutMs = 120000) {
  return new Promise((done) => {
    const proc = spawn('node', [cliPath, ...args], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    const timer = setTimeout(() => proc.kill('SIGTERM'), timeoutMs);
    proc.on('close', (code) => {
      clearTimeout(timer);
      done({ code, stdout, stderr });
    });
  });
}

const body = (t) => t.replace(/^---\n[\s\S]*?\n---\n/, '');

/** Everything wrong with one locale's install, each line starting with `[<locale>]`. Empty = fine. */
function problemsFor(id) {
  const tag = `[${id}] `;
  const problems = [];
  const inst = installs[id];
  if (!inst) return [tag + 'no install was attempted for this locale'];
  const { run, project, netLog } = inst;
  const out = run.stdout + '\n' + run.stderr;

  // 1. The entry ran and did not roll back.
  if (run.code !== 0) {
    const reason = out.split('\n').filter((l) => /rolled back|not available|failed|blocked|Error/i.test(l)).slice(0, 3).join(' | ');
    problems.push(tag + `uds init exited ${run.code}` + (reason ? ` — ${reason.trim()}` : ''));
  }
  if (/rolled back/i.test(out)) problems.push(tag + 'the install was rolled back');
  if (!/Installed \d+ Skills/.test(out)) problems.push(tag + 'init did not report installing skills');

  // 7. No network (a missing local file must fail here, not be downloaded).
  const attempts = existsSync(netLog) ? readFileSync(netLog, 'utf-8').split('\n').filter(Boolean) : [];
  if (attempts.length > 0) problems.push(tag + `tried the network instead of a local file: ${attempts.join(', ')}`);

  // 2. The declaration points at a file that exists.
  const mapped = EXTENSION_MAPPINGS[id];
  if (id !== 'en') {
    if (!mapped) problems.push(tag + 'the installer declares this locale but EXTENSION_MAPPINGS has no entry for it');
    else if (!existsSync(join(REAL_REPO, mapped))) problems.push(tag + `EXTENSION_MAPPINGS points to ${mapped}, which does not exist in the repo`);
  }

  // 3. The locale pack landed, byte for byte (en: none).
  const packPath = join(project, '.standards', `${id}.md`);
  if (id === 'en') {
    for (const [other, path] of Object.entries(EXTENSION_MAPPINGS)) {
      if (path.startsWith('extensions/locales/') && existsSync(join(project, '.standards', `${other}.md`))) {
        problems.push(tag + `English install carries the locale pack .standards/${other}.md`);
      }
    }
  } else if (!existsSync(packPath)) {
    problems.push(tag + `.standards/${id}.md was not installed`);
  } else if (mapped && existsSync(join(REAL_REPO, mapped))) {
    if (readFileSync(packPath, 'utf-8') !== readFileSync(join(REAL_REPO, mapped), 'utf-8')) {
      problems.push(tag + `.standards/${id}.md differs from the shipped ${mapped}`);
    }
  }

  // 4. The manifest records the locale.
  const manifestPath = join(project, '.standards', 'manifest.json');
  let manifest = null;
  try { manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')); } catch { /* reported below */ }
  if (!manifest) {
    problems.push(tag + '.standards/manifest.json is missing or unreadable');
  } else {
    if (manifest.options?.display_language !== id) problems.push(tag + `manifest display_language is ${JSON.stringify(manifest.options?.display_language)}`);
    const wantedExt = id === 'en' ? [] : [mapped];
    if (JSON.stringify(manifest.extensions || []) !== JSON.stringify(wantedExt)) {
      problems.push(tag + `manifest extensions is ${JSON.stringify(manifest.extensions)}, expected ${JSON.stringify(wantedExt)}`);
    }
    const wantedLocale = localeUtils.displayLanguageToLocale(id);
    if (manifest.skills?.locale !== wantedLocale) problems.push(tag + `manifest skills.locale is ${JSON.stringify(manifest.skills?.locale)}, expected ${wantedLocale}`);

    // 5. Every installed skill is this locale's copy.
    const names = manifest.skills?.names || [];
    if (names.length < 20) problems.push(tag + `only ${names.length} skills were recorded as installed`);
    const wrong = [];
    for (const name of names) {
      const installedPath = join(project, '.claude', 'skills', name, 'SKILL.md');
      const sourcePath = wantedLocale === 'en'
        ? join(REAL_REPO, 'skills', name, 'SKILL.md')
        : join(REAL_REPO, 'locales', wantedLocale, 'skills', name, 'SKILL.md');
      if (!existsSync(installedPath)) { wrong.push(`${name} (not installed)`); continue; }
      if (!existsSync(sourcePath)) { wrong.push(`${name} (no ${wantedLocale} source)`); continue; }
      if (body(readFileSync(installedPath, 'utf-8')) !== body(readFileSync(sourcePath, 'utf-8'))) wrong.push(`${name} (differs from the ${wantedLocale} copy)`);
    }
    if (wrong.length > 0) problems.push(tag + `skills not matching the ${wantedLocale} copy: ${wrong.slice(0, 5).join(', ')}${wrong.length > 5 ? ` and ${wrong.length - 5} more` : ''}`);
  }

  // 6. The pack is in the locale's own script.
  if ((id === 'zh-cn' || id === 'zh-tw') && existsSync(packPath)) {
    const text = readFileSync(packPath, 'utf-8');
    const foreign = id === 'zh-cn' ? TRADITIONAL_ONLY : SIMPLIFIED_ONLY;
    const own = id === 'zh-cn' ? SIMPLIFIED_ONLY : TRADITIONAL_ONLY;
    if (hits(text, foreign).length > 0) problems.push(tag + `.standards/${id}.md contains the other script's characters: ${hits(text, foreign).join('')}`);
    if (hits(text, own).length < 5) problems.push(tag + `.standards/${id}.md has almost no ${id === 'zh-cn' ? 'Simplified' : 'Traditional'} characters`);
  }
  return problems;
}

// No describe wrapper on purpose: the full test name is then just the it() title, which is what
// both vitest -t (joins parents with " > ") and the JSON reporter (joins with " ") agree on.
beforeAll(async () => {
  // Everything this test needs is set up here, so each test also passes when selected on its own.
  sandbox = mkdtempSync(join(tmpdir(), 'uds-test-every-locale-'));
  const cliPath = stageCli(join(sandbox, 'stage'));
  const preload = join(sandbox, 'block-network.cjs');
  writeFileSync(preload, BLOCK_NETWORK);
  await Promise.all(DECLARED.map(async (id) => {
    const home = join(sandbox, 'home-' + id);
    const project = join(sandbox, 'project-' + id);
    const netLog = join(sandbox, `net-${id}.log`);
    mkdirSync(home, { recursive: true });
    // `.claude/` is Claude Code's own detector marker. Without any detected tool, `uds init` takes the
    // legacy path, which ignores --locale; with it, the unified installer runs (the path adopters use).
    mkdirSync(join(project, '.claude'), { recursive: true });
    const env = {
      ...isolatedEnv(home, process.env),
      FORCE_COLOR: '0',
      UDS_NO_UPDATE_CHECK: '1',
      UDS_TEST_NET_LOG: netLog,
      NODE_OPTIONS: [process.env.NODE_OPTIONS, `--require=${preload}`].filter(Boolean).join(' ')
    };
    const run = await runCli(cliPath, ['init', '--yes', '--skills-location', 'project', '--locale', id], project, env);
    installs[id] = { run, project, netLog };
  }));
}, 360000);

afterAll(() => {
  if (sandbox && sandbox.includes('uds-test-every-locale-')) {
    rmSync(sandbox, { recursive: true, force: true });
  }
});

it('uds init --locale zh-cn completes and installs the Simplified Chinese locale pack and skills instead of rolling back (XSPEC-451 R1)', () => {
  // Control arms first: the script detector must fire on the OTHER script's real installed pack, or "clean" means nothing.
  const twPack = readFileSync(join(installs['zh-tw'].project, '.standards', 'zh-tw.md'), 'utf-8');
  expect(hits(twPack, TRADITIONAL_ONLY).length, 'detector must fire on the installed zh-tw pack').toBeGreaterThan(10);
  expect(hits(twPack, SIMPLIFIED_ONLY), 'a Traditional pack must be free of Simplified-only characters').toEqual([]);

  const problems = problemsFor('zh-cn');
  expect(problems, problems.join('\n')).toEqual([]);

  // Read back the pack itself: it is the Simplified one, and it says so.
  const pack = readFileSync(join(installs['zh-cn'].project, '.standards', 'zh-cn.md'), 'utf-8');
  expect(pack).toMatch(/^# Simplified Chinese \(Mainland China\) Locale Standard/m);
  expect(pack).toMatch(/简体中文/);
  expect(hits(pack, SIMPLIFIED_ONLY).length, 'the Simplified pack carries Simplified characters').toBeGreaterThan(10);
});

it('uds init succeeds for every locale the installer declares and each locale pack and skill set lands, naming the locale that fails (XSPEC-451 R2)', () => {
  // The list comes from the installer. If it were empty or tiny the loop below would prove nothing.
  expect(DECLARED.length, `declared locales: ${DECLARED.join(', ')}`).toBeGreaterThanOrEqual(3);
  expect(DECLARED, 'English is a declared locale').toContain('en');

  const problems = DECLARED.flatMap((id) => problemsFor(id));
  expect(problems, `locales checked: ${DECLARED.join(', ')}\n${problems.join('\n')}`).toEqual([]);
});
