// [Source: docs/specs/SPEC-COMPILE-001-standards-as-hooks-compiler.md]
// TDD tests for claude-code-compiler.js
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect } from 'vitest';
import { ClaudeCodeCompiler } from '../../../src/compilers/claude-code-compiler.js';

const ENFORCEMENT_STANDARDS = [
  {
    id: 'commit-message',
    enforcement: {
      hook_script: 'scripts/hooks/validate-commit-msg.js',
      trigger: 'UserPromptSubmit',
      severity: 'error',
    },
  },
  {
    id: 'security-standards',
    enforcement: {
      hook_script: 'scripts/hooks/check-dangerous-cmd.js',
      trigger: 'PreToolUse',
      severity: 'error',
    },
  },
  {
    id: 'logging',
    enforcement: {
      hook_script: 'scripts/hooks/check-logging-standard.js',
      trigger: 'PostToolUse',
      severity: 'warning',
    },
  },
];

describe('SPEC-COMPILE-001 / REQ-2: Claude Code 編譯器', () => {

  describe('AC-1: 編譯 3 個 enforcement 標準', () => {
    it('should produce hooks config with 3 trigger events', () => {
      // Arrange
      const compiler = new ClaudeCodeCompiler();

      // Act
      const result = compiler.compile(ENFORCEMENT_STANDARDS);

      // Assert
      expect(result.hooks).toBeDefined();
      expect(result.hooks.UserPromptSubmit).toHaveLength(1);
      expect(result.hooks.PreToolUse).toHaveLength(1);
      expect(result.hooks.PostToolUse).toHaveLength(1);
    });

    it('should include correct hook script paths', () => {
      const compiler = new ClaudeCodeCompiler();
      const result = compiler.compile(ENFORCEMENT_STANDARDS);

      expect(result.hooks.UserPromptSubmit[0].hooks[0]).toContain('validate-commit-msg.js');
      expect(result.hooks.PreToolUse[0].hooks[0]).toContain('check-dangerous-cmd.js');
      expect(result.hooks.PostToolUse[0].hooks[0]).toContain('check-logging-standard.js');
    });
  });

  describe('AC-1: trigger 對應', () => {
    it('should map PreToolUse trigger to hooks.PreToolUse with Bash matcher', () => {
      const compiler = new ClaudeCodeCompiler();
      const standards = [ENFORCEMENT_STANDARDS[1]]; // security-standards

      const result = compiler.compile(standards);

      expect(result.hooks.PreToolUse).toHaveLength(1);
      expect(result.hooks.PreToolUse[0].matcher).toBe('Bash');
    });

    it('should map UserPromptSubmit trigger with empty matcher', () => {
      const compiler = new ClaudeCodeCompiler();
      const standards = [ENFORCEMENT_STANDARDS[0]]; // commit-message

      const result = compiler.compile(standards);

      expect(result.hooks.UserPromptSubmit[0].matcher).toBe('');
    });

    it('should map PostToolUse trigger with Bash matcher', () => {
      const compiler = new ClaudeCodeCompiler();
      const standards = [ENFORCEMENT_STANDARDS[2]]; // logging

      const result = compiler.compile(standards);

      expect(result.hooks.PostToolUse[0].matcher).toBe('Bash');
    });
  });

  describe('AC-2: 無 enforcement 標準被忽略', () => {
    it('should produce empty hooks when no enforcement standards', () => {
      const compiler = new ClaudeCodeCompiler();
      const standards = [
        { id: 'testing' },
        { id: 'git-workflow' },
      ];

      const result = compiler.compile(standards);

      expect(Object.keys(result.hooks)).toHaveLength(0);
    });

    it('should only compile enforceable standards from mixed input', () => {
      const compiler = new ClaudeCodeCompiler();
      const mixed = [
        { id: 'testing' },
        ...ENFORCEMENT_STANDARDS,
        { id: 'git-workflow' },
      ];

      const result = compiler.compile(mixed);

      // Should still have exactly 3 hooks
      expect(result.hooks.UserPromptSubmit).toHaveLength(1);
      expect(result.hooks.PreToolUse).toHaveLength(1);
      expect(result.hooks.PostToolUse).toHaveLength(1);
    });
  });
});
