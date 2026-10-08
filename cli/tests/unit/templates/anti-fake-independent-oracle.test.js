/**
 * XSPEC-470 R1: the shipped anti-fake-test scanner names a test whose expected value is not independent
 * of the code under test (the same call on both sides; an expected value recomputed from the same input
 * with reduce/map/filter), and spares the look-alikes (a literal expected value, a different input, a
 * comparison the test is named for, a before/after check).
 *
 * Every test here runs the REAL script as a process, from a throwaway project, and reads its report back
 * (`--json`, plus the text a developer sees) — the way an adopter or `uds check` runs it. None of them relies
 * on state left by another test, so each can be run alone by its full name.
 *
 * The second half is the mutation arms: a copy of the script with one rule weakened (or one guard removed) is
 * run on the same samples. Each copy is built by an exact, once-only string replacement that is checked to have
 * changed the file (a replacement that silently matches nothing proves nothing), and each must be CAUGHT —
 * by the scanner's own self-test, and, with the self-test switched off, by the samples alone.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

const REPO = resolve(import.meta.dirname, '../../../..');
const GATE = join(REPO, 'templates/gates/check-anti-fake-tests.mjs');
const GATE_SOURCE = readFileSync(GATE, 'utf8');

const dirs = [];
afterEach(() => { while (dirs.length > 0) rmSync(dirs.pop(), { recursive: true, force: true }); });

function project(files) {
  const dir = mkdtempSync(join(tmpdir(), 'uds-xspec470-'));
  dirs.push(dir);
  for (const [rel, text] of Object.entries(files)) {
    const abs = join(dir, rel);
    mkdirSync(join(abs, '..'), { recursive: true });
    writeFileSync(abs, text);
  }
  return dir;
}

function run(dir, script = GATE, args = ['--json']) {
  const r = spawnSync(process.execPath, [script, ...args], { cwd: dir, encoding: 'utf8', timeout: 60000 });
  let json = null;
  if (args.includes('--json') && r.status !== 2) { try { json = JSON.parse(r.stdout); } catch { json = null; } }
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, json };
}

/** Tests the scanner must name, keyed by the test name (the name is what the report shows). */
const RED = {
  'red: both sides call total with items': "expect(calculateTotal(items)).toBe(calculateTotal(items));",
  'red: expected value is a reduce over the same input': "expect(calculateTotal(items)).toBe(items.reduce((sum, item) => sum + item.price, 0));",
  'red: expected value is a map over the same input': "expect(namesOf(users)).toEqual(users.map((u) => u.name));",
  'red: the reduce is held in a constant first': "const expected = items.reduce((sum, item) => sum + item.price, 0);\n  expect(calculateTotal(items)).toBe(expected);",
  'red: node assert with a filter over the same input': "assert.deepStrictEqual(activeOf(accounts), accounts.filter((a) => a.active));",
  'red: the call is split over several lines': "expect(\n    calculateTotal(items),\n  ).toBe(\n    calculateTotal(items),\n  );"
};

/** Look-alikes the scanner must leave alone. */
const GREEN = {
  'green: a literal expected value': "expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);",
  'green: one function with different arguments': "expect(calculateTotal(first)).toBe(calculateTotal(second));",
  'green: a reduce over some other input': "expect(calculateTotal(cart)).toBe(items.reduce((sum, item) => sum + item.price, 0));",
  'green: a test named for comparing two calls is deterministic': "expect(calculateTotal(items)).toBe(calculateTotal(items));",
  'green: nothing changed after the action': "const before = snapshot(dir);\n  preview(dir);\n  expect(snapshot(dir)).toEqual(before);",
  'green: a literal assertion sits beside the self-comparison': "expect(calculateTotal(items)).toBe(calculateTotal(items));\n  expect(calculateTotal([])).toBe(0);",
  'green: negated': "expect(calculateTotal(first)).not.toBe(calculateTotal(first));",
  'green: two constructor calls compared as value objects': "expect(new Money(5)).toEqual(new Money(5));",
  'green: a call with no argument has no input to recompute from': "expect(getInstance()).toBe(getInstance());"
};

