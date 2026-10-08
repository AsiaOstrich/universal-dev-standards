/**
 * E2E: docs/PRE-RELEASE.md is generated from the acceptance list, and "verified on" is filled by reports only
 * (dev-platform XSPEC-469 R5).
 *
 * `node scripts/beta-acceptance/generate-pre-release.mjs` writes two blocks of the document; with `--check` it fails
 * when the file differs from what it would write (CI runs that). The tests start the real program on copies of the
 * document, with report files they write themselves, and read the document back.
 *
 * Wire that makes these red when cut (one line of source):
 *   scripts/beta-acceptance/generate-pre-release.mjs   const { text: next, missing } = generateDocument({ text, doc, blocks, reports, version });
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ACCEPT_DIR, REPO, copyProgram, scratch, weaken } from '../utils/xspec-469.js';

const tmp = scratch('uds-xspec469-r5-');
afterAll(() => tmp.cleanup());

const VERSION = '6.99.0-beta.1';
const GEN = join(ACCEPT_DIR, 'generate-pre-release.mjs');
const run = (args, script = GEN) => {
  const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf-8', timeout: 60000 });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, out: `${r.stdout}${r.stderr}` };
};

const realDoc = () => readFileSync(join(REPO, 'docs', 'PRE-RELEASE.md'), 'utf-8');

/** A copy of the document to write into, and the reports folder next to it. */
function workspace() {
  const dir = tmp.next('ws');
  mkdirSync(join(dir, 'reports', VERSION), { recursive: true });
  const doc = join(dir, 'PRE-RELEASE.md');
  writeFileSync(doc, realDoc());
  return { dir, doc, reports: join(dir, 'reports') };
}

/** A report the way run.mjs writes it, with the parts R5 reads. */
function report(overrides = {}) {
  const base = {
    schema: 1, tool: 'uds-beta-acceptance', finishedAt: '2026-10-09T10:00:00.000Z', verdict: 'pass', label: 'x',
    uds: { version: VERSION, installKind: 'npm-registry' },
    environment: { platform: 'windows', os: { type: 'Windows_NT', release: '10.0.26100' }, node: { version: 'v20.18.0' }, shell: { value: 'Windows PowerShell' } },
    counts: { planned: 50, passed: 49, failed: 0, skipped: 1, humanConfirmed: 0, humanUnconfirmed: 0, executed: 49 },
    steps: [],
  };
  const merged = { ...base, ...overrides };
  for (const k of ['uds', 'environment', 'counts']) merged[k] = { ...base[k], ...(overrides[k] || {}) };
  return merged;
}
const put = (ws, name, value) => writeFileSync(join(ws.reports, VERSION, name), typeof value === 'string' ? value : JSON.stringify(value));
const generate = (ws, extra = []) => run(['--doc', ws.doc, '--reports', ws.reports, '--version', VERSION, ...extra]);
const verifiedBlock = (ws) => /<!-- BETA-ACCEPTANCE-VERIFIED:START[^>]*-->([\s\S]*?)<!-- BETA-ACCEPTANCE-VERIFIED:END -->/.exec(readFileSync(ws.doc, 'utf-8'))[1];
const rowOf = (block, label) => block.split('\n').find((l) => l.startsWith(`| ${label} |`));

it('the document in this repository is what the generator writes from steps.json and the reports: --check passes (XSPEC-469 R5)', () => {
  const r = run(['--check']);
  expect(r.code, r.out).toBe(0);
  expect(r.stdout).toContain('matches steps.json');
  // the list is the generated one: it has the step ids of steps.json and no hand-numbered item 7 about "still open from beta.5"
  const steps = JSON.parse(readFileSync(join(ACCEPT_DIR, 'steps.json'), 'utf-8')).steps;
  const doc = realDoc();
  for (const s of steps) expect(doc, s.id).toContain(`\`${s.id}\``);
});

