import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { existsSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { readManifest, writeManifest, isInitialized, copyStandard, copyIntegration } from '../utils/copier.js';
import {
  getStandardsByLevel,
  getLevelInfo,
  getRepositoryInfo
} from '../utils/registry.js';
import {
  computeFileHash,
  compareFileHash,
  hasFileHashes
} from '../utils/hasher.js';
import { downloadFromGitHub, getMarketplaceSkillsInfo } from '../utils/github.js';
import {
  getInstalledSkillsInfoForAgent,
  getInstalledCommandsForAgent,
  installSkillsToMultipleAgents,
  installCommandsToMultipleAgents
} from '../utils/skills-installer.js';
import {
  getAgentConfig,
  getAgentDisplayName
} from '../config/ai-agent-paths.js';
import {
  parseReferences,
  compareStandardsWithReferences
} from '../utils/reference-sync.js';
import {
  getToolFilePath,
  getToolFormat,
  extractMarkedContent
} from '../utils/integration-generator.js';
import { checkForUpdates } from '../utils/npm-registry.js';
import { t, getLanguage } from '../i18n/messages.js';

/**
 * Check command - verify adoption status
 * @param {Object} options - Command options
 */
export async function checkCommand(options = {}) {
  const projectPath = process.cwd();
  const msg = t().commands.check;
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
    console.log(chalk.gray('  The .standards/manifest.json may be corrupted.'));
    console.log();
    return;
  }

  // Display adoption info
  const levelInfo = getLevelInfo(manifest.level);
  const repoInfo = getRepositoryInfo();

  console.log(chalk.green(msg.standardsInitialized));
  console.log();
  console.log(chalk.cyan(msg.adoptionStatus));
  const lang = getLanguage();
  const zhName = lang === 'zh-cn' ? levelInfo.nameZhCn : levelInfo.nameZh;
  const levelDisplay = lang === 'en'
    ? `${manifest.level} - ${levelInfo.name}`
    : `${manifest.level} - ${levelInfo.name} (${zhName})`;
  console.log(chalk.gray(`  ${common.level}: ${levelDisplay}`));
  console.log(chalk.gray(`  ${msg.installed}: ${manifest.upstream.installed}`));
  console.log(chalk.gray(`  ${common.version}: ${manifest.upstream.version}`));
  console.log();

  // Check for updates (bundled registry)
  if (manifest.upstream.version !== repoInfo.standards.version) {
    console.log(chalk.yellow(msg.updateAvailable.replace('{current}', manifest.upstream.version).replace('{latest}', repoInfo.standards.version)));
    console.log(chalk.gray(`  ${msg.runUpdate}`));
    console.log();
  }

  // Check for CLI updates from npm registry (unless --offline)
  if (!options.offline) {
    await checkCliVersion(repoInfo.standards.version);
  }

  // Handle --migrate option
  if (options.migrate) {
    await migrateToHashBasedTracking(projectPath, manifest);
    return;
  }

  // Check file integrity
  console.log(chalk.cyan(msg.fileIntegrity));

  const fileStatus = {
    unchanged: [],
    modified: [],
    missing: [],
    noHash: []
  };

  if (hasFileHashes(manifest)) {
    // Hash-based integrity check
    for (const [relativePath, hashInfo] of Object.entries(manifest.fileHashes)) {
      const fullPath = join(projectPath, relativePath);
      const status = compareFileHash(fullPath, hashInfo);

      switch (status) {
        case 'unchanged':
          fileStatus.unchanged.push(relativePath);
          break;
        case 'modified':
          fileStatus.modified.push(relativePath);
          break;
        case 'missing':
          fileStatus.missing.push(relativePath);
          break;
      }
    }
  } else {
    // Legacy manifest - existence check only
    console.log(chalk.gray(`  ${msg.hashNotAvailable}`));
    console.log(chalk.gray(`    ${msg.checkingExistence}`));
    console.log();

    // Check standards
    for (const std of manifest.standards) {
      const filePath = join(projectPath, '.standards', std.split('/').pop());
      if (existsSync(filePath)) {
        fileStatus.noHash.push(`.standards/${std.split('/').pop()}`);
      } else {
        fileStatus.missing.push(`.standards/${std.split('/').pop()}`);
      }
    }

    // Check extensions
    for (const ext of manifest.extensions) {
      const filePath = join(projectPath, '.standards', ext.split('/').pop());
      if (existsSync(filePath)) {
        fileStatus.noHash.push(`.standards/${ext.split('/').pop()}`);
      } else {
        fileStatus.missing.push(`.standards/${ext.split('/').pop()}`);
      }
    }

    // Check integrations
    for (const int of manifest.integrations) {
      const filePath = join(projectPath, int);
      if (existsSync(filePath)) {
        fileStatus.noHash.push(int);
      } else {
        fileStatus.missing.push(int);
      }
    }
  }

  // Display file status
  if (fileStatus.unchanged.length > 0) {
    for (const file of fileStatus.unchanged) {
      console.log(chalk.green(`  ✓ ${file} (${msg.unchanged})`));
    }
  }

  if (fileStatus.modified.length > 0) {
    for (const file of fileStatus.modified) {
      console.log(chalk.yellow(`  ⚠ ${file} (${msg.modified})`));
    }
  }

  if (fileStatus.missing.length > 0) {
    for (const file of fileStatus.missing) {
      console.log(chalk.red(`  ✗ ${file} (${msg.missing})`));
    }
  }

  if (fileStatus.noHash.length > 0) {
    for (const file of fileStatus.noHash) {
      console.log(chalk.gray(`  ? ${file} (${msg.existsNoHash})`));
    }
  }

  console.log();
  console.log(chalk.gray(`  ${msg.summary
    .replace('{unchanged}', fileStatus.unchanged.length)
    .replace('{modified}', fileStatus.modified.length)
    .replace('{missing}', fileStatus.missing.length)}` +
    (fileStatus.noHash.length > 0 ? `, ${fileStatus.noHash.length} no hash` : '')));
  console.log();

  // Handle --restore option
  if (options.restore) {
    await restoreFiles(projectPath, manifest, [...fileStatus.modified, ...fileStatus.missing]);
    return;
  }

  // Handle --restore-missing option
  if (options.restoreMissing) {
    await restoreFiles(projectPath, manifest, fileStatus.missing);
    return;
  }

  // Handle --diff option
  if (options.diff && fileStatus.modified.length > 0) {
    await showDiff(projectPath, manifest, fileStatus.modified);
    return;
  }

  // Interactive mode (default when issues detected)
  const hasIssues = fileStatus.modified.length > 0 ||
                    fileStatus.missing.length > 0;
  if (hasIssues && !options.noInteractive) {
    await interactiveMode(projectPath, manifest, fileStatus, msg);
  } else if (hasIssues) {
    // Non-interactive mode - just show suggestions
    console.log(chalk.yellow(msg.actionsAvailable));
    console.log(chalk.gray(`  ${msg.restoreOption}`));
    console.log(chalk.gray(`  ${msg.diffOption}`));
    console.log(chalk.gray(`  ${msg.interactiveOption}`));
    console.log();
  }

  // Suggest migration for legacy manifests
  if (fileStatus.noHash.length > 0 && !hasFileHashes(manifest)) {
    console.log(chalk.cyan(msg.tip));
    console.log(chalk.gray(`  ${msg.migrateTip}`));
    console.log(chalk.gray(`  ${msg.migrateTip2}`));
    console.log();
  }

  // Reference sync check
  checkReferenceSync(manifest, projectPath, msg);

  // Integration files check
  checkIntegrationFiles(manifest, projectPath, msg);

  // Skills status
  const { missingSkills, missingCommands } = displaySkillsStatus(manifest, projectPath, msg);

  // Coverage report
  displayCoverageReport(manifest, msg, common);

  // Final status
  const allGood = fileStatus.missing.length === 0 &&
                  fileStatus.modified.length === 0;
  if (allGood) {
    console.log(chalk.green(msg.projectCompliant));
  } else {
    console.log(chalk.yellow(msg.issuesDetected));
  }

  // Offer to install missing Skills/Commands if not in noInteractive mode
  if ((missingSkills.length > 0 || missingCommands.length > 0) && !options.noInteractive) {
    await promptSkillsCommandsInstallation(manifest, projectPath, missingSkills, missingCommands, msg);
  }

  console.log();
}

