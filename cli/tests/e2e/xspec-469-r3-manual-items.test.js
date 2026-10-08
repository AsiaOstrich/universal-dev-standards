/**
 * E2E: a step that needs a person's eyes is recorded apart and is never counted as passed
 * (dev-platform XSPEC-469 R3).
 *
 * Examples from the spec: a cp950 console showing Chinese, a warning under Git Bash. The program shows what to look
 * at and asks y/n (or reads an `--answers` file); no answer is "unconfirmed". The tests start the real program
 * with a fake package and read back the exit code, the counts and both reports. The interactive question is
 * exercised in-process, because a child process in a test has no terminal to answer at.
 *
 * Wire that makes these red when cut (one line of source):
 *   scripts/beta-acceptance/lib/execute.mjs   if (answer === 'yes') status = 'human-confirmed';
 */

import { it, expect, afterAll } from 'vitest';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { runSteps } from '../../../scripts/beta-acceptance/lib/execute.mjs';
import { copyProgram, runAcceptance, scratch, weaken, writeInstaller, writeSteps } from '../utils/xspec-469.js';
import { spawnSync } from 'child_process';

const tmp = scratch('uds-xspec469-r3-');
afterAll(() => tmp.cleanup());

const AUTO = { id: 'automatic', title: 'an automatic step', uds: ['echo', 'fine'], expect: { contains: ['fine'] } };
const MANUAL = {
  id: 'looks-right', title: 'a step that needs a person', uds: ['echo', 'text to look at'], expect: { contains: ['text to look at'] },
  human: { prompt: 'Is the text readable?', promptZh: '文字能閱讀嗎？' },
};
const installer = () => writeInstaller(tmp.next('installer.mjs'));
const run = (steps, extra = []) => {
  const outDir = tmp.next('out');
  const r = runAcceptance(['--installer', installer(), '--steps', writeSteps(tmp.next('steps.json'), steps), '--non-interactive', ...extra], { outDir });
  return { r, report: r.reports()[0] };
};

it('with no answer a manual step is recorded as unconfirmed, is not counted as passed, is listed in the report, and the run still exits 0 because nothing failed (XSPEC-469 R3)', () => {
  const { r, report } = run([AUTO, MANUAL]);
  expect(r.code, r.out).toBe(0);
  const j = report.json;
  expect(j.verdict).toBe('pass_with_unconfirmed');
  expect(j.counts).toMatchObject({ passed: 1, humanConfirmed: 0, humanUnconfirmed: 1, failed: 0 });
  const manual = j.steps.find((s) => s.id === 'looks-right');
  expect(manual.status).toBe('unconfirmed');
  expect(manual.human).toMatchObject({ prompt: 'Is the text readable?', answer: 'none' });
  expect(report.md).toContain('manual NOT confirmed 1');
  expect(report.md).toContain('## Waiting for a person');
  expect(report.md).toContain('`looks-right` — Is the text readable? | 文字能閱讀嗎？');
  expect(r.stdout).toContain('manual NOT confirmed 1');
});

it('a run whose only step is an unanswered manual step passes nothing and exits 3, so unconfirmed can never add up to a pass (XSPEC-469 R3)', () => {
  const { r, report } = run([MANUAL]);
  expect(r.code, r.out).toBe(3);
  expect(report.json.verdict).toBe('no-steps');
  expect(report.json.counts).toMatchObject({ passed: 0, humanUnconfirmed: 1 });
});

it('--answers turns "yes" into a confirmed step and "no" into a failure, and an answer that is neither stays unconfirmed (XSPEC-469 R3)', () => {
  const answered = (value) => {
    const file = tmp.next('answers.json');
    writeFileSync(file, JSON.stringify({ 'looks-right': value }));
    return run([AUTO, MANUAL], ['--answers', file]);
  };

  const yes = answered('yes');
  expect(yes.r.code, yes.r.out).toBe(0);
  expect(yes.report.json.verdict).toBe('pass');
  expect(yes.report.json.counts).toMatchObject({ passed: 1, humanConfirmed: 1, humanUnconfirmed: 0 });
  expect(yes.report.json.steps.find((s) => s.id === 'looks-right').status).toBe('human-confirmed');

  const no = answered('no');
  expect(no.r.code, no.r.out).toBe(1);
  expect(no.report.json.verdict).toBe('fail');
  expect(no.report.json.steps.find((s) => s.id === 'looks-right').failures).toEqual(['a person looked at it and said it is not right']);

  const maybe = answered('maybe');
  expect(maybe.r.code, maybe.r.out).toBe(0);
  expect(maybe.report.json.steps.find((s) => s.id === 'looks-right').status).toBe('unconfirmed');
  expect(maybe.report.json.counts.humanUnconfirmed).toBe(1);
});

