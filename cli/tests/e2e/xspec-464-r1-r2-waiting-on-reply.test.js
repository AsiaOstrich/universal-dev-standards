/**
 * E2E: `uds open-work next-action` and a row that was asked and is waiting for a reply
 * (dev-platform XSPEC-464 R1 and R2; open-work-tracking 1.4.0, OWT-019 and OWT-022).
 *
 * A user kept 14 of 17 next actions as "wait for the other side's reply". `waiting` read such a row as fine
 * (asked, 2 days ago); `next-action` called the same row a violation, because "wait for the reply" names no file,
 * command, test or identifier. The two commands gave opposite answers about one row. The reply IS the next step,
 * and OWT-022 already requires the three things that make it checkable (when it was asked, what it waits for, what
 * releases it), so a row that is `asked-awaiting` and complete under OWT-022 is a fourth outcome of OWT-019:
 * `waiting-on-reply`. It is not a violation, not "named", not complete; it is counted apart and listed with its age.
 * A row missing any of the three is judged exactly as before.
 *
 * Every test spawns the real CLI in a throwaway directory and reads back the counts, the lines and the exit code.
 * Dates are fixed in January 2026 and given with `--now`, so the clock of the machine cannot make a test pass:
 * a run whose `--now` is lost would print an age counted from today instead.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/open-work.js   process.exitCode = main([...argv, ...wordArgv, ...commandArgv, ...files]); // wire:next-action
 *   cli/src/commands/open-work.js   process.exitCode = main([...argv, ...files]); // wire:waiting
 *
 * The weakened checkers at the end run the same property against copies of the checker with one decision made
 * wrong (every status row waived; a row waived whatever it lacks; asked-at no longer required; the two commands no
 * longer sharing one reading; every row of a carrier waived because one is). Each must turn the property red.
 */

import { it, expect, afterAll } from 'vitest';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness, REAL_CLI_DIR } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec464-r1r2');
afterAll(() => { h.cleanup(); mutantHarnesses.forEach((m) => m.cleanup()); });
const mutantHarnesses = [];

const HEAD_EN = '| item | status | asked-at | waiting for | release | Next action |\n|---|---|---|---|---|---|\n';
const HEAD_ZH = '| 事情 | 狀態 | 詢問日期 | 等什麼 | 解除條件 | 下一步 |\n|---|---|---|---|---|---|\n';
const en = (title, status, askedAt, waitsFor, release, next = 'wait for the vendor reply') => `| ${title} | ${status} | ${askedAt} | ${waitsFor} | ${release} | ${next} |\n`;
const NOW = ['--now', '2026-01-12'];

const nextAction = (harness, dir, file, extra = NOW) => harness.runCli(['open-work', 'next-action', file, ...extra], dir);
const waiting = (harness, dir, file, extra = NOW) => harness.runCli(['open-work', 'waiting', file, ...extra], dir);

