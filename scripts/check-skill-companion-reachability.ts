#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * check-skill-companion-reachability.ts — can the model actually get to that file?
 *
 * Why this exists
 * ───────────────
 * 69.8% of UDS skill content does not live in SKILL.md. It lives in companion
 * files beside it — 22,415 of 32,113 lines across 59 files. Every vendor whose
 * docs describe skills describes the same one mechanism: **SKILL.md names a
 * supporting file, and the agent reads it when the instructions point there.**
 *
 * That mechanism has a precondition nobody was checking: **something has to point.**
 * A companion no SKILL.md names is, on every tool, indistinguishable from a file
 * that was never shipped — except that it ships, is translated, and is counted in
 * STANDARDS-MAPPING.md as delivered.
 *
 * Three tiers, and only the first is what the vendors document
 * ───────────────────────────────────────────────────────────
 *   one-hop   SKILL.md names it directly.          ← what every vendor doc describes
 *   two-hop   only another companion names it.      ← no vendor documents this depth
 *   zero-hop  nothing in the skill names it.        ← unreachable, decidable here
 *
 * This gate fails on zero-hop, because that one needs no knowledge of any tool:
 * a file with no inbound link cannot be opened on demand by anything.
 *
 * Two-hop is **frozen as debt against a baseline**, not failed. Whether a model
 * follows a link out of a file it only opened on demand is an open question this
 * script cannot answer — and a gate that fails on an open question is a gate that
 * gets switched off. The baseline carries an expiry so the question has a clock.
 *
 * 🔴 Full filenames only, and the self-test proves it
 * ──────────────────────────────────────────────────
 * Matching a filename minus its extension looks harmless and is not: `guide` is an
 * ordinary English word. Measured while building this — `slo-assistant/SKILL.md`
 * contains `guide.md` **zero** times and the word `guide` twice, and a stem matcher
 * scored it as referenced. That single loosening moved the zero-hop count from 7 to
 * 1 and read like good news. One self-test arm exists solely to keep it out.
 *
 * Exit codes
 *   0 = every companion is reachable, and two-hop debt is at or below baseline
 *   1 = a companion nothing points at, or two-hop debt grew, or the baseline expired
 *   2 = cannot tell (no skills walked, no companions found, self-test failed) — NOT green
 */

import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const SKILLS_DIR = join(ROOT, "skills");
const LOCALES_DIR = join(ROOT, "locales");
const BASELINE = join(HERE, "skill-companion-reachability-baseline.json");

const SELF_TEST = process.argv.includes("--self-test");

type Tier = "one-hop" | "two-hop" | "zero-hop";

interface Companion {
  readonly skill: string;
  readonly file: string;
  readonly lines: number;
  readonly tier: Tier;
}

/**
 * 🔴 Full filename, never the stem. See the header — the stem matcher turns every
 * occurrence of an ordinary word ("guide", "workflow") into a false link.
 */
function names(haystack: string, fileName: string): boolean {
  return haystack.includes(fileName);
}

function classify(dir: string): Companion[] {
  const entries = readdirSync(dir).filter((f) => f.endsWith(".md"));
  if (!entries.includes("SKILL.md")) return [];
  const skillBody = readFileSync(join(dir, "SKILL.md"), "utf8");
  const companions = entries.filter((f) => f !== "SKILL.md");
  const out: Companion[] = [];
  for (const file of companions) {
    const lines = readFileSync(join(dir, file), "utf8").split("\n").length;
    let tier: Tier;
    if (names(skillBody, file)) {
      tier = "one-hop";
    } else {
      const viaSibling = companions.some(
        (other) => other !== file && names(readFileSync(join(dir, other), "utf8"), file),
      );
      tier = viaSibling ? "two-hop" : "zero-hop";
    }
    out.push({ skill: dir.slice(ROOT.length + 1), file, lines, tier });
  }
  return out;
}

function fail(msg: string): never {
  console.error(`[companion-reach] ${msg}`);
  process.exit(2);
}

// ── self-test ─────────────────────────────────────────────────────────
if (SELF_TEST) {
  const root = mkdtempSync(join(tmpdir(), "uds-companion-"));
  const mk = (skill: string, files: Record<string, string>) => {
    const d = join(root, skill);
    mkdirSync(d, { recursive: true });
    for (const [n, body] of Object.entries(files)) writeFileSync(join(d, n), body, "utf8");
    return d;
  };
  const arms: Array<[string, string, Tier | "none"]> = [
    ["positive — SKILL.md links it → one-hop", "one", "one-hop"],
    ["positive — only a sibling links it → two-hop", "two", "two-hop"],
    ["🔴 red arm — nothing links it → zero-hop", "zero", "zero-hop"],
    ["🔴 the stem trap — prose says 'guide' but never 'guide.md' → still zero-hop", "stem", "zero-hop"],
  ];
  mk("one", { "SKILL.md": "see [ref](./ref.md)\n", "ref.md": "x\n" });
  mk("two", { "SKILL.md": "see [a](./a.md)\n", "a.md": "then [b](./b.md)\n", "b.md": "x\n" });
  mk("zero", { "SKILL.md": "no links here\n", "orphan.md": "x\n" });
  // The exact case measured in the real corpus: the word appears, the filename does not.
  mk("stem", { "SKILL.md": "This guide explains the guide.\n", "guide.md": "x\n" });

  let ok = true;
  for (const [label, skill, want] of arms) {
    const got = classify(join(root, skill)).filter((c) => c.tier !== "one-hop" || want === "one-hop");
    const tier = got.length > 0 ? got[got.length - 1].tier : "none";
    const pass = tier === want;
    ok &&= pass;
    console.log(`  ${pass ? "✓" : "✗"} ${label}${pass ? "" : `  (got ${tier}, want ${want})`}`);
  }
  // A skill directory without SKILL.md is not a skill and must contribute nothing.
  mkdirSync(join(root, "notaskill"), { recursive: true });
  writeFileSync(join(root, "notaskill", "loose.md"), "x\n", "utf8");
  const none = classify(join(root, "notaskill"));
  const pass5 = none.length === 0;
  ok &&= pass5;
  console.log(`  ${pass5 ? "✓" : "✗"} negative — a directory with no SKILL.md contributes nothing`);

  if (!ok) fail("self-test failed");
  console.log("[companion-reach] self-test passed");
}

