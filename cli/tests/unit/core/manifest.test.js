import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  SUPPORTED_SCHEMA_VERSIONS,
  CURRENT_SCHEMA_VERSION,
  DEFAULT_MANIFEST,
  getManifestPath,
  manifestExists,
  readManifest,
  writeManifest,
  validateManifest,
  createManifest,
  mergeManifest,
  migrateManifest,
  needsMigration,
  updateUpstream,
  addFileHash,
  removeFileHash,
  getAITools,
  getStandards,
  getAdoptionLevel,
  areSkillsInstalled,
  areCommandsInstalled
} from '../../../src/core/manifest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/manifest-test');

// Helper to create a valid manifest with all required fields
const createValidManifest = (overrides = {}) => ({
  version: CURRENT_SCHEMA_VERSION,
  upstream: {
    repo: 'AsiaOstrich/universal-dev-standards',
    version: null,
    installed: new Date().toISOString()
  },
  level: 2,
  format: 'ai',
  standardsScope: 'minimal',
  contentMode: 'index',
  standards: [],
  extensions: [],
  integrations: [],
  integrationConfigs: {},
  options: {},
  aiTools: [],
  skills: { installed: false, location: 'marketplace', names: [], version: null, installations: [] },
  commands: { installed: false, names: [], installations: [] },
  methodology: null,
  fileHashes: {},
  skillHashes: {},
  commandHashes: {},
  integrationBlockHashes: {},
  ...overrides
});

describe('Schema Constants', () => {
  describe('SUPPORTED_SCHEMA_VERSIONS', () => {
    it('should include all supported versions', () => {
      expect(SUPPORTED_SCHEMA_VERSIONS).toContain('3.0.0');
      expect(SUPPORTED_SCHEMA_VERSIONS).toContain('3.1.0');
      expect(SUPPORTED_SCHEMA_VERSIONS).toContain('3.2.0');
      expect(SUPPORTED_SCHEMA_VERSIONS).toContain('3.3.0');
    });
  });

  describe('CURRENT_SCHEMA_VERSION', () => {
    it('should be the latest version', () => {
      expect(CURRENT_SCHEMA_VERSION).toBe('3.3.0');
    });
  });

  describe('DEFAULT_MANIFEST', () => {
    it('should have all required fields', () => {
      expect(DEFAULT_MANIFEST.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(DEFAULT_MANIFEST.upstream).toBeDefined();
      expect(DEFAULT_MANIFEST.level).toBe(2);
      expect(DEFAULT_MANIFEST.format).toBe('ai');
      expect(DEFAULT_MANIFEST.standardsScope).toBe('minimal');
      expect(DEFAULT_MANIFEST.contentMode).toBe('index');
    });

    it('should have all hash tracking fields', () => {
      expect(DEFAULT_MANIFEST.fileHashes).toEqual({});
      expect(DEFAULT_MANIFEST.skillHashes).toEqual({});
      expect(DEFAULT_MANIFEST.commandHashes).toEqual({});
      expect(DEFAULT_MANIFEST.integrationBlockHashes).toEqual({});
    });

    it('should have skills and commands config', () => {
      expect(DEFAULT_MANIFEST.skills.installed).toBe(false);
      expect(DEFAULT_MANIFEST.skills.location).toBe('marketplace');
      expect(DEFAULT_MANIFEST.commands.installed).toBe(false);
    });
  });
});

describe('Manifest Path Functions', () => {
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

  describe('getManifestPath', () => {
    it('should return correct manifest path', () => {
      const path = getManifestPath(TEST_DIR);
      expect(path).toBe(join(TEST_DIR, '.standards', 'manifest.json'));
    });
  });

  describe('manifestExists', () => {
    it('should return false when manifest does not exist', () => {
      expect(manifestExists(TEST_DIR)).toBe(false);
    });

    it('should return true when manifest exists', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        '{}'
      );
      expect(manifestExists(TEST_DIR)).toBe(true);
    });
  });
});

