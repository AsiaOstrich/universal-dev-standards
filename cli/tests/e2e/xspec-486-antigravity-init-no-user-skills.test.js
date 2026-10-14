/**
 * E2E: interactive `uds init` no longer crashes on a tool that has no user-level skills path
 * (dev-platform XSPEC-486, found by hand on 6.14.0-beta.14 in Windows PowerShell).
 *
 * The problem: `antigravity` has `skills.project` and, on purpose, no `skills.user` (agy knows one skills location,
 * the workspace). The skills-location question built a "User level" choice for every ticked tool and called
 * `config.skills.user.replace(...)`, so ticking Claude Code + Google Antigravity ended in
 * "TypeError: Cannot read properties of undefined (reading 'replace')", exit code 1, nothing installed.
 * The non-interactive paths never ask that question, so no earlier test went through it.
 *
 * Every test spawns the real CLI in a throwaway project and types the answers a person would type, then reads
 * back files, the manifest and the exit code.
 *
 * Wires that make these red when cut or weakened (one line of CLI source each; the mutation was applied and seen red):
 *   cli/src/prompts/init.js           if (config.skills.user) { // wire:skills-prompt-user-level-only-if-path
 *       -> `if (true)`: the interactive init / per-tool config tests go red with the beta.14 TypeError
 *   cli/src/commands/init.js          skillsNoUserPathTools = location === 'user' ? ... : []   (the --yes user-level filter)
 *   cli/src/commands/config.js        if (!hasSkillsLevel(specificTool, level)) {   and   .filter(agent => hasSkillsLevel(agent, skillsLevel))
 *                                     and `.map(agent => ({ agent, level: skillsLevel }))` (it read `location`, a key the installer ignores)
 *   cli/src/commands/update.js        if (hasSkillsLevel(agent, legacyLocation)) skillsInstallations.push(...)
 *   cli/src/config/ai-agent-paths.js  return config.skills.user || null;   (red in tests/unit/config/skills-levels-486.test.js;
 *       every caller already treats a falsy answer as "no such place", so no end-to-end command changes with it)
 */

