/**
 * E2E: `uds open-work self-test` carries a violating and a satisfying sample for every new check
 * (dev-platform XSPEC-459 R3; open-work-tracking 1.2.0, OWT-020 to OWT-026; OWT-015: a check never observed red is not evidence).
 *
 * Two readings, both from the real CLI entry:
 *   1. `uds open-work self-test` exits 0 and says OK on the unmodified source.
 *   2. For each of the seven requirements, a copy of the checker's source with ONE detection removed (the red sample
 *      stops being caught) makes its own self-test exit 2, which is not a pass, and name the arm that went quiet.
 *      A mutation that did not apply exactly once fails the test, so a no-op cannot pass for a red one.
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

const h = createHarness('xspec459-r3');
const scratch = realpathSync(mkdtempSync(join(tmpdir(), 'uds-xspec459-r3-')));
afterAll(() => { h.cleanup(); rmSync(scratch, { recursive: true, force: true }); });

// One removal per requirement: the detection that catches the red sample of that requirement.
const REMOVALS = [
  ['OWT-020 violating', "const unspecified = state === 'waiting-unspecified';", 'const unspecified = false;'],
  ['OWT-021 violating', "const named = classifyNextAction(`${r.f.draft ?? ''} ${r.f.status}`, { root: opts.root, idPattern: opts.idPattern }).status !== 'unnamed';", 'const named = true;'],
  ['OWT-022 violating: asked-awaiting has no asked-at', "if (day === null) bad('OWT-022', r.f.askedAt === undefined", "if (false) bad('OWT-022', r.f.askedAt === undefined"],
  ['OWT-023 violating: an observation with no observed-by', 'if (by === undefined || BLANK_FIELD.test(by)) fail(', 'if (false) fail('],
  ['OWT-024 violating: unknown marked done', "if (claimsDone) bad('OWT-024'", "if (false) bad('OWT-024'"],
  ['OWT-025 violating', 'const isStale = age !== null && age > staleAfter;', 'const isStale = false;'],
  ['OWT-026 violating', 'if (VOCAB_STATE.derivable.test(subject)) fail(', 'if (false) fail('],
];

it('uds open-work self-test exits 0, and with any one new detection removed its own self-test exits 2 naming the red sample that went unnoticed (XSPEC-459 R3)', async () => {
  const dir = h.makeDir('r3');
  const ok = await h.runCli(['open-work', 'self-test'], dir);
  expect(ok.code, ok.stdout + ok.stderr).toBe(0);
  expect(ok.stdout).toMatch(/self-test: OK/);

  const source = readFileSync(join(REAL_CLI_DIR, 'src', 'utils', 'open-work-tracking.mjs'), 'utf8');
  for (const [arm, from, to] of REMOVALS) {
    const n = source.split(from).length - 1;
    expect(n, `the removal for "${arm}" must apply exactly once`).toBe(1);
    const mutant = join(scratch, `mutant-${arm.slice(0, 7)}-${Math.random().toString(36).slice(2)}.mjs`);
    writeFileSync(mutant, source.replace(from, () => to));
    const r = spawnSync(process.execPath, [mutant, '--self-test'], { encoding: 'utf8' });
    const out = `${r.stdout}${r.stderr}`;
    expect(r.status, `${arm}: ${out}`).toBe(2);
    expect(out, arm).toMatch(/self-test FAILED/);
    expect(out, arm).toContain(arm);
  }
});
