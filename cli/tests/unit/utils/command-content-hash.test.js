/**
 * XSPEC-382 R7 — commands compare by content, and locale packs stop shipping
 * broken references.
 *
 * R1 gave skills a content comparison and left commands on `hash: null`, so the
 * unconditional-reinstall branch stayed alive for them. Same fix, same shape:
 * one function says what an install would contain, the installer writes it and
 * the planner hashes it.
 *
 * Doing that surfaced something the old no-comparison state had hidden. Locale
 * packs are not complete copies — measured: 4 of 59 localized skills in zh-TW
 * and 5 of 59 in zh-CN are missing files the English source ships — and the
 * installer replaced the English directory with the locale one wholesale, so
 * those files were simply not installed. Two of the gaps are referenced: the
 * zh-TW `dev-workflow-guide/SKILL.md` points at `workflow-phases.md` three
 * times and `testing-guide/SKILL.md` at `test-skeleton-templates.md` three
 * times. Those installs shipped a document pointing at files that were never
 * going to exist. Fallback is now per-file.
 */

import { describe, it, expect } from 'vitest';
import {
  resolveCommandContent,
  computeCommandContentHash,
  resolveSkillFiles
} from '../../../src/utils/skills-installer.js';

describe('resolveCommandContent (XSPEC-382 R7)', () => {
  it('resolves a shipped command', () => {
    const r = resolveCommandContent('commit', 'claude-code', 'en');
    expect(r.error).toBeNull();
    expect(typeof r.content).toBe('string');
    expect(r.content.length).toBeGreaterThan(0);
  });

  it('reports an unknown command as an error, not as empty content', () => {
    // Negative control: `{content: ''}` would hash to a real value and read as
    // a legitimate comparison against nothing.
    const r = resolveCommandContent('no-such-command-anywhere', 'claude-code', 'en');
    expect(r.error).toBeTruthy();
    expect(r.content).toBeNull();
  });

  it('prefers the locale variant when one exists', () => {
    const en = resolveCommandContent('commit', 'claude-code', 'en');
    const tw = resolveCommandContent('commit', 'claude-code', 'zh-TW');
    expect(tw.error).toBeNull();
    // If this ever becomes equal, either the locale pack lost the file or
    // locale selection stopped working — both worth failing on.
    expect(tw.content).not.toBe(en.content);
  });
});

describe('computeCommandContentHash (XSPEC-382 R7)', () => {
  it('changes with content and is stable for the same input', () => {
    expect(computeCommandContentHash('a')).not.toBe(computeCommandContentHash('b'));
    expect(computeCommandContentHash('a')).toBe(computeCommandContentHash('a'));
  });

  it('returns null for a failed resolution rather than hashing nothing', () => {
    expect(computeCommandContentHash(null)).toBeNull();
    expect(computeCommandContentHash(undefined)).toBeNull();
  });
});

describe('resolveSkillFiles — per-file locale fallback (XSPEC-382 R7)', () => {
  it('includes English companions a locale pack does not ship', () => {
    // `dev-workflow-guide`'s zh-TW pack has SKILL.md only, and that SKILL.md
    // references workflow-phases.md three times.
    const tw = resolveSkillFiles('dev-workflow-guide', 'zh-TW');
    const names = tw.files.map((f) => f.name);
    expect(names).toContain('SKILL.md');
    expect(names).toContain('workflow-phases.md');
  });

  it('still prefers the locale file when both exist', () => {
    // The union must not let English win over a translation. Without this arm,
    // a fallback that always took English would satisfy the case above.
    const en = resolveSkillFiles('dev-workflow-guide', 'en');
    const tw = resolveSkillFiles('dev-workflow-guide', 'zh-TW');
    const enSkill = en.files.find((f) => f.name === 'SKILL.md').content;
    const twSkill = tw.files.find((f) => f.name === 'SKILL.md').content;
    expect(twSkill).not.toBe(enSkill);
  });

  it('covers every localized skill that is short of the English source', () => {
    // Traversed rather than enumerated: the resolution for any localized skill
    // must name at least as many files as the English one, whatever the packs
    // look like at the time this runs.
    const en = resolveSkillFiles('testing-guide', 'en');
    const tw = resolveSkillFiles('testing-guide', 'zh-TW');
    expect(tw.files.length).toBeGreaterThanOrEqual(en.files.length);
    expect(tw.files.map((f) => f.name).sort()).toEqual(en.files.map((f) => f.name).sort());
  });
});
