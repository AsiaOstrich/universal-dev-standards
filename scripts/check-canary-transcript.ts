#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * check-canary-transcript.ts — the deterministic judge. The model recites; this scores.
 *
 * XSPEC-408 R2, verbatim: "判斷由決定性腳本做字串比對，不由模型做."
 * Nothing here asks a model anything. It takes a manifest from `canary-inject.ts`
 * and a transcript, and does string comparison.
 *
 * The three-state read, and why the third state emits nothing
 * ─────────────────────────────────────────────────────────
 *   head missing              -> INVALID. The model could not recite at all. This is
 *                                NOT "the content did not load", and the difference is
 *                                the whole point of R2. **A skill scored INVALID emits
 *                                zero companion rows.** That is structural, not a
 *                                convention: §11's weak-model arm exists because a weak
 *                                model produces a page of confident "not loaded" lines,
 *                                and a scorer that can print those is a scorer that
 *                                manufactures findings.
 *   head OK, tail missing     -> TRUNCATED, and we know where it was cut.
 *   head + middle + tail OK   -> DELIVERED. **Delivered is not followed.** Whether the
 *                                model then did what the skill says is a separate
 *                                question this instrument does not touch.
 *
 * 🔴 Reciting a token is not by itself evidence of the mechanism
 * ─────────────────────────────────────────────────────────────
 * A model that runs `grep -r UDSCANARY .claude/skills` can recite every token in the
 * tree while proving nothing. But the opposite over-correction is worse and was the
 * first thing I got wrong here: **a read of the companion is the finding, not
 * contamination.** The one-hop mechanism every vendor documents *is* "SKILL.md names
 * a file and the agent opens it". So the route is scored three ways:
 *
 *   via-injection      no reference to the install tree anywhere in the transcript.
 *                      The bytes were placed in context by the tool. Strongest.
 *   one-hop-observed   the transcript reads exactly a file this skill's SKILL.md
 *                      names. **This is the observation the whole spec is chasing.**
 *   fishing            a listing/grep over the tree, or a read of a file SKILL.md
 *                      does not name. The model went looking. INVALID for that skill.
 *
 * The precondition that makes the route decidable is on the *prompt*, not here: the
 * probe prompt must contain no token, no filename, and no skill directory name. See
 * `docs/reference/CANARY-PROBE.md`.
 *
 * Pairing guard
 * ─────────────
 * The transcript must contain the manifest's `runId`. The model echoes it because the
 * prompt hands it over — it proves nothing about loading and is not scored. It exists
 * so that scoring a transcript against the *wrong run's* manifest reports "cannot
 * tell" instead of a confident page of "absent". Without it, a mismatched pair and a
 * total load failure are the same output.
 *
 * Exit codes
 *   0 = every skill DELIVERED, every companion present
 *   1 = a real finding: something absent, or a SKILL.md truncated
 *   2 = cannot tell: runId missing, or any skill INVALID (could not recite / fishing)
 */

import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const SELF_TEST = process.argv.includes("--self-test");

interface CompanionMarker {
  readonly file: string;
  readonly token: string;
  readonly namedBySkillMd: boolean;
}
interface SkillMarkers {
  readonly skill: string;
  readonly head: string;
  readonly middle: string;
  readonly tail: string;
  readonly companions: readonly CompanionMarker[];
}
interface Manifest {
  readonly runId: string;
  readonly salt: string;
  readonly installDir: string;
  readonly skills: readonly SkillMarkers[];
}

type State = "DELIVERED" | "TRUNCATED" | "INVALID";
type Route = "via-injection" | "one-hop-observed" | "fishing";

