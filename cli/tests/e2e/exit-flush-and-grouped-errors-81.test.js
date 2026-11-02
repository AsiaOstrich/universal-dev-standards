/**
 * E2E: board #81, two follow-ups of the "a failed `uds init` lost the end of its output" fix (board #77, CI run 41331713139).
 *
 *   1. Other commands that print a long list and then call `process.exit()` lost the end of it the same way when their output
 *      goes into a pipe (macOS writes what does not fit asynchronously; `process.exit()` throws the rest away; measured: the
 *      output stops at exactly 65,536 bytes with a slow reader). Two of them can print more than a pipe holds and end with
 *      an exit code that matters: `uds update` (the list of files it could not write, 144 KB measured) and
 *      `uds audit --effects` (one finding per implementation). They now wait for the output to be taken before they end.
 *   2. `uds init` in a folder it cannot write into printed the same 700-byte cause once per standard, 50 and more times. A cause
 *      shared by several files is now printed once, with the number of files and the first three names.
 *
 * Wires that make these red when cut (one line of CLI source each; each cut was applied and seen red, see the report):
 *   cli/src/commands/update.js   await flushAndExit(...)                      // wire:update-flushes-before-exit
 *   cli/src/commands/audit.js    return flushAndExit(exitCode)                // wire:audit-effects-flushes-before-exit
 *   cli/src/commands/init.js     formatGroupedErrors(installErrors, msg)      // wire:init-groups-errors-by-cause
 *   cli/src/utils/flush-and-exit.js  stream.once('error', resolve)            // wire:flush-survives-a-closed-reader (EPIPE): only the last test below goes red
 *
 * Not verified: Windows. Every test that reads through a shell pipe or uses chmod is skipped there; no Windows machine ran this file.
 *
 * Every `it` makes its own project and its own run, so it also passes when selected alone.
 */