const body = (sets) => sets.map((set) => Object.entries(set).map(([name, code]) => `it(${JSON.stringify(name)}, () => {\n  ${code}\n});\n`).join('\n')).join('\n');
const redProject = () => project({ 'tests/red.test.js': body([RED]) });
const greenProject = () => project({ 'tests/green.test.js': body([GREEN]) });
const mixedProject = () => project({ 'tests/red.test.js': body([RED]), 'tests/green.test.js': body([GREEN]) });

describe('check-anti-fake-tests (XSPEC-470 R1): an expected value that is not independent of the code under test', () => {
  it('the scanner names a test whose expected value is the same call or is recomputed from the same input, and spares a literal expected value (XSPEC-470 R1)', () => {
    const dir = mixedProject();
    const r = run(dir);
    expect(r.status, `stderr: ${r.stderr}`).toBe(1);
    const named = r.json.findings.map((f) => f.name).sort();
    expect(named).toEqual(Object.keys(RED).sort());
    for (const f of r.json.findings) {
      expect(f.rule).toBe('tautology');
      expect(f.file).toBe('tests/red.test.js');
      expect(f.detail).toMatch(/not independent of the code under test/);
      expect(f.detail).toMatch(/verification-oracle/);
    }
    // read-back: the assertion lines point into the file, at the assertion
    const lines = readFileSync(join(dir, 'tests/red.test.js'), 'utf8').split('\n');
    for (const f of r.json.findings) {
      expect(f.assertions.length).toBeGreaterThan(0);
      for (const a of f.assertions) expect(lines[a.line - 1], `${f.name}: line ${a.line}`).toMatch(/expect|assert/);
    }
    const form = (name) => r.json.findings.find((f) => f.name === name).forms;
    expect(form('red: both sides call total with items')).toEqual(['same-call']);
    expect(form('red: expected value is a reduce over the same input')).toEqual(['recomputed']);
    expect(form('red: the reduce is held in a constant first')).toEqual(['recomputed']);
  });

  it('the text a developer sees names the test and the reason, and the look-alikes are silent (XSPEC-470 R1)', () => {
    const red = run(redProject(), GATE, []);
    expect(red.status).toBe(1);
    expect(red.stdout).toContain('tautology  "red: both sides call total with items"');
    expect(red.stdout).toContain('the expected value is the same call as the code under test (same function, same arguments)');
    expect(red.stdout).toContain('recomputed from the same input as the code under test (reduce/map/filter)');
    const green = run(greenProject(), GATE, []);
    expect(green.status, green.stdout).toBe(0);
    expect(green.stdout).toContain('RESULT: no fake tests found among the files scanned');
  });

  it('a project of look-alikes only is clean: exit 0 and no finding (XSPEC-470 R1)', () => {
    const r = run(greenProject());
    expect(r.status, r.stdout).toBe(0);
    expect(r.json.findings).toEqual([]);
    expect(r.json.cases).toBe(Object.keys(GREEN).length);
  });

  it('the old rule still holds beside the new ones: expect(true).toBe(true) is named with its old reason (XSPEC-470 R1)', () => {
    const dir = project({ 'tests/old.test.js': "it('old shape', () => { expect(true).toBe(true); });\n" });
    const r = run(dir);
    expect(r.status).toBe(1);
    expect(r.json.findings).toHaveLength(1);
    expect(r.json.findings[0]).toMatchObject({ rule: 'tautology', name: 'old shape', detail: 'its only assertion(s) can never fail' });
    expect(r.json.findings[0].forms).toBeUndefined();
  });

  it('TypeScript test files are judged the same way, generic reduce included (XSPEC-470 R1)', () => {
    const dir = project({
      'tests/cart.test.ts': "it('totals', () => {\n  expect(calculateTotal(items)).toBe(items.reduce<number>((sum, i) => sum + i.price, 0));\n});\n"
    });
    const r = run(dir);
    expect(r.status).toBe(1);
    expect(r.json.findings.map((f) => f.name)).toEqual(['totals']);
  });
});

