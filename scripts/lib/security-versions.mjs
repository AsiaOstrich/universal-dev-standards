// Single source of truth for the SECURITY.md "Supported Versions" table.
//
// Consumed by both scripts/generate-docs.mjs (full docs sync via
// `npm run docs:sync`) and scripts/bump-version.mjs (every version bump,
// including a pre-release -> pre-release bump where no CHANGELOG entry or
// docs:sync run is guaranteed yet).
//
// Why this exists as a separate module: bump-version.mjs used to carry its
// own regex-based patch for this table (added because these 3 files were
// missing from its file list — see git blame around 6.8.0). That patch
// matched "the row with a bare X.Y.Z version" to locate the "Latest stable"
// row and rewrote only that row's version digits in place. It broke on a
// pre-release -> pre-release bump: the new pre-release version (e.g.
// 6.13.0-beta.2) never looks like a bare X.Y.Z, so the regex fell through to
// the ONLY row that did look bare — the unrelated stable row — and silently
// overwrote its version number with the new pre-release version while
// leaving the "Latest stable" label attached. The stale pre-release row
// (still beta.1) was left completely untouched.
//
// Fixed by generating the whole 2-or-3-row block from (version,
// stableVersion) instead of patching a single matched row in place, and by
// giving both call sites the same generator so the two can no longer drift
// out of sync with each other the way the file-list duplication above already
// had (see the comment that used to live at this call site in
// bump-version.mjs).

import fs from 'fs';

/**
 * Build the three (en / zh-TW / zh-CN) table bodies for the
 * UDS_SUPPORTED_VERSIONS marker block.
 *
 * @param {string} version        The version being released/bumped to.
 * @param {string} stableVersion  The latest STABLE version — read from
 *   .claude-plugin/plugin.json, which is only ever written on stable
 *   releases (bump-version.mjs step 8). Ignored when `version` itself is
 *   stable (the table then has no separate "Latest stable" row: `version`
 *   IS the latest stable).
 * @returns {{en: string, zh: string, cn: string}}
 */
export function buildSecurityTables(version, stableVersion) {
  const isPrerelease = version.includes('-');

  return {
    en: isPrerelease
      ? `| Version | Supported | 支援狀態 |\n|---------|-----------|--------|\n| ${version} | ✅ Pre-release | 預發布版本 |\n| ${stableVersion} | ✅ Latest stable | 最新正式版 |\n| < ${stableVersion.split('.')[0]}.0.0 | ❌ End of life | 已終止支援 |`
      : `| Version | Supported | 支援狀態 |\n|---------|-----------|--------|\n| ${version} | ✅ Latest stable | 最新正式版 |\n| < ${version.split('.')[0]}.0.0 | ❌ End of life | 已終止支援 |`,
    zh: isPrerelease
      ? `| 版本 | 支援狀態 |\n|------|--------|\n| ${version} | ✅ 預發布版本 |\n| ${stableVersion} | ✅ 最新正式版 |\n| < ${stableVersion.split('.')[0]}.0.0 | ❌ 已終止支援 |`
      : `| 版本 | 支援狀態 |\n|------|--------|\n| ${version} | ✅ 最新正式版 |\n| < ${version.split('.')[0]}.0.0 | ❌ 已終止支援 |`,
    cn: isPrerelease
      ? `| 版本 | 支持状态 |\n|------|--------|\n| ${version} | ✅ 预发布版本 |\n| ${stableVersion} | ✅ 最新正式版 |\n| < ${stableVersion.split('.')[0]}.0.0 | ❌ 已终止支持 |`
      : `| 版本 | 支持状态 |\n|------|--------|\n| ${version} | ✅ 最新正式版 |\n| < ${version.split('.')[0]}.0.0 | ❌ 已终止支持 |`
  };
}

/**
 * Detect the language a SECURITY.md file's table should use, from its path.
 * Same convention used by generate-docs.mjs's other locale-detection sites.
 *
 * @param {string} filePath
 * @returns {'en'|'zh'|'cn'}
 */
export function detectLang(filePath) {
  if (filePath.includes('zh-TW')) return 'zh';
  if (filePath.includes('zh-CN')) return 'cn';
  return 'en';
}

/**
 * Overwrite the UDS_SUPPORTED_VERSIONS_START/END block in each of the given
 * SECURITY.md files with the freshly generated table for its language.
 *
 * @param {string} version
 * @param {string} stableVersion
 * @param {string[]} securityFilePaths Absolute paths to SECURITY.md files.
 *   Language is detected per-path via detectLang(), so order doesn't matter.
 * @returns {{filePath: string, status: 'ok'|'skip'|'no-match'}[]}
 *   'skip'     — file does not exist.
 *   'no-match' — file exists but has no UDS_SUPPORTED_VERSIONS marker block.
 */
export function syncSecurityVersions(version, stableVersion, securityFilePaths) {
  const tables = buildSecurityTables(version, stableVersion);
  const regex = /<!-- UDS_SUPPORTED_VERSIONS_START -->[\s\S]*?<!-- UDS_SUPPORTED_VERSIONS_END -->/g;
  const results = [];

  for (const filePath of securityFilePaths) {
    if (!fs.existsSync(filePath)) {
      results.push({ filePath, status: 'skip' });
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    regex.lastIndex = 0;
    if (!regex.test(content)) {
      results.push({ filePath, status: 'no-match' });
      continue;
    }

    const lang = detectLang(filePath);
    regex.lastIndex = 0;
    const updated = content.replace(
      regex,
      `<!-- UDS_SUPPORTED_VERSIONS_START -->\n${tables[lang]}\n<!-- UDS_SUPPORTED_VERSIONS_END -->`
    );
    fs.writeFileSync(filePath, updated, 'utf8');
    results.push({ filePath, status: 'ok' });
  }

  return results;
}
