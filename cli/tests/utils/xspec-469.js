/**
 * Shared pieces for the XSPEC-469 end-to-end tests (beta acceptance: scripts/beta-acceptance/).
 *
 * - `REPO`, `ACCEPT_DIR`: where the program under test is. Every test starts it as a person would, with
 *   `node scripts/beta-acceptance/run.mjs ...`, in a real child process.
 * - `writeFakePackage(dir, version)`: a package that looks like `universal-dev-standards` to npm and to the program:
 *   the right name, a `bin` entry, and a `uds` that answers a few commands (--version, echo, exit, write, env).
 *   It stands in for the registry so no test touches the network.
 * - `writeInstaller(file, version)`: an `--installer` module that lays that package out the way npm would
 *   (`<dir>/node_modules/universal-dev-standards`), without running npm.
 * - `scratch()`: a throwaway directory per test file, removed by `cleanup()`.
 *
 * Nothing here reads the clock, the platform or the real home folder into an expectation.
 */

import { spawnSync } from 'child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

export const REPO = resolve(import.meta.dirname, '../../..');
export const ACCEPT_DIR = join(REPO, 'scripts', 'beta-acceptance');
export const RUN = join(ACCEPT_DIR, 'run.mjs');

const FAKE_UDS = `#!/usr/bin/env node
const fs = require('fs');
const [cmd, a, b] = process.argv.slice(2);
if (cmd === '--version') { console.log(require('../package.json').version); }
else if (cmd === 'echo') { console.log(a); }
else if (cmd === 'exit') { console.log('exiting with ' + a); process.exit(Number(a)); }
else if (cmd === 'write') { fs.writeFileSync(a, b); console.log('wrote ' + a); }
else if (cmd === 'env') { console.log(String(process.env[a])); }
else { console.error('unknown command: ' + cmd); process.exit(64); }
`;

/** A package npm can install from a folder: name, version, bin, and the fake uds. */
export function writeFakePackage(dir, version = '1.2.3') {
  mkdirSync(join(dir, 'bin'), { recursive: true });
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'universal-dev-standards', version, bin: { uds: 'bin/uds.js' }, license: 'MIT' }, null, 2));
  writeFileSync(join(dir, 'bin', 'uds.js'), FAKE_UDS, { mode: 0o755 });
  return dir;
}

/** An `--installer` module: lays the fake package out as `<dir>/node_modules/universal-dev-standards`. */
export function writeInstaller(file, version = '1.2.3') {
  const source = `
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
export async function install({ dir }) {
  const pkgDir = join(dir, 'node_modules', 'universal-dev-standards');
  mkdirSync(join(pkgDir, 'bin'), { recursive: true });
  writeFileSync(join(pkgDir, 'package.json'), ${JSON.stringify(JSON.stringify({ name: 'universal-dev-standards', version, bin: { uds: 'bin/uds.js' } }))});
  writeFileSync(join(pkgDir, 'bin', 'uds.js'), ${JSON.stringify(FAKE_UDS)});
  return { pkgDir };
}
`;
  writeFileSync(file, source);
  return file;
}

export function scratch(prefix = 'uds-xspec469-') {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  let n = 0;
  return {
    dir,
    next: (name) => join(dir, `${++n}-${name}`),
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

/** Another platform name than the one running the tests, in the vocabulary of steps.json. */
export const otherPlatform = () => (process.platform === 'win32' ? 'linux' : 'windows');

/**
 * Run the acceptance program as a person would.
 * @returns {{ code: number|null, stdout: string, stderr: string, out: string, outDir: string, reports: () => Array<{file:string, md:string, json:object}> }}
 */
export function runAcceptance(args, { outDir, env = {}, cwd = REPO, timeout = 180000 } = {}) {
  const r = spawnSync(process.execPath, [RUN, ...args, ...(outDir && !args.includes('--out') ? ['--out', outDir] : [])], {
    cwd,
    encoding: 'utf-8',
    timeout,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return {
    code: r.status,
    stdout: r.stdout || '',
    stderr: r.stderr || '',
    out: `${r.stdout || ''}${r.stderr || ''}`,
    outDir,
    reports: () => {
      if (!outDir || !existsSync(outDir)) return [];
      return readdirSync(outDir).filter((n) => n.endsWith('.json')).sort().map((n) => ({
        file: n,
        md: readFileSync(join(outDir, n.replace(/\.json$/, '.md')), 'utf-8'),
        json: JSON.parse(readFileSync(join(outDir, n), 'utf-8')),
      }));
    },
  };
}

/** A steps file with the given steps (each defaulted to platform "all"). */
export function writeSteps(file, steps, exemptions) {
  const doc = { schema: 1, ...(exemptions ? { exemptions } : {}), steps: steps.map((s) => ({ platform: 'all', smoke: true, changelog: [], titleZh: `${s.title}（中文）`, ...s })) };
  writeFileSync(file, JSON.stringify(doc, null, 2));
  return file;
}

/** Copy the program (and the one shared file it imports) to a throwaway place, so a test can weaken a copy. */
export function copyProgram(root) {
  mkdirSync(join(root, 'scripts', 'lib'), { recursive: true });
  cpSync(ACCEPT_DIR, join(root, 'scripts', 'beta-acceptance'), { recursive: true, filter: (src) => !src.includes(`${join('beta-acceptance', 'reports')}`) });
  cpSync(join(REPO, 'scripts', 'lib', 'isolated-home.mjs'), join(root, 'scripts', 'lib', 'isolated-home.mjs'));
  return join(root, 'scripts', 'beta-acceptance');
}

/** Apply one text replacement to a copied file; it must apply exactly once, so a no-op cannot pass for a weakening. */
export function weaken(file, from, to) {
  const text = readFileSync(file, 'utf-8');
  const n = text.split(from).length - 1;
  if (n !== 1) throw new Error(`the weakening must apply exactly once in ${file}, applied ${n} times: ${from}`);
  writeFileSync(file, text.replace(from, () => to));
}

/** Every string in a JSON value, with the path it was found at. */
export function* strings(value, path = '$') {
  if (typeof value === 'string') yield [path, value];
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* strings(v, `${path}[${i}]`);
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) yield* strings(v, `${path}.${k}`);
}
