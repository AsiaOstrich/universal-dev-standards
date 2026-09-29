#!/usr/bin/env node
/**
 * Prompt Footprint Ratchet — DEC-117 D2/L2
 * 提示詞足跡棘輪 — DEC-117 D2/L2
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 * UDS is an agent harness layer: every adopter's agent gets CLAUDE.md/AGENTS.md's
 * UDS-managed block, the turn-completion-integrity Stop hook's block message
 * (when hooks are wired in), and skill descriptions, injected without the
 * adopter reading anything or opting in. DEC-117 (dev-platform
 * cross-project/decisions/DEC-117-agent-harness-non-functional-regression-
 * borrowing.md) borrows a finding from "Don't Blame the Large Language Model"
 * (arXiv 2607.03691v2): a coding-agent harness's per-task token cost rose 70%
 * across 35 versions while every functional test stayed green, because nothing
 * measured cost. UDS had exactly the same blind spot (DEC-117 GAP CHECK: "UDS
 * 只有一個未被使用的估算器" — cli/src/utils/context-chunker.js's estimateTokens
 * existed but nothing called it in a release gate). This script is D2's static
 * arm (H4): it measures what UDS unconditionally injects, per adopter shape,
 * and refuses to let that number grow in a release unless the SAME commit also
 * raises the committed ceiling in prompt-footprint-baseline.json. No other
 * escape hatch exists — compareToBaseline() below takes no justification
 * parameter, so a CHANGELOG note cannot satisfy it (DEC-117 D2 explicit
 * requirement: "不留『CHANGELOG 有說明即可』的人工逃生口").
 *
 * ── What counts (DEC-117 D2's three-layer split; only layer 2 is ratcheted) ─
 *   ① written characters — not measured here; DEC-117 explicitly excludes raw
 *     character counts from the ratchet because zh-TW and English have very
 *     different chars-per-token ratios (see LIMITATIONS below) — comparing
 *     characters across shapes would compare the wrong thing.
 *   ② tokens a tool unconditionally loads — THIS is what's ratcheted:
 *       - the UDS-managed block inside CLAUDE.md and/or AGENTS.md (between
 *         the `<!-- UDS:STANDARDS:START/END -->` markers) — whichever files a
 *         given shape's fixture actually has.
 *       - the turn-completion-integrity Stop hook's block message (the fixed
 *         template in scripts/hooks/turn-completion/engine.mjs's reason()) —
 *         measured with an empty pack id / empty sentence for determinism;
 *         the real message also quotes the offending sentence verbatim,
 *         which is adopter content, not something UDS's own commits move.
 *       - skill descriptions, per this shape's own actual loading mechanism
 *         (see SHAPES below and the per-shape comments — this is NOT uniform
 *         across shapes; see LIMITATIONS for what could not be measured
 *         precisely and why).
 *   ③ tokens re-billed every turn (cache-related) — out of scope for this
 *     static check per DEC-117 D2 ("本 DEC 不量，留給動態臂").
 *   `.standards/*.ai.yaml` is read on demand, not unconditionally loaded, and
 *   is therefore never counted here (DEC-117 D2 explicit exclusion).
 *
 * ── Token measurement ────────────────────────────────────────────────────────
 * Uses the EXISTING estimateTokens() from cli/src/utils/context-chunker.js
 * (DEC-117 D2's explicit instruction — do not invent a second estimator).
 * Read it before touching this file: it is `Math.ceil(text.length / 4)`, a
 * FLAT characters-per-token ratio with no language awareness at all. Real
 * tokenizers give CJK text roughly 4x MORE tokens per character than English
 * text (DEC-117 D2: "zh-TW 與英文的字元／token 比差約四倍"). Consequence: every
 * number this script reports for a zh-TW shape is a SYSTEMATIC
 * UNDER-ESTIMATE of the true injected token cost, likely by a large factor —
 * this is a known limitation of reusing estimateTokens as instructed, not a
 * bug in this script. A precise cross-language number would need Claude's
 * count_tokens API (network-dependent, out of scope for a static pre-release
 * check) — DEC-117 D2 names this explicitly as future work ("Claude 形狀可用
 * count_tokens API 取真值"). Ratcheting the (biased) estimate is still worth
 * doing: the ratchet catches RELATIVE growth within the same shape over time,
 * which does not require the estimate to be unbiased, only consistent commit
 * to commit — and it always has been, since estimateTokens has not changed.
 *
 * ── The three shapes (DEC-117 D2: "沿用升級實測的夾具") ──────────────────────
 * Reuses scripts/check-upgrade-fidelity.sh's exact three fixture recipes (see
 * its own header for the real adopters each one is modeled on), MINUS that
 * script's previous-version-from-npm comparison — this script only measures
 * the CURRENT working tree's CLI, it does not diff across versions. Shapes are
 * NEVER summed or compared against each other (DEC-117 explicit instruction:
 * "不可以把不同形狀加總比較") — each has its own baseline ceiling and its own
 * absolute cap, reported and ratcheted independently.
 *
 * ── LIMITATIONS (read before trusting a number from this script) ───────────
 * 1. zh-TW numbers under-estimate true token cost (see "Token measurement").
 * 2. Skill description loading differs by shape, and this script cannot
 *    observe Claude Code's real runtime truncation:
 *      - shape zh-tw-index-claude-code: under default `uds init -y`, Claude
 *        Code skills route through the Plugin Marketplace and are NOT copied
 *        into the adopter's project (measured empirically: the built fixture
 *        contains zero installed SKILL.md files). This script therefore
 *        cannot measure this shape's skill cost from its own fixture, and
 *        instead sums the zh-TW-locale canonical skill source
 *        (locales/zh-TW/skills/<name>/SKILL.md) as a stand-in for what the
 *        marketplace would serve a zh-TW adopter — an assumption, not an
 *        observation, because this script has no way to inspect what the
 *        Plugin Marketplace actually ships.
 *      - Claude Code additionally truncates the skill listing to a fraction
 *        of context (skillListingBudgetFraction, default 1% — see DEC-061,
 *        dev-platform cross-project/decisions/DEC-061-uds-skill-listing-
 *        budget.md). This script cannot replicate the real truncation
 *        algorithm (it keeps full descriptions for "most-used" skills and
 *        drops others entirely, ranked by usage this script has no access
 *        to) — real per-adopter truncation also depends on every OTHER skill
 *        and plugin that adopter has installed, which is fundamentally
 *        outside UDS's control and unobservable here. Approximation used:
 *        CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS (2000, derived from DEC-061's
 *        observed "1% of context ≈ half of a ~2k-token budget" at the time
 *        UDS alone measured ~1k tokens for 59 skills against a 200k context
 *        window) caps the Claude Code shape's own contribution. This is a
 *        reference ceiling, not a simulation, and is documented as such.
 *      - shape en-minimal-no-ai-tool: measured empirically at 0 — no
 *        skills-capable tool is selected in this shape, and no skills are
 *        installed at all (confirmed by running the fixture; nothing
 *        approximated here).
 *      - shape codex-opencode-index: codex/opencode skills ARE physically
 *        copied into the fixture (.agents/skills/), so this shape's number
 *        IS a direct, real measurement of installed SKILL.md files — no
 *        stand-in needed. No published truncation budget is documented for
 *        Codex/OpenCode's skill loading, so this shape's skill tokens are
 *        reported RAW (uncapped) — a deliberately conservative upper bound,
 *        not a claim that Codex never truncates.
 * 3. The Stop hook message is counted for every shape uniformly, even shapes
 *    built without `--with-hooks` (none of the three fixtures pass it — see
 *    check-upgrade-fidelity.sh's shapes, reused verbatim). This is a
 *    deliberate choice, not an oversight: the message's fixed-template token
 *    cost does not depend on locale, content-mode, or which AI tool is
 *    selected, so measuring it once and adding it uniformly is equivalent to
 *    (and cheaper than) rebuilding each fixture a second time with
 *    `--with-hooks` — but it means a shape's total should be read as "if this
 *    adopter also wires in the Stop hook", not as a hook necessarily being
 *    present in that specific fixture.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────
 *   node scripts/check-prompt-footprint.mjs            Build all three real
 *                                                       fixtures, measure,
 *                                                       compare to baseline.
 *   node scripts/check-prompt-footprint.mjs --self-test Extractor sanity only
 *                                                       (no CLI spawn, no
 *                                                       network).
 *
 * ── Exit codes (three states — "could not measure" is not a pass) ──────────
 *   0 — every shape is at or under its committed ceiling and under its
 *       absolute cap.
 *   1 — a shape grew past its committed ceiling (raise
 *       scripts/prompt-footprint-baseline.json in this same commit if the
 *       growth is intentional), or past its absolute cap (a ceiling raise
 *       alone cannot fix this — see the cap's own comment in the baseline
 *       file), or the self-test failed.
 *   2 — could not measure: the baseline file is missing/malformed, a shape
 *       has no baseline entry at all, or `uds init` failed to produce a
 *       fixture. NOT a pass.
 *
 * @see cross-project/decisions/DEC-117-agent-harness-non-functional-
 *      regression-borrowing.md (dev-platform; authoritative source for D2/L2)
 * @see scripts/check-upgrade-fidelity.sh (the three fixture recipes, reused)
 * @see cli/src/utils/context-chunker.js (estimateTokens — reused as-is)
 * @see scripts/hooks/turn-completion/engine.mjs (reason() — Stop hook message)
 */
