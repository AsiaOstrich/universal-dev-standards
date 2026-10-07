/**
 * E2E: `uds check` warns when UDS skills are installed twice, in the project and as the Claude Code plugin
 * (dev-platform XSPEC-462 R2).
 *
 * Why it matters: Claude Code runs plugin skills as /<plugin>:<skill> and project skills as /<skill>, so each
 * skill is listed twice, and every skill's name and description goes into context on every turn. The warning is
 * information only: it must not change the verdict or the exit code.
 *
 * Every test spawns the real CLI in a throwaway project with a throwaway HOME. "The plugin is installed" is made
 * the way the CLI reads it (`getMarketplaceSkillsInfo`): an `installed_plugins.json` that names the UDS plugin
 * plus its cache folder (see tests/utils/xspec-462.js). "Does not change the verdict" is proven with a twin: the
 * same commands on a CLI whose warning does nothing.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/check.js   printDoubleInstallWarning(projectPath, getMarketplaceSkillsInfo());
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { pluginHome, OFF_OVERRIDES } from '../utils/xspec-462.js';

const h = createHarness('xspec462-r2');
const off = createHarness('xspec462-r2-off', { overrides: OFF_OVERRIDES });
afterAll(() => { h.cleanup(); off.cleanup(); });

const WARNING_START = /^⚠ UDS skills are installed twice/;
const hasWarning = (stdout) => /UDS skills are installed twice/.test(stdout);
const verdictLines = (out) => out.split('\n').filter((l) => /compliant|Issues detected|issues detected/i.test(l));

/** Output with the warning block (its title line and the indented lines after it) taken out, project path made constant. */
function withoutWarning(stdout, dir) {
  const lines = stdout.replaceAll(dir, '<project>').split('\n');
  const out = [];
  let skipping = false;
  for (const line of lines) {
    if (WARNING_START.test(line)) { skipping = true; continue; }
    if (skipping && /^\s{4,}\S/.test(line)) continue;
    if (skipping && line.trim() === '') { skipping = false; continue; } // the blank line that ends the block
    skipping = false;
    out.push(line);
  }
  return out.join('\n');
}

/** A project `uds init` set up for Claude Code with NO skills in it (so only what a test adds is there). */
async function projectWithoutSkills(harness = h) {
  const dir = harness.makeDir('no-skills');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  const init = await harness.runCli(['init', '--yes', '--skills-location', 'none'], dir);
  if (init.code !== 0) throw new Error(`fixture: uds init failed (${init.code}): ${init.stdout}\n${init.stderr}`);
  return dir;
}

