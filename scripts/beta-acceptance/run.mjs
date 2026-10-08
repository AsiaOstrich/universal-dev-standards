#!/usr/bin/env node
/**
 * Beta acceptance run (dev-platform XSPEC-469 R2, R3).
 *
 * Installs a published UDS version into a throwaway folder, runs every step of steps.json that applies to this
 * machine, and writes a report (Markdown to read, JSON to compare). The same command works in PowerShell, cmd,
 * Git Bash, zsh and bash; it needs only Node 20+ and a network for the install.
 *
 *   node scripts/beta-acceptance/run.mjs --version 6.14.0-beta.7
 *
 * Options
 *   --version <v|tag>   version or dist-tag to install from npm (default: beta)
 *   --out <dir>         where the report goes (default: ./uds-beta-acceptance-reports)
 *   --label <text>      a name for this machine in the report (e.g. NB27)
 *   --shell <name>      the shell you typed this in, if the guess is wrong
 *   --answers <file>    JSON {"step-id": "yes"|"no"} for the steps that need a person's eyes
 *   --non-interactive   never ask; unanswered manual items are recorded as unconfirmed
 *   --only <id,id>      run only these steps (debugging; a partial run is not an acceptance run)
 *   --timeout <sec>     per-step limit (default 120)
 *   --keep              keep the throwaway folder (it is printed)
 *   --steps <file>      another list (default: steps.json next to this file)
 * For tests and for people writing steps (the report says which was used, and the PRE-RELEASE generator ignores
 * a report from anything but the registry or a local package):
 *   --source <file|dir> install this tarball / folder instead of asking npm (never touches the network)
 *   --installer <file>  a module exporting install({dir, version}) -> {pkgDir}
 *   --local-bin <file>  run this uds.js as it is, with no install at all (NOT a published package)
 *
 * Exit codes
 *   0  at least one step passed and none failed (manual items still unconfirmed are listed in the report)
 *   1  at least one step failed
 *   2  could not run (bad arguments, install failed, wrong version installed, unreadable steps file)
 *   3  zero steps passed — nothing was shown to work, which is not a pass
 */

import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { collectEnvironment } from './lib/env-info.mjs';
import { runSteps } from './lib/execute.mjs';
import { installPackage, readNpmVersion } from './lib/install.mjs';
import { buildReport, EXIT, toMarkdown, VERDICT_TEXT } from './lib/report.mjs';
import { platformName, validateSteps } from './lib/steps.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

const VALUE_FLAGS = ['--version', '--out', '--label', '--shell', '--answers', '--only', '--timeout', '--steps', '--source', '--installer', '--local-bin'];
const BOOLEAN_FLAGS = ['--keep', '--non-interactive', '--help', '-h'];

export function parseArgs(argv) {
  const opts = { version: 'beta', versionGiven: false, out: resolve('uds-beta-acceptance-reports'), label: null, shell: null, answers: null, only: null, timeout: 120, steps: join(HERE, 'steps.json'), source: null, installer: null, localBin: null, keep: false, nonInteractive: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const eq = a.indexOf('=');
    const name = a.startsWith('--') && eq !== -1 ? a.slice(0, eq) : a;
    if (BOOLEAN_FLAGS.includes(name)) {
      if (name === '--keep') opts.keep = true;
      else if (name === '--non-interactive') opts.nonInteractive = true;
      else opts.help = true;
      continue;
    }
    if (!VALUE_FLAGS.includes(name)) throw new Error(`unknown option: ${a}`);
    const value = eq !== -1 ? a.slice(eq + 1) : argv[(i += 1)];
    if (value === undefined || value === '') throw new Error(`${name} needs a value`);
    switch (name) {
      case '--version': opts.version = value; opts.versionGiven = true; break;
      case '--out': opts.out = resolve(value); break;
      case '--label': opts.label = value; break;
      case '--shell': opts.shell = value; break;
      case '--answers': opts.answers = resolve(value); break;
      case '--only': opts.only = value.split(',').map((s) => s.trim()).filter(Boolean); break;
      case '--timeout': {
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) throw new Error(`--timeout must be a positive number of seconds, got "${value}"`);
        opts.timeout = n;
        break;
      }
      case '--steps': opts.steps = resolve(value); break;
      case '--source': opts.source = resolve(value); break;
      case '--installer': opts.installer = resolve(value); break;
      case '--local-bin': opts.localBin = resolve(value); break;
      default: break;
    }
  }
  const injected = [opts.source, opts.installer, opts.localBin].filter(Boolean).length;
  if (injected > 1) throw new Error('--source, --installer and --local-bin are alternatives; give one');
  return opts;
}

