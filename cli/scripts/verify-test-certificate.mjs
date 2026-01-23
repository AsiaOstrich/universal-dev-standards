#!/usr/bin/env node

/**
 * Test Certificate Verifier
 * 測試憑證驗證器
 *
 * Verifies the validity of a test certificate.
 * Used by pre-release checks to determine if tests can be skipped.
 *
 * Usage:
 *   node scripts/verify-test-certificate.mjs [options]
 *
 * Options:
 *   --certificate <file>   Path to certificate file (default: tests/reports/test-certificate.json)
 *   --strict               Fail if working directory is dirty
 *   --verbose              Show detailed verification output
 *   --json                 Output result as JSON
 *
 * Exit codes:
 *   0 - Certificate is valid
 *   1 - Certificate is invalid or missing
 */

import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_DIR = join(__dirname, '..');
const REPORTS_DIR = join(CLI_DIR, 'tests', 'reports');

/**
 * Verification result structure
 */
class VerificationResult {
  constructor() {
    this.valid = true;
    this.checks = [];
    this.certificate = null;
  }

  addCheck(name, passed, message, details = null) {
    this.checks.push({ name, passed, message, details });
    if (!passed) {
      this.valid = false;
    }
  }

  toJSON() {
    return {
      valid: this.valid,
      checks: this.checks,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get current Git SHA safely
 * @returns {string} Current commit SHA
 */
function getCurrentGitSha() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: CLI_DIR,
      encoding: 'utf8'
    }).trim();
  } catch (error) {
    return null;
  }
}

/**
 * Check if working directory is dirty
 * @returns {boolean} True if dirty
 */
