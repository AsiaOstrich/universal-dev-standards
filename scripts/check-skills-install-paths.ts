#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * check-skills-install-paths.ts — does `uds init` put skills where the tool reads them?
 *
 * Why this exists
 * ───────────────
 * Twice now, UDS has installed skills into a directory the target tool never reads,
 * and both times the adopter saw a successful init and an assistant that behaved as
 * if the skills did not exist — because for that tool, they did not.
 *
 *   1. `.codex/skills/` — "a directory UDS invented" (the words are in
 *      `ai-agent-paths.js`). A behavioural probe against Codex failed while Codex
 *      was behaving perfectly. Fixed 2026-07-23 by correcting the **path table**.
 *   2. `uds init -y` — measured 2026-09-08 (XSPEC-408 §18.3). A repo detected as
 *      codex got **zero skills anywhere, silently**; and with a location forced, all
 *      55 went to `.claude/skills/`. Codex does not read that directory: two probe
 *      arms differing only in path gave 15,235 vs 18,096 input tokens, and only the
 *      `.agents/skills` arm made Codex report it could see the skills.
 *
 * 🔴 The second one is why a gate exists rather than another fix. The first fix
 * corrected the table. The second break was in an install path that never asked the
 * table — so correcting the table could not have prevented it, and no test noticed,
 * because every test named the tools it checked. **This walks the table instead.**
 * A new entry in `AI_AGENT_PATHS` is covered the day it is added, by nobody.
 *
 * What it does per skills-capable tool: a temp repo containing only that tool's own
 * detector marker, a real `uds init --mode skills --skills-location project -y`, and
 * an assertion that `<the table's own project path>` holds skills.
 *
 * Control arm: a tool that `supportsSkills` but has no verified path (antigravity)
 * must install nothing **and say so**. Silence is the failure mode being gated —
 * an adopter who is told nothing cannot know to look.
 *
 * Exit codes
 *   0 = every skills-capable tool installs to its own declared path
 *   1 = a tool's skills went somewhere it does not read, or nowhere, or silently
 *   2 = cannot tell (no tools walked, the CLI did not run) — NOT green
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const CLI = join(ROOT, "cli", "bin", "uds.js");

const { AI_AGENT_PATHS } = (await import(join(ROOT, "cli/src/config/ai-agent-paths.js"))) as {
  AI_AGENT_PATHS: Record<
    string,
    { name: string; supportsSkills?: boolean; skills?: { project: string } | null }
  >;
};

/**
 * The marker that makes `detectAITools` see a tool. Read from the detector's own
 * source rather than retyped — a copied list is a second place to forget a tool.
 */
const DETECTOR_SRC = join(ROOT, "cli/src/utils/detector.js");
function markerFor(agent: string): { path: string; isDir: boolean } | null {
  const src = readFileSync(DETECTOR_SRC, "utf8");
  // Each detector line looks like:  codex: hasAgentsMd,  /  cursor: existsSync(join(projectPath, '.cursorrules')),
  const key = agent === "claude-code" ? "claudeCode" : agent === "gemini-cli" ? "geminiCli" : agent;
  const line = src.split("\n").find((l) => new RegExp(`^\\s*${key}\\s*:`).test(l));
  if (!line) return null;
  if (/hasAgentsMd/.test(line)) return { path: "AGENTS.md", isDir: false };
  const parts = [...line.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  if (parts.length === 0) return null;
  const markerPath = join(...parts);
  // 🔴 File or directory is asked of the path table, not guessed from the name.
  // Two guesses failed here, each producing a defect the gate then blamed on the
  // CLI: "a dot means a file" wrote `.claude` as a file (claude-code init failed),
  // and "no dot means a directory" wrote `.cursorrules` as a directory, which init
  // then could not write its integration file into (cursor, cline and windsurf all
  // failed). The discriminator that needs no guessing: a marker is a directory
  // exactly when this tool's own skills path lives inside it.
  const skillsProject = AI_AGENT_PATHS[agent]?.skills?.project ?? "";
  const isDir = skillsProject.replace(/\/+$/, "").startsWith(`${markerPath}/`);
  return { path: markerPath, isDir };
}

function skillCount(dir: string): number {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir, { withFileTypes: true }).filter(
    (e) => e.isDirectory() && existsSync(join(dir, e.name, "SKILL.md")),
  ).length;
}

function runInit(repo: string): { ok: boolean; out: string } {
  try {
    const out = execFileSync(
      process.execPath,
      [CLI, "init", "--mode", "skills", "--skills-location", "project", "-y"],
      { cwd: repo, encoding: "utf8", stdio: "pipe", env: { ...process.env, CI: "1" } },
    );
    return { ok: true, out };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string };
    return { ok: false, out: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
}

function makeRepo(marker: { path: string; isDir: boolean }): string {
  const repo = mkdtempSync(join(tmpdir(), "uds-installpath-"));
  writeFileSync(join(repo, "package.json"), '{"name":"probe","version":"0.0.0"}\n', "utf8");
  const target = join(repo, marker.path);
  if (marker.isDir) mkdirSync(target, { recursive: true });
  else {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, "# marker\n", "utf8");
  }
  return repo;
}

