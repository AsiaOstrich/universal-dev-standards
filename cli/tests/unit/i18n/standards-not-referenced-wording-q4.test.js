/**
 * XSPEC adopter-report Q4 — two `uds check` messages both use "referenced"
 * ("參考"/"referenced") for two DIFFERENT measurements, and can print in the
 * same run contradicting each other.
 *
 * `standardsReferenced` ("{count}/{total} standards referenced" /
 * "{count}/{total} 項標準已參考") comes from checkAiToolIntegration, which
 * scans the WHOLE integration file body (or an index-mode declared count) —
 * see check.js around `idToFilenames`/`content.includes(stdFile)`.
 *
 * `standardsNotReferenced` ("Standards not referenced (optional):" /
 * "未參考的標準（選用）：") comes from checkReferenceSync, which only looks
 * at structured "Reference:"/"參考:" lines (reference-sync.js
 * parseReferences).
 *
 * A standard mentioned in the file body but never listed on a "Reference:"
 * line satisfies the first ("referenced") and fails the second ("not
 * referenced") in the same `uds check` run — same word, two different
 * questions. Renamed the second message to say precisely what it measured
 * (absence from a "Reference:" line) instead of the ambiguous blanket claim.
 */
import { describe, it, expect } from 'vitest';
import { setLanguage, t } from '../../../src/i18n/messages.js';

describe('standardsNotReferenced wording no longer contradicts standardsReferenced (Q4)', () => {
  const cases = [
    { lang: 'en', mustNotContain: /^Standards not referenced/i },
    { lang: 'zh-tw', mustNotContain: /^未參考的標準/ },
    { lang: 'zh-cn', mustNotContain: /^未引用的标准/ }
  ];

  it.each(cases)('$lang: no longer makes the blanket "not referenced" claim', ({ lang, mustNotContain }) => {
    setLanguage(lang);
    const msg = t().commands.check.standardsNotReferenced;
    expect(msg).not.toMatch(mustNotContain);
  });

  it.each(cases)('$lang: instead names the specific thing it measured — a "Reference:" line', ({ lang }) => {
    setLanguage(lang);
    const msg = t().commands.check.standardsNotReferenced;
    // Must still mention the Reference:/參考: line concept, just scoped —
    // this is not "remove the message", it is "say what it actually checked".
    expect(msg.toLowerCase()).toMatch(/reference|參考|引用/);
  });
});
