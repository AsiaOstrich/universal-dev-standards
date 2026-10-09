import chalk from 'chalk';
import { select, checkbox, confirm } from '@inquirer/prompts';
import { readManifest, manifestExists, writeManifest } from '../core/manifest.js';
import { t } from '../i18n/messages.js';
import { uninstallStandards } from '../uninstallers/standards-uninstaller.js';
import { uninstallHook, pruneCreatedDirs } from '../uninstallers/hook-uninstaller.js';
import { forgetRecords } from '../core/install-records.js';
import { uninstallIntegrations } from '../uninstallers/integration-uninstaller.js';
import { uninstallSkills } from '../uninstallers/skills-uninstaller.js';

/**
 * Categories available for uninstallation
 */
const CATEGORIES = ['hooks', 'skills', 'integrations', 'standards'];

/**
 * Exit codes. Before these existed every path out of `uninstall` was 0 — a run
 * that removed nothing because the prompt died looked exactly like a completed
 * uninstall to CI and to the adopter's own scripts.
 */
const EXIT_NOT_INITIALIZED = 1;   // nothing to uninstall / manifest unreadable
const EXIT_CANNOT_PROMPT = 2;     // needed an answer, nobody could give one (same as `uds update`)
const EXIT_INTERRUPTED = 130;     // the prompt was closed before answering (SIGINT convention)

/**
 * Can anything answer a prompt? Decided BEFORE a prompt is drawn.
 *
 * `uds update` catches ExitPromptError instead (see confirmOrFail there) and
 * explains why it avoids `isTTY`: a wrapped stdin can answer with isTTY unset.
 * That reasoning is sound for a prompt that has already been drawn, but it leaves
 * the visible symptom this command was reported for — the checkbox painted onto a
 * pipe, then a stack trace. Here the question is asked first, and only stdin
 * matters: prompts read from it. An answer that arrives anyway (a test double, a
 * wrapper) is not blocked by ExitPromptError handling further down.
 */
function canPrompt() {
  return Boolean(process.stdin.isTTY);
}

/** `@inquirer/prompts` throws this when stdin closes or the user presses Ctrl+C. */
function isPromptClosed(err) {
  return err?.name === 'ExitPromptError' || /force closed the prompt/i.test(err?.message || '');
}

/**
 * Uninstall command - remove UDS standards, integrations, skills, and hooks
 * @param {Object} options - Command options
 */