it('a hand edit inside either generated block makes --check fail, and running the generator puts the block back (XSPEC-469 R5)', () => {
  const ws = workspace();
  expect(run(['--check', '--doc', ws.doc, '--reports', ws.reports, '--version', VERSION]).code, 'control: a fresh copy of the repository document is not up to date for this version, so generate first').toBe(1);
  expect(generate(ws).code).toBe(0);
  expect(generate(ws, ['--check']).code).toBe(0);

  const text = readFileSync(ws.doc, 'utf-8');
  writeFileSync(ws.doc, text.replace('1. `smoke-version`', '1. `smoke-version` (edited by hand)'));
  const red = generate(ws, ['--check']);
  expect(red.code, red.out).toBe(1);
  expect(red.stderr).toContain('Run: node scripts/beta-acceptance/generate-pre-release.mjs');

  writeFileSync(ws.doc, text.replace('| Windows | Not yet verified 尚未驗證 |', '| Windows | Verified 已驗證 |'));
  expect(generate(ws, ['--check']).code, 'a hand-typed "Verified" is red too').toBe(1);

  expect(generate(ws).code).toBe(0);
  expect(readFileSync(ws.doc, 'utf-8')).toBe(text);
});

it('with no report every platform says "Not yet verified 尚未驗證", and no cell says verified (XSPEC-469 R5)', () => {
  const ws = workspace();
  expect(generate(ws).code).toBe(0);
  const block = verifiedBlock(ws);
  for (const label of ['Windows', 'macOS', 'Linux']) {
    expect(rowOf(block, label), label).toMatch(/^\| \w+ \| Not yet verified 尚未驗證 \| no report for 6\.99\.0-beta\.1/);
  }
  expect(block).not.toMatch(/Verified 已驗證/);
});

it('a report fills only its own platform: a Windows pass makes Windows verified and leaves macOS and Linux "not yet verified", with the details taken from the report (XSPEC-469 R5)', () => {
  const ws = workspace();
  put(ws, 'windows.json', report());
  expect(generate(ws).code).toBe(0);
  const block = verifiedBlock(ws);
  expect(rowOf(block, 'Windows')).toBe('| Windows | Verified 已驗證 | Windows_NT 10.0.26100, Node v20.18.0, Windows PowerShell; 49 passed / 0 failed / 1 skipped; 2026-10-09 |');
  expect(rowOf(block, 'macOS')).toContain('Not yet verified 尚未驗證');
  expect(rowOf(block, 'Linux')).toContain('Not yet verified 尚未驗證');
});

it('only a report of the published package, of this version, that tested something, counts as verified: a failed run, an unconfirmed manual item, a run from a local bin, another version and a run that passed nothing are each shown for what they are (XSPEC-469 R5)', () => {
  const cell = (r) => {
    const ws = workspace();
    put(ws, 'one.json', r);
    expect(generate(ws).code).toBe(0);
    return rowOf(verifiedBlock(ws), 'Windows');
  };
  expect(cell(report({ verdict: 'fail', counts: { failed: 3 } }))).toContain('Failed 有失敗：3 step(s) 步');
  expect(cell(report({ verdict: 'fail', counts: { failed: 3 } }))).not.toContain('Verified 已驗證');
  expect(cell(report({ verdict: 'pass_with_unconfirmed', counts: { humanUnconfirmed: 2 } }))).toContain('Automated steps passed; 2 manual item(s) not confirmed');
  expect(cell(report({ verdict: 'pass_with_unconfirmed', counts: { humanUnconfirmed: 2 } }))).not.toContain('| Verified 已驗證 |');
  expect(cell(report({ verdict: 'no-steps', counts: { passed: 0 } }))).toContain('Not verified (that run tested nothing, or could not run)');
  // not the published package: ignored, so the platform stays "not yet verified"
  expect(cell(report({ uds: { installKind: 'local-bin' } }))).toContain('Not yet verified 尚未驗證');
  expect(cell(report({ uds: { installKind: 'injected-installer' } }))).toContain('Not yet verified 尚未驗證');
  expect(cell(report({ uds: { installKind: 'local-source' } }))).toContain('Not yet verified 尚未驗證');
  // another version
  expect(cell(report({ uds: { version: '6.99.0-beta.0' } }))).toContain('Not yet verified 尚未驗證');
  // not a report of this tool
  expect(cell(report({ tool: 'something-else' }))).toContain('Not yet verified 尚未驗證');
});

it('when a platform has several reports the latest one decides, and a report file that is not JSON stops the generator with exit 2 instead of being skipped (XSPEC-469 R5)', () => {
  const ws = workspace();
  put(ws, 'old-pass.json', report({ finishedAt: '2026-10-01T00:00:00.000Z' }));
  put(ws, 'new-fail.json', report({ finishedAt: '2026-10-09T00:00:00.000Z', verdict: 'fail', counts: { failed: 1 } }));
  expect(generate(ws).code).toBe(0);
  expect(rowOf(verifiedBlock(ws), 'Windows')).toContain('Failed 有失敗：1 step(s) 步');

  put(ws, 'broken.json', '{ not json');
  const r = generate(ws);
  expect(r.code, r.out).toBe(2);
  expect(r.stderr).toContain('broken.json is not valid JSON');
});

