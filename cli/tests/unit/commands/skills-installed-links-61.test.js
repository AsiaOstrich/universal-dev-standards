/**
 * Every skill UDS installs must have links that open something (dev-platform #61, decision 214A).
 *
 * #47 fixed one skill by hand. The rest of the skills still linked to `../../core/x.md`, `../../../../skills/...`,
 * `../commands/x.md` ...: places that exist in the UDS source repo and nowhere else. From the installed folder
 * (`<project>/.cursor/skills/<name>/`) those links open nothing. The installer now turns such a link into the GitHub
 * address of the file the author meant, and keeps the links that still land on a file the same install writes.
 * The source files in the UDS repo are not changed.
 *
 * What is run, and how (same staging reason as skills-installed-links-47.test.js): the real `bin/uds.js`, from a copy of
 * cli/bin + cli/src whose repo root is the real repo and which has no `cli/bundled/` (a gitignored build product that,
 * where it exists, can be older than the sources). HOME and git's global config point at throwaway places; the network
 * is blocked. Nothing here touches the keychain or the user's git config.
 *
 *   - init, once per skills locale (en, zh-tw, zh-cn): every relative link in every installed skill file is resolved
 *     against the installed file's own folder and must land on a file inside the project; the few that cannot are named.
 *   - the files on disk are read back and their hashes compared with the manifest's (computed here with crypto, not by
 *     asking `uds check`), and `uds check` is run (with a control that proves it can say "modified").
 *   - the upgrade of an existing install: a copy of the CLI with the rewrite switched off installs first (this is what
 *     every adopter has today), then the real CLI runs `uds update --skills`.
 *   - `uds config --type skills`, and the legacy branch of installSkills(), which the binary no longer reaches.
 *   - the self-adoption copies in the UDS repo (.claude/skills, .agents/skills) are what the installer produces.
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
const GITHUB = /^https:\/\/github\.com\/AsiaOstrich\/universal-dev-standards\/(blob|tree)\/main\//;

/**
 * The relative links that still do not open anything after install, exactly (as `skill/file: link`). The list is
 * exact: a link that starts failing is not in it (the test goes red), and an entry that stops being needed makes
 * the test go red too, so it cannot rot into an excuse.
 *  - testing-guide: the English source file links to a zh-TW translation that the repo does not have. It is dead
 *    in the source too, and a GitHub address for a file that is not there would only be a new dead link.
 *
 * The README and documentation templates of documentation-guide also hold `docs/`, `CONTRIBUTING.md`, `examples/`
 * ...: placeholders meant to be copied into the ADOPTER's own project. They name nothing in UDS. Whether this
 * checker counts them depends on how it pairs the nested code fences of those templates, so they are not listed
 * here; the test "leaves the README-template placeholders as they are" checks them directly.
 */
const KNOWN_UNOPENABLE = [
  'testing-guide/test-skeleton-templates.md: ../../locales/zh-TW/skills/testing-guide/test-skeleton-templates.md'
];

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

/** Every `.md` file of every installed skill: `skill/file` and its content. */
function installedMarkdown(skillsDir) {
  const out = [];
  for (const skill of readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()) {
    for (const file of readdirSync(join(skillsDir, skill)).filter((f) => f.endsWith('.md')).sort()) {
      out.push({ skill, file, path: join(skillsDir, skill, file), text: readFileSync(join(skillsDir, skill, file), 'utf8') });
    }
  }
  return out;
}

