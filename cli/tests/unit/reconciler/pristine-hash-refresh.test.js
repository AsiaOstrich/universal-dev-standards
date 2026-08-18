/**
 * XSPEC-382 R6 — a byte-perfect file reported as modified, forever.
 *
 * R5's stale write reverted `fileHashes` along with `upstream.version`. The
 * version marker was the visible symptom; this one was silent: four of five
 * adopter repos reported `.standards/ai-response-navigation.ai.yaml` as
 * modified while holding content byte-identical to what UDS ships.
 *
 * Nothing healed it. Actual state is hashed from disk, so a file matching
 * upstream is classed `unchanged`, produces no action, and is never re-hashed —
 * and `reconcile()` returned early when the action list was empty, so the
 * manifest was not even written. `uds check --restore` failed separately (see
 * check-restore-source.test.js).
 *
 * `computeDiff` now reports the files it PROVED identical to upstream, and the
 * reconciler corrects their recorded hashes.
 *
 * The safety property is the point of this file. Syncing the record to whatever
 * is on disk would absorb a hand edit and leave `uds check` unable to ever
 * report a modified standard again — emptying out the one thing it exists to
 * do. The last two cases are what stop that.
 */

import { describe, it, expect } from 'vitest';
import { computeDiff } from '../../../src/reconciler/diff-engine.js';

const entry = (relativePath, hash, size) => ({
  relativePath, hash, size, category: 'standard', sourcePath: `ai/standards/${relativePath}`, metadata: {}
});

/** Minimal state shape: only `standards` is populated; the rest must be present but empty. */
function states(desiredList, actualList) {
  const empty = () => new Map();
  const toMap = (list) => new Map(list.map((e) => [e.relativePath, e]));
  return [
    { standards: toMap(desiredList), options: empty(), integrations: empty(), skills: empty(), commands: empty() },
    { standards: toMap(actualList), options: empty(), integrations: empty(), skills: empty(), commands: empty() }
  ];
}

describe('computeDiff — verifiedPristine (XSPEC-382 R6)', () => {
  it('reports a file whose disk content matches upstream', () => {
    const [d, a] = states(
      [entry('a.ai.yaml', 'sha256:aaa', 100)],
      [entry('a.ai.yaml', 'sha256:aaa', 100)]
    );
    const plan = computeDiff(d, a);

    expect(plan.actions).toHaveLength(0);
    expect(plan.verifiedPristine).toEqual([{ path: 'a.ai.yaml', hash: 'sha256:aaa', size: 100 }]);
  });

  it('does NOT report a file whose disk content differs from upstream', () => {
    // The safety property. This entry is a real modification — recording its
    // disk hash would tell the integrity check that a hand edit is pristine.
    const [d, a] = states(
      [entry('a.ai.yaml', 'sha256:upstream', 100)],
      [entry('a.ai.yaml', 'sha256:handedited', 137)]
    );
    const plan = computeDiff(d, a);

    expect(plan.verifiedPristine).toEqual([]);
    expect(plan.actions.map((x) => x.type)).toEqual(['update']);
  });

  it('does NOT report anything under --force', () => {
    // Under force every file becomes an update action and is rewritten from
    // source, so the executor records the hashes. Reporting them here as well
    // would claim a file was verified identical when it was never compared.
    const [d, a] = states(
      [entry('a.ai.yaml', 'sha256:upstream', 100)],
      [entry('a.ai.yaml', 'sha256:handedited', 137)]
    );
    const plan = computeDiff(d, a, { force: true });

    expect(plan.verifiedPristine).toEqual([]);
    expect(plan.actions.map((x) => x.type)).toEqual(['update']);
  });

  it('separates pristine from modified in one pass', () => {
    // Both arms together: a plan containing both kinds must not leak one into
    // the other. A collector that returned every desired entry passes the first
    // case and fails this one.
    const [d, a] = states(
      [entry('ok.ai.yaml', 'sha256:same', 10), entry('edited.ai.yaml', 'sha256:upstream', 20)],
      [entry('ok.ai.yaml', 'sha256:same', 10), entry('edited.ai.yaml', 'sha256:local', 22)]
    );
    const plan = computeDiff(d, a);

    expect(plan.verifiedPristine.map((p) => p.path)).toEqual(['ok.ai.yaml']);
    expect(plan.actions.map((x) => x.path)).toEqual(['edited.ai.yaml']);
  });
});
