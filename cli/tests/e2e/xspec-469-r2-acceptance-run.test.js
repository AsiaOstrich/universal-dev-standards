/**
 * E2E: the beta acceptance program installs a package, runs the steps and writes a report
 * (dev-platform XSPEC-469 R2).
 *
 * `node scripts/beta-acceptance/run.mjs` is the entry; every test starts it as a person would, in a child process,
 * and reads back the exit code and the report files it wrote. The package under test is a fake one that
 * stands in for the registry (an `--installer` module, or `--source` on a folder with real npm in offline mode),
 * so no test touches the network.
 *
 * Wire that makes these red when cut (one line of source):
 *   scripts/beta-acceptance/run.mjs   results = await runSteps({ steps: doc.steps, sandbox, binPath: install.binPath, pkgDir: install.pkgDir, shimPath: install.shimPath || null, platform, answers, ask, timeoutMs: opts.timeout * 1000, log, only: opts.only });
 * (without it no step runs, and the "all steps pass" test reads back zero results).
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { copyProgram, otherPlatform, runAcceptance, scratch, strings, weaken, writeFakePackage, writeInstaller, writeSteps } from '../utils/xspec-469.js';
import { detectShell, readCodePage, UNKNOWN } from '../../../scripts/beta-acceptance/lib/env-info.mjs';
import { resolveNpm } from '../../../scripts/beta-acceptance/lib/install.mjs';

const tmp = scratch('uds-xspec469-r2-');
afterAll(() => tmp.cleanup());

const installer = (version = '1.2.3') => writeInstaller(tmp.next('installer.mjs'), version);

/** Two steps that the fake uds satisfies. */
const PASSING = [
  { id: 'prints-version', title: 'prints its version', uds: ['--version'], expect: { contains: ['1.2.3'] } },
  { id: 'echoes', title: 'echoes text', uds: ['echo', 'hello acceptance'], expect: { contains: ['hello acceptance'] } },
];

it('a run where every step passes exits 0, reports verdict pass with the counts, and the Markdown and JSON reports agree (XSPEC-469 R2)', () => {
  const steps = writeSteps(tmp.next('steps.json'), PASSING);
  const outDir = tmp.next('out');
  const r = runAcceptance(['--installer', installer(), '--steps', steps, '--version', '1.2.3', '--label', 'test-machine', '--non-interactive'], { outDir });
  expect(r.code, r.out).toBe(0);

  const [report] = r.reports();
  expect(report, 'a report was written').toBeTruthy();
  const j = report.json;
  expect(j.verdict).toBe('pass');
  expect(j.exitCode).toBe(0);
  expect(j.counts).toMatchObject({ planned: 2, executed: 2, passed: 2, failed: 0, skipped: 0, humanUnconfirmed: 0 });
  expect(j.steps.map((s) => [s.id, s.status])).toEqual([['prints-version', 'pass'], ['echoes', 'pass']]);
  expect(j.uds).toMatchObject({ version: '1.2.3', installKind: 'injected-installer' });
  // the output of each step was read back into the report, not just its status
  expect(j.steps[1].output).toContain('hello acceptance');
  expect(j.label).toBe('test-machine');

  // the Markdown says the same thing
  expect(report.md).toContain('Result | 結果：PASS');
  expect(report.md).toContain('passed 2; failed 0');
  expect(report.md).toContain('`echoes`');
  expect(r.stdout).toContain(`report (send this file back | 請把這個檔案貼回來): ${join(outDir, report.file.replace(/\.json$/, '.md'))}`);
});

