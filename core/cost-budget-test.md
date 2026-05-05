# Cost Budget Test Standards

## Overview

AI agent systems that call LLM APIs can accumulate costs rapidly if a pipeline runs in a runaway loop, encounters an unexpected token explosion, or has misconfigured budget thresholds. Cost budget tests verify that the zone classifier, threshold constants, and pipeline budget guards behave correctly at every boundary.

## Zone Classification

Most AI agent token budget systems divide usage ratios into zones. The boundaries between zones are the highest-risk points for off-by-one errors.

```typescript
// Vitest boundary tests using TOKEN_BUDGET constants (not magic numbers)
import { classifyTokenZone, TOKEN_BUDGET } from "../types/index.js"
import { describe, it, expect } from "vitest"

describe("TokenBudgetZone classification boundaries", () => {
  it.each([
    [0.0,                                  "safe",     "zero usage"],
    [TOKEN_BUDGET.WARNING_THRESHOLD - 0.01, "safe",     "just below WARNING"],
    [TOKEN_BUDGET.WARNING_THRESHOLD,        "warning",  "exactly at WARNING"],
    [TOKEN_BUDGET.DANGER_THRESHOLD - 0.01,  "warning",  "just below DANGER"],
    [TOKEN_BUDGET.DANGER_THRESHOLD,         "danger",   "exactly at DANGER"],
    [TOKEN_BUDGET.BLOCKING_THRESHOLD - 0.01,"danger",   "just below BLOCKING"],
    [TOKEN_BUDGET.BLOCKING_THRESHOLD,       "blocking", "exactly at BLOCKING"],
    [1.0,                                  "blocking", "fully exhausted"],
  ])("ratio=%f → %s (%s)", (ratio, expected) => {
    expect(classifyTokenZone(ratio)).toBe(expected)
  })

  it("returns 'blocking' for ratio > 1.0 (over-budget)", () => {
    expect(classifyTokenZone(1.5)).toBe("blocking")
  })
})
```

## Pipeline Budget Config Tests

```typescript
import type { PipelineBudgetConfig } from "../types/index.js"

describe("PipelineBudgetConfig semantics", () => {
  it("warningThreshold defaults should be 0-1 range", () => {
    const config: PipelineBudgetConfig = {
      maxCostPerRun: 1.0,
      maxCostPerDay: 10.0,
      warningThreshold: 0.8,
      autoDowngrade: true,
    }
    expect(config.warningThreshold).toBeGreaterThan(0)
    expect(config.warningThreshold).toBeLessThan(1)
  })
})
```

## What to Test

| Test Category | Why |
|---------------|-----|
| Exact boundary values (WARNING/DANGER/BLOCKING) | Off-by-one errors hide here |
| Below each boundary | Confirm zone below is correct |
| Zero usage ratio | Clean state |
| Ratio > 1.0 | Over-budget should still block |
| All TOKEN_BUDGET constants referenced | Mutation survival prevention |

## Related Standards

- [Mutation Testing Standards](mutation-testing.md) — constants without test coverage survive mutations
- [Testing Standards](testing.md) — overall test pyramid
- [LLM Output Validation](llm-output-validation.md) — output-layer budget constraints
