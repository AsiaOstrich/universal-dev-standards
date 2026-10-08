/**
 * Run a program and collect what it wrote. No shell, ever: the argument list is the argument list.
 * (dev-platform XSPEC-469 R2)
 *
 * Why no shell: on Windows a shell re-reads the arguments (a `&` or `%VAR%` in a value changes the command), and
 * since Node 20.12 `spawn('npm.cmd', ..., { shell: false })` is refused with EINVAL. `lib/install.mjs` therefore
 * starts npm as `node npm-cli.js`, which needs no `.cmd` and no shell.
 *
 * Standard library only.
 */

import { spawn } from 'node:child_process';

/** Per stream. A runaway command must not fill the report or memory. */
export const MAX_CAPTURE = 2 * 1024 * 1024;

/**
 * @param {{ file: string, args?: string[], cwd?: string, env?: NodeJS.ProcessEnv, stdin?: string, timeoutMs?: number, inherit?: boolean, shell?: boolean }} options
 * @returns {Promise<{ exitCode: number|null, signal: string|null, stdout: string, stderr: string, timedOut: boolean, spawnError: string|null, durationMs: number, truncated: boolean }>}
 */
export function runProcess({ file, args = [], cwd, env, stdin, timeoutMs = 120000, inherit = false, shell = false }) {
  const started = Date.now();
  return new Promise((resolvePromise) => {
    let stdout = '';
    let stderr = '';
    let truncated = false;
    let timedOut = false;
    let settled = false;
    let child;
    const finish = (extra) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolvePromise({ exitCode: null, signal: null, stdout, stderr, timedOut, spawnError: null, durationMs: Date.now() - started, truncated, ...extra });
    };
    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill('SIGKILL'); } catch { /* already gone */ }
    }, timeoutMs);
    try {
      child = spawn(file, args, {
        cwd,
        env,
        shell,
        windowsHide: true,
        stdio: inherit ? ['inherit', 'inherit', 'inherit'] : [stdin === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
      });
    } catch (e) {
      finish({ spawnError: `${e.code || 'spawn failed'}: ${e.message}` });
      return;
    }
    const collect = (which) => (chunk) => {
      const text = chunk.toString('utf8');
      const room = MAX_CAPTURE - (which === 'out' ? stdout.length : stderr.length);
      if (text.length > room) truncated = true;
      const kept = text.slice(0, Math.max(room, 0));
      if (which === 'out') stdout += kept; else stderr += kept;
    };
    if (!inherit) {
      child.stdout.on('data', collect('out'));
      child.stderr.on('data', collect('err'));
      if (stdin !== undefined) {
        child.stdin.on('error', () => { /* the program closed its input early */ });
        child.stdin.end(stdin);
      }
    }
    child.on('error', (e) => finish({ spawnError: `${e.code || 'error'}: ${e.message}` }));
    child.on('close', (code, signal) => finish({ exitCode: code, signal }));
  });
}
