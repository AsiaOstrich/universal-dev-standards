/**
 * E2E: a step must read back an effect, not only an exit code (dev-platform XSPEC-471 R3).
 *
 * `node scripts/beta-acceptance/check-steps.mjs` is the entry (CI runs it in the job "Beta Acceptance Coverage"). Every test starts
 * it as CI does and reads what it prints and its exit code. The rule itself lives in `lib/steps.mjs` (`validateSteps`), which the
 * runner (`run.mjs`) and the PRE-RELEASE generator read too, so a steps file that fails here is also refused there.
 *
 * - The samples hand the program a CHANGELOG the test writes (it has no Unreleased entry, so only R3 is in play) and a steps file
 *   the test writes: one step that checks only the exit code, one that is a person's step, one that checks only `notContains`,
 *   one with an exemption that has a reason and ones whose reason is missing, blank or one word.
 * - Weakening the check turns the property red: copies of the program with the rule skipped, the person's-step escape put back,
 *   `notContains` counted as an effect, an exemption accepted without a reason, or an exemption never honoured must each fail a
 *   sample the real program passes.
 *
 * Wire that makes these red when cut (one line of source):
 *   scripts/beta-acceptance/lib/coverage.mjs   const schemaErrors = validateSteps(doc);
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ACCEPT_DIR, buildChangelog, copyProgram, scratch, weaken } from '../utils/xspec-469.js';

const tmp = scratch('uds-xspec471-r3-');
afterAll(() => tmp.cleanup());

const CHECK = join(ACCEPT_DIR, 'check-steps.mjs');
const run = (args, script = CHECK) => {
  const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf-8', timeout: 60000 });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, out: `${r.stdout}${r.stderr}` };
};

const writeJson = (name, value) => {
  const file = tmp.next(name);
  writeFileSync(file, JSON.stringify(value, null, 2));
  return file;
};
/** A CHANGELOG with no Unreleased entry and one released entry, so that nothing but the steps file is in question. */
const CHANGELOG = (() => {
  const file = tmp.next('CHANGELOG.md');
  writeFileSync(file, buildChangelog({ released: { Added: ['**The first release of a thing.** It is long enough to be an entry.'] } }));
  return file;
})();

const REASON = 'The output goes to the terminal of the person running the step, so the program cannot read it back.';
const step = (id, extra = {}) => ({ id, title: `step ${id}`, titleZh: `步驟 ${id}`, platform: 'all', smoke: true, changelog: [], uds: ['--version'], expect: { exit: 0 }, ...extra });
const human = { prompt: 'Look at the output.', promptZh: '請看輸出。' };
const check = (steps, exemptions) => run(['--changelog', CHANGELOG, '--steps', writeJson('steps.json', { schema: 1, ...(exemptions ? { exemptions } : {}), steps })]);
const checkWith = (script, steps, exemptions) => run(['--changelog', CHANGELOG, '--steps', writeJson('steps.json', { schema: 1, ...(exemptions ? { exemptions } : {}), steps })], script);

it('the steps file of this repository passes, and the numbers it prints add up: every step reads back an effect or has an exemption that gives a reason (XSPEC-471 R3)', () => {
  const r = run([]);
  expect(r.code, r.out).toBe(0);
  const doc = JSON.parse(readFileSync(join(ACCEPT_DIR, 'steps.json'), 'utf-8'));
  // a different reading from the program's: a step reads back an effect when any of the three keys holds something
  const readsBack = doc.steps.filter((s) => ['contains', 'matches', 'files'].some((k) => ((s.expect || {})[k] || []).length > 0)).length;
  const exitOnly = doc.steps.length - readsBack;
  const exemptSteps = doc.exemptions.filter((x) => typeof x.step === 'string').length;
  expect(exitOnly, 'control: the steps that read back nothing are exactly the ones with a step exemption').toBe(exemptSteps);
  expect(r.stdout).toContain(`R3 effect assertions: ${readsBack} of ${doc.steps.length} step(s) read back output or a file; exit-code-only by an exemption that gives a reason: ${exemptSteps}; exit-code-only without one: 0`);
});

it('a step that checks only an exit code turns the check red and is named; the same step with an output to read back is green (XSPEC-471 R3)', () => {
  const red = check([step('a-weak-step')]);
  expect(red.code, red.out).toBe(1);
  expect(red.stdout).toContain('FAIL steps file: steps[0] (a-weak-step): only an exit code is checked');
  expect(red.stdout).toContain('exit-code-only without one: 1');

  // no `expect` at all is the same
  const noExpect = check([step('no-expect', { expect: undefined })]);
  expect(noExpect.code, noExpect.out).toBe(1);
  expect(noExpect.stdout).toContain('(no-expect): only an exit code is checked');

  // only the weak one is named when there are two steps
  const two = check([step('strong', { expect: { exit: 0, contains: ['1.2.3'] } }), step('weak')]);
  expect(two.code, two.out).toBe(1);
  expect(two.stdout.match(/only an exit code is checked/g)).toHaveLength(1);
  expect(two.stdout).toContain('steps[1] (weak)');

  for (const effect of [{ contains: ['1.2.3'] }, { matches: ['^\\d+'] }, { files: [{ path: 'out.txt', contains: ['x'] }] }]) {
    const green = check([step('read-back', { expect: { exit: 0, ...effect } })]);
    expect(green.code, JSON.stringify(effect) + green.out).toBe(0);
    expect(green.stdout).toContain('R3 effect assertions: 1 of 1 step(s) read back output or a file');
  }
});

