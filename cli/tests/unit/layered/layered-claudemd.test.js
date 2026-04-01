// [Source: docs/specs/SPEC-LAYERED-001-layered-claudemd.md]
// TDD tests for layered-claudemd.js generator
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { generateLayeredClaudeMd } from '../../../src/generators/layered-claudemd.js';

describe('SPEC-LAYERED-001 / REQ-2: 分層 CLAUDE.md 生成', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-layered-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    // Create .standards dir with a fake standard
    mkdirSync(join(testDir, '.standards'), { recursive: true });
    writeFileSync(join(testDir, '.standards', 'manifest.json'), JSON.stringify({
      standards: ['database-standards.ai.yaml', 'testing.ai.yaml', 'commit-message.ai.yaml'],
    }));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('AC-1: 子目錄 CLAUDE.md 包含 domain 標準', () => {
    it('should generate CLAUDE.md in src/database/', () => {
      // Arrange
      mkdirSync(join(testDir, 'src', 'database'), { recursive: true });

      // Act
      const result = generateLayeredClaudeMd(testDir);

      // Assert
      const claudePath = join(testDir, 'src', 'database', 'CLAUDE.md');
      expect(existsSync(claudePath)).toBe(true);
      const content = readFileSync(claudePath, 'utf-8');
      expect(content).toContain('database');
    });
  });

  describe('AC-2: tests/CLAUDE.md 包含 testing 標準', () => {
    it('should generate CLAUDE.md in tests/', () => {
      mkdirSync(join(testDir, 'tests'), { recursive: true });

      const result = generateLayeredClaudeMd(testDir);

      const claudePath = join(testDir, 'tests', 'CLAUDE.md');
      expect(existsSync(claudePath)).toBe(true);
      const content = readFileSync(claudePath, 'utf-8');
      expect(content).toContain('testing');
    });
  });

  describe('AC-3: 根目錄 CLAUDE.md 只含摘要', () => {
    it('should generate root CLAUDE.md without domain-specific full text', () => {
      mkdirSync(join(testDir, 'src', 'database'), { recursive: true });
      mkdirSync(join(testDir, 'tests'), { recursive: true });

      const result = generateLayeredClaudeMd(testDir);

      expect(existsSync(join(testDir, 'CLAUDE.md'))).toBe(true);
      const root = readFileSync(join(testDir, 'CLAUDE.md'), 'utf-8');
      // Root should mention it's layered
      expect(root).toMatch(/layered|分層|subdirector/i);
    });
  });

  describe('UDS 標記區塊隔離', () => {
    it('should wrap generated content in UDS markers', () => {
      mkdirSync(join(testDir, 'tests'), { recursive: true });

      generateLayeredClaudeMd(testDir);

      const content = readFileSync(join(testDir, 'tests', 'CLAUDE.md'), 'utf-8');
      expect(content).toContain('<!-- UDS:STANDARDS:BEGIN -->');
      expect(content).toContain('<!-- UDS:STANDARDS:END -->');
    });
  });
});

describe('SPEC-LAYERED-001 / REQ-3: Fallback', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-fallback-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('AC-5: 無子目錄 fallback', () => {
    it('should return fallback: true when no matchable subdirectories', () => {
      const result = generateLayeredClaudeMd(testDir);

      expect(result.fallback).toBe(true);
      expect(result.mode).toBe('flat');
    });
  });
});

describe('SPEC-LAYERED-001 / REQ-4: Update 保留自訂內容', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-update-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('AC-4: 不覆蓋自訂內容', () => {
    it('should preserve custom content outside UDS markers on update', () => {
      // Arrange
      const testsDir = join(testDir, 'tests');
      mkdirSync(testsDir, { recursive: true });
      const existingContent = [
        '# My Custom Test Guide',
        '',
        '<!-- UDS:STANDARDS:BEGIN -->',
        'old UDS content here',
        '<!-- UDS:STANDARDS:END -->',
        '',
        '## My Custom Section',
        'This should be preserved.',
      ].join('\n');
      writeFileSync(join(testsDir, 'CLAUDE.md'), existingContent);

      // Act
      generateLayeredClaudeMd(testDir, { update: true });

      // Assert
      const updated = readFileSync(join(testsDir, 'CLAUDE.md'), 'utf-8');
      expect(updated).toContain('My Custom Test Guide');
      expect(updated).toContain('My Custom Section');
      expect(updated).toContain('This should be preserved.');
      expect(updated).not.toContain('old UDS content here');
    });
  });
});
