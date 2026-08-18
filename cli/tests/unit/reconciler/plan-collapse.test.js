/**
 * XSPEC-382 R3 — the plan must not bury real changes under unconditional reinstalls.
 *
 * A real 6.7.0 upgrade printed `Update (57)`: 55 rows carried one identical
 * reason (skills have no content comparison, R1) and 2 were the changes a
 * reviewer actually needed to approve. The two that mattered were the ones you
 * had to hunt for.
 *
 * Both arms are asserted deliberately. A collapse test that only checks "the 55
 * are gone" passes just as well for a `formatPlan` that drops every update row,
 * and that failure is invisible in the direction that matters: the plan looks
 * tidier while telling you less.
 */

import { describe, it, expect } from 'vitest';
import {
  formatPlan,
  UNCONDITIONAL_REINSTALL_REASON
} from '../../../src/reconciler/diff-engine.js';

/** Build a plan with `n` unconditional skill reinstalls plus the given real updates. */
function planWith(unconditionalCount, realUpdates = []) {
  const actions = [];
  for (let i = 0; i < unconditionalCount; i++) {
    actions.push({
      type: 'update',
      category: 'skill',
      path: `.claude/skills/skill-${i}/SKILL.md`,
      reason: UNCONDITIONAL_REINSTALL_REASON
    });
  }
  actions.push(...realUpdates);
  // Derived, not hand-written: a fixture whose summary disagrees with its own
  // actions would let an assertion about the total pass for the wrong reason.
  const summary = { create: 0, update: 0, delete: 0, migrate_block: 0, patch_hook: 0 };
  for (const a of actions) summary[a.type]++;
  return { actions, warnings: [], summary };
}

const realUpdate = (path, reason) => ({ type: 'update', category: 'standard', path, reason });

describe('formatPlan — unconditional reinstall collapse (XSPEC-382 R3)', () => {
  it('keeps the real changes visible', () => {
    const out = formatPlan(
      planWith(55, [
        realUpdate('.standards/commit-message.ai.yaml', 'content changed'),
        realUpdate('.standards/testing.ai.yaml', 'content changed')
      ])
    );

    // The whole point: a reviewer can see what this upgrade actually does.
    expect(out).toContain('.standards/commit-message.ai.yaml');
    expect(out).toContain('.standards/testing.ai.yaml');
  });

  it('collapses the unconditional rows instead of listing them', () => {
    const out = formatPlan(planWith(55, [realUpdate('.standards/testing.ai.yaml', 'content changed')]));

    expect(out).not.toContain('.claude/skills/skill-0/SKILL.md');
    expect(out).not.toContain('.claude/skills/skill-54/SKILL.md');
  });

  it('states how many were collapsed, and still reports the true total', () => {
    const out = formatPlan(planWith(55, [realUpdate('.standards/testing.ai.yaml', 'content changed')]));

    // The excluded count — a cap that does not announce itself reads as
    // "these are all of them", which is the defect this repo keeps re-finding.
    expect(out).toContain('55');
    // The denominator is unchanged: collapsing is a display choice, not a
    // smaller plan. 56 actions are still going to be executed.
    expect(out).toMatch(/~ Update \(56\)/);
  });

  it('leaves a plan with no unconditional rows completely untouched', () => {
    // Negative control. If the filter were inverted or over-broad, this arm
    // fires — the other three would not.
    const out = formatPlan(
      planWith(0, [
        realUpdate('.standards/a.ai.yaml', 'content changed'),
        realUpdate('.standards/b.ai.yaml', 'content changed')
      ])
    );

    expect(out).toContain('.standards/a.ai.yaml');
    expect(out).toContain('.standards/b.ai.yaml');
    expect(out).not.toMatch(/reinstalled unconditionally/);
    expect(out).toMatch(/~ Update \(2\)/);
  });

  it('says "item" not "items" for a single collapsed row', () => {
    const out = formatPlan(planWith(1, [realUpdate('.standards/a.ai.yaml', 'content changed')]));
    expect(out).toMatch(/1 UDS-managed item reinstalled/);
  });

  it('the Summary alone answers "how many actually changed" (R4)', () => {
    // R4 is triggered by R3 landing first: before this, the Summary said
    // `Update: 57` — true, and useless, because no number anywhere answered
    // how many things this upgrade actually changed. Someone who reads only
    // the Summary must not be left with that.
    const out = formatPlan(
      planWith(55, [
        realUpdate('.standards/a.ai.yaml', 'content changed'),
        realUpdate('.standards/b.ai.yaml', 'content changed')
      ])
    );
    expect(out).toMatch(/Update: 57 \(2 changed, 55 unconditional reinstall\)/);
  });

  it('leaves the Summary line plain when nothing was collapsed', () => {
    // Second arm: the annotation must not appear where it would be noise.
    const out = formatPlan(planWith(0, [realUpdate('.standards/a.ai.yaml', 'content changed')]));
    expect(out).toMatch(/Update: 1$/m);
  });

  it('the reason string is shared, not duplicated', () => {
    // If someone edits the reason at the production site and not here, the
    // collapse silently stops collapsing. Importing the constant is what makes
    // that impossible; this asserts the constant still exists and is non-empty
    // so a rename fails loudly rather than comparing against undefined.
    expect(typeof UNCONDITIONAL_REINSTALL_REASON).toBe('string');
    expect(UNCONDITIONAL_REINSTALL_REASON.length).toBeGreaterThan(0);
  });
});
