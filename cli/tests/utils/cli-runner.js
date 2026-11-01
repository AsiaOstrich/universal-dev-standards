/**
 * CLI Runner - Utility for executing UDS CLI and capturing output
 * Supports both interactive and non-interactive modes
 */

import { spawn } from 'child_process';
import { join, dirname, sep as PATH_SEP } from 'path';
import { fileURLToPath } from 'url';
import { mkdtemp, rm, mkdir, writeFile, readFile, access } from 'fs/promises';
import { tmpdir } from 'os';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_PATH = join(__dirname, '../../bin/uds.js');

// Isolated HOME directory for E2E tests — prevents reading developer's ~/.udsrc
// which would change language detection and break tests expecting English output.
// Must exist so uds init can write to ~/.claude/skills etc without error.
const TEST_HOME_DIR = join(tmpdir(), `uds-test-home-${process.pid}`);
mkdirSync(TEST_HOME_DIR, { recursive: true });

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
 * A path as the tests write it: forward slashes. `path.join` returns backslashes on Windows, so a test that
 * asked for `f.path.includes('.standards/')` never matched there (init-flow Scenario C failed on windows-latest
 * for exactly that reason). `sep` is a parameter so the Windows case can be checked on any platform.
 * @param {string} p
 * @param {string} [sep]
 */
export function toPosix(p, sep = PATH_SEP) {
  return sep === '/' ? p : p.split(sep).join('/');
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
    // Windows keeps a directory locked for a moment after the process whose cwd it was has gone
    // (EBUSY/EPERM, windows-latest init-flow Scenario A). rm retries those codes itself.
    await rm(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
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
      env: { ...process.env, FORCE_COLOR: '0', HOME: TEST_HOME_DIR } // Disable colors; isolate HOME to prevent reading developer's ~/.udsrc
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
 * The prompt that is waiting for an answer, as text (its question line and its choices), or null.
 * Looks at the LAST marker only: an inquirer prompt line starts with `?`; once answered it is rewritten as
 * `✔` (`√` where the terminal has no unicode: inquirer's Windows fallback). "Last marker is `?`" = waiting; "last marker is `✔`" = the previous answer is being echoed and the next
 * prompt is not drawn yet. Only this block is matched against rules, so the echo of the previous prompt
 * ("✔ Which AI tools ...") can never be taken for the current question.
 * @param {string} screen - ANSI-stripped output since the last answer
 * @returns {string|null}
 */
export function currentPrompt(screen) {
  const markers = [...screen.matchAll(/(?:^|\n)[ \t]*\?[ \t]|[✔√]/g)];
  if (markers.length === 0) return null;
  const last = markers[markers.length - 1];
  return /[✔√]/.test(last[0]) ? null : screen.slice(last.index).replace(/^\n/, '');
}

/**
 * Run `uds init` interactively, answering each prompt by WHAT IT ASKS rather than by how many chunks came
 * before it (XSPEC-469 R4: the position-based `runInteractive` answered the wrong question whenever stdout
 * was split differently — which it is on a slower machine — and the "cancel" test then installed instead).
 *
 * A prompt is answered only when the output has been quiet for `idleMs` AND the last thing on screen is a
 * prompt that has not been answered (see currentPrompt). The first rule whose `when` matches that prompt
 * wins; no match → `defaultKeys` (Enter = take the default). Keys go out as one write.
 *
 * XSPEC-516 R1: a rule's keys go ONLY to a prompt that matches it, and a rule whose prompt never appeared is a
 * failure, not a silent no-op: the promise rejects naming the rule (`allowUnused: true` opts out, for a prompt
 * that is genuinely optional). Without that, a reworded or removed question left its rule unused and the test
 * went on passing on defaults alone.
 *
 * @param {Array<{when: RegExp, keys: string}>} rules
 * @param {string} workDir
 * @param {{timeout?: number, idleMs?: number, defaultKeys?: string, maxAnswers?: number, args?: string[], entry?: string, command?: string[], allowUnused?: boolean}} [opts]
 *   `entry` / `command`: the program to drive and the command it is given; default is `uds init`.
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number|null, timedOut: boolean, answers: Array<{prompt: string, keys: string, rule: number}>, unusedRules: number[], files: Array}>}
 */
export async function runPrompted(rules, workDir, { timeout = 90000, idleMs = 400, defaultKeys = '\r', maxAnswers = 60, args = [], entry = CLI_PATH, command = ['init'], allowUnused = false } = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [entry, ...command, ...args], {
      cwd: workDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0', HOME: TEST_HOME_DIR }
    });
    let stdout = '';
    let stderr = '';
    let screen = '';
    let idle = null;
    const answers = [];
    let closed = false;

    const answer = () => {
      const prompt = currentPrompt(screen);
      if (closed || answers.length >= maxAnswers || prompt === null) return;
      const ruleIndex = rules.findIndex((r) => r.when.test(prompt));
      const keys = ruleIndex === -1 ? defaultKeys : rules[ruleIndex].keys;
      answers.push({ prompt: prompt.trim().split('\n')[0], keys, rule: ruleIndex });
      screen = '';
      proc.stdin.write(keys);
    };

    proc.stdout.on('data', (data) => {
      const text = stripAnsi(data.toString());
      stdout += text;
      screen += text;
      clearTimeout(idle);
      idle = setTimeout(answer, idleMs);
    });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });
    proc.stdin.on('error', () => { /* the process ended while a key was being written */ });

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      closed = true;
      clearTimeout(idle);
      proc.kill('SIGTERM');
      setTimeout(() => proc.kill('SIGKILL'), 5000).unref(); // a process that ignores SIGTERM must still end
    }, timeout);

    // Resolve only once the process is gone: a caller that removes `workDir` right after would otherwise hit a
    // directory the dying process still holds as its cwd (EBUSY on Windows).
    proc.on('close', async (code) => {
      closed = true;
      clearTimeout(timer);
      clearTimeout(idle);
      const unusedRules = rules.map((_, i) => i).filter((i) => !answers.some((a) => a.rule === i));
      if (unusedRules.length > 0 && !timedOut && !allowUnused) {
        reject(new Error(
          `runPrompted: no prompt matched rule(s) ${unusedRules.map((i) => `#${i} ${rules[i].when}`).join(', ')}; ` +
          `answered: ${JSON.stringify(answers.map((a) => a.prompt))}`
        ));
        return;
      }
      resolve({
        stdout, stderr: stripAnsi(stderr), exitCode: timedOut ? -1 : code, timedOut, answers, unusedRules,
        files: timedOut ? [] : await collectGeneratedFiles(workDir)
      });
    });
  });
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
    '.agents/AGENTS.md',
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
          const relativePath = toPosix(join('.standards', entry.name));
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
      env: { ...process.env, FORCE_COLOR: '0', HOME: TEST_HOME_DIR }
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
  runCommand,
  createTempDir,
  cleanupTempDir,
  setupTestDir,
  verifyOutput,
  stripAnsi,
  fileExists,
  readFileSafe
};
