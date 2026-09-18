// XSPEC adopter-report Q1 (part A) — manifest.version regressed to an old
// schema literal.
//
// Five write sites (update.js x3, check.js, config.js) each hardcoded a
// schema version string instead of CURRENT_SCHEMA_VERSION. Every literal
// predates a later schema bump (CURRENT_SCHEMA_VERSION is 3.4.0; the
// literals were '3.1.0'/'3.2.0'/'3.3.0'), so running `--sync-refs`,
// `--integrations-only`, a general `uds update`, `uds check --migrate`, or
// `uds config` on an already-3.4.0 manifest silently downgraded it. This
// tests the shared helper those call sites now use.
import { describe, it, expect } from 'vitest';
import { bumpManifestVersion, CURRENT_SCHEMA_VERSION, SUPPORTED_SCHEMA_VERSIONS } from '../../../src/core/manifest.js';

describe('bumpManifestVersion', () => {
  it('sanity: CURRENT_SCHEMA_VERSION is ahead of the old hardcoded literals', () => {
    // If this ever stops being true the whole defect class disappears —
    // proves the test corpus is still meaningful.
    for (const old of ['3.1.0', '3.2.0', '3.3.0']) {
      expect(SUPPORTED_SCHEMA_VERSIONS.indexOf(old)).toBeLessThan(
        SUPPORTED_SCHEMA_VERSIONS.indexOf(CURRENT_SCHEMA_VERSION)
      );
    }
  });

  it('bumps an old-version manifest up to CURRENT_SCHEMA_VERSION', () => {
    const manifest = { version: '3.0.0' };
    bumpManifestVersion(manifest);
    expect(manifest.version).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('never downgrades a manifest already at CURRENT_SCHEMA_VERSION', () => {
    const manifest = { version: CURRENT_SCHEMA_VERSION };
    bumpManifestVersion(manifest);
    expect(manifest.version).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('leaves an unrecognized (e.g. future) version untouched rather than guessing', () => {
    const manifest = { version: '99.0.0' };
    bumpManifestVersion(manifest);
    expect(manifest.version).toBe('99.0.0');
  });
});
