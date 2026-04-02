/**
 * TDD tests for SPEC-E2E-001 REQ-5: 覆蓋差距分析
 * Source: docs/specs/skills/SPEC-E2E-001-e2e-skill.md
 * AC Coverage: AC-16, AC-17
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import { analyzeCoverageGap } from '../../../src/utils/e2e-analyzer.js';

describe('SPEC-E2E-001: /e2e Skill', () => {
  let testDir;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'e2e-coverage-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('REQ-5: 覆蓋差距分析', () => {
    // AC-16: /e2e --analyze 輸出覆蓋差距報告
    describe('AC-16: 掃描覆蓋差距', () => {
      it('should report covered and total feature count', () => {
        // Arrange
        const featuresDir = join(testDir, 'tests', 'features');
        const e2eDir = join(testDir, 'tests', 'e2e');
        mkdirSync(featuresDir, { recursive: true });
        mkdirSync(e2eDir, { recursive: true });

        writeFileSync(join(featuresDir, 'SPEC-A.feature'), 'Feature: A\n');
        writeFileSync(join(featuresDir, 'SPEC-B.feature'), 'Feature: B\n');
        writeFileSync(join(featuresDir, 'SPEC-C.feature'), 'Feature: C\n');
        writeFileSync(join(e2eDir, 'SPEC-A.e2e.test.js'), 'test A');

        // Act
        const report = analyzeCoverageGap(featuresDir, e2eDir);

        // Assert
        expect(report.total).toBe(3);
        expect(report.covered).toBe(1);
      });

      it('should list features missing E2E coverage', () => {
        // Arrange
        const featuresDir = join(testDir, 'tests', 'features');
        const e2eDir = join(testDir, 'tests', 'e2e');
        mkdirSync(featuresDir, { recursive: true });
        mkdirSync(e2eDir, { recursive: true });

        writeFileSync(join(featuresDir, 'SPEC-A.feature'), 'Feature: A\n');
        writeFileSync(join(featuresDir, 'SPEC-B.feature'), 'Feature: B\n');
        writeFileSync(join(e2eDir, 'SPEC-A.e2e.test.js'), 'test A');

        // Act
        const report = analyzeCoverageGap(featuresDir, e2eDir);

        // Assert
        expect(report.missing).toContain('SPEC-B.feature');
        expect(report.missing).not.toContain('SPEC-A.feature');
      });

      it('should handle empty directories gracefully', () => {
        // Arrange
        const featuresDir = join(testDir, 'tests', 'features');
        const e2eDir = join(testDir, 'tests', 'e2e');
        mkdirSync(featuresDir, { recursive: true });
        mkdirSync(e2eDir, { recursive: true });

        // Act
        const report = analyzeCoverageGap(featuresDir, e2eDir);

        // Assert
        expect(report.total).toBe(0);
        expect(report.covered).toBe(0);
        expect(report.missing).toHaveLength(0);
      });
    });

    // AC-17: 建議與 /ac-coverage-assistant 整合
    describe('AC-17: 與 ac-coverage-assistant 整合', () => {
      it('should include suggestion for /ac-coverage-assistant in report', () => {
        // Arrange
        const featuresDir = join(testDir, 'tests', 'features');
        const e2eDir = join(testDir, 'tests', 'e2e');
        mkdirSync(featuresDir, { recursive: true });
        mkdirSync(e2eDir, { recursive: true });

        writeFileSync(join(featuresDir, 'SPEC-A.feature'), 'Feature: A\n');

        // Act
        const report = analyzeCoverageGap(featuresDir, e2eDir);

        // Assert
        expect(report.suggestions).toBeDefined();
        expect(report.suggestions.some(s => s.includes('/ac-coverage-assistant'))).toBe(true);
      });
    });
  });
});
