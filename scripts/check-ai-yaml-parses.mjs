#!/usr/bin/env node
/**
 * Every shipped .ai.yaml must parse, and must parse into what it says.
 * // implements XSPEC-367 R1
 *
 * **Why this exists.** On 2026-08-07, `universal-dev-standards@6.3.4` shipped
 * 141 `.ai.yaml` files of which four were syntactically invalid YAML. An agent
 * reading them gets an exception, not empty content — and a downstream that
 * catches it gets a silence indistinguishable from "this standard has no
 * rules". They reached a release because **eight scripts read that directory
 * and not one parsed the whole set**.
 *
 * **Why it was rewritten the same day.** The first version fixed those four and
 * then reported `OK — 423 files across 3 locations`, while npm was still
 * shipping ten unparseable files. It named three directories explicitly and did
 * not recurse, so `ai/options/`, `locales/`, and `skills/` — all of which
 * prepack bundles into the tarball — were outside its denominator. A gate that
 * enumerates its own scope is a gate that goes stale the next time a directory
 * is added, so this version enumerates nothing: it walks the repo and checks
 * every `.ai.yaml` that is not in an excluded build/vendor path.
 *
 * **Two failure modes, not one.** Ten files threw. Eight more parsed *and were
 * wrong*: `{UT:70%,IT:20%}` is not a mapping — without the space after the
 * colon YAML reads one plain scalar key `UT:70%` whose value is null. Same for
 * an unquoted `- git commit -m "feat: add model"`, which becomes
 * `{'git commit -m "feat': 'add model"'}`. These pass any parses-or-not check
 * while handing an agent nonsense, so the check also rejects keys carrying
 * quote characters or an unspaced colon — the fingerprint of a scalar that was
 * silently read as a mapping.
 *
 * **A failure of this script is not a clean result.** Unreadable directory,
 * missing YAML library, or a walk that finds no files at all exits 2 and says
 * so. A check whose "nothing wrong" and "could not look" produce the same
 * output converts an unknown into a reassurance — the shape XSPEC-366 was
 * written to catch, and the shape that let this defect ship twice.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { dirname } from 'node:path';
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

// Excluded because they are vendored or generated *inputs*, not because they
// are uninteresting. `cli/bundled/` is generated but IS checked: it is the
// literal tarball content, and checking it catches a prepack that copies a
// stale tree.
const EXCLUDE = new Set(['node_modules', '.git', 'dist', 'coverage', '.next', 'build']);

const files = [];
(function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch (err) {
    console.error(`[check-ai-yaml] cannot read ${relative(ROOT, dir) || '.'} — the check did not run: ${err.message}`);
    process.exit(2);
  }
  for (const entry of entries) {
    if (EXCLUDE.has(entry)) continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue; // broken symlink; not a YAML problem
    }
    if (st.isDirectory()) walk(full);
    else if (entry.endsWith('.ai.yaml')) files.push(full);
  }
})(ROOT);

if (files.length === 0) {
  console.error('[check-ai-yaml] walked the repo and found no .ai.yaml at all — the check did not run.');
  console.error('Zero files is not "all files valid"; something is wrong with the walk or the tree.');
  process.exit(2);
}

/**
 * A key holding a quote character, or a colon with no space after it, is the
 * fingerprint of a plain scalar that YAML read as a mapping. Real keys in this
 * repo never look like that.
 */
const MISREAD_KEY = /["']|:\S/;

function collectMisreadKeys(node, path, out) {
  if (!node || typeof node !== 'object') return;
  if (!Array.isArray(node)) {
    for (const key of Object.keys(node)) {
      if (MISREAD_KEY.test(key)) out.push(`${path}.${key}`);
    }
  }
  for (const [key, value] of Object.entries(node)) collectMisreadKeys(value, `${path}.${key}`, out);
}

const unparseable = [];
const misread = [];

for (const full of files) {
  const rel = relative(ROOT, full).split(sep).join('/');
  let doc;
  try {
    doc = yaml.load(readFileSync(full, 'utf8'));
  } catch (err) {
    const where = err.mark ? `${err.mark.line + 1}:${err.mark.column + 1}` : 'unknown position';
    unparseable.push({ rel, where, reason: err.message.split('\n')[0] });
    continue;
  }
  const hits = [];
  collectMisreadKeys(doc, '', hits);
  if (hits.length > 0) misread.push({ rel, hits });
}

if (unparseable.length > 0) {
  console.error(`[check-ai-yaml] ${unparseable.length} of ${files.length} files do not parse:\n`);
  for (const { rel, where, reason } of unparseable) {
    console.error(`  ${rel}`);
    console.error(`    ${where} — ${reason}`);
  }
  console.error('\nAn agent reading these gets an exception, not empty content.');
  console.error('Usually an unquoted scalar carrying ":", a flow sequence followed by');
  console.error('prose, a quote that closes mid-value, or inconsistent indentation.');
}

if (misread.length > 0) {
  const total = misread.reduce((sum, m) => sum + m.hits.length, 0);
  console.error(`\n[check-ai-yaml] ${misread.length} files parse but were misread — ${total} keys:\n`);
  for (const { rel, hits } of misread) {
    console.error(`  ${rel}  (${hits.length})`);
    for (const hit of hits.slice(0, 4)) console.error(`    ${hit.slice(0, 110)}`);
    if (hits.length > 4) console.error(`    …and ${hits.length - 4} more`);
  }
  console.error('\nThese are worse than a parse error: they pass every parses-or-not');
  console.error('check while the agent reads a key like `UT:70%` whose value is null.');
  console.error('`{a:1,b:2}` needs a space after each colon; a shell command containing');
  console.error('": " inside a block sequence needs quoting.');
}

if (unparseable.length > 0 || misread.length > 0) process.exit(1);

console.log(`[check-ai-yaml] OK — ${files.length} .ai.yaml files parse and none were misread.`);
