/**
 * UDS Hook Installer
 *
 * Copies hook scripts and generates/merges .claude/settings.json
 * with hook configurations.
 *
 * Key constraints:
 * - MUST merge, never overwrite existing settings.json
 * - MUST be idempotent (no duplicate hooks on re-install)
 *
 * @module installers/hooks-installer
 * @see docs/specs/SPEC-HOOKS-001-core-standard-hooks.md (REQ-4)
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const HOOK_CONFIGS = {
  PreToolUse: [
    {
      matcher: 'Bash',
      hooks: ['node scripts/hooks/check-dangerous-cmd.js'],
    },
  ],
  PostToolUse: [
    {
      matcher: 'Bash',
      hooks: ['node scripts/hooks/check-logging-standard.js'],
    },
  ],
  UserPromptSubmit: [
    {
      matcher: '',
      hooks: ['node scripts/hooks/validate-commit-msg.js'],
    },
  ],
};

const HOOK_SCRIPTS = [
  'validate-commit-msg.js',
  'check-dangerous-cmd.js',
  'check-logging-standard.js',
];

/**
 * Deep merge hook arrays, deduplicating by hook script path.
 * @param {Array} existing - Existing hook entries
 * @param {Array} incoming - New hook entries to merge
 * @returns {Array} Merged array without duplicates
 */
function mergeHookArray(existing, incoming) {
  const result = [...existing];
  for (const entry of incoming) {
    const hookScript = entry.hooks?.[0];
    const isDuplicate = result.some(
      (e) => e.hooks?.[0] === hookScript && e.matcher === entry.matcher
    );
    if (!isDuplicate) {
      result.push(entry);
    }
  }
  return result;
}

/**
 * Install UDS hooks into a target project.
 * - Copies hook scripts to scripts/hooks/
 * - Creates or merges .claude/settings.json with hook configs
 *
 * @param {string} projectPath - Target project root path
 * @returns {{ installed: boolean, scriptsCount: number, settingsPath: string }}
 */
export function installHooks(projectPath) {
  const claudeDir = join(projectPath, '.claude');
  const settingsPath = join(claudeDir, 'settings.json');

  // Ensure .claude/ directory exists
  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
  }

  // Copy hook scripts
  const hooksDir = join(projectPath, 'scripts', 'hooks');
  if (!existsSync(hooksDir)) {
    mkdirSync(hooksDir, { recursive: true });
  }

  const sourceHooksDir = join(__dirname, '..', '..', '..', 'scripts', 'hooks');
  let scriptsCount = 0;
  for (const script of HOOK_SCRIPTS) {
    const src = join(sourceHooksDir, script);
    const dest = join(hooksDir, script);
    if (existsSync(src)) {
      copyFileSync(src, dest);
      scriptsCount++;
    }
  }

  // Read or create settings.json
  let settings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    } catch {
      settings = {};
    }
  }

  // Merge hooks
  if (!settings.hooks) {
    settings.hooks = {};
  }

  for (const [event, entries] of Object.entries(HOOK_CONFIGS)) {
    if (!settings.hooks[event]) {
      settings.hooks[event] = [];
    }
    settings.hooks[event] = mergeHookArray(settings.hooks[event], entries);
  }

  // Write settings.json
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');

  return { installed: true, scriptsCount, settingsPath };
}
