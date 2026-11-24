#!/usr/bin/env node
/**
 * Run, on this machine, the pure checks that CI runs.
 * 在本機執行 CI 會跑的「純檢查」。
 *
 * **Why this exists.** On 2026-11-24 commit e2b5fa32 went to main with
 * `pre-release-check.sh` green and was refused by CI's `check:error-exit`,
 * a check the local script did not run. It was not the first time (the
 * comment that used to sit at the bottom of pre-release-check.sh listed
 * fourteen CI jobs "still not mirrored", written down after the previous
 * incident and never acted on). Each time someone added the missing step
 * to the script by hand, and the next CI check added a week later was
 * missing again. A hand-kept copy of a list drifts; so this file keeps no
 * list of checks. It READS `.github/workflows/*.yml` and runs what it finds.
 *
 * **What counts as a check.** A command in a workflow `run:` step whose
 * script name (the `npm run` script, or the file basename) contains the
 * word `check` (`check:error-exit`, `check-prompt-footprint.mjs`,
 * `docs:check-index`), whose arguments contain `--check` or `--self-test`,
 * or that is `npm run ci:*`. Anything not selected by that rule has to be
 * named in EXCLUDED (with a reason) or ALSO_RUN (with a reason) below; a
 * workflow command that runs a repo script and is in none of the three is
 * reported as UNCLASSIFIED and fails the run. So a new CI step is either run
 * automatically, or someone has to say in this file why it is not.
 *
 * Usage:
 *   node scripts/run-ci-checks-locally.mjs               run everything selected
 *   node scripts/run-ci-checks-locally.mjs --list        print the plan, run nothing
 *   node scripts/run-ci-checks-locally.mjs --filter RE   run only commands matching RE
 *   node scripts/run-ci-checks-locally.mjs --fail-fast   stop at the first red
 *   node scripts/run-ci-checks-locally.mjs --skip-tests  leave out the `npm run test:*` jobs (the slow ones); they are listed as skipped
 *   node scripts/run-ci-checks-locally.mjs --self-test   prove the runner itself can go red
 *   (--root DIR and --workflows DIR point it at another tree; the self-test uses them)
 *
 * Exit codes: 0 all selected checks passed | 1 a check failed, or a workflow
 * command is unclassified | 2 could not measure (no workflow, YAML does not
 * parse, nothing selected, dependencies missing). 2 is a failure too: a gate
 * that passes when it cannot read its input is the gate that did not work.
 *
 * Exit 2 from a check is this repo's "could not measure". With uncommitted changes in the
 * working tree (check:bump-roundtrip refuses to run on one; CI's checkout never has any) it is
 * printed as NOT MEASURED and not counted red; on a clean tree it is red. A timed-out check is
 * killed together with everything it started.
 *
 * Not covered, said plainly: jobs that depend on GitHub's own context (the PR
 * base SHA, matrix OS, `needs.*` outputs) cannot be reproduced here; a command
 * that carries a `${{ }}` expression or a `$VARIABLE` is listed as skipped
 * with the token that stopped it, never silently dropped. CI's `if:` and
 * path filters are ignored: this runs every step, which is stricter than CI.
 */

import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const SCRIPT_ROOT = join(dirname(SELF), '..');

// ═══════════════════════════════════════════════════════════════════════════
// The two lists. Everything else is derived from the workflows.
// 兩份清單。其餘全部從 workflow 檔推導。
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Workflow commands that are NOT run here, each with the reason. Matched
 * against the command text (`cmd`, as written in the workflow). A reason that
 * says "covered by pre-release-check step N" is a claim about that script; if
 * you remove that step, remove the exclusion with it.
 */
export const EXCLUDED = [
  { re: /^npm run lint\b/, why: 'pre-release-check.sh step 14 already runs the lint' },
  { re: /^npm run test:unit\b/, why: 'pre-release-check.sh step 19 already runs the unit suite (and --skip-tests skips it on purpose)' },
  { re: /^npm run test:e2e\b/, why: 'pre-release-check.sh step 20 already runs the E2E suite' },
  { re: /^node \.\.\/scripts\/ci-vitest-summary\.mjs\b/, why: 'summarises the E2E result file that only CI\'s own E2E run leaves behind' },
  { re: /^node bin\/uds\.js (--version|list)\b/, why: 'install smoke test of the CLI entry; steps 19, 20 and 23 of pre-release-check.sh run that entry for real' },
  { re: /^node scripts\/beta-acceptance\/resolve-version\.mjs\b/, why: 'resolves which published version to accept from a GitHub workflow_run / dispatch event; no event exists locally' },
  { re: /^node scripts\/beta-acceptance\/wait-for-npm\.mjs\b/, why: 'polls npm until a release is published; only meaningful after npm publish' },
  { re: /^node scripts\/beta-acceptance\/run\.mjs\b/, why: 'runs acceptance against the PUBLISHED package on each shell; there is nothing published yet before a release' },
  { re: /^node scripts\/beta-acceptance\/ci-summary\.mjs\b/, why: 'summarises the reports that run.mjs produced in CI' },
  { re: /run-ci-checks-locally\.mjs|^npm run check:ci-parity\b/, why: 'this runner itself; running it from inside itself would never end' },
  { re: /^node cli\/bin\/uds\.js audit --score --self\b/, why: 'the weekly health job\'s report generator (its output is redirected to health-report.json and scored in a later step); not a gate, and a self-audit is what step 23 of pre-release-check.sh does' },
  { re: /^npm publish\b/, why: 'publishing is irreversible and is done by the release workflow only' },
];

