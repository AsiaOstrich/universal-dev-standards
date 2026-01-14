import chalk from 'chalk';
import inquirer from 'inquirer';
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
  parseReferences,
  compareStandardsWithReferences
} from '../utils/reference-sync.js';
import {
  getToolFilePath,
  getToolFormat,
  extractMarkedContent
} from '../utils/integration-generator.js';

/**
 * Check command - verify adoption status
 * @param {Object} options - Command options
 */
export async function checkCommand(options = {}) {
  const projectPath = process.cwd();

  console.log();
  console.log(chalk.bold('Universal Documentation Standards - Check'));
  console.log(chalk.gray('─'.repeat(50)));

  // Check if initialized
  if (!isInitialized(projectPath)) {
    console.log(chalk.red('✗ Standards not initialized in this project.'));
    console.log(chalk.gray('  Run `uds init` to initialize.'));
    console.log();
    return;
  }

  // Read manifest
  const manifest = readManifest(projectPath);
  if (!manifest) {
    console.log(chalk.red('✗ Could not read manifest file.'));
    console.log(chalk.gray('  The .standards/manifest.json may be corrupted.'));
    console.log();
    return;
  }

  // Display adoption info
  const levelInfo = getLevelInfo(manifest.level);
  const repoInfo = getRepositoryInfo();

  console.log(chalk.green('✓ Standards initialized'));
  console.log();
  console.log(chalk.cyan('Adoption Status:'));
  console.log(chalk.gray(`  Level: ${manifest.level} - ${levelInfo.name} (${levelInfo.nameZh})`));
  console.log(chalk.gray(`  Installed: ${manifest.upstream.installed}`));
  console.log(chalk.gray(`  Version: ${manifest.upstream.version}`));
  console.log();

  // Check for updates
  if (manifest.upstream.version !== repoInfo.standards.version) {
    console.log(chalk.yellow(`⚠ Update available: ${manifest.upstream.version} → ${repoInfo.standards.version}`));
    console.log(chalk.gray('  Run `uds update` to update.'));
    console.log();
  }

  // Handle --migrate option
  if (options.migrate) {
    await migrateToHashBasedTracking(projectPath, manifest);
    return;
  }

  // Check file integrity
  console.log(chalk.cyan('File Integrity:'));

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
    console.log(chalk.gray('  ℹ Hash information not available (legacy manifest).'));
    console.log(chalk.gray('    Checking file existence only...'));
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
      console.log(chalk.green(`  ✓ ${file} (unchanged)`));
    }
  }

  if (fileStatus.modified.length > 0) {
    for (const file of fileStatus.modified) {
      console.log(chalk.yellow(`  ⚠ ${file} (modified)`));
    }
  }

  if (fileStatus.missing.length > 0) {
    for (const file of fileStatus.missing) {
      console.log(chalk.red(`  ✗ ${file} (missing)`));
    }
  }

  if (fileStatus.noHash.length > 0) {
    for (const file of fileStatus.noHash) {
      console.log(chalk.gray(`  ? ${file} (exists, no hash)`));
    }
  }

  console.log();
  console.log(chalk.gray(`  Summary: ${fileStatus.unchanged.length} unchanged, ` +
    `${fileStatus.modified.length} modified, ${fileStatus.missing.length} missing` +
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
    await interactiveMode(projectPath, manifest, fileStatus);
  } else if (hasIssues) {
    // Non-interactive mode - just show suggestions
    console.log(chalk.yellow('Actions available:'));
    console.log(chalk.gray('  • Run `uds check --restore` to restore all modified/missing files'));
    console.log(chalk.gray('  • Run `uds check --diff` to view changes'));
    console.log(chalk.gray('  • Run `uds check --interactive` for file-by-file decisions'));
    console.log();
  }

  // Suggest migration for legacy manifests
  if (fileStatus.noHash.length > 0 && !hasFileHashes(manifest)) {
    console.log(chalk.cyan('Tip:'));
    console.log(chalk.gray('  Run `uds check --migrate` to enable hash-based integrity checking.'));
    console.log(chalk.gray('  This will compute hashes for all existing files.'));
    console.log();
  }

  // Reference sync check
  checkReferenceSync(manifest, projectPath);

  // Integration files check
  checkIntegrationFiles(manifest, projectPath);

  // Skills status
  displaySkillsStatus(manifest, projectPath);

  // Coverage report
  displayCoverageReport(manifest);

  // Final status
  const allGood = fileStatus.missing.length === 0 &&
                  fileStatus.modified.length === 0;
  if (allGood) {
    console.log(chalk.green('✓ Project is compliant with standards'));
  } else {
    console.log(chalk.yellow('⚠ Some issues detected. Review above for details.'));
  }
  console.log();
}

