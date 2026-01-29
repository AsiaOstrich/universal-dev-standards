import chalk from 'chalk';
import inquirer from 'inquirer';
import { config } from '../utils/config-manager.js';
import { msg } from '../i18n/messages.js';

/**
 * Get localized message with fallback
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
 * Handle config command
 * @param {string} action - list, get, set, init
 * @param {string} key - Config key
 * @param {string} value - Config value
 * @param {Object} options - Command options
 */
export async function configCommand(action, key, value, options) {
  // Initialize config manager
  const currentConfig = config.init();

  // Handle 'list' action
  if (action === 'list' || !action) {
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

  if (initType === 'vibe') {
    await initVibeMode(options);
  } else if (initType === 'mission') {
    console.log(chalk.yellow(t('config.missionComingSoon', 'Mission mode setup coming soon!')));
    console.log(chalk.gray(t('config.useStartCommand', 'For now, use: uds start <mission-type> <intent>')));
  } else {
    console.log(chalk.gray(t('config.customHint', 'Use: uds config set <key> <value>')));
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
          name: `${value.name}\n     ${chalk.gray(value.description)}`,
          value: key,
          short: value.name
        }))
      }
    ]);
    preset = selectedPreset;
  }

  const presetConfig = VIBE_PRESETS[preset];
  const scope = options.global ? 'global' : 'project';

  // Show what will be set
  console.log('');
  console.log(chalk.cyan(t('config.applyingPreset', `Applying preset: ${presetConfig.name}`)));
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
