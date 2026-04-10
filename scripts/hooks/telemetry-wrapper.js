#!/usr/bin/env node
/**
 * UDS Hook Telemetry Wrapper
 *
 * Records hook execution telemetry to .standards/telemetry.jsonl.
 * Format: {timestamp, standard_id, hook_type, result, duration_ms}
 *
 * If telemetryUpload=true and telemetryApiKey≠"" in .uds/config.json,
 * also uploads the result to the remote telemetry server (opt-in).
 *
 * @see docs/specs/SPEC-TELEMETRY-001-hook-telemetry.md (REQ-1)
 * @see docs/specs/SPEC-TELEMETRY-002-hook-upload.md
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

/**
 * Upload hook result to remote telemetry server (opt-in via .uds/config.json).
 * Silently fails — never blocks hook execution.
 *
 * @param {string} projectPath - Project root path
 * @param {{ standard_id: string, hook_type: string, exitCode: number, duration_ms: number }} entry
 * @returns {Promise<void>}
 */
export async function uploadTelemetry(projectPath, entry) {
  try {
    // Dynamic import to avoid blocking if CLI module not available in hook context
    const { uploadHookTelemetry } = await import('../../cli/src/utils/telemetry-uploader.js');
    await uploadHookTelemetry(projectPath, entry);
  } catch {
    // Silently ignore upload failures (AC-4: never block hook)
  }
}
