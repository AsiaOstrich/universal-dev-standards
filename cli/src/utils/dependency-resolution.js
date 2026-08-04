/**
 * Shipped dependency resolution integrity. // implements XSPEC-366 R1
 *
 * **The problem this measures.** A published npm package does not carry its
 * lockfile. Your CI tests the versions `package-lock.json` pins; your users get
 * whatever the declared ranges resolve to at their install time. When those two
 * differ, the entire test suite is green about a combination nobody installs —
 * and that green is indistinguishable from a real one.
 *
 * This is not hypothetical. `engramgraph` declared
 * `"tree-sitter-c-sharp": "^0.23.1"`. Three published versions satisfy that
 * range and they do not share an API: 0.23.1 exports `nodeTypeInfo`, 0.23.5
 * does not. npm resolves a caret to the newest match, so every fresh install
 * received the incompatible one and **no C# file ever parsed for anyone who
 * installed from npm** — while the lockfile pinned the working version and
 * every test passed. See XSPEC-365 / XSPEC-366.
 *
 * ## Three design choices worth knowing
 *
 * **Only `dependencies` and `optionalDependencies` are examined.**
 * `devDependencies` are not installed by consumers, so a drift there cannot
 * reach them.
 *
 * **Resolution goes through `npm view`, not a hand-rolled registry fetch.**
 * The question being asked is "what would resolve *in this environment*", and
 * `npm view` honours the local npm configuration — private registries, scoped
 * registries, auth, proxies. A direct fetch of registry.npmjs.org would
 * silently answer a different question for anyone who does not install from
 * the public registry, and would answer it confidently.
 *
 * **A registry lookup that fails is never folded into "consistent".** It
 * becomes `unverifiable` and makes the whole check non-zero. A tool whose
 * "everything is fine" and "I could not find out" look the same is worse than
 * no tool: it converts an unknown into a reassurance.
 */

import { spawn } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import semver from 'semver';

/** How many registry lookups to run at once. */
const DEFAULT_CONCURRENCY = 8;

/**
 * Run `npm view <name>@<range> version --json` and return the highest version
 * that satisfies the range.
 *
 * npm prints a bare JSON string when exactly one version matches and a JSON
 * array when several do. The array is in publish order, **not** semver order —
 * a backport released after a major bump appears last while being the lowest
 * version — so the maximum is computed with semver rather than by taking the
 * final element. Guessing here would produce a confident wrong answer, which
 * is the failure mode this whole module exists to detect.
 */
async function resolveViaNpm(name, range, run) {
  const { code, stdout, stderr } = await run(['view', `${name}@${range}`, 'version', '--json']);

  if (code !== 0) {
    const detail = (stderr || stdout || '').split('\n').find((l) => l.trim()) ?? '';
    throw new Error(detail.trim() || `npm view exited ${code}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    throw new Error(`npm view returned output that is not JSON: ${stdout.slice(0, 120)}`);
  }

  if (typeof parsed === 'string') return parsed;
  if (Array.isArray(parsed) && parsed.length > 0) {
    const max = semver.maxSatisfying(parsed, range);
    if (max) return max;
    throw new Error(`no version in [${parsed.join(', ')}] satisfies ${range}`);
  }
  throw new Error('npm view returned no version');
}

/** Default runner: spawn npm and collect its output. */
function spawnNpm(cwd) {
  return (args) =>
    new Promise((resolve) => {
      const child = spawn('npm', args, { cwd, shell: process.platform === 'win32' });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d) => (stdout += d));
      child.stderr.on('data', (d) => (stderr += d));
      child.on('error', (err) => resolve({ code: -1, stdout: '', stderr: err.message }));
      child.on('close', (code) => resolve({ code, stdout, stderr }));
    });
}

/** Map over `items` with a bounded number of concurrent workers. */
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

/**
 * Compare, for every runtime dependency of the package at `root`: the declared
 * range, the version the lockfile pins, and the version a consumer's install
 * would resolve to.
 *
 * @param {string} root Directory containing package.json.
 * @param {object} [options]
 * @param {number} [options.concurrency]
 * @param {(args: string[]) => Promise<{code: number, stdout: string, stderr: string}>} [options.run]
 *   Injected for tests, so the unit tests do not depend on the network — the
 *   thing being tested is the comparison and the failure handling, not npm.
 * @returns {Promise<object>} measurement result; see the shape below.
 */
export async function measureResolutionDrift(root, options = {}) {
  const pkgPath = join(root, 'package.json');
  if (!existsSync(pkgPath)) {
    throw new Error(`no package.json at ${root}`);
  }
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

  const lockPath = join(root, 'package-lock.json');
  const lock = existsSync(lockPath) ? JSON.parse(readFileSync(lockPath, 'utf8')) : null;

  const declared = [
    ...Object.entries(pkg.dependencies ?? {}).map(([name, range]) => ({ name, range, kind: 'dependencies' })),
    ...Object.entries(pkg.optionalDependencies ?? {}).map(([name, range]) => ({ name, range, kind: 'optionalDependencies' })),
  ];

  const run = options.run ?? spawnNpm(root);
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;

  const rows = await mapWithConcurrency(declared, concurrency, async (dep) => {
    const locked = lock?.packages?.[`node_modules/${dep.name}`]?.version ?? null;
    try {
      const resolved = await resolveViaNpm(dep.name, dep.range, run);
      return { ...dep, locked, resolved, error: null };
    } catch (err) {
      return { ...dep, locked, resolved: null, error: err.message };
    }
  });

  // A dependency with no lockfile entry is not "consistent" — it is unknown.
  // Reporting it as fine because there was nothing to compare against would be
  // the same class of mistake as reporting a failed lookup as fine.
  const unverifiable = rows.filter((r) => r.error !== null || r.locked === null);
  const drifted = rows.filter((r) => r.error === null && r.locked !== null && r.locked !== r.resolved);
  const consistent = rows.length - unverifiable.length - drifted.length;

  return {
    root,
    packageName: pkg.name ?? null,
    hasLockfile: lock !== null,
    examined: rows.length,
    consistent,
    drifted,
    unverifiable,
    /** True when every dependency was checked and every one agreed. */
    clean: drifted.length === 0 && unverifiable.length === 0,
  };
}
