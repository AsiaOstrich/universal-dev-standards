import chalk from 'chalk';
import { config } from '../utils/config-manager.js';
import { t } from '../i18n/messages.js';

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
    
    console.log(chalk.green(`✓ Configuration updated (${scope}): ${key} = ${typedValue}`));
    return;
  }

  // Handle 'init' action (Placeholder for Mission Setup)
  if (action === 'init') {
    console.log(chalk.blue('🤖 Initializing Mission-Driven Configuration...'));
    console.log(chalk.gray('(Feature coming in next step: Smart Detection & Mission Selector)'));
    // TODO: Implement smart detection logic here
    return;
  }

  console.error(chalk.red(`Unknown action: ${action}`));
}
