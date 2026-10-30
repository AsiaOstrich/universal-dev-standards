/**
 * E2E: `open-work-tracking` stops being a standard and becomes the optional skill `open-work`
 * (dev-platform XSPEC-427, decision 209甲).
 *
 *   Defect  The standard asked every adopter to keep a capture inbox, write a release condition for each wait and so on. It had been
 *           calibrated on one project, and that project's own use did not confirm it. It is now a skill an adopter picks up when work
 *           is getting lost. The standard's `.ai.yaml` and registry entry are gone; `core/open-work-tracking.md` stays as a reference.
 *   What must hold, each read back from disk after running the real CLI:
 *     1. a new `uds init` installs the skill and none of the standard (no file, no manifest entry, no mention in CLAUDE.md / AGENTS.md);
 *     2. a project the PREVIOUS UDS set up (it holds the standard) ends `uds update --apply` with the file gone and NO trace of its name
 *        left behind: not in `manifest.standards`, not in the integration config snapshot, not in CLAUDE.md or AGENTS.md, and `uds check`
 *        has nothing to warn about. Before this change the file went and the name stayed, so `uds check` warned "Manifest entries that
 *        match no installed standard" and CLAUDE.md carried "1 manifest entry could not be matched to an installed file";
 *     3. the same through the older `uds update` path, which never deleted the file but must not leave the name either;
 *     4. `uds update --rollback` brings the file and the manifest entry back.
 *
 * "The previous UDS" is real: tests/fixtures/open-work-tracking/retired-install/ holds the manifest, CLAUDE.md, AGENTS.md and standard file
 * that UDS at c64eedeb wrote (see its README). Every test spawns the real CLI through tests/utils/staged-cli-harness.js (throwaway HOME,
 * network refused, git config pointed at an empty file) and starts from its own project, so each one also passes when run alone.
 *
 * Wires that make these red when cut (each is one line of source):
 *   cli/standards-registry.json                       the "open-work-assistant" entry of `skillFiles`        (the skill is not installed)
 *   cli/standards-registry.json                       the "open-work-tracking" entry of `standards`, put back (the standard is installed again)
 *   cli/src/reconciler/plan-executor.js               if (action.category === 'standard') dropRetiredStandardEntries(manifest, action.path);
 */

import { it, expect, afterAll } from 'vitest';
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness, REAL_CLI_DIR, REAL_REPO } from '../utils/staged-cli-harness.js';
import { out, readManifest, writeManifest } from '../utils/xspec-482.js';

const h = createHarness('xspec427');
afterAll(() => h.cleanup());

const FIXTURE = join(REAL_CLI_DIR, 'tests', 'fixtures', 'open-work-tracking', 'retired-install');
const STANDARD_FILE = join('.standards', 'open-work-tracking.ai.yaml');
const SKILL_DIR = join('.claude', 'skills', 'open-work-assistant');
const OFFLINE = '--offline';

/** Every CLI run in this file: git's global and system config point at nothing, on top of the harness's throwaway HOME. */
let gitEnv = null;
function env() {
  if (!gitEnv) {
    const dir = h.makeDir('git-nothing');
    writeFileSync(join(dir, 'empty-gitconfig'), '');
    gitEnv = { GIT_CONFIG_GLOBAL: join(dir, 'empty-gitconfig'), GIT_CONFIG_SYSTEM: join(dir, 'empty-gitconfig'), GIT_CONFIG_NOSYSTEM: '1' };
  }
  return { env: gitEnv };
}
const run = (args, dir) => h.runCli(args, dir, env());

const read = (dir, rel) => readFileSync(join(dir, rel), 'utf-8');
/** Markdown with the link targets blanked: an install rewrites links that point outside it, nothing else. */
const withoutLinkTargets = (text) => text.replace(/\]\([^)]*\)/g, ']()');
/** Paths in `manifest.fileHashes` / `manifest.skillHashes` naming the standard or the skill. */
const keysNaming = (table, needle) => Object.keys(table || {}).filter((k) => k.includes(needle));
const standardsNaming = (manifest) => manifest.standards.filter((s) => s.includes('open-work-tracking'));

/** A project the PREVIOUS UDS set up: today's `uds init` project with the files that UDS (c64eedeb) wrote on top, and without the new skill. */
async function projectFromPreviousUds() {
  const dir = await h.newProject();
  cpSync(join(FIXTURE, 'manifest.json'), join(dir, '.standards', 'manifest.json'));
  cpSync(join(FIXTURE, 'open-work-tracking.ai.yaml'), join(dir, STANDARD_FILE));
  cpSync(join(FIXTURE, 'CLAUDE.md'), join(dir, 'CLAUDE.md'));
  cpSync(join(FIXTURE, 'AGENTS.md'), join(dir, 'AGENTS.md'));
  rmSync(join(dir, SKILL_DIR), { recursive: true, force: true });
  return dir;
}

