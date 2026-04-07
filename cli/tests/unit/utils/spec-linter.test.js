// [Source: specs/superspec-borrowing-phase1-2-spec.md]
// [Generated] TDD tests for spec-linter — AC-11, AC-12, AC-13

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  checkACCoverage,
  checkDependencies,
  checkSpecSize,
  lintAll,
} from '../../../src/utils/spec-linter.js';

/**
 * Helper: write a spec file
 */
function writeSpec(dir, id, { acCount = 2, dependsOn = [], lines = 100 } = {}) {
  const acs = Array.from({ length: acCount }, (_, i) => `- [ ] AC-${i + 1}: Criterion ${i + 1}`);
  const deps = dependsOn.length > 0 ? dependsOn.join(', ') : 'none';
  const content = [
    `## Micro-Spec: ${id}`,
    '',
    `**Status**: draft`,
    `**Created**: 2026-04-07`,
    `**Type**: feature`,
    `**Spec Mode**: standard`,
    `**Depends On**: ${deps}`,
    '',
    `**Intent**: Test`,
    '',
    `**Scope**: general`,
    '',
    '**Acceptance**:',
    ...acs,
    '',
    '**Confirmed**: No',
    '',
    // Pad to desired effective lines
    ...Array.from({ length: Math.max(0, lines - 15 - acCount) }, (_, i) => `Line ${i}`),
  ].join('\n');

  writeFileSync(join(dir, 'specs', `${id}.md`), content);
}

/**
 * Helper: write a test file with @AC-N tags
 */
function writeTestFile(dir, filename, specId, coveredACs = []) {
  const lines = coveredACs.map(ac => `// @${specId} @AC-${ac}`);
  lines.push('describe("test", () => { it("works", () => {}) });');
  mkdirSync(join(dir, 'tests'), { recursive: true });
  writeFileSync(join(dir, 'tests', filename), lines.join('\n'));
}

