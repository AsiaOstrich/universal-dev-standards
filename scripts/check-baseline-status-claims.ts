#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * check-baseline-status-claims.ts — a "not done" claim next to the directory that did it.
 *
 * Why this exists
 * ───────────────
 * `integrations/verification/_baselines/antigravity-1.0.14/STATUS.md` said outcome measurement
 * "has only been run against Codex". Git:
 *
 *   STATUS.md                        2026-07-24 00:34:46  f5783757
 *   outcome-cross-judged/README.md   2026-07-24 00:52:07  1da794e1
 *
 * Eighteen minutes. The experiment ran, was committed, and the file whose entire job is to say
 * what has and has not been done was never updated. It stayed wrong for 32 days and on
 * 2026-08-25 came within one step of causing a completed experiment to be run again.
 *
 * 🔴 Why a clock cannot catch this
 * ───────────────────────────────
 * XSPEC-392 is about stamps that stop being true. This claim has **no stamp at all** — it is
 * prose asserting that something has not happened. Nothing about it decays visibly, so no
 * "compare the date to git" check can see it go stale.
 *
 * What can see it: the claim **contradicts the directory listing beside it**. That is
 * machine-checkable even when staleness is not. This gate does exactly that and nothing more.
 *
 * Deliberately narrow, and the narrowing is the point
 * ──────────────────────────────────────────────────
 * It does not try to judge whether an experiment is *good*, or *complete*, or whether the
 * directory holds real data. It answers one question: **does a STATUS.md say an experiment has
 * not been run while that experiment's directory exists in the same folder?**
 * Widening it would require reading intent, and a checker that reads intent is a checker whose
 * failures are arguments.
 *
 * Exit codes
 *   0 = no contradictions
 *   1 = a STATUS.md denies work whose directory is sitting next to it
 *   2 = cannot tell (no baselines walked, no STATUS.md found, self-test failed) — NOT green
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const BASELINES = join(ROOT, "integrations", "verification", "_baselines");

const SELF_TEST = process.argv.includes("--self-test");

function fail(msg: string): never {
  console.error(`[baseline-claims] ${msg}`);
  process.exit(2);
}

/**
 * A denial: prose asserting an experiment has NOT been run.
 *
 * The patterns are deliberately about the *shape of the sentence*, not about a list of
 * experiment names — a name list would miss the next experiment, which is the failure mode
 * this whole gate exists to prevent.
 */
const DENIAL_PATTERNS: { re: RegExp; why: string }[] = [
  { re: /has\s+(?:only\s+)?(?:been\s+)?run\s+(?:only\s+)?against\s+(\w[\w-]*)/gi, why: "claims the work ran only elsewhere" },
  { re: /has\s+not\s+been\s+(?:run|done|attempted|measured)/gi, why: "claims the work has not been run" },
  { re: /not\s+yet\s+(?:run|done|attempted|measured)/gi, why: "claims the work is still pending" },
  { re: /(?:What|Which)\s+has\s+NOT\s+been\s+done/gi, why: "a section heading declaring work undone" },
];

/** Directory names that are evidence an experiment produced data. */
function experimentDirs(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/**
 * Does a denial sentence refer to an experiment whose directory exists?
 *
 * Matched on the directory's own name tokens appearing in the denial's neighbourhood — the
 * directory is the ground truth, so the vocabulary comes from the filesystem, not from a list
 * written here.
 */
function tokensOf(dirName: string): string[] {
  return dirName
    .split(/[-_]/)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length >= 4 && !["with", "from", "test", "data", "runs"].includes(t));
}

interface Finding {
  file: string;
  dir: string;
  sentence: string;
  why: string;
}

