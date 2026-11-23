/**
 * E2E: an older uds must not write over a project that a NEWER UDS installed (dev-platform #308, decision 666甲).
 *
 * Found 2026-11-23 while accepting a beta: `uds update --apply` run with a global uds OLDER than the project rewrote the project's
 * files with the older ones and recorded the older version, so the project looked consistent and the loss was invisible.
 * Every branch of `uds update` that writes ran before the version comparison, and the helpers that record "this project is at the
 * shipped version" assigned it whatever the recorded version was.
 *
 * What is read back, and why it is not only the exit code: the guard and the "record forward only" rule are two lines of defence
 * that hide each other (cut the guard and the version still does not move back), so the guard is judged by the whole tree of the
 * project (every file's hash is the same after a refused run), and the record rule by a twin of the CLI whose guard is switched
 * off (the harness `overrides`), in which the run really writes (a deleted file comes back) and the version still does not move.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/update.js            `if (refuseOlderCli(manifest, { command: 'update', ...` // wire:update-refuses-older-cli
 *   cli/src/commands/check.js             `... && refuseOlderCli(manifest, { command: 'check --restore', ...` // wire:check-restore-refuses-older-cli
 *   cli/src/commands/config.js            `if (refuseOlderCli(manifest, { command: 'config', ...` // wire:config-refuses-older-cli
 *   cli/src/utils/downgrade-guard.js      `compareVersions(recorded, shipped) > 0` (weaken it: `>=` refuses an equal version; drop the prerelease order and
 *                                         a project at 6.16.1 is not newer than a uds at 6.16.1-beta.N)
 *   cli/src/reconciler/recorded-versions.js   `[mutation-anchor:forward-only]` and the `shouldRecordShipped` in the skills/commands loop
 *   cli/src/reconciler/plan-executor.js   `shouldRecordShipped(updatedManifest.upstream?.version, version)`
 */

import { it, expect, afterAll } from 'vitest';
import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { createHash } from 'crypto';
import { createHarness, REAL_CLI_DIR } from '../utils/staged-cli-harness.js';
import { out } from '../utils/xspec-482.js';

const h = createHarness('older6161');
afterAll(() => { h.cleanup(); off.cleanup(); });

const CLI_VERSION = JSON.parse(readFileSync(join(REAL_CLI_DIR, 'package.json'), 'utf8')).version;
const NEWER = '99.0.0';
const readManifest = (dir) => JSON.parse(readFileSync(join(dir, '.standards', 'manifest.json'), 'utf8'));
const writeManifest = (dir, m) => writeFileSync(join(dir, '.standards', 'manifest.json'), JSON.stringify(m, null, 2));

/** A twin of the CLI whose guard is switched off: the version-recording rule is then the only thing between the run and the manifest. */
const guardSource = readFileSync(join(REAL_CLI_DIR, 'src/utils/downgrade-guard.js'), 'utf8');
const SWITCHED_OFF = guardSource.replace(
  'const newer = findNewerProject(manifest);\n  if (!newer) return false;\n  const m = t().commands.common;',
  'return false; // test twin: guard off\n  const newer = findNewerProject(manifest);\n  if (!newer) return false;\n  const m = t().commands.common;'
);
if (SWITCHED_OFF === guardSource) throw new Error('fixture: the guard source no longer has the line the test twin switches off');
const off = createHarness('older6161-off', { overrides: { 'src/utils/downgrade-guard.js': SWITCHED_OFF } });

/** A real `uds init` project whose manifest says a newer UDS installed it (standards, skills and commands records). */
async function projectInstalledBy(version, harness = h) {
  const dir = await harness.newProject();
  const m = readManifest(dir);
  m.upstream.version = version;
  m.skills.version = version;
  if (m.commands?.installed) m.commands.version = version;
  writeManifest(dir, m);
  return dir;
}

/** Every file under the project (relative path -> sha256): a refused run changes none of them and adds none. */
function snapshot(dir) {
  const files = {};
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else files[relative(dir, p).split('\\').join('/')] = createHash('sha256').update(readFileSync(p)).digest('hex');
    }
  };
  walk(dir);
  return files;
}

