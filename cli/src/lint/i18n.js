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
 *   translation-drift-warn                     (warn)   version-gap (needs a version on the canonical)
 *   translation-content-drift-warn             (warn)   source_hash mismatch — catches SILENT drift, version-independent (XSPEC-248)
 *   translation-hash-missing                   (info)   blind-spot marker: no canonical version AND no source_hash → freshness unverifiable (XSPEC-248)
 *
 * `adopter-must-match-installed-locale` is deferred (needs project context,
 * not source-tree level).
 *
 * @module lint/i18n
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname, basename, resolve } from 'path';
import { createHash } from 'crypto';

// CJK Unified Ideographs ranges (excluding fullwidth punctuation, but
// including ranges Ext-A/B used by zh-TW/zh-CN). Hangul, Hiragana,
// Katakana included to also flag accidentally-mixed CJK content.
const CJK_REGEX = /[㐀-䶿一-鿿豈-﫿぀-ゟ゠-ヿ가-힯]/;

// ASCII-only regex (allow printable ASCII + space + common punctuation).
// Anything outside extended-ASCII counts as non-ASCII for description purposes.
// Control chars \x09 (tab), \x0A (LF), \x0D (CR) are intentionally allowed.
// eslint-disable-next-line no-control-regex
const NON_ASCII_REGEX = /[^\x09\x0A\x0D\x20-\x7E]/;

// Global variant of CJK_REGEX (same character ranges, derived to avoid
// re-typing the ranges) — used to *count* CJK characters for the
// l3-language-consistency ratio check (bilingual templates vs. real drift).
const CJK_GLOBAL_REGEX = new RegExp(CJK_REGEX.source, 'g');

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
 * Compute a stable content hash of a canonical file: sha256 of its content
 * with CRLF normalized and trailing whitespace stripped, truncated to 12 hex.
 *
 * Used for `source_hash` drift detection (XSPEC-248), which — unlike the
 * version-gap check — does NOT depend on the canonical carrying a `version:`
 * field. This is what catches "silent drift": canonical content changed but
 * nobody bumped the locale's version metadata.
 *
 * @param {string} filePath - Absolute path to canonical file
 * @returns {string|null} 12-hex digest, or null if file is missing
 */
export function computeSourceHash(filePath) {
  if (!existsSync(filePath)) return null;
  const normalized = readFileSync(filePath, 'utf-8')
    .replace(/\r\n/g, '\n')
    .replace(/\s+$/, '');
  return createHash('sha256').update(normalized).digest('hex').slice(0, 12);
}

/**
 * Lint a canonical SKILL.md or core/*.md file for English-only frontmatter
 * and L3 language consistency.
 *
 * @param {string} skillMdPath - Absolute path to canonical file
 * @returns {Array<{rule, severity, line, message, file}>}
 */
