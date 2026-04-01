#!/usr/bin/env node
/**
 * UDS Hook: Dangerous Command Detection
 *
 * Detects potentially destructive shell commands and blocks execution.
 * Exit code: 0 = safe, 1 = dangerous
 *
 * Usage: echo "rm -rf /" | node check-dangerous-cmd.js
 *    or: node check-dangerous-cmd.js "rm -rf /"
 *
 * Performance target: < 500ms
 *
 * @see docs/specs/SPEC-HOOKS-001-core-standard-hooks.md (REQ-2)
 */

const DANGEROUS_PATTERNS = [
  /rm\s+-rf\s+\//,
  /mkfs\./,
  /dd\s+if=.*of=\/dev\//,
  /format\s+[a-zA-Z]:/,
  />\s*\/dev\/sda/,
  /chmod\s+-R\s+777\s+\//,
  /:()\{\s*:\|:&\s*\};:/,  // fork bomb
];

/**
 * Check if a command matches dangerous patterns.
 * @param {string} cmd - The shell command to check
 * @returns {boolean} true if dangerous
 */
export function isDangerousCommand(cmd) {
  if (!cmd || typeof cmd !== 'string') return false;
  return DANGEROUS_PATTERNS.some((p) => p.test(cmd));
}

// CLI mode
if (process.argv[1] && process.argv[1].endsWith('check-dangerous-cmd.js')) {
  const input = process.argv[2];
  if (input) {
    if (isDangerousCommand(input)) {
      console.error(`⚠️ Dangerous command detected: "${input}"`);
      process.exit(1);
    } else {
      process.exit(0);
    }
  } else {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      const cmd = data.trim();
      if (isDangerousCommand(cmd)) {
        console.error(`⚠️ Dangerous command detected: "${cmd}"`);
        process.exit(1);
      } else {
        process.exit(0);
      }
    });
  }
}
