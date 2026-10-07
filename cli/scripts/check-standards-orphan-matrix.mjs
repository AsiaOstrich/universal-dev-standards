#!/usr/bin/env node
/**
 * check-standards-orphan-matrix — dev-platform XSPEC-458 R4 (first half)
 *
 * For every standard in the registry, five yes/no columns: does `uds init` install it, does the generated
 * index name it, does a skill wrap it, does anything check it, does anything call it (a workflow, a git hook,
 * a skill). A standard with all five empty is shipped and invisible. Second rule: a `check-*` script that
 * nothing calls checks nothing. Both rules fail unless the finding is on the allowlist with a reason, an owner
 * and an expiry date. See scripts/lib/orphan-matrix.mjs for the exact definition of each column.
 *
 * Columns (a) and (b) are MEASURED, not read from a table: this runs a real `uds init --yes` in a throwaway
 * project (with a throwaway HOME) and looks at what it wrote.
 *
 * Usage:
 *   node cli/scripts/check-standards-orphan-matrix.mjs                 # check
 *   node cli/scripts/check-standards-orphan-matrix.mjs --json          # machine-readable
 *   node cli/scripts/check-standards-orphan-matrix.mjs --registry <f> --allowlist <f> --today <date> --root <dir>
 *     (the options exist so a test can inject a finding without touching the real tree)
 *
 * Exit codes (three states, "no orphans" and "could not measure" must differ):
 *   0  measured, nothing outside the allowlist, no stale or expired allowlist entry
 *   1  measured, a finding outside the allowlist, or a stale / expired / unexplained allowlist entry
 *   2  could not measure (init failed, registry unreadable) — NOT a pass
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isolatedEnv } from '../../scripts/lib/isolated-home.mjs';
import { buildMatrix, judge } from './lib/orphan-matrix.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = resolve(HERE, '..');
const DEFAULT_ROOT = resolve(CLI_ROOT, '..');

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1];
};
const JSON_OUT = argv.includes('--json');
// Where the evidence (workflows, hooks, skills, scripts) is looked for. `uds init` always runs from this CLI.
const REPO_ROOT = flag('--root') ? resolve(flag('--root')) : DEFAULT_ROOT;
const registryPath = flag('--registry') || join(CLI_ROOT, 'standards-registry.json');
const allowlistPath = flag('--allowlist') || join(HERE, 'orphan-matrix-allowlist.json');
const today = flag('--today') ? new Date(flag('--today')) : new Date();

function cannotMeasure(why) {
  console.error(`[orphan-matrix] CANNOT MEASURE: ${why}`);
  process.exit(2);
}

let registry;
let allowlist;
try {
  registry = JSON.parse(readFileSync(registryPath, 'utf-8')).standards;
  if (!Array.isArray(registry) || registry.length === 0) cannotMeasure(`${registryPath} has no standards`);
} catch (e) {
  cannotMeasure(`cannot read the registry ${registryPath}: ${e.message}`);
}
try {
  allowlist = JSON.parse(readFileSync(allowlistPath, 'utf-8'));
} catch (e) {
  cannotMeasure(`cannot read the allowlist ${allowlistPath}: ${e.message}`);
}

/** Columns (a) and (b): what a real `uds init --yes` writes. */
function measureInit() {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'uds-orphan-matrix-')));
  const project = join(base, 'project');
  const home = join(base, 'home');
  mkdirSync(join(project, '.claude'), { recursive: true }); // makes Claude Code the detected tool: CLAUDE.md is written
  mkdirSync(home, { recursive: true });
  try {
    const run = spawnSync('node', [join(CLI_ROOT, 'bin', 'uds.js'), 'init', '--yes', '--skills-location', 'none'], {
      cwd: project,
      env: { ...isolatedEnv(home, process.env), UDS_NO_UPDATE_CHECK: '1', FORCE_COLOR: '0' },
      encoding: 'utf-8',
      timeout: 120000
    });
    if (run.status !== 0) cannotMeasure(`uds init --yes exited ${run.status}: ${(run.stdout + run.stderr).slice(-400)}`);

    const standardsDir = join(project, '.standards');
    if (!existsSync(join(standardsDir, 'manifest.json'))) cannotMeasure('uds init wrote no .standards/manifest.json');
    const installedFiles = new Set();
    const walk = (dir) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory()) walk(join(dir, e.name));
        else installedFiles.add(e.name);
      }
    };
    walk(standardsDir);

    let indexText = '';
    for (const f of ['CLAUDE.md', 'AGENTS.md']) {
      if (existsSync(join(project, f))) indexText += `\n${readFileSync(join(project, f), 'utf-8')}`;
    }
    // Probe sanity: an init that wrote nothing readable would make every standard look un-installed and
    // un-indexed, and the report would be a long list of "findings" that are really a broken probe.
    if (installedFiles.size < 20) cannotMeasure(`uds init installed only ${installedFiles.size} files; the probe is not working`);
    if (!indexText.includes('.standards/')) cannotMeasure('the generated CLAUDE.md / AGENTS.md never mention .standards/; the probe is not working');
    return { installedFiles, indexText };
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
}

const { installedFiles, indexText } = measureInit();
const matrix = buildMatrix({ root: REPO_ROOT, registry, installedFiles, indexText });
const verdict = judge(matrix, allowlist, today);

if (JSON_OUT) {
  console.log(JSON.stringify({ rows: matrix.rows, checkCommands: matrix.checkCommands, verdict }, null, 2));
} else {
  const count = (pred) => matrix.rows.filter(pred).length;
  console.log('Standards orphan matrix');
  console.log(`  standards examined: ${matrix.rows.length}   (init installs ${installedFiles.size} files; index text ${indexText.length} chars)`);
  console.log(`  installed by init: ${count((r) => r.installedByInit)}   in index: ${count((r) => r.inIndex)}   skill: ${count((r) => r.hasSkill)}   check: ${count((r) => r.hasCheck)}   called: ${count((r) => r.calledByHookCiSkill)}`);
  console.log(`  ORPHANS (all five empty): ${verdict.orphans.length}   of which on the allowlist: ${verdict.orphans.length - verdict.newOrphans.length}`);
  console.log(`  check commands examined: ${matrix.checkCommands.length}   with no caller: ${verdict.callerless.length}   of which on the allowlist: ${verdict.callerless.length - verdict.newCallerless.length}`);
  console.log(`  allowlist expires: ${allowlist.expires}`);
  for (const id of verdict.newOrphans) console.log(`  ✗ orphan standard, not allowlisted: ${id}  (nothing installs, indexes, wraps, checks or calls it)`);
  for (const n of verdict.newCallerless) console.log(`  ✗ check command nobody calls, not allowlisted: ${n}`);
  for (const id of verdict.staleStandards) console.log(`  ✗ allowlist entry is no longer an orphan (remove it): ${id}`);
  for (const n of verdict.staleChecks) console.log(`  ✗ allowlist entry is no longer a caller-less check (remove it): ${n}`);
  for (const p of verdict.problems) console.log(`  ✗ ${p}`);
  if (verdict.ok) console.log('  ✓ no orphan outside the allowlist, no stale entry');
}
process.exit(verdict.ok ? 0 : 1);
