#!/usr/bin/env node
/**
 * Cross-platform Husky Setup Script
 * 跨平台 Husky 設定腳本
 *
 * This script replaces the shell command: cd .. && husky cli/.husky
 * It works on Windows, macOS, and Linux.
 */

import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = dirname(__dirname);

// Check if we're in a git repository
const gitDir = join(rootDir, '.git');
if (!existsSync(gitDir)) {
    console.log('Husky setup skipped: Not a git repository.');
    process.exit(0);
}

// Check if this is a CI environment (skip husky setup)
if (process.env.CI === 'true' || process.env.HUSKY === '0') {
    console.log('Husky setup skipped: CI environment detected.');
    process.exit(0);
}

try {
    // Run husky from the root directory
    execSync('npx husky cli/.husky', {
        cwd: rootDir,
        stdio: 'inherit'
    });
    console.log('Husky hooks configured successfully.');
} catch (error) {
    // Husky setup may fail in some environments
    console.warn('Husky setup skipped (this is normal in some environments).');
    // Don't exit with error code - this shouldn't break npm install
    process.exit(0);
}
