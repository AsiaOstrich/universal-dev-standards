/**
 * Which hook-script contents did UDS itself ship in the past?
 *
 * `uds update --with-hooks` must tell two different things apart when a script in
 * `<project>/scripts/hooks/` differs from the version in this package:
 *
 *   - an OLD UDS copy nobody touched  -> safe to replace with the new one
 *   - a copy the adopter EDITED       -> must be kept (it may carry their changes)
 *
 * A byte-for-byte match against a script some earlier UDS release shipped is the only
 * evidence of the first kind. The table lives in `hook-script-fingerprints.json`,
 * produced from the git tags by `scripts/generate-hook-fingerprints.mjs` — never typed
 * by hand — and `tests/unit/hooks/hook-script-fingerprints.test.js` fails the moment a
 * script under `scripts/hooks/` has a content the table does not know.
 *
 * Keyed by path as well as by hash: a file shipped under one name does not make the
 * same bytes "UDS's" under another.
 *
 * Node built-ins only. The generator in the repo root imports this file, and the CI
 * jobs that run root scripts install no packages (see
 * tests/e2e/root-scripts-need-no-cli-packages.test.js).
 *
 * @module installers/hook-script-fingerprint
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const FINGERPRINT_FILE = join(dirname(fileURLToPath(import.meta.url)), 'hook-script-fingerprints.json');

/**
 * sha256 of the script with CRLF folded to LF.
 *
 * A project that commits `scripts/hooks/` on Windows with `core.autocrlf=true` has the
 * same script with different line endings; that is not an edit. Folding is done on a
 * latin1 view so no byte is reinterpreted.
 *
 * @param {Buffer} buf
 * @returns {string} 64 hex chars
 */
export function hashHookScript(buf) {
  const folded = Buffer.from(buf.toString('latin1').replace(/\r\n/g, '\n'), 'latin1');
  return createHash('sha256').update(folded).digest('hex');
}

/**
 * @returns {{ scripts: Record<string, Record<string, string>> }} path -> { sha256 -> first release that shipped it }
 */
export function loadFingerprints(file = FINGERPRINT_FILE) {
  const parsed = JSON.parse(readFileSync(file, 'utf-8'));
  return { scripts: parsed.scripts ?? {} };
}

/**
 * Is `buf` exactly a copy of `relPath` that an earlier UDS shipped?
 *
 * @param {string} relPath  path under scripts/hooks, with `/` separators
 * @param {Buffer} buf      the project's copy
 * @param {{ scripts: Record<string, Record<string, string>> }} [table]
 * @returns {{ since: string } | null}  `since` = first release that shipped this content
 */
export function shippedBefore(relPath, buf, table = loadFingerprints()) {
  const known = table.scripts[relPath];
  if (!known) return null;
  const since = known[hashHookScript(buf)];
  return since ? { since } : null;
}
