import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { existsSync } from 'fs';
import { join, basename } from 'path';
import { readManifest, writeManifest, copyStandard, isInitialized } from '../utils/copier.js';
import { getRepositoryInfo } from '../utils/registry.js';
import { computeFileHash } from '../utils/hasher.js';
import {
  writeIntegrationFile,
  getToolFilePath
} from '../utils/integration-generator.js';
import {
  calculateCategoriesFromStandards,
  arraysEqual,
  getToolFromPath
} from '../utils/reference-sync.js';

/**
 * Compare two semantic versions
 * @param {string} v1 - First version (e.g., "3.4.0-beta.3")
 * @param {string} v2 - Second version (e.g., "3.3.0")
 * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  // Parse version into parts: major.minor.patch-prerelease
  const parseVersion = (v) => {
    const [main, prerelease] = v.split('-');
    const [major, minor, patch] = main.split('.').map(Number);
    return { major, minor, patch, prerelease: prerelease || null };
  };

  const p1 = parseVersion(v1);
  const p2 = parseVersion(v2);

  // Compare major.minor.patch
  if (p1.major !== p2.major) return p1.major > p2.major ? 1 : -1;
  if (p1.minor !== p2.minor) return p1.minor > p2.minor ? 1 : -1;
  if (p1.patch !== p2.patch) return p1.patch > p2.patch ? 1 : -1;

  // Same major.minor.patch - compare prerelease
  // No prerelease > prerelease (e.g., 3.4.0 > 3.4.0-beta.1)
  if (!p1.prerelease && p2.prerelease) return 1;
  if (p1.prerelease && !p2.prerelease) return -1;
  if (!p1.prerelease && !p2.prerelease) return 0;

  // Both have prerelease - compare them
  // Order: alpha < beta < rc
  const prereleaseOrder = { alpha: 1, beta: 2, rc: 3 };
  const parsePrerelease = (pr) => {
    const match = pr.match(/^(alpha|beta|rc)\.?(\d+)?$/);
    if (match) {
      return { type: match[1], num: parseInt(match[2] || '0', 10) };
    }
    return { type: pr, num: 0 };
  };

  const pr1 = parsePrerelease(p1.prerelease);
  const pr2 = parsePrerelease(p2.prerelease);

  const order1 = prereleaseOrder[pr1.type] || 0;
  const order2 = prereleaseOrder[pr2.type] || 0;

  if (order1 !== order2) return order1 > order2 ? 1 : -1;
  if (pr1.num !== pr2.num) return pr1.num > pr2.num ? 1 : -1;

  return 0;
}

/**
 * Update command - update standards to latest version
 * @param {Object} options - Command options
 */
