# Circuit Breaker Standard

> **Source**: XSPEC-036 | **Borrowed from**: claude-code-book Ch.2

## Overview

The Circuit Breaker pattern protects Agent systems from API stampedes caused by repeated failures. After `failureThreshold` consecutive failures, the breaker opens and immediately rejects all requests — no waiting for timeout. After a cooldown period, it allows one probe call to test recovery.

Real-world data: Before introducing circuit breakers, claude-code-book measured ~250K wasted API calls per day across 1,279 sessions with >50 consecutive failures each (max: 3,272 consecutive failures).

## States

```
CLOSED ──(N consecutive failures)──→ OPEN
OPEN   ──(cooldownMs elapsed)──→ HALF_OPEN
HALF_OPEN ──(probe success)──→ CLOSED
HALF_OPEN ──(probe failure)──→ OPEN
```

| State | Behavior |
|-------|----------|
| **CLOSED** | Normal operation, requests forwarded |
| **OPEN** | All requests rejected immediately with `CircuitOpenError` |
| **HALF_OPEN** | One probe request allowed; success → CLOSED, failure → OPEN |

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `failureThreshold` | 3 | Consecutive failures before opening |
| `cooldownMs` | 30000 | OPEN → HALF_OPEN wait time (ms) |
| `successThreshold` | 1 | Probe successes needed to close |

## Interface

```typescript
interface CircuitBreaker {
  readonly name: string;
  readonly state: "CLOSED" | "HALF_OPEN" | "OPEN";
  execute<T>(fn: () => Promise<T>): Promise<T>; // throws CircuitOpenError when OPEN
  getState(): CircuitBreakerState;
  reset(): void; // admin manual reset
}
```

## Applicable Scenarios

- Fix Loop（採用層） retries
- LLM API call protection (adoption layer)
- Feedback Loop（採用層） retries
- FLARE 主動檢索（採用層） retrieval retries
- Any component using retry with external dependencies

## References

- AI-optimized: [ai/standards/circuit-breaker.ai.yaml](../ai/standards/circuit-breaker.ai.yaml)
- XSPEC-036: Cross-project specification
- Borrowed from: [claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.2 `MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES`
