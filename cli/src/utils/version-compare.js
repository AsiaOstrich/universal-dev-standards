/**
 * Version order for the CLI: major.minor.patch, then a release is newer than its prereleases, and prereleases order
 * alpha < beta < rc, then by number. Kept apart from npm-registry.js (which opens network connections and is mocked wholesale
 * by tests) so the code that only needs the ORDER - the downgrade guard - does not depend on it. `npm-registry.js` re-exports it.
 *
 * @module utils/version-compare
 */

/**
 * Compare two semantic versions
 * @param {string} v1 - First version (e.g., "3.4.0-beta.3")
 * @param {string} v2 - Second version (e.g., "3.3.0")
 * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1, v2) {
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
