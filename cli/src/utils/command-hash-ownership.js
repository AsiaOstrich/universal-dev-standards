/**
 * Which `manifest.commandHashes` records `uds check` may hold this project to (XSPEC-454 R2, the
 * Commands half).
 *
 * A record is `<agent>/<file>` (`opencode/commit.md`, `gemini-cli/commit.toml`) with no level in it.
 * Two kinds of record do not describe a file this project's check can vouch for:
 *
 *   - FOREIGN: the name is not a command UDS ships (any more). A retired command whose file is gone is
 *     a "missing" nobody can restore. These are dropped for good by `uds update`.
 *   - ELSEWHERE: the command was installed at user level (`~/.config/opencode/command`), shared by every
 *     project on the machine. The check looks inside the project, so every one of them would read
 *     "missing" — and another project's `uds update` can rewrite them at any time, so "modified" would
 *     be noise too. They are ignored by the check and left in the manifest (user-level update still
 *     refreshes them).
 *
 * Both exist for the same reason the skills ones do: once a missing or changed command file counts toward
 * the verdict, a record that points at nothing this project owns would fail the project for a file
 * nobody can fix.
 *
 * @module utils/command-hash-ownership
 */

import { getAvailableCommandNames } from './skills-installer.js';
import { getCommandFileExtension } from '../config/ai-agent-paths.js';

/** Below this many shipped commands the source tree did not load; never treat that as "UDS ships none". */
const MIN_SHIPPED_COMMANDS = 10;

/**
 * @param {string} key - A commandHashes key
 * @param {Set<string>} shipped - Names of the commands UDS ships (no extension)
 * @returns {boolean}
 */
export function isUdsCommandHashKey(key, shipped) {
  const parts = String(key).split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  const [agent, file] = parts;
  const ext = getCommandFileExtension(agent);
  return file.endsWith(ext) && shipped.has(file.slice(0, -ext.length));
}

/**
 * Drop the commandHashes records for commands UDS does not ship. Mutates `manifest`.
 * @param {Object} manifest
 * @param {Set<string>} [shipped] - Injection point for tests
 * @returns {string[]} The keys dropped, sorted
 */
export function pruneForeignCommandHashes(manifest, shipped = new Set(getAvailableCommandNames())) {
  const hashes = manifest?.commandHashes;
  if (!hashes || shipped.size < MIN_SHIPPED_COMMANDS) return [];
  const dropped = [];
  for (const key of Object.keys(hashes)) {
    if (isUdsCommandHashKey(key, shipped)) continue;
    delete hashes[key];
    dropped.push(key);
  }
  return dropped.sort();
}

/**
 * Agents whose commands are installed, but only outside this project (user level or marketplace).
 * An agent with no recorded installation at all is a legacy manifest and counts as project-level.
 * @param {Object} manifest
 * @returns {Set<string>}
 */
export function agentsWithCommandsOutsideProject(manifest) {
  const levels = new Map(); // agent -> Set of levels
  for (const entry of manifest?.commands?.installations || []) {
    const agent = typeof entry === 'string' ? entry : entry?.agent;
    const level = typeof entry === 'string' ? 'project' : (entry?.level || 'project');
    if (!agent) continue;
    if (!levels.has(agent)) levels.set(agent, new Set());
    levels.get(agent).add(level);
  }
  return new Set([...levels].filter(([, set]) => !set.has('project')).map(([agent]) => agent));
}

/**
 * The part of `manifest.commandHashes` this project's check is responsible for.
 * @param {Object} manifest
 * @returns {{ hashes: Object, ignored: string[] }} `ignored` are the keys set aside as ELSEWHERE
 */
export function projectCommandHashes(manifest) {
  const all = manifest?.commandHashes || {};
  const outside = agentsWithCommandsOutsideProject(manifest);
  const hashes = {};
  const ignored = [];
  for (const [key, info] of Object.entries(all)) {
    if (outside.has(key.split('/')[0])) ignored.push(key);
    else hashes[key] = info;
  }
  return { hashes, ignored };
}

/**
 * The command files `uds check` has to report: missing and modified, as one list. Its result is what the
 * verdict is built from — it used to be discarded, like the Skills one.
 * @param {{ missing?: string[], modified?: string[] }} status
 * @returns {string[]}
 */
export function commandIssuesOf(status) {
  return [...(status?.missing || []), ...(status?.modified || [])];
}
