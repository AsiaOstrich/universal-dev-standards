// [Source: docs/specs/SPEC-ENV-002-iac-principles.md]
// [Generated] TDD skeleton for IaC principles extension content verification
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const STANDARD_PATH = resolve(import.meta.dirname, '../../../../core/environment-standards.md');

describe('SPEC-ENV-002: IaC Principles Extension', () => {
  let content;

  beforeAll(() => {
    if (!existsSync(STANDARD_PATH)) {
      content = '';
      return;
    }
    content = readFileSync(STANDARD_PATH, 'utf-8');
  });

  describe('AC-1: 6 IaC core principles', () => {
    // [Source: SPEC-ENV-002:AC-1]

    it('should contain IaC Principles section', () => {
      // Arrange: standard loaded
      // Act: search for section heading
      // Assert
      expect(content).toMatch(/Infrastructure as Code \(IaC\) Principles/);
    });

    it('should define declarative-first principle', () => {
      // Arrange: standard loaded
      // Act: search for declarative principle
      // Assert
      expect(content).toMatch(/declarative/i);
    });

    it('should define idempotency principle', () => {
      expect(content).toMatch(/idempoten/i);
    });

    it('should define version control principle', () => {
      expect(content).toMatch(/version\s*control/i);
    });

    it('should define modularity principle', () => {
      expect(content).toMatch(/modular/i);
    });

    it('should define environment parameterization principle', () => {
      expect(content).toMatch(/parameteriz/i);
    });

    it('should define immutable infrastructure principle', () => {
      expect(content).toMatch(/immutable/i);
    });
  });

  describe('AC-2: 4 IaC review aspects', () => {
    // [Source: SPEC-ENV-002:AC-2]

    it('should contain IaC Code Review Checklist subsection', () => {
      expect(content).toMatch(/IaC Code Review Checklist/);
    });

    it('should define security review aspect', () => {
      // Arrange: standard loaded
      // Act: search for security aspect in review context
      // Assert
      expect(content).toMatch(/security/i);
    });

    it('should define cost impact review aspect', () => {
      expect(content).toMatch(/cost/i);
    });

    it('should define rollback feasibility review aspect', () => {
      expect(content).toMatch(/rollback/i);
    });

    it('should define environment consistency review aspect', () => {
      expect(content).toMatch(/consistency/i);
    });
  });

  describe('AC-3: Drift detection with periodic comparison and remediation', () => {
    // [Source: SPEC-ENV-002:AC-3]

    it('should contain Drift Detection subsection', () => {
      expect(content).toMatch(/Drift Detection/);
    });

    it('should describe periodic comparison of actual state vs IaC definition', () => {
      // Arrange: standard loaded
      // Act: search for comparison mechanism
      // Assert
      expect(content).toMatch(/periodic/i);
    });

    it('should describe team notification on drift discovery', () => {
      expect(content).toMatch(/notif/i);
    });

    it('should provide remediation option to update IaC', () => {
      expect(content).toMatch(/update.*IaC|IaC.*update/i);
    });

    it('should provide remediation option to revert infrastructure', () => {
      expect(content).toMatch(/revert|restore/i);
    });
  });
});
