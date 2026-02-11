import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { unlinkSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { config } from '../utils/config-manager.js';
import { msg, t as getMessages, setLanguage, isLanguageExplicitlySet } from '../i18n/messages.js';
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
  promptCommandsInstallation,
  promptDisplayLanguage
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
import { getMarketplaceSkillsInfo } from '../utils/github.js';
import { regenerateIntegrations } from './update.js';

/**
 * Get localized message with fallback (for config-specific keys)
 */
function t(key, fallback) {
  return msg(key) || fallback;
}

/**
 * Vibe mode presets for different development styles
 */
const VIBE_PRESETS = {
  relaxed: {
    name: 'Relaxed (Prototype/Hackathon)',
    description: 'Maximum speed, minimal interrupts. Good for rapid prototyping.',
    settings: {
      'hitl.threshold': 4,
      'vibe-coding.enabled': true,
      'vibe-coding.micro-specs.require-confirmation': false,
      'vibe-coding.auto-sweep.enabled': true,
      'vibe-coding.auto-sweep.trigger': 'session-end',
      'vibe-coding.standards-injection.mode': 'soft'
    }
  },
  balanced: {
    name: 'Balanced (Recommended)',
    description: 'Good balance between speed and safety. Confirms critical actions.',
    settings: {
      'hitl.threshold': 2,
      'vibe-coding.enabled': true,
      'vibe-coding.micro-specs.require-confirmation': true,
      'vibe-coding.auto-sweep.enabled': true,
      'vibe-coding.auto-sweep.trigger': 'session-end',
      'vibe-coding.standards-injection.mode': 'soft'
    }
  },
  strict: {
    name: 'Strict (Production)',
    description: 'Maximum safety. Confirms most actions. Good for production code.',
    settings: {
      'hitl.threshold': 1,
      'vibe-coding.enabled': true,
      'vibe-coding.micro-specs.require-confirmation': true,
      'vibe-coding.auto-sweep.enabled': true,
      'vibe-coding.auto-sweep.trigger': 'commit-hook',
      'vibe-coding.standards-injection.mode': 'strict'
    }
  }
};

/**
 * Handle config command — unified entry point
 * @param {string} action - list, get, set, init
 * @param {string} key - Config key
 * @param {string} value - Config value
 * @param {Object} options - Command options
 */
export async function configCommand(action, key, value, options) {
  // Initialize config manager
  const currentConfig = config.init();

  // Handle 'list' action explicitly
  if (action === 'list') {
    console.log(chalk.bold('Current Configuration:'));
    console.log(JSON.stringify(currentConfig, null, 2));
    return;
  }

  // Handle 'get' action
  if (action === 'get') {
    if (!key) {
      console.error(chalk.red('Error: Key is required for get command'));
      return;
    }
    const val = config.get(key);
    console.log(val !== undefined ? val : chalk.gray('undefined'));
    return;
  }

  // Handle 'set' action
  if (action === 'set') {
    if (!key || value === undefined) {
      console.error(chalk.red('Error: Key and value are required for set command'));
      return;
    }

    // Type inference
    let typedValue = value;
    if (value === 'true') typedValue = true;
    if (value === 'false') typedValue = false;
    if (!isNaN(Number(value))) typedValue = Number(value);

    const scope = options.global ? 'global' : 'project';
    config.set(key, typedValue, scope);

    console.log(chalk.green(`Configuration updated (${scope}): ${key} = ${typedValue}`));
    return;
  }

  // Handle 'init' action
  if (action === 'init') {
    await handleConfigInit(options);
    return;
  }

  // No action: check for --type (direct project configuration) or show interactive menu
  if (!action) {
    // --type provided: go directly to project configuration
    if (options.type) {
      return runProjectConfiguration(options);
    }

    // --yes flag with no action: non-interactive mode, show JSON config
    if (options.yes) {
      console.log(chalk.bold('Current Configuration:'));
      console.log(JSON.stringify(currentConfig, null, 2));
      return;
    }

    // No arguments at all: show unified interactive menu
    const projectPath = process.cwd();
    const initialized = isInitialized(projectPath);

    // Set language from manifest (same pattern as runProjectConfiguration)
    if (initialized && !isLanguageExplicitlySet()) {
      const manifest = readManifest(projectPath);
      if (manifest) {
        const uiLang = manifest.options?.display_language || 'en';
        setLanguage(uiLang);
      }
    }

    const menuChoices = [];

    if (initialized) {
      menuChoices.push({
        name: t('config.menuProjectSettings', 'Project settings (level, AI tools, Skills, format, workflow...)'),
        value: 'project'
      });
    }

    menuChoices.push({
      name: t('config.menuPreferences', 'Preferences (UI language, HITL threshold, Vibe Coding)'),
      value: 'preferences'
    });

    menuChoices.push({
      name: t('config.menuShowConfig', 'Show current configuration (JSON)'),
      value: 'show'
    });

    const { menuChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'menuChoice',
        message: t('config.menuQuestion', 'What would you like to configure?'),
        choices: menuChoices
      }
    ]);

    if (menuChoice === 'project') {
      return runProjectConfiguration(options);
    } else if (menuChoice === 'preferences') {
      await handleConfigInit(options);
      return;
    } else if (menuChoice === 'show') {
      console.log(chalk.bold('Current Configuration:'));
      console.log(JSON.stringify(currentConfig, null, 2));
      return;
    }

    return;
  }

  console.error(chalk.red(`Unknown action: ${action}`));
}

