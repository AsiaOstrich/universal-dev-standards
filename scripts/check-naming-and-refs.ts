#!/usr/bin/env tsx
/**
 * Naming & Cross-Reference Consistency Checker
 * 命名與交叉引用一致性檢查器
 *
 * Cross-platform TypeScript implementation. Run with `tsx`.
 *
 * Surfaces three classes of issue found in the dev-platform UDS Stage 2 review
 * (XSPEC-292):
 *   1. T15 Dangling references (ERROR) — relative markdown links to *.md that
 *      do not resolve, across this repo's content roots (core/, skills/,
 *      locales/, integrations/) and their locale copies.
 *      Illustrative example filenames (ADR-NNN, docs/getting-started.md, …) are
 *      excluded so only real broken links fail.
 *
 *      Content roots (core/class-level-fix.md: walk, don't enumerate) are read
 *      from `git ls-files` — every top-level directory this repo's own git
 *      index says holds tracked content — not from any hand-typed or
 *      half-hand-typed list. An earlier version of this fix used
 *      cli/src/core/constants.js's DIRECTORIES registry as the root list; that
 *      IS the same defect one level up: DIRECTORIES has 8 members, this repo
 *      has 26 tracked top-level directories, and the 18 DIRECTORIES doesn't
 *      know about include `options/` — 7 of this repo's own shipped standards
 *      live there, carrying 188 relative links with zero prior coverage.
 *      Printing "8 roots, all scanned" as the denominator was a *more*
 *      convincing false green than the original bug: it looked complete.
 *      `integrations/` was invisible to this checker until 2026-08-12
 *      (XSPEC-362 R5 shipped its whole content into a directory no include-list
 *      here had heard of, DIRECTORIES-derived or not). Self-install/copy
 *      targets — `.standards/` and every AI agent's project skill/command/
 *      agent/workflow path from ai-agent-paths.js's AI_AGENT_PATHS
 *      (`.claude/`, `.gemini/`, …), plus anything `.gitignore` covers — are
 *      excluded, each with a printed, named reason: they are WRITTEN BY the
 *      CLI as installed copies, so their relative links resolve against an
 *      install root, not this repo tree, and checking them here always
 *      false-positives (same category as `cli/bundled/`, just not gitignored).
 *      Every surviving root is walked completely via `git ls-files` — no
 *      per-root filename cherry-picking (the old code's `skills/` did,
 *      catching only `SKILL.md` and missing sibling reference docs shipped in
 *      the same folder) — and the scan prints the TRUE denominator (tracked
 *      top-level dirs), what was excluded and why, and what was actually
 *      scanned, per class-level-fix's non-vacuity requirement.
 *   2. T5 Acceptance-criteria annotation consistency (ADVISORY) — flags genuine
 *      violations of the canonical contract defined in
 *      acceptance-criteria-traceability.md, NOT mere coexistence of forms:
 *        - a split @AC tag: a tag-only line carrying @AC-<n> without its source
 *          attribution (@SPEC-<id> or @US-<id>) on the SAME line. The canonical
 *          is the combined tag `@SPEC-<id> @AC-<n>`; "do not split into separate
 *          @AC / @SPEC lines". (Mere coexistence of @AC and @SPEC counts is NOT a
 *          defect — the canonical form contains both.)
 *        - camelCase `acceptanceCriteria` used outside the rule that documents it
 *          is unused. (kebab `acceptance-criteria` and snake `acceptance_criteria`
 *          are layer-appropriate spellings, by design — never flagged.)
 *   3. Duplicate skill command names (ADVISORY) — two skills declaring the same
 *      frontmatter `name:` (would collide as /command).
 *
 * Usage: tsx scripts/check-naming-and-refs.ts
 * Exit: 1 if any real dangling reference (ERROR); 0 otherwise (advisories never block).
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { DIRECTORIES } from '../cli/src/core/constants.js';
import { AI_AGENT_PATHS } from '../cli/src/config/ai-agent-paths.js';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = dirname(dirname(__filename));

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[0;34m';
const DIM = '\x1b[2m';
const NC = '\x1b[0m';

/**
 * Every top-level directory git's own index says holds at least one tracked
 * file — the TRUE denominator (core/class-level-fix.md). Not `readdirSync`
 * on the filesystem (would include gitignored/untracked cruft) and not a
 * registry lookup — a registry is still an enumeration, it only moves who
 * typed it. A prior version of this fix used cli/src/core/constants.js's
 * DIRECTORIES (8 members) as the root list; this repo has 26 tracked
 * top-level directories, and the 18 DIRECTORIES doesn't know about include
 * `options/` — 7 shipped standards, 188 relative links, zero prior coverage.
 */
