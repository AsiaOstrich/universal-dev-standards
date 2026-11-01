/**
 * Retry for transient file-system errors (Windows file locks).
 *
 * Why this exists: on Windows, a file that was written a moment ago can stay locked for a short time
 * while antivirus real-time scanning, the search indexer or a cloud-sync client looks at it. A copy or
 * write onto / from that file then fails with EBUSY (or EPERM / EACCES) even though nothing is wrong,
 * and retrying a moment later succeeds. Before this module, ONE such error made `uds init` roll the
 * whole install back (observed on a Windows CI runner: `EBUSY ... copyfile`).
 *
 * Which errors are retried, and why (this follows what the ecosystem already does):
 *   - EBUSY: every platform. rimraf 3 retries EBUSY/ENOTEMPTY/EPERM; Node's own fs.rm `maxRetries`
 *     retries EBUSY/EMFILE/ENFILE/ENOTEMPTY/EPERM. Retrying a busy resource for a moment is harmless.
 *   - EPERM and EACCES: Windows ONLY. graceful-fs retries rename on EACCES/EPERM/EBUSY, win32 only,
 *     because "A/V software can lock the directory, causing this to fail with an EACCES or EPERM".
 *     On POSIX the same two codes are real permission errors that a retry cannot fix, so they fail at once.
 *
 * The retry is bounded: at most `maxAttempts` tries, a linear back-off that stops growing at
 * `maxDelayMs`, and a hard ceiling `maxTotalMs` on the time spent. When it is used up, the error says in
 * plain words which file was locked, the likely causes and what to do - not just the bare error code.
 *
 * EPERM / EACCES are not always a lock (XSPEC-516 R2): Windows reports a read-only file or a denied ACL with the
 * same codes. When they keep failing, the file system is asked (probeWritePermission) and a real permission
 * problem gets its own message ("permission denied", what to check) - it must not tell the user to switch off
 * their antivirus. Off Windows they are permission errors from the first try and get the same message.
 *
 * Creating a folder goes through the same two checks (XSPEC-516 follow-up, board #77): `mkdirSyncRetrying` retries
 * a locked folder and says "permission denied" for a real permission problem, so a folder that cannot be created
 * reads the same as a file that cannot be copied. The words come from the CLI's message table (src/i18n/messages.js,
 * `fsErrors`), so they follow `--ui-lang` and the manifest's display language like every other CLI message.
 *
 * @module utils/transient-fs
 */

import { copyFileSync, cpSync, mkdirSync, rmdirSync, openSync, closeSync, unlinkSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { t } from '../i18n/messages.js';

/** The retry budget. Worst case about 2.3 s of waiting per file (50+100+...+450 ms). */
export const RETRY_POLICY = Object.freeze({
  maxAttempts: 10,
  stepMs: 50,
  maxDelayMs: 500,
  maxTotalMs: 5000
});

const ALWAYS_TRANSIENT = new Set(['EBUSY']);
const WINDOWS_TRANSIENT = new Set(['EPERM', 'EACCES']);
const PERMISSION_CODES = new Set(['EPERM', 'EACCES']);
// What a refused write looks like when it is a permission and not a lock (EROFS: a read-only file system).
const DENIED_CODES = new Set(['EPERM', 'EACCES', 'EROFS']);

/**
 * Is this error one that is worth retrying on this platform?
 * @param {unknown} err
 * @param {string} [platform] - Defaults to the running platform (a parameter so it can be tested anywhere).
 * @returns {boolean}
 */
export function isTransientFsError(err, platform = process.platform) {
  const code = err && typeof err === 'object' ? err.code : undefined;
  if (typeof code !== 'string') return false;
  if (ALWAYS_TRANSIENT.has(code)) return true;
  return platform === 'win32' && WINDOWS_TRANSIENT.has(code);
}

/** Block the thread for `ms` milliseconds without spinning the CPU. */
export function sleepSync(ms) {
  if (ms <= 0) return;
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** Fill `{name}` placeholders in one pass, so a value that itself contains `{x}` (an error text) is never filled twice. */
function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (whole, key) => (Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : whole));
}

/** "Could not copy "a" to "b"" / "Could not create the folder "x"": the first words of both errors, in the CLI's language. */
function lead(info) {
  const words = t().fsErrors;
  const template = (info.step && words.couldNot[info.step]) || words.couldNot.generic;
  return fill(template, { action: info.action, path: info.path, source: info.source ?? '' });
}

/**
 * The error shown when the retry budget is used up: which file, the likely cause, what to do.
 * Keeps the original code and message, so nothing is lost for someone searching the raw text.
 */
