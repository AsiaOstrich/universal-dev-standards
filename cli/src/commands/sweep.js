/**
 * Sweep Command - Auto-cleanup for vibe coding sessions
 *
 * Applies refactoring standards to remove debug code and improve quality.
 * Integrates with HITL for safety when modifying files.
 *
 * @module commands/sweep
 * @see docs/specs/system/vibe-coding-integration.md (AC-2)
 */

import chalk from 'chalk';
import ora from 'ora';
import { AutoSweep } from '../vibe/auto-sweep.js';
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
 * Execute the sweep command
 * @param {Object} options - Command options
 * @param {boolean} options.fix - Apply fixes instead of dry-run
 * @param {boolean} options.report - Save report to .uds/reports/
 * @param {boolean} options.verbose - Show detailed output
 * @param {string[]} options.files - Specific files to sweep (optional)
 */
export async function sweepCommand(options = {}) {
  const dryRun = !options.fix;
  const verbose = options.verbose || false;
  const saveReport = options.report || false;

  console.log('');
  console.log(chalk.bold(t('sweep.title', 'Auto-Sweep: Code Cleanup')));
  console.log(chalk.gray(t('sweep.description', 'Scanning changed files for debug code and quality issues...')));
  console.log('');

  const sweep = new AutoSweep({
    dryRun,
    verbose
  });

  const spinner = ora({
    text: t('sweep.scanning', 'Scanning changed files...'),
    color: 'cyan'
  }).start();

  try {
    const results = await sweep.sweep();

    spinner.succeed(t('sweep.scanComplete', 'Scan complete'));

    // Display results summary
    console.log('');
    console.log(chalk.bold(t('sweep.summaryTitle', 'Summary')));
    console.log(chalk.gray('─'.repeat(40)));

    console.log(`  ${chalk.cyan(t('sweep.filesScanned', 'Files Scanned'))}: ${results.filesScanned}`);
    console.log(`  ${chalk.yellow(t('sweep.issuesFound', 'Issues Found'))}: ${results.totalIssues}`);

    if (!dryRun) {
      console.log(`  ${chalk.green(t('sweep.issuesFixed', 'Issues Fixed'))}: ${results.totalFixed}`);
    }

    console.log('');

    // Display issues by type
    if (results.totalIssues > 0) {
      console.log(chalk.bold(t('sweep.issuesByType', 'Issues by Type')));
      console.log(chalk.gray('─'.repeat(40)));

      if (results.summary.consoleLogs > 0) {
        const icon = dryRun ? '[ ]' : '[x]';
        console.log(`  ${icon} ${chalk.yellow('console.log')}: ${results.summary.consoleLogs}`);
      }
      if (results.summary.debuggers > 0) {
        const icon = dryRun ? '[ ]' : '[x]';
        console.log(`  ${icon} ${chalk.yellow('debugger')}: ${results.summary.debuggers}`);
      }
      if (results.summary.todoComments > 0) {
        console.log(`  [-] ${chalk.blue('TODO/FIXME')}: ${results.summary.todoComments}`);
      }
      if (results.summary.anyTypes > 0) {
        console.log(`  [-] ${chalk.magenta('any types')}: ${results.summary.anyTypes}`);
      }
      console.log('');

      // Show file details if verbose
      if (verbose && results.files.length > 0) {
        console.log(chalk.bold(t('sweep.fileDetails', 'File Details')));
        console.log(chalk.gray('─'.repeat(40)));

        for (const file of results.files) {
          console.log(`  ${chalk.cyan(file.file)}`);
          for (const issue of file.issues) {
            const status = issue.fixable
              ? (dryRun ? chalk.yellow('fixable') : chalk.green('fixed'))
              : chalk.gray('info');
            console.log(`    - ${status}: ${issue.action.name} (${issue.count})`);
          }
        }
        console.log('');
      }

      // Dry-run hint
      if (dryRun && results.totalIssues > 0) {
        console.log(chalk.gray('─'.repeat(40)));
        console.log(chalk.cyan(t('sweep.dryRunHint', 'This was a dry run. Use --fix to apply changes.')));
        console.log(chalk.gray(`  ${t('sweep.example', 'Example')}: uds sweep --fix`));
        console.log('');
      }
    } else {
      console.log(chalk.green(t('sweep.noIssues', 'No issues found. Your code is clean!')));
      console.log('');
    }

    // Save report if requested
    if (saveReport) {
      const report = sweep.generateReport(results);
      const reportPath = sweep.saveReport(report);
      console.log(chalk.gray(`${t('sweep.reportSaved', 'Report saved to')}: ${reportPath}`));
      console.log('');
    }

    // Exit with appropriate code
    if (!dryRun && results.totalIssues > results.totalFixed) {
      // Some issues couldn't be fixed (blocked or non-fixable)
      process.exitCode = 1;
    }

  } catch (error) {
    spinner.fail(t('sweep.error', 'Sweep failed'));
    console.error(chalk.red(`  ${error.message}`));
    process.exitCode = 1;
  }
}
