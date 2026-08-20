#!/usr/bin/env tsx
/**
 * Skill Trigger Surface Checker — XSPEC-378 R4
 * Skill 觸發面檢查器
 *
 * ── What this asserts ──────────────────────────────────────────────────────
 * Every `SKILL.md` frontmatter `description:` must carry BOTH:
 *   • `Use when:`  — the trigger condition. Without it the skill cannot be
 *                   selected: a model choosing between 55 skills has nothing
 *                   to match the request against.
 *   • `Not for:`   — the exclusion condition. XSPEC-378 R1 states the reason
 *                   this is not optional: a trigger without an exclusion buys
 *                   over-triggering, and an over-triggering skill gets turned
 *                   off by the user — which is worse than never firing,
 *                   because it takes the still-useful ones down with it.
 *
 * Both must be present IN THE DESCRIPTION, not merely somewhere in the file.
 * The description is the only part a model sees when deciding what to invoke;
 * a `Use when:` living in the body is invisible to selection.
 *
 * ── The defect this closes ─────────────────────────────────────────────────
 * XSPEC-378 measured 28 of 55 skills with no trigger condition at all and
 * 0 of 55 with an exclusion condition — 51% of the catalogue structurally
 * unselectable. R1/R2 repaired the corpus; nothing stopped it recurring.
 * This is the thing that stops it recurring.
 *
 * ── Denominator, walked rather than typed ──────────────────────────────────
 * Roots are discovered, not listed: the repo-root `skills/`, plus every
 * `locales/<locale>/skills/` that exists on disk. Adding a locale therefore
 * widens this check automatically. Covering the locales matters — the
 * translated copies are what a zh-TW adopter's agent reads, so a gate that
 * only saw the English source would be narrower than the rule it enforces.
 *
 * Within each root every subdirectory is walked. A directory is EXCLUDED only
 * when it holds no `SKILL.md`, and every exclusion is printed with its reason
 * and counted. That exclusion restates the question as "every skill" rather
 * than "every directory under skills/" — said out loud here because an
 * unstated exclusion silently redefines what a green run means.
 *
 * The exclusion is derived from disk, never from a hardcoded name list, so a
 * newly added non-skill directory needs no edit here. The consequence is
 * stated rather than hidden: if a real skill LOSES its SKILL.md it drops out
 * of this denominator instead of failing. That case is owned by
 * `check-skill-structural-integrity.ts` (AC-223-01/03), which fails on a
 * missing SKILL.md. This checker prints every excluded directory by name on
 * every run so the drop-out is visible rather than inferred from a count.
 *
 * ── The self-adoption copies: reported and ratcheted here, gated elsewhere ──
 * `.claude/skills/` and `.gemini/skills/` are the copies that an agent working
 * inside THIS repo loads. On 2026-08-20 this header said all 88 of them had
 * zero trigger surface and that they "cannot be fixed from here", because the
 * only writer was the CLI installer and DEC-044 refuses it in this repo.
 *
 * **That reasoning was overturned the same day, and this paragraph is the
 * correction.** The premise held only while nobody wrote a second writer.
 * `scripts/generate-adoption-skills.mjs` is that writer: it derives the copies
 * from `skills/` and `locales/<locale>/skills/`, reads nothing from
 * `cli/bundled/` and writes nothing under any source directory, so it is not in
 * DEC-044's path at all — DEC-044 is about a bundle overwriting source, the
 * opposite direction. It is precisely option (1) that the baseline file's own
 * `howToShrink` asked for.
 *
 * Current state, measured 2026-08-20 after that generator ran:
 *   `.claude/skills/`  55 skills, 55 with a trigger surface — generated, and
 *                      gated by `npm run check:adoption-skills`, not here.
 *   `.gemini/skills/`  40 skills, 0 with a trigger surface — and that is the
 *                      intended outcome, not a backlog item. Gemini CLI was
 *                      discontinued 2026-06-18; `.gemini/DEPRECATED.md` freezes
 *                      the tree and says the drift "is expected — do not 'fix'
 *                      it". The generator excludes it by reading `deprecated`
 *                      from `integrations/REGISTRY.json`, never by name.
 *
 * So `scripts/self-adoption-skills-baseline.json` is no longer a deferral
 * ledger; it is a two-entry ratchet whose entries are in different states, each
 * carrying its own reason. The 0 for `.claude/skills/` is a FLOOR — a copy that
 * loses its trigger surface turns this blocking immediately, without waiting for
 * an expiry. The remaining clock belongs to `.gemini/` alone, and it exists
 * because the argument for freezing rather than deleting rests on a claim that
 * decays with time. An exception with no clock is only a polite delete key.
 *
 * The roots are discovered by walking top-level dot-directories for a
 * `skills/` holding at least one SKILL.md, so a future `.cursor/skills/`
 * is covered with no edit here — and, having no baseline entry, would turn
 * the ratchet blocking rather than passing unnoticed.
 *
 * ── Proving it is not vacuous ──────────────────────────────────────────────
 * `--self-test` copies the real corpus, confirms it assesses clean, then
 * breaks one description at a time and requires a finding that NAMES the file
 * and the missing element. A checker that has never gone red is
 * indistinguishable from one that cannot.
 *
 * ── Flags ──────────────────────────────────────────────────────────────────
 *   tsx scripts/check-skill-trigger-surface.ts               # run + report
 *   tsx scripts/check-skill-trigger-surface.ts --verbose     # per-file detail
 *   tsx scripts/check-skill-trigger-surface.ts --json        # machine-readable
 *   tsx scripts/check-skill-trigger-surface.ts --self-test   # prove it goes red
 *   tsx scripts/check-skill-trigger-surface.ts --root <dir>  # check one root only
 *
 * An UNKNOWN flag is a hard error (exit 2), never a silent no-op. `uds <cmd>
 * --help` printing generic help for a command that does not exist is how two
 * nonexistent commands were once judged to exist; a flag that is ignored
 * rather than rejected is the same failure with a smaller blast radius.
 *
 * ── Exit codes (three states — "could not measure" is NOT a pass) ───────────
 *   0 — every skill in every root carries both elements
 *   1 — at least one skill is missing one; findings name file and element
 *   2 — could not measure: no roots found, a root is unreadable, unknown flag.
 *       NOT "no findings".
 *
 * ── Measured arms, 2026-08-20 (UDS at 4a77ac8a) ────────────────────────────
 *   green      — 3 roots discovered (skills/, locales/zh-CN/skills/,
 *                locales/zh-TW/skills/); 181 directories walked → 165 skills
 *                checked, 16 excluded for holding no SKILL.md
 *                (6 + 5 + 5: _shared, agents, commands, tools, workflows in
 *                every root, plus ai/ in the English root only);
 *                0 findings                                          → exit 0
 *   red        — `Not for:` deleted from skills/push in a copy of the corpus:
 *                1 finding naming `push/SKILL.md` and element `not-for`,
 *                55 skills still checked                             → exit 1
 *   unmeasured — --root pointed at a nonexistent directory           → exit 2
 *   unknown flag — `--bogus-flag`                                    → exit 2
 *   --self-test — 7/7 arms fired (1 green, 4 red, 1 unmeasurable,
 *                1 flag rejection)                                   → exit 0
 *
 * Calibration, because "55/55 pass" is also what a probe that matches
 * anything prints: run against `b12e3633^` the same extraction yields 27/55
 * for `Use when:` and 0/55 for `Not for:` — bit-for-bit the diseased numbers
 * recorded in XSPEC-378. A probe that reproduces the original defect is not
 * a probe that is too wide.
 *
 * ── Known limit, stated ────────────────────────────────────────────────────
 * Frontmatter is parsed by hand (leading `---` block, `description:` scalar)
 * rather than with a YAML library, because the repo root has no YAML
 * dependency. It handles the block (`|`, `>`) and single-line forms in use.
 * A description written in a form outside those yields an empty extraction,
 * which fails loudly as "no description" rather than passing quietly.
 */

