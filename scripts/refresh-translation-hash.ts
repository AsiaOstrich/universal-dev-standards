#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * refresh-translation-hash.ts — stamp `source_hash` in translation frontmatter.
 *
 * scripts/check-translation-sync.sh (commit 661a7850) added a source_hash
 * content-drift layer: it compares the first 12 chars of `git hash-object
 * <source file>` against the `source_hash` declared in a translation's
 * frontmatter, and reports [DRIFT] on mismatch. That field is currently
 * hand-filled — easy to forget, easy to get wrong (609 translations have no
 * source_hash at all as of 2026-07-08).
 *
 * This tool stamps the CURRENT source hash into a translation's frontmatter,
 * AFTER a maintainer has confirmed the translation is up to date with its
 * source. It does not, and cannot, know whether a translation's *content* is
 * actually current — only a human (or the act of re-translating) can assert
 * that. Stamping a hash is an assertion "this translation matches the source
 * as of right now"; a wrong assertion re-hides real drift. See the safety
 * guards below.
 *
 * ── Safety design (read before changing behavior) ──────────────────────────
 *   - Dry-run by default. Nothing is written unless --write is passed.
 *   - Three target-selection modes:
 *       <file...>       Explicit files — the primary, normal use case. Naming
 *                        a file IS the human assertion "this translation is
 *                        current". Eligible for --write with no extra flag.
 *       --all-missing   Only translations with NO source_hash field at all.
 *                        Eligible for --write, but prints a loud warning:
 *                        stamping still asserts "this file is current".
 *       --all           Every managed translation, including ones whose
 *                        existing source_hash already MISMATCHES (i.e. real,
 *                        previously-detected drift). Machines cannot tell a
 *                        genuinely-stale translation from one that's merely
 *                        missing a hash refresh, so --write here requires
 *                        --force AND prints a large warning: this can assert
 *                        stale translations are current and hide real drift.
 *   - Already-matching hashes are always a no-op (skip, never rewritten).
 *   - Missing source file -> skip + warn, never throws.
 *   - No git available -> hard error, exit 1 (hash cannot be computed at all).
 *   - Only the `source_hash:` line inside the LEADING frontmatter block is
 *     ever touched. Every other field, and the entire document body, is
 *     copied through byte-for-byte.
 *
 * Usage:
 *   tsx scripts/refresh-translation-hash.ts <file...>                 # dry-run
 *   tsx scripts/refresh-translation-hash.ts <file...> --write         # stamp
 *   tsx scripts/refresh-translation-hash.ts --all-missing [--write]
 *   tsx scripts/refresh-translation-hash.ts --all [--write --force]
 *   tsx scripts/refresh-translation-hash.ts --help
 */

import { execFileSync } from 'node:child_process';
import {
  existsSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  realpathSync
} from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/** realpathSync but returns the input unchanged if the path doesn't exist. */
function tryRealpath(p: string): string {
  try {
    return realpathSync(p);
  } catch {
    return p;
  }
}

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
// Test-only escape hatch: --all / --all-missing scan this directory instead of
// the real repo's locales/. Never set in normal use; exists so bats tests can
// exercise the bulk-scan modes against a throwaway sandbox tree without any
// risk of touching real translation files. Explicit-file mode never uses this.
const LOCALES_DIR = process.env.REFRESH_TRANSLATION_HASH_LOCALES_DIR
  ? resolve(process.env.REFRESH_TRANSLATION_HASH_LOCALES_DIR)
  : join(ROOT, 'locales');
const HASH_LEN = 12;

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const ORANGE = '\x1b[0;33m';
const BLUE = '\x1b[0;34m';
const BOLD = '\x1b[1m';
const NC = '\x1b[0m';

// ── Pure helpers (frontmatter I/O) ──────────────────────────────────────────

export interface Frontmatter {
  block: string; // the whole "---\n...\n---\n" match, including delimiters
  inner: string; // content between the delimiters, no trailing newline
  rest: string; // everything after the frontmatter block
}

/** Split a file's leading YAML frontmatter block from the rest of the content. */
export function splitFrontmatter(content: string): Frontmatter | null {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  return { block: m[0], inner: m[1], rest: content.slice(m[0].length) };
}

/** Read a single-line `key: value` field from frontmatter inner text. */
export function getFrontmatterField(inner: string, key: string): string | null {
  const m = inner.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'));
  return m ? m[1].trim() : null;
}

/** Normalize a declared source_hash value: hex-only, first HASH_LEN chars. */
export function normalizeHash(raw: string | null): string {
  if (!raw) return '';
  const firstToken = raw.split(/\s+/)[0] || '';
  return firstToken.replace(/[^0-9a-fA-F]/g, '').slice(0, HASH_LEN);
}

