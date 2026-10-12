/**
 * E2E: `uds release verify` takes the release mode from the UDS manifest when release-config.yaml is missing, and says
 * where the mode came from when it refuses (dev-platform XSPEC-475 R4).
 *
 * The report (Windows, beta.9): a project's `.standards/manifest.json` recorded `options.release_mode: manual`, but the
 * project had no `.standards/release-config.yaml`. `uds release verify` read only that file, fell back to ci-cd, and
 * refused with "only in manual or hybrid mode" - without saying that it had not found the file, or that the manifest
 * said something else. Now the mode is: release-config.yaml `release.mode` when it names one; else the manifest's
 * `options.release_mode`; else ci-cd. A refusal says which of the three decided and what was missing.
 *
 * Every test runs the real CLI (`uds release manifest`, `uds release verify`) in a throwaway project and reads the
 * exit code, the printed verdict and the printed reason back.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/release.js   const recorded = manifestReleaseMode(projectPath); // wire:release-mode-from-manifest
 */

import { it, expect, afterAll } from 'vitest';
import { createHash } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { generateReleaseConfig } from '../../src/utils/release-config.js';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec475-r4');
afterAll(() => h.cleanup());

const ARTIFACT = 'release artifact 475';
const sha256 = (text) => createHash('sha256').update(text).digest('hex');

/** A project with an artifact, a UDS manifest recording `manifestMode` (null: no manifest) and, optionally, a release-config.yaml. */
function project({ manifestMode = null, configMode = null } = {}) {
  const dir = h.makeDir('r4');
  mkdirSync(join(dir, '.standards'), { recursive: true });
  if (manifestMode) {
    writeFileSync(join(dir, '.standards', 'manifest.json'), JSON.stringify({ version: '3.5.0', options: { release_mode: manifestMode } }));
  }
  if (configMode) {
    writeFileSync(join(dir, '.standards', 'release-config.yaml'), yaml.dump(generateReleaseConfig(configMode)));
  }
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'acme', version: '1.2.0-rc.1' }));
  writeFileSync(join(dir, 'app.bin'), ARTIFACT);
  return dir;
}

it.each(['manual', 'hybrid'])('uds release verify runs in %s mode when the manifest records it and release-config.yaml is missing, and says where the mode came from (XSPEC-475 R4)', async (mode) => {
  const dir = project({ manifestMode: mode });

  // The same project builds its manifest and verifies it: both subcommands are available in the recorded mode.
  const made = await h.runCli(['release', 'manifest', '--checksum', sha256(ARTIFACT)], dir);
  expect(made.code, made.stdout + made.stderr).toBe(0);

  const run = await h.runCli(['release', 'verify', '--artifact', 'app.bin'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout).toContain('Manifest 驗證通過');
  expect(run.stdout, 'the refusal for a mode with no verify is not shown').not.toContain('僅在 manual 或 hybrid 模式下可用');
  expect(run.stdout, 'it says why this mode applies').toContain(`模式 ${mode} 取自 .standards/manifest.json 的 options.release_mode`);
  expect(run.stdout, 'and what was missing').toContain('找不到 .standards/release-config.yaml');
});

it('uds release verify refuses with exit 2 and names the missing release-config.yaml and the manifest\'s mode when that mode is ci-cd (XSPEC-475 R4)', async () => {
  const dir = project({ manifestMode: 'ci-cd' });
  const run = await h.runCli(['release', 'verify'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(2);
  expect(run.stdout).toContain('verify 子命令僅在 manual 或 hybrid 模式下可用');
  expect(run.stdout).toContain('找不到 .standards/release-config.yaml');
  expect(run.stdout).toContain('模式 ci-cd 取自 .standards/manifest.json 的 options.release_mode');
});

it('uds release verify refuses with exit 2 and says it fell back to ci-cd because neither release-config.yaml nor the manifest names a mode (XSPEC-475 R4)', async () => {
  const dir = project();
  const run = await h.runCli(['release', 'verify'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(2);
  expect(run.stdout).toContain('verify 子命令僅在 manual 或 hybrid 模式下可用');
  expect(run.stdout).toContain('找不到 .standards/release-config.yaml');
  expect(run.stdout).toContain('.standards/manifest.json 也沒有記錄 options.release_mode，所以使用預設的 ci-cd');
});

it('uds release verify lets release-config.yaml win over the manifest: a file that says ci-cd refuses even when the manifest says manual (XSPEC-475 R4)', async () => {
  const dir = project({ manifestMode: 'manual', configMode: 'ci-cd' });
  const run = await h.runCli(['release', 'verify'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(2);
  expect(run.stdout).toContain('verify 子命令僅在 manual 或 hybrid 模式下可用');
  expect(run.stdout, 'the mode came from the file, so no fallback is described').not.toContain('取自 .standards/manifest.json');
});

it('uds release verify behaves as before when release-config.yaml says manual: no note about the manifest (XSPEC-475 R4)', async () => {
  const dir = project({ manifestMode: 'ci-cd', configMode: 'manual' });
  const made = await h.runCli(['release', 'manifest', '--checksum', sha256(ARTIFACT)], dir);
  expect(made.code, made.stdout + made.stderr).toBe(0);
  const run = await h.runCli(['release', 'verify', '--artifact', 'app.bin'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout).toContain('Manifest 驗證通過');
  expect(run.stdout).not.toContain('取自 .standards/manifest.json');
});
