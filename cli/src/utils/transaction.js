/**
 * File transaction wrapper — backup → apply → verify → rollback.
 *
 * Makes a multi-step, file-mutating operation atomic from the caller's point of
 * view: snapshot the files/dirs the operation may touch, run `apply()`, then
 * `verify()` the result. If `apply()` throws or `verify()` returns false, every
 * tracked path is restored to its pre-apply state and the error is re-thrown
 * (annotated with `rolledBack`). On success the changes are committed (left in
 * place) and the apply() result is returned.
 *
 * Rollback semantics per tracked path:
 *   - pre-existing FILE  → original content rewritten
 *   - pre-existing DIR   → left intact (its prior contents are unknown, so we
 *                          never tear it down; do not track shared dirs you do
 *                          not fully own)
 *   - path created by apply() (file or dir) → removed (dirs recursively)
 *
 * XSPEC-292 §9.2 (T11): CLI transactionality. Used by `init`, `spec-split`, and
 * other commands that perform several dependent writes.
 *
 * @module utils/transaction
 */

import {
  existsSync, statSync, readFileSync, writeFileSync, mkdirSync, rmSync
} from 'node:fs';
import { dirname } from 'node:path';

/**
 * @typedef {Object} TransactionHooks
 * @property {() => (any|Promise<any>)} apply  Performs the file mutations.
 * @property {(result:any) => (boolean|Promise<boolean>)} [verify]
 *   Returns false (or throws) to trigger rollback. Omit to always commit.
 */

/**
 * Run `apply` as a transaction over `paths`.
 *
 * @param {string[]} paths - Absolute paths the operation may create/modify/delete.
 * @param {TransactionHooks} hooks
 * @param {Object} [options]
 * @param {string} [options.label] - Included in the verification error message.
 * @returns {Promise<{result:any, rolledBack:false}>}
 * @throws Re-throws the original error after rolling back. The thrown error has
 *   `rolledBack` set to `true` (rollback succeeded) or `false` (rollback also
 *   failed, with `rollbackError` attached).
 */
export async function withFileTransaction(paths, hooks = {}, options = {}) {
  const { apply, verify } = hooks;
  if (typeof apply !== 'function') {
    throw new TypeError('withFileTransaction requires an apply() function');
  }

  // 1. Backup: snapshot current state of every tracked path.
  const snapshot = (paths || []).map((path) => {
    const existed = existsSync(path);
    const isDir = existed && statSync(path).isDirectory();
    return {
      path,
      existed,
      isDir,
      content: existed && !isDir ? readFileSync(path) : null
    };
  });

  const rollback = () => {
    // Restore deepest paths first so children settle before parents.
    for (const entry of [...snapshot].reverse()) {
      if (entry.existed) {
        if (!entry.isDir) {
          mkdirSync(dirname(entry.path), { recursive: true });
          writeFileSync(entry.path, entry.content);
        }
        // Pre-existing directories are intentionally left untouched.
      } else if (existsSync(entry.path)) {
        // Created during apply() → remove it (recursively for directories).
        rmSync(entry.path, { recursive: true, force: true });
      }
    }
  };

  let result;
  try {
    // 2. Apply.
    result = await apply();

    // 3. Verify.
    if (typeof verify === 'function') {
      const ok = await verify(result);
      if (ok === false) {
        const err = new Error(
          `Transaction verification failed${options.label ? ` for ${options.label}` : ''}`
        );
        err.code = 'TRANSACTION_VERIFY_FAILED';
        throw err;
      }
    }
  } catch (err) {
    // 4. Rollback.
    try {
      rollback();
      err.rolledBack = true;
    } catch (rollbackErr) {
      err.rolledBack = false;
      err.rollbackError = rollbackErr;
    }
    throw err;
  }

  return { result, rolledBack: false };
}
