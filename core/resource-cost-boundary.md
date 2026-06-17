# Resource / Cost Boundary Declaration Standards

> **Version**: 1.0.0 | **Status**: Active | **Updated**: 2026-06-17
> **AI-optimized version**: `ai/standards/resource-cost-boundary.ai.yaml`
> **Spec**: XSPEC-277 (cross-project/specs/XSPEC-277-resource-cost-boundary-standard.md)

## Overview

The resource consumption of an agentic / LLM execution unit (a pipeline run, an agent, a
role) is **often implicit**: token usage, loop/iteration count, retry count, per-run cost
ceiling, wall-clock, call rate. When those bounds are not **explicitly declared and
enforced**, runaway loops and token burn are a known LLM-native failure mode — **cost burn**.

This standard makes the **resource/cost boundary a first-class, machine-readable, fail-closed
declaration**. Any LLM execution unit MUST declare its resource budget; a breach at runtime
MUST fail-closed per the declared behaviour. It is the **cost dimension** of boundary
materialization (XSPEC-276): the one dimension for which UDS has no existing standard, and
which is concrete enough to be AI-executable — so it is split out as a narrow standard rather
than bundled into the broader (and overlapping) boundary framework.

> **Scope.** This standard defines the *declaration mechanism* (a budget taxonomy, a
> machine-readable `resource_budget:` block, a fail-closed gate). The **budget values
> belong to the adopter/customer** — they are a project decision. It standardizes *that*
> bounds are declared and enforced, not *which* numbers. Enforcement-engine wiring (e.g. the
> VibeOps proactive cost governance executor) is a downstream adoption concern; this standard
> is the "declare what bounds" half, XSPEC-285 is the "enforce/govern" half.

## Why a Standard (not a per-unit setting)

VibeOps already has cost mechanisms, but **scattered and unstandardized** — each is a point
mechanism with no single standard saying "every LLM execution unit MUST declare its resource
boundary, and a breach MUST fail-closed." A new unit (a new agent/role) easily misses one
budget → unbounded. This standard converges those point mechanisms onto one declaration.

| Existing mechanism (becomes a reference implementation) | Budget kind |
|---|---|
| orchestrator quality profile `max_retries` / `max_retry_budget_usd` (per-task fix-loop) | retry / cost_usd |
| BudgetGuard / PoC abort `max_cost_per_session_usd` / `min_cache_hit_ratio` (XSPEC-191) | cost_usd / rate |
| Pareto Evolution Gate token-cost dimension (DEC-024) | token / cost_usd |
| agent-loop `maxToolRounds` / `maxTotalTokens` | iteration / token |

## Resource Budget Taxonomy

| Kind | Bound | Typical breach |
|------|-------|----------------|
| `token` | input / output / total token ceiling | prompt/output explosion |
| `iteration` | loop / iteration / tool-round upper bound | runaway loop |
| `retry` | retry upper bound | unbounded re-attempt |
| `cost_usd` | per-call / per-run / per-session cost ceiling | silent budget burn |
| `wallclock` | timeout | hung run |
| `rate` | call frequency | call storm |

## Requirements

| ID | Rule | Level |
|----|------|-------|
| REQ-001 | Resource budget taxonomy — declare bounds from a standard set of kinds | MUST |
| REQ-002 | Machine-readable `resource_budget:` declaration (kind + limit + breach behaviour) | MUST |
| REQ-003 | Fail-closed enforcement gate (undeclared → warn/block; runtime breach → abort) | MUST |
| REQ-004 | Existing mechanisms converge as reference implementations (no re-invention) | SHOULD |
| REQ-005 | Budget value sovereignty — mechanism standard, values owned by the adopter | SHOULD |

### REQ-001 — Resource Budget Taxonomy

Every LLM execution unit's resource bounds MUST be expressible from a standard set of kinds:
`token` (input/output/total), `iteration` (loop/iteration/tool-round cap), `retry` (retry
cap), `cost_usd` (per-call / per-run / per-session ceiling), `wallclock` (timeout), and
`rate` (call frequency). A unit need not declare every kind, but the kinds it relies on for
safety MUST be declared (an unbounded relied-upon kind is a violation).

### REQ-002 — Machine-Readable Declaration

A `resource_budget:` block MUST be declarable (embedded in a plan / agent / role config),
with each entry carrying a **kind + limit value + breach behaviour** (`warn` / `abort`).
The declaration is a first-class artifact the generator/runtime can read — not a scattered
setting or an after-the-fact review note.

