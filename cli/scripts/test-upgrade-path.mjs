#!/usr/bin/env node

/**
 * UDS Upgrade Path Test
 *
 * Verifies that projects initialized with older UDS versions can be
 * successfully upgraded to the current development version.
 *
 * Dynamically fetches all published versions from npm registry.
 *
 * Usage:
 *   npm run test:upgrade                           # Run all published versions
 *   npm run test:upgrade -- --stable-only          # Stable versions only (no beta/rc/alpha)
 *   npm run test:upgrade -- --direct-only          # Direct upgrades only (no chain test)
 *   npm run test:upgrade -- --chain-only           # Chain upgrade only
 *   npm run test:upgrade -- --versions 3.0.0,4.2.0 # Specific versions
 *   npm run test:upgrade -- --keep-cache           # Reuse installed versions
 *   npm run test:upgrade -- --json                 # JSON report output
 *   npm run test:upgrade -- --concurrency 5        # Parallel installs (default: 3)
 */

import { spawn } from 'child_process';
import { createHash } from 'crypto';
import {
  mkdtemp, rm, mkdir, writeFile
} from 'fs/promises';
import { existsSync, readFileSync, statSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import { parseArgs } from 'util';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DEV_CLI_BIN = join(__dirname, '..', 'bin', 'uds.js');
const CACHE_DIR = join(tmpdir(), 'uds-upgrade-cache');
const SPAWN_TIMEOUT = 60_000;
const NPM_INSTALL_TIMEOUT = 120_000;

const CURRENT_SCHEMA_VERSION = '3.3.0';

/**
 * Stable milestone versions for chain upgrade test.
 * Covers each major/minor boundary.
 */
const CHAIN_MILESTONES = ['3.0.0', '3.3.0', '3.5.0', '4.0.0', '4.2.0'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
}

function getCurrentDevVersion() {
  const registryPath = join(__dirname, '..', 'standards-registry.json');
  const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
  return registry.version;
}

function computeFileHash(filePath) {
  try {
    const content = readFileSync(filePath);
    const hash = createHash('sha256').update(content).digest('hex');
    const stats = statSync(filePath);
    return { hash: `sha256:${hash}`, size: stats.size };
  } catch {
    return null;
  }
}

function scanDirectorySync(dirPath) {
  const files = [];
  if (!existsSync(dirPath)) return files;
  const items = readdirSync(dirPath, { withFileTypes: true });
  for (const item of items) {
    const full = join(dirPath, item.name);
    if (item.isDirectory()) {
      files.push(...scanDirectorySync(full));
    } else if (item.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function isStableVersion(v) {
  return /^\d+\.\d+\.\d+$/.test(v);
}

/**
 * Spawn a process and capture output.
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
 */
function execCapture(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' },
      ...options,
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });
    const timeout = options.timeout || 30_000;
    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error(`Command timed out: ${cmd} ${args.join(' ')}`));
    }, timeout);
    proc.on('close', code => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code });
    });
  });
}

// ---------------------------------------------------------------------------
// fetchPublishedVersions — dynamic version discovery from npm registry
// ---------------------------------------------------------------------------

async function fetchPublishedVersions() {
  const { stdout, exitCode } = await execCapture(
    'npm', ['view', 'universal-dev-standards', 'versions', '--json'],
    { timeout: 30_000 }
  );
  if (exitCode !== 0) {
    throw new Error('Failed to fetch versions from npm registry');
  }
  const versions = JSON.parse(stdout);
  // npm returns a single string if only one version, otherwise an array
  return Array.isArray(versions) ? versions : [versions];
}

// ---------------------------------------------------------------------------
// VersionManager
// ---------------------------------------------------------------------------

class VersionManager {
  constructor(cacheDir) {
    this.cacheDir = cacheDir;
    this.installed = new Map(); // version → package root
  }

