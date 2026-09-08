/**
 * Claude Code Compiler — Compiles enforcement standards to .claude/settings.json format
 *
 * Transforms standards with enforcement blocks into Claude Code hook configurations.
 *
 * @module compilers/claude-code-compiler
 * @see docs/specs/SPEC-COMPILE-001-standards-as-hooks-compiler.md (REQ-2)
 */

import { BaseCompiler } from './base-compiler.js';

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
      const matcher = std.enforcement.matcher ?? DEFAULT_MATCHERS[trigger] ?? '';

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
