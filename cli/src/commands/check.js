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
  hasFileHashes,
  compareIntegrationBlockHash
} from '../utils/hasher.js';
import { downloadFromGitHub, getMarketplaceSkillsInfo } from '../utils/github.js';
import {
  getInstalledSkillsInfoForAgent,
  getInstalledCommandsForAgent
} from '../utils/skills-installer.js';
import {
  getAgentConfig,
  getAgentDisplayName,
  getSkillsDirForAgent,
  getCommandsDirForAgent
} from '../config/ai-agent-paths.js';
import {
  parseReferences,
  compareStandardsWithReferences
} from '../utils/reference-sync.js';
import { extractMarkedContent, getToolFilePath } from '../utils/integration-generator.js';
import { getToolFormat } from '../core/constants.js';
import { checkForUpdates } from '../utils/npm-registry.js';
import { StandardValidator } from '../utils/standard-validator.js';
import { t, getLanguage, setLanguage, isLanguageExplicitlySet } from '../i18n/messages.js';

/**
 * Display the summary of file integrity status
 */
function displayFileIntegritySummary(fileStatus, msg) {
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
}

/**
 * Perform integrity check for standards and integration files
 * @returns {Object} File status object
 */
function performFileIntegrityCheck(projectPath, manifest, msg) {
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

  return fileStatus;
}

/**
 * Initialize context for the check command (manifest, language, messages)
 * @returns {Object|null} Context object or null if initialization failed
 */
