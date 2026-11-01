/**
 * E2E: the permission and lock wording reaches the two places it had missed (board #77, follow-up of XSPEC-516 R2).
 *
 *   1. `uds init`: the folder made just before a copy (`.standards/`) failed with Node's bare
 *      "EACCES: permission denied, mkdir '...'" while the copy next to it said "permission denied" and what to check.
 *   2. `uds update --apply`: the plain copy of a standard onto the project gave up on the first file lock and printed
 *      Node's bare "EACCES: permission denied, copyfile" text.
 *   3. The two messages (a lock; a permission problem) follow `--ui-lang`, through the CLI's message table.
 *
 * Every test runs the real CLI in a throwaway project and reads back the lines printed, the exit code and the files on
 * disk. Faults that cannot be made with chmod (a lock; a permission error as root or on Windows) come from a preload
 * that wraps `fs` below the product, so the product's own retry and message code is what is measured.
 *
 * Wires that make these red when cut (one line of CLI source each; each cut was applied and seen red, see the report):
 *   cli/src/utils/copier.js                  mkdirSyncRetrying(targetFolder);   (two lines: copyExtension, copyStandard)
 *   cli/src/reconciler/plan-executor.js      mkdirSyncRetrying(dirname(targetPath));
 *   cli/src/reconciler/plan-executor.js      copyFileSyncRetrying(sourcePath, targetPath);
 *   cli/src/utils/transient-fs.js            const words = t().fsErrors;    (the language of the two messages)
 *
 * What is NOT covered here: the Windows-only rules (EPERM / EACCES retried, then the file system asked). They are pinned
 * with an injected platform in tests/unit/utils/transient-fs.test.js; no Windows machine ran this file.
 *
 * Every `it` is self-contained: it makes its own project and its own run, so it also passes when selected alone.
 */

import { it, expect, afterAll } from 'vitest';
import { rmSync, existsSync, readFileSync, writeFileSync, mkdirSync, chmodSync } from 'fs';
import { join } from 'path';
import { createHarness, REAL_REPO, stripAnsi } from '../utils/staged-cli-harness.js';
import { readManifest, writeManifest, out } from '../utils/xspec-482.js';

const h = createHarness('permission-followups-77');
afterAll(() => h.cleanup());

// chmod does not stop root; a Windows account has no uid (and chmod on a folder does nothing there).
const cannotChmod = process.platform === 'win32' || (typeof process.getuid === 'function' && process.getuid() === 0);

// An injected EACCES is a real permission error off Windows (one try, then the message). On Windows EACCES is retried and
// then the file system is asked; with the scratch folder writable it answers "no permission problem", so those tests
// would measure a different path. They are skipped there; the Windows rules are unit-tested with an injected platform.
const onWindows = process.platform === 'win32';

const STANDARD = '.standards/testing.ai.yaml';
const APPLY = ['update', '--apply', '--yes', '--offline'];

/**
 * Preload (CommonJS): chosen `fs` calls fail like a locked or forbidden path, on any system.
 * `UDS_TEST_FS_FAULTS` is a JSON list of `{ fn, contains?, endsWith?, unless?, code, failTimes, log }` (`unless`: a path with this text is left alone, e.g. the backup's own `.standards` copy):
 * a call of `fs[fn]` whose path (separators as "/") matches throws an error with `code` for the first `failTimes`
 * calls (or always), and every matching call is appended to `log`, so the test can count the tries.
 */
const FAULT_PRELOAD = `
const fs = require('fs');
for (const fn of ['copyFileSync', 'mkdirSync']) {
  const real = fs[fn];
  fs[fn] = function (...args) {
    const dest = String(fn === 'copyFileSync' ? args[1] : args[0]).replace(/\\\\/g, '/');
    for (const spec of JSON.parse(process.env.UDS_TEST_FS_FAULTS || '[]')) {
      const hit = spec.fn === fn && !(spec.unless && dest.includes(spec.unless)) && (spec.contains ? dest.includes(spec.contains) : dest.endsWith(spec.endsWith));
      if (!hit) continue;
      const tries = fs.existsSync(spec.log) ? fs.readFileSync(spec.log, 'utf-8').split('\\n').filter(Boolean).length : 0;
      fs.appendFileSync(spec.log, 'try ' + (tries + 1) + '\\n');
      if (spec.failTimes === 'always' || tries < spec.failTimes) {
        const err = new Error(spec.code + ': injected, ' + fn + " '" + dest + "'");
        err.code = spec.code;
        throw err;
      }
    }
    return real.apply(this, args);
  };
}
`;