it('a step that only says what the output must not contain is not an effect: a command that prints nothing passes it (XSPEC-471 R3)', () => {
  const r = check([step('only-not', { expect: { exit: 0, notContains: ['Error'] } })]);
  expect(r.code, r.out).toBe(1);
  expect(r.stdout).toContain('(only-not): only an exit code is checked');
});

it("a person's step is held to the same rule: it needs an effect or an exemption, being a human step is not one (XSPEC-471 R3)", () => {
  const r = check([step('human-look', { human })]);
  expect(r.code, r.out).toBe(1);
  expect(r.stdout).toContain('(human-look): only an exit code is checked');
});

it('an exemption {"step": ..., "reason": ...} lets a step check only its exit code, is counted as an exemption, and a blank, one-word or missing reason does not (XSPEC-471 R3)', () => {
  const steps = [step('human-look', { human })];
  const green = check(steps, [{ step: 'human-look', reason: REASON }]);
  expect(green.code, green.out).toBe(0);
  expect(green.stdout).toContain('R3 effect assertions: 0 of 1 step(s) read back output or a file; exit-code-only by an exemption that gives a reason: 1; exit-code-only without one: 0');

  for (const bad of [undefined, '', '   ', 'internal', 'n/a']) {
    const r = check(steps, [{ step: 'human-look', ...(bad === undefined ? {} : { reason: bad }) }]);
    expect(r.code, `reason ${JSON.stringify(bad)}: ${r.out}`).toBe(1);
    // both the exemption and the step are named: the step is as red as if there were no exemption
    expect(r.stdout, JSON.stringify(bad)).toContain('(human-look): only an exit code is checked');
    expect(r.stdout, JSON.stringify(bad)).toContain('needs a "reason" of at least 20 characters');
    expect(r.stdout, JSON.stringify(bad)).toContain('exit-code-only without one: 1');
  }
});

it('an exemption for a step that does not exist, or that already reads back an effect, is red, so exemptions cannot pile up (XSPEC-471 R3)', () => {
  const gone = check([step('real', { expect: { contains: ['x'] } })], [{ step: 'no-such-step', reason: REASON }]);
  expect(gone.code, gone.out).toBe(1);
  expect(gone.stdout).toContain('(step "no-such-step") names a step that does not exist');

  const needless = check([step('real', { expect: { contains: ['x'] } })], [{ step: 'real', reason: REASON }]);
  expect(needless.code, needless.out).toBe(1);
  expect(needless.stdout).toContain('(real): has an exemption for checking only an exit code, but it checks output or a file: remove the exemption');
});

it('weakening the check turns the property red: skipping the rule, letting a person\'s step through, counting notContains, accepting an exemption without a reason, or never honouring an exemption each make a copy miss what the real one catches (XSPEC-471 R3)', () => {
  const samples = () => [
    { what: 'an exit-only step is named', steps: [step('weak')], code: 1, says: 'FAIL steps file: steps[0] (weak): only an exit code is checked' },
    { what: "a person's exit-only step is named", steps: [step('human-look', { human })], code: 1, says: '(human-look): only an exit code is checked' },
    { what: 'a notContains-only step is named', steps: [step('only-not', { expect: { exit: 0, notContains: ['Error'] } })], code: 1, says: '(only-not): only an exit code is checked' },
    { what: 'an exemption without a reason leaves the step red', steps: [step('human-look', { human })], exemptions: [{ step: 'human-look', reason: '' }], code: 1, says: '(human-look): only an exit code is checked' },
    { what: 'an exemption with a reason is honoured', steps: [step('human-look', { human })], exemptions: [{ step: 'human-look', reason: REASON }], code: 0, says: 'exit-code-only by an exemption that gives a reason: 1' },
  ];
  const holds = (dir) => samples().filter((s) => {
    const r = checkWith(join(dir, 'check-steps.mjs'), s.steps, s.exemptions);
    return !(r.code === s.code && r.stdout.includes(s.says));
  }).map((s) => s.what);

  const real = copyProgram(tmp.next('real'));
  expect(holds(real), 'control: the unmodified program holds every sample').toEqual([]);

  const weakened = (name, from, to) => {
    const dir = copyProgram(tmp.next(name));
    weaken(join(dir, 'lib', 'steps.mjs'), from, to);
    return holds(dir);
  };
  expect(weakened('skip-r3', 'if (!checks && !exitOnlyOk.has(s.id)) errors.push(', 'if (false && !checks && !exitOnlyOk.has(s.id)) errors.push('), 'the rule is skipped')
    .toEqual(expect.arrayContaining(['an exit-only step is named', "a person's exit-only step is named", 'a notContains-only step is named']));
  expect(weakened('human-escape', 'if (!checks && !exitOnlyOk.has(s.id)) errors.push(', 'if (!checks && !s.human && !exitOnlyOk.has(s.id)) errors.push('), "a person's step is let through")
    .toEqual(expect.arrayContaining(["a person's exit-only step is named"]));
  expect(weakened('count-not-contains', '(e.files || []).length > 0;', '(e.files || []).length + (e.notContains || []).length > 0;'), 'notContains counts as an effect')
    .toEqual(expect.arrayContaining(['a notContains-only step is named']));
  expect(weakened('no-reason', ".filter((x) => x && typeof x.step === 'string' && typeof x.reason === 'string' && x.reason.trim().length >= MIN_REASON_LENGTH)", ".filter((x) => x && typeof x.step === 'string')"), 'an exemption without a reason counts')
    .toEqual(expect.arrayContaining(['an exemption without a reason leaves the step red']));
  expect(weakened('never-honoured', '.map((x) => x.step.trim()));', '.map((x) => x.step.trim()).slice(0, 0));'), 'an exemption is never honoured')
    .toEqual(expect.arrayContaining(['an exemption with a reason is honoured']));
});
