/**
 * Pattern Analyzer - Layer 2a: Development pattern detection
 *
 * Scans user's project for development patterns not covered by installed standards:
 * - Directory structure scanning against known standard categories
 * - Commit message topic analysis for recurring patterns
 *
 * @module utils/pattern-analyzer
 * @see docs/specs/system/SPEC-AUDIT-01-standards-audit.md (AC-2)
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * Known standard categories with detection signals
 * Categories marked with hasStandard=true are already covered by UDS
 */
const DETECTION_SIGNALS = {
  monitoring: {
    hasStandard: false,
    dirs: ['monitoring'],
    files: ['*.monitoring.*', 'apm.*'],
    keywords: ['monitor', 'alert', 'apm', 'observability', 'prometheus', 'grafana', 'datadog'],
    suggestion: 'New "monitoring" standard'
  },
  'api-versioning': {
    hasStandard: false,
    dirs: ['api'],
    files: [],
    keywords: ['api-version', 'versioning', 'v1', 'v2', 'api/v'],
    suggestion: 'New "api-versioning" standard'
  },
  'database-migration': {
    hasStandard: false,
    dirs: ['migrations', 'db'],
    files: ['*.migration.*'],
    keywords: ['migrate', 'schema', 'migration', 'knex', 'sequelize', 'prisma'],
    suggestion: 'New "database-migration" standard'
  },
  'feature-flags': {
    hasStandard: false,
    dirs: ['flags'],
    files: [],
    keywords: ['feature-flag', 'launchdarkly', 'flagsmith', 'unleash', 'toggle'],
    suggestion: 'New "feature-flags" standard'
  },
  'incident-response': {
    hasStandard: false,
    dirs: ['runbooks'],
    files: [],
    keywords: ['runbook', 'on-call', 'pagerduty', 'incident', 'postmortem'],
    suggestion: 'New "incident-response" standard'
  },
  containerization: {
    hasStandard: false,
    dirs: ['k8s', 'kubernetes', 'helm'],
    files: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'],
    keywords: ['docker', 'container', 'kubernetes', 'k8s', 'helm', 'pod'],
    suggestion: 'New "containerization" standard'
  },
  'ci-cd-pipeline': {
    hasStandard: false,
    dirs: ['.github/workflows', '.gitlab'],
    files: ['.gitlab-ci.yml', 'Jenkinsfile', '.circleci'],
    keywords: ['pipeline', 'ci-cd', 'ci/cd', 'github-actions', 'jenkins', 'gitlab-ci'],
    suggestion: 'New "ci-cd-pipeline" standard'
  }
};

/**
 * Run pattern analysis on a project
 * @param {string} projectPath - Project root path
 * @returns {Array<{name: string, severity: string, evidence: string[], suggestion: string}>}
 */
export function analyzePatterns(projectPath) {
  const patterns = [];

  // Engine A: Directory structure scanning
  const dirPatterns = scanDirectoryStructure(projectPath);
  patterns.push(...dirPatterns);

  // Engine B: Commit topic analysis
  const commitPatterns = analyzeCommitTopics(projectPath);
  patterns.push(...commitPatterns);

  // Deduplicate: merge patterns with same name
  return deduplicatePatterns(patterns);
}

/**
 * Scan project directory structure for known pattern signals
 * @param {string} projectPath
 * @returns {Array}
 */
function scanDirectoryStructure(projectPath) {
  const patterns = [];

  let topLevelEntries;
  try {
    topLevelEntries = readdirSync(projectPath, { withFileTypes: true });
  } catch {
    return patterns;
  }

  const dirNames = topLevelEntries
    .filter(e => e.isDirectory())
    .map(e => e.name);

  const fileNames = topLevelEntries
    .filter(e => e.isFile())
    .map(e => e.name);

  for (const [categoryName, signals] of Object.entries(DETECTION_SIGNALS)) {
    if (signals.hasStandard) continue;

    const evidence = [];

    // Check directories
    for (const signalDir of signals.dirs) {
      // Handle nested dirs like .github/workflows
      if (signalDir.includes('/')) {
        const fullPath = join(projectPath, signalDir);
        if (existsSync(fullPath)) {
          evidence.push(`${signalDir}/`);
        }
      } else if (dirNames.includes(signalDir)) {
        evidence.push(`${signalDir}/`);
      }
    }

    // Check specific files
    for (const signalFile of signals.files) {
      if (signalFile.includes('*')) {
        // Glob-like matching (simplified)
        const pattern = signalFile.replace(/\*/g, '');
        const matches = fileNames.filter(f => f.includes(pattern));
        for (const match of matches) {
          evidence.push(match);
        }
      } else {
        if (fileNames.includes(signalFile) || existsSync(join(projectPath, signalFile))) {
          evidence.push(signalFile);
        }
      }
    }

    // Check for api/v*/ pattern specifically
    if (categoryName === 'api-versioning' && dirNames.includes('api')) {
      try {
        const apiEntries = readdirSync(join(projectPath, 'api'), { withFileTypes: true });
        const versionDirs = apiEntries
          .filter(e => e.isDirectory() && /^v\d+/.test(e.name))
          .map(e => `api/${e.name}/`);
        evidence.push(...versionDirs);
      } catch {
        // ignore
      }
    }

    if (evidence.length >= 2) {
      patterns.push({
        name: categoryName,
        severity: 'HIGH',
        evidence,
        suggestion: signals.suggestion
      });
    } else if (evidence.length === 1) {
      patterns.push({
        name: categoryName,
        severity: 'MEDIUM',
        evidence,
        suggestion: signals.suggestion
      });
    }
  }

  return patterns;
}

