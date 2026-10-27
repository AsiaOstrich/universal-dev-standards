/**
 * `uds update` with `--skills` and `--commands` together runs BOTH scopes (6.14.0 bug).
 *
 * Reported on Windows 11: with both flags one scope was dropped, the exit code was 0 and nothing said so.
 *   --apply --skills --commands (either order)  -> only the commands ran; Skills stayed on the old version
 *   --skills --commands (no --apply)            -> only the Skills ran; the commands were ignored
 * Cause: each scope function ended the process (`process.exit`) when it finished, so the one after it never
 * ran, and the no-mode path returned right after the first. The same two axes XSPEC-372 R1/R2 separated.
 *
 * These tests go in through the product's entry (the `uds` binary, in a child process) in a throwaway git
 * project, and read the effect back: the version each scope records in the manifest, the files that were
 * missing, and the section each scope prints. HOME, USERPROFILE and git's global config point at throwaway
 * places, so nothing of the developer's machine is read or written.
 *
 * The expected values are written down here (the old version string, the file paths, the section titles),
 * not computed with the code under test.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';

const CLI_PATH = join(dirname(fileURLToPath(import.meta.url)), '../../bin/uds.js');

const OLD_VERSION = '6.11.0'; // what the user's second project recorded
const MANIFEST = join('.standards', 'manifest.json');
// Present after `uds init` in a Cursor project, and put back by an update of their scope.
const SKILL_DIR = join('.cursor', 'skills', 'commit-standards');
const COMMAND_FILE = join('.cursor', 'commands', 'audit.md');

const SKILLS_SECTION = 'Updating Skills for all AI Agents';
const COMMANDS_SECTION = 'Updating slash commands for all AI Agents';
const SKILLS_PLAN = 'Skills Plan (dry run';
const COMMANDS_PLAN = 'Commands Plan (dry run';

let root; // everything this file makes lives under here
let home; // throwaway HOME / USERPROFILE
let gitConfig; // throwaway global git config
let template; // an initialised project, copied for each case
let currentVersion; // what `uds init` recorded: the version an update must move to

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

/** Run `uds <args>` in `cwd` as a child process; stdin is closed, so a prompt can never wait for an answer. */
function runUds(args, cwd, timeoutMs = 120000) {
  return new Promise((resolve) => {
    const proc = spawn(process.execPath, [CLI_PATH, ...args], { cwd, env: childEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    proc.stdout.on('data', (d) => { out += d; });
    proc.stderr.on('data', (d) => { err += d; });
    const timer = setTimeout(() => proc.kill('SIGKILL'), timeoutMs);
    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({ exitCode: code, output: out + err });
    });
  });
}

function readManifest(dir) {
  return JSON.parse(readFileSync(join(dir, MANIFEST), 'utf8'));
}

function writeManifest(dir, manifest) {
  writeFileSync(join(dir, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
}

/** A copy of the initialised project, made stale the way the user's was: both scopes on 6.11.0, one skill and one command gone. */
function staleProject(name) {
  const dir = join(root, name);
  cpSync(template, dir, { recursive: true });
  const manifest = readManifest(dir);
  manifest.skills.version = OLD_VERSION;
  manifest.commands.version = OLD_VERSION;
  writeManifest(dir, manifest);
  rmSync(join(dir, SKILL_DIR), { recursive: true, force: true });
  rmSync(join(dir, COMMAND_FILE), { force: true });
  return dir;
}

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'uds-test-skills-commands-'));
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
  expect(init.exitCode).toBe(0);
  const m = readManifest(template);
  currentVersion = m.skills.version;
  // The harness must be able to fail: both scopes installed, so an update has something to do.
  expect(m.skills.installations).toEqual([{ agent: 'cursor', level: 'project' }]);
  expect(m.commands.installations).toEqual([{ agent: 'cursor', level: 'project' }]);
  expect(existsSync(join(template, SKILL_DIR))).toBe(true);
  expect(existsSync(join(template, COMMAND_FILE))).toBe(true);
}, 240000);

