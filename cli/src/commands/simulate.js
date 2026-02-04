import chalk from 'chalk';
import { StandardValidator } from '../utils/standard-validator.js';

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

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      if (!result.success) process.exitCode = 1;
      return;
    }

    console.log();
    console.log(chalk.bold(`Simulating compliance for: ${options.standard}`));
    console.log(chalk.gray('Input: ' + options.input));
    console.log(chalk.gray('─'.repeat(50)));

    if (result.success) {
      console.log(chalk.green('✓  Simulation Passed'));
      if (result.details) console.log(chalk.gray(result.details));
    } else {
      console.log(chalk.red('✗  Simulation Failed'));
      console.log(chalk.red(`   ${result.message}`));
      if (result.details) {
        console.log(chalk.gray('\nDetails:'));
        console.log(chalk.gray(result.details));
      }
      process.exitCode = 1;
    }
  } catch (error) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, message: error.message }));
      process.exit(1);
    }
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
  if (!options.json) console.log();
}
