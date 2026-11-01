/**
 * Unit: the retry rules of src/utils/transient-fs.js - which errors are retried on which platform, how long it
 * waits, when it gives up, and what the final error says. (The product-entry proof is
 * tests/e2e/init-survives-transient-file-lock.test.js; this file pins the rules at the level where the
 * platform and the clock can be injected, so the Windows-only rules are checked on any system.)
 */

import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, chmodSync, rmSync, existsSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { isTransientFsError, retryTransientFs, probeWritePermission, RETRY_POLICY } from '../../../src/utils/transient-fs.js';

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

  it('does not retry EPERM off Windows: one try, then a permission-denied message that keeps the original error (XSPEC-516 R2)', () => {
    const clock = fakeClock();
    const original = fsError('EPERM', 'EPERM: operation not permitted');
    const { calls, operation } = flaky(original, 'always');
    let thrown;
    try { retryTransientFs(operation, info, { platform: 'darwin', ...clock }); } catch (e) { thrown = e; }
    expect(calls.n).toBe(1);
    expect(clock.waits).toEqual([]);
    expect(thrown.message).toContain('permission denied');
    expect(thrown.message).toContain('target/file.yaml');
    expect(thrown.message).toContain('EPERM: operation not permitted');
    expect(thrown.code).toBe('EPERM');
    expect(thrown.cause).toBe(original);
    expect(thrown.permissionDenied).toBe(true);
    expect(thrown.message).not.toMatch(/antivirus|locked by another program/i);
    expect(thrown.message, 'it does not claim that trying again is useless').not.toMatch(/will not help/i);
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

describe('EPERM / EACCES that keep failing on Windows: lock or permission? (XSPEC-516 R2)', () => {
  const info = { path: 'project/.standards/error-codes.ai.yaml', source: 'repo/ai/standards/error-codes.ai.yaml', action: 'copy to' };

  it('a real permission problem gets a permission message: what to check, no antivirus advice, no "locked"', () => {
    for (const code of ['EPERM', 'EACCES']) {
      const clock = fakeClock();
      const { calls, operation } = flaky(fsError(code, `${code}: operation not permitted, copyfile 'a' -> 'b'`), 'always');
      const probe = () => ({ denied: true, reason: '"project/.standards/error-codes.ai.yaml" is read-only or not writable by this account' });
      let thrown;
      try { retryTransientFs(operation, info, { platform: 'win32', ...clock, probe }); } catch (e) { thrown = e; }
      expect(calls.n, code).toBe(10); // it did retry first: Windows cannot tell from the code alone
      expect(thrown.message, code).toContain('permission denied');
      expect(thrown.message, code).toContain('read-only');
      expect(thrown.message, code).toMatch(/Check:/);
      expect(thrown.message, code).toContain('UDS tried 10 times');
      expect(thrown.message, code).toContain(`${code}: operation not permitted, copyfile 'a' -> 'b'`);
      expect(thrown.message, code).not.toMatch(/antivirus|locked by another program|OneDrive|will not help/i);
      expect(thrown.message, code).toContain('looks like a permission problem rather than a temporary file lock');
      expect(thrown.code).toBe(code);
      expect(thrown.permissionDenied).toBe(true);
      expect(thrown.transientRetryExhausted).toBeUndefined();
    }
  });

  it('when the file system finds nothing wrong with permissions, the message is still the lock message', () => {
    const clock = fakeClock();
    const { operation } = flaky(fsError('EPERM'), 'always');
    let thrown;
    try { retryTransientFs(operation, info, { platform: 'win32', ...clock, probe: () => ({ denied: false }) }); } catch (e) { thrown = e; }
    expect(thrown.message).toContain('locked by another program');
    expect(thrown.message).toMatch(/antivirus/i);
    expect(thrown.transientRetryExhausted).toBe(true);
    expect(thrown.permissionDenied).toBeUndefined();
  });

  it('EBUSY is a lock whatever the probe says (it is never asked)', () => {
    const clock = fakeClock();
    const { operation } = flaky(fsError('EBUSY'), 'always');
    let asked = false;
    let thrown;
    try { retryTransientFs(operation, info, { platform: 'win32', ...clock, probe: () => { asked = true; return { denied: true }; } }); } catch (e) { thrown = e; }
    expect(asked).toBe(false);
    expect(thrown.message).toContain('locked by another program');
  });
});

describe('probeWritePermission: it tries the write, it does not ask fs.access', () => {
  const root = () => mkdtempSync(join(tmpdir(), 'uds-probe-'));
  // chmod does not stop root, and a read-only attribute is the only thing Windows honours: skip as root.
  const asRoot = typeof process.getuid === 'function' && process.getuid() === 0;
  const denied = (code) => Object.assign(new Error(`${code}: denied`), { code });

  it.skipIf(asRoot)('a read-only destination is denied and the reason names it', () => {
    const dir = root();
    try {
      const target = join(dir, 'ro.yaml');
      writeFileSync(target, 'x');
      chmodSync(target, 0o444);
      const verdict = probeWritePermission({ path: target });
      expect(verdict.denied).toBe(true);
      expect(verdict.reason).toContain(target);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('a writable destination is not denied (a lock is not a permission problem)', () => {
    const dir = root();
    try {
      const target = join(dir, 'rw.yaml');
      writeFileSync(target, 'x');
      expect(probeWritePermission({ path: target })).toEqual({ denied: false });
      expect(readdirSync(dir)).toEqual(['rw.yaml']);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('a missing destination in a writable folder is not denied, and no scratch file is left behind', () => {
    const dir = root();
    try {
      expect(probeWritePermission({ path: join(dir, 'new.yaml') })).toEqual({ denied: false });
      expect(readdirSync(dir), 'the scratch file was removed').toEqual([]);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it.skipIf(asRoot || process.platform === 'win32')('a folder that cannot be written to denies a missing destination (really tried, nothing left behind)', () => {
    const dir = root();
    try {
      chmodSync(dir, 0o555);
      const verdict = probeWritePermission({ path: join(dir, 'new.yaml') });
      expect(verdict.denied).toBe(true);
      expect(verdict.reason).toContain('cannot be created in the folder');
      chmodSync(dir, 0o755);
      expect(readdirSync(dir)).toEqual([]);
    } finally { chmodSync(dir, 0o755); rmSync(dir, { recursive: true, force: true }); }
  });

  it('a folder whose ACL refuses the new file is denied even though a W_OK check would say yes (Windows reports it as EPERM)', () => {
    const dir = root();
    try {
      // The real fs.access says the folder is writable (it is, to this account); the create is what is refused.
      const ops = { openSync: (file, flags) => { if (flags === 'wx') throw denied('EPERM'); return 99; }, closeSync: () => {}, unlinkSync: () => {} };
      const verdict = probeWritePermission({ path: join(dir, 'new.yaml') }, ops);
      expect(verdict.denied).toBe(true);
      expect(verdict.reason).toContain('EPERM');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('an unreadable source is denied, by opening it', () => {
    const dir = root();
    try {
      const ops = { openSync: (file, flags) => { if (flags === 'r') throw denied('EACCES'); return 99; }, closeSync: () => {}, unlinkSync: () => {} };
      const verdict = probeWritePermission({ path: join(dir, 'new.yaml'), source: join(dir, 'src.yaml') }, ops);
      expect(verdict.denied).toBe(true);
      expect(verdict.reason).toContain('cannot be opened for reading');
      // A source that is merely busy or missing is not a permission verdict.
      const busy = { ...ops, openSync: (file, flags) => { if (flags === 'r') throw denied('EBUSY'); return 99; } };
      expect(probeWritePermission({ path: join(dir, 'new.yaml'), source: join(dir, 'src.yaml') }, busy).denied).toBe(false);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('the scratch file is removed even when closing it fails', () => {
    const dir = root();
    try {
      const unlinked = [];
      const ops = {
        openSync: () => 77,
        closeSync: () => { throw new Error('close failed'); },
        unlinkSync: (file) => unlinked.push(file)
      };
      expect(probeWritePermission({ path: join(dir, 'new.yaml') }, ops)).toEqual({ denied: false });
      expect(unlinked).toHaveLength(1);
      expect(unlinked[0]).toContain('.uds-permission-probe-');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('a failed create leaves nothing to remove (unlink is not called for a file that was never made)', () => {
    const dir = root();
    try {
      const unlinked = [];
      const ops = { openSync: () => { throw denied('EACCES'); }, closeSync: () => {}, unlinkSync: (f) => unlinked.push(f) };
      expect(probeWritePermission({ path: join(dir, 'new.yaml') }, ops).denied).toBe(true);
      expect(unlinked).toEqual([]);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});