function scanStatus(statusPath: string, dirs: string[]): Finding[] {
  const text = readFileSync(statusPath, "utf8");
  const out: Finding[] = [];
  for (const { re, why } of DENIAL_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      // Neighbourhood: the paragraph the denial sits in, plus the one after it.
      const start = Math.max(0, text.lastIndexOf("\n\n", m.index));
      const endFirst = text.indexOf("\n\n", m.index + m[0].length);
      const end = endFirst === -1 ? text.length : (text.indexOf("\n\n", endFirst + 2) === -1 ? text.length : text.indexOf("\n\n", endFirst + 2));
      const neighbourhood = text.slice(start, end).toLowerCase();
      for (const d of dirs) {
        const toks = tokensOf(d);
        if (toks.length === 0) continue;
        if (toks.every((t) => neighbourhood.includes(t))) {
          out.push({
            file: statusPath,
            dir: d,
            sentence: text.slice(m.index, m.index + 90).replace(/\s+/g, " "),
            why,
          });
        }
      }
    }
  }
  // De-duplicate by (dir, sentence)
  const seen = new Set<string>();
  return out.filter((f) => {
    const k = `${f.dir}|${f.sentence}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/* ── Self-test: a gate never seen red is indistinguishable from one that cannot go red ── */
function selfTest(): number {
  const arms: { name: string; ok: boolean }[] = [];

  const denial = "## What has NOT been done here\n\n**Outcome measurement.** The blind-judged outcome cross-judged method has only been run against Codex.\n";
  arms.push({
    name: "positive — denial next to an existing directory is caught",
    ok: scanStatusText(denial, ["outcome-cross-judged"]).length > 0,
  });
  arms.push({
    name: "negative — the same denial with no such directory is NOT caught",
    ok: scanStatusText(denial, ["round1-multimodel"]).length === 0,
  });
  arms.push({
    name: "negative — a completion statement is not read as a denial",
    ok: scanStatusText("Outcome cross judged measurement is complete.\n", ["outcome-cross-judged"]).length === 0,
  });
  arms.push({
    name: "negative — prose with no directory tokens is not caught",
    ok: scanStatusText("Quota work has not been run.\n", ["outcome-cross-judged"]).length === 0,
  });

  for (const a of arms) console.log(`  ${a.ok ? "✓" : "✗"} ${a.name}`);
  const bad = arms.filter((a) => !a.ok).length;
  if (bad > 0) {
    console.error(`[baseline-claims] self-test: ${bad} arm(s) failed — no result from this run is trustworthy`);
    return 2;
  }
  console.log("[baseline-claims] self-test passed");
  return 0;
}

function scanStatusText(text: string, dirs: string[]): Finding[] {
  const tmp = join(ROOT, ".baseline-claims-selftest.md");
  // Pure-function path: reuse scanStatus by writing nothing — inline the logic instead.
  const out: Finding[] = [];
  for (const { re, why } of DENIAL_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const start = Math.max(0, text.lastIndexOf("\n\n", m.index));
      const endFirst = text.indexOf("\n\n", m.index + m[0].length);
      const end = endFirst === -1 ? text.length : (text.indexOf("\n\n", endFirst + 2) === -1 ? text.length : text.indexOf("\n\n", endFirst + 2));
      const neighbourhood = text.slice(start, end).toLowerCase();
      for (const d of dirs) {
        const toks = tokensOf(d);
        if (toks.length === 0) continue;
        if (toks.every((t) => neighbourhood.includes(t))) {
          out.push({ file: tmp, dir: d, sentence: m[0], why });
        }
      }
    }
  }
  return out;
}

/* ── Main ───────────────────────────────────────────────────────────── */

if (SELF_TEST) process.exit(selfTest());

if (selfTest() !== 0) process.exit(2);

if (!existsSync(BASELINES)) fail(`${BASELINES} does not exist — the walk did not run`);

const toolDirs = readdirSync(BASELINES, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

if (toolDirs.length === 0) fail("walked 0 baseline directories — zero is not 'no contradictions'");

let statusCount = 0;
const findings: Finding[] = [];
for (const tool of toolDirs) {
  const dir = join(BASELINES, tool);
  const statusPath = join(dir, "STATUS.md");
  if (!existsSync(statusPath) || !statSync(statusPath).isFile()) continue;
  statusCount++;
  findings.push(...scanStatus(statusPath, experimentDirs(dir)));
}

if (statusCount === 0) fail(`walked ${toolDirs.length} baseline directories and found 0 STATUS.md — the walk found nothing to check`);

console.log(`[baseline-claims] walked ${toolDirs.length} baseline dir(s), read ${statusCount} STATUS.md`);
console.log("            Checks one thing only: does a STATUS.md deny work whose directory sits beside it?");
console.log("            🔴 It cannot see staleness — a prose claim carries no date. It sees contradiction.");

if (findings.length > 0) {
  console.error(`\n[baseline-claims] ${findings.length} contradiction(s):`);
  for (const f of findings) {
    console.error(`  ✗ ${f.file.replace(`${ROOT}/`, "")}`);
    console.error(`      says: "${f.sentence}"  (${f.why})`);
    console.error(`      but:  ${f.dir}/ exists in the same folder`);
  }
  console.error("\n            Either the directory holds work the file denies, or the wording needs to");
  console.error("            say what is actually missing. Both are edits; neither is a waiver.");
  process.exit(1);
}

console.log("[baseline-claims] ✓ no STATUS.md denies work that is sitting next to it.");
