---
source: ../../../core/immutability-first.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 3678885d6b73
status: current
---

# 不可变性优先架构标准

> **语言**: [English](../../../core/immutability-first.md) | 简体中文

> **来源**: XSPEC-044 | **适用于**: TypeScript、并发系统

## 概述

不可变性优先（Immutability-First）是一项系统级设计原则，用于防止并发 Agent 环境中的竞态条件。所有数据流接口（DTO / Value Object）都必须以 `readonly` 声明字段，数组字段必须使用 `ReadonlyArray<T>`，对象的修改必须通过 spread 语法创建新对象，而不是原地修改。

缺少这项纪律时，并发的 Agent 编排（例如 `Promise.all` 批量执行）就有意外共享状态的风险：一个 Agent 的修改会悄悄影响另一个 Agent 对同一对象的视图。

## 规则

| 规则 | 严重性 | 说明 |
|------|--------|------|
| **IMM-001** | required | DTO/Value Object 字段必须为 `readonly` |
| **IMM-002** | required | 数组字段必须使用 `ReadonlyArray<T>`，而非 `T[]` |
| **IMM-003** | required | 修改时使用 spread 语法创建新对象 |
| **IMM-004** | required | 跨越并发边界的对象必须是深度不可变的 |
| **IMM-005** | recommended | 嵌套对象字段以 `Readonly<T>` 包装 |

## 示例

### IMM-001：DTO 字段 readonly

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

### IMM-002：数组字段使用 ReadonlyArray

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

### IMM-003：以 Spread 语法进行修改

```typescript
// ❌ Bad
options.sessionId = forkId   // other holders see the change

// ✅ Good
const taskOptions = { ...options, sessionId: forkId }
```

### IMM-004：并发边界上的深度不可变

```typescript
// ✅ Good — each parallel task holds its own options snapshot
const batchResults = await Promise.all(
  batch.map(task => {
    const taskOptions = { ...baseOptions, sessionId: forkId }
    return executeOneTask(task, adapter, taskOptions, ...)
  })
)
```

### IMM-005：嵌套对象使用 Readonly<T>

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

## 何时适用

- 设计新的 DTO / Value Object / Config 接口
- 跨并发边界传递对象
- 设计 Agent 之间的共享状态
- 代码审查：检查接口是否遗漏 `readonly`

## 例外

- Builder Pattern 的可变 builder（`build()` 之后返回不可变结果）
- 测试 fixture 的可变构建步骤（创建完成后视为不可变）
- 性能关键的热路径（需要明确的 benchmark 证据）

## 参考资料

- AI 优化版：[ai/standards/immutability-first.ai.yaml](../../../ai/standards/immutability-first.ai.yaml)
- XSPEC-044：跨项目规格


**范围**: universal
