#!/usr/bin/env node
//
// Version Bump Script (cross-platform Node.js ESM)
// 版本升版腳本（跨平台 Node.js ESM 版本）
//
// Updates ALL version files atomically for a UDS release.
// 一次性更新所有版本檔案，避免遺漏。
//
// Usage: node scripts/bump-version.mjs <version>
// Example:
//   node scripts/bump-version.mjs 5.1.0-beta.7   # Beta release
//   node scripts/bump-version.mjs 5.2.0           # Stable release
//
// NOTE: This is the cross-platform equivalent of bump-version.sh.
// It is recommended over the .sh script for Windows environments.
//

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const IS_WINDOWS = process.platform === 'win32';

/**
 * Build a platform-aware shell command for a .sh script.
 * On Windows, falls back to the .ps1 counterpart if it exists.
 * Returns null when no runnable variant is found.
 */
function buildCmd(shPath) {
  if (!IS_WINDOWS) return existsSync(shPath) ? `bash "${shPath}"` : null;
  const ps1Path = shPath.replace(/\.sh$/, '.ps1');
  return existsSync(ps1Path)
    ? `powershell -ExecutionPolicy Bypass -File "${ps1Path}"`
    : null;
}

// ── ANSI colours (no external dependency) ──────────────────────────────────
const RED    = '\x1b[0;31m';
const GREEN  = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE   = '\x1b[0;34m';
const NC     = '\x1b[0m';

// ── Paths ───────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(__filename);
const ROOT_DIR   = dirname(SCRIPT_DIR);
const CLI_DIR    = join(ROOT_DIR, 'cli');
const TODAY      = new Date().toISOString().slice(0, 10);

// ── Validate argument ────────────────────────────────────────────────────────
const NEW_VERSION = process.argv[2];

if (!NEW_VERSION) {
  console.error(`${RED}Error:${NC} Version argument required`);
  console.error('Usage: node scripts/bump-version.mjs <version>');
  console.error('Examples:');
  console.error('  node scripts/bump-version.mjs 5.1.0-beta.7   # Beta release');
  console.error('  node scripts/bump-version.mjs 5.2.0          # Stable release');
  process.exit(1);
}

// Validate semver format (basic check)
if (!/^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$/.test(NEW_VERSION)) {
  console.error(`${RED}Error:${NC} Invalid version format: ${NEW_VERSION}`);
  console.error('Expected format: X.Y.Z or X.Y.Z-beta.N / X.Y.Z-alpha.N / X.Y.Z-rc.N');
  process.exit(1);
}

// Detect pre-release
const preReleaseMatch = NEW_VERSION.match(/-(beta|alpha|rc)\./);
const IS_PRERELEASE   = preReleaseMatch !== null;
const RELEASE_TYPE    = IS_PRERELEASE ? preReleaseMatch[1] : 'stable';

console.log('');
console.log('==========================================');
console.log('  UDS Version Bump');
console.log('  版本升版工具');
console.log('==========================================');
console.log('');
console.log(`  New version : ${BLUE}${NEW_VERSION}${NC}`);
console.log(`  Release type: ${BLUE}${RELEASE_TYPE}${NC}`);
console.log(`  Date        : ${BLUE}${TODAY}${NC}`);
console.log('');

// ── Helper: read → transform → write ────────────────────────────────────────
/**
 * Apply a regex replacement to a file.
 * @param {string} desc    Human-readable description (for log output)
 * @param {string} file    Absolute file path
 * @param {RegExp} regex   Pattern to replace
 * @param {string} replacement Replacement string (may reference capture groups)
 * @param {string} [flags] Additional flags if needed (default is 'g' when replacing all)
 */
function updateFile(desc, file, regex, replacement) {
  if (!existsSync(file)) {
    console.log(`  ${YELLOW}[SKIP]${NC} ${desc} — file not found: ${file}`);
    return;
  }
  const original = readFileSync(file, 'utf8');
  const updated  = original.replace(regex, replacement);
  writeFileSync(file, updated, 'utf8');
  console.log(`  ${GREEN}[OK]${NC} ${desc}`);
}

console.log('── Updating version files ─────────────────────────────────────────────────');
console.log('');

// 1. cli/package.json
updateFile(
  'cli/package.json',
  join(CLI_DIR, 'package.json'),
  /"version": "[^"]*"/,
  `"version": "${NEW_VERSION}"`
);

// 2. cli/standards-registry.json (all occurrences)
{
  const file = join(CLI_DIR, 'standards-registry.json');
  if (existsSync(file)) {
    const original = readFileSync(file, 'utf8');
    const updated  = original.replace(/"version": "[^"]*"/g, `"version": "${NEW_VERSION}"`);
    writeFileSync(file, updated, 'utf8');
    console.log(`  ${GREEN}[OK]${NC} cli/standards-registry.json (all 3 version fields)`);
  } else {
    console.log(`  ${YELLOW}[SKIP]${NC} cli/standards-registry.json — file not found`);
  }
}

// 3. uds-manifest.json (version + last_updated)
{
  const file = join(ROOT_DIR, 'uds-manifest.json');
  if (existsSync(file)) {
    let content = readFileSync(file, 'utf8');
    content = content.replace(/"version": "[^"]*"/, `"version": "${NEW_VERSION}"`);
    content = content.replace(/"last_updated": "[^"]*"/, `"last_updated": "${TODAY}"`);
    writeFileSync(file, content, 'utf8');
    console.log(`  ${GREEN}[OK]${NC} uds-manifest.json (version + last_updated)`);
  } else {
    console.log(`  ${YELLOW}[SKIP]${NC} uds-manifest.json — file not found`);
  }
}

