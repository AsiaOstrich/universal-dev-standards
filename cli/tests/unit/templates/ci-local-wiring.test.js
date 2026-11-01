/**
 * XSPEC-518 R4: the fake-test gate is wired into CI and into `npm run ci:local`, and both run the same command.
 *
 * What this proves, and how. The CI step is READ from .github/workflows/ci.yml (the `run:` line of the
 * `anti-fake-tests` job), the local entry is READ from package.json, and then the CI step's own command
 * is executed in a throwaway project that holds a copy of package.json, the shipped scanners and one test.
 * With a fake test in it the command exits non-zero and names the test; with the fake gone it exits 0.
 * So the red you see locally is the red CI shows, and cutting either wire turns a test here red:
 *   - package.json   `"ci:local": "npm run check:anti-fake-tests",`
 *   - package.json   `"check:anti-fake-tests": "node templates/gates/check-anti-fake-tests.mjs",`
 *   - ci.yml         `        run: npm run ci:local`
 *
 * Runs `npm` through the shell so the same line works on Windows (npm.cmd) and POSIX.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';

const REPO = resolve(import.meta.dirname, '../../../..');
const CI_YML = readFileSync(join(REPO, '.github/workflows/ci.yml'), 'utf8');
const ROOT_PACKAGE = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8'));

const dirs = [];
afterEach(() => { for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true }); });

/** The text of one job in ci.yml: from `  <id>:` to the next job (a line indented two spaces) or the end. */
function jobBlock(id) {
  const lines = CI_YML.split('\n');
  const start = lines.findIndex((l) => l === `  ${id}:`);
  if (start === -1) return null;
  let end = start + 1;
  while (end < lines.length && !/^ {2}[A-Za-z0-9_-]+:\s*$/.test(lines[end])) end++;
  return lines.slice(start, end).join('\n');
}

/** Every `run:` command in a job block. */
const runLines = (block) => [...block.matchAll(/^\s+run:\s*(.+)$/gm)].map((m) => m[1].trim());

/** A project that holds what `npm run ci:local` needs: the root package.json, the scanners, and the given files. */
function project(files) {
  const dir = mkdtempSync(join(tmpdir(), 'uds-cilocal-'));
  dirs.push(dir);
  copyFileSync(join(REPO, 'package.json'), join(dir, 'package.json'));
  mkdirSync(join(dir, 'templates/gates'), { recursive: true });
  for (const f of ['check-anti-fake-tests.mjs', 'check-stubs.mjs']) copyFileSync(join(REPO, 'templates/gates', f), join(dir, 'templates/gates', f));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), text);
  }
  return dir;
}

const runCommand = (command, cwd) => {
  const r = spawnSync(command, { cwd, shell: true, encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout || ''}${r.stderr || ''}` };
};

const GOOD = "it('adds', () => { expect(add(1, 2)).toBe(3); });\n";
const FAKE = "it('always passes', () => { expect(true).toBe(true); });\n";

describe('XSPEC-518 R4: ci:local and the CI job run the same fake-test gate', () => {
  it('package.json has ci:local, and it runs the fake-test gate', () => {
    expect(ROOT_PACKAGE.scripts['ci:local'], 'npm run ci:local').toBeDefined();
    expect(ROOT_PACKAGE.scripts['ci:local']).toContain('check:anti-fake-tests');
    expect(ROOT_PACKAGE.scripts['check:anti-fake-tests']).toBe('node templates/gates/check-anti-fake-tests.mjs');
  });

  it('ci.yml has a job whose step runs exactly `npm run ci:local` (no flag that could soften it, no continue-on-error)', () => {
    const block = jobBlock('anti-fake-tests');
    expect(block, 'a job called anti-fake-tests in .github/workflows/ci.yml').not.toBeNull();
    expect(runLines(block)).toEqual(['npm run ci:local']);
    expect(block).not.toMatch(/continue-on-error/);
    expect(block).not.toMatch(/\bif:\s/);
  });

  it('AC-4: a fake test in the tree turns the CI step\'s own command red; removing it turns it green', () => {
    const [ciCommand] = runLines(jobBlock('anti-fake-tests'));
    const dir = project({ 'cli/tests/a.test.js': GOOD, 'cli/tests/fake.test.js': FAKE });

    const red = runCommand(ciCommand, dir);
    expect(red.code, red.out).not.toBe(0);
    expect(red.out).toContain('cli/tests/fake.test.js:1');
    expect(red.out).toContain('"always passes"');

    rmSync(join(dir, 'cli/tests/fake.test.js'));
    const green = runCommand(ciCommand, dir);
    expect(green.code, green.out).toBe(0);
    expect(green.out).toContain('no fake tests found');
  });
});
