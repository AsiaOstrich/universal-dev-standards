#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * check-drift-override-clean.ts — anti-permanence gate for the
 * UDS_STANDARDS_DRIFT_OVERRIDE escape hatch (XSPEC-376 R3b).
 *
 * check-registry-completeness.ts's Check 3 (.standards/ drift) is a BLOCKING
 * gate. It has a one-shot override: setting UDS_STANDARDS_DRIFT_OVERRIDE
 * downgrades a block to a warning for that one process invocation. Nothing
 * about the env var itself prevents someone from baking a permanent
 * assignment into a version-controlled file — a CI workflow `env:` block, a
 * package.json script, a Dockerfile `ENV`, a Makefile, a committed shell rc
 * file — which would silently turn a "block, with a manual one-time
 * exception" gate into "never actually blocks." This repo has already
 * measured that exact failure shape once: "a documented risk with no clock
 * on it is just a polite delete key" (XSPEC-371). This script is the clock's
 * enforcement half — it does not detect an override that already ran (that
 * is by design unobservable after the fact, same as any other env var); it
 * detects the one thing that WOULD make the override stop being one-shot:
 * its own name checked into the repository.
 *
 * Scope: every git-tracked file (`git ls-files`), minus two fixed,
 * non-growing exclusions:
 *   1. This file and check-registry-completeness.ts — the two files that
 *      define/document the variable's name necessarily contain it. Excluding
 *      exactly these two is not the "known offenders" list the walk-and-
 *      exclude discipline warns against (XSPEC-376 task instructions): it
 *      is bounded at 2 by construction (the mechanism has exactly one
 *      producer and one consumer script) and does not grow as new files are
 *      added elsewhere in the repo.
 *   2. Files that are binary or unreadable as UTF-8 — a lockfile or image
 *      cannot meaningfully "activate" an env-var override by containing its
 *      name as a text match, and forcing UTF-8 decoding on binary content
 *      risks throwing rather than reporting.
 * Every other tracked file — including package.json, Dockerfiles, Makefiles,
 * .github/workflows/*, shell rc files, and any future file type — is
 * scanned. This is deliberate: enumerating "the kinds of files that might
 * contain an env assignment" is exactly the hardcoded-list failure mode this
 * check exists to avoid reproducing.
 *
 * Usage: tsx scripts/check-drift-override-clean.ts
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(__filename);
const ROOT_DIR = dirname(SCRIPT_DIR);

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const NC = '\x1b[0m';

const VARIABLE_NAME = 'UDS_STANDARDS_DRIFT_OVERRIDE';

// Match an ASSIGNMENT of the variable, not a bare mention of its name.
// `NAME=value` (shell, Dockerfile ENV, Makefile), `NAME: value` /
// `"NAME": value` (YAML/JSON `env:` blocks, package.json scripts) all match;
// prose like "the UDS_STANDARDS_DRIFT_OVERRIDE variable" or "(see
// UDS_STANDARDS_DRIFT_OVERRIDE)" does not, because no `=`/`:` immediately
// follows the name. This is deliberate: this file's own header and
// check-registry-completeness.ts's user-facing messages must be able to
// document the variable's existence without tripping this gate — only an
// actual activation should.
const ASSIGNMENT_PATTERN = new RegExp(`${VARIABLE_NAME}\\s*[:=]`);

// Fixed, non-growing self-reference exclusion — see file header point 1.
const SELF_REFERENCE_FILES = new Set([
  'scripts/check-drift-override-clean.ts',
  'scripts/check-registry-completeness.ts',
]);

function listTrackedFiles(): string[] {
  const output = execFileSync('git', ['ls-files'], { cwd: ROOT_DIR, encoding: 'utf8' });
  return output.split('\n').filter((line) => line.trim().length > 0);
}

/** Binary-content sniff: a NUL byte in the first 8KB means "not text". */
function looksBinary(filePath: string): boolean {
  let buf: Buffer;
  try {
    const fd = readFileSync(filePath);
    buf = fd.subarray(0, 8192);
  } catch {
    return true; // unreadable — treat as noise, not as a match candidate
  }
  return buf.includes(0);
}

function main(): void {
  process.stdout.write('\n');
  process.stdout.write('==========================================\n');
  process.stdout.write('  Drift Override Anti-Permanence Checker\n');
  process.stdout.write('  漂移逃生門防永久化檢查器\n');
  process.stdout.write('==========================================\n');
  process.stdout.write('\n');

  const allTracked = listTrackedFiles();
  let scanned = 0;
  let skippedSelf = 0;
  let skippedBinary = 0;
  const hits: string[] = [];

  for (const relPath of allTracked) {
    if (SELF_REFERENCE_FILES.has(relPath)) {
      skippedSelf += 1;
      continue;
    }

    const fullPath = join(ROOT_DIR, relPath);
    if (looksBinary(fullPath)) {
      skippedBinary += 1;
      continue;
    }

    scanned += 1;
    let content: string;
    try {
      content = readFileSync(fullPath, 'utf8');
    } catch {
      skippedBinary += 1;
      scanned -= 1;
      continue;
    }

    if (ASSIGNMENT_PATTERN.test(content)) {
      hits.push(relPath);
    }
  }

  process.stdout.write(
    `  Tracked files (denominator): ${allTracked.length}\n` +
      `  Scanned for an assignment of "${VARIABLE_NAME}": ${scanned}\n` +
      `  Skipped (self-reference, fixed at 2): ${skippedSelf}\n` +
      `  Skipped (binary/unreadable): ${skippedBinary}\n`,
  );
  process.stdout.write('\n');

  if (hits.length > 0) {
    process.stdout.write(
      `${RED}[BLOCKED]${NC} "${VARIABLE_NAME}" found checked into ${hits.length} tracked file(s):\n`,
    );
    for (const h of hits) {
      process.stdout.write(`    - ${h}\n`);
    }
    process.stdout.write('\n');
    process.stdout.write(
      `${YELLOW}A one-shot escape hatch that is checked into a tracked file is no longer\n` +
        'one-shot — every run through that file would carry the override forever.\n' +
        `Remove "${VARIABLE_NAME}" from the file(s) above; set it as a real\n` +
        `environment variable in your shell for a single invocation instead.${NC}\n`,
    );
    process.stdout.write('\n');
    process.exit(1);
  }

  process.stdout.write(`${GREEN}✓ "${VARIABLE_NAME}" is not checked into any tracked file${NC}\n`);
  process.stdout.write('\n');
  process.exit(0);
}

main();
