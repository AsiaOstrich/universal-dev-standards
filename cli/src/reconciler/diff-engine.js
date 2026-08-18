/**
 * Diff Engine
 * Compares desired state vs actual state and produces a ReconciliationPlan.
 *
 * Decision table:
 * | Desired | Actual  | Hash    | Action    |
 * |---------|---------|---------|-----------|
 * | exists  | missing | —       | create    |
 * | exists  | exists  | same    | unchanged |
 * | exists  | exists  | differ  | update    |
 * | missing | exists  | (UDS)   | delete    |
 * | missing | exists  | (other) | skip+warn |
 *
 * Integration files use migrate_block: only the UDS marker block is replaced.
 */

/**
 * @typedef {Object} PlanAction
 * @property {'create'|'update'|'delete'|'migrate_block'|'patch_hook'} type
 * @property {'standard'|'option'|'integration'|'skill'|'command'|'hook'} category
 * @property {string} path - Relative file path or key
 * @property {string} reason - Human-readable explanation
 * @property {Object} details - Additional data for the executor
 */

/**
 * @typedef {Object} ReconciliationPlan
 * @property {PlanAction[]} actions - Ordered list of actions
 * @property {Object} summary - { create, update, delete, unchanged, warnings }
 * @property {string[]} warnings - Non-fatal issues
 */

/**
 * Compute the difference between desired and actual state.
 *
 * @param {import('./desired-state-calculator.js').UDSState} desired
 * @param {import('./actual-state-scanner.js').UDSState} actual
 * @param {Object} [options]
 * @param {boolean} [options.force=false] - Force update even if hashes match
 * @returns {ReconciliationPlan}
 */
/**
 * The reason attached to every skill/command action, because no content
 * comparison is implemented for them (XSPEC-382 R1).
 *
 * Exported and referenced by `formatPlan` rather than spelled out twice: two
 * copies of a string are two things that can drift, and the drift here is
 * silent — the collapse would just stop collapsing and the plan would go back
 * to listing all 57 rows, which is indistinguishable from "it always did that".
 */
export const UNCONDITIONAL_REINSTALL_REASON = 'no hash available for comparison, re-installing';

export function computeDiff(desired, actual, options = {}) {
  const { force = false } = options;
  const actions = [];
  const warnings = [];
  const summary = { create: 0, update: 0, delete: 0, unchanged: 0, migrate_block: 0 };

  // Files whose content on disk is byte-identical to what UDS ships (XSPEC-382 R6).
  //
  // These produce no action — there is nothing to install. They are collected
  // so the caller can bring `manifest.fileHashes` back in line with a disk that
  // is already correct. Without this there is no path back: a stale recorded
  // hash makes `uds check` report a pristine file as modified forever, because
  // an unchanged file is never re-hashed and the reconciler returns early when
  // the action list is empty.
  //
  // Only ever recorded when disk === desired. Syncing the record to whatever is
  // on disk would silently absorb a hand edit and empty the integrity check of
  // its purpose — it exists to tell you somebody changed a standard.
  const verifiedPristine = [];

  // Diff standards
  diffCategory(
    desired.standards, actual.standards,
    'standard', actions, warnings, summary, force, verifiedPristine
  );

  // Diff options
  diffCategory(
    desired.options, actual.options,
    'option', actions, warnings, summary, force, verifiedPristine
  );

  // Diff integrations (special: use migrate_block)
  diffIntegrations(
    desired.integrations, actual.integrations,
    actions, warnings, summary, force
  );

  // Diff skills
  diffCategory(
    desired.skills, actual.skills,
    'skill', actions, warnings, summary, force, verifiedPristine
  );

  // Diff commands
  diffCategory(
    desired.commands, actual.commands,
    'command', actions, warnings, summary, force, verifiedPristine
  );

  return { actions, summary, warnings, verifiedPristine };
}

/**
 * Diff a single category (standards, options, skills, commands).
 */
