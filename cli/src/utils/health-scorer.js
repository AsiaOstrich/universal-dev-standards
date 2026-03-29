/**
 * Health Scorer - Multi-dimensional health scoring for UDS installations
 *
 * Provides quantified health scores across 4 dimensions:
 * - Completeness (25%): Ecosystem completeness per standard
 * - Freshness (25%): How recently standards were updated
 * - Consistency (30%): Sync status across layers
 * - Coverage (20%): Verification script and test coverage
 *
 * @module utils/health-scorer
 * @see docs/specs/SPEC-SELFDIAG-001-standards-self-diagnosis.md
 */

import { existsSync, readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Calculate weighted average from [score, weight] pairs
 * @param {Array<[number, number]>} pairs - [[score, weight], ...]
 * @returns {number} Rounded weighted average (0-100)
 */
export function weightedAverage(pairs) {
  if (!pairs || pairs.length === 0) return 0;
  let totalWeight = 0;
  let sum = 0;
  for (const [score, weight] of pairs) {
    sum += score * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return 0;
  return Math.round(sum / totalWeight);
}

/**
 * Calculate completeness score
 * @param {string} projectPath
 * @param {string[]} standardIds - Standard IDs (without extension)
 * @returns {{ score: number, details: object }}
 */
export function calculateCompleteness(projectPath, standardIds) {
  if (!standardIds || standardIds.length === 0) {
    return { score: 0, details: { ai_yaml: 0, total: 0 } };
  }

  const standardsDir = join(projectPath, '.standards');
  let aiYamlCount = 0;

  for (const id of standardIds) {
    const yamlFile = join(standardsDir, `${id}.ai.yaml`);
    if (existsSync(yamlFile)) {
      aiYamlCount++;
    }
  }

  const ratio = aiYamlCount / standardIds.length;
  const score = Math.round(ratio * 100);

  return {
    score,
    details: {
      ai_yaml: aiYamlCount,
      total: standardIds.length
    }
  };
}

/**
 * Calculate freshness score based on file modification times
 * @param {string} projectPath
 * @param {string[]} fileNames - File names in .standards/
 * @returns {{ score: number, details: object }}
 */
export function calculateFreshness(projectPath, fileNames) {
  if (!fileNames || fileNames.length === 0) {
    return { score: 0, details: { recent_30d: 0, aging_90d: 0, stale_180d: 0, outdated: 0 } };
  }

  const standardsDir = join(projectPath, '.standards');
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  let recent = 0, aging = 0, stale = 0, outdated = 0;
  const outdatedList = [];

  for (const fileName of fileNames) {
    const filePath = join(standardsDir, fileName);
    if (!existsSync(filePath)) continue;

    const mtime = statSync(filePath).mtimeMs;
    const ageDays = (now - mtime) / DAY_MS;

    if (ageDays < 30) {
      recent++;
    } else if (ageDays < 90) {
      aging++;
    } else if (ageDays < 180) {
      stale++;
    } else {
      outdated++;
      outdatedList.push(fileName);
    }
  }

  const total = recent + aging + stale + outdated;
  if (total === 0) return { score: 0, details: { recent_30d: 0, aging_90d: 0, stale_180d: 0, outdated: 0 } };

  const score = Math.round(
    (recent * 100 + aging * 75 + stale * 50 + outdated * 25) / total
  );

  return {
    score,
    details: {
      recent_30d: recent,
      aging_90d: aging,
      stale_180d: stale,
      outdated,
      outdated_list: outdatedList
    }
  };
}

/**
 * Calculate consistency score
 * @param {string} projectPath
 * @returns {{ score: number, details: object }}
 */
export function calculateConsistency(projectPath) {
  const standardsDir = join(projectPath, '.standards');
  const manifestPath = join(standardsDir, 'manifest.json');

  let manifestValid = false;
  let manifest = null;

  try {
    const content = readFileSync(manifestPath, 'utf-8');
    manifest = JSON.parse(content);
    manifestValid = !!(manifest && manifest.version && manifest.standards);
  } catch {
    manifestValid = false;
  }

  if (!manifestValid) {
    return {
      score: 0,
      details: { manifest_valid: false, declared: 0, present: 0 }
    };
  }

  // Check declared standards vs present files
  const declared = Array.isArray(manifest.standards) ? manifest.standards.length : 0;
  let present = 0;

  if (Array.isArray(manifest.standards)) {
    for (const std of manifest.standards) {
      const fileName = std.includes('/') ? std.split('/').pop() : std;
      if (existsSync(join(standardsDir, fileName))) {
        present++;
      }
    }
  }

  const syncRatio = declared > 0 ? present / declared : 1;
  const score = Math.round(
    (manifestValid ? 50 : 0) + (syncRatio * 50)
  );

  return {
    score,
    details: {
      manifest_valid: manifestValid,
      declared,
      present,
      total_checkable: declared
    }
  };
}

/**
 * Calculate coverage score
 * @param {string} projectPath
 * @param {string[]} standardIds
 * @returns {{ score: number, details: object }}
 */
export function calculateCoverage(projectPath, standardIds) {
  if (!standardIds || standardIds.length === 0) {
    return { score: 0, details: { has_check_script: 0, has_tests: 0, total: 0 } };
  }

  // Check for check scripts matching standard names
  const scriptsDir = join(projectPath, 'scripts');
  let hasCheckScript = 0;
  let hasTests = 0;

  for (const id of standardIds) {
    const scriptName = `check-${id}.sh`;
    if (existsSync(join(scriptsDir, scriptName))) {
      hasCheckScript++;
    }
    // Also check for sync scripts
    const syncScript = `check-${id}-sync.sh`;
    if (existsSync(join(scriptsDir, syncScript))) {
      hasCheckScript++;
    }
  }

  const ratio = standardIds.length > 0
    ? (hasCheckScript + hasTests) / (standardIds.length * 2)
    : 0;
  const score = Math.round(Math.min(ratio * 100, 100));

  return {
    score,
    details: {
      has_check_script: hasCheckScript,
      has_tests: hasTests,
      total: standardIds.length
    }
  };
}

/**
 * Run full health score analysis
 * @param {string} projectPath
 * @param {{ self?: boolean }} options
 * @returns {{ score: number, mode: string, dimensions: object, timestamp: string, error?: string }}
 */
export function runHealthScore(projectPath, options = {}) {
  const mode = options.self ? 'self' : 'consumer';
  const standardsDir = join(projectPath, '.standards');

  // Check initialization
  if (!existsSync(standardsDir)) {
    return {
      score: 0,
      mode,
      dimensions: {},
      timestamp: new Date().toISOString(),
      error: 'UDS not initialized. Run `uds init` to install standards.'
    };
  }

  // Read manifest
  const manifestPath = join(standardsDir, 'manifest.json');
  let manifest;
  try {
    const content = readFileSync(manifestPath, 'utf-8');
    manifest = JSON.parse(content);
  } catch {
    return {
      score: 0,
      mode,
      dimensions: {},
      timestamp: new Date().toISOString(),
      error: 'Cannot parse manifest.json. Run `uds update` to repair.'
    };
  }

  // Extract standard IDs
  const standardIds = (manifest.standards || []).map(s => {
    if (typeof s === 'string') {
      const name = s.includes('/') ? s.split('/').pop() : s;
      return name.replace('.ai.yaml', '');
    }
    return s.id || s;
  });

  // Get file names for freshness
  const fileNames = (manifest.standards || []).map(s => {
    if (typeof s === 'string') {
      const name = s.includes('/') ? s.split('/').pop() : s;
      return name.endsWith('.ai.yaml') ? name : `${name}.ai.yaml`;
    }
    return `${s.id || s}.ai.yaml`;
  });

  // Calculate dimensions
  const completeness = calculateCompleteness(projectPath, standardIds);
  const freshness = calculateFreshness(projectPath, fileNames);
  const consistency = calculateConsistency(projectPath);
  const coverage = calculateCoverage(projectPath, standardIds);

  // Weighted average: Completeness 25%, Freshness 25%, Consistency 30%, Coverage 20%
  const score = weightedAverage([
    [completeness.score, 0.25],
    [freshness.score, 0.25],
    [consistency.score, 0.30],
    [coverage.score, 0.20]
  ]);

  return {
    score,
    mode,
    dimensions: {
      completeness,
      freshness,
      consistency,
      coverage
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Save score snapshot to .uds/health-scores/
 * @param {string} projectPath
 * @param {object} scoreResult
 */
export function saveScoreSnapshot(projectPath, scoreResult) {
  const scoresDir = join(projectPath, '.uds', 'health-scores');
  mkdirSync(scoresDir, { recursive: true });

  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filePath = join(scoresDir, `${date}.json`);
  writeFileSync(filePath, JSON.stringify(scoreResult, null, 2));
}

/**
 * Load trend from historical snapshots
 * @param {string} projectPath
 * @returns {{ entries: object[], change: number, direction: string, degraded: boolean }}
 */
export function loadTrend(projectPath) {
  const scoresDir = join(projectPath, '.uds', 'health-scores');

  if (!existsSync(scoresDir)) {
    return { entries: [], change: 0, direction: 'stable', degraded: false };
  }

  const files = readdirSync(scoresDir)
    .filter(f => f.endsWith('.json'))
    .sort(); // Sort by filename (date)

  const entries = files.map(f => {
    try {
      const content = readFileSync(join(scoresDir, f), 'utf-8');
      const data = JSON.parse(content);
      return { date: f.replace('.json', ''), ...data };
    } catch {
      return null;
    }
  }).filter(Boolean);

  if (entries.length < 2) {
    return { entries, change: 0, direction: 'stable', degraded: false };
  }

  const latest = entries[entries.length - 1].score;
  const previous = entries[entries.length - 2].score;
  const change = latest - previous;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
  const degraded = change < -5;

  return { entries, change, direction, degraded };
}
