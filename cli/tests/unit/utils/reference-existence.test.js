/**
 * P2 (check side) — a reference to a file that is not there is not "in sync".
 *
 * `compareStandardsWithReferences` matched on the stem with the extension
 * stripped, so `.standards/anti-hallucination.md` counted as synced whenever the
 * manifest adopted `anti-hallucination` — even though the project holds
 * `anti-hallucination.ai.yaml` and the `.md` file does not exist. Nothing in
 * reference-sync.js ever asked the disk.
 *
 * P5 — options are adopted in `manifest.options`, not `manifest.standards`, so
 * every `.standards/options/...` reference was reported as "not in manifest".
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { compareStandardsWithReferences } from '../../../src/utils/reference-sync.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_DIR = join(__dirname, '../../temp/reference-existence');

describe('P2/P5: reference comparison knows what is on disk', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(join(TEST_DIR, '.standards/options'), { recursive: true });
    writeFileSync(join(TEST_DIR, '.standards/anti-hallucination.ai.yaml'), 'id: anti-hallucination\n');
    writeFileSync(join(TEST_DIR, '.standards/options/traditional-chinese.ai.yaml'), 'id: traditional-chinese\n');
  });
  afterEach(() => rmSync(TEST_DIR, { recursive: true, force: true }));

  it('reports a reference whose file does not exist', () => {
    const result = compareStandardsWithReferences(
      ['anti-hallucination'],
      ['anti-hallucination.md'],
      { projectPath: TEST_DIR }
    );

    expect(result.danglingRefs).toEqual(['anti-hallucination.md']);
  });

  it('accepts the reference that does exist', () => {
    const result = compareStandardsWithReferences(
      ['anti-hallucination'],
      ['anti-hallucination.ai.yaml'],
      { projectPath: TEST_DIR }
    );

    expect(result.danglingRefs).toEqual([]);
    expect(result.orphanedRefs).toEqual([]);
  });

  it('does not call an installed option file an orphan', () => {
    const result = compareStandardsWithReferences(
      ['anti-hallucination'],
      ['options/traditional-chinese.ai.yaml'],
      { projectPath: TEST_DIR, options: { commit_language: 'traditional-chinese' } }
    );

    expect(result.orphanedRefs).toEqual([]);
    expect(result.danglingRefs).toEqual([]);
  });

  it('still works without a projectPath (no existence claim, no false dangling)', () => {
    const result = compareStandardsWithReferences(['anti-hallucination'], ['anti-hallucination.md']);

    expect(result.danglingRefs).toEqual([]);
  });
});
