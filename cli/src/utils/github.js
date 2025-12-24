import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { dirname, join, basename } from 'path';
import https from 'https';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main';

/**
 * Download a file from GitHub raw content
 * @param {string} filePath - Path relative to repo root (e.g., 'core/checkin-standards.md')
 * @returns {Promise<string>} File content
 */
export function downloadFromGitHub(filePath) {
  const url = `${GITHUB_RAW_BASE}/${filePath}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        https.get(res.headers.location, (redirectRes) => {
          if (redirectRes.statusCode !== 200) {
            reject(new Error(`GitHub returned ${redirectRes.statusCode} for ${filePath}`));
            return;
          }

          let data = '';
          redirectRes.on('data', chunk => data += chunk);
          redirectRes.on('end', () => resolve(data));
          redirectRes.on('error', reject);
        }).on('error', reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`GitHub returned ${res.statusCode} for ${filePath}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Download and save a standard file to the target project
 * @param {string} sourcePath - Relative path from repo root (e.g., 'core/checkin-standards.md')
 * @param {string} targetDir - Target directory (usually '.standards')
 * @param {string} projectPath - Project root path
 * @returns {Promise<Object>} Result with success status and copied path
 */
export async function downloadStandard(sourcePath, targetDir, projectPath) {
  const targetFolder = join(projectPath, targetDir);
  const targetFile = join(targetFolder, basename(sourcePath));

  // Ensure target directory exists
  if (!existsSync(targetFolder)) {
    mkdirSync(targetFolder, { recursive: true });
  }

  try {
    const content = await downloadFromGitHub(sourcePath);
    writeFileSync(targetFile, content);
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

/**
 * Download and save an integration file to its target location
 * @param {string} sourcePath - Source path relative to repo root
 * @param {string} targetPath - Target path relative to project root
 * @param {string} projectPath - Project root path
 * @returns {Promise<Object>} Result
 */
export async function downloadIntegration(sourcePath, targetPath, projectPath) {
  const target = join(projectPath, targetPath);

  // Ensure target directory exists
  const targetDir = dirname(target);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  try {
    const content = await downloadFromGitHub(sourcePath);
    writeFileSync(target, content);
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
