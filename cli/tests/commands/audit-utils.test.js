import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../temp/audit-utils-test');

// Helper to create a valid manifest
const createValidManifest = (overrides = {}) => ({
  version: '3.3.0',
  upstream: {
    repo: 'AsiaOstrich/universal-dev-standards',
    version: '5.0.0',
    installed: '2026-01-01'
  },
  level: 2,
  format: 'ai',
  standardsScope: 'minimal',
  contentMode: 'index',
  standards: [],
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

describe('Audit Utilities', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  // ========================
  // Health Checker
  // ========================

  describe('HealthChecker', () => {
    let runHealthCheck, getTrackedFileCount;

    beforeEach(async () => {
      const mod = await import('../../src/utils/health-checker.js');
      runHealthCheck = mod.runHealthCheck;
      getTrackedFileCount = mod.getTrackedFileCount;
    });

    it('should return ERROR when .standards/ does not exist', () => {
      const result = runHealthCheck(TEST_DIR);
      expect(result.status).toBe('ERROR');
      expect(result.issues[0].component).toBe('.standards/');
    });

    it('should return ERROR when manifest.json is missing', () => {
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });

      const result = runHealthCheck(TEST_DIR);
      expect(result.status).toBe('ERROR');
      expect(result.issues[0].component).toBe('manifest.json');
    });

    it('should return OK when installation is healthy', () => {
      const manifest = createValidManifest();
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      const result = runHealthCheck(TEST_DIR);
      expect(result.status).toBe('OK');
    });

    it('should detect missing standard files', () => {
      const manifest = createValidManifest({
        standards: ['core/missing-standard.ai.yaml']
      });
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );

      const result = runHealthCheck(TEST_DIR);
      expect(result.status).toBe('WARNING');
      const missingIssue = result.issues.find(i =>
        i.component === 'missing-standard.ai.yaml'
      );
      expect(missingIssue).toBeDefined();
    });

    it('should detect broken AI config references', () => {
      const manifest = createValidManifest({
        aiTools: ['claude-code']
      });
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );
      // Create CLAUDE.md without .standards/ reference
      writeFileSync(
        join(TEST_DIR, 'CLAUDE.md'),
        '# Project\nNo standards references here'
      );

      const result = runHealthCheck(TEST_DIR);
      expect(result.status).toBe('WARNING');
      const configIssue = result.issues.find(i =>
        i.component === 'CLAUDE.md' && i.message.includes('does not reference')
      );
      expect(configIssue).toBeDefined();
    });

    it('should detect missing AI config file', () => {
      const manifest = createValidManifest({
        aiTools: ['claude-code']
      });
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );
      // No CLAUDE.md file

      const result = runHealthCheck(TEST_DIR);
      expect(result.status).toBe('WARNING');
      const configIssue = result.issues.find(i =>
        i.component === 'CLAUDE.md' && i.message.includes('not found')
      );
      expect(configIssue).toBeDefined();
    });

    it('should return tracked file count', () => {
      expect(getTrackedFileCount(null)).toBe(0);
      expect(getTrackedFileCount({})).toBe(0);
      expect(getTrackedFileCount({ fileHashes: { a: {}, b: {} } })).toBe(2);
    });
  });

  // ========================
  // Pattern Analyzer
  // ========================

  describe('PatternAnalyzer', () => {
    let analyzePatterns;

    beforeEach(async () => {
      const mod = await import('../../src/utils/pattern-analyzer.js');
      analyzePatterns = mod.analyzePatterns;
    });

    it('should detect database-migration patterns', () => {
      mkdirSync(join(TEST_DIR, 'migrations'), { recursive: true });
      mkdirSync(join(TEST_DIR, 'db'), { recursive: true });

      const patterns = analyzePatterns(TEST_DIR);
      const dbPattern = patterns.find(p => p.name === 'database-migration');
      expect(dbPattern).toBeDefined();
      expect(dbPattern.evidence.length).toBeGreaterThanOrEqual(2);
    });

    it('should detect containerization patterns', () => {
      writeFileSync(join(TEST_DIR, 'Dockerfile'), 'FROM node:20');
      writeFileSync(join(TEST_DIR, 'docker-compose.yml'), 'version: "3"');

      const patterns = analyzePatterns(TEST_DIR);
      const pattern = patterns.find(p => p.name === 'containerization');
      expect(pattern).toBeDefined();
    });

    it('should detect CI/CD pipeline patterns', () => {
      mkdirSync(join(TEST_DIR, '.github', 'workflows'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.github', 'workflows', 'ci.yml'), 'name: CI');

      const patterns = analyzePatterns(TEST_DIR);
      const pattern = patterns.find(p => p.name === 'ci-cd-pipeline');
      expect(pattern).toBeDefined();
    });

    it('should return empty when no patterns detected', () => {
      const patterns = analyzePatterns(TEST_DIR);
      expect(patterns).toEqual([]);
    });

    it('should handle non-existent path gracefully', () => {
      const patterns = analyzePatterns('/tmp/nonexistent-path-audit-test');
      expect(patterns).toEqual([]);
    });
  });

  // ========================
  // Friction Detector
  // ========================

  describe('FrictionDetector', () => {
    let detectFrictions;

    beforeEach(async () => {
      const mod = await import('../../src/utils/friction-detector.js');
      detectFrictions = mod.detectFrictions;
    });

    it('should return empty for null manifest', () => {
      const frictions = detectFrictions(TEST_DIR, null);
      expect(frictions).toEqual([]);
    });

    it('should detect modified files', () => {
      const originalContent = 'original content';
      const hash = createHash('sha256').update(originalContent).digest('hex');

      const manifest = createValidManifest({
        fileHashes: {
          '.standards/test.ai.yaml': {
            hash: `sha256:${hash}`,
            size: Buffer.byteLength(originalContent),
            installedAt: '2026-01-01'
          }
        }
      });

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'test.ai.yaml'), 'modified content');

      const frictions = detectFrictions(TEST_DIR, manifest);
      const modified = frictions.find(f => f.type === 'modified');
      expect(modified).toBeDefined();
      expect(modified.severity).toBe('HIGH');
      expect(modified.diff).toBeDefined();
    });

    it('should detect orphaned files', () => {
      const manifest = createValidManifest({
        fileHashes: {}
      });

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, '.standards', 'manifest.json'),
        JSON.stringify(manifest)
      );
      writeFileSync(join(TEST_DIR, '.standards', 'orphan.ai.yaml'), 'content');

      const frictions = detectFrictions(TEST_DIR, manifest);
      const orphaned = frictions.find(f => f.type === 'orphaned');
      expect(orphaned).toBeDefined();
      expect(orphaned.severity).toBe('MEDIUM');
    });

    it('should detect unused standards', () => {
      const content = 'some yaml content';
      const hash = createHash('sha256').update(content).digest('hex');

      const manifest = createValidManifest({
        standards: ['core/unused.ai.yaml'],
        aiTools: ['claude-code'],
        fileHashes: {
          '.standards/unused.ai.yaml': {
            hash: `sha256:${hash}`,
            size: Buffer.byteLength(content),
            installedAt: '2026-01-01'
          }
        }
      });

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'unused.ai.yaml'), content);
      writeFileSync(join(TEST_DIR, 'CLAUDE.md'), '# No references here');

      const frictions = detectFrictions(TEST_DIR, manifest);
      const unused = frictions.find(f => f.type === 'unused');
      expect(unused).toBeDefined();
      expect(unused.severity).toBe('LOW');
    });

    it('should not flag used standards', () => {
      const content = 'some yaml content';
      const hash = createHash('sha256').update(content).digest('hex');

      const manifest = createValidManifest({
        standards: ['core/testing.ai.yaml'],
        aiTools: ['claude-code'],
        fileHashes: {
          '.standards/testing.ai.yaml': {
            hash: `sha256:${hash}`,
            size: Buffer.byteLength(content),
            installedAt: '2026-01-01'
          }
        }
      });

      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'testing.ai.yaml'), content);
      // Reference the standard in CLAUDE.md
      writeFileSync(
        join(TEST_DIR, 'CLAUDE.md'),
        '# Project\nFollow .standards/testing.ai.yaml'
      );

      const frictions = detectFrictions(TEST_DIR, manifest);
      const unused = frictions.find(f => f.standard === 'testing.ai.yaml' && f.type === 'unused');
      expect(unused).toBeUndefined();
    });
  });

  // ========================
  // Feedback Reporter
  // ========================

  describe('FeedbackReporter', () => {
    let formatIssueContent, generateReportUrl;

    beforeEach(async () => {
      const mod = await import('../../src/utils/feedback-reporter.js');
      formatIssueContent = mod.formatIssueContent;
      generateReportUrl = mod.generateReportUrl;
    });

    it('should format issue with health issues', () => {
      const auditResult = {
        udsVersion: '5.0.0',
        health: {
          status: 'WARNING',
          issues: [{
            severity: 'WARNING',
            component: 'CLAUDE.md',
            message: 'References broken'
          }]
        },
        patterns: [],
        frictions: []
      };

      const { title, body, labels } = formatIssueContent(auditResult);
      expect(title).toContain('Audit');
      expect(body).toContain('Health Issues');
      expect(body).toContain('CLAUDE.md');
      expect(labels).toContain('audit-health');
    });

    it('should format issue with patterns', () => {
      const auditResult = {
        udsVersion: '5.0.0',
        health: { status: 'OK', issues: [] },
        patterns: [{
          name: 'monitoring',
          severity: 'HIGH',
          evidence: ['monitoring/', '5 commits'],
          suggestion: 'New monitoring standard'
        }],
        frictions: []
      };

      const { title, body, labels } = formatIssueContent(auditResult);
      expect(body).toContain('Pattern Suggestions');
      expect(body).toContain('monitoring');
      expect(labels).toContain('audit-pattern');
    });

    it('should format issue with frictions', () => {
      const auditResult = {
        udsVersion: '5.0.0',
        health: { status: 'OK', issues: [] },
        patterns: [],
        frictions: [{
          standard: 'testing.ai.yaml',
          type: 'modified',
          severity: 'HIGH',
          diff: 'Content changed',
          suggestion: 'Needs flexibility'
        }]
      };

      const { title, body, labels } = formatIssueContent(auditResult);
      expect(body).toContain('Friction Reports');
      expect(body).toContain('testing.ai.yaml');
      expect(labels).toContain('audit-friction');
    });

    it('should include user comments', () => {
      const auditResult = {
        udsVersion: '5.0.0',
        health: { status: 'OK', issues: [] },
        patterns: [],
        frictions: []
      };

      const { body } = formatIssueContent(auditResult, 'My feedback here');
      expect(body).toContain('User Comments');
      expect(body).toContain('My feedback here');
    });

    it('should generate report URL', () => {
      const auditResult = {
        udsVersion: '5.0.0',
        health: { status: 'OK', issues: [] },
        patterns: [],
        frictions: []
      };

      const url = generateReportUrl(auditResult);
      expect(url).toContain('github.com/AsiaOstrich/universal-dev-standards/issues/new');
    });
  });

  // ========================
  // Health Scorer (SPEC-SELFDIAG-001)
  // ========================

  describe('HealthScorer Integration', () => {
    let runHealthScore, saveScoreSnapshot, loadTrend;

    beforeEach(async () => {
      const mod = await import('../../src/utils/health-scorer.js');
      runHealthScore = mod.runHealthScore;
      saveScoreSnapshot = mod.saveScoreSnapshot;
      loadTrend = mod.loadTrend;
    });

    it('should produce score with all required fields for consumer mode', () => {
      // Arrange: initialized project
      const manifest = createValidManifest({
        standards: ['core/testing.ai.yaml', 'core/commit-message.ai.yaml']
      });
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'manifest.json'), JSON.stringify(manifest));
      writeFileSync(join(TEST_DIR, '.standards', 'testing.ai.yaml'), 'content');
      writeFileSync(join(TEST_DIR, '.standards', 'commit-message.ai.yaml'), 'content');

      // Act
      const result = runHealthScore(TEST_DIR, { self: false });

      // Assert (AC-1, AC-2)
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.mode).toBe('consumer');
      expect(result.dimensions.completeness).toBeDefined();
      expect(result.dimensions.freshness).toBeDefined();
      expect(result.dimensions.consistency).toBeDefined();
      expect(result.dimensions.coverage).toBeDefined();
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(result.error).toBeUndefined();
    });

    it('should produce score with self mode', () => {
      const manifest = createValidManifest();
      mkdirSync(join(TEST_DIR, '.standards'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.standards', 'manifest.json'), JSON.stringify(manifest));

      const result = runHealthScore(TEST_DIR, { self: true });
      expect(result.mode).toBe('self');
    });

    it('should save and load trend correctly', () => {
      // Save two snapshots
      const result1 = { score: 78, dimensions: {}, timestamp: '2026-03-22T10:00:00Z' };
      const result2 = { score: 82, dimensions: {}, timestamp: '2026-03-29T10:00:00Z' };

      saveScoreSnapshot(TEST_DIR, result1);
      // Overwrite with result2 (same day in test)
      saveScoreSnapshot(TEST_DIR, result2);

      const trend = loadTrend(TEST_DIR);
      expect(trend.entries.length).toBeGreaterThanOrEqual(1);
    });
  });
});
