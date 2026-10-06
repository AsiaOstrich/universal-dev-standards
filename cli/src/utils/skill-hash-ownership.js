/**
 * Which `manifest.skillHashes` records really describe files UDS installed.
 *
 * A record is `<agent>/<level>/<skill>/<file>`. It is UDS's only if `<skill>` is a skill UDS ships.
 * Anything else got there because an older installer hashed the whole skills folder (XSPEC-454 R2):
 * the adopter's own skills, the `agents/` / `workflows/` / `_shared/` folders an old CLI copied in by
 * mistake (which a later `uds update` deletes — leaving the record behind), and UDS's own
 * `.manifest.json` bookkeeping file. None of those are skills UDS can vouch for, so none of them may
 * decide whether `uds check` says the project is compliant.
 *
 * @module utils/skill-hash-ownership
 */

import { getAvailableSkillNames } from './skills-installer.js';

/**
 * Below this many shipped skills the source tree did not load; it does not mean UDS stopped shipping
 * skills. Without this guard a broken install would classify every record as foreign and empty the
 * manifest (same guard as pruneRetiredHashes' registry-size check).
 */
const MIN_SHIPPED_SKILLS = 10;

/**
 * @param {string} key - A skillHashes key
 * @param {Set<string>} shipped - Names of the skills UDS ships
 * @returns {boolean}
 */
export function isUdsSkillHashKey(key, shipped) {
  const parts = String(key).split('/');
  // agent / level / skill / at least one file path segment
  return parts.length >= 4 && shipped.has(parts[2]);
}

/**
 * Drop the skillHashes records that do not describe a file UDS installed. Mutates `manifest`.
 *
 * @param {Object} manifest - Project manifest
 * @param {Set<string>} [shipped] - Injection point for tests; defaults to the skills this CLI ships
 * @returns {string[]} The keys that were dropped, sorted
 */
export function pruneForeignSkillHashes(manifest, shipped = new Set(getAvailableSkillNames())) {
  const hashes = manifest?.skillHashes;
  if (!hashes || shipped.size < MIN_SHIPPED_SKILLS) return [];
  const dropped = [];
  for (const key of Object.keys(hashes)) {
    if (isUdsSkillHashKey(key, shipped)) continue;
    delete hashes[key];
    dropped.push(key);
  }
  return dropped.sort();
}

/**
 * Which skill files `uds check` has to report: the missing and the changed ones, as one list.
 *
 * Its result is what the verdict is built from. `uds check` used to throw the integrity result away, so a
 * deleted skill file printed a red ✗ and the run still ended "compliant", exit 0 (XSPEC-454 R2).
 *
 * @param {{ missing?: string[], modified?: string[] }} status - Result of the Skills integrity check
 * @returns {string[]}
 */
export function skillIssuesOf(status) {
  return [...(status?.missing || []), ...(status?.modified || [])];
}
