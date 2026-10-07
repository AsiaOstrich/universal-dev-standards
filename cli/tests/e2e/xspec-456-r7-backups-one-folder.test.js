/**
 * E2E: every `uds update` backup lives in ONE folder, `.uds-backups/` (dev-platform XSPEC-456 R7).
 *
 * The report: `uds update --apply` leaves a `.uds-backup-<time>/` folder in the project root for every step, up
 * to five. Git never shows them (they hide themselves), but tools that do not read .gitignore do - an indexer
 * counted about a hundred of their markdown files as project documents. Now the backups share one folder name
 * that is easy to exclude, and that folder hides itself from git with a `.gitignore` of its own (the adopter's
 * `.gitignore` is never edited).
 *
 * Backups made by an older UDS stay where they are (`.uds-backup-*` in the project root). They are still
 * backups: `--rollback`, the chain between consecutive steps and the "keep the 5 most recent" rule look at
 * both places and order them together by time.
 *
 * Every test spawns the real CLI (`uds update ...`, `uds update --rollback`, `uds uninstall`) in a throwaway
 * project and reads the folders, files and `git status` back.
 *
 * Wires that make these red when cut (each is one line of CLI source):
 *   cli/src/reconciler/backup-manager.js   ensureBackupsDir(projectPath, errors);                (the shared folder and its .gitignore)
 *   cli/src/reconciler/backup-manager.js   addLegacyBackupIds(projectPath, places);              (the old layout is still listed)
 */

import { it, expect, afterAll } from 'vitest';
import {
  readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, rmSync, lstatSync
} from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { createHash } from 'crypto';
import { createHarness } from '../utils/staged-cli-harness.js';
import { computeFileHash } from '../../src/utils/hasher.js';

const h = createHarness('xspec456-r7');
afterAll(() => h.cleanup());

const readJson = (p) => JSON.parse(readFileSync(p, 'utf-8'));
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2));

/** What an older UDS would have left: a standard that is an older edition, and a skill that is absent. */
function ageProject(dir) {
  const mPath = join(dir, '.standards', 'manifest.json');
  const m = readJson(mPath);
  const rel = '.standards/checkin-standards.ai.yaml';
  const abs = join(dir, rel);
  writeFileSync(abs, '# older edition (XSPEC-456 R7 test fixture)\n' + readFileSync(abs, 'utf-8'));
  const hash = computeFileHash(abs);
  m.fileHashes[rel] = { ...m.fileHashes[rel], hash: hash.hash, size: hash.size };
  rmSync(join(dir, '.claude', 'skills', 'comprehension-ladder'), { recursive: true, force: true });
  for (const key of Object.keys(m.skillHashes)) if (key.includes('/comprehension-ladder/')) delete m.skillHashes[key];
  m.skills.names = (m.skills.names || []).filter((n) => n !== 'comprehension-ladder');
  writeJson(mPath, m);
}