import { it, expect, afterAll } from 'vitest';
import { existsSync, mkdirSync, chmodSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { pathToFileURL } from 'url';
import { createHarness } from '../utils/staged-cli-harness.js';
import { runWithSlowReader } from '../utils/slow-reader-run.js';
import { runWithEarlyClosingReader } from '../utils/early-closing-reader-run.js';
import { readManifest, writeManifest, out } from '../utils/xspec-482.js';

const h = createHarness('exit-flush-81');
afterAll(() => h.cleanup());

const onWindows = process.platform === 'win32';
// chmod does not stop root; a Windows account has no uid (and chmod on a folder does nothing there).
const cannotChmod = onWindows || (typeof process.getuid === 'function' && process.getuid() === 0);

/** A project folder nobody may write into: `uds init` cannot make `.standards/`. */
function lockedProject(label) {
  const project = join(h.makeDir(label), 'project');
  mkdirSync(join(project, '.claude'), { recursive: true }); // `.claude/` is Claude Code's marker: without it init takes the legacy path
  chmodSync(project, 0o555);
  return project;
}

it('uds init that cannot make .standards prints that cause once with the number of files and the first three names, not once per file (board #81)', async (ctx) => {
  ctx.skip(cannotChmod, 'chmod does not stop root, and a Windows folder has no mode bits');
  const project = lockedProject('init-grouped');
  try {
    const run = await h.runCli(['init', '--yes', '--skills-location', 'project'], project);
    const text = out(run);

    expect(run.code, text).not.toBe(0);
    // The cause of the folder `.standards` is printed exactly once (the folder `.standards/options` is another cause, another group).
    expect(text.match(/Could not create the folder ".*[\\/]\.standards": permission denied/g), text).toHaveLength(1);
    const affected = /-> (\d+) files affected, the first 3: (.+)/.exec(text);
    expect(affected, text).not.toBeNull();
    expect(Number(affected[1])).toBeGreaterThanOrEqual(50);
    expect(affected[2].split(', ')).toHaveLength(3);
    // The per-file lines of the old output are gone: no line starts with "<file>: Could not create the folder".
    expect(text).not.toMatch(/^\s*\S+\.ai\.yaml: Could not create the folder/m);
    // A different cause (the integration file) is still its own line.
    expect(text).toMatch(/claude-code: EACCES: permission denied, open '.*CLAUDE\.md'/);
    // The whole output is a few KB; it was 64 KB.
    expect(Buffer.byteLength(text)).toBeLessThan(16000);
    expect(existsSync(join(project, '.standards'))).toBe(false);
  } finally {
    chmodSync(project, 0o755);
  }
}, 180000);

it('uds init --ui-lang zh-tw says how many files a shared cause hit in Traditional Chinese, with no English sentence of the English line left', async (ctx) => {
  ctx.skip(cannotChmod, 'chmod does not stop root, and a Windows folder has no mode bits');
  const project = lockedProject('init-grouped-zh');
  try {
    const run = await h.runCli(['init', '--yes', '--skills-location', 'project'], project, { ui: 'zh-tw' });
    const text = out(run);

    expect(run.code, text).not.toBe(0);
    expect(text).toMatch(/→ 影響 \d+ 個檔案，前 3 個：/);
    expect(text).not.toContain('files affected');
    expect(text.match(/無法建立資料夾「.*[\\/]\.standards」：權限不足/g)).toHaveLength(1);
  } finally {
    chmodSync(project, 0o755);
  }
}, 180000);

it('uds update that cannot write the standards it restores still prints every failed file to a reader that is slow, and ends with exit code 1 (board #81)', async (ctx) => {
  ctx.skip(cannotChmod || onWindows, 'needs chmod and a POSIX shell pipe (sh); not run on Windows or as root');
  const project = await h.newProject();
  const standards = join(project, '.standards');
  const manifest = readManifest(project);
  manifest.upstream.version = '6.11.0'; // older than this UDS: plain `uds update` has work to do
  writeManifest(project, manifest);
  const removed = readdirSync(standards).filter((name) => name.endsWith('.ai.yaml'));
  for (const name of removed) rmSync(join(standards, name));
  expect(removed.length, 'fixture: there are standards to restore').toBeGreaterThan(50);
  chmodSync(standards, 0o555); // the standards cannot be written back: one failure per removed file
  try {
    const run = await runWithSlowReader(h, project, ['update', '--yes', '--offline']);

    expect(run.code, run.stdout.slice(-400)).toBe(1);
    expect(Buffer.byteLength(run.stdout), 'fixture: the output really is larger than one pipe').toBeGreaterThan(65536);
    // One failure line per removed file, counted from what the test removed. The tail of the list is what a cut-off pipe loses.
    const failed = run.stdout.match(/^ {2}✗ \.standards\/\S+\.ai\.yaml: /gm) || [];
    expect(failed).toHaveLength(removed.length);
  } finally {
    chmodSync(standards, 0o755);
  }
}, 180000);

/** A project with `count` hollow implementations, so `uds audit --effects` prints one finding each and exits 1. */
function hollowProject(label, count) {
  const project = h.makeDir(label);
  mkdirSync(join(project, 'providers'));
  mkdirSync(join(project, '.uds'));
  for (let i = 1; i <= count; i++) {
    writeFileSync(join(project, 'providers', `hollow-${i}.provider.ts`), `export function provision${i}(name: string) { return { ok: true, accessUrl: name }; }\n`);
  }
  writeFileSync(join(project, '.uds', 'effect-boundary.json'), JSON.stringify({ root: '.', families: [{ name: 'providers', include: ['providers/**/*.ts'] }] }));
  return project;
}

it('uds audit --effects with 300 hollow implementations prints the whole report to a reader that is slow, down to its last line, and exits 1 (board #81)', async (ctx) => {
  ctx.skip(onWindows, 'needs a POSIX shell pipe (sh); not run on Windows');
  const COUNT = 300;
  const project = hollowProject('effects', COUNT);

  const run = await runWithSlowReader(h, project, ['audit', '--effects']);

  expect(run.code, run.stdout.slice(-400)).toBe(1);
  expect(Buffer.byteLength(run.stdout), 'fixture: the output really is larger than one pipe').toBeGreaterThan(65536);
  // One RED entry per file the test wrote, and the closing advice, which is the last text the gate prints.
  expect(run.stdout.match(/^ {2}✗ \[providers\] providers\/hollow-\d+\.provider\.ts$/gm)).toHaveLength(COUNT);
  expect(run.stdout).toContain(`${COUNT} effect implementation(s) reach nothing outside this process`);
  expect(run.stdout).toMatch(/or add a baseline row\s+with an expiry date and a reason\.\s+EXIT=1\s*$/);
}, 180000);

it('uds audit --effects --format json with 300 hollow implementations gives a reader that is slow one document that JSON.parse reads back whole, with the gate code in it (board #81)', async (ctx) => {
  ctx.skip(onWindows, 'needs a POSIX shell pipe (sh); not run on Windows');
  const COUNT = 300;
  const project = hollowProject('effects-json', COUNT);

  const run = await runWithSlowReader(h, project, ['audit', '--effects', '--format', 'json']);

  expect(run.code, run.stdout.slice(-400)).toBe(1);
  expect(Buffer.byteLength(run.stdout), 'fixture: the output really is larger than one pipe').toBeGreaterThan(65536);
  // The shell appends "EXIT=<n>" after the CLI ended; what is before it must be exactly the JSON document, closing brace included.
  const document = run.stdout.replace(/\s*EXIT=\d+\s*$/, '');
  const parsed = JSON.parse(document); // a document cut at one pipe's worth does not parse
  expect(parsed.exitCode).toBe(1);
  expect(parsed.report.filter((line) => /^ {2}✗ \[providers\] providers\/hollow-\d+\.provider\.ts$/.test(line))).toHaveLength(COUNT);
}, 180000);

it('uds audit --effects whose reader closes the pipe after one line still ends with the gate code 1 and prints no stack trace (EPIPE, board #81)', async (ctx) => {
  ctx.skip(onWindows, 'needs a POSIX shell with `head` (sh); not run on Windows');
  const project = hollowProject('effects-epipe', 300);

  const run = await runWithEarlyClosingReader(h, project, [h.cliPath(), '--ui-lang', 'en', 'audit', '--effects']);

  expect(run.code, `stderr: ${run.stderr.slice(-600)}`).toBe(1);
  expect(run.firstLine.trim(), 'fixture: the reader got its one line').not.toBe('');
  // Entry-level guard, not the guard of the `stream.once('error', ...)` line: console.log's own write callback absorbs a closed
  // pipe, so cutting that line does not turn this test red (measured). The last test of this file is the one that does.
  // An unhandled EPIPE prints "Error: write EPIPE" and a stack ("    at ...") on stderr.
  expect(run.stderr).not.toMatch(/EPIPE/);
  expect(run.stderr).not.toMatch(/^\s+at /m);
}, 180000);

it('flushAndExit called after a plain process.stdout.write whose reader closes the pipe still ends with the code it was given and prints no stack trace (EPIPE, board #81)', async (ctx) => {
  ctx.skip(onWindows, 'needs a POSIX shell with `head` (sh); not run on Windows');
  // The CLI commands print with console.log, whose own write callback already absorbs a closed pipe, so the audit test above
  // cannot tell whether flushAndExit handles it itself. A direct stream write has no such help: this is the module's own duty.
  const flushModule = pathToFileURL(join(dirname(dirname(h.cliPath())), 'src', 'utils', 'flush-and-exit.js')).href;
  const dir = h.makeDir('flush-direct');
  const script = join(dir, 'write-then-flush.mjs');
  writeFileSync(script, `import { flushAndExit } from ${JSON.stringify(flushModule)};\nprocess.stdout.write('x'.repeat(300000) + '\\n');\nawait flushAndExit(3);\n`);

  const run = await runWithEarlyClosingReader(h, dir, [script], 'true'); // closes the pipe without reading a byte

  expect(run.code, `stderr: ${run.stderr.slice(-600)}`).toBe(3);
  expect(run.stderr).not.toMatch(/EPIPE/);
  expect(run.stderr).not.toMatch(/^\s+at /m);
}, 60000);
