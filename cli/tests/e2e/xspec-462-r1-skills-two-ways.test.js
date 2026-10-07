/**
 * E2E: `uds skills` says there are two ways to install UDS skills and what each one can and cannot do; it no
 * longer calls installing them into the project "deprecated" (dev-platform XSPEC-462 R1).
 *
 * The report (beta.5, Windows): `uds skills` said manual installation is deprecated and told people to use the
 * plugin marketplace, while `uds check` and `uds update` said `uds update --apply --skills`. The word dated
 * from 2026-01. The decision: the project way is the main path; the plugin is an alternative with limits.
 *
 * Every test spawns the real CLI in a throwaway project with a throwaway HOME and reads the output back. The
 * facts that must be on the screen are the ones XSPEC-462 recorded: the project way works for many AI tools,
 * has Traditional and Simplified Chinese texts and follows the UDS version you installed; the plugin is Claude
 * Code only, English only, stable releases only, and puts no files in the project.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/skills.js   printInstallPathComparison();
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { createHarness, REAL_CLI_DIR } from '../utils/staged-cli-harness.js';
import { pluginHome } from '../utils/xspec-462.js';

const h = createHarness('xspec462-r1');
afterAll(() => h.cleanup());

const DEPRECATED_WORDS = /deprecat|已棄用|棄用|已弃用|弃用/i;

it('uds skills for a project with the skills installed prints the two ways to install them with their limits, never says deprecated, and still lists every skill (XSPEC-462 R1)', async () => {
  const dir = await h.newProject();
  const run = await h.runCli(['skills'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);

  // Control: the installation itself is still listed, so a short output is not a different command.
  expect(run.stdout).toContain('Project Level');
  expect(run.stdout).toMatch(/Total unique skills: 56 \/ 56/);

  expect(run.stdout, 'no word for deprecated anywhere').not.toMatch(DEPRECATED_WORDS);
  expect(run.stdout, 'no push to migrate to the plugin').not.toMatch(/Migrate to Plugin Marketplace|Recommendation/);

  // Both ways, each with its own limits.
  expect(run.stdout).toContain('Two ways to install UDS skills');
  expect(run.stdout).toContain('Into the project (the main path)');
  expect(run.stdout).toContain('uds update --apply --skills');
  expect(run.stdout).toContain('Works with many AI tools: Claude Code, OpenCode, Cursor, Codex, Copilot, Windsurf and more.');
  expect(run.stdout).toContain('Has Traditional and Simplified Chinese skill texts');
  expect(run.stdout).toContain('Follows the UDS version you installed, beta releases included.');
  expect(run.stdout).toContain('Claude Code plugin marketplace (an alternative, with limits)');
  expect(run.stdout).toContain('/plugin install universal-dev-standards@asia-ostrich');
  expect(run.stdout).toContain('Claude Code only.');
  expect(run.stdout).toContain('English skill texts only');
  expect(run.stdout).toContain('Follows stable releases only');
  expect(run.stdout).toContain('Puts no files in the project');
  // The project way is named before the plugin.
  expect(run.stdout.indexOf('Into the project (the main path)')).toBeLessThan(run.stdout.indexOf('Claude Code plugin marketplace'));
});

it('uds skills says the two ways and their limits in Traditional and Simplified Chinese, with no word for deprecated in either (XSPEC-462 R1)', async () => {
  const dir = await h.newProject();
  const tw = await h.runCli(['skills'], dir, { ui: 'zh-tw' });
  const cn = await h.runCli(['skills'], dir, { ui: 'zh-cn' });
  for (const run of [tw, cn]) expect(run.code, run.stdout + run.stderr).toBe(0);

  expect(tw.stdout).toContain('安裝 UDS 技能的兩種方式');
  expect(tw.stdout).toContain('裝進專案（主要路徑）');
  expect(tw.stdout).toContain('Claude Code 外掛市集（替代方式，有限制）');
  expect(tw.stdout).toContain('只有英文技能文字');
  expect(tw.stdout).toContain('只跟正式版');
  expect(tw.stdout).toContain('專案內不放檔案');
  expect(tw.stdout).toContain('uds update --apply --skills');

  expect(cn.stdout).toContain('安装 UDS 技能的两种方式');
  expect(cn.stdout).toContain('装进项目（主要路径）');
  expect(cn.stdout).toContain('只有英文技能文本');
  expect(cn.stdout).toContain('只跟正式版');
  expect(cn.stdout).toContain('项目内不放文件');

  for (const [name, run] of [['zh-tw', tw], ['zh-cn', cn]]) {
    expect(run.stdout, `${name}: no word for deprecated`).not.toMatch(DEPRECATED_WORDS);
    expect(run.stdout, `${name}: no push to migrate to the plugin`).not.toMatch(/遷移到 Plugin Marketplace|迁移到 Plugin Marketplace|建議：遷移|建议：迁移/);
  }
});

it('uds skills with nothing installed names both ways, the project way first, instead of only the plugin (XSPEC-462 R1)', async () => {
  const dir = h.makeDir('nothing-installed');
  const run = await h.runCli(['skills'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout).toContain('No Universal Dev Standards skills installed.');
  // Control: this is the empty case, not a listing.
  expect(run.stdout).not.toContain('Total unique skills');

  expect(run.stdout).toContain('Two ways to install UDS skills');
  expect(run.stdout).toContain('uds init --skills-location project');
  expect(run.stdout).toContain('/plugin marketplace add AsiaOstrich/universal-dev-standards');
  expect(run.stdout).toContain('Puts no files in the project');
  expect(run.stdout.indexOf('Into the project (the main path)')).toBeLessThan(run.stdout.indexOf('/plugin marketplace add'));
  expect(run.stdout).not.toMatch(DEPRECATED_WORDS);
});

it('uds skills labels user level skills and the plugin without deprecated or recommended, and lists what each one holds (XSPEC-462 R1)', async () => {
  const dir = h.makeDir('user-and-plugin');
  const { home, env } = pluginHome(h, { skillDirs: ['commit-standards', 'testing-guide'] });
  // A user-level UDS skill in the same HOME.
  const userSkill = join(home, '.claude', 'skills', 'tdd-assistant');
  mkdirSync(userSkill, { recursive: true });
  writeFileSync(join(userSkill, 'SKILL.md'), '# TDD\n');

  const run = await h.runCli(['skills'], dir, { env });
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout).toContain('✓ Plugin Marketplace');
  expect(run.stdout).toContain('● User Level');
  // Control: both installations really were read (skills of each are listed).
  expect(run.stdout).toContain('commit-standards');
  expect(run.stdout).toContain('tdd-assistant');
  expect(run.stdout).not.toMatch(DEPRECATED_WORDS);
  expect(run.stdout).not.toMatch(/\(recommended\)|Recommendation/);
  expect(run.stdout).not.toContain('⚠');
});

/** A project whose standards and skills are older than the CLI, so `uds update` ends with the skills reminder. */
async function projectBehindOnSkills(location) {
  const dir = await h.newProject();
  const mPath = join(dir, '.standards', 'manifest.json');
  const manifest = JSON.parse(readFileSync(mPath, 'utf-8'));
  manifest.upstream.version = '6.13.0';
  manifest.skills.version = '1.0.0';
  if (location) manifest.skills.location = location;
  writeFileSync(mPath, JSON.stringify(manifest, null, 2));
  return dir;
}

