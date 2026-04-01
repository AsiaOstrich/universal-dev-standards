// [Source: docs/specs/SPEC-HOOKS-001-core-standard-hooks.md]
// TDD tests for hooks-installer.js
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { installHooks } from '../../../src/installers/hooks-installer.js';

describe('SPEC-HOOKS-001 / REQ-4: Hook 安裝模組', () => {
  // [Source: SPEC-HOOKS-001:AC-1]

  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-hooks-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('AC-1: 首次安裝 — 無既有 settings.json', () => {
    it('should create .claude/settings.json when none exists', () => {
      // Arrange
      const settingsPath = join(testDir, '.claude', 'settings.json');
      expect(existsSync(settingsPath)).toBe(false);

      // Act
      installHooks(testDir);

      // Assert
      expect(existsSync(settingsPath)).toBe(true);
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      expect(settings.hooks).toBeDefined();
      expect(settings.hooks.PreToolUse).toHaveLength(1);
      expect(settings.hooks.PostToolUse).toHaveLength(1);
      expect(settings.hooks.UserPromptSubmit).toHaveLength(1);
    });

    it('should include correct hook scripts in settings', () => {
      // Act
      installHooks(testDir);

      // Assert
      const settingsPath = join(testDir, '.claude', 'settings.json');
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      expect(settings.hooks.PreToolUse[0].hooks[0]).toContain('check-dangerous-cmd.js');
      expect(settings.hooks.PostToolUse[0].hooks[0]).toContain('check-logging-standard.js');
      expect(settings.hooks.UserPromptSubmit[0].hooks[0]).toContain('validate-commit-msg.js');
    });
  });

  describe('AC-1: 合併安裝 — 既有 settings.json', () => {
    it('should merge hooks into existing settings without overwriting custom config', () => {
      // Arrange
      const claudeDir = join(testDir, '.claude');
      mkdirSync(claudeDir, { recursive: true });
      const existingSettings = {
        customSetting: 'should-be-preserved',
        permissions: { allow: ['Read', 'Write'] },
      };
      writeFileSync(
        join(claudeDir, 'settings.json'),
        JSON.stringify(existingSettings, null, 2)
      );

      // Act
      installHooks(testDir);

      // Assert
      const settings = JSON.parse(readFileSync(join(claudeDir, 'settings.json'), 'utf-8'));
      expect(settings.customSetting).toBe('should-be-preserved');
      expect(settings.permissions.allow).toEqual(['Read', 'Write']);
      expect(settings.hooks).toBeDefined();
      expect(settings.hooks.PreToolUse).toHaveLength(1);
    });
  });

  describe('AC-1: 冪等安裝', () => {
    it('should not create duplicate hook entries on repeated install', () => {
      // Arrange — first install
      installHooks(testDir);

      // Act — second install
      installHooks(testDir);

      // Assert
      const settingsPath = join(testDir, '.claude', 'settings.json');
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      expect(settings.hooks.PreToolUse).toHaveLength(1);
      expect(settings.hooks.PostToolUse).toHaveLength(1);
      expect(settings.hooks.UserPromptSubmit).toHaveLength(1);
    });
  });
});

describe('SPEC-HOOKS-001 / REQ-5: Init 命令整合', () => {
  // [Source: SPEC-HOOKS-001:AC-1]
  // Note: Full integration tests with initCommand belong in tests/e2e/
  // These unit tests verify installHooks() return value

  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-init-hooks-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('AC-1: installHooks return value', () => {
    it('should return installed: true and settingsPath', () => {
      // Act
      const result = installHooks(testDir);

      // Assert
      expect(result.installed).toBe(true);
      expect(result.settingsPath).toContain('settings.json');
    });
  });
});
