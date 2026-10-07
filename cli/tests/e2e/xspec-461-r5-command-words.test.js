/**
 * E2E: which programs `uds open-work` reads as a command (dev-platform XSPEC-461 R5).
 *
 * A user's next action `glab mr merge 486` was read as naming nothing: the built-in list had no `glab` (and no
 * `dotnet`, which that user's .NET project uses). An extension point existed in the module (`extraCommands`) but
 * no option or setting reached it, and `waiting` never passed it on to the check that asks "does this draft name
 * an action". So: `glab` and `dotnet` are built in (the two with an instance, and no more: `go`, `make` and `sh` are
 * common words and stay out), `--command-word <program>` and `open_work.command_words` declare others, and
 * `next-action` AND `waiting` both read them. The test below declares one word and shows the SAME text change its
 * verdict under both commands, which is the case a single missing argument would break.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/open-work.js   const commandArgv = commandArguments(options.commandWord, declared.commandWords); // wire:next-action-command-words
 *   cli/src/commands/open-work.js   const commandArgv = commandArguments(options.commandWord, declared.commandWords); // wire:waiting-command-words
 */

import { it, expect, afterAll } from 'vitest';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { WAITING_HEAD } from '../utils/xspec-460.js';

const h = createHarness('xspec461-r5');
afterAll(() => h.cleanup());

const nextAction = (cell) => `| item | Next action |\n|---|---|\n| a | ${cell} |\n`;
const draftRow = (draft) => `${WAITING_HEAD}| ask ops | not-yet-asked | ${draft} | | | |\n`;
const na = (dir, file, extra = []) => h.runCli(['open-work', 'next-action', file, ...extra], dir);
const wt = (dir, file, extra = []) => h.runCli(['open-work', 'waiting', file, '--now', '2026-10-07', ...extra], dir);

it('uds open-work next-action reads glab and dotnet as commands without any declaration (XSPEC-461 R5)', async () => {
  const dir = h.makeDir('r5-builtin');
  for (const cell of ['`glab mr merge 486`', '`dotnet test X.csproj`', 'run glab mr merge 486 today', 'run dotnet build now']) {
    writeFileSync(join(dir, 'w.md'), nextAction(cell));
    const r = await na(dir, 'w.md');
    expect(r.code, `${cell}: ${r.stdout}${r.stderr}`).toBe(0);
    expect(r.stdout, cell).toMatch(/<- command:(?:glab|dotnet) /);
    expect(r.stdout, cell).toMatch(/unnamed=0/);
  }
});

it('uds open-work next-action and waiting both change their verdict on the same text once --command-word kubectl is declared (XSPEC-461 R5)', async () => {
  const dir = h.makeDir('r5-both');
  writeFileSync(join(dir, 'next.md'), nextAction('kubectl rollout restart'));
  writeFileSync(join(dir, 'wait.md'), draftRow('kubectl rollout restart'));

  const naBefore = await na(dir, 'next.md');
  expect(naBefore.code, naBefore.stdout + naBefore.stderr).toBe(1);
  expect(naBefore.stdout).toMatch(/unnamed=1/);
  const wtBefore = await wt(dir, 'wait.md');
  expect(wtBefore.code, wtBefore.stdout + wtBefore.stderr).toBe(1);
  expect(wtBefore.stdout).toMatch(/VIOLATION OWT-021: wait\.md table row \(line 3, row "ask ops"\) is not-yet-asked but names no draft or action/);

  const naAfter = await na(dir, 'next.md', ['--command-word', 'kubectl']);
  expect(naAfter.code, naAfter.stdout + naAfter.stderr).toBe(0);
  expect(naAfter.stdout).toMatch(/unnamed=0/);
  expect(naAfter.stdout).toMatch(/<- command:kubectl rollout/);
  expect(naAfter.stdout).toMatch(/RESOLUTION: read as commands in addition to the built-in list: kubectl/);
  const wtAfter = await wt(dir, 'wait.md', ['--command-word', 'kubectl']);
  expect(wtAfter.code, wtAfter.stdout + wtAfter.stderr).toBe(0);
  expect(wtAfter.stdout).not.toMatch(/VIOLATION/);
});

it('uds open-work reads open_work.command_words from uds.project.yaml in next-action and waiting, merges it with --command-word, and refuses a blank or spaced word (XSPEC-461 R5)', async () => {
  const dir = h.makeDir('r5-config');
  writeFileSync(join(dir, 'next.md'), `${nextAction('kubectl rollout restart')}\n${nextAction('terraform plan now').replace('| a |', '| b |')}`);
  writeFileSync(join(dir, 'wait.md'), draftRow('kubectl rollout restart'));
  writeFileSync(join(dir, 'uds.project.yaml'), 'version: "1"\nopen_work:\n  command_words:\n    - kubectl\n');
  const fromFile = await na(dir, 'next.md');
  expect(fromFile.stdout, 'kubectl from the file is read, terraform is not yet').toMatch(/unnamed=1/);
  const merged = await na(dir, 'next.md', ['--command-word', 'terraform']);
  expect(merged.code, merged.stdout + merged.stderr).toBe(0);
  expect(merged.stdout).toMatch(/unnamed=0/);
  const waitFromFile = await wt(dir, 'wait.md');
  expect(waitFromFile.code, waitFromFile.stdout + waitFromFile.stderr).toBe(0);

  for (const bad of ['', '   ', 'git lfs']) {
    for (const [command, run] of [['next-action', na], ['waiting', wt]]) {
      const r = await run(dir, command === 'waiting' ? 'wait.md' : 'next.md', ['--command-word', bad]);
      expect(r.code, `${command} with ${JSON.stringify(bad)}: ${r.stdout}${r.stderr}`).toBe(2);
      expect(r.stderr, command).toMatch(/a declared command word is (?:empty or blank|one program name)/);
    }
  }
  writeFileSync(join(dir, 'uds.project.yaml'), 'version: "1"\nopen_work:\n  command_words: kubectl\n');
  const malformed = await na(dir, 'next.md');
  expect(malformed.code).toBe(2);
  expect(malformed.stderr).toMatch(/\.command_words must be a list of program names/);
});

it('uds open-work still does not read go, make, sh or an undeclared kubectl as a command (XSPEC-461 R5)', async () => {
  const dir = h.makeDir('r5-pinned');
  for (const cell of ['go test the thing', 'make all of it', 'sh run later', '`kubectl apply -f deploy`', 'terraform apply']) {
    writeFileSync(join(dir, 'w.md'), nextAction(cell));
    const r = await na(dir, 'w.md');
    expect(r.code, `${cell}: ${r.stdout}${r.stderr}`).toBe(1);
    expect(r.stdout, cell).toMatch(/unnamed=1/);
    expect(r.stdout, cell).not.toMatch(/<- command:/);
  }
});
