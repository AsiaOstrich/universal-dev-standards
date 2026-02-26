import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { uninstallStandards } from '../../../src/uninstallers/standards-uninstaller.js';

describe('standards-uninstaller', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-test-std-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('uninstallStandards', () => {
    it('should remove .standards/ directory when it exists', () => {
      const stdDir = join(testDir, '.standards');
      mkdirSync(stdDir, { recursive: true });
      writeFileSync(join(stdDir, 'manifest.json'), '{}');
      writeFileSync(join(stdDir, 'test.ai.yaml'), 'content');

      const result = uninstallStandards(testDir);

      expect(result.removed).toContain('.standards/');
      expect(result.skipped).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
      expect(existsSync(stdDir)).toBe(false);
    });

    it('should skip when .standards/ does not exist', () => {
      const result = uninstallStandards(testDir);

      expect(result.removed).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('not found');
    });

    it('should preview removal in dry-run mode without deleting', () => {
      const stdDir = join(testDir, '.standards');
      mkdirSync(stdDir, { recursive: true });
      writeFileSync(join(stdDir, 'manifest.json'), '{}');

      const result = uninstallStandards(testDir, { dryRun: true });

      expect(result.removed).toContain('.standards/');
      expect(existsSync(stdDir)).toBe(true);
    });
  });
});