import { existsSync, readFileSync, readdirSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { isolatedHome } from './lib/isolated-home.mjs';

import { estimateTokens } from '../cli/src/utils/context-chunker.js';
import { reason } from './hooks/turn-completion/engine.mjs';
import { UDS_MARKERS as ALL_UDS_MARKERS } from '../cli/src/core/constants.js';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = dirname(HERE);
export const UDS_BIN = join(ROOT, 'cli', 'bin', 'uds.js');
export const BASELINE_PATH = join(HERE, 'prompt-footprint-baseline.json');

/** CLAUDE.md/AGENTS.md are always markdown regardless of the `--format` flag
 * (that flag controls .standards/*.ai.yaml vs .md, not the wrapper) — so this
 * always takes the `markdown` variant of the single source of truth
 * (cli/src/core/constants.js), not a second, driftable copy of the literal
 * marker strings. */
export const UDS_MARKERS = ALL_UDS_MARKERS.markdown;

/**
 * Content strictly between the UDS markers, or null if both markers are not
 * present (in order). Deliberately simpler than integration-generator.js's
 * own locateMarkerBlock (no fenced-code-block awareness, no ambiguity
 * detection) — this script only ever reads files THIS repo's own CLI just
 * generated, never adopter-edited content, so the edge cases that function
 * guards against cannot occur here.
 */
export function extractUdsBlock(fileContent) {
  if (typeof fileContent !== 'string') return null;
  const startIdx = fileContent.indexOf(UDS_MARKERS.start);
  if (startIdx === -1) return null;
  const contentStart = startIdx + UDS_MARKERS.start.length;
  const endIdx = fileContent.indexOf(UDS_MARKERS.end, contentStart);
  if (endIdx === -1) return null;
  return fileContent.slice(contentStart, endIdx);
}

/**
 * Fixed-template token cost of the turn-completion-integrity Stop hook's
 * block message (scripts/hooks/turn-completion/engine.mjs reason()).
 * Measured with an empty pack id and empty sentence for determinism — the
 * real message also quotes the offending sentence verbatim, which is
 * per-invocation adopter content, not a fixed cost UDS's own commits move.
 */
export function stopHookMessageTokens() {
  return estimateTokens(reason('en', ''));
}

/**
 * The `description:` field's text out of a SKILL.md's YAML frontmatter.
 * Every one of UDS's 55 skills uses the `description: |` block-scalar form
 * (verified 2026-09-28: `grep -L 'description: |' skills/<name>/SKILL.md` after
 * filtering to files that declare `description:` at all returns nothing) —
 * this function only handles that form, and returns '' for anything else
 * rather than guessing at a different YAML scalar style.
 */
export function extractSkillDescription(skillMdContent) {
  if (typeof skillMdContent !== 'string') return '';
  const fm = skillMdContent.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return '';
  const lines = fm[1].split('\n');
  const descIdx = lines.findIndex((l) => /^description:\s*\|?\s*$/.test(l) || /^description:\s*\S/.test(l));
  if (descIdx === -1) return '';
  const firstLine = lines[descIdx];
  const inline = firstLine.match(/^description:\s*(.+)$/);
  const collected = [];
  if (inline && inline[1].trim() && inline[1].trim() !== '|' && inline[1].trim() !== '>') {
    collected.push(inline[1].trim());
  }
  for (let i = descIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^[A-Za-z_-]+:\S?/.test(line) || /^[A-Za-z_-]+:$/.test(line)) break; // next top-level frontmatter key
    collected.push(line.replace(/^ {2}/, ''));
  }
  return collected.join('\n').trim();
}