export async function uninstallCommand(options) {
  const projectPath = process.cwd();
  const msg = t().commands.uninstall;
  const common = t().commands.common;

  console.log();
  console.log(chalk.bold(msg.title));
  console.log(chalk.gray('─'.repeat(50)));

  // Check if UDS is initialized. A project with nothing to uninstall is not a
  // successful uninstall: exit non-zero so a script can tell the two apart.
  if (!manifestExists(projectPath)) {
    console.log(chalk.yellow(common.notInitialized));
    console.log(chalk.gray(`  ${common.runInit}`));
    process.exitCode = EXIT_NOT_INITIALIZED;
    return;
  }

  const manifest = readManifest(projectPath);
  if (!manifest) {
    console.log(chalk.red(common.couldNotReadManifest));
    process.exitCode = EXIT_NOT_INITIALIZED;
    return;
  }

  const includeUserLevel = options.all || false;
  const dryRun = options.dryRun || false;

  // Determine which categories to uninstall
  let selectedCategories;
  if (options.all) {
    selectedCategories = [...CATEGORIES];
  } else if (options.standardsOnly) {
    selectedCategories = ['standards'];
  } else if (options.skillsOnly) {
    selectedCategories = ['skills'];
  } else if (options.integrationsOnly) {
    selectedCategories = ['integrations'];
  } else if (options.yes || dryRun) {
    // --yes without a specific flag → all categories.
    // --dry-run → all categories too, and WITHOUT a prompt: a dry run writes
    // nothing, so there is nothing to ask before showing what a run would do —
    // and its whole use is to be runnable unattended (CI, a pipe). It used to
    // draw the category checkbox even then, and die on it.
    selectedCategories = [...CATEGORIES];
  } else {
    // Interactive: checkbox selection
    if (!canPrompt()) {
      refuseToPrompt(msg);
      return;
    }
    let categories;
    try {
      categories = await checkbox({
        message: msg.selectCategories,
        choices: [
          { name: `${msg.categoryHooks} (.husky/pre-commit, .claude/settings.json, .codex/hooks.json, .gemini/settings.json, .agents/hooks.json)`, value: 'hooks', checked: true },
          { name: `${msg.categorySkills} (skills, commands)`, value: 'skills', checked: true },
          { name: `${msg.categoryIntegrations} (CLAUDE.md, .cursorrules, ...)`, value: 'integrations', checked: true },
          { name: `${msg.categoryStandards} (.standards/)`, value: 'standards', checked: true }
        ]
      });
    } catch (err) {
      if (reportClosedPrompt(err, msg)) return;
      throw err;
    }

    if (categories.length === 0) {
      console.log(chalk.yellow(msg.nothingSelected));
      return;
    }
    selectedCategories = categories;
  }

  // Gather preview: run all uninstallers in dry-run mode to build summary
  const preview = await gatherPreview(projectPath, manifest, selectedCategories, includeUserLevel);

  // Show preview summary
  console.log();
  if (dryRun) {
    console.log(chalk.cyan(`  ${msg.dryRunMode}`));
    console.log();
  }

  displayPreview(preview, msg);

  // Confirm (unless --yes or --dry-run)
  if (!dryRun && !options.yes) {
    // Not auto-confirmed when nobody can answer: an unattended shell must not get
    // more permission to delete files than an interactive one is given.
    if (!canPrompt()) {
      refuseToPrompt(msg);
      return;
    }
    let confirmed;
    try {
      confirmed = await confirm({
        message: msg.confirmUninstall,
        default: false
      });
    } catch (err) {
      if (reportClosedPrompt(err, msg)) return;
      throw err;
    }

    if (!confirmed) {
      console.log(chalk.yellow(common.cancelled));
      return;
    }
  }

  if (dryRun) {
    console.log();
    console.log(chalk.cyan(msg.dryRunHint));
    return;
  }

  // Execute uninstallation in order: hooks → skills → integrations → standards
  console.log();
  let results;
  try {
    results = await executeUninstall(
      projectPath, manifest, selectedCategories,
      { includeUserLevel, interactive: !options.yes }
    );
  } catch (err) {
    // A per-file question asked mid-run (which is why this cannot be checked up
    // front) was closed. Earlier steps are already done and stay done.
    if (!isPromptClosed(err)) throw err;
    console.log();
    console.log(chalk.red(msg.promptClosedMidRun));
    console.log();
    process.exitCode = EXIT_INTERRUPTED;
    return;
  }

  // Update or remove manifest
  updateManifestAfterUninstall(projectPath, manifest, selectedCategories, collectDeletedPaths(results));

  // Display results
  displayResults(results, msg);
}

/** Say why a real run cannot proceed without --yes, and set the exit code. Nothing has been changed. */
function refuseToPrompt(msg) {
  console.log();
  console.log(chalk.red(msg.cannotPrompt));
  console.log(chalk.gray(`  ${msg.cannotPromptHint}`));
  console.log();
  process.exitCode = EXIT_CANNOT_PROMPT;
}

/**
 * If `err` is "the prompt was closed before an answer", report it, set a non-zero
 * exit code and return true. Any other error is the caller's to rethrow.
 */
function reportClosedPrompt(err, msg) {
  if (!isPromptClosed(err)) return false;
  console.log();
  console.log(chalk.red(msg.promptClosed));
  console.log();
  process.exitCode = EXIT_INTERRUPTED;
  return true;
}

/**
 * Gather preview of what will be removed (dry-run all uninstallers)
 */
async function gatherPreview(projectPath, manifest, categories, includeUserLevel) {
  const preview = {};

  if (categories.includes('hooks')) {
    preview.hooks = uninstallHook(projectPath, { dryRun: true, manifest });
  }
  if (categories.includes('skills')) {
    preview.skills = uninstallSkills(projectPath, manifest, { dryRun: true, includeUserLevel });
  }
  if (categories.includes('integrations')) {
    preview.integrations = await uninstallIntegrations(projectPath, manifest, { dryRun: true });
  }
  if (categories.includes('standards')) {
    preview.standards = uninstallStandards(projectPath, { dryRun: true, manifest });
  }
  if (categories.includes('hooks')) {
    // Nothing is deleted yet in a preview, so folders are judged against what the
    // steps above WOULD delete.
    preview.folders = pruneCreatedDirs(projectPath, manifest, {
      dryRun: true,
      plannedDeletions: collectDeletedPaths(preview)
    });
  }

  return preview;
}

/** Every relative path the given step results deleted (or, for a preview, would delete). */
function collectDeletedPaths(results) {
  return Object.values(results).flatMap((r) => r.deletedPaths || []);
}

