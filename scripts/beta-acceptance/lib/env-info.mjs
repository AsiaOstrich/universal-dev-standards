/**
 * What machine, shell and Node this run happened on (dev-platform XSPEC-469 R2).
 *
 * Every field is a non-empty string or a plain object whose values are non-empty: a field that could not be read
 * says "取不到" (could not read) and why, never an empty string. A report with a blank "Windows code page" cannot
 * be told apart from one that forgot to ask.
 *
 * Standard library only.
 */

import { arch, release, type as osType, version as osVersion } from 'node:os';
import { basename } from 'node:path';
import { platformName } from './steps.mjs';
import { runProcess } from './process.mjs';

export const UNKNOWN = '取不到';

const clean = (text) => (typeof text === 'string' && text.trim() !== '' ? text.trim() : null);

/**
 * The Windows console code page, from `chcp`.
 * @returns {Promise<{ value: string, source: string }>}
 */
export async function readCodePage({ nodePlatform = process.platform, env = process.env, run = runProcess } = {}) {
  if (nodePlatform !== 'win32') return { value: '不適用（非 Windows）', source: `platform is ${nodePlatform}` };
  try {
    const r = await run({ file: env.ComSpec || 'cmd.exe', args: ['/d', '/c', 'chcp'], env, timeoutMs: 10000 });
    const m = /(\d{3,5})\s*$/m.exec(r.stdout || '');
    if (m) return { value: m[1], source: 'chcp' };
    return { value: UNKNOWN, source: `chcp printed no number (exit ${r.exitCode}${r.spawnError ? `, ${r.spawnError}` : ''})` };
  } catch (e) {
    return { value: UNKNOWN, source: `chcp could not run: ${e.message}` };
  }
}

/** Name of the process that started this one. */
export async function readParentProcessName({ nodePlatform = process.platform, ppid = process.ppid, env = process.env, run = runProcess } = {}) {
  try {
    if (nodePlatform === 'win32') {
      const script = `(Get-CimInstance Win32_Process -Filter "ProcessId=${Number(ppid)}").Name`;
      const r = await run({ file: 'powershell.exe', args: ['-NoProfile', '-NonInteractive', '-Command', script], env, timeoutMs: 15000 });
      return clean(r.stdout);
    }
    const r = await run({ file: 'ps', args: ['-o', 'comm=', '-p', String(Number(ppid))], env, timeoutMs: 10000 });
    return clean(r.stdout) ? basename(clean(r.stdout)) : null;
  } catch {
    return null;
  }
}

/**
 * Best guess at the shell the person typed the command into. The `evidence` field says what the guess rests on,
 * and `declared` (the person's own `--shell`) beats every guess.
 */
export function detectShell({ declared, nodePlatform = process.platform, env = process.env, parentName }) {
  if (clean(declared)) return { value: clean(declared), evidence: 'declared with --shell' };
  if (env.MSYSTEM) return { value: `Git Bash / MSYS (MSYSTEM=${env.MSYSTEM})`, evidence: 'MSYSTEM is set' };
  const parent = clean(parentName);
  if (parent) {
    const lower = parent.toLowerCase();
    if (lower === 'cmd.exe') return { value: 'cmd.exe', evidence: `parent process ${parent}` };
    if (lower === 'powershell.exe') return { value: 'Windows PowerShell', evidence: `parent process ${parent}` };
    if (lower === 'pwsh.exe' || lower === 'pwsh') return { value: 'PowerShell 7 (pwsh)', evidence: `parent process ${parent}` };
    if (/^(npm|npx|node)(\.exe)?$/.test(lower)) {
      // started through npm: the parent says nothing about the shell
    } else if (nodePlatform !== 'win32' && clean(env.SHELL)) {
      return { value: basename(env.SHELL), evidence: 'SHELL variable' };
    } else {
      return { value: parent, evidence: `parent process ${parent}` };
    }
  }
  if (clean(env.SHELL)) return { value: basename(env.SHELL), evidence: 'SHELL variable' };
  if (nodePlatform === 'win32' && clean(env.ComSpec)) return { value: `${basename(env.ComSpec)} (ComSpec; the shell you typed in is unknown)`, evidence: 'ComSpec variable only' };
  return { value: UNKNOWN, evidence: 'no SHELL/MSYSTEM variable and the parent process could not be read' };
}

const LOCALE_KEYS = ['LANG', 'LC_ALL', 'LC_MESSAGES', 'UDS_LOCALE'];

/**
 * @param {{ shell?: string, npmVersion?: string|null, nodePlatform?: string, env?: NodeJS.ProcessEnv, run?: Function, parentName?: string|null }} [options]
 */
export async function collectEnvironment({ shell, npmVersion = null, nodePlatform = process.platform, env = process.env, run = runProcess, parentName } = {}) {
  const codePage = await readCodePage({ nodePlatform, env, run });
  const parent = parentName !== undefined ? parentName : await readParentProcessName({ nodePlatform, env, run });
  const detected = detectShell({ declared: shell, nodePlatform, env, parentName: parent });
  const locale = {};
  for (const k of LOCALE_KEYS) locale[k] = clean(env[k]) || '(未設定)';
  let osVer;
  try { osVer = clean(osVersion()); } catch { osVer = null; }
  return {
    platform: platformName(nodePlatform),
    nodePlatform,
    os: {
      type: clean(osType()) || UNKNOWN,
      release: clean(release()) || UNKNOWN,
      version: osVer || UNKNOWN,
      arch: clean(arch()) || UNKNOWN,
    },
    shell: detected,
    parentProcess: clean(parent) || UNKNOWN,
    node: { version: clean(process.version) || UNKNOWN },
    npm: { version: clean(npmVersion) || UNKNOWN },
    windowsCodePage: codePage,
    locale,
    terminal: { stdinIsTTY: Boolean(process.stdin.isTTY), stdoutIsTTY: Boolean(process.stdout.isTTY) },
    ci: Boolean(env.CI),
  };
}