describe('XSPEC-005 AC-11~13: Spec Linter', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'spec-lint-'));
    mkdirSync(join(tempDir, 'specs'), { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  // ─── AC-11: checkACCoverage ───

  describe('AC-11: checkACCoverage', () => {
    it('should return full coverage when all ACs have matching test tags', () => {
      // Arrange
      writeSpec(tempDir, 'SPEC-001', { acCount: 3 });
      writeTestFile(tempDir, 'spec001.test.js', 'SPEC-001', [1, 2, 3]);

      // Act
      const result = checkACCoverage('SPEC-001', ['AC-1', 'AC-2', 'AC-3'], tempDir);

      // Assert
      expect(result.covered).toEqual(['AC-1', 'AC-2', 'AC-3']);
      expect(result.orphans).toEqual([]);
      expect(result.coverage).toBe(1.0);
    });

    it('should detect orphan ACs without test coverage', () => {
      // Arrange
      writeSpec(tempDir, 'SPEC-002', { acCount: 3 });
      writeTestFile(tempDir, 'spec002.test.js', 'SPEC-002', [1]); // only AC-1 covered

      // Act
      const result = checkACCoverage('SPEC-002', ['AC-1', 'AC-2', 'AC-3'], tempDir);

      // Assert
      expect(result.covered).toEqual(['AC-1']);
      expect(result.orphans).toEqual(['AC-2', 'AC-3']);
      expect(result.coverage).toBeCloseTo(1 / 3);
    });

    it('should return zero coverage when no tests exist', () => {
      // Arrange — no test files

      // Act
      const result = checkACCoverage('SPEC-003', ['AC-1', 'AC-2'], tempDir);

      // Assert
      expect(result.covered).toEqual([]);
      expect(result.orphans).toEqual(['AC-1', 'AC-2']);
      expect(result.coverage).toBe(0);
    });
  });

  // ─── AC-11: checkDependencies ───

  describe('AC-11: checkDependencies', () => {
    it('should validate all dependencies exist', () => {
      // Arrange
      const specs = [
        { id: 'SPEC-001', dependsOn: ['SPEC-002'] },
        { id: 'SPEC-002', dependsOn: [] },
      ];

      // Act
      const result = checkDependencies(specs);

      // Assert
      expect(result.valid).toHaveLength(1);
      expect(result.broken).toHaveLength(0);
    });

    it('should detect broken dependency references', () => {
      // Arrange
      const specs = [
        { id: 'SPEC-001', dependsOn: ['SPEC-099'] },
        { id: 'SPEC-002', dependsOn: [] },
      ];

      // Act
      const result = checkDependencies(specs);

      // Assert
      expect(result.broken).toHaveLength(1);
      expect(result.broken[0]).toEqual({ spec: 'SPEC-001', target: 'SPEC-099' });
    });

    it('should handle specs with no dependencies', () => {
      // Arrange
      const specs = [
        { id: 'SPEC-001', dependsOn: [] },
      ];

      // Act
      const result = checkDependencies(specs);

      // Assert
      expect(result.valid).toHaveLength(0);
      expect(result.broken).toHaveLength(0);
    });
  });

  // ─── AC-11: checkSpecSize (delegates to validateSpecSize) ───

  describe('AC-11: checkSpecSize', () => {
    it('should return effectiveLines and status', () => {
      // Arrange
      writeSpec(tempDir, 'SPEC-001', { lines: 250 });
      const specPath = join(tempDir, 'specs', 'SPEC-001.md');

      // Act
      const result = checkSpecSize(specPath);

      // Assert
      expect(result).toHaveProperty('effectiveLines');
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('pass');
    });
  });

  // ─── AC-11+12+13: lintAll ───

  describe('AC-11: lintAll integrates all checks', () => {
    it('should return results for each spec in the directory', () => {
      // Arrange
      writeSpec(tempDir, 'SPEC-001', { acCount: 2, dependsOn: [], lines: 100 });
      writeSpec(tempDir, 'SPEC-002', { acCount: 3, dependsOn: ['SPEC-001'], lines: 350 });
      writeTestFile(tempDir, 'spec001.test.js', 'SPEC-001', [1, 2]);

      // Act
      const result = lintAll(tempDir);

      // Assert
      expect(result.results).toHaveLength(2);
      expect(result.summary).toHaveProperty('pass');
      expect(result.summary).toHaveProperty('warn');
      expect(result.summary).toHaveProperty('fail');
    });

    it('should include acCoverage, deps, and size per spec', () => {
      // Arrange
      writeSpec(tempDir, 'SPEC-001', { acCount: 2, dependsOn: [], lines: 100 });
      writeTestFile(tempDir, 'spec001.test.js', 'SPEC-001', [1, 2]);

      // Act
      const result = lintAll(tempDir);
      const specResult = result.results[0];

      // Assert
      expect(specResult).toHaveProperty('spec');
      expect(specResult).toHaveProperty('acCoverage');
      expect(specResult).toHaveProperty('deps');
      expect(specResult).toHaveProperty('size');
      expect(specResult.acCoverage).toHaveProperty('coverage');
      expect(specResult.deps).toHaveProperty('valid');
      expect(specResult.deps).toHaveProperty('broken');
      expect(specResult.size).toHaveProperty('effectiveLines');
      expect(specResult.size).toHaveProperty('status');
    });
  });

  // ─── AC-12: JSON-compatible output ───

  describe('AC-12: lintAll returns JSON-serializable results', () => {
    it('should produce valid JSON when stringified', () => {
      // Arrange
      writeSpec(tempDir, 'SPEC-001', { acCount: 2 });

      // Act
      const result = lintAll(tempDir);
      const json = JSON.stringify(result);

      // Assert
      expect(() => JSON.parse(json)).not.toThrow();
      const parsed = JSON.parse(json);
      expect(parsed.results).toBeInstanceOf(Array);
      expect(parsed.summary).toHaveProperty('pass');
    });
  });

  // ─── AC-13: fail detection for CI ───

  describe('AC-13: lintAll detects failures for CI exit code', () => {
    it('should count fail when spec has broken dependency', () => {
      // Arrange
      writeSpec(tempDir, 'SPEC-001', { acCount: 2, dependsOn: ['SPEC-099'] });

      // Act
      const result = lintAll(tempDir);

      // Assert
      expect(result.summary.fail).toBeGreaterThanOrEqual(1);
    });

    it('should count fail when spec exceeds hard cap', () => {
      // Arrange
      writeSpec(tempDir, 'SPEC-001', { acCount: 2, lines: 450 });

      // Act
      const result = lintAll(tempDir);

      // Assert
      expect(result.summary.fail).toBeGreaterThanOrEqual(1);
    });

    it('should have zero failures for a healthy spec', () => {
      // Arrange
      writeSpec(tempDir, 'SPEC-001', { acCount: 2, dependsOn: [], lines: 100 });
      writeTestFile(tempDir, 'spec001.test.js', 'SPEC-001', [1, 2]);

      // Act
      const result = lintAll(tempDir);

      // Assert
      expect(result.summary.fail).toBe(0);
    });
  });
});
