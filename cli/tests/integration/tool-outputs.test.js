/**
 * Integration Smoke Tests - AI Tool Output Validation
 * [Source: SPEC-SELFDIAG-001 REQ-6, AC-8]
 *
 * Verifies that generateIntegrationContent produces valid output
 * for all supported AI tools.
 */

import { describe, it, expect } from 'vitest';
import { generateIntegrationContent } from '../../src/utils/integration-generator.js';
import { SUPPORTED_AI_TOOLS } from '../../src/core/constants.js';

const ALL_TOOLS = Object.keys(SUPPORTED_AI_TOOLS);

// Minimal config for generation
const BASE_CONFIG = {
  categories: ['development', 'quality'],
  languages: ['javascript'],
  exclusions: [],
  customRules: [],
  detailLevel: 'standard',
  language: 'en',
  installedStandards: ['testing.ai.yaml', 'commit-message.ai.yaml', 'git-workflow.ai.yaml'],
  contentMode: 'index',
  outputLanguage: 'english'
};

describe('Integration Smoke Tests: AI Tool Outputs', () => {
  describe.each(ALL_TOOLS)('Tool: %s', (tool) => {
    const toolConfig = SUPPORTED_AI_TOOLS[tool];

    it('should generate non-empty content', () => {
      // Arrange
      const config = { ...BASE_CONFIG, tool };

      // Act
      const content = generateIntegrationContent(config);

      // Assert
      expect(content).toBeTruthy();
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(50);
    });

    it('should contain standards references', () => {
      const config = { ...BASE_CONFIG, tool };
      const content = generateIntegrationContent(config);

      // Should reference .standards/ directory or installed standards
      const hasStandardsRef = content.includes('.standards')
        || content.includes('standards')
        || content.includes('UDS');
      expect(hasStandardsRef).toBe(true);
    });

    it('should not contain undefined or null literals', () => {
      const config = { ...BASE_CONFIG, tool };
      const content = generateIntegrationContent(config);

      expect(content).not.toContain('undefined');
      expect(content).not.toMatch(/\bnull\b(?!able)/); // Allow "nullable" but not standalone "null"
    });

    it('should produce format-appropriate content', () => {
      const config = { ...BASE_CONFIG, tool };
      const content = generateIntegrationContent(config);

      if (toolConfig.format === 'markdown') {
        // Markdown files should have heading structure
        expect(content).toMatch(/^#/m);
      } else if (toolConfig.format === 'yaml') {
        // YAML files should not start with #! or similar
        expect(content).not.toMatch(/^#!/);
      }
      // plaintext format has no structural requirements
    });
  });

  it(`should cover all ${ALL_TOOLS.length} supported tools`, () => {
    // Meta-test: ensure we're testing all tools
    expect(ALL_TOOLS.length).toBeGreaterThanOrEqual(10);
  });
});
