#!/usr/bin/env tsx
/**
 * Commit-msg Spec Reference Suggestion — WARNING ONLY (non-blocking)
 * 提交訊息 SPEC 引用建議（純警告，不阻擋）
 *
 * Cross-platform TypeScript implementation. Run with `tsx`.
 * Replaces check-commit-spec-reference.sh.
 *
 * For feat/fix commits, suggests adding `Refs: SPEC-XXX` if active specs exist.
 * Designed to run as commit-msg hook. Never exits with non-zero status.
 *
 * Usage: tsx scripts/check-commit-spec-reference.ts <commit-msg-file>
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

function findRepoRoot(): string {
  try {
    const out = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.trim() || process.cwd();
  } catch {
    return process.cwd();
  }
}

/**
 * Recursively collect SPEC-*.md files under a directory.
 * Mirrors `find "$SPECS_DIR" -name "SPEC-*.md"` behavior.
 */
function findSpecFiles(dir: string): string[] {
  const results: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let stats;
    try {
      stats = statSync(full);
    } catch {
      continue;
    }
    if (stats.isDirectory()) {
      results.push(...findSpecFiles(full));
    } else if (stats.isFile() && /^SPEC-.*\.md$/.test(entry)) {
      results.push(full);
    }
  }
  return results;
}

function main(): void {
  const commitMsgFile = process.argv[2];

  // Exit silently if no commit message file provided or not readable
  if (!commitMsgFile) {
    process.exit(0);
  }
  if (!existsSync(commitMsgFile)) {
    process.exit(0);
  }

  const commitMsg = readFileSync(commitMsgFile, 'utf8');
  const firstLine = commitMsg.split(/\r?\n/, 1)[0] ?? '';

  // Detect feat/fix commits (English or Traditional Chinese types).
  // Original: grep -iE "^(feat|fix|功能|修正)"
  if (!/^(feat|fix|功能|修正)/i.test(firstLine)) {
    process.exit(0);
  }

  // Skip if Refs: already present anywhere in the message.
  // Original: grep -iE "^Refs:" (multiline)
  const refsRegex = /^Refs:/im;
  if (refsRegex.test(commitMsg)) {
    process.exit(0);
  }

  const repoRoot = findRepoRoot();
  const specsDir = join(repoRoot, 'docs', 'specs');
  if (!existsSync(specsDir)) {
    process.exit(0);
  }

  const activeSpecs = findSpecFiles(specsDir);
  if (activeSpecs.length === 0) {
    process.exit(0);
  }

  const specIds: string[] = [];
  for (const spec of activeSpecs) {
    const specId = basename(spec, '.md');

    // Read first matching `status:` line at column 0
    let status = '';
    try {
      const content = readFileSync(spec, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        if (line.startsWith('status:')) {
          // Equivalent to `awk '{print $2}'` — second whitespace-delimited token.
          const tokens = line.split(/\s+/);
          status = tokens[1] ?? '';
          break;
        }
      }
    } catch {
      // Treat as not Archived
      status = '';
    }

    if (status !== 'Archived' && status !== 'archived') {
      specIds.push(specId);
    }
  }

  if (specIds.length === 0) {
    process.exit(0);
  }

  process.stdout.write('\n');
  process.stdout.write(
    '[Spec Tracking] 💡 This appears to be a feat/fix commit with active specs:\n',
  );
  for (const id of specIds) {
    process.stdout.write(`  → ${id}\n`);
  }
  process.stdout.write('\n');
  process.stdout.write('Consider adding to your commit message footer:\n');
  process.stdout.write('  Refs: <SPEC-ID>\n');
  process.stdout.write('\n');
  process.stdout.write('This is a suggestion — your commit will proceed as-is.\n');

  // Always exit 0 — never block commits
  process.exit(0);
}

main();
