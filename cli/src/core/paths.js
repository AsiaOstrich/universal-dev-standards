import { existsSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  DIRECTORIES,
  FILE_PATTERNS,
  FILE_EXTENSIONS as EXTENSIONS
} from './constants.js';

/**
 * UDS Path Resolution System
 * Centralized path management for all UDS operations
 *
 * Note: DIRECTORIES, FILE_PATTERNS, and EXTENSIONS are imported from constants.js
 * to maintain a single source of truth for these values.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CLI package root (where package.json is located)
const CLI_ROOT = join(__dirname, '../..');

// Bundled files directory (for npm-installed CLI)
const BUNDLED_ROOT = join(CLI_ROOT, 'bundled');

// Root of universal-dev-standards repository (for local development)
const REPO_ROOT = join(CLI_ROOT, '..');

/**
 * Path priority order for source files
 */
export const PATH_PRIORITY = {
  BUNDLED: 1,    // npm-installed bundled files
  REPO: 2,       // local development repository
  GITHUB: 3      // fallback download from GitHub
};

// Re-export DIRECTORIES and FILE_PATTERNS for backward compatibility
export { DIRECTORIES, FILE_PATTERNS, EXTENSIONS };

/**
 * PathResolver class for centralized path management
 */
export class PathResolver {
  /**
   * Get CLI root directory
   * @returns {string} CLI root path
   */
  static getCliRoot() {
    return CLI_ROOT;
  }

  /**
   * Get repository root directory
   * @returns {string} Repository root path
   */
  static getRepoRoot() {
    return REPO_ROOT;
  }

  /**
   * Get bundled files directory
   * @returns {string} Bundled root path
   */
  static getBundledRoot() {
    return BUNDLED_ROOT;
  }

  /**
   * Get standard source file path with priority resolution
   * @param {string} relativePath - Relative path from repo root (e.g., 'core/anti-hallucination.md')
   * @returns {string|null} Absolute path to source file, or null if not found locally
   */
  static getStandardSource(relativePath) {
    // Priority 1: Bundled files (for npm-installed CLI)
    const bundledPath = join(BUNDLED_ROOT, relativePath);
    if (existsSync(bundledPath)) {
      return bundledPath;
    }

    // Priority 2: Repository root (for local development)
    const repoPath = join(REPO_ROOT, relativePath);
    if (existsSync(repoPath)) {
      return repoPath;
    }

    return null; // Not found locally, will need to download
  }

  /**
   * Get integration source file path
   * @param {string} tool - AI tool name (e.g., 'claude-code')
   * @param {string} relativePath - Relative path within tool directory
   * @returns {string|null} Absolute path to integration file, or null if not found
   */
  static getIntegrationSource(tool, relativePath) {
    const toolPath = join(DIRECTORIES.INTEGRATIONS, tool, relativePath);
    return this.getStandardSource(toolPath);
  }

  /**
   * Get skill source file path
   * @param {string} agent - AI agent name (e.g., 'claude-code')
   * @param {string} category - Skill category (e.g., 'agents', 'workflows')
   * @param {string} fileName - File name
   * @returns {string|null} Absolute path to skill file, or null if not found
   */
  static getSkillSource(agent, category, fileName) {
    const skillPath = join(DIRECTORIES.SKILLS, agent, category, fileName);
    return this.getStandardSource(skillPath);
  }

  /**
   * Get locale source file path
   * @param {string} locale - Locale code (e.g., 'zh-TW', 'zh-CN')
   * @param {string} relativePath - Relative path within locale directory
   * @returns {string|null} Absolute path to locale file, or null if not found
   */
  static getLocaleSource(locale, relativePath) {
    const localePath = join(DIRECTORIES.LOCALES, locale, relativePath);
    return this.getStandardSource(localePath);
  }

  /**
   * Get target path for standard file in project
   * @param {string} projectPath - Project root path
   * @param {string} relativePath - Relative path from standards directory
   * @returns {string} Absolute target path
   */
  static getStandardTarget(projectPath, relativePath) {
    return join(projectPath, DIRECTORIES.STANDARDS, relativePath);
  }

  /**
   * Get target path for integration file
   * @param {string} projectPath - Project root path
   * @param {string} tool - AI tool name
   * @param {string} fileName - File name
   * @returns {string} Absolute target path
   */
  static getIntegrationTarget(projectPath, tool, fileName) {
    // Different tools use different target locations
    const toolTargets = {
      'claude-code': 'CLAUDE.md',
      'cursor': '.cursorrules',
      'cline': '.clinerules',
      'windsurf': '.windsurfrules',
      'copilot': 'copilot-instructions.md',
      'aider': '.aider.conf.yml',
      'opencode': 'AGENTS.md',
      'roo': 'ROO.md',
      'antigravity': '.antigravity/ANTIGRAVITY.md'
    };

    const targetFile = toolTargets[tool] || fileName;
    return join(projectPath, targetFile);
  }

  /**
   * Get target path for skill installation
   * @param {string} projectPath - Project root path
   * @param {string} agent - AI agent name
   * @param {string} level - Installation level ('project' or 'user')
   * @param {string} skillPath - Skill relative path
   * @returns {string} Absolute target path
   */
  static getSkillTarget(projectPath, agent, level, skillPath) {
    if (level === 'project') {
      return join(projectPath, '.uds', 'skills', agent, skillPath);
    } else {
      // User-level installation (home directory)
      const userHome = require('os').homedir();
      return join(userHome, '.uds', 'skills', agent, skillPath);
    }
  }

  /**
   * Get manifest file path for project
   * @param {string} projectPath - Project root path
   * @returns {string} Absolute path to manifest.json
   */
  static getManifestPath(projectPath) {
    return join(projectPath, DIRECTORIES.STANDARDS, 'manifest.json');
  }

