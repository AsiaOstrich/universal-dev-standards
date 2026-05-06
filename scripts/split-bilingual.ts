#!/usr/bin/env tsx
/**
 * Split bilingual markdown files into separate English and Chinese versions.
 * 將雙語 markdown 檔案分離為獨立的英文和中文版本。
 *
 * Cross-platform TypeScript implementation. Run with `tsx`.
 * Replaces split-bilingual.py to remove the last Python dependency
 * from scripts/. CJK detection uses Node.js regex (U+4E00-U+9FFF),
 * matching the original Python `[一-鿿]` pattern exactly.
 *
 * Usage:
 *   tsx scripts/split-bilingual.ts <input_file> <en_output> <zh_output>
 *   tsx scripts/split-bilingual.ts --test <input_file>
 *
 * Or via npm:
 *   npm run split-bilingual <input_file> <en_output> <zh_output>
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, basename, relative } from 'node:path';

// ANSI escape codes for terminal colour output (no extra dependency).
const COLOR = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
} as const;

// CJK Unified Ideographs U+4E00-U+9FFF.
// Equivalent to Python's `r'[一-鿿]'`.
const CJK_REGEX = /[一-鿿]/;
const CJK_REGEX_GLOBAL = /[一-鿿]/g;
const WHITESPACE_GLOBAL = /\s/g;

/** Check if text contains any Chinese (CJK) characters. */
function containsChinese(text: string): boolean {
  return CJK_REGEX.test(text);
}

/**
 * Check if line contains significant Chinese characters
 * (more than 30% of non-whitespace characters are CJK).
 */
function isChineseLine(line: string): boolean {
  const chineseChars = (line.match(CJK_REGEX_GLOBAL) ?? []).length;
  const totalChars = line.replace(WHITESPACE_GLOBAL, '').length;
  if (totalChars === 0) {
    return false;
  }
  return chineseChars / totalChars > 0.3;
}

/** Check if line is primarily English (0 CJK chars or fewer than 3). */
function isEnglishLine(line: string): boolean {
  if (!line.trim()) {
    return false;
  }
  const chineseChars = (line.match(CJK_REGEX_GLOBAL) ?? []).length;
  return chineseChars === 0 || chineseChars < 3;
}

/** Check if line is a bilingual header like '## Purpose | 目的'. */
function isBilingualHeader(line: string): boolean {
  if (!line.includes('|')) {
    return false;
  }
  const parts = line.split('|');
  if (parts.length !== 2) {
    return false;
  }
  // Python: re.match(r'^#+\s*', line) and contains_chinese(parts[1])
  // re.match anchors at start; equivalent to /^#+\s*/.test(line).
  return /^#+\s*/.test(line) && containsChinese(parts[1]!);
}

/**
 * Check if line is code or example content.
 *
 * Mirrors the original Python operator precedence:
 *   stripped.startswith('```') or
 *   stripped.startswith('//') or
 *   stripped.startswith('#') and not stripped.startswith('##') or
 *   stripped.startswith('│') or ...
 *
 * Python `and` binds tighter than `or`, so the third clause is
 * `(startswith('#') and not startswith('##'))` — i.e. lines beginning
 * with a single '#' that is not a markdown heading.
 */
function isCodeOrExample(line: string): boolean {
  const stripped = line.trim();
  return (
    stripped.startsWith('```') ||
    stripped.startsWith('//') ||
    (stripped.startsWith('#') && !stripped.startsWith('##')) ||
    stripped.startsWith('│') ||
    stripped.startsWith('├') ||
    stripped.startsWith('└') ||
    stripped.startsWith('┌') ||
    stripped.startsWith('─')
  );
}

/** Check if line is structural (empty, list marker, table row, hr, etc.). */
function isStructural(line: string): boolean {
  const stripped = line.trim();
  return (
    !stripped ||
    stripped.startsWith('-') ||
    stripped.startsWith('*') ||
    stripped.startsWith('|') ||
    stripped === '---'
  );
}

/** Keep lines containing important inline status markers. */
function isMixedImportant(line: string): boolean {
  return line.includes('✅') || line.includes('❌') || line.includes('⚠️');
}

/** Clean table row, keeping English content (currently passthrough). */
function cleanTableRow(line: string): string {
  return line;
}

/** Extract version from `**Version**: x.y.z` pattern; default 1.0.0. */
function getVersion(content: string): string {
  const match = content.match(/\*\*Version\*\*:\s*(\d+\.\d+\.\d+)/);
  return match ? match[1]! : '1.0.0';
}

/** Extract English content from bilingual markdown. */
function extractEnglish(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    // Skip pure Chinese lines (mostly CJK characters).
    if (isChineseLine(line) && !isMixedImportant(line)) {
      i += 1;
      continue;
    }

    // Handle bilingual headers like "## Purpose | 目的" — keep English part.
    if (line.includes('|') && isBilingualHeader(line)) {
      const parts = line.split('|');
      result.push(parts[0]!.trim());
      i += 1;
      continue;
    }

    // Handle inline Chinese in tables (preserve structure).
    if (line.trim().startsWith('|') && containsChinese(line)) {
      result.push(cleanTableRow(line));
      i += 1;
      continue;
    }

    // Skip lines that are pure Chinese translations.
    if (line.trim() && isChineseLine(line)) {
      i += 1;
      continue;
    }

    result.push(line);
    i += 1;
  }

  return result.join('\n');
}

/**
 * Extract Chinese content from bilingual markdown.
 *
 * Adds translation metadata header (source path, version, sync date).
 */