/**
 * Workflow commands that are run although their name does not say "check",
 * each with the reason.
 */
export const ALSO_RUN = [
  { re: /^npm run test:coverage$/, why: 'CI job "Coverage Gate": the thresholds in cli/vitest.config.js are only enforced by this run. It is the whole vitest suite again with instrumentation, about 5.5 minutes; --skip-tests leaves it out' },
  { re: /^npm run test:scripts$/, why: 'CI job "Check Script Ratchet" (bats over tests/scripts/): the tests OF these check scripts; it went red on CI four times while invisible here (see pre-release-check.bats). Slow, about 3.3 minutes' },
  { re: /^npm run prepack$/, why: 'regenerates cli/bundled (gitignored) which check:bundle-parity compares against; bundle-parity.yml runs it first, so does this' },
];

// ═══════════════════════════════════════════════════════════════════════════
// Reading a workflow's `run:` text
// 讀 workflow 的 run 內容
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Split a `run:` script into logical lines: a backslash-newline joins lines,
 * a newline inside quotes does not end the line (`node -e "..."` blocks), and a
 * `#` that starts a word begins a comment.
 */
export function logicalLines(script) {
  const text = script.replace(/\r\n/g, '\n');
  const out = [];
  let cur = '';
  let q = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      cur += c;
      if (c === q && (q === "'" || text[i - 1] !== '\\')) q = null;
      continue;
    }
    if (c === '\\' && text[i + 1] === '\n') { i++; continue; }
    if (c === '#' && (cur === '' || /\s$/.test(cur))) {
      while (i < text.length && text[i] !== '\n') i++;
      i--;
      continue;
    }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === '\n') { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

/**
 * Split one logical line into command segments on `&&` and `;`, and read each
 * segment's words. A segment that is piped, redirected, backgrounded, wrapped in
 * `||`, or built with `$(...)` is marked `glue`: shell plumbing, not a command
 * this runner can run on its own.
 * @returns {{words: string[], text: string, glue: boolean, expr: string|null, variable: string|null}[]}
 */
export function segments(line) {
  const segs = [];
  let words = [];
  let raws = [];
  let word = null;
  let wordRaw = '';
  let bare = '';
  let glue = false;
  let q = null;
  let expr = null;
  let variable = null;
  let afterOr = false;
  const endWord = () => { if (word !== null) { words.push(word); raws.push(wordRaw); word = null; wordRaw = ''; } };
  const endSeg = () => {
    endWord();
    if (words.length) segs.push({ words, raws, bare: bare.trim(), glue: glue || afterOr, expr, variable });
    words = []; raws = []; bare = ''; glue = false; expr = null; variable = null; afterOr = false;
  };
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    const two = line.slice(i, i + 2);
    if (two === '${' && line[i + 2] === '{') {
      const end = line.indexOf('}}', i);
      expr ??= line.slice(i, end === -1 ? line.length : end + 2);
    }
    if (q) {
      wordRaw += c;
      if (c === q && (q === "'" || line[i - 1] !== '\\')) { q = null; continue; }
      word += c;
      if (q === '"' && c === '$' && line[i + 1] === '(') glue = true;
      if (q === '"' && c === '$' && /[A-Za-z_{]/.test(line[i + 1] || '') && line.slice(i, i + 3) !== '${{') variable ??= line.slice(i).match(/^\$\{?[A-Za-z_]\w*\}?/)?.[0] ?? '$';
      continue;
    }
    if (c === '"' || c === "'") { q = c; word ??= ''; wordRaw += c; continue; }
    if (two === '&&' || two === '||') {
      const wasOr = two === '||';
      if (wasOr) glue = true;
      endSeg();
      if (wasOr) afterOr = true;
      i++; continue;
    }
    if (c === ';') { endSeg(); continue; }
    if (c === '|' || c === '>' || c === '<' || c === '&' || c === '`') { glue = true; endWord(); bare += c; continue; }
    if (c === '$') {
      if (line[i + 1] === '(') glue = true;
      else if (/[A-Za-z_]/.test(line[i + 1] || '')) variable ??= line.slice(i).match(/^\$[A-Za-z_]\w*/)[0];
    }
    bare += c;
    if (/\s/.test(c)) { endWord(); continue; }
    word = (word ?? '') + c;
    wordRaw += c;
  }
  endSeg();
  return segs;
}

/** Words of the check-like name: `check:error-exit` -> check, error, exit. */
const nameWords = (name) => name.split(/[:/._-]+/).filter(Boolean);
const hasCheckWord = (name) => nameWords(name).includes('check');

/**
 * What a command segment is, to this runner.
 * `{ kind: 'none' }`   shell glue or something that is not a repo script (npm ci, echo, git ...)
 * `{ kind: 'script' }` a repo script / npm script / tool invocation that needs a verdict
 */
export function describeSegment(seg) {
  const w = seg.words;
  if (!w.length || seg.glue) return { kind: 'none' };
  // Words that only introduce the command: `if ! npm run check:x`, `then ...`, `time ...`, `FOO=1 ...`.
  let i = 0;
  while (i < w.length && (['if', 'elif', 'then', 'do', 'else', 'while', 'until', '!', 'time'].includes(w[i]) || /^[A-Za-z_]\w*=/.test(w[i]))) i++;
  const head = w[i];
  const rest = w.slice(i + 1);
  if (!head) return { kind: 'none' };
  const cmd = seg.raws.slice(i).join(' ');
  const exec = seg.raws.join(' ').replace(/^((?:then|do|else|elif|if|while|until|!|time)\s+)+/, '');
  if (head === 'cd') return { kind: 'cd', to: rest[0] };
  if (head === 'npm') {
    const sub = rest[0];
    if (sub === 'run' || sub === 'run-script') return { kind: 'script', cmd, exec, name: rest[1] ?? '', args: rest.slice(2) };
    if (sub === 'publish') return { kind: 'script', cmd, exec, name: 'publish', args: rest.slice(1) };
    if (sub === 'test' || sub === 't') return { kind: 'script', cmd, exec, name: 'test', args: rest.slice(1) };
    return { kind: 'none' };
  }
  if (head === 'node' || head === 'tsx' || head === 'bash' || head === 'sh') {
    if (rest.some((x) => x === '-e' || x === '--eval' || x === '-p' || x === '--print' || x === '-c')) return { kind: 'none' };
    const target = rest.find((x) => !x.startsWith('-'));
    if (!target || !/\.(mjs|cjs|js|ts|sh)$/.test(target)) return { kind: 'none' };
    return { kind: 'script', cmd, exec, name: target, args: rest.slice(rest.indexOf(target) + 1) };
  }
  if (head === 'npx') {
    const target = rest.find((x) => !x.startsWith('-'));
    return target ? { kind: 'script', cmd, exec, name: target, args: rest.slice(rest.indexOf(target) + 1) } : { kind: 'none' };
  }
  if (/^(\.\/|[\w.-]+\/)[\w./-]*\.(sh|mjs|js|ts)$/.test(head)) return { kind: 'script', cmd, exec, name: head, args: rest };
  return { kind: 'none' };
}

/**
 * A segment `describeSegment` ignored as shell plumbing (piped, redirected, `|| true`,
 * `$(...)`) that still runs a repo script outside any quotes. That is the shape in which
 * a check would slip past silently, so it is reported, never dropped.
 */
const REPO_SCRIPT_IN_TEXT = /\bnpm run\s+[\w:.-]+|\b(?:node|tsx|bash|sh)\s+(?!-[ecp]\b)\S*\.(?:mjs|cjs|js|ts|sh)\b|(?:^|\s)\.\/[\w./-]+\.sh\b/;
export function wrappedRepoScript(seg) {
  if (!seg.glue) return null;
  const m = seg.bare.match(REPO_SCRIPT_IN_TEXT);
  return m ? seg.bare : null;
}

/** Is this script invocation a check by name or by argument? */
export function isCheck({ name, args }) {
  if (args.some((a) => a === '--check' || a === '--self-test')) return true;
  if (name.startsWith('ci:')) return true;
  const base = name.split('/').pop();
  return hasCheckWord(base);
}

/**
 * The verdict for one script invocation.
 * @returns {{verdict: 'run'|'exclude'|'unclassified', reason: string}}
 */
export function classify(d, seg) {
  // An explicit decision (with its own reason) is shown in preference to the generic one.
  const ex = EXCLUDED.find((e) => e.re.test(d.cmd));
  if (ex) return { verdict: 'exclude', reason: ex.why };
  if (seg.expr) return { verdict: 'exclude', reason: `needs a value only a GitHub run supplies (${seg.expr})` };
  if (seg.variable) return { verdict: 'exclude', reason: `needs a value only the CI step's env supplies (${seg.variable})` };
  if (isCheck(d)) return { verdict: 'run', reason: 'a check by name' };
  const also = ALSO_RUN.find((e) => e.re.test(d.cmd));
  if (also) return { verdict: 'run', reason: also.why };
  return { verdict: 'unclassified', reason: 'runs a repo script, but is neither a check by name nor in EXCLUDED / ALSO_RUN' };
}

// ═══════════════════════════════════════════════════════════════════════════
// Workflow files -> plan
// ═══════════════════════════════════════════════════════════════════════════

function loadYaml() {
  try {
    return createRequire(join(SCRIPT_ROOT, 'cli', 'package.json'))('js-yaml');
  } catch (e) {
    throw new CannotMeasure(`js-yaml is not installed (run \`npm ci\` in cli/): ${e.message.split('\n')[0]}`);
  }
}

export class CannotMeasure extends Error {}

/**
 * @returns {{file: string, job: string, cwd: string, run: string}[]} every `run:` step, in file / job / step order
 */
export function readRunSteps(workflowsDir) {
  if (!existsSync(workflowsDir)) throw new CannotMeasure(`no workflow directory at ${workflowsDir}`);
  const files = readdirSync(workflowsDir).filter((f) => /\.ya?ml$/.test(f)).sort();
  if (!files.length) throw new CannotMeasure(`no *.yml in ${workflowsDir}`);
  const yaml = loadYaml();
  const steps = [];
  for (const f of files) {
    let doc;
    try {
      doc = yaml.load(readFileSync(join(workflowsDir, f), 'utf8'));
    } catch (e) {
      throw new CannotMeasure(`${f} does not parse as YAML: ${e.message.split('\n')[0]}`);
    }
    if (!doc || typeof doc !== 'object' || typeof doc.jobs !== 'object' || doc.jobs === null) {
      throw new CannotMeasure(`${f} has no \`jobs\` mapping`);
    }
    const wfDir = doc.defaults?.run?.['working-directory'];
    for (const [job, j] of Object.entries(doc.jobs)) {
      const jobDir = j?.defaults?.run?.['working-directory'] ?? wfDir ?? '.';
      for (const s of j?.steps ?? []) {
        if (typeof s?.run === 'string') steps.push({ file: f, job, cwd: s['working-directory'] ?? jobDir, run: s.run });
      }
    }
  }
  return steps;
}

/**
 * Turn the steps into the plan: what runs, what is excluded and why, what no
 * rule covers, which directories CI installed dependencies in.
 */
export function buildPlan(steps) {
  const plan = { run: [], excluded: [], unclassified: [], installDirs: new Set() };
  const seen = new Set();
  const add = (list, tag, item) => {
    const key = `${tag}\0${item.cwd}\0${item.cmd}`;
    if (seen.has(key)) return;
    seen.add(key);
    list.push(item);
  };
  for (const st of steps) {
    let cwd = st.cwd;
    for (const line of logicalLines(st.run)) {
      for (const seg of segments(line)) {
        if (seg.words[0] === 'npm' && ['ci', 'install', 'i'].includes(seg.words[1]) && !seg.glue && !seg.words.includes('-g')) {
          plan.installDirs.add(cwd);
          continue;
        }
        const wrapped = wrappedRepoScript(seg);
        if (wrapped) {
          const item = { file: st.file, job: st.job, cwd, cmd: wrapped };
          const ex = EXCLUDED.find((e) => e.re.test(wrapped));
          if (ex) add(plan.excluded, 'exclude', { ...item, reason: ex.why });
          else add(plan.unclassified, 'unclassified', { ...item, reason: 'runs a repo script inside a shell construct (pipe, redirect, `|| true`, $(...)) that this runner cannot reproduce faithfully' });
          continue;
        }
        const d = describeSegment(seg);
        if (d.kind === 'cd') { cwd = join(cwd, d.to ?? '.'); continue; }
        if (d.kind !== 'script') continue;
        const v = classify(d, seg);
        const item = { file: st.file, job: st.job, cwd, cmd: d.exec, reason: v.reason };
        if (v.verdict === 'run') add(plan.run, 'run', item);
        else add(v.verdict === 'exclude' ? plan.excluded : plan.unclassified, v.verdict, item);
      }
    }
  }
  return plan;
}

// ═══════════════════════════════════════════════════════════════════════════
// Running
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Workflow `run:` lines are written for bash (`FOO=1 node …`, `if ! npm run …; then`). On Windows the default shell is cmd,
 * which reads neither, so run them through bash there too (GitHub's Windows runners and Git for Windows ship it). If bash is
 * missing the spawn fails and the check is reported red, never skipped.
 */
export const ciShellFor = (platform) => (platform === 'win32' ? 'bash' : true);
const CI_SHELL = ciShellFor(process.platform);

/** `./x.sh` is run through bash: CI chmods it first, a checkout here may not have the bit. */
const shellForm = (cmd) => (/^\.\/\S+\.sh(\s|$)/.test(cmd) ? `bash ${cmd}` : cmd);

let current = null;

/** Kill the check AND whatever it started: killing only the shell leaves a vitest running for hours. */
function killTree(child) {
  try {
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F']);
    else process.kill(-child.pid, 'SIGKILL');
  } catch { /* already gone */ }
}

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { if (current) killTree(current); process.exit(130); });
}

