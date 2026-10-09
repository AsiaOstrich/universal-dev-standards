/**
 * E2E: the acceptance step `init-locale-pack-missing-is-said` works on a source checkout that has been through `prepack`, not only on a
 * published package (dev-platform XSPEC-471 R5, the step fix of the hand-over).
 *
 * What went wrong: the step builds "a copy of UDS without the zh-TW skill texts" and decided between a published package and a source
 * checkout by asking whether `<pkg>/bundled` exists. A source checkout has `cli/bundled/` too once `npm run prepack` has run (it is
 * git-ignored, so every maintainer's checkout has it), so `run.mjs --local-bin cli/bin/uds.js` took the published-package branch, put the
 * copy in the repository root, and the copy found `<repo>/locales/zh-TW` through the development fallback of `skills-installer.js`: the pack
 * was not missing, `init` installed Chinese skills and the step failed. A published package has no `locales/` beside it in `node_modules/`,
 * so the three platforms of the published beta passed.
 *
 * The tests start `run.mjs --local-bin` on a throwaway source checkout laid out like a maintainer's: `cli/` (copied, with an empty `bundled/`
 * and the dependencies linked) beside links to the other folders of this repository, `locales/` included.
 *
 * - green: the step passes on that layout;
 * - control: the step as it was before the fix fails on the same layout (the layout does reproduce the problem);
 * - cut: with the printing of "the pack is missing" taken out of the copy of `cli/`, the step fails (the step watches the behaviour, in this mode too).
 *
 * POSIX only: the layout is made of symbolic links. On Windows these tests skip themselves and are counted as skipped.
 *
 * Wire that makes the cut test red when cut (one line of source):
 *   cli/src/utils/skills-installer.js   printLocalePackMissing(locale);
 */

import { it, expect, afterAll } from 'vitest';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ACCEPT_DIR, REPO, runAcceptance, scratch, weaken } from '../utils/xspec-469.js';

const tmp = scratch('uds-xspec471-r5-locale-');
afterAll(() => tmp.cleanup());

const STEP = 'init-locale-pack-missing-is-said';
const FIXED_TEST = "if (!fs.existsSync(path.join(path.dirname(pkg), 'locales', 'zh-TW'))) {";
const OLD_TEST = "if (fs.existsSync(path.join(pkg, 'bundled'))) {";

/** A source checkout as a maintainer has it after `prepack`: cli/ (own copy, `bundled/` present, dependencies linked) beside links to the other folders. */
function sourceCheckout() {
  const repo = tmp.next('repo');
  const cli = join(repo, 'cli');
  mkdirSync(join(cli, 'bundled'), { recursive: true });
  for (const d of ['bin', 'src']) cpSync(join(REPO, 'cli', d), join(cli, d), { recursive: true });
  for (const f of ['package.json', 'standards-registry.json']) cpSync(join(REPO, 'cli', f), join(cli, f));
  symlinkSync(join(REPO, 'cli', 'node_modules'), join(cli, 'node_modules'), 'dir');
  for (const name of readdirSync(REPO)) {
    if (['cli', '.git', 'node_modules'].includes(name)) continue;
    symlinkSync(join(REPO, name), join(repo, name));
  }
  return { repo, cli, bin: join(cli, 'bin', 'uds.js') };
}

/** A copy of steps.json whose step has the given decision text in its prepare script. */
function stepsWith(from, to) {
  const file = tmp.next('steps.json');
  const doc = JSON.parse(readFileSync(join(ACCEPT_DIR, 'steps.json'), 'utf-8'));
  const step = doc.steps.find((s) => s.id === STEP);
  expect(step, `control: steps.json has ${STEP}`).toBeTruthy();
  const script = step.prepare[0].content;
  expect(script, 'control: the step carries the decision this test is about').toContain(from);
  step.prepare[0].content = script.replace(from, () => to);
  writeFileSync(file, JSON.stringify(doc, null, 2));
  return file;
}

const runStep = (bin, extra = []) => runAcceptance(['--local-bin', bin, '--only', STEP, '--non-interactive', ...extra], { outDir: tmp.next('out'), timeout: 240000 });
const result = (r) => r.reports()[0]?.json?.steps?.find((s) => s.id === STEP);

it('on a source checkout that has been through prepack (cli/bundled exists) the step passes with --local-bin (XSPEC-471 R5)', (ctx) => {
  if (process.platform === 'win32') ctx.skip();
  const { bin, cli } = sourceCheckout();
  expect(existsSync(join(cli, 'bundled')), 'control: the layout has cli/bundled, the thing that fooled the step').toBe(true);
  expect(existsSync(join(cli, '..', 'locales', 'zh-TW')), 'control: and the zh-TW pack is reachable from it, as in a real checkout').toBe(true);
  const r = runStep(bin);
  expect(r.code, r.out.slice(-2000)).toBe(0);
  expect(result(r), r.out.slice(-1500)).toMatchObject({ status: 'pass', exitCode: 0 });
  expect(result(r).output).toContain('The zh-TW skill texts are not in this copy of UDS');
  expect(result(r).output).toContain('CHINESE-SKILL-TEXT=false');
}, 300000);

it('the step as it was before the fix fails on the same layout: the layout reproduces the original problem (XSPEC-471 R5)', (ctx) => {
  if (process.platform === 'win32') ctx.skip();
  const { bin } = sourceCheckout();
  const r = runStep(bin, ['--steps', stepsWith(FIXED_TEST, OLD_TEST)]);
  expect(r.code, r.out.slice(-1500)).toBe(1);
  expect(result(r).status).toBe('fail');
  expect(result(r).output, 'it installed the Chinese texts: the pack was not missing for that copy').toContain('CHINESE-SKILL-TEXT=true');
}, 300000);

it('with the line that tells the adopter the pack is missing cut out of cli/src, the step fails in --local-bin mode (XSPEC-471 R5)', (ctx) => {
  if (process.platform === 'win32') ctx.skip();
  const { bin, cli } = sourceCheckout();
  weaken(join(cli, 'src', 'utils', 'skills-installer.js'),
    '  if (uniqueInstallations.length > 0 && !isLocalePackAvailable(locale)) {\n    results.localePackMissing = true;\n    printLocalePackMissing(locale);',
    '  if (false) {\n    results.localePackMissing = true;\n    printLocalePackMissing(locale);');
  const r = runStep(bin);
  expect(r.code, r.out.slice(-1500)).toBe(1);
  expect(result(r).status).toBe('fail');
  expect(result(r).output).not.toContain('The zh-TW skill texts are not in this copy of UDS');
}, 300000);