  async installVersion(version) {
    const dest = join(this.cacheDir, version);
    const pkgRoot = join(dest, 'node_modules', 'universal-dev-standards');

    // Reuse if already installed
    if (existsSync(join(pkgRoot, 'package.json'))) {
      this.installed.set(version, pkgRoot);
      return pkgRoot;
    }

    await mkdir(dest, { recursive: true });
    const { exitCode, stderr } = await execCapture(
      'npm', ['install', `universal-dev-standards@${version}`, '--no-save'],
      { cwd: dest, timeout: NPM_INSTALL_TIMEOUT }
    );
    if (exitCode !== 0) {
      throw new Error(`npm install failed for ${version}: ${stderr.slice(0, 300)}`);
    }
    this.installed.set(version, pkgRoot);
    return pkgRoot;
  }

  getCliBin(version) {
    const pkgRoot = this.installed.get(version);
    if (!pkgRoot) throw new Error(`Version ${version} not installed`);
    return join(pkgRoot, 'bin', 'uds.js');
  }

  /**
   * Install versions with concurrency limit.
   * @param {string[]} versions
   * @param {number} concurrency
   */
  async installAll(versions, concurrency = 3) {
    const results = [];
    let index = 0;

    const worker = async () => {
      while (index < versions.length) {
        const i = index++;
        const v = versions[i];
        try {
          const root = await this.installVersion(v);
          results.push({ version: v, root, ok: true });
        } catch (err) {
          results.push({ version: v, error: err.message, ok: false });
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, versions.length) }, () => worker());
    await Promise.all(workers);
    return results;
  }

  async cleanup() {
    if (existsSync(this.cacheDir)) {
      await rm(this.cacheDir, { recursive: true, force: true });
    }
  }
}

// ---------------------------------------------------------------------------
// TestProject
// ---------------------------------------------------------------------------

class TestProject {
  constructor(label) {
    this.label = label;
    this.dir = null;
  }

  async create() {
    this.dir = await mkdtemp(join(tmpdir(), `uds-upgrade-test-${this.label}-`));
    await writeFile(
      join(this.dir, 'package.json'),
      JSON.stringify({ name: 'test-upgrade-project', version: '1.0.0' }, null, 2)
    );
    // git init (some UDS flows check for git)
    await this._exec('git', ['init', '-q']);
    await this._exec('git', ['config', 'user.email', 'test@test.com']);
    await this._exec('git', ['config', 'user.name', 'Test']);
    return this.dir;
  }

  getManifest() {
    const manifestPath = join(this.dir, '.standards', 'manifest.json');
    if (!existsSync(manifestPath)) return null;
    try {
      return JSON.parse(readFileSync(manifestPath, 'utf-8'));
    } catch {
      return null;
    }
  }

  scanStandardsFiles() {
    const standardsDir = join(this.dir, '.standards');
    if (!existsSync(standardsDir)) return [];
    return scanDirectorySync(standardsDir).map(f =>
      f.slice(this.dir.length + 1).replace(/\\/g, '/')
    );
  }

  async cleanup() {
    if (this.dir && this.dir.includes('uds-upgrade-test-')) {
      await rm(this.dir, { recursive: true, force: true });
    }
  }

  _exec(cmd, args) {
    return new Promise((resolve, reject) => {
      const proc = spawn(cmd, args, { cwd: this.dir, stdio: 'ignore' });
      proc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`${cmd} exited ${code}`));
      });
    });
  }
}

// ---------------------------------------------------------------------------
// UpgradeRunner
// ---------------------------------------------------------------------------

