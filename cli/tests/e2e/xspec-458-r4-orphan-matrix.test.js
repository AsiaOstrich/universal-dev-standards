/**
 * E2E: the standards orphan matrix (dev-platform XSPEC-458 R4, first half).
 *
 * `cli/scripts/check-standards-orphan-matrix.mjs` gives every registry standard five yes/no columns (installed
 * by `uds init`, named by the generated index, wrapped by a skill, checked, called by a workflow/hook/skill) and
 * fails CI on a standard with all five empty, or on a `check-*` script nothing calls, unless it is on
 * `cli/scripts/orphan-matrix-allowlist.json` with a reason, an owner and an expiry.
 *
 * The script is the entry (CI runs `npm run check:orphan-matrix`); every test here runs it as CI does and reads
 * its exit code and output. Two columns come from a real `uds init --yes` that the script runs itself.
 *
 * Arms: green on the repository as it is; red naming a standard added to the registry with nothing behind it;
 * green again when ONE column is filled; red for an allowlist entry that is no longer a finding, one with no
 * reason, and an expired list; red for a check script nobody calls and green once something calls it;
 * exit 2 (not 0, not 1) when it cannot measure.
 *
 * Wires that make these red when cut (each is one line of CLI source):
 *   cli/scripts/check-standards-orphan-matrix.mjs   const verdict = judge(matrix, allowlist, today);
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

const CLI = resolve(import.meta.dirname, '../..');
const RUNNER = join(CLI, 'scripts', 'check-standards-orphan-matrix.mjs');
const REGISTRY = join(CLI, 'standards-registry.json');
const ALLOWLIST = join(CLI, 'scripts', 'orphan-matrix-allowlist.json');

const scratch = mkdtempSync(join(tmpdir(), 'uds-orphan-test-'));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

let counter = 0;
const writeJson = (name, value) => {
  const path = join(scratch, `${++counter}-${name}`);
  writeFileSync(path, JSON.stringify(value, null, 2));
  return path;
};
const readJson = (path) => JSON.parse(readFileSync(path, 'utf-8'));

function run(args = []) {
  const r = spawnSync('node', [RUNNER, ...args], { cwd: CLI, encoding: 'utf-8', timeout: 120000 });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, out: (r.stdout || '') + (r.stderr || '') };
}

/** A registry copy with extra standards appended. */
const registryWith = (...extra) => {
  const reg = readJson(REGISTRY);
  reg.standards.push(...extra);
  return writeJson('registry.json', reg);
};

const ORPHAN_PROBE = {
  id: 'zz-orphan-probe',
  name: 'Orphan probe',
  source: { human: 'core/zz-orphan-probe.md', ai: 'ai/standards/zz-orphan-probe.ai.yaml' },
  category: 'core',
  description: 'A standard added to the registry with nothing behind it.'
};

it('the orphan matrix is green on the repository as it is, and its numbers are the registry\'s and the allowlist\'s own (XSPEC-458 R4)', () => {
  const registryCount = readJson(REGISTRY).standards.length;
  const allowlist = readJson(ALLOWLIST);

  const r = run();
  expect(r.code, r.out).toBe(0);
  expect(r.stdout, 'the denominator is every standard in the registry').toContain(`standards examined: ${registryCount}`);
  // Everything it found is on the allowlist, and the allowlist holds exactly that (nothing stale).
  expect(r.stdout).toContain(`ORPHANS (all five empty): ${allowlist.standards.length}   of which on the allowlist: ${allowlist.standards.length}`);
  expect(r.stdout).toContain(`with no caller: ${allowlist.checkCommands.length}   of which on the allowlist: ${allowlist.checkCommands.length}`);
  // The two measured columns really were measured: init installed something and the index named something.
  expect(r.stdout).toMatch(/init installs \d{2,} files; index text \d{4,} chars/);
  expect(r.stdout).toMatch(/installed by init: [1-9]\d*   in index: [1-9]\d*/);
  // Control for the control: the allowlist is not empty, so "green" is not "found nothing".
  expect(allowlist.standards.length).toBeGreaterThan(0);
  for (const entry of allowlist.standards) {
    expect(entry.reason?.length, `${entry.id} has a reason`).toBeGreaterThan(20);
    expect(entry.owner?.length, `${entry.id} has an owner`).toBeGreaterThan(20);
  }
  expect(new Date(allowlist.expires).getTime(), 'and the list has an expiry').toBeGreaterThan(0);
});

it('a standard added to the registry with no install, index, skill, check or call fails the matrix by name, and the same registry without it is green (XSPEC-458 R4)', () => {
  const control = run(['--registry', registryWith()]);
  expect(control.code, 'control: the registry copy without the probe is green').toBe(0);

  const red = run(['--registry', registryWith(ORPHAN_PROBE)]);
  expect(red.code, red.out).toBe(1);
  expect(red.stdout).toContain('orphan standard, not allowlisted: zz-orphan-probe');
  expect(red.stdout, 'and it names nobody else').not.toMatch(/not allowlisted: (?!zz-orphan-probe)/);

  // Allowlisting it with a reason and an owner makes it green: the register is the only way through.
  const al = readJson(ALLOWLIST);
  al.standards.push({ id: 'zz-orphan-probe', reason: 'test: pretend this is accepted debt for now', owner: 'test: the person who decides at expiry' });
  const green = run(['--registry', registryWith(ORPHAN_PROBE), '--allowlist', writeJson('allowlist.json', al)]);
  expect(green.code, green.out).toBe(0);
});

