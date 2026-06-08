/**
 * sdd-analyze.ts — implements XSPEC-262 Phase 1 MVP (R1/R2/R3)
 *
 * `/sdd analyze` — cross-artifact consistency check, the EXECUTABLE face of the
 * acceptance-criteria-traceability standard + forward-derivation single-spine
 * principle (which were definition-only). Mirrors GitHub Spec Kit /speckit.analyze.
 *
 * Single-spine validation (XSPEC-260): every test is a projection of the AC spine.
 *   - orphan test  = projection references a spine node that does not exist
 *                    (test has `@AC AC-999` but no spec defines AC-999)
 *   - uncovered    = spine node has no projection (AC has no @AC reference)
 *   - not_implemented = AC marked so in its .ac.yaml (excluded from denominator)
 *
 * Complements (does NOT replace) ac-coverage: ac-coverage = per-spec detailed
 * matrix; sdd analyze = cross-spec/batch consistency + orphan detection.
 *
 * Run:  tsx scripts/sdd-analyze.ts [--specs <dir>] [--tests <dir>] [--json]
 * CI:   non-zero exit when orphans > 0 OR not_implemented > 0 (BLOCKING gate,
 *       per acceptance-criteria-traceability §CI Gate).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type ACStatus = "covered" | "partial" | "uncovered" | "not_implemented";

export interface SpecAC {
  id: string; // e.g. "AC-1" or "AC-050-001"
  specId: string; // owning spec id / filename
  notImplemented: boolean; // from .ac.yaml status
  partial: boolean; // from .ac.yaml status
}

export interface TestRef {
  acId: string;
  file: string;
}

export interface OrphanTest {
  acId: string;
  file: string;
}

export interface ACResult {
  id: string;
  specId: string;
  status: ACStatus;
  tests: string[];
}

export interface AnalysisResult {
  acs: ACResult[];
  orphans: OrphanTest[];
  notImplemented: string[];
  total: number;
  coveragePct: number;
  blocking: boolean;
  blockingReasons: string[];
}

// ── Extraction (aligned with ac-coverage @AC / @SPEC conventions) ─────────────

const AC_ID = /\bAC-(?:\d+-)?\d+\b/g;

/** Extract AC ids defined in a spec markdown (dedup, in order of first mention). */
export function extractSpecACs(content: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of content.matchAll(AC_ID)) {
    if (!seen.has(m[0])) {
      seen.add(m[0]);
      out.push(m[0]);
    }
  }
  return out;
}

/** Extract `@AC AC-NNN` references from a test file. */
export function extractTestRefs(content: string, file: string): TestRef[] {
  const out: TestRef[] = [];
  for (const m of content.matchAll(/@AC\s+(AC-(?:\d+-)?\d+)/g)) {
    out.push({ acId: m[1], file });
  }
  return out;
}

/** Read optional `<spec>.ac.yaml` sibling for not_implemented / partial status. */
export function readAcYamlStatus(acYamlContent: string): Record<string, ACStatus> {
  const map: Record<string, ACStatus> = {};
  // lightweight line scan (avoid a YAML dep): `- id: AC-1` ... `status: not_implemented`
  let currentId: string | null = null;
  for (const line of acYamlContent.split("\n")) {
    const idM = line.match(/^\s*-?\s*id:\s*(AC-(?:\d+-)?\d+)/);
    if (idM) {
      currentId = idM[1];
      continue;
    }
    const stM = line.match(/^\s*status:\s*(covered|partial|uncovered|not_implemented)/);
    if (stM && currentId) {
      map[currentId] = stM[1] as ACStatus;
    }
  }
  return map;
}

// ── Core analysis (pure) ──────────────────────────────────────────────────────

