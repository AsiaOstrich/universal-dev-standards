/**
 * E2E: `uds open-work triage` (dev-platform XSPEC-528 R1-R4): the open-work summary sorts every open item into
 * exactly one of three kinds, and a due date is not a start condition.
 *
 *   workable   it is this agent's or person's turn and no dependency is unmet. A due date does not change that.
 *   decide     it waits for a person's ruling.
 *   blocked    it waits for someone else: another agent, CI, an outside party, a fixed date, an unmet dependency.
 *
 * Why it exists: an agent asked "is there work to do?" read a count of items whose start condition was met (0) and
 * answered "three items are left", while a dozen could have been started. The check had read a due date as a start
 * condition and a free-text wait as an unmet one.
 *
 * Entry point chosen: the real CLI, `uds open-work triage` (cli/bin/uds.js, a subprocess in a staged copy of the
 * package). `open-work` is a command with exit codes and printed output, not only skill text, so the skill's
 * own entry is the command it tells the reader to run (skills/open-work-assistant/SKILL.md, step 7).
 *
 * Wires that make this red when cut (one line each; the last two tests cut them and read the difference back):
 *   cli/bin/uds.js                  .action(openWorkTriageCommand);
 *   cli/src/commands/open-work.js   process.exitCode = main([...argv, ...files]); // wire:triage
 * Rules of the one body that make it red when weakened (cli/src/utils/open-work-tracking.mjs):
 *   [mutation-anchor:triage-unmet]            a due date counted as an unmet dependency (R1)
 *   [mutation-anchor:triage-decide]           a wait for a person's ruling counted as workable (R2)
 *   [mutation-anchor:triage-cannot-judge]     a condition it cannot read counted as unmet, so it is hidden (R3)
 *
 * Every expected number below was counted by hand from the fixture, never taken from the program's output.
 * Time is injected (`--now 2026-11-27`). Every test builds what it needs and passes when selected on its own.
 */

import { it, expect, afterAll } from 'vitest';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHarness, REAL_CLI_DIR } from '../utils/staged-cli-harness.js';
import { makeProject } from '../utils/xspec-460.js';

const h = createHarness('xspec528');
afterAll(() => h.cleanup());

const NOW = ['--now', '2026-11-27'];
const HEAD = '| item | owner | due | status | waiting for | release |\n|---|---|---|---|---|---|\n';

/** Rows of the main carrier. Title, owner, due, status, waiting for, release. Line 3 is the first row. */
const ROWS = [
  ['#1 due soon', 'me', '2026-12-01', 'open', '', ''],
  ['#2 overdue', 'me', '2026-11-01', 'open', '', ''],
  ['#3 no due', 'me', '', 'open', '', ''],
  ['#4 waits on open #11', 'me', '', 'waiting', '', '#11'],
  ['#5 waits on done #12', 'me', '2026-12-31', 'waiting', '', '#12'],
  ['#6 needs your call', 'you', '', 'open', '', ''],
  ['#7 ruling pending', 'me', '', '待決定', '', ''],
  ['#8 fixed date ahead', 'me', '', 'waiting', '', '2026-12-15'],
  ['#9 fixed date passed', 'me', '', 'waiting', '', '2026-11-01'],
  ['#10 tag missing', 'me', '', 'waiting', '', 'proj:v9.9.9'],
  ['#11 prerequisite', 'agent', '', 'open', '', ''],
  ['#12 finished', 'me', '', 'done', '', ''],
  ['#13 tag present', 'me', '', 'waiting', '', 'proj:v1.0.0'],
  ['#14 free text', 'me', '', 'waiting', '', 'after round 14 finishes'],
  ['#15 CI run', 'CI', '', 'open', '', ''],
  ['#16 unseen project', 'me', '', 'waiting', '', 'stranger:v1.0.0'],
  ['#17 vendor quote', 'me', '', 'asked-awaiting', 'the quote', 'the reply arrives'],
];
const carrier = (rows = ROWS) => `# Open work\n\n${HEAD}${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}\n`;

/** A directory holding the main carrier and a real git repository `proj` tagged v1.0.0; returns what to run. */
function stage(text = carrier()) {
  const dir = h.makeDir('r');
  const proj = makeProject(dir, 'proj', { tags: ['v1.0.0'] });
  writeFileSync(join(dir, 'w.md'), text);
  return { dir, proj, args: ['open-work', 'triage', 'w.md', ...NOW, '--root', `proj=${proj}`] };
}

