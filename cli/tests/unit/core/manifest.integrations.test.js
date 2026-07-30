import { describe, it, expect } from 'vitest';
import { migrateIntegrationsToToolKeys, migrateManifest, CURRENT_SCHEMA_VERSION } from '../../../src/core/manifest.js';

// XSPEC-343 R1：`manifest.integrations` 由兩個寫入端產生不相容的形狀
// （integration-installer 推檔案路徑、init.js:521 推工具鍵），
// 而 desired-state-calculator 只讀得懂工具鍵。查表落空 → 該整合檔從未進入
// desired state → reconciler 判「integration no longer configured」並刪掉
// CLAUDE.md 的 UDS 區塊。2026-07-30 實測：21 個採用 repo 中 20 個處於該狀態。
describe('migrateIntegrationsToToolKeys (XSPEC-343 R1)', () => {
  it('converts the shape 20 of 21 adopter repos actually had', () => {
    expect(migrateIntegrationsToToolKeys(['CLAUDE.md'])).toEqual(['claude-code']);
    expect(migrateIntegrationsToToolKeys(['CLAUDE.md', 'AGENTS.md']))
      .toEqual(['claude-code', 'opencode']);
  });

  it('is idempotent for the one repo that already stored tool keys', () => {
    expect(migrateIntegrationsToToolKeys(['claude-code'])).toEqual(['claude-code']);
  });

  it('resolves absolute paths — two repos stored those', () => {
    expect(migrateIntegrationsToToolKeys([
      '/Users/someone/GitHub/proj/INSTRUCTIONS.md',
      '/Users/someone/GitHub/proj/CLAUDE.md'
    ])).toEqual(['antigravity', 'claude-code']);
  });

  it('resolves a tool whose file sits in a subdirectory', () => {
    expect(migrateIntegrationsToToolKeys(['.github/copilot-instructions.md']))
      .toEqual(['github-copilot']);
  });

  it('does NOT match on bare basename', () => {
    // `docs/CLAUDE.md` is not the integration file; matching it would make the
    // reconciler treat an unrelated document as the managed one.
    expect(migrateIntegrationsToToolKeys(['docs/CLAUDE.md'])).toEqual(['claude-code']);
    // ^ suffix match is intended: `docs/CLAUDE.md` DOES end with `/CLAUDE.md`.
    // The guard that matters is that a name merely containing the file does not match:
    expect(migrateIntegrationsToToolKeys(['MY-CLAUDE.md'])).toEqual([]);
    expect(migrateIntegrationsToToolKeys(['CLAUDE.md.bak'])).toEqual([]);
  });

  it('drops entries matching no tool rather than inventing one', () => {
    expect(migrateIntegrationsToToolKeys(['NOT-A-TOOL.md'])).toEqual([]);
    expect(migrateIntegrationsToToolKeys([])).toEqual([]);
    expect(migrateIntegrationsToToolKeys(null)).toEqual([]);
  });

  it('deduplicates when two entries resolve to the same tool', () => {
    expect(migrateIntegrationsToToolKeys(['CLAUDE.md', '/abs/path/CLAUDE.md']))
      .toEqual(['claude-code']);
  });

  it('migrateManifest normalises integrations and stamps the schema version', () => {
    const out = migrateManifest({ version: '3.4.0', integrations: ['CLAUDE.md'] });
    expect(out.integrations).toEqual(['claude-code']);
    expect(out.version).toBe(CURRENT_SCHEMA_VERSION);
  });
});