it('uds init on a new project installs the open-work skill and none of the open-work-tracking standard, and uds check has nothing to say (XSPEC-427)', async () => {
  const dir = await h.newProject(); // the real `uds init --yes --skills-location project`

  // The standard is not installed: no file, no manifest entry, no hash record, no mention in the instruction files.
  expect(existsSync(join(dir, STANDARD_FILE)), 'no standard file').toBe(false);
  const manifest = readManifest(dir);
  expect(standardsNaming(manifest), 'manifest.standards does not name it').toEqual([]);
  expect(keysNaming(manifest.fileHashes, 'open-work-tracking'), 'no file hash for it').toEqual([]);
  expect(JSON.stringify(manifest.integrationConfigs), 'the integration config does not list it').not.toContain('open-work-tracking');
  for (const file of ['CLAUDE.md', 'AGENTS.md']) expect(read(dir, file), `${file} does not name it`).not.toContain('open-work-tracking');
  expect(manifest.standards.length, 'control: other standards were installed, so this is not an empty init').toBeGreaterThan(50);

  // The skill is installed, with the text the repository ships, and recorded.
  expect(existsSync(join(dir, SKILL_DIR, 'SKILL.md')), 'the skill file is on disk').toBe(true);
  const shipped = readFileSync(join(REAL_REPO, 'skills', 'open-work-assistant', 'SKILL.md'), 'utf-8');
  expect(withoutLinkTargets(read(dir, join(SKILL_DIR, 'SKILL.md')))).toBe(withoutLinkTargets(shipped));
  expect(read(dir, join(SKILL_DIR, 'SKILL.md'))).toMatch(/^name: open-work$/m);
  expect(keysNaming(manifest.skillHashes, 'open-work-assistant').length, 'the skill file is in skillHashes').toBeGreaterThan(0);

  // Nothing for `uds check` to warn about.
  const check = await run(['check', '--ci', OFFLINE], dir);
  expect(check.code, out(check)).toBe(0);
  expect(out(check)).toContain('Project is compliant with standards');
  expect(out(check)).not.toMatch(/match no installed standard|could not be matched/);
}, 120000);

it('uds update --apply on a project the previous UDS set up removes the open-work-tracking file and every trace of its name, installs the skill, and leaves uds check clean (XSPEC-427)', async () => {
  const dir = await projectFromPreviousUds();

  // Control: this really is the old situation, and the plan says what will happen.
  expect(existsSync(join(dir, STANDARD_FILE))).toBe(true);
  expect(standardsNaming(readManifest(dir)), 'control: the old manifest lists the standard').toEqual(['open-work-tracking']);
  expect(read(dir, 'CLAUDE.md'), 'control: the old CLAUDE.md names it').toContain('open-work-tracking');
  expect(read(dir, 'AGENTS.md'), 'control: and so does the old AGENTS.md').toContain('open-work-tracking');
  const plan = await run(['update', '--plan', OFFLINE], dir);
  expect(plan.code, out(plan)).toBe(0);
  expect(out(plan)).toContain(`- .standards/open-work-tracking.ai.yaml (UDS no longer ships this file`);
  expect(out(plan)).toContain('+ .claude/skills/open-work-assistant');
  expect(existsSync(join(dir, STANDARD_FILE)), 'a plan removes nothing').toBe(true);

  const apply = await run(['update', '--apply', '--yes', OFFLINE], dir);
  expect(apply.code, out(apply)).toBe(0);

  // The file is gone and so is its name, everywhere it was.
  expect(existsSync(join(dir, STANDARD_FILE)), 'the standard file was removed').toBe(false);
  const manifest = readManifest(dir);
  expect(standardsNaming(manifest), 'manifest.standards no longer names it').toEqual([]);
  expect(keysNaming(manifest.fileHashes, 'open-work-tracking'), 'nor does fileHashes').toEqual([]);
  expect(JSON.stringify(manifest.integrationConfigs), 'nor the integration config snapshot').not.toContain('open-work-tracking');
  for (const file of ['CLAUDE.md', 'AGENTS.md']) expect(read(dir, file), `${file} no longer names it`).not.toContain('open-work-tracking');
  expect(read(dir, 'CLAUDE.md'), 'and CLAUDE.md carries no "could not be matched" note').not.toMatch(/could not be matched to an installed file/);

  // The skill arrived.
  expect(existsSync(join(dir, SKILL_DIR, 'SKILL.md'))).toBe(true);
  expect(keysNaming(manifest.skillHashes, 'open-work-assistant').length).toBeGreaterThan(0);

  // `uds check` has nothing to warn about, and a second plan has nothing to do.
  const check = await run(['check', '--offline'], dir);
  expect(check.code, out(check)).toBe(0);
  expect(out(check)).toContain('Project is compliant with standards');
  expect(out(check), 'no ghost entry warning').not.toMatch(/Manifest entries that match no installed standard/);
  const again = await run(['update', '--plan', OFFLINE], dir);
  expect(out(again)).toContain('No changes needed');
}, 180000);

