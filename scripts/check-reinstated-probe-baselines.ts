#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * check-reinstated-probe-baselines.ts — the evidence that let P1 and P3 back in, re-run.
 *
 * Why this exists
 * ───────────────
 * P1 and P3 were cut on 2026-07-23 ("baseline passed") and reinstated on 2026-09-08, rewritten
 * to ask a narrower question: **did the declared marker arrive?** — `[Source: …]` for AH-002,
 * `[Recommended]` for AH-004.
 *
 * §2.3 of INTEGRATION-VERIFICATION.md says a probe may not enter the active set without a
 * recorded baseline showing the tool *failing* it. That baseline was not a new run: it was the
 * retained 2026-07-23 transcripts, read a second time. The marker counts were zero.
 *
 * 🔴 A zero read once and typed into a document is a stamp. This script is the same zero,
 * re-derived from the transcripts on every run, so that editing, truncating or replacing a
 * transcript makes the entrance claim go red instead of going quiet.
 *
 * The control arm is not optional
 * ───────────────────────────────
 * "Marker count is 0" and "the search was broken" produce the same output. Every probe below
 * therefore carries a **control string that must be found in the same file by the same code
 * path**. A control that misses means the reader is broken and the verdict is `cannot tell`,
 * never `pass`.
 *
 * What this does NOT do
 * ─────────────────────
 * It does not run any model, spend any quota, or measure anything new. n is whatever the
 * original run's n was — one run, one tool, one frontier model — and re-running a grep does
 * not raise it. It answers exactly one question: **do the transcripts still say what the
 * reinstatement said they say?**
 *
 * Exit codes
 *   0 = every reinstated probe's baseline still fails, and every control arm still hits
 *   1 = a marker is now present — the recorded baseline no longer supports the reinstatement
 *   2 = cannot tell (transcript missing, control arm missed, self-test failed) — NOT green
 */

import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const BASELINES = join(ROOT, "integrations", "verification", "_baselines");

const SELF_TEST = process.argv.includes("--self-test");

interface ProbeClaim {
  /** Probe id as it appears in INTEGRATION-VERIFICATION.md. */
  readonly probe: string;
  /** The standard whose declared marker this probe looks for. */
  readonly rule: string;
  /** Transcript, relative to `_baselines/`. */
  readonly transcript: string;
  /** The declared marker. **Must be absent** — that absence is the baseline failure. */
  readonly marker: string;
  /**
   * A string that **must be present** in the same file, read by the same code path.
   * Without it, "0 occurrences" is indistinguishable from a reader that read nothing.
   */
  readonly control: string;
}

const CLAIMS: readonly ProbeClaim[] = [
  {
    probe: "P1",
    rule: "AH-002 — [Source: Code] file:line",
    transcript: "antigravity-1.0.14/P1-CUT.txt",
    marker: "[Source:",
    // The answer was factually correct: it opened the file and returned 45000.
    // That is exactly why the probe had to be narrowed — correctness was never the gap.
    control: "45000",
  },
  {
    probe: "P3",
    rule: "AH-004 — [Recommended]",
    transcript: "antigravity-1.0.14/P3-CUT.txt",
    marker: "[Recommended]",
    // The model wrote its own "### Recommendation" heading. It recommended; it did not mark.
    control: "Recommendation",
  },
];

function countOccurrences(haystack: string, needle: string): number {
  if (needle === "") return 0;
  let n = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) {
    n++;
    i = haystack.indexOf(needle, i + needle.length);
  }
  return n;
}

type Verdict =
  | { readonly kind: "still-fails"; readonly controlHits: number }
  | { readonly kind: "marker-present"; readonly hits: number }
  | { readonly kind: "cannot-tell"; readonly why: string };

function score(claim: ProbeClaim, text: string): Verdict {
  const controlHits = countOccurrences(text, claim.control);
  if (controlHits === 0) {
    return {
      kind: "cannot-tell",
      why: `control string ${JSON.stringify(claim.control)} not found — the reader cannot be trusted to have seen the marker either`,
    };
  }
  const hits = countOccurrences(text, claim.marker);
  if (hits > 0) return { kind: "marker-present", hits };
  return { kind: "still-fails", controlHits };
}

function fail(msg: string): never {
  console.error(`[probe-rescore] ${msg}`);
  process.exit(2);
}

// ── self-test ─────────────────────────────────────────────────────────
// Four arms. The two negatives matter more than the positive: a checker that
// cannot stay quiet is a checker that will be switched off.
if (SELF_TEST) {
  const dir = mkdtempSync(join(tmpdir(), "uds-probe-rescore-"));
  const probe: ProbeClaim = { probe: "T", rule: "t", transcript: "t.txt", marker: "[Mark]", control: "hello" };
  const arms: Array<[string, string, Verdict["kind"]]> = [
    ["positive — marker absent, control present → the baseline still fails", "hello world\n", "still-fails"],
    ["negative — marker now present → red, the reinstatement claim is gone", "hello [Mark] world\n", "marker-present"],
    ["negative — control missing → cannot tell, never green", "[Mark] only\n", "cannot-tell"],
    ["negative — empty transcript → cannot tell, not 'passed'", "", "cannot-tell"],
  ];
  let ok = true;
  for (const [label, body, want] of arms) {
    const f = join(dir, "t.txt");
    writeFileSync(f, body, "utf8");
    const got = score(probe, readFileSync(f, "utf8")).kind;
    const pass = got === want;
    ok &&= pass;
    console.log(`  ${pass ? "✓" : "✗"} ${label}${pass ? "" : `  (got ${got}, want ${want})`}`);
  }
  if (!ok) fail("self-test failed");
  console.log("[probe-rescore] self-test passed");
}

// ── the real check ────────────────────────────────────────────────────
if (CLAIMS.length === 0) fail("no reinstated probes declared — nothing was checked");

let red = 0;
for (const claim of CLAIMS) {
  const path = join(BASELINES, claim.transcript);
  if (!existsSync(path)) {
    fail(`${claim.probe}: transcript missing — ${claim.transcript}. The entrance evidence for a probe in the active set is not on disk.`);
  }
  const verdict = score(claim, readFileSync(path, "utf8"));
  switch (verdict.kind) {
    case "still-fails":
      console.log(
        `[probe-rescore] ✓ ${claim.probe} (${claim.rule}): ${JSON.stringify(claim.marker)} × 0 in ${claim.transcript}` +
          `  · control ${JSON.stringify(claim.control)} × ${verdict.controlHits}`,
      );
      break;
    case "marker-present":
      console.error(
        `[probe-rescore] ✗ ${claim.probe}: ${JSON.stringify(claim.marker)} appears ${verdict.hits}× in ${claim.transcript}.`,
      );
      console.error("                 The unaided run carries the declared marker, so this probe no longer");
      console.error("                 fails its baseline and §2.3 does not admit it. Either the transcript");
      console.error("                 changed, or the probe must be cut again — and cut with a record.");
      red++;
      break;
    case "cannot-tell":
      fail(`${claim.probe}: ${verdict.why}`);
  }
}

console.log(`[probe-rescore] read ${CLAIMS.length} reinstated probe(s), each with a control arm on the same file.`);
console.log("                🔴 Re-running a grep does not raise n. These are the 2026-07-23 transcripts,");
console.log("                   one run per probe, one tool, one frontier model. No weak model has been measured.");

if (red > 0) process.exit(1);
