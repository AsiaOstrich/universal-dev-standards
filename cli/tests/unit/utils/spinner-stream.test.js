/**
 * On Windows PowerShell, a successful run looked like a failure.
 *
 * Reported 2026-09-16 (Windows 11, PowerShell 5.1): `- 正在檢查 CLI 更新...`
 * and `- 重新產生整合檔案中...` arrive on stderr, and PowerShell 5.1 wraps any
 * stderr output from a native command in a `NativeCommandError`. Measured on a
 * clean run before the fix: stdout 9 lines, stderr 2 — and both stderr lines
 * came from the spinner, one of which was `✔ 已重新產生 2 個整合檔案`. The
 * success message itself was being delivered on the error channel.
 *
 * ora defaults to stderr, which is right for a spinner that redraws over itself
 * while a pipe consumes stdout. It is wrong here: these lines are progress
 * reporting for a human, they sit between lines the CLI already prints on
 * stdout, and in a non-TTY ora emits each one exactly once.
 *
 * The assertion is on which channel receives the bytes, not on an ora field:
 * `stream` is private in ora 9, and a test that reads an internal would pass on
 * a version that ignored the option.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { createSpinner } from '../../../src/utils/spinner.js';

function captureStreams(run) {
  const seen = { stdout: '', stderr: '' };
  const realOut = process.stdout.write;
  const realErr = process.stderr.write;
  process.stdout.write = (chunk, ...rest) => { seen.stdout += String(chunk); return typeof rest.at(-1) === 'function' ? rest.at(-1)() : true; };
  process.stderr.write = (chunk, ...rest) => { seen.stderr += String(chunk); return typeof rest.at(-1) === 'function' ? rest.at(-1)() : true; };
  try {
    run();
  } finally {
    process.stdout.write = realOut;
    process.stderr.write = realErr;
  }
  return seen;
}

describe('createSpinner', () => {
  afterEach(() => { /* streams restored in captureStreams' finally */ });

  it('sends the progress line to stdout and nothing to stderr', () => {
    const seen = captureStreams(() => {
      createSpinner('checking things').start();
    });

    expect(seen.stdout).toContain('checking things');
    expect(seen.stderr).toBe('');
  });

  it('sends the success line to stdout too — that is the one PowerShell flagged', () => {
    const seen = captureStreams(() => {
      const s = createSpinner('regenerating').start();
      s.succeed('regenerated 2 integration files');
    });

    expect(seen.stdout).toContain('regenerated 2 integration files');
    expect(seen.stderr).toBe('');
  });

  it('accepts an options object like ora does', () => {
    const seen = captureStreams(() => {
      createSpinner({ text: 'with options' }).start();
    });

    expect(seen.stdout).toContain('with options');
    expect(seen.stderr).toBe('');
  });

  it('lets an explicit stream win, so a caller can still choose stderr', () => {
    const seen = captureStreams(() => {
      createSpinner({ text: 'deliberate', stream: process.stderr }).start();
    });

    expect(seen.stderr).toContain('deliberate');
    expect(seen.stdout).toBe('');
  });

  it('control arm: plain ora still goes to stderr, so the test can tell the two apart', async () => {
    const { default: ora } = await import('ora');
    const seen = captureStreams(() => {
      ora('unwrapped').start();
    });

    expect(seen.stderr).toContain('unwrapped');
    expect(seen.stdout).toBe('');
  });
});
