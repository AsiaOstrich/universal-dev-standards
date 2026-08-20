#!/usr/bin/env node
/**
 * Self-Adoption Skill Copy Generator and Drift Gate — XSPEC-385
 * 自採用 Skill 副本產生器與漂移閘門
 *
 * ── What this generates, and why it is generated ───────────────────────────
 * `.claude/skills/` is UDS dogfooding its own output: the skill set that
 * `uds init --agent claude-code --locale zh-tw --skills` produces, committed so
 * that an agent working INSIDE this repo loads the same skills an adopter gets.
 *
 * It was installed once, on an old CLI, and then nothing kept it honest.
 * Measured 2026-08-20, before this script existed:
 *
 *   source   skills/                55 skills, 55 with `Use when:`, 55 `Not for:`
 *   copy     .claude/skills/        48 skills,  0 with `Use when:`,  0 `Not for:`
 *
 * — 11 skills missing outright (push, plan, orchestrate, knowledge-graph,
 *   ac-coverage, deploy-assistant, dev-methodology, journey-test-assistant,
 *   skill-builder, spec-derivation, sweep), 4 directories left at names that
 *   commit `a1664ee0` (2026-04-29, XSPEC-100) renamed five months ago, and not
 *   one of the 48 carrying a trigger surface. The copies an agent in this repo
 *   actually loads were the worst copy in the repo.
 *
 * A hand-repair would have been right on the day it landed and quietly wrong
 * afterwards, with nothing going red in between — the rule XSPEC-385 exists to
 * state. So the content is derived from the sources that already have to be
 * correct, and `--check` is the clock: it re-derives and fails if the committed
 * copy differs by so much as a byte.
 *
 * ── Sources of truth ───────────────────────────────────────────────────────
 *   skills/<id>/                      the skill set, and the agent-facing
 *                                     frontmatter fields (name, allowed-tools,
 *                                     scope, argument-hint, …)
 *   locales/<locale>/skills/<id>/     the translated body for a localized copy
 *   integrations/REGISTRY.json        which agents exist, and which are dead
 *   cli/src/config/ai-agent-paths.js  each agent's project skills directory
 *   cli/package.json                  the version written into .manifest.json
 *   <target>/.manifest.json           the one thing not derivable: which locale
 *                                     THIS repo adopted (`locale: zh-TW`)
 *
 * ── The transformation is imported, not re-implemented ─────────────────────
 * Installing a skill is NOT a verbatim copy. `cli/src/utils/skills-installer.js`
 * documents the three things in between (frontmatter merge from the English
 * source, per-file locale fallback, subdirectories skipped) and warns, in that
 * file's own words, that a second copy of the logic "answers differently the
 * first time one changes". So `parseFrontmatter` and `rebuildWithFrontmatter`
 * are imported from it rather than rewritten here, and the REQUIRED_FIELDS list
 * below is the same list `mergeFrontmatterContent` uses.
 *
 * What is deliberately NOT imported is that module's *input side*.
 * `getSkillsSourceDir()` prefers `cli/bundled/`, which in this repo is a
 * prepack artifact, untracked (`git ls-files cli/bundled/` → 0) and regenerated
 * wholesale. Deriving committed repo content from an untracked build artifact
 * is the direction DEC-044 is about. This script reads `skills/` and
 * `locales/` — tracked, authoritative — and never touches `cli/bundled/`.
 * (Measured 2026-08-20 for the record: bundled currently differs from source in
 * 2 files under skills/ and 8 under locales/zh-TW/skills/, so the two are close
 * but not the same, and "close" is not a property a generator may rely on.)
 *
 * ── DEC-044: read, and this is why it does not reach here ──────────────────
 * DEC-044 (2026-04-18, Critical) is about `uds update` run in the UDS source
 * repo overwriting source `.standards/` **from the npm bundle** — a generated
 * artifact clobbering the source of truth, net −516 lines. The guard refuses
 * `uds init` / `update` / `check` in this repo.
 *
 * This script runs the opposite way. It reads source and writes a derived copy;
 * it writes nothing under `skills/`, `locales/`, `core/`, `.standards/` or
 * `cli/bundled/`, and reads nothing from `cli/bundled/`. Nothing it can do
 * damages a source of truth: worst case the derived copy is wrong, and `--check`
 * is precisely the thing that says so. It is a new writer for those directories,
 * which is what `scripts/self-adoption-skills-baseline.json` asked for by name
 * ("為 source repo 補一條受支援的重新產生路徑（不是叫人跑 --force）").
 *
 * ── `.gemini/skills/` is excluded, and the exclusion is read from disk ──────
 * `.gemini/DEPRECATED.md` freezes that tree: Gemini CLI was discontinued
 * 2026-06-18, and the file says in terms "Not updated when `skills/` changes …
 * that drift is expected — do not 'fix' it" and "Do not edit the files in this
 * directory." Regenerating it would be exactly the edit that document forbids.
 *
 * So it is excluded — but by reading `deprecated: true` out of
 * `integrations/REGISTRY.json`, which is the same flag `check-ai-agent-sync.sh`
 * already keys off, never by naming `.gemini` here. A future dead integration
 * drops out with no edit to this file, and a revived one comes back in.
 *
 * Saying that exclusion out loud, because an exclusion restates the question:
 * this script answers "is every LIVE self-adoption copy derived from source?",
 * not "is every directory under a dot-directory derived from source?". The
 * frozen tree keeps its own clock in
 * `scripts/self-adoption-skills-baseline.json`.
 *
 * ── What may be deleted, decided by provenance rather than by a list ────────
 * A directory under a target is removed only when it carries a `SKILL.md` with
 * a frontmatter `source:` pointer — UDS's own installer stamp — and its name is
 * not in the current source set. That is what takes out the four pre-rename
 * leftovers, whose own frontmatter convicts them: `ac-coverage-assistant`
 * points at `skills/ac-coverage/SKILL.md`, `forward-derivation` at
 * `skills/spec-derivation/SKILL.md`, `methodology-system` at
 * `skills/dev-methodology/SKILL.md` — the file moved, the directory did not —
 * and `process-automation` at `skills/process-automation/SKILL.md`, a path that
 * no longer exists at all.
 *
 * Everything else is left alone and printed: directories with no `SKILL.md`
 * (`_shared/`, `agents/`, `workflows/` — written by other installers) and any
 * `SKILL.md` with no `source:` stamp (which would be hand-written, not ours).
 * Nothing is deleted because it is unrecognised; things are deleted because
 * they are recognisably ours and recognisably gone.
 *
 * ── Two things reported rather than silently repaired ──────────────────────
 *  1. **The `source:` relative path is one level too deep.** It is written for
 *     `locales/<locale>/skills/<id>/` (four levels to the repo root) and copied
 *     verbatim to `<target>/skills/<id>/` (three). Left verbatim on purpose:
 *     the job here is to reproduce what installing produces, and quietly
 *     "improving" it would create a second definition of installed content —
 *     the defect `resolveSkillFiles`'s docblock exists to warn about. It is
 *     harmless in an adopter repo (the pointer is UDS-tree metadata) and
 *     unchecked here (`check-docs-integrity.sh:268,300` excludes any path under
 *     a `.claude` directory). Counted and printed on every run, not assumed.
 *  2. **Per-skill locale fallback.** A skill with no localized directory falls
 *     back to English, exactly as the CLI does. Currently 0 of 55 fall back;
 *     the number is printed so a shrinking locale pack is visible.
 *
 * ── No date stamp, on purpose ──────────────────────────────────────────────
 * The generated `.manifest.json` carries `version`, `agent`, `level`, `locale`
 * and `source` — but NOT the CLI's `installedDate: new Date()`. A field that
 * changes on every run would make this gate fire on every commit and never once
 * on real content, which is what `scripts/generated-doc-stamp.ts` records
 * happening to `check-skill-index.ts`. Every reader of that field in the CLI
 * does `manifest.installedDate || null`, so its absence is a supported state.
 *
 * ── Flags ──────────────────────────────────────────────────────────────────
 *   node scripts/generate-adoption-skills.mjs                 # write the copies
 *   node scripts/generate-adoption-skills.mjs --check         # fail on drift
 *   node scripts/generate-adoption-skills.mjs --self-test     # prove it goes red
 *   node scripts/generate-adoption-skills.mjs --verbose       # per-skill detail
 *   node scripts/generate-adoption-skills.mjs --repo-root <d> # operate on <d>
 *
 * An unknown flag is a hard error (exit 2), never a silent no-op.
 *
 * ── Exit codes (three states — "could not measure" is NOT a pass) ───────────
 *   0 — written, or --check found every target byte-identical
 *   1 — --check found drift: a file differs, is missing, or should be pruned
 *   2 — could not derive: skills/ or a locale pack is missing, a target has no
 *       .manifest.json locale, no live target was found, or an unknown flag
 *
 * ── Measured arms, 2026-08-20, every one at the process level ──────────────
 *   pre-gate    — --check BEFORE generating, against the copies as committed
 *                 since 2026-03/04: 80 drift items — 54 DIFFERS, 22 MISSING,
 *                 4 STALE. The gate's first real run went red on real
 *                 content, which is the only calibration that counts    → rc 1
 *   generate    — 1 target (.claude/skills, claude-code, zh-TW): 115 files
 *                 over 55 skills written, 4 stale directories pruned,
 *                 13 agents excluded — among them .gemini/skills, excluded
 *                 for "registry marks it deprecated (superseded by
 *                 antigravity)"                                         → rc 0
 *   green       — --check immediately after generating                  → rc 0
 *   red         — one line of `Use when:` hand-edited in
 *                 .claude/skills/commit-standards/SKILL.md: exactly 1 drift
 *                 item, naming that file, line 11, and both spellings.
 *                 One item, not 55 — so it localises, it does not just
 *                 notice                                                → rc 1
 *   red         — .claude/skills/push/ deleted: reported MISSING and named,
 *                 rather than dropping out of the denominator           → rc 1
 *   red         — the pre-rename directory `process-automation/` restored:
 *                 reported STALE, quoting the `source:` pointer that
 *                 convicts it                                           → rc 1
 *   unmeasured  — --repo-root at a tree with locales/ but no skills/:
 *                 "skills/ is not a directory under …"                  → rc 2
 *   unmeasured  — --repo-root at a tree with skills/ but no locale pack,
 *                 while the target declares zh-TW: refused rather than
 *                 rewriting 55 translated files in English               → rc 2
 *   unmeasured  — .manifest.json removed: refused rather than guessing   → rc 2
 *   unmeasured  — --bogus                                                → rc 2
 *   --self-test — 9/9 arms fired (1 exclusion, 1 green, 3 reds,
 *                 1 no-delete, 2 underivable, 1 flag rejection)          → rc 0
 *
 * The no-delete arm is there because the dangerous failure of a generator that
 * prunes is not that it misses something — it is that it deletes something it
 * did not write. That arm puts a hand-written SKILL.md with no `source:` stamp
 * in the target and requires it to survive.
 *
 * ── Release coupling, stated rather than discovered ────────────────────────
 * `.manifest.json` carries the CLI version, and `scripts/bump-version.mjs`
 * rewrites `cli/package.json` without regenerating anything. So the first
 * `--check` after a version bump WILL fail, by design, the same way
 * `check:llms-txt` does. The fix is one command, `npm run docs:adoption-skills`,
 * and the failure message says so.
 */

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  cpSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  parseFrontmatter,
  rebuildWithFrontmatter,
} from '../cli/src/utils/skills-installer.js';
import { AI_AGENT_PATHS } from '../cli/src/config/ai-agent-paths.js';

