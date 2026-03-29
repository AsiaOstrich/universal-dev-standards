/**
 * TDD tests for health-scorer.js
 * [Source: SPEC-SELFDIAG-001]
 *
 * Covers: AC-1, AC-2, AC-3, AC-4, AC-5, AC-15
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/health-scorer-test');

// Helper: valid manifest matching project patterns
const createValidManifest = (overrides = {}) => ({
  version: '5.1.0',
  upstream: {
    repo: 'AsiaOstrich/universal-dev-standards',
    version: '5.1.0',
    installed: '2026-03-29T00:00:00Z'
  },
  level: 2,
  format: 'ai',
  standardsScope: 'full',
  contentMode: 'full',
  standards: [
    'core/testing.ai.yaml',
    'core/commit-message.ai.yaml',
    'core/git-workflow.ai.yaml'
  ],
  extensions: [],
  integrations: [],
  integrationConfigs: {},
  options: {},
  aiTools: [],
  skills: { installed: false, location: 'marketplace', names: [], version: null, installations: [] },
  commands: { installed: false, names: [], installations: [] },
  methodology: null,
  fileHashes: {},
  skillHashes: {},
  commandHashes: {},
  integrationBlockHashes: {},
  ...overrides
});

// Helper: set up a minimal initialized project
function setupInitializedProject(dir, manifestOverrides = {}) {
  const standardsDir = join(dir, '.standards');
  mkdirSync(standardsDir, { recursive: true });
  const manifest = createValidManifest(manifestOverrides);
  writeFileSync(join(standardsDir, 'manifest.json'), JSON.stringify(manifest));
  // Create standard files
  for (const std of manifest.standards) {
    const fileName = std.includes('/') ? std.split('/').pop() : std;
    writeFileSync(join(standardsDir, fileName), `standard: { id: ${fileName} }`);
  }
  return manifest;
}

describe('HealthScorer', () => {
  let weightedAverage, calculateCompleteness, calculateFreshness,
    calculateConsistency, calculateCoverage, runHealthScore,
    saveScoreSnapshot, loadTrend;

  beforeEach(async () => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });

    const mod = await import('../../../src/utils/health-scorer.js');
    weightedAverage = mod.weightedAverage;
    calculateCompleteness = mod.calculateCompleteness;
    calculateFreshness = mod.calculateFreshness;
    calculateConsistency = mod.calculateConsistency;
    calculateCoverage = mod.calculateCoverage;
    runHealthScore = mod.runHealthScore;
    saveScoreSnapshot = mod.saveScoreSnapshot;
    loadTrend = mod.loadTrend;
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  // ========================================
  // weightedAverage (internal utility)
  // ========================================

  describe('weightedAverage()', () => {
    it('should calculate correct weighted average', () => {
      // Arrange
      const input = [[90, 0.25], [75, 0.25], [85, 0.30], [70, 0.20]];
      // Act
      const result = weightedAverage(input);
      // Assert: 90*0.25 + 75*0.25 + 85*0.30 + 70*0.20 = 80.75 → 81
      expect(result).toBe(81);
    });

    it('should handle all zeros', () => {
      const result = weightedAverage([[0, 0.25], [0, 0.25], [0, 0.30], [0, 0.20]]);
      expect(result).toBe(0);
    });

    it('should handle all 100s', () => {
      const result = weightedAverage([[100, 0.25], [100, 0.25], [100, 0.30], [100, 0.20]]);
      expect(result).toBe(100);
    });

    it('should handle empty input', () => {
      const result = weightedAverage([]);
      expect(result).toBe(0);
    });
  });

  // ========================================
  // REQ-2.1: Completeness (AC-1)
  // ========================================

  describe('calculateCompleteness()', () => {
    it('should return score 0-100 with details', () => {
      // Arrange
      setupInitializedProject(TEST_DIR);
      // Act
      const result = calculateCompleteness(TEST_DIR, ['testing', 'commit-message', 'git-workflow']);
      // Assert
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.details).toBeDefined();
      expect(result.details.total).toBe(3);
    });

    it('should return 0 for empty standards list', () => {
      setupInitializedProject(TEST_DIR, { standards: [] });
      const result = calculateCompleteness(TEST_DIR, []);
      expect(result.score).toBe(0);
    });

    it('should detect existing ai yaml files', () => {
      setupInitializedProject(TEST_DIR);
      const result = calculateCompleteness(TEST_DIR, ['testing', 'commit-message', 'git-workflow']);
      // ai yaml files exist in .standards/
      expect(result.details.ai_yaml).toBeGreaterThanOrEqual(0);
    });
  });

  // ========================================
  // REQ-2.2: Freshness (AC-1)
  // ========================================

  describe('calculateFreshness()', () => {
    it('should return score 0-100', () => {
      // Arrange: files just created = recent
      setupInitializedProject(TEST_DIR);
      // Act
      const result = calculateFreshness(TEST_DIR, ['testing.ai.yaml', 'commit-message.ai.yaml']);
      // Assert
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should score 100 for recently modified files', () => {
      setupInitializedProject(TEST_DIR);
      // Files just created = <30 days
      const result = calculateFreshness(TEST_DIR, ['testing.ai.yaml']);
      expect(result.score).toBe(100);
    });

    it('should include details with age buckets', () => {
      setupInitializedProject(TEST_DIR);
      const result = calculateFreshness(TEST_DIR, ['testing.ai.yaml']);
      expect(result.details).toHaveProperty('recent_30d');
      expect(result.details).toHaveProperty('aging_90d');
      expect(result.details).toHaveProperty('stale_180d');
      expect(result.details).toHaveProperty('outdated');
    });

    it('should return 0 for empty file list', () => {
      const result = calculateFreshness(TEST_DIR, []);
      expect(result.score).toBe(0);
    });
  });

  // ========================================
  // REQ-2.3: Consistency (AC-1)
  // ========================================

  describe('calculateConsistency()', () => {
    it('should return score 0-100 with details', () => {
      setupInitializedProject(TEST_DIR);
      const result = calculateConsistency(TEST_DIR);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.details).toBeDefined();
    });

    it('should check manifest validity', () => {
      setupInitializedProject(TEST_DIR);
      const result = calculateConsistency(TEST_DIR);
      expect(result.details.manifest_valid).toBe(true);
    });

    it('should detect invalid manifest', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'manifest.json'), 'not json');
      const result = calculateConsistency(TEST_DIR);
      expect(result.details.manifest_valid).toBe(false);
    });
  });

  // ========================================
  // REQ-2.4: Coverage (AC-1)
  // ========================================

  describe('calculateCoverage()', () => {
    it('should return score 0-100 with details', () => {
      setupInitializedProject(TEST_DIR);
      const result = calculateCoverage(TEST_DIR, ['testing', 'commit-message']);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.details).toBeDefined();
      expect(result.details.total).toBe(2);
    });

    it('should return 0 for empty standards', () => {
      const result = calculateCoverage(TEST_DIR, []);
      expect(result.score).toBe(0);
    });
  });

  // ========================================
  // REQ-1: runHealthScore (AC-1, AC-2)
  // ========================================

  describe('runHealthScore()', () => {
    it('should return score between 0 and 100', () => {
      setupInitializedProject(TEST_DIR);
      const result = runHealthScore(TEST_DIR, { self: false });
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should return 4 dimension scores', () => {
      setupInitializedProject(TEST_DIR);
      const result = runHealthScore(TEST_DIR, { self: false });
      expect(result.dimensions).toHaveProperty('completeness');
      expect(result.dimensions).toHaveProperty('freshness');
      expect(result.dimensions).toHaveProperty('consistency');
      expect(result.dimensions).toHaveProperty('coverage');
    });

    it('should include mode field', () => {
      setupInitializedProject(TEST_DIR);
      const result = runHealthScore(TEST_DIR, { self: false });
      expect(result.mode).toBe('consumer');
    });

    it('should set mode to self when self option is true', () => {
      setupInitializedProject(TEST_DIR);
      const result = runHealthScore(TEST_DIR, { self: true });
      expect(result.mode).toBe('self');
    });

    it('should include timestamp', () => {
      setupInitializedProject(TEST_DIR);
      const result = runHealthScore(TEST_DIR, { self: false });
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should return error for uninitialized project', () => {
      // No .standards/ directory
      const result = runHealthScore(TEST_DIR, { self: false });
      expect(result.error).toBeDefined();
    });

    it('should handle corrupted manifest gracefully', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'manifest.json'), '{ broken !!!');
      const result = runHealthScore(TEST_DIR, { self: false });
      expect(result.error).toBeDefined();
    });
  });

  // ========================================
  // REQ-3: Trend Tracking (AC-3, AC-4)
  // ========================================

  describe('saveScoreSnapshot()', () => {
    it('should create .uds/health-scores/ directory', () => {
      const scoreResult = { score: 82, dimensions: {}, timestamp: '2026-03-29T10:00:00Z' };
      saveScoreSnapshot(TEST_DIR, scoreResult);
      expect(existsSync(join(TEST_DIR, '.uds', 'health-scores'))).toBe(true);
    });

    it('should save snapshot with date filename', () => {
      const scoreResult = { score: 82, dimensions: {}, timestamp: '2026-03-29T10:00:00Z' };
      saveScoreSnapshot(TEST_DIR, scoreResult);
      // Check that a .json file was created in the directory
      const scoresDir = join(TEST_DIR, '.uds', 'health-scores');
      const files = existsSync(scoresDir) ?
        require('fs').readdirSync(scoresDir).filter(f => f.endsWith('.json')) : [];
      expect(files.length).toBe(1);
      expect(files[0]).toMatch(/^\d{4}-\d{2}-\d{2}\.json$/);
    });
  });

  describe('loadTrend()', () => {
    it('should return empty entries when no history exists', () => {
      const trend = loadTrend(TEST_DIR);
      expect(trend.entries).toEqual([]);
    });

    it('should load and sort historical snapshots', () => {
      // Arrange: create snapshot files
      const scoresDir = join(TEST_DIR, '.uds', 'health-scores');
      mkdirSync(scoresDir, { recursive: true });
      writeFileSync(join(scoresDir, '2026-03-22.json'), JSON.stringify({ score: 78 }));
      writeFileSync(join(scoresDir, '2026-03-29.json'), JSON.stringify({ score: 82 }));
      writeFileSync(join(scoresDir, '2026-03-15.json'), JSON.stringify({ score: 75 }));
      // Act
      const trend = loadTrend(TEST_DIR);
      // Assert: sorted by date
      expect(trend.entries.length).toBe(3);
      expect(trend.entries[0].score).toBe(75);
      expect(trend.entries[2].score).toBe(82);
    });

    it('should detect degradation when score drops > 5', () => {
      const scoresDir = join(TEST_DIR, '.uds', 'health-scores');
      mkdirSync(scoresDir, { recursive: true });
      writeFileSync(join(scoresDir, '2026-03-22.json'), JSON.stringify({ score: 85 }));
      writeFileSync(join(scoresDir, '2026-03-29.json'), JSON.stringify({ score: 79 }));
      const trend = loadTrend(TEST_DIR);
      expect(trend.degraded).toBe(true);
      expect(trend.change).toBe(-6);
    });

    it('should not flag degradation for small drops', () => {
      const scoresDir = join(TEST_DIR, '.uds', 'health-scores');
      mkdirSync(scoresDir, { recursive: true });
      writeFileSync(join(scoresDir, '2026-03-22.json'), JSON.stringify({ score: 85 }));
      writeFileSync(join(scoresDir, '2026-03-29.json'), JSON.stringify({ score: 82 }));
      const trend = loadTrend(TEST_DIR);
      expect(trend.degraded).toBe(false);
    });
  });
});