const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\..*$/, '').replace('T', '-');
const safe = (s) => String(s).replace(/[^A-Za-z0-9._-]+/g, '_');

function writeReports(report, outDir) {
  mkdirSync(outDir, { recursive: true });
  const base = `uds-beta-acceptance-${safe(report.uds.version || report.request.version)}-${report.environment ? report.environment.platform : 'unknown'}-${stamp(new Date(report.finishedAt))}`;
  const md = join(outDir, `${base}.md`);
  const json = join(outDir, `${base}.json`);
  writeFileSync(md, toMarkdown(report), 'utf-8');
  writeFileSync(json, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');
  return { md, json };
}

function readAnswers(file) {
  const parsed = JSON.parse(readFileSync(file, 'utf-8'));
  const answers = parsed && typeof parsed === 'object' && parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : parsed;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) throw new Error('the answers file must be a JSON object of step id -> "yes" | "no"');
  return answers;
}

export async function main(argv) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    console.error(`[beta-acceptance] ${e.message}\nSee --help in the header of scripts/beta-acceptance/run.mjs.`);
    return EXIT.ERROR;
  }
  if (opts.help) {
    console.log(readFileSync(fileURLToPath(import.meta.url), 'utf-8').split('*/')[0].replace(/^#!.*\n/, '').replace(/^\/\*\*?\n?/, ''));
    return EXIT.PASS;
  }

  let doc;
  let stepsSha256 = null;
  try {
    const raw = readFileSync(opts.steps);
    stepsSha256 = createHash('sha256').update(raw).digest('hex');
    doc = JSON.parse(raw.toString('utf-8'));
  } catch (e) {
    console.error(`[beta-acceptance] cannot read the steps file ${opts.steps}: ${e.message}`);
    return EXIT.ERROR;
  }
  const problems = validateSteps(doc);
  if (problems.length) {
    console.error(`[beta-acceptance] the steps file ${opts.steps} is malformed:\n  ${problems.join('\n  ')}`);
    return EXIT.ERROR;
  }
  let answers = {};
  if (opts.answers) {
    try { answers = readAnswers(opts.answers); } catch (e) {
      console.error(`[beta-acceptance] cannot read ${opts.answers}: ${e.message}`);
      return EXIT.ERROR;
    }
  }

  const startedAt = new Date().toISOString();
  const platform = platformName();
  const sandbox = realpathSync(mkdtempSync(join(tmpdir(), 'uds-beta-acceptance-')));
  const log = (line) => console.log(line);
  const cleanup = () => { if (!opts.keep) rmSync(sandbox, { recursive: true, force: true }); };
  log(`[beta-acceptance] ${platform}, Node ${process.version}; working in ${sandbox}`);
  log(`[beta-acceptance] installing ${opts.localBin ? `(no install: ${opts.localBin})` : opts.installer ? `(injected installer ${opts.installer})` : opts.source ? opts.source : `universal-dev-standards@${opts.version}`} ...`);

  const install = await installPackage({ dir: join(sandbox, 'install'), version: opts.version, source: opts.source, installer: opts.installer, local: opts.localBin });
  const environment = await collectEnvironment({ shell: opts.shell, npmVersion: await readNpmVersion() });
  const request = { version: opts.version, versionGiven: opts.versionGiven, source: opts.source ? '--source' : opts.installer ? '--installer' : opts.localBin ? '--local-bin' : 'npm registry', stepsFile: opts.steps === join(HERE, 'steps.json') ? 'scripts/beta-acceptance/steps.json' : 'another list (--steps)', stepsSha256 };
  const label = opts.label || '(no --label given)';
  const installInfo = { ok: install.ok, durationMs: install.durationMs, error: install.error, output: install.output.slice(-2000) };
  let uds = { version: install.version || 'unknown', installKind: install.kind };
  const notes = [];
  let error = install.ok ? null : `install failed: ${install.error}`;
  if (install.ok && opts.versionGiven && /^\d+\.\d+\.\d+/.test(opts.version) && install.version !== opts.version) {
    error = `asked for ${opts.version} but ${install.version} is installed`;
  }

  let results = [];
  if (!error) {
    const interactive = Boolean(process.stdin.isTTY) && !opts.nonInteractive;
    let rl = null;
    const ask = interactive
      ? async (step, run) => {
        rl = rl || createInterface({ input: process.stdin, output: process.stdout });
        console.log(`\n--- manual check | 請用眼睛確認: ${step.id} — ${step.title}`);
        if (run && (run.stdout || run.stderr)) console.log(`${run.stdout || ''}${run.stderr || ''}`.trimEnd());
        console.log(`${step.human.prompt}\n${step.human.promptZh}`);
        return rl.question('Looks right? 正常嗎？ [y = yes / n = no / Enter = not sure 不確定] ');
      }
      : null;
    results = await runSteps({ steps: doc.steps, sandbox, binPath: install.binPath, pkgDir: install.pkgDir, shimPath: install.shimPath || null, platform, answers, ask, timeoutMs: opts.timeout * 1000, log, only: opts.only });
    if (rl) rl.close();
    if (opts.only) notes.push(`PARTIAL RUN: only ${opts.only.join(', ')} were selected with --only. This is not an acceptance run. 只跑了部分步驟（--only），不是完整驗收。`);
    if (install.kind !== 'npm-registry') notes.push(`The package under test was NOT installed from the npm registry (${install.kind}). 受測的套件不是從 npm 安裝的（${install.kind}）。`);
  }

  const finishedAt = new Date().toISOString();
  const report = buildReport({ startedAt, finishedAt, label, request, uds, install: installInfo, environment, results, notes, error });
  let files;
  try {
    files = writeReports(report, opts.out);
  } catch (e) {
    console.error(`[beta-acceptance] cannot write the report to ${opts.out}: ${e.message}`);
    cleanup();
    return EXIT.ERROR;
  }
  cleanup();

  const v = VERDICT_TEXT[report.verdict] || { en: report.verdict, zh: report.verdict };
  const c = report.counts;
  log('');
  log(`[beta-acceptance] ${v.en} | ${v.zh}`);
  log(`[beta-acceptance] passed ${c.passed}, failed ${c.failed}, skipped ${c.skipped}, manual confirmed ${c.humanConfirmed}, manual NOT confirmed ${c.humanUnconfirmed}`);
  for (const s of report.steps.filter((x) => x.status === 'fail')) log(`  FAIL ${s.id}: ${s.failures.join('; ')}`);
  if (error) log(`[beta-acceptance] ${error}`);
  log(`[beta-acceptance] report (send this file back | 請把這個檔案貼回來): ${files.md}`);
  log(`[beta-acceptance] same report as JSON: ${files.json}`);
  if (opts.keep) log(`[beta-acceptance] kept: ${sandbox}`);
  return report.exitCode;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (e) => {
    console.error(`[beta-acceptance] unexpected failure: ${e.stack || e.message}`);
    process.exitCode = EXIT.ERROR;
  });
}
