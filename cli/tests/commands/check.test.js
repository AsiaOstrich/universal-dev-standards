import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { checkCommand } from '../../src/commands/check.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../temp/check-test');

describe('Check Command', () => {
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
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('checkCommand', () => {
    it('should report not initialized for empty project', () => {
      checkCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('not initialized');
    });

    it('should report initialized status', () => {
      // Create minimal manifest
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '2.1.0',
          installed: '2024-01-01'
        },
        level: 2,
        standards: [],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      checkCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('Standards initialized');
      expect(output).toContain('Level: 2');
    });

    it('should report missing files', () => {
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '2.1.0',
          installed: '2024-01-01'
        },
        level: 1,
        standards: ['core/anti-hallucination.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      checkCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('Missing');
    });

    it('should report all files present when complete', () => {
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '2.1.0',
          installed: '2024-01-01'
        },
        level: 1,
        standards: ['core/anti-hallucination.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );
      writeFileSync(join(TEST_DIR, '.standards', 'anti-hallucination.md'), '# Content');

      checkCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('All 1 files present');
    });

    it('should handle corrupted manifest', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        'not valid json'
      );

      checkCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('Could not read manifest');
    });

    it('should show skills status when installed', () => {
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '2.1.0',
          installed: '2024-01-01'
        },
        level: 1,
        standards: [],
        extensions: [],
        integrations: [],
        skills: { installed: true }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      checkCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('Skills Status');
    });

    it('should show coverage summary', () => {
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '2.1.0',
          installed: '2024-01-01'
        },
        level: 2,
        standards: ['core/anti-hallucination.md'],
        extensions: [],
        integrations: [],
        skills: { installed: false }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      checkCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('Coverage Summary');
    });

    it('should show Plugin Marketplace message for marketplace location', () => {
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '3.0.0',
          installed: '2024-01-01'
        },
        level: 2,
        standards: [],
        extensions: [],
        integrations: [],
        skills: {
          installed: true,
          location: 'marketplace',
          names: ['all-via-plugin']
        }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      checkCommand();

      const output = consoleLogs.join('\n');
      expect(output).toContain('Plugin Marketplace');
      expect(output).toContain('Marketplace skills are not file-based');
      expect(output).not.toContain('Skills marked as installed but not found');
    });

    it('should not show file-not-found warning for marketplace skills', () => {
      const manifest = {
        version: '1.0.0',
        upstream: {
          repo: 'AsiaOstrich/universal-dev-standards',
          version: '3.0.0',
          installed: '2024-01-01'
        },
        level: 2,
        standards: [],
        extensions: [],
        integrations: [],
        skills: {
          installed: true,
          location: 'marketplace',
          names: ['all-via-plugin']
        }
      };

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      checkCommand();

      const output = consoleLogs.join('\n');
      // Should NOT show the warning about skills not found
      expect(output).not.toContain('Skills marked as installed but not found');
      expect(output).not.toContain('git clone');
    });
  });
});
