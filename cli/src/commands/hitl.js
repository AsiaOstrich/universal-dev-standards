import chalk from 'chalk';
import { hitl } from '../hitl/manager.js';

// T12 input validation (XSPEC-292 §9): bound operation description length.
const MAX_OP_LENGTH = 500;

export async function hitlCommand(options) {
  if (!options.op) {
    console.error(chalk.red('Error: --op <operation> is required'));
    return;
  }

  const op = String(options.op).trim();
  if (op.length === 0) {
    console.error(chalk.red('Error: --op must not be empty'));
    return;
  }
  if (op.length > MAX_OP_LENGTH) {
    console.error(chalk.red(`Error: --op must be ≤ ${MAX_OP_LENGTH} characters (got ${op.length})`));
    return;
  }

  const allowed = await hitl.enforce(op, { reason: 'Manual check via CLI' });

  if (allowed) {
    console.log(chalk.green('✅ Approved'));
    process.exit(0);
  } else {
    console.log(chalk.red('❌ Denied'));
    process.exit(1);
  }
}
