#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * canary-inject.ts — put a unique meaningless token in every file the tool might load.
 *
 * The question this exists to answer
 * ─────────────────────────────────
 * `check-skill-companion-reachability.ts` proved a *structural* fact: every one of
 * the 168 companion files is now one hop from its SKILL.md. It proved nothing about
 * whether any tool ever follows that hop. One hop is the mechanism every vendor's
 * docs describe and **no run in this repo has ever observed** — 221 archived
 * transcripts, 3 session logs, 7 read commands, 0 touching a skills path.
 *
 * This injects the markers. `check-canary-transcript.ts` scores them.
 *
 * 🔴 Markers are injected into an *install*, never into the source
 * ──────────────────────────────────────────────────────────────
 * XSPEC-408 R2 as originally written says to bury the markers in every long
 * `SKILL.md`. Taken literally that ships nonsense strings to every adopter, forever,
 * to answer a question that is ours and not theirs.
 *
 * It is also unnecessary. A tool reads bytes off disk from `<repo>/.claude/skills/…`;
 * it cannot tell whether those bytes came from a release or from this script thirty
 * seconds ago. Injecting into a scratch probe repo's install measures exactly the
 * same thing at zero cost to anyone downstream. Verified before writing this: the
 * install does copy companions — 58 installed skills, file set identical to source
 * in all 58. R2 amended in the same commit as this file.
 *
 * Where the markers go, and why each position is forced
 * ────────────────────────────────────────────────────
 *   SKILL.md head    — **after the closing frontmatter delimiter, never before.**
 *                      Some tools parse only the frontmatter to decide whether to
 *                      trigger. A token above it breaks the YAML, the skill never
 *                      triggers, and "head absent" would read as "the model could not
 *                      recite" when the truth is "the skill never loaded".
 *   SKILL.md middle  — nearest blank line to the midpoint that is **outside a code
 *                      fence, outside a table, and outside the frontmatter**. Inside
 *                      any of those the token changes how the block parses.
 *   SKILL.md tail    — end of file. head OK / tail missing is the truncation signal.
 *   companion        — one token at the head. This measures **arrival, not
 *                      completeness**: a companion whose tail was cut still scores
 *                      `present`. Arrival is the open question; completeness is not.
 *
 * Visible text, not an HTML comment: a tool that strips comments before assembling
 * context would produce "head absent" for a reason unrelated to the question.
 *
 * 🔴 Every token carries a per-run salt
 * ────────────────────────────────────
 * `_baselines/` transcripts live in a public repo. A token derived from the path
 * alone would be stable across runs, could reach training data, and "recited from
 * memory" is indistinguishable from "read from disk" — the exact luck-vs-arrival
 * line that P1 and P3 were just rewritten on.
 *
 * Exit codes
 *   0 = injected, manifest written
 *   2 = refused (no install found, no SKILL.md anywhere, already injected) — the
 *       wrong-repo arm of XSPEC-408 §11 lives here, and it needs no model to run
 */

import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";

