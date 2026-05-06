#!/usr/bin/env node
//
// UDS Pre-Commit Hook (cross-platform Node.js implementation)
// 預提交鉤子（跨平台 Node.js 版本）
//
// Triggered automatically on every `git commit` via .githooks/pre-commit shim.
// Run `node scripts/install-hooks.mjs` once after cloning to activate.
//
// What this hook does:
//   1. If any core/*.md standards are staged → warn about outdated translations
//   2. Never blocks the commit (translation OUTDATED is advisory, not a hard gate)
//
// Hard gates (exit 1) live in pre-release-check.sh, not here.
//
// NOTE: This is the cross-platform equivalent of the legacy bash hook body.
// The .githooks/pre-commit file is a thin POSIX sh shim that exec's this script.
//

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const IS_WINDOWS = process.platform === 'win32';

// ── ANSI colours (no external dependency) ──────────────────────────────────
const YELLOW = '\x1b[1;33m';
const CYAN   = '\x1b[0;36m';
const NC     = '\x1b[0m';

// ── Paths ───────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(__filename);
const ROOT_DIR   = dirname(SCRIPT_DIR);

/**
 * Build a platform-aware shell command for a .sh script.
 * On Windows, falls back to the .ps1 counterpart if it exists.
 * Returns null when no runnable variant is found.
 * Style mirrors bump-version.mjs::buildCmd() for consistency.
 */
function buildCmd(shPath) {
  if (!IS_WINDOWS) return existsSync(shPath) ? `bash "${shPath}"` : null;
  const ps1Path = shPath.replace(/\.sh$/, '.ps1');
  return existsSync(ps1Path)
    ? `powershell -ExecutionPolicy Bypass -File "${ps1Path}"`
    : null;
}

// ── Step 1: Get staged files ────────────────────────────────────────────────
let stagedFiles = '';
try {
  stagedFiles = execSync('git diff --cached --name-only', {
    encoding: 'utf8',
    cwd: ROOT_DIR,
  });
} catch {
  // Not a git repo, or git unavailable — advisory hook, just skip.
  process.exit(0);
}

// ── Step 2: Filter core/*.md ────────────────────────────────────────────────
const stagedCore = stagedFiles
  .split('\n')
  .map((f) => f.trim())
  .filter((f) => /^core\/.*\.md$/.test(f));

if (stagedCore.length === 0) {
  // Nothing in core/ — skip translation check entirely.
  process.exit(0);
}

console.log('');
console.log(`${CYAN}[pre-commit] Core standards modified — checking translations...${NC}`);
console.log(`${CYAN}Staged files:${NC}`);
for (const f of stagedCore) console.log(`  ${f}`);
console.log('');

// ── Step 3: Run check-translation-sync (platform-aware) ─────────────────────
const shScript = join(ROOT_DIR, 'scripts', 'check-translation-sync.sh');
const cmd = buildCmd(shScript);

if (!cmd) {
  // No runnable variant on this platform — advisory only, skip gracefully.
  process.exit(0);
}

let syncOutput = '';
try {
  syncOutput = execSync(cmd, { encoding: 'utf8', cwd: ROOT_DIR });
} catch (e) {
  // check-translation-sync may exit non-zero when reporting outdated entries.
  // Treat any error as advisory: capture whatever output we got and continue.
  syncOutput =
    (e.stdout ? e.stdout.toString() : '') +
    (e.stderr ? e.stderr.toString() : '');
}

// ── Step 4: Show OUTDATED lines (advisory) ──────────────────────────────────
// Match lines where label is followed by a file path (not legend/summary lines).
const outdatedLines = syncOutput
  .split('\n')
  .filter((line) => /\[(MAJOR|MINOR|PATCH)\]\s+\S+\//.test(line));

if (outdatedLines.length > 0) {
  console.log(`${YELLOW}⚠️  Outdated translations detected for modified standards:${NC}`);
  for (const line of outdatedLines) console.log(`  ${line}`);
  console.log('');
  console.log(`${YELLOW}  Tip: run \`bash scripts/check-translation-sync.sh\` (or .ps1 on Windows) for full details.${NC}`);
  console.log(`${YELLOW}  Commit proceeds — update translations when convenient.${NC}`);
  console.log('');
}

// Always exit 0 (advisory hook).
process.exit(0);