/** Scan a whole installed skills folder: the links that do not open (as `skill/file: link`), and the counts. */
function scanInstalled(skillsDir, project) {
  const unopenable = [];
  let relativeChecked = 0;
  let githubAddresses = 0;
  for (const f of installedMarkdown(skillsDir)) {
    const r = deadRelativeLinks(f.text, dirname(f.path), project);
    relativeChecked += r.checked;
    for (const link of r.dead) unopenable.push(`${f.skill}/${f.file}: ${link}`);
    githubAddresses += (f.text.match(/\]\(https:\/\/github\.com\/AsiaOstrich\/universal-dev-standards\/(blob|tree)\/main\//g) || []).length;
  }
  return { unopenable: unopenable.sort(), relativeChecked, githubAddresses };
}

let sandbox;
let newCli;
let oldCli;
let env;
const installs = {}; // locale -> { code, out, project }
const upgrade = {}; // { project, init, planBefore, update, planAfter, check }

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
    // The CLI as it was before this change: same sources, the rewrite answers "nothing to rewrite".
    const file = join(cli, 'src', 'utils', 'skill-link-rewriter.js');
    const text = readFileSync(file, 'utf8');
    const marker = 'export function rewriteOutsideLinks(text, ctx) {';
    if (!text.includes(marker)) throw new Error('test setup: cannot switch the rewrite off, its entry point moved');
    writeFileSync(file, text.replace(marker, `${marker}\n  return { text, rewritten: [], kept: [], unresolved: [], leftAlone: [] };\n}\nfunction unusedOriginal(text, ctx) {`));
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
  writeFileSync(join(project, '.cursorrules'), '# my own Cursor rules\n'); // makes Cursor the detected tool
  return project;
}

function sha256(path) {
  return `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`;
}

/** The manifest's skill hashes, each checked against the file on disk. Returns what was compared. */
function compareManifestHashes(project) {
  const manifest = JSON.parse(readFileSync(join(project, '.standards', 'manifest.json'), 'utf8'));
  const entries = Object.entries(manifest.skillHashes || {});
  const mismatches = [];
  for (const [key, info] of entries) {
    // key: cursor/project/<skill>/<file>
    const [, , skill, ...rest] = key.split('/');
    const file = join(project, '.cursor', 'skills', skill, rest.join('/'));
    if (!existsSync(file)) { mismatches.push(`${key}: file missing`); continue; }
    if (sha256(file) !== info.hash) mismatches.push(`${key}: manifest ${info.hash} disk ${sha256(file)}`);
  }
  return { count: entries.length, mismatches, manifest };
}

beforeAll(async () => {
  sandbox = mkdtempSync(join(tmpdir(), 'uds-test-61-'));
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
    const r = await run(newCli, ['init', '--yes', '--skills-location', 'project', '--locale', locale], project);
    installs[locale] = { ...r, project };
  }

  // An adopter on today's release: installed by the CLI without the rewrite, then upgrades with the new one.
  const project = newProject('project-upgrade');
  upgrade.project = project;
  upgrade.init = await run(oldCli, ['init', '--yes', '--skills-location', 'project', '--locale', 'zh-tw'], project);
  upgrade.beforeScan = scanInstalled(join(project, '.cursor', 'skills'), project);
  upgrade.planBefore = await run(newCli, ['update', '--plan', '--skills', '--offline'], project);
  upgrade.update = await run(newCli, ['update', '--skills', '--yes', '--offline'], project);
  upgrade.planAfter = await run(newCli, ['update', '--plan', '--skills', '--offline'], project);
  upgrade.check = await run(newCli, ['check'], project);
}, 900000);

