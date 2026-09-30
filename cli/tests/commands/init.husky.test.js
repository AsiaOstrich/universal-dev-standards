/**
 * setupHuskyHook — adopting UDS must never rewrite the adopter's build.
 *
 * Regression cover for XSPEC-341 R1. `uds init` used to shell out to
 * `npx husky init`, which is a one-time bootstrap for a NEW project: it sets
 * `"prepare": "husky"` unconditionally. On 2026-07-17 that clobbered
 * EngramGraph's `"prepare": "tsup"` — a published package with no
 * prepack/prepublishOnly and `files: ["dist"]`, so `prepare` WAS its
 * build-before-publish hook. The next `npm publish` would have shipped an
 * unbuilt dist. The CLI printed "✓ 標準初始化成功！".
 *
 * The hit condition was (existing `prepare`) AND (no `.husky/`), which is why
 * four repos adopted UDS for two months without incident and the fifth broke.
 * `setupHuskyHook` had no test at all.
 *
 * These tests run against real temp directories rather than mocks: the bug lived
 * in real package.json read/write behaviour, and a mocked filesystem would have
 * reproduced the intent rather than the defect. Every fixture pre-declares husky
 * in devDependencies so the function skips its `npm install` (no network).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

vi.mock('chalk', () => ({
  default: { bold: (s) => s, gray: (s) => s, green: (s) => s, yellow: (s) => s, red: (s) => s, cyan: (s) => s }
}));

const { setupHuskyHook } = await import('../../src/commands/init.js');
const { BARE_UDS_RUNNER_RE } = await import('../../src/utils/git-hooks.js');

let dir;

/** A git repo with the given scripts, and husky already declared (skips npm install). */
function makeProject(scripts) {
  mkdirSync(join(dir, '.git'), { recursive: true });
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'fixture', version: '1.0.0', scripts, devDependencies: { husky: '^9.1.7' } }, null, 2) + '\n'
  );
}

const prepareOf = () => JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8')).scripts.prepare;
const preCommit = () => readFileSync(join(dir, '.husky', 'pre-commit'), 'utf-8');

beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'uds-husky-')); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

describe('setupHuskyHook — the adopter\'s prepare script', () => {
  it('chains onto an existing prepare instead of overwriting it (XSPEC-341)', async () => {
    makeProject({ prepare: 'tsup', build: 'tsup' });

    await setupHuskyHook(dir, { allowInTest: true });

    // The defect: this used to be exactly "husky".
    expect(prepareOf()).toBe('tsup && husky');
    // The build command must survive, in order, and still gate the exit code.
    expect(prepareOf()).toMatch(/^tsup\b/);
  });

  it('adds prepare when the project has none', async () => {
    makeProject({ build: 'tsc' });

    await setupHuskyHook(dir, { allowInTest: true });

    expect(prepareOf()).toBe('husky');
  });

  it('is idempotent when prepare already runs husky', async () => {
    makeProject({ prepare: 'tsup && husky' });

    await setupHuskyHook(dir, { allowInTest: true });

    expect(prepareOf()).toBe('tsup && husky');
  });

  it('does not double-chain husky across repeated inits', async () => {
    makeProject({ prepare: 'tsup' });

    await setupHuskyHook(dir, { allowInTest: true });
    await setupHuskyHook(dir, { allowInTest: true });
    await setupHuskyHook(dir, { allowInTest: true });

    expect(prepareOf()).toBe('tsup && husky');
  });

  it('leaves every other script untouched', async () => {
    makeProject({ prepare: 'tsup', build: 'tsup', test: 'vitest run', typecheck: 'tsc --noEmit' });

    await setupHuskyHook(dir, { allowInTest: true });

    const { scripts } = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
    expect(scripts.build).toBe('tsup');
    expect(scripts.test).toBe('vitest run');
    expect(scripts.typecheck).toBe('tsc --noEmit');
  });
});

