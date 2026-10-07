// XSPEC-459 (dev-platform cross-project/specs/XSPEC-459-owt-not-yet-asked-and-unobservable-facts.md):
// open-work-tracking 1.2.0 adds OWT-020/021/022 (a waiting item says whether it was asked: `not-yet-asked`
// or `asked-awaiting`) and OWT-023/024/025/026 (a hand-written row about a fact the assistant cannot observe
// carries observed-by and observed-at; its value is yes, no or unknown; unknown and stale are counted apart).
// `uds open-work waiting` and `uds open-work observations` are the reference decision procedures.
//
// What this file proves that the end-to-end tests (tests/e2e/xspec-459-*.test.js) do not:
//   1. OWT-015 — every new check has been observed RED. The mutation block edits the SOURCE TEXT of a copy of
//      cli/src/utils/open-work-tracking.mjs (always-pass, one arm off), runs the mutant as a real subprocess,
//      and requires the declared cases to go red. A replacement that does not match exactly once fails, so a
//      mutation that silently did nothing cannot pass for one that worked.
//   2. AC-2 — the checker's OWN self-test goes red when a mutant removes the detection of a red sample. The
//      mutants in the first block have their self-test neutralised (otherwise it would catch them first and hide
//      whether the case assertions could); here they run WITHOUT that.
//   3. AC-3 — the three checks that existed in 1.1.0 print exactly what they printed, to the byte, on a fixed
//      set of carriers (cli/tests/fixtures/open-work-tracking/baseline-1.1.0-golden.json, captured from the
//      1.1.0 module before this change). Chinese-header tables included: next-action's behaviour on them is
//      an open question in the spec (OQ1) and is deliberately not touched.
//
// Every fixture is built under mkdtempSync(join(tmpdir(), ...)); nothing is written into the repo.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

import {
  checkWaiting,
  checkObservations,
  classifyState,
  classifyValue,
  parseDay,
  extractRecords,
  runSelfTest,
} from '../../../src/utils/open-work-tracking.mjs';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..', '..');
const SCRIPT = join(REPO_ROOT, 'cli', 'src', 'utils', 'open-work-tracking.mjs');
const GOLDEN = join(REPO_ROOT, 'cli', 'tests', 'fixtures', 'open-work-tracking', 'baseline-1.1.0-golden.json');

let dir;
beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'uds-owt-states-')); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

const w = (name, content) => {
  const p = join(dir, name);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
  return p;
};

