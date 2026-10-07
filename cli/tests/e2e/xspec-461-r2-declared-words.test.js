/**
 * E2E: an adopting project declares the words its carriers use for "next action"
 * (dev-platform XSPEC-461 R2).
 *
 * The built-in list is an initial judgment (OWT-016) and an npm-installed user cannot edit it, so the words come
 * from `--next-action-word <word>` (repeatable) and from `open_work.next_action_words` in uds.project.yaml. Both
 * are merged into the ONE list, which is read three ways (a heading, a table header, an inline label). A declared
 * word is plain text, any case, matched as a substring like the built-in ones; it is never a pattern, and a blank
 * one is refused rather than dropped, because an empty alternative would match every header and turn the check green.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/open-work.js   const wordArgv = wordArguments(options.nextActionWord, declared.nextActionWords); // wire:next-action-words
 *   cli/src/commands/open-work.js   const wordArgv = wordArguments(options.nextActionWord, declared.nextActionWords); // wire:separation-words
 */

import { it, expect, afterAll } from 'vitest';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec461-r2');
afterAll(() => h.cleanup());

const table = (header) => `| item | owner | ${header} |\n|---|---|---|\n| a item | albert | edit scripts/foo.mjs |\n`;
const nextAction = (dir, files, extra = []) => h.runCli(['open-work', 'next-action', ...files, ...extra], dir);

it('uds open-work next-action --next-action-word 待辦 reads a 待辦 table header, heading and inline label, and without the option the same carriers exit 2 (XSPEC-461 R2)', async () => {
  const dir = h.makeDir('r2-flag');
  writeFileSync(join(dir, 'header.md'), table('待辦'));
  writeFileSync(join(dir, 'heading.md'), '# Worklog\n\n## 待辦\n\n- edit scripts/foo.mjs\n');
  writeFileSync(join(dir, 'label.md'), '# Worklog\n\n- a item\n  - 待辦: edit scripts/foo.mjs\n');
  for (const file of ['header.md', 'heading.md', 'label.md']) {
    const without = await nextAction(dir, [file]);
    expect(without.code, `${file} without: ${without.stdout}${without.stderr}`).toBe(2);
    const withWord = await nextAction(dir, [file], ['--next-action-word', '待辦']);
    expect(withWord.code, `${file} with: ${withWord.stdout}${withWord.stderr}`).toBe(0);
    expect(withWord.stdout, file).toMatch(/walked 1 next-action field\(s\)/);
    expect(withWord.stdout, file).toMatch(/named-unresolved=1/);
  }
  expect(await h.runCli(['open-work', 'next-action', 'header.md', '--next-action-word', '待辦', '--ui-lang', 'en'], dir).then((r) => r.code)).toBe(0);
});

it('uds open-work next-action takes the option more than once, ignores case, and treats a word as plain text, not a pattern (XSPEC-461 R2)', async () => {
  const dir = h.makeDir('r2-plain');
  writeFileSync(join(dir, 'two.md'), `${table('待辦')}\n${table('Follow Up')}`);
  const both = await nextAction(dir, ['two.md'], ['--next-action-word', '待辦', '--next-action-word', 'follow up']);
  expect(both.code, both.stdout + both.stderr).toBe(0);
  expect(both.stdout).toMatch(/walked 2 next-action field\(s\)/);
  expect(both.stdout).toMatch(/table column "待辦"/);
  expect(both.stdout).toMatch(/table column "Follow Up"/);
  const one = await nextAction(dir, ['two.md'], ['--next-action-word', '待辦']);
  expect(one.stdout, 'only the declared one is read').toMatch(/walked 1 next-action field\(s\)/);

  // "to.do" is the text to.do, not "to, any character, do"
  writeFileSync(join(dir, 'dots.md'), `${table('ToXDo')}`);
  const asPattern = await nextAction(dir, ['dots.md'], ['--next-action-word', 'to.do']);
  expect(asPattern.code, 'a dot is a dot').toBe(2);
  writeFileSync(join(dir, 'dots.md'), `${table('To.Do')}`);
  const asText = await nextAction(dir, ['dots.md'], ['--next-action-word', 'to.do']);
  expect(asText.code, asText.stdout + asText.stderr).toBe(0);
  // characters that would break or hijack a pattern are just characters
  writeFileSync(join(dir, 'paren.md'), `${table('(待辦')}`);
  const paren = await nextAction(dir, ['paren.md'], ['--next-action-word', '(待辦']);
  expect(paren.code, paren.stdout + paren.stderr).toBe(0);
});

