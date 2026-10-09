/**
 * E2E: `uds hitl check` never answers "approved" by accident (dev-platform XSPEC-471 R4).
 *
 * Two ways it did. With no terminal to answer on (a script, a pipe, a closed stdin) and no CI variable set, a risky operation
 * opened a prompt that never got an answer: the process printed a stack trace and ended with exit code 0, which a caller that
 * reads the exit code takes as "approved". And `uds hitl check` without `--op` printed its error and also ended with 0.
 *
 * Every test runs the real CLI with its stdin closed (the harness gives a child no stdin unless the test drives one) and
 * with `CI` and `UDS_NON_INTERACTIVE` emptied, so the result does not depend on the machine the test runs on.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/hitl/manager.js   if (process.env.CI || process.env.UDS_NON_INTERACTIVE || !process.stdin.isTTY) {
 *   cli/src/commands/hitl.js  process.exit(2); // not 0
 */

import { it, expect, afterAll } from 'vitest';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec471-r4c-hitl');
afterAll(() => h.cleanup());

const noTerminal = { env: { CI: '', UDS_NON_INTERACTIVE: '' } };

it('uds hitl check denies a risky operation, with exit 1, when there is no terminal to ask on', async () => {
  const run = await h.runCli(['hitl', 'check', '--op', 'drop table users'], h.makeDir('hitl'), noTerminal);
  expect(run.stdout + run.stderr).toContain('Blocked (Safety First)');
  expect(run.stdout).toContain('Denied');
  expect(run.stdout + run.stderr).not.toContain('ExitPromptError');
  expect(run.code).toBe(1);
});

it('uds hitl check still approves a routine operation without asking, with exit 0', async () => {
  const run = await h.runCli(['hitl', 'check', '--op', 'ls'], h.makeDir('hitl'), noTerminal);
  expect(run.stdout).toContain('Approved');
  expect(run.code).toBe(0);
});

it('uds hitl check without --op says so and exits 2, not 0', async () => {
  const run = await h.runCli(['hitl', 'check'], h.makeDir('hitl'), noTerminal);
  expect(run.stderr).toContain('--op <operation> is required');
  expect(run.stdout).not.toContain('Approved');
  expect(run.code).toBe(2);
});