import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[0;34m';
const CYAN = '\x1b[0;36m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const NC = '\x1b[0m';

// ───────────────────────────────────────────────────────────────────────────
// Argument parsing — unknown flags are rejected, not ignored
// ───────────────────────────────────────────────────────────────────────────

const KNOWN_FLAGS = new Set(['--verbose', '--json', '--self-test', '--root', '--help']);

interface Options {
  verbose: boolean;
  json: boolean;
  selfTest: boolean;
  roots: string[] | null;
}

/** Throws on an unknown flag so it can never be silently discarded. */
function parseArgs(argv: string[]): Options {
  const opts: Options = { verbose: false, json: false, selfTest: false, roots: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('-')) {
      throw new Unmeasurable(
        `unexpected positional argument \`${a}\` — use \`--root <dir>\` to point at a directory`
      );
    }
    if (!KNOWN_FLAGS.has(a)) {
      throw new Unmeasurable(
        `unknown flag \`${a}\`.\nKnown flags: ${[...KNOWN_FLAGS].join(', ')}\n` +
          `Rejected rather than ignored: a flag that is quietly dropped makes a run that ` +
          `measured nothing look exactly like a run that measured everything.`
      );
    }
    if (a === '--verbose') opts.verbose = true;
    else if (a === '--json') opts.json = true;
    else if (a === '--self-test') opts.selfTest = true;
    else if (a === '--help') {
      console.log(
        `Usage: tsx scripts/check-skill-trigger-surface.ts [--verbose] [--json] [--self-test] [--root <dir>]`
      );
      process.exit(0);
    } else if (a === '--root') {
      const v = argv[++i];
      if (!v) throw new Unmeasurable('`--root` requires a directory argument');
      opts.roots = [...(opts.roots ?? []), v];
    }
  }
  return opts;
}

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

/** Something that stopped the measurement from happening at all. */
class Unmeasurable extends Error {}

type Element = 'description' | 'use-when' | 'not-for';

interface Finding {
  file: string;
  skill: string;
  element: Element;
  detail: string;
}

interface SkillReport {
  skill: string;
  file: string;
  descriptionChars: number;
  useWhenChars: number;
  notForChars: number;
}

interface Excluded {
  dir: string;
  reason: string;
}

interface RootReport {
  root: string;
  dirsWalked: number;
  excluded: Excluded[];
  skills: SkillReport[];
  findings: Finding[];
}

// ───────────────────────────────────────────────────────────────────────────
// Extraction
// ───────────────────────────────────────────────────────────────────────────

/**
 * Pull the frontmatter `description:` value out of a SKILL.md.
 * Returns '' when there is no frontmatter or no description — which the caller
 * turns into a loud finding rather than a quiet pass.
 */
export function extractDescription(content: string): string {
  const lines = content.split('\n');
  if (lines[0]?.trim() !== '---') return '';

  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      end = i;
      break;
    }
  }
  if (end === -1) return '';

  const fm = lines.slice(1, end);
  for (let i = 0; i < fm.length; i++) {
    const m = fm[i].match(/^description:\s*(.*)$/);
    if (!m) continue;

    const inline = m[1].trim();
    // Single-line form: `description: some text`
    if (inline && inline !== '|' && inline !== '>' && inline !== '|-' && inline !== '>-') {
      return inline;
    }
    // Block scalar: take following lines that are indented (or blank).
    const out: string[] = [];
    for (let j = i + 1; j < fm.length; j++) {
      const line = fm[j];
      if (line.trim() === '') {
        out.push('');
        continue;
      }
      if (/^\s/.test(line)) out.push(line.trim());
      else break; // next top-level key
    }
    return out.join('\n').trim();
  }
  return '';
}

