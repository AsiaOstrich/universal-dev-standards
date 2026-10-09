/**
 * E2E: the gate in front of a stable release (dev-platform XSPEC-471 R5).
 *
 * `node scripts/bump-version.mjs <x.y.z>` (a version with no pre-release mark) must refuse, before it changes any file, unless the latest
 * preview of that version was accepted from the published package on Windows, macOS and Linux and every feature is wired. Every test
 * starts the real `bump-version.mjs` in a real child process, on a throwaway copy of the repository (the repository itself is never bumped),
 * and reads what it prints, its exit code and whether a version file changed.
 *
 * - Samples (a green tree, then one fact made wrong at a time): the three reports present and clean -> the gate passes; one platform
 *   missing (each of the three) -> refused, naming it; one Windows shell with a failed step among three clean ones -> refused naming
 *   the shell and the step; a report of `--local-bin` -> not counted; a baseline that is not empty; an exemption that says "known broken"
 *   (English and Chinese wording); the two checks red; a check that cannot run (exit 2); no preview of that version; a newer preview
 *   with no reports; several things wrong at once -> all listed in one refusal.
 * - A preview version is not checked at all.
 * - Each decision is cut in a copy of the program: the sample that depends on it must stop being refused / stop being named
 *   (a gate that passes everything would pass the samples above, so the cuts are what shows the samples are watching).
 *
 * The gate tests use a small copy (the files the gate reads, not the whole repository) and decide by what the gate printed
 * ("Stable-release gate passed" / "REFUSED"): what the bump does after the gate is the business of xspec-469-r5-bump-regenerates-doc.test.js.
 * Two tests bump a full copy (POSIX only, like that one): a stable version with everything in place goes all the way through, and a preview
 * version goes all the way through on a tree the gate would refuse.
 *
 * Wire that makes these red when cut (one line of source):
 *   scripts/bump-version.mjs   const gate = evaluateStableGate({ root: ROOT_DIR, target: NEW_VERSION.replace(/-.*$/, '') });
 */

import { it, expect, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { REPO, scratch, weaken } from '../utils/xspec-469.js';

const tmp = scratch('uds-xspec471-r5-gate-');
afterAll(() => tmp.cleanup());

const TARGET = '9.9.0';
const PREVIEW = '9.9.0-beta.3';
const PLATFORM_LABELS = { windows: ['ci-windows', 'ci-windows-cmd', 'ci-windows-gitbash'], macos: ['ci-macos'], linux: ['ci-linux'] };
const GATE_LIB = ['scripts', 'beta-acceptance', 'lib', 'stable-gate.mjs'];
const BUMP = ['scripts', 'bump-version.mjs'];

// GIT_* variables leak in when the tests run inside a git hook
const cleanEnv = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));

// ── the trees ──────────────────────────────────────────────────────────────────

const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const readJson = (file) => JSON.parse(readFileSync(file, 'utf-8'));

/** The files the gate reads and the bump needs up to the gate. The dependencies of cli/ are linked, not copied. */
function miniTree() {
  const root = tmp.next('mini');
  mkdirSync(join(root, 'cli'), { recursive: true });
  cpSync(join(REPO, 'scripts'), join(root, 'scripts'), { recursive: true, filter: (src) => !src.includes(join('beta-acceptance', 'reports')) });
  cpSync(join(REPO, 'CHANGELOG.md'), join(root, 'CHANGELOG.md'));
  for (const d of ['bin', 'src']) cpSync(join(REPO, 'cli', d), join(root, 'cli', d), { recursive: true });
  for (const f of ['package.json', 'standards-registry.json']) cpSync(join(REPO, 'cli', f), join(root, 'cli', f));
  symlinkSync(join(REPO, 'cli', 'node_modules'), join(root, 'cli', 'node_modules'), 'junction');
  return root;
}

/** The tracked files of the repository, copied (a git submodule, tests/bats, is a directory in the list and is not needed). */
function fullTree() {
  const listed = spawnSync('git', ['ls-files', '-z'], { cwd: REPO, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024, env: cleanEnv() });
  expect(listed.status, `control: git lists the tracked files (${listed.stderr})`).toBe(0);
  const root = tmp.next('full');
  for (const rel of listed.stdout.split('\0').filter(Boolean)) {
    if (statSync(join(REPO, rel)).isDirectory()) continue;
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    cpSync(join(REPO, rel), join(root, rel));
  }
  symlinkSync(join(REPO, 'cli', 'node_modules'), join(root, 'cli', 'node_modules'), 'junction');
  return root;
}

