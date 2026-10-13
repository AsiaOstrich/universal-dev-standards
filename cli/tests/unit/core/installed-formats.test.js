import { describe, it, expect } from 'vitest';
import { getInstalledFormats } from '../../../src/core/installed-formats.js';

// XSPEC-483: `both` is two sets of files, not a third format.
describe('getInstalledFormats', () => {
  it('reads both as the AI copy and the human copy', () => {
    expect(getInstalledFormats('both')).toEqual(['ai', 'human']);
  });

  it('reads ai and human as themselves', () => {
    expect(getInstalledFormats('ai')).toEqual(['ai']);
    expect(getInstalledFormats('human')).toEqual(['human']);
  });

  it('reads a missing format as ai, the manifest default', () => {
    expect(getInstalledFormats(undefined)).toEqual(['ai']);
    expect(getInstalledFormats('')).toEqual(['ai']);
  });
});
