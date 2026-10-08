/**
 * E2E: `uds init` puts the UDS skills into the project unless the adopter asks for the plugin by name
 * (dev-platform XSPEC-468 R1).
 *
 * The problem: XSPEC-462 made "into the project" the main way to install skills, but `uds init --yes` still
 * chose the Claude Code plugin whenever Claude Code was detected and wrote no skill file at all (and, in a
 * folder with no AI tool marker, nothing either). A new user following the default got the opposite of the
 * recommendation printed by `uds skills`.
 *
 * Every test spawns the real CLI in a throwaway project with a throwaway HOME and reads back files and
 * output. No test names a count: the number of skills is read from the repository's own `skills/` folder.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/init.js   await installSkills(config.skillsConfig, projectPath, msg, skillsResults);
 *   cli/src/commands/init.js   printDoubleInstallWarning(projectPath, getMarketplaceSkillsInfo());
 * Mutations done by hand (not a cut line), each seen red:
 *   - the default put back to "plugin when every detected tool can reach it" (`uds init --yes` writes no skill);
 *   - an explicit `--skills-location marketplace` made to install into the project as well.
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readdirSync, readFileSync, existsSync, rmSync, statSync } from 'fs';
import { join } from 'path';
import { createHarness, REAL_REPO } from '../utils/staged-cli-harness.js';
import { pluginHome } from '../utils/xspec-462.js';

const h = createHarness('xspec468-r1');
afterAll(() => h.cleanup());

/** Folder names under `<repo>/skills` that hold a SKILL.md: what UDS ships. */
function shippedSkillNames() {
  const root = join(REAL_REPO, 'skills');
  return readdirSync(root, { withFileTypes: true })
    .filter(e => e.isDirectory() && existsSync(join(root, e.name, 'SKILL.md')))
    .map(e => e.name)
    .sort();
}

/** Folder names under the project's `.claude/skills` that hold a SKILL.md. */
function installedSkillNames(projectDir) {
  const root = join(projectDir, '.claude', 'skills');
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter(e => e.isDirectory() && existsSync(join(root, e.name, 'SKILL.md')))
    .map(e => e.name)
    .sort();
}

/** Every file under a folder -> its text, keyed by the path relative to the folder. */
function snapshot(root, rel = '') {
  const out = {};
  for (const name of readdirSync(join(root, rel))) {
    const next = rel ? join(rel, name) : name;
    if (statSync(join(root, next)).isDirectory()) Object.assign(out, snapshot(root, next));
    else out[next] = readFileSync(join(root, next), 'utf-8');
  }
  return out;
}

/** Text with terminal codes and all whitespace removed (prompt text is wrapped at the terminal width). */
const squash = (text) => text.replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, '').replace(/\s+/g, '');
const screenHas = (run, sentence) => squash(run.stdout).includes(squash(sentence));

const SKILLS_TWICE = /UDS skills are installed twice/;

