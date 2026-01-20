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
import { t, setLanguage, isLanguageExplicitlySet } from '../i18n/messages.js';
import {
  installSkillsToMultipleAgents,
  installCommandsToMultipleAgents,
  getInstalledSkillsInfoForAgent,
  getInstalledCommandsForAgent
} from '../utils/skills-installer.js';
import {
  getAgentDisplayName,
  getAgentConfig,
  getSkillsDirForAgent,
  getCommandsDirForAgent
} from '../config/ai-agent-paths.js';
import { getMarketplaceSkillsInfo } from '../utils/github.js';
import {
  promptSkillsInstallLocation,
  promptCommandsInstallation
} from '../prompts/init.js';

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

  // Check if initialized first (use default language)
  if (!isInitialized(projectPath)) {
    const common = t().commands.common;
    console.log(chalk.red(common.notInitialized));
    console.log(chalk.gray(`  ${common.runInit}`));
    console.log();
    return;
  }

  // Read manifest
  const manifest = readManifest(projectPath);
  if (!manifest) {
    const common = t().commands.common;
    console.log(chalk.red(common.couldNotReadManifest));
    console.log();
    return;
  }

  // Set UI language based on commit_language setting
  // Only override if user didn't explicitly set --ui-lang flag
  if (!isLanguageExplicitlySet()) {
    const langMap = {
      'traditional-chinese': 'zh-tw',
      'simplified-chinese': 'zh-cn',
      english: 'en',
      bilingual: 'en'
    };
    const uiLang = langMap[manifest.options?.commit_language] || 'en';
    setLanguage(uiLang);
  }

  // Now get localized messages
  const msg = t().commands.update;

  console.log();
  console.log(chalk.bold(msg.title));
  console.log(chalk.gray('─'.repeat(50)));

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
        level: manifest.level || 2,
        // Pass commit_language for dynamic commit standards generation
        commitLanguage: manifest.options?.commit_language || 'english'
      };

      const result = writeIntegrationFile(tool, toolConfig, projectPath);
      if (result.success) {
        results.integrations.push(result.path);
        generatedFiles.add(targetFile);

        // Track integration block hash for UDS content integrity
        if (result.blockHashInfo) {
          if (!manifest.integrationBlockHashes) manifest.integrationBlockHashes = {};
          manifest.integrationBlockHashes[result.path] = {
            ...result.blockHashInfo,
            installedAt: new Date().toISOString()
          };
        }
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
  manifest.version = '3.3.0';
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

  // Check for new features (Skills/Commands) not yet installed or outdated
  if (!options.standardsOnly) {
    const latestSkillsVersion = repoInfo.skills.version;
    const { missingSkills, outdatedSkills, missingCommands } = checkNewFeatures(projectPath, manifest, latestSkillsVersion, options.debug);

    if (missingSkills.length > 0 || outdatedSkills.length > 0 || missingCommands.length > 0) {
      if (!options.yes) {
        // Interactive mode: prompt user to install/update
        const { installSkills, updateSkills, installCommands, declinedSkills, declinedCommands } = await promptNewFeatureInstallation(
          missingSkills,
          outdatedSkills,
          missingCommands
        );

        // Install Skills if user agreed
        if (installSkills.length > 0) {
          const skillSpinner = ora(msg.installingNewSkills || 'Installing Skills...').start();
          const skillResult = await installSkillsToMultipleAgents(installSkills, null, projectPath);

          // Update manifest
          if (!manifest.skills) manifest.skills = {};
          manifest.skills.installed = true;
          manifest.skills.version = repoInfo.skills.version;
          manifest.skills.installations = [
            ...(manifest.skills.installations || []),
            ...installSkills
          ];

          // Update skill hashes for integrity tracking
          if (skillResult.allFileHashes) {
            if (!manifest.skillHashes) manifest.skillHashes = {};
            Object.assign(manifest.skillHashes, skillResult.allFileHashes);
          }

          if (skillResult.totalErrors === 0) {
            skillSpinner.succeed((msg.newSkillsInstalled || 'Installed Skills for {count} AI tools')
              .replace('{count}', installSkills.length));
          } else {
            skillSpinner.warn((msg.newSkillsInstalledWithErrors || 'Installed Skills with {errors} errors')
              .replace('{errors}', skillResult.totalErrors));
          }
        }

        // Update outdated Skills if user agreed
        if (updateSkills.length > 0) {
          const updateSpinner = ora(msg.updatingSkills || 'Updating Skills...').start();
          const updateResult = await installSkillsToMultipleAgents(updateSkills, null, projectPath);

          // Update manifest version
          if (!manifest.skills) manifest.skills = {};
          manifest.skills.version = repoInfo.skills.version;

          // Update skill hashes for integrity tracking
          if (updateResult.allFileHashes) {
            if (!manifest.skillHashes) manifest.skillHashes = {};
            Object.assign(manifest.skillHashes, updateResult.allFileHashes);
          }

          if (updateResult.totalErrors === 0) {
            updateSpinner.succeed((msg.skillsUpdated || 'Updated Skills for {count} AI tools')
              .replace('{count}', updateSkills.length));
          } else {
            updateSpinner.warn((msg.skillsUpdatedWithErrors || 'Updated Skills with {errors} errors')
              .replace('{errors}', updateResult.totalErrors));
          }
        }

        // Install Commands if user agreed
        if (installCommands.length > 0) {
          const cmdSpinner = ora(msg.installingNewCommands || 'Installing commands...').start();
          const cmdResult = await installCommandsToMultipleAgents(installCommands, null, projectPath);

          // Update manifest
          if (!manifest.commands) manifest.commands = {};
          manifest.commands.installed = true;
          manifest.commands.installations = [
            ...(manifest.commands.installations || []),
            ...installCommands
          ];

          // Update command hashes for integrity tracking
          if (cmdResult.allFileHashes) {
            if (!manifest.commandHashes) manifest.commandHashes = {};
            Object.assign(manifest.commandHashes, cmdResult.allFileHashes);
          }

          if (cmdResult.totalErrors === 0) {
            cmdSpinner.succeed((msg.newCommandsInstalled || 'Installed commands for {count} AI tools')
              .replace('{count}', installCommands.length));
          } else {
            cmdSpinner.warn((msg.newCommandsInstalledWithErrors || 'Installed commands with {errors} errors')
              .replace('{errors}', cmdResult.totalErrors));
          }
        }

        // Update declined features in manifest
        if (declinedSkills.length > 0 || declinedCommands.length > 0) {
          if (!manifest.declinedFeatures) manifest.declinedFeatures = {};

          // Merge with existing declined items (avoid duplicates)
          if (declinedSkills.length > 0) {
            const existing = manifest.declinedFeatures.skills || [];
            manifest.declinedFeatures.skills = [...new Set([...existing, ...declinedSkills])];
          }

          if (declinedCommands.length > 0) {
            const existing = manifest.declinedFeatures.commands || [];
            manifest.declinedFeatures.commands = [...new Set([...existing, ...declinedCommands])];
          }
        }

        // Remove from declined list if user decided to install this time
        if (installSkills.length > 0 && manifest.declinedFeatures?.skills) {
          const installedAgents = installSkills.map(s => s.agent);
          manifest.declinedFeatures.skills = manifest.declinedFeatures.skills.filter(
            agent => !installedAgents.includes(agent)
          );
        }
        if (installCommands.length > 0 && manifest.declinedFeatures?.commands) {
          manifest.declinedFeatures.commands = manifest.declinedFeatures.commands.filter(
            agent => !installCommands.includes(agent)
          );
        }

        // Write updated manifest if anything was installed, updated, or declined
        const hasChanges = installSkills.length > 0 || updateSkills.length > 0 ||
          installCommands.length > 0 || declinedSkills.length > 0 || declinedCommands.length > 0;
        if (hasChanges) {
          writeManifest(manifest, projectPath);
        }
      } else {
        // --yes mode: show hint but don't auto-install (conservative behavior)
        console.log();
        console.log(chalk.cyan(msg.newFeaturesAvailableHint || 'Note: New features available for your AI tools'));
        if (missingSkills.length > 0) {
          const toolNames = missingSkills.map(s => s.displayName).join(', ');
          console.log(chalk.gray(`  • Skills (${toolNames}): run "uds update --skills" or "uds init" to install`));
        }
        if (outdatedSkills.length > 0) {
          const toolNames = outdatedSkills.map(s => `${s.displayName} (${s.currentVersion} → ${s.latestVersion})`).join(', ');
          console.log(chalk.gray(`  • Skills update (${toolNames}): run "uds update" interactively to update`));
        }
        if (missingCommands.length > 0) {
          const toolNames = missingCommands.map(c => c.displayName).join(', ');
          console.log(chalk.gray(`  • Commands (${toolNames}): run "uds update --commands" or "uds init" to install`));
        }
      }
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
 * Regenerate integration files for all configured AI tools
 * Reusable core logic that can be called from both updateIntegrationsOnly and configureCommand
 * @param {string} projectPath - Project path
 * @param {Object} manifest - Manifest object (will be mutated with updated hashes)
 * @returns {{success: boolean, updated: string[], errors: string[]}}
 */
export function regenerateIntegrations(projectPath, manifest) {
  const aiTools = manifest.aiTools || [];

  if (aiTools.length === 0) {
    return { success: true, updated: [], errors: [] };
  }

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
      level: manifest.level || 2,
      // Pass commit_language for dynamic commit standards generation
      commitLanguage: manifest.options?.commit_language || 'english'
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

      // Track integration block hash for UDS content integrity
      if (result.blockHashInfo) {
        if (!manifest.integrationBlockHashes) manifest.integrationBlockHashes = {};
        manifest.integrationBlockHashes[result.path] = {
          ...result.blockHashInfo,
          installedAt: now
        };
      }
    } else {
      results.errors.push(`${tool}: ${result.error}`);
    }
  }

  return {
    success: results.errors.length === 0,
    updated: results.updated,
    errors: results.errors
  };
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

  // Use reusable regeneration function
  const results = regenerateIntegrations(projectPath, manifest);

  spinner.succeed(msg.regeneratedIntegrations.replace('{count}', results.updated.length));

  // Update manifest
  manifest.version = '3.3.0';
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
      categories: expectedCategories,
      // Pass commit_language for dynamic commit standards generation
      commitLanguage: manifest.options?.commit_language || config.commitLanguage || 'english'
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

      // Track integration block hash for UDS content integrity
      if (result.blockHashInfo) {
        if (!manifest.integrationBlockHashes) manifest.integrationBlockHashes = {};
        manifest.integrationBlockHashes[integrationPath] = {
          ...result.blockHashInfo,
          installedAt: now
        };
      }

      updatedCount++;
    } else {
      console.log(chalk.red(`  ${msg.failedToUpdate.replace('{path}', integrationPath).replace('{error}', result.error)}`));
    }
  }

  // Update manifest version and save
  if (updatedCount > 0) {
    manifest.version = '3.3.0';
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

  // Update skill hashes for integrity tracking
  if (result.allFileHashes) {
    if (!manifest.skillHashes) manifest.skillHashes = {};
    Object.assign(manifest.skillHashes, result.allFileHashes);
  }

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
  let commandsInstallations = manifest.commands?.installations || [];

  // Check for legacy installation (backward compatibility)
  if (commandsInstallations.length === 0) {
    if (manifest.commands?.installed && manifest.aiTools?.length > 0) {
      // Convert legacy format: infer from aiTools that support commands
      for (const tool of manifest.aiTools) {
        const config = getAgentConfig(tool);
        if (config?.commands !== null) {
          // Legacy installations were always project level
          commandsInstallations.push({ agent: tool, level: 'project' });
        }
      }
    }
  }

  if (commandsInstallations.length === 0) {
    console.log(chalk.yellow(msg.noCommandsInstalled || 'No slash commands installations found'));
    console.log(chalk.gray(`  ${msg.runInitToInstall || 'Run uds init to install commands'}`));
    console.log();
    process.exit(0);
    return;
  }

  // Show current status
  console.log(chalk.gray(msg.currentCommandsStatus || 'Current commands status:'));
  for (const inst of commandsInstallations) {
    // Support both {agent, level} objects and simple agent strings (backward compatibility)
    const agent = typeof inst === 'string' ? inst : inst.agent;
    const level = typeof inst === 'string' ? 'project' : (inst.level || 'project');

    const info = getInstalledCommandsForAgent(agent, level, projectPath);
    const displayName = getAgentDisplayName(agent);
    const count = info?.count || 0;
    const dir = getCommandsDirForAgent(agent, level, projectPath);

    console.log(chalk.gray(`  ${displayName} (${level}): ${count} commands in ${dir}`));
  }
  console.log();

  const spinner = ora(msg.installingCommands || 'Installing commands...').start();

  const result = await installCommandsToMultipleAgents(
    commandsInstallations,
    null, // Install all commands
    projectPath
  );

  // Build location summary
  const locations = commandsInstallations.map(inst => {
    const agent = typeof inst === 'string' ? inst : inst.agent;
    const level = typeof inst === 'string' ? 'project' : (inst.level || 'project');
    const displayName = getAgentDisplayName(agent);
    const dir = getCommandsDirForAgent(agent, level, projectPath);
    return `${displayName} (${level}): ${dir}`;
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
  // Normalize to {agent, level} format
  manifest.commands.installations = commandsInstallations.map(inst => {
    if (typeof inst === 'string') {
      return { agent: inst, level: 'project' };
    }
    return inst;
  });

  // Update command hashes for integrity tracking
  if (result.allFileHashes) {
    if (!manifest.commandHashes) manifest.commandHashes = {};
    Object.assign(manifest.commandHashes, result.allFileHashes);
  }

  writeManifest(manifest, projectPath);

  console.log();
  process.exit(0);
}

/**
 * Check manifest.aiTools and detect missing/outdated Skills/Commands
 * @param {string} projectPath - Project path
 * @param {Object} manifest - Manifest object
 * @param {string} latestSkillsVersion - Latest skills version from repository
 * @param {boolean} debug - Show debug output
 * @returns {{missingSkills: Array, outdatedSkills: Array, missingCommands: Array}}
 */
function checkNewFeatures(projectPath, manifest, latestSkillsVersion, debug = false) {
  const aiTools = manifest.aiTools || [];

  if (debug) {
    console.log();
    console.log(chalk.cyan('━'.repeat(50)));
    console.log(chalk.cyan.bold('🔍 Skills/Commands Detection Debug'));
    console.log(chalk.cyan('━'.repeat(50)));
    console.log(chalk.gray(`  aiTools in manifest: ${JSON.stringify(aiTools)}`));
    console.log(chalk.gray(`  declinedFeatures.skills: ${JSON.stringify(manifest.declinedFeatures?.skills || [])}`));
    console.log(chalk.gray(`  declinedFeatures.commands: ${JSON.stringify(manifest.declinedFeatures?.commands || [])}`));
    console.log(chalk.gray(`  manifest.skills.location: ${manifest.skills?.location || 'not set'}`));
    console.log();
  }

  if (aiTools.length === 0) {
    if (debug) {
      console.log(chalk.yellow('  No aiTools in manifest, skipping detection'));
    }
    return { missingSkills: [], outdatedSkills: [], missingCommands: [] };
  }

  // Get declined features from manifest (to exclude from prompts)
  const declinedSkills = manifest.declinedFeatures?.skills || [];
  const declinedCommands = manifest.declinedFeatures?.commands || [];

  const missingSkills = [];
  const outdatedSkills = [];
  const missingCommands = [];

  for (const tool of aiTools) {
    if (debug) {
      console.log(chalk.cyan(`  Checking tool: ${tool}`));
    }

    const config = getAgentConfig(tool);
    if (!config) {
      if (debug) {
        console.log(chalk.red(`    ✗ No config found for '${tool}' - skipping`));
      }
      continue;
    }

    if (debug) {
      console.log(chalk.gray(`    config.supportsSkills: ${config.supportsSkills}`));
      console.log(chalk.gray(`    config.skills: ${config.skills ? 'defined' : 'null'}`));
      console.log(chalk.gray(`    config.commands: ${config.commands ? 'defined' : 'null'}`));
    }

    // Check Skills support
    if (config.supportsSkills && config.skills) {
      // Check if skills are actually installed for this agent (file-based check)
      const projectInfo = getInstalledSkillsInfoForAgent(tool, 'project', projectPath);
      const userInfo = getInstalledSkillsInfoForAgent(tool, 'user');

      // Check if using marketplace (Claude Code only) - marketplace auto-updates
      // IMPORTANT: Only trust marketplace if it's actually installed, not just what manifest says
      // Manifest can be stale if user removed marketplace plugin
      const marketplaceInfo = tool === 'claude-code' ? getMarketplaceSkillsInfo() : null;
      const usingMarketplace = tool === 'claude-code' && marketplaceInfo?.installed === true;

      // Only trust actual file existence, not manifest records
      // (manifest records can be stale if user deleted the directory)
      const hasSkills = projectInfo?.installed || userInfo?.installed || usingMarketplace;

      if (debug) {
        console.log(chalk.gray('    Skills check:'));
        console.log(chalk.gray(`      projectInfo?.installed: ${projectInfo?.installed || false}`));
        console.log(chalk.gray(`      userInfo?.installed: ${userInfo?.installed || false}`));
        console.log(chalk.gray(`      manifest.skills.location: ${manifest.skills?.location || 'not set'} (may be stale)`));
        console.log(chalk.gray(`      marketplaceInfo?.installed: ${marketplaceInfo?.installed || false} (actual status)`));
        console.log(chalk.gray(`      usingMarketplace: ${usingMarketplace} (only true if marketplace actually installed)`));
        console.log(chalk.gray(`      hasSkills: ${hasSkills}`));
        console.log(chalk.gray(`      declinedSkills.includes('${tool}'): ${declinedSkills.includes(tool)}`));
      }

      // Skip if user previously declined this tool's skills
      if (!hasSkills && !declinedSkills.includes(tool)) {
        if (debug) {
          console.log(chalk.green('    ✓ Added to missingSkills'));
        }
        missingSkills.push({
          agent: tool,
          displayName: getAgentDisplayName(tool),
          paths: config.skills
        });
      } else if (latestSkillsVersion) {
        // Check if installed Skills are outdated
        const installedInfo = userInfo || projectInfo;
        const installedVersion = installedInfo?.version;

        // Skip marketplace (auto-updates) and unknown versions
        if (!usingMarketplace && installedVersion && installedVersion !== latestSkillsVersion) {
          if (debug) {
            console.log(chalk.yellow(`    ✓ Added to outdatedSkills (${installedVersion} → ${latestSkillsVersion})`));
          }
          outdatedSkills.push({
            agent: tool,
            displayName: getAgentDisplayName(tool),
            paths: config.skills,
            currentVersion: installedVersion,
            latestVersion: latestSkillsVersion,
            level: userInfo?.installed ? 'user' : 'project',
            path: installedInfo?.path
          });
        } else if (debug) {
          if (hasSkills) {
            console.log(chalk.gray('    - Skills already installed (hasSkills=true)'));
          }
          if (declinedSkills.includes(tool)) {
            console.log(chalk.gray('    - Previously declined by user'));
          }
        }
      }
    } else if (debug) {
      console.log(chalk.gray('    Skills: not supported or not configured'));
    }

    // Check Commands support
    if (config.commands !== null && config.commands) {
      // Check both project and user level installations
      const projectCmdInfo = getInstalledCommandsForAgent(tool, 'project', projectPath);
      const userCmdInfo = getInstalledCommandsForAgent(tool, 'user');

      // Only trust actual file existence, not manifest records
      const hasCommands = projectCmdInfo?.installed || userCmdInfo?.installed;

      if (debug) {
        console.log(chalk.gray('    Commands check:'));
        console.log(chalk.gray(`      projectCmdInfo?.installed: ${projectCmdInfo?.installed || false}`));
        console.log(chalk.gray(`      userCmdInfo?.installed: ${userCmdInfo?.installed || false}`));
        console.log(chalk.gray(`      hasCommands: ${hasCommands}`));
        console.log(chalk.gray(`      declinedCommands.includes('${tool}'): ${declinedCommands.includes(tool)}`));
      }

      // Skip if user previously declined this tool's commands
      if (!hasCommands && !declinedCommands.includes(tool)) {
        if (debug) {
          console.log(chalk.green('    ✓ Added to missingCommands'));
        }
        missingCommands.push({
          agent: tool,
          displayName: getAgentDisplayName(tool),
          paths: config.commands
        });
      } else if (debug) {
        if (hasCommands) {
          console.log(chalk.gray('    - Commands already installed'));
        }
        if (declinedCommands.includes(tool)) {
          console.log(chalk.gray('    - Previously declined by user'));
        }
      }
    } else if (debug) {
      console.log(chalk.gray('    Commands: not supported'));
    }

    if (debug) {
      console.log();
    }
  }

  if (debug) {
    console.log(chalk.cyan('━'.repeat(50)));
    console.log(chalk.cyan(`Result: ${missingSkills.length} missing Skills, ${outdatedSkills.length} outdated Skills, ${missingCommands.length} missing Commands`));
    console.log(chalk.cyan('━'.repeat(50)));
    console.log();
  }

  return { missingSkills, outdatedSkills, missingCommands };
}

/**
 * Prompt user to install new features discovered during update
 * @param {Array} missingSkills - Array of {agent, displayName, paths}
 * @param {Array} outdatedSkills - Array of {agent, displayName, paths, currentVersion, latestVersion, level, path}
 * @param {Array} missingCommands - Array of {agent, displayName, path}
 * @returns {Promise<{installSkills: Array, updateSkills: Array, installCommands: Array, declinedSkills: Array, declinedCommands: Array}>}
 */
async function promptNewFeatureInstallation(missingSkills, outdatedSkills, missingCommands) {
  const msg = t().commands.update;

  // If nothing to do, return empty
  if (missingSkills.length === 0 && outdatedSkills.length === 0 && missingCommands.length === 0) {
    return { installSkills: [], updateSkills: [], installCommands: [], declinedSkills: [], declinedCommands: [] };
  }

  console.log();
  console.log(chalk.cyan('━'.repeat(50)));
  console.log(chalk.cyan.bold(msg.newFeaturesAvailable || 'New Features Available'));
  console.log(chalk.cyan('━'.repeat(50)));
  console.log();

  const result = { installSkills: [], updateSkills: [], installCommands: [], declinedSkills: [], declinedCommands: [] };

  // Handle missing Skills using unified prompt (consistent with init/configure)
  if (missingSkills.length > 0) {
    console.log(chalk.yellow(msg.skillsNotInstalledFor || 'Skills not yet installed for these AI tools:'));
    for (const skill of missingSkills) {
      console.log(chalk.gray(`  • ${skill.displayName}`));
    }

    // Use unified prompt from init.js (allows per-tool level selection)
    const missingAgents = missingSkills.map(s => s.agent);
    const installations = await promptSkillsInstallLocation(missingAgents);

    if (installations.length > 0) {
      result.installSkills = installations;
    }

    // Track declined skills (agents not selected for installation)
    const installedAgents = installations.map(i => i.agent);
    result.declinedSkills = missingAgents.filter(a => !installedAgents.includes(a));
  }

  // Handle outdated Skills with checkbox selection
  if (outdatedSkills.length > 0) {
    console.log(chalk.yellow(msg.skillsOutdatedFor || 'Skills updates available for these AI tools:'));
    for (const skill of outdatedSkills) {
      const levelLabel = skill.level === 'user' ? 'user' : 'project';
      const pathDisplay = skill.path || getSkillsDirForAgent(skill.agent, skill.level);
      console.log(chalk.gray(`  • ${skill.displayName} (${levelLabel}: ${pathDisplay})`));
      console.log(chalk.gray(`      ${skill.currentVersion} → ${skill.latestVersion}`));
    }
    console.log();

    // Build checkbox choices with path info
    const updateChoices = outdatedSkills.map(skill => {
      const levelLabel = skill.level === 'user' ? 'user' : 'project';
      const pathDisplay = skill.path || getSkillsDirForAgent(skill.agent, skill.level);
      return {
        name: `${skill.displayName} ${chalk.gray(`(${levelLabel}: ${pathDisplay}) ${skill.currentVersion} → ${skill.latestVersion}`)}`,
        value: skill.agent,
        checked: true  // Default checked for opt-out behavior
      };
    });

    // Add skip option
    updateChoices.push(new inquirer.Separator());
    updateChoices.push({
      name: chalk.gray(msg.skipSkillsUpdate || 'Skip Skills update'),
      value: '__skip__'
    });

    const { selectedUpdateAgents } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selectedUpdateAgents',
      message: msg.selectSkillsToUpdate || 'Select AI tools to update Skills for:',
      choices: updateChoices,
      validate: (answer) => {
        if (answer.includes('__skip__') && answer.length > 1) {
          return msg.skipValidationError || 'Cannot select Skip with other options';
        }
        return true;
      }
    }]);

    // Filter out skip and map to update info
    const filteredUpdateAgents = selectedUpdateAgents.filter(a => a !== '__skip__');

    if (filteredUpdateAgents.length > 0) {
      result.updateSkills = filteredUpdateAgents.map(agent => {
        const skillInfo = outdatedSkills.find(s => s.agent === agent);
        return {
          agent,
          level: skillInfo.level,
          path: skillInfo.path
        };
      });
    }
    console.log();
  }

  // Handle missing Commands using unified prompt (consistent with init/configure)
  if (missingCommands.length > 0) {
    console.log(chalk.yellow(msg.commandsNotInstalledFor || 'Slash commands not yet installed for these AI tools:'));
    for (const cmd of missingCommands) {
      console.log(chalk.gray(`  • ${cmd.displayName}`));
    }

    // Use unified prompt from init.js (allows per-tool level selection)
    const missingAgents = missingCommands.map(c => c.agent);
    const installations = await promptCommandsInstallation(missingAgents);

    if (installations.length > 0) {
      result.installCommands = installations;
    }

    // Track declined commands (agents not selected for installation)
    const installedAgents = installations.map(i => i.agent);
    result.declinedCommands = missingAgents.filter(a => !installedAgents.includes(a));
  }

  return result;
}
