// [Source: docs/specs/SPEC-HOOKS-001-core-standard-hooks.md]
// TDD tests for REQ-7: YAML enforcement blocks
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { load } from 'js-yaml';

const STANDARDS_DIR = resolve(import.meta.dirname, '../../../../.standards');

describe('SPEC-HOOKS-001 / REQ-7: 標準 YAML enforcement 區塊', () => {
  // [Source: SPEC-HOOKS-001:REQ-7]

  const standardsToCheck = [
    { file: 'commit-message.ai.yaml', expectedScript: 'validate-commit-msg.js', expectedTrigger: 'UserPromptSubmit' },
    { file: 'security-standards.ai.yaml', expectedScript: 'check-dangerous-cmd.js', expectedTrigger: 'PreToolUse' },
    { file: 'logging.ai.yaml', expectedScript: 'check-logging-standard.js', expectedTrigger: 'PostToolUse' },
  ];

  standardsToCheck.forEach(({ file, expectedScript, expectedTrigger }) => {
    describe(`${file}`, () => {
      let parsed;

      it('should have an enforcement block', () => {
        // Arrange
        const content = readFileSync(resolve(STANDARDS_DIR, file), 'utf-8');
        parsed = load(content);

        // Assert
        expect(parsed.enforcement).toBeDefined();
      });

      it(`should reference ${expectedScript}`, () => {
        // Arrange
        const content = readFileSync(resolve(STANDARDS_DIR, file), 'utf-8');
        parsed = load(content);

        // Assert
        expect(parsed.enforcement.hook_script).toContain(expectedScript);
      });

      it(`should have trigger "${expectedTrigger}"`, () => {
        // Arrange
        const content = readFileSync(resolve(STANDARDS_DIR, file), 'utf-8');
        parsed = load(content);

        // Assert
        expect(parsed.enforcement.trigger).toBe(expectedTrigger);
      });

      it('should have a severity field', () => {
        // Arrange
        const content = readFileSync(resolve(STANDARDS_DIR, file), 'utf-8');
        parsed = load(content);

        // Assert
        expect(['error', 'warning']).toContain(parsed.enforcement.severity);
      });
    });
  });
});
