/**
 * Plan Executor
 * Executes a ReconciliationPlan by performing file operations.
 *
 * Reuses existing UDS installers where possible:
 * - copyStandard() for standard/option files
 * - writeIntegrationFile() for integration files
 * - installSkillsToMultipleAgents() for skills
 * - installCommandsToMultipleAgents() for commands
 *
 * Each action is executed independently — single failures don't block the rest.
 */

import { existsSync, unlinkSync, mkdirSync, rmSync, copyFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { copyStandard } from '../utils/copier.js';
import { writeIntegrationFile, buildToolIntegrationConfig } from '../utils/integration-generator.js';
import {
  installSkillsToMultipleAgents,
  installCommandsToMultipleAgents
} from '../utils/skills-installer.js';
import { writeManifest } from '../core/manifest.js';
import { getRepositoryInfo } from '../utils/registry.js';
import { displayLanguageToLocale } from '../utils/locale.js';
import { computeFileHash } from '../utils/hasher.js';
import { createBackup, cleanupBackups } from './backup-manager.js';

/**
 * @typedef {Object} ExecutionResult
 * @property {boolean} success - Overall success
 * @property {string|null} backupId - Backup ID if created
 * @property {Array<{ action: import('./diff-engine.js').PlanAction, success: boolean, error?: string }>} results
 * @property {Object} updatedManifest - The manifest after execution
 * @property {Object} summary - { succeeded, failed, skipped }
 */

/**
 * Execute a reconciliation plan.
 *
 * @param {string} projectPath - Project root
 * @param {import('./diff-engine.js').ReconciliationPlan} plan - Plan to execute
 * @param {Object} manifest - Current manifest
 * @param {Object} [options]
 * @param {boolean} [options.backup=true] - Create backup before executing
 * @param {boolean} [options.dryRun=false] - Log actions without executing
 * @param {Function} [options.onAction] - Callback for each action: (action, index, total) => void
 * @returns {Promise<ExecutionResult>}
 */
export async function executePlan(projectPath, plan, manifest, options = {}) {
  const { backup = true, dryRun = false, onAction } = options;
  const results = [];
  let backupId = null;
  const updatedManifest = { ...manifest };

  // Ensure hash containers exist
  if (!updatedManifest.fileHashes) updatedManifest.fileHashes = {};
  if (!updatedManifest.skillHashes) updatedManifest.skillHashes = {};
  if (!updatedManifest.commandHashes) updatedManifest.commandHashes = {};
  if (!updatedManifest.integrationBlockHashes) updatedManifest.integrationBlockHashes = {};

  if (plan.actions.length === 0) {
    return {
      success: true,
      backupId: null,
      results: [],
      updatedManifest,
      summary: { succeeded: 0, failed: 0, skipped: 0 }
    };
  }

  // Create backup
  if (backup && !dryRun) {
    const backupResult = createBackup(projectPath, plan);
    if (backupResult.errors.length > 0 && backupResult.backedUp.length === 0) {
      // Backup completely failed — abort
      return {
        success: false,
        backupId: null,
        results: [{ action: { type: 'backup', path: '' }, success: false, error: backupResult.errors.join('; ') }],
        updatedManifest,
        summary: { succeeded: 0, failed: 1, skipped: plan.actions.length }
      };
    }
    backupId = backupResult.backupId;

    // Clean up old backups
    cleanupBackups(projectPath);
  }

  // Execute actions
  // Group skill and command actions for batch installation
  const skillActions = [];
  const commandActions = [];
  const otherActions = [];

  for (const action of plan.actions) {
    if (action.category === 'skill') {
      skillActions.push(action);
    } else if (action.category === 'command') {
      commandActions.push(action);
    } else {
      otherActions.push(action);
    }
  }

  // Execute non-skill/command actions individually
  let actionIndex = 0;
  const totalActions = plan.actions.length;

  for (const action of otherActions) {
    if (onAction) onAction(action, actionIndex++, totalActions);

    if (dryRun) {
      results.push({ action, success: true, dryRun: true });
      continue;
    }

    const result = await executeAction(projectPath, action, updatedManifest);
    results.push(result);
  }

  // Batch execute skills
  if (skillActions.length > 0) {
    if (onAction) onAction({ type: 'batch', category: 'skill', path: 'skills' }, actionIndex++, totalActions);

    if (!dryRun) {
      const skillResults = await executeSkillBatch(projectPath, skillActions, updatedManifest);
      results.push(...skillResults);
    } else {
      for (const a of skillActions) {
        results.push({ action: a, success: true, dryRun: true });
      }
    }
  }

  // Batch execute commands
  if (commandActions.length > 0) {
    if (onAction) onAction({ type: 'batch', category: 'command', path: 'commands' }, actionIndex++, totalActions);

    if (!dryRun) {
      const cmdResults = await executeCommandBatch(projectPath, commandActions, updatedManifest);
      results.push(...cmdResults);
    } else {
      for (const a of commandActions) {
        results.push({ action: a, success: true, dryRun: true });
      }
    }
  }

  // Record the version we just reconciled to — but only on a clean run, mirroring
  // `uds update`'s rule (a partial failure must stay retryable).
  //
  // Without this the reconciler applied everything and advanced nothing: the repo
  // still recorded 6.1.0, `uds check` still said "behind the latest release", and
  // the weekly staleness scout — which reads exactly `upstream.version` — kept
  // reporting the repo as stale after a fully successful reconcile. (XSPEC-343 R2)
  if (!dryRun && results.every(r => r.success)) {
    const version = getRepositoryInfo()?.standards?.version;
    if (version) {
      updatedManifest.upstream = {
        ...(updatedManifest.upstream || {}),
        version,
        installed: new Date().toISOString().split('T')[0]
      };
    }
  }

  // Write updated manifest
  if (!dryRun) {
    try {
      writeManifest(updatedManifest, projectPath);
    } catch (err) {
      results.push({
        action: { type: 'update', category: 'manifest', path: '.standards/manifest.json' },
        success: false,
        error: `Failed to write manifest: ${err.message}`
      });
    }
  }

  const summary = {
    succeeded: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    skipped: 0
  };

  return {
    success: summary.failed === 0,
    backupId,
    results,
    updatedManifest,
    summary
  };
}

/**
 * Execute a single action.
 */
async function executeAction(projectPath, action, manifest) {
  try {
    switch (action.type) {
      case 'create':
      case 'update':
        return await executeCreateOrUpdate(projectPath, action, manifest);
      case 'delete':
        return executeDelete(projectPath, action, manifest);
      case 'migrate_block':
        return executeMigrateBlock(projectPath, action, manifest);
      default:
        return { action, success: false, error: `Unknown action type: ${action.type}` };
    }
  } catch (err) {
    return { action, success: false, error: err.message };
  }
}

/**
 * Execute a create or update action for standards/options.
 */
async function executeCreateOrUpdate(projectPath, action, manifest) {
  if (action.category === 'standard' || action.category === 'option') {
    const sourcePath = action.details?.sourcePath;
    if (!sourcePath) {
      // No absolute path was resolved, so fall back to copyStandard, which walks
      // bundled → repo → download. Two kinds of entry arrive here.
      const metadata = action.details?.metadata;
      let sourceStr = null;
      let targetDir = '.standards';

      if (metadata?.extensionSource) {
        // An entry from `manifest.extensions`. PathResolver cannot resolve these
        // from an npm install: the published package's `files` list is bin, src,
        // bundled, standards-registry.json and README.md — no `extensions/`. So
        // `sourcePath` is null for every adopter who did not install from a
        // source checkout, and this function answered "No source path available"
        // for a file it was perfectly able to fetch.
        //
        // The legacy update path never had the bug because it calls copyStandard
        // directly (`update.js`, "Update extensions"). The same upgrade therefore
        // refreshed `.standards/zh-tw.md` under `uds update` and failed under the
        // reconciler — the two paths disagreed about whether the file was
        // reachable, and only one of them was right. (XSPEC-343)
        sourceStr = metadata.extensionSource;
      } else if (metadata?.registryEntry) {
        const source = metadata.registryEntry.source;
        sourceStr = typeof source === 'string'
          ? source
          : (source?.[metadata.format] || source?.ai || source?.human);
        targetDir = action.category === 'option' ? dirname(action.path) : '.standards';
      }

      if (sourceStr) {
        const result = await copyStandard(sourceStr, targetDir, projectPath);
        if (result.success) {
          // Update hash in manifest
          const hashInfo = computeFileHash(join(projectPath, action.path));
          if (hashInfo) {
            const normalizedPath = action.path.replace(/\\/g, '/');
            manifest.fileHashes[normalizedPath] = {
              ...hashInfo,
              installedAt: new Date().toISOString()
            };
          }
          return { action, success: true };
        }
        return { action, success: false, error: result.error };
      }
      return { action, success: false, error: 'No source path available' };
    }

    // Direct copy from resolved source
    const targetPath = join(projectPath, action.path);
    mkdirSync(dirname(targetPath), { recursive: true });
    copyFileSync(sourcePath, targetPath);

    // Update hash in manifest
    const hashInfo = computeFileHash(targetPath);
    if (hashInfo) {
      const normalizedPath = action.path.replace(/\\/g, '/');
      manifest.fileHashes[normalizedPath] = {
        ...hashInfo,
        installedAt: new Date().toISOString()
      };
    }

    return { action, success: true };
  }

  if (action.category === 'integration') {
    return executeMigrateBlock(projectPath, action, manifest);
  }

  return { action, success: false, error: `Unsupported create/update for category: ${action.category}` };
}

/**
 * Execute a delete action.
 */
function executeDelete(projectPath, action, manifest) {
  const targetPath = join(projectPath, action.path);

  if (!existsSync(targetPath)) {
    return { action, success: true }; // Already gone
  }

  try {
    const stat = statSync(targetPath);
    if (stat.isDirectory()) {
      rmSync(targetPath, { recursive: true, force: true });
    } else {
      unlinkSync(targetPath);
    }

    // Remove from manifest tracking
    delete manifest.fileHashes[action.path];
    delete manifest.integrationBlockHashes[action.path];

    return { action, success: true };
  } catch (err) {
    return { action, success: false, error: err.message };
  }
}

/**
 * Execute a migrate_block action for integration files.
 * Uses writeIntegrationFile which handles marker-based section replacement.
 */
function executeMigrateBlock(projectPath, action, manifest) {
  const toolName = action.details?.toolName;
  if (!toolName) {
    return { action, success: false, error: 'No tool name in action details' };
  }

  // Build config from manifest for this tool
  const config = buildIntegrationConfig(manifest, toolName);

  const result = writeIntegrationFile(toolName, config, projectPath);
  if (result.success) {
    // Update block hash tracking
    if (result.blockHashInfo) {
      manifest.integrationBlockHashes[result.path] = result.blockHashInfo;
    }
    // `init` also records integration files in the whole-file `fileHashes`, which
    // is what `uds check`'s File Integrity compares. Rewriting the block without
    // refreshing that entry left the file permanently reported as "modified" —
    // a successful reconcile that reads, afterwards, as a damaged install.
    // (XSPEC-343 R2)
    const tracked = manifest.fileHashes?.[result.path];
    if (tracked) {
      const info = computeFileHash(join(projectPath, result.path));
      if (info) {
        manifest.fileHashes[result.path] = {
          ...info,
          installedAt: tracked.installedAt || new Date().toISOString()
        };
      }
    }
    return { action, success: true };
  }

  return { action, success: false, error: result.error };
}

/**
 * Batch execute skill installations.
 */
async function executeSkillBatch(projectPath, skillActions, manifest) {
  const results = [];

  // Group by create/update vs delete
  const toInstall = skillActions.filter(a => a.type === 'create' || a.type === 'update');
  const toDelete = skillActions.filter(a => a.type === 'delete');

  // Handle deletions
  for (const action of toDelete) {
    const targetPath = join(projectPath, action.path);
    try {
      if (existsSync(targetPath)) {
        rmSync(targetPath, { recursive: true, force: true });
      }
      results.push({ action, success: true });
    } catch (err) {
      results.push({ action, success: false, error: err.message });
    }
  }

  // Handle installations using batch installer
  if (toInstall.length > 0 && manifest.skills?.installations) {
    const skillNames = [...new Set(
      toInstall.map(a => a.details?.metadata?.skillName).filter(Boolean)
    )];

    if (skillNames.length > 0) {
      try {
        // The locale argument was omitted here while the command path below
        // passes it, so a reconcile silently reinstalled every skill in English.
        // telemetry-server lost 59 zh-TW skill files to this before it was caught,
        // and its manifest went on recording `skills.locale: zh-TW` throughout.
        // Prefer the recorded skills locale; fall back to the display language,
        // which is what `uds update` uses. (XSPEC-343 R2)
        const skillLocale = manifest.skills?.locale
          || displayLanguageToLocale(manifest?.options?.display_language);
        const installResult = await installSkillsToMultipleAgents(
          manifest.skills.installations,
          skillNames,
          projectPath,
          skillLocale
        );

        if (installResult.allFileHashes) {
          Object.assign(manifest.skillHashes, installResult.allFileHashes);
        }

        for (const action of toInstall) {
          results.push({ action, success: installResult.success });
        }
      } catch (err) {
        for (const action of toInstall) {
          results.push({ action, success: false, error: err.message });
        }
      }
    }
  }

  return results;
}

/**
 * Batch execute command installations.
 */
async function executeCommandBatch(projectPath, commandActions, manifest) {
  const results = [];

  const toInstall = commandActions.filter(a => a.type === 'create' || a.type === 'update');
  const toDelete = commandActions.filter(a => a.type === 'delete');

  // Handle deletions
  for (const action of toDelete) {
    const targetPath = join(projectPath, action.path);
    try {
      if (existsSync(targetPath)) {
        rmSync(targetPath, { recursive: true, force: true });
      }
      results.push({ action, success: true });
    } catch (err) {
      results.push({ action, success: false, error: err.message });
    }
  }

  // Handle installations
  if (toInstall.length > 0 && manifest.commands?.installations) {
    const commandNames = [...new Set(
      toInstall.map(a => a.details?.metadata?.commandName).filter(Boolean)
    )];

    if (commandNames.length > 0) {
      try {
        const cmdLocale = displayLanguageToLocale(manifest?.options?.display_language);
        const installResult = await installCommandsToMultipleAgents(
          manifest.commands.installations,
          commandNames,
          projectPath,
          cmdLocale
        );

        if (installResult.allFileHashes) {
          // Clean up stale entries for agents being updated before merging
          const updatedPrefixes = new Set(
            Object.keys(installResult.allFileHashes).map(k => k.split('/')[0])
          );
          for (const prefix of updatedPrefixes) {
            for (const key of Object.keys(manifest.commandHashes)) {
              if (key.startsWith(prefix + '/')) {
                delete manifest.commandHashes[key];
              }
            }
          }
          Object.assign(manifest.commandHashes, installResult.allFileHashes);
        }

        for (const action of toInstall) {
          results.push({ action, success: installResult.success });
        }
      } catch (err) {
        for (const action of toInstall) {
          results.push({ action, success: false, error: err.message });
        }
      }
    }
  }

  return results;
}

/**
 * Build integration generation config from manifest.
 *
 * Delegates to the shared builder so the reconciler and `uds update` generate the
 * same block. The private copy that used to live here omitted `categories`,
 * defaulted the output language to English, and read `integrationConfigs` by tool
 * key when the manifest stores it by file name — so reconciling a repo silently
 * dropped sections the normal update path always wrote. (XSPEC-343 R2)
 */
function buildIntegrationConfig(manifest, toolName) {
  return {
    ...buildToolIntegrationConfig(manifest, toolName),
    format: manifest.format || 'ai'
  };
}
