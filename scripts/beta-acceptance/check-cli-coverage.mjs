#!/usr/bin/env node
/**
 * check-cli-coverage — every command, subcommand and option of the uds CLI has an acceptance step, a reasoned
 * exemption, or a place in the shrinking baseline (dev-platform XSPEC-471 R2).
 *
 * Usage:
 *   node scripts/beta-acceptance/check-cli-coverage.mjs
 *   node scripts/beta-acceptance/check-cli-coverage.mjs --tree <file> --steps <file> --baseline <file>
 *   node scripts/beta-acceptance/check-cli-coverage.mjs --cli <cli directory>
 *   node scripts/beta-acceptance/check-cli-coverage.mjs --shrink-baseline
 *   node scripts/beta-acceptance/check-cli-coverage.mjs --init-baseline
 *   node scripts/beta-acceptance/check-cli-coverage.mjs --baseline-not-larger-than <git ref>
 *     --tree      a command tree as JSON (what dump-cli-tree.mjs prints) instead of reading the real CLI (for tests)
 *     --cli       the cli directory whose bin/uds.js is read (default: ../../cli; needs `npm ci` there)
 *     --shrink-baseline   rewrite the baseline file without the entries that are covered, exempt or gone. It never adds one.
 *     --init-baseline     write the baseline file from today's gaps; refuses when the file already exists (the baseline is not regenerated, only shrunk)
 *     --baseline-not-larger-than <ref>   also fail when the baseline holds an entry the file at <ref> did not (CI passes the base branch)
 *
 * Where the list comes from: `dump-cli-tree.mjs`, which loads the real `cli/bin/uds.js` and records the commander program it
 * builds (hidden commands, hidden options and aliases included). Nothing is read from help text or source text.
 *
 * What it checks, against `steps.json`:
 *   - a step USES a command or an option when the arguments it gives the installed uds name it (rules: lib/cli-surface.mjs)
 *   - an item no step uses is a GAP. A gap is allowed in exactly two ways:
 *       an `exemptions` item {"command": "spec create"} or {"option": "init --mode"} with a reason of at least 20 characters
 *         (a blank or one-word reason does not count: the item stays a gap), or
 *       an entry in `coverage-baseline.json` (the gaps that existed when this check was added; R4 empties it).
 *   - the baseline only shrinks: a gap that is in neither place is NEW and fails, and a baseline entry that is now covered,
 *     exempt or gone fails too ("remove it"), so the file cannot rot. R5 will refuse a stable release while it is not empty.
 *
 * Exit codes (three states):
 *   0  no new gap, no stale baseline entry, no bad exemption
 *   1  at least one of those (each is printed by name)
 *   2  could not measure (the CLI tree cannot be read, a file is not JSON): NOT a pass
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { currentGaps, judgeSurface } from './lib/cli-surface.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..', '..');
const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1];
};
const has = (name) => argv.includes(name);

const stepsPath = resolve(flag('--steps') || join(HERE, 'steps.json'));
const baselinePath = resolve(flag('--baseline') || join(HERE, 'coverage-baseline.json'));

function cannotMeasure(why) {
  console.error(`[beta-acceptance] CANNOT MEASURE: ${why}`);
  process.exit(2);
}

function readJson(path, what) {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    return cannotMeasure(`cannot read ${what} ${path} as JSON: ${e.message}`);
  }
}

function readTree() {
  if (flag('--tree')) return readJson(resolve(flag('--tree')), 'the command tree');
  const cli = resolve(flag('--cli') || join(REPO, 'cli'));
  // the binary writes user-level files when it is started by a person; loading it to read its commands should not touch the real home
  const home = mkdtempSync(join(tmpdir(), 'uds-cli-tree-'));
  const r = spawnSync(process.execPath, [join(HERE, 'dump-cli-tree.mjs'), cli], {
    encoding: 'utf-8',
    timeout: 120000,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, HOME: home, USERPROFILE: home, XDG_CONFIG_HOME: home, APPDATA: home },
  });
  rmSync(home, { recursive: true, force: true });
  if (r.status !== 0) return cannotMeasure(`dump-cli-tree.mjs exited ${r.status}${r.error ? ` (${r.error.message})` : ''}: ${(r.stderr || '').trim()}`);
  try {
    return JSON.parse(r.stdout);
  } catch (e) {
    return cannotMeasure(`dump-cli-tree.mjs printed something that is not JSON: ${e.message}`);
  }
}

const tree = readTree();
const doc = readJson(stepsPath, 'the steps file');
let baseline = null;
try {
  baseline = JSON.parse(readFileSync(baselinePath, 'utf-8'));
} catch (e) {
  if (e.code !== 'ENOENT') cannotMeasure(`cannot read the baseline ${baselinePath} as JSON: ${e.message}`);
}

if (!tree || !Array.isArray(tree.commands) || tree.commands.length === 0) cannotMeasure('the command tree has no commands: a CLI that lists nothing is a reader that read nothing');
const verdict = judgeSurface({ tree, doc, baseline });

if (has('--init-baseline')) {
  if (baseline) cannotMeasure(`${baselinePath} already exists: the baseline is only ever shrunk (--shrink-baseline), never regenerated`);
  const gaps = currentGaps({ tree, doc });
  const fresh = {
    schema: 1,
    note: 'XSPEC-471 R2 ratchet. The commands and options that had no acceptance step when check-cli-coverage.mjs was added. It only shrinks: a gap not listed here fails the check, and an entry that a step now uses (or an exemption now covers) must be removed (node scripts/beta-acceptance/check-cli-coverage.mjs --shrink-baseline). R4 empties it; R5 refuses a stable release until it is empty.',
    ...gaps,
  };
  writeFileSync(baselinePath, `${JSON.stringify(fresh, null, 2)}\n`, 'utf-8');
  console.log(`[beta-acceptance] wrote ${baselinePath}: ${gaps.commands.length} command(s), ${gaps.options.length} option(s)`);
  process.exit(0);
}

if (has('--shrink-baseline')) {
  if (!baseline) cannotMeasure(`there is no baseline file at ${baselinePath} to shrink`);
  const stale = new Set(verdict.staleBaseline.map((s) => `${s.kind}:${s.id}`));
  const keep = (kind, list) => (Array.isArray(list) ? list : []).filter((id) => !stale.has(`${kind}:${id}`));
  const next = { ...baseline, commands: keep('command', baseline.commands), options: keep('option', baseline.options) };
  writeFileSync(baselinePath, `${JSON.stringify(next, null, 2)}\n`, 'utf-8');
  console.log(`[beta-acceptance] baseline ${baselinePath}: removed ${verdict.staleBaseline.length} entr${verdict.staleBaseline.length === 1 ? 'y' : 'ies'}; ${next.commands.length} command(s) and ${next.options.length} option(s) remain`);
  for (const s of verdict.staleBaseline) console.log(`  removed ${s.kind} "${s.id}" (${s.why})`);
  process.exit(0);
}

// the baseline may not hold an entry that the version at <ref> did not (a hand-added entry would make the ratchet a loophole)
const grown = [];
if (flag('--baseline-not-larger-than')) {
  const ref = flag('--baseline-not-larger-than');
  const rel = relative(REPO, baselinePath).split('\\').join('/');
  const git = (...args) => spawnSync('git', args, { cwd: REPO, encoding: 'utf-8' });
  // git's own messages are translated, so nothing here reads them: the ref is checked first, then whether the file is in it
  const known = git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`);
  if (known.status !== 0) cannotMeasure(`${ref} is not a commit this repository can resolve (fetch it first): the baseline cannot be compared`);
  const listed = git('ls-tree', '-r', '--name-only', ref, '--', rel);
  if (listed.status !== 0) cannotMeasure(`git ls-tree ${ref} failed (${listed.status}): ${(listed.stderr || '').trim()}`);
  if (listed.stdout.trim() === '') {
    console.log(`[beta-acceptance] baseline: ${ref} has no ${rel}; this change creates it, so there is nothing to compare with`);
  } else {
    const show = git('show', `${ref}:${rel}`);
    if (show.status !== 0) cannotMeasure(`git show ${ref}:${rel} failed (${show.status}): ${(show.stderr || '').trim()}`);
    let before;
    try { before = JSON.parse(show.stdout); } catch (e) { cannotMeasure(`${ref}:${rel} is not JSON: ${e.message}`); }
    for (const [kind, key] of [['command', 'commands'], ['option', 'options']]) {
      const old = new Set(before[key] || []);
      for (const id of (baseline && baseline[key]) || []) if (!old.has(id)) grown.push({ kind, id });
    }
  }
}

const t = verdict.totals;
const line = (label, x) => `${label}: ${x.covered} of ${x.total} used by a step; exempt ${x.exempted || 0}${x.gaps === undefined ? '' : `; gaps ${x.gaps}`}`;
console.log(`[beta-acceptance] steps file ${stepsPath}: ${(doc.steps || []).length} step(s), ${(doc.exemptions || []).length} exemption(s)`);
console.log(`[beta-acceptance] baseline ${baseline ? baselinePath : '(none)'}: ${baseline ? (baseline.commands || []).length : 0} command(s), ${baseline ? (baseline.options || []).length : 0} option(s)`);
console.log(`[beta-acceptance] CLI surface — ${line('commands', t.command)}`);
console.log(`[beta-acceptance]   ${line('top-level commands', t.topLevelCommands)}`);
console.log(`[beta-acceptance]   ${line('subcommands', t.subcommands)}`);
console.log(`[beta-acceptance] CLI surface — ${line('options', t.option)}`);
console.log(`[beta-acceptance] known gaps (in the baseline, not red): ${verdict.knownGaps.length}; NEW gaps: ${verdict.newGaps.length}; stale baseline entries: ${verdict.staleBaseline.length}`);

for (const g of verdict.newGaps) console.log(`  FAIL no acceptance step uses ${g.kind} "${g.id}"`);
for (const s of verdict.staleBaseline) console.log(`  FAIL baseline entry ${s.kind} "${s.id}" must be removed: ${s.why}`);
for (const p of verdict.exemptionProblems) console.log(`  FAIL ${p}`);
for (const g of grown) console.log(`  FAIL baseline entry ${g.kind} "${g.id}" is new: the baseline may only shrink`);

if (!verdict.ok || grown.length) {
  console.log('[beta-acceptance] FAIL: add a step to scripts/beta-acceptance/steps.json that runs the command or option and reads back its effect, or an "exemptions" item {"command"|"option": "<name>", "reason": "<why no step can test it>"}.');
  process.exit(1);
}
console.log(`[beta-acceptance] OK: no new gap. ${verdict.knownGaps.length} item(s) still wait in the baseline (R4 empties it; R5 refuses a stable release until it is empty).`);
