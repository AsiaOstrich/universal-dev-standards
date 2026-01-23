import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import { downloadStandard, downloadIntegration } from './github.js';
import { PathResolver } from '../core/paths.js';
import { success, failure, ERROR_CODES } from '../core/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CLI package root (where package.json is located)
const CLI_ROOT = join(__dirname, '../..');

// Bundled files directory (for npm-installed CLI)
const BUNDLED_ROOT = join(CLI_ROOT, 'bundled');

// Root of universal-dev-standards repository (for local development)
const REPO_ROOT = join(CLI_ROOT, '..');

/**
 * Get source file path (legacy compatibility)
 * @param {string} sourcePath - Relative path
 * @returns {string|null} Absolute path or null
 */
function getSourcePath(sourcePath) {
  return PathResolver.getStandardSource(sourcePath);
}

/**
 * Copy a standard file to target project
 * Falls back to downloading from GitHub if local file not found
 * @param {string} sourcePath - Relative path from repo root (e.g., 'core/anti-hallucination.md')
 * @param {string} targetDir - Target directory (usually '.standards')
 * @param {string} projectPath - Project root path
 * @returns {Promise<Object>} Result with success status and copied path
 */
export async function copyStandard(sourcePath, targetDir, projectPath) {
  try {
    const targetFolder = join(projectPath, targetDir);
    const targetFile = join(targetFolder, basename(sourcePath));

    // Ensure target directory exists
    if (!existsSync(targetFolder)) {
      mkdirSync(targetFolder, { recursive: true });
    }

    // Try local copy first (bundled or repo)
    const source = getSourcePath(sourcePath);
    if (source) {
      copyFileSync(source, targetFile);
      return success(targetFile, { 
        source: 'local',
        sourcePath,
        targetFile 
      });
    }

    // Fall back to downloading from GitHub
    const result = await downloadStandard(sourcePath, targetDir, projectPath);

    // If download failed, provide a more helpful error message
    if (!result.success && result.error?.includes('404')) {
      return failure(
        `File not available: ${sourcePath}. This may be a beta version issue - try updating the CLI first.`,
        ERROR_CODES.FILE_NOT_FOUND,
        { sourcePath, targetDir }
      );
    }

    return result;
  } catch (error) {
    return failure(
      error.message,
      ERROR_CODES.FILE_COPY_FAILED,
      { sourcePath, targetDir, projectPath }
    );
  }
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
 * Get repository root path (bundled or repo, whichever is available)
 * @returns {string} Repository root path
 */
export function getRepoRoot() {
  // Prefer bundled files for npm-installed CLI
  if (existsSync(join(BUNDLED_ROOT, 'core'))) {
    return BUNDLED_ROOT;
  }
  return REPO_ROOT;
}

/**
 * Get bundled files directory path
 * @returns {string} Bundled root path
 */
export function getBundledRoot() {
  return BUNDLED_ROOT;
}

// Re-export manifest functions from core module for backward compatibility
export { 
  writeManifest, 
  readManifest, 
  manifestExists as isInitialized 
} from '../core/manifest.js';