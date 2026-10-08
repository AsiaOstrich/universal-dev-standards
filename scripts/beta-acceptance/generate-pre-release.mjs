#!/usr/bin/env node
/**
 * generate-pre-release — write or check the generated blocks of docs/PRE-RELEASE.md (dev-platform XSPEC-469 R5).
 *
 * Usage:
 *   node scripts/beta-acceptance/generate-pre-release.mjs            rewrite the two blocks in docs/PRE-RELEASE.md
 *   node scripts/beta-acceptance/generate-pre-release.mjs --check    exit 1 if the file differs from what would be written
 * Options (for tests): --doc <file> --steps <file> --changelog <file> --reports <dir> --version <v>
 *
 * The "What to test" block comes from steps.json. The "Verified on" block comes from the JSON reports under
 * scripts/beta-acceptance/reports/<version>/ and from nothing else.
 *
 * Exit codes: 0 up to date (or written); 1 --check found a difference; 2 could not run (a file unreadable, a
 * report that is not JSON, the markers missing from the document).
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseChangelog } from './lib/changelog.mjs';
import { generateDocument } from './lib/pre-release-doc.mjs';
import { validateSteps } from './lib/steps.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1];
};
const check = argv.includes('--check');

const docPath = resolve(flag('--doc') || join(ROOT, 'docs', 'PRE-RELEASE.md'));
const stepsPath = resolve(flag('--steps') || join(HERE, 'steps.json'));
const changelogPath = resolve(flag('--changelog') || join(ROOT, 'CHANGELOG.md'));
const reportsRoot = resolve(flag('--reports') || join(HERE, 'reports'));

function cannotRun(why) {
  console.error(`[pre-release-doc] CANNOT RUN: ${why}`);
  process.exit(2);
}

let version = flag('--version');
if (!version) {
  try { version = JSON.parse(readFileSync(join(ROOT, 'cli', 'package.json'), 'utf-8')).version; } catch (e) { cannotRun(`cannot read the version from cli/package.json: ${e.message}`); }
}
let text;
let doc;
let blocks;
try { text = readFileSync(docPath, 'utf-8'); } catch (e) { cannotRun(`cannot read ${docPath}: ${e.message}`); }
try { doc = JSON.parse(readFileSync(stepsPath, 'utf-8')); } catch (e) { cannotRun(`cannot read ${stepsPath} as JSON: ${e.message}`); }
const problems = validateSteps(doc);
if (problems.length) cannotRun(`${stepsPath} is malformed: ${problems.join('; ')}`);
try { blocks = parseChangelog(readFileSync(changelogPath, 'utf-8')); } catch (e) { cannotRun(`cannot read ${changelogPath}: ${e.message}`); }

const reports = [];
const reportDir = join(reportsRoot, version);
if (existsSync(reportDir)) {
  for (const name of readdirSync(reportDir).filter((n) => n.endsWith('.json')).sort()) {
    try {
      reports.push({ file: name, report: JSON.parse(readFileSync(join(reportDir, name), 'utf-8')) });
    } catch (e) {
      cannotRun(`${join(reportDir, name)} is not valid JSON: ${e.message}`);
    }
  }
}

const { text: next, missing } = generateDocument({ text, doc, blocks, reports, version });
if (missing.length) cannotRun(`${docPath} has no <!-- ${missing.join(':START --> / <!-- ')}:START ... :END --> markers for: ${missing.join(', ')}. Add the markers where the block belongs; this program does not guess where.`);

if (check) {
  if (next !== text) {
    console.error(`[pre-release-doc] FAIL: ${docPath} is not what steps.json and the reports produce. Run: node scripts/beta-acceptance/generate-pre-release.mjs`);
    process.exit(1);
  }
  console.log(`[pre-release-doc] OK: ${docPath} matches steps.json (${doc.steps.length} steps) and ${reports.length} report(s) for ${version}.`);
} else {
  if (next !== text) writeFileSync(docPath, next, 'utf-8');
  console.log(`[pre-release-doc] ${next !== text ? 'wrote' : 'unchanged'}: ${docPath} (${doc.steps.length} steps, ${reports.length} report(s) for ${version}).`);
}