const MARK = "UDSCANARY";
const FENCE = /^\s*`{3,}/;
const SELF_TEST = process.argv.includes("--self-test");

export interface CompanionMarker {
  readonly file: string;
  readonly token: string;
  /** Does this skill's SKILL.md name this file? Reused by the scorer to tell a
   *  one-hop read apart from the model going fishing across the install tree. */
  readonly namedBySkillMd: boolean;
}
export interface SkillMarkers {
  readonly skill: string;
  readonly head: string;
  readonly middle: string;
  readonly tail: string;
  readonly companions: readonly CompanionMarker[];
}
export interface Manifest {
  readonly runId: string;
  readonly salt: string;
  readonly generated: string;
  readonly installDir: string;
  readonly skills: readonly SkillMarkers[];
}

function token(salt: string, relPath: string, slot: string): string {
  const h = createHash("sha256").update(`${salt} ${relPath} ${slot}`).digest("hex");
  return `${MARK}-${h.slice(0, 12).toUpperCase()}`;
}

/** Full filename only — never the stem. `guide` is an ordinary English word, and a
 *  stem matcher scored `slo-assistant` as linked when `guide.md` appears zero times. */
function names(haystack: string, fileName: string): boolean {
  return haystack.includes(fileName);
}

/** Line index just past the closing delimiter of YAML frontmatter, or 0 if none. */
function afterFrontmatter(lines: readonly string[]): number {
  if (lines[0]?.trim() !== "---") return 0;
  for (let i = 1; i < lines.length; i++) if (lines[i].trim() === "---") return i + 1;
  return 0; // unterminated frontmatter — treat as none rather than corrupt the file
}

/**
 * A blank line near the midpoint that is safe to write on: not in the frontmatter,
 * not inside a fenced block, and not adjacent to a table row (a token beside a row
 * ends the table early on every renderer).
 */
function midpointSlot(lines: readonly string[], from: number): number {
  const target = Math.floor((from + lines.length) / 2);
  const fenced = new Set<number>();
  let open = false;
  for (let i = 0; i < lines.length; i++) {
    if (FENCE.test(lines[i])) open = !open;
    if (open) fenced.add(i);
  }
  const safe = (i: number) =>
    i > from &&
    i < lines.length &&
    lines[i].trim() === "" &&
    !fenced.has(i) &&
    !(lines[i - 1] ?? "").includes("|") &&
    !(lines[i + 1] ?? "").includes("|");
  for (let d = 0; d < lines.length; d++) {
    if (safe(target - d)) return target - d;
    if (safe(target + d)) return target + d;
  }
  return -1; // no safe slot — the caller appends instead of inserting
}

function injectSkillMd(body: string, marks: { head: string; middle: string; tail: string }): string {
  const lines = body.split("\n");
  const start = afterFrontmatter(lines);
  const mid = midpointSlot(lines, start);
  const out = [...lines];
  // Bottom-up, so earlier indices stay valid as we splice.
  out.push("", marks.tail, "");
  if (mid >= 0) out.splice(mid, 0, marks.middle);
  out.splice(start, 0, "", marks.head, "");
  return out.join("\n");
}

function injectCompanion(body: string, mark: string): string {
  const lines = body.split("\n");
  const start = afterFrontmatter(lines);
  const out = [...lines];
  out.splice(start, 0, "", mark, "");
  return out.join("\n");
}

function refuse(msg: string): never {
  console.error(`[canary-inject] x ${msg}`);
  process.exit(2);
}

/** Walk an install directory. A directory without SKILL.md is not a skill. */
function skillDirs(installDir: string): string[] {
  if (!existsSync(installDir)) return [];
  return readdirSync(installDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(installDir, e.name))
    .filter((d) => existsSync(join(d, "SKILL.md")));
}

export function inject(installDir: string, salt: string, runId: string): Manifest {
  const dirs = skillDirs(installDir);
  if (dirs.length === 0) {
    refuse(
      `walked ${installDir} and found 0 directories containing SKILL.md — ` +
        `this is not an install of UDS skills. Refusing to write a manifest, because ` +
        `a manifest over an empty walk scores every later transcript as "absent".`,
    );
  }
  const skills: SkillMarkers[] = [];
  for (const dir of dirs) {
    const skill = basename(dir);
    const skillMdPath = join(dir, "SKILL.md");
    const skillBody = readFileSync(skillMdPath, "utf8");
    if (skillBody.includes(MARK)) refuse(`${skill}/SKILL.md already contains ${MARK} — refusing to inject twice`);

    const marks = {
      head: token(salt, `${skill}/SKILL.md`, "head"),
      middle: token(salt, `${skill}/SKILL.md`, "middle"),
      tail: token(salt, `${skill}/SKILL.md`, "tail"),
    };
    writeFileSync(skillMdPath, injectSkillMd(skillBody, marks), "utf8");

    const companions: CompanionMarker[] = [];
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "SKILL.md")) {
      const t = token(salt, `${skill}/${file}`, "head");
      const p = join(dir, file);
      writeFileSync(p, injectCompanion(readFileSync(p, "utf8"), t), "utf8");
      companions.push({ file, token: t, namedBySkillMd: names(skillBody, file) });
    }
    skills.push({ skill, ...marks, companions });
  }
  return { runId, salt, generated: new Date().toISOString(), installDir, skills };
}

// ── self-test ─────────────────────────────────────────────────────────
if (SELF_TEST) {
  const root = mkdtempSync(join(tmpdir(), "uds-canary-inject-"));
  const fence = "`".repeat(3);
  const fm = ["---", "name: demo", "description: d", "---"].join("\n");
  const filler = Array.from({ length: 20 }, (_, i) => (i % 3 === 0 ? "" : `line ${i}`)).join("\n");
  const mk = (base: string, skill: string, files: Record<string, string>) => {
    const d = join(root, base, skill);
    mkdirSync(d, { recursive: true });
    for (const [n, b] of Object.entries(files)) writeFileSync(join(d, n), b, "utf8");
  };

  mk("install", "demo", {
    "SKILL.md": `${fm}\n# Demo\n\nSee [w](./workflow.md).\n\n${filler}\n`,
    "workflow.md": "# Workflow\n\nbody\n",
    "orphan.md": "# Orphan\n\nbody\n",
  });
  // Every blank line in the body sits inside a fence — the middle marker must not
  // land in it, and must fall back to a line outside.
  mk("install", "fenced", {
    "SKILL.md": `${fm}\n# F\n\n${fence}ts\n\nconst a = 1;\n\n${fence}\n\ntail text\n`,
  });

  const installDir = join(root, "install");
  const m = inject(installDir, "SALT", "RUN");
  const read = (s: string, f: string) => readFileSync(join(installDir, s, f), "utf8");
  const demo = m.skills.find((s) => s.skill === "demo")!;
  const body = read("demo", "SKILL.md");
  const lines = body.split("\n");

  // A second tree with a different salt — the stale-token arm.
  mk("install2", "demo", {
    "SKILL.md": `${fm}\n# Demo\n\nSee [w](./workflow.md).\n\n${filler}\n`,
    "workflow.md": "# Workflow\n\nbody\n",
  });
  const m2 = inject(join(root, "install2"), "OTHER-SALT", "RUN2");

  const fencedBody = read("fenced", "SKILL.md");
  const fLines = fencedBody.split("\n");
  const fMid = m.skills.find((s) => s.skill === "fenced")!.middle;
  const fIdx = fLines.indexOf(fMid);
  let openBefore = false;
  for (let i = 0; i < fIdx; i++) if (FENCE.test(fLines[i])) openBefore = !openBefore;

  const arms: Array<[string, boolean]> = [
    ["head lands AFTER the frontmatter close, never above it", lines.indexOf(demo.head) > lines.lastIndexOf("---")],
    [
      "all three SKILL.md tokens are present and distinct",
      new Set([demo.head, demo.middle, demo.tail]).size === 3 &&
        [demo.head, demo.middle, demo.tail].every((t) => body.includes(t)),
    ],
    ["tail is the last non-empty line", lines.filter((l) => l.trim() !== "").at(-1) === demo.tail],
    [
      "every companion got a token, orphan included",
      demo.companions.length === 2 && demo.companions.every((c) => read("demo", c.file).includes(c.token)),
    ],
    [
      "namedBySkillMd true for the linked one, false for the orphan",
      demo.companions.find((c) => c.file === "workflow.md")!.namedBySkillMd === true &&
        demo.companions.find((c) => c.file === "orphan.md")!.namedBySkillMd === false,
    ],
    [
      "tokens differ between two skills for the same slot",
      demo.head !== m.skills.find((s) => s.skill === "fenced")!.head,
    ],
    [
      "🔴 a different salt yields different tokens for the same path — no token survives a run",
      m2.skills[0].head !== demo.head && m2.skills[0].companions[0].token !== demo.companions[0].token,
    ],
    ["🔴 the middle marker never lands inside a fenced block", fIdx >= 0 && !openBefore],
  ];

  let ok = true;
  for (const [label, pass] of arms) {
    ok &&= pass;
    console.log(`  ${pass ? "OK " : "x  "} ${label}`);
  }
  console.log("  →  wrong-repo arm runs out-of-process: refusing means exit 2, see check:canary:arms");
  if (!ok) {
    console.error("[canary-inject] x self-test failed");
    process.exit(2);
  }
  console.log("[canary-inject] self-test passed");
  process.exit(0);
}

// ── CLI ───────────────────────────────────────────────────────────────
const positional = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flag = (n: string) => {
  const hit = process.argv.find((a) => a.startsWith(`--${n}=`));
  return hit ? hit.slice(n.length + 3) : undefined;
};
if (positional.length === 0) refuse("usage: canary-inject.ts <install-dir> [--out=manifest.json] [--salt=…] [--run=…]");

const installDir = resolve(positional[0]);
const salt = flag("salt") ?? randomBytes(8).toString("hex");
const runId = flag("run") ?? `RUN-${randomBytes(4).toString("hex").toUpperCase()}`;
const out = resolve(flag("out") ?? join(installDir, "..", "canary-manifest.json"));

const manifest = inject(installDir, salt, runId);
writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const nComp = manifest.skills.reduce((n, s) => n + s.companions.length, 0);
console.log(`[canary-inject] ${installDir}`);
console.log(`                run ${manifest.runId}`);
console.log(
  `                ${manifest.skills.length} skills, ${nComp} companions, ` +
    `${manifest.skills.length * 3 + nComp} tokens`,
);
console.log(`                manifest -> ${out}`);
