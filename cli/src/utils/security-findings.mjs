/**
 * Security-review findings check: the field contract of the /security skill's report.
 * 安全審查發現報告的欄位契約檢查（/security 技能的結構化輸出）。
 * // implements DEC-104-L2
 * // implements XSPEC-432 R2
 *
 * ── What this is ────────────────────────────────────────────────────────────
 * The /security skill hands every candidate finding to a verifier that did not
 * find it, and records the result as exactly one of three statuses:
 * confirmed, unverified or refuted. This file is the deterministic check that
 * the written report keeps the contract of those statuses. The one rule it
 * exists for: ONLY a confirmed finding may carry a severity (SF-002). A finding
 * that is still waiting for a verifier, or that a verifier refuted, is not
 * ranked.
 *
 * ── What this is not ────────────────────────────────────────────────────────
 * It judges the SHAPE of the report. It does not judge whether a finding is
 * true, and it cannot tell whether a verifier really started with no knowledge
 * of the discovery: SF-004 compares the two names the report gives and nothing
 * else. A report that names a different verifier and ran the same agent twice
 * passes. The check is evidence about the report, not a substitute for the
 * verifier.
 *
 * ── Where it lives ──────────────────────────────────────────────────────────
 * Under cli/src/ so the npm package ships it: `uds security check-findings`
 * (cli/src/commands/security-findings.js) is its only front door, and the skill
 * names that command. Self-contained on purpose (node builtins only) so a
 * mutation test can copy this one file and edit its text.
 *
 * Exit codes: 0 the report keeps the contract, 1 it does not, 2 the check could
 * not decide (the file cannot be read or is not a JSON report). 2 is NOT a pass.
 */

import { readFileSync } from 'node:fs';

export const STATUSES = ['confirmed', 'unverified', 'refuted'];
export const SEVERITIES = ['critical', 'high', 'medium', 'low'];
export const COMPLETIONS = ['all_verified', 'incomplete'];

const REPORT_KEYS = ['scope', 'completion', 'incomplete_reason', 'findings'];
const FINDING_KEYS = [
  'id', 'title', 'location', 'discovered_by', 'status',
  'severity', 'verified_by', 'evidence', 'remediation', 'pending_reason', 'refutation_reason'
];

const present = (v) => v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '');

/**
 * @param {unknown} report parsed JSON
 * @returns {{ code: string, finding: string|null, message: string }[]} violations, empty when the contract holds
 */
export function checkReport(report) {
  const violations = [];
  const add = (code, finding, message) => violations.push({ code, finding, message });

  if (report === null || typeof report !== 'object' || Array.isArray(report)) {
    add('SF-000', null, 'the report must be a JSON object');
    return violations;
  }
  for (const key of Object.keys(report)) {
    if (!REPORT_KEYS.includes(key)) add('SF-007', null, `unknown report field "${key}"`);
  }
  if (!Array.isArray(report.findings)) {
    add('SF-000', null, 'the report needs a "findings" array (it may be empty)');
    return violations;
  }

  const seen = new Set();
  report.findings.forEach((f, i) => {
    const label = f && typeof f === 'object' && present(f.id) ? String(f.id) : `#${i + 1}`;
    if (f === null || typeof f !== 'object' || Array.isArray(f)) {
      add('SF-000', label, 'a finding must be a JSON object');
      return;
    }
    for (const key of Object.keys(f)) {
      if (!FINDING_KEYS.includes(key)) add('SF-007', label, `unknown field "${key}"`);
    }
    for (const key of ['id', 'title', 'location', 'discovered_by']) {
      if (!present(f[key])) add('SF-000', label, `missing "${key}"`);
    }
    if (present(f.id)) {
      if (seen.has(f.id)) add('SF-009', label, `id "${f.id}" is used twice`);
      seen.add(f.id);
    }

    if (!STATUSES.includes(f.status)) {
      add('SF-001', label, `status must be one of ${STATUSES.join(', ')} (got ${JSON.stringify(f.status)})`);
      return;
    }

    // SF-002: the rule this check exists for. Only a confirmed finding carries a severity.
    if (f.status !== 'confirmed' && present(f.severity)) {
      add('SF-002', label, `a finding with status "${f.status}" must not carry a severity (only confirmed findings are ranked)`);
    }
    if (f.status === 'confirmed') {
      if (!SEVERITIES.includes(f.severity)) {
        add('SF-003', label, `a confirmed finding needs a severity of ${SEVERITIES.join(', ')} (got ${JSON.stringify(f.severity)})`);
      }
      if (!present(f.evidence)) add('SF-003', label, 'a confirmed finding needs "evidence"');
    }

    if (f.status === 'confirmed' || f.status === 'refuted') {
      if (!present(f.verified_by)) {
        add('SF-004', label, `a ${f.status} finding needs "verified_by"`);
      } else if (f.verified_by === f.discovered_by) {
        add('SF-004', label, `"verified_by" is the same as "discovered_by" (${f.verified_by}): the one who found it did not verify it`);
      }
    }
    if (f.status === 'refuted') {
      if (!present(f.refutation_reason)) add('SF-005', label, 'a refuted finding needs "refutation_reason"');
      if (present(f.remediation)) add('SF-005', label, 'a refuted finding must not carry "remediation"');
    }
    if (f.status === 'unverified' && !present(f.pending_reason)) {
      add('SF-006', label, 'an unverified finding needs "pending_reason"');
    }
  });

  // SF-008: the two ways a review may end
  if (!COMPLETIONS.includes(report.completion)) {
    add('SF-008', null, `"completion" must be ${COMPLETIONS.join(' or ')} (got ${JSON.stringify(report.completion)})`);
  } else if (report.completion === 'all_verified') {
    const waiting = report.findings.filter(f => f && f.status === 'unverified');
    if (waiting.length > 0) {
      add('SF-008', null, `"all_verified" with ${waiting.length} finding(s) still unverified: say "incomplete" and why`);
    }
    if (present(report.incomplete_reason)) add('SF-008', null, '"incomplete_reason" belongs to "incomplete" only');
  } else if (!present(report.incomplete_reason)) {
    add('SF-008', null, '"incomplete" needs "incomplete_reason"');
  }
  return violations;
}