const REFUSED_FORMS = [
  ['update', '--apply', '--yes'],
  ['update', '--yes'],
  ['update', '--force', '--yes'],
  ['update', '--skills', '--yes'],
  ['update', '--commands', '--yes'],
  ['update', '--apply', '--yes', '--skills'],
  ['update', '--integrations-only', '--yes'],
  ['update', '--sync-refs'],
  ['update', '--with-hooks'],
  ['update', '--add-skill', 'open-work', '--yes'],
  ['update', '--claude-target', 'local'],
  ['config', '--type', 'format', '--yes'],
  ['check', '--restore'],
  ['check', '--restore-missing']
];

it.each(REFUSED_FORMS)('uds %s refuses in a project a newer UDS installed: exit 1, says what to do, and no file of the project changes (#308)', async (...args) => {
  const dir = await projectInstalledBy(NEWER);
  const before = snapshot(dir);
  const run = await h.runCli(args[0] === 'config' ? args : [...args, '--offline'], dir); // `config` has no --offline
  const text = out(run);
  expect(run.code, text).toBe(1);
  expect(text).toContain(`installed by UDS ${NEWER}`);
  expect(text).toContain(`your uds is ${CLI_VERSION} (older)`);
  expect(text).toContain(`npm i -g universal-dev-standards@${NEWER}`);
  expect(text).toContain('--allow-downgrade');
  expect(snapshot(dir), 'a refused run wrote nothing').toEqual(before);
}, 240000);

it('a project recorded at the release of this uds\'s own prerelease is newer, not equal (6.16.1 vs 6.16.1-beta.N) (#308)', async (ctx) => {
  const [core, pre] = CLI_VERSION.split('-');
  if (!pre) ctx.skip(); // this uds is a release: there is no stable twin of it that is newer; the table in the unit test covers the order
  const dir = await projectInstalledBy(core);
  const before = snapshot(dir);
  const run = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(run.code, out(run)).toBe(1);
  expect(out(run)).toContain(`installed by UDS ${core}`);
  expect(snapshot(dir)).toEqual(before);
}, 240000);

it('control: a project recorded at this uds\'s own version is not refused (#308)', async () => {
  const dir = await projectInstalledBy(CLI_VERSION);
  const run = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(out(run)).not.toContain('older');
}, 240000);

it('`update --plan` still runs in a newer project: it warns first, prints the plan, exits 0 and writes nothing (#308)', async () => {
  const dir = await projectInstalledBy(NEWER);
  const before = snapshot(dir);
  const run = await h.runCli(['update', '--plan', '--offline'], dir);
  const text = out(run);
  expect(run.code, text).toBe(0);
  expect(text).toContain(`installed by UDS ${NEWER}`);
  expect(text.indexOf(`installed by UDS ${NEWER}`)).toBeLessThan(text.indexOf('Reconciliation Plan'));
  expect(text).toContain('Reconciliation Plan');
  expect(snapshot(dir)).toEqual(before);
}, 240000);

it('`uds check` in a newer project says the uds is the old one, shows no arrow to the older version, and `--ci` exits as it does for an equal one (#308)', async () => {
  const dir = await projectInstalledBy(NEWER);
  const equal = await projectInstalledBy(CLI_VERSION);
  const before = snapshot(dir);
  const run = await h.runCli(['check', '--offline'], dir);
  const text = out(run);
  expect(run.code, text).toBe(0);
  expect(text).toContain(`Your uds (${CLI_VERSION}) is older than the version this project uses (${NEWER})`);
  expect(text).not.toContain(`→ v${CLI_VERSION}`);
  expect(text).not.toContain('then `--apply` to update');
  const ci = await h.runCli(['check', '--ci', '--offline'], dir);
  const ciEqual = await h.runCli(['check', '--ci', '--offline'], equal);
  expect(ci.code, out(ci)).toBe(ciEqual.code);
  expect(snapshot(dir), 'check wrote nothing').toEqual(before);
}, 240000);

