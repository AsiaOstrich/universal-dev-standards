/**
 * Version Promote Utilities
 * SPEC-RELEASE-01: Manual Deployment Release Mode
 * AC-2: RC Version Lifecycle, AC-3: RC Promotion to Stable
 */

const RC_VERSION_REGEX = /^(\d+)\.(\d+)\.(\d+)-rc\.(\d+)$/;
const SEMVER_REGEX = /^v?(\d+)\.(\d+)\.(\d+)(-[a-zA-Z]+\.\d+)?$/;

/**
 * Parse an RC version string into its components.
 * Returns null for valid non-RC semver, throws for invalid format.
 */
export function parseRCVersion(version) {
  const rcMatch = version.match(RC_VERSION_REGEX);
  if (rcMatch) {
    return {
      major: Number(rcMatch[1]),
      minor: Number(rcMatch[2]),
      patch: Number(rcMatch[3]),
      preRelease: 'rc',
      preReleaseNumber: Number(rcMatch[4]),
    };
  }

  // Valid semver but not RC → return null
  if (SEMVER_REGEX.test(version)) {
    return null;
  }

  throw new Error(`Invalid version format: ${version}`);
}

/**
 * Increment the RC number (e.g., 1.2.0-rc.1 → 1.2.0-rc.2).
 */
export function incrementRC(version) {
  const parsed = parseRCVersion(version);
  if (!parsed) {
    throw new Error(`Cannot increment non-RC version: ${version}`);
  }
  return `${parsed.major}.${parsed.minor}.${parsed.patch}-rc.${parsed.preReleaseNumber + 1}`;
}

/**
 * Format a version string as a Git tag (add v prefix).
 */
export function formatGitTag(version) {
  if (version.startsWith('v')) return version;
  return `v${version}`;
}

/**
 * Promote an RC version to stable by stripping the -rc.N suffix.
 */
export function promoteVersion(version) {
  const parsed = parseRCVersion(version);
  if (!parsed) {
    throw new Error(`Cannot promote non-RC version: ${version}`);
  }
  return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
}

/**
 * Create a promotion record tracking RC → Stable transition.
 */
export function createPromotionRecord(fromRC, toStable) {
  return {
    promoted_from: fromRC,
    version: toStable,
    promoted_at: new Date().toISOString(),
  };
}