/**
 * Handle config init with optional --vibe-mode
 * @param {Object} options - Command options
 */
async function handleConfigInit(options) {
  console.log('');
  console.log(chalk.bold(t('config.initTitle', 'UDS Configuration Setup')));
  console.log('');

  // Check for --vibe-mode flag
  if (options.vibeMode) {
    await initVibeMode(options);
    return;
  }

  // Default init: show menu
  const { initType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'initType',
      message: t('config.initQuestion', 'What would you like to configure?'),
      choices: [
        {
          name: t('config.displayLanguageOption', 'Display Language - Change UI language'),
          value: 'display_language'
        },
        {
          name: t('config.vibeMode', 'Vibe Coding Mode - For AI-assisted development'),
          value: 'vibe'
        },
        {
          name: t('config.missionMode', 'Mission Mode - For goal-oriented development'),
          value: 'mission'
        },
        {
          name: t('config.customMode', 'Custom - Set individual options'),
          value: 'custom'
        }
      ]
    }
  ]);

  if (initType === 'display_language') {
    await handleDisplayLanguageChange();
    return;
  } else if (initType === 'vibe') {
    await initVibeMode(options);
  } else if (initType === 'mission') {
    console.log(chalk.yellow(t('config.missionComingSoon', 'Mission mode setup coming soon!')));
    console.log(chalk.gray(t('config.useStartCommand', 'For now, use: uds start <mission-type> <intent>')));
  } else {
    console.log(chalk.gray(t('config.customHint', 'Use: uds config set <key> <value>')));
  }
}

/**
 * Handle display language change
 */
async function handleDisplayLanguageChange() {
  const projectPath = process.cwd();
  const initialized = isInitialized(projectPath);
  let currentLang = config.get('ui.language') || 'en';

  if (initialized) {
    const manifest = readManifest(projectPath);
    if (manifest?.options?.display_language) {
      currentLang = manifest.options.display_language;
    }
  }

  const langNames = { en: 'English', 'zh-tw': '繁體中文', 'zh-cn': '简体中文' };
  console.log(chalk.gray(`  ${t('config.currentLanguage', 'Current language')}: ${langNames[currentLang] || currentLang}`));

  const newLang = await promptDisplayLanguage();

  if (newLang === currentLang) {
    console.log(chalk.gray(t('config.noLanguageChange', 'Language unchanged.')));
    return;
  }

  if (!initialized) {
    const common = getMessages().commands.common;
    console.log(chalk.red(common.notInitialized));
    console.log(chalk.gray(`  ${common.runInit}`));
    return;
  }

  const manifest = readManifest(projectPath);
  if (manifest) {
    manifest.options = manifest.options || {};
    manifest.options.display_language = newLang;
    writeManifest(manifest, projectPath);
    console.log(chalk.green(t('config.languageUpdated', 'Display language updated!')));

    // Offer to regenerate integrations if AI tools are configured
    if (manifest.aiTools?.length > 0) {
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: t('config.regenerateForLanguage', 'Regenerate AI tool integrations with new language?'),
        default: true
      }]);

      if (confirm) {
        const spinner = (await import('ora')).default(t('config.applyingPreset', 'Applying...')).start();
        regenerateIntegrations(projectPath, manifest);
        writeManifest(manifest, projectPath);
        spinner.succeed(t('config.languageUpdated', 'Display language updated!'));
      }
    }
  }
}

/**
 * Initialize Vibe Coding mode
 * @param {Object} options - Command options
 */
