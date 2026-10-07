import chalk from 'chalk';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { getAllSkillNames } from '../utils/registry.js';
import { getAvailableSkillNames } from '../utils/skills-installer.js';
import { pruneForeignSkillHashes } from '../utils/skill-hash-ownership.js';
import { getSkillsDirForAgent, getAgentDisplayName } from '../config/ai-agent-paths.js';
import { readManifest, isInitialized } from '../utils/copier.js';
import { t, setLanguage, isLanguageExplicitlySet } from '../i18n/messages.js';
import { printInstallPathComparison } from '../utils/skills-install-paths.js';

// Known skill directories (non-skill items to exclude)
const NON_SKILL_ITEMS = [
  'README.md',
  'CONTRIBUTING.template.md',
  'universal-dev-standards',
  '.manifest.json',
  '.DS_Store'
];

/**
 * Get installed plugins info from Claude Code
 * @returns {Object|null} Plugins info or null
 */
function getInstalledPlugins() {
  const pluginsPath = join(homedir(), '.claude', 'plugins', 'installed_plugins.json');

  if (!existsSync(pluginsPath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(pluginsPath, 'utf-8'));
  } catch {
    return null;
  }
}

// Plugin keys for different marketplace versions
const PLUGIN_KEY_NEW = 'universal-dev-standards@asia-ostrich';
const PLUGIN_KEY_OLD = 'universal-dev-standards@universal-dev-standards';

/**
 * Find universal-dev-standards plugin in installed plugins
 * Prioritizes new @asia-ostrich marketplace, falls back to legacy @universal-dev-standards
 * @param {Object} pluginsInfo - Installed plugins info
 * @returns {Object|null} Plugin info or null
 */
function findUdsPlugin(pluginsInfo) {
  if (!pluginsInfo?.plugins) {
    return null;
  }

  // Priority order: new marketplace first, then legacy
  const keysToCheck = [PLUGIN_KEY_NEW, PLUGIN_KEY_OLD];

  for (const key of keysToCheck) {
    const installations = pluginsInfo.plugins[key];
    if (installations && installations.length > 0) {
      return {
        key,
        isLegacyMarketplace: key === PLUGIN_KEY_OLD,
        ...installations[0]
      };
    }
  }

  return null;
}

/**
 * List skill directories in a path
 * @param {string} dirPath - Directory path to scan
 * @returns {string[]} Array of skill names
 */
function listSkillsInDir(dirPath) {
  if (!existsSync(dirPath)) {
    return [];
  }

  try {
    const items = readdirSync(dirPath, { withFileTypes: true });
    return items
      .filter(item => item.isDirectory() && !NON_SKILL_ITEMS.includes(item.name))
      .map(item => item.name)
      .sort();
  } catch {
    return [];
  }
}

/**
 * Skills command - list installed skills
 */
