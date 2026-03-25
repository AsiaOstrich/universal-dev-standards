/**
 * Build Manifest Utilities
 * SPEC-RELEASE-01: Manual Deployment Release Mode
 * AC-4: Build Manifest
 */

/**
 * Create a build manifest object.
 */
export function createManifest({ version, commit, builder, checksum, branch }) {
  return {
    version,
    commit,
    branch: branch || null,
    build_date: new Date().toISOString(),
    builder: builder || null,
    checksum: {
      package: checksum || null,
    },
    promotion: {
      promoted_from: null,
      tested_on: null,
      test_result: null,
      test_date: null,
    },
  };
}

/**
 * Verify a manifest against a Git tag's commit hash.
 * Returns { valid: boolean, errors: string[] }.
 */
export function verifyManifest(manifest, gitTagCommit) {
  const errors = [];

  if (!manifest.commit) {
    errors.push('manifest missing commit field');
  } else if (manifest.commit !== gitTagCommit) {
    errors.push(`commit mismatch: manifest has "${manifest.commit}", git tag points to "${gitTagCommit}"`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
