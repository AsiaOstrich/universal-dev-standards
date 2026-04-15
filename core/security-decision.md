# Security Decision Standard

> **Source**: XSPEC-037 | **Borrowed from**: claude-code-book Ch.4

## Overview

The Security Decision Standard defines a three-state decision model (`deny` / `ask` / `allow`) with an iron-law priority: **deny always wins**, regardless of the source's priority level. This means a low-priority user setting with `deny` overrides a high-priority policy setting with `allow`.

## Three States

| Decision | Priority | Behavior |
|----------|----------|----------|
| `deny` | 1 (highest) | Block immediately, no further evaluation |
| `ask` | 2 | Pause and request user confirmation |
| `allow` | 3 (lowest) | Permit operation to proceed |

## Arbitration Rule

```
if any rule has deny → final decision: deny
else if any rule has ask → final decision: ask
else → final decision: allow
```

**Invariant**: deny wins regardless of source priority level.

## CI Mode

In non-interactive (CI/CD) environments, `ask` is treated as `deny` — there is no mechanism to provide human confirmation, so the operation must be blocked.

## projectSettings Trust Radius

Configuration from `projectSettings` (`.devap/`, `.vibeops/`) is excluded from security-sensitive operations to prevent malicious repository injection:

**Blocked operations from projectSettings**:
- Setting `requiresUserConfirmation: false`
- Redirecting memory paths outside project directory
- Expanding tool allowlist beyond userSettings scope
- Downgrading deny rules to allow

Log: `[WARN] projectSettings security override rejected: {operation}`

## Interface

```typescript
type SecurityDecision = "deny" | "ask" | "allow";

interface SecurityDecisionRule {
  source: string;        // user | project | policy | builtin
  decision: SecurityDecision;
  reason?: string;
}

function arbitrate(rules: SecurityDecisionRule[]): SecurityDecision {
  if (rules.some(r => r.decision === "deny")) return "deny";
  if (rules.some(r => r.decision === "ask")) return "ask";
  return "allow";
}
```

## References

- AI-optimized: [ai/standards/security-decision.ai.yaml](../ai/standards/security-decision.ai.yaml)
- XSPEC-037: Cross-project specification
- Borrowed from: [claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.4 four-stage permission pipeline
