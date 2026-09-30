/**
 * Install records — the manifest's account of what UDS itself put on disk, kept
 * so that `uds uninstall` removes exactly that and nothing else.
 *
 * Why a record and not a rule: `uds uninstall` used to leave four kinds of UDS
 * output behind (hook scripts under scripts/hooks/, emptied `.codex/`-style
 * folders, integration files whose generated header sits outside the UDS
 * marker block, and the body of the native pre-commit hook). Each could be
 * cleaned by pattern-matching on its content or path — and each of those
 * patterns also matches files an adopter wrote themselves (`scripts/hooks/` is
 * a directory UDS scaffolds INSIDE the adopter's project, where their own hook
 * scripts may live). Origin is a fact about the moment of writing, so it is
 * recorded then: a file is deleted only if a record says UDS wrote it AND its
 * content still hashes to what UDS wrote. No record, or a changed hash, means
 * the file is kept and the reason is printed.
 *
 * Deliberately NOT stored in `fileHashes` (`uds check` treats that as the list of
 * standards files and would report these as modified/untracked) or in
 * `provenance` (`uds update` prunes entries outside its expected set).
 * `installedArtifacts` is read by nothing except uninstall.
 *
 * Shape:
 *   installedArtifacts: {
 *     files: { '<rel/path>': { kind, hash, size, installedAt } },
 *     createdDirs: ['<rel/dir>', ...]          // directories UDS had to mkdir
 *   }
 *
 * `kind` selects what `hash` covers:
 *   'hook-script', 'git-hook'  → whole file (line endings normalized)
 *   'integration-file'         → everything outside the UDS marker block
 *
 * @module core/install-records
 */

import { existsSync, mkdirSync, lstatSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, relative, isAbsolute } from 'path';
import { computeFileHash, computeOutsideBlockHash } from '../utils/hasher.js';
import { getManifestPath } from './manifest.js';

export const RECORDS_KEY = 'installedArtifacts';

export const RECORD_KINDS = Object.freeze({
  HOOK_SCRIPT: 'hook-script',
  GIT_HOOK: 'git-hook',
  INTEGRATION_FILE: 'integration-file'
});

const norm = (p) => String(p).replace(/\\/g, '/');

/** A fresh, empty recorder. Installers fill it; a caller persists it. */
export function newRecorder() {
  return { files: {}, createdDirs: [] };
}

/**
 * The hash a record of this kind holds for a file as it is on disk right now.
 * Also what uninstall recomputes and compares — one function, so the two sides
 * cannot drift apart.
 * @returns {{hash: string, size: number}|null}
 */
export function currentHashFor(kind, absPath) {
  if (kind === RECORD_KINDS.INTEGRATION_FILE) return computeOutsideBlockHash(absPath);
  return computeFileHash(absPath);
}

/**
 * Record a file UDS has just written. Call it AFTER the write, so the hash is of
 * what is on disk. No-op (returns false) if the file cannot be hashed.
 */
export function recordFile(recorder, projectPath, relPath, kind) {
  const rel = norm(relPath);
  const h = currentHashFor(kind, join(projectPath, rel));
  if (!h) return false;
  recorder.files[rel] = { kind, hash: h.hash, size: h.size, installedAt: new Date().toISOString() };
  return true;
}

/**
 * `mkdir -p`, remembering every directory that did not exist before this call.
 * "UDS created this directory" is only knowable at the moment of creation; after
 * that an empty `.codex/` looks the same whether UDS or the adopter made it.
 */
export function mkdirTracked(recorder, projectPath, absDir) {
  const missing = [];
  let cur = absDir;
  while (!existsSync(cur)) {
    missing.push(cur);
    const parent = dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  if (missing.length === 0) return;
  mkdirSync(absDir, { recursive: true });
  for (const dir of missing.reverse()) {
    const rel = norm(relative(projectPath, dir));
    if (!rel || rel.startsWith('..') || isAbsolute(rel)) continue;
    if (!recorder.createdDirs.includes(rel)) recorder.createdDirs.push(rel);
  }
}

/** Fold a recorder into a manifest object (returned as a new object; input untouched). */
export function mergeRecorderInto(manifest, recorder) {
  const prev = manifest?.[RECORDS_KEY] || {};
  const dirs = new Set([...(prev.createdDirs || []), ...(recorder?.createdDirs || [])]);
  return {
    ...manifest,
    [RECORDS_KEY]: {
      files: { ...(prev.files || {}), ...(recorder?.files || {}) },
      createdDirs: [...dirs]
    }
  };
}

/** Drop records for paths UDS has now removed. */
export function forgetRecords(manifest, relPaths) {
  const prev = manifest?.[RECORDS_KEY];
  if (!prev) return manifest;
  const gone = new Set((relPaths || []).map(norm));
  const files = Object.fromEntries(Object.entries(prev.files || {}).filter(([k]) => !gone.has(k)));
  const createdDirs = (prev.createdDirs || []).filter((d) => !gone.has(d));
  return { ...manifest, [RECORDS_KEY]: { files, createdDirs } };
}

/** The record for a path, or undefined. */
export function getFileRecord(manifest, relPath) {
  return manifest?.[RECORDS_KEY]?.files?.[norm(relPath)];
}

/** True when the recorder holds anything worth writing. */
export function hasRecords(recorder) {
  return !!recorder && (Object.keys(recorder.files).length > 0 || recorder.createdDirs.length > 0);
}

/**
 * Persist a recorder into the project's manifest on disk. For callers that run
 * after the manifest was written (init's hook step, `uds update --with-hooks`).
 * Returns false — and writes nothing — when there is nothing to record or no
 * manifest to record it in.
 *
 * Reads and writes the manifest as RAW JSON, not through `readManifest`. That
 * function migrates on read (it rewrites `standards` from paths to registry IDs,
 * among other normalizations), so a read-modify-write through it would silently
 * change every other field in the file as a side effect of recording one new
 * one — measured: the e2e test "auto-restore missing files" reads `standards`
 * straight from the file `uds init` wrote and started failing because init's
 * manifest had come out in a different format.
 */
export function persistRecorder(projectPath, recorder) {
  if (!hasRecords(recorder)) return false;
  const manifestPath = getManifestPath(projectPath);
  if (!existsSync(manifestPath)) return false;
  let raw;
  try {
    raw = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  } catch {
    return false;
  }
  if (!raw || typeof raw !== 'object') return false;
  writeFileSync(manifestPath, JSON.stringify(mergeRecorderInto(raw, recorder), null, 2));
  return true;
}

/** Is `absPath` a real directory (not a symlink to one)? Uninstall never follows links. */
export function isRealDirectory(absPath) {
  try {
    const st = lstatSync(absPath);
    return st.isDirectory() && !st.isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * @returns {{ state: 'proven'|'no-record'|'changed', why: string }}
 *   proven     a record exists and the file still hashes to it
 *   no-record  nothing says UDS wrote it (older UDS, or written by hand)
 *   changed    UDS wrote it, and it has been edited since
 */
export function proveUnchanged(manifest, projectPath, relPath) {
  const rec = getFileRecord(manifest, relPath);
  if (!rec) {
    return {
      state: 'no-record',
      why: 'no install record — installed by an older UDS or not by UDS, so UDS cannot prove it wrote this'
    };
  }
  const now = currentHashFor(rec.kind, join(projectPath, relPath));
  if (now && now.hash === rec.hash) return { state: 'proven', why: 'unchanged since UDS wrote it' };
  return { state: 'changed', why: 'modified since UDS wrote it' };
}

