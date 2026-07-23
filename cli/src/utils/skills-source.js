/**
 * Skills source directory resolution — single source of truth.
 *
 * Two modules need to answer "where do the skill files live on this machine?", and they
 * used to answer it separately. `github.js` had its own hardcoded copy pointing at
 * `<cli>/../skills/claude-code`, a layout that no longer exists:
 *
 *   - in a checkout, skills live at `<repo>/skills/<name>/`, with no `claude-code/` level
 *   - in an npm install, they are bundled at `<package>/bundled/skills/<name>/`
 *
 * So `hasLocalSkills()` was permanently false, every install silently fell through to the
 * remote-download path, and that path then failed on files most skills do not have
 * (only 5 of 61 ship a README.md), which failed the install transaction.
 *
 * Keeping the resolution in one module is the point: the bug was not the wrong path,
 * it was the second copy of the path.
 */

import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** CLI package root — `cli/` in a checkout, the package root in an npm install. */
export const CLI_ROOT = join(__dirname, '..', '..');

/** Bundled assets directory, present in npm installs. */
export const BUNDLED_DIR = join(CLI_ROOT, 'bundled');

/**
 * Resolve the skills source directory.
 * Prefers the bundled copy (npm install), falls back to the repo layout (development).
 * @returns {string} Absolute path to the skills source directory
 */
export function getSkillsSourceDir() {
  const bundledPath = join(BUNDLED_DIR, 'skills');
  if (existsSync(bundledPath)) {
    return bundledPath;
  }
  // Development environment fallback: <repo>/skills
  return join(CLI_ROOT, '..', 'skills');
}

/**
 * Whether skill files are available locally, making a remote download unnecessary.
 * @returns {boolean}
 */
export function hasLocalSkillsSource() {
  return existsSync(getSkillsSourceDir());
}
