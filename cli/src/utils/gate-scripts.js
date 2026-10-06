/**
 * The two scanners UDS ships into an adopter's project, and the code that runs them.
 * // implements XSPEC-444 R5
 *
 * `full-coverage-testing` has always told adopters to "add scripts/check-stubs.sh and
 * scripts/check-anti-fake-tests.sh", and its validator checked that those files EXIST —
 * but UDS shipped neither, so the instruction could not be followed and the check could
 * only ever say "missing". This is the missing half:
 *
 *   installGateScripts()   `uds init` writes the two scanners (templates/gates/*.mjs) to
 *                          `<project>/scripts/`, records them for `uds uninstall`, and never
 *                          overwrites a file that is already there.
 *   runTestQualityGates()  `uds check` (what the pre-commit hook runs) executes the ones that
 *                          are installed and prints what they found as a WARNING. It does not
 *                          change the exit code unless the adopter set `"mode": "block"`.
 *
 * Why the scanners are written into the project instead of run from the CLI: they are the
 * adopter's to read, edit and wire into CI (`node scripts/check-stubs.mjs` is a hard gate on
 * its own), and a standard that says "this file must exist" is only honest if the file does.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { spawnSync } from 'child_process';
import chalk from 'chalk';
import { getRepoRoot } from './copier.js';
import { newRecorder, mkdirTracked, recordFile, RECORD_KINDS } from '../core/install-records.js';
import { loadPolicy } from './test-policy.js';
import { readStagedChanges } from './test-change-check.js';

/** The standard that asks for these scripts; they are only written when it is installed. */
export const GATE_STANDARD_FILE = 'full-coverage-testing.ai.yaml';

export const GATE_SCRIPTS = Object.freeze([
  { file: 'check-anti-fake-tests.mjs', label: 'anti-fake-test', what: 'tests that cannot fail' },
  { file: 'check-stubs.mjs', label: 'stub', what: 'placeholders and empty shells' }
]);

const templatePath = (file) => join(getRepoRoot(), 'templates', 'gates', file);
const destRel = (file) => `scripts/${file}`;

export function gateStandardInstalled(projectPath) {
  return existsSync(join(projectPath, '.standards', GATE_STANDARD_FILE));
}

/**
 * Write the scanners into `<project>/scripts/`. Never overwrites: a file that exists is the
 * adopter's (they may have edited it), and is reported as kept.
 * @param {string} projectPath
 * @param {object} recorder   an install-records recorder (see core/install-records.js)
 * @returns {{ written: string[], kept: string[], missingTemplate: string[], skipped?: string }}
 */
export function installGateScripts(projectPath, recorder = newRecorder()) {
  const result = { written: [], kept: [], missingTemplate: [] };
  if (!gateStandardInstalled(projectPath)) {
    result.skipped = `${GATE_STANDARD_FILE} is not installed in this project`;
    return result;
  }
  for (const { file } of GATE_SCRIPTS) {
    const rel = destRel(file);
    const dest = join(projectPath, rel);
    if (existsSync(dest)) { result.kept.push(rel); continue; }
    const src = templatePath(file);
    if (!existsSync(src)) { result.missingTemplate.push(file); continue; }
    mkdirTracked(recorder, projectPath, dirname(dest));
    writeFileSync(dest, readFileSync(src, 'utf-8'), 'utf-8');
    recordFile(recorder, projectPath, rel, RECORD_KINDS.GATE_SCRIPT);
    result.written.push(rel);
  }
  return result;
}

const MAX_SHOWN = 12;

/**
 * Run the installed scanners and print the outcome. Never throws.
 * @param {string} projectPath
 * @param {{ staged?: boolean, mode?: 'warn'|'block', log?: Function }} [opts]
 *   staged — scan only the files staged for commit (what a pre-commit run wants);
 *            otherwise the whole project (a CI or manual run). Default: staged when
 *            something is staged, whole project when nothing is.
 * @returns {{ ran: string[], findings: Record<string, number>, couldNotJudge: string[], blocked: boolean, missing: string[] }}
 */
export function runTestQualityGates(projectPath, { staged, mode, log = console.log } = {}) {
  const result = { ran: [], findings: {}, couldNotJudge: [], blocked: false, missing: [] };
  const effectiveMode = mode || loadPolicy(projectPath).policy.mode;
  const blocking = effectiveMode === 'block';

  if (!gateStandardInstalled(projectPath)) return result;
  if (staged === undefined) {
    const s = readStagedChanges(projectPath);
    staged = Array.isArray(s.changes) && s.changes.length > 0;
  }

  for (const { file, label } of GATE_SCRIPTS) {
    const rel = destRel(file);
    const abs = join(projectPath, rel);
    if (!existsSync(abs)) { result.missing.push(file); continue; }

    const args = [abs, ...(staged ? ['--staged'] : [])];
    const r = spawnSync(process.execPath, args, { cwd: projectPath, encoding: 'utf-8', timeout: 120000, maxBuffer: 32 * 1024 * 1024 });
    result.ran.push(file);

    if (r.status === 0) {
      log(chalk.gray(`  ✓ [${label}] ${rel}: nothing found${staged ? ' in the staged files' : ''}`));
      // "Nothing found" must not hide what was NOT looked at: the script lists files it could not
      // judge (a language it has no rule for, an unparsable call) on lines that start with `·`.
      for (const l of (r.stdout || '').split('\n').filter((x) => /^\s*·/.test(x))) log((/NOT scanned|could not be parsed/.test(l) ? chalk.yellow : chalk.gray)(`    ${l.trim()}`));
      continue;
    }
    if (r.status === 1) {
      const lines = (r.stdout || '').split('\n').filter((l) => l.trim());
      const count = lines.filter((l) => /^\s*✗/.test(l)).length;
      result.findings[label] = count;
      const head = blocking
        ? `  ✗ [${label}] BLOCKED: ${rel} found ${count} finding(s) (mode "block").`
        : `  ⚠ [${label}] ${rel} found ${count} finding(s) — warning only, the commit is not blocked.`;
      log(blocking ? chalk.red(head) : chalk.yellow(head));
      const shown = lines.slice(0, MAX_SHOWN + 4);
      for (const l of shown) log(chalk.gray(`    ${l.trim()}`));
      if (lines.length > shown.length) log(chalk.gray(`    ... (run \`node ${rel}\` to see everything)`));
      if (blocking) result.blocked = true;
      continue;
    }
    // exit 2, a crash, a timeout, a missing node: the scanner could not judge. Never a pass.
    const why = r.error ? r.error.message : (r.stderr || r.stdout || `exit ${r.status}`).split('\n').find((l) => l.trim()) || `exit ${r.status}`;
    result.couldNotJudge.push(label);
    const head = blocking
      ? `  ✗ [${label}] BLOCKED: ${rel} could not judge (mode "block" treats that as a failure): ${why.trim()}`
      : `  ⚠ [${label}] ${rel} could not judge — this is NOT a pass: ${why.trim()}`;
    log(blocking ? chalk.red(head) : chalk.yellow(head));
    if (blocking) result.blocked = true;
  }

  if (result.missing.length > 0) {
    log(chalk.gray(`  ℹ [test-gates] ${result.missing.map(destRel).join(', ')} not installed (the full-coverage-testing standard asks for them). \`uds update\` offers to install them.`));
  }
  if (result.blocked) process.exitCode = 1;
  if (result.ran.length > 0 || result.missing.length > 0) log();
  return result;
}
