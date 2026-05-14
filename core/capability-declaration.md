# Capability Declaration Standard

> **Source**: XSPEC-037 | **Borrowed from**: claude-code-book Ch.3

## Overview

The Capability Declaration Standard mandates that all tools, adapters, and agents explicitly declare their safety properties. **All properties default to the most conservative (Fail-Closed) values** — a developer who forgets to declare capabilities gets safe behavior, not dangerous behavior.

Borrowed from claude-code-book's `buildTool` factory design, where `isConcurrencySafe()` and `isReadOnly()` default to `false`, requiring explicit opt-in for performance optimizations.

## Fail-Closed Defaults

```typescript
const FAIL_CLOSED_DEFAULTS: CapabilityDeclaration = {
  isConcurrencySafe: false,       // Cannot run in parallel
  isReadOnly: false,              // Assumed to have side effects
  requiresUserConfirmation: true, // Must confirm before execution
  trustLevel: "untrusted",        // Maximum sandbox restrictions
};
```

## CapabilityDeclaration Interface

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `isConcurrencySafe` | boolean | **false** | Safe to run in parallel with other operations |
| `isReadOnly` | boolean | **false** | Makes no persistent state changes |
| `requiresUserConfirmation` | boolean | **true** | Requires explicit user approval before execution |
| `trustLevel` | enum | **untrusted** | Sandbox isolation level |

## Trust Levels

| Level | Description | Sandbox |
|-------|-------------|---------|
| `trusted` | Built-in or audited plugin | No restrictions |
| `sandboxed` | Third-party tool | Restricted execution environment |
| `untrusted` | Unknown source | Maximum restrictions (default) |

## Well-Known Declarations

| Tool | isConcurrencySafe | isReadOnly | requiresConfirmation | trustLevel |
|------|-------------------|------------|---------------------|------------|
| GrepTool | ✅ true | ✅ true | ❌ false | trusted |
| GlobTool | ✅ true | ✅ true | ❌ false | trusted |
| FileReadTool | ✅ true | ✅ true | ❌ false | trusted |
| FileEditTool | ❌ false | ❌ false | ✅ true | trusted |
| BashTool | ❌ false | ❌ false | ✅ true | sandboxed |

## Enforcement

- **Missing declaration**: Use `FAIL_CLOSED_DEFAULTS` + log `[WARN] Capability not declared for: {name}`
- **False claim detection**: If declared `isReadOnly: true` but performs writes → log `CAPABILITY_MISMATCH` event, revert to Fail-Closed
- **Concurrency**: Only components with `isConcurrencySafe: true` may be batched into parallel execution

## References

- AI-optimized: [ai/standards/capability-declaration.ai.yaml](../ai/standards/capability-declaration.ai.yaml)
- XSPEC-037: Cross-project specification
- Borrowed from: [claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.3 `buildTool` Fail-Closed factory


**Scope**: universal
