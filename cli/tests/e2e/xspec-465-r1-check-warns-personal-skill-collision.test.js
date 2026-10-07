/**
 * E2E: `uds check` warns when a personal skill (`~/.claude/skills/`) has the same name as a UDS skill installed
 * in the project (dev-platform XSPEC-465 R1).
 *
 * Why it matters: Claude Code runs ONE skill per name and personal ranks above project, so the adopter's own
 * `plan` or `push` silently replaces the UDS one that `uds init` put in the project. The warning is information
 * only: it must not change the verdict or the exit code.
 *
 * Every test spawns the real CLI in a throwaway project with a throwaway HOME holding fake personal skills.
 * "Does not change the verdict" is proven with a twin: the same commands on a CLI whose collision check does
 * nothing (tests/utils/xspec-465.js).
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/check.js   printSkillNameCollisionWarning(projectPath);
 */

import { it, expect, afterAll } from 'vitest';
import { chmodSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { personalHome, hasWarning, WARNING_TITLE, OFF_OVERRIDES } from '../utils/xspec-465.js';

const h = createHarness('xspec465-r1');
const off = createHarness('xspec465-r1-off', { overrides: OFF_OVERRIDES });
afterAll(() => { h.cleanup(); off.cleanup(); });

const verdictLines = (out) => out.split('\n').filter((l) => /compliant|Issues detected|issues detected/i.test(l));

/** Output with the warning block (its title line and the indented lines after it) taken out, project path made constant. */
function withoutWarning(stdout, dir) {
  const lines = stdout.replaceAll(dir, '<project>').split('\n');
  const out = [];
  let skipping = false;
  for (const line of lines) {
    if (WARNING_TITLE.test(line)) { skipping = true; continue; }
    if (skipping && /^\s{4,}\S/.test(line)) continue;
    if (skipping && line.trim() === '') { skipping = false; continue; } // the blank line that ends the block
    skipping = false;
    out.push(line);
  }
  return out.join('\n');
}

it('uds check warns that a personal plan skill covers the UDS plan skill and says how to fix it, and its verdict line, exit code and every other line equal a CLI without the warning, with and without --ci (XSPEC-465 R1)', async () => {
  const dir = await h.newProject();
  const twinDir = await off.newProject();
  const { env } = personalHome(h, [{ folder: 'plan', name: 'plan' }]);

  for (const flags of [[], ['--ci']]) {
    const real = await h.runCli(['check', '--offline', ...flags], dir, { env });
    const twin = await off.runCli(['check', '--offline', ...flags], twinDir, { env });
    const label = `uds check ${flags.join(' ')}`;

    expect(real.stdout, label).toContain('⚠ 1 UDS skill(s) installed in this project share a name with a personal skill, and Claude Code runs the personal one without any error:');
    expect(real.stdout, label).toContain('/plan: your ~/.claude/skills/plan/ replaces the UDS skill .claude/skills/plan/');
    expect(real.stdout, label).toContain('Personal skills rank above project skills, so the UDS skill is never run under that name.');
    expect(real.stdout, label).toContain('Keep both: rename your personal skill (its folder name, and `name:` in its SKILL.md).');
    expect(real.stdout, label).toContain('Keep yours only: delete the UDS skill folder under .claude/skills/');
    // The warning says what it cannot see, so that a quiet run is not read as "no collision".
    expect(real.stdout, label).toContain('No warning is not proof of no collision');
    expect(real.stdout, label).toContain('enterprise level');
    expect(hasWarning(twin.stdout), `control: the twin does not say it (${label})`).toBe(false);

    // The verdict is the twin's, and it is the good one: a warning that turned a clean project red would be a different feature.
    expect(verdictLines(real.stdout).length, 'control: the check printed a verdict').toBeGreaterThan(0);
    expect(real.stdout).toContain('Project is compliant with standards');
    expect(real.code, `${label}: ${real.stdout}${real.stderr}`).toBe(0);
    expect(real.code).toBe(twin.code);
    expect(verdictLines(real.stdout)).toEqual(verdictLines(twin.stdout));
    // Everything else is the same too: the only added text is the warning block.
    expect(withoutWarning(real.stdout, dir)).toBe(withoutWarning(twin.stdout, twinDir));
  }
});

it('uds check matches on the name in the personal SKILL.md frontmatter and on the folder name, whichever folder it sits in (XSPEC-465 R1)', async () => {
  const dir = await h.newProject();
  // The UDS skill in folder commit-standards is typed as /commit (its frontmatter name), so a personal skill that
  // declares name: commit in a folder called my-tools covers it, and a folder called commit without any
  // frontmatter covers it as well. Comparing folder names only would find neither.
  const viaName = personalHome(h, [{ folder: 'my-tools', name: 'commit' }]);
  const byName = await h.runCli(['check', '--offline'], dir, { env: viaName.env });
  expect(byName.stdout, byName.stderr).toContain('/commit: your ~/.claude/skills/my-tools/ replaces the UDS skill .claude/skills/commit-standards/');
  expect(byName.code).toBe(0);

  const viaFolder = personalHome(h, [{ folder: 'commit', raw: '# my commit helper, no frontmatter at all\n' }]);
  const byFolder = await h.runCli(['check', '--offline'], dir, { env: viaFolder.env });
  expect(byFolder.stdout, byFolder.stderr).toContain('/commit: your ~/.claude/skills/commit/ replaces the UDS skill .claude/skills/commit-standards/');
  expect(byFolder.code).toBe(0);

  // Several at once: one line each, in the order of the personal folder names.
  const many = personalHome(h, [{ folder: 'push' }, { folder: 'sweep' }, { folder: 'orchestrate' }, { folder: 'plan' }]);
  const run = await h.runCli(['check', '--offline'], dir, { env: many.env });
  expect(run.stdout).toContain('⚠ 4 UDS skill(s) installed in this project share a name with a personal skill');
  const lines = run.stdout.split('\n').filter((l) => /^\s+\/\w+: your ~\/\.claude\/skills\//.test(l)).map((l) => l.trim().split(':')[0]);
  expect(lines).toEqual(['/orchestrate', '/plan', '/push', '/sweep']);
});

it('uds check does not warn when the personal skills have other names, however many there are, and ends the same as a CLI without the warning (XSPEC-465 R1)', async () => {
  const dir = await h.newProject();
  const twinDir = await off.newProject();
  // Personal skills that share nothing with a UDS skill, including a folder whose name is a UDS name only as a
  // PREFIX (plan-mine) and one whose frontmatter name differs from every UDS name.
  const { env } = personalHome(h, [
    { folder: 'my-own-skill' }, { folder: 'plan-mine' }, { folder: 'deploy-prod', name: 'ship-it' }, { folder: 'notes' }
  ]);
  // And two skills of the adopter that sit in the PROJECT folder and share a name with a personal skill: they are
  // not UDS skills, so the check has no say about them (it only looks at the skills UDS ships).
  for (const root of [dir, twinDir]) {
    mkdirSync(join(root, '.claude', 'skills', 'team-deploy'), { recursive: true });
    writeFileSync(join(root, '.claude', 'skills', 'team-deploy', 'SKILL.md'), '---\nname: team-deploy\n---\n# team\n');
  }
  mkdirSync(join(env.HOME, '.claude', 'skills', 'team-deploy'), { recursive: true });
  writeFileSync(join(env.HOME, '.claude', 'skills', 'team-deploy', 'SKILL.md'), '---\nname: team-deploy\n---\n# mine\n');

  const real = await h.runCli(['check', '--offline'], dir, { env });
  const twin = await off.runCli(['check', '--offline'], twinDir, { env });
  expect(real.stdout, 'control: the skills section ran').toContain('Skills Status');
  expect(hasWarning(real.stdout)).toBe(false);
  expect(real.code, real.stdout + real.stderr).toBe(0);
  expect(real.code).toBe(twin.code);
  expect(withoutWarning(real.stdout, dir)).toBe(withoutWarning(twin.stdout, twinDir));

  // A UDS-looking personal skill name does not count when the project has no UDS skill under that name: the
  // project holds none at all.
  const emptyProject = h.makeDir('empty-project');
  const { env: env2 } = personalHome(h, [{ folder: 'plan' }]);
  const none = await h.runCli(['check', '--offline'], emptyProject, { env: env2 });
  expect(hasWarning(none.stdout), 'no project skills: nothing to cover').toBe(false);
});

it('uds check stays quiet and does not fail when there is no personal skills folder, it is a file, a SKILL.md cannot be read or has broken frontmatter, or the folder cannot be opened, and a broken manifest file does not stop it (XSPEC-465 R1)', async (ctx) => {
  const dir = await h.newProject();
  const twinDir = await off.newProject();
  const twin = await off.runCli(['check', '--offline'], twinDir, { env: personalHome(off, []).env });

  const arms = [];
  arms.push(['no ~/.claude/skills at all', personalHome(h, [], { skillsDir: false }).env]);

  const asFile = personalHome(h, [], { skillsDir: false });
  mkdirSync(join(asFile.home, '.claude'), { recursive: true });
  writeFileSync(join(asFile.home, '.claude', 'skills'), 'not a folder');
  arms.push(['~/.claude/skills is a file', asFile.env]);

  const noSkillFile = personalHome(h, [{ folder: 'plan' }]);
  mkdirSync(join(noSkillFile.skillsDir, 'push'), { recursive: true });                 // a folder with no SKILL.md
  mkdirSync(join(noSkillFile.skillsDir, 'sweep', 'SKILL.md'), { recursive: true });    // SKILL.md that is a folder
  writeFileSync(join(noSkillFile.skillsDir, 'orchestrate'), 'a file, not a skill folder');
  arms.push(['folders without a readable SKILL.md (plan is a real collision here)', noSkillFile.env]);

  const brokenYaml = personalHome(h, [{ folder: 'sweep', raw: '---\nname: [unclosed\n  : : :\n---\n# broken\n' }]);
  arms.push(['frontmatter that is not YAML', brokenYaml.env]);

  const brokenManifest = personalHome(h, [{ folder: 'orchestrate' }], { manifest: undefined });
  writeFileSync(join(brokenManifest.skillsDir, '.manifest.json'), '{ this is not json');
  arms.push(['.manifest.json that is not JSON (the folder is then not known to be UDS, so it counts)', brokenManifest.env]);

  for (const [name, env] of arms) {
    const run = await h.runCli(['check', '--offline'], dir, { env });
    expect(run.stdout, `${name}: control: the skills section ran`).toContain('Skills Status');
    expect(run.code, `${name}: ${run.stdout}${run.stderr}`).toBe(twin.code);
    expect(run.stdout + run.stderr, `${name}: no error text`).not.toMatch(/SyntaxError|YAMLException|Unexpected token|TypeError|EACCES|ENOENT|Error:/);
    if (name.startsWith('folders without')) {
      // plan is readable and does collide: only the unreadable ones are silent.
      expect(run.stdout).toContain('⚠ 1 UDS skill(s)');
      expect(run.stdout).toContain('/plan:');
      expect(run.stdout).not.toContain('/push:');
      expect(run.stdout).not.toContain('/sweep:');
      expect(run.stdout).not.toContain('/orchestrate:');
    } else if (name.startsWith('.manifest.json')) {
      // A manifest nobody can read proves nothing about who installed the folder: the readable skill counts.
      expect(run.stdout).toContain('/orchestrate:');
    } else {
      expect(hasWarning(run.stdout), name).toBe(false);
    }
  }

  // A personal folder that cannot be opened (POSIX only; root ignores permissions).
  if (process.platform === 'win32' || process.getuid?.() === 0) ctx.skip();
  const locked = personalHome(h, [{ folder: 'plan' }]);
  chmodSync(locked.skillsDir, 0o000);
  try {
    const run = await h.runCli(['check', '--offline'], dir, { env: locked.env });
    expect(run.stdout, 'control: the skills section ran').toContain('Skills Status');
    expect(hasWarning(run.stdout), 'unreadable personal folder').toBe(false);
    expect(run.code, run.stdout + run.stderr).toBe(twin.code);
    // Only what the collision check itself could leak: an errno, or an uncaught error printed at the start
    // of a line. Not a case-insensitive "error:" anywhere: other checks in the same run print notes such as
    // "(error: unknown option `cached')" when the throwaway project is not a git repo, and that is not this check failing.
    expect(run.stdout + run.stderr).not.toMatch(/EACCES|EPERM|ENOTDIR|EISDIR|permission denied|^\s*[A-Za-z]*Error: |^\s+at .*skill-name-collision/m);
  } finally {
    chmodSync(locked.skillsDir, 0o755);
  }
});

it('uds check leaves out skills UDS itself installed at user level, and a project that is the home folder (XSPEC-465 R1)', async () => {
  const dir = await h.newProject();

  // `uds init --skills-location user` leaves UDS's own copies plus a manifest that says so: not someone else's skill.
  const udsUser = personalHome(h, [{ folder: 'plan' }, { folder: 'commit-standards', name: 'commit' }], {
    manifest: { version: '6.14.0', source: 'universal-dev-standards', installedDate: '2026-10-01' }
  });
  const user = await h.runCli(['check', '--offline'], dir, { env: udsUser.env });
  expect(user.stdout, 'control: the skills section ran').toContain('Skills Status');
  expect(hasWarning(user.stdout), 'UDS user-level copies are not a collision').toBe(false);
  expect(user.code, user.stdout + user.stderr).toBe(0);

  // The same folders without that manifest are the adopter's own skills, and do collide (control for the arm above).
  const mine = personalHome(h, [{ folder: 'plan' }, { folder: 'commit-standards', name: 'commit' }]);
  const own = await h.runCli(['check', '--offline'], dir, { env: mine.env });
  expect(own.stdout).toContain('⚠ 2 UDS skill(s) installed in this project share a name with a personal skill');

  // The project folder IS the home folder: one skills folder seen from both sides, not two skills.
  // (Its skills folder also holds UDS's manifest, which the user-level rule above would already skip; take that file
  // away so that this arm stands on the "same folder" rule alone.)
  const homeProject = await h.newProject();
  rmSync(join(homeProject, '.claude', 'skills', '.manifest.json'), { force: true });
  const asHome = await h.runCli(['check', '--offline'], homeProject, { env: { HOME: homeProject, USERPROFILE: homeProject } });
  expect(asHome.stdout, 'control: the skills section ran').toContain('Skills Status');
  expect(hasWarning(asHome.stdout), 'project == home').toBe(false);
  expect(asHome.code, asHome.stdout + asHome.stderr).toBe(0);
});

it('uds check says the personal skill collision warning in Traditional and Simplified Chinese (XSPEC-465 R1)', async () => {
  const dir = await h.newProject();
  const { env } = personalHome(h, [{ folder: 'plan' }]);
  const tw = await h.runCli(['check', '--offline'], dir, { env, ui: 'zh-tw' });
  const cn = await h.runCli(['check', '--offline'], dir, { env, ui: 'zh-cn' });
  expect(tw.code, tw.stdout + tw.stderr).toBe(0);
  expect(cn.code, cn.stdout + cn.stderr).toBe(0);

  expect(tw.stdout).toContain('⚠ 本專案裝的 UDS 技能有 1 個與個人技能同名，Claude Code 會執行你的個人技能，而且不會報任何錯：');
  expect(tw.stdout).toContain('/plan：你的 ~/.claude/skills/plan/ 蓋掉了 UDS 技能 .claude/skills/plan/');
  expect(tw.stdout).toContain('二擇一：');
  expect(tw.stdout).toContain('沒有警告不等於沒有撞名');
  expect(tw.stdout).not.toContain('share a name with a personal skill');

  expect(cn.stdout).toContain('⚠ 本项目装的 UDS 技能有 1 个与个人技能同名，Claude Code 会执行你的个人技能，而且不会报任何错：');
  expect(cn.stdout).toContain('/plan：你的 ~/.claude/skills/plan/ 盖掉了 UDS 技能 .claude/skills/plan/');
  expect(cn.stdout).toContain('二选一：');
  expect(cn.stdout).toContain('没有警告不等于没有撞名');
  expect(cn.stdout).not.toContain('share a name with a personal skill');
});