afterAll(() => {
  if (root) rmSync(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
});

describe('E2E: uds update --skills --commands runs both scopes', () => {
  // The two orders matter because the old code ran whichever it met first.
  it.each([
    ['C: --apply --yes --skills --commands --offline', ['update', '--apply', '--yes', '--skills', '--commands', '--offline']],
    ['D: --apply --yes --commands --skills --offline (order swapped)', ['update', '--apply', '--yes', '--commands', '--skills', '--offline']],
    ['E: --skills --commands --offline (no --apply)', ['update', '--skills', '--commands', '--offline']]
  ])('%s -> both versions advance, both files come back, both sections print, exit 0', async (_label, args) => {
    const dir = staleProject('both');
    // Precondition read back from disk: the project really is behind.
    expect(readManifest(dir).skills.version).toBe(OLD_VERSION);
    expect(readManifest(dir).commands.version).toBe(OLD_VERSION);
    expect(existsSync(join(dir, SKILL_DIR))).toBe(false);
    expect(existsSync(join(dir, COMMAND_FILE))).toBe(false);

    const res = await runUds(args, dir);

    expect(res.exitCode).toBe(0);
    const after = readManifest(dir);
    expect(after.skills.version).toBe(currentVersion);
    expect(after.commands.version).toBe(currentVersion);
    expect(existsSync(join(dir, SKILL_DIR))).toBe(true);
    expect(existsSync(join(dir, COMMAND_FILE))).toBe(true);
    expect(res.output).toContain(SKILLS_SECTION);
    expect(res.output).toContain(COMMANDS_SECTION);
    // each section is in the output once: nothing ran twice
    expect(res.output.split(SKILLS_SECTION).length - 1).toBe(1);
    expect(res.output.split(COMMANDS_SECTION).length - 1).toBe(1);
  }, 240000);

  it('--plan --skills --commands plans both scopes and writes nothing', async () => {
    const dir = staleProject('plan');

    const res = await runUds(['update', '--plan', '--skills', '--commands', '--offline'], dir);

    expect(res.exitCode).toBe(0);
    expect(res.output).toContain(SKILLS_PLAN);
    expect(res.output).toContain(COMMANDS_PLAN);
    const after = readManifest(dir);
    expect(after.skills.version).toBe(OLD_VERSION);
    expect(after.commands.version).toBe(OLD_VERSION);
    expect(existsSync(join(dir, SKILL_DIR))).toBe(false);
    expect(existsSync(join(dir, COMMAND_FILE))).toBe(false);
  }, 120000);
});

describe('E2E: one scope alone is unchanged', () => {
  it('A: --apply --yes --skills --offline -> Skills section only, Skills version and files advance', async () => {
    const dir = staleProject('only-skills');

    const res = await runUds(['update', '--apply', '--yes', '--skills', '--offline'], dir);

    expect(res.exitCode).toBe(0);
    expect(readManifest(dir).skills.version).toBe(currentVersion);
    expect(existsSync(join(dir, SKILL_DIR))).toBe(true);
    expect(res.output).toContain(SKILLS_SECTION);
    expect(res.output).not.toContain(COMMANDS_SECTION);
  }, 240000);

  it('B: --apply --yes --commands --offline -> commands section only, commands version and file advance', async () => {
    const dir = staleProject('only-commands');

    const res = await runUds(['update', '--apply', '--yes', '--commands', '--offline'], dir);

    expect(res.exitCode).toBe(0);
    expect(readManifest(dir).commands.version).toBe(currentVersion);
    expect(existsSync(join(dir, COMMAND_FILE))).toBe(true);
    expect(res.output).toContain(COMMANDS_SECTION);
    expect(res.output).not.toContain(SKILLS_SECTION);
  }, 240000);

  it('no mode: --skills alone prints no commands section and leaves the commands version alone', async () => {
    const dir = staleProject('only-skills-nomode');

    const res = await runUds(['update', '--skills', '--offline'], dir);

    expect(res.exitCode).toBe(0);
    expect(res.output).toContain(SKILLS_SECTION);
    expect(res.output).not.toContain(COMMANDS_SECTION);
    expect(readManifest(dir).commands.version).toBe(OLD_VERSION); // untouched: the scope was not asked for
  }, 120000);
});

describe('E2E: the exit code is the worse of the two scopes', () => {
  // A regular file where the backup folder should be makes a scope that has something to install fail
  // ("Could not take a backup ... nothing was changed", exit 1). The other scope has nothing installed and
  // finishes with 0. Either way round, the run must end non-zero and still print both sections.
  function blockBackups(dir) {
    writeFileSync(join(dir, '.uds-backups'), 'a file, not a folder');
  }

  it.each([
    ['commands fail, Skills have nothing to do', 'skills'],
    ['Skills fail, commands have nothing to do', 'commands']
  ])('%s -> exit 1 and both sections printed', async (_label, emptied) => {
    const dir = staleProject('worse');
    const manifest = readManifest(dir);
    manifest[emptied] = { installed: false, installations: [] };
    writeManifest(dir, manifest);
    blockBackups(dir);

    const res = await runUds(['update', '--skills', '--commands', '--offline'], dir);

    expect(res.exitCode).toBe(1);
    expect(res.output).toContain(SKILLS_SECTION);
    expect(res.output).toContain(COMMANDS_SECTION);
    expect(res.output).toContain('Could not take a backup');
  }, 120000);

  it('the same blocked backup with one scope alone still exits 1 (single-scope behaviour unchanged)', async () => {
    const dir = staleProject('worse-single');
    blockBackups(dir);

    const res = await runUds(['update', '--commands', '--offline'], dir);

    expect(res.exitCode).toBe(1);
    expect(res.output).toContain('Could not take a backup');
  }, 120000);
});
