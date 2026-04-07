// [Source: specs/superspec-borrowing-phase1-2-spec.md]
// [Generated] TDD tests for validateSpecSize() — AC-1, AC-2

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { StandardValidator } from '../../../src/utils/standard-validator.js';

/**
 * Helper: generate a spec file with controlled effective lines.
 * Can include YAML frontmatter and fenced code blocks to test exclusion.
 */
function generateSpec({ effectiveLines = 100, frontmatterLines = 5, codeBlockLines = 0 }) {
  const lines = [];

  // YAML frontmatter (should be excluded)
  if (frontmatterLines > 0) {
    lines.push('---');
    for (let i = 0; i < frontmatterLines; i++) {
      lines.push(`key${i}: value${i}`);
    }
    lines.push('---');
  }

  // Fenced code blocks (should be excluded)
  if (codeBlockLines > 0) {
    lines.push('```javascript');
    for (let i = 0; i < codeBlockLines; i++) {
      lines.push(`const x${i} = ${i};`);
    }
    lines.push('```');
  }

  // Effective content lines
  for (let i = 0; i < effectiveLines; i++) {
    lines.push(`This is effective line ${i + 1}`);
  }

  return lines.join('\n');
}

describe('XSPEC-005 AC-1+AC-2: validateSpecSize()', () => {
  let tempDir;
  let validator;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'spec-size-'));
    mkdirSync(join(tempDir, 'specs'), { recursive: true });
    validator = new StandardValidator(tempDir);
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  // ─── AC-1: Basic scanning and reporting ───

  describe('AC-1: validates spec file and returns effectiveLines + status', () => {
    it('should return effectiveLines count and status for a spec file', () => {
      // Arrange
      const specPath = join(tempDir, 'specs', 'SPEC-001-test.md');
      writeFileSync(specPath, generateSpec({ effectiveLines: 150 }));

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert
      expect(result).toHaveProperty('effectiveLines');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
      expect(result.effectiveLines).toBe(150);
      expect(result.status).toBe('pass');
    });
  });

  // ─── AC-2: Threshold classification ───

  describe('AC-2: size thresholds classify pass, warning, and fail', () => {
    it('should return "pass" for specs ≤ 300 effective lines', () => {
      // Arrange
      const specPath = join(tempDir, 'specs', 'SPEC-small.md');
      writeFileSync(specPath, generateSpec({ effectiveLines: 250 }));

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert
      expect(result.status).toBe('pass');
      expect(result.effectiveLines).toBe(250);
    });

    it('should return "pass" for specs at exactly 300 lines (boundary)', () => {
      // Arrange
      const specPath = join(tempDir, 'specs', 'SPEC-boundary.md');
      writeFileSync(specPath, generateSpec({ effectiveLines: 300 }));

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert
      expect(result.status).toBe('pass');
      expect(result.effectiveLines).toBe(300);
    });

    it('should return "warn" for specs between 301-400 effective lines', () => {
      // Arrange
      const specPath = join(tempDir, 'specs', 'SPEC-medium.md');
      writeFileSync(specPath, generateSpec({ effectiveLines: 350 }));

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert
      expect(result.status).toBe('warn');
      expect(result.effectiveLines).toBe(350);
    });

    it('should return "warn" for specs at exactly 400 lines (hard cap boundary)', () => {
      // Arrange
      const specPath = join(tempDir, 'specs', 'SPEC-cap-boundary.md');
      writeFileSync(specPath, generateSpec({ effectiveLines: 400 }));

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert
      expect(result.status).toBe('warn');
      expect(result.effectiveLines).toBe(400);
    });

    it('should return "fail" for specs > 400 effective lines', () => {
      // Arrange
      const specPath = join(tempDir, 'specs', 'SPEC-large.md');
      writeFileSync(specPath, generateSpec({ effectiveLines: 450 }));

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert
      expect(result.status).toBe('fail');
      expect(result.effectiveLines).toBe(450);
    });

    it('should return "fail" for specs at exactly 401 lines', () => {
      // Arrange
      const specPath = join(tempDir, 'specs', 'SPEC-just-over.md');
      writeFileSync(specPath, generateSpec({ effectiveLines: 401 }));

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert
      expect(result.status).toBe('fail');
      expect(result.effectiveLines).toBe(401);
    });
  });

  // ─── AC-2: Exclusion of frontmatter and code blocks ───

  describe('AC-2: excludes YAML frontmatter and fenced code blocks', () => {
    it('should exclude YAML frontmatter from effective line count', () => {
      // Arrange — 100 effective + 5 frontmatter + 2 delimiters = 107 total
      const specPath = join(tempDir, 'specs', 'SPEC-frontmatter.md');
      writeFileSync(specPath, generateSpec({
        effectiveLines: 100,
        frontmatterLines: 5,
      }));

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert — only 100 effective lines counted
      expect(result.effectiveLines).toBe(100);
    });

    it('should exclude fenced code blocks from effective line count', () => {
      // Arrange — 100 effective + 10 code block + 2 delimiters = 112 total
      const specPath = join(tempDir, 'specs', 'SPEC-codeblock.md');
      writeFileSync(specPath, generateSpec({
        effectiveLines: 100,
        frontmatterLines: 0,
        codeBlockLines: 10,
      }));

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert — only 100 effective lines counted
      expect(result.effectiveLines).toBe(100);
    });

    it('should exclude both frontmatter and code blocks simultaneously', () => {
      // Arrange — 200 effective + 5 frontmatter + 20 code = many total lines
      const specPath = join(tempDir, 'specs', 'SPEC-both.md');
      writeFileSync(specPath, generateSpec({
        effectiveLines: 200,
        frontmatterLines: 5,
        codeBlockLines: 20,
      }));

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert — only 200 effective lines counted
      expect(result.effectiveLines).toBe(200);
    });

    it('should correctly classify a spec that looks large but has many excluded lines', () => {
      // Arrange — 250 effective + 200 code block lines → total > 400 but effective ≤ 300
      const specPath = join(tempDir, 'specs', 'SPEC-deceptive.md');
      writeFileSync(specPath, generateSpec({
        effectiveLines: 250,
        frontmatterLines: 10,
        codeBlockLines: 200,
      }));

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert — should be "pass" based on 250 effective lines
      expect(result.status).toBe('pass');
      expect(result.effectiveLines).toBe(250);
    });
  });

  // ─── Custom thresholds ───

  describe('AC-2: respects custom threshold options', () => {
    it('should use custom targetLines and hardCapLines', () => {
      // Arrange
      const specPath = join(tempDir, 'specs', 'SPEC-custom.md');
      writeFileSync(specPath, generateSpec({ effectiveLines: 150 }));

      // Act — custom thresholds: target=100, hard_cap=200
      const result = validator.validateSpecSize(specPath, {
        targetLines: 100,
        hardCapLines: 200,
      });

      // Assert — 150 > 100 target → warn
      expect(result.status).toBe('warn');
    });

    it('should default to targetLines=300 and hardCapLines=400', () => {
      // Arrange
      const specPath = join(tempDir, 'specs', 'SPEC-defaults.md');
      writeFileSync(specPath, generateSpec({ effectiveLines: 350 }));

      // Act — no options
      const result = validator.validateSpecSize(specPath);

      // Assert — 350 > 300 → warn (not fail, since < 400)
      expect(result.status).toBe('warn');
    });
  });

  // ─── Edge cases ───

  describe('edge cases', () => {
    it('should handle empty spec file', () => {
      // Arrange
      const specPath = join(tempDir, 'specs', 'SPEC-empty.md');
      writeFileSync(specPath, '');

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert
      expect(result.effectiveLines).toBe(0);
      expect(result.status).toBe('pass');
    });

    it('should handle spec with only frontmatter', () => {
      // Arrange
      const specPath = join(tempDir, 'specs', 'SPEC-only-fm.md');
      writeFileSync(specPath, '---\ntitle: Test\nstatus: Draft\n---\n');

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert — 0 effective lines (only a trailing empty line)
      expect(result.effectiveLines).toBeLessThanOrEqual(1);
      expect(result.status).toBe('pass');
    });

    it('should handle multiple fenced code blocks', () => {
      // Arrange
      const lines = [
        '# Title',
        '```js',
        'const a = 1;',
        '```',
        'Some text between blocks',
        '```python',
        'x = 2',
        'y = 3',
        '```',
        'More text after',
      ];
      const specPath = join(tempDir, 'specs', 'SPEC-multi-code.md');
      writeFileSync(specPath, lines.join('\n'));

      // Act
      const result = validator.validateSpecSize(specPath);

      // Assert — effective: "# Title", "Some text between blocks", "More text after" = 3
      expect(result.effectiveLines).toBe(3);
    });
  });
});
