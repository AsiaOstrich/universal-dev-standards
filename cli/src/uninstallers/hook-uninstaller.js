import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
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

  // Also handle native .git/hooks/pre-commit (installed by uds init for non-Node projects)
  const nativeHookPath = join(projectPath, '.git', 'hooks', 'pre-commit');
  if (existsSync(nativeHookPath)) {
    try {
      const content = readFileSync(nativeHookPath, 'utf-8');
      const udsPattern = /uds\s+check|checkin-standards|UDS pre-commit hook/;

      if (!udsPattern.test(content)) {
        result.skipped.push('.git/hooks/pre-commit (no UDS lines found)');
      } else if (dryRun) {
        result.removed.push('.git/hooks/pre-commit (UDS native hook)');
      } else {
        // Remove only UDS-related lines, keep other hook content
        const lines = content.split('\n');
        const filtered = lines.filter(line => !udsPattern.test(line));

        // If only shebang remains, remove the file entirely; otherwise rewrite
        const nonEmpty = filtered.filter(l => l.trim() && l.trim() !== '#!/bin/sh');
        if (nonEmpty.length === 0) {
          unlinkSync(nativeHookPath);
          result.removed.push('.git/hooks/pre-commit (UDS native hook, file removed)');
        } else {
          writeFileSync(nativeHookPath, filtered.join('\n'), 'utf-8');
          result.removed.push('.git/hooks/pre-commit (UDS lines removed)');
        }
      }
    } catch (error) {
      result.errors.push(`.git/hooks/pre-commit — ${error.message}`);
    }
  }

  return result;
}
