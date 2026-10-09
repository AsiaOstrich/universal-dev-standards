/**
 * E2E: `uds release verify` ends with a non-zero code when verification fails or cannot be done
 * (dev-platform XSPEC-471 R4, the user's decision of 2026-10-09).
 *
 * The command printed "Manifest 驗證失敗" and still ended with 0, so a script or a CI step that gates a release on it
 * read every failure as a pass. Exit codes, same split as `uds hitl check`:
 *   0  the manifest verified
 *   1  verification FAILED (the commit or the checksum is not what the manifest records)
 *   2  could not verify (no manifest, an unreadable one, an artifact that is not there, or a mode with no verify)
 *
 * Every test runs the real CLI and reads back the exit code, the printed verdict and that the manifest was not touched.
 * The project is built by the CLI itself (`uds release manifest --checksum <hash of the file>`), not typed by hand.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/release.js   if (verifyExit !== 0) process.exitCode = verifyExit; // wire:release-verify-exit
 */

import { it, expect, afterAll } from 'vitest';
import { createHash } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { generateReleaseConfig } from '../../src/utils/release-config.js';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec471-ud-verify');
afterAll(() => h.cleanup());

const ARTIFACT = 'release artifact 4471';
const sha256 = (text) => createHash('sha256').update(text).digest('hex');

/** A project in manual release mode with an artifact; `withConfig: false` leaves the default (ci-cd) mode. */
function project({ withConfig = true } = {}) {
  const dir = h.makeDir('verify');
  if (withConfig) {
    mkdirSync(join(dir, '.standards'), { recursive: true });
    writeFileSync(join(dir, '.standards', 'release-config.yaml'), yaml.dump(generateReleaseConfig('manual')));
  }
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'acme', version: '1.2.0-rc.1' }));
  writeFileSync(join(dir, 'app.bin'), ARTIFACT);
  writeFileSync(join(dir, 'other.bin'), 'some other bytes');
  return dir;
}

/** project() plus the manifest `uds release manifest` writes for app.bin. */
async function projectWithManifest() {
  const dir = project();
  const made = await h.runCli(['release', 'manifest', '--checksum', sha256(ARTIFACT)], dir);
  expect(made.code, made.stdout + made.stderr).toBe(0);
  return dir;
}
const manifestText = (dir) => readFileSync(join(dir, 'build-manifest.json'), 'utf-8');

it('uds release verify ends with 0 when the commit and the artifact checksum match the manifest', async () => {
  const dir = await projectWithManifest();
  const run = await h.runCli(['release', 'verify', '--artifact', 'app.bin'], dir);
  expect(run.stdout).toContain('Manifest 驗證通過');
  expect(run.stdout).not.toContain('Manifest 驗證失敗');
  expect(run.code).toBe(0);
});

it('uds release verify ends with 1 and says so when the artifact is not the one the manifest recorded', async () => {
  const dir = await projectWithManifest();
  const before = manifestText(dir);
  const run = await h.runCli(['release', 'verify', '--artifact', 'other.bin'], dir);
  expect(run.stdout).toContain('Manifest 驗證失敗');
  expect(run.stdout).toContain(`checksum mismatch: manifest records "${sha256(ARTIFACT)}"`);
  expect(run.stdout).not.toContain('Manifest 驗證通過');
  expect(run.code).toBe(1);
  expect(manifestText(dir), 'verify must only read the manifest').toBe(before);
});

it('uds release verify ends with 1 when the manifest records a different commit than the project is at', async () => {
  const dir = await projectWithManifest();
  const manifest = JSON.parse(manifestText(dir));
  manifest.commit = 'deadbee';
  writeFileSync(join(dir, 'build-manifest.json'), JSON.stringify(manifest, null, 2));
  const run = await h.runCli(['release', 'verify'], dir);
  expect(run.stdout).toContain('Manifest 驗證失敗');
  expect(run.stdout).toContain('commit mismatch: manifest has "deadbee"');
  expect(run.code).toBe(1);
});

it('uds release verify still ends with 0 when the manifest records a checksum and no artifact was given (a warning, not a failure)', async () => {
  const dir = await projectWithManifest();
  const run = await h.runCli(['release', 'verify'], dir);
  expect(run.stdout).toContain('Manifest 驗證通過');
  expect(run.stdout).toContain('pass --artifact <path> to verify integrity');
  expect(run.code).toBe(0);
});

it('uds release verify ends with 2, not 0, when there is no manifest to verify', async () => {
  const dir = project();
  const run = await h.runCli(['release', 'verify'], dir);
  expect(run.stdout).toContain('找不到 build-manifest.json');
  expect(run.stdout).not.toContain('Manifest 驗證通過');
  expect(run.code).toBe(2);
});

it('uds release verify ends with 2 when build-manifest.json is not valid JSON', async () => {
  const dir = project();
  writeFileSync(join(dir, 'build-manifest.json'), '{ this is not json');
  const run = await h.runCli(['release', 'verify'], dir);
  expect(run.stdout).toContain('build-manifest.json 格式不正確');
  expect(run.code).toBe(2);
});

it('uds release verify ends with 2 when the artifact named by --artifact is not there', async () => {
  const dir = await projectWithManifest();
  const run = await h.runCli(['release', 'verify', '--artifact', 'missing.bin'], dir);
  expect(run.stdout).toContain('找不到 artifact：missing.bin');
  expect(run.stdout).not.toContain('Manifest 驗證通過');
  expect(run.code).toBe(2);
});

it('uds release verify ends with 2 in a project whose release mode has no verify (nothing was verified)', async () => {
  const dir = project({ withConfig: false });
  const run = await h.runCli(['release', 'verify'], dir);
  expect(run.stdout).toContain('verify 子命令僅在 manual 或 hybrid 模式下可用');
  expect(run.code).toBe(2);
});
