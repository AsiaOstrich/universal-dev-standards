// DEC-117 D2/L2 (dev-platform cross-project/decisions/DEC-117-agent-harness-
// non-functional-regression-borrowing.md): a ratchet on the tokens UDS
// unconditionally injects into an adopter's agent context (CLAUDE.md/
// AGENTS.md's UDS block, the turn-completion-integrity Stop hook's block
// message, and skill descriptions). Growth is only allowed when the SAME
// commit also raises the committed ceiling in
// scripts/prompt-footprint-baseline.json — no other escape hatch exists,
// because compareShapeToBaseline()/compareToBaseline() accept no
// justification/changelog parameter at all.
//
// Most of these tests exercise the PURE functions in scripts/check-prompt-
// footprint.mjs directly, against synthetic fixtures built in a temp
// directory — no `uds init` spawn, no network, milliseconds each. The one
// exception is this file's last describe block, which DOES call
// buildAndMeasureAllShapes() (three real `uds init` runs against the CURRENT
// working tree) and load the actually-committed baseline file — see that
// block's own comment for why it exists despite being far slower than
// everything above it.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import {
  UDS_MARKERS,
  extractUdsBlock,
  extractSkillDescription,
  sumSkillDescriptionTokens,
  stopHookMessageTokens,
  CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS,
  effectiveSkillTokens,
  measureShapeFixture,
  compareShapeToBaseline,
  compareToBaseline,
  loadBaseline,
  runSelfTest,
  buildAndMeasureAllShapes,
} from '../../../../scripts/check-prompt-footprint.mjs';

describe('check-prompt-footprint: extractUdsBlock()', () => {
  it('returns the content strictly between real UDS markers', () => {
    const content = `before\n${UDS_MARKERS.start}\nMIDDLE TEXT\n${UDS_MARKERS.end}\nafter`;
    expect(extractUdsBlock(content)).toBe('\nMIDDLE TEXT\n');
  });

  it('returns null when only the start marker is present', () => {
    expect(extractUdsBlock(`text\n${UDS_MARKERS.start}\nunterminated`)).toBeNull();
  });

  it('returns null when the file merely mentions the marker text in prose', () => {
    const prose = 'See the UDS:STANDARDS:START marker documented elsewhere — no real block here.';
    expect(extractUdsBlock(prose)).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(extractUdsBlock(undefined)).toBeNull();
    expect(extractUdsBlock(null)).toBeNull();
  });
});

describe('check-prompt-footprint: extractSkillDescription()', () => {
  it('captures a multi-line block-scalar description and stops at the next frontmatter key', () => {
    const skillMd = [
      '---',
      'name: demo',
      'description: |',
      '  First line of the description.',
      '  Second line, still part of it.',
      'allowed-tools: Read, Bash(git:*)',
      '---',
      '',
      '# body, not part of the description',
    ].join('\n');
    const desc = extractSkillDescription(skillMd);
    expect(desc).toContain('First line of the description.');
    expect(desc).toContain('Second line, still part of it.');
    expect(desc).not.toContain('allowed-tools');
    expect(desc).not.toContain('body, not part of the description');
  });

  it('returns an empty string when there is no frontmatter at all', () => {
    expect(extractSkillDescription('# just a heading\n\nno frontmatter here')).toBe('');
  });

  it('returns an empty string when frontmatter has no description key', () => {
    const skillMd = '---\nname: demo\nallowed-tools: Read\n---\nbody';
    expect(extractSkillDescription(skillMd)).toBe('');
  });
});

describe('check-prompt-footprint: sumSkillDescriptionTokens()', () => {
  let dir;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'uds-prompt-footprint-skills-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('sums descriptions across every <name>/SKILL.md one level under dir', () => {
    for (const [name, desc] of [
      ['skill-a', 'Alpha description line.'],
      ['skill-b', 'Beta description line, a bit longer than alpha.'],
    ]) {
      mkdirSync(join(dir, name), { recursive: true });
      writeFileSync(join(dir, name, 'SKILL.md'), `---\nname: ${name}\ndescription: |\n  ${desc}\n---\nbody`);
    }
    const { count, tokens } = sumSkillDescriptionTokens(dir);
    expect(count).toBe(2);
    expect(tokens).toBeGreaterThan(0);
  });

  it('returns zero for a directory that does not exist', () => {
    expect(sumSkillDescriptionTokens(join(dir, 'does-not-exist'))).toEqual({ count: 0, tokens: 0 });
  });

  it('returns zero for null/undefined (no skills-capable tool selected)', () => {
    expect(sumSkillDescriptionTokens(null)).toEqual({ count: 0, tokens: 0 });
    expect(sumSkillDescriptionTokens(undefined)).toEqual({ count: 0, tokens: 0 });
  });

  it('ignores a directory entry that has no SKILL.md inside it', () => {
    mkdirSync(join(dir, 'not-a-skill'), { recursive: true });
    writeFileSync(join(dir, 'not-a-skill', 'README.md'), 'not a skill file');
    expect(sumSkillDescriptionTokens(dir)).toEqual({ count: 0, tokens: 0 });
  });
});

