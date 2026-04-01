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

  // Compile
  const compiler = new CompilerClass();
  const config = compiler.compile(standards);
  const compiledCount = compiler.filterEnforceable(standards).length;

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

    // Merge hooks (replace UDS-compiled hooks entirely)
    settings.hooks = { ...(settings.hooks || {}), ...config.hooks };
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  }

  return {
    success: true,
    config,
    compiledCount,
    dryRun: !!options.dryRun,
  };
}