it('a run where one step fails exits 1, names the step and what did not hold in both reports, and still reports the other step as passed (XSPEC-469 R2)', () => {
  const steps = writeSteps(tmp.next('steps.json'), [
    PASSING[0],
    { id: 'wrong-text', title: 'expects text the command does not print', uds: ['echo', 'goodbye'], expect: { contains: ['hello'] } },
    { id: 'wrong-exit', title: 'expects exit 0 from a command that exits 3', uds: ['exit', '3'], expect: { contains: ['exiting'] } },
  ]);
  const outDir = tmp.next('out');
  const r = runAcceptance(['--installer', installer(), '--steps', steps, '--non-interactive'], { outDir });
  expect(r.code, r.out).toBe(1);

  const [report] = r.reports();
  expect(report.json.verdict).toBe('fail');
  expect(report.json.counts).toMatchObject({ passed: 1, failed: 2 });
  const byId = Object.fromEntries(report.json.steps.map((s) => [s.id, s]));
  expect(byId['prints-version'].status).toBe('pass');
  expect(byId['wrong-text'].status).toBe('fail');
  expect(byId['wrong-text'].failures).toEqual(['output does not contain "hello"']);
  expect(byId['wrong-exit'].failures).toEqual(['exit code 3, expected 0']);
  expect(byId['wrong-exit'].exitCode).toBe(3);

  expect(report.md).toContain('Result | 結果：FAIL');
  expect(report.md).toContain('### wrong-text');
  expect(report.md).toContain('output does not contain "hello"');
  expect(r.stdout).toContain('FAIL wrong-exit: exit code 3, expected 0');
});

it('a run where no step runs never reports a pass: steps for another platform only, an empty list, or an --only that selects nothing each exit 3 with verdict no-steps (XSPEC-469 R2)', () => {
  const cases = {
    'every step is for another platform': { steps: writeSteps(tmp.next('steps.json'), PASSING.map((s) => ({ ...s, platform: otherPlatform() }))), extra: [] },
    'the list is empty': { steps: writeSteps(tmp.next('steps.json'), []), extra: [] },
    '--only selects no step': { steps: writeSteps(tmp.next('steps.json'), PASSING), extra: ['--only', 'there-is-no-such-step'] },
  };
  for (const [what, c] of Object.entries(cases)) {
    const outDir = tmp.next('out');
    const r = runAcceptance(['--installer', installer(), '--steps', c.steps, '--non-interactive', ...c.extra], { outDir });
    expect(r.code, `${what}: ${r.out}`).toBe(3);
    const [report] = r.reports();
    expect(report.json.verdict, what).toBe('no-steps');
    expect(report.json.counts.passed, what).toBe(0);
    expect(report.md, what).toContain('NOTHING WAS TESTED');
    expect(report.md, what).not.toMatch(/Result \| 結果：PASS/);
    expect(r.stdout, what).not.toMatch(/\[beta-acceptance\] PASS/);
  }
});

it('a run that cannot install the package, or installs another version than the one asked for, exits 2 with verdict error and runs no step (XSPEC-469 R2)', () => {
  const steps = writeSteps(tmp.next('steps.json'), PASSING);

  const broken = tmp.next('broken-installer.mjs');
  writeFileSync(broken, "export async function install() { throw new Error('registry unreachable'); }\n");
  const a = runAcceptance(['--installer', broken, '--steps', steps, '--non-interactive'], { outDir: tmp.next('out') });
  expect(a.code, a.out).toBe(2);
  const [ra] = a.reports();
  expect(ra.json.verdict).toBe('error');
  expect(ra.json.error).toContain('registry unreachable');
  expect(ra.json.steps).toEqual([]);

  // the installer lays out 1.2.3; the person asked for 9.9.9
  const b = runAcceptance(['--installer', installer('1.2.3'), '--steps', steps, '--version', '9.9.9', '--non-interactive'], { outDir: tmp.next('out') });
  expect(b.code, b.out).toBe(2);
  expect(b.reports()[0].json.error).toBe('asked for 9.9.9 but 1.2.3 is installed');
  expect(b.reports()[0].json.steps).toEqual([]);

  // a version that is not a version is refused before it reaches npm
  const c = runAcceptance(['--version', 'x; rm -rf /', '--steps', steps, '--non-interactive'], { outDir: tmp.next('out') });
  expect(c.code, c.out).toBe(2);
  expect(c.reports()[0].json.error).toContain('is not a version or dist-tag');
});

