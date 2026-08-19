// [Source: specs/superspec-borrowing-phase1-2-spec.md]
// [Generated] TDD tests for spec-linter — AC-11, AC-12, AC-13
//
// XSPEC-383 R5 (Option E): the `checkACCoverage` test block was removed along
// with the function itself. See spec-linter.js's module docstring for why —
// short version: it always reported 0% coverage against real specs, for two
// independent reasons unrelated to whether coverage actually existed.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
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

describe('XSPEC-005 AC-11~13: Spec Linter', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'spec-lint-'));
    mkdirSync(join(tempDir, 'specs'), { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
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

      // Act
      const result = lintAll(tempDir);

      // Assert
      expect(result.results).toHaveLength(2);
      expect(result.summary).toHaveProperty('pass');
      expect(result.summary).toHaveProperty('warn');
      expect(result.summary).toHaveProperty('fail');
      expect(result.specsDirExists).toBe(true);
    });

    it('should include spec id, status, deps, and size per spec', () => {
      // Arrange
      writeSpec(tempDir, 'SPEC-001', { acCount: 2, dependsOn: [], lines: 100 });

      // Act
      const result = lintAll(tempDir);
      const specResult = result.results[0];

      // Assert
      expect(specResult).toHaveProperty('spec');
      expect(specResult).toHaveProperty('status');
      expect(specResult).toHaveProperty('deps');
      expect(specResult).toHaveProperty('size');
      expect(specResult.deps).toHaveProperty('valid');
      expect(specResult.deps).toHaveProperty('broken');
      expect(specResult.size).toHaveProperty('effectiveLines');
      expect(specResult.size).toHaveProperty('status');
    });

    it('should report specsDirExists: false and not silently return an empty pass when specs/ is missing', () => {
      // Arrange — remove the specs/ dir the beforeEach created
      rmSync(join(tempDir, 'specs'), { recursive: true, force: true });

      // Act
      const result = lintAll(tempDir);

      // Assert
      expect(result.specsDirExists).toBe(false);
      expect(result.results).toHaveLength(0);
      expect(result.summary).toEqual({ pass: 0, warn: 0, fail: 0 });
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

      // Act
      const result = lintAll(tempDir);

      // Assert
      expect(result.summary.fail).toBe(0);
    });
  });
});
