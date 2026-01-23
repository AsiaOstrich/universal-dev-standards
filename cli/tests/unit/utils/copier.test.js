import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  writeManifest,
  readManifest,
  isInitialized,
  getRepoRoot
} from '../../../src/utils/copier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/copier-test');

// Helper to create a valid manifest with all required fields
const createValidManifest = (overrides = {}) => ({
  version: '3.3.0',
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

describe('Copier Utils', () => {
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

  describe('writeManifest', () => {
    it('should create manifest file in .standards directory', () => {
      const manifest = createValidManifest({ level: 2 });

      const path = writeManifest(manifest, TEST_DIR);

      expect(existsSync(path)).toBe(true);
      const content = JSON.parse(readFileSync(path, 'utf-8'));
      expect(content.version).toBe('3.3.0');
      expect(content.level).toBe(2);
    });

    it('should create .standards directory if it does not exist', () => {
      const manifest = createValidManifest();
      writeManifest(manifest, TEST_DIR);

      expect(existsSync(join(TEST_DIR, '.standards'))).toBe(true);
    });

    it('should overwrite existing manifest', () => {
      const manifest1 = createValidManifest({ level: 1 });
      const manifest2 = createValidManifest({ level: 2 });

      writeManifest(manifest1, TEST_DIR);
      writeManifest(manifest2, TEST_DIR);

      const result = readManifest(TEST_DIR);
      expect(result.version).toBe('3.3.0');
      expect(result.level).toBe(2);
    });
  });

  describe('readManifest', () => {
    it('should read existing manifest', () => {
      const manifest = createValidManifest({ level: 1 });
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      const result = readManifest(TEST_DIR);

      expect(result.version).toBe('3.3.0');
      expect(result.level).toBe(1);
    });

    it('should return null if manifest does not exist', () => {
      const result = readManifest(TEST_DIR);
      expect(result).toBeNull();
    });

    it('should return null for corrupted manifest', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        'invalid json'
      );

      const result = readManifest(TEST_DIR);
      expect(result).toBeNull();
    });
  });

  describe('isInitialized', () => {
    it('should return true if manifest exists', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        '{}'
      );

      expect(isInitialized(TEST_DIR)).toBe(true);
    });

    it('should return false if manifest does not exist', () => {
      expect(isInitialized(TEST_DIR)).toBe(false);
    });

    it('should return false if only .standards directory exists', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      expect(isInitialized(TEST_DIR)).toBe(false);
    });
  });

  describe('getRepoRoot', () => {
    it('should return a valid path', () => {
      const root = getRepoRoot();
      expect(typeof root).toBe('string');
      expect(root.length).toBeGreaterThan(0);
    });
  });
});
