/**
 * E2E: the "when was it asked" and "what is it waiting for" columns of a carrier can be declared, and a violation says
 * which of three faults it is (dev-platform XSPEC-475 R3).
 *
 * The report (Windows, beta.9): a real carrier headed its columns `何時問` and `問什麼`. `uds open-work waiting` did not
 * know those words, so every asked-awaiting row failed with "has no asked-at" - the same words as for a column that is
 * blank - and nothing said which headers were accepted or how to add one. `waiting-on-reply` was 0 for the real carrier.
 * Now:
 *   - `--asked-at-word` / `--waiting-for-word` (and `open_work.asked_at_words` / `waiting_for_words` in
 *     uds.project.yaml) declare the project's own words, for `waiting` and for `next-action` alike;
 *   - a field that is NOT FOUND, a field that is BLANK and a field that holds a value that is NOT A DATE are three
 *     different messages, and the first lists the headers the record has and the ones that are accepted.
 *
 * Every test runs the real CLI (`uds open-work waiting|next-action`) on a carrier file and reads the exit code and the
 * printed lines. `--now` fixes the date, so no expected line depends on the day the test runs.
 *
 * Wires that make these red when cut (one line of source each):
 *   cli/src/commands/open-work.js          argv.push(...fieldWordArguments('--asked-at-word', ...)); // wire:waiting-asked-at-words
 *   cli/src/utils/open-work-tracking.mjs   if (!roles.includes(role) && declaredRoleRegExp(...)?.test(header)) roles.push(role); // [mutation-anchor:declared-role-word]
 */

import { it, expect, afterAll } from 'vitest';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec475-r3');
afterAll(() => h.cleanup());

const NOW = ['--now', '2026-10-05'];

/** A carrier whose columns are the real carrier's: 事項 | 狀態 | 何時問 | 問什麼 | 解除條件 | 下一步. */
const CARRIER = [
  '| 事項 | 狀態 | 何時問 | 問什麼 | 解除條件 | 下一步 |',
  '|---|---|---|---|---|---|',
  '| 問報價 | 已問、等回覆 | 2026-10-01 | 報價單 | 對方回信 | 等對方回覆 |',
  ''
].join('\n');

function project(files = {}) {
  const dir = h.makeDir('r3');
  writeFileSync(join(dir, 'w.md'), CARRIER);
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}
const words = (text) => `${text.stdout}${text.stderr}`;

it('uds open-work waiting on a carrier with columns it does not know says no column was found, lists the headers it saw and the accepted ones, and how to declare a word (XSPEC-475 R3)', async () => {
  const dir = project();
  const run = await h.runCli(['open-work', 'waiting', 'w.md', ...NOW], dir);
  expect(run.code, words(run)).toBe(1);

  const asked = run.stdout.split('\n').find((l) => /VIOLATION OWT-022/.test(l) && /asked-at/.test(l));
  expect(asked, run.stdout).toBeTruthy();
  expect(asked, 'a column that is not found').toContain('No column or label of this record is read as asked-at');
  expect(asked, 'the headers the record has').toContain('headers seen: "事項", "狀態", "何時問", "問什麼", "解除條件", "下一步"');
  expect(asked, 'what is accepted').toMatch(/Accepted: asked-at, asked on/);
  expect(asked, 'how to declare a word, in both places').toMatch(/--asked-at-word <word>, or open_work\.asked_at_words in uds\.project\.yaml/);

  const waitingFor = run.stdout.split('\n').find((l) => /VIOLATION OWT-022/.test(l) && /does not state what it waits for/.test(l));
  expect(waitingFor, run.stdout).toBeTruthy();
  expect(waitingFor).toMatch(/--waiting-for-word <word>, or open_work\.waiting_for_words in uds\.project\.yaml/);
});