/**
 * Content following a label, e.g. `Use when:` → everything to end of line.
 * Case-insensitive on the label; the corpus writes it one way, but a checker
 * that fails on capitalisation would be reporting a style opinion as a defect.
 */
export function contentAfterLabel(description: string, label: string): string | null {
  // Scanned line by line rather than with a built regex: the labels contain a
  // `:` and a space, and hand-escaping a caller-supplied string into a pattern
  // is a way to be wrong quietly.
  const needle = label.toLowerCase();
  for (const line of description.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith(needle)) {
      return trimmed.slice(label.length).trim();
    }
  }
  return null;
}

/**
 * Minimum characters after a label for it to count as saying something.
 * 12 is well below every real entry in the corpus (the shortest runs to
 * dozens of characters) and well above `Use when: n/a`, which is the shape
 * this threshold exists to reject.
 */
const MIN_CONTENT_CHARS = 12;

// ───────────────────────────────────────────────────────────────────────────
// Assessment
// ───────────────────────────────────────────────────────────────────────────

function isDir(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Self-adoption copies — reported and ratcheted, not gated. See the header.
// ───────────────────────────────────────────────────────────────────────────

interface SelfAdoptionBaseline {
  recorded: string;
  expires: string;
  why: string;
  howToShrink: string;
  roots: Record<string, { skills: number; withTriggerSurface: number; withoutTriggerSurface: number }>;
}

const BASELINE_PATH = join(ROOT_DIR, 'scripts', 'self-adoption-skills-baseline.json');

/**
 * Discover the AI-tool adoption copies by walking, not by naming them: any
 * top-level dot-directory holding a `skills/` with at least one SKILL.md.
 * A future `.cursor/skills/` is therefore covered with no edit here.
 */
function discoverSelfAdoptionRoots(base: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(base).sort()) {
    if (!entry.startsWith('.')) continue;
    const candidate = join(base, entry, 'skills');
    if (!isDir(candidate)) continue;
    const hasSkill = readdirSync(candidate).some((d) => existsSync(join(candidate, d, 'SKILL.md')));
    if (hasSkill) out.push(candidate);
  }
  return out;
}

