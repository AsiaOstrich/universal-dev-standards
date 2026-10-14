/**
 * Project-relative paths as the user sees them (XSPEC-486 R4).
 *
 * The reconciler names every file it plans, writes or fails on by a path relative to the project. The standards rows
 * were already written with `/`; the skill and command rows came from `path.join`, so on Windows they read
 * `.claude\skills\x` next to `.standards/y` in the same plan and error list. One rule for all of them: `/`.
 */

import path from 'path';

/**
 * @param {string} projectPath - Project root
 * @param {string} absPath - A path under the project (a path outside it is returned as it is: it is not "relative")
 * @param {{ sep: string }} [pathModule] - The path flavour that built `absPath` (a test passes `path.win32`)
 * @returns {string} The path relative to the project, with `/` between the parts
 */
export function projectRelative(projectPath, absPath, pathModule = path) {
  if (!absPath.startsWith(projectPath)) return absPath;
  let rel = absPath.slice(projectPath.length);
  if (rel.startsWith('/') || rel.startsWith('\\')) rel = rel.slice(1);
  // Only where `\` is the separator: on POSIX a backslash is a legal character of a file name.
  return pathModule.sep === '\\' ? rel.split('\\').join('/') : rel;
}
