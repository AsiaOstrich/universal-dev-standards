/**
 * E2E: `uds spec list` does not pass a default off as a reading (dev-platform XSPEC-456 R5).
 *
 * The report: full SDD specs in `specs/` whose header is a table (`| Status | Approved (...) |`) were listed as
 * `draft` with an empty title. The reader was written for micro-specs; what it did not find it filled in with
 * defaults, which the table then printed as if they had been read from the file.
 *
 * Every test spawns the real CLI (`uds spec list`) in a throwaway project holding spec files, and reads the
 * printed table back.
 *
 * Wire that makes these red when cut (one line of CLI source):
 *   cli/src/vibe/micro-spec.js   const header = readSddHeader(content);
 */

import { it, expect, afterAll } from 'vitest';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHarness } from '../utils/staged-cli-harness.js';

const h = createHarness('xspec456-r5');
afterAll(() => h.cleanup());

/** The row of `uds spec list` for one spec id: the text after the id. */
const rowOf = (stdout, id) => (stdout.split('\n').find((l) => l.startsWith(id)) || '').slice(id.length).trim();

function projectWithSpecs(files) {
  const dir = h.makeDir('r5');
  mkdirSync(join(dir, 'specs'), { recursive: true });
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, 'specs', name), text);
  return dir;
}

it('uds spec list shows the status and title of an SDD spec with a header table, and says "not parsed" where it cannot read one, never draft (XSPEC-456 R5)', async () => {
  const dir = projectWithSpecs({
    // The shape from the report: a header table.
    'SPEC-001-dept-api.md': [
      '# Department API Specification', '',
      '| Field | Value |', '|-------|-------|',
      '| Status | Approved (2026-09-30) |', '| Author | someone |', '',
      '## Overview', '', 'Body text.', '',
      // A table further down with a column that is called Status must not be read as the status.
      '| Status | Count |', '|--------|-------|', '| open | 3 |', ''
    ].join('\n'),
    // Field-line layouts UDS's own specs use.
    'SPEC-002-listed.md': '# [SPEC-002] Feature: Listed\n\n- **Status**: Archived\n- **Created**: 2026-03-26\n',
    'SPEC-003-quote.md': '# Quoted Header\n\n> **Status**: Stable\n',
    // A file whose header says nothing about status.
    'SPEC-004-bare.md': '# Bare Spec\n\nNo header fields at all.\n'
  });

  const list = await h.runCli(['spec', 'list'], dir);
  expect(list.code, list.stdout + list.stderr).toBe(0);

  expect(rowOf(list.stdout, 'SPEC-001-dept-api')).toMatch(/^approved\s+-\s+Department API Specificat/);
  expect(rowOf(list.stdout, 'SPEC-002-listed')).toMatch(/^archived\s+-\s+\[SPEC-002\] Feature: Liste/);
  expect(rowOf(list.stdout, 'SPEC-003-quote')).toMatch(/^stable\s+-\s+Quoted Header/);
  expect(rowOf(list.stdout, 'SPEC-004-bare')).toMatch(/^format: SDD \(status not parsed\)\s+-\s+Bare Spec/);

  // Nothing here is a draft: filtering for drafts finds none, and the unparsed one is not smuggled in.
  const drafts = await h.runCli(['spec', 'list', '--status', 'draft'], dir);
  expect(drafts.code).toBe(0);
  expect(drafts.stdout).toMatch(/No micro-specs found/);
  expect(drafts.stdout).not.toMatch(/SPEC-00\d/);
});

it('uds spec list still lists micro-specs as before, with their own status and type (XSPEC-456 R5)', async () => {
  const dir = h.makeDir('r5');
  const created = await h.runCli(['spec', 'create', 'Fix the login bug. It breaks on empty passwords', '--yes'], dir);
  // `spec create` may need a terminal; the list below is what is under test, so write the file directly if it did not.
  if (created.code !== 0 || !/SPEC-001/.test(created.stdout + created.stderr)) {
    mkdirSync(join(dir, 'specs'), { recursive: true });
    writeFileSync(join(dir, 'specs', 'SPEC-001-fix-the-login-bug.md'), [
      '## Micro-Spec: Fix the login bug', '', '**Status**: confirmed', '**Created**: 2026-10-01', '**Type**: bugfix',
      '**Spec Mode**: standard', '**Depends On**: none', '', '**Intent**: Fix the login bug', '', '**Scope**: fix', '',
      '**Acceptance**:', '- [ ] Bug is fixed and verified', '', '**Confirmed**: Yes', ''
    ].join('\n'));
  }
  const list = await h.runCli(['spec', 'list'], dir);
  expect(list.code, list.stdout + list.stderr).toBe(0);
  const row = list.stdout.split('\n').find((l) => l.startsWith('SPEC-001'));
  expect(row, list.stdout).toBeTruthy();
  expect(row).toMatch(/(draft|confirmed)\s+(bugfix|feature)\s+Fix the login bug/);
});
