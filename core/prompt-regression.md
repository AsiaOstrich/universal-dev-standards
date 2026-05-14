# Prompt Regression Standards

## Overview

AI agent prompts are code. Unintended changes silently degrade agent behaviour without triggering type errors or unit test failures. Prompt regression tests use golden SHA-256 checksums to detect any modification, forcing developers to explicitly acknowledge and document prompt changes.

## Why Checksums

- Diffs alone don't block CI — checksums do
- Prompts are large markdown files; minor edits (whitespace, punctuation) can shift model behaviour
- Checksum update + comment creates an audit trail of why each prompt changed

## Implementation

### 1. Compute Initial Checksums

```bash
for f in agents/*/prompt.md; do
  echo -n "$f: "
  sha256sum "$f" | cut -d' ' -f1
done
```

### 2. Golden Checksum Test (Vitest)

```typescript
// SPDX-License-Identifier: AGPL-3.0-only
import { createHash } from "crypto"
import { readFileSync } from "fs"
import { join } from "path"
import { describe, it, expect } from "vitest"

// Update these values ONLY when prompt changes are intentional.
// Add a comment on the same line explaining WHY the prompt changed.
const GOLDEN_CHECKSUMS: Record<string, string> = {
  architect: "98017d39b0e48cda88b796687d21e0f884c810805e534453a23b7ad935e4a5ef",
  builder:   "5c2acda3e48dae771c61f55d3a5b0d5ac7383870054ef71e757714e367c50031",
  // ... all agents
}

describe("Agent prompt regression (XSPEC-162)", () => {
  for (const [agent, expected] of Object.entries(GOLDEN_CHECKSUMS)) {
    it(`agents/${agent}/prompt.md checksum matches golden`, () => {
      const filePath = join(__dirname, "..", "..", "agents", agent, "prompt.md")
      const content = readFileSync(filePath)
      const actual = createHash("sha256").update(content).digest("hex")
      expect(actual, `Prompt for '${agent}' changed unexpectedly. If intentional, update GOLDEN_CHECKSUMS with a comment.`).toBe(expected)
    })
  }
})
```

### 3. CI Integration

The checksum test runs as part of the standard `npm run test:coverage` gate (already enforced via XSPEC-156). No additional CI step needed.

### 4. Updating Checksums

When a prompt change is intentional:

```typescript
// BEFORE:
architect: "98017d39...",  // updated 2026-05-05: added Guardian policy XSPEC-160 reference
```

The comment is mandatory. PRs that update checksums without explanatory comments should be rejected in code review.

## Related Standards

- [LLM Output Validation](llm-output-validation.md) — schema-level validation
- [Adversarial Test](adversarial-test.md) — red-team corpus
- [Testing Standards](testing.md) — overall testing pyramid


**Scope**: universal