it('uds open-work waiting tells a column that is not found from a blank one and from a value that is not a date (XSPEC-475 R3)', async () => {
  const header = '| 事項 | 狀態 | asked-at | waiting for | release |\n|---|---|---|---|---|\n';
  const dir = project({
    'blank.md': `${header}| q | asked-awaiting | | the quote | the reply |\n`,
    'baddate.md': `${header}| q | asked-awaiting | last week | the quote | the reply |\n`
  });

  const blank = await h.runCli(['open-work', 'waiting', 'blank.md', ...NOW], dir);
  expect(blank.code, words(blank)).toBe(1);
  expect(blank.stdout).toMatch(/is asked-awaiting but has no asked-at\n/);
  expect(blank.stdout, 'the column exists, so it is not reported as not found').not.toContain('No column or label');

  const bad = await h.runCli(['open-work', 'waiting', 'baddate.md', ...NOW], dir);
  expect(bad.code, words(bad)).toBe(1);
  expect(bad.stdout).toContain('has an asked-at that is not a date with a year: "last week"');
  expect(bad.stdout).not.toContain('No column or label');
});

it('uds open-work waiting reads the columns --asked-at-word and --waiting-for-word declare, and the row passes (XSPEC-475 R3)', async () => {
  const dir = project();
  const run = await h.runCli(['open-work', 'waiting', 'w.md', ...NOW, '--asked-at-word', '何時問', '--waiting-for-word', '問什麼'], dir);
  expect(run.code, words(run)).toBe(0);
  expect(run.stdout).not.toContain('VIOLATION');
  // Read back: the row was read as asked-awaiting and aged from the declared column.
  expect(run.stdout).toMatch(/asked-awaiting\s+w\.md table row \(line 3, row "問報價"\).*\(asked 4d ago\)/);

  // A declared word is plain text and any case, and one flag alone does not stand in for the other.
  const onlyAsked = await h.runCli(['open-work', 'waiting', 'w.md', ...NOW, '--asked-at-word', '何時問'], dir);
  expect(onlyAsked.code, words(onlyAsked)).toBe(1);
  expect(onlyAsked.stdout).not.toMatch(/OWT-022.*asked-at/);
  expect(onlyAsked.stdout).toMatch(/does not state what it waits for/);
});

it('uds open-work waiting reads open_work.asked_at_words and waiting_for_words from uds.project.yaml, and a flag adds to them (XSPEC-475 R3)', async () => {
  const dir = project({
    'uds.project.yaml': ['version: "1"', 'open_work:', '  asked_at_words:', '    - 何時問', '  waiting_for_words:', '    - 問什麼', ''].join('\n')
  });
  const run = await h.runCli(['open-work', 'waiting', 'w.md', ...NOW], dir);
  expect(run.code, words(run)).toBe(0);
  expect(run.stdout).toMatch(/\(asked 4d ago\)/);

  const bad = project({ 'uds.project.yaml': ['version: "1"', 'open_work:', '  asked_at_words: 何時問', ''].join('\n') });
  const refused = await h.runCli(['open-work', 'waiting', 'w.md', ...NOW], bad);
  expect(refused.code, words(refused)).toBe(2);
  expect(words(refused)).toContain('asked_at_words must be a list of words');
});

it('uds open-work next-action reads the same declared columns, so a waiting-on-reply row is not judged as an unnamed next action (XSPEC-475 R3)', async () => {
  const dir = project();
  const before = await h.runCli(['open-work', 'next-action', 'w.md', ...NOW], dir);
  expect(before.code, words(before)).toBe(1);
  expect(before.stdout).toContain('VIOLATION OWT-019');

  const after = await h.runCli(['open-work', 'next-action', 'w.md', ...NOW, '--asked-at-word', '何時問', '--waiting-for-word', '問什麼'], dir);
  expect(after.code, words(after)).toBe(0);
  expect(after.stdout).toContain('waiting-on-reply=1');
  expect(after.stdout).toMatch(/asked 4d ago \(2026-10-01\); waiting for: 報價單; released by: 對方回信/);
});

it('uds open-work waiting refuses a blank declared word instead of dropping it, exit 2 (XSPEC-475 R3)', async () => {
  const dir = project();
  const run = await h.runCli(['open-work', 'waiting', 'w.md', ...NOW, '--asked-at-word', ' '], dir);
  expect(run.code, words(run)).toBe(2);
  expect(words(run)).toContain('a declared --asked-at-word is empty or blank');
});
