/**
 * i18n Lint Rules (XSPEC-239 §Req-5 + Chimera Prevention)
 *
 * Detects layered-language-strategy violations in canonical and locale files.
 *
 * Rules:
 *   canonical:description-must-be-ascii        (error)
 *   locale:description-must-match-language     (error)
 *   locale:must-have-source-frontmatter        (error)
 *   canonical:l3-language-consistency          (warn)
 *   translation-drift-warn                     (warn)
 *
 * `adopter-must-match-installed-locale` is deferred (needs project context,
 * not source-tree level).
 *
 * @module lint/i18n
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname, basename, resolve } from 'path';

// CJK Unified Ideographs ranges (excluding fullwidth punctuation, but
// including ranges Ext-A/B used by zh-TW/zh-CN). Hangul, Hiragana,
// Katakana included to also flag accidentally-mixed CJK content.
const CJK_REGEX = /[㐀-䶿一-鿿豈-﫿぀-ゟ゠-ヿ가-힯]/;

// ASCII-only regex (allow printable ASCII + space + common punctuation).
// Anything outside extended-ASCII counts as non-ASCII for description purposes.
// Control chars \x09 (tab), \x0A (LF), \x0D (CR) are intentionally allowed.
// eslint-disable-next-line no-control-regex
const NON_ASCII_REGEX = /[^\x09\x0A\x0D\x20-\x7E]/;

/**
 * Parse a minimal YAML front matter from markdown content.
 * Returns { fm: {key→value}, fmEndLine: number, body: string }
 * If there is no front matter, returns fm=null, fmEndLine=0, body=full content.
 */
function parseFrontmatter(content) {
  const lines = content.split('\n');
  if (lines[0] !== '---') {
    return { fm: null, fmEndLine: 0, body: content };
  }
  const fm = {};
  let fmEndLine = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') {
      fmEndLine = i;
      break;
    }
    const m = lines[i].match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (m) {
      let value = m[2].trim();
      // Multi-line block scalar (| or >) — collect lines until indentation breaks
      if (value === '|' || value === '>') {
        const blockLines = [];
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j] === '---') break;
          if (lines[j].startsWith('  ') || lines[j] === '') {
            blockLines.push(lines[j].replace(/^ {0,2}/, ''));
          } else {
            break;
          }
        }
        value = blockLines.join('\n').trim();
      } else if ((value.startsWith('"') && value.endsWith('"')) ||
                 (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      fm[m[1]] = { value, line: i + 1 };
    }
  }
  if (fmEndLine === -1) {
    return { fm: null, fmEndLine: 0, body: content };
  }
  const body = lines.slice(fmEndLine + 1).join('\n');
  return { fm, fmEndLine, body };
}

function semverParts(v) {
  if (!v) return null;
  const stripped = String(v).split('-')[0];
  const parts = stripped.split('.').map(n => parseInt(n, 10));
  if (parts.some(Number.isNaN)) return null;
  return parts;
}

function isMajorOrMinorGap(translation, source, maxMinorGap = 2) {
  const t = semverParts(translation);
  const s = semverParts(source);
  if (!t || !s) return null;
  if ((t[0] || 0) !== (s[0] || 0)) return { kind: 'major' };
  const gap = (s[1] || 0) - (t[1] || 0);
  if (gap > maxMinorGap) return { kind: 'minor', gap };
  return null;
}

/**
 * Look up the source markdown's version from its first 30 lines.
 * Supports YAML frontmatter `version:` plus `**Version**: x.y.z` patterns.
 */
function readSourceVersion(filePath) {
  if (!existsSync(filePath)) return null;
  const head = readFileSync(filePath, 'utf-8').split('\n').slice(0, 30);
  for (const line of head) {
    let m = line.match(/^\s*version:\s*(\S+)/i);
    if (m) return m[1].trim();
    m = line.match(/^\s*\*\*Version\*\*:\s*([\d][^|\s]*)/i);
    if (m) return m[1].trim();
    m = line.match(/^\s*>\s*Version:\s*([\d][^|\s]*)/i);
    if (m) return m[1].trim();
  }
  return null;
}

