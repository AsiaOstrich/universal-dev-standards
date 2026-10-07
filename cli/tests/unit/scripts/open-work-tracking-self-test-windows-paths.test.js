/**
 * The checker runs its own self-test before every `uds open-work` command, and a failed arm makes the
 * command exit 2. On Windows CI (2026-10-07, run 37583283045) every `uds open-work` command exited 2
 * because one arm compared the resolution line with a hard-coded POSIX path: the line prints
 * `resolve('/fake/root')`, which is `D:\fake\root` on Windows, not `/fake/root`.
 *
 * This test runs the self-test with Node's Windows path rules (path.win32) on any OS, so the arm that
 * prints a resolved root is checked the way Windows resolves it. Other arms read real files on this
 * machine and may disagree with Windows path rules here, so the test names the arms that only format a
 * path and requires those to pass.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('node:path', async () => {
  const actual = await vi.importActual('node:path');
  return { ...actual.win32, default: actual.win32 };
});

const { runSelfTest } = await import('../../../src/utils/open-work-tracking.mjs');

describe('open-work-tracking self-test under Windows path rules', () => {
  it('the arm that checks the resolution line passes when the root resolves the Windows way, so uds open-work does not exit 2 on Windows', () => {
    const { failures } = runSelfTest();
    const resolutionArms = failures.filter((name) => name.startsWith('461 R6 clean: the resolution lines say the root'));
    expect(resolutionArms).toEqual([]);
  });
});
