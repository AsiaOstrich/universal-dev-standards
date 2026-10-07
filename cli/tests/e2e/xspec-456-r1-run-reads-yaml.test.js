/**
 * E2E: `uds run <intent>` reads uds.project.yaml as YAML (dev-platform XSPEC-456 R1).
 *
 * A Windows tester wrote `test: dotnet test path/to/Tests.csproj  # 90 tests pass`. `uds run test` (and
 * `--dry-run`) took everything after the first colon as the command, so `# 90 tests pass` travelled with it.
 * A POSIX shell hides that (an unquoted `#` starts a comment); `cmd.exe` does not, and MSBuild received the
 * comment as arguments - an error that never pointed at UDS.
 *
 * Every test spawns the real CLI (`node cli/bin/uds.js run ...`) in a throwaway project. The "program" the
 * command runs is a small script that writes the arguments it received to a file, and the test reads that
 * file back - so what is checked is what the command actually got, not what the CLI printed.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/core/project-config.js   doc = yaml.load(raw);
 *
 * Portable by construction: the probe is a `.js` file run with `node`, paths use forward slashes and double
 * quotes (accepted by cmd.exe and POSIX shells alike), no single-quoted shell syntax.
 */

import { it, expect, afterAll } from 'vitest';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec456-r1');
afterAll(() => h.cleanup());

const fwd = (p) => p.replace(/\\/g, '/');

/** A project whose uds.project.yaml has the given `commands:` lines, plus a probe that records its arguments. */
function projectWith(commandLines) {
  const dir = h.makeDir('r1');
  const probe = join(dir, 'probe.js');
  const out = join(dir, 'received.json');
  writeFileSync(probe, "require('fs').writeFileSync(process.argv[2], JSON.stringify(process.argv.slice(3)));\n");
  const lines = commandLines.map((l) => l.replaceAll('<probe>', fwd(probe)).replaceAll('<out>', fwd(out)));
  writeFileSync(join(dir, 'uds.project.yaml'), ['version: "1"', 'commands:', ...lines.map((l) => '  ' + l), ''].join('\n'));
  return { dir, out };
}

const received = (out) => JSON.parse(readFileSync(out, 'utf-8'));

it('uds run test shows and runs the command without the trailing YAML comment: no # reaches the program (XSPEC-456 R1)', async () => {
  const { dir, out } = projectWith(['test: node "<probe>" "<out>" Tests.csproj  # 90 tests pass']);

  // 1. --dry-run shows the command that would run: no comment in it.
  const dry = await h.runCli(['run', 'test', '--dry-run'], dir);
  expect(dry.code, dry.stdout + dry.stderr).toBe(0);
  const shown = dry.stdout.split('\n').find((l) => l.startsWith('$ '));
  expect(shown, dry.stdout).toBeTruthy();
  expect(shown).toContain('Tests.csproj');
  expect(shown, 'the comment is not part of the command').not.toMatch(/#|90 tests pass/);
  expect(existsSync(out), 'a dry run runs nothing').toBe(false);

  // 2. The real run: read back the arguments the program got. (A POSIX shell would hide the comment by
  //    itself here; on Windows cmd.exe this is the arm that sees it. The dry-run arm above sees it everywhere.)
  const run = await h.runCli(['run', 'test'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(received(out)).toEqual(['Tests.csproj']);
});

it('uds run keeps a command whose last character is a closing quote, and a # inside a quoted YAML value (XSPEC-456 R1)', async () => {
  // Two things the old reader got wrong besides the comment: it cut one leading/trailing quote off the whole
  // line (so a command ending in a quoted argument lost its closing quote), and it had no idea which `#` was
  // data. In YAML a `#` after a space ends a plain value, so a command that needs a literal ` #` is written as
  // a quoted YAML string - and then the `#` is kept.
  const { dir, out } = projectWith([
    'build: node "<probe>" "<out>" "two words"',
    `lint: 'node "<probe>" "<out>" "issue #12 fixed"'`
  ]);

  const build = await h.runCli(['run', 'build'], dir);
  expect(build.code, build.stdout + build.stderr).toBe(0);
  expect(received(out)).toEqual(['two words']);

  const lint = await h.runCli(['run', 'lint'], dir);
  expect(lint.code, lint.stdout + lint.stderr).toBe(0);
  expect(received(out)).toEqual(['issue #12 fixed']);
});

it('uds run reads a command written as a quoted YAML string with a comment after it, and the custom: section (XSPEC-456 R1)', async () => {
  const dir = h.makeDir('r1');
  const probe = join(dir, 'probe.js');
  const out = join(dir, 'received.json');
  writeFileSync(probe, "require('fs').writeFileSync(process.argv[2], JSON.stringify(process.argv.slice(3)));\n");
  writeFileSync(join(dir, 'uds.project.yaml'), [
    'version: 1   # unquoted number: still accepted',
    'commands:',
    `  lint: 'node "${fwd(probe)}" "${fwd(out)}" lint-arg'   # single-quoted value, then a comment`,
    'custom:',
    `  smoke: node "${fwd(probe)}" "${fwd(out)}" smoke-arg  # custom intent`,
    ''
  ].join('\n'));

  const lint = await h.runCli(['run', 'lint'], dir);
  expect(lint.code, lint.stdout + lint.stderr).toBe(0);
  expect(received(out)).toEqual(['lint-arg']);

  const smoke = await h.runCli(['run', 'smoke'], dir);
  expect(smoke.code, smoke.stdout + smoke.stderr).toBe(0);
  expect(received(out)).toEqual(['smoke-arg']);
});

it('uds run says which line of uds.project.yaml is not valid YAML and how to write a Windows path, instead of running something else (XSPEC-456 R1)', async () => {
  const dir = h.makeDir('r1');
  const marker = join(dir, 'ran.txt');
  // A double-quoted YAML value reads backslashes as escapes, so a Windows path written that way is not valid.
  writeFileSync(join(dir, 'uds.project.yaml'),
    ['version: "1"', 'commands:', `  test: "node -e \\"require('fs').writeFileSync('${fwd(marker)}','x')\\" C:\\proj\\Tests.csproj"`, ''].join('\n'));

  const run = await h.runCli(['run', 'test'], dir);
  expect(run.code, run.stdout + run.stderr).toBe(1);
  expect(run.stderr + run.stdout).toMatch(/uds\.project\.yaml/);
  expect(run.stderr + run.stdout).toMatch(/not valid YAML \(line 3\)/);
  expect(run.stderr + run.stdout).toMatch(/single quotes or without quotes/);
  expect(existsSync(marker), 'nothing was run').toBe(false);
});