/**
 * Lint a canonical SKILL.md or core/*.md file for English-only frontmatter
 * and L3 language consistency.
 *
 * @param {string} skillMdPath - Absolute path to canonical file
 * @returns {Array<{rule, severity, line, message, file}>}
 */
export function lintCanonical(skillMdPath) {
  const findings = [];
  if (!existsSync(skillMdPath)) return findings;
  const content = readFileSync(skillMdPath, 'utf-8');
  const { fm, body } = parseFrontmatter(content);

  // Rule: canonical:description-must-be-ascii
  if (fm && fm.description) {
    if (NON_ASCII_REGEX.test(fm.description.value)) {
      findings.push({
        rule: 'canonical:description-must-be-ascii',
        severity: 'error',
        line: fm.description.line,
        file: skillMdPath,
        message: 'Canonical `description` must be ASCII-only (English). Found non-ASCII characters; move translation to locale variant.'
      });
    }
  }

  // Rule: canonical:l3-language-consistency
  // Heuristic: scan code-block-style output templates (```...```) for
  // non-English example response text. Only fire when description is ASCII
  // (otherwise the description-must-be-ascii error already covers it).
  if (fm && fm.description && !NON_ASCII_REGEX.test(fm.description.value)) {
    const fenceRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let match;
    while ((match = fenceRegex.exec(body)) !== null) {
      const lang = match[1];
      const block = match[2];
      // Skip code fences for known programming languages — those legitimately
      // contain non-English string literals.
      const skipLangs = new Set(['', 'json', 'yaml', 'yml', 'toml', 'ini',
        'sh', 'bash', 'zsh', 'powershell',
        'js', 'ts', 'tsx', 'jsx', 'javascript', 'typescript',
        'py', 'python', 'rb', 'ruby', 'go', 'rust', 'java', 'c', 'cpp',
        'html', 'css', 'sql', 'diff', 'patch']);
      if (skipLangs.has(lang.toLowerCase())) continue;

      // Likely an output template / example response (e.g., ```markdown,
      // ```text, ```output, ```response). Flag if it contains CJK.
      if (CJK_REGEX.test(block)) {
        // Compute approx. line number of the fence start
        const lineNum = content.substring(0, match.index).split('\n').length;
        findings.push({
          rule: 'canonical:l3-language-consistency',
          severity: 'warn',
          line: lineNum,
          file: skillMdPath,
          message: `Canonical body contains a non-English example response inside a non-code fenced block (lang=\`${lang || 'plain'}\`). Move translated examples to the locale variant.`
        });
        // Only report first occurrence per file to keep output readable
        break;
      }
    }
  }

  return findings;
}

/**
 * Lint a locale variant (e.g. locales/zh-TW/skills/foo/SKILL.md or
 * locales/zh-CN/core/some-standard.md).
 *
 * @param {string} skillMdPath - Absolute path to locale variant file
 * @param {string} locale - Locale code (e.g. 'zh-TW', 'zh-CN')
 * @returns {Array<{rule, severity, line, message, file}>}
 */