interface SelfAdoptionResult {
  root: string;
  skills: number;
  withoutTriggerSurface: number;
  baseline: number | null;
  worsened: boolean;
}

/** Discover roots on disk: repo `skills/` plus every locale's own `skills/`. */
function discoverRoots(base: string): string[] {
  const roots: string[] = [];
  const top = join(base, 'skills');
  if (isDir(top)) roots.push(top);

  const locales = join(base, 'locales');
  if (isDir(locales)) {
    for (const entry of readdirSync(locales).sort()) {
      const candidate = join(locales, entry, 'skills');
      if (isDir(candidate)) roots.push(candidate);
    }
  }
  return roots;
}

function assessRoot(root: string): RootReport {
  if (!isDir(root)) {
    throw new Unmeasurable(`root is not a readable directory: ${root}`);
  }

  let entries: string[];
  try {
    entries = readdirSync(root).sort();
  } catch (e) {
    throw new Unmeasurable(`cannot read ${root}: ${(e as Error).message}`);
  }

  const excluded: Excluded[] = [];
  const skills: SkillReport[] = [];
  const findings: Finding[] = [];
  let dirsWalked = 0;

  for (const entry of entries) {
    const dir = join(root, entry);
    if (!isDir(dir)) continue;
    dirsWalked++;

    const skillMd = join(dir, 'SKILL.md');
    if (!existsSync(skillMd)) {
      excluded.push({
        dir: entry,
        reason: 'holds no SKILL.md — not a skill (see check-skill-structural-integrity.ts, which owns missing-SKILL.md)',
      });
      continue;
    }

    const rel = relative(ROOT_DIR, skillMd) || skillMd;
    let content: string;
    try {
      content = readFileSync(skillMd, 'utf8');
    } catch (e) {
      throw new Unmeasurable(`cannot read ${rel}: ${(e as Error).message}`);
    }

    const description = extractDescription(content);
    if (description.length === 0) {
      findings.push({
        file: rel,
        skill: entry,
        element: 'description',
        detail:
          'no frontmatter `description:` could be extracted — a skill with no description ' +
          'cannot be selected at all',
      });
      skills.push({ skill: entry, file: rel, descriptionChars: 0, useWhenChars: 0, notForChars: 0 });
      continue;
    }

    const useWhen = contentAfterLabel(description, 'Use when:');
    const notFor = contentAfterLabel(description, 'Not for:');

    if (useWhen === null || useWhen.length < MIN_CONTENT_CHARS) {
      findings.push({
        file: rel,
        skill: entry,
        element: 'use-when',
        detail:
          useWhen === null
            ? 'description has no `Use when:` — nothing states when this skill applies, so it cannot be selected'
            : `\`Use when:\` carries only ${useWhen.length} char(s) (${MIN_CONTENT_CHARS} required): "${useWhen}"`,
      });
    }

    if (notFor === null || notFor.length < MIN_CONTENT_CHARS) {
      findings.push({
        file: rel,
        skill: entry,
        element: 'not-for',
        detail:
          notFor === null
            ? 'description has no `Not for:` — a trigger with no exclusion over-triggers, and an over-triggering skill gets disabled by the user (XSPEC-378 R1)'
            : `\`Not for:\` carries only ${notFor.length} char(s) (${MIN_CONTENT_CHARS} required): "${notFor}"`,
      });
    }

    skills.push({
      skill: entry,
      file: rel,
      descriptionChars: description.length,
      useWhenChars: useWhen?.length ?? 0,
      notForChars: notFor?.length ?? 0,
    });
  }

  if (dirsWalked === 0) {
    throw new Unmeasurable(`${root} contains no subdirectories — nothing was walked`);
  }
  if (skills.length === 0) {
    throw new Unmeasurable(
      `${root} contains ${dirsWalked} director(ies) but not one SKILL.md — ` +
        `this is "could not measure", not "everything passed"`
    );
  }

  return { root, dirsWalked, excluded, skills, findings };
}

