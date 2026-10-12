/**
 * The version the manifest records for the skills and the commands (XSPEC-475 R6).
 *
 * When a reconcile leaves nothing to do (or does everything cleanly), the skill and command files are exactly what this UDS
 * ships, so the version recorded for them is the shipped one. It was left at the version of the UDS that installed them, and
 * `uds check` went on saying "Commands: v6.11.0 -> v6.14..." for a project that was in fact current.
 *
 * @module reconciler/recorded-versions
 */

import { getRepositoryInfo } from '../utils/registry.js';

/**
 * Set `skills.version` and `commands.version` to the shipped version for each that is installed (not a marketplace install).
 * Mutates and returns `manifest`; `changed` says whether anything differed.
 * @param {Object} manifest
 * @returns {{ manifest: Object, changed: boolean }}
 */
export function alignRecordedVersions(manifest) {
  const shipped = getRepositoryInfo()?.skills?.version;
  let changed = false;
  if (!shipped) return { manifest, changed };
  for (const kind of ['skills', 'commands']) {
    const record = manifest[kind];
    if (record?.installed === true && record.location !== 'marketplace' && record.version !== shipped) {
      manifest[kind] = { ...record, version: shipped }; // [mutation-anchor:align-version]
      changed = true;
    }
  }
  return { manifest, changed };
}
