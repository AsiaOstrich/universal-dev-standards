/**
 * Release command — manage release process with mode-aware behavior.
 * SPEC-RELEASE-01: Manual Deployment Release Mode
 *
 * Subcommands:
 *   promote  — RC → Stable promotion (manual/hybrid mode)
 *   deploy   — Record deployment to environment (manual/hybrid mode)
 *   manifest — Generate build-manifest.json (manual/hybrid mode)
 *   verify   — Verify manifest against git state (manual/hybrid mode)
 *
 * Exit codes of `verify` (a script that gates a release on it must never read a failure as a pass):
 *   0  the manifest verified
 *   1  verification FAILED (commit or checksum does not match what the manifest records)
 *   2  could not verify (no manifest, unreadable manifest, artifact not found, or the mode has no verify)
 * 1 = "the answer is no", 2 = "no answer", the same split as `uds hitl check`.
 */

const EXIT_VERIFY_FAILED = 1;
const EXIT_CANNOT_VERIFY = 2;

import chalk from 'chalk';
import * as yaml from 'js-yaml';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import { resolveReleaseWorkflow, VALID_MODES } from '../utils/release-config.js';
import { formatGitTag, parseRCVersion, isStableVersion } from '../utils/version-promote.js';
import { releaseText } from './release-messages.js';

// Default deployment environments (overridable via release-config.yaml release.environments)
const DEFAULT_ENVIRONMENTS = ['development', 'staging', 'canary', 'preview', 'production'];
import { createManifest, verifyManifest } from '../utils/build-manifest.js';
import { recordDeployment, updateDeploymentResult, checkDeploymentReadiness } from '../utils/deployment-tracker.js';

/**
 * Load release config from .standards/release-config.yaml
 */
function loadReleaseConfig(projectPath) {
  const configPath = join(projectPath, '.standards', 'release-config.yaml');
  if (!existsSync(configPath)) {
    return null;
  }
  try {
    return yaml.load(readFileSync(configPath, 'utf-8'));
  } catch (err) {
    console.log(chalk.yellow(releaseText().configParseFailed(err.message)));
    return null;
  }
}

/**
 * The release mode the project's UDS manifest records (`.standards/manifest.json`, `options.release_mode`), or null when
 * there is no readable manifest or it records none. A plain read: no migration, no output, nothing written.
 */
function manifestReleaseMode(projectPath) {
  try {
    const manifest = JSON.parse(readFileSync(join(projectPath, '.standards', 'manifest.json'), 'utf-8'));
    const mode = manifest?.options?.release_mode;
    return VALID_MODES.includes(mode) ? mode : null;
  } catch {
    return null;
  }
}

/**
 * Which release mode applies, and where that came from (XSPEC-475 R4).
 *
 *   1. `.standards/release-config.yaml` `release.mode` - the detailed file, wins when it names a mode;
 *   2. the manifest's `options.release_mode` - what `uds init` / `uds config` recorded; used when the file is
 *      missing (or names no mode), so a project that recorded `manual` is not run as ci-cd;
 *   3. ci-cd.
 *
 * Before this, only (1) was read: a manifest that said `manual` with no release-config.yaml ran as ci-cd and the
 * refusal never said why. `reason` always says which of the three decided and what was missing.
 * @returns {{ config: Object|null, source: 'config'|'manifest'|'default', reason: string }}
 */
function resolveReleaseMode(projectPath, releaseConfig) {
  const fileMode = releaseConfig?.release?.mode;
  const text = releaseText();
  if (fileMode) {
    return { config: releaseConfig, source: 'config', reason: text.modeFromConfig(fileMode) };
  }
  const fileMissing = releaseConfig === null ? text.configMissing : text.configNoMode;
  const recorded = manifestReleaseMode(projectPath); // wire:release-mode-from-manifest
  if (recorded) {
    return {
      config: { ...(releaseConfig ?? {}), release: { ...(releaseConfig?.release ?? {}), mode: recorded } },
      source: 'manifest',
      reason: text.modeFromManifest(fileMissing, recorded)
    };
  }
  return {
    config: releaseConfig,
    source: 'default',
    reason: text.modeDefault(fileMissing)
  };
}

