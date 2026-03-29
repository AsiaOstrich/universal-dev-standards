#!/usr/bin/env node
/**
 * Aggregate Standards Effectiveness Reports
 *
 * Reads multiple effectiveness report JSON files from a directory
 * and produces a summary of per-standard usage, compliance, and friction.
 *
 * Usage: node scripts/aggregate-effectiveness.mjs <reports-dir>
 *
 * @see specs/standards-effectiveness-schema.json
 * @see docs/specs/SPEC-SELFDIAG-001-standards-self-diagnosis.md (REQ-8)
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const reportsDir = process.argv[2];

if (!reportsDir) {
  console.error('Usage: node scripts/aggregate-effectiveness.mjs <reports-dir>');
  process.exit(1);
}

// Read all JSON files
const files = readdirSync(reportsDir).filter(f => f.endsWith('.json'));

if (files.length === 0) {
  console.error(`No JSON files found in ${reportsDir}`);
  process.exit(1);
}

const reports = files.map(f => {
  try {
    return JSON.parse(readFileSync(join(reportsDir, f), 'utf-8'));
  } catch {
    console.warn(`Warning: Could not parse ${f}`);
    return null;
  }
}).filter(Boolean);

console.log(`Aggregating ${reports.length} effectiveness reports...\n`);

// Aggregate per-standard metrics
const standardStats = {};

for (const report of reports) {
  for (const applied of (report.standards_applied || [])) {
    const id = applied.standard_id;
    if (!standardStats[id]) {
      standardStats[id] = {
        total_references: 0,
        times_followed: 0,
        times_violated: 0,
        total_violations: 0,
        friction_count: 0,
        friction_details: []
      };
    }

    const stats = standardStats[id];
    const eff = applied.effectiveness;

    if (eff.was_referenced) stats.total_references++;
    if (eff.was_followed) stats.times_followed++;
    if (!eff.was_followed && eff.was_referenced) stats.times_violated++;
    if (eff.violation_count) stats.total_violations += eff.violation_count;
    if (eff.friction_reported) {
      stats.friction_count++;
      if (eff.friction_detail) stats.friction_details.push(eff.friction_detail);
    }
  }
}

// Detect recurring unmatched issues
const issueCounts = {};
for (const report of reports) {
  for (const issue of (report.unmatched_issues || [])) {
    const key = issue.issue;
    if (!issueCounts[key]) {
      issueCounts[key] = { count: 0, category: issue.category, suggested: issue.suggested_standard };
    }
    issueCounts[key].count++;
  }
}

const suggestedNewStandards = Object.entries(issueCounts)
  .filter(([, v]) => v.count >= 3)
  .map(([issue, v]) => ({ issue, ...v }));

// Output
console.log('=== Per-Standard Summary ===\n');

for (const [id, stats] of Object.entries(standardStats).sort((a, b) => b[1].total_references - a[1].total_references)) {
  const complianceRate = stats.total_references > 0
    ? Math.round(stats.times_followed / stats.total_references * 100)
    : 0;
  const frictionRate = stats.total_references > 0
    ? Math.round(stats.friction_count / stats.total_references * 100)
    : 0;

  console.log(`${id}:`);
  console.log(`  Usage: ${stats.total_references} references`);
  console.log(`  Compliance: ${complianceRate}%`);
  console.log(`  Friction: ${frictionRate}% (${stats.friction_count} reports)`);
  if (stats.friction_details.length > 0) {
    console.log(`  Friction details:`);
    for (const detail of stats.friction_details.slice(0, 3)) {
      console.log(`    - ${detail}`);
    }
  }
  console.log();
}

if (suggestedNewStandards.length > 0) {
  console.log('=== Suggested New Standards ===\n');
  for (const s of suggestedNewStandards) {
    console.log(`  "${s.issue}" (appeared ${s.count}x, category: ${s.category})`);
    if (s.suggested) console.log(`    Suggested ID: ${s.suggested}`);
  }
  console.log();
}

// JSON summary
const summary = {
  total_reports: reports.length,
  standards: Object.entries(standardStats).map(([id, stats]) => ({
    id,
    usage_rate: stats.total_references,
    compliance_rate: stats.total_references > 0
      ? Math.round(stats.times_followed / stats.total_references * 100) : 0,
    friction_rate: stats.total_references > 0
      ? Math.round(stats.friction_count / stats.total_references * 100) : 0,
    total_violations: stats.total_violations
  })),
  suggested_new_standards: suggestedNewStandards
};

console.log('=== JSON Summary ===');
console.log(JSON.stringify(summary, null, 2));
