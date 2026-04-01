/**
 * UDS Report Command
 *
 * Analyzes telemetry.jsonl and produces a standard adoption report.
 *
 * @module commands/report
 * @see docs/specs/SPEC-TELEMETRY-001-hook-telemetry.md (REQ-2)
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const TELEMETRY_FILE = '.standards/telemetry.jsonl';

/**
 * Generate a telemetry report from telemetry.jsonl.
 * @param {string} projectPath
 * @returns {{ success: boolean, totalExecutions: number, noData?: boolean, standards?: Array }}
 */
export function generateReport(projectPath) {
  const telPath = join(projectPath, TELEMETRY_FILE);

  if (!existsSync(telPath)) {
    return { success: true, totalExecutions: 0, noData: true, standards: [] };
  }

  const content = readFileSync(telPath, 'utf-8').trim();
  if (!content) {
    return { success: true, totalExecutions: 0, noData: true, standards: [] };
  }

  const entries = content.split('\n').map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);

  if (entries.length === 0) {
    return { success: true, totalExecutions: 0, noData: true, standards: [] };
  }

  // Aggregate by standard_id
  const statsMap = {};
  for (const entry of entries) {
    const id = entry.standard_id;
    if (!statsMap[id]) {
      statsMap[id] = { id, executions: 0, passes: 0, totalDuration: 0 };
    }
    statsMap[id].executions++;
    if (entry.result === 'pass') statsMap[id].passes++;
    statsMap[id].totalDuration += (entry.duration_ms || 0);
  }

  const standards = Object.values(statsMap).map((s) => ({
    id: s.id,
    executions: s.executions,
    passRate: s.executions > 0 ? (s.passes / s.executions) * 100 : 0,
    avgDuration: s.executions > 0 ? Math.round(s.totalDuration / s.executions) : 0,
  })).sort((a, b) => b.executions - a.executions);

  return {
    success: true,
    totalExecutions: entries.length,
    standards,
  };
}
