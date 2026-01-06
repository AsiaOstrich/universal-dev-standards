import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { readManifest, writeManifest, copyStandard, copyIntegration, isInitialized } from '../utils/copier.js';
import { getRepositoryInfo } from '../utils/registry.js';

// Integration file mappings (same as init.js)
const INTEGRATION_MAPPINGS = {
  cursor: {
    source: 'integrations/cursor/.cursorrules',
    target: '.cursorrules'
  },
  windsurf: {
    source: 'integrations/windsurf/.windsurfrules',
    target: '.windsurfrules'
  },
  cline: {
    source: 'integrations/cline/.clinerules',
    target: '.clinerules'
  },
  copilot: {
    source: 'integrations/github-copilot/copilot-instructions.md',
    target: '.github/copilot-instructions.md'
  }
};

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

  // Check versions
  const repoInfo = getRepositoryInfo();
  const currentVersion = manifest.upstream.version;
  const latestVersion = repoInfo.standards.version;

  console.log(chalk.gray(`Current version: ${currentVersion}`));
  console.log(chalk.gray(`Latest version:  ${latestVersion}`));
  console.log();

  if (currentVersion === latestVersion) {
    console.log(chalk.green('✓ Standards are up to date.'));
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
  for (const int of manifest.integrations) {
    console.log(chalk.gray(`  ${int}`));
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
    errors: []
  };

  // Update standards
  for (const std of manifest.standards) {
    const result = copyStandard(std, '.standards', projectPath);
    if (result.success) {
      results.updated.push(std);
    } else {
      results.errors.push(`${std}: ${result.error}`);
    }
  }

  // Update extensions
  for (const ext of manifest.extensions) {
    const result = copyStandard(ext, '.standards', projectPath);
    if (result.success) {
      results.updated.push(ext);
    } else {
      results.errors.push(`${ext}: ${result.error}`);
    }
  }

  // Update integrations
  for (const int of manifest.integrations) {
    // Find the mapping for this integration
    let mapping = null;
    for (const [, m] of Object.entries(INTEGRATION_MAPPINGS)) {
      if (m.target === int) {
        mapping = m;
        break;
      }
    }

    if (mapping) {
      const result = copyIntegration(mapping.source, mapping.target, projectPath);
      if (result.success) {
        results.updated.push(int);
      } else {
        results.errors.push(`${int}: ${result.error}`);
      }
    }
  }

  spinner.succeed(`Updated ${results.updated.length} files`);

  // Update manifest
  manifest.upstream.version = latestVersion;
  manifest.upstream.installed = new Date().toISOString().split('T')[0];
  writeManifest(manifest, projectPath);

  // Summary
  console.log();
  console.log(chalk.green('✓ Standards updated successfully!'));
  console.log(chalk.gray(`  Version: ${currentVersion} → ${latestVersion}`));

  if (results.errors.length > 0) {
    console.log();
    console.log(chalk.yellow(`⚠ ${results.errors.length} file(s) could not be updated:`));
    for (const err of results.errors) {
      console.log(chalk.gray(`    ${err}`));
    }
  }

  // Skills update reminder
  if (manifest.skills.installed) {
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
