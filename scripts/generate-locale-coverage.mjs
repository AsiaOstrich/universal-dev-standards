#!/usr/bin/env node
/**
 * Locale Coverage Generator
 * (XSPEC-239 §Task #4 — P1-CLI-4)
 *
 * Scans canonical skills/ and core/ vs locales/{lang}/, then writes
 * locales/COVERAGE.md with a coverage matrix plus drift warnings.
 *
 * Usage:
 *   node scripts/generate-locale-coverage.mjs [--check]
 *
 * Flags:
 *   --check   Do not write file; print to stdout and exit 1 if any
 *             locale is < 100% complete (useful for CI).
 *
 * Auto-generated output: locales/COVERAGE.md
 */

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SKILLS_DIR = join(ROOT, 'skills');
const CORE_DIR = join(ROOT, 'core');
const LOCALES_DIR = join(ROOT, 'locales');
const OUTPUT_PATH = join(LOCALES_DIR, 'COVERAGE.md');

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');

// Non-skill directories to skip when iterating canonical skills/.
const SKILL_SKIP_DIRS = new Set(['commands', 'workflows', 'agents', 'tools', '_shared']);

/**
 * Read YAML front matter as a flat key→value map. Only top-level scalar
 * keys are extracted (we never need nested values here).
 */
function readFrontmatter(filePath) {
  if (!existsSync(filePath)) return null;
  const content = readFileSync(filePath, 'utf-8');
  if (!content.startsWith('---')) return {};
  const end = content.indexOf('\n---', 3);
  if (end === -1) return {};
  const block = content.slice(3, end);
  const out = {};
  for (const line of block.split('\n')) {
    const m = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    // Strip wrapping quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[m[1]] = value;
  }
  return out;
}

/**
 * Extract a Version line from the first 20 lines of a markdown file.
 * Supports YAML front matter (`version:`), `**Version**: x.y.z`, and
 * `> Version: x.y.z` patterns. Returns null if none found.
 */
function readSourceVersion(filePath) {
  if (!existsSync(filePath)) return null;
  const lines = readFileSync(filePath, 'utf-8').split('\n').slice(0, 30);
  for (const line of lines) {
    let m = line.match(/^\s*version:\s*(\S+)/i);
    if (m) return m[1].trim();
    m = line.match(/^\s*\*\*Version\*\*:\s*([\d][^|\s]*)/i);
    if (m) return m[1].trim();
    m = line.match(/^\s*>\s*Version:\s*([\d][^|\s]*)/i);
    if (m) return m[1].trim();
  }
  return null;
}

/** List immediate subdirectories of dir. */
function listDirs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

/** List immediate markdown files of dir (non-recursive). */
function listMdFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith('.md'))
    .map(d => d.name);
}

/** Canonical skill list — directories under skills/ that contain SKILL.md. */
function getCanonicalSkills() {
  return listDirs(SKILLS_DIR)
    .filter(name => !SKILL_SKIP_DIRS.has(name))
    .filter(name => existsSync(join(SKILLS_DIR, name, 'SKILL.md')))
    .sort();
}

/** Canonical core standards list — *.md files under core/. */
function getCanonicalCoreStandards() {
  return listMdFiles(CORE_DIR).sort();
}

/** Detect locales (subdirectories of locales/). */
function getLocales() {
  return listDirs(LOCALES_DIR)
    .filter(name => /^[a-z]{2}(-[A-Z]{2})?$/.test(name))
    .sort();
}

/**
 * Compare two semver strings; returns delta in minor versions
 * (sourceMinor - translationMinor). Returns null if unparseable or
 * major versions differ (in which case caller should treat as "major gap").
 */
function minorGap(translationVersion, sourceVersion) {
  if (!translationVersion || !sourceVersion) return null;
  const t = translationVersion.split('-')[0].split('.').map(Number);
  const s = sourceVersion.split('-')[0].split('.').map(Number);
  if (t.some(Number.isNaN) || s.some(Number.isNaN)) return null;
  if ((t[0] || 0) !== (s[0] || 0)) {
    // Major bump — represent as +Infinity gap
    return { major: true, gap: Infinity };
  }
  return { major: false, gap: (s[1] || 0) - (t[1] || 0) };
}