function run(script, args, cwd = dir) {
  const r = spawnSync('node', [script, ...args], { encoding: 'utf8', cwd });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

// ── fixtures ────────────────────────────────────────────────────────────────

const NOW = ['--now', '2026-10-07'];
const WH = '| item | status | draft | asked-at | waiting for | release |\n|---|---|---|---|---|---|\n';
const OH = '| fact | status | observed-by | observed-at | value |\n|---|---|---|---|---|\n';

const waiting = (name, rows, extra = []) => ['waiting', w(name, WH + rows), ...NOW, ...extra];
const observed = (name, rows, extra = []) => ['observations', w(name, OH + rows), ...NOW, ...extra];

// ── the case table shared by the real script and every mutant ───────────────
// Each case builds its own fixtures and states what the REAL script must do.

const CASES = {
  // ── waiting: OWT-020 / 021 / 022 ──
  'waiting: a waiting item that says nothing about being asked is named': {
    args: () => waiting('w1.md', '| ask board | waiting | | | | |\n'), code: 1,
    out: /VIOLATION OWT-020: .*row "ask board"\) is waiting but does not say whether it has been asked/,
  },
  'waiting: not-yet-asked with a draft path passes and is counted': {
    args: () => waiting('w2.md', '| ask legal | not-yet-asked | drafts/legal.md | | | |\n'), code: 0,
    out: /not-yet-asked=1 asked-awaiting=0 waiting-unspecified=0/, notOut: /VIOLATION/,
  },
  'waiting: not-yet-asked that names no draft or action is a violation': {
    args: () => waiting('w3.md', '| ask legal | not-yet-asked | an email | | | |\n'), code: 1,
    out: /VIOLATION OWT-021: .*row "ask legal"\) is not-yet-asked but names no draft or action/,
  },
  'waiting: asked-awaiting with no asked-at is a violation': {
    args: () => waiting('w4.md', '| ask vendor | asked-awaiting | | | the quote | the reply arrives |\n'), code: 1,
    out: /VIOLATION OWT-022: .*row "ask vendor"\) is asked-awaiting but has no asked-at/,
  },
  'waiting: asked-awaiting that does not say what releases it is a violation (OWT-002)': {
    args: () => waiting('w5.md', '| ask vendor | asked-awaiting | | 2026-10-01 | the quote | |\n'), code: 1,
    out: /VIOLATION OWT-022: .*row "ask vendor"\) is asked-awaiting but does not state what event releases it \(OWT-002\)/,
  },
  'waiting: a complete asked-awaiting passes and shows how long ago it was asked': {
    args: () => waiting('w6.md', '| ask vendor | asked-awaiting | | 2026-10-01 | the quote | the reply arrives |\n'), code: 0,
    out: /asked-awaiting=1[\s\S]*\(asked 6d ago\)/, notOut: /VIOLATION/,
  },
  'waiting: Chinese state words and Chinese field names are read': {
    args: () => ['waiting', w('w7.md', '| 事項 | 狀態 | 草稿 | 詢問時間 | 等什麼 | 解除條件 |\n|---|---|---|---|---|---|\n| 問法務 | 還沒問 | drafts/legal.md | | | |\n| 問廠商 | 已問、等回覆 | | 2026-10-01 | 報價 | 回信到達 |\n'), ...NOW], code: 0,
    out: /not-yet-asked=1 asked-awaiting=1/, notOut: /VIOLATION/,
  },
  'waiting: a Chinese waiting word with no ask-state is named': {
    args: () => ['waiting', w('w8.md', '| 事項 | 狀態 |\n|---|---|\n| 問董事會 | 等待中 |\n'), ...NOW], code: 1,
    out: /VIOLATION OWT-020: .*row "問董事會"\)/,
  },
  'waiting: list items with status labels are read as records': {
    args: () => ['waiting', w('w9.md', '# Log\n\n- Ask the auditor\n  - status: asked-awaiting\n  - asked-at: 2026-10-02\n  - waiting for: the memo\n  - release: the memo is attached\n- Ask legal\n  - status: blocked on legal\n'), ...NOW], code: 1,
    out: /list item \(line 8, "Ask legal"\) is waiting but does not say whether it has been asked/,
  },
  'waiting: a done item is not waiting': {
    args: () => waiting('w10.md', '| ship it | done | | | | |\n'), code: 0,
    out: /done=1/, notOut: /VIOLATION/,
  },
  'waiting: no record with a status field is exit 2, not a pass': {
    args: () => ['waiting', w('w11.md', '# Notes\n\nnothing here\n')], code: 2, out: /CANNOT DECIDE: no record with a status field/,
  },
  'waiting: an asked-at later than today is a violation': {
    args: () => waiting('w12.md', '| ask vendor | asked-awaiting | | 2099-01-01 | the quote | the reply arrives |\n'), code: 1,
    out: /has an asked-at \(2099-01-01\) later than today \(2026-10-07\)/,
  },
  'waiting: an asked-at that is not a dated day is a violation': {
    args: () => waiting('w13.md', '| ask vendor | asked-awaiting | | last week | the quote | the reply arrives |\n'), code: 1,
    out: /has an asked-at that is not a date with a year: "last week"/,
  },
  'waiting: a ragged row is undecidable, not empty: exit 2 when nothing else is wrong': {
    args: () => ['waiting', w('w14.md', `${WH}| a | not-yet-asked | drafts/a.md | | | |\n| b | waiting |\n`), ...NOW], code: 2,
    out: /UNDECIDABLE: .*row "b"\) has 2 cell\(s\) but its header has 6[\s\S]*CANNOT DECIDE/,
  },
  'waiting: a --now that is not a date is exit 2': {
    args: () => ['waiting', w('w15.md', `${WH}| a | not-yet-asked | drafts/a.md | | | |\n`), '--now', 'soon'], code: 2, out: /--now must be a date with a year/,
  },
  'waiting: says its coverage is unknown and its vocabulary uncalibrated': {
    args: () => waiting('w16.md', '| a | not-yet-asked | drafts/a.md | | | |\n'), code: 0,
    out: /COVERAGE UNKNOWN \(OWT-011\)[\s\S]*UNCALIBRATED \(OWT-016\)/,
  },
  // ── observations: OWT-023 / 024 / 025 / 026 ──
  'observations: no observed-by is a violation': {
    args: () => observed('o1.md', '| mail sent | open | | 2026-10-05 | yes |\n'), code: 1,
    out: /VIOLATION OWT-023: .*row "mail sent"\) has no observed-by/,
  },
  'observations: no observed-at is a violation': {
    args: () => observed('o2.md', '| mail sent | open | albert | | yes |\n'), code: 1,
    out: /VIOLATION OWT-023: .*row "mail sent"\) has no observed-at/,
  },
  'observations: a value outside yes, no and unknown is a violation': {
    args: () => observed('o3.md', '| mail sent | open | albert | 2026-10-05 | maybe |\n'), code: 1,
    out: /VIOLATION OWT-023: .*has no value of yes, no or unknown \(found "maybe"\)/,
  },
  'observations: a complete fresh yes is confirmed and its age is shown': {
    args: () => observed('o4.md', '| mail sent | open | albert | 2026-10-05 | yes |\n'), code: 0,
    out: /yes=1 no=0 unknown=0 invalid=0 \| stale=0 \| confirmed=1 [\s\S]*value=yes age=2d by=albert at=2026-10-05/, notOut: /VIOLATION/,
  },
  'observations: unknown is counted apart, listed, and never confirmed': {
    args: () => observed('o5.md', '| approved | open | albert | 2026-10-05 | unknown |\n'), code: 0,
    out: /yes=0 no=0 unknown=1 invalid=0 \| stale=0 \| confirmed=0 [\s\S]*UNKNOWN \(counted apart, never complete\): .*row "approved"/, notOut: /VIOLATION/,
  },
  'observations: an unknown marked done is a violation': {
    args: () => observed('o6.md', '| approved | done | albert | 2026-10-05 | unknown |\n'), code: 1,
    out: /VIOLATION OWT-024: .*row "approved"\) is marked done while its observation is unknown/,
  },
  'observations: an observation older than the threshold is stale, counted apart and not confirmed': {
    args: () => observed('o7.md', '| mail sent | open | albert | 2026-09-01 | yes |\n'), code: 0,
    out: /yes=1 [^\n]*stale=1 \| confirmed=0 [\s\S]*STALE \(observed 36d ago, older than 7d; counted apart, not confirmed\)/, notOut: /VIOLATION/,
  },
  'observations: the stale threshold is a declared number': {
    args: () => observed('o8.md', '| mail sent | open | albert | 2026-09-01 | yes |\n', ['--stale-after', '60']), code: 0,
    out: /stale=0 \| confirmed=1 /, notOut: /STALE/,
  },
  'observations: a stale observation under a done item says so': {
    args: () => observed('o9.md', '| mail sent | done | albert | 2026-09-01 | yes |\n'), code: 0,
    out: /STALE \([^)]*the item claims done on this observation\)/,
  },
  'observations: a hand-written fact that version control determines is a violation': {
    args: () => observed('o10.md', '| PR merged | open | albert | 2026-10-05 | yes |\n'), code: 1,
    out: /VIOLATION OWT-026: .*row "PR merged"\)/,
  },
  'observations: an observed-at later than today is a violation': {
    args: () => observed('o11.md', '| mail sent | open | albert | 2026-10-09 | yes |\n'), code: 1,
    out: /has an observed-at \(2026-10-09\) later than today \(2026-10-07\)/,
  },
  'observations: Chinese column names and values are read': {
    args: () => ['observations', w('o12.md', '| 事實 | 觀察者 | 觀察時間 | 值 |\n|---|---|---|---|\n| 法務已回覆 | 阿明 | 2026-10-06 | 未知 |\n| 信已寄出 | 阿明 | 2026-10-06 | 是 |\n'), ...NOW], code: 0,
    out: /yes=1 no=0 unknown=1 invalid=0 \| stale=0 \| confirmed=1 /, notOut: /VIOLATION/,
  },
  'observations: list items with observed-by and observed-at labels are read': {
    args: () => ['observations', w('o13.md', '# Log\n\n- Is the fee waived\n  - observed-by: albert\n  - observed-at: 2026-10-06\n  - value: unknown\n- Did legal reply\n  - observed-at: 2026-10-06\n  - value: yes\n'), ...NOW], code: 1,
    out: /unknown=1[\s\S]*VIOLATION OWT-023: .*list item \(line 7, "Did legal reply"\) has no observed-by/,
  },
  'observations: a table with neither an observed-by nor an observed-at column is not read: exit 2, not a pass': {
    args: () => ['observations', w('o14.md', '| fact | value |\n|---|---|\n| mail sent | yes |\n'), ...NOW], code: 2, out: /CANNOT DECIDE: no observation record/,
  },
  'observations: a --stale-after that is not a number is exit 2': {
    args: () => observed('o15.md', '| mail sent | open | albert | 2026-10-05 | yes |\n', ['--stale-after', 'soon']), code: 2, out: /--stale-after must be a number of days/,
  },
  'observations: says what it cannot decide, its coverage, and its uncalibrated vocabulary': {
    args: () => observed('o16.md', '| mail sent | open | albert | 2026-10-05 | yes |\n'), code: 0,
    out: /LIMIT: [^\n]*cannot decide that an observation is true[\s\S]*COVERAGE UNKNOWN \(OWT-011\)[\s\S]*UNCALIBRATED \(OWT-016\)/,
  },
};