/** The titles under one section heading of the output, in the order printed. */
function section(out, name) {
  const lines = out.split('\n');
  const start = lines.findIndex((l) => l.includes(`## ${name}`));
  if (start === -1) return null;
  const titles = [];
  for (const l of lines.slice(start + 1)) {
    if (l.includes('## ')) break;
    const m = /row "([^"]+)"/.exec(l);
    if (m) titles.push(m[1].split(' ')[0]); // "#2"
  }
  return titles;
}

const sorted = (xs) => [...xs].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

it('uds open-work triage puts every open item in exactly one of workable, decide and blocked, and the three add up to the visible open items (XSPEC-528 R2, R4)', async () => {
  const { dir, args } = stage();
  const r = await h.runCli(args, dir);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(0);
  // First line: the three counts. 17 rows, 1 done, so 16 visible open items = 8 + 2 + 6 (counted by hand).
  expect(out.split('\n')[0]).toMatch(/TRIAGE workable=8 decide=2 blocked=6 \| visible open items: 16 \| done, not counted: 1/);
  expect(sorted(section(out, 'WORKABLE'))).toEqual(['#1', '#13', '#14', '#16', '#2', '#3', '#5', '#9'].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))));
  expect(sorted(section(out, 'DECIDE'))).toEqual(['#6', '#7']);
  expect(sorted(section(out, 'BLOCKED'))).toEqual(['#10', '#11', '#15', '#17', '#4', '#8'].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))));
  // the done item is in no section at all
  for (const name of ['WORKABLE', 'DECIDE', 'BLOCKED']) expect(section(out, name)).not.toContain('#12');
  // every open item appears in one section only
  const all = [...section(out, 'WORKABLE'), ...section(out, 'DECIDE'), ...section(out, 'BLOCKED')];
  expect(all).toHaveLength(16);
  expect(new Set(all).size).toBe(16);
  expect(r.netLog, 'no network').toEqual([]);
});

it('uds open-work triage does not read a due date as a start condition: an item with a due date and no unmet dependency is workable, and the date only orders the list and marks OVERDUE (XSPEC-528 R1, R4)', async () => {
  const dir = h.makeDir('r1');
  writeFileSync(join(dir, 'w.md'), carrier([
    ['A due ahead', 'me', '2026-12-01', 'open', '', ''],
    ['B undated', 'me', '', 'open', '', ''],
    ['C overdue', 'me', '2026-11-01', 'open', '', ''],
    ['D due far ahead but waits on an unmet date', 'me', '2027-01-01', 'waiting', '', '2026-12-15'],
  ]));
  const r = await h.runCli(['open-work', 'triage', 'w.md', ...NOW], dir);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(0);
  // A and C have a due date and no dependency: workable. D waits on a date in its release condition, so it is blocked; its due date is not why.
  expect(out.split('\n')[0]).toMatch(/TRIAGE workable=3 decide=0 blocked=1 \| visible open items: 4/);
  // ordered by due date, the undated one last (titles are the first word of each row: A, B, C)
  const order = out.split('\n').slice(out.split('\n').findIndex((l) => l.includes('## WORKABLE')) + 1).filter((l) => /row "/.test(l)).slice(0, 3).map((l) => /row "(\S+)/.exec(l)[1]);
  expect(order).toEqual(['C', 'A', 'B']);
  // overdue is marked, and only for the one whose due date has passed (26 days before 2026-11-27)
  expect(out).toMatch(/row "C overdue"\)[^\n]*due 2026-11-01 OVERDUE 26d/);
  expect(out).toMatch(/row "A due ahead"\)[^\n]*due 2026-12-01(?! OVERDUE)/);
});