```yaml
resource_budget:
  - kind: cost_usd        # per-run cost ceiling
    scope: per_run
    limit: 3.00
    on_breach: abort
  - kind: iteration       # tool-round / loop cap
    limit: 60
    on_breach: abort
  - kind: retry
    limit: 3
    on_breach: warn
  - kind: token
    scope: total
    limit: 400000
    on_breach: abort
```

### REQ-003 — Fail-Closed Enforcement Gate

A quality gate `check-resource-budget` MUST: (a) flag any LLM execution unit that does **not
declare** a budget — `warn` by default, `block` in strict mode; and (b) on a **runtime
breach**, fail-closed per the declared `on_breach` (`abort` halts the unit, `warn` records
and continues). This mirrors the fail-closed posture of `capability-declaration`
(XSPEC-037) and the governance-gate family — never a silent unbounded pass.

### REQ-004 — Converge Existing Mechanisms

Existing point mechanisms (orchestrator `max_retries` / `max_retry_budget_usd`, XSPEC-191
BudgetGuard, DEC-024 Pareto token gate, XSPEC-270 right-sizing router) SHOULD be **mapped to
this standard as reference implementations** — unified, not re-implemented. New units inherit
the declaration habit rather than re-inventing a budget knob.

### REQ-005 — Budget Value Sovereignty

The declaration *mechanism* is standardized; the *budget values* (the actual ceilings) are
owned by the adopter/customer (a project/economics decision). The standard mandates *that*
bounds are declared and enforced, not *which* numbers.

## Principles

| ID | Principle |
|----|-----------|
| P-1 | Bounds are Explicit — resource budgets are declared, not implicit in someone's head |
| P-2 | Machine-Readable — a generator/runtime can read the `resource_budget:` block first-class |
| P-3 | Fail-Closed — undeclared relied-upon bound, or a runtime breach, blocks/aborts; never silent |
| P-4 | No Re-Invention — existing point mechanisms converge as reference implementations |
| P-5 | Value Sovereignty — mechanism standard, ceiling values owned by the adopter |

## Gate Timing

```
plan / agent / role config (resource_budget: block)
        │
        ├─→ [check-resource-budget — declaration check]  ← REQ-003(a), pre-run
        │         undeclared relied-upon bound ──→ warn (strict: block)
        ↓
   run (token / iteration / retry / cost / wallclock / rate metered)
        │
        └─→ runtime breach ──→ fail-closed per on_breach  ← REQ-003(b) (abort / warn)
                                        │
                                  record breach for audit / cost-governance executor (XSPEC-285)
```

## Boundaries with Adjacent Standards (admission condition 3)

This standard collects **only the cost/resource dimension**, to avoid the overlap that kept
the broader boundary framework (XSPEC-276) out of the standard library.

| Adjacent standard | Its angle | Why distinct (<30% overlap) |
|---|---|---|
| `performance-standards` | latency / throughput *targets* | targets, not a fail-closed cost ceiling |
| `model-selection` | choose a model *tier* | tier selection, not budget enforcement |
| `capability-declaration` (XSPEC-037) | explicit capability + fail-closed | capability surface, not resource budget |

## Integration with Existing Standards

- **`performance-standards`** — performance sets latency/throughput targets; this standard
  sets fail-closed resource ceilings. Adjacent, complementary, distinct.
- **`model-selection`** — right-sizing picks a model tier; a `cost_usd` breach can *drive* a
  downgrade (XSPEC-270 router), but the budget declaration is this standard's concern.
- **`test-governance`** — `check-resource-budget` is a governed gate; budget declarations are
  governed policy.
- **`verification-evidence`** — a breach/no-breach run report is a kind of verification
  evidence (budgets honoured + trace).

## Related Specs

- XSPEC-277 — Resource / Cost Boundary Declaration complete spec (this standard's source)
- XSPEC-276 — LLM-native boundary materialization (parent lens; cost is the split-out dimension)
- XSPEC-285 — VibeOps proactive cost governance (the enforcement/executor face of this standard)
- XSPEC-191 — Unit-economics PoC / BudgetGuard (reference implementation)
- XSPEC-270 — Model right-sizing router (cost-driven downgrade)
- XSPEC-037 — Capability declaration (fail-closed posture this standard mirrors)
- DEC-024 — Pareto evolution token-cost gate (reference implementation)

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-06-17 | Initial — REQ-001~005: resource budget taxonomy, machine-readable `resource_budget:` declaration, fail-closed `check-resource-budget` gate, convergence of existing mechanisms as reference implementations, budget value sovereignty (XSPEC-277) |
