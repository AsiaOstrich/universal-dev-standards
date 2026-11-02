import { describe, it, expect } from 'vitest';
import { groupErrorsByCause, formatGroupedErrors, SAMPLE_NAMES } from '../../../src/utils/group-errors.js';
import { messages } from '../../../src/i18n/messages.js';

describe('groupErrorsByCause (board #81)', () => {
  it('merges errors whose text after the first ": " is word for word the same, in the order of the first member', () => {
    const groups = groupErrorsByCause(['a.md: no space', 'b.md: other', 'c.md: no space', 'd.md: no space']);
    expect(groups.map((g) => g.labels)).toEqual([['a.md', 'c.md', 'd.md'], ['b.md']]);
    expect(groups[0].cause).toBe('no space');
  });

  it('does not merge causes that name the file they were about', () => {
    const groups = groupErrorsByCause(['a.md: Could not copy "src/a.md" to "dst/a.md"', 'b.md: Could not copy "src/b.md" to "dst/b.md"']);
    expect(groups).toHaveLength(2);
  });

  it('splits at the FIRST ": " only, so a cause that contains ": " is kept whole', () => {
    const [group] = groupErrorsByCause(['core/a.md: EACCES: permission denied, open \'/x\'']);
    expect(group.labels).toEqual(['core/a.md']);
    expect(group.cause).toBe("EACCES: permission denied, open '/x'");
  });

  it('never merges strings without ": ", even when they are identical', () => {
    expect(groupErrorsByCause(['it broke', 'it broke'])).toHaveLength(2);
  });

  it('does not split a Windows drive letter ("C:\\x") that has no space after the colon', () => {
    const [group] = groupErrorsByCause(['C:\\proj\\a.md: gone']);
    expect(group.labels).toEqual(['C:\\proj\\a.md']);
  });
});

describe('formatGroupedErrors', () => {
  const en = messages.en.commands.init;
  const zh = messages['zh-tw'].commands.init;
  const many = Array.from({ length: 7 }, (_, i) => `std-${i}.md: the folder is read-only`);

  it('prints a shared cause once, then how many files it hit and the first three names', () => {
    expect(formatGroupedErrors(many, en)).toEqual([
      '    the folder is read-only',
      '      -> 7 files affected, the first 3: std-0.md, std-1.md, std-2.md'
    ]);
  });

  it('says "files affected: names" without "the first N" when every name fits', () => {
    expect(SAMPLE_NAMES).toBe(3);
    expect(formatGroupedErrors(['a.md: x', 'b.md: x'], en)).toEqual(['    x', '      -> 2 files affected: a.md, b.md']);
  });

  it('prints a single error exactly as it came, and keeps different causes as separate groups', () => {
    expect(formatGroupedErrors(['a.md: x', 'claude-code: EACCES: nope', 'b.md: x'], en)).toEqual([
      '    x',
      '      -> 2 files affected: a.md, b.md',
      '    claude-code: EACCES: nope'
    ]);
  });

  it('follows the language: Traditional and Simplified Chinese have their own sentences, none of the English one', () => {
    const lines = formatGroupedErrors(many, zh).join('\n');
    expect(lines).toContain('→ 影響 7 個檔案，前 3 個：std-0.md, std-1.md, std-2.md');
    expect(lines).not.toContain('files affected');
    expect(formatGroupedErrors(many, messages['zh-cn'].commands.init).join('\n')).toContain('→ 影响 7 个文件，前 3 个：');
  });

  it('falls back to English when the message table has no sentence for it', () => {
    expect(formatGroupedErrors(['a.md: x', 'b.md: x'], undefined)[1]).toContain('2 files affected');
  });
});
