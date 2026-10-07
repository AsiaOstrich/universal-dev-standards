/**
 * E2E: `uds open-work observations` (dev-platform XSPEC-459 R2; open-work-tracking 1.2.0, OWT-023/024/025/026).
 *
 * Some facts an assistant cannot observe: whether a message was sent, whether the other side replied, whether
 * something was approved. The standard allows a hand-written row for exactly those, on three conditions: it
 * says who saw it (observed-by) and when (observed-at); its value is yes, no or unknown, and unknown is a
 * real value that is counted apart and never complete; and its age is shown, with an old one reported as
 * stale and counted apart. A stamp says who saw it and when, never that it still holds.
 *
 * The test spawns the real CLI (`uds open-work observations ...`) in a throwaway directory and reads back the
 * counts, the lines for unknown and stale, the violations and the exit code. Time is injected so it cannot drift.
 *
 * Wire that makes this red when cut (one line of CLI source):
 *   cli/src/commands/open-work.js   process.exitCode = main([...argv, ...files]); // wire:observations
 */

import { it, expect, afterAll } from 'vitest';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec459-r2');
afterAll(() => h.cleanup());

const HEAD = '| fact | status | observed-by | observed-at | value |\n|---|---|---|---|---|\n';

it('uds open-work observations counts unknown apart and never as complete, shows every age, and counts an old observation as stale and not confirmed (XSPEC-459 R2)', async () => {
  const dir = h.makeDir('r2');
  writeFileSync(join(dir, 'facts.md'), `# Facts\n\n${HEAD}`
    + '| mail sent | open | albert | 2026-10-05 | yes |\n'
    + '| legal replied | open | albert | 2026-09-01 | yes |\n'
    + '| approved | open | albert | 2026-10-06 | unknown |\n'
    + '| quote accepted | open | albert | 2026-10-04 | no |\n');

  const r = await h.runCli(['open-work', 'observations', 'facts.md', '--now', '2026-10-07'], dir);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(0);
  // one confirmed (yes, well formed, fresh); the unknown and the stale one are NOT in it
  expect(out).toMatch(/yes=2 no=1 unknown=1 invalid=0 \| stale=1 \| confirmed=1 /);
  // every observation shows its age
  expect(out).toMatch(/value=yes age=2d by=albert at=2026-10-05\s+facts\.md table row \(line 5, row "mail sent"\)/);
  expect(out).toMatch(/value=yes age=36d by=albert at=2026-09-01\s+facts\.md table row \(line 6, row "legal replied"\)/);
  expect(out).toMatch(/value=unknown age=1d /);
  // unknown is listed on its own line, as never complete
  expect(out).toMatch(/UNKNOWN \(counted apart, never complete\): facts\.md table row \(line 7, row "approved"\)/);
  // the old one is listed as stale, with its age, and is not confirmed
  expect(out).toMatch(/STALE \(observed 36d ago, older than 7d; counted apart, not confirmed\): facts\.md table row \(line 6, row "legal replied"\)/);
  expect(out).not.toMatch(/VIOLATION/);
  // the limit is stated in every run
  expect(out).toMatch(/It cannot decide that an observation is true, or that it is still true now/);

  // the threshold is a declared number: with a 60-day threshold the same row is no longer stale
  const wide = await h.runCli(['open-work', 'observations', 'facts.md', '--now', '2026-10-07', '--stale-after', '60'], dir);
  expect(wide.stdout).toMatch(/stale=0 \| confirmed=2 /);
  expect(wide.netLog, 'no network').toEqual([]);
});

it('uds open-work observations rejects a row with no observed-by, no observed-at or no yes/no/unknown value, an unknown marked done, and a fact version control already knows, and exits 1 (XSPEC-459 R2)', async () => {
  const dir = h.makeDir('r2');
  writeFileSync(join(dir, 'facts.md'), HEAD
    + '| a mail sent | open | | 2026-10-05 | yes |\n'
    + '| b mail replied | open | albert | | yes |\n'
    + '| c approved | open | albert | 2026-10-05 | maybe |\n'
    + '| d budget approved | done | albert | 2026-10-05 | unknown |\n'
    + '| e PR merged | open | albert | 2026-10-05 | yes |\n'
    + '| f seen tomorrow | open | albert | 2026-10-09 | yes |\n');
  const r = await h.runCli(['open-work', 'observations', 'facts.md', '--now', '2026-10-07'], dir);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(1);
  expect(out).toMatch(/VIOLATION OWT-023: facts\.md table row \(line 3, row "a mail sent"\) has no observed-by/);
  expect(out).toMatch(/VIOLATION OWT-023: facts\.md table row \(line 4, row "b mail replied"\) has no observed-at/);
  expect(out).toMatch(/VIOLATION OWT-023: facts\.md table row \(line 5, row "c approved"\) has no value of yes, no or unknown \(found "maybe"\)/);
  expect(out).toMatch(/VIOLATION OWT-024: facts\.md table row \(line 6, row "d budget approved"\) is marked done while its observation is unknown/);
  expect(out).toMatch(/VIOLATION OWT-026: facts\.md table row \(line 7, row "e PR merged"\)/);
  expect(out).toMatch(/VIOLATION OWT-023: facts\.md table row \(line 8, row "f seen tomorrow"\) has an observed-at \(2026-10-09\) later than today \(2026-10-07\)/);
  // none of the six is confirmed
  expect(out).toMatch(/confirmed=0 /);
});

it('uds open-work observations reads Chinese column names, and exits 2, which is not a pass, when no carrier has an observed-by or observed-at field (XSPEC-459 R2)', async () => {
  const dir = h.makeDir('r2');
  writeFileSync(join(dir, 'zh.md'), '| 事實 | 觀察者 | 觀察時間 | 值 |\n|---|---|---|---|\n| 法務已回覆 | 阿明 | 2026-10-06 | 未知 |\n| 信已寄出 | 阿明 | 2026-10-06 | 是 |\n');
  const zh = await h.runCli(['open-work', 'observations', 'zh.md', '--now', '2026-10-07'], dir);
  expect(zh.code, zh.stdout + zh.stderr).toBe(0);
  expect(zh.stdout).toMatch(/yes=1 no=0 unknown=1 invalid=0 \| stale=0 \| confirmed=1 /);

  writeFileSync(join(dir, 'notes.md'), '| fact | value |\n|---|---|\n| mail sent | yes |\n');
  const none = await h.runCli(['open-work', 'observations', 'notes.md', '--now', '2026-10-07'], dir);
  expect(none.code, none.stdout + none.stderr).toBe(2);
  expect(none.stdout + none.stderr).toMatch(/CANNOT DECIDE: no observation record/);
});