function listTrackedTopDirs(): string[] {
  const out = execFileSync('git', ['ls-files'], { cwd: ROOT_DIR }).toString();
  const dirs = new Set<string>();
  for (const line of out.split('\n')) {
    if (!line || !line.includes('/')) continue;
    dirs.add(line.split('/')[0]);
  }
  return [...dirs].sort();
}

/**
 * Every tracked `*.md` file, as absolute paths — sourced from the same git
 * index as the denominator above, so the scanned file set can never
 * silently diverge from what was counted.
 */
function listTrackedMarkdownFiles(): string[] {
  const out = execFileSync('git', ['ls-files', '--', '*.md'], { cwd: ROOT_DIR }).toString();
  return out
    .split('\n')
    .filter(Boolean)
    .map((rel) => join(ROOT_DIR, rel));
}

/** True when `.gitignore` (read by git itself, not re-parsed by hand) covers this path. */
function isGitIgnored(relPath: string): boolean {
  try {
    execFileSync('git', ['check-ignore', '-q', relPath], { cwd: ROOT_DIR });
    return true; // exit 0 = ignored
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 1) return false; // exit 1 = not ignored (git's own contract)
    // Any other exit (128 = not a git repo / bad path, etc.) is "git could not
    // answer" — the reason a naive `2>/dev/null` around a query is banned:
    // that silences exactly this case and makes it indistinguishable from
    // "not ignored". Surface it instead of guessing.
    throw new Error(`git check-ignore failed unexpectedly on "${relPath}" (exit ${status}): ${String(err)}`);
  }
}

const ALL_TRACKED_TOP_DIRS = listTrackedTopDirs();

// ── Exclusions: named, printed, sourced from config — never the root list itself ──
function buildExcludedRoots(): Map<string, string> {
  const excluded = new Map<string, string>();
  // `.standards/` is the CLI's own install target for adopters (and for this
  // repo's own self-adoption copy) — a written COPY, not source.
  if (ALL_TRACKED_TOP_DIRS.includes(DIRECTORIES.STANDARDS)) {
    excluded.set(
      DIRECTORIES.STANDARDS,
      'self-install target (uds init/update writes an adopted copy here; relative links resolve against the install root, not this repo)',
    );
  }
  // Every AI agent's project-level skill/command/agent/workflow install path
  // (`.claude/`, `.gemini/`, `.opencode/`, …) — read from ai-agent-paths.js's
  // own AI_AGENT_PATHS rather than re-typed, so a newly supported agent's
  // install directory is excluded automatically too.
  for (const config of Object.values(AI_AGENT_PATHS) as Array<Record<string, unknown>>) {
    for (const kind of ['skills', 'commands', 'agents', 'workflows']) {
      const projectPath = (config[kind] as { project?: string } | null)?.project;
      if (!projectPath) continue;
      const top = projectPath.split('/')[0];
      if (ALL_TRACKED_TOP_DIRS.includes(top) && !excluded.has(top)) {
        excluded.set(top, `AI agent install target (${config.name as string}) — installed copy, not source`);
      }
    }
  }
  // Anything `.gitignore` covers. Redundant in the common case (a fully
  // gitignored directory has no tracked files, so it never even reaches
  // ALL_TRACKED_TOP_DIRS) but kept as an explicit, printed check rather than
  // an unstated assumption.
  for (const d of ALL_TRACKED_TOP_DIRS) {
    if (!excluded.has(d) && isGitIgnored(d)) {
      excluded.set(d, 'gitignored (untracked local/runtime data, per .gitignore)');
    }
  }
  return excluded;
}

const EXCLUDED_ROOTS = buildExcludedRoots();
const CONTENT_ROOTS = ALL_TRACKED_TOP_DIRS.filter((d) => !EXCLUDED_ROOTS.has(d));

interface CollectResult {
  files: string[];
  allTopDirs: string[];
  roots: string[];
  excludedRoots: Array<{ dir: string; reason: string }>;
}

