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
  { src: 'core', dest: 'core' },
  { src: 'locales', dest: 'locales' },
  { src: 'skills', dest: 'skills' }
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
