#!/usr/bin/env tsx
/**
 * Skill↔Standard Content-Coverage Audit (XSPEC-070 Phase 2)
 * Skill↔Standard 內容覆蓋稽核
 *
 * The original skill-standard-alignment-check (XSPEC-070 Phase 1) only proves an
 * anchor *exists* (orphan detection). A skill can carry a valid `anchor_standard`
 * and still drift: the standard gains a mandatory section, bumps its version, or
 * grows far beyond the skill's stale summary. This audit closes that gap with
 * three content-level checks, evaluated per `(skill, anchor_standard)` pair:
 *
 *   ① version skew      (CONTENT-001) — skill `**Version**` < anchor standard
 *                                       version (from core/<id>.md). An
 *                                       unversioned skill is advisory-only and
 *                                       never blocks.
 *   ② mandatory keyword (CONTENT-002) — a keyword the standard declares as
 *                                       mandatory (`standard.audit.mandatory_keywords`
 *                                       in its .ai.yaml) is absent from the skill
 *                                       body.
 *   ③ size ratio        (CONTENT-003) — skill is far smaller than its anchor
 *                                       standard (lines ratio < min_skill_ratio),
 *                                       i.e. an underspecified skeleton.
 *
 * Default mode is **advisory**: findings are printed, exit code stays 0 so the
 * audit can land before every drift is fixed. `--strict` promotes CONTENT-001 /
 * CONTENT-002 / CONTENT-003 to blocking failures (exit 1); the unversioned-skill
 * advisory (CONTENT-001A) is informational and never blocks.
 *
 * Usage:
 *   tsx scripts/check-skill-content-coverage.ts
 *   tsx scripts/check-skill-content-coverage.ts --strict
 *   tsx scripts/check-skill-content-coverage.ts --skills-dir /tmp/s \
 *       --registry /tmp/r.json --root /tmp
 *
 * Exit codes:
 *   0 — no blocking findings (advisory findings may still be printed)
 *   1 — at least one blocking finding (only under --strict)
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';

// ── Local copies of sync-standard.ts helpers ──────────────────────────────────
// Imported inline rather than from ./sync-standard.js: that module runs main()
// at load time (it is a CLI entrypoint), so importing it would execute the sync.
// These four helpers are pure and intentionally kept identical to their source.

/** Extract `**Version**: X.Y.Z` from markdown (plain or blockquote variant). */
function parseCoreVersion(md: string): string | null {
  const m = md.match(/^>?\s*\*\*Version\*\*:\s*([0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.]+)?)/m);
  return m ? m[1] : null;
}

