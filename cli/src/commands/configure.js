import { runProjectConfiguration } from './config.js';

/**
 * Configure command - alias for `uds config` project settings
 * @param {Object} options - Command options
 */
export async function configureCommand(options) {
  return runProjectConfiguration(options);
}
