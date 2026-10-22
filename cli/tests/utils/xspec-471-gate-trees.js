/**
 * Trees for the tests of the stable-release gate (dev-platform XSPEC-471 R5, XSPEC-498): small copies of the repository in which the
 * gate for TARGET passes, and then one fact at a time is made wrong. Shared by `xspec-471-r5-stable-gate.test.js` (the gate's
 * rules, run through `bump-version.mjs`) and `tests/integration/xspec-498-stable-gate-at-publish.test.js` (the content rule and the publish workflow).
 *
 * Since XSPEC-498 the gate also compares the tree being released with the tag of its preview, so a green tree is a git repository:
 * `greenTree` commits the tree and tags every preview at that commit (the release then equals the preview: nothing differs).
 * Git runs with no global or system configuration and no real home (`gitEnv`), so a fixture cannot read or write the maintainer's.
 */

import { spawnSync } from 'child_process';
import { cpSync, mkdirSync, readFileSync, statSync, symlinkSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { expect } from 'vitest';
import { REPO, weaken } from './xspec-469.js';
import { isolatedHome } from '../../../scripts/lib/isolated-home.mjs';

export const TARGET = '9.9.0';
export const PREVIEW = '9.9.0-beta.3';
export const PLATFORM_LABELS = { windows: ['ci-windows', 'ci-windows-cmd', 'ci-windows-gitbash'], macos: ['ci-macos'], linux: ['ci-linux'] };

// GIT_* variables leak in when the tests run inside a git hook
export const cleanEnv = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));

export const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
export const readJson = (file) => JSON.parse(readFileSync(file, 'utf-8'));

// ── git, isolated ──────────────────────────────────────────────────────────────

const home = isolatedHome({ prefix: 'uds-gate-git-home-' });
/** Release the throwaway home git runs under; call from `afterAll`. */
export const cleanupGitHome = () => home.cleanup();
// An empty file, not os.devNull: on Windows that is `\\.\nul`, which Git for Windows cannot open as a config file
// ("fatal: unable to access '\\.\nul': Invalid argument"; every gate test failed on windows-latest, PR #273).
const emptyGitConfig = join(home.home, 'gitconfig-empty');
writeFileSync(emptyGitConfig, '');

/** No global or system git configuration, a throwaway HOME, a fixed author: a fixture never touches the maintainer's git or keychain. */
export const gitEnv = () => ({
  ...cleanEnv(),
  ...home.env,
  GIT_CONFIG_GLOBAL: emptyGitConfig,
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Gate Test',
  GIT_AUTHOR_EMAIL: 'gate-test@example.invalid',
  GIT_COMMITTER_NAME: 'Gate Test',
  GIT_COMMITTER_EMAIL: 'gate-test@example.invalid',
  GIT_TERMINAL_PROMPT: '0',
});

/** Run git in `root`; a failing git fails the test with its own message (a fixture that did not get built proves nothing). */
export function git(root, ...args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf-8', env: gitEnv(), maxBuffer: 64 * 1024 * 1024 });
  expect(r.status, `control: git ${args.join(' ')} in ${root}: ${r.stderr}`).toBe(0);
  return r.stdout.trim();
}

/** `node_modules` has no trailing slash on purpose: the one in a tree is a symlink, which `node_modules/` does not match. */
export function gitInit(root) {
  git(root, 'init', '-q', '-b', 'main');
  writeFileSync(join(root, '.gitignore'), 'node_modules\n');
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'the tree as the previews were published');
}

/** Stage everything and commit; a no-op commit is an error here (a "release commit" that changes nothing would test nothing). */
export function commitAll(root, message) {
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', message);
}

export const tagPreview = (root, preview) => git(root, 'tag', `v${preview}`);

// ── the trees ──────────────────────────────────────────────────────────────────

export function gateTrees(tmp) {
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

  /**
   * A tree in which the gate for TARGET passes: a preview heading in the CHANGELOG, its reports, and no exemption that says "known broken"
   * (the repository may carry such an exemption at any moment; here it is reworded so this tree is green whatever the repository holds today).
   * It is a git repository whose HEAD is every preview's tag, so the content rule finds nothing to object to.
   */
  function greenTree({ build = miniTree, reports = cleanReports(), previews = [PREVIEW] } = {}) {
    const root = build();
    const changelog = join(root, 'CHANGELOG.md');
    writeFileSync(changelog, `${readFileSync(changelog, 'utf-8')}\n${previews.map((v) => `## [${v}] - 2026-01-01\n\n### Added\n\n- A made-up entry of the preview ${v}.\n`).join('\n')}`);
    const doc = readJson(stepsFile(root));
    for (const x of doc.exemptions) x.reason = x.reason.replace(/known[ -]broken|已知壞掉/gi, 'accepted and ignored');
    writeJson(stepsFile(root), doc);
    put(root, PREVIEW, reports);
    // Rule 8 of the gate compares the tree with the tag of its preview: commit, then tag every preview at this commit.
    gitInit(root);
    for (const v of previews) tagPreview(root, v);
    return root;
  }
  return { miniTree, fullTree, greenTree };
}

// ── the reports ────────────────────────────────────────────────────────────────

export const CURRENT_STEPS = readJson(join(REPO, 'scripts', 'beta-acceptance', 'steps.json')).steps;

/** A report the acceptance program could have written (the fields the gate and the PRE-RELEASE table read). */
export function report({ version = PREVIEW, platform, label, kind = 'npm-registry', failed = [], omit = [], verdict = null, seq = 1 }) {
  // every step of the current steps.json, as a report of a preview made with the current list would have them
  const steps = [...CURRENT_STEPS.filter((s) => !omit.includes(s.id)).map((s) => (s.human ? { id: s.id, status: 'unconfirmed', human: {} } : { id: s.id, status: failed.includes(s.id) ? 'fail' : 'pass' })), ...failed.filter((id) => !CURRENT_STEPS.some((s) => s.id === id)).map((id) => ({ id, status: 'fail' }))];
  const counts = { planned: steps.length, passed: steps.filter((s) => s.status === 'pass').length, failed: failed.length, skipped: 0, humanConfirmed: 0, humanUnconfirmed: steps.filter((s) => s.status === 'unconfirmed').length, executed: steps.length };
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
export const cleanReports = (version = PREVIEW) => Object.entries(PLATFORM_LABELS).flatMap(([platform, labels]) => labels.map((label) => report({ version, platform, label })));

export const put = (root, version, reports) => {
  const dir = join(root, 'scripts', 'beta-acceptance', 'reports', version);
  mkdirSync(dir, { recursive: true });
  reports.forEach((r, i) => writeJson(join(dir, `${r.label}__uds-beta-acceptance-${version}-${r.environment.platform}-${i}.json`), r));
};

/** Replace one text in a file of the tree; it must apply exactly once, so a no-op cannot pass for a change. */
export const edit = (root, rel, from, to) => weaken(join(root, ...rel), from, to);

export const stepsFile = (root) => join(root, 'scripts', 'beta-acceptance', 'steps.json');
export const baselineFile = (root) => join(root, 'scripts', 'beta-acceptance', 'coverage-baseline.json');


/** The first exemption of a command or option that is not about being broken: the one the "known broken" samples reword. */
export function plainExemption(root) {
  const doc = readJson(stepsFile(root));
  const i = doc.exemptions.findIndex((x) => x.option || x.command);
  expect(i, 'control: steps.json has an exemption of a command or option to reword for this sample').toBeGreaterThanOrEqual(0);
  return { doc, i };
}