it('ONE filled column is enough: a registry standard that has a skill, one that has a check, and one a workflow names are not orphans (XSPEC-458 R4)', () => {
  const wrappedBySkill = { ...ORPHAN_PROBE, id: 'zz-probe-skill', skillName: 'plan', source: { human: 'core/zz-probe-skill.md', ai: 'ai/standards/zz-probe-skill.ai.yaml' } };
  // `plan` is a real folder under skills/ (column c); the file names are made up, so nothing else holds it.
  const r = run(['--registry', registryWith(wrappedBySkill)]);
  expect(r.code, r.out).toBe(0);
  expect(r.stdout).not.toContain('zz-probe-skill');

  // A workflow that names the standard's file is a call (column e): `ci.yml` is named by another workflow.
  // Control: the same shape with a file name nobody mentions is an orphan, so the arm below can tell them apart.
  const nobodyNamesIt = { ...ORPHAN_PROBE, id: 'zz-probe-unnamed', source: 'zz-nobody-names-this.yml' };
  const unnamed = run(['--registry', registryWith(nobodyNamesIt)]);
  expect(unnamed.code, unnamed.out).toBe(1);
  expect(unnamed.stdout).toContain('orphan standard, not allowlisted: zz-probe-unnamed');
  const namedByWorkflow = { ...ORPHAN_PROBE, id: 'zz-probe-ci', source: 'ci.yml' };
  const viaCi = run(['--registry', registryWith(namedByWorkflow)]);
  expect(viaCi.code, viaCi.out).toBe(0);
  expect(viaCi.stdout).not.toContain('zz-probe-ci');
});

it('an allowlist entry that is no longer a finding, one without a reason, and an expired list each fail the matrix (XSPEC-458 R4)', () => {
  const base = readJson(ALLOWLIST);

  // Stale: a standard that IS reached (installed by init, indexed, wrapped) is on the list. A check that was
  // weakened until it finds nothing would leave every entry looking like this one.
  const stale = { ...base, standards: [...base.standards, { id: 'anti-hallucination', reason: 'test: it should not be here', owner: 'test: nobody' }] };
  const staleRun = run(['--allowlist', writeJson('stale.json', stale)]);
  expect(staleRun.code, staleRun.out).toBe(1);
  expect(staleRun.stdout).toContain('allowlist entry is no longer an orphan (remove it): anti-hallucination');

  // Unexplained: an entry with no reason is not a decision.
  const noReason = { ...base, standards: base.standards.map((e, i) => (i === 0 ? { ...e, reason: '' } : e)) };
  const noReasonRun = run(['--allowlist', writeJson('no-reason.json', noReason)]);
  expect(noReasonRun.code, noReasonRun.out).toBe(1);
  expect(noReasonRun.stdout).toContain(`allowlist standard "${base.standards[0].id}" has no real reason`);

  // Expired: a list with no clock is a polite delete key.
  const expired = run(['--today', '2027-01-01']);
  expect(expired.code, expired.out).toBe(1);
  expect(expired.stdout).toContain(`allowlist expired on ${base.expires}`);
});

it('a check-* script that nothing calls fails the matrix by name, and is green once a workflow calls it (XSPEC-458 R4)', () => {
  // The script's evidence root is a throwaway repo layout, so the real tree is never touched.
  const root = mkdtempSync(join(scratch, 'root-'));
  mkdirSync(join(root, 'scripts'), { recursive: true });
  mkdirSync(join(root, '.github', 'workflows'), { recursive: true });
  mkdirSync(join(root, 'ai', 'standards'), { recursive: true });
  writeFileSync(join(root, 'scripts', 'check-zz-probe.sh'), '#!/bin/sh\nexit 0\n');
  writeFileSync(join(root, 'scripts', 'check-zz-called.sh'), '#!/bin/sh\nexit 0\n');
  writeFileSync(join(root, '.github', 'workflows', 'ci.yml'), 'jobs:\n  a:\n    steps:\n      - run: bash scripts/check-zz-called.sh\n');
  // One standard that is not an orphan (it declares a physical_spec), so only the check command is in question.
  writeFileSync(join(root, 'ai', 'standards', 'zz-std.ai.yaml'), 'physical_spec:\n  type: file\n');
  const registry = writeJson('mini-registry.json', {
    standards: [{ id: 'zz-std', name: 'x', category: 'reference', source: { human: 'core/zz-std.md', ai: 'ai/standards/zz-std.ai.yaml' }, description: 'x' }]
  });
  const empty = writeJson('empty-allowlist.json', { expires: '2099-01-01', standards: [], checkCommands: [] });

  const red = run(['--root', root, '--registry', registry, '--allowlist', empty]);
  expect(red.code, red.out).toBe(1);
  expect(red.stdout).toContain('check command nobody calls, not allowlisted: check-zz-probe');
  expect(red.stdout, 'the one that IS called is not named').not.toContain('not allowlisted: check-zz-called');
  expect(red.stdout, 'and the standard with a check is not an orphan').not.toContain('orphan standard, not allowlisted');

  writeFileSync(join(root, '.github', 'workflows', 'ci.yml'), 'jobs:\n  a:\n    steps:\n      - run: bash scripts/check-zz-called.sh\n      - run: bash scripts/check-zz-probe.sh\n');
  const green = run(['--root', root, '--registry', registry, '--allowlist', empty]);
  expect(green.code, green.out).toBe(0);
});

it('the matrix exits 2, not 0 or 1, when it cannot measure: an unreadable registry, an unreadable allowlist (XSPEC-458 R4)', () => {
  const noRegistry = run(['--registry', join(scratch, 'no-such-registry.json')]);
  expect(noRegistry.code, noRegistry.out).toBe(2);
  expect(noRegistry.stderr).toContain('CANNOT MEASURE');

  const noAllowlist = run(['--allowlist', join(scratch, 'no-such-allowlist.json')]);
  expect(noAllowlist.code, noAllowlist.out).toBe(2);
  expect(noAllowlist.stderr).toContain('CANNOT MEASURE');
});
