/**
 * E2E: the upgrade difference test (dev-platform XSPEC-458 R4, second half).
 *
 * The report said every command was right about what it was asked, so a test per command could not find the
 * gap: a project upgraded from 6.11.0 never heard about a standard UDS ships. This test puts the two ends side
 * by side. One end is a manifest a REAL UDS 6.11.0 wrote (tests/fixtures/upgrade-from-6.11.0/, with its
 * provenance), the other is the CURRENT CLI; every standard the current registry can still offer that the old
 * manifest lacks must appear in what `uds update --plan --offline` lists.
 *
 * The expected list is worked out here from standards-registry.json (tests/utils/xspec-458.js), never by asking
 * the code under test. Besides the fixture as it is, a second arm removes standards of both categories from a
 * copy of it, so the list is checked beyond the single standard that 6.11.0 happened to lack.
 *
 * Wires that make these red when cut (each is one line of CLI source):
 *   cli/src/utils/available-standards-report.js   const { offered, notOffered, notOfferedByCategory } = getAvailableStandards(manifest);
 */

import { it, expect, afterAll } from 'vitest';
import { readFileSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { createHarness } from '../utils/staged-cli-harness.js';
import {
  makeUpgradeProject, readFixtureManifest, expectedAvailableIds, idsInAvailableSection, FIXTURE_MANIFEST, FIXTURE_DIR
} from '../utils/xspec-458.js';

const h = createHarness('xspec458-r4-diff');
afterAll(() => h.cleanup());

it('the upgrade fixture is the manifest UDS 6.11.0 wrote: stamped 6.11.0 throughout, unedited since it was recorded in the fixture README, and missing a standard the registry has (XSPEC-458 R4)', () => {
  const manifest = readFixtureManifest();
  expect(manifest.upstream.version).toBe('6.11.0');
  expect(manifest.skills.version, 'the skills it installed are 6.11.0 too').toBe('6.11.0');

  // Unedited: the README records the file's hash, and this recomputes it.
  const readme = readFileSync(join(FIXTURE_DIR, 'README.md'), 'utf-8');
  const hash = createHash('sha256').update(readFileSync(FIXTURE_MANIFEST)).digest('hex');
  expect(readme, 'the fixture README states the hash of manifest.json').toContain(hash);
  expect(readme).toContain('universal-dev-standards@6.11.0');
  expect(readme).toMatch(/sha512-[A-Za-z0-9+/=]{20,}/);

  // The reason it is useful: it lacks a standard today's registry offers.
  expect(expectedAvailableIds(manifest)).toContain('open-work-tracking');
});

it('every standard the current registry offers that the 6.11.0 manifest lacks appears in the Available upstream, not installed list of uds update --plan --offline (XSPEC-458 R4)', async () => {
  const dir = makeUpgradeProject(h);
  const expected = expectedAvailableIds(readFixtureManifest());
  expect(expected.length, 'control: there is something to find').toBeGreaterThan(0);

  const run = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  const listed = idsInAvailableSection(run.stdout);
  for (const id of expected) expect(listed, `${id} is available upstream and the plan does not say so`).toContain(id);
  expect(listed, 'and the list holds nothing the registry does not offer').toEqual(expected);
});

it('the same holds when standards of both categories are taken out of the 6.11.0 manifest: each one removed is listed, none that remain is (XSPEC-458 R4)', async () => {
  const dir = makeUpgradeProject(h);
  const mPath = join(dir, '.standards', 'manifest.json');
  const manifest = JSON.parse(readFileSync(mPath, 'utf-8'));
  const registry = JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', 'standards-registry.json'), 'utf-8')).standards;
  const byFile = new Map(registry.map((s) => [(typeof s.source === 'string' ? s.source : s.source?.ai || '').split('/').pop(), s]));

  // Pick, from what the manifest installs, the first reference one, a skill-category one, and the last of each.
  const installed = manifest.standards
    .filter((e) => !e.includes('/options/'))
    .map((e) => byFile.get(e.split('/').pop()))
    .filter(Boolean);
  const pick = (category) => installed.filter((s) => s.category === category);
  const removed = [...new Set([pick('reference')[0], pick('reference').at(-1), pick('skill')[0], pick('skill').at(-1)].filter(Boolean))];
  expect(new Set(removed.map((s) => s.category)), 'control: both categories are represented').toEqual(new Set(['reference', 'skill']));

  const removedFiles = new Set(removed.map((s) => s.source.ai.split('/').pop()));
  manifest.standards = manifest.standards.filter((e) => !removedFiles.has(e.split('/').pop()));
  for (const file of removedFiles) {
    delete manifest.fileHashes[`.standards/${file}`];
    rmSync(join(dir, '.standards', file));
  }
  writeFileSync(mPath, JSON.stringify(manifest, null, 2));

  const expected = expectedAvailableIds(manifest);
  for (const s of removed) expect(expected, `control: ${s.id} is expected`).toContain(s.id);

  const run = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  const listed = idsInAvailableSection(run.stdout);
  for (const s of removed) expect(listed, `${s.id} (${s.category}) was removed and is not listed`).toContain(s.id);
  expect(listed).toEqual(expected);
});
