// [Source: docs/specs/SPEC-EST-001-estimation-standards.md]
// [Generated] TDD skeleton for estimation standards content verification
// Pattern: AAA (Arrange-Act-Assert)

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const STANDARD_PATH = resolve(import.meta.dirname, '../../../../core/estimation-standards.md');

describe('SPEC-EST-001: Estimation Standards', () => {
  let content;

  beforeAll(() => {
    if (!existsSync(STANDARD_PATH)) {
      content = '';
      return;
    }
    content = readFileSync(STANDARD_PATH, 'utf-8');
  });

  describe('AC-1: Estimation methods (at least 3)', () => {
    // [Source: SPEC-EST-001:AC-1]
    it('should define Planning Poker method', () => {
      // Arrange: standard loaded
      // Act: search for Planning Poker
      // Assert
      expect(content).toMatch(/Planning Poker/i);
    });

    it('should define T-Shirt Sizing method', () => {
      expect(content).toMatch(/T-Shirt Sizing/i);
    });

    it('should define Three-Point Estimation method', () => {
      expect(content).toMatch(/Three-Point Estimation/i);
    });

    it('should include applicability guidance for each method', () => {
      expect(content).toMatch(/applicable|when to use|適用/i);
    });

    it('should include pros and cons comparison', () => {
      expect(content).toMatch(/pros/i);
      expect(content).toMatch(/cons/i);
    });
  });

  describe('AC-2: Calibration mechanism', () => {
    // [Source: SPEC-EST-001:AC-2]
    it('should define calibration section', () => {
      expect(content).toMatch(/calibration/i);
    });

    it('should specify review frequency', () => {
      expect(content).toMatch(/frequency|sprint|iteration|retrospective/i);
    });

    it('should define accuracy tracking method', () => {
      expect(content).toMatch(/accuracy/i);
    });

    it('should reference Estimation Accuracy Ratio', () => {
      expect(content).toMatch(/Estimation Accuracy Ratio/i);
    });
  });

  describe('AC-3: Anti-patterns (at least 5)', () => {
    // [Source: SPEC-EST-001:AC-3]
    it('should define Anchoring Bias anti-pattern', () => {
      expect(content).toMatch(/Anchoring Bias/i);
    });

    it('should define Planning Fallacy anti-pattern', () => {
      expect(content).toMatch(/Planning Fallacy/i);
    });

    it('should define Scope Creep Blindness anti-pattern', () => {
      expect(content).toMatch(/Scope Creep/i);
    });

    it('should define Student Syndrome anti-pattern', () => {
      expect(content).toMatch(/Student Syndrome/i);
    });

    it('should define Parkinson\'s Law anti-pattern', () => {
      expect(content).toMatch(/Parkinson's Law/i);
    });

    it('should include mitigation strategies for anti-patterns', () => {
      expect(content).toMatch(/mitigation|avoid|prevent|緩解/i);
    });
  });

  describe('AC-4: Confidence levels', () => {
    // [Source: SPEC-EST-001:AC-4]
    it('should define High confidence level with ±20%', () => {
      expect(content).toMatch(/High/);
      expect(content).toMatch(/±20%/);
    });

    it('should define Medium confidence level with ±50%', () => {
      expect(content).toMatch(/Medium/);
      expect(content).toMatch(/±50%/);
    });

    it('should define Low confidence level with ±100%', () => {
      expect(content).toMatch(/Low/);
      expect(content).toMatch(/±100%/);
    });
  });

  describe('AC-5: Re-estimation triggers', () => {
    // [Source: SPEC-EST-001:AC-5]
    it('should define requirements change as trigger', () => {
      expect(content).toMatch(/requirements? change/i);
    });

    it('should define technical discovery as trigger', () => {
      expect(content).toMatch(/technical discovery/i);
    });

    it('should define external dependency change as trigger', () => {
      expect(content).toMatch(/external dependency/i);
    });

    it('should define time threshold as trigger', () => {
      expect(content).toMatch(/time threshold|elapsed time|time.based/i);
    });

    it('should provide re-estimation process', () => {
      expect(content).toMatch(/re-estimation process|re-estimation workflow/i);
    });
  });

  describe('AC-6: Estimate vs Commitment distinction', () => {
    // [Source: SPEC-EST-001:AC-6]
    it('should define Estimate concept', () => {
      expect(content).toMatch(/estimate/i);
    });

    it('should define Commitment concept', () => {
      expect(content).toMatch(/commitment/i);
    });

    it('should distinguish estimate from commitment', () => {
      expect(content).toMatch(/estimate.*vs.*commitment|estimate.*commitment.*differ/i);
    });

    it('should describe communication practices', () => {
      expect(content).toMatch(/communicat/i);
    });
  });

  describe('UDS core standard format', () => {
    it('should contain Version field', () => {
      expect(content).toMatch(/\*\*Version\*\*/);
    });

    it('should contain Scope field', () => {
      expect(content).toMatch(/\*\*Scope\*\*/);
    });

    it('should contain References section', () => {
      expect(content).toMatch(/## References/);
    });

    it('should contain License section', () => {
      expect(content).toMatch(/## License/);
    });
  });
});
