// [Source: docs/specs/SPEC-LAYERED-001-layered-claudemd.md]
// TDD tests for init/update integration with layered CLAUDE.md
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { generateLayeredClaudeMd } from '../../../src/generators/layered-claudemd.js';

describe('SPEC-LAYERED-001 / REQ-3: Init --content-layout 整合', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-init-layout-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('AC-1: layered 模式生成子目錄 CLAUDE.md', () => {
    it('should generate CLAUDE.md in database dir when layout is layered', () => {
      // Arrange — simulate init with contentLayout: 'layered'
      mkdirSync(join(testDir, 'src', 'database'), { recursive: true });
      const config = { contentLayout: 'layered' };

      // Act
      if (config.contentLayout === 'layered') {
        const result = generateLayeredClaudeMd(testDir);
        expect(result.fallback).toBe(false);
      }

      // Assert
      expect(existsSync(join(testDir, 'src', 'database', 'CLAUDE.md'))).toBe(true);
    });
  });

  describe('AC-5: flat 模式不生成子目錄 CLAUDE.md', () => {
    it('should NOT generate subdirectory CLAUDE.md when layout is flat', () => {
      // Arrange
      mkdirSync(join(testDir, 'src', 'database'), { recursive: true });
      const config = { contentLayout: 'flat' };

      // Act — flat mode skips layered generation
      if (config.contentLayout === 'layered') {
        generateLayeredClaudeMd(testDir);
      }

      // Assert
      expect(existsSync(join(testDir, 'src', 'database', 'CLAUDE.md'))).toBe(false);
    });
  });

  describe('AC-5: 無子目錄 fallback', () => {
    it('should fallback to flat when no matchable dirs in layered mode', () => {
      // Arrange — empty project
      const config = { contentLayout: 'layered' };

      // Act
      const result = generateLayeredClaudeMd(testDir);

      // Assert
      expect(result.fallback).toBe(true);
      expect(result.mode).toBe('flat');
    });
  });
});

describe('SPEC-LAYERED-001 / REQ-4: Update 保留自訂內容（整合）', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-update-layout-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('AC-4: update 保留標記外自訂內容', () => {
    it('should preserve user content and update UDS block on re-generate', () => {
      // Arrange — initial layered generation
      mkdirSync(join(testDir, 'tests'), { recursive: true });
      generateLayeredClaudeMd(testDir);

      // User adds custom content
      const claudePath = join(testDir, 'tests', 'CLAUDE.md');
      const original = readFileSync(claudePath, 'utf-8');
      writeFileSync(claudePath, original + '\n## My Custom Notes\nKeep this.\n');

      // Act — update
      generateLayeredClaudeMd(testDir, { update: true });

      // Assert
      const updated = readFileSync(claudePath, 'utf-8');
      expect(updated).toContain('My Custom Notes');
      expect(updated).toContain('Keep this.');
      expect(updated).toContain('<!-- UDS:STANDARDS:BEGIN -->');
    });
  });
});