/** `{ preloads, env, countTries }` for the given fault specs. */
function faults(dir, specs) {
  const preload = join(dir, 'fault-preload-77.cjs');
  writeFileSync(preload, FAULT_PRELOAD);
  const withLog = specs.map((s, i) => ({ failTimes: 'always', ...s, log: join(dir, `fault-${i}.log`) }));
  const countTries = (i = 0) => (existsSync(withLog[i].log) ? readFileSync(withLog[i].log, 'utf-8').split('\n').filter(Boolean).length : 0);
  return { preloads: [preload], env: { UDS_TEST_FS_FAULTS: JSON.stringify(withLog) }, countTries };
}

/** A project that was installed with `uds init` and then had its records aged and one standard removed. */
async function projectMissingAStandard() {
  const dir = await h.newProject();
  const manifest = readManifest(dir);
  manifest.upstream.version = '6.11.0';
  writeManifest(dir, manifest);
  rmSync(join(dir, STANDARD), { force: true });
  expect(existsSync(join(dir, STANDARD)), 'fixture: the standard is gone').toBe(false);
  return dir;
}

/** A project folder nobody may write into: `uds init` cannot make `.standards/`. */
function lockedProject(label) {
  const base = h.makeDir(label);
  const project = join(base, 'project');
  mkdirSync(join(project, '.claude'), { recursive: true }); // `.claude/` is Claude Code's marker: without it init takes the legacy path
  chmodSync(project, 0o555);
  return { base, project };
}

it.skipIf(cannotChmod)('uds init in a folder it cannot write into says "permission denied" for the folder it could not create, what to check, and keeps the original error (board #77)', async () => {
  const { project } = lockedProject('init-ro');
  try {
    const run = await h.runCli(['init', '--yes', '--skills-location', 'project'], project);
    const text = out(run);

    expect(run.code, text).not.toBe(0);
    // Words only UDS's message has: Node's own text for this error is "EACCES: permission denied, mkdir '...'".
    expect(text).toMatch(/Could not create the folder ".*[\\/]\.standards": permission denied \(EACCES\)/);
    expect(text).toContain('looks like a permission problem rather than a temporary file lock');
    expect(text).toContain('(1) the folder, or the folder above it, is not marked read-only');
    expect(text).toContain("(Original error: EACCES: permission denied, mkdir '");
    // What it must not say: that another program holds it, or that the antivirus is to blame.
    expect(text).not.toMatch(/locked by another program/);
    expect(text).not.toMatch(/antivirus/i);
    // Read back: nothing was created.
    expect(existsSync(join(project, '.standards'))).toBe(false);
  } finally {
    chmodSync(project, 0o755);
  }
}, 180000);

it.skipIf(cannotChmod)('uds init --locale zh-cn in a folder it cannot write into also says it for the locale pack (the extension copy has its own folder step)', async () => {
  const { project } = lockedProject('init-ro-locale');
  try {
    const run = await h.runCli(['init', '--yes', '--locale', 'zh-cn', '--skills-location', 'project'], project);
    const text = out(run);

    expect(run.code, text).not.toBe(0);
    // The line of the locale pack itself, not of some standard.
    expect(text).toMatch(/extensions[\\/]locales[\\/]zh-cn\.md: Could not create the folder ".*[\\/]\.standards": permission denied \(EACCES\)/);
    expect(existsSync(join(project, '.standards'))).toBe(false);
  } finally {
    chmodSync(project, 0o755);
  }
}, 180000);