interface SkillScore {
  readonly skill: string;
  readonly state: State;
  readonly route: Route;
  readonly why: string;
  /** 🔴 Empty whenever state is INVALID. See the header. */
  readonly companions: ReadonlyArray<{ file: string; present: boolean; namedBySkillMd: boolean }>;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Every path under the install dir that the transcript mentions, relative to it.
 * A bare mention of the install dir with no sub-path (an `ls` of the tree) yields "".
 */
function referencedPaths(transcript: string, installDir: string): string[] {
  const re = new RegExp(`${escapeRe(installDir)}(/[A-Za-z0-9._/-]*)?`, "g");
  const out: string[] = [];
  for (const m of transcript.matchAll(re)) out.push((m[1] ?? "").replace(/^\//, "").replace(/\/$/, ""));
  return out;
}

function routeFor(skill: SkillMarkers, refs: readonly string[]): { route: Route; why: string } {
  const mine = refs.filter((p) => p === "" || p === skill.skill || p.startsWith(`${skill.skill}/`));
  if (mine.length === 0) {
    return { route: "via-injection", why: "transcript never mentions the install tree for this skill" };
  }
  const named = new Set(skill.companions.filter((c) => c.namedBySkillMd).map((c) => `${skill.skill}/${c.file}`));
  const bad = mine.filter((p) => p !== `${skill.skill}/SKILL.md` && !named.has(p));
  if (bad.length > 0) {
    const shown = bad.map((p) => (p === "" ? "<the tree itself>" : p)).slice(0, 3).join(", ");
    return { route: "fishing", why: `went looking: ${shown}` };
  }
  return { route: "one-hop-observed", why: `read a file SKILL.md names: ${mine.join(", ")}` };
}

export function score(manifest: Manifest, transcript: string): { rows: SkillScore[]; exit: 0 | 1 | 2 } {
  if (!transcript.includes(manifest.runId)) {
    return { rows: [], exit: 2 };
  }
  const refs = referencedPaths(transcript, manifest.installDir);
  const rows: SkillScore[] = [];
  for (const skill of manifest.skills) {
    const { route, why } = routeFor(skill, refs);
    const head = transcript.includes(skill.head);
    const tail = transcript.includes(skill.tail);
    let state: State;
    if (!head || route === "fishing") state = "INVALID";
    else if (!tail) state = "TRUNCATED";
    else state = "DELIVERED";

    rows.push({
      skill: skill.skill,
      state,
      route,
      why: state === "INVALID" && !head ? "head marker not recited" : why,
      // 🔴 Structurally empty on INVALID — the scorer cannot manufacture "not loaded".
      companions:
        state === "INVALID"
          ? []
          : skill.companions.map((c) => ({
              file: c.file,
              present: transcript.includes(c.token),
              namedBySkillMd: c.namedBySkillMd,
            })),
    });
  }
  if (rows.some((r) => r.state === "INVALID")) return { rows, exit: 2 };
  if (rows.some((r) => r.state === "TRUNCATED" || r.companions.some((c) => !c.present))) return { rows, exit: 1 };
  return { rows, exit: 0 };
}

// ── self-test ─────────────────────────────────────────────────────────
if (SELF_TEST) {
  const installDir = "/probe/.claude/skills";
  const manifest: Manifest = {
    runId: "RUN-ABC123",
    salt: "s",
    installDir,
    skills: [
      {
        skill: "demo",
        head: "UDSCANARY-H1",
        middle: "UDSCANARY-M1",
        tail: "UDSCANARY-T1",
        companions: [
          { file: "workflow.md", token: "UDSCANARY-C1", namedBySkillMd: true },
          { file: "reference.md", token: "UDSCANARY-C2", namedBySkillMd: true },
        ],
      },
    ],
  };
  const full = "RUN-ABC123 UDSCANARY-H1 UDSCANARY-M1 UDSCANARY-T1 UDSCANARY-C1 UDSCANARY-C2";
  const arms: Array<[string, boolean]> = [];
  const add = (label: string, pass: boolean) => arms.push([label, pass]);

  const a = score(manifest, full);
  add("baseline — everything recited: DELIVERED, both present, exit 0", a.exit === 0 &&
    a.rows[0].state === "DELIVERED" && a.rows[0].companions.every((c) => c.present));
  add("baseline route is via-injection when the tree is never mentioned", a.rows[0].route === "via-injection");

  // 🔴 mutation arm — XSPEC-408 §11 arm 1. Remove one companion's marker: it must go red.
  const b = score(manifest, full.replace("UDSCANARY-C2", ""));
  add("🔴 mutation arm — one companion's token removed: that row absent, exit 1", b.exit === 1 &&
    b.rows[0].companions.find((c) => c.file === "reference.md")!.present === false &&
    b.rows[0].companions.find((c) => c.file === "workflow.md")!.present === true);

  const c = score(manifest, full.replace("UDSCANARY-T1", ""));
  add("tail removed reads as TRUNCATED, not as companions missing", c.exit === 1 &&
    c.rows[0].state === "TRUNCATED" && c.rows[0].companions.every((x) => x.present));

  // 🔴 the buildable half of the weak-model arm
  const d = score(manifest, full.replace("UDSCANARY-H1", ""));
  add("🔴 weak-model arm — head removed: INVALID, ZERO companion rows, exit 2", d.exit === 2 &&
    d.rows[0].state === "INVALID" && d.rows[0].companions.length === 0);

  const e = score(manifest, full.replace("RUN-ABC123", "RUN-OTHER"));
  add("pairing guard — wrong run's transcript: no rows at all, exit 2", e.exit === 2 && e.rows.length === 0);

  const f = score(manifest, `${full}\nI ran: grep -r UDSCANARY ${installDir}`);
  add("🔴 fishing — a grep over the tree makes the recital worthless: INVALID, exit 2", f.exit === 2 &&
    f.rows[0].route === "fishing" && f.rows[0].companions.length === 0);

  const g = score(manifest, `${full}\nRead ${installDir}/demo/workflow.md`);
  add("🔴 reading a file SKILL.md names is the FINDING, not contamination: one-hop-observed, exit 0",
    g.exit === 0 && g.rows[0].route === "one-hop-observed" && g.rows[0].state === "DELIVERED");

  const h = score(manifest, `${full}\nRead ${installDir}/demo/secret.md`);
  add("a read of a file SKILL.md does NOT name is fishing", h.rows[0].route === "fishing");

  let ok = true;
  for (const [label, pass] of arms) {
    ok &&= pass;
    console.log(`  ${pass ? "OK " : "x  "} ${label}`);
  }
  if (!ok) {
    console.error("[canary-score] x self-test failed");
    process.exit(2);
  }
  console.log("[canary-score] self-test passed");
  process.exit(0);
}

// ── CLI ───────────────────────────────────────────────────────────────
const flag = (n: string) => {
  const hit = process.argv.find((a) => a.startsWith(`--${n}=`));
  return hit ? hit.slice(n.length + 3) : undefined;
};
const manifestPath = flag("manifest");
const transcriptPath = flag("transcript");
if (!manifestPath || !transcriptPath) {
  console.error("usage: check-canary-transcript.ts --manifest=<file> --transcript=<file>");
  process.exit(2);
}
for (const p of [manifestPath, transcriptPath]) {
  if (!existsSync(resolve(p))) {
    console.error(`[canary-score] x not found: ${p}`);
    process.exit(2);
  }
}
const manifest = JSON.parse(readFileSync(resolve(manifestPath), "utf8")) as Manifest;
const transcript = readFileSync(resolve(transcriptPath), "utf8");
const { rows, exit } = score(manifest, transcript);

console.log(`[canary-score] run ${manifest.runId}  install ${manifest.installDir}`);
if (rows.length === 0) {
  console.error(
    `               x this transcript does not contain run id ${manifest.runId}. ` +
      `Refusing to score — a mismatched pair and a total load failure look identical.`,
  );
  process.exit(2);
}
// The denominator always prints. A walk that quietly shrinks reports green over less.
console.log(`               ${rows.length} skills scored`);
for (const st of ["DELIVERED", "TRUNCATED", "INVALID"] as State[]) {
  console.log(`               ${st.padEnd(10)} ${String(rows.filter((r) => r.state === st).length).padStart(3)}`);
}
const scored = rows.flatMap((r) => r.companions);
console.log(
  `               companions: ${scored.filter((c) => c.present).length}/${scored.length} present ` +
    `(rows from INVALID skills are omitted by design)`,
);
for (const r of rows) {
  const missing = r.companions.filter((c) => !c.present);
  if (r.state === "DELIVERED" && missing.length === 0) continue;
  console.log(`\n  ${r.skill}: ${r.state} [${r.route}] — ${r.why}`);
  for (const c of missing) console.log(`      absent: ${c.file}`);
}
process.exit(exit);