/**
 * Interactive mode for handling modified/missing files
 */
async function interactiveMode(projectPath, manifest, fileStatus) {
  const allIssues = [
    ...fileStatus.modified.map(f => ({ file: f, status: 'modified' })),
    ...fileStatus.missing.map(f => ({ file: f, status: 'missing' }))
  ];

  console.log(chalk.cyan('Interactive Mode:'));
  console.log(chalk.gray(`  ${allIssues.length} file(s) need attention.`));
  console.log();

  let manifestUpdated = false;

  for (const issue of allIssues) {
    console.log(chalk.gray('─'.repeat(50)));
    if (issue.status === 'modified') {
      console.log(chalk.yellow(`⚠ Modified: ${issue.file}`));
    } else if (issue.status === 'missing') {
      console.log(chalk.red(`✗ Missing: ${issue.file}`));
    }

    let choices;
    if (issue.status === 'modified') {
      choices = [
        { name: 'view    - View diff between current and original', value: 'view' },
        { name: 'restore - Restore to original version', value: 'restore' },
        { name: 'keep    - Keep current version (update hash in manifest)', value: 'keep' },
        { name: 'skip    - Skip this file for now', value: 'skip' }
      ];
    } else {
      // missing
      choices = [
        { name: 'restore - Download and restore file', value: 'restore' },
        { name: 'remove  - Remove from manifest (no longer track)', value: 'remove' },
        { name: 'skip    - Skip this file for now', value: 'skip' }
      ];
    }

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices
      }
    ]);

    switch (action) {
      case 'view': {
        await showSingleFileDiff(projectPath, manifest, issue.file);
        // After viewing, ask again
        const { followUp } = await inquirer.prompt([
          {
            type: 'list',
            name: 'followUp',
            message: 'What would you like to do now?',
            choices: [
              { name: 'restore - Restore to original version', value: 'restore' },
              { name: 'keep    - Keep current version (update hash)', value: 'keep' },
              { name: 'skip    - Skip this file for now', value: 'skip' }
            ]
          }
        ]);
        if (followUp === 'restore') {
          await restoreSingleFile(projectPath, manifest, issue.file);
          manifestUpdated = true;
        } else if (followUp === 'keep') {
          updateFileHash(projectPath, manifest, issue.file);
          manifestUpdated = true;
          console.log(chalk.green('✓ Keeping current version. Hash updated.'));
        }
        break;
      }

      case 'restore':
        await restoreSingleFile(projectPath, manifest, issue.file);
        manifestUpdated = true;
        break;

      case 'keep':
        updateFileHash(projectPath, manifest, issue.file);
        manifestUpdated = true;
        console.log(chalk.green('✓ Keeping current version. Hash updated.'));
        break;

      case 'remove':
        removeFromManifest(manifest, issue.file);
        manifestUpdated = true;
        console.log(chalk.green('✓ Removed from manifest.'));
        break;

      case 'skip':
        console.log(chalk.gray('Skipped.'));
        break;
    }
    console.log();
  }

  if (manifestUpdated) {
    writeManifest(manifest, projectPath);
    console.log(chalk.green('✓ Manifest updated.'));
    console.log();
  }
}

/**
 * Show diff for a single file
 */
