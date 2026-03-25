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
 * Returns a new array (does not mutate).
 */
export function updateDeploymentResult(deployments, { version, environment, result }) {
  return deployments.map((d) => {
    if (d.version === version && d.environment === environment) {
      return { ...d, result };
    }
    return { ...d };
  });
}

/**
 * Check if a deployment target is ready.
 * Returns an array of warning strings (empty = ready).
 */
export function checkDeploymentReadiness(deployments, target) {
  const warnings = [];

  // Only check for production deployments
  if (target.environment !== 'production') {
    return warnings;
  }

  // Look for any staging deployment with result 'passed'
  const stagingPassed = deployments.some(
    (d) => d.environment === 'staging' && d.result === 'passed'
  );

  if (!stagingPassed) {
    warnings.push('staging verification is missing: no staging deployment with result "passed" found');
  }

  return warnings;
}
