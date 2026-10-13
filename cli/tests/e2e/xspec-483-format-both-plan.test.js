/**
 * E2E: the upgrade plan of a `--format both` project keeps both copies of every standard (dev-platform XSPEC-483 R1-R3).
 *
 *   Defect  `uds init --format both` installs the human copy (.md) and the AI copy (.ai.yaml) of every standard and option.
 *           The reconciler read `both` as if it were one format, expected only the .md files, and `uds update --plan`
 *           listed the .ai.yaml of every standard as "no longer selected" (71 deletions); `--apply` would have removed
 *           half of the installed standards. XSPEC-482 R6 had to skip the convergence step of `uds init` for these projects.
 *   R1      The plan reads the format the manifest records: `both` expects both files; only a real change of `format` adds or removes.
 *   R2      `uds init --format both` converges like any other project, so `uds update --plan` right after it has nothing to do.
 *   R3      A `--format both` project made by 6.11.0 or by 6.14.0-beta.14 (the real manifests in tests/fixtures/upgrade-from-both)
 *           upgrades with both copies kept, and `--rollback` brings back the exact files it had.
 *
 * Every test runs the real CLI in a throwaway project and reads files and printed lines back. The expected file sets come from
 * the old UDS's own manifest (its path-form `standards` entries) or from a second real `uds init`, never from the code under test.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/reconciler/desired-state-calculator.js   (calculateStandards) const formats = getInstalledFormats(manifest.format); // wire:calculator-standards-formats
 *   cli/src/reconciler/desired-state-calculator.js   (calculateOptions)   const formats = getInstalledFormats(manifest.format); // wire:calculator-options-formats
 *   cli/src/commands/init.js                         if (preview.plan.actions.every((a) => a.type === 'migrate_block')) { // wire:init-converges-both
 *   cli/src/commands/init.js                         const converged = await reconcile(projectPath, { backup: false }); // wire:init-converges-to-current-format
 *   cli/src/installers/standards-installer.js        config.format === 'both' ? getInstalledFormats('both') : [config.format]
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { CURRENT_SCHEMA_VERSION } from '../../src/core/manifest.js';
import { out, readManifest, writeManifest } from '../utils/xspec-482.js';
import {
  BOTH_FIXTURE_VERSIONS,
  filesTheOldInstallWrote,
  makeBothUpgradeProject,
  listedStandardFiles,
  planSectionPaths
} from '../utils/xspec-483.js';

const h = createHarness('xspec483-format-both');
afterAll(() => h.cleanup());

const OFFLINE = '--offline';
const read = (dir, rel) => readFileSync(join(dir, rel), 'utf-8');
const isAi = (p) => p.endsWith('.ai.yaml');
const isHuman = (p) => p.endsWith('.md');

/** A throwaway project (Claude Code detected) made by the real `uds init --format <format>`. */
async function initProject(format, name = format) {
  const dir = h.makeDir(`init-${name}`);
  mkdirSync(join(dir, '.claude'), { recursive: true });
  const run = await h.runCli(['init', '--yes', '--format', format, '--skills-location', 'project'], dir);
  expect(run.code, out(run)).toBe(0);
  return dir;
}

/** Every file under `.standards` (the manifest included) with its text, to compare before and after. */
function standardsSnapshot(dir) {
  const walk = (rel) => readdirSync(join(dir, rel), { withFileTypes: true }).flatMap((e) => {
    const next = `${rel}/${e.name}`;
    return e.isDirectory() ? walk(next) : [[next, readFileSync(join(dir, next), 'utf-8')]];
  });
  return Object.fromEntries(walk('.standards'));
}

// ── R1: the plan reads the format the manifest records ────────────────────────────────────────────────

