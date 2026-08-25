#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * check-shipped-stamp-consistency.ts — XSPEC-392 R3.
 *
 * ── Why it exists ────────────────────────────────────────────────────────
 * R2 (this same landing) changed `ai/standards/*.ai.yaml`'s `meta.updated`
 * field to be computed from `git log` on the source `core/*.md` file, and
 * removed the `new Date()` fallback that used to fabricate "the day the
 * transform script happened to run" whenever the source had no hand-typed
 * `**Last Updated**` line. That fixes the *generator*. It says nothing about
 * whether the 144 files already sitting in `ai/standards/` — most of which
 * were generated before this fix existed — still carry a stamp that matches
 * reality.
 *
 * This script is the clock for the shipped artifact, not the generator:
 * for every `ai/standards/*.ai.yaml` whose `# Source:` header names a real
 * `core/*.md` file, it asks "does the shipped `meta.updated` value equal
 * `git log`'s answer for that file today?" — the same question R2's
 * generator now answers on every regeneration. A stamp can only drift out
 * of this kind of check by *not* being regenerated after its source last
 * changed; the check does not care what the old hand-typed `**Last
 * Updated**` line said, because that line is exactly the thing R2 stopped
 * trusting.
 *
 * ── Why it walks instead of enumerating (core/class-level-fix.md) ─────────
 * The file list comes from reading the directory, not a typed list of
 * standard ids. A typed list is correct until the 145th file arrives and
 * nothing says so.
 *
 * ── The `# Source:` line does not mean one thing ───────────────────────────
 * Reading a sample of `ai/standards/*.ai.yaml` before writing this script
 * showed the header comment is not uniform:
 *   - ~95 files: `# Source: core/<name>.md` — a real, checkable mapping.
 *   - ~29 files: `# Source: XSPEC-NNN ...` — hand-authored standards with no
 *     corresponding `core/*.md` at all; not a file path, nothing to check.
 *   - 4 files: `# Sources:` (plural) — a version-history list, a different
 *     field entirely.
 *   - 16 files: no `# Source:` line at all.
 * Only the first group is "comparable" here. The other three are counted
 * and reported, not silently dropped and not treated as failures — a
 * standard written directly in YAML with no source Markdown is a known,
 * legitimate shape in this repo, not a defect this check is about.
 *
 * ── Self-test on the main path ─────────────────────────────────────────────
 * A comparator that always says "consistent" and a comparator that works
 * are indistinguishable from a clean report alone. `selfTestComparator()`
 * runs on every invocation (not only under `--self-test`) against synthetic
 * fixtures with known verdicts, before a single real file is read. If it
 * fails, the run exits 2 — a clean scan from a broken comparator proves
 * nothing.
 *
 * ── Exit codes — three states, not two ─────────────────────────────────────
 *   0 — no new (non-baselined) mismatches, no unverified baseline entries,
 *       baseline not expired.
 *   1 — a new mismatch exists, OR a baseline entry is not yet `verified`,
 *       OR the baseline has expired.
 *   2 — could not judge: comparator self-test failed, zero `.ai.yaml` files
 *       walked, or a `# Source:` line names a `core/*.md`-shaped path whose
 *       file does not actually exist on disk (a real integrity break, not
 *       the ordinary "this standard has no source md" shape above).
 *
 * Usage:
 *   tsx scripts/check-shipped-stamp-consistency.ts            # scan + report
 *   tsx scripts/check-shipped-stamp-consistency.ts --json     # machine-readable
 *   tsx scripts/check-shipped-stamp-consistency.ts --self-test # comparator only
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = dirname(dirname(__filename));
const SCAN_DIR = join(ROOT_DIR, 'ai', 'standards');
const BASELINE_PATH = join(ROOT_DIR, 'scripts', 'shipped-stamp-consistency-baseline.json');

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[0;34m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

const args = new Set(process.argv.slice(2));
const JSON_OUTPUT = args.has('--json');
const SELF_TEST_ONLY = args.has('--self-test');

type MismatchKind = 'DATE_MISMATCH' | 'MISSING_UPDATED' | 'MALFORMED_DATE' | 'NO_GIT_HISTORY';

interface Finding {
  file: string; // repo-relative path to the .ai.yaml
  source: string; // repo-relative path to the core/*.md it claims to derive from
  shippedUpdated: string | null;
  actualUpdated: string | null;
  kind: MismatchKind;
}

interface BaselineEntry {
  file: string;
  source: string;
  shippedUpdated: string | null;
  actualUpdated: string | null;
  kind: MismatchKind;
  verified: boolean;
  evidence: string;
}

interface Baseline {
  recorded: string;
  expires: string;
  why: string;
  howToShrink: string;
  entries: BaselineEntry[];
}

// ───────────────────────────────────────────────────────────────────────────
// Comparator — the thing selfTestComparator() proves is not vacuous.
// ───────────────────────────────────────────────────────────────────────────

/**
 * Compare a shipped stamp against the source file's real git-log date.
 * Returns null when the two agree; a Finding-shaped verdict otherwise.
 * Pure function — no I/O — so it can be exercised synthetically.
 */
function compareStamp(
  shippedUpdated: string | null,
  actualUpdated: string | null,
): { ok: true } | { ok: false; kind: MismatchKind } {
  if (shippedUpdated === null) return { ok: false, kind: 'MISSING_UPDATED' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(shippedUpdated)) return { ok: false, kind: 'MALFORMED_DATE' };
  if (actualUpdated === null) return { ok: false, kind: 'NO_GIT_HISTORY' };
  if (shippedUpdated === actualUpdated) return { ok: true };
  return { ok: false, kind: 'DATE_MISMATCH' };
}

/** Is `value` shaped like a `core/*.md` (or locale variant) source path? */
function isPathShapedSource(value: string): boolean {
  return /^(core|locales\/[^/]+\/core)\/[^/]+\.md$/.test(value);
}

/**
 * Self-test: prove `compareStamp` and `isPathShapedSource` actually fire in
 * both directions before trusting any real scan built on top of them.
 */
function selfTestComparator(): { pass: boolean; log: string[] } {
  const log: string[] = [];
  let pass = true;

  const cases: Array<{
    name: string;
    shipped: string | null;
    actual: string | null;
    expect: 'ok' | MismatchKind;
  }> = [
    { name: 'identical dates', shipped: '2026-08-01', actual: '2026-08-01', expect: 'ok' },
    { name: 'shipped older than actual (the real-world case)', shipped: '2026-01-24', actual: '2026-02-02', expect: 'DATE_MISMATCH' },
    { name: 'shipped newer than actual (anomalous, must still fire)', shipped: '2026-08-12', actual: '2026-04-20', expect: 'DATE_MISMATCH' },
    { name: 'shipped field entirely absent', shipped: null, actual: '2026-02-02', expect: 'MISSING_UPDATED' },
    { name: 'shipped value is not an ISO date', shipped: 'unknown', actual: '2026-02-02', expect: 'MALFORMED_DATE' },
    { name: 'source has no git history at all', shipped: '2026-02-02', actual: null, expect: 'NO_GIT_HISTORY' },
  ];

  for (const c of cases) {
    const r = compareStamp(c.shipped, c.actual);
    const got = r.ok ? 'ok' : r.kind;
    const ok = got === c.expect;
    log.push(`  ${ok ? `${GREEN}[FIRED]${NC}` : `${RED}[DID NOT FIRE]${NC}` } ${c.name} ${DIM}(expected ${c.expect}, got ${got})${NC}`);
    if (!ok) pass = false;
  }

  const pathCases: Array<{ name: string; value: string; expect: boolean }> = [
    { name: 'plain core path', value: 'core/git-workflow.md', expect: true },
    { name: 'locale core path', value: 'locales/zh-tw/core/git-workflow.md', expect: true },
    { name: 'XSPEC id, not a path', value: 'XSPEC-035 (claude-code-book Ch.7)', expect: false },
    { name: 'path outside core/', value: 'ai/standards/git-workflow.ai.yaml', expect: false },
  ];
  for (const c of pathCases) {
    const got = isPathShapedSource(c.value);
    const ok = got === c.expect;
    log.push(`  ${ok ? `${GREEN}[FIRED]${NC}` : `${RED}[DID NOT FIRE]${NC}` } isPathShapedSource: ${c.name} ${DIM}(expected ${c.expect}, got ${got})${NC}`);
    if (!ok) pass = false;
  }

  return { pass, log };
}

// ───────────────────────────────────────────────────────────────────────────
// Real scan
// ───────────────────────────────────────────────────────────────────────────

function fail(msg: string): never {
  console.error(`${RED}[shipped-stamp] FATAL: ${msg}${NC}`);
  process.exit(2);
}

/** ISO date (YYYY-MM-DD) git last touched `relPath` with, or null. */
function getGitLastModifiedDate(relPath: string): string | null {
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%ad', '--date=short', '--', relPath],
      { cwd: ROOT_DIR, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return out || null;
  } catch {
    return null;
  }
}

interface ScanResult {
  totalWalked: number;
  withSourceLine: number;
  withPluralSourcesLine: number;
  noSourceLine: number;
  notPathShaped: number;
  sourceFileMissing: number; // path-shaped, but file does not exist — the exit-2 case
  comparable: number;
  findings: Finding[];
  missingSourcePaths: string[];
}

function scan(): ScanResult {
  if (!existsSync(SCAN_DIR)) fail(`ai/standards not found at ${SCAN_DIR}`);

  const entries = readdirSync(SCAN_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.ai.yaml'))
    .map((e) => e.name)
    .sort();

  const result: ScanResult = {
    totalWalked: entries.length,
    withSourceLine: 0,
    withPluralSourcesLine: 0,
    noSourceLine: 0,
    notPathShaped: 0,
    sourceFileMissing: 0,
    comparable: 0,
    findings: [],
    missingSourcePaths: [],
  };

  for (const name of entries) {
    const fullPath = join(SCAN_DIR, name);
    const relFile = relative(ROOT_DIR, fullPath);
    const content = readFileSync(fullPath, 'utf-8');

    const singular = content.match(/^# Source:\s*(.+)$/m);
    const plural = content.match(/^# Sources:\s*$/m);

    if (plural && !singular) result.withPluralSourcesLine++;

    if (!singular) {
      result.noSourceLine++;
      continue;
    }
    result.withSourceLine++;

    const sourceValue = singular[1].trim();
    if (!isPathShapedSource(sourceValue)) {
      result.notPathShaped++;
      continue;
    }

    const sourceFull = join(ROOT_DIR, sourceValue);
    if (!existsSync(sourceFull) || !statSync(sourceFull).isFile()) {
      result.sourceFileMissing++;
      result.missingSourcePaths.push(`${relFile} -> ${sourceValue}`);
      continue;
    }

    result.comparable++;

    const updatedMatch = content.match(/^\s*updated:\s*"?(\S+?)"?\s*$/m);
    // Only trust it if it looks like a date; otherwise treat as malformed
    // rather than silently coercing to null (compareStamp distinguishes them).
    const rawUpdated = updatedMatch ? updatedMatch[1] : null;
    const shippedUpdated = rawUpdated;
    const actualUpdated = getGitLastModifiedDate(sourceValue);

    const verdict = compareStamp(shippedUpdated, actualUpdated);
    if (!verdict.ok) {
      result.findings.push({
        file: relFile,
        source: sourceValue,
        shippedUpdated,
        actualUpdated,
        kind: verdict.kind,
      });
    }
  }

  return result;
}

// ───────────────────────────────────────────────────────────────────────────
// Baseline
// ───────────────────────────────────────────────────────────────────────────

function baselineKey(f: { file: string; kind: string; shippedUpdated: string | null; actualUpdated: string | null }): string {
  return `${f.file}::${f.kind}::${f.shippedUpdated ?? '∅'}::${f.actualUpdated ?? '∅'}`;
}

function loadBaseline(): Baseline {
  if (!existsSync(BASELINE_PATH)) {
    return { recorded: '', expires: '', why: '', howToShrink: '', entries: [] };
  }
  try {
    const raw = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));
    return {
      recorded: raw.recorded ?? '',
      expires: raw.expires ?? '',
      why: raw.why ?? '',
      howToShrink: raw.howToShrink ?? '',
      entries: Array.isArray(raw.entries) ? raw.entries : [],
    };
  } catch (e) {
    fail(`baseline file exists but failed to parse: ${(e as Error).message} — this is not "no baseline", it is "cannot read baseline"`);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Report
// ───────────────────────────────────────────────────────────────────────────

function main(): void {
  const self = selfTestComparator();
  if (SELF_TEST_ONLY) {
    console.log(`${BLUE}Self-test — do the predicates actually fire?${NC}`);
    for (const line of self.log) console.log(line);
    console.log('');
    console.log(self.pass ? `${GREEN}All predicates behave as declared.${NC}` : `${RED}Self-test failed.${NC}`);
    process.exit(self.pass ? 0 : 2);
  }

  // The self-test runs on the main path regardless of flags. A broken
  // comparator must not be allowed to produce a "clean" scan.
  if (!self.pass) {
    console.error(`${RED}[shipped-stamp] Comparator self-test failed — refusing to trust a scan built on it:${NC}`);
    for (const line of self.log) console.error(line);
    process.exit(2);
  }

  const r = scan();
  if (r.totalWalked === 0) fail('walked 0 files under ai/standards/*.ai.yaml — this is not "nothing to check", it is "could not find anything to check"');
  if (r.sourceFileMissing > 0) {
    console.error(`${RED}[shipped-stamp] FATAL: ${r.sourceFileMissing} file(s) name a core/*.md-shaped source that does not exist on disk:${NC}`);
    for (const p of r.missingSourcePaths) console.error(`  ${p}`);
    process.exit(2);
  }

  const baseline = loadBaseline();
  const baseSet = new Map(baseline.entries.map((e) => [baselineKey(e), e]));

  const newFindings = r.findings.filter((f) => !baseSet.has(baselineKey(f)));
  const baselinedFindings = r.findings.filter((f) => baseSet.has(baselineKey(f)));
  const unverifiedBaselined = baselinedFindings.filter((f) => baseSet.get(baselineKey(f))!.verified !== true);
  const verifiedBaselined = baselinedFindings.filter((f) => baseSet.get(baselineKey(f))!.verified === true);

  const today = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) fail(`date tool returned something unusable: '${today}'`);
  const baselineExpired = Boolean(baseline.expires) && baseline.expires < today;

  const baselineFixed = baseline.entries.filter((e) => !r.findings.some((f) => baselineKey(f) === baselineKey(e)));

  if (JSON_OUTPUT) {
    console.log(
      JSON.stringify(
        {
          totalWalked: r.totalWalked,
          withSourceLine: r.withSourceLine,
          withPluralSourcesLine: r.withPluralSourcesLine,
          noSourceLine: r.noSourceLine,
          notPathShaped: r.notPathShaped,
          sourceFileMissing: r.sourceFileMissing,
          comparable: r.comparable,
          totalFindings: r.findings.length,
          newFindings: newFindings.length,
          baselined: baselinedFindings.length,
          verified: verifiedBaselined.length,
          unverified: unverifiedBaselined.length,
          baselineExpired,
          baselineExpires: baseline.expires,
          baselineFixed: baselineFixed.length,
          findings: r.findings,
        },
        null,
        2,
      ),
    );
    const exitCode = newFindings.length > 0 || unverifiedBaselined.length > 0 || baselineExpired ? 1 : 0;
    process.exit(exitCode);
  }

  console.log('');
  console.log('==================================================');
  console.log('  Shipped Stamp Consistency | 出貨戳一致性檢查');
  console.log('==================================================');
  console.log('');
  console.log(
    `${DIM}  Walked ${r.totalWalked} file(s) under ai/standards/*.ai.yaml; ${r.withSourceLine} carried a ` +
      `singular "# Source:" line (${r.noSourceLine} had none, ${r.withPluralSourcesLine} had only the ` +
      `plural "# Sources:" version-history form); of those, ${r.comparable} named a core/*.md-shaped path ` +
      `that exists on disk (${r.notPathShaped} named something else, e.g. an XSPEC id — not a defect, just ` +
      `not comparable here).${NC}`,
  );
  console.log('');

  if (r.findings.length === 0) {
    console.log(`${GREEN}No stamp mismatches among ${r.comparable} comparable file(s). ✓${NC}`);
  } else {
    console.log(`${YELLOW}${r.findings.length} mismatch(es) among ${r.comparable} comparable file(s):${NC}`);
    console.log(`  新增（不在基線內）New, not baselined: ${newFindings.length > 0 ? RED : GREEN}${newFindings.length}${NC}`);
    console.log(`  在基線內（免責）In baseline (excused, not necessarily checked): ${baselinedFindings.length}`);
    console.log(`    ${GREEN}已 verified（真的查過了）Verified: ${verifiedBaselined.length}${NC}`);
    console.log(`    ${unverifiedBaselined.length > 0 ? YELLOW : GREEN}未 verified（僅登記，尚未查證）Unverified: ${unverifiedBaselined.length}${NC}`);
    console.log('');

    if (newFindings.length > 0) {
      console.log(`${RED}New mismatches (not in baseline):${NC}`);
      for (const f of newFindings) {
        console.log(`  ${f.file}  [${f.kind}]`);
        console.log(`    source: ${f.source}  shipped: ${f.shippedUpdated ?? '(absent)'}  actual (git log): ${f.actualUpdated ?? '(no history)'}`);
      }
      console.log('');
    }
    if (unverifiedBaselined.length > 0) {
      console.log(`${YELLOW}Baselined but not yet verified:${NC}`);
      for (const f of unverifiedBaselined) {
        console.log(`  ${f.file}  [${f.kind}]  shipped: ${f.shippedUpdated ?? '(absent)'}  actual: ${f.actualUpdated ?? '(no history)'}`);
      }
      console.log('');
    }
  }

  if (baselineFixed.length > 0) {
    console.log(`${GREEN}✓ ${baselineFixed.length} baseline entr(ies) no longer reproduce — safe to remove from the baseline file:${NC}`);
    for (const f of baselineFixed) console.log(`  ${f.file}`);
    console.log('');
  }

  console.log(
    `${DIM}Baseline: ${baseline.entries.length} entr(ies), recorded ${baseline.recorded || '(none)'}, ` +
      `expires ${baseline.expires || '(none)'}${baselineExpired ? ` — ${RED}EXPIRED${DIM}` : ''}.${NC}`,
  );

  if (baselineExpired) {
    console.log(
      `\n${RED}✗ Baseline expired on ${baseline.expires}.${NC}\n` +
        '  基線已到期，不得自動延期，需要人工重新檢視並決定去留。\n' +
        '  Expiry does not mean something new broke; it means the decision to defer\n' +
        '  these entries needs making again — shrink the baseline, re-verify and\n' +
        '  extend it with a reason, or regenerate the affected files.',
    );
    process.exit(1);
  }

  if (newFindings.length === 0 && unverifiedBaselined.length === 0) {
    console.log(`\n${GREEN}✓ Clean: no new mismatches, and every baselined entry is verified.${NC}`);
    process.exit(0);
  }

  console.log(
    `\n${RED}✗ Not clean.${NC} Fix by regenerating the affected .ai.yaml via ` +
      '`node scripts/convert-md-to-yaml.mjs <file>` (or the scripts/transform pipeline for its files), ' +
      'or — for entries you have actually investigated — record verified:true with evidence in ' +
      `${relative(ROOT_DIR, BASELINE_PATH)}.`,
  );
  process.exit(1);
}

main();