function diffCategory(desiredMap, actualMap, category, actions, warnings, summary, force, verifiedPristine = []) {
  // Check desired entries against actual
  for (const [key, desiredEntry] of desiredMap) {
    const actualEntry = actualMap.get(key);

    if (!actualEntry) {
      // Desired exists, actual missing → create
      actions.push({
        type: 'create',
        category,
        path: desiredEntry.relativePath,
        reason: `${category} not found on disk`,
        details: {
          sourcePath: desiredEntry.sourcePath,
          desiredHash: desiredEntry.hash,
          metadata: desiredEntry.metadata
        }
      });
      summary.create++;
    } else if (force) {
      // Force mode: always update
      actions.push({
        type: 'update',
        category,
        path: desiredEntry.relativePath,
        reason: 'forced update (--force)',
        details: {
          sourcePath: desiredEntry.sourcePath,
          currentHash: actualEntry.hash,
          desiredHash: desiredEntry.hash,
          metadata: desiredEntry.metadata
        }
      });
      summary.update++;
    } else if (desiredEntry.hash && actualEntry.hash && desiredEntry.hash !== actualEntry.hash) {
      // Hash mismatch → update
      actions.push({
        type: 'update',
        category,
        path: desiredEntry.relativePath,
        reason: 'content changed (hash mismatch)',
        details: {
          sourcePath: desiredEntry.sourcePath,
          currentHash: actualEntry.hash,
          desiredHash: desiredEntry.hash,
          metadata: desiredEntry.metadata
        }
      });
      summary.update++;
    } else if (!desiredEntry.hash || !actualEntry.hash) {
      // Cannot compare hashes — mark as update if force, otherwise skip
      // For skills/commands without hash tracking, always update
      if (category === 'skill' || category === 'command') {
        actions.push({
          type: 'update',
          category,
          path: desiredEntry.relativePath,
          reason: UNCONDITIONAL_REINSTALL_REASON,
          details: {
            sourcePath: desiredEntry.sourcePath,
            metadata: desiredEntry.metadata
          }
        });
        summary.update++;
      } else {
        summary.unchanged++;
      }
    } else {
      // Hashes match → unchanged.
      //
      // The file is byte-identical to what UDS ships, so there is nothing to
      // install — but the manifest's recorded hash may still be stale (XSPEC-382
      // R6: a pre-reconciler manifest written back over the reconciler's output
      // reverted `fileHashes` along with `upstream.version`). Recording it here
      // is safe precisely because we got here by proving disk === desired.
      summary.unchanged++;
      if (actualEntry.hash) {
        verifiedPristine.push({
          path: desiredEntry.relativePath,
          hash: actualEntry.hash,
          size: actualEntry.size ?? null
        });
      }
    }
  }

  // Check actual entries not in desired → delete (only if UDS-managed)
  for (const [key, actualEntry] of actualMap) {
    if (!desiredMap.has(key)) {
      if (isUDSManaged(actualEntry)) {
        actions.push({
          type: 'delete',
          category,
          path: actualEntry.relativePath,
          reason: 'no longer in desired state',
          details: {
            currentHash: actualEntry.hash,
            metadata: actualEntry.metadata
          }
        });
        summary.delete++;
      } else {
        warnings.push(
          `Skipping ${actualEntry.relativePath}: not UDS-managed, ignoring`
        );
      }
    }
  }
}

/**
 * Diff integration files with special marker-block handling.
 */
