/**
 * `uds lint` — dependency validity + size checks against installed specs
 * (specs/*.md).
 *
 * XSPEC-383 R5 (Option E). `cli/src/utils/spec-linter.js` and this command's
 * JSON shape existed since 2026-04-07, but no `uds lint` command was ever
 * registered — VibeOps's `lint-executor.ts` has been calling
 * `npx uds lint --json` since the same day and getting `command not found`
 * every time, four and a half months, without anyone noticing (see
 * `cli/scripts/check-module-reachability.mjs` for the full incident).
 *
 * This registers the command with exactly the two checks that survived
 * `lintAll()`'s AC-coverage removal (see spec-linter.js for why AC coverage
 * was dropped rather than patched). The `--json` shape is deliberately NOT a
 * new design — it matches the shape VibeOps's `lint-executor.ts` has already
 * been parsing (`result.summary.fail`, `result.results[].specId/.status/.message`)
 * since it was written, so wiring this up does not also require a change on
 * the VibeOps side.
 *
 * @module commands/lint
 */

import chalk from 'chalk';
import { lintAll } from '../utils/spec-linter.js';

/**
 * Render a one-line human message for a single spec's lint result.
 * Exported for tests; also used to build the `message` field of `--json`
 * output.
 */
export function buildMessage(result) {
  const parts = [];
  if (result.deps.broken.length > 0) {
    const targets = result.deps.broken.map((b) => b.target).join(', ');
    parts.push(
      `${result.deps.broken.length} broken dependenc${result.deps.broken.length === 1 ? 'y' : 'ies'}: ${targets}`
    );
  }
  parts.push(`${result.size.effectiveLines} effective lines (${result.size.status})`);
  return parts.join('; ');
}

export async function lintCommand(options = {}) {
  const projectPath = process.cwd();
  const result = lintAll(projectPath);

  if (options.json) {
    const payload = {
      summary: result.summary,
      results: result.results.map((r) => ({
        specId: r.spec,
        status: r.status,
        message: buildMessage(r),
      })),
    };
    console.log(JSON.stringify(payload, null, 2));
    if (result.summary.fail > 0) process.exitCode = 1;
    return;
  }

  console.log();
  console.log(chalk.bold('Spec Lint'));
  console.log(chalk.gray('─'.repeat(50)));

  if (!result.specsDirExists) {
    // 查無 spec 目錄 must say so explicitly — an empty { pass: 0, warn: 0,
    // fail: 0 } summary is indistinguishable from "checked, all clean" unless
    // the command says out loud that nothing was scanned.
    console.log(chalk.yellow(`  查無 spec 目錄（./${result.specsDir}/ 不存在）`));
    console.log(chalk.gray('  沒有東西被掃描——這不代表沒有問題，代表沒有檢查。'));
    console.log();
    return;
  }

  console.log(chalk.gray(`  掃描 ${result.results.length} 份 spec（./${result.specsDir}/）`));
  console.log();

  for (const r of result.results) {
    const msg = buildMessage(r);
    if (r.status === 'fail') {
      console.log(chalk.red(`  ✗ ${r.spec}: ${msg}`));
    } else if (r.status === 'warn') {
      console.log(chalk.yellow(`  ⚠ ${r.spec}: ${msg}`));
    } else {
      console.log(chalk.green(`  ✓ ${r.spec}: ${msg}`));
    }
  }

  console.log();
  console.log(
    chalk.gray(`  ${result.summary.pass} pass, ${result.summary.warn} warn, ${result.summary.fail} fail`)
  );
  console.log();

  if (result.summary.fail > 0) process.exitCode = 1;
}
