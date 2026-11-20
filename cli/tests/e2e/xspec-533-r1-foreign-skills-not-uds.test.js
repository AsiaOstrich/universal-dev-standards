/**
 * E2E: interactive `uds init` counts only UDS's own skills as "UDS installed" (dev-platform XSPEC-533 R1).
 *
 * Found on a real Windows machine (6.16.0-beta.2): ~/.claude/skills held skills of someone else, no UDS
 * manifest, and `uds init` printed "Claude Code User level: vunknown" - as if UDS were installed, with a
 * version that is not one.
 *
 * Every test spawns the real CLI in a throwaway project with a throwaway HOME that is prepared BEFORE the run,
 * answers every question with Enter, and reads the screen back. The set of shipped skill names comes from the
 * repository's own `skills/` folder, not from the CLI under test.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/utils/skills-installer.js   skillDirs = skillDirs.filter(e => shipped.has(e.name)); // wire:no-manifest-counts-only-shipped-skills
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness, REAL_REPO } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec533-r1');
afterAll(() => h.cleanup());

/** A shipped skill folder name, read from the repository (never from the CLI under test). */
function aShippedSkillName() {
  const root = join(REAL_REPO, 'skills');
  return readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(root, e.name, 'SKILL.md')))
    .map((e) => e.name)
    .sort()[0];
}

/** A home whose ~/.claude/skills holds the given skill folders (each with a SKILL.md) and no manifest. */
function homeWithUserSkills(names) {
  const home = h.makeDir('home');
  for (const name of names) {
    mkdirSync(join(home, '.claude', 'skills', name), { recursive: true });
    writeFileSync(join(home, '.claude', 'skills', name, 'SKILL.md'), `# ${name}\n`);
  }
  return home;
}

/** Arrow-down presses that move the first prompt ("Select display language") from English to the wanted entry. */
const DOWN = '\u001b[B';
const LANGUAGE_ROW = { en: 0, 'zh-tw': 1, 'zh-cn': 2 };

async function interactiveInit(home, language = 'en') {
  const dir = h.makeDir('project');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  // The interactive init asks for its display language first, and says everything after that in the answer.
  // Enter answers every other question. The language question is answered once; the next screens do not hold it.
  let languageAsked = false;
  const drive = (screen) => {
    if (!languageAsked && /display language/i.test(screen)) {
      languageAsked = true;
      return `${DOWN.repeat(LANGUAGE_ROW[language])}\r`;
    }
    return '\r';
  };
  const run = await h.runCli(['init'], dir, { ui: 'en', home, drive, idleMs: 900 });
  expect(run.code, run.stdout + run.stderr).toBe(0);
  return run.stdout;
}

it('interactive uds init does not call a foreign skill folder "User level installed", and prints no "vunknown" (XSPEC-533 R1)', async () => {
  const home = homeWithUserSkills(['my-own-skill-not-from-uds']);
  expect(aShippedSkillName()).toBeTruthy(); // control: the shipped list is not empty
  expect(aShippedSkillName()).not.toBe('my-own-skill-not-from-uds');

  const out = await interactiveInit(home);

  expect(out).toContain('Skills Status:');
  expect(out).not.toMatch(/Claude Code User level:/);
  expect(out).not.toMatch(/vunknown/);
  expect(out).toContain('No Skills installation detected');
}, 180000);

it('interactive uds init with a shipped skill folder and no manifest still reports user level, and says the version is unknown without a "v" prefix, in every UI language (XSPEC-533 R1)', async () => {
  const home = homeWithUserSkills([aShippedSkillName()]);
  const en = await interactiveInit(home, 'en');
  expect(en).toMatch(/Claude Code User level: unknown/);
  expect(en).not.toMatch(/vunknown/);

  const tw = await interactiveInit(home, 'zh-tw');
  expect(tw).toMatch(/Claude Code 使用者層級: 未知/);
  expect(tw).not.toMatch(/vunknown|v未知|unknown/);

  const cn = await interactiveInit(home, 'zh-cn');
  expect(cn).toMatch(/Claude Code 用户级别: 未知/);
  expect(cn).not.toMatch(/vunknown|v未知|unknown/);
}, 300000);
