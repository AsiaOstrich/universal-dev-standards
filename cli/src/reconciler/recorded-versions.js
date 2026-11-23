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
import { shouldRecordShipped } from '../utils/downgrade-guard.js';

/**
 * Set `skills.version` and `commands.version` to the shipped version for each that is installed (not a marketplace install).
 * Forward only: a record that is NEWER than the shipped version stays (an older uds must not move it back; #308).
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
    if (record?.installed === true && record.location !== 'marketplace' && record.version !== shipped && shouldRecordShipped(record.version, shipped)) {
      manifest[kind] = { ...record, version: shipped }; // [mutation-anchor:align-version]
      changed = true;
    }
  }
  return { manifest, changed };
}

/**
 * Set `upstream.version` (and the date it was recorded) to the standards version this UDS ships (XSPEC-482 R6).
 *
 * The same reasoning as for skills and commands above: when a reconcile finds nothing to do, every standard file is exactly
 * what this UDS ships, so the version recorded for the standards is the shipped one. Only a reconcile that EXECUTED a plan
 * recorded it, so a project whose files were already current kept the version of the UDS that installed them; it surfaced
 * once `uds init` left a project with nothing for the first `--apply` to do (the XSPEC-382 R5 end-to-end test seeds an old
 * version and expects `--apply` to move it).
 * Forward only (#308): a project recorded at a NEWER version keeps it. Moving it back made a project a newer UDS installed look
 * consistent at the older version, and hid that older files had been written over it.
 * @param {Object} manifest
 * @returns {{ manifest: Object, changed: boolean }}
 */
export function alignUpstreamVersion(manifest) {
  const shipped = getRepositoryInfo()?.standards?.version;
  if (!shipped || !manifest?.upstream || manifest.upstream.version === shipped) return { manifest, changed: false };
  if (!shouldRecordShipped(manifest.upstream.version, shipped)) return { manifest, changed: false }; // [mutation-anchor:forward-only]
  manifest.upstream = { ...manifest.upstream, version: shipped, installed: new Date().toISOString().split('T')[0] };
  return { manifest, changed: true };
}
