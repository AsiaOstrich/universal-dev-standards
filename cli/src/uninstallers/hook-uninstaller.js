import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Remove UDS-related lines from .husky/pre-commit
 * @param {string} projectPath - Project root path
 * @param {Object} options - { dryRun: boolean }
 * @returns {Object} { removed: string[], skipped: string[], errors: string[] }
 */
export function uninstallHook(projectPath, options = {}) {
  const { dryRun = false } = options;
  const result = { removed: [], skipped: [], errors: [] };
  const hookPath = join(projectPath, '.husky', 'pre-commit');

  if (!existsSync(hookPath)) {
    result.skipped.push('.husky/pre-commit (not found)');
    return result;
  }

  try {
    const content = readFileSync(hookPath, 'utf-8');
    const lines = content.split('\n');
    const udsPattern = /uds\s+check|checkin-standards/;
    const filteredLines = lines.filter(line => !udsPattern.test(line));

    if (filteredLines.length === lines.length) {
      result.skipped.push('.husky/pre-commit (no UDS lines found)');
      return result;
    }

    if (dryRun) {
      result.removed.push('.husky/pre-commit (UDS check lines)');
      return result;
    }

    writeFileSync(hookPath, filteredLines.join('\n'), 'utf-8');
    result.removed.push('.husky/pre-commit (UDS check lines)');
  } catch (error) {
    result.errors.push(`.husky/pre-commit — ${error.message}`);
  }

  return result;
}
