---
source: ../../../core/mock-boundary.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: d2648ad3d869
status: current
---

# Mock 邊界標準

> **Language**: [English](../../../core/mock-boundary.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-05-04
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

---

## 不可 Mock 的項目

| 類別 | 違規範例 | 禁止原因 |
|------|---------|---------|
| 自身模組的核心邏輯 | 在 pipeline-runner 測試中 `vi.mock('./pipeline-runner.js')` | 使測試形同虛設 |
| IT/flow/E2E 測試中的資料庫 | 在整合測試中 `vi.mock('./db/client.js')` | 隱藏查詢 bug、schema 問題 |
| HTTP 框架內部 | `vi.mock('express')` | 真實路由可能已壞 |
| 安全控制 | 永遠通過的 auth middleware stub | 安全性回歸不可見 |

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

---

## 規則摘要

| 規則 | 觸發條件 | 動作 |
|------|---------|------|
| 禁止 self-mock | 測試檔 mock 自己的模組 | 移除 mock；讓真實程式碼執行 |
| IT/flow 用真實 DB | 撰寫 IT 或 flow 測試 | 使用 in-memory SQLite 或測試 schema |
| IT 對應測試 | mock 跨模組邊界 | 確保有對應的 IT 存在 |
| 禁止 mock 安全機制 | 測試涉及 auth/權限 | 使用真實測試使用者 + 真實 token |
| 空心審查 | Mock 數量 ≥ import 數量 | 加入輸出值斷言 |

---

## 與其他標準的關係

- **testing**：Mock 邊界規則適用於測試金字塔的所有測試層級
- **test-completeness-dimensions**：維度 8（AI 測試品質）引用了這些規則
- **flow-based-testing**：Flow 測試必須遵循 mock 邊界規則
