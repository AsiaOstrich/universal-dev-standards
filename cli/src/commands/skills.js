import chalk from 'chalk';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { getAllSkillNames } from '../utils/registry.js';
import { t } from '../i18n/messages.js';

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
  const msg = t().commands.skills;
  const common = t().commands.common;

  console.log();
  console.log(chalk.bold(msg.title));
  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  // Get all known skills from registry
  const knownSkills = getAllSkillNames();

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
        recommended: !udsPlugin.isLegacyMarketplace,
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
        location: 'User Level (deprecated)',
        path: userSkillsDir,
        version,
        skills: udsSkills,
        deprecated: true
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
        location: 'Project Level (deprecated)',
        path: projectSkillsDir,
        version,
        skills: udsSkills,
        deprecated: true
      });
    }
  }

  // Display results
  if (installations.length === 0) {
    console.log(chalk.yellow(msg.noSkillsInstalled));
    console.log();
    console.log(chalk.gray(msg.installViaMarketplace));
    console.log(chalk.cyan('  /plugin marketplace add AsiaOstrich/universal-dev-standards'));
    console.log(chalk.cyan('  /plugin install universal-dev-standards@asia-ostrich'));
    console.log();
    return;
  }

  // Show each installation
  for (const install of installations) {
    // Header
    if (install.recommended) {
      console.log(chalk.green(`✓ ${install.location}`) + chalk.gray(` ${msg.recommended}`));
    } else if (install.legacyMarketplace) {
      console.log(chalk.yellow(`⚠ ${install.location}`));
    } else if (install.deprecated) {
      console.log(chalk.yellow(`⚠ ${install.location}`));
    } else {
      console.log(chalk.blue(`● ${install.location}`));
    }

    console.log(chalk.gray(`  ${common.version}: ${install.version}`));
    console.log(chalk.gray(`  Path: ${install.path}`));
    console.log();

    // Skills list
    console.log(chalk.gray(`  Skills (${install.skills.length}):`));
    for (const skill of install.skills) {
      const icon = (install.deprecated || install.legacyMarketplace)
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

    // Deprecation warning
    if (install.deprecated) {
      console.log(chalk.yellow(`  ${msg.manualInstallDeprecated}`));
      console.log(chalk.gray(`  ${msg.manualInstallHint}`));
      console.log(chalk.cyan('    /plugin marketplace add AsiaOstrich/universal-dev-standards'));
      console.log(chalk.cyan('    /plugin install universal-dev-standards@asia-ostrich'));
      console.log();
    }
  }

  // Summary
  const totalSkills = new Set(installations.flatMap(i => i.skills)).size;
  const hasMarketplace = installations.some(i => i.recommended);

  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.gray(`${msg.totalUniqueSkills}: ${totalSkills} / ${knownSkills.length}`));

  if (!hasMarketplace && installations.length > 0) {
    console.log();
    console.log(chalk.yellow(msg.recommendation));
    console.log(chalk.gray(`  ${msg.benefits}`));
  }

  console.log();
}

// Export for testing
export const _testing = {
  findUdsPlugin,
  PLUGIN_KEY_NEW,
  PLUGIN_KEY_OLD
};