/** An `npm` that succeeds and does nothing, first on PATH (the steps of the bump that need dependencies or build output). */
function stubNpm() {
  const dir = tmp.next('stub');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'npm'), '#!/bin/sh\nexit 0\n');
  chmodSync(join(dir, 'npm'), 0o755);
  return dir;
}

const bump = (root, version = TARGET) => spawnSync(process.execPath, [join(root, ...BUMP), version], {
  cwd: root,
  encoding: 'utf-8',
  timeout: 240000,
  env: { ...cleanEnv(), PATH: `${stubNpm()}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}`, SKIP_BUNDLE_PARITY: '1' },
});

// ── the reports ────────────────────────────────────────────────────────────────

/** A report the acceptance program could have written (the fields the gate and the PRE-RELEASE table read). */
function report({ version = PREVIEW, platform, label, kind = 'npm-registry', failed = [], verdict = null, seq = 1 }) {
  const steps = [{ id: 'smoke-version', status: 'pass' }, ...failed.map((id) => ({ id, status: 'fail' })), { id: 'human-chinese-display', status: 'unconfirmed', human: {} }];
  const counts = { planned: steps.length, passed: 1, failed: failed.length, skipped: 0, humanConfirmed: 0, humanUnconfirmed: 1, executed: steps.length };
  return {
    schema: 1,
    tool: 'uds-beta-acceptance',
    startedAt: '2026-01-01T00:00:00.000Z',
    finishedAt: `2026-01-01T00:0${seq}:00.000Z`,
    label,
    verdict: verdict || (failed.length ? 'fail' : 'pass_with_unconfirmed'),
    exitCode: failed.length ? 1 : 0,
    error: null,
    request: { version, source: kind === 'npm-registry' ? 'npm registry' : '--local-bin' },
    uds: { version, installKind: kind },
    environment: { platform, os: { type: 'TestOS', release: '1' }, node: { version: 'v22.0.0' }, shell: { value: 'sh' } },
    counts,
    steps,
  };
}

/** The reports of a clean acceptance: three Windows shells, macOS, Linux. */
const cleanReports = (version = PREVIEW) => Object.entries(PLATFORM_LABELS).flatMap(([platform, labels]) => labels.map((label) => report({ version, platform, label })));

const put = (root, version, reports) => {
  const dir = join(root, 'scripts', 'beta-acceptance', 'reports', version);
  mkdirSync(dir, { recursive: true });
  reports.forEach((r, i) => writeJson(join(dir, `${r.label}__uds-beta-acceptance-${version}-${r.environment.platform}-${i}.json`), r));
};

/** Replace one text in a file of the tree; it must apply exactly once, so a no-op cannot pass for a change. */
const edit = (root, rel, from, to) => weaken(join(root, ...rel), from, to);

const stepsFile = (root) => join(root, 'scripts', 'beta-acceptance', 'steps.json');
const baselineFile = (root) => join(root, 'scripts', 'beta-acceptance', 'coverage-baseline.json');

/**
 * A tree in which the gate for TARGET passes: a preview heading in the CHANGELOG, its reports, and no exemption that says "known broken"
 * (the repository may carry such an exemption at any moment; here it is reworded so this tree is green whatever the repository holds today).
 */
