import chalk from 'chalk';
import inquirer from 'inquirer';
import { RiskClassifier } from './classifier.js';
import { Checkpoint } from './checkpoint.js';
import { config } from '../utils/config-manager.js';

export class HitlManager {
  constructor() {
    this.classifier = new RiskClassifier();
    this.checkpoint = new Checkpoint();
  }

  /**
   * Enforce HITL protocol for an operation.
   * @param {string} operation - Operation description (e.g. "delete file src/main.js")
   * @param {Object} context - Additional context
   * @returns {Promise<boolean>} true if allowed, false if blocked
   */
  async enforce(operation, context = {}) {
    const riskLevel = this.classifier.classify(operation);
    const hitlConfig = config.get('hitl', { threshold: 2 });
    
    const decision = this.checkpoint.evaluate(riskLevel, hitlConfig, operation);

    if (decision === 'approve') {
      // Auto-approve logic could log here if needed
      return true;
    }

    if (decision === 'deny') {
      console.log(chalk.red(''));
      console.log(chalk.red(`⛔ Operation Blocked (Risk Level ${riskLevel})`));
      console.log(chalk.gray(`   Operation: ${operation}`));
      console.log(chalk.gray(`   Reason: HITL threshold is ${hitlConfig.threshold} (Strict)`));
      return false;
    }

    // Prompt user
    return this._promptUser(operation, riskLevel, context);
  }

  async _promptUser(operation, riskLevel, context) {
    // Check if we are in non-interactive mode (e.g. CI)
    if (process.env.CI || process.env.UDS_NON_INTERACTIVE) {
      console.log(chalk.yellow(''));
      console.log(chalk.yellow('HITL Checkpoint triggered in non-interactive mode.'));
      console.log(chalk.gray(`   Operation: ${operation}`));
      console.log(chalk.red('   Action: Blocked (Safety First)'));
      return false;
    }

    console.log(chalk.yellow(''));
    console.log(chalk.yellow(`⚠️  HITL Checkpoint (Risk Level ${riskLevel})`));
    console.log(chalk.bold(`   Operation: ${operation}`));
    
    if (context.reason) {
      console.log(chalk.gray(`   Reason: ${context.reason}`));
    }

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'How would you like to proceed?',
        choices: [
          { name: 'Approve', value: 'approve' },
          { name: 'Deny', value: 'deny' },
          { name: 'Show Details', value: 'details' }
        ]
      }
    ]);

    if (action === 'details') {
      console.log(chalk.gray(''));
      console.log(chalk.gray('--- Operation Details ---'));
      console.log(chalk.gray(JSON.stringify(context, null, 2)));
      console.log(chalk.gray('-------------------------'));
      console.log('');
      // Recursive call to prompt again
      return this._promptUser(operation, riskLevel, context);
    }

    return action === 'approve';
  }
}

// Singleton instance
export const hitl = new HitlManager();