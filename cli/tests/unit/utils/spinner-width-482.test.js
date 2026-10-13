/**
 * The spinner is switched off on a terminal that reports no width (XSPEC-482 R14f).
 */
import { describe, it, expect } from 'vitest';
import { disabledWhenNoWidth } from '../../../src/utils/spinner.js';

describe('disabledWhenNoWidth', () => {
  it('a terminal of width 0 or with no width at all: spinner off', () => {
    expect(disabledWhenNoWidth({ isTTY: true, columns: 0 })).toEqual({ isEnabled: false });
    expect(disabledWhenNoWidth({ isTTY: true })).toEqual({ isEnabled: false });
  });

  it('a normal terminal, a pipe and a missing stream: left to ora', () => {
    expect(disabledWhenNoWidth({ isTTY: true, columns: 80 })).toEqual({});
    expect(disabledWhenNoWidth({ isTTY: false, columns: 0 })).toEqual({});
    expect(disabledWhenNoWidth(undefined)).toEqual({});
  });
});
