import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import { downloadStandard, downloadIntegration } from './github.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CLI package root (where package.json is located)
const CLI_ROOT = join(__dirname, '../..');

// Bundled files directory (for npm-installed CLI)
const BUNDLED_ROOT = join(CLI_ROOT, 'bundled');

// Root of the universal-dev-standards repository (for local development)
const REPO_ROOT = join(CLI_ROOT, '..');

/**
 * Get the source file path, checking bundled first, then repo root
 * @param {string} sourcePath - Relative path (e.g., 'core/anti-hallucination.md')
 * @returns {string|null} Absolute path to source file, or null if not found
 */
function getSourcePath(sourcePath) {
  // Priority 1: Bundled files (for npm-installed CLI)
  const bundledPath = join(BUNDLED_ROOT, sourcePath);
  if (existsSync(bundledPath)) {
    return bundledPath;
  }

  // Priority 2: Repository root (for local development)
  const repoPath = join(REPO_ROOT, sourcePath);
  if (existsSync(repoPath)) {
    return repoPath;
  }

  return null;
}

/**
 * Copy a standard file to the target project
 * Falls back to downloading from GitHub if local file not found
 * @param {string} sourcePath - Relative path from repo root (e.g., 'core/anti-hallucination.md')
 * @param {string} targetDir - Target directory (usually '.standards')
 * @param {string} projectPath - Project root path
 * @returns {Promise<Object>} Result with success status and copied path
 */
export async function copyStandard(sourcePath, targetDir, projectPath) {
  const targetFolder = join(projectPath, targetDir);
  const targetFile = join(targetFolder, basename(sourcePath));

  // Ensure target directory exists
  if (!existsSync(targetFolder)) {
    mkdirSync(targetFolder, { recursive: true });
  }

  // Try local copy first (bundled or repo)
  const source = getSourcePath(sourcePath);
  if (source) {
    try {
      copyFileSync(source, targetFile);
      return {
        success: true,
        error: null,
        path: targetFile
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: null
      };
    }
  }

  // Fall back to downloading from GitHub
  const result = await downloadStandard(sourcePath, targetDir, projectPath);

  // If download failed, provide a more helpful error message
  if (!result.success && result.error?.includes('404')) {
    return {
      success: false,
      error: `File not available: ${sourcePath}. This may be a beta version issue - try updating the CLI first.`,
      path: null
    };
  }

  return result;
}

/**
 * Copy an integration file to its target location
 * Falls back to downloading from GitHub if local file not found
 * @param {string} sourcePath - Source path relative to repo root
 * @param {string} targetPath - Target path relative to project root
 * @param {string} projectPath - Project root path
 * @returns {Promise<Object>} Result
 */
export async function copyIntegration(sourcePath, targetPath, projectPath) {
  const target = join(projectPath, targetPath);

  // Ensure target directory exists
  const targetDir = dirname(target);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // Try local copy first (bundled or repo)
  const source = getSourcePath(sourcePath);
  if (source) {
    try {
      copyFileSync(source, target);
      return {
        success: true,
        error: null,
        path: target
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        path: null
      };
    }
  }

  // Fall back to downloading from GitHub
  const result = await downloadIntegration(sourcePath, targetPath, projectPath);

  // If download failed, provide a more helpful error message
  if (!result.success && result.error?.includes('404')) {
    return {
      success: false,
      error: `File not available: ${sourcePath}. This may be a beta version issue - try updating the CLI first.`,
      path: null
    };
  }

  return result;
}

/**
 * Create or update the manifest file
 * @param {Object} manifest - Manifest data
 * @param {string} projectPath - Project root path
 */
export function writeManifest(manifest, projectPath) {
  const manifestPath = join(projectPath, '.standards', 'manifest.json');
  const manifestDir = dirname(manifestPath);

  if (!existsSync(manifestDir)) {
    mkdirSync(manifestDir, { recursive: true });
  }

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifestPath;
}

/**
 * Read the manifest file
 * @param {string} projectPath - Project root path
 * @returns {Object|null} Manifest data or null if not found
 */
export function readManifest(projectPath) {
  const manifestPath = join(projectPath, '.standards', 'manifest.json');

  if (!existsSync(manifestPath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(manifestPath, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Check if standards are already initialized
 * @param {string} projectPath - Project root path
 * @returns {boolean} True if initialized
 */
export function isInitialized(projectPath) {
  return existsSync(join(projectPath, '.standards', 'manifest.json'));
}

/**
 * Get the repository root path (bundled or repo, whichever is available)
 * @returns {string} Repository root path
 */
export function getRepoRoot() {
  // Prefer bundled files for npm-installed CLI
  if (existsSync(join(BUNDLED_ROOT, 'core'))) {
    return BUNDLED_ROOT;
  }
  return REPO_ROOT;
}