// Build the version label for README (with or without "(Pre-release)")
const VERSION_LABEL = IS_PRERELEASE ? `${NEW_VERSION} (Pre-release)` : NEW_VERSION;

// 4. README.md (English) — replace everything between "**Version**: " and the next " |"
updateFile(
  'README.md',
  join(ROOT_DIR, 'README.md'),
  /\*\*Version\*\*:[^|]*/,
  `**Version**: ${VERSION_LABEL} `
);

// 5. locales/zh-TW/README.md
updateFile(
  'locales/zh-TW/README.md',
  join(ROOT_DIR, 'locales', 'zh-TW', 'README.md'),
  /\*\*版本\*\*:[^|]*/,
  `**版本**: ${VERSION_LABEL} `
);

// 6. locales/zh-CN/README.md
updateFile(
  'locales/zh-CN/README.md',
  join(ROOT_DIR, 'locales', 'zh-CN', 'README.md'),
  /\*\*版本\*\*:[^|]*/,
  `**版本**: ${VERSION_LABEL} `
);

// 7. CHANGELOG frontmatter (zh-TW + zh-CN) — update source_version, translation_version, last_synced
for (const locale of ['zh-TW', 'zh-CN']) {
  const file = join(ROOT_DIR, 'locales', locale, 'CHANGELOG.md');
  if (existsSync(file)) {
    let content = readFileSync(file, 'utf8');
    content = content.replace(/^source_version: .*/m,      `source_version: ${NEW_VERSION}`);
    content = content.replace(/^translation_version: .*/m, `translation_version: ${NEW_VERSION}`);
    content = content.replace(/^last_synced: .*/m,         `last_synced: ${TODAY}`);
    writeFileSync(file, content, 'utf8');
    console.log(`  ${GREEN}[OK]${NC} locales/${locale}/CHANGELOG.md (frontmatter)`);
  }
}

// 8. .claude-plugin/ — ONLY for stable releases
if (!IS_PRERELEASE) {
  console.log('');
  console.log('── Stable release: updating marketplace files ────────────────────────────');
  console.log('');

  updateFile(
    '.claude-plugin/plugin.json',
    join(ROOT_DIR, '.claude-plugin', 'plugin.json'),
    /"version": "[^"]*"/,
    `"version": "${NEW_VERSION}"`
  );

  const marketplaceFile = join(ROOT_DIR, '.claude-plugin', 'marketplace.json');
  if (existsSync(marketplaceFile)) {
    const content = readFileSync(marketplaceFile, 'utf8');
    const updated = content.replace(/"version": "[^"]*"/, `"version": "${NEW_VERSION}"`);
    writeFileSync(marketplaceFile, updated, 'utf8');
    console.log(`  ${GREEN}[OK]${NC} .claude-plugin/marketplace.json`);
  }
} else {
  console.log('');
  console.log(`  ${YELLOW}[SKIP]${NC} .claude-plugin/ files (pre-release — marketplace keeps stable version)`);
}

// ── Verify with check-version-sync (platform-aware) ───────────────────────
console.log('');
console.log('── Running version sync verification ────────────────────────────────────');
console.log('');

const syncCmd = buildCmd(join(SCRIPT_DIR, 'check-version-sync.sh'));
if (syncCmd) {
  try {
    execSync(syncCmd, { stdio: 'inherit' });
  } catch {
    console.log('');
    console.error(`${RED}Version sync check FAILED. Please fix the above mismatches before committing.${NC}`);
    process.exit(1);
  }
} else {
  console.log(`${YELLOW}[WARN]${NC} check-version-sync script not found for this platform, skipping verification`);
}

// ── Translation sync advisory check (platform-aware) ──────────────────────
console.log('');
console.log('── Checking translation sync status ─────────────────────────────────────');
console.log('');

const translationCmd = buildCmd(join(SCRIPT_DIR, 'check-translation-sync.sh'));
if (translationCmd) {
  try {
    execSync(translationCmd, { stdio: 'inherit' });
  } catch {
    console.log('');
    console.log(`${YELLOW}[WARN]${NC} Translation sync check found release-blocking issues.`);
    console.log('       Update affected translations before `npm publish`.');
    console.log('');
    // Advisory only — do not exit 1
  }
} else {
  console.log(`${YELLOW}[SKIP]${NC} check-translation-sync script not found for this platform`);
}

// ── Summary ───────────────────────────────────────────────────────────────
console.log('');
console.log('==========================================');
console.log('  Done! | 完成！');
console.log('==========================================');
console.log('');
console.log(`  Version bumped to: ${GREEN}${NEW_VERSION}${NC}`);
console.log('');
console.log('  Next steps:');
console.log('  1. Update CHANGELOG.md (EN + zh-TW + zh-CN) with release notes');
console.log('  2. Fix any MAJOR/MISSING translation issues shown above');
console.log(`  3. git add -A && git commit -m "chore(release): ${NEW_VERSION}"`);
console.log(`  4. git tag v${NEW_VERSION} && git push origin main v${NEW_VERSION}`);
console.log(`  5. Create GitHub Release (pre-release: ${IS_PRERELEASE})`);
console.log('');