function lockedFileError(err, info, attempts, elapsedMs) {
  const words = t().fsErrors;
  const message = fill(words.locked, {
    lead: lead(info),
    what: info.kind === 'folder' ? words.what.folder : words.what.file,
    code: err.code,
    attempts,
    seconds: (elapsedMs / 1000).toFixed(1),
    original: err.message
  });
  const wrapped = new Error(message);
  wrapped.code = err.code;
  wrapped.path = info.path;
  wrapped.cause = err;
  wrapped.transientRetryExhausted = true;
  return wrapped;
}

/**
 * The error shown for a real permission problem (XSPEC-516 R2): says "permission denied", names what was found
 * when it is known, and lists what to check. It never mentions antivirus or a lock: telling someone whose
 * account may not write to a folder to switch off their antivirus sends them the wrong way.
 * `verdict` is what probeWritePermission found: `reasonKey` + `values` are put in the CLI's language, `reason` is the
 * English fallback for a probe that only gives text.
 */
function permissionDeniedError(err, info, attempts, elapsedMs, verdict) {
  const words = t().fsErrors;
  const tried = attempts > 1
    ? fill(words.permissionTried, { attempts, seconds: (elapsedMs / 1000).toFixed(1) })
    : '';
  const reasonTemplate = verdict && verdict.reasonKey ? words.reasons[verdict.reasonKey] : undefined;
  const reason = reasonTemplate ? fill(reasonTemplate, verdict.values || {}) : verdict && verdict.reason;
  const found = reason ? fill(words.permissionFound, { reason }) : '';
  const message = fill(words.permissionDenied, {
    lead: lead(info),
    code: err.code,
    tried,
    found,
    check: info.kind === 'folder' ? words.checkFolder : words.checkFile,
    original: err.message
  });
  const wrapped = new Error(message);
  wrapped.code = err.code;
  wrapped.path = info.path;
  wrapped.cause = err;
  wrapped.permissionDenied = true;
  return wrapped;
}

/**
 * After EPERM / EACCES kept failing on Windows: is this a real permission problem, or a lock that looked like one?
 * Windows reports both as EPERM / EACCES, so the error code cannot tell them apart; what can is TRYING the write.
 * (`fs.access` cannot: on Windows libuv answers W_OK from the read-only attribute alone, never from the ACL, and
 * always says yes for a folder - src/win/fs.c `fs__access`.) Evidence of a permission problem: the source cannot be
 * opened for reading, the destination exists and cannot be opened for writing (read-only attribute, or an ACL that
 * denies it), or it does not exist and a scratch file cannot be created next to it. A destination that opens for
 * writing now was locked a moment ago, not forbidden. The scratch file is removed on every path, including a failure.
 * @param {{path: string, source?: string, kind?: 'file'|'folder'}} info
 * @param {{openSync?: Function, closeSync?: Function, unlinkSync?: Function, existsSync?: Function, mkdirSync?: Function, rmdirSync?: Function}} [ops] - for tests
 * @returns {{denied: boolean, reason?: string, reasonKey?: string, values?: object}} - `reason` is English text; `reasonKey` + `values` let the caller say it in the CLI's language
 */
export function probeWritePermission({ path, source, kind }, ops = {}) {
  const { openSync: open = openSync, closeSync: close = closeSync, unlinkSync: unlink = unlinkSync, existsSync: exists = existsSync, mkdirSync: makeDir = mkdirSync, rmdirSync: removeDir = rmdirSync } = ops;
  // Open `file` with `flags`, close it again; returns the error code if it could not be opened, else null.
  const tryOpen = (file, flags) => {
    let fd;
    try {
      fd = open(file, flags);
    } catch (e) {
      return (e && e.code) || 'UNKNOWN';
    }
    try { close(fd); } catch { /* the probe only asks whether it could be opened */ }
    return null;
  };
  if (source) {
    const code = tryOpen(source, 'r');
    if (code && DENIED_CODES.has(code)) return { denied: true, reason: `the source "${source}" cannot be opened for reading (${code})`, reasonKey: 'sourceUnreadable', values: { source, code } };
  }
  // A folder to create (kind 'folder') is asked as "can a file be made where it would go": the nearest folder that
  // already exists is the one that decides, and opening a folder itself for writing means nothing (EISDIR / EPERM).
  if (kind !== 'folder' && exists(path)) {
    const code = tryOpen(path, 'r+');
    if (code && DENIED_CODES.has(code)) return { denied: true, reason: `"${path}" cannot be opened for writing (${code}): it is read-only or this account may not write it`, reasonKey: 'targetUnwritable', values: { path, code } };
    return { denied: false }; // opened, or EBUSY / anything else: a lock, not a permission
  }
  let folder = kind === 'folder' ? path : dirname(path);
  while (!exists(folder) && dirname(folder) !== folder) folder = dirname(folder); // the nearest existing folder up the path
  const scratch = join(folder, `.uds-permission-probe-${process.pid}-${Date.now().toString(36)}`);
  if (kind === 'folder') {
    // A folder to create is asked with a FOLDER: on Windows an ACL can allow new files and refuse new folders
    // (add-file and add-subdirectory are separate rights), and a scratch file would then say "no problem".
    let made = false;
    try {
      makeDir(scratch);
      made = true;
    } catch (e) {
      const code = (e && e.code) || 'UNKNOWN';
      if (DENIED_CODES.has(code)) return { denied: true, reason: `a folder cannot be created inside "${folder}" (${code})`, reasonKey: 'folderCannotBeMade', values: { folder, code } };
      return { denied: false };
    } finally {
      if (made) { try { removeDir(scratch); } catch { /* nothing more can be done; the name starts with .uds-permission-probe */ } }
    }
    return { denied: false };
  }
  let created = false;
  try {
    const code = tryOpen(scratch, 'wx');
    created = code === null;
    if (code && DENIED_CODES.has(code)) return { denied: true, reason: `a file cannot be created in the folder "${folder}" (${code})`, reasonKey: 'folderUnwritable', values: { folder, code } };
    return { denied: false };
  } finally {
    if (created) { try { unlink(scratch); } catch { /* nothing more can be done; the name starts with .uds-permission-probe */ } }
  }
}

