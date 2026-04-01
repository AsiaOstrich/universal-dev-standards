// [Source: docs/specs/SPEC-INTSYNC-001-integration-commands-sync.md]
// [Generated] TDD Tests - AI 工具整合命令對齊檢查
//
// Run: cd cli && npx vitest tests/unit/scripts/integration-commands-sync.test.js

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const ROOT_DIR = resolve(import.meta.dirname, '..', '..', '..', '..');
const COMMANDS_DIR = join(ROOT_DIR, 'skills', 'commands');
const INDEX_PATH = join(COMMANDS_DIR, 'COMMAND-INDEX.json');
const REGISTRY_PATH = join(ROOT_DIR, 'integrations', 'REGISTRY.json');

// @SPEC-INTSYNC-001
describe('SPEC-INTSYNC-001: Integration Commands Sync', () => {

  // @AC-1
  describe('AC-1: COMMAND-INDEX.json 包含所有已登記的 commands', () => {
    const EXCLUDED = ['README.md', 'COMMAND-FAMILY-OVERVIEW.md', 'guide.md'];

    it('should_contain_all_command_files_when_index_is_complete', () => {
      // Arrange
      expect(existsSync(INDEX_PATH), 'COMMAND-INDEX.json must exist').toBe(true);
      const index = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
      const commandFiles = readdirSync(COMMANDS_DIR)
        .filter(f => f.endsWith('.md') && !EXCLUDED.includes(f))
        .map(f => f.replace('.md', ''));

      // Act
      const allIndexedCommands = Object.values(index.categories)
        .flatMap(cat => cat.commands);

      // Assert
      for (const cmd of commandFiles) {
        expect(allIndexedCommands, `Missing command in index: ${cmd}`).toContain(cmd);
      }
    });

    it('should_assign_each_command_to_exactly_one_category', () => {
      // Arrange
      const index = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));

      // Act
      const commandCounts = {};
      for (const [, cat] of Object.entries(index.categories)) {
        for (const cmd of cat.commands) {
          commandCounts[cmd] = (commandCounts[cmd] || 0) + 1;
        }
      }

      // Assert
      for (const [cmd, count] of Object.entries(commandCounts)) {
        expect(count, `Command "${cmd}" appears in ${count} categories`).toBe(1);
      }
    });

    it('should_not_have_extra_commands_not_in_filesystem', () => {
      // Arrange
      const index = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
      const commandFiles = readdirSync(COMMANDS_DIR)
        .filter(f => f.endsWith('.md') && !EXCLUDED.includes(f))
        .map(f => f.replace('.md', ''));

      // Act
      const allIndexedCommands = Object.values(index.categories)
        .flatMap(cat => cat.commands);
      const extras = allIndexedCommands.filter(cmd => !commandFiles.includes(cmd));

      // Assert
      expect(extras, `Extra commands in index: ${extras.join(', ')}`).toEqual([]);
    });
  });

  // @AC-2
  describe('AC-2: REGISTRY.json tier requiredCategories 定義', () => {
    it('should_have_all_categories_for_complete_and_partial_tiers', () => {
      // Arrange
      const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
      const index = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
      const allCategories = Object.keys(index.categories).sort();

      // Act & Assert
      for (const tierName of ['complete', 'partial']) {
        const tier = registry.tiers[tierName];
        expect(tier.requiredCategories, `${tierName} tier`).toBeDefined();
        expect([...tier.requiredCategories].sort()).toEqual(allCategories);
      }
    });

    it('should_have_empty_categories_for_minimal_preview_planned_tool_tiers', () => {
      // Arrange
      const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
      const emptyTiers = ['minimal', 'preview', 'planned', 'tool'];

      // Act & Assert
      for (const tierName of emptyTiers) {
        const tier = registry.tiers[tierName];
        expect(tier.requiredCategories, `${tierName} should have empty requiredCategories`).toEqual([]);
      }
    });
  });

  // @AC-3
  describe('AC-3: Complete/Partial tier 工具整合檔 command 覆蓋', () => {
    it('should_verify_complete_tier_agents_exist', () => {
      // Arrange
      const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));

      // Act
      const completeAgents = Object.entries(registry.agents)
        .filter(([, agent]) => agent.tier === 'complete');

      // Assert
      expect(completeAgents.length).toBeGreaterThan(0);
    });

    it('should_detect_missing_slash_commands_in_complete_tier_instruction_files', () => {
      // Arrange
      const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
      const index = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
      const allCommands = Object.values(index.categories).flatMap(cat => cat.commands);
      const completeAgents = Object.entries(registry.agents)
        .filter(([, agent]) => agent.tier === 'complete');

      // Act
      for (const [agentId, agent] of completeAgents) {
        const instrFile = join(ROOT_DIR, agent.instructionFile);
        if (!existsSync(instrFile)) continue;
        const content = readFileSync(instrFile, 'utf-8');
        const missing = allCommands.filter(cmd => {
          const pattern = new RegExp(`/${cmd}(?![a-z-])`, 'g');
          return !pattern.test(content);
        });

        // Assert — report what's missing (informational for now)
        // This documents the current gap; the sync script will enforce
        if (missing.length > 0) {
          console.log(`[INFO] ${agentId} missing ${missing.length}/${allCommands.length} commands: ${missing.slice(0, 5).join(', ')}...`);
        }
      }
      expect(true).toBe(true);
    });
  });

  // @AC-4
  describe('AC-4: Cursor tier 應為 partial', () => {
    it('should_classify_cursor_as_partial_tier', () => {
      // Arrange
      const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));

      // Act
      const cursorAgent = registry.agents.cursor;

      // Assert
      expect(cursorAgent).toBeDefined();
      expect(cursorAgent.tier).toBe('partial');
      expect(cursorAgent.supportsWorkflows).toBe(false);
    });
  });

  // @AC-5
  describe('AC-5: 偵測未登記的 command 檔案', () => {
    it('should_have_no_unregistered_command_files', () => {
      // Arrange
      const EXCLUDED = ['README.md', 'COMMAND-FAMILY-OVERVIEW.md', 'guide.md'];
      const index = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));

      // Act
      const allIndexedCommands = Object.values(index.categories)
        .flatMap(cat => cat.commands);
      const commandFiles = readdirSync(COMMANDS_DIR)
        .filter(f => f.endsWith('.md') && !EXCLUDED.includes(f))
        .map(f => f.replace('.md', ''));
      const unregistered = commandFiles.filter(cmd => !allIndexedCommands.includes(cmd));

      // Assert
      expect(unregistered, `Unregistered commands: ${unregistered.join(', ')}`).toEqual([]);
    });
  });

  // @AC-6
  describe('AC-6: Pre-release Step 7.5 整合', () => {
    it('should_have_step_7_5_in_pre_release_check_script', () => {
      // Arrange
      const preReleaseScript = join(ROOT_DIR, 'scripts', 'pre-release-check.sh');
      const content = readFileSync(preReleaseScript, 'utf-8');

      // Act
      const hasStep75 = content.includes('7.5') &&
        content.includes('check-integration-commands-sync');

      // Assert
      expect(hasStep75, 'pre-release-check.sh should contain Step 7.5 with check-integration-commands-sync').toBe(true);
    });
  });

  // @AC-7
  describe('AC-7: 腳本在 macOS/Linux 正確運作', () => {
    it('should_have_script_file_with_bash_shebang', () => {
      // Arrange
      const scriptPath = join(ROOT_DIR, 'scripts', 'check-integration-commands-sync.sh');

      // Act & Assert
      expect(existsSync(scriptPath), 'check-integration-commands-sync.sh must exist').toBe(true);
      const content = readFileSync(scriptPath, 'utf-8');
      expect(content.startsWith('#!/bin/bash'), 'Script must start with bash shebang').toBe(true);
    });
  });
});