it('`update --rollback` is let through with a note: it restores the backup the user chose (#308)', async () => {
  // a project at an older version: a real `--apply` makes the backup
  const dir = await projectInstalledBy('6.15.0');
  const victim = join(dir, '.standards', 'testing.ai.yaml');
  unlinkSync(victim); // something for --apply to do, so that it makes a backup
  const apply = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(apply.code, out(apply)).toBe(0);
  expect(out(apply)).toContain('Use `uds update --rollback` to undo.');
  expect(readManifest(dir).upstream.version).toBe(CLI_VERSION);
  expect(existsSync(victim)).toBe(true);
  // then the project is recorded as newer than this uds, and the user rolls back
  const m = readManifest(dir);
  m.upstream.version = NEWER;
  writeManifest(dir, m);
  const run = await h.runCli(['update', '--rollback', '--yes', '--offline'], dir);
  const text = out(run);
  expect(run.code, text).toBe(0);
  expect(text).toContain('--rollback restores the backup you chose');
  expect(text).not.toContain('Nothing was written');
  expect(readManifest(dir).upstream.version, 'the backup was restored: the manifest is the one from before the apply').toBe('6.15.0');
  expect(existsSync(victim), 'and the standard the apply created is gone again').toBe(false);
}, 300000);

it('`update --apply --allow-downgrade` goes ahead and records this uds\'s version (#308)', async () => {
  const dir = await projectInstalledBy(NEWER);
  const run = await h.runCli(['update', '--apply', '--yes', '--allow-downgrade', '--offline'], dir);
  const text = out(run);
  expect(run.code, text).toBe(0);
  expect(text).toContain('--allow-downgrade is on');
  const after = readManifest(dir);
  expect(after.upstream.version).toBe(CLI_VERSION);
  expect(after.skills.version).toBe(CLI_VERSION);
}, 240000);

// Second line of defence, with the guard switched off (the twin): the run really writes, and the version records still do not move back.
it('with the guard switched off, `update --apply` that has nothing to apply still does not move the recorded versions back (#308)', async () => {
  const dir = await projectInstalledBy(NEWER, off);
  const run = await off.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(out(run)).toContain('Everything is up to date');
  const after = readManifest(dir);
  expect(after.upstream.version).toBe(NEWER);
  expect(after.skills.version).toBe(NEWER);
}, 240000);

it('with the guard switched off, an `update --apply` that writes (a deleted standard comes back) does not move the recorded versions back (#308)', async () => {
  const dir = await projectInstalledBy(NEWER, off);
  const victim = join(dir, '.standards', 'testing.ai.yaml');
  expect(existsSync(victim), 'fixture').toBe(true);
  unlinkSync(victim);
  const run = await off.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(existsSync(victim), 'control: the unguarded run really wrote').toBe(true);
  const after = readManifest(dir);
  expect(after.upstream.version).toBe(NEWER);
  expect(after.skills.version).toBe(NEWER);
}, 240000);

it('with the guard switched off, an `update --apply` that reinstalls a deleted skill file does not move the skills record back (#308)', async () => {
  const dir = await projectInstalledBy(NEWER, off);
  const skillsDir = join(dir, '.claude', 'skills');
  const skill = readdirSync(skillsDir).find((n) => existsSync(join(skillsDir, n, 'SKILL.md')));
  expect(skill, 'fixture: a skill is installed in the project').toBeTruthy();
  const victim = join(skillsDir, skill, 'SKILL.md');
  unlinkSync(victim);
  const run = await off.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(existsSync(victim), 'control: the unguarded run really reinstalled it').toBe(true);
  expect(readManifest(dir).skills.version).toBe(NEWER);
}, 240000);

it('with the guard switched off, `update --skills` does not move the skills record back (#308)', async () => {
  const dir = await projectInstalledBy(NEWER, off);
  const run = await off.runCli(['update', '--skills', '--yes', '--offline'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(readManifest(dir).skills.version).toBe(NEWER);
}, 240000);
