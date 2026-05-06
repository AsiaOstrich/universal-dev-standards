#!/usr/bin/env tsx
/**
 * Release Readiness Sign-off Checker
 * Release Readiness 簽核檢查器
 *
 * Cross-platform TypeScript implementation. Run with `tsx`.
 * Replaces check-release-readiness-signoff.sh.
 *
 * Verifies that a Release Readiness Sign-off document exists for the current release.
 * Part of UDS Release Readiness Gate (core/release-readiness-gate.md).
 *
 * Exit codes:
 *   0 — sign-off found and appears complete
 *   1 — sign-off missing or incomplete (advisory warning in pre-release-check.sh)
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(__filename);
const REPO_ROOT = dirname(SCRIPT_DIR);
const SIGNOFF_DIR = join(REPO_ROOT, '.release-readiness');

/** Recursively collect *.md files under a directory (mirrors `find -name '*.md' -type f`). */
function findMarkdownFiles(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
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
      out.push(...findMarkdownFiles(full));
    } else if (stats.isFile() && entry.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Version-aware compare similar to `sort -V`. Splits each string into a sequence
 * of numeric and non-numeric chunks; numeric chunks compare by value.
 */
function versionCompare(a: string, b: string): number {
  const splitter = /(\d+)|(\D+)/g;
  const ar = a.match(splitter) ?? [];
  const br = b.match(splitter) ?? [];
  const len = Math.max(ar.length, br.length);
  for (let i = 0; i < len; i += 1) {
    const ax = ar[i];
    const bx = br[i];
    if (ax === undefined) return -1;
    if (bx === undefined) return 1;
    const aNum = /^\d+$/.test(ax);
    const bNum = /^\d+$/.test(bx);
    if (aNum && bNum) {
      const an = Number(ax);
      const bn = Number(bx);
      if (an !== bn) return an - bn;
    } else if (aNum && !bNum) {
      return -1;
    } else if (!aNum && bNum) {
      return 1;
    } else if (ax !== bx) {
      return ax < bx ? -1 : 1;
    }
  }
  return 0;
}

function countMatches(content: string, pattern: RegExp): number {
  let count = 0;
  for (const line of content.split(/\r?\n/)) {
    if (pattern.test(line)) count += 1;
  }
  return count;
}

function main(): void {
  if (!existsSync(SIGNOFF_DIR)) {
    process.stdout.write('⚠ .release-readiness/ directory not found.\n');
    process.stdout.write(
      '  Create one sign-off per release: .release-readiness/<version>.md\n',
    );
    process.stdout.write(
      '  Template: core/release-readiness-gate.md §Release Readiness Sign-off Template\n',
    );
    process.exit(1);
  }

  const allMd = findMarkdownFiles(SIGNOFF_DIR);
  if (allMd.length === 0) {
    process.stdout.write('⚠ No sign-off file found in .release-readiness/\n');
    process.stdout.write('  Expected: .release-readiness/<version>.md\n');
    process.exit(1);
  }

  // Equivalent to `sort -V | tail -1`
  const sorted = [...allMd].sort(versionCompare);
  const latestSignoff = sorted[sorted.length - 1]!;

  const content = readFileSync(latestSignoff, 'utf8');

  // Count lines containing "| FAIL" (case-sensitive, mirrors grep -c)
  const tier1FailCount = countMatches(content, /\| FAIL/);
  // Count lines containing "[ ] **GO**"
  const uncheckedGo = countMatches(content, /\[ \] \*\*GO\*\*/);

  if (tier1FailCount > 0) {
    process.stdout.write(`⚠ Sign-off contains FAIL status: ${latestSignoff}\n`);
    process.stdout.write(
      '  FAIL gates must be resolved before production deployment.\n',
    );
    // Replicate `grep "| FAIL" "$latest_signoff" | head -5`
    const failLines: string[] = [];
    for (const line of content.split(/\r?\n/)) {
      if (line.includes('| FAIL')) {
        failLines.push(line);
        if (failLines.length === 5) break;
      }
    }
    for (const line of failLines) {
      process.stdout.write(`${line}\n`);
    }
    process.exit(1);
  }

  if (uncheckedGo > 0) {
    process.stdout.write(`⚠ Sign-off GO/NO-GO decision not yet made: ${latestSignoff}\n`);
    process.stdout.write('  Complete the Overall Decision section before deployment.\n');
    process.exit(1);
  }

  process.stdout.write(
    `✓ Release readiness sign-off found: ${basename(latestSignoff)}\n`,
  );
  process.exit(0);
}

main();
