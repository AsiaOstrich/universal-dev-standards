/**
 * Health Checker - Layer 1: UDS installation diagnostics
 *
 * Validates UDS installation integrity in user's project:
 * - .standards/ directory existence
 * - manifest.json validity
 * - Standard files existence and hash integrity
 * - AI config file references
 *
 * @module utils/health-checker
 * @see docs/specs/system/SPEC-AUDIT-01-standards-audit.md (AC-1)
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { readManifest } from './copier.js';
import { compareFileHash, hasFileHashes } from './hasher.js';
import { SUPPORTED_AI_TOOLS } from '../core/constants.js';

/**
 * Run Layer 1 health check on a UDS installation
 * @param {string} projectPath - Project root path
 * @returns {{ status: 'OK'|'WARNING'|'ERROR', issues: Array<{severity: string, component: string, message: string, fix?: string}> }}
 */
export function runHealthCheck(projectPath) {
  const issues = [];

  // Check 1: .standards/ directory exists
  const standardsDir = join(projectPath, '.standards');
  if (!existsSync(standardsDir)) {
    issues.push({
      severity: 'ERROR',
      component: '.standards/',
      message: 'Directory does not exist',
      fix: 'Run `uds init` to install standards'
    });
    return { status: 'ERROR', issues };
  }

  // Check 2: manifest.json exists and is valid
  const manifest = readManifest(projectPath);
  if (!manifest) {
    issues.push({
      severity: 'ERROR',
      component: 'manifest.json',
      message: 'Missing or invalid manifest file',
      fix: 'Run `uds init` to re-initialize'
    });
    return { status: 'ERROR', issues };
  }

  // Check 3: Validate manifest required fields
  const requiredFields = ['version', 'standards', 'fileHashes'];
  for (const field of requiredFields) {
    if (manifest[field] === undefined || manifest[field] === null) {
      issues.push({
        severity: 'WARNING',
        component: 'manifest.json',
        message: `Missing required field: ${field}`,
        fix: 'Run `uds update` to repair manifest'
      });
    }
  }

  // Check 4: Each standard file in manifest exists
  if (manifest.standards && Array.isArray(manifest.standards)) {
    for (const standardId of manifest.standards) {
      const fileName = standardId.includes('/') ? standardId.split('/').pop() : standardId;
      const filePath = join(standardsDir, fileName);
      if (!existsSync(filePath)) {
        issues.push({
          severity: 'WARNING',
          component: fileName,
          message: 'Standard file listed in manifest but missing from .standards/',
          fix: 'Run `uds check --restore-missing` to restore'
        });
      }
    }
  }

  // Check 5: File hash integrity
  if (hasFileHashes(manifest)) {
    const hashIssues = checkFileHashes(projectPath, manifest);
    issues.push(...hashIssues);
  }

  // Check 6: AI config file references
  const configIssues = checkAiConfigReferences(projectPath, manifest);
  issues.push(...configIssues);

  // Determine overall status
  const hasErrors = issues.some(i => i.severity === 'ERROR');
  const hasWarnings = issues.some(i => i.severity === 'WARNING');
  const status = hasErrors ? 'ERROR' : hasWarnings ? 'WARNING' : 'OK';

  return { status, issues };
}

/**
 * Check file hashes against manifest
 * @param {string} projectPath
 * @param {Object} manifest
 * @returns {Array} issues found
 */
function checkFileHashes(projectPath, manifest) {
  const issues = [];
  let unchangedCount = 0;
  let modifiedCount = 0;
  let missingCount = 0;

  for (const [relativePath, hashInfo] of Object.entries(manifest.fileHashes)) {
    const fullPath = join(projectPath, relativePath);
    const status = compareFileHash(fullPath, hashInfo);

    switch (status) {
      case 'unchanged':
        unchangedCount++;
        break;
      case 'modified':
        modifiedCount++;
        break;
      case 'missing':
        missingCount++;
        issues.push({
          severity: 'WARNING',
          component: relativePath,
          message: 'File missing (tracked in manifest)',
          fix: 'Run `uds check --restore-missing` to restore'
        });
        break;
    }
  }

  // Add summary as INFO
  if (unchangedCount > 0 || modifiedCount > 0 || missingCount > 0) {
    issues.push({
      severity: 'INFO',
      component: '.standards/',
      message: `${unchangedCount + modifiedCount + missingCount} files tracked: ${unchangedCount} intact, ${modifiedCount} modified, ${missingCount} missing`
    });
  }

  return issues;
}

/**
 * Check that AI config files exist and reference .standards/
 * @param {string} projectPath
 * @param {Object} manifest
 * @returns {Array} issues found
 */
function checkAiConfigReferences(projectPath, manifest) {
  const issues = [];
  const configuredTools = manifest.aiTools || [];

  if (configuredTools.length === 0) {
    return issues;
  }

  for (const toolName of configuredTools) {
    const toolConfig = SUPPORTED_AI_TOOLS[toolName];
    if (!toolConfig) continue;

    const configPath = join(projectPath, toolConfig.file);

    // Check if config file exists
    if (!existsSync(configPath)) {
      issues.push({
        severity: 'WARNING',
        component: toolConfig.file,
        message: `AI config file for ${toolConfig.name} not found`,
        fix: 'Run `uds update --integrations-only` to regenerate'
      });
      continue;
    }

    // Check if config file references .standards/
    try {
      const content = readFileSync(configPath, 'utf-8');
      if (!content.includes('.standards/') && !content.includes('.standards\\')) {
        issues.push({
          severity: 'WARNING',
          component: toolConfig.file,
          message: `AI config for ${toolConfig.name} does not reference .standards/`,
          fix: 'Run `uds update --integrations-only` to regenerate'
        });
      }
    } catch {
      issues.push({
        severity: 'WARNING',
        component: toolConfig.file,
        message: `Cannot read AI config file for ${toolConfig.name}`,
        fix: 'Run `uds update --integrations-only` to regenerate'
      });
    }
  }

  return issues;
}

/**
 * Get the count of tracked files from a manifest
 * @param {Object} manifest
 * @returns {number}
 */
export function getTrackedFileCount(manifest) {
  if (!manifest || !manifest.fileHashes) return 0;
  return Object.keys(manifest.fileHashes).length;
}