/**
 * Return frontmatter `inner` text with `source_hash` set to `hash`, touching
 * ONLY that one line. Update in place if present; otherwise insert right
 * after `last_synced`, else right before `status`, else append at the end —
 * matching the established field order (source, source_version,
 * translation_version, last_synced, source_hash, status) without requiring
 * any of those fields to exist.
 */
export function setSourceHashField(inner: string, hash: string): string {
  const newLine = `source_hash: ${hash}`;
  if (/^source_hash:[ \t]*.*$/m.test(inner)) {
    return inner.replace(/^source_hash:[ \t]*.*$/m, newLine);
  }
  if (/^last_synced:[ \t]*.*$/m.test(inner)) {
    return inner.replace(/^(last_synced:[ \t]*.*)$/m, `$1\n${newLine}`);
  }
  if (/^status:[ \t]*.*$/m.test(inner)) {
    return inner.replace(/^(status:[ \t]*.*)$/m, `${newLine}\n$1`);
  }
  return `${inner}\n${newLine}`;
}

// ── Git hashing ──────────────────────────────────────────────────────────────

let gitChecked = false;

/** Verify `git hash-object` is usable in this environment; exits(1) if not. */
export function assertGitAvailable(): void {
  if (gitChecked) return;
  try {
    execFileSync('git', ['hash-object', fileURLToPath(import.meta.url)], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    gitChecked = true;
  } catch {
    console.error(
      `${RED}Error:${NC} git is unavailable (or 'git hash-object' failed). ` +
        `source_hash cannot be computed in a non-git environment. Aborting.`
    );
    process.exit(1);
  }
}

/** First HASH_LEN chars of `git hash-object <file>`. Assumes git is available. */
export function computeSourceHash(absPath: string): string {
  const out = execFileSync('git', ['hash-object', absPath], { cwd: ROOT }).toString().trim();
  return out.slice(0, HASH_LEN);
}

// ── Source path resolution (mirrors check-translation-sync.sh exactly) ─────

/**
 * Resolve a translation's declared `source:` path to an absolute path, using
 * the SAME rule as check-translation-sync.sh's compute logic: paths starting
 * with "../" are relative to the translation file's own directory; anything
 * else is relative to the repo root. (Some managed translations declare a
 * bare repo-root-relative path, e.g. `source: core/guides/foo.md`.)
 */
export function resolveSourcePath(transAbsPath: string, sourceRelPath: string): string {
  if (sourceRelPath.startsWith('../')) {
    return resolve(dirname(transAbsPath), sourceRelPath);
  }
  return resolve(ROOT, sourceRelPath);
}

// ── Discovery ────────────────────────────────────────────────────────────────

/** Recursively list every *.md file under locales/. */
export function findAllTranslationFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const abs = join(dir, entry);
      const st = statSync(abs);
      if (st.isDirectory()) walk(abs);
      else if (entry.endsWith('.md')) out.push(abs);
    }
  };
  walk(LOCALES_DIR);
  return out.sort();
}

// ── Per-file plan ────────────────────────────────────────────────────────────

export type PlanStatus =
  | 'stamp' // hash missing or mismatched, eligible to write
  | 'skip-current' // declared hash already matches actual
  | 'skip-not-managed' // no `source:` field
  | 'skip-missing-source' // source: field present but file not found
  | 'skip-not-eligible'; // eligible for a different mode, not this one

export interface FilePlan {
  absPath: string;
  relPath: string;
  status: PlanStatus;
  declaredHash: string; // '' if absent
  actualHash: string; // '' if not computed (skip-not-managed / skip-missing-source)
  sourceRelPath: string | null;
  reason?: string;
}

function planFile(absPath: string): FilePlan {
  const relPath = relative(ROOT, absPath);
  const content = readFileSync(absPath, 'utf-8');
  const fm = splitFrontmatter(content);
  const sourceRelPath = fm ? getFrontmatterField(fm.inner, 'source') : null;

  if (!fm || !sourceRelPath) {
    return {
      absPath,
      relPath,
      status: 'skip-not-managed',
      declaredHash: '',
      actualHash: '',
      sourceRelPath: null,
      reason: 'no source: field — not a managed translation',
    };
  }

  const sourceAbs = resolveSourcePath(absPath, sourceRelPath);
  if (!existsSync(sourceAbs) || !statSync(sourceAbs).isFile()) {
    return {
      absPath,
      relPath,
      status: 'skip-missing-source',
      declaredHash: normalizeHash(getFrontmatterField(fm.inner, 'source_hash')),
      actualHash: '',
      sourceRelPath,
      reason: `source not found: ${sourceRelPath}`,
    };
  }

  const declaredHash = normalizeHash(getFrontmatterField(fm.inner, 'source_hash'));
  const actualHash = computeSourceHash(sourceAbs);

  if (declaredHash && declaredHash === actualHash) {
    return { absPath, relPath, status: 'skip-current', declaredHash, actualHash, sourceRelPath };
  }
  return { absPath, relPath, status: 'stamp', declaredHash, actualHash, sourceRelPath };
}

