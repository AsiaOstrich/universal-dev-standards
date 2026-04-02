/**
 * TDD tests for SPEC-E2E-001 REQ-1: AC 適用性分析
 * Source: docs/specs/skills/SPEC-E2E-001-e2e-skill.md
 * AC Coverage: AC-1, AC-2, AC-3, AC-4, AC-5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// [RED] Import functions we're about to implement
import {
  parseFeatureScenarios,
  classifyScenario,
  analyzeFeatureFile
} from '../../../src/utils/e2e-analyzer.js';

describe('SPEC-E2E-001: /e2e Skill', () => {
  let testDir;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'e2e-analyze-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('REQ-1: AC 適用性分析', () => {

    // === parseFeatureScenarios ===

    describe('parseFeatureScenarios', () => {
      it('should extract scenario names and steps from feature content', () => {
        // Arrange
        const content = `Feature: Test
  Scenario: Login flow
    Given user is on login page
    When user enters credentials
    Then user sees dashboard

  Scenario: Calculate total
    Given a list of prices
    When total is calculated
    Then result is correct
`;
        // Act
        const scenarios = parseFeatureScenarios(content);

        // Assert
        expect(scenarios).toHaveLength(2);
        expect(scenarios[0].name).toBe('Login flow');
        expect(scenarios[0].steps).toHaveLength(3);
        expect(scenarios[1].name).toBe('Calculate total');
      });
    });

    // === AC-1: 分類 AC ===

    describe('AC-1: 分類 AC 為 e2e/unit/integration-suitable', () => {
      it('should classify each scenario with a valid category', () => {
        // Arrange
        const scenarios = [
          { name: 'User login flow', steps: [
            'Given user is on login page',
            'When user enters credentials and clicks submit',
            'Then user sees the dashboard'
          ]},
          { name: 'Sort algorithm', steps: [
            'Given a list of numbers',
            'When sorted',
            'Then result is ascending'
          ]},
          { name: 'API calls DB', steps: [
            'Given API receives request',
            'When handler queries database',
            'Then response contains data'
          ]}
        ];

        // Act
        const results = scenarios.map(s => classifyScenario(s));

        // Assert
        expect(results).toHaveLength(3);
        results.forEach(r => {
          expect(['e2e-suitable', 'unit-suitable', 'integration-suitable']).toContain(r.category);
          expect(r.reason).toBeDefined();
        });
      });
    });

    // === AC-2: 純邏輯型排除 ===

    describe('AC-2: 排除純邏輯型 AC', () => {
      it('should classify pure computation as unit-suitable', () => {
        // Arrange
        const scenario = {
          name: 'Sort algorithm',
          steps: [
            'Given a list of numbers [3, 1, 2]',
            'When the list is sorted',
            'Then the result is [1, 2, 3]'
          ]
        };

        // Act
        const result = classifyScenario(scenario);

        // Assert
        expect(result.category).toBe('unit-suitable');
        expect(result.reason).toBeTruthy();
      });

      it('should classify validation logic as unit-suitable', () => {
        // Arrange
        const scenario = {
          name: 'Email validation',
          steps: [
            'Given an email string "invalid"',
            'When validated',
            'Then result is false'
          ]
        };

        // Act
        const result = classifyScenario(scenario);

        // Assert
        expect(result.category).toBe('unit-suitable');
      });

      it('should classify formatting/parsing as unit-suitable', () => {
        // Arrange
        const scenario = {
          name: 'Date format',
          steps: [
            'Given a date object',
            'When formatted as ISO string',
            'Then output matches pattern'
          ]
        };

        // Act
        const result = classifyScenario(scenario);

        // Assert
        expect(result.category).toBe('unit-suitable');
      });
    });

    // === AC-3: 使用者流程型識別 ===

    describe('AC-3: 識別使用者流程型 AC', () => {
      it('should classify multi-step user flow as e2e-suitable', () => {
        // Arrange
        const scenario = {
          name: 'User creates order',
          steps: [
            'Given user is logged in',
            'When user navigates to product page',
            'And user adds item to cart',
            'And user proceeds to checkout',
            'Then order is confirmed'
          ]
        };

        // Act
        const result = classifyScenario(scenario);

        // Assert
        expect(result.category).toBe('e2e-suitable');
      });

      it('should classify CLI complete flow as e2e-suitable', () => {
        // Arrange
        const scenario = {
          name: 'uds init flow',
          steps: [
            'Given user runs "uds init"',
            'When user selects standards',
            'Then .standards/ directory is created',
            'And CLAUDE.md is updated'
          ]
        };

        // Act
        const result = classifyScenario(scenario);

        // Assert
        expect(result.category).toBe('e2e-suitable');
      });

      it('should classify UI interaction as e2e-suitable', () => {
        // Arrange
        const scenario = {
          name: 'Form submission',
          steps: [
            'Given user is on registration page',
            'When user fills in the form and clicks submit',
            'Then success message is displayed'
          ]
        };

        // Act
        const result = classifyScenario(scenario);

        // Assert
        expect(result.category).toBe('e2e-suitable');
      });
    });

    // === AC-1 continued: integration-suitable ===

    describe('AC-1 (integration): 跨元件但非使用者流程', () => {
      it('should classify API-to-database interaction as integration-suitable', () => {
        // Arrange
        const scenario = {
          name: 'API saves to database',
          steps: [
            'Given API receives a POST request',
            'When handler writes to database',
            'Then record is persisted'
          ]
        };

        // Act
        const result = classifyScenario(scenario);

        // Assert
        expect(result.category).toBe('integration-suitable');
      });

      it('should classify service-to-service call as integration-suitable', () => {
        // Arrange
        const scenario = {
          name: 'Service calls external API',
          steps: [
            'Given payment service receives request',
            'When service calls gateway API',
            'Then transaction is processed'
          ]
        };

        // Act
        const result = classifyScenario(scenario);

        // Assert
        expect(result.category).toBe('integration-suitable');
      });
    });

    // === AC-4: 空 feature 檔案 ===

    describe('AC-4: 空 feature 檔案', () => {
      it('should return empty classifications with message for feature without scenarios', () => {
        // Arrange
        const featurePath = join(testDir, 'empty.feature');
        writeFileSync(featurePath, 'Feature: Empty Feature\n');

        // Act
        const result = analyzeFeatureFile(featurePath);

        // Assert
        expect(result.classifications).toHaveLength(0);
        expect(result.message).toContain('不包含可分析的 Scenario');
      });

      it('should handle feature with only comments', () => {
        // Arrange
        const featurePath = join(testDir, 'comments.feature');
        writeFileSync(featurePath, '# Just a comment\nFeature: Empty\n  # Another comment\n');

        // Act
        const result = analyzeFeatureFile(featurePath);

        // Assert
        expect(result.classifications).toHaveLength(0);
      });
    });

    // === AC-5: feature 檔案不存在 ===

    describe('AC-5: feature 檔案不存在', () => {
      it('should return error when file does not exist', () => {
        // Arrange
        const nonExistent = join(testDir, 'non-existent.feature');

        // Act
        const result = analyzeFeatureFile(nonExistent);

        // Assert
        expect(result.error).toContain('找不到檔案');
      });

      it('should list available feature files when directory has features', () => {
        // Arrange
        const featuresDir = join(testDir, 'tests', 'features');
        mkdirSync(featuresDir, { recursive: true });
        writeFileSync(join(featuresDir, 'login.feature'), 'Feature: Login\n');
        writeFileSync(join(featuresDir, 'signup.feature'), 'Feature: Signup\n');
        const nonExistent = join(featuresDir, 'missing.feature');

        // Act
        const result = analyzeFeatureFile(nonExistent);

        // Assert
        expect(result.error).toContain('找不到檔案');
        expect(result.availableFiles).toBeDefined();
        expect(result.availableFiles).toHaveLength(2);
        expect(result.availableFiles).toContain('login.feature');
        expect(result.availableFiles).toContain('signup.feature');
      });
    });
  });
});
