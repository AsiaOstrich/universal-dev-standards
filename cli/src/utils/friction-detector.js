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

  // Build a filename -> canonical id index from the registry. AI configs
  // reference a standard by its canonical id (e.g. `.standards/ai-agreement`),
  // which often diverges from the installed filename: most files carry a
  // `-standards` suffix the id drops, and a few diverge entirely
  // (error-codes.ai.yaml -> id error-code-standards). Matching only on the
  // filename therefore produced false "unused" findings whose remediation is
  // `uds uninstall` — i.e. it could remove standards that are in active use. (#125)
  const allStdsFriction = getAllStandards();
  const frictionFormat = manifest.format || 'ai';
  const fileNameToId = new Map();
  for (const entry of allStdsFriction) {
    const src = getStandardSource(entry, frictionFormat) || getStandardSource(entry, 'human');
    if (src) fileNameToId.set(src.split('/').pop(), entry.id);
  }

  // Resolve each manifest standard to its canonical id + filename
  // (handles both ID format and legacy path format)
  const standardRefs = (manifest.standards || []).map(s => {
    let id;
    let fileName;
    if (!s.includes('/') && !s.includes('.')) {
      // ID format: the entry itself is the id; resolve filename via registry
      id = s;
      const entry = allStdsFriction.find(r => r.id === s);
      const src = entry ? getStandardSource(entry, frictionFormat) : null;
      fileName = src ? src.split('/').pop() : s;
    } else {
      // Path format: derive filename, then look up canonical id
      fileName = s.split('/').pop();
      id = fileNameToId.get(fileName) || null;
    }
    return { id, fileName };
  });

  for (const { id, fileName } of standardRefs) {
    const baseName = fileName.replace(/\.ai\.yaml$/, '').replace(/\.md$/, '');
    // Candidate reference tokens, canonical id first. The trailing
    // `-standards` strip is a defensive fallback for standards absent from the
    // registry. A match on any token means the standard is referenced — erring
    // toward "referenced" is the safe direction (avoid uninstall-driven data loss).
    const candidates = [id, fileName, baseName, baseName.replace(/-standards$/, '')]
      .filter(Boolean);
    const referenced = candidates.some(token => allConfigText.includes(token));

    if (!referenced) {
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

  // From fileHashes (normalize separators so Windows-written manifests match)
  if (manifest.fileHashes) {
    for (const key of Object.keys(manifest.fileHashes)) {
      if (key.startsWith('.standards/') || key.startsWith('.standards\\')) {
        trackedFiles.add(key.replace(/^\.standards[/\\]/, '').replaceAll('\\', '/'));
      }
    }
  }

  // Always exclude UDS-managed files that are not hash-tracked
  trackedFiles.add('manifest.json');
  trackedFiles.add('release-config.yaml'); // written by `uds config` (#115)

  // Scan .standards/ recursively — option standards live in subdirectories
  // such as .standards/options/, which a flat readdir reports as an
  // orphaned "options" entry (#115)
  const actualFiles = collectRelativeFilePaths(standardsDir)
    .filter(f => f !== 'manifest.json');

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

/**
 * Recursively list files under a directory as '/'-separated relative paths
 * @param {string} baseDir
 * @param {string} prefix
 * @param {Array<string>} acc
 * @returns {Array<string>}
 */
function collectRelativeFilePaths(baseDir, prefix = '', acc = []) {
  let entries;
  try {
    entries = readdirSync(baseDir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      collectRelativeFilePaths(join(baseDir, entry.name), relPath, acc);
    } else {
      acc.push(relPath);
    }
  }
  return acc;
}
