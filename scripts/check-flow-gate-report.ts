#!/usr/bin/env tsx
/**
 * Flow Gate Report Checker
 * Flow Gate Report 檢查器
 *
 * Cross-platform TypeScript implementation. Run with `tsx`.
 * Replaces check-flow-gate-report.sh.
 *
 * Verifies that flow_gate_report.json exists and has valid summary.status.
 * Part of UDS Release Readiness Gate (core/release-readiness-gate.md, Dimension 16).
 *
 * Exit codes:
 *   0 — report found, summary.status is "pass"
 *   1 — report missing, malformed, or summary.status is not "pass" (advisory)
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(__filename);
const REPO_ROOT = dirname(SCRIPT_DIR);
const REPORT_FILE = join(REPO_ROOT, 'flow_gate_report.json');

interface FlowGateSummary {
  total_flows?: number;
  status?: string;
  [key: string]: unknown;
}

interface FlowGateReport {
  summary?: FlowGateSummary;
  [key: string]: unknown;
}

function main(): void {
  if (!existsSync(REPORT_FILE)) {
    process.stdout.write('⚠ flow_gate_report.json not found at repo root.\n');
    process.stdout.write('  This file is generated after Gate 3 (Pre-UAT CI) completes.\n');
    process.stdout.write('  If no flows have ≥3 steps, create a minimal report:\n');
    process.stdout.write(
      '  {"generated_at":"...","commit":"...","flows":[],"summary":{"total_flows":0,"gate_0_complete":true,"gate_1_pr_coverage":true,"gate_3_ci_pass":true,"gate_4_uat_signoff":true,"status":"pass"}}\n',
    );
    process.exit(1);
  }

  let status = 'missing';
  let totalFlows: number | string = '?';

  try {
    const raw = readFileSync(REPORT_FILE, 'utf8');
    const report = JSON.parse(raw) as FlowGateReport;
    if (report.summary && typeof report.summary.status === 'string') {
      status = report.summary.status;
    }
    if (report.summary && typeof report.summary.total_flows === 'number') {
      totalFlows = report.summary.total_flows;
    } else if (report.summary && report.summary.total_flows !== undefined) {
      totalFlows = String(report.summary.total_flows);
    } else {
      totalFlows = 0;
    }
  } catch {
    status = 'parse_error';
  }

  switch (status) {
    case 'pass':
      process.stdout.write(
        `✓ flow_gate_report.json: summary.status=pass (${totalFlows} flows)\n`,
      );
      process.exit(0);
    // eslint-disable-next-line no-fallthrough
    case 'warn':
      process.stdout.write('⚠ flow_gate_report.json: summary.status=warn\n');
      process.stdout.write(
        '  Check individual flow gate_3 entries for non-passing flows.\n',
      );
      process.exit(1);
    // eslint-disable-next-line no-fallthrough
    case 'fail':
      process.stdout.write('✗ flow_gate_report.json: summary.status=fail\n');
      process.stdout.write('  Gate 3 CI has failing Decision Table scenarios.\n');
      process.stdout.write(
        '  Fix all terminal state coverage issues before Pre-UAT deployment.\n',
      );
      process.exit(1);
    // eslint-disable-next-line no-fallthrough
    case 'missing':
    case 'parse_error':
      process.stdout.write(
        '⚠ flow_gate_report.json is malformed or missing summary.status field.\n',
      );
      process.stdout.write(
        '  Expected schema: see core/flow-based-testing.md §RQM Integration\n',
      );
      process.exit(1);
    // eslint-disable-next-line no-fallthrough
    default:
      process.stdout.write(`⚠ flow_gate_report.json: unknown status '${status}'\n`);
      process.exit(1);
  }
}

main();
