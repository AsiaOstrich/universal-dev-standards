# Failure Source Taxonomy Standard

> **Source**: XSPEC-045 | **Borrowed from**: ultraworkers/claw-code ROADMAP Phase 2 Failure Taxonomy

## Overview

The Failure Source Taxonomy adds a `failureSource` (why) dimension on top of the existing `TaskStatus` (what). Structured failure sources allow the downstream recovery mechanism (Recovery Recipe Registry, XSPEC-046) to precisely match strategies, avoiding the application of the same retry logic to fundamentally different failure types.

## 8 Failure Sources

| Source | Description | Recommended Recovery |
|--------|-------------|---------------------|
| `prompt_delivery` | Prompt not delivered to LLM (API 4xx, empty response, parse error) | retry or model_switch |
| `model_degradation` | LLM quality degrades (repetitive output, irrelevant response) | model_switch |
| `branch_divergence` | Working branch falls behind base branch | rebase_and_retry |
| `compilation` | Compile or type-check errors (tsc, cargo, go build) | fix_loop |
| `test_failure` | Test failures (unit / integration / system / e2e) | fix_loop |
| `tool_failure` | Tool layer failure (MCP server unresponsive, plugin load failure) | circuit_breaker then retry |
| `policy_violation` | Safety/governance policy block (Guardian deny, SafetyHook) | human_checkpoint |
| `resource_exhaustion` | Resource exhausted (token budget exceeded, timeout, USD budget) | degraded_mode or human_checkpoint |

## Priority Rules

When multiple failure sources coexist, apply:

1. `branch_divergence` > `compilation` — divergence is usually the root cause of compilation failures
2. `policy_violation` > others — security takes precedence, do not attempt bypass
3. `resource_exhaustion` > others — retrying when resources are exhausted is meaningless
4. Otherwise: use the first detected source

## Types

```typescript
type FailureSource =
  | "prompt_delivery"
  | "model_degradation"
  | "branch_divergence"
  | "compilation"
  | "test_failure"
  | "tool_failure"
  | "policy_violation"
  | "resource_exhaustion";

interface FailureDetail {
  source: FailureSource;
  raw_error: string;
  detected_by: string;  // quality-gate / claude-adapter / safety-hook / branch-drift
  timestamp: string;    // ISO 8601
}
```

## Guidelines

- All failure results should carry `failureSource` to enable precise recovery strategy matching
- `failureSource` is an **optional** field — must not break existing code without this field
- Select the most fundamental source as `failureSource` in a single failure event
- `failureSource` should be set by the component that detects the failure
- DevAP and VibeOps each define `FailureSource` type independently (AGPL isolation)

## Applicable Scenarios

- DevAP QualityGate failure result enrichment
- VibeOps PipelineRunner `agent:error` event payload
- Recovery Recipe Registry (XSPEC-046) match key
- Telemetry failure analytics dimension

## References

- AI-optimized: [ai/standards/failure-source-taxonomy.ai.yaml](../ai/standards/failure-source-taxonomy.ai.yaml)
- XSPEC-045: Cross-project specification
- Depends on: Recovery Recipe Registry (XSPEC-046)
- Borrowed from: [ultraworkers/claw-code](https://github.com/ultraworkers/claw-code) ROADMAP Phase 2 Failure Taxonomy