const legacyIds = (dir) => readdirSync(dir).filter((n) => n.startsWith('.uds-backup-')).sort();
const newIds = (dir) => (existsSync(join(dir, '.uds-backups'))
  ? readdirSync(join(dir, '.uds-backups'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()
  : []);

/** Every file under a folder with its content hash, as one comparable string. */
function treeSignature(root) {
  const out = [];
  const walk = (rel) => {
    for (const e of readdirSync(join(root, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(r);
      else out.push(`${r}:${createHash('sha256').update(readFileSync(join(root, r))).digest('hex')}`);
    }
  };
  walk('');
  return out.sort().join('\n');
}

it('uds update --apply and --apply --skills put every backup in one .uds-backups folder, leave no .uds-backup-* in the project root, say where it is, and git does not list it (XSPEC-456 R7)', async () => {
  const dir = await h.newProject();
  ageProject(dir);
  execSync('git init -q', { cwd: dir });

  const first = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(first.code, first.stdout + first.stderr).toBe(0);
  const second = await h.runCli(['update', '--apply', '--yes', '--skills', '--offline'], dir);
  expect(second.code, second.stdout + second.stderr).toBe(0);

  // Where the backups are: one folder, a subfolder per step, nothing in the project root.
  expect(legacyIds(dir), 'no .uds-backup-* in the project root').toEqual([]);
  expect(readdirSync(dir).filter((n) => /uds-backup/.test(n)), 'one backups folder in the root').toEqual(['.uds-backups']);
  const ids = newIds(dir);
  expect(ids.length, 'one backup per step').toBe(2);
  for (const id of ids) {
    expect(existsSync(join(dir, '.uds-backups', id, 'backup-manifest.json')), id).toBe(true);
    expect(id, 'time, then counter').toMatch(/^\d{4}-\d{2}-\d{2}T[\d-]+Z-\d{4}$/);
  }

  // It hides itself, without touching the adopter's .gitignore.
  expect(readFileSync(join(dir, '.uds-backups', '.gitignore'), 'utf-8')).toBe('*\n');
  expect(existsSync(join(dir, '.gitignore')), 'the project has no .gitignore of its own, and still none').toBe(false);
  const status = execSync('git status --porcelain --untracked-files=all', { cwd: dir }).toString();
  expect(status, 'control: git does list the project files').toContain('.standards/');
  expect(status, 'git does not list a backup').not.toMatch(/uds-backup/);

  // The summary says where the backup is and what to exclude.
  for (const run of [first, second]) {
    expect(run.stdout).toMatch(/Backup: \.uds-backups\/\d{4}-/);
    expect(run.stdout).toMatch(/Use `uds update --rollback` to undo\./);
    expect(run.stdout).toMatch(/exclude `\.uds-backups`/);
  }

  // The rollback finds them (both steps, through the new path).
  const rb = await h.runCli(['update', '--rollback', '--yes'], dir);
  expect(rb.code, rb.stdout + rb.stderr).toBe(0);
  expect(rb.stdout).toMatch(/Rollback successful/);
  expect(rb.stdout).toMatch(/2 consecutive updates were undone together/);
  expect(rb.stdout).toContain(`.uds-backups/${ids[0]}`);
  expect(rb.stdout).toContain(`.uds-backups/${ids[1]}`);
});

it('uds update --rollback undoes the newest backup together with an older-layout .uds-backup-* one, and the old one counts toward the five kept (XSPEC-456 R7)', async () => {
  const dir = await h.newProject();
  ageProject(dir);

  // Step 1 happens "under an older UDS": its backup is moved to where older versions put it.
  const first = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(first.code, first.stdout + first.stderr).toBe(0);
  const [firstId] = newIds(dir);
  expect(firstId, 'fixture: step 1 left a backup').toBeTruthy();
  renameSync(join(dir, '.uds-backups', firstId), join(dir, `.uds-backup-${firstId}`));
  expect(newIds(dir)).toEqual([]);

  // Step 2 is the new layout, and its "before" is step 1's "after": one unbroken series across the two places.
  const second = await h.runCli(['update', '--apply', '--yes', '--skills', '--offline'], dir);
  expect(second.code, second.stdout + second.stderr).toBe(0);
  expect(newIds(dir).length).toBe(1);
  expect(legacyIds(dir)).toEqual([`.uds-backup-${firstId}`]);

  const rb = await h.runCli(['update', '--rollback', '--yes'], dir);
  expect(rb.code, rb.stdout + rb.stderr).toBe(0);
  expect(rb.stdout).toMatch(/2 consecutive updates were undone together/);
  expect(rb.stdout, 'the older-layout backup was undone too').toContain(`.uds-backup-${firstId}`);
  expect(rb.stdout).toContain(`.uds-backups/${newIds(dir)[0]}`);
  // Read back: the project is as it was before step 1 (the skill the steps installed is gone again).
  expect(existsSync(join(dir, '.claude', 'skills', 'comprehension-ladder')), 'what the steps installed is removed again').toBe(false);
  expect(readFileSync(join(dir, '.standards', 'checkin-standards.ai.yaml'), 'utf-8')).toMatch(/^# older edition \(XSPEC-456 R7 test fixture\)/);
});

it('uds update keeps five backups in all: old-layout and new-layout together, oldest first out (XSPEC-456 R7)', async () => {
  const dir = await h.newProject();
  ageProject(dir);

  // Five backups an older UDS left, all older than anything made today.
  const old = [];
  for (let i = 1; i <= 5; i++) {
    const id = `.uds-backup-2020-01-0${i}T00-00-00-000Z-000${i}`;
    mkdirSync(join(dir, id), { recursive: true });
    writeJson(join(dir, id, 'backup-manifest.json'), { format: 2, backupId: id, label: 'update', createdAt: `2020-01-0${i}T00:00:00.000Z`, finalized: true });
    old.push(id);
  }

  const run = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);

  expect(newIds(dir).length, 'the new backup is kept').toBe(1);
  expect(legacyIds(dir), 'the oldest old-layout backup went; the four newest stay').toEqual(old.slice(1));
  expect(legacyIds(dir).length + newIds(dir).length, 'five in all').toBe(5);
});

it('uds uninstall leaves the backups folder exactly as it was: it never touched backups and still does not (XSPEC-456 R7)', async () => {
  const dir = await h.newProject();
  ageProject(dir);
  const up = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(up.code, up.stdout + up.stderr).toBe(0);
  const before = treeSignature(join(dir, '.uds-backups'));
  expect(before.length, 'fixture: there is a backup to be left alone').toBeGreaterThan(0);

  const un = await h.runCli(['uninstall', '--yes'], dir);
  expect(un.code, un.stdout + un.stderr).toBe(0);
  expect(existsSync(join(dir, '.standards', 'manifest.json')), 'control: uninstall did remove the standards').toBe(false);
  expect(lstatSync(join(dir, '.uds-backups')).isDirectory()).toBe(true);
  expect(treeSignature(join(dir, '.uds-backups')), 'every backup file is as it was').toBe(before);
});