/**
 * Interactive mode for handling modified/missing files
 */
async function interactiveMode(projectPath, manifest, fileStatus, msg) {
  const allIssues = [
    ...fileStatus.modified.map(f => ({ file: f, status: 'modified' })),
    ...fileStatus.missing.map(f => ({ file: f, status: 'missing' }))
  ];

  console.log(chalk.cyan(msg.interactiveMode));
  console.log(chalk.gray(`  ${msg.filesNeedAttention.replace('{count}', allIssues.length)}`));
  console.log();

  let manifestUpdated = false;

  for (const issue of allIssues) {
    console.log(chalk.gray('─'.repeat(50)));
    if (issue.status === 'modified') {
      console.log(chalk.yellow(`⚠ ${msg.modifiedLabel}: ${issue.file}`));
    } else if (issue.status === 'missing') {
      console.log(chalk.red(`✗ ${msg.missingLabel}: ${issue.file}`));
    }

    let choices;
    if (issue.status === 'modified') {
      choices = [
        { name: msg.actionView, value: 'view' },
        { name: msg.actionRestore, value: 'restore' },
        { name: msg.actionKeep, value: 'keep' },
        { name: msg.actionSkip, value: 'skip' }
      ];
    } else {
      // missing
      choices = [
        { name: msg.actionRestoreMissing, value: 'restore' },
        { name: msg.actionRemove, value: 'remove' },
        { name: msg.actionSkip, value: 'skip' }
      ];
    }

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: msg.actionPrompt,
        choices
      }
    ]);

    switch (action) {
      case 'view': {
        await showSingleFileDiff(projectPath, manifest, issue.file, msg);
        // After viewing, ask again
        const { followUp } = await inquirer.prompt([
          {
            type: 'list',
            name: 'followUp',
            message: msg.followUpPrompt,
            choices: [
              { name: msg.actionRestore, value: 'restore' },
              { name: msg.actionKeep, value: 'keep' },
              { name: msg.actionSkip, value: 'skip' }
            ]
          }
        ]);
        if (followUp === 'restore') {
          await restoreSingleFile(projectPath, manifest, issue.file, msg);
          manifestUpdated = true;
        } else if (followUp === 'keep') {
          updateFileHash(projectPath, manifest, issue.file);
          manifestUpdated = true;
          console.log(chalk.green(msg.keepingCurrent));
        }
        break;
      }

      case 'restore':
        await restoreSingleFile(projectPath, manifest, issue.file, msg);
        manifestUpdated = true;
        break;

      case 'keep':
        updateFileHash(projectPath, manifest, issue.file);
        manifestUpdated = true;
        console.log(chalk.green(msg.keepingCurrent));
        break;

      case 'remove':
        removeFromManifest(manifest, issue.file);
        manifestUpdated = true;
        console.log(chalk.green(msg.removedFromManifest));
        break;

      case 'skip':
        console.log(chalk.gray(msg.skipped));
        break;
    }
    console.log();
  }

  if (manifestUpdated) {
    writeManifest(manifest, projectPath);
    console.log(chalk.green(msg.manifestUpdated));
    console.log();
  }
}

