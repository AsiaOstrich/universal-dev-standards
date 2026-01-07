import chalk from 'chalk';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { getAllSkillNames } from '../utils/registry.js';

// Known skill directories (non-skill items to exclude)
const NON_SKILL_ITEMS = [
  'README.md',
  'CONTRIBUTING.template.md',
  'install.sh',
  'install.ps1',
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

/**
 * Find universal-dev-standards plugin in installed plugins
 * @param {Object} pluginsInfo - Installed plugins info
 * @returns {Object|null} Plugin info or null
 */
function findUdsPlugin(pluginsInfo) {
  if (!pluginsInfo?.plugins) {
    return null;
  }

  // Look for universal-dev-standards plugin
  for (const [key, installations] of Object.entries(pluginsInfo.plugins)) {
    if (key.includes('universal-dev-standards')) {
      // Return the first (usually only) installation
      if (installations.length > 0) {
        return {
          key,
          ...installations[0]
        };
      }
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

  console.log();
  console.log(chalk.bold('Universal Dev Standards - Installed Skills'));
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
        location: 'Plugin Marketplace',
        path: udsPlugin.installPath,
        version: udsPlugin.version || 'unknown',
        skills,
        recommended: true
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
    console.log(chalk.yellow('No Universal Dev Standards skills installed.'));
    console.log();
    console.log(chalk.gray('Install via Plugin Marketplace:'));
    console.log(chalk.cyan('  /plugin marketplace add AsiaOstrich/universal-dev-standards'));
    console.log(chalk.cyan('  /plugin install universal-dev-standards@asia-ostrich'));
    console.log();
    return;
  }

  // Show each installation
  for (const install of installations) {
    // Header
    if (install.recommended) {
      console.log(chalk.green(`✓ ${install.location}`) + chalk.gray(' (recommended)'));
    } else if (install.deprecated) {
      console.log(chalk.yellow(`⚠ ${install.location}`));
    } else {
      console.log(chalk.blue(`● ${install.location}`));
    }

    console.log(chalk.gray(`  Version: ${install.version}`));
    console.log(chalk.gray(`  Path: ${install.path}`));
    console.log();

    // Skills list
    console.log(chalk.gray(`  Skills (${install.skills.length}):`));
    for (const skill of install.skills) {
      const icon = install.deprecated ? chalk.yellow('○') : chalk.green('✓');
      console.log(`    ${icon} ${skill}`);
    }
    console.log();

    // Deprecation warning
    if (install.deprecated) {
      console.log(chalk.yellow('  ⚠ Manual installation is deprecated.'));
      console.log(chalk.gray('  Migrate to Plugin Marketplace for automatic updates:'));
      console.log(chalk.cyan('    /plugin marketplace add AsiaOstrich/universal-dev-standards'));
      console.log(chalk.cyan('    /plugin install universal-dev-standards@asia-ostrich'));
      console.log();
    }
  }

  // Summary
  const totalSkills = new Set(installations.flatMap(i => i.skills)).size;
  const hasMarketplace = installations.some(i => i.recommended);

  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.gray(`Total unique skills: ${totalSkills} / ${knownSkills.length}`));

  if (!hasMarketplace && installations.length > 0) {
    console.log();
    console.log(chalk.yellow('Recommendation: Migrate to Plugin Marketplace'));
    console.log(chalk.gray('  Benefits: Automatic updates, better integration'));
  }

  console.log();
}
