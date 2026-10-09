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
 * How long `npm install` of a registry version keeps trying when the registry says the version is not there yet.
 * Attempts are separated by `baseWaitMs`, then double each time (5 s, 10 s, 20 s, 40 s for 5 attempts, 75 s of waiting).
 * No new attempt starts once the next wait would carry the run past `budgetMs` (180 s) counted from the first attempt;
 * an attempt already running is not interrupted (it has its own `timeoutMs`). The failures that qualify are the ones
 * `isVersionNotVisibleYet` recognises; every other failure ends the run at once.
 */
export const INSTALL_RETRY = { attempts: 5, baseWaitMs: 5000, budgetMs: 180000 };

/**
 * Does this npm output say "that version is not on the registry (yet)" and nothing else?
 * npm says E404 when the package document is missing, ETARGET ("No matching version found") when the document is there
 * but does not list the version, and "No match found for version" for `npm view`. A freshly published version can be
 * answered like this for a while by one registry edge and not by another, which is the only failure worth retrying:
 * a network error, a 403 or a broken tarball will not get better by asking again.
 */
export function isVersionNotVisibleYet(text) {
  return /npm (?:error|ERR!) code (?:E404|ETARGET)\b|"code":\s*"(?:E404|ETARGET)"|No matching version found|No match found for version|is not in this registry/.test(String(text || ''));
}

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
export async function installPackage({ dir, version, source = null, installer = null, local = null, env = process.env, run = runProcess, timeoutMs = 600000, allowNetwork = false, retry = INSTALL_RETRY, sleep = (ms) => new Promise((wake) => setTimeout(wake, ms)), log = () => {} }) {
  const started = Date.now();
  let attempts = 0;
  const done = (extra) => ({ ok: false, kind: 'unknown', requested: version, pkgDir: null, binPath: null, version: null, output: '', durationMs: Date.now() - started, error: null, attempts, ...extra });
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
    // a registry version is asked for fresh: the registry lets a client keep a package document for minutes, and a
    // document cached before the version was published would answer every retry the same way
    if (kind === 'npm-registry') args.push('--prefer-online');
    const maxAttempts = kind === 'npm-registry' ? Math.max(1, retry.attempts) : 1;
    let r;
    for (;;) {
      attempts += 1;
      r = await run({ file: npm.file, args, cwd: dir, env, shell: npm.shell, timeoutMs });
      if (r.spawnError || r.timedOut || r.exitCode === 0) break;
      const seen = `${r.stdout || ''}${r.stderr || ''}`;
      if (!isVersionNotVisibleYet(seen)) break;
      const firstLine = seen.split(/\r?\n/).find((l) => /code|No match|not in this registry/.test(l)) || 'version not found';
      const wait = retry.baseWaitMs * 2 ** (attempts - 1);
      if (attempts >= maxAttempts) {
        log(`[beta-acceptance] npm install attempt ${attempts}/${maxAttempts} failed (${firstLine.trim()}); no attempts left. 已用完重試次數。`);
        break;
      }
      if (Date.now() - started + wait > retry.budgetMs) {
        log(`[beta-acceptance] npm install attempt ${attempts}/${maxAttempts} failed (${firstLine.trim()}); the ${Math.round(retry.budgetMs / 1000)} s limit would be passed, giving up. 超過重試總時間上限。`);
        break;
      }
      log(`[beta-acceptance] npm install attempt ${attempts}/${maxAttempts} failed (${firstLine.trim()}); the registry may not show the new version yet — retrying in ${wait / 1000} s. 版本可能還沒傳到 registry，${wait / 1000} 秒後重試。`);
      await sleep(wait);
    }
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