/**
 * Show diff for a single file
 */
async function showSingleFileDiff(projectPath, manifest, relativePath, msg) {
  const { readFileSync } = await import('fs');
  const fullPath = join(projectPath, relativePath);

  // Get current content
  let currentContent = '';
  try {
    currentContent = readFileSync(fullPath, 'utf-8');
  } catch {
    console.log(chalk.red(msg.couldNotReadFile));
    return;
  }

  // Get original content from GitHub
  const sourcePath = getSourcePathFromRelative(manifest, relativePath);
  if (!sourcePath) {
    console.log(chalk.red(msg.couldNotDetermineSource2));
    return;
  }

  console.log(chalk.gray(msg.fetchingOriginal));
  const originalContent = await downloadFromGitHub(sourcePath);
  if (!originalContent) {
    console.log(chalk.red(msg.couldNotFetchOriginal));
    return;
  }

  // Simple diff display
  console.log();
  console.log(chalk.cyan(msg.diffOriginal));
  console.log(chalk.yellow(msg.diffCurrent));
  console.log();

  const originalLines = originalContent.split('\n');
  const currentLines = currentContent.split('\n');

  // Simple line-by-line comparison
  const maxLines = Math.max(originalLines.length, currentLines.length);
  let diffCount = 0;

  for (let i = 0; i < maxLines; i++) {
    const orig = originalLines[i];
    const curr = currentLines[i];

    if (orig !== curr) {
      if (orig !== undefined) {
        console.log(chalk.red(`-${i + 1}: ${orig}`));
      }
      if (curr !== undefined) {
        console.log(chalk.green(`+${i + 1}: ${curr}`));
      }
      diffCount++;
      if (diffCount > 20) {
        console.log(chalk.gray(msg.diffTruncated));
        break;
      }
    }
  }
  console.log();
}

/**
 * Show diff for multiple files
 */
async function showDiff(projectPath, manifest, modifiedFiles) {
  const msg = t().commands.check;
  for (const file of modifiedFiles) {
    console.log(chalk.cyan(`\n${msg.diffFor.replace('{file}', file)}`));
    console.log(chalk.gray('─'.repeat(50)));
    await showSingleFileDiff(projectPath, manifest, file, msg);
  }
}

/**
 * Restore files from upstream
 */
async function restoreFiles(projectPath, manifest, files) {
  const msg = t().commands.check;
  console.log(chalk.cyan(msg.restoringFiles));
  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const success = await restoreSingleFile(projectPath, manifest, file, msg);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log();
  console.log(chalk.green(msg.restoredCount.replace('{count}', successCount)));
  if (errorCount > 0) {
    console.log(chalk.red(msg.restoreFailedCount.replace('{count}', errorCount)));
  }

  // Update manifest
  writeManifest(manifest, projectPath);
  console.log(chalk.gray(`  ${msg.manifestUpdatedShort}`));
  console.log();
}

/**
 * Restore a single file
 */
async function restoreSingleFile(projectPath, manifest, relativePath, msg) {
  // Get msg if not passed (for backward compatibility)
  if (!msg) {
    msg = t().commands.check;
  }

  const sourcePath = getSourcePathFromRelative(manifest, relativePath);
  if (!sourcePath) {
    console.log(chalk.red(`  ✗ ${relativePath}: ${msg.couldNotDetermineSource}`));
    return false;
  }

  // Determine target directory
  let targetDir = '.standards';
  if (relativePath.includes('options/')) {
    targetDir = '.standards/options';
  } else if (!relativePath.startsWith('.standards')) {
    // Integration file - copy to root
    const result = await copyIntegration(sourcePath, relativePath, projectPath);
    if (result.success) {
      updateFileHash(projectPath, manifest, relativePath);
      console.log(chalk.green(`  ✓ ${relativePath}: ${msg.restored}`));
      return true;
    } else {
      console.log(chalk.red(`  ✗ ${relativePath}: ${result.error}`));
      return false;
    }
  }

  const result = await copyStandard(sourcePath, targetDir, projectPath);
  if (result.success) {
    updateFileHash(projectPath, manifest, relativePath);
    console.log(chalk.green(`  ✓ ${relativePath}: ${msg.restored}`));
    return true;
  } else {
    console.log(chalk.red(`  ✗ ${relativePath}: ${result.error}`));
    return false;
  }
}