function diffIntegrations(desiredMap, actualMap, actions, warnings, summary, force) {
  // Check desired integrations against actual
  for (const [key, desiredEntry] of desiredMap) {
    const actualEntry = actualMap.get(key);

    if (!actualEntry) {
      // Integration file doesn't exist → create
      actions.push({
        type: 'create',
        category: 'integration',
        path: desiredEntry.relativePath,
        reason: 'integration file not found',
        details: {
          toolName: desiredEntry.metadata.toolName,
          format: desiredEntry.metadata.format,
          metadata: desiredEntry.metadata
        }
      });
      summary.create++;
    } else if (actualEntry.metadata?.hasMarkers) {
      // File exists with UDS markers → migrate_block (update just the block)
      if (force) {
        actions.push({
          type: 'migrate_block',
          category: 'integration',
          path: desiredEntry.relativePath,
          reason: 'forced integration update (--force)',
          details: {
            toolName: desiredEntry.metadata.toolName,
            format: desiredEntry.metadata.format,
            currentBlockHash: actualEntry.metadata?.blockHash?.blockHash,
            metadata: desiredEntry.metadata
          }
        });
        summary.migrate_block++;
      } else {
        // Check if block hash differs from what we'd generate
        // We always update integrations since content is generated dynamically
        actions.push({
          type: 'migrate_block',
          category: 'integration',
          path: desiredEntry.relativePath,
          reason: 'integration content may need update',
          details: {
            toolName: desiredEntry.metadata.toolName,
            format: desiredEntry.metadata.format,
            currentBlockHash: actualEntry.metadata?.blockHash?.blockHash,
            metadata: desiredEntry.metadata
          }
        });
        summary.migrate_block++;
      }
    } else {
      // File exists but no UDS markers → create markers (append)
      actions.push({
        type: 'migrate_block',
        category: 'integration',
        path: desiredEntry.relativePath,
        reason: 'integration file exists but missing UDS markers',
        details: {
          toolName: desiredEntry.metadata.toolName,
          format: desiredEntry.metadata.format,
          appendMode: true,
          metadata: desiredEntry.metadata
        }
      });
      summary.migrate_block++;
    }
  }

  // Check actual integrations not in desired → warn (don't auto-delete user files)
  for (const [key, actualEntry] of actualMap) {
    if (!desiredMap.has(key)) {
      if (actualEntry.metadata?.hasMarkers) {
        // Has UDS markers but not in desired → delete the UDS block
        actions.push({
          type: 'delete',
          category: 'integration',
          path: actualEntry.relativePath,
          reason: 'integration no longer configured, removing UDS block',
          details: {
            toolName: actualEntry.metadata.toolName,
            hasMarkers: true,
            metadata: actualEntry.metadata
          }
        });
        summary.delete++;
      } else {
        warnings.push(
          `Integration file ${actualEntry.relativePath} exists but is not UDS-managed, ignoring`
        );
      }
    }
  }
}

/**
 * Determine if an actual file entry is UDS-managed.
 * Files in .standards/ are always UDS-managed.
 * Skill/command entries from manifest installations are UDS-managed.
 */
function isUDSManaged(entry) {
  // Files in .standards/ are always UDS-managed
  if (entry.relativePath.startsWith('.standards/')) return true;

  // Scanned skill/command entries carry a provenance flag from the scanner.
  // This used to return true unconditionally, which meant every directory in an
  // adopter's skills folder was ours to delete — including hand-written ones.
  // (XSPEC-343 R2)
  if (entry.category === 'skill' || entry.category === 'command') {
    return entry.metadata?.udsManaged !== false;
  }

  // Integration files with markers
  if (entry.metadata?.hasMarkers) return true;

  return false;
}

/**
 * Create an empty plan (no actions needed).
 * @returns {ReconciliationPlan}
 */
export function createEmptyPlan() {
  return {
    actions: [],
    summary: { create: 0, update: 0, delete: 0, unchanged: 0, migrate_block: 0 },
    warnings: []
  };
}

/**
 * Format a plan as human-readable text.
 * @param {ReconciliationPlan} plan
 * @returns {string}
 */
