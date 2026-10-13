/**
 * migrateOlderNativeHook and migrateHuskyBlockWithoutCi: swap a hook only when it is exactly a text UDS wrote
 * (XSPEC-482 R3, R5). Files are written to a throwaway folder and read back.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, statSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { migrateOlderNativeHook, migrateHuskyBlockWithoutCi } from '../../../src/utils/legacy-hook-migration.js';
import { buildNativePreCommitHook, buildPreCommitBlock } from '../../../src/utils/git-hooks.js';

const FIXTURES = resolve(import.meta.dirname, '../../fixtures/older-uds-hooks');
const fixture = (name) => readFileSync(join(FIXTURES, name), 'utf-8');

let dir;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'uds-test-older-hook-'));
  mkdirSync(join(dir, '.git', 'hooks'), { recursive: true });
  mkdirSync(join(dir, '.husky'), { recursive: true });
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

const native = () => join(dir, '.git', 'hooks', 'pre-commit');
const husky = () => join(dir, '.husky', 'pre-commit');

describe('migrateOlderNativeHook', () => {
  it('no hook file: nothing to do', () => {
    expect(migrateOlderNativeHook(dir)).toMatchObject({ state: 'none', kept: [], recorder: null });
  });

  it('the 6.11.0 hook: plan reports it and writes nothing; apply writes the current hook, executable, with an install record', () => {
    writeFileSync(native(), fixture('native-6.11.0.pre-commit'), { mode: 0o644 });
    const plan = migrateOlderNativeHook(dir, { plan: true });
    expect(plan).toMatchObject({ state: 'would-migrate', from: 'legacy-6.11' });
    expect(readFileSync(native(), 'utf-8')).toBe(fixture('native-6.11.0.pre-commit'));

    const done = migrateOlderNativeHook(dir);
    expect(done).toMatchObject({ state: 'migrated', from: 'legacy-6.11' });
    expect(done.recorder).toBeTruthy();
    expect(readFileSync(native(), 'utf-8')).toBe(buildNativePreCommitHook());
    if (process.platform !== 'win32') expect(statSync(native()).mode & 0o111).not.toBe(0);
  });

  it('the beta.12 hook is swapped too', () => {
    writeFileSync(native(), fixture('native-6.14.0-beta.12.pre-commit'));
    expect(migrateOlderNativeHook(dir)).toMatchObject({ state: 'migrated', from: 'without-ci' });
    expect(readFileSync(native(), 'utf-8')).toBe(buildNativePreCommitHook());
  });

  it('the current hook is left alone', () => {
    writeFileSync(native(), buildNativePreCommitHook());
    expect(migrateOlderNativeHook(dir)).toMatchObject({ state: 'none' });
  });

  it('an edited 6.11.0 hook is not touched; the always-pass line is named with its line number', () => {
    const edited = fixture('native-6.11.0.pre-commit').replace('echo "Pre-commit', 'make lint\necho "Pre-commit');
    writeFileSync(native(), edited);
    const r = migrateOlderNativeHook(dir);
    expect(r.state).toBe('kept');
    expect(r.kept).toEqual([{ line: 17, text: 'uds check 2>/dev/null || true' }]);
    expect(readFileSync(native(), 'utf-8')).toBe(edited);
  });

  it("an adopter's own hook with no UDS check is not mentioned", () => {
    writeFileSync(native(), '#!/bin/sh\nnpm test || true\n');
    expect(migrateOlderNativeHook(dir)).toMatchObject({ state: 'none', kept: [] });
  });
});

describe('migrateHuskyBlockWithoutCi', () => {
  it('replaces only the block, leaving the adopter\'s lines and CRLF line endings alone', () => {
    const old = fixture('husky-6.14.0-beta.12.pre-commit').replace('# UDS Standard Check', 'echo mine\n# UDS Standard Check');
    writeFileSync(husky(), old.replace(/\n/g, '\r\n'));
    expect(migrateHuskyBlockWithoutCi(dir, { plan: true })).toMatchObject({ state: 'would-migrate' });
    expect(migrateHuskyBlockWithoutCi(dir)).toMatchObject({ state: 'migrated' });
    const after = readFileSync(husky(), 'utf-8');
    expect(after).toContain('echo mine\r\n');
    expect(after.replace(/\r\n/g, '\n')).toContain(buildPreCommitBlock());
    expect(after.replace(/\r\n/g, '\n')).not.toContain(buildPreCommitBlock({ ci: false }));
  });

  it('a block the adopter changed is left alone', () => {
    const changed = fixture('husky-6.14.0-beta.12.pre-commit').replace('check\n', 'check --standard x\n');
    writeFileSync(husky(), changed);
    expect(migrateHuskyBlockWithoutCi(dir)).toMatchObject({ state: 'none' });
    expect(readFileSync(husky(), 'utf-8')).toBe(changed);
  });

  it('a block that already has --ci is left alone', () => {
    writeFileSync(husky(), `#!/bin/sh\n\n${buildPreCommitBlock()}`);
    expect(migrateHuskyBlockWithoutCi(dir)).toMatchObject({ state: 'none' });
  });
});
