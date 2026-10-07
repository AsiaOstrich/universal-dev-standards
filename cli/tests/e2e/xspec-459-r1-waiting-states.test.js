/**
 * E2E: `uds open-work waiting` (dev-platform XSPEC-459 R1; open-work-tracking 1.2.0, OWT-020/021/022).
 *
 * A user testing 6.14.0-beta.5 found that a message drafted but never sent and a message sent and awaiting a
 * reply both read as "waiting", and that nobody could tell which. The standard now names the two states
 * (`not-yet-asked`, `asked-awaiting`) and `uds open-work waiting` reads them from the carrier's status field.
 * A waiting item in neither is named one by one, and is never counted as done.
 *
 * The test spawns the real CLI (`uds open-work waiting ...`) in a throwaway directory and reads back the
 * counts, the named items and the exit code. Time is injected (`--now`) so the result does not drift.
 *
 * Wire that makes this red when cut (one line of CLI source):
 *   cli/src/commands/open-work.js   process.exitCode = main([...argv, ...files]); // wire:waiting
 */

import { it, expect, afterAll } from 'vitest';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec459-r1');
afterAll(() => h.cleanup());

const HEAD = '| item | status | draft | asked-at | waiting for | release |\n|---|---|---|---|---|---|\n';

it('uds open-work waiting names a waiting item that does not say whether it was asked, counts the two states apart, and exits 1 for it and 0 without it (XSPEC-459 R1)', async () => {
  const dir = h.makeDir('r1');
  const carrier = join(dir, 'worklog.md');
  writeFileSync(carrier, `# Worklog\n\n${HEAD}`
    + '| ask legal | not-yet-asked | drafts/legal.md | | | |\n'
    + '| ask vendor | 已問、等回覆 | | 2026-10-01 | the quote | the reply arrives |\n'
    + '| ask board | waiting | | | | |\n'
    + '| ship it | done | | | | |\n');

  const bad = await h.runCli(['open-work', 'waiting', 'worklog.md', '--now', '2026-10-07'], dir);
  const out = bad.stdout + bad.stderr;
  expect(bad.code, out).toBe(1);
  // the two named states are counted apart, the unspecified one is counted on its own line, done stays at one
  expect(out).toMatch(/not-yet-asked=1 asked-awaiting=1 waiting-unspecified=1 done=1 other=0/);
  // it is named, one by one, with the row it came from
  expect(out).toMatch(/VIOLATION OWT-020: worklog\.md table row \(line 7, row "ask board"\) is waiting but does not say whether it has been asked/);
  // and only that item: the two stated ones are not violations
  expect(out.match(/VIOLATION/g)).toHaveLength(1);
  // the age of the ask is shown for the asked one
  expect(out).toMatch(/asked-awaiting\s+worklog\.md table row \(line 6, row "ask vendor"\)[^\n]*\(asked 6d ago\)/);
  // what the check cannot see is said, every run
  expect(out).toMatch(/COVERAGE UNKNOWN \(OWT-011\)/);
  expect(out).toMatch(/UNCALIBRATED \(OWT-016\)/);

  // the same carrier with that one item stated: no violation, exit 0, and still no item is counted done by this check
  writeFileSync(carrier, `# Worklog\n\n${HEAD}`
    + '| ask legal | not-yet-asked | drafts/legal.md | | | |\n'
    + '| ask vendor | 已問、等回覆 | | 2026-10-01 | the quote | the reply arrives |\n'
    + '| ask board | not-yet-asked | `docs/board-question.md` | | | |\n'
    + '| ship it | done | | | | |\n');
  const ok = await h.runCli(['open-work', 'waiting', 'worklog.md', '--now', '2026-10-07'], dir);
  expect(ok.code, ok.stdout + ok.stderr).toBe(0);
  expect(ok.stdout).toMatch(/not-yet-asked=2 asked-awaiting=1 waiting-unspecified=0 done=1 other=0/);
  expect(ok.stdout).not.toMatch(/VIOLATION/);
  expect(ok.netLog, 'no network').toEqual([]);
});

it('uds open-work waiting holds a not-yet-asked item to naming its draft and an asked-awaiting item to asked-at, what it waits for and its release (XSPEC-459 R1)', async () => {
  const dir = h.makeDir('r1');
  writeFileSync(join(dir, 'w.md'), `${HEAD}`
    + '| a | not-yet-asked | an email to legal | | | |\n'
    + '| b | asked-awaiting | | | the quote | the reply arrives |\n'
    + '| c | asked-awaiting | | 2026-10-01 | the quote | |\n'
    + '| d | asked-awaiting | | 2099-01-01 | the quote | the reply arrives |\n');
  const r = await h.runCli(['open-work', 'waiting', 'w.md', '--now', '2026-10-07'], dir);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(1);
  expect(out).toMatch(/VIOLATION OWT-021: w\.md table row \(line 3, row "a"\) is not-yet-asked but names no draft or action/);
  expect(out).toMatch(/VIOLATION OWT-022: w\.md table row \(line 4, row "b"\) is asked-awaiting but has no asked-at/);
  expect(out).toMatch(/VIOLATION OWT-022: w\.md table row \(line 5, row "c"\) is asked-awaiting but does not state what event releases it \(OWT-002\)/);
  expect(out).toMatch(/VIOLATION OWT-022: w\.md table row \(line 6, row "d"\) has an asked-at \(2099-01-01\) later than today \(2026-10-07\)/);
  expect(out.match(/VIOLATION/g)).toHaveLength(4);
});

it('uds open-work waiting exits 2, which is not a pass, when no record has a status field, and when --now is not a date (XSPEC-459 R1)', async () => {
  const dir = h.makeDir('r1');
  writeFileSync(join(dir, 'notes.md'), '# Notes\n\nnothing here\n');
  const none = await h.runCli(['open-work', 'waiting', 'notes.md'], dir);
  expect(none.code, none.stdout + none.stderr).toBe(2);
  expect(none.stdout + none.stderr).toMatch(/CANNOT DECIDE: no record with a status field/);
  writeFileSync(join(dir, 'w.md'), `${HEAD}| a | not-yet-asked | drafts/a.md | | | |\n`);
  const bad = await h.runCli(['open-work', 'waiting', 'w.md', '--now', 'last tuesday'], dir);
  expect(bad.code).toBe(2);
  expect(bad.stdout + bad.stderr).toMatch(/--now must be a date with a year/);
});