function initializeCheckContext(projectPath) {
  // Get initial messages (before language is set from manifest)
  let common = t().commands.common;

  // Check if initialized
  if (!isInitialized(projectPath)) {
    console.log(chalk.red(common.notInitialized));
    console.log(chalk.gray(`  ${common.runInit}`));
    console.log();
    return null;
  }

  // Read manifest
  const manifest = readManifest(projectPath);
  if (!manifest) {
    console.log(chalk.red(common.couldNotReadManifest));
    console.log(chalk.gray('  The .standards/manifest.json may be corrupted.'));
    console.log();
    return null;
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

  // Re-get localized messages with correct language
  return {
    manifest,
    repoInfo: getRepositoryInfo(),
    msg: t().commands.check,
    common: t().commands.common
  };
}

/**
 * Display standards adoption status and update information
 */
function displayAdoptionStatus(manifest, msg, common, repoInfo) {
  const levelInfo = getLevelInfo(manifest.level);

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
}

/**
 * Check command - verify adoption status
 * @param {Object} options - Command options
 */
export async function checkCommand(options = {}) {
  const projectPath = process.cwd();

  // Handle --standard option (validate specific standard physical spec)
  if (options.standard) {
    const validator = new StandardValidator(projectPath);
    const result = await validator.validate(options.standard);
    
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      // Optionally exit with 1 if failed, but ensure JSON is printed first
      if (!result.success) process.exitCode = 1;
      return;
    }

    console.log();
    console.log(chalk.bold(`Checking compliance with standard: ${options.standard}`));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (result.success) {
      if (result.skipped) {
        console.log(chalk.yellow(`⚠  ${result.message}`));
      } else {
        console.log(chalk.green('✓  Validation Passed'));
        console.log(chalk.gray(`   ${result.message}`));
        if (result.details) console.log(chalk.gray(`   ${result.details}`));
      }
    } else {
      console.log(chalk.red('✗  Validation Failed'));
      console.log(chalk.red(`   ${result.message}`));
      if (result.details) console.log(chalk.gray(`   ${result.details}`));
      process.exitCode = 1;
    }
    console.log();
    return;
  }

  // Handle --summary option (compact status for other commands)
  if (options.summary) {
    await displaySummary(projectPath, options);
    return;
  }

  // Phase 0: Initialization
  const context = initializeCheckContext(projectPath);
  if (!context) return;

  const { manifest, msg, common, repoInfo } = context;

  console.log();
  console.log(chalk.bold(msg.title));
  console.log(chalk.gray('─'.repeat(50)));

  // Display adoption info
  displayAdoptionStatus(manifest, msg, common, repoInfo);

  // Check for CLI updates from npm registry (unless --offline)

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
  const fileStatus = performFileIntegrityCheck(projectPath, manifest, msg);

  // Display file status
  displayFileIntegritySummary(fileStatus, msg);

  // === Enhanced Integrity Checks (v3.3.0+) ===

  // === Enhanced Integrity Checks (v3.3.0+) ===

  // Check Skills integrity if skillHashes exist
  checkSkillsIntegrity(manifest, projectPath, msg);

  // Check Commands integrity if commandHashes exist
  checkCommandsIntegrity(manifest, projectPath, msg);

  // Check Integration blocks integrity if integrationBlockHashes exist
  checkIntegrationBlocksIntegrity(manifest, projectPath, msg);

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
  displayCoverageReport(manifest, msg, common, projectPath);

  // Final status
  const allGood = fileStatus.missing.length === 0 &&
                  fileStatus.modified.length === 0;
  if (allGood) {
    console.log(chalk.green(msg.projectCompliant));
  } else {
    console.log(chalk.yellow(msg.issuesDetected));
  }

  // Show hint if Skills/Commands are missing (check is read-only, no installation)
  if (missingSkills.length > 0 || missingCommands.length > 0) {
    console.log();
    console.log(chalk.cyan(msg.missingSkillsHint || 'Tip: Run `uds update` to install missing Skills/Commands'));
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
  // Dynamically detect marketplace installation regardless of manifest
  const hasClaudeCode = aiTools.includes('claude-code');
  const marketplaceInfo = getMarketplaceSkillsInfo();
  const hasMarketplaceSkills = marketplaceInfo?.installed;

  const location = manifest.skills?.location || '';
  const isMarketplaceInManifest = location === 'marketplace' ||
    location.includes('plugins/cache') ||
    location.includes('plugins\\cache');

  // Show marketplace status if actually installed (not just manifest)
  if (hasMarketplaceSkills && hasClaudeCode) {
    console.log(chalk.green(`  ${msg.skillsViaMarketplace}`));

    if (marketplaceInfo.version && marketplaceInfo.version !== 'unknown') {
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
    const usingMarketplace = (hasMarketplaceSkills || isMarketplaceInManifest) && tool === 'claude-code';

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

    // Check Commands installation for this agent (check both project and user levels)
    if (config.commands) {
      const projectCmdInfo = getInstalledCommandsForAgent(tool, 'project', projectPath);
      const userCmdInfo = getInstalledCommandsForAgent(tool, 'user');
      const commandsInfo = projectCmdInfo || userCmdInfo;
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
    for (const inst of manifest.commands.installations) {
      console.log(chalk.gray(`    - ${inst.agent}: ${inst.level}`));
    }
  }

  console.log();

  return { missingSkills, missingCommands };
}

/**
 * Display coverage report
 */
function displayCoverageReport(manifest, msg, _common, projectPath) {
  console.log(chalk.cyan(msg.coverageSummary));
  const expectedStandards = getStandardsByLevel(manifest.level);
  const skillStandards = expectedStandards.filter(s => s.skillName);
  const refStandards = expectedStandards.filter(s => !s.skillName);

  console.log(chalk.gray(`  ${msg.levelRequires.replace('{level}', manifest.level).replace('{count}', expectedStandards.length)}`));
  console.log(chalk.gray(`    ${msg.withSkills.replace('{count}', skillStandards.length)}`));
  console.log(chalk.gray(`    ${msg.referenceDocs.replace('{count}', refStandards.length)}`));

  // Dynamically check if any AI tool has skills installed
  let hasInstalledSkills = false;
  if (manifest.aiTools && manifest.aiTools.length > 0) {
    for (const tool of manifest.aiTools) {
      const projectSkillsInfo = getInstalledSkillsInfoForAgent(tool, 'project', projectPath);
      const userSkillsInfo = getInstalledSkillsInfoForAgent(tool, 'user', projectPath);
      if (projectSkillsInfo?.installed || userSkillsInfo?.installed) {
        hasInstalledSkills = true;
        break;
      }
    }
  }
  const coveredBySkills = hasInstalledSkills ? skillStandards.length : 0;
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
      } else {
        // Track all installed standards from manifest
        missingStandards.push(stdFile);
      }
    }

    // Report status - use all installed standards as the total
    const totalTrackable = standardsFiles.length;

    if (hasStandardsIndex && missingStandards.length === 0) {
      console.log(chalk.green(`  ✓ ${toolFile}:`));
      console.log(chalk.gray(`    ${msg.standardsIndexPresent}`));
      console.log(chalk.gray(`    ${msg.standardsReferenced.replace('{count}', referencedStandards.length).replace('{total}', totalTrackable)}`));
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

// ============================================================
// Enhanced Integrity Check Functions (v3.3.0+)
// ============================================================

/**
 * Check Skills files integrity against stored hashes
 * @param {Object} manifest - Manifest object
 * @param {string} projectPath - Project root path
 * @param {Object} msg - Localized messages
 * @returns {Object} Status { unchanged: [], modified: [], missing: [] }
 */
function checkSkillsIntegrity(manifest, projectPath, msg) {
  const skillHashes = manifest.skillHashes;

  // Skip if no skill hashes tracked
  if (!skillHashes || Object.keys(skillHashes).length === 0) {
    return { unchanged: [], modified: [], missing: [], tracked: false };
  }

  console.log(chalk.cyan(msg.skillsIntegrityCheck || 'Skills File Integrity'));

  const status = { unchanged: [], modified: [], missing: [], tracked: true };

  for (const [hashKey, hashInfo] of Object.entries(skillHashes)) {
    // Parse key format: agent/level/skillName/filename
    const keyParts = hashKey.split('/');
    if (keyParts.length < 3) continue;

    const [agent, level] = keyParts;
    const relativePath = keyParts.slice(2).join('/');

    // Get actual file path
    const skillsDir = getSkillsDirForAgent(agent, level, projectPath);
    if (!skillsDir) {
      status.missing.push(hashKey);
      continue;
    }

    const fullPath = join(skillsDir, relativePath);

    if (!existsSync(fullPath)) {
      status.missing.push(hashKey);
      console.log(chalk.red(`  ✗ ${hashKey} (${msg.missing || 'missing'})`));
      continue;
    }

    // Compare hash
    const currentHash = computeFileHash(fullPath);
    if (!currentHash) {
      status.missing.push(hashKey);
      continue;
    }

    if (currentHash.hash === hashInfo.hash && currentHash.size === hashInfo.size) {
      status.unchanged.push(hashKey);
    } else {
      status.modified.push(hashKey);
      console.log(chalk.yellow(`  ⚠ ${hashKey} (${msg.modified || 'modified'})`));
    }
  }

  // Summary
  if (status.modified.length === 0 && status.missing.length === 0) {
    console.log(chalk.green(`  ✓ ${msg.allSkillsIntact || 'All skill files intact'} (${status.unchanged.length} files)`));
  } else {
    console.log(chalk.gray(`  ${(msg.skillsIntegritySummary || '{unchanged} unchanged, {modified} modified, {missing} missing')
      .replace('{unchanged}', status.unchanged.length)
      .replace('{modified}', status.modified.length)
      .replace('{missing}', status.missing.length)}`));
  }

  console.log();
  return status;
}

/**
 * Check Commands files integrity against stored hashes
 * @param {Object} manifest - Manifest object
 * @param {string} projectPath - Project root path
 * @param {Object} msg - Localized messages
 * @returns {Object} Status { unchanged: [], modified: [], missing: [] }
 */
function checkCommandsIntegrity(manifest, projectPath, msg) {
  const commandHashes = manifest.commandHashes;

  // Skip if no command hashes tracked
  if (!commandHashes || Object.keys(commandHashes).length === 0) {
    return { unchanged: [], modified: [], missing: [], tracked: false };
  }

  console.log(chalk.cyan(msg.commandsIntegrityCheck || 'Commands File Integrity'));

  const status = { unchanged: [], modified: [], missing: [], tracked: true };

  for (const [hashKey, hashInfo] of Object.entries(commandHashes)) {
    // Parse key format: agent/filename.md
    const keyParts = hashKey.split('/');
    if (keyParts.length < 2) continue;

    const agent = keyParts[0];
    const filename = keyParts.slice(1).join('/');

    // Get actual file path
    const commandsDir = getCommandsDirForAgent(agent, 'project', projectPath);
    if (!commandsDir) {
      status.missing.push(hashKey);
      continue;
    }

    const fullPath = join(commandsDir, filename);

    if (!existsSync(fullPath)) {
      status.missing.push(hashKey);
      console.log(chalk.red(`  ✗ ${hashKey} (${msg.missing || 'missing'})`));
      continue;
    }

    // Compare hash
    const currentHash = computeFileHash(fullPath);
    if (!currentHash) {
      status.missing.push(hashKey);
      continue;
    }

    if (currentHash.hash === hashInfo.hash && currentHash.size === hashInfo.size) {
      status.unchanged.push(hashKey);
    } else {
      status.modified.push(hashKey);
      console.log(chalk.yellow(`  ⚠ ${hashKey} (${msg.modified || 'modified'})`));
    }
  }

  // Summary
  if (status.modified.length === 0 && status.missing.length === 0) {
    console.log(chalk.green(`  ✓ ${msg.allCommandsIntact || 'All command files intact'} (${status.unchanged.length} files)`));
  } else {
    console.log(chalk.gray(`  ${(msg.commandsIntegritySummary || '{unchanged} unchanged, {modified} modified, {missing} missing')
      .replace('{unchanged}', status.unchanged.length)
      .replace('{modified}', status.modified.length)
      .replace('{missing}', status.missing.length)}`));
  }

  console.log();
  return status;
}

/**
 * Check Integration files' UDS block integrity against stored hashes
 * Only checks the UDS marker block content, not user customizations outside the block
 * @param {Object} manifest - Manifest object
 * @param {string} projectPath - Project root path
 * @param {Object} msg - Localized messages
 * @returns {Object} Status { unchanged: [], modified: [], missing: [], noMarkers: [] }
 */
function checkIntegrationBlocksIntegrity(manifest, projectPath, msg) {
  const blockHashes = manifest.integrationBlockHashes;

  // Skip if no block hashes tracked
  if (!blockHashes || Object.keys(blockHashes).length === 0) {
    return { unchanged: [], modified: [], missing: [], noMarkers: [], tracked: false };
  }

  console.log(chalk.cyan(msg.integrationBlocksCheck || 'Integration UDS Block Integrity'));

  const status = { unchanged: [], modified: [], missing: [], noMarkers: [], tracked: true };

  for (const [filePath, hashInfo] of Object.entries(blockHashes)) {
    const fullPath = join(projectPath, filePath);

    if (!existsSync(fullPath)) {
      status.missing.push(filePath);
      console.log(chalk.red(`  ✗ ${filePath} (${msg.missing || 'missing'})`));
      continue;
    }

    // Compare block hash
    const blockStatus = compareIntegrationBlockHash(fullPath, hashInfo);

    switch (blockStatus) {
      case 'unchanged':
        status.unchanged.push(filePath);
        break;
      case 'modified':
        status.modified.push(filePath);
        console.log(chalk.yellow(`  ⚠ ${filePath} (${msg.udsBlockModified || 'UDS block modified'})`));
        break;
      case 'no_markers':
        status.noMarkers.push(filePath);
        console.log(chalk.red(`  ✗ ${filePath} (${msg.udsMarkersRemoved || 'UDS markers removed'})`));
        break;
      case 'missing':
        status.missing.push(filePath);
        console.log(chalk.red(`  ✗ ${filePath} (${msg.missing || 'missing'})`));
        break;
    }
  }

  // Summary
  if (status.modified.length === 0 && status.missing.length === 0 && status.noMarkers.length === 0) {
    console.log(chalk.green(`  ✓ ${msg.allBlocksIntact || 'All UDS blocks intact'} (${status.unchanged.length} files)`));
    console.log(chalk.gray(`    ${msg.userContentPreserved || 'User customizations outside UDS blocks are preserved'}`));
  } else {
    console.log(chalk.gray(`  ${(msg.blocksIntegritySummary || '{unchanged} intact, {modified} modified, {missing} missing')
      .replace('{unchanged}', status.unchanged.length)
      .replace('{modified}', status.modified.length)
      .replace('{missing}', status.missing.length + status.noMarkers.length)}`));

    if (status.modified.length > 0 || status.noMarkers.length > 0) {
      console.log(chalk.yellow(`    ${msg.runUpdateIntegrations || 'Run "uds update --integrations-only" to restore UDS content'}`));
    }
  }

  console.log();
  return status;
}

// ============================================================
// Summary Mode (--summary)
// ============================================================

/**
 * Display compact status summary for use by other commands
 * @param {string} projectPath - Project root path
 * @param {Object} options - Command options
 */
async function displaySummary(projectPath, _options = {}) {
  const msg = t().commands.check;
  const common = t().commands.common;
  const summaryMsg = msg.summary_mode || {};

  console.log();
  console.log(chalk.bold(summaryMsg.title || 'UDS Status Summary'));
  console.log(chalk.gray('─'.repeat(50)));

  // Check if initialized
  if (!isInitialized(projectPath)) {
    console.log(chalk.red(`  ${summaryMsg.notInitialized || 'Not initialized'}`));
    console.log(chalk.gray(`  ${common.runInit}`));
    console.log(chalk.gray('─'.repeat(50)));
    console.log();
    return;
  }

  // Read manifest
  const manifest = readManifest(projectPath);
  if (!manifest) {
    console.log(chalk.red(`  ${summaryMsg.manifestError || 'Manifest error'}`));
    console.log(chalk.gray('─'.repeat(50)));
    console.log();
    return;
  }

  const levelInfo = getLevelInfo(manifest.level);
  const repoInfo = getRepositoryInfo();
  const lang = getLanguage();

  // === Row 1: Version ===
  const currentVersion = manifest.upstream.version;
  const latestVersion = repoInfo.standards.version;
  const hasUpdate = currentVersion !== latestVersion;

  if (hasUpdate) {
    console.log(chalk.yellow(`  ${summaryMsg.version || 'Version'}: ${currentVersion} → ${latestVersion} ⚠`));
  } else {
    console.log(chalk.green(`  ${summaryMsg.version || 'Version'}: ${currentVersion} ✓`));
  }

  // === Row 2: Level ===
  const zhName = lang === 'zh-cn' ? levelInfo.nameZhCn : levelInfo.nameZh;
  const levelDisplay = lang === 'en'
    ? `${manifest.level} - ${levelInfo.name}`
    : `${manifest.level} - ${levelInfo.name} (${zhName})`;
  console.log(chalk.gray(`  ${summaryMsg.level || 'Level'}: ${levelDisplay}`));

  // === Row 3: Files Status ===
  const fileStatus = getFileStatusCounts(manifest, projectPath);
  const filesOk = fileStatus.modified === 0 && fileStatus.missing === 0;
  const filesDisplay = filesOk
    ? chalk.green(`${fileStatus.unchanged} ✓`)
    : `${chalk.green(fileStatus.unchanged + ' ✓')} ${chalk.yellow('| ' + fileStatus.modified + ' modified')} ${chalk.red('| ' + fileStatus.missing + ' missing')}`;
  console.log(`  ${summaryMsg.files || 'Files'}: ${filesDisplay}`);

  // === Row 4: Skills Status ===
  const aiTools = manifest.aiTools || [];
  if (aiTools.length > 0) {
    const skillsStatus = getSkillsStatusSummary(manifest, projectPath);
    console.log(`  ${summaryMsg.skills || 'Skills'}: ${skillsStatus}`);
  }

  // === Row 5: Commands Status (if applicable) ===
  const commandsStatus = getCommandsStatusSummary(manifest, projectPath);
  if (commandsStatus) {
    console.log(`  ${summaryMsg.commands || 'Commands'}: ${commandsStatus}`);
  }

  console.log(chalk.gray('─'.repeat(50)));
  console.log();
}

/**
 * Get file status counts without logging
 * @param {Object} manifest - Manifest object
 * @param {string} projectPath - Project root path
 * @returns {{unchanged: number, modified: number, missing: number}}
 */
function getFileStatusCounts(manifest, projectPath) {
  const counts = { unchanged: 0, modified: 0, missing: 0 };

  if (hasFileHashes(manifest)) {
    for (const [relativePath, hashInfo] of Object.entries(manifest.fileHashes)) {
      const fullPath = join(projectPath, relativePath);
      const status = compareFileHash(fullPath, hashInfo);

      switch (status) {
        case 'unchanged':
          counts.unchanged++;
          break;
        case 'modified':
          counts.modified++;
          break;
        case 'missing':
          counts.missing++;
          break;
      }
    }
  } else {
    // Legacy manifest - existence check only
    const allFiles = [
      ...manifest.standards.map(s => `.standards/${basename(s)}`),
      ...manifest.extensions.map(e => `.standards/${basename(e)}`),
      ...manifest.integrations
    ];
    for (const relativePath of allFiles) {
      const fullPath = join(projectPath, relativePath);
      if (existsSync(fullPath)) {
        counts.unchanged++;
      } else {
        counts.missing++;
      }
    }
  }

  return counts;
}

/**
 * Get skills status summary string
 * @param {Object} manifest - Manifest object
 * @param {string} projectPath - Project root path
 * @returns {string} Formatted skills status
 */
function getSkillsStatusSummary(manifest, projectPath) {
  const aiTools = manifest.aiTools || [];
  const parts = [];

  // Check for Marketplace installation (Claude Code specific)
  // Dynamically detect marketplace installation regardless of manifest
  const marketplaceInfo = getMarketplaceSkillsInfo();
  const hasMarketplaceSkills = marketplaceInfo?.installed;

  const location = manifest.skills?.location || '';
  const isMarketplaceInManifest = location === 'marketplace' ||
    location.includes('plugins/cache') ||
    location.includes('plugins\\cache');

  for (const tool of aiTools) {
    const config = getAgentConfig(tool);
    if (!config || !config.supportsSkills) continue;

    const displayName = getAgentDisplayName(tool);
    const usingMarketplace = (hasMarketplaceSkills || isMarketplaceInManifest) && tool === 'claude-code';

    if (usingMarketplace) {
      parts.push(chalk.green(`${displayName} ✓`));
      continue;
    }

    const projectSkillsInfo = getInstalledSkillsInfoForAgent(tool, 'project', projectPath);
    const userSkillsInfo = getInstalledSkillsInfoForAgent(tool, 'user', projectPath);

    if (projectSkillsInfo?.installed || userSkillsInfo?.installed) {
      parts.push(chalk.green(`${displayName} ✓`));
    } else {
      parts.push(chalk.gray(`${displayName} ○`));
    }
  }

  return parts.join(' | ') || chalk.gray('None configured');
}

/**
 * Get commands status summary string
 * @param {Object} manifest - Manifest object
 * @param {string} projectPath - Project root path
 * @returns {string|null} Formatted commands status or null if no tools support commands
 */
function getCommandsStatusSummary(manifest, projectPath) {
  const aiTools = manifest.aiTools || [];
  const parts = [];

  for (const tool of aiTools) {
    const config = getAgentConfig(tool);
    if (!config || !config.commands) continue;

    const displayName = getAgentDisplayName(tool);
    // Check both project and user levels
    const projectCmdInfo = getInstalledCommandsForAgent(tool, 'project', projectPath);
    const userCmdInfo = getInstalledCommandsForAgent(tool, 'user');
    const commandsInfo = projectCmdInfo || userCmdInfo;

    if (commandsInfo?.installed) {
      parts.push(chalk.green(`${displayName} ✓`));
    } else {
      parts.push(chalk.gray(`${displayName} ○`));
    }
  }

  return parts.length > 0 ? parts.join(' | ') : null;
}
