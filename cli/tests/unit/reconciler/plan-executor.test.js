import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/executor-test');

// Mock backup-manager
vi.mock('../../../src/reconciler/backup-manager.js', () => ({
  createBackup: vi.fn(() => ({
    backupId: '.uds-backup-test',
    backupDir: join(TEST_DIR, '.uds-backup-test'),
    backedUp: [],
    errors: []
  })),
  cleanupBackups: vi.fn(() => ({ removed: [], errors: [] }))
}));

// Mock copier
vi.mock('../../../src/utils/copier.js', () => ({
  copyStandard: vi.fn(async (source, targetDir, projectPath) => {
    // Simulate successful copy
    return { success: true, data: join(projectPath, targetDir, 'test.yaml') };
  })
}));

// Mock integration-generator
vi.mock('../../../src/utils/integration-generator.js', () => ({
  writeIntegrationFile: vi.fn((tool, config, projectPath) => ({
    success: true,
    path: 'CLAUDE.md',
    absolutePath: join(projectPath, 'CLAUDE.md'),
    blockHashInfo: { blockHash: 'sha256:new', blockSize: 100, fullHash: 'sha256:full', fullSize: 200 }
  })),
  buildToolIntegrationConfig: vi.fn((manifest, tool) => ({
    tool,
    categories: ['anti-hallucination', 'commit-standards', 'code-review'],
    language: 'en',
    installedStandards: (manifest.standards || []).map(s => s.split('/').pop()),
    contentMode: manifest.contentMode || 'index',
    level: 2,
    outputLanguage: 'english',
    methodology: manifest.methodology
  }))
}));

// Mock skills-installer
vi.mock('../../../src/utils/skills-installer.js', () => ({
  installSkillsToMultipleAgents: vi.fn(async () => ({
    success: true,
    allFileHashes: { 'skill:test': { hash: 'sha256:skill', size: 50 } }
  })),
  installCommandsToMultipleAgents: vi.fn(async () => ({
    success: true,
    allFileHashes: { 'cmd:test': { hash: 'sha256:cmd', size: 30 } }
  }))
}));

// Mock manifest
vi.mock('../../../src/core/manifest.js', () => ({
  writeManifest: vi.fn()
}));

// Mock hasher
vi.mock('../../../src/utils/hasher.js', () => ({
  computeFileHash: vi.fn(() => ({ hash: 'sha256:computed', size: 100 })),
  computeIntegrationBlockHash: vi.fn(() => ({
    blockHash: 'sha256:block', blockSize: 50, fullHash: 'sha256:full', fullSize: 200
  }))
}));

import { executePlan } from '../../../src/reconciler/plan-executor.js';
import { createBackup } from '../../../src/reconciler/backup-manager.js';
import { writeManifest } from '../../../src/core/manifest.js';
import { installSkillsToMultipleAgents, installCommandsToMultipleAgents } from '../../../src/utils/skills-installer.js';
import { writeIntegrationFile } from '../../../src/utils/integration-generator.js';
import { copyStandard } from '../../../src/utils/copier.js';

