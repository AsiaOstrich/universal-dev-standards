import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
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
import { checkForUpdates } from '../utils/npm-registry.js';
import { t } from '../i18n/messages.js';
import {
  installSkillsToMultipleAgents,
  installCommandsToMultipleAgents,
  getInstalledSkillsInfoForAgent,
  getInstalledCommandsForAgent
} from '../utils/skills-installer.js';
import {
  getAgentDisplayName,
  getSkillsDirForAgent,
  getCommandsDirForAgent
} from '../config/ai-agent-paths.js';

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
 * Update CLI to latest version and prompt user to re-run
 * @param {boolean} useBeta - Whether to install beta version
 */
async function updateCliAndExit(useBeta = false) {
  const msg = t().commands.update;
  const spinner = ora(msg.updatingCli).start();

  try {
    // Command is hardcoded - no user input, safe from injection
    const tag = useBeta ? '@beta' : '@latest';
    execSync(`npm install -g universal-dev-standards${tag}`, {
      stdio: 'pipe'
    });

    spinner.succeed(msg.cliUpdated);
    console.log();
    console.log(chalk.green(msg.rerunUpdate));
    console.log();
    process.exit(0);
  } catch (error) {
    spinner.fail(msg.cliUpdateFailed);
    console.log(chalk.yellow(`  ${msg.permissionIssue}`));
    console.log(chalk.gray(`  ${msg.tryManually}`));
    console.log(chalk.white(`    sudo npm install -g universal-dev-standards${useBeta ? '@beta' : ''}`));
    console.log();
    process.exit(1);
  }
}

/**
 * Update command - update standards to latest version
 * @param {Object} options - Command options
 */
