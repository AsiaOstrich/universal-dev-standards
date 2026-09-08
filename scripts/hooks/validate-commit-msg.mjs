#!/usr/bin/env node
/**
 * UDS Hook: Commit Message Format Validator
 *
 * Validates commit messages against Conventional Commits format.
 * Exit code: 0 = valid, 1 = invalid
 *
 * Two callers, two contracts:
 *   - git hook / CLI:  node validate-commit-msg.mjs "feat(scope): msg"
 *                      or a raw message on stdin. Exit 1 when invalid.
 *   - Claude Code PreToolUse(Bash): the hook payload arrives as JSON on stdin.
 *                      Exit 2 blocks the tool call; anything that is not a
 *                      `git commit -m` is none of this hook's business.
 *
 * 🔴 It was registered on UserPromptSubmit and read stdin as a raw commit
 * message, so in an adopter's session it ran on EVERY prompt, failed to parse
 * the hook payload as Conventional Commits, and exited 1 every time. Found by
 * check-hook-delivery.ts, which executes each installed hook rather than
 * checking that the file exists.
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

// CLI mode.
function complain(msg) {
  console.error(`❌ Invalid commit message format: "${msg}"`);
  console.error(`   Expected: <type>(<scope>): <subject>`);
  console.error(`   Valid types: ${VALID_TYPES.join(', ')}`);
}

/**
 * The message of a `git commit -m ...`, or null when this is not one.
 *
 * The command must BE a git commit, not merely mention one: a substring test
 * pulled `fake"` out of `echo "git commit -m fake"`. Global options are allowed
 * between `git` and `commit` (`git -C /tmp/repo commit -m ...`), which a
 * flags-only pattern rejected. Both were caught by this function's own tests.
 */
export function commitMessageFrom(command) {
  if (typeof command !== 'string') return null;
  const segment = command
    .split(/&&|\|\||[;|\n]/)
    .find((s) => /^\s*git\b/.test(s) && /\bcommit\b/.test(s));
  if (!segment) return null;
  const quoted = segment.match(/-m\s+(["'])([\s\S]*?)\1/);
  if (quoted) return quoted[2];
  const bare = segment.match(/-m\s+(\S+)/);
  return bare ? bare[1] : null;   // -F, heredoc, or no -m: nothing to inspect
}

if (process.argv[1] && process.argv[1].endsWith('validate-commit-msg.mjs')) {
  const arg = process.argv[2];
  if (arg) {
    if (validateCommitMessage(arg)) process.exit(0);
    complain(arg);
    process.exit(1);
  } else {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      const raw = data.trim();
      if (!raw) process.exit(0);

      let payload = null;
      try { payload = JSON.parse(raw); } catch { /* not a hook payload */ }

      if (payload && typeof payload === 'object') {
        // Claude Code PreToolUse. Silence unless this really is a commit.
        const msg = commitMessageFrom(payload?.tool_input?.command);
        if (msg === null) process.exit(0);
        if (validateCommitMessage(msg)) process.exit(0);
        complain(msg);
        process.exit(2);          // 2 is what blocks a tool call
      }

      // Legacy: a raw commit message piped in by a git hook.
      if (validateCommitMessage(raw)) process.exit(0);
      complain(raw);
      process.exit(1);
    });
  }
}
