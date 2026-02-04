import chalk from 'chalk';
import { StandardFixer } from '../utils/standard-fixer.js';

export async function fixCommand(options) {
  if (!options.standard) {
    if (options.json) {
      console.log(JSON.stringify({ success: false, message: 'Error: --standard is required' }));
      process.exit(1);
    }
    console.error(chalk.red('Error: --standard is required'));
    process.exit(1);
  }

  const projectPath = process.cwd();
  const fixer = new StandardFixer(projectPath);

  try {
    if (!options.json) {
      console.log();
      console.log(chalk.bold(`Attempting to fix violations for: ${options.standard}`));
      console.log(chalk.gray('─'.repeat(50)));
    }

    const result = await fixer.fix(options.standard);

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      if (!result.success) process.exitCode = 1;
      return;
    }

    if (result.success) {
      if (result.status === 'skipped') {
        console.log(chalk.green('✓  Standard is already valid. No action needed.'));
      } else {
        console.log(chalk.green('✓  Fix applied successfully!'));
      }
    } else {
      console.log(chalk.red('✗  Fix failed'));
      console.log(chalk.red(`   ${result.message}`));
      if (result.details) console.log(chalk.gray(`   ${result.details}`));
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
