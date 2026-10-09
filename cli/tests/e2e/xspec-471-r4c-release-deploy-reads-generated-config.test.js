/**
 * E2E: `uds release deploy <env>` accepts the environments UDS itself writes into release-config.yaml
 * (dev-platform XSPEC-471 R4).
 *
 * `uds init` and `uds config` write `release.environments` as objects (`- name: staging`, `type: testing`, ...). The deploy
 * check compared the environment the user typed with those objects as if they were plain names, so in a project set up by
 * UDS every environment was "unknown" and the message listed `[object Object], [object Object]`. The unit tests of the
 * deployment helpers never read a config UDS wrote.
 *
 * The configuration in these tests is produced by the same function `uds init` / `uds config` call (`generateReleaseConfig`),
 * not typed by hand, so a change of its shape is tested too. Every test runs the real CLI and reads `deployments.yaml` back.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/release.js   const allowedEnvironments = configuredEnvironmentNames(deployConfig) || DEFAULT_ENVIRONMENTS;
 */

import { it, expect, afterAll } from 'vitest';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { generateReleaseConfig } from '../../src/utils/release-config.js';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec471-r4c-release');
afterAll(() => h.cleanup());

function project(releaseConfig) {
  const dir = h.makeDir('release');
  mkdirSync(join(dir, '.standards'), { recursive: true });
  writeFileSync(join(dir, '.standards', 'release-config.yaml'), yaml.dump(releaseConfig));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'acme', version: '1.2.0-rc.1' }));
  return dir;
}
const deployments = (dir) => yaml.load(readFileSync(join(dir, 'deployments.yaml'), 'utf-8')).deployments;

it('uds release deploy staging works in a project whose release-config.yaml UDS generated (environments are objects)', async () => {
  const dir = project(generateReleaseConfig('manual'));
  const run = await h.runCli(['release', 'deploy', 'staging'], dir);
  expect(run.stdout, run.stderr).toContain('已記錄部署: 1.2.0-rc.1 → staging');
  expect(run.stdout).not.toContain('未知的部署環境');
  expect(run.stdout).not.toContain('[object Object]');
  const rows = deployments(dir);
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ version: '1.2.0-rc.1', environment: 'staging' });
});

it('uds release deploy still refuses an environment the generated configuration does not declare, and names the allowed ones', async () => {
  const dir = project(generateReleaseConfig('manual'));
  const run = await h.runCli(['release', 'deploy', 'qa'], dir);
  expect(run.stdout).toContain('未知的部署環境: qa');
  expect(run.stdout).toContain('允許的環境: staging, production');
  expect(run.stdout).not.toContain('[object Object]');
  expect(existsSync(join(dir, 'deployments.yaml'))).toBe(false);
});

it('uds release deploy still reads environments written as plain names', async () => {
  const config = generateReleaseConfig('manual');
  config.release.environments = ['canary'];
  const dir = project(config);
  const run = await h.runCli(['release', 'deploy', 'canary'], dir);
  expect(run.stdout, run.stderr).toContain('已記錄部署: 1.2.0-rc.1 → canary');
  expect(deployments(dir)[0].environment).toBe('canary');
});
