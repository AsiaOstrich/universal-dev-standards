import chalk from 'chalk';
import { StandardValidator } from '../utils/standard-validator.js';

/** Process exit code per outcome. 2 means no verdict - it is not a pass. */
export const EXIT_CODES = { pass: 0, fail: 1, 'cannot-simulate': 2 };

export async function simulateCommand(options) {
  if (!options.standard) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, message: 'Error: --standard is required' }));
      process.exit(1);
    }
    console.error(chalk.red('Error: --standard is required'));
    process.exit(1);
  }
  
  if (!options.input) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, message: 'Error: --input is required' }));
      process.exit(1);
    }
    console.error(chalk.red('Error: --input is required'));
    process.exit(1);
  }

  const projectPath = process.cwd();
  const validator = new StandardValidator(projectPath);

  try {
    const result = await validator.simulate(options.standard, options.input);
    // XSPEC-456 R2: exit 0 only for a pass. 1 = the input does not comply, 2 = no verdict could be reached
    // (the same "cannot decide is not a pass" contract as `uds open-work`).
    const exitCode = EXIT_CODES[result.status] ?? EXIT_CODES['cannot-simulate'];

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = exitCode;
      return;
    }

    console.log();
    console.log(chalk.bold(`Simulating compliance for: ${options.standard}`));
    console.log(chalk.gray('Input: ' + options.input));
    console.log(chalk.gray('─'.repeat(50)));

    if (result.status === 'pass') {
      console.log(chalk.green('✓  Simulation Passed'));
      if (result.details) console.log(chalk.gray(result.details));
    } else if (result.status === 'fail') {
      console.log(chalk.red('✗  Simulation Failed: the input does not comply'));
      if (result.details) {
        console.log(chalk.gray('\nDetails:'));
        console.log(chalk.gray(result.details));
      }
    } else {
      console.log(chalk.yellow('⚠  Cannot simulate: no verdict was reached, so this is neither a pass nor a fail'));
      console.log(chalk.yellow(`   ${result.message}`));
      if (result.details) {
        console.log(chalk.gray('\nDetails:'));
        console.log(chalk.gray(result.details));
      }
    }
    process.exitCode = exitCode;
  } catch (error) {
    if (options.json) {
      console.log(JSON.stringify({ status: 'cannot-simulate', success: false, message: error.message }));
      process.exit(EXIT_CODES['cannot-simulate']);
    }
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(EXIT_CODES['cannot-simulate']);
  }
  if (!options.json) console.log();
}