it('a steps file that checks nothing but an exit code, or has two steps with one id, is refused with exit 2 and the problem named (XSPEC-469 R2)', () => {
  const weak = writeSteps(tmp.next('steps.json'), [{ id: 'exit-only', title: 'checks only the exit code', uds: ['--version'], expect: { exit: 0 } }]);
  const a = runAcceptance(['--installer', installer(), '--steps', weak, '--non-interactive'], { outDir: tmp.next('out') });
  expect(a.code, a.out).toBe(2);
  expect(a.stderr).toContain('steps[0] (exit-only): only an exit code is checked');

  const twice = writeSteps(tmp.next('steps.json'), [PASSING[0], PASSING[0]]);
  const b = runAcceptance(['--installer', installer(), '--steps', twice, '--non-interactive'], { outDir: tmp.next('out') });
  expect(b.code, b.out).toBe(2);
  expect(b.stderr).toContain('duplicate id');
});

it('the report records OS, shell, Node, UDS version and the Windows code page, and no field is empty: what could not be read says so (XSPEC-469 R2)', () => {
  const steps = writeSteps(tmp.next('steps.json'), PASSING);
  const r = runAcceptance(['--installer', installer(), '--steps', steps, '--non-interactive'], { outDir: tmp.next('out') });
  expect(r.code, r.out).toBe(0);
  const j = r.reports()[0].json;
  const e = j.environment;

  expect(['windows', 'macos', 'linux']).toContain(e.platform);
  expect(e.node.version).toBe(process.version);
  expect(e.os.release.length).toBeGreaterThan(0);
  expect(e.shell.value.length).toBeGreaterThan(0);
  expect(e.shell.evidence.length).toBeGreaterThan(0);
  expect(j.uds.version).toBe('1.2.3');
  // the code page: a number on Windows, an explicit "not applicable" elsewhere; never blank
  if (process.platform === 'win32') expect(e.windowsCodePage.value).toMatch(/^\d{3,5}$|^取不到$/);
  else expect(e.windowsCodePage.value).toBe('不適用（非 Windows）');

  const blank = [...strings(j)].filter(([path, value]) => value.trim() === '' && !/\.(output|stdout|stderr)$/.test(path) && !/\.output$/.test(path) && !path.includes('.install.'));
  expect(blank, 'no environment, version or step field is an empty string').toEqual([]);
});

it('the code page, the shell and npm are worked out by pure rules: a Windows chcp answer is read, a failed chcp says 取不到, a started-through-npm parent says nothing about the shell, and Windows starts npm as node npm-cli.js without a .cmd (XSPEC-469 R2)', async () => {
  // chcp, English and Traditional Chinese Windows
  const chcp = (stdout, exitCode = 0) => async () => ({ stdout, stderr: '', exitCode, spawnError: null });
  expect(await readCodePage({ nodePlatform: 'win32', env: {}, run: chcp('Active code page: 950\r\n') })).toMatchObject({ value: '950', source: 'chcp' });
  expect(await readCodePage({ nodePlatform: 'win32', env: {}, run: chcp('使用中的字碼頁: 65001\r\n') })).toMatchObject({ value: '65001' });
  const broken = await readCodePage({ nodePlatform: 'win32', env: {}, run: chcp('', 1) });
  expect(broken.value).toBe(UNKNOWN);
  expect(broken.source).toContain('chcp printed no number');
  expect((await readCodePage({ nodePlatform: 'win32', env: {}, run: async () => { throw new Error('no cmd'); } })).value).toBe(UNKNOWN);
  expect((await readCodePage({ nodePlatform: 'linux', env: {} })).value).toBe('不適用（非 Windows）');

  // shell: declared beats everything; Git Bash by MSYSTEM; cmd and PowerShell by parent; npm as parent says nothing
  expect(detectShell({ declared: 'PowerShell 7', nodePlatform: 'win32', env: { MSYSTEM: 'MINGW64' }, parentName: 'cmd.exe' })).toEqual({ value: 'PowerShell 7', evidence: 'declared with --shell' });
  expect(detectShell({ nodePlatform: 'win32', env: { MSYSTEM: 'MINGW64' }, parentName: 'bash.exe' }).value).toContain('Git Bash');
  expect(detectShell({ nodePlatform: 'win32', env: {}, parentName: 'cmd.exe' }).value).toBe('cmd.exe');
  expect(detectShell({ nodePlatform: 'win32', env: {}, parentName: 'powershell.exe' }).value).toBe('Windows PowerShell');
  expect(detectShell({ nodePlatform: 'win32', env: {}, parentName: 'pwsh.exe' }).value).toBe('PowerShell 7 (pwsh)');
  const viaNpm = detectShell({ nodePlatform: 'win32', env: { ComSpec: 'C:\\Windows\\System32\\cmd.exe' }, parentName: 'node.exe' });
  expect(viaNpm.evidence).toBe('ComSpec variable only');
  expect(viaNpm.value).toContain('the shell you typed in is unknown');
  expect(detectShell({ nodePlatform: 'linux', env: {}, parentName: null })).toMatchObject({ value: UNKNOWN });
  expect(detectShell({ nodePlatform: 'linux', env: { SHELL: '/bin/zsh' }, parentName: null }).value).toBe('zsh');

  // npm: on Windows, node.exe's neighbour npm-cli.js is started by node itself; only when it is missing does it fall back to npm.cmd through a shell
  const win = resolveNpm({ nodePlatform: 'win32', execPath: 'C:\\Program Files\\nodejs\\node.exe', env: {}, exists: (p) => p === 'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js' });
  expect(win).toMatchObject({ file: 'C:\\Program Files\\nodejs\\node.exe', shell: false, how: 'npm-cli.js next to node' });
  expect(win.prefixArgs).toEqual(['C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js']);
  const noCli = resolveNpm({ nodePlatform: 'win32', execPath: 'C:\\x\\node.exe', env: {}, exists: () => false });
  expect(noCli).toMatchObject({ file: 'npm.cmd', shell: true });
  const posix = resolveNpm({ nodePlatform: 'linux', execPath: '/usr/local/bin/node', env: {}, exists: () => false });
  expect(posix).toMatchObject({ file: 'npm', shell: false });
  const fromNpm = resolveNpm({ nodePlatform: 'linux', execPath: '/usr/bin/node', env: { npm_execpath: '/opt/npm/bin/npm-cli.js' }, exists: (p) => p === '/opt/npm/bin/npm-cli.js' });
  expect(fromNpm).toMatchObject({ file: '/usr/bin/node', how: 'npm_execpath' });
});

