import chalk from 'chalk';
import ora from 'ora';
import { unlinkSync, existsSync } from 'fs';
import { join, basename } from 'path';
import {
  getOptionSource,
  findOption,
  getAllStandards,
  getStandardsByLevel,
  getStandardSource
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
  promptConfirm,
  promptManageAITools,
  promptAdoptionLevel,
  promptContentModeChange,
  handleAgentsMdSharing,
  promptMethodology
} from '../prompts/init.js';
import {
  writeIntegrationFile,
  getToolFilePath
} from '../utils/integration-generator.js';

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
  console.log(chalk.gray(`  Level: ${manifest.level || 2}`));
  console.log(chalk.gray(`  Format: ${manifest.format || 'human'}`));
  console.log(chalk.gray(`  Content Mode: ${manifest.contentMode || 'minimal'}`));
  console.log(chalk.gray(`  AI Tools: ${manifest.aiTools?.length > 0 ? manifest.aiTools.join(', ') : 'none'}`));
  if (manifest.methodology?.active) {
    console.log(chalk.gray(`  Methodology: ${manifest.methodology.active.toUpperCase()}`) + chalk.yellow(' [Experimental]'));
  }
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
          new inquirer.default.Separator(),
          { name: `${chalk.cyan('AI Tools')} - Add/Remove AI integrations`, value: 'ai_tools' },
          { name: `${chalk.cyan('Adoption Level')} - Change Level 1/2/3`, value: 'level' },
          { name: `${chalk.cyan('Content Mode')} - Change full/index/minimal`, value: 'content_mode' },
          { name: `${chalk.cyan('Methodology')} ${chalk.yellow('[Experimental]')} - Change development methodology`, value: 'methodology' },
          new inquirer.default.Separator(),
          { name: 'All Options', value: 'all' }
        ]
      }
    ]);
    configType = type;
  }

  // Collect new options
  const newOptions = { ...manifest.options };
  let newFormat = manifest.format;
  let newLevel = manifest.level || 2;
  let newContentMode = manifest.contentMode || 'minimal';
  let newAITools = [...(manifest.aiTools || [])];
  let needsIntegrationRegeneration = false;

  // Handle AI Tools configuration
  if (configType === 'ai_tools') {
    const result = await promptManageAITools(manifest.aiTools || []);

    if (result.action === 'add' && result.tools.length > 0) {
      // Handle AGENTS.md sharing
      const toolsWithSharing = handleAgentsMdSharing(result.tools);
      newAITools = [...new Set([...newAITools, ...toolsWithSharing])];
      needsIntegrationRegeneration = true;
    } else if (result.action === 'remove' && result.tools.length > 0) {
      newAITools = newAITools.filter(t => !result.tools.includes(t));

      // Remove integration files for removed tools
      const spinner = ora('Removing integration files...').start();
      for (const tool of result.tools) {
        const filePath = join(projectPath, getToolFilePath(tool));
        if (existsSync(filePath)) {
          try {
            unlinkSync(filePath);
            console.log(chalk.gray(`  Removed: ${getToolFilePath(tool)}`));
          } catch (err) {
            console.log(chalk.yellow(`  Could not remove: ${getToolFilePath(tool)}`));
          }
        }
      }
      spinner.succeed('Integration files removed');
    } else if (result.action === 'view' || result.action === 'cancel') {
      console.log(chalk.gray('No changes made.'));
      process.exit(0);
    }
  }

  // Handle Level configuration
  if (configType === 'level') {
    newLevel = await promptAdoptionLevel(manifest.level || 2);
    if (newLevel !== manifest.level) {
      needsIntegrationRegeneration = true;
    }
  }

  // Handle Content Mode configuration
  if (configType === 'content_mode') {
    newContentMode = await promptContentModeChange(manifest.contentMode || 'minimal');
    if (newContentMode !== manifest.contentMode) {
      needsIntegrationRegeneration = true;
    }
  }

  // Handle Methodology configuration
  let newMethodology = manifest.methodology?.active || null;
  if (configType === 'methodology') {
    newMethodology = await promptMethodology();
  }

  // Handle traditional options
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
  console.log(chalk.gray(`  Level: ${newLevel}`));
  console.log(chalk.gray(`  Format: ${newFormat}`));
  console.log(chalk.gray(`  Content Mode: ${newContentMode}`));
  console.log(chalk.gray(`  AI Tools: ${newAITools.length > 0 ? newAITools.join(', ') : 'none'}`));
  if (newMethodology) {
    console.log(chalk.gray(`  Methodology: ${newMethodology.toUpperCase()}`));
  }
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
    process.exit(0);
  }

  // Apply changes
  const spinner = ora('Updating configuration...').start();

  const results = {
    copied: [],
    generated: [],
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

  // Handle level change - copy new standards if upgrading
  if (newLevel > (manifest.level || 2)) {
    const levelSpinner = ora('Adding new standards for higher level...').start();
    const newStandards = getStandardsByLevel(newLevel);
    const existingStandards = new Set(manifest.standards?.map(s => basename(s)) || []);

    for (const std of newStandards) {
      for (const targetFormat of formatsToUse) {
        const sourcePath = getStandardSource(std, targetFormat);
        const fileName = basename(sourcePath);
        if (!existingStandards.has(fileName)) {
          const result = await copyStandard(sourcePath, '.standards', projectPath);
          if (result.success) {
            results.copied.push(sourcePath);
          }
        }
      }
    }
    levelSpinner.succeed('New standards added');
  }

  // Regenerate integration files if needed
  if (needsIntegrationRegeneration && newAITools.length > 0) {
    const intSpinner = ora('Regenerating integration files...').start();

    // Build installed standards list
    const installedStandardsList = manifest.standards?.map(s => basename(s)) || [];

    // Determine language setting
    let commonLanguage = 'en';
    if (newOptions.commit_language === 'bilingual') {
      commonLanguage = 'bilingual';
    } else if (newOptions.commit_language === 'traditional-chinese') {
      commonLanguage = 'zh-tw';
    }

    // Track generated files to handle AGENTS.md sharing
    const generatedFiles = new Set();

    for (const tool of newAITools) {
      const targetFile = getToolFilePath(tool);
      if (generatedFiles.has(targetFile)) {
        continue; // Skip if already generated (AGENTS.md sharing)
      }

      const toolConfig = {
        tool,
        categories: ['anti-hallucination', 'commit-standards', 'code-review'],
        language: commonLanguage,
        installedStandards: installedStandardsList,
        contentMode: newContentMode,
        level: newLevel
      };

      const result = writeIntegrationFile(tool, toolConfig, projectPath);
      if (result.success) {
        results.generated.push(result.path);
        generatedFiles.add(targetFile);
      } else {
        results.errors.push(`${tool}: ${result.error}`);
      }
    }
    intSpinner.succeed(`Regenerated ${results.generated.length} integration files`);
  }

  // Update manifest
  manifest.format = newFormat;
  manifest.options = newOptions;
  manifest.level = newLevel;
  manifest.contentMode = newContentMode;
  manifest.aiTools = newAITools;
  manifest.version = '3.2.0';

  // Update methodology
  if (newMethodology) {
    manifest.methodology = {
      active: newMethodology,
      available: ['tdd', 'bdd', 'sdd', 'atdd'],
      config: {
        checkpointsEnabled: true,
        reminderIntensity: 'suggest',
        skipLimit: 3
      }
    };
  } else if (configType === 'methodology' && !newMethodology) {
    // User explicitly chose "None"
    manifest.methodology = null;
  }

  writeManifest(manifest, projectPath);

  spinner.succeed('Configuration updated');

  // Summary
  console.log();
  console.log(chalk.green('✓ Configuration updated successfully!'));
  if (results.copied.length > 0) {
    console.log(chalk.gray(`  ${results.copied.length} new option/standard files copied`));
  }
  if (results.generated.length > 0) {
    console.log(chalk.gray(`  ${results.generated.length} integration files regenerated`));
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
