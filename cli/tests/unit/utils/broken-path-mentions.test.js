/**
 * Instructions pointed at files that are not there, and nothing looked.
 *
 * Reported 2026-09-16. Outside the UDS marker block, a CLAUDE.md written by an
 * older `uds init` still said:
 *
 *   參考: .standards/anti-hallucination.md
 *   優先讀取 core/ 中的精簡規則（例如 core/testing-standards.md）
 *
 * On a `format: ai`, `contentLayout: flat` project neither exists: the
 * standards are `*.ai.yaml` and no `core/` directory is ever installed. The
 * `.standards/*.md` half is repaired by the reference resolver as of 6.9.1; the
 * `core/` half is not, because it is not on a `Reference:` line and does not
 * start with `.standards/`, which is all `parseReferences` looks at.
 *
 * An AI tool following either one finds nothing. That is the failure the
 * reporter asked for a whole-file scan to catch, and the scan is deliberately
 * existence-based rather than shape-based: a project that genuinely has its own
 * `core/` directory is not doing anything wrong.
 */
import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { findBrokenPathMentions } from '../../../src/utils/reference-sync.js';

function project(files = {}, dirs = []) {
  const dir = mkdtempSync(join(tmpdir(), 'uds-mentions-'));
  for (const d of dirs) mkdirSync(join(dir, d), { recursive: true });
  for (const [name, contents] of Object.entries(files)) {
    mkdirSync(join(dir, name, '..'), { recursive: true });
    writeFileSync(join(dir, name), contents);
  }
  return dir;
}

describe('findBrokenPathMentions', () => {
  it('finds a core/ path that is not on disk, anywhere in the file', () => {
    const dir = project();
    try {
      const found = findBrokenPathMentions(
        '優先讀取 core/ 中的精簡規則（例如 core/testing-standards.md）\n',
        dir
      );
      expect(found).toContain('core/testing-standards.md');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('finds a .standards/ path that is not on disk, with no Reference label', () => {
    const dir = project({}, ['.standards']);
    try {
      const found = findBrokenPathMentions('see .standards/checkin-standards.md for the rules\n', dir);
      expect(found).toContain('.standards/checkin-standards.md');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('says nothing about a path that exists', () => {
    const dir = project({ '.standards/anti-hallucination.ai.yaml': 'id: x\n' }, ['.standards']);
    try {
      expect(findBrokenPathMentions('參考: .standards/anti-hallucination.ai.yaml\n', dir)).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('says nothing about a project that really does have a core/ directory', () => {
    const dir = project({ 'core/domain.ts': 'export {}\n' }, ['core']);
    try {
      expect(findBrokenPathMentions('the entry point is core/domain.ts\n', dir)).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not mistake a URL for a local path', () => {
    const dir = project();
    try {
      const found = findBrokenPathMentions(
        'see https://github.com/AsiaOstrich/universal-dev-standards/blob/main/core/testing-standards.md\n',
        dir
      );
      expect(found).toEqual([]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('strips the punctuation that ends a sentence, not the extension', () => {
    const dir = project();
    try {
      const found = findBrokenPathMentions('read core/testing-standards.md, then stop.\n', dir);
      expect(found).toEqual(['core/testing-standards.md']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reports each distinct path once however often it is mentioned', () => {
    const dir = project();
    try {
      const found = findBrokenPathMentions(
        'core/a.md and core/a.md again, plus core/b.md\n',
        dir
      );
      expect(found.sort()).toEqual(['core/a.md', 'core/b.md']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('returns nothing when it has no project to check against', () => {
    // Without a disk to ask, every answer would be a guess.
    expect(findBrokenPathMentions('core/testing-standards.md', null)).toEqual([]);
  });
});