function isWorkingDirectoryDirty() {
  try {
    const status = execFileSync('git', ['status', '--porcelain'], {
      cwd: CLI_DIR,
      encoding: 'utf8'
    }).trim();
    return status.length > 0;
  } catch (error) {
    return true;
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
 * Verify test certificate
 * @param {string} certificatePath - Path to certificate file
 * @param {Object} options - Verification options
 * @returns {VerificationResult} Verification result
 */
function verifyCertificate(certificatePath, options = {}) {
  const { strict = false, verbose = false } = options;
  const result = new VerificationResult();

  // Check 1: Certificate exists
  if (!existsSync(certificatePath)) {
    result.addCheck('existence', false, 'Certificate file not found', {
      path: certificatePath
    });
    return result;
  }

  // Load certificate
  let certificate;
  try {
    certificate = JSON.parse(readFileSync(certificatePath, 'utf8'));
    result.certificate = certificate;
    result.addCheck('parsing', true, 'Certificate parsed successfully');
  } catch (error) {
    result.addCheck('parsing', false, 'Failed to parse certificate', {
      error: error.message
    });
    return result;
  }

  // Check 2: Certificate structure
  if (!certificate.certificate || !certificate.git || !certificate.testResults || !certificate.sourceHashes) {
    result.addCheck('structure', false, 'Invalid certificate structure');
    return result;
  }
  result.addCheck('structure', true, 'Valid certificate structure');

  // Check 3: Not expired
  const now = new Date();
  const expiresAt = new Date(certificate.certificate.expiresAt);
  if (now > expiresAt) {
    result.addCheck('expiration', false, 'Certificate has expired', {
      expiresAt: certificate.certificate.expiresAt,
      now: now.toISOString()
    });
  } else {
    const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
    result.addCheck('expiration', true, `Certificate valid for ${daysRemaining} more days`, {
      expiresAt: certificate.certificate.expiresAt,
      daysRemaining
    });
  }

  // Check 4: Git SHA matches
  const currentSha = getCurrentGitSha();
  if (!currentSha) {
    result.addCheck('git_sha', false, 'Could not determine current Git SHA');
  } else if (certificate.git.commitSha !== currentSha) {
    result.addCheck('git_sha', false, 'Git SHA mismatch', {
      expected: certificate.git.commitSha,
      actual: currentSha
    });
  } else {
    result.addCheck('git_sha', true, 'Git SHA matches', {
      sha: currentSha.substring(0, 8)
    });
  }

  // Check 5: Working directory clean (if strict mode)
  if (strict) {
    const isDirty = isWorkingDirectoryDirty();
    if (isDirty) {
      result.addCheck('clean_working_dir', false, 'Working directory has uncommitted changes');
    } else {
      result.addCheck('clean_working_dir', true, 'Working directory is clean');
    }
  }

  // Check 6: Source hashes match
  if (verbose) {
    console.log('  Verifying source hashes...');
  }

  for (const [dirKey, expectedHash] of Object.entries(certificate.sourceHashes)) {
    // Convert dir key to actual path
    const dirName = dirKey.replace('cli/', '').replace(/\/$/, '');
    const dirPath = join(CLI_DIR, dirName);

    if (!existsSync(dirPath)) {
      result.addCheck(`hash_${dirKey}`, false, `Directory not found: ${dirKey}`);
      continue;
    }

    const actualHash = hashDirectory(dirPath);

    if (actualHash !== expectedHash) {
      result.addCheck(`hash_${dirKey}`, false, `Source hash mismatch for ${dirKey}`, {
        expected: expectedHash.substring(0, 24) + '...',
        actual: actualHash.substring(0, 24) + '...'
      });
    } else {
      result.addCheck(`hash_${dirKey}`, true, `Source hash verified for ${dirKey}`);
    }
  }

  // Check 7: Tests passed
  const unitResults = certificate.testResults.unit;
  const e2eResults = certificate.testResults.e2e;

  if (unitResults && unitResults.failed > 0) {
    result.addCheck('tests_passed', false, 'Certificate contains failed unit tests', {
      failed: unitResults.failed,
      total: unitResults.total
    });
  } else if (e2eResults && e2eResults.failed > 0) {
    result.addCheck('tests_passed', false, 'Certificate contains failed E2E tests', {
      failed: e2eResults.failed,
      total: e2eResults.total
    });
  } else {
    const totalTests = (unitResults?.total || 0) + (e2eResults?.total || 0);
    result.addCheck('tests_passed', true, `All ${totalTests} tests passed`);
  }

  return result;
}

/**
 * Format verification result for console output
 * @param {VerificationResult} result - Verification result
 * @param {boolean} verbose - Show verbose output
 * @returns {string} Formatted output
 */
function formatResult(result, verbose = false) {
  let output = '';

  if (verbose) {
    output += '\nTest Certificate Verification\n';
    output += '=' .repeat(40) + '\n\n';

    for (const check of result.checks) {
      const status = check.passed ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
      output += `${status} ${check.name}: ${check.message}\n`;

      if (check.details && !check.passed) {
        for (const [key, value] of Object.entries(check.details)) {
          output += `    ${key}: ${value}\n`;
        }
      }
    }

    output += '\n';
  }

  if (result.valid) {
    output += '\x1b[32m✓ Certificate is valid\x1b[0m\n';
    if (result.certificate) {
      const generated = new Date(result.certificate.certificate.generatedAt);
      output += `  Generated: ${generated.toLocaleString()}\n`;
      output += `  Git SHA: ${result.certificate.git.commitSha.substring(0, 8)}\n`;
    }
  } else {
    output += '\x1b[31m✗ Certificate is invalid\x1b[0m\n';
    const failedChecks = result.checks.filter(c => !c.passed);
    for (const check of failedChecks) {
      output += `  - ${check.message}\n`;
    }
  }

  return output;
}

/**
 * Parse command line arguments
 * @param {string[]} args - Command line arguments
 * @returns {Object} Parsed options
 */
function parseArgs(args) {
  const options = {
    certificatePath: join(REPORTS_DIR, 'test-certificate.json'),
    strict: false,
    verbose: false,
    json: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--certificate':
        options.certificatePath = args[++i];
        break;
      case '--strict':
        options.strict = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--help':
        console.log(`
Test Certificate Verifier

Usage: node scripts/verify-test-certificate.mjs [options]

Options:
  --certificate <file>   Path to certificate file
                         (default: tests/reports/test-certificate.json)
  --strict               Fail if working directory is dirty
  --verbose              Show detailed verification output
  --json                 Output result as JSON
  --help                 Show this help message

Exit codes:
  0 - Certificate is valid
  1 - Certificate is invalid or missing
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

  const result = verifyCertificate(options.certificatePath, {
    strict: options.strict,
    verbose: options.verbose
  });

  if (options.json) {
    console.log(JSON.stringify(result.toJSON(), null, 2));
  } else {
    console.log(formatResult(result, options.verbose));
  }

  process.exit(result.valid ? 0 : 1);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

export { verifyCertificate, VerificationResult };
