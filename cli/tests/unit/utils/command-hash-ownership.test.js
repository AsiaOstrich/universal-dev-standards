/**
 * XSPEC-454 R2 (Commands) — which commandHashes records `uds check` may hold a project to.
 */

import { describe, it, expect } from 'vitest';
import {
  isUdsCommandHashKey,
  pruneForeignCommandHashes,
  agentsWithCommandsOutsideProject,
  projectCommandHashes,
  commandIssuesOf
} from '../../../src/utils/command-hash-ownership.js';

const shipped = new Set(['commit', 'tdd', ...Array.from({ length: 10 }, (_, i) => `cmd-${i}`)]);
const rec = { hash: 'sha256:x', size: 1, installedAt: 'then' };

describe('isUdsCommandHashKey', () => {
  it('accepts a shipped command with the agent\'s own extension', () => {
    expect(isUdsCommandHashKey('opencode/commit.md', shipped)).toBe(true);
    expect(isUdsCommandHashKey('gemini-cli/tdd.toml', shipped)).toBe(true);
  });
  it.each([
    ['a retired command', 'opencode/retired.md'],
    ['the wrong extension for the agent', 'gemini-cli/commit.md'],
    ['a nested path', 'opencode/sub/commit.md'],
    ['no file part', 'opencode']
  ])('rejects %s', (_l, key) => {
    expect(isUdsCommandHashKey(key, shipped)).toBe(false);
  });
});

describe('pruneForeignCommandHashes', () => {
  it('drops only the records for commands UDS does not ship', () => {
    const manifest = { commandHashes: { 'opencode/commit.md': rec, 'opencode/retired.md': rec } };
    expect(pruneForeignCommandHashes(manifest, shipped)).toEqual(['opencode/retired.md']);
    expect(Object.keys(manifest.commandHashes)).toEqual(['opencode/commit.md']);
  });
  it('does nothing when the shipped list is implausibly small', () => {
    const manifest = { commandHashes: { 'opencode/commit.md': rec } };
    expect(pruneForeignCommandHashes(manifest, new Set(['commit']))).toEqual([]);
    expect(pruneForeignCommandHashes({}, shipped)).toEqual([]);
  });
});

describe('records for commands installed outside the project', () => {
  const manifest = {
    commands: { installations: [{ agent: 'opencode', level: 'project' }, { agent: 'gemini-cli', level: 'user' }, 'codex', { agent: 'cursor', level: 'user' }, { agent: 'cursor', level: 'project' }] },
    commandHashes: { 'opencode/commit.md': rec, 'gemini-cli/commit.toml': rec, 'codex/commit.md': rec, 'cursor/commit.md': rec }
  };
  it('names an agent only when it has no project-level installation', () => {
    expect([...agentsWithCommandsOutsideProject(manifest)]).toEqual(['gemini-cli']);
  });
  it('sets those records aside and keeps the rest (a legacy manifest with no installations keeps everything)', () => {
    const { hashes, ignored } = projectCommandHashes(manifest);
    expect(ignored).toEqual(['gemini-cli/commit.toml']);
    expect(Object.keys(hashes).sort()).toEqual(['codex/commit.md', 'cursor/commit.md', 'opencode/commit.md']);
    expect(projectCommandHashes({ commandHashes: { 'opencode/commit.md': rec } }).ignored).toEqual([]);
  });
});

describe('commandIssuesOf', () => {
  it('is the missing and the modified files together; untracked ones are advice, not issues', () => {
    expect(commandIssuesOf({ missing: ['a'], modified: ['b'], untracked: ['c'] })).toEqual(['a', 'b']);
    expect(commandIssuesOf(undefined)).toEqual([]);
  });
});
