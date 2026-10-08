/**
 * E2E: `scripts/bump-version.mjs` regenerates the generated blocks of docs/PRE-RELEASE.md, so a version bump does not
 * leave `generate-pre-release.mjs --check` red (dev-platform XSPEC-469 R5; decision 1 of the hand-over).
 *
 * The blocks carry the version read from cli/package.json. Before this, bumping to the next beta made the CI check fail
 * until someone remembered to run the generator. The tests bump a DISPOSABLE COPY of the tracked files (the repository
 * itself is never bumped), with an `npm` that does nothing standing in for the steps that need dependencies or build
 * output (prepack, the skill index, the manifest), and read back the document and the exit code of `--check`.
 *
 * POSIX only: the copy is bumped by the real script, which runs check-version-sync.sh with bash (PowerShell on Windows)
 * and the stub `npm` is a shell script. On Windows these tests skip themselves and are counted as skipped.
 *
 * Wire that makes these red when cut (one line of source):
 *   scripts/bump-version.mjs   execSync('node scripts/beta-acceptance/generate-pre-release.mjs', { cwd: ROOT_DIR, stdio: 'inherit' });
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { chmodSync, cpSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { REPO, scratch, weaken } from '../utils/xspec-469.js';

const tmp = scratch('uds-xspec469-bump-');
afterAll(() => tmp.cleanup());

const NEW = '6.99.0-beta.2';
const OLD = JSON.parse(readFileSync(join(REPO, 'cli', 'package.json'), 'utf-8')).version;

/** The tracked files of the repository, copied to a new folder. */
function copyOfRepo() {
  const listed = spawnSync('git', ['ls-files', '-z'], { cwd: REPO, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
  expect(listed.status, `control: git lists the tracked files (${listed.stderr})`).toBe(0);
  const root = tmp.next('copy');
  for (const rel of listed.stdout.split('\0').filter(Boolean)) {
    if (statSync(join(REPO, rel)).isDirectory()) continue; // a git submodule (tests/bats), not needed by a bump
    const to = join(root, rel);
    mkdirSync(dirname(to), { recursive: true });
    cpSync(join(REPO, rel), to);
  }
  return root;
}

/** An `npm` that succeeds and does nothing, first on PATH. */
function stubNpm() {
  const dir = tmp.next('stub');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'npm'), '#!/bin/sh\nexit 0\n');
  chmodSync(join(dir, 'npm'), 0o755);
  return dir;
}

const bump = (root, version = NEW) => spawnSync(process.execPath, [join(root, 'scripts', 'bump-version.mjs'), version], {
  cwd: root, encoding: 'utf-8', timeout: 180000, env: { ...process.env, PATH: `${stubNpm()}:${process.env.PATH}`, SKIP_BUNDLE_PARITY: '1' },
});
const check = (root) => spawnSync(process.execPath, [join(root, 'scripts', 'beta-acceptance', 'generate-pre-release.mjs'), '--check'], { cwd: root, encoding: 'utf-8' });

/** The property: after the bump the document names the new version, not the old, and --check is green. */
function afterBump(root) {
  const r = bump(root);
  const doc = readFileSync(join(root, 'docs', 'PRE-RELEASE.md'), 'utf-8');
  const c = check(root);
  return { bumpCode: r.status, bumpOut: `${r.stdout}${r.stderr}`, namesNew: doc.includes(`--version ${NEW}`), namesOld: doc.includes(`--version ${OLD}`), checkCode: c.status, checkOut: `${c.stdout}${c.stderr}` };
}

it('after a version bump the generated blocks of PRE-RELEASE.md name the new version and generate-pre-release --check is green (XSPEC-469 R5)', (ctx) => {
  if (process.platform === 'win32') ctx.skip();
  const root = copyOfRepo();
  // control: the copy is green before the bump, and a bump on its own would turn it red
  expect(check(root).status, 'the unmodified copy passes --check').toBe(0);

  const r = afterBump(root);
  expect(r.bumpCode, r.bumpOut.slice(-1500)).toBe(0);
  expect(r.bumpOut).toContain('docs/PRE-RELEASE.md generated blocks regenerated');
  expect(r.namesNew, 'the document says the new version').toBe(true);
  expect(r.namesOld, 'and no longer the old one').toBe(false);
  expect(r.checkCode, r.checkOut).toBe(0);
}, 240000);

it('without the regeneration line a bump leaves PRE-RELEASE.md on the old version and --check red: the copy of the script with that line cut is caught (XSPEC-469 R5)', (ctx) => {
  if (process.platform === 'win32') ctx.skip();
  const root = copyOfRepo();
  weaken(join(root, 'scripts', 'bump-version.mjs'), "execSync('node scripts/beta-acceptance/generate-pre-release.mjs', { cwd: ROOT_DIR, stdio: 'inherit' });", '');
  const r = afterBump(root);
  expect(r.bumpCode, 'the rest of the bump still works: only the document is left behind').toBe(0);
  expect(r.namesNew).toBe(false);
  expect(r.namesOld).toBe(true);
  expect(r.checkCode, r.checkOut).toBe(1);
}, 240000);