afterAll(() => {
  if (sandbox) rmSync(sandbox, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
});

describe('the link checker can fail (control)', () => {
  it('flags a link that leaves the project and one to a file that is not there, and passes a sibling file', () => {
    const root = mkdtempSync(join(tmpdir(), 'uds-test-61-ctl-'));
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
    // About 450 dead links per locale were measured when this was written; far above the one designed exception.
    expect(upgrade.beforeScan.unopenable.length).toBeGreaterThan(300);
    expect(upgrade.beforeScan.githubAddresses).toBeLessThan(40);
  });
});

describe('uds init: every relative link in every installed skill lands on a file in the project (#61)', () => {
  it.each(LOCALES)('skills locale %s: all skills, all markdown files', (locale) => {
    const { code, out, project } = installs[locale];
    expect(code, out).toBe(0);
    const skillsDir = join(project, '.cursor', 'skills');
    // The installed folder is really there (otherwise "no dead links" would be vacuous).
    const skills = readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory());
    expect(skills.length).toBeGreaterThanOrEqual(55);

    const scan = scanInstalled(skillsDir, project);
    // The checker saw the links that stayed relative (siblings, own files) ...
    expect(scan.relativeChecked).toBeGreaterThan(120);
    // ... and the links that were rewritten (measured: en 459, zh-TW 449, zh-CN 472) ...
    expect(scan.githubAddresses).toBeGreaterThan(350);
    // ... and the only ones that do not open are the designed exceptions, exactly.
    expect(scan.unopenable).toEqual(KNOWN_UNOPENABLE);
  });

  it('en: rewritten links have the documented shape; the sibling and own-file links stay relative', () => {
    const skillsDir = join(installs.en.project, '.cursor', 'skills');
    const read = (p) => readFileSync(join(skillsDir, p), 'utf8');
    const base = 'https://github.com/AsiaOstrich/universal-dev-standards/blob/main/';

    const ac = read('ac-coverage/SKILL.md');
    expect(ac).toContain(`](${base}core/acceptance-criteria-traceability.md)`);
    expect(ac).not.toContain('](../../core/acceptance-criteria-traceability.md');
    // anchor kept, non-ASCII anchor kept as written
    expect(ac).toContain(`](${base}skills/commands/ac-coverage.md#ai-agent-behavior--ai-代理行為)`);
    // language switch to the other language's copy, which is not installed
    expect(read('adr-assistant/SKILL.md')).toContain(`](${base}locales/zh-TW/skills/adr-assistant/SKILL.md)`);
    // a folder link gets the tree address
    expect(read('project-structure-guide/SKILL.md')).toContain('](https://github.com/AsiaOstrich/universal-dev-standards/tree/main/ai/options/project-structure/)');

    // a link to a file of the same skill (dev-workflow-guide, #47) and the sibling skill file stay as written
    expect(read('dev-workflow-guide/SKILL.md')).toContain('](./workflow-phases.md');
    const siblingLinks = installedMarkdown(skillsDir)
      .flatMap((f) => [...f.text.matchAll(/\]\((\.\.\/[a-z0-9-]+\/[A-Za-z0-9._-]+\.md)(#[^)]*)?\)/g)].map((m) => m[1]));
    expect(siblingLinks.length).toBeGreaterThan(20); // sibling-skill links that stayed relative (160 kept in total)
  });

  it('zh-tw: a localized file resolves against locales/zh-TW (translated core), the other language is a GitHub address', () => {
    const skillsDir = join(installs['zh-tw'].project, '.cursor', 'skills');
    const base = 'https://github.com/AsiaOstrich/universal-dev-standards/blob/main/';
    const aiFriendly = readFileSync(join(skillsDir, 'ai-friendly-architecture', 'SKILL.md'), 'utf8');
    expect(aiFriendly).toContain(`](${base}locales/zh-TW/core/ai-friendly-architecture.md`);
    const ac = readFileSync(join(skillsDir, 'ac-coverage', 'SKILL.md'), 'utf8');
    expect(ac).toContain(`](${base}core/acceptance-criteria-traceability.md)`);
    expect(ac).toContain(`](${base}skills/ac-coverage/SKILL.md)`); // the language switch to English
  });

  it('leaves the README-template placeholders as they are: they name nothing in UDS, a GitHub address would be a new dead link', () => {
    for (const locale of LOCALES) {
      const dir = join(installs[locale].project, '.cursor', 'skills', 'documentation-guide');
      const template = readFileSync(join(dir, 'readme-template.md'), 'utf8');
      for (const link of ['](docs/getting-started.md)', '](docs/api-reference.md)', '](examples/basic/)', '](CHANGELOG.md)']) {
        expect(template, `${locale} readme-template.md`).toContain(link);
      }
      expect(readFileSync(join(dir, 'documentation-structure.md'), 'utf8')).toContain('](commit-message-format-link)');
      expect(template).not.toMatch(/blob\/main\/(locales\/[A-Za-z-]+\/)?skills\/documentation-guide\/(docs|examples|CONTRIBUTING|LICENSE|CHANGELOG)/);
    }
  });

  it('every rewritten address in the three installs has the blob/tree/main shape of #47 and no leftover ../ in it', () => {
    let seen = 0;
    for (const locale of LOCALES) {
      const skillsDir = join(installs[locale].project, '.cursor', 'skills');
      for (const f of installedMarkdown(skillsDir)) {
        for (const m of f.text.matchAll(/\]\((https:\/\/github\.com\/AsiaOstrich\/universal-dev-standards\/[^)\s>]*)/g)) {
          seen++;
          // blob/tree is what the rewrite writes; an issue link is one the authors wrote themselves.
          expect(m[1], `${locale} ${f.skill}/${f.file}`).toMatch(new RegExp(`${GITHUB.source}|^https://github\\.com/AsiaOstrich/universal-dev-standards/issues/\\d+`));
          expect(m[1]).not.toContain('/../');
        }
      }
    }
    expect(seen).toBeGreaterThan(1000);
  });
});

describe('read back: the manifest hashes and uds check agree with the rewritten files on disk', () => {
  it.each(LOCALES)('skills locale %s: every recorded hash equals the sha256 of the file; uds check finds all intact', async (locale) => {
    const { project } = installs[locale];
    const { count, mismatches } = compareManifestHashes(project);
    expect(count).toBeGreaterThanOrEqual(100);
    expect(mismatches).toEqual([]);
    // every installed skill file is recorded (nothing on disk that the manifest does not know)
    const onDisk = readdirSync(join(project, '.cursor', 'skills'), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .reduce((n, e) => n + readdirSync(join(project, '.cursor', 'skills', e.name)).length, 0);
    expect(count).toBe(onDisk);

    const check = await run(newCli, ['check'], project);
    expect(check.out).toMatch(new RegExp(`All skill files intact \\(${count} files\\)`));
    expect(check.out).not.toMatch(/Skills File Integrity[\s\S]*\(已修改\)|\(modified\)|\(遺失\)|\(missing\)/);
  });

  it('control: uds check does report an installed skill file that was changed or removed', async () => {
    const { project } = installs.en;
    const copy = newProject('project-control');
    cpSync(join(project, '.standards'), join(copy, '.standards'), { recursive: true });
    cpSync(join(project, '.cursor'), join(copy, '.cursor'), { recursive: true });
    cpSync(join(project, 'AGENTS.md'), join(copy, 'AGENTS.md'));
    appendFileSync(join(copy, '.cursor', 'skills', 'ac-coverage', 'SKILL.md'), '\nchanged by hand\n');
    rmSync(join(copy, '.cursor', 'skills', 'adr-assistant', 'SKILL.md'));
    const check = await run(newCli, ['check'], copy);
    expect(check.out).toMatch(/\d+ unchanged, 1 modified, 1 missing/);
  });
});

describe('uds update --skills on an install made before this change', () => {
  it('the plan sees the skill content differs, the update rewrites it, and afterwards the plan finds nothing to do', () => {
    expect(upgrade.planBefore.code, upgrade.planBefore.out).toBe(0);
    expect(upgrade.planBefore.out).toMatch(/1 installation\(s\) would be updated/);
    expect(upgrade.update.code, upgrade.update.out).toBe(0);
    expect(upgrade.planAfter.out).toMatch(/0 installation\(s\) would be updated, 1 unchanged/);
  });

  it('after the update the files on disk are the rewritten ones: every link opens, the hashes match, uds check is clean', () => {
    const project = upgrade.project;
    const scan = scanInstalled(join(project, '.cursor', 'skills'), project);
    expect(scan.unopenable).toEqual(KNOWN_UNOPENABLE);
    expect(scan.githubAddresses).toBeGreaterThan(350); // same order as a fresh zh-TW install
    const { count, mismatches } = compareManifestHashes(project);
    expect(mismatches).toEqual([]);
    expect(upgrade.check.out).toMatch(new RegExp(`All skill files intact \\(${count} files\\)`));
    // the same files a fresh install of the same locale writes
    const fresh = installedMarkdown(join(installs['zh-tw'].project, '.cursor', 'skills'));
    const upgraded = installedMarkdown(join(project, '.cursor', 'skills'));
    expect(upgraded.map((f) => `${f.skill}/${f.file}:${createHash('sha256').update(f.text).digest('hex')}`))
      .toEqual(fresh.map((f) => `${f.skill}/${f.file}:${createHash('sha256').update(f.text).digest('hex')}`));
  });
});

describe('uds config --type skills installs through the same rewrite', () => {
  // `uds config --type skills` does not record skills in the manifest at all (skillHashes stays empty and
  // skills.installed stays false; the same before this change), so there is nothing to read back there.
  it('a project that had no skills gets files with rewritten links', async () => {
    const project = newProject('project-config');
    const init = await run(newCli, ['init', '--yes', '--skills-location', 'none', '--locale', 'en'], project);
    expect(init.code, init.out).toBe(0);
    expect(existsSync(join(project, '.cursor', 'skills'))).toBe(false);

    const cfg = await run(newCli, ['config', '--type', 'skills', '--ai-tool', 'cursor', '--skills-location', 'project', '--yes'], project);
    expect(cfg.code, cfg.out).toBe(0);
    const scan = scanInstalled(join(project, '.cursor', 'skills'), project);
    expect(scan.unopenable).toEqual(KNOWN_UNOPENABLE);
    expect(scan.githubAddresses).toBeGreaterThan(350);
  });
});

describe('the legacy branch of installSkills() (updateTargets without installations) installs through the same rewrite', () => {
  it('writes .claude/skills with rewritten links and records the hashes', async () => {
    const project = newProject('project-legacy');
    const root = join(sandbox, 'staged-new');
    const r = await runScript(root, `
      import { installSkills } from ${JSON.stringify(pathToFileURL(join(root, 'cli', 'src', 'installers', 'skills-installer.js')).href)};
      const results = { skills: [], errors: [], skillHashes: {}, commands: [], commandHashes: {} };
      const messages = {
        installingSkills: 'installing', installedSkills: 'installed {count} to {locations}',
        installedSkillsWithErrors: 'installed {count} with {errors} errors'
      };
      await installSkills({ needsInstall: true, updateTargets: ['project'], locale: 'zh-TW' }, ${JSON.stringify(project)}, messages, results);
      console.log('RESULT ' + JSON.stringify({ skills: results.skills.length, errors: results.errors, hashes: Object.keys(results.skillHashes).length }));
    `);
    expect(r.code, r.err).toBe(0);
    const summary = JSON.parse(r.out.split('\n').find((l) => l.startsWith('RESULT ')).slice(7));
    expect(summary.errors).toEqual([]);
    expect(summary.skills).toBeGreaterThanOrEqual(55);
    expect(summary.hashes).toBeGreaterThanOrEqual(100);
    const scan = scanInstalled(join(project, '.claude', 'skills'), project);
    expect(scan.unopenable).toEqual(KNOWN_UNOPENABLE);
    expect(scan.githubAddresses).toBeGreaterThan(350);
  });
});

describe('the self-adoption copies in the UDS repo are what the installer produces', () => {
  it.each([['.claude/skills'], ['.agents/skills']])('%s equals resolveSkillFiles(zh-TW) file by file', async (dir) => {
    const root = join(sandbox, 'staged-new');
    const r = await runScript(root, `
      import { resolveSkillFiles, getAvailableSkillNames } from ${JSON.stringify(pathToFileURL(join(root, 'cli', 'src', 'utils', 'skills-installer.js')).href)};
      const out = {};
      for (const name of getAvailableSkillNames()) {
        for (const f of resolveSkillFiles(name, 'zh-TW').files) out[name + '/' + f.name] = f.content;
      }
      console.log(JSON.stringify(out));
    `);
    expect(r.code, r.err).toBe(0);
    const produced = JSON.parse(r.out);
    const names = Object.keys(produced);
    expect(names.length).toBeGreaterThan(100);
    const differing = [];
    for (const name of names) {
      const committed = join(REAL_REPO, dir, name);
      if (!existsSync(committed)) { differing.push(`${name}: not in ${dir}`); continue; }
      const onDisk = readFileSync(committed, 'utf8');
      if (onDisk !== produced[name]) {
        const a = onDisk.split('\n');
        const b = produced[name].split('\n');
        const at = a.findIndex((line, i) => line !== b[i]);
        differing.push(`${name} line ${at + 1}: committed ${JSON.stringify(a[at])} installer ${JSON.stringify(b[at])}`);
      }
    }
    expect(differing).toEqual([]);
  });
});
