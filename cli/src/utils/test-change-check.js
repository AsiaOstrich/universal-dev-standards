/**
 * "This commit changes code and touches no test" — the pre-commit check.
 * // implements XSPEC-444 R2
 *
 * Runs inside `uds check`, which is what the pre-commit hook UDS writes calls. It reads
 * what is staged (`git diff --cached`); with nothing staged (a CI run, a manual
 * `uds check`) it says nothing, because there is no commit to judge.
 *
 * What it decides, per staged file (see test-policy.js for the table):
 *   source + no test in the same change   → warn, listing every code file
 *   a file of a type the table has never seen → warn, listing it and saying how to
 *                                           classify it. Never read as "fine".
 *   pure rename (git's R100)              → exempt; recorded in the output with its reason
 *   deletion                              → not a code change that needs a test
 *   `exempt` entry in the policy          → exempt; recorded with the adopter's reason
 *
 * Severity: "warn" by default. `"mode": "block"` in `.standards/test-policy.json` makes a
 * code change without a test fail the check. An unclassified file never blocks — it is
 * UDS's own gap, not the committer's.
 *
 * NOT done here, on purpose (reported to the maintainer instead of guessed):
 *   - the ratchet ("count of unpaired changes may only go down"): `uds check` is read-only
 *     by design and the spec does not say where the baseline lives or what a "change" is
 *     counted in.
 *   - per-commit exemption with a reason: a pre-commit hook cannot read the commit message
 *     (that is the commit-msg hook), so a per-commit reason has nowhere to be read from.
 *     Standing exemptions with reasons are `exempt` entries in the policy file.
 */

import { execFileSync } from 'child_process';
import chalk from 'chalk';
import { loadPolicy, classifyPath, POLICY_FILE } from './test-policy.js';

/**
 * Parse `git diff --name-status -z` output.
 * Records: `A\0path\0`, `M\0path\0`, `D\0path\0`, `R100\0old\0new\0`, `C75\0old\0new\0`.
 * @returns {{ status: string, path: string, oldPath?: string, similarity?: number }[]}
 */
export function parseNameStatusZ(output) {
  const parts = output.split('\0');
  if (parts[parts.length - 1] === '') parts.pop();
  const out = [];
  for (let i = 0; i < parts.length;) {
    const code = parts[i++];
    if (!code) continue;
    const letter = code[0];
    if (letter === 'R' || letter === 'C') {
      out.push({ status: letter, oldPath: parts[i++], path: parts[i++], similarity: parseInt(code.slice(1), 10) || 0 });
    } else {
      out.push({ status: letter, path: parts[i++] });
    }
  }
  return out;
}

/** The staged changes of the repository at `projectPath`, or `{ error }` when git cannot say. */
export function readStagedChanges(projectPath) {
  try {
    const out = execFileSync('git', ['-c', 'core.quotepath=off', 'diff', '--cached', '--name-status', '-M', '-z'], {
      cwd: projectPath,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024
    });
    return { changes: parseNameStatusZ(out) };
  } catch (e) {
    const stderr = String(e.stderr || e.message || '').trim().split('\n')[0];
    // "not a git repository" is not a failure of this check: there is no commit to judge.
    if (/not a git repository/i.test(stderr) || e.code === 'ENOENT') return { notRepo: true, error: stderr || 'git not found' };
    return { error: stderr || 'git diff failed' };
  }
}

/**
 * Judge a list of staged changes against a policy. Pure: no I/O.
 * @returns {{
 *   staged: number, source: string[], tests: string[], unclassified: string[],
 *   exempt: {path:string, reason:string}[], verdict: 'none'|'ok'|'warn'
 * }}
 */
