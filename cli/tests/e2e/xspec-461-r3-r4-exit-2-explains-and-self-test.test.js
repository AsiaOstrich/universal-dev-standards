/**
 * E2E: when `uds open-work next-action` finds no next-action field, it says why
 * (dev-platform XSPEC-461 R3 and R4).
 *
 * Exit 2 ("cannot decide") is deliberate: no field found is not a pass. But it said nothing about whether the
 * carrier writes the column in words the list does not hold, or has no next-action field at all, and those call
 * for opposite actions. The exit code does not change. The text now goes on to list, per carrier, the table
 * headers and headings it saw (about 20, then "and N more"), the words it recognises (declared ones marked apart),
 * one line on how to add a word, and which of the cases the carrier is in.
 *
 * R4: `uds open-work self-test` carries a red and a green sample for the declared word, for the list that must not
 * be widened and for this explanation; with any one detection removed from a copy of the checker its own
 * self-test exits 2 naming the sample that went unnoticed.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/open-work.js   process.exitCode = main([...argv, ...wordArgv, ...files]); // wire:next-action
 *   cli/src/commands/open-work.js   process.exitCode = main(argv);
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, realpathSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createHarness, REAL_CLI_DIR } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec461-r3');
const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'uds-xspec461-r3-')));
afterAll(() => { h.cleanup(); rmSync(scratch, { recursive: true, force: true }); });

it('uds open-work next-action exits 2 as before for a table whose header is 待辦 and now prints the headers it saw, the words it knows and how to add one (XSPEC-461 R3)', async () => {
  const dir = h.makeDir('r3-table');
  writeFileSync(join(dir, 'w.md'), '# Worklog\n\n## Open\n\n| item | owner | 待辦 |\n|---|---|---|\n| a | albert | edit scripts/foo.mjs |\n\n## Done\n\n| item | owner | 待辦 |\n|---|---|---|\n| b | albert | edit scripts/bar.mjs |\n');
  const r = await h.runCli(['open-work', 'next-action', 'w.md'], dir);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(2);
  expect(out).toMatch(/CANNOT DECIDE: no next-action field found in any carrier \(walked 0\)\. Exit 2 is not a pass\./);
  expect(out).toMatch(/WHY: no carrier had a next-action field\. What each one showed:/);
  expect(out).toMatch(/w\.md: has 2 table\(s\), but no table header matches a recognised word; if one of them is your next-action column, declare its word/);
  // the header that was not recognised is shown, once, with how many tables carry it
  expect(out).toMatch(/table headers \(3 distinct\): "item" \(x2\), "owner" \(x2\), "待辦" \(x2\)/);
  expect(out).toMatch(/headings \(3 distinct\): "Worklog", "Open", "Done"/);
  // the words it recognises, built in and declared apart
  expect(out).toMatch(/WORDS RECOGNISED[^\n]*built in: next action, next step[^\n]*下一步 \| 下一動 \| 回來要做什麼 \| 下一個動作 \| 下一個步驟 \| 接下來要做什麼/);
  expect(out).toMatch(/declared by you: none/);
  expect(out).toMatch(/TO ADD A WORD: pass --next-action-word <word>[^\n]*open_work: next_action_words: in uds\.project\.yaml/);
  expect(r.stdout, 'exit 2 goes to the error stream, as before').toBe('');
});

it('uds open-work next-action tells a carrier with a table from one with nothing to read, marks declared words apart, and lists each carrier separately (XSPEC-461 R3)', async () => {
  const dir = h.makeDir('r3-cases');
  writeFileSync(join(dir, 'table.md'), '| a | b |\n|---|---|\n| 1 | 2 |\n');
  writeFileSync(join(dir, 'headings.md'), '# Notes\n\n## Ideas\n\ntext\n');
  writeFileSync(join(dir, 'bare.md'), 'just a few words, no table and no heading\n');
  const r = await h.runCli(['open-work', 'next-action', 'table.md', 'headings.md', 'bare.md', '--next-action-word', '待辦', '--next-action-word', '後續'], dir);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(2);
  expect(out).toMatch(/table\.md: has 1 table\(s\), but no table header matches a recognised word/);
  expect(out).toMatch(/headings\.md: has no table, and no heading matches a recognised word; if one of these headings is your next-action section, declare its word/);
  expect(out).toMatch(/bare\.md: has no table and no heading to read; this carrier may have no next-action field at all, and no word would change that/);
  expect(out).toMatch(/declared by you: 待辦 \| 後續/);
  // a carrier with nothing to read has no list of headers or headings under it
  const afterBare = out.slice(out.indexOf('bare.md:'));
  expect(afterBare.split('\n')[1]).toMatch(/WORDS RECOGNISED/);
});

it('uds open-work next-action lists about 20 headers per carrier and says how many more there were (XSPEC-461 R3)', async () => {
  const dir = h.makeDir('r3-many');
  const headers = Array.from({ length: 30 }, (_, i) => `col${String(i + 1).padStart(2, '0')}`);
  writeFileSync(join(dir, 'wide.md'), `| ${headers.join(' | ')} |\n|${headers.map(() => '---').join('|')}|\n| ${headers.map(() => 'x').join(' | ')} |\n`);
  const r = await h.runCli(['open-work', 'next-action', 'wide.md'], dir);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(2);
  expect(out).toMatch(/table headers \(30 distinct\): "col01", "col02"/);
  expect(out).toMatch(/"col20", and 10 more/);
  expect(out).not.toMatch(/"col21"/);
});

it('uds open-work next-action says nothing more on a result it can decide, and for an unreadable next-action table says that the column was found but its rows were not (XSPEC-461 R3)', async () => {
  const dir = h.makeDir('r3-decided');
  writeFileSync(join(dir, 'ok.md'), '| item | Next action |\n|---|---|\n| a | edit scripts/foo.mjs |\n');
  const ok = await h.runCli(['open-work', 'next-action', 'ok.md'], dir);
  expect(ok.code, ok.stdout + ok.stderr).toBe(0);
  expect(ok.stdout + ok.stderr).not.toMatch(/WHY:|WORDS RECOGNISED/);
  writeFileSync(join(dir, 'ragged.md'), '| item | Next action |\n|---|---|\n| a |\n');
  const ragged = await h.runCli(['open-work', 'next-action', 'ragged.md'], dir);
  expect(ragged.code, ragged.stdout + ragged.stderr).toBe(2);
  expect(ragged.stderr).toMatch(/UNDECIDABLE/);
  expect(ragged.stderr).toMatch(/ragged\.md: has a next-action column, but its table rows could not be read \(see UNDECIDABLE above\)/);
  expect(ragged.stderr, 'it does not claim the carrier has no such column').not.toMatch(/no table header matches/);
});

// One removal per detection: the text that, taken out of a copy of the checker, leaves the red sample unnoticed.
const REMOVALS = [
  ['461 R1 clean: 下一個動作, 下一個步驟 and 接下來要做什麼 are read by default', "  ['下一個動作', '下一個動作'],\n", ''],
  ['461 R1 violating: 待辦 is not read unless declared', "  ['接下來要做什麼', '接下來要做什麼'],\n", "  ['接下來要做什麼', '接下來要做什麼'],\n  ['待辦', '待辦'],\n"],
  ['461 R2 clean: a declared word is read as a table header', "return new RegExp(`${VOCAB.nextAction.source}|${words.map(escapeRegExp).join('|')}`, 'i'); // [mutation-anchor:declared-merged]", 'return VOCAB.nextAction; // [mutation-anchor:declared-merged]'],
  ['461 R2 clean: a declared word is plain text', 'words.map(escapeRegExp).join', 'words.join'],
  ['461 R2 violating: a blank declared word is refused', "if (!word) return { words: [], error: 'a declared next-action word", "if (false) return { words: [], error: 'a declared next-action word"],
  ['461 R3 clean: exit-2 text names the headers the carrier showed', "show('table headers', d.headers);", 'void 0;'],
  ['461 R3 clean: a carrier with a table and one with nothing to read are told apart', "else if (d.tables > 0) verdict =", "else if (false) verdict ="],
];

it('uds open-work self-test exits 0, and with any one next-action word detection removed its own self-test exits 2 naming the red sample that went unnoticed (XSPEC-461 R4)', async () => {
  const dir = h.makeDir('r4-selftest');
  const ok = await h.runCli(['open-work', 'self-test'], dir);
  expect(ok.code, ok.stdout + ok.stderr).toBe(0);
  expect(ok.stdout).toMatch(/self-test: OK/);

  const source = readFileSync(join(REAL_CLI_DIR, 'src', 'utils', 'open-work-tracking.mjs'), 'utf8');
  for (const [arm, from, to] of REMOVALS) {
    const n = source.split(from).length - 1;
    expect(n, `the removal for "${arm}" must apply exactly once`).toBe(1);
    const mutant = join(scratch, `mutant-${Math.random().toString(36).slice(2)}.mjs`);
    writeFileSync(mutant, source.replace(from, () => to));
    const r = spawnSync(process.execPath, [mutant, '--self-test'], { encoding: 'utf8' });
    const out = `${r.stdout}${r.stderr}`;
    expect(r.status, `${arm}: ${out}`).toBe(2);
    expect(out, arm).toMatch(/self-test FAILED/);
    expect(out, arm).toContain(arm);
  }
});
