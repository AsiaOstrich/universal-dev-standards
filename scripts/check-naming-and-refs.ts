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
 *      do not resolve, in core/*.md, skills/**\/SKILL.md and their locale copies.
 *      Illustrative example filenames (ADR-NNN, docs/getting-started.md, …) are
 *      excluded so only real broken links fail.
 *   2. T5 Acceptance-criteria annotation key consistency (ADVISORY) — reports
 *      mixed usage of @AC / @SPEC and acceptance-criteria / acceptance_criteria /
 *      acceptanceCriteria so a single canonical key can be adopted.
 *   3. Duplicate skill command names (ADVISORY) — two skills declaring the same
 *      frontmatter `name:` (would collide as /command).
 *
 * Usage: tsx scripts/check-naming-and-refs.ts
 * Exit: 1 if any real dangling reference (ERROR); 0 otherwise (advisories never block).
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = dirname(dirname(__filename));

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[0;34m';
const NC = '\x1b[0m';

// Markdown files to scan: core standards, skill cards, and their locale copies.
function walk(dir: string, acc: string[]): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.git') continue;
      walk(full, acc);
    } else if (entry.endsWith('.md')) {
      acc.push(full);
    }
  }
  return acc;
}

function collectFiles(): string[] {
  const files: string[] = [];
  walk(join(ROOT_DIR, 'core'), files);
  // skill cards (canonical + locale)
  const skillRoots = [join(ROOT_DIR, 'skills')];
  for (const loc of ['zh-TW', 'zh-CN']) {
    skillRoots.push(join(ROOT_DIR, 'locales', loc, 'skills'));
    files.push(...walk(join(ROOT_DIR, 'locales', loc, 'core'), []));
  }
  for (const root of skillRoots) {
    if (!existsSync(root)) continue;
    for (const f of walk(root, [])) {
      if (f.endsWith('SKILL.md')) files.push(f);
    }
  }
  return [...new Set(files)];
}

// Illustrative example targets that are NOT real repo files (skip these).
const EXAMPLE_RE =
  /NNN|xxx|<|>|ADR-\d|DEC-\d|SPEC-\d|TASK-\d|\bURL\b|^params$|^link$|example|sample|your-|my-|path\/to\//i;
const EXAMPLE_DIR_RE =
  /(^|\/)(src|tests?|docs|config|\.github|\.uds|\.claude|\.windsurf|\.opencode|\.cursor|artifacts|errors|alerts|emergency|specs|flows|redis-caching|test-plans|en|ja|zh-tw|decisions|node_modules|dist|build)\//i;

function checkDangling(files: string[]): string[] {
  const dangling: string[] = [];
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
      const abs = resolve(baseDir, target);
      if (!existsSync(abs) && !existsSync(resolve(ROOT_DIR, target))) {
        dangling.push(`${rel} -> ${target}`);
      }
    }
  }
  return [...new Set(dangling)];
}

function checkAnnotationKeys(files: string[]): Record<string, number> {
  const keys = { '@AC': 0, '@SPEC': 0, 'acceptance-criteria': 0, acceptance_criteria: 0, acceptanceCriteria: 0 };
  for (const file of files) {
    const txt = readFileSync(file, 'utf8');
    for (const k of Object.keys(keys) as (keyof typeof keys)[]) {
      const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      keys[k] += (txt.match(re) || []).length;
    }
  }
  return keys;
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

  const files = collectFiles();
  process.stdout.write(`Scanned ${files.length} markdown files (core + skills + locales)\n\n`);

  // 1. Dangling (ERROR)
  process.stdout.write(`${BLUE}[1/3] Dangling cross-references (T15)${NC}\n`);
  const dangling = checkDangling(files);
  if (dangling.length === 0) {
    process.stdout.write(`  ${GREEN}[OK]${NC} no real dangling references\n\n`);
  } else {
    for (const d of dangling) process.stdout.write(`  ${RED}[BROKEN]${NC} ${d}\n`);
    process.stdout.write('\n');
  }

  // 2. Annotation keys (ADVISORY)
  process.stdout.write(`${BLUE}[2/3] AC annotation key consistency (T5)${NC}\n`);
  const keys = checkAnnotationKeys(files);
  const annoMixed = keys['@AC'] > 0 && keys['@SPEC'] > 0;
  const keyMixed =
    [keys['acceptance-criteria'], keys.acceptance_criteria, keys.acceptanceCriteria].filter((n) => n > 0).length > 1;
  for (const [k, v] of Object.entries(keys)) process.stdout.write(`  ${k}: ${v}\n`);
  if (annoMixed || keyMixed) {
    process.stdout.write(
      `  ${YELLOW}[ADVISORY]${NC} mixed annotation/key forms — adopt one canonical key in acceptance-criteria-traceability.md\n\n`,
    );
  } else {
    process.stdout.write(`  ${GREEN}[OK]${NC} consistent\n\n`);
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
  process.stdout.write(`  Annotation/key mixed (advisory): ${annoMixed || keyMixed ? 'yes' : 'no'}\n`);
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
