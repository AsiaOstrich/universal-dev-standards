// XSPEC-383 R5 (Option E): `uds lint` was registered for the first time on
// 2026-08-19 — cli/scripts/check-module-reachability.mjs and
// check-command-existence.mjs exist because it had shipped, tested,
// unregistered, for four and a half months while VibeOps called it and got
// "command not found" every time. This test exercises the command layer
// (lint.js), not spec-linter.js's internals (covered by
// cli/tests/unit/utils/spec-linter.test.js).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { lintCommand, buildMessage } from '../../src/commands/lint.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../temp/lint-test');

function writeSpec(dir, id, { dependsOn = [], lines = 100 } = {}) {
  const deps = dependsOn.length > 0 ? dependsOn.join(', ') : 'none';
  const content = [
    `## Micro-Spec: ${id}`,
    '',
    '**Status**: draft',
    '**Created**: 2026-04-07',
    '**Type**: feature',
    '**Spec Mode**: standard',
    `**Depends On**: ${deps}`,
    '',
    '**Intent**: Test',
    '',
    '**Scope**: general',
    '',
    '**Acceptance**:',
    '- [ ] AC-1: Criterion 1',
    '',
    '**Confirmed**: No',
    '',
    ...Array.from({ length: Math.max(0, lines - 16) }, (_, i) => `Line ${i}`),
  ].join('\n');

  writeFileSync(join(dir, 'specs', `${id}.md`), content);
}

describe('lintCommand', () => {
  let originalCwd;
  let consoleLogs;
  let consoleLogSpy;

  beforeEach(() => {
    originalCwd = process.cwd();
    consoleLogs = [];

    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    process.chdir(TEST_DIR);

    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation((...args) => {
      consoleLogs.push(args.join(' '));
    });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
    consoleLogSpy.mockRestore();
    process.exitCode = undefined;
  });

  describe('no specs/ directory', () => {
    it('says "查無 spec 目錄" instead of silently reporting all-clean', async () => {
      await lintCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('查無 spec 目錄');
      expect(process.exitCode).toBeUndefined();
    });

    it('--json still emits the fixed {summary, results} contract (no specs/ collapses to zero, same as "all clean")', async () => {
      // The JSON contract is intentionally NOT extended with a "was anything
      // scanned" flag — it must stay exactly what VibeOps's lint-executor.ts
      // already parses. The disambiguation ("查無 spec 目錄" vs "all clean")
      // is a human-mode-only guarantee; a --json caller with zero specs gets
      // the same shape either way, same as `uds check --json` today.
      await lintCommand({ json: true });

      const parsed = JSON.parse(consoleLogs.join('\n'));
      expect(parsed).toEqual({ summary: { pass: 0, warn: 0, fail: 0 }, results: [] });
    });
  });

  describe('with specs/', () => {
    beforeEach(() => {
      mkdirSync(join(TEST_DIR, 'specs'), { recursive: true });
    });

    it('human output lists each spec with pass/warn/fail and prints the denominator', async () => {
      writeSpec(TEST_DIR, 'SPEC-001', { lines: 100 });

      await lintCommand({});

      const output = consoleLogs.join('\n');
      expect(output).toContain('掃描 1 份 spec');
      expect(output).toContain('SPEC-001');
      expect(output).toContain('0 fail');
    });

    it('--json produces the {summary, results[{specId,status,message}]} contract VibeOps parses', async () => {
      writeSpec(TEST_DIR, 'SPEC-001', { lines: 100 });
      writeSpec(TEST_DIR, 'SPEC-002', { dependsOn: ['SPEC-DOES-NOT-EXIST'], lines: 100 });

      await lintCommand({ json: true });

      const parsed = JSON.parse(consoleLogs.join('\n'));
      expect(parsed).toHaveProperty('summary');
      expect(parsed.summary).toHaveProperty('pass');
      expect(parsed.summary).toHaveProperty('warn');
      expect(parsed.summary).toHaveProperty('fail');
      expect(parsed.results).toBeInstanceOf(Array);
      expect(parsed.results).toHaveLength(2);
      for (const r of parsed.results) {
        expect(r).toHaveProperty('specId');
        expect(r).toHaveProperty('status');
        expect(r).toHaveProperty('message');
        expect(typeof r.message).toBe('string');
      }
      const broken = parsed.results.find((r) => r.specId === 'SPEC-002');
      expect(broken.status).toBe('fail');
      expect(broken.message).toContain('SPEC-DOES-NOT-EXIST');
    });

    it('sets a non-zero exit code when any spec fails', async () => {
      writeSpec(TEST_DIR, 'SPEC-001', { dependsOn: ['SPEC-MISSING'], lines: 100 });

      await lintCommand({ json: true });

      expect(process.exitCode).toBe(1);
    });

    it('leaves exit code untouched when everything passes', async () => {
      writeSpec(TEST_DIR, 'SPEC-001', { lines: 100 });

      await lintCommand({ json: true });

      expect(process.exitCode).toBeUndefined();
    });
  });
});

describe('buildMessage', () => {
  it('reports broken dependencies by name', () => {
    const msg = buildMessage({
      deps: { broken: [{ spec: 'SPEC-001', target: 'SPEC-002' }], valid: [] },
      size: { effectiveLines: 50, status: 'pass' },
    });
    expect(msg).toContain('SPEC-002');
    expect(msg).toContain('50 effective lines');
  });

  it('reports only size when there are no broken dependencies', () => {
    const msg = buildMessage({
      deps: { broken: [], valid: [] },
      size: { effectiveLines: 50, status: 'pass' },
    });
    expect(msg).toBe('50 effective lines (pass)');
  });
});