it('every step runs in its own folder with its own throwaway home: the command sees a HOME that is not the real one, and a file it writes is read back from that folder (XSPEC-469 R2)', () => {
  const steps = writeSteps(tmp.next('steps.json'), [
    // The home is <sandbox>/home/<step id>: a regular expression on the tail of the path, because the real home folder can
    // be a prefix of the sandbox's own path (a temp folder inside the user profile on Windows).
    { id: 'home-is-not-real', title: 'HOME is a throwaway folder', uds: ['env', 'HOME'], expect: { matches: ['uds-beta-acceptance-[^\\\\/]+[\\\\/]home[\\\\/]home-is-not-real\\s*$'] } },
    { id: 'userprofile-too', title: 'USERPROFILE is a throwaway folder', uds: ['env', 'USERPROFILE'], expect: { matches: ['uds-beta-acceptance-[^\\\\/]+[\\\\/]home[\\\\/]userprofile-too\\s*$'] } },
    { id: 'writes-a-file', title: 'the file the command wrote is there', uds: ['write', 'out.txt', 'written by the step'], expect: { contains: ['wrote out.txt'], files: [{ path: 'out.txt', contains: ['written by the step'] }] } },
    { id: 'does-not-see-it', title: 'another step does not see that file', uds: ['echo', 'x'], expect: { contains: ['x'], files: [{ path: 'out.txt', exists: false }] } },
  ]);
  const r = runAcceptance(['--installer', installer(), '--steps', steps, '--non-interactive'], { outDir: tmp.next('out') });
  expect(r.code, r.out).toBe(0);
  expect(r.reports()[0].json.counts.passed).toBe(4);
  // the sandbox is removed afterwards
  const sandboxLine = /working in (.+)/.exec(r.stdout);
  expect(sandboxLine, r.stdout).toBeTruthy();
  expect(existsSync(sandboxLine[1].trim()), 'the throwaway folder is gone').toBe(false);
});

