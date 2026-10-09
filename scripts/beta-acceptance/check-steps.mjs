#!/usr/bin/env node
/**
 * check-steps — every CHANGELOG `Unreleased` entry has an acceptance step, or says why not (dev-platform XSPEC-469 R1).
 *
 * Usage:
 *   node scripts/beta-acceptance/check-steps.mjs
 *   node scripts/beta-acceptance/check-steps.mjs --changelog <file> --steps <file>
 *     (the options exist so a test can hand it a CHANGELOG with an entry that has no step)
 *
 * Exit codes (three states; "covered" and "could not measure" must differ):
 *   0  every Unreleased entry has a step (or an exemption with a reason), and every step names an existing entry
 *   1  an entry has no step, an anchor matches nothing / several entries, or the steps file is malformed
 *   2  could not measure (a file unreadable, not JSON, no `## [Unreleased]` heading) — NOT a pass
 *
 * R3 (XSPEC-471): the same run judges every step's `expect`. A step that checks only an exit code (no `contains`, `matches`
 * or `files`) is named and the run fails (exit 1), unless an `exemptions` item {"step": "<id>", "reason": "<why>"} says why
 * it cannot. The rule is in lib/steps.mjs (`validateSteps`), which the runner and the PRE-RELEASE generator also use.
 *
 * The entry's key is the START of its text (see lib/changelog.mjs): a step names an entry by quoting how it begins.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseChangelog } from './lib/changelog.mjs';
import { judgeCoverage } from './lib/coverage.mjs';
import { checksEffect, exitOnlyExemptions } from './lib/steps.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1];
};

const changelogPath = resolve(flag('--changelog') || join(HERE, '..', '..', 'CHANGELOG.md'));
const stepsPath = resolve(flag('--steps') || join(HERE, 'steps.json'));

function cannotMeasure(why) {
  console.error(`[beta-acceptance] CANNOT MEASURE: ${why}`);
  process.exit(2);
}

let changelogText;
let doc;
try {
  changelogText = readFileSync(changelogPath, 'utf-8');
} catch (e) {
  cannotMeasure(`cannot read the CHANGELOG ${changelogPath}: ${e.message}`);
}
try {
  doc = JSON.parse(readFileSync(stepsPath, 'utf-8'));
} catch (e) {
  cannotMeasure(`cannot read the steps file ${stepsPath} as JSON: ${e.message}`);
}

const blocks = parseChangelog(changelogText);
const verdict = judgeCoverage({ blocks, doc });
if (verdict.noUnreleasedHeading) cannotMeasure(`${changelogPath} has no "## [Unreleased]" heading`);

const steps = Array.isArray(doc.steps) ? doc.steps : [];
console.log(`[beta-acceptance] CHANGELOG ${changelogPath}`);
console.log(`[beta-acceptance] steps file ${stepsPath}: ${steps.length} step(s), ${(doc.exemptions || []).length} exemption(s)`);
console.log(`[beta-acceptance] Unreleased entries: ${verdict.unreleasedCount}; covered: ${verdict.covered} (by a step: ${verdict.withStep}; by an exemption that gives a reason: ${verdict.exempted})`);

const exitOnlyAllowed = exitOnlyExemptions(doc);
const effectSteps = steps.filter(checksEffect).length;
const exemptSteps = steps.filter((s) => !checksEffect(s) && exitOnlyAllowed.has(s.id)).length;
console.log(`[beta-acceptance] R3 effect assertions: ${effectSteps} of ${steps.length} step(s) read back output or a file; exit-code-only by an exemption that gives a reason: ${exemptSteps}; exit-code-only without one: ${steps.length - effectSteps - exemptSteps}`);

for (const e of verdict.schemaErrors) console.log(`  FAIL steps file: ${e}`);
for (const u of verdict.uncovered) console.log(`  FAIL no acceptance step for the ${u.section} entry at CHANGELOG line ${u.line}: "${u.text}"`);
for (const d of verdict.danglingAnchors) console.log(`  FAIL ${d.where} names a CHANGELOG entry that does not exist: "${d.anchor}"`);
for (const a of verdict.ambiguousAnchors) console.log(`  FAIL ${a.where} matches ${a.matches} entries; quote more of the start of the entry: "${a.anchor}"`);
for (const s of verdict.shortAnchors) console.log(`  FAIL ${s.where} quotes too little to identify an entry (at least 20 characters): "${s.anchor}"`);

if (!verdict.ok) {
  console.log('[beta-acceptance] FAIL: add a step to scripts/beta-acceptance/steps.json that tests the entry, or an "exemptions" item that says why the entry has no user-visible behaviour.');
  process.exit(1);
}
console.log('[beta-acceptance] OK: every Unreleased entry is covered.');
