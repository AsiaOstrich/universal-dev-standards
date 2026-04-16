# Recovery Recipe Registry Standard

> **Source**: XSPEC-046 | **Borrowed from**: ultraworkers/claw-code ROADMAP Phase 3 Recovery Recipes
> **Depends on**: failure-source-taxonomy (XSPEC-045)

## Overview

The Recovery Recipe Registry unifies scattered recovery logic (Fix Loop, Circuit Breaker, Guardian auto-repair, staging retry) into an externalized YAML-configurable Recipe format. Each Recipe uses `failureSource` (XSPEC-045) as the match key, selects the corresponding recovery strategy, and defines an escalation path. When no Recipe matches, the system falls back to existing behavior (backward compatible).

## 6 Recovery Strategies

| Strategy | Description | Best For |
|----------|-------------|----------|
| `fix_loop` | Inject structured error feedback and retry the task | compilation, test_failure |
| `circuit_breaker` | Three-state circuit breaker (XSPEC-036), open after consecutive failures | tool_failure, prompt_delivery |
| `rebase_and_retry` | Run git rebase to sync base branch, then retry | branch_divergence |
| `model_switch` | Switch to fallback model then retry | model_degradation, prompt_delivery |
| `degraded_mode` | Continue in degraded mode (skip quality validation, partial results) | resource_exhaustion, model_degradation |
| `human_checkpoint` | Pause execution, wait for human intervention | policy_violation, branch_divergence |

## Recipe Format

```yaml
id: RR-001                          # RR-NNN format, required
name: "Fix Loop for Compilation"    # required
match:
  failure_source: compilation       # FailureSource, required
  severity: [high, medium]          # optional, empty = match all
strategy: fix_loop                  # RecoveryStrategy, required
config:                             # optional, overrides strategy defaults
  max_attempts: 3
  budget_usd: 0.50
escalation:                         # required
  on_exhaust: human_checkpoint      # must not reference self
  message: "..."                    # optional notification message
```

## Default Recipes (RR-001 ~ RR-005)

| ID | Trigger | Strategy | Escalation |
|----|---------|----------|------------|
| RR-001 | compilation | fix_loop (3 attempts, $0.50) | human_checkpoint |
| RR-002 | test_failure | fix_loop (3 attempts, $0.50) | human_checkpoint |
| RR-003 | model_degradation | model_switch (2 attempts) | degraded_mode |
| RR-004 | branch_divergence | rebase_and_retry (1 attempt) | human_checkpoint |
| RR-005 | resource_exhaustion | degraded_mode | human_checkpoint |

## Guidelines

- Every Recovery Recipe must have a unique ID (RR-NNN format)
- `match.failure_source` must be one of the 8 classes defined in failure-source-taxonomy
- `escalation.on_exhaust` must be defined — infinite loops are forbidden (escalation must not reference self)
- When no Recipe matches, system must fallback to existing default behavior (must not throw errors)
- User-defined Recipes take priority over built-in Recipes (when `failureSource` matches, user config is matched first)
- Recipe config format errors fallback to strategy defaults (do not interrupt execution)

## Applicable Scenarios

- DevAP Orchestrator selects recovery strategy before fix loop
- VibeOps PipelineRunner handles `agent:error` with registry lookup
- Custom `recovery-recipes.yaml` for project-level recipe override
- Telemetry tracking recovery strategy effectiveness

## References

- AI-optimized: [ai/standards/recovery-recipe-registry.ai.yaml](../ai/standards/recovery-recipe-registry.ai.yaml)
- XSPEC-046: Cross-project specification
- Depends on: Failure Source Taxonomy (XSPEC-045)
- Borrowed from: [ultraworkers/claw-code](https://github.com/ultraworkers/claw-code) ROADMAP Phase 3 Recovery Recipes
