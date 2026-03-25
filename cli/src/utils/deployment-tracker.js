/**
 * Deployment Tracker Utilities
 * SPEC-RELEASE-01: Manual Deployment Release Mode
 * AC-5: Deployment Tracking, AC-6: Production Warning
 */

/**
 * Create a deployment record.
 */
export function recordDeployment({ version, environment, deployer, result, notes }) {
  return {
    version,
    environment,
    date: new Date().toISOString(),
    deployer,
    result: result || null,
    notes: notes || null,
  };
}

/**
 * Update the result of an existing deployment record.
 * Returns { deployments, updatedCount }.
 */
export function updateDeploymentResult(deployments, { version, environment, result }) {
  let updatedCount = 0;
  const updated = deployments.map((d) => {
    if (d.version === version && d.environment === environment) {
      updatedCount++;
      return { ...d, result };
    }
    return { ...d };
  });
  return { deployments: updated, updatedCount };
}

/**
 * Extract base version from RC version (e.g., '1.2.0-rc.2' → '1.2.0').
 */
function getBaseVersion(version) {
  const match = version.match(/^(\d+\.\d+\.\d+)/);
  return match ? match[1] : version;
}

/**
 * Check if a deployment target is ready.
 * For production deployments, verifies that a related RC version passed staging.
 * Returns an array of warning strings (empty = ready).
 */
export function checkDeploymentReadiness(deployments, target) {
  const warnings = [];

  // Only check for production deployments
  if (target.environment !== 'production') {
    return warnings;
  }

  const targetBase = getBaseVersion(target.version);

  // Look for staging deployment with result 'passed' for a related version
  // (same base version, e.g., 1.2.0-rc.1 passes staging → 1.2.0 can go to production)
  const stagingPassed = deployments.some(
    (d) => d.environment === 'staging'
      && d.result === 'passed'
      && getBaseVersion(d.version) === targetBase
  );

  if (!stagingPassed) {
    warnings.push(`staging verification is missing: no staging deployment with result "passed" found for version ${targetBase}`);
  }

  return warnings;
}
