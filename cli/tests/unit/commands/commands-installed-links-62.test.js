/**
 * Every slash command UDS installs must have links that open something (dev-platform #62, the command-side twin of #61).
 *
 * A command source links to the UDS repo layout the way its author saw it: `../../core/x.md`, `../ac-coverage/SKILL.md`,
 * `../../locales/zh-TW/...`. Installed into `<project>/.cursor/commands/` (or `.opencode/command/`, `.roo/commands/`,
 * `.github/prompts/`, `.gemini/commands/`) the repo around it is gone: 176 of the 203 relative links of a zh-TW install
 * opened nothing. The installer now turns such a link into the GitHub address of the file the author meant and keeps
 * the links to the other commands, which sit in the same folder. The source files in the UDS repo are not changed.
 *
 * What is run, and how (same staging as skills-installed-links-61.test.js): the real `bin/uds.js`, from a copy of
 * cli/bin + cli/src whose repo root is the real repo and which has no `cli/bundled/` (a gitignored build product).
 * HOME and git's global config point at throwaway places; the network is blocked. Nothing here touches the keychain
 * or the user's git config.
 *
 *   - init, once per locale (en, zh-tw, zh-cn), in a project that makes UDS install commands for ALL five agents that
 *     have a commands folder: every relative link in every installed command file is resolved against the installed
 *     file's own folder and must land on a file inside the project; the few that cannot are named.
 *   - Gemini CLI's TOML: the link is rewritten before the markdown is turned into TOML, and the TOML keeps its shape.
 *   - the files on disk are read back and compared with the manifest's hashes (computed here with crypto), and
 *     `uds check` is run (with a control that proves it can say "modified").
 *   - the upgrade of an existing install: a copy of the CLI with the rewrite switched off installs first (this is what
 *     every adopter has today), then the real CLI runs `uds update --commands`.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import {
  mkdtempSync, mkdirSync, cpSync, symlinkSync, readdirSync, readFileSync, existsSync, rmSync,
  realpathSync, writeFileSync, appendFileSync
} from 'fs';
import { createHash } from 'crypto';
import { tmpdir } from 'os';
import { join, resolve, relative, dirname, isAbsolute } from 'path';
import { pathToFileURL } from 'url';
import { isolatedEnv } from '../../../../scripts/lib/isolated-home.mjs';

const REAL_CLI_DIR = resolve(import.meta.dirname, '../../..');
const REAL_REPO = resolve(REAL_CLI_DIR, '..');
const LOCALES = ['en', 'zh-tw', 'zh-cn'];
const BASE = 'https://github.com/AsiaOstrich/universal-dev-standards/blob/main/';
const GITHUB = /^https:\/\/github\.com\/AsiaOstrich\/universal-dev-standards\/(blob|tree)\/main\//;

/** The five agents that have a commands folder: manifest key prefix, folder in the project (posix), file extension. */
const AGENTS = [
  { agent: 'cursor', dir: ['.cursor', 'commands'], ext: '.md' },
  { agent: 'copilot', dir: ['.github', 'prompts'], ext: '.md' },
  { agent: 'roo-code', dir: ['.roo', 'commands'], ext: '.md' },
  { agent: 'opencode', dir: ['.opencode', 'command'], ext: '.md' },
  { agent: 'gemini-cli', dir: ['.gemini', 'commands'], ext: '.toml' }
];

/** A project that makes `uds init` pick up all five: the marker file of each tool (src/utils/detector.js). */
function writeMarkers(project) {
  mkdirSync(join(project, '.github'), { recursive: true });
  for (const marker of [['.cursorrules'], ['.github', 'copilot-instructions.md'], ['.roorules'], ['GEMINI.md'], ['AGENTS.md']]) {
    writeFileSync(join(project, ...marker), '# my own instructions\n');
  }
}

/**
 * The relative links that still do not open anything after install, exactly (as `<agent>:<file>: link`). The list is
 * exact: a link that starts failing is not in it (the test goes red), and an entry that stops being needed makes
 * the test go red too, so it cannot rot into an excuse.
 */
function knownUnopenable() {
  return [];
}