/**
 * Update file hash in manifest
 */
function updateFileHash(projectPath, manifest, relativePath) {
  const fullPath = join(projectPath, relativePath);
  const hashInfo = computeFileHash(fullPath);
  if (hashInfo) {
    if (!manifest.fileHashes) {
      manifest.fileHashes = {};
    }
    manifest.fileHashes[relativePath] = {
      ...hashInfo,
      installedAt: new Date().toISOString()
    };
  }
}

/**
 * Remove file from manifest tracking
 */
function removeFromManifest(manifest, relativePath) {
  // Remove from fileHashes
  if (manifest.fileHashes && manifest.fileHashes[relativePath]) {
    delete manifest.fileHashes[relativePath];
  }

  // Remove from standards/extensions/integrations arrays
  const fileName = basename(relativePath);
  manifest.standards = manifest.standards.filter(s => !s.endsWith(fileName));
  manifest.extensions = manifest.extensions.filter(e => !e.endsWith(fileName));
  manifest.integrations = manifest.integrations.filter(i => i !== relativePath);
}

/**
 * Get source path from relative path
 */
function getSourcePathFromRelative(manifest, relativePath) {
  const fileName = basename(relativePath);

  // Check standards
  for (const std of manifest.standards) {
    if (std.endsWith(fileName)) {
      return std;
    }
  }

  // Check extensions
  for (const ext of manifest.extensions) {
    if (ext.endsWith(fileName)) {
      return ext;
    }
  }

  // Check integrations - these might need special handling
  if (manifest.integrations.includes(relativePath)) {
    // Integration files have different source paths
    const integrationMappings = {
      '.cursorrules': 'integrations/cursor/.cursorrules',
      '.windsurfrules': 'integrations/windsurf/.windsurfrules',
      '.clinerules': 'integrations/cline/.clinerules',
      '.github/copilot-instructions.md': 'integrations/github-copilot/copilot-instructions.md',
      'CLAUDE.md': 'integrations/claude-code/CLAUDE.md'
    };
    return integrationMappings[relativePath] || null;
  }

  return null;
}

/**
 * Migrate legacy manifest to hash-based tracking
 */
async function migrateToHashBasedTracking(projectPath, manifest) {
  const msg = t().commands.check;
  console.log(chalk.cyan(msg.migratingToHash));
  console.log();

  const fileHashes = {};
  const now = new Date().toISOString();
  let count = 0;

  // Process standards
  for (const std of manifest.standards) {
    const fileName = basename(std);
    const relativePath = std.includes('options/')
      ? join('.standards', 'options', fileName)
      : join('.standards', fileName);
    const fullPath = join(projectPath, relativePath);

    const hashInfo = computeFileHash(fullPath);
    if (hashInfo) {
      fileHashes[relativePath] = { ...hashInfo, installedAt: now };
      count++;
    }
  }

  // Process extensions
  for (const ext of manifest.extensions) {
    const fileName = basename(ext);
    const relativePath = join('.standards', fileName);
    const fullPath = join(projectPath, relativePath);

    const hashInfo = computeFileHash(fullPath);
    if (hashInfo) {
      fileHashes[relativePath] = { ...hashInfo, installedAt: now };
      count++;
    }
  }

  // Process integrations
  for (const int of manifest.integrations) {
    const fullPath = join(projectPath, int);

    const hashInfo = computeFileHash(fullPath);
    if (hashInfo) {
      fileHashes[int] = { ...hashInfo, installedAt: now };
      count++;
    }
  }

  // Update manifest
  manifest.fileHashes = fileHashes;
  manifest.version = '3.1.0';
  writeManifest(manifest, projectPath);

  console.log(chalk.green(msg.migratedCount.replace('{count}', count)));
  console.log(chalk.gray(`  ${msg.manifestUpgraded}`));
  console.log();
}

/**
 * Display skills status and return missing Skills/Commands info
 * @returns {{missingSkills: Array, missingCommands: Array}}
 */
