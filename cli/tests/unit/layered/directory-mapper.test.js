// [Source: docs/specs/SPEC-LAYERED-001-layered-claudemd.md]
// TDD tests for directory-mapper.js
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { mapStandardsToDirectories, DEFAULT_MAPPINGS } from '../../../src/utils/directory-mapper.js';

describe('SPEC-LAYERED-001 / REQ-1: 標準→目錄映射', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-mapper-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('AC-1: database 標準映射', () => {
    it('should map database-standards to src/database/', () => {
      // Arrange
      mkdirSync(join(testDir, 'src', 'database'), { recursive: true });

      // Act
      const result = mapStandardsToDirectories(testDir);

      // Assert
      expect(result['database-standards']).toContain('src/database');
    });

    it('should map database-standards to src/db/', () => {
      mkdirSync(join(testDir, 'src', 'db'), { recursive: true });
      const result = mapStandardsToDirectories(testDir);
      expect(result['database-standards']).toContain('src/db');
    });

    it('should map database-standards to src/models/', () => {
      mkdirSync(join(testDir, 'src', 'models'), { recursive: true });
      const result = mapStandardsToDirectories(testDir);
      expect(result['database-standards']).toContain('src/models');
    });
  });

  describe('AC-2: testing 標準映射', () => {
    it('should map testing standards to tests/', () => {
      mkdirSync(join(testDir, 'tests'), { recursive: true });
      const result = mapStandardsToDirectories(testDir);
      expect(result['testing']).toContain('tests');
    });

    it('should map testing standards to __tests__/', () => {
      mkdirSync(join(testDir, '__tests__'), { recursive: true });
      const result = mapStandardsToDirectories(testDir);
      expect(result['testing']).toContain('__tests__');
    });
  });

  describe('AC-1: API 標準映射', () => {
    it('should map api-design-standards to src/api/', () => {
      mkdirSync(join(testDir, 'src', 'api'), { recursive: true });
      const result = mapStandardsToDirectories(testDir);
      expect(result['api-design-standards']).toContain('src/api');
    });

    it('should map api-design-standards to src/routes/', () => {
      mkdirSync(join(testDir, 'src', 'routes'), { recursive: true });
      const result = mapStandardsToDirectories(testDir);
      expect(result['api-design-standards']).toContain('src/routes');
    });
  });

  describe('AC-3: 無匹配目錄的標準歸入根目錄', () => {
    it('should assign unmatched standards to _root', () => {
      // Arrange — empty project, no matching dirs
      const result = mapStandardsToDirectories(testDir);

      // Assert — all standards should be in _root
      expect(result._root).toBeDefined();
      expect(result._root.length).toBeGreaterThan(0);
    });

    it('should not include matched standards in _root', () => {
      mkdirSync(join(testDir, 'tests'), { recursive: true });
      const result = mapStandardsToDirectories(testDir);

      // testing should NOT be in _root since it has a match
      expect(result._root).not.toContain('testing');
      expect(result['testing']).toBeDefined();
    });
  });

  describe('DEFAULT_MAPPINGS export', () => {
    it('should export a non-empty DEFAULT_MAPPINGS object', () => {
      expect(DEFAULT_MAPPINGS).toBeDefined();
      expect(Object.keys(DEFAULT_MAPPINGS).length).toBeGreaterThan(0);
    });

    it('should have database-standards in mappings', () => {
      expect(DEFAULT_MAPPINGS['database-standards']).toBeDefined();
    });

    it('should have testing in mappings', () => {
      expect(DEFAULT_MAPPINGS['testing']).toBeDefined();
    });
  });
});
