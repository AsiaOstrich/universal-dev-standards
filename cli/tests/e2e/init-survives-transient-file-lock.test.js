/**
 * E2E: `uds init` survives a short-lived file lock and, when the lock does not clear, fails in plain words.
 *
 * Why this exists: on a Windows CI runner `uds init --locale zh-cn` failed now and then with
 * `EBUSY: resource busy or locked, copyfile ...` - antivirus real-time scanning (or the indexer) holds a file
 * for a moment, one `copyFileSync` throws, and the whole install was rolled back. A real Windows user hits the
 * same thing. The installer now retries a copy a bounded number of times (cli/src/utils/transient-fs.js).
 *
 * This runs on any system: a preload (`--require`) wraps `fs.copyFileSync` in the STAGED CLI and throws
 * the error a locked file gives, for one named file, a chosen number of times. Nothing here needs Windows.
 * The fault is injected below the product (in `fs`), so the product's own retry code is what is measured.
 *
 * What is read back, per scenario: the exit code, the files that landed (byte for byte against the repo's
 * original), the manifest, the number of times the locked copy was tried (the injector counts them), and what
 * the user is told.
 *
 * The wires that make it red when cut: cli/src/utils/copier.js  `copyFileSyncRetrying(source, targetFile);`
 * (the copy of a standard) and `copyFileSyncRetrying(packagedSource, targetFile);` (the copy of an extension /
 * locale pack). Mutations done by hand, each seen red:
 *   - copyStandard calling the plain `copyFileSync` instead (no retry): the "survives" test goes red;
 *   - `isTransientFsError` returning true for no code: same;
 *   - `isTransientFsError` retrying EPERM on every platform: the "not retried off Windows" test goes red;
 *   - taking the attempt limit out of `retryTransientFs`: the "bounded" test goes red (it would never end).
 *
 * Every `it` is self-contained: it makes its own project and its own run, so it also passes when selected alone.
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHarness, REAL_REPO, stripAnsi } from '../utils/staged-cli-harness.js';

const harness = createHarness('transient-lock');
afterAll(() => harness.cleanup());

// A standard that `uds init` copies through copyStandard. Its basename is the only thing the injector looks at.
const LOCKED_FILE = 'error-codes.ai.yaml';
const ORIGINAL = join(REAL_REPO, 'ai', 'standards', LOCKED_FILE);

/** Preload (CommonJS) that makes `fs.copyFileSync` fail like a locked file, for one destination basename. */
const FAULT_PRELOAD = `
const fs = require('fs');
const path = require('path');
const real = fs.copyFileSync;
fs.copyFileSync = function (src, dest, ...rest) {
  const spec = JSON.parse(process.env.UDS_TEST_FS_FAULT || 'null');
  if (spec && path.basename(String(dest)) === spec.basename) {
    const log = process.env.UDS_TEST_FS_FAULT_LOG;
    const tries = fs.existsSync(log) ? fs.readFileSync(log, 'utf-8').split('\\n').filter(Boolean).length : 0;
    fs.appendFileSync(log, 'try ' + (tries + 1) + '\\n');
    if (spec.failTimes === 'always' || tries < spec.failTimes) {
      const err = new Error(spec.code + ': resource busy or locked, copyfile ' + JSON.stringify(String(src)) + ' -> ' + JSON.stringify(String(dest)));
      err.code = spec.code;
      err.syscall = 'copyfile';
      throw err;
    }
  }
  return real.call(this, src, dest, ...rest);
};
`;

/** Run a fresh `uds init` in a new project with the lock fault described by `fault` (or none). */
async function initWithFault(fault, { locale = null, basename = LOCKED_FILE } = {}) {
  const dir = harness.makeDir('lock');
  const preload = join(dir, 'fault-preload.cjs');
  writeFileSync(preload, FAULT_PRELOAD);
  const project = join(dir, 'project');
  // `.claude/` is Claude Code's detector marker: without it `uds init` takes the legacy path.
  mkdirSync(join(project, '.claude'), { recursive: true });
  const faultLog = join(dir, 'fault.log');
  const env = fault
    ? { UDS_TEST_FS_FAULT: JSON.stringify({ basename, ...fault }), UDS_TEST_FS_FAULT_LOG: faultLog }
    : { UDS_TEST_FS_FAULT: JSON.stringify({ basename, code: 'EBUSY', failTimes: 0 }), UDS_TEST_FS_FAULT_LOG: faultLog };
  const started = Date.now();
  const run = await harness.runCli(['init', '--yes', '--skills-location', 'project', ...(locale ? ['--locale', locale] : [])], project, { env, preloads: [preload] });
  const elapsedMs = Date.now() - started;
  const tries = existsSync(faultLog) ? readFileSync(faultLog, 'utf-8').split('\n').filter(Boolean).length : 0;
  const text = stripAnsi(run.stdout + '\n' + run.stderr);
  return { run, project, tries, elapsedMs, text };
}

