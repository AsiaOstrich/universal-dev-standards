/**
 * XSPEC-382 R1/R2 — skills finally compare by content.
 *
 * Every upgrade reprinted the same 55 skill rows because both sides of the diff
 * hardcoded `hash: null`: no content comparison was ever implemented.
 *
 * R1 as written proposed hashing the source directory on both sides. That was
 * refuted by measurement — installing is not a verbatim copy. A localized
 * SKILL.md gets English frontmatter merged in (brainstorm-assistant: 23,753
 * bytes of zh-TW source become 23,866 installed), the source directory is
 * chosen at runtime by locale with per-skill fallback, and subdirectories are
 * skipped. Built as specified, all 55 would have shown as CONTENT CHANGES on
 * every upgrade forever — indistinguishable from real ones, and worse than the
 * known absence of signal it replaced.
 *
 * So there is one function, `resolveSkillFiles`, that says what an install
 * would contain; the installer writes it and the planner hashes it. Verified
 * against a real installed repo: 110 files resolved byte-identical to disk,
 * 0 mismatches, and the 18 adopter-written skills correctly did not resolve.
 */

import { describe, it, expect } from 'vitest';
import { resolveSkillFiles, computeSkillContentHash } from '../../../src/utils/skills-installer.js';

describe('resolveSkillFiles (XSPEC-382 R1)', () => {
  it('resolves a real skill and reproduces installed content, not source content', () => {
    const en = resolveSkillFiles('brainstorm-assistant', 'en');
    const tw = resolveSkillFiles('brainstorm-assistant', 'zh-TW');

    expect(en.error).toBeNull();
    expect(tw.error).toBeNull();
    expect(tw.fallbackToEn).toBe(false);

    const enSkill = en.files.find((f) => f.name === 'SKILL.md');
    const twSkill = tw.files.find((f) => f.name === 'SKILL.md');
    expect(enSkill).toBeTruthy();
    expect(twSkill).toBeTruthy();

    // The locale resolution is real: the two differ. Without this the whole
    // mechanism could be resolving English for everyone and still look correct.
    expect(twSkill.content).not.toBe(enSkill.content);

    // Frontmatter merged from English into the localized file — this is the
    // reason a source-directory hash can never match what is installed.
    expect(twSkill.content).toMatch(/^---/);
    expect(twSkill.content).toContain('name:');
  });

  it('returns files sorted by name, so the hash does not depend on directory order', () => {
    const r = resolveSkillFiles('brainstorm-assistant', 'en');
    const names = r.files.map((f) => f.name);
    expect(names).toEqual([...names].sort());
  });

  it('reports an unknown skill as an error rather than as empty', () => {
    // Negative control. Returning `{files: []}` would hash to null and read as
    // "nothing to compare", which is how an adopter's own skill would silently
    // become a UDS one.
    const r = resolveSkillFiles('no-such-skill-anywhere', 'en');
    expect(r.error).toBeTruthy();
    expect(r.files).toEqual([]);
  });

  it('falls back to English for a locale variant that does not exist', () => {
    const r = resolveSkillFiles('brainstorm-assistant', 'zz-ZZ');
    // Not a localized locale at all → treated as English, no fallback flag.
    expect(r.error).toBeNull();
    expect(r.files.length).toBeGreaterThan(0);
  });
});

describe('computeSkillContentHash (XSPEC-382 R1)', () => {
  it('changes when content changes', () => {
    const a = computeSkillContentHash([{ name: 'SKILL.md', content: 'one' }]);
    const b = computeSkillContentHash([{ name: 'SKILL.md', content: 'two' }]);
    expect(a).not.toBe(b);
  });

  it('changes when a file is renamed', () => {
    // Names are hashed too. Contents alone would call a rename "unchanged",
    // and the installed directory would keep a file UDS no longer ships.
    const a = computeSkillContentHash([{ name: 'SKILL.md', content: 'x' }]);
    const b = computeSkillContentHash([{ name: 'GUIDE.md', content: 'x' }]);
    expect(a).not.toBe(b);
  });

  it('is stable for the same input', () => {
    const files = [{ name: 'a.md', content: '1' }, { name: 'b.md', content: '2' }];
    expect(computeSkillContentHash(files)).toBe(computeSkillContentHash(files));
  });

  it('cannot be fooled by moving content across the name/content boundary', () => {
    // Without a separator, {name:'ab', content:'c'} and {name:'a', content:'bc'}
    // would hash identically. The NUL delimiters are what stop that.
    const a = computeSkillContentHash([{ name: 'ab', content: 'c' }]);
    const b = computeSkillContentHash([{ name: 'a', content: 'bc' }]);
    expect(a).not.toBe(b);
  });

  it('returns null for an empty resolution', () => {
    expect(computeSkillContentHash([])).toBeNull();
    expect(computeSkillContentHash(null)).toBeNull();
  });
});
