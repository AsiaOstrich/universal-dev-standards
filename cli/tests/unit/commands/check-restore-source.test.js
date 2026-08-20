/**
 * XSPEC-382 R6 — `uds check --restore` could not restore any core standard.
 *
 * `getSourcePathFromRelative` matched `entry.endsWith(fileName)` against
 * `manifest.standards`. Those entries have been IDs (`commit-message`) rather
 * than paths since 3.4.0, and `'commit-message'.endsWith('commit-message.ai.yaml')`
 * is false — so it returned null and restore reported "Could not determine
 * source". Measured on a freshly initialised project: **64 of 72** tracked
 * standards were unrestorable. The eight that worked were the `options/`
 * entries, still stored as paths, which is why the failure never looked total.
 *
 * The same ID→source lookup already existed twice elsewhere in check.js and
 * once in registry.js. This site never got a copy. The fix is one resolver in
 * registry.js paired with `resolveStandardFilename`, not a fourth copy.
 */

import { describe, it, expect } from 'vitest';
import { getSourcePathFromRelative } from '../../../src/commands/check.js';
import { getAllStandards, getStandardSource } from '../../../src/utils/registry.js';

/** A manifest shaped like a current one: standards as IDs, options as paths. */
function manifestWithIds(ids, options = []) {
  return { standards: [...ids, ...options], extensions: [], integrations: [], format: 'ai' };
}

describe('getSourcePathFromRelative — ID-format standards (XSPEC-382 R6)', () => {
  const all = getAllStandards();

  it('resolves every standard the registry ships, not a sample', () => {
    // Traversed, not enumerated: the set comes from the registry itself, so a
    // standard added later is covered without editing this test.
    //
    // The expected filename comes from the registry's own `source`, not from
    // `<id>.ai.yaml`. A first draft assumed those were the same and 23 of 159
    // "failed" — `documentation-writing` ships as
    // `documentation-writing-standards.ai.yaml`, `error-code-standards` as
    // `error-codes.ai.yaml`. That was the test being wrong about the corpus,
    // and it is also not circular: `source` is the ground truth the resolver
    // has to arrive at, not the resolver's own output.
    const ids = all.map((s) => s.id);
    const m = manifestWithIds(ids);

    //
    // Two registry entries are excluded, and the exclusion is measured rather
    // than assumed: `openspec-integration` and `speckit-integration` have a
    // DIRECTORY as their source (`integrations/openspec/`), so they name no
    // file to restore. Checked against a freshly initialised project — neither
    // appears in `manifest.standards` nor anywhere in `fileHashes`. They are
    // integration directories, not tracked standards files, so excluding them
    // corrects the denominator instead of hiding a failure.
    const fileBacked = all.filter((s) => {
      const src = getStandardSource(s, 'ai');
      return src && !src.endsWith('/');
    });
    const excluded = all.length - fileBacked.length;

    const unresolved = fileBacked
      .filter((s) => {
        const fileName = getStandardSource(s, 'ai').split('/').pop();
        return !getSourcePathFromRelative(m, `.standards/${fileName}`);
      })
      .map((s) => s.id);

    // Denominator AND excluded count, both printed. A pass that does not say
    // what it skipped reads as full coverage.
    expect({ registry: ids.length, checked: fileBacked.length, excluded, unresolved }).toEqual({
      registry: ids.length,
      checked: fileBacked.length,
      excluded,
      unresolved: []
    });
    expect(fileBacked.length).toBeGreaterThan(100); // guard: a filter that empties the corpus passes vacuously
  });

  it('still resolves legacy path-format entries', () => {
    // The eight that worked before must keep working. A fix that trades one
    // format for the other is not a fix.
    const m = manifestWithIds([], ['options/english.ai.yaml']);
    expect(getSourcePathFromRelative(m, '.standards/options/english.ai.yaml')).toBe(
      'options/english.ai.yaml'
    );
  });

  it('returns null for a file no standard claims', () => {
    // Negative control. Without it, a resolver that returns a path for
    // everything passes the first two assertions and makes restore overwrite
    // files from the wrong source.
    const m = manifestWithIds(all.slice(0, 3).map((s) => s.id));
    expect(getSourcePathFromRelative(m, '.standards/no-such-standard.ai.yaml')).toBeNull();
  });

  it('does not resolve a standard that is not in this manifest', () => {
    // Second negative arm: installed-ness must come from the manifest, not from
    // the registry. Resolving anything the registry knows about would let
    // restore install standards the project never adopted.
    const m = manifestWithIds([all[0].id]);
    const other = all.find(
      (s) => s.id !== all[0].id && getStandardSource(s, 'ai') && getStandardSource(s, 'ai') !== getStandardSource(all[0], 'ai')
    );
    const otherFile = getStandardSource(other, 'ai').split('/').pop();
    expect(getSourcePathFromRelative(m, `.standards/${otherFile}`)).toBeNull();
  });
});
