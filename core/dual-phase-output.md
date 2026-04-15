# Dual-Phase LLM Output Standard

> **Source**: XSPEC-035 | **Borrowed from**: claude-code-book Ch.7 AutoCompact

## Overview

The Dual-Phase LLM Output pattern requires LLM review agents to produce two XML blocks in a single response: an `<analysis>` thinking scratchpad (discarded after processing) and a `<summary>` structured conclusion (retained). This lets the model reason thoroughly while preventing thinking processes from accumulating in the conversation context.

## Problem

Review agents (Judge, Evaluator, Guardian) typically generate 2000–5000 token responses, with 50–70% being reasoning that accumulates in conversation history. In repeated review scenarios (Fix Loop 3× retries), this wastes 3000–10500 tokens per task.

## Format

```xml
<analysis>
[Reasoning scratchpad — DISCARDED after processing]
- Step-by-step evaluation
- Edge case considerations
- Alternative comparisons
</analysis>

<summary>
decision: approved | rejected | needs_revision
confidence: high | medium | low
findings:
  - [type] description
next_action: [recommended follow-up action]
</summary>
```

## Post-Processing Rules

1. Extract `<summary>` content → persist to context
2. Discard `<analysis>` content → never write to conversation history
3. If `<summary>` tag missing → fallback: treat full response as summary, log `[WARN] dual-phase format missing`

## Extension Fields

Applications may add fields inside `<summary>` but must not remove core fields:
- **Security (Guardian)**: `severity: critical | high | medium | low`, `cwe_ids: [CWE-NNN]`
- **Quality (Evaluator)**: `test_coverage: number`, `tech_debt_score: number`

## Token Impact

| Scenario | Savings |
|----------|---------|
| Single review | 1000–3500 tokens |
| Fix Loop (3× retries) | 3000–10500 tokens |
| VibeOps pipeline (evaluator + guardian) | 2000–7000 tokens per run |

## References

- AI-optimized: [ai/standards/dual-phase-output.ai.yaml](../ai/standards/dual-phase-output.ai.yaml)
- XSPEC-035: Cross-project specification
- Borrowed from: [claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.7 `formatCompactSummary`