describe('check-anti-fake-tests (XSPEC-470 R1): mutation arms — a weakened copy of the scanner is caught', () => {
  /** [label, exact text in the script, replacement, which project shows it with the self-test off, what must differ] */
  const MUTANTS = [
    ['arguments are not compared (only the function name)',
      "if (rawL === rawR && callsWithArguments(rawL)) {",
      "if (rawL.split('(')[0] === rawR.split('(')[0] && callsWithArguments(rawL)) {",
      'green', 'a look-alike is wrongly named'],
    ['a name set earlier is trusted as "the same call" (the before/after mistake the first measurement found)',
      "if (rawL === rawR && callsWithArguments(rawL)) {",
      "const lr = resolveOnce(rawL, rawL, constants).expr; const rr = resolveOnce(rawR, rawR, constants).expr; if (lr === rr && callsWithArguments(lr)) {",
      'green', 'a look-alike is wrongly named'],
    ['only reduce is recognised (map, flatMap and filter are missed)',
      "(?:reduce|reduceRight|map|flatMap|filter)",
      "(?:reduce|reduceRight)",
      'red', 'a red sample is missed'],
    ['the deliberate-comparison name is ignored',
      "if (!DELIBERATE_COMPARISON_NAME.test(testName)) hits.push({ form: 'same-call', offset });",
      "hits.push({ form: 'same-call', offset });",
      'green', 'a look-alike is wrongly named'],
    ['a negated matcher is judged like a plain one',
      "/^\\s*\\.\\s*(?:(?:toBe|toEqual|toStrictEqual)|to",
      "/^\\s*\\.\\s*(?:not\\s*\\.\\s*)?(?:(?:toBe|toEqual|toStrictEqual)|to",
      'green', 'a look-alike is wrongly named'],
    ['the detector is never consulted (the wiring is cut)',
      "taut += detectors.count(family, ncBody, nsBody, c.name);",
      "",
      'red', 'a red sample is missed']
  ];
  const SELF_TEST_OFF = ['const bad = selfTest();', 'const bad = [];'];

  function mutate(label, from, to, extra = []) {
    let text = GATE_SOURCE;
    for (const [a, b] of [[from, to], ...extra]) {
      const count = text.split(a).length - 1;
      expect(count, `${label}: the text to replace must occur exactly once, found ${count}: ${a}`).toBe(1);
      text = text.replace(a, () => b);
    }
    expect(text, `${label}: the mutation must change the script`).not.toBe(GATE_SOURCE);
    const dir = mkdtempSync(join(tmpdir(), 'uds-xspec470-mutant-'));
    dirs.push(dir);
    const file = join(dir, 'check-anti-fake-tests.mjs');
    writeFileSync(file, text);
    return file;
  }

  it('control: the unmutated script gives the expected verdicts on the same samples', () => {
    expect(run(redProject()).json.findings).toHaveLength(Object.keys(RED).length);
    expect(run(greenProject()).json.findings).toHaveLength(0);
  });

  for (const [label, from, to, shows, differs] of MUTANTS) {
    it(`weakened — ${label} — is stopped by the scanner's own self-test`, () => {
      const file = mutate(label, from, to);
      const r = run(redProject(), file);
      expect(r.status, `a weakened scanner must not run as if it were whole: ${r.stdout}`).toBe(2);
      expect(r.stderr).toContain('failed its own self-test');
    });

    it(`weakened — ${label} — with the self-test off, the samples alone show it (${differs})`, () => {
      const file = mutate(label, from, to, [SELF_TEST_OFF]);
      if (shows === 'green') {
        const r = run(greenProject(), file);
        expect(r.status, 'the look-alikes must now be reported, otherwise the samples do not guard this rule').toBe(1);
        expect(r.json.findings.length).toBeGreaterThan(0);
      } else {
        const r = run(redProject(), file);
        const named = (r.json ? r.json.findings : []).map((f) => f.name);
        expect(named.length, 'the mutant must miss at least one red sample').toBeLessThan(Object.keys(RED).length);
      }
    });
  }
});
