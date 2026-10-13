/**
 * E2E: `uds uninstall` says what it did, leaves no empty tool folder behind, and removes the pre-commit hook an older
 * UDS wrote (dev-platform XSPEC-482 R8, beta.12 findings: Linux N4, macOS N11(d)).
 *
 *   - It printed "folder kept: it still holds files that are not UDS's" for `.gemini/commands/` and
 *     `.opencode/command/` after deleting both. The folder it was told about carries the trailing slash of the path
 *     table (`.gemini/commands/`), the folder it had just emptied does not, so the first comparison was always
 *     "different", the folder went in the middle of the loop, and the later "is it gone?" answered no. The empty
 *     `.gemini/` and `.opencode/` above it were then never looked at.
 *   - A project set up by 6.11.0 has no install record (old releases recorded nothing) and a hook that is
 *     `uds check 2>/dev/null || true`. Uninstall removed the lines it recognised and left a script that still printed
 *     "Pre-commit checks passed" and checked nothing.
 *
 * Every test runs the real CLI in a throwaway project and reads files and printed lines back. The 6.11.0 project is
 * set up by the real published package (installed from npm; the test skips with the reason when the registry is not
 * reachable) and, for a run that needs no network, by its hook file (tests/fixtures/older-uds-hooks/).
 *
 * Wires that make these red when cut (one line of CLI source each):
 *   cli/src/uninstallers/skills-uninstaller.js   const gone = !existsSync(dir); // wire:uninstall-folder-removed-is-reported
 *   cli/src/uninstallers/hook-uninstaller.js     } else if (classifyNativePreCommitHook(content)) { // wire:uninstall-removes-known-native-hook
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync, existsSync, chmodSync } from 'fs';
import { join, resolve } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';
import { out, readManifest, writeManifest, gitEnv, runProgram, installPublishedUds, cleanPublished } from '../utils/xspec-482.js';

const h = createHarness('xspec482-r8');
afterAll(() => { h.cleanup(); cleanPublished(); });
const posix = process.platform !== 'win32';

const FIXTURES = resolve(import.meta.dirname, '../fixtures/older-uds-hooks');
const NATIVE = '.git/hooks/pre-commit';

let envCache = null;
const env = () => (envCache ??= gitEnv(h.makeDir('git-home')));

/** A git project with Gemini CLI and OpenCode detected (GEMINI.md, AGENTS.md), so their skills AND commands are installed. */
async function projectWithCommands() {
  const dir = h.makeDir('cmds');
  runProgram('git', ['init', '-q', '-b', 'main'], dir, env());
  mkdirSync(join(dir, '.claude'), { recursive: true });
  writeFileSync(join(dir, 'GEMINI.md'), '# mine\n');
  writeFileSync(join(dir, 'AGENTS.md'), '# mine\n');
  const init = await h.runCli(['init', '--yes', '--skills-location', 'project'], dir, { env: { VITEST: '' } });
  expect(init.code, out(init)).toBe(0);
  return dir;
}

it('uds uninstall removes the command folders it emptied, says so, and leaves no empty .gemini/ or .opencode/ behind (XSPEC-482 R8)', async () => {
  const dir = await projectWithCommands();
  // Control: the commands really are there, in the folders the report names.
  expect(existsSync(join(dir, '.gemini', 'commands')), 'fixture: gemini commands').toBe(true);
  expect(existsSync(join(dir, '.opencode', 'command')), 'fixture: opencode commands').toBe(true);

  const run = await h.runCli(['uninstall', '--yes'], dir);
  expect(run.code, out(run)).toBe(0);
  // Read back the disk, not the message: nothing of the tools' folders is left.
  expect(existsSync(join(dir, '.gemini')), '.gemini/ is gone').toBe(false);
  expect(existsSync(join(dir, '.opencode')), '.opencode/ is gone').toBe(false);
  expect(existsSync(join(dir, '.claude')), '.claude/ is gone').toBe(false);
  // And the message agrees with the disk.
  expect(out(run)).toMatch(/commands\/gemini-cli \[project\] .*\(\d+ file\(s\) UDS wrote\)/);
  expect(out(run)).toMatch(/commands\/opencode \[project\] .*\(\d+ file\(s\) UDS wrote\)/);
  expect(out(run)).not.toContain('folder kept');
  // The user's own files stay.
  expect(readFileSync(join(dir, 'GEMINI.md'), 'utf-8')).toContain('# mine');
}, 240000);

