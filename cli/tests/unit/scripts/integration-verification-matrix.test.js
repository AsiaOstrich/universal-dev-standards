// XSPEC-357 R8 (AC-8.6, AC-8.7): the verification matrix logic, on invented records.
// The data that ships is checked in integration-verification-matrix-shipped-data.test.js.
//
// Expected strings are written out by hand. Computing them with the function under test would only prove that the
// function agrees with itself.
//
// Run: cd cli && npx vitest run tests/unit/scripts/integration-verification-matrix.test.js

import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import {
  CELLS,
  deriveStatus,
  renderMatrixPage,
  renderVerifiedCell,
  validateVerification
} from '../../../../scripts/lib/integration-verification-matrix.mjs';

const ROOT = resolve(import.meta.dirname, '..', '..', '..', '..');
const exists = (rel) => existsSync(join(ROOT, rel));
const ctx = { exists, today: new Date('2026-11-17') };

const passed = (date, extra = {}) => ({ status: 'verified', date, evidence: 'integrations/REGISTRY.json', ...extra });
const notYet = (reason = 'Not run.') => ({ status: 'unverified', reason });

/** A record whose five cells are as given; the overall status is set to what the cells add up to unless told otherwise. */
function record(cells, status) {
  const matrix = {
    install: notYet(), agentReads: notYet(), followsInTask: notYet(), violationDetected: notYet(), afterUpdate: notYet(),
    ...cells
  };
  return { status: status ?? deriveStatus(matrix), matrix };
}

const ALL_FIVE = {
  install: passed('2026-11-17'),
  agentReads: passed('2026-11-17', { probes: ['P7'] }),
  followsInTask: passed('2026-07-23', { toolVersion: 'codex-cli 0.145.0' }),
  violationDetected: passed('2026-11-17'),
  afterUpdate: passed('2026-11-17')
};

describe('the five cells', () => {
  it('are the five things XSPEC-357 R8 names, in the order the README shows them', () => {
    expect(CELLS.map((c) => c.key)).toEqual(['install', 'agentReads', 'followsInTask', 'violationDetected', 'afterUpdate']);
    expect(CELLS.map((c) => c.mark).join('')).toBe('①②③④⑤');
  });
});

describe('deriveStatus: verified only when all five cells are', () => {
  it('five verified cells: verified', () => {
    expect(deriveStatus(record(ALL_FIVE).matrix)).toBe('verified');
  });

  it('four verified cells and one not: not verified', () => {
    expect(deriveStatus(record({ ...ALL_FIVE, agentReads: notYet() }).matrix)).toBe('unverified');
  });

  it('one failed cell makes the tool failed, not merely unverified', () => {
    expect(deriveStatus(record({ ...ALL_FIVE, followsInTask: { status: 'failed', date: '2026-11-17', reason: 'x' } }).matrix)).toBe('failed');
  });

  it('a tool with no matrix at all is unverified, because absence is not optimism', () => {
    expect(deriveStatus(undefined)).toBe('unverified');
  });
});

describe('renderVerifiedCell: what the README shows', () => {
  it('all five passed: ✅ with the oldest date', () => {
    expect(renderVerifiedCell(record(ALL_FIVE))).toBe('✅ 2026-07-23');
  });

  it('Codex as recorded after R8: three cells today, one from 2026-07-23, one never run: 🔬 and both dates', () => {
    const codex = record({
      install: passed('2026-11-17'),
      followsInTask: passed('2026-07-23', { toolVersion: 'codex-cli 0.145.0' }),
      violationDetected: passed('2026-11-17'),
      afterUpdate: passed('2026-11-17')
    });
    expect(renderVerifiedCell(codex)).toBe('🔬 ①④⑤ 2026-11-17 · ③ 2026-07-23');
  });

  it('nothing passed: 🔬 —', () => {
    expect(renderVerifiedCell(record({}))).toBe('🔬 —');
  });
});