export function lintCanonical(skillMdPath, opts = {}) {
  // opts.isGuide — canonical guide.md (XSPEC-248): guide descriptions
  // legitimately carry CJK discoverability keywords (e.g. "可觀測性"), so the
  // ASCII-description rule does NOT apply. The l3 body check still does (and
  // runs regardless of description language, since there is no ASCII rule to
  // double-report against).
  const { isGuide = false } = opts;
  const findings = [];
  if (!existsSync(skillMdPath)) return findings;
  const content = readFileSync(skillMdPath, 'utf-8');
  const { fm, body } = parseFrontmatter(content);

  // Rule: canonical:description-must-be-ascii (SKILL.md / core only; not guides)
  if (!isGuide && fm && fm.description) {
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
  // non-English example response text. For SKILL.md/core only run when the
  // description is ASCII (otherwise the description-must-be-ascii error already
  // covers it); for guides (no ASCII rule) always scan the body.
  const runL3 = isGuide
    ? true
    : Boolean(fm && fm.description && !NON_ASCII_REGEX.test(fm.description.value));
  if (runL3) {
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
      // ```text, ```output, ```response). Only flag when the block is
      // *predominantly* CJK — i.e. an untranslated example dumped into
      // canonical. Deliberate bilingual `English | 中文` templates (house
      // style) stay English-dominant, so they are allowed; a Chinese-only
      // example response is CJK-dominant and still caught. (XSPEC-248 l3
      // refinement — rule vs. bilingual-convention tension.)
      if (CJK_REGEX.test(block)) {
        const cjkCount = (block.match(CJK_GLOBAL_REGEX) || []).length;
        const asciiLetterCount = (block.match(/[A-Za-z]/g) || []).length;
        if (cjkCount > asciiLetterCount) {
          // Compute approx. line number of the fence start
          const lineNum = content.substring(0, match.index).split('\n').length;
          findings.push({
            rule: 'canonical:l3-language-consistency',
            severity: 'warn',
            line: lineNum,
            file: skillMdPath,
            message: `Canonical body contains a predominantly-CJK example response inside a non-code fenced block (lang=\`${lang || 'plain'}\`). Move the translated example to the locale variant (bilingual \`EN | 中文\` templates are allowed).`
          });
          // Only report first occurrence per file to keep output readable
          break;
        }
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

  // Rules: translation-drift-warn (version) + translation-content-drift-warn (hash) + translation-hash-missing
  if (fm.source && fm.translation_version) {
    // Resolve source path relative to this file's directory
    const sourceRel = fm.source.value;
    const sourcePath = resolve(dirname(skillMdPath), sourceRel);
    const actualSourceVersion = readSourceVersion(sourcePath);

    // (a) version-gap drift — only works when the canonical carries a version
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

    // (b) content-hash drift — version-independent; catches SILENT drift (XSPEC-248)
    if (fm.source_hash) {
      const currentHash = computeSourceHash(sourcePath);
      if (currentHash && currentHash !== fm.source_hash.value) {
        findings.push({
          rule: 'translation-content-drift-warn',
          severity: 'warn',
          line: fm.source_hash.line,
          file: skillMdPath,
          message: `Canonical content changed since last sync (source_hash \`${fm.source_hash.value}\` != current \`${currentHash}\`). Re-translate and update source_hash.`
        });
      }
    } else if (!actualSourceVersion) {
      // (c) blind-spot marker: neither a canonical version NOR a source_hash exists,
      // so content freshness cannot be verified at all (how brainstorm rotted to v1.0).
      findings.push({
        rule: 'translation-hash-missing',
        severity: 'info',
        line: fm.source.line,
        file: skillMdPath,
        message: 'Cannot verify content freshness: canonical has no version field and locale has no source_hash. Stamp source_hash (sha256[:12] of canonical) to enable silent-drift detection.'
      });
    }
  }

  return findings;
}

/**
 * Batch-lint a UDS project tree. Scans canonical `skills/` (SKILL.md + guide.md)
 * and `core/`, plus `locales/{locale}/skills/` (SKILL.md + guide.md) and
 * `locales/{locale}/core/`. Canonical guide.md uses the guide ruleset
 * (CJK discoverability keywords allowed in description; XSPEC-248).
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

  // --- Canonical skills (SKILL.md + guide.md) ---
  if (existsSync(skillsDir)) {
    for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillFile = join(skillsDir, entry.name, 'SKILL.md');
      if (existsSync(skillFile)) {
        findings.push(...lintCanonical(skillFile));
      }
      // XSPEC-248: guide.md uses the guide ruleset (CJK description allowed).
      const guideFile = join(skillsDir, entry.name, 'guide.md');
      if (existsSync(guideFile)) {
        findings.push(...lintCanonical(guideFile, { isGuide: true }));
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
          // XSPEC-248: locale guide.md reuses the locale ruleset (freshness checks).
          const guideFile = join(localeSkillsDir, entry.name, 'guide.md');
          if (existsSync(guideFile)) {
            findings.push(...lintLocale(guideFile, locale));
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
    infos: findings.filter(f => f.severity === 'info'),
  };
}
