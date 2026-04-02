/**
 * TDD tests for SPEC-E2E-001 REQ-2: E2E 框架偵測
 * Source: docs/specs/skills/SPEC-E2E-001-e2e-skill.md
 * AC Coverage: AC-6, AC-7, AC-8, AC-9, AC-10
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// [RED] Import the function we're about to implement
import { detectE2eFramework } from '../../../src/utils/e2e-detector.js';

describe('SPEC-E2E-001: /e2e Skill', () => {
  let testDir;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'e2e-detect-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('REQ-2: E2E 框架偵測', () => {
    // AC-6: 自動偵測 Playwright
    describe('AC-6: 偵測 Playwright', () => {
      it('should detect Playwright when @playwright/test is in package.json dependencies', () => {
        // Arrange
        writeFileSync(join(testDir, 'package.json'), JSON.stringify({
          devDependencies: { '@playwright/test': '^1.40.0' }
        }));

        // Act
        const result = detectE2eFramework(testDir);

        // Assert
        expect(result.detected).toContain('playwright');
      });

      it('should detect Playwright from dependencies (not just devDependencies)', () => {
        // Arrange
        writeFileSync(join(testDir, 'package.json'), JSON.stringify({
          dependencies: { '@playwright/test': '^1.40.0' }
        }));

        // Act
        const result = detectE2eFramework(testDir);

        // Assert
        expect(result.detected).toContain('playwright');
      });
    });

    // AC-7: 自動偵測 Cypress
    describe('AC-7: 偵測 Cypress', () => {
      it('should detect Cypress when cypress is in package.json and cypress.config.js exists', () => {
        // Arrange
        writeFileSync(join(testDir, 'package.json'), JSON.stringify({
          devDependencies: { 'cypress': '^13.0.0' }
        }));
        writeFileSync(join(testDir, 'cypress.config.js'), 'module.exports = {};');

        // Act
        const result = detectE2eFramework(testDir);

        // Assert
        expect(result.detected).toContain('cypress');
      });

      it('should detect Cypress with cypress.config.ts', () => {
        // Arrange
        writeFileSync(join(testDir, 'package.json'), JSON.stringify({
          devDependencies: { 'cypress': '^13.0.0' }
        }));
        writeFileSync(join(testDir, 'cypress.config.ts'), 'export default {};');

        // Act
        const result = detectE2eFramework(testDir);

        // Assert
        expect(result.detected).toContain('cypress');
      });
    });

    // AC-8: 自動偵測 Vitest E2E 模式
    describe('AC-8: 偵測 Vitest（CLI E2E 模式）', () => {
      it('should detect Vitest E2E mode when vitest is installed and tests/e2e/ exists', () => {
        // Arrange
        writeFileSync(join(testDir, 'package.json'), JSON.stringify({
          devDependencies: { 'vitest': '^4.0.0' }
        }));
        mkdirSync(join(testDir, 'tests', 'e2e'), { recursive: true });

        // Act
        const result = detectE2eFramework(testDir);

        // Assert
        expect(result.detected).toContain('vitest');
      });

      it('should not detect Vitest E2E when vitest installed but no e2e directory', () => {
        // Arrange
        writeFileSync(join(testDir, 'package.json'), JSON.stringify({
          devDependencies: { 'vitest': '^4.0.0' }
        }));

        // Act
        const result = detectE2eFramework(testDir);

        // Assert
        expect(result.detected).not.toContain('vitest');
      });
    });

    // AC-9: 無框架時提示使用者選擇
    describe('AC-9: 無法偵測框架', () => {
      it('should return promptRequired=true when no E2E framework detected', () => {
        // Arrange
        writeFileSync(join(testDir, 'package.json'), JSON.stringify({
          dependencies: { 'express': '^4.18.0' }
        }));

        // Act
        const result = detectE2eFramework(testDir);

        // Assert
        expect(result.detected).toHaveLength(0);
        expect(result.promptRequired).toBe(true);
        expect(result.options).toEqual(
          expect.arrayContaining(['playwright', 'cypress', 'vitest'])
        );
      });

      it('should return promptRequired=true when no package.json exists', () => {
        // Arrange — empty directory, no package.json

        // Act
        const result = detectE2eFramework(testDir);

        // Assert
        expect(result.detected).toHaveLength(0);
        expect(result.promptRequired).toBe(true);
      });
    });

    // AC-10: 多框架並存
    describe('AC-10: 多框架並存', () => {
      it('should detect all frameworks and set promptRequired when multiple found', () => {
        // Arrange
        writeFileSync(join(testDir, 'package.json'), JSON.stringify({
          devDependencies: {
            '@playwright/test': '^1.40.0',
            'cypress': '^13.0.0'
          }
        }));
        writeFileSync(join(testDir, 'cypress.config.js'), 'module.exports = {};');

        // Act
        const result = detectE2eFramework(testDir);

        // Assert
        expect(result.detected).toContain('playwright');
        expect(result.detected).toContain('cypress');
        expect(result.detected.length).toBeGreaterThanOrEqual(2);
        expect(result.promptRequired).toBe(true);
      });
    });
  });
});