async function showSingleFileDiff(projectPath, manifest, relativePath) {
  const { readFileSync } = await import('fs');
  const fullPath = join(projectPath, relativePath);

  // Get current content
  let currentContent = '';
  try {
    currentContent = readFileSync(fullPath, 'utf-8');
  } catch {
    console.log(chalk.red('Could not read current file.'));
    return;
  }

  // Get original content from GitHub
  const sourcePath = getSourcePathFromRelative(manifest, relativePath);
  if (!sourcePath) {
    console.log(chalk.red('Could not determine original source path.'));
    return;
  }

  console.log(chalk.gray('Fetching original from GitHub...'));
  const originalContent = await downloadFromGitHub(sourcePath);
  if (!originalContent) {
    console.log(chalk.red('Could not fetch original content.'));
    return;
  }

  // Simple diff display
  console.log();
  console.log(chalk.cyan('--- Original'));
  console.log(chalk.yellow('+++ Current'));
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
        console.log(chalk.gray('... (diff truncated, showing first 20 changes)'));
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
  for (const file of modifiedFiles) {
    console.log(chalk.cyan(`\nDiff for: ${file}`));
    console.log(chalk.gray('─'.repeat(50)));
    await showSingleFileDiff(projectPath, manifest, file);
  }
}

/**
 * Restore files from upstream
 */
async function restoreFiles(projectPath, manifest, files) {
  console.log(chalk.cyan('Restoring files...'));
  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const success = await restoreSingleFile(projectPath, manifest, file);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log();
  console.log(chalk.green(`✓ Restored ${successCount} file(s)`));
  if (errorCount > 0) {
    console.log(chalk.red(`✗ Failed to restore ${errorCount} file(s)`));
  }

  // Update manifest
  writeManifest(manifest, projectPath);
  console.log(chalk.gray('  Manifest updated.'));
  console.log();
}

/**
 * Restore a single file
 */
async function restoreSingleFile(projectPath, manifest, relativePath) {
  const sourcePath = getSourcePathFromRelative(manifest, relativePath);
  if (!sourcePath) {
    console.log(chalk.red(`  ✗ ${relativePath}: Could not determine source`));
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
      console.log(chalk.green(`  ✓ ${relativePath}: Restored`));
      return true;
    } else {
      console.log(chalk.red(`  ✗ ${relativePath}: ${result.error}`));
      return false;
    }
  }

  const result = await copyStandard(sourcePath, targetDir, projectPath);
  if (result.success) {
    updateFileHash(projectPath, manifest, relativePath);
    console.log(chalk.green(`  ✓ ${relativePath}: Restored`));
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
  console.log(chalk.cyan('Migrating to hash-based integrity checking...'));
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

  console.log(chalk.green(`✓ Migrated ${count} files to hash-based tracking`));
  console.log(chalk.gray('  Manifest version upgraded to 3.1.0'));
  console.log();
}

/**
 * Display skills status
 */