it('the prepare operations of a step do what they say, and one that points outside the step folder fails the step instead of writing there (XSPEC-469 R2)', () => {
  const manifest = JSON.stringify({ upstream: { version: '1' }, skills: { names: ['a'] }, standards: ['ai/standards/foo.ai.yaml', 'ai/standards/bar.ai.yaml'], fileHashes: { '.standards/foo.ai.yaml': {}, '.standards/bar.ai.yaml': {} } });
  const steps = writeSteps(tmp.next('steps.json'), [
    {
      id: 'ops', title: 'the operations are applied in order', run: ['git', 'status', '--porcelain'],
      prepare: [
        { writeFile: '.standards/manifest.json', content: manifest },
        { writeFile: '.standards/foo.ai.yaml', content: 'x' },
        { forgetStandard: 'foo' },
        { setManifest: { 'upstream.version': '2' } },
        { manifestPush: { 'skills.names': ['b'] } },
        { gitInit: true },
        { writeFile: 'src/app.js', content: 'module.exports = 1;\n' },
        { git: ['add', 'src/app.js'] },
        { mkdir: 'empty-folder' },
        { writeFile: 'tool.sh', content: '#!/bin/sh\n', executable: true },
        { removeFile: 'tool.sh' },
      ],
      expect: {
        exit: 0,
        contains: ['A  src/app.js'],
        files: [
          { path: '.standards/manifest.json', contains: ['"version": "2"', '"b"', 'bar.ai.yaml'], notContains: ['foo.ai.yaml'] },
          { path: '.standards/foo.ai.yaml', exists: false },
          { path: 'empty-folder', exists: true },
          { path: 'tool.sh', exists: false },
        ],
      },
    },
    { id: 'escapes', title: 'a path that leaves the folder', run: ['git', '--version'], prepare: [{ writeFile: '../escaped.txt', content: 'no' }], expect: { exit: 0, contains: ['git version'] } },
    { id: 'forgets-what-is-not-there', title: 'forgetting a standard the manifest does not list', run: ['git', '--version'], prepare: [{ writeFile: '.standards/manifest.json', content: manifest }, { forgetStandard: 'nope' }], expect: { exit: 0, contains: ['git version'] } },
  ]);
  const r = runAcceptance(['--installer', installer(), '--steps', steps, '--non-interactive'], { outDir: tmp.next('out') });
  expect(r.code, r.out).toBe(1);
  const byId = Object.fromEntries(r.reports()[0].json.steps.map((x) => [x.id, x]));
  expect(byId.ops.failures, byId.ops.output).toEqual([]);
  expect(byId.ops.status).toBe('pass');
  expect(byId.escapes.status).toBe('fail');
  expect(byId.escapes.failures[0]).toContain('path leaves its folder');
  expect(byId['forgets-what-is-not-there'].failures[0]).toContain('the manifest does not list "nope"');
});

it('the program installs the package through real npm from a folder (offline) and starts both the bin file and the uds command npm put on the path, on this OS (XSPEC-469 R2)', () => {
  const pkg = writeFakePackage(tmp.next('fake-package'), '2.0.0-test.1');
  const steps = writeSteps(tmp.next('steps.json'), [
    { id: 'bin-file', title: 'node runs the bin file', uds: ['--version'], expect: { contains: ['2.0.0-test.1'] } },
    { id: 'command-on-path', title: 'the uds command on the path runs', shim: ['--version'], expect: { contains: ['2.0.0-test.1'] } },
    { id: 'package-was-installed-by-npm', title: 'node_modules holds the package', inspect: true, expect: { files: [{ path: '{pkg}/package.json', contains: ['"universal-dev-standards"'] }] } },
  ]);
  const r = runAcceptance(['--source', pkg, '--steps', steps, '--version', '2.0.0-test.1', '--non-interactive'], { outDir: tmp.next('out'), timeout: 240000 });
  expect(r.code, r.out).toBe(0);
  const j = r.reports()[0].json;
  expect(j.uds).toMatchObject({ version: '2.0.0-test.1', installKind: 'local-source' });
  expect(j.counts).toMatchObject({ passed: 3, failed: 0, skipped: 0 });
  expect(j.environment.npm.version, 'npm answered --version').toMatch(/^\d+\.\d+\.\d+/);
  // a report from a run that did not ask the registry says so, in the notes and in the Markdown
  expect(j.notes.join(' ')).toContain('NOT installed from the npm registry');
  expect(r.reports()[0].md).toContain('**not** a published package');
});

