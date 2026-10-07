/**
 * E2E: `uds init` and `uds update --apply --skills` say it at the end of the install when a personal skill
 * (`~/.claude/skills/`) has the same name as a UDS skill that was just put in the project (dev-platform
 * XSPEC-465 R1). The notice is information only: what was installed and the exit code are what they would be
 * without it.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/init.js     printSkillNameCollisionWarning(projectPath);   (inside the "skills were installed" check)
 *   cli/src/commands/update.js   printSkillNameCollisionWarning(projectPath);   (end of updateSkillsOnly)
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { personalHome, hasWarning, WARNING_TITLE, OFF_OVERRIDES } from '../utils/xspec-465.js';

const h = createHarness('xspec465-install');
const off = createHarness('xspec465-install-off', { overrides: OFF_OVERRIDES });
afterAll(() => { h.cleanup(); off.cleanup(); });

/** The names of the folders under .claude/skills/ and the text of one UDS skill: what the install wrote. */
function installed(dir) {
  const skills = join(dir, '.claude', 'skills');
  return { folders: readdirSync(skills).sort(), plan: readFileSync(join(skills, 'plan', 'SKILL.md'), 'utf-8') };
}

function withoutWarning(stdout, dir) {
  const out = [];
  let skipping = false;
  // Backup folder names carry the time of the run; everything else must be equal.
  for (const line of stdout.replaceAll(dir, '<project>').replace(/\d{4}-\d\d-\d\dT[\d-]+Z-\d+/g, '<time>').split('\n')) {
    if (WARNING_TITLE.test(line)) { skipping = true; continue; }
    if (skipping && /^\s{4,}\S/.test(line)) continue;
    if (skipping && line.trim() === '') { skipping = false; continue; }
    skipping = false;
    out.push(line);
  }
  return out.join('\n');
}

async function freshProject(harness) {
  const dir = harness.makeDir('fresh');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  return dir;
}

it('uds init --skills-location project ends by naming the personal skill that covers a UDS skill it just installed, and installs the same skills and exits the same as a CLI without the notice (XSPEC-465 R1)', async () => {
  const dir = await freshProject(h);
  const twinDir = await freshProject(off);
  const { env } = personalHome(h, [{ folder: 'plan' }, { folder: 'my-tools', name: 'commit' }]);
  const args = ['init', '--yes', '--skills-location', 'project'];

  const real = await h.runCli(args, dir, { env });
  const twin = await off.runCli(args, twinDir, { env });

  expect(real.code, real.stdout + real.stderr).toBe(0);
  expect(real.stdout).toContain('⚠ 2 UDS skill(s) installed in this project share a name with a personal skill');
  expect(real.stdout).toContain('/plan: your ~/.claude/skills/plan/ replaces the UDS skill .claude/skills/plan/');
  expect(real.stdout).toContain('/commit: your ~/.claude/skills/my-tools/ replaces the UDS skill .claude/skills/commit-standards/');
  expect(real.stdout).toContain('No warning is not proof of no collision');
  expect(hasWarning(twin.stdout), 'control: the twin does not say it').toBe(false);

  // The install itself is the twin's: same exit code, same folders, same skill text, same other output lines.
  expect(twin.code).toBe(real.code);
  expect(installed(dir).folders.length, 'control: skills were installed').toBeGreaterThan(50);
  expect(installed(dir)).toEqual(installed(twinDir));
  expect(withoutWarning(real.stdout, dir)).toBe(withoutWarning(twin.stdout, twinDir));
});

it('uds init says nothing about names when the personal skills have other names, when there is no personal folder, or when no skills were installed (XSPEC-465 R1)', async () => {
  const args = ['init', '--yes', '--skills-location', 'project'];

  const other = await h.runCli(args, await freshProject(h), { env: personalHome(h, [{ folder: 'my-own-skill' }]).env });
  expect(other.code, other.stdout + other.stderr).toBe(0);
  expect(hasWarning(other.stdout), 'other names').toBe(false);

  const none = await h.runCli(args, await freshProject(h), { env: personalHome(h, [], { skillsDir: false }).env });
  expect(none.code, none.stdout + none.stderr).toBe(0);
  expect(hasWarning(none.stdout), 'no personal folder').toBe(false);

  // A personal plan skill exists, but this run installs no skills at all, so there is nothing it could cover.
  const noSkills = await freshProject(h);
  const skipped = await h.runCli(['init', '--yes', '--skills-location', 'none'], noSkills, { env: personalHome(h, [{ folder: 'plan' }]).env });
  expect(skipped.code, skipped.stdout + skipped.stderr).toBe(0);
  expect(readdirSync(join(noSkills, '.claude')).includes('skills'), 'control: no skills were installed').toBe(false);
  expect(hasWarning(skipped.stdout), 'no skills installed').toBe(false);
});

it('uds update --apply --skills ends by naming the personal skill that covers a UDS skill, and ends the same as a CLI without the notice (XSPEC-465 R1)', async () => {
  const dir = await h.newProject();
  const twinDir = await off.newProject();
  const { env } = personalHome(h, [{ folder: 'sweep' }]);
  const args = ['update', '--apply', '--yes', '--skills', '--offline'];

  const real = await h.runCli(args, dir, { env });
  const twin = await off.runCli(args, twinDir, { env });

  expect(real.code, real.stdout + real.stderr).toBe(0);
  expect(real.stdout).toContain('⚠ 1 UDS skill(s) installed in this project share a name with a personal skill');
  expect(real.stdout).toContain('/sweep: your ~/.claude/skills/sweep/ replaces the UDS skill .claude/skills/sweep/');
  expect(hasWarning(twin.stdout), 'control: the twin does not say it').toBe(false);
  expect(twin.code).toBe(real.code);
  expect(installed(dir)).toEqual(installed(twinDir));
  expect(withoutWarning(real.stdout, dir)).toBe(withoutWarning(twin.stdout, twinDir));

  // Same command, personal skills with other names: no notice.
  const quiet = await h.runCli(args, await h.newProject(), { env: personalHome(h, [{ folder: 'my-own-skill' }]).env });
  expect(quiet.code, quiet.stdout + quiet.stderr).toBe(0);
  expect(hasWarning(quiet.stdout), 'other names').toBe(false);
});
