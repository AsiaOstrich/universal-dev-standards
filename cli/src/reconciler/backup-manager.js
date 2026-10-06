/**
 * Backup Manager
 * Creates backups before reconciliation, enables rollback, and auto-cleans old backups.
 *
 * Backup structure:
 *   .uds-backup-<ISO timestamp>/
 *   ├── backup-manifest.json    # Backup metadata + rollback instructions
 *   ├── .standards/             # Backed up standard files (and manifest.json)
 *   ├── CLAUDE.md               # Backed up integration files
 *   └── .claude/skills/...      # Backed up skill files
 *
 * Only the paths a step will touch are backed up (minimal footprint). Keeps the 5 most recent
 * backups; auto-cleans older ones.
 *
 * What a backup has to be able to undo (XSPEC-454 R1). A rollback that restores "the files that were
 * overwritten" and nothing else leaves a state that neither version describes:
 *   - files the step CREATED (a new skill folder) have no earlier copy, so the backup has to name them
 *     (`createdFiles`, filled in by `finalizeBackup` once the step is done) or nothing can remove them;
 *   - `.standards/manifest.json` records hashes of everything else, so restoring files without it
 *     makes `uds check` call every restored file modified;
 *   - a directory has to be restored by walking it, not with `copyFileSync` (which throws on one);
 *   - `uds update --skills` / `--commands` write outside the reconciler, so they take a backup of
 *     their own (`createStepBackup`), and consecutive steps are chained: each backup records the hash
 *     of the manifest before and after, and `rollback` walks back through every backup whose "before"
 *     is the previous backup's "after" — i.e. through one unbroken series of UDS updates.
 */

import {
  existsSync,
  mkdirSync,
  cpSync,
  lstatSync,
  readlinkSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
  rmdirSync
} from 'fs';
import { createHash } from 'crypto';
import { join, dirname, isAbsolute, sep } from 'path';

const MAX_BACKUPS = 5;
const BACKUP_PREFIX = '.uds-backup-';
const MANIFEST_REL = '.standards/manifest.json';
const FORMAT_VERSION = 2;
let _backupCounter = 0;

const toPosix = (p) => p.split(sep).join('/');

/** SHA-256 of a file's bytes, or null when it cannot be read. */
function hashFileBytes(path) {
  try {
    return createHash('sha256').update(readFileSync(path)).digest('hex');
  } catch {
    return null;
  }
}

/**
 * What a leaf IS, for comparing a restored leaf with its backup: the bytes of a file, the target of a
 * symlink. (A symlink is copied as a link, never followed — a skills folder can hold links to
 * directories, and following one would copy somebody else's tree into the backup.)
 */
function leafSignature(path) {
  try {
    if (lstatSync(path).isSymbolicLink()) return `link:${readlinkSync(path)}`;
  } catch {
    return null;
  }
  return hashFileBytes(path);
}

/** Copy one leaf (file or symlink), overwriting a file or link at the destination — never a directory. */
function copyLeaf(src, dst) {
  try {
    if (lstatSync(dst).isSymbolicLink()) rmSync(dst, { force: true });
  } catch {
    // dst does not exist
  }
  cpSync(src, dst, { force: true, verbatimSymlinks: true });
}

/** Every file under `rel` (project-relative, posix). A file lists itself; a missing path lists nothing. */
function listFiles(root, rel) {
  const abs = join(root, rel);
  let st;
  try {
    st = lstatSync(abs);
  } catch {
    return [];
  }
  if (!st.isDirectory()) return [rel];
  const out = [];
  let entries;
  try {
    entries = readdirSync(abs, { withFileTypes: true });
  } catch {
    return [];
  }
  for (const e of entries) out.push(...listFiles(root, `${rel}/${e.name}`));
  return out;
}

/** Every directory under (and including) `rel` that exists now. */
function listDirs(root, rel) {
  const abs = join(root, rel);
  let st;
  try {
    st = lstatSync(abs);
  } catch {
    return [];
  }
  if (!st.isDirectory()) return [];
  const out = [rel];
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...listDirs(root, `${rel}/${e.name}`));
  }
  return out;
}

/** Ancestor directories of a project-relative path, nearest last, project root excluded. */
function ancestorsOf(rel) {
  const parts = rel.split('/');
  const out = [];
  for (let i = 1; i < parts.length; i++) out.push(parts.slice(0, i).join('/'));
  return out;
}

function newBackupId() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const counter = String(++_backupCounter).padStart(4, '0');
  return `${BACKUP_PREFIX}${timestamp}-${counter}`;
}

