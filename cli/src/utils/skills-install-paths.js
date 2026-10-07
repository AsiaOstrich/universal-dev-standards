/**
 * The two ways to install UDS skills, said side by side (dev-platform XSPEC-462 R1, R2).
 *
 * Until 6.14 `uds skills` called installing skills into the project "deprecated" and told people to use the
 * Claude Code plugin marketplace, while `uds check` and `uds update` told them to run
 * `uds update --apply --skills` (the project way). The word dated from 2026-01 and nobody updated it. The
 * decision (XSPEC-462): the project way is the main path; the plugin marketplace is an alternative with
 * limits that are written down, not hidden.
 *
 * The facts printed here are the ones XSPEC-462 recorded on 2026-10-07:
 *   - the project way works for many AI tools (`cli/src/config/ai-agent-paths.js`), has Traditional and
 *     Simplified Chinese skill texts, and follows the UDS version you installed, betas included;
 *   - the plugin works in Claude Code only, loads the English texts only (the plugin settings have no
 *     language choice), follows stable releases only, and puts no files in the project.
 *
 * Nothing here changes a plan, a verdict or an exit code: it only prints.
 *
 * @module utils/skills-install-paths
 */

import chalk from 'chalk';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { t } from '../i18n/messages.js';
import { getAvailableSkillNames } from './skills-installer.js';

function fill(template, values) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}

/**
 * `uds skills`: both ways, each with what it can and cannot do.
 */
export function printInstallPathComparison() {
  const msg = t().commands.skills.installPaths;

  console.log(chalk.bold(msg.title));
  console.log();

  console.log(chalk.green(`  ● ${msg.projectTitle}`));
  for (const line of msg.projectCommands) {
    console.log(chalk.cyan(`      ${line}`));
  }
  for (const line of msg.projectPoints) {
    console.log(chalk.gray(`      - ${line}`));
  }
  console.log();

  console.log(chalk.blue(`  ● ${msg.pluginTitle}`));
  console.log(chalk.cyan('      /plugin marketplace add AsiaOstrich/universal-dev-standards'));
  console.log(chalk.cyan('      /plugin install universal-dev-standards@asia-ostrich'));
  for (const line of msg.pluginPoints) {
    console.log(chalk.gray(`      - ${line}`));
  }
  console.log();

  console.log(chalk.gray(`  ${msg.bothNote}`));
  console.log();
}

/**
 * The UDS skills that sit in the project's Claude Code skills folder: folders named like a skill UDS ships
 * and holding a SKILL.md. Other people's skills in the same folder are not counted.
 *
 * @param {string} projectPath
 * @returns {string[]}
 */
export function projectUdsSkillNames(projectPath) {
  const dir = join(projectPath, '.claude', 'skills');
  if (!existsSync(dir)) return [];
  let shipped;
  try {
    shipped = new Set(getAvailableSkillNames());
  } catch {
    return [];
  }
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter(e => e.isDirectory() && shipped.has(e.name) && existsSync(join(dir, e.name, 'SKILL.md')))
      .map(e => e.name)
      .sort();
  } catch {
    return [];
  }
}

/**
 * `uds check`: the project has UDS skills AND the UDS plugin is installed, so Claude Code lists every skill
 * twice. Information only: the caller's verdict and exit code do not read anything from here.
 *
 * Silent when either side is missing, and when the plugin record could not be read (`pluginInfo` is null:
 * no file, a file that is not JSON, no UDS plugin in it, or a record whose cache folder is gone).
 *
 * @param {string} projectPath
 * @param {{installed?: boolean, pluginKey?: string, version?: string}|null} pluginInfo - what
 *   `getMarketplaceSkillsInfo()` returned
 * @returns {boolean} whether the warning was printed
 */
export function printDoubleInstallWarning(projectPath, pluginInfo) {
  if (!pluginInfo?.installed) return false;
  const names = projectUdsSkillNames(projectPath);
  if (names.length === 0) return false;

  const msg = t().commands.check;
  const pluginKey = pluginInfo.pluginKey || 'universal-dev-standards@asia-ostrich';
  console.log(chalk.yellow(fill(msg.skillsTwiceTitle, { count: names.length, plugin: pluginKey })));
  console.log(chalk.gray(`    ${msg.skillsTwiceNames}`));
  console.log(chalk.gray(`    ${msg.skillsTwiceContext}`));
  console.log(chalk.gray(`    ${msg.skillsTwiceChoose}`));
  console.log(chalk.gray(`      ${fill(msg.skillsTwiceKeepProject, { plugin: pluginKey })}`));
  console.log(chalk.gray(`      ${msg.skillsTwiceKeepPlugin}`));
  console.log();
  return true;
}