const ROOT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));

const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[0;34m';
const CYAN = '\x1b[0;36m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const NC = '\x1b[0m';

/** Something that stopped the derivation from happening at all. */
class Underivable extends Error {}

/**
 * Frontmatter fields Claude Code needs, taken from the English source even for
 * a localized copy. Same list as `mergeFrontmatterContent` in
 * cli/src/utils/skills-installer.js — if that list moves, this must follow, and
 * `--self-test` arm 7 asserts the two still agree on a real skill.
 */
const REQUIRED_FIELDS = ['name', 'allowed-tools', 'scope', 'argument-hint', 'disable-model-invocation'];

const MANIFEST_NAME = '.manifest.json';

// ───────────────────────────────────────────────────────────────────────────
// Argument parsing — unknown flags are rejected, not ignored
// ───────────────────────────────────────────────────────────────────────────

const KNOWN_FLAGS = new Set(['--check', '--self-test', '--verbose', '--repo-root', '--help']);

function parseArgs(argv) {
  const opts = { check: false, selfTest: false, verbose: false, repoRoot: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('-')) {
      throw new Underivable(
        `unexpected positional argument \`${a}\` — use \`--repo-root <dir>\` to point at a tree`
      );
    }
    if (!KNOWN_FLAGS.has(a)) {
      throw new Underivable(
        `unknown flag \`${a}\`.\nKnown flags: ${[...KNOWN_FLAGS].join(', ')}\n` +
          `Rejected rather than ignored: a flag that is quietly dropped makes a run that ` +
          `derived nothing look exactly like a run that derived everything.`
      );
    }
    if (a === '--check') opts.check = true;
    else if (a === '--self-test') opts.selfTest = true;
    else if (a === '--verbose') opts.verbose = true;
    else if (a === '--help') {
      console.log(
        'Usage: node scripts/generate-adoption-skills.mjs [--check] [--self-test] [--verbose] [--repo-root <dir>]'
      );
      process.exit(0);
    } else if (a === '--repo-root') {
      const v = argv[++i];
      if (!v) throw new Underivable('`--repo-root` requires a directory argument');
      opts.repoRoot = v;
    }
  }
  return opts;
}

// ───────────────────────────────────────────────────────────────────────────
// Small filesystem helpers — every failure is loud
// ───────────────────────────────────────────────────────────────────────────

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function isFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

function readJsonOrThrow(abs, what) {
  if (!existsSync(abs)) throw new Underivable(`${what} not found: ${abs}`);
  try {
    return JSON.parse(readFileSync(abs, 'utf8'));
  } catch (e) {
    throw new Underivable(`${what} is not readable JSON: ${abs} — ${e.message}`);
  }
}

/** Top-level subdirectory names, sorted. */
function subdirs(dir) {
  return readdirSync(dir)
    .filter((e) => isDir(join(dir, e)))
    .sort();
}

/** Top-level file names, sorted. Subdirectories are skipped, as the installer does. */
function topLevelFiles(dir) {
  if (!isDir(dir)) return [];
  return readdirSync(dir)
    .filter((e) => isFile(join(dir, e)))
    .sort();
}

// ───────────────────────────────────────────────────────────────────────────
// Target discovery — walked from the registry, never a hardcoded name list
// ───────────────────────────────────────────────────────────────────────────

/**
 * Which self-adoption skill directories this repo owns and should regenerate.
 *
 * A target must be all four of: a registry agent, `supportsSkills`, having a
 * project skills path in ai-agent-paths.js, and present on disk in this repo.
 * A deprecated agent is excluded even when present — see the header on
 * `.gemini/DEPRECATED.md`.
 *
 * @returns {{targets: Array, excluded: Array}} every exclusion carries its reason
 */
export function discoverTargets(repoRoot) {
  const registry = readJsonOrThrow(
    join(repoRoot, 'integrations', 'REGISTRY.json'),
    'integrations/REGISTRY.json'
  );
  const agents = Object.entries(registry.agents ?? {});
  if (agents.length === 0) {
    throw new Underivable('integrations/REGISTRY.json lists no agents — nothing to derive for');
  }

  const targets = [];
  const excluded = [];

  for (const [agentKey, agent] of agents.sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const projectPath = AI_AGENT_PATHS[agentKey]?.skills?.project ?? null;

    if (!agent.supportsSkills) {
      excluded.push({ agent: agentKey, dir: projectPath, reason: 'registry: supportsSkills is false' });
      continue;
    }
    if (!projectPath) {
      excluded.push({
        agent: agentKey,
        dir: null,
        reason: 'no project skills path in cli/src/config/ai-agent-paths.js (path unverified for this tool)',
      });
      continue;
    }

    const rel = projectPath.replace(/\/+$/, '');
    const abs = join(repoRoot, rel);

    // Deprecation is tested BEFORE existence on purpose: it is the decisive
    // fact and the stable one. If a dead integration's tree is still on disk —
    // which is exactly `.gemini/skills/`, frozen rather than deleted — the
    // operator needs to be told it is frozen, not that it is absent.
    if (agent.deprecated) {
      excluded.push({
        agent: agentKey,
        dir: rel,
        reason:
          `registry marks it deprecated` +
          (agent.supersededBy ? ` (superseded by ${agent.supersededBy})` : '') +
          ` — frozen, not regenerated; see ${dirname(rel)}/DEPRECATED.md`,
      });
      continue;
    }
    if (!isDir(abs)) {
      excluded.push({ agent: agentKey, dir: rel, reason: 'this repo does not self-adopt it — no such directory' });
      continue;
    }

    targets.push({ agent: agentKey, dir: rel, abs });
  }

  return { targets, excluded };
}

// ───────────────────────────────────────────────────────────────────────────
// Derivation — what installing this skill WOULD put on disk
// ───────────────────────────────────────────────────────────────────────────

/**
 * The skill ids this repo ships: a directory under `skills/` holding a SKILL.md.
 * Walked, never listed — `skills/` also holds `_shared/`, `agents/`, `ai/`,
 * `commands/`, `tools/` and `workflows/`, which are not skills.
 */
export function sourceSkillIds(repoRoot) {
  const dir = join(repoRoot, 'skills');
  if (!isDir(dir)) throw new Underivable(`skills/ is not a directory under ${repoRoot}`);
  const ids = subdirs(dir).filter((d) => existsSync(join(dir, d, 'SKILL.md')));
  if (ids.length === 0) {
    throw new Underivable(
      `skills/ under ${repoRoot} holds ${subdirs(dir).length} director(ies) but not one SKILL.md — ` +
        `this is "could not derive", not "nothing to do"`
    );
  }
  return ids;
}

/** Merge the agent-facing English frontmatter fields into a localized SKILL.md. */
function mergeFrontmatter(enSkillMdPath, localizedContent) {
  const enParsed = parseFrontmatter(readFileSync(enSkillMdPath, 'utf8'));
  if (!enParsed) return null;
  const fields = {};
  for (const f of REQUIRED_FIELDS) {
    if (enParsed.frontmatter[f] !== undefined) fields[f] = enParsed.frontmatter[f];
  }
  if (Object.keys(fields).length === 0) return null;
  return rebuildWithFrontmatter(localizedContent, fields);
}

/**
 * Resolve one skill's installed files: the union of the localized directory and
 * the English one, locale winning per FILE (not per skill), with the SKILL.md
 * frontmatter merged from English. This mirrors `resolveSkillFiles` in
 * cli/src/utils/skills-installer.js; see the header for why the transformation
 * is shared but the source-path resolution is not.
 */
function resolveSkill(repoRoot, skillId, locale) {
  const enDir = join(repoRoot, 'skills', skillId);
  const localized = locale !== 'en';
  const localeDir = localized ? join(repoRoot, 'locales', locale, 'skills', skillId) : enDir;

  const useLocale = localized && isDir(localeDir);
  const fallbackToEn = localized && !useLocale;

  const names = new Map();
  if (useLocale) for (const f of topLevelFiles(localeDir)) names.set(f, join(localeDir, f));
  for (const f of topLevelFiles(enDir)) if (!names.has(f)) names.set(f, join(enDir, f));

  if (names.size === 0) throw new Underivable(`skill ${skillId} resolves to no files at all`);

  const files = [...names].map(([name, path]) => ({ name, content: readFileSync(path, 'utf8') }));

  if (useLocale) {
    const skill = files.find((f) => f.name === 'SKILL.md');
    if (skill) {
      const merged = mergeFrontmatter(join(enDir, 'SKILL.md'), skill.content);
      if (merged !== null) skill.content = merged;
    }
  }

  files.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return { files, fallbackToEn };
}

/** The locale THIS repo adopted for a target. Not derivable from anywhere else. */
function localeOf(repoRoot, target) {
  const p = join(target.abs, MANIFEST_NAME);
  if (!existsSync(p)) {
    throw new Underivable(
      `${target.dir}/${MANIFEST_NAME} does not exist, so the locale this copy was adopted in ` +
        `is unknown. Guessing would silently overwrite a translated tree with English.`
    );
  }
  const m = readJsonOrThrow(p, `${target.dir}/${MANIFEST_NAME}`);
  if (!m.locale) {
    throw new Underivable(
      `${target.dir}/${MANIFEST_NAME} has no \`locale\` field. That field is the one adoption ` +
        `choice not derivable from source; without it this script cannot say what to write.`
    );
  }
  if (m.locale !== 'en') {
    const pack = join(repoRoot, 'locales', m.locale, 'skills');
    if (!isDir(pack)) {
      throw new Underivable(
        `${target.dir} declares locale ${m.locale} but locales/${m.locale}/skills/ does not exist. ` +
          `Falling back to English here would replace 55 translated files with English ones and ` +
          `report success.`
      );
    }
  }
  return m.locale;
}

/**
 * Everything a target should contain, as `relative path -> content`, plus the
 * directories that must be removed and the ones deliberately left alone.
 */
export function deriveTarget(repoRoot, target) {
  const locale = localeOf(repoRoot, target);
  const ids = sourceSkillIds(repoRoot);
  const cliPkg = readJsonOrThrow(join(repoRoot, 'cli', 'package.json'), 'cli/package.json');
  if (!cliPkg.version) throw new Underivable('cli/package.json has no version');

  const wanted = new Map();
  const fallbacks = [];
  let sourcePointerDepthIssues = 0;

  for (const id of ids) {
    const { files, fallbackToEn } = resolveSkill(repoRoot, id, locale);
    if (fallbackToEn) fallbacks.push(id);
    for (const f of files) {
      wanted.set(`${id}/${f.name}`, f.content);
      if (f.name === 'SKILL.md' && /^source:\s*\.\.\/\.\.\/\.\.\/\.\.\//m.test(f.content)) {
        sourcePointerDepthIssues++;
      }
    }
  }

  // No installedDate — see the header. Key order is fixed so the render is stable.
  wanted.set(
    MANIFEST_NAME,
    JSON.stringify(
      {
        version: cliPkg.version,
        source: 'universal-dev-standards',
        agent: target.agent,
        level: 'project',
        locale,
        generatedBy: 'scripts/generate-adoption-skills.mjs',
      },
      null,
      2
    ) + '\n'
  );

  // ── What is already there, and what may be touched ──────────────────────
  const idSet = new Set(ids);
  const toPrune = [];
  const leftAlone = [];
  for (const entry of subdirs(target.abs)) {
    if (idSet.has(entry)) continue;
    const skillMd = join(target.abs, entry, 'SKILL.md');
    if (!existsSync(skillMd)) {
      leftAlone.push({ dir: entry, reason: 'holds no SKILL.md — written by another installer, not ours to delete' });
      continue;
    }
    const parsed = parseFrontmatter(readFileSync(skillMd, 'utf8'));
    const pointer = parsed?.frontmatter?.source;
    if (!pointer) {
      leftAlone.push({ dir: entry, reason: 'SKILL.md carries no `source:` stamp — not UDS-derived, left alone' });
      continue;
    }
    toPrune.push({ dir: entry, pointer });
  }

  // Stray files inside a kept skill directory, same rule the installer applies.
  const strayFiles = [];
  for (const id of ids) {
    const d = join(target.abs, id);
    if (!isDir(d)) continue;
    for (const f of topLevelFiles(d)) {
      if (!wanted.has(`${id}/${f}`)) strayFiles.push(`${id}/${f}`);
    }
  }

  return { locale, ids, wanted, toPrune, leftAlone, strayFiles, fallbacks, sourcePointerDepthIssues };
}

// ───────────────────────────────────────────────────────────────────────────
// Check and write
// ───────────────────────────────────────────────────────────────────────────

/** First differing line, so the message names a place rather than a percentage. */
function firstDiffLine(expected, actual) {
  const e = expected.split('\n');
  const a = actual.split('\n');
  for (let i = 0; i < Math.max(e.length, a.length); i++) {
    if (e[i] !== a[i]) {
      return (
        `line ${i + 1}\n      expected:  ${JSON.stringify(e[i] ?? '<end of file>')}\n` +
        `      committed: ${JSON.stringify(a[i] ?? '<end of file>')}`
      );
    }
  }
  return 'files differ in trailing content only';
}

/** @returns {Array<{path: string, kind: string, detail: string}>} */
function driftOf(target, derived) {
  const drift = [];
  for (const [rel, content] of derived.wanted) {
    const abs = join(target.abs, rel);
    if (!existsSync(abs)) {
      drift.push({ path: `${target.dir}/${rel}`, kind: 'missing', detail: 'source has it, the committed copy does not' });
      continue;
    }
    const actual = readFileSync(abs, 'utf8');
    if (actual !== content) {
      drift.push({ path: `${target.dir}/${rel}`, kind: 'differs', detail: firstDiffLine(content, actual) });
    }
  }
  for (const p of derived.toPrune) {
    drift.push({
      path: `${target.dir}/${p.dir}/`,
      kind: 'stale',
      detail: `UDS-derived (source: ${p.pointer}) but no such skill in skills/ — should be pruned`,
    });
  }
  for (const f of derived.strayFiles) {
    drift.push({ path: `${target.dir}/${f}`, kind: 'stray', detail: 'not shipped for this skill — should be pruned' });
  }
  return drift;
}

function writeTarget(target, derived) {
  for (const [rel, content] of derived.wanted) {
    const abs = join(target.abs, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content, 'utf8');
  }
  for (const p of derived.toPrune) rmSync(join(target.abs, p.dir), { recursive: true, force: true });
  for (const f of derived.strayFiles) rmSync(join(target.abs, f), { force: true });
}

// ───────────────────────────────────────────────────────────────────────────
// Self-test — a gate that has never gone red is indistinguishable from one
// that cannot. Each arm builds a throwaway tree and breaks one thing.
// ───────────────────────────────────────────────────────────────────────────

/** Copy the minimum tree this script reads, so arms cannot touch the real repo. */
function scaffold(base, { withSkills = true, withManifest = true, locale = 'zh-TW' } = {}) {
  const root = mkdtempSync(join(base, 'tree-'));
  if (withSkills) cpSync(join(ROOT_DIR, 'skills'), join(root, 'skills'), { recursive: true });
  cpSync(join(ROOT_DIR, 'locales', locale, 'skills'), join(root, 'locales', locale, 'skills'), {
    recursive: true,
  });
  mkdirSync(join(root, 'integrations'), { recursive: true });
  cpSync(join(ROOT_DIR, 'integrations', 'REGISTRY.json'), join(root, 'integrations', 'REGISTRY.json'));
  mkdirSync(join(root, 'cli'), { recursive: true });
  cpSync(join(ROOT_DIR, 'cli', 'package.json'), join(root, 'cli', 'package.json'));
  mkdirSync(join(root, '.claude', 'skills'), { recursive: true });
  // A frozen deprecated tree, present on disk — the real `.gemini/skills/`
  // shape. Arm 0 requires it to be excluded for being deprecated, not for
  // being absent, which is the difference between the rule and an accident.
  mkdirSync(join(root, '.gemini', 'skills', 'placeholder'), { recursive: true });
  writeFileSync(join(root, '.gemini', 'skills', 'placeholder', 'SKILL.md'), `---\nname: frozen\n---\n\n# frozen\n`);
  if (withManifest) {
    writeFileSync(
      join(root, '.claude', 'skills', MANIFEST_NAME),
      JSON.stringify({ version: '0.0.0', source: 'universal-dev-standards', agent: 'claude-code', level: 'project', locale }, null, 2)
    );
  }
  return root;
}

function selfTest() {
  console.log(`${BLUE}${BOLD}Self-test — does this gate actually go red?${NC}`);
  console.log(`${DIM}Each arm builds a throwaway tree, generates into it, then breaks one thing.${NC}\n`);

  let failures = 0;
  const report = (ok, name, got) => {
    console.log(
      `  ${ok ? `${GREEN}[FIRED]${NC}` : `${RED}[DID NOT FIRE]${NC}`} ${name}\n          ${DIM}${got}${NC}`
    );
    if (!ok) failures++;
  };

  let tmp = null;
  try {
    tmp = mkdtempSync(join(tmpdir(), 'uds-adoption-skills-'));

    const root = scaffold(tmp);
    const { targets, excluded } = discoverTargets(root);
    if (targets.length !== 1) throw new Underivable(`expected exactly 1 target in the scaffold, got ${targets.length}`);
    const target = targets[0];

    // Arm 0 — the deprecated integration is excluded, and by reading the
    // registry rather than by name. Without this the whole exclusion is a claim.
    const gem = excluded.find((e) => e.agent === 'gemini-cli');
    report(
      Boolean(gem && /deprecated/.test(gem.reason)),
      'a registry-deprecated agent is excluded, with the registry named as the reason',
      gem ? gem.reason : 'gemini-cli was not in the exclusion list at all'
    );

    // Arm 1 — the green arm. Without it every red arm below proves nothing.
    writeTarget(target, deriveTarget(root, target));
    const green = driftOf(target, deriveTarget(root, target));
    report(green.length === 0, 'freshly generated tree checks clean', `${green.length} drift item(s)`);

    const ids = sourceSkillIds(root);
    const [v1, v2] = [...ids].sort();

    // Arm 2 — one line hand-edited. The commonest real drift.
    const f1 = join(target.abs, v1, 'SKILL.md');
    writeFileSync(f1, readFileSync(f1, 'utf8').replace(/^\s*Use when:.*$/im, '  Use when: something else'));
    const d2 = driftOf(target, deriveTarget(root, target));
    report(
      d2.length === 1 && d2[0].path.includes(`${v1}/SKILL.md`) && d2[0].kind === 'differs',
      `a hand edit in ${v1}/SKILL.md → drift, naming that file and no other`,
      d2.map((d) => `${d.kind}:${d.path}`).join(', ') || 'no drift at all'
    );
    writeTarget(target, deriveTarget(root, target)); // restore

    // Arm 3 — a skill directory deleted. Missing must be a failure, not a skip.
    rmSync(join(target.abs, v2), { recursive: true, force: true });
    const d3 = driftOf(target, deriveTarget(root, target));
    report(
      d3.some((d) => d.kind === 'missing' && d.path.includes(`${v2}/`)),
      `${v2}/ deleted → reported missing, not skipped`,
      d3.filter((d) => d.kind === 'missing').map((d) => d.path).join(', ') || 'nothing reported missing'
    );
    writeTarget(target, deriveTarget(root, target)); // restore

    // Arm 4 — a stale UDS-derived directory. This is the shape of the four
    // pre-rename leftovers, and it must be caught by provenance, not by name.
    const stale = join(target.abs, 'zz-renamed-away');
    mkdirSync(stale, { recursive: true });
    writeFileSync(join(stale, 'SKILL.md'), `---\nsource: ../../../../skills/gone/SKILL.md\nname: gone\n---\n\n# gone\n`);
    const d4 = driftOf(target, deriveTarget(root, target));
    report(
      d4.some((d) => d.kind === 'stale' && d.path.includes('zz-renamed-away')),
      'a UDS-stamped directory with no source skill → reported as stale',
      d4.filter((d) => d.kind === 'stale').map((d) => d.path).join(', ') || 'nothing reported stale'
    );

    // Arm 5 — a directory that is NOT ours must survive the same pass.
    const notOurs = join(target.abs, 'zz-hand-written');
    mkdirSync(notOurs, { recursive: true });
    writeFileSync(join(notOurs, 'SKILL.md'), `---\nname: mine\n---\n\n# mine\n`);
    const d5 = deriveTarget(root, target);
    report(
      d5.leftAlone.some((x) => x.dir === 'zz-hand-written') && !d5.toPrune.some((x) => x.dir === 'zz-hand-written'),
      'a SKILL.md with no `source:` stamp is left alone, not deleted',
      d5.leftAlone.map((x) => x.dir).join(', ') || 'nothing left alone'
    );

    // Arm 6 — the third state: a tree with no skills/ must not look like a pass.
    let underivable = false;
    let msg = '';
    try {
      const bare = scaffold(tmp, { withSkills: false });
      sourceSkillIds(bare);
    } catch (e) {
      underivable = e instanceof Underivable;
      msg = e.message;
    }
    report(underivable, 'a tree with no skills/ → Underivable (exit 2, not exit 0)', msg.slice(0, 110));

    // Arm 7 — a target with no locale is unmeasurable, never "assume English".
    let noLocale = false;
    let msg2 = '';
    try {
      const nm = scaffold(tmp, { withManifest: false });
      localeOf(nm, { ...target, abs: join(nm, '.claude', 'skills') });
    } catch (e) {
      noLocale = e instanceof Underivable;
      msg2 = e.message;
    }
    report(noLocale, 'a target with no .manifest.json locale → Underivable, not an English rewrite', msg2.slice(0, 110));

    // Arm 8 — unknown flag rejected rather than ignored.
    let rejected = false;
    try {
      parseArgs(['--not-a-real-flag']);
    } catch (e) {
      rejected = e instanceof Underivable;
    }
    report(rejected, 'unknown flag → rejected (exit 2), not silently ignored', `${rejected}`);
  } catch (e) {
    console.log(`\n${RED}Self-test could not run: ${e.stack ?? e.message}${NC}`);
    return 2;
  } finally {
    if (tmp) rmSync(tmp, { recursive: true, force: true });
  }

  console.log('');
  if (failures > 0) {
    console.log(`${RED}${BOLD}✗ ${failures} arm(s) did not behave as required.${NC}`);
    console.log(`${RED}  Until they do, a clean run of this gate means nothing.${NC}\n`);
    return 1;
  }
  console.log(
    `${GREEN}${BOLD}✓ All 9 arms behaved as required — 1 exclusion, 1 green, 3 reds, 1 no-delete, 2 underivable, 1 flag rejection.${NC}\n`
  );
  return 0;
}

// ───────────────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────────────

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`\n${RED}${BOLD}✗ Could not derive.${NC}\n${RED}${e.message}${NC}\n`);
    return 2;
  }

  if (opts.selfTest) return selfTest();

  // `resolve`, not `join`: join('/cwd', '/abs') concatenates rather than
  // honouring the absolute path, which would silently operate on the wrong tree.
  const repoRoot = opts.repoRoot ? resolve(process.cwd(), opts.repoRoot) : ROOT_DIR;

  let targets;
  let excluded;
  let plans;
  try {
    ({ targets, excluded } = discoverTargets(repoRoot));
    if (targets.length === 0) {
      throw new Underivable(
        `no live self-adoption skill directory found under ${repoRoot}.\n` +
          `Excluded:\n` +
          excluded.map((e) => `  ${e.agent}${e.dir ? ` (${e.dir})` : ''} — ${e.reason}`).join('\n') +
          `\nThis is "could not derive", not "everything is up to date".`
      );
    }
    plans = targets.map((t) => ({ target: t, derived: deriveTarget(repoRoot, t) }));
  } catch (e) {
    if (e instanceof Underivable) {
      console.error(`\n${RED}${BOLD}✗ Could not derive the self-adoption skill copies.${NC}`);
      console.error(`${RED}${e.message}${NC}`);
      console.error(
        `${YELLOW}This is exit 2, not exit 0. Nothing was checked; do not read this as a pass.${NC}\n`
      );
      return 2;
    }
    throw e;
  }

  console.log('');
  console.log('==========================================');
  console.log('  Self-Adoption Skill Copy Generator');
  console.log('  自採用 Skill 副本產生器');
  console.log('==========================================');
  console.log('');
  console.log(`${DIM}Targets are read from integrations/REGISTRY.json, never listed here.${NC}`);
  for (const e of excluded) {
    console.log(`  ${DIM}excluded: ${e.agent}${e.dir ? ` (${e.dir})` : ''} — ${e.reason}${NC}`);
  }
  console.log('');

  let anyDrift = false;

  for (const { target, derived } of plans) {
    const fileCount = derived.wanted.size;
    console.log(
      `${CYAN}${BOLD}${target.dir}${NC} — agent ${target.agent}, locale ${derived.locale}, ` +
        `${derived.ids.length} skill(s), ${fileCount} file(s)`
    );
    for (const x of derived.leftAlone) console.log(`    ${DIM}left alone: ${x.dir} — ${x.reason}${NC}`);
    if (opts.verbose) {
      for (const id of derived.ids) {
        const n = [...derived.wanted.keys()].filter((k) => k.startsWith(`${id}/`)).length;
        console.log(`    ${DIM}${id.padEnd(30)} ${n} file(s)${NC}`);
      }
    }

    if (opts.check) {
      const drift = driftOf(target, derived);
      if (drift.length === 0) {
        console.log(`  ${GREEN}✓ matches its sources${NC}`);
      } else {
        anyDrift = true;
        for (const d of drift) {
          console.log(`  ${RED}[${d.kind.toUpperCase()}]${NC} ${BOLD}${d.path}${NC}`);
          console.log(`         ${DIM}${d.detail}${NC}`);
        }
      }
    } else {
      const drift = driftOf(target, derived);
      writeTarget(target, derived);
      console.log(
        `  ${GREEN}✓ wrote ${fileCount} file(s)${NC}` +
          (derived.toPrune.length > 0
            ? `, ${YELLOW}pruned ${derived.toPrune.length} stale director(ies)${NC}`
            : '') +
          (derived.strayFiles.length > 0 ? `, pruned ${derived.strayFiles.length} stray file(s)` : '')
      );
      for (const p of derived.toPrune) {
        console.log(`    ${YELLOW}pruned: ${p.dir}/ — source: ${p.pointer} (no such skill in skills/)${NC}`);
      }
      for (const f of derived.strayFiles) console.log(`    ${YELLOW}pruned: ${f}${NC}`);
      if (drift.length > 0) console.log(`    ${DIM}${drift.length} item(s) had drifted before this run${NC}`);
    }

    // Side findings — noticed while deriving, not this script's to fix.
    if (derived.fallbacks.length > 0) {
      console.log(
        `    ${YELLOW}note:${NC} ${derived.fallbacks.length} skill(s) have no ${derived.locale} ` +
          `directory and fell back to English: ${derived.fallbacks.join(', ')}`
      );
    }
    if (derived.sourcePointerDepthIssues > 0) {
      console.log(
        `    ${DIM}note: ${derived.sourcePointerDepthIssues} SKILL.md carry a \`source:\` pointer one level` +
          ` too deep for this location. Copied verbatim on purpose — see the header.${NC}`
      );
    }
    console.log('');
  }

  console.log('==========================================');
  if (opts.check) {
    if (anyDrift) {
      console.log(`${RED}${BOLD}✗ The self-adoption skill copies have drifted from their sources.${NC}`);
      console.log(`${YELLOW}Run: npm run docs:adoption-skills${NC}`);
      console.log(
        `${DIM}If this appeared right after a version bump, that is the intended behaviour —${NC}\n` +
          `${DIM}.manifest.json carries the CLI version, so bumping it is a real change here.${NC}\n`
      );
      return 1;
    }
    console.log(`${GREEN}${BOLD}✓ ${plans.length} target(s) match their sources${NC}`);
    console.log(
      `${DIM}  Verify this is not vacuous: node scripts/generate-adoption-skills.mjs --self-test${NC}\n`
    );
    return 0;
  }
  console.log(`${GREEN}${BOLD}✓ Generated ${plans.length} target(s)${NC}\n`);
  return 0;
}

try {
  process.exit(main());
} catch (e) {
  console.error(`${RED}Internal error: ${e.stack ?? e}${NC}`);
  process.exit(2);
}