function loadBaseline(): SelfAdoptionBaseline | null {
  if (!existsSync(BASELINE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as SelfAdoptionBaseline;
  } catch {
    return null;
  }
}

/**
 * Measure the self-adoption copies. Never contributes to the blocking
 * findings; it returns its own numbers and a ratchet verdict.
 */
function assessSelfAdoption(base: string, baseline: SelfAdoptionBaseline | null): SelfAdoptionResult[] {
  const out: SelfAdoptionResult[] = [];
  for (const root of discoverSelfAdoptionRoots(base)) {
    const rel = relative(base, root) || root;
    let report: RootReport;
    try {
      report = assessRoot(root);
    } catch {
      continue; // an unreadable adoption copy is not a reason to fail the real gate
    }
    const bad = new Set(report.findings.map((f) => f.skill)).size;
    const recorded = baseline?.roots?.[rel]?.withoutTriggerSurface ?? null;
    out.push({
      root: rel,
      skills: report.skills.length,
      withoutTriggerSurface: bad,
      baseline: recorded,
      worsened: recorded !== null && bad > recorded,
    });
  }
  return out;
}

// ───────────────────────────────────────────────────────────────────────────
// Self-test — break the real corpus and require the checker to notice
// ───────────────────────────────────────────────────────────────────────────

function selfTest(): number {
  console.log(`${BLUE}${BOLD}Self-test — does this checker actually go red?${NC}`);
  console.log(`${DIM}Each arm copies the real corpus, breaks one description, and requires${NC}`);
  console.log(`${DIM}a finding that names the file and the missing element.${NC}\n`);

  let failures = 0;
  const report = (ok: boolean, name: string, got: string) => {
    console.log(
      `  ${ok ? `${GREEN}[FIRED]${NC}` : `${RED}[DID NOT FIRE]${NC}`} ${name}\n          ${DIM}${got}${NC}`
    );
    if (!ok) failures++;
  };

  let tmp: string | null = null;
  try {
    tmp = mkdtempSync(join(tmpdir(), 'uds-trigger-surface-'));
    const src = join(ROOT_DIR, 'skills');
    if (!isDir(src)) throw new Unmeasurable(`no skills/ to copy from at ${src}`);
    const work = join(tmp, 'skills');
    cpSync(src, work, { recursive: true });

    // Arm 0 — the green arm. Without it the red arms prove nothing: a checker
    // that finds a problem in every input is as useless as one that never does.
    const clean = assessRoot(work);
    report(
      clean.findings.length === 0,
      'unmodified corpus assesses clean',
      `${clean.skills.length} skills, ${clean.excluded.length} excluded, ${clean.findings.length} findings`
    );

    // Pick victims from disk rather than naming skills here, so renaming a
    // skill cannot quietly turn an arm into a no-op.
    const victims = clean.skills.map((s) => s.skill).sort();
    const v1 = victims[0];
    const v2 = victims[1];
    const v3 = victims[2];
    if (!v1 || !v2 || !v3) throw new Unmeasurable('fewer than 3 skills available to mutate');

    // Arm 1 — `Not for:` deleted. The element that was 0/55 before XSPEC-378.
    const f1 = join(work, v1, 'SKILL.md');
    writeFileSync(f1, readFileSync(f1, 'utf8').replace(/^\s*Not for:.*$/im, ''));
    const m1 = assessRoot(work);
    report(
      m1.findings.some((f) => f.skill === v1 && f.element === 'not-for'),
      `\`Not for:\` stripped from ${v1}`,
      m1.findings.map((f) => `${f.skill}/${f.element}`).join(', ') || 'no findings at all'
    );

    // Arm 2 — `Use when:` deleted. The element that was 28/55 missing.
    const f2 = join(work, v2, 'SKILL.md');
    writeFileSync(f2, readFileSync(f2, 'utf8').replace(/^\s*Use when:.*$/im, ''));
    const m2 = assessRoot(work);
    report(
      m2.findings.some((f) => f.skill === v2 && f.element === 'use-when'),
      `\`Use when:\` stripped from ${v2}`,
      m2.findings.map((f) => `${f.skill}/${f.element}`).join(', ') || 'no findings at all'
    );

    // Arm 3 — label kept, content emptied. Distinguishes "present" from
    // "says something"; a gate that only greps the label rewards `Use when: -`.
    const f3 = join(work, v3, 'SKILL.md');
    writeFileSync(f3, readFileSync(f3, 'utf8').replace(/^(\s*)Use when:.*$/im, '$1Use when: n/a'));
    const m3 = assessRoot(work);
    report(
      m3.findings.some((f) => f.skill === v3 && f.element === 'use-when'),
      `\`Use when:\` present but empty in ${v3}`,
      m3.findings.filter((f) => f.skill === v3).map((f) => f.element).join(', ') || 'no finding for that skill'
    );

    // Arm 4 — findings name the file, not just a count. An operator who cannot
    // tell WHICH skill failed has a percentage, not a gate.
    const named = m1.findings.every((f) => f.file.length > 0 && f.skill.length > 0);
    report(named, 'every finding names its file and skill', `${m1.findings.length} finding(s), all named: ${named}`);

    // Arm 5 — the third state. An unmeasurable run must not look like a pass.
    let unmeasurable = false;
    try {
      assessRoot(join(tmp, 'does-not-exist'));
    } catch (e) {
      unmeasurable = e instanceof Unmeasurable;
    }
    report(unmeasurable, 'nonexistent root → raises Unmeasurable (exit 2, not exit 0)', `${unmeasurable}`);

    // Arm 6 — an unknown flag is rejected rather than ignored.
    let rejected = false;
    try {
      parseArgs(['--not-a-real-flag']);
    } catch (e) {
      rejected = e instanceof Unmeasurable;
    }
    report(rejected, 'unknown flag → rejected (exit 2), not silently ignored', `${rejected}`);
  } catch (e) {
    console.log(`\n${RED}Self-test could not run: ${(e as Error).message}${NC}`);
    return 2;
  } finally {
    if (tmp) rmSync(tmp, { recursive: true, force: true });
  }

  console.log('');
  if (failures > 0) {
    console.log(`${RED}${BOLD}✗ ${failures} arm(s) did not behave as required.${NC}`);
    console.log(`${RED}  Until they do, a clean run of this checker means nothing.${NC}\n`);
    return 1;
  }
  console.log(`${GREEN}${BOLD}✓ All 7 arms behaved as required — 1 green, 4 reds, 1 unmeasurable, 1 flag rejection.${NC}\n`);
  return 0;
}

// ───────────────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────────────

function main(): number {
  let opts: Options;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    if (e instanceof Unmeasurable) {
      console.error(`\n${RED}${BOLD}✗ Could not measure.${NC}`);
      console.error(`${RED}${e.message}${NC}\n`);
      return 2;
    }
    throw e;
  }

  if (opts.selfTest) return selfTest();

  let reports: RootReport[];
  try {
    const roots = opts.roots ?? discoverRoots(ROOT_DIR);
    if (roots.length === 0) {
      throw new Unmeasurable(
        `no skills root found under ${ROOT_DIR} (looked for skills/ and locales/*/skills/)`
      );
    }
    reports = roots.map(assessRoot);
  } catch (e) {
    if (e instanceof Unmeasurable) {
      if (opts.json) {
        console.log(JSON.stringify({ status: 'unmeasurable', reason: e.message }, null, 2));
      } else {
        console.error(`\n${RED}${BOLD}✗ Could not measure.${NC}`);
        console.error(`${RED}${e.message}${NC}`);
        console.error(
          `${YELLOW}This is exit 2, not exit 0. Nothing was checked; do not read this as a pass.${NC}\n`
        );
      }
      return 2;
    }
    throw e;
  }

  const allFindings = reports.flatMap((r) => r.findings);
  const totalSkills = reports.reduce((a, r) => a + r.skills.length, 0);
  const totalExcluded = reports.reduce((a, r) => a + r.excluded.length, 0);
  const totalDirs = reports.reduce((a, r) => a + r.dirsWalked, 0);
  const baseline = loadBaseline();

  if (opts.json) {
    const sa = assessSelfAdoption(ROOT_DIR, baseline);
    const saExpired = Boolean(baseline && baseline.expires < new Date().toISOString().slice(0, 10));
    const saFails = !baseline || saExpired || sa.some((r) => r.worsened || r.baseline === null);
    console.log(
      JSON.stringify(
        {
          status: allFindings.length === 0 && !saFails ? 'pass' : 'fail',
          totals: { dirsWalked: totalDirs, skills: totalSkills, excluded: totalExcluded },
          selfAdoption: {
            roots: sa,
            baselineExpires: baseline?.expires ?? null,
            expired: saExpired,
            blocking: saFails,
            note: 'not gated while within the deferral window — DEC-044 blocks the only fix',
          },
          roots: reports.map((r) => ({
            root: relative(ROOT_DIR, r.root) || r.root,
            dirsWalked: r.dirsWalked,
            skills: r.skills.length,
            excluded: r.excluded,
            findings: r.findings,
            detail: opts.verbose ? r.skills : undefined,
          })),
        },
        null,
        2
      )
    );
    return allFindings.length === 0 && !saFails ? 0 : 1;
  }

  console.log('');
  console.log('==========================================');
  console.log('  Skill Trigger Surface Checker');
  console.log('  Skill 觸發面檢查器');
  console.log('==========================================');
  console.log('');
  console.log(`${DIM}Every SKILL.md description must carry \`Use when:\` and \`Not for:\`.${NC}`);
  console.log(`${DIM}Roots are discovered on disk, not listed here (XSPEC-378 R4).${NC}`);
  console.log('');

  for (const r of reports) {
    const rel = relative(ROOT_DIR, r.root) || r.root;
    console.log(
      `${CYAN}${BOLD}${rel}${NC} — ${r.dirsWalked} director(ies) walked, ` +
        `${r.skills.length} skill(s) checked, ${r.excluded.length} excluded`
    );
    for (const x of r.excluded) {
      console.log(`    ${DIM}excluded: ${x.dir} — ${x.reason}${NC}`);
    }
    if (opts.verbose) {
      for (const s of r.skills) {
        console.log(
          `    ${DIM}${s.skill.padEnd(30)} desc=${String(s.descriptionChars).padStart(4)}c  ` +
            `use-when=${String(s.useWhenChars).padStart(3)}c  not-for=${String(s.notForChars).padStart(3)}c${NC}`
        );
      }
    }
    if (r.findings.length === 0) {
      console.log(`  ${GREEN}✓ all ${r.skills.length} skill(s) carry both elements${NC}`);
    } else {
      for (const f of r.findings) {
        console.log(`  ${RED}[FAIL]${NC} ${BOLD}${f.file}${NC} — missing ${f.element}`);
        console.log(`         ${DIM}${f.detail}${NC}`);
      }
    }
    console.log('');
  }

  console.log('------------------------------------------');
  console.log(
    `${BOLD}Denominator:${NC} ${totalDirs} director(ies) walked across ${reports.length} root(s) → ` +
      `${totalSkills} skill(s) checked, ${totalExcluded} excluded for holding no SKILL.md.`
  );
  console.log(
    `${DIM}Exclusion restates the question as "every skill", not "every directory under skills/".${NC}`
  );
  console.log('------------------------------------------');
  console.log('');

  // ── Self-adoption copies: printed every run, blocking only on the ratchet ──
  const selfAdoption = assessSelfAdoption(ROOT_DIR, baseline);
  let selfAdoptionFails = false;
  if (selfAdoption.length > 0) {
    const totalBad = selfAdoption.reduce((a, r) => a + r.withoutTriggerSurface, 0);
    const totalCopies = selfAdoption.reduce((a, r) => a + r.skills, 0);
    console.log('------------------------------------------');
    console.log(`${BOLD}Self-adoption copies — not gated, and here is why${NC}`);
    console.log('------------------------------------------');
    for (const r of selfAdoption) {
      const state =
        r.baseline === null
          ? `${YELLOW}no baseline entry${NC}`
          : r.worsened
            ? `${RED}worse than baseline ${r.baseline}${NC}`
            : `${DIM}baseline ${r.baseline}${NC}`;
      console.log(
        `  ${r.root.padEnd(22)} ${r.skills} skill(s), ` +
          `${r.withoutTriggerSurface} without a trigger surface  ${state}`
      );
      if (r.worsened || r.baseline === null) selfAdoptionFails = true;
    }
    console.log(
      `  ${YELLOW}${totalBad}/${totalCopies} of the copies an agent working INSIDE this repo loads ` +
        `have no trigger surface.${NC}`
    );
    if (baseline) {
      const today = new Date().toISOString().slice(0, 10);
      const expired = baseline.expires < today;
      console.log(
        `  ${DIM}Recorded ${baseline.recorded}, expires ${baseline.expires}.${NC}` +
          (expired ? ` ${RED}⏰ EXPIRED${NC}` : '')
      );
      console.log(
        `  ${DIM}Each root carries its own reason in scripts/self-adoption-skills-baseline.json:${NC}\n` +
          `  ${DIM}a "generated-and-gated" root is derived by scripts/generate-adoption-skills.mjs${NC}\n` +
          `  ${DIM}and gated by \`npm run check:adoption-skills\`, so its number here is a floor.${NC}\n` +
          `  ${DIM}A "frozen-by-decision" root is deliberately not regenerated — see its${NC}\n` +
          `  ${DIM}\`decision\` field. Only the frozen one still has a clock.${NC}`
      );
      if (expired) {
        console.log(
          `  ${RED}The deferral has expired. This is now a blocking failure so the decision${NC}\n` +
            `  ${RED}gets made rather than deferred again — see howToShrink in the baseline.${NC}`
        );
        selfAdoptionFails = true;
      }
    } else {
      console.log(`  ${RED}No baseline file — cannot tell whether this got worse.${NC}`);
      selfAdoptionFails = true;
    }
    console.log('');
  }

  console.log('==========================================');
  if (allFindings.length > 0) {
    const byElement = new Map<Element, number>();
    for (const f of allFindings) byElement.set(f.element, (byElement.get(f.element) ?? 0) + 1);
    console.log(`${RED}${BOLD}✗ ${allFindings.length} finding(s) across ${totalSkills} skill(s)${NC}`);
    console.log(
      `${RED}  ${[...byElement].map(([e, n]) => `${e}: ${n}`).join(', ')}${NC}`
    );
    console.log('');
    return 1;
  }
  if (selfAdoptionFails) {
    console.log(
      `${RED}${BOLD}✗ The shipped corpus is clean, but the self-adoption ratchet failed.${NC}`
    );
    console.log(
      `${RED}  Either the deferral expired or a copy got worse. See the section above.${NC}`
    );
    console.log('');
    return 1;
  }
  console.log(`${GREEN}${BOLD}✓ ${totalSkills} skill(s) across ${reports.length} root(s) carry both a trigger and an exclusion${NC}`);
  console.log(
    `${DIM}  Verify this is not vacuous: tsx scripts/check-skill-trigger-surface.ts --self-test${NC}`
  );
  console.log('');
  return 0;
}

try {
  process.exit(main());
} catch (e) {
  console.error(`${RED}Internal error: ${(e as Error).stack ?? e}${NC}`);
  process.exit(2);
}