function extractChinese(content: string, sourcePath: string, version: string): string {
  const lines = content.split('\n');
  const result: string[] = [];

  // Translation metadata header — equivalent to Python datetime.now().strftime('%Y-%m-%d').
  const today = new Date().toISOString().slice(0, 10);
  const metadata = `---
source: ${sourcePath}
source_version: ${version}
translation_version: ${version}
last_synced: ${today}
status: current
---`;
  result.push(metadata);
  result.push('');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;

    // Bilingual header — keep Chinese part (preserve heading level).
    if (line.includes('|') && isBilingualHeader(line)) {
      const parts = line.split('|');
      if (parts.length >= 2) {
        const chinesePart = parts[1]!.trim();
        const headingMatch = line.match(/^(#+)\s*/);
        if (headingMatch) {
          result.push(`${headingMatch[1]} ${chinesePart}`);
        } else {
          result.push(chinesePart);
        }
      }
      i += 1;
      continue;
    }

    // Skip English lines that are followed by a Chinese equivalent.
    if (isEnglishLine(line) && !isCodeOrExample(line)) {
      let j = i + 1;
      while (j < lines.length && !lines[j]!.trim()) {
        j += 1;
      }
      if (j < lines.length && isChineseLine(lines[j]!)) {
        i += 1;
        continue;
      }
    }

    // Keep Chinese content, code/example lines, and structural lines.
    if (isChineseLine(line) || isCodeOrExample(line) || isStructural(line)) {
      result.push(line);
    }

    i += 1;
  }

  return result.join('\n');
}

/** Insert English-side language switcher after the first H1. */
function addLanguageSwitcherEn(content: string, zhPath: string): string {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    // Python: line.startswith('#') and not line.startswith('##')
    if (line.startsWith('#') && !line.startsWith('##')) {
      lines.splice(i + 1, 0, '', `> **Language**: English | [繁體中文](${zhPath})`);
      break;
    }
  }
  return lines.join('\n');
}

/** Insert Chinese-side language switcher after the first H1 (post-metadata). */
function addLanguageSwitcherZh(content: string, enPath: string): string {
  const lines = content.split('\n');
  let inMetadata = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    if (line.trim() === '---') {
      // Toggle metadata block (matches Python's two-state flip).
      inMetadata = !inMetadata;
      continue;
    }
    if (!inMetadata && line.startsWith('#') && !line.startsWith('##')) {
      lines.splice(i + 1, 0, '', `> **語言**: [English](${enPath}) | 繁體中文`);
      break;
    }
  }
  return lines.join('\n');
}

/** Print usage and exit with status 1. */
function printUsageAndExit(): never {
  console.error(
    `${COLOR.yellow}Usage:${COLOR.reset} tsx scripts/split-bilingual.ts <input_file> <en_output> <zh_output>`,
  );
  console.error(
    `       tsx scripts/split-bilingual.ts --test <input_file>`,
  );
  process.exit(1);
}

function main(): void {
  const argv = process.argv.slice(2);

  if (argv.length < 1) {
    printUsageAndExit();
  }

  // --test mode: report stats only.
  // Note: the original Python checked `len(sys.argv) < 4` *before* this branch,
  // which made `--test` unreachable (dead code). The TypeScript port restores
  // the intended behaviour by checking for `--test` first.
  if (argv[0] === '--test') {
    if (argv.length < 2) {
      printUsageAndExit();
    }
    const inputFile = argv[1]!;
    const content = readFileSync(inputFile, 'utf8');
    const version = getVersion(content);
    const lines = content.split('\n');
    const chineseLines = lines.filter((l) => isChineseLine(l)).length;
    const englishLines = lines.filter((l) => isEnglishLine(l) && l.trim()).length;
    console.log(`Version found: ${version}`);
    console.log(`Total lines: ${lines.length}`);
    console.log(`Chinese lines: ${chineseLines}`);
    console.log(`English lines: ${englishLines}`);
    return;
  }

  if (argv.length < 3) {
    printUsageAndExit();
  }

  const inputFile = argv[0]!;
  const enOutput = argv[1]!;
  const zhOutput = argv[2]!;

  const content = readFileSync(inputFile, 'utf8');
  const version = getVersion(content);

  // Calculate output parent directories (mirrors Python Path.parent.name usage).
  const enParentName = basename(dirname(enOutput));
  const enFileName = basename(enOutput);

  // Note: en_to_zh / zh_to_en are computed in the Python original but never used.
  // We retain the relative-path computation for parity but suppress unused-var warnings.
  void relative(dirname(enOutput), zhOutput);
  void relative(dirname(zhOutput), enOutput);

  let enContent = extractEnglish(content);
  enContent = addLanguageSwitcherEn(
    enContent,
    `../../locales/zh-TW/${enParentName}/${enFileName}`,
  );

  let zhContent = extractChinese(
    content,
    `../../../${enParentName}/${enFileName}`,
    version,
  );
  zhContent = addLanguageSwitcherZh(
    zhContent,
    `../../../${enParentName}/${enFileName}`,
  );

  // Ensure output directories exist.
  mkdirSync(dirname(enOutput), { recursive: true });
  mkdirSync(dirname(zhOutput), { recursive: true });

  writeFileSync(enOutput, enContent, 'utf8');
  writeFileSync(zhOutput, zhContent, 'utf8');

  console.log(
    `${COLOR.green}Created:${COLOR.reset} ${enOutput} (${enContent.length} chars)`,
  );
  console.log(
    `${COLOR.green}Created:${COLOR.reset} ${zhOutput} (${zhContent.length} chars)`,
  );
}

main();