describe('PlanExecutor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  // `manifest.extensions` entries reach the executor with no resolved sourcePath
  // whenever UDS was installed from npm: the published package's `files` list has
  // no `extensions/`, so PathResolver finds nothing. The executor answered "No
  // source path available" and failed the action — while the legacy update path,
  // which calls copyStandard directly, refreshed the very same file. Two paths
  // disagreeing about whether a file was reachable, one of them wrong.
  describe('extension sources (XSPEC-343)', () => {
    const extensionAction = (type) => ({
      type,
      category: 'standard',
      path: '.standards/zh-tw.md',
      reason: 'test',
      details: {
        sourcePath: null, // what an npm install produces
        metadata: { extensionSource: 'extensions/locales/zh-tw.md' }
      }
    });

    it('should fetch an extension through copyStandard when no path resolved', async () => {
      const plan = {
        actions: [extensionAction('update')],
        summary: { create: 0, update: 1, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      const result = await executePlan(TEST_DIR, plan, { fileHashes: {} }, { backup: false });

      expect(copyStandard).toHaveBeenCalledWith('extensions/locales/zh-tw.md', '.standards', TEST_DIR);
      expect(result.summary.failed).toBe(0);
      expect(result.results[0].success).toBe(true);
    });

    it('should still report a genuinely unreachable entry as failed', async () => {
      // The guard: the fix must not turn every unresolvable action into a
      // success. An entry with neither a path nor any source metadata has
      // nothing to fetch, and must keep saying so.
      const plan = {
        actions: [{
          type: 'update',
          category: 'standard',
          path: '.standards/nowhere.yaml',
          reason: 'test',
          details: { sourcePath: null, metadata: {} }
        }],
        summary: { create: 0, update: 1, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      const result = await executePlan(TEST_DIR, plan, { fileHashes: {} }, { backup: false });

      expect(result.results[0].success).toBe(false);
      expect(result.results[0].error).toBe('No source path available');
    });
  });

  describe('executePlan', () => {
    it('should return success for empty plan', async () => {
      const plan = { actions: [], summary: { create: 0, update: 0, delete: 0, unchanged: 0, migrate_block: 0 } };
      const manifest = { fileHashes: {} };

      const result = await executePlan(TEST_DIR, plan, manifest);

      expect(result.success).toBe(true);
      expect(result.results).toEqual([]);
      expect(result.summary.succeeded).toBe(0);
    });

    it('should create backup before executing', async () => {
      const plan = {
        actions: [
          { type: 'create', category: 'standard', path: '.standards/test.yaml', reason: 'missing', details: { sourcePath: '/src/test.yaml', metadata: { registryEntry: { source: 'ai/test.yaml' }, format: 'ai' } } }
        ],
        summary: { create: 1, update: 0, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      await executePlan(TEST_DIR, plan, { fileHashes: {} });

      expect(createBackup).toHaveBeenCalledWith(TEST_DIR, plan);
    });

    it('should skip backup when backup=false', async () => {
      const plan = {
        actions: [
          { type: 'create', category: 'standard', path: '.standards/test.yaml', reason: 'missing', details: { sourcePath: '/src/test.yaml', metadata: {} } }
        ],
        summary: { create: 1, update: 0, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      await executePlan(TEST_DIR, plan, { fileHashes: {} }, { backup: false });

      expect(createBackup).not.toHaveBeenCalled();
    });

    it('should not execute actions in dryRun mode', async () => {
      const plan = {
        actions: [
          { type: 'create', category: 'standard', path: '.standards/test.yaml', reason: 'missing', details: {} }
        ],
        summary: { create: 1, update: 0, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      const result = await executePlan(TEST_DIR, plan, { fileHashes: {} }, { dryRun: true });

      expect(result.results[0].dryRun).toBe(true);
      expect(writeManifest).not.toHaveBeenCalled();
    });

    it('should handle delete actions', async () => {
      // Create file to delete
      writeFileSync(join(TEST_DIR, '.standards', 'old.yaml'), 'old content');

      const plan = {
        actions: [
          { type: 'delete', category: 'standard', path: '.standards/old.yaml', reason: 'not in desired', details: {} }
        ],
        summary: { create: 0, update: 0, delete: 1, unchanged: 0, migrate_block: 0 }
      };

      const manifest = { fileHashes: { '.standards/old.yaml': { hash: 'sha256:old', size: 11 } }, integrationBlockHashes: {} };
      const result = await executePlan(TEST_DIR, plan, manifest, { backup: false });

      expect(result.success).toBe(true);
      expect(existsSync(join(TEST_DIR, '.standards', 'old.yaml'))).toBe(false);
    });

    it('should execute migrate_block actions via writeIntegrationFile', async () => {
      const plan = {
        actions: [
          { type: 'migrate_block', category: 'integration', path: 'CLAUDE.md', reason: 'update', details: { toolName: 'claude-code', format: 'markdown' } }
        ],
        summary: { create: 0, update: 0, delete: 0, unchanged: 0, migrate_block: 1 }
      };

      const manifest = { integrations: ['claude-code'], standards: [], fileHashes: {}, integrationBlockHashes: {} };
      const result = await executePlan(TEST_DIR, plan, manifest, { backup: false });

      expect(writeIntegrationFile).toHaveBeenCalledWith('claude-code', expect.any(Object), TEST_DIR);
      expect(result.success).toBe(true);
    });

    it('should batch install skills', async () => {
      const plan = {
        actions: [
          { type: 'create', category: 'skill', path: '.claude/skills/test', reason: 'missing', details: { metadata: { skillName: 'test-skill', agent: 'claude-code', level: 'project' } } }
        ],
        summary: { create: 1, update: 0, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      const manifest = {
        skills: { installed: true, installations: [{ agent: 'claude-code', level: 'project' }], names: ['test-skill'] },
        fileHashes: {},
        skillHashes: {},
        commandHashes: {}
      };
      const result = await executePlan(TEST_DIR, plan, manifest, { backup: false });

      expect(installSkillsToMultipleAgents).toHaveBeenCalled();
    });

    it('should batch install commands', async () => {
      const plan = {
        actions: [
          { type: 'create', category: 'command', path: '.claude/commands/test', reason: 'missing', details: { metadata: { commandName: 'test-cmd', agent: 'claude-code', level: 'project' } } }
        ],
        summary: { create: 1, update: 0, delete: 0, unchanged: 0, migrate_block: 0 }
      };

      const manifest = {
        commands: { installed: true, installations: [{ agent: 'claude-code', level: 'project' }], names: ['test-cmd'] },
        fileHashes: {},
        skillHashes: {},
        commandHashes: {}
      };
      const result = await executePlan(TEST_DIR, plan, manifest, { backup: false });

      expect(installCommandsToMultipleAgents).toHaveBeenCalled();
    });

    it('should write manifest after execution', async () => {
      const plan = {
        actions: [
          { type: 'delete', category: 'standard', path: '.standards/test.yaml', reason: 'test', details: {} }
        ],
        summary: { create: 0, update: 0, delete: 1, unchanged: 0, migrate_block: 0 }
      };

      writeFileSync(join(TEST_DIR, '.standards', 'test.yaml'), 'content');

      await executePlan(TEST_DIR, plan, { fileHashes: {}, integrationBlockHashes: {} }, { backup: false });

      expect(writeManifest).toHaveBeenCalled();
    });

    it('should call onAction callback', async () => {
      const onAction = vi.fn();
      const plan = {
        actions: [
          { type: 'delete', category: 'standard', path: '.standards/test.yaml', reason: 'test', details: {} }
        ],
        summary: { create: 0, update: 0, delete: 1, unchanged: 0, migrate_block: 0 }
      };

      writeFileSync(join(TEST_DIR, '.standards', 'test.yaml'), 'content');

      await executePlan(TEST_DIR, plan, { fileHashes: {}, integrationBlockHashes: {} }, { backup: false, onAction });

      expect(onAction).toHaveBeenCalled();
    });

    it('should track failed actions without aborting', async () => {
      const plan = {
        actions: [
          { type: 'create', category: 'standard', path: '.standards/ok.yaml', reason: 'test', details: { sourcePath: '/src/ok.yaml', metadata: {} } },
          { type: 'delete', category: 'standard', path: '.standards/missing.yaml', reason: 'test', details: {} }
        ],
        summary: { create: 1, update: 0, delete: 1, unchanged: 0, migrate_block: 0 }
      };

      // The delete will succeed (file doesn't exist = already gone)
      const result = await executePlan(TEST_DIR, plan, { fileHashes: {}, integrationBlockHashes: {} }, { backup: false });

      expect(result.summary.succeeded + result.summary.failed).toBeGreaterThan(0);
    });
  });

  // XSPEC-343 R2. The locale argument was omitted on the skills path while the
  // commands path passed it, so a reconcile silently reinstalled every skill in
  // English. telemetry-server lost 59 zh-TW skill files to this while its own
  // manifest went on recording `skills.locale: zh-TW`.
  describe('skill locale', () => {
    it('passes the recorded skills locale to the installer', async () => {
      const manifest = {
        standards: [],
        skills: {
          installed: true,
          locale: 'zh-TW',
          installations: [{ agent: 'claude-code', level: 'project' }]
        },
        options: { display_language: 'zh-tw' }
      };
      const plan = {
        actions: [{
          type: 'update', category: 'skill', path: '.claude/skills/tdd-assistant',
          details: { metadata: { skillName: 'tdd-assistant' } }
        }],
        summary: {}, warnings: []
      };

      await executePlan(TEST_DIR, plan, manifest, { backup: false });

      expect(installSkillsToMultipleAgents).toHaveBeenCalledWith(
        manifest.skills.installations, ['tdd-assistant'], TEST_DIR, 'zh-TW'
      );
    });

    it('falls back to the display language when skills.locale is unset', async () => {
      const manifest = {
        standards: [],
        skills: { installed: true, installations: [{ agent: 'claude-code', level: 'project' }] },
        options: { display_language: 'zh-tw' }
      };
      const plan = {
        actions: [{
          type: 'update', category: 'skill', path: '.claude/skills/tdd-assistant',
          details: { metadata: { skillName: 'tdd-assistant' } }
        }],
        summary: {}, warnings: []
      };

      await executePlan(TEST_DIR, plan, manifest, { backup: false });

      expect(installSkillsToMultipleAgents).toHaveBeenCalledWith(
        manifest.skills.installations, ['tdd-assistant'], TEST_DIR, 'zh-TW'
      );
    });
  });
});
