#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * check-model-pin-freshness.ts — capability_registry rot detection (XSPEC-362 R4).
 *
 * DEC-031 D1 requires `version_pinned` / `pin_date` on every capability_registry
 * entry, so that a silent model upgrade cannot change capability unnoticed. It
 * did not require anything to ever *look* at those dates. The result is a
 * registry that expires without saying so: `pin_date: 2026-04-13` sat 120 days
 * past its own 90-day threshold, and on the page it was indistinguishable from
 * a current entry. A recorded date with no clock is a comment.
 *
 * This script is the clock. It reports two kinds of rot:
 *
 *   1. STALE   — `pin_date` or `measured.at` older than THRESHOLD_DAYS.
 *   2. VENDOR  — a concrete vendor model ID in a shipped standard's *examples*.
 *                Examples are read as templates; a real model ID in one is a
 *                citation with an expiry date and no owner. R4 requires
 *                placeholders (`<provider>/<model-name>`) instead.
 *                Suppressed under `integrations/`, which R5 designates as the home
 *                for concrete IDs — see `vendorIdsBelongHere`. STALE is not
 *                suppressed there: the clock is exactly why that tree is scanned.
 *
 * ── WARN, never BLOCK ──────────────────────────────────────────────────────
 * Per XSPEC-361 R8: purely in-file invariants have a measured false-positive
 * rate too high to gate a release on. Findings exit 0. Only an internal error
 * (unreadable tree, unparseable YAML) exits non-zero — because "the checker
 * broke" and "the checker found nothing" must never produce the same output.
 *
 * ── Why it walks instead of enumerating (core/class-level-fix.md) ──────────
 * The file list comes from walking the directories the build itself ships, not
 * from a typed list of standards known to carry a registry. A typed list is
 * correct until the fourth member arrives, and nothing will say so. Every
 * exclusion is counted and printed, so the denominator is visible.
 *
 * ── Proving it is not vacuous ──────────────────────────────────────────────
 * A checker that walks 764 files and finds nothing looks exactly like a checker
 * whose predicates never fire. `--self-test` runs both predicates against
 * synthetic fixtures with known verdicts and reports whether they fired. Run it
 * whenever this file changes.
 *
 * Usage:
 *   tsx scripts/check-model-pin-freshness.ts              # scan, report, exit 0
 *   tsx scripts/check-model-pin-freshness.ts --json       # machine-readable
 *   tsx scripts/check-model-pin-freshness.ts --self-test  # prove predicates fire
 *   THRESHOLD_DAYS=30 tsx scripts/check-model-pin-freshness.ts
 *
 * Exit codes:
 *   0 — scan completed (with or without findings)
 *   2 — internal error; the scan did NOT complete. Not "no findings".
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = dirname(dirname(__filename));

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[0;34m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

const THRESHOLD_DAYS = Number(process.env.THRESHOLD_DAYS ?? '90');

/** Directories walked. Each is a tree the repo actually ships or self-adopts. */
const SCAN_ROOTS = ['ai', '.standards', 'options', 'core', 'integrations'];

/**
 * `integrations/` is the one tree where a concrete vendor model ID is the *required*
 * form, not a defect (XSPEC-362 R5): the standards stay vendor-neutral and the host-layer
 * mapping is where the real identifiers live. So VENDOR is suppressed there.
 *
 * STALE is **not** suppressed, and that is the whole point of scanning the tree at all.
 * The reason a model ID rots in a standard — a citation with an expiry date and no clock —
 * applies to a host mapping just as much. A concrete ID here is correct; a concrete ID
 * here that is 91 days old is not.
 *
 * Suppressed VENDOR hits are recorded in `skipped`, not dropped, so the exclusion stays
 * visible in the denominator rather than becoming an invisible carve-out.
 */
function vendorIdsBelongHere(file: string): boolean {
  return file === '<host-fixture>' || file.split(/[/\\]/)[0] === 'integrations';
}

const args = new Set(process.argv.slice(2));
const JSON_OUTPUT = args.has('--json');
const SELF_TEST = args.has('--self-test');

interface Finding {
  kind: 'STALE' | 'VENDOR';
  file: string;
  modelId: string;
  field: string;
  value: string;
  ageDays?: number;
}

interface Skipped {
  file: string;
  modelId: string;
  field: string;
  value: string;
  reason: string;
}

/**
 * A placeholder is any value wrapped in angle brackets: `<provider>/<model-name>`,
 * `<YYYY-MM-DD>`. Placeholders are the *required* form for examples (R4), so they
 * are excluded from both checks — and counted, so the exclusion is visible.
 */
function isPlaceholder(value: string): boolean {
  return /<[^>]+>/.test(value);
}

/** ISO date → age in whole days, or null when the string is not an ISO date. */
function ageInDays(value: string, now: Date): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const then = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(then)) return null;
  return Math.floor((now.getTime() - then) / 86_400_000);
}

