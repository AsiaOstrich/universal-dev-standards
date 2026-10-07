/**
 * Printing for the "available upstream, not installed" findings (XSPEC-458 R2, R3, R5).
 *
 * Everything here reads `getAvailableStandards()` and prints; none of it changes a plan, a verdict,
 * an exit code or a score. (The one exception is `resolveAddStandardRequest`, which sets a non-zero
 * exit code for a bad `--add-standard` id — that is its whole job.)
 *
 * @module utils/available-standards-report
 */

import chalk from 'chalk';
import { t } from '../i18n/messages.js';
import { getAvailableStandards, judgeAddStandard } from './available-standards.js';

const CATEGORY_ORDER = ['reference', 'skill'];

function fill(template, values) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}

function breakdown(byCategory) {
  return Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([category, count]) => `${category} ${count}`)
    .join(', ');
}

/**
 * `uds update --plan` / `--apply`: the section itself, or (apply) its count and the commands.
 * Always printed — "none" is said out loud, because silence reads as "this step did not run".
 *
 * @param {Object} manifest - The manifest the plan was computed from (a standard chosen with
 *   --add-standard is already in it, so it is not listed as still available)
 * @param {{phase: 'plan'|'apply'}} opts
 */
export function printAvailableStandardsSection(manifest, { phase }) {
  const msg = t().availableStandards;
  const { offered, notOffered, notOfferedByCategory } = getAvailableStandards(manifest);

  console.log();
  if (offered.length === 0) {
    console.log(chalk.gray(msg.none));
  } else if (phase === 'apply') {
    console.log(chalk.cyan(fill(msg.applySummary, { count: offered.length })));
    console.log(chalk.gray(`  ${msg.applyHint}`));
  } else {
    console.log(chalk.cyan(fill(msg.title, { count: offered.length })));
    const categories = [...new Set([...CATEGORY_ORDER, ...offered.map(s => s.category)])];
    for (const category of categories) {
      const group = offered.filter(s => s.category === category);
      if (group.length === 0) continue;
      console.log(chalk.bold(`  ${fill(msg.categoryLine, { category, count: group.length })}`));
      for (const std of group) {
        console.log(`    ${chalk.green(std.id)} ${chalk.gray(`— ${std.description}`)}`);
      }
    }
    console.log(chalk.gray(`  ${msg.installHint}`));
  }

  if (notOffered.length > 0) {
    console.log(chalk.gray(fill(msg.othersLine, { count: notOffered.length, breakdown: breakdown(notOfferedByCategory) })));
  }
}

/** `uds check`: one line, never part of the verdict. */
export function printAvailableStandardsCheckLine(manifest) {
  const msg = t().availableStandards;
  const { offered } = getAvailableStandards(manifest);
  if (offered.length === 0) {
    console.log(chalk.gray(msg.checkNone));
  } else {
    console.log(chalk.cyan(fill(msg.checkLine, { count: offered.length })));
  }
}

/**
 * `--add-standard` belongs to the reconciliation (`--plan` / `--apply`). Any other mode would take the
 * flag and quietly not use it, so those combinations are refused, in words.
 *
 * @param {Object} options - Parsed `uds update` options
 * @returns {string|null} The message to print, or null when the flags are compatible
 */
export function findAddStandardConflict(options) {
  const msg = t().availableStandards;
  if (!options.plan && !options.apply && !options.force) return msg.addNeedsMode;
  const clashes = [
    ['rollback', '--rollback'], ['claudeTarget', '--claude-target'], ['withHooks', '--with-hooks'],
    ['syncRefs', '--sync-refs'], ['integrationsOnly', '--integrations-only']
  ];
  for (const [key, flag] of clashes) {
    if (options[key]) return fill(msg.addCannotCombine, { flag });
  }
  if (options.plan && options.skills) return fill(msg.addCannotCombine, { flag: '--plan --skills' });
  if (options.plan && options.commands) return fill(msg.addCannotCombine, { flag: '--plan --commands' });
  return null;
}

/**
 * Judge every `--add-standard <id>`, say what is wrong with the ones that are, and return what is
 * left to install. A bad id is never ignored: it prints the problem, sets a non-zero exit code and
 * stops the run (`proceed: false`) before anything is planned or written.
 *
 * @param {Object} manifest
 * @param {string[]} ids
 * @returns {{proceed: boolean, ids: string[], alreadyInstalled: string[]}}
 */
export function resolveAddStandardRequest(manifest, ids) {
  const msg = t().availableStandards;
  const toAdd = [];
  const alreadyInstalled = [];
  let failed = false;

  for (const id of [...new Set(ids)]) {
    const judged = judgeAddStandard(id, manifest);
    switch (judged.status) {
      case 'add':
        toAdd.push(id);
        break;
      case 'installed':
        alreadyInstalled.push(id);
        console.log(chalk.gray(fill(msg.addAlreadyInstalled, { id })));
        break;
      case 'unknown':
        failed = true;
        console.log(chalk.red(fill(msg.addUnknown, { id })));
        for (const near of judged.closest) console.log(chalk.gray(`    ${near}`));
        break;
      case 'other-means':
        failed = true;
        console.log(chalk.red(fill(msg.addOtherMeans, { id, category: judged.entry.category })));
        break;
      default:
        failed = true;
        console.log(chalk.red(fill(msg.addNoSource, { id, format: manifest.format || 'ai' })));
    }
  }

  if (failed) {
    process.exitCode = 1;
    console.log();
    return { proceed: false, ids: [], alreadyInstalled };
  }
  return { proceed: true, ids: toAdd, alreadyInstalled };
}
