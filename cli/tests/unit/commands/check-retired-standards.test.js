/**
 * `uds check` told adopters to undo what the migration guide told them to do.
 *
 * Reported 2026-09-16. MIGRATION-v6 §2 said to remove the seven descoped
 * `.ai.yaml` copies by hand "if you want a clean tree". Doing so left their
 * `fileHashes` entries behind, and `uds check` reported seven files as `遺失`
 * and recommended `uds check --restore` — which then failed on every one with
 * "無法判斷來源", because the source has not existed upstream since 6.0.0.
 *
 * Reproduced here before the fix: three planted stubs, deleted by hand, produce
 * `摘要：75 未變更，0 已修改，3 遺失` and the restore suggestion.
 *
 * The information needed to say the right thing was already present at the
 * moment of failure — the restore knew it could not resolve a source. The
 * question "does UDS still ship a file by this name" belongs to the registry,
 * not to the manifest, so that a project which never cleaned its manifest and a
 * project which did both get the same answer.
 */
import { describe, it, expect } from 'vitest';
import { isShippedFilename } from '../../../src/utils/registry.js';
import { classifyMissingFile } from '../../../src/commands/check.js';

describe('a standard UDS no longer ships is not a missing file', () => {
  describe('isShippedFilename', () => {
    it('knows a core standard that still ships', () => {
      expect(isShippedFilename('anti-hallucination.ai.yaml')).toBe(true);
    });

    it('knows an option file, which lives a directory deeper', () => {
      expect(isShippedFilename('unit-testing.ai.yaml')).toBe(true);
    });

    it('knows the human-readable copy too — the set spans both formats', () => {
      expect(isShippedFilename('testing-standards.md')).toBe(true);
    });

    it('does not know the seven descoped in 6.0.0', () => {
      for (const name of [
        'workflow-enforcement.ai.yaml',
        'workflow-state-protocol.ai.yaml',
        'branch-completion.ai.yaml',
        'agent-communication-protocol.ai.yaml',
        'change-batching-standards.ai.yaml',
        'execution-history.ai.yaml',
        'pipeline-integration-standards.ai.yaml'
      ]) {
        expect(isShippedFilename(name), name).toBe(false);
      }
    });

    it('still knows agent-dispatch, which was descoped and then restored', () => {
      expect(isShippedFilename('agent-dispatch.ai.yaml')).toBe(true);
    });
  });

  describe('classifyMissingFile', () => {
    const manifest = { format: 'ai' };

    it('calls a descoped standard retired, not missing', () => {
      expect(classifyMissingFile('.standards/workflow-enforcement.ai.yaml', manifest)).toBe('retired');
    });

    it('calls a shipping standard that vanished missing — that one really is', () => {
      expect(classifyMissingFile('.standards/anti-hallucination.ai.yaml', manifest)).toBe('missing');
    });

    it('never calls a file outside .standards/ retired', () => {
      // Integration files are generated, not shipped under a standard's name;
      // a missing CLAUDE.md is a missing CLAUDE.md.
      expect(classifyMissingFile('CLAUDE.md', manifest)).toBe('missing');
      expect(classifyMissingFile('AGENTS.md', manifest)).toBe('missing');
    });

    it('does not mistake the installed templates for descoped standards', () => {
      // These three live under templates/, not core/, and are reachable through
      // the registry. A false positive here would tell the user to prune a file
      // UDS still installs.
      for (const name of ['requirement-checklist.md', 'requirement-template.md', 'requirement-document-template.md']) {
        expect(classifyMissingFile(`.standards/${name}`, manifest), name).toBe('missing');
      }
    });
  });
});
