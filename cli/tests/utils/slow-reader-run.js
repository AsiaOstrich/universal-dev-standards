/**
 * Run the real CLI with its output going into a real shell pipe whose reader starts late (board #77, #81).
 *
 * Why this and not `child_process` with `stdio: 'pipe'`: that is a socket pair with a different buffer, which did NOT lose
 * output in the test that found this; the anonymous pipe of a shell pipeline did (measured: with `process.exit()` the
 * output stops at exactly 65,536 bytes, the size of one pipe, on macOS). The reader waits `readerDelayMs` before it reads
 * a byte, the way a busy CI machine reads.
 *
 * The exit code is echoed after the CLI ended, on the same pipe: `EXIT=<n>`. POSIX shell only: a test that uses this
 * says `it.skipIf(onWindows)`; no Windows machine ran it.
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { isolatedEnv } from '../../../scripts/lib/isolated-home.mjs';

/**
 * @param {{ makeDir: Function, cliPath: Function }} harness - from `createHarness`
 * @param {string} cwd - the project folder the CLI runs in
 * @param {string[]} args - the words after `uds`, e.g. `['init', '--yes']`
 * @param {number} readerDelayMs
 * @returns {Promise<{ code: number|null, stdout: string }>} `code` is null when the exit marker never arrived
 */
export function runWithSlowReader(harness, cwd, args, readerDelayMs = 1500) {
  return new Promise((done) => {
    const dir = harness.makeDir('slow-reader');
    const reader = join(dir, 'slow-reader.cjs');
    writeFileSync(reader, `setTimeout(() => process.stdin.pipe(process.stdout), ${readerDelayMs});\n`);
    const env = { ...isolatedEnv(harness.makeDir('slow-home'), process.env), FORCE_COLOR: '0', NO_COLOR: '1', UDS_NO_UPDATE_CHECK: '1', READER_JS: reader, READER_NODE: process.execPath };
    const proc = spawn('sh', ['-c', '{ "$0" "$@"; echo "EXIT=$?" >&2; } 2>&1 | "$READER_NODE" "$READER_JS"', process.execPath, harness.cliPath(), '--ui-lang', 'en', ...args], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const chunks = [];
    proc.stdout.on('data', (d) => chunks.push(d));
    proc.stderr.resume();
    const timer = setTimeout(() => proc.kill('SIGTERM'), 120000);
    proc.on('close', () => {
      clearTimeout(timer);
      const stdout = Buffer.concat(chunks).toString('utf-8');
      const exit = /EXIT=(\d+)\s*$/.exec(stdout);
      done({ code: exit ? Number(exit[1]) : null, stdout });
    });
  });
}