it('uds open-work triage sends an item that waits for a person to decide, by owner or by status word, to decide, and one that waits for another agent, CI, a reply or an unmet dependency to blocked (XSPEC-528 R2, R4)', async () => {
  const { dir, args } = stage();
  const r = await h.runCli(args, dir);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(0);
  const decide = out.split('\n').filter((l) => /row "#(6|7) /.test(l));
  expect(decide).toHaveLength(2);
  expect(decide.join('\n')).toMatch(/owner: you/);
  expect(decide.join('\n')).toMatch(/status says a ruling is pending/);
  // why each blocked item is blocked is printed, so it can be checked and not taken on trust
  expect(out).toMatch(/row "#4 waits on open #11"\)[^\n]*waits for #11, which is not done/);
  expect(out).toMatch(/row "#8 fixed date ahead"\)[^\n]*waits for 2026-12-15, a date that has not come/);
  expect(out).toMatch(/row "#10 tag missing"\)[^\n]*waits for proj:v9\.9\.9, which is not there/);
  expect(out).toMatch(/row "#15 CI run"\)[^\n]*owner: CI/);
  expect(out).toMatch(/row "#17 vendor quote"\)[^\n]*asked and waiting for a reply/);
  // and the items whose dependency IS met are workable
  expect(section(out, 'WORKABLE')).toEqual(expect.arrayContaining(['#5', '#9', '#13']));
});

it('uds open-work triage lists a release condition it cannot read as workable and in the CANNOT-JUDGE list, and does not treat a sentence as an unmet condition (XSPEC-528 R3, R4)', async () => {
  const { dir, args } = stage();
  const r = await h.runCli(args, dir);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(0);
  // #14 is free text; #16 names a project this machine cannot see. Both are listed, and both stay in workable.
  expect(section(out, 'CANNOT-JUDGE')).toEqual(['#14', '#16']);
  expect(section(out, 'WORKABLE')).toEqual(expect.arrayContaining(['#14', '#16']));
  expect(section(out, 'BLOCKED')).not.toContain('#14');
  expect(section(out, 'BLOCKED')).not.toContain('#16');
  expect(out).toMatch(/row "#14 free text"\)[^\n]*free text: "after round 14 finishes"/);
  expect(out).toMatch(/row "#16 unseen project"\)[^\n]*stranger:v1\.0\.0[^\n]*no directory on this machine is declared/);
  // the first-line counts do not change by listing them: the list is a part of workable, not a fourth kind
  expect(out.split('\n')[0]).toMatch(/workable=8 decide=2 blocked=6/);
  expect(out).toMatch(/2 of the workable items could not be judged automatically/);
});

it('uds open-work triage reads Chinese column names and a list-item carrier the same way (XSPEC-528 R2, R3, R4)', async () => {
  const dir = h.makeDir('zh');
  writeFileSync(join(dir, 'zh.md'), '| 項目 | 卡在誰 | 期限 | 狀態 | 在等什麼 |\n|---|---|---|---|---|\n'
    + '| 甲 有期限 | 我 | 2026-12-01 | 進行中 | |\n'
    + '| 乙 要你裁決 | 你 | | 進行中 | |\n'
    + '| 丙 自由文字 | 我 | | 等待 | 等第十四輪跑完 |\n'
    + '| 丁 等廠商 | 廠商 | | 進行中 | |\n');
  writeFileSync(join(dir, 'list.md'), '# Open work\n\n- Draft vendor mail\n  - owner: me\n  - due: 2026-12-01\n  - status: open\n- Pick a database\n  - owner: you\n  - status: open\n');
  const zh = await h.runCli(['open-work', 'triage', 'zh.md', ...NOW], dir);
  expect(zh.code, zh.stdout + zh.stderr).toBe(0);
  expect(zh.stdout.split('\n')[0]).toMatch(/TRIAGE workable=2 decide=1 blocked=1 \| visible open items: 4/);
  expect(section(zh.stdout, 'WORKABLE').sort()).toEqual(['丙', '甲'].sort());
  expect(section(zh.stdout, 'CANNOT-JUDGE')).toEqual(['丙']);
  const list = await h.runCli(['open-work', 'triage', 'list.md', ...NOW], dir);
  expect(list.code, list.stdout + list.stderr).toBe(0);
  expect(list.stdout.split('\n')[0]).toMatch(/TRIAGE workable=1 decide=1 blocked=0 \| visible open items: 2/);
});