function assertCase(r, c) {
  expect(r.status).toBe(c.code);
  if (c.out) expect(r.out).toMatch(c.out);
  if (c.notOut) expect(r.out).not.toMatch(c.notOut);
}

describe('the new checks behave as declared on the real script', () => {
  it('passes its own self-test arms, now including OWT-020 to OWT-026', () => {
    expect(runSelfTest()).toEqual({ ok: true, failures: [] });
    expect(run(SCRIPT, ['--self-test']).status).toBe(0);
  });

  it('every case in the table behaves as declared', () => {
    for (const [name, c] of Object.entries(CASES)) {
      const r = run(SCRIPT, c.args());
      try { assertCase(r, c); } catch (e) { throw new Error(`case "${name}": ${e.message}`); }
    }
  });
});

describe('the rules, as functions', () => {
  it('classifyState reads the structural state of a status cell, not a sentence', () => {
    expect(classifyState('not-yet-asked')).toBe('not-yet-asked');
    expect(classifyState('**還沒問**')).toBe('not-yet-asked');
    expect(classifyState('asked, awaiting reply')).toBe('asked-awaiting');
    expect(classifyState('已問、等回覆')).toBe('asked-awaiting');
    expect(classifyState('waiting on legal')).toBe('waiting-unspecified');
    expect(classifyState('done')).toBe('done');
    expect(classifyState('尚未完成')).not.toBe('done');
    expect(classifyState('done except the last step')).not.toBe('done');
    expect(classifyState('in progress')).toBe('other');
  });

  it('classifyValue: yes, no and unknown are the whole domain, and unknown is a value, not a blank', () => {
    expect(classifyValue('Yes')).toBe('yes');
    expect(classifyValue('否')).toBe('no');
    expect(classifyValue('unknown')).toBe('unknown');
    expect(classifyValue('?')).toBe('unknown');
    expect(classifyValue('')).toBeNull();
    expect(classifyValue('maybe')).toBeNull();
  });

  it('parseDay needs a year and a real calendar day; time of day is ignored', () => {
    expect(parseDay('2026-10-07')).toBe(Date.UTC(2026, 9, 7));
    expect(parseDay('2026/10/7 14:30')).toBe(Date.UTC(2026, 9, 7));
    expect(parseDay('2026年10月7日')).toBe(Date.UTC(2026, 9, 7));
    expect(parseDay('10-07')).toBeNull();
    expect(parseDay('2026-02-31')).toBeNull();
    expect(parseDay('')).toBeNull();
  });

  it('time is injected: the same carrier gives a different age on a different day, and never reads the clock', () => {
    const carrier = [{ path: 'o.md', content: OH + '| mail sent | open | albert | 2026-10-05 | yes |\n' }];
    expect(checkObservations(carrier, { now: Date.UTC(2026, 9, 7) }).detail[0].age).toBe(2);
    expect(checkObservations(carrier, { now: Date.UTC(2026, 9, 20) }).detail[0].age).toBe(15);
    expect(checkObservations(carrier, { now: Date.UTC(2026, 9, 20) }).stale).toHaveLength(1);
  });

  it('a waiting item in neither named state is its own count and never part of done', () => {
    const r = checkWaiting([{ path: 'w.md', content: `${WH}| a | waiting | | | | |\n| b | done | | | | |\n` }], { now: Date.UTC(2026, 9, 7) });
    expect(r.counts['waiting-unspecified']).toBe(1);
    expect(r.counts.done).toBe(1);
    expect(r.violations.map((v) => v.rule)).toEqual(['OWT-020']);
  });

  it('extractRecords reads a table row through its header and never by column position', () => {
    const { records } = extractRecords('| asked-at | item | status |\n|---|---|---|\n| 2026-10-01 | a | asked-awaiting |\n');
    expect(records).toHaveLength(1);
    expect(records[0].f.status).toBe('asked-awaiting');
    expect(records[0].f.askedAt).toBe('2026-10-01');
  });
});

