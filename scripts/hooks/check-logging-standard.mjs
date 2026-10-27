#!/usr/bin/env node
/**
 * UDS Hook: Structured Logging Check
 *
 * Checks code for unstructured logging calls (console.log, console.warn, etc.)
 * and suggests using structured logging instead.
 * Exit code: 0 = pass, 2 = unstructured logging found
 *
 * Why 2 and not 1: Claude Code shows a PostToolUse hook's stderr to the model only on
 * exit 2. Any other non-zero code is a non-blocking hook error that the model never
 * sees, so the suggestion would reach nobody. (The Write has already happened, so
 * exit 2 here feeds the message back; it cannot undo anything.)
 *
 * Input, in order of preference:
 *   1. Claude Code PostToolUse payload on stdin: only the written text
 *      (`tool_input.content`, or `tool_input.new_string` for an Edit) is checked,
 *      never the other fields such as file_path.
 *   2. Raw code on stdin when stdin is not a JSON object.
 *   3. Code as argv[2].
 *
 * Usage: echo 'console.log("debug")' | node check-logging-standard.mjs
 *    or: node check-logging-standard.mjs 'console.log("debug")'
 *
 * Performance target: < 500ms
 *
 * @see docs/specs/SPEC-HOOKS-001-core-standard-hooks.md (REQ-3)
 */

const UNSTRUCTURED_PATTERNS = [
  /console\.log\(/,
  /console\.warn\(/,
  /console\.error\(/,
  /console\.info\(/,
  /console\.debug\(/,
];

/**
 * Check if code contains unstructured logging calls.
 * @param {string} code - The code to check
 * @returns {boolean} true if unstructured logging found
 */
export function hasUnstructuredLogging(code) {
  if (!code || typeof code !== 'string') return false;
  return UNSTRUCTURED_PATTERNS.some((p) => p.test(code));
}

/**
 * The code to check, from stdin text. A Claude Code payload yields only the written
 * text (null when it carries none); anything else is raw code.
 * @param {string} raw
 * @returns {string|null}
 */
export function codeFromInput(raw) {
  let payload;
  try { payload = JSON.parse(raw); } catch { return raw; }
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return raw;
  const text = payload.tool_input?.content ?? payload.tool_input?.new_string;
  return typeof text === 'string' ? text : null;
}

const FEEDBACK_EXIT_CODE = 2;

// CLI mode
if (process.argv[1] && process.argv[1].endsWith('check-logging-standard.mjs')) {
  const input = process.argv[2];
  if (input) {
    if (hasUnstructuredLogging(input)) {
      console.error('Unstructured logging detected. Use structured logging (e.g., JSON logger) instead.');
      process.exit(FEEDBACK_EXIT_CODE);
    } else {
      process.exit(0);
    }
  } else {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      const raw = data.trim();
      const code = raw ? codeFromInput(raw) : null;
      if (hasUnstructuredLogging(code)) {
        console.error('Unstructured logging detected. Use structured logging (e.g., JSON logger) instead.');
        process.exit(FEEDBACK_EXIT_CODE);
      } else {
        process.exit(0);
      }
    });
  }
}
