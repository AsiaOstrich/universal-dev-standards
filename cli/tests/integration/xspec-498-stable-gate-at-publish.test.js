/**
 * E2E: the stable-release gate also checks that the release IS the accepted preview, and it runs where every release passes
 * (dev-platform XSPEC-498, on top of XSPEC-471 R5).
 *
 * Why: 6.14.0 (2026-10-22) was published on the strength of the beta.15 acceptance reports, but its tree differed from beta.15's by
 * four fixes and a translation sync, and the gate that should have said so ran only inside `scripts/bump-version.mjs`. A release made
 * another way never met it. Two changes close that:
 *   1. rule 8 of `scripts/beta-acceptance/lib/stable-gate.mjs`: HEAD may differ from the preview's tag only in the version files
 *      (`scripts/lib/version-files.mjs`, the list the bump writes from) and a short list of release records;
 *   2. `.github/workflows/publish.yml` runs `check-stable-gate.mjs` for a stable version before `npm publish`.
 *
 * Every test starts the real `check-stable-gate.mjs` (or `bump-version.mjs`) in a child process on a throwaway git repository that is a
 * small copy of this one (the repository itself is never touched), and reads the exit code and what it printed. Git runs with no
 * global or system configuration and a throwaway HOME (`gitEnv` of the shared helper), so nothing here reads or writes the real ones.
 *
 * - Samples: (a) a release commit that changes only version files and release records passes; (b) one more changed file under
 *   `cli/src/` refuses and names exactly that file (and not the version files); a deleted file and files of other kinds are named too;
 *   a folder that is not a git repository, or whose preview tag is missing, refuses ("could not look" is not a pass).
 * - Control: a version with a pre-release mark is still not gated, also on the tree that (b) refuses.
 * - The workflow: the gate step is in the publish job, before `npm publish`, after the dependencies and the npm tag are known, for a
 *   stable version only, with a checkout deep enough to hold the tags; and the very command written in that step, run on trees (a)
 *   and (b), passes and refuses.
 * - The list: the bump takes every path from `version-files.mjs`, and a full bump of a real copy changes no file outside the allowed lists.
 * - Cuts: the rule taken out of the gate, the version files taken out of the allowed set, and the step taken out of / moved behind
 *   `npm publish` in the workflow each make the sample that depends on them stop holding.
 *
 * Wire that makes these red when cut (one line of source each):
 *   scripts/beta-acceptance/lib/stable-gate.mjs   const same = checkContentConsistency({ root, preview: preview.version, git });
 *   .github/workflows/publish.yml                 run: node scripts/beta-acceptance/check-stable-gate.mjs "${{ steps.npm-tag.outputs.version }}"
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { load } from 'js-yaml';
import { REPO, scratch } from '../utils/xspec-469.js';
import {
  TARGET, PREVIEW, cleanupGitHome, commitAll, edit, gateTrees, git, gitEnv, readJson, writeJson,
} from '../utils/xspec-471-gate-trees.js';
import { BUMP_WRITES, BUMP_REGENERATES, VERSION_FILES } from '../../../scripts/lib/version-files.mjs';
import { RELEASE_ONLY_ALLOWED, unexpectedDifferences } from '../../../scripts/beta-acceptance/lib/stable-gate.mjs';

const tmp = scratch('uds-xspec498-');
afterAll(() => { tmp.cleanup(); cleanupGitHome(); });
const { fullTree, greenTree } = gateTrees(tmp);

const GATE_LIB = ['scripts', 'beta-acceptance', 'lib', 'stable-gate.mjs'];
const VERSION_LIST = ['scripts', 'lib', 'version-files.mjs'];
const WORKFLOW = join(REPO, '.github', 'workflows', 'publish.yml');
const posix = process.platform !== 'win32';

// ── the trees: a preview that was accepted, then a release commit on top of it ─────────────────────────────────────────

/**
 * What a real release commit changes besides the code (see `git show --stat` of the 6.14.0 release commit): the version files the
 * bump writes and regenerates, the CHANGELOG entries, the PRE-RELEASE document and the reports of the preview's acceptance.
 */