function greenTree({ build = miniTree, reports = cleanReports(), previews = [PREVIEW] } = {}) {
  const root = build();
  const changelog = join(root, 'CHANGELOG.md');
  writeFileSync(changelog, `${readFileSync(changelog, 'utf-8')}\n${previews.map((v) => `## [${v}] - 2026-01-01\n\n### Added\n\n- A made-up entry of the preview ${v}.\n`).join('\n')}`);
  const doc = readJson(stepsFile(root));
  for (const x of doc.exemptions) x.reason = x.reason.replace(/known[ -]broken|已知壞掉/gi, 'accepted and ignored');
  writeJson(stepsFile(root), doc);
  put(root, PREVIEW, reports);
  return root;
}

/** The first exemption of a command or option that is not about being broken: the one the "known broken" samples reword. */
function plainExemption(root) {
  const doc = readJson(stepsFile(root));
  const i = doc.exemptions.findIndex((x) => x.option || x.command);
  expect(i, 'control: steps.json has an exemption of a command or option to reword for this sample').toBeGreaterThanOrEqual(0);
  return { doc, i };
}

// ── reading the result ─────────────────────────────────────────────────────────

const GATE = 'Stable-release gate';
function outcome(r) {
  const out = `${r.stdout}${r.stderr}`;
  const at = out.indexOf('REFUSED — ');
  return {
    code: r.status,
    out,
    ran: out.includes('Stable-release gate | 正式版關卡'),
    passed: out.includes(`${GATE} passed`),
    refused: out.includes(`${GATE} REFUSED`),
    /** the numbered list of what is missing or wrong, and nothing else (the lines above it name the clean labels too) */
    reasons: at === -1 ? '' : out.slice(at),
    count: at === -1 ? 0 : Number(/共 (\d+) 項/.exec(out.slice(at))?.[1] ?? 0),
  };
}
const run = (root, version) => outcome(bump(root, version));

/** A refusal must not have touched the repository. */
const untouched = (root) => readJson(join(root, 'cli', 'package.json')).version === readJson(join(REPO, 'cli', 'package.json')).version;

// ── samples ────────────────────────────────────────────────────────────────────

it('with a clean report from the published package for Windows, macOS and Linux the gate passes, lists the manual steps nobody confirmed and lets the bump go on (XSPEC-471 R5)', () => {
  const o = run(greenTree());
  expect(o.passed, o.out.slice(-2500)).toBe(true);
  expect(o.refused).toBe(false);
  expect(o.out, 'the manual steps nobody confirmed are listed').toContain('human-chinese-display — Windows, macOS, Linux');
  expect(o.out).toContain(`latest preview of ${TARGET}: ${PREVIEW}`);
  expect(o.out, 'it names what it checked').toContain('check-cli-coverage.mjs: green');
});

it('with no report for a platform the gate refuses before changing any file and says which one is missing, for each of the three (XSPEC-471 R5)', () => {
  for (const [platform, label] of [['windows', 'Windows'], ['macos', 'macOS'], ['linux', 'Linux']]) {
    const root = greenTree({ reports: cleanReports().filter((r) => r.environment.platform !== platform) });
    const o = run(root);
    expect(o.refused, `${label} missing: ${o.out.slice(-1500)}`).toBe(true);
    expect(o.code).toBe(1);
    expect(o.reasons).toContain(`缺 ${label} 報告`);
    expect(o.count, 'only that platform is named').toBe(1);
    for (const other of ['Windows', 'macOS', 'Linux'].filter((x) => x !== label)) expect(o.reasons).not.toContain(`缺 ${other} 報告`);
    expect(untouched(root), 'a refused bump changed no file').toBe(true);
  }
});

it('the scenario of the spec: the latest preview has only macOS and Linux reports, the bump is refused and says Windows is missing (XSPEC-471 R5)', () => {
  const o = run(greenTree({ reports: cleanReports().filter((r) => r.environment.platform !== 'windows') }));
  expect(o.refused).toBe(true);
  expect(o.reasons).toContain('缺 Windows 報告');
});

it('a failed step in one of the three Windows shells refuses the release even though the other two pass, and names the shell and the step (XSPEC-471 R5)', () => {
  const reports = cleanReports().map((r) => (r.label === 'ci-windows-cmd' ? report({ platform: 'windows', label: 'ci-windows-cmd', failed: ['init-yes-writes-standards'] }) : r));
  const o = run(greenTree({ reports }));
  expect(o.refused, o.out.slice(-1500)).toBe(true);
  expect(o.reasons).toContain('Windows [ci-windows-cmd]');
  expect(o.reasons).toContain('init-yes-writes-standards');
  expect(o.reasons, 'the clean shells and the other platforms are not named as wrong').not.toMatch(/ci-windows-gitbash|ci-windows\]|ci-macos|ci-linux/);
  expect(o.count).toBe(1);
});

