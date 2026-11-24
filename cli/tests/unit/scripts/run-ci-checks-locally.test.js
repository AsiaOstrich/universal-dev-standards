// scripts/run-ci-checks-locally.mjs reads .github/workflows/*.yml and runs the
// pure checks CI runs, so pre-release-check.sh cannot be green while CI's
// check:error-exit (2026-11-24, e2b5fa32) is red.
//
// Three things are pinned here:
//   1. the runner can go red: its own self-test (every arm drives the real runner
//      against a fake repo and reads the effect back from files the fake checks write);
//   2. against the REAL workflows, every `npm run check:*` command that appears in the
//      workflow text is in the plan. The expected set is read from the raw workflow text
//      with a regular expression, not from the YAML parse the runner uses;
//   3. pre-release-check.sh calls it, and it lists nothing as unclassified.

import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const RUNNER = join(REPO_ROOT, 'scripts', 'run-ci-checks-locally.mjs');

const runner = (args) => spawnSync(process.execPath, [RUNNER, ...args], { encoding: 'utf8', cwd: REPO_ROOT });

describe('run-ci-checks-locally', () => {
  it('its own self-test passes (the runner goes red when it should)', () => {
    const r = runner(['--self-test']);
    expect(r.status, `${r.stdout}${r.stderr}`).toBe(0);
    expect(r.stdout).toMatch(/self-test: \d+ arms passed/);
  }, 120_000);

  it('plans every `npm run check:*` command the real workflows contain', () => {
    const dir = join(REPO_ROOT, '.github', 'workflows');
    const expected = new Set();
    for (const f of readdirSync(dir).filter((n) => /\.ya?ml$/.test(n))) {
      for (const m of readFileSync(join(dir, f), 'utf8').matchAll(/^\s*(?:-\s*)?run:\s*npm run (check:[\w:-]+)/gm)) expected.add(m[1]);
    }
    // the premise: the regex found something, or the assertions below would pass on nothing
    expect(expected.size).toBeGreaterThan(10);
    expect(expected.has('check:error-exit')).toBe(true);

    const r = runner(['--list']);
    expect(r.status, `${r.stdout}${r.stderr}`).toBe(0);
    const planned = r.stdout.split('\n').filter((l) => l.startsWith('  run '));
    for (const name of expected) {
      expect(planned.some((l) => l.includes(`npm run ${name}`)), `${name} is in a workflow but not in the plan`).toBe(true);
    }
  });

  it('classifies every command the real workflows run (nothing unclassified)', () => {
    const r = runner(['--list']);
    expect(r.stdout).not.toMatch(/^ {2}\?\?\? /m);
  });

  it('is called by pre-release-check.sh', () => {
    const sh = readFileSync(join(REPO_ROOT, 'scripts', 'pre-release-check.sh'), 'utf8');
    expect(sh).toMatch(/run_check "30"[^\n]*run-ci-checks-locally\.mjs/);
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
    expect(pkg.scripts['check:ci-parity']).toBe('node scripts/run-ci-checks-locally.mjs');
  });
});
