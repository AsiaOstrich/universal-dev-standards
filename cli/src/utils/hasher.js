import { createHash } from 'crypto';
import { readFileSync, statSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Compute SHA-256 hash for a file
 * @param {string} filePath - Absolute file path
 * @returns {Object|null} { hash, size } or null if file doesn't exist
 */
export function computeFileHash(filePath) {
  try {
    const content = readFileSync(filePath);
    const hash = createHash('sha256').update(content).digest('hex');
    const stats = statSync(filePath);
    return {
      hash: `sha256:${hash}`,
      size: stats.size
    };
  } catch {
    return null;
  }
}

/**
 * Compare file hash with stored hash info
 * @param {string} filePath - Absolute file path
 * @param {Object} storedInfo - Stored hash info from manifest
 * @param {string} storedInfo.hash - Stored hash (format: 'sha256:hexvalue')
 * @param {number} storedInfo.size - Stored file size in bytes
 * @returns {'unchanged'|'modified'|'missing'} File status
 */
export function compareFileHash(filePath, storedInfo) {
  if (!existsSync(filePath)) {
    return 'missing';
  }

  const current = computeFileHash(filePath);
  if (!current) {
    return 'missing';
  }

  // Quick check: compare size first
  if (current.size !== storedInfo.size) {
    return 'modified';
  }

  // Full check: compare hash
  if (current.hash !== storedInfo.hash) {
    return 'modified';
  }

  return 'unchanged';
}

/**
 * Compute hashes for multiple files
 * @param {string[]} filePaths - Array of absolute file paths
 * @returns {Object} Map of relative path to hash info
 */
export function computeFileHashes(filePaths) {
  const hashes = {};
  const now = new Date().toISOString();

  for (const filePath of filePaths) {
    const result = computeFileHash(filePath);
    if (result) {
      hashes[filePath] = {
        ...result,
        installedAt: now
      };
    }
  }

  return hashes;
}

/**
 * Check if manifest has file hashes (for backward compatibility)
 * @param {Object} manifest - Manifest object
 * @returns {boolean} True if manifest has fileHashes
 */
export function hasFileHashes(manifest) {
  return !!(manifest.fileHashes && Object.keys(manifest.fileHashes).length > 0);
}

/**
 * Get file status summary from manifest
 * @param {string} projectPath - Project root path
 * @param {Object} manifest - Manifest object with fileHashes
 * @returns {Object} { unchanged: [], modified: [], missing: [], noHash: [] }
 */
export function getFileStatusSummary(projectPath, manifest) {
  const summary = {
    unchanged: [],
    modified: [],
    missing: [],
    noHash: []
  };

  if (!hasFileHashes(manifest)) {
    // Legacy manifest - check existence only
    const allFiles = [
      ...manifest.standards.map(s => ({
        source: s,
        target: join('.standards', s.split('/').pop())
      })),
      ...manifest.extensions.map(e => ({
        source: e,
        target: join('.standards', e.split('/').pop())
      })),
      ...manifest.integrations.map(i => ({
        source: i,
        target: i
      }))
    ];

    for (const file of allFiles) {
      const fullPath = join(projectPath, file.target);
      if (existsSync(fullPath)) {
        summary.noHash.push(file.target);
      } else {
        summary.missing.push(file.target);
      }
    }

    return summary;
  }

  // Check each file with hash
  for (const [relativePath, hashInfo] of Object.entries(manifest.fileHashes)) {
    const fullPath = join(projectPath, relativePath);
    const status = compareFileHash(fullPath, hashInfo);

    switch (status) {
      case 'unchanged':
        summary.unchanged.push(relativePath);
        break;
      case 'modified':
        summary.modified.push(relativePath);
        break;
      case 'missing':
        summary.missing.push(relativePath);
        break;
    }
  }

  return summary;
}