it('a re-run of a shell replaces its earlier run: an old failure under the same label does not refuse, a new one does (XSPEC-471 R5)', () => {
  const old = report({ platform: 'windows', label: 'ci-windows-cmd', failed: ['some-step'], seq: 1 });
  const rerun = report({ platform: 'windows', label: 'ci-windows-cmd', seq: 2 });
  expect(run(greenTree({ reports: [...cleanReports().filter((r) => r.label !== 'ci-windows-cmd'), old, rerun] })).passed, 'failure then clean re-run').toBe(true);
  const worse = report({ platform: 'windows', label: 'ci-windows-cmd', failed: ['some-step'], seq: 3 });
  expect(run(greenTree({ reports: [...cleanReports().filter((r) => r.label !== 'ci-windows-cmd'), rerun, worse] })).refused, 'clean then failing re-run').toBe(true);
});

it('a run that tested nothing or could not run is not an acceptance (XSPEC-471 R5)', () => {
  const noSteps = { ...report({ platform: 'macos', label: 'ci-macos' }), verdict: 'no-steps', counts: { planned: 3, passed: 0, failed: 0, skipped: 3, humanConfirmed: 0, humanUnconfirmed: 0, executed: 0 } };
  const o = run(greenTree({ reports: [...cleanReports().filter((r) => r.environment.platform !== 'macos'), noSteps] }));
  expect(o.refused).toBe(true);
  expect(o.reasons).toContain('macOS [ci-macos]');
});

it('a report made with --local-bin, --source or an injected installer is not counted: if it is all a platform has, the platform is missing and the report is named (XSPEC-471 R5)', () => {
  for (const kind of ['local-bin', 'local-source', 'injected-installer']) {
    const reports = [...cleanReports().filter((r) => r.environment.platform !== 'linux'), report({ platform: 'linux', label: 'dev', kind })];
    const o = run(greenTree({ reports }));
    expect(o.refused, kind).toBe(true);
    expect(o.reasons).toContain('缺 Linux 報告');
    expect(o.reasons, 'it says why the report that exists does not count').toContain(`${kind} ${PREVIEW}`);
  }
});

it('a report of another version in the folder is not counted either (XSPEC-471 R5)', () => {
  const reports = [...cleanReports().filter((r) => r.environment.platform !== 'linux'), report({ version: '9.9.0-beta.2', platform: 'linux', label: 'ci-linux' })];
  const o = run(greenTree({ reports }));
  expect(o.refused).toBe(true);
  expect(o.reasons).toContain('缺 Linux 報告');
});

it('a baseline that still holds a gap refuses the release although the coverage check is green (XSPEC-471 R5)', () => {
  const root = greenTree();
  edit(root, ['cli', 'bin', 'uds.js'], 'program.parse();', "program.command('zz-gap').description('a command no step uses').action(() => {});\n\nprogram.parse();");
  writeJson(baselineFile(root), { schema: 1, note: 'sample', commands: ['zz-gap'], options: [] });
  const o = run(root);
  expect(o.refused, o.out.slice(-1500)).toBe(true);
  expect(o.out, 'control: the ratchet itself is green with that baseline, so only the baseline rule can refuse').toContain('check-cli-coverage.mjs: green');
  expect(o.reasons).toContain('coverage-baseline.json is not empty');
  expect(o.reasons).toContain('zz-gap');
  expect(o.count).toBe(1);
});

it('a command nobody tests (not in the baseline) turns check-cli-coverage red and the release is refused (XSPEC-471 R5)', () => {
  const root = greenTree();
  edit(root, ['cli', 'bin', 'uds.js'], 'program.parse();', "program.command('zz-gap').description('a command no step uses').action(() => {});\n\nprogram.parse();");
  const o = run(root);
  expect(o.refused).toBe(true);
  expect(o.reasons).toContain('check-cli-coverage.mjs is red');
  expect(o.reasons).toContain('zz-gap');
});

it('a CHANGELOG entry with no step turns check-steps red and the release is refused (XSPEC-471 R5)', () => {
  const root = greenTree();
  edit(root, ['CHANGELOG.md'], '## [Unreleased]\n', '## [Unreleased]\n\n### Added\n\n- **A made-up entry that no acceptance step covers.** Only in a copy, for the gate test.\n');
  const o = run(root);
  expect(o.refused).toBe(true);
  expect(o.reasons).toContain('check-steps.mjs is red');
});