  /**
   * Get standards directory path for project
   * @param {string} projectPath - Project root path
   * @returns {string} Absolute path to standards directory
   */
  static getStandardsDir(projectPath) {
    return join(projectPath, DIRECTORIES.STANDARDS);
  }

  /**
   * Get UDS working directory for project
   * @param {string} projectPath - Project root path
   * @returns {string} Absolute path to .uds directory
   */
  static getUDSDir(projectPath) {
    return join(projectPath, '.uds');
  }

  /**
   * Check if path exists locally (not counting GitHub downloads)
   * @param {string} relativePath - Relative path to check
   * @returns {boolean} True if file exists locally
   */
  static existsLocally(relativePath) {
    return this.getStandardSource(relativePath) !== null;
  }

  /**
   * Get relative path from project root
   * @param {string} projectPath - Project root path
   * @param {string} fullPath - Full path
   * @returns {string} Relative path
   */
  static getRelativePath(projectPath, fullPath) {
    return fullPath.replace(projectPath + '/', '');
  }

  /**
   * Normalize path separators for current platform
   * @param {string} path - Path to normalize
   * @returns {string} Normalized path
   */
  static normalizePath(path) {
    return path.replace(/\\/g, '/');
  }

  /**
   * Join path segments safely
   * @param {...string} segments - Path segments
   * @returns {string} Joined path
   */
  static join(...segments) {
    return join(...segments);
  }

  /**
   * Get file extension from path
   * @param {string} filePath - File path
   * @returns {string} File extension (with dot)
   */
  static getExtension(filePath) {
    return filePath.substring(filePath.lastIndexOf('.'));
  }

  /**
   * Get file name without extension
   * @param {string} filePath - File path
   * @returns {string} File name without extension
   */
  static getBaseName(filePath) {
    const name = basename(filePath);
    const ext = this.getExtension(name);
    return name.slice(0, -ext.length);
  }

  /**
   * Check if file path indicates a standard file
   * @param {string} filePath - File path
   * @returns {boolean} True if it's a standard file
   */
  static isStandardFile(filePath) {
    return filePath.includes(DIRECTORIES.CORE) || 
           filePath.includes(DIRECTORIES.AI + '/standards');
  }

  /**
   * Check if file path indicates a skill file
   * @param {string} filePath - File path
   * @returns {boolean} True if it's a skill file
   */
  static isSkillFile(filePath) {
    return filePath.includes(DIRECTORIES.SKILLS);
  }

  /**
   * Check if file path indicates an integration file
   * @param {string} filePath - File path
   * @returns {boolean} True if it's an integration file
   */
  static isIntegrationFile(filePath) {
    return filePath.includes(DIRECTORIES.INTEGRATIONS);
  }

  /**
   * Check if file path indicates a locale file
   * @param {string} filePath - File path
   * @returns {boolean} True if it's a locale file
   */
  static isLocaleFile(filePath) {
    return filePath.includes(DIRECTORIES.LOCALES);
  }

  /**
   * Get file type from path
   * @param {string} filePath - File path
   * @returns {string} File type: 'standard', 'skill', 'integration', 'locale', or 'unknown'
   */
  static getFileType(filePath) {
    if (this.isStandardFile(filePath)) return 'standard';
    if (this.isSkillFile(filePath)) return 'skill';
    if (this.isIntegrationFile(filePath)) return 'integration';
    if (this.isLocaleFile(filePath)) return 'locale';
    return 'unknown';
  }

  /**
   * Convert relative path to canonical form
   * @param {string} relativePath - Relative path from repo root
   * @returns {string} Canonical path
   */
  static canonicalizePath(relativePath) {
    // Remove leading ./ if present
    let canonical = relativePath.replace(/^\.\//, '');
    
    // Ensure forward slashes
    canonical = canonical.replace(/\\/g, '/');
    
    // Remove trailing slash
    canonical = canonical.replace(/\/$/, '');
    
    return canonical;
  }

  /**
   * Get all possible source locations for a file
   * @param {string} relativePath - Relative path
   * @returns {Array} Array of possible locations with priorities
   */
  static getAllPossibleLocations(relativePath) {
    return [
      {
        path: join(BUNDLED_ROOT, relativePath),
        priority: PATH_PRIORITY.BUNDLED,
        type: 'bundled'
      },
      {
        path: join(REPO_ROOT, relativePath),
        priority: PATH_PRIORITY.REPO,
        type: 'repo'
      }
    ];
  }

  /**
   * Find first existing local file for a relative path
   * @param {string} relativePath - Relative path
   * @returns {Object|null} First existing location or null
   */
  static findFirstExisting(relativePath) {
    const locations = this.getAllPossibleLocations(relativePath);
    
    for (const location of locations) {
      if (existsSync(location.path)) {
        return location;
      }
    }
    
    return null;
  }
}

/**
 * Legacy compatibility functions
 * These maintain compatibility with existing code
 */

/**
 * Get source file path (legacy compatibility)
 * @param {string} sourcePath - Relative path
 * @returns {string|null} Absolute path or null
 */
export function getSourcePath(sourcePath) {
  return PathResolver.getStandardSource(sourcePath);
}

/**
 * Get repository root path (legacy compatibility)
 * @returns {string} Repository root path
 */
export function getRepoRoot() {
  return PathResolver.getRepoRoot();
}

/**
 * Get bundled files directory path (legacy compatibility)
 * @returns {string} Bundled root path
 */
export function getBundledRoot() {
  return PathResolver.getBundledRoot();
}

export default PathResolver;