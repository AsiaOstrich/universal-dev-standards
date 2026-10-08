/**
 * Unit: the retry rules of src/utils/transient-fs.js - which errors are retried on which platform, how long it
 * waits, when it gives up, and what the final error says. (The product-entry proof is
 * tests/e2e/init-survives-transient-file-lock.test.js; this file pins the rules at the level where the
 * platform and the clock can be injected, so the Windows-only rules are checked on any system.)
 */

import { describe, it, expect } from 'vitest';
import { isTransientFsError, retryTransientFs, RETRY_POLICY } from '../../../src/utils/transient-fs.js';

const fsError = (code, message = `${code}: something`) => Object.assign(new Error(message), { code });

/** A fake clock: `sleep(ms)` advances `now()` and records the wait. */
function fakeClock() {
  let t = 1000;
  const waits = [];
  return { waits, now: () => t, sleep: (ms) => { waits.push(ms); t += ms; } };
}

/** An operation that throws `error` for the first `failTimes` calls (or always), then returns 'done'. */
function flaky(error, failTimes) {
  const calls = { n: 0 };
  const operation = () => {
    calls.n += 1;
    if (failTimes === 'always' || calls.n <= failTimes) throw error;
    return 'done';
  };
  return { calls, operation };
}

describe('isTransientFsError', () => {
  it('treats EBUSY as transient on every platform', () => {
    for (const platform of ['win32', 'darwin', 'linux']) {
      expect(isTransientFsError(fsError('EBUSY'), platform), platform).toBe(true);
    }
  });

  it('treats EPERM and EACCES as transient on Windows only', () => {
    for (const code of ['EPERM', 'EACCES']) {
      expect(isTransientFsError(fsError(code), 'win32'), `${code} on win32`).toBe(true);
      expect(isTransientFsError(fsError(code), 'darwin'), `${code} on darwin`).toBe(false);
      expect(isTransientFsError(fsError(code), 'linux'), `${code} on linux`).toBe(false);
    }
  });

  it('never retries a file that is not there, a full disk or an error with no code', () => {
    for (const code of ['ENOENT', 'ENOSPC', 'EEXIST', 'EISDIR']) {
      expect(isTransientFsError(fsError(code), 'win32'), code).toBe(false);
    }
    expect(isTransientFsError(new Error('plain'), 'win32')).toBe(false);
    expect(isTransientFsError(null, 'win32')).toBe(false);
    expect(isTransientFsError('EBUSY', 'win32')).toBe(false);
  });
});

describe('retryTransientFs', () => {
  const info = { path: 'target/file.yaml', action: 'write' };

  it('returns the result at once when the first try works (no wait)', () => {
    const clock = fakeClock();
    const { calls, operation } = flaky(fsError('EBUSY'), 0);
    expect(retryTransientFs(operation, info, { platform: 'win32', ...clock })).toBe('done');
    expect(calls.n).toBe(1);
    expect(clock.waits).toEqual([]);
  });

  it('retries a transient error with a growing wait and succeeds on the third try', () => {
    const clock = fakeClock();
    const { calls, operation } = flaky(fsError('EBUSY'), 2);
    expect(retryTransientFs(operation, info, { platform: 'win32', ...clock })).toBe('done');
    expect(calls.n).toBe(3);
    expect(clock.waits).toEqual([50, 100]);
  });

  it('gives up after ten tries when the lock never clears, waiting 50 ms more each time up to a 500 ms step', () => {
    const clock = fakeClock();
    const { calls, operation } = flaky(fsError('EBUSY', 'EBUSY: resource busy or locked, copyfile'), 'always');
    expect(() => retryTransientFs(operation, info, { platform: 'win32', ...clock })).toThrow();
    expect(calls.n).toBe(10);
    expect(clock.waits).toEqual([50, 100, 150, 200, 250, 300, 350, 400, 450]);
  });

  it('stops earlier when the total waiting time would pass its ceiling', () => {
    const clock = fakeClock();
    const policy = { ...RETRY_POLICY, maxTotalMs: 120 };
    const { calls, operation } = flaky(fsError('EBUSY'), 'always');
    expect(() => retryTransientFs(operation, info, { platform: 'win32', ...clock, policy })).toThrow(/locked by another program/);
    // waits 50 (total 50), then 100 would make 150 > 120: the third failure is final.
    expect(clock.waits).toEqual([50]);
    expect(calls.n).toBe(2);
  });

  it('does not retry a permanent error: one try, the original error', () => {
    const clock = fakeClock();
    const original = fsError('ENOENT', 'ENOENT: no such file');
    const { calls, operation } = flaky(original, 'always');
    expect(() => retryTransientFs(operation, info, { platform: 'win32', ...clock })).toThrow(original);
    expect(calls.n).toBe(1);
    expect(clock.waits).toEqual([]);
  });

  it('does not retry EPERM off Windows: one try, the original error', () => {
    const clock = fakeClock();
    const original = fsError('EPERM', 'EPERM: operation not permitted');
    const { calls, operation } = flaky(original, 'always');
    expect(() => retryTransientFs(operation, info, { platform: 'darwin', ...clock })).toThrow(original);
    expect(calls.n).toBe(1);
  });

  it('retries EPERM and EACCES on Windows', () => {
    for (const code of ['EPERM', 'EACCES']) {
      const clock = fakeClock();
      const { calls, operation } = flaky(fsError(code), 1);
      expect(retryTransientFs(operation, info, { platform: 'win32', ...clock }), code).toBe('done');
      expect(calls.n, code).toBe(2);
    }
  });

  it('says in plain words which file was locked, why, and what to do - and keeps the original error', () => {
    const clock = fakeClock();
    const original = fsError('EBUSY', "EBUSY: resource busy or locked, copyfile 'a' -> 'b'");
    const { operation } = flaky(original, 'always');
    let thrown;
    try {
      retryTransientFs(operation, { path: 'project/.standards/error-codes.ai.yaml', action: 'copy to' }, { platform: 'win32', ...clock });
    } catch (e) { thrown = e; }
    expect(thrown).toBeInstanceOf(Error);
    expect(thrown.message).toContain('project/.standards/error-codes.ai.yaml');
    expect(thrown.message).toContain('locked by another program');
    expect(thrown.message).toContain('10 times');
    expect(thrown.message).toMatch(/antivirus/i);
    expect(thrown.message).toContain("EBUSY: resource busy or locked, copyfile 'a' -> 'b'");
    expect(thrown.code).toBe('EBUSY');
    expect(thrown.cause).toBe(original);
    expect(thrown.transientRetryExhausted).toBe(true);
  });
});