it('uds init copies a standard after two EBUSY errors on that file and installs it intact (a short file lock does not roll the install back)', async () => {
  const { run, project, tries, text } = await initWithFault({ code: 'EBUSY', failTimes: 2 });

  expect(run.code, text).toBe(0);
  expect(text).not.toMatch(/rolled back/i);
  // Two copies failed, the third went through: the locked copy was tried exactly three times.
  expect(tries).toBe(3);
  // Read back: the file really landed and is the repo's original, byte for byte; the manifest was written.
  const installed = join(project, '.standards', LOCKED_FILE);
  expect(existsSync(installed)).toBe(true);
  expect(readFileSync(installed, 'utf-8')).toBe(readFileSync(ORIGINAL, 'utf-8'));
  const manifest = JSON.parse(readFileSync(join(project, '.standards', 'manifest.json'), 'utf-8'));
  expect(manifest.standards).toContain(`ai/standards/${LOCKED_FILE}`);
}, 180000);

it('uds init --locale zh-cn installs the locale pack after two EBUSY errors on it (the extension copy retries too)', async () => {
  const { run, project, tries, text } = await initWithFault({ code: 'EBUSY', failTimes: 2 }, { locale: 'zh-cn', basename: 'zh-cn.md' });

  expect(run.code, text).toBe(0);
  expect(text).not.toMatch(/rolled back/i);
  expect(tries).toBe(3);
  expect(readFileSync(join(project, '.standards', 'zh-cn.md'), 'utf-8'))
    .toBe(readFileSync(join(REAL_REPO, 'extensions', 'locales', 'zh-cn.md'), 'utf-8'));
}, 180000);

it('uds init without any lock copies each standard once (control: the injector alone changes nothing)', async () => {
  const { run, project, tries, text } = await initWithFault(null);

  expect(run.code, text).toBe(0);
  expect(tries).toBe(1); // the injector saw the file and let it through - it is armed, and the product copies it once
  expect(readFileSync(join(project, '.standards', LOCKED_FILE), 'utf-8')).toBe(readFileSync(ORIGINAL, 'utf-8'));
}, 180000);

it('uds init stops after a bounded number of tries when a file stays locked, rolls back, and names the file and the likely cause', async () => {
  const { run, project, tries, elapsedMs, text } = await initWithFault({ code: 'EBUSY', failTimes: 'always' });

  expect(run.code).not.toBe(0);
  expect(text).toMatch(/rolled back/i);
  // Bounded: it retried (more than one try) and then gave up with at most ten. The exact count is the policy's and is
  // pinned with a fake clock in tests/unit/utils/transient-fs.test.js; here a slow machine whose time ceiling comes
  // first must not turn this red. What the message says it tried must be what the injector counted.
  expect(tries).toBeGreaterThanOrEqual(2);
  expect(tries).toBeLessThanOrEqual(10);
  expect(text).toContain(`UDS tried ${tries} times`);
  expect(elapsedMs).toBeLessThan(120000);
  // The user is told which file, why, and what to do - not only the bare error code.
  expect(text).toContain(LOCKED_FILE);
  expect(text).toMatch(/locked by another program/);
  expect(text).toMatch(/antivirus/i);
  expect(text).toMatch(/run the command again/);
  expect(text).toContain('EBUSY');
  // Rolled back for real: nothing of the failed install is left, and no manifest claims it.
  expect(existsSync(join(project, '.standards', LOCKED_FILE))).toBe(false);
  expect(existsSync(join(project, '.standards', 'manifest.json'))).toBe(false);
}, 180000);

it.skipIf(process.platform === 'win32')('uds init does not retry EPERM off Windows, where it is a real permission error (one try, then the plain failure)', async () => {
  const { run, project, tries, text } = await initWithFault({ code: 'EPERM', failTimes: 'always' });

  expect(run.code).not.toBe(0);
  expect(text).toMatch(/rolled back/i);
  expect(tries).toBe(1);
  expect(text).toContain('EPERM');
  expect(text).not.toMatch(/locked by another program/);
  expect(existsSync(join(project, '.standards', 'manifest.json'))).toBe(false);
}, 180000);