const BLOCK_NETWORK = `
const https = require('https');
const http = require('http');
const { EventEmitter } = require('events');
function blocked() {
  const req = new EventEmitter();
  req.end = () => req; req.destroy = () => req; req.setTimeout = () => req; req.write = () => true;
  const err = new Error('network blocked by the test');
  err.code = 'UDS_TEST_NETWORK_BLOCKED';
  setImmediate(() => req.emit('error', err));
  return req;
}
for (const m of [https, http]) { m.get = blocked; m.request = blocked; }
globalThis.fetch = async () => { const e = new Error('network blocked by the test'); e.code = 'UDS_TEST_NETWORK_BLOCKED'; throw e; };
`;

/**
 * Relative markdown links in `text` that do not resolve to an existing file inside `projectRoot`, resolved
 * against `fromDir`. Fenced code and inline code are skipped (their `](` is an example, not a link). Absolute URLs,
 * `mailto:` and in-page anchors are not relative links. `checked` counts the relative links looked at.
 */
function deadRelativeLinks(text, fromDir, projectRoot) {
  const prose = text.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '').replace(/`[^`\n]*`/g, '');
  const dead = [];
  let checked = 0;
  for (const m of prose.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const target = m[1].split('#')[0];
    if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target) || isAbsolute(target)) continue;
    checked++;
    const abs = resolve(fromDir, target);
    const inside = !relative(projectRoot, abs).startsWith('..');
    if (!inside || !existsSync(abs)) dead.push(m[1]);
  }
  return { dead, checked };
}

/** The command files of one agent folder as installed: name (with extension) and content. */
function installedCommands(project, { dir, ext }) {
  const folder = join(project, ...dir);
  return readdirSync(folder).filter((f) => f.endsWith(ext)).sort()
    .map((file) => ({ file, path: join(folder, file), text: readFileSync(join(folder, file), 'utf8') }));
}

/** Scan every command folder of a project: links that do not open (as `<agent>:<file>: link`) and the counts. */
function scanProject(project) {
  const unopenable = [];
  let relativeChecked = 0;
  let githubAddresses = 0;
  const filesPerAgent = {};
  for (const spec of AGENTS) {
    const files = installedCommands(project, spec);
    filesPerAgent[spec.agent] = files.length;
    for (const f of files) {
      const r = deadRelativeLinks(f.text, dirname(f.path), project);
      relativeChecked += r.checked;
      for (const link of r.dead) unopenable.push(`${spec.agent}:${f.file}: ${link}`);
      githubAddresses += (f.text.match(/\]\(https:\/\/github\.com\/AsiaOstrich\/universal-dev-standards\/(blob|tree)\/main\//g) || []).length;
    }
  }
  return { unopenable: unopenable.sort(), relativeChecked, githubAddresses, filesPerAgent };
}

let sandbox;
let newCli;
let oldCli;
let env;
const installs = {}; // locale -> { code, out, project }
const upgrade = {}; // { project, init, planBefore, update, planAfter, check, before }

/**
 * A copy of the CLI sources that runs from a staged root (see the header). `rewriteOff` makes the command rewrite a
 * no-op: the CLI as it was before this change, which is what an adopter on today's release has installed.
 */
function stageCli(root, { rewriteOff = false } = {}) {
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
  if (rewriteOff) {
    const file = join(cli, 'src', 'utils', 'skills-installer.js');
    const text = readFileSync(file, 'utf8');
    const marker = 'function rewriteCommandLinks(text, agent, repoPath) {';
    if (!text.includes(marker)) throw new Error('test setup: cannot switch the command rewrite off, its entry point moved');
    writeFileSync(file, text.replace(marker, `${marker}\n  return text;\n}\nfunction unusedOriginal(text, agent, repoPath) {`));
  }
  return join(cli, 'bin', 'uds.js');
}

function run(cliPath, args, cwd) {
  return new Promise((done) => {
    const proc = spawn(process.execPath, [cliPath, ...args], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    proc.stdout.on('data', (d) => { out += d; });
    proc.stderr.on('data', (d) => { out += d; });
    const timer = setTimeout(() => proc.kill('SIGKILL'), 120000);
    proc.on('close', (code) => { clearTimeout(timer); done({ code, out }); });
  });
}

/** Run a small node script against the staged sources (resolved from `stagedRoot`), print what it prints. */
function runScript(stagedRoot, body) {
  const file = join(sandbox, `script-${Math.random().toString(36).slice(2)}.mjs`);
  writeFileSync(file, body);
  return new Promise((done) => {
    const proc = spawn(process.execPath, [file], { cwd: stagedRoot, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    // Decode as a stream: a multi-byte character split across two chunks must not turn into U+FFFD.
    proc.stdout.setEncoding('utf8');
    proc.stderr.setEncoding('utf8');
    proc.stdout.on('data', (d) => { out += d; });
    proc.stderr.on('data', (d) => { err += d; });
    proc.on('close', (code) => done({ code, out, err }));
  });
}

function newProject(name) {
  const project = join(sandbox, name);
  mkdirSync(project, { recursive: true });
  writeMarkers(project);
  return project;
}

function sha256(path) {
  return `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`;
}

/** The manifest's command hashes, each checked against the file on disk. Returns what was compared. */
function compareManifestHashes(project) {
  const manifest = JSON.parse(readFileSync(join(project, '.standards', 'manifest.json'), 'utf8'));
  const entries = Object.entries(manifest.commandHashes || {});
  const mismatches = [];
  for (const [key, info] of entries) {
    // key: <agent>/<file>
    const [agent, ...rest] = key.split('/');
    const spec = AGENTS.find((a) => a.agent === agent);
    if (!spec) { mismatches.push(`${key}: unknown agent`); continue; }
    const file = join(project, ...spec.dir, rest.join('/'));
    if (!existsSync(file)) { mismatches.push(`${key}: file missing`); continue; }
    if (sha256(file) !== info.hash) mismatches.push(`${key}: manifest ${info.hash} disk ${sha256(file)}`);
  }
  return { count: entries.length, mismatches, manifest };
}

/** All `https://github.com/AsiaOstrich/universal-dev-standards/...` addresses in a text. */
function githubAddresses(text) {
  return [...text.matchAll(/https:\/\/github\.com\/AsiaOstrich\/universal-dev-standards\/(?:blob|tree)\/main\/[^)\s>"]*/g)].map((m) => m[0]);
}

beforeAll(async () => {
  sandbox = mkdtempSync(join(tmpdir(), 'uds-test-62-'));
  const home = join(sandbox, 'home');
  mkdirSync(home, { recursive: true });
  const gitConfig = join(sandbox, 'gitconfig');
  writeFileSync(gitConfig, '');
  const preload = join(sandbox, 'block-network.cjs');
  writeFileSync(preload, BLOCK_NETWORK);
  env = {
    ...isolatedEnv(home),
    GIT_CONFIG_GLOBAL: gitConfig,
    GIT_CONFIG_NOSYSTEM: '1',
    FORCE_COLOR: '0',
    NO_COLOR: '1',
    UDS_NO_UPDATE_CHECK: '1',
    NODE_OPTIONS: `--require ${preload}`
  };
  newCli = stageCli(join(sandbox, 'staged-new'));
  oldCli = stageCli(join(sandbox, 'staged-old'), { rewriteOff: true });

  for (const locale of LOCALES) {
    const project = newProject(`project-${locale}`);
    const r = await run(newCli, ['init', '--yes', '--skills-location', 'none', '--locale', locale], project);
    installs[locale] = { ...r, project };
  }

  // An adopter on today's release: installed by the CLI without the rewrite, then upgrades with the new one.
  const project = newProject('project-upgrade');
  upgrade.project = project;
  upgrade.init = await run(oldCli, ['init', '--yes', '--skills-location', 'none', '--locale', 'zh-tw'], project);
  upgrade.before = scanProject(project);
  upgrade.planBefore = await run(newCli, ['update', '--plan', '--commands', '--offline'], project);
  upgrade.update = await run(newCli, ['update', '--commands', '--yes', '--offline'], project);
  upgrade.planAfter = await run(newCli, ['update', '--plan', '--commands', '--offline'], project);
  upgrade.check = await run(newCli, ['check'], project);
}, 900000);

afterAll(() => {
  if (sandbox) rmSync(sandbox, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
});

describe('the link checker can fail (control)', () => {
  it('flags a link that leaves the project and one to a file that is not there, and passes a sibling file', () => {
    const root = mkdtempSync(join(tmpdir(), 'uds-test-62-ctl-'));
    try {
      const dir = join(root, 'a', 'b');
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'sibling.md'), 'x');
      const text = '[out](../../../../x.md) [gone](./gone.md) [ok](./sibling.md) [web](https://example.com/x.md) [top](#top)\n```\n[ex](../nope.md)\n```\n`[inl](../nope.md)`';
      const { dead, checked } = deadRelativeLinks(text, dir, root);
      expect(dead).toEqual(['../../../../x.md', './gone.md']);
      expect(checked).toBe(3);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('the installs before this change really had the problem: most links of a no-rewrite install open nothing', () => {
    expect(upgrade.init.code, upgrade.init.out).toBe(0);
    // 176 of 203 relative links per agent were measured when this was written (zh-TW); five agents, so ~880.
    expect(upgrade.before.unopenable.length).toBeGreaterThan(600);
    expect(upgrade.before.githubAddresses).toBeLessThan(40);
  });
});

describe('uds init: every relative link in every installed command lands on a file in the project (#62)', () => {
  it.each(LOCALES)('locale %s: all five agents, every command', (locale) => {
    const { code, out, project } = installs[locale];
    expect(code, out).toBe(0);
    const scan = scanProject(project);
    // The installed folders are really there with the whole command set (otherwise "no dead links" would be vacuous).
    for (const { agent } of AGENTS) expect(scan.filesPerAgent[agent], `${locale} ${agent}`).toBeGreaterThanOrEqual(51);
    // The checker saw the links that stayed relative (the sibling commands: 27 per agent in the .md folders) ...
    expect(scan.relativeChecked).toBeGreaterThan(80);
    // ... and the links that were rewritten (measured per agent: en 150-177, zh-TW 176-203, zh-CN 149-175) ...
    expect(scan.githubAddresses).toBeGreaterThan(700);
    // ... and the only ones that do not open are the designed exceptions, exactly.
    expect(scan.unopenable).toEqual(knownUnopenable(locale));
  });

  it('en, Cursor: rewritten links have the documented shape; the links to other commands stay relative', () => {
    const cursor = installedCommands(installs.en.project, AGENTS[0]);
    const read = (file) => cursor.find((f) => f.file === file).text;

    const ac = read('ac-coverage.md');
    expect(ac).toContain(`](${BASE}core/ai-command-behavior.md)`);
    expect(ac).not.toContain('](../../core/');
    // a link to a skill: the skills folder is a different, optional install, so it is a GitHub address too
    expect(ac).toContain(`](${BASE}skills/ac-coverage/SKILL.md)`);
    // links to the other commands, which sit in this folder, are as written
    expect(ac).toContain('](./coverage.md');
    expect(ac).toContain('](./checkin.md');
    // language switch to the other language's copy, which is not installed
    expect(read('guide.md')).toContain(`](${BASE}locales/zh-TW/skills/commands/guide.md)`);
    // a file outside the package folders that the repo has
    expect(read('atdd.md')).toContain(`](${BASE}methodologies/atdd.methodology.yaml)`);
    // bare names, no `./`
    expect(read('sdd-retro.md')).toContain('](sdd.md');
    expect(read('sdd-retro.md')).toContain('](commit.md');
  });

  it('every agent with a .md folder keeps the sibling links, and none of them rewrote one into a GitHub address', () => {
    for (const { agent, dir, ext } of AGENTS.filter((a) => a.ext === '.md')) {
      const files = installedCommands(installs.en.project, { dir, ext });
      const check = files.find((f) => f.file === 'check.md').text;
      expect(check, agent).toContain('](./init.md');
      expect(check, agent).toContain('](./update.md');
      expect(check, agent).not.toContain('commands/init.md');
    }
  });

  it('zh-tw: a localized command points at locales/zh-TW; the other language is a GitHub address', () => {
    const cursor = installedCommands(installs['zh-tw'].project, AGENTS[0]);
    const read = (file) => cursor.find((f) => f.file === file).text;
    const ac = read('ac-coverage.md');
    expect(ac).toContain(`](${BASE}locales/zh-TW/core/ai-command-behavior.md)`);
    expect(ac).not.toContain(`](${BASE}core/ai-command-behavior.md)`);
    // zh-TW source: ../../../../docs/specs/... from locales/zh-TW/skills/commands/
    expect(read('sdd-retro.md')).toContain(`](${BASE}docs/specs/cli/shared/SPEC-011-retroactive-spec-tracking.md)`);
    expect(read('guide.md')).toContain(`](${BASE}skills/commands/guide.md)`);
  });

  it('every rewritten address in the three installs has the blob/tree/main shape and no leftover ../ in it', () => {
    let seen = 0;
    for (const locale of LOCALES) {
      for (const spec of AGENTS) {
        for (const f of installedCommands(installs[locale].project, spec)) {
          for (const address of githubAddresses(f.text)) {
            seen++;
            expect(address, `${locale} ${spec.agent} ${f.file}`).toMatch(GITHUB);
            expect(address).not.toContain('/../');
          }
        }
      }
    }
    expect(seen).toBeGreaterThan(2000); // measured 2455 when this was written
  });
});

describe('Gemini CLI: the rewrite happens before the markdown becomes TOML, and the TOML keeps its shape', () => {
  it.each(LOCALES)('locale %s: no relative link is left to a .md file, siblings are GitHub addresses of the command source', (locale) => {
    const gemini = installedCommands(installs[locale].project, AGENTS[4]);
    expect(gemini.length).toBeGreaterThanOrEqual(51);
    // .toml files are installed, so a `./check.md` link opens nothing there: it must not be kept.
    for (const f of gemini) expect(f.text, `${locale} ${f.file}`).not.toMatch(/\]\(\.\/[a-z0-9-]+\.md/);
    const check = gemini.find((f) => f.file === 'check.toml').text;
    const dir = locale === 'en' ? 'skills/commands' : `locales/${locale === 'zh-tw' ? 'zh-TW' : 'zh-CN'}/skills/commands`;
    expect(check).toContain(`](${BASE}${dir}/init.md`);
  });

  it.each(LOCALES)('locale %s: each TOML has the same addresses as the Cursor markdown of the same command (plus its sibling links)', (locale) => {
    const cursor = installedCommands(installs[locale].project, AGENTS[0]);
    const gemini = installedCommands(installs[locale].project, AGENTS[4]);
    let compared = 0;
    for (const md of cursor) {
      const toml = gemini.find((f) => f.file === md.file.replace(/\.md$/, '.toml'));
      expect(toml, `${locale} ${md.file}: no TOML`).toBeTruthy();
      const inMd = new Set(githubAddresses(md.text));
      const inToml = new Set(githubAddresses(toml.text));
      // every address of the markdown survives the conversion ...
      for (const address of inMd) expect(inToml.has(address), `${locale} ${md.file}: ${address}`).toBe(true);
      // ... and what the TOML has extra is only the sibling links, which the markdown keeps relative
      const siblings = (md.text.match(/\]\((?:\.\/)?[a-z0-9-]+\.md/g) || []).length;
      if (siblings === 0) expect([...inToml].filter((a) => !inMd.has(a))).toEqual([]);
      compared++;
    }
    expect(compared).toBeGreaterThanOrEqual(51);
  });

  it.each(LOCALES)('locale %s: the TOML structure is intact (one description, one prompt block, nothing the rewrite added)', (locale) => {
    for (const f of installedCommands(installs[locale].project, AGENTS[4])) {
      expect(f.text, f.file).toMatch(/^# [a-z0-9-]+ command - converted from UDS\ndescription = "/);
      expect(f.text.match(/^prompt = """$/gm), `${f.file} prompt opens`).toHaveLength(1);
      expect(f.text.endsWith('\n"""'), `${f.file} ends with the closing quotes`).toBe(true);
      expect((f.text.match(/"""/g) || []).length, `${f.file} triple quotes`).toBe(2);
      // a rewritten address adds no character that a TOML multi-line string treats specially
      for (const address of githubAddresses(f.text)) expect(address).not.toMatch(/[\\"]/);
    }
  });
});

describe('read back: the manifest hashes and uds check agree with the rewritten files on disk', () => {
  it.each(LOCALES)('locale %s: every recorded hash equals the sha256 of the file; uds check finds all intact', async (locale) => {
    const { project } = installs[locale];
    const { count, mismatches } = compareManifestHashes(project);
    expect(count).toBeGreaterThanOrEqual(255);
    expect(mismatches).toEqual([]);
    // every installed command file is recorded (nothing on disk that the manifest does not know)
    const onDisk = AGENTS.reduce((n, spec) => n + installedCommands(project, spec).length, 0);
    expect(count).toBe(onDisk);

    const check = await run(newCli, ['check'], project);
    expect(check.out).toMatch(new RegExp(`All command files intact \\(${count} files\\)`));
  });

  it('control: uds check does report an installed command file that was changed or removed', async () => {
    const { project } = installs.en;
    const copy = newProject('project-control');
    cpSync(join(project, '.standards'), join(copy, '.standards'), { recursive: true });
    for (const { dir } of AGENTS) cpSync(join(project, ...dir), join(copy, ...dir), { recursive: true });
    cpSync(join(project, 'AGENTS.md'), join(copy, 'AGENTS.md'));
    appendFileSync(join(copy, '.cursor', 'commands', 'check.md'), '\nchanged by hand\n');
    rmSync(join(copy, '.cursor', 'commands', 'init.md'));
    const check = await run(newCli, ['check'], copy);
    expect(check.out).toMatch(/Commands File Integrity[\s\S]*1 modified/);
    expect(check.out).toMatch(/Commands File Integrity[\s\S]*1 missing/);
  });
});

describe('uds update --commands on an install made before this change', () => {
  it('the plan sees the commands differ, the update rewrites them, and afterwards the plan finds nothing to do', () => {
    expect(upgrade.planBefore.code, upgrade.planBefore.out).toBe(0);
    expect(upgrade.planBefore.out).toMatch(/5 installation\(s\) would be reinstalled, 0 unchanged/);
    expect(upgrade.update.code, upgrade.update.out).toBe(0);
    expect(upgrade.planAfter.out).toMatch(/0 installation\(s\) would be reinstalled, 5 unchanged/);
  });

  it('after the update the files on disk are the rewritten ones: every link opens, the hashes match, uds check is clean', () => {
    const project = upgrade.project;
    const scan = scanProject(project);
    expect(scan.unopenable).toEqual([]);
    expect(scan.githubAddresses).toBeGreaterThan(700);
    const { count, mismatches } = compareManifestHashes(project);
    expect(mismatches).toEqual([]);
    expect(upgrade.check.out).toMatch(new RegExp(`All command files intact \\(${count} files\\)`));
    // the same files a fresh install of the same locale writes
    for (const spec of AGENTS) {
      const fresh = installedCommands(installs['zh-tw'].project, spec);
      const upgraded = installedCommands(project, spec);
      expect(upgraded.map((f) => `${f.file}:${createHash('sha256').update(f.text).digest('hex')}`))
        .toEqual(fresh.map((f) => `${f.file}:${createHash('sha256').update(f.text).digest('hex')}`));
    }
  });
});

describe('the other doors into the same function', () => {
  it('installCommandsForAgent() called directly writes rewritten links and records the hashes of what it wrote', async () => {
    const project = newProject('project-direct');
    const root = join(sandbox, 'staged-new');
    const r = await runScript(root, `
      import { installCommandsForAgent } from ${JSON.stringify(pathToFileURL(join(root, 'cli', 'src', 'utils', 'skills-installer.js')).href)};
      const result = await installCommandsForAgent('cursor', 'project', null, ${JSON.stringify(project)}, 'zh-TW');
      console.log('RESULT ' + JSON.stringify({ success: result.success, installed: result.installed.length, errors: result.errors, hashes: Object.keys(result.fileHashes).length }));
    `);
    expect(r.code, r.err).toBe(0);
    const summary = JSON.parse(r.out.split('\n').find((l) => l.startsWith('RESULT ')).slice(7));
    expect(summary.errors).toEqual([]);
    expect(summary.installed).toBeGreaterThanOrEqual(51);
    expect(summary.hashes).toBe(summary.installed);
    const files = installedCommands(project, AGENTS[0]);
    expect(files.length).toBe(summary.installed);
    let relativeChecked = 0;
    for (const f of files) {
      const r2 = deadRelativeLinks(f.text, dirname(f.path), project);
      relativeChecked += r2.checked;
      expect(r2.dead, f.file).toEqual([]);
    }
    expect(relativeChecked).toBeGreaterThan(20);
  });

  it('the source files are not changed: they still hold the repo-relative links the installer rewrites', () => {
    expect(readFileSync(join(REAL_REPO, 'skills', 'commands', 'ac-coverage.md'), 'utf8')).toContain('](../../core/ai-command-behavior.md)');
    expect(readFileSync(join(REAL_REPO, 'locales', 'zh-TW', 'skills', 'commands', 'sdd-retro.md'), 'utf8'))
      .toContain('](../../../../docs/specs/cli/shared/SPEC-011-retroactive-spec-tracking.md)');
  });
});
