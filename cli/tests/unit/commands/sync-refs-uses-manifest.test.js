/**
 * `uds update --sync-refs` regenerated integration files from a frozen snapshot.
 *
 * Reported 2026-09-16: a project whose manifest held 73 standards had its
 * CLAUDE.md rewritten to "76 條（core 76、options 0）" by `--sync-refs`, and
 * `uds check` then contradicted it — "索引宣告 76 條標準，manifest 實際有 73 條".
 * `uds update --integrations-only` produced the right number, which is what made
 * it look like a counting bug rather than a sourcing one.
 *
 * `syncIntegrationReferences` spread the stored `integrationConfigs[file]` into
 * the regeneration config, carrying `installedStandards` — a snapshot written at
 * install time and never refreshed — straight through. Whatever that snapshot
 * says becomes the file's content, including standards removed upstream two
 * majors ago. `buildToolIntegrationConfig`'s docblock already said this list
 * must not be honoured; the sync path was the one caller still doing it.
 */
import { describe, it, expect } from 'vitest';
import { refreshIntegrationConfig } from '../../../src/commands/update.js';

const manifest = () => ({
  format: 'ai',
  contentMode: 'index',
  standards: [
    'anti-hallucination',
    'commit-message',
    'ai/options/testing/unit-testing.ai.yaml'
  ],
  options: { output_language: 'traditional-chinese' },
  aiTools: ['claude-code'],
  integrations: ['CLAUDE.md']
});

// What an older CLI left behind: more entries than the manifest has, reduced to
// basenames, and including a standard that stopped shipping in 6.0.0.
const staleStored = {
  tool: 'claude-code',
  categories: ['anti-hallucination'],
  installedStandards: [
    'anti-hallucination.ai.yaml',
    'commit-message.ai.yaml',
    'unit-testing.ai.yaml',
    'workflow-enforcement.ai.yaml',
    'workflow-state-protocol.ai.yaml',
    'branch-completion.ai.yaml'
  ],
  outputLanguage: 'english'
};

describe('--sync-refs regenerates from the manifest, not the stored snapshot', () => {
  it('replaces installedStandards with what the manifest currently holds', () => {
    const fresh = refreshIntegrationConfig(manifest(), 'claude-code', staleStored, ['commit-standards']);

    // Every manifest entry is present...
    for (const std of manifest().standards) {
      expect(fresh.installedStandards).toContain(std);
    }
    // ...and nothing the snapshot invented survives. These three stopped
    // shipping in 6.0.0 and are the ones that inflated the adopter's count.
    for (const stale of ['workflow-enforcement.ai.yaml', 'workflow-state-protocol.ai.yaml', 'branch-completion.ai.yaml']) {
      expect(fresh.installedStandards).not.toContain(stale);
    }
    // The extra entries are option sources the manifest selected but did not
    // list under `standards` — added by buildToolIntegrationConfig, not carried
    // over from the snapshot, so every one of them must be an option path.
    const extras = fresh.installedStandards.filter((s) => !manifest().standards.includes(s));
    expect(extras.every((s) => s.includes('/options/'))).toBe(true);
  });

  it('keeps option paths intact so the index can still tell core from options', () => {
    const fresh = refreshIntegrationConfig(manifest(), 'claude-code', staleStored, []);

    // The snapshot had `unit-testing.ai.yaml` — a basename, indistinguishable
    // from a core standard. What comes back must carry the directory.
    expect(fresh.installedStandards).toContain('ai/options/testing/unit-testing.ai.yaml');
    expect(fresh.installedStandards).not.toContain('unit-testing.ai.yaml');
    expect(fresh.installedStandards.filter((s) => s.includes('/options/')).length).toBeGreaterThan(0);
  });

  it('takes the categories the caller computed from the current standards', () => {
    const fresh = refreshIntegrationConfig(manifest(), 'claude-code', staleStored, ['commit-standards', 'code-review']);

    expect(fresh.categories).toEqual(['commit-standards', 'code-review']);
  });

  it('prefers the manifest output language but falls back to the stored one', () => {
    const withLang = refreshIntegrationConfig(manifest(), 'claude-code', staleStored, []);
    expect(withLang.outputLanguage).toBe('traditional-chinese');

    const m = manifest();
    delete m.options.output_language;
    const withoutLang = refreshIntegrationConfig(m, 'claude-code', staleStored, []);
    expect(withoutLang.outputLanguage).toBe('english');
  });

  it('keeps fields the manifest knows nothing about', () => {
    const fresh = refreshIntegrationConfig(
      manifest(),
      'claude-code',
      { ...staleStored, generatedAt: '2026-01-01T00:00:00.000Z' },
      []
    );

    expect(fresh.generatedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});
