/**
 * E2E: choosing the Manual or Hybrid release mode no longer crashes `uds init` and `uds config`
 * (dev-platform XSPEC-482 R1, found by the beta.12 macOS retest, finding N1).
 *
 * The problem: js-yaml 5 has no default export, and two dynamic imports still read `(await import('js-yaml')).default`
 * (cli/src/commands/init.js and cli/src/commands/config.js). The interactive `uds init` that chose Manual or Hybrid
 * printed "Installation failed and was rolled back: Cannot read properties of undefined (reading 'dump')", and
 * `uds config --type release_mode` choosing Manual threw a TypeError after the manifest already said "manual" -
 * a half state with no release-config.yaml.
 *
 * Every test spawns the real CLI in a throwaway project and types the answers a person would type (the harness
 * answers when the CLI has been quiet, i.e. is waiting for a key), then reads files and exit codes back.
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/commands/init.js     const yaml = await import('js-yaml'); // wire:init-release-config-yaml
 *   cli/src/commands/config.js   const yaml = await import('js-yaml'); // js-yaml 5 ... // wire:config-release-config-yaml
 * Mutation done by hand (not a cut line), seen red: the release-config.yaml block of config.js moved back below
 * `writeManifest` - the half-state test goes red.
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';
import { createHarness, REAL_CLI_DIR } from '../utils/staged-cli-harness.js';
import { DOWN, ENTER, readManifest, out, typist } from '../utils/xspec-482.js';

const h = createHarness('xspec482-r1');
afterAll(() => h.cleanup());

const RELEASE_CONFIG = (dir) => join(dir, '.standards', 'release-config.yaml');

async function interactiveInit(downs) {
  const dir = h.makeDir('proj');
  mkdirSync(join(dir, '.claude'), { recursive: true });
  const run = await h.runCli(['init'], dir, { drive: typist({ 'Select release mode': DOWN.repeat(downs) + ENTER }), idleMs: 900 });
  return { dir, run };
}

it('interactive uds init choosing the Manual release mode installs and writes release-config.yaml with mode manual (XSPEC-482 R1)', async () => {
  const { dir, run } = await interactiveInit(1);
  expect(run.code, out(run)).toBe(0);
  expect(out(run)).not.toMatch(/rolled back|Cannot read properties/);
  // Read back: the file the mode needs is there and says manual; the manifest agrees; the install finished.
  expect(existsSync(RELEASE_CONFIG(dir)), out(run)).toBe(true);
  expect(yaml.load(readFileSync(RELEASE_CONFIG(dir), 'utf-8')).release.mode).toBe('manual');
  expect(readManifest(dir).options.release_mode).toBe('manual');
  expect(existsSync(join(dir, 'CLAUDE.md'))).toBe(true);
}, 180000);

it('interactive uds init choosing the Hybrid release mode installs and writes release-config.yaml with mode hybrid (XSPEC-482 R1)', async () => {
  const { dir, run } = await interactiveInit(2);
  expect(run.code, out(run)).toBe(0);
  expect(out(run)).not.toMatch(/rolled back|Cannot read properties/);
  expect(existsSync(RELEASE_CONFIG(dir)), out(run)).toBe(true);
  expect(yaml.load(readFileSync(RELEASE_CONFIG(dir), 'utf-8')).release.mode).toBe('hybrid');
  expect(readManifest(dir).options.release_mode).toBe('hybrid');
}, 180000);

it('interactive uds init keeping the default CI/CD release mode writes no release-config.yaml (control for the two tests above)', async () => {
  const { dir, run } = await interactiveInit(0);
  expect(run.code, out(run)).toBe(0);
  expect(readManifest(dir).options.release_mode).toBe('ci-cd');
  expect(existsSync(RELEASE_CONFIG(dir))).toBe(false);
}, 180000);

it('uds config --type release_mode choosing Manual succeeds, writes release-config.yaml and records manual (XSPEC-482 R1)', async () => {
  const dir = await h.newProject();
  expect(readManifest(dir).options.release_mode, 'fixture: starts at the default').toBe('ci-cd');
  expect(existsSync(RELEASE_CONFIG(dir)), 'fixture: no release-config.yaml yet').toBe(false);

  const run = await h.runCli(['config', '--type', 'release_mode'], dir, { drive: typist({ 'Select release mode': DOWN + ENTER }), idleMs: 900 });
  expect(run.code, out(run)).toBe(0);
  expect(out(run)).not.toMatch(/TypeError|Cannot read properties/);
  expect(yaml.load(readFileSync(RELEASE_CONFIG(dir), 'utf-8')).release.mode).toBe('manual');
  expect(readManifest(dir).options.release_mode).toBe('manual');

  // And back: choosing CI/CD removes the file again.
  const back = await h.runCli(['config', '--type', 'release_mode'], dir, { drive: typist({ 'Select release mode': ENTER }), idleMs: 900 });
  expect(back.code, out(back)).toBe(0);
  expect(existsSync(RELEASE_CONFIG(dir))).toBe(false);
  expect(readManifest(dir).options.release_mode).toBe('ci-cd');
}, 180000);

it('uds config --type release_mode that cannot write release-config.yaml exits 1 and leaves the manifest as it was, not half changed (XSPEC-482 R1)', async () => {
  const dir = await h.newProject();
  // A directory where the file must go: the write fails for a reason that has nothing to do with js-yaml.
  mkdirSync(RELEASE_CONFIG(dir), { recursive: true });
  const before = readFileSync(join(dir, '.standards', 'manifest.json'), 'utf-8');

  const run = await h.runCli(['config', '--type', 'release_mode'], dir, { drive: typist({ 'Select release mode': DOWN + ENTER }), idleMs: 900 });
  expect(run.code, out(run)).toBe(1);
  expect(out(run)).toContain('release-config.yaml');
  expect(out(run)).toContain('manifest left as it was');
  // Read back: the manifest still says what it said, byte for byte.
  expect(readFileSync(join(dir, '.standards', 'manifest.json'), 'utf-8')).toBe(before);
  expect(readManifest(dir).options.release_mode).toBe('ci-cd');
}, 180000);

it('no source file of the CLI reads the default export of js-yaml, which js-yaml 5 does not have (XSPEC-482 R1)', () => {
  const files = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(js|mjs|cjs)$/.test(name)) files.push(p);
    }
  };
  walk(join(REAL_CLI_DIR, 'src'));
  const reading = (text) => /\(\s*await\s+import\(\s*['"]js-yaml['"]\s*\)\s*\)\s*\.default|import\s+\w+\s+from\s+['"]js-yaml['"]|require\(\s*['"]js-yaml['"]\s*\)\s*\.default/.test(text);
  // Control: the pattern recognises the old spellings, so "none found" below is not a pattern that cannot match.
  expect(reading("const yaml = (await import('js-yaml')).default;")).toBe(true);
  expect(reading("import yaml from 'js-yaml';")).toBe(true);
  expect(reading("import * as yaml from 'js-yaml';")).toBe(false);
  expect(files.length).toBeGreaterThan(50);
  const offenders = files.filter((f) => reading(readFileSync(f, 'utf-8')));
  expect(offenders).toEqual([]);
});
