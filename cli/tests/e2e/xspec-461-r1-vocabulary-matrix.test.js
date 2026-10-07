/**
 * E2E: which words `uds open-work next-action` reads as "next action"
 * (dev-platform XSPEC-461 R1; AC-1, the 12-header matrix).
 *
 * A user whose carrier has one table per status found the check answering exit 2 ("no next-action field found")
 * and could not tell why. The experiment of 2026-10-07 over twelve headers is the expected value here:
 * before this change `下一步`, `下一步驟`, `下一動`, `回來要做什麼` and `Next action` were read and `下一個動作`, `接下來`,
 * `待辦`, `後續`, `Next`, `TODO`, `Action` were not. 461 R1 adds the three words whose meaning is exactly
 * "next action" (`下一個動作`, `下一個步驟`, `接下來要做什麼`) and deliberately NOT the wider ones, which also head columns
 * that are not the next action. The second test pins that refusal, so that adding `待辦` to the default list turns it red.
 *
 * Every row below runs the real CLI in a throwaway directory and reads back the exit code and the output.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/open-work.js   process.exitCode = main([...argv, ...wordArgv, ...files]); // wire:next-action
 */

import { it, expect, afterAll } from 'vitest';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec461-r1');
afterAll(() => h.cleanup());

/** A carrier with one table per status, the way the user's does; every table has the header under test. */
const carrier = (header) => `# Worklog\n\n${['Open', 'Waiting', 'Done'].map((state) => `## ${state}\n\n| item | owner | ${header} |\n|---|---|---|\n| a ${state} item | albert | edit scripts/foo.mjs |\n`).join('\n')}`;

const READ_BEFORE = ['下一步', '下一步驟', '下一動', '回來要做什麼', 'Next action'];
const ADDED = ['下一個動作', '下一個步驟', '接下來要做什麼'];
const NOT_WIDENED = ['接下來', '待辦', '後續', 'Next', 'TODO', 'Action'];

it('uds open-work next-action reads the five headers it always read and the three 461 R1 adds, in every one of three per-status tables, and exits 0 on each (XSPEC-461 R1)', async () => {
  const dir = h.makeDir('r1-read');
  for (const header of [...READ_BEFORE, ...ADDED]) {
    writeFileSync(join(dir, 'w.md'), carrier(header));
    const r = await h.runCli(['open-work', 'next-action', 'w.md'], dir);
    const out = r.stdout + r.stderr;
    expect(r.code, `${header}: ${out}`).toBe(0);
    expect(out, header).toMatch(/walked 3 next-action field\(s\) in 1 carrier\(s\)/);
    expect(out, header).toMatch(new RegExp(`table column "${header}" \\(line \\d+, row "a (?:Open|Waiting|Done) item"\\)`));
    expect(out, header).not.toMatch(/CANNOT DECIDE/);
  }
});

it('uds open-work next-action still exits 2 for 接下來, 待辦, 後續, Next, TODO and Action unless the project declares them, as a header, a heading and an inline label alike (XSPEC-461 R1)', async () => {
  const dir = h.makeDir('r1-pinned');
  for (const word of NOT_WIDENED) {
    for (const [shape, text] of [
      ['header', carrier(word)],
      ['heading', `# Worklog\n\n## ${word}\n\n- edit scripts/foo.mjs\n`],
      ['label', `# Worklog\n\n- a item\n  - ${word}: edit scripts/foo.mjs\n`],
    ]) {
      writeFileSync(join(dir, 'w.md'), text);
      const r = await h.runCli(['open-work', 'next-action', 'w.md'], dir);
      expect(r.code, `${word} as a ${shape}: ${r.stdout}${r.stderr}`).toBe(2);
      expect(r.stderr, `${word} as a ${shape}`).toMatch(/CANNOT DECIDE: no next-action field found in any carrier \(walked 0\)/);
    }
  }
  // the same carrier, once the word is declared, is read: the refusal is about the default, not about the word
  writeFileSync(join(dir, 'w.md'), carrier('待辦'));
  const declared = await h.runCli(['open-work', 'next-action', 'w.md', '--next-action-word', '待辦'], dir);
  expect(declared.code, declared.stdout + declared.stderr).toBe(0);
  expect(declared.stdout).toMatch(/walked 3 next-action field\(s\)/);
});

it('uds open-work next-action reads a heading and an inline label of the three added words through the same one list (XSPEC-461 R1)', async () => {
  const dir = h.makeDir('r1-shapes');
  for (const word of ADDED) {
    writeFileSync(join(dir, 'heading.md'), `# Worklog\n\n## ${word}\n\n- edit scripts/foo.mjs\n`);
    const heading = await h.runCli(['open-work', 'next-action', 'heading.md'], dir);
    expect(heading.code, `${word}: ${heading.stdout}${heading.stderr}`).toBe(0);
    expect(heading.stdout).toMatch(new RegExp(`section "${word}"`));
    writeFileSync(join(dir, 'label.md'), `# Worklog\n\n- a item\n  - ${word}: edit scripts/foo.mjs\n`);
    const label = await h.runCli(['open-work', 'next-action', 'label.md'], dir);
    expect(label.code, `${word}: ${label.stdout}${label.stderr}`).toBe(0);
    expect(label.stdout).toMatch(/label \(line \d+\)/);
  }
});