/**
 * Sum estimateTokens() over every `<name>/SKILL.md` directly under `dir` (one
 * level — matches how skills are installed: a flat directory of
 * `<skill-name>/SKILL.md`). Returns { count, tokens: rawTokens } — NOT
 * capped; callers apply CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS themselves where
 * it applies (see per-shape comments in SHAPES).
 */
export function sumSkillDescriptionTokens(dir) {
  if (!dir || !existsSync(dir)) return { count: 0, tokens: 0 };
  let combined = '';
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillPath = join(dir, entry.name, 'SKILL.md');
    if (!existsSync(skillPath)) continue;
    const desc = extractSkillDescription(readFileSync(skillPath, 'utf8'));
    if (desc) {
      combined += desc + '\n';
      count++;
    }
  }
  return { count, tokens: estimateTokens(combined) };
}

/**
 * DEC-061's observed reference point: UDS's 59 skills at ~4,170 chars (~1k
 * tokens by this same flat estimator) sat at roughly half of a 1%-of-context
 * skill listing budget, against a ~200k-token context window. 1% of 200k =
 * 2,000 — used here as a reference ceiling for Claude Code's own truncation,
 * NOT a simulation of its real "keep full descriptions for most-used skills,
 * drop the rest" algorithm (see LIMITATIONS in this file's header).
 */