/**
 * Snapshot `paths` into a new backup directory.
 *
 * @param {string} projectPath
 * @param {Object} spec
 * @param {string} spec.label - What step this backs up ('reconcile', 'skills', 'commands')
 * @param {string[]} spec.mustBackUp - Paths whose absence/copy failure counts against `coverage`
 * @param {string[]} spec.alsoWatch - Extra project-relative paths: backed up when present, recorded as absent otherwise
 * @param {Object} spec.plan - Plan summary stored in the backup manifest (optional)
 * @param {Array<{path: string, reason: string}>} spec.notBackedUp - Things outside the project this step also writes
 */
function snapshot(projectPath, spec) {
  const backupId = newBackupId();
  const backupDir = join(projectPath, backupId);
  const backedUp = [];
  const errors = [];

  try {
    mkdirSync(backupDir, { recursive: true });
  } catch (err) {
    return { backupId, backupDir, backedUp, errors: [`Failed to create backup directory: ${err.message}`] };
  }

  // Make the backup invisible to git, from inside itself.
  //
  // WHY THIS IS NOT A LINE IN THE ADOPTER'S .gitignore. We create this directory
  // in someone else's repository; making it disappear is our job, but editing
  // their .gitignore to do it is not — that file is theirs, it may be generated,
  // and a tool appending to it on every update is a worse trade than the problem.
  // A `*` here ignores everything in this directory (this file included, which is
  // fine: git reads .gitignore whether or not it is tracked), so `git status` and
  // `git add -A` never see the backup at all, and nothing outside is touched.
  //
  // WHY IT EXISTS. Nothing ignored these directories, so `git add -A` in two
  // sibling repos committed them: EngramGraph's 0.8.0 release commit took in 5
  // backups — 360 files, 73,992 lines — and dev-platform took one. Both were
  // public. The adopter is not the right place to put this responsibility: they
  // did not create the directory and have no reason to expect it.
  try {
    writeFileSync(join(backupDir, '.gitignore'), '*\n', 'utf8');
  } catch (err) {
    // A backup that git can see still beats no backup — record and carry on.
    errors.push(`Failed to write backup .gitignore: ${err.message}`);
  }

  const notBackedUp = [...(spec.notBackedUp || [])];
  const mustBackUp = [];
  for (const p of spec.mustBackUp || []) {
    if (isAbsolute(p)) {
      // `join(projectPath, '/abs/path')` would silently point somewhere else entirely. A path outside
      // the project (a user-level skills folder) is shared by every project; it is reported, not copied.
      notBackedUp.push({ path: p, reason: 'outside this project (user-level); shared by every project, so it is not backed up or rolled back' });
    } else {
      mustBackUp.push(toPosix(p));
    }
  }
  const extra = (spec.alsoWatch || []).map(toPosix);

  // The manifest first: every other record in the project is a hash that only means something next to it.
  const watched = [...new Set([...mustBackUp, ...extra, MANIFEST_REL])];
  const preexistingDirs = new Set();

  // Backup each entry.
  //
  // Skills are DIRECTORIES (`.claude/skills/<name>`), and `copyFileSync` on a
  // directory throws — ENOTSUP on macOS, EISDIR on Linux. Every skill in every
  // plan failed here, and the failures went nowhere (see the partial-failure
  // note below). Measured on a real repo before the fix: a vibeops backup
  // recorded 74 files for a plan of 129 actions, with **0 of the 55 skill
  // directories** among them — a rollback point that did not cover the largest
  // part of what was about to be overwritten. (XSPEC-382 R6)
  for (const relativePath of watched) {
    for (const a of ancestorsOf(relativePath)) {
      if (existsSync(join(projectPath, a))) preexistingDirs.add(a);
    }
    const sourcePath = join(projectPath, relativePath);
    if (!existsSync(sourcePath)) continue;

    const targetPath = join(backupDir, relativePath);
    try {
      mkdirSync(dirname(targetPath), { recursive: true });
      if (lstatSync(sourcePath).isDirectory()) {
        for (const d of listDirs(projectPath, relativePath)) preexistingDirs.add(d);
        mkdirSync(targetPath, { recursive: true });
        for (const f of listFiles(projectPath, relativePath)) {
          mkdirSync(dirname(join(backupDir, f)), { recursive: true });
          copyLeaf(join(projectPath, f), join(backupDir, f));
        }
      } else {
        copyLeaf(sourcePath, targetPath);
      }
      backedUp.push(relativePath);
    } catch (err) {
      errors.push(`Failed to backup ${relativePath}: ${err.message}`);
    }
  }

  const backupManifest = {
    format: FORMAT_VERSION,
    backupId,
    label: spec.label || 'update',
    createdAt: new Date().toISOString(),
    plan: spec.plan || { summary: null, actionCount: 0, actions: [] },
    backedUpFiles: backedUp,
    // What could NOT be backed up, and the resulting gap.
    //
    // The manifest previously recorded only successes, with no errors field at
    // all — so a backup covering 74 of 129 planned paths was indistinguishable
    // on disk from one covering all of them. Anyone reaching for this directory
    // is reaching for it because something went wrong; it has to say what it
    // does not contain. (XSPEC-382 R6)
    failedToBackUp: errors.slice(),
    coverage: {
      planned: mustBackUp.length,
      backedUp: mustBackUp.filter((p) => backedUp.includes(p)).length,
      failed: mustBackUp.length - mustBackUp.filter((p) => backedUp.includes(p)).length
    },
    // XSPEC-454 R1: the parts a "copy what is about to change" backup cannot know on its own.
    watched,
    preexistingDirs: [...preexistingDirs].sort(),
    createdFiles: [],
    createdDirs: [],
    notBackedUp,
    preManifestHash: hashFileBytes(join(projectPath, MANIFEST_REL)),
    postManifestHash: null,
    finalized: false,
    projectPath
  };

  try {
    writeFileSync(join(backupDir, 'backup-manifest.json'), JSON.stringify(backupManifest, null, 2));
  } catch (err) {
    errors.push(`Failed to write backup manifest: ${err.message}`);
  }

  return { backupId, backupDir, backedUp, errors };
}

