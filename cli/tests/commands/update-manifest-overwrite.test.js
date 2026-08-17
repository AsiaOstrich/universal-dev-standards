/**
 * XSPEC-382 R5 — a later write must not revert what the reconciler wrote.
 *
 * The defect: `update.js` loads the manifest once at the top of the command.
 * The reconciler runs afterwards and writes its own copy to disk, including an
 * advanced `upstream.version`. `updateSkillsOnly` and `updateCommandsOnly` then
 * wrote their stale in-memory object back, silently reverting it.
 *
 * Measured 2026-08-18 with probes inside plan-executor: results=57 failing=0,
 * registry version "6.7.1", "about to write upstream = {version:'6.7.1'}" — and
 * the value on disk afterwards was the old one. Every run exited 0 and printed
 * "57 succeeded", so a fully upgraded repo kept reporting itself as behind to
 * the weekly staleness scout, which reads exactly `upstream.version`.
 *
 * This test asserts the SHAPE of the fix rather than driving the whole CLI:
 * both functions must re-read the manifest before their final write, and must
 * carry over only the fields they own. A test that ran the command end-to-end
 * would need a full project fixture and would still not say WHY it failed.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SRC = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'src',
  'commands',
  'update.js'
);

/** Extract one function body by name, from `async function <name>` to the next top-level `}`. */
function functionBody(source, name) {
  const start = source.indexOf(`async function ${name}(`);
  if (start === -1) return null;
  const end = source.indexOf('\n}\n', start);
  return end === -1 ? source.slice(start) : source.slice(start, end + 3);
}

describe('XSPEC-382 R5: a stale manifest write must not revert the reconciler', () => {
  const source = readFileSync(SRC, 'utf-8');

  // Guard the guard: if the functions are renamed, this file must fail loudly
  // rather than pass over nothing. A test that silently matches zero functions
  // is byte-identical to a passing one.
  it('finds both functions under test', () => {
    expect(functionBody(source, 'updateSkillsOnly')).toBeTruthy();
    expect(functionBody(source, 'updateCommandsOnly')).toBeTruthy();
  });

  for (const [fn, ownedFields] of [
    ['updateSkillsOnly', ['skills', 'skillHashes']],
    ['updateCommandsOnly', ['commands', 'commandHashes']],
  ]) {
    describe(fn, () => {
      const body = functionBody(source, fn);

      it('re-reads the manifest before its final write', () => {
        expect(body).toMatch(/readManifest\(projectPath\)/);
      });

      it('does not write the stale object it was handed', () => {
        // The defect, verbatim: writeManifest(manifest, projectPath)
        expect(body).not.toMatch(/writeManifest\(\s*manifest\s*,/);
      });

      it('carries over only the fields it owns', () => {
        for (const f of ownedFields) {
          expect(body).toMatch(new RegExp(`\\.${f}\\s*=\\s*manifest\\.${f}`));
        }
        // Copying the whole object back would reintroduce the overwrite for any
        // field a later step adds — that is the defect, not a smaller version of it.
        expect(body).not.toMatch(/=\s*\{\s*\.\.\.manifest\s*\}/);
      });
    });
  }
});
