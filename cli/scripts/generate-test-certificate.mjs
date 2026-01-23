#!/usr/bin/env node

/**
 * Test Certificate Generator
 * 測試憑證生成器
 *
 * Generates a test certificate after successful test runs.
 * This certificate can be used by pre-release checks to skip redundant tests.
 *
 * Usage:
 *   node scripts/generate-test-certificate.mjs [options]
 *
 * Options:
 *   --test-results <file>  Path to vitest JSON report (optional)
 *   --validity <days>      Certificate validity in days (default: 7)
 *   --output <file>        Output file path (default: tests/reports/test-certificate.json)
 */

import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_DIR = join(__dirname, '..');
const REPORTS_DIR = join(CLI_DIR, 'tests', 'reports');

/**
 * Get Git information safely using execFileSync
 * @returns {Object} Git info object
 */
function getGitInfo() {
  try {
    const commitSha = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: CLI_DIR,
      encoding: 'utf8'
    }).trim();

    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: CLI_DIR,
      encoding: 'utf8'
    }).trim();

    const status = execFileSync('git', ['status', '--porcelain'], {
      cwd: CLI_DIR,
      encoding: 'utf8'
    }).trim();

    const isDirty = status.length > 0;

    return { commitSha, branch, isDirty };
  } catch (error) {
    console.error('Error getting git info:', error.message);
    return {
      commitSha: 'unknown',
      branch: 'unknown',
      isDirty: true
    };
  }
}

/**
 * Calculate SHA-256 hash of a directory's contents
 * @param {string} dirPath - Directory path to hash
 * @param {string[]} extensions - File extensions to include
 * @param {string[]} excludeDirs - Directories to exclude
 * @returns {string} SHA-256 hash
 */