it.skipIf(cannotChmod)('uds init --ui-lang zh-tw says the same folder permission problem in Traditional Chinese, with no English sentence left from the English message', async () => {
  const { project } = lockedProject('init-ro-zh');
  try {
    const run = await h.runCli(['init', '--yes', '--skills-location', 'project'], project, { ui: 'zh-tw' });
    const text = out(run);

    expect(run.code, text).not.toBe(0);
    expect(text).toMatch(/無法建立資料夾「.*[\\/]\.standards」：權限不足（EACCES）/);
    expect(text).toContain('這看起來是權限問題，不是暫時的檔案鎖定');
    expect(text).toContain('（1）該資料夾或它的上一層沒有被設成唯讀');
    expect(text).not.toContain('Could not create the folder');
    expect(text).not.toContain('looks like a permission problem');
    expect(existsSync(join(project, '.standards'))).toBe(false);
  } finally {
    chmodSync(project, 0o755);
  }
}, 180000);

it.skipIf(onWindows)('uds init whose .standards folder keeps failing with EACCES (injected, any system) names the folder as a permission problem', async () => {
  const dir = h.makeDir('init-inject');
  const project = join(dir, 'project');
  mkdirSync(join(project, '.claude'), { recursive: true });
  const f = faults(dir, [{ fn: 'mkdirSync', endsWith: '/.standards', unless: '.uds-backups', code: 'EACCES' }]);

  const run = await h.runCli(['init', '--yes', '--skills-location', 'project'], project, f);
  const text = out(run);

  expect(run.code, text).not.toBe(0);
  expect(f.countTries(), 'the injector saw the folder being made').toBeGreaterThan(0);
  expect(text).toMatch(/Could not create the folder ".*[\\/]\.standards": permission denied \(EACCES\)/);
  expect(text).not.toMatch(/antivirus|locked by another program/i);
  expect(existsSync(join(project, '.standards', 'manifest.json'))).toBe(false);
}, 180000);

it.skipIf(onWindows)('uds update --apply copying a standard onto the project says "permission denied" and what to check, not Node\'s bare copyfile text (board #77)', async () => {
  const dir = await projectMissingAStandard();
  const f = faults(h.makeDir('fault'), [{ fn: 'copyFileSync', contains: STANDARD, code: 'EACCES' }]);

  const run = await h.runCli(APPLY, dir, f);
  const text = out(run);

  expect(run.code, text).toBe(1);
  expect(text).toContain('Reconciliation completed with errors: 1 failed');
  // Words only UDS's message has: the injected text is "EACCES: injected, copyFileSync '...'".
  expect(text).toMatch(/Could not copy ".*[\\/]testing\.ai\.yaml" to ".*[\\/]\.standards[\\/]testing\.ai\.yaml": permission denied \(EACCES\)/);
  expect(text).toContain('looks like a permission problem rather than a temporary file lock');
  expect(text).toContain('(1) the file is not marked read-only');
  expect(text).not.toMatch(/antivirus|locked by another program/i);
  // Read back: the standard was not written.
  expect(existsSync(join(dir, STANDARD))).toBe(false);
}, 180000);

it('uds update --apply survives two EBUSY errors on the standard it copies and puts it back byte for byte (the plain copy retries now)', async () => {
  const dir = await projectMissingAStandard();
  const f = faults(h.makeDir('fault'), [{ fn: 'copyFileSync', contains: STANDARD, code: 'EBUSY', failTimes: 2 }]);

  const run = await h.runCli(APPLY, dir, f);
  const text = out(run);

  expect(run.code, text).toBe(0);
  expect(text).not.toContain('completed with errors');
  expect(f.countTries(), 'two copies failed, the third went through').toBe(3);
  expect(existsSync(join(dir, STANDARD))).toBe(true);
  expect(readFileSync(join(dir, STANDARD), 'utf-8')).toBe(readFileSync(join(REAL_REPO, 'ai', 'standards', 'testing.ai.yaml'), 'utf-8'));
}, 180000);