/** Compare two semver strings (pre-release suffix ignored). -1 / 0 / 1. */
function cmpSemver(a: string, b: string): number {
  const pa = String(a).split('-')[0].split('.').map(Number);
  const pb = String(b).split('-')[0].split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

/** Split a markdown file into its leading YAML frontmatter block and the rest. */
function splitFrontmatter(
  content: string,
): { block: string; inner: string; rest: string } | null {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  return { block: m[0], inner: m[1], rest: content.slice(m[0].length) };
}

/** Read a scalar frontmatter field value (single line). */
function getFrontmatterField(inner: string, key: string): string | null {
  const m = inner.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim() : null;
}

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = dirname(__filename);
const ROOT_DIR = dirname(SCRIPT_DIR);

// ANSI colours
const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const CYAN = '\x1b[0;36m';
const NC = '\x1b[0m';

// Directories inside skills/ that are NOT individual skills.
const NON_SKILL_DIRS = new Set([
  '_shared', 'agents', 'ai', 'commands', 'tools', 'workflows',
]);

// A skill whose line count is below this fraction of its anchor standard's line
// count is flagged as underspecified, unless the standard overrides it via
// `standard.audit.min_skill_ratio`.
const DEFAULT_MIN_SKILL_RATIO = 0.15;

// ── CLI argument parsing ──────────────────────────────────────────────────────

const args = process.argv.slice(2);
let skillsDir = join(ROOT_DIR, 'skills');
let registryPath = join(ROOT_DIR, 'cli', 'standards-registry.json');
let rootDir = ROOT_DIR;
let strict = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--skills-dir' && args[i + 1]) {
    skillsDir = args[++i];
  } else if (args[i] === '--registry' && args[i + 1]) {
    registryPath = args[++i];
  } else if (args[i] === '--root' && args[i + 1]) {
    rootDir = args[++i];
  } else if (args[i] === '--strict') {
    strict = true;
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface RegistryEntry {
  id: string;
  source?: { human?: string; ai?: string };
}

interface StandardAudit {
  mandatory_keywords?: string[];
  min_skill_ratio?: number;
}

interface Finding {
  code: string;
  skill: string;
  standard: string;
  message: string;
  blocking: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isDir(p: string): boolean {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

function countLines(s: string): number {
  if (s.length === 0) return 0;
  return s.split('\n').length;
}

/** id → registry entry, for anchor resolution. */
function loadRegistry(): Map<string, RegistryEntry> {
  const map = new Map<string, RegistryEntry>();
  if (!existsSync(registryPath)) return map;
  try {
    const raw = JSON.parse(readFileSync(registryPath, 'utf8')) as { standards?: RegistryEntry[] };
    for (const e of raw.standards ?? []) {
      if (e?.id) map.set(e.id, e);
    }
  } catch {
    /* ignore — empty map degrades gracefully */
  }
  return map;
}

/** Parse `anchor_standard` (scalar or inline list) from a skill's frontmatter. */
function parseAnchors(skillMd: string): string[] {
  const fm = splitFrontmatter(skillMd);
  if (!fm) return [];
  const raw = getFrontmatterField(fm.inner, 'anchor_standard');
  if (raw == null) return [];
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'none') return [];
  if (trimmed.startsWith('[')) {
    return trimmed
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }
  return [trimmed.replace(/^['"]|['"]$/g, '')];
}

/**
 * Read the `audit` block from a standard's .ai.yaml (best-effort).
 * The ai.yaml schema is not uniform across the repo: some files wrap everything
 * under a top-level `standard:` key, others put `id`/`meta` at the top level.
 * Accept the audit block in either position.
 */
function loadAudit(aiPath: string): StandardAudit {
  if (!existsSync(aiPath)) return {};
  try {
    const doc = yaml.load(readFileSync(aiPath, 'utf8')) as
      | { audit?: StandardAudit; standard?: { audit?: StandardAudit } }
      | undefined;
    return doc?.standard?.audit ?? doc?.audit ?? {};
  } catch {
    return {};
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const registry = loadRegistry();
const findings: Finding[] = [];
let skillsChecked = 0;
let pairsChecked = 0;
let skippedNoAnchor = 0;

for (const entry of readdirSync(skillsDir)) {
  const skillDir = join(skillsDir, entry);
  if (!isDir(skillDir) || NON_SKILL_DIRS.has(entry)) continue;

  const skillMdPath = join(skillDir, 'SKILL.md');
  if (!existsSync(skillMdPath)) continue; // structural-integrity gate owns this

  const skillMd = readFileSync(skillMdPath, 'utf8');
  const anchors = parseAnchors(skillMd);
  if (anchors.length === 0) {
    skippedNoAnchor++;
    continue; // orphan detection is the alignment-check's responsibility
  }

  skillsChecked++;
  const skillVersion = parseCoreVersion(skillMd); // works on `**Version**: X.Y.Z`
  const skillLines = countLines(skillMd);
  const skillLower = skillMd.toLowerCase();

  for (const anchor of anchors) {
    const reg = registry.get(anchor);
    if (!reg) {
      // Broken anchor is the alignment-check's domain (ALIGN-002); we only note
      // that content coverage could not be evaluated.
      findings.push({
        code: 'CONTENT-000',
        skill: entry,
        standard: anchor,
        blocking: false,
        message: `anchor "${anchor}" not in registry — content coverage not evaluated`,
      });
      continue;
    }

    pairsChecked++;
    const humanPath = reg.source?.human ? join(rootDir, reg.source.human) : '';
    const aiPath = reg.source?.ai ? join(rootDir, reg.source.ai) : '';

    const standardMd = humanPath && existsSync(humanPath) ? readFileSync(humanPath, 'utf8') : '';
    const standardVersion = standardMd ? parseCoreVersion(standardMd) : null;
    const standardLines = countLines(standardMd);
    const audit = loadAudit(aiPath);

    // ① version skew (CONTENT-001)
    if (standardVersion) {
      if (!skillVersion) {
        findings.push({
          code: 'CONTENT-001A',
          skill: entry,
          standard: anchor,
          blocking: false,
          message: `skill is unversioned — cannot verify against ${anchor} v${standardVersion}`,
        });
      } else if (cmpSemver(skillVersion, standardVersion) < 0) {
        findings.push({
          code: 'CONTENT-001',
          skill: entry,
          standard: anchor,
          blocking: true,
          message: `version skew — skill v${skillVersion} < ${anchor} v${standardVersion} (stale)`,
        });
      }
    }

    // ② mandatory keyword (CONTENT-002)
    for (const kw of audit.mandatory_keywords ?? []) {
      if (!skillLower.includes(String(kw).toLowerCase())) {
        findings.push({
          code: 'CONTENT-002',
          skill: entry,
          standard: anchor,
          blocking: true,
          message: `missing mandatory keyword "${kw}" required by ${anchor}`,
        });
      }
    }

    // ③ size ratio (CONTENT-003)
    if (standardLines > 0) {
      const minRatio = typeof audit.min_skill_ratio === 'number'
        ? audit.min_skill_ratio
        : DEFAULT_MIN_SKILL_RATIO;
      const ratio = skillLines / standardLines;
      if (ratio < minRatio) {
        findings.push({
          code: 'CONTENT-003',
          skill: entry,
          standard: anchor,
          blocking: true,
          message:
            `underspecified — skill ${skillLines} lines vs ${anchor} ${standardLines} lines ` +
            `(ratio ${ratio.toFixed(2)} < ${minRatio})`,
        });
      }
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────────────

const blocking = findings.filter(f => f.blocking);
const advisory = findings.filter(f => !f.blocking);

console.log(`${CYAN}Skill↔Standard content-coverage audit${NC} (XSPEC-070 Phase 2)`);
console.log(
  `  skills with anchor: ${skillsChecked} | pairs checked: ${pairsChecked} | ` +
  `orphans skipped: ${skippedNoAnchor}`,
);
console.log('');

for (const f of findings) {
  const tag = f.blocking ? `${RED}${f.code}${NC}` : `${YELLOW}${f.code}${NC}`;
  console.log(`  ${tag} ${f.skill} → ${f.standard}: ${f.message}`);
}

console.log('');
if (findings.length === 0) {
  console.log(`${GREEN}✓ Content coverage healthy${NC} (no drift detected)`);
  process.exit(0);
}

console.log(
  `Summary: ${blocking.length} blocking, ${advisory.length} advisory finding(s).`,
);

if (strict && blocking.length > 0) {
  console.error(`${RED}✗ Content-coverage audit FAILED${NC} (--strict): ${blocking.length} blocking finding(s)`);
  process.exit(1);
}

console.log(
  `${YELLOW}⚠ Advisory mode${NC} — findings reported, not blocking. ` +
  `Run with --strict to enforce.`,
);
process.exit(0);