describe('setupHuskyHook — the pre-commit hook', () => {
  it('installs only the UDS check, not husky init\'s `npm test` boilerplate', async () => {
    makeProject({ prepare: 'tsup' });

    await setupHuskyHook(dir, { allowInTest: true });

    expect(preCommit()).toContain('universal-dev-standards check');
    // Never the bare name through a package runner: on the npm registry `uds` is not us.
    expect(preCommit()).not.toMatch(BARE_UDS_RUNNER_RE);
    // `npm test` came from husky init's template — a gate the adopter never asked for.
    expect(preCommit()).not.toContain('npm test');
  });

  it('writes a husky v9 hook, not the v8 `_/husky.sh` form', async () => {
    makeProject({ prepare: 'tsup' });

    await setupHuskyHook(dir, { allowInTest: true });

    // v8 syntax is deprecated in v9 and removed in v10; we install ^9.
    expect(preCommit()).not.toContain('husky.sh');
    expect(preCommit()).not.toContain('#!/usr/bin/env sh');
  });

  it('appends to an existing hook rather than replacing the adopter\'s commands', async () => {
    makeProject({ prepare: 'tsup' });
    mkdirSync(join(dir, '.husky'), { recursive: true });
    writeFileSync(join(dir, '.husky', 'pre-commit'), 'npm run lint\n');

    await setupHuskyHook(dir, { allowInTest: true });

    expect(preCommit()).toContain('npm run lint');
    expect(preCommit()).toContain('universal-dev-standards check');
  });

  it('does not add the UDS check twice', async () => {
    makeProject({ prepare: 'tsup' });

    await setupHuskyHook(dir, { allowInTest: true });
    await setupHuskyHook(dir, { allowInTest: true });

    expect(preCommit().match(/^# UDS Standard Check$/gm)).toHaveLength(1);
    expect(preCommit().match(/universal-dev-standards check/g)).toHaveLength(1);
  });

  // 2026-09-27: a hook with no shebang has always worked on macOS/Linux
  // (POSIX git falls back to /bin/sh on ENOEXEC) but fails EVERY commit on
  // Windows (`error: cannot spawn .husky/pre-commit: No such file or
  // directory` — measured in CI, windows-latest). See ensureShebang in
  // git-hooks.js.
  it('adds a #!/bin/sh shebang so the hook can run on Windows', async () => {
    makeProject({ prepare: 'tsup' });

    await setupHuskyHook(dir, { allowInTest: true });

    expect(preCommit().startsWith('#!/bin/sh\n')).toBe(true);
  });

  it('adds the shebang to an existing hook that lacks one, without disturbing the adopter\'s own lines', async () => {
    makeProject({ prepare: 'tsup' });
    mkdirSync(join(dir, '.husky'), { recursive: true });
    writeFileSync(join(dir, '.husky', 'pre-commit'), 'npm run lint\n');

    await setupHuskyHook(dir, { allowInTest: true });

    const content = preCommit();
    expect(content.startsWith('#!/bin/sh\n')).toBe(true);
    expect(content).toContain('npm run lint');
    expect(content).toContain('universal-dev-standards check');
  });

  it('does not add a second shebang when one already exists (respects the adopter\'s own interpreter)', async () => {
    makeProject({ prepare: 'tsup' });
    mkdirSync(join(dir, '.husky'), { recursive: true });
    writeFileSync(join(dir, '.husky', 'pre-commit'), '#!/usr/bin/env bash\nnpm run lint\n');

    await setupHuskyHook(dir, { allowInTest: true });

    const content = preCommit();
    expect(content.startsWith('#!/usr/bin/env bash\n')).toBe(true);
    expect(content.match(/^#!/gm)).toHaveLength(1);
  });

  it('is idempotent about the shebang across repeated inits', async () => {
    makeProject({ prepare: 'tsup' });

    await setupHuskyHook(dir, { allowInTest: true });
    await setupHuskyHook(dir, { allowInTest: true });

    expect(preCommit().match(/^#!/gm)).toHaveLength(1);
  });
});

describe('setupHuskyHook — guards', () => {
  it('does nothing outside a git repository', async () => {
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x', scripts: { prepare: 'tsup' } }));

    await setupHuskyHook(dir, { allowInTest: true });

    expect(existsSync(join(dir, '.husky'))).toBe(false);
    expect(prepareOf()).toBe('tsup');
  });
});
