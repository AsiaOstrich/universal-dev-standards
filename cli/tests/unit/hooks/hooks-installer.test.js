// [Source: docs/specs/SPEC-HOOKS-001-core-standard-hooks.md]
// TDD tests for hooks-installer.js
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { installHooks, collectHookConfigs, standardsSourceDir, hooksSourceDir }
  from '../../../src/installers/hooks-installer.js';

/**
 * Every hook command in a settings.json, flattened.
 *
 * The set of hooks is derived from the standards' enforcement blocks, so a
 * positional assertion ("PreToolUse has exactly one entry") is an enumeration
 * that goes stale the moment a standard declares a hook. These helpers let the
 * assertions say what must be true regardless of how many there are.
 */
const commandsIn = (settings) =>
  Object.values(settings.hooks ?? {}).flatMap((entries) =>
    entries.flatMap((e) => (e.hooks ?? []).map((h) => (typeof h === 'string' ? h : h.command))));

const expectedScripts = () =>
  collectHookConfigs(standardsSourceDir(), hooksSourceDir()).scripts;

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
      // Every declared enforcement block produced exactly one command.
      const cmds = commandsIn(settings);
      const scripts = expectedScripts();
      expect(scripts.length).toBeGreaterThan(0);
      for (const script of scripts) {
        expect(cmds.filter((c) => c.endsWith(script))).toHaveLength(1);
      }
    });

    it('should include correct hook scripts in settings', () => {
      // Act
      installHooks(testDir);

      // Assert
      const settingsPath = join(testDir, '.claude', 'settings.json');
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      // Shape: Claude Code dispatches on `type` and skips an entry without one,
      // in silence. A bare string was shipped for months.
      for (const entries of Object.values(settings.hooks)) {
        for (const entry of entries) {
          expect(typeof entry.matcher).toBe('string');
          for (const hook of entry.hooks) {
            expect(hook.type).toBe('command');
            expect(typeof hook.command).toBe('string');
          }
        }
      }
      const cmds = commandsIn(settings).join('\n');
      expect(cmds).toContain('check-dangerous-cmd.mjs');
      expect(cmds).toContain('check-logging-standard.mjs');
      expect(cmds).toContain('validate-commit-msg.mjs');
      expect(settings.hooks.Stop).toBeDefined();
      expect(cmds).toContain('check-turn-completion.mjs');
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
      expect(commandsIn(settings).length).toBe(expectedScripts().length);
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
      const cmds = commandsIn(settings);
      expect(cmds.length).toBe(expectedScripts().length);
      expect(new Set(cmds).size).toBe(cmds.length);
    });
  });
});

describe('SPEC-HOOKS-001 / REQ-5: Init 命令整合', () => {
  // [Source: SPEC-HOOKS-001:AC-1]

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

  describe('AC-1: conditional install based on withHooks flag', () => {
    it('should install hooks when withHooks is true', () => {
      // Arrange
      const config = { withHooks: true };

      // Act — simulate init logic
      if (config.withHooks) {
        installHooks(testDir);
      }

      // Assert
      const settingsPath = join(testDir, '.claude', 'settings.json');
      expect(existsSync(settingsPath)).toBe(true);
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      expect(settings.hooks).toBeDefined();
    });

    it('should NOT install hooks when withHooks is falsy', () => {
      // Arrange
      const config = { withHooks: false };

      // Act — simulate init logic
      if (config.withHooks) {
        installHooks(testDir);
      }

      // Assert
      const settingsPath = join(testDir, '.claude', 'settings.json');
      expect(existsSync(settingsPath)).toBe(false);
    });
  });
});