function displaySkillsStatus(manifest, projectPath) {
  console.log(chalk.cyan('Skills Status:'));

  // Check which skills-compatible tools are configured
  const hasClaudeCode = manifest.aiTools?.includes('claude-code');
  const hasOpenCode = manifest.aiTools?.includes('opencode');

  if (manifest.skills.installed) {
    const location = manifest.skills.location || '';
    // Check if skills are installed via Plugin Marketplace
    // Recognized patterns: 'marketplace', or paths containing 'plugins/cache'
    const isMarketplace = location === 'marketplace' ||
      location.includes('plugins/cache') ||
      location.includes('plugins\\cache');

    if (isMarketplace) {
      console.log(chalk.green('  ✓ Skills installed via Plugin Marketplace'));

      // Try to get actual version from marketplace
      const marketplaceInfo = getMarketplaceSkillsInfo();
      if (marketplaceInfo && marketplaceInfo.version && marketplaceInfo.version !== 'unknown') {
        console.log(chalk.gray(`    Version: ${marketplaceInfo.version}`));
        if (marketplaceInfo.lastUpdated) {
          const updateDate = marketplaceInfo.lastUpdated.split('T')[0];
          console.log(chalk.gray(`    Last updated: ${updateDate}`));
        }
      } else {
        console.log(chalk.gray('    Version: (run /plugin list to check)'));
      }

      console.log(chalk.gray('    Managed by Claude Code plugin system'));
      console.log(chalk.gray('    Note: Marketplace skills are not file-based'));
    } else {
      const skillsDir = join(process.env.HOME || '', '.claude', 'skills');
      const hasGlobalSkills = existsSync(skillsDir);
      const hasProjectSkills = existsSync(join(projectPath, '.claude', 'skills'));

      if (hasGlobalSkills || hasProjectSkills) {
        console.log(chalk.green('  ✓ Skills installed'));
        if (hasGlobalSkills) console.log(chalk.gray('    Global: ~/.claude/skills/'));
        if (hasProjectSkills) console.log(chalk.gray('    Project: .claude/skills/'));

        // Show compatible tools
        const compatibleTools = [];
        if (hasClaudeCode) compatibleTools.push('Claude Code');
        if (hasOpenCode) compatibleTools.push('OpenCode');
        if (compatibleTools.length > 0) {
          console.log(chalk.gray(`    Compatible: ${compatibleTools.join(', ')}`));
        }

        // OpenCode auto-detection note (only if OpenCode is configured without Claude Code)
        if (hasOpenCode && !hasClaudeCode) {
          console.log(chalk.gray('    Note: OpenCode auto-detects .claude/skills/'));
        }

        // Migration suggestion
        console.log(chalk.yellow('  ⚠ Consider migrating to Plugin Marketplace'));
        console.log(chalk.gray('    Marketplace provides automatic updates and easier management.'));
        console.log(chalk.gray('    To migrate:'));
        console.log(chalk.gray('      1. Install via Marketplace: /install-skills AsiaOstrich/universal-dev-skills'));
        console.log(chalk.gray('      2. Remove local skills: rm -rf ~/.claude/skills/'));
        console.log(chalk.gray('      3. Reinitialize: uds init --yes'));
      } else {
        console.log(chalk.yellow('  ⚠ Skills marked as installed but not found'));
        console.log(chalk.gray('    Recommended: Install via Plugin Marketplace'));
        console.log(chalk.gray('      /install-skills AsiaOstrich/universal-dev-skills'));
        console.log(chalk.gray('    Then reinitialize: uds init --yes'));
      }
    }

    // Show compatible tools for marketplace installation too
    if (isMarketplace && (hasClaudeCode || hasOpenCode)) {
      const compatibleTools = [];
      if (hasClaudeCode) compatibleTools.push('Claude Code');
      if (hasOpenCode) compatibleTools.push('OpenCode');
      console.log(chalk.gray(`    Compatible: ${compatibleTools.join(', ')}`));
    }
  } else {
    console.log(chalk.gray('  Skills not installed (using reference documents only)'));
  }
  console.log();
}

/**
 * Display coverage report
 */
function displayCoverageReport(manifest) {
  console.log(chalk.cyan('Coverage Summary:'));
  const expectedStandards = getStandardsByLevel(manifest.level);
  const skillStandards = expectedStandards.filter(s => s.skillName);
  const refStandards = expectedStandards.filter(s => !s.skillName);

  console.log(chalk.gray(`  Level ${manifest.level} requires ${expectedStandards.length} standards:`));
  console.log(chalk.gray(`    ${skillStandards.length} with Skills (interactive AI assistance)`));
  console.log(chalk.gray(`    ${refStandards.length} reference documents`));

  const coveredBySkills = manifest.skills.installed ? skillStandards.length : 0;
  const coveredByDocs = manifest.standards.length;

  console.log(chalk.gray('  Your coverage:'));
  console.log(chalk.gray(`    ${coveredBySkills} via Skills`));
  console.log(chalk.gray(`    ${coveredByDocs} via copied documents`));
  console.log();
}

