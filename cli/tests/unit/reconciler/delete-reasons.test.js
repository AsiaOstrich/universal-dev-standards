/**
 * The plan said "no longer in desired state" and left the adopter to guess.
 *
 * Reported 2026-09-16:
 *
 *   - Delete (6):
 *     - .standards/release-config.yaml (no longer in desired state)
 *     - .claude\skills\agents / ai / tools / workflows / _shared (…)
 *
 * The reporter could not tell whether `release-config.yaml` held settings they
 * had chosen, or whether `_shared` was still referenced by another skill — and
 * the reason given is the same sentence for a standard UDS retired upstream, an
 * option the project deselected, and a file the desired state simply does not
 * model.
 *
 * `release-config.yaml` turned out to be the worst case: `uds init` writes it
 * from the release mode the user picked, `uds config` rewrites it, and nothing
 * in the reconciler models it. A plan that deletes it discards a user setting
 * and calls that reconciliation. It is now excluded outright — stating the
 * reason rather than dropping it silently, because a plan that quietly omits
 * things is how the last set of deletion bugs stayed invisible.
 */
import { describe, it, expect } from 'vitest';
import { describeDeletion, isUserConfigPath } from '../../../src/reconciler/diff-engine.js';

describe('deletion reasons', () => {
  describe('isUserConfigPath', () => {
    it('protects the release config, which holds a choice the user made', () => {
      expect(isUserConfigPath('.standards/release-config.yaml')).toBe(true);
      expect(isUserConfigPath('.standards\\release-config.yaml')).toBe(true);
    });

    it('does not protect an ordinary standard', () => {
      expect(isUserConfigPath('.standards/anti-hallucination.ai.yaml')).toBe(false);
    });

    it('does not protect the manifest, which UDS owns outright', () => {
      expect(isUserConfigPath('.standards/manifest.json')).toBe(false);
    });
  });

  describe('describeDeletion', () => {
    it('says so when UDS stopped shipping the file', () => {
      expect(describeDeletion('.standards/workflow-enforcement.ai.yaml', 'standard'))
        .toMatch(/no longer ships/i);
    });

    it('says so when the project deselected something UDS still ships', () => {
      const reason = describeDeletion('.standards/anti-hallucination.ai.yaml', 'standard');
      expect(reason).toMatch(/no longer selects/i);
      expect(reason).not.toMatch(/no longer ships/i);
    });

    it('distinguishes a path the desired state does not model at all', () => {
      const reason = describeDeletion('.claude/skills/_shared', 'skill');
      expect(reason).toMatch(/not (part of|in) /i);
    });

    it('never returns the bare sentence the report complained about', () => {
      for (const [path, category] of [
        ['.standards/workflow-enforcement.ai.yaml', 'standard'],
        ['.standards/anti-hallucination.ai.yaml', 'standard'],
        ['.claude/skills/_shared', 'skill']
      ]) {
        expect(describeDeletion(path, category)).not.toBe('no longer in desired state');
      }
    });
  });
});
