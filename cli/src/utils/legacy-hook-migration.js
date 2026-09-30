/**
 * Migrate the pre-commit hook line older UDS versions wrote
 * (`npx uds check`) to the block current UDS writes.
 *
 * Why it exists: every adopter who ran `uds init` before this fix has
 * `.husky/pre-commit` asking `npx` to run the bare name `uds`. `npx` looks in
 * node_modules/.bin and PATH first and otherwise asks the npm registry — where
 * `uds` is an unrelated package that is not ours (see buildPreCommitBlock in
 * git-hooks.js for the measurements). Fixing what `uds init` writes today does
 * nothing for the hooks already on disk, so `uds update` swaps them.
 *
 * ⚠️ THIS FILE RECOGNISES the old text; it must never EMIT it. The regression
 * guard (tests/unit/no-bare-uds-npx.test.js) lists this file as the one place
 * a bare-name npx string is allowed, and says why. Nothing here may write one.
 *
 * What counts as "UDS wrote this line" — exact equality, not a pattern:
 * only the two shapes UDS has ever generated, and only directly under the
 * marker comment UDS put above them.
 *   2026-02-04 .. 2026-03-04   npx uds check --standard checkin-standards
 *   2026-03-04 .. this fix     npx uds check
 * (from `git log -S` on the writer in cli/src/commands/init.js.) A line an
 * adopter edited, or wrote themselves, is NOT swapped: it cannot be proven to be
 * ours, and a hook that runs the adopter's own arguments is theirs to change.
 * It is reported, with the exact line number and what to write instead.
 *
 * @module utils/legacy-hook-migration
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { buildPreCommitBlock, UDS_HOOK_MARKER, BARE_UDS_RUNNER_RE, hasBareUdsRunner } from './git-hooks.js';
import { getFileRecord, proveUnchanged, recordFile, newRecorder, RECORD_KINDS } from '../core/install-records.js';

/** The exact command lines UDS itself has written under the marker, and the extra arguments each carried. */
const UDS_WRITTEN_LEGACY_LINES = new Map([
  ['npx uds check', ''],
  ['npx uds check --standard checkin-standards', '--standard checkin-standards']
]);

/**
 * Swap the legacy hook line UDS wrote in `.husky/pre-commit` for the current block.
 *
 * @param {string} projectPath
 * @param {{plan?: boolean, manifest?: object|null}} [opts]
 *   plan     — report what would change, write nothing
 *   manifest — read only to see whether the file was provably UDS's before the
 *              swap (so the install record can follow it); may be null
 * @returns {{
 *   state: 'none'|'migrated'|'would-migrate'|'kept'|'error',
 *   replaced: number,           // legacy UDS-written lines swapped (or that would be)
 *   kept: Array<{line: number, text: string}>, // bare-name lines UDS cannot prove it wrote
 *   recorder: object|null,      // fold into the manifest when non-null
 *   error?: string
 * }}
 */
export function migrateLegacyHuskyHook(projectPath, { plan = false, manifest = null } = {}) {
  const rel = '.husky/pre-commit';
  const abs = join(projectPath, '.husky', 'pre-commit');
  const none = { state: 'none', replaced: 0, kept: [], recorder: null };
  if (!existsSync(abs)) return none;

  let content;
  try {
    content = readFileSync(abs, 'utf-8');
  } catch (e) {
    return { ...none, state: 'error', error: e.message };
  }
  if (!hasBareUdsRunner(content)) return none;

  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split('\n');
  const out = [];
  const kept = [];
  let replaced = 0;

  for (let i = 0; i < lines.length; i++) {
    const text = lines[i].replace(/\r$/, '');
    const next = i + 1 < lines.length ? lines[i + 1].replace(/\r$/, '').trim() : null;
    // Marker line directly followed by a line UDS is known to have written.
    if (text.trim() === UDS_HOOK_MARKER && next !== null && UDS_WRITTEN_LEGACY_LINES.has(next)) {
      const block = buildPreCommitBlock({ args: UDS_WRITTEN_LEGACY_LINES.get(next) });
      // block ends with '\n'; drop that so the surrounding line join supplies it.
      out.push(...block.replace(/\n$/, '').split('\n').map((l) => l + (eol === '\r\n' ? '\r' : '')));
      replaced += 1;
      i += 1; // the legacy command line is consumed
      continue;
    }
    if (BARE_UDS_RUNNER_RE.test(text)) kept.push({ line: i + 1, text: text.trim() });
    out.push(lines[i]);
  }

  if (replaced === 0) return { state: 'kept', replaced: 0, kept, recorder: null };

  if (plan) return { state: 'would-migrate', replaced, kept, recorder: null };

  // Was the whole file provably UDS's until now? Then the swap must not cost it
  // that proof: re-record the new content, or uninstall falls back from "delete
  // the file UDS created" to "strip lines".
  let recorder = null;
  const wasProven = !!manifest && !!getFileRecord(manifest, rel) && proveUnchanged(manifest, projectPath, rel).state === 'proven';

  try {
    writeFileSync(abs, out.join('\n'), 'utf-8');
  } catch (e) {
    return { state: 'error', replaced: 0, kept, recorder: null, error: e.message };
  }
  if (wasProven) {
    recorder = newRecorder();
    recordFile(recorder, projectPath, rel, RECORD_KINDS.GIT_HOOK);
  }
  return { state: 'migrated', replaced, kept, recorder };
}
