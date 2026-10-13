/**
 * Claude Code Compiler — Compiles enforcement standards to .claude/settings.json format
 *
 * Transforms standards with enforcement blocks into Claude Code hook configurations.
 *
 * @module compilers/claude-code-compiler
 * @see docs/specs/SPEC-COMPILE-001-standards-as-hooks-compiler.md (REQ-2)
 */

import { BaseCompiler } from './base-compiler.js';
import { normalizeMatcher } from '../installers/hooks-installer.js';

const DEFAULT_MATCHERS = {
  UserPromptSubmit: '',
  PreToolUse: 'Bash',
  PostToolUse: 'Bash',
};

export class ClaudeCodeCompiler extends BaseCompiler {
  /**
   * Compile enforcement standards into Claude Code hooks config.
   * @param {Array<Object>} standards - Array of parsed standard objects
   * @returns {{ hooks: Object }} Claude Code settings.json hooks section
   */
  compile(standards) {
    const enforceable = this.filterEnforceable(standards);
    const hooks = {};

    for (const std of enforceable) {
      const { hook_script, trigger } = std.enforcement;
      // Claude Code's matcher is a string (https://code.claude.com/docs/en/hooks, "Matcher patterns"). A standard may
      // declare it as an object (`matcher: { tool: Write, path: "src/**/*.ts" }`); that used to be written to
      // settings.json as the object, which the documented format has no place for (XSPEC-482 R4). Same reduction
      // `uds init --with-hooks` and `uds update --with-hooks` apply, so the three write one format.
      const declared = std.enforcement.matcher;
      const matcher = declared === undefined || declared === null
        ? (DEFAULT_MATCHERS[trigger] ?? '')
        : normalizeMatcher(declared); // wire:compile-matcher-is-a-string

      if (!hooks[trigger]) {
        hooks[trigger] = [];
      }

      // Claude Code dispatches on `type`; an entry without one is skipped
      // silently. Measured 2026-09-08 with both shapes in the same event of the
      // same session: the object ran, the bare string did not.
      hooks[trigger].push({
        matcher,
        hooks: [{ type: 'command', command: `node ${hook_script}` }],
      });
    }

    return { hooks };
  }
}
