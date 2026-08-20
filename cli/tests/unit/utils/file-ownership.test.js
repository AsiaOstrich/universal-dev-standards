import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  planStandardsRemovals,
  classifyFileOwnership,
  classifyStandardsFiles,
  FILE_OWNERSHIP
} from '../../../src/utils/hasher.js';
import {
  recordFileProvenance,
  establishProvenance,
  isProvenanceEstablished
} from '../../../src/core/manifest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/file-ownership-test');

/**
 * XSPEC-384 — `uds update` had no concept of "whose file is this".
 *
 * Two users reported opposite defects in the same command:
 *
 *   #165 it does not delete what it should — a standard removed from the
 *        registry keeps its `.ai.yaml` and its manifest entry forever.
 *   #168 it deletes what it must not — a hand-written project file under
 *        `.standards/` vanished with no warning, diff, prompt, or backup.
 *
 * Both fall out of one predicate: membership in `manifest.fileHashes` was used
 * to answer two independent questions — "did UDS write this" and "is this still
 * a current standard". A boolean cannot carry two axes, and each issue is one
 * end of the overloaded one.
 *
 * The two tests below therefore pin the same function from opposite sides. That
 * is deliberate: a fix for either one that reintroduces the single axis breaks
 * the other, which is exactly what splitting the two issues into two patches
 * would have risked.
 */
function writeFile(rel, content) {
  const full = join(TEST_DIR, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  return full;
}

describe('XSPEC-384 — file ownership under .standards/', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
  });

  describe('issue #168 — a file UDS never wrote must survive `uds update`', () => {
    it('does not nominate a hand-written project file for removal', () => {
      writeFile('.standards/manifest.json', '{}');
      writeFile('.standards/commit-message.ai.yaml', 'id: commit-message');
      // The reporter's file: written by hand, never by UDS.
      writeFile('.standards/migration-risks-portal.md', '# Migration risks');

      // Provenance records what UDS actually wrote. The hand-written file is
      // absent from it, which is the whole evidence that it is not ours.
      let manifest = {
        fileHashes: {
          '.standards/commit-message.ai.yaml': { hash: 'sha256:abc', size: 20 }
        }
      };
      manifest = recordFileProvenance(manifest, '.standards/commit-message.ai.yaml', 'update');
      manifest = establishProvenance(manifest);

      const desired = new Set(['.standards/commit-message.ai.yaml']);
      const plan = planStandardsRemovals(TEST_DIR, manifest, desired);

      const nominated = plan.remove.map(r => r.path);
      expect(nominated).not.toContain('.standards/migration-risks-portal.md');
      expect(existsSync(join(TEST_DIR, '.standards/migration-risks-portal.md'))).toBe(true);
    });

    it('classifies a file UDS never wrote as foreign, not merely untracked', () => {
      let manifest = { fileHashes: {} };
      manifest = establishProvenance(manifest);

      expect(classifyFileOwnership('.standards/migration-risks-portal.md', manifest))
        .toBe(FILE_OWNERSHIP.FOREIGN);
    });

    it('refuses to delete when ownership cannot be determined (legacy manifest)', () => {
      writeFile('.standards/manifest.json', '{}');
      writeFile('.standards/mystery.ai.yaml', 'id: mystery');

      // A manifest written before provenance existed: no record either way.
      const manifest = { fileHashes: {} };
      expect(isProvenanceEstablished(manifest)).toBe(false);

      const plan = planStandardsRemovals(TEST_DIR, manifest, new Set());

      expect(plan.remove.map(r => r.path)).not.toContain('.standards/mystery.ai.yaml');
      expect(classifyFileOwnership('.standards/mystery.ai.yaml', manifest))
        .toBe(FILE_OWNERSHIP.UNKNOWN);
    });
  });

  describe('issue #165 — a standard dropped from the registry must really go', () => {
    it('nominates a UDS-written file that is no longer in the desired set', () => {
      writeFile('.standards/manifest.json', '{}');
      writeFile('.standards/commit-message.ai.yaml', 'id: commit-message');
      // Installed by an older UDS; the registry no longer ships it.
      writeFile('.standards/retired-standard.ai.yaml', 'id: retired-standard');

      let manifest = {
        fileHashes: {
          '.standards/commit-message.ai.yaml': { hash: 'sha256:abc', size: 20 },
          '.standards/retired-standard.ai.yaml': { hash: 'sha256:def', size: 21 }
        }
      };
      manifest = recordFileProvenance(manifest, '.standards/commit-message.ai.yaml', 'update');
      manifest = recordFileProvenance(manifest, '.standards/retired-standard.ai.yaml', 'init');
      manifest = establishProvenance(manifest);

      // The registry resolves only the first one now.
      const desired = new Set(['.standards/commit-message.ai.yaml']);
      const plan = planStandardsRemovals(TEST_DIR, manifest, desired);

      const nominated = plan.remove.map(r => r.path);
      expect(nominated).toContain('.standards/retired-standard.ai.yaml');
      expect(nominated).not.toContain('.standards/commit-message.ai.yaml');
    });
  });

  describe('R3 — the plan reports a denominator, not just its targets', () => {
    it('reports how many files were examined and why each was excluded', () => {
      writeFile('.standards/manifest.json', '{}');
      writeFile('.standards/commit-message.ai.yaml', 'id: commit-message');
      writeFile('.standards/retired-standard.ai.yaml', 'id: retired');
      writeFile('.standards/handwritten.md', '# mine');

      let manifest = {
        fileHashes: {
          '.standards/commit-message.ai.yaml': { hash: 'sha256:abc', size: 20 },
          '.standards/retired-standard.ai.yaml': { hash: 'sha256:def', size: 21 }
        }
      };
      manifest = recordFileProvenance(manifest, '.standards/commit-message.ai.yaml', 'update');
      manifest = recordFileProvenance(manifest, '.standards/retired-standard.ai.yaml', 'init');
      manifest = establishProvenance(manifest);

      const plan = planStandardsRemovals(
        TEST_DIR,
        manifest,
        new Set(['.standards/commit-message.ai.yaml'])
      );

      // 4 files on disk; manifest.json is excluded structurally.
      expect(plan.scanned).toBe(4);
      expect(plan.excluded.map(e => e.path)).toContain('.standards/manifest.json');
      // Every scanned file is accounted for: removed, kept, or excluded.
      expect(plan.remove.length + plan.keep.length + plan.excluded.length)
        .toBe(plan.scanned);
      // Kept files carry the reason they were kept.
      for (const kept of plan.keep) {
        expect(typeof kept.reason).toBe('string');
        expect(kept.reason.length).toBeGreaterThan(0);
      }
      expect(plan.census.foreign).toBe(1);
      expect(plan.census.udsOwned).toBe(2);
    });

    it('walks the directory rather than consulting a list of known names', () => {
      writeFile('.standards/manifest.json', '{}');
      writeFile('.standards/options/git-workflow/gitflow.ai.yaml', 'id: gitflow');
      writeFile('.standards/language-packs/pack.ai.yaml', 'id: pack');

      const manifest = establishProvenance({ fileHashes: {} });
      const census = classifyStandardsFiles(TEST_DIR, manifest);

      // Nested files are seen; `.standards/` is an open set, so the scan
      // cannot be a whitelist of expected filenames.
      expect(census.scanned).toBe(3);
      expect(census.foreign).toContain('.standards/options/git-workflow/gitflow.ai.yaml');
      expect(census.foreign).toContain('.standards/language-packs/pack.ai.yaml');
    });
  });
});
