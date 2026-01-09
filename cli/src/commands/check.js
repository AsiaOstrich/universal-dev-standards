import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync, unlinkSync } from 'fs';
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
  scanForUntrackedFiles
} from '../utils/hasher.js';
import { downloadFromGitHub } from '../utils/github.js';

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
    noHash: [],
    untracked: []
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

  // Scan for untracked files (only for hash-based manifests)
  if (hasFileHashes(manifest)) {
    const untrackedFiles = scanForUntrackedFiles(projectPath, manifest);
    fileStatus.untracked.push(...untrackedFiles);
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

  if (fileStatus.untracked.length > 0) {
    for (const file of fileStatus.untracked) {
      console.log(chalk.yellow(`  ⚠ ${file} (untracked)`));
    }
  }

  console.log();
  console.log(chalk.gray(`  Summary: ${fileStatus.unchanged.length} unchanged, ` +
    `${fileStatus.modified.length} modified, ${fileStatus.missing.length} missing` +
    (fileStatus.untracked.length > 0 ? `, ${fileStatus.untracked.length} untracked` : '') +
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
                    fileStatus.missing.length > 0 ||
                    fileStatus.untracked.length > 0;
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

  // Skills status
  displaySkillsStatus(manifest, projectPath);

  // Coverage report
  displayCoverageReport(manifest);

  // Final status
  const allGood = fileStatus.missing.length === 0 &&
                  fileStatus.modified.length === 0 &&
                  fileStatus.untracked.length === 0;
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
    ...fileStatus.missing.map(f => ({ file: f, status: 'missing' })),
    ...fileStatus.untracked.map(f => ({ file: f, status: 'untracked' }))
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
    } else if (issue.status === 'untracked') {
      console.log(chalk.yellow(`⚠ Untracked: ${issue.file}`));
    }

    let choices;
    if (issue.status === 'modified') {
      choices = [
        { name: 'view    - View diff between current and original', value: 'view' },
        { name: 'restore - Restore to original version', value: 'restore' },
        { name: 'keep    - Keep current version (update hash in manifest)', value: 'keep' },
        { name: 'skip    - Skip this file for now', value: 'skip' }
      ];
    } else if (issue.status === 'missing') {
      choices = [
        { name: 'restore - Download and restore file', value: 'restore' },
        { name: 'remove  - Remove from manifest (no longer track)', value: 'remove' },
        { name: 'skip    - Skip this file for now', value: 'skip' }
      ];
    } else {
      // untracked
      choices = [
        { name: 'track   - Add to manifest (start tracking)', value: 'track' },
        { name: 'delete  - Delete file from filesystem', value: 'delete' },
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

      case 'track':
        addUntrackedToManifest(projectPath, manifest, issue.file);
        manifestUpdated = true;
        console.log(chalk.green('✓ Added to manifest. Now tracking.'));
        break;

      case 'delete':
        deleteUntrackedFile(projectPath, issue.file);
        console.log(chalk.green('✓ File deleted.'));
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
 * Add an untracked file to manifest
 * @param {string} projectPath - Project root path
 * @param {Object} manifest - Manifest object
 * @param {string} relativePath - Relative path to untracked file
 */
function addUntrackedToManifest(projectPath, manifest, relativePath) {
  const fullPath = join(projectPath, relativePath);
  const hashInfo = computeFileHash(fullPath);

  if (!manifest.fileHashes) {
    manifest.fileHashes = {};
  }

  manifest.fileHashes[relativePath] = {
    ...hashInfo,
    installedAt: new Date().toISOString()
  };

  // Determine which array to add to based on path
  if (relativePath.startsWith('.standards/') || relativePath.startsWith('.standards\\')) {
    // It's a standard file - add to standards array with local/ prefix
    const fileName = basename(relativePath);
    const sourcePath = relativePath.includes('options/') || relativePath.includes('options\\')
      ? `options/${fileName}`
      : `local/${fileName}`;

    if (!manifest.standards.some(s => s.endsWith(fileName))) {
      manifest.standards.push(sourcePath);
    }
  } else {
    // It's an integration file - add to integrations array
    if (!manifest.integrations.includes(relativePath)) {
      manifest.integrations.push(relativePath);
    }
  }
}

/**
 * Delete an untracked file from filesystem
 * @param {string} projectPath - Project root path
 * @param {string} relativePath - Relative path to untracked file
 */
function deleteUntrackedFile(projectPath, relativePath) {
  const fullPath = join(projectPath, relativePath);
  if (existsSync(fullPath)) {
    unlinkSync(fullPath);
  }
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
  if (manifest.skills.installed) {
    const location = manifest.skills.location || '';
    // Check if skills are installed via Plugin Marketplace
    // Recognized patterns: 'marketplace', or paths containing 'plugins/cache'
    const isMarketplace = location === 'marketplace' ||
      location.includes('plugins/cache') ||
      location.includes('plugins\\cache');

    if (isMarketplace) {
      console.log(chalk.green('  ✓ Skills installed via Plugin Marketplace'));
      console.log(chalk.gray('    Managed by Claude Code plugin system'));
      console.log(chalk.gray('    To verify: /plugin list'));
      console.log(chalk.gray('    Note: Marketplace skills are not file-based'));
    } else {
      const skillsDir = join(process.env.HOME || '', '.claude', 'skills');
      const hasGlobalSkills = existsSync(skillsDir);
      const hasProjectSkills = existsSync(join(projectPath, '.claude', 'skills'));

      if (hasGlobalSkills || hasProjectSkills) {
        console.log(chalk.green('  ✓ Claude Code Skills installed'));
        if (hasGlobalSkills) console.log(chalk.gray('    Global: ~/.claude/skills/'));
        if (hasProjectSkills) console.log(chalk.gray('    Project: .claude/skills/'));
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
