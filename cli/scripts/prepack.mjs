#!/usr/bin/env node

/**
 * Prepack script - copies required files into cli/bundled/ for npm packaging
 * This script runs automatically before `npm pack` and `npm publish`
 */

import { existsSync, mkdirSync, cpSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_ROOT = join(__dirname, '..');
const REPO_ROOT = join(CLI_ROOT, '..');
const BUNDLED_DIR = join(CLI_ROOT, 'bundled');

// Directories to bundle
const BUNDLE_DIRS = [
  { src: 'ai', dest: 'ai' },
  { src: 'core', dest: 'core' },
  { src: 'locales', dest: 'locales' },
  { src: 'skills', dest: 'skills' },
  // 閘門範本。採用者拿到的是**可執行的檢查**，不是又一份散文標準——
  // 這個 repo 已經有 122 份純散文標準，而其中零份有機器閘門。
  { src: 'templates', dest: 'templates' },
  // 🔴 The hook scripts were NOT bundled until 2026-09-08: `npm pack` listed
  // exactly one file matching "hooks" (the installer itself). Adopters
  // installing from npm therefore copied zero hook scripts while
  // `uds init --with-hooks` reported success. Recursive, because a hook may
  // ship a directory beside it (turn-completion/ carries its locale packs).
  { src: 'scripts/hooks', dest: 'hooks' }
];

console.log('📦 Preparing bundled files for npm package...');

// Clean existing bundled directory
if (existsSync(BUNDLED_DIR)) {
  rmSync(BUNDLED_DIR, { recursive: true });
}

// Create bundled directory
mkdirSync(BUNDLED_DIR, { recursive: true });

// Copy directories
for (const { src, dest } of BUNDLE_DIRS) {
  const srcPath = join(REPO_ROOT, src);
  const destPath = join(BUNDLED_DIR, dest);

  if (existsSync(srcPath)) {
    cpSync(srcPath, destPath, { recursive: true });
    console.log(`  ✓ Bundled ${src}/`);
  } else {
    console.warn(`  ⚠ Source not found: ${src}/`);
  }
}

console.log('✅ Bundled files ready');