function releaseCommit(root) {
  const pkg = join(root, 'cli', 'package.json');
  writeJson(pkg, { ...readJson(pkg), version: TARGET });
  const registry = join(root, 'cli', 'standards-registry.json');
  writeFileSync(registry, readFileSync(registry, 'utf-8').replace(/"version": "[^"]*"/g, `"version": "${TARGET}"`));
  for (const rel of VERSION_FILES) {
    if (rel === 'cli/package.json' || rel === 'cli/standards-registry.json') continue;
    mkdirSync(dirname(join(root, ...rel.split('/'))), { recursive: true });
    writeFileSync(join(root, ...rel.split('/')), `carries version ${TARGET}\n`);
  }
  for (const rel of RELEASE_ONLY_ALLOWED.files) {
    mkdirSync(dirname(join(root, ...rel.split('/'))), { recursive: true });
    writeFileSync(join(root, ...rel.split('/')), `${existsSync(join(root, ...rel.split('/'))) ? readFileSync(join(root, ...rel.split('/')), 'utf-8') : ''}\n## [${TARGET}] - 2026-01-02\n`);
  }
  const reports = join(root, 'scripts', 'beta-acceptance', 'reports', PREVIEW);
  writeFileSync(join(reports, 'fetched-after-the-preview.txt'), 'a report that exists only after the preview was published\n');
  commitAll(root, `chore(release): ${TARGET}`);
  return root;
}

/** Tree (a): the release differs from the preview only in version files and release records. */
const treeA = () => releaseCommit(greenTree());

/** Tree (b): tree (a) plus one more file the preview did not have. */
function treeB(rel = 'cli/src/zz-extra.js') {
  const root = greenTree();
  mkdirSync(dirname(join(root, ...rel.split('/'))), { recursive: true });
  writeFileSync(join(root, ...rel.split('/')), "export const sneaked = 'not in the accepted preview';\n");
  return releaseCommit(root);
}

// ── running the gate ───────────────────────────────────────────────────────────

const gateCli = (root) => join(root, 'scripts', 'beta-acceptance', 'check-stable-gate.mjs');
/** `node scripts/beta-acceptance/check-stable-gate.mjs <version>`, started in the tree as a person or CI would. */
function check(root, version = TARGET) {
  const r = spawnSync(process.execPath, [gateCli(root), version], { cwd: root, encoding: 'utf-8', env: gitEnv(), timeout: 240000 });
  const out = `${r.stdout}${r.stderr}`;
  return { code: r.status, out, refused: out.includes('REFUSED'), count: Number(/共 (\d+) 項/.exec(out)?.[1] ?? 0) };
}

/** An `npm` that succeeds and does nothing, first on PATH (the steps of the bump after the gate). */
function stubNpm() {
  const dir = tmp.next('stub');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'npm'), '#!/bin/sh\nexit 0\n');
  chmodSync(join(dir, 'npm'), 0o755);
  return dir;
}
const bump = (root, version) => spawnSync(process.execPath, [join(root, 'scripts', 'bump-version.mjs'), version], {
  cwd: root, encoding: 'utf-8', timeout: 240000, env: { ...gitEnv(), PATH: `${stubNpm()}${posix ? ':' : ';'}${process.env.PATH}`, SKIP_BUNDLE_PARITY: '1' },
});

// ── samples ────────────────────────────────────────────────────────────────────

it('(a) a release that differs from its accepted preview only in version files and release records passes the gate, and it says so (XSPEC-498)', () => {
  const root = treeA();
  const head = git(root, 'rev-parse', 'HEAD');
  expect(head, 'control: the release commit is a new commit on top of the one the preview is tagged at').not.toBe(git(root, 'rev-parse', `v${PREVIEW}^{commit}`));
  const o = check(root);
  expect(o.code, o.out.slice(-2500)).toBe(0);
  expect(o.out).toContain(`content of HEAD equals v${PREVIEW}`);
  expect(o.out, 'it says what it compared: how many files differ, all of them allowed').toMatch(/\d+ file\(s\) differ, all of them version files or release records/);
});

it('(b) one more changed file under cli/src refuses the release, names exactly that file and none of the version files, and lists it as the only problem (XSPEC-498)', () => {
  const root = treeB();
  const o = check(root);
  expect(o.code, o.out.slice(-2500)).toBe(1);
  expect(o.refused).toBe(true);
  expect(o.count, 'only the content rule objects').toBe(1);
  expect(o.out).toContain('1 file(s) differ between HEAD and the accepted preview');
  expect(o.out).toContain('- cli/src/zz-extra.js');
  expect(o.out, 'the version files and release records are not listed as differences').not.toMatch(/- (cli\/package\.json|CHANGELOG\.md|llms\.txt|docs\/PRE-RELEASE\.md|scripts\/beta-acceptance\/reports\/)/);
});