/**
 * The deployment environment names a release-config.yaml declares, or null when it declares none.
 * An entry is a name (`- staging`) or the object `uds config` writes (`- name: staging`, with `type` and so on).
 * The object form used to be compared as if it were a name, so a project set up by UDS itself could not deploy anywhere.
 */
function configuredEnvironmentNames(releaseConfig) {
  const declared = releaseConfig?.release?.environments;
  if (!Array.isArray(declared)) return null;
  const names = declared
    .map((entry) => (entry && typeof entry === 'object' ? entry.name : entry))
    .filter((name) => typeof name === 'string' && name.trim() !== '');
  return names.length > 0 ? names : null;
}

/**
 * Load deployments.yaml
 */
function loadDeployments(projectPath) {
  const deployPath = join(projectPath, 'deployments.yaml');
  if (!existsSync(deployPath)) {
    return [];
  }
  try {
    const data = yaml.load(readFileSync(deployPath, 'utf-8'));
    return data?.deployments || [];
  } catch {
    return [];
  }
}

/**
 * Save deployments.yaml
 */
function saveDeployments(projectPath, deployments) {
  const deployPath = join(projectPath, 'deployments.yaml');
  writeFileSync(deployPath, yaml.dump({ deployments }), 'utf-8');
}

/**
 * Get current git user name
 */