it('a manual step whose command already failed is a failure, whatever the answer file says (XSPEC-469 R3)', () => {
  const broken = { ...MANUAL, uds: ['exit', '5'], expect: { contains: ['exiting'] } };
  const file = tmp.next('answers.json');
  writeFileSync(file, JSON.stringify({ 'looks-right': 'yes' }));
  const { r, report } = run([AUTO, broken], ['--answers', file]);
  expect(r.code, r.out).toBe(1);
  const step = report.json.steps.find((s) => s.id === 'looks-right');
  expect(step.status).toBe('fail');
  expect(step.human, 'nobody was asked about a command that already failed').toBeUndefined();
});

it('in a terminal the program asks after the command passed: y is human-confirmed, n is a failure, an empty line is unconfirmed, and nothing is asked about a command that failed (XSPEC-469 R3)', async () => {
  const pkg = join(tmp.dir, 'pkg');
  mkdirSync(join(pkg, 'bin'), { recursive: true });
  writeFileSync(join(pkg, 'package.json'), JSON.stringify({ name: 'universal-dev-standards', version: '1.0.0' }));
  writeFileSync(join(pkg, 'bin', 'uds.js'), "console.log(process.argv.slice(2).join(' ')); if (process.argv[2] === 'fail') process.exit(2);\n");
  const steps = [
    ...['one', 'two', 'three'].map((id) => ({ platform: 'all', ...MANUAL, id, uds: ['echo', id], expect: { contains: [id] } })),
    { platform: 'all', ...MANUAL, id: 'four', uds: ['fail'], expect: { contains: ['fail'] } },
  ];
  const replies = { one: 'y', two: 'n', three: '' };
  const seen = [];
  const sandbox = join(tmp.dir, 'interactive');
  mkdirSync(sandbox, { recursive: true });
  const results = await runSteps({
    steps, sandbox, binPath: join(pkg, 'bin', 'uds.js'), pkgDir: pkg, platform: 'linux', answers: {},
    ask: async (step, runResult) => { seen.push([step.id, runResult.stdout.trim()]); return replies[step.id]; },
  });
  expect(results.map((r) => [r.id, r.status])).toEqual([['one', 'human-confirmed'], ['two', 'fail'], ['three', 'unconfirmed'], ['four', 'fail']]);
  // the person was shown what each command printed, and was not asked about the one whose command failed
  expect(seen).toEqual([['one', 'echo one'], ['two', 'echo two'], ['three', 'echo three']]);
});

it('weakening the program turns these tests red: counting an unconfirmed step as passed, or letting "no" pass, is caught (XSPEC-469 R3)', () => {
  const holds = (root) => {
    const exit = (answersObj) => {
      const steps = writeSteps(tmp.next('steps.json'), [MANUAL]);
      const args = ['--installer', installer(), '--steps', steps, '--non-interactive', '--out', tmp.next('out')];
      if (answersObj) {
        const file = tmp.next('answers.json');
        writeFileSync(file, JSON.stringify(answersObj));
        args.push('--answers', file);
      }
      return spawnSync(process.execPath, [join(root, 'run.mjs'), ...args], { encoding: 'utf-8', cwd: tmp.dir }).status;
    };
    // nobody answered -> nothing passed -> 3; "no" -> 1
    return exit(null) === 3 && exit({ 'looks-right': 'no' }) === 1;
  };
  const real = copyProgram(tmp.next('real'));
  expect(holds(real), 'control').toBe(true);

  const countsUnconfirmed = copyProgram(tmp.next('counts-unconfirmed'));
  weaken(join(countsUnconfirmed, 'lib', 'execute.mjs'), "else status = 'unconfirmed';", "else status = 'human-confirmed';");
  expect(holds(countsUnconfirmed), 'unanswered treated as confirmed').toBe(false);

  const noPasses = copyProgram(tmp.next('no-passes'));
  weaken(join(noPasses, 'lib', 'execute.mjs'), "else if (answer === 'no') { status = 'fail'; failures.push('a person looked at it and said it is not right'); }", "else if (answer === 'no') { status = 'human-confirmed'; }");
  expect(holds(noPasses), '"no" treated as confirmed').toBe(false);
});
