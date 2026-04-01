#!/usr/bin/env node
/**
 * UDS Hook: Structured Logging Check
 *
 * Checks code for unstructured logging calls (console.log, console.warn, etc.)
 * and suggests using structured logging instead.
 * Exit code: 0 = pass, 1 = unstructured logging found
 *
 * Usage: echo 'console.log("debug")' | node check-logging-standard.js
 *    or: node check-logging-standard.js 'console.log("debug")'
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

// CLI mode
if (process.argv[1] && process.argv[1].endsWith('check-logging-standard.js')) {
  const input = process.argv[2];
  if (input) {
    if (hasUnstructuredLogging(input)) {
      console.error('⚠️ Unstructured logging detected. Use structured logging (e.g., JSON logger) instead.');
      process.exit(1);
    } else {
      process.exit(0);
    }
  } else {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      const code = data.trim();
      if (hasUnstructuredLogging(code)) {
        console.error('⚠️ Unstructured logging detected. Use structured logging (e.g., JSON logger) instead.');
        process.exit(1);
      } else {
        process.exit(0);
      }
    });
  }
}
