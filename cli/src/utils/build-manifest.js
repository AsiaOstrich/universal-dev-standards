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

/** Normalize a checksum for comparison: drop an optional `sha256:` prefix, lowercase, trim. */
function normalizeChecksum(value) {
  return String(value).trim().replace(/^sha256:/i, '').toLowerCase();
}

/**
 * Verify a manifest against a Git tag's commit hash, and — when the manifest
 * records a package checksum — against the artefact's actual checksum.
 *
 * T13 (XSPEC-292): the manifest carries `checksum.package`, but earlier this
 * function only compared the commit. Recording a checksum that nothing verifies
 * is a false integrity guarantee, so verify now consumes it.
 *
 * @param {object} manifest
 * @param {string} gitTagCommit
 * @param {{ actualChecksum?: string }} [options] - actualChecksum: SHA256 of the
 *        packaged artefact (computed by the caller). Omit when no artefact is at hand.
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function verifyManifest(manifest, gitTagCommit, options = {}) {
  const errors = [];
  const warnings = [];

  if (!manifest.commit) {
    errors.push('manifest missing commit field');
  } else if (manifest.commit !== gitTagCommit) {
    errors.push(`commit mismatch: manifest has "${manifest.commit}", git tag points to "${gitTagCommit}"`);
  }

  const recorded = manifest.checksum?.package ?? null;
  if (recorded) {
    const { actualChecksum } = options;
    if (actualChecksum == null) {
      warnings.push(
        'checksum recorded in manifest but no artefact provided to verify against ' +
        '(pass --artifact <path> to verify integrity)'
      );
    } else if (normalizeChecksum(actualChecksum) !== normalizeChecksum(recorded)) {
      errors.push(
        `checksum mismatch: manifest records "${recorded}", artefact computes to "${actualChecksum}"`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
