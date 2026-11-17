// XSPEC-357 R8 (AC-8.6, AC-8.7): the data and projections that ship, held to the matrix rules.
// Split from integration-verification-matrix.test.js, which tests the logic on invented records; this one reads the
// real REGISTRY.json, the three READMEs and the generated page.
//
// Run: cd cli && npx vitest run tests/unit/scripts/integration-verification-matrix-shipped-data.test.js

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import {
  CELLS,
  validateVerification,
  verifiedCellInReadme,
  renderMatrixPage
} from '../../../../scripts/lib/integration-verification-matrix.mjs';

const ROOT = resolve(import.meta.dirname, '..', '..', '..', '..');
const registry = JSON.parse(readFileSync(join(ROOT, 'integrations/REGISTRY.json'), 'utf8'));
const exists = (rel) => existsSync(join(ROOT, rel));

describe('the shipped registry and README under AC-8.6 and AC-8.7', () => {
  const live = Object.entries(registry.agents).filter(([, a]) => a.tier !== 'tool' && !a.deprecated);

  it('every live tool has a clean five-cell record', () => {
    expect(live.length).toBeGreaterThan(8);
    for (const [id, a] of live) {
      expect(validateVerification(id, a.verification, { exists, today: new Date('2026-07-23') }), id).toEqual([]);
    }
  });

  it('a tool is shown ✅ in the README only if its five cells all passed, in every README', () => {
    for (const readme of ['README.md', 'locales/zh-TW/README.md', 'locales/zh-CN/README.md']) {
      const text = readFileSync(join(ROOT, readme), 'utf8');
      for (const [, a] of live) {
        const shown = verifiedCellInReadme(text, a.name);
        expect(shown, `${readme}: a row for ${a.name}`).not.toBeNull();
        const all = CELLS.every((c) => a.verification.matrix[c.key].status === 'verified');
        expect(shown.startsWith('✅'), `${readme}: ${a.name} shows "${shown}"`).toBe(all);
      }
    }
  });

  it('Codex is not ✅ while its cell 2 has not been run, and its 2026-07-23 task-probe result is still on the row', () => {
    const codex = registry.agents.codex.verification.matrix;
    expect(codex.agentReads.status, 'this test describes the state before a P7 run is entered for Codex').not.toBe('verified');
    for (const readme of ['README.md', 'locales/zh-TW/README.md', 'locales/zh-CN/README.md']) {
      const shown = verifiedCellInReadme(readFileSync(join(ROOT, readme), 'utf8'), 'OpenAI Codex');
      expect(shown.startsWith('🔬'), `${readme}: "${shown}"`).toBe(true);
      expect(shown, `${readme}: the original date of the task probe`).toContain('③ 2026-07-23');
    }
  });

  it('the matrix page is exactly what the registry renders to', () => {
    const page = readFileSync(join(ROOT, 'docs/reference/INTEGRATION-VERIFICATION-MATRIX.md'), 'utf8').replace(/\r\n/g, '\n');
    expect(page).toBe(renderMatrixPage(registry));
  });
});
