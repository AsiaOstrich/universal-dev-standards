/**
 * Swapping the pre-commit line older UDS versions wrote for the current block.
 *
 * The rule under test is "only a line UDS can be shown to have written is
 * changed". The fixtures below therefore spell out the old text on purpose: they
 * are what real adopters have on disk today (asiaostrich-telemetry-server,
 * asiaostrich-telemetry-client, vibeops, EngramGraph have the first shape;
 * machine-setup has the second).
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { migrateLegacyHuskyHook } from '../../../src/utils/legacy-hook-migration.js';
import { buildPreCommitBlock, hasBareUdsRunner, hookRunsUdsCheck } from '../../../src/utils/git-hooks.js';
import {
  newRecorder, recordFile, mergeRecorderInto, proveUnchanged, RECORD_KINDS
} from '../../../src/core/install-records.js';

let dir;
const hookPath = () => join(dir, '.husky', 'pre-commit');
const write = (content) => { mkdirSync(join(dir, '.husky'), { recursive: true }); writeFileSync(hookPath(), content); };
const read = () => readFileSync(hookPath(), 'utf-8');

beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'uds-legacy-hook-')); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

const LEGACY = '#!/bin/sh\n\n# UDS Standard Check\nnpx uds check\n';
const LEGACY_WITH_ARGS = '#!/bin/sh\n\n# UDS Standard Check\nnpx uds check --standard checkin-standards\n';

describe('migrateLegacyHuskyHook', () => {
  it('does nothing when there is no hook, and nothing when the hook is already current', () => {
    expect(migrateLegacyHuskyHook(dir).state).toBe('none');
    write(`#!/bin/sh\n\n${buildPreCommitBlock()}`);
    const before = read();
    expect(migrateLegacyHuskyHook(dir).state).toBe('none');
    expect(read()).toBe(before);
  });

  it('replaces the exact line UDS wrote, and the result no longer asks a package runner for `uds`', () => {
    write(LEGACY);
    const r = migrateLegacyHuskyHook(dir);
    expect(r.state).toBe('migrated');
    expect(r.replaced).toBe(1);
    expect(hasBareUdsRunner(read())).toBe(false);
    expect(hookRunsUdsCheck(read())).toBe(true);
    expect(read()).toBe(`#!/bin/sh\n\n${buildPreCommitBlock()}`);
  });

  it('keeps the arguments of the older shape (--standard checkin-standards)', () => {
    write(LEGACY_WITH_ARGS);
    expect(migrateLegacyHuskyHook(dir).state).toBe('migrated');
    expect(read()).toBe(`#!/bin/sh\n\n${buildPreCommitBlock({ args: '--standard checkin-standards' })}`);
  });

  it('leaves every other line of the adopter\'s hook byte-for-byte where it was', () => {
    write('#!/bin/sh\nnpm run lint\n\n# UDS Standard Check\nnpx uds check\n\nnpm test\n');
    migrateLegacyHuskyHook(dir);
    expect(read()).toBe(`#!/bin/sh\nnpm run lint\n\n${buildPreCommitBlock().replace(/\n$/, '')}\n\nnpm test\n`);
  });

  it('is idempotent', () => {
    write(LEGACY);
    migrateLegacyHuskyHook(dir);
    const once = read();
    expect(migrateLegacyHuskyHook(dir).state).toBe('none');
    expect(read()).toBe(once);
  });

  it('under plan, reports what would change and writes nothing', () => {
    write(LEGACY);
    const r = migrateLegacyHuskyHook(dir, { plan: true });
    expect(r.state).toBe('would-migrate');
    expect(read()).toBe(LEGACY);
  });

  it('keeps CRLF line endings', () => {
    write('#!/bin/sh\r\n\r\n# UDS Standard Check\r\nnpx uds check\r\n');
    migrateLegacyHuskyHook(dir);
    const out = read();
    expect(out).not.toMatch(/[^\r]\n/);
    expect(hasBareUdsRunner(out)).toBe(false);
  });

  describe('a line UDS cannot prove it wrote is reported, not changed', () => {
    it('the adopter added their own flag', () => {
      const own = '#!/bin/sh\n# UDS Standard Check\nnpx uds check --ci --json\n';
      write(own);
      const r = migrateLegacyHuskyHook(dir);
      expect(r.state).toBe('kept');
      expect(r.kept).toEqual([{ line: 3, text: 'npx uds check --ci --json' }]);
      expect(read()).toBe(own);
    });

    it('the exact command without UDS\'s marker above it (the adopter wrote it)', () => {
      const own = '#!/bin/sh\nnpx uds check\n';
      write(own);
      const r = migrateLegacyHuskyHook(dir);
      expect(r.state).toBe('kept');
      expect(r.kept[0].line).toBe(2);
      expect(read()).toBe(own);
    });

    it('other package runners for the same bare name are found too', () => {
      for (const cmd of ['pnpm dlx uds check', 'bunx uds check', 'npx --yes uds check', 'npm exec uds check', 'yarn dlx uds check']) {
        write(`#!/bin/sh\n${cmd}\n`);
        const r = migrateLegacyHuskyHook(dir);
        expect(r.state, cmd).toBe('kept');
        expect(read(), cmd).toBe(`#!/bin/sh\n${cmd}\n`);
      }
    });

    it('swaps the line UDS wrote and still reports a second, hand-written one', () => {
      write('#!/bin/sh\n# UDS Standard Check\nnpx uds check\nnpx uds audit\n');
      const r = migrateLegacyHuskyHook(dir);
      expect(r.state).toBe('migrated');
      expect(r.replaced).toBe(1);
      expect(r.kept).toEqual([{ line: 4, text: 'npx uds audit' }]);
      expect(read().endsWith('npx uds audit\n')).toBe(true);
    });
  });

  describe('the install record follows the file', () => {
    function manifestWithRecord() {
      const rec = newRecorder();
      recordFile(rec, dir, '.husky/pre-commit', RECORD_KINDS.GIT_HOOK);
      return mergeRecorderInto({}, rec);
    }

    it('a file that was provably UDS\'s stays provable after the swap', () => {
      write(LEGACY);
      const manifest = manifestWithRecord();
      expect(proveUnchanged(manifest, dir, '.husky/pre-commit').state).toBe('proven');

      const r = migrateLegacyHuskyHook(dir, { manifest });
      expect(r.recorder).not.toBeNull();
      const after = mergeRecorderInto(manifest, r.recorder);
      expect(proveUnchanged(after, dir, '.husky/pre-commit').state).toBe('proven');
      // ...and without the re-record it would not have been:
      expect(proveUnchanged(manifest, dir, '.husky/pre-commit').state).toBe('changed');
    });

    it('a file with no record, or an edited one, is not given a record', () => {
      write(LEGACY);
      expect(migrateLegacyHuskyHook(dir, { manifest: {} }).recorder).toBeNull();

      write(LEGACY);
      const manifest = manifestWithRecord();
      write(LEGACY + 'npm test\n'); // the adopter edited it after UDS wrote it
      expect(migrateLegacyHuskyHook(dir, { manifest }).recorder).toBeNull();
    });
  });
});
