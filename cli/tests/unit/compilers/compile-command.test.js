// [Source: docs/specs/SPEC-COMPILE-001-standards-as-hooks-compiler.md]
// TDD tests for compile.js CLI command
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { compileStandards } from '../../../src/commands/compile.js';

describe('SPEC-COMPILE-001 / REQ-3: Compile 命令', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-compile-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('AC-1: compile --target=claude-code', () => {
    it('should produce correct hooks config from standards dir', () => {
      // Arrange — create .standards with enforcement yaml
      const stdDir = join(testDir, '.standards');
      mkdirSync(stdDir, { recursive: true });
      writeFileSync(join(stdDir, 'commit-message.ai.yaml'), [
        'standard:',
        '  id: commit-message',
        'enforcement:',
        '  hook_script: scripts/hooks/validate-commit-msg.js',
        '  trigger: UserPromptSubmit',
        '  severity: error',
      ].join('\n'));
      writeFileSync(join(stdDir, 'testing.ai.yaml'), [
        'standard:',
        '  id: testing',
        '# no enforcement',
      ].join('\n'));

      // Act
      const result = compileStandards(testDir, { target: 'claude-code' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.config.hooks.UserPromptSubmit).toHaveLength(1);
      expect(result.compiledCount).toBe(1);
    });
  });

  describe('AC-1: compile --dry-run', () => {
    it('should return config without writing files', () => {
      // Arrange
      const stdDir = join(testDir, '.standards');
      mkdirSync(stdDir, { recursive: true });
      writeFileSync(join(stdDir, 'security-standards.ai.yaml'), [
        'standard:',
        '  id: security-standards',
        'enforcement:',
        '  hook_script: scripts/hooks/check-dangerous-cmd.js',
        '  trigger: PreToolUse',
        '  severity: error',
      ].join('\n'));

      // Act
      const result = compileStandards(testDir, { target: 'claude-code', dryRun: true });

      // Assert
      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      // Should NOT write .claude/settings.json
      expect(existsSync(join(testDir, '.claude', 'settings.json'))).toBe(false);
    });
  });

  describe('AC-1: 寫入 settings.json', () => {
    it('should write .claude/settings.json when not dry-run', () => {
      // Arrange
      const stdDir = join(testDir, '.standards');
      mkdirSync(stdDir, { recursive: true });
      writeFileSync(join(stdDir, 'logging.ai.yaml'), [
        'standard:',
        '  id: logging',
        'enforcement:',
        '  hook_script: scripts/hooks/check-logging-standard.js',
        '  trigger: PostToolUse',
        '  severity: warning',
      ].join('\n'));

      // Act
      const result = compileStandards(testDir, { target: 'claude-code' });

      // Assert
      expect(result.success).toBe(true);
      const settingsPath = join(testDir, '.claude', 'settings.json');
      expect(existsSync(settingsPath)).toBe(true);
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      expect(settings.hooks.PostToolUse).toHaveLength(1);
    });
  });

  describe('AC-2: 無 enforcement 標準不受影響', () => {
    it('should produce empty hooks when no enforcement standards', () => {
      // Arrange
      const stdDir = join(testDir, '.standards');
      mkdirSync(stdDir, { recursive: true });
      writeFileSync(join(stdDir, 'testing.ai.yaml'), 'standard:\n  id: testing\n');
      writeFileSync(join(stdDir, 'git-workflow.ai.yaml'), 'standard:\n  id: git-workflow\n');

      // Act
      const result = compileStandards(testDir, { target: 'claude-code' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.compiledCount).toBe(0);
    });
  });

  describe('未初始化的專案', () => {
    it('should return error when no .standards directory', () => {
      // Act
      const result = compileStandards(testDir, { target: 'claude-code' });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/not initialized|init/i);
    });
  });
});
