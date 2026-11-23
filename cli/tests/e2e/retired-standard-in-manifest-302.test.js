/**
 * E2E: a project installed by an older UDS still lists a standard this version no longer ships (open-work-tracking,
 * retired in 6.15.0). `uds audit` must not call it a missing file, and `uds audit --report` must not offer it as feedback
 * (dev-platform #302, found on a Windows adopter machine while accepting 6.16.0-beta.3).
 *
 * The project is a real `uds init` output with the retired id added back to manifest.standards and its old file left in
 * .standards/, which is what an upgrade of the CLI without `uds update` leaves behind.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/utils/health-checker.js   continue;  (in the retired-id branch; without it the id falls through to the
 *   file-existence check and is reported as "missing from .standards/")
 */

import { it, expect, afterAll } from 'vitest';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('issue302');
afterAll(() => h.cleanup());

async function projectWithRetiredEntry() {
  const dir = await h.newProject();
  const manifestPath = join(dir, '.standards', 'manifest.json');
  const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
  m.standards = [...(m.standards || []), 'open-work-tracking'];
  writeFileSync(manifestPath, JSON.stringify(m, null, 2));
  writeFileSync(join(dir, '.standards', 'open-work-tracking.ai.yaml'), 'standard:\n  id: open-work-tracking\n');
  return dir;
}

it('uds audit does not report a retired standard as missing, and says uds update removes it (#302)', async () => {
  const dir = await projectWithRetiredEntry();
  const run = await h.runCli(['audit', '--health'], dir);
  const out = run.stdout + run.stderr;
  expect(run.code, out).toBe(0);
  expect(out).not.toContain('missing from .standards/');
  expect(out).toContain('no longer shipped by UDS');
}, 180000);

it('uds audit --report does not offer a retired standard as feedback for UDS maintainers (#302)', async () => {
  const dir = await projectWithRetiredEntry();
  const run = await h.runCli(['audit', '--health', '--report', '--dry-run', '--yes'], dir);
  const out = run.stdout + run.stderr;
  expect(run.code, out).toBe(0);
  expect(out).not.toContain('[Health] open-work-tracking');
  expect(out).not.toMatch(/Title: \[Audit\].*health/);
}, 180000);
