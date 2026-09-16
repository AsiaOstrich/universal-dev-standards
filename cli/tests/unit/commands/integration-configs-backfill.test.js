/**
 * P3 — `--sync-refs` told adopters to run a command that could not run.
 *
 * `integrationConfigs` is written by `uds init`'s interactive flow and by
 * `--sync-refs` itself; no update or reconcile path backfills it. A project
 * initialised with `uds init -y` therefore has `{}` from day one (reproduced on
 * a clean 6.9.0 project, 2026-09-16), `uds update --sync-refs` aborts with
 * "manifest 中找不到整合設定", and `uds check` kept recommending it.
 *
 * The manifest already holds everything the config is derived from, so it can be
 * rebuilt rather than demanded.
 */
import { describe, it, expect } from 'vitest';
import { backfillIntegrationConfigs } from '../../../src/commands/update.js';

const manifest = () => ({
  integrations: ['CLAUDE.md', 'AGENTS.md'],
  aiTools: ['claude-code', 'codex'],
  standards: ['anti-hallucination', 'commit-message'],
  options: { output_language: 'traditional-chinese', display_language: 'zh-tw' },
  format: 'ai',
  integrationConfigs: {}
});

describe('P3: integrationConfigs can be rebuilt from the manifest', () => {
  it('fills one entry per integration file, keyed by file name', () => {
    const m = manifest();

    const filled = backfillIntegrationConfigs(m);

    expect(filled).toBe(2);
    expect(Object.keys(m.integrationConfigs).sort()).toEqual(['AGENTS.md', 'CLAUDE.md']);
    expect(m.integrationConfigs['CLAUDE.md'].tool).toBe('claude-code');
    expect(m.integrationConfigs['CLAUDE.md'].categories.length).toBeGreaterThan(0);
  });

  it('never overwrites an entry that already exists', () => {
    const m = manifest();
    m.integrationConfigs['CLAUDE.md'] = { tool: 'claude-code', categories: ['commit-standards'], mine: true };

    const filled = backfillIntegrationConfigs(m);

    expect(filled).toBe(1);
    expect(m.integrationConfigs['CLAUDE.md'].mine).toBe(true);
  });

  it('reports nothing to do when there are no integrations', () => {
    const m = { integrations: [], aiTools: [], standards: [], integrationConfigs: {} };

    expect(backfillIntegrationConfigs(m)).toBe(0);
  });
});
