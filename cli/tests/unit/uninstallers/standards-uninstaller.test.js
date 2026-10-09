import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { uninstallStandards } from '../../../src/uninstallers/standards-uninstaller.js';
import { computeFileHash } from '../../../src/utils/hasher.js';

describe('standards-uninstaller', () => {
  let testDir;
  let stdDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-test-std-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    stdDir = join(testDir, '.standards');
    mkdirSync(stdDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  /** A file UDS "installed" in .standards/, with the record `uds init` writes for it. */
  function installed(rel, content = 'content') {
    const file = join(testDir, ...rel.split('/'));
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, content);
    return { [rel]: { ...computeFileHash(file), installedAt: 'now' } };
  }

  describe('uninstallStandards', () => {
    it('should remove the files UDS wrote, the manifest, and the folder it emptied', () => {
      const fileHashes = { ...installed('.standards/test.ai.yaml'), ...installed('.standards/options/gitflow.ai.yaml') };
      writeFileSync(join(stdDir, 'manifest.json'), '{}');

      const result = uninstallStandards(testDir, { manifest: { fileHashes } });

      expect(result.removed[0]).toContain('.standards/');
      expect(result.skipped).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
      expect(existsSync(stdDir)).toBe(false);
    });

    it('should keep a file the adopter added to .standards/, and the folder that holds it', () => {
      const fileHashes = installed('.standards/test.ai.yaml');
      writeFileSync(join(stdDir, 'manifest.json'), '{}');
      writeFileSync(join(stdDir, 'my-notes.md'), 'my own notes');

      const result = uninstallStandards(testDir, { manifest: { fileHashes } });

      expect(existsSync(join(stdDir, 'test.ai.yaml'))).toBe(false);
      expect(existsSync(join(stdDir, 'manifest.json'))).toBe(false);
      expect(readFileSync(join(stdDir, 'my-notes.md'), 'utf-8')).toBe('my own notes');
      expect(result.skipped.join('\n')).toContain('my-notes.md');
    });

    it('should keep a standard file the adopter edited', () => {
      const fileHashes = installed('.standards/test.ai.yaml');
      writeFileSync(join(stdDir, 'test.ai.yaml'), 'edited by the adopter');

      const result = uninstallStandards(testDir, { manifest: { fileHashes } });

      expect(readFileSync(join(stdDir, 'test.ai.yaml'), 'utf-8')).toBe('edited by the adopter');
      expect(result.skipped.join('\n')).toContain('test.ai.yaml');
    });

    it('should delete nothing when it has no manifest to say which files UDS wrote', () => {
      writeFileSync(join(stdDir, 'test.ai.yaml'), 'content');

      const result = uninstallStandards(testDir);

      expect(result.removed).toHaveLength(0);
      expect(result.skipped[0]).toContain('no manifest');
      expect(existsSync(join(stdDir, 'test.ai.yaml'))).toBe(true);
    });

    it('should skip when .standards/ does not exist', () => {
      rmSync(stdDir, { recursive: true, force: true });

      const result = uninstallStandards(testDir, { manifest: { fileHashes: {} } });

      expect(result.removed).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('not found');
    });

    it('should preview removal in dry-run mode without deleting', () => {
      const fileHashes = installed('.standards/test.ai.yaml');
      writeFileSync(join(stdDir, 'manifest.json'), '{}');

      const result = uninstallStandards(testDir, { dryRun: true, manifest: { fileHashes } });

      expect(result.removed[0]).toContain('.standards/');
      expect(existsSync(join(stdDir, 'test.ai.yaml'))).toBe(true);
      expect(existsSync(join(stdDir, 'manifest.json'))).toBe(true);
    });
  });
});
