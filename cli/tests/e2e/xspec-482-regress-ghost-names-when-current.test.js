/**
 * E2E: `uds update --apply` on a project with nothing else to do still drops the skill and command names UDS cannot vouch
 * for (dev-platform XSPEC-456 R4, kept through XSPEC-482 R6; found by the post-publish acceptance of 6.14.0-beta.13).
 *
 * The promise since beta.6: `update --apply` removes `_shared` and retired names from `skills.names` / `commands.names`.
 * It was kept by the reconciler's own run, which only happens when the plan holds an action. XSPEC-482 R6 made a fresh
 * project current, so a plan with nothing to do became the normal case, took the "Everything is up to date" early return,
 * and left the names in the manifest. The existing XSPEC-456 R4 tests put ghost FOLDERS on disk, which makes the plan
 * non-empty and so never reached that return.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/update.js   droppedNames = before - (...); // wire:up-to-date-prunes-names
 */

import { it, expect, afterAll } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { readManifest, writeManifest, out } from '../utils/xspec-482.js';

const h = createHarness('xspec482-ghost-names');
afterAll(() => h.cleanup());

it('uds update --apply on a current project drops ghost names from the manifest although the plan is empty, and says so (XSPEC-456 R4 through XSPEC-482 R6)', async () => {
  const dir = await h.newProject();
  const m = readManifest(dir);
  const before = { skills: m.skills.names.length, commands: m.commands.names.length };
  m.skills.names.push('_shared', 'retired-skill-469');
  m.commands.names.push('retired-command-469');
  m.upstream.version = '6.9.0';
  writeManifest(dir, m);
  expect(existsSync(join(dir, '.claude', 'skills', '_shared')), 'fixture: names only, no ghost folder, so the plan stays empty').toBe(false);

  const plan = await h.runCli(['update', '--plan', '--offline'], dir);
  expect(out(plan), 'fixture: the plan really is empty').toContain('No changes needed');

  const apply = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(apply.code, out(apply)).toBe(0);
  expect(out(apply)).toContain('Everything is up to date');
  expect(out(apply)).toContain('Dropped 3 skill/command name(s)');
  const after = readManifest(dir);
  expect(after.skills.names).not.toContain('_shared');
  expect(after.skills.names).not.toContain('retired-skill-469');
  expect(after.commands.names).not.toContain('retired-command-469');
  expect(after.skills.names.length).toBe(before.skills);
  expect(after.commands.names.length).toBe(before.commands);
  expect(after.upstream.version, 'and the version moved, as before').not.toBe('6.9.0');
}, 240000);

it('uds update --apply on a current project whose names are all real writes nothing and does not claim to have dropped any (control)', async () => {
  const dir = await h.newProject();
  const apply = await h.runCli(['update', '--apply', '--yes', '--offline'], dir);
  expect(apply.code, out(apply)).toBe(0);
  expect(out(apply)).toContain('Everything is up to date');
  expect(out(apply)).not.toContain('Dropped');
}, 240000);
