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

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Used only when the project has no commit-message option file: the Conventional Commits set. Same list `uds simulate
 * -s commit-message` falls back to (FALLBACK_TYPES in cli/src/utils/commit-message-judge.js).
 */
const FALLBACK_TYPES = [
  'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert',
];

/**
 * The commit types the project allows: those listed by the commit-message option files installed in
 * `.standards/options/` (a file whose `meta.parent` is `commit-message`), or the fallback set when there are none.
 *
 * XSPEC-482 R12: this was a fixed list that lacked `security`, so `uds simulate` (which reads these same files) passed
 * `security(auth): rotate keys` and this hook refused it. The two now read one source. The hook has no YAML parser
 * to lean on (it runs in the adopter's project with no dependencies), so it reads the two things it needs line by line:
 * the `parent:` of the `meta:` block and the `- type:` entries under `types:`.
 *
 * @param {string} [root] - the project root; defaults to $CLAUDE_PROJECT_DIR or the working directory
 * @returns {string[]}
 */
export function allowedTypes(root = process.env.CLAUDE_PROJECT_DIR || process.cwd()) {
  const found = new Set();
  const optionsDir = join(root, '.standards', 'options');
  for (const dir of [optionsDir, join(optionsDir, 'commit-message')]) {
    if (!existsSync(dir)) continue;
    let names = [];
    try { names = readdirSync(dir).filter((n) => n.endsWith('.ai.yaml')); } catch { continue; }
    for (const name of names) {
      let text = '';
      try { text = readFileSync(join(dir, name), 'utf-8').replace(/\r\n/g, '\n'); } catch { continue; }
      if (!/^\s+parent:\s*["']?commit-message["']?\s*$/m.test(text)) continue;
      const lines = text.split('\n');
      const start = lines.findIndex((l) => /^types:\s*$/.test(l));
      if (start === -1) continue;
      for (let i = start + 1; i < lines.length; i++) {
        if (/^\S/.test(lines[i]) && !lines[i].startsWith('#')) break; // next top-level key
        const m = /^\s*-\s+type:\s*["']?([^"'#\s][^"'#]*?)["']?\s*(?:#.*)?$/.exec(lines[i]);
        if (m) found.add(m[1]);
      }
    }
  }
  return found.size > 0 ? [...found] : FALLBACK_TYPES;
}

const escapeRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Validate a commit message against Conventional Commits format.
 * @param {string} msg - The commit message to validate
 * @param {string[]} [types] - the allowed types (default: the project's, see allowedTypes)
 * @returns {boolean} true if valid
 */
export function validateCommitMessage(msg, types = allowedTypes()) {
  if (!msg || typeof msg !== 'string') return false;
  // `type(scope)!: subject`: scope and the breaking-change mark are optional, as in `uds simulate`.
  const pattern = new RegExp(`^(${types.map(escapeRe).join('|')})(\\(.+\\))?!?:\\s.+`, 'u');
  return pattern.test(msg.trim());
}

// CLI mode.
function complain(msg) {
  console.error(`❌ Invalid commit message format: "${msg}"`);
  console.error(`   Expected: <type>(<scope>): <subject>`);
  console.error(`   Valid types: ${allowedTypes().join(', ')}`);
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
