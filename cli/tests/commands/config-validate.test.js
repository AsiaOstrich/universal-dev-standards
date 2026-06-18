/**
 * Tests for config value schema validation (XSPEC-292 §9, T12 input validation).
 */
import { describe, it, expect } from 'vitest';
import { validateConfigValue } from '../../src/commands/config.js';

describe('validateConfigValue (T12)', () => {
  it('accepts valid hitl.threshold within enum', () => {
    expect(validateConfigValue('hitl.threshold', 2)).toBeNull();
    expect(validateConfigValue('hitl.threshold', 0)).toBeNull();
    expect(validateConfigValue('hitl.threshold', 4)).toBeNull();
  });

  it('rejects hitl.threshold outside enum range', () => {
    expect(validateConfigValue('hitl.threshold', 9)).toMatch(/one of/);
    expect(validateConfigValue('hitl.threshold', -1)).toMatch(/one of/);
  });

  it('rejects non-numeric hitl.threshold', () => {
    expect(validateConfigValue('hitl.threshold', 'abc')).toMatch(/must be a number/);
  });

  it('allows unknown keys (forward-compatible)', () => {
    expect(validateConfigValue('some.unknown.key', 'anything')).toBeNull();
  });
});