for (const version of BOTH_FIXTURE_VERSIONS) {
  it(`update --plan on a --format both project made by ${version} lists no deletion and writes nothing (XSPEC-483 R1)`, async () => {
    const dir = makeBothUpgradeProject(h, version);
    const expected = filesTheOldInstallWrote(version);
    expect(expected.filter(isAi).length, 'fixture: the old install wrote AI copies').toBeGreaterThan(50);
    expect(expected.filter(isHuman).length, 'fixture: and human copies').toBeGreaterThan(50);
    const before = standardsSnapshot(dir);

    const plan = await h.runCli(['update', '--plan', OFFLINE], dir);
    expect(plan.code, out(plan)).toBe(0);
    expect(planSectionPaths(out(plan), 'Delete'), `no file is planned for deletion\n${out(plan)}`).toEqual([]);
    expect(out(plan)).toContain('Delete: 0');
    expect(out(plan)).not.toMatch(/no longer selects it/);

    expect(standardsSnapshot(dir), 'a plan writes nothing').toEqual(before);
    for (const rel of expected) expect(existsSync(join(dir, rel)), `${rel} is still there`).toBe(true);
  }, 240000);
}

it('the plan follows manifest.format: both -> ai plans the .md copies for deletion and only those, both -> human only the .ai.yaml copies (XSPEC-483 R1)', async () => {
  const dir = await initProject('both');
  const m = readManifest(dir);
  expect(m.format, 'fixture: init recorded both').toBe('both');
  const onDisk = listedStandardFiles(dir);
  expect(onDisk.filter(isAi).length).toBeGreaterThan(50);
  expect(onDisk.filter(isHuman).length).toBeGreaterThan(50);

  writeManifest(dir, { ...m, format: 'ai' });
  const toAi = await h.runCli(['update', '--plan', OFFLINE], dir);
  expect(toAi.code, out(toAi)).toBe(0);
  const droppedHuman = planSectionPaths(out(toAi), 'Delete');
  expect(droppedHuman.length, `the human copies go when the format becomes ai\n${out(toAi)}`).toBeGreaterThan(50);
  expect(droppedHuman.every(isHuman), 'only .md files are planned for deletion').toBe(true);
  expect(droppedHuman.every((p) => onDisk.includes(p)), 'and each one exists').toBe(true);

  writeManifest(dir, { ...m, format: 'human' });
  const toHuman = await h.runCli(['update', '--plan', OFFLINE], dir);
  expect(toHuman.code, out(toHuman)).toBe(0);
  const droppedAi = planSectionPaths(out(toHuman), 'Delete');
  expect(droppedAi.length, `the AI copies go when the format becomes human\n${out(toHuman)}`).toBeGreaterThan(50);
  expect(droppedAi.every(isAi), 'only .ai.yaml files are planned for deletion').toBe(true);
}, 240000);

it('the plan follows manifest.format: ai -> both plans the missing .md copies for creation, deletes nothing, and --apply writes them (XSPEC-483 R1)', async () => {
  const reference = await initProject('both', 'reference');
  const aiOnly = await initProject('ai');
  // A few standards exist only as .md (templates), so even an ai install holds those; every other .md is a "human copy".
  const alreadyThere = new Set(listedStandardFiles(aiOnly));
  const wanted = listedStandardFiles(reference).filter((p) => isHuman(p) && !alreadyThere.has(p)); // what a both install adds beside the AI copies
  expect(wanted.length, 'fixture: an ai install lacks the human copies').toBeGreaterThan(50);

  writeManifest(aiOnly, { ...readManifest(aiOnly), format: 'both' });
  const plan = await h.runCli(['update', '--plan', OFFLINE], aiOnly);
  expect(plan.code, out(plan)).toBe(0);
  expect(planSectionPaths(out(plan), 'Delete'), out(plan)).toEqual([]);
  expect(planSectionPaths(out(plan), 'Create').filter(isHuman).sort(), 'every human copy a both install has is planned').toEqual(wanted);

  const apply = await h.runCli(['update', '--apply', '--yes', OFFLINE], aiOnly);
  expect(apply.code, out(apply)).toBe(0);
  expect(listedStandardFiles(aiOnly), 'the project now holds exactly what a both install holds').toEqual(listedStandardFiles(reference));
}, 240000);

// ── R2: init converges for --format both too ──────────────────────────────────────────────────────────

