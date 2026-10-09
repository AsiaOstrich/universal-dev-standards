/**
 * E2E: `uds release promote <version>` says what it does: it prints the next steps and creates nothing
 * (dev-platform XSPEC-471 R4, the user's decision of 2026-10-09).
 *
 * It printed "✓ 晉升紀錄建立" and "✓ Git tag: v1.2.0" while it wrote no record and created no tag, so a person who
 * trusted the screen would deploy a version that was never tagged. The words are now honest and no behaviour was added:
 * the command still writes nothing and still creates no tag.
 *
 * Every test runs the real CLI in a real git repository and reads back what is on disk: the file list, and
 * `git tag --list`. The repository has a commit, so a `git tag` run by the command would succeed and show in that list.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/commands/release.js   console.log(chalk.yellow('這個指令不會建立晉升紀錄，也不會建立 Git tag；它只列出下一步要執行的事。'));
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdirSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { generateReleaseConfig } from '../../src/utils/release-config.js';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec471-ud-promote');
afterAll(() => h.cleanup());

const git = (dir, ...args) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { cwd: dir, encoding: 'utf-8' });

function releaseProject() {
  const dir = h.makeDir('promote');
  mkdirSync(join(dir, '.standards'), { recursive: true });
  writeFileSync(join(dir, '.standards', 'release-config.yaml'), yaml.dump(generateReleaseConfig('manual')));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'acme', version: '1.2.0-rc.1' }));
  expect(git(dir, 'init', '-q').status).toBe(0);
  expect(git(dir, 'add', '-A').status).toBe(0);
  expect(git(dir, 'commit', '-q', '-m', 'init').status).toBe(0);
  return dir;
}
const tree = (dir) => readdirSync(dir, { recursive: true }).filter((p) => !String(p).split(/[\\/]/).includes('.git')).map(String).sort();

it('uds release promote says it creates no record and no tag, and lists the commands to run', async () => {
  const dir = releaseProject();
  const run = await h.runCli(['release', 'promote', '1.2.0'], dir);
  expect(run.code, run.stderr).toBe(0);
  expect(run.stdout).toContain('目前版本: 1.2.0-rc.1');
  expect(run.stdout).toContain('晉升目標: 1.2.0');
  expect(run.stdout).toContain('這個指令不會建立晉升紀錄，也不會建立 Git tag');
  expect(run.stdout).toContain('下一步（由你執行）');
  expect(run.stdout).toContain('git tag v1.2.0');
});

it('uds release promote prints no success mark for a record or a tag it did not create', async () => {
  const dir = releaseProject();
  const run = await h.runCli(['release', 'promote', '1.2.0'], dir);
  expect(run.stdout).not.toContain('✓');
  expect(run.stdout).not.toContain('晉升紀錄建立');
  expect(run.stdout).not.toContain('Git tag: v1.2.0');
});

it('uds release promote creates no git tag and writes no file', async () => {
  const dir = releaseProject();
  const filesBefore = tree(dir);
  const run = await h.runCli(['release', 'promote', '1.2.0'], dir);
  expect(run.code, run.stderr).toBe(0);
  const tags = git(dir, 'tag', '--list');
  expect(tags.status, tags.stderr).toBe(0);
  expect(tags.stdout.trim()).toBe('');
  expect(tree(dir)).toEqual(filesBefore);
});
