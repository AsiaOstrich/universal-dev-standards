import chalk from 'chalk';
import inquirer from 'inquirer';
import { readManifest, manifestExists, writeManifest } from '../core/manifest.js';
import { t } from '../i18n/messages.js';
import { uninstallStandards } from '../uninstallers/standards-uninstaller.js';
import { uninstallHook } from '../uninstallers/hook-uninstaller.js';
import { uninstallIntegrations } from '../uninstallers/integration-uninstaller.js';
import { uninstallSkills } from '../uninstallers/skills-uninstaller.js';

/**
 * Categories available for uninstallation
 */
const CATEGORIES = ['hooks', 'skills', 'integrations', 'standards'];

/**
 * Uninstall command - remove UDS standards, integrations, skills, and hooks
 * @param {Object} options - Command options
 */
export async function uninstallCommand(options) {
  const projectPath = process.cwd();
  const msg = t().commands.uninstall;
  const common = t().commands.common;

  console.log();
  console.log(chalk.bold(msg.title));
  console.log(chalk.gray('─'.repeat(50)));

  // Check if UDS is initialized
  if (!manifestExists(projectPath)) {
    console.log(chalk.yellow(common.notInitialized));
    console.log(chalk.gray(`  ${common.runInit}`));
    return;
  }

  const manifest = readManifest(projectPath);
  if (!manifest) {
    console.log(chalk.red(common.couldNotReadManifest));
    return;
  }

  // Determine which categories to uninstall
  let selectedCategories;
  if (options.all) {
    selectedCategories = [...CATEGORIES];
  } else if (options.standardsOnly) {
    selectedCategories = ['standards'];
  } else if (options.skillsOnly) {
    selectedCategories = ['skills'];
  } else if (options.integrationsOnly) {
    selectedCategories = ['integrations'];
  } else if (options.yes) {
    // --yes without specific flag → all categories
    selectedCategories = [...CATEGORIES];
  } else {
    // Interactive: checkbox selection
    const { categories } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'categories',
      message: msg.selectCategories,
      choices: [
        { name: `${msg.categoryHooks} (.husky/pre-commit)`, value: 'hooks', checked: true },
        { name: `${msg.categorySkills} (skills, commands)`, value: 'skills', checked: true },
        { name: `${msg.categoryIntegrations} (CLAUDE.md, .cursorrules, ...)`, value: 'integrations', checked: true },
        { name: `${msg.categoryStandards} (.standards/)`, value: 'standards', checked: true }
      ]
    }]);

    if (categories.length === 0) {
      console.log(chalk.yellow(msg.nothingSelected));
      return;
    }
    selectedCategories = categories;
  }

  const includeUserLevel = options.all || false;
  const dryRun = options.dryRun || false;

  // Gather preview: run all uninstallers in dry-run mode to build summary
  const preview = await gatherPreview(projectPath, manifest, selectedCategories, includeUserLevel);

  // Show preview summary
  console.log();
  if (dryRun) {
    console.log(chalk.cyan(`  ${msg.dryRunMode}`));
    console.log();
  }

  displayPreview(preview, msg);

  // Confirm (unless --yes or --dry-run)
  if (!dryRun && !options.yes) {
    const { confirmed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmed',
      message: msg.confirmUninstall,
      default: false
    }]);

    if (!confirmed) {
      console.log(chalk.yellow(common.cancelled));
      return;
    }
  }

  if (dryRun) {
    console.log();
    console.log(chalk.cyan(msg.dryRunHint));
    return;
  }

  // Execute uninstallation in order: hooks → skills → integrations → standards
  console.log();
  const results = await executeUninstall(
    projectPath, manifest, selectedCategories,
    { includeUserLevel, interactive: !options.yes }
  );

  // Update or remove manifest
  updateManifestAfterUninstall(projectPath, manifest, selectedCategories);

  // Display results
  displayResults(results, msg);
}

/**
 * Gather preview of what will be removed (dry-run all uninstallers)
 */