/**
 * Check AI tool integration files for standards coverage
 */
function checkIntegrationFiles(manifest, projectPath) {
  // Skip if no AI tools configured
  if (!manifest.aiTools || manifest.aiTools.length === 0) {
    return;
  }

  console.log(chalk.cyan('AI Tool Integration Status:'));

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
      console.log(chalk.red(`  ✗ ${toolFile}: File not found`));
      hasIssues = true;
      continue;
    }

    checkedCount++;

    // Read file content
    let content;
    try {
      content = readFileSync(fullPath, 'utf-8');
    } catch {
      console.log(chalk.yellow(`  ⚠ ${toolFile}: Could not read file`));
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
      console.log(chalk.gray('    Standards index present'));
      console.log(chalk.gray(`    ${referencedStandards.length}/${totalTrackable || standardsFiles.length} standards referenced`));
    } else if (hasStandardsIndex) {
      console.log(chalk.yellow(`  ⚠ ${toolFile}:`));
      console.log(chalk.gray('    Standards index present'));
      console.log(chalk.yellow(`    ${referencedStandards.length}/${totalTrackable} standards referenced`));
      if (missingStandards.length > 0 && missingStandards.length <= 5) {
        console.log(chalk.yellow(`    Missing: ${missingStandards.join(', ')}`));
      } else if (missingStandards.length > 5) {
        console.log(chalk.yellow(`    Missing: ${missingStandards.slice(0, 5).join(', ')}...`));
      }
      hasIssues = true;
    } else {
      // No standards index - using minimal mode
      console.log(chalk.gray(`  ℹ ${toolFile}:`));
      console.log(chalk.gray('    Using minimal mode (no standards index)'));
      const coreRules = content.includes('Anti-Hallucination') ||
        content.includes('Commit') ||
        content.includes('Code Review');
      if (coreRules) {
        console.log(chalk.gray('    Core rules embedded'));
      }
    }
  }

  if (checkedCount === 0) {
    console.log(chalk.gray('  No AI tool integration files configured.'));
  }

  if (hasIssues) {
    console.log();
    console.log(chalk.yellow('  To fix integration issues:'));
    console.log(chalk.gray('    • Run `uds update` to sync all integration files'));
    console.log(chalk.gray('    • Run `uds configure --type ai_tools` to manage AI tools'));
  }

  console.log();
}

/**
 * Check reference sync status between manifest standards and integration files
 */
function checkReferenceSync(manifest, projectPath) {
  // Skip if no integrations
  if (!manifest.integrations || manifest.integrations.length === 0) {
    return;
  }

  console.log(chalk.cyan('Reference Sync Status:'));

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
      console.log(chalk.yellow(`  ⚠ ${integrationPath}: Could not read file`));
      continue;
    }

    // Parse references from integration file
    const references = parseReferences(content);

    // Skip if no references found (might be a static file or custom content)
    if (references.length === 0) {
      console.log(chalk.gray(`  ℹ ${integrationPath}: No standard references found`));
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
      console.log(chalk.yellow('    References not in manifest:'));
      for (const ref of orphanedRefs) {
        console.log(chalk.yellow(`      - ${ref}`));
      }
    }

    if (missingRefs.length > 0) {
      // This is informational, not an error
      console.log(chalk.gray(`  ℹ ${integrationPath}:`));
      console.log(chalk.gray('    Standards not referenced (optional):'));
      for (const ref of missingRefs) {
        console.log(chalk.gray(`      - ${ref}`));
      }
    }

    if (orphanedRefs.length === 0 && missingRefs.length === 0) {
      console.log(chalk.green(`  ✓ ${integrationPath}: references in sync (${syncedRefs.length} refs)`));
    }
  }

  if (checkedCount === 0) {
    console.log(chalk.gray('  No integration files with standard references found.'));
  }

  if (hasIssues) {
    console.log();
    console.log(chalk.yellow('  Run `uds update --sync-refs` to fix reference issues.'));
  }

  console.log();
}
