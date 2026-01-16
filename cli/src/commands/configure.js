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
  promptMethodology,
  promptSkillsInstallLocation,
  promptCommandsInstallation
} from '../prompts/init.js';
import {
  installSkillsToMultipleAgents,
  installCommandsToMultipleAgents,
  getInstalledSkillsInfoForAgent,
  getInstalledCommandsForAgent
} from '../utils/skills-installer.js';
import {
  getAgentConfig,
  getAgentDisplayName
} from '../config/ai-agent-paths.js';
import {
  writeIntegrationFile,
  getToolFilePath
} from '../utils/integration-generator.js';
import { t } from '../i18n/messages.js';

/**
 * Configure command - modify options for initialized project
 * @param {Object} options - Command options
 */
export async function configureCommand(options) {
  const projectPath = process.cwd();
  const msg = t().commands.configure;
  const common = t().commands.common;

  console.log();
  console.log(chalk.bold(msg.title));
  console.log(chalk.gray('─'.repeat(50)));

  // Check if initialized
  if (!isInitialized(projectPath)) {
    console.log(chalk.red(common.notInitialized));
    console.log(chalk.gray(`  ${common.runInit}`));
    return;
  }

  // Read current manifest
  const manifest = readManifest(projectPath);
  if (!manifest) {
    console.log(chalk.red(common.couldNotReadManifest));
    return;
  }

  console.log();
  console.log(chalk.cyan(msg.currentConfig));
  console.log(chalk.gray(`  ${common.level}: ${manifest.level || 2}`));
  console.log(chalk.gray(`  ${common.format}: ${manifest.format || 'human'}`));
  console.log(chalk.gray(`  ${common.contentMode}: ${manifest.contentMode || 'minimal'}`));
  console.log(chalk.gray(`  ${common.aiTools}: ${manifest.aiTools?.length > 0 ? manifest.aiTools.join(', ') : common.none}`));
  // Only show methodology with -E flag (completely hidden otherwise)
  if (options.experimental && manifest.methodology?.active) {
    console.log(chalk.gray(`  ${common.methodology}: ${manifest.methodology.active.toUpperCase()}`) + chalk.yellow(` ${msg.experimental}`));
  }
  if (manifest.options) {
    if (manifest.options.workflow) {
      console.log(chalk.gray(`  ${msg.gitWorkflow}: ${manifest.options.workflow}`));
    }
    if (manifest.options.merge_strategy) {
      console.log(chalk.gray(`  ${msg.mergeStrategy}: ${manifest.options.merge_strategy}`));
    }
    if (manifest.options.commit_language) {
      console.log(chalk.gray(`  ${msg.commitLanguage}: ${manifest.options.commit_language}`));
    }
    if (manifest.options.test_levels && manifest.options.test_levels.length > 0) {
      console.log(chalk.gray(`  ${msg.testLevels}: ${manifest.options.test_levels.join(', ')}`));
    }
  }
  console.log();

  // Determine what to configure based on options or interactive mode
  let configType = options.type || null;

  if (!configType) {
    const inquirer = await import('inquirer');

    // Build choices array - methodology only shown with -E flag
    const baseChoices = [
      { name: msg.optionFormat, value: 'format' },
      { name: msg.optionWorkflow, value: 'workflow' },
      { name: msg.optionMergeStrategy, value: 'merge_strategy' },
      { name: msg.optionCommitLanguage, value: 'commit_language' },
      { name: msg.optionTestLevels, value: 'test_levels' },
      new inquirer.default.Separator(),
      { name: chalk.cyan(msg.optionAITools), value: 'ai_tools' },
      { name: chalk.cyan(msg.optionSkills || 'Manage Skills installations'), value: 'skills' },
      { name: chalk.cyan(msg.optionCommands || 'Manage Commands installations'), value: 'commands' },
      new inquirer.default.Separator(),
      { name: chalk.cyan(msg.optionLevel), value: 'level' },
      { name: chalk.cyan(msg.optionContentMode), value: 'content_mode' }
    ];

    // Only add methodology option when -E flag is used
    if (options.experimental) {
      baseChoices.push(
        { name: `${chalk.cyan(msg.optionMethodology)} ${chalk.yellow(msg.experimental)}`, value: 'methodology' }
      );
    }

    baseChoices.push(
      new inquirer.default.Separator(),
      { name: msg.optionAll, value: 'all' }
    );

    const { type } = await inquirer.default.prompt([
      {
        type: 'list',
        name: 'type',
        message: msg.selectOption,
        choices: baseChoices
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
      newAITools = newAITools.filter(tool => !result.tools.includes(tool));

      // Remove integration files for removed tools
      const spinner = ora(msg.removingIntegrations).start();
      for (const tool of result.tools) {
        const filePath = join(projectPath, getToolFilePath(tool));
        if (existsSync(filePath)) {
          try {
            unlinkSync(filePath);
            console.log(chalk.gray(`  ${msg.removed}: ${getToolFilePath(tool)}`));
          } catch (err) {
            console.log(chalk.yellow(`  ${msg.couldNotRemove}: ${getToolFilePath(tool)}`));
          }
        }
      }
      spinner.succeed(msg.integrationsRemoved);
    } else if (result.action === 'view' || result.action === 'cancel') {
      console.log(chalk.gray(msg.noChanges));
      process.exit(0);
    }
  }

  // Handle Skills configuration
  if (configType === 'skills') {
    await handleSkillsConfiguration(manifest, projectPath, msg, common, options.aiTool);
    process.exit(0);
  }

  // Handle Commands configuration
  if (configType === 'commands') {
    await handleCommandsConfiguration(manifest, projectPath, msg, common, options.aiTool);
    process.exit(0);
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
  console.log(chalk.cyan(msg.newConfig));
  console.log(chalk.gray(`  ${common.level}: ${newLevel}`));
  console.log(chalk.gray(`  ${common.format}: ${newFormat}`));
  console.log(chalk.gray(`  ${common.contentMode}: ${newContentMode}`));
  console.log(chalk.gray(`  ${common.aiTools}: ${newAITools.length > 0 ? newAITools.join(', ') : common.none}`));
  if (newMethodology) {
    console.log(chalk.gray(`  ${common.methodology}: ${newMethodology.toUpperCase()}`));
  }
  if (newOptions.workflow) {
    console.log(chalk.gray(`  ${msg.gitWorkflow}: ${newOptions.workflow}`));
  }
  if (newOptions.merge_strategy) {
    console.log(chalk.gray(`  ${msg.mergeStrategy}: ${newOptions.merge_strategy}`));
  }
  if (newOptions.commit_language) {
    console.log(chalk.gray(`  ${msg.commitLanguage}: ${newOptions.commit_language}`));
  }
  if (newOptions.test_levels && newOptions.test_levels.length > 0) {
    console.log(chalk.gray(`  ${msg.testLevels}: ${newOptions.test_levels.join(', ')}`));
  }
  console.log();

  // Confirm
  const confirmed = await promptConfirm(msg.applyChanges);
  if (!confirmed) {
    console.log(chalk.yellow(msg.configCancelled));
    process.exit(0);
  }

  // Apply changes
  const spinner = ora(msg.updatingConfig).start();

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
    const levelSpinner = ora(msg.addingStandards).start();
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
    levelSpinner.succeed(msg.standardsAdded);
  }

  // Regenerate integration files if needed
  if (needsIntegrationRegeneration && newAITools.length > 0) {
    const intSpinner = ora(msg.regeneratingIntegrations).start();

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
    intSpinner.succeed(msg.regeneratedIntegrations.replace('{count}', results.generated.length));
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

  spinner.succeed(msg.configUpdated);

  // Summary
  console.log();
  console.log(chalk.green(msg.configSuccess));
  if (results.copied.length > 0) {
    console.log(chalk.gray(`  ${msg.newOptionsCopied.replace('{count}', results.copied.length)}`));
  }
  if (results.generated.length > 0) {
    console.log(chalk.gray(`  ${msg.integrationsRegenerated.replace('{count}', results.generated.length)}`));
  }

  if (results.errors.length > 0) {
    console.log();
    console.log(chalk.yellow(msg.errorsOccurred.replace('{count}', results.errors.length)));
    for (const err of results.errors) {
      console.log(chalk.gray(`    ${err}`));
    }
  }

  console.log();

  // Exit explicitly to prevent hanging due to inquirer's readline interface
  process.exit(0);
}

/**
 * Handle Skills configuration
 * @param {Object} manifest - Project manifest
 * @param {string} projectPath - Project path
 * @param {Object} msg - i18n messages
 * @param {Object} common - Common i18n messages
 * @param {string} [specificTool] - Specific AI tool to install (non-interactive mode)
 */
async function handleSkillsConfiguration(manifest, projectPath, msg, common, specificTool) {
  const inquirer = await import('inquirer');
  const aiTools = manifest.aiTools || [];

  // Non-interactive mode: install for specific tool
  if (specificTool) {
    const config = getAgentConfig(specificTool);
    if (!config) {
      console.log(chalk.red(`Unknown AI tool: ${specificTool}`));
      console.log(chalk.gray('  Available tools: claude-code, opencode, copilot, gemini-cli, roo-code, cursor, windsurf, cline, codex'));
      return;
    }
    if (!config.supportsSkills) {
      console.log(chalk.yellow(`${getAgentDisplayName(specificTool)} does not support Skills`));
      return;
    }

    // Install to project level by default
    const installations = [{ agent: specificTool, location: 'project' }];
    const spinner = ora(`Installing Skills for ${getAgentDisplayName(specificTool)}...`).start();
    const result = await installSkillsToMultipleAgents(installations, null, projectPath);
    spinner.stop();

    if (result.success) {
      console.log(chalk.green(`Skills installed for ${getAgentDisplayName(specificTool)}`));
    } else {
      console.log(chalk.yellow('Skills installation completed with issues'));
    }

    // Update manifest
    manifest.skills = manifest.skills || {};
    manifest.skills.installations = manifest.skills.installations || [];
    const existing = manifest.skills.installations.findIndex(i => i.agent === specificTool);
    if (existing >= 0) {
      manifest.skills.installations[existing] = installations[0];
    } else {
      manifest.skills.installations.push(installations[0]);
    }
    writeManifest(manifest, projectPath);
    return;
  }

  // Interactive mode
  if (aiTools.length === 0) {
    console.log(chalk.yellow(msg.noAiToolsConfigured || 'No AI tools configured'));
    console.log(chalk.gray(`  ${msg.addAiToolsFirst || 'Add AI tools first with: uds configure --type ai_tools'}`));
    return;
  }

  // Show current Skills status
  console.log(chalk.cyan(msg.currentSkillsStatus || 'Current Skills status:'));
  for (const tool of aiTools) {
    const config = getAgentConfig(tool);
    if (!config?.supportsSkills) continue;

    const displayName = getAgentDisplayName(tool);
    const projectInfo = getInstalledSkillsInfoForAgent(tool, 'project', projectPath);
    const userInfo = getInstalledSkillsInfoForAgent(tool, 'user', projectPath);

    if (projectInfo?.installed || userInfo?.installed) {
      console.log(chalk.green(`  ✓ ${displayName}:`));
      if (userInfo?.installed) {
        console.log(chalk.gray(`    - User: ${userInfo.version || 'installed'}`));
      }
      if (projectInfo?.installed) {
        console.log(chalk.gray(`    - Project: ${projectInfo.version || 'installed'}`));
      }
    } else {
      console.log(chalk.gray(`  ○ ${displayName}: ${msg.notInstalled || 'Not installed'}`));
    }
  }
  console.log();

  // Ask what action to take
  const { action } = await inquirer.default.prompt([
    {
      type: 'list',
      name: 'action',
      message: msg.skillsAction || 'What would you like to do?',
      choices: [
        { name: msg.installSkills || 'Install/Update Skills', value: 'install' },
        { name: msg.viewStatus || 'View status only', value: 'view' },
        { name: common.cancel || 'Cancel', value: 'cancel' }
      ]
    }
  ]);

  if (action === 'cancel' || action === 'view') {
    console.log(chalk.gray(msg.noChanges || 'No changes made'));
    return;
  }

  // Use unified installation prompt
  const installations = await promptSkillsInstallLocation(aiTools);
  if (installations.length === 0) {
    console.log(chalk.gray(msg.noChanges || 'No changes made'));
    return;
  }

  // Install Skills
  const spinner = ora(msg.installingSkills || 'Installing Skills...').start();
  const result = await installSkillsToMultipleAgents(installations, null, projectPath);
  spinner.stop();

  if (result.success) {
    console.log(chalk.green(msg.skillsInstallSuccess || 'Skills installed successfully'));
    console.log(chalk.gray(`  ${msg.totalInstalled || 'Total installed'}: ${result.totalInstalled}`));
  } else {
    console.log(chalk.yellow(msg.skillsInstallPartial || 'Skills installed with some issues'));
    if (result.totalErrors > 0) {
      console.log(chalk.red(`  ${msg.errors || 'Errors'}: ${result.totalErrors}`));
    }
  }

  // Update manifest
  manifest.skills = manifest.skills || {};
  manifest.skills.installations = installations;
  writeManifest(manifest, projectPath);
}

/**
 * Handle Commands configuration
 * @param {Object} manifest - Project manifest
 * @param {string} projectPath - Project path
 * @param {Object} msg - i18n messages
 * @param {Object} common - Common i18n messages
 * @param {string} [specificTool] - Specific AI tool to install (non-interactive mode)
 */
async function handleCommandsConfiguration(manifest, projectPath, msg, common, specificTool) {
  const inquirer = await import('inquirer');
  const aiTools = manifest.aiTools || [];

  // Non-interactive mode: install for specific tool
  if (specificTool) {
    const config = getAgentConfig(specificTool);
    if (!config) {
      console.log(chalk.red(`Unknown AI tool: ${specificTool}`));
      console.log(chalk.gray('  Available tools: claude-code, opencode, copilot, gemini-cli, roo-code'));
      return;
    }
    if (!config.supportsCommands) {
      console.log(chalk.yellow(`${getAgentDisplayName(specificTool)} does not support Commands`));
      console.log(chalk.gray('  Tools that support commands: OpenCode, Copilot, Roo Code, Gemini CLI'));
      return;
    }

    const spinner = ora(`Installing Commands for ${getAgentDisplayName(specificTool)}...`).start();
    const result = await installCommandsToMultipleAgents([specificTool], null, projectPath);
    spinner.stop();

    if (result.success) {
      console.log(chalk.green(`Commands installed for ${getAgentDisplayName(specificTool)}`));
    } else {
      console.log(chalk.yellow('Commands installation completed with issues'));
    }

    // Update manifest
    manifest.commands = manifest.commands || {};
    manifest.commands.installations = manifest.commands.installations || [];
    if (!manifest.commands.installations.includes(specificTool)) {
      manifest.commands.installations.push(specificTool);
    }
    writeManifest(manifest, projectPath);
    return;
  }

  // Interactive mode
  // Filter tools that support commands
  const commandSupportedTools = aiTools.filter(tool => {
    const config = getAgentConfig(tool);
    return config?.supportsCommands;
  });

  if (commandSupportedTools.length === 0) {
    console.log(chalk.yellow(msg.noCommandSupportedTools || 'No AI tools with command support configured'));
    console.log(chalk.gray(`  ${msg.commandSupportedList || 'Tools that support commands: OpenCode, Copilot, Roo Code, Gemini CLI'}`));
    return;
  }

  // Show current Commands status
  console.log(chalk.cyan(msg.currentCommandsStatus || 'Current Commands status:'));
  for (const tool of commandSupportedTools) {
    const displayName = getAgentDisplayName(tool);
    const commandsInfo = getInstalledCommandsForAgent(tool, projectPath);

    if (commandsInfo?.installed) {
      console.log(chalk.green(`  ✓ ${displayName}: ${commandsInfo.count} ${msg.commandsInstalled || 'commands'}`));
    } else {
      console.log(chalk.gray(`  ○ ${displayName}: ${msg.notInstalled || 'Not installed'}`));
    }
  }
  console.log();

  // Ask what action to take
  const { action } = await inquirer.default.prompt([
    {
      type: 'list',
      name: 'action',
      message: msg.commandsAction || 'What would you like to do?',
      choices: [
        { name: msg.installCommands || 'Install/Update Commands', value: 'install' },
        { name: msg.viewStatus || 'View status only', value: 'view' },
        { name: common.cancel || 'Cancel', value: 'cancel' }
      ]
    }
  ]);

  if (action === 'cancel' || action === 'view') {
    console.log(chalk.gray(msg.noChanges || 'No changes made'));
    return;
  }

  // Use unified installation prompt
  const selectedAgents = await promptCommandsInstallation(commandSupportedTools);
  if (selectedAgents.length === 0) {
    console.log(chalk.gray(msg.noChanges || 'No changes made'));
    return;
  }

  // Install Commands
  const spinner = ora(msg.installingCommands || 'Installing Commands...').start();
  const result = await installCommandsToMultipleAgents(selectedAgents, null, projectPath);
  spinner.stop();

  if (result.success) {
    console.log(chalk.green(msg.commandsInstallSuccess || 'Commands installed successfully'));
    console.log(chalk.gray(`  ${msg.totalInstalled || 'Total installed'}: ${result.totalInstalled}`));
  } else {
    console.log(chalk.yellow(msg.commandsInstallPartial || 'Commands installed with some issues'));
    if (result.totalErrors > 0) {
      console.log(chalk.red(`  ${msg.errors || 'Errors'}: ${result.totalErrors}`));
    }
  }

  // Update manifest
  manifest.commands = manifest.commands || {};
  manifest.commands.installations = selectedAgents;
  writeManifest(manifest, projectPath);
}
