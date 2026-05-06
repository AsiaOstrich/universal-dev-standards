#!/usr/bin/env node
//
// UDS Git Hooks Installer (cross-platform Node.js ESM)
// 安裝 Git Hooks 腳本（跨平台 Node.js ESM 版本）
//
// Run once after cloning to activate UDS pre-commit checks:
//   node scripts/install-hooks.mjs
//
// What it does:
//   Configures git to use .githooks/ as the hooks directory.
//   All hooks in .githooks/ are tracked in version control.
//
// Uninstall:
//   git config --unset core.hooksPath
//
// NOTE: This is the cross-platform equivalent of install-hooks.sh.
// It is recommended over the .sh script for Windows environments.
//

import { readdirSync, chmodSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ── ANSI colours (no external dependency) ──────────────────────────────────
const GREEN  = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const NC     = '\x1b[0m';

// ── Paths ───────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(__filename);
const ROOT_DIR   = dirname(SCRIPT_DIR);
const HOOKS_DIR  = join(ROOT_DIR, '.githooks');

console.log('');
console.log('==========================================');
console.log('  UDS Git Hooks Installer');
console.log('  Git Hooks 安裝程式');
console.log('==========================================');
console.log('');

// ── Verify .githooks exists ─────────────────────────────────────────────────
if (!existsSync(HOOKS_DIR)) {
  console.error(`Error: .githooks/ directory not found at ${HOOKS_DIR}`);
  process.exit(1);
}

// ── Set hooksPath via git config ─────────────────────────────────────────────
try {
  execSync(`git -C "${ROOT_DIR}" config core.hooksPath .githooks`, { stdio: 'inherit' });
  console.log(`  ${GREEN}[OK]${NC} git config core.hooksPath → .githooks/`);
} catch (err) {
  console.error(`Error: Failed to set git hooksPath — ${err.message}`);
  process.exit(1);
}

// ── chmod +x for all hooks (skip on Windows) ────────────────────────────────
if (process.platform !== 'win32') {
  try {
    const entries = readdirSync(HOOKS_DIR);
    for (const entry of entries) {
      const hookPath = join(HOOKS_DIR, entry);
      if (statSync(hookPath).isFile()) {
        chmodSync(hookPath, 0o755);
      }
    }
    console.log(`  ${GREEN}[OK]${NC} chmod +x .githooks/*`);
  } catch (err) {
    console.log(`  ${YELLOW}[WARN]${NC} chmod failed: ${err.message}`);
  }
} else {
  console.log(`  ${YELLOW}[NOTE]${NC} Windows detected — skipping chmod (not required)`);
}

// ── List installed hooks ─────────────────────────────────────────────────────
console.log('');
console.log('Installed hooks:');
try {
  const entries = readdirSync(HOOKS_DIR);
  let hookCount = 0;
  for (const entry of entries) {
    const hookPath = join(HOOKS_DIR, entry);
    if (statSync(hookPath).isFile()) {
      console.log(`  ${GREEN}✓${NC} ${entry}`);
      hookCount++;
    }
  }
  if (hookCount === 0) {
    console.log(`  ${YELLOW}(no hook files found in .githooks/)${NC}`);
  }
} catch (err) {
  console.log(`  ${YELLOW}[WARN]${NC} Could not list hooks: ${err.message}`);
}

// ── Uninstall hint ───────────────────────────────────────────────────────────
console.log('');
console.log(`${YELLOW}Note:${NC} Run \`git config --unset core.hooksPath\` to uninstall.`);
console.log('');
console.log('Done! | 完成！');
console.log('');
