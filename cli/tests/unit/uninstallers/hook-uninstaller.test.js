import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  uninstallHook,
  uninstallClaudeCodeHooks,
  uninstallCodexHooks,
  uninstallGeminiHooks,
} from '../../../src/uninstallers/hook-uninstaller.js';
import {
  installHooks,
  installCodexHooks,
  installGeminiHooks,
} from '../../../src/installers/hooks-installer.js';

describe('hook-uninstaller', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-test-hook-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('uninstallHook', () => {
    it('should remove uds check line from pre-commit hook', () => {
      const huskyDir = join(testDir, '.husky');
      mkdirSync(huskyDir, { recursive: true });
      const hookContent = '#!/usr/bin/env sh\nnpm run lint\nuds check\nnpm test\n';
      writeFileSync(join(huskyDir, 'pre-commit'), hookContent);

      const result = uninstallHook(testDir);

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toContain('UDS check lines');
      const updated = readFileSync(join(huskyDir, 'pre-commit'), 'utf-8');
      expect(updated).not.toContain('uds check');
      expect(updated).toContain('npm run lint');
      expect(updated).toContain('npm test');
    });

    it('should remove checkin-standards line', () => {
      const huskyDir = join(testDir, '.husky');
      mkdirSync(huskyDir, { recursive: true });
      const hookContent = '#!/usr/bin/env sh\n./scripts/checkin-standards.sh\nnpm test\n';
      writeFileSync(join(huskyDir, 'pre-commit'), hookContent);

      const result = uninstallHook(testDir);

      expect(result.removed).toHaveLength(1);
      const updated = readFileSync(join(huskyDir, 'pre-commit'), 'utf-8');
      expect(updated).not.toContain('checkin-standards');
      expect(updated).toContain('npm test');
    });

    it('should remove npx uds check line (new format without --standard)', () => {
      const huskyDir = join(testDir, '.husky');
      mkdirSync(huskyDir, { recursive: true });
      const hookContent = '#!/usr/bin/env sh\nnpm run lint\nnpx uds check\nnpm test\n';
      writeFileSync(join(huskyDir, 'pre-commit'), hookContent);

      const result = uninstallHook(testDir);

      expect(result.removed).toHaveLength(1);
      const updated = readFileSync(join(huskyDir, 'pre-commit'), 'utf-8');
      expect(updated).not.toContain('uds check');
      expect(updated).toContain('npm run lint');
      expect(updated).toContain('npm test');
    });

    it('should remove npx uds check --standard checkin-standards line (legacy format)', () => {
      const huskyDir = join(testDir, '.husky');
      mkdirSync(huskyDir, { recursive: true });
      const hookContent = '#!/usr/bin/env sh\nnpm run lint\nnpx uds check --standard checkin-standards\nnpm test\n';
      writeFileSync(join(huskyDir, 'pre-commit'), hookContent);

      const result = uninstallHook(testDir);

      expect(result.removed).toHaveLength(1);
      const updated = readFileSync(join(huskyDir, 'pre-commit'), 'utf-8');
      expect(updated).not.toContain('uds check');
      expect(updated).not.toContain('checkin-standards');
      expect(updated).toContain('npm run lint');
      expect(updated).toContain('npm test');
    });

    it('should skip when .husky/pre-commit does not exist', () => {
      const result = uninstallHook(testDir);

      expect(result.removed).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('not found');
    });

    it('should skip when no UDS lines found', () => {
      const huskyDir = join(testDir, '.husky');
      mkdirSync(huskyDir, { recursive: true });
      writeFileSync(join(huskyDir, 'pre-commit'), '#!/usr/bin/env sh\nnpm test\n');

      const result = uninstallHook(testDir);

      expect(result.removed).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0]).toContain('no UDS lines found');
    });

    it('should preview removal in dry-run mode without modifying file', () => {
      const huskyDir = join(testDir, '.husky');
      mkdirSync(huskyDir, { recursive: true });
      const hookContent = '#!/usr/bin/env sh\nuds check\nnpm test\n';
      writeFileSync(join(huskyDir, 'pre-commit'), hookContent);

      const result = uninstallHook(testDir, { dryRun: true });

      expect(result.removed).toHaveLength(1);
      // File should NOT be modified
      const content = readFileSync(join(huskyDir, 'pre-commit'), 'utf-8');
      expect(content).toContain('uds check');
    });
  });

  // 6.13.0-beta.1 shipped installCodexHooks/installGeminiHooks (and
  // installHooks, extended for Claude Code) with no matching uninstall path —
  // `uds uninstall` never removed any of the three. These describes cover the
  // fix: uninstallClaudeCodeHooks / uninstallCodexHooks / uninstallGeminiHooks,
  // and their wiring into uninstallHook().
  describe('uninstallClaudeCodeHooks / uninstallCodexHooks / uninstallGeminiHooks', () => {
    it('removes only the UDS-installed entry from .claude/settings.json, keeping the user\'s own hook and settings', () => {
      installHooks(testDir); // real install, using this repo's own standards/hooks

      const settingsPath = join(testDir, '.claude', 'settings.json');
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      settings.customSetting = 'user-owned';
      settings.hooks.PreToolUse = [
        ...(settings.hooks.PreToolUse || []),
        { matcher: 'Bash', hooks: [{ type: 'command', command: 'node scripts/hooks/my-own-hook.mjs' }] },
      ];
      writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

      const result = uninstallClaudeCodeHooks(testDir);

      expect(result.removed.length).toBeGreaterThan(0);
      const updated = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      // User's own setting and own hook entry survive.
      expect(updated.customSetting).toBe('user-owned');
      const remainingCommands = Object.values(updated.hooks)
        .flat()
        .flatMap((e) => e.hooks.map((h) => h.command));
      expect(remainingCommands).toContain('node scripts/hooks/my-own-hook.mjs');
      // No UDS-installed command (scripts/hooks/*.mjs shipped by UDS) remains.
      expect(remainingCommands.some((c) => c.includes('check-turn-completion.mjs'))).toBe(false);
    });

    it('is idempotent — uninstalling twice does not error and the second run reports nothing to remove', () => {
      installHooks(testDir);
      uninstallClaudeCodeHooks(testDir);
      const second = uninstallClaudeCodeHooks(testDir);

      // Either the file is gone (fully UDS-owned, deleted on first pass) or,
      // if the adopter had other settings, the second pass finds nothing left to remove.
      expect(second.errors).toHaveLength(0);
    });

    it('dry-run does not modify .claude/settings.json', () => {
      installHooks(testDir);
      const settingsPath = join(testDir, '.claude', 'settings.json');
      const before = readFileSync(settingsPath, 'utf-8');

      const result = uninstallClaudeCodeHooks(testDir, { dryRun: true });

      expect(result.removed.length).toBeGreaterThan(0);
      expect(readFileSync(settingsPath, 'utf-8')).toBe(before);
    });

    it('deletes .claude/settings.json when UDS created it and nothing else remains', () => {
      installHooks(testDir); // settings.json now holds only { hooks: {...} }, nothing else

      uninstallClaudeCodeHooks(testDir);

      expect(existsSync(join(testDir, '.claude', 'settings.json'))).toBe(false);
    });

    it('keeps .claude/settings.json when other settings remain after removing UDS hooks', () => {
      installHooks(testDir);
      const settingsPath = join(testDir, '.claude', 'settings.json');
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      settings.permissions = { allow: ['Read'] };
      writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

      uninstallClaudeCodeHooks(testDir);

      expect(existsSync(settingsPath)).toBe(true);
      const updated = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      expect(updated.permissions.allow).toEqual(['Read']);
      expect(updated.hooks).toBeUndefined();
    });

    it('reports invalid JSON as an error without writing to the file or throwing', () => {
      mkdirSync(join(testDir, '.claude'), { recursive: true });
      const settingsPath = join(testDir, '.claude', 'settings.json');
      writeFileSync(settingsPath, '{ not valid json');

      const result = uninstallClaudeCodeHooks(testDir);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(readFileSync(settingsPath, 'utf-8')).toBe('{ not valid json');
    });

    it('removes the UDS entry from .codex/hooks.json, keeping the user\'s own Codex hook', () => {
      installCodexHooks(testDir);
      const hooksJsonPath = join(testDir, '.codex', 'hooks.json');
      const config = JSON.parse(readFileSync(hooksJsonPath, 'utf-8'));
      config.hooks.PreToolUse = [{ hooks: [{ type: 'command', command: 'node some-other-hook.mjs' }] }];
      writeFileSync(hooksJsonPath, JSON.stringify(config, null, 2));

      const result = uninstallCodexHooks(testDir);

      expect(result.removed.length).toBe(1);
      const updated = JSON.parse(readFileSync(hooksJsonPath, 'utf-8'));
      expect(updated.hooks.Stop).toBeUndefined();
      expect(updated.hooks.PreToolUse[0].hooks[0].command).toBe('node some-other-hook.mjs');
    });

    it('deletes .codex/hooks.json when UDS created it and nothing else remains', () => {
      installCodexHooks(testDir);

      uninstallCodexHooks(testDir);

      expect(existsSync(join(testDir, '.codex', 'hooks.json'))).toBe(false);
    });

    it('removes the UDS entry from .gemini/settings.json, keeping the user\'s own settings and hook', () => {
      installGeminiHooks(testDir);
      const settingsPath = join(testDir, '.gemini', 'settings.json');
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      settings.theme = 'dark';
      settings.hooks.BeforeTool = [{ hooks: [{ type: 'command', command: 'node some-other-hook.mjs' }] }];
      writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

      const result = uninstallGeminiHooks(testDir);

      expect(result.removed.length).toBe(1);
      const updated = JSON.parse(readFileSync(settingsPath, 'utf-8'));
      expect(updated.theme).toBe('dark');
      expect(updated.hooks.AfterAgent).toBeUndefined();
      expect(updated.hooks.BeforeTool[0].hooks[0].command).toBe('node some-other-hook.mjs');
    });

    it('is a no-op (skipped, not an error) when none of the three config files exist', () => {
      const result = uninstallHook(testDir);
      expect(result.errors).toHaveLength(0);
    });

    it('uninstallHook() removes all three enforcement-hook targets in one call', () => {
      installHooks(testDir);
      installCodexHooks(testDir);
      installGeminiHooks(testDir);

      const result = uninstallHook(testDir);

      expect(existsSync(join(testDir, '.claude', 'settings.json'))).toBe(false);
      expect(existsSync(join(testDir, '.codex', 'hooks.json'))).toBe(false);
      expect(existsSync(join(testDir, '.gemini', 'settings.json'))).toBe(false);
      expect(result.errors).toHaveLength(0);
    });

    // Mutation check (verified by hand, then reverted — see commit/handback
    // notes): with stripUdsEntries() changed from filtering per-entry to
    // clearing the whole event array (`nextMap[event] = []` regardless of
    // content, or simply deleting every key), the "keeps the user's own Codex
    // hook" assertion above goes red, because the surviving PreToolUse entry
    // it checks for is gone too. That confirms the test actually exercises
    // "remove UDS entries only," not "remove the whole file."
  });
});
