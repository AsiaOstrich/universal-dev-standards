/**
 * E2E: `uds deps --if-present` (dev-platform XSPEC-456 R6).
 *
 * `uds deps` exits 1 in a project with no package.json, on purpose: a check that examined nothing must not be
 * able to show a pass. That makes it awkward in a shared script that also runs in .NET or Go projects.
 * `--if-present` is the explicit opt-in: exit 0, and say out loud that nothing was checked.
 *
 * Every test spawns the real CLI (`uds deps ...`) in a throwaway directory and reads the exit code and the
 * words back. The harness blocks the network; none of these cases may need it.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/deps.js   const skip = notApplicableReason(root, Boolean(options.ifPresent));
 */

import { it, expect, afterAll } from 'vitest';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec456-r6');
afterAll(() => h.cleanup());

it('uds deps exits non-zero without a package.json, and uds deps --if-present exits 0 and says nothing was checked (XSPEC-456 R6)', async () => {
  const dir = h.makeDir('r6');

  const plain = await h.runCli(['deps'], dir);
  expect(plain.code, plain.stdout + plain.stderr).toBe(1);
  expect(plain.stderr + plain.stdout).toMatch(/no package\.json/);

  const optIn = await h.runCli(['deps', '--if-present'], dir);
  expect(optIn.code, optIn.stdout + optIn.stderr).toBe(0);
  expect(optIn.stdout).toMatch(/Not applicable: there is no package\.json, so nothing was checked/);
  expect(optIn.stdout, 'no tick').not.toMatch(/✓/);

  const json = await h.runCli(['deps', '--if-present', '--json'], dir);
  expect(json.code).toBe(0);
  expect(JSON.parse(json.stdout)).toMatchObject({ notApplicable: true, examined: 0 });

  // In another language the sentence changes, the contract does not.
  const zh = await h.runCli(['deps', '--if-present'], dir, { ui: 'zh-tw' });
  expect(zh.code).toBe(0);
  expect(zh.stdout).toMatch(/不適用：沒有 package\.json，未檢查任何東西/);

  expect(optIn.netLog, 'no network').toEqual([]);
});

it('uds deps --if-present also accepts a package with no runtime dependencies, and without the flag that case still exits 1 (XSPEC-456 R6)', async () => {
  const dir = h.makeDir('r6');
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'zero-deps', version: '1.0.0' }));

  const plain = await h.runCli(['deps'], dir);
  expect(plain.code, plain.stdout + plain.stderr).toBe(1);
  expect(plain.stdout).toMatch(/Nothing was examined/);

  const optIn = await h.runCli(['deps', '--if-present'], dir);
  expect(optIn.code, optIn.stdout + optIn.stderr).toBe(0);
  expect(optIn.stdout).toMatch(/Nothing was examined/);
  expect(optIn.stdout).toMatch(/Not applicable: this package declares no runtime dependencies, so nothing was checked/);
  expect(optIn.netLog, 'no network').toEqual([]);
});