it('uds open-work triage exits 2, which is not a pass, when it can read nothing or a row it cannot read would be left out, and says what it did not see (XSPEC-528 R2, OWT-006)', async () => {
  const dir = h.makeDir('exit2');
  writeFileSync(join(dir, 'notes.md'), '# Notes\n\nnothing here\n');
  const none = await h.runCli(['open-work', 'triage', 'notes.md', ...NOW], dir);
  expect(none.code).toBe(2);
  expect(none.stdout + none.stderr).toMatch(/CANNOT DECIDE: no open-work record/);
  // a row with one cell too many cannot be placed in a column: it is named, never counted as workable, and the exit is 2
  writeFileSync(join(dir, 'ragged.md'), `${HEAD}| a | me | | open | | |\n| b | me | | open | | | extra |\n`);
  const ragged = await h.runCli(['open-work', 'triage', 'ragged.md', ...NOW], dir);
  const out = ragged.stdout + ragged.stderr;
  expect(ragged.code, out).toBe(2);
  expect(out).toMatch(/TRIAGE workable=1 decide=0 blocked=0 \| visible open items: 1/);
  expect(out).toMatch(/UNSEEN[^\n]*table rows that could not be read=1/);
  expect(out).toMatch(/CANNOT DECIDE: 1 table row\(s\) could not be read/);
  const badNow = await h.runCli(['open-work', 'triage', 'ragged.md', '--now', 'last tuesday'], dir);
  expect(badNow.code).toBe(2);
  expect(badNow.stdout + badNow.stderr).toMatch(/--now must be a date with a year/);
  const noFiles = await h.runCli(['open-work', 'triage'], dir);
  expect(noFiles.code).toBe(2);
});

it('uds open-work triage reads a bare version in a release condition against the project it runs in, and says every run what it cannot decide (XSPEC-528 R3, OWT-011, OWT-016)', async () => {
  const dir = h.makeDir('bare');
  const proj = makeProject(dir, 'self', { tags: ['v1.0.0'] });
  writeFileSync(join(dir, 'w.md'), carrier([
    ['has the tag', 'me', '', 'waiting', '', 'v1.0.0'],
    ['lacks the tag', 'me', '', 'waiting', '', 'v2.0.0'],
  ]));
  const r = await h.runCli(['open-work', 'triage', 'w.md', ...NOW, '--root', proj], dir);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(0);
  expect(out.split('\n')[0]).toMatch(/TRIAGE workable=1 decide=0 blocked=1 \| visible open items: 2/);
  expect(out).toMatch(/COVERAGE UNKNOWN \(OWT-011\)/);
  expect(out).toMatch(/UNCALIBRATED \(OWT-016\)/);
});

// ── the cuts: each reads the same carrier through a build with one line removed or weakened ─────────────────────

const read = (rel) => readFileSync(join(REAL_CLI_DIR, rel), 'utf8');
const swap = (text, from, to) => {
  expect(text.split(from).length - 1, `the cut anchor must match exactly once: ${from}`).toBe(1);
  return text.replace(from, () => to);
};
const BODY = 'src/utils/open-work-tracking.mjs';

it('CUT cli/bin/uds.js .action(openWorkTriageCommand): with the registration removed, uds open-work triage prints no triage, so the entry tests go red (XSPEC-528 R4)', async () => {
  const cut = createHarness('xspec528-cut-action', { overrides: { 'bin/uds.js': swap(read('bin/uds.js'), '.action(openWorkTriageCommand);', '.action(() => {});') } });
  try {
    const { dir, args } = stage();
    const real = await h.runCli(args, dir);
    const dead = await cut.runCli(args, dir);
    expect(real.stdout.split('\n')[0]).toMatch(/TRIAGE workable=8/);
    expect(dead.stdout + dead.stderr, 'the cut build must not print the triage').not.toMatch(/TRIAGE workable=/);
  } finally { cut.cleanup(); }
});

it('CUT cli/src/commands/open-work.js wire:triage: with the call into the checker removed, the command exits 0 and prints nothing, so the entry tests go red (XSPEC-528 R4)', async () => {
  const wire = 'process.exitCode = main([...argv, ...files]); // wire:triage';
  const cut = createHarness('xspec528-cut-wire', { overrides: { 'src/commands/open-work.js': swap(read('src/commands/open-work.js'), wire, '/* cut */') } });
  try {
    const { dir, args } = stage();
    const dead = await cut.runCli(args, dir);
    expect(dead.stdout + dead.stderr, 'the cut build must not print the triage').not.toMatch(/TRIAGE workable=/);
    // and the exit code that said "cannot decide" is gone with it: a silent 0 for a carrier that has no records
    writeFileSync(join(dir, 'notes.md'), '# Notes\n\nnothing\n');
    expect((await cut.runCli(['open-work', 'triage', 'notes.md', ...NOW], dir)).code).toBe(0);
    expect((await h.runCli(['open-work', 'triage', 'notes.md', ...NOW], dir)).code).toBe(2);
  } finally { cut.cleanup(); }
});

