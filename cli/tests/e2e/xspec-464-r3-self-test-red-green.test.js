/**
 * E2E: `uds open-work self-test` carries a satisfying and a violating sample for the waiting-on-reply outcome
 * (dev-platform XSPEC-464 R3; open-work-tracking 1.4.0, OWT-019 and OWT-022; OWT-015: a check never observed red is
 * not evidence).
 *
 * The green sample is an `asked-awaiting` row that carries asked-at, what it waits for and its release. The red
 * samples are the same row with one of those taken away (no asked-at, asked-at in the future, nothing waited for,
 * no release), a row that is `not-yet-asked`, a row in another state, a carrier with no status column and a heading
 * section: each must still be judged by OWT-019. A last arm reads `waiting` and `next-action` over the same rows and
 * requires that they agree.
 *
 * Two readings, both from the real entry:
 *   1. `uds open-work self-test` exits 0 and says OK on the unmodified source, and the arms of this requirement are
 *      among the arms that ran (a self-test that dropped them would also say OK).
 *   2. For each arm, a copy of the checker's source with ONE detection made wrong makes its own self-test exit 2 and name
 *      that arm. A mutation that did not apply exactly once fails the test, so a no-op cannot pass for a red one.
 *
 * Wire that makes this red when cut (one line of CLI source):
 *   cli/src/commands/open-work.js   process.exitCode = main(argv);
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, realpathSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { createHarness, REAL_CLI_DIR } from '../utils/staged-cli-harness.js';
import { selfTestArms } from '../../src/utils/open-work-tracking.mjs';

const h = createHarness('xspec464-r3');
const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'uds-xspec464-r3-')));
afterAll(() => { h.cleanup(); rmSync(scratch, { recursive: true, force: true }); });

const WAITED = "const waitingOnReply = state === 'asked-awaiting' && !raised.some((rule) => rule === 'OWT-020' || rule === 'OWT-022');";

// [arm that must go quiet-and-be-named, text to replace, replacement]. The arm is named by a stretch of its own name.
const WEAKENED = [
  ['an asked-awaiting row with asked-at, what it waits for and its release is waiting-on-reply', WAITED, "const waitingOnReply = false && !raised.some((rule) => rule === 'OWT-020' || rule === 'OWT-022');"],
  ['the Chinese state word and the Chinese field names are read the same way', "if (VOCAB_STATE.askedAwaiting.test(t)) return 'asked-awaiting';", ''],
  ['an asked-awaiting row with no asked-at is still unnamed', "if (day === null) bad('OWT-022', r.f.askedAt === undefined", "if (false) bad('OWT-022', r.f.askedAt === undefined"],
  ['an asked-awaiting row whose asked-at is in the future is still unnamed', "else if (day > now) bad('OWT-022',", "else if (false) bad('OWT-022',"],
  ['an asked-awaiting row that says nothing about what it waits for is still unnamed', "const hasWhat = r.f.awaiting !== undefined && !BLANK_FIELD.test(r.f.awaiting);", 'const hasWhat = true;'],
  ['an asked-awaiting row that says nothing about its release is still unnamed', "const hasRelease = r.f.release !== undefined && !BLANK_FIELD.test(r.f.release);", 'const hasRelease = true;'],
  ['a not-yet-asked row is still unnamed', "const waitingOnReply = state === 'asked-awaiting' && !raised", "const waitingOnReply = (state === 'asked-awaiting' || state === 'not-yet-asked') && !raised"],
  ['a row in any other state is still unnamed', "const waitingOnReply = state === 'asked-awaiting' && !raised", "const waitingOnReply = state !== 'done' && !raised"],
  ['a table with no status column is read exactly as before', 'const reply = it.idx === undefined ? undefined : rows.find(', "const reply = /^wait for/i.test(text) ? { askedDay: 0, age: 0, awaiting: '', release: '' } : rows.find("],
  ['a list item whose release is blank is not read as filled by the Next action line under it', "  ['nextAction', VOCAB.nextAction],\n", ''],
  ['a next action that is a heading section is never waived', 'const reply = it.idx === undefined ? undefined : rows.find(', "const reply = /^wait for/i.test(text) ? { askedDay: 0, age: 0, awaiting: '', release: '' } : rows.find("],
  ['a waiting-on-reply row shows its age and is marked stale past the threshold', 'stale: reply.age !== null && reply.age > staleAfter }', 'stale: false }'],
  ['the stale threshold of a waiting-on-reply row is injectable', 'const staleAfter = opts.staleAfterDays ?? DEFAULT_STALE_AFTER_DAYS;\n  const res = { walked: 0, empty: 0', 'const staleAfter = DEFAULT_STALE_AFTER_DAYS;\n  const res = { walked: 0, empty: 0'],
  ['waiting and next-action never give opposite answers about the same row', 'projects: new Map() }).records;', 'projects: new Map() }).records.filter(() => false);'],
];

it('uds open-work self-test exits 0 with the waiting-on-reply arms among those that ran, and with any one of their detections made wrong its own self-test exits 2 naming that arm (XSPEC-464 R3)', async () => {
  const dir = h.makeDir('r3');
  const ok = await h.runCli(['open-work', 'self-test'], dir);
  expect(ok.code, ok.stdout + ok.stderr).toBe(0);
  expect(ok.stdout).toMatch(/self-test: OK/);

  // the arms exist: a self-test that quietly lost them would still say OK
  const { ran, failures } = selfTestArms();
  expect(failures).toEqual([]);
  const mine = ran.filter((name) => /\(XSPEC-464 R\d\)$/.test(name));
  expect(mine.length).toBeGreaterThanOrEqual(WEAKENED.length);
  for (const [arm] of WEAKENED) expect(mine.filter((name) => name.includes(arm)), `no arm named like: ${arm}`).toHaveLength(1);

  const source = readFileSync(join(REAL_CLI_DIR, 'src', 'utils', 'open-work-tracking.mjs'), 'utf8');
  for (const [arm, from, to] of WEAKENED) {
    const n = source.split(from).length - 1;
    expect(n, `the edit for "${arm}" must apply exactly once`).toBe(1);
    const mutant = join(scratch, `mutant-${Math.random().toString(36).slice(2)}.mjs`);
    writeFileSync(mutant, source.replace(from, () => to));
    const r = spawnSync(process.execPath, [mutant, '--self-test'], { encoding: 'utf8' });
    const out = `${r.stdout}${r.stderr}`;
    expect(r.status, `${arm}: ${out}`).toBe(2);
    expect(out, arm).toMatch(/self-test FAILED/);
    expect(out, `the self-test names the arm: ${arm}`).toContain(arm);
  }
}, 120000);
