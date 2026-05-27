/**
 * meta.mjs
 * Read and update release-assets/v{VERSION}/meta.json
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..', '..');
const RELEASE_ASSETS = join(REPO_ROOT, 'release-assets');

export function metaPath(version) {
  return join(RELEASE_ASSETS, `v${version}`, 'meta.json');
}

export function readMeta(version) {
  const path = metaPath(version);
  if (!existsSync(path)) throw new Error(`meta.json not found: ${path}`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

export function writeMeta(version, data) {
  writeFileSync(metaPath(version), JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Mark a platform as posted and store the URL(s).
 * @param {string} version
 * @param {string} platform  e.g. 'linkedin'
 * @param {string|string[]} urls  single URL or array (for threads/x multi-tweet)
 */
export function markPosted(version, platform, urls) {
  const meta = readMeta(version);
  const post = meta.social_posts?.[platform];
  if (!post) throw new Error(`Platform '${platform}' not found in meta.json social_posts`);

  const now = new Date().toISOString();
  post.posted_at = now;

  if (Array.isArray(urls)) {
    // threads → post_urls, x → tweet_urls
    const key = platform === 'x' ? 'tweet_urls' : 'post_urls';
    post[key] = urls;
  } else {
    post.url = urls;
  }

  // Update publish_schedule status if all platforms done
  const platforms = meta.publish_schedule?.platforms ?? [];
  const allDone = platforms.every(p => meta.social_posts?.[p]?.posted_at !== null);
  if (allDone && meta.publish_schedule) {
    meta.publish_schedule.status = 'done';
  }

  writeMeta(version, meta);
  return meta;
}

/**
 * Find the latest version that has a pending publish_schedule.
 * Returns null if nothing is pending.
 */
export function findPendingVersion() {
  if (!existsSync(RELEASE_ASSETS)) return null;

  const versions = readdirSync(RELEASE_ASSETS)
    .filter(d => d.startsWith('v') && existsSync(join(RELEASE_ASSETS, d, 'meta.json')))
    .map(d => d.slice(1))
    .sort((a, b) => {
      // semver sort descending
      const pa = a.split('.').map(Number);
      const pb = b.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pb[i] ?? 0) - (pa[i] ?? 0);
      }
      return 0;
    });

  for (const v of versions) {
    const meta = readMeta(v);
    if (meta.publish_schedule?.status === 'pending' && meta.publish_schedule?.publish_at) {
      return v;
    }
  }
  return null;
}
