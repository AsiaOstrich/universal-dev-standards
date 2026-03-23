import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { join, basename } from 'path';
import { readManifest, writeManifest, copyStandard, isInitialized } from '../utils/copier.js';
import { getRepositoryInfo, getAllStandards, getStandardSource } from '../utils/registry.js';
import { computeFileHash, scanForUntrackedFiles, refreshIntegrationBlockHashes } from '../utils/hasher.js';
import {
  writeIntegrationFile,
  getToolFilePath,
  writeAgentsMdSummary
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
  getInstalledCommandsForAgent,
  cleanupDuplicateSkills,
  cleanupLegacyCommands
} from '../utils/skills-installer.js';
import { displayLanguageToLocale, isLocalizedLocale, detectLocaleFromStandards } from '../utils/locale.js';
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
import {
  reconcile,
  plan as reconcilerPlan,
  rollbackLast,
  formatPlan,
  listBackups
} from '../reconciler/index.js';
import { restoreSingleFile } from './check.js';

/**
 * Determine the correct target directory for a standard file.
 * Options standards (e.g., options/unit-testing.ai.yaml) go to .standards/options/,
 * all others go to .standards/.
 */
function getStandardTargetDir(sourcePath) {
  return sourcePath.includes('options/') ? '.standards/options' : '.standards';
}

/**
 * Clean up stale commandHashes entries before merging new ones.
 * Removes old entries for agents that are being updated.
 */
function replaceCommandHashesForUpdatedAgents(commandHashes, newHashes) {
  const updatedPrefixes = new Set(
    Object.keys(newHashes).map(k => k.split('/')[0])
  );
  for (const prefix of updatedPrefixes) {
    for (const key of Object.keys(commandHashes)) {
      if (key.startsWith(prefix + '/')) {
        delete commandHashes[key];
      }
    }
  }
  Object.assign(commandHashes, newHashes);
}

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
 * Check for new standards available in the registry that are not yet installed
 * @param {Object} manifest - Manifest object
 * @returns {{newStandards: Array<{source: string, name: string}>, count: number}}
 */
function checkNewStandards(manifest) {
  const format = manifest.format || 'ai';

  // Get all standards (level system removed)
  const registryStandards = getAllStandards();

  // Include all reference and skill standards
  const eligibleStandards = registryStandards.filter(s => s.category === 'reference' || s.category === 'skill');

  // Get installed standard basenames for comparison
  const installedBasenames = new Set(
    (manifest.standards || []).map(s => basename(s))
  );

  // Find standards in registry that are not yet installed
  const newStandards = [];
  for (const std of eligibleStandards) {
    const sourcePath = getStandardSource(std, format);
    if (!sourcePath) continue; // Skip skill-only standards with no source file
    const fileName = basename(sourcePath);
    if (!installedBasenames.has(fileName)) {
      newStandards.push({ source: sourcePath, name: fileName });
    }
  }

  return { newStandards, count: newStandards.length };
}

/**
 * Resolve locale from manifest with fallback detection.
 * If manifest has display_language, use it. Otherwise detect from .standards/ files.
 * @param {Object} manifest - Project manifest
 * @param {string} projectPath - Project root path
 * @returns {string} Locale directory name (e.g., 'zh-TW', 'en')
 */