it('uds update --apply stops after a bounded number of tries when the standard stays locked, names the file and the likely cause, and does not claim success', async () => {
  const dir = await projectMissingAStandard();
  const f = faults(h.makeDir('fault'), [{ fn: 'copyFileSync', contains: STANDARD, code: 'EBUSY' }]);

  const run = await h.runCli(APPLY, dir, f);
  const text = out(run);

  expect(run.code, text).toBe(1);
  expect(f.countTries()).toBeGreaterThanOrEqual(2);
  expect(f.countTries()).toBeLessThanOrEqual(10);
  expect(text).toContain(`UDS tried ${f.countTries()} times`);
  expect(text).toMatch(/Could not copy ".*testing\.ai\.yaml" to ".*testing\.ai\.yaml": the file is locked by another program \(EBUSY\)/);
  expect(text).toMatch(/antivirus/i);
  expect(existsSync(join(dir, STANDARD))).toBe(false);
}, 180000);

it.skipIf(onWindows)('uds update --apply whose .standards folder cannot be made (injected EACCES) says "permission denied" for the folder', async () => {
  const dir = await projectMissingAStandard();
  const f = faults(h.makeDir('fault'), [{ fn: 'mkdirSync', endsWith: '/.standards', unless: '.uds-backups', code: 'EACCES' }]);

  const run = await h.runCli(APPLY, dir, f);
  const text = out(run);

  expect(run.code, text).toBe(1);
  expect(f.countTries(), 'the plan executor asked for the folder').toBeGreaterThan(0);
  expect(text).toMatch(/Could not create the folder ".*[\\/]\.standards": permission denied \(EACCES\)/);
  expect(text).toContain('(1) the folder, or the folder above it, is not marked read-only');
  expect(existsSync(join(dir, STANDARD))).toBe(false);
}, 180000);

it('uds update --apply --ui-lang zh-tw says a file lock in Traditional Chinese', async () => {
  const dir = await projectMissingAStandard();
  const f = faults(h.makeDir('fault'), [{ fn: 'copyFileSync', contains: STANDARD, code: 'EBUSY' }]);
  const run = await h.runCli(APPLY, dir, { ...f, ui: 'zh-tw' });
  const text = out(run);
  expect(run.code, text).toBe(1);
  expect(text).toMatch(/無法複製「.*testing\.ai\.yaml」到「.*testing\.ai\.yaml」：檔案被其他程式鎖住（EBUSY）/);
  expect(text).toContain('防毒軟體');
  expect(text).not.toContain('locked by another program');
}, 180000);

it.skipIf(onWindows)('uds update --apply --ui-lang zh-tw says a permission problem in Traditional Chinese', async () => {
  const dir = await projectMissingAStandard();
  const f = faults(h.makeDir('fault'), [{ fn: 'copyFileSync', contains: STANDARD, code: 'EACCES' }]);
  const run = await h.runCli(APPLY, dir, { ...f, ui: 'zh-tw' });
  const text = out(run);
  expect(run.code, text).toBe(1);
  expect(text).toMatch(/無法複製「.*testing\.ai\.yaml」到「.*testing\.ai\.yaml」：權限不足（EACCES）/);
  expect(text).toContain('（1）檔案沒有被設成唯讀');
  expect(text).not.toContain('permission denied (EACCES)');
}, 180000);

it.skipIf(onWindows)('uds update --apply --ui-lang zh-cn says the permission problem in Simplified Chinese', async () => {
  const dir = await projectMissingAStandard();
  const f = faults(h.makeDir('fault'), [{ fn: 'copyFileSync', contains: STANDARD, code: 'EACCES' }]);
  const run = await h.runCli(APPLY, dir, { ...f, ui: 'zh-cn' });
  const text = out(run);
  expect(run.code, text).toBe(1);
  expect(text).toMatch(/无法复制“.*testing\.ai\.yaml”到“.*testing\.ai\.yaml”：权限不足（EACCES）/);
  expect(text).toContain('（1）文件没有被设成只读');
  expect(text).not.toContain('permission denied (EACCES)');
}, 180000);

it('control: uds update --apply with no fault puts the standard back and prints neither message', async () => {
  const dir = await projectMissingAStandard();
  const run = await h.runCli(APPLY, dir);
  const text = stripAnsi(out(run));
  expect(run.code, text).toBe(0);
  expect(text).not.toMatch(/permission denied|locked by another program/);
  expect(existsSync(join(dir, STANDARD))).toBe(true);
}, 180000);
