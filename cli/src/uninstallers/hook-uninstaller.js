import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, basename } from 'path';
import {
  collectHookConfigs, standardsSourceDir, hooksSourceDir,
  CODEX_HOOK_SCRIPT, GEMINI_HOOK_SCRIPT,
} from '../installers/hooks-installer.js';

/**
 * Every UDS-installed hook entry — in .claude/settings.json, .codex/hooks.json
 * and .gemini/settings.json alike — runs a command of the shape
 * `node scripts/hooks/<script>` (see installHooks/installCodexHooks/
 * installGeminiHooks in ../installers/hooks-installer.js). That path alone is
 * NOT a safe signature, though: `scripts/hooks/` is a directory UDS itself
 * scaffolds inside the adopter's project, so an adopter's own hook script can
 * live at the exact same path and be indistinguishable by path alone
 * (verified: an earlier version of this file matched on path only, and a
 * test placing a user hook at `scripts/hooks/my-own-hook.mjs` lost it).
 * The safe signature is path *and* a script basename UDS is actually known to
 * ship right now — the same set collectHookConfigs() derives for install,
 * plus the two fixed Codex/Gemini script names.
 *
 * 🔴 Until this file added the three functions below, uninstall only ever
 * touched .husky/pre-commit and .git/hooks/pre-commit — the settings.json /
 * hooks.json files installHooks() etc. actually write were never cleaned up,
 * so `uds uninstall` silently left every enforcement hook running (Claude
 * Code included, not just Codex/Gemini).
 */
const UDS_HOOK_COMMAND_PATTERN = /^node scripts\/hooks\//;

/** The command string a hook entry runs, mirroring hooks-installer.js's own commandOf(). */
function commandOf(entry) {
  const h = entry && entry.hooks && entry.hooks[0];
  if (typeof h === 'string') return h;
  return h && typeof h.command === 'string' ? h.command : undefined;
}

/** Script basenames UDS currently ships and would install a hook entry for. */
function knownUdsHookScripts() {
  const { scripts } = collectHookConfigs(standardsSourceDir(), hooksSourceDir());
  return new Set([...scripts.map((s) => basename(s)), CODEX_HOOK_SCRIPT, GEMINI_HOOK_SCRIPT]);
}

function isUdsHookEntry(entry, knownScripts) {
  const cmd = commandOf(entry);
  if (typeof cmd !== 'string' || !UDS_HOOK_COMMAND_PATTERN.test(cmd)) return false;
  return knownScripts.has(basename(cmd));
}

/**
 * Strip UDS-installed entries out of a `{ event: entry[] }` map, dropping any
 * event key left with zero entries. An adopter's own hooks on the same event
 * (or even the same array, or the same `scripts/hooks/` directory) are never
 * touched — only entries whose command names a script UDS is known to ship
 * are removed.
 */
function stripUdsEntries(hooksMap) {
  const knownScripts = knownUdsHookScripts();
  let removedCount = 0;
  const nextMap = {};
  for (const [event, entries] of Object.entries(hooksMap || {})) {
    const kept = (entries || []).filter((entry) => {
      if (isUdsHookEntry(entry, knownScripts)) {
        removedCount += 1;
        return false;
      }
      return true;
    });
    if (kept.length > 0) nextMap[event] = kept;
  }
  return { nextMap, removedCount };
}

/** Put a stripped hooks map back onto a config object, dropping the `hooks` key entirely if empty. */
function applyHooksMap(config, nextMap) {
  const updated = { ...config };
  if (Object.keys(nextMap).length > 0) {
    updated.hooks = nextMap;
  } else {
    delete updated.hooks;
  }
  return updated;
}

/**
 * Shared machinery for the three "remove UDS entries from a hooks config
 * file" functions below. Handles the missing-file, invalid-JSON, and
 * nothing-to-remove cases identically for all three, so their only
 * difference is which file and which key they look at.
 */
function uninstallHookConfigFile({ configPath, label, dryRun, deleteEmptyFile }) {
  const result = { removed: [], skipped: [], errors: [] };
  if (!existsSync(configPath)) return result; // nothing installed here — nothing to report

  let config;
  try {
    config = JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch (error) {
    result.errors.push(`${label} — could not parse (${error.message}); left untouched`);
    return result;
  }

  const { nextMap, removedCount } = stripUdsEntries(config.hooks);
  if (removedCount === 0) {
    result.skipped.push(`${label} (no UDS hook entries found)`);
    return result;
  }

  const entryLabel = `${label} (${removedCount} UDS hook ${removedCount === 1 ? 'entry' : 'entries'})`;
  if (dryRun) {
    result.removed.push(entryLabel);
    return result;
  }

  const updatedConfig = applyHooksMap(config, nextMap);
  const isNowEmpty = Object.keys(updatedConfig).length === 0;

  try {
    if (deleteEmptyFile && isNowEmpty) {
      unlinkSync(configPath);
      result.removed.push(`${entryLabel}, file removed — created by UDS, now empty`);
    } else {
      writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2) + '\n');
      result.removed.push(entryLabel);
    }
  } catch (error) {
    result.errors.push(`${label} — ${error.message}`);
  }

  return result;
}

