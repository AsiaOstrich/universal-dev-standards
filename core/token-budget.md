# Token Budget Zone Standard

> **Source**: XSPEC-036 | **Borrowed from**: claude-code-book Ch.7

## Overview

The Token Budget Zone model divides token usage into four progressive zones, each triggering increasingly aggressive protection strategies. This prevents the "works fine until sudden crash" failure mode and gives systems time to gracefully degrade before hitting hard limits.

## Zones

| Zone | Range | Action | Log Level |
|------|-------|--------|-----------|
| **SAFE** | 0–84% | Normal operation | — |
| **WARNING** | 85–89% | Emit event, notify coordinator | info |
| **DANGER** | 90–94% | Trigger lightweight compression (Snip) | warn |
| **BLOCKING** | 95–100% | Reject new requests, return error | error |

## Constants

```typescript
const TOKEN_BUDGET_ZONE = {
  WARNING_THRESHOLD: 0.85,
  DANGER_THRESHOLD: 0.90,
  BLOCKING_THRESHOLD: 0.95,
} as const;

type TokenBudgetZone = "safe" | "warning" | "danger" | "blocking";
```

## DANGER Zone Actions

When entering DANGER zone (90–94%):
1. **Tool Result Snip**: Truncate large tool outputs, keep summaries
2. **Reduce maxToolRounds**: Cut by 20% for remaining agents
3. **Persist to disk**: Move important outputs out of context

## Post-Compact Budget

Compression operations need output space to succeed. Reserve constants:

| Constant | Value | Purpose |
|----------|-------|---------|
| `MAX_FILES_TO_RESTORE` | 5 | Max files to restore after compaction |
| `TOTAL_TOKEN_BUDGET` | 50,000 | Total post-compact token budget |
| `MAX_TOKENS_PER_FILE` | 5,000 | Per-file token limit |

## Applicable Scenarios

- DevAP task execution token monitoring
- VibeOps 9-Agent pipeline cumulative context management
- VibeOps PipelineMemory Snip trigger condition
- Any environment with `maxTotalTokens` limit

## References

- AI-optimized: [ai/standards/token-budget.ai.yaml](../ai/standards/token-budget.ai.yaml)
- XSPEC-036: Cross-project specification
- Borrowed from: [claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.7 four-zone context management
