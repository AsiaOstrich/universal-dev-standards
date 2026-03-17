import fs from 'fs';
import path from 'path';
import os from 'os';
import { checkForUpdates, compareVersions } from './npm-registry.js';

const UDS_DIR = path.join(os.homedir(), '.uds');
const CACHE_FILE = path.join(UDS_DIR, 'update-check.json');
const DEFAULT_INTERVAL_MS = 86400000; // 24 hours

/**
 * Read update check cache from disk
 * @returns {Object|null} Cached data or null
 */
export function readUpdateCache() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Write update check cache to disk
 * @param {Object} data - Cache data to write
 */
export function writeUpdateCache(data) {
  try {
    if (!fs.existsSync(UDS_DIR)) {
      fs.mkdirSync(UDS_DIR, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Silent failure — cache write is non-critical
  }
}

/**
 * Determine if the check should be throttled (skipped)
 * @param {Object|null} cacheData - Cached data from readUpdateCache()
 * @param {number} intervalMs - Minimum interval between checks
 * @returns {boolean} true if check should be skipped
 */
export function shouldThrottle(cacheData, intervalMs = DEFAULT_INTERVAL_MS) {
  if (!cacheData || !cacheData.lastChecked) return false;
  const elapsed = Date.now() - new Date(cacheData.lastChecked).getTime();
  return elapsed < intervalMs;
}

/**
 * Check for updates with throttling, cache, and environment guards
 * @param {string} currentVersion - Current CLI version
 * @param {Object} options - Options
 * @param {number} options.intervalMs - Throttle interval (default 24hr)
 * @returns {Promise<Object|null>} Result with shouldNotify flag, or null if skipped
 */
export async function maybeCheckForUpdates(currentVersion, options = {}) {
  const { intervalMs = DEFAULT_INTERVAL_MS } = options;

  // Skip in CI or non-TTY environments
  if (process.env.CI || process.env.CONTINUOUS_INTEGRATION || !process.stdout.isTTY) {
    return null;
  }

  // Skip if user disabled update checks
  if (process.env.UDS_NO_UPDATE_CHECK === '1') {
    return null;
  }

  // Throttle check
  const cache = readUpdateCache();
  if (shouldThrottle(cache, intervalMs)) {
    // Use cached result if available
    if (cache && cache.latestVersion) {
      const cmp = compareVersions(currentVersion, cache.latestVersion);
      if (cmp < 0) {
        return {
          shouldNotify: true,
          currentVersion,
          latestVersion: cache.latestVersion,
          latestBeta: cache.latestBeta || null,
          fromCache: true
        };
      }
    }
    return null;
  }

  // Perform the check
  const result = await checkForUpdates(currentVersion);

  // Update cache regardless of result
  const cacheData = {
    lastChecked: new Date().toISOString(),
    latestVersion: result.latestStable || null,
    latestBeta: result.latestBeta || null
  };
  writeUpdateCache(cacheData);

  if (result.offline || !result.available) {
    return null;
  }

  return {
    shouldNotify: true,
    currentVersion: result.currentVersion,
    latestVersion: result.latestVersion,
    latestBeta: result.latestBeta || null,
    fromCache: false
  };
}

/**
 * Format update notice with box drawing characters
 * @param {Object} result - Result from maybeCheckForUpdates
 * @param {Object} messages - i18n messages from t()
 * @returns {string} Formatted notice string
 */
export function formatUpdateNotice(result, messages) {
  const msg = messages.updateNotice || {};
  const header = msg.header || 'Update available';
  const command = msg.command || 'npm update -g universal-dev-standards';
  const disableHint = msg.disableHint || 'Set UDS_NO_UPDATE_CHECK=1 to disable';

  const line1 = `  ${header}: ${result.currentVersion} → ${result.latestVersion}`;
  const line2 = `  Run: ${command}`;
  const line3 = `  ${disableHint}`;

  const maxLen = Math.max(line1.length, line2.length, line3.length);
  const pad = (s) => s + ' '.repeat(Math.max(0, maxLen - s.length));

  const top = `┌${'─'.repeat(maxLen + 2)}┐`;
  const mid1 = `│ ${pad(line1.trimStart())} │`;
  const mid2 = `│ ${pad(line2.trimStart())} │`;
  const bot = `└${'─'.repeat(maxLen + 2)}┘`;

  return `\n${top}\n${mid1}\n${mid2}\n${bot}`;
}
