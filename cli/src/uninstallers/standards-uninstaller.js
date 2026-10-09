import { existsSync, readdirSync, rmdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { classifyStandardsFiles, computeFileHash } from '../utils/hasher.js';

/**
 * Uninstall the files UDS wrote into .standards/
 *
 * `.standards/` is a folder the adopter may add files to (UDS's own docs invite
 * teams to), so this removes only what UDS can PROVE it wrote and nobody has
 * changed since: a file the manifest records (`fileHashes`, or `provenance`)
 * whose content still matches its recorded hash. A file with no record, or edited
 * since, is kept and said so. The manifest goes last, and the folder only when
 * nothing else is in it. The same rule `uds uninstall` applies to skills, hook
 * scripts and integration files.
 *
 * This used to `rmSync` the whole folder, which took the adopter's own files
 * with it.
 *
 * @param {string} projectPath - Project root path
 * @param {Object} options - { dryRun: boolean, manifest: Object } (the manifest says which files UDS wrote)
 * @returns {Object} { removed: string[], skipped: string[], errors: string[] }
 */
export function uninstallStandards(projectPath, options = {}) {
  const { dryRun = false, manifest = null } = options;
  const result = { removed: [], skipped: [], errors: [] };
  const standardsDir = join(projectPath, '.standards');

  if (!existsSync(standardsDir)) {
    result.skipped.push('.standards/ (not found)');
    return result;
  }
  if (!manifest) {
    result.skipped.push('.standards/ — kept: there is no manifest to say which files UDS wrote');
    return result;
  }

  const census = classifyStandardsFiles(projectPath, manifest);
  const toRemove = [];
  const changed = [];
  for (const rel of census.udsOwned) {
    const record = manifest.fileHashes && manifest.fileHashes[rel];
    const file = join(projectPath, ...rel.split('/'));
    if (record && record.hash) {
      const now = computeFileHash(file);
      if (!now || now.hash !== record.hash) { changed.push(rel); continue; }
    }
    toRemove.push(file);
  }
  const notUds = [...census.foreign, ...census.unknown];
  const kept = [...changed, ...notUds];
  const manifestFile = join(standardsDir, 'manifest.json');
  const count = toRemove.length + (existsSync(manifestFile) ? 1 : 0);

  const describe = (wholeFolderGone) => `.standards/ (${count} file(s) UDS wrote${wholeFolderGone ? '' : '; folder kept: it still holds files that are not UDS\'s'})`;
  const keptNote = `.standards/ — kept ${kept.length} file(s) UDS did not write or that changed since: ${kept.slice(0, 5).join(', ')}${kept.length > 5 ? ', ...' : ''}`;

  if (dryRun) {
    result.removed.push(describe(kept.length === 0));
    if (kept.length > 0) result.skipped.push(keptNote);
    return result;
  }

  try {
    for (const file of toRemove) unlinkSync(file);
    if (existsSync(manifestFile)) unlinkSync(manifestFile);
    removeEmptyFolders(standardsDir);
    result.removed.push(describe(!existsSync(standardsDir)));
    if (kept.length > 0) result.skipped.push(keptNote);
  } catch (error) {
    result.errors.push(`.standards/ — ${error.message}`);
  }

  return result;
}

/** Remove every folder under `dir` that is empty, deepest first, then `dir` itself if it ends up empty. */
function removeEmptyFolders(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) removeEmptyFolders(join(dir, entry.name));
  }
  if (readdirSync(dir).length === 0) rmdirSync(dir);
}
