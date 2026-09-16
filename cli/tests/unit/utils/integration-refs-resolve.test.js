/**
 * P2 — an integration file must not point at a file that is not on disk.
 *
 * `RULE_TEMPLATES` hardcodes `.standards/<name>.md` paths. A project installed
 * with `--format ai` has `<name>.ai.yaml`, so `uds update --integrations-only`
 * wrote references to `.standards/anti-hallucination.md` and
 * `.standards/checkin-standards.md` — neither exists (reproduced 2026-09-16 in a
 * clean temp project on 6.9.0). The AI tool reading that file follows a dead link.
 */
import { describe, it, expect } from 'vitest';
import { generateIntegrationContent } from '../../../src/utils/integration-generator.js';

const baseConfig = {
  tool: 'claude-code',
  categories: ['anti-hallucination', 'code-review'],
  installedStandards: ['anti-hallucination', 'checkin-standards', 'commit-message'],
  contentMode: 'index',
  language: 'en',
  standardsFormat: 'ai',
  outputLanguage: 'english'
};

describe('P2: generated references match the installed format', () => {
  it('writes .ai.yaml paths when the project installed the ai format', () => {
    const content = generateIntegrationContent(baseConfig);

    const paths = [...content.matchAll(/\.standards\/([^\s,`)\]]+)/g)].map(m => m[1]);
    const dotMd = paths.filter(p => p.endsWith('.md'));

    expect(dotMd).toEqual([]);
    expect(paths).toContain('anti-hallucination.ai.yaml');
  });

  it('keeps .md paths when the project installed the human format', () => {
    const content = generateIntegrationContent({ ...baseConfig, standardsFormat: 'human' });

    const paths = [...content.matchAll(/\.standards\/([^\s,`)\]]+)/g)].map(m => m[1]);

    expect(paths).toContain('anti-hallucination.md');
    expect(paths.filter(p => p.endsWith('.ai.yaml'))).toEqual([]);
  });

  it('drops a reference to a standard this project did not install', () => {
    const content = generateIntegrationContent({
      ...baseConfig,
      // checkin-standards is NOT installed here, but the code-review template
      // references it unconditionally.
      installedStandards: ['anti-hallucination', 'commit-message']
    });

    expect(content).not.toMatch(/\.standards\/checkin-standards/);
  });
});
