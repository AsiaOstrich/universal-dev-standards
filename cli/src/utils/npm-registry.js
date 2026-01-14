import https from 'https';

const NPM_REGISTRY_URL = 'https://registry.npmjs.org/universal-dev-standards';

// Cache mechanism to avoid repeated queries during same CLI execution
let cachedVersionInfo = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

/**
 * Compare two semantic versions
 * @param {string} v1 - First version (e.g., "3.4.0-beta.3")
 * @param {string} v2 - Second version (e.g., "3.3.0")
 * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const parseVersion = (v) => {
    const [main, prerelease] = v.split('-');
    const [major, minor, patch] = main.split('.').map(Number);
    return { major, minor, patch, prerelease: prerelease || null };
  };

  const p1 = parseVersion(v1);
  const p2 = parseVersion(v2);

  if (p1.major !== p2.major) return p1.major > p2.major ? 1 : -1;
  if (p1.minor !== p2.minor) return p1.minor > p2.minor ? 1 : -1;
  if (p1.patch !== p2.patch) return p1.patch > p2.patch ? 1 : -1;

  // Same major.minor.patch - compare prerelease
  // No prerelease > prerelease (e.g., 3.4.0 > 3.4.0-beta.1)
  if (!p1.prerelease && p2.prerelease) return 1;
  if (p1.prerelease && !p2.prerelease) return -1;
  if (!p1.prerelease && !p2.prerelease) return 0;

  // Both have prerelease - compare them
  const prereleaseOrder = { alpha: 1, beta: 2, rc: 3 };
  const parsePrerelease = (pr) => {
    const match = pr.match(/^(alpha|beta|rc)\.?(\d+)?$/);
    if (match) {
      return { type: match[1], num: parseInt(match[2] || '0', 10) };
    }
    return { type: pr, num: 0 };
  };

  const pr1 = parsePrerelease(p1.prerelease);
  const pr2 = parsePrerelease(p2.prerelease);

  const order1 = prereleaseOrder[pr1.type] || 0;
  const order2 = prereleaseOrder[pr2.type] || 0;

  if (order1 !== order2) return order1 > order2 ? 1 : -1;
  if (pr1.num !== pr2.num) return pr1.num > pr2.num ? 1 : -1;

  return 0;
}

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
