#!/usr/bin/env node
/**
 * Hook Statistics Analyzer (SPEC-SELFDIAG-001 REQ-7, AC-11)
 *
 * Reads .uds/hook-stats.jsonl and produces a blind spot analysis report.
 *
 * Usage: node scripts/analyze-hook-stats.mjs [project-path]
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectPath = process.argv[2] || join(__dirname, '..');
const statsFile = join(projectPath, '.uds', 'hook-stats.jsonl');

// Load all available standard IDs from .standards/
function loadAllStandards() {
  const stdDir = join(projectPath, '.standards');
  if (!existsSync(stdDir)) return [];
  return readdirSync(stdDir)
    .filter(f => f.endsWith('.ai.yaml'))
    .map(f => f.replace('.ai.yaml', ''));
}

function main() {
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

  const allStandards = loadAllStandards();

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

  // Never matched
  const matchedSet = new Set(Object.keys(matchCounts));
  const neverMatched = allStandards.filter(s => !matchedSet.has(s));

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

  if (neverMatched.length > 0) {
    console.log(`Never matched standards (${neverMatched.length}):`);
    for (const s of neverMatched) {
      console.log(`  ⚠️  ${s}`);
    }
    console.log();
  }

  console.log(`Zero-match prompts: ${zeroMatchCount} / ${entries.length} (${(zeroMatchCount / entries.length * 100).toFixed(1)}%)`);
  console.log(`Over-matched prompts (>5 standards): ${overMatched} (${(overMatched / entries.length * 100).toFixed(1)}%)`);
  console.log(`Average prompt length: ${Math.round(totalPromptLength / entries.length)} chars`);
  console.log();

  // Suggestions
  if (neverMatched.length > 0) {
    console.log('Suggestions:');
    for (const s of neverMatched.slice(0, 5)) {
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

main();
