import https from 'https';
import { compareVersions } from './version-compare.js';

const NPM_REGISTRY_URL = 'https://registry.npmjs.org/universal-dev-standards';

// Cache mechanism to avoid repeated queries during same CLI execution
let cachedVersionInfo = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

export { compareVersions };

/**
 * Fetch latest version info from npm registry
 * @param {Object} options - Query options
 * @param {number} options.timeout - Timeout in milliseconds, default 5000
 * @returns {Promise<Object|null>} Version info or null on error
 */
export async function fetchLatestVersion(options = {}) {
  const { timeout = 5000 } = options;

  // Check cache
  if (cachedVersionInfo && (Date.now() - cacheTimestamp < CACHE_TTL_MS)) {
    return cachedVersionInfo;
  }

  return new Promise((resolve) => {
    const req = https.get(NPM_REGISTRY_URL, { timeout }, (res) => {
      if (res.statusCode !== 200) {
        resolve(null);
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const pkg = JSON.parse(data);
          const result = {
            latest: pkg['dist-tags']?.latest || null,
            beta: pkg['dist-tags']?.beta || null,
            allTags: pkg['dist-tags'] || {}
          };

          // Update cache
          cachedVersionInfo = result;
          cacheTimestamp = Date.now();

          resolve(result);
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

/**
 * Check if a newer version is available
 * @param {string} currentVersion - Currently installed version
 * @param {Object} options - Options
 * @param {boolean} options.checkBeta - Whether to check beta versions (default: false, only check stable)
 * @returns {Promise<Object>} Update check result
 */
export async function checkForUpdates(currentVersion, options = {}) {
  const { checkBeta = false } = options;

  const versionInfo = await fetchLatestVersion();

  if (!versionInfo) {
    return {
      available: false,
      offline: true,
      message: 'Unable to check for updates (offline or network error)'
    };
  }

  // Determine target version:
  // - Default: check only stable (@latest)
  // - With checkBeta: check beta (@beta) if available
  const isCurrentBeta = currentVersion.includes('-');
  const targetVersion = checkBeta && versionInfo.beta
    ? versionInfo.beta
    : versionInfo.latest;

  if (!targetVersion) {
    return {
      available: false,
      offline: false,
      message: 'Could not determine latest version'
    };
  }

  const comparison = compareVersions(currentVersion, targetVersion);

  return {
    available: comparison < 0,
    offline: false,
    currentVersion,
    latestVersion: targetVersion,
    latestStable: versionInfo.latest,
    latestBeta: versionInfo.beta,
    isCurrentBeta,
    checkedBeta: checkBeta
  };
}

/**
 * Clear version cache (for testing)
 */
export function clearCache() {
  cachedVersionInfo = null;
  cacheTimestamp = 0;
}