class UpgradeRunner {
  static run(cliBin, command, workDir, extraArgs = []) {
    return new Promise(resolve => {
      const args = [cliBin, command, '--yes', ...extraArgs];
      const proc = spawn('node', args, {
        cwd: workDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, FORCE_COLOR: '0' },
      });

      let stdout = '';
      let stderr = '';
      proc.stdout.on('data', d => { stdout += d.toString(); });
      proc.stderr.on('data', d => { stderr += d.toString(); });

      const timer = setTimeout(() => {
        proc.kill('SIGTERM');
        resolve({ stdout: stripAnsi(stdout), stderr: stripAnsi(stderr), exitCode: -1, timedOut: true });
      }, SPAWN_TIMEOUT);

      proc.on('close', code => {
        clearTimeout(timer);
        resolve({ stdout: stripAnsi(stdout), stderr: stripAnsi(stderr), exitCode: code, timedOut: false });
      });
    });
  }

  static init(cliBin, workDir) {
    return this.run(cliBin, 'init', workDir);
  }

  static update(cliBin, workDir, extraArgs = []) {
    return this.run(cliBin, 'update', workDir, extraArgs);
  }

  static devUpdate(workDir) {
    return this.run(DEV_CLI_BIN, 'update', workDir, ['--offline']);
  }
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

class Validator {
  static validate(runResult, project, devVersion) {
    const results = [];

    results.push(this.checkExitCode(runResult));
    results.push(this.checkNoErrors(runResult));

    const manifest = project.getManifest();
    if (!manifest) {
      for (const id of ['MANIFEST_SCHEMA', 'MANIFEST_FIELDS', 'FILES_EXIST', 'NO_ORPHANS', 'HASH_INTEGRITY', 'VERSION_UPDATED']) {
        results.push({ id, name: id, status: 'SKIP', detail: 'No manifest found' });
      }
      return results;
    }

    results.push(this.checkManifestSchema(manifest));
    results.push(this.checkManifestFields(manifest));
    results.push(this.checkFilesExist(project, manifest));
    results.push(this.checkNoOrphans(project, manifest));
    results.push(this.checkHashIntegrity(project, manifest));
    results.push(this.checkVersionUpdated(manifest, devVersion));

    return results;
  }

  static checkExitCode({ exitCode, timedOut }) {
    if (timedOut) return { id: 'EXIT_CODE', name: 'Exit code', status: 'FAIL', detail: 'Timed out' };
    if (exitCode === 0) return { id: 'EXIT_CODE', name: 'Exit code', status: 'PASS' };
    return { id: 'EXIT_CODE', name: 'Exit code', status: 'FAIL', detail: `exitCode=${exitCode}` };
  }

  static checkNoErrors({ stderr }) {
    const lines = stderr.split('\n').filter(l => {
      const t = l.trim();
      if (!t) return false;
      if (/^npm (warn|WARN)/i.test(t)) return false;
      return true;
    });
    const errorLines = lines.filter(l => /error/i.test(l));
    if (errorLines.length === 0) return { id: 'NO_ERRORS', name: 'No errors', status: 'PASS' };
    return { id: 'NO_ERRORS', name: 'No errors', status: 'FAIL', detail: errorLines.slice(0, 3).join(' | ') };
  }

  static checkManifestSchema(manifest) {
    if (manifest.version === CURRENT_SCHEMA_VERSION) {
      return { id: 'MANIFEST_SCHEMA', name: 'Schema version', status: 'PASS' };
    }
    return {
      id: 'MANIFEST_SCHEMA', name: 'Schema version', status: 'FAIL',
      detail: `Expected ${CURRENT_SCHEMA_VERSION}, got ${manifest.version}`
    };
  }

  static checkManifestFields(manifest) {
    const required = ['upstream', 'format', 'standards', 'fileHashes'];
    const missing = required.filter(f => !(f in manifest));
    if (missing.length === 0) return { id: 'MANIFEST_FIELDS', name: 'Required fields', status: 'PASS' };
    return { id: 'MANIFEST_FIELDS', name: 'Required fields', status: 'FAIL', detail: `Missing: ${missing.join(', ')}` };
  }

  static checkFilesExist(project, manifest) {
    if (!manifest.fileHashes || Object.keys(manifest.fileHashes).length === 0) {
      return { id: 'FILES_EXIST', name: 'Files exist', status: 'SKIP', detail: 'No fileHashes' };
    }
    const missing = [];
    for (const relativePath of Object.keys(manifest.fileHashes)) {
      const fullPath = join(project.dir, relativePath);
      if (!existsSync(fullPath)) missing.push(relativePath);
    }
    if (missing.length === 0) return { id: 'FILES_EXIST', name: 'Files exist', status: 'PASS' };
    return { id: 'FILES_EXIST', name: 'Files exist', status: 'FAIL', detail: `Missing: ${missing.slice(0, 5).join(', ')}` };
  }

