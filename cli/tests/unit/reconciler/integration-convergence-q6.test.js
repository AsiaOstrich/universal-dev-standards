/**
 * XSPEC adopter-report Q6 — `uds update --plan` never converged.
 *
 * Real end-to-end reproduction (no mocks): generate a real CLAUDE.md the
 * same way `--apply` would, scan it back off disk, and diff it against the
 * desired state computed from the same manifest. Before this fix,
 * `diffIntegrations` unconditionally produced `migrate_block` for any file
 * with markers — so this would report `Migrate Block: 1` immediately after
 * writing content that IS already exactly what generation would produce.
 * Reported as: `--apply` followed by `--plan` still showing `Migrate Block: 2`,
 * with the file byte-identical across two consecutive `--apply` runs.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { calculateDesiredState } from '../../../src/reconciler/desired-state-calculator.js';
import { scanActualState } from '../../../src/reconciler/actual-state-scanner.js';
import { computeDiff } from '../../../src/reconciler/diff-engine.js';
import { writeIntegrationFile, buildToolIntegrationConfig } from '../../../src/utils/integration-generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DIR = join(__dirname, '../../temp/integration-convergence-q6');

function manifest() {
  return {
    format: 'ai',
    standards: ['anti-hallucination', 'commit-message'],
    extensions: [],
    integrations: ['claude-code'],
    options: {},
    contentMode: 'index',
    skills: { installed: false, installations: [] },
    commands: { installed: false, installations: [] }
  };
}

describe('reconciler convergence for integration files (Q6, real generation)', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('reports migrate_block: 0 immediately after writing exactly what generation produces', () => {
    const m = manifest();

    // Simulate what `--apply` does: generate and write the real file.
    const config = { ...buildToolIntegrationConfig(m, 'claude-code'), format: m.format };
    const writeResult = writeIntegrationFile('claude-code', config, TEST_DIR);
    expect(writeResult.success).toBe(true);
    expect(existsSync(join(TEST_DIR, 'CLAUDE.md'))).toBe(true);

    // Now compute a fresh plan the same way `--plan`/`--apply` would.
    const desired = calculateDesiredState(TEST_DIR, m);
    const actual = scanActualState(TEST_DIR, m);
    const plan = computeDiff(desired, actual);

    expect(plan.summary.migrate_block).toBe(0);
    expect(plan.actions.find((a) => a.path === 'CLAUDE.md' && a.type === 'migrate_block')).toBeUndefined();
  });

  it('converges after a second write too, even though the merge path is not byte-idempotent', () => {
    // 🔴 Separate, minor finding made while building this fix, not part of
    // Q6 itself: a first (no-existing-file) write embeds one trailing blank
    // line before <!-- UDS:STANDARDS:END --> that generateStandardsIndex's
    // own output carries; a second (merge-path) write loses it, because
    // updateMarkedSection's input already went through extractMarkedContent's
    // `.trim()`. The raw bytes of CLAUDE.md therefore differ between the
    // first and second write. This does not break convergence here because
    // hashing ALSO trims before hashing (both computeIntegrationBlockHash for
    // the actual file and the desired-state calculation below) — so the
    // hash this test cares about is identical either way. Not fixed here;
    // flagged for a follow-up XSPEC if a byte-for-byte idempotent write ever
    // matters (e.g. for a future signature/provenance scheme).
    const m = manifest();
    const config = { ...buildToolIntegrationConfig(m, 'claude-code'), format: m.format };

    writeIntegrationFile('claude-code', config, TEST_DIR);
    writeIntegrationFile('claude-code', config, TEST_DIR);

    const desired = calculateDesiredState(TEST_DIR, m);
    const actual = scanActualState(TEST_DIR, m);
    const plan = computeDiff(desired, actual);
    expect(plan.summary.migrate_block).toBe(0);
  });

  it('still reports migrate_block when the UDS block is genuinely stale (negative control)', () => {
    const m = manifest();
    const config = { ...buildToolIntegrationConfig(m, 'claude-code'), format: m.format };
    writeIntegrationFile('claude-code', config, TEST_DIR);

    // Hand-corrupt the block content to simulate a real drift (e.g. an
    // older generator's output, or a manual edit inside the markers).
    const filePath = join(TEST_DIR, 'CLAUDE.md');
    const current = readFileSync(filePath, 'utf-8');
    const staled = current.replace(
      '<!-- UDS:STANDARDS:START -->',
      '<!-- UDS:STANDARDS:START -->\nSTALE MARKER CONTENT THAT GENERATION WOULD NOT PRODUCE'
    );
    writeFileSync(filePath, staled);

    const desired = calculateDesiredState(TEST_DIR, m);
    const actual = scanActualState(TEST_DIR, m);
    const plan = computeDiff(desired, actual);

    expect(plan.summary.migrate_block).toBe(1);
    const action = plan.actions.find((a) => a.path === 'CLAUDE.md');
    expect(action.type).toBe('migrate_block');
  });
});
