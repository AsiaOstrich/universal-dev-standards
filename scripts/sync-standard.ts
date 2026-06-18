#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * sync-standard.ts — XSPEC-292 §10.1 one-shot four-layer standard sync.
 *
 * Eliminates the manual four-layer drift called out in DEC-045 / XSPEC-292 §6.
 * Given a `core/<name>.md` (with its `**Version**` already set), propagate to
 * every layer so they never silently diverge:
 *
 *   1. ai/standards/<id>.ai.yaml   — regenerated from core ONLY with --regen.
 *                                     These files are often hand-curated (a
 *                                     token-efficient summary); the machine
 *                                     generator emits a verbose extraction that
 *                                     would clobber that curation, so
 *                                     regeneration is opt-in.
 *   2. .standards/<id>.ai.yaml     — UDS self-adoption copy, refreshed from (1)
 *   3. locales/<lang>/core/<name>.md — marked `status: stale` when the
 *      translation's `source_version` lags the new core version. The version
 *      fields are deliberately NOT touched: `source_version` stays the
 *      translator's signal and the input to check-translation-sync.sh, which
 *      detects staleness by comparing it to the live core version.
 *   4. cli/standards-registry.json — verified only (entry + source.ai present);
 *      never auto-edited (renames/additions are an intentional human action).
 *
 * This is the prerequisite tool for §10.2/§10.3 (glossary / failure-path /
 * threshold content edits): edit a core/*.md, then run this to fan the change
 * out to the other three layers in one shot.
 *
 * Usage:
 *   tsx scripts/sync-standard.ts <name|core/<name>.md> [...more] [--check]
 *   tsx scripts/sync-standard.ts --all [--check]
 *
 *   --check   Dry-run: report what is out of sync, write nothing. Exits 1 when
 *             any layer needs syncing (.standards drift / locale lagging /
 *             registry missing / standard not found), else 0 — usable as a CI
 *             gate. Without --check, applies the changes.
 *   --help    Show usage.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getOutputFilename, getSupportedLocales } from '../cli/src/utils/conversion-rules.js';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

// ── Pure helpers (exported for unit reuse) ──────────────────────────────────

/** Normalize a CLI argument to a bare standard name (strip dir + .md). */
export function resolveStandardName(arg: string): string {
  return arg
    .trim()
    .replace(/^core\//, '')
    .replace(/^locales\/[^/]+\/core\//, '')
    .replace(/\.md$/, '');
}

/**
 * Extract `**Version**: X.Y.Z` from a core standard's markdown. Accepts both the
 * plain header and a blockquote single-line variant — `> **Version**: X.Y.Z |
 * **Status**: ...` (used by e.g. pii-classification) — so the optional `> `
 * prefix doesn't make the version read as unknown.
 */
export function parseCoreVersion(md: string): string | null {
  const m = md.match(/^>?\s*\*\*Version\*\*:\s*([0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.]+)?)/m);
  return m ? m[1] : null;
}

/** Compare two semver strings (pre-release suffix ignored). -1 / 0 / 1. */
export function cmpSemver(a: string, b: string): number {
  const pa = String(a).split('-')[0].split('.').map(Number);
  const pb = String(b).split('-')[0].split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}

/** Split a markdown file into its leading YAML frontmatter block and the rest. */
export function splitFrontmatter(
  content: string
): { block: string; inner: string; rest: string } | null {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  return { block: m[0], inner: m[1], rest: content.slice(m[0].length) };
}

/** Read a single-line `key: value` field from frontmatter inner text. */
export function getFrontmatterField(inner: string, key: string): string | null {
  const m = inner.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim() : null;
}

/** Return content with frontmatter `status` set to `stale` (idempotent). */
export function markFrontmatterStale(content: string): string {
  const fm = splitFrontmatter(content);
  if (!fm) return content;
  let inner = fm.inner;
  if (/^status:\s*.+$/m.test(inner)) {
    inner = inner.replace(/^status:\s*.+$/m, 'status: stale');
  } else {
    inner = `${inner}\nstatus: stale`;
  }
  return `---\n${inner}\n---\n${fm.rest}`;
}

// ── Orchestration ───────────────────────────────────────────────────────────

interface SyncReport {
  name: string;
  version: string;
  actions: string[];
  drift: boolean;
  error: string | null;
}

function syncOne(name: string, opts: { check: boolean; regen: boolean }): SyncReport {
  const { check, regen } = opts;
  const corePath = `core/${name}.md`;
  const coreAbs = join(ROOT, corePath);
  const report: SyncReport = { name, version: '(unknown)', actions: [], drift: false, error: null };

  if (!existsSync(coreAbs)) {
    report.error = `core standard not found: ${corePath}`;
    report.drift = true;
    return report;
  }

  const coreMd = readFileSync(coreAbs, 'utf-8');
  report.version = parseCoreVersion(coreMd) || '(unknown)';

  // Resolve the ai/standards path. The registry's source.ai is AUTHORITATIVE —
  // it survives id renames (checkin-standards → checkin) and irregular plurals
  // (error-code-standards → error-codes.ai.yaml) that getOutputFilename cannot
  // reproduce. Fall back to the conversion-rules mapping, then the literal name.
  let regEntry: { id?: string; source?: { human?: string; ai?: string } } | null = null;
  try {
    const reg = JSON.parse(readFileSync(join(ROOT, 'cli/standards-registry.json'), 'utf-8'));
    regEntry = (reg.standards || []).find(
      (s: { id?: string; source?: { human?: string; ai?: string } }) =>
        s?.source?.human === corePath || s?.id === name
    ) || null;
  } catch { /* registry read errors surface in the verify step below */ }

  let aiRel: string;
  if (regEntry?.source?.ai && existsSync(join(ROOT, regEntry.source.ai))) {
    aiRel = regEntry.source.ai;
  } else {
    let mapped = getOutputFilename(`${name}.md`);
    if (!existsSync(join(ROOT, 'ai/standards', mapped)) &&
        existsSync(join(ROOT, 'ai/standards', `${name}.ai.yaml`))) {
      mapped = `${name}.ai.yaml`;
    }
    aiRel = `ai/standards/${mapped}`;
  }
  const outName = aiRel.split('/').pop() as string;
  const stdRel = `.standards/${outName}`;
  const aiAbs = join(ROOT, aiRel);
  const stdAbs = join(ROOT, stdRel);

  // 1. ai/standards — regenerate from core ONLY when explicitly requested.
  //    These files are frequently hand-maintained; convert-md-to-yaml.mjs emits
  //    a verbose machine extraction that would clobber that curation (even with
  //    --preserve). Regeneration is therefore opt-in (--regen); by default
  //    ai.yaml stays the human's and we only reconcile the downstream copies.
  if (regen) {
    if (check) {
      report.actions.push(`would regenerate ${aiRel} (convert-md-to-yaml.mjs, --regen)`);
    } else {
      execFileSync('node', ['scripts/convert-md-to-yaml.mjs', corePath], { cwd: ROOT, stdio: 'inherit' });
      report.actions.push(`regenerated ${aiRel} (--regen)`);
    }
  } else {
    report.actions.push(`${aiRel}: hand-maintained — regeneration skipped (pass --regen to overwrite from core)`);
  }

  // 2. .standards — refresh the self-adoption copy from ai/standards.
  if (existsSync(aiAbs)) {
    const aiContent = readFileSync(aiAbs, 'utf-8');
    const stdDrift = !existsSync(stdAbs) || readFileSync(stdAbs, 'utf-8') !== aiContent;
    if (stdDrift) {
      report.drift = true;
      if (check) {
        report.actions.push(`.standards out of sync → would copy ${aiRel} → ${stdRel}`);
      } else {
        copyFileSync(aiAbs, stdAbs);
        report.actions.push(`copied ${aiRel} → ${stdRel}`);
      }
    } else {
      report.actions.push('.standards in sync');
    }
  } else if (!check) {
    report.error = `expected ${aiRel} after regeneration but it is missing`;
    return report;
  }

  // 3. locales — mark stale when the translation lags the core version.
  for (const locale of getSupportedLocales()) {
    const locRel = `locales/${locale}/core/${name}.md`;
    const locAbs = join(ROOT, locRel);
    if (!existsSync(locAbs)) continue;
    const locContent = readFileSync(locAbs, 'utf-8');
    const fm = splitFrontmatter(locContent);
    if (!fm) continue;
    const sv = getFrontmatterField(fm.inner, 'source_version');
    const status = getFrontmatterField(fm.inner, 'status');
    const lags = sv != null && report.version !== '(unknown)' && cmpSemver(sv, report.version) < 0;
    if (lags && status !== 'stale') {
      report.drift = true;
      if (check) {
        report.actions.push(`locale ${locale}: lags (source_version ${sv} < ${report.version}) → would mark stale`);
      } else {
        writeFileSync(locAbs, markFrontmatterStale(locContent), 'utf-8');
        report.actions.push(`locale ${locale}: marked stale (source_version ${sv} < ${report.version})`);
      }
    } else if (lags) {
      report.actions.push(`locale ${locale}: already stale`);
    } else {
      report.actions.push(`locale ${locale}: current`);
    }
  }

  // 4. registry — verify only (reuse the entry resolved above).
  try {
    if (!regEntry) {
      report.drift = true;
      report.error = `no registry entry for '${name}' (looked for source.human=${corePath} / id=${name})`;
    } else {
      report.actions.push(`registry entry OK (id=${regEntry.id})`);
    }
  } catch (e) {
    report.error = `failed to read registry: ${(e as Error).message}`;
  }

  return report;
}

function usage(): void {
  console.log(`
sync-standard.ts — XSPEC-292 §10.1 four-layer standard sync

Usage:
  tsx scripts/sync-standard.ts <name|core/<name>.md> [...more] [--check]
  tsx scripts/sync-standard.ts --all [--check]

Propagates a core/<name>.md change to all four layers:
  1. ai/standards/<id>.ai.yaml   (regenerated from core ONLY with --regen;
                                  hand-curated otherwise — left untouched)
  2. .standards/<id>.ai.yaml     (UDS self-adoption copy, refreshed from ai/)
  3. locales/*/core/<name>.md    (marked 'status: stale' when source_version lags)
  4. cli/standards-registry.json (verified only — never auto-edited)

Options:
  --regen   Regenerate ai/standards/<id>.ai.yaml from core via
            convert-md-to-yaml.mjs. WARNING: overwrites hand-curated content
            with a verbose machine extraction. Off by default.
  --check   Dry-run: report drift, write nothing; exit 1 if any layer needs sync.
  --help    Show this help.
`);
}

function main(): void {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) {
    usage();
    process.exit(0);
  }

  const check = argv.includes('--check');
  const regen = argv.includes('--regen');
  const all = argv.includes('--all');
  const names = argv.filter((a) => !a.startsWith('-')).map(resolveStandardName);

  let targets: string[];
  if (all) {
    targets = readdirSync(join(ROOT, 'core'))
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''));
  } else {
    targets = names;
  }

  if (targets.length === 0) {
    console.error('Error: no standard specified.');
    usage();
    process.exit(1);
  }

  let hadError = false;
  let hadDrift = false;

  for (const name of targets) {
    const r = syncOne(name, { check, regen });
    console.log(`\n${check ? '[check] ' : ''}${r.name} (v${r.version})`);
    for (const a of r.actions) console.log(`  - ${a}`);
    if (r.error) {
      console.error(`  ✗ ${r.error}`);
      hadError = true;
    }
    if (r.drift) hadDrift = true;
  }

  console.log('');
  if (hadError) process.exit(1);
  if (check && hadDrift) process.exit(1);
  process.exit(0);
}

main();
