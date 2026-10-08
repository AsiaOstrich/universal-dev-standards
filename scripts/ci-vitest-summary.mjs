#!/usr/bin/env node
/**
 * ci-vitest-summary — say how many tests ran, passed, failed and were skipped (dev-platform XSPEC-469 R4).
 *
 * A green job proves little when tests were skipped: a test that `ctx.skip()`s on Windows is green on Windows. This
 * reads the file `vitest --reporter=json --outputFile.json=<file>` wrote and prints the four numbers (and the names
 * of the skipped tests), and appends the same Markdown to the job summary when GITHUB_STEP_SUMMARY is set.
 *
 * Usage: node scripts/ci-vitest-summary.mjs <vitest-json-file> [--title "<text>"] [--list-skipped <n>]
 *
 * Exit codes: 0 something ran and nothing failed; 1 a test failed, or no test ran (every test skipped is not a pass);
 * 2 the file could not be read as a vitest result (the test step died before writing it).
 *
 * Standard library only.
 */

import { appendFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : argv[i + 1];
};
const file = argv.find((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
const title = flag('--title', 'Test results');
const listLimit = Number(flag('--list-skipped', 40));

/** @returns {{ total: number, passed: number, failed: number, skipped: number, todo: number, ran: number, skippedNames: string[] }} */
export function summarize(result) {
  const files = Array.isArray(result.testResults) ? result.testResults : [];
  const all = files.flatMap((f) => (f.assertionResults || []).map((a) => ({ ...a, file: f.name })));
  const count = (status) => all.filter((a) => a.status === status).length;
  const passed = count('passed');
  const failed = count('failed');
  const skipped = count('skipped') + count('pending');
  const todo = count('todo');
  return {
    total: all.length,
    passed,
    failed,
    skipped,
    todo,
    ran: passed + failed,
    skippedNames: all.filter((a) => a.status === 'skipped' || a.status === 'pending').map((a) => a.fullName),
    // the file-level numbers vitest prints itself, to catch a reader that disagrees with the reporter
    reported: { total: result.numTotalTests, passed: result.numPassedTests, failed: result.numFailedTests, pending: result.numPendingTests },
  };
}

export function toMarkdown(title, s) {
  const lines = [
    `### ${title}`,
    '',
    '| ran | passed | failed | skipped | todo |',
    '|---|---|---|---|---|',
    `| ${s.ran} | ${s.passed} | ${s.failed} | ${s.skipped} | ${s.todo} |`,
    '',
  ];
  if (s.skipped > 0) {
    lines.push(`<details><summary>${s.skipped} skipped test(s) — they did not run on this system, they did not pass</summary>`, '');
    for (const n of s.skippedNames.slice(0, listLimit)) lines.push(`- ${n}`);
    if (s.skippedNames.length > listLimit) lines.push(`- ... and ${s.skippedNames.length - listLimit} more`);
    lines.push('', '</details>', '');
  }
  return lines.join('\n');
}

function main() {
  if (!file) {
    console.error('[ci-vitest-summary] usage: node scripts/ci-vitest-summary.mjs <vitest-json-file> [--title "<text>"]');
    return 2;
  }
  let result;
  try {
    result = JSON.parse(readFileSync(file, 'utf-8'));
  } catch (e) {
    console.error(`[ci-vitest-summary] CANNOT READ ${file} as a vitest JSON result (${e.message}). The test step probably stopped before it wrote it.`);
    return 2;
  }
  if (typeof result.numTotalTests !== 'number' || !Array.isArray(result.testResults)) {
    console.error(`[ci-vitest-summary] ${file} is JSON but not a vitest result (no numTotalTests / testResults).`);
    return 2;
  }
  const s = summarize(result);
  if (s.total !== result.numTotalTests) {
    console.error(`[ci-vitest-summary] CANNOT TRUST: the file says ${result.numTotalTests} tests and I counted ${s.total}.`);
    return 2;
  }
  const md = toMarkdown(title, s);
  console.log(md);
  if (process.env.GITHUB_STEP_SUMMARY) {
    try { appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`); } catch (e) { console.error(`[ci-vitest-summary] could not write the job summary: ${e.message}`); }
  }
  if (s.ran === 0) {
    console.error(`[ci-vitest-summary] FAIL: no test ran (${s.skipped} skipped, ${s.todo} todo). Skipped is not passed.`);
    return 1;
  }
  if (s.failed > 0) {
    console.error(`[ci-vitest-summary] FAIL: ${s.failed} test(s) failed.`);
    return 1;
  }
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main();