function resolveLocale(manifest, projectPath) {
  const fromManifest = displayLanguageToLocale(manifest.options?.display_language);
  if (isLocalizedLocale(fromManifest)) {
    return fromManifest;
  }
  return detectLocaleFromStandards(projectPath) || 'en';
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

  // Set UI language based on display_language setting
  // Only override if user didn't explicitly set --ui-lang flag
  if (!isLanguageExplicitlySet()) {
    const uiLang = manifest.options?.display_language || 'en';
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

  // Handle --rollback option (DSR)
  if (options.rollback) {
    await handleRollback(projectPath);
    return;
  }

  // Handle --plan option (DSR dry-run)
  if (options.plan) {
    await handlePlan(projectPath, options);
    return;
  }

  // Handle --force option (DSR force reconciliation)
  if (options.force) {
    await handleForceReconcile(projectPath, options);
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

  // Detect new standards available in the registry
  const { newStandards } = checkNewStandards(manifest);

  // List files to update
  console.log(chalk.gray(msg.filesToUpdate));
  for (const std of manifest.standards) {
    const fileName = std.split('/').pop();
    const displayPath = getStandardTargetDir(std) + '/' + fileName;
    console.log(chalk.gray(`  ${displayPath}`));
  }
  for (const ext of manifest.extensions) {
    if (typeof ext !== 'string') continue;
    const fileName = ext.split('/').pop();
    const displayPath = getStandardTargetDir(ext) + '/' + fileName;
    console.log(chalk.gray(`  ${displayPath}`));
  }
  if (!options.standardsOnly) {
    for (const int of manifest.integrations) {
      console.log(chalk.gray(`  ${int}`));
    }
  }

  // Show new standards if any
  if (newStandards.length > 0) {
    console.log();
    console.log(chalk.cyan(msg.newStandardsFound.replace('{count}', newStandards.length)));
    for (const ns of newStandards) {
      console.log(chalk.green(`  + .standards/${ns.name}`));
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
    const result = await copyStandard(std, getStandardTargetDir(std), projectPath);
    if (result.success) {
      results.updated.push(std);
    } else {
      results.errors.push(`${std}: ${result.error}`);
    }
  }

  // Update extensions (skip non-string entries like custom-domain objects)
  for (const ext of manifest.extensions) {
    if (typeof ext !== 'string') continue;
    const result = await copyStandard(ext, '.standards', projectPath);
    if (result.success) {
      results.updated.push(ext);
    } else {
      results.errors.push(`${ext}: ${result.error}`);
    }
  }

  spinner.succeed(msg.updatedStandards.replace('{count}', results.updated.length));

  // Install new standards if detected
  if (newStandards.length > 0) {
    let shouldInstallNew = false;

    if (options.yes) {
      // --yes mode: auto-install new standards
      shouldInstallNew = true;
    } else {
      // Interactive mode: ask user
      const { installNew } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'installNew',
          message: msg.installNewStandards,
          default: true
        }
      ]);
      shouldInstallNew = installNew;
    }

    if (shouldInstallNew) {
      const newSpinner = ora(msg.installingNewStandards).start();
      let newCount = 0;

      for (const ns of newStandards) {
        const result = await copyStandard(ns.source, getStandardTargetDir(ns.source), projectPath);
        if (result.success) {
          manifest.standards.push(ns.source);
          results.updated.push(ns.source);
          newCount++;
        } else {
          results.errors.push(`${ns.source}: ${result.error}`);
        }
      }

      newSpinner.succeed(msg.newStandardsInstalled.replace('{count}', newCount));
    }
  }

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

    // Update universal AGENTS.md if enabled and not already generated by tool integration
    if (manifest.generateAgentsMd && !generatedFiles.has('AGENTS.md')) {
      const summaryConfig = {
        installedStandards: installedStandardsList,
        language: manifest.options?.display_language || 'en',
        commitLanguage: manifest.options?.commit_language || 'english',
        standardOptions: manifest.options || {}
      };
      const agentsMdResult = writeAgentsMdSummary(summaryConfig, projectPath);
      if (agentsMdResult.success) {
        results.integrations.push(agentsMdResult.path);
        if (agentsMdResult.blockHashInfo) {
          if (!manifest.integrationBlockHashes) manifest.integrationBlockHashes = {};
          manifest.integrationBlockHashes[agentsMdResult.path] = {
            ...agentsMdResult.blockHashInfo,
            installedAt: new Date().toISOString()
          };
        }
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
    if (typeof ext !== 'string') continue;
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

  // Clean up orphan files in .standards/ that are no longer tracked
  // This handles files renamed or removed between versions
  const orphanFiles = scanForUntrackedFiles(projectPath, manifest);
  const standardsOrphans = orphanFiles.filter(f => f.startsWith('.standards/'));
  if (standardsOrphans.length > 0) {
    for (const orphan of standardsOrphans) {
      try {
        unlinkSync(join(projectPath, orphan));
        results.updated.push(`removed: ${orphan}`);
      } catch {
        // Ignore removal errors
      }
    }
  }

  // Migrate test_levels: upgrade old 2-level default to full 4-level default
  // Only for projects installed before v5.0.0 stable (pre-5.0 used 2-level default)
  // 5.0.0-alpha/beta/rc are also < 5.0.0 in semver, so they get migrated too
  const installedVersion = currentVersion || '0.0.0';
  const isPreV5 = compareVersions(installedVersion, '5.0.0') < 0;
  if (isPreV5) {
    const ALL_TEST_LEVELS = ['unit-testing', 'integration-testing', 'system-testing', 'e2e-testing'];
    const currentLevels = manifest.options?.test_levels || [];
    const isOldDefault = currentLevels.length === 2 &&
      currentLevels.includes('unit-testing') &&
      currentLevels.includes('integration-testing') &&
      !currentLevels.includes('system-testing') &&
      !currentLevels.includes('e2e-testing');
    if (isOldDefault) {
      manifest.options = manifest.options || {};
      manifest.options.test_levels = ALL_TEST_LEVELS;
      console.log();
      console.log(chalk.cyan(msg.testLevelsMigrated || 'ℹ Test levels updated: 2 → 4 (added system-testing, e2e-testing)'));
    }
  }

  // Update manifest
  manifest.version = '3.3.0';
  manifest.upstream.version = latestVersion;
  manifest.upstream.installed = new Date().toISOString().split('T')[0];
  refreshIntegrationBlockHashes(manifest, projectPath);
  writeManifest(manifest, projectPath);

  // Post-update integrity check: detect and restore missing files
  const allTrackedFiles = [];
  for (const std of manifest.standards) {
    const fileName = basename(std);
    const relativePath = std.includes('options/')
      ? join('.standards', 'options', fileName)
      : join('.standards', fileName);
    allTrackedFiles.push(relativePath);
  }
  for (const ext of manifest.extensions) {
    if (typeof ext !== 'string') continue;
    const fileName = basename(ext);
    allTrackedFiles.push(join('.standards', fileName));
  }
  for (const int of (manifest.integrations || [])) {
    allTrackedFiles.push(int);
  }

  const missingFiles = allTrackedFiles.filter(f => !existsSync(join(projectPath, f)));

  if (missingFiles.length > 0) {
    console.log();
    console.log(chalk.yellow((msg.missingAfterUpdate || '⚠ {count} file(s) still missing after update').replace('{count}', missingFiles.length)));

    let shouldRestore = false;
    if (options.yes) {
      shouldRestore = true;
    } else {
      const { restoreMissing } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'restoreMissing',
          message: (msg.restoreMissingPrompt || 'Restore {count} missing file(s)?').replace('{count}', missingFiles.length),
          default: true
        }
      ]);
      shouldRestore = restoreMissing;
    }

    if (shouldRestore) {
      const restoreSpinner = ora((msg.restoringMissing || 'Restoring missing files...')).start();
      const checkMsg = t().commands.check;
      let restoredCount = 0;

      for (const relativePath of missingFiles) {
        const success = await restoreSingleFile(projectPath, manifest, relativePath, checkMsg);
        if (success) restoredCount++;
      }

      restoreSpinner.succeed(
        (msg.restoredCount || 'Restored {restored}/{total} file(s)')
          .replace('{restored}', restoredCount)
          .replace('{total}', missingFiles.length)
      );

      // Re-write manifest with updated hashes from restored files
      writeManifest(manifest, projectPath);

      // Re-generate integration files if files were restored and AI tools are configured
      // This ensures CLAUDE.md / AGENTS.md standards index reflects restored files
      if (restoredCount > 0 && manifest.aiTools?.length > 0) {
        regenerateIntegrations(projectPath, manifest);
        refreshIntegrationBlockHashes(manifest, projectPath);
        writeManifest(manifest, projectPath);
      }
    }
  }

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
    const { missingSkills, outdatedSkills, missingCommands, outdatedCommands } = checkNewFeatures(projectPath, manifest, latestSkillsVersion, options.debug);

    if (missingSkills.length > 0 || outdatedSkills.length > 0 || missingCommands.length > 0 || outdatedCommands.length > 0) {
      if (!options.yes) {
        // Interactive mode: prompt user to install/update
        const { installSkills, updateSkills, installCommands, updateCommands, declinedSkills, declinedCommands } = await promptNewFeatureInstallation(
          missingSkills,
          outdatedSkills,
          missingCommands,
          outdatedCommands
        );

        // Install Skills if user agreed
        if (installSkills.length > 0) {
          const skillSpinner = ora(msg.installingNewSkills || 'Installing Skills...').start();
          const skillsLocale = resolveLocale(manifest, projectPath);
          const skillResult = await installSkillsToMultipleAgents(installSkills, null, projectPath, skillsLocale);

          // Update manifest
          if (!manifest.skills) manifest.skills = {};
          manifest.skills.installed = true;
          manifest.skills.version = repoInfo.skills.version;
          manifest.skills.installations = [
            ...(manifest.skills.installations || []),
            ...installSkills
          ];

          // Derive location from installations if not set
          if (!manifest.skills.location) {
            const levels = manifest.skills.installations.map(s => s.level).filter(Boolean);
            const uniqueLevels = [...new Set(levels)];
            if (uniqueLevels.length === 1) {
              manifest.skills.location = uniqueLevels[0];
            } else if (uniqueLevels.length > 1) {
              manifest.skills.location = 'multiple';
            }
          }

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
          const updateLocale = resolveLocale(manifest, projectPath);
          const updateResult = await installSkillsToMultipleAgents(updateSkills, null, projectPath, updateLocale);

          // Update manifest version
          if (!manifest.skills) manifest.skills = {};
          manifest.skills.version = repoInfo.skills.version;

          // Derive location from installations if not set
          if (!manifest.skills.location && manifest.skills.installations?.length > 0) {
            const levels = manifest.skills.installations.map(s => s.level).filter(Boolean);
            const uniqueLevels = [...new Set(levels)];
            if (uniqueLevels.length === 1) {
              manifest.skills.location = uniqueLevels[0];
            } else if (uniqueLevels.length > 1) {
              manifest.skills.location = 'multiple';
            }
          }

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
          const cmdLocale = resolveLocale(manifest, projectPath);
          const cmdResult = await installCommandsToMultipleAgents(installCommands, null, projectPath, cmdLocale);

          // Update manifest
          if (!manifest.commands) manifest.commands = {};
          manifest.commands.installed = true;
          manifest.commands.version = repoInfo.skills.version;  // Track version
          manifest.commands.installations = [
            ...(manifest.commands.installations || []),
            ...installCommands
          ];

          // Update command hashes for integrity tracking
          if (cmdResult.allFileHashes) {
            if (!manifest.commandHashes) manifest.commandHashes = {};
            replaceCommandHashesForUpdatedAgents(manifest.commandHashes, cmdResult.allFileHashes);
          }

          if (cmdResult.totalErrors === 0) {
            cmdSpinner.succeed((msg.newCommandsInstalled || 'Installed commands for {count} AI tools')
              .replace('{count}', installCommands.length));
          } else {
            cmdSpinner.warn((msg.newCommandsInstalledWithErrors || 'Installed commands with {errors} errors')
              .replace('{errors}', cmdResult.totalErrors));
          }
        }

        // Update outdated Commands if user agreed
        if (updateCommands.length > 0) {
          const updateCmdSpinner = ora(msg.updatingCommands || 'Updating Commands...').start();
          const updateCmdLocale = resolveLocale(manifest, projectPath);
          const updateCmdResult = await installCommandsToMultipleAgents(updateCommands, null, projectPath, updateCmdLocale);

          // Update manifest version
          if (!manifest.commands) manifest.commands = {};
          manifest.commands.version = repoInfo.skills.version;

          // Update command hashes for integrity tracking
          if (updateCmdResult.allFileHashes) {
            if (!manifest.commandHashes) manifest.commandHashes = {};
            replaceCommandHashesForUpdatedAgents(manifest.commandHashes, updateCmdResult.allFileHashes);
          }

          if (updateCmdResult.totalErrors === 0) {
            updateCmdSpinner.succeed((msg.commandsUpdated || 'Updated Commands for {count} AI tools')
              .replace('{count}', updateCommands.length));
          } else {
            updateCmdSpinner.warn((msg.commandsUpdatedWithErrors || 'Updated Commands with {errors} errors')
              .replace('{errors}', updateCmdResult.totalErrors));
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
          installCommands.length > 0 || updateCommands.length > 0 ||
          declinedSkills.length > 0 || declinedCommands.length > 0;
        if (hasChanges) {
          // Re-run integration update if new skills were installed
          // This ensures CLAUDE.md / AGENTS.md standards index is up-to-date
          if (installSkills.length > 0 || updateSkills.length > 0) {
            const regenResult = regenerateIntegrations(projectPath, manifest);
            if (regenResult.updated.length > 0) {
              console.log(chalk.green(`  ✓ ${msg.syncedIntegrations.replace('{count}', regenResult.updated.length)}`));
            }
          }

          refreshIntegrationBlockHashes(manifest, projectPath);
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
        if (outdatedCommands.length > 0) {
          const toolNames = outdatedCommands.map(c => `${c.displayName} (${c.currentVersion} → ${c.latestVersion})`).join(', ');
          console.log(chalk.gray(`  • Commands update (${toolNames}): run "uds update" interactively to update`));
        }
      }
    }
  }

  // Detect and cleanup duplicate installations
  if (manifest.skills?.installed || manifest.commands?.installed) {
    const duplicateResult = cleanupDuplicateSkills(projectPath);
    const legacyResult = cleanupLegacyCommands(projectPath);
    const totalCleaned = duplicateResult.cleaned.length + legacyResult.cleaned.length;

    if (totalCleaned > 0) {
      console.log();
      if (duplicateResult.cleaned.length > 0) {
        console.log(chalk.green(`  ✓ ${(msg.duplicatesCleaned || 'Cleaned {count} duplicate installation(s)').replace('{count}', duplicateResult.cleaned.length)}`));
        for (const item of duplicateResult.cleaned) {
          console.log(chalk.gray(`    - ${item.agent} (${item.level}): ${item.path}`));
        }
      }
      if (legacyResult.cleaned.length > 0) {
        console.log(chalk.green(`  ✓ ${(msg.legacyCleaned || 'Cleaned {count} legacy command file(s)').replace('{count}', legacyResult.cleaned.length)}`));
        for (const item of legacyResult.cleaned) {
          console.log(chalk.gray(`    - ${item.path}`));
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

      // Determine installation location using multiple sources
      let location = manifest.skills.location;

      // Derive from installations array if location not set
      if (!location && manifest.skills.installations?.length > 0) {
        const hasMarketplace = manifest.skills.installations.some(
          inst => inst.level === 'marketplace' || inst.agent === 'marketplace'
        );
        if (hasMarketplace) {
          location = 'marketplace';
        } else {
          const levels = manifest.skills.installations.map(inst => inst.level).filter(Boolean);
          const uniqueLevels = [...new Set(levels)];
          location = uniqueLevels.length === 1 ? uniqueLevels[0] : (uniqueLevels.length > 1 ? 'project' : null);
        }
      }

      // Fall back to file-system detection if still unknown
      if (!location) {
        for (const tool of (manifest.aiTools || [])) {
          const projInfo = getInstalledSkillsInfoForAgent(tool, 'project', projectPath);
          const usrInfo = getInstalledSkillsInfoForAgent(tool, 'user');
          if (projInfo?.installed) { location = 'project'; break; }
          if (usrInfo?.installed) { location = 'user'; break; }
        }
      }

      location = location || 'unknown';

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

  // Regenerate universal AGENTS.md if enabled and not already covered
  if (manifest.generateAgentsMd && !generatedFiles.has('AGENTS.md')) {
    const summaryConfig = {
      installedStandards: installedStandardsList,
      language: manifest.options?.display_language || 'en',
      commitLanguage: manifest.options?.commit_language || 'english',
      standardOptions: manifest.options || {}
    };
    const agentsMdResult = writeAgentsMdSummary(summaryConfig, projectPath);
    if (agentsMdResult.success) {
      results.updated.push(agentsMdResult.path);
      if (agentsMdResult.blockHashInfo) {
        if (!manifest.integrationBlockHashes) manifest.integrationBlockHashes = {};
        manifest.integrationBlockHashes[agentsMdResult.path] = {
          ...agentsMdResult.blockHashInfo,
          installedAt: now
        };
      }
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
  refreshIntegrationBlockHashes(manifest, projectPath);
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
    refreshIntegrationBlockHashes(manifest, projectPath);
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

  const skillsLocaleForUpdate = resolveLocale(manifest, projectPath);
  const result = await installSkillsToMultipleAgents(
    fileBasedInstallations,
    null, // Install all skills
    projectPath,
    skillsLocaleForUpdate
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

  const commandsLocale = resolveLocale(manifest, projectPath);
  const result = await installCommandsToMultipleAgents(
    commandsInstallations,
    null, // Install all commands
    projectPath,
    commandsLocale
  );

  // Build location summary
  const locations = (commandsInstallations || []).map(inst => {
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
  const repoInfo = getRepositoryInfo();
  manifest.commands = manifest.commands || {};
  manifest.commands.installed = true;
  manifest.commands.version = repoInfo.skills.version;  // Track version
  // Normalize to {agent, level} format
  manifest.commands.installations = (commandsInstallations || []).map(inst => {
    if (typeof inst === 'string') {
      return { agent: inst, level: 'project' };
    }
    return inst;
  });

  // Update command hashes for integrity tracking
  if (result.allFileHashes) {
    if (!manifest.commandHashes) manifest.commandHashes = {};
    replaceCommandHashesForUpdatedAgents(manifest.commandHashes, result.allFileHashes);
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
 * @returns {{missingSkills: Array, outdatedSkills: Array, missingCommands: Array, outdatedCommands: Array}}
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
    return { missingSkills: [], outdatedSkills: [], missingCommands: [], outdatedCommands: [] };
  }

  // Get declined features from manifest (to exclude from prompts)
  const declinedSkills = manifest.declinedFeatures?.skills || [];
  const declinedCommands = manifest.declinedFeatures?.commands || [];

  const missingSkills = [];
  const outdatedSkills = [];
  const missingCommands = [];
  const outdatedCommands = [];

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

        // Skip marketplace (auto-updates); treat unknown versions as outdated
        if (!usingMarketplace && (!installedVersion || installedVersion !== latestSkillsVersion)) {
          if (debug) {
            console.log(chalk.yellow(`    ✓ Added to outdatedSkills (${installedVersion || 'unknown'} → ${latestSkillsVersion})`));
          }
          outdatedSkills.push({
            agent: tool,
            displayName: getAgentDisplayName(tool),
            paths: config.skills,
            currentVersion: installedVersion || 'unknown',
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
      } else if (hasCommands && latestSkillsVersion) {
        // Check if installed Commands are outdated (similar to Skills)
        const installedCmdInfo = userCmdInfo?.installed ? userCmdInfo : projectCmdInfo;
        const installedCmdVersion = installedCmdInfo?.version;

        if (debug) {
          console.log(chalk.gray(`      installedCmdVersion: ${installedCmdVersion || 'unknown'}`));
          console.log(chalk.gray(`      latestSkillsVersion: ${latestSkillsVersion}`));
        }

        // Check if version differs from latest; treat unknown versions as outdated
        if (!installedCmdVersion || installedCmdVersion !== latestSkillsVersion) {
          if (debug) {
            console.log(chalk.yellow(`    ✓ Added to outdatedCommands (${installedCmdVersion || 'unknown'} → ${latestSkillsVersion})`));
          }
          outdatedCommands.push({
            agent: tool,
            displayName: getAgentDisplayName(tool),
            paths: config.commands,
            currentVersion: installedCmdVersion || 'unknown',
            latestVersion: latestSkillsVersion,
            level: userCmdInfo?.installed ? 'user' : 'project',
            path: installedCmdInfo?.path
          });
        } else if (debug) {
          console.log(chalk.gray('    - Commands up to date'));
        }
      } else if (debug) {
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
    console.log(chalk.cyan(`Result: ${missingSkills.length} missing Skills, ${outdatedSkills.length} outdated Skills, ${missingCommands.length} missing Commands, ${outdatedCommands.length} outdated Commands`));
    console.log(chalk.cyan('━'.repeat(50)));
    console.log();
  }

  return { missingSkills, outdatedSkills, missingCommands, outdatedCommands };
}

/**
 * Prompt user to install new features discovered during update
 * @param {Array} missingSkills - Array of {agent, displayName, paths}
 * @param {Array} outdatedSkills - Array of {agent, displayName, paths, currentVersion, latestVersion, level, path}
 * @param {Array} missingCommands - Array of {agent, displayName, path}
 * @param {Array} outdatedCommands - Array of {agent, displayName, paths, currentVersion, latestVersion, level, path}
 * @returns {Promise<{installSkills: Array, updateSkills: Array, installCommands: Array, updateCommands: Array, declinedSkills: Array, declinedCommands: Array}>}
 */
async function promptNewFeatureInstallation(missingSkills, outdatedSkills, missingCommands, outdatedCommands = []) {
  const msg = t().commands.update;

  // If nothing to do, return empty
  if (missingSkills.length === 0 && outdatedSkills.length === 0 && missingCommands.length === 0 && outdatedCommands.length === 0) {
    return { installSkills: [], updateSkills: [], installCommands: [], updateCommands: [], declinedSkills: [], declinedCommands: [] };
  }

  console.log();
  console.log(chalk.cyan('━'.repeat(50)));
  console.log(chalk.cyan.bold(msg.newFeaturesAvailable || 'New Features Available'));
  console.log(chalk.cyan('━'.repeat(50)));
  console.log();

  const result = { installSkills: [], updateSkills: [], installCommands: [], updateCommands: [], declinedSkills: [], declinedCommands: [] };

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

  // Handle outdated Commands with checkbox selection (similar to Skills)
  if (outdatedCommands.length > 0) {
    console.log(chalk.yellow(msg.commandsOutdatedFor || 'Commands updates available for these AI tools:'));
    for (const cmd of outdatedCommands) {
      const levelLabel = cmd.level === 'user' ? 'user' : 'project';
      const pathDisplay = cmd.path || getCommandsDirForAgent(cmd.agent, cmd.level);
      console.log(chalk.gray(`  • ${cmd.displayName} (${levelLabel}: ${pathDisplay})`));
      console.log(chalk.gray(`      ${cmd.currentVersion} → ${cmd.latestVersion}`));
    }
    console.log();

    // Build checkbox choices with path info
    const updateCmdChoices = outdatedCommands.map(cmd => {
      const levelLabel = cmd.level === 'user' ? 'user' : 'project';
      const pathDisplay = cmd.path || getCommandsDirForAgent(cmd.agent, cmd.level);
      return {
        name: `${cmd.displayName} ${chalk.gray(`(${levelLabel}: ${pathDisplay}) ${cmd.currentVersion} → ${cmd.latestVersion}`)}`,
        value: cmd.agent,
        checked: true  // Default checked for opt-out behavior
      };
    });

    // Add skip option
    updateCmdChoices.push(new inquirer.Separator());
    updateCmdChoices.push({
      name: chalk.gray(msg.skipCommandsUpdate || 'Skip Commands update'),
      value: '__skip__'
    });

    const { selectedUpdateCmdAgents } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selectedUpdateCmdAgents',
      message: msg.selectCommandsToUpdate || 'Select AI tools to update Commands for:',
      choices: updateCmdChoices,
      validate: (answer) => {
        if (answer.includes('__skip__') && answer.length > 1) {
          return msg.skipValidationError || 'Cannot select Skip with other options';
        }
        return true;
      }
    }]);

    // Filter out skip and map to update info
    const filteredUpdateCmdAgents = selectedUpdateCmdAgents.filter(a => a !== '__skip__');

    if (filteredUpdateCmdAgents.length > 0) {
      result.updateCommands = filteredUpdateCmdAgents.map(agent => {
        const cmdInfo = outdatedCommands.find(c => c.agent === agent);
        return {
          agent,
          level: cmdInfo.level,
          path: cmdInfo.path
        };
      });
    }
    console.log();
  }

  return result;
}

// ─── DSR (Declarative State Reconciliation) Handlers ─────────────

/**
 * Handle --rollback: restore from the most recent backup.
 */
async function handleRollback(projectPath) {
  const backups = listBackups(projectPath);
  if (backups.length === 0) {
    console.log(chalk.yellow('No backups found. Nothing to rollback.'));
    console.log();
    return;
  }

  const latest = backups[0];
  console.log(chalk.cyan(`Rolling back to: ${latest.backupId}`));
  console.log(chalk.gray(`  Created: ${latest.createdAt}`));
  console.log(chalk.gray(`  Actions: ${latest.actionCount}`));
  console.log();

  const result = rollbackLast(projectPath);
  if (result.success) {
    console.log(chalk.green(`Rollback successful. Restored ${result.restored.length} files.`));
    for (const file of result.restored) {
      console.log(chalk.gray(`  ← ${file}`));
    }
  } else {
    console.log(chalk.red('Rollback failed:'));
    for (const err of result.errors) {
      console.log(chalk.red(`  ${err}`));
    }
  }
  console.log();
}

/**
 * Handle --plan: show what the reconciler would do without executing.
 */
async function handlePlan(projectPath, options) {
  const spinner = ora('Calculating reconciliation plan...').start();

  const result = await reconcilerPlan(projectPath, { force: false });

  spinner.stop();

  if (result.errors.length > 0) {
    for (const err of result.errors) {
      console.log(chalk.yellow(`  ⚠ ${err}`));
    }
    console.log();
  }

  console.log(formatPlan(result.plan));
  console.log();

  if (result.plan.actions.length > 0) {
    console.log(chalk.gray('Run `uds update` to apply these changes.'));
    console.log(chalk.gray('Run `uds update --force` to force update all files.'));
    console.log();
  }
}

/**
 * Handle --force: run the full reconciler with force mode.
 */
async function handleForceReconcile(projectPath, options) {
  console.log(chalk.cyan('Running declarative state reconciliation (force mode)...'));
  console.log();

  // First show the plan
  const planResult = await reconcilerPlan(projectPath, { force: true });

  if (planResult.plan.actions.length === 0) {
    console.log(chalk.green('Everything is up to date. No changes needed.'));
    console.log();
    return;
  }

  console.log(formatPlan(planResult.plan));
  console.log();

  // Confirm unless --yes
  if (!options.yes) {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Apply ${planResult.plan.actions.length} changes?`,
        default: true
      }
    ]);

    if (!confirmed) {
      console.log(chalk.yellow('Cancelled.'));
      return;
    }
  }

  // Execute
  const spinner = ora('Applying reconciliation plan...').start();

  const result = await reconcile(projectPath, {
    force: true,
    backup: true,
    onAction: (action, index, total) => {
      spinner.text = `[${index + 1}/${total}] ${action.type} ${action.path || action.category}`;
    }
  });

  if (result.success) {
    spinner.succeed(`Reconciliation complete: ${result.execution?.summary.succeeded || 0} succeeded`);
  } else {
    spinner.warn(`Reconciliation completed with errors: ${result.execution?.summary.failed || 0} failed`);
  }

  if (result.execution?.backupId) {
    console.log(chalk.gray(`  Backup: ${result.execution.backupId}`));
    console.log(chalk.gray('  Use `uds update --rollback` to undo.'));
  }

  if (result.errors.length > 0) {
    console.log();
    console.log(chalk.yellow(`Errors (${result.errors.length}):`));
    for (const err of result.errors) {
      console.log(chalk.gray(`  ${err}`));
    }
  }

  console.log();
}