export const CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS = 2000;

export function effectiveSkillTokens(rawTokens, capApplies) {
  return capApplies ? Math.min(rawTokens, CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS) : rawTokens;
}

/**
 * The three shapes, reusing scripts/check-upgrade-fidelity.sh's exact fixture
 * recipes (flags and setup). `skillsSource` says where THIS shape's skill
 * descriptions are measured from — see the per-shape comment and this file's
 * LIMITATIONS section for why it differs by shape.
 */
export const SHAPES = {
  'zh-tw-index-claude-code': {
    label: 'zh-TW + bilingual + index + Claude Code only (DEC-117 shape a / telemetry-server)',
    initArgs: ['--locale', 'zh-tw', '--output-lang', 'bilingual', '--content-mode', 'index', '--agents-md', '--format', 'ai'],
    setup: (dir) => mkdirSync(join(dir, '.claude'), { recursive: true }),
    files: ['CLAUDE.md', 'AGENTS.md'],
    // Default `uds init -y` routes Claude Code skills through the Plugin
    // Marketplace — nothing is copied into the fixture (verified empirically:
    // the built fixture has no .claude/skills/<name>/SKILL.md at all). Stand-in:
    // the zh-TW canonical skill source, which is what a zh-TW adopter's
    // marketplace listing is built from. See LIMITATIONS.
    skillsSource: { kind: 'repo-relative', path: 'locales/zh-TW/skills' },
    capSkillTokens: true,
  },
  'en-minimal-no-ai-tool': {
    label: 'en + minimal + no AI tool selected (DEC-117 shape b / EGR)',
    initArgs: ['--content-mode', 'minimal', '--agents-md', '--format', 'ai'],
    setup: () => {},
    files: ['AGENTS.md'],
    // No skills-capable tool is selected in this shape — measured
    // empirically as zero skills installed. Nothing to sum.
    skillsSource: null,
    capSkillTokens: false,
  },
  'codex-opencode-index': {
    label: 'codex/opencode genuinely selected + index (DEC-117 shape c, control)',
    initArgs: ['--content-mode', 'index', '--format', 'ai'],
    setup: (dir) => writeFileSync(join(dir, 'AGENTS.md'), '# placeholder\n'),
    files: ['AGENTS.md'],
    // codex/opencode skills ARE physically copied into the fixture — this is
    // a direct measurement, not a stand-in. .agents/skills/ is what OpenAI
    // Codex reads (see the init log's own install path); .opencode/skill/ is
    // the same 55 files for OpenCode, so measuring one is not double-counting
    // a shared cost, it is the one this shape's fixture actually has both of.
    skillsSource: { kind: 'fixture-relative', path: '.agents/skills' },
    capSkillTokens: false,
  },
};

/** Resolve a shape's skillsSource to an absolute directory, or null. */
export function resolveSkillsDir(shapeDef, fixtureDir) {
  if (!shapeDef.skillsSource) return null;
  const { kind, path } = shapeDef.skillsSource;
  return kind === 'repo-relative' ? join(ROOT, path) : join(fixtureDir, path);
}