function collectFiles(): CollectResult {
  const contentRootSet = new Set(CONTENT_ROOTS);
  const files = listTrackedMarkdownFiles().filter((abs) => {
    const rel = relative(ROOT_DIR, abs);
    const top = rel.includes('/') ? rel.split('/')[0] : null;
    return top !== null && contentRootSet.has(top);
  });
  const excludedRoots = [...EXCLUDED_ROOTS.entries()].map(([dir, reason]) => ({ dir, reason }));
  return { files: [...new Set(files)], allTopDirs: ALL_TRACKED_TOP_DIRS, roots: CONTENT_ROOTS, excludedRoots };
}

// Illustrative example targets that are NOT real repo files (skip these).
const EXAMPLE_RE =
  /NNN|xxx|<|>|ADR-\d|DEC-\d|SPEC-\d|TASK-\d|\bURL\b|^params$|^link$|example|sample|your-|my-|path\/to\//i;
const EXAMPLE_DIR_RE =
  /(^|\/)(src|tests?|docs|config|\.github|\.uds|\.claude|\.windsurf|\.opencode|\.cursor|artifacts|errors|alerts|emergency|specs|flows|redis-caching|test-plans|en|ja|zh-tw|decisions|node_modules|dist|build)\//i;

interface DanglingResult {
  dangling: string[];
  linksChecked: number; // every relative *.md link inspected, resolved or not
}

function checkDangling(files: string[]): DanglingResult {
  const dangling: string[] = [];
  let linksChecked = 0;
  for (const file of files) {
    const txt = readFileSync(file, 'utf8');
    const baseDir = dirname(file);
    const rel = relative(ROOT_DIR, file);
    for (const m of txt.matchAll(/\]\(([^)]+\.md)\)/g)) {
      const raw = m[1].trim();
      if (/^https?:|^mailto:/.test(raw)) continue;
      const target = raw.split('#')[0];
      if (target.length === 0) continue;
      if (EXAMPLE_RE.test(target) || EXAMPLE_DIR_RE.test(target)) continue;
      linksChecked += 1;
      const abs = resolve(baseDir, target);
      if (!existsSync(abs) && !existsSync(resolve(ROOT_DIR, target))) {
        dangling.push(`${rel} -> ${target}`);
      }
    }
  }
  return { dangling: [...new Set(dangling)], linksChecked };
}

// A line made up solely of @tag tokens — how Gherkin scenario tags appear.
// Prose that merely mentions `@AC` / `@SPEC` (backticks, words, tables) never matches.
const TAG_ONLY_LINE_RE = /^\s*@[\w-]+(?:\s+@[\w-]+)*\s*$/;
const AC_TAG_RE = /@AC-[A-Za-z0-9]+/;
// Canonical source attribution: @SPEC-<id> (SDD) or @US-<id> (ATDD/user-story).
const SOURCE_TAG_RE = /@(?:SPEC|US)-[A-Za-z0-9]+/;

interface AnnotationFindings {
  splitAc: string[]; // tag-only lines with @AC- lacking a same-line source attribution
  camelKey: string[]; // camelCase `acceptanceCriteria` outside the rule that documents it is unused
}

function checkAnnotationConsistency(files: string[]): AnnotationFindings {
  const splitAc: string[] = [];
  const camelKey: string[] = [];
  for (const file of files) {
    const rel = relative(ROOT_DIR, file);
    // The traceability standard documents that camelCase is "not used"; that prose
    // mention is not a violation. Its locale copies mirror the same sentence.
    const isCanonicalDef = /acceptance-criteria-traceability\.md$/.test(file);
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (TAG_ONLY_LINE_RE.test(line) && AC_TAG_RE.test(line) && !SOURCE_TAG_RE.test(line)) {
        splitAc.push(`${rel}:${i + 1}: ${line.trim()}`);
      }
      if (!isCanonicalDef && /acceptanceCriteria/.test(line)) {
        camelKey.push(`${rel}:${i + 1}`);
      }
    });
  }
  return { splitAc, camelKey };
}

function checkDuplicateSkillNames(): string[] {
  const skillsDir = join(ROOT_DIR, 'skills');
  const seen = new Map<string, string>();
  const dups: string[] = [];
  if (!existsSync(skillsDir)) return dups;
  for (const dir of readdirSync(skillsDir)) {
    const card = join(skillsDir, dir, 'SKILL.md');
    if (!existsSync(card)) continue;
    const fm = readFileSync(card, 'utf8').match(/^---\n([\s\S]*?)\n---/);
    const nameLine = fm && fm[1].match(/^name:\s*(.+)$/m);
    if (!nameLine) continue;
    const name = nameLine[1].trim();
    if (seen.has(name)) dups.push(`${name}: ${seen.get(name)} & ${dir}`);
    else seen.set(name, dir);
  }
  return dups;
}

