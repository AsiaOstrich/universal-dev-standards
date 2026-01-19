/**
 * CLI Runner - Utility for executing UDS CLI and capturing output
 * Supports both interactive and non-interactive modes
 */

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdtemp, rm, mkdir, writeFile, readFile, access } from 'fs/promises';
import { tmpdir } from 'os';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_PATH = join(__dirname, '../../bin/uds.js');

/**
 * Strip ANSI escape codes from string
 * @param {string} str - String with ANSI codes
 * @returns {string} Clean string
 */
export function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
}

/**
 * Create a temporary test directory
 * @returns {Promise<string>} Path to temp directory
 */
export async function createTempDir() {
  const prefix = join(tmpdir(), 'uds-test-');
  return await mkdtemp(prefix);
}

/**
 * Clean up a temporary directory
 * @param {string} dir - Directory to remove
 */
export async function cleanupTempDir(dir) {
  if (dir && dir.includes('uds-test-')) {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>}
 */
export async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read file content safely
 * @param {string} filePath - Path to file
 * @returns {Promise<string|null>}
 */
export async function readFileSafe(filePath) {
  try {
    return await readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Convert camelCase to kebab-case
 * @param {string} str - camelCase string
 * @returns {string} kebab-case string
 */
function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Run CLI command in non-interactive mode (--yes)
 * @param {Object} options - CLI options
 * @param {string} workDir - Working directory
 * @param {number} timeout - Timeout in ms (default: 30000)
 * @param {Object} globalOptions - Global CLI options (e.g., { uiLang: 'en' })
 * @returns {Promise<Object>} Result with stdout, stderr, exitCode, files
 */
export async function runNonInteractive(options = {}, workDir, timeout = 30000, globalOptions = {}) {
  const args = [];

  // Add global options first (before command)
  for (const [key, value] of Object.entries(globalOptions)) {
    const kebabKey = toKebabCase(key);
    if (value === true) {
      args.push(`--${kebabKey}`);
    } else if (value !== false && value !== undefined) {
      args.push(`--${kebabKey}=${value}`);
    }
  }

  // Add the init command
  args.push('init');

  // Add --yes flag for non-interactive mode
  args.push('--yes');

  // Add other options (convert camelCase to kebab-case)
  for (const [key, value] of Object.entries(options)) {
    const kebabKey = toKebabCase(key);
    if (value === true) {
      args.push(`--${kebabKey}`);
    } else if (value !== false && value !== undefined) {
      args.push(`--${kebabKey}=${value}`);
    }
  }

  return new Promise((resolve) => {
    const proc = spawn('node', [CLI_PATH, ...args], {
      cwd: workDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' } // Disable colors for easier parsing
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({
        stdout: stripAnsi(stdout),
        stderr: stripAnsi(stderr),
        exitCode: -1,
        timedOut: true,
        files: []
      });
    }, timeout);

    proc.on('close', async (code) => {
      clearTimeout(timer);

      // Collect generated files
      const files = await collectGeneratedFiles(workDir);

      resolve({
        stdout: stripAnsi(stdout),
        stderr: stripAnsi(stderr),
        exitCode: code,
        timedOut: false,
        files
      });
    });
  });
}

/**
 * Run CLI with simulated interactive inputs
 * Uses stdin to send responses to prompts
 * @param {Array<string|Object>} inputs - Array of inputs to send
 * @param {Object} cliOptions - Additional CLI options (not --yes)
 * @param {string} workDir - Working directory
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<Object>} Result with output and files
 */
export async function runInteractive(inputs, cliOptions = {}, workDir, timeout = 60000) {
  const args = ['init'];

  // Add CLI options (but not --yes)
  for (const [key, value] of Object.entries(cliOptions)) {
    if (key === 'yes') continue; // Skip --yes in interactive mode
    if (value === true) {
      args.push(`--${key}`);
    } else if (value !== false && value !== undefined) {
      args.push(`--${key}=${value}`);
    }
  }

  return new Promise((resolve) => {
    const proc = spawn('node', [CLI_PATH, ...args], {
      cwd: workDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' }
    });

    let stdout = '';
    let stderr = '';
    let inputIndex = 0;
    const stepOutputs = [];
    let currentStep = '';

    proc.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      currentStep += chunk;

      // Check if we need to send next input
      // Inquirer prompts typically end with ?: or certain patterns
      const cleanChunk = stripAnsi(chunk);
      if (shouldSendInput(cleanChunk, inputIndex, inputs)) {
        // Record step output
        stepOutputs.push({
          step: inputIndex,
          output: stripAnsi(currentStep),
          input: inputs[inputIndex]
        });
        currentStep = '';

        // Send input
        const input = inputs[inputIndex];
        if (typeof input === 'object') {
          // For checkbox/multi-select, send space to select then enter
          if (input.type === 'checkbox') {
            for (const selection of input.selections || []) {
              proc.stdin.write(' '); // Space to toggle
              // Arrow down for next option if needed
              if (selection.down) {
                proc.stdin.write('\x1B[B'); // Arrow down
              }
            }
            proc.stdin.write('\r'); // Enter to confirm
          } else {
            proc.stdin.write(input.value + '\r');
          }
        } else {
          proc.stdin.write(input + '\r');
        }
        inputIndex++;
      }
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({
        stdout: stripAnsi(stdout),
        stderr: stripAnsi(stderr),
        stepOutputs,
        exitCode: -1,
        timedOut: true,
        files: []
      });
    }, timeout);

    proc.on('close', async (code) => {
      clearTimeout(timer);

      // Record final step output
      if (currentStep) {
        stepOutputs.push({
          step: inputIndex,
          output: stripAnsi(currentStep),
          input: null
        });
      }

      // Collect generated files
      const files = await collectGeneratedFiles(workDir);

      resolve({
        stdout: stripAnsi(stdout),
        stderr: stripAnsi(stderr),
        stepOutputs,
        exitCode: code,
        timedOut: false,
        files
      });
    });
  });
}

/**
 * Determine if we should send the next input based on output
 * @param {string} output - Current output chunk
 * @param {number} inputIndex - Current input index
 * @param {Array} inputs - All inputs
 * @returns {boolean}
 */
function shouldSendInput(output, inputIndex, inputs) {
  if (inputIndex >= inputs.length) return false;

  // Common prompt indicators
  const promptIndicators = [
    /\?\s*$/,          // Ends with ?
    /:\s*$/,           // Ends with :
    /\(Y\/n\)/i,       // Yes/No prompt
    /\(y\/N\)/i,       // No/Yes prompt
    /❯/,               // Inquirer selection arrow
    /\[\s*\]/,         // Empty checkbox
    /\(\s*\)/          // Empty radio
  ];

  return promptIndicators.some(pattern => pattern.test(output));
}

/**
 * Collect all generated files after init
 * @param {string} workDir - Working directory
 * @returns {Promise<Array<Object>>} Array of file info
 */
async function collectGeneratedFiles(workDir) {
  const files = [];

  // Check common output locations
  const checkPaths = [
    '.standards/manifest.json',
    '.standards',
    '.cursorrules',
    '.windsurfrules',
    '.clinerules',
    '.github/copilot-instructions.md',
    'CLAUDE.md',
    'AGENTS.md',
    'INSTRUCTIONS.md',
    'GEMINI.md',
    '.claude/skills'
  ];

  for (const relativePath of checkPaths) {
    const fullPath = join(workDir, relativePath);
    if (await fileExists(fullPath)) {
      const content = await readFileSafe(fullPath);
      files.push({
        path: relativePath,
        exists: true,
        content: content?.substring(0, 500), // First 500 chars for verification
        size: content?.length || 0
      });
    }
  }

  // Also collect all files in .standards/
  const standardsDir = join(workDir, '.standards');
  if (existsSync(standardsDir)) {
    const { readdir } = await import('fs/promises');
    try {
      const entries = await readdir(standardsDir, { withFileTypes: true, recursive: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          const relativePath = join('.standards', entry.name);
          if (!files.some(f => f.path === relativePath)) {
            const fullPath = join(standardsDir, entry.name);
            const content = await readFileSafe(fullPath);
            files.push({
              path: relativePath,
              exists: true,
              content: content?.substring(0, 200),
              size: content?.length || 0
            });
          }
        }
      }
    } catch {
      // Directory might not exist or be readable
    }
  }

  return files;
}

/**
 * Pre-populate test directory with specific conditions
 * @param {string} workDir - Working directory
 * @param {Object} setup - Setup configuration
 */
export async function setupTestDir(workDir, setup = {}) {
  // Create package.json if needed
  if (setup.packageJson !== false) {
    await writeFile(
      join(workDir, 'package.json'),
      JSON.stringify(setup.packageJson || { name: 'test-project', version: '1.0.0' }, null, 2)
    );
  }

  // Create existing files if specified
  if (setup.existingFiles) {
    for (const [path, content] of Object.entries(setup.existingFiles)) {
      const fullPath = join(workDir, path);
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content);
    }
  }

  // Pre-initialize if needed (for testing "already initialized" scenario)
  if (setup.preInitialized) {
    await mkdir(join(workDir, '.standards'), { recursive: true });
    await writeFile(
      join(workDir, '.standards', 'manifest.json'),
      JSON.stringify({
        version: '3.2.0',
        upstream: { version: '3.0.0' }
      }, null, 2)
    );
  }
}

