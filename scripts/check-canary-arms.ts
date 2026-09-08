#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * check-canary-arms.ts — the counter-arms of XSPEC-408 §11 that need no model.
 *
 * `canary-inject.ts --self-test` and `check-canary-transcript.ts --self-test` each
 * test one half in isolation. Both can pass while the pair is broken, because each
 * builds its own inputs. This runs the whole chain end to end:
 *
 *     inject into an install  ->  read the tokens back OFF DISK  ->  score
 *
 * "Read the tokens back off disk" is the stand-in for a perfect model: a transcript
 * that recites exactly what is actually in the files. That makes the mutation arm
 * real — truncate a file on disk and the transcript changes because the file changed,
 * not because a test string was edited.
 *
 * 🔴 Why this uses a synthetic install and not `uds init`
 * ─────────────────────────────────────────────────────
 * `uds init` installs husky and touches the network. A gate that needs the network is
 * a gate that goes red for reasons unrelated to what it measures, and then gets
 * switched off. What the real CLI had to prove — **that an install carries companion
 * files at all** — is a one-time observation, and it was made before any of this was
 * written: a fresh `uds init --mode skills` into an empty repo produced 55 skills and
 * 59 companions, with the companion set identical to source in all 55. That number is
 * recorded in XSPEC-408 §16, not re-derived here.
 *
 * Exit codes
 *   0 = every arm behaved as declared
 *   1 = an arm did not — the instrument measures nothing until this is fixed
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const INJECT = join(HERE, "canary-inject.ts");
const SCORE = join(HERE, "check-canary-transcript.ts");
const TOKEN_RE = /UDSCANARY-[0-9A-F]{12}/g;

/** Run a script and return its exit code plus combined output — never a thrown error,
 *  because the codes 1 and 2 are results here, not failures of the harness. */
