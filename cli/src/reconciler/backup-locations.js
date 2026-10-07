/**
 * Where UDS update backups live (XSPEC-456 R7).
 *
 * New backups all go into ONE folder, `.uds-backups/`, one subfolder per backup. Backups made before
 * XSPEC-456 R7 are single folders named `.uds-backup-<time>-<NNNN>` directly in the project root; they are
 * not moved and are still backups. A `backupId` is the backup folder's path relative to the project root
 * (`.uds-backups/<time>-<NNNN>` or `.uds-backup-<time>-<NNNN>`), so everything that joins it onto the project
 * root works for both.
 *
 * @module reconciler/backup-locations
 */

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/** The one folder new backups go into. */
export const BACKUPS_DIR = '.uds-backups';
/** Backups made before XSPEC-456 R7: one folder each, directly in the project root. */
export const LEGACY_BACKUP_PREFIX = '.uds-backup-';

let counter = 0;

/** A fresh backup id, relative to the project root. The counter orders two backups made in the same millisecond. */
export function newBackupId() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${BACKUPS_DIR}/${timestamp}-${String(++counter).padStart(4, '0')}`;
}

/**
 * Make sure `.uds-backups/` exists and hides itself from git.
 *
 * WHY THIS IS NOT A LINE IN THE ADOPTER'S .gitignore. We create this directory in someone else's repository;
 * making it disappear is our job, but editing their .gitignore to do it is not - that file is theirs, it may
 * be generated, and a tool appending to it on every update is a worse trade than the problem. A `*` inside
 * the folder ignores everything in it (this file included, which is fine: git reads .gitignore whether or
 * not it is tracked), so `git status` and `git add -A` never see a backup, and nothing outside is touched.
 *
 * WHY IT EXISTS. Nothing ignored the backup folders, so `git add -A` in two sibling repos committed them:
 * EngramGraph's 0.8.0 release commit took in 5 backups - 360 files, 73,992 lines - and dev-platform took one.
 * Both were public. (Until XSPEC-456 R7 each backup carried its own copy of this file.)
 *
 * Git is not the only thing that reads a project folder: indexers, IDE search and grep do not look at
 * .gitignore, which is why the backups share ONE folder name that is easy to exclude (the update summary
 * says so).
 *
 * @param {string} projectPath
 * @param {string[]} errors - Receives an error message when it did not work
 */
export function ensureBackupsDir(projectPath, errors) {
  const dir = join(projectPath, BACKUPS_DIR);
  try {
    mkdirSync(dir, { recursive: true });
    const ignoreFile = join(dir, '.gitignore');
    if (!existsSync(ignoreFile)) writeFileSync(ignoreFile, '*\n', 'utf8');
  } catch (err) {
    // A backup that git can see still beats no backup - the caller records this and carries on.
    errors.push(`Failed to write ${BACKUPS_DIR}/.gitignore: ${err.message}`);
  }
}

/** Ids of the backups in the shared folder. */
export function sharedBackupIds(projectPath) {
  const dir = join(projectPath, BACKUPS_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${BACKUPS_DIR}/${entry.name}`);
}

/** Add the ids of the backups an older UDS left in the project root to `into`. */
export function addLegacyBackupIds(projectPath, into) {
  for (const entry of readdirSync(projectPath, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith(LEGACY_BACKUP_PREFIX)) into.push(entry.name);
  }
}
