import { describe, it, expect } from 'vitest';
import { resolveToolKey, resolveIntegrationFile } from '../../../src/core/constants.js';

// XSPEC-343 R1：`manifest.integrations` 由兩條路徑以兩種形狀寫入
// （integration-installer 推檔案路徑、init.js:521 推工具鍵），
// 而讀取端分成**兩個陣營**，大致均衡：
//   期待檔名  ：hasher.js、check.js ×6（join(projectPath, int)、filter(i => i !== relativePath)）
//   期待工具鍵：desired-state-calculator、manifest-migrator、update.js:856
// 把資料正規化成任一種，就是修好一邊、弄壞另一邊——所以資料不動，讀取端全部經這兩個解析器。
//
// ⚠️ 一度真的做了「正規化為工具鍵」的 v3.5.0 遷移，而全套 3,240 個測試仍全綠。
// 那不代表安全，只代表檔名陣營那幾條路徑沒有覆蓋。該遷移已撤回。
describe('integration entry resolvers (XSPEC-343 R1)', () => {
  describe('the shape 20 of 21 adopter repos actually had — file names', () => {
    it('resolves to both a tool key and a file', () => {
      expect(resolveToolKey('CLAUDE.md')).toBe('claude-code');
      expect(resolveIntegrationFile('CLAUDE.md')).toBe('CLAUDE.md');
      expect(resolveToolKey('AGENTS.md')).toBe('opencode');
    });

    it('resolves absolute paths — two repos stored those', () => {
      expect(resolveToolKey('/Users/x/GitHub/proj/CLAUDE.md')).toBe('claude-code');
      expect(resolveIntegrationFile('/Users/x/GitHub/proj/INSTRUCTIONS.md')).toBe('INSTRUCTIONS.md');
    });

    it('resolves a tool whose file sits in a subdirectory', () => {
      expect(resolveToolKey('.github/copilot-instructions.md')).toBe('github-copilot');
      expect(resolveIntegrationFile('.github/copilot-instructions.md'))
        .toBe('.github/copilot-instructions.md');
    });
  });

  describe('the shape vibeops had — tool keys', () => {
    it('resolves to both, unchanged', () => {
      expect(resolveToolKey('claude-code')).toBe('claude-code');
      expect(resolveIntegrationFile('claude-code')).toBe('CLAUDE.md');
      expect(resolveIntegrationFile('gemini-cli')).toBe('GEMINI.md');
    });
  });

  describe('what must NOT resolve', () => {
    it('rejects lookalike filenames rather than matching on basename', () => {
      // A bare basename match would let an unrelated file be treated as the
      // managed integration — and check.js would then rewrite its UDS block.
      expect(resolveToolKey('MY-CLAUDE.md')).toBeNull();
      expect(resolveToolKey('CLAUDE.md.bak')).toBeNull();
      expect(resolveIntegrationFile('MY-CLAUDE.md')).toBeNull();
    });

    it('accepts a genuine path suffix', () => {
      // `docs/CLAUDE.md` DOES end with `/CLAUDE.md`; that is intended.
      expect(resolveToolKey('docs/CLAUDE.md')).toBe('claude-code');
    });

    it('returns null for junk rather than guessing', () => {
      expect(resolveToolKey('NOT-A-TOOL.md')).toBeNull();
      expect(resolveToolKey('')).toBeNull();
      expect(resolveToolKey(null)).toBeNull();
      expect(resolveToolKey(undefined)).toBeNull();
      expect(resolveIntegrationFile(42)).toBeNull();
    });
  });

  it('every SUPPORTED_AI_TOOLS file round-trips through both resolvers', async () => {
    const { SUPPORTED_AI_TOOLS } = await import('../../../src/core/constants.js');
    for (const [key, cfg] of Object.entries(SUPPORTED_AI_TOOLS)) {
      expect(resolveToolKey(cfg.file)).toBe(key);
      expect(resolveIntegrationFile(key)).toBe(cfg.file);
    }
  });
});