it('uds open-work next-action refuses an empty, blank or missing --next-action-word with a reason and exit 2, and does not run the check without it (XSPEC-461 R2)', async () => {
  const dir = h.makeDir('r2-blank');
  writeFileSync(join(dir, 'w.md'), table('Next action'));
  for (const bad of [[''], ['   '], ['待辦', '']]) {
    const args = bad.flatMap((w) => ['--next-action-word', w]);
    const r = await nextAction(dir, ['w.md'], args);
    expect(r.code, `${JSON.stringify(bad)}: ${r.stdout}${r.stderr}`).toBe(2);
    expect(r.stderr).toMatch(/a declared next-action word is empty or blank; it would match every header, so it is refused/);
    expect(r.stdout + r.stderr, 'the check was not run behind the refusal').not.toMatch(/OWT-019 walked/);
  }
});

it('uds open-work next-action merges --next-action-word with open_work.next_action_words in uds.project.yaml, and a blank word in the file is refused the same way (XSPEC-461 R2)', async () => {
  const dir = h.makeDir('r2-config');
  writeFileSync(join(dir, 'w.md'), `${table('待辦')}\n${table('後續')}`);
  writeFileSync(join(dir, 'uds.project.yaml'), 'version: "1"\nopen_work:\n  next_action_words:\n    - 後續\n');
  const fileOnly = await nextAction(dir, ['w.md']);
  expect(fileOnly.code, fileOnly.stdout + fileOnly.stderr).toBe(0);
  expect(fileOnly.stdout).toMatch(/walked 1 next-action field\(s\)/);
  expect(fileOnly.stdout).toMatch(/table column "後續"/);
  const merged = await nextAction(dir, ['w.md'], ['--next-action-word', '待辦']);
  expect(merged.code, merged.stdout + merged.stderr).toBe(0);
  expect(merged.stdout).toMatch(/walked 2 next-action field\(s\)/);

  writeFileSync(join(dir, 'uds.project.yaml'), 'version: "1"\nopen_work:\n  next_action_words:\n    - ""\n');
  const blank = await nextAction(dir, ['w.md']);
  expect(blank.code, blank.stdout + blank.stderr).toBe(2);
  expect(blank.stderr).toMatch(/is empty or blank/);
});

it('uds open-work separation reads a declared word as a progress heading from the same list, so an intent section beside it is still found (XSPEC-461 R2)', async () => {
  const dir = h.makeDir('r2-separation');
  writeFileSync(join(dir, 'both.md'), '# Spec\n\n## Acceptance criteria\n\n- a thing is done\n\n## 待辦\n\n- edit scripts/foo.mjs\n');
  const without = await h.runCli(['open-work', 'separation', 'both.md'], dir);
  expect(without.code, 'the heading is not a progress heading unless declared, so nothing is recognised on that side').toBe(0);
  const withWord = await h.runCli(['open-work', 'separation', 'both.md', '--next-action-word', '待辦'], dir);
  expect(withWord.code, withWord.stdout + withWord.stderr).toBe(1);
  expect(withWord.stdout).toMatch(/VIOLATION OWT-017: both\.md holds intent \(Acceptance criteria\) and progress \(待辦\) in one carrier/);
  writeFileSync(join(dir, 'uds.project.yaml'), 'version: "1"\nopen_work:\n  next_action_words: [待辦]\n');
  const fromFile = await h.runCli(['open-work', 'separation', 'both.md'], dir);
  expect(fromFile.code, fromFile.stdout + fromFile.stderr).toBe(1);
});
