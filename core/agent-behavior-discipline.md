# Agent Behavior Discipline

> **Language**: English | [繁體中文](../locales/zh-TW/core/agent-behavior-discipline.md)

**Version**: 1.0.0
**Last Updated**: 2026-04-24
**Applicability**: All AI agent implementations using UDS-compliant harnesses
**Scope**: universal
**Industry Standards**: Informed by Karpathy 2026-01 observations + andrej-karpathy-skills (MIT)

---

## Purpose

This standard defines four behavioral disciplines for AI agents that elevate performance from "functional" to "excellent". These disciplines address the most common failure modes observed in production LLM coding agents:

1. **Executing on wrong assumptions** — agent proceeds without confirming direction
2. **Over-engineering** — agent writes 200 lines when 50 would suffice
3. **Scope creep** — agent "helpfully" modifies unrelated code
4. **Goalless loops** — agent iterates without a defined stopping condition

The disciplines are designed to be stackable with existing UDS standards (`anti-hallucination`, `anti-sycophancy-prompting`, `test-driven-development`) and enforceable at the harness level (DevAP `DisciplineConfig`).

---

## Principle 1: Ask — Surface Assumptions Before Executing

### Rule

Before any non-trivial task, explicitly state all assumptions and wait for confirmation.

### When to Apply

| Condition | Action |
|-----------|--------|
| Ambiguous requirements or multiple valid interpretations | Use Disclosure Format (below) |
| Confidence score < 0.7 | Pause and ask |
| Architecture changes or multi-file modifications | Always disclose |
| Single-file trivial change (confidence ≥ 0.9, < 5 lines) | May skip confirmation |

### Disclosure Format

```
My assumptions: [explicit list]
Approach considered: [A] vs [B] — choosing A because [reason]
If my understanding is incorrect, please redirect before I proceed.
```

### Why This Matters

Karpathy observed: *"Models make wrong assumptions, don't seek clarification, and are a little too sycophantic."* A wrong direction costs more tokens to undo than the upfront 3-second check would have taken.

---

## Principle 2: Simple — Minimum Code, Nothing Speculative

### Rule

Solve with the least code required. Never add unrequested functionality.

### Three Strikes Rule (DRY Threshold)

Abstract only when identical logic appears **3 or more times**. A single-use helper is always a premature abstraction.

### DO / DO NOT

| DO | DO NOT |
|----|--------|
| ✅ Write only what the task requires | ❌ Add features "that might be needed later" |
| ✅ Rewrite when a significantly shorter solution exists | ❌ Create single-use abstractions |
| ✅ Inline logic used only once | ❌ Add speculative configuration hooks |
| ✅ Skip error handling for impossible scenarios | ❌ Add defensive code for internal invariants |

### Why This Matters

Karpathy observed: *"It will implement 1000 lines of bloated code, and when challenged, immediately cuts it to 100."* If it can be 50 lines, it should be 50 lines from the start.

---

## Principle 3: Precision — Touch Only What the Task Requires

### Rule

Scope modifications to the declared minimum set of files and lines. Clean up only your own mess.

### Scope Declaration Format

Before any edit, output:
```
Modifying: [file list]
Not touching: [related but out-of-scope areas]
Out-of-scope observation (action deferred): [optional — verbal only, no edit]
```

### DO / DO NOT

| DO | DO NOT |
|----|--------|
| ✅ Match existing local code style | ❌ Improve unrelated code "while I'm here" |
| ✅ Flag pre-existing issues verbally | ❌ Remove dead code you didn't create |
| ✅ Remove only imports orphaned by YOUR change | ❌ Rename symbols not in your task scope |
| ✅ Declare scope before starting | ❌ Format unrelated code to match your preferences |

### Why This Matters

Karpathy observed agents that *"alter code it doesn't understand, and then things break"*. Precision prevents untraceable side effects and keeps diffs reviewable.

---

## Principle 4: Test — Define Success Criteria, Loop Until Verified

### Rule

Transform every task into a measurable, verifiable success criterion before implementation.

### TDD Flow

```
Define success criterion → Write failing test (Red) → Implement (Green) → Refactor → Verify
```

### Vague Criteria Escalation

If the task uses subjective language ("make it better", "improve search quality"):
> "What specific metric or observable outcome defines success here?"

Never proceed with a subjective stopping condition.

### Autonomous Loop Protocol

| Parameter | Value |
|-----------|-------|
| max_retries | 5 (default; configurable via DisciplineConfig) |
| Per-iteration logging | Record `failureSource` (see failure-source-taxonomy) |
| On stuck (same error fingerprint) | Escalate to human with failureSource summary |

### Why This Matters

Karpathy's strongest principle: *"LLMs excel at looping toward specific goals — provide success criteria rather than directives."* Without a verifiable goal, an autonomous agent loop has no natural stopping point.

---

## Integration with Other UDS Standards

| Standard | Relationship |
|----------|-------------|
| `anti-hallucination` | Ask principle: disclose when uncertain rather than guessing |
| `anti-sycophancy-prompting` | Ask principle: don't assume, push back when warranted |
| `test-driven-development` | Test principle: TDD is the operational implementation |
| `change-batching-standards` | Precision principle: scope limits reinforce batching logic |
| `failure-source-taxonomy` | Test principle: loop protocol uses failureSource taxonomy |
| `recovery-recipe-registry` | Test principle: max_retries maps to recovery recipe escalation |

---

## Enforcement at Harness Level (DevAP)

`DisciplineConfig` in DevAP `src/types.ts`:

```typescript
interface DisciplineConfig {
  ask_threshold: number;           // Confidence below this triggers Ask disclosure (default: 0.6)
  max_loop_retries: number;        // Autonomous loop ceiling (default: 5)
  precision_scope: 'strict' | 'relaxed'; // strict = always declare scope
}
```

The `assumptionCheckGate()` in `src/orchestrator.ts` evaluates task complexity against `ask_threshold` before dispatching to the agent.

---

## Checklist

- [ ] Assumptions stated before execution starts
- [ ] Code solves the problem with minimum required lines
- [ ] Only declared-scope files were modified
- [ ] Success criterion is quantifiable and verified
- [ ] Autonomous loops have `max_retries` and escalation path defined
