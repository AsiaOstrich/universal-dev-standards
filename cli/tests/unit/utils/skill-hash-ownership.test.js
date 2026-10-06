/**
 * XSPEC-454 R2 — which skillHashes records describe files UDS installed.
 */

import { describe, it, expect } from 'vitest';
import { isUdsSkillHashKey, pruneForeignSkillHashes, skillIssuesOf } from '../../../src/utils/skill-hash-ownership.js';

const shipped = new Set(['commit-standards', 'testing-guide', ...Array.from({ length: 10 }, (_, i) => `skill-${i}`)]);
const rec = { hash: 'sha256:x', size: 1, installedAt: 'then' };

describe('isUdsSkillHashKey', () => {
  it('accepts a file inside a skill UDS ships', () => {
    expect(isUdsSkillHashKey('claude-code/project/commit-standards/SKILL.md', shipped)).toBe(true);
    expect(isUdsSkillHashKey('opencode/user/testing-guide/sub/dir/file.md', shipped)).toBe(true);
  });

  it.each([
    ['a folder an old CLI copied in', 'claude-code/project/agents/README.md'],
    ['workflows', 'opencode/project/workflows/release.workflow.yaml'],
    ['_shared', 'claude-code/project/_shared/README.md'],
    ['the adopter\'s own skill', 'claude-code/project/my-own-skill/SKILL.md'],
    ['UDS\'s own bookkeeping file', 'claude-code/project/.manifest.json'],
    ['a malformed key', 'claude-code']
  ])('rejects %s', (_label, key) => {
    expect(isUdsSkillHashKey(key, shipped)).toBe(false);
  });
});

describe('pruneForeignSkillHashes', () => {
  it('drops exactly the records that are not UDS\'s and reports them sorted', () => {
    const manifest = {
      skillHashes: {
        'claude-code/project/commit-standards/SKILL.md': rec,
        'claude-code/project/agents/README.md': rec,
        'claude-code/project/_shared/README.md': rec,
        'claude-code/project/.manifest.json': rec
      }
    };
    const dropped = pruneForeignSkillHashes(manifest, shipped);
    expect(dropped).toEqual([
      'claude-code/project/.manifest.json',
      'claude-code/project/_shared/README.md',
      'claude-code/project/agents/README.md'
    ]);
    expect(Object.keys(manifest.skillHashes)).toEqual(['claude-code/project/commit-standards/SKILL.md']);
  });

  it('does nothing when the shipped list is implausibly small — a source tree that did not load must not empty the manifest', () => {
    const manifest = { skillHashes: { 'claude-code/project/commit-standards/SKILL.md': rec } };
    expect(pruneForeignSkillHashes(manifest, new Set(['commit-standards']))).toEqual([]);
    expect(pruneForeignSkillHashes(manifest, new Set())).toEqual([]);
    expect(Object.keys(manifest.skillHashes)).toHaveLength(1);
  });

  it('tolerates a manifest without skillHashes', () => {
    expect(pruneForeignSkillHashes({}, shipped)).toEqual([]);
    expect(pruneForeignSkillHashes(null, shipped)).toEqual([]);
  });
});

describe('skillIssuesOf', () => {
  it('is the missing and the modified files together, and empty when both are', () => {
    expect(skillIssuesOf({ missing: ['a'], modified: ['b'], unchanged: ['c'] })).toEqual(['a', 'b']);
    expect(skillIssuesOf({ missing: [], modified: [], unchanged: ['c'] })).toEqual([]);
    expect(skillIssuesOf({ tracked: false })).toEqual([]);
    expect(skillIssuesOf(undefined)).toEqual([]);
  });
});