describe('Manifest CRUD Operations', () => {
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

  describe('readManifest', () => {
    it('should return null when manifest does not exist', () => {
      expect(readManifest(TEST_DIR)).toBeNull();
    });

    it('should return null for corrupted JSON', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        'invalid json'
      );
      expect(readManifest(TEST_DIR)).toBeNull();
    });

    it('should return null for invalid manifest structure', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify({ invalid: 'structure' })
      );
      expect(readManifest(TEST_DIR)).toBeNull();
    });

    it('should read valid manifest', () => {
      const manifest = createValidManifest();
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      const result = readManifest(TEST_DIR);
      expect(result).not.toBeNull();
      expect(result.version).toBe(CURRENT_SCHEMA_VERSION);
    });
  });

  describe('writeManifest', () => {
    it('should create .standards directory if not exists', () => {
      const manifest = createValidManifest();
      writeManifest(manifest, TEST_DIR);

      expect(existsSync(join(TEST_DIR, '.standards'))).toBe(true);
    });

    it('should write manifest as JSON', () => {
      const manifest = createValidManifest({ level: 3 });
      const path = writeManifest(manifest, TEST_DIR);

      expect(existsSync(path)).toBe(true);
      const content = JSON.parse(readFileSync(path, 'utf-8'));
      expect(content.level).toBe(3);
    });

    it('should throw for invalid manifest', () => {
      expect(() => writeManifest({ invalid: 'data' }, TEST_DIR)).toThrow();
    });
  });
});

