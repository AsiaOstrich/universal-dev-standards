// [Source: docs/specs/SPEC-HOOKS-001-core-standard-hooks.md]
// [Generated] TDD skeleton for hook-stats.js extension (hook_type field)
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { appendHookStat, shouldRecordStats } from '../../../src/utils/hook-stats.js';

describe('SPEC-HOOKS-001 / REQ-6: Hook 統計記錄擴展', () => {
  // [Source: SPEC-HOOKS-001:AC-4]

  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-hookstats-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    // Enable hook stats
    const udsDir = join(testDir, '.uds');
    mkdirSync(udsDir, { recursive: true });
    writeFileSync(
      join(udsDir, 'config.json'),
      JSON.stringify({ hookStats: true })
    );
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('AC-4: hook_type 欄位記錄', () => {
    it('should record hook_type "commit-msg" in stat entry', () => {
      // Arrange
      const entry = {
        matched_standards: ['commit-message.ai.yaml'],
        matched_count: 1,
        total_available: 78,
        hook_type: 'commit-msg',
      };

      // Act
      appendHookStat(testDir, entry);

      // Assert
      const statsPath = join(testDir, '.uds', 'hook-stats.jsonl');
      if (existsSync(statsPath)) {
        const lines = readFileSync(statsPath, 'utf-8').trim().split('\n');
        const lastEntry = JSON.parse(lines[lines.length - 1]);
        expect(lastEntry.hook_type).toBe('commit-msg');
      }
    });

    it('should record hook_type "security" in stat entry', () => {
      // Arrange
      const entry = {
        matched_standards: ['security-standards.ai.yaml'],
        matched_count: 1,
        total_available: 78,
        hook_type: 'security',
      };

      // Act
      appendHookStat(testDir, entry);

      // Assert
      const statsPath = join(testDir, '.uds', 'hook-stats.jsonl');
      if (existsSync(statsPath)) {
        const lines = readFileSync(statsPath, 'utf-8').trim().split('\n');
        const lastEntry = JSON.parse(lines[lines.length - 1]);
        expect(lastEntry.hook_type).toBe('security');
      }
    });

    it('should record hook_type "logging" in stat entry', () => {
      // Arrange
      const entry = {
        matched_standards: ['logging.ai.yaml'],
        matched_count: 1,
        total_available: 78,
        hook_type: 'logging',
      };

      // Act
      appendHookStat(testDir, entry);

      // Assert
      const statsPath = join(testDir, '.uds', 'hook-stats.jsonl');
      if (existsSync(statsPath)) {
        const lines = readFileSync(statsPath, 'utf-8').trim().split('\n');
        const lastEntry = JSON.parse(lines[lines.length - 1]);
        expect(lastEntry.hook_type).toBe('logging');
      }
    });
  });
});
