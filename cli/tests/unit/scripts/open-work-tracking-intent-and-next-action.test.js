// DEC-122-L1 (dev-platform cross-project/decisions/DEC-122-work-continuity-
// intent-vs-progress-borrowing.md): open-work-tracking 1.1.0 adds OWT-017
// (intent apart from progress), OWT-018 (an edit to intent leaves a record;
// no approver -> listed at hand-back) and OWT-019 (a next action names an
// object). scripts/check-open-work-tracking.mjs is the reference decision
// procedure.
//
// Placement: DEC-122 named cli/tests/unit/standards/, a directory that does not
// exist. Every other test of a root scripts/ file lives in cli/tests/unit/
// scripts/, so this one does too.
//
// OWT-015 — "a check never observed red is not admissible evidence". The
// MUTATION block below does that observation on every run: it copies the
// script to a temp directory, edits its SOURCE TEXT to break one decision at a
// time (always-pass, always-fail, one recognition arm off), runs the mutant as
// a real subprocess, and requires the SAME assertions the real script passes
// to throw for the mutant. A replacement that does not match exactly once
// fails the test, so a mutation that silently did nothing cannot pass for one
// that worked. The mutant has its self-test arms neutralised, otherwise the
// self-test would catch it first and hide whether the case assertions could.
//
// Every fixture is built under mkdtempSync(join(tmpdir(), ...)); nothing is
// written into the repo.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  classifyNextAction,
  checkIntentRevision,
  checkSeparation,
  extractNextActions,
  revisionEntries,
  runSelfTest,
} from '../../../../scripts/check-open-work-tracking.mjs';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..', '..');
const SCRIPT = join(REPO_ROOT, 'scripts', 'check-open-work-tracking.mjs');

let dir;
beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'uds-owt-')); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

const w = (name, content) => {
  const p = join(dir, name);
  mkdirSync(join(p, '..'), { recursive: true });
  writeFileSync(p, content);
  return p;
};

