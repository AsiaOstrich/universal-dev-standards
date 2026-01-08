import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  computeFileHash,
  compareFileHash,
  computeFileHashes,
  hasFileHashes,
  getFileStatusSummary
} from '../../../src/utils/hasher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/hasher-test');

describe('Hasher Utils', () => {
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

  describe('computeFileHash', () => {
    it('should compute SHA-256 hash for a file', () => {
      const filePath = join(TEST_DIR, 'test.txt');
      writeFileSync(filePath, 'Hello, World!');

      const result = computeFileHash(filePath);

      expect(result).not.toBeNull();
      expect(result.hash).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(result.size).toBe(13); // 'Hello, World!' is 13 bytes
    });

    it('should return consistent hash for same content', () => {
      const file1 = join(TEST_DIR, 'test1.txt');
      const file2 = join(TEST_DIR, 'test2.txt');
      writeFileSync(file1, 'Same content');
      writeFileSync(file2, 'Same content');

      const hash1 = computeFileHash(file1);
      const hash2 = computeFileHash(file2);

      expect(hash1.hash).toBe(hash2.hash);
      expect(hash1.size).toBe(hash2.size);
    });

    it('should return different hash for different content', () => {
      const file1 = join(TEST_DIR, 'test1.txt');
      const file2 = join(TEST_DIR, 'test2.txt');
      writeFileSync(file1, 'Content A');
      writeFileSync(file2, 'Content B');

      const hash1 = computeFileHash(file1);
      const hash2 = computeFileHash(file2);

      expect(hash1.hash).not.toBe(hash2.hash);
    });

    it('should return null for non-existent file', () => {
      const result = computeFileHash(join(TEST_DIR, 'nonexistent.txt'));
      expect(result).toBeNull();
    });
  });

  describe('compareFileHash', () => {
    it('should return unchanged for identical file', () => {
      const filePath = join(TEST_DIR, 'test.txt');
      writeFileSync(filePath, 'Hello, World!');

      const hashInfo = computeFileHash(filePath);
      const result = compareFileHash(filePath, hashInfo);

      expect(result).toBe('unchanged');
    });

    it('should return modified for changed content', () => {
      const filePath = join(TEST_DIR, 'test.txt');
      writeFileSync(filePath, 'Original content');

      const hashInfo = computeFileHash(filePath);
      writeFileSync(filePath, 'Modified content');

      const result = compareFileHash(filePath, hashInfo);

      expect(result).toBe('modified');
    });

    it('should return modified for same length but different content', () => {
      const filePath = join(TEST_DIR, 'test.txt');
      writeFileSync(filePath, 'AAAA');

      const hashInfo = computeFileHash(filePath);
      writeFileSync(filePath, 'BBBB');

      const result = compareFileHash(filePath, hashInfo);

      expect(result).toBe('modified');
    });

    it('should return missing for deleted file', () => {
      const filePath = join(TEST_DIR, 'test.txt');
      writeFileSync(filePath, 'Hello');

      const hashInfo = computeFileHash(filePath);
      rmSync(filePath);

      const result = compareFileHash(filePath, hashInfo);

      expect(result).toBe('missing');
    });

    it('should return missing for non-existent file', () => {
      const hashInfo = { hash: 'sha256:abc123', size: 100 };
      const result = compareFileHash(join(TEST_DIR, 'nonexistent.txt'), hashInfo);

      expect(result).toBe('missing');
    });
  });

  describe('computeFileHashes', () => {
    it('should compute hashes for multiple files', () => {
      const file1 = join(TEST_DIR, 'test1.txt');
      const file2 = join(TEST_DIR, 'test2.txt');
      writeFileSync(file1, 'Content 1');
      writeFileSync(file2, 'Content 2');

      const result = computeFileHashes([file1, file2]);

      expect(Object.keys(result)).toHaveLength(2);
      expect(result[file1]).toBeDefined();
      expect(result[file2]).toBeDefined();
      expect(result[file1].hash).toMatch(/^sha256:/);
      expect(result[file2].hash).toMatch(/^sha256:/);
      expect(result[file1].installedAt).toBeDefined();
    });

    it('should skip non-existent files', () => {
      const existingFile = join(TEST_DIR, 'exists.txt');
      const nonExistentFile = join(TEST_DIR, 'nonexistent.txt');
      writeFileSync(existingFile, 'Content');

      const result = computeFileHashes([existingFile, nonExistentFile]);

      expect(Object.keys(result)).toHaveLength(1);
      expect(result[existingFile]).toBeDefined();
      expect(result[nonExistentFile]).toBeUndefined();
    });

    it('should include installedAt timestamp', () => {
      const filePath = join(TEST_DIR, 'test.txt');
      writeFileSync(filePath, 'Content');

      const before = new Date().toISOString();
      const result = computeFileHashes([filePath]);
      const after = new Date().toISOString();

      expect(result[filePath].installedAt).toBeDefined();
      expect(result[filePath].installedAt >= before).toBe(true);
      expect(result[filePath].installedAt <= after).toBe(true);
    });
  });

  describe('hasFileHashes', () => {
    it('should return true for manifest with fileHashes', () => {
      const manifest = {
        fileHashes: {
          '.standards/test.md': { hash: 'sha256:abc', size: 100 }
        }
      };

      expect(hasFileHashes(manifest)).toBe(true);
    });

    it('should return false for empty fileHashes', () => {
      const manifest = { fileHashes: {} };
      expect(hasFileHashes(manifest)).toBe(false);
    });

    it('should return false for missing fileHashes', () => {
      const manifest = { version: '1.0.0' };
      expect(hasFileHashes(manifest)).toBe(false);
    });

    it('should return false for null fileHashes', () => {
      const manifest = { fileHashes: null };
      expect(hasFileHashes(manifest)).toBe(false);
    });
  });

  describe('getFileStatusSummary', () => {
    it('should categorize files by status', () => {
      // Create test files
      const unchangedFile = join(TEST_DIR, '.standards', 'unchanged.md');
      const modifiedFile = join(TEST_DIR, '.standards', 'modified.md');
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(unchangedFile, 'Unchanged content');
      writeFileSync(modifiedFile, 'Original content');

      // Create manifest with hashes
      const unchangedHash = computeFileHash(unchangedFile);
      const modifiedHash = computeFileHash(modifiedFile);

      // Modify one file
      writeFileSync(modifiedFile, 'Modified content!');

      const manifest = {
        fileHashes: {
          '.standards/unchanged.md': unchangedHash,
          '.standards/modified.md': modifiedHash,
          '.standards/missing.md': { hash: 'sha256:abc', size: 100 }
        }
      };

      const summary = getFileStatusSummary(TEST_DIR, manifest);

      expect(summary.unchanged).toContain('.standards/unchanged.md');
      expect(summary.modified).toContain('.standards/modified.md');
      expect(summary.missing).toContain('.standards/missing.md');
    });

    it('should handle legacy manifest without fileHashes', () => {
      // Create test files
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'exists.md'), 'Content');

      const manifest = {
        standards: ['core/exists.md', 'core/missing.md'],
        extensions: [],
        integrations: []
      };

      const summary = getFileStatusSummary(TEST_DIR, manifest);

      expect(summary.noHash).toContain(join('.standards', 'exists.md'));
      expect(summary.missing).toContain(join('.standards', 'missing.md'));
    });
  });
});