export async function updateCommand(options) {
  const projectPath = process.cwd();

  console.log();
  console.log(chalk.bold('Universal Documentation Standards - Update'));
  console.log(chalk.gray('─'.repeat(50)));

  // Check if initialized
  if (!isInitialized(projectPath)) {
    console.log(chalk.red('✗ Standards not initialized in this project.'));
    console.log(chalk.gray('  Run `uds init` to initialize first.'));
    console.log();
    return;
  }

  // Read manifest
  const manifest = readManifest(projectPath);
  if (!manifest) {
    console.log(chalk.red('✗ Could not read manifest file.'));
    console.log();
    return;
  }

  // Handle --sync-refs option
  if (options.syncRefs) {
    await syncIntegrationReferences(projectPath, manifest);
    return;
  }

  // Handle --integrations-only option
  if (options.integrationsOnly) {
    await updateIntegrationsOnly(projectPath, manifest);
    return;
  }

  // Check versions
  const repoInfo = getRepositoryInfo();
  const currentVersion = manifest.upstream.version;
  const latestVersion = repoInfo.standards.version;

  console.log(chalk.gray(`Current version: ${currentVersion}`));
  console.log(chalk.gray(`Latest version:  ${latestVersion}`));
  console.log();

  // Compare versions properly using semver
  const versionComparison = compareVersions(currentVersion, latestVersion);

  if (versionComparison >= 0) {
    // Current version is same or newer than registry
    console.log(chalk.green('✓ Standards are up to date.'));
    if (versionComparison > 0) {
      console.log(chalk.gray(`  (You have a newer version than the registry: ${currentVersion})`));
    }
    console.log();
    return;
  }

  console.log(chalk.cyan(`Update available: ${currentVersion} → ${latestVersion}`));
  console.log();

  // List files to update
  console.log(chalk.gray('Files to update:'));
  for (const std of manifest.standards) {
    console.log(chalk.gray(`  .standards/${std.split('/').pop()}`));
  }
  for (const ext of manifest.extensions) {
    console.log(chalk.gray(`  .standards/${ext.split('/').pop()}`));
  }
  if (!options.standardsOnly) {
    for (const int of manifest.integrations) {
      console.log(chalk.gray(`  ${int}`));
    }
  }
  console.log();

  // Confirm
  if (!options.yes) {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: 'Proceed with update? This will overwrite existing files.',
        default: true
      }
    ]);

    if (!confirmed) {
      console.log(chalk.yellow('Update cancelled.'));
      return;
    }
  }

  // Perform update
  console.log();
  const spinner = ora('Updating standards...').start();

  const results = {
    updated: [],
    integrations: [],
    errors: []
  };

  // Update standards
  for (const std of manifest.standards) {
    const result = await copyStandard(std, '.standards', projectPath);
    if (result.success) {
      results.updated.push(std);
    } else {
      results.errors.push(`${std}: ${result.error}`);
    }
  }

  // Update extensions
  for (const ext of manifest.extensions) {
    const result = await copyStandard(ext, '.standards', projectPath);
    if (result.success) {
      results.updated.push(ext);
    } else {
      results.errors.push(`${ext}: ${result.error}`);
    }
  }

  spinner.succeed(`Updated ${results.updated.length} standard files`);

  // Update integrations (unless --standards-only)
  if (!options.standardsOnly && manifest.integrations && manifest.integrations.length > 0) {
    const intSpinner = ora('Syncing integration files...').start();

    // Build installed standards list
    const installedStandardsList = manifest.standards?.map(s => basename(s)) || [];

    // Determine language setting
    let commonLanguage = 'en';
    if (manifest.options?.commit_language === 'bilingual') {
      commonLanguage = 'bilingual';
    } else if (manifest.options?.commit_language === 'traditional-chinese') {
      commonLanguage = 'zh-tw';
    }

    // Track generated files to handle AGENTS.md sharing
    const generatedFiles = new Set();
    const aiTools = manifest.aiTools || [];

    for (const tool of aiTools) {
      const targetFile = getToolFilePath(tool);
      if (generatedFiles.has(targetFile)) {
        continue; // Skip if already generated (AGENTS.md sharing)
      }

      const toolConfig = {
        tool,
        categories: ['anti-hallucination', 'commit-standards', 'code-review'],
        language: commonLanguage,
        installedStandards: installedStandardsList,
        contentMode: manifest.contentMode || 'minimal',
        level: manifest.level || 2
      };

      const result = writeIntegrationFile(tool, toolConfig, projectPath);
      if (result.success) {
        results.integrations.push(result.path);
        generatedFiles.add(targetFile);
      } else {
        results.errors.push(`${tool}: ${result.error}`);
      }
    }

    intSpinner.succeed(`Synced ${results.integrations.length} integration files`);
  }

  // Recompute file hashes for updated files
  const now = new Date().toISOString();
  if (!manifest.fileHashes) {
    manifest.fileHashes = {};
  }

  // Update hashes for standards
  for (const std of manifest.standards) {
    const fileName = basename(std);
    const relativePath = std.includes('options/')
      ? join('.standards', 'options', fileName)
      : join('.standards', fileName);
    const fullPath = join(projectPath, relativePath);
    const hashInfo = computeFileHash(fullPath);
    if (hashInfo) {
      manifest.fileHashes[relativePath] = { ...hashInfo, installedAt: now };
    }
  }

  // Update hashes for extensions
  for (const ext of manifest.extensions) {
    const fileName = basename(ext);
    const relativePath = join('.standards', fileName);
    const fullPath = join(projectPath, relativePath);
    const hashInfo = computeFileHash(fullPath);
    if (hashInfo) {
      manifest.fileHashes[relativePath] = { ...hashInfo, installedAt: now };
    }
  }

  // Update hashes for integrations
  for (const int of results.integrations) {
    const fullPath = join(projectPath, int);
    const hashInfo = computeFileHash(fullPath);
    if (hashInfo) {
      manifest.fileHashes[int] = { ...hashInfo, installedAt: now };
    }
  }

  // Update manifest
  manifest.version = '3.2.0';
  manifest.upstream.version = latestVersion;
  manifest.upstream.installed = new Date().toISOString().split('T')[0];
  writeManifest(manifest, projectPath);

  // Summary
  console.log();
  console.log(chalk.green('✓ Standards updated successfully!'));
  console.log(chalk.gray(`  Version: ${currentVersion} → ${latestVersion}`));
  if (results.integrations.length > 0) {
    console.log(chalk.gray(`  Integration files synced: ${results.integrations.length}`));
  }

  if (results.errors.length > 0) {
    console.log();
    console.log(chalk.yellow(`⚠ ${results.errors.length} file(s) could not be updated:`));
    for (const err of results.errors) {
      console.log(chalk.gray(`    ${err}`));
    }
  }

  // Skills update reminder
  if (manifest.skills?.installed) {
    const skillsVersion = repoInfo.skills.version;
    if (manifest.skills.version !== skillsVersion) {
      console.log();
      console.log(chalk.cyan('Skills update available:'));
      console.log(chalk.gray(`  Current: ${manifest.skills.version || 'unknown'}`));
      console.log(chalk.gray(`  Latest:  ${skillsVersion}`));
      console.log();

      // Check installation location to provide appropriate update instructions
      const location = manifest.skills.location || 'unknown';

      if (location === 'marketplace') {
        console.log(chalk.gray('  Update via Plugin Marketplace:'));
        console.log(chalk.gray('    • Auto-update: Restart Claude Code (updates on startup)'));
        console.log(chalk.gray('    • Manual: Run /plugin marketplace update anthropic-agent-skills'));
      } else if (location === 'user') {
        console.log(chalk.yellow('  ⚠️  Manual installation is deprecated'));
        console.log(chalk.gray('  Recommended: Migrate to Plugin Marketplace'));
        console.log(chalk.gray('    /plugin add https://github.com/anthropics/claude-code-plugins/blob/main/skills/universal-dev-standards.md'));
        console.log(chalk.gray('  Or update manually:'));
        console.log(chalk.gray('    cd ~/.claude/skills/universal-dev-standards && git pull'));
      } else if (location === 'project') {
        console.log(chalk.yellow('  ⚠️  Manual installation is deprecated'));
        console.log(chalk.gray('  Recommended: Migrate to Plugin Marketplace'));
        console.log(chalk.gray('    /plugin add https://github.com/anthropics/claude-code-plugins/blob/main/skills/universal-dev-standards.md'));
        console.log(chalk.gray('  Or update manually:'));
        console.log(chalk.gray('    cd .claude/skills/universal-dev-standards && git pull'));
      } else {
        // Legacy or unknown installation
        console.log(chalk.yellow('  ⚠️  Manual installation is deprecated'));
        console.log(chalk.gray('  Recommended: Migrate to Plugin Marketplace'));
        console.log(chalk.gray('    /plugin add https://github.com/anthropics/claude-code-plugins/blob/main/skills/universal-dev-standards.md'));
      }
    }
  }

  console.log();

  // Exit explicitly to prevent hanging due to inquirer's readline interface
  process.exit(0);
}

