/**
 * Hook Statistics - Context-aware loading learning loop
 *
 * Records and analyzes trigger statistics from inject-standards.js hook.
 * Privacy: never records full prompt content or file paths.
 *
 * @module utils/hook-stats
 * @see docs/specs/SPEC-SELFDIAG-001-standards-self-diagnosis.md (REQ-7)
 */

import { existsSync, readFileSync, appendFileSync, mkdirSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const STATS_FILE = '.uds/hook-stats.jsonl';
const CONFIG_FILE = '.uds/config.json';
const MAX_STATS_SIZE = 1024 * 1024; // 1MB

/**
 * Check if hook stats recording is enabled.
 * Default: OFF (opt-in). Set hookStats: true in .uds/config.json to enable.
 * @param {string} projectPath
 * @returns {boolean}
 */
export function shouldRecordStats(projectPath) {
  const configPath = join(projectPath, CONFIG_FILE);
  try {
    if (!existsSync(configPath)) return false; // Default OFF
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    return config.hookStats === true; // Explicit opt-in required
  } catch {
    return false; // Default OFF on config read errors
  }
}

/**
 * Append a hook trigger stat entry. Silently fails on any error.
 * @param {string} projectPath
 * @param {{ matched_standards: string[], matched_count: number, total_available: number, prompt_length?: number, hook_type?: string }} entry
 */
export function appendHookStat(projectPath, entry) {
  try {
    const statsPath = join(projectPath, STATS_FILE);
    const dir = join(projectPath, '.uds');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const record = {
      timestamp: new Date().toISOString(),
      matched_standards: entry.matched_standards,
      matched_count: entry.matched_count,
      total_available: entry.total_available
    };

    // Include prompt_length if provided (but never prompt content)
    if (entry.prompt_length !== undefined) {
      record.prompt_length = entry.prompt_length;
    }

    // Include hook_type if provided (commit-msg | security | logging)
    if (entry.hook_type !== undefined) {
      record.hook_type = entry.hook_type;
    }

    // Truncate if file exceeds 1MB (keep last half)
    if (existsSync(statsPath)) {
      try {
        const size = statSync(statsPath).size;
        if (size > MAX_STATS_SIZE) {
          const content = readFileSync(statsPath, 'utf-8');
          const lines = content.trim().split('\n');
          const keepLines = lines.slice(Math.floor(lines.length / 2));
          writeFileSync(statsPath, keepLines.join('\n') + '\n');
        }
      } catch { /* ignore truncation errors */ }
    }

    appendFileSync(statsPath, JSON.stringify(record) + '\n');
  } catch {
    // Silently ignore write failures (AC-10)
  }
}

/**
 * Analyze hook statistics for trigger blind spots
 * @param {string} projectPath
 * @param {{ allStandards?: string[] }} options
 * @returns {{ total_triggers: number, top_standards: Array, zero_match_count: number, zero_match_rate: number, never_matched: string[] }}
 */
export function analyzeHookStats(projectPath, options = {}) {
  const statsPath = join(projectPath, STATS_FILE);

  if (!existsSync(statsPath)) {
    return {
      total_triggers: 0,
      top_standards: [],
      zero_match_count: 0,
      zero_match_rate: 0,
      never_matched: []
    };
  }

  const content = readFileSync(statsPath, 'utf-8').trim();
  if (!content) {
    return {
      total_triggers: 0,
      top_standards: [],
      zero_match_count: 0,
      zero_match_rate: 0,
      never_matched: []
    };
  }

  const entries = content.split('\n').map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);

  const totalTriggers = entries.length;

  // Count standard matches
  const matchCounts = {};
  let zeroMatchCount = 0;

  for (const entry of entries) {
    if (!entry.matched_standards || entry.matched_standards.length === 0) {
      zeroMatchCount++;
      continue;
    }
    for (const std of entry.matched_standards) {
      matchCounts[std] = (matchCounts[std] || 0) + 1;
    }
  }

  // Top standards sorted by count
  const topStandards = Object.entries(matchCounts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);

  // Never matched (from provided allStandards list)
  const matchedSet = new Set(Object.keys(matchCounts));
  const neverMatched = (options.allStandards || [])
    .filter(s => !matchedSet.has(s));

  return {
    total_triggers: totalTriggers,
    top_standards: topStandards,
    zero_match_count: zeroMatchCount,
    zero_match_rate: totalTriggers > 0 ? zeroMatchCount / totalTriggers : 0,
    never_matched: neverMatched
  };
}
