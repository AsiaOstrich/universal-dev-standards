/**
 * `uds deps` — does what you test match what your users install?
 * // implements XSPEC-366 R1
 *
 * A published npm package does not carry its lockfile. This compares, per
 * runtime dependency, the declared range, the version the lockfile pins, and
 * the version a consumer's install would actually resolve to.
 *
 * See `utils/dependency-resolution.js` for why resolution goes through
 * `npm view` and why a failed lookup is never reported as agreement.
 *
 * @module commands/deps
 */

import chalk from 'chalk';
import { measureResolutionDrift } from '../utils/dependency-resolution.js';

/**
 * Render the human-readable report.
 *
 * **Only the delta is listed.** A table of every dependency, mostly agreeing,
 * is skimmed and then ignored — and the two rows that mattered go with it. The
 * denominator is still printed, because "no drift" and "nothing was checked"
 * produce the same silence otherwise, and only one of them is good news.
 */
function render(result) {
  const lines = [];
  const label = result.packageName ? chalk.bold(result.packageName) : result.root;

  lines.push('');
  lines.push(`${label} — ${result.examined} runtime dependenc${result.examined === 1 ? 'y' : 'ies'} checked`);

  if (!result.hasLockfile) {
    lines.push(chalk.yellow('  no package-lock.json — nothing to compare the registry against'));
  }

  if (result.drifted.length > 0) {
    lines.push('');
    lines.push(chalk.yellow(`  ${result.drifted.length} shipped ≠ tested:`));
    for (const d of result.drifted) {
      lines.push(
        `    ${chalk.bold(d.name)}  ${chalk.dim(d.range)}` +
          `  tested=${chalk.cyan(d.locked)}  users get=${chalk.yellow(d.resolved)}`
      );
    }
    lines.push('');
    lines.push(chalk.dim('  Your lockfile pins the tested column; consumers resolve the range'));
    lines.push(chalk.dim('  themselves, because a published package does not ship a lockfile.'));
  }

  if (result.unpinnedNative.length > 0) {
    lines.push('');
    lines.push(chalk.yellow(`  ${result.unpinnedNative.length} native dependenc${result.unpinnedNative.length === 1 ? 'y is' : 'ies are'} behind a version range:`));
    for (const n of result.unpinnedNative) {
      lines.push(
        `    ${chalk.bold(n.name)}  ${chalk.dim(n.range)}` +
          `  ${chalk.dim('(' + n.native.reasons.join('; ') + ')')}`
      );
    }
    lines.push('');
    lines.push(chalk.dim('  Flagged whether or not they are drifting today. semver makes no'));
    lines.push(chalk.dim('  promise about native ABI compatibility, and this ecosystem has'));
    lines.push(chalk.dim('  broken it inside a minor range. A range that matches one published'));
    lines.push(chalk.dim('  version is safe because upstream has not published again — waiting'));
    lines.push(chalk.dim('  for drift means waiting until your users already have it.'));
  }

  if (result.unverifiable.length > 0) {
    lines.push('');
    lines.push(chalk.red(`  ${result.unverifiable.length} could not be checked:`));
    for (const u of result.unverifiable) {
      const why = u.error ?? 'not present in package-lock.json';
      lines.push(`    ${chalk.bold(u.name)}  ${chalk.dim(u.range)}  ${chalk.red(why)}`);
    }
    lines.push('');
    lines.push(chalk.dim('  These are unknowns, not agreements. Treating them as fine would'));
    lines.push(chalk.dim('  turn "I could not find out" into "everything is fine".'));
  }

  if (result.clean) {
    lines.push(chalk.green('  ✓ every dependency resolves to the version you test against'));
  }

  lines.push('');
  return lines.join('\n');
}

export async function depsCommand(options = {}) {
  const root = options.path ?? process.cwd();

  let result;
  try {
    result = await measureResolutionDrift(root, {
      concurrency: options.concurrency ? Number(options.concurrency) : undefined,
    });
  } catch (err) {
    console.error(chalk.red(`uds deps: ${err.message}`));
    process.exitCode = 1;
    return;
  }

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(render(result));
  }

  // Drift and unverifiable both fail. Drift is a real divergence; unverifiable
  // is an unknown, and a check that exits 0 on "I don't know" is a check that
  // reports success for the case it was built to catch.
  if (!result.clean) process.exitCode = 1;
}
