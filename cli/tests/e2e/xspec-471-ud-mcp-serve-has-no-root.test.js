/**
 * E2E: `uds mcp serve` has no `--root` option (dev-platform XSPEC-471 R4, the user's decision of 2026-10-09).
 *
 * The option was accepted and stored in `McpServer.udsRoot`, which nothing read, so `--root /elsewhere` changed no answer
 * while looking as if it chose where the standards come from. It is removed. A person who still passes it must be told,
 * with a non-zero exit, not served as if it had worked.
 *
 * Every test runs the real CLI. The server is never started by the first two (commander refuses before the action runs).
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/mcp.js   .command('serve')   (a `.option('--root <path>', ...)` added after it brings the option back)
 */

import { it, expect, afterAll } from 'vitest';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec471-ud-mcp-root');
afterAll(() => h.cleanup());

it('uds mcp serve --root <path> is refused with commander\'s unknown-option error and a non-zero exit', async () => {
  const dir = h.makeDir('mcp');
  const run = await h.runCli(['mcp', 'serve', '--root', dir], dir);
  expect(run.stderr).toContain("error: unknown option '--root'");
  expect(run.code).toBe(1);
  expect(run.stdout, 'the server must not have started').not.toContain('jsonrpc');
  expect(run.stderr).not.toContain('UDS MCP Design Standards Server started');
});

it('uds mcp serve --help no longer lists --root', async () => {
  const dir = h.makeDir('mcp');
  const run = await h.runCli(['mcp', 'serve', '--help'], dir);
  expect(run.code).toBe(0);
  expect(run.stdout).toContain('Start MCP Design Standards Server');
  expect(run.stdout).not.toContain('--root');
});

it('uds mcp serve without --root still starts and ends when its input ends (the control: only the option went)', async () => {
  const dir = h.makeDir('mcp');
  const run = await h.runCli(['mcp', 'serve'], dir);
  expect(run.code, run.stderr).toBe(0);
  expect(run.stderr).toContain('UDS MCP Design Standards Server started (stdio)');
});