export function formatPlan(plan) {
  const lines = [];

  lines.push('=== Reconciliation Plan ===');
  lines.push('');

  if (plan.actions.length === 0 && plan.warnings.length === 0) {
    lines.push('No changes needed. Everything is up to date.');
    return lines.join('\n');
  }

  if (plan.actions.length === 0) {
    lines.push('No changes needed.');
    lines.push('');
  }

  // Group actions by type
  const grouped = { create: [], update: [], delete: [], migrate_block: [], patch_hook: [] };
  for (const action of plan.actions) {
    (grouped[action.type] || []).push(action);
  }

  // XSPEC-382 R3/R4 — how many updates are unconditional reinstalls rather than
  // real changes. Computed once here because both the Update section and the
  // Summary need it, and a reader of the Summary alone must not be left with a
  // number that answers nothing: `Update: 57` is true and useless.
  const unconditionalCount = grouped.update.filter(
    (a) => a.reason === UNCONDITIONAL_REINSTALL_REASON
  ).length;

  if (grouped.create.length > 0) {
    lines.push(`+ Create (${grouped.create.length}):`);
    for (const a of grouped.create) {
      lines.push(`  + ${a.path} (${a.reason})`);
    }
    lines.push('');
  }

  if (grouped.update.length > 0) {
    // XSPEC-382 R3 — collapse the unconditional reinstalls.
    //
    // On a real upgrade this produced `Update (57)` where 55 rows carried one
    // identical reason and only 2 were actual changes — the two a reviewer
    // needs to see, buried under fifty-five that say nothing about this
    // upgrade.
    //
    // R1 has since given SKILLS a content comparison, so those rows are gone;
    // the same upgrade now reports `Update: 0, Unchanged: 127`. COMMANDS still
    // hardcode `hash: null` on both sides, so this branch is live and still
    // needed. It is deliberately not deleted along with the skills half: a
    // collapse that silently stops applying looks exactly like a plan that
    // never had anything to collapse.
    //
    // Collapsed, NOT hidden: the count is printed. A capped list that does not
    // say it was capped reads as "these are all of them", which is the failure
    // this repo keeps finding. Printing the denominator alongside the excluded
    // count is the `class-level-fix` rule.
    const real = grouped.update.filter((a) => a.reason !== UNCONDITIONAL_REINSTALL_REASON);
    const collapsed = unconditionalCount;

    lines.push(`~ Update (${grouped.update.length}):`);
    for (const a of real) {
      lines.push(`  ~ ${a.path} (${a.reason})`);
    }
    if (collapsed > 0) {
      lines.push(
        `  i ${collapsed} UDS-managed item${collapsed === 1 ? '' : 's'} reinstalled unconditionally — no content comparison is implemented for them (XSPEC-382 R1 covers skills; commands do not have one yet)`
      );
    }
    lines.push('');
  }

  if (grouped.migrate_block.length > 0) {
    lines.push(`~ Migrate Block (${grouped.migrate_block.length}):`);
    for (const a of grouped.migrate_block) {
      lines.push(`  ~ ${a.path} (${a.reason})`);
    }
    lines.push('');
  }

  if (grouped.delete.length > 0) {
    lines.push(`- Delete (${grouped.delete.length}):`);
    for (const a of grouped.delete) {
      lines.push(`  - ${a.path} (${a.reason})`);
    }
    lines.push('');
  }

  lines.push('Summary:');
  lines.push(`  Create: ${plan.summary.create}`);
  lines.push(
    unconditionalCount > 0
      ? `  Update: ${plan.summary.update} (${plan.summary.update - unconditionalCount} changed, ${unconditionalCount} unconditional reinstall)`
      : `  Update: ${plan.summary.update}`
  );
  lines.push(`  Migrate Block: ${plan.summary.migrate_block}`);
  lines.push(`  Delete: ${plan.summary.delete}`);
  lines.push(`  Unchanged: ${plan.summary.unchanged}`);

  if (plan.warnings.length > 0) {
    lines.push('');
    lines.push('Warnings:');
    for (const w of plan.warnings) {
      lines.push(`  ! ${w}`);
    }
  }

  return lines.join('\n');
}
