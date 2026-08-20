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

import { readManifest, writeManifest, needsMigration } from '../core/manifest.js';
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
/**
 * Bring `manifest.fileHashes` in line with files proved byte-identical to what
 * UDS ships (XSPEC-382 R6).
 *
 * Returns the manifest plus a count of entries corrected, or null when nothing
 * needed correcting — so the caller can skip a pointless write.
 *
 * Deliberately narrow. It only ever writes a hash the reconciler computed from
 * disk AFTER proving that disk matches the desired upstream content, so it
 * cannot absorb a hand edit. Widening it to "sync the record to disk" would
 * make `uds check` incapable of ever reporting a modified standard again, which
 * is the one thing that check exists to do.
 */
function reconcileFileHashes(manifest, verifiedPristine) {
  const current = manifest.fileHashes || {};

  // Drop entries 6.7.3 wrote here that do not belong: skill directories and
  // command files are tracked in `skillHashes` / `commandHashes`, and
  // `uds check` validates everything in `fileHashes` with an `isFile()` test,
  // so those entries surfaced as phantom "missing" reports — 52 of them per
  // adopter repo. Fixing the writer does not remove what it already wrote, and
  // there is no other path that would: a bad key is never revisited because
  // nothing on disk corresponds to it. (XSPEC-382 R7)
  const stale = Object.keys(current).filter(
    (k) => k.startsWith('.claude/skills/') || k.startsWith('.claude/commands/')
  );

  if (!verifiedPristine?.length && stale.length === 0) return null;

  const kept = Object.fromEntries(Object.entries(current).filter(([k]) => !stale.includes(k)));
  const corrected = {};
  let count = stale.length;

  for (const entry of verifiedPristine || []) {
    const key = entry.path.replace(/\\/g, '/');
    const recorded = kept[key];
    if (recorded && recorded.hash === entry.hash && recorded.size === entry.size) continue;
    corrected[key] = {
      hash: entry.hash,
      size: entry.size,
      installedAt: new Date().toISOString()
    };
    count++;
  }

  if (count === 0) return null;
  return {
    manifest: { ...manifest, fileHashes: { ...kept, ...corrected } },
    count
  };
}

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

  // Step 4b: correct any stale recorded hashes for files already pristine.
  //
  // This runs BEFORE the empty-plan early return on purpose. A manifest whose
  // only problem is a stale hash produces zero actions, and the old early
  // return meant it was never written — so `uds check` reported a byte-perfect
  // file as modified with no path back through normal use. (XSPEC-382 R6)
  // `manifest` above is destructured const, so carry the corrected copy in its
  // own binding rather than reassigning it.
  const hashFix = reconcileFileHashes(manifest, reconciliationPlan.verifiedPristine);
  const effectiveManifest = hashFix ? hashFix.manifest : manifest;
  if (hashFix) writeManifest(effectiveManifest, projectPath);

  // Step 5: Execute plan
  if (reconciliationPlan.actions.length === 0) {
    return {
      success: true,
      plan: reconciliationPlan,
      execution: null,
      manifest: effectiveManifest,
      hashesCorrected: hashFix?.count ?? 0,
      errors
    };
  }

  const execution = await executePlan(projectPath, reconciliationPlan, effectiveManifest, {
    backup,
    onAction
  });

  return {
    success: execution.success,
    plan: reconciliationPlan,
    execution,
    manifest: execution.updatedManifest,
    hashesCorrected: hashFix?.count ?? 0,
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
