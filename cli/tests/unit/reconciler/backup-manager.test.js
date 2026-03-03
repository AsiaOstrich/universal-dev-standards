import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  createBackup,
  rollback,
  listBackups,
  cleanupBackups
} from '../../../src/reconciler/backup-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/backup-test');

describe('BackupManager', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('createBackup', () => {
    it('should create backup directory', () => {
      // Create a file to be backed up
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });
      writeFileSync(join(standardsDir, 'test.yaml'), 'content');

      const plan = {
        actions: [
          { type: 'update', category: 'standard', path: '.standards/test.yaml', reason: 'test' }
        ],
        summary: { create: 0, update: 1, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      const result = createBackup(TEST_DIR, plan);

      expect(result.backupId).toMatch(/^\.uds-backup-/);
      expect(existsSync(result.backupDir)).toBe(true);
      expect(result.backedUp).toContain('.standards/test.yaml');
    });

    it('should only backup files that will be updated or deleted', () => {
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });
      writeFileSync(join(standardsDir, 'update.yaml'), 'will update');
      writeFileSync(join(standardsDir, 'create.yaml'), 'will create');

      const plan = {
        actions: [
          { type: 'update', category: 'standard', path: '.standards/update.yaml', reason: 'test' },
          { type: 'create', category: 'standard', path: '.standards/new.yaml', reason: 'test' }
        ],
        summary: { create: 1, update: 1, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      const result = createBackup(TEST_DIR, plan);

      expect(result.backedUp).toContain('.standards/update.yaml');
      expect(result.backedUp).not.toContain('.standards/new.yaml');
    });

    it('should write backup-manifest.json', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'test.yaml'), 'content');

      const plan = {
        actions: [
          { type: 'delete', category: 'standard', path: '.standards/test.yaml', reason: 'test' }
        ],
        summary: { create: 0, update: 0, delete: 1, unchanged: 0, migrate_block: 0 }
      };

      const result = createBackup(TEST_DIR, plan);
      const manifestPath = join(result.backupDir, 'backup-manifest.json');

      expect(existsSync(manifestPath)).toBe(true);
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      expect(manifest.backupId).toBe(result.backupId);
      expect(manifest.backedUpFiles).toContain('.standards/test.yaml');
    });

    it('should return empty backup for plan with only creates', () => {
      const plan = {
        actions: [
          { type: 'create', category: 'standard', path: '.standards/new.yaml', reason: 'test' }
        ],
        summary: { create: 1, update: 0, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      const result = createBackup(TEST_DIR, plan);

      expect(result.backedUp).toEqual([]);
    });

    it('should skip missing files gracefully', () => {
      const plan = {
        actions: [
          { type: 'update', category: 'standard', path: '.standards/nonexistent.yaml', reason: 'test' }
        ],
        summary: { create: 0, update: 1, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      const result = createBackup(TEST_DIR, plan);

      expect(result.backedUp).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should backup migrate_block actions', () => {
      writeFileSync(join(TEST_DIR, 'CLAUDE.md'), 'existing content');

      const plan = {
        actions: [
          { type: 'migrate_block', category: 'integration', path: 'CLAUDE.md', reason: 'test' }
        ],
        summary: { create: 0, update: 0, delete: 0, unchanged: 0, migrate_block: 1 }
      };

      const result = createBackup(TEST_DIR, plan);

      expect(result.backedUp).toContain('CLAUDE.md');
    });
  });

  describe('rollback', () => {
    it('should restore backed-up files', () => {
      // Setup: create file, backup, modify
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });
      writeFileSync(join(standardsDir, 'test.yaml'), 'original content');

      const plan = {
        actions: [{ type: 'update', category: 'standard', path: '.standards/test.yaml', reason: 'test' }],
        summary: { create: 0, update: 1, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      const backup = createBackup(TEST_DIR, plan);

      // Simulate the update
      writeFileSync(join(standardsDir, 'test.yaml'), 'modified content');

      // Rollback
      const result = rollback(TEST_DIR, backup.backupId);

      expect(result.success).toBe(true);
      expect(result.restored).toContain('.standards/test.yaml');
      expect(readFileSync(join(standardsDir, 'test.yaml'), 'utf-8')).toBe('original content');
    });

    it('should use most recent backup by default', () => {
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });
      writeFileSync(join(standardsDir, 'test.yaml'), 'original');

      const plan = {
        actions: [{ type: 'update', category: 'standard', path: '.standards/test.yaml', reason: 'test' }],
        summary: { create: 0, update: 1, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      createBackup(TEST_DIR, plan);
      writeFileSync(join(standardsDir, 'test.yaml'), 'modified');

      const result = rollback(TEST_DIR); // No backupId

      expect(result.success).toBe(true);
    });

    it('should fail when no backups exist', () => {
      const result = rollback(TEST_DIR);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No backups found');
    });

    it('should fail for non-existent backup ID', () => {
      const result = rollback(TEST_DIR, '.uds-backup-nonexistent');

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Backup not found');
    });
  });

  describe('listBackups', () => {
    it('should return empty array for project without backups', () => {
      const backups = listBackups(TEST_DIR);
      expect(backups).toEqual([]);
    });

    it('should list backups sorted by date (newest first)', () => {
      // Create two backups
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });
      writeFileSync(join(standardsDir, 'test.yaml'), 'content');

      const plan = {
        actions: [{ type: 'update', category: 'standard', path: '.standards/test.yaml', reason: 'test' }],
        summary: { create: 0, update: 1, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      const backup1 = createBackup(TEST_DIR, plan);
      const backup2 = createBackup(TEST_DIR, plan);

      const backups = listBackups(TEST_DIR);

      expect(backups.length).toBe(2);
      // newest first
      expect(backups[0].createdAt >= backups[1].createdAt).toBe(true);
    });
  });

  describe('cleanupBackups', () => {
    it('should remove backups beyond the keep limit', () => {
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });
      writeFileSync(join(standardsDir, 'test.yaml'), 'content');

      const plan = {
        actions: [{ type: 'update', category: 'standard', path: '.standards/test.yaml', reason: 'test' }],
        summary: { create: 0, update: 1, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      // Create 3 backups
      createBackup(TEST_DIR, plan);
      createBackup(TEST_DIR, plan);
      createBackup(TEST_DIR, plan);

      // Keep only 1
      const result = cleanupBackups(TEST_DIR, 1);

      expect(result.removed.length).toBe(2);
      const remaining = listBackups(TEST_DIR);
      expect(remaining.length).toBe(1);
    });

    it('should keep all if within limit', () => {
      const standardsDir = join(TEST_DIR, '.standards');
      mkdirSync(standardsDir, { recursive: true });
      writeFileSync(join(standardsDir, 'test.yaml'), 'content');

      const plan = {
        actions: [{ type: 'update', category: 'standard', path: '.standards/test.yaml', reason: 'test' }],
        summary: { create: 0, update: 1, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      createBackup(TEST_DIR, plan);
      createBackup(TEST_DIR, plan);

      const result = cleanupBackups(TEST_DIR, 5);

      expect(result.removed.length).toBe(0);
    });
  });
});
