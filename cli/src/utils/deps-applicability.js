/**
 * When `uds deps --if-present` is allowed to say "not applicable" instead of failing.
 * // implements XSPEC-456 R6
 *
 * `uds deps` exits 1 when there is no package.json, on purpose: a check that examined nothing must not
 * be able to show a pass (the same rule as `clean` in utils/dependency-resolution.js). That makes it
 * awkward in a shared script that also runs in .NET, Python or Go projects, where callers ended up
 * writing `if [ -f package.json ]` around it. `--if-present` is that guard made part of the command
 * AND visible: the run says nothing was checked, in words, and exits 0.
 *
 * @module utils/deps-applicability
 */

import { existsSync } from 'fs';
import { join } from 'path';

/**
 * @param {string} root - Directory `uds deps` would examine
 * @param {boolean} ifPresent - Whether `--if-present` was given
 * @returns {'no-package-json' | null} Why the run is not applicable, or null when it must be run
 */
export function notApplicableReason(root, ifPresent) {
  if (ifPresent && !existsSync(join(root, 'package.json'))) return 'no-package-json';
  return null;
}
