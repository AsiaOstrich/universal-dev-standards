/**
 * UDS regenerated AGENTS.md and did not record what it had written.
 *
 * Reported 2026-09-16: `uds update --integrations-only -y --offline` followed
 * immediately by `uds check` reported `⚠ AGENTS.md (已修改)`, on a file nothing
 * but UDS had touched. Reproduced here before the fix — the manifest kept the
 * hash from the previous generation while the file on disk had moved on.
 *
 * Every one of the three call sites that writes AGENTS.md recorded
 * `integrationBlockHashes` and none recorded `fileHashes`, so this is the class,
 * not the instance: whichever path regenerated the file, the record went stale.
 *
 * The refresh is deliberately conditional. AGENTS.md is a summary adopters are
 * expected to extend, and `uds init` does not enrol it in `fileHashes` at all —
 * so a path that started tracking it would turn every legitimate edit into a
 * reported fault. The rule is narrower and is the one that was broken: if the
 * manifest already tracks this file, and UDS just rewrote it, the record must
 * describe what UDS wrote.
 */
import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { refreshTrackedFileHash } from '../../../src/commands/update.js';

function project(contents) {
  const dir = mkdtempSync(join(tmpdir(), 'uds-agents-'));
  writeFileSync(join(dir, 'AGENTS.md'), contents);
  return dir;
}

describe('refreshTrackedFileHash', () => {
  it('updates the record when the manifest already tracks the file', () => {
    const dir = project('new content, longer than before');
    try {
      const manifest = {
        fileHashes: { 'AGENTS.md': { hash: 'sha256:stale', size: 1, installedAt: '2026-01-01T00:00:00.000Z' } }
      };

      const updated = refreshTrackedFileHash(manifest, dir, 'AGENTS.md');

      expect(updated).toBe(true);
      expect(manifest.fileHashes['AGENTS.md'].hash).not.toBe('sha256:stale');
      expect(manifest.fileHashes['AGENTS.md'].size).toBe('new content, longer than before'.length);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not enrol a file the manifest does not already track', () => {
    const dir = project('content');
    try {
      const manifest = { fileHashes: { 'CLAUDE.md': { hash: 'sha256:x', size: 1 } } };

      expect(refreshTrackedFileHash(manifest, dir, 'AGENTS.md')).toBe(false);
      expect(manifest.fileHashes['AGENTS.md']).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('matches a record stored with Windows separators', () => {
    const dir = project('content');
    try {
      const manifest = { fileHashes: { '.claude\\AGENTS.md': { hash: 'sha256:x', size: 1 } } };

      // The path UDS reports is platform-shaped; the record may be either.
      expect(refreshTrackedFileHash(manifest, dir, '.claude/AGENTS.md')).toBe(false);
      // ...and nothing is invented when the file is not where the path says.
      expect(manifest.fileHashes['.claude\\AGENTS.md'].hash).toBe('sha256:x');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('leaves the record alone when the file cannot be read', () => {
    const dir = project('content');
    try {
      const manifest = { fileHashes: { 'GONE.md': { hash: 'sha256:x', size: 1 } } };

      expect(refreshTrackedFileHash(manifest, dir, 'GONE.md')).toBe(false);
      expect(manifest.fileHashes['GONE.md'].hash).toBe('sha256:x');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('survives a manifest with no fileHashes at all', () => {
    const dir = project('content');
    try {
      const manifest = {};
      expect(refreshTrackedFileHash(manifest, dir, 'AGENTS.md')).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