  static checkNoOrphans(project, manifest) {
    const tracked = new Set(Object.keys(manifest.fileHashes || {}));
    const allFiles = project.scanStandardsFiles();
    const orphans = allFiles.filter(f => {
      if (f === '.standards/manifest.json') return false;
      return !tracked.has(f);
    });
    if (orphans.length === 0) return { id: 'NO_ORPHANS', name: 'No orphans', status: 'PASS' };
    return { id: 'NO_ORPHANS', name: 'No orphans', status: 'FAIL', detail: `Orphans (${orphans.length}): ${orphans.slice(0, 5).join(', ')}` };
  }

  static checkHashIntegrity(project, manifest) {
    if (!manifest.fileHashes || Object.keys(manifest.fileHashes).length === 0) {
      return { id: 'HASH_INTEGRITY', name: 'Hash integrity', status: 'SKIP', detail: 'No fileHashes' };
    }
    const mismatched = [];
    for (const [relativePath, info] of Object.entries(manifest.fileHashes)) {
      const fullPath = join(project.dir, relativePath);
      const actual = computeFileHash(fullPath);
      if (!actual) continue;
      if (actual.hash !== info.hash) mismatched.push(relativePath);
    }
    if (mismatched.length === 0) return { id: 'HASH_INTEGRITY', name: 'Hash integrity', status: 'PASS' };
    return { id: 'HASH_INTEGRITY', name: 'Hash integrity', status: 'FAIL', detail: `Mismatched: ${mismatched.slice(0, 5).join(', ')}` };
  }

  static checkVersionUpdated(manifest, devVersion) {
    const upstreamVersion = manifest.upstream?.version;
    if (upstreamVersion === devVersion) {
      return { id: 'VERSION_UPDATED', name: 'Version updated', status: 'PASS' };
    }
    return {
      id: 'VERSION_UPDATED', name: 'Version updated', status: 'FAIL',
      detail: `Expected ${devVersion}, got ${upstreamVersion}`
    };
  }
}

// ---------------------------------------------------------------------------
// ReportGenerator
// ---------------------------------------------------------------------------

class ReportGenerator {
  constructor() {
    this.sections = [];
  }

  addSection(title, results) {
    this.sections.push({ title, results });
  }

  printConsole() {
    const GREEN = '\x1b[32m';
    const RED = '\x1b[31m';
    const YELLOW = '\x1b[33m';
    const RESET = '\x1b[0m';
    const BOLD = '\x1b[1m';
    const DIM = '\x1b[2m';

    console.log(`\n${BOLD}=== UDS Upgrade Path Test Report ===${RESET}\n`);

    let totalPass = 0;
    let totalFail = 0;
    let totalSkip = 0;

    for (const section of this.sections) {
      const sectionFails = section.results.filter(r => r.status === 'FAIL').length;
      const sectionPasses = section.results.filter(r => r.status === 'PASS').length;
      const sectionTag = sectionFails > 0 ? `${RED}FAIL${RESET}` :
                          sectionPasses > 0 ? `${GREEN}OK${RESET}` :
                          `${YELLOW}SKIP${RESET}`;

      console.log(`${BOLD}${section.title}${RESET}  ${DIM}[${sectionTag}${DIM}]${RESET}`);

      for (const r of section.results) {
        const icon = r.status === 'PASS' ? `${GREEN}PASS${RESET}` :
                     r.status === 'FAIL' ? `${RED}FAIL${RESET}` :
                     `${YELLOW}SKIP${RESET}`;
        const detail = r.detail ? ` — ${r.detail}` : '';
        console.log(`  [${icon}] ${r.name}${detail}`);

        if (r.status === 'PASS') totalPass++;
        else if (r.status === 'FAIL') totalFail++;
        else totalSkip++;
      }
      console.log();
    }

    const overall = totalFail === 0 ? `${GREEN}ALL PASSED${RESET}` : `${RED}${totalFail} FAILED${RESET}`;
    console.log(`${BOLD}Summary:${RESET} ${totalPass} passed, ${totalFail} failed, ${totalSkip} skipped  →  ${overall}`);
    console.log(`${DIM}Tested ${this.sections.length} scenarios${RESET}\n`);

    return totalFail;
  }

