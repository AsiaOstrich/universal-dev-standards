/**
 * TDD tests for SPEC-E2E-001 REQ-4: E2E 測試骨架生成
 * Source: docs/specs/skills/SPEC-E2E-001-e2e-skill.md
 * AC Coverage: AC-13, AC-14, AC-15
 */

import { describe, it, expect } from 'vitest';

import { generateE2eSkeleton, isSpecFile } from '../../../src/utils/e2e-analyzer.js';

describe('SPEC-E2E-001: /e2e Skill', () => {
  describe('REQ-4: E2E 測試骨架生成', () => {
    // AC-13: 從 .feature 生成框架適配的 E2E 骨架
    describe('AC-13: 從 feature 檔案生成 E2E 骨架', () => {
      it('should generate one test case per scenario', () => {
        // Arrange
        const scenarios = [
          { name: 'User login flow', category: 'e2e-suitable', specId: 'SPEC-001', ac: 'AC-1' },
          { name: 'User creates order', category: 'e2e-suitable', specId: 'SPEC-001', ac: 'AC-2' }
        ];

        // Act
        const output = generateE2eSkeleton(scenarios, { framework: 'vitest' });

        // Assert
        expect(output).toContain('User login flow');
        expect(output).toContain('User creates order');
      });

      it('should include [TODO] markers in generated test cases', () => {
        // Arrange
        const scenarios = [
          { name: 'Test flow', category: 'e2e-suitable', specId: 'SPEC-001', ac: 'AC-1' }
        ];

        // Act
        const output = generateE2eSkeleton(scenarios, { framework: 'vitest' });

        // Assert
        expect(output).toContain('[TODO]');
      });

      it('should include traceability tags referencing original scenario', () => {
        // Arrange
        const scenarios = [
          { name: 'Test flow', category: 'e2e-suitable', specId: 'SPEC-001', ac: 'AC-1' }
        ];

        // Act
        const output = generateE2eSkeleton(scenarios, { framework: 'vitest' });

        // Assert
        expect(output).toContain('SPEC-001');
        expect(output).toContain('AC-1');
      });

      it('should generate Playwright format when framework is playwright', () => {
        // Arrange
        const scenarios = [
          { name: 'Login', category: 'e2e-suitable', specId: 'SPEC-001', ac: 'AC-1' }
        ];

        // Act
        const output = generateE2eSkeleton(scenarios, { framework: 'playwright' });

        // Assert
        expect(output).toContain('@playwright/test');
        expect(output).toContain('test(');
      });

      it('should generate Cypress format when framework is cypress', () => {
        // Arrange
        const scenarios = [
          { name: 'Login', category: 'e2e-suitable', specId: 'SPEC-001', ac: 'AC-1' }
        ];

        // Act
        const output = generateE2eSkeleton(scenarios, { framework: 'cypress' });

        // Assert
        expect(output).toContain('cy.');
        expect(output).toContain("it('");
      });
    });

    // AC-14: 從 SPEC-XXX.md 生成時委派 /derive e2e
    describe('AC-14: 從 SDD 規格判斷委派', () => {
      it('should indicate delegation when input looks like a spec file', () => {
        expect(isSpecFile('docs/specs/SPEC-001.md')).toBe(true);
        expect(isSpecFile('SPEC-FLOW-001-custom.md')).toBe(true);
        expect(isSpecFile('tests/features/login.feature')).toBe(false);
        expect(isSpecFile('src/utils/helper.js')).toBe(false);
      });
    });

    // AC-15: 生成的骨架包含 fixture 引導
    describe('AC-15: 生成包含 fixture 引導', () => {
      it('should include beforeAll/beforeEach blocks with TODO markers', () => {
        // Arrange
        const scenarios = [
          { name: 'DB operation flow', category: 'e2e-suitable', specId: 'SPEC-001', ac: 'AC-1' }
        ];

        // Act
        const output = generateE2eSkeleton(scenarios, { framework: 'vitest' });

        // Assert
        expect(output).toContain('beforeAll');
        expect(output).toContain('beforeEach');
        expect(output).toMatch(/\[TODO\].*fixture|fixture.*\[TODO\]/i);
      });
    });
  });
});
