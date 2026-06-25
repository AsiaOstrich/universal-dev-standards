#!/usr/bin/env node
/**
 * Hook Statistics Analyzer (SPEC-SELFDIAG-001 REQ-7, AC-11)
 *
 * Reads .uds/hook-stats.jsonl and produces a blind spot analysis report.
 *
 * Usage: node scripts/analyze-hook-stats.mjs [project-path]
 *
 * Note on "always-on" standards: the inject-standards.js hook skips the
 * always-on domain during keyword matching (those standards are injected on
 * every prompt unconditionally), so they NEVER appear in matched_standards.
 * They must therefore be excluded from "never matched" — otherwise the most
 * heavily-used standards (anti-hallucination, commit-message, ...) get
 * false-flagged as dead. See classifyNeverMatched().
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Normalize a standard reference to its bare id.
 * Mirrors scripts/hooks/inject-standards.js so manifest domain paths
 * (e.g. 'ai/standards/anti-hallucination.ai.yaml') and .standards/*.ai.yaml
 * basenames compare cleanly.
 * @param {string} ref
 * @returns {string}
 */
export function normalizeStandardId(ref) {
  return String(ref).replace(/.*\//, '').replace('.ai.yaml', '');
}

// Load all available standard IDs from .standards/
export function loadAllStandards(projectPath) {
  const stdDir = join(projectPath, '.standards');
  if (!existsSync(stdDir)) return [];
  return readdirSync(stdDir)
    .filter(f => f.endsWith('.ai.yaml'))
    .map(f => f.replace('.ai.yaml', ''));
}

/**
 * Load the always-on standard ids from .standards/manifest.json domains.
 * Always-on standards are injected on every prompt and never participate in
 * keyword matching, so they can never appear in matched_standards.
 * Returns a Set of normalized ids (empty if no manifest / no always-on domain).
 * @param {string} projectPath
 * @returns {Set<string>}
 */
export function loadAlwaysOn(projectPath) {
  for (const rel of [join('.standards', 'manifest.json'), 'manifest.json']) {
    const p = join(projectPath, rel);
    if (!existsSync(p)) continue;
    try {
      const manifest = JSON.parse(readFileSync(p, 'utf-8'));
      const list = (manifest.domains && manifest.domains['always-on']) || [];
      return new Set(list.map(normalizeStandardId));
    } catch {
      // malformed manifest → treat as no always-on info
      return new Set();
    }
  }
  return new Set();
}

/**
 * Classify installed standards that were never matched.
 * Always-on members are reported separately and EXCLUDED from dead candidates
 * (they are always injected, so "never matched" is expected, not a defect).
 * @param {string[]} allStandards - installed standard ids
 * @param {Set<string>} matchedSet - ids seen in matched_standards
 * @param {Set<string>} alwaysOn - always-on standard ids
 * @returns {{ deadCandidates: string[], alwaysOnNeverMatched: string[] }}
 */
export function classifyNeverMatched(allStandards, matchedSet, alwaysOn) {
  const neverMatched = allStandards.filter(s => !matchedSet.has(s));
  return {
    deadCandidates: neverMatched.filter(s => !alwaysOn.has(s)),
    alwaysOnNeverMatched: neverMatched.filter(s => alwaysOn.has(s)),
  };
}

function main() {
  const projectPath = process.argv[2] || join(__dirname, '..');
  const statsFile = join(projectPath, '.uds', 'hook-stats.jsonl');

  if (!existsSync(statsFile)) {
    console.log('No hook statistics found at', statsFile);
    console.log('Hook stats are recorded automatically when inject-standards.js runs.');
    console.log('Use Claude Code for a while, then re-run this script.');
    process.exit(0);
  }

  const content = readFileSync(statsFile, 'utf-8').trim();
  const entries = content.split('\n').map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);

  if (entries.length < 10) {
    console.log(`Only ${entries.length} entries found. Need at least 10 for meaningful analysis.`);
    process.exit(0);
  }

  const allStandards = loadAllStandards(projectPath);
  const alwaysOn = loadAlwaysOn(projectPath);

  // Aggregate
  const matchCounts = {};
  let zeroMatchCount = 0;
  let totalPromptLength = 0;

  for (const entry of entries) {
    totalPromptLength += entry.prompt_length || 0;
    if (!entry.matched_standards || entry.matched_standards.length === 0) {
      zeroMatchCount++;
      continue;
    }
    for (const std of entry.matched_standards) {
      matchCounts[std] = (matchCounts[std] || 0) + 1;
    }
  }

  // Sort by count
  const topStandards = Object.entries(matchCounts)
    .map(([id, count]) => ({ id, count, rate: (count / entries.length * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count);

  // Classify never-matched (always-on excluded from dead candidates)
  const matchedSet = new Set(Object.keys(matchCounts));
  const { deadCandidates, alwaysOnNeverMatched } = classifyNeverMatched(allStandards, matchedSet, alwaysOn);

  // Over-matched (>5 standards in one trigger)
  const overMatched = entries.filter(e => (e.matched_standards || []).length > 5).length;

  // Output
  console.log(`Hook Statistics (${entries.length} triggers)`);
  console.log('─'.repeat(50));
  console.log();

  console.log('Most matched standards:');
  for (const s of topStandards.slice(0, 10)) {
    console.log(`  ${s.id.padEnd(40)} → ${s.count} 次 (${s.rate}%)`);
  }
  console.log();

  if (alwaysOnNeverMatched.length > 0) {
    console.log(`Always-on standards (injected every prompt, not keyword-matched — not dead): ${alwaysOnNeverMatched.length}`);
    for (const s of alwaysOnNeverMatched) {
      console.log(`  ✓ ${s}`);
    }
    console.log();
  }

  if (deadCandidates.length > 0) {
    console.log(`Dead-standard candidates (installed, matchable, never matched): ${deadCandidates.length}`);
    for (const s of deadCandidates) {
      console.log(`  ⚠️  ${s}`);
    }
    console.log();
  }

  console.log(`Zero-match prompts: ${zeroMatchCount} / ${entries.length} (${(zeroMatchCount / entries.length * 100).toFixed(1)}%)`);
  console.log(`Over-matched prompts (>5 standards): ${overMatched} (${(overMatched / entries.length * 100).toFixed(1)}%)`);
  console.log(`Average prompt length: ${Math.round(totalPromptLength / entries.length)} chars`);
  console.log();

  // Suggestions (only for genuine dead candidates — never for always-on)
  if (deadCandidates.length > 0) {
    console.log('Suggestions:');
    for (const s of deadCandidates.slice(0, 5)) {
      console.log(`  → Add trigger keywords for "${s}" in manifest.json domains`);
    }
    console.log();
  }

  if (zeroMatchCount / entries.length > 0.1) {
    console.log(`⚠️  High zero-match rate (${(zeroMatchCount / entries.length * 100).toFixed(1)}%).`);
    console.log('   Consider expanding trigger keywords in manifest.json domains.');
    console.log();
  }
}

// Only run when invoked directly (not when imported by tests).
if (process.argv[1] && process.argv[1].endsWith('analyze-hook-stats.mjs')) {
  main();
}
