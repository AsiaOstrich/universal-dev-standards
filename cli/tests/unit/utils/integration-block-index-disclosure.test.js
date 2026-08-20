/**
 * XSPEC-357 R7 — the disclosure has to reach the OTHER producer too.
 *
 * `agents-md-index-disclosure.test.js` pins the universal `AGENTS.md` summary,
 * fixed 2026-08-18. That is one of two functions that write instruction files
 * for adopters. The other is `generateIntegrationContent()`, and the split is
 * sharper than "two code paths": selecting codex or opencode turns the
 * universal summary OFF and routes `AGENTS.md` through this generator instead
 * (init.js:501-505). So the disclosure written because Codex was measured
 * ignoring the standards lived only in the file a Codex adopter never gets.
 *
 * Measured 2026-08-20 before the fix: 8 distinct adopter files (CLAUDE.md,
 * AGENTS.md, .cursorrules, .clinerules, .windsurfrules,
 * .github/copilot-instructions.md, GEMINI.md, INSTRUCTIONS.md) across all 3
 * content modes — 0 carrying any disclosure.
 *
 * These are unit tests over the generator. The end-to-end version — run
 * `uds init` and read what lands on disk — is
 * `scripts/check-adopter-instruction-files.ts`, which is where the real
 * regression would be caught if the generator were bypassed entirely.
 */

import { describe, it, expect } from 'vitest';
import {
  generateIndexDisclosure,
  generateIntegrationContent,
} from '../../../src/utils/integration-generator.js';

const STANDARDS = [
  'core/anti-hallucination.md',
  'core/commit-message.md',
  'core/testing.md',
];

function generate({ tool = 'claude-code', contentMode = 'index', language = 'en' } = {}) {
  return generateIntegrationContent({
    tool,
    categories: [],
    installedStandards: STANDARDS,
    contentMode,
    language,
    standardsFormat: 'ai',
  });
}

describe('generateIndexDisclosure (XSPEC-357 R7)', () => {
  it('states both halves: that it is an index, and that the rules are absent', () => {
    const out = generateIndexDisclosure('markdown', 'en');
    expect(out).toMatch(/an index, not the standards/i);
    expect(out).toMatch(/NOT reproduced here/i);
  });

  it('instructs rather than describes', () => {
    // The distinguishing arm. The wording replaced on 2026-08-18 ("Full
    // standards available in the `.standards/` directory") also mentioned
    // `.standards/`, and was measured leaving every file unopened. A test that
    // only looked for that string would pass against the version that failed.
    const out = generateIndexDisclosure('markdown', 'en');
    expect(out).toMatch(/open the relevant file under `\.standards\//i);
    expect(out).not.toMatch(/Full standards available in the `\.standards\/` directory\./);
  });

  it('renders plaintext targets without markup they cannot display', () => {
    // .cursorrules / .clinerules / .windsurfrules render neither blockquotes
    // nor backticks; leaving them in puts literal `**` and backticks in front
    // of the first thing the agent reads.
    const out = generateIndexDisclosure('plaintext', 'en');
    expect(out).not.toContain('**');
    expect(out).not.toContain('`');
    expect(out).not.toMatch(/^>/m);
    expect(out).toMatch(/an index, not the standards/i);
  });

  it('says the same thing in Traditional Chinese', () => {
    const out = generateIndexDisclosure('markdown', 'zh-tw');
    expect(out).toMatch(/是索引，不是標準本文/);
    expect(out).toMatch(/規則並未複製於此/);
    expect(out).toMatch(/打開 `\.standards\/` 底下對應的檔案/);
  });
});

describe('generateIntegrationContent — disclosure reaches every adopter file', () => {
  // Not a hand-written list of "the tools that matter". One markdown target and
  // one plaintext target per mode, because format is the axis that changes the
  // rendering; the end-to-end checker walks the full installed set.
  for (const contentMode of ['minimal', 'index', 'full']) {
    for (const tool of ['claude-code', 'opencode', 'cursor', 'gemini-cli']) {
      it(`${tool} / contentMode=${contentMode} opens with the disclosure`, () => {
        const out = generate({ tool, contentMode });
        expect(out).toMatch(/an index, not the standards/i);
        expect(out).toMatch(/NOT reproduced here/i);
      });
    }
  }

  it('places the disclosure inside the UDS marker block', () => {
    // Outside the markers it would survive `uds update` as stale text, or be
    // dropped when a user edits around the block. Inside, it is regenerated.
    const out = generate();
    const start = out.indexOf('UDS:STANDARDS:START');
    const end = out.indexOf('UDS:STANDARDS:END');
    const disclosureAt = out.search(/an index, not the standards/i);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(disclosureAt).toBeGreaterThan(start);
    expect(disclosureAt).toBeLessThan(end);
  });

  it('puts it before the standards listing, not after it', () => {
    // A caveat printed under 72 file paths is read after the reader has already
    // decided what the block is.
    const out = generate({ contentMode: 'minimal' });
    expect(out.search(/an index, not the standards/i)).toBeLessThan(
      out.indexOf('.standards/anti-hallucination')
    );
  });

  it('emits nothing extra when no standards are installed', () => {
    // With no standards there is no index, so there is nothing to disclose —
    // and a disclosure about an absent list would itself be false.
    const out = generateIntegrationContent({
      tool: 'claude-code',
      categories: [],
      installedStandards: [],
      contentMode: 'index',
      language: 'en',
    });
    expect(out).not.toMatch(/an index, not the standards/i);
  });

  it('still carries the standards listing, so the disclosure did not replace it', () => {
    const out = generate({ contentMode: 'minimal' });
    expect(out).toMatch(/\.standards\/anti-hallucination/);
    expect(out).toMatch(/\.standards\/commit-message/);
  });
});
