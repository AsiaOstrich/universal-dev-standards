/**
 * Regression guard for the `uds update` content-language bug found while
 * investigating a 6.12.0 -> 6.13.0 adopter report.
 *
 * `resolveIntegrationLanguage(manifest)` (utils/integration-generator.js) is
 * the single place that decides what language an integration block is
 * written in: it prefers `manifest.options.display_language` and only falls
 * back to `output_language`/`commit_language` (the commit-message language —
 * a different setting) when there is no display language recorded.
 * `buildToolIntegrationConfig` already used this logic (added 2026-09-16,
 * XSPEC-343 R2 follow-up). Two other places in `commands/update.js` — the
 * plain `uds update` main flow's per-tool loop, and its `--plan` dry-run —
 * independently re-derived the same value from `output_language`/
 * `commit_language` ALONE, ignoring `display_language` entirely.
 *
 * Measured: a project installed with `display_language: zh-tw` and
 * `output_language: bilingual` got the correct Chinese
 * "## 提交訊息語言" heading from `init`/the reconciler, and an English
 * "## Commit Message Language" heading from the very next plain
 * `uds update -y` — silently overwriting the block that was already there.
 * The bug was invisible on same-version runs: `uds update` returns early
 * when `manifest.upstream.version >= registry.version` (line ~590), before
 * ever reaching the per-tool loop, so it only fired on a real version bump —
 * which is exactly what made it look like a new 6.13.0 regression when the
 * underlying derivation bug had shipped in every release since 2026-03-25
 * (commit ad555d41) and was still present, unfixed at two of three call
 * sites, as of 6.13.0 (commit 81af4460).
 *
 * This test walks the actual CLI source (not a hand-written list of "the
 * files I remember touching") for the exact buggy idiom —
 * `(manifest.options?.output_language || manifest.options?.commit_language) === 'bilingual'`
 * — used to derive a `language`/`commonLanguage` value. It does not flag the
 * (correct, common) `outputLanguage: manifest.options?.output_language || ...`
 * assignment, which is a different field carrying the commit-message
 * language into the generator on purpose.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(__dirname, '../../../src');

// The exact buggy idiom: deriving a value by comparing the OR'd
// output_language/commit_language expression directly against 'bilingual'.
// `resolveIntegrationLanguage` itself binds the OR'd expression to a local
// (`selected`) before comparing it, so it never matches this literal shape —
// no file needs to be excluded by name.
const BUGGY_PATTERN = /manifest\.options\?\.output_language \|\| manifest\.options\?\.commit_language\)\s*===\s*'bilingual'/g;

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

function findHits() {
  const hits = [];
  for (const file of listJsFiles(SRC_DIR)) {
    const content = stripComments(readFileSync(file, 'utf-8'));
    const matches = content.match(BUGGY_PATTERN);
    if (matches) {
      hits.push({ file: relative(SRC_DIR, file), count: matches.length });
    }
  }
  return hits;
}

describe('uds update content-language derivation is centralized', () => {
  it('sanity: the scan itself can detect the buggy idiom (known-positive control)', () => {
    // Proves BUGGY_PATTERN actually matches before trusting an empty result
    // below to mean "no inline derivation" rather than "broken regex".
    const probe = "let commonLanguage = 'en';\n" +
      "if ((manifest.options?.output_language || manifest.options?.commit_language) === 'bilingual') {\n" +
      "  commonLanguage = 'bilingual';\n}";
    expect(probe.match(BUGGY_PATTERN)?.length).toBe(1);

    // And that the correct, common `outputLanguage:` field assignment (no
    // trailing `=== 'bilingual'` comparison) does NOT count as a hit —
    // otherwise every legitimate call site forwarding output_language to the
    // generator would trip this guard.
    const legitimate = "outputLanguage: manifest.options?.output_language || manifest.options?.commit_language || 'english'";
    expect(legitimate.match(BUGGY_PATTERN)).toBeNull();
  });

  it('no source file re-derives content language from output_language/commit_language alone', () => {
    const hits = findHits();
    if (hits.length > 0) {
      const detail = hits.map(h => `  ${h.file} (${h.count} occurrence(s))`).join('\n');
      throw new Error(
        'Found inline `(...output_language || ...commit_language) === \'bilingual\'` ' +
        'content-language derivation outside resolveIntegrationLanguage. This ignores ' +
        'display_language and reproduces the 6.13.0 CLAUDE.md language regression. ' +
        'Use resolveIntegrationLanguage(manifest) (utils/integration-generator.js) instead:\n' +
        detail
      );
    }
    expect(hits).toEqual([]);
  });
});