/**
 * Measure one already-built fixture directory against its shape definition.
 * Pure with respect to the filesystem it's pointed at — does not spawn any
 * process, does not know about the baseline file. This is what the unit
 * tests exercise directly against synthetic fixtures, and what the real CLI
 * path (buildAndMeasureShape below) calls against a real `uds init` output.
 */
export function measureShapeFixture(shapeDef, fixtureDir) {
  let mdBlockTokens = 0;
  const perFile = {};
  for (const relPath of shapeDef.files) {
    const p = join(fixtureDir, relPath);
    const block = existsSync(p) ? extractUdsBlock(readFileSync(p, 'utf8')) : null;
    const tokens = block ? estimateTokens(block) : 0;
    perFile[relPath] = tokens;
    mdBlockTokens += tokens;
  }

  const skillsDir = resolveSkillsDir(shapeDef, fixtureDir);
  const { count: skillCount, tokens: skillTokensRaw } = sumSkillDescriptionTokens(skillsDir);
  const skillTokensEffective = effectiveSkillTokens(skillTokensRaw, shapeDef.capSkillTokens);

  const stopHookTokens = stopHookMessageTokens();
  const total = mdBlockTokens + stopHookTokens + skillTokensEffective;

  return {
    mdBlockTokens,
    perFile,
    stopHookTokens,
    skillCount,
    skillTokensRaw,
    skillTokensEffective,
    skillCapApplied: shapeDef.capSkillTokens,
    total,
  };
}

/**
 * Compare one dimension's current value against its (ceiling, absoluteMax)
 * pair. Deliberately takes no "justification"/"reason" parameter — DEC-117
 * D2 requires that NOTHING besides raising the committed ceiling can make a
 * grown measurement pass, so there is no parameter here for a caller to
 * (mis)use as one.
 */
function compareDimension(label, currentValue, ceiling, absoluteMax) {
  if (typeof ceiling !== 'number' || typeof absoluteMax !== 'number') {
    return { ok: false, code: 'no-baseline-entry',
      message: `${label}: no usable baseline entry (missing ceiling/absoluteMax) — cannot judge growth` };
  }
  if (ceiling > absoluteMax) {
    return { ok: false, code: 'ceiling-exceeds-absolute-max', ceiling, absoluteMax,
      message: `${label}: committed ceiling (${ceiling}) exceeds its own absolute cap (${absoluteMax}) — the baseline file itself is invalid` };
  }
  if (currentValue > absoluteMax) {
    return { ok: false, code: 'exceeds-absolute-max', absoluteMax,
      message: `${label}: ${currentValue} tokens exceeds the absolute cap ${absoluteMax} — raising the ceiling cannot fix this; the injected content itself must shrink` };
  }
  if (currentValue > ceiling) {
    return { ok: false, code: 'exceeds-ceiling', ceiling,
      message: `${label}: ${currentValue} tokens exceeds the committed baseline ceiling ${ceiling} — raise scripts/prompt-footprint-baseline.json in THIS SAME COMMIT if the growth is intentional` };
  }
  return { ok: true, ceiling };
}

/**
 * Compare a shape's current measurement against its baseline entry, on TWO
 * independent dimensions:
 *   - `total` — the DEC-117 D2 primary number (mdBlock + stopHook + the
 *     shape's own EFFECTIVE, cap-adjusted skill tokens).
 *   - `skillTokensRaw` — the UNCAPPED skill description sum. Ratcheted
 *     separately because the Claude Code shape's cap
 *     (CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS) otherwise makes `total` blind to
 *     zh-TW skill description growth once the cap is already saturated — a
 *     skill description could double in size and `total` would not move at
 *     all. Ratcheting the raw sum too closes that blind spot without
 *     changing what DEC-117 asks `total` to mean.
 * `measurement` is `{ total, skillTokensRaw }` (a subset of
 * measureShapeFixture()'s return). Takes no justification parameter, for the
 * same reason compareDimension() does not.
 */
