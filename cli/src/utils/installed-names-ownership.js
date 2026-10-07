/**
 * Which names in `manifest.skills.names` / `manifest.commands.names` UDS can still vouch for.
 * // implements XSPEC-456 R4
 *
 * XSPEC-454 R2 cleaned `skillHashes` and `commandHashes` and left these two lists alone, on the
 * reasoning that an over-long list is harmless. It is not: after `uds update --apply --skills` removed
 * the `_shared`, `agents`, `ai`, `tools` and `workflows` folders an old CLI had copied into the skills
 * folder, the manifest still listed all five as installed skills (61 names for 56 skills), which
 * contradicted both the disk and the release notes' claim that the records were cleaned.
 *
 * The rule is the one XSPEC-454 R2 uses for the hash records: **what UDS can vouch for stays**.
 *   - a skill (command) name stays only if UDS ships a skill (command) of that name;
 *   - when asked to (`checkDisk`), only if it is also present in one of the places the manifest says
 *     it was installed. That second test is skipped when it cannot be made (no install location
 *     recorded, or none of the recorded folders exists): a name list is never emptied because the
 *     tool could not find where to look.
 *
 * Every manifest field that records skill or command NAMES, and what handles it:
 *   skills.names      -> this module (skills)
 *   commands.names    -> this module (commands)
 *   skillHashes       -> utils/skill-hash-ownership.js   (XSPEC-454 R2; the name is the 3rd path segment)
 *   commandHashes     -> utils/command-hash-ownership.js (XSPEC-454 R2; the name is the file stem)
 * `skills.installations` / `commands.installations` record tools and levels, not names, and
 * `installedArtifacts` records only integration files and created directories.
 *
 * @module utils/installed-names-ownership
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { getAvailableSkillNames, getAvailableCommandNames } from './skills-installer.js';
import { MARKETPLACE_NAMES_SENTINEL } from '../core/marketplace-sentinel.js';
import { getSkillsDirForAgent, getCommandsDirForAgent, getCommandFileExtension } from '../config/ai-agent-paths.js';

/** Below these sizes the source tree did not load; never read that as "UDS ships nothing". */
const MIN_SHIPPED = 10;

/** `{ agent, level }` for every recorded installation (strings are legacy project-level entries). */
function installationsOf(section) {
  return (section?.installations || [])
    .map((entry) => (typeof entry === 'string'
      ? { agent: entry, level: 'project' }
      : { agent: entry?.agent, level: entry?.level || 'project' }))
    .filter((entry) => entry.agent);
}

/** Folders a skill of the recorded installations would live in. Empty when the manifest does not say. */
function skillFolders(manifest, projectPath) {
  const dirs = installationsOf(manifest.skills)
    .map(({ agent, level }) => getSkillsDirForAgent(agent, level, projectPath))
    .filter(Boolean);
  if (dirs.length > 0) return dirs;
  // A legacy manifest records no installations, only where the skills went.
  const location = manifest.skills?.location;
  if (location === 'project' || location === 'user') {
    const dir = getSkillsDirForAgent('claude-code', location, projectPath);
    return dir ? [dir] : [];
  }
  return [];
}

/** `[folder, extension]` pairs where a command of the recorded installations would live. */
function commandFolders(manifest, projectPath) {
  return installationsOf(manifest.commands)
    .map(({ agent, level }) => [getCommandsDirForAgent(agent, level, projectPath), getCommandFileExtension(agent)])
    .filter(([dir]) => Boolean(dir));
}

function prune(names, keep) {
  const kept = [];
  const dropped = [];
  for (const name of names) (keep(name) ? kept : dropped).push(name);
  return { kept, dropped: dropped.sort() };
}

/**
 * Drop the names in `manifest.skills.names` that UDS cannot vouch for. Mutates `manifest`.
 *
 * @param {Object} manifest
 * @param {string} projectPath
 * @param {Object} [options]
 * @param {boolean} [options.checkDisk=false] - also require the skill to be present where it was installed
 * @param {Set<string>} [options.shipped] - Injection point for tests; defaults to the skills this CLI ships
 * @returns {string[]} The names dropped, sorted
 */
export function pruneForeignSkillNames(manifest, projectPath, { checkDisk = false, shipped = new Set(getAvailableSkillNames()) } = {}) {
  const names = manifest?.skills?.names;
  if (!Array.isArray(names) || shipped.size < MIN_SHIPPED) return [];
  // Marketplace installs record a sentinel instead of names; there is nothing to prune.
  if (names.includes(MARKETPLACE_NAMES_SENTINEL)) return [];

  const dirs = checkDisk ? skillFolders(manifest, projectPath) : [];
  const diskTestPossible = dirs.some((dir) => existsSync(dir));
  const { kept, dropped } = prune(names, (name) =>
    shipped.has(name) && (!diskTestPossible || dirs.some((dir) => existsSync(join(dir, name)))));
  if (dropped.length > 0) manifest.skills.names = kept;
  return dropped;
}

/**
 * Drop the names in `manifest.commands.names` that UDS cannot vouch for. Mutates `manifest`.
 * Same contract as {@link pruneForeignSkillNames}.
 */
export function pruneForeignCommandNames(manifest, projectPath, { checkDisk = false, shipped = new Set(getAvailableCommandNames()) } = {}) {
  const names = manifest?.commands?.names;
  if (!Array.isArray(names) || shipped.size < MIN_SHIPPED) return [];

  const places = checkDisk ? commandFolders(manifest, projectPath) : [];
  const diskTestPossible = places.some(([dir]) => existsSync(dir));
  const { kept, dropped } = prune(names, (name) =>
    shipped.has(name) && (!diskTestPossible || places.some(([dir, ext]) => existsSync(join(dir, `${name}${ext}`)))));
  if (dropped.length > 0) manifest.commands.names = kept;
  return dropped;
}