function displaySkillsStatus(manifest, projectPath, msg) {
  console.log(chalk.cyan(msg.skillsStatus));

  const aiTools = manifest.aiTools || [];
  const missingSkills = [];
  const missingCommands = [];

  // If no AI tools configured, show basic info
  if (aiTools.length === 0) {
    console.log(chalk.gray(`  ${msg.noAiToolsConfigured || 'No AI tools configured'}`));
    console.log();
    return { missingSkills, missingCommands };
  }

  // Check for Marketplace installation (Claude Code specific)
  const hasClaudeCode = aiTools.includes('claude-code');
  const location = manifest.skills?.location || '';
  const isMarketplace = location === 'marketplace' ||
    location.includes('plugins/cache') ||
    location.includes('plugins\\cache');

  if (isMarketplace && hasClaudeCode) {
    console.log(chalk.green(`  ${msg.skillsViaMarketplace}`));

    // Try to get actual version from marketplace
    const marketplaceInfo = getMarketplaceSkillsInfo();
    if (marketplaceInfo && marketplaceInfo.version && marketplaceInfo.version !== 'unknown') {
      console.log(chalk.gray(`    ${t().commands.common.version}: ${marketplaceInfo.version}`));
      if (marketplaceInfo.lastUpdated) {
        const updateDate = marketplaceInfo.lastUpdated.split('T')[0];
        console.log(chalk.gray(`    ${msg.lastUpdated}: ${updateDate}`));
      }
    } else {
      console.log(chalk.gray(`    ${t().commands.common.version}: (run /plugin list to check)`));
    }

    console.log(chalk.gray(`    ${msg.skillsManaged}`));
    console.log(chalk.gray(`    ${msg.skillsNotFileBased}`));
    console.log();
  }

  // Check each AI agent's Skills and Commands status
  for (const tool of aiTools) {
    const config = getAgentConfig(tool);
    if (!config) continue;

    const displayName = getAgentDisplayName(tool);
    console.log(chalk.cyan(`  ${displayName}:`));

    // Check Skills installation for this agent (both user and project level)
    const projectSkillsInfo = getInstalledSkillsInfoForAgent(tool, 'project', projectPath);
    const userSkillsInfo = getInstalledSkillsInfoForAgent(tool, 'user', projectPath);

    // Check if using marketplace for Claude Code
    const usingMarketplace = isMarketplace && tool === 'claude-code';

    if (projectSkillsInfo?.installed || userSkillsInfo?.installed || usingMarketplace) {
      console.log(chalk.green(`    ✓ Skills ${msg.installed || 'installed'}:`));
      if (userSkillsInfo?.installed) {
        console.log(chalk.gray(`      - ${msg.skillsGlobal || 'User level'}: ${userSkillsInfo.path}`));
        if (userSkillsInfo.version) {
          console.log(chalk.gray(`        ${t().commands.common.version}: ${userSkillsInfo.version}`));
        }
      }
      if (projectSkillsInfo?.installed) {
        console.log(chalk.gray(`      - ${msg.skillsProject || 'Project level'}: ${projectSkillsInfo.path}`));
        if (projectSkillsInfo.version) {
          console.log(chalk.gray(`        ${t().commands.common.version}: ${projectSkillsInfo.version}`));
        }
      }
    } else if (config.supportsSkills) {
      console.log(chalk.gray(`    ○ Skills: ${msg.notInstalled || 'Not installed'}`));
      if (config.fallbackSkillsPath) {
        // Check if can use fallback (Claude skills path)
        const fallbackPath = join(projectPath, config.fallbackSkillsPath);
        if (existsSync(fallbackPath)) {
          console.log(chalk.gray(`      ${msg.canUseFallback || 'Can use fallback'}: ${config.fallbackSkillsPath}`));
        }
      }
      // Track missing Skills
      missingSkills.push({
        agent: tool,
        displayName,
        paths: config.skills
      });
    }

    // Check Commands installation for this agent
    if (config.commands) {
      const commandsInfo = getInstalledCommandsForAgent(tool, projectPath);
      if (commandsInfo?.installed) {
        console.log(chalk.green(`    ✓ Commands: ${commandsInfo.count} ${msg.commandsInstalled || 'installed'}`));
        console.log(chalk.gray(`      ${msg.path || 'Path'}: ${commandsInfo.path}`));
        if (commandsInfo.version) {
          console.log(chalk.gray(`      ${t().commands.common.version}: ${commandsInfo.version}`));
        }
      } else {
        console.log(chalk.gray(`    ○ Commands: ${msg.notInstalled || 'Not installed'}`));
        // Track missing Commands
        missingCommands.push({
          agent: tool,
          displayName,
          path: config.commands.project
        });
      }
    }
  }

  // Show installations tracking from manifest (if using new format)
  if (manifest.skills?.installations?.length > 0) {
    console.log();
    console.log(chalk.gray(`  ${msg.trackedInstallations || 'Tracked installations'}:`));
    for (const inst of manifest.skills.installations) {
      console.log(chalk.gray(`    - ${inst.agent}: ${inst.level}`));
    }
  }

  if (manifest.commands?.installations?.length > 0) {
    console.log(chalk.gray(`  ${msg.trackedCommandInstallations || 'Tracked command installations'}:`));
    for (const agent of manifest.commands.installations) {
      console.log(chalk.gray(`    - ${agent}`));
    }
  }

  console.log();

  return { missingSkills, missingCommands };
}

/**
 * Prompt user to install missing Skills/Commands discovered during check
 * @param {Object} manifest - The manifest object
 * @param {string} projectPath - Project path
 * @param {Array} missingSkills - Array of {agent, displayName, paths}
 * @param {Array} missingCommands - Array of {agent, displayName, path}
 * @param {Object} msg - i18n messages
 * @returns {Promise<boolean>} - Whether anything was installed
 */
