import { existsSync, rmSync, rmdirSync, readdirSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';
import {
  getSkillsDirForAgent,
  getCommandsDirForAgent
} from '../config/ai-agent-paths.js';
import { computeFileHash } from '../utils/hasher.js';

/**
 * Uninstall skills and commands
 *
 * Skills and commands go into folders the adopter shares with other things
 * (`.claude/skills/` holds their own skills too; `init` says so where it writes
 * them). So this removes only what UDS can PROVE it wrote and nobody has changed
 * since: a record in the manifest (`skillHashes` / `commandHashes`) plus a
 * matching content hash. The same rule `uds uninstall` already applies to hook
 * scripts and integration files. A file with no record, or edited since, is
 * kept and said so. A folder UDS emptied is removed; a folder that still holds
 * something else is left alone.
 *
 * This used to `rmSync` the whole skills folder, which took the adopter's own
 * skills with it.
 *
 * @param {string} projectPath - Project root path
 * @param {Object} manifest - Parsed manifest object
 * @param {Object} options - { dryRun, includeUserLevel }
 * @returns {Object} { removed: string[], skipped: string[], errors: string[], marketplaceWarnings: string[] }
 */
export function uninstallSkills(projectPath, manifest, options = {}) {
  const result = { removed: [], skipped: [], errors: [], marketplaceWarnings: [] };

  // Check for marketplace-only skills
  if (manifest?.skills?.location === 'marketplace') {
    result.marketplaceWarnings.push(
      'Skills installed via Marketplace must be removed manually in Claude Code.'
    );
  }

  // Process skill installations
  const skillInstalls = manifest?.skills?.installations || [];
  for (const install of skillInstalls) {
    processInstallation(install, 'skills', projectPath, manifest, options, result);
  }

  // Process command installations
  const cmdInstalls = manifest?.commands?.installations || [];
  for (const install of cmdInstalls) {
    processInstallation(install, 'commands', projectPath, manifest, options, result);
  }

  return result;
}

/**
 * The files the manifest says UDS wrote into one installation's folder.
 * Skill records are keyed `<agent>/<level>/<skill>/<file>`; command records
 * `<agent>/<file>` (they carry no level).
 * @returns {Array<{ rel: string, hash: string }>} path inside the folder (forward slashes) and recorded hash
 */
function recordedFiles(manifest, type, agent, level) {
  const table = (type === 'skills' ? manifest?.skillHashes : manifest?.commandHashes) || {};
  const prefix = type === 'skills' ? `${agent}/${level}/` : `${agent}/`;
  return Object.entries(table)
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, info]) => ({ rel: key.slice(prefix.length), hash: info && info.hash }));
}

/** Remove `dir` if nothing is left in it. Returns whether it is gone. */
function removeIfEmpty(dir) {
  try {
    if (readdirSync(dir).length > 0) return false;
    rmdirSync(dir);
    return true;
  } catch {
    return false;
  }
}

/**
 * Process a single skill/command installation for removal
 */
function processInstallation(install, type, projectPath, manifest, options, result) {
  const { dryRun = false, includeUserLevel = false } = options;
  const { agent, level } = install;

  // Determine directory getter
  const getDirFn = type === 'skills' ? getSkillsDirForAgent : getCommandsDirForAgent;

  const dir = getDirFn(agent, level || 'project', projectPath);
  if (!dir) {
    result.skipped.push(`${type}/${agent} (path not resolved)`);
    return;
  }

  const isUserLevel = level === 'user';
  const label = `${type}/${agent} [${level || 'project'}]`;

  // Skip user-level unless explicitly included
  if (isUserLevel && !includeUserLevel) {
    result.skipped.push(`${label} (user-level, use --all to include)`);
    return;
  }

  if (!existsSync(dir)) {
    result.skipped.push(`${label} (not found)`);
    return;
  }

  const records = recordedFiles(manifest, type, agent, level || 'project');
  if (records.length === 0) {
    result.skipped.push(`${label} — kept ${dir}: the manifest records no file UDS wrote there, so UDS cannot prove which are its own`);
    return;
  }

  const toRemove = [];
  const changed = [];
  for (const { rel, hash } of records) {
    const file = join(dir, ...rel.split('/'));
    if (!existsSync(file)) continue;
    const now = computeFileHash(file);
    if (now && hash && now.hash === hash) toRemove.push(file);
    else changed.push(rel);
  }

  if (dryRun) {
    result.removed.push(`${label} → ${dir} (${toRemove.length} file(s) UDS wrote)`);
    if (changed.length > 0) result.skipped.push(`${label} — would keep ${changed.length} file(s) changed since UDS wrote them`);
    return;
  }

  try {
    const touched = new Set();
    for (const file of toRemove) {
      unlinkSync(file);
      touched.add(dirname(file));
    }
    // UDS's own bookkeeping for the folder (written by the skills installer, never hashed): go with the last of its files.
    if (changed.length === 0) {
      const marker = join(dir, '.manifest.json');
      if (existsSync(marker)) rmSync(marker, { force: true });
    }
    // Folders UDS emptied, deepest first, then the installation folder itself.
    for (const d of [...touched].sort((a, b) => b.length - a.length)) {
      if (d !== dir) removeIfEmpty(d);
    }
    const gone = removeIfEmpty(dir);
    result.removed.push(`${label} → ${dir} (${toRemove.length} file(s) UDS wrote${gone ? '' : '; folder kept: it still holds files that are not UDS\'s'})`);
    if (changed.length > 0) result.skipped.push(`${label} — kept ${changed.length} file(s) changed since UDS wrote them`);
  } catch (error) {
    result.errors.push(`${label} — ${error.message}`);
  }
}
