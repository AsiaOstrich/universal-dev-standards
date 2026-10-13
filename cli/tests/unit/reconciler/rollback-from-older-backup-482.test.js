/**
 * A backup an older UDS made can be listed and restored by its name (XSPEC-482 R11).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, cpSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { listBackups, rollback } from '../../../src/reconciler/backup-manager.js';

const FIXTURE = resolve(import.meta.dirname, '../../fixtures/older-uds-backup-6.11.0');
const ID = '.uds-backup-2026-10-13T05-53-52-485Z-0001';
let dir;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'uds-test-rollback-from-'));
  cpSync(FIXTURE, join(dir, ID), { recursive: true });
  rmSync(join(dir, ID, 'README.md'));
  writeFileSync(join(dir, 'CLAUDE.md'), 'edited since\n');
  writeFileSync(join(dir, 'AGENTS.md'), 'edited since\n');
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('a backup folder made by UDS 6.11.0', () => {
  it('is listed, and it records no hash that could chain it to another backup', () => {
    const [only] = listBackups(dir);
    expect(only.backupId).toBe(ID);
    expect(only.preManifestHash).toBeNull();
    expect(only.postManifestHash).toBeNull();
  });

  it('rollback(dir, id) restores exactly the files it backed up', () => {
    const result = rollback(dir, ID);
    expect(result.restored.sort()).toEqual(['AGENTS.md', 'CLAUDE.md']);
    expect(readFileSync(join(dir, 'CLAUDE.md'), 'utf-8')).toBe(readFileSync(join(FIXTURE, 'CLAUDE.md'), 'utf-8'));
    expect(existsSync(join(dir, '.uds-backups'))).toBe(false);
  });

  it('rollback(dir, name that does not exist) restores nothing and says it was not found', () => {
    const result = rollback(dir, '.uds-backup-nope');
    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('Backup not found');
    expect(readFileSync(join(dir, 'CLAUDE.md'), 'utf-8')).toBe('edited since\n');
  });
});