/** Remove UDS's Stop/PreToolUse/etc. entries from .claude/settings.json (installHooks()'s output). */
export function uninstallClaudeCodeHooks(projectPath, options = {}) {
  return uninstallHookConfigFile({
    configPath: join(projectPath, '.claude', 'settings.json'),
    label: '.claude/settings.json',
    dryRun: options.dryRun || false,
    deleteEmptyFile: true,
  });
}

/** Remove UDS's Stop entry from .codex/hooks.json (installCodexHooks()'s output). */
export function uninstallCodexHooks(projectPath, options = {}) {
  return uninstallHookConfigFile({
    configPath: join(projectPath, '.codex', 'hooks.json'),
    label: '.codex/hooks.json',
    dryRun: options.dryRun || false,
    deleteEmptyFile: true,
  });
}

/** Remove UDS's AfterAgent entry from .gemini/settings.json (installGeminiHooks()'s output). */
export function uninstallGeminiHooks(projectPath, options = {}) {
  return uninstallHookConfigFile({
    configPath: join(projectPath, '.gemini', 'settings.json'),
    label: '.gemini/settings.json',
    dryRun: options.dryRun || false,
    deleteEmptyFile: true,
  });
}

/**
 * Remove UDS-related lines from .husky/pre-commit, the native
 * .git/hooks/pre-commit fallback, and the enforcement-hook entries UDS wrote
 * into .claude/settings.json, .codex/hooks.json and .gemini/settings.json.
 * @param {string} projectPath - Project root path
 * @param {Object} options - { dryRun: boolean }
 * @returns {Object} { removed: string[], skipped: string[], errors: string[] }
 */
export function uninstallHook(projectPath, options = {}) {
  const { dryRun = false } = options;
  const result = { removed: [], skipped: [], errors: [] };
  const hookPath = join(projectPath, '.husky', 'pre-commit');

  if (!existsSync(hookPath)) {
    result.skipped.push('.husky/pre-commit (not found)');
  } else {
    try {
      const content = readFileSync(hookPath, 'utf-8');
      const lines = content.split('\n');
      const udsPattern = /uds\s+check|checkin-standards/;
      const filteredLines = lines.filter(line => !udsPattern.test(line));

      if (filteredLines.length === lines.length) {
        result.skipped.push('.husky/pre-commit (no UDS lines found)');
      } else if (dryRun) {
        result.removed.push('.husky/pre-commit (UDS check lines)');
      } else {
        writeFileSync(hookPath, filteredLines.join('\n'), 'utf-8');
        result.removed.push('.husky/pre-commit (UDS check lines)');
      }
    } catch (error) {
      result.errors.push(`.husky/pre-commit — ${error.message}`);
    }
  }

  // Also handle native .git/hooks/pre-commit (installed by uds init for non-Node projects)
  const nativeHookPath = join(projectPath, '.git', 'hooks', 'pre-commit');
  if (existsSync(nativeHookPath)) {
    try {
      const content = readFileSync(nativeHookPath, 'utf-8');
      const udsPattern = /uds\s+check|checkin-standards|UDS pre-commit hook/;

      if (!udsPattern.test(content)) {
        result.skipped.push('.git/hooks/pre-commit (no UDS lines found)');
      } else if (dryRun) {
        result.removed.push('.git/hooks/pre-commit (UDS native hook)');
      } else {
        // Remove only UDS-related lines, keep other hook content
        const lines = content.split('\n');
        const filtered = lines.filter(line => !udsPattern.test(line));

        // If only shebang remains, remove the file entirely; otherwise rewrite
        const nonEmpty = filtered.filter(l => l.trim() && l.trim() !== '#!/bin/sh');
        if (nonEmpty.length === 0) {
          unlinkSync(nativeHookPath);
          result.removed.push('.git/hooks/pre-commit (UDS native hook, file removed)');
        } else {
          writeFileSync(nativeHookPath, filtered.join('\n'), 'utf-8');
          result.removed.push('.git/hooks/pre-commit (UDS lines removed)');
        }
      }
    } catch (error) {
      result.errors.push(`.git/hooks/pre-commit — ${error.message}`);
    }
  }

  // Enforcement hooks written by installHooks()/installCodexHooks()/installGeminiHooks()
  // — the gap this function used to have entirely (see module doc comment above).
  for (const sub of [
    uninstallClaudeCodeHooks(projectPath, { dryRun }),
    uninstallCodexHooks(projectPath, { dryRun }),
    uninstallGeminiHooks(projectPath, { dryRun }),
  ]) {
    result.removed.push(...sub.removed);
    result.skipped.push(...sub.skipped);
    result.errors.push(...sub.errors);
  }

  return result;
}
