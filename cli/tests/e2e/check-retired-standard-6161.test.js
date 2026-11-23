/**
 * E2E: `uds check` on a project whose manifest still lists a standard UDS retired (open-work-tracking, 6.15.0), the case an
 * adopter reaches by upgrading the CLI before running `uds update` (dev-platform #302 A, decision 665甲).
 *
 * Three things, each read back from a real `uds check` / `uds update --apply` run:
 *   1. the AGENTS.md section says the retired id is retired and what removes it, and the command it names really does remove
 *      it from the manifest; a misspelled id (no installed file) keeps the "delete it by hand" advice;
 *   2. "AI tool integration status" does not count the retired id as a missing standard (it printed 73/74 and "missing ...");
 *   3. it is the same predicate `uds audit` uses, so the two commands agree about which id is retired.
 *
 * Wire that makes these red when cut (one line of CLI source each):
 *   cli/src/commands/check.js  `const retiredEntries = new Set(retiredStandardEntries(manifest, projectPath));` in
 *     checkIntegrationFiles (and the one in checkAgentsMdSync): make it `new Set()` and the id is a "missing standard" again
 *     and the AGENTS.md section calls it "removed upstream or misspelled".
 */

import { it, expect, afterAll } from 'vitest';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('retired6161');
afterAll(() => h.cleanup());

const readManifest = (dir) => JSON.parse(readFileSync(join(dir, '.standards', 'manifest.json'), 'utf8'));

/** A real `uds init` project with the retired id listed (and its old file left behind), plus optional extra manifest entries. */
async function projectListing({ extra = [], withAgentsMd = true } = {}) {
  const dir = await h.newProject();
  const manifestPath = join(dir, '.standards', 'manifest.json');
  const m = readManifest(dir);
  m.standards = [...m.standards, 'open-work-tracking', ...extra];
  if (withAgentsMd) m.generateAgentsMd = true;
  writeFileSync(manifestPath, JSON.stringify(m, null, 2));
  writeFileSync(join(dir, '.standards', 'open-work-tracking.ai.yaml'), 'standard:\n  id: open-work-tracking\n');
  return dir;
}

it('uds check calls a retired standard retired, keeps the by-hand advice for a misspelled id, and the named command removes the retired one (#302)', async () => {
  const dir = await projectListing({ extra: ['typo-standard'] });
  const run = await h.runCli(['check'], dir);
  const out = run.stdout + run.stderr;
  expect(out).toContain('Retired standards still listed in the manifest (1), not counted above: open-work-tracking');
  expect(out).toContain('`uds update --apply` removes them from the manifest');
  // the misspelled id (no installed file) is NOT called retired: it keeps the original wording and is alone in its list
  expect(out).toContain('Manifest entries that match no installed standard (1), not counted above: typo-standard');
  expect(out).toContain('delete them from the "standards" list');

  // the command the message names does what it says
  const update = await h.runCli(['update', '--apply', '--yes'], dir);
  expect(update.code, update.stdout + update.stderr).toBe(0);
  const after = readManifest(dir);
  expect(after.standards).not.toContain('open-work-tracking');
  expect(after.standards).toContain('typo-standard');
}, 180000);

it('uds check does not count a retired standard as a missing one in the AI tool integration status (#302)', async () => {
  const dir = await projectListing({ withAgentsMd: false });
  const run = await h.runCli(['check'], dir);
  const out = run.stdout + run.stderr;
  expect(out).toContain('standards referenced');
  expect(out).not.toMatch(/Missing:.*open-work-tracking/);
  // the count is over the standards UDS still ships: every one of them is referenced
  const counts = out.match(/(\d+)\/(\d+) standards referenced/);
  expect(counts, out).not.toBeNull();
  expect(counts[1]).toBe(counts[2]);
}, 180000);
