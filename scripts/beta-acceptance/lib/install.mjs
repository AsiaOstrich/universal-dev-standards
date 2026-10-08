/**
 * Install the package under test into a throwaway folder (dev-platform XSPEC-469 R2).
 *
 * The point of the acceptance run is the PUBLISHED package: what `npm install` puts on a person's disk, with the
 * `bundled/` files that only exist after `prepack`. Running the repo's own source would pass on bugs that only
 * the package has. So the default source is the npm registry; `--source` (a tarball or a folder) is for the tests
 * and for a release candidate that is not published yet, and `--local-bin` (no install at all) is for the people
 * who write the steps — the report says which one was used, in a field the generator reads.
 *
 * Standard library only.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { runProcess } from './process.mjs';

/** A version, a dist-tag, or a range-free spec. No path separators, no shell characters, no spaces. */
export const VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,63}$/;

export const PACKAGE_NAME = 'universal-dev-standards';

/**
 * How to start npm without a shell.
 *
 * 1. `npm_execpath` (set when this program was started by npm/npx) if it is npm-cli.js;
 * 2. npm-cli.js next to the running node (the layout of the official installers on every platform);
 * 3. the `npm` on PATH: on POSIX started directly; on Windows only as `npm.cmd` through a shell, because
 *    Node refuses to start a `.cmd` file directly. The argument list passed there is fixed and its one variable
 *    part has already matched VERSION_PATTERN.
 */
export function resolveNpm({ nodePlatform = process.platform, execPath = process.execPath, env = process.env, exists = existsSync } = {}) {
  const fromEnv = env.npm_execpath;
  if (fromEnv && /npm-cli\.js$/i.test(fromEnv) && exists(fromEnv)) return { file: execPath, prefixArgs: [fromEnv], shell: false, how: 'npm_execpath' };
  const pathMod = nodePlatform === 'win32' ? { sep: '\\' } : { sep: '/' };
  const nodeDir = execPath.slice(0, Math.max(execPath.lastIndexOf('\\'), execPath.lastIndexOf('/')));
  const candidates = nodePlatform === 'win32'
    ? [`${nodeDir}${pathMod.sep}node_modules${pathMod.sep}npm${pathMod.sep}bin${pathMod.sep}npm-cli.js`]
    : [`${nodeDir}/../lib/node_modules/npm/bin/npm-cli.js`, `${nodeDir}/node_modules/npm/bin/npm-cli.js`];
  for (const c of candidates) if (exists(c)) return { file: execPath, prefixArgs: [c], shell: false, how: 'npm-cli.js next to node' };
  if (nodePlatform === 'win32') return { file: 'npm.cmd', prefixArgs: [], shell: true, how: 'npm.cmd on PATH (through a shell)' };
  return { file: 'npm', prefixArgs: [], shell: false, how: 'npm on PATH' };
}

export async function readNpmVersion({ env = process.env, run = runProcess, npm = resolveNpm({ env }) } = {}) {
  try {
    const r = await run({ file: npm.file, args: [...npm.prefixArgs, '--version'], env, shell: npm.shell, timeoutMs: 30000 });
    const v = (r.stdout || '').trim().split(/\r?\n/)[0];
    return r.exitCode === 0 && v ? v : null;
  } catch {
    return null;
  }
}

function readPackage(pkgDir) {
  return JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf-8'));
}

/** The bin file the package declares for `uds`. */
export function binOf(pkgDir) {
  const pkg = readPackage(pkgDir);
  const bin = typeof pkg.bin === 'string' ? pkg.bin : (pkg.bin && (pkg.bin.uds || pkg.bin[PACKAGE_NAME] || Object.values(pkg.bin)[0]));
  if (!bin) throw new Error(`${join(pkgDir, 'package.json')} declares no "bin"`);
  return resolve(pkgDir, bin);
}

