/**
 * E2E: ONE definition of "available upstream, not installed" (dev-platform XSPEC-458 R1).
 *
 * The report: a project upgraded from 6.11.0 never learned that UDS ships `open-work-tracking`. The older
 * `uds update` path had its own list of "new standards" (the `checkNewStandards` function); the reconciler path
 * (`--plan` / `--apply`) had none. R1 puts one definition in `src/utils/available-standards.js` and makes every
 * command ask it.
 *
 * Every test spawns the real CLI in a throwaway project built from the manifest a real UDS 6.11.0 wrote
 * (tests/fixtures/upgrade-from-6.11.0) and reads what the CLI printed. The expected list is worked out in the
 * test from standards-registry.json, never by asking the code under test.
 *
 * Wires that make these red when cut (each is one line of CLI source):
 *   cli/src/commands/update.js                        const { offered } = getAvailableStandards(manifest);   (the older path asks the shared definition)
 *   cli/src/utils/available-standards-report.js       const { offered, notOffered, notOfferedByCategory } = getAvailableStandards(manifest);   (the plan section asks it)
 */

import { it, expect, afterAll } from 'vitest';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { createHarness, REAL_REPO, REAL_CLI_DIR } from '../utils/staged-cli-harness.js';
import {
  makeUpgradeProject, readFixtureManifest, expectedAvailableIds, expectedOtherCategoryCount, idsInAvailableSection
} from '../utils/xspec-458.js';

const h = createHarness('xspec458-r1');
afterAll(() => h.cleanup());

const registry = () => JSON.parse(readFileSync(join(REAL_CLI_DIR, 'standards-registry.json'), 'utf-8')).standards;

/** Ids the OLDER path (plain `uds update`) lists under "new standard(s) available", via the registry's file names. */
function idsOnOlderPath(stdout) {
  const after = stdout.split(/new standard\(s\) available/)[1] || '';
  const byFile = new Map();
  for (const s of registry()) {
    const src = typeof s.source === 'string' ? s.source : s.source.ai;
    if (src) byFile.set(basename(src), s.id);
  }
  const ids = [];
  for (const line of after.split('\n').slice(1)) {
    const m = line.match(/^\s+\+ \.standards\/(\S+)$/);
    if (!m) break;
    ids.push(byFile.get(m[1]) || `?${m[1]}`);
  }
  return ids.sort();
}

it('uds update lists the same available standards on the older path and in --plan, equal to the registry-derived list, and manifest level/profile/contentMode change nothing (XSPEC-458 R1)', async () => {
  const dir = makeUpgradeProject(h);
  const manifest = readFixtureManifest();
  const expected = expectedAvailableIds(manifest);
  expect(expected, 'control: the 6.11.0 project lacks open-work-tracking').toContain('open-work-tracking');
  expect(expected, 'control: and has deferred-item-exit').not.toContain('deferred-item-exit');

  // The older path prints its list and then refuses to write without --yes (nothing is attached to answer).
  const older = await h.runCli(['update', '--offline'], dir);
  expect(older.stdout, 'control: the older path reached its list').toContain('new standard(s) available');
  const olderIds = idsOnOlderPath(older.stdout);

  const plan = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(plan.code, plan.stdout + plan.stderr).toBe(0);
  const planIds = idsInAvailableSection(plan.stdout);

  expect(planIds, 'the plan section lists exactly the registry-derived set').toEqual(expected);
  expect(olderIds, 'the older path lists the same set').toEqual(expected);

  // The fields that look like rules but are not: change all three, the answer does not move.
  const mPath = join(dir, '.standards', 'manifest.json');
  const m = JSON.parse(readFileSync(mPath, 'utf-8'));
  m.level = 99;
  m.profile = 'enterprise';
  m.contentMode = 'index';
  for (const cfg of Object.values(m.integrationConfigs)) { cfg.level = 1; cfg.contentMode = 'index'; }
  writeFileSync(mPath, JSON.stringify(m, null, 2));
  const changed = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(idsInAvailableSection(changed.stdout), 'level, profile and contentMode do not decide what is available').toEqual(expected);

  // Categories outside reference/skill are not dropped silently: the section says how many there are.
  expect(plan.stdout).toContain(`Not listed above: ${expectedOtherCategoryCount(manifest)} more standard(s)`);
});

it('the available-standards rule is written in docs/AVAILABLE-STANDARDS.md and names every registry category and both dead fields (XSPEC-458 R1)', () => {
  const doc = readFileSync(join(REAL_REPO, 'docs', 'AVAILABLE-STANDARDS.md'), 'utf-8');
  const categories = [...new Set(registry().map((s) => s.category))];
  expect(categories.length, 'control: the registry has categories').toBeGreaterThan(5);
  for (const category of categories) {
    expect(doc, `docs/AVAILABLE-STANDARDS.md says what happens to the "${category}" category`).toContain(`\`${category}\``);
  }
  expect(doc).toContain('`level`');
  expect(doc).toContain('`profile`');
  expect(doc).toContain('`contentMode`');
  // And every language of it exists (the other two are what a zh-TW / zh-CN user reads).
  for (const locale of ['zh-TW', 'zh-CN']) {
    expect(readdirSync(join(REAL_REPO, 'locales', locale, 'docs')), `${locale} copy`).toContain('AVAILABLE-STANDARDS.md');
  }
});
