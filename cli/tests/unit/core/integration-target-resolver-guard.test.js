/**
 * XSPEC-418 R2 guard: "tool → target file" must go through
 * `resolveIntegrationTargetFile`, not `getToolFilePath`/`getToolFileName`
 * directly.
 *
 * Before this feature, 8+ call sites each independently derived a tool's
 * integration file from `SUPPORTED_AI_TOOLS`/legacy mapping, with no manifest
 * in the loop at all. Adding one more option flag without collapsing those
 * call sites onto a single resolver would only add a 9th (or 10th, or 11th)
 * place that could forget to check `manifest.integrationTargets` — and
 * forgetting is silent: the file that gets written is just the tool's default,
 * which is exactly what a reader who has never heard of this feature expects
 * to see.
 *
 * This test walks the actual CLI source (not a hand-written list of "the
 * files I remember touching") and fails if any of them still calls
 * `getToolFilePath(` / `getToolFileName(` as a function — i.e. if a call site
 * is ever written back to the old direct form, on purpose or by a bad merge,
 * this goes red. That is the "任一呼叫點改回寫死時變紅" mutation check XSPEC-418
 * AC-2 asks for; it is verified by hand (see the commit/handback notes) by
 * reverting one call site and re-running this file.
 *
 * `getToolFilePath`/`getToolFileName` themselves, and
 * `resolveIntegrationTargetFile`'s own internal use of `getToolFileName`, all
 * live in one file (`src/utils/integration-generator.js`) and are excluded —
 * excluding by FILE, not by call site, so a new call added anywhere else in
 * that same file is still caught.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(__dirname, '../../../src');

// The only files allowed to define/call getToolFilePath/getToolFileName as
// bare functions. integration-generator.js defines the widely-used pair and
// resolveIntegrationTargetFile wraps them; core/constants.js separately
// defines its OWN, lower-level getToolFileName (a different implementation,
// not itself a "resolve the write target" call site — nothing outside this
// file imports it).
const DEFINITION_FILES = new Set([
  join(SRC_DIR, 'utils/integration-generator.js'),
  join(SRC_DIR, 'core/constants.js')
]);

// Excludes the `function getToolFileName(` / `function getToolFilePath(`
// declaration itself via the negative lookbehind — a definition is not a call.
const CALL_PATTERN = /(?<!function )\bgetToolFile(?:Path|Name)\s*\(/g;

/** Strip // and /* *\/ comments so a call mentioned only in prose (like this
 * file's own header, or the "getToolFileName() ends in ..." comment in
 * constants.js) is not counted as a real call site. Heuristic, not a real JS
 * parser — adequate for a guard over this repo's own source style. */
function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function listJsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listJsFiles(full));
    } else if (entry.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

function findCallSites() {
  const hits = [];
  for (const file of listJsFiles(SRC_DIR)) {
    if (DEFINITION_FILES.has(file)) continue;
    const content = stripComments(readFileSync(file, 'utf-8'));
    const matches = content.match(CALL_PATTERN);
    if (matches) {
      hits.push({ file: relative(SRC_DIR, file), count: matches.length });
    }
  }
  return hits;
}

describe('XSPEC-418 R2 guard: tool → target file resolution is centralized', () => {
  it('sanity: the scan itself can detect a call (known-positive control)', () => {
    // Proves CALL_PATTERN actually matches a call expression before trusting
    // an empty result below to mean "no call sites" rather than "broken regex".
    const probe = "const file = getToolFilePath(tool);\nconst other = getToolFileName('x');";
    expect(probe.match(CALL_PATTERN)?.length).toBe(2);

    // And that an import specifier alone (no invocation) does NOT count as a
    // call — otherwise every legitimate `import { getToolFilePath } from ...`
    // left over for `resolveIntegrationTargetFile`'s own fallback use would
    // trip this guard.
    const importOnly = "import { getToolFilePath } from '../utils/integration-generator.js';";
    expect(importOnly.match(CALL_PATTERN)).toBeNull();
  });

  it('no source file outside integration-generator.js calls getToolFilePath/getToolFileName directly', () => {
    const hits = findCallSites();
    if (hits.length > 0) {
      const detail = hits.map(h => `  ${h.file} (${h.count} call site(s))`).join('\n');
      throw new Error(
        'Found direct getToolFilePath/getToolFileName call(s) outside ' +
        'utils/integration-generator.js — these bypass manifest.integrationTargets ' +
        '(XSPEC-418 R2). Route through resolveIntegrationTargetFile(tool, manifest) instead:\n' +
        detail
      );
    }
    expect(hits).toEqual([]);
  });
});