/** Confirmed findings by severity, then id; the other two statuses are listed apart and never ranked. */
export function rankReport(report) {
  const order = (f) => SEVERITIES.indexOf(f.severity);
  const confirmed = report.findings.filter(f => f.status === 'confirmed')
    .sort((a, b) => order(a) - order(b) || String(a.id).localeCompare(String(b.id)));
  return {
    ranked: confirmed,
    unverified: report.findings.filter(f => f.status === 'unverified'),
    refuted: report.findings.filter(f => f.status === 'refuted')
  };
}

/**
 * @param {string[]} argv  [file] — a path, or "-" for standard input
 * @param {{ log: Function, err: Function }} io
 * @param {() => string} readStdin
 * @returns {number} exit code
 */
export function main(argv, io = { log: console.log, err: console.error }, readStdin = () => readFileSync(0, 'utf-8')) {
  const source = argv[0];
  if (!source) {
    io.err('[security-findings] CANNOT DECIDE: give a report file, or "-" to read standard input. Exit 2 is not a pass.');
    return 2;
  }
  let text;
  try {
    text = source === '-' ? readStdin() : readFileSync(source, 'utf-8');
  } catch (e) {
    io.err(`[security-findings] CANNOT DECIDE: cannot read ${source === '-' ? 'standard input' : source} (${e.code || e.message}). Exit 2 is not a pass.`);
    return 2;
  }
  let report;
  try {
    report = JSON.parse(text);
  } catch (e) {
    io.err(`[security-findings] CANNOT DECIDE: the report is not valid JSON (${e.message}). Exit 2 is not a pass.`);
    return 2;
  }

  const violations = checkReport(report);
  if (violations.length > 0) {
    io.log(`[security-findings] ${violations.length} violation(s); this report is not ready to hand over:`);
    for (const v of violations) io.log(`  ${v.code}${v.finding ? ` ${v.finding}` : ''}: ${v.message}`);
    return 1;
  }

  const { ranked, unverified, refuted } = rankReport(report);
  io.log(`[security-findings] OK: ${report.findings.length} finding(s): ${ranked.length} confirmed, ${unverified.length} unverified, ${refuted.length} refuted; review ${report.completion}`);
  io.log('RANKED (confirmed only):');
  ranked.forEach((f, i) => io.log(`  ${i + 1}. [${f.severity}] ${f.id} ${f.title} (${f.location})`));
  if (ranked.length === 0) io.log('  (none)');
  if (unverified.length > 0) {
    io.log('UNVERIFIED (no severity; waiting for a verifier):');
    for (const f of unverified) io.log(`  ${f.id} ${f.title} — ${f.pending_reason}`);
  }
  if (refuted.length > 0) {
    io.log('REFUTED (kept so it is not raised again):');
    for (const f of refuted) io.log(`  ${f.id} ${f.title} — ${f.refutation_reason}`);
  }
  if (report.completion === 'incomplete') io.log(`INCOMPLETE: ${report.incomplete_reason}`);
  io.log('Scope of this check: the shape of the report. It does not judge whether a finding is true, nor whether a verifier started with no knowledge of the discovery (SF-004 compares names only).');
  return 0;
}