function getGitUser() {
  try {
    return execSync('git config user.name', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Get current git commit hash (short)
 */
function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Get current git branch
 */
function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

/**
 * Get current version from package.json
 */
function getPackageVersion(projectPath) {
  const pkgPath = join(projectPath, 'package.json');
  if (!existsSync(pkgPath)) {
    // Try cli/package.json
    const cliPkgPath = join(projectPath, 'cli', 'package.json');
    if (existsSync(cliPkgPath)) {
      return JSON.parse(readFileSync(cliPkgPath, 'utf-8')).version;
    }
    return null;
  }
  return JSON.parse(readFileSync(pkgPath, 'utf-8')).version;
}

/**
 * Main release command entry point
 */
export async function releaseCommand(subcommand, args, options) {
  const projectPath = process.cwd();
  const releaseConfig = loadReleaseConfig(projectPath);
  const resolved = resolveReleaseMode(projectPath, releaseConfig);
  const workflow = resolveReleaseWorkflow(resolved.config);
  // When the mode did not come from release-config.yaml, say where it came from - once, and in every refusal below.
  if (resolved.source === 'manifest' && workflow.hasManifest) console.log(chalk.gray(`  ${resolved.reason}`));
  const explainMode = () => {
    if (resolved.source !== 'config') console.log(chalk.gray(`  ${resolved.reason}`));
  };

  switch (subcommand) {
    case 'promote':
      if (!workflow.hasPromote) {
        console.log(chalk.red(releaseText().promoteOnly));
        console.log(chalk.gray(releaseText().currentMode(workflow.type)));
        console.log(chalk.gray(releaseText().switchMode));
        explainMode();
        return;
      }
      await handlePromote(args, projectPath);
      break;

    case 'deploy':
      if (!workflow.hasDeploy) {
        console.log(chalk.red(releaseText().deployOnly));
        console.log(chalk.gray(releaseText().currentMode(workflow.type)));
        explainMode();
        return;
      }
      await handleDeploy(args, options, projectPath);
      break;

    case 'manifest':
      if (!workflow.hasManifest) {
        console.log(chalk.red(releaseText().manifestOnly));
        explainMode();
        return;
      }
      await handleManifest(args, options, projectPath);
      break;

    case 'verify':
      if (!workflow.hasManifest) {
        console.log(chalk.red(releaseText().verifyOnly));
        explainMode();
        process.exitCode = EXIT_CANNOT_VERIFY; // nothing was verified; 0 would read as "verified"
        return;
      }
      {
        const verifyExit = await handleVerify(projectPath, options);
        if (verifyExit !== 0) process.exitCode = verifyExit; // wire:release-verify-exit
      }
      break;

    default:
      showReleaseHelp(workflow);
      break;
  }
}

/**
 * /release promote <version>
 * Promote RC to stable version
 */
async function handlePromote(targetVersion, projectPath) {

  if (!targetVersion) {
    console.log(chalk.red(releaseText().promoteNeedVersion));
    console.log(chalk.gray(releaseText().promoteUsage));
    return;
  }

  // Verify this is a valid stable version (no pre-release suffix)
  if (targetVersion.includes('-')) {
    console.log(chalk.red(releaseText().noPrerelease));
    console.log(chalk.gray(releaseText().useInstead(targetVersion.split('-')[0])));
    return;
  }

  // Validate stable semver format (catches typos like 1.a.0, 1.2, abc)
  if (!isStableVersion(targetVersion)) {
    console.log(chalk.red(releaseText().badVersion(targetVersion)));
    console.log(chalk.gray(releaseText().needStable));
    return;
  }

  // Find the latest RC for this version
  const currentVersion = getPackageVersion(projectPath);
  const parsed = currentVersion ? parseRCVersion(currentVersion) : null;

  console.log();
  console.log(chalk.bold(releaseText().promoteTitle));
  console.log(chalk.gray('─'.repeat(40)));

  if (parsed) {
    console.log(chalk.gray(releaseText().currentVersion(currentVersion)));
    console.log(chalk.gray(releaseText().promoteTarget(targetVersion)));
  } else {
    console.log(chalk.gray(releaseText().promoteTarget(targetVersion)));
  }

  // This command only prints. It writes no promotion record and creates no git tag, so it must not say it did.
  const tag = formatGitTag(targetVersion);
  console.log();
  console.log(chalk.yellow(releaseText().promotePrintsOnly));
  console.log();
  console.log(chalk.cyan(releaseText().nextStepsHeader));
  console.log(chalk.gray(releaseText().step1(targetVersion)));
  console.log(chalk.gray(releaseText().step2(tag)));
  console.log(chalk.gray(releaseText().step3));
  console.log(chalk.gray(releaseText().step4));
}

/**
 * /release deploy <environment> [--result <result>]
 */
async function handleDeploy(environment, options, projectPath) {

  if (!environment) {
    console.log(chalk.red(releaseText().deployNeedEnv));
    console.log(chalk.gray(releaseText().deployUsage1));
    console.log(chalk.gray(releaseText().deployUsage2));
    console.log(chalk.gray(releaseText().deployUsage3));
    return;
  }

  // Validate environment against allow-list (overridable via release-config.yaml)
  const deployConfig = loadReleaseConfig(projectPath);
  const allowedEnvironments = configuredEnvironmentNames(deployConfig) || DEFAULT_ENVIRONMENTS;
  if (!allowedEnvironments.includes(environment)) {
    console.log(chalk.red(releaseText().unknownEnv(environment)));
    console.log(chalk.gray(releaseText().allowedEnvs(allowedEnvironments.join(', '))));
    console.log(chalk.gray(releaseText().customEnvHint));
    return;
  }

  const currentVersion = getPackageVersion(projectPath) || 'unknown';
  const deployments = loadDeployments(projectPath);

  // If --result flag: update existing deployment
  if (options.result) {
    const { deployments: updated, updatedCount } = updateDeploymentResult(deployments, {
      version: currentVersion,
      environment,
      result: options.result,
    });
    if (updatedCount === 0) {
      console.log(chalk.yellow(releaseText().noDeployRecord(currentVersion, environment)));
      return;
    }
    saveDeployments(projectPath, updated);
    console.log(chalk.green(releaseText().resultUpdated(currentVersion, environment, options.result)));
    return;
  }

  // Check readiness for production
  if (environment === 'production') {
    const warnings = checkDeploymentReadiness(deployments, {
      version: currentVersion,
      environment: 'production',
    });
    if (warnings.length > 0) {
      console.log();
      console.log(chalk.yellow(releaseText().warningHeader));
      for (const w of warnings) {
        console.log(chalk.yellow(`  - ${w}`));
      }
      console.log();
    }
  }

  // Record deployment
  const record = recordDeployment({
    version: currentVersion,
    environment,
    deployer: getGitUser(),
  });

  deployments.push(record);
  saveDeployments(projectPath, deployments);

  console.log(chalk.green(releaseText().deployRecorded(currentVersion, environment)));
  console.log(chalk.gray(releaseText().deployer(record.deployer)));
  console.log(chalk.gray(releaseText().time(record.date)));

  if (environment === 'staging') {
    console.log();
    console.log(chalk.cyan(releaseText().followUp));
    console.log(chalk.gray(releaseText().afterTesting));
    console.log(chalk.gray('  uds release deploy staging --result passed'));
  }
}

/**
 * /release manifest [--checksum <hash>]
 */
async function handleManifest(versionArg, options, projectPath) {
  const version = getPackageVersion(projectPath) || versionArg || 'unknown';
  const commit = getGitCommit();
  const branch = getGitBranch();
  const builder = getGitUser();

  const manifest = createManifest({
    version,
    commit,
    branch,
    builder,
    checksum: options.checksum || null,
  });

  const manifestPath = join(projectPath, 'build-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(chalk.green(releaseText().manifestWritten));
  console.log(chalk.gray(releaseText().mVersion(manifest.version)));
  console.log(chalk.gray(releaseText().mCommit(manifest.commit)));
  console.log(chalk.gray(releaseText().mBranch(manifest.branch)));
  console.log(chalk.gray(releaseText().mBuilder(manifest.builder)));
  console.log(chalk.gray(releaseText().mTime(manifest.build_date)));
}

/**
 * /release verify [--artifact <path>]
 *
 * T13 (XSPEC-292): when --artifact is given, compute its SHA256 so verify
 * actually CONSUMES the checksum recorded in the manifest, not just stores it.
 *
 * @returns {Promise<number>} the exit code: 0 verified, EXIT_VERIFY_FAILED, or EXIT_CANNOT_VERIFY
 */
async function handleVerify(projectPath, options = {}) {
  const manifestPath = join(projectPath, 'build-manifest.json');

  if (!existsSync(manifestPath)) {
    console.log(chalk.red(releaseText().noManifest));
    console.log(chalk.gray(releaseText().runManifestFirst));
    return EXIT_CANNOT_VERIFY;
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  } catch {
    console.log(chalk.red(releaseText().badManifest));
    return EXIT_CANNOT_VERIFY;
  }
  const currentCommit = getGitCommit();

  // Compute the artefact's checksum when a path is supplied.
  let actualChecksum;
  const artifactPath = options.artifact || null;
  if (artifactPath) {
    if (!existsSync(artifactPath)) {
      console.log(chalk.red(releaseText().noArtifact(artifactPath)));
      return EXIT_CANNOT_VERIFY;
    }
    actualChecksum = createHash('sha256').update(readFileSync(artifactPath)).digest('hex');
  }

  const result = verifyManifest(manifest, currentCommit, { actualChecksum });

  if (result.valid) {
    console.log(chalk.green(releaseText().verifyPassed));
    console.log(chalk.gray(releaseText().mVersion(manifest.version)));
    console.log(chalk.gray(releaseText().commitSame(manifest.commit)));
    if (actualChecksum && manifest.checksum?.package) {
      console.log(chalk.gray(releaseText().checksumSame(actualChecksum)));
    }
  } else {
    console.log(chalk.red(releaseText().verifyFailed));
    for (const err of result.errors) {
      console.log(chalk.red(`  - ${err}`));
    }
  }

  for (const w of result.warnings ?? []) {
    console.log(chalk.yellow(`  ⚠ ${w}`));
  }

  // Show staging status
  const deployments = loadDeployments(projectPath);
  const stagingPassed = deployments.some(
    (d) => d.environment === 'staging' && d.result === 'passed'
  );

  if (stagingPassed) {
    console.log(chalk.green(releaseText().stagingPassed));
  } else {
    console.log(chalk.yellow(releaseText().stagingNone));
  }

  return result.valid ? 0 : EXIT_VERIFY_FAILED;
}

/**
 * Show help for release command
 */
function showReleaseHelp(workflow) {
  console.log();
  console.log(chalk.bold(releaseText().helpTitle));
  console.log(chalk.gray('─'.repeat(40)));
  console.log(chalk.gray(releaseText().currentMode(workflow.type)));
  console.log();

  if (workflow.hasPromote) {
    console.log(chalk.cyan(releaseText().subcommands));
    console.log(chalk.gray(releaseText().helpPromote));
    console.log(chalk.gray(releaseText().helpDeploy));
    console.log(chalk.gray(releaseText().helpDeployResult));
    console.log(chalk.gray(releaseText().helpManifest));
    console.log(chalk.gray(releaseText().helpVerify));
  } else {
    console.log(chalk.gray(releaseText().helpCiCd));
    console.log(chalk.gray(releaseText().helpSwitch));
  }
  console.log();
}
