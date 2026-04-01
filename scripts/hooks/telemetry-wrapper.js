#!/usr/bin/env node
/**
 * UDS Hook Telemetry Wrapper
 *
 * Records hook execution telemetry to .standards/telemetry.jsonl.
 * Format: {timestamp, standard_id, hook_type, result, duration_ms}
 *
 * @see docs/specs/SPEC-TELEMETRY-001-hook-telemetry.md (REQ-1)
 */

import { existsSync, readFileSync, appendFileSync, mkdirSync, statSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

export const TELEMETRY_FILE = '.standards/telemetry.jsonl';
const MAX_TELEMETRY_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Record a hook execution telemetry entry.
 * @param {string} projectPath - Project root path
 * @param {{ standard_id: string, hook_type: string, exitCode: number, duration_ms: number }} entry
 */
export function recordTelemetry(projectPath, entry) {
  try {
    const telPath = join(projectPath, TELEMETRY_FILE);
    const dir = dirname(telPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const record = {
      timestamp: new Date().toISOString(),
      standard_id: entry.standard_id,
      hook_type: entry.hook_type,
      result: entry.exitCode === 0 ? 'pass' : 'fail',
      duration_ms: entry.duration_ms,
    };

    // Rotation: truncate if exceeding 2MB
    if (existsSync(telPath)) {
      try {
        const size = statSync(telPath).size;
        if (size > MAX_TELEMETRY_SIZE) {
          const content = readFileSync(telPath, 'utf-8');
          const lines = content.trim().split('\n');
          const keepLines = lines.slice(Math.floor(lines.length / 2));
          writeFileSync(telPath, keepLines.join('\n') + '\n');
        }
      } catch { /* ignore rotation errors */ }
    }

    appendFileSync(telPath, JSON.stringify(record) + '\n');
  } catch {
    // Silently ignore write failures
  }
}
