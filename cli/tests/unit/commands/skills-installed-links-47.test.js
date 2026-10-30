/**
 * The skill UDS ships to an adopter must not carry relative links that leave the project (dev-platform #47).
 *
 * `dev-workflow-guide` linked to `../../../../skills/workflows/*.workflow.yaml` (and its siblings to
 * `../../adoption/...`, `../workflows/...`). Those resolve inside the UDS source repo and nowhere else: from the
 * installed `<agent>/skills/dev-workflow-guide/` four levels up leaves the adopter's project, and the workflow
 * files are not installed next to the skill at all. Every adopter got links that open nothing.
 *
 * This test installs the skill the way an adopter does, through the real `uds init` binary, once per skills
 * locale, then reads the installed files back from disk and resolves every relative link against the installed
 * file's own folder. A link counts only if it lands on a file that exists inside the project.
 *
 * What is staged, and why (same reason as init-every-declared-locale.test.js): a copy of cli/bin + cli/src whose
 * repo root is the real repo and which has no `cli/bundled/`: a gitignored build product that, where it exists,
 * can be older than the sources and would let a fixed source look unfixed (or the reverse). HOME and git's global
 * config point at throwaway places; the network is blocked so a download cannot stand in for a missing file.
 *
 * The scope is one skill on purpose. Most other skills still link to repo-relative `core/` documents; that is a
 * wider decision and is not claimed fixed here.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import {
  mkdtempSync, mkdirSync, cpSync, symlinkSync, readdirSync, readFileSync, existsSync, rmSync,
  realpathSync, writeFileSync
} from 'fs';
import { tmpdir } from 'os';
import { join, resolve, relative, dirname, isAbsolute } from 'path';
import { isolatedEnv } from '../../../../scripts/lib/isolated-home.mjs';

const REAL_CLI_DIR = resolve(import.meta.dirname, '../../..');
const REAL_REPO = resolve(REAL_CLI_DIR, '..');
const SKILL = 'dev-workflow-guide';
const LOCALES = ['en', 'zh-tw', 'zh-cn'];

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
 * against `fromDir`. Code fences are skipped (their `](` is an example, not a link). Absolute URLs and
 * in-page anchors are not relative links.
 */
function deadRelativeLinks(text, fromDir, projectRoot) {
  const prose = text.replace(/```[\s\S]*?```/g, '');
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

let sandbox;
const installs = {}; // locale -> { code, out, project }

function stageCli(root) {
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
  return join(cli, 'bin', 'uds.js');
}

function run(cliPath, args, cwd, env) {
  return new Promise((done) => {
    const proc = spawn(process.execPath, [cliPath, ...args], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    proc.stdout.on('data', (d) => { out += d; });
    proc.stderr.on('data', (d) => { out += d; });
    const timer = setTimeout(() => proc.kill('SIGKILL'), 120000);
    proc.on('close', (code) => { clearTimeout(timer); done({ code, out }); });
  });
}

beforeAll(async () => {
  sandbox = mkdtempSync(join(tmpdir(), 'uds-test-47-'));
  const home = join(sandbox, 'home');
  mkdirSync(home, { recursive: true });
  const gitConfig = join(sandbox, 'gitconfig');
  writeFileSync(gitConfig, '');
  const preload = join(sandbox, 'block-network.cjs');
  writeFileSync(preload, BLOCK_NETWORK);
  const cliPath = stageCli(join(sandbox, 'staged'));
  const env = {
    ...isolatedEnv(home),
    GIT_CONFIG_GLOBAL: gitConfig,
    GIT_CONFIG_NOSYSTEM: '1',
    FORCE_COLOR: '0',
    NO_COLOR: '1',
    UDS_NO_UPDATE_CHECK: '1',
    NODE_OPTIONS: `--require ${preload}`
  };
  for (const locale of LOCALES) {
    const project = join(sandbox, `project-${locale}`);
    mkdirSync(project, { recursive: true });
    writeFileSync(join(project, '.cursorrules'), '# my own Cursor rules\n'); // makes Cursor the detected tool
    const r = await run(cliPath, ['init', '--yes', '--skills-location', 'project', '--locale', locale], project, env);
    installs[locale] = { ...r, project };
  }
}, 600000);

afterAll(() => {
  if (sandbox) rmSync(sandbox, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
});

describe('the link checker can fail (control)', () => {
  it('flags a link that leaves the project and one to a file that is not there, and passes a sibling file', () => {
    const root = mkdtempSync(join(tmpdir(), 'uds-test-47-ctl-'));
    try {
      const dir = join(root, 'a', 'b');
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'sibling.md'), 'x');
      const text = '[out](../../../../x.md) [gone](./gone.md) [ok](./sibling.md) [web](https://example.com/x.md) [top](#top)\n```\n[ex](../nope.md)\n```';
      const { dead, checked } = deadRelativeLinks(text, dir, root);
      expect(dead).toEqual(['../../../../x.md', './gone.md']);
      expect(checked).toBe(3);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe('uds init installs dev-workflow-guide with links that resolve inside the project (#47)', () => {
  it.each(LOCALES)('skills locale %s: every relative link in the installed skill lands on a file in the project', (locale) => {
    const { code, out, project } = installs[locale];
    expect(code, out).toBe(0);
    const dir = join(project, '.cursor', 'skills', SKILL);
    // The installed folder is really there (otherwise "no dead links" would be vacuous).
    expect(existsSync(join(dir, 'SKILL.md')), `no installed SKILL.md for ${locale}`).toBe(true);
    expect(existsSync(join(dir, 'workflow-phases.md'))).toBe(true);

    const problems = [];
    let checked = 0;
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const r = deadRelativeLinks(readFileSync(join(dir, file), 'utf8'), dirname(join(dir, file)), project);
      checked += r.checked;
      for (const link of r.dead) problems.push(`${file}: ${link}`);
    }
    // The checker saw the links that do resolve (SKILL.md -> workflow-phases.md) ...
    expect(checked).toBeGreaterThan(0);
    // ... and found none that do not.
    expect(problems).toEqual([]);
  });
});