export function analyzeConsistency(specACs: SpecAC[], testRefs: TestRef[]): AnalysisResult {
  const specIds = new Set(specACs.map((a) => a.id));
  const refsByAc = new Map<string, string[]>();
  for (const r of testRefs) {
    if (!refsByAc.has(r.acId)) refsByAc.set(r.acId, []);
    refsByAc.get(r.acId)!.push(r.file);
  }

  // Orphan tests: reference an AC that no spec defines.
  const orphans: OrphanTest[] = testRefs
    .filter((r) => !specIds.has(r.acId))
    .map((r) => ({ acId: r.acId, file: r.file }));

  const acs: ACResult[] = specACs.map((a) => {
    const tests = refsByAc.get(a.id) ?? [];
    let status: ACStatus;
    if (a.notImplemented) status = "not_implemented";
    else if (a.partial) status = "partial";
    else status = tests.length > 0 ? "covered" : "uncovered";
    return { id: a.id, specId: a.specId, status, tests };
  });

  const notImplemented = acs.filter((a) => a.status === "not_implemented").map((a) => a.id);
  const covered = acs.filter((a) => a.status === "covered").length;
  const partial = acs.filter((a) => a.status === "partial").length;
  const denom = acs.length - notImplemented.length;
  const coveragePct = denom > 0 ? Math.round(((covered + partial * 0.5) / denom) * 1000) / 10 : 100;

  const blockingReasons: string[] = [];
  if (orphans.length > 0) blockingReasons.push(`${orphans.length} orphan test reference(s)`);
  if (notImplemented.length > 0)
    blockingReasons.push(`${notImplemented.length} not_implemented AC(s)`);

  return {
    acs,
    orphans,
    notImplemented,
    total: acs.length,
    coveragePct,
    blocking: blockingReasons.length > 0,
    blockingReasons,
  };
}

// ── Report ────────────────────────────────────────────────────────────────────

export function formatReport(r: AnalysisResult): string {
  const lines: string[] = [];
  lines.push("# /sdd analyze — Cross-Artifact Consistency");
  lines.push("");
  lines.push(`AC total: ${r.total} | Coverage: ${r.coveragePct}% (not_implemented excluded)`);
  lines.push("");
  if (r.orphans.length) {
    lines.push(`## ❗ Orphan tests (${r.orphans.length}) — BLOCKING`);
    for (const o of r.orphans) lines.push(`  - \`${o.acId}\` referenced by ${o.file} — no such AC`);
    lines.push("");
  }
  if (r.notImplemented.length) {
    lines.push(`## 🚫 not_implemented (${r.notImplemented.length}) — BLOCKING before UAT`);
    for (const id of r.notImplemented) lines.push(`  - ${id}`);
    lines.push("");
  }
  const uncovered = r.acs.filter((a) => a.status === "uncovered");
  if (uncovered.length) {
    lines.push(`## ❌ Uncovered AC (${uncovered.length})`);
    for (const a of uncovered) lines.push(`  - ${a.id} (${a.specId})`);
    lines.push("");
  }
  lines.push(r.blocking ? `Status: BLOCKED — ${r.blockingReasons.join("; ")}` : "Status: OK");
  return lines.join("\n");
}

// ── File walking + main ───────────────────────────────────────────────────────

function walk(dir: string, test: (f: string) => boolean): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "dist", "coverage"].includes(entry.name)) continue;
      out.push(...walk(full, test));
    } else if (test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function collectFromDisk(specsDir: string, testsDir: string): {
  specACs: SpecAC[];
  testRefs: TestRef[];
} {
  const specACs: SpecAC[] = [];
  for (const specFile of walk(specsDir, (f) => f.endsWith(".md"))) {
    const content = fs.readFileSync(specFile, "utf8");
    const specId = path.basename(specFile, ".md");
    const acYamlPath = specFile.replace(/\.md$/, ".ac.yaml");
    const statusMap = fs.existsSync(acYamlPath)
      ? readAcYamlStatus(fs.readFileSync(acYamlPath, "utf8"))
      : {};
    for (const id of extractSpecACs(content)) {
      const st = statusMap[id];
      specACs.push({
        id,
        specId,
        notImplemented: st === "not_implemented",
        partial: st === "partial",
      });
    }
  }
  const testRefs: TestRef[] = [];
  for (const testFile of walk(testsDir, (f) => /\.(test|spec)\.[tj]sx?$/.test(f))) {
    testRefs.push(
      ...extractTestRefs(fs.readFileSync(testFile, "utf8"), path.relative(testsDir, testFile))
    );
  }
  return { specACs, testRefs };
}

function main(argv: string[]): void {
  const getArg = (flag: string, def: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
  };
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
  const specsDir = path.resolve(root, getArg("--specs", "specs"));
  const testsDir = path.resolve(root, getArg("--tests", "tests"));
  const asJson = argv.includes("--json");

  const { specACs, testRefs } = collectFromDisk(specsDir, testsDir);
  const result = analyzeConsistency(specACs, testRefs);

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatReport(result));
  }
  process.exit(result.blocking ? 1 : 0);
}

// Run only when executed directly (keeps exports pure-testable).
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main(process.argv.slice(2));
}
