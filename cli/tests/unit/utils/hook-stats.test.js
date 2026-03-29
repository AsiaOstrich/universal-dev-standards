/**
 * TDD tests for hook-stats.js
 * [Source: SPEC-SELFDIAG-001 REQ-7]
 *
 * Covers: AC-9, AC-10, AC-11
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/hook-stats-test');

describe('HookStats', () => {
  let appendHookStat, analyzeHookStats, shouldRecordStats;

  beforeEach(async () => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });

    const mod = await import('../../../src/utils/hook-stats.js');
    appendHookStat = mod.appendHookStat;
    analyzeHookStats = mod.analyzeHookStats;
    shouldRecordStats = mod.shouldRecordStats;
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  // ========================================
  // AC-9: Record trigger statistics
  // ========================================

  describe('appendHookStat()', () => {
    it('should create .uds/ directory and append JSONL entry', () => {
      // Arrange
      const entry = {
        matched_standards: ['testing', 'commit-message'],
        matched_count: 2,
        total_available: 53
      };

      // Act
      appendHookStat(TEST_DIR, entry);

      // Assert
      const statsFile = join(TEST_DIR, '.uds', 'hook-stats.jsonl');
      expect(existsSync(statsFile)).toBe(true);
      const content = readFileSync(statsFile, 'utf-8').trim();
      const parsed = JSON.parse(content);
      expect(parsed.matched_count).toBe(2);
      expect(parsed.matched_standards).toEqual(['testing', 'commit-message']);
      expect(parsed.timestamp).toBeDefined();
    });

    it('should append multiple entries as separate lines', () => {
      const entry1 = { matched_standards: ['testing'], matched_count: 1, total_available: 53 };
      const entry2 = { matched_standards: ['git-workflow'], matched_count: 1, total_available: 53 };

      appendHookStat(TEST_DIR, entry1);
      appendHookStat(TEST_DIR, entry2);

      const statsFile = join(TEST_DIR, '.uds', 'hook-stats.jsonl');
      const lines = readFileSync(statsFile, 'utf-8').trim().split('\n');
      expect(lines.length).toBe(2);
    });

    it('should NOT include full prompt content or file paths', () => {
      const entry = {
        matched_standards: ['testing'],
        matched_count: 1,
        total_available: 53,
        prompt_length: 150
      };

      appendHookStat(TEST_DIR, entry);

      const statsFile = join(TEST_DIR, '.uds', 'hook-stats.jsonl');
      const content = readFileSync(statsFile, 'utf-8');
      const parsed = JSON.parse(content.trim());
      // Should have prompt_length but NOT prompt_content or file paths
      expect(parsed.prompt_length).toBe(150);
      expect(parsed.prompt_content).toBeUndefined();
      expect(parsed.file_paths).toBeUndefined();
    });
  });

  // ========================================
  // AC-9: Opt-out
  // ========================================

  describe('shouldRecordStats()', () => {
    it('should return false by default (no config, opt-in required)', () => {
      expect(shouldRecordStats(TEST_DIR)).toBe(false);
    });

    it('should return false when config has hookStats: false', () => {
      mkdirSync(join(TEST_DIR, '.uds'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.uds', 'config.json'),
        JSON.stringify({ hookStats: false })
      );
      expect(shouldRecordStats(TEST_DIR)).toBe(false);
    });

    it('should return true when config has hookStats: true (opt-in)', () => {
      mkdirSync(join(TEST_DIR, '.uds'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.uds', 'config.json'),
        JSON.stringify({ hookStats: true })
      );
      expect(shouldRecordStats(TEST_DIR)).toBe(true);
    });

    it('should return false when config is invalid JSON', () => {
      mkdirSync(join(TEST_DIR, '.uds'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.uds', 'config.json'), 'not json');
      expect(shouldRecordStats(TEST_DIR)).toBe(false);
    });
  });

  // ========================================
  // AC-10: Write failure does not break hook
  // ========================================

  describe('appendHookStat() error resilience', () => {
    it('should not throw when directory is read-only', () => {
      // We test by passing an invalid path — the function should silently fail
      expect(() => {
        appendHookStat('/nonexistent/readonly/path', {
          matched_standards: ['testing'],
          matched_count: 1,
          total_available: 53
        });
      }).not.toThrow();
    });
  });

  // ========================================
  // AC-11: Analyze trigger blind spots
  // ========================================

  describe('analyzeHookStats()', () => {
    it('should return empty analysis when no stats file exists', () => {
      const analysis = analyzeHookStats(TEST_DIR);
      expect(analysis.total_triggers).toBe(0);
      expect(analysis.top_standards).toEqual([]);
      expect(analysis.never_matched).toEqual([]);
    });

    it('should count total triggers', () => {
      // Arrange: create stats file with entries
      mkdirSync(join(TEST_DIR, '.uds'), { recursive: true });
      const entries = [
        { timestamp: '2026-03-29T01:00:00Z', matched_standards: ['testing'], matched_count: 1, total_available: 3 },
        { timestamp: '2026-03-29T02:00:00Z', matched_standards: ['testing', 'commit-message'], matched_count: 2, total_available: 3 },
        { timestamp: '2026-03-29T03:00:00Z', matched_standards: [], matched_count: 0, total_available: 3 },
      ];
      writeFileSync(
        join(TEST_DIR, '.uds', 'hook-stats.jsonl'),
        entries.map(e => JSON.stringify(e)).join('\n')
      );

      // Act
      const analysis = analyzeHookStats(TEST_DIR);

      // Assert
      expect(analysis.total_triggers).toBe(3);
    });

    it('should identify top matched standards', () => {
      mkdirSync(join(TEST_DIR, '.uds'), { recursive: true });
      const entries = [
        { timestamp: '1', matched_standards: ['testing', 'commit-message'], matched_count: 2, total_available: 3 },
        { timestamp: '2', matched_standards: ['testing'], matched_count: 1, total_available: 3 },
        { timestamp: '3', matched_standards: ['testing', 'git-workflow'], matched_count: 2, total_available: 3 },
      ];
      writeFileSync(
        join(TEST_DIR, '.uds', 'hook-stats.jsonl'),
        entries.map(e => JSON.stringify(e)).join('\n')
      );

      const analysis = analyzeHookStats(TEST_DIR);

      // 'testing' appears 3 times, should be #1
      expect(analysis.top_standards[0].id).toBe('testing');
      expect(analysis.top_standards[0].count).toBe(3);
    });

    it('should identify zero-match triggers', () => {
      mkdirSync(join(TEST_DIR, '.uds'), { recursive: true });
      const entries = [
        { timestamp: '1', matched_standards: ['testing'], matched_count: 1, total_available: 3 },
        { timestamp: '2', matched_standards: [], matched_count: 0, total_available: 3 },
        { timestamp: '3', matched_standards: [], matched_count: 0, total_available: 3 },
      ];
      writeFileSync(
        join(TEST_DIR, '.uds', 'hook-stats.jsonl'),
        entries.map(e => JSON.stringify(e)).join('\n')
      );

      const analysis = analyzeHookStats(TEST_DIR);

      expect(analysis.zero_match_count).toBe(2);
      expect(analysis.zero_match_rate).toBeCloseTo(2 / 3, 2);
    });

    it('should identify never-matched standards from all_standards list', () => {
      mkdirSync(join(TEST_DIR, '.uds'), { recursive: true });
      const entries = [
        { timestamp: '1', matched_standards: ['testing'], matched_count: 1, total_available: 3 },
        { timestamp: '2', matched_standards: ['testing'], matched_count: 1, total_available: 3 },
      ];
      writeFileSync(
        join(TEST_DIR, '.uds', 'hook-stats.jsonl'),
        entries.map(e => JSON.stringify(e)).join('\n')
      );

      const allStandards = ['testing', 'commit-message', 'security'];
      const analysis = analyzeHookStats(TEST_DIR, { allStandards });

      expect(analysis.never_matched).toContain('commit-message');
      expect(analysis.never_matched).toContain('security');
      expect(analysis.never_matched).not.toContain('testing');
    });
  });
});
