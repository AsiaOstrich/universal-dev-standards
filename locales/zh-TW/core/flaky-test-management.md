---
source: ../../../core/flaky-test-management.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 04c9ce181011
status: current
---

# Flaky 測試管理標準

> **Language**: [English](../../../core/flaky-test-management.md) | 繁體中文

## 概述

在一個 3000 個測試的套件中，只要有一個 flaky 測試，就足以侵蝕 CI 的可信度，讓開發人員開始忽略失敗。一旦開發人員學會「重跑 CI 就好」，真正的 bug 就會悄悄溜過。消除 flaky 測試的成本，永遠低於它們所製造的虛假安全感的成本。

## 定義

若一個測試在相同程式碼下連續執行卻產生不同結果（pass/fail），即為 **flaky**。2% 門檻：若一個測試在 `main` 上未變更程式碼的情況下失敗率 ≥ 2%，即屬 flaky。

## 偵測

大多數 CI 系統可自動偵測 flakiness：

- **GitHub Actions**：尋找 `Flaky tests detected` 標註
- **手動**：執行 `npx vitest run --reporter=verbose` 5 次，觀察是否有非確定性結果
- **Vitest**：`vitest run --repeat=5`（每個測試各執行 5 次）

## 隔離（Quarantine）工作流程

```
Detected → Quarantine (< 48h) → Track → Fix or Delete (< 30 days)
```

### 隔離標註

```typescript
// TODO: quarantined 2026-05-05 — flaky race condition, see issue #42
it.skip("reconnects after WebSocket disconnect", async () => {
  // ... test body preserved for reference
})
```

### 追蹤 Issue 範本

```markdown
**Flaky Test**: `describe > test name`
**File**: `src/path/to/test.ts`
**Quarantined**: 2026-05-05
**Failure rate**: ~5% on main
**Known failure mode**: `Cannot read property 'socket' of undefined`
**Root cause hypothesis**: Race condition in WebSocket teardown
**Deadline**: 2026-06-05
```

## 常見根本原因

| 根本原因 | 修法 |
|-----------|-----|
| Race condition | 使用 `waitFor()`、`vi.waitFor()`、正確的 async 協調 |
| 共享狀態 | 在 `beforeEach`/`afterEach` 中重置狀態 |
| 外部服務 | Mock 該依賴 |
| 檔案系統排序 | 使用確定性排序 |
| 未設 seed 的隨機值 | 在測試中設定固定 seed |
| 時序相依 | 使用假計時器（`vi.useFakeTimers()`） |

## Vitest 設定

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    retry: 2,              // retry failed tests up to 2 times
    testTimeout: 10000,    // 10s timeout prevents infinite hangs
    hookTimeout: 5000,     // 5s hook timeout
  }
})
```

## 相關標準

- [Testing Standards](testing-standards.md) — 整體測試金字塔
- [Test Governance Standards](test-governance.md) — CI 政策


**Scope**: universal