async function initVibeMode(options) {
  console.log(chalk.bold(t('config.vibeModeTitle', 'Vibe Coding Configuration')));
  console.log(chalk.gray(t('config.vibeModeDesc', 'Configure UDS for natural language-driven development')));
  console.log('');

  // Select preset
  let preset;
  if (options.yes) {
    preset = 'balanced';
  } else {
    const { selectedPreset } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedPreset',
        message: t('config.selectPreset', 'Select a preset:'),
        choices: Object.entries(VIBE_PRESETS).map(([key, value]) => ({
          name: `${t(`config.presets.${key}.name`, value.name)}\n     ${chalk.gray(t(`config.presets.${key}.description`, value.description))}`,
          value: key,
          short: t(`config.presets.${key}.name`, value.name)
        }))
      }
    ]);
    preset = selectedPreset;
  }

  const presetConfig = VIBE_PRESETS[preset];
  const scope = options.global ? 'global' : 'project';

  // Show what will be set
  console.log('');
  const presetName = t(`config.presets.${preset}.name`, presetConfig.name);
  console.log(chalk.cyan(`${t('config.applyingPreset', 'Applying preset:')} ${presetName}`));
  console.log(chalk.gray('─'.repeat(50)));

  for (const [key, value] of Object.entries(presetConfig.settings)) {
    console.log(`  ${key}: ${chalk.yellow(value)}`);
  }
  console.log(chalk.gray('─'.repeat(50)));

  // Confirm unless --yes
  if (!options.yes) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: t('config.confirmApply', 'Apply these settings?'),
        default: true
      }
    ]);

    if (!confirm) {
      console.log(chalk.gray(t('config.cancelled', 'Configuration cancelled.')));
      return;
    }
  }

  // Apply settings
  for (const [key, value] of Object.entries(presetConfig.settings)) {
    config.set(key, value, scope);
  }

  console.log('');
  console.log(chalk.green(t('config.vibeEnabled', 'Vibe Coding mode enabled!')));
  console.log('');
  console.log(chalk.gray(t('config.nextSteps', 'Next steps:')));
  console.log(chalk.gray(`  • ${t('config.useSpec', 'Generate specs:')} uds spec create "your idea"`));
  console.log(chalk.gray(`  • ${t('config.useSweep', 'Clean up code:')} uds sweep`));
  console.log(chalk.gray(`  • ${t('config.useStart', 'Start a mission:')} uds start greenfield "MyApp"`));
}

/**
 * Run project configuration (formerly configureCommand)
 * @param {Object} options - Command options
 */
