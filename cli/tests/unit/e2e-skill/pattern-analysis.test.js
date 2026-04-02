/**
 * TDD tests for SPEC-E2E-001 REQ-3: 既有模式分析
 * Source: docs/specs/skills/SPEC-E2E-001-e2e-skill.md
 * AC Coverage: AC-11, AC-12
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import { analyzeExistingPatterns } from '../../../src/utils/e2e-analyzer.js';

describe('SPEC-E2E-001: /e2e Skill', () => {
  let testDir;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'e2e-pattern-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('REQ-3: 既有模式分析', () => {
    // AC-11: 分析既有 E2E 測試的編碼模式
    describe('AC-11: 學習既有測試模式', () => {
      it('should extract import sources from existing E2E tests', () => {
        // Arrange
        const e2eDir = join(testDir, 'tests', 'e2e');
        mkdirSync(e2eDir, { recursive: true });
        writeFileSync(join(e2eDir, 'init-flow.test.js'), `
import { runNonInteractive, createTempDir } from '../utils/cli-runner.js';
import { describe, it, expect } from 'vitest';
describe('init', () => { it('works', () => {}); });
`);
        writeFileSync(join(e2eDir, 'list-flow.test.js'), `
import { runNonInteractive } from '../utils/cli-runner.js';
import { describe, it, expect } from 'vitest';
describe('list', () => { it('works', () => {}); });
`);
        writeFileSync(join(e2eDir, 'config-flow.test.js'), `
import { runNonInteractive, runInteractive } from '../utils/cli-runner.js';
import { describe, it, expect } from 'vitest';
describe('config', () => { it('works', () => {}); });
`);

        // Act
        const patterns = analyzeExistingPatterns(e2eDir);

        // Assert
        expect(patterns.imports).toBeDefined();
        expect(patterns.imports).toContain('../utils/cli-runner.js');
        expect(patterns.helpers).toContain('runNonInteractive');
        expect(patterns.summary).toBeDefined();
        expect(patterns.useDefault).toBe(false);
      });

      it('should detect assertion style from existing tests', () => {
        // Arrange
        const e2eDir = join(testDir, 'tests', 'e2e');
        mkdirSync(e2eDir, { recursive: true });
        writeFileSync(join(e2eDir, 'a.test.js'), `
import { expect } from 'vitest';
expect(x).toContain('hello');
expect(y).toBe(true);
`);
        writeFileSync(join(e2eDir, 'b.test.js'), `
import { expect } from 'vitest';
expect(z).toContain('world');
`);
        writeFileSync(join(e2eDir, 'c.test.js'), `
import { expect } from 'vitest';
expect(w).toBe(1);
`);

        // Act
        const patterns = analyzeExistingPatterns(e2eDir);

        // Assert
        expect(patterns.testFramework).toBe('vitest');
      });
    });

    // AC-12: 無既有測試時使用預設模板
    describe('AC-12: 無既有測試', () => {
      it('should return useDefault=true when e2e directory is empty', () => {
        // Arrange
        const e2eDir = join(testDir, 'tests', 'e2e');
        mkdirSync(e2eDir, { recursive: true });

        // Act
        const patterns = analyzeExistingPatterns(e2eDir);

        // Assert
        expect(patterns.useDefault).toBe(true);
        expect(patterns.imports).toHaveLength(0);
      });

      it('should return useDefault=true when e2e directory does not exist', () => {
        // Arrange
        const e2eDir = join(testDir, 'tests', 'e2e');
        // don't create it

        // Act
        const patterns = analyzeExistingPatterns(e2eDir);

        // Assert
        expect(patterns.useDefault).toBe(true);
      });
    });
  });
});