it('a check that cannot run is a refusal, not a pass: without the dependencies of cli/ check-cli-coverage exits 2 and the release is refused (XSPEC-471 R5)', () => {
  const root = greenTree();
  rmSync(join(root, 'cli', 'node_modules'), { recursive: true, force: true });
  const o = run(root);
  expect(o.refused, o.out.slice(-1500)).toBe(true);
  expect(o.reasons).toContain('check-cli-coverage.mjs could not measure');
});

it('an exemption in steps.json that says the feature is known broken refuses the release and names it, in English or in Chinese (XSPEC-471 R5)', () => {
  for (const reason of ['Known broken: the option is accepted and stored, but nothing reads it, so it changes no answer.', '已知壞掉：這個選項被接受也被存起來，但沒有任何地方讀它，所以不改變任何結果。']) {
    const root = greenTree();
    const { doc, i } = plainExemption(root);
    const name = doc.exemptions[i].option || doc.exemptions[i].command;
    doc.exemptions[i].reason = reason;
    writeJson(stepsFile(root), doc);
    const o = run(root);
    expect(o.refused, `${reason}: ${o.out.slice(-1500)}`).toBe(true);
    expect(o.reasons).toContain(`"${name}"`);
    expect(o.reasons).toContain('known broken');
    expect(o.count).toBe(1);
    expect(untouched(root)).toBe(true);
  }
});

it('with no preview of the version, or a newer preview that nobody accepted, or no reports folder at all, the release is refused (XSPEC-471 R5)', () => {
  const none = run(greenTree({ previews: ['9.8.0-beta.1'] }));
  expect(none.refused).toBe(true);
  expect(none.reasons).toContain(`no preview of ${TARGET}`);

  // beta.4 was published and nobody ran the acceptance for it; the accepted beta.3 does not stand in for it
  const newer = run(greenTree({ previews: [PREVIEW, '9.9.0-beta.4'] }));
  expect(newer.refused, newer.out.slice(-1500)).toBe(true);
  expect(newer.reasons).toContain('9.9.0-beta.4');
  expect(newer.reasons).not.toContain(PREVIEW);

  const root = greenTree();
  rmSync(join(root, 'scripts', 'beta-acceptance', 'reports', PREVIEW), { recursive: true, force: true });
  const folder = run(root);
  expect(folder.refused).toBe(true);
  expect(folder.reasons).toContain(`reports/${PREVIEW}/ does not exist`);
});

it('everything that is wrong is listed in one refusal, not one thing per run (XSPEC-471 R5)', () => {
  const root = greenTree({ reports: cleanReports().filter((r) => r.environment.platform !== 'linux') });
  edit(root, ['cli', 'bin', 'uds.js'], 'program.parse();', "program.command('zz-gap').description('a command no step uses').action(() => {});\n\nprogram.parse();");
  writeJson(baselineFile(root), { schema: 1, note: 'sample', commands: ['zz-gap'], options: [] });
  const { doc, i } = plainExemption(root);
  doc.exemptions[i].reason = 'Known broken: the option is accepted and stored, but nothing reads it, so it changes no answer.';
  writeJson(stepsFile(root), doc);
  const o = run(root);
  expect(o.refused).toBe(true);
  expect(o.count).toBe(3);
  expect(o.reasons).toContain('缺 Linux 報告');
  expect(o.reasons).toContain('coverage-baseline.json is not empty');
  expect(o.reasons).toContain('known broken');
});

it('a version with a pre-release mark is not checked: the gate does not even run (XSPEC-471 R5)', () => {
  // the tree would be refused for a stable version in every way: no preview, no reports, a known-broken exemption
  const root = miniTree();
  const { doc, i } = plainExemption(root);
  doc.exemptions[i].reason = 'Known broken: the option is accepted and stored, but nothing reads it, so it changes no answer.';
  writeJson(stepsFile(root), doc);
  expect(run(root, TARGET).refused, 'control: the same tree is refused as a stable version').toBe(true);
  for (const preview of ['9.9.0-beta.4', '9.9.0-rc.1', '9.9.0-alpha.2']) {
    const o = run(root, preview);
    expect(o.ran, preview).toBe(false);
    expect(o.refused, preview).toBe(false);
    expect(o.out, 'the bump itself started').toContain(`New version : \x1b[0;34m${preview}`);
  }
});

