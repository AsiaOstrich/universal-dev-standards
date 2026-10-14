/**
 * XSPEC-486 R2: the notice for a tool left out of a user-level install exists in every UI language of the init command.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { setLanguage, t } from '../../../src/i18n/messages.js';

afterEach(() => setLanguage('en'));

describe('commands.init.skillsNoUserPath (XSPEC-486)', () => {
  const seen = new Map();
  it.each(['en', 'zh-tw', 'zh-cn'])('%s has its own text, and it points to --skills-location project', (lang) => {
    setLanguage(lang);
    const text = t().commands.init.skillsNoUserPath;
    expect(typeof text).toBe('string');
    expect(text).toContain('--skills-location project');
    expect(seen.has(text), `${lang} repeats the text of ${seen.get(text)}`).toBe(false);
    seen.set(text, lang);
  });
});
