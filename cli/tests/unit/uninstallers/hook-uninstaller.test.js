import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { uninstallHook } from '../../../src/uninstallers/hook-uninstaller.js';

describe('hook-uninstaller', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-test-hook-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('uninstallHook', () => {
    it('should remove uds check line from pre-commit hook', () => {
      const huskyDir = join(testDir, '.husky');
      mkdirSync(huskyDir, { recursive: true });
      const hookContent = '#!/usr/bin/env sh\nnpm run lint\nuds check\nnpm test\n';
      writeFileSync(join(huskyDir, 'pre-commit'), hookContent);

      const result = uninstallHook(testDir);

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toContain('UDS check lines');
      const updated = readFileSync(join(huskyDir, 'pre-commit'), 'utf-8');
      expect(updated).not.toContain('uds check');
      expect(updated).toContain('npm run lint');
      expect(updated).toContain('npm test');
    });

    it('should remove checkin-standards line', () => {
      const huskyDir = join(testDir, '.husky');
      mkdirSync(huskyDir, { recursive: true });
      const hookContent = '#!/usr/bin/env sh\n./scripts/checkin-standards.sh\nnpm test\n';
      writeFileSync(join(huskyDir, 'pre-commit'), hookContent);

      const result = uninstallHook(testDir);

      expect(result.removed).toHaveLength(1);
      const updated = readFileSync(join(huskyDir, 'pre-commit'), 'utf-8');
      expect(updated).not.toContain('checkin-standards');
      expect(updated).toContain('npm test');
    });

    it('should skip when .husky/pre-commit does not exist', () => {
      const result = uninstallHook(testDir);

      expect(result.removed).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('not found');
    });

    it('should skip when no UDS lines found', () => {
      const huskyDir = join(testDir, '.husky');
      mkdirSync(huskyDir, { recursive: true });
      writeFileSync(join(huskyDir, 'pre-commit'), '#!/usr/bin/env sh\nnpm test\n');

      const result = uninstallHook(testDir);

      expect(result.removed).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('no UDS lines found');
    });

    it('should preview removal in dry-run mode without modifying file', () => {
      const huskyDir = join(testDir, '.husky');
      mkdirSync(huskyDir, { recursive: true });
      const hookContent = '#!/usr/bin/env sh\nuds check\nnpm test\n';
      writeFileSync(join(huskyDir, 'pre-commit'), hookContent);

      const result = uninstallHook(testDir, { dryRun: true });

      expect(result.removed).toHaveLength(1);
      // File should NOT be modified
      const content = readFileSync(join(huskyDir, 'pre-commit'), 'utf-8');
      expect(content).toContain('uds check');
    });
  });
});