it('uds check warns that the 56 project skills and the plugin are both installed, and its verdict line, exit code and every other line equal a CLI without the warning, with and without --ci (XSPEC-462 R2)', async () => {
  const dir = await h.newProject();
  const twinDir = await off.newProject();
  const { env } = pluginHome(h);

  for (const flags of [[], ['--ci']]) {
    const real = await h.runCli(['check', '--offline', ...flags], dir, { env });
    const twin = await off.runCli(['check', '--offline', ...flags], twinDir, { env });
    const label = `uds check ${flags.join(' ')}`;

    expect(real.stdout, label).toContain('UDS skills are installed twice: 56 in this project (.claude/skills/) and the plugin universal-dev-standards@asia-ostrich.');
    expect(real.stdout, label).toContain('/commit and /universal-dev-standards:commit');
    expect(real.stdout, label).toContain('name and description is put into context on every turn');
    expect(real.stdout, label).toContain('Keep the project copy: in Claude Code run /plugin uninstall universal-dev-standards@asia-ostrich');
    expect(real.stdout, label).toContain('Keep the plugin: delete the UDS skill folders under .claude/skills/');
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

it('uds check says the double install warning in Traditional and Simplified Chinese (XSPEC-462 R2)', async () => {
  const dir = await h.newProject();
  const { env } = pluginHome(h);
  const tw = await h.runCli(['check', '--offline'], dir, { env, ui: 'zh-tw' });
  const cn = await h.runCli(['check', '--offline'], dir, { env, ui: 'zh-cn' });
  expect(tw.code, tw.stdout + tw.stderr).toBe(0);
  expect(cn.code, cn.stdout + cn.stderr).toBe(0);

  expect(tw.stdout).toContain('UDS 技能裝了兩次：本專案（.claude/skills/）有 56 個，外掛 universal-dev-standards@asia-ostrich 也已安裝。');
  expect(tw.stdout).toContain('每個技能的名稱與描述每回合都會放進脈絡，重複裝等於重複占用。');
  expect(tw.stdout).toContain('二擇一：');
  expect(tw.stdout).toContain('留專案這份：在 Claude Code 執行 /plugin uninstall universal-dev-standards@asia-ostrich');
  expect(tw.stdout).not.toContain('UDS skills are installed twice');

  expect(cn.stdout).toContain('UDS 技能装了两次：本项目（.claude/skills/）有 56 个，插件 universal-dev-standards@asia-ostrich 也已安装。');
  expect(cn.stdout).toContain('每个技能的名称与描述每回合都会放进上下文，重复装等于重复占用。');
  expect(cn.stdout).toContain('二选一：');
  expect(cn.stdout).not.toContain('UDS skills are installed twice');
});

it('uds check counts the UDS skills that are on disk in the project, not the ones UDS ships, and ignores skills of other makers (XSPEC-462 R2)', async () => {
  const dir = await h.newProject();
  for (const name of ['commit-standards', 'testing-guide', 'tdd-assistant', 'sweep', 'plan', 'push']) {
    rmSync(join(dir, '.claude', 'skills', name), { recursive: true, force: true });
  }
  mkdirSync(join(dir, '.claude', 'skills', 'my-own-skill'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'skills', 'my-own-skill', 'SKILL.md'), '# mine\n');
  const { env } = pluginHome(h);

  const run = await h.runCli(['check', '--offline'], dir, { env });
  // Six folders are gone, so the check itself finds missing skill files and ends non-zero; the count is what is under test.
  expect(run.stdout, 'control: the check noticed the missing skills').toMatch(/missing|changed/i);
  expect(run.stdout).toContain('UDS skills are installed twice: 50 in this project');
});

it('uds check says nothing about double installs when only the plugin or only the project skills are installed, and ends the same as a CLI without the warning (XSPEC-462 R2)', async () => {
  const { env } = pluginHome(h);

  // Only the plugin: the project holds no UDS skill.
  const noSkills = await projectWithoutSkills();
  const pluginOnly = await h.runCli(['check', '--offline'], noSkills, { env });
  expect(pluginOnly.stdout, 'control: the plugin was seen').toContain('Skills installed via Plugin Marketplace');
  expect(hasWarning(pluginOnly.stdout), 'plugin only').toBe(false);

  // Only the project skills: no plugin record at all in this HOME.
  const projectOnly = await h.runCli(['check', '--offline'], await h.newProject());
  expect(projectOnly.stdout, 'control: the project skills were seen').toContain('All skill files intact');
  expect(projectOnly.stdout, 'control: no plugin was seen').not.toContain('Skills installed via Plugin Marketplace');
  expect(hasWarning(projectOnly.stdout), 'project only').toBe(false);

  // Neither side changes the exit code relative to the twin.
  const twin = await off.runCli(['check', '--offline'], await projectWithoutSkills(off), { env });
  expect(pluginOnly.code).toBe(twin.code);
});

it('uds check stays quiet and does not fail when the plugin record is missing, is not JSON, belongs to another plugin, has lost its cache folder, or the project holds only skills of other makers (XSPEC-462 R2)', async () => {
  const arms = [
    ['no installed_plugins.json', () => ({ ...pluginHome(h, { record: 'missing' }), dir: null })],
    ['installed_plugins.json is not JSON', () => ({ ...pluginHome(h, { record: 'broken' }), dir: null })],
    ['another plugin only', () => ({ ...pluginHome(h, { record: 'other-plugin' }), dir: null })],
    ['record left behind, cache folder gone', () => ({ ...pluginHome(h, { cache: false }), dir: null })]
  ];
  for (const [name, make] of arms) {
    const { env } = make();
    const dir = await h.newProject();
    const run = await h.runCli(['check', '--offline'], dir, { env });
    expect(run.stdout, `${name}: control: the skills section ran`).toContain('Skills Status');
    expect(hasWarning(run.stdout), name).toBe(false);
    expect(run.code, `${name}: ${run.stdout}${run.stderr}`).toBe(0);
    expect(run.stdout + run.stderr, `${name}: no error text`).not.toMatch(/SyntaxError|Unexpected token|TypeError|Error:/);
  }

  // The plugin is installed, and the project folder holds skills, but none of them is one UDS ships.
  const { env } = pluginHome(h);
  const dir = await projectWithoutSkills();
  mkdirSync(join(dir, '.claude', 'skills', 'my-own-skill'), { recursive: true });
  writeFileSync(join(dir, '.claude', 'skills', 'my-own-skill', 'SKILL.md'), '# mine\n');
  const others = await h.runCli(['check', '--offline'], dir, { env });
  expect(others.stdout, 'control: the plugin was seen').toContain('Skills installed via Plugin Marketplace');
  expect(hasWarning(others.stdout), 'other makers only').toBe(false);
  expect(others.code, others.stdout + others.stderr).toBe(0);
});
