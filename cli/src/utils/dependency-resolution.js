/**
 * Shipped dependency resolution integrity. // implements XSPEC-366 R1
 *
 * **The problem this measures.** A published npm package does not carry its
 * lockfile. Your CI tests the versions `package-lock.json` pins; whoever
 * installs the package gets whatever the declared ranges resolve to at their
 * install time. When those two differ, the entire test suite is green about a
 * combination nobody installs — and that green is indistinguishable from a
 * real one.
 *
 * **Who "whoever" is depends on how the project ships, and this module cannot
 * know that.** For a published package it is every consumer. For a product
 * distributed as a container image built with `npm ci`, its users get the
 * pinned column exactly, and the resolved column is instead what the next
 * lockfile regeneration will pull in — unreviewed, whenever someone happens to
 * run it. Both are worth knowing; neither is safe to assert as the other. The
 * report says both rather than picking one, and labels the column `resolves=`
 * for the same reason.
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
 * **And it applies npm's resolution rule, not semver's.** The highest version
 * satisfying a range is *not* what npm installs: npm prefers the `latest`
 * dist-tag whenever it satisfies, so a `next` or `beta` publish carrying an
 * ordinary version number does not land on people. Getting this wrong made the
 * tool name a version no consumer receives — see `resolveViaNpm`.
 *
 * **A registry lookup that fails is never folded into "consistent".** It
 * becomes `unverifiable` and makes the whole check non-zero. A tool whose
 * "everything is fine" and "I could not find out" look the same is worse than
 * no tool: it converts an unknown into a reassurance.
 *
 * ## Native dependencies are held to a stricter rule (XSPEC-366 R2)
 *
 * A package with a native binding is flagged when its declared version is a
 * range rather than an exact version — **even when it is not currently
 * drifting**. That is not general dependency hygiene, it is a response to
 * measured behaviour: the tree-sitter ecosystem has broken ABI inside a minor
 * range, and semver makes no promise about native ABI compatibility.
 *
 * The distinction matters because "not drifting" is a fact about today. Four
 * tree-sitter ranges in one AsiaOstrich project currently match exactly one
 * published version each, so nothing drifts — while the range that caused the
 * incident next door matched two. They are safe because upstream has not
 * published again, not because anything guarantees it, and waiting for drift
 * means waiting until users already have it.
 */

import { spawn } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import semver from 'semver';

/** How many registry lookups to run at once. */
const DEFAULT_CONCURRENCY = 8;

/**
 * Return the version an install of `range` would actually receive.
 *
 * **This deliberately reproduces npm's rule, not semver's.** The obvious
 * implementation — take the highest published version satisfying the range —
 * is wrong, and wrong in the direction this module exists to catch. npm's
 * resolver (`npm-pick-manifest`) prefers the `latest` dist-tag whenever it
 * satisfies the range, and only falls back to the maximum otherwise. That rule
 * exists so a `next` or `beta` publish does not land on people who asked for a
 * caret.
 *
 * Measured on 2026-08-07: `@anthropic-ai/claude-agent-sdk` published
 * `latest = 0.3.223` and `next = 0.3.224`, both ordinary semver strings, both
 * satisfying `^0.3`. The maximum-satisfying rule named 0.3.224;
 * `npm install @anthropic-ai/claude-agent-sdk@^0.3` installs 0.3.223. **The
 * earlier implementation reported a version no consumer receives** — in the one
 * column whose entire purpose is to say what they receive.
 *
 * Versions and tags are read in a single `npm view` call. The version list is
 * in publish order, **not** semver order — a backport released after a major
 * bump appears last while being the lowest version — so the fallback maximum is
 * computed with semver rather than by taking the final element.
 */
async function resolveViaNpm(name, range, run) {
  const { code, stdout, stderr } = await run(['view', name, 'versions', 'dist-tags', '--json']);

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

  // npm flattens the response when only one of the requested fields exists on
  // the package, so neither key can be assumed present. A package with exactly
  // one published version reports `versions` as a bare string.
  const versions = Array.isArray(parsed?.versions)
    ? parsed.versions
    : typeof parsed?.versions === 'string'
      ? [parsed.versions]
      : Array.isArray(parsed)
        ? parsed
        : typeof parsed === 'string'
          ? [parsed]
          : [];
  const tags = parsed?.['dist-tags'] ?? {};

  if (versions.length === 0) throw new Error('npm view returned no versions');

  const latest = tags.latest;
  if (typeof latest === 'string' && semver.valid(latest) && semver.satisfies(latest, range)) {
    return latest;
  }

  const max = semver.maxSatisfying(versions, range);
  if (max) return max;
  throw new Error(`no published version of ${name} satisfies ${range}`);
}

