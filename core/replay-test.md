# Replay Test Standards

## Overview

AI agent systems interact with users through complex multi-step pipelines. When a customer reports unexpected behaviour, reproducing the exact failure is often difficult — the model output may be non-deterministic, the environment may have changed, or the exact inputs may be unclear. Golden fixture replay solves this by serialising the exact inputs and expected outputs at time of discovery, enabling deterministic regression tests.

## Fixture Format

```json
{
  "meta": {
    "recorded": "2026-05-05",
    "source": "customer-report | ci-regression | red-team | incident",
    "description": "Human-readable description of what this tests"
  },
  "input": { /* exact component input */ },
  "expected": { /* expected output fields to assert */ }
}
```

## Fixture Naming

`<component>-<outcome>-<description>.json`

| Good | Bad |
|------|-----|
| `guardian-deny-prod-drop-table.json` | `test1.json` |
| `guardian-allow-dev-npm-test.json` | `fixture.json` |
| `guardian-hitl-prod-irreversible.json` | `scenario_3.json` |

## Replay Test Implementation (Vitest)

```typescript
// SPDX-License-Identifier: AGPL-3.0-only
import { readdirSync, readFileSync } from "fs"
import { join } from "path"
import { describe, it, expect } from "vitest"
import { scoreReviewable } from "../scoring/risk-engine.js"

const FIXTURES_DIR = join(__dirname, "..", "__fixtures__")

interface ReplayFixture {
  meta: { recorded: string; source: string; description: string }
  input: Parameters<typeof scoreReviewable>[0]
  expected: { decision: string }
}

function deriveDecision(score: number): string {
  if (score >= 76) return "DENY"
  if (score >= 51) return "REQUIRE_HITL"
  return "ALLOW"
}

describe("Guardian replay fixtures", () => {
  const fixtures = readdirSync(FIXTURES_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => ({
      name: f,
      fixture: JSON.parse(readFileSync(join(FIXTURES_DIR, f), "utf-8")) as ReplayFixture,
    }))

  for (const { name, fixture } of fixtures) {
    it(`[${fixture.meta.source}] ${fixture.meta.description}`, () => {
      const result = scoreReviewable(fixture.input)
      const decision = deriveDecision(result.score)
      expect(decision).toBe(fixture.expected.decision)
    })
  }
})
```

## Bug Regression Workflow

1. Customer reports unexpected Guardian verdict
2. Capture the exact `Reviewable` input (from audit logs)
3. Create fixture file: `guardian-<outcome>-<description>.json`
4. Reproduce failure locally (test should fail)
5. Fix the bug
6. Confirm test passes
7. The fixture now permanently prevents regression

## Related Standards

- [Adversarial Test Standards](adversarial-test.md) — red-team corpus
- [Verification Evidence Standards](verification-evidence.md) — AC traceability
- [Testing Standards](testing.md) — overall test pyramid


**Scope**: universal