/**
 * Create a backup for the files that will be affected by a reconciliation plan.
 *
 * @param {string} projectPath - Project root
 * @param {import('./diff-engine.js').ReconciliationPlan} plan - The reconciliation plan
 * @param {Object} [options]
 * @param {string[]} [options.alsoWatch] - Extra project-relative paths the step writes outside its plan
 *   (the skills/commands bookkeeping files the installers rewrite)
 * @returns {{ backupId: string, backupDir: string, backedUp: string[], errors: string[] }}
 */
export function createBackup(projectPath, plan, options = {}) {
  // Only backup files that will be updated or deleted
  const mustBackUp = plan.actions
    .filter(a => a.type === 'update' || a.type === 'delete' || a.type === 'migrate_block')
    .map(a => a.path);
  // A `create` has no earlier copy to save, but it must be watched: the backup is what lets a rollback
  // know that file did not exist before.
  const created = plan.actions.filter(a => a.type === 'create').map(a => a.path).filter((p) => !isAbsolute(p));

  return snapshot(projectPath, {
    label: 'reconcile',
    mustBackUp,
    alsoWatch: [...created, ...(options.alsoWatch || [])],
    plan: {
      summary: plan.summary,
      actionCount: plan.actions.length,
      actions: plan.actions.map(a => ({
        type: a.type,
        category: a.category,
        path: a.path,
        reason: a.reason
      }))
    }
  });
}

/**
 * Backup for a step that writes outside the reconciler: `uds update --skills`, `--commands`.
 *
 * @param {string} projectPath
 * @param {Object} spec
 * @param {string} spec.label - 'skills' | 'commands'
 * @param {string[]} spec.paths - Project-relative directories the step writes into
 * @param {Array<{path: string, reason: string}>} [spec.notBackedUp] - Targets outside the project
 */
export function createStepBackup(projectPath, spec) {
  return snapshot(projectPath, {
    label: spec.label,
    mustBackUp: [],
    alsoWatch: spec.paths || [],
    notBackedUp: spec.notBackedUp || [],
    plan: { summary: null, actionCount: 0, actions: [] }
  });
}

function readBackupManifest(projectPath, backupId) {
  const manifestPath = join(projectPath, backupId, 'backup-manifest.json');
  return JSON.parse(readFileSync(manifestPath, 'utf-8'));
}

/**
 * Record what the step did, once it is done: the files it created, and the manifest it left behind.
 *
 * Call after the step's last write to `.standards/manifest.json`. A later write that is not followed by
 * another call leaves `postManifestHash` stale, which only ever breaks the chain (the rollback then
 * undoes this one step and says so) — it can never make a rollback restore the wrong thing.
 * Never throws: a backup that cannot be finalized is still a backup.
 *
 * @param {string} projectPath
 * @param {string|null} backupId
 * @returns {{ createdFiles: string[], errors: string[] }}
 */
