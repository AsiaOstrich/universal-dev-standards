/**
 * Backup Manager
 * Creates backups before reconciliation, enables rollback, and auto-cleans old backups.
 *
 * Backup structure:
 *   .uds-backup-<ISO timestamp>/
 *   ├── backup-manifest.json    # Backup metadata + rollback instructions
 *   ├── .standards/             # Backed up standard files
 *   ├── CLAUDE.md               # Backed up integration files
 *   └── .claude/skills/...      # Backed up skill files
 *
 * Only files that will be modified/deleted are backed up (minimal footprint).
 * Keeps the 5 most recent backups; auto-cleans older ones.
 */

import {
  existsSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync
} from 'fs';
import { join, dirname } from 'path';

const MAX_BACKUPS = 5;
const BACKUP_PREFIX = '.uds-backup-';
let _backupCounter = 0;

/**
 * Create a backup for the files that will be affected by a reconciliation plan.
 *
 * @param {string} projectPath - Project root
 * @param {import('./diff-engine.js').ReconciliationPlan} plan - The reconciliation plan
 * @returns {{ backupId: string, backupDir: string, backedUp: string[], errors: string[] }}
 */
export function createBackup(projectPath, plan) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const counter = String(++_backupCounter).padStart(4, '0');
  const backupId = `${BACKUP_PREFIX}${timestamp}-${counter}`;
  const backupDir = join(projectPath, backupId);
  const backedUp = [];
  const errors = [];

  // Only backup files that will be updated or deleted
  const filesToBackup = plan.actions
    .filter(a => a.type === 'update' || a.type === 'delete' || a.type === 'migrate_block')
    .map(a => a.path);

  if (filesToBackup.length === 0) {
    return { backupId, backupDir, backedUp, errors };
  }

  // Create backup directory
  try {
    mkdirSync(backupDir, { recursive: true });
  } catch (err) {
    return {
      backupId,
      backupDir,
      backedUp,
      errors: [`Failed to create backup directory: ${err.message}`]
    };
  }

  // Backup each file
  for (const relativePath of filesToBackup) {
    const sourcePath = join(projectPath, relativePath);
    if (!existsSync(sourcePath)) continue;

    const targetPath = join(backupDir, relativePath);
    try {
      mkdirSync(dirname(targetPath), { recursive: true });
      copyFileSync(sourcePath, targetPath);
      backedUp.push(relativePath);
    } catch (err) {
      errors.push(`Failed to backup ${relativePath}: ${err.message}`);
    }
  }

  // Write backup manifest
  const backupManifest = {
    backupId,
    createdAt: new Date().toISOString(),
    plan: {
      summary: plan.summary,
      actionCount: plan.actions.length,
      actions: plan.actions.map(a => ({
        type: a.type,
        category: a.category,
        path: a.path,
        reason: a.reason
      }))
    },
    backedUpFiles: backedUp,
    projectPath
  };

  try {
    writeFileSync(
      join(backupDir, 'backup-manifest.json'),
      JSON.stringify(backupManifest, null, 2)
    );
  } catch (err) {
    errors.push(`Failed to write backup manifest: ${err.message}`);
  }

  return { backupId, backupDir, backedUp, errors };
}

/**
 * Rollback to a specific backup.
 *
 * @param {string} projectPath - Project root
 * @param {string} [backupId] - Specific backup ID (defaults to most recent)
 * @returns {{ success: boolean, restored: string[], errors: string[] }}
 */
export function rollback(projectPath, backupId = null) {
  const restored = [];
  const errors = [];

  // Find backup
  if (!backupId) {
    const backups = listBackups(projectPath);
    if (backups.length === 0) {
      return { success: false, restored, errors: ['No backups found'] };
    }
    backupId = backups[0].backupId; // Most recent
  }

  const backupDir = join(projectPath, backupId);
  if (!existsSync(backupDir)) {
    return { success: false, restored, errors: [`Backup not found: ${backupId}`] };
  }

  // Read backup manifest
  const manifestPath = join(backupDir, 'backup-manifest.json');
  let backupManifest;
  try {
    backupManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  } catch (err) {
    return { success: false, restored, errors: [`Failed to read backup manifest: ${err.message}`] };
  }

  // Restore each backed-up file
  for (const relativePath of backupManifest.backedUpFiles) {
    const sourcePath = join(backupDir, relativePath);
    const targetPath = join(projectPath, relativePath);

    if (!existsSync(sourcePath)) {
      errors.push(`Backup file missing: ${relativePath}`);
      continue;
    }

    try {
      mkdirSync(dirname(targetPath), { recursive: true });
      copyFileSync(sourcePath, targetPath);
      restored.push(relativePath);
    } catch (err) {
      errors.push(`Failed to restore ${relativePath}: ${err.message}`);
    }
  }

  return { success: errors.length === 0, restored, errors };
}

/**
 * List all backups for a project, sorted by creation time (newest first).
 *
 * @param {string} projectPath
 * @returns {Array<{ backupId: string, createdAt: string, actionCount: number }>}
 */
export function listBackups(projectPath) {
  try {
    const entries = readdirSync(projectPath, { withFileTypes: true });
    const backups = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.startsWith(BACKUP_PREFIX)) continue;

      const backupDir = join(projectPath, entry.name);
      const manifestPath = join(backupDir, 'backup-manifest.json');

      let info = { backupId: entry.name, createdAt: '', actionCount: 0 };
      if (existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
          info.createdAt = manifest.createdAt || '';
          info.actionCount = manifest.plan?.actionCount || 0;
        } catch {
          // Use defaults
        }
      }

      backups.push(info);
    }

    // Sort newest first
    backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
