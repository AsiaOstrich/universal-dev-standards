/**
 * Manifest Migrator
 * Wraps migrateManifest() and adds hash backfill for legacy manifests.
 *
 * This module finally calls migrateManifest() — the function that existed
 * but was never invoked during actual upgrades, leaving old manifests
 * stuck on outdated schemas with missing tracking fields.
 */

import { existsSync } from 'fs';
import { join } from 'path';
import {
  readManifest,
  writeManifest,
  migrateManifest,
  needsMigration
} from '../core/manifest.js';
import { computeFileHash, computeIntegrationBlockHash } from '../utils/hasher.js';
import { SUPPORTED_AI_TOOLS } from '../core/constants.js';

/**
 * Migrate manifest to latest schema and backfill missing hashes.
 *
 * @param {string} projectPath - Project root path
 * @param {Object} [options]
 * @param {boolean} [options.dryRun=false] - If true, return migrated manifest without writing
 * @param {boolean} [options.backfillHashes=true] - Whether to backfill missing file hashes
 * @returns {{ manifest: Object, migrated: boolean, backfilled: string[], errors: string[] }}
 */
export function migrateAndBackfill(projectPath, options = {}) {
  const { dryRun = false, backfillHashes = true } = options;
  const result = {
    manifest: null,
    migrated: false,
    backfilled: [],
    errors: []
  };

  // Read existing manifest
  let manifest = readManifest(projectPath);
  if (!manifest) {
    result.errors.push('No manifest found at ' + join(projectPath, '.standards', 'manifest.json'));
    return result;
  }

  // Step 1: Schema migration
  if (needsMigration(manifest)) {
    try {
      manifest = migrateManifest(manifest);
      result.migrated = true;
    } catch (err) {
      result.errors.push(`Schema migration failed: ${err.message}`);
      return result;
    }
  }

  // Step 2: Backfill missing file hashes for tracked standards
  if (backfillHashes) {
    const backfillResult = backfillFileHashes(projectPath, manifest);
    manifest = backfillResult.manifest;
    result.backfilled = backfillResult.backfilled;
    if (backfillResult.errors.length > 0) {
      result.errors.push(...backfillResult.errors);
    }
  }

  // Write if changed and not dry-run
  if (!dryRun && (result.migrated || result.backfilled.length > 0)) {
    try {
      writeManifest(manifest, projectPath);
    } catch (err) {
      result.errors.push(`Failed to write manifest: ${err.message}`);
    }
  }

  result.manifest = manifest;
  return result;
}

/**
 * Backfill missing file hashes for standards listed in manifest.
 *
 * When a manifest was created by an older version (pre-3.1.0) or the
 * hash tracking was incomplete, this scans files that should be tracked
 * and computes hashes for any that are missing.
 *
 * @param {string} projectPath
 * @param {Object} manifest
 * @returns {{ manifest: Object, backfilled: string[], errors: string[] }}
 */
export function backfillFileHashes(projectPath, manifest) {
  const backfilled = [];
  const errors = [];
  const updated = { ...manifest };

  // Ensure hash containers exist
  if (!updated.fileHashes) updated.fileHashes = {};
  if (!updated.skillHashes) updated.skillHashes = {};
  if (!updated.commandHashes) updated.commandHashes = {};
  if (!updated.integrationBlockHashes) updated.integrationBlockHashes = {};

  // Backfill standard file hashes
  for (const standardPath of (updated.standards || [])) {
    const relativePath = standardPath.startsWith('.standards/')
      ? standardPath
      : `.standards/${standardPath}`;
    const absPath = join(projectPath, relativePath);

    if (!updated.fileHashes[relativePath] && existsSync(absPath)) {
      const hashInfo = computeFileHash(absPath);
      if (hashInfo) {
        updated.fileHashes[relativePath] = {
          ...hashInfo,
          installedAt: new Date().toISOString()
        };
        backfilled.push(relativePath);
      }
    }
  }

  // Backfill option file hashes
  if (updated.options) {
    for (const [standardId, optionConfig] of Object.entries(updated.options)) {
      if (!optionConfig) continue;
      for (const [categoryKey, selection] of Object.entries(optionConfig)) {
        const selections = Array.isArray(selection) ? selection : [selection];
        for (const optionId of selections) {
          if (typeof optionId !== 'string') continue;
          const optionPath = `.standards/options/${standardId}/${categoryKey}/${optionId}.ai.yaml`;
          const absPath = join(projectPath, optionPath);
          if (!updated.fileHashes[optionPath] && existsSync(absPath)) {
            const hashInfo = computeFileHash(absPath);
            if (hashInfo) {
              updated.fileHashes[optionPath] = {
                ...hashInfo,
                installedAt: new Date().toISOString()
              };
              backfilled.push(optionPath);
            }
          }
        }
      }
    }
  }

  // Backfill integration block hashes
  for (const toolName of (updated.integrations || [])) {
    const toolConfig = SUPPORTED_AI_TOOLS[toolName];
    if (!toolConfig) continue;
    const filePath = join(projectPath, toolConfig.file);
    if (!updated.integrationBlockHashes[toolConfig.file] && existsSync(filePath)) {
      const blockHash = computeIntegrationBlockHash(filePath);
      if (blockHash) {
        updated.integrationBlockHashes[toolConfig.file] = blockHash;
        backfilled.push(`integration:${toolConfig.file}`);
      }
    }
  }

  return { manifest: updated, backfilled, errors };
}