/**
 * Verify output contains expected strings
 * @param {string} output - Actual output
 * @param {Array<string|RegExp>} expectedPatterns - Patterns to match
 * @returns {Object} Match results
 */
export function verifyOutput(output, expectedPatterns) {
  const results = [];

  for (const pattern of expectedPatterns) {
    const matched = pattern instanceof RegExp
      ? pattern.test(output)
      : output.includes(pattern);

    results.push({
      pattern: pattern.toString(),
      matched,
      context: matched ? extractContext(output, pattern) : null
    });
  }

  return {
    allMatched: results.every(r => r.matched),
    results
  };
}

/**
 * Extract context around a match
 * @param {string} text - Full text
 * @param {string|RegExp} pattern - Pattern to find
 * @returns {string|null}
 */
function extractContext(text, pattern) {
  const searchStr = pattern instanceof RegExp
    ? text.match(pattern)?.[0]
    : pattern;

  if (!searchStr) return null;

  const index = text.indexOf(searchStr);
  if (index === -1) return null;

  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + searchStr.length + 30);

  return '...' + text.substring(start, end) + '...';
}

/**
 * Run any CLI command in non-interactive mode
 * @param {string} command - Command to run (e.g., 'config', 'check', 'update')
 * @param {Object} options - CLI options for the subcommand
 * @param {string} workDir - Working directory
 * @param {number} timeout - Timeout in ms (default: 30000)
 * @param {Object} globalOptions - Global CLI options (e.g., { uiLang: 'en' })
 * @returns {Promise<Object>} Result with stdout, stderr, exitCode, files
 */