describe('check-prompt-footprint: stopHookMessageTokens()', () => {
  it('is deterministic and positive', () => {
    expect(stopHookMessageTokens()).toBe(stopHookMessageTokens());
    expect(stopHookMessageTokens()).toBeGreaterThan(0);
  });
});

describe('check-prompt-footprint: effectiveSkillTokens()', () => {
  it('caps raw tokens at CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS when the cap applies', () => {
    expect(effectiveSkillTokens(CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS + 500, true)).toBe(CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS);
  });

  it('passes raw tokens through unchanged when under the cap', () => {
    expect(effectiveSkillTokens(10, true)).toBe(10);
  });

  it('never caps when capApplies is false, even far above the cap constant', () => {
    expect(effectiveSkillTokens(CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS * 5, false)).toBe(CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS * 5);
  });
});

describe('check-prompt-footprint: measureShapeFixture() against a synthetic fixture', () => {
  let dir;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'uds-prompt-footprint-fixture-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('sums the UDS block across every declared file, plus the Stop hook message, plus (uncapped) skills', () => {
    writeFileSync(join(dir, 'CLAUDE.md'), `before\n${UDS_MARKERS.start}\nAAAA\n${UDS_MARKERS.end}\nafter`);
    writeFileSync(join(dir, 'AGENTS.md'), `before\n${UDS_MARKERS.start}\nBBBBBBBB\n${UDS_MARKERS.end}\nafter`);
    mkdirSync(join(dir, 'skills', 'one'), { recursive: true });
    writeFileSync(join(dir, 'skills', 'one', 'SKILL.md'), '---\nname: one\ndescription: |\n  A skill description.\n---\nbody');

    const shapeDef = {
      files: ['CLAUDE.md', 'AGENTS.md'],
      skillsSource: { kind: 'fixture-relative', path: 'skills' },
      capSkillTokens: false,
    };
    const m = measureShapeFixture(shapeDef, dir);
    expect(m.mdBlockTokens).toBeGreaterThan(0);
    expect(m.stopHookTokens).toBe(stopHookMessageTokens());
    expect(m.skillCount).toBe(1);
    expect(m.skillTokensEffective).toBe(m.skillTokensRaw);
    expect(m.total).toBe(m.mdBlockTokens + m.stopHookTokens + m.skillTokensEffective);
  });

  it('treats a declared file that is missing from the fixture as zero, not an error', () => {
    const shapeDef = { files: ['CLAUDE.md'], skillsSource: null, capSkillTokens: false };
    const m = measureShapeFixture(shapeDef, dir);
    expect(m.mdBlockTokens).toBe(0);
    expect(m.perFile['CLAUDE.md']).toBe(0);
  });

  it('applies the Claude Code skill budget cap when capSkillTokens is true', () => {
    mkdirSync(join(dir, 'skills', 'big'), { recursive: true });
    // A description long enough that estimateTokens() of it alone exceeds the cap.
    const longDesc = 'word '.repeat(CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS * 5);
    writeFileSync(join(dir, 'skills', 'big', 'SKILL.md'), `---\nname: big\ndescription: |\n  ${longDesc}\n---\nbody`);

    const shapeDef = { files: [], skillsSource: { kind: 'fixture-relative', path: 'skills' }, capSkillTokens: true };
    const m = measureShapeFixture(shapeDef, dir);
    expect(m.skillTokensRaw).toBeGreaterThan(CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS);
    expect(m.skillTokensEffective).toBe(CLAUDE_CODE_SKILL_BUDGET_CAP_TOKENS);
  });
});

// ── The DEC-117 D2/L2 ratchet's comparison logic (fast, pure, synthetic) ────
//
// A generous skillRaw pair on every baselineEntry below (skillRawCeiling/
// skillRawAbsoluteMax far above anything used) keeps these tests isolated to
// the `total` dimension they name — compareShapeToBaseline() checks BOTH
// dimensions (see its own header comment), and an unset skillRaw pair would
// itself read as "no usable baseline entry" and fail these tests for a
// reason unrelated to what each one is naming.