/**
 * @param {{ dir: string, version: string, source?: string|null, installer?: string|null, local?: string|null, env?: NodeJS.ProcessEnv, run?: Function, timeoutMs?: number, allowNetwork?: boolean }} o
 * @returns {Promise<{ ok: boolean, kind: string, requested: string, pkgDir: string|null, binPath: string|null, shimPath?: string|null, version: string|null, output: string, durationMs: number, error: string|null }>}
 */
export async function installPackage({ dir, version, source = null, installer = null, local = null, env = process.env, run = runProcess, timeoutMs = 600000, allowNetwork = false }) {
  const started = Date.now();
  const done = (extra) => ({ ok: false, kind: 'unknown', requested: version, pkgDir: null, binPath: null, version: null, output: '', durationMs: Date.now() - started, error: null, ...extra });
  try {
    if (local) {
      const binPath = resolve(local);
      if (!existsSync(binPath)) return done({ kind: 'local-bin', error: `--local-bin ${binPath} does not exist` });
      // <pkg>/bin/uds.js -> <pkg>
      const pkgDir = dirname(dirname(binPath));
      const pkg = readPackage(pkgDir);
      return done({ ok: true, kind: 'local-bin', pkgDir, binPath, version: pkg.version });
    }
    if (installer) {
      const mod = await import(pathToFileURL(resolve(installer)).href);
      if (typeof mod.install !== 'function') return done({ kind: 'injected-installer', error: `${installer} does not export an install() function` });
      const out = await mod.install({ dir, version });
      const pkgDir = resolve(out.pkgDir);
      const pkg = readPackage(pkgDir);
      return done({ ok: true, kind: 'injected-installer', pkgDir, binPath: binOf(pkgDir), version: pkg.version });
    }
    let spec;
    let kind;
    if (source) {
      const abs = isAbsolute(source) ? source : resolve(source);
      if (!existsSync(abs)) return done({ kind: 'local-source', error: `--source ${abs} does not exist` });
      spec = abs;
      kind = 'local-source';
    } else {
      if (!VERSION_PATTERN.test(version)) return done({ kind: 'npm-registry', error: `"${version}" is not a version or dist-tag (letters, digits, . _ + - only)` });
      spec = `${PACKAGE_NAME}@${version}`;
      kind = 'npm-registry';
    }
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'uds-beta-acceptance-sandbox', version: '0.0.0', private: true }, null, 2));
    const npm = resolveNpm({ env });
    const args = [...npm.prefixArgs, 'install', spec, '--no-audit', '--no-fund', '--no-update-notifier', '--loglevel=error'];
    // a tarball or folder on this disk must never reach for the network (the tests rely on this)
    if (kind === 'local-source' && !allowNetwork) args.push('--offline');
    const r = await run({ file: npm.file, args, cwd: dir, env, shell: npm.shell, timeoutMs });
    const output = `${r.stdout || ''}${r.stderr || ''}`.trim();
    if (r.spawnError) return done({ kind, output, error: `could not start npm (${npm.how}): ${r.spawnError}` });
    if (r.timedOut) return done({ kind, output, error: `npm install did not finish in ${Math.round(timeoutMs / 1000)}s` });
    if (r.exitCode !== 0) return done({ kind, output, error: `npm install ${spec} exited ${r.exitCode}` });
    const pkgDir = join(dir, 'node_modules', PACKAGE_NAME);
    if (!existsSync(join(pkgDir, 'package.json')) || !statSync(pkgDir).isDirectory()) {
      return done({ kind, output, error: `npm install ${spec} exited 0 but ${pkgDir} has no package.json` });
    }
    const pkg = readPackage(pkgDir);
    return done({ ok: true, kind, output, pkgDir, binPath: binOf(pkgDir), shimPath: join(dir, 'node_modules', '.bin', process.platform === 'win32' ? 'uds.cmd' : 'uds'), version: pkg.version });
  } catch (e) {
    return done({ error: `install failed: ${e.message}` });
  }
}
