// [Source: docs/specs/SPEC-SELFDIAG-001-standards-self-diagnosis.md REQ-7, AC-11]
// [Related: cross-project XSPEC-301 Phase 1 — always-on false-positive fix]
// TDD tests for scripts/analyze-hook-stats.mjs always-on classification
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  normalizeStandardId,
  loadAlwaysOn,
  classifyNeverMatched,
} from '../../../../scripts/analyze-hook-stats.mjs';

describe('analyze-hook-stats: always-on classification (XSPEC-301 Phase 1)', () => {
  describe('normalizeStandardId()', () => {
    it('should strip path and .ai.yaml extension', () => {
      expect(normalizeStandardId('ai/standards/anti-hallucination.ai.yaml')).toBe('anti-hallucination');
      expect(normalizeStandardId('commit-message.ai.yaml')).toBe('commit-message');
      expect(normalizeStandardId('testing')).toBe('testing');
    });
  });

  describe('loadAlwaysOn()', () => {
    let testDir;

    beforeEach(() => {
      testDir = join(tmpdir(), `uds-alwayson-test-${Date.now()}-${Math.round(performance.now())}`);
      mkdirSync(join(testDir, '.standards'), { recursive: true });
    });

    afterEach(() => {
      rmSync(testDir, { recursive: true, force: true });
    });

    it('should read normalized always-on ids from manifest domains', () => {
      // Arrange
      writeFileSync(
        join(testDir, '.standards', 'manifest.json'),
        JSON.stringify({
          domains: {
            'always-on': [
              'ai/standards/anti-hallucination.ai.yaml',
              'ai/standards/commit-message.ai.yaml',
            ],
            testing: ['ai/standards/testing.ai.yaml'],
          },
        })
      );

      // Act
      const alwaysOn = loadAlwaysOn(testDir);

      // Assert
      expect(alwaysOn.has('anti-hallucination')).toBe(true);
      expect(alwaysOn.has('commit-message')).toBe(true);
      expect(alwaysOn.has('testing')).toBe(false);
    });

    it('should return empty set when no manifest exists', () => {
      expect(loadAlwaysOn(testDir).size).toBe(0);
    });

    it('should return empty set on malformed manifest (never throw)', () => {
      writeFileSync(join(testDir, '.standards', 'manifest.json'), '{ not valid json');
      expect(loadAlwaysOn(testDir).size).toBe(0);
    });
  });

  describe('classifyNeverMatched()', () => {
    it('should EXCLUDE always-on standards from dead candidates (the bug fix)', () => {
      // Arrange: anti-hallucination is always-on & never matched (expected),
      // mutation-testing is matchable & never matched (genuinely dead)
      const allStandards = ['anti-hallucination', 'commit-message', 'mutation-testing', 'testing'];
      const matchedSet = new Set(['testing']);
      const alwaysOn = new Set(['anti-hallucination', 'commit-message']);

      // Act
      const { deadCandidates, alwaysOnNeverMatched } = classifyNeverMatched(
        allStandards,
        matchedSet,
        alwaysOn
      );

      // Assert: always-on standards are NOT flagged dead
      expect(deadCandidates).toEqual(['mutation-testing']);
      expect(deadCandidates).not.toContain('anti-hallucination');
      expect(deadCandidates).not.toContain('commit-message');
      // always-on never-matched are reported separately
      expect(alwaysOnNeverMatched).toEqual(['anti-hallucination', 'commit-message']);
    });

    it('should return no dead candidates when every matchable standard was matched', () => {
      const { deadCandidates } = classifyNeverMatched(
        ['anti-hallucination', 'testing'],
        new Set(['testing']),
        new Set(['anti-hallucination'])
      );
      expect(deadCandidates).toEqual([]);
    });

    it('should treat standards as dead when no always-on info is available', () => {
      // Empty always-on set → every never-matched standard is a dead candidate
      const { deadCandidates, alwaysOnNeverMatched } = classifyNeverMatched(
        ['a', 'b'],
        new Set(['a']),
        new Set()
      );
      expect(deadCandidates).toEqual(['b']);
      expect(alwaysOnNeverMatched).toEqual([]);
    });
  });
});
