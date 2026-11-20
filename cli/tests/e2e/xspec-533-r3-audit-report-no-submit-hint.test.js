/**
 * E2E: `uds audit --report` does not tell the person who already passed --report to "Submit feedback: uds audit
 * --report" (dev-platform XSPEC-533 R3).
 *
 * Found on a real Windows machine (6.16.0-beta.2): the hint was printed at the end of the very run that was the
 * submission flow. The code read an internal flag nothing ever set.
 *
 * Every test spawns the real CLI in a throwaway directory that has no UDS standards installed: that is a finding
 * the audit can report without a network, a clock or a repository. `--dry-run` keeps --report from submitting.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/audit.js   outputTerminal(auditResult, msg, { isReport }); // wire:audit-report-flag-reaches-terminal-output
 */

import { it, expect, afterAll } from 'vitest';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec533-r3');
afterAll(() => h.cleanup());

const HINT = 'Submit feedback: uds audit --report';

it('uds audit without --report prints the "Submit feedback" hint when there is something to report (XSPEC-533 R3: the control that proves the hint can appear)', async () => {
  const dir = h.makeDir('bare');
  const run = await h.runCli(['audit'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout).toContain('UDS not initialized in this project'); // the finding that earns the hint
  expect(run.stdout).toContain(HINT);
}, 120000);

it('uds audit --report does not print the "Submit feedback" hint, and still runs the report step (XSPEC-533 R3)', async () => {
  const dir = h.makeDir('bare');
  const run = await h.runCli(['audit', '--report', '--dry-run'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout).toContain('UDS not initialized in this project'); // same finding as the control
  expect(run.stdout).not.toContain(HINT);
  // The --report path did run: the dry-run says what it would have sent.
  expect(run.stdout).toContain('Dry run');
  expect(run.stdout).toContain('Title: [Audit] 1 health');
}, 120000);