/**
 * Update integration files only (without updating standards)
 * @param {string} projectPath - Project path
 * @param {Object} manifest - Manifest object
 */
async function updateIntegrationsOnly(projectPath, manifest) {
  console.log(chalk.cyan('Updating integration files only...'));
  console.log();

  const aiTools = manifest.aiTools || [];
  if (aiTools.length === 0) {
    console.log(chalk.yellow('⚠ No AI tools configured in manifest.'));
    console.log(chalk.gray('  Run `uds configure` to add AI tools.'));
    console.log();
    return;
  }

  const spinner = ora('Regenerating integration files...').start();

  // Build installed standards list
  const installedStandardsList = manifest.standards?.map(s => basename(s)) || [];

  // Determine language setting
  let commonLanguage = 'en';
  if (manifest.options?.commit_language === 'bilingual') {
    commonLanguage = 'bilingual';
  } else if (manifest.options?.commit_language === 'traditional-chinese') {
    commonLanguage = 'zh-tw';
  }

  const results = {
    updated: [],
    errors: []
  };

  // Track generated files to handle AGENTS.md sharing
  const generatedFiles = new Set();
  const now = new Date().toISOString();

  for (const tool of aiTools) {
    const targetFile = getToolFilePath(tool);
    if (generatedFiles.has(targetFile)) {
      continue; // Skip if already generated (AGENTS.md sharing)
    }

    const toolConfig = {
      tool,
      categories: ['anti-hallucination', 'commit-standards', 'code-review'],
      language: commonLanguage,
      installedStandards: installedStandardsList,
      contentMode: manifest.contentMode || 'minimal',
      level: manifest.level || 2
    };

    const result = writeIntegrationFile(tool, toolConfig, projectPath);
    if (result.success) {
      results.updated.push(result.path);
      generatedFiles.add(targetFile);

      // Update file hash
      const fullPath = join(projectPath, result.path);
      const hashInfo = computeFileHash(fullPath);
      if (hashInfo) {
        if (!manifest.fileHashes) {
          manifest.fileHashes = {};
        }
        manifest.fileHashes[result.path] = { ...hashInfo, installedAt: now };
      }
    } else {
      results.errors.push(`${tool}: ${result.error}`);
    }
  }

  spinner.succeed(`Regenerated ${results.updated.length} integration files`);

  // Update manifest
  manifest.version = '3.2.0';
  writeManifest(manifest, projectPath);

  // Summary
  console.log();
  console.log(chalk.green('✓ Integration files updated successfully!'));
  console.log(chalk.gray(`  Files updated: ${results.updated.join(', ') || 'none'}`));

  if (results.errors.length > 0) {
    console.log();
    console.log(chalk.yellow(`⚠ ${results.errors.length} error(s):`));
    for (const err of results.errors) {
      console.log(chalk.gray(`    ${err}`));
    }
  }

  console.log();
  process.exit(0);
}

