/**
 * Which skills a project gets: the one place that decides (issue #298).
 *
 * UDS ships every skill under `skills/`. Until 6.15.0-beta.1 every project got every skill. A skill that
 * calls itself optional (`open-work`) was installed everywhere anyway, next to the adopter's own skill of
 * the same kind, and the model then saw two skills that said nearly the same thing.
 *
 * The set a project gets is:
 *
 *   shipped - optional skills - skills the project removed
 *     + optional skills the project added
 *     + optional skills that are already in this tool's folder
 *
 *   ... and then minus the skills the project removed, whichever line they came in on.
 *
 * "Already in this tool's folder" keeps what 6.15.0-beta.1 installed: a project that already holds
 * `open-work` is not told to delete it on the next `uds update`; it is updated like any other skill, until
 * the project removes it (`uds update --remove-skill open-work`).
 *
 * ONE FUNCTION, TWO CALLERS. The reconciler's plan (`calculateSkills`) and the installer
 * (`installSkillsForAgent`, every call that passes `skillNames = null`) both ask {@link selectSkillNames}.
 * They used to each derive "the set" on their own, and two derivations of one set are how a plan promises
 * one thing and an apply does another (XSPEC-382 R1).
 *
 * Names are the skill's FOLDER name everywhere inside the manifest and this module.
 * {@link resolveSkillName} turns what a person types (`open-work` or `open-work-assistant`) into it.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getSkillsSourceDir } from './skills-source.js';
import { parseFrontmatter } from './skill-frontmatter.js';
import { getSkillsDirForAgent } from '../config/ai-agent-paths.js';
import { readManifest } from '../core/manifest.js';
import { OPTIONAL_SKILLS, isOptionalSkill } from './optional-skills.js';

export { OPTIONAL_SKILLS, isOptionalSkill };

const asNameSet = (value) => new Set(Array.isArray(value) ? value.filter((v) => typeof v === 'string') : []);

/**
 * What the project chose, read from `manifest.skills`. A manifest written before #298 has neither key,
 * which reads as "the project chose nothing".
 *
 *   `skills.extra`    optional skills the project asked for (`--add-skill`)
 *   `skills.excluded` skills the project does not want (`--remove-skill`); any skill, not only optional ones
 *
 * (`skills.names` is no substitute: it is the union of what UDS has installed, written by the installer,
 * not a choice anyone made.)
 *
 * @param {Object|null|undefined} manifest
 * @returns {{extra: Set<string>, excluded: Set<string>}}
 */
export function readSkillChoices(manifest) {
  return { extra: asNameSet(manifest?.skills?.extra), excluded: asNameSet(manifest?.skills?.excluded) };
}

/** Is this skill's folder present in the tool's skills folder? (SKILL.md is what makes a folder a skill.) */
function isOnDisk(folder, projectPath, agent, level) {
  if (!agent) return false;
  const dir = getSkillsDirForAgent(agent, level || 'project', projectPath || null);
  return Boolean(dir) && existsSync(join(dir, folder, 'SKILL.md'));
}

/**
 * The skills one tool folder should hold.
 *
 * @param {Object} args
 * @param {string[]} args.shipped - what this UDS ships (`getAvailableSkillNames()`)
 * @param {Object|null} [args.manifest] - the project's manifest; null = the project chose nothing
 * @param {string|null} [args.projectPath]
 * @param {string} [args.agent] - the tool whose folder this is (needed to see what is already there)
 * @param {string} [args.level] - 'project' | 'user'
 * @returns {string[]} folder names, in the order of `shipped`
 */
export function selectSkillNames({ shipped, manifest = null, projectPath = null, agent = null, level = 'project' }) {
  const { extra, excluded } = readSkillChoices(manifest);
  return shipped.filter((folder) => {
    if (excluded.has(folder)) return false;
    if (!isOptionalSkill(folder)) return true;
    return extra.has(folder) || isOnDisk(folder, projectPath, agent, level); // wire:optional-skill-kept-on-disk
  });
}

/**
 * The same question for the installer, which has a project path and not a manifest in hand: it reads the
 * choices the project has recorded. No project path (a user-level install) or no manifest (a first
 * `uds init`) means no choices - the default set.
 */
export function selectSkillNamesForInstall({ shipped, projectPath = null, agent = null, level = 'project' }) {
  let manifest = null;
  if (projectPath) {
    try {
      manifest = readManifest(projectPath);
    } catch {
      manifest = null;
    }
  }
  return selectSkillNames({ shipped, manifest, projectPath, agent, level });
}

/**
 * The name a person sees for a skill: its `name:` line (`open-work`), which differs from the folder
 * (`open-work-assistant`) for many skills. Read from the English source.
 * @param {string} folder
 * @returns {string} the folder name when the frontmatter has no `name`
 */
export function skillDisplayName(folder) {
  try {
    const parsed = parseFrontmatter(readFileSync(join(getSkillsSourceDir(), folder, 'SKILL.md'), 'utf-8'));
    const name = parsed?.frontmatter?.name;
    return typeof name === 'string' && name ? name : folder;
  } catch {
    return folder;
  }
}

/**
 * Turn what a person typed into a shipped skill's folder name. Accepts the folder name or the skill's
 * `name:` (`open-work-assistant` and `open-work` both mean the same skill).
 *
 * @param {string} input
 * @param {string[]} shipped
 * @returns {{folder: string}|{error: 'unknown'|'ambiguous', available: string[]}}
 *   `available` lists every name that would have been accepted, as `name (folder)`-style labels for the message.
 */
export function resolveSkillName(input, shipped) {
  const wanted = String(input ?? '').trim();
  const labels = shipped.map((folder) => {
    const display = skillDisplayName(folder);
    return display === folder ? folder : `${display} (${folder})`;
  });
  if (shipped.includes(wanted)) return { folder: wanted };
  const byDisplay = shipped.filter((folder) => skillDisplayName(folder) === wanted);
  if (byDisplay.length === 1) return { folder: byDisplay[0] };
  return { error: byDisplay.length > 1 ? 'ambiguous' : 'unknown', available: labels };
}