// ── the real walk ─────────────────────────────────────────────────────
//
// 🔴 **Every root, not just the English one.** The installer takes the union —
// localized file where it exists, English where it does not — so an adopter on
// zh-TW gets the *localized* SKILL.md. Fixing only `skills/` would leave those
// users with exactly the orphans this gate exists to catch, while the gate
// reported green: "clean in my tree" is not "clean for the consumer".
//
// Roots are **discovered**, never listed: a new locale must not be able to join
// silently. `locales/<x>/skills/` is found by walking `locales/`.
if (!existsSync(SKILLS_DIR)) fail(`skills/ not found at ${SKILLS_DIR}`);

const roots: string[] = [SKILLS_DIR];
if (existsSync(LOCALES_DIR)) {
  for (const e of readdirSync(LOCALES_DIR, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const d = join(LOCALES_DIR, e.name, "skills");
    if (existsSync(d)) roots.push(d);
  }
}

const skillDirs = roots.flatMap((root) =>
  readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(root, e.name))
    .filter((d) => existsSync(join(d, "SKILL.md"))),
);

if (skillDirs.length === 0) fail("walked every skills root and found 0 directories containing SKILL.md");

const all = skillDirs.flatMap(classify);
if (all.length === 0) fail(`walked ${skillDirs.length} skills and found 0 companion files — nothing was checked`);

const by = (t: Tier) => all.filter((c) => c.tier === t);
const lines = (t: Tier) => by(t).reduce((n, c) => n + c.lines, 0);

// **Denominator always prints.** A walk that quietly shrinks reports green over less.
console.log(
  `[companion-reach] walked ${roots.length} root(s) — ${roots.map((r) => r.slice(ROOT.length + 1)).join(", ")}`,
);
console.log(
  `                  ${skillDirs.length} skills, ${all.length} companion files ` +
    `(${all.reduce((n, c) => n + c.lines, 0)} lines)`,
);
for (const t of ["one-hop", "two-hop", "zero-hop"] as Tier[]) {
  console.log(`                  ${t.padEnd(9)} ${String(by(t).length).padStart(3)} files ${String(lines(t)).padStart(6)} lines`);
}
console.log("                  🔴 only one-hop is the mechanism the vendors' own docs describe.");

let red = 0;

// ── zero-hop: always red ──────────────────────────────────────────────
if (by("zero-hop").length > 0) {
  console.error(`\n[companion-reach] ✗ ${by("zero-hop").length} companion(s) nothing points at:`);
  for (const c of by("zero-hop")) console.error(`    ${c.skill}/${c.file}  (${c.lines} lines)`);
  console.error("\n            These ship, get translated, and are counted as delivered, while no");
  console.error("            SKILL.md and no sibling names them. Add the pointer, or decide they");
  console.error("            should not ship — being listed in an inventory table is not a pointer.");
  red++;
}

// ── two-hop: frozen against a baseline with a clock ───────────────────
if (!existsSync(BASELINE)) fail(`two-hop baseline missing at ${BASELINE} — an absent baseline is not "no debt"`);
const base = JSON.parse(readFileSync(BASELINE, "utf8")) as {
  recorded: string;
  expires: string;
  twoHopFiles: number;
  why: string;
};
const expiry = Date.parse(base.expires);
if (Number.isNaN(expiry)) fail(`baseline expires field is not a date: ${base.expires}`);
if (Date.now() > expiry) {
  console.error(`\n[companion-reach] ✗ two-hop baseline expired on ${base.expires}.`);
  console.error("            An exception without a clock is a polite delete key. Either pull the");
  console.error("            two-hop files up to one hop, or measure that depth and write down what");
  console.error("            was measured — then set a new date with the reason.");
  red++;
} else if (by("two-hop").length > base.twoHopFiles) {
  console.error(
    `\n[companion-reach] ✗ two-hop debt grew: ${by("two-hop").length} files, baseline ${base.twoHopFiles}.`,
  );
  console.error("            New content must be reachable in one hop. The ratchet only turns down.");
  red++;
} else if (by("two-hop").length < base.twoHopFiles) {
  console.log(
    `[companion-reach] ↓ two-hop debt shrank to ${by("two-hop").length} (baseline ${base.twoHopFiles}) — lower the baseline.`,
  );
}

if (red > 0) process.exit(1);
console.log("[companion-reach] ✓ every companion is reachable; two-hop debt at or below baseline.");
