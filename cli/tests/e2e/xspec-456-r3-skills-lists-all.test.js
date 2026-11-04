/**
 * E2E: `uds skills` lists the skills that are actually installed, against what UDS ships (dev-platform
 * XSPEC-456 R3).
 *
 * The report: 56 skills installed, `uds skills` listed 27 and wrote "27 / 30", while `uds check` said 116 skill
 * files were intact. The denominator and the filter were the `skillFiles` list of standards-registry.json - a
 * hand-kept list that stopped at 30 - so any installed skill missing from it was invisible.
 *
 * Every test spawns the real CLI in a throwaway project initialised by `uds init`, and reads the numbers back
 * from the output and from the files on disk. What UDS ships is read from the repo's skills/ folder (a
 * directory holding SKILL.md), not from the CLI under test.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/skills.js   const shipped = getAvailableSkillNames();
 */

import { it, expect, afterAll } from 'vitest';
import { readdirSync, existsSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { createHarness, REAL_REPO } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec456-r3');
afterAll(() => h.cleanup());

const shippedSkills = () => readdirSync(join(REAL_REPO, 'skills'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(REAL_REPO, 'skills', e.name, 'SKILL.md')))
  .map((e) => e.name)
  .sort();

// Issue #298: UDS ships these but installs them only when a project asks, so a fresh project holds the shipped skills without them.
// Written out here, not read from the CLI.
const OPTIONAL_SKILLS = ['open-work-assistant'];
const installedByDefault = () => shippedSkills().filter((s) => !OPTIONAL_SKILLS.includes(s));

/** The names listed under "Skills (N):" in `uds skills` output. */
const listedSkills = (stdout) => [...stdout.matchAll(/^\s+[✓○] (\S+)$/gm)].map((m) => m[1]).sort();

it('uds skills lists every installed skill out of the skills UDS ships, and its file count equals the one uds check prints (XSPEC-456 R3)', async () => {
  const dir = await h.newProject();
  const shipped = shippedSkills();
  const installed = installedByDefault();
  expect(installed.length, 'fixture: UDS ships more skills than the old 30-name list').toBeGreaterThan(30);
  expect(shipped.length - installed.length, 'fixture: the optional skill is shipped').toBe(1);

  // Control: every shipped skill but the optional one is on disk.
  const onDisk = readdirSync(join(dir, '.claude', 'skills'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(dir, '.claude', 'skills', e.name, 'SKILL.md')))
    .map((e) => e.name).sort();
  expect(onDisk).toEqual(installed);

  const skills = await h.runCli(['skills'], dir);
  expect(skills.code, skills.stdout + skills.stderr).toBe(0);
  expect(skills.stdout).toMatch(new RegExp(`Skills \\(${installed.length}\\):`));
  expect(skills.stdout).toMatch(new RegExp(`Total unique skills: ${installed.length} / ${shipped.length}\\b`));
  expect(skills.stdout, 'the optional skill is not counted as missing without saying so').toContain('Optional, installed only when you ask: open-work');
  expect(listedSkills(skills.stdout), 'every installed skill is named').toEqual(installed);

  // The same installation, seen by `uds check`: it counts files, and `uds skills` now says how many.
  const check = await h.runCli(['check', '--offline'], dir);
  expect(check.code, check.stdout + check.stderr).toBe(0);
  const files = Number(check.stdout.match(/All skill files intact \((\d+) files\)/)?.[1]);
  expect(files, check.stdout).toBeGreaterThan(installed.length);
  expect(skills.stdout).toContain(`\`uds check\` tracks ${files} skill files`);

  // And the manifest agrees on the number of skills.
  const manifest = JSON.parse(readFileSync(join(dir, '.standards', 'manifest.json'), 'utf-8'));
  expect(new Set(manifest.skills.names).size).toBe(installed.length);
});

it('uds skills counts a removed skill as missing from the shipped total instead of hiding the gap behind a short list (XSPEC-456 R3)', async () => {
  const dir = await h.newProject();
  const shipped = shippedSkills();
  // Remove one skill that the old stale list did NOT contain, so only a correct denominator can show the gap.
  const victim = 'sweep';
  rmSync(join(dir, '.claude', 'skills', victim), { recursive: true, force: true });
  const kept = installedByDefault().filter((s) => s !== victim);

  const skills = await h.runCli(['skills'], dir);
  expect(skills.code, skills.stdout + skills.stderr).toBe(0);
  expect(skills.stdout).toMatch(new RegExp(`Total unique skills: ${kept.length} / ${shipped.length}\\b`));
  expect(listedSkills(skills.stdout)).toEqual(kept);
});