// ── AC-3: what 1.1.0 printed, 1.2.0 prints ──────────────────────────────────

describe('regression: next-action, revision and separation print exactly what 1.1.0 printed', () => {
  const golden = JSON.parse(readFileSync(GOLDEN, 'utf8'));

  it('the golden file holds a real spread of carriers, including the cases that exit 2', () => {
    expect(golden.cases.length).toBeGreaterThanOrEqual(20);
    expect(new Set(golden.cases.map((c) => c.status))).toEqual(new Set([0, 1, 2]));
    expect(golden.cases.some((c) => /Chinese table/.test(c.name))).toBe(true);
  });

  // XSPEC-461 R3 changed exactly one thing in these outputs: when no carrier has a next-action field (exit 2),
  // the text now goes on to say what each carrier showed and which words are recognised. Everything 1.1.0 printed
  // is still there, byte for byte, as the beginning of the output, and the exit code is unchanged. Every other
  // case, including every exit 0 and exit 1 one, is compared whole.
  const EXPLAINED = (c) => c.status === 2 && c.args[0] === 'next-action' && c.out.includes('CANNOT DECIDE: no next-action field found');

  it('exactly the two next-action cases that found no field at all are the ones whose output grew (the 461 explanation)', () => {
    expect(golden.cases.filter(EXPLAINED).map((c) => c.name)).toEqual(['next-action: a table with no next-action header (exit 2)', 'next-action: no structure (exit 2)']);
  });

  it.each(golden.cases.map((c) => [c.name, c]))('%s', (_n, c) => {
    for (const [name, content] of Object.entries(golden.files)) w(name, content);
    const r = run(SCRIPT, c.args);
    expect(r.status, c.name).toBe(c.status);
    // XSPEC-461 R6 ADDED lines to next-action (which root a path is looked up under, and the split of named-unresolved).
    // They are taken out before comparing, so the comparison is still the whole of what 1.1.0 printed, byte for byte; a
    // line this filter removes that is not one of the two added kinds would leave the comparison red.
    const withoutAdded = (text) => text.split('\n').filter((l) => !/^\[owt\]   of the named-unresolved \(\d+\): path-missing=\d+ not-resolvable=\d+$/.test(l) && !/^\[owt\] RESOLUTION: /.test(l)).join('\n');
    if (c.args[0] === 'next-action') {
      expect(r.out.split('\n').filter((l) => /RESOLUTION: |of the named-unresolved/.test(l)).length, `${c.name}: next-action adds the resolution lines`).toBeGreaterThanOrEqual(2);
    } else {
      expect(withoutAdded(r.out), `${c.name}: other commands print no added lines`).toBe(r.out);
    }
    r.out = withoutAdded(r.out);
    if (EXPLAINED(c)) {
      expect(r.out.startsWith(c.out), `${c.name}: what 1.1.0 printed is still the beginning of the output`).toBe(true);
      expect(r.out.slice(c.out.length), c.name).toMatch(/^\[owt\] WHY: no carrier had a next-action field/);
    } else {
      expect(r.out, c.name).toBe(c.out);
    }
  });
});

