/**
 * UDS Compile Command
 *
 * Reads installed standards, filters those with enforcement blocks,
 * and compiles them into target-specific hook configurations.
 *
 * @module commands/compile
 * @see docs/specs/SPEC-COMPILE-001-standards-as-hooks-compiler.md (REQ-3)
 */

import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';
import { ClaudeCodeCompiler } from '../compilers/claude-code-compiler.js';
import { mergeHookArray, normalizeMatcher } from '../installers/hooks-installer.js';

const COMPILERS = {
  'claude-code': ClaudeCodeCompiler,
};

/**
 * Parse a .ai.yaml file and extract standard info with enforcement.
 * @param {string} filePath
 * @returns {Object|null}
 */
function parseStandard(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const parsed = load(content);
    if (!parsed) return null;

    const id = parsed.standard?.id || parsed.id || null;
    const enforcement = parsed.enforcement || null;

    return { id, enforcement, _file: filePath };
  } catch {
    return null;
  }
}

/**
 * An entry an earlier `uds compile` wrote with an object matcher (`{ "tool": "Bash" }`) is brought to the string form.
 * Only entries that run a UDS hook script (`node scripts/hooks/...`) are touched; any other entry is returned as it is.
 */
function repairUdsMatcher(entry) {
  const command = entry && entry.hooks && entry.hooks[0] && entry.hooks[0].command;
  if (typeof command !== 'string' || !command.startsWith('node scripts/hooks/')) return entry;
  if (typeof entry.matcher === 'string' || entry.matcher === undefined) return entry;
  return { ...entry, matcher: normalizeMatcher(entry.matcher) };
}

/**
 * Compile enforcement standards into target-specific hook configurations.
 *
 * @param {string} projectPath - Project root path
 * @param {Object} options
 * @param {string} options.target - Target platform (e.g., 'claude-code')
 * @param {boolean} [options.dryRun] - Preview without writing files
 * @returns {{ success: boolean, config?: Object, compiledCount?: number, dryRun?: boolean, error?: string }}
 */
export function compileStandards(projectPath, options = {}) {
  const standardsDir = join(projectPath, '.standards');

  // Check if initialized
  if (!existsSync(standardsDir)) {
    return {
      success: false,
      error: 'Project not initialized. Run "uds init" first.',
    };
  }

  // Get compiler for target
  const CompilerClass = COMPILERS[options.target];
  if (!CompilerClass) {
    return {
      success: false,
      error: `Unknown target: ${options.target}. Supported: ${Object.keys(COMPILERS).join(', ')}`,
    };
  }

  // Read and parse all .ai.yaml files
  const files = readdirSync(standardsDir).filter((f) => f.endsWith('.ai.yaml'));
  const standards = files
    .map((f) => parseStandard(join(standardsDir, f)))
    .filter(Boolean);

  // Only a standard whose hook script is really in the project is compiled. A settings.json entry for a script that
  // is not there makes the tool fail on every call of that event (XSPEC-482 R4c); `uds init --with-hooks` /
  // `uds update --with-hooks` skip such a standard and say so, and so does this.
  const skipped = [];
  const present = standards.filter((s) => {
    if (s.enforcement == null) return true;
    const script = s.enforcement.hook_script;
    if (typeof script === 'string' && script && existsSync(join(projectPath, script))) return true; // wire:compile-skips-missing-script
    skipped.push({ id: s.id || s._file, why: `hook script not found: ${script ?? '(none declared)'}` });
    return false;
  });

  // Compile
  const compiler = new CompilerClass();
  const config = compiler.compile(present);
  const compiledCount = compiler.filterEnforceable(present).length;

  // Write output (unless dry-run)
  if (!options.dryRun && compiledCount > 0) {
    const claudeDir = join(projectPath, '.claude');
    const settingsPath = join(claudeDir, 'settings.json');

    if (!existsSync(claudeDir)) {
      mkdirSync(claudeDir, { recursive: true });
    }

    // Merge with existing settings
    let settings = {};
    if (existsSync(settingsPath)) {
      try {
        settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      } catch {
        settings = {};
      }
    }

    // Merge hooks the way `uds update --with-hooks` does (XSPEC-482 R4a): the project's own entries, on the same event
    // or not, stay exactly as they are, and an entry UDS already wrote is not written twice. This used to replace the
    // whole array of every event the standards touched, which deleted a user's own hook on that event.
    settings.hooks = settings.hooks || {};
    for (const [event, entries] of Object.entries(settings.hooks)) {
      settings.hooks[event] = (entries || []).map(repairUdsMatcher);
    }
    for (const [event, incoming] of Object.entries(config.hooks)) {
      settings.hooks[event] = mergeHookArray(settings.hooks[event] || [], incoming); // wire:compile-merges-hooks
    }
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  }

  return {
    success: true,
    config,
    compiledCount,
    skipped,
    dryRun: !!options.dryRun,
  };
}