/**
 * Execute actual uninstallation
 */
async function executeUninstall(projectPath, manifest, categories, options) {
  const { includeUserLevel, interactive } = options;
  const results = {};

  if (categories.includes('hooks')) {
    results.hooks = uninstallHook(projectPath, { manifest });
  }
  if (categories.includes('skills')) {
    results.skills = uninstallSkills(projectPath, manifest, { includeUserLevel });
  }
  if (categories.includes('integrations')) {
    const promptFn = interactive ? createIntegrationPromptFn() : null;
    results.integrations = await uninstallIntegrations(projectPath, manifest, {
      interactive,
      promptFn
    });
  }
  if (categories.includes('standards')) {
    results.standards = uninstallStandards(projectPath, { manifest });
  }
  if (categories.includes('hooks')) {
    // After everything else, so a folder that only held UDS files is empty by now.
    results.folders = pruneCreatedDirs(projectPath, manifest);
  }

  return results;
}

/**
 * Create interactive prompt function for integration files
 */
function createIntegrationPromptFn() {
  const msg = t().commands.uninstall;
  return async (fileName) => {
    const action = await select({
      message: `${fileName}: ${msg.integrationAction}`,
      choices: [
        { name: msg.removeBlockOnly, value: 'remove-block' },
        { name: msg.deleteEntireFile, value: 'delete-file' },
        { name: msg.skipFile, value: 'skip' }
      ]
    });
    return action;
  };
}

/**
 * Update or remove manifest after uninstall
 */
function updateManifestAfterUninstall(projectPath, manifest, categories, deletedPaths = []) {
  const removedStandards = categories.includes('standards');

  if (removedStandards) {
    // .standards/ is gone, manifest is already deleted with it
    return;
  }

  // Partial uninstall: update manifest to reflect removed items. Install records
  // for the paths just deleted go too — a record for a file that is gone would
  // otherwise "prove" authorship of whatever a user later puts at that path.
  const updated = forgetRecords({ ...manifest }, deletedPaths);

  if (categories.includes('skills')) {
    updated.skills = {
      installed: false,
      location: manifest.skills?.location || 'marketplace',
      names: [],
      version: null,
      installations: []
    };
    updated.commands = {
      installed: false,
      names: [],
      version: null,
      installations: []
    };
    updated.skillHashes = {};
    updated.commandHashes = {};
  }

  if (categories.includes('integrations')) {
    updated.integrations = [];
    updated.integrationConfigs = {};
    updated.integrationBlockHashes = {};
  }

  writeManifest(updated, projectPath);
}

/**
 * Display preview of what will be removed/skipped
 */
function displayPreview(preview, msg) {
  console.log(chalk.bold(msg.previewTitle));
  console.log();

  for (const [, result] of Object.entries(preview)) {
    for (const item of result.removed || []) {
      console.log(chalk.green(`  ✓ ${msg.willRemove}: ${item}`));
    }
    for (const item of result.skipped || []) {
      console.log(chalk.yellow(`  ⚠ ${msg.willSkip}: ${item}`));
    }
    if (result.marketplaceWarnings) {
      for (const warn of result.marketplaceWarnings) {
        console.log(chalk.yellow(`  ⚠ ${warn}`));
      }
    }
  }
}

/**
 * Display final results
 */
function displayResults(results, msg) {
  let totalRemoved = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const [, result] of Object.entries(results)) {
    for (const item of result.removed || []) {
      console.log(chalk.green(`  ✓ ${item}`));
      totalRemoved++;
    }
    for (const item of result.skipped || []) {
      console.log(chalk.yellow(`  ⚠ ${item}`));
      totalSkipped++;
    }
    for (const item of result.errors || []) {
      console.log(chalk.red(`  ✗ ${item}`));
      totalErrors++;
    }
    if (result.marketplaceWarnings) {
      for (const warn of result.marketplaceWarnings) {
        console.log(chalk.yellow(`  ⚠ ${warn}`));
      }
    }
  }

  console.log();
  if (totalErrors === 0) {
    console.log(chalk.green(msg.uninstallSuccess));
  } else {
    console.log(chalk.yellow(msg.uninstallPartial));
    // "Completed with errors" is not a success to whoever runs this from a script.
    process.exitCode = 1;
  }
  console.log(chalk.gray(`  ${msg.removed}: ${totalRemoved}  ${msg.skippedLabel}: ${totalSkipped}  ${msg.errorsLabel}: ${totalErrors}`));
}