it('uds open-work next-action reads an asked-awaiting row with asked-at, what it waits for and its release as waiting-on-reply: counts it apart, lists it with its age, and exits 0 (XSPEC-464 R1)', async () => {
  const dir = h.makeDir('r1-green');
  writeFileSync(join(dir, 'w.md'), HEAD_EN + en('vendor quote', 'asked-awaiting', '2026-01-10', 'the quote', 'the quote arrives'));
  const r = await nextAction(h, dir, 'w.md');
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(0);
  // the counts line: the three old numbers keep their meaning and their place, and the new one follows
  expect(out).toMatch(/\n\[owt\]   named-resolved=0 named-unresolved=0 unnamed=0 undecidable-table-rows=0 waiting-on-reply=1\n/);
  expect(out).toMatch(/walked 1 next-action field\(s\)/);
  // the row's own line says what it is, and where
  expect(out).toMatch(/\[owt\]   waiting-on-reply w\.md table column "Next action" \(line 3, row "vendor quote"\): wait for the vendor reply/);
  // its own section: the row, the age, what it waits for, what releases it
  expect(out).toMatch(/\[owt\] WAITING-ON-REPLY 1 row\(s\) are asked-awaiting and carry everything OWT-022 asks for, so OWT-019 is not applied to them \(counted apart: not named, not resolved, not complete; 0 older than 7 day\(s\), UNCALIBRATED\):/);
  expect(out).toMatch(/\[owt\]   w\.md table column "Next action" \(line 3, row "vendor quote"\): asked 2d ago \(2026-01-10\); waiting for: the quote; released by: the quote arrives\n/);
  expect(out).toMatch(/WAITING-ON-REPLY LIMIT: the check decides that asked-at, what is waited for and the release event are present and well formed \(OWT-022\)\. It cannot decide that the request was really sent/);
  // it is not a violation, not named, not resolved
  expect(out).not.toMatch(/VIOLATION/);
  expect(out).not.toMatch(/named-resolved=[1-9]|named-unresolved=[1-9]|unnamed=[1-9]/);
});

it('uds open-work next-action reads the Chinese state word and the Chinese field names the same way, so the 14 of 17 rows in a Chinese carrier stop being violations (XSPEC-464 R1)', async () => {
  const dir = h.makeDir('r1-zh');
  writeFileSync(join(dir, 'zh.md'), HEAD_ZH + en('廠商報價', '已問、等回覆', '2026-01-10', '廠商回信', '收到報價單', '等對方回信') + en('排時間', '已問、等回覆', '2026-01-11', '對方的時間', '對方回覆可以的日期', '等對方回信'));
  const r = await nextAction(h, dir, 'zh.md');
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(0);
  expect(out).toMatch(/unnamed=0 undecidable-table-rows=0 waiting-on-reply=2\n/);
  expect(out).toMatch(/row "廠商報價"\): asked 2d ago \(2026-01-10\); waiting for: 廠商回信; released by: 收到報價單/);
  expect(out).toMatch(/row "排時間"\): asked 1d ago \(2026-01-11\); waiting for: 對方的時間; released by: 對方回覆可以的日期/);
  expect(out).not.toMatch(/VIOLATION/);
});

it('uds open-work next-action shows the age of every waiting-on-reply row, marks one older than the threshold STALE without making it a violation, and takes the threshold from --stale-after (XSPEC-464 R1)', async () => {
  const dir = h.makeDir('r1-stale');
  writeFileSync(join(dir, 'w.md'), HEAD_EN + en('fresh', 'asked-awaiting', '2026-01-10', 'the quote', 'the quote arrives') + en('forty days', 'asked-awaiting', '2025-12-03', 'the quote', 'the quote arrives'));
  const r = await nextAction(h, dir, 'w.md');
  const out = r.stdout + r.stderr;
  expect(r.code, 'a stale wait is shown, never a violation').toBe(0);
  expect(out).toMatch(/2 row\(s\) are asked-awaiting[^\n]*1 older than 7 day\(s\)/);
  expect(out).toMatch(/row "fresh"\): asked 2d ago \(2026-01-10\); waiting for: the quote; released by: the quote arrives\n/);
  expect(out).toMatch(/row "forty days"\): asked 40d ago \(2025-12-03\) STALE \(older than 7d\); waiting for: the quote/);
  // the threshold is declared, not fixed
  const lenient = await nextAction(h, dir, 'w.md', [...NOW, '--stale-after', '60']);
  expect(lenient.stdout).toMatch(/0 older than 60 day\(s\)/);
  expect(lenient.stdout).not.toMatch(/STALE/);
  const strict = await nextAction(h, dir, 'w.md', [...NOW, '--stale-after', '1']);
  expect(strict.stdout).toMatch(/2 older than 1 day\(s\)/);
  // a bad value is refused, not guessed
  const bad = await nextAction(h, dir, 'w.md', [...NOW, '--stale-after', 'soon']);
  expect(bad.code, bad.stdout + bad.stderr).toBe(2);
  expect(bad.stdout + bad.stderr).toMatch(/--stale-after must be a number of days, got "soon"/);
  const badNow = await nextAction(h, dir, 'w.md', ['--now', 'yesterday']);
  expect(badNow.code).toBe(2);
  expect(badNow.stdout + badNow.stderr).toMatch(/--now must be a date with a year \(YYYY-MM-DD\), got "yesterday"/);
});