function runOne(item, root, timeoutMs) {
  return new Promise((done) => {
    const t0 = Date.now();
    const chunks = [];
    const child = spawn(shellForm(item.cmd), { cwd: resolve(root, item.cwd), shell: CI_SHELL, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
    current = child;
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; killTree(child); }, timeoutMs);
    child.stdout.on('data', (b) => chunks.push(b));
    child.stderr.on('data', (b) => chunks.push(b));
    const finish = (code, signal) => {
      clearTimeout(timer);
      current = null;
      done({ code: timedOut ? 124 : (code ?? 1), signal, timedOut, ms: Date.now() - t0, output: Buffer.concat(chunks).toString('utf8') });
    };
    child.on('error', (e) => { chunks.push(Buffer.from(`could not start: ${e.message}\n`)); finish(127, null); });
    child.on('close', finish);
  });
}

/** Does `git status --porcelain` show anything? null when this is not a git checkout (or git is missing). */
function treeIsDirty(root) {
  const r = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) return null;
  return r.stdout.trim().length > 0;
}

const fmt = (ms) => (ms < 10000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms / 1000)}s`);
const tail = (s, n) => s.split('\n').slice(-n).join('\n');

/**
 * Run the plan. Returns the process exit code.
 */
export async function main(argv, io = { out: (s) => process.stdout.write(s), err: (s) => process.stderr.write(s) }) {
  const opt = { root: SCRIPT_ROOT, workflows: null, filter: null, list: false, failFast: false, skipTests: false, timeoutMs: 20 * 60 * 1000 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') opt.root = resolve(argv[++i]);
    else if (a === '--workflows') opt.workflows = resolve(argv[++i]);
    else if (a === '--filter') opt.filter = new RegExp(argv[++i]);
    else if (a === '--list') opt.list = true;
    else if (a === '--fail-fast') opt.failFast = true;
    else if (a === '--skip-tests') opt.skipTests = true;
    else if (a === '--timeout-ms') opt.timeoutMs = Number(argv[++i]);
    else { io.err(`unknown option: ${a}\n`); return 2; }
  }
  const workflows = opt.workflows ?? join(opt.root, '.github', 'workflows');

  let plan;
  try {
    const steps = readRunSteps(workflows);
    plan = buildPlan(steps);
  } catch (e) {
    if (e instanceof CannotMeasure) { io.err(`CANNOT MEASURE: ${e.message}\n(this is a failure, not a pass: nothing was checked)\n`); return 2; }
    throw e;
  }
  if (opt.skipTests) {
    for (const x of plan.run.filter((r) => /^npm run test:/.test(r.cmd))) {
      plan.run.splice(plan.run.indexOf(x), 1);
      plan.excluded.push({ ...x, reason: `--skip-tests (${x.reason})` });
    }
  }
  if (!plan.run.length) {
    io.err(`CANNOT MEASURE: ${workflows} parsed, but no check command was found in it. A gate that selects nothing proves nothing.\n`);
    return 2;
  }

  io.out(`CI-parity checks: ${plan.run.length} to run, ${plan.excluded.length} excluded, ${plan.unclassified.length} unclassified (from ${workflows})\n`);
  for (const x of plan.excluded) io.out(`  skip  ${x.cwd}> ${x.cmd}  [${x.file}:${x.job}]\n        why: ${x.reason}\n`);
  for (const x of plan.unclassified) io.out(`  ???   ${x.cwd}> ${x.cmd}  [${x.file}:${x.job}]\n        ${x.reason}\n`);

  const selected = opt.filter ? plan.run.filter((x) => opt.filter.test(x.cmd)) : plan.run;
  if (opt.list) {
    for (const x of selected) io.out(`  run   ${x.cwd}> ${x.cmd}  [${x.file}:${x.job}]\n`);
    return plan.unclassified.length ? 1 : 0;
  }

  // Where CI ran `npm ci`, the dependencies must be here. Missing ones would make
  // every check below fail for the wrong reason, so say it once, as what it is.
  for (const d of plan.installDirs) {
    if (!existsSync(join(opt.root, d, 'node_modules'))) {
      io.err(`CANNOT MEASURE: CI installs dependencies in "${d}" but ${join(opt.root, d, 'node_modules')} does not exist. Run \`npm ci\` there first.\n`);
      return 2;
    }
  }

  const results = [];
  const t0 = Date.now();
  let n = 0;
  for (const item of selected) {
    n++;
    const r = await runOne(item, opt.root, opt.timeoutMs);
    // Exit 2 is this repo's "I could not measure" (check-bump-sync-roundtrip.mjs refuses to run on a
    // working tree with uncommitted changes, and CI's checkout never has any). With uncommitted changes
    // that is not a verdict about the code, so it is shown as NOT MEASURED, loudly, and not counted red.
    // On a clean tree the same exit 2 is red.
    r.notMeasured = r.code === 2 && treeIsDirty(opt.root) === true;
    results.push({ item, ...r });
    const ok = r.code === 0;
    io.out(`[${n}/${selected.length}] ${ok ? 'PASS' : r.notMeasured ? 'SKIP' : 'FAIL'} ${fmt(r.ms).padStart(5)}  ${item.cwd}> ${item.cmd}${r.timedOut ? '  (timed out)' : ''}${r.notMeasured ? '  (could not be measured: the working tree has uncommitted changes)' : ''}\n`);
    if (!ok) {
      io.out(`${tail(r.output, 60).replace(/^/gm, '        ')}\n`);
      if (opt.failFast && !r.notMeasured) break;
    }
  }

  const failed = results.filter((r) => r.code !== 0 && !r.notMeasured);
  const unmeasured = results.filter((r) => r.notMeasured);
  const total = Date.now() - t0;
  io.out('\n');
  io.out(`Ran ${results.length}/${selected.length}: ${results.length - failed.length - unmeasured.length} passed, ${failed.length} failed, ${unmeasured.length} not measured, total ${fmt(total)}\n`);
  const slow = [...results].sort((a, b) => b.ms - a.ms).slice(0, 5);
  io.out(`Slowest: ${slow.map((r) => `${fmt(r.ms)} ${r.item.cmd}`).join(' | ')}\n`);
  for (const f of failed) io.out(`  RED  ${f.item.cwd}> ${f.item.cmd}  (exit ${f.code}${f.timedOut ? ', timed out' : ''}; from ${f.item.file}:${f.item.job})\n`);
  for (const f of unmeasured) io.out(`  NOT MEASURED  ${f.item.cwd}> ${f.item.cmd}: exit 2 on a working tree with uncommitted changes. Commit or stash, then run it again; CI will run it on a clean checkout.\n`);
  if (plan.unclassified.length) io.out(`  RED  ${plan.unclassified.length} workflow command(s) are unclassified: add each to EXCLUDED or ALSO_RUN in scripts/run-ci-checks-locally.mjs, with a reason.\n`);
  return failed.length || plan.unclassified.length ? 1 : 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// Self-test: every arm drives the real runner against a fake repo and reads