export function skillsCommand() {
  const projectPath = process.cwd();

  // Set UI language based on project's display_language if initialized
  // Only override if user didn't explicitly set --ui-lang flag
  if (!isLanguageExplicitlySet() && isInitialized(projectPath)) {
    const manifest = readManifest(projectPath);
    if (manifest?.options?.display_language) {
      const uiLang = manifest.options.display_language;
      setLanguage(uiLang);
    }
  }

  // Now get localized messages
  const msg = t().commands.skills;
  const common = t().commands.common;

  console.log();
  console.log(chalk.bold(msg.title));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  // XSPEC-456 R3: the skills UDS ships are the ones in its skills source tree (what `uds init` and
  // `uds update` install, and what `uds check` verifies). This used to be the `skillFiles` list of
  // standards-registry.json, a hand-kept list that stopped at 30 while UDS ships 56, so a project with
  // all 56 installed read "27 / 30" (27 = the installed ones that happened to be on the stale list).
  // The registry list is only a fallback for a source tree that did not load.
  const shipped = getAvailableSkillNames();
  const knownSkills = shipped.length > 0 ? shipped : getAllSkillNames();

  // XSPEC-462 R1: one place that prints the two ways to install (an empty result and a full one both end with it).
  const sayBothWays = () => {
    printInstallPathComparison();
  };

  // Check different installation locations
  const installations = [];

  // 1. Check Plugin Marketplace installation
  const pluginsInfo = getInstalledPlugins();
  const udsPlugin = findUdsPlugin(pluginsInfo);

  if (udsPlugin && udsPlugin.installPath && existsSync(udsPlugin.installPath)) {
    const skills = listSkillsInDir(udsPlugin.installPath);
    if (skills.length > 0) {
      installations.push({
        location: udsPlugin.isLegacyMarketplace
          ? 'Plugin Marketplace (legacy)'
          : 'Plugin Marketplace',
        path: udsPlugin.installPath,
        version: udsPlugin.version || 'unknown',
        skills,
        isPlugin: true,
        legacyMarketplace: udsPlugin.isLegacyMarketplace
      });
    }
  }

  // 2. Check user-level installation (~/.claude/skills/)
  const userSkillsDir = join(homedir(), '.claude', 'skills');
  if (existsSync(userSkillsDir)) {
    const skills = listSkillsInDir(userSkillsDir);
    // Filter to only known UDS skills
    const udsSkills = skills.filter(s => knownSkills.includes(s));
    if (udsSkills.length > 0) {
      // Check for manifest
      const manifestPath = join(userSkillsDir, '.manifest.json');
      let version = 'unknown';
      if (existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
          version = manifest.version || 'unknown';
        } catch {
          // ignore
        }
      }

      installations.push({
        location: 'User Level',
        path: userSkillsDir,
        version,
        skills: udsSkills
      });
    }
  }

  // 3. Check project-level installation (.claude/skills/)
  const projectSkillsDir = join(projectPath, '.claude', 'skills');
  if (existsSync(projectSkillsDir)) {
    const skills = listSkillsInDir(projectSkillsDir);
    // Filter to only known UDS skills
    const udsSkills = skills.filter(s => knownSkills.includes(s));
    if (udsSkills.length > 0) {
      // Check for manifest
      const manifestPath = join(projectSkillsDir, '.manifest.json');
      let version = 'unknown';
      if (existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
          version = manifest.version || 'unknown';
        } catch {
          // ignore
        }
      }

      installations.push({
        location: 'Project Level',
        path: projectSkillsDir,
        version,
        skills: udsSkills
      });
    }
  }

  // 4. Other AI tools the manifest says Skills were installed for (Codex, OpenCode, ...). Claude Code's
  // own two locations were handled above.
  const manifestForSkills = isInitialized(projectPath) ? readManifest(projectPath) : null;
  const seenDirs = new Set(installations.map(i => i.path));
  for (const entry of manifestForSkills?.skills?.installations || []) {
    const agent = typeof entry === 'string' ? entry : entry?.agent;
    const level = typeof entry === 'string' ? 'project' : (entry?.level || 'project');
    if (!agent || agent === 'claude-code') continue;
    const dir = getSkillsDirForAgent(agent, level, projectPath);
    if (!dir || seenDirs.has(dir)) continue;
    seenDirs.add(dir);
    const udsSkills = listSkillsInDir(dir).filter(s => knownSkills.includes(s));
    if (udsSkills.length === 0) continue;
    installations.push({
      location: `${getAgentDisplayName(agent)} (${level} level)`,
      path: dir,
      version: manifestForSkills.skills.version || 'unknown',
      skills: udsSkills
    });
  }

  // Display results
  if (installations.length === 0) {
    console.log(chalk.yellow(msg.noSkillsInstalled));
    console.log();
    // XSPEC-462 R1: say both ways and what each one can and cannot do, not only the plugin.
    sayBothWays();
    return;
  }

  // Show each installation
  for (const install of installations) {
    // Header
    if (install.legacyMarketplace) {
      console.log(chalk.yellow(`⚠ ${install.location}`));
    } else if (install.isPlugin) {
      console.log(chalk.green(`✓ ${install.location}`));
    } else {
      console.log(chalk.blue(`● ${install.location}`));
    }

    console.log(chalk.gray(`  ${common.version}: ${install.version}`));
    console.log(chalk.gray(`  Path: ${install.path}`));
    console.log();

    // Skills list
    console.log(chalk.gray(`  Skills (${install.skills.length}):`));
    for (const skill of install.skills) {
      const icon = install.legacyMarketplace
        ? chalk.yellow('○')
        : chalk.green('✓');
      console.log(`    ${icon} ${skill}`);
    }
    console.log();

    // Legacy marketplace migration notice
    if (install.legacyMarketplace) {
      console.log(chalk.yellow(`  ${msg.legacyMarketplaceWarning}`));
      console.log(chalk.gray(`  ${msg.legacyMarketplaceHint}`));
      console.log(chalk.cyan('    /plugin uninstall universal-dev-standards@universal-dev-standards'));
      console.log(chalk.cyan('    /plugin install universal-dev-standards@asia-ostrich'));
      console.log();
    }
  }

  // Summary
  const totalSkills = new Set(installations.flatMap(i => i.skills)).size;

  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.gray(`${msg.totalUniqueSkills}: ${totalSkills} / ${knownSkills.length}`));

  // The number `uds check` prints is a count of FILES (a skill is one or more files), so say how the two
  // relate instead of leaving two different numbers side by side. Counted the way `check` counts them.
  if (manifestForSkills?.skillHashes) {
    const tracked = structuredClone(manifestForSkills);
    pruneForeignSkillHashes(tracked, new Set(knownSkills));
    const files = Object.keys(tracked.skillHashes || {}).length;
    if (files > 0 && msg.skillFilesTracked) {
      console.log(chalk.gray(msg.skillFilesTracked.replace('{files}', files)));
    }
  }

  // XSPEC-462 R1: the two ways, side by side, with their limits.
  console.log();
  sayBothWays();
}

// Export for testing
export const _testing = {
  findUdsPlugin,
  PLUGIN_KEY_NEW,
  PLUGIN_KEY_OLD
};
