/**
 * Release command — manage release process with mode-aware behavior.
 * SPEC-RELEASE-01: Manual Deployment Release Mode
 *
 * Subcommands:
 *   promote  — RC → Stable promotion (manual/hybrid mode)
 *   deploy   — Record deployment to environment (manual/hybrid mode)
 *   manifest — Generate build-manifest.json (manual/hybrid mode)
 *   verify   — Verify manifest against git state (manual/hybrid mode)
 */

import chalk from 'chalk';
import yaml from 'js-yaml';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { resolveReleaseWorkflow } from '../utils/release-config.js';
import { formatGitTag, createPromotionRecord, parseRCVersion } from '../utils/version-promote.js';
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
    console.log(chalk.yellow(`⚠ release-config.yaml 解析失敗: ${err.message}`));
    return null;
  }
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
  const workflow = resolveReleaseWorkflow(releaseConfig);

  switch (subcommand) {
    case 'promote':
      if (!workflow.hasPromote) {
        console.log(chalk.red('promote 子命令僅在 manual 或 hybrid 模式下可用。'));
        console.log(chalk.gray('  目前模式: ' + workflow.type));
        console.log(chalk.gray('  使用 `uds config --type release_mode` 切換模式'));
        return;
      }
      await handlePromote(args, projectPath);
      break;

    case 'deploy':
      if (!workflow.hasDeploy) {
        console.log(chalk.red('deploy 子命令僅在 manual 或 hybrid 模式下可用。'));
        console.log(chalk.gray('  目前模式: ' + workflow.type));
        return;
      }
      await handleDeploy(args, options, projectPath);
      break;

    case 'manifest':
      if (!workflow.hasManifest) {
        console.log(chalk.red('manifest 子命令僅在 manual 或 hybrid 模式下可用。'));
        return;
      }
      await handleManifest(args, options, projectPath);
      break;

    case 'verify':
      if (!workflow.hasManifest) {
        console.log(chalk.red('verify 子命令僅在 manual 或 hybrid 模式下可用。'));
        return;
      }
      await handleVerify(projectPath);
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
    console.log(chalk.red('請指定目標 stable 版本號。'));
    console.log(chalk.gray('  用法: uds release promote 1.2.0'));
    return;
  }

  // Verify this is a valid stable version (no pre-release suffix)
  if (targetVersion.includes('-')) {
    console.log(chalk.red('目標版本不應包含 pre-release 後綴。'));
    console.log(chalk.gray(`  請使用: uds release promote ${targetVersion.split('-')[0]}`));
    return;
  }

  // Find the latest RC for this version
  const currentVersion = getPackageVersion(projectPath);
  const parsed = currentVersion ? parseRCVersion(currentVersion) : null;

  console.log();
  console.log(chalk.bold('Release Promote: RC → Stable'));
  console.log(chalk.gray('─'.repeat(40)));

  if (parsed) {
    console.log(chalk.gray(`  目前版本: ${currentVersion}`));
    console.log(chalk.gray(`  晉升目標: ${targetVersion}`));
  } else {
    console.log(chalk.gray(`  晉升目標: ${targetVersion}`));
  }

  // Create promotion record
  const record = createPromotionRecord(currentVersion || 'unknown', targetVersion);
  console.log();
  console.log(chalk.green(`  ✓ 晉升紀錄建立: ${record.promoted_from} → ${record.version}`));

  // Create git tag
  const tag = formatGitTag(targetVersion);
  console.log(chalk.green(`  ✓ Git tag: ${tag}`));
  console.log();
  console.log(chalk.cyan('後續步驟:'));
  console.log(chalk.gray(`  1. 更新版本檔案為 ${targetVersion}`));
  console.log(chalk.gray(`  2. git tag ${tag}`));
  console.log(chalk.gray('  3. 從此 commit 重新打包'));
  console.log(chalk.gray('  4. 執行 uds release deploy production 記錄部署'));
}

/**
 * /release deploy <environment> [--result <result>]
 */