it('(b) through the bump: the same tree is refused by `bump-version.mjs <stable>` before it changes any file (XSPEC-498)', () => {
  const root = treeB();
  const before = git(root, 'status', '--porcelain');
  const r = bump(root, TARGET);
  const out = `${r.stdout}${r.stderr}`;
  expect(r.status, out.slice(-2000)).toBe(1);
  expect(out).toContain('Stable-release gate REFUSED');
  expect(out).toContain('- cli/src/zz-extra.js');
  expect(git(root, 'status', '--porcelain'), 'a refused bump changed no file').toBe(before);
});

it('any file that is neither a version file nor a release record is named, whatever its kind: a standard, a doc, a test, a workflow; a deleted file too (XSPEC-498)', () => {
  for (const rel of ['core/zz-standard.md', 'docs/zz-guide.md', 'cli/tests/zz.test.js', '.github/workflows/zz.yml', 'scripts/zz-script.mjs']) {
    const o = check(treeB(rel));
    expect(o.code, `${rel}: ${o.out.slice(-1500)}`).toBe(1);
    expect(o.out, rel).toContain(`- ${rel}`);
    expect(o.count, rel).toBe(1);
  }
  const root = greenTree();
  rmSync(join(root, 'cli', 'bin', 'uds.js'));
  commitAll(root, 'delete a file of the preview');
  const deleted = check(root);
  expect(deleted.out, 'a file the release removed differs too').toContain('- cli/bin/uds.js');
});

it('a folder that is not a git repository, or whose preview tag is missing, is refused: "could not look" is not a pass (XSPEC-498)', () => {
  const noGit = greenTree();
  rmSync(join(noGit, '.git'), { recursive: true, force: true });
  const a = check(noGit);
  expect(a.code, a.out.slice(-1500)).toBe(1);
  expect(a.out).toContain('cannot compare HEAD with the preview');

  const noTag = treeA();
  git(noTag, 'tag', '-d', `v${PREVIEW}`);
  const b = check(noTag);
  expect(b.code, b.out.slice(-1500)).toBe(1);
  expect(b.out).toContain(`tag v${PREVIEW} not found`);
  expect(b.out, 'it tells CI what to fix').toContain('fetch-depth: 0');
  expect(b.count).toBe(1);
});

it('control: a version with a pre-release mark is still not gated, also on the tree the content rule refuses (XSPEC-498)', () => {
  const root = treeB();
  expect(check(root).refused, 'control: the same tree is refused as a stable version').toBe(true);
  expect(check(root, '9.9.0-beta.4').code, 'asking about a preview version is a mistake, not a pass').toBe(2);
  if (!posix) return; // the bump runs bash scripts and the stub npm is a shell script
  for (const preview of ['9.9.0-beta.4', '9.9.0-rc.1']) {
    const r = bump(root, preview);
    const out = `${r.stdout}${r.stderr}`;
    expect(out, preview).toContain(`New version : \x1b[0;34m${preview}`);
    expect(out, `${preview}: the gate does not run`).not.toContain('Stable-release gate | 正式版關卡');
    expect(out, preview).not.toContain('REFUSED');
  }
});

// ── the list the gate and the bump share ──────────────────────────────────────

it('the allowed set: every version file and release record is allowed; a file next to them, a prefix look-alike, or code is not (XSPEC-498)', () => {
  expect(unexpectedDifferences([...VERSION_FILES, ...RELEASE_ONLY_ALLOWED.files, 'scripts/beta-acceptance/reports/9.9.0-beta.3/a.json'])).toEqual([]);
  const notAllowed = ['cli/src/index.js', 'README.md.bak', 'docs/PRE-RELEASE.md.orig', 'scripts/beta-acceptance/reports-extra.json', 'scripts/beta-acceptance/steps.json', 'cli/package.json.d.ts'];
  expect(unexpectedDifferences(notAllowed)).toEqual(notAllowed);
  expect(VERSION_FILES.length, 'control: the list is not empty').toBeGreaterThan(15);
});

it('the bump takes every path it writes from the shared list, and the list holds nothing the bump does not use (XSPEC-498)', () => {
  const source = readFileSync(join(REPO, 'scripts', 'bump-version.mjs'), 'utf-8');
  for (const key of Object.keys(BUMP_WRITES)) expect(source, `bump-version.mjs never reads VF.${key}`).toContain(`VF.${key}`);
  // a path built in the script itself (`join(ROOT_DIR, 'README.md')`) is a second list; the labels printed for a person are not paths
  const builders = source.split('\n').filter((line) => line.includes('join('));
  for (const rel of [...Object.values(BUMP_WRITES).flat(), ...BUMP_REGENERATES]) {
    const name = rel.split('/').pop();
    expect(builders.filter((line) => line.includes(`'${name}'`)), `${rel} is built by hand in bump-version.mjs: a second list`).toEqual([]);
  }
  for (const rel of VERSION_FILES) expect(existsSync(join(REPO, ...rel.split('/'))), `${rel} is in the list but not in the repository`).toBe(true);
});