async function promptSkillsCommandsInstallation(manifest, projectPath, missingSkills, missingCommands, msg) {
  const repoInfo = getRepositoryInfo();
  let installedAnything = false;

  // Handle missing Skills with checkbox selection
  if (missingSkills.length > 0) {
    console.log();
    console.log(chalk.cyan('━'.repeat(50)));
    console.log(chalk.cyan.bold(msg.offerSkillsInstallation || 'Skills Installation'));
    console.log(chalk.cyan('━'.repeat(50)));
    console.log();

    // Build checkbox choices
    const skillChoices = missingSkills.map(skill => ({
      name: skill.displayName,
      value: skill.agent,
      checked: true  // Default checked for opt-out behavior
    }));

    // Add skip option
    skillChoices.push(new inquirer.Separator());
    skillChoices.push({
      name: chalk.gray(msg.skipInstallation || 'Skip'),
      value: '__skip__'
    });

    const { selectedSkillAgents } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selectedSkillAgents',
      message: msg.selectSkillsToInstall || 'Select AI tools to install Skills for:',
      choices: skillChoices,
      validate: (answer) => {
        if (answer.includes('__skip__') && answer.length > 1) {
          return t().commands.update.skipValidationError || 'Cannot select Skip with other options';
        }
        return true;
      }
    }]);

    const filteredSkillAgents = selectedSkillAgents.filter(a => a !== '__skip__');

    if (filteredSkillAgents.length > 0) {
      // Prompt for installation level
      const { skillsLevel } = await inquirer.prompt([{
        type: 'list',
        name: 'skillsLevel',
        message: t().commands.update.skillsLevelQuestion || 'Where should Skills be installed?',
        choices: [
          { name: `${t().commands.update.projectLevel || 'Project level'} (.claude/skills/, etc.)`, value: 'project' },
          { name: `${t().commands.update.userLevel || 'User level'} (~/.claude/skills/, etc.)`, value: 'user' }
        ],
        default: 'project'
      }]);

      // Install Skills
      const spinner = ora(t().commands.update.installingNewSkills || 'Installing Skills...').start();
      const skillResult = await installSkillsToMultipleAgents(
        filteredSkillAgents.map(agent => ({ agent, level: skillsLevel })),
        null,
        projectPath
      );

      // Update manifest
      if (!manifest.skills) manifest.skills = {};
      manifest.skills.installed = true;
      manifest.skills.version = repoInfo.skills.version;
      manifest.skills.installations = [
        ...(manifest.skills.installations || []),
        ...filteredSkillAgents.map(agent => ({ agent, level: skillsLevel }))
      ];

      if (skillResult.totalErrors === 0) {
        spinner.succeed((msg.skillsInstalledSuccess || 'Installed Skills for {count} AI tools')
          .replace('{count}', filteredSkillAgents.length));
      } else {
        spinner.warn((t().commands.update.newSkillsInstalledWithErrors || 'Installed Skills with {errors} errors')
          .replace('{errors}', skillResult.totalErrors));
      }

      installedAnything = true;
    }
  }

  // Handle missing Commands with checkbox selection
  if (missingCommands.length > 0) {
    console.log();
    console.log(chalk.cyan('━'.repeat(50)));
    console.log(chalk.cyan.bold(msg.offerCommandsInstallation || 'Commands Installation'));
    console.log(chalk.cyan('━'.repeat(50)));
    console.log();

    // Build checkbox choices
    const commandChoices = missingCommands.map(cmd => ({
      name: `${cmd.displayName} ${chalk.gray(`(${cmd.path})`)}`,
      value: cmd.agent,
      checked: true  // Default checked for opt-out behavior
    }));

    // Add skip option
    commandChoices.push(new inquirer.Separator());
    commandChoices.push({
      name: chalk.gray(msg.skipInstallation || 'Skip'),
      value: '__skip__'
    });

    const { selectedCommandAgents } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selectedCommandAgents',
      message: msg.selectCommandsToInstall || 'Select AI tools to install Commands for:',
      choices: commandChoices,
      validate: (answer) => {
        if (answer.includes('__skip__') && answer.length > 1) {
          return t().commands.update.skipValidationError || 'Cannot select Skip with other options';
        }
        return true;
      }
    }]);

    const filteredCommandAgents = selectedCommandAgents.filter(a => a !== '__skip__');

    if (filteredCommandAgents.length > 0) {
      const spinner = ora(t().commands.update.installingNewCommands || 'Installing commands...').start();
      const cmdResult = await installCommandsToMultipleAgents(
        filteredCommandAgents,
        null,
        projectPath
      );

      // Update manifest
      if (!manifest.commands) manifest.commands = {};
      manifest.commands.installed = true;
      manifest.commands.installations = [
        ...(manifest.commands.installations || []),
        ...filteredCommandAgents
      ];

      if (cmdResult.totalErrors === 0) {
        spinner.succeed((msg.commandsInstalledSuccess || 'Installed commands for {count} AI tools')
          .replace('{count}', filteredCommandAgents.length));
      } else {
        spinner.warn((t().commands.update.newCommandsInstalledWithErrors || 'Installed commands with {errors} errors')
          .replace('{errors}', cmdResult.totalErrors));
      }

      installedAnything = true;
    }
  }

  // Save manifest if anything was installed
  if (installedAnything) {
    writeManifest(manifest, projectPath);
  }

  return installedAnything;
}