// Each of these is one thing OWT-022 asks for, taken away. The row is then judged by OWT-019 exactly as before.
const RED_ROWS = [
  ['no asked-at', en('r', 'asked-awaiting', '', 'the quote', 'the quote arrives')],
  ['asked-at that is not a date', en('r', 'asked-awaiting', 'last week', 'the quote', 'the quote arrives')],
  ['asked-at in the future', en('r', 'asked-awaiting', '2026-01-20', 'the quote', 'the quote arrives')],
  ['no what it waits for', en('r', 'asked-awaiting', '2026-01-10', '', 'the quote arrives')],
  ['no release event', en('r', 'asked-awaiting', '2026-01-10', 'the quote', '')],
  ['not-yet-asked', en('r', 'not-yet-asked', '', '', '')],
  ['a state that is neither', en('r', 'in progress', '2026-01-10', 'the quote', 'the quote arrives')],
];

it('uds open-work next-action still judges by OWT-019 a row that is missing asked-at, has one in the future, or lacks what it waits for or its release, and one that is not-yet-asked or in another state, and exits 1 (XSPEC-464 R1)', async () => {
  const dir = h.makeDir('r1-red');
  for (const [what, row] of RED_ROWS) {
    writeFileSync(join(dir, 'w.md'), HEAD_EN + row);
    const r = await nextAction(h, dir, 'w.md');
    const out = r.stdout + r.stderr;
    expect(r.code, `${what}: ${out}`).toBe(1);
    expect(out, what).toMatch(/named-resolved=0 named-unresolved=0 unnamed=1 undecidable-table-rows=0\n/);
    expect(out, what).toMatch(/VIOLATION OWT-019: w\.md table column "Next action" \(line 3, row "r"\) names no file path/);
    expect(out, `${what}: nothing is waived`).not.toMatch(/waiting-on-reply|WAITING-ON-REPLY/);
  }
});

it('uds open-work next-action waives the one row that is complete and leaves its neighbours in the same table to OWT-019, naming each by its own line (XSPEC-464 R1)', async () => {
  const dir = h.makeDir('r1-mixed');
  writeFileSync(join(dir, 'w.md'), HEAD_EN
    + en('missing date', 'asked-awaiting', '', 'the quote', 'the quote arrives')
    + en('complete', 'asked-awaiting', '2026-01-10', 'the quote', 'the quote arrives')
    + en('plain work', 'in progress', '', '', '', 'edit scripts/foo.mjs')
    + en('vague', 'in progress', '', '', '', 'keep going'));
  const r = await nextAction(h, dir, 'w.md');
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(1);
  expect(out).toMatch(/named-resolved=0 named-unresolved=1 unnamed=2 undecidable-table-rows=0 waiting-on-reply=1\n/);
  expect(out).toMatch(/waiting-on-reply w\.md table column "Next action" \(line 4, row "complete"\)/);
  expect(out).toMatch(/VIOLATION OWT-019: w\.md table column "Next action" \(line 3, row "missing date"\)/);
  expect(out).toMatch(/VIOLATION OWT-019: w\.md table column "Next action" \(line 6, row "vague"\)/);
  expect(out.match(/VIOLATION OWT-019/g)).toHaveLength(2);
});