/**
 * Sync integration file references based on manifest standards
 * @param {string} projectPath - Project path
 * @param {Object} manifest - Manifest object
 */
async function syncIntegrationReferences(projectPath, manifest) {
  console.log(chalk.cyan('Syncing integration references...'));
  console.log();

  // Check if integrationConfigs exists
  if (!manifest.integrationConfigs || Object.keys(manifest.integrationConfigs).length === 0) {
    console.log(chalk.yellow('⚠ No integration configurations found in manifest.'));
    console.log(chalk.gray('  Integration configs are required for reference sync.'));
    console.log(chalk.gray('  This happens when:'));
    console.log(chalk.gray('    - The project was initialized with an older version of UDS'));
    console.log(chalk.gray('    - Integration files were manually copied, not generated'));
    console.log();
    console.log(chalk.gray('  To fix this, you can either:'));
    console.log(chalk.gray('    1. Re-initialize the project: uds init (delete .standards/ first)'));
    console.log(chalk.gray('    2. Manually update the integration files'));
    console.log();
    return;
  }

  // Calculate expected categories from current standards
  const expectedCategories = calculateCategoriesFromStandards(manifest.standards);
  console.log(chalk.gray('Expected categories from manifest.standards:'));
  console.log(chalk.gray(`  ${expectedCategories.join(', ') || '(none)'}`));
  console.log();

  let updatedCount = 0;
  let skippedCount = 0;
  const now = new Date().toISOString();

  for (const [integrationPath, config] of Object.entries(manifest.integrationConfigs)) {
    const fullPath = join(projectPath, integrationPath);

    // Skip if file doesn't exist
    if (!existsSync(fullPath)) {
      console.log(chalk.gray(`  Skipping ${integrationPath}: file not found`));
      skippedCount++;
      continue;
    }

    const currentCategories = config.categories || [];

    // Check if categories need to be updated
    if (arraysEqual(currentCategories.sort(), expectedCategories.sort())) {
      console.log(chalk.gray(`  ${integrationPath}: already in sync`));
      skippedCount++;
      continue;
    }

    // Get tool name for regeneration
    const toolName = config.tool || getToolFromPath(integrationPath);
    if (!toolName) {
      console.log(chalk.yellow(`  ⚠ ${integrationPath}: unknown tool, skipping`));
      skippedCount++;
      continue;
    }

    // Regenerate the integration file with updated categories
    const newConfig = {
      ...config,
      tool: toolName,
      categories: expectedCategories
    };

    const result = writeIntegrationFile(toolName, newConfig, projectPath);

    if (result.success) {
      console.log(chalk.green(`  ✓ Updated ${integrationPath}`));
      console.log(chalk.gray(`    Categories: ${currentCategories.join(', ') || '(none)'} → ${expectedCategories.join(', ') || '(none)'}`));

      // Update manifest config
      manifest.integrationConfigs[integrationPath] = {
        ...newConfig,
        generatedAt: now
      };

      // Update file hash
      const hashInfo = computeFileHash(fullPath);
      if (hashInfo) {
        if (!manifest.fileHashes) {
          manifest.fileHashes = {};
        }
        manifest.fileHashes[integrationPath] = { ...hashInfo, installedAt: now };
      }

      updatedCount++;
    } else {
      console.log(chalk.red(`  ✗ Failed to update ${integrationPath}: ${result.error}`));
    }
  }

  // Update manifest version and save
  if (updatedCount > 0) {
    manifest.version = '3.2.0';
    writeManifest(manifest, projectPath);
  }

  // Summary
  console.log();
  if (updatedCount > 0) {
    console.log(chalk.green(`✓ Updated ${updatedCount} integration file(s)`));
  }
  if (skippedCount > 0) {
    console.log(chalk.gray(`  Skipped ${skippedCount} file(s) (already in sync or not found)`));
  }
  console.log();

  // Exit explicitly
  process.exit(0);
}
