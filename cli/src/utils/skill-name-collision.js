/**
 * A personal skill with the same name as a UDS skill installed in the project (dev-platform XSPEC-465 R1).
 *
 * Why it matters: Claude Code picks ONE skill per name, and it picks silently. Personal skills
 * (`~/.claude/skills/<name>/`) rank above project skills (`.claude/skills/<name>/`), where `uds init` and
 * `uds update --apply --skills` put the UDS skills. So an adopter who already has a personal `plan` or `push`
 * skill runs their own when they type `/plan`, and the UDS one never runs. There is no error, no warning,
 * nothing in the output of the install.
 *
 * What the rule is (Claude Code skills documentation, read 2026-10-07, https://code.claude.com/docs/en/skills):
 *   - a skill's command name is the `name` in its SKILL.md frontmatter, or the folder name when there is none;
 *     "the directory name also invokes the skill", so BOTH names are compared here (on both sides);
 *   - enterprise over personal, and personal over project;
 *   - a plugin skill is `/<plugin>:<skill>`, so it never collides, and a skill beats a `.claude/commands/`
 *     file of the same name, so neither is listed.
 *
 * What this can see, and what it cannot (said in the printed text too, because "no warning" must not be
 * read as "no collision"):
 *   - sees: this machine's personal folder, read again on every call;
 *   - does not see: the enterprise level (the managed settings directory, location depends on the
 *     organization), and personal skills added after the call.
 *
 * It is information only: the callers' verdict and exit code do not read anything from here, and nothing here
 * throws. A personal folder that is missing, is not a folder, or cannot be read prints nothing.
 *
 * @module utils/skill-name-collision
 */

import chalk from 'chalk';
import { readdirSync, readFileSync, realpathSync, statSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { load as parseYaml } from 'js-yaml';
import { t } from '../i18n/messages.js';
import { getAvailableSkillNames } from './skills-installer.js';

function fill(template, values) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}

function isDirectory(path) {
  try {
    return statSync(path).isDirectory(); // follows symlinks: people link their skill folders in
  } catch {
    return false;
  }
}

/**
 * The names a skill folder answers to: its folder name, plus the frontmatter `name` when there is one.
 *
 * @param {string} skillDir - folder holding SKILL.md
 * @returns {string[]|null} null = this folder is not a skill we can read (no SKILL.md, cannot be read, or the
 *   frontmatter is present but is not valid YAML, so nobody can say what Claude Code would do with it)
 */
export function skillCommandNames(skillDir) {
  const folderName = skillDir.split(/[\\/]/).filter(Boolean).pop();
  let text;
  try {
    const file = join(skillDir, 'SKILL.md');
    if (!statSync(file).isFile()) return null;
    text = readFileSync(file, 'utf-8');
  } catch {
    return null;
  }
  const names = [folderName];
  const match = text.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return names; // no frontmatter: the folder name is the name
  let data;
  try {
    data = parseYaml(match[1]);
  } catch {
    return null;
  }
  if (data && typeof data === 'object' && typeof data.name === 'string' && data.name.trim()) {
    const declared = data.name.trim();
    if (declared !== folderName) names.push(declared);
  }
  return names;
}

/**
 * Collisions between the UDS skills installed in the project and the personal skills of this machine.
 *
 * @param {string} projectPath
 * @param {{ home?: string }} [opts] - `home` only for callers that already know it; defaults to os.homedir()
 * @returns {{ names: string[], udsFolder: string, personalFolder: string }[]} one entry per (UDS skill,
 *   personal skill) pair that share a name; `names` are the shared names, empty list when nothing is found or
 *   anything could not be read
 */
export function findSkillNameCollisions(projectPath, { home } = {}) {
  try {
    const personalDir = join(home ?? homedir(), '.claude', 'skills');
    const projectDir = join(projectPath, '.claude', 'skills');
    if (!isDirectory(personalDir) || !isDirectory(projectDir)) return [];
    // A project that IS the home folder has the same folder on both sides: that is one skill, not two.
    if (realpathSync(personalDir) === realpathSync(projectDir)) return [];

    const shipped = new Set(getAvailableSkillNames());

    // UDS installed at user level (`uds init --skills-location user`) leaves its own copies, and a manifest that
    // says so, in the personal folder. Those are UDS's, not someone else's skill: leave them out.
    let personalHoldsUds = false;
    try {
      const manifest = JSON.parse(readFileSync(join(personalDir, '.manifest.json'), 'utf-8'));
      personalHoldsUds = manifest?.source === 'universal-dev-standards';
    } catch {
      personalHoldsUds = false;
    }

    const uds = [];
    for (const entry of readdirSync(projectDir, { withFileTypes: true })) {
      if (!shipped.has(entry.name)) continue; // only the skills UDS ships; the adopter's own are not ours to judge
      const dir = join(projectDir, entry.name);
      if (!isDirectory(dir)) continue;
      const names = skillCommandNames(dir);
      if (names) uds.push({ folder: entry.name, names });
    }
    if (uds.length === 0) return [];

    const found = [];
    for (const entry of readdirSync(personalDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.')) continue;
      if (personalHoldsUds && shipped.has(entry.name)) continue;
      const dir = join(personalDir, entry.name);
      if (!isDirectory(dir)) continue;
      const personalNames = skillCommandNames(dir);
      if (!personalNames) continue;
      for (const skill of uds.slice().sort((a, b) => a.folder.localeCompare(b.folder))) {
        const shared = skill.names.filter(n => personalNames.includes(n));
        if (shared.length > 0) found.push({ names: shared, udsFolder: skill.folder, personalFolder: entry.name });
      }
    }
    return found;
  } catch {
    return []; // unreadable, permission denied, anything else: no warning and no error
  }
}

/**
 * Print the warning. Information only; the caller's verdict and exit code do not read anything from here.
 *
 * @param {string} projectPath
 * @param {{ home?: string }} [opts]
 * @returns {boolean} whether the warning was printed
 */
export function printSkillNameCollisionWarning(projectPath, opts = {}) {
  const collisions = findSkillNameCollisions(projectPath, opts);
  if (collisions.length === 0) return false;

  const msg = t().commands.check;
  console.log(chalk.yellow(fill(msg.skillNameCollisionTitle, { count: collisions.length })));
  for (const c of collisions) {
    console.log(chalk.gray(`    ${fill(msg.skillNameCollisionItem, {
      command: c.names.map(n => `/${n}`).join(', '),
      personal: `~/.claude/skills/${c.personalFolder}/`,
      uds: `.claude/skills/${c.udsFolder}/`
    })}`));
  }
  console.log(chalk.gray(`    ${msg.skillNameCollisionEffect}`));
  console.log(chalk.gray(`    ${msg.skillNameCollisionChoose}`));
  console.log(chalk.gray(`      ${msg.skillNameCollisionRename}`));
  console.log(chalk.gray(`      ${msg.skillNameCollisionDrop}`));
  console.log(chalk.gray(`    ${msg.skillNameCollisionLimits}`));
  console.log();
  return true;
}

export default { findSkillNameCollisions, printSkillNameCollisionWarning, skillCommandNames };
