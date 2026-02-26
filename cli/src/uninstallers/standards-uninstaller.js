import { existsSync, rmSync } from 'fs';
import { join } from 'path';

/**
 * Uninstall .standards/ directory
 * @param {string} projectPath - Project root path
 * @param {Object} options - { dryRun: boolean }
 * @returns {Object} { removed: string[], skipped: string[], errors: string[] }
 */
export function uninstallStandards(projectPath, options = {}) {
  const { dryRun = false } = options;
  const result = { removed: [], skipped: [], errors: [] };
  const standardsDir = join(projectPath, '.standards');

  if (!existsSync(standardsDir)) {
    result.skipped.push('.standards/ (not found)');
    return result;
  }

  if (dryRun) {
    result.removed.push('.standards/');
    return result;
  }

  try {
    rmSync(standardsDir, { recursive: true, force: true });
    result.removed.push('.standards/');
  } catch (error) {
    result.errors.push(`.standards/ — ${error.message}`);
  }

  return result;
}