// ── OWT-015: the new checks have been observed red ──────────────────────────
// [from, to] pairs applied to the script's source text. Each `from` must occur exactly once.
// `red` lists the cases that MUST go red under that mutant. `arm` (optional) is text the checker's own
// self-test must print when the mutant keeps its self-test arms: AC-2.

const NEUTRALISE_SELF_TEST = ['const selfTest = runSelfTest();', 'const selfTest = { ok: true, failures: [] };'];

const MUTANTS = [
  { name: 'OWT-020 never names an unspecified waiting item', edits: [["const unspecified = state === 'waiting-unspecified';", 'const unspecified = false;']], red: ['waiting: a waiting item that says nothing about being asked is named', 'waiting: a Chinese waiting word with no ask-state is named', 'waiting: list items with status labels are read as records'], arm: 'OWT-020 violating' },
  { name: 'OWT-020 never recognises not-yet-asked', edits: [["if (VOCAB_STATE.notYetAsked.test(t)) return 'not-yet-asked';", '']], red: ['waiting: not-yet-asked with a draft path passes and is counted', 'waiting: Chinese state words and Chinese field names are read'], arm: 'OWT-020 clean' },
  { name: 'OWT-020 never recognises asked-awaiting', edits: [["if (VOCAB_STATE.askedAwaiting.test(t)) return 'asked-awaiting';", '']], red: ['waiting: a complete asked-awaiting passes and shows how long ago it was asked', 'waiting: asked-awaiting with no asked-at is a violation'], arm: 'OWT-020 clean' },
  { name: 'OWT-021 accepts a draft that names nothing', edits: [["const named = classifyNextAction(`${r.f.draft ?? ''} ${r.f.status}`, { root: opts.root, idPattern: opts.idPattern, extraCommands: opts.extraCommands }).status !== 'unnamed';", 'const named = true;']], red: ['waiting: not-yet-asked that names no draft or action is a violation'], arm: 'OWT-021 violating' },
  { name: 'OWT-021 rejects every draft', edits: [["const named = classifyNextAction(`${r.f.draft ?? ''} ${r.f.status}`, { root: opts.root, idPattern: opts.idPattern, extraCommands: opts.extraCommands }).status !== 'unnamed';", 'const named = false;']], red: ['waiting: not-yet-asked with a draft path passes and is counted'], arm: 'OWT-021 clean' },
  { name: 'OWT-022 does not require asked-at', edits: [["if (day === null) bad('OWT-022', r.f.askedAt === undefined", "if (false) bad('OWT-022', r.f.askedAt === undefined"]], red: ['waiting: asked-awaiting with no asked-at is a violation', 'waiting: an asked-at that is not a dated day is a violation'], arm: 'OWT-022 violating: asked-awaiting has no asked-at' },
  { name: 'OWT-022 does not require what it waits for and its release', edits: [['if (!(hasWhat && hasRelease)) bad(', 'if (false) bad(']], red: ['waiting: asked-awaiting that does not say what releases it is a violation (OWT-002)'], arm: 'OWT-022 violating: asked-awaiting does not say' },
  { name: 'OWT-022 does not look at the future', edits: [['else if (day > now) bad(', 'else if (false) bad(']], red: ['waiting: an asked-at later than today is a violation'] },
  { name: 'OWT-023 does not require observed-by', edits: [['if (by === undefined || BLANK_FIELD.test(by)) fail(', 'if (false) fail(']], red: ['observations: no observed-by is a violation', 'observations: list items with observed-by and observed-at labels are read'], arm: 'OWT-023 violating: an observation with no observed-by' },
  { name: 'OWT-023 does not require observed-at', edits: [["if (day === null) fail('OWT-023'", "if (false) fail('OWT-023'"]], red: ['observations: no observed-at is a violation'], arm: 'OWT-023 violating: an observation with no observed-at' },
  { name: 'OWT-023 does not look at the future', edits: [['else if (day > now) fail(', 'else if (false) fail(']], red: ['observations: an observed-at later than today is a violation'] },
  { name: 'OWT-023 accepts any value', edits: [["if (value === null) fail('OWT-023'", "if (false) fail('OWT-023'"]], red: ['observations: a value outside yes, no and unknown is a violation'], arm: 'OWT-023 violating: a value outside' },
  { name: 'OWT-024 lets an unknown be marked done', edits: [["if (claimsDone) bad('OWT-024'", "if (false) bad('OWT-024'"]], red: ['observations: an unknown marked done is a violation'], arm: 'OWT-024 violating: unknown marked done' },
  { name: 'OWT-024 counts unknown as confirmed', edits: [["const confirmed = wellFormed && value === 'yes' && !isStale;", "const confirmed = wellFormed && (value === 'yes' || value === 'unknown') && !isStale;"]], red: ['observations: unknown is counted apart, listed, and never confirmed'], arm: 'OWT-024 violating: unknown is counted apart' },
  { name: 'OWT-024 does not list unknown apart', edits: [['for (const u of res.unknown) say(', 'for (const u of []) say(']], red: ['observations: unknown is counted apart, listed, and never confirmed'] },
  { name: 'OWT-025 never finds an observation stale', edits: [['const isStale = age !== null && age > staleAfter;', 'const isStale = false;']], red: ['observations: an observation older than the threshold is stale, counted apart and not confirmed', 'observations: a stale observation under a done item says so'], arm: 'OWT-025 violating' },
  { name: 'OWT-025 finds every observation stale', edits: [['const isStale = age !== null && age > staleAfter;', 'const isStale = age !== null;']], red: ['observations: a complete fresh yes is confirmed and its age is shown', 'observations: the stale threshold is a declared number'], arm: 'OWT-025 clean' },
  { name: 'OWT-025 does not list the stale ones', edits: [['for (const s of res.stale) say(', 'for (const s of []) say(']], red: ['observations: an observation older than the threshold is stale, counted apart and not confirmed'] },
  { name: 'OWT-025 does not show the age', edits: [['value: value ?? \'?\', age,', "value: value ?? '?', age: null,"]], red: ['observations: a complete fresh yes is confirmed and its age is shown'] },
  { name: 'OWT-026 lets the exception reach a derivable fact', edits: [['if (VOCAB_STATE.derivable.test(subject)) fail(', 'if (false) fail(']], red: ['observations: a hand-written fact that version control determines is a violation'], arm: 'OWT-026 violating' },
  { name: 'OWT-026 forbids every fact', edits: [['if (VOCAB_STATE.derivable.test(subject)) fail(', 'if (true) fail(']], red: ['observations: a complete fresh yes is confirmed and its age is shown'], arm: 'OWT-026 clean' },
  { name: 'waiting: no record read as a pass', edits: [["if (res.walked === 0) { say('[owt] CANNOT DECIDE: no record with a status", "if (false) { say('[owt] CANNOT DECIDE: no record with a status"]], red: ['waiting: no record with a status field is exit 2, not a pass'] },
  { name: 'observations: no record read as a pass', edits: [["if (res.walked === 0) { say('[owt] CANNOT DECIDE: no observation record", "if (false) { say('[owt] CANNOT DECIDE: no observation record"]], red: ['observations: a table with neither an observed-by nor an observed-at column is not read: exit 2, not a pass'] },
];

