/**
 * E2E: `uds check --diff` compares an adopter's files against the copy inside the INSTALLED package — not
 * against GitHub `main`. Evidence for dev-platform XSPEC-453 R1.
 *
 * Why this exists: `check --diff` answers "what did I change in what UDS gave me". It used to download the
 * original from GitHub `main` (`downloadFromGitHub` in showSingleFileDiff). Offline it failed, and anything
 * UDS itself had changed on `main` since the adopter installed was listed as a difference the adopter had made.
 * Component tests of the diff printer could not see either problem: they never ran the command against a
 * network that answers with a different file.
 *
 * What is different about this test: the CLI is the PACKED package (see cli/tests/utils/packaged-cli.js),
 * run the way an adopter runs it — `uds init`, then edit files in the project, then `uds check --diff`. The
 * network is blocked and logged, so "no network request" is a log read back. One case makes GitHub answer
 * with a different file (the packaged one plus an upstream-only line): a CLI still comparing against `main`
 * would print that line as the adopter's difference, and its request would be in the log.
 *
 * The wire that makes it red when cut (the one the evidence checker cuts, a cross-module call):
 *   - cli/src/commands/check.js   `originalContent = readPackagedSource(sourcePath);`
 * Mutations done by hand, each seen red (not cut lines, so the checker cannot take them as a `cut`):
 *   - putting `downloadFromGitHub(sourcePath)` back in place of that line: the baseline, no-network and
 *     upstream-line cases all go red;
 *   - making a missing original skip silently (return without the message): the missing-original case goes red.
 *
 * `--offline` is passed so the npm-registry version check (a legitimate, unrelated call that `uds check` makes
 * on its own) is out of the log: what remains in it is the diff's own traffic.
 *
 * Each `it` builds only what it needs (lazily, once), so each also passes when selected on its own.
 * No describe wrapper on purpose: the full test name is then just the it() title, which is what both
 * vitest -t and the JSON reporter agree on.
 */

import { it, expect, afterAll } from 'vitest';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { createPackagedWorld, UPSTREAM_ONLY_LINE } from '../utils/packaged-cli.js';

const world = createPackagedWorld('uds-test-check-diff');
afterAll(() => world.dispose());

const STANDARD = 'anti-hallucination.ai.yaml';
const STANDARD_SOURCE = `ai/standards/${STANDARD}`;

/** Memoised per key: one install per scenario, shared by the tests that only read it. */
const installs = new Map();
function installedProject(key, extraArgs) {
  if (!installs.has(key)) {
    installs.set(key, (async () => {
      const pkg = await world.packAndExtract();
      const ext = firstLanguageExtension(pkg);
      const { project, init } = await world.initProject(pkg.pkgDir, key, extraArgs ? extraArgs(ext) : ['--lang', ext.id]);
      if (init.code !== 0) throw new Error(`uds init failed (exit ${init.code}) while preparing the scenario:\n${init.output.slice(-600)}`);
      return { pkg, ext, project };
    })());
  }
  return installs.get(key);
}

/** An extension option the installer declares (read from the installed package), as { id, path, file }. */
function firstLanguageExtension(pkg) {
  const entry = Object.entries(pkg.mappings).find(([, path]) => path.startsWith('extensions/languages/'));
  if (!entry) throw new Error('the installed package declares no language extension option');
  const [id, path] = entry;
  return { id, path, file: path.split('/').pop() };
}

/** Replace line 1 of an installed file with an adopter edit. Returns the original and edited first lines. */
function editFirstLine(project, relPath, edit) {
  const full = join(project, relPath);
  const lines = readFileSync(full, 'utf-8').split('\n');
  const original = lines[0];
  lines[0] = edit;
  writeFileSync(full, lines.join('\n'));
  return { original, edited: edit };
}

/** The `-N:`/`+N:` lines `uds check --diff` printed under `Diff for: <file>`. */
function diffLinesFor(output, file) {
  const start = output.indexOf(`Diff for: ${file}`);
  if (start === -1) return null;
  const rest = output.slice(start + 1);
  const next = rest.indexOf('Diff for: ');
  const section = next === -1 ? rest : rest.slice(0, next);
  return section.split('\n').filter((l) => /^[-+]\d+: /.test(l));
}

it('uds check --diff shows the adopter\'s change to an installed standard and to an installed extension file, against the installed package, with the network cut (XSPEC-453 R1)', async () => {
  const { pkg, ext, project } = await installedProject('modified');
  const stdPackaged = join(pkg.pkgDir, 'bundled', STANDARD_SOURCE);
  const extPackaged = join(pkg.pkgDir, 'bundled', ext.path);
  expect(existsSync(stdPackaged), `the package must carry bundled/${STANDARD_SOURCE}`).toBe(true);
  expect(existsSync(extPackaged), `the package must carry bundled/${ext.path}`).toBe(true);

  const stdEdit = editFirstLine(project, `.standards/${STANDARD}`, '# ADOPTER-EDIT-STANDARD');
  const extEdit = editFirstLine(project, `.standards/${ext.file}`, '# ADOPTER-EDIT-EXTENSION');
  // The expectation is read from the PACKAGE, not computed by the code under test.
  expect(stdEdit.original).toBe(readFileSync(stdPackaged, 'utf-8').split('\n')[0]);
  expect(extEdit.original).toBe(readFileSync(extPackaged, 'utf-8').split('\n')[0]);

  const r = await world.uds(pkg.pkgDir, ['check', '--diff', '--offline'], project, 'modified-diff');

  expect(r.code, r.output.slice(-800)).toBe(0);
  expect(r.attempts, 'the diff must not reach the network').toEqual([]);
  // Each edited file shows exactly the adopter's one change — nothing else.
  expect(diffLinesFor(r.output, `.standards/${STANDARD}`)).toEqual([`-1: ${stdEdit.original}`, `+1: ${stdEdit.edited}`]);
  expect(diffLinesFor(r.output, `.standards/${ext.file}`)).toEqual([`-1: ${extEdit.original}`, `+1: ${extEdit.edited}`]);
  // And it says what it compared against, and where to look for what UDS changed since.
  expect(r.output).toContain(`installed UDS package (version ${pkg.version})`);
  expect(r.output).toContain('uds update --plan');
  expect(r.output).not.toMatch(/Fetching original from GitHub/i);
}, 600000);