/**
 * Display coverage report
 */
function displayCoverageReport(manifest, msg, _common) {
  console.log(chalk.cyan(msg.coverageSummary));
  const expectedStandards = getStandardsByLevel(manifest.level);
  const skillStandards = expectedStandards.filter(s => s.skillName);
  const refStandards = expectedStandards.filter(s => !s.skillName);

  console.log(chalk.gray(`  ${msg.levelRequires.replace('{level}', manifest.level).replace('{count}', expectedStandards.length)}`));
  console.log(chalk.gray(`    ${msg.withSkills.replace('{count}', skillStandards.length)}`));
  console.log(chalk.gray(`    ${msg.referenceDocs.replace('{count}', refStandards.length)}`));

  const coveredBySkills = manifest.skills.installed ? skillStandards.length : 0;
  const coveredByDocs = manifest.standards.length;

  console.log(chalk.gray(`  ${msg.yourCoverage}`));
  console.log(chalk.gray(`    ${msg.viaSkills.replace('{count}', coveredBySkills)}`));
  console.log(chalk.gray(`    ${msg.viaDocs.replace('{count}', coveredByDocs)}`));
  console.log();
}

/**
 * Check AI tool integration files for standards coverage
 */
function checkIntegrationFiles(manifest, projectPath, msg) {
  // Skip if no AI tools configured
  if (!manifest.aiTools || manifest.aiTools.length === 0) {
    return;
  }

  console.log(chalk.cyan(msg.aiToolIntegration));

  const standardsFiles = manifest.standards?.map(s => basename(s)) || [];
  let hasIssues = false;
  let checkedCount = 0;

  // Standard filename to task mapping for coverage check
  const STANDARD_TASK_MAPPING = {
    'anti-hallucination.md': 'AI collaboration',
    'commit-message.ai.yaml': 'Writing commits',
    'checkin-standards.md': 'Committing code',
    'logging-standards.md': 'Adding logging',
    'error-code-standards.md': 'Error handling',
    'testing.ai.yaml': 'Writing tests',
    'versioning.md': 'Version bumping',
    'changelog-standards.md': 'Updating changelog',
    'code-review-checklist.md': 'Code review',
    'spec-driven-development.md': 'Feature development',
    'test-completeness-dimensions.md': 'Test coverage',
    'git-workflow.ai.yaml': 'Git workflow'
  };

  for (const tool of manifest.aiTools) {
    const toolFile = getToolFilePath(tool);
    if (!toolFile) continue;

    const fullPath = join(projectPath, toolFile);

    // Check if file exists
    if (!existsSync(fullPath)) {
      console.log(chalk.red(`  ✗ ${toolFile}: ${msg.fileNotFound}`));
      hasIssues = true;
      continue;
    }

    checkedCount++;

    // Read file content
    let content;
    try {
      content = readFileSync(fullPath, 'utf-8');
    } catch {
      console.log(chalk.yellow(`  ⚠ ${toolFile}: ${msg.couldNotRead}`));
      continue;
    }

    // Check for standards index marker
    const format = getToolFormat(tool);
    const { content: markedContent } = extractMarkedContent(content, format);
    const hasStandardsIndex = markedContent.length > 0 ||
      content.includes('Standards Index') ||
      content.includes('Standards Compliance');

    // Count referenced standards
    const referencedStandards = [];
    const missingStandards = [];

    for (const stdFile of standardsFiles) {
      // Check if standard is referenced in the file
      const isReferenced = content.includes(stdFile) ||
        content.includes(`.standards/${stdFile}`) ||
        content.includes(`standards/${stdFile}`);

      if (isReferenced) {
        referencedStandards.push(stdFile);
      } else if (STANDARD_TASK_MAPPING[stdFile]) {
        // Only report as missing if it's a known trackable standard
        missingStandards.push(stdFile);
      }
    }

    // Report status
    const totalTrackable = Object.keys(STANDARD_TASK_MAPPING).filter(s =>
      standardsFiles.includes(s)
    ).length;

    if (hasStandardsIndex && missingStandards.length === 0) {
      console.log(chalk.green(`  ✓ ${toolFile}:`));
      console.log(chalk.gray(`    ${msg.standardsIndexPresent}`));
      console.log(chalk.gray(`    ${msg.standardsReferenced.replace('{count}', referencedStandards.length).replace('{total}', totalTrackable || standardsFiles.length)}`));
    } else if (hasStandardsIndex) {
      console.log(chalk.yellow(`  ⚠ ${toolFile}:`));
      console.log(chalk.gray(`    ${msg.standardsIndexPresent}`));
      console.log(chalk.yellow(`    ${msg.standardsReferenced.replace('{count}', referencedStandards.length).replace('{total}', totalTrackable)}`));
      if (missingStandards.length > 0 && missingStandards.length <= 5) {
        console.log(chalk.yellow(`    ${msg.missingStandardsList.replace('{list}', missingStandards.join(', '))}`));
      } else if (missingStandards.length > 5) {
        console.log(chalk.yellow(`    ${msg.missingStandardsList.replace('{list}', missingStandards.slice(0, 5).join(', ') + '...')}`));
      }
      hasIssues = true;
    } else {
      // No standards index - using minimal mode
      console.log(chalk.gray(`  ℹ ${toolFile}:`));
      console.log(chalk.gray(`    ${msg.usingMinimalMode}`));
      const coreRules = content.includes('Anti-Hallucination') ||
        content.includes('Commit') ||
        content.includes('Code Review');
      if (coreRules) {
        console.log(chalk.gray(`    ${msg.coreRulesEmbedded}`));
      }
    }
  }

  if (checkedCount === 0) {
    console.log(chalk.gray(`  ${msg.noAiToolFiles}`));
  }

  if (hasIssues) {
    console.log();
    console.log(chalk.yellow(`  ${msg.toFixIntegration}`));
    console.log(chalk.gray(`    ${msg.runUpdateToSync}`));
    console.log(chalk.gray(`    ${msg.runConfigureTools}`));
  }

  console.log();
}