function makeMutant(edits, { neutralise = true } = {}) {
  let src = readFileSync(SCRIPT, 'utf8');
  const all = neutralise ? [NEUTRALISE_SELF_TEST, ...edits] : edits;
  for (const [from, to] of all) {
    const n = src.split(from).length - 1;
    if (n !== 1) throw new Error(`mutation did not apply exactly once (${n}x): ${from.slice(0, 80)}`);
    src = src.replace(from, () => to);
  }
  const p = join(dir, `mutant-${Math.random().toString(36).slice(2)}.mjs`);
  writeFileSync(p, src);
  return p;
}

function redCasesUnder(mutantPath) {
  const red = [];
  for (const [name, c] of Object.entries(CASES)) {
    const r = run(mutantPath, c.args());
    try { assertCase(r, c); } catch { red.push(name); }
  }
  return red;
}

describe('OWT-015: the new checks have been observed red', () => {
  it.each(MUTANTS.map((m) => [m.name, m]))('mutant "%s" turns its declared cases red', (_n, m) => {
    const red = redCasesUnder(makeMutant(m.edits));
    if (process.env.OWT_MATRIX) console.info(`[owt-mutation] ${m.name} -> red: ${JSON.stringify(red)}`);
    expect(red.length, `the mutant "${m.name}" changed nothing any case can see`).toBeGreaterThan(0);
    for (const declared of m.red) expect(red, `declared case not red: ${declared}`).toContain(declared);
  });

  it.each(MUTANTS.filter((m) => m.arm).map((m) => [m.name, m]))('AC-2: the checker\'s own self-test goes red under mutant "%s"', (_n, m) => {
    const r = run(makeMutant(m.edits, { neutralise: false }), ['--self-test']);
    expect(r.status, r.out).toBe(2);
    expect(r.out).toMatch(/self-test FAILED/);
    expect(r.out).toContain(m.arm);
  });

  it('a mutant that keeps the self-test arms is stopped before it judges anything: exit 2, which is not a pass', () => {
    const p = makeMutant([["const unspecified = state === 'waiting-unspecified';", 'const unspecified = false;']], { neutralise: false });
    const r = run(p, waiting('stop.md', '| ask board | waiting | | | | |\n'));
    expect(r.status).toBe(2);
    expect(r.out).toMatch(/self-test arms failed/);
  });

  it('refuses a mutation that does not apply exactly once, so a no-op mutant cannot pass for a red one', () => {
    expect(() => makeMutant([['this text is not in the script', 'x']])).toThrow(/did not apply exactly once/);
  });
});