/** Write the new source_hash into a file's frontmatter (only that one field). */
function stampFile(plan: FilePlan): void {
  const content = readFileSync(plan.absPath, 'utf-8');
  const fm = splitFrontmatter(content);
  if (!fm) throw new Error(`unexpected: frontmatter missing at write time: ${plan.relPath}`);
  const newInner = setSourceHashField(fm.inner, plan.actualHash);
  const newBlock = `---\n${newInner}\n---\n`;
  writeFileSync(plan.absPath, newBlock + fm.rest, 'utf-8');
}

// ── CLI ──────────────────────────────────────────────────────────────────────

function usage(): void {
  console.log(`
refresh-translation-hash.ts — stamp source_hash in translation frontmatter

Usage:
  tsx scripts/refresh-translation-hash.ts <file...> [--write]
  tsx scripts/refresh-translation-hash.ts --all-missing [--write]
  tsx scripts/refresh-translation-hash.ts --all [--write --force]
  tsx scripts/refresh-translation-hash.ts --help

Modes (pick exactly one):
  <file...>       Explicit locale file paths. Naming a file IS the assertion
                   "this translation is current with its source". The normal,
                   primary use case. --write requires no extra flag.
  --all-missing    Only translations with NO source_hash field. --write is
                   allowed but prints a warning (still an assertion of
                   currency).
  --all            All managed translations, including ones with an existing
                   MISMATCHED hash (i.e. previously-detected drift). --write
                   here additionally requires --force, or it is refused
                   outright — this mode can hide real drift if misused.

Flags:
  --write   Actually rewrite files. Without it, this is always a dry-run
            report; nothing is written.
  --force   Required together with --write when using --all. Refused
            otherwise.
  --help    Show this help.

Exit codes: 0 on success (including a clean dry-run), 1 on misuse or a
non-git environment (source_hash cannot be computed without git).
`);
}

interface Summary {
  stamped: number;
  wouldStamp: number;
  skippedCurrent: number;
  skippedMissingSource: number;
  skippedNotManaged: number;
}

function printPlanLine(plan: FilePlan, write: boolean): void {
  switch (plan.status) {
    case 'stamp': {
      const verb = write ? 'STAMPED' : 'WOULD-STAMP';
      const color = write ? GREEN : ORANGE;
      const from = plan.declaredHash || '(none)';
      console.log(`${color}[${verb}]${NC} ${plan.relPath}`);
      console.log(`          source_hash: ${from} -> ${plan.actualHash}`);
      break;
    }
    case 'skip-current':
      console.log(`${BLUE}[SKIP]${NC}       ${plan.relPath}  (already current: ${plan.declaredHash})`);
      break;
    case 'skip-missing-source':
      console.log(`${RED}[SKIP]${NC}       ${plan.relPath}  (${plan.reason})`);
      break;
    case 'skip-not-managed':
      console.log(`${YELLOW}[SKIP]${NC}       ${plan.relPath}  (${plan.reason})`);
      break;
    default:
      break;
  }
}

