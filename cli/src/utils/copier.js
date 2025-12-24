import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';
import { downloadStandard, downloadIntegration } from './github.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Root of the universal-dev-standards repository (for local development)
const REPO_ROOT = join(__dirname, '../../..');

/**
 * Copy a standard file to the target project
 * Falls back to downloading from GitHub if local file not found
 * @param {string} sourcePath - Relative path from repo root (e.g., 'core/anti-hallucination.md')
 * @param {string} targetDir - Target directory (usually '.standards')
 * @param {string} projectPath - Project root path
 * @returns {Promise<Object>} Result with success status and copied path
 */
export async function copyStandard(sourcePath, targetDir, projectPath) {
  const source = join(REPO_ROOT, sourcePath);
  const targetFolder = join(projectPath, targetDir);
  const targetFile = join(targetFolder, basename(sourcePath));

  // Ensure target directory exists
  if (!existsSync(targetFolder)) {
    mkdirSync(targetFolder, { recursive: true });
  }

  // Try local copy first
  if (existsSync(source)) {
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
  return downloadStandard(sourcePath, targetDir, projectPath);
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
  const source = join(REPO_ROOT, sourcePath);
  const target = join(projectPath, targetPath);

  // Ensure target directory exists
  const targetDir = dirname(target);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  // Try local copy first
  if (existsSync(source)) {
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
  return downloadIntegration(sourcePath, targetPath, projectPath);
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
 * Get the repository root path
 * @returns {string} Repository root path
 */
export function getRepoRoot() {
  return REPO_ROOT;
}
