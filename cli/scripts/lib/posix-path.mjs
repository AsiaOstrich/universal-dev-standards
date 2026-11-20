/**
 * Relative paths used as COMPARISON KEYS must use '/' on every platform.
 *
 * Entry lists (package.json `bin`/`main`), baseline files and exclusion regexes are all written with '/'.
 * On Windows `path.relative()` returns '\', so a key built from it never equals the same key read from
 * those lists: 6.16.0-beta.1's CI went red on windows-latest because `bin\uds.js` != `bin/uds.js`,
 * and the entry points were reported as "new unreachable modules".
 *
 * This normalises ONLY the key. Reading a file still uses the real, platform-native path.
 *
 * `pathImpl` is injectable so a test on macOS/Linux can drive `path.win32` and see real backslashes.
 */
import { relative } from 'node:path';

/** @param {string} p */
export const toPosix = (p) => p.replace(/\\/g, '/');

/**
 * @param {string} from
 * @param {string} to
 * @param {{ relative: (from: string, to: string) => string }} [pathImpl]
 */
export const relativePosix = (from, to, pathImpl = { relative }) => toPosix(pathImpl.relative(from, to));
