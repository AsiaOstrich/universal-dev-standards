import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Mock npm-registry to avoid network requests
vi.mock('../../src/utils/npm-registry.js', () => ({
  checkForUpdates: vi.fn(() => Promise.resolve({
    available: false,
    offline: true,
    message: 'Mocked for testing'
  })),
  clearCache: vi.fn()
}));

// Mock github.js
vi.mock('../../src/utils/github.js', () => ({
  getMarketplaceSkillsInfo: vi.fn(() => ({ installed: false })),
  downloadFromGitHub: vi.fn()
}));

// Mock @inquirer/prompts for Layer 3 tests
const { mockCheckbox, mockInput } = vi.hoisted(() => ({
  mockCheckbox: vi.fn(),
  mockInput: vi.fn()
}));
vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  checkbox: mockCheckbox,
  confirm: vi.fn(),
  input: mockInput,
  Separator: class Separator { constructor(t) { this.text = t; } }
}));

import { auditCommand } from '../../src/commands/audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../temp/audit-test');

// Helper to create a valid manifest
const createValidManifest = (overrides = {}) => ({
  version: '3.3.0',
  upstream: {
    repo: 'AsiaOstrich/universal-dev-standards',
    version: '5.0.0',
    installed: '2026-01-01'
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

describe('Audit Command', () => {
  let originalCwd;
  let consoleLogs = [];

  beforeEach(() => {
    originalCwd = process.cwd();
    consoleLogs = [];

    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);

    vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleLogs.push(args.join(' '));
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  // ========================
  // Layer 1: Health Check
  // ========================

  describe('Layer 1: Health Check', () => {
    it('should report ERROR when UDS is not initialized', async () => {
      await auditCommand({ health: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('not initialized');
    });

    it('should report OK when UDS is properly installed', async () => {
      const manifest = createValidManifest();
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      await auditCommand({ health: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Audit Report');
    });

    it('should report WARNING when standard files are missing', async () => {
      // Use real registry ID 'testing' — resolves to testing.ai.yaml, which is not created
      const manifest = createValidManifest({
        standards: ['testing']
      });
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      await auditCommand({ health: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('testing.ai.yaml');
      expect(output).toContain('missing');
    });

    it('should report ERROR for corrupted manifest', async () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        'not-valid-json{'
      );

      await auditCommand({ health: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('manifest');
    });
  });

  // ========================
  // Layer 2a: Pattern Detection
  // ========================

  describe('Layer 2a: Pattern Detection', () => {
    it('should detect directory patterns', async () => {
      // Create directories that signal patterns
      mkdirSync(join(TEST_DIR, 'migrations'), { recursive: true });
      mkdirSync(join(TEST_DIR, 'db'), { recursive: true });

      await auditCommand({ patterns: true, format: 'json' });

      const output = consoleLogs.join('');
      const result = JSON.parse(output);
      expect(result.patterns).toBeDefined();
      const dbPattern = result.patterns.find(p => p.name === 'database-migration');
      expect(dbPattern).toBeDefined();
      expect(dbPattern.evidence.length).toBeGreaterThanOrEqual(2);
    });

    it('should detect containerization patterns', async () => {
      writeFileSync(join(TEST_DIR, 'Dockerfile'), 'FROM node:20');
      writeFileSync(join(TEST_DIR, 'docker-compose.yml'), 'version: "3"');

      await auditCommand({ patterns: true, format: 'json' });

      const output = consoleLogs.join('');
      const result = JSON.parse(output);
      const pattern = result.patterns.find(p => p.name === 'containerization');
      expect(pattern).toBeDefined();
    });

    it('should skip commit analysis when no git repo', async () => {
      // No .git directory — should not crash
      await auditCommand({ patterns: true, format: 'json' });

      const output = consoleLogs.join('');
      const result = JSON.parse(output);
      expect(result.patterns).toBeDefined();
    });
  });

  // ========================
  // Layer 2b: Friction Detection
  // ========================

  describe('Layer 2b: Friction Detection', () => {
    it('should detect modified files', async () => {
      const testFile = 'testing.ai.yaml';
      const originalContent = 'original content for hash test';

      // Create manifest with file hash
      const { createHash } = await import('crypto');
      const hash = createHash('sha256').update(originalContent).digest('hex');
      const manifest = createValidManifest({
        fileHashes: {
          [`.standards/${testFile}`]: {
            hash: `sha256:${hash}`,
            size: Buffer.byteLength(originalContent),
            installedAt: '2026-01-01'
          }
        }
      });

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );
      // Write different content
      writeFileSync(
        join(TEST_DIR, '.standards', testFile),
        'modified content that is different'
      );

      await auditCommand({ friction: true, format: 'json' });

      const output = consoleLogs.join('');
      const result = JSON.parse(output);
      const modified = result.frictions.find(f => f.type === 'modified');
      expect(modified).toBeDefined();
      expect(modified.severity).toBe('HIGH');
    });

    it('should detect orphaned files', async () => {
      const manifest = createValidManifest({
        fileHashes: {}
      });

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );
      writeFileSync(
        join(TEST_DIR, '.standards', 'orphan-file.ai.yaml'),
        'orphaned content'
      );

      await auditCommand({ friction: true, format: 'json' });

      const output = consoleLogs.join('');
      const result = JSON.parse(output);
      const orphaned = result.frictions.find(f => f.type === 'orphaned');
      expect(orphaned).toBeDefined();
      expect(orphaned.severity).toBe('MEDIUM');
    });

    it('should detect unused standards', async () => {
      // Use real registry ID 'testing' → resolves to 'testing.ai.yaml'
      const testFile = 'testing.ai.yaml';
      const content = 'some yaml content';
      const { createHash } = await import('crypto');
      const hash = createHash('sha256').update(content).digest('hex');

      const manifest = createValidManifest({
        standards: ['testing'],
        aiTools: ['claude-code'],
        fileHashes: {
          [`.standards/${testFile}`]: {
            hash: `sha256:${hash}`,
            size: Buffer.byteLength(content),
            installedAt: '2026-01-01'
          }
        }
      });

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );
      writeFileSync(
        join(TEST_DIR, '.standards', testFile),
        content
      );
      // Create CLAUDE.md that does NOT reference the standard
      writeFileSync(
        join(TEST_DIR, 'CLAUDE.md'),
        '# Project\nSome content without references to .standards/'
      );

      await auditCommand({ friction: true, format: 'json' });

      const output = consoleLogs.join('');
      const result = JSON.parse(output);
      const unused = result.frictions.find(f => f.type === 'unused');
      expect(unused).toBeDefined();
      expect(unused.severity).toBe('LOW');
    });
  });

  // ========================
  // Output Formats
  // ========================

  describe('Output Formats', () => {
    it('should output valid JSON with --format json', async () => {
      await auditCommand({ format: 'json' });

      const output = consoleLogs.join('');
      const result = JSON.parse(output);
      expect(result.timestamp).toBeDefined();
      expect(result.udsVersion).toBeDefined();
      expect(result.nodeVersion).toBeDefined();
      expect(result.health).toBeDefined();
      expect(result.patterns).toBeDefined();
      expect(result.frictions).toBeDefined();
    });

    it('should output single-line summary with --quiet', async () => {
      await auditCommand({ quiet: true });

      expect(consoleLogs.length).toBe(1);
      const output = consoleLogs[0];
      expect(output).toMatch(/Health:.*\|.*Patterns:.*\|.*Frictions:/);
    });
  });

  // ========================
  // Layer 3: Feedback Report
  // ========================

  describe('Layer 3: Feedback Report', () => {
    it('should show dry-run output without submitting', async () => {
      const manifest = createValidManifest({
        standards: ['core/testing.ai.yaml']
      });
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      await auditCommand({ report: true, dryRun: true });

      const output = consoleLogs.join('\n');
      expect(output).toContain('Dry run');
      expect(output).toContain('UDS Audit Feedback');
    });
  });
});