export async function updateCommand(options) {
  const projectPath = process.cwd();
  const msg = t().commands.update;
  const common = t().commands.common;

  console.log();
  console.log(chalk.bold(msg.title));
  console.log(chalk.gray('─'.repeat(50)));

  // Check if initialized
  if (!isInitialized(projectPath)) {
    console.log(chalk.red(common.notInitialized));
    console.log(chalk.gray(`  ${common.runInit}`));
    console.log();
    return;
  }

  // Read manifest
  const manifest = readManifest(projectPath);
  if (!manifest) {
    console.log(chalk.red(common.couldNotReadManifest));
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

  // Handle --skills option
  if (options.skills) {
    await updateSkillsOnly(projectPath, manifest);
    return;
  }

  // Handle --commands option
  if (options.commands) {
    await updateCommandsOnly(projectPath, manifest);
    return;
  }

  // Check versions
  const repoInfo = getRepositoryInfo();
  const currentVersion = manifest.upstream.version;
  const latestVersion = repoInfo.standards.version;

  // Check npm registry for newer CLI version (unless --offline)
  if (!options.offline) {
    const npmVersionInfo = await checkForUpdates(latestVersion, {
      checkBeta: options.beta || false
    });

    // If npm has a newer version, ask user what to do
    if (npmVersionInfo.available && !npmVersionInfo.offline) {
      console.log(chalk.cyan('━'.repeat(50)));
      console.log(chalk.cyan.bold(msg.cliUpdateAvailable));
      console.log(chalk.gray(`  ${msg.bundledVersion}: ${latestVersion}`));
      console.log(chalk.gray(`  ${msg.latestOnNpm}: ${npmVersionInfo.latestVersion}`));
      console.log(chalk.cyan('━'.repeat(50)));
      console.log();

      // Ask user what action to take
      if (!options.yes) {
        const { action } = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: msg.whatToDo,
            choices: [
              { name: msg.updateCliFirst, value: 'update-cli' },
              { name: msg.continueWithCurrent, value: 'continue' },
              { name: msg.cancel, value: 'cancel' }
            ]
          }
        ]);

        if (action === 'update-cli') {
          await updateCliAndExit(options.beta || false);
          return; // Won't reach here due to process.exit
        } else if (action === 'cancel') {
          console.log(chalk.gray(msg.operationCancelled));
          console.log();
          return;
        }
        // action === 'continue' → proceed with bundled version
        console.log();
      }
    }
  }

  console.log(chalk.gray(`${msg.currentVersion}: ${currentVersion}`));
  console.log(chalk.gray(`${msg.latestVersion}:  ${latestVersion}`));
  console.log();

  // Compare versions properly using semver
  const versionComparison = compareVersions(currentVersion, latestVersion);

  if (versionComparison >= 0) {
    // Current version is same or newer than registry
    console.log(chalk.green(msg.upToDate));
    if (versionComparison > 0) {
      console.log(chalk.gray(`  ${msg.newerVersion.replace('{version}', currentVersion)}`));
    }
    console.log();
    return;
  }

  console.log(chalk.cyan(msg.updateAvailable.replace('{current}', currentVersion).replace('{latest}', latestVersion)));
  console.log();

  // List files to update
  console.log(chalk.gray(msg.filesToUpdate));
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
        message: msg.confirmUpdate,
        default: true
      }
    ]);

    if (!confirmed) {
      console.log(chalk.yellow(msg.updateCancelled));
      return;
    }
  }

  // Perform update
  console.log();
  const spinner = ora(msg.updatingStandards).start();

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

  spinner.succeed(msg.updatedStandards.replace('{count}', results.updated.length));

  // Update integrations (unless --standards-only)
  if (!options.standardsOnly && manifest.integrations && manifest.integrations.length > 0) {
    const intSpinner = ora(msg.syncingIntegrations).start();

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

    intSpinner.succeed(msg.syncedIntegrations.replace('{count}', results.integrations.length));
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
  console.log(chalk.green(msg.updateSuccess));
  console.log(chalk.gray(`  ${msg.versionUpdated.replace('{current}', currentVersion).replace('{latest}', latestVersion)}`));
  if (results.integrations.length > 0) {
    console.log(chalk.gray(`  ${msg.integrationsSynced.replace('{count}', results.integrations.length)}`));
  }

  if (results.errors.length > 0) {
    console.log();
    console.log(chalk.yellow(msg.errorsOccurred.replace('{count}', results.errors.length)));
    for (const err of results.errors) {
      console.log(chalk.gray(`    ${err}`));
    }
  }

  // Skills update reminder
  if (manifest.skills?.installed) {
    const skillsVersion = repoInfo.skills.version;
    if (manifest.skills.version !== skillsVersion) {
      console.log();
      console.log(chalk.cyan(msg.skillsUpdateAvailable));
      console.log(chalk.gray(`  ${msg.skillsCurrent}: ${manifest.skills.version || 'unknown'}`));
      console.log(chalk.gray(`  ${msg.skillsLatest}: ${skillsVersion}`));
      console.log();

      // Check installation location to provide appropriate update instructions
      const location = manifest.skills.location || 'unknown';

      if (location === 'marketplace') {
        console.log(chalk.gray(`  ${msg.updateViaMarketplace}`));
        console.log(chalk.gray(`    • ${msg.autoUpdate}`));
        console.log(chalk.gray(`    • ${msg.manualUpdate}`));
      } else if (location === 'user') {
        console.log(chalk.yellow(`  ${msg.manualInstallDeprecated}`));
        console.log(chalk.gray(`  ${msg.recommendedMigrate}`));
        console.log(chalk.gray('    /plugin add https://github.com/anthropics/claude-code-plugins/blob/main/skills/universal-dev-standards.md'));
        console.log(chalk.gray(`  ${msg.orUpdateManually}`));
        console.log(chalk.gray('    cd ~/.claude/skills/universal-dev-standards && git pull'));
      } else if (location === 'project') {
        console.log(chalk.yellow(`  ${msg.manualInstallDeprecated}`));
        console.log(chalk.gray(`  ${msg.recommendedMigrate}`));
        console.log(chalk.gray('    /plugin add https://github.com/anthropics/claude-code-plugins/blob/main/skills/universal-dev-standards.md'));
        console.log(chalk.gray(`  ${msg.orUpdateManually}`));
        console.log(chalk.gray('    cd .claude/skills/universal-dev-standards && git pull'));
      } else {
        // Legacy or unknown installation
        console.log(chalk.yellow(`  ${msg.manualInstallDeprecated}`));
        console.log(chalk.gray(`  ${msg.recommendedMigrate}`));
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
  const msg = t().commands.update;

  console.log(chalk.cyan(msg.updatingIntegrationsOnly));
  console.log();

  const aiTools = manifest.aiTools || [];
  if (aiTools.length === 0) {
    console.log(chalk.yellow(msg.noAiToolsConfigured));
    console.log(chalk.gray(`  ${msg.runConfigure}`));
    console.log();
    return;
  }

  const spinner = ora(msg.regeneratingIntegrations).start();

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

  spinner.succeed(msg.regeneratedIntegrations.replace('{count}', results.updated.length));

  // Update manifest
  manifest.version = '3.2.0';
  writeManifest(manifest, projectPath);

  // Summary
  console.log();
  console.log(chalk.green(msg.integrationsSuccess));
  console.log(chalk.gray(`  ${msg.filesUpdatedList.replace('{files}', results.updated.join(', ') || 'none')}`));

  if (results.errors.length > 0) {
    console.log();
    console.log(chalk.yellow(msg.integrationsErrors.replace('{count}', results.errors.length)));
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
  const msg = t().commands.update;

  console.log(chalk.cyan(msg.syncingRefs));
  console.log();

  // Check if integrationConfigs exists
  if (!manifest.integrationConfigs || Object.keys(manifest.integrationConfigs).length === 0) {
    console.log(chalk.yellow(msg.noIntegrationConfigs));
    console.log(chalk.gray(`  ${msg.integrationConfigsRequired}`));
    console.log(chalk.gray(`  ${msg.thisHappensWhen}`));
    console.log(chalk.gray(`    ${msg.oldVersion}`));
    console.log(chalk.gray(`    ${msg.manuallyCopied}`));
    console.log();
    console.log(chalk.gray(`  ${msg.toFixThis}`));
    console.log(chalk.gray(`    ${msg.reinitialize}`));
    console.log(chalk.gray(`    ${msg.manuallyUpdateFiles}`));
    console.log();
    return;
  }

  // Calculate expected categories from current standards
  const expectedCategories = calculateCategoriesFromStandards(manifest.standards);
  console.log(chalk.gray(msg.expectedCategories));
  console.log(chalk.gray(`  ${expectedCategories.join(', ') || '(none)'}`));
  console.log();

  let updatedCount = 0;
  let skippedCount = 0;
  const now = new Date().toISOString();

  for (const [integrationPath, config] of Object.entries(manifest.integrationConfigs)) {
    const fullPath = join(projectPath, integrationPath);

    // Skip if file doesn't exist
    if (!existsSync(fullPath)) {
      console.log(chalk.gray(`  ${msg.skipping.replace('{path}', integrationPath)}`));
      skippedCount++;
      continue;
    }

    const currentCategories = config.categories || [];

    // Check if categories need to be updated
    if (arraysEqual(currentCategories.sort(), expectedCategories.sort())) {
      console.log(chalk.gray(`  ${msg.alreadyInSync.replace('{path}', integrationPath)}`));
      skippedCount++;
      continue;
    }

    // Get tool name for regeneration
    const toolName = config.tool || getToolFromPath(integrationPath);
    if (!toolName) {
      console.log(chalk.yellow(`  ${msg.unknownTool.replace('{path}', integrationPath)}`));
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
      console.log(chalk.green(`  ${msg.updated.replace('{path}', integrationPath)}`));
      console.log(chalk.gray(`    ${msg.categoriesChanged.replace('{old}', currentCategories.join(', ') || '(none)').replace('{new}', expectedCategories.join(', ') || '(none)')}`));

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
      console.log(chalk.red(`  ${msg.failedToUpdate.replace('{path}', integrationPath).replace('{error}', result.error)}`));
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
    console.log(chalk.green(msg.updatedCount.replace('{count}', updatedCount)));
  }
  if (skippedCount > 0) {
    console.log(chalk.gray(`  ${msg.skippedCount.replace('{count}', skippedCount)}`));
  }
  console.log();

  // Exit explicitly
  process.exit(0);
}

/**
 * Update Skills for all AI agents (--skills option)
 * @param {string} projectPath - Project path
 * @param {Object} manifest - Manifest object
 */
async function updateSkillsOnly(projectPath, manifest) {
  const msg = t().commands.update;
  const repoInfo = getRepositoryInfo();
  const latestVersion = repoInfo.skills.version;

  console.log(chalk.cyan(msg.updatingSkillsOnly || 'Updating Skills for all AI Agents...'));
  console.log();

  // Check if any skills are installed
  const skillsInstallations = manifest.skills?.installations || [];

  if (skillsInstallations.length === 0) {
    // Check for legacy installation
    if (manifest.skills?.installed && manifest.skills?.location) {
      // Convert legacy format to new format
      const legacyLocation = manifest.skills.location;
      if (legacyLocation === 'user' || legacyLocation === 'project') {
        skillsInstallations.push({ agent: 'claude-code', level: legacyLocation });
      } else if (legacyLocation === 'marketplace') {
        console.log(chalk.yellow(msg.skillsViaMarketplace || 'Skills installed via Marketplace'));
        console.log(chalk.gray(`  ${msg.updateViaMarketplace || 'Update through Plugin Marketplace'}`));
        console.log();
        process.exit(0);
        return;
      }
    }
  }

  if (skillsInstallations.length === 0) {
    console.log(chalk.yellow(msg.noSkillsInstalled || 'No Skills installations found'));
    console.log(chalk.gray(`  ${msg.runInitToInstall || 'Run uds init to install Skills'}`));
    console.log();
    process.exit(0);
    return;
  }

  // Show current status
  console.log(chalk.gray(msg.currentSkillsStatus || 'Current Skills status:'));
  for (const inst of skillsInstallations) {
    if (inst.level === 'marketplace') {
      console.log(chalk.gray(`  ${getAgentDisplayName(inst.agent)}: Marketplace`));
      continue;
    }

    const info = getInstalledSkillsInfoForAgent(inst.agent, inst.level, projectPath);
    const displayName = getAgentDisplayName(inst.agent);
    const version = info?.version || 'unknown';
    const needsUpdate = version !== latestVersion;

    if (needsUpdate) {
      console.log(chalk.yellow(`  ${displayName} (${inst.level}): v${version} → v${latestVersion}`));
    } else {
      console.log(chalk.green(`  ${displayName} (${inst.level}): v${version} ✓`));
    }
  }
  console.log();

  // Filter out marketplace installations
  const fileBasedInstallations = skillsInstallations.filter(i => i.level !== 'marketplace');

  if (fileBasedInstallations.length === 0) {
    console.log(chalk.green(msg.allSkillsUpToDate || 'All Skills are up to date'));
    console.log();
    process.exit(0);
    return;
  }

  const spinner = ora(msg.installingSkills || 'Installing Skills...').start();

  const result = await installSkillsToMultipleAgents(
    fileBasedInstallations,
    null, // Install all skills
    projectPath
  );

  // Build location summary
  const locations = fileBasedInstallations.map(inst => {
    const displayName = getAgentDisplayName(inst.agent);
    const dir = getSkillsDirForAgent(inst.agent, inst.level, projectPath);
    return `${displayName}: ${dir}`;
  }).join(', ');

  if (result.totalErrors === 0) {
    spinner.succeed((msg.skillsUpdated || 'Updated Skills in {count} locations: {locations}')
      .replace('{count}', result.totalInstalled)
      .replace('{locations}', locations));
  } else {
    spinner.warn((msg.skillsUpdatedWithErrors || 'Updated Skills with {errors} errors')
      .replace('{errors}', result.totalErrors));
  }

  // Update manifest
  manifest.skills.version = latestVersion;
  manifest.skills.installations = skillsInstallations;
  writeManifest(manifest, projectPath);

  console.log();
  process.exit(0);
}

/**
 * Update slash commands for all AI agents (--commands option)
 * @param {string} projectPath - Project path
 * @param {Object} manifest - Manifest object
 */
async function updateCommandsOnly(projectPath, manifest) {
  const msg = t().commands.update;

  console.log(chalk.cyan(msg.updatingCommandsOnly || 'Updating slash commands for all AI Agents...'));
  console.log();

  // Check if any commands are installed
  const commandsInstallations = manifest.commands?.installations || [];

  if (commandsInstallations.length === 0) {
    console.log(chalk.yellow(msg.noCommandsInstalled || 'No slash commands installations found'));
    console.log(chalk.gray(`  ${msg.runInitToInstall || 'Run uds init to install commands'}`));
    console.log();
    process.exit(0);
    return;
  }

  // Show current status
  console.log(chalk.gray(msg.currentCommandsStatus || 'Current commands status:'));
  for (const agent of commandsInstallations) {
    const info = getInstalledCommandsForAgent(agent, projectPath);
    const displayName = getAgentDisplayName(agent);
    const count = info?.count || 0;
    const dir = getCommandsDirForAgent(agent, projectPath);

    console.log(chalk.gray(`  ${displayName}: ${count} commands in ${dir}`));
  }
  console.log();

  const spinner = ora(msg.installingCommands || 'Installing commands...').start();

  const result = await installCommandsToMultipleAgents(
    commandsInstallations,
    null, // Install all commands
    projectPath
  );

  // Build location summary
  const locations = commandsInstallations.map(agent => {
    const displayName = getAgentDisplayName(agent);
    const dir = getCommandsDirForAgent(agent, projectPath);
    return `${displayName}: ${dir}`;
  }).join(', ');

  if (result.totalErrors === 0) {
    spinner.succeed((msg.commandsUpdated || 'Updated {count} commands: {locations}')
      .replace('{count}', result.totalInstalled)
      .replace('{locations}', locations));
  } else {
    spinner.warn((msg.commandsUpdatedWithErrors || 'Updated commands with {errors} errors')
      .replace('{errors}', result.totalErrors));
  }

  // Update manifest
  manifest.commands = manifest.commands || {};
  manifest.commands.installed = true;
  manifest.commands.installations = commandsInstallations;
  writeManifest(manifest, projectPath);

  console.log();
  process.exit(0);
}