function run(script, args, cwd) {
  const r = spawnSync('node', [script, ...args], { encoding: 'utf8', cwd });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

// ── fixtures ────────────────────────────────────────────────────────────────

const table = (rows) => `| Change | Approver | Reason |\n|---|---|---|\n${rows}`;
const spec = (ac, rev) => `# Spec\n\n## Acceptance criteria\n\n${ac}\n\n## Revisions\n\n${rev}\n`;
const V1 = spec('- the export finishes\n- the export is idempotent', table(''));
const V2_NO_RECORD = spec('- the export finishes\n- the export is idempotent\n- the export logs its row count', table(''));
const V2_NO_APPROVER = spec('- the export finishes\n- the export is idempotent\n- the export logs its row count', table('| added row-count criterion | | reviewers asked for it |\n'));
const V2_APPROVED = spec('- the export finishes\n- the export is idempotent\n- the export logs its row count', table('| added row-count criterion | albert | reviewers asked for it |\n'));
const V2_NO_REASON = spec('- the export finishes\n- the export is idempotent\n- the export logs its row count', table('| added row-count criterion | albert | |\n'));
const V1_WITH_OLD_RECORD = spec('- the export finishes', table('| initial | albert | first draft |\n'));
const V2_OLD_RECORD_ONLY = spec('- the export finishes\n- it is idempotent', table('| initial | albert | first draft |\n'));

const VAGUE_LOG = '# Work log\n\n## Next action\n\n- Continue implementation and handle the rest\n';
const NAMED_LOG = '# Work log\n\n## Next action\n\n- Run `npm test` in cli/ and fix scripts/check-open-work-tracking.mjs\n';

// ── the case table shared by the real script and every mutant ───────────────
// Each case builds its own fixtures and states what the REAL script must do.

const CASES = {
  'vague next action is a violation': {
    args: () => ['next-action', w('a/log.md', VAGUE_LOG)], code: 1, out: /VIOLATION OWT-019/,
  },
  'a named next action passes': {
    args: () => ['next-action', w('b/log.md', NAMED_LOG)], code: 0, notOut: /VIOLATION/,
  },
  'a path only a code span can name': {
    args: () => ['next-action', w('c/log.md', '## Next action\n\n- look in `scripts/hooks`\n')], code: 0, notOut: /VIOLATION/,
  },
  'a command only a code span can name': {
    args: () => ['next-action', w('d/log.md', '## Next action\n\n- run `npm test`\n')], code: 0, notOut: /VIOLATION/,
  },
  'a command named in prose': {
    args: () => ['next-action', w('e/log.md', '## Next action\n\n- run git rebase before anything else\n')], code: 0, notOut: /VIOLATION/,
  },
  'a test name only a code span can name': {
    args: () => ['next-action', w('f/log.md', '## Next action\n\n- make `test_reports_unnamed` pass\n')], code: 0, notOut: /VIOLATION/,
  },
  'a test name quoted in prose': {
    args: () => ['next-action', w('g/log.md', '## Next action\n\n- make the test "reports unnamed actions" pass\n')], code: 0, notOut: /VIOLATION/,
  },
  'an identifier only a code span can name': {
    args: () => ['next-action', w('h/log.md', '## Next action\n\n- finish `XSPEC-436`\n')], code: 0, notOut: /VIOLATION/,
  },
  'an identifier named in prose': {
    args: () => ['next-action', w('i/log.md', '## Next action\n\n- finish XSPEC-436 before the release\n')], code: 0, notOut: /VIOLATION/,
  },
  'intent changed with no record is a violation and is handed back': {
    args: () => ['revision', '--before', w('j/v1.md', V1), '--after', w('j/v2.md', V2_NO_RECORD)], code: 1,
    out: /VIOLATION OWT-018[\s\S]*HAND-BACK[\s\S]*Acceptance criteria/,
  },
  'intent changed, record without approver: handed back, not a violation': {
    args: () => ['revision', '--before', w('k/v1.md', V1), '--after', w('k/v2.md', V2_NO_APPROVER)], code: 0,
    out: /HAND-BACK[\s\S]*no approver/, notOut: /VIOLATION/,
  },
  'intent changed, recorded and approved: clean': {
    args: () => ['revision', '--before', w('l/v1.md', V1), '--after', w('l/v2.md', V2_APPROVED)], code: 0,
    notOut: /VIOLATION|HAND-BACK \(/,
  },
  'intent changed, record has no reason: violation': {
    args: () => ['revision', '--before', w('m/v1.md', V1), '--after', w('m/v2.md', V2_NO_REASON)], code: 1, out: /incomplete/,
  },
  'intent changed, only an OLD record exists: still a violation': {
    args: () => ['revision', '--before', w('n/v1.md', V1_WITH_OLD_RECORD), '--after', w('n/v2.md', V2_OLD_RECORD_ONLY)], code: 1, out: /no new revision record/,
  },
  'intent unchanged: clean': {
    args: () => ['revision', '--before', w('o/v1.md', V1), '--after', w('o/v2.md', V1)], code: 0, out: /unchanged/, notOut: /VIOLATION|HAND-BACK \(/,
  },
  'one carrier holding intent and progress is a violation': {
    args: () => ['separation', w('p/one.md', '# X\n\n## Acceptance criteria\n\n- a\n\n## Next action\n\n- b\n')], code: 1, out: /VIOLATION OWT-017/,
  },
  'goal and progress in two carriers is clean': {
    args: () => ['separation', w('q/work.md', '# W\n\n## Goal\n\n- a\n\n## Acceptance criteria\n\n- b\n'), w('q/state.md', '# S\n\n## Progress\n\n- c\n\n## Next action\n\n- d\n')], code: 0, notOut: /VIOLATION/,
  },
};

function assertCase(r, c) {
  expect(r.status).toBe(c.code);
  if (c.out) expect(r.out).toMatch(c.out);
  if (c.notOut) expect(r.out).not.toMatch(c.notOut);
}

// ── the DEC's evidence ──────────────────────────────────────────────────────

describe('DEC-122-L1 evidence', () => {
  it('a next action that names no artefact is reported, and an edit to acceptance criteria without an approver is listed at hand-back', () => {
    // (1) a next action naming nothing is reported, and the process fails
    const vague = run(SCRIPT, ['next-action', w('vague/log.md', VAGUE_LOG)]);
    expect(vague.status).toBe(1);
    expect(vague.out).toMatch(/VIOLATION OWT-019: .*names no file path, test name, command or requirement identifier/);
    expect(vague.out).toMatch(/unnamed=1/);

    // (2) an edit to the acceptance criteria whose record has no approver is
    // listed for the hand-back, and listing it does not change the exit code
    const listed = run(SCRIPT, ['revision', '--before', w('rev/v1.md', V1), '--after', w('rev/v2.md', V2_NO_APPROVER)]);
    expect(listed.status).toBe(0);
    expect(listed.out).toMatch(/HAND-BACK \(OWT-018 -> OWT-007\)/);
    expect(listed.out).toMatch(/edit to Acceptance criteria .*: revision record has no approver/);
    expect(listed.out).toMatch(/never blocks \(OWT-008\)/);

    // (3) an edit with no record at all is also listed (and is a violation)
    const none = run(SCRIPT, ['revision', '--before', w('rev2/v1.md', V1), '--after', w('rev2/v2.md', V2_NO_RECORD)]);
    expect(none.status).toBe(1);
    expect(none.out).toMatch(/HAND-BACK[\s\S]*no approver: there is no revision record at all/);
  });
});

// ── OWT-019 ─────────────────────────────────────────────────────────────────

describe('OWT-019: a next action names a concrete object', () => {
  it.each([
    'Continue implementation',
    'handle the rest of the items',
    'finish up and clean up',
    'keep working on it',
    '繼續實作',
    '處理剩下的',
    'read/write the data and/or the input/output',
    'set the encoding to UTF-8 and use SHA-256',
    'go through the list and make sure it is right',
    'see v1.5.0 and 2026-09-29',
    'see e.g. the notes',
  ])('reports %j as unnamed', (text) => {
    expect(classifyNextAction(text).status).toBe('unnamed');
  });

  it.each([
    ['edit scripts/foo.mjs', 'path'],
    ['open README.md', 'path'],
    ['fix ./local/thing', 'path'],
    ['fix a/b/c', 'path'],
    ['run `npm test` first', 'command'],
    ['run npm install now', 'command'],
    ['make `test_owt_019` pass', 'test'],
    ['make the test "reports unnamed" pass', 'test'],
    ['finish XSPEC-436', 'id'],
    ['answer OQ2', 'id'],
    ['do PROJ-123', 'id'],
  ])('%j names an object (%s)', (text, kind) => {
    const r = classifyNextAction(text);
    expect(r.status).not.toBe('unnamed');
    expect(r.kinds.map((k) => k.kind)).toContain(kind);
  });

  it('judges naming, not wording: a fluent sentence naming nothing fails and a terse one naming a test passes', () => {
    expect(classifyNextAction('I will carefully and thoroughly finish everything that remains in due course').status).toBe('unnamed');
    expect(classifyNextAction('`test_owt_019`').status).not.toBe('unnamed');
  });

  it('reports three outcomes, not one green: resolved, unresolved, unnamed', () => {
    w('proj/scripts/present.mjs', 'x');
    const opts = { root: join(dir, 'proj') };
    expect(classifyNextAction('edit scripts/present.mjs', opts).status).toBe('named-resolved');
    expect(classifyNextAction('create scripts/not-yet.mjs', opts).status).toBe('named-unresolved');
    expect(classifyNextAction('run `npm test`', opts).status).toBe('named-unresolved');
    expect(classifyNextAction('keep going', opts).status).toBe('unnamed');
    expect(classifyNextAction('edit scripts/present.mjs', {}).resolution).toMatch(/not attempted/);
  });

  it('accepts an adopter-supplied identifier pattern', () => {
    expect(classifyNextAction('do task #77', {}).status).toBe('unnamed');
    expect(classifyNextAction('do task #77', { idPattern: '#\\d+' }).status).toBe('named-unresolved');
  });

  it('finds next actions in a section, a table column and an inline label, and does not double count', () => {
    const md = [
      '# Log', '',
      '## Next action', '', '- run `npm test`', '- keep going', '',
      '## Items', '', '| item | state | Next action |', '|---|---|---|', '| a | open | edit x.md |', '| b | open | later |', '',
      '## Other', '', '**Next step**: fix scripts/a.mjs', '',
    ].join('\n');
    const { fields, items } = extractNextActions(md);
    expect(fields).toBe(4); // one section + two table rows + one label
    expect(items.map((i) => i.text)).toEqual(expect.arrayContaining(['run `npm test`', 'keep going', 'edit x.md', 'later', 'fix scripts/a.mjs']));
    expect(items).toHaveLength(5);
  });

  it('does not count a table row twice when the table sits under a next-action heading', () => {
    const md = '# Log\n\n## Next action\n\n| item | Next action |\n|---|---|\n| a | edit x.md |\n| b | keep going |\n';
    const { fields, items } = extractNextActions(md);
    expect(items.map((i) => i.text).sort()).toEqual(['edit x.md', 'keep going']);
    expect(fields).toBe(2); // the two rows, counted once through the column
  });

  it('does not evaluate an empty or done field, and says how many it skipped', () => {
    const p = w('e/log.md', '| item | Next action |\n|---|---|\n| a | — |\n| b | done |\n| c | keep going |\n');
    const r = run(SCRIPT, ['next-action', p]);
    expect(r.status).toBe(1);
    expect(r.out).toMatch(/walked 1 next-action field\(s\)/);
    expect(r.out).toMatch(/2 empty\/done field\(s\) not evaluated/);
  });

  it('exits 2, not 0, when no carrier has a next-action field at all', () => {
    const r = run(SCRIPT, ['next-action', w('none/log.md', '# Notes\n\nnothing here\n')]);
    expect(r.status).toBe(2);
    expect(r.out).toMatch(/CANNOT DECIDE/);
  });

  it('declares its coverage unknown and its vocabulary uncalibrated (OWT-011, OWT-016)', () => {
    const r = run(SCRIPT, ['next-action', w('cov/log.md', NAMED_LOG)]);
    expect(r.out).toMatch(/COVERAGE UNKNOWN \(OWT-011\)/);
    expect(r.out).toMatch(/UNCALIBRATED \(OWT-016\)/);
  });
});

// ── OWT-018 ─────────────────────────────────────────────────────────────────

describe('OWT-018: an edit to intent leaves a record; no approver is listed at hand-back', () => {
  it('reads records from table rows and from labelled list items', () => {
    const md = '# S\n\n## Revisions\n\n- 2026-09-29 | changed: added B | approved by: albert | reason: scope grew\n- 2026-09-30 | what changed: dropped C | reason: obsolete\n';
    const e = revisionEntries(md);
    expect(e).toHaveLength(2);
    expect(e[0]).toMatchObject({ change: 'added B', approver: 'albert', reason: 'scope grew' });
    expect(e[1]).toMatchObject({ change: 'dropped C', approver: '', reason: 'obsolete' });
  });

  it.each(['', '-', '—', 'n/a', 'none', 'TBD', 'pending', '無', '未核可'])('reads %j as no approver', (approver) => {
    const after = spec('- a\n- b', table(`| added b | ${approver} | needed |\n`));
    const r = checkIntentRevision({ before: spec('- a', table('')), after });
    expect(r.handBack).toHaveLength(1);
    expect(r.violations).toHaveLength(0);
  });

  it('does not count the revision section itself as intent', () => {
    const r = checkIntentRevision({ before: spec('- a', table('')), after: spec('- a', table('| x | albert | y |\n')) });
    expect(r.status).toBe('unchanged');
  });

  it('a revision section nested under the intent heading is not part of the intent', () => {
    const nested = (rows) => `# S\n\n## Acceptance criteria\n\n- a\n\n### Revisions\n\n${table(rows)}`;
    const r = checkIntentRevision({ before: nested(''), after: nested('| x | albert | y |\n') });
    expect(r.status).toBe('unchanged');
  });

  it('names which sections changed', () => {
    const before = '# S\n\n## Goal\n\n- g\n\n## Constraints\n\n- c\n\n## Revisions\n\n' + table('');
    const after = '# S\n\n## Goal\n\n- g2\n\n## Constraints\n\n- c\n\n## Revisions\n\n' + table('');
    expect(checkIntentRevision({ before, after }).changedSections).toEqual(['Goal']);
  });

  it('a carrier that did not exist in the baseline has nothing to compare, and is not a violation', () => {
    const r = checkIntentRevision({ before: null, after: V1 });
    expect(r.status).toBe('no-baseline');
    expect(r.violations).toHaveLength(0);
  });

  it('exits 2 when neither version has an intent section: the check cannot see intent', () => {
    const r = run(SCRIPT, ['revision', '--before', w('x/a.md', '# Notes\n'), '--after', w('x/b.md', '# Notes\n\ntext\n')]);
    expect(r.status).toBe(2);
    expect(r.out).toMatch(/CANNOT DECIDE/);
  });

  it('says what it cannot decide: that a record describes the change honestly', () => {
    const r = run(SCRIPT, ['revision', '--before', w('lim/a.md', V1), '--after', w('lim/b.md', V2_APPROVED)]);
    expect(r.out).toMatch(/cannot decide that the record describes the change honestly/);
  });

  describe('against real git history (--file --base)', () => {
    const git = (cwd, ...a) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...a], { cwd, encoding: 'utf8' });

    it('compares the working file to the file at a revision, tells a new file from an error, and exits 2 on a bad revision', () => {
      const repo = join(dir, 'repo');
      mkdirSync(repo);
      git(repo, 'init', '-q');
      const f = join(repo, 'spec.md');
      writeFileSync(f, V1);
      git(repo, 'add', '.');
      git(repo, 'commit', '-q', '-m', 'v1');

      writeFileSync(f, V2_NO_RECORD);
      const changed = run(SCRIPT, ['revision', '--file', f, '--base', 'HEAD']);
      expect(changed.status).toBe(1);
      expect(changed.out).toMatch(/changed-no-record/);

      writeFileSync(f, V2_APPROVED);
      expect(run(SCRIPT, ['revision', '--file', f, '--base', 'HEAD']).status).toBe(0);

      const other = join(repo, 'brand-new.md');
      writeFileSync(other, V1);
      const fresh = run(SCRIPT, ['revision', '--file', other, '--base', 'HEAD']);
      expect(fresh.status).toBe(0);
      expect(fresh.out).toMatch(/no-baseline/);

      const bad = run(SCRIPT, ['revision', '--file', f, '--base', 'no-such-rev']);
      expect(bad.status).toBe(2);
      expect(bad.out).toMatch(/CANNOT DECIDE/);
    });
  });
});

// ── OWT-017 ─────────────────────────────────────────────────────────────────

describe('OWT-017: intent and progress are held by different carriers', () => {
  it('flags one carrier holding both, whatever the file is called', () => {
    for (const path of ['WORK.md', 'STATE.md', 'notes.md', 'x.txt']) {
      const r = checkSeparation([{ path, content: '# X\n\n## Goal\n\n- a\n\n## Progress\n\n- b\n' }]);
      expect(r.violations, path).toHaveLength(1);
    }
  });

  it('accepts a spec beside a work log, and a WORK/STATE pair', () => {
    expect(checkSeparation([
      { path: 'spec.md', content: '# S\n\n## Acceptance criteria\n\n- a\n' },
      { path: 'worklog.md', content: '# L\n\n## Next action\n\n- b\n' },
    ]).violations).toHaveLength(0);
    expect(checkSeparation([
      { path: 'WORK.md', content: '# W\n\n## Goal\n\n- a\n\n## Constraints\n\n- c\n' },
      { path: 'STATE.md', content: '# S\n\n## Progress\n\n- b\n\n## Blocked\n\n- x\n' },
    ]).violations).toHaveLength(0);
  });

  it('exits 2 when no carrier has a recognised heading', () => {
    const r = run(SCRIPT, ['separation', w('s/a.md', '# Notes\n\ntext\n')]);
    expect(r.status).toBe(2);
  });
});

// ── the script's own arms ───────────────────────────────────────────────────

describe('the checker vouches for itself before it judges', () => {
  it('passes its own self-test arms', () => {
    expect(runSelfTest()).toEqual({ ok: true, failures: [] });
    expect(run(SCRIPT, ['--self-test']).status).toBe(0);
  });

  it('every case in the table behaves as declared on the real script', () => {
    for (const [name, c] of Object.entries(CASES)) {
      const r = run(SCRIPT, c.args());
      try { assertCase(r, c); } catch (e) { throw new Error(`case "${name}": ${e.message}`); }
    }
  });
});

// ── OWT-015: the mutation block ─────────────────────────────────────────────
// [from, to] pairs applied to the script's source text. Each `from` must occur
// exactly once. `red` lists the cases that MUST go red under that mutant.

const NEUTRALISE_SELF_TEST = ['const selfTest = runSelfTest();', 'const selfTest = { ok: true, failures: [] };'];
const V = 'vague next action is a violation';
const NAMED = 'a named next action passes';

const MUTANTS = [
  { name: 'OWT-019 always passes', edits: [['const named = kinds.length > 0;', 'const named = true;']], red: [V] },
  { name: 'OWT-019 always fails', edits: [['const named = kinds.length > 0;', 'const named = false;']], red: [NAMED, 'an identifier named in prose'] },
  { name: 'OWT-019 code-span path arm off', edits: [["if (pathLike(code, true)) push('path', pathLike(code, true));", "if (false) push('path', pathLike(code, true));"]], red: ['a path only a code span can name'] },
  { name: 'OWT-019 code-span command arm off', edits: [["else if (commands.includes(first) || /^\\.{1,2}\\//.test(first)) push('command', code);", "else if (false) push('command', code);"]], red: ['a command only a code span can name'] },
  { name: 'OWT-019 prose command arm off', edits: [['push(\'command\', `${m[1]} ${m[2]}`);', 'void 0;']], red: ['a command named in prose'] },
  { name: 'OWT-019 code-span test arm off', edits: [["push('test', code); // [mutation-anchor:kind-test]", 'void 0;']], red: ['a test name only a code span can name'] },
  { name: 'OWT-019 prose test arm off', edits: [["push('test', m[1]);", 'void 0;']], red: ['a test name quoted in prose'] },
  { name: 'OWT-019 code-span id arm off', edits: [["if (m && idOk(m[0])) push('id', m[0]);", 'void 0;']], red: ['an identifier only a code span can name'] },
  { name: 'OWT-019 prose id arm off', edits: [["if (idOk(m[0])) push('id', m[0]); // [mutation-anchor:kind-id]", 'void 0;']], red: ['an identifier named in prose'] },
  { name: 'OWT-018 always passes (never sees a change)', edits: [['const intentChanged = res.changedSections.length > 0;', 'const intentChanged = false;']], red: ['intent changed with no record is a violation and is handed back', 'intent changed, record has no reason: violation'] },
  { name: 'OWT-018 always fails (every version looks changed)', edits: [['const intentChanged = res.changedSections.length > 0;', 'const intentChanged = true;']], red: ['intent unchanged: clean'] },
  { name: 'OWT-018 an old record counts as the new one', edits: [['revisionEntries(after).filter((e) => !beforeKeys.has(e.key))', 'revisionEntries(after)']], red: ['intent changed, only an OLD record exists: still a violation'] },
  { name: 'OWT-018 an incomplete record is accepted', edits: [['if (!e.change || !e.reason) {', 'if (false) {']], red: ['intent changed, record has no reason: violation'] },
  { name: 'OWT-018 every record is read as approved', edits: [['const hasApprover = !NO_APPROVER.test(e.approver.trim());', 'const hasApprover = true;']], red: ['intent changed, record without approver: handed back, not a violation'] },
  { name: 'OWT-018 no record is ever read as approved', edits: [['const hasApprover = !NO_APPROVER.test(e.approver.trim());', 'const hasApprover = false;']], red: ['intent changed, recorded and approved: clean'] },
  { name: 'OWT-017 always passes', edits: [['const both = intent.size > 0 && progress.size > 0;', 'const both = false;']], red: ['one carrier holding intent and progress is a violation'] },
  { name: 'OWT-017 always fails', edits: [['const both = intent.size > 0 && progress.size > 0;', 'const both = true;']], red: ['goal and progress in two carriers is clean'] },
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

describe('OWT-015: the checks have been observed red', () => {
  it.each(MUTANTS.map((m) => [m.name, m]))('mutant "%s" turns its declared cases red', (_n, m) => {
    const red = redCasesUnder(makeMutant(m.edits));
    if (process.env.OWT_MATRIX) console.info(`[owt-mutation] ${m.name} -> red: ${JSON.stringify(red)}`);
    for (const declared of m.red) expect(red, `declared case not red: ${declared}`).toContain(declared);
  });

  it('a mutant that leaves the self-test arms in place is stopped at exit 2, which is not a pass', () => {
    const p = makeMutant([['const named = kinds.length > 0;', 'const named = true;']], { neutralise: false });
    const r = run(p, ['next-action', w('st/log.md', VAGUE_LOG)]);
    expect(r.status).toBe(2);
    expect(r.out).toMatch(/self-test arms failed/);
  });

  it('refuses a mutation that does not apply exactly once, so a no-op mutant cannot pass for a red one', () => {
    expect(() => makeMutant([['this text is not in the script', 'x']])).toThrow(/did not apply exactly once/);
  });
});

// ── the standard itself, in each place it lives ─────────────────────────────

describe('open-work-tracking 1.1.0 reads the same everywhere', () => {
  const read = (rel) => readFileSync(join(REPO_ROOT, rel), 'utf8');
  const core = read('core/open-work-tracking.md');
  const zh = read('locales/zh-TW/core/open-work-tracking.md');
  const ai = read('ai/standards/open-work-tracking.ai.yaml');

  it.each(['OWT-017', 'OWT-018', 'OWT-019'])('%s is a numbered requirement in the standard, its zh-TW translation and the .ai.yaml', (id) => {
    expect(core).toMatch(new RegExp(`\\*\\*${id}\\*\\* \\|`));
    expect(zh).toMatch(new RegExp(`\\*\\*${id}\\*\\* \\|`));
    expect(ai).toMatch(new RegExp(`- id: ${id}\\n`));
  });

  it('carries version 1.1.0 in all three, and the self-adoption copy is byte-identical', () => {
    expect(core).toMatch(/\*\*Version\*\*: 1\.1\.0/);
    expect(zh).toMatch(/source_version: 1\.1\.0/);
    expect(zh).toMatch(/translation_version: 1\.1\.0/);
    expect(ai).toMatch(/version: "1\.1\.0"/);
    expect(read('.standards/open-work-tracking.ai.yaml')).toBe(ai);
  });

  it('gives each new requirement a severity with a stated reason', () => {
    expect(ai).toMatch(/id: OWT-017\n\s+rule: .*\n\s+severity: warning\n\s+severity_rationale:/);
    expect(ai).toMatch(/id: OWT-018\n\s+rule: .*\n\s+severity: error\n\s+severity_rationale:/);
    expect(ai).toMatch(/id: OWT-019\n\s+rule: .*\n\s+severity: warning\n\s+severity_rationale:/);
    expect(core).toMatch(/Why these severities/);
  });

  it('records what it does not adopt, and the provenance of the prompt it borrowed shapes from', () => {
    expect(core).toMatch(/hand-written state file as the source of truth/i);
    expect(core).toMatch(/fixed start-of-work ritual/i);
    expect(core).toMatch(/author and provenance are unknown/);
    expect(zh).toMatch(/作者與出處不明/);
    expect(ai).toMatch(/作者與出處不明/);
  });

  it('marks the reference check as evidence, not a gate, and its vocabulary as uncalibrated (OWT-016)', () => {
    expect(core).toMatch(/reference decision procedure/);
    expect(core).toMatch(/not wired into any UDS release gate/);
    expect(core).toMatch(/uncalibrated, an initial judgment/);
    expect(ai).toMatch(/automated_gate: false/);
    expect(ai).toMatch(/uncalibrated_per_owt_016/);
  });

  it('names no vendor model id in the standard body or the .ai.yaml', () => {
    const vendor = /claude-(?:opus|sonnet|haiku)-\d|gpt-\d|gemini-\d|\bo[1-9]-(?:mini|preview)\b/i;
    expect(core).not.toMatch(vendor);
    expect(zh).not.toMatch(vendor);
    expect(ai).not.toMatch(vendor);
  });

  it('the zh-TW source_hash is the current hash of the English source (translation is not stale)', () => {
    const hash = execFileSync('git', ['hash-object', 'core/open-work-tracking.md'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim().slice(0, 12);
    expect(zh).toMatch(new RegExp(`source_hash: ${hash}`));
  });
});