export function finalizeBackup(projectPath, backupId) {
  const errors = [];
  if (!backupId) return { createdFiles: [], errors };
  try {
    const backupDir = join(projectPath, backupId);
    const bm = readBackupManifest(projectPath, backupId);
    const created = new Set();
    for (const rel of bm.watched || []) {
      const before = new Set(listFiles(backupDir, rel));
      for (const f of listFiles(projectPath, rel)) {
        if (!before.has(f)) created.add(f);
      }
    }
    const pre = new Set(bm.preexistingDirs || []);
    const createdDirs = new Set();
    for (const f of created) {
      for (const a of ancestorsOf(f)) if (!pre.has(a)) createdDirs.add(a);
    }
    bm.createdFiles = [...created].sort();
    bm.createdDirs = [...createdDirs].sort((a, b) => b.length - a.length);
    bm.postManifestHash = hashFileBytes(join(projectPath, MANIFEST_REL));
    bm.finalized = true;
    bm.finalizedAt = new Date().toISOString();
    writeFileSync(join(backupDir, 'backup-manifest.json'), JSON.stringify(bm, null, 2));
    return { createdFiles: bm.createdFiles, errors };
  } catch (err) {
    errors.push(`Failed to finalize ${backupId}: ${err.message}`);
    return { createdFiles: [], errors };
  }
}

/** Undo one backup. Never throws. */
function restoreOne(projectPath, backupId) {
  const restored = [];
  const removed = [];
  const errors = [];
  const notRestored = [];

  const backupDir = join(projectPath, backupId);
  if (!existsSync(backupDir)) {
    return { restored, removed, errors: [`Backup not found: ${backupId}`], notRestored, label: null };
  }

  // Read backup manifest
  let bm;
  try {
    bm = readBackupManifest(projectPath, backupId);
  } catch (err) {
    return { restored, removed, errors: [`Failed to read backup manifest: ${err.message}`], notRestored, label: null };
  }

  // 1. Remove what the step created. This comes first so that a path that is a file in the backup and was
  //    replaced by a directory since (or the reverse) is clear before it is restored.
  for (const rel of bm.createdFiles || []) {
    const abs = join(projectPath, rel);
    try {
      if (existsSync(abs)) {
        rmSync(abs, { force: true });
        removed.push(rel);
      }
    } catch (err) {
      errors.push(`Failed to remove ${rel}: ${err.message}`);
    }
  }

  // 2. Restore each backed-up entry. A directory is restored file by file: `copyFileSync` throws on one.
  for (const relativePath of bm.backedUpFiles || []) {
    const sourcePath = join(backupDir, relativePath);
    if (!existsSync(sourcePath)) {
      errors.push(`Backup file missing: ${relativePath}`);
      continue;
    }
    try {
      if (lstatSync(sourcePath).isDirectory()) {
        mkdirSync(join(projectPath, relativePath), { recursive: true });
        for (const f of listFiles(backupDir, relativePath)) {
          mkdirSync(dirname(join(projectPath, f)), { recursive: true });
          copyLeaf(join(backupDir, f), join(projectPath, f));
          restored.push(f);
        }
      } else {
        mkdirSync(dirname(join(projectPath, relativePath)), { recursive: true });
        copyLeaf(sourcePath, join(projectPath, relativePath));
        restored.push(relativePath);
      }
    } catch (err) {
      errors.push(`Failed to restore ${relativePath}: ${err.message}`);
    }
  }

  // 3. Directories the step created, now empty. Only empty ones: rmdir refuses anything else, which is
  //    what keeps a file the user added afterwards from being swept away.
  for (const rel of bm.createdDirs || []) {
    try {
      rmdirSync(join(projectPath, rel));
    } catch {
      // not empty, or already gone — leave it
    }
  }

  // 4. Read back. "Restored" is a claim; this is what makes it a fact.
  for (const rel of new Set(restored)) {
    const a = leafSignature(join(projectPath, rel));
    const b = leafSignature(join(backupDir, rel));
    if (a === null || a !== b) errors.push(`Restored file differs from the backup: ${rel}`);
  }
  for (const rel of removed) {
    if (existsSync(join(projectPath, rel))) errors.push(`Created file is still there after rollback: ${rel}`);
  }

  for (const item of bm.notBackedUp || []) {
    notRestored.push(`${item.path} — ${item.reason}`);
  }
  if (bm.format !== FORMAT_VERSION) {
    notRestored.push(
      `${backupId} was made by an older UDS: files that update created, and .standards/manifest.json, ` +
      'were not recorded and are not restored from it.'
    );
  } else if (!bm.finalized) {
    notRestored.push(
      `${backupId} was never finalized (the update that made it did not finish): files it created are not known, so none were removed.`
    );
  }
  if ((bm.failedToBackUp || []).length > 0) {
    notRestored.push(`${backupId} is incomplete: ${bm.failedToBackUp.join('; ')}`);
  }

  return { restored, removed, errors, notRestored, label: bm.label || null };
}

