/**
 * XSPEC-418 R6 has two independent defenses against an integration file
 * (CLAUDE.md, CLAUDE.local.md, AGENTS.md, ...) ending up in `fileHashes`:
 *
 *   (a) `regenerateIntegrations` never WRITES a per-item entry for one in the
 *       first place (the per-tool loop in update.js simply has no such code
 *       any more).
 *   (b) `pruneIntegrationFileHashes`, called at the end of the same function,
 *       REMOVES any entry — from this run or an older CLI — whose key is
 *       also in `integrationBlockHashes`.
 *
 * The two together mean that reverting EITHER one alone does not turn any
 * existing test red: defense (b) cleans up after a reintroduced (a), and
 * defense (a) means (b) usually has nothing to do. Confirmed by hand during
 * R6: an end-to-end test with both defenses reverted goes red; with only one
 * reverted, it stays green.
 *
 * These two tests isolate each defense so a future removal of either one —
 * on its own — is caught. They call `regenerateIntegrations` directly rather
 * than going through the CLI, and use a real temp directory with the real
 * `writeIntegrationFile` (no mocking of the write path itself).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

function baseManifest(overrides = {}) {
  return {
    version: '3.3.0',
    upstream: { repo: 'AsiaOstrich/universal-dev-standards', version: '6.10.0', installed: '2026-09-18' },
    format: 'ai',
    contentMode: 'index',
    standards: [],
    extensions: [],
    integrations: [],
    integrationConfigs: {},
    options: {},
    aiTools: ['claude-code'],
    skills: { installed: false, location: 'marketplace', names: [], version: null, installations: [] },
    commands: { installed: false, names: [], installations: [] },
    methodology: null,
    fileHashes: {},
    skillHashes: {},
    commandHashes: {},
    integrationBlockHashes: {},
    generateAgentsMd: false,
    ...overrides
  };
}

describe('XSPEC-418 R6: regenerateIntegrations fileHashes defenses, isolated', () => {
  let dir;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'uds-regen-fh-'));
    await mkdir(join(dir, '.claude'), { recursive: true });
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
    // `vi.doMock` registers past the current test — resetModules() alone
    // clears the import cache but not the mock registration, so the next
    // test's dynamic import of update.js would still resolve hasher.js to
    // the neutered pruneIntegrationFileHashes from the first test. Confirmed
    // by running: without doUnmock, defense (b)'s test failed even with the
    // real code in place, because it was still exercising defense (a)'s mock.
    vi.doUnmock('../../../src/utils/hasher.js');
    vi.resetModules();
  });

  it('defense (a): the per-item write never adds a fileHashes entry, even with pruning neutralized', async () => {
    vi.doMock('../../../src/utils/hasher.js', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        // Neutralize defense (b) — if this test still passes, it is because
        // (a) itself never wrote the entry, not because (b) cleaned it up.
        pruneIntegrationFileHashes: vi.fn(() => [])
      };
    });

    const { regenerateIntegrations } = await import('../../../src/commands/update.js');
    const manifest = baseManifest();

    const result = regenerateIntegrations(dir, manifest);

    expect(result.success).toBe(true);
    expect(result.updated).toContain('CLAUDE.md');
    expect(manifest.fileHashes['CLAUDE.md']).toBeUndefined();
    expect(manifest.integrationBlockHashes['CLAUDE.md']).toBeTruthy();
  });

  it('defense (b): a pre-existing stale fileHashes entry is removed, even if the per-item loop is not the one that wrote it', async () => {
    // No mocking here — real hasher.js. The point is that this entry was
    // NEVER produced by this call (it's seeded before regenerateIntegrations
    // ever runs), so only the trailing prune can be responsible for its
    // removal; defense (a) has nothing to do with this specific entry.
    const { regenerateIntegrations } = await import('../../../src/commands/update.js');
    const manifest = baseManifest({
      fileHashes: {
        'CLAUDE.md': { hash: 'sha256:stale-from-an-older-cli', size: 1, installedAt: '2020-01-01T00:00:00.000Z' }
      }
    });

    const result = regenerateIntegrations(dir, manifest);

    expect(result.success).toBe(true);
    expect(manifest.fileHashes['CLAUDE.md']).toBeUndefined();
    expect(manifest.integrationBlockHashes['CLAUDE.md']).toBeTruthy();
  });
});
