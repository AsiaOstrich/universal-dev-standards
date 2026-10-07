/**
 * Available-but-not-installed standards (XSPEC-458 R1).
 *
 * ONE definition, used by three commands. `uds update` (the old path's "new standards" list,
 * `--plan`/`--apply`'s "available upstream" section, `--add-standard`), `uds check`'s one-line
 * count and `uds audit --friction` all ask this module and nothing else. Before this existed the
 * old path had its own copy inside update.js and the reconciler path had none: `--apply` printed
 * a green "everything is up to date" for a project that was missing a standard UDS ships.
 *
 * What counts as "available but not installed"
 * --------------------------------------------
 * A registry standard that
 *   1. is in a category `uds init` installs (reference, skill — see OFFERED_CATEGORIES),
 *   2. has a source file in the project's `manifest.format` (a skill-only entry has none), and
 *   3. is not already in `manifest.standards` (matched by file name, so an ID-format entry
 *      and a path-format entry such as `ai/standards/x.ai.yaml` both count as installed).
 * That is exactly the set the old `checkNewStandards()` computed; it now calls this.
 *
 * What does NOT count, and is reported instead of being dropped (`notOffered`)
 * ----------------------------------------------------------------------------
 * Every other registry category (core, testing, security, deployment, operations, extension,
 * integration, template). `uds init` has never installed them, so for a project they are not
 * "new upstream" — they were never in the offer. Why, per category, is in CATEGORY_NOTES.
 * They are still returned (with a reason) so no command can silently pretend they do not exist.
 *
 * Manifest fields that look like they should matter, and do not (measured 2026-10-07):
 *   - `level` — a manifest written by 6.11.0 carries it only as a leftover snapshot inside
 *     `integrationConfigs[<file>].level`; no code reads it to decide what to install, the generator
 *     never reads `config.level`, and the registry's level system is a deprecated stub (registry.js).
 *     DEAD.
 *   - `profile` — appears nowhere in the CLI or in any manifest. DEAD (it does not exist).
 *   - `contentMode` — LIVE, but only for how the integration file (CLAUDE.md) is rendered
 *     (minimal vs index). It never decides which standards are installed.
 * None of the three enters this computation, on purpose.
 *
 * @module utils/available-standards
 */

import { basename } from 'path';
import { getAllStandards, getStandardSource } from './registry.js';

/** Categories `uds init` installs into `.standards/`. Must match installers/standards-installer.js. */
export const OFFERED_CATEGORIES = Object.freeze(['reference', 'skill']);

/**
 * Categories whose registry entry is not a plain standard file under `.standards/`: they are
 * installed by other means (a language/locale option, a per-tool integration file, a template
 * copy), so `--add-standard` does not install them.
 */
export const INSTALLED_BY_OTHER_MEANS = Object.freeze(['extension', 'integration', 'template']);

/**
 * Why each category outside OFFERED_CATEGORIES is not offered. Written down so the exclusion is a
 * visible decision, not a filter nobody can explain. (Rendered in docs/user/CLI-REFERENCE and the
 * R1 section of the update guide; keep in step with them.)
 */
export const CATEGORY_NOTES = Object.freeze({
  core: 'added to the registry after the installer\'s reference/skill filter was written; never installed by init',
  testing: 'same as core: added later, never installed by init',
  security: 'same as core: added later, never installed by init',
  deployment: 'same as core: added later, never installed by init',
  operations: 'same as core: added later, never installed by init',
  extension: 'installed by a language/framework/locale choice at init, not as a standard',
  integration: 'a per-tool integration file, installed through the AI-tool choice at init',
  template: 'a document template to copy, not a standard file'
});

/**
 * File names (basenames) of the standards a manifest already lists.
 * Handles both legacy path entries ("ai/standards/foo.ai.yaml") and ID entries ("foo").
 * Option paths are skipped: they live under `.standards/options/` and are not standards.
 *
 * @param {Object} manifest
 * @param {Array} [registryStandards]
 * @returns {Set<string>}
 */
export function installedStandardFileNames(manifest, registryStandards = getAllStandards()) {
  const format = manifest.format || 'ai';
  const names = new Set();
  for (const s of (manifest.standards || [])) {
    if (typeof s !== 'string') continue;
    if (s.includes('/options/') || s.startsWith('options/')) continue;
    if (!s.includes('/') && !s.includes('.')) {
      const entry = registryStandards.find(r => r.id === s);
      if (entry) {
        const sourcePath = getStandardSource(entry, format);
        if (sourcePath) names.add(basename(sourcePath));
      }
    } else {
      names.add(basename(s));
    }
  }
  return names;
}

