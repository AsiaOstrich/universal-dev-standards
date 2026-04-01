// [Source: docs/specs/SPEC-TELEMETRY-001-hook-telemetry.md]
// TDD tests for report.js command
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { generateReport } from '../../../src/commands/report.js';

describe('SPEC-TELEMETRY-001 / REQ-2: Report 命令', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-report-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('AC-2: 產出採用率報告', () => {
    it('should return report with execution count, pass rate, avg duration', () => {
      // Arrange
      const stdDir = join(testDir, '.standards');
      mkdirSync(stdDir, { recursive: true });
      const records = [
        { timestamp: '2026-04-01T10:00:00Z', standard_id: 'commit-message', hook_type: 'UserPromptSubmit', result: 'pass', duration_ms: 80 },
        { timestamp: '2026-04-01T10:01:00Z', standard_id: 'commit-message', hook_type: 'UserPromptSubmit', result: 'pass', duration_ms: 90 },
        { timestamp: '2026-04-01T10:02:00Z', standard_id: 'commit-message', hook_type: 'UserPromptSubmit', result: 'fail', duration_ms: 100 },
        { timestamp: '2026-04-01T10:03:00Z', standard_id: 'security-standards', hook_type: 'PreToolUse', result: 'pass', duration_ms: 40 },
      ];
      writeFileSync(
        join(stdDir, 'telemetry.jsonl'),
        records.map((r) => JSON.stringify(r)).join('\n') + '\n'
      );

      // Act
      const report = generateReport(testDir);

      // Assert
      expect(report.success).toBe(true);
      expect(report.totalExecutions).toBe(4);
      expect(report.standards).toHaveLength(2);

      const commitMsg = report.standards.find((s) => s.id === 'commit-message');
      expect(commitMsg.executions).toBe(3);
      expect(commitMsg.passRate).toBeCloseTo(66.67, 0);
      expect(commitMsg.avgDuration).toBe(90);

      const security = report.standards.find((s) => s.id === 'security-standards');
      expect(security.executions).toBe(1);
      expect(security.passRate).toBe(100);
    });
  });

  describe('AC-2: 無遙測數據', () => {
    it('should return no-data message when telemetry.jsonl missing', () => {
      const report = generateReport(testDir);

      expect(report.success).toBe(true);
      expect(report.totalExecutions).toBe(0);
      expect(report.noData).toBe(true);
    });
  });
});
