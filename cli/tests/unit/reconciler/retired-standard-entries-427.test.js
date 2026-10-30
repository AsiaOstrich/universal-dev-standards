/**
 * Unit: when the reconciler deletes a standard UDS no longer ships, the manifest stops naming it (dev-platform XSPEC-427).
 *
 * The end-to-end side (the real CLI, CLAUDE.md, `uds check`) is tests/e2e/xspec-427-open-work-tracking-becomes-skill.test.js. This file pins
 * the rules of the function itself, including the ones an end-to-end run cannot show: a standard UDS still ships is never touched, and an
 * entry that merely resembles the deleted one is left alone.
 *
 * The expected values below are written out by hand from the rule ("the entry is that file's path, or the id the file is named after"),
 * not computed with the function's own matching.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { dropRetiredStandardEntries, executePlan } from '../../../src/reconciler/plan-executor.js';

/** A standard file name the registry certainly still ships (a retired name would be dropped, a shipped one must not be). */
const SHIPPED = 'anti-hallucination.ai.yaml';
/** A name no registry entry has: stands for a standard UDS retired. */
const RETIRED = 'a-standard-uds-retired.ai.yaml';

describe('dropRetiredStandardEntries', () => {
  it('drops the id form, the path form and the snapshot copy of a retired standard, and nothing else', () => {
    const manifest = {
      standards: ['anti-hallucination', 'a-standard-uds-retired', 'ai/standards/a-standard-uds-retired.ai.yaml', 'ai/standards/other.ai.yaml', 'a-standard-uds-retired-too'],
      integrationConfigs: {
        'CLAUDE.md': { installedStandards: ['ai/standards/a-standard-uds-retired.ai.yaml', 'ai/standards/other.ai.yaml'] }
      }
    };
    const dropped = dropRetiredStandardEntries(manifest, `.standards/${RETIRED}`);
    expect(dropped).toEqual(['a-standard-uds-retired', 'ai/standards/a-standard-uds-retired.ai.yaml']);
    expect(manifest.standards).toEqual(['anti-hallucination', 'ai/standards/other.ai.yaml', 'a-standard-uds-retired-too']);
    expect(manifest.integrationConfigs['CLAUDE.md'].installedStandards).toEqual(['ai/standards/other.ai.yaml']);
  });

  it('reads a Windows path the same way', () => {
    const manifest = { standards: ['a-standard-uds-retired', 'keep'] };
    expect(dropRetiredStandardEntries(manifest, `.standards\\${RETIRED}`)).toEqual(['a-standard-uds-retired']);
    expect(manifest.standards).toEqual(['keep']);
  });

  it('never touches a standard UDS still ships: the entry stays when its file is among those deleted', () => {
    const manifest = { standards: ['anti-hallucination', 'ai/standards/anti-hallucination.ai.yaml'] };
    expect(dropRetiredStandardEntries(manifest, `.standards/${SHIPPED}`)).toEqual([]);
    expect(manifest.standards).toEqual(['anti-hallucination', 'ai/standards/anti-hallucination.ai.yaml']);
  });

  it('leaves entries it cannot read, a manifest without a standards list, and an empty path alone', () => {
    const odd = { standards: [null, 42, 'keep'] };
    expect(dropRetiredStandardEntries(odd, `.standards/${RETIRED}`)).toEqual([]);
    expect(odd.standards).toEqual([null, 42, 'keep']);
    expect(dropRetiredStandardEntries({}, `.standards/${RETIRED}`)).toEqual([]);
    expect(dropRetiredStandardEntries(null, `.standards/${RETIRED}`)).toEqual([]);
    const whole = { standards: ['a-standard-uds-retired'] };
    expect(dropRetiredStandardEntries(whole, '')).toEqual([]);
    expect(whole.standards).toEqual(['a-standard-uds-retired']);
  });
});

describe('executePlan removes the name of a retired standard along with its file', () => {
  const dirs = [];
  afterEach(() => { while (dirs.length) rmSync(dirs.pop(), { recursive: true, force: true }); });

  it('deletes the file and leaves the manifest without the entry and without its hash record', async () => {
    const root = mkdtempSync(join(tmpdir(), 'uds-427-'));
    dirs.push(root);
    mkdirSync(join(root, '.standards'), { recursive: true });
    writeFileSync(join(root, '.standards', RETIRED), 'standard: {}\n');

    const manifest = { standards: ['a-standard-uds-retired', 'keep'], fileHashes: { [`.standards/${RETIRED}`]: { hash: 'x' } }, integrationConfigs: {} };
    const plan = {
      actions: [{ type: 'delete', category: 'standard', path: `.standards/${RETIRED}`, reason: 'UDS no longer ships this file' }],
      summary: {},
      warnings: []
    };
    const result = await executePlan(root, plan, manifest, { backup: false });

    // (writing this stub manifest to disk is refused as malformed; the delete itself is what is under test)
    expect(result.results[0], JSON.stringify(result.results[0])).toMatchObject({ success: true, action: { type: 'delete' } });
    expect(existsSync(join(root, '.standards', RETIRED)), 'the file is gone').toBe(false);
    expect(result.updatedManifest.standards, 'and the manifest no longer names it').toEqual(['keep']);
    expect(result.updatedManifest.fileHashes[`.standards/${RETIRED}`], 'nor does fileHashes').toBeUndefined();
  });
});
