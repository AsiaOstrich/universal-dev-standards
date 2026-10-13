/**
 * verifyManifest says what it compared the manifest's commit with (XSPEC-482 R14a).
 */
import { describe, it, expect } from 'vitest';
import { verifyManifest } from '../../../src/utils/build-manifest.js';

describe('verifyManifest commit mismatch', () => {
  it('names the current HEAD, because that is what is compared; no tag is read', () => {
    const r = verifyManifest({ commit: 'aaa1111', version: '1.0.0' }, 'bbb2222');
    expect(r.valid).toBe(false);
    expect(r.errors).toEqual(['commit mismatch: manifest has "aaa1111", the current HEAD is "bbb2222"']);
  });

  it('a matching commit is valid with no errors', () => {
    expect(verifyManifest({ commit: 'aaa1111' }, 'aaa1111')).toMatchObject({ valid: true, errors: [] });
  });
});