it('uds open-work next-action joins a list item to its own next-action label across the lines of that item, and does not waive the next list item (XSPEC-464 R1)', async () => {
  const dir = h.makeDir('r1-list');
  writeFileSync(join(dir, 'l.md'), '# Worklog\n\n'
    + '- vendor quote\n  - status: asked-awaiting\n  - asked-at: 2026-01-10\n  - waiting for: the quote\n  - release: the quote arrives\n  - Next action: wait for the vendor reply\n'
    + '- legal reply\n  - status: asked-awaiting\n  - waiting for: the opinion\n  - release: the opinion arrives\n  - Next action: wait for the legal reply\n');
  const r = await nextAction(h, dir, 'l.md');
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(1);
  expect(out).toMatch(/unnamed=1 undecidable-table-rows=0 waiting-on-reply=1\n/);
  expect(out).toMatch(/waiting-on-reply l\.md label \(line 8\): wait for the vendor reply/);
  expect(out).toMatch(/VIOLATION OWT-019: l\.md label \(line 13\) names no file path/);
});

it('uds open-work next-action does not read a blank field of a list item as filled by the Next action line under it, so a list item missing its release, what it waits for or asked-at is still an OWT-019 violation and waiting reports it too (XSPEC-464 R1)', async () => {
  const dir = h.makeDir('r1-list-blank');
  const item = (fields) => `- vendor quote\n  - status: asked-awaiting\n${fields}  - Next action: wait for the vendor reply\n`;
  const FULL = '  - asked-at: 2026-01-10\n  - waiting for: the quote\n  - release: the quote arrives\n';
  writeFileSync(join(dir, 'ok.md'), item(FULL));
  const ok = await nextAction(h, dir, 'ok.md');
  expect(ok.code, ok.stdout + ok.stderr).toBe(0);
  expect(ok.stdout).toMatch(/waiting-on-reply=1/);
  for (const [what, fields, rule] of [
    ['blank release', FULL.replace('release: the quote arrives', 'release:'), /does not state what event releases it/],
    ['blank what it waits for', FULL.replace('waiting for: the quote', 'waiting for:'), /does not state what it waits for/],
    ['blank asked-at', FULL.replace('asked-at: 2026-01-10', 'asked-at:'), /has no asked-at/],
  ]) {
    writeFileSync(join(dir, 'bad.md'), item(fields));
    const n = await nextAction(h, dir, 'bad.md');
    expect(n.code, `${what}: ${n.stdout}${n.stderr}`).toBe(1);
    expect(n.stdout, what).toMatch(/unnamed=1 undecidable-table-rows=0\n/);
    expect(n.stdout, what).not.toMatch(/waiting-on-reply/);
    const w = await waiting(h, dir, 'bad.md');
    expect(w.code, `${what}: ${w.stdout}${w.stderr}`).toBe(1);
    expect(w.stdout, what).toMatch(new RegExp(`VIOLATION OWT-022: bad\\.md list item \\(line 1, "vendor quote"\\) is asked-awaiting but ${rule.source}`));
  }
});

it('uds open-work next-action leaves a carrier with no status column, and a next-action heading section, exactly as they were: the words alone waive nothing (XSPEC-464 R1)', async () => {
  const dir = h.makeDir('r1-nostate');
  writeFileSync(join(dir, 'plain.md'), '| item | Next action |\n|---|---|\n| vendor quote | wait for the vendor reply |\n');
  writeFileSync(join(dir, 'heading.md'), '## Next action\n\n- wait for the vendor reply\n');
  for (const file of ['plain.md', 'heading.md']) {
    const r = await nextAction(h, dir, file);
    expect(r.code, `${file}: ${r.stdout}${r.stderr}`).toBe(1);
    expect(r.stdout, file).toMatch(/unnamed=1 undecidable-table-rows=0\n/);
    expect(r.stdout, file).not.toMatch(/waiting-on-reply|WAITING-ON-REPLY/);
  }
});

// ── R2: the two commands never give opposite answers about one row ─────────────────────────────────────

