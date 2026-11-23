/**
 * An older uds must not write over a project a newer UDS installed (dev-platform #308, decision 666甲).
 *
 * `uds update` judged "up to date" from `manifest.upstream.version >= shipped`, but the branches that write
 * (`--apply`, `--skills`, `--integrations-only`, `--with-hooks`, `--sync-refs`, ...) ran before that comparison, and the
 * helpers that record "this project is at the shipped version" assigned the shipped version whatever the recorded one was.
 * So running an older global `uds` in a project a newer UDS had installed rewrote the files with older ones and moved the
 * version record BACKWARDS: the project looked consistent at the older version and the loss was invisible.
 *
 * This module is the one place that answers "is the project newer than this uds?" and the one wording that says what to do:
 *  - `findNewerProject(manifest)`  which recorded version (standards, then skills) is newer than what this uds ships;
 *  - `refuseOlderCli(...)`         the guard the writing commands call first (prints, sets exit code 1, returns true);
 *  - `shouldRecordShipped(...)`    the rule the version-recording helpers use: move forward or stay, never back.
 * `--allow-downgrade` is the only way past it, and it switches the recording rule too (the files really are older then).
 *
 * @module utils/downgrade-guard
 */

import chalk from 'chalk';
import { compareVersions } from './version-compare.js';
import { getRepositoryInfo } from './registry.js';
import { t } from '../i18n/messages.js';

const VERSION = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const isVersion = (v) => typeof v === 'string' && VERSION.test(v);

let downgradePermitted = false;

/** `--allow-downgrade` was given: the version-recording helpers may move a record back. */
export function permitDowngrade(permitted = true) {
  downgradePermitted = !!permitted;
}

/**
 * Is `recorded` newer than `shipped`? False when either is not a version (a record that cannot be read is not a reason to refuse).
 * Uses the same comparison as the rest of the CLI, so a prerelease is older than its release (6.16.1-beta.1 > 6.16.0,
 * 6.16.1 > 6.16.1-beta.2).
 */
export function isNewerThan(recorded, shipped) {
  return isVersion(recorded) && isVersion(shipped) && compareVersions(recorded, shipped) > 0;
}

/**
 * The rule for recording the shipped version in a manifest: forward or equal, never back (unless `--allow-downgrade`).
 * A recorded value that is not a version is replaced, as before.
 */
export function shouldRecordShipped(recorded, shipped) {
  return downgradePermitted || !isNewerThan(recorded, shipped);
}

/**
 * Which recorded version is newer than this uds ships, if any: the standards version first, then the skills version.
 * @param {Object} manifest
 * @returns {{ field: 'upstream.version'|'skills.version', project: string, cli: string } | null}
 */
export function findNewerProject(manifest) {
  const info = getRepositoryInfo();
  const checks = [
    ['upstream.version', manifest?.upstream?.version, info?.standards?.version],
    ['skills.version', manifest?.skills?.version, info?.skills?.version]
  ];
  for (const [field, project, cli] of checks) {
    if (isNewerThan(project, cli)) return { field, project, cli };
  }
  return null;
}

const fill = (text, values) => Object.entries(values).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), text);

/**
 * The guard for a command that writes into the project.
 *
 * @param {Object} manifest
 * @param {Object} opts
 * @param {string} opts.command   what to run with the newer uds, e.g. `update` (printed in the `npx` form)
 * @param {boolean} [opts.allowDowngrade]  `--allow-downgrade`
 * @param {'refuse'|'warn'|'note'} [opts.mode]  `refuse` (default): print and set exit code 1, return true.
 *   `warn`: a plan, nothing is written: print the same facts as a warning and return false.
 *   `note`: a restore the user asked for by name (`--rollback`): print a note and return false.
 * @returns {boolean} true when the caller must stop
 */
export function refuseOlderCli(manifest, { command, allowDowngrade = false, mode = 'refuse' } = {}) {
  const newer = findNewerProject(manifest);
  if (!newer) return false;
  const m = t().commands.common;
  const values = { project: newer.project, cli: newer.cli, command, field: newer.field };

  if (allowDowngrade) {
    permitDowngrade(true);
    console.log(chalk.yellow(`  ! ${fill(m.downgradeAllowed, values)}`));
    console.log();
    return false;
  }
  if (mode === 'warn') {
    console.log(chalk.yellow(`  ! ${fill(m.downgradePlanWarning, values)}`));
    console.log(chalk.gray(`    ${fill(m.downgradeFix, values)}`));
    console.log();
    return false;
  }
  if (mode === 'note') {
    console.log(chalk.yellow(`  ! ${fill(m.downgradeRollbackNote, values)}`));
    console.log(chalk.gray(`    ${fill(m.downgradeFix, values)}`));
    console.log();
    return false;
  }
  console.log(chalk.red(`  ✗ ${fill(m.downgradeRefused, values)}`));
  console.log(chalk.gray(`    ${fill(m.downgradeWhy, values)}`));
  console.log(chalk.gray(`    ${fill(m.downgradeFix, values)}`));
  console.log(chalk.gray(`    ${fill(m.downgradeOverride, values)}`));
  console.log();
  process.exitCode = 1;
  return true;
}

/**
 * One line for `uds check`, which never writes: this uds is older than the project. Null when it is not.
 * @param {Object} manifest
 * @returns {string|null}
 */
export function olderCliNotice(manifest) {
  const newer = findNewerProject(manifest);
  if (!newer) return null;
  return fill(t().commands.common.downgradeCheckBehind, { project: newer.project, cli: newer.cli, field: newer.field });
}
