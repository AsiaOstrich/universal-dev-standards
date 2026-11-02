/**
 * Run a node program (the real CLI, or a small script that uses one of its modules) with its stdout going into a reader that goes away early: by default `head -n 1`, which ends after the first line (board #81).
 *
 * This is the EPIPE case of `flushAndExit`: the process still has output to hand over, the reader has closed the pipe,
 * and the process must still end with its own exit code, with no stack trace on stderr. `head` ends as soon as it has
 * read a line, so a report larger than one pipe (64 KB) is still being written when the pipe closes. `true` closes it without reading.
 *
 * The exit code is written by the shell to a file of its own (`$?` of the CLI, not of `head`), and stderr goes to a
 * file too, so neither depends on the pipe that was closed. POSIX shell and `head` only: a test that uses this says
 * `ctx.skip(onWindows, ...)`; no Windows machine ran it.
 */

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { isolatedEnv } from '../../../scripts/lib/isolated-home.mjs';

/**
 * @param {{ makeDir: Function }} harness - from `createHarness`
 * @param {string} cwd - the folder the program runs in
 * @param {string[]} argv - what follows `node`: the script and its words, e.g. `[harness.cliPath(), '--ui-lang', 'en', 'audit', '--effects']`
 * @param {string} [reader] - the shell command that reads the pipe: `head -n 1` (default) goes away after a line; `true` goes away without reading a byte
 * @returns {Promise<{ code: number|null, stderr: string, firstLine: string }>} `code` is null when the shell never wrote it
 */
export function runWithEarlyClosingReader(harness, cwd, argv, reader = 'head -n 1') {
  return new Promise((done) => {
    const dir = harness.makeDir('early-closing-reader');
    const files = { out: join(dir, 'first-line.txt'), err: join(dir, 'stderr.txt'), code: join(dir, 'exit-code.txt') };
    const env = {
      ...isolatedEnv(harness.makeDir('early-home'), process.env),
      FORCE_COLOR: '0', NO_COLOR: '1', UDS_NO_UPDATE_CHECK: '1',
      OUT_FILE: files.out, ERR_FILE: files.err, CODE_FILE: files.code
    };
    const script = `{ "$0" "$@" 2>"$ERR_FILE"; echo "$?" >"$CODE_FILE"; } | ${reader} >"$OUT_FILE"`;
    const proc = spawn('sh', ['-c', script, process.execPath, ...argv], { cwd, env, stdio: 'ignore' });
    const timer = setTimeout(() => proc.kill('SIGTERM'), 120000);
    proc.on('close', () => {
      clearTimeout(timer);
      const read = (file) => (existsSync(file) ? readFileSync(file, 'utf-8') : '');
      const code = read(files.code).trim();
      done({ code: code === '' ? null : Number(code), stderr: read(files.err), firstLine: read(files.out) });
    });
  });
}
