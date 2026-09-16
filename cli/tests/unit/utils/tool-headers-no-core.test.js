/**
 * Every generated instruction file told the agent to read a directory that is
 * never installed.
 *
 * `TOOL_HEADERS` carried, in 36 places (nine tools × the language variants):
 *
 *   > **PRIORITIZE** reading the concise rules in `core/` (e.g.
 *   > `core/testing-standards.md`).
 *   > **ONLY** read `core/guides/` … when explicitly asked for …
 *
 * `uds init` installs standards into `.standards/`. It has never created a
 * `core/` directory in an adopter's project — that path is where the standards
 * live in the UDS repo, not in the projects that adopt them. So the first
 * instruction in the file points at nothing, in every project, in every tool.
 *
 * An adopter noticed the symptom in their own CLAUDE.md on 2026-09-16 and read
 * it as residue from an old install. It is not residue; a clean `uds init` on
 * 6.9.0 writes it.
 *
 * This test walks the generated headers rather than checking the strings that
 * were fixed, so a tenth tool added with the old wording fails here rather than
 * shipping.
 */
import { describe, it, expect } from 'vitest';
import { SUPPORTED_AI_TOOLS } from '../../../src/core/constants.js';
import { generateIntegrationContent } from '../../../src/utils/integration-generator.js';

const LANGUAGES = ['en', 'zh-tw', 'bilingual'];

describe('generated instruction headers', () => {
  it('never tells the agent to read a core/ directory that is not installed', () => {
    const offenders = [];

    for (const tool of Object.keys(SUPPORTED_AI_TOOLS)) {
      for (const language of LANGUAGES) {
        let content;
        try {
          content = generateIntegrationContent({
            tool,
            language,
            categories: [],
            installedStandards: ['anti-hallucination'],
            contentMode: 'index'
          });
        } catch {
          continue; // a tool with no header is not this test's business
        }
        if (typeof content !== 'string') continue;

        // `core/` as a path the reader is told to open. A mention inside a URL
        // (the UDS repo on GitHub) is a citation, not an instruction.
        const withoutUrls = content.replace(/https?:\/\/\S+/g, '');
        if (/(^|[^\w/])core\//.test(withoutUrls)) {
          offenders.push(`${tool}/${language}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('control arm: the walk actually reaches content', () => {
    const content = generateIntegrationContent({
      tool: 'claude-code',
      language: 'zh-tw',
      categories: [],
      installedStandards: ['anti-hallucination'],
      contentMode: 'index'
    });

    expect(typeof content).toBe('string');
    expect(content.length).toBeGreaterThan(200);
    expect(content).toContain('.standards/');
  });
});