export function judgeChanges(changes, policy) {
  const result = { staged: changes.length, source: [], tests: [], unclassified: [], exempt: [], verdict: 'none' };
  for (const ch of changes) {
    if (ch.status === 'D') continue;
    const cls = classifyPath(ch.path, policy);
    if (cls.kind === 'test') { result.tests.push(ch.path); continue; }
    if (cls.kind === 'unclassified') { result.unclassified.push(ch.path); continue; }
    if (cls.kind !== 'source') continue; // ignored / noncode
    if (ch.status === 'R' && ch.similarity === 100) {
      result.exempt.push({ path: ch.path, reason: `pure rename of ${ch.oldPath} (content unchanged)` });
      continue;
    }
    if (cls.exempt) {
      result.exempt.push({ path: ch.path, reason: `policy exemption "${cls.exempt.pattern}": ${cls.exempt.reason}` });
      continue;
    }
    result.source.push(ch.path);
  }
  if (result.staged === 0) result.verdict = 'none';
  else if (result.source.length > 0 && result.tests.length === 0) result.verdict = 'warn';
  else result.verdict = 'ok';
  return result;
}

const show = (list, max = 12) => {
  const lines = list.slice(0, max).map((f) => `      - ${f}`);
  if (list.length > max) lines.push(`      ... and ${list.length - max} more`);
  return lines;
};

/**
 * Run the check and print its report. Never throws; never changes the exit code in
 * "warn" mode. In "block" mode a code change with no test sets `process.exitCode = 1`.
 * @returns {{ ran: boolean, stagedCount: number, verdict: string, mode: string, blocked: boolean, policyProblems: string[] }}
 */
export function runTestChangeCheck(projectPath, { log = console.log } = {}) {
  const { policy, problems } = loadPolicy(projectPath);
  const staged = readStagedChanges(projectPath);
  const base = { ran: false, stagedCount: 0, verdict: 'none', mode: policy.mode, blocked: false, policyProblems: problems };

  for (const p of problems) log(chalk.yellow(`  ⚠ [test-change] ${p}`));

  if (staged.notRepo) return base;
  if (staged.error) {
    log(chalk.yellow(`  ⚠ [test-change] could not read the staged changes (${staged.error}); the code-without-test check did not run.`));
    return base;
  }
  const judged = judgeChanges(staged.changes, policy);
  const result = { ...base, ran: true, stagedCount: judged.staged, verdict: judged.verdict };
  if (judged.staged === 0) return result;

  const blocking = judged.verdict === 'warn' && policy.mode === 'block';

  if (judged.verdict === 'warn') {
    const head = blocking
      ? `  ✗ [test-change] BLOCKED: this commit changes ${judged.source.length} code file(s) and touches no test file (XSPEC-444 R2, mode "block").`
      : `  ⚠ [test-change] This commit changes ${judged.source.length} code file(s) and touches no test file (XSPEC-444 R2). Warning only — the commit is not blocked.`;
    log(blocking ? chalk.red(head) : chalk.yellow(head));
    log(chalk.gray('    code files changed without a test change:'));
    for (const l of show(judged.source)) log(chalk.gray(l));
    log(chalk.gray('    A change to behavior needs a test that fails without it. Not a behavior change (generated code, a rename with edits)?'));
    log(chalk.gray(`    Record the exemption with its reason in ${POLICY_FILE}:  "exempt": [{ "pattern": "<glob>", "reason": "<why>" }]`));
    if (!blocking) log(chalk.gray(`    To make this block the commit instead: set "mode": "block" in ${POLICY_FILE}.`));
  }
  if (judged.unclassified.length > 0) {
    log(chalk.yellow(`  ⚠ [test-change] ${judged.unclassified.length} changed file(s) are of a type UDS does not recognize, so it cannot tell whether they are code (never assumed fine, never blocks):`));
    for (const l of show(judged.unclassified)) log(chalk.gray(l));
    log(chalk.gray(`    Say what they are in ${POLICY_FILE}: "sourceExtensions": ["<ext>"] (code) or "nonCodeExtensions": ["<ext>"] (not code); test files: "testPatterns".`));
  }
  if (judged.exempt.length > 0) {
    log(chalk.gray('  ℹ [test-change] exempt from the test requirement, with the reason on record:'));
    for (const e of judged.exempt.slice(0, 12)) log(chalk.gray(`      - ${e.path} — ${e.reason}`));
  }
  if (blocking) {
    process.exitCode = 1;
    result.blocked = true;
  }
  if (judged.verdict === 'warn' || judged.unclassified.length > 0 || judged.exempt.length > 0) log();
  return result;
}
