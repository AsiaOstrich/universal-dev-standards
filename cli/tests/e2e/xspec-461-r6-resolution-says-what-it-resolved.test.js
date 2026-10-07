/**
 * E2E: what "resolved" resolved (dev-platform XSPEC-461 R6).
 *
 * A user kept the record outside every repository and got `named-unresolved` for each row that pointed at a file in the
 * repository, with no word on why. Two things were unsaid: paths are looked up under a root, which is the current
 * directory when `--root` is not given; and only a PATH is ever looked up, so a command, a test name or a requirement
 * identifier, which can never be resolved, was counted as `named-unresolved` too, reading like a failure.
 *
 * What is added to the output, after the counts line, and nothing 1.1.0 printed moves or changes (the frozen capture
 * is compared with these lines taken out, in tests/unit/scripts/open-work-tracking-states-and-observations.test.js):
 *   - which directory paths are looked up under, and whether it came from --root or is the current directory
 *   - when the carrier is outside any git repository and no --root is given, a line that says so
 *   - named-unresolved split into path-missing (looked up, not there) and not-resolvable (never looked up)
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/open-work.js   process.exitCode = main([...argv, ...wordArgv, ...commandArgv, ...files]); // wire:next-action
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { makeProject } from '../utils/xspec-460.js';

const h = createHarness('xspec461-r6');
afterAll(() => h.cleanup());

const CARRIER = '| item | Next action |\n|---|---|\n'
  + '| file | edit repo/cli/src/a.js |\n'
  + '| command | `glab mr merge 486` |\n'
  + '| id | finish XSPEC-461 R6 |\n'
  + '| nothing | continue the work |\n';

it('uds open-work next-action run on a record outside every repository, with no --root, says which directory paths are looked up under, that it is the current directory, and that the carrier is outside any repository (XSPEC-461 R6)', async () => {
  const dir = h.makeDir('r6-outside');
  const here = join(dir, 'cwd');
  mkdirSync(here);
  writeFileSync(join(dir, 'record.md'), CARRIER);
  const r = await h.runCli(['open-work', 'next-action', join(dir, 'record.md')], here);
  const out = r.stdout + r.stderr;
  expect(r.code, out).toBe(1);
  expect(out).toContain(`RESOLUTION: a path is looked up under ${here} (the current directory: no --root was given). Only a PATH is looked up.`);
  expect(out).toMatch(new RegExp(`RESOLUTION: ${join(dir, 'record.md').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} is outside any git repository, so its paths are resolved against ${here.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  expect(out).toMatch(/pass --root to say where its paths start/);
});

it('uds open-work next-action counts a command and an identifier as not-resolvable and a path that is not there as path-missing, and the two sum to the unchanged named-unresolved (XSPEC-461 R6)', async () => {
  const dir = h.makeDir('r6-split');
  writeFileSync(join(dir, 'record.md'), CARRIER);
  const r = await h.runCli(['open-work', 'next-action', 'record.md'], dir);
  const out = r.stdout + r.stderr;
  // the three old numbers keep their meaning and their line
  expect(out).toMatch(/\n\[owt\]   named-resolved=0 named-unresolved=3 unnamed=1 undecidable-table-rows=0\n/);
  // and the new line says what the three were
  expect(out).toMatch(/\n\[owt\]   of the named-unresolved \(3\): path-missing=1 not-resolvable=2\n/);
  expect(out).toMatch(/A command, a test name or a requirement identifier is checked for being named and is never looked up, so it counts as not-resolvable, not as a missing path/);
});

it('uds open-work next-action with --root pointing at the repository looks the path up there, says it came from --root, and counts it resolved, not missing (XSPEC-461 R6)', async () => {
  const dir = h.makeDir('r6-root');
  const repo = makeProject(dir, 'repo', { files: { 'cli/src/a.js': '// a\n' } });
  writeFileSync(join(dir, 'record.md'), CARRIER.replace('repo/cli/src/a.js', 'cli/src/a.js'));
  const r = await h.runCli(['open-work', 'next-action', 'record.md', '--root', repo], dir);
  const out = r.stdout + r.stderr;
  expect(out).toMatch(/named-resolved=1 named-unresolved=2 unnamed=1/);
  expect(out).toMatch(/of the named-unresolved \(2\): path-missing=0 not-resolvable=2/);
  expect(out).toContain(`RESOLUTION: a path is looked up under ${repo} (from --root)`);
  expect(out, 'it was given, so it is not the default and the carrier is not reported as outside a repository').not.toMatch(/is outside any git repository/);

  // the same carrier without --root, run from inside the repository, finds the same file under the current directory
  const inside = await h.runCli(['open-work', 'next-action', join(dir, 'record.md')], repo);
  expect(inside.stdout).toMatch(/named-resolved=1 named-unresolved=2/);
  expect(inside.stdout).toContain(`RESOLUTION: a path is looked up under ${repo} (the current directory: no --root was given)`);
});

it('uds open-work next-action does not call a carrier that sits inside a git repository outside it (XSPEC-461 R6)', async () => {
  const dir = h.makeDir('r6-inside');
  const repo = makeProject(dir, 'repo', { files: { 'notes/record.md': CARRIER } });
  const r = await h.runCli(['open-work', 'next-action', 'notes/record.md'], repo);
  const out = r.stdout + r.stderr;
  expect(out).toMatch(/RESOLUTION: a path is looked up under /);
  expect(out).not.toMatch(/is outside any git repository/);
});

it('uds open-work waiting says where it looked a project up with the same wording next-action uses for its root (XSPEC-461 R6)', async () => {
  const dir = h.makeDir('r6-shared');
  const other = makeProject(dir, 'other', { tags: ['v1.0.0'] });
  writeFileSync(join(dir, 'w.md'), '| item | status | draft | asked-at | waiting for | release |\n|---|---|---|---|---|---|\n| w | waiting | | | | other:v1.0.0 |\n');
  const r = await h.runCli(['open-work', 'waiting', 'w.md', '--now', '2026-10-07', '--root', `other=${other}`], dir);
  expect(r.stdout).toContain(`RESOLUTION: project "other" is looked up under ${other} (from --root NAME=DIR or open_work.projects).`);
});
