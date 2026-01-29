/**
 * Spec Command - Micro-spec generation for vibe coding
 *
 * Creates lightweight specifications from natural language intent,
 * enabling traceability without the overhead of formal specs.
 *
 * @module commands/spec
 * @see docs/specs/system/vibe-coding-integration.md (AC-1)
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { MicroSpec, SpecStatus } from '../vibe/micro-spec.js';
import { msg } from '../i18n/messages.js';

/**
 * Get localized message with fallback
 * @param {string} key - Message key (dot-separated path)
 * @param {string} fallback - Fallback message if key not found
 * @returns {string} Localized message or fallback
 */
function t(key, fallback) {
  return msg(key) || fallback;
}

/**
 * Execute the spec create command
 * @param {string} intent - Natural language intent description
 * @param {Object} options - Command options
 */
export async function specCreateCommand(intent, options = {}) {
  if (!intent) {
    console.log(chalk.red(t('spec.noIntent', 'Error: Please provide an intent description.')));
    console.log(chalk.gray(t('spec.example', 'Example') + ': uds spec "Add a login page with email/password"'));
    process.exitCode = 1;
    return;
  }

  console.log('');
  console.log(chalk.bold(t('spec.createTitle', 'Micro-Spec Generation')));
  console.log(chalk.gray(t('spec.analyzing', 'Analyzing your intent...')));
  console.log('');

  const microSpec = new MicroSpec();

  const spinner = ora({
    text: t('spec.generating', 'Generating micro-spec...'),
    color: 'cyan'
  }).start();

  try {
    const { spec, filepath, markdown } = microSpec.create(intent, {
      scope: options.scope
    });

    spinner.succeed(t('spec.generated', 'Micro-spec generated'));

    // Display the generated spec
    console.log('');
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.cyan(markdown));
    console.log(chalk.gray('─'.repeat(50)));
    console.log('');

    // Ask for confirmation unless --yes flag
    if (!options.yes) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: t('spec.confirmQuestion', 'How would you like to proceed?'),
          choices: [
            { name: t('spec.confirm', 'Confirm and proceed'), value: 'confirm' },
            { name: t('spec.edit', 'Edit the spec'), value: 'edit' },
            { name: t('spec.skip', 'Skip (keep as draft)'), value: 'skip' },
            { name: t('spec.discard', 'Discard'), value: 'discard' }
          ]
        }
      ]);

      if (action === 'confirm') {
        microSpec.confirm(spec.id);
        console.log(chalk.green(t('spec.confirmed', 'Spec confirmed and ready for implementation!')));
      } else if (action === 'edit') {
        console.log(chalk.yellow(t('spec.editHint', `Edit the spec at: ${filepath}`)));
        console.log(chalk.gray(t('spec.confirmLater', 'Run `uds spec confirm ' + spec.id + '` when ready')));
      } else if (action === 'discard') {
        microSpec.delete(spec.id);
        console.log(chalk.gray(t('spec.discarded', 'Spec discarded.')));
        return;
      } else {
        console.log(chalk.gray(t('spec.savedAsDraft', 'Spec saved as draft.')));
      }
    } else {
      // Auto-confirm with --yes flag
      microSpec.confirm(spec.id);
      console.log(chalk.green(t('spec.autoConfirmed', 'Spec auto-confirmed.')));
    }

    console.log('');
    console.log(chalk.gray(`${t('spec.savedTo', 'Saved to')}: ${filepath}`));
    console.log(chalk.gray(`${t('spec.specId', 'Spec ID')}: ${spec.id}`));

  } catch (error) {
    spinner.fail(t('spec.error', 'Failed to generate spec'));
    console.error(chalk.red(`  ${error.message}`));
    process.exitCode = 1;
  }
}

/**
 * Execute the spec list command
 * @param {Object} options - Command options
 */