// ── the walk ──────────────────────────────────────────────────────────
if (!existsSync(CLI)) {
  console.error(`[install-paths] cannot tell — CLI not found at ${CLI}`);
  process.exit(2);
}

const entries = Object.entries(AI_AGENT_PATHS);
const capable = entries.filter(([, c]) => c.supportsSkills && c.skills);
const pathless = entries.filter(([, c]) => c.supportsSkills && !c.skills);

// The denominator always prints. A walk that quietly shrinks reports green over less.
console.log(`[install-paths] path table has ${entries.length} tools`);
console.log(`                ${capable.length} declare a skills path, ${pathless.length} support skills without one`);

let red = 0;
let checked = 0;
const undetectable: string[] = [];

for (const [agent, config] of capable) {
  const marker = markerFor(agent);
  if (!marker) {
    // Not red, and the reason is a rule this repo already paid for: a gate that
    // stays red on something nobody is going to fix today gets switched off, and
    // then it stops watching the things that ARE fixable. Counted and named loudly
    // instead — see the summary line.
    undetectable.push(agent);
    continue;
  }
  const repo = makeRepo(marker);
  const { ok, out } = runInit(repo);
  const declared = join(repo, config.skills!.project);
  const n = skillCount(declared);
  checked++;

  if (!ok) {
    console.error(`  x   ${agent.padEnd(14)} init failed\n${out.split("\n").slice(-4).join("\n")}`);
    red++;
    continue;
  }
  if (n > 0) {
    console.log(`  OK  ${agent.padEnd(14)} ${n} skills in ${config.skills!.project}`);
    continue;
  }

  // Where did they actually go? Naming the wrong directory is most of the fix.
  const strays = capable
    .map(([other, c]) => [other, join(repo, c.skills!.project)] as const)
    .filter(([other, d]) => other !== agent && skillCount(d) > 0)
    .map(([other, d]) => `${other} (${d.slice(repo.length + 1)})`);
  console.error(
    `  x   ${agent.padEnd(14)} 0 skills in its own path ${config.skills!.project}` +
      (strays.length > 0 ? ` — they went to ${strays.join(", ")}` : " — and nowhere else either"),
  );
  red++;
}

// ── control arm ───────────────────────────────────────────────────────
// A tool with no verified path must install nothing AND say so. The silence is the
// defect: `--mode skills` once exited 0 having installed nothing, printing no line.
for (const [agent, config] of pathless) {
  const marker = markerFor(agent);
  if (!marker) continue;
  const repo = makeRepo(marker);
  const { ok, out } = runInit(repo);
  checked++;
  const wroteSomewhere = capable.some(([, c]) => skillCount(join(repo, c.skills!.project)) > 0);
  // 🔴 The message must be PRINTED, not merely present in the output. The first
  // version of this arm tested only `out.includes(…)` and passed while `uds init`
  // was crashing — Node prints the offending source line in a stack trace, and that
  // line contained the very string being searched for. A control arm that a crash
  // satisfies is not a control arm.
  const saidSo = ok && /no verified skills path|沒有查證過的 skills 路徑/.test(out);
  if (!ok) {
    console.error(`  x   ${agent.padEnd(14)} init crashed\n${out.split("\n").filter(Boolean).slice(-3).join("\n")}`);
    red++;
  } else if (wroteSomewhere) {
    console.error(`  x   ${agent.padEnd(14)} has no verified path, yet skills were written somewhere`);
    red++;
  } else if (!saidSo) {
    console.error(
      `  x   ${agent.padEnd(14)} installed nothing and said nothing — an adopter cannot know to look`,
    );
    red++;
  } else {
    console.log(`  OK  ${agent.padEnd(14)} (${config.name}) installs nothing and says so`);
  }
}

if (checked === 0) {
  console.error("[install-paths] cannot tell — walked the table and checked 0 tools");
  process.exit(2);
}
// 🔴 A tool in the path table that no detector marker can trigger is unreachable:
// `uds init` will never install for it, whatever the paths say. Found by this gate on
// its first run — `roo-code` has an entry in the path table and no line in
// `detector.js`. Reported, not failed, and deliberately not guessed at: inventing a
// marker file is how `.codex/skills/` happened in the first place.
if (undetectable.length > 0) {
  console.log(
    `\n[install-paths] ! ${undetectable.length} tool(s) in the path table that no detector marker reaches: ` +
      `${undetectable.join(", ")}`,
  );
  console.log("            `uds init` can never install for these, whatever their paths declare.");
  console.log("            Fixing one means finding its real marker in that tool's own docs — never guessing.");
}

if (red > 0) {
  console.error(`\n[install-paths] x ${red} of ${checked} tools would get skills they never read.`);
  console.error("            An adopter sees a successful init and an assistant that ignores the standards.");
  process.exit(1);
}
console.log(`[install-paths] OK — ${checked} tools, each installs to the path its own table entry declares.`);
process.exit(0);
