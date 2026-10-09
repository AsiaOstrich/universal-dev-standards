/**
 * E2E: `uds uninstall` removes the skills UDS installed and keeps the skills the adopter wrote (dev-platform XSPEC-471 R4).
 *
 * Found while writing the acceptance step for `uds uninstall`: it removed the whole `.claude/skills/` folder, so a
 * skill the adopter had written themselves (`.claude/skills/my-own/SKILL.md`, there before `uds init`) went with
 * the UDS ones. `uds init` itself says the skill folders are shared ("may already hold unrelated content"), and
 * `uds uninstall` already keeps what it cannot prove it wrote for hook scripts and integration files.
 * Now it removes only the files the manifest records (`skillHashes`) that are unchanged, keeps a file the
 * adopter edited, and removes the folder only when nothing else is in it.
 *
 * Every test spawns the real CLI (`uds uninstall ...`) in a throwaway project that `uds init` set up, and reads
 * the files back.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/uninstallers/skills-uninstaller.js   unlinkSync(file);   (the loop that removes the recorded files)
 */

import { it, expect, afterAll } from 'vitest';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec471-r4b-uninstall');
afterAll(() => h.cleanup());

const OWN_SKILL = '---\nname: my-own\ndescription: a skill I wrote myself\n---\n# my own skill\n';

/** A project `uds init` set up, with a skill of the adopter's own next to the UDS ones. */
async function projectWithOwnSkill() {
  const dir = await h.newProject();
  mkdirSync(join(dir, '.claude', 'skills', 'my-own'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'skills', 'my-own', 'SKILL.md'), OWN_SKILL);
  return dir;
}

const skillDirs = (dir) => readdirSync(join(dir, '.claude', 'skills'), { withFileTypes: true })
  .filter((e) => e.isDirectory()).map((e) => e.name);

it('uds uninstall --yes removes the UDS skills and keeps a skill the adopter wrote, with its folder (XSPEC-471 R4)', async () => {
  const dir = await projectWithOwnSkill();
  // control: the UDS skills are really there before the run
  expect(existsSync(join(dir, '.claude', 'skills', 'commit-standards', 'SKILL.md')), 'fixture: a UDS skill is installed').toBe(true);

  const run = await h.runCli(['uninstall', '--yes'], dir);

  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(existsSync(join(dir, '.claude', 'skills', 'commit-standards')), 'the UDS skill is gone').toBe(false);
  expect(existsSync(join(dir, '.claude', 'skills', 'tdd-assistant')), 'the other UDS skills are gone too').toBe(false);
  expect(readFileSync(join(dir, '.claude', 'skills', 'my-own', 'SKILL.md'), 'utf-8'), 'the adopter\'s skill is untouched').toBe(OWN_SKILL);
  expect(skillDirs(dir), 'only the adopter\'s skill is left in the folder').toEqual(['my-own']);
  expect(existsSync(join(dir, '.claude', 'skills', '.manifest.json')), 'UDS\'s bookkeeping file went with its last skill').toBe(false);
});

it('uds uninstall --skills-only removes the UDS skills, keeps the adopter\'s skill and leaves .standards (XSPEC-471 R4)', async () => {
  const dir = await projectWithOwnSkill();

  const run = await h.runCli(['uninstall', '--skills-only', '--yes'], dir);

  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(existsSync(join(dir, '.claude', 'skills', 'commit-standards')), 'the UDS skill is gone').toBe(false);
  expect(readFileSync(join(dir, '.claude', 'skills', 'my-own', 'SKILL.md'), 'utf-8')).toBe(OWN_SKILL);
  expect(existsSync(join(dir, '.standards', 'manifest.json')), '--skills-only leaves the standards').toBe(true);
});

it('uds uninstall keeps a UDS skill file the adopter edited and says so (XSPEC-471 R4)', async () => {
  const dir = await projectWithOwnSkill();
  const edited = join(dir, '.claude', 'skills', 'commit-standards', 'guide.md');
  writeFileSync(edited, '# my own notes on commit messages\n');

  const run = await h.runCli(['uninstall', '--yes'], dir);

  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(readFileSync(edited, 'utf-8'), 'the edited file is still there, as edited').toBe('# my own notes on commit messages\n');
  expect(existsSync(join(dir, '.claude', 'skills', 'commit-standards', 'SKILL.md')), 'the unedited files of that skill are gone').toBe(false);
  expect(run.stdout).toContain('kept 1 file(s) changed since UDS wrote them');
});

it('uds uninstall --dry-run says what it would remove and removes nothing (XSPEC-471 R4)', async () => {
  const dir = await projectWithOwnSkill();

  const run = await h.runCli(['uninstall', '--dry-run'], dir);

  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout).toMatch(/skills\/claude-code \[project\] → .* \(\d+ file\(s\) UDS wrote\)/);
  expect(existsSync(join(dir, '.claude', 'skills', 'commit-standards', 'SKILL.md')), 'nothing was removed').toBe(true);
  expect(existsSync(join(dir, '.claude', 'skills', 'my-own', 'SKILL.md'))).toBe(true);
});

it('uds uninstall --yes removes the skills folder when only UDS skills were in it (XSPEC-471 R4)', async () => {
  const dir = await h.newProject();

  const run = await h.runCli(['uninstall', '--yes'], dir);

  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(existsSync(join(dir, '.claude', 'skills')), 'an emptied skills folder is not left behind').toBe(false);
});