async function handleDeploy(environment, options, projectPath) {

  if (!environment) {
    console.log(chalk.red('請指定部署環境。'));
    console.log(chalk.gray('  用法: uds release deploy staging'));
    console.log(chalk.gray('  用法: uds release deploy staging --result passed'));
    console.log(chalk.gray('  用法: uds release deploy production'));
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
      console.log(chalk.yellow(`⚠ 找不到 ${currentVersion} 在 ${environment} 的部署紀錄`));
      return;
    }
    saveDeployments(projectPath, updated);
    console.log(chalk.green(`✓ 已更新 ${currentVersion} 在 ${environment} 的結果: ${options.result}`));
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
      console.log(chalk.yellow('⚠ 警告:'));
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

  console.log(chalk.green(`✓ 已記錄部署: ${currentVersion} → ${environment}`));
  console.log(chalk.gray(`  部署者: ${record.deployer}`));
  console.log(chalk.gray(`  時間: ${record.date}`));

  if (environment === 'staging') {
    console.log();
    console.log(chalk.cyan('後續步驟:'));
    console.log(chalk.gray('  測試完成後執行:'));
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

  console.log(chalk.green('✓ build-manifest.json 已產生'));
  console.log(chalk.gray(`  版本: ${manifest.version}`));
  console.log(chalk.gray(`  Commit: ${manifest.commit}`));
  console.log(chalk.gray(`  分支: ${manifest.branch}`));
  console.log(chalk.gray(`  建置者: ${manifest.builder}`));
  console.log(chalk.gray(`  時間: ${manifest.build_date}`));
}

/**
 * /release verify
 */
async function handleVerify(projectPath) {
  const manifestPath = join(projectPath, 'build-manifest.json');

  if (!existsSync(manifestPath)) {
    console.log(chalk.red('找不到 build-manifest.json'));
    console.log(chalk.gray('  請先執行 uds release manifest'));
    return;
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  } catch {
    console.log(chalk.red('build-manifest.json 格式不正確'));
    return;
  }
  const currentCommit = getGitCommit();

  const result = verifyManifest(manifest, currentCommit);

  if (result.valid) {
    console.log(chalk.green('✓ Manifest 驗證通過'));
    console.log(chalk.gray(`  版本: ${manifest.version}`));
    console.log(chalk.gray(`  Commit: ${manifest.commit} (一致)`));
  } else {
    console.log(chalk.red('✗ Manifest 驗證失敗'));
    for (const err of result.errors) {
      console.log(chalk.red(`  - ${err}`));
    }
  }

  // Show staging status
  const deployments = loadDeployments(projectPath);
  const stagingPassed = deployments.some(
    (d) => d.environment === 'staging' && d.result === 'passed'
  );

  if (stagingPassed) {
    console.log(chalk.green('  Staging: 已通過 ✓'));
  } else {
    console.log(chalk.yellow('  Staging: 未通過或無紀錄'));
  }
}

/**
 * Show help for release command
 */
function showReleaseHelp(workflow) {
  console.log();
  console.log(chalk.bold('uds release — 版本發布管理'));
  console.log(chalk.gray('─'.repeat(40)));
  console.log(chalk.gray(`  目前模式: ${workflow.type}`));
  console.log();

  if (workflow.hasPromote) {
    console.log(chalk.cyan('  可用子命令:'));
    console.log(chalk.gray('    promote <version>     RC → Stable 晉升'));
    console.log(chalk.gray('    deploy <env>          記錄部署紀錄'));
    console.log(chalk.gray('    deploy <env> --result  更新測試結果'));
    console.log(chalk.gray('    manifest              產生 build-manifest.json'));
    console.log(chalk.gray('    verify                驗證 manifest 一致性'));
  } else {
    console.log(chalk.gray('  CI/CD 模式下，請使用 /release start 和 /release finish'));
    console.log(chalk.gray('  切換到手動模式: uds config --type release_mode'));
  }
  console.log();
}
