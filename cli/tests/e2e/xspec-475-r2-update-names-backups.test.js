/**
 * E2E: `uds update --apply` never deletes a backup an older UDS left in the project root, and names every backup
 * it does delete (dev-platform XSPEC-475 R2).
 *
 * The report (Windows, beta.9): a project had four `.uds-backup-*` folders in its root (the layout before
 * XSPEC-456 R7). The five-backup limit counted old and new together, so a three-step upgrade silently deleted two of
 * the old ones. The adopter's CLAUDE.md says those files cannot be recovered from git. Now the limit counts only
 * `.uds-backups/`; the old ones are never removed by it and are listed in the output with a suggestion to move them
 * out of the project; and a backup the limit does remove is named.
 *
 * Every test runs the real CLI (`uds update --apply --yes --offline`) in a throwaway project and reads the folders
 * and the printed output back.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/reconciler/backup-manager.js   const shared = all.filter((b) => isSharedBackupId(b.backupId));   (the limit counts .uds-backups/ only)
 *   cli/src/commands/update.js             printBackupCleanup(result.execution.backupCleanup);              (the output names them)
 */

import { it, expect, afterAll } from 'vitest';
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { computeFileHash } from '../../src/utils/hasher.js';

const h = createHarness('xspec475-r2');
afterAll(() => h.cleanup());

const readJson = (p) => JSON.parse(readFileSync(p, 'utf-8'));
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2));

/** Make the project one `update --apply` has work to do on: an older edition of one standard, and a skill that is absent. */
function ageProject(dir) {
  const mPath = join(dir, '.standards', 'manifest.json');
  const m = readJson(mPath);
  const rel = '.standards/checkin-standards.ai.yaml';
  const abs = join(dir, rel);
  writeFileSync(abs, '# older edition (XSPEC-475 R2 test fixture)\n' + readFileSync(abs, 'utf-8'));
  const hash = computeFileHash(abs);
  m.fileHashes[rel] = { ...m.fileHashes[rel], hash: hash.hash, size: hash.size };
  rmSync(join(dir, '.claude', 'skills', 'comprehension-ladder'), { recursive: true, force: true });
  for (const key of Object.keys(m.skillHashes)) if (key.includes('/comprehension-ladder/')) delete m.skillHashes[key];
  m.skills.names = (m.skills.names || []).filter((n) => n !== 'comprehension-ladder');
  writeJson(mPath, m);
}

/** A finished backup folder, as an older UDS (or this one) leaves it. `place` is the folder it lives in, relative to the project. */
function fakeBackup(dir, place, name, createdAt) {
  const id = place ? `${place}/${name}` : name;
  mkdirSync(join(dir, ...id.split('/')), { recursive: true });
  writeJson(join(dir, ...id.split('/'), 'backup-manifest.json'), { format: 2, backupId: id, label: 'update', createdAt, finalized: true });
  writeFileSync(join(dir, ...id.split('/'), 'precious.txt'), `the only copy of ${name}\n`);
  return id;
}

const legacyIds = (dir) => readdirSync(dir).filter((n) => n.startsWith('.uds-backup-')).sort();
const newIds = (dir) => (existsSync(join(dir, '.uds-backups'))
  ? readdirSync(join(dir, '.uds-backups'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()
  : []);

it('uds update --apply run three times leaves the four .uds-backup-* folders of an older UDS in place and lists them in the output (XSPEC-475 R2)', async () => {
  const dir = await h.newProject();
  const legacy = [1, 2, 3, 4].map((i) => fakeBackup(dir, '', `.uds-backup-2020-01-0${i}T00-00-00-000Z-000${i}`, `2020-01-0${i}T00:00:00.000Z`));

  const outputs = [];
  for (let step = 1; step <= 3; step++) {
    ageProject(dir);
    const run = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
    expect(run.code, `step ${step}\n${run.stdout}${run.stderr}`).toBe(0);
    expect(newIds(dir).length, `step ${step}: a new backup was made in .uds-backups/`).toBe(step);
    outputs.push(run.stdout);
  }

  // Read back: all four are still there, with their content.
  expect(legacyIds(dir), 'the four old backups are still in the project root').toEqual([...legacy].sort());
  for (const id of legacy) expect(readFileSync(join(dir, id, 'precious.txt'), 'utf-8'), id).toContain('the only copy of');

  // And every run says so: it names each old backup and that the limit did not remove them.
  for (const [i, out] of outputs.entries()) {
    expect(out, `step ${i + 1} names the count`).toMatch(/4 backup\(s\) from an older UDS are still in the project root and were NOT removed by the limit/);
    for (const id of legacy) expect(out, `step ${i + 1} names ${id}`).toContain(id);
    expect(out, `step ${i + 1} suggests moving them`).toMatch(/move them out of the project yourself/);
    expect(out, `step ${i + 1}: nothing was removed, so nothing is claimed as removed`).not.toMatch(/Removed \d+ old backup/);
  }
});

it('uds update --apply names each backup the limit of five removes from .uds-backups/, and removes only those (XSPEC-475 R2)', async () => {
  const dir = await h.newProject();
  ageProject(dir);
  const legacy = fakeBackup(dir, '', '.uds-backup-2020-01-09T00-00-00-000Z-0009', '2020-01-09T00:00:00.000Z');
  // Five finished backups already in the shared folder, all older than the one this run makes: the sixth pushes the oldest out.
  const shared = [1, 2, 3, 4, 5].map((i) => fakeBackup(dir, '.uds-backups', `2020-02-0${i}T00-00-00-000Z-000${i}`, `2020-02-0${i}T00:00:00.000Z`));

  const run = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);

  expect(run.stdout, 'it says how many and what the limit is').toMatch(/Removed 1 old backup\(s\) beyond the limit of 5 in \.uds-backups\//);
  expect(run.stdout, 'it names the one it removed').toContain(`✕ ${shared[0]}`);
  for (const kept of shared.slice(1)) expect(run.stdout, 'it does not name one it kept as removed').not.toContain(`✕ ${kept}`);

  // Read back: exactly the oldest shared one is gone; the other four and the new one are there; the old-layout one too.
  expect(existsSync(join(dir, ...shared[0].split('/'))), 'the oldest backup in .uds-backups/ was removed').toBe(false);
  for (const kept of shared.slice(1)) expect(existsSync(join(dir, ...kept.split('/'))), kept).toBe(true);
  expect(newIds(dir).length, 'four kept + the new one').toBe(5);
  expect(existsSync(join(dir, legacy)), 'the old-layout backup is not touched by the limit').toBe(true);
  expect(run.stdout).toContain(legacy);
});