it('a document without the markers is refused with exit 2 and nothing is written, because the generator does not guess where a block belongs (XSPEC-469 R5)', () => {
  const ws = workspace();
  const plain = '# Pre-release\n\nNo markers here.\n';
  writeFileSync(ws.doc, plain);
  const r = generate(ws);
  expect(r.code, r.out).toBe(2);
  expect(r.stderr).toContain('has no <!-- BETA-ACCEPTANCE-TEST:START');
  expect(readFileSync(ws.doc, 'utf-8')).toBe(plain);
});

it('the "what to test" list marks the steps that test unreleased CHANGELOG entries as new, and is derived from the steps: adding a step adds an item (XSPEC-469 R5)', () => {
  const ws = workspace();
  const steps = JSON.parse(readFileSync(join(ACCEPT_DIR, 'steps.json'), 'utf-8'));
  expect(generate(ws).code).toBe(0);
  const before = readFileSync(ws.doc, 'utf-8');
  const itemsBefore = before.match(/^\d+\. `[a-z0-9-]+`/gm).length;
  expect(itemsBefore).toBe(steps.steps.length);
  expect(before).toMatch(/^\d+\. `owt-waiting-states` \(\*\*new 新\*\*\)/m);
  expect(before, 'a step for a released entry is not marked new').toMatch(/^\d+\. `beta6-simulate-pass` — /m);

  steps.steps.push({ id: 'added-later', platform: 'all', title: 'A step added later', titleZh: '後來加的步驟', smoke: true, changelog: [], uds: ['--version'], expect: { contains: ['x'] } });
  const stepsFile = join(ws.dir, 'steps.json');
  writeFileSync(stepsFile, JSON.stringify(steps));
  expect(generate(ws, ['--steps', stepsFile]).code).toBe(0);
  const after = readFileSync(ws.doc, 'utf-8');
  expect(after.match(/^\d+\. `[a-z0-9-]+`/gm).length).toBe(itemsBefore + 1);
  expect(after).toContain('`added-later`');
});

it('weakening the generator turns the property red: counting a local-bin report as verified, or filling a platform from another platform, is caught (XSPEC-469 R5)', () => {
  // The property: a local-bin Windows report leaves Windows "not yet verified"; a Windows report leaves macOS "not yet verified".
  const holds = (programDir) => {
    const script = join(programDir, 'generate-pre-release.mjs');
    // the copy looks for the CHANGELOG two folders above itself, as the real one does
    cpSync(join(REPO, 'CHANGELOG.md'), join(programDir, '..', '..', 'CHANGELOG.md'));
    const verdictOf = (reportObj) => {
      const ws = workspace();
      put(ws, 'r.json', reportObj);
      const g = run(['--doc', ws.doc, '--reports', ws.reports, '--version', VERSION], script);
      if (g.code !== 0) return `generator exit ${g.code}: ${g.out}`;
      return verifiedBlock(ws);
    };
    const localBin = verdictOf(report({ uds: { installKind: 'local-bin' } }));
    const winOnly = verdictOf(report());
    return rowOf(localBin, 'Windows').includes('Not yet verified') && rowOf(winOnly, 'macOS').includes('Not yet verified') && rowOf(winOnly, 'Windows').includes('Verified 已驗證');
  };

  const real = copyProgram(tmp.next('real'));
  expect(holds(join(real)), 'control: the unmodified generator satisfies the property').toBe(true);

  const anyKind = copyProgram(tmp.next('any-kind'));
  weaken(join(anyKind, 'lib', 'pre-release-doc.mjs'), "    && report.uds.installKind === 'npm-registry'\n", '\n');
  expect(holds(anyKind), 'every install kind counts').toBe(false);

  const anyPlatform = copyProgram(tmp.next('any-platform'));
  weaken(join(anyPlatform, 'lib', 'pre-release-doc.mjs'), ".filter(({ report }) => report.environment.platform === key)", ".filter(({ report }) => Boolean(report.environment.platform))");
  expect(holds(anyPlatform), 'a report fills every platform').toBe(false);
});