export function compareShapeToBaseline(shapeKey, measurement, baselineEntry) {
  const totalResult = compareDimension(
    `${shapeKey} (total)`, measurement.total, baselineEntry?.ceiling, baselineEntry?.absoluteMax
  );
  const skillResult = compareDimension(
    `${shapeKey} (raw skill descriptions)`, measurement.skillTokensRaw, baselineEntry?.skillRawCeiling, baselineEntry?.skillRawAbsoluteMax
  );
  const ok = totalResult.ok && skillResult.ok;
  const failed = !totalResult.ok ? totalResult : skillResult;
  return {
    ok,
    shape: shapeKey,
    current: measurement.total,
    ceiling: baselineEntry?.ceiling,
    code: ok ? undefined : failed.code,
    message: ok ? undefined : failed.message,
    total: totalResult,
    skillRaw: skillResult,
  };
}

/** Compare every measured shape against baseline.shapes. Pure. Never sums or
 * compares shapes against each other — each shape's verdict depends only on
 * its own entry. */
export function compareToBaseline(currentByShape, baseline) {
  const results = Object.entries(currentByShape).map(([shapeKey, measurement]) =>
    compareShapeToBaseline(shapeKey, measurement, baseline?.shapes?.[shapeKey])
  );
  return { ok: results.every((r) => r.ok), results };
}

export function loadBaseline(path = BASELINE_PATH) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

// ── Real fixture building (CLI path only — never called from unit tests) ───

function buildFixture(shapeKey, shapeDef, workDir) {
  mkdirSync(workDir, { recursive: true });
  writeFileSync(join(workDir, 'package.json'), JSON.stringify({ name: `${shapeKey}-fixture`, version: '1.0.0' }) + '\n');
  shapeDef.setup(workDir);
  // A temp cwd isolates the project, not the user: `uds init -y` writes user-level
  // files (~/.claude/skills, ~/.uds) wherever it runs. See scripts/lib/isolated-home.mjs.
  const iso = isolatedHome({ prefix: 'uds-footprint-home-' });
  try {
    execFileSync('node', [UDS_BIN, 'init', '-y', ...shapeDef.initArgs], {
      cwd: workDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: iso.env,
    });
  } finally {
    iso.cleanup();
  }
}

export function buildAndMeasureAllShapes() {
  if (!existsSync(UDS_BIN)) {
    throw Object.assign(new Error(`uds CLI not found at ${UDS_BIN}`), { code: 'CLI_MISSING' });
  }
  const tmpRoot = mkdtempSync(join(tmpdir(), 'uds-prompt-footprint-'));
  try {
    const result = {};
    for (const [shapeKey, shapeDef] of Object.entries(SHAPES)) {
      const workDir = join(tmpRoot, shapeKey);
      buildFixture(shapeKey, shapeDef, workDir);
      result[shapeKey] = measureShapeFixture(shapeDef, workDir);
    }
    return result;
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true });
  }
}

// ── Self-test (extractor sanity — no CLI spawn, no network) ────────────────

export function runSelfTest() {
  let ok = true;
  const report = (label, pass) => {
    console.log(`  ${pass ? '✓' : '✗'} ${label}`);
    if (!pass) ok = false;
  };

  // extractUdsBlock: positive.
  const withMarkers = `before\n${UDS_MARKERS.start}\nMIDDLE\n${UDS_MARKERS.end}\nafter`;
  report('extractUdsBlock finds content between real markers', extractUdsBlock(withMarkers).includes('MIDDLE'));

  // extractUdsBlock: negative — a file that merely mentions the marker text
  // in prose must not be mistaken for having a block (mirrors
  // integration-generator.js's own real-marker-vs-mention distinction, in
  // this script's simplified form).
  const noMarkers = 'This file talks about UDS:STANDARDS:START but has no real markers.';
  report('extractUdsBlock returns null with no real marker pair', extractUdsBlock(noMarkers) === null);

  // extractSkillDescription: positive — the block-scalar form every shipped
  // skill actually uses.
  const skillMd = '---\nname: demo\ndescription: |\n  First line of the description.\n  Second line.\nallowed-tools: Read\n---\n\nbody';
  const desc = extractSkillDescription(skillMd);
  report('extractSkillDescription captures a block-scalar description', desc.includes('First line') && desc.includes('Second line') && !desc.includes('allowed-tools'));

  // extractSkillDescription: negative — no frontmatter at all.
  report('extractSkillDescription returns empty string with no frontmatter', extractSkillDescription('# just a heading\n\nno frontmatter here') === '');

  // stopHookMessageTokens: deterministic and positive.
  const t1 = stopHookMessageTokens();
  const t2 = stopHookMessageTokens();
  report('stopHookMessageTokens is deterministic and positive', t1 === t2 && t1 > 0);

  // compareShapeToBaseline: growth without a raised ceiling must fail, and
  // raising the ceiling (the only escape hatch) must then pass.
  const baselineEntry = { ceiling: 100, absoluteMax: 1000, skillRawCeiling: 100, skillRawAbsoluteMax: 1000 };
  const grown = compareShapeToBaseline('x', { total: 200, skillTokensRaw: 0 }, baselineEntry);
  const raised = compareShapeToBaseline('x', { total: 200, skillTokensRaw: 0 }, { ...baselineEntry, ceiling: 250 });
  report('compareShapeToBaseline fails growth against an unraised ceiling', grown.ok === false);
  report('compareShapeToBaseline passes once the ceiling is raised to cover it', raised.ok === true);

  // The absolute cap cannot be defeated merely by raising the ceiling past it.
  const overCap = compareShapeToBaseline('x', { total: 200, skillTokensRaw: 0 }, { ...baselineEntry, ceiling: 1500 });
  report('compareShapeToBaseline rejects a ceiling raised past the absolute cap', overCap.ok === false && overCap.code === 'ceiling-exceeds-absolute-max');

  // The raw-skill dimension can fail even when total is fine (the blind
  // spot this dimension exists to close — see compareShapeToBaseline's own
  // comment).
  const skillGrown = compareShapeToBaseline('x', { total: 50, skillTokensRaw: 200 }, baselineEntry);
  report('compareShapeToBaseline fails on raw skill growth even when total is under its own ceiling', skillGrown.ok === false && skillGrown.code === 'exceeds-ceiling');

  return ok;
}

