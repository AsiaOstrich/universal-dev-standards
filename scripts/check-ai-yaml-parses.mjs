#!/usr/bin/env node
/**
 * Every shipped .ai.yaml must parse. // implements XSPEC-367 R1
 *
 * **Why this exists.** On 2026-08-07, `universal-dev-standards@6.3.4` on npm
 * shipped 141 `.ai.yaml` files of which four were syntactically invalid YAML.
 * The same four sat in `.standards/`, which is what an adopter's directory
 * receives. An agent reading them gets an exception, not empty content — and a
 * downstream that catches it gets a silence indistinguishable from "this
 * standard has no rules". They had been that way long enough to reach a
 * release because **eight scripts read that directory and not one parsed the
 * whole set**: an artifact that has never been checked and one that has been
 * checked look identical from outside.
 *
 * All four failed the same way — an unquoted scalar carrying YAML-significant
 * characters. A colon inside parentheses, a flow sequence followed by prose, a
 * quote closing mid-value, a key indented differently from its siblings. None
 * of them is exotic; they are what hand-authored YAML does when nothing reads
 * it back.
 *
 * **A failure of this script is not a clean result.** If a directory cannot be
 * read, or the YAML library cannot be loaded, that exits non-zero and says so.
 * A check whose "nothing wrong" and "could not look" produce the same output
 * converts an unknown into a reassurance — the shape XSPEC-366 was written to
 * catch, and the shape that let this defect ship.
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// js-yaml lives in cli/node_modules; this script runs from the repo root.
// Exit 2, not 1: "the check could not run" must not be reported as "nothing
// was wrong".
let yaml;
try {
  yaml = createRequire(join(ROOT, 'cli', 'package.json'))('js-yaml');
} catch (err) {
  console.error(`[check-ai-yaml] cannot load js-yaml — the check did not run: ${err.message}`);
  process.exit(2);
}

/**
 * `ai/` is the source prepack copies into `cli/bundled/`, so it is what
 * reaches npm. `.standards/` is this repo's own adopted copy — not shipped,
 * but read by agents working here, and it has drifted from `ai/` before.
 * `cli/bundled/` is gitignored and regenerated, so it is checked only when a
 * prepack has already produced it.
 */
const DIRS = ['ai/standards', '.standards', 'cli/bundled/ai/standards'];

let checked = 0;
const invalid = [];
const missing = [];

for (const rel of DIRS) {
  const dir = join(ROOT, rel);
  if (!existsSync(dir)) {
    // cli/bundled/ is generated; absent is normal outside a pack. The other
    // two are tracked, and their absence is a real problem, not a pass.
    if (rel === 'cli/bundled/ai/standards') continue;
    missing.push(rel);
    continue;
  }

  let entries;
  try {
    entries = readdirSync(dir).filter((f) => f.endsWith('.ai.yaml'));
  } catch (err) {
    console.error(`[check-ai-yaml] cannot read ${rel} — the check did not run: ${err.message}`);
    process.exit(2);
  }

  if (entries.length === 0) {
    // Zero files is not "all files valid". Say so rather than exit green on an
    // empty denominator.
    missing.push(`${rel} (contains no .ai.yaml)`);
    continue;
  }

  for (const file of entries) {
    checked += 1;
    try {
      yaml.load(readFileSync(join(dir, file), 'utf8'));
    } catch (err) {
      const where = err.mark ? `${err.mark.line + 1}:${err.mark.column + 1}` : 'unknown position';
      invalid.push({ path: `${rel}/${file}`, reason: err.message.split('\n')[0], where });
    }
  }
}

if (missing.length > 0) {
  console.error('[check-ai-yaml] expected directories are missing or empty — the check could not speak for them:');
  for (const m of missing) console.error(`  ${m}`);
  process.exit(2);
}

if (invalid.length > 0) {
  console.error(`[check-ai-yaml] ${invalid.length} of ${checked} files do not parse:\n`);
  for (const { path, where, reason } of invalid) {
    console.error(`  ${path}`);
    console.error(`    ${where} — ${reason}`);
  }
  console.error('\nAn agent reading these gets an exception, not empty content.');
  console.error('Usually an unquoted scalar carrying ":", a flow sequence followed by');
  console.error('prose, a quote that closes mid-value, or inconsistent indentation.');
  process.exit(1);
}

console.log(`[check-ai-yaml] OK — ${checked} .ai.yaml files across ${DIRS.length} locations all parse.`);