describe('Manifest Validation', () => {
  describe('validateManifest', () => {
    it('should return false for null', () => {
      expect(validateManifest(null)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(validateManifest('string')).toBe(false);
      expect(validateManifest(123)).toBe(false);
    });

    it('should return false for missing required fields', () => {
      expect(validateManifest({})).toBe(false);
      expect(validateManifest({ version: '3.3.0' })).toBe(false);
    });

    it('should return false for invalid version format', () => {
      const manifest = createValidManifest({ version: 'invalid' });
      expect(validateManifest(manifest)).toBe(false);
    });

    it('should return false for invalid level', () => {
      const manifest = createValidManifest({ level: 5 });
      expect(validateManifest(manifest)).toBe(false);
    });

    it('should return false for invalid format', () => {
      const manifest = createValidManifest({ format: 'invalid' });
      expect(validateManifest(manifest)).toBe(false);
    });

    it('should return false for invalid standardsScope', () => {
      const manifest = createValidManifest({ standardsScope: 'invalid' });
      expect(validateManifest(manifest)).toBe(false);
    });

    it('should return false for invalid contentMode', () => {
      const manifest = createValidManifest({ contentMode: 'invalid' });
      expect(validateManifest(manifest)).toBe(false);
    });

    it('should return false for invalid upstream type', () => {
      const manifest = createValidManifest({ upstream: 'string' });
      expect(validateManifest(manifest)).toBe(false);
    });

    it('should return true for valid manifest', () => {
      const manifest = createValidManifest();
      expect(validateManifest(manifest)).toBe(true);
    });

    it('should accept all valid levels', () => {
      expect(validateManifest(createValidManifest({ level: 1 }))).toBe(true);
      expect(validateManifest(createValidManifest({ level: 2 }))).toBe(true);
      expect(validateManifest(createValidManifest({ level: 3 }))).toBe(true);
    });

    it('should accept all valid formats', () => {
      expect(validateManifest(createValidManifest({ format: 'ai' }))).toBe(true);
      expect(validateManifest(createValidManifest({ format: 'human' }))).toBe(true);
      expect(validateManifest(createValidManifest({ format: 'both' }))).toBe(true);
    });

    it('should accept all valid content modes', () => {
      expect(validateManifest(createValidManifest({ contentMode: 'minimal' }))).toBe(true);
      expect(validateManifest(createValidManifest({ contentMode: 'index' }))).toBe(true);
      expect(validateManifest(createValidManifest({ contentMode: 'full' }))).toBe(true);
    });
  });
});

describe('Manifest Creation and Merging', () => {
  describe('createManifest', () => {
    it('should create manifest with defaults', () => {
      const manifest = createManifest();

      expect(manifest.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(manifest.level).toBe(2);
      expect(manifest.format).toBe('ai');
    });

    it('should allow overriding fields', () => {
      const manifest = createManifest({ level: 3, format: 'human' });

      expect(manifest.level).toBe(3);
      expect(manifest.format).toBe('human');
    });

    it('should merge nested objects', () => {
      const manifest = createManifest({
        upstream: { version: '1.0.0' },
        skills: { installed: true }
      });

      expect(manifest.upstream.repo).toBe('AsiaOstrich/universal-dev-standards');
      expect(manifest.upstream.version).toBe('1.0.0');
      expect(manifest.skills.installed).toBe(true);
    });
  });

  describe('mergeManifest', () => {
    it('should create manifest if base is null', () => {
      const merged = mergeManifest(null, { level: 3 });

      expect(merged.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(merged.level).toBe(3);
    });

    it('should merge updates into base manifest', () => {
      const base = createValidManifest({ level: 1 });
      const merged = mergeManifest(base, { level: 2 });

      expect(merged.level).toBe(2);
    });

    it('should merge nested objects correctly', () => {
      const base = createValidManifest({
        options: { optionA: 'valueA' }
      });
      const merged = mergeManifest(base, {
        options: { optionB: 'valueB' }
      });

      expect(merged.options.optionA).toBe('valueA');
      expect(merged.options.optionB).toBe('valueB');
    });

    it('should throw for invalid merged result', () => {
      const base = createValidManifest();
      expect(() => mergeManifest(base, { level: 'invalid' })).toThrow();
    });
  });
});

describe('Manifest Migration', () => {
  describe('needsMigration', () => {
    it('should return true for null manifest', () => {
      expect(needsMigration(null)).toBe(true);
    });

    it('should return true for old version', () => {
      expect(needsMigration({ version: '3.0.0' })).toBe(true);
      expect(needsMigration({ version: '3.1.0' })).toBe(true);
      expect(needsMigration({ version: '3.2.0' })).toBe(true);
    });

    it('should return false for current version', () => {
      expect(needsMigration({ version: CURRENT_SCHEMA_VERSION })).toBe(false);
    });
  });

  describe('migrateManifest', () => {
    it('should create manifest if null', () => {
      const migrated = migrateManifest(null);

      expect(migrated.version).toBe(CURRENT_SCHEMA_VERSION);
    });

    it('should return manifest unchanged if already current', () => {
      const manifest = createValidManifest();
      const migrated = migrateManifest(manifest);

      expect(migrated.version).toBe(CURRENT_SCHEMA_VERSION);
    });

    it('should migrate from 3.0.0', () => {
      const oldManifest = {
        version: '3.0.0',
        upstream: { repo: 'test/repo' },
        level: 2,
        format: 'ai',
        standardsScope: 'minimal',
        contentMode: 'index'
      };

      const migrated = migrateManifest(oldManifest);

      expect(migrated.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(migrated.fileHashes).toEqual({});
      expect(migrated.skillHashes).toEqual({});
    });

    it('should migrate from 3.1.0', () => {
      const oldManifest = {
        version: '3.1.0',
        upstream: { repo: 'test/repo' },
        level: 2,
        format: 'ai',
        standardsScope: 'minimal',
        contentMode: 'index',
        fileHashes: { 'test.md': { hash: 'sha256:abc' } }
      };

      const migrated = migrateManifest(oldManifest);

      expect(migrated.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(migrated.fileHashes['test.md'].hash).toBe('sha256:abc');
      expect(migrated.skillHashes).toEqual({});
    });

    it('should migrate from 3.2.0', () => {
      const oldManifest = {
        version: '3.2.0',
        upstream: { repo: 'test/repo' },
        level: 2,
        format: 'ai',
        standardsScope: 'full',
        contentMode: 'full',
        fileHashes: {}
      };

      const migrated = migrateManifest(oldManifest);

      expect(migrated.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(migrated.standardsScope).toBe('full');
      expect(migrated.skillHashes).toEqual({});
      expect(migrated.commandHashes).toEqual({});
      expect(migrated.integrationBlockHashes).toEqual({});
    });

    it('should preserve existing data during migration', () => {
      const oldManifest = {
        version: '3.0.0',
        upstream: { repo: 'custom/repo', version: '1.0.0' },
        level: 3,
        format: 'human',
        standardsScope: 'minimal',
        contentMode: 'index',
        aiTools: ['claude-code', 'cursor'],
        standards: ['core/test.md']
      };

      const migrated = migrateManifest(oldManifest);

      expect(migrated.upstream.repo).toBe('custom/repo');
      expect(migrated.level).toBe(3);
      expect(migrated.aiTools).toContain('claude-code');
      expect(migrated.standards).toContain('core/test.md');
    });
  });
});

describe('Manifest Update Helpers', () => {
  describe('updateUpstream', () => {
    it('should update upstream info', () => {
      const manifest = createValidManifest();
      const updated = updateUpstream(manifest, { version: '2.0.0' });

      expect(updated.upstream.version).toBe('2.0.0');
      expect(updated.upstream.installed).toBeDefined();
    });

    it('should preserve existing upstream fields', () => {
      const manifest = createValidManifest();
      const updated = updateUpstream(manifest, { version: '2.0.0' });

      expect(updated.upstream.repo).toBe('AsiaOstrich/universal-dev-standards');
    });
  });

  describe('addFileHash', () => {
    it('should add file hash to manifest', () => {
      const manifest = createValidManifest();
      const updated = addFileHash(manifest, 'core/test.md', 'sha256:abc123', 1024);

      expect(updated.fileHashes['core/test.md']).toBeDefined();
      expect(updated.fileHashes['core/test.md'].hash).toBe('sha256:abc123');
      expect(updated.fileHashes['core/test.md'].size).toBe(1024);
      expect(updated.fileHashes['core/test.md'].installedAt).toBeDefined();
    });

    it('should not mutate original manifest', () => {
      const manifest = createValidManifest();
      const updated = addFileHash(manifest, 'test.md', 'sha256:abc', 100);

      expect(manifest.fileHashes['test.md']).toBeUndefined();
      expect(updated.fileHashes['test.md']).toBeDefined();
    });
  });

  describe('removeFileHash', () => {
    it('should remove file hash from manifest', () => {
      const manifest = createValidManifest({
        fileHashes: {
          'file1.md': { hash: 'sha256:aaa', size: 100 },
          'file2.md': { hash: 'sha256:bbb', size: 200 }
        }
      });

      const updated = removeFileHash(manifest, 'file1.md');

      expect(updated.fileHashes['file1.md']).toBeUndefined();
      expect(updated.fileHashes['file2.md']).toBeDefined();
    });

    it('should not mutate original manifest', () => {
      const manifest = createValidManifest({
        fileHashes: { 'test.md': { hash: 'sha256:abc', size: 100 } }
      });

      const updated = removeFileHash(manifest, 'test.md');

      expect(manifest.fileHashes['test.md']).toBeDefined();
      expect(updated.fileHashes['test.md']).toBeUndefined();
    });
  });
});

describe('Manifest Query Helpers', () => {
  describe('getAITools', () => {
    it('should return AI tools array', () => {
      const manifest = createValidManifest({ aiTools: ['claude-code', 'cursor'] });
      expect(getAITools(manifest)).toEqual(['claude-code', 'cursor']);
    });

    it('should return empty array if not defined', () => {
      const manifest = { ...createValidManifest(), aiTools: undefined };
      expect(getAITools(manifest)).toEqual([]);
    });
  });

  describe('getStandards', () => {
    it('should return standards array', () => {
      const manifest = createValidManifest({ standards: ['core/test.md'] });
      expect(getStandards(manifest)).toEqual(['core/test.md']);
    });

    it('should return empty array if not defined', () => {
      const manifest = { ...createValidManifest(), standards: undefined };
      expect(getStandards(manifest)).toEqual([]);
    });
  });

  describe('getAdoptionLevel', () => {
    it('should return adoption level', () => {
      const manifest = createValidManifest({ level: 3 });
      expect(getAdoptionLevel(manifest)).toBe(3);
    });

    it('should return default level if not defined', () => {
      const manifest = { ...createValidManifest(), level: undefined };
      expect(getAdoptionLevel(manifest)).toBe(2);
    });
  });

  describe('areSkillsInstalled', () => {
    it('should return true if skills installed', () => {
      const manifest = createValidManifest({
        skills: { installed: true, location: 'project', names: ['skill1'] }
      });
      expect(areSkillsInstalled(manifest)).toBe(true);
    });

    it('should return false if skills not installed', () => {
      const manifest = createValidManifest();
      expect(areSkillsInstalled(manifest)).toBe(false);
    });
  });

  describe('areCommandsInstalled', () => {
    it('should return true if commands installed', () => {
      const manifest = createValidManifest({
        commands: { installed: true, names: ['cmd1'] }
      });
      expect(areCommandsInstalled(manifest)).toBe(true);
    });

    it('should return false if commands not installed', () => {
      const manifest = createValidManifest();
      expect(areCommandsInstalled(manifest)).toBe(false);
    });
  });
});
