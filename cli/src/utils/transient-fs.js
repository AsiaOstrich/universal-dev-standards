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
 * @module utils/transient-fs
 */

import { copyFileSync, openSync, closeSync, unlinkSync, existsSync } from 'fs';
import { dirname, join } from 'path';

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

/**
 * The error shown when the retry budget is used up: which file, the likely cause, what to do.
 * Keeps the original code and message, so nothing is lost for someone searching the raw text.
 */
function lockedFileError(err, { path, action }, attempts, elapsedMs) {
  const seconds = (elapsedMs / 1000).toFixed(1);
  const message =
    `Could not ${action} "${path}": the file is locked by another program (${err.code}). ` +
    `UDS tried ${attempts} times over ${seconds} s and the lock did not clear. ` +
    'Likely causes: antivirus real-time scanning, the Windows search indexer, a cloud-sync client ' +
    '(OneDrive, Dropbox) or an editor that has the file open. ' +
    'Close whatever is using the file or add the project folder to the antivirus exclusions, then run the command again. ' +
    `(Original error: ${err.message})`;
  const wrapped = new Error(message);
  wrapped.code = err.code;
  wrapped.path = path;
  wrapped.cause = err;
  wrapped.transientRetryExhausted = true;
  return wrapped;
}

/**
 * The error shown for a real permission problem (XSPEC-516 R2): says "permission denied", names what was found
 * when it is known, and lists what to check. It never mentions antivirus or a lock: telling someone whose
 * account may not write to a folder to switch off their antivirus sends them the wrong way.
 */
function permissionDeniedError(err, { path, action }, attempts, elapsedMs, reason) {
  const tried = attempts > 1
    ? `UDS tried ${attempts} times over ${(elapsedMs / 1000).toFixed(1)} s and the error did not change. `
    : '';
  const found = reason ? `UDS checked: ${reason}. ` : '';
  const message =
    `Could not ${action} "${path}": permission denied (${err.code}). ` +
    'This looks like a permission problem rather than a temporary file lock. ' +
    tried + found +
    'Check: (1) the file is not marked read-only; (2) your account may read the source and write the file ' +
    'and its folder (owner and permissions; on Windows, the Security tab of the folder); ' +
    '(3) the folder is not on a read-only drive or in a protected location. ' +
    'Fix the permission, then run the command again. ' +
    `(Original error: ${err.message})`;
  const wrapped = new Error(message);
  wrapped.code = err.code;
  wrapped.path = path;
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
 * @param {{path: string, source?: string}} info
 * @param {{openSync?: Function, closeSync?: Function, unlinkSync?: Function, existsSync?: Function}} [ops] - for tests
 * @returns {{denied: boolean, reason?: string}}
 */
export function probeWritePermission({ path, source }, ops = {}) {
  const { openSync: open = openSync, closeSync: close = closeSync, unlinkSync: unlink = unlinkSync, existsSync: exists = existsSync } = ops;
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
    if (code && DENIED_CODES.has(code)) return { denied: true, reason: `the source "${source}" cannot be opened for reading (${code})` };
  }
  if (exists(path)) {
    const code = tryOpen(path, 'r+');
    if (code && DENIED_CODES.has(code)) return { denied: true, reason: `"${path}" cannot be opened for writing (${code}): it is read-only or this account may not write it` };
    return { denied: false }; // opened, or EBUSY / anything else: a lock, not a permission
  }
  const folder = dirname(path);
  const scratch = join(folder, `.uds-permission-probe-${process.pid}-${Date.now().toString(36)}`);
  let created = false;
  try {
    const code = tryOpen(scratch, 'wx');
    created = code === null;
    if (code && DENIED_CODES.has(code)) return { denied: true, reason: `a file cannot be created in the folder "${folder}" (${code})` };
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
          if (verdict.denied) throw permissionDeniedError(err, info, attempt, elapsed, verdict.reason);
        }
        throw lockedFileError(err, info, attempt, elapsed);
      }
      sleep(delay);
    }
  }
}

/** `fs.copyFileSync` that survives a short-lived file lock. Errors name the destination. */
export function copyFileSyncRetrying(source, target, hooks) {
  return retryTransientFs(() => copyFileSync(source, target), { path: String(target), source: String(source), action: `copy "${source}" to` }, hooks);
}