it('uds check --diff reports no difference and names the installed package as its baseline when the adopter changed nothing (XSPEC-453 R1)', async () => {
  const { pkg, project } = await installedProject('untouched');

  const r = await world.uds(pkg.pkgDir, ['check', '--diff', '--offline'], project, 'untouched-diff');

  expect(r.code, r.output.slice(-800)).toBe(0);
  expect(r.attempts, 'the diff must not reach the network').toEqual([]);
  expect(r.output).not.toContain('Diff for: ');
  expect(r.output).not.toMatch(/^[-+]\d+: /m);
  // "No difference" is said, with its baseline — silence would read the same as "the diff step did not run".
  expect(r.output).toContain(`installed UDS package (version ${pkg.version})`);
  expect(r.output).toContain('nothing to diff');
}, 600000);

it('uds check --diff does not list what GitHub main changed after the install as the adopter\'s difference, and never asks GitHub (XSPEC-453 R1)', async () => {
  const { pkg, ext, project } = await installedProject('upstream-changed');
  const stdEdit = editFirstLine(project, `.standards/${STANDARD}`, '# ADOPTER-EDIT-UPSTREAM-CASE');
  const extEdit = editFirstLine(project, `.standards/${ext.file}`, '# ADOPTER-EDIT-UPSTREAM-CASE-EXT');

  // GitHub `main` would answer — with every file plus one line the adopter never had.
  const r = await world.uds(pkg.pkgDir, ['check', '--diff', '--offline'], project, 'upstream-diff', { fakeGithubDir: join(pkg.pkgDir, 'bundled') });

  expect(r.code, r.output.slice(-800)).toBe(0);
  expect(r.attempts, 'a CLI that still compares against GitHub main would have asked for it').toEqual([]);
  expect(r.output).not.toContain(UPSTREAM_ONLY_LINE);
  expect(diffLinesFor(r.output, `.standards/${STANDARD}`)).toEqual([`-1: ${stdEdit.original}`, `+1: ${stdEdit.edited}`]);
  expect(diffLinesFor(r.output, `.standards/${ext.file}`)).toEqual([`-1: ${extEdit.original}`, `+1: ${extEdit.edited}`]);
}, 600000);

it('uds check --diff names the file and exits non-zero when the installed package has no original for it, without downloading or skipping it (XSPEC-453 R1)', async () => {
  const { pkg, ext, project } = await installedProject('no-original');
  editFirstLine(project, `.standards/${STANDARD}`, '# ADOPTER-EDIT-NO-ORIGINAL');
  editFirstLine(project, `.standards/${ext.file}`, '# ADOPTER-EDIT-NO-ORIGINAL-EXT');

  // The package as it is after the diff's original went missing from it.
  const broken = await world.copyPackage('no-original');
  for (const rel of [STANDARD_SOURCE, ext.path]) {
    const victim = join(broken, 'bundled', rel);
    expect(existsSync(victim), `test setup: bundled/${rel} should exist before it is removed`).toBe(true);
    rmSync(victim, { force: true });
    expect(existsSync(victim), `test setup: bundled/${rel} should be gone`).toBe(false);
  }

  // GitHub would have the files, so a fallback to it would make this green — it must not be reached.
  const r = await world.uds(broken, ['check', '--diff', '--offline'], project, 'no-original-diff', { fakeGithubDir: join(pkg.pkgDir, 'bundled') });

  expect(r.attempts, 'a missing original must not be fetched from the network').toEqual([]);
  expect(r.code, 'a missing original must not read as "no difference"').not.toBe(0);
  for (const [file, source] of [[`.standards/${STANDARD}`, STANDARD_SOURCE], [`.standards/${ext.file}`, ext.path]]) {
    expect(r.output, `the output must name ${file}`).toContain(`has no original for ${file}`);
    expect(r.output, `the output must name the missing source ${source}`).toContain(source);
  }
  // Nothing was compared against anything else.
  expect(r.output).not.toContain(UPSTREAM_ONLY_LINE);
  expect(r.output).not.toMatch(/^[-+]\d+: /m);
}, 600000);

it('uds check --diff warns that the installed package is a different version from the one the standards were installed from, naming both (XSPEC-453 R1)', async () => {
  const { pkg, project } = await installedProject('other-version');
  editFirstLine(project, `.standards/${STANDARD}`, '# ADOPTER-EDIT-OTHER-VERSION');
  // The standards in this project were installed by an older UDS than the package that now runs.
  const manifestPath = join(project, '.standards', 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  manifest.upstream.version = '1.0.0';
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  const r = await world.uds(pkg.pkgDir, ['check', '--diff', '--offline'], project, 'other-version-diff');

  expect(r.code, r.output.slice(-800)).toBe(0);
  expect(r.attempts).toEqual([]);
  expect(r.output).toContain(`installed from UDS 1.0.0, but the package now installed is ${pkg.version}`);
  // The diff itself is still printed, against the installed package.
  expect(diffLinesFor(r.output, `.standards/${STANDARD}`)).toHaveLength(2);
}, 600000);
