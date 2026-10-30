/**
 * `uds update --skills` must forget the hash records of the skill files it deletes (dev-platform #46).
 *
 * The installer removes the top-level files a skill no longer ships, but the manifest update only ever
 * added and overwrote `skillHashes` records. The records of the deleted files stayed, and `uds check` then
 * called each of them "missing": VibeOps ended with 140 recorded files, 125 on disk, and 15 reports of
 * files nobody could restore (the update itself had removed them).
 *
 * These tests go in through the product's entry (the `uds` binary in a child process) in a throwaway git
 * project, plant a file the way an older UDS would have shipped and recorded it, run the update, and read
 * back the manifest, the disk and the `uds check` report. HOME and git's global config point at throwaway
 * places; the keychain and the developer's global git config are never read.
 *
 * Each test builds its own project from the template, so each can run alone.
 *
 * Lives under tests/unit/commands (not tests/e2e) on purpose: tests/unit/testing/test-strategy.test.js caps the
 * e2e share of test files at 30%, and CI runs this folder on every push. It still drives the real binary.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { computeFileHash } from '../../../src/utils/hasher.js';
import { stripAnsi } from '../../utils/cli-runner.js';

const CLI_PATH = join(dirname(fileURLToPath(import.meta.url)), '../../../bin/uds.js');
const MANIFEST = join('.standards', 'manifest.json');

const SKILL = 'commit-standards';
const OBSOLETE_FILE = 'obsolete-guide.md'; // a file an older UDS shipped in this skill and this one does not
const OBSOLETE_KEY = `cursor/project/${SKILL}/${OBSOLETE_FILE}`;
const SHIPPED_KEY = `cursor/project/${SKILL}/SKILL.md`; // still shipped: its record must survive
const OBSOLETE_PATH = join('.cursor', 'skills', SKILL, OBSOLETE_FILE);

let root;
let home;
let gitConfig;
let template;

function childEnv() {
  return {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    XDG_CONFIG_HOME: join(home, '.config'),
    APPDATA: join(home, 'AppData'),
    GIT_CONFIG_GLOBAL: gitConfig,
    GIT_CONFIG_NOSYSTEM: '1',
    FORCE_COLOR: '0',
    NO_COLOR: '1'
  };
}

function runUds(args, cwd, timeoutMs = 120000) {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, [CLI_PATH, ...args], { cwd, env: childEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    proc.stdout.on('data', (d) => { out += d; });
    proc.stderr.on('data', (d) => { out += d; });
    const timer = setTimeout(() => proc.kill('SIGKILL'), timeoutMs);
    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({ exitCode: code, output: stripAnsi(out) });
    });
  });
}

const readManifest = (dir) => JSON.parse(readFileSync(join(dir, MANIFEST), 'utf8'));
const writeManifest = (dir, m) => writeFileSync(join(dir, MANIFEST), `${JSON.stringify(m, null, 2)}\n`);

/** A copy of the initialised project with the obsolete file on disk AND recorded, and an old skills version. */
function projectWithObsoleteFile(name) {
  const dir = join(root, name);
  cpSync(template, dir, { recursive: true });
  const file = join(dir, OBSOLETE_PATH);
  writeFileSync(file, 'a file an older UDS shipped\n');
  const m = readManifest(dir);
  m.skillHashes[OBSOLETE_KEY] = computeFileHash(file);
  m.skills.version = '6.11.0';
  writeManifest(dir, m);
  return dir;
}

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'uds-test-46-'));
  home = join(root, 'home');
  mkdirSync(home, { recursive: true });
  gitConfig = join(root, 'gitconfig');
  writeFileSync(gitConfig, '');

  template = join(root, 'template');
  mkdirSync(template, { recursive: true });
  const git = await new Promise((resolve) => {
    const p = spawn('git', ['init', '-q'], { cwd: template, env: childEnv(), stdio: 'ignore' });
    p.on('close', resolve);
  });
  expect(git).toBe(0);
  writeFileSync(join(template, '.cursorrules'), '# my own Cursor rules\n'); // makes Cursor the detected tool
  const init = await runUds(['init', '-y', '--skills-location', 'project', '--format', 'ai'], template, 180000);
  expect(init.exitCode, init.output).toBe(0);
  // The harness must be able to fail: the skill is installed and its shipped file is recorded.
  expect(existsSync(join(template, '.cursor', 'skills', SKILL, 'SKILL.md'))).toBe(true);
  expect(readManifest(template).skillHashes[SHIPPED_KEY]).toBeTruthy();
}, 240000);

afterAll(() => {
  if (root) rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
});

describe('uds update --skills prunes the hash records of the files it deletes (#46)', () => {
  it('--apply --yes --skills: the deleted file loses its record and `uds check` reports nothing missing', async () => {
    const dir = projectWithObsoleteFile('apply');
    // Precondition read back from disk: the file is there, recorded, and `check` is happy about it.
    expect(existsSync(join(dir, OBSOLETE_PATH))).toBe(true);
    expect(readManifest(dir).skillHashes[OBSOLETE_KEY]).toBeTruthy();
    const before = await runUds(['check', '--offline'], dir);
    expect(before.output).not.toContain(`${OBSOLETE_KEY} (missing)`);

    const update = await runUds(['update', '--apply', '--yes', '--skills', '--offline'], dir);
    expect(update.exitCode, update.output).toBe(0);

    // The file really went (otherwise the record would be right to stay) ...
    expect(existsSync(join(dir, OBSOLETE_PATH))).toBe(false);
    // ... its record went with it, the shipped file's record did not ...
    const after = readManifest(dir);
    expect(after.skillHashes[OBSOLETE_KEY]).toBeUndefined();
    expect(after.skillHashes[SHIPPED_KEY]).toBeTruthy();
    // ... and the report an adopter reads is clean.
    const check = await runUds(['check', '--offline', '--ci'], dir);
    expect(check.output).not.toContain(OBSOLETE_KEY);
    expect(check.output).toMatch(/0 missing/);
    expect(check.exitCode, check.output).toBe(0);
  }, 300000);

  it('--skills --yes (no --apply): same result through the other update path', async () => {
    const dir = projectWithObsoleteFile('direct');
    expect(existsSync(join(dir, OBSOLETE_PATH))).toBe(true);

    const update = await runUds(['update', '--skills', '--yes', '--offline'], dir);
    expect(update.exitCode, update.output).toBe(0);

    expect(existsSync(join(dir, OBSOLETE_PATH))).toBe(false);
    const after = readManifest(dir);
    expect(after.skillHashes[OBSOLETE_KEY]).toBeUndefined();
    expect(after.skillHashes[SHIPPED_KEY]).toBeTruthy();
    const check = await runUds(['check', '--offline'], dir);
    expect(check.output).not.toContain(OBSOLETE_KEY);
  }, 300000);

  it('--apply --yes (the reconciler, no --skills): same result when the plan rewrites the skill', async () => {
    const dir = projectWithObsoleteFile('reconcile');
    expect(existsSync(join(dir, OBSOLETE_PATH))).toBe(true);

    const update = await runUds(['update', '--apply', '--yes', '--offline'], dir);
    expect(update.exitCode, update.output).toBe(0);

    expect(existsSync(join(dir, OBSOLETE_PATH))).toBe(false);
    const after = readManifest(dir);
    expect(after.skillHashes[OBSOLETE_KEY]).toBeUndefined();
    expect(after.skillHashes[SHIPPED_KEY]).toBeTruthy();
    const check = await runUds(['check', '--offline'], dir);
    expect(check.output).not.toContain(OBSOLETE_KEY);
  }, 300000);
});
