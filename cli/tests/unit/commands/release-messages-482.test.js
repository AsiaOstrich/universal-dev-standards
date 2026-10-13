/**
 * `uds release` text follows the display language and the three tables say the same things (XSPEC-482 R14b).
 */
import { describe, it, expect, afterEach } from 'vitest';
import { releaseText } from '../../../src/commands/release-messages.js';
import { setLanguage } from '../../../src/i18n/messages.js';

afterEach(() => setLanguage('en'));

const tables = () => {
  const out = {};
  for (const lang of ['en', 'zh-tw', 'zh-cn']) {
    setLanguage(lang);
    out[lang] = releaseText();
  }
  return out;
};

describe('releaseText', () => {
  it('follows the display language', () => {
    const t = tables();
    expect(t.en.verifyPassed).toBe('✓ Manifest verified');
    expect(t['zh-tw'].verifyPassed).toBe('✓ Manifest 驗證通過');
    expect(t['zh-cn'].verifyPassed).toBe('✓ Manifest 验证通过');
  });

  it('the three languages have exactly the same entries', () => {
    const t = tables();
    expect(Object.keys(t['zh-tw']).sort()).toEqual(Object.keys(t.en).sort());
    expect(Object.keys(t['zh-cn']).sort()).toEqual(Object.keys(t.en).sort());
  });

  it('an entry that takes values puts them into the sentence in every language', () => {
    const t = tables();
    for (const lang of Object.keys(t)) {
      expect(t[lang].deployRecorded('1.2.0', 'staging'), lang).toContain('1.2.0');
      expect(t[lang].deployRecorded('1.2.0', 'staging'), lang).toContain('staging');
      expect(t[lang].step2('v1.2.0'), lang).toContain('git tag v1.2.0');
    }
  });

  it('the English table holds no Chinese and the Simplified one no Traditional-only character', () => {
    const t = tables();
    const text = (table) => Object.values(table).map((v) => (typeof v === 'function' ? v('x', 'y', 'z') : v)).join('\n');
    expect(text(t.en)).not.toMatch(/[一-鿿]/);
    // Characters whose Traditional form differs from the Simplified one, taken from words this table uses.
    expect(text(t['zh-cn'])).not.toMatch(/[驗證記錄產紀錄檔據請執點構時間狀態環僅]/);
  });
});