  toJSON() {
    const output = { sections: [], summary: { pass: 0, fail: 0, skip: 0 } };
    for (const section of this.sections) {
      const s = { title: section.title, checks: [] };
      for (const r of section.results) {
        s.checks.push(r);
        output.summary[r.status.toLowerCase()]++;
      }
      output.sections.push(s);
    }
    output.summary.success = output.summary.fail === 0;
    return output;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { values: opts } = parseArgs({
    options: {
      'direct-only': { type: 'boolean', default: false },
      'chain-only': { type: 'boolean', default: false },
      'stable-only': { type: 'boolean', default: false },
      'versions': { type: 'string', default: '' },
      'keep-cache': { type: 'boolean', default: false },
      'json': { type: 'boolean', default: false },
      'concurrency': { type: 'string', default: '3' },
    },
    strict: false,
  });

  const concurrency = parseInt(opts.concurrency, 10) || 3;
  const devVersion = getCurrentDevVersion();
  const report = new ReportGenerator();

  // Determine which versions to test
  let versionsToTest;
  if (opts.versions) {
    versionsToTest = opts.versions.split(',').map(v => v.trim());
  } else {
    // Fetch all published versions from npm
    if (!opts.json) console.log('\nFetching published versions from npm registry...');
    const allVersions = await fetchPublishedVersions();
    versionsToTest = opts['stable-only']
      ? allVersions.filter(isStableVersion)
      : allVersions;

    // Exclude the current dev version (no point upgrading from self to self)
    versionsToTest = versionsToTest.filter(v => v !== devVersion);
  }

  const vm = new VersionManager(CACHE_DIR);

  try {
    if (!opts.json) {
      console.log(`\nDev CLI: ${DEV_CLI_BIN}`);
      console.log(`Dev version: ${devVersion}`);
      console.log(`Schema target: ${CURRENT_SCHEMA_VERSION}`);
      console.log(`Versions to test: ${versionsToTest.length}`);
      console.log(`Concurrency: ${concurrency}`);
      console.log(`\nPhase 1: Installing ${versionsToTest.length} versions...`);
    }

    // Collect all needed versions (direct + chain milestones)
    const neededVersions = new Set(versionsToTest);
    if (!opts['direct-only']) {
      for (const v of CHAIN_MILESTONES) neededVersions.add(v);
    }

    const installResults = await vm.installAll([...neededVersions], concurrency);
    const failedInstalls = installResults.filter(r => !r.ok);
    const successInstalls = installResults.filter(r => r.ok);

    if (!opts.json) {
      console.log(`  Installed: ${successInstalls.length}/${installResults.length}`);
      for (const f of failedInstalls) {
        console.log(`  SKIP ${f.version}: ${f.error}`);
      }
    }

    const installedVersions = new Set(successInstalls.map(r => r.version));

    // Phase 2: Direct upgrade tests
    if (!opts['chain-only']) {
      if (!opts.json) console.log(`\nPhase 2: Direct upgrade tests (${versionsToTest.length} versions)...`);

      for (const version of versionsToTest) {
        if (!installedVersions.has(version)) {
          report.addSection(`Direct: ${version} → dev`, [
            { id: 'INSTALL', name: 'npm install', status: 'SKIP', detail: 'Install failed' }
          ]);
          continue;
        }

        if (!opts.json) process.stdout.write(`  Testing ${version} → dev ... `);

        const project = new TestProject(`direct-${version}`);
        try {
          await project.create();

          // Init with old version
          const cliBin = vm.getCliBin(version);
          const initResult = await UpgradeRunner.init(cliBin, project.dir);

          if (initResult.exitCode !== 0 && !initResult.timedOut) {
            // Old CLI's own init is broken — not our bug, skip this version
            report.addSection(`Direct: ${version} → dev`, [
              { id: 'INIT', name: 'Init', status: 'SKIP', detail: `Old CLI init failed (exitCode=${initResult.exitCode})` }
            ]);
            if (!opts.json) console.log('INIT FAILED (skipped)');
            continue;
          }

          // Update with dev CLI
          const updateResult = await UpgradeRunner.devUpdate(project.dir);
          const checks = Validator.validate(updateResult, project, devVersion);
          report.addSection(`Direct: ${version} → dev`, checks);

          const failed = checks.filter(c => c.status === 'FAIL').length;
          if (!opts.json) console.log(failed === 0 ? 'OK' : `${failed} FAILED`);
        } finally {
          await project.cleanup();
        }
      }
    }

    // Phase 3: Chain upgrade test
    if (!opts['direct-only']) {
      if (!opts.json) console.log(`\nPhase 3: Chain upgrade test...`);

      const chainVersions = CHAIN_MILESTONES.filter(v => installedVersions.has(v));
      if (chainVersions.length < 2) {
        report.addSection('Chain upgrade', [
          { id: 'CHAIN', name: 'Chain', status: 'SKIP', detail: 'Not enough milestone versions installed' }
        ]);
      } else {
        const project = new TestProject('chain');
        try {
          await project.create();

          const firstVersion = chainVersions[0];
          const initBin = vm.getCliBin(firstVersion);
          const initResult = await UpgradeRunner.init(initBin, project.dir);

          if (initResult.exitCode !== 0) {
            report.addSection('Chain upgrade', [
              { id: 'CHAIN_INIT', name: `Init ${firstVersion}`, status: 'FAIL', detail: `exitCode=${initResult.exitCode}` }
            ]);
          } else {
            let chainOk = true;
            for (let i = 1; i < chainVersions.length; i++) {
              const v = chainVersions[i];
              if (!opts.json) process.stdout.write(`  Step: → ${v} ... `);

              const updateBin = vm.getCliBin(v);
              const stepResult = await UpgradeRunner.update(updateBin, project.dir);

              if (stepResult.exitCode !== 0 && !stepResult.timedOut) {
                report.addSection(`Chain step: → ${v}`, [
                  { id: 'CHAIN_STEP', name: `Update to ${v}`, status: 'FAIL', detail: `exitCode=${stepResult.exitCode}` }
                ]);
                chainOk = false;
                if (!opts.json) console.log('FAILED');
                break;
              }
              if (!opts.json) console.log('OK');
            }

            if (chainOk) {
              if (!opts.json) process.stdout.write('  Step: → dev ... ');
              const devResult = await UpgradeRunner.devUpdate(project.dir);
              const checks = Validator.validate(devResult, project, devVersion);
              report.addSection(`Chain: ${firstVersion} → ${chainVersions.slice(1).join(' → ')} → dev`, checks);

              const failed = checks.filter(c => c.status === 'FAIL').length;
              if (!opts.json) console.log(failed === 0 ? 'OK' : `${failed} FAILED`);
            }
          }
        } finally {
          await project.cleanup();
        }
      }
    }

    // Phase 4: Report
    if (opts.json) {
      console.log(JSON.stringify(report.toJSON(), null, 2));
      process.exitCode = report.toJSON().summary.fail > 0 ? 1 : 0;
    } else {
      const failCount = report.printConsole();
      process.exitCode = failCount > 0 ? 1 : 0;
    }
  } finally {
    if (!opts['keep-cache']) {
      if (!opts.json) console.log('Cleaning up cache...');
      await vm.cleanup();
    } else {
      if (!opts.json) console.log(`Cache kept at: ${CACHE_DIR}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exitCode = 1;
});
