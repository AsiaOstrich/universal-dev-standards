import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync } from 'fs';

// Mock fs.existsSync to always return true for test paths
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    existsSync: vi.fn(() => true)
  };
});

// Mock manifest module
vi.mock('../../../src/core/manifest.js', () => ({
  readManifest: vi.fn(),
  writeManifest: vi.fn(),
  migrateManifest: vi.fn((m) => ({ ...m, version: '3.3.0' })),
  needsMigration: vi.fn((m) => m?.version !== '3.3.0'),
  CURRENT_SCHEMA_VERSION: '3.3.0'
}));

// Mock hasher module
vi.mock('../../../src/utils/hasher.js', () => ({
  computeFileHash: vi.fn(() => ({
    hash: 'sha256:abc123def456',
    size: 100
  })),
  computeIntegrationBlockHash: vi.fn(() => ({
    blockHash: 'sha256:block123',
    blockSize: 50,
    fullHash: 'sha256:full123',
    fullSize: 200
  }))
}));

// Mock constants
vi.mock('../../../src/core/constants.js', () => ({
  SUPPORTED_AI_TOOLS: {
    'claude-code': { name: 'Claude Code', file: 'CLAUDE.md', format: 'markdown' },
    'cursor': { name: 'Cursor', file: '.cursorrules', format: 'plaintext' }
  }
}));

import { migrateAndBackfill, backfillFileHashes } from '../../../src/reconciler/manifest-migrator.js';
import { readManifest, writeManifest, migrateManifest, needsMigration } from '../../../src/core/manifest.js';
import { computeFileHash } from '../../../src/utils/hasher.js';

describe('ManifestMigrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset existsSync to return true by default
    existsSync.mockReturnValue(true);
  });

  describe('migrateAndBackfill', () => {
    it('should return error when no manifest found', () => {
      readManifest.mockReturnValue(null);

      const result = migrateAndBackfill('/project');

      expect(result.manifest).toBeNull();
      expect(result.migrated).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('No manifest found');
    });

    it('should migrate manifest when version is outdated', () => {
      const oldManifest = {
        version: '3.0.0',
        standards: [],
        integrations: [],
        options: {}
      };
      readManifest.mockReturnValue(oldManifest);
      needsMigration.mockReturnValue(true);

      const result = migrateAndBackfill('/project');

      expect(result.migrated).toBe(true);
      expect(migrateManifest).toHaveBeenCalledWith(oldManifest);
    });

    it('should not migrate when already at current version', () => {
      const currentManifest = {
        version: '3.3.0',
        standards: [],
        integrations: [],
        options: {},
        fileHashes: {},
        skillHashes: {},
        commandHashes: {},
        integrationBlockHashes: {}
      };
      readManifest.mockReturnValue(currentManifest);
      needsMigration.mockReturnValue(false);

      const result = migrateAndBackfill('/project');

      expect(result.migrated).toBe(false);
      expect(migrateManifest).not.toHaveBeenCalled();
    });

    it('should write manifest when migration occurred and hashes backfilled', () => {
      readManifest.mockReturnValue({
        version: '3.0.0',
        standards: ['commit-message'],
        integrations: [],
        options: {}
      });
      needsMigration.mockReturnValue(true);

      const result = migrateAndBackfill('/project');

      expect(result.migrated).toBe(true);
      expect(writeManifest).toHaveBeenCalled();
    });

    it('should not write manifest in dryRun mode', () => {
      readManifest.mockReturnValue({
        version: '3.0.0',
        standards: [],
        integrations: [],
        options: {}
      });
      needsMigration.mockReturnValue(true);

      migrateAndBackfill('/project', { dryRun: true });

      expect(writeManifest).not.toHaveBeenCalled();
    });

    it('should skip backfill when backfillHashes=false', () => {
      readManifest.mockReturnValue({
        version: '3.3.0',
        standards: ['commit-message'],
        integrations: [],
        options: {}
      });
      needsMigration.mockReturnValue(false);

      const result = migrateAndBackfill('/project', { backfillHashes: false });

      expect(result.backfilled).toEqual([]);
      expect(computeFileHash).not.toHaveBeenCalled();
    });

    it('should handle migration errors gracefully', () => {
      readManifest.mockReturnValue({ version: '1.0.0', standards: [] });
      needsMigration.mockReturnValue(true);
      migrateManifest.mockImplementation(() => { throw new Error('Migration boom'); });

      const result = migrateAndBackfill('/project');

      expect(result.errors).toContain('Schema migration failed: Migration boom');
    });
  });

  describe('backfillFileHashes', () => {
    it('should create hash containers if missing', () => {
      const manifest = { standards: [], integrations: [], options: {} };

      const result = backfillFileHashes('/project', manifest);

      expect(result.manifest.fileHashes).toBeDefined();
      expect(result.manifest.skillHashes).toBeDefined();
      expect(result.manifest.commandHashes).toBeDefined();
      expect(result.manifest.integrationBlockHashes).toBeDefined();
    });

    it('should backfill standard file hashes', () => {
      const manifest = {
        standards: ['commit-message'],
        integrations: [],
        options: {},
        fileHashes: {}
      };

      const result = backfillFileHashes('/project', manifest);

      expect(result.backfilled.length).toBeGreaterThan(0);
      expect(result.backfilled[0]).toContain('.standards/commit-message');
    });

    it('should not re-hash already tracked files', () => {
      const manifest = {
        standards: ['commit-message'],
        integrations: [],
        options: {},
        fileHashes: {
          '.standards/commit-message': { hash: 'sha256:existing', size: 50 }
        }
      };

      const result = backfillFileHashes('/project', manifest);

      expect(result.backfilled).not.toContain('.standards/commit-message');
    });

    it('should backfill integration block hashes', () => {
      const manifest = {
        standards: [],
        integrations: ['claude-code'],
        options: {},
        fileHashes: {},
        integrationBlockHashes: {}
      };

      const result = backfillFileHashes('/project', manifest);

      expect(result.backfilled).toContain('integration:CLAUDE.md');
    });

    it('should handle option file hashes', () => {
      const manifest = {
        standards: [],
        integrations: [],
        options: {
          'git-workflow': {
            workflow: 'github-flow'
          }
        },
        fileHashes: {}
      };

      const result = backfillFileHashes('/project', manifest);

      expect(result.backfilled.some(p => p.includes('options/'))).toBe(true);
    });

    it('should skip files that do not exist on disk', () => {
      existsSync.mockReturnValue(false);

      const manifest = {
        standards: ['nonexistent'],
        integrations: [],
        options: {},
        fileHashes: {}
      };

      const result = backfillFileHashes('/project', manifest);

      expect(result.backfilled).toEqual([]);
    });
  });
});
