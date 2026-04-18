/**
 * E2E: UDS self-adoption guard on `update` / `check` / `init`.
 *
 * Simulates the UDS source-repo signals in a temp dir by creating the
 * `.uds-source-repo` marker plus a matching `uds-manifest.json`, then
 * spawns `node cli/bin/uds.js <command>` and asserts:
 *   - Without `--force`: non-zero exit, refuse message on stderr/stdout.
 *   - With `--force`: warning printed, command proceeds past the guard.
 *
 * Covers DEC-044 / XSPEC-071 Requirement 1 scenarios 1-1, 1-3, 1-4.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_PATH = join(__dirname, '../../bin/uds.js');

function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
}

function runCli(args, cwd, timeoutMs = 15000) {
  return new Promise((resolve) => {
    const proc = spawn('node', [CLI_PATH, ...args], {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0', HOME: tmpdir() }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({
        stdout: stripAnsi(stdout),
        stderr: stripAnsi(stderr),
        exitCode: -1,
        timedOut: true
      });
    }, timeoutMs);

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout: stripAnsi(stdout),
        stderr: stripAnsi(stderr),
        exitCode: code,
        timedOut: false
      });
    });
  });
}

async function makeFakeUdsSourceRepo() {
  const dir = await mkdtemp(join(tmpdir(), 'uds-self-adoption-e2e-'));
  // Strong signal: manifest with project name.
  await writeFile(
    join(dir, 'uds-manifest.json'),
    JSON.stringify({ project: 'Universal Development Standards', version: '5.1.0-test' })
  );
  // Explicit marker.
  await writeFile(join(dir, '.uds-source-repo'), '# test marker\n');
  return dir;
}

async function cleanup(dir) {
  if (dir) {
    await rm(dir, { recursive: true, force: true });
  }
}

describe('E2E: UDS self-adoption guard', () => {
  let fakeRepo;

  beforeEach(async () => {
    fakeRepo = await makeFakeUdsSourceRepo();
  });

  afterEach(async () => {
    await cleanup(fakeRepo);
    fakeRepo = null;
  });

  it('`uds update` refuses with non-zero exit in UDS source repo', async () => {
    const result = await runCli(['update', '--yes'], fakeRepo);
    expect(result.timedOut).toBe(false);
    expect(result.exitCode).not.toBe(0);
    const combined = result.stdout + result.stderr;
    expect(combined).toContain('DEC-044');
    expect(combined).toContain('uds update');
  });

  it('`uds check` refuses with non-zero exit in UDS source repo', async () => {
    const result = await runCli(['check'], fakeRepo);
    expect(result.timedOut).toBe(false);
    expect(result.exitCode).not.toBe(0);
    const combined = result.stdout + result.stderr;
    expect(combined).toContain('DEC-044');
    expect(combined).toContain('uds check');
  });

  it('`uds init` refuses with non-zero exit in UDS source repo', async () => {
    const result = await runCli(['init', '--yes'], fakeRepo);
    expect(result.timedOut).toBe(false);
    expect(result.exitCode).not.toBe(0);
    const combined = result.stdout + result.stderr;
    expect(combined).toContain('DEC-044');
    expect(combined).toContain('uds init');
  });

  it('`uds update --force` prints warning and proceeds past the guard', async () => {
    // We don't need update to succeed end-to-end (it will fail on manifest
    // parsing / missing .standards/ inside the temp repo) — we only need
    // to observe that the guard was bypassed and execution moved on.
    const result = await runCli(['update', '--yes', '--force'], fakeRepo);
    expect(result.timedOut).toBe(false);
    const combined = result.stdout + result.stderr;
    expect(combined).toContain('--force');
    expect(combined).toContain('UDS source repo detected');
  });

  it('`uds update` in a generic adopter project dir does NOT trigger the guard', async () => {
    const genericDir = await mkdtemp(join(tmpdir(), 'uds-generic-e2e-'));
    try {
      await writeFile(join(genericDir, 'package.json'), JSON.stringify({ name: 'my-app' }));
      const result = await runCli(['update', '--yes'], genericDir);
      // Should not exit with the self-adoption refuse message. It may
      // exit non-zero for other reasons (e.g. "not initialized") which is
      // fine — we just assert the guard-specific message is absent.
      const combined = result.stdout + result.stderr;
      expect(combined).not.toContain('Detected UDS source repo');
    } finally {
      await cleanup(genericDir);
    }
  });
});