const NEUTRALISE = ['const selfTest = runSelfTest();', 'const selfTest = { ok: true, failures: [] };'];

/**
 * Weaken one rule of the body and read the carrier through the weakened build twice: as shipped, where the checker's own
 * self-test arms notice and the command refuses to decide (exit 2); and with those arms switched off, which is the build an
 * entry test alone would face. Returns the second run, so each test can show what the entry-level difference is.
 */
async function throughWeakened(label, anchor, weak, armName) {
  const body = swap(read(BODY), anchor, weak);
  const shipped = createHarness(`${label}-armed`, { overrides: { [BODY]: body } });
  const blind = createHarness(`${label}-blind`, { overrides: { [BODY]: swap(body, ...NEUTRALISE) } });
  try {
    const { dir, args } = stage();
    const armed = await shipped.runCli(args, dir);
    expect(armed.code, 'the checker\'s own arms must refuse a weakened rule').toBe(2);
    expect(armed.stdout + armed.stderr).toContain(armName);
    return await blind.runCli(args, dir);
  } finally { shipped.cleanup(); blind.cleanup(); }
}

it('CUT [mutation-anchor:triage-unmet]: with a due date counted as an unmet dependency, items with a due date leave workable, so the R1 test goes red (XSPEC-528 R1, R4)', async () => {
  const anchor = 'const unmet = conditions.filter((c) => c.status === \'unmet\'); // [mutation-anchor:triage-unmet]';
  const weak = 'const unmet = conditions.filter((c) => c.status === \'unmet\').concat(dueDay !== null && dueDay > ctx.now ? [{ status: \'unmet\', why: \'due\' }] : []); // [mutation-anchor:triage-unmet]';
  const real = await (async () => { const { dir, args } = stage(); return h.runCli(args, dir); })();
  const weakened = await throughWeakened('xspec528-cut-due', anchor, weak, 'XSPEC-528 R1 clean: a due date ahead');
  expect(real.stdout.split('\n')[0]).toMatch(/TRIAGE workable=8 decide=2 blocked=6/);
  // #1 (due 2026-12-01) and #5 (due 2026-12-31) are no longer workable
  expect(weakened.stdout.split('\n')[0]).toMatch(/TRIAGE workable=6 decide=2 blocked=8/);
  expect(section(weakened.stdout, 'BLOCKED')).toEqual(expect.arrayContaining(['#1', '#5']));
});

it('CUT [mutation-anchor:triage-decide]: with a wait for a person\'s ruling counted as workable, the decide section empties, so the R2 test goes red (XSPEC-528 R2, R4)', async () => {
  const anchor = 'if (ownerKind === \'decider\' || statusSaysDecide) return { kind: \'decide\', why: ownerKind === \'decider\' ? `owner: ${owner}` : \'status says a ruling is pending\', dueDay, cannotJudge: [] }; // [mutation-anchor:triage-decide]';
  const weakened = await throughWeakened('xspec528-cut-decide', anchor, '/* cut: [mutation-anchor:triage-decide] */', 'XSPEC-528 R2 clean: a wait for a person is decide');
  expect(weakened.stdout.split('\n')[0]).toMatch(/TRIAGE workable=10 decide=0 blocked=6/);
});

it('CUT [mutation-anchor:triage-cannot-judge]: with a condition it cannot read counted as unmet, those items are hidden in blocked, so the R3 test goes red (XSPEC-528 R3, R4)', async () => {
  const anchor = 'const unresolved = conditions.filter((c) => c.status === \'unresolved\'); // [mutation-anchor:triage-cannot-judge]';
  const weak = 'const unresolved = []; unmet.push(...conditions.filter((c) => c.status === \'unresolved\')); // [mutation-anchor:triage-cannot-judge]';
  const weakened = await throughWeakened('xspec528-cut-judge', anchor, weak, 'XSPEC-528 R3 clean: free text is workable');
  expect(section(weakened.stdout, 'BLOCKED')).toEqual(expect.arrayContaining(['#14', '#16']));
  expect(weakened.stdout.split('\n')[0]).not.toMatch(/workable=8/);
});
