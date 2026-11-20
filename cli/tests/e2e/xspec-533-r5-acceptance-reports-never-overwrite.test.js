/**
 * E2E: two acceptance runs that finish in the same second do not overwrite each other's report
 * (dev-platform XSPEC-533 R5).
 *
 * Found on a real Windows machine (6.16.0-beta.2): two shells finished at the same UTC second (07:54:23), the
 * report name had the version, the platform and that second - not the label - so the second report replaced the
 * first. The report is the evidence of the run; losing one silently is worse than a clash that is said out loud.
 *
 * `node scripts/beta-acceptance/run.mjs` is the entry; every test starts it as a person would, in a child
 * process, and reads back the report files it wrote. The package under test is a fake one (an `--installer`
 * module), so no test touches the network. The clock is frozen for the child by a `--import` module (every
 * `new Date()` with no argument is the same instant), which is how "the same second" is made to happen on
 * purpose instead of by luck.
 *
 * Wires that make these red when cut (one line of source each):
 *   scripts/beta-acceptance/run.mjs   const base = n === 1 ? stem : `${stem}-${n}`; // wire:report-name-has-label-and-never-overwrites
 *   scripts/beta-acceptance/run.mjs   const label = report.label && report.label !== NO_LABEL ? `-${safe(report.label)}` : '';
 */

import { it, expect, afterAll } from 'vitest';
import { writeFileSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import { runAcceptance, scratch, writeInstaller, writeSteps } from '../utils/xspec-469.js';

const tmp = scratch('uds-xspec533-r5-');
afterAll(() => tmp.cleanup());

const installer = writeInstaller(tmp.next('installer.mjs'), '1.2.3');

/** A module for `node --import`: every `new Date()` and `Date.now()` in the child is the same instant. */
const freeze = tmp.next('freeze-clock.mjs');
writeFileSync(freeze, `
const RealDate = Date;
const FIXED = RealDate.UTC(2026, 10, 20, 7, 54, 23);
class FrozenDate extends RealDate {
  constructor(...args) { if (args.length === 0) super(FIXED); else super(...args); }
  static now() { return FIXED; }
}
globalThis.Date = FrozenDate;
`);
const FROZEN_ENV = { NODE_OPTIONS: `--import=${pathToFileURL(freeze).href}` };

const TWO_STEPS = [
  { id: 'prints-version', title: 'prints its version', uds: ['--version'], expect: { contains: ['1.2.3'] } },
  { id: 'echoes', title: 'echoes text', uds: ['echo', 'hello acceptance'], expect: { contains: ['hello acceptance'] } },
];
const ONE_STEP = TWO_STEPS.slice(0, 1);

function run(outDir, label, stepList) {
  const steps = writeSteps(tmp.next('steps.json'), stepList);
  const r = runAcceptance(['--installer', installer, '--steps', steps, '--version', '1.2.3', '--label', label, '--non-interactive'], { outDir, env: FROZEN_ENV });
  expect(r.code, r.out).toBe(0);
  return r;
}

const names = (dir, ext) => readdirSync(dir).filter((n) => n.endsWith(ext)).sort();
const jsonOf = (dir, name) => JSON.parse(readFileSync(join(dir, name), 'utf-8'));

it('two runs with different labels that finish in the same second leave both reports (.md and .json), each named with its label (XSPEC-533 R5)', () => {
  const outDir = tmp.next('out');
  run(outDir, 'win-powershell', TWO_STEPS);
  const r2 = run(outDir, 'win-cmd', ONE_STEP);

  const jsons = names(outDir, '.json');
  const mds = names(outDir, '.md');
  expect(jsons, r2.out).toHaveLength(2);
  expect(mds).toHaveLength(2);

  // Each file is named with its own label, and holds that run (not the other one).
  const ps = jsons.find((n) => n.includes('win-powershell'));
  const cmd = jsons.find((n) => n.includes('win-cmd'));
  expect(ps, jsons.join(', ')).toBeTruthy();
  expect(cmd, jsons.join(', ')).toBeTruthy();
  expect(jsonOf(outDir, ps).label).toBe('win-powershell');
  expect(jsonOf(outDir, ps).counts.planned).toBe(2);
  expect(jsonOf(outDir, cmd).label).toBe('win-cmd');
  expect(jsonOf(outDir, cmd).counts.planned).toBe(1);
  // The .md next to each .json is the same run.
  expect(readFileSync(join(outDir, ps.replace(/\.json$/, '.md')), 'utf-8')).toContain('win-powershell');
  expect(readFileSync(join(outDir, cmd.replace(/\.json$/, '.md')), 'utf-8')).toContain('win-cmd');
});

it('two runs with the SAME label in the same second keep both reports: the second gets a number, the first is untouched (XSPEC-533 R5)', () => {
  const outDir = tmp.next('out');
  run(outDir, 'same-machine', TWO_STEPS);
  const [firstJson] = names(outDir, '.json');
  const firstBefore = readFileSync(join(outDir, firstJson), 'utf-8');
  const r2 = run(outDir, 'same-machine', ONE_STEP);

  const jsons = names(outDir, '.json');
  expect(jsons, r2.out).toHaveLength(2);
  expect(names(outDir, '.md')).toHaveLength(2);
  // The first report is byte for byte what the first run wrote.
  expect(readFileSync(join(outDir, firstJson), 'utf-8')).toBe(firstBefore);
  expect(jsonOf(outDir, firstJson).counts.planned).toBe(2);
  // The second one is the other run, under a different name that ends in a number.
  const second = jsons.find((n) => n !== firstJson);
  expect(second).toMatch(/-2\.json$/);
  expect(jsonOf(outDir, second).counts.planned).toBe(1);
  // The path the run prints back is the file it really wrote.
  expect(r2.out).toContain(second.replace(/\.json$/, '.md'));
});

it('a run with no --label still names its report as before (no label part), and is not overwritten by a second one in the same second (XSPEC-533 R5)', () => {
  const outDir = tmp.next('out');
  const steps = writeSteps(tmp.next('steps.json'), ONE_STEP);
  const args = ['--installer', installer, '--steps', steps, '--version', '1.2.3', '--non-interactive'];
  expect(runAcceptance(args, { outDir, env: FROZEN_ENV }).code).toBe(0);
  expect(runAcceptance(args, { outDir, env: FROZEN_ENV }).code).toBe(0);
  const jsons = names(outDir, '.json');
  expect(jsons).toHaveLength(2);
  expect(jsons.join(' ')).not.toMatch(/no_--label|--label_given/);
  expect(jsons[0]).toMatch(/^uds-beta-acceptance-1\.2\.3-[a-z]+-20261120-075423(-2)?\.json$/);
});
