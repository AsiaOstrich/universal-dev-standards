/**
 * setupHuskyHook — making the pre-commit hook executable must not shell out.
 *
 * Adopter report, Windows 11, 6.14.0-beta.2: `uds init --with-hooks` printed
 * `'chmod' is not recognized as an internal or external command`. The old code
 * was `try { execSync(`chmod +x ${path}`) } catch {}` — the catch swallowed the
 * exception, but `execSync` inherits the child's stderr by default, so cmd.exe's
 * complaint went straight to the user's terminal before the exception was thrown.
 * The try/catch made the failure invisible to the code and loud to the human.
 *
 * The test cannot run Windows on macOS/Linux, so it asserts the cause instead of
 * the symptom: no shell is spawned to run `chmod`, on any platform, and on
 * Windows the mode change is skipped entirely (POSIX exec bits do not exist there).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, statSync, chmodSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';

vi.mock('chalk', () => ({
  default: { bold: (s) => s, gray: (s) => s, green: (s) => s, yellow: (s) => s, red: (s) => s, cyan: (s) => s }
}));

// Wrap, do not replace: every other shell-out (git config, ...) must keep working,
// otherwise the assertions below would pass because the function crashed early.
vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, execSync: vi.fn(actual.execSync) };
});
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, chmodSync: vi.fn(actual.chmodSync) };
});

const { setupHuskyHook } = await import('../../src/commands/init.js');

let dir;

function makeNodeProject() {
  mkdirSync(join(dir, '.git'), { recursive: true });
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'fixture', version: '1.0.0', devDependencies: { husky: '^9.1.7' } }, null, 2) + '\n'
  );
}

const shellCommands = () => execSync.mock.calls.map((c) => String(c[0]));

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'uds-chmod-'));
  execSync.mockClear();
  chmodSync.mockClear();
});
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe('setupHuskyHook — pre-commit executable bit', () => {
  it('never spawns a shell to run chmod', async () => {
    makeNodeProject();

    await setupHuskyHook(dir, { allowInTest: true });

    expect(existsSync(join(dir, '.husky', 'pre-commit'))).toBe(true);
    // The Windows failure: `chmod` is not a cmd.exe command. Nothing may ask a shell for it.
    expect(shellCommands().filter((c) => /\bchmod\b/.test(c))).toEqual([]);
  });

  it('still makes the hook executable on POSIX, through fs.chmodSync', async () => {
    makeNodeProject();

    await setupHuskyHook(dir, { allowInTest: true, platform: 'linux' });

    const hook = join(dir, '.husky', 'pre-commit');
    expect(chmodSync).toHaveBeenCalledWith(hook, 0o755);
    if (process.platform !== 'win32') {
      expect(statSync(hook).mode & 0o111).not.toBe(0);
    }
  });

  it('skips the mode change on Windows (no exec bit there) and still writes the hook', async () => {
    makeNodeProject();

    await setupHuskyHook(dir, { allowInTest: true, platform: 'win32' });

    expect(existsSync(join(dir, '.husky', 'pre-commit'))).toBe(true);
    expect(chmodSync).not.toHaveBeenCalled();
    expect(shellCommands().filter((c) => /\bchmod\b/.test(c))).toEqual([]);
  });

  it('does not fail the init when chmodSync throws', async () => {
    makeNodeProject();
    chmodSync.mockImplementationOnce(() => { throw new Error('EPERM: operation not permitted'); });

    await expect(setupHuskyHook(dir, { allowInTest: true, platform: 'linux' })).resolves.not.toThrow();
    expect(existsSync(join(dir, '.husky', 'pre-commit'))).toBe(true);
  });
});
