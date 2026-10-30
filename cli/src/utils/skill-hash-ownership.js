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
 * Record what a skills install just wrote, REPLACING the old records of the skills it rewrote.
 *
 * The installer deletes the top-level files a skill no longer ships (`installSingleSkill`, XSPEC-382 R7),
 * and `result.allFileHashes` describes the folder as it is afterwards. Callers used to `Object.assign` that
 * onto `manifest.skillHashes`, which only ever adds and overwrites: the records of the files just deleted
 * stayed, and `uds check` called each of them missing — 15 of them on VibeOps (140 recorded, 125 on disk),
 * and the only thing that cleared them was a hand edit of the manifest. (dev-platform #46)
 *
 * Scope is exactly the skills the installer reports as installed (`<agent>/<level>/<skill>/`). A skill the
 * run did not touch, or one whose install failed, keeps its records: nothing was rewritten there, so the old
 * records still describe the disk.
 *
 * @param {Object} manifest - Project manifest; `skillHashes` is created when absent. Mutated.
 * @param {{ allFileHashes?: Object, installations?: Array<{agent?: string, level?: string, installed?: string[]}> }} result
 *   What `installSkillsToMultipleAgents` returned
 */
export function replaceSkillHashesForInstalled(manifest, result) {
  if (!result?.allFileHashes) return;
  if (!manifest.skillHashes) manifest.skillHashes = {};
  const hashes = manifest.skillHashes;
  for (const inst of result.installations || []) {
    if (!inst?.agent || !inst?.level) continue;
    for (const name of inst.installed || []) {
      const prefix = `${inst.agent}/${inst.level}/${name}/`;
      for (const key of Object.keys(hashes)) {
        if (key.startsWith(prefix)) delete hashes[key];
      }
    }
  }
  Object.assign(hashes, result.allFileHashes);
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
