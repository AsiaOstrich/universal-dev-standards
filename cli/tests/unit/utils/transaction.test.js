import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, mkdirSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { withFileTransaction } from '../../../src/utils/transaction.js';

// XSPEC-292 §9.2 (T11): generic backup -> apply -> verify -> rollback wrapper
// used to make multi-step, file-mutating CLI commands transactional.
describe('withFileTransaction', () => {
  let dir;
  beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'uds-tx-')); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  it('commits apply() changes when verify passes', async () => {
    const f = join(dir, 'a.txt');
    const { result } = await withFileTransaction([f], {
      apply: () => { writeFileSync(f, 'new'); return 'ok'; },
      verify: () => true
    });
    expect(result).toBe('ok');
    expect(readFileSync(f, 'utf8')).toBe('new');
  });

  it('rolls back a newly-created file when apply() throws', async () => {
    const f = join(dir, 'created.txt');
    await expect(withFileTransaction([f], {
      apply: () => { writeFileSync(f, 'partial'); throw new Error('boom'); }
    })).rejects.toThrow('boom');
    expect(existsSync(f)).toBe(false);
  });

  it('restores the original content of a pre-existing file on failure', async () => {
    const f = join(dir, 'existing.txt');
    writeFileSync(f, 'original');
    await expect(withFileTransaction([f], {
      apply: () => { writeFileSync(f, 'corrupted'); throw new Error('boom'); }
    })).rejects.toThrow('boom');
    expect(readFileSync(f, 'utf8')).toBe('original');
  });

  it('rolls back (and flags rolledBack) when verify() returns false', async () => {
    const f = join(dir, 'v.txt');
    const err = await withFileTransaction([f], {
      apply: () => { writeFileSync(f, 'x'); return { errors: ['bad'] }; },
      verify: (r) => r.errors.length === 0
    }).catch(e => e);
    expect(err).toBeInstanceOf(Error);
    expect(err.rolledBack).toBe(true);
    expect(existsSync(f)).toBe(false);
  });

  it('removes a directory created during apply() on failure (recursive)', async () => {
    const d = join(dir, '.standards');
    await expect(withFileTransaction([d], {
      apply: () => {
        mkdirSync(d, { recursive: true });
        writeFileSync(join(d, 'x.md'), 'y');
        throw new Error('boom');
      }
    })).rejects.toThrow('boom');
    expect(existsSync(d)).toBe(false);
  });

  it('does NOT destroy a pre-existing directory on rollback', async () => {
    const d = join(dir, 'shared');
    mkdirSync(d, { recursive: true });
    writeFileSync(join(d, 'keep.txt'), 'keep');
    await expect(withFileTransaction([d], {
      apply: () => { writeFileSync(join(d, 'new.txt'), 'new'); throw new Error('boom'); }
    })).rejects.toThrow('boom');
    // A directory we did not create is left intact (we cannot know its
    // original contents); callers must not track shared dirs they do not own.
    expect(existsSync(join(d, 'keep.txt'))).toBe(true);
  });

  it('rejects when apply is not a function', async () => {
    await expect(withFileTransaction([], {})).rejects.toThrow(/apply/);
  });
});
