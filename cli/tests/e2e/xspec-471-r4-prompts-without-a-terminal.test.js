/**
 * E2E: the interactive commands say what they did when nothing can answer their question (dev-platform XSPEC-471 R4,
 * found while writing the acceptance steps for `uds quickstart`, `uds spec create|delete|split`).
 *
 * The defect: run with no terminal (an AI assistant, CI, a pipe), these commands drew their question, then ended on a
 * Node stack trace (`ExitPromptError`) with exit code 0, as if they had succeeded. `uds update` and `uds uninstall` were
 * already fixed the same way (XSPEC-372 R3).
 *
 * Every test spawns the real CLI with stdin closed (the harness gives no stdin) and reads back the output, the exit
 * code and the files.
 *
 * Wires that make these red when cut (one line each):
 *   cli/src/commands/quickstart.js   if (!isPromptClosed(promptError)) throw promptError;   (the line after it prints every workflow)
 *   cli/src/commands/spec.js         the three `isPromptClosed(promptError)` catches (create, delete)
 *   cli/src/commands/spec-split.js   if (!isPromptClosed(promptError)) throw promptError;
 */

import { it, expect, afterAll } from 'vitest';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec471-r4-prompts');
afterAll(() => h.cleanup());

const SPEC_DIR = 'docs/specs';
const microSpec = (title, acs) =>
  `## Micro-Spec: ${title}\n\n**Status**: draft\n**Created**: 2026-10-01\n**Type**: feature\n**Spec Mode**: standard\n**Depends On**: none\n\n**Intent**: ${title}\n\n**Scope**: general\n\n**Acceptance**:\n${acs.map((a) => `- [ ] ${a}`).join('\n')}\n\n**Confirmed**: No\n`;

function projectWithSpec(id, title, acs) {
  const dir = h.makeDir('prompts');
  mkdirSync(join(dir, SPEC_DIR), { recursive: true });
  writeFileSync(join(dir, SPEC_DIR, `${id}.md`), microSpec(title, acs));
  return dir;
}

it('uds quickstart with no terminal prints every workflow and its commands instead of a stack trace (XSPEC-471 R4)', async () => {
  const run = await h.runCli(['quickstart'], h.makeDir('prompts'));
  expect(run.code, run.stdout + run.stderr).toBe(0);
  const out = run.stdout + run.stderr;
  expect(out).not.toMatch(/ExitPromptError|force closed the prompt/);
  // all four workflows, each with a command only that workflow has
  expect(out).toContain('Quick Spec → Implement (Micro-Spec)');
  expect(out).toContain('uds spec archive SPEC-XXX');
  expect(out).toContain('Full SDD Spec Flow (Boost)');
  expect(out).toContain('uds spec create "your feature" --scope fullstack');
  expect(out).toContain('Test-Driven Development (TDD)');
  expect(out).toContain('# Make it pass (GREEN)');
  expect(out).toContain('Check Project Health');
  expect(out).toContain('uds check --i18n');
});

it('uds spec delete without --yes and with no terminal deletes nothing, says why and exits 2 (XSPEC-471 R4)', async () => {
  const dir = projectWithSpec('SPEC-001-keep', 'Keep me', ['AC-1: one']);
  const run = await h.runCli(['spec', 'delete', 'SPEC-001-keep', '--output', SPEC_DIR], dir);
  expect(run.code, run.stdout + run.stderr).toBe(2);
  expect(run.stdout + run.stderr).not.toMatch(/ExitPromptError|force closed the prompt/);
  expect(run.stdout).toContain('Re-run with --yes to delete. Nothing has been deleted.');
  expect(existsSync(join(dir, SPEC_DIR, 'SPEC-001-keep.md'))).toBe(true);
});

it('uds spec create without --yes and with no terminal leaves the spec as a draft and says how to confirm it (XSPEC-471 R4)', async () => {
  const dir = h.makeDir('prompts');
  const run = await h.runCli(['spec', 'create', 'Add login page', '--output', SPEC_DIR], dir);
  expect(run.code, run.stdout + run.stderr).toBe(0);
  expect(run.stdout + run.stderr).not.toMatch(/ExitPromptError|force closed the prompt/);
  expect(run.stdout).toContain('the spec stays a draft');
  expect(run.stdout).toContain('Run `uds spec confirm <id>`');
  const written = readFileSync(join(dir, SPEC_DIR, 'SPEC-001-add-login-page.md'), 'utf8');
  expect(written).toContain('**Status**: draft');
  expect(written).toContain('**Confirmed**: No');
});

it('uds spec split with two or more criteria and no terminal changes nothing, says why and exits 2 (XSPEC-471 R4)', async () => {
  const dir = projectWithSpec('SPEC-001-big', 'Big', ['AC-1: first', 'AC-2: second', 'AC-3: third']);
  const before = readFileSync(join(dir, SPEC_DIR, 'SPEC-001-big.md'), 'utf8');
  const run = await h.runCli(['spec', 'split', 'SPEC-001-big', '--output', SPEC_DIR], dir);
  expect(run.code, run.stdout + run.stderr).toBe(2);
  expect(run.stdout + run.stderr).not.toMatch(/ExitPromptError|force closed the prompt/);
  expect(run.stdout).toContain('Cannot ask which ACs to move');
  expect(run.stdout).toContain('Nothing has been changed.');
  expect(readFileSync(join(dir, SPEC_DIR, 'SPEC-001-big.md'), 'utf8')).toBe(before);
  expect(existsSync(join(dir, SPEC_DIR, '.backup'))).toBe(false);
});
