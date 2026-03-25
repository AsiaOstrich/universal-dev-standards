/**
 * Release Config Utilities
 * SPEC-RELEASE-01: Manual Deployment Release Mode
 * AC-1: Release Mode Configuration, AC-7: Backward Compat, AC-8: Default
 */

export const VALID_MODES = ['ci-cd', 'manual', 'hybrid'];

const MANUAL_MODES = ['manual', 'hybrid'];

/**
 * Parse and validate a raw release config object.
 */
export function parseReleaseConfig(raw) {
  const release = raw?.release;
  if (!release) {
    return getDefaultConfig();
  }

  const mode = release.mode;
  if (mode && !VALID_MODES.includes(mode)) {
    throw new Error(`Invalid release mode: "${mode}". Valid modes: ${VALID_MODES.join(', ')}`);
  }

  return {
    mode: mode || 'ci-cd',
    versioning: release.versioning || 'semver',
    preReleaseTag: release.pre_release_tag || (MANUAL_MODES.includes(mode) ? 'rc' : undefined),
    environments: release.environments || [],
    manifest: release.manual?.manifest ?? MANUAL_MODES.includes(mode),
    manifestPath: release.manual?.manifest_path || 'build-manifest.json',
    deploymentLog: release.manual?.deployment_log || 'deployments.yaml',
  };
}

/**
 * Get the default release config (CI/CD mode).
 */
export function getDefaultConfig() {
  return {
    mode: 'ci-cd',
    versioning: 'semver',
    preReleaseTag: undefined,
    environments: [],
    manifest: false,
    manifestPath: 'build-manifest.json',
    deploymentLog: 'deployments.yaml',
  };
}

/**
 * Generate a release config object suitable for YAML serialization.
 */
export function generateReleaseConfig(mode) {
  const config = {
    release: {
      mode,
      versioning: 'semver',
    },
  };

  if (MANUAL_MODES.includes(mode)) {
    config.release.pre_release_tag = 'rc';
    config.release.manual = {
      manifest: true,
      manifest_path: 'build-manifest.json',
      deployment_log: 'deployments.yaml',
    };
    config.release.environments = [
      { name: 'staging', type: 'testing', approval_required: false },
      { name: 'production', type: 'production', approval_required: true, requires_staging_pass: true },
    ];
  }

  return config;
}

/**
 * Resolve which release workflow features are available based on config.
 */
export function resolveReleaseWorkflow(config) {
  const mode = config?.release?.mode || 'ci-cd';
  const isManual = MANUAL_MODES.includes(mode);

  return {
    type: mode,
    hasPromote: isManual,
    hasDeploy: isManual,
    hasManifest: isManual,
  };
}