// the effect back from files the fake checks write.
// ═══════════════════════════════════════════════════════════════════════════

function selfTest() {
  const results = [];
  const arm = (name, fn) => {
    try { fn(); results.push([name, true, '']); } catch (e) { results.push([name, false, e.message]); }
  };
  const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

  const fakeRoot = (workflow, scripts = {}, extra = {}) => {
    const root = realpathSync(mkdtempSync(join(tmpdir(), 'uds-ci-runner-')));
    mkdirSync(join(root, '.github', 'workflows'), { recursive: true });
    mkdirSync(join(root, 'scripts', 'beta-acceptance'), { recursive: true });
    if (workflow !== null) writeFileSync(join(root, '.github', 'workflows', 'ci.yml'), workflow);
    for (const [rel, body] of Object.entries(scripts)) {
      mkdirSync(dirname(join(root, rel)), { recursive: true });
      writeFileSync(join(root, rel), body);
    }
    for (const [rel, body] of Object.entries(extra)) writeFileSync(join(root, rel), body);
    return root;
  };
  const marker = (name, code = 0) => `import { mkdirSync, writeFileSync } from 'node:fs';\nmkdirSync('markers', { recursive: true });\nwriteFileSync('markers/${name}', 'ran');\nprocess.exit(${code});\n`;
  const ran = (root, name) => existsSync(join(root, 'markers', name));
  const go = (root, args = []) => {
    const r = spawnSync(process.execPath, [SELF, '--root', root, ...args], { encoding: 'utf8' });
    return { code: r.status, out: `${r.stdout}${r.stderr}` };
  };
  const wf = (...runs) => `name: fake\non: push\njobs:\n  j:\n    runs-on: ubuntu-latest\n    steps:\n${runs.map((r) => `      - run: ${r}\n`).join('')}`;
  const cleanups = [];
  const mk = (...a) => { const r = fakeRoot(...a); cleanups.push(r); return r; };

  try {
    arm('a check the workflow names is run, including one added since (nothing in this file lists it)', () => {
      const root = mk(
        wf('node scripts/check-old.mjs', 'node scripts/check-brand-new-thing.mjs', 'npm run check:z', 'node scripts/gen.mjs --check'),
        {
          'scripts/check-old.mjs': marker('old'),
          'scripts/check-brand-new-thing.mjs': marker('new'),
          'scripts/gen.mjs': "import { mkdirSync, writeFileSync } from 'node:fs';\nif (!process.argv.includes('--check')) process.exit(9);\nmkdirSync('markers', { recursive: true });\nwriteFileSync('markers/gen', 'ran');\n",
          'scripts/check-z.mjs': marker('z'),
        },
        { 'package.json': JSON.stringify({ scripts: { 'check:z': 'node scripts/check-z.mjs' } }) },
      );
      const r = go(root);
      assert(r.code === 0, `expected exit 0, got ${r.code}\n${r.out}`);
      for (const m of ['old', 'new', 'z', 'gen']) assert(ran(root, m), `the check "${m}" did not run`);
    });

    if (process.platform !== 'win32') {
      arm('a ./script.sh check runs even when the file lacks the executable bit', () => {
        const root = mk(wf('./scripts/check-s.sh'), { 'scripts/check-s.sh': 'mkdir -p markers && echo ran > markers/s\n' });
        const r = go(root);
        assert(r.code === 0 && ran(root, 's'), `exit ${r.code}\n${r.out}`);
      });
    }

    arm('an excluded command is not run, and is listed with its reason', () => {
      const root = mk(
        wf('node scripts/check-a.mjs', 'node scripts/beta-acceptance/wait-for-npm.mjs --version 1', 'node scripts/check-expr.mjs "${{ github.sha }}"'),
        { 'scripts/check-a.mjs': marker('a'), 'scripts/beta-acceptance/wait-for-npm.mjs': marker('excluded'), 'scripts/check-expr.mjs': marker('expr') },
      );
      const r = go(root);
      assert(r.code === 0, `exit ${r.code}\n${r.out}`);
      assert(ran(root, 'a'), 'the plain check did not run');
      assert(!ran(root, 'excluded'), 'wait-for-npm.mjs is in EXCLUDED and must not run');
      assert(!ran(root, 'expr'), 'a command with a ${{ }} expression cannot be reproduced and must not run');
      assert(/wait-for-npm[\s\S]*why:/.test(r.out) && r.out.includes('${{ github.sha }}'), `the skipped commands were not listed with a reason\n${r.out}`);
    });

    arm('one red check makes the whole run red, and the others still run', () => {
      const root = mk(wf('node scripts/check-bad.mjs', 'node scripts/check-good.mjs'), { 'scripts/check-bad.mjs': marker('bad', 3), 'scripts/check-good.mjs': marker('good') });
      const r = go(root);
      assert(r.code === 1, `expected exit 1, got ${r.code}\n${r.out}`);
      assert(ran(root, 'good'), 'the check after the red one did not run');
      assert(/RED\s+\.> node scripts\/check-bad\.mjs/.test(r.out), `the red check was not named\n${r.out}`);
    });

    arm('--fail-fast stops after the first red', () => {
      const root = mk(wf('node scripts/check-bad.mjs', 'node scripts/check-good.mjs'), { 'scripts/check-bad.mjs': marker('bad', 3), 'scripts/check-good.mjs': marker('good') });
      const r = go(root, ['--fail-fast']);
      assert(r.code === 1 && !ran(root, 'good'), `exit ${r.code}, good ran: ${ran(root, 'good')}`);
    });

    arm('a workflow with no check command exits non-zero (it must not pass quietly)', () => {
      const r = go(mk(wf('echo hello', 'npm publish --dry-run'), {}));
      assert(r.code === 2, `expected exit 2, got ${r.code}\n${r.out}`);
      assert(/CANNOT MEASURE/.test(r.out), r.out);
    });

    arm('no workflow files, a missing directory, and invalid YAML each exit non-zero', () => {
      const empty = mk(null, {});
      assert(go(empty).code === 2, 'an empty workflows directory passed');
      const gone = mk(null, {});
      rmSync(join(gone, '.github'), { recursive: true });
      assert(go(gone).code === 2, 'a missing workflows directory passed');
      const bad = mk('jobs: [unclosed\n  - x: : :\n', {});
      assert(go(bad).code === 2, 'YAML that does not parse passed');
      const nojobs = mk('name: x\non: push\n', {});
      assert(go(nojobs).code === 2, 'a workflow without jobs passed');
    });

    arm('a workflow command that runs a repo script and fits no rule is red, not ignored', () => {
      const root = mk(wf('node scripts/check-a.mjs', 'node scripts/do-something-new.mjs'), { 'scripts/check-a.mjs': marker('a'), 'scripts/do-something-new.mjs': marker('x') });
      const r = go(root);
      assert(r.code === 1, `expected exit 1, got ${r.code}\n${r.out}`);
      assert(/\?\?\?\s+\.> node scripts\/do-something-new\.mjs/.test(r.out), r.out);
    });

    arm('where CI runs `npm ci`, missing node_modules is "cannot measure", not a pile of unrelated reds', () => {
      const root = mk(wf('npm ci', 'node scripts/check-a.mjs'), { 'scripts/check-a.mjs': marker('a') });
      const r = go(root);
      assert(r.code === 2 && !ran(root, 'a'), `exit ${r.code}, check ran: ${ran(root, 'a')}\n${r.out}`);
    });

    arm('working-directory (step and job default) decides where the check runs', () => {
      const root = mk(
        'name: x\non: push\njobs:\n  j:\n    runs-on: ubuntu-latest\n    defaults:\n      run:\n        working-directory: sub\n    steps:\n      - run: node check-here.mjs\n      - run: node check-deeper.mjs\n        working-directory: sub/deeper\n',
        { 'sub/check-here.mjs': marker('here'), 'sub/deeper/check-deeper.mjs': marker('deeper') },
      );
      const r = go(root);
      assert(r.code === 0, `exit ${r.code}\n${r.out}`);
      assert(existsSync(join(root, 'sub', 'markers', 'here')), `the job default directory was not used\n${r.out}`);
      assert(existsSync(join(root, 'sub', 'deeper', 'markers', 'deeper')), `the step's own working-directory was not used\n${r.out}`);
    });

    arm('a check wrapped in a pipe or `|| true` is reported red, never silently dropped', () => {
      const root = mk(wf('node scripts/check-a.mjs', "node scripts/check-w.mjs | tee out.txt"), { 'scripts/check-a.mjs': marker('a'), 'scripts/check-w.mjs': marker('w') });
      const r = go(root);
      assert(r.code === 1 && /\?\?\?[^\n]*check-w\.mjs/.test(r.out), `exit ${r.code}\n${r.out}`);
    });

    arm('`if ! npm run check:x; then` and `FOO=1 node ...` are still found and run, quoting intact', () => {
      const root = mk(
        'name: x\non: push\njobs:\n  j:\n    runs-on: ubuntu-latest\n    steps:\n      - run: |\n          if ! node scripts/check-if.mjs "two words"; then\n            exit 1\n          fi\n          FOO=bar node scripts/check-env.mjs\n',
        {
          'scripts/check-if.mjs': `import { mkdirSync, writeFileSync } from 'node:fs';\nif (process.argv[2] !== 'two words') process.exit(7);\nmkdirSync('markers', { recursive: true });\nwriteFileSync('markers/if', 'ran');\n`,
          'scripts/check-env.mjs': `import { mkdirSync, writeFileSync } from 'node:fs';\nif (process.env.FOO !== 'bar') process.exit(8);\nmkdirSync('markers', { recursive: true });\nwriteFileSync('markers/env', 'ran');\n`,
        },
      );
      const r = go(root);
      assert(r.code === 0 && ran(root, 'if') && ran(root, 'env'), `exit ${r.code}, if=${ran(root, 'if')}, env=${ran(root, 'env')}\n${r.out}`);
    });

    arm('--skip-tests leaves out npm run test:* and says so; a command that runs this runner is never run', () => {
      const root = mk(
        wf('npm run check:a', 'npm run test:scripts', 'npm run check:ci-parity'),
        { 'scripts/check-a.mjs': marker('a'), 'scripts/slow.mjs': marker('slow') },
        { 'package.json': JSON.stringify({ scripts: { 'check:a': 'node scripts/check-a.mjs', 'test:scripts': 'node scripts/slow.mjs', 'check:ci-parity': 'node scripts/run-ci-checks-locally.mjs' } }) },
      );
      const r = go(root, ['--skip-tests']);
      assert(r.code === 0 && ran(root, 'a') && !ran(root, 'slow'), `exit ${r.code}, a=${ran(root, 'a')}, slow=${ran(root, 'slow')}\n${r.out}`);
      assert(/skip[^\n]*test:scripts[^\n]*\n\s+why: --skip-tests/.test(r.out) && /would never end/.test(r.out), r.out);
    });

    arm('exit 2 on a dirty git tree is NOT MEASURED (not red, but printed); on a clean tree it is red', () => {
      const sh = (root, ...a) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd: root, encoding: 'utf8' });
      const root = mk(wf('node scripts/check-cannot.mjs'), { 'scripts/check-cannot.mjs': marker('cannot', 2) });
      if (sh(root, 'init').status !== 0) return; // no git here: nothing to arm
      sh(root, 'add', '-A');
      sh(root, 'commit', '-m', 'x');
      sh(root, 'rm', '-r', '--cached', '-q', 'markers'); // markers/ is written by the run itself: keep it out of "dirty"
      writeFileSync(join(root, '.gitignore'), 'markers/\n');
      sh(root, 'add', '-A');
      sh(root, 'commit', '-m', 'y');
      const clean = go(root);
      assert(clean.code === 1 && /RED[^\n]*check-cannot/.test(clean.out), `clean tree, exit 2: expected red, got exit ${clean.code}\n${clean.out}`);
      writeFileSync(join(root, 'uncommitted.txt'), 'x');
      const dirty = go(root);
      assert(dirty.code === 0 && /NOT MEASURED[^\n]*check-cannot/.test(dirty.out), `dirty tree, exit 2: expected NOT MEASURED and exit 0, got exit ${dirty.code}\n${dirty.out}`);
    });

    arm('a check that exceeds --timeout-ms is red and what it started is killed with it', () => {
      const body = `import { spawn } from 'node:child_process';\nspawn(process.execPath, ['-e', "setTimeout(() => require('node:fs').writeFileSync('late', 'x'), 2500)"], { stdio: 'ignore' });\nsetInterval(() => {}, 1000);\n`;
      const root = mk(wf('node scripts/check-hang.mjs'), { 'scripts/check-hang.mjs': body });
      const r = go(root, ['--timeout-ms', '600']);
      assert(r.code === 1 && /timed out/.test(r.out), `exit ${r.code}\n${r.out}`);
      const until = Date.now() + 3500;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, until - Date.now()); // the grandchild would write `late` at 2.5s if it had survived
      assert(!existsSync(join(root, 'late')), 'the grandchild outlived the timeout: killing the shell is not killing the check');
    });

    arm('the classifier: publish, a $VARIABLE, glue and plain installs', () => {
      const classifyLine = (line) => buildPlan([{ file: 'f', job: 'j', cwd: '.', run: line }]);
      assert(classifyLine('npm publish --provenance').excluded.length === 1, 'npm publish must be excluded');
      assert(classifyLine('node scripts/check-x.mjs "$BASE"').excluded.length === 1, 'a $VARIABLE command must be excluded, not run');
      const none = classifyLine('echo "node scripts/check-x.mjs"; uds --version | grep 1');
      assert(!none.run.length && !none.unclassified.length, 'text inside echo or a pipe was read as a command');
      assert(classifyLine('npm ci').installDirs.has('.') && !classifyLine('npm ci').run.length, 'npm ci is an install, not a check');
      assert(classifyLine('cd cli && npm run check:x').run[0].cwd === 'cli', 'cd was not followed');
      assert(classifyLine('node -e "\nnpm run check:fake\n"').run.length === 0, 'the inside of node -e "..." was read as commands');
    });
  } finally {
    for (const r of cleanups) rmSync(r, { recursive: true, force: true });
  }

  for (const [name, ok, why] of results) process.stdout.write(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `\n       ${why.replace(/\n/g, '\n       ')}`}\n`);
  const bad = results.filter((r) => !r[1]).length;
  process.stdout.write(bad ? `run-ci-checks-locally self-test: ${bad} of ${results.length} arms FAILED\n` : `run-ci-checks-locally self-test: ${results.length} arms passed\n`);
  return bad ? 1 : 0;
}

if (process.argv[1] && realpathSync(process.argv[1]) === SELF) {
  const argv = process.argv.slice(2);
  const code = argv.includes('--self-test') ? selfTest() : await main(argv);
  process.exit(code);
}