/**
 * Walk one registry entry. `entry` is whatever sat in `capability_registry.examples[]`
 * or in an adopter's registry list — shape is not guaranteed, so every access is guarded.
 */
function inspectEntry(
  entry: unknown,
  file: string,
  now: Date,
  findings: Finding[],
  skipped: Skipped[],
): number {
  if (typeof entry !== 'object' || entry === null) return 0;
  const e = entry as Record<string, unknown>;
  const modelId = typeof e.model_id === 'string' ? e.model_id : '<no model_id>';
  let dateFieldsSeen = 0;

  // ── VENDOR: a concrete model ID where a placeholder belongs ───────────────
  if (typeof e.model_id === 'string') {
    if (isPlaceholder(e.model_id)) {
      skipped.push({
        file,
        modelId,
        field: 'model_id',
        value: e.model_id,
        reason: 'placeholder (the required form)',
      });
    } else if (vendorIdsBelongHere(file)) {
      skipped.push({
        file,
        modelId,
        field: 'model_id',
        value: e.model_id,
        reason: 'host-layer mapping (concrete IDs are the required form here) — STALE still applies',
      });
    } else {
      findings.push({
        kind: 'VENDOR',
        file,
        modelId,
        field: 'model_id',
        value: e.model_id,
      });
    }
  }

  /** Check one date-bearing field. */
  const checkDate = (field: string, raw: unknown): void => {
    if (typeof raw !== 'string') return;
    dateFieldsSeen += 1;
    if (isPlaceholder(raw)) {
      skipped.push({ file, modelId, field, value: raw, reason: 'placeholder date' });
      return;
    }
    const age = ageInDays(raw, now);
    if (age === null) {
      skipped.push({ file, modelId, field, value: raw, reason: 'not an ISO date' });
      return;
    }
    if (age > THRESHOLD_DAYS) {
      findings.push({ kind: 'STALE', file, modelId, field, value: raw, ageDays: age });
    }
  };

  checkDate('pin_date', e.pin_date);

  // R7b: every sub-dimension may carry `measured.at`, which expires on the same clock.
  const caps = e.capabilities;
  if (typeof caps === 'object' && caps !== null) {
    for (const [dim, val] of Object.entries(caps as Record<string, unknown>)) {
      if (typeof val !== 'object' || val === null) continue;
      const measured = (val as Record<string, unknown>).measured;
      if (typeof measured !== 'object' || measured === null) continue;
      checkDate(`capabilities.${dim}.measured.at`, (measured as Record<string, unknown>).at);
    }
  }

  return dateFieldsSeen;
}

/** Recursively locate every `capability_registry` object, at any depth. */
function collectRegistries(node: unknown, out: Record<string, unknown>[]): void {
  if (Array.isArray(node)) {
    for (const child of node) collectRegistries(child, out);
    return;
  }
  if (typeof node !== 'object' || node === null) return;
  for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
    if (key === 'capability_registry' && typeof val === 'object' && val !== null) {
      out.push(val as Record<string, unknown>);
    }
    collectRegistries(val, out);
  }
}

