/**
 * `uds deps` — does what you test match what your ranges resolve to?
 * // implements XSPEC-366 R1
 *
 * Compares, per runtime dependency, the declared range, the version the
 * lockfile pins, and the version a fresh install would resolve that range to.
 *
 * It deliberately stops there. Whether a gap between the second and third
 * numbers is already in a user's hands depends on how the project ships —
 * a published npm package carries no lockfile, so consumers resolve the
 * ranges themselves; an artifact that ships its lockfile (a container image,
 * a deployed service) hands users the pinned column and meets the third one
 * at its next lockfile regeneration. This module cannot know which applies,
 * so it never phrases the gap as something users already have.
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
export function render(result) {
  const lines = [];
  const label = result.packageName ? chalk.bold(result.packageName) : result.root;

  lines.push('');
  lines.push(`${label} — ${result.examined} runtime dependenc${result.examined === 1 ? 'y' : 'ies'} checked`);

  if (!result.hasLockfile) {
    lines.push(chalk.yellow('  no package-lock.json — nothing to compare the registry against'));
  }

  if (result.drifted.length > 0) {
    lines.push('');
    // Named after the two columns that disagree, not after a conclusion about
    // who receives them. `shipped ≠ tested` — the wording this replaced — is
    // false for an artifact that ships its own lockfile, where shipped IS
    // tested. 6.3.2 rewrote the explanation below to state both readings but
    // left this heading asserting one of them, in yellow, one line above the
    // dim correction. That is the "misleading line with a qualification
    // underneath it" shape that R4 rewrote the supply-chain standard to stop.
    lines.push(chalk.yellow(`  ${result.drifted.length} tested ≠ resolves:`));
    for (const d of result.drifted) {
      lines.push(
        `    ${chalk.bold(d.name)}  ${chalk.dim(d.range)}` +
          `  tested=${chalk.cyan(d.locked)}  resolves=${chalk.yellow(d.resolved)}`
      );
    }
    lines.push('');
    // Which of these two readings applies depends on how the project ships,
    // and this command cannot know that — so it states both rather than
    // asserting one. The first draft said only "consumers resolve the range
    // themselves, because a published package does not ship a lockfile",
    // which is plainly false for a product distributed as a container image
    // built with `npm ci`. The standard this command implements scopes itself
    // to published artifacts; the command did not, and a check that overstates
    // its own conclusion is the thing it exists to catch.
    // The column is labelled `resolves=`, not `users get=`. The second reads
    // correctly on its own only for a published package; for a container image
    // its users get the `tested=` column exactly, and a row read alone would
    // then say the opposite of the truth. Leaving the label and explaining it
    // underneath is the "but note…" this project's own supply-chain standard
    // was rewritten to stop doing — a line of a report, like a line of a
    // standards table, is mostly read one line at a time.
    lines.push(chalk.dim('  Your lockfile pins the tested column.'));
    lines.push(chalk.dim('  If you publish this package, that column reaches nobody — a published'));
    lines.push(chalk.dim('  package ships no lockfile, so consumers resolve the ranges themselves.'));
    lines.push(chalk.dim('  If instead you ship the lockfile with the artifact (a container image,'));
    lines.push(chalk.dim('  a deployed service), the third column is what the next lockfile'));
    lines.push(chalk.dim('  regeneration pulls in — unreviewed, and by whoever happens to run it.'));
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
    lines.push(chalk.dim('  for drift means waiting until it is already inside something you ship.'));
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