function run(script: string, args: string[]): { code: number; out: string } {
  try {
    const out = execFileSync("npx", ["tsx", script, ...args], { encoding: "utf8", stdio: "pipe" });
    return { code: 0, out };
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return { code: err.status ?? -1, out: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
}

/** Every token actually present in the install tree — a perfect model's recital. */
function reciteFromDisk(installDir: string, runId: string): string {
  const tokens: string[] = [];
  for (const skill of readdirSync(installDir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    const dir = join(installDir, skill.name);
    for (const f of readdirSync(dir).filter((n) => n.endsWith(".md"))) {
      tokens.push(...(readFileSync(join(dir, f), "utf8").match(TOKEN_RE) ?? []));
    }
  }
  return `${runId}\n${tokens.join("\n")}\n`;
}

function fixture(): { root: string; installDir: string } {
  const root = mkdtempSync(join(tmpdir(), "uds-canary-arms-"));
  const installDir = join(root, ".claude", "skills");
  const fm = ["---", "name: n", "description: d", "---"].join("\n");
  const body = Array.from({ length: 24 }, (_, i) => (i % 3 === 0 ? "" : `prose line ${i}`)).join("\n");
  for (const [skill, files] of Object.entries({
    alpha: {
      "SKILL.md": `${fm}\n# Alpha\n\nRead [w](./workflow.md) and [r](./reference.md).\n\n${body}\n`,
      "workflow.md": "# Workflow\n\nalpha workflow body\n",
      "reference.md": "# Reference\n\nalpha reference body\n",
    },
    beta: {
      "SKILL.md": `${fm}\n# Beta\n\nRead [g](./guide.md).\n\n${body}\n`,
      "guide.md": "# Guide\n\nbeta guide body\n",
    },
  })) {
    const d = join(installDir, skill);
    mkdirSync(d, { recursive: true });
    for (const [n, b] of Object.entries(files)) writeFileSync(join(d, n), b, "utf8");
  }
  return { root, installDir };
}

const arms: Array<[string, boolean, string]> = [];
const add = (label: string, pass: boolean, detail = "") => arms.push([label, pass, detail]);

// ── arm 1: the chain works at all ─────────────────────────────────────
{
  const { root, installDir } = fixture();
  const manifest = join(root, "manifest.json");
  const inj = run(INJECT, [installDir, `--out=${manifest}`, "--salt=ARMS", "--run=RUN-ARMS01"]);
  const t = join(root, "perfect.txt");
  writeFileSync(t, reciteFromDisk(installDir, "RUN-ARMS01"), "utf8");
  const s = run(SCORE, [`--manifest=${manifest}`, `--transcript=${t}`]);
  add("chain — inject, recite off disk, score: exit 0", inj.code === 0 && s.code === 0, s.out.trim().split("\n")[0]);
  add(
    "chain — all 3 companions scored present",
    /companions: 3\/3 present/.test(s.out),
    s.out.split("\n").find((l) => l.includes("companions:")) ?? "",
  );
}

// ── arm 2: 🔴 mutation on disk — §11 arm 1 ────────────────────────────
{
  const { root, installDir } = fixture();
  const manifest = join(root, "manifest.json");
  run(INJECT, [installDir, `--out=${manifest}`, "--salt=ARMS", "--run=RUN-ARMS02"]);
  // Truncate a companion so its marker is gone. A model reciting what is on disk
  // now cannot produce that token — which is the whole claim being tested.
  writeFileSync(join(installDir, "alpha", "reference.md"), "# Reference\n\n(truncated)\n", "utf8");
  const t = join(root, "mutated.txt");
  writeFileSync(t, reciteFromDisk(installDir, "RUN-ARMS02"), "utf8");
  const s = run(SCORE, [`--manifest=${manifest}`, `--transcript=${t}`]);
  add("🔴 mutation arm — a truncated companion goes red: exit 1", s.code === 1, s.out.trim().split("\n").at(-1) ?? "");
  add("🔴 mutation arm — it names the right file", /absent: reference\.md/.test(s.out));
  add("🔴 mutation arm — the untouched companion is still present", /companions: 2\/3 present/.test(s.out));
}

// ── arm 3: SKILL.md truncated is TRUNCATED, not "companions missing" ──
{
  const { root, installDir } = fixture();
  const manifest = join(root, "manifest.json");
  run(INJECT, [installDir, `--out=${manifest}`, "--salt=ARMS", "--run=RUN-ARMS03"]);
  const p = join(installDir, "beta", "SKILL.md");
  const lines = readFileSync(p, "utf8").split("\n");
  writeFileSync(p, lines.slice(0, Math.floor(lines.length * 0.6)).join("\n"), "utf8");
  const t = join(root, "cut.txt");
  writeFileSync(t, reciteFromDisk(installDir, "RUN-ARMS03"), "utf8");
  const s = run(SCORE, [`--manifest=${manifest}`, `--transcript=${t}`]);
  add("truncated SKILL.md reads as TRUNCATED, exit 1", s.code === 1 && /beta: TRUNCATED/.test(s.out));
}

// ── arm 4: 🔴 wrong repo — §11 arm 2 ──────────────────────────────────
{
  const root = mkdtempSync(join(tmpdir(), "uds-canary-empty-"));
  const empty = join(root, "nothing");
  mkdirSync(join(empty, "docs"), { recursive: true });
  const manifest = join(root, "manifest.json");
  const inj = run(INJECT, [empty, `--out=${manifest}`]);
  add("🔴 wrong-repo arm — no SKILL.md anywhere: exit 2", inj.code === 2);
  add("🔴 wrong-repo arm — and NO manifest is written", !existsSync(manifest));
}

// ── arm 5: pairing guard ──────────────────────────────────────────────
{
  const { root, installDir } = fixture();
  const manifest = join(root, "manifest.json");
  run(INJECT, [installDir, `--out=${manifest}`, "--salt=ARMS", "--run=RUN-ARMS05"]);
  const t = join(root, "otherrun.txt");
  writeFileSync(t, reciteFromDisk(installDir, "RUN-SOMETHINGELSE"), "utf8");
  const s = run(SCORE, [`--manifest=${manifest}`, `--transcript=${t}`]);
  add(
    "pairing guard — a transcript from another run refuses to score: exit 2",
    s.code === 2 && /does not contain run id/.test(s.out),
  );
}

// ── arm 6: 🔴 the control — the scorer is not simply always red ───────
{
  const { root, installDir } = fixture();
  const manifest = join(root, "manifest.json");
  run(INJECT, [installDir, `--out=${manifest}`, "--salt=ARMS", "--run=RUN-ARMS06"]);
  // Add unrelated noise. A scorer keyed on anything but the tokens would move.
  const t = join(root, "noisy.txt");
  writeFileSync(t, `${reciteFromDisk(installDir, "RUN-ARMS06")}\nunrelated chatter about tests and coverage\n`, "utf8");
  const s = run(SCORE, [`--manifest=${manifest}`, `--transcript=${t}`]);
  add("control arm — unrelated prose does not move the result: still exit 0", s.code === 0);
}

let ok = true;
for (const [label, pass, detail] of arms) {
  ok &&= pass;
  console.log(`  ${pass ? "OK " : "x  "} ${label}${pass || !detail ? "" : `\n        got: ${detail}`}`);
}
console.log(`[canary-arms] ${arms.filter((a) => a[1]).length}/${arms.length} arms as declared`);
if (!ok) {
  console.error("[canary-arms] x an arm did not behave as declared — the instrument measures nothing yet");
  process.exit(1);
}
process.exit(0);
