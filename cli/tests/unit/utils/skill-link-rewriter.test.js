/**
 * rewriteOutsideLinks: which relative links of a skill file survive installing, and what the others become
 * (dev-platform #61).
 *
 * This file tests the decision rules on their own, with a made-up skill set, so each branch can fail alone.
 * The tests that install the real skills through the real `uds` binary are in
 * tests/unit/commands/skills-installed-links-61.test.js.
 */
import { describe, it, expect } from 'vitest';
import { rewriteOutsideLinks, isNotRelativeTarget } from '../../../src/utils/skill-link-rewriter.js';

const BLOB = 'https://github.com/AsiaOstrich/universal-dev-standards/blob/main/';
const TREE = 'https://github.com/AsiaOstrich/universal-dev-standards/tree/main/';

// What the made-up install writes: skill `alpha` has SKILL.md and guide.md; skill `beta` has only SKILL.md.
const INSTALLED = { alpha: ['SKILL.md', 'guide.md'], beta: ['SKILL.md'] };
// What exists in the made-up UDS repo (a path not listed here and not undefined-by-design is "not there").
const REPO = new Set([
  'core/testing-standards.md',
  'core/guides',
  'skills/alpha/references/deep.md',
  'skills/beta/docs/extra.md',
  'locales/zh-TW/core/testing-standards.md',
  'skills/commands/alpha.md'
]);

function ctx(overrides = {}) {
  return {
    skillName: 'alpha',
    sourcePath: 'skills/alpha/SKILL.md',
    isInstalledSkillFile: (skill, file) => (INSTALLED[skill] || []).includes(file),
    repoPathExists: (p) => (REPO.has(p) ? true : (p.startsWith('docs/') ? undefined : false)),
    ...overrides
  };
}

describe('rewriteOutsideLinks: links that still land on an installed file are kept as written', () => {
  it('keeps a link to another file of the same skill', () => {
    const r = rewriteOutsideLinks('See [guide](./guide.md) and [self](SKILL.md#top).', ctx());
    expect(r.text).toBe('See [guide](./guide.md) and [self](SKILL.md#top).');
    expect(r.kept).toEqual(['./guide.md', 'SKILL.md#top']);
    expect(r.rewritten).toEqual([]);
  });

  it('keeps a link to a file of a sibling skill the install also writes', () => {
    const r = rewriteOutsideLinks('[beta](../beta/SKILL.md)', ctx());
    expect(r.text).toBe('[beta](../beta/SKILL.md)');
    expect(r.kept).toEqual(['../beta/SKILL.md']);
  });

  it('rewrites a link to a sibling skill file the install does NOT write (the skill ships only SKILL.md)', () => {
    const r = rewriteOutsideLinks('[x](../beta/docs/extra.md)', ctx());
    expect(r.text).toBe(`[x](${BLOB}skills/beta/docs/extra.md)`);
    expect(r.kept).toEqual([]);
  });

  it('rewrites a link to a sibling folder that is not a skill at all', () => {
    const r = rewriteOutsideLinks('[c](../commands/alpha.md)', ctx());
    expect(r.text).toBe(`[c](${BLOB}skills/commands/alpha.md)`);
  });
});

describe('rewriteOutsideLinks: links that leave the install become GitHub addresses', () => {
  it('rewrites a repo-relative link to core/ and keeps the anchor', () => {
    const r = rewriteOutsideLinks('[t](../../core/testing-standards.md#unit-tests)', ctx());
    expect(r.text).toBe(`[t](${BLOB}core/testing-standards.md#unit-tests)`);
    expect(r.rewritten).toEqual([{
      from: '../../core/testing-standards.md#unit-tests',
      to: `${BLOB}core/testing-standards.md#unit-tests`,
      repoPath: 'core/testing-standards.md'
    }]);
  });

  it('resolves a localized file against its own place in the repo (locales/<locale>/skills/<name>/)', () => {
    const r = rewriteOutsideLinks('[t](../../core/testing-standards.md) [en](../../../../core/testing-standards.md)', ctx({
      sourcePath: 'locales/zh-TW/skills/alpha/SKILL.md'
    }));
    expect(r.text).toBe(`[t](${BLOB}locales/zh-TW/core/testing-standards.md) [en](${BLOB}core/testing-standards.md)`);
  });

  it('uses the tree address for a folder link (trailing slash)', () => {
    const r = rewriteOutsideLinks('[g](../../core/guides/)', ctx());
    expect(r.text).toBe(`[g](${TREE}core/guides/)`);
  });

  it('rewrites a link into a subfolder of the skill itself when that file is really there in the source', () => {
    const r = rewriteOutsideLinks('[d](references/deep.md)', ctx());
    expect(r.text).toBe(`[d](${BLOB}skills/alpha/references/deep.md)`);
  });

  it('rewrites a link whose target UDS cannot see (not part of the package), because it is not known to be absent', () => {
    const r = rewriteOutsideLinks('[s](../../docs/specs/x.md)', ctx());
    expect(r.text).toBe(`[s](${BLOB}docs/specs/x.md)`);
  });
});