describe('validateVerification: a claim needs what makes it a claim', () => {
  it('a clean five-cell record has no problems', () => {
    const fresh = { ...ALL_FIVE, followsInTask: passed('2026-10-01', { toolVersion: 'codex-cli 0.145.0' }) };
    expect(validateVerification('t', record(fresh), ctx)).toEqual([]);
  });

  it('the Codex task-probe date of 2026-07-23 is already past the 90-day shelf life on 2026-11-17', () => {
    // The shipped checker pins its own clock to 2026-07-23 (scripts/check-integration-liveness.ts), so it does not flag this.
    expect(validateVerification('t', record(ALL_FIVE), ctx).join('\n')).toMatch(/followsInTask was verified 117 days ago/);
  });

  it('a record with no matrix is rejected', () => {
    expect(validateVerification('t', { status: 'unverified' }, ctx)[0]).toMatch(/matrix is missing/);
  });

  it('a verified cell without evidence is rejected', () => {
    const v = record({ ...ALL_FIVE, install: { status: 'verified', date: '2026-11-17' } });
    expect(validateVerification('t', v, ctx)).toContain('t.verification.matrix.install claims verified but has no evidence');
  });

  it('a verified cell whose evidence file does not exist is rejected', () => {
    const v = record({ ...ALL_FIVE, followsInTask: passed('2026-10-01', { toolVersion: 'x' }), install: passed('2026-11-17', { evidence: 'cli/tests/e2e/no-such-file.test.js' }) });
    expect(validateVerification('t', v, ctx).join('\n')).toMatch(/evidence points at "cli\/tests\/e2e\/no-such-file\.test\.js", which does not exist/);
  });

  it('a not-verified cell may point at partial evidence, and the file must exist', () => {
    const ok = record({ violationDetected: { status: 'unverified', reason: 'Partly covered.', partialEvidence: 'integrations/REGISTRY.json' } });
    expect(validateVerification('t', ok, ctx)).toEqual([]);
    const gone = record({ violationDetected: { status: 'unverified', reason: 'Partly covered.', partialEvidence: 'cli/tests/e2e/no-such-file.test.js' } });
    expect(validateVerification('t', gone, ctx)).toContain('t.verification.matrix.violationDetected.partialEvidence points at "cli/tests/e2e/no-such-file.test.js", which does not exist');
  });

  it('a cell that is not verified must say why', () => {
    const v = record({ afterUpdate: { status: 'unverified' } });
    expect(validateVerification('t', v, ctx)).toContain('t.verification.matrix.afterUpdate is unverified but gives no reason');
  });

  it('the overall status cannot be set by hand: "verified" over unverified cells is rejected', () => {
    const v = record({}, 'verified');
    expect(validateVerification('t', v, ctx).join('\n')).toMatch(/is "verified" but its five cells add up to "unverified"/);
  });

  it('AC-8.2: cell 2 cannot be verified by anything but a P7 run', () => {
    const v = record({ ...ALL_FIVE, agentReads: passed('2026-11-17', { probes: ['P2'] }) });
    expect(validateVerification('t', v, ctx).join('\n')).toMatch(/agentReads claims verified but names no P7 probe run/);
  });

  it('a verified cell past its shelf life is rejected', () => {
    const v = record({ ...ALL_FIVE, install: passed('2026-01-01') });
    expect(validateVerification('t', v, ctx).join('\n')).toMatch(/was verified 320 days ago \(shelf life 90\)/);
  });
});

describe('renderMatrixPage: text several tools share is printed once', () => {
  const reason = 'Not run: the tool is not installed on the machine that verifies.';
  const tool = (name, cells) => ({ name, tier: 'partial', verification: record(cells) });
  const registry = {
    agents: {
      a: tool('Tool A', { followsInTask: { status: 'unverified', reason } }),
      b: tool('Tool B', { followsInTask: { status: 'unverified', reason } }),
      c: tool('Tool C', { followsInTask: { status: 'unverified', reason: 'A reason only this tool has.' } })
    }
  };

  it('the shared reason appears once, each tool points to it, and the tool-specific reason stays where it is', () => {
    const page = renderMatrixPage(registry);
    expect(page.split(reason).length - 1, 'the shared reason is written once').toBe(1);
    expect(page).toContain('- ③ Follows it in a task: 🔬 unverified. See the shared reason above.');
    expect(page).toContain('- ③ Follows it in a task: 🔬 unverified. A reason only this tool has.');
  });

  it('a tool whose five cells all passed is counted as verified, and no other is', () => {
    const full = { ...registry, agents: { ...registry.agents, d: { name: 'Tool D', tier: 'partial', verification: record(ALL_FIVE) } } };
    expect(renderMatrixPage(registry)).toContain('3 live tools; **0 of them passed all five cells.**');
    expect(renderMatrixPage(full)).toContain('4 live tools; **1 of them passed all five cells.**');
  });
});
