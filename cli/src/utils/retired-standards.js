/**
 * Standards a manifest still lists although this UDS no longer ships them (dev-platform #302).
 *
 * Two questions, kept apart because the answers differ for a misspelled id:
 *
 * - `isUnknownStandardId`: the registry has no standard of that id. This is the test `uds audit` has always used for its
 *   "retired" note, and the one `uds check` now shares with it so the two commands cannot call the same entry by different names.
 * - `retiredStandardEntries`: of those, the ones `uds update` WILL remove from the manifest, because UDS installed a file
 *   for them (`.standards/<id>.ai.yaml` or `.md`) that it no longer ships. `uds update` deletes that file and drops the entry
 *   with it (plan-executor `dropRetiredStandardEntries`). An id with no such file is a misspelling or something the project
 *   never had; `uds update --apply` leaves it, so `uds check` keeps telling the adopter to delete it by hand.
 *
 * No list of retired ids is kept anywhere: the registry is the single source, so a standard retired tomorrow is covered
 * without touching this file.
 *
 * @module utils/retired-standards
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { getAllStandards } from './registry.js';

/**
 * A bare id (not a path) that no standard in this UDS's registry has.
 * @param {unknown} entry - An item of `manifest.standards`
 * @returns {boolean}
 */
export function isUnknownStandardId(entry) {
  if (typeof entry !== 'string' || entry.length === 0) return false;
  if (entry.includes('/') || entry.includes('.')) return false;
  return !getAllStandards().some((s) => s.id === entry);
}

/**
 * The manifest entries `uds update` will drop: unknown ids whose installed file is left over from the UDS that installed them.
 * @param {Object} manifest
 * @param {string} projectPath
 * @returns {string[]}
 */
export function retiredStandardEntries(manifest, projectPath) {
  const standardsDir = join(projectPath, '.standards');
  return (manifest?.standards || []).filter((entry) =>
    isUnknownStandardId(entry)
    && (existsSync(join(standardsDir, `${entry}.ai.yaml`)) || existsSync(join(standardsDir, `${entry}.md`))));
}
