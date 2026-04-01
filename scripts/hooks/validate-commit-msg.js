#!/usr/bin/env node
/**
 * UDS Hook: Commit Message Format Validator
 *
 * Validates commit messages against Conventional Commits format.
 * Exit code: 0 = valid, 1 = invalid
 *
 * Usage: echo "feat(scope): message" | node validate-commit-msg.js
 *    or: node validate-commit-msg.js "feat(scope): message"
 *
 * Performance target: < 500ms
 *
 * @see docs/specs/SPEC-HOOKS-001-core-standard-hooks.md (REQ-1)
 */

const VALID_TYPES = [
  'feat', 'fix', 'docs', 'chore', 'test',
  'refactor', 'style', 'perf', 'ci', 'build', 'revert',
];

const COMMIT_PATTERN = new RegExp(
  `^(${VALID_TYPES.join('|')})(\\(.+\\))?:\\s.+`
);

/**
 * Validate a commit message against Conventional Commits format.
 * @param {string} msg - The commit message to validate
 * @returns {boolean} true if valid
 */
export function validateCommitMessage(msg) {
  if (!msg || typeof msg !== 'string') return false;
  return COMMIT_PATTERN.test(msg.trim());
}

// CLI mode: read from argv or stdin
if (process.argv[1] && process.argv[1].endsWith('validate-commit-msg.js')) {
  const input = process.argv[2];
  if (input) {
    if (validateCommitMessage(input)) {
      process.exit(0);
    } else {
      console.error(`❌ Invalid commit message format: "${input}"`);
      console.error(`   Expected: <type>(<scope>): <subject>`);
      console.error(`   Valid types: ${VALID_TYPES.join(', ')}`);
      process.exit(1);
    }
  } else {
    // Read from stdin
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      const msg = data.trim();
      if (validateCommitMessage(msg)) {
        process.exit(0);
      } else {
        console.error(`❌ Invalid commit message format: "${msg}"`);
        console.error(`   Expected: <type>(<scope>): <subject>`);
        console.error(`   Valid types: ${VALID_TYPES.join(', ')}`);
        process.exit(1);
      }
    });
  }
}