describe("check-prompt-footprint: compareShapeToBaseline()'s ratchet logic", () => {
  const withGenerousSkillRaw = (entry) => ({ skillRawCeiling: 1e9, skillRawAbsoluteMax: 1e9, ...entry });

  it('fails growth against an unraised ceiling, and passes once the ceiling is raised to cover it', () => {
    const baselineEntry = withGenerousSkillRaw({ ceiling: 1000, absoluteMax: 5000 });

    // The measured total grew past the committed ceiling (e.g. a new bullet
    // landed inside the CLAUDE.md/AGENTS.md UDS block, or a skill's
    // description got longer) — nothing has raised the baseline yet.
    const grownWithoutRaise = compareShapeToBaseline('demo-shape', { total: 1200, skillTokensRaw: 0 }, baselineEntry);
    expect(grownWithoutRaise.ok).toBe(false);
    expect(grownWithoutRaise.code).toBe('exceeds-ceiling');
    expect(grownWithoutRaise.message).toMatch(/raise scripts\/prompt-footprint-baseline\.json/);

    // The ONLY escape hatch: raise the SAME shape's ceiling, in the baseline
    // object itself, to at least cover the new total.
    const raisedBaseline = { ...baselineEntry, ceiling: 1200 };
    const grownWithRaise = compareShapeToBaseline('demo-shape', { total: 1200, skillTokensRaw: 0 }, raisedBaseline);
    expect(grownWithRaise.ok).toBe(true);

    // No growth at all always passes, regardless of the ceiling's exact value.
    const noGrowth = compareShapeToBaseline('demo-shape', { total: 900, skillTokensRaw: 0 }, baselineEntry);
    expect(noGrowth.ok).toBe(true);
  });

  it('provides no escape hatch other than raising the ceiling — an unrelated justification field changes nothing', () => {
    // compareShapeToBaseline()'s signature has no fourth parameter for a
    // reason/justification/changelog string, so there is no code path for a
    // caller to pass one through. This test proves the closest thing to a
    // loophole — extra, unrelated fields sitting on the baseline entry
    // itself (as if someone tried to smuggle a "documented in CHANGELOG"
    // flag into the JSON) — has zero effect on the verdict.
    const entryWithExtraFields = withGenerousSkillRaw({
      ceiling: 1000,
      absoluteMax: 5000,
      justification: 'documented in CHANGELOG, please allow',
      changelogNote: 'see [Unreleased] section',
    });
    const result = compareShapeToBaseline('demo-shape', { total: 1200, skillTokensRaw: 0 }, entryWithExtraFields);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('exceeds-ceiling');
  });

  it('rejects a shape with no usable baseline entry at all, as "could not measure", not a pass', () => {
    const m = { total: 100, skillTokensRaw: 0 };
    expect(compareShapeToBaseline('unknown-shape', m, undefined).ok).toBe(false);
    expect(compareShapeToBaseline('unknown-shape', m, {}).ok).toBe(false);
    expect(compareShapeToBaseline('unknown-shape', m, withGenerousSkillRaw({ ceiling: 100 })).ok).toBe(false); // missing absoluteMax
  });

  it('enforces the absolute cap independently — raising the ceiling past it does not pass', () => {
    // Even if someone edits the JSON to set ceiling far above the real
    // measured total (attempting to pre-empt future growth in one shot),
    // the absolute cap still catches it: a ceiling above absoluteMax marks
    // the baseline entry itself as invalid, regardless of what the current
    // measurement is.
    const overCapBaseline = withGenerousSkillRaw({ ceiling: 9000, absoluteMax: 5000 });
    const result = compareShapeToBaseline('demo-shape', { total: 100, skillTokensRaw: 0 }, overCapBaseline);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('ceiling-exceeds-absolute-max');
  });

  it('fails when the live measurement itself exceeds the absolute cap, even with ceiling raised to match', () => {
    const atCapBaseline = withGenerousSkillRaw({ ceiling: 5000, absoluteMax: 5000 });
    const result = compareShapeToBaseline('demo-shape', { total: 5001, skillTokensRaw: 0 }, atCapBaseline);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('exceeds-absolute-max');
  });

  it('fails on raw skill-description growth even when total is comfortably under its own ceiling (the Claude Code cap blind spot)', () => {
    // See compareShapeToBaseline()'s own header comment: once a shape's
    // effective skill tokens are capped, `total` alone cannot see further
    // skill-description growth. skillRawCeiling/skillRawAbsoluteMax exist
    // specifically to still catch it.
    const baselineEntry = { ceiling: 5000, absoluteMax: 9000, skillRawCeiling: 2000, skillRawAbsoluteMax: 4000 };
    const result = compareShapeToBaseline('demo-shape', { total: 3717, skillTokensRaw: 2500 }, baselineEntry);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('exceeds-ceiling');
    expect(result.skillRaw.ok).toBe(false);
    expect(result.total.ok).toBe(true);
  });

  it('compareToBaseline() judges every shape independently and never sums shapes together', () => {
    const current = {
      'shape-a': { total: 1100, skillTokensRaw: 0 },
      'shape-b': { total: 50, skillTokensRaw: 0 },
    };
    const baseline = {
      shapes: {
        'shape-a': withGenerousSkillRaw({ ceiling: 1000, absoluteMax: 5000 }), // shape-a grew past its own ceiling
        'shape-b': withGenerousSkillRaw({ ceiling: 10000, absoluteMax: 20000 }), // shape-b's huge headroom must not rescue shape-a
      },
    };
    const { ok, results } = compareToBaseline(current, baseline);
    expect(ok).toBe(false);
    const byShape = Object.fromEntries(results.map((r) => [r.shape, r.ok]));
    expect(byShape['shape-a']).toBe(false);
    expect(byShape['shape-b']).toBe(true);
  });
});