it('a full bump to a stable version goes through with the gate in place and the version files change (XSPEC-471 R5)', (ctx) => {
  if (process.platform === 'win32') ctx.skip(); // the bump runs bash scripts and the stub npm is a shell script
  const root = greenTree({ build: fullTree });
  const o = run(root);
  expect(o.passed, o.out.slice(-2500)).toBe(true);
  expect(o.code, o.out.slice(-2500)).toBe(0);
  expect(readJson(join(root, 'cli', 'package.json')).version).toBe(TARGET);
  expect(readJson(join(root, '.claude-plugin', 'plugin.json')).version, 'a stable release updates the marketplace files').toBe(TARGET);
}, 300000);

it('a full bump to a preview version still works on a tree a stable bump would refuse (XSPEC-471 R5)', (ctx) => {
  if (process.platform === 'win32') ctx.skip();
  const root = fullTree();
  const o = run(root, '9.9.0-beta.4');
  expect(o.ran).toBe(false);
  expect(o.code, o.out.slice(-2500)).toBe(0);
  expect(readJson(join(root, 'cli', 'package.json')).version).toBe('9.9.0-beta.4');
}, 300000);

// ── cuts: each decision of the gate taken out of a copy; the sample that depends on it must stop seeing it ─────────

/** `arm` builds a tree and runs it; `holds` is what the sample asserts. A cut copy must make `holds` false. */
const cut = (name, { rel, from, to, arm, holds }) => it(`cut: ${name}`, () => {
  const root = arm.tree();
  edit(root, rel, from, to);
  const o = run(root, arm.version);
  expect(holds(o), `the sample still holds although "${name}" was cut:\n${o.out.slice(-1800)}`).toBe(false);
  // control: the same arm on an uncut tree does hold (otherwise the cut proves nothing)
  const uncut = run(arm.tree(), arm.version);
  expect(holds(uncut), `control: without the cut the sample holds:\n${uncut.out.slice(-1800)}`).toBe(true);
});

const withoutPlatform = (p) => () => greenTree({ reports: cleanReports().filter((r) => r.environment.platform !== p) });
const withBaselineGap = () => {
  const root = greenTree();
  edit(root, ['cli', 'bin', 'uds.js'], 'program.parse();', "program.command('zz-gap').description('a command no step uses').action(() => {});\n\nprogram.parse();");
  writeJson(baselineFile(root), { schema: 1, note: 'sample', commands: ['zz-gap'], options: [] });
  return root;
};
const withBrokenReason = (reason) => () => {
  const root = greenTree();
  const { doc, i } = plainExemption(root);
  doc.exemptions[i].reason = reason;
  writeJson(stepsFile(root), doc);
  return root;
};
const refusedFor = (text) => (o) => o.refused && o.reasons.includes(text);

