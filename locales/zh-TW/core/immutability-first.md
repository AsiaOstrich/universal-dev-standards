---
source: ../../../core/immutability-first.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 不可變性優先架構標準

> **語言**: [English](../../../core/immutability-first.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-16
**適用範圍**: TypeScript 介面、資料流設計、並行系統
**Scope**: universal
**來源**: XSPEC-044

---

## 目的

系統級不可變性設計原則：DTO／Value Object 欄位一律 `readonly`，防止並行 Agent 環境下的競態條件。

資料流介面（DTO / Value Object）的欄位一律宣告為 `readonly`，陣列欄位使用 `ReadonlyArray<T>`，物件修改透過展開語法建立新物件，防止並行 Agent 環境下的意外狀態共享與競態條件。

---

## 核心規範

- 資料流介面（DTO / Value Object）的所有欄位必須宣告 `readonly`
- 介面中的陣列型欄位使用 `ReadonlyArray<T>` 而非可變的 `T[]`
- 修改物件時使用物件展開語法建立新物件，不直接賦值給 `readonly` 欄位
- 跨並行邊界（`Promise.all` / Worker Thread）傳遞的物件必須為深層不可變
- 介面中的嵌套物件欄位使用 `Readonly<T>` 包裝（防止淺層保護不足）

---

## 規則詳細說明

### IMM-001：DTO 欄位 readonly（必要）

資料流介面（Data Transfer Objects、Value Objects）的所有欄位必須宣告 `readonly`，防止並行 Agent 環境下的意外狀態共享與競態條件。

**錯誤範例**：
```typescript
interface TaskResult {
  status: TaskStatus   // ← 可被意外修改
  cost_usd?: number
}
```

**正確範例**：
```typescript
interface TaskResult {
  readonly status: TaskStatus   // ← 型別安全保護
  readonly cost_usd?: number
}
```

---

### IMM-002：陣列欄位 ReadonlyArray（必要）

介面中的陣列型欄位使用 `ReadonlyArray<T>` 而非可變的 `T[]`，防止 `push`/`splice`/`sort` 等就地修改操作破壞共享陣列。

**錯誤範例**：
```typescript
interface MemoryContext {
  recentHistory: IterationRecord[]   // ← 可被 push/splice
}
```

**正確範例**：
```typescript
interface MemoryContext {
  readonly recentHistory: ReadonlyArray<IterationRecord>
}
```

---

### IMM-003：展開語法替代就地修改（必要）

修改物件時使用物件展開語法建立新物件，不直接賦值給 `readonly` 欄位，保留原始物件不變，同時建立可追蹤的修改歷程。

**錯誤範例**：
```typescript
options.sessionId = forkId   // ← 直接修改，其他持有者看到改變
```

**正確範例**：
```typescript
const taskOptions = { ...options, sessionId: forkId }   // ← 新物件
```

---

### IMM-004：並行邊界深層不可變（必要）

跨並行邊界（`Promise.all` / Worker Thread）傳遞的物件必須為深層不可變，並行執行中無法預測存取順序，可變共享物件必然產生競態條件。

**正確範例**：
```typescript
// 每個並行任務持有自己的 options 快照
const batchResults = await Promise.all(
  batch.map(task => {
    const taskOptions = { ...baseOptions, sessionId: forkId }
    return executeOneTask(task, adapter, taskOptions, ...)
  })
)
```

---

### IMM-005：嵌套物件 Readonly 包裝（建議）

介面中的嵌套物件欄位使用 `Readonly<T>` 包裝，頂層 `readonly` 不防止嵌套物件欄位被修改（淺層保護不足）。

**錯誤範例**：
```typescript
interface PipelineMemoryEntry {
  readonly metadata: { score?: number }   // ← metadata.score 仍可被修改
}
```

**正確範例**：
```typescript
interface PipelineMemoryEntry {
  readonly metadata: Readonly<{ score?: number; severity?: string }>
}
```

---

## 適用時機

- 設計新的 DTO / Value Object / Config 介面時
- 跨並行邊界傳遞物件時
- Agent 間共享狀態設計時
- Code Review 時檢查介面是否遺漏 `readonly`

---

## 豁免情況

- Builder Pattern 的 mutable builder 物件（在 `build()` 後回傳不可變結果）
- 測試 fixture 的 mutable 建立步驟（建立後視為不可變）
- 效能關鍵的熱路徑（需有明確的 benchmark 依據才可豁免）

---

## 錯誤碼

| 代碼 | 說明 |
|------|------|
| `IMM-E001` | `READONLY_VIOLATION` — 嘗試修改 readonly 欄位（TypeScript 編譯期捕獲） |
| `IMM-E002` | `SHARED_MUTATION` — 跨並行邊界的就地修改導致競態條件 |
| `IMM-E003` | `SHALLOW_READONLY` — 嵌套物件遺漏 `Readonly<T>` 包裝，淺層保護不足 |
