/**
 * Beta-acceptance helper scripts must finish writing their output before they end the process.
 *
 * Found 2026-10-29: the post-publish acceptance of 6.14.1-beta.1 (and 6.14.0) was red on macOS only, on
 * `xspec482-init-interactive-manual`: the captured output stopped in the middle of a line, before the
 * "DRIVE-EXIT=0" the driver prints last, although `uds init` itself had succeeded. The driver (drive.cjs, written by
 * the steps) ended with `process.stdout.write(text); process.exit(0)`. When stdout is a pipe, Node on macOS
 * writes what does not fit into the pipe asynchronously, and `process.exit` throws that rest away; on Linux
 * the same write is synchronous, so the same step was green there. beta.15 was green on macOS only because
 * the write happened to fit.
 *
 * This runs the REAL driver text out of steps.json against a stand-in `uds` that prints far more than a pipe
 * holds (300 KB, > the 64 KB pipe buffer), read by a parent that is slow to drain it, and asserts the last line arrives.
 * On macOS it is red with the old line and green with the new one; on Linux and Windows it cannot tell them apart
 * (their writes are synchronous), which is why the second test also pins the shape of the code.
 *
 * Wire that makes it red when cut (one line, in each driver of scripts/beta-acceptance/steps.json):
 *   process.stdout.write(strip(all) + '\nDRIVE-EXIT=' + code + '\n', () => process.exit(0));
 * (back to `process.stdout.write(...); process.exit(0);`)
 */

import { describe, it, expect, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { REAL_REPO } from '../utils/staged-cli-harness.js';

const STEPS = JSON.parse(readFileSync(join(REAL_REPO, 'scripts', 'beta-acceptance', 'steps.json'), 'utf8'));
const steps = Array.isArray(STEPS) ? STEPS : STEPS.steps;

/** { stepId, file, content } of every helper file a step writes before it runs. */
const helpers = steps.flatMap((s) => (s.prepare || []).filter((p) => typeof p.content === 'string').map((p) => ({ stepId: s.id, file: p.writeFile, content: p.content })));
const drivers = helpers.filter((h) => h.content.includes('DRIVE-EXIT='));

const temps = [];
afterAll(() => { for (const t of temps) rmSync(t, { recursive: true, force: true }); });

describe('beta-acceptance helpers end only after their output is written', () => {
  it('control: the steps contain interactive drivers to test', () => {
    expect(drivers.length).toBeGreaterThanOrEqual(2);
  });

  it.each([...new Map(drivers.map((d) => [d.content, d])).values()].map((d) => [d.stepId, d]))(
    'the driver of %s delivers "DRIVE-EXIT=0" as the last line when its output is 300 KB and the reader is slow',
    async (_id, driver) => {
      const dir = realpathSync(mkdtempSync(join(tmpdir(), 'uds-drive-flush-')));
      temps.push(dir);
      writeFileSync(join(dir, 'drive.cjs'), driver.content);
      // Stand-in for `uds init`: prints a lot, then ends successfully, never asks anything.
      writeFileSync(join(dir, 'fake-uds.cjs'), "process.stdout.write('x'.repeat(300000) + '\\nall done\\n');\n");

      const child = spawn(process.execPath, [join(dir, 'drive.cjs'), join(dir, 'fake-uds.cjs'), '[]'], { cwd: dir, stdio: ['ignore', 'pipe', 'inherit'] });
      let got = '';
      child.stdout.on('data', (d) => { got += d; child.stdout.pause(); setTimeout(() => child.stdout.resume(), 30); });
      await new Promise((resolve) => child.on('close', resolve));

      expect(got.length, 'the whole 300 KB arrived, not the first pipe-full').toBeGreaterThan(300000);
      expect(got.trimEnd().split('\n').pop()).toBe('DRIVE-EXIT=0');
    },
    60000,
  );

  it('no helper ends the process straight after a stdout write that may still be pending', () => {
    const offenders = helpers.filter((h) => /process\.stdout\.write\((?:[^;]|\n)*?\);\s*(?:[^;\n]*;\s*)?process\.exit\(/.test(h.content.replace(/process\.stdout\.write\([^;]*?,\s*\(\)\s*=>\s*process\.exit\(\d\)\);/g, '')));
    expect(offenders.map((h) => `${h.stepId}: ${h.file}`)).toEqual([]);
  });
});
