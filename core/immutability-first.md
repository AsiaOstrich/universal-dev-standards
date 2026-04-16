# Immutability-First Architecture Standard

> **Source**: XSPEC-044 | **Applies to**: TypeScript, concurrent systems

## Overview

Immutability-First is a system-level design principle that prevents race conditions in concurrent Agent environments. All data-flow interfaces (DTOs / Value Objects) must use `readonly` field declarations, array fields must use `ReadonlyArray<T>`, and object mutations must be performed via spread syntax to create new objects rather than modifying in place.

Without this discipline, concurrent Agent orchestration (e.g., `Promise.all` batch execution) risks unintended state sharing where one Agent's mutation silently affects another Agent's view of the same object.

## Rules

| Rule | Severity | Description |
|------|----------|-------------|
| **IMM-001** | required | DTO/Value Object fields must be `readonly` |
| **IMM-002** | required | Array fields must use `ReadonlyArray<T>`, not `T[]` |
| **IMM-003** | required | Mutations use spread syntax to create new objects |
| **IMM-004** | required | Objects crossing concurrency boundaries must be deeply immutable |
| **IMM-005** | recommended | Nested object fields wrapped with `Readonly<T>` |

## Examples

### IMM-001: DTO Fields readonly

```typescript
// ❌ Bad
interface TaskResult {
  status: TaskStatus
  cost_usd?: number
}

// ✅ Good
interface TaskResult {
  readonly status: TaskStatus
  readonly cost_usd?: number
}
```

### IMM-002: ReadonlyArray for Array Fields

```typescript
// ❌ Bad
interface MemoryContext {
  recentHistory: IterationRecord[]   // push/splice can corrupt shared state
}

// ✅ Good
interface MemoryContext {
  readonly recentHistory: ReadonlyArray<IterationRecord>
}
```

### IMM-003: Spread Syntax for Mutations

```typescript
// ❌ Bad
options.sessionId = forkId   // other holders see the change

// ✅ Good
const taskOptions = { ...options, sessionId: forkId }
```

### IMM-004: Deep Immutability at Concurrency Boundary

```typescript
// ✅ Good — each parallel task holds its own options snapshot
const batchResults = await Promise.all(
  batch.map(task => {
    const taskOptions = { ...baseOptions, sessionId: forkId }
    return executeOneTask(task, adapter, taskOptions, ...)
  })
)
```

### IMM-005: Readonly<T> for Nested Objects

```typescript
// ❌ Bad — metadata.score can still be mutated
interface PipelineMemoryEntry {
  readonly metadata: { score?: number }
}

// ✅ Good
interface PipelineMemoryEntry {
  readonly metadata: Readonly<{ score?: number; severity?: string }>
}
```

## When to Apply

- Designing new DTO / Value Object / Config interfaces
- Passing objects across concurrency boundaries
- Designing shared state between Agents
- Code Review: check interfaces for missing `readonly`

## Exceptions

- Builder Pattern mutable builders (returns immutable result after `build()`)
- Test fixture mutable construction steps (treated as immutable after creation)
- Performance-critical hot paths (requires explicit benchmark evidence)

## References

- AI-optimized: [ai/standards/immutability-first.ai.yaml](../ai/standards/immutability-first.ai.yaml)
- XSPEC-044: Cross-project specification