import { it, expect, afterAll, describe } from 'vitest';
import { mkdirSync, readFileSync, existsSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { createHarness } from '../utils/staged-cli-harness.js';
import { DOWN, ENTER, readManifest, out, typist } from '../utils/xspec-482.js';
import { AI_AGENT_PATHS } from '../../src/config/ai-agent-paths.js';

const h = createHarness('xspec486');
afterAll(() => h.cleanup());

const SPACE = ' ';
const TOOLS_QUESTION = 'Which AI tools are you using?';
const CRASH = /TypeError|Cannot read properties|undefined/;

// The order of the "Which AI tools" checkbox of `uds init`. Whether the keys landed on the right boxes is read back
// from the manifest (aiTools) in every test, so a reordered list shows up as a red test, not as a wrong install.
const POSITION = { 'claude-code': 0, cursor: 1, windsurf: 2, cline: 3, copilot: 4, antigravity: 5, codex: 6, opencode: 7, 'gemini-cli': 8 };

/** Keys that tick the given tools in the AI-tools checkbox, starting at its first line, then confirm. */
function tick(tools) {
  const wanted = new Set(tools.map((t) => POSITION[t]));
  let keys = '';
  for (let i = 0; i <= Math.max(...wanted); i++) keys += (wanted.has(i) ? SPACE : '') + (i < Math.max(...wanted) ? DOWN : '');
  return keys + ENTER;
}

/** Interactive `uds init` in an empty folder (no tool marker, so nothing is pre-ticked) ticking `tools`. */
async function interactiveInit(tools, extraAnswers = {}) {
  const dir = h.makeDir('proj');
  const answers = { [TOOLS_QUESTION]: tick(tools), ...extraAnswers };
  const run = await h.runCli(['init'], dir, { drive: typist(answers), idleMs: 900 });
  return { dir, run };
}

const skillDirs = (dir, rel) => {
  const base = join(dir, ...rel.split('/'));
  return existsSync(base) ? readdirSync(base).filter((n) => existsSync(join(base, n, 'SKILL.md'))) : [];
};

it('interactive uds init ticking Claude Code and Google Antigravity gets past the skills question, exits 0 and installs into .claude/skills and .agents/skills (XSPEC-486 R1)', async () => {
  const { dir, run } = await interactiveInit(['claude-code', 'antigravity']);
  expect(run.code, out(run)).toBe(0);
  expect(out(run)).not.toMatch(CRASH);

  // The question was shown: Claude Code offers both levels, Antigravity only the project one.
  const screen = out(run);
  expect(screen, 'the skills question appeared').toContain('Claude Code - ');
  expect(screen).toMatch(/Claude Code - User Level/);
  expect(screen).toMatch(/Google Antigravity - Project Level/);
  expect(screen, 'Antigravity has no user-level choice').not.toMatch(/Google Antigravity - User Level/);

  // Read back: the tools the keys ticked, and the files and the record of the install.
  const manifest = readManifest(dir);
  expect([...manifest.aiTools].sort()).toEqual(['antigravity', 'claude-code']);
  expect(skillDirs(dir, '.claude/skills').length, 'Claude Code skills installed').toBeGreaterThan(10);
  expect(skillDirs(dir, '.agents/skills').length, 'Antigravity skills installed').toBeGreaterThan(10);
  expect(manifest.skills.installations).toEqual(expect.arrayContaining([
    { agent: 'claude-code', level: 'project' },
    { agent: 'antigravity', level: 'project' }
  ]));
}, 240000);

for (const [label, downs, mode] of [['Manual', 1, 'manual'], ['Hybrid', 2, 'hybrid']]) {
  it(`interactive uds init ticking Claude Code and Google Antigravity and choosing the ${label} release mode exits 0 and writes release-config.yaml with mode ${mode} (XSPEC-486 R1, XSPEC-482 R1 path)`, async () => {
    const { dir, run } = await interactiveInit(['claude-code', 'antigravity'], { 'Select release mode': DOWN.repeat(downs) + ENTER });
    expect(run.code, out(run)).toBe(0);
    expect(out(run)).not.toMatch(/rolled back|TypeError|Cannot read properties/);
    const file = join(dir, '.standards', 'release-config.yaml');
    expect(existsSync(file), out(run)).toBe(true);
    expect(yaml.load(readFileSync(file, 'utf-8')).release.mode).toBe(mode);
    expect(readManifest(dir).options.release_mode).toBe(mode);
    expect(skillDirs(dir, '.agents/skills').length, 'Antigravity skills installed').toBeGreaterThan(10);
  }, 240000);
}

it('interactive uds init ticking every tool the question offers gets past the skills question and installs for each (XSPEC-486 R1)', async () => {
  const everyTool = Object.keys(POSITION);
  const { dir, run } = await interactiveInit(everyTool);
  expect(run.code, out(run)).toBe(0);
  expect(out(run)).not.toMatch(CRASH);
  expect([...readManifest(dir).aiTools].sort()).toEqual([...everyTool].sort());
  for (const tool of everyTool.filter((t) => AI_AGENT_PATHS[t].supportsSkills)) {
    expect(skillDirs(dir, AI_AGENT_PATHS[tool].skills.project.replace(/\/$/, '')).length, `${tool}: skills installed in the project`).toBeGreaterThan(10);
  }
}, 300000);

// ── R3: every tool that can take skills, one at a time ───────────────────────────────────────────

// `uds config --type skills` asks the same skills-location question for the tools in the manifest, and unlike the
// init checkbox it can be given any tool of the path table (Roo Code is in the table, not in the init checkbox).
const skillTools = Object.entries(AI_AGENT_PATHS).filter(([, c]) => c.supportsSkills).map(([name]) => name);

it('the table has tools both with and without a user-level skills path, so the per-tool test below covers both kinds (control)', () => {
  expect(skillTools.length).toBeGreaterThan(5);
  expect(skillTools.filter((t) => AI_AGENT_PATHS[t].skills?.user).length).toBeGreaterThan(5);
  expect(skillTools.filter((t) => !AI_AGENT_PATHS[t].skills?.user)).toContain('antigravity');
});

for (const tool of skillTools) {
  it(`uds config --type skills for ${tool} alone reaches the skills question without a crash and installs at the project level (XSPEC-486 R3)`, async () => {
    const dir = await h.newProject();
    const manifest = readManifest(dir);
    manifest.aiTools = [tool];
    writeFileSync(join(dir, '.standards', 'manifest.json'), JSON.stringify(manifest, null, 2));

    // First question: what to do (the default is "Install/Update Skills"); second: the location (the default ticks the project level).
    const run = await h.runCli(['config', '--type', 'skills'], dir, { drive: typist({}), idleMs: 900 });
    expect(run.code, out(run)).toBe(0);
    expect(out(run)).not.toMatch(CRASH);

    const cfg = AI_AGENT_PATHS[tool];
    const display = out(run).match(new RegExp(`${cfg.name} - (User|Project) Level`, 'g')) || [];
    expect(display.some((l) => l.endsWith('Project Level')), `${tool}: a project-level choice was offered`).toBe(true);
    expect(display.some((l) => l.endsWith('User Level')), `${tool}: user-level choice offered only if the table has a user path`).toBe(Boolean(cfg.skills.user));
    expect(skillDirs(dir, cfg.skills.project.replace(/\/$/, '')).length, `${tool}: skills installed in the project`).toBeGreaterThan(10);
  }, 240000);
}

// ── R2: the other places that ask for a user-level skills folder ─────────────────────────────────

const writeManifestJson = (dir, manifest) => writeFileSync(join(dir, '.standards', 'manifest.json'), JSON.stringify(manifest, null, 2));
const NO_USER_LEVEL = /no user-level skills folder/;

/** A folder `uds init --yes` sees as an Antigravity project (and, with `claude`, a Claude Code one too). */
function antigravityDir({ claude = false } = {}) {
  const dir = h.makeDir('agy');
  mkdirSync(join(dir, '.agents'), { recursive: true });
  writeFileSync(join(dir, '.agents', 'AGENTS.md'), '# agy\n');
  if (claude) mkdirSync(join(dir, '.claude'), { recursive: true });
  return dir;
}

it('uds init --yes --skills-location user in a Claude Code + Antigravity project leaves Antigravity out, says so, and does not crash or write into the project (XSPEC-486 R2)', async () => {
  const dir = antigravityDir({ claude: true });
  const run = await h.runCli(['init', '--yes', '--skills-location', 'user'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(out(run)).not.toMatch(CRASH);
  expect(out(run)).toMatch(/Google Antigravity: .*no user-level skills folder/);
  expect(existsSync(join(dir, '.agents', 'skills')), 'nothing for Antigravity at the user level, and nothing put in the project instead').toBe(false);
  expect(skillDirs(dir, '.claude/skills'), 'the user level was asked for, so the project has none for Claude Code either').toEqual([]);
  expect(readManifest(dir).skills.installations).toEqual([{ agent: 'claude-code', level: 'user' }]);
}, 240000);

it('uds init --yes --skills-location user in an Antigravity-only project installs no skills anywhere and does not fall back to .claude/skills (XSPEC-486 R2)', async () => {
  const dir = antigravityDir();
  const run = await h.runCli(['init', '--yes', '--skills-location', 'user'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(out(run)).not.toMatch(CRASH);
  expect(out(run)).toMatch(/Google Antigravity: .*no user-level skills folder/);
  expect(existsSync(join(dir, '.agents', 'skills'))).toBe(false);
  expect(existsSync(join(dir, '.claude', 'skills')), 'the historical Claude Code folder is a guess for "nothing detected", not for this').toBe(false);
}, 240000);

it('uds init --yes in an Antigravity-only project installs its skills into .agents/skills (control for the two tests above)', async () => {
  const dir = antigravityDir();
  const run = await h.runCli(['init', '--yes'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(skillDirs(dir, '.agents/skills').length).toBeGreaterThan(10);
}, 240000);

it('uds config --type skills --ai-tool antigravity --skills-location user says Antigravity has no user-level folder and installs nothing; at the project level it installs (XSPEC-486 R2)', async () => {
  const dir = await h.newProject();
  const asked = await h.runCli(['config', '--type', 'skills', '--ai-tool', 'antigravity', '--skills-location', 'user'], dir);
  expect(asked.code, out(asked)).toBe(0);
  expect(out(asked)).not.toMatch(CRASH);
  expect(out(asked)).toMatch(NO_USER_LEVEL);
  expect(existsSync(join(dir, '.agents', 'skills'))).toBe(false);

  const project = await h.runCli(['config', '--type', 'skills', '--ai-tool', 'antigravity', '--skills-location', 'project'], dir);
  expect(project.code, out(project)).toBe(0);
  expect(skillDirs(dir, '.agents/skills').length).toBeGreaterThan(10);
}, 240000);

describe('uds config --type skills, "Reinstall declined Skills" for a tool that was declined', () => {
  async function declinedAntigravity() {
    const dir = await h.newProject();
    const manifest = readManifest(dir);
    manifest.aiTools = ['antigravity'];
    manifest.declinedFeatures = { skills: ['antigravity'] };
    writeManifestJson(dir, manifest);
    return dir;
  }
  // menu: Install/Update, Reinstall declined, View, Cancel - the second one; then "Where should Skills be installed?"
  const reinstall = (level) => typist({ 'What would you like to do with Skills?': DOWN + ENTER, 'Where should Skills be installed?': level });

  it('installing at the project level puts the skills where the answer said, in .agents/skills (XSPEC-486 R2)', async () => {
    const dir = await declinedAntigravity();
    const run = await h.runCli(['config', '--type', 'skills'], dir, { drive: reinstall(ENTER), idleMs: 900 });
    expect(run.code, out(run)).toBe(0);
    expect(out(run)).not.toMatch(CRASH);
    expect(out(run)).not.toMatch(/issues|errors?:/i);
    expect(skillDirs(dir, '.agents/skills').length).toBeGreaterThan(10);
    expect(readManifest(dir).skills.installations).toEqual([{ agent: 'antigravity', level: 'project' }]);
  }, 240000);

  it('choosing the user level names Antigravity as having no such folder and installs nothing (XSPEC-486 R2)', async () => {
    const dir = await declinedAntigravity();
    const run = await h.runCli(['config', '--type', 'skills'], dir, { drive: reinstall(DOWN + ENTER), idleMs: 900 });
    expect(run.code, out(run)).toBe(0);
    expect(out(run)).not.toMatch(CRASH);
    expect(out(run)).toMatch(NO_USER_LEVEL);
    expect(out(run), 'the installer was not handed a level it has no folder for').not.toMatch(/some issues|Errors:/);
    expect(existsSync(join(dir, '.agents', 'skills'))).toBe(false);
  }, 240000);
});

it('commands that read the recorded skills installations do not crash or print an undefined path when the manifest names Antigravity at the user level (XSPEC-486 R2)', async () => {
  const dir = await h.newProject();
  const manifest = readManifest(dir);
  manifest.aiTools = ['claude-code', 'antigravity'];
  manifest.skills.installations = [...manifest.skills.installations, { agent: 'antigravity', level: 'user' }];
  writeManifestJson(dir, manifest);

  for (const args of [['check', '--offline'], ['skills'], ['update', '--plan'], ['uninstall', '--dry-run']]) {
    const run = await h.runCli(args, dir);
    expect(out(run), `uds ${args.join(' ')}`).not.toMatch(/TypeError|Cannot read properties|\bundefined\b|\bnull\b/);
    expect([0, 1, 2], `uds ${args.join(' ')} ends with a status the command documents, not a crash: ${out(run).slice(-400)}`).toContain(run.code);
  }
}, 300000);

it('uds update --skills on a legacy manifest that records only "user" does not give a detected Antigravity a user-level installation (XSPEC-486 R2)', async () => {
  const dir = await h.newProject();
  mkdirSync(join(dir, '.agents'), { recursive: true });
  writeFileSync(join(dir, '.agents', 'AGENTS.md'), '# agy\n');
  const manifest = readManifest(dir);
  // The 3.x shape: a location and no list of installations.
  manifest.skills = { installed: true, location: 'user', version: '0.0.1' };
  writeManifestJson(dir, manifest);

  const run = await h.runCli(['update', '--skills', '--yes'], dir);
  expect(out(run)).not.toMatch(CRASH);
  expect(out(run)).not.toMatch(/Google Antigravity \(user\)/);
  expect(existsSync(join(dir, '.agents', 'skills')), 'nothing was written for Antigravity').toBe(false);
  const recorded = readManifest(dir).skills.installations;
  expect(recorded.map((i) => i.agent), 'Antigravity was detected but has no user-level folder').not.toContain('antigravity');
  expect(recorded, 'control: the tools that do have one were kept').toContainEqual({ agent: 'claude-code', level: 'user' });
}, 240000);