/**
 * Signals that a package carries a native binding, in the package's own
 * manifest. Both are needed: `better-sqlite3@12.8.0` declares an `install`
 * script *and* gyp-family dependencies, but its own 13.x dropped the install
 * script while remaining native — a detector using only that signal would
 * silently stop flagging it.
 */
const INSTALL_SCRIPTS = ['preinstall', 'install', 'postinstall'];
const NATIVE_BUILD_DEPS = /node-gyp|prebuild|node-addon-api|cmake-js|^bindings$/;

/** A declared version with no range operator at all. */
function isExactVersion(range) {
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(range.trim());
}

/**
 * Fetch the manifest of one exact version and decide whether it is native.
 *
 * **The version is always specified.** `npm view <name> scripts` answers about
 * the *latest* published version, not the one being examined — measured on
 * 2026-08-04: `better-sqlite3` at latest reports no install script while the
 * 12.8.0 actually in use declares one. Querying the bare name would produce a
 * confident answer about a different package version, which is the exact class
 * of error this whole module exists to detect.
 *
 * The full manifest is requested rather than named fields, because npm
 * unwraps the object when only one requested field exists — asking for
 * `scripts dependencies` on a package with no dependencies returns the scripts
 * map itself, with no `scripts` key to read it from.
 */
async function classifyNative(name, version, run) {
  const { code, stdout, stderr } = await run(['view', `${name}@${version}`, '--json']);
  if (code !== 0) {
    const detail = (stderr || stdout || '').split('\n').find((l) => l.trim()) ?? '';
    throw new Error(detail.trim() || `npm view exited ${code}`);
  }
  const manifest = JSON.parse(stdout);
  const scripts = manifest.scripts ?? {};
  const deps = { ...(manifest.dependencies ?? {}) };

  const reasons = [];
  const hookNames = INSTALL_SCRIPTS.filter((k) => typeof scripts[k] === 'string');
  if (hookNames.length > 0) reasons.push(`${hookNames.join('/')} script`);
  const buildDeps = Object.keys(deps).filter((d) => NATIVE_BUILD_DEPS.test(d));
  if (buildDeps.length > 0) reasons.push(`depends on ${buildDeps.join(', ')}`);

  return { native: reasons.length > 0, reasons };
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

/**
 * Expand npm's `workspaces` field into directories that contain a
 * package.json. // implements XSPEC-366 R1 (workspaces)
 *
 * Accepts both spellings — an array, or `{ packages: [...] }` — and supports a
 * trailing `*` in the last segment, which is what `packages/*` needs and is the
 * shape npm's own docs use. A pattern that matches nothing is returned as
 * nothing rather than as an error: an empty `packages/*` is a normal state for
 * a repository that has not added one yet.
 */
function expandWorkspaces(root, field) {
  const patterns = Array.isArray(field) ? field : Array.isArray(field?.packages) ? field.packages : [];
  const dirs = [];
  for (const pattern of patterns) {
    if (typeof pattern !== 'string' || pattern.length === 0) continue;
    const star = pattern.indexOf('*');
    if (star === -1) {
      if (existsSync(join(root, pattern, 'package.json'))) dirs.push(pattern);
      continue;
    }
    // Only a trailing `*` in the final segment is supported. Anything more
    // exotic is rejected loudly rather than silently matching less than the
    // author meant — a workspace quietly outside the denominator is the defect
    // this module exists to report.
    const prefix = pattern.slice(0, star);
    if (!pattern.endsWith('*') || prefix.includes('*') || (prefix.length > 0 && !prefix.endsWith('/'))) {
      throw new Error(
        `unsupported workspaces pattern ${JSON.stringify(pattern)} — only a trailing "*" in the last segment is understood`
      );
    }
    const parent = join(root, prefix);
    if (!existsSync(parent)) continue;
    for (const entry of readdirSync(parent, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const rel = `${prefix}${entry.name}`;
      if (existsSync(join(root, rel, 'package.json'))) dirs.push(rel);
    }
  }
  return dirs;
}

/**
 * Where the lockfile records this dependency.
 *
 * npm hoists what it can to the root `node_modules` and nests the rest under
 * the workspace, so both have to be tried; checking only one under-reports and
 * calls the miss "unverifiable", which is noise that trains people to ignore
 * the report.
 */
function lockedVersionFor(lock, workspaceDir, name) {
  const candidates = workspaceDir
    ? [`${workspaceDir}/node_modules/${name}`, `node_modules/${name}`]
    : [`node_modules/${name}`];
  for (const key of candidates) {
    const entry = lock?.packages?.[key];
    if (entry?.version) return entry.version;
  }
  return null;
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

  // Workspaces are examined too. A monorepo that declares its shipped
  // front-end in a workspace and its server at the root has two manifests, and
  // reading only the root reports a clean subset as if it were the whole — the
  // failure this module exists to catch, performed by the tool itself.
  const workspaceDirs = expandWorkspaces(root, pkg.workspaces);
  const manifests = [{ dir: null, name: pkg.name ?? null, pkg }];
  for (const dir of workspaceDirs) {
    const wsPkg = JSON.parse(readFileSync(join(root, dir, 'package.json'), 'utf8'));
    manifests.push({ dir, name: wsPkg.name ?? dir, pkg: wsPkg });
  }
  // A workspace depending on a sibling workspace is a file link, not a
  // registry package. Querying npm for it returns 404, which would be recorded
  // as unverifiable — a fabricated unknown, which is worse than a missing one
  // because it looks like a finding.
  const localNames = new Set(manifests.map((m) => m.pkg.name).filter(Boolean));

  const declared = [];
  for (const { dir, name: workspace, pkg: manifest } of manifests) {
    for (const kind of ['dependencies', 'optionalDependencies']) {
      for (const [name, range] of Object.entries(manifest[kind] ?? {})) {
        if (localNames.has(name)) continue;
        declared.push({ name, range, kind, workspace, workspaceDir: dir });
      }
    }
  }

  const run = options.run ?? spawnNpm(root);
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;

  const rows = await mapWithConcurrency(declared, concurrency, async (dep) => {
    const locked = lockedVersionFor(lock, dep.workspaceDir, dep.name);
    let resolved;
    try {
      resolved = await resolveViaNpm(dep.name, dep.range, run);
    } catch (err) {
      return { ...dep, locked, resolved: null, native: null, error: err.message };
    }
    try {
      const native = await classifyNative(dep.name, resolved, run);
      return { ...dep, locked, resolved, native, error: null };
    } catch (err) {
      // The version resolved but the manifest did not. We cannot say whether
      // this one needs pinning, and saying nothing would read as "it doesn't".
      return { ...dep, locked, resolved, native: null, error: `could not classify: ${err.message}` };
    }
  });

  // A dependency with no lockfile entry is not "consistent" — it is unknown.
  // Reporting it as fine because there was nothing to compare against would be
  // the same class of mistake as reporting a failed lookup as fine.
  const unverifiable = rows.filter((r) => r.error !== null || r.locked === null);
  const drifted = rows.filter((r) => r.error === null && r.locked !== null && r.locked !== r.resolved);

  // XSPEC-366 R2. Independent of drift on purpose: a native dependency behind
  // a range is exposed whether or not upstream has published into it yet.
  const unpinnedNative = rows.filter(
    (r) => r.native?.native === true && !isExactVersion(r.range)
  );

  const consistent = rows.length - unverifiable.length - drifted.length;

  return {
    root,
    packageName: pkg.name ?? null,
    hasLockfile: lock !== null,
    /**
     * Workspace directories examined alongside the root, so a reader can tell
     * "no workspaces here" from "workspaces were not looked at". The count
     * printed by the report is the denominator, and a denominator without its
     * scope is the shape this module was written to refuse.
     */
    workspaces: workspaceDirs,
    examined: rows.length,
    consistent,
    drifted,
    unverifiable,
    unpinnedNative,
    /** True when every dependency was checked, agreed, and needs no pinning. */
    clean: drifted.length === 0 && unverifiable.length === 0 && unpinnedNative.length === 0,
  };
}
