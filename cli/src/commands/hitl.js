import chalk from 'chalk';
import { hitl } from '../hitl/manager.js';

export async function hitlCommand(options) {
  if (!options.op) {
    console.error(chalk.red('Error: --op <operation> is required'));
    return;
  }

  const allowed = await hitl.enforce(options.op, { reason: 'Manual check via CLI' });

  if (allowed) {
    console.log(chalk.green('✅ Approved'));
    process.exit(0);
  } else {
    console.log(chalk.red('❌ Denied'));
    process.exit(1);
  }
}
