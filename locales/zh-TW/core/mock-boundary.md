---
source: ../../../core/mock-boundary.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-07-01
source_hash: fe4715991a4c
status: current
---

# Mock 邊界標準

> **Language**: [English](../../../core/mock-boundary.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-07-01
**適用範圍**: 所有具備單元測試與整合測試的軟體專案
**Scope**: universal
**產業標準**: ISTQB Foundation（Test Doubles）, xUnit Patterns（Gerard Meszaros）
**參考資料**: "Working Effectively with Legacy Code"（Feathers）, "Growing Object-Oriented Software"（Freeman & Pryce）

---

## 目的

本文件定義測試中哪些東西可以 mock、哪些不可以。其目標是防止**空心測試（hollow tests）**——永遠通過卻無法偵測真實 bug 的測試，因為它們用 stub 取代了系統的邏輯。

---

## 空心測試問題

空心測試 mock 掉系統的大部分內容，使測試變成 mock 接線的規格說明，而非系統行為的規格說明。經典症狀：你可以刪掉實作檔案，測試仍然通過。

**真實案例（Multi-agent pipeline SPEC-002.test.ts）**:

```typescript
vi.mock('../../src/runner/agent-runner.js')      // Core logic replaced
vi.mock('../../src/runner/guardian-hooks.js')     // Core logic replaced
vi.mock('../../src/runner/prototyper.js')         // Core logic replaced
vi.mock('../../src/runner/iteration-report.js')   // Core logic replaced
vi.mock('../../src/memory/memory-store.js')       // Core logic replaced
vi.mock('node:fs/promises', ...)                  // I/O replaced

// All assertions verify mock call counts — not actual outputs.
// runPipeline() touches zero real code.
```

---

## 可以 Mock 的項目

| 類別 | 範例 | 理由 |
|------|------|------|
| 外部 HTTP 服務 | LLM API、金流閘道、email 服務 | 防止不穩定（flaky）測試；可控制回應情境 |
| 時間函式 | `Date.now()`、`new Date()`、`setTimeout` | 使測試具確定性 |
| 環境變數 | `process.env.NODE_ENV`、`process.env.LICENSE_KEY` | 支援組態變化 |
| 檔案系統（僅限單元測試） | `fs.readFile`、`fs.writeFile` | 讓快速單元測試避免 I/O |
| 跨模組邊界（須有對應 IT） | 其他模組的 public API | 隔離受測單元 |
| 行程內背景執行（透過可注入 runner） | `Task.Run`、unawaited promise、`setTimeout`、goroutine、thread-pool dispatch | 注入 runner seam 讓測試能 await 到確定完成，消除 race |

---

## 不可 Mock 的項目

| 類別 | 違規範例 | 禁止原因 |
|------|---------|---------|
| 自身模組的核心邏輯 | 在 pipeline-runner 測試中 `vi.mock('./pipeline-runner.js')` | 使測試形同虛設 |
| IT/flow/E2E 測試中的資料庫 | 在整合測試中 `vi.mock('./db/client.js')` | 隱藏查詢 bug、schema 問題 |
| HTTP 框架內部 | `vi.mock('express')` | 真實路由可能已壞 |
| 安全控制 | 永遠通過的 auth middleware stub | 安全性回歸不可見 |

---

## 可注入的背景執行（Injectable Background Execution）

fire-and-forget 的背景工作（`Task.Run`、unawaited promise、`setTimeout`、goroutine、`java.util.concurrent` executor 提交，或 `asyncio.create_task`）是一個 **seam**，就跟系統時鐘一樣。正如你注入 clock 而非讀取 wall-clock 時間，你也應注入背景 dispatcher，而非直接生出背景工作。這讓測試能把工作驅動到**確定、可被 await 的完成**，並斷言其結果（成功、例外或 retry）——不用 poll、不用 sleep、沒有 race。

把 dispatch 抽象成一個小介面（例如 `IBackgroundTaskRunner` / `BackgroundDispatcher`），再提供兩種實作：

- **Production**：保留真正的 fire-and-forget 語意——dispatch 立即回傳，工作以 detached 方式執行。
- **Test**：以 **inline** 方式執行工作並**追蹤底層 Task/promise**，對外暴露一個 handle 讓測試能 `await`，使完成（與任何失敗）可被觀察。

語言中立示意（TypeScript pseudo-code）：

```typescript
// Seam — 於任何 dispatch 背景工作處注入
interface BackgroundDispatcher {
  dispatch(work: () => Promise<void>): void
}

// Production：真正的 fire-and-forget——立即回傳，工作以 detached 執行
class FireAndForgetDispatcher implements BackgroundDispatcher {
  dispatch(work: () => Promise<void>): void {
    void work() // 刻意不 await
  }
}

// Test：inline 執行 + 追蹤 task，讓測試能 await 到完成
class DeterministicDispatcher implements BackgroundDispatcher {
  private readonly tasks: Promise<void>[] = []
  dispatch(work: () => Promise<void>): void {
    this.tasks.push(work()) // inline 啟動並保留 handle
  }
  async settle(): Promise<void> {
    await Promise.all(this.tasks) // 測試 await 到確定完成
  }
}
```

測試注入 `DeterministicDispatcher`，執行受測程式碼，再於斷言結果前 `await dispatcher.settle()`——背景副作用此時已完全可觀察且具確定性。

---

## 空心測試偵測

提交測試檔之前，請檢查：

1. **Mock 數量 ≥ import 數量** → 審查：至少要有一個斷言驗證實際輸出
2. **所有斷言都是 `.toHaveBeenCalled()` 系列** → 加入輸出值斷言
3. **Mock 路徑與受測對象目錄相同** → 自我引用 mock；移除之
4. **Mock 設定行數多於斷言行數** → 很可能是空心測試

---

## 反模式

- **Total Mock Isolation**：所有 import 都被 mock；只斷言 mock 互動
- **Mock the World**：外部 + 內部 + DB + FS 在同一個測試中全部 mock
- **Orphan Mock**：跨模組 mock 卻沒有對應的整合測試
- **Security Bypass Mock**：auth/權限邏輯被換成直接放行的 stub
- **Database Mock Cascade**：DB 回傳寫死的資料，隱藏真實查詢錯誤
- **Poll/Sleep for Background Result**：用 sleep 或 poll 等待 fire-and-forget 背景工作完成。race 依然存在——timeout 只是多數時候把它遮住，同時拖慢整套測試；在共用 runner 上更會把 flakiness 洩漏進其他 MR 的 CI。改注入 deterministic runner 並 await 被追蹤的 task。

---

## 規則摘要

| 規則 | 觸發條件 | 動作 |
|------|---------|------|
| 禁止 self-mock | 測試檔 mock 自己的模組 | 移除 mock；讓真實程式碼執行 |
| IT/flow 用真實 DB | 撰寫 IT 或 flow 測試 | 使用 in-memory SQLite 或測試 schema |
| IT 對應測試 | mock 跨模組邊界 | 確保有對應的 IT 存在 |
| 禁止 mock 安全機制 | 測試涉及 auth/權限 | 使用真實測試使用者 + 真實 token |
| 空心審查 | Mock 數量 ≥ import 數量 | 加入輸出值斷言 |
| 背景工作禁止 poll/sleep | 測試斷言某個 fire-and-forget 副作用 | 注入 deterministic runner；await 被追蹤的 task |

---

## 與其他標準的關係

- **testing**：Mock 邊界規則適用於測試金字塔的所有測試層級
- **test-completeness-dimensions**：維度 8（AI 測試品質）引用了這些規則
- **flow-based-testing**：Flow 測試必須遵循 mock 邊界規則

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-05-04 | 初始標準：空心測試問題、可／不可 Mock 表格、偵測、反模式、規則摘要 |
| 1.1.0 | 2026-07-01 | 新增可注入的背景執行作為 seam（平行於 clock injection）：可 Mock 表列、`可注入的背景執行` 章節、`Poll/Sleep for Background Result` 反模式，以及背景工作禁止 poll/sleep 規則（issue #143） |
