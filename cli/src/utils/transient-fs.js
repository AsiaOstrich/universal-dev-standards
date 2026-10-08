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
 * @module utils/transient-fs
 */

import { copyFileSync } from 'fs';

/** The retry budget. Worst case about 2.3 s of waiting per file (50+100+...+450 ms). */
export const RETRY_POLICY = Object.freeze({
  maxAttempts: 10,
  stepMs: 50,
  maxDelayMs: 500,
  maxTotalMs: 5000
});

const ALWAYS_TRANSIENT = new Set(['EBUSY']);
const WINDOWS_TRANSIENT = new Set(['EPERM', 'EACCES']);

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
 * Run `operation` and retry it while it fails with a transient file-system error.
 *
 * @template T
 * @param {() => T} operation - A synchronous file operation.
 * @param {Object} info
 * @param {string} info.path - The file that is being worked on (named in the final error).
 * @param {string} info.action - Short verb phrase for the final error, e.g. "copy to".
 * @param {Object} [hooks] - Injection points for tests.
 * @param {string} [hooks.platform]
 * @param {(ms:number)=>void} [hooks.sleep]
 * @param {()=>number} [hooks.now]
 * @param {typeof RETRY_POLICY} [hooks.policy]
 * @returns {T}
 */
export function retryTransientFs(operation, info, hooks = {}) {
  const { platform = process.platform, sleep = sleepSync, now = Date.now, policy = RETRY_POLICY } = hooks;
  const start = now();
  for (let attempt = 1; ; attempt++) {
    try {
      return operation();
    } catch (err) {
      if (!isTransientFsError(err, platform)) throw err;
      const elapsed = now() - start;
      const delay = Math.min(policy.stepMs * attempt, policy.maxDelayMs);
      if (attempt >= policy.maxAttempts || elapsed + delay > policy.maxTotalMs) {
        throw lockedFileError(err, info, attempt, elapsed);
      }
      sleep(delay);
    }
  }
}

/** `fs.copyFileSync` that survives a short-lived file lock. Errors name the destination. */
export function copyFileSyncRetrying(source, target, hooks) {
  return retryTransientFs(() => copyFileSync(source, target), { path: String(target), action: `copy "${source}" to` }, hooks);
}