/**
 * Build coverage data for a single locale across skills + core.
 */
function buildLocaleData(locale, canonicalSkills, canonicalCore) {
  const skillsDir = join(LOCALES_DIR, locale, 'skills');
  const coreDir = join(LOCALES_DIR, locale, 'core');

  const skills = canonicalSkills.map(name => {
    const localePath = join(skillsDir, name, 'SKILL.md');
    if (!existsSync(localePath)) {
      return { name, present: false };
    }
    const fm = readFrontmatter(localePath) || {};
    // Resolve actual source version: prefer reading source markdown.
    const sourcePath = join(SKILLS_DIR, name, 'SKILL.md');
    const actualSourceVersion = readSourceVersion(sourcePath);
    return {
      name,
      present: true,
      translationVersion: fm.translation_version || null,
      declaredSourceVersion: fm.source_version || null,
      actualSourceVersion,
    };
  });

  const core = canonicalCore.map(file => {
    const localePath = join(coreDir, file);
    if (!existsSync(localePath)) {
      return { name: file, present: false };
    }
    const fm = readFrontmatter(localePath) || {};
    const sourcePath = join(CORE_DIR, file);
    const actualSourceVersion = readSourceVersion(sourcePath);
    return {
      name: file,
      present: true,
      translationVersion: fm.translation_version || null,
      declaredSourceVersion: fm.source_version || null,
      actualSourceVersion,
    };
  });

  return { locale, skills, core };
}

/**
 * Format a per-locale cell. Returns "OK x.y.z", "—" (missing), or
 * "OK x.y.z (drift)" / "OK x.y.z (major)" for warnings.
 */
function formatCell(entry) {
  if (!entry.present) return ':x:';
  const tv = entry.translationVersion;
  const sv = entry.actualSourceVersion;
  if (!tv) return ':white_check_mark: ?';
  const gap = minorGap(tv, sv);
  if (gap && gap.major) return `:warning: ${tv} (major)`;
  if (gap && gap.gap > 2) return `:warning: ${tv} (drift ${gap.gap}m)`;
  return `:white_check_mark: ${tv}`;
}

/** Compute coverage percent. */
function pct(have, total) {
  if (total === 0) return '100%';
  return `${((have / total) * 100).toFixed(0)}%`;
}