it('uds uninstall keeps a command folder that holds a file of the user\'s, and the message says it kept it (XSPEC-482 R8, control)', async () => {
  const dir = await projectWithCommands();
  writeFileSync(join(dir, '.opencode', 'command', 'mine.md'), 'my own command\n');

  const run = await h.runCli(['uninstall', '--yes'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(readFileSync(join(dir, '.opencode', 'command', 'mine.md'), 'utf-8')).toBe('my own command\n');
  expect(out(run)).toMatch(/commands\/opencode \[project\] .*folder kept: it still holds files that are not UDS's/);
  // The folder that WAS emptied is reported as removed, not as kept.
  expect(out(run)).toMatch(/commands\/gemini-cli \[project\] [^\n]*\(\d+ file\(s\) UDS wrote\)\n/);
  expect(existsSync(join(dir, '.gemini'))).toBe(false);
}, 240000);

it('uds uninstall removes the always-pass pre-commit hook a 6.11.0 project has (no install record), and nothing else of the hooks folder (XSPEC-482 R8)', async (ctx) => {
  if (!posix) ctx.skip(); // the hook is a shell script
  const dir = h.makeDir('legacy-hook');
  runProgram('git', ['init', '-q', '-b', 'main'], dir, env());
  mkdirSync(join(dir, '.claude'), { recursive: true });
  const init = await h.runCli(['init', '--yes', '--skills-location', 'project'], dir, { env: { VITEST: '' } });
  expect(init.code, out(init)).toBe(0);
  // Make it what 6.11.0 left: that release's hook text, and no record that UDS wrote it.
  const manifest = readManifest(dir);
  expect(manifest.installedArtifacts.files[NATIVE], 'fixture: init recorded the hook').toBeTruthy();
  delete manifest.installedArtifacts.files[NATIVE];
  writeManifest(dir, manifest);
  writeFileSync(join(dir, NATIVE), readFileSync(join(FIXTURES, 'native-6.11.0.pre-commit'), 'utf-8'));
  chmodSync(join(dir, NATIVE), 0o755);
  writeFileSync(join(dir, '.git', 'hooks', 'post-commit'), '#!/bin/sh\necho mine\n'); // another hook of the user's

  const run = await h.runCli(['uninstall', '--yes'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(existsSync(join(dir, NATIVE)), 'the hook is gone, not left as a stub that says "passed"').toBe(false);
  expect(out(run)).toContain('.git/hooks/pre-commit (UDS native hook, file removed');
  expect(readFileSync(join(dir, '.git', 'hooks', 'post-commit'), 'utf-8')).toBe('#!/bin/sh\necho mine\n');
}, 240000);

it('uds uninstall keeps a 6.11.0 hook the user added a step to, takes only the UDS check line out, and says the rest was kept and why (XSPEC-482 R8)', async (ctx) => {
  if (!posix) ctx.skip();
  const dir = h.makeDir('edited-hook');
  runProgram('git', ['init', '-q', '-b', 'main'], dir, env());
  mkdirSync(join(dir, '.claude'), { recursive: true });
  expect((await h.runCli(['init', '--yes', '--skills-location', 'project'], dir, { env: { VITEST: '' } })).code).toBe(0);
  const manifest = readManifest(dir);
  delete manifest.installedArtifacts.files[NATIVE];
  writeManifest(dir, manifest);
  const legacy = readFileSync(join(FIXTURES, 'native-6.11.0.pre-commit'), 'utf-8');
  writeFileSync(join(dir, NATIVE), legacy.replace('echo "Pre-commit checks passed"', 'npm run my-own-step\necho "Pre-commit checks passed"'));
  chmodSync(join(dir, NATIVE), 0o755);

  const run = await h.runCli(['uninstall', '--yes'], dir);
  expect(run.code, out(run)).toBe(0);
  const left = readFileSync(join(dir, NATIVE), 'utf-8');
  expect(left, 'the user\'s step is still there').toContain('npm run my-own-step');
  expect(left, 'the UDS check line is not').not.toContain('uds check 2>/dev/null || true');
  expect(out(run)).toContain('.git/hooks/pre-commit (kept: the rest of the script');
}, 240000);

it('a project the real universal-dev-standards@6.11.0 from npm set up (Claude Code, Gemini CLI, OpenCode): uninstall leaves no hook, no tool folder and no folder-kept line (XSPEC-482 R8)', async (ctx) => {
  if (!posix) ctx.skip();
  const old = installPublishedUds('6.11.0', h.makeDir('npm-home'));
  if (!old.bin) ctx.skip(old.why);

  const dir = h.makeDir('real-6-11');
  runProgram('git', ['init', '-q', '-b', 'main'], dir, env());
  mkdirSync(join(dir, '.claude'), { recursive: true });
  writeFileSync(join(dir, 'GEMINI.md'), '# mine\n');
  writeFileSync(join(dir, 'AGENTS.md'), '# mine\n');
  const init = runProgram(process.execPath, [old.bin, 'init', '--yes', '--skills-location', 'project'], dir, old.env);
  expect(init.code, init.all).toBe(0);
  expect(JSON.parse(readFileSync(join(dir, '.standards', 'manifest.json'), 'utf-8')).version, 'fixture: a manifest 6.11.0 wrote').toBeTruthy();
  expect(existsSync(join(dir, '.gemini', 'commands')), 'fixture: 6.11.0 installed gemini commands').toBe(true);
  expect(existsSync(join(dir, NATIVE)), 'fixture: 6.11.0 wrote the native hook').toBe(true);

  const run = await h.runCli(['uninstall', '--yes'], dir);
  expect(run.code, out(run)).toBe(0);
  expect(existsSync(join(dir, NATIVE)), 'the always-pass hook is gone').toBe(false);
  for (const folder of ['.gemini', '.opencode', '.agents', '.claude']) {
    expect(existsSync(join(dir, folder)), `${folder}/ is gone`).toBe(false);
  }
  expect(out(run)).not.toContain('folder kept');
  expect(existsSync(join(dir, '.standards'))).toBe(false);
  expect(readFileSync(join(dir, 'GEMINI.md'), 'utf-8')).toContain('# mine');
}, 600000);