const STATES = {
  en: ['asked-awaiting', 'not-yet-asked', 'waiting', 'in progress'],
  zh: ['已問、等回覆', '尚未送出', '等待中', '進行中'],
};
const ASKED_AT = ['2026-01-10', '', 'last week', '2026-01-20'];
const WAITS_FOR = ['the quote', ''];
const RELEASE = ['the quote arrives', ''];

/** Every combination of a state, an asked-at, a what-it-waits-for and a release, one row each, in one carrier. */
function matrixCarrier(lang) {
  const rows = [];
  let n = 0;
  for (const st of STATES[lang]) for (const a of ASKED_AT) for (const w of WAITS_FOR) for (const rel of RELEASE) rows.push(en(`row-${++n}`, st, a, w, rel, lang === 'en' ? 'wait for the vendor reply' : '等對方回信'));
  return (lang === 'en' ? HEAD_EN : HEAD_ZH) + rows.join('');
}

/** { 'row-7': 'waiting-on-reply' | 'unnamed' | ... } from next-action's per-row lines. */
function nextActionStatuses(out) {
  const map = {};
  for (const m of out.matchAll(/^\[owt\]   (\S+)\s+\S+ table column "[^"]+" \(line \d+, row "(row-\d+)"\)/gm)) map[m[2]] = m[1];
  return map;
}

/** { 'row-7': { state: 'asked-awaiting', violations: ['OWT-022'] } } from waiting's per-row lines. */
function waitingFindings(out) {
  const map = {};
  for (const m of out.matchAll(/^\[owt\]   (\S+)\s+\S+ table row \(line \d+, row "(row-\d+)"\)/gm)) map[m[2]] = { state: m[1], violations: [] };
  for (const m of out.matchAll(/^\[owt\] VIOLATION (OWT-\d+): \S+ table row \(line \d+, row "(row-\d+)"\)/gm)) if (map[m[2]]) map[m[2]].violations.push(m[1]);
  return map;
}

/** Runs both commands over the same carrier with the same day and returns every way they disagree. */
async function disagreements(harness, label) {
  const problems = [];
  let passing = 0;
  for (const lang of ['en', 'zh']) {
    const dir = harness.makeDir(`${label}-${lang}`);
    const file = `${lang}.md`;
    writeFileSync(join(dir, file), matrixCarrier(lang));
    const w = await waiting(harness, dir, file);
    const n = await nextAction(harness, dir, file);
    const wf = waitingFindings(w.stdout);
    const na = nextActionStatuses(n.stdout);
    const total = STATES[lang].length * ASKED_AT.length * WAITS_FOR.length * RELEASE.length;
    if (Object.keys(wf).length !== total) problems.push(`${lang}: waiting read ${Object.keys(wf).length} of ${total} rows (exit ${w.code})`);
    if (Object.keys(na).length !== total) problems.push(`${lang}: next-action read ${Object.keys(na).length} of ${total} rows (exit ${n.code})`);
    for (const [row, f] of Object.entries(wf)) {
      const waitingPasses = f.state === 'asked-awaiting' && !f.violations.some((v) => v === 'OWT-020' || v === 'OWT-022');
      if (waitingPasses) passing++;
      const exempt = na[row] === 'waiting-on-reply';
      if (waitingPasses && na[row] === 'unnamed') problems.push(`${lang} ${row}: waiting passes it, next-action reports OWT-019`);
      if (f.violations.includes('OWT-022') && exempt) problems.push(`${lang} ${row}: waiting reports OWT-022, next-action waives it`);
      if (!waitingPasses && exempt) problems.push(`${lang} ${row}: waiting does not pass it (${f.state} ${f.violations.join(',')}), next-action waives it`);
      if (waitingPasses && !exempt) problems.push(`${lang} ${row}: waiting passes it, next-action does not waive it (${na[row]})`);
    }
  }
  if (passing !== 2) problems.push(`the matrix has ${passing} rows that pass, expected exactly one per language`);
  return problems;
}

it('uds open-work waiting and uds open-work next-action never give opposite answers about the same row, over rows in English and in Chinese with every combination of missing fields (XSPEC-464 R2)', async () => {
  expect(await disagreements(h, 'r2')).toEqual([]);
}, 120000);

it('uds open-work next-action reports a row that waiting rejects with OWT-022 as an OWT-019 violation, never as waiting-on-reply, and the reverse for a row waiting accepts (XSPEC-464 R2)', async () => {
  const dir = h.makeDir('r2-pair');
  writeFileSync(join(dir, 'w.md'), HEAD_EN + en('accepted', 'asked-awaiting', '2026-01-10', 'the quote', 'the quote arrives') + en('rejected', 'asked-awaiting', '', 'the quote', 'the quote arrives'));
  const w = await waiting(h, dir, 'w.md');
  expect(w.code, w.stdout).toBe(1);
  expect(w.stdout).toMatch(/VIOLATION OWT-022: w\.md table row \(line 4, row "rejected"\) is asked-awaiting but has no asked-at/);
  expect(w.stdout).not.toMatch(/VIOLATION OWT-0\d\d: w\.md table row \(line 3,/);
  const n = await nextAction(h, dir, 'w.md');
  expect(n.code, n.stdout).toBe(1);
  expect(n.stdout).toMatch(/waiting-on-reply w\.md table column "Next action" \(line 3, row "accepted"\)/);
  expect(n.stdout).toMatch(/VIOLATION OWT-019: w\.md table column "Next action" \(line 4, row "rejected"\)/);
});

// ── the same property against checkers with one decision made wrong: each must turn it red ────────────

const NEUTRALISE_SELF_TEST = ['const selfTest = runSelfTest();', 'const selfTest = { ok: true, failures: [] };'];
const WEAKENED = [
  ['every status row is waived, whatever its state', [["const reply = it.idx === undefined ? undefined : rows.find((w) => w.path === c.path && w.waitingOnReply && it.idx", "const reply = it.idx === undefined ? undefined : rows.find((w) => w.path === c.path && it.idx"]]],
  ['a row is waived whatever OWT-022 finds missing', [["const waitingOnReply = state === 'asked-awaiting' && !raised.some((rule) => rule === 'OWT-020' || rule === 'OWT-022');", "const waitingOnReply = state === 'asked-awaiting';"]]],
  ['asked-at is no longer required to waive a row', [["!raised.some((rule) => rule === 'OWT-020' || rule === 'OWT-022');", "!raised.some((rule) => rule === 'OWT-020');"]]],
  ['next-action no longer reads the rows waiting reads', [['projects: new Map() }).records;', 'projects: new Map() }).records.filter(() => false);']]],
  ['one waived row waives every row of its carrier', [['it.idx >= w.lineStart && it.idx <= w.lineEnd); // [mutation-anchor:next-action-join]', 'true); // [mutation-anchor:next-action-join]']]],
];

for (const [what, edits] of WEAKENED) {
  it(`the property of uds open-work waiting and next-action agreeing turns red on a copy of the checker where ${what} (XSPEC-464 R2 mutation)`, async () => {
    let src = readFileSync(join(REAL_CLI_DIR, 'src', 'utils', 'open-work-tracking.mjs'), 'utf8');
    for (const [from, to] of [NEUTRALISE_SELF_TEST, ...edits]) {
      const n = src.split(from).length - 1;
      expect(n, `the edit must apply exactly once: ${from.slice(0, 70)}`).toBe(1);
      src = src.replace(from, () => to);
    }
    const m = createHarness(`xspec464-mut-${mutantHarnesses.length}`, { overrides: { 'src/utils/open-work-tracking.mjs': src } });
    mutantHarnesses.push(m);
    const problems = await disagreements(m, 'mut');
    expect(problems.length, `the weakened checker (${what}) must make the two commands disagree`).toBeGreaterThan(0);
  }, 120000);
}