// ── CLI entry point ─────────────────────────────────────────────────────────

async function main() {
  const arg = process.argv[2];

  if (arg === '--self-test') {
    console.log('[prompt-footprint] self-test');
    const passed = runSelfTest();
    process.exit(passed ? 0 : 1);
  }

  console.log('[prompt-footprint] Building and measuring the three DEC-117 shapes...');
  let currentByShape;
  try {
    currentByShape = buildAndMeasureAllShapes();
  } catch (e) {
    console.error(`[prompt-footprint] ✗ could not measure: ${e && e.message ? e.message : e}`);
    process.exit(2);
  }

  const baseline = loadBaseline();
  if (!baseline || !baseline.shapes) {
    console.error(`[prompt-footprint] ✗ could not load a usable baseline from ${BASELINE_PATH}`);
    process.exit(2);
  }

  console.log('');
  for (const [shapeKey, m] of Object.entries(currentByShape)) {
    const label = SHAPES[shapeKey]?.label || shapeKey;
    console.log(`  ${shapeKey} — ${label}`);
    console.log(`    CLAUDE.md/AGENTS.md block: ${m.mdBlockTokens} tokens`);
    console.log(`    Stop hook message:         ${m.stopHookTokens} tokens`);
    console.log(`    Skill descriptions:        ${m.skillTokensEffective} tokens` +
      (m.skillCapApplied ? ` (capped from ${m.skillTokensRaw} raw, ${m.skillCount} skills)` : ` (raw, ${m.skillCount} skills)`));
    console.log(`    TOTAL:                     ${m.total} tokens`);
  }
  console.log('');

  const { ok, results } = compareToBaseline(currentByShape, baseline);
  for (const r of results) {
    if (r.ok) {
      console.log(`  ✓ ${r.shape}: ${r.current} ≤ ceiling ${r.ceiling}`);
    } else if (r.code === 'no-baseline-entry') {
      console.error(`  ✗ ${r.message}`);
    } else {
      console.error(`  ✗ ${r.message}`);
    }
  }

  if (!ok) {
    const hardFail = results.some((r) => !r.ok && r.code === 'no-baseline-entry');
    process.exit(hardFail ? 2 : 1);
  }
  console.log('');
  console.log('[prompt-footprint] ✓ all shapes at or under their committed ceiling.');
  process.exit(0);
}

// pathToFileURL().href (not a hand-built `file://${...}` template — see
// scripts/hooks/turn-completion/engine.mjs's own comment on this exact
// mistake) — on Windows a hand-built template produces `file://C:\...`,
// which never equals import.meta.url's `file:///C:/...`, silently skipping
// main() (exit 0, nothing printed, run_check reports a false ✓).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