describe('rewriteOutsideLinks: links that name nothing in UDS are left alone', () => {
  it('leaves a placeholder that stays inside the skill folder and is not in the source (a README template)', () => {
    const text = '[Docs](docs/) [Contrib](CONTRIBUTING.md)';
    const r = rewriteOutsideLinks(text, ctx());
    expect(r.text).toBe(text);
    expect(r.leftAlone).toEqual(['docs/', 'CONTRIBUTING.md']);
    expect(r.rewritten).toEqual([]);
  });

  it('leaves a link that leaves the skill folder when UDS can see the target is not there (already dead in the source)', () => {
    const text = '[gone](../../core/not-a-file.md)';
    const r = rewriteOutsideLinks(text, ctx());
    expect(r.text).toBe(text);
    expect(r.leftAlone).toEqual(['../../core/not-a-file.md']);
  });

  it('leaves a link that climbs out of the repo root unchanged and reports it', () => {
    const text = '[up](../../../../../x.md)';
    const r = rewriteOutsideLinks(text, ctx());
    expect(r.text).toBe(text);
    expect(r.unresolved).toEqual(['../../../../../x.md']);
  });
});

describe('rewriteOutsideLinks: what counts as a link', () => {
  it('does not touch links inside fenced code blocks (``` and ~~~) or inline code', () => {
    const text = [
      'Real: [a](../../core/testing-standards.md)',
      '```md',
      '[example](../../core/testing-standards.md)',
      '```',
      '~~~',
      '[tilde](../../core/testing-standards.md)',
      '~~~',
      'Inline: `[b](../../core/testing-standards.md)` and ``[c](../../core/testing-standards.md)``.'
    ].join('\n');
    const out = rewriteOutsideLinks(text, ctx()).text;
    const lines = out.split('\n');
    expect(lines[0]).toBe(`Real: [a](${BLOB}core/testing-standards.md)`);
    expect(lines.slice(1, 7)).toEqual(text.split('\n').slice(1, 7));
    expect(lines[7]).toBe(text.split('\n')[7]);
  });

  it('does not treat a fence that is never closed as code to the end of the file (an authoring slip, not code)', () => {
    // ```markdown holding ```bash blocks: the closing fence is lost and the reference list after it is meant as links.
    const text = ['```markdown', 'x', '```', 'text', '```', '- [ref](../../core/testing-standards.md)'].join('\n');
    const lines = rewriteOutsideLinks(text, ctx()).text.split('\n');
    expect(lines[5]).toBe(`- [ref](${BLOB}core/testing-standards.md)`);
  });

  it('rewrites images, reference-style definitions, titled links, angle-bracket targets and nested-label links', () => {
    const text = [
      '![img](../../core/testing-standards.md "T")',
      '[ref]: ../../core/testing-standards.md',
      '[titled](../../core/testing-standards.md "the title")',
      '[angle](<../../core/testing-standards.md>)',
      '[![badge](../../core/testing-standards.md)](../../core/testing-standards.md#a)'
    ].join('\n');
    const u = `${BLOB}core/testing-standards.md`;
    expect(rewriteOutsideLinks(text, ctx()).text.split('\n')).toEqual([
      `![img](${u} "T")`,
      `[ref]: ${u}`,
      `[titled](${u} "the title")`,
      `[angle](<${u}>)`,
      `[![badge](${u})](${u}#a)`
    ]);
  });

  it('leaves absolute URLs, mailto, protocol-relative, absolute paths and bare anchors alone', () => {
    const text = '[a](https://example.com/x.md) [b](mailto:x@y.z) [c](//cdn.example.com/x) [d](/abs/x.md) [e](#top)';
    const r = rewriteOutsideLinks(text, ctx());
    expect(r.text).toBe(text);
    expect(r.rewritten).toEqual([]);
    expect(r.kept).toEqual([]);
  });

  it('classifies targets the same way the checker in the entry test does', () => {
    expect(isNotRelativeTarget('https://x')).toBe(true);
    expect(isNotRelativeTarget('#a')).toBe(true);
    expect(isNotRelativeTarget('/a')).toBe(true);
    expect(isNotRelativeTarget('../a.md')).toBe(false);
    expect(isNotRelativeTarget('a.md#b')).toBe(false);
  });

  it('is idempotent: running it on its own output changes nothing', () => {
    const once = rewriteOutsideLinks('[t](../../core/testing-standards.md) [k](./guide.md)', ctx()).text;
    expect(rewriteOutsideLinks(once, ctx()).text).toBe(once);
  });
});
