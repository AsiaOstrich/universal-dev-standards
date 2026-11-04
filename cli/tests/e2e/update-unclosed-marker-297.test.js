/**
 * E2E: a UDS block with START but no END must be refused, not appended to (issue #297).
 *
 * Reported on 6.15.0-beta.1 and 6.14.1: a copy step truncated AGENTS.md and lost the END line. `uds update --apply`
 * planned "integration file exists but missing UDS markers", appended a complete second block, then failed on the
 * duplicate START - and every later run failed the same way until the file was merged by hand.
 *
 * These tests run the real CLI (`bin/uds.js init` then `update --plan` / `--apply`) against a real temp project and
 * read back the file bytes and the printed plan. Two control arms keep the fix honest: a file with no markers at all
 * still gets its block appended, and once the END line is put back the same update succeeds.
 *
 * Isolation: throwaway HOME (scripts/lib/isolated-home.mjs) and GIT_CONFIG_GLOBAL pointed at the null device.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir, devNull } from 'node:os';
import { join, resolve } from 'node:path';
import { isolatedHome } from '../../../scripts/lib/isolated-home.mjs';
import { stripAnsi } from '../utils/cli-runner.js';

const CLI = resolve(import.meta.dirname, '../../bin/uds.js');
const START = '<!-- UDS:STANDARDS:START -->';
const END = '<!-- UDS:STANDARDS:END -->';

const count = (text, marker) => text.split('\n').filter((l) => l.trim() === marker).length;

describe('E2E: uds update on an AGENTS.md whose UDS block lost a marker (issue #297)', () => {
  let project;
  let home;

  function uds(...args) {
    const r = spawnSync(process.execPath, [CLI, ...args], {
      cwd: project,
      encoding: 'utf8',
      timeout: 120000,
      env: { ...home.env, FORCE_COLOR: '0', GIT_CONFIG_GLOBAL: devNull, GIT_CONFIG_NOSYSTEM: '1' }
    });
    return { status: r.status, text: stripAnsi(`${r.stdout}\n${r.stderr}`) };
  }

  const agentsPath = () => join(project, 'AGENTS.md');
  const agents = () => readFileSync(agentsPath(), 'utf8');

  beforeEach(() => {
    project = mkdtempSync(join(tmpdir(), 'uds-test-297-'));
    home = isolatedHome({ prefix: 'uds-test-297-home-' });
    spawnSync('git', ['init', '-q'], { cwd: project, env: { ...home.env, GIT_CONFIG_GLOBAL: devNull } });
    const init = uds('init', '-y');
    expect(init.status, init.text).toBe(0);
    // Guard against a vacuous pass: init produced exactly one well-formed block to damage.
    expect(count(agents(), START)).toBe(1);
    expect(count(agents(), END)).toBe(1);
  }, 180000);

  afterEach(() => {
    rmSync(project, { recursive: true, force: true });
    home.cleanup();
  });

  function damage(transform) {
    writeFileSync(agentsPath(), transform(agents()));
    return agents();
  }

  const dropEnd = (text) => text.split('\n').filter((l) => l.trim() !== END).join('\n');

  it('--apply refuses a START with no END: file bytes unchanged, exit 1, the message names the unclosed line', () => {
    const before = damage(dropEnd);
    const startLine = before.split('\n').findIndex((l) => l.trim() === START) + 1;

    const run = uds('update', '--apply', '--yes', '--offline');

    expect(agents()).toBe(before);
    expect(count(agents(), START)).toBe(1);
    expect(run.status).not.toBe(0);
    expect(run.text).toContain(`on line ${startLine} has no matching`);
    expect(run.text).toContain('Refusing to write');
  }, 180000);

  it('--apply stays stuck-free: a second run still refuses without adding a block', () => {
    const before = damage(dropEnd);
    uds('update', '--apply', '--yes', '--offline');
    const second = uds('update', '--apply', '--yes', '--offline');

    expect(agents()).toBe(before);
    expect(second.text).not.toContain('standalone occurrences');
    expect(second.text).toContain('has no matching');
  }, 240000);

  it('--plan says the markers are damaged instead of "missing UDS markers"', () => {
    damage(dropEnd);

    const plan = uds('update', '--plan', '--offline');

    expect(plan.text).toContain('Reconciliation Plan');
    expect(plan.text).toMatch(/~ AGENTS\.md \(UDS markers damaged, will not be written/);
    expect(plan.text).not.toContain('missing UDS markers');
  }, 180000);

  it('--apply refuses an END that comes before START', () => {
    const before = damage((text) => {
      const lines = text.split('\n');
      const s = lines.findIndex((l) => l.trim() === START);
      const e = lines.findIndex((l) => l.trim() === END);
      [lines[s], lines[e]] = [lines[e], lines[s]];
      return lines.join('\n');
    });

    const run = uds('update', '--apply', '--yes', '--offline');

    expect(agents()).toBe(before);
    expect(run.status).not.toBe(0);
    expect(run.text).toContain('comes before');
  }, 180000);

  it('control: with the END line put back, the same update succeeds and leaves one block', () => {
    const intact = agents();
    damage(dropEnd);
    writeFileSync(agentsPath(), intact);

    const run = uds('update', '--apply', '--yes', '--offline');

    expect(run.status, run.text).toBe(0);
    expect(count(agents(), START)).toBe(1);
    expect(count(agents(), END)).toBe(1);
  }, 180000);

  it('control: a file with neither marker still gets one block appended', () => {
    damage((text) => text.split('\n').filter((l) => l.trim() !== START && l.trim() !== END).join('\n'));

    const run = uds('update', '--apply', '--yes', '--offline');

    expect(run.status, run.text).toBe(0);
    expect(count(agents(), START)).toBe(1);
    expect(count(agents(), END)).toBe(1);
  }, 180000);
});