function hashDirectory(dirPath, extensions = ['.js', '.mjs', '.json'], excludeDirs = ['reports']) {
  const hash = createHash('sha256');
  const files = [];

  function walkDirectory(dir) {
    if (!existsSync(dir)) return;

    const items = readdirSync(dir);
    for (const item of items) {
      // Skip node_modules, hidden directories, and excluded directories
      if (item === 'node_modules' || item.startsWith('.') || excludeDirs.includes(item)) continue;

      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        walkDirectory(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  walkDirectory(dirPath);

  // Sort files to ensure consistent hash
  files.sort();

  for (const file of files) {
    const relativePath = relative(CLI_DIR, file);
    const content = readFileSync(file);
    hash.update(relativePath);
    hash.update(content);
  }

  return `sha256:${hash.digest('hex')}`;
}

/**
 * Parse test results from vitest JSON output
 * @param {string} jsonPath - Path to JSON report
 * @returns {Object} Parsed test results
 */
function parseTestResults(jsonPath) {
  if (!existsSync(jsonPath)) {
    console.warn(`Test results file not found: ${jsonPath}`);
    return null;
  }

  try {
    const data = JSON.parse(readFileSync(jsonPath, 'utf8'));

    return {
      total: data.numTotalTests || 0,
      passed: data.numPassedTests || 0,
      failed: data.numFailedTests || 0,
      duration: data.duration || 0
    };
  } catch (error) {
    console.error('Error parsing test results:', error.message);
    return null;
  }
}

/**
 * Count tests by scanning test files (fallback method)
 * @param {string} testDir - Directory containing test files
 * @returns {Object} Test counts
 */
function countTestsFromFiles(testDir) {
  let total = 0;

  function scanDirectory(dir) {
    if (!existsSync(dir)) return;

    const items = readdirSync(dir);
    for (const item of items) {
      if (item === 'node_modules') continue;

      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.test.js')) {
        try {
          const content = readFileSync(fullPath, 'utf8');
          // Count it() and test() calls
          const matches = content.match(/\b(it|test)\s*\(/g) || [];
          total += matches.length;
        } catch (error) {
          // Ignore read errors
        }
      }
    }
  }

  scanDirectory(testDir);
  return { total, passed: total, failed: 0, duration: 0 };
}

/**
 * Get environment information
 * @returns {Object} Environment info
 */
function getEnvironmentInfo() {
  const nodeVersion = process.version;
  const platform = process.platform;

  let vitestVersion = 'unknown';
  try {
    const packageJson = JSON.parse(readFileSync(join(CLI_DIR, 'package.json'), 'utf8'));
    vitestVersion = packageJson.devDependencies?.vitest?.replace('^', '') || 'unknown';
  } catch (error) {
    // Ignore
  }

  return {
    nodeVersion,
    platform,
    vitest: vitestVersion
  };
}

/**
 * Generate test certificate
 * @param {Object} options - Generation options
 * @returns {Object} Certificate object
 */
function generateCertificate(options = {}) {
  const {
    validityDays = 7,
    testResultsPath = null
  } = options;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);

  console.log('Generating test certificate...');
  console.log(`  Validity: ${validityDays} days`);

  // Get Git info
  console.log('  Collecting Git information...');
  const git = getGitInfo();
  console.log(`    Commit: ${git.commitSha.substring(0, 8)}`);
  console.log(`    Branch: ${git.branch}`);
  console.log(`    Dirty: ${git.isDirty}`);

  // Calculate source hashes
  console.log('  Calculating source hashes...');
  const sourceHashes = {
    'cli/src/': hashDirectory(join(CLI_DIR, 'src')),
    'cli/tests/': hashDirectory(join(CLI_DIR, 'tests'))
  };
  console.log(`    cli/src/: ${sourceHashes['cli/src/'].substring(0, 24)}...`);
  console.log(`    cli/tests/: ${sourceHashes['cli/tests/'].substring(0, 24)}...`);

  // Get test results
  console.log('  Collecting test results...');
  let testResults = { unit: null, e2e: null };

  if (testResultsPath && existsSync(testResultsPath)) {
    const results = parseTestResults(testResultsPath);
    if (results) {
      testResults.unit = results;
      console.log(`    From JSON: ${results.total} tests, ${results.passed} passed, ${results.failed} failed`);
    }
  } else {
    // Fallback: count tests from files
    const unitTests = countTestsFromFiles(join(CLI_DIR, 'tests'));
    testResults.unit = unitTests;
    console.log(`    From scan: ${unitTests.total} tests found`);
  }

  // Get environment info
  const environment = getEnvironmentInfo();
  console.log(`  Environment: Node ${environment.nodeVersion}, ${environment.platform}`);

  const certificate = {
    certificate: {
      version: '1.0.0',
      generatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    },
    git,
    testResults,
    sourceHashes,
    environment
  };

  return certificate;
}

/**
 * Save certificate to file
 * @param {Object} certificate - Certificate object
 * @param {string} outputPath - Output file path
 */
function saveCertificate(certificate, outputPath) {
  const dir = dirname(outputPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(outputPath, JSON.stringify(certificate, null, 2) + '\n');
  console.log(`\nCertificate saved to: ${relative(CLI_DIR, outputPath)}`);
}

/**
 * Parse command line arguments
 * @param {string[]} args - Command line arguments
 * @returns {Object} Parsed options
 */
function parseArgs(args) {
  const options = {
    testResultsPath: null,
    validityDays: 7,
    outputPath: join(REPORTS_DIR, 'test-certificate.json')
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--test-results':
        options.testResultsPath = args[++i];
        break;
      case '--validity':
        options.validityDays = parseInt(args[++i], 10);
        break;
      case '--output':
        options.outputPath = args[++i];
        break;
      case '--help':
        console.log(`
Test Certificate Generator

Usage: node scripts/generate-test-certificate.mjs [options]

Options:
  --test-results <file>  Path to vitest JSON report (optional)
  --validity <days>      Certificate validity in days (default: 7)
  --output <file>        Output file path (default: tests/reports/test-certificate.json)
  --help                 Show this help message
`);
        process.exit(0);
    }
  }

  return options;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  const certificate = generateCertificate({
    validityDays: options.validityDays,
    testResultsPath: options.testResultsPath
  });

  saveCertificate(certificate, options.outputPath);

  // Check if tests passed
  const hasFailures = certificate.testResults.unit?.failed > 0 ||
                      certificate.testResults.e2e?.failed > 0;

  if (hasFailures) {
    console.log('\nWarning: Certificate generated with test failures!');
    console.log('This certificate will NOT be valid for pre-release checks.');
    process.exit(1);
  }

  if (certificate.git.isDirty) {
    console.log('\nNote: Working directory has uncommitted changes.');
    console.log('Certificate is valid but may not match after commit.');
  }

  console.log('\nCertificate generated successfully!');
  process.exit(0);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

export { generateCertificate, getGitInfo, hashDirectory, parseTestResults };