export function lintLocale(skillMdPath, locale) {
  const findings = [];
  if (!existsSync(skillMdPath)) return findings;
  const content = readFileSync(skillMdPath, 'utf-8');
  const { fm } = parseFrontmatter(content);

  // Rule: locale:must-have-source-frontmatter
  if (!fm) {
    findings.push({
      rule: 'locale:must-have-source-frontmatter',
      severity: 'error',
      line: 1,
      file: skillMdPath,
      message: 'Locale variant is missing YAML front matter (must include `source:`, `source_version:`, `translation_version:`).'
    });
    return findings;
  }

  const required = ['source', 'source_version', 'translation_version'];
  const missing = required.filter(k => !fm[k]);
  if (missing.length > 0) {
    findings.push({
      rule: 'locale:must-have-source-frontmatter',
      severity: 'error',
      line: 1,
      file: skillMdPath,
      message: `Locale variant is missing required frontmatter field(s): ${missing.join(', ')}.`
    });
  }

  // Rule: locale:description-must-match-language
  // For zh-TW / zh-CN, the description (if present) must contain CJK.
  if (fm.description) {
    const expectsCjk = locale === 'zh-TW' || locale === 'zh-CN' ||
                       locale.startsWith('zh-') || locale === 'ja-JP' ||
                       locale === 'ko-KR';
    if (expectsCjk && !CJK_REGEX.test(fm.description.value)) {
      findings.push({
        rule: 'locale:description-must-match-language',
        severity: 'error',
        line: fm.description.line,
        file: skillMdPath,
        message: `Locale \`${locale}\` variant has ASCII-only \`description\`; locale variants must contain ${locale}-script characters (likely chimera).`
      });
    }
  }

  // Rule: translation-drift-warn
  if (fm.source && fm.translation_version) {
    // Resolve source path relative to this file's directory
    const sourceRel = fm.source.value;
    const sourcePath = resolve(dirname(skillMdPath), sourceRel);
    const actualSourceVersion = readSourceVersion(sourcePath);
    if (actualSourceVersion) {
      const gap = isMajorOrMinorGap(fm.translation_version.value, actualSourceVersion);
      if (gap) {
        const detail = gap.kind === 'major'
          ? 'major-version gap'
          : `${gap.gap} minor versions behind`;
        findings.push({
          rule: 'translation-drift-warn',
          severity: 'warn',
          line: fm.translation_version.line,
          file: skillMdPath,
          message: `translation_version \`${fm.translation_version.value}\` lags source_version \`${actualSourceVersion}\` (${detail}). Re-sync recommended.`
        });
      }
    }
  }

  return findings;
}

/**
 * Batch-lint a UDS project tree. Scans canonical `skills/` and `core/`,
 * plus `locales/{locale}/skills/` and `locales/{locale}/core/`.
 *
 * @param {object} opts
 * @param {string} opts.projectPath - Project (or UDS) root path
 * @param {string[]} [opts.locales] - Locales to lint (defaults to discovering
 *                                    every subdirectory of `locales/`)
 * @returns {Array<{rule, severity, line, message, file}>}
 */
export function lintAll({ projectPath, locales }) {
  const findings = [];

  const skillsDir = join(projectPath, 'skills');
  const coreDir = join(projectPath, 'core');
  const localesDir = join(projectPath, 'locales');

  // --- Canonical skills ---
  if (existsSync(skillsDir)) {
    for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillFile = join(skillsDir, entry.name, 'SKILL.md');
      if (existsSync(skillFile)) {
        findings.push(...lintCanonical(skillFile));
      }
    }
  }

  // --- Canonical core/*.md ---
  if (existsSync(coreDir)) {
    for (const entry of readdirSync(coreDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
      findings.push(...lintCanonical(join(coreDir, entry.name)));
    }
  }

  // --- Locale variants ---
  if (existsSync(localesDir)) {
    const candidateLocales = locales || readdirSync(localesDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .filter(name => /^[a-z]{2}(-[A-Z]{2})?$/.test(name));

    for (const locale of candidateLocales) {
      const localeSkillsDir = join(localesDir, locale, 'skills');
      const localeCoreDir = join(localesDir, locale, 'core');

      if (existsSync(localeSkillsDir)) {
        for (const entry of readdirSync(localeSkillsDir, { withFileTypes: true })) {
          if (!entry.isDirectory()) continue;
          const skillFile = join(localeSkillsDir, entry.name, 'SKILL.md');
          if (existsSync(skillFile)) {
            findings.push(...lintLocale(skillFile, locale));
          }
        }
      }
      if (existsSync(localeCoreDir)) {
        for (const entry of readdirSync(localeCoreDir, { withFileTypes: true })) {
          if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
          findings.push(...lintLocale(join(localeCoreDir, entry.name), locale));
        }
      }
    }
  }

  return findings;
}

/**
 * Convenience helper: split findings into errors and warnings.
 */
export function partitionFindings(findings) {
  return {
    errors: findings.filter(f => f.severity === 'error'),
    warnings: findings.filter(f => f.severity === 'warn'),
  };
}