it('a real bump of a copy of the repository changes no file outside the allowed lists (XSPEC-498)', (ctx) => {
  if (!posix) ctx.skip(); // the bump runs bash scripts and the stub npm is a shell script
  const root = greenTree({ build: fullTree });
  const r = bump(root, TARGET);
  const out = `${r.stdout}${r.stderr}`;
  expect(r.status, out.slice(-2500)).toBe(0);
  git(root, 'add', '-A'); // new files count too (the PRE-RELEASE document may be generated for the first time)
  const changed = git(root, 'diff', '--cached', '--name-only', '--no-renames', '-z').split('\0').filter(Boolean);
  expect(changed, 'control: the bump changed files').toContain('cli/package.json');
  // the generators behind `npm run docs:*` are stubbed here (they need the repository's own dependencies); the files they write are
  // in BUMP_REGENERATES and were checked against the 6.14.0 release commit by hand
  expect(unexpectedDifferences(changed), 'the bump wrote files that the gate would call a difference').toEqual([]);
}, 300000);

// ── the workflow ──────────────────────────────────────────────────────────────

const workflow = (text) => load(text);
const stepsOf = (wf) => wf.jobs.publish.steps;
const indexOf = (steps, pred) => steps.findIndex(pred);

/** What publish.yml must look like for the gate to sit on the way to `npm publish`. Returns the list of what is wrong. */
function workflowProblems(text) {
  const wf = workflow(text);
  const steps = stepsOf(wf);
  const problems = [];
  const gate = indexOf(steps, (s) => /check-stable-gate\.mjs/.test(s.run || ''));
  const pub = indexOf(steps, (s) => /npm publish/.test(s.run || ''));
  const tag = indexOf(steps, (s) => s.id === 'npm-tag');
  const install = indexOf(steps, (s) => /npm install --ignore-scripts/.test(s.run || ''));
  if (pub === -1) problems.push('the publish job has no `npm publish` step (this check cannot judge)');
  if (gate === -1) return [...problems, 'the publish job has no step that runs check-stable-gate.mjs'];
  if (pub !== -1 && gate > pub) problems.push('the gate runs after `npm publish`');
  if (tag !== -1 && gate < tag) problems.push('the gate runs before the npm tag step it depends on');
  if (install !== -1 && gate < install) problems.push('the gate runs before the dependencies are installed (it needs cli/node_modules)');
  const g = steps[gate];
  if (g.if !== "steps.npm-tag.outputs.tag == 'latest'") problems.push(`the gate is not limited to a stable version: if=${JSON.stringify(g.if)}`);
  if (!/steps\.npm-tag\.outputs\.version/.test(g.run)) problems.push('the gate is not given the version being published');
  if (g['working-directory'] !== '.') problems.push('the gate does not run from the repository root');
  if (g['continue-on-error']) problems.push('the gate is allowed to fail');
  const checkout = steps.find((s) => /actions\/checkout/.test(s.uses || ''));
  if (!checkout || checkout.with?.['fetch-depth'] !== 0) problems.push('the checkout of the publish job is shallow: the preview tag is not there to compare with');
  if (wf.jobs.publish.if !== "github.event_name == 'release'") problems.push('the publish job is no longer limited to a published release');
  return problems;
}

it('publish.yml runs the stable-release gate in the publish job: before `npm publish`, after the version is known, for a stable version, on a deep checkout (XSPEC-498)', () => {
  const text = readFileSync(WORKFLOW, 'utf-8');
  expect(workflowProblems(text)).toEqual([]);
  const steps = stepsOf(workflow(text));
  expect(steps.filter((s) => /check-stable-gate\.mjs/.test(s.run || '')), 'exactly one gate step').toHaveLength(1);
  expect(steps.filter((s) => /npm publish/.test(s.run || '')), 'control: exactly one publish step').toHaveLength(1);
});

