# Property-Based Testing Standards

## Overview

Example-based tests only verify the cases a developer thought to write. Property-based testing inverts this: you define an invariant ("the score is always between 0 and 100") and the framework generates hundreds of inputs to try to falsify it. When it finds a failing input, it shrinks it to the minimal counterexample.

## When to Use

| Use Property Tests | Use Example Tests |
|-------------------|------------------|
| Pure math functions | Complex business logic |
| Parsers / serializers | Integration paths |
| Score clamping / rounding | UI behaviour |
| Hash / encoding | Database operations |
| Security validators | External API calls |

## Tool: fast-check (TypeScript)

```bash
npm install --save-dev fast-check
```

```typescript
import fc from "fast-check"
import { describe, it, expect } from "vitest"
import { classifyTokenZone, TOKEN_BUDGET } from "../types/index.js"

describe("classifyTokenZone property: result is always a valid zone", () => {
  it("for any ratio in [0, 2], returns a valid TokenBudgetZone", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 2, noNaN: true }),
        (ratio) => {
          const zone = classifyTokenZone(ratio)
          return ["safe", "warning", "danger", "blocking"].includes(zone)
        }
      ),
      { numRuns: 1000 }
    )
  })
})
```

## Guardian scoreReviewable Properties

Key invariants to test:

| Property | Description |
|----------|-------------|
| **Range clamping** | `score` is always `[0, 100]` |
| **Determinism** | Same input always produces same score |
| **Monotonicity** | prod > staging > dev for same operation |
| **Non-negativity** | `breakdown` values are all >= 0 |

## Counterexample Shrinking

When fast-check finds a failing case, it automatically shrinks:

```
Original failure: { target_env: "prod", command: "rm -rf /tmp/xyz123...", ... }
Shrunk to:        { target_env: "prod", command: "rm", ... }
```

Save the seed from the error message to reproduce:
```typescript
fc.assert(property, { seed: 1234567890 })
```

## Related Standards

- [Mutation Testing Standards](mutation-testing.md) — complement to PBT
- [Testing Standards](testing-standards.md) — overall test pyramid
- [Adversarial Test Standards](adversarial-test.md) — security-focused fuzzing
