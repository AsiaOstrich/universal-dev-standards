import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  computeFileHash,
  compareFileHash,
  computeFileHashes,
  hasFileHashes,
  getFileStatusSummary,
  scanForUntrackedFiles,
  computeDirectoryHashes,
  computeIntegrationBlockHash,
  normalizeLineEndings,
  isBinaryContent
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

  describe('scanForUntrackedFiles', () => {
    it('should find untracked files in .standards/', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'tracked.md'), 'tracked');
      writeFileSync(join(TEST_DIR, '.standards', 'untracked.md'), 'untracked');
      writeFileSync(join(TEST_DIR, '.standards', 'manifest.json'), '{}');

      const manifest = {
        fileHashes: {
          '.standards/tracked.md': { hash: 'sha256:abc', size: 7 }
        }
      };

      const untracked = scanForUntrackedFiles(TEST_DIR, manifest);

      expect(untracked).toContain('.standards/untracked.md');
      expect(untracked).not.toContain('.standards/tracked.md');
      expect(untracked).not.toContain('.standards/manifest.json');
    });

    it('should find untracked files in .standards/options/', () => {
      mkdirSync(join(TEST_DIR, '.standards', 'options'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'options', 'custom.md'), 'custom');
      writeFileSync(join(TEST_DIR, '.standards', 'manifest.json'), '{}');

      const manifest = { fileHashes: {} };

      const untracked = scanForUntrackedFiles(TEST_DIR, manifest);

      // Path format depends on OS
      const hasOptionsFile = untracked.some(f =>
        f.includes('options') && f.includes('custom.md')
      );
      expect(hasOptionsFile).toBe(true);
    });

    it('should find untracked integration files', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'manifest.json'), '{}');
      writeFileSync(join(TEST_DIR, '.cursorrules'), 'rules');
      writeFileSync(join(TEST_DIR, 'CLAUDE.md'), '# Claude');

      const manifest = {
        fileHashes: {},
        integrations: []
      };

      const untracked = scanForUntrackedFiles(TEST_DIR, manifest);

      expect(untracked).toContain('.cursorrules');
      expect(untracked).toContain('CLAUDE.md');
    });

    it('should not report manifest.json as untracked', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'manifest.json'), '{}');

      const manifest = { fileHashes: {} };

      const untracked = scanForUntrackedFiles(TEST_DIR, manifest);

      const hasManifest = untracked.some(f => f.includes('manifest.json'));
      expect(hasManifest).toBe(false);
    });

    it('should not report already tracked files', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'tracked.md'), 'content');
      writeFileSync(join(TEST_DIR, '.standards', 'manifest.json'), '{}');
      writeFileSync(join(TEST_DIR, '.cursorrules'), 'rules');

      const manifest = {
        fileHashes: {
          '.standards/tracked.md': { hash: 'sha256:abc', size: 7 },
          '.cursorrules': { hash: 'sha256:def', size: 5 }
        }
      };

      const untracked = scanForUntrackedFiles(TEST_DIR, manifest);

      expect(untracked).not.toContain('.standards/tracked.md');
      expect(untracked).not.toContain('.cursorrules');
    });

    it('should return empty array when no untracked files', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'tracked.md'), 'content');
      writeFileSync(join(TEST_DIR, '.standards', 'manifest.json'), '{}');

      const manifest = {
        fileHashes: {
          '.standards/tracked.md': { hash: 'sha256:abc', size: 7 }
        }
      };

      const untracked = scanForUntrackedFiles(TEST_DIR, manifest);

      expect(untracked).toHaveLength(0);
    });

    it('should handle missing .standards directory', () => {
      // Don't create .standards directory
      const manifest = { fileHashes: {} };

      const untracked = scanForUntrackedFiles(TEST_DIR, manifest);

      expect(untracked).toHaveLength(0);
    });
  });

  // XSPEC-343 R2. `scanDirectory` derived relative paths with
  // `fullPath.slice(basePath.length + 1)`, which silently assumed basePath had no
  // trailing separator. Three agent skill paths do carry one
  // (`.claude/skills/`, `.opencode/skill/`, `.cursor/skills/`), so every entry
  // lost its first character and the rebuilt absolute path pointed at nothing —
  // 115 files scanned, 2 hashed. `manifest.skillHashes` was therefore never
  // populated and every `uds update` re-installed all 55 skill directories.
  describe('computeDirectoryHashes — trailing separator in basePath', () => {
    const DIR = join(TEST_DIR, 'skills-root');

    beforeEach(() => {
      mkdirSync(join(DIR, 'ac-coverage'), { recursive: true });
      mkdirSync(join(DIR, 'adr-assistant'), { recursive: true });
      writeFileSync(join(DIR, 'ac-coverage', 'SKILL.md'), 'a');
      writeFileSync(join(DIR, 'adr-assistant', 'SKILL.md'), 'b');
      writeFileSync(join(DIR, '.manifest.json'), '{}');
    });

    it('produces identical results with and without a trailing separator', () => {
      const withSep = computeDirectoryHashes(`${DIR}/`, 'claude-code/project');
      const without = computeDirectoryHashes(DIR, 'claude-code/project');

      expect(Object.keys(withSep).sort()).toEqual(Object.keys(without).sort());
      expect(Object.keys(withSep)).toHaveLength(3);
    });

    it('keeps the first character of every name', () => {
      const hashes = computeDirectoryHashes(`${DIR}/`, 'claude-code/project');

      expect(hashes['claude-code/project/ac-coverage/SKILL.md']).toBeDefined();
      expect(hashes['claude-code/project/adr-assistant/SKILL.md']).toBeDefined();
      expect(hashes['claude-code/project/.manifest.json']).toBeDefined();
      // The mangled forms the old arithmetic produced.
      expect(hashes['claude-code/project/c-coverage/SKILL.md']).toBeUndefined();
      expect(hashes['claude-code/project/manifest.json']).toBeUndefined();
    });
  });

  // GitHub issue #155. `core.autocrlf=true` (the common Windows git default)
  // rewrites LF to CRLF on checkout. `.standards/*` files are stored as LF
  // blobs (confirmed in the issue with `file` on a checked-out repo), so a
  // Windows working tree — content `git status` calls clean — hashed to a
  // different value than the manifest's LF-computed hash, and every file
  // reported "modified".
  describe('CRLF normalization (GitHub issue #155)', () => {
    describe('normalizeLineEndings', () => {
      it('converts CRLF to LF', () => {
        expect(normalizeLineEndings('line1\r\nline2\r\n')).toBe('line1\nline2\n');
      });

      it('converts a lone CR to LF', () => {
        expect(normalizeLineEndings('line1\rline2')).toBe('line1\nline2');
      });

      it('leaves LF-only content unchanged', () => {
        expect(normalizeLineEndings('line1\nline2\n')).toBe('line1\nline2\n');
      });
    });

    describe('isBinaryContent', () => {
      it('treats a buffer with a NUL byte as binary', () => {
        expect(isBinaryContent(Buffer.from([0x89, 0x50, 0x4e, 0x00, 0x47]))).toBe(true);
      });

      it('treats plain text as non-binary', () => {
        expect(isBinaryContent(Buffer.from('Hello, World!\r\n', 'utf-8'))).toBe(false);
      });
    });

    describe('computeFileHash', () => {
      // Positive: same logical content, LF vs CRLF, must hash identically —
      // this is the false-positive the issue reports.
      it('hashes LF and CRLF versions of the same content identically', () => {
        const lfPath = join(TEST_DIR, 'lf.md');
        const crlfPath = join(TEST_DIR, 'crlf.md');
        const lfContent = '# Title\nline one\nline two\n';
        writeFileSync(lfPath, lfContent);
        writeFileSync(crlfPath, Buffer.from(lfContent.replace(/\n/g, '\r\n'), 'utf-8'));

        const lfHash = computeFileHash(lfPath);
        const crlfHash = computeFileHash(crlfPath);

        expect(lfHash.hash).toBe(crlfHash.hash);
        expect(lfHash.size).toBe(crlfHash.size);
      });

      // Negative control: content that is genuinely different must still hash
      // differently after normalization. Without this, an implementation that
      // always returns the same hash (e.g. hashing an empty normalized string)
      // would pass the positive test above for the wrong reason.
      it('still hashes genuinely different content differently after normalization', () => {
        const pathA = join(TEST_DIR, 'a.md');
        const pathB = join(TEST_DIR, 'b.md');
        writeFileSync(pathA, Buffer.from('line one\r\nline two\r\n', 'utf-8'));
        writeFileSync(pathB, Buffer.from('line one\r\nline THREE\r\n', 'utf-8'));

        const hashA = computeFileHash(pathA);
        const hashB = computeFileHash(pathB);

        expect(hashA.hash).not.toBe(hashB.hash);
      });

      // A real line-ending-only change is, by design, invisible to this hash
      // (see the module-level comment in hasher.js for why that is the
      // intended behavior, not a gap).
      it('does not distinguish an LF file from the same file re-saved as CRLF', () => {
        const filePath = join(TEST_DIR, 'converted.md');
        writeFileSync(filePath, 'unchanged text\nsecond line\n');
        const before = computeFileHash(filePath);

        // Simulate "someone ran dos2unix in reverse" — same text, CRLF now.
        writeFileSync(filePath, Buffer.from('unchanged text\r\nsecond line\r\n', 'utf-8'));
        const after = computeFileHash(filePath);

        expect(after.hash).toBe(before.hash);
      });

      // Binary content must never be normalized — a NUL-containing buffer's
      // \r\n bytes are data, not line endings.
      it('does not normalize binary content', () => {
        const filePath = join(TEST_DIR, 'binary.bin');
        const binaryContent = Buffer.from([0x00, 0x0d, 0x0a, 0x01, 0x0d, 0x0a]);
        writeFileSync(filePath, binaryContent);

        const result = computeFileHash(filePath);

        expect(result.size).toBe(binaryContent.length);
        expect(result.hash).toBe(`sha256:${createHash('sha256').update(binaryContent).digest('hex')}`);
      });
    });

    describe('compareFileHash', () => {
      it('reports unchanged when a manifest hash (from LF content) is compared against a CRLF checkout', () => {
        const filePath = join(TEST_DIR, 'standard.md');
        const lfContent = '# Standard\n\nSome rule.\n';

        // Simulate manifest generation on Linux/macOS: hash computed from LF.
        writeFileSync(filePath, lfContent);
        const storedInfo = computeFileHash(filePath);

        // Simulate the same file after a Windows `core.autocrlf=true` checkout.
        writeFileSync(filePath, Buffer.from(lfContent.replace(/\n/g, '\r\n'), 'utf-8'));

        expect(compareFileHash(filePath, storedInfo)).toBe('unchanged');
      });

      // Negative control: a real content change on a CRLF checkout must still
      // be reported as modified.
      it('still reports modified for a real content change on a CRLF checkout', () => {
        const filePath = join(TEST_DIR, 'standard2.md');
        const lfContent = '# Standard\n\nOriginal rule.\n';
        writeFileSync(filePath, lfContent);
        const storedInfo = computeFileHash(filePath);

        writeFileSync(filePath, Buffer.from('# Standard\r\n\r\nActually different rule.\r\n', 'utf-8'));

        expect(compareFileHash(filePath, storedInfo)).toBe('modified');
      });
    });

    describe('computeIntegrationBlockHash', () => {
      const START = '<!-- UDS:STANDARDS:START -->';
      const END = '<!-- UDS:STANDARDS:END -->';

      it('hashes the UDS block identically whether the file is LF or CRLF', () => {
        const lfPath = join(TEST_DIR, 'CLAUDE.md');
        const crlfPath = join(TEST_DIR, 'CLAUDE-crlf.md');
        const lfContent = `# Project\n\n${START}\nRule one.\nRule two.\n${END}\n\nCustom section.\n`;
        writeFileSync(lfPath, lfContent);
        writeFileSync(crlfPath, Buffer.from(lfContent.replace(/\n/g, '\r\n'), 'utf-8'));

        const lfResult = computeIntegrationBlockHash(lfPath);
        const crlfResult = computeIntegrationBlockHash(crlfPath);

        expect(lfResult).not.toBeNull();
        expect(lfResult.blockHash).toBe(crlfResult.blockHash);
        expect(lfResult.blockSize).toBe(crlfResult.blockSize);
        expect(lfResult.fullHash).toBe(crlfResult.fullHash);
        expect(lfResult.fullSize).toBe(crlfResult.fullSize);
      });

      // Negative control: a real change inside the block must still change
      // the block hash after normalization.
      it('still detects a real change inside the UDS block', () => {
        const pathA = join(TEST_DIR, 'CLAUDE-a.md');
        const pathB = join(TEST_DIR, 'CLAUDE-b.md');
        writeFileSync(pathA, Buffer.from(`${START}\r\nRule one.\r\n${END}\r\n`, 'utf-8'));
        writeFileSync(pathB, Buffer.from(`${START}\r\nRule ONE CHANGED.\r\n${END}\r\n`, 'utf-8'));

        const resultA = computeIntegrationBlockHash(pathA);
        const resultB = computeIntegrationBlockHash(pathB);

        expect(resultA.blockHash).not.toBe(resultB.blockHash);
      });
    });
  });
});