function main(): void {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h')) {
    usage();
    process.exit(0);
  }

  const write = argv.includes('--write');
  const force = argv.includes('--force');
  const allMissing = argv.includes('--all-missing');
  const all = argv.includes('--all');
  const fileArgs = argv.filter((a) => !a.startsWith('-'));

  const modesSelected = [allMissing, all, fileArgs.length > 0].filter(Boolean).length;
  if (modesSelected === 0) {
    console.error(`${RED}Error:${NC} no target selected. Pass file(s), --all-missing, or --all.`);
    usage();
    process.exit(1);
  }
  if (modesSelected > 1) {
    console.error(
      `${RED}Error:${NC} choose exactly one mode: explicit files, --all-missing, or --all — not a mix.`
    );
    process.exit(1);
  }
  if (all && write && !force) {
    console.error(
      `${RED}${BOLD}Refused:${NC} ${RED}--all --write requires --force.${NC}\n` +
        `  --all includes translations whose source_hash already MISMATCHES the\n` +
        `  source (real, previously-detected drift). Stamping those asserts they\n` +
        `  are current and HIDES that drift. Re-run with --force only if every\n` +
        `  targeted translation has genuinely been reviewed/updated.`
    );
    process.exit(1);
  }

  assertGitAvailable();

  let targets: string[];
  let mode: 'files' | 'all-missing' | 'all';
  if (fileArgs.length > 0) {
    mode = 'files';
    targets = fileArgs.map((f) => (resolve(f).startsWith(ROOT) ? resolve(f) : resolve(ROOT, f)));
    for (const t of targets) {
      if (!existsSync(t)) {
        console.error(`${RED}Error:${NC} file not found: ${relative(ROOT, t)}`);
        process.exit(1);
      }
    }
  } else if (allMissing) {
    mode = 'all-missing';
    targets = findAllTranslationFiles();
    console.log(
      `${YELLOW}${BOLD}Warning:${NC} ${YELLOW}--all-missing stamps every translation that has NO source_hash\n` +
        `field, asserting each one is current with its source RIGHT NOW. If any of\n` +
        `those translations are actually stale, this will hide that staleness from\n` +
        `future drift detection. Only proceed if you believe missing-hash files are\n` +
        `genuinely up to date.${NC}\n`
    );
  } else {
    mode = 'all';
    targets = findAllTranslationFiles();
    console.log(
      `${RED}${BOLD}⚠️  DANGER — --all mode ⚠️${NC}\n` +
        `${RED}This asserts EVERY managed translation (including ones with a KNOWN\n` +
        `mismatched source_hash, i.e. real content drift) is current as of right\n` +
        `now. Misuse of this mode silently hides real translation drift from\n` +
        `check-translation-sync.sh. Do not use this as a shortcut to make drift\n` +
        `warnings disappear.${NC}\n`
    );
  }

  const plans = targets.map(planFile);

  // Mode-specific eligibility: downgrade 'stamp' to 'skip-not-eligible' for
  // files this mode should not touch.
  for (const p of plans) {
    if (p.status !== 'stamp') continue;
    if (mode === 'all-missing' && p.declaredHash !== '') {
      // Has SOME hash (even if mismatched) — not "missing". Leave to --all.
      p.status = 'skip-not-eligible';
      p.reason = 'has a source_hash but it mismatches — use --all (with --force) to touch this';
    }
  }

  const summary: Summary = {
    stamped: 0,
    wouldStamp: 0,
    skippedCurrent: 0,
    skippedMissingSource: 0,
    skippedNotManaged: 0,
  };
  let skippedNotEligible = 0;

  console.log(`${BLUE}Mode:${NC} ${mode}  ${BLUE}Write:${NC} ${write ? 'YES' : 'no (dry-run)'}\n`);

  for (const plan of plans) {
    if (plan.status === 'skip-not-eligible') {
      skippedNotEligible += 1;
      continue;
    }
    if (plan.status === 'stamp') {
      if (write) {
        stampFile(plan);
        summary.stamped += 1;
      } else {
        summary.wouldStamp += 1;
      }
      printPlanLine(plan, write);
    } else if (plan.status === 'skip-current') {
      summary.skippedCurrent += 1;
    } else if (plan.status === 'skip-missing-source') {
      summary.skippedMissingSource += 1;
      printPlanLine(plan, write);
    } else if (plan.status === 'skip-not-managed') {
      summary.skippedNotManaged += 1;
    }
  }

  console.log('');
  console.log(`${BLUE}Summary:${NC}`);
  console.log(`  stamped:                     ${GREEN}${summary.stamped}${NC}`);
  console.log(`  would-change (dry-run):      ${ORANGE}${summary.wouldStamp}${NC}`);
  console.log(`  skipped (already-current):   ${BLUE}${summary.skippedCurrent}${NC}`);
  console.log(`  skipped (missing-source):    ${RED}${summary.skippedMissingSource}${NC}`);
  console.log(`  skipped (not-managed):       ${YELLOW}${summary.skippedNotManaged}${NC}`);
  if (skippedNotEligible > 0) {
    console.log(`  skipped (not-eligible-for-mode): ${YELLOW}${skippedNotEligible}${NC}`);
  }
  console.log('');

  if (!write && (summary.wouldStamp > 0 || summary.stamped > 0)) {
    console.log(`${YELLOW}Dry-run only — nothing was written. Re-run with --write to apply.${NC}\n`);
  }

  process.exit(0);
}

// realpathSync both sides before comparing: import.meta.url is resolved
// through symlinks by Node's ESM loader, but `file://${process.argv[1]}`
// is a raw string. A symlinked repo layout (e.g. dev-platform's
// universal-dev-standards -> ../universal-dev-standards) made this compare
// unequal for any absolute-path invocation built from the symlinked
// location, so main() silently never ran.
if (
  process.argv[1] &&
  tryRealpath(fileURLToPath(import.meta.url)) === tryRealpath(resolve(process.argv[1]))
) {
  main();
}
