// [Source: docs/specs/SPEC-TEST-002-exploratory-testing.md]
// [Generated] TDD skeleton for exploratory testing standards content verification
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const STANDARD_PATH = resolve(import.meta.dirname, '../../../../core/testing-standards.md');

describe('SPEC-TEST-002: Exploratory Testing Standards', () => {
  let content;

  beforeAll(() => {
    if (!existsSync(STANDARD_PATH)) {
      content = '';
      return;
    }
    content = readFileSync(STANDARD_PATH, 'utf-8');
  });

  describe('AC-1: Session-Based Test Management (SBTM)', () => {
    // [Source: SPEC-TEST-002:AC-1]
    it('should define SBTM section', () => {
      // Arrange: standard loaded
      // Act: search for SBTM definition
      // Assert
      expect(content).toMatch(/Session-Based Test Management/i);
    });

    it('should specify time box of 60-90 minutes', () => {
      expect(content).toMatch(/60[\s\-–—]+90/);
    });

    it('should require a charter for each session', () => {
      // Arrange: standard loaded
      // Act: search for charter definition
      // Assert
      expect(content).toMatch(/charter/i);
    });

    it('should require session notes', () => {
      // Arrange: standard loaded
      // Act: search for session notes
      // Assert
      expect(content).toMatch(/session notes/i);
    });
  });

  describe('AC-2: SFDPOT Heuristics', () => {
    // [Source: SPEC-TEST-002:AC-2]
    it('should define SFDPOT mnemonic', () => {
      // Arrange: standard loaded
      // Act: search for SFDPOT
      // Assert
      expect(content).toMatch(/SFDPOT/);
    });

    it('should define Structure dimension', () => {
      expect(content).toMatch(/Structure/);
    });

    it('should define Function dimension', () => {
      expect(content).toMatch(/Function/);
    });

    it('should define Data dimension', () => {
      expect(content).toMatch(/Data/);
    });

    it('should define Platform dimension', () => {
      expect(content).toMatch(/Platform/);
    });

    it('should define Operations dimension', () => {
      expect(content).toMatch(/Operations/);
    });

    it('should define Time dimension', () => {
      expect(content).toMatch(/Time/);
    });
  });

  describe('AC-3: Session Record Template', () => {
    // [Source: SPEC-TEST-002:AC-3]
    it('should include Charter field', () => {
      // Arrange: standard loaded
      // Act: search for template fields
      // Assert
      expect(content).toMatch(/Charter/);
    });

    it('should include Area field', () => {
      expect(content).toMatch(/Area/);
    });

    it('should include Duration field', () => {
      expect(content).toMatch(/Duration/);
    });

    it('should include Notes field', () => {
      expect(content).toMatch(/Notes/);
    });

    it('should include Bugs Found field', () => {
      expect(content).toMatch(/Bugs Found/);
    });

    it('should include Follow-up field', () => {
      expect(content).toMatch(/Follow-up/i);
    });
  });

  describe('AC-4: Exploratory and Automation Complement', () => {
    // [Source: SPEC-TEST-002:AC-4]
    it('should define complement principle between exploratory and automation', () => {
      // Arrange: standard loaded
      // Act: search for complement principle
      // Assert
      expect(content).toMatch(/automat/i);
    });

    it('should mention discovery role of exploratory testing', () => {
      expect(content).toMatch(/discover/i);
    });

    it('should mention protection role of automation', () => {
      expect(content).toMatch(/protect/i);
    });

    it('should state that exploratory findings feed into regression tests', () => {
      expect(content).toMatch(/regression/i);
    });
  });
});
