---
source: ../../../core/immutability-first.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 3678885d6b73
status: current
---

# 不可變性優先架構標準

> **語言**: [English](../../../core/immutability-first.md) | 繁體中文

> **來源**: XSPEC-044 | **適用於**: TypeScript、並行系統

## 概述

不可變性優先（Immutability-First）是一項系統層級的設計原則，用以防止並行 Agent 環境中的競態條件。所有資料流介面（DTO / Value Object）都必須以 `readonly` 宣告欄位，陣列欄位必須使用 `ReadonlyArray<T>`，物件修改必須透過展開語法建立新物件，而非就地修改。

若缺乏此紀律，並行 Agent 編排（例如 `Promise.all` 批次執行）便有意外共享狀態的風險：某個 Agent 的修改會悄悄影響其他 Agent 所看到的同一個物件。

## 規則

| 規則 | 嚴重度 | 說明 |
|------|--------|------|
| **IMM-001** | required | DTO/Value Object 欄位必須為 `readonly` |
| **IMM-002** | required | 陣列欄位必須使用 `ReadonlyArray<T>`，而非 `T[]` |
| **IMM-003** | required | 修改時使用展開語法建立新物件 |
| **IMM-004** | required | 跨越並行邊界的物件必須為深層不可變 |
| **IMM-005** | recommended | 巢狀物件欄位以 `Readonly<T>` 包裝 |

## 範例

### IMM-001：DTO 欄位 readonly

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

### IMM-002：陣列欄位使用 ReadonlyArray

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

### IMM-003：以展開語法進行修改

```typescript
// ❌ Bad
options.sessionId = forkId   // other holders see the change

// ✅ Good
const taskOptions = { ...options, sessionId: forkId }
```

### IMM-004：並行邊界的深層不可變

```typescript
// ✅ Good — each parallel task holds its own options snapshot
const batchResults = await Promise.all(
  batch.map(task => {
    const taskOptions = { ...baseOptions, sessionId: forkId }
    return executeOneTask(task, adapter, taskOptions, ...)
  })
)
```

### IMM-005：巢狀物件使用 Readonly<T>

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

## 適用時機

- 設計新的 DTO / Value Object / Config 介面時
- 跨並行邊界傳遞物件時
- 設計 Agent 間的共享狀態時
- Code Review：檢查介面是否遺漏 `readonly`

## 豁免情況

- Builder Pattern 的可變 builder（在 `build()` 後回傳不可變結果）
- 測試 fixture 的可變建立步驟（建立後視為不可變）
- 效能關鍵的熱路徑（需有明確的 benchmark 依據）

## 參考資料

- AI 最佳化版：[ai/standards/immutability-first.ai.yaml](../../../ai/standards/immutability-first.ai.yaml)
- XSPEC-044：跨專案規格


**Scope**: universal