export async function specListCommand(options = {}) {
  console.log('');
  console.log(chalk.bold(t('spec.listTitle', 'Micro-Specs')));
  console.log('');

  const microSpec = new MicroSpec();
  const specs = microSpec.list({
    status: options.status
  });

  if (specs.length === 0) {
    console.log(chalk.gray(t('spec.noSpecs', 'No micro-specs found.')));
    console.log(chalk.gray(t('spec.createHint', 'Create one with: uds spec "your intent"')));
    return;
  }

  // Display specs as a table
  console.log(chalk.gray('─'.repeat(70)));
  console.log(
    chalk.bold('ID'.padEnd(35)) +
    chalk.bold('Status'.padEnd(12)) +
    chalk.bold('Type'.padEnd(10)) +
    chalk.bold('Title')
  );
  console.log(chalk.gray('─'.repeat(70)));

  for (const spec of specs) {
    const statusColor = {
      [SpecStatus.DRAFT]: chalk.yellow,
      [SpecStatus.CONFIRMED]: chalk.green,
      [SpecStatus.ACTIVE]: chalk.cyan,
      [SpecStatus.COMPLETED]: chalk.blue,
      [SpecStatus.ARCHIVED]: chalk.gray
    }[spec.status] || chalk.white;

    console.log(
      spec.id.slice(0, 34).padEnd(35) +
      statusColor(spec.status.padEnd(12)) +
      spec.type.padEnd(10) +
      spec.title.slice(0, 25)
    );
  }

  console.log(chalk.gray('─'.repeat(70)));
  console.log(chalk.gray(`${t('spec.total', 'Total')}: ${specs.length}`));
}

/**
 * Execute the spec show command
 * @param {string} id - Spec ID
 */
export async function specShowCommand(id) {
  if (!id) {
    console.log(chalk.red(t('spec.noId', 'Error: Please provide a spec ID.')));
    process.exitCode = 1;
    return;
  }

  const microSpec = new MicroSpec();
  const spec = microSpec.get(id);

  if (!spec) {
    console.log(chalk.red(t('spec.notFound', 'Spec not found: ') + id));
    process.exitCode = 1;
    return;
  }

  console.log('');
  console.log(chalk.cyan(microSpec.toMarkdown(spec)));
}

/**
 * Execute the spec confirm command
 * @param {string} id - Spec ID
 */
export async function specConfirmCommand(id) {
  if (!id) {
    console.log(chalk.red(t('spec.noId', 'Error: Please provide a spec ID.')));
    process.exitCode = 1;
    return;
  }

  const microSpec = new MicroSpec();
  const spec = microSpec.confirm(id);

  if (!spec) {
    console.log(chalk.red(t('spec.notFound', 'Spec not found: ') + id));
    process.exitCode = 1;
    return;
  }

  console.log(chalk.green(t('spec.confirmed', 'Spec confirmed and ready for implementation!')));
  console.log(chalk.gray(`${t('spec.specId', 'Spec ID')}: ${id}`));
}

/**
 * Execute the spec archive command
 * @param {string} id - Spec ID
 */
export async function specArchiveCommand(id) {
  if (!id) {
    console.log(chalk.red(t('spec.noId', 'Error: Please provide a spec ID.')));
    process.exitCode = 1;
    return;
  }

  const microSpec = new MicroSpec();
  const success = microSpec.archive(id);

  if (!success) {
    console.log(chalk.red(t('spec.notFound', 'Spec not found: ') + id));
    process.exitCode = 1;
    return;
  }

  console.log(chalk.green(t('spec.archived', 'Spec archived successfully.')));
}

/**
 * Execute the spec delete command
 * @param {string} id - Spec ID
 * @param {Object} options - Command options
 */
export async function specDeleteCommand(id, options = {}) {
  if (!id) {
    console.log(chalk.red(t('spec.noId', 'Error: Please provide a spec ID.')));
    process.exitCode = 1;
    return;
  }

  const microSpec = new MicroSpec();

  if (!options.yes) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: t('spec.deleteConfirm', `Are you sure you want to delete spec '${id}'?`),
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.gray(t('spec.deleteCancelled', 'Delete cancelled.')));
      return;
    }
  }

  const success = microSpec.delete(id);

  if (!success) {
    console.log(chalk.red(t('spec.notFound', 'Spec not found: ') + id));
    process.exitCode = 1;
    return;
  }

  console.log(chalk.green(t('spec.deleted', 'Spec deleted.')));
}
