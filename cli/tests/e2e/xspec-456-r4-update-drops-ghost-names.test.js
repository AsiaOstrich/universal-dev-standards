/**
 * E2E: `uds update` drops the skill and command NAMES UDS cannot vouch for (dev-platform XSPEC-456 R4).
 *
 * The report: `uds update --apply --skills` removed the `_shared`, `agents`, `ai`, `tools` and `workflows`
 * folders an old CLI had copied into the skills folder and cleaned `skillHashes` down to 56 skills - but
 * `manifest.skills.names` still listed 61 names, those five included. XSPEC-454 R2 cleaned two of the four
 * manifest fields that record skill/command names and left the other two.
 *
 * Fields that record skill or command names (all four are checked here): skills.names, commands.names,
 * skillHashes, commandHashes.
 *
 * Every test spawns the real CLI (`uds update ...`) in a throwaway project that `uds init` set up, after the
 * manifest has been aged to look like one written by an older UDS, and reads the manifest back.
 *
 * Wires that make these red when cut (each is one line of CLI source):
 *   cli/src/reconciler/index.js    pruneForeignSkillNames(namesProbe, '');            (uds update --apply)
 *   cli/src/commands/update.js     pruneForeignSkillNames(manifest, projectPath, { checkDisk: true });   (--skills)
 *   cli/src/commands/update.js     pruneForeignSkillNames(manifest, projectPath);     (already up to date)
 */

import { it, expect, afterAll } from 'vitest';
import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHarness, REAL_REPO } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec456-r4');
afterAll(() => h.cleanup());

const GHOST_DIRS = ['_shared', 'agents', 'ai', 'tools', 'workflows'];
const RETIRED_SKILL = 'methodology-system'; // a name an older UDS shipped and this one does not
const RETIRED_COMMAND = 'retired-command-456';

const shippedSkills = () => new Set(readdirSync(join(REAL_REPO, 'skills'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(REAL_REPO, 'skills', e.name, 'SKILL.md')))
  .map((e) => e.name));

const readManifest = (dir) => JSON.parse(readFileSync(join(dir, '.standards', 'manifest.json'), 'utf-8'));
const writeManifest = (dir, m) => writeFileSync(join(dir, '.standards', 'manifest.json'), JSON.stringify(m, null, 2));

/** What the tester's project looked like: ghost folders on disk, in the hashes, and in the name lists. */
function addGhosts(dir, { olderVersion }) {
  const m = readManifest(dir);
  for (const d of GHOST_DIRS) {
    mkdirSync(join(dir, '.claude', 'skills', d), { recursive: true });
    writeFileSync(join(dir, '.claude', 'skills', d, 'README.md'), '# copied in by an old CLI\n');
    m.skills.names.push(d);
    m.skillHashes[`claude-code/project/${d}/README.md`] = { hash: 'sha256:' + '0'.repeat(64), size: 10, installedAt: '2026-01-01T00:00:00.000Z' };
  }
  m.skills.names.push(RETIRED_SKILL);
  m.commands.names.push(RETIRED_COMMAND);
  m.skills.names.sort();
  if (olderVersion) m.upstream.version = '6.9.0';
  writeManifest(dir, m);
  return m.skills.names.length;
}

/** Everything the manifest says about skill and command names, as one list of problems. */
function problems(dir) {
  const m = readManifest(dir);
  const shipped = shippedSkills();
  const out = [];
  for (const n of m.skills.names) {
    if (!shipped.has(n)) out.push(`skills.names lists "${n}", which UDS does not ship`);
    else if (!existsSync(join(dir, '.claude', 'skills', n))) out.push(`skills.names lists "${n}", which is not on disk`);
  }
  for (const n of m.commands.names) {
    if (n === RETIRED_COMMAND) out.push(`commands.names lists "${n}", which UDS does not ship`);
  }
  for (const key of Object.keys(m.skillHashes)) {
    if (!shipped.has(key.split('/')[2])) out.push(`skillHashes has a record for "${key}"`);
  }
  return out;
}

it('uds update --apply --skills leaves skills.names with only the skills that are on disk and shipped by UDS, none of the five ghost folders (XSPEC-456 R4)', async () => {
  const dir = await h.newProject();
  const shipped = shippedSkills();
  const before = addGhosts(dir, { olderVersion: true });
  expect(before, 'fixture: the manifest names more skills than UDS ships').toBe(shipped.size + GHOST_DIRS.length + 1);
  expect(problems(dir).length, 'fixture: the ghosts are visible before the update').toBeGreaterThan(0);

  const up = await h.runCli(['update', '--apply', '--yes', '--skills', '--offline'], dir);
  expect(up.code, up.stdout + up.stderr).toBe(0);

  // The folders went (as the tester saw) ...
  for (const d of GHOST_DIRS) expect(existsSync(join(dir, '.claude', 'skills', d)), `${d} folder`).toBe(false);
  // ... and now the names went with them.
  const m = readManifest(dir);
  expect([...m.skills.names].sort()).toEqual([...shipped].sort());
  expect(problems(dir)).toEqual([]);
  expect(up.stdout, 'it says it dropped names').toMatch(/Dropped \d+ skill\/command name\(s\)/);

  // The project is still healthy.
  const check = await h.runCli(['check', '--offline', '--ci'], dir);
  expect(check.code, check.stdout).toBe(0);
});

it('uds update --apply (no --skills) also drops skill and command names UDS does not ship from the manifest (XSPEC-456 R4)', async () => {
  const dir = await h.newProject();
  addGhosts(dir, { olderVersion: true });

  const up = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(up.code, up.stdout + up.stderr).toBe(0);

  const m = readManifest(dir);
  expect(m.skills.names, 'ghost skill names').not.toContain(RETIRED_SKILL);
  for (const d of GHOST_DIRS) expect(m.skills.names, d).not.toContain(d);
  expect(m.commands.names, 'retired command name').not.toContain(RETIRED_COMMAND);
  // The real ones stay.
  for (const s of ['commit-standards', 'testing-guide', 'spec-driven-dev']) expect(m.skills.names, s).toContain(s);
});

it('uds update on a project that is already up to date still drops the names UDS does not ship (XSPEC-456 R4)', async () => {
  const dir = await h.newProject();
  addGhosts(dir, { olderVersion: false });
  const up = await h.runCli(['update', '--yes', '--offline'], dir);
  expect(up.code, up.stdout + up.stderr).toBe(0);
  expect(up.stdout).toMatch(/up to date|latest/i);

  const m = readManifest(dir);
  expect(m.skills.names).not.toContain(RETIRED_SKILL);
  for (const d of GHOST_DIRS) expect(m.skills.names, d).not.toContain(d);
  expect(m.commands.names).not.toContain(RETIRED_COMMAND);
});

it('uds update keeps every name when skills came from the plugin marketplace and nothing can be checked on disk (XSPEC-456 R4)', async () => {
  const dir = await h.newProject();
  const m = readManifest(dir);
  m.skills.names = ['all-via-plugin'];
  m.skills.location = 'marketplace';
  m.skills.installations = [];
  writeManifest(dir, m);

  const up = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(up.code, up.stdout + up.stderr).toBe(0);
  expect(readManifest(dir).skills.names).toEqual(['all-via-plugin']);
});
