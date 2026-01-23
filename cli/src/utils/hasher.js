import { createHash } from 'crypto';
import { readFileSync, statSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { UDS_MARKERS } from '../core/constants.js';

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

/**
 * Recursively scan directory for all files
 * @param {string} dirPath - Directory to scan
 * @param {string} basePath - Base path for relative path calculation
 * @returns {string[]} Array of relative paths (always uses forward slashes)
 */
function scanDirectory(dirPath, basePath) {
  const files = [];
  const items = readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dirPath, item.name);
    // Calculate relative path by removing basePath prefix
    // Normalize to forward slashes for cross-platform consistency
    const relativePath = fullPath.slice(basePath.length + 1).replace(/\\/g, '/');

    if (item.isDirectory()) {
      files.push(...scanDirectory(fullPath, basePath));
    } else if (item.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * Scan for untracked files in .standards/ and integration locations
 * @param {string} projectPath - Project root path
 * @param {Object} manifest - Manifest object
 * @returns {string[]} Array of relative paths to untracked files
 */
export function scanForUntrackedFiles(projectPath, manifest) {
  const untracked = [];
  const trackedPaths = new Set(Object.keys(manifest.fileHashes || {}));

  // 1. Scan .standards/ directory (excluding manifest.json)
  const standardsDir = join(projectPath, '.standards');
  if (existsSync(standardsDir)) {
    const standardsFiles = scanDirectory(standardsDir, projectPath);
    for (const relPath of standardsFiles) {
      // Skip manifest.json itself
      if (relPath === '.standards/manifest.json' ||
          relPath === '.standards\\manifest.json') {
        continue;
      }
      if (!trackedPaths.has(relPath)) {
        untracked.push(relPath);
      }
    }
  }

  // 2. Scan for known integration files in project root
  const knownIntegrations = [
    '.cursorrules',
    '.windsurfrules',
    '.clinerules',
    '.github/copilot-instructions.md',
    'CLAUDE.md',
    'INSTRUCTIONS.md'
  ];

  for (const intFile of knownIntegrations) {
    const fullPath = join(projectPath, intFile);
    if (existsSync(fullPath) && !trackedPaths.has(intFile)) {
      untracked.push(intFile);
    }
  }

  return untracked;
}

/**
 * Detect file format based on file path
 * @param {string} filePath - File path
 * @returns {'markdown'|'plaintext'} Format type
 */
function detectFormat(filePath) {
  // Plaintext rules files
  if (filePath.endsWith('.cursorrules') ||
      filePath.endsWith('.windsurfrules') ||
      filePath.endsWith('.clinerules')) {
    return 'plaintext';
  }
  return 'markdown';
}

/**
 * Extract content between UDS markers from file content
 * @param {string} content - File content
 * @param {'markdown'|'plaintext'} format - Format type
 * @returns {{before: string, blockContent: string, after: string}} Extracted parts
 */
function extractBlockContent(content, format) {
  const markers = UDS_MARKERS[format] || UDS_MARKERS.markdown;
  const startIdx = content.indexOf(markers.start);
  const endIdx = content.indexOf(markers.end);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return { before: content, blockContent: '', after: '' };
  }

  return {
    before: content.substring(0, startIdx),
    blockContent: content.substring(startIdx + markers.start.length, endIdx).trim(),
    after: content.substring(endIdx + markers.end.length)
  };
}

/**
 * Compute hash for UDS marker block content in an integration file
 * This only hashes the content between UDS markers, not user customizations outside the block
 * @param {string} filePath - Absolute file path
 * @returns {Object|null} { blockHash, blockSize, fullHash, fullSize } or null if file doesn't exist or no markers found
 */
export function computeIntegrationBlockHash(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const format = detectFormat(filePath);
    const { blockContent } = extractBlockContent(content, format);

    // If no markers found, return null (this file may not have UDS markers)
    if (!blockContent) {
      return null;
    }

    const blockHash = createHash('sha256').update(blockContent).digest('hex');
    const fullHash = createHash('sha256').update(content).digest('hex');
    const stats = statSync(filePath);

    return {
      blockHash: `sha256:${blockHash}`,
      blockSize: Buffer.byteLength(blockContent, 'utf-8'),
      fullHash: `sha256:${fullHash}`,
      fullSize: stats.size
    };
  } catch {
    return null;
  }
}

/**
 * Compare integration block hash with stored hash info
 * @param {string} filePath - Absolute file path
 * @param {Object} storedInfo - Stored hash info from manifest
 * @param {string} storedInfo.blockHash - Stored block hash
 * @param {number} storedInfo.blockSize - Stored block size in bytes
 * @returns {'unchanged'|'modified'|'missing'|'no_markers'} Block status
 */
export function compareIntegrationBlockHash(filePath, storedInfo) {
  if (!existsSync(filePath)) {
    return 'missing';
  }

  const current = computeIntegrationBlockHash(filePath);
  if (!current) {
    return 'no_markers';
  }

  // Compare block hash and size
  if (current.blockSize !== storedInfo.blockSize) {
    return 'modified';
  }

  if (current.blockHash !== storedInfo.blockHash) {
    return 'modified';
  }

  return 'unchanged';
}

/**
 * Compute hashes for all files in a directory recursively
 * @param {string} dirPath - Directory to scan
 * @param {string} baseKey - Base key prefix for hash map entries
 * @returns {Object} Map of key to { hash, size, installedAt }
 */
export function computeDirectoryHashes(dirPath, baseKey = '') {
  const hashes = {};
  const now = new Date().toISOString();

  if (!existsSync(dirPath)) {
    return hashes;
  }

  const files = scanDirectory(dirPath, dirPath);

  for (const relativePath of files) {
    const fullPath = join(dirPath, relativePath);
    const hashInfo = computeFileHash(fullPath);

    if (hashInfo) {
      // Build key: baseKey/relativePath (using forward slashes for consistency)
      const key = baseKey ? `${baseKey}/${relativePath}` : relativePath;
      hashes[key] = {
        ...hashInfo,
        installedAt: now
      };
    }
  }

  return hashes;
}

/**
 * Compare directory contents against stored hashes
 * @param {string} dirPath - Directory to check
 * @param {Object} storedHashes - Map of key to { hash, size }
 * @param {string} baseKey - Base key prefix used when computing hashes
 * @returns {Object} { unchanged: [], modified: [], missing: [], added: [] }
 */
export function compareDirectoryHashes(dirPath, storedHashes, baseKey = '') {
  const result = {
    unchanged: [],
    modified: [],
    missing: [],
    added: []
  };

  // Get current files
  const currentHashes = computeDirectoryHashes(dirPath, baseKey);
  const currentKeys = new Set(Object.keys(currentHashes));
  const storedKeys = new Set(Object.keys(storedHashes));

  // Check stored files
  for (const key of storedKeys) {
    if (!currentKeys.has(key)) {
      result.missing.push(key);
    } else {
      const stored = storedHashes[key];
      const current = currentHashes[key];

      if (stored.hash === current.hash && stored.size === current.size) {
        result.unchanged.push(key);
      } else {
        result.modified.push(key);
      }
    }
  }

  // Check for added files
  for (const key of currentKeys) {
    if (!storedKeys.has(key)) {
      result.added.push(key);
    }
  }

  return result;
}