function walkYaml(dir: string, acc: string[]): void {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.git')) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkYaml(full, acc);
    else if (name.endsWith('.ai.yaml') || name.endsWith('.yaml') || name.endsWith('.yml')) {
      acc.push(full);
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Self-test: prove both predicates fire before trusting a clean scan.
// ───────────────────────────────────────────────────────────────────────────
function selfTest(): number {
  const now = new Date('2026-08-12T00:00:00Z');
  const cases: Array<{
    name: string;
    entry: unknown;
    file?: string;
    expect: Finding['kind'] | 'clean';
  }> = [
    {
      name: 'concrete vendor model_id',
      entry: { model_id: 'anthropic/claude-sonnet-4-6', pin_date: '2026-08-01' },
      expect: 'VENDOR',
    },
    {
      name: 'pin_date 120 days old',
      entry: { model_id: '<provider>/<model>', pin_date: '2026-04-13' },
      expect: 'STALE',
    },
    {
      name: 'measured.at expired',
      entry: {
        model_id: '<provider>/<model>',
        capabilities: { 'modality.vision': { declared: true, measured: { at: '2026-01-01' } } },
      },
      expect: 'STALE',
    },
    {
      name: 'fresh placeholder entry (must stay clean)',
      entry: { model_id: '<provider>/<model>', pin_date: '2026-08-01' },
      expect: 'clean',
    },
    {
      name: 'placeholder date (must stay clean, not crash)',
      entry: { model_id: '<provider>/<model>', pin_date: '<YYYY-MM-DD>' },
      expect: 'clean',
    },
    // XSPEC-362 R5 — the host-layer carve-out, in both directions. A suppression that
    // is only tested in the direction it suppresses is indistinguishable from a
    // suppression that swallowed everything.
    {
      name: 'concrete vendor model_id in a host-layer mapping (VENDOR suppressed)',
      entry: { model_id: 'claude-code/opus', pin_date: '2026-08-01' },
      file: '<host-fixture>',
      expect: 'clean',
    },
    {
      name: 'host-layer mapping with an expired pin_date (STALE must still fire)',
      entry: { model_id: 'claude-code/opus', pin_date: '2026-04-13' },
      file: '<host-fixture>',
      expect: 'STALE',
    },
  ];

  let failed = 0;
  console.log(`${BLUE}Self-test — do the predicates actually fire?${NC}`);
  for (const c of cases) {
    const f: Finding[] = [];
    const s: Skipped[] = [];
    inspectEntry(c.entry, c.file ?? '<fixture>', now, f, s);
    const kinds = new Set(f.map((x) => x.kind));
    const ok = c.expect === 'clean' ? f.length === 0 : kinds.has(c.expect);
    console.log(
      `  ${ok ? `${GREEN}[FIRED]${NC}` : `${RED}[DID NOT FIRE]${NC}`} ${c.name} ` +
        `${DIM}(expected ${c.expect}, got ${f.length === 0 ? 'clean' : [...kinds].join('+')})${NC}`,
    );
    if (!ok) failed += 1;
  }
  console.log('');
  if (failed > 0) {
    console.log(`${RED}Self-test failed: ${failed} predicate(s) did not behave as declared.${NC}`);
    console.log('A clean scan from this build proves nothing. Fix before trusting output.');
    return 2;
  }
  console.log(`${GREEN}All ${cases.length} predicates behave as declared.${NC}`);
  return 0;
}

function main(): void {
  if (SELF_TEST) {
    process.exit(selfTest());
  }

  const now = new Date();
  const findings: Finding[] = [];
  const skipped: Skipped[] = [];

  // Denominator, walked — not typed out. Every root that is absent is reported,
  // because "directory missing" and "directory clean" are different facts.
  const files: string[] = [];
  const missingRoots: string[] = [];
  for (const root of SCAN_ROOTS) {
    const full = join(ROOT_DIR, root);
    if (!existsSync(full)) {
      missingRoots.push(root);
      continue;
    }
    walkYaml(full, files);
  }

  if (files.length === 0) {
    console.error(`${RED}[check-model-pin-freshness] No YAML found under ${SCAN_ROOTS.join(', ')}.${NC}`);
    console.error('This is a broken scan, not a clean one. Exiting 2.');
    process.exit(2);
  }

  let filesWithRegistry = 0;
  let entriesInspected = 0;
  let dateFieldsInspected = 0;

  for (const file of files) {
    let doc: unknown;
    try {
      doc = yaml.load(readFileSync(file, 'utf8'));
    } catch (err) {
      // A file that will not parse is not a file without findings.
      console.error(
        `${RED}[check-model-pin-freshness] Could not parse ${relative(ROOT_DIR, file)}: ` +
          `${(err as Error).message}${NC}`,
      );
      process.exit(2);
    }

    const registries: Record<string, unknown>[] = [];
    collectRegistries(doc, registries);
    if (registries.length === 0) continue;
    filesWithRegistry += 1;

    const rel = relative(ROOT_DIR, file);
    for (const reg of registries) {
      // Entries live under `examples` in the standards, and under `entries`/`models`
      // in adopter registries. Take every array value — shape is not guaranteed.
      for (const val of Object.values(reg)) {
        if (!Array.isArray(val)) continue;
        for (const entry of val) {
          // Only object members are registry entries. `example_notes: [str, str]`
          // is prose living in the same object; counting it would inflate the
          // denominator, and an inflated denominator makes coverage look wider
          // than it is.
          if (typeof entry !== 'object' || entry === null) continue;
          entriesInspected += 1;
          dateFieldsInspected += inspectEntry(entry, rel, now, findings, skipped);
        }
      }
    }
  }

  const stale = findings.filter((f) => f.kind === 'STALE');
  const vendor = findings.filter((f) => f.kind === 'VENDOR');

  if (JSON_OUTPUT) {
    console.log(
      JSON.stringify(
        {
          thresholdDays: THRESHOLD_DAYS,
          filesScanned: files.length,
          filesWithRegistry,
          entriesInspected,
          dateFieldsInspected,
          skipped: skipped.length,
          missingRoots,
          findings,
          severity: 'WARN',
          blocksRelease: false,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  console.log('');
  console.log('==========================================');
  console.log('  Model Pin Freshness | 模型鎖定新鮮度檢查');
  console.log(`  threshold: ${THRESHOLD_DAYS} days — WARN only, never blocks`);
  console.log('==========================================');
  console.log('');
  console.log(
    `${DIM}  Scanned ${files.length} YAML file(s); ${filesWithRegistry} carried a ` +
      `capability_registry; inspected ${entriesInspected} entr(ies) and ` +
      `${dateFieldsInspected} date field(s); excluded ${skipped.length} placeholder/` +
      `non-date value(s).${NC}`,
  );
  if (missingRoots.length > 0) {
    console.log(`${YELLOW}  Roots absent (not scanned): ${missingRoots.join(', ')}${NC}`);
  }
  console.log('');

  if (vendor.length > 0) {
    console.log(`${YELLOW}[WARN] Concrete vendor model ID in a shipped example (XSPEC-362 R4):${NC}`);
    for (const f of vendor) {
      console.log(`  ${f.file}`);
      console.log(`    ${f.field}: ${f.value}`);
    }
    console.log(`  ${DIM}→ Replace with a placeholder, e.g. <provider>/<model-name>.${NC}`);
    console.log('');
  }

  if (stale.length > 0) {
    console.log(`${YELLOW}[WARN] Registry entries older than ${THRESHOLD_DAYS} days:${NC}`);
    for (const f of stale) {
      console.log(`  ${f.file}  ${f.modelId}`);
      console.log(`    ${f.field}: ${f.value}  (${f.ageDays} days old)`);
    }
    console.log(`  ${DIM}→ Re-measure and update, or retire the entry (XSPEC-362 R7c trigger 2).${NC}`);
    console.log('');
  }

  if (findings.length === 0) {
    console.log(`${GREEN}No stale pins and no concrete vendor model IDs. ✓${NC}`);
    console.log(
      `${DIM}  A clean result is only meaningful if the predicates fire. ` +
        `Verify with: tsx scripts/check-model-pin-freshness.ts --self-test${NC}`,
    );
  } else {
    console.log(
      `${YELLOW}${findings.length} warning(s): ${stale.length} stale, ${vendor.length} vendor ID.${NC}`,
    );
    console.log(`${DIM}  Advisory — this check does not block a release.${NC}`);
  }
  console.log('');
  process.exit(0);
}

main();
