/**
 * XSPEC-357 R7 — the generated AGENTS.md must say it is not the standards.
 *
 * Measured 2026-07-23: Codex read the file `uds init` produces, listed the 65
 * standards it indexes, and opened none of them. The rules had the same effect
 * as not installing UDS at all. Measured again 2026-08-18 on a fresh
 * `uds init -y`: 5,667 bytes, 69 filename references, **zero rule statements**.
 *
 * Inlining is not the fix and never was — 143 `.ai.yaml` files come to roughly
 * 248k tokens. What was wrong is that the header described the situation
 * ("Full standards available in the .standards/ directory") instead of
 * instructing, and a description asks for nothing.
 *
 * This test does not claim the rules now get read. Only XSPEC-357's P7 probe
 * can measure that, and it is not built. It pins the one thing that was
 * certainly wrong, so a later edit cannot quietly restore it.
 *
 * The checker gap this note used to record as open was closed on 2026-08-20.
 * `check-ai-agent-sync.sh` still maps codex to `integrations/codex/AGENTS.md`
 * — the repo's own template, a different document — and now says so in its
 * header and its output. What an adopter receives is checked separately by
 * `scripts/check-adopter-instruction-files.ts`, which runs `uds init` and reads
 * the result.
 *
 * That work also found that this file covers only one of two producers. The
 * summary pinned here is written by `generateAgentsMdSummary()` and is emitted
 * ONLY when neither codex nor opencode is selected (init.js:501-505) — select
 * either and `AGENTS.md` comes from `generateIntegrationContent()` instead. The
 * disclosure added here for Codex was therefore in the one file a Codex adopter
 * never gets. The second producer is covered by
 * `integration-block-index-disclosure.test.js`.
 */

import { describe, it, expect } from 'vitest';
import { generateAgentsMdSummary } from '../../../src/utils/integration-generator.js';

describe('generateAgentsMdSummary — index disclosure (XSPEC-357 R7)', () => {
  const out = generateAgentsMdSummary({ standardOptions: {}, projectPath: process.cwd() });

  it('states that the file is an index and the rules are not in it', () => {
    expect(out).toMatch(/index, not the standards/i);
    expect(out).toMatch(/NOT reproduced here/i);
  });

  it('instructs rather than describes', () => {
    // The distinguishing arm. The old header mentioned `.standards/` too, so a
    // test that only looked for that string would have passed against the
    // version measured to leave every file unopened.
    expect(out).toMatch(/open the relevant file under `\.standards\//i);
    expect(out).not.toMatch(/Full standards available in the `\.standards\/` directory\./);
  });

  it('still carries the generated body, so the disclosure did not replace content', () => {
    // Guard against a header that is honest and a file that is now empty.
    expect(out).toMatch(/## Build & Test/);
    expect(out.length).toBeGreaterThan(1000);
  });
});