/**
 * One line of description: the first sentence, cut to `max` characters.
 * @param {string} description
 * @param {number} [max]
 * @returns {string}
 */
export function oneLineDescription(description, max = 100) {
  const text = String(description || '').replace(/\s+/g, ' ').trim();
  const firstSentence = text.split(/(?<=[.。])\s/)[0] || text;
  const cut = firstSentence.length > max ? `${firstSentence.slice(0, max - 1).trimEnd()}…` : firstSentence;
  return cut;
}

/**
 * @typedef {Object} AvailableStandard
 * @property {string} id
 * @property {string} category
 * @property {string} description  One line.
 * @property {string} source        Registry source path in the project's format (what the manifest records).
 * @property {string} name          File name under `.standards/`.
 */

/**
 * The single definition of "available but not installed".
 *
 * @param {Object} manifest
 * @returns {{
 *   offered: AvailableStandard[],
 *   notOffered: Array<AvailableStandard & {reason: string, addable: boolean}>,
 *   notOfferedByCategory: Object<string, number>
 * }}
 */
export function getAvailableStandards(manifest) {
  const format = manifest.format || 'ai';
  const registryStandards = getAllStandards();
  const installed = installedStandardFileNames(manifest, registryStandards);

  const offered = [];
  const notOffered = [];
  for (const std of registryStandards) {
    const source = getStandardSource(std, format);
    if (!source) continue; // skill-only entry: no file to install
    const name = basename(source);
    if (installed.has(name)) continue;

    const item = { id: std.id, category: std.category, description: oneLineDescription(std.description), source, name };
    if (OFFERED_CATEGORIES.includes(std.category)) {
      offered.push(item);
    } else {
      notOffered.push({
        ...item,
        reason: CATEGORY_NOTES[std.category] || 'category not installed by init',
        addable: !INSTALLED_BY_OTHER_MEANS.includes(std.category)
      });
    }
  }

  const notOfferedByCategory = {};
  for (const n of notOffered) notOfferedByCategory[n.category] = (notOfferedByCategory[n.category] || 0) + 1;
  return { offered, notOffered, notOfferedByCategory };
}

/** Plain edit distance, enough for "did you mean". */
function editDistance(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = prev[j];
      prev[j] = a[i - 1] === b[j - 1] ? diagonal : 1 + Math.min(diagonal, above, prev[j - 1]);
      diagonal = above;
    }
  }
  return prev[b.length];
}

/**
 * The registry ids nearest to `id` (substring matches first, then by edit distance).
 * @param {string} id
 * @param {number} [limit]
 * @returns {string[]}
 */
export function closestStandardIds(id, limit = 5) {
  const needle = String(id || '').toLowerCase();
  const scored = getAllStandards().map(s => {
    const candidate = s.id.toLowerCase();
    const contains = needle.length >= 3 && (candidate.includes(needle) || needle.includes(candidate));
    return { id: s.id, score: (contains ? 0 : 1000) + editDistance(needle, candidate) };
  });
  scored.sort((x, y) => x.score - y.score || x.id.localeCompare(y.id));
  return scored.slice(0, limit).map(s => s.id);
}

/**
 * Judge one `--add-standard <id>` request against a manifest.
 *
 * status:
 *   'add'          installable now; `source` is what goes into manifest.standards
 *   'installed'    already in manifest.standards (not an error)
 *   'unknown'      not a registry id; `closest` lists the nearest ids
 *   'other-means'  a registry id, but installed through language/integration/template choices
 *   'no-source'    a registry id with no file in the project's format
 *
 * @param {string} id
 * @param {Object} manifest
 * @returns {{status: string, id: string, entry?: Object, source?: string, closest?: string[]}}
 */
export function judgeAddStandard(id, manifest) {
  const format = manifest.format || 'ai';
  const registryStandards = getAllStandards();
  const entry = registryStandards.find(s => s.id === id);
  if (!entry) return { status: 'unknown', id, closest: closestStandardIds(id) };
  if (INSTALLED_BY_OTHER_MEANS.includes(entry.category)) return { status: 'other-means', id, entry };
  const source = getStandardSource(entry, format);
  if (!source) return { status: 'no-source', id, entry };
  if (installedStandardFileNames(manifest, registryStandards).has(basename(source))) {
    return { status: 'installed', id, entry, source };
  }
  return { status: 'add', id, entry, source };
}
