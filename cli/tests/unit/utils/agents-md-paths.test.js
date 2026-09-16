/**
 * Every option file listed in AGENTS.md pointed at a path that does not exist.
 *
 * `generateAgentsMdSummary` resolved each manifest entry to a bare filename and
 * wrote `.standards/<filename>` for all of them. Option files install one
 * directory deeper — `.standards/options/english.ai.yaml` — so every option in
 * every adopter's AGENTS.md was a dead link, listed under a heading that tells
 * the agent these are the standards it must read.
 *
 * Found by the whole-file path scan added for the same report, on a clean
 * `uds init` run: `.standards/english.ai.yaml`, `.standards/github-flow.ai.yaml`,
 * `.standards/squash-merge.ai.yaml`. The sibling renderer in this same file has
 * written `.standards/options/…` correctly all along, and the docblock above it
 * says in as many words that a previous fix reached "one of the two producers".
 * This is the other one.
 *
 * The format is the second half: the resolver was pinned to `ai`, so a project
 * installed with `--format human` was handed a list of `.ai.yaml` names it does
 * not have.
 */
import { describe, it, expect } from 'vitest';
import { generateAgentsMdSummary } from '../../../src/utils/integration-generator.js';

const installed = [
  'anti-hallucination',
  'commit-message',
  'ai/options/commit-message/english.ai.yaml',
  'ai/options/git-workflow/github-flow.ai.yaml'
];

describe('generateAgentsMdSummary paths', () => {
  it('puts option files under .standards/options/', () => {
    const md = generateAgentsMdSummary({ installedStandards: installed });

    expect(md).toContain('`.standards/options/english.ai.yaml`');
    expect(md).toContain('`.standards/options/github-flow.ai.yaml`');
    expect(md).not.toContain('`.standards/english.ai.yaml`');
    expect(md).not.toContain('`.standards/github-flow.ai.yaml`');
  });

  it('leaves core standards where they are', () => {
    const md = generateAgentsMdSummary({ installedStandards: installed });

    expect(md).toContain('`.standards/anti-hallucination.ai.yaml`');
    expect(md).toContain('`.standards/commit-message.ai.yaml`');
  });

  it('lists the files a human-format project actually has', () => {
    const md = generateAgentsMdSummary({
      installedStandards: ['anti-hallucination', 'commit-message'],
      standardsFormat: 'human'
    });

    expect(md).toContain('`.standards/anti-hallucination.md`');
    expect(md).not.toContain('.ai.yaml');
  });

  it('still defaults to ai when no format is given', () => {
    const md = generateAgentsMdSummary({ installedStandards: ['anti-hallucination'] });
    expect(md).toContain('`.standards/anti-hallucination.ai.yaml`');
  });

  it('does not silently drop an entry it cannot resolve', () => {
    const md = generateAgentsMdSummary({
      installedStandards: ['anti-hallucination', 'not-a-standard-at-all']
    });

    expect(md).toContain('`.standards/anti-hallucination.ai.yaml`');
    expect(md).not.toContain('not-a-standard-at-all.ai.yaml');
  });
});