export async function runCommand(command, options = {}, workDir, timeout = 30000, globalOptions = {}) {
  const args = [];

  // Add global options first (before command)
  for (const [key, value] of Object.entries(globalOptions)) {
    const kebabKey = toKebabCase(key);
    if (value === true) {
      args.push(`--${kebabKey}`);
    } else if (value !== false && value !== undefined) {
      args.push(`--${kebabKey}=${value}`);
    }
  }

  // Add the command
  args.push(command);

  // Add subcommand options (convert camelCase to kebab-case)
  for (const [key, value] of Object.entries(options)) {
    const kebabKey = toKebabCase(key);
    if (value === true) {
      args.push(`--${kebabKey}`);
    } else if (value !== false && value !== undefined) {
      args.push(`--${kebabKey}=${value}`);
    }
  }

  return new Promise((resolve) => {
    const proc = spawn('node', [CLI_PATH, ...args], {
      cwd: workDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({
        stdout: stripAnsi(stdout),
        stderr: stripAnsi(stderr),
        exitCode: -1,
        timedOut: true,
        files: []
      });
    }, timeout);

    proc.on('close', async (code) => {
      clearTimeout(timer);

      // Collect generated files
      const files = await collectGeneratedFiles(workDir);

      resolve({
        stdout: stripAnsi(stdout),
        stderr: stripAnsi(stderr),
        exitCode: code,
        timedOut: false,
        files
      });
    });
  });
}

export default {
  runNonInteractive,
  runInteractive,
  runCommand,
  createTempDir,
  cleanupTempDir,
  setupTestDir,
  verifyOutput,
  stripAnsi,
  fileExists,
  readFileSafe
};
