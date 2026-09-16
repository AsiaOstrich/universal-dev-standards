/**
 * `--prune` left behind the records of files it told you to expect it to clean.
 *
 * The removal planner walks `.standards/` and decides what to delete. A file the
 * adopter already deleted by hand is not in that walk, so its `fileHashes` entry
 * survives every prune — and that entry is the whole reason `uds check` had
 * something to complain about. The check's new advice ("run `uds update
 * --prune`") would have been false the moment it was written; this is the half
 * that makes it true.
 *
 * Dropping the record is not a deletion: the file is already gone and UDS no
 * longer ships it, so there is nothing the entry could ever resolve to. Both
 * facts must hold — a missing file that UDS *does* still ship is a real fault
 * and stays reported.
 */
import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { pruneRetiredHashes } from '../../../src/commands/update.js';

function project() {
  const dir = mkdtempSync(join(tmpdir(), 'uds-prune-'));
  mkdirSync(join(dir, '.standards'), { recursive: true });
  return dir;
}

describe('pruneRetiredHashes', () => {
  it('drops the entry when the file is gone and UDS no longer ships it', () => {
    const dir = project();
    try {
      const manifest = {
        format: 'ai',
        fileHashes: {
          '.standards/workflow-enforcement.ai.yaml': { hash: 'sha256:x', size: 1 },
          '.standards/branch-completion.ai.yaml': { hash: 'sha256:y', size: 1 }
        }
      };

      const dropped = pruneRetiredHashes(manifest, dir);

      expect(dropped).toEqual([
        '.standards/branch-completion.ai.yaml',
        '.standards/workflow-enforcement.ai.yaml'
      ]);
      expect(Object.keys(manifest.fileHashes)).toHaveLength(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('keeps a missing file that UDS still ships — that one is a real fault', () => {
    const dir = project();
    try {
      const manifest = {
        format: 'ai',
        fileHashes: { '.standards/anti-hallucination.ai.yaml': { hash: 'sha256:x', size: 1 } }
      };

      expect(pruneRetiredHashes(manifest, dir)).toEqual([]);
      expect(manifest.fileHashes['.standards/anti-hallucination.ai.yaml']).toBeTruthy();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('keeps a descoped standard whose file is still on disk', () => {
    const dir = project();
    try {
      writeFileSync(join(dir, '.standards', 'workflow-enforcement.ai.yaml'), 'id: x\n');
      const manifest = {
        format: 'ai',
        fileHashes: { '.standards/workflow-enforcement.ai.yaml': { hash: 'sha256:x', size: 1 } }
      };

      // Removing the file is `--prune`'s job and is gated on ownership. This
      // function only ever forgets records of files that are already gone.
      expect(pruneRetiredHashes(manifest, dir)).toEqual([]);
      expect(manifest.fileHashes['.standards/workflow-enforcement.ai.yaml']).toBeTruthy();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('never touches anything outside .standards/', () => {
    const dir = project();
    try {
      const manifest = {
        format: 'ai',
        fileHashes: { 'CLAUDE.md': { hash: 'sha256:x', size: 1 } }
      };

      expect(pruneRetiredHashes(manifest, dir)).toEqual([]);
      expect(manifest.fileHashes['CLAUDE.md']).toBeTruthy();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does nothing at all when the registry looks unreadable', () => {
    const dir = project();
    try {
      const manifest = {
        format: 'ai',
        fileHashes: { '.standards/workflow-enforcement.ai.yaml': { hash: 'sha256:x', size: 1 } }
      };

      // An empty or tiny shippable set means the registry failed to load, not
      // that UDS stopped shipping everything. Acting on it would wipe the whole
      // manifest on a bad install.
      expect(pruneRetiredHashes(manifest, dir, { shippable: new Set(['a.ai.yaml']) })).toEqual([]);
      expect(Object.keys(manifest.fileHashes)).toHaveLength(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