/**
 * Check reference sync status between manifest standards and integration files
 */
function checkReferenceSync(manifest, projectPath, msg) {
  // Skip if no integrations
  if (!manifest.integrations || manifest.integrations.length === 0) {
    return;
  }

  console.log(chalk.cyan(msg.refSyncStatus));

  let hasIssues = false;
  let checkedCount = 0;

  for (const integrationPath of manifest.integrations) {
    const fullPath = join(projectPath, integrationPath);

    // Skip if file doesn't exist
    if (!existsSync(fullPath)) {
      continue;
    }

    // Read integration file content
    let content;
    try {
      content = readFileSync(fullPath, 'utf-8');
    } catch {
      console.log(chalk.yellow(`  ⚠ ${integrationPath}: ${msg.couldNotRead}`));
      continue;
    }

    // Parse references from integration file
    const references = parseReferences(content);

    // Skip if no references found (might be a static file or custom content)
    if (references.length === 0) {
      console.log(chalk.gray(`  ℹ ${integrationPath}: ${msg.noRefsFound}`));
      continue;
    }

    checkedCount++;

    // Compare with manifest standards
    const { orphanedRefs, missingRefs, syncedRefs } = compareStandardsWithReferences(
      manifest.standards,
      references
    );

    // Report results
    if (orphanedRefs.length > 0) {
      hasIssues = true;
      console.log(chalk.yellow(`  ⚠ ${integrationPath}:`));
      console.log(chalk.yellow(`    ${msg.refsNotInManifest}`));
      for (const ref of orphanedRefs) {
        console.log(chalk.yellow(`      - ${ref}`));
      }
    }

    if (missingRefs.length > 0) {
      // This is informational, not an error
      console.log(chalk.gray(`  ℹ ${integrationPath}:`));
      console.log(chalk.gray(`    ${msg.standardsNotReferenced}`));
      for (const ref of missingRefs) {
        console.log(chalk.gray(`      - ${ref}`));
      }
    }

    if (orphanedRefs.length === 0 && missingRefs.length === 0) {
      console.log(chalk.green(`  ✓ ${msg.refsInSync.replace('{path}', integrationPath).replace('{count}', syncedRefs.length)}`));
    }
  }

  if (checkedCount === 0) {
    console.log(chalk.gray(`  ${msg.noIntegrationRefs}`));
  }

  if (hasIssues) {
    console.log();
    console.log(chalk.yellow(`  ${msg.runSyncRefs}`));
  }

  console.log();
}

/**
 * Check CLI version against npm registry and display update info
 * @param {string} bundledVersion - Version bundled with current CLI
 */
async function checkCliVersion(bundledVersion) {
  const msg = t().commands.check;
  const spinner = ora({ text: msg.checkingCliUpdates, spinner: 'dots' }).start();

  try {
    const result = await checkForUpdates(bundledVersion, {
      includeBeta: bundledVersion.includes('-')
    });
    spinner.stop();

    if (result.offline) {
      console.log(chalk.gray(`  ${msg.couldNotCheckUpdates}`));
      console.log();
      return;
    }

    if (result.available) {
      console.log(chalk.cyan(msg.cliUpdateAvailable));
      console.log(chalk.gray(`  ${msg.currentCli}: ${result.currentVersion}`));
      console.log(chalk.gray(`  ${msg.latestOnNpm}: ${result.latestVersion}`));
      if (result.isCurrentBeta && result.latestStable) {
        console.log(chalk.gray(`  ${msg.latestStable}: ${result.latestStable}`));
      }
      console.log(chalk.yellow(`  ${msg.runNpmUpdate}`));
      console.log();
    }
  } catch {
    spinner.stop();
    // Silent failure - don't disrupt main functionality
  }
}