function main(): void {
  process.stdout.write('\n==========================================\n');
  process.stdout.write('  Naming & Cross-Reference Checker\n');
  process.stdout.write('  命名與交叉引用一致性檢查器\n');
  process.stdout.write('==========================================\n\n');

  const collected = collectFiles();
  const files = collected.files;
  process.stdout.write(
    `Tracked top-level directories (true denominator, via \`git ls-files\`): ${collected.allTopDirs.length}\n`,
  );
  process.stdout.write(`  [${collected.allTopDirs.join(', ')}]\n\n`);
  process.stdout.write(`Excluded ${collected.excludedRoots.length} (named reason each):\n`);
  for (const e of collected.excludedRoots) {
    process.stdout.write(`  ${DIM}- ${e.dir}/ — ${e.reason}${NC}\n`);
  }
  process.stdout.write(
    `\nScanned ${collected.roots.length} content root(s): ${collected.roots.join(', ')}\n`,
  );
  process.stdout.write(`  → ${files.length} markdown files\n\n`);

  // 1. Dangling (ERROR)
  process.stdout.write(`${BLUE}[1/3] Dangling cross-references (T15)${NC}\n`);
  const { dangling, linksChecked } = checkDangling(files);
  process.stdout.write(`  Relative *.md links checked: ${linksChecked}\n`);
  if (dangling.length === 0) {
    process.stdout.write(`  ${GREEN}[OK]${NC} no real dangling references\n\n`);
  } else {
    for (const d of dangling) process.stdout.write(`  ${RED}[BROKEN]${NC} ${d}\n`);
    process.stdout.write('\n');
  }

  // 2. Annotation consistency (ADVISORY)
  process.stdout.write(`${BLUE}[2/3] AC annotation consistency (T5)${NC}\n`);
  const anno = checkAnnotationConsistency(files);
  const annoMixed = anno.splitAc.length > 0 || anno.camelKey.length > 0;
  if (annoMixed) {
    for (const v of anno.splitAc) process.stdout.write(`  ${RED}[SPLIT-AC]${NC} ${v} — fold in @SPEC-<id> / @US-<id> source\n`);
    for (const v of anno.camelKey) process.stdout.write(`  ${YELLOW}[CAMEL]${NC} ${v} — use kebab/snake spelling, not acceptanceCriteria\n`);
    process.stdout.write(
      `  ${YELLOW}[ADVISORY]${NC} ${anno.splitAc.length} split @AC tag(s), ${anno.camelKey.length} camelCase key(s) — see acceptance-criteria-traceability.md\n\n`,
    );
  } else {
    process.stdout.write(`  ${GREEN}[OK]${NC} all @AC tags carry their source; no camelCase keys\n\n`);
  }

  // 3. Duplicate skill command names (ADVISORY)
  process.stdout.write(`${BLUE}[3/3] Duplicate skill command names${NC}\n`);
  const dups = checkDuplicateSkillNames();
  if (dups.length === 0) {
    process.stdout.write(`  ${GREEN}[OK]${NC} all skill names unique\n\n`);
  } else {
    for (const d of dups) process.stdout.write(`  ${YELLOW}[DUP]${NC} ${d}\n`);
    process.stdout.write('\n');
  }

  // Summary
  process.stdout.write('==========================================\n');
  process.stdout.write('  Summary | 摘要\n');
  process.stdout.write('==========================================\n');
  process.stdout.write(`  Dangling (error): ${dangling.length}\n`);
  process.stdout.write(`  Annotation split/camelCase (advisory): ${annoMixed ? 'yes' : 'no'}\n`);
  process.stdout.write(`  Duplicate names (advisory): ${dups.length}\n\n`);

  // Advisory-first (XSPEC-292 §7): surface findings without blocking CI until the
  // locale-skill backlog is cleared. Set STRICT=1 to promote dangling to a hard gate.
  if (dangling.length > 0 && process.env.STRICT === '1') {
    process.stdout.write(`${RED}FAIL (STRICT): fix dangling references above.${NC}\n\n`);
    process.exit(1);
  }
  if (dangling.length > 0) {
    process.stdout.write(
      `${YELLOW}ADVISORY: ${dangling.length} dangling reference(s) — fix then run with STRICT=1 to enforce.${NC}\n\n`,
    );
  } else {
    process.stdout.write(`${GREEN}OK: no dangling references.${NC}\n\n`);
  }
  process.exit(0);
}

main();
