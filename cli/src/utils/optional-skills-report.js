/**
 * What `uds update` says about optional skills and about the skills a project removed (issue #298).
 *
 * Information only: it is printed after a plan or an update is final, and nothing reads it. The plan
 * itself already leaves optional and removed skills out (`selectSkillNames`); this says WHY a skill a
 * person may have heard of is not in it, and the one command that changes that.
 *
 * @module utils/optional-skills-report
 */

import chalk from 'chalk';
import { existsSync } from 'fs';
import { join } from 'path';
import { getAgentDisplayName, getSkillsDirForAgent } from '../config/ai-agent-paths.js';
import { getAvailableSkillNames } from './skills-installer.js';
import { OPTIONAL_SKILLS, readSkillChoices, skillDisplayName } from './skill-selection.js';

/** Project-recorded installations that live in a folder on disk (not the Claude Code marketplace). */
export function fileBasedSkillInstallations(manifest) {
  return (manifest?.skills?.installations || [])
    .filter((inst) => inst && inst.level !== 'marketplace' && inst.agent);
}

/**
 * Where a skill folder exists, among the project's skill installations.
 * @returns {string[]} display names of the tools, e.g. ['Claude Code', 'OpenCode']
 */
function toolsHolding(folder, manifest, projectPath) {
  const tools = [];
  for (const { agent, level } of fileBasedSkillInstallations(manifest)) {
    const dir = getSkillsDirForAgent(agent, level || 'project', projectPath);
    if (dir && existsSync(join(dir, folder, 'SKILL.md'))) tools.push(getAgentDisplayName(agent) || agent);
  }
  return [...new Set(tools)];
}

/**
 * The facts the section prints, separately from the printing so a test can read them.
 * @returns {{optional: Array<{folder: string, name: string, why: string, installedIn: string[], asked: boolean, removed: boolean}>, removed: Array<{folder: string, name: string}>}}
 */
export function describeSkillChoices(manifest, projectPath) {
  const shipped = new Set(getAvailableSkillNames());
  const { extra, excluded } = readSkillChoices(manifest);
  const optional = Object.entries(OPTIONAL_SKILLS)
    .filter(([folder]) => shipped.has(folder))
    .map(([folder, why]) => ({
      folder,
      name: skillDisplayName(folder),
      why,
      installedIn: toolsHolding(folder, manifest, projectPath),
      asked: extra.has(folder),
      removed: excluded.has(folder)
    }));
  const removed = [...excluded]
    .filter((folder) => shipped.has(folder) && !OPTIONAL_SKILLS[folder])
    .sort()
    .map((folder) => ({ folder, name: skillDisplayName(folder) }));
  return { optional, removed };
}

/**
 * Print the optional-skills section. Silent when the project has no skill folders (nothing to say about).
 * @param {Object} manifest
 * @param {string} projectPath
 */
export function printOptionalSkillsSection(manifest, projectPath) {
  if (fileBasedSkillInstallations(manifest).length === 0) return;
  const { optional, removed } = describeSkillChoices(manifest, projectPath);
  if (optional.length === 0 && removed.length === 0) return;

  console.log(chalk.bold('Optional skills'));
  console.log(chalk.gray('  UDS ships these but installs them only in a project that asks for them.'));
  for (const s of optional) {
    if (s.removed) {
      console.log(chalk.gray(`  - ${s.name} (${s.folder}): removed by this project, not installed. Add it back: uds update --add-skill ${s.name}`));
    } else if (s.installedIn.length > 0) {
      console.log(chalk.gray(`  - ${s.name} (${s.folder}): installed in ${s.installedIn.join(', ')}${s.asked ? '' : ' (already there; kept and updated)'}. Remove it: uds update --remove-skill ${s.name}`));
    } else {
      console.log(chalk.gray(`  - ${s.name} (${s.folder}): not installed. Add it: uds update --add-skill ${s.name}`));
    }
  }
  for (const s of removed) {
    console.log(chalk.gray(`  - ${s.name} (${s.folder}): removed by this project (skills.excluded in the manifest), so no update installs it. Add it back: uds update --add-skill ${s.name}`));
  }
  console.log();
}
