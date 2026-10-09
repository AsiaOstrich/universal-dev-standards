#!/usr/bin/env node
/**
 * ci-summary — turn the acceptance report of one CI job into the job summary, and decide whether the job is red
 * (dev-platform XSPEC-471 R1).
 *
 * Reads every `*.json` report that run.mjs wrote into --dir, prints Markdown, and appends the same Markdown to the file
 * GitHub shows as the job summary (GITHUB_STEP_SUMMARY). The summary has, per platform, the number of steps that passed,
 * failed, and the manual (`human-*`) items nobody confirmed, and lists each failed step with what did not hold.
 *
 * The judgement is made from the report, not from the exit code of run.mjs, so a job cannot be green because the exit code
 * was lost on the way (a shell that swallows it) while the report says a step failed.
 *   red:   a failed step; verdict fail / error / no-steps; no report at all; a report for another version than --version;
 *          a package that was not installed from the registry
 *   green: every automated step passed. Manual items that nobody confirmed are listed as "not confirmed" and are NOT failures.
 *
 * Usage: node scripts/beta-acceptance/ci-summary.mjs --dir <reports dir> --label <name> [--version <v>]
 * Exit codes: 0 green; 1 red (including "there is no report"); 2 bad arguments.
 *
 * Standard library only.
 */

import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const cell = (text) => String(text ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

function parse(argv) {
  const opts = { dir: null, label: null, version: null };
  const names = { '--dir': 'dir', '--label': 'label', '--version': 'version' };
  for (let i = 0; i < argv.length; i += 1) {
    const key = names[argv[i]];
    if (!key) throw new Error(`unknown option: ${argv[i]}`);
    const value = argv[(i += 1)];
    if (value === undefined || value === '') throw new Error(`${argv[i - 1]} needs a value`);
    opts[key] = value;
  }
  if (!opts.dir) throw new Error('--dir is required');
  if (!opts.label) throw new Error('--label is required');
  return opts;
}

/** Why this report makes the job red; an empty list means green. */
export function problemsOf(report, expectedVersion) {
  const problems = [];
  const counts = report.counts || {};
  if (report.verdict === 'error') problems.push(`the run could not finish: ${report.error || 'no reason recorded'}`);
  else if (report.verdict === 'no-steps') problems.push('no step passed (nothing was shown to work)');
  else if (report.verdict === 'fail' || counts.failed > 0) problems.push(`${counts.failed} automated step(s) failed`);
  else if (report.verdict !== 'pass' && report.verdict !== 'pass_with_unconfirmed') problems.push(`unknown verdict ${JSON.stringify(report.verdict)}`);
  if (expectedVersion && (!report.uds || report.uds.version !== expectedVersion)) problems.push(`the report is for ${JSON.stringify(report.uds && report.uds.version)}, not ${expectedVersion}`);
  if (!report.uds || report.uds.installKind !== 'npm-registry') problems.push(`the package under test was not installed from the npm registry (${report.uds && report.uds.installKind})`);
  return problems;
}

export function renderReport(report, label, expectedVersion) {
  const env = report.environment || {};
  const c = report.counts || {};
  const problems = problemsOf(report, expectedVersion);
  const lines = [];
  lines.push(`### Post-publish acceptance — ${label} (${cell(env.platform)}) | 發布後驗收`, '');
  lines.push(`**${problems.length ? 'RED 失敗' : 'GREEN 通過'}** — UDS \`${cell(report.uds && report.uds.version)}\` from ${cell(report.uds && report.uds.installKind)}`, '');
  lines.push('| passed 通過 | failed 失敗 | manual NOT confirmed 人工未確認 | manual confirmed 人工已確認 | skipped (other OS) 略過 |', '|---|---|---|---|---|');
  lines.push(`| ${c.passed ?? '?'} | ${c.failed ?? '?'} | ${c.humanUnconfirmed ?? '?'} | ${c.humanConfirmed ?? '?'} | ${c.skipped ?? '?'} |`, '');
  lines.push(`${cell(env.os && env.os.type)} ${cell(env.os && env.os.release)} (${cell(env.os && env.os.arch)}); Node ${cell(env.node && env.node.version)}; shell: ${cell(env.shell && env.shell.value)} (${cell(env.shell && env.shell.evidence)}); Windows code page: ${cell(env.windowsCodePage && env.windowsCodePage.value)}`, '');
  if (problems.length) {
    lines.push('**Why the job is red | 為什麼紅：**', '');
    for (const p of problems) lines.push(`- ${p}`);
    lines.push('');
  }
  const failed = (report.steps || []).filter((s) => s.status === 'fail');
  if (failed.length) {
    lines.push(`**Failed steps | 失敗的步驟 (${failed.length})：**`, '');
    for (const s of failed) lines.push(`- \`${cell(s.id)}\` — ${cell(s.title)}: ${(s.failures || []).map(cell).join('; ') || 'no reason recorded'}`);
    lines.push('');
  }
  const pending = (report.steps || []).filter((s) => s.status === 'unconfirmed');
  if (pending.length) {
    lines.push(`**Manual items not confirmed (not failures) | 人工項目尚未確認（不計失敗）(${pending.length})：**`, '');
    for (const s of pending) lines.push(`- \`${cell(s.id)}\` — ${cell(s.title)}`);
    lines.push('');
  }
  return { markdown: lines.join('\n'), problems };
}

export function main(argv, env = process.env) {
  let opts;
  try {
    opts = parse(argv);
  } catch (e) {
    console.error(`[ci-summary] ${e.message}`);
    return 2;
  }
  const dir = resolve(opts.dir);
  const files = existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith('.json')).sort() : [];
  const chunks = [];
  let red = false;
  const reports = [];
  for (const name of files) {
    try {
      const report = JSON.parse(readFileSync(join(dir, name), 'utf-8'));
      if (report && report.tool === 'uds-beta-acceptance') reports.push(report);
    } catch (e) {
      chunks.push(`### ${opts.label}: ${name} is not a readable report (${e.message})\n`);
      red = true;
    }
  }
  if (reports.length === 0) {
    chunks.push(`### Post-publish acceptance — ${opts.label} | 發布後驗收\n\n**RED 失敗** — there is no acceptance report in \`${opts.dir}\`. The run stopped before it wrote one; read the log of the "Run acceptance" step. 沒有驗收報告：執行在寫出報告前就中止了，請看該步驟的日誌。\n`);
    red = true;
  }
  for (const report of reports) {
    const { markdown, problems } = renderReport(report, opts.label, opts.version);
    chunks.push(markdown);
    if (problems.length) red = true;
  }
  const text = chunks.join('\n');
  console.log(text);
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `${text}\n`);
  return red ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
