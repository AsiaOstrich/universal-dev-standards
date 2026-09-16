/**
 * `uds update` rewrote a Chinese CLAUDE.md in English.
 *
 * `uds init` writes the integration file in `display_language` — the setting
 * whose entire job is "what language do you want to read". Every regeneration
 * path derives the content language from `output_language` instead, which is
 * the commit-message language, and defaults to `english`. So a project
 * installed with `--locale zh-tw` gets Chinese instructions from `init` and
 * English ones from the next `uds update --integrations-only`, with nothing
 * reporting the switch.
 *
 * Found while verifying the 2026-09-16 report end to end: the acceptance run
 * printed the standards index in Chinese after `init` and in English after a
 * regeneration, on the same project, with the same numbers.
 *
 * `output_language` stays the fallback: a project that predates
 * `display_language` has nothing else to go on.
 */
import { describe, it, expect } from 'vitest';
import { buildToolIntegrationConfig } from '../../../src/utils/integration-generator.js';

describe('integration content language', () => {
  it('follows display_language, the setting that means "what I read"', () => {
    const config = buildToolIntegrationConfig(
      { options: { display_language: 'zh-tw', output_language: 'english' } },
      'claude-code'
    );

    expect(config.language).toBe('zh-tw');
  });

  it('still reports the commit language separately', () => {
    const config = buildToolIntegrationConfig(
      { options: { display_language: 'zh-tw', output_language: 'english' } },
      'claude-code'
    );

    // The two are different questions and must not collapse into one answer.
    expect(config.outputLanguage).toBe('english');
  });

  it('falls back to output_language when display_language is absent', () => {
    expect(
      buildToolIntegrationConfig({ options: { output_language: 'traditional-chinese' } }, 'claude-code').language
    ).toBe('zh-tw');

    expect(
      buildToolIntegrationConfig({ options: { output_language: 'bilingual' } }, 'claude-code').language
    ).toBe('bilingual');

    expect(
      buildToolIntegrationConfig({ options: {} }, 'claude-code').language
    ).toBe('en');
  });

  it('ignores a display_language the generator cannot render', () => {
    // generateIntegrationContent knows en / zh-tw / bilingual. An unknown value
    // must fall through rather than produce an empty document.
    expect(
      buildToolIntegrationConfig(
        { options: { display_language: 'klingon', output_language: 'traditional-chinese' } },
        'claude-code'
      ).language
    ).toBe('zh-tw');
  });
});