/**
 * Rollback.
 *
 * With no `backupId`, undoes the newest backup AND every earlier one that belongs to the same unbroken
 * series of UDS updates (see the file header) — so `update --apply`, `--apply --skills`, `--apply --commands`
 * followed by one `--rollback` returns to where the first of them started. With an explicit `backupId`,
 * undoes only that backup.
 *
 * @param {string} projectPath - Project root
 * @param {string} [backupId] - Specific backup ID (defaults to the most recent series)
 * @returns {{ success: boolean, restored: string[], removed: string[], errors: string[],
 *             notRestored: string[], steps: Array<Object>, olderBackups: number }}
 */
export function rollback(projectPath, backupId = null) {
  const restored = [];
  const removed = [];
  const errors = [];
  const notRestored = [];
  const steps = [];

  const all = listBackups(projectPath);
  let chain;
  if (backupId) {
    if (!existsSync(join(projectPath, backupId))) {
      return { success: false, restored, removed, errors: [`Backup not found: ${backupId}`], notRestored, steps, olderBackups: 0 };
    }
    chain = [backupId];
  } else {
    if (all.length === 0) {
      return { success: false, restored, removed, errors: ['No backups found'], notRestored, steps, olderBackups: 0 };
    }
    chain = [all[0].backupId];
    // Walk back while "the manifest before this step" is "the manifest the previous step left".
    for (let i = 1; i < all.length; i++) {
      const newer = all[i - 1];
      const older = all[i];
      if (newer.preManifestHash && older.postManifestHash && newer.preManifestHash === older.postManifestHash) {
        chain.push(older.backupId);
      } else {
        break;
      }
    }
  }

  for (const id of chain) {
    const one = restoreOne(projectPath, id);
    steps.push({ backupId: id, label: one.label, restored: one.restored, removed: one.removed, errors: one.errors, notRestored: one.notRestored });
    restored.push(...one.restored);
    removed.push(...one.removed);
    errors.push(...one.errors);
    notRestored.push(...one.notRestored);
  }

  const olderBackups = backupId ? 0 : all.length - chain.length;
  return {
    success: errors.length === 0,
    restored: [...new Set(restored)],
    removed: [...new Set(removed)],
    errors,
    notRestored,
    steps,
    olderBackups
  };
}

/**
 * List all backups for a project, sorted by creation time (newest first).
 *
 * @param {string} projectPath
 * @returns {Array<{ backupId: string, createdAt: string, actionCount: number, label: string|null,
 *                   preManifestHash: string|null, postManifestHash: string|null }>}
 */
export function listBackups(projectPath) {
  try {
    const entries = readdirSync(projectPath, { withFileTypes: true });
    const backups = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.startsWith(BACKUP_PREFIX)) continue;

      const backupDir = join(projectPath, entry.name);
      const manifestPath = join(backupDir, 'backup-manifest.json');

      const info = {
        backupId: entry.name,
        createdAt: '',
        actionCount: 0,
        label: null,
        preManifestHash: null,
        postManifestHash: null
      };
      if (existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
          info.createdAt = manifest.createdAt || '';
          info.actionCount = manifest.plan?.actionCount || 0;
          info.label = manifest.label || null;
          info.preManifestHash = manifest.preManifestHash || null;
          info.postManifestHash = manifest.postManifestHash || null;
        } catch {
          // Use defaults
        }
      }

      backups.push(info);
    }

    // Sort newest first. The id carries a per-process counter after the timestamp, so ties on
    // `createdAt` (two steps in the same millisecond) still order by creation.
    backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.backupId.localeCompare(a.backupId));
    return backups;
  } catch {
    return [];
  }
}

/**
 * Clean up old backups, keeping only the most recent N.
 *
 * @param {string} projectPath
 * @param {number} [keep=MAX_BACKUPS] - Number of backups to keep
 * @returns {{ removed: string[], errors: string[] }}
 */
export function cleanupBackups(projectPath, keep = MAX_BACKUPS) {
  const backups = listBackups(projectPath);
  const removed = [];
  const errors = [];

  if (backups.length <= keep) {
    return { removed, errors };
  }

  const toRemove = backups.slice(keep);
  for (const backup of toRemove) {
    const backupDir = join(projectPath, backup.backupId);
    try {
      rmSync(backupDir, { recursive: true, force: true });
      removed.push(backup.backupId);
    } catch (err) {
      errors.push(`Failed to remove ${backup.backupId}: ${err.message}`);
    }
  }

  return { removed, errors };
}
