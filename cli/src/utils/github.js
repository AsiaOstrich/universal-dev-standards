import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync, copyFileSync } from 'fs';
import { dirname, join, basename } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import https from 'https';

// Re-export agent-specific functions from ai-agent-paths for unified API
export {
  AI_AGENT_PATHS,
  getAgentConfig,
  getSkillsDirForAgent,
  getCommandsDirForAgent,
  getSkillsSupportedAgents,
  getCommandsSupportedAgents,
  supportsMarketplace,
  getFallbackSkillsPath,
  getAgentDisplayName,
  AVAILABLE_COMMANDS
} from '../config/ai-agent-paths.js';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main';
const SKILLS_RAW_BASE = 'https://raw.githubusercontent.com/AsiaOstrich/universal-dev-standards/main/skills';

// Get the CLI package root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_ROOT = join(__dirname, '..', '..');
const SKILLS_LOCAL_DIR = join(CLI_ROOT, '..', 'skills', 'claude-code');

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

/**
 * Download a file from Skills repository
 * @param {string} filePath - Path relative to skills repo root
 * @returns {Promise<string>} File content
 */
export function downloadFromSkillsRepo(filePath) {
  const url = `${SKILLS_RAW_BASE}/${filePath}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
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
 * Get the Skills installation directory
 * @returns {string} Path to ~/.claude/skills/
 */
export function getSkillsDir() {
  return join(homedir(), '.claude', 'skills');
}

/**
 * Check if local skills directory exists
 * @returns {boolean} True if local skills are available
 */
export function hasLocalSkills() {
  return existsSync(SKILLS_LOCAL_DIR);
}

/**
 * Get local skills directory path
 * @returns {string} Path to local skills directory
 */
export function getLocalSkillsDir() {
  return SKILLS_LOCAL_DIR;
}

/**
 * Install a single Skill from local directory
 * @param {string} skillName - Skill name (e.g., 'ai-collaboration-standards')
 * @returns {Object} Result with success status
 */
export function installSkillFromLocal(skillName) {
  const sourceDir = join(SKILLS_LOCAL_DIR, skillName);
  const skillsDir = getSkillsDir();
  const targetDir = join(skillsDir, skillName);

  if (!existsSync(sourceDir)) {
    return {
      success: false,
      skillName,
      files: [],
      error: `Skill directory not found: ${sourceDir}`,
      path: null
    };
  }

  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  const results = [];
  try {
    const files = readdirSync(sourceDir);
    for (const fileName of files) {
      const sourceFile = join(sourceDir, fileName);
      const targetFile = join(targetDir, fileName);

      try {
        copyFileSync(sourceFile, targetFile);
        results.push({ file: fileName, success: true });
      } catch (error) {
        results.push({ file: fileName, success: false, error: error.message });
      }
    }
  } catch (error) {
    return {
      success: false,
      skillName,
      files: results,
      error: error.message,
      path: null
    };
  }

  const allSuccess = results.every(r => r.success);
  return {
    success: allSuccess,
    skillName,
    files: results,
    path: targetDir
  };
}

/**
 * Download and install a single Skill from remote repository
 * @param {string} skillName - Skill name (e.g., 'ai-collaboration-standards')
 * @param {string[]} skillFiles - Array of file paths relative to skills repo
 * @returns {Promise<Object>} Result with success status
 */
export async function downloadSkill(skillName, skillFiles) {
  // Prefer local installation if available
  if (hasLocalSkills()) {
    return installSkillFromLocal(skillName);
  }

  // Fall back to remote download
  const skillsDir = getSkillsDir();
  const targetDir = join(skillsDir, skillName);

  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  const results = [];
  for (const filePath of skillFiles) {
    const fileName = basename(filePath);
    const targetFile = join(targetDir, fileName);

    try {
      const content = await downloadFromSkillsRepo(filePath);
      writeFileSync(targetFile, content);
      results.push({ file: fileName, success: true });
    } catch (error) {
      results.push({ file: fileName, success: false, error: error.message });
    }
  }

  const allSuccess = results.every(r => r.success);
  return {
    success: allSuccess,
    skillName,
    files: results,
    path: targetDir
  };
}

/**
 * Check if Skills are already installed and get version info
 * @returns {Object|null} Installed skills info or null
 */
export function getInstalledSkillsInfo() {
  const skillsDir = getSkillsDir();
  const manifestPath = join(skillsDir, '.manifest.json');

  if (!existsSync(manifestPath)) {
    // Check if any skill directories exist
    if (!existsSync(skillsDir)) {
      return null;
    }

    // Skills exist but no manifest - likely manually installed
    return {
      installed: true,
      version: null,
      source: 'unknown'
    };
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    return {
      installed: true,
      version: manifest.version || null,
      source: manifest.source || 'universal-dev-standards',
      installedDate: manifest.installedDate || null
    };
  } catch {
    return {
      installed: true,
      version: null,
      source: 'unknown'
    };
  }
}

/**
 * Write Skills manifest file
 * @param {string} version - Version of skills installed
 * @param {string} targetDir - Optional target directory (defaults to user-level)
 */
export function writeSkillsManifest(version, targetDir = null) {
  const skillsDir = targetDir || getSkillsDir();
  const manifestPath = join(skillsDir, '.manifest.json');

  if (!existsSync(skillsDir)) {
    mkdirSync(skillsDir, { recursive: true });
  }

  const manifest = {
    version,
    source: 'universal-dev-standards',
    installedDate: new Date().toISOString().split('T')[0]
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Get the project-level Skills installation directory
 * @param {string} projectPath - Project root path
 * @returns {string} Path to project/.claude/skills/
 */
export function getProjectSkillsDir(projectPath) {
  return join(projectPath, '.claude', 'skills');
}

/**
 * Check if project-level Skills are installed and get version info
 * @param {string} projectPath - Project root path
 * @returns {Object|null} Installed skills info or null
 */
export function getProjectInstalledSkillsInfo(projectPath) {
  const skillsDir = getProjectSkillsDir(projectPath);
  const manifestPath = join(skillsDir, '.manifest.json');

  if (!existsSync(manifestPath)) {
    // Check if any skill directories exist
    if (!existsSync(skillsDir)) {
      return null;
    }

    // Skills exist but no manifest - likely manually installed
    return {
      installed: true,
      version: null,
      source: 'unknown',
      location: 'project'
    };
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    return {
      installed: true,
      version: manifest.version || null,
      source: manifest.source || 'universal-dev-standards',
      installedDate: manifest.installedDate || null,
      location: 'project'
    };
  } catch {
    return {
      installed: true,
      version: null,
      source: 'unknown',
      location: 'project'
    };
  }
}

/**
 * Install a single Skill to a specific target directory
 * @param {string} skillName - Skill name (e.g., 'ai-collaboration-standards')
 * @param {string} targetBaseDir - Target base directory for skills
 * @returns {Object} Result with success status
 */
export function installSkillToDir(skillName, targetBaseDir) {
  const sourceDir = join(SKILLS_LOCAL_DIR, skillName);
  const targetDir = join(targetBaseDir, skillName);

  if (!existsSync(sourceDir)) {
    return {
      success: false,
      skillName,
      files: [],
      error: `Skill directory not found: ${sourceDir}`,
      path: null
    };
  }

  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  const results = [];
  try {
    const files = readdirSync(sourceDir);
    for (const fileName of files) {
      const sourceFile = join(sourceDir, fileName);
      const targetFile = join(targetDir, fileName);

      try {
        copyFileSync(sourceFile, targetFile);
        results.push({ file: fileName, success: true });
      } catch (error) {
        results.push({ file: fileName, success: false, error: error.message });
      }
    }
  } catch (error) {
    return {
      success: false,
      skillName,
      files: results,
      error: error.message,
      path: null
    };
  }

  const allSuccess = results.every(r => r.success);
  return {
    success: allSuccess,
    skillName,
    files: results,
    path: targetDir
  };
}

/**
 * Compare two semantic versions for sorting
 * @param {string} a - First version
 * @param {string} b - Second version
 * @returns {number} -1, 0, or 1
 */
function compareVersionsForSort(a, b) {
  const parseVersion = (v) => {
    const [main, prerelease] = v.split('-');
    const [major, minor, patch] = main.split('.').map(Number);
    return { major, minor, patch, prerelease: prerelease || null };
  };

  const pa = parseVersion(a);
  const pb = parseVersion(b);

  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  if (pa.patch !== pb.patch) return pa.patch - pb.patch;

  // No prerelease > prerelease
  if (!pa.prerelease && pb.prerelease) return 1;
  if (pa.prerelease && !pb.prerelease) return -1;
  if (!pa.prerelease && !pb.prerelease) return 0;

  // Compare prerelease (beta.1 < beta.2)
  const parsePrerelease = (pr) => {
    const match = pr.match(/^(alpha|beta|rc)\.?(\d+)?$/);
    if (match) {
      const order = { alpha: 1, beta: 2, rc: 3 };
      return { type: order[match[1]] || 0, num: parseInt(match[2] || '0', 10) };
    }
    return { type: 0, num: 0 };
  };

  const pra = parsePrerelease(pa.prerelease);
  const prb = parsePrerelease(pb.prerelease);

  if (pra.type !== prb.type) return pra.type - prb.type;
  return pra.num - prb.num;
}

/**
 * Get Plugin Marketplace installed skills info
 * Reads from ~/.claude/plugins/installed_plugins.json and cache directory
 * @returns {Object|null} Marketplace skills info or null
 */
export function getMarketplaceSkillsInfo() {
  const pluginsFile = join(homedir(), '.claude', 'plugins', 'installed_plugins.json');

  if (!existsSync(pluginsFile)) {
    return null;
  }

  try {
    const data = JSON.parse(readFileSync(pluginsFile, 'utf-8'));
    const plugins = data.plugins || {};

    // Look for universal-dev-standards plugin (various marketplace keys)
    const udsKeys = Object.keys(plugins).filter(key =>
      key.includes('universal-dev-standards')
    );

    if (udsKeys.length === 0) {
      return null;
    }

    // Get the first matching plugin info
    const pluginKey = udsKeys[0];
    const pluginInfo = plugins[pluginKey];

    if (!pluginInfo || pluginInfo.length === 0) {
      return null;
    }

    const info = pluginInfo[0];
    let version = info.version || 'unknown';

    // installed_plugins.json may have stale records - plugin may be uninstalled
    // but JSON record not cleaned up. Verify cache directory actually exists.
    // pluginKey format: "universal-dev-standards@asia-ostrich"
    const parts = pluginKey.split('@');
    if (parts.length === 2) {
      const [pluginName, marketplace] = parts;
      const cacheDir = join(homedir(), '.claude', 'plugins', 'cache', marketplace, pluginName);

      // Fix: If cache directory doesn't exist, plugin was uninstalled but record remains
      // Return null to indicate plugin is not actually installed
      if (!existsSync(cacheDir)) {
        return null;
      }

      try {
        const versions = readdirSync(cacheDir)
          .filter(name => name.match(/^\d+\.\d+\.\d+/));

        if (versions.length > 0) {
          // Sort versions and get the latest
          versions.sort(compareVersionsForSort);
          const latestVersion = versions[versions.length - 1];
          if (latestVersion && latestVersion !== version) {
            version = latestVersion;
          }
        }
      } catch {
        // Ignore errors reading cache directory
      }
    }

    return {
      installed: true,
      version,
      installPath: info.installPath || null,
      installedAt: info.installedAt || null,
      lastUpdated: info.lastUpdated || null,
      source: 'marketplace',
      pluginKey
    };
  } catch {
    return null;
  }
}

/**
 * Download and install a single Skill to a specific target directory
 * @param {string} skillName - Skill name
 * @param {string[]} skillFiles - Array of file paths relative to skills repo
 * @param {string} targetLocation - 'user' or 'project'
 * @param {string} projectPath - Project path (required if targetLocation is 'project')
 * @returns {Promise<Object>} Result with success status
 */
export async function downloadSkillToLocation(skillName, skillFiles, targetLocation = 'user', projectPath = null) {
  // Determine target directory
  const targetBaseDir = targetLocation === 'project' && projectPath
    ? getProjectSkillsDir(projectPath)
    : getSkillsDir();

  // Prefer local installation if available
  if (hasLocalSkills()) {
    return installSkillToDir(skillName, targetBaseDir);
  }

  // Fall back to remote download
  const targetDir = join(targetBaseDir, skillName);

  // Ensure target directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }

  const results = [];
  for (const filePath of skillFiles) {
    const fileName = basename(filePath);
    const targetFile = join(targetDir, fileName);

    try {
      // For remote download, we need to extract just the skill-relative path
      // skillFiles paths are like: skills/ai-collaboration-standards/SKILL.md
      // We need just: ai-collaboration-standards/SKILL.md
      const relativePath = filePath.replace(/^skills\/claude-code\//, '');
      const content = await downloadFromSkillsRepo(relativePath);
      writeFileSync(targetFile, content);
      results.push({ file: fileName, success: true });
    } catch (error) {
      results.push({ file: fileName, success: false, error: error.message });
    }
  }

  const allSuccess = results.every(r => r.success);
  return {
    success: allSuccess,
    skillName,
    files: results,
    path: targetDir
  };
}