// ── The DEC-117 D2/L2 ratchet against the REAL generator and the REAL
//    committed baseline (this is what scripts/pre-release-check.sh's step
//    25 actually runs) ────────────────────────────────────────────────────
//
// Unlike every test above (synthetic numbers, no CLI spawn), this one calls
// buildAndMeasureAllShapes() — three real `node cli/bin/uds.js init` runs
// against whatever integration-generator.js, the turn-completion-integrity
// Stop hook, and skills/**/SKILL.md currently ARE in this working tree — and
// compares the result to the actually-committed scripts/prompt-footprint-
// baseline.json via loadBaseline() with no path argument. If a change to any
// of those three sources grew what gets injected without this same commit
// also raising the baseline, THIS is the test that goes red, for real,
// exercising the identical code path pre-release-check.sh's step 25 runs —
// not a simulation of it. Spawns three child processes, so it is slower than
// every other test in this file (seconds, not milliseconds) and carries a
// longer timeout; it earns its keep by being the one test that would have
// caught the reverse-validation mutation this ratchet's introducing commit
// performed and recorded by hand (see that commit's report — the mutation
// was reverted before commit, so this test cannot replay it without
// re-mutating cli/src/utils/integration-generator.js at runtime, which this
// test deliberately does not do: mutating shared source from inside a test
// that other parallel test files import is its own hazard).
describe('check-prompt-footprint: the DEC-117 D2/L2 ratchet against the real generator and the committed baseline', () => {
  it(
    'growth in the tokens UDS injects into an adopter fails the pre-release check unless the same commit raises the baseline',
    { timeout: 60_000 },
    () => {
      const currentByShape = buildAndMeasureAllShapes();
      const baseline = loadBaseline();
      expect(baseline, 'scripts/prompt-footprint-baseline.json must load — it is the committed ceiling this test enforces').not.toBeNull();

      const { ok, results } = compareToBaseline(currentByShape, baseline);
      const failures = results.filter((r) => !r.ok).map((r) => r.message).join('\n');
      expect(ok, failures || 'unexpected: ok=false but no failing result carried a message').toBe(true);
    }
  );
});

describe('check-prompt-footprint: loadBaseline()', () => {
  let dir;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'uds-prompt-footprint-baseline-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('returns null when the file does not exist', () => {
    expect(loadBaseline(join(dir, 'missing.json'))).toBeNull();
  });

  it('returns null when the file is not valid JSON', () => {
    const p = join(dir, 'broken.json');
    writeFileSync(p, '{ not valid json');
    expect(loadBaseline(p)).toBeNull();
  });

  it('parses a well-formed baseline file', () => {
    const p = join(dir, 'ok.json');
    writeFileSync(p, JSON.stringify({ shapes: { x: { ceiling: 1, absoluteMax: 2 } } }));
    expect(loadBaseline(p)).toEqual({ shapes: { x: { ceiling: 1, absoluteMax: 2 } } });
  });
});

describe('check-prompt-footprint: runSelfTest() (the script\'s own extractor sanity arm)', () => {
  it('passes against this repo\'s current source (both the positive and negative probes hold)', () => {
    // Captures console output so this test's own pass/fail output stays clean.
    const originalLog = console.log;
    console.log = () => {};
    try {
      expect(runSelfTest()).toBe(true);
    } finally {
      console.log = originalLog;
    }
  });
});
