/**
 * UDS Declarative State Reconciliation (DSR)
 *
 * Public API — analogous to Terraform's plan/apply workflow:
 *
 *   1. reconcile(projectPath)      — Full pipeline: migrate → scan → diff → execute
 *   2. plan(projectPath)           — Dry-run: returns the plan without executing
 *   3. rollbackLast(projectPath)   — Restore from the most recent backup
 *
 * Usage:
 *   import { reconcile, plan, rollbackLast } from './reconciler/index.js';
 *
 *   // Preview what would change
 *   const { plan } = await plan(projectPath);
 *   console.log(formatPlan(plan));
 *
 *   // Apply changes
 *   const result = await reconcile(projectPath);
 *
 *   // Undo
 *   const rollbackResult = rollbackLast(projectPath);
 */

import { readManifest, needsMigration } from '../core/manifest.js';
import { migrateAndBackfill } from './manifest-migrator.js';
import { calculateDesiredState } from './desired-state-calculator.js';
import { scanActualState, legacyDiscovery } from './actual-state-scanner.js';
import { computeDiff, createEmptyPlan } from './diff-engine.js';
import { executePlan } from './plan-executor.js';
import { rollback } from './backup-manager.js';

/**
 * Full reconciliation pipeline.
 *
 * @param {string} projectPath - Project root
 * @param {Object} [options]
 * @param {boolean} [options.force=false] - Force update even when hashes match
 * @param {boolean} [options.backup=true] - Create backup before applying
 * @param {Function} [options.onAction] - Progress callback
 * @returns {Promise<{
 *   success: boolean,
 *   plan: import('./diff-engine.js').ReconciliationPlan,
 *   execution: import('./plan-executor.js').ExecutionResult | null,
 *   manifest: Object,
 *   errors: string[]
 * }>}
 */
export async function reconcile(projectPath, options = {}) {
  const { force = false, backup = true, onAction } = options;
  const errors = [];

  // Step 1: Get manifest (migrate if needed, or discover from legacy)
  const { manifest, migrationErrors } = await getManifest(projectPath);
  if (migrationErrors.length > 0) errors.push(...migrationErrors);
  if (!manifest) {
    return {
      success: false,
      plan: createEmptyPlan(),
      execution: null,
      manifest: null,
      errors: [...errors, 'No manifest found and legacy discovery failed']
    };
  }

  // Step 2: Calculate desired state
  const desired = calculateDesiredState(projectPath, manifest);

  // Step 3: Scan actual state
  const actual = scanActualState(projectPath, manifest);

  // Step 4: Compute diff
  const reconciliationPlan = computeDiff(desired, actual, { force });

  // Step 5: Execute plan
  if (reconciliationPlan.actions.length === 0) {
    return {
      success: true,
      plan: reconciliationPlan,
      execution: null,
      manifest,
      errors
    };
  }

  const execution = await executePlan(projectPath, reconciliationPlan, manifest, {
    backup,
    onAction
  });

  return {
    success: execution.success,
    plan: reconciliationPlan,
    execution,
    manifest: execution.updatedManifest,
    errors: [
      ...errors,
      ...execution.results.filter(r => !r.success).map(r => r.error || 'Unknown error')
    ]
  };
}

/**
 * Plan-only mode: returns what would change without executing.
 *
 * @param {string} projectPath
 * @param {Object} [options]
 * @param {boolean} [options.force=false]
 * @returns {Promise<{
 *   plan: import('./diff-engine.js').ReconciliationPlan,
 *   manifest: Object,
 *   errors: string[]
 * }>}
 */
export async function plan(projectPath, options = {}) {
  const { force = false } = options;
  const errors = [];

  const { manifest, migrationErrors } = await getManifest(projectPath);
  if (migrationErrors.length > 0) errors.push(...migrationErrors);
  if (!manifest) {
    return {
      plan: createEmptyPlan(),
      manifest: null,
      errors: [...errors, 'No manifest found']
    };
  }

  const desired = calculateDesiredState(projectPath, manifest);
  const actual = scanActualState(projectPath, manifest);
  const reconciliationPlan = computeDiff(desired, actual, { force });

  return { plan: reconciliationPlan, manifest, errors };
}

/**
 * Rollback to the most recent backup (or a specific one).
 *
 * @param {string} projectPath
 * @param {string} [backupId] - Specific backup ID (defaults to most recent)
 * @returns {{ success: boolean, restored: string[], errors: string[] }}
 */
export function rollbackLast(projectPath, backupId) {
  return rollback(projectPath, backupId);
}

/**
 * Internal: get a valid, migrated manifest.
 * Falls back to legacy discovery if no manifest exists.
 */
async function getManifest(projectPath) {
  const migrationErrors = [];

  // Try reading existing manifest
  let manifest = readManifest(projectPath);

  if (manifest) {
    // Migrate if needed
    if (needsMigration(manifest)) {
      const result = migrateAndBackfill(projectPath, { backfillHashes: true });
      if (result.errors.length > 0) migrationErrors.push(...result.errors);
      manifest = result.manifest || manifest;
    }
  } else {
    // No manifest — try legacy discovery
    try {
      const discovery = legacyDiscovery(projectPath);
      manifest = discovery.syntheticManifest;
      migrationErrors.push('No manifest found; reconstructed from legacy discovery');
    } catch (err) {
      migrationErrors.push(`Legacy discovery failed: ${err.message}`);
    }
  }

  return { manifest, migrationErrors };
}

// Re-export for convenience
export { formatPlan } from './diff-engine.js';
export { listBackups } from './backup-manager.js';
export { migrateAndBackfill } from './manifest-migrator.js';
