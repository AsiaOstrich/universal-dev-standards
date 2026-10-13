/**
 * E2E: a new project is already in the form `uds update` leaves it in, the three upgrade previews agree, and an older
 * UDS's backup can be reached by name (dev-platform XSPEC-482 R6, R7, R11; beta.12 findings Linux N1, N3, macOS N7).
 *
 *   R6   `uds init` wrote the manifest in the 3.3.0 form and an integration block ordered differently from the one
 *        `update` writes, so the first `uds update --plan` on a brand new project listed changes and the first `--apply`
 *        rewrote the manifest and the whole standards index of GEMINI.md. `init` now leaves the project in the current form.
 *   R7   `update --plan --commands` said "N command(s) would be reinstalled" for a project `update --plan` called
 *        unchanged. The three previews now ask the same question.
 *   R11  with a backup of 6.11.0 beside newer ones, the second `--rollback` picked the same newest series again and the
 *        older backup could not be reached. `--rollback --from <backup>` restores a named one, and the message gives the
 *        true reason the older one is not in the series.
 *
 * Every test runs the real CLI in a throwaway project and reads files and printed lines back.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/init.js     const converged = await reconcile(projectPath, { backup: false }); // wire:init-converges-to-current-format
 *   cli/src/commands/update.js   ... would be written or removed ... // wire:plan-commands-asks-reconciler
 *   cli/src/commands/update.js   for (const b of backups.slice(inSeries)) console.log(...); // wire:rollback-names-older-backups
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync, cpSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { CURRENT_SCHEMA_VERSION } from '../../src/core/manifest.js';
import { out, readManifest, writeManifest } from '../utils/xspec-482.js';

const h = createHarness('xspec482-r6-r7-r11');
afterAll(() => h.cleanup());

const FIXTURE_BACKUP = resolve(import.meta.dirname, '../fixtures/older-uds-backup-6.11.0');
const OFFLINE = '--offline';
const read = (dir, rel) => readFileSync(join(dir, rel), 'utf-8');
/** The backup folders in .uds-backups/ (it also holds a .gitignore of its own). */
const backupFolders = (dir) => readdirSync(join(dir, '.uds-backups')).filter((f) => !f.startsWith('.'));

/** A project where Claude Code, Cursor, Gemini CLI and Codex/OpenCode (AGENTS.md) are all detected, so every integration file and commands exist. */
async function fullProject(extra = []) {
  const dir = h.makeDir('full');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  writeFileSync(join(dir, '.cursorrules'), '# mine\n');
  writeFileSync(join(dir, 'GEMINI.md'), '# mine\n');
  writeFileSync(join(dir, 'AGENTS.md'), '# mine\n');
  const init = await h.runCli(['init', '--yes', '--skills-location', 'project', ...extra], dir);
  expect(init.code, out(init)).toBe(0);
  return dir;
}

// ── R6 ──────────────────────────────────────────────────────────────────────

for (const lang of ['english', 'traditional-chinese', 'bilingual']) {
  it(`a project just made by uds init --output-lang ${lang} previews as "No changes needed", is in the current manifest format, and an immediate apply rewrites no integration file (XSPEC-482 R6)`, async () => {
    const dir = await fullProject(['--output-lang', lang]);

    const manifest = readManifest(dir);
    expect(manifest.version, 'the manifest is in the current format').toBe(CURRENT_SCHEMA_VERSION);
    expect(manifest.standards.some((s) => s.startsWith('ai/standards/')), 'standards are recorded by id, not by file path (option files keep their path)').toBe(false);

    const plan = await h.runCli(['update', '--plan', OFFLINE], dir);
    expect(plan.code, out(plan)).toBe(0);
    expect(out(plan)).toContain('No changes needed');
    expect(out(plan)).not.toContain('Migrate Block');

    const files = ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md', '.cursorrules'];
    const before = Object.fromEntries(files.map((f) => [f, read(dir, f)]));
    const apply = await h.runCli(['update', '--apply', '--yes', OFFLINE], dir);
    expect(apply.code, out(apply)).toBe(0);
    expect(out(apply)).toContain('Everything is up to date');
    for (const f of files) expect(read(dir, f), `${f} unchanged by the first apply`).toBe(before[f]);
    expect(existsSync(join(dir, '.uds-backups')), 'and no backup was needed').toBe(false);

    // The install is also whole: the check finds nothing wrong.
    const check = await h.runCli(['check', '--ci', OFFLINE], dir);
    expect(check.code, out(check)).toBe(0);
  }, 240000);
}