/**
 * Run `operation` and retry it while it fails with a transient file-system error.
 *
 * @template T
 * @param {() => T} operation - A synchronous file operation.
 * @param {Object} info
 * @param {string} info.path - The file that is being worked on (named in the final error).
 * @param {string} info.action - Short verb phrase for the final error, e.g. "copy to".
 * @param {string} [info.source] - The file that is read, when there is one (checked when permission is suspected).
 * @param {'copy'|'createFolder'} [info.step] - Names the first words of the error in the CLI's language; without it `action` is used (English).
 * @param {'file'|'folder'} [info.kind] - What `path` is; a folder gets folder wording and a folder-shaped permission check.
 * @param {Object} [hooks] - Injection points for tests.
 * @param {string} [hooks.platform]
 * @param {(ms:number)=>void} [hooks.sleep]
 * @param {()=>number} [hooks.now]
 * @param {typeof RETRY_POLICY} [hooks.policy]
 * @param {(info:object)=>{denied:boolean, reason?:string}} [hooks.probe] - Permission check used after EPERM / EACCES gave up.
 * @returns {T}
 */
export function retryTransientFs(operation, info, hooks = {}) {
  const { platform = process.platform, sleep = sleepSync, now = Date.now, policy = RETRY_POLICY, probe = probeWritePermission } = hooks;
  const start = now();
  for (let attempt = 1; ; attempt++) {
    try {
      return operation();
    } catch (err) {
      if (!isTransientFsError(err, platform)) {
        // Off Windows EPERM / EACCES are real permission errors (see the header): say so in plain words.
        if (err && PERMISSION_CODES.has(err.code)) throw permissionDeniedError(err, info, 1, 0);
        throw err;
      }
      const elapsed = now() - start;
      const delay = Math.min(policy.stepMs * attempt, policy.maxDelayMs);
      if (attempt >= policy.maxAttempts || elapsed + delay > policy.maxTotalMs) {
        if (PERMISSION_CODES.has(err.code)) {
          const verdict = probe(info);
          if (verdict.denied) throw permissionDeniedError(err, info, attempt, elapsed, verdict);
        }
        throw lockedFileError(err, info, attempt, elapsed);
      }
      sleep(delay);
    }
  }
}

/** `fs.copyFileSync` that survives a short-lived file lock. Errors name the destination. */
export function copyFileSyncRetrying(source, target, hooks) {
  return retryTransientFs(() => copyFileSync(source, target), { path: String(target), source: String(source), action: `copy "${source}" to`, step: 'copy' }, hooks);
}

/**
 * `fs.cpSync(source, target, options)` that survives a short-lived lock and says "permission denied" for a real
 * permission problem. For the backup, which copies a file or a symlink with `cpSync`, not `copyFileSync`.
 */
export function cpSyncRetrying(source, target, options, hooks) {
  return retryTransientFs(() => cpSync(source, target, options), { path: String(target), source: String(source), action: `copy "${source}" to`, step: 'copy' }, hooks);
}

/**
 * `fs.mkdirSync(path, { recursive: true })` that survives a short-lived lock and, for a real permission problem,
 * says "permission denied" and what to check instead of Node's bare `EACCES: permission denied, mkdir '...'`.
 * (Board #77: the copy had this and the folder made just before it did not, so the same cause read two ways.)
 */
export function mkdirSyncRetrying(path, hooks) {
  return retryTransientFs(() => mkdirSync(path, { recursive: true }), { path: String(path), action: 'create the folder', step: 'createFolder', kind: 'folder' }, hooks);
}
