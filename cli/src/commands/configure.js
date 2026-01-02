import chalk from 'chalk';
import ora from 'ora';
import {
  getOptionSource,
  findOption,
  getAllStandards
} from '../utils/registry.js';
import {
  copyStandard,
  readManifest,
  writeManifest,
  isInitialized
} from '../utils/copier.js';
import {
  promptFormat,
  promptGitWorkflow,
  promptMergeStrategy,
  promptCommitLanguage,
  promptTestLevels,
  promptConfirm
} from '../prompts/init.js';

/**
 * Configure command - modify options for initialized project
 * @param {Object} options - Command options
 */
export async function configureCommand(options) {
  const projectPath = process.cwd();

  console.log();
  console.log(chalk.bold('Universal Development Standards - Configure'));
  console.log(chalk.gray('─'.repeat(50)));

  // Check if initialized
  if (!isInitialized(projectPath)) {
    console.log(chalk.red('✗ Standards not initialized in this project.'));
    console.log(chalk.gray('  Run `uds init` first to initialize standards.'));
    return;
  }

  // Read current manifest
  const manifest = readManifest(projectPath);
  if (!manifest) {
    console.log(chalk.red('✗ Could not read manifest file.'));
    return;
  }

  console.log();
  console.log(chalk.cyan('Current Configuration:'));
  console.log(chalk.gray(`  Format: ${manifest.format || 'human'}`));
  if (manifest.options) {
    if (manifest.options.workflow) {
      console.log(chalk.gray(`  Git Workflow: ${manifest.options.workflow}`));
    }
    if (manifest.options.merge_strategy) {
      console.log(chalk.gray(`  Merge Strategy: ${manifest.options.merge_strategy}`));
    }
    if (manifest.options.commit_language) {
      console.log(chalk.gray(`  Commit Language: ${manifest.options.commit_language}`));
    }
    if (manifest.options.test_levels && manifest.options.test_levels.length > 0) {
      console.log(chalk.gray(`  Test Levels: ${manifest.options.test_levels.join(', ')}`));
    }
  }
  console.log();

  // Determine what to configure based on options or interactive mode
  let configType = options.type || null;

  if (!configType) {
    const inquirer = await import('inquirer');
    const { type } = await inquirer.default.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What would you like to configure?',
        choices: [
          { name: 'Format (AI/Human)', value: 'format' },
          { name: 'Git Workflow Strategy', value: 'workflow' },
          { name: 'Merge Strategy', value: 'merge_strategy' },
          { name: 'Commit Message Language', value: 'commit_language' },
          { name: 'Test Levels', value: 'test_levels' },
          { name: 'All Options', value: 'all' }
        ]
      }
    ]);
    configType = type;
  }

  // Collect new options
  const newOptions = { ...manifest.options };
  let newFormat = manifest.format;

  if (configType === 'all' || configType === 'format') {
    newFormat = await promptFormat();
  }

  if (configType === 'all' || configType === 'workflow') {
    newOptions.workflow = await promptGitWorkflow();
  }

  if (configType === 'all' || configType === 'merge_strategy') {
    newOptions.merge_strategy = await promptMergeStrategy();
  }

  if (configType === 'all' || configType === 'commit_language') {
    newOptions.commit_language = await promptCommitLanguage();
  }

  if (configType === 'all' || configType === 'test_levels') {
    newOptions.test_levels = await promptTestLevels();
  }

  // Show changes
  console.log();
  console.log(chalk.cyan('New Configuration:'));
  console.log(chalk.gray(`  Format: ${newFormat}`));
  if (newOptions.workflow) {
    console.log(chalk.gray(`  Git Workflow: ${newOptions.workflow}`));
  }
  if (newOptions.merge_strategy) {
    console.log(chalk.gray(`  Merge Strategy: ${newOptions.merge_strategy}`));
  }
  if (newOptions.commit_language) {
    console.log(chalk.gray(`  Commit Language: ${newOptions.commit_language}`));
  }
  if (newOptions.test_levels && newOptions.test_levels.length > 0) {
    console.log(chalk.gray(`  Test Levels: ${newOptions.test_levels.join(', ')}`));
  }
  console.log();

  // Confirm
  const confirmed = await promptConfirm('Apply these changes?');
  if (!confirmed) {
    console.log(chalk.yellow('Configuration cancelled.'));
    return;
  }

  // Apply changes
  const spinner = ora('Updating configuration...').start();

  const results = {
    copied: [],
    errors: []
  };

  const standards = getAllStandards();
  const formatsToUse = newFormat === 'both' ? ['ai', 'human'] : [newFormat];

  // Helper to copy option files
  const copyOptionFile = async (std, optionCategory, optionId, targetFormat) => {
    const option = findOption(std, optionCategory, optionId);
    if (option) {
      const sourcePath = getOptionSource(option, targetFormat);
      const result = await copyStandard(sourcePath, '.standards/options', projectPath);
      if (result.success) {
        results.copied.push(sourcePath);
      } else {
        results.errors.push(`${sourcePath}: ${result.error}`);
      }
    }
  };

  // Copy new option files
  for (const std of standards) {
    if (!std.options) continue;

    for (const targetFormat of formatsToUse) {
      // Git workflow
      if (std.id === 'git-workflow') {
        if (newOptions.workflow && newOptions.workflow !== manifest.options?.workflow) {
          await copyOptionFile(std, 'workflow', newOptions.workflow, targetFormat);
        }
        if (newOptions.merge_strategy && newOptions.merge_strategy !== manifest.options?.merge_strategy) {
          await copyOptionFile(std, 'merge_strategy', newOptions.merge_strategy, targetFormat);
        }
      }

      // Commit message
      if (std.id === 'commit-message') {
        if (newOptions.commit_language && newOptions.commit_language !== manifest.options?.commit_language) {
          await copyOptionFile(std, 'commit_language', newOptions.commit_language, targetFormat);
        }
      }

      // Testing
      if (std.id === 'testing' && newOptions.test_levels) {
        for (const level of newOptions.test_levels) {
          if (!manifest.options?.test_levels?.includes(level)) {
            await copyOptionFile(std, 'test_level', level, targetFormat);
          }
        }
      }
    }
  }

  // Update manifest
  manifest.format = newFormat;
  manifest.options = newOptions;
  manifest.version = '2.0.0';
  writeManifest(manifest, projectPath);

  spinner.succeed('Configuration updated');

  // Summary
  console.log();
  console.log(chalk.green('✓ Configuration updated successfully!'));
  if (results.copied.length > 0) {
    console.log(chalk.gray(`  ${results.copied.length} new option files copied`));
  }

  if (results.errors.length > 0) {
    console.log();
    console.log(chalk.yellow(`⚠ ${results.errors.length} error(s) occurred:`));
    for (const err of results.errors) {
      console.log(chalk.gray(`    ${err}`));
    }
  }

  console.log();

  // Exit explicitly to prevent hanging due to inquirer's readline interface
  process.exit(0);
}