it('--local-bin runs a uds.js as it is, says in the report that this is not a published package, and skips the steps that need a uds command on the path (XSPEC-469 R2)', () => {
  const pkg = writeFakePackage(tmp.next('local-package'), '3.1.4');
  const steps = writeSteps(tmp.next('steps.json'), [
    { id: 'bin-file', title: 'node runs the bin file', uds: ['--version'], expect: { contains: ['3.1.4'] } },
    { id: 'command-on-path', title: 'the uds command on the path runs', shim: ['--version'], expect: { contains: ['3.1.4'] } },
  ]);
  const r = runAcceptance(['--local-bin', join(pkg, 'bin', 'uds.js'), '--steps', steps, '--non-interactive'], { outDir: tmp.next('out') });
  expect(r.code, r.out).toBe(0);
  const j = r.reports()[0].json;
  expect(j.uds.installKind).toBe('local-bin');
  expect(j.steps.map((s) => s.status)).toEqual(['pass', 'skip']);
  expect(j.steps[1].reason).toContain('not installed through npm');
  expect(j.notes.join(' ')).toContain('NOT installed from the npm registry');
});

it('a bad option is refused with exit 2 before anything is installed, and --help describes the exit codes (XSPEC-469 R2)', () => {
  const a = runAcceptance(['--no-such-option']);
  expect(a.code, a.out).toBe(2);
  expect(a.stderr).toContain('unknown option: --no-such-option');
  const b = runAcceptance(['--timeout', 'soon']);
  expect(b.code).toBe(2);
  expect(b.stderr).toContain('--timeout must be a positive number of seconds');
  const c = runAcceptance(['--source', 'a', '--local-bin', 'b']);
  expect(c.code).toBe(2);
  expect(c.stderr).toContain('are alternatives');
  const help = runAcceptance(['--help']);
  expect(help.code).toBe(0);
  expect(help.stdout).toContain('zero steps passed');
});

it('weakening the program turns these tests red: a run that treats zero passed steps as a pass, or a step whose command is never started, is caught (XSPEC-469 R2)', () => {
  // property: with only other-platform steps the program exits 3; with a failing step it exits 1.
  const holds = (root) => {
    const run = join(root, 'run.mjs');
    const none = writeSteps(tmp.next('steps.json'), PASSING.map((s) => ({ ...s, platform: otherPlatform() })));
    const bad = writeSteps(tmp.next('steps.json'), [{ id: 'wrong-text', title: 'wrong', uds: ['echo', 'goodbye'], expect: { contains: ['hello'] } }]);
    const exit = (stepsFile) => {
      const r = runAcceptanceAt(run, ['--installer', installer(), '--steps', stepsFile, '--non-interactive', '--out', tmp.next('out')]);
      return r.status;
    };
    return exit(none) === 3 && exit(bad) === 1;
  };
  const runAcceptanceAt = (run, args) => spawnSync(process.execPath, [run, ...args], { encoding: 'utf-8', cwd: tmp.dir });

  const real = copyProgram(tmp.next('real'));
  expect(holds(real), 'control: the unmodified program satisfies the property').toBe(true);

  const zeroIsPass = copyProgram(tmp.next('zero-is-pass'));
  weaken(join(zeroIsPass, 'lib', 'report.mjs'), 'if (counts.passed + counts.humanConfirmed === 0) return { verdict: \'no-steps\', exitCode: EXIT.NO_STEPS };', '');
  expect(holds(zeroIsPass), 'zero passed steps counted as a pass').toBe(false);

  const neverFails = copyProgram(tmp.next('never-fails'));
  weaken(join(neverFails, 'lib', 'report.mjs'), 'if (counts.failed > 0) return { verdict: \'fail\', exitCode: EXIT.FAIL };', '');
  expect(holds(neverFails), 'a failed step not failing the run').toBe(false);

  const skipsCheck = copyProgram(tmp.next('skips-check'));
  weaken(join(skipsCheck, 'lib', 'execute.mjs'), "if (!text.includes(needle)) failures.push(`output does not contain ${JSON.stringify(needle)}`);", '');
  expect(holds(skipsCheck), 'expected text no longer checked').toBe(false);
});