it('uds update --apply deletes an open-work-tracking file the adopter edited too, after copying it to the backup, and --rollback brings back the file and the manifest entry (XSPEC-427)', async () => {
  const dir = await projectFromPreviousUds();
  const file = join(dir, STANDARD_FILE);
  const edited = `${readFileSync(file, 'utf-8')}\n# a line the adopter added (XSPEC-427 test)\n`;
  writeFileSync(file, edited);

  const apply = await run(['update', '--apply', '--yes', OFFLINE], dir);
  expect(apply.code, out(apply)).toBe(0);
  expect(existsSync(file), 'the edited file was removed, as any file UDS no longer ships is').toBe(false);

  // The backup taken first holds the edited text.
  const backups = readdirSync(join(dir, '.uds-backups'), { withFileTypes: true }).filter((e) => e.isDirectory());
  expect(backups.length, 'one backup was taken').toBe(1);
  expect(readFileSync(join(dir, '.uds-backups', backups[0].name, STANDARD_FILE), 'utf-8'), 'and it holds the adopter\'s text').toBe(edited);

  const rollback = await run(['update', '--rollback', '--yes'], dir);
  expect(rollback.code, out(rollback)).toBe(0);
  expect(readFileSync(file, 'utf-8'), 'the file is back, edit included').toBe(edited);
  expect(standardsNaming(readManifest(dir)), 'and the manifest names it again, as it did before the apply').toEqual(['open-work-tracking']);
  expect(keysNaming(readManifest(dir).fileHashes, 'open-work-tracking')).toEqual(['.standards/open-work-tracking.ai.yaml']);
}, 180000);

it('the older uds update path (no --apply) also leaves no name of open-work-tracking in the manifest, and uds check has nothing to warn about (XSPEC-427)', async () => {
  const dir = await projectFromPreviousUds();
  // `uds update` only acts when the recorded version is behind the one UDS ships.
  writeManifest(dir, { ...readManifest(dir), upstream: { ...readManifest(dir).upstream, version: '6.13.0' } });

  const update = await run(['update', '--yes', OFFLINE], dir);
  expect(update.code, out(update)).toBe(0);
  expect(out(update), 'control: the older path really ran').toContain('Update available: 6.13.0');

  const manifest = readManifest(dir);
  expect(standardsNaming(manifest), 'manifest.standards no longer names the standard').toEqual([]);
  const check = await run(['check', '--offline'], dir);
  expect(check.code, out(check)).toBe(0);
  expect(out(check)).toContain('Project is compliant with standards');
  expect(out(check), 'no ghost entry warning').not.toMatch(/Manifest entries that match no installed standard/);
}, 180000);

it('the repository ships the skill and the reference document, and no longer ships the standard (XSPEC-427)', () => {
  const registry = JSON.parse(readFileSync(join(REAL_CLI_DIR, 'standards-registry.json'), 'utf-8'));
  expect(registry.standards.find((s) => s.id === 'open-work-tracking'), 'no registry entry for the standard').toBeUndefined();
  expect(registry.skillFiles['open-work-assistant'], 'the skill is registered with its files').toEqual(['skills/open-work-assistant/SKILL.md']);
  for (const file of registry.skillFiles['open-work-assistant']) expect(existsSync(join(REAL_REPO, file)), file).toBe(true);
  expect(existsSync(join(REAL_REPO, 'ai', 'standards', 'open-work-tracking.ai.yaml')), 'no .ai.yaml').toBe(false);
  expect(existsSync(join(REAL_REPO, 'core', 'open-work-tracking.md')), 'the reference document stays').toBe(true);
  expect(read(REAL_REPO, join('core', 'open-work-tracking.md')).split('\n').slice(0, 12).join('\n'), 'and says in its header that it is reference only').toContain('<!-- UDS:REFERENCE-ONLY');
  const listed = JSON.parse(readFileSync(join(REAL_REPO, 'scripts', 'reference-only-standards.json'), 'utf-8')).referenceOnlyCore;
  expect(listed).toContain('open-work-tracking');
  for (const locale of ['zh-TW', 'zh-CN']) {
    expect(existsSync(join(REAL_REPO, 'locales', locale, 'skills', 'open-work-assistant', 'SKILL.md')), `${locale} skill`).toBe(true);
  }
});
