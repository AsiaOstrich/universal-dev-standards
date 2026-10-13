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

import { existsSync, readFileSync, writeFileSync, chmodSync } from 'fs';
import { join } from 'path';
import {
  buildPreCommitBlock, buildNativePreCommitHook, classifyNativePreCommitHook,
  UDS_HOOK_MARKER, UDS_HOOK_END_MARKER, BARE_UDS_RUNNER_RE, hasBareUdsRunner
} from './git-hooks.js';
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

// ─────────────────────────────────────────────────────────────────────────────
// XSPEC-482 R3 + R5: pre-commit hooks that look like a check and cannot stop a commit.
//
// Two shapes are on disk in projects UDS set up earlier, and both let every commit through:
//   - `.git/hooks/pre-commit` of 5.x .. 6.13.1: `uds check 2>/dev/null || true` (the CLI PATH happens to
//     hold, errors thrown away, "Pre-commit checks passed" printed whatever happened);
//   - the hook of 6.14.0-beta.2 .. beta.12 (native file, or the block inside `.husky/pre-commit`): it runs
//     the installed CLI, but `check` without `--ci` exits 0 when a standard file was edited.
// `uds init` now writes `check --ci`. These functions bring the files already on disk to it.
//
// What counts as "UDS wrote this": the whole file equals one of the known texts (native hook), or the
// block between UDS's two marker lines equals the known block (husky). Exact equality, not a pattern: a
// hook someone edited is NOT replaced - it is reported with the line number and what to write instead.
// ─────────────────────────────────────────────────────────────────────────────


/** A hook line that runs a UDS check and is built never to fail: `... check ... || true`. */
const ALWAYS_PASS_CHECK_RE = /\b(?:uds|universal-dev-standards)\s+check\b[^\n]*\|\|\s*true\b/;

/**
 * Bring the native `.git/hooks/pre-commit` of an older UDS to the one this CLI writes.
 *
 * @param {string} projectPath
 * @param {{plan?: boolean}} [opts] plan - report what would change, write nothing
 * @returns {{
 *   file: '.git/hooks/pre-commit',
 *   state: 'none'|'migrated'|'would-migrate'|'kept'|'error',
 *   from?: 'legacy-6.11'|'without-ci',
 *   kept: Array<{line: number, text: string}>,   // lines that make the check always pass, in a file UDS cannot prove it wrote
 *   recorder: object|null,                        // install record to fold into the manifest when non-null
 *   error?: string
 * }}
 */
export function migrateOlderNativeHook(projectPath, { plan = false } = {}) {
  const file = '.git/hooks/pre-commit';
  const abs = join(projectPath, '.git', 'hooks', 'pre-commit');
  const none = { file, state: 'none', kept: [], recorder: null };
  if (!existsSync(abs)) return none;

  let content;
  try {
    content = readFileSync(abs, 'utf-8');
  } catch (e) {
    return { ...none, state: 'error', error: e.message };
  }

  const known = classifyNativePreCommitHook(content);
  if (known === 'legacy-6.11' || known === 'without-ci') {
    if (plan) return { ...none, state: 'would-migrate', from: known };
    try {
      // Keep the file's own line endings: a hook saved with CRLF stays CRLF (the husky path below does the same).
      const fresh = buildNativePreCommitHook();
      writeFileSync(abs, content.includes('\r\n') ? fresh.replace(/\n/g, '\r\n') : fresh, 'utf-8'); // wire:native-migration-keeps-eol
      // writeFileSync keeps an existing file's mode; make sure git will still run it.
      if (process.platform !== 'win32') chmodSync(abs, 0o755);
    } catch (e) {
      return { ...none, state: 'error', from: known, error: e.message };
    }
    // The whole file is UDS's again: record it, so `uds uninstall` can delete it as provably ours.
    const recorder = newRecorder();
    recordFile(recorder, projectPath, file, RECORD_KINDS.GIT_HOOK);
    return { ...none, state: 'migrated', from: known, recorder };
  }
  if (known === 'current') return none;

  // Not a text UDS wrote: if it still carries the always-pass check, say where. It is not replaced.
  const kept = [];
  content.split('\n').forEach((raw, i) => {
    const text = raw.replace(/\r$/, '');
    if (ALWAYS_PASS_CHECK_RE.test(text)) kept.push({ line: i + 1, text: text.trim() });
  });
  return kept.length > 0 ? { ...none, state: 'kept', kept } : none;
}

/**
 * Bring the block `.husky/pre-commit` carries from beta.2 .. beta.12 (`check` without `--ci`) to the current one.
 * Only the block between UDS's two marker lines, and only when it is exactly the old text; the lines around it
 * are the adopter's and stay as they are.
 *
 * @param {string} projectPath
 * @param {{plan?: boolean, manifest?: object|null}} [opts] manifest - read only to see whether the whole file was provably UDS's
 * @returns {{file: '.husky/pre-commit', state: 'none'|'migrated'|'would-migrate'|'error', recorder: object|null, error?: string}}
 */
export function migrateHuskyBlockWithoutCi(projectPath, { plan = false, manifest = null } = {}) {
  const file = '.husky/pre-commit';
  const abs = join(projectPath, '.husky', 'pre-commit');
  const none = { file, state: 'none', recorder: null };
  if (!existsSync(abs)) return none;

  let content;
  try {
    content = readFileSync(abs, 'utf-8');
  } catch (e) {
    return { ...none, state: 'error', error: e.message };
  }
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const text = content.replace(/\r\n/g, '\n');
  const oldBlock = buildPreCommitBlock({ ci: false });
  if (!text.includes(oldBlock) || !text.includes(UDS_HOOK_END_MARKER)) return none;
  if (plan) return { ...none, state: 'would-migrate' };

  const wasProven = !!manifest && !!getFileRecord(manifest, file) && proveUnchanged(manifest, projectPath, file).state === 'proven';
  try {
    const next = text.replace(oldBlock, buildPreCommitBlock());
    writeFileSync(abs, eol === '\r\n' ? next.replace(/\n/g, '\r\n') : next, 'utf-8');
  } catch (e) {
    return { ...none, state: 'error', error: e.message };
  }
  let recorder = null;
  if (wasProven) {
    recorder = newRecorder();
    recordFile(recorder, projectPath, file, RECORD_KINDS.GIT_HOOK);
  }
  return { ...none, state: 'migrated', recorder };
}