it('uds update tells a project whose skills are behind to run uds update --apply --skills, and no longer calls that install deprecated or points at a git pull (XSPEC-462 R1)', async () => {
  const dir = await projectBehindOnSkills('project');
  const run = await h.runCli(['update', '--offline', '--yes', '--standards-only'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  // Control: the reminder was reached.
  expect(run.stdout).toContain('Skills update available:');
  expect(run.stdout).toContain('Current: 1.0.0');

  expect(run.stdout).toContain('Update them with: uds update --apply --skills');
  expect(run.stdout).not.toMatch(DEPRECATED_WORDS);
  expect(run.stdout).not.toMatch(/git pull|claude-code-plugins|Migrate to Plugin Marketplace/);

  const tw = await h.runCli(['update', '--offline', '--yes', '--standards-only'], await projectBehindOnSkills('project'), { ui: 'zh-tw' });
  expect(tw.stdout).toContain('更新方式：uds update --apply --skills');
  expect(tw.stdout).not.toMatch(DEPRECATED_WORDS);
});

it('uds update names the asia-ostrich marketplace when the skills came from the plugin (XSPEC-462 R1)', async () => {
  const dir = await projectBehindOnSkills('marketplace');
  const run = await h.runCli(['update', '--offline', '--yes', '--standards-only'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout).toContain('Skills update available:');
  expect(run.stdout).toContain('Update via Plugin Marketplace:');
  expect(run.stdout).toContain('/plugin marketplace update asia-ostrich');
  expect(run.stdout).not.toContain('anthropic-agent-skills');
});

it('no message the CLI can print still calls manual skills installation deprecated or asks to migrate to the plugin, in any of the three languages (XSPEC-462 R1)', () => {
  const text = readFileSync(resolve(REAL_CLI_DIR, 'src', 'i18n', 'messages.js'), 'utf-8');
  // Control: the scan reads the real file (the new text is in it).
  expect(text).toContain('Two ways to install UDS skills');
  expect(text).toContain('安裝 UDS 技能的兩種方式');
  expect(text).toContain('安装 UDS 技能的两种方式');
  for (const pattern of [
    /Manual installation is deprecated/i,
    /手動安裝已棄用/, /手动安装已弃用/,
    /Migrate to Plugin Marketplace/, /遷移到 Plugin Marketplace/, /迁移到 Plugin Marketplace/,
    /manualInstallDeprecated|recommendedMigrate|orUpdateManually|manualInstallHint/
  ]) {
    expect(text, String(pattern)).not.toMatch(pattern);
  }
});
