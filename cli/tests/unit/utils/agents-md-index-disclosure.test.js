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
 * The checker gap is separate and still open: `check-ai-agent-sync.sh` maps
 * codex to `integrations/codex/AGENTS.md` — the repo's own template, a
 * different document with 2 filename references against the generated file's
 * 69 — so it has never looked at what an adopter receives.
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