it('a project just made by uds init --format both previews as "No changes needed", is in the current manifest format, and an immediate apply changes nothing (XSPEC-483 R2)', async () => {
  const dir = await initProject('both');

  const manifest = readManifest(dir);
  expect(manifest.version, 'the manifest is in the current format: the convergence step ran').toBe(CURRENT_SCHEMA_VERSION);
  expect(manifest.format).toBe('both');
  expect(manifest.standards.some((s) => s.startsWith('ai/standards/')), 'standards are recorded by id, not by file path').toBe(false);

  const files = listedStandardFiles(dir);
  expect(files.filter(isAi).length, 'the AI copies are there').toBeGreaterThan(50);
  expect(files.filter(isHuman).length, 'and the human copies').toBeGreaterThan(50);

  const plan = await h.runCli(['update', '--plan', OFFLINE], dir);
  expect(plan.code, out(plan)).toBe(0);
  expect(out(plan)).toContain('No changes needed');
  expect(out(plan)).not.toMatch(/Delete \(|Migrate Block/);

  const before = standardsSnapshot(dir);
  const apply = await h.runCli(['update', '--apply', '--yes', OFFLINE], dir);
  expect(apply.code, out(apply)).toBe(0);
  expect(out(apply)).toContain('Everything is up to date');
  expect(existsSync(join(dir, '.uds-backups')), 'and no backup was needed').toBe(false);
  expect(standardsSnapshot(dir)).toEqual(before);
  expect(listedStandardFiles(dir)).toEqual(files);

  const check = await h.runCli(['check', '--ci', OFFLINE], dir);
  expect(check.code, out(check)).toBe(0);
}, 240000);

// ── R3: a both project an older UDS made upgrades without losing a file, and rolls back ───────────────

for (const version of BOTH_FIXTURE_VERSIONS) {
  it(`a --format both project made by ${version} keeps every .md and .ai.yaml through update --apply, and --rollback restores the files it had (XSPEC-483 R3)`, async () => {
    const dir = makeBothUpgradeProject(h, version);
    const expected = filesTheOldInstallWrote(version).sort();

    // Drift the apply has real work to do on, and a rollback has something to put back: one AI copy and one human copy
    // are missing, one more of each is an older text.
    const ai = expected.filter((p) => isAi(p) && !p.includes('/options/'));
    const human = expected.filter((p) => isHuman(p) && !p.includes('/options/'));
    rmSync(join(dir, ai[0]));
    rmSync(join(dir, human[0]));
    writeFileSync(join(dir, ai[1]), '# an older text\n');
    writeFileSync(join(dir, human[1]), '# an older text\n');
    const before = standardsSnapshot(dir);

    const plan = await h.runCli(['update', '--plan', OFFLINE], dir);
    expect(plan.code, out(plan)).toBe(0);
    expect(planSectionPaths(out(plan), 'Delete'), out(plan)).toEqual([]);
    expect(planSectionPaths(out(plan), 'Create'), 'the two missing copies are planned for creation').toEqual(expect.arrayContaining([ai[0], human[0]]));
    expect(planSectionPaths(out(plan), 'Update'), 'the two older texts are planned for update').toEqual(expect.arrayContaining([ai[1], human[1]]));

    const apply = await h.runCli(['update', '--apply', '--yes', OFFLINE], dir);
    expect(apply.code, out(apply)).toBe(0);
    expect(listedStandardFiles(dir), 'exactly the files the old install wrote are there, none lost and none added').toEqual(expected);
    expect(read(dir, ai[1]), 'the older text was replaced').not.toBe('# an older text\n');
    expect(readManifest(dir).format).toBe('both');

    const after = await h.runCli(['update', '--plan', OFFLINE], dir);
    expect(out(after)).toContain('No changes needed');

    const rollback = await h.runCli(['update', '--rollback'], dir);
    expect(rollback.code, out(rollback)).toBe(0);
    expect(standardsSnapshot(dir), 'every file under .standards, the manifest included, is as it was before the apply').toEqual(before);
  }, 240000);
}