it('uds init keeps the uninstall records: uds uninstall right after init removes what init wrote and nothing of the user\'s (XSPEC-482 R6, control)', async () => {
  const dir = await fullProject();
  expect(Object.keys(readManifest(dir).installedArtifacts || {}).length, 'fixture: init recorded what it wrote').toBeGreaterThan(0);
  const run = await h.runCli(['uninstall', '--yes'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(existsSync(join(dir, '.standards'))).toBe(false);
  expect(read(dir, 'GEMINI.md')).toContain('# mine');
  expect(read(dir, '.cursorrules')).toContain('# mine');
}, 240000);

// ── R7 ──────────────────────────────────────────────────────────────────────

it('update --plan, --plan --skills and --plan --commands reach the same verdict on a current project, and the same one after a command file is deleted (XSPEC-482 R7)', async () => {
  const dir = await fullProject();
  expect(readManifest(dir).commands.installations.length, 'fixture: commands are installed for more than one tool').toBeGreaterThan(1);

  const all = await h.runCli(['update', '--plan', OFFLINE], dir);
  const skills = await h.runCli(['update', '--plan', '--skills', OFFLINE], dir);
  const commands = await h.runCli(['update', '--plan', '--commands', OFFLINE], dir);
  expect(out(all)).toContain('No changes needed');
  expect(out(skills)).toContain('Summary: 0 installation(s) would be updated');
  expect(out(commands)).toMatch(/Summary: 0 installation\(s\) would be reinstalled, \d+ unchanged/);
  expect(out(commands)).not.toContain('would be reinstalled  '); // no "~" line
  expect(out(commands)).toMatch(/= .*\(project\): \d+ command\(s\) — unchanged/);

  // One command file gone: the full plan lists it, and the commands plan names the tool it belongs to, and only that tool.
  const gone = join(dir, '.gemini', 'commands');
  const victim = readdirSync(gone).filter((f) => !f.startsWith('.'))[0];
  rmSync(join(gone, victim));
  const all2 = await h.runCli(['update', '--plan', OFFLINE], dir);
  const commands2 = await h.runCli(['update', '--plan', '--commands', OFFLINE], dir);
  expect(out(all2)).toContain(`.gemini/commands/${victim}`);
  expect(out(commands2)).toMatch(/~ Gemini CLI \(project\): 1 command file\(s\) would be written or removed/);
  expect(out(commands2)).toMatch(/Summary: 1 installation\(s\) would be reinstalled/);
  expect(out(commands2)).toMatch(/= OpenCode \(project\): \d+ command\(s\) — unchanged/);
}, 240000);

it('update --plan --skills calls an installation changed when a skill file is gone even though its recorded version is current (XSPEC-482 R7)', async () => {
  const dir = await fullProject();
  rmSync(join(dir, '.claude', 'skills', 'commit-standards'), { recursive: true, force: true });
  const skills = await h.runCli(['update', '--plan', '--skills', OFFLINE], dir);
  expect(out(skills)).toMatch(/~ Claude Code \(project\): v[\w.-]+ — \d+ skill file\(s\) differ from what this UDS ships/);
  expect(out(skills)).toMatch(/Summary: 1 installation\(s\) would be updated/);
}, 240000);

// ── R11 ─────────────────────────────────────────────────────────────────────

const OLD_BACKUP = '.uds-backup-2026-10-13T05-53-52-485Z-0001';

/** A project with the backup 6.11.0 left (the fixture) and a newer backup made by this UDS. */
async function projectWithTwoGenerations() {
  const dir = await fullProject();
  cpSync(FIXTURE_BACKUP, join(dir, OLD_BACKUP), { recursive: true });
  rmSync(join(dir, OLD_BACKUP, 'README.md')); // the explanation of the fixture is not part of what 6.11.0 wrote
  rmSync(join(dir, '.standards', 'testing.ai.yaml'));
  const apply = await h.runCli(['update', '--apply', '--yes', OFFLINE], dir); // makes a backup in .uds-backups/
  expect(apply.code, out(apply)).toBe(0);
  expect(backupFolders(dir).length, 'fixture: a new-format backup exists').toBe(1);
  return dir;
}

it('with a 6.11.0 backup beside a newer one, --rollback says the older one cannot be joined to the series and how to restore it with --from, and --from restores exactly that backup (XSPEC-482 R11)', async () => {
  const dir = await projectWithTwoGenerations();
  const wanted = readFileSync(join(FIXTURE_BACKUP, 'CLAUDE.md'), 'utf-8');
  expect(read(dir, 'CLAUDE.md'), 'fixture: the project\'s CLAUDE.md is not the backed-up one').not.toBe(wanted);

  const first = await h.runCli(['update', '--rollback'], dir);
  expect(first.code, out(first)).toBe(0);
  expect(existsSync(join(dir, '.standards', 'testing.ai.yaml')), 'the newer backup was restored: the standard the apply put back is gone again').toBe(false);
  expect(out(first)).toContain('1 older backup(s) are not part of that series (it was made by an older UDS, which did not record what links one backup to the next');
  expect(out(first)).not.toContain('something else changed the project');
  expect(out(first)).toContain('`uds update --rollback --from <backup>`');
  expect(out(first)).toContain(OLD_BACKUP);
  expect(read(dir, 'CLAUDE.md'), 'the older backup was left alone').not.toBe(wanted);

  // Naming it restores it. Both spellings: the id as printed, and the folder name.
  const byId = await h.runCli(['update', '--rollback', '--from', OLD_BACKUP], dir);
  expect(byId.code, out(byId)).toBe(0);
  expect(out(byId)).toContain(`Rolling back from: ${OLD_BACKUP}`);
  expect(read(dir, 'CLAUDE.md'), 'CLAUDE.md is the one 6.11.0 backed up').toBe(wanted);
  expect(read(dir, 'AGENTS.md')).toBe(readFileSync(join(FIXTURE_BACKUP, 'AGENTS.md'), 'utf-8'));
  expect(out(byId)).toContain('Restored 2 file(s), removed 0 file(s)');
  expect(out(byId), 'and it still says what an older backup cannot give back').toContain('was made by an older UDS');
}, 300000);

it('--rollback --from with a name no backup has exits 1 and lists the backups there are, restoring nothing (XSPEC-482 R11)', async () => {
  const dir = await projectWithTwoGenerations();
  const before = read(dir, 'CLAUDE.md');
  const run = await h.runCli(['update', '--rollback', '--from', 'no-such-backup'], dir);
  expect(run.code, out(run)).toBe(1);
  expect(out(run)).toContain('No backup named "no-such-backup"');
  expect(out(run)).toContain(OLD_BACKUP);
  expect(out(run)).toMatch(/\.uds-backups\/[\w.-]+/);
  expect(read(dir, 'CLAUDE.md')).toBe(before);
  expect(existsSync(join(dir, '.standards', 'testing.ai.yaml')), 'nothing was rolled back: the standard the apply put back is still there').toBe(true);
}, 300000);

it('two backups of this UDS that do not chain (the manifest changed in between) are explained as "something else changed the project", and --from reaches the older (XSPEC-482 R11)', async () => {
  const dir = await fullProject();
  rmSync(join(dir, '.standards', 'testing.ai.yaml'));
  expect((await h.runCli(['update', '--apply', '--yes', OFFLINE], dir)).code).toBe(0);
  const firstSeries = backupFolders(dir);
  expect(firstSeries.length, 'fixture: the first apply made a backup').toBeGreaterThan(0);
  // Something else changes the manifest between the two applies.
  const m = readManifest(dir);
  m.note = 'edited by hand';
  writeManifest(dir, m);
  rmSync(join(dir, '.standards', 'logging.ai.yaml'), { force: true });
  expect((await h.runCli(['update', '--apply', '--yes', OFFLINE], dir)).code).toBe(0);
  const all = backupFolders(dir);
  expect(all.length, 'fixture: the second apply added backups').toBeGreaterThan(firstSeries.length);
  const older = firstSeries[0];

  const run = await h.runCli(['update', '--rollback'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(out(run)).toMatch(/\d+ older backup\(s\) are not part of that series \(something else changed the project after it was made\)/);
  expect(out(run)).not.toContain('made by an older UDS');
  expect(out(run)).toContain(`.uds-backups/${older}`);

  const named = await h.runCli(['update', '--rollback', '--from', older], dir); // folder name only
  expect(named.code, out(named)).toBe(0);
  expect(out(named)).toContain(`Rolling back from: .uds-backups/${older}`);
}, 300000);