cut('a platform with no report is no longer a reason to refuse', {
  rel: GATE_LIB, from: '    if (!mine.length) {', to: '    if (false) {',
  arm: { tree: withoutPlatform('windows') }, holds: refusedFor('缺 Windows 報告'),
});
cut('the failure count of a shell is no longer read', {
  rel: GATE_LIB, from: '      if (bad) {', to: '      if (false) {',
  arm: { tree: () => greenTree({ reports: cleanReports().map((r) => (r.label === 'ci-windows-cmd' ? report({ platform: 'windows', label: 'ci-windows-cmd', failed: ['init-yes-writes-standards'] }) : r)) }) },
  holds: refusedFor('init-yes-writes-standards'),
});
cut('every report counts, whatever installed it', {
  rel: GATE_LIB, from: '  const eligible = eligibleReports(reports, version);', to: '  const eligible = reports.filter(({ report: r }) => r.environment && typeof r.environment.platform === \'string\' && r.counts);',
  arm: { tree: () => greenTree({ reports: [...cleanReports().filter((r) => r.environment.platform !== 'linux'), report({ platform: 'linux', label: 'dev', kind: 'local-bin' })] }) },
  holds: refusedFor('缺 Linux 報告'),
});
cut('only the newest label of a platform is read (a failing shell is hidden by a clean one)', {
  rel: GATE_LIB, from: '    for (const { file, report } of labels) {', to: '    for (const { file, report } of labels.slice(-1)) {',
  arm: { tree: () => greenTree({ reports: cleanReports().map((r) => (r.label === 'ci-windows-cmd' ? report({ platform: 'windows', label: 'ci-windows-cmd', failed: ['init-yes-writes-standards'] }) : r)) }) },
  holds: refusedFor('init-yes-writes-standards'),
});
cut('the baseline is no longer required to be empty', {
  rel: GATE_LIB, from: '    if (left.length) problems.push(', to: '    if (false) problems.push(',
  arm: { tree: withBaselineGap }, holds: refusedFor('coverage-baseline.json is not empty'),
});
cut('an exemption that says "known broken" in English no longer counts', {
  rel: GATE_LIB, from: 'export const KNOWN_BROKEN = /known[ -]broken|已知壞掉/i;', to: 'export const KNOWN_BROKEN = /已知壞掉/i;',
  arm: { tree: withBrokenReason('Known broken: the option is accepted and stored, but nothing reads it, so it changes no answer.') }, holds: refusedFor('known broken'),
});
cut('an exemption that says "已知壞掉" no longer counts', {
  rel: GATE_LIB, from: 'export const KNOWN_BROKEN = /known[ -]broken|已知壞掉/i;', to: 'export const KNOWN_BROKEN = /known[ -]broken/i;',
  arm: { tree: withBrokenReason('已知壞掉：這個選項被接受也被存起來，但沒有任何地方讀它，所以不改變任何結果。') }, holds: refusedFor('known broken'),
});
cut('a check that cannot measure (exit 2) is treated as a pass', {
  rel: GATE_LIB, from: '    if (r.code === 0) checks.push(', to: '    if (r.code === 0 || r.code === 2) checks.push(',
  arm: { tree: () => { const root = greenTree(); rmSync(join(root, 'cli', 'node_modules'), { recursive: true, force: true }); return root; } },
  holds: refusedFor('could not measure'),
});
cut('a red check (exit 1) is treated as a pass', {
  rel: GATE_LIB, from: '    if (r.code === 0) checks.push(', to: '    if (r.code === 0 || r.code === 1) checks.push(',
  arm: { tree: () => { const root = greenTree(); edit(root, ['CHANGELOG.md'], '## [Unreleased]\n', '## [Unreleased]\n\n### Added\n\n- **A made-up entry that no acceptance step covers.** Only in a copy, for the gate test.\n'); return root; } },
  holds: refusedFor('check-steps.mjs is red'),
});
cut('the lowest preview is taken as the latest instead of the highest', {
  rel: GATE_LIB, from: '  const version = same[same.length - 1];', to: '  const version = same[0];',
  arm: { tree: () => greenTree({ previews: [PREVIEW, '9.9.0-beta.4'] }) }, holds: refusedFor('9.9.0-beta.4'),
});
cut('a version with no preview is no longer a reason to refuse', {
  rel: GATE_LIB, from: '  if (!preview) {', to: '  if (false) {',
  arm: { tree: () => greenTree({ previews: ['9.8.0-beta.1'] }) }, holds: refusedFor(`no preview of ${TARGET}`),
});
cut('the bump no longer asks the gate', {
  rel: BUMP, from: "const gate = evaluateStableGate({ root: ROOT_DIR, target: NEW_VERSION.replace(/-.*$/, '') });", to: 'const gate = { ok: true, preview: null, problems: [], notes: [], platforms: [], manual: [], checks: [] };',
  arm: { tree: withoutPlatform('windows') }, holds: refusedFor('缺 Windows 報告'),
});
cut('the gate runs for preview versions too', {
  rel: BUMP, from: 'if (!IS_PRERELEASE) {\n  console.log(\'── Stable-release gate', to: 'if (true) {\n  console.log(\'── Stable-release gate',
  arm: { tree: miniTree, version: '9.9.0-beta.4' }, holds: (o) => !o.ran,
});
