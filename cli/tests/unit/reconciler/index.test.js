import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all reconciler sub-modules
vi.mock('../../../src/core/manifest.js', () => ({
  readManifest: vi.fn(),
  needsMigration: vi.fn(() => false)
}));

vi.mock('../../../src/reconciler/manifest-migrator.js', () => ({
  migrateAndBackfill: vi.fn(() => ({
    manifest: { version: '3.3.0', standards: [], integrations: [] },
    migrated: true,
    backfilled: [],
    errors: []
  }))
}));

vi.mock('../../../src/reconciler/desired-state-calculator.js', () => ({
  calculateDesiredState: vi.fn(() => ({
    standards: new Map(),
    options: new Map(),
    integrations: new Map(),
    skills: new Map(),
    commands: new Map()
  }))
}));

vi.mock('../../../src/reconciler/actual-state-scanner.js', () => ({
  scanActualState: vi.fn(() => ({
    standards: new Map(),
    options: new Map(),
    integrations: new Map(),
    skills: new Map(),
    commands: new Map()
  })),
  legacyDiscovery: vi.fn(() => ({
    state: {
      standards: new Map(),
      options: new Map(),
      integrations: new Map(),
      skills: new Map(),
      commands: new Map()
    },
    syntheticManifest: {
      version: '3.3.0',
      upstream: { version: 'unknown' },
      standards: [],
      integrations: []
    }
  }))
}));

vi.mock('../../../src/reconciler/diff-engine.js', () => ({
  computeDiff: vi.fn(() => ({
    actions: [],
    summary: { create: 0, update: 0, delete: 0, unchanged: 5, migrate_block: 0 },
    warnings: []
  })),
  formatPlan: vi.fn((plan) => 'formatted plan'),
  createEmptyPlan: vi.fn(() => ({
    actions: [],
    summary: { create: 0, update: 0, delete: 0, unchanged: 0, migrate_block: 0 },
    warnings: []
  }))
}));

vi.mock('../../../src/reconciler/plan-executor.js', () => ({
  executePlan: vi.fn(async () => ({
    success: true,
    backupId: '.uds-backup-test',
    results: [],
    updatedManifest: { version: '3.3.0' },
    summary: { succeeded: 3, failed: 0, skipped: 0 }
  }))
}));

vi.mock('../../../src/reconciler/backup-manager.js', () => ({
  rollback: vi.fn(() => ({
    success: true,
    restored: ['.standards/test.yaml'],
    errors: []
  })),
  listBackups: vi.fn(() => [
    { backupId: '.uds-backup-latest', createdAt: '2026-03-03', actionCount: 5 }
  ])
}));

import { reconcile, plan, rollbackLast } from '../../../src/reconciler/index.js';
import { readManifest, needsMigration } from '../../../src/core/manifest.js';
import { migrateAndBackfill } from '../../../src/reconciler/manifest-migrator.js';
import { calculateDesiredState } from '../../../src/reconciler/desired-state-calculator.js';
import { scanActualState, legacyDiscovery } from '../../../src/reconciler/actual-state-scanner.js';
import { computeDiff } from '../../../src/reconciler/diff-engine.js';
import { executePlan } from '../../../src/reconciler/plan-executor.js';
import { rollback } from '../../../src/reconciler/backup-manager.js';

describe('Reconciler Index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('reconcile', () => {
    it('should succeed when manifest exists and no changes needed', async () => {
      readManifest.mockReturnValue({ version: '3.3.0', standards: ['a'], integrations: [] });

      const result = await reconcile('/project');

      expect(result.success).toBe(true);
      expect(result.execution).toBeNull(); // No actions = no execution
    });

    it('should call the full pipeline: migrate → desired → actual → diff', async () => {
      readManifest.mockReturnValue({ version: '3.3.0', standards: ['a'], integrations: [] });

      await reconcile('/project');

      expect(calculateDesiredState).toHaveBeenCalled();
      expect(scanActualState).toHaveBeenCalled();
      expect(computeDiff).toHaveBeenCalled();
    });

    it('should migrate manifest when outdated', async () => {
      readManifest.mockReturnValue({ version: '3.0.0', standards: [] });
      needsMigration.mockReturnValue(true);

      await reconcile('/project');

      expect(migrateAndBackfill).toHaveBeenCalled();
    });

    it('should execute plan when actions exist', async () => {
      readManifest.mockReturnValue({ version: '3.3.0', standards: ['a'], integrations: [] });
      computeDiff.mockReturnValue({
        actions: [{ type: 'create', category: 'standard', path: 'a.yaml', reason: 'test', details: {} }],
        summary: { create: 1, update: 0, delete: 0, unchanged: 0, migrate_block: 0 },
        warnings: []
      });

      const result = await reconcile('/project');

      expect(executePlan).toHaveBeenCalled();
      expect(result.execution).not.toBeNull();
    });

    it('should pass force option to computeDiff', async () => {
      readManifest.mockReturnValue({ version: '3.3.0', standards: [], integrations: [] });

      await reconcile('/project', { force: true });

      expect(computeDiff).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        { force: true }
      );
    });

    it('should fall back to legacy discovery when no manifest', async () => {
      readManifest.mockReturnValue(null);

      await reconcile('/project');

      expect(legacyDiscovery).toHaveBeenCalledWith('/project');
    });

    it('should return errors from migration', async () => {
      readManifest.mockReturnValue({ version: '3.0.0', standards: [] });
      needsMigration.mockReturnValue(true);
      migrateAndBackfill.mockReturnValue({
        manifest: { version: '3.3.0', standards: [] },
        migrated: true,
        backfilled: [],
        errors: ['Migration warning']
      });

      const result = await reconcile('/project');

      expect(result.errors).toContain('Migration warning');
    });

    it('should fail gracefully when no manifest and discovery fails', async () => {
      readManifest.mockReturnValue(null);
      legacyDiscovery.mockImplementation(() => { throw new Error('Discovery failed'); });

      const result = await reconcile('/project');

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Discovery failed') || e.includes('No manifest'))).toBe(true);
    });
  });

  describe('plan', () => {
    it('should return plan without executing', async () => {
      readManifest.mockReturnValue({ version: '3.3.0', standards: ['a'], integrations: [] });
      computeDiff.mockReturnValue({
        actions: [{ type: 'create', category: 'standard', path: 'a.yaml', reason: 'test' }],
        summary: { create: 1, update: 0, delete: 0, unchanged: 0, migrate_block: 0 },
        warnings: []
      });

      const result = await plan('/project');

      expect(result.plan.actions.length).toBe(1);
      expect(executePlan).not.toHaveBeenCalled();
    });

    it('should return empty plan when no manifest found', async () => {
      readManifest.mockReturnValue(null);
      legacyDiscovery.mockImplementation(() => { throw new Error('fail'); });

      const result = await plan('/project');

      expect(result.plan.actions).toEqual([]);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should pass force option', async () => {
      readManifest.mockReturnValue({ version: '3.3.0', standards: [], integrations: [] });

      await plan('/project', { force: true });

      expect(computeDiff).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        { force: true }
      );
    });
  });

  describe('rollbackLast', () => {
    it('should call rollback with default (most recent)', () => {
      const result = rollbackLast('/project');

      expect(rollback).toHaveBeenCalledWith('/project', undefined);
      expect(result.success).toBe(true);
    });

    it('should call rollback with specific backup ID', () => {
      rollbackLast('/project', '.uds-backup-specific');

      expect(rollback).toHaveBeenCalledWith('/project', '.uds-backup-specific');
    });
  });
});