it('uds init --yes in a project where Claude Code is detected puts every shipped skill into .claude/skills and uds check finds the skill files intact (XSPEC-468 R1)', async () => {
  const dir = h.makeDir('claude-detected');
  mkdirSync(join(dir, '.claude'), { recursive: true });

  const run = await h.runCli(['init', '--yes'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);

  const shipped = shippedSkillNames();
  // Control: the repository really ships skills, so an empty folder cannot equal an empty list.
  expect(shipped.length).toBeGreaterThan(10);
  expect(installedSkillNames(dir)).toEqual(shipped);
  expect(run.stdout).toMatch(new RegExp(`${shipped.length} Skills installed to Claude Code`));
  // The old default's way out is not what the screen says now.
  expect(run.stdout).not.toMatch(/Using Plugin Marketplace/);

  const check = await h.runCli(['check', '--ci'], dir);
  expect(check.stdout).toContain('All skill files intact');
  expect(check.stdout).not.toMatch(/skill files? (are )?(missing|modified)/i);
});

it('uds init --yes installs the same files in the same place that uds update --apply --skills restores (XSPEC-468 R1)', async () => {
  const dir = h.makeDir('same-as-update');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  const init = await h.runCli(['init', '--yes'], dir);
  expect(init.code, init.stdout + init.stderr).toBe(0);

  const skillsDir = join(dir, '.claude', 'skills');
  const installed = snapshot(skillsDir);
  expect(Object.keys(installed).length).toBeGreaterThan(50);

  // Delete one skill, then let `update --apply --skills` put it back: it must land in the same place with the
  // same bytes as `init` wrote.
  rmSync(join(skillsDir, 'commit-standards'), { recursive: true, force: true });
  expect(existsSync(join(skillsDir, 'commit-standards'))).toBe(false);
  const update = await h.runCli(['update', '--apply', '--skills', '--yes'], dir);
  expect(update.code, update.stdout + update.stderr).toBe(0);
  expect(snapshot(skillsDir)).toEqual(installed);
});

it('uds init --yes in a folder with no AI tool marker still installs every shipped skill into .claude/skills (XSPEC-468 R1)', async () => {
  const dir = h.makeDir('no-tool-marker');
  expect(existsSync(join(dir, '.claude'))).toBe(false);

  const run = await h.runCli(['init', '--yes'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(installedSkillNames(dir)).toEqual(shippedSkillNames());
});

it('uds init --yes --locale zh-tw in a folder with no AI tool marker installs the Traditional Chinese skill texts, not English (XSPEC-468 R1)', async () => {
  const dir = h.makeDir('no-tool-marker-zh');
  const run = await h.runCli(['init', '--yes', '--locale', 'zh-tw'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(installedSkillNames(dir)).toEqual(shippedSkillNames());

  const text = readFileSync(join(dir, '.claude', 'skills', 'commit-standards', 'SKILL.md'), 'utf-8');
  expect(text).toContain('# Commit Message 助手');
  // Control: the English text of the same skill does not have that heading.
  const english = readFileSync(join(REAL_REPO, 'skills', 'commit-standards', 'SKILL.md'), 'utf-8');
  expect(english).not.toContain('# Commit Message 助手');
});

it('uds init --yes --skills-location marketplace writes no skill file, says the skills come from the plugin, and says how to put them into the project (XSPEC-468 R1)', async () => {
  const dir = h.makeDir('asked-for-plugin');
  mkdirSync(join(dir, '.claude'), { recursive: true });

  const run = await h.runCli(['init', '--yes', '--skills-location', 'marketplace'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);

  expect(existsSync(join(dir, '.claude', 'skills'))).toBe(false);
  // Control: the rest of the install happened, so "no skills" is not "nothing ran".
  expect(existsSync(join(dir, '.standards', 'manifest.json'))).toBe(true);

  expect(run.stdout).toContain('Skills: provided by the Claude Code plugin (no skill file was written to this project).');
  expect(run.stdout).toContain('/plugin install universal-dev-standards@asia-ostrich');
  expect(run.stdout).toContain('English skill texts only');
  expect(run.stdout).toContain('uds config --type skills --ai-tool claude-code --skills-location project --yes');
});

it('uds init --yes --skills-location marketplace says the same in Traditional and Simplified Chinese (XSPEC-468 R1)', async () => {
  const tw = h.makeDir('plugin-tw');
  const cn = h.makeDir('plugin-cn');
  for (const dir of [tw, cn]) mkdirSync(join(dir, '.claude'), { recursive: true });
  const runTw = await h.runCli(['init', '--yes', '--skills-location', 'marketplace'], tw, { ui: 'zh-tw' });
  const runCn = await h.runCli(['init', '--yes', '--skills-location', 'marketplace'], cn, { ui: 'zh-cn' });
  expect(runTw.code, runTw.stdout + runTw.stderr).toBe(0);
  expect(runCn.code, runCn.stdout + runCn.stderr).toBe(0);
  expect(runTw.stdout).toContain('技能：由 Claude Code 外掛提供');
  expect(runTw.stdout).toContain('專案內不放檔案');
  expect(runCn.stdout).toContain('技能：由 Claude Code 插件提供');
  expect(runCn.stdout).toContain('项目内不放文件');
  expect(existsSync(join(tw, '.claude', 'skills'))).toBe(false);
  expect(existsSync(join(cn, '.claude', 'skills'))).toBe(false);
});

it('uds init --yes in a project whose owner already has the UDS plugin ends with the skills-twice warning, and without the plugin it prints none (XSPEC-468 R1)', async () => {
  const withPlugin = h.makeDir('plugin-present');
  mkdirSync(join(withPlugin, '.claude'), { recursive: true });
  const { env } = pluginHome(h);
  const warned = await h.runCli(['init', '--yes'], withPlugin, { env });
  expect(warned.code, warned.stdout + warned.stderr).toBe(0);
  expect(installedSkillNames(withPlugin)).toEqual(shippedSkillNames());
  expect(warned.stdout).toContain(`⚠ UDS skills are installed twice: ${shippedSkillNames().length} in this project (.claude/skills/) and the plugin universal-dev-standards@asia-ostrich.`);
  expect(warned.stdout).toContain('/universal-dev-standards:commit');

  // Control arm: same install, no plugin in HOME -> no such warning.
  const without = h.makeDir('plugin-absent');
  mkdirSync(join(without, '.claude'), { recursive: true });
  const quiet = await h.runCli(['init', '--yes'], without);
  expect(quiet.code, quiet.stdout + quiet.stderr).toBe(0);
  expect(quiet.stdout).not.toMatch(SKILLS_TWICE);
});

it('uds init in the interactive flow installs the skills into the project when the adopter only presses Enter (XSPEC-468 R1)', async () => {
  const dir = h.makeDir('interactive-enter');
  mkdirSync(join(dir, '.claude'), { recursive: true });

  // Answer every question with Enter (its default), except to say no to the optional command-contract step.
  const run = await h.runCli(['init'], dir, {
    // The echo of an answered question ("✔ Create uds.project.yaml ... No") is on the next screen, so only a
    // question that has no echo yet is a question to answer.
    drive: (screen) => (screen.includes('Create uds.project.yaml') && !screen.includes('✔ Create uds.project.yaml') ? 'n\r' : '\r'),
    idleMs: 900
  });
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(installedSkillNames(dir)).toEqual(shippedSkillNames());
  // Control: the project-level choice was offered, and the plugin is described with its limits.
  expect(screenHas(run, 'Claude Code - Project Level (.claude/skills/)'), run.stdout).toBe(true);
  expect(screenHas(run, 'Claude Code only, English skill texts only, stable releases only, no files in the project'), run.stdout).toBe(true);
}, 180000);