it('the command written in the workflow step, run on a tree the gate accepts and on one it refuses, passes and fails (XSPEC-498)', (ctx) => {
  if (!posix) ctx.skip(); // the step is a `run:` line for a POSIX shell
  const gate = stepsOf(workflow(readFileSync(WORKFLOW, 'utf-8'))).find((s) => /check-stable-gate\.mjs/.test(s.run || ''));
  const command = gate.run.replace('${{ steps.npm-tag.outputs.version }}', TARGET);
  expect(command, 'control: the placeholder was replaced').not.toContain('${{');
  const run = (root) => spawnSync('sh', ['-c', command], { cwd: root, encoding: 'utf-8', env: gitEnv() });
  const ok = run(treeA());
  expect(ok.status, ok.stdout + ok.stderr).toBe(0);
  const no = run(treeB());
  expect(no.status, 'the workflow step fails when the release is not the accepted preview, so `npm publish` does not run').toBe(1);
  expect(no.stdout).toContain('- cli/src/zz-extra.js');
});

// ── cuts ───────────────────────────────────────────────────────────────────────

/** A cut removes one wire from a copy; the sample that depends on it must stop holding, and hold on the uncut copy (control). */
const cut = (name, { rel, from, to, tree, holds }) => it(`cut: ${name}`, () => {
  const root = tree();
  edit(root, rel, from, to);
  const o = check(root);
  expect(holds(o), `the sample still holds although "${name}" was cut:\n${o.out.slice(-1800)}`).toBe(false);
  expect(holds(check(tree())), 'control: without the cut the sample holds').toBe(true);
});

cut('the content rule is taken out of the gate: (b) is no longer refused', {
  rel: GATE_LIB,
  from: 'const same = checkContentConsistency({ root, preview: preview.version, git });',
  to: 'const same = { problems: [], checks: [] };',
  tree: treeB,
  holds: (o) => o.refused && o.out.includes('- cli/src/zz-extra.js'),
});
cut('the version files are no longer allowed: (a) is refused for a file the bump writes', {
  rel: GATE_LIB,
  from: 'const allowed = new Set([...VERSION_FILES, ...RELEASE_ONLY_ALLOWED.files]);',
  to: 'const allowed = new Set([...RELEASE_ONLY_ALLOWED.files]);',
  tree: treeA,
  holds: (o) => o.code === 0,
});
cut('a missing preview tag is treated as "nothing differs"', {
  rel: GATE_LIB,
  from: 'if (tagCommit.code !== 0) return cannot(',
  to: 'if (tagCommit.code !== 0) return { problems: [], checks: [] } || cannot(',
  tree: () => { const root = treeA(); git(root, 'tag', '-d', `v${PREVIEW}`); return root; },
  holds: (o) => o.code === 1 && o.out.includes('not found'),
});
cut('the version list loses a file the bump writes (llms.txt): (a) is refused', {
  rel: VERSION_LIST,
  from: "  'llms.txt', // `npm run docs:llms-txt`",
  to: "  // 'llms.txt', // `npm run docs:llms-txt`",
  tree: treeA,
  holds: (o) => o.code === 0,
});

/** The workflow cuts work on text: the structural check must see each one. */
const GATE_STEP = /^ {6}- name: Stable-release gate \(XSPEC-498\)\n(?: {8}.*\n)+/m;
const withoutGateStep = (text) => text.replace(GATE_STEP, '');
const gateStepOf = (text) => GATE_STEP.exec(text)[0];

it('cut: the workflow check goes red when the gate step is removed, moved behind `npm publish`, made unconditional-looking, or the checkout is shallow (XSPEC-498)', () => {
  const text = readFileSync(WORKFLOW, 'utf-8');
  expect(workflowProblems(text), 'control: the real file is fine').toEqual([]);

  const removed = withoutGateStep(text);
  expect(removed, 'control: the cut removed something').not.toBe(text);
  expect(workflowProblems(removed)).toContain('the publish job has no step that runs check-stable-gate.mjs');

  const step = gateStepOf(text);
  const moved = `${removed.trimEnd()}\n\n${step}`;
  expect(workflowProblems(moved)).toContain('the gate runs after `npm publish`');

  expect(workflowProblems(text.replace('if: steps.npm-tag.outputs.tag == \'latest\'', 'if: always()')).join()).toContain('not limited to a stable version');
  expect(workflowProblems(text.replace('fetch-depth: 0', 'fetch-depth: 1')).join()).toContain('checkout of the publish job is shallow');
  expect(workflowProblems(text.replace('        working-directory: .\n        run: node scripts/beta-acceptance/check-stable-gate.mjs', '        run: node scripts/beta-acceptance/check-stable-gate.mjs')).join()).toContain('does not run from the repository root');
  expect(workflowProblems(text.replace('        run: node scripts/beta-acceptance/check-stable-gate.mjs', '        continue-on-error: true\n        run: node scripts/beta-acceptance/check-stable-gate.mjs')).join()).toContain('allowed to fail');
});