/**
 * Analyze git commit messages for recurring topics
 * @param {string} projectPath
 * @returns {Array}
 */
function analyzeCommitTopics(projectPath) {
  const patterns = [];

  // Check if git repo exists
  if (!existsSync(join(projectPath, '.git'))) {
    return patterns;
  }

  let commits;
  try {
    const output = execSync('git log --oneline -100', {
      cwd: projectPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    commits = output.trim().split('\n').filter(Boolean);
  } catch {
    return patterns;
  }

  if (commits.length === 0) return patterns;

  // Extract scopes and keywords from conventional commits
  const scopeRegex = /^[a-f0-9]+\s+[a-z]+\(([^)]+)\):/;
  const topicCounts = {};

  for (const commit of commits) {
    const scopeMatch = commit.match(scopeRegex);
    if (scopeMatch) {
      const scope = scopeMatch[1].toLowerCase();
      topicCounts[scope] = (topicCounts[scope] || 0) + 1;
    }

    // Match keywords from detection signals against commit subject
    const subject = commit.replace(/^[a-f0-9]+\s+/, '').toLowerCase();
    for (const [categoryName, signals] of Object.entries(DETECTION_SIGNALS)) {
      if (signals.hasStandard) continue;
      for (const keyword of signals.keywords) {
        if (subject.includes(keyword.toLowerCase())) {
          const key = `commit:${categoryName}`;
          topicCounts[key] = (topicCounts[key] || 0) + 1;
        }
      }
    }
  }

  // Check threshold: 3+ commits for a topic
  for (const [topic, count] of Object.entries(topicCounts)) {
    if (count < 3) continue;

    const categoryName = topic.startsWith('commit:') ? topic.replace('commit:', '') : topic;
    const signals = DETECTION_SIGNALS[categoryName];

    if (!signals || signals.hasStandard) continue;

    // Check if 2+ matching files exist
    const matchingFiles = countMatchingFiles(projectPath, signals);
    if (matchingFiles < 2) continue;

    patterns.push({
      name: categoryName,
      severity: 'HIGH',
      evidence: [`${count} related commits`],
      suggestion: signals.suggestion
    });
  }

  return patterns;
}

/**
 * Count files matching a category's signals
 * @param {string} projectPath
 * @param {Object} signals
 * @returns {number}
 */
function countMatchingFiles(projectPath, signals) {
  let count = 0;

  for (const dir of signals.dirs) {
    const fullPath = dir.includes('/') ? join(projectPath, dir) : join(projectPath, dir);
    if (existsSync(fullPath)) count++;
  }

  for (const file of signals.files) {
    if (!file.includes('*') && existsSync(join(projectPath, file))) {
      count++;
    }
  }

  return count;
}

/**
 * Merge patterns with the same name
 * @param {Array} patterns
 * @returns {Array}
 */
function deduplicatePatterns(patterns) {
  const merged = new Map();

  for (const pattern of patterns) {
    if (merged.has(pattern.name)) {
      const existing = merged.get(pattern.name);
      // Merge evidence arrays
      const evidenceSet = new Set([...existing.evidence, ...pattern.evidence]);
      existing.evidence = [...evidenceSet];
      // Keep highest severity
      if (pattern.severity === 'HIGH') existing.severity = 'HIGH';
    } else {
      merged.set(pattern.name, { ...pattern });
    }
  }

  return [...merged.values()];
}
