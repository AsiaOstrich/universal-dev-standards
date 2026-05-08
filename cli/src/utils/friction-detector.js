/**
 * Friction Detector - Layer 2b: Standard friction analysis
 *
 * Detects potential standard issues by:
 * - Diff-based detection: comparing user's files against official hashes
 * - Unused standard detection: standards not referenced in AI configs
 * - Orphan detection: files in .standards/ not tracked in manifest
 *
 * @module utils/friction-detector
 * @see docs/specs/system/SPEC-AUDIT-01-standards-audit.md (AC-3)
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { compareFileHash, hasFileHashes, computeFileHash } from './hasher.js';
import { SUPPORTED_AI_TOOLS } from '../core/constants.js';
import { getAllStandards, getStandardSource } from './registry.js';

/**
 * Run friction detection on a UDS installation
 * @param {string} projectPath - Project root path
 * @param {Object} manifest - Parsed manifest object
 * @returns {Array<{standard: string, type: string, severity: string, diff: string|null, suggestion: string}>}
 */
export function detectFrictions(projectPath, manifest) {
  const frictions = [];

  if (!manifest) return frictions;

  // Type 1: Modified files (HIGH severity)
  const modified = detectModifiedFiles(projectPath, manifest);
  frictions.push(...modified);

  // Type 2: Unused standards (LOW severity)
  const unused = detectUnusedStandards(projectPath, manifest);
  frictions.push(...unused);

  // Type 3: Orphaned files (MEDIUM severity)
  const orphaned = detectOrphanedFiles(projectPath, manifest);
  frictions.push(...orphaned);

  return frictions;
}

/**
 * Detect standards files that were modified by the user
 * @param {string} projectPath
 * @param {Object} manifest
 * @returns {Array}
 */
function detectModifiedFiles(projectPath, manifest) {
  const frictions = [];

  if (!hasFileHashes(manifest)) return frictions;

  for (const [relativePath, hashInfo] of Object.entries(manifest.fileHashes)) {
    // Only check .standards/ files
    if (!relativePath.startsWith('.standards/') && !relativePath.startsWith('.standards\\')) {
      continue;
    }

    const fullPath = join(projectPath, relativePath);
    const status = compareFileHash(fullPath, hashInfo);

    if (status === 'modified') {
      const fileName = relativePath.split('/').pop();
      const currentInfo = computeFileHash(fullPath);
      const sizeDiff = currentInfo ? currentInfo.size - hashInfo.size : 0;
      const diffSummary = sizeDiff !== 0
        ? `Size changed: ${hashInfo.size} → ${currentInfo.size} bytes (${sizeDiff > 0 ? '+' : ''}${sizeDiff})`
        : 'Content changed (same size)';

      frictions.push({
        standard: fileName,
        type: 'modified',
        severity: 'HIGH',
        diff: diffSummary,
        suggestion: 'This modification may indicate the standard needs more flexibility'
      });
    }
  }

  return frictions;
}

/**
 * Detect standards not referenced in any AI config file
 * @param {string} projectPath
 * @param {Object} manifest
 * @returns {Array}
 */
function detectUnusedStandards(projectPath, manifest) {
  const frictions = [];
  const configuredTools = manifest.aiTools || [];

  if (configuredTools.length === 0) return frictions;

  // Collect all AI config file contents
  const configContents = [];
  for (const toolName of configuredTools) {
    const toolConfig = SUPPORTED_AI_TOOLS[toolName];
    if (!toolConfig) continue;

    const configPath = join(projectPath, toolConfig.file);
    try {
      const content = readFileSync(configPath, 'utf-8');
      configContents.push(content);
    } catch {
      // File not readable, skip
    }
  }

  if (configContents.length === 0) return frictions;

  const allConfigText = configContents.join('\n');

  // Check each standard file (handles both ID format and legacy path format)
  const allStdsFriction = getAllStandards();
  const frictionFormat = manifest.format || 'ai';
  const standardFiles = (manifest.standards || []).map(s => {
    if (!s.includes('/') && !s.includes('.')) {
      // ID format: resolve to actual filename
      const entry = allStdsFriction.find(r => r.id === s);
      if (entry) {
        const src = getStandardSource(entry, frictionFormat);
        if (src) return src.split('/').pop();
      }
      return s;
    }
    return s.split('/').pop();
  });

  for (const fileName of standardFiles) {
    // Check if the filename (without extension) is referenced
    const baseName = fileName.replace(/\.ai\.yaml$/, '').replace(/\.md$/, '');
    if (!allConfigText.includes(fileName) && !allConfigText.includes(baseName)) {
      frictions.push({
        standard: fileName,
        type: 'unused',
        severity: 'LOW',
        diff: null,
        suggestion: 'Not referenced in any AI config file'
      });
    }
  }

  return frictions;
}

/**
 * Detect files in .standards/ not tracked in manifest
 * @param {string} projectPath
 * @param {Object} manifest
 * @returns {Array}
 */
function detectOrphanedFiles(projectPath, manifest) {
  const frictions = [];
  const standardsDir = join(projectPath, '.standards');

  if (!existsSync(standardsDir)) return frictions;

  // Get list of tracked files from manifest
  const trackedFiles = new Set();

  // From fileHashes
  if (manifest.fileHashes) {
    for (const key of Object.keys(manifest.fileHashes)) {
      if (key.startsWith('.standards/') || key.startsWith('.standards\\')) {
        trackedFiles.add(key.replace(/^\.standards[/\\]/, ''));
      }
    }
  }

  // Always exclude manifest.json
  trackedFiles.add('manifest.json');

  // Scan .standards/ directory
  let actualFiles;
  try {
    actualFiles = readdirSync(standardsDir).filter(f => f !== 'manifest.json');
  } catch {
    return frictions;
  }

  for (const fileName of actualFiles) {
    if (!trackedFiles.has(fileName)) {
      frictions.push({
        standard: fileName,
        type: 'orphaned',
        severity: 'MEDIUM',
        diff: null,
        suggestion: 'File in .standards/ not tracked in manifest.json'
      });
    }
  }

  return frictions;
}