async function gatherPreview(projectPath, manifest, categories, includeUserLevel) {
  const preview = {};

  if (categories.includes('hooks')) {
    preview.hooks = uninstallHook(projectPath, { dryRun: true });
  }
  if (categories.includes('skills')) {
    preview.skills = uninstallSkills(projectPath, manifest, { dryRun: true, includeUserLevel });
  }
  if (categories.includes('integrations')) {
    preview.integrations = await uninstallIntegrations(projectPath, manifest, { dryRun: true });
  }
  if (categories.includes('standards')) {
    preview.standards = uninstallStandards(projectPath, { dryRun: true });
  }

  return preview;
}

/**
 * Execute actual uninstallation
 */
async function executeUninstall(projectPath, manifest, categories, options) {
  const { includeUserLevel, interactive } = options;
  const results = {};

  if (categories.includes('hooks')) {
    results.hooks = uninstallHook(projectPath);
  }
  if (categories.includes('skills')) {
    results.skills = uninstallSkills(projectPath, manifest, { includeUserLevel });
  }
  if (categories.includes('integrations')) {
    const promptFn = interactive ? createIntegrationPromptFn() : null;
    results.integrations = await uninstallIntegrations(projectPath, manifest, {
      interactive,
      promptFn
    });
  }
  if (categories.includes('standards')) {
    results.standards = uninstallStandards(projectPath);
  }

  return results;
}

/**
 * Create interactive prompt function for integration files
 */
function createIntegrationPromptFn() {
  const msg = t().commands.uninstall;
  return async (fileName) => {
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: `${fileName}: ${msg.integrationAction}`,
      choices: [
        { name: msg.removeBlockOnly, value: 'remove-block' },
        { name: msg.deleteEntireFile, value: 'delete-file' },
        { name: msg.skipFile, value: 'skip' }
      ]
    }]);
    return action;
  };
}

/**
 * Update or remove manifest after uninstall
 */
function updateManifestAfterUninstall(projectPath, manifest, categories) {
  const removedStandards = categories.includes('standards');

  if (removedStandards) {
    // .standards/ is gone, manifest is already deleted with it
    return;
  }

  // Partial uninstall: update manifest to reflect removed items
  const updated = { ...manifest };

  if (categories.includes('skills')) {
    updated.skills = {
      installed: false,
      location: manifest.skills?.location || 'marketplace',
      names: [],
      version: null,
      installations: []
    };
    updated.commands = {
      installed: false,
      names: [],
      version: null,
      installations: []
    };
    updated.skillHashes = {};
    updated.commandHashes = {};
  }

  if (categories.includes('integrations')) {
    updated.integrations = [];
    updated.integrationConfigs = {};
    updated.integrationBlockHashes = {};
  }

  writeManifest(updated, projectPath);
}

/**
 * Display preview of what will be removed/skipped
 */
function displayPreview(preview, msg) {
  console.log(chalk.bold(msg.previewTitle));
  console.log();

  for (const [, result] of Object.entries(preview)) {
    for (const item of result.removed || []) {
      console.log(chalk.green(`  ✓ ${msg.willRemove}: ${item}`));
    }
    for (const item of result.skipped || []) {
      console.log(chalk.yellow(`  ⚠ ${msg.willSkip}: ${item}`));
    }
    if (result.marketplaceWarnings) {
      for (const warn of result.marketplaceWarnings) {
        console.log(chalk.yellow(`  ⚠ ${warn}`));
      }
    }
  }
}

/**
 * Display final results
 */
function displayResults(results, msg) {
  let totalRemoved = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const [, result] of Object.entries(results)) {
    for (const item of result.removed || []) {
      console.log(chalk.green(`  ✓ ${item}`));
      totalRemoved++;
    }
    for (const item of result.skipped || []) {
      console.log(chalk.yellow(`  ⚠ ${item}`));
      totalSkipped++;
    }
    for (const item of result.errors || []) {
      console.log(chalk.red(`  ✗ ${item}`));
      totalErrors++;
    }
    if (result.marketplaceWarnings) {
      for (const warn of result.marketplaceWarnings) {
        console.log(chalk.yellow(`  ⚠ ${warn}`));
      }
    }
  }

  console.log();
  if (totalErrors === 0) {
    console.log(chalk.green(msg.uninstallSuccess));
  } else {
    console.log(chalk.yellow(msg.uninstallPartial));
  }
  console.log(chalk.gray(`  ${msg.removed}: ${totalRemoved}  ${msg.skippedLabel}: ${totalSkipped}  ${msg.errorsLabel}: ${totalErrors}`));
}
