// [Source: docs/specs/SPEC-TELEMETRY-001-hook-telemetry.md]
// TDD tests for telemetry-wrapper.js
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { recordTelemetry, TELEMETRY_FILE } from '../../../../scripts/hooks/telemetry-wrapper.js';

describe('SPEC-TELEMETRY-001 / REQ-1: Telemetry Wrapper', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-telemetry-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    mkdirSync(join(testDir, '.standards'), { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('AC-1: 記錄成功的 hook 執行', () => {
    it('should record result "pass" for exit code 0', () => {
      // Act
      recordTelemetry(testDir, {
        standard_id: 'commit-message',
        hook_type: 'UserPromptSubmit',
        exitCode: 0,
        duration_ms: 85,
      });

      // Assert
      const telPath = join(testDir, TELEMETRY_FILE);
      expect(existsSync(telPath)).toBe(true);
      const lines = readFileSync(telPath, 'utf-8').trim().split('\n');
      const record = JSON.parse(lines[0]);
      expect(record.result).toBe('pass');
    });
  });

  describe('AC-1: 記錄失敗的 hook 執行', () => {
    it('should record result "fail" for exit code 1', () => {
      recordTelemetry(testDir, {
        standard_id: 'security-standards',
        hook_type: 'PreToolUse',
        exitCode: 1,
        duration_ms: 42,
      });

      const telPath = join(testDir, TELEMETRY_FILE);
      const lines = readFileSync(telPath, 'utf-8').trim().split('\n');
      const record = JSON.parse(lines[0]);
      expect(record.result).toBe('fail');
    });
  });

  describe('AC-1: 記錄執行耗時', () => {
    it('should include duration_ms in record', () => {
      recordTelemetry(testDir, {
        standard_id: 'logging',
        hook_type: 'PostToolUse',
        exitCode: 0,
        duration_ms: 120,
      });

      const telPath = join(testDir, TELEMETRY_FILE);
      const lines = readFileSync(telPath, 'utf-8').trim().split('\n');
      const record = JSON.parse(lines[0]);
      expect(record.duration_ms).toBe(120);
    });
  });

  describe('AC-1: 遙測記錄包含必要欄位', () => {
    it('should contain timestamp, standard_id, hook_type, result, duration_ms', () => {
      recordTelemetry(testDir, {
        standard_id: 'commit-message',
        hook_type: 'UserPromptSubmit',
        exitCode: 0,
        duration_ms: 50,
      });

      const telPath = join(testDir, TELEMETRY_FILE);
      const lines = readFileSync(telPath, 'utf-8').trim().split('\n');
      const record = JSON.parse(lines[0]);

      expect(record.timestamp).toBeDefined();
      expect(record.standard_id).toBe('commit-message');
      expect(record.hook_type).toBe('UserPromptSubmit');
      expect(record.result).toBe('pass');
      expect(record.duration_ms).toBe(50);
    });
  });

  describe('AC-5: Rotation — 檔案超過大小限制', () => {
    it('should truncate file when exceeding 2MB', () => {
      // Arrange — create a large telemetry file (> 2MB)
      const telPath = join(testDir, TELEMETRY_FILE);
      const bigLine = JSON.stringify({
        timestamp: '2026-01-01T00:00:00Z',
        standard_id: 'test',
        hook_type: 'PreToolUse',
        result: 'pass',
        duration_ms: 10,
        _pad: 'x'.repeat(200),
      }) + '\n';
      // Write ~2.5MB of data
      const lines = bigLine.repeat(Math.ceil(2.5 * 1024 * 1024 / bigLine.length));
      writeFileSync(telPath, lines);

      // Act
      recordTelemetry(testDir, {
        standard_id: 'commit-message',
        hook_type: 'UserPromptSubmit',
        exitCode: 0,
        duration_ms: 10,
      });

      // Assert — file should be smaller now
      const content = readFileSync(telPath, 'utf-8');
      expect(content.length).toBeLessThan(2.5 * 1024 * 1024);
    });
  });
});