export async function runProjectConfiguration(options) {
  const projectPath = process.cwd();

  // Check if initialized first
  if (!isInitialized(projectPath)) {
    const common = getMessages().commands.common;
    console.log(chalk.red(common.notInitialized));
    console.log(chalk.gray(`  ${common.runInit}`));
    return;
  }

  // Read manifest and set language before using getMessages()
  const manifest = readManifest(projectPath);
  if (!manifest) {
    const common = getMessages().commands.common;
    console.log(chalk.red(common.couldNotReadManifest));
    return;
  }

  // Set UI language based on display_language setting
  // Only override if user didn't explicitly set --ui-lang flag
  if (!isLanguageExplicitlySet()) {
    const uiLang = manifest.options?.display_language || 'en';
    setLanguage(uiLang);
  }

  // Now get localized messages
  const msgObj = getMessages().commands.configure;
  const common = getMessages().commands.common;

  console.log();
  console.log(chalk.bold(msgObj.title));
  console.log(chalk.gray('─'.repeat(50)));

  console.log();
  console.log(chalk.cyan(msgObj.currentConfig));
  console.log(chalk.gray(`  ${common.level}: ${manifest.level || 2}`));
  console.log(chalk.gray(`  ${common.format}: ${manifest.format || 'human'}`));
  console.log(chalk.gray(`  ${common.contentMode}: ${manifest.contentMode || 'minimal'}`));
  console.log(chalk.gray(`  ${common.aiTools}: ${manifest.aiTools?.length > 0 ? manifest.aiTools.join(', ') : common.none}`));
  // Only show methodology with -E flag (completely hidden otherwise)
  if (options.experimental && manifest.methodology?.active) {
    console.log(chalk.gray(`  ${common.methodology}: ${manifest.methodology.active.toUpperCase()}`) + chalk.yellow(` ${msgObj.experimental}`));
  }
  if (manifest.options) {
    if (manifest.options.workflow) {
      console.log(chalk.gray(`  ${msgObj.gitWorkflow}: ${manifest.options.workflow}`));
    }
    if (manifest.options.merge_strategy) {
      console.log(chalk.gray(`  ${msgObj.mergeStrategy}: ${manifest.options.merge_strategy}`));
    }
    if (manifest.options.commit_language) {
      console.log(chalk.gray(`  ${msgObj.commitLanguage}: ${manifest.options.commit_language}`));
    }
    if (manifest.options.test_levels && manifest.options.test_levels.length > 0) {
      console.log(chalk.gray(`  ${msgObj.testLevels}: ${manifest.options.test_levels.join(', ')}`));
    }
  }
  console.log();

  // Determine what to configure based on options or interactive mode
  let configType = options.type || null;

  if (!configType) {
    const inq = await import('inquirer');

    // Build choices array - methodology only shown with -E flag
    const baseChoices = [
      { name: msgObj.optionFormat, value: 'format' },
      { name: msgObj.optionWorkflow, value: 'workflow' },
      { name: msgObj.optionMergeStrategy, value: 'merge_strategy' },
      { name: msgObj.optionCommitLanguage, value: 'commit_language' },
      { name: msgObj.optionTestLevels, value: 'test_levels' },
      new inq.default.Separator(),
      { name: chalk.cyan(msgObj.optionAITools), value: 'ai_tools' },
      { name: chalk.cyan(msgObj.optionSkills || 'Manage Skills installations'), value: 'skills' },
      { name: chalk.cyan(msgObj.optionCommands || 'Manage Commands installations'), value: 'commands' },
      new inq.default.Separator(),
      { name: chalk.cyan(msgObj.optionLevel), value: 'level' },
      { name: chalk.cyan(msgObj.optionContentMode), value: 'content_mode' }
    ];

    // Only add methodology option when -E flag is used
    if (options.experimental) {
      baseChoices.push(
        { name: `${chalk.cyan(msgObj.optionMethodology)} ${chalk.yellow(msgObj.experimental)}`, value: 'methodology' }
      );
    }

    baseChoices.push(
      new inq.default.Separator(),
      { name: msgObj.optionAll, value: 'all' }
    );

    const { type } = await inq.default.prompt([
      {
        type: 'list',
        name: 'type',
        message: msgObj.selectOption,
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
      const spinner = ora(msgObj.removingIntegrations).start();
      for (const tool of result.tools) {
        const filePath = join(projectPath, getToolFilePath(tool));
        if (existsSync(filePath)) {
          try {
            unlinkSync(filePath);
            console.log(chalk.gray(`  ${msgObj.removed}: ${getToolFilePath(tool)}`));
          } catch (err) {
            console.log(chalk.yellow(`  ${msgObj.couldNotRemove}: ${getToolFilePath(tool)}`));
          }
        }
      }
      spinner.succeed(msgObj.integrationsRemoved);
    } else if (result.action === 'view' || result.action === 'cancel') {
      console.log(chalk.gray(msgObj.noChanges));
      process.exit(0);
    }
  }

  // Handle Skills configuration
  if (configType === 'skills') {
    await handleSkillsConfiguration(manifest, projectPath, msgObj, common, options.aiTool, options.skillsLocation);
    process.exit(0);
  }

  // Handle Commands configuration
  if (configType === 'commands') {
    await handleCommandsConfiguration(manifest, projectPath, msgObj, common, options.aiTool);
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
  console.log(chalk.cyan(msgObj.newConfig));
  console.log(chalk.gray(`  ${common.level}: ${newLevel}`));
  console.log(chalk.gray(`  ${common.format}: ${newFormat}`));
  console.log(chalk.gray(`  ${common.contentMode}: ${newContentMode}`));
  console.log(chalk.gray(`  ${common.aiTools}: ${newAITools.length > 0 ? newAITools.join(', ') : common.none}`));
  if (newMethodology) {
    console.log(chalk.gray(`  ${common.methodology}: ${newMethodology.toUpperCase()}`));
  }
  if (newOptions.workflow) {
    console.log(chalk.gray(`  ${msgObj.gitWorkflow}: ${newOptions.workflow}`));
  }
  if (newOptions.merge_strategy) {
    console.log(chalk.gray(`  ${msgObj.mergeStrategy}: ${newOptions.merge_strategy}`));
  }
  if (newOptions.commit_language) {
    console.log(chalk.gray(`  ${msgObj.commitLanguage}: ${newOptions.commit_language}`));
  }
  if (newOptions.test_levels && newOptions.test_levels.length > 0) {
    console.log(chalk.gray(`  ${msgObj.testLevels}: ${newOptions.test_levels.join(', ')}`));
  }
  console.log();

  // Confirm (skip if --yes flag is provided)
  if (!options.yes) {
    const confirmed = await promptConfirm(msgObj.applyChanges);
    if (!confirmed) {
      console.log(chalk.yellow(msgObj.configCancelled));
      process.exit(0);
    }
  }

  // Apply changes
  const spinner = ora(msgObj.updatingConfig).start();

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
    const levelSpinner = ora(msgObj.addingStandards).start();
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
    levelSpinner.succeed(msgObj.standardsAdded);
  }

  // Regenerate integration files if needed
  if (needsIntegrationRegeneration && newAITools.length > 0) {
    const intSpinner = ora(msgObj.regeneratingIntegrations).start();

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
        level: newLevel,
        // Pass commit_language for dynamic commit standards generation
        commitLanguage: newOptions.commit_language || 'english'
      };

      const result = writeIntegrationFile(tool, toolConfig, projectPath);
      if (result.success) {
        results.generated.push(result.path);
        generatedFiles.add(targetFile);
      } else {
        results.errors.push(`${tool}: ${result.error}`);
      }
    }
    intSpinner.succeed(msgObj.regeneratedIntegrations.replace('{count}', results.generated.length));
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

  spinner.succeed(msgObj.configUpdated);

  // Summary
  console.log();
  console.log(chalk.green(msgObj.configSuccess));
  if (results.copied.length > 0) {
    console.log(chalk.gray(`  ${msgObj.newOptionsCopied.replace('{count}', results.copied.length)}`));
  }
  if (results.generated.length > 0) {
    console.log(chalk.gray(`  ${msgObj.integrationsRegenerated.replace('{count}', results.generated.length)}`));
  }

  if (results.errors.length > 0) {
    console.log();
    console.log(chalk.yellow(msgObj.errorsOccurred.replace('{count}', results.errors.length)));
    for (const err of results.errors) {
      console.log(chalk.gray(`    ${err}`));
    }
  }

  // Smart apply: offer to regenerate integrations if config changed but not already regenerated
  // Skip for types that have their own flow or don't affect integrations
  const skipApplyTypes = ['skills', 'commands', 'methodology'];
  const alreadyRegenerated = results.generated.length > 0;
  const shouldOfferApply = !skipApplyTypes.includes(configType) &&
                           newAITools.length > 0 &&
                           !alreadyRegenerated;

  if (shouldOfferApply) {
    console.log();

    if (options.yes) {
      // --yes flag: auto-apply without prompting
      const applySpinner = ora(msgObj.applyingChanges).start();
      const applyResults = regenerateIntegrations(projectPath, manifest);
      applySpinner.succeed(msgObj.changesApplied || msgObj.regeneratedIntegrations.replace('{count}', applyResults.updated.length));

      // Update manifest with new file hashes
      writeManifest(manifest, projectPath);

      if (applyResults.errors.length > 0) {
        console.log(chalk.yellow(msgObj.errorsOccurred.replace('{count}', applyResults.errors.length)));
        for (const err of applyResults.errors) {
          console.log(chalk.gray(`    ${err}`));
        }
      }
    } else {
      // Interactive mode: prompt user
      const inq = await import('inquirer');
      const { apply } = await inq.default.prompt([{
        type: 'confirm',
        name: 'apply',
        message: msgObj.applyChangesNow,
        default: true
      }]);

      if (apply) {
        const applySpinner = ora(msgObj.applyingChanges).start();
        const applyResults = regenerateIntegrations(projectPath, manifest);
        applySpinner.succeed(msgObj.changesApplied || msgObj.regeneratedIntegrations.replace('{count}', applyResults.updated.length));

        // Update manifest with new file hashes
        writeManifest(manifest, projectPath);

        if (applyResults.errors.length > 0) {
          console.log(chalk.yellow(msgObj.errorsOccurred.replace('{count}', applyResults.errors.length)));
          for (const err of applyResults.errors) {
            console.log(chalk.gray(`    ${err}`));
          }
        }
      } else {
        console.log(chalk.gray(msgObj.runUpdateLater));
      }
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
 * @param {Object} msgObj - i18n messages
 * @param {Object} common - Common i18n messages
 * @param {string} [specificTool] - Specific AI tool to install (non-interactive mode)
 * @param {string} [skillsLocation] - Skills installation location (project, user) for non-interactive mode
 */
async function handleSkillsConfiguration(manifest, projectPath, msgObj, common, specificTool, skillsLocation) {
  const inq = await import('inquirer');
  const aiTools = manifest.aiTools || [];

  // Non-interactive mode: install for specific tool
  if (specificTool) {
    const agentCfg = getAgentConfig(specificTool);
    if (!agentCfg) {
      console.log(chalk.red(`Unknown AI tool: ${specificTool}`));
      console.log(chalk.gray('  Available tools: claude-code, opencode, copilot, gemini-cli, roo-code, cursor, windsurf, cline, codex'));
      return;
    }
    if (!agentCfg.supportsSkills) {
      console.log(chalk.yellow(`${getAgentDisplayName(specificTool)} does not support Skills`));
      return;
    }

    // Validate skillsLocation if provided
    const validLocations = ['project', 'user'];
    const level = skillsLocation && validLocations.includes(skillsLocation) ? skillsLocation : 'project';

    // Install to specified level (defaults to project)
    const installations = [{ agent: specificTool, level }];
    const spinner = ora(`Installing Skills for ${getAgentDisplayName(specificTool)} (${level} level)...`).start();
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
    console.log(chalk.yellow(msgObj.noAiToolsConfigured || 'No AI tools configured'));
    console.log(chalk.gray(`  ${msgObj.addAiToolsFirst || 'Add AI tools first with: uds config --type ai_tools'}`));
    return;
  }

  // Get declined skills from manifest
  const declinedSkills = manifest.declinedFeatures?.skills || [];

  // Check if Skills are installed via marketplace (Claude Code only)
  const marketplaceInfo = getMarketplaceSkillsInfo();
  const hasMarketplaceSkills = marketplaceInfo?.installed;

  // Show current Skills status
  console.log(chalk.cyan(msgObj.currentSkillsStatus || 'Current Skills status:'));

  // Show marketplace status if applicable
  if (hasMarketplaceSkills && aiTools.includes('claude-code')) {
    console.log(chalk.green(`  ✓ ${msgObj.viaMarketplace || 'Via Marketplace'}: ${marketplaceInfo.version || 'installed'}`));
  }

  for (const tool of aiTools) {
    const agentCfg = getAgentConfig(tool);
    if (!agentCfg?.supportsSkills) continue;

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
    } else if (declinedSkills.includes(tool)) {
      console.log(chalk.yellow(`  ⊘ ${displayName}: ${msgObj.previouslyDeclined || 'Previously declined'}`));
    } else if (hasMarketplaceSkills && tool === 'claude-code') {
      // Claude Code has marketplace skills but no file-based installation
      console.log(chalk.cyan(`  ◎ ${displayName}: ${msgObj.marketplaceOnly || 'Marketplace only (no local files)'}`));
    } else {
      console.log(chalk.gray(`  ○ ${displayName}: ${msgObj.notInstalled || 'Not installed'}`));
    }
  }

  // Show marketplace coexistence note if user might want to install local files
  if (hasMarketplaceSkills && aiTools.includes('claude-code')) {
    console.log();
    console.log(chalk.cyan(`  ℹ ${msgObj.marketplaceCoexistNote || 'Note: File-based installation will coexist with Marketplace version'}`));
  }
  console.log();

  // Build menu choices
  const menuChoices = [
    { name: msgObj.installSkills || 'Install/Update Skills', value: 'install' }
  ];

  // Add reinstall declined option if there are declined skills
  if (declinedSkills.length > 0) {
    menuChoices.push({
      name: msgObj.reinstallDeclinedSkills || 'Reinstall declined Skills',
      value: 'reinstall_declined'
    });
  }

  menuChoices.push(
    { name: msgObj.viewStatus || 'View status only', value: 'view' },
    { name: common.cancelled || 'Cancel', value: 'cancel' }
  );

  // Ask what action to take
  const { action } = await inq.default.prompt([
    {
      type: 'list',
      name: 'action',
      message: msgObj.skillsAction || 'What would you like to do?',
      choices: menuChoices
    }
  ]);

  if (action === 'cancel' || action === 'view') {
    console.log(chalk.gray(msgObj.noChanges || 'No changes made'));
    return;
  }

  // Handle reinstall declined action
  if (action === 'reinstall_declined') {
    // Get only the declined tools that support skills
    const declinedToolsWithSupport = declinedSkills.filter(tool => {
      const agentCfg = getAgentConfig(tool);
      return agentCfg?.supportsSkills;
    });

    if (declinedToolsWithSupport.length === 0) {
      console.log(chalk.gray(msgObj.noChanges || 'No changes made'));
      return;
    }

    // Prompt for installation level
    const { skillsLevel } = await inq.default.prompt([{
      type: 'list',
      name: 'skillsLevel',
      message: msgObj.skillsLevelQuestion || 'Where should Skills be installed?',
      choices: [
        { name: `${msgObj.projectLevel || 'Project level'} (.claude/skills/, etc.)`, value: 'project' },
        { name: `${msgObj.userLevel || 'User level'} (~/.claude/skills/, etc.)`, value: 'user' }
      ],
      default: 'project'
    }]);

    const installations = declinedToolsWithSupport.map(agent => ({
      agent,
      location: skillsLevel
    }));

    // Install Skills
    const spinner = ora(msgObj.installingSkills || 'Installing Skills...').start();
    const result = await installSkillsToMultipleAgents(installations, null, projectPath);
    spinner.stop();

    if (result.success) {
      console.log(chalk.green(msgObj.skillsInstallSuccess || 'Skills installed successfully'));
      console.log(chalk.gray(`  ${msgObj.totalInstalled || 'Total installed'}: ${result.totalInstalled}`));
    } else {
      console.log(chalk.yellow(msgObj.skillsInstallPartial || 'Skills installed with some issues'));
      if (result.totalErrors > 0) {
        console.log(chalk.red(`  ${msgObj.errors || 'Errors'}: ${result.totalErrors}`));
      }
    }

    // Update manifest - clear declined status for installed tools
    manifest.skills = manifest.skills || {};
    manifest.skills.installations = installations;
    if (manifest.declinedFeatures?.skills) {
      manifest.declinedFeatures.skills = manifest.declinedFeatures.skills.filter(
        tool => !declinedToolsWithSupport.includes(tool)
      );
    }
    writeManifest(manifest, projectPath);
    return;
  }

  // Use unified installation prompt
  const installations = await promptSkillsInstallLocation(aiTools);
  if (installations.length === 0) {
    console.log(chalk.gray(msgObj.noChanges || 'No changes made'));
    return;
  }

  // Install Skills
  const spinner = ora(msgObj.installingSkills || 'Installing Skills...').start();
  const result = await installSkillsToMultipleAgents(installations, null, projectPath);
  spinner.stop();

  if (result.success) {
    console.log(chalk.green(msgObj.skillsInstallSuccess || 'Skills installed successfully'));
    console.log(chalk.gray(`  ${msgObj.totalInstalled || 'Total installed'}: ${result.totalInstalled}`));
  } else {
    console.log(chalk.yellow(msgObj.skillsInstallPartial || 'Skills installed with some issues'));
    if (result.totalErrors > 0) {
      console.log(chalk.red(`  ${msgObj.errors || 'Errors'}: ${result.totalErrors}`));
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
 * @param {Object} msgObj - i18n messages
 * @param {Object} common - Common i18n messages
 * @param {string} [specificTool] - Specific AI tool to install (triggers interactive prompt for level)
 */
async function handleCommandsConfiguration(manifest, projectPath, msgObj, common, specificTool) {
  const inq = await import('inquirer');
  const aiTools = manifest.aiTools || [];

  // Semi-interactive mode: install for specific tool (prompt for level)
  if (specificTool) {
    const agentCfg = getAgentConfig(specificTool);
    if (!agentCfg) {
      console.log(chalk.red(`Unknown AI tool: ${specificTool}`));
      console.log(chalk.gray('  Available tools: claude-code, opencode, copilot, gemini-cli, roo-code'));
      return;
    }
    if (agentCfg.commands === null) {
      console.log(chalk.yellow(`${getAgentDisplayName(specificTool)} does not support Commands`));
      console.log(chalk.gray('  Tools that support commands: OpenCode, Copilot, Roo Code, Gemini CLI'));
      return;
    }

    // Prompt for installation level
    const { commandsLevel } = await inq.default.prompt([{
      type: 'list',
      name: 'commandsLevel',
      message: msgObj.commandsLevelQuestion || 'Where should Commands be installed?',
      choices: [
        { name: `${msgObj.projectLevel || 'Project level'} (${agentCfg.commands.project}) (${msgObj.recommended || 'Recommended'})`, value: 'project' },
        { name: `${msgObj.userLevel || 'User level'} (${agentCfg.commands.user})`, value: 'user' }
      ],
      default: 'project'
    }]);

    // Install to selected level
    const installations = [{ agent: specificTool, level: commandsLevel }];
    const spinner = ora(`Installing Commands for ${getAgentDisplayName(specificTool)} (${commandsLevel} level)...`).start();
    const result = await installCommandsToMultipleAgents(installations, null, projectPath);
    spinner.stop();

    if (result.success) {
      console.log(chalk.green(`Commands installed for ${getAgentDisplayName(specificTool)}`));
    } else {
      console.log(chalk.yellow('Commands installation completed with issues'));
    }

    // Update manifest
    manifest.commands = manifest.commands || {};
    manifest.commands.installations = manifest.commands.installations || [];
    const existing = manifest.commands.installations.findIndex(i =>
      typeof i === 'string' ? i === specificTool : i.agent === specificTool
    );
    if (existing >= 0) {
      manifest.commands.installations[existing] = installations[0];
    } else {
      manifest.commands.installations.push(installations[0]);
    }
    writeManifest(manifest, projectPath);
    return;
  }

  // Interactive mode
  // Filter tools that support commands (commands !== null means support)
  const commandSupportedTools = aiTools.filter(tool => {
    const agentCfg = getAgentConfig(tool);
    return agentCfg?.commands !== null;
  });

  if (commandSupportedTools.length === 0) {
    console.log(chalk.yellow(msgObj.noCommandSupportedTools || 'No AI tools with command support configured'));
    console.log(chalk.gray(`  ${msgObj.commandSupportedList || 'Tools that support commands: OpenCode, Copilot, Roo Code, Gemini CLI'}`));
    return;
  }

  // Get declined commands from manifest
  const declinedCommands = manifest.declinedFeatures?.commands || [];

  // Show current Commands status (check both project and user levels)
  console.log(chalk.cyan(msgObj.currentCommandsStatus || 'Current Commands status:'));
  for (const tool of commandSupportedTools) {
    const displayName = getAgentDisplayName(tool);
    const projectCmdInfo = getInstalledCommandsForAgent(tool, 'project', projectPath);
    const userCmdInfo = getInstalledCommandsForAgent(tool, 'user');

    if (projectCmdInfo?.installed || userCmdInfo?.installed) {
      console.log(chalk.green(`  ✓ ${displayName}:`));
      if (userCmdInfo?.installed) {
        console.log(chalk.gray(`    - User: ${userCmdInfo.count} commands`));
      }
      if (projectCmdInfo?.installed) {
        console.log(chalk.gray(`    - Project: ${projectCmdInfo.count} commands`));
      }
    } else if (declinedCommands.includes(tool)) {
      console.log(chalk.yellow(`  ⊘ ${displayName}: ${msgObj.previouslyDeclined || 'Previously declined'}`));
    } else {
      console.log(chalk.gray(`  ○ ${displayName}: ${msgObj.notInstalled || 'Not installed'}`));
    }
  }
  console.log();

  // Build menu choices
  const menuChoices = [
    { name: msgObj.installCommands || 'Install/Update Commands', value: 'install' }
  ];

  // Add reinstall declined option if there are declined commands
  const declinedCommandsWithSupport = declinedCommands.filter(tool =>
    commandSupportedTools.includes(tool)
  );
  if (declinedCommandsWithSupport.length > 0) {
    menuChoices.push({
      name: msgObj.reinstallDeclinedCommands || 'Reinstall declined Commands',
      value: 'reinstall_declined'
    });
  }

  menuChoices.push(
    { name: msgObj.viewStatus || 'View status only', value: 'view' },
    { name: common.cancelled || 'Cancel', value: 'cancel' }
  );

  // Ask what action to take
  const { action } = await inq.default.prompt([
    {
      type: 'list',
      name: 'action',
      message: msgObj.commandsAction || 'What would you like to do?',
      choices: menuChoices
    }
  ]);

  if (action === 'cancel' || action === 'view') {
    console.log(chalk.gray(msgObj.noChanges || 'No changes made'));
    return;
  }

  // Handle reinstall declined action
  if (action === 'reinstall_declined') {
    if (declinedCommandsWithSupport.length === 0) {
      console.log(chalk.gray(msgObj.noChanges || 'No changes made'));
      return;
    }

    // Install Commands
    const spinner = ora(msgObj.installingCommands || 'Installing Commands...').start();
    const result = await installCommandsToMultipleAgents(declinedCommandsWithSupport, null, projectPath);
    spinner.stop();

    if (result.success) {
      console.log(chalk.green(msgObj.commandsInstallSuccess || 'Commands installed successfully'));
      console.log(chalk.gray(`  ${msgObj.totalInstalled || 'Total installed'}: ${result.totalInstalled}`));
    } else {
      console.log(chalk.yellow(msgObj.commandsInstallPartial || 'Commands installed with some issues'));
      if (result.totalErrors > 0) {
        console.log(chalk.red(`  ${msgObj.errors || 'Errors'}: ${result.totalErrors}`));
      }
    }

    // Update manifest - clear declined status for installed tools
    manifest.commands = manifest.commands || {};
    manifest.commands.installations = declinedCommandsWithSupport;
    if (manifest.declinedFeatures?.commands) {
      manifest.declinedFeatures.commands = manifest.declinedFeatures.commands.filter(
        tool => !declinedCommandsWithSupport.includes(tool)
      );
    }
    writeManifest(manifest, projectPath);
    return;
  }

  // Use unified installation prompt
  const selectedAgents = await promptCommandsInstallation(commandSupportedTools);
  if (selectedAgents.length === 0) {
    console.log(chalk.gray(msgObj.noChanges || 'No changes made'));
    return;
  }

  // Install Commands
  const spinner = ora(msgObj.installingCommands || 'Installing Commands...').start();
  const result = await installCommandsToMultipleAgents(selectedAgents, null, projectPath);
  spinner.stop();

  if (result.success) {
    console.log(chalk.green(msgObj.commandsInstallSuccess || 'Commands installed successfully'));
    console.log(chalk.gray(`  ${msgObj.totalInstalled || 'Total installed'}: ${result.totalInstalled}`));
  } else {
    console.log(chalk.yellow(msgObj.commandsInstallPartial || 'Commands installed with some issues'));
    if (result.totalErrors > 0) {
      console.log(chalk.red(`  ${msgObj.errors || 'Errors'}: ${result.totalErrors}`));
    }
  }

  // Update manifest
  manifest.commands = manifest.commands || {};
  manifest.commands.installations = selectedAgents;
  writeManifest(manifest, projectPath);
}