/** Build markdown content. */
function buildMarkdown(canonicalSkills, canonicalCore, localeData) {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push('# UDS Locale Coverage');
  lines.push('');
  lines.push(`> Auto-generated by \`scripts/generate-locale-coverage.mjs\` on ${today}.`);
  lines.push('> Do not edit manually — re-run the script.');
  lines.push('');
  lines.push(`> **Canonical**: \`skills/\` (${canonicalSkills.length}) + \`core/\` (${canonicalCore.length}). **Locales tracked**: ${localeData.map(l => `\`${l.locale}\``).join(', ') || '(none)'}.`);
  lines.push('');

  // === Skills table ===
  lines.push(`## Skills (${canonicalSkills.length} canonical)`);
  lines.push('');
  const headerSkills = ['Skill', ...localeData.map(l => l.locale)];
  const alignSkills = [':--', ...localeData.map(() => ':-:')];
  lines.push(`| ${headerSkills.join(' | ')} |`);
  lines.push(`| ${alignSkills.join(' | ')} |`);
  for (let i = 0; i < canonicalSkills.length; i++) {
    const skillName = canonicalSkills[i];
    const cells = localeData.map(ld => formatCell(ld.skills[i]));
    lines.push(`| ${skillName} | ${cells.join(' | ')} |`);
  }
  lines.push('');
  for (const ld of localeData) {
    const have = ld.skills.filter(s => s.present).length;
    lines.push(`**${ld.locale} skills coverage**: ${have}/${canonicalSkills.length} (${pct(have, canonicalSkills.length)})`);
  }
  lines.push('');

  // === Core standards table ===
  lines.push(`## Standards (\`core/\` — ${canonicalCore.length} canonical)`);
  lines.push('');
  const headerCore = ['Standard', ...localeData.map(l => l.locale)];
  const alignCore = [':--', ...localeData.map(() => ':-:')];
  lines.push(`| ${headerCore.join(' | ')} |`);
  lines.push(`| ${alignCore.join(' | ')} |`);
  for (let i = 0; i < canonicalCore.length; i++) {
    const stdName = canonicalCore[i];
    const cells = localeData.map(ld => formatCell(ld.core[i]));
    lines.push(`| ${stdName} | ${cells.join(' | ')} |`);
  }
  lines.push('');
  for (const ld of localeData) {
    const have = ld.core.filter(s => s.present).length;
    lines.push(`**${ld.locale} core coverage**: ${have}/${canonicalCore.length} (${pct(have, canonicalCore.length)})`);
  }
  lines.push('');

  // === Drift warnings ===
  lines.push('## Drift Warnings');
  lines.push('');
  lines.push('Locale variants whose `translation_version` lags `source_version` by more than 2 minor versions, or by any major version. (Per XSPEC-239 Chimera Prevention — `translation-drift-warn`.)');
  lines.push('');
  let driftCount = 0;
  for (const ld of localeData) {
    const drifts = [];
    const collectDrift = (kind, entry) => {
      if (!entry.present) return;
      const tv = entry.translationVersion;
      const sv = entry.actualSourceVersion;
      const gap = minorGap(tv, sv);
      if (!gap) return;
      if (gap.major) {
        drifts.push(`- **${kind}/${entry.name}**: translation \`${tv}\` vs source \`${sv}\` (major-version gap)`);
        driftCount++;
      } else if (gap.gap > 2) {
        drifts.push(`- **${kind}/${entry.name}**: translation \`${tv}\` vs source \`${sv}\` (${gap.gap} minor versions behind)`);
        driftCount++;
      }
    };
    ld.skills.forEach(s => collectDrift('skill', s));
    ld.core.forEach(s => collectDrift('core', s));
    if (drifts.length > 0) {
      lines.push(`### ${ld.locale}`);
      lines.push('');
      lines.push(...drifts);
      lines.push('');
    }
  }
  if (driftCount === 0) {
    lines.push('_None — all locale variants are within 2 minor versions of source._');
    lines.push('');
  }

  // === Legend ===
  lines.push('## Legend');
  lines.push('');
  lines.push('| Symbol | Meaning |');
  lines.push('|--------|---------|');
  lines.push('| :white_check_mark: `x.y.z` | Translated; `translation_version` shown |');
  lines.push('| :warning: `x.y.z` (drift) | Translation lags source by > 2 minor versions |');
  lines.push('| :warning: `x.y.z` (major) | Translation lags source by a major version |');
  lines.push('| :x: | Not translated for this locale |');
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// Main
// ============================================================

const canonicalSkills = getCanonicalSkills();
const canonicalCore = getCanonicalCoreStandards();
const locales = getLocales();
const localeData = locales.map(l => buildLocaleData(l, canonicalSkills, canonicalCore));

const markdown = buildMarkdown(canonicalSkills, canonicalCore, localeData);

if (checkOnly) {
  process.stdout.write(markdown);
  // Exit 1 if any locale below 100%
  let hasGap = false;
  for (const ld of localeData) {
    const skillHave = ld.skills.filter(s => s.present).length;
    const coreHave = ld.core.filter(s => s.present).length;
    if (skillHave < canonicalSkills.length || coreHave < canonicalCore.length) {
      hasGap = true;
      break;
    }
  }
  process.exit(hasGap ? 1 : 0);
} else {
  writeFileSync(OUTPUT_PATH, markdown);
  const rel = relative(ROOT, OUTPUT_PATH);
  process.stdout.write(`Wrote ${rel}\n`);
  process.stdout.write(`  Locales: ${locales.join(', ')}\n`);
  for (const ld of localeData) {
    const sk = ld.skills.filter(s => s.present).length;
    const co = ld.core.filter(s => s.present).length;
    process.stdout.write(
      `  ${ld.locale}: skills ${sk}/${canonicalSkills.length}, core ${co}/${canonicalCore.length}\n`
    );
  }
}
