/**
 * Directory Mapper — Standards-to-Directory Mapping
 *
 * Maps UDS standards to project subdirectories for layered CLAUDE.md generation.
 * Scans the project structure and matches directories against known patterns.
 *
 * @module utils/directory-mapper
 * @see docs/specs/SPEC-LAYERED-001-layered-claudemd.md (REQ-1)
 */

import { readdirSync } from 'fs';
import { join, relative } from 'path';

/**
 * Default mappings from standard IDs to directory glob patterns.
 * Each key is a standard ID, values are directory name patterns to match.
 */
export const DEFAULT_MAPPINGS = {
  'database-standards': ['database', 'db', 'models'],
  'testing': ['tests', 'test', '__tests__'],
  'api-design-standards': ['api', 'routes', 'endpoints'],
  'security-standards': ['auth', 'security'],
  'logging': ['logging', 'logger'],
  'deployment-standards': ['deploy', 'infra', '.github'],
  'containerization-standards': ['docker', 'containers'],
};

// Directories to skip during scanning
const SKIP_DIRS = new Set([
  'node_modules', '.git', '.svn', '.hg', 'dist', 'build',
  '.next', '.nuxt', 'coverage', '.uds', '.standards',
  '.claude', 'vendor', '__pycache__', '.tox', '.venv',
]);

/**
 * Recursively scan project directories (max 3 levels deep).
 * @param {string} baseDir - Project root
 * @param {number} maxDepth - Maximum scan depth
 * @returns {string[]} Relative directory paths
 */
function scanDirectories(baseDir, maxDepth = 3) {
  const dirs = [];

  function walk(dir, depth) {
    if (depth > maxDepth) return;
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (SKIP_DIRS.has(entry.name)) continue;

        const fullPath = join(dir, entry.name);
        const relPath = relative(baseDir, fullPath);
        dirs.push(relPath);
        walk(fullPath, depth + 1);
      }
    } catch {
      // Skip unreadable directories
    }
  }

  walk(baseDir, 0);
  return dirs;
}

/**
 * Map standards to project directories based on DEFAULT_MAPPINGS.
 *
 * Returns an object where:
 * - Keys are standard IDs, values are arrays of matched relative directory paths
 * - `_root` key contains standard IDs that had no directory match
 *
 * @param {string} projectPath - Project root path
 * @param {Object} [customMappings] - Optional custom mappings to merge with defaults
 * @returns {Object} Mapping result
 */
export function mapStandardsToDirectories(projectPath, customMappings = {}) {
  const mappings = { ...DEFAULT_MAPPINGS, ...customMappings };
  const projectDirs = scanDirectories(projectPath);
  const result = {};
  const matchedStandards = new Set();

  for (const [standardId, patterns] of Object.entries(mappings)) {
    const matchedDirs = [];

    for (const dir of projectDirs) {
      const dirName = dir.split('/').pop();
      if (patterns.includes(dirName)) {
        matchedDirs.push(dir);
      }
    }

    if (matchedDirs.length > 0) {
      result[standardId] = matchedDirs;
      matchedStandards.add(standardId);
    }
  }

  // All unmapped standards go to _root
  const allStandards = Object.keys(mappings);
  result._root = allStandards.filter((s) => !matchedStandards.has(s));

  return result;
}
