# 工作流程狀態協議

> **語言**: [English](../../../core/workflow-state-protocol.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-17
**適用性**: 所有使用多階段 AI 工作流程的專案
**範圍**: 通用 (Universal)
**產業標準**: 靈感來自 LangGraph 檢查點、OpenHands 事件溯源、GSD 狀態前言
**參考**: [LangGraph](https://github.com/langchain-ai/langgraph)、[OpenHands](https://github.com/All-Hands-AI/OpenHands)、[GSD](https://github.com/gsd-build/get-shit-done)

---

## 摘要

工作流程狀態協議定義了如何在 AI 工作階段之間持久化和恢復工作流程狀態。透過結合結構化狀態檔案（機器 + 人類可讀）與僅附加的事件日誌，團隊可以恢復中斷的工作流程、審計決策歷史，並防止長時間運行的開發流程中發生狀態丟失。

---

## 快速參考

| 面向 | 說明 |
|------|------|
| **狀態目錄** | `.workflow-state/`（專案根目錄） |
| **狀態檔案** | `.workflow-state/{workflow}-{id}.yaml` |
| **事件日誌** | `.workflow-state/{workflow}-{id}.log.yaml` |
| **儲存觸發** | 階段轉換、重要決策、工作階段邊界 |
| **載入觸發** | 工作階段開始、工作流程恢復、`/sdd` 搭配現有規格 |
| **Gitignore** | 建議：將 `.workflow-state/` 加入 `.gitignore` |

---

## 狀態檔案格式

狀態檔案結合機器可讀的前言與人類可讀的正文，遵循 GSD 前言模式。

### 結構

```yaml
# .workflow-state/sdd-SPEC-042.yaml

# === Machine-Readable Metadata ===
workflow: sdd
spec_id: SPEC-042
title: Add rate limiting to login endpoint
current_phase: implementation
status: in-progress
iteration_count: 0
created: 2026-03-17T10:00:00Z
updated: 2026-03-17T14:30:00Z
phases_completed:
  - discuss
  - proposal
  - review
artifacts:
  spec: docs/specs/SPEC-042.md
  tests: tests/auth/login.test.js
  implementation: src/auth/login.js

# === Human-Readable Summary ===
progress_summary: |
  Rate limiting feature for login endpoint.
  Spec approved after 1 review iteration.
  Currently implementing AC-2 (valid credentials still work).

completed_steps:
  - "AC-1: Rate limit check added to login.js:45"
  - "AC-1: Test cases added for rate limit exceeded"

next_steps:
  - "AC-2: Verify no regression on valid login flow"
  - "AC-3: Add rate limit headers to response"

open_questions:
  - "Should rate limiting be per-IP or per-user? (deferred to SPEC-043)"

decisions:
  - date: 2026-03-17
    decision: Use sliding window algorithm for rate limiting
    reason: Better UX than fixed window, prevents burst at window boundaries
```

### 必填欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| `workflow` | string | 工作流程類型（例如 `sdd`、`feature-dev`） |
| `spec_id` | string | 規格或任務識別碼 |
| `current_phase` | string | 活躍的階段 ID |
| `status` | enum | `in-progress`、`paused`、`blocked`、`completed`、`abandoned` |
| `updated` | datetime | 最後狀態更新時間戳 |
| `phases_completed` | list | 已完成階段 ID 的有序清單 |

### 選填欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| `title` | string | 人類友善的描述 |
| `iteration_count` | number | 驗證迭代計數器（用於迴圈上限） |
| `created` | datetime | 工作流程開始時間 |
| `artifacts` | map | 工作流程產出的關鍵檔案 |
| `progress_summary` | text | 以白話文描述的目前狀態 |
| `completed_steps` | list | 已完成的工作項目 |
| `next_steps` | list | 待完成的工作項目 |
| `open_questions` | list | 未解決的問題 |
| `decisions` | list | 工作流程期間做出的重要決策 |

---

## 事件日誌格式

事件日誌是僅附加的 YAML 清單，用於記錄工作流程事件以便審計。靈感來自 OpenHands 的 action-observation 串流。

### 結構

```yaml
# .workflow-state/sdd-SPEC-042.log.yaml

- timestamp: 2026-03-17T10:00:00Z
  event_type: phase_enter
  phase: discuss
  actor: user
  summary: Started discuss phase for rate limiting feature

- timestamp: 2026-03-17T10:15:00Z
  event_type: decision
  phase: discuss
  actor: ai
  summary: "Scope locked: rate limiting for login only, not all endpoints"
  details: "User confirmed per-endpoint approach. Global rate limiting deferred."

- timestamp: 2026-03-17T10:30:00Z
  event_type: phase_exit
  phase: discuss
  actor: ai
  summary: Discuss phase complete, all gray areas resolved

- timestamp: 2026-03-17T11:00:00Z
  event_type: checkpoint
  phase: proposal
  actor: ai
  summary: Spec SPEC-042 created with 3 acceptance criteria

- timestamp: 2026-03-17T14:00:00Z
  event_type: error
  phase: implementation
  actor: ai
  summary: "Test failure in AC-2: existing login test broke after rate limiter"
  details: "rateLimiter.check() was called before user lookup, causing null ref"
```

### 事件類型

| 類型 | 說明 | 何時記錄 |
|------|------|----------|
| `phase_enter` | 工作流程進入新階段 | 階段轉換時 |
| `phase_exit` | 工作流程退出階段 | 階段完成時 |
| `checkpoint` | 階段內的重要里程碑 | 關鍵產物建立時 |
| `decision` | 做出重要決策 | 設計選擇、範圍變更時 |
| `error` | 遇到錯誤或失敗 | 測試失敗、建置錯誤時 |
| `interruption` | 工作流程暫停（HITL 或上下文限制） | 需要人工介入時 |
| `resumption` | 從已儲存狀態恢復工作流程 | 工作階段重新啟動時 |

### 事件欄位

| 欄位 | 必填 | 說明 |
|------|------|------|
| `timestamp` | 是 | ISO 8601 時間戳 |
| `event_type` | 是 | 定義的事件類型之一 |
| `phase` | 是 | 目前的工作流程階段 |
| `actor` | 否 | `user`、`ai` 或 `system` |
| `summary` | 是 | 單行描述 |
| `details` | 否 | 延伸資訊 |

---

## 規則

### 狀態儲存規則

1. **階段轉換時儲存**（必要）：當工作流程從一個階段移動到另一個階段時，狀態檔案必須更新為新階段及已完成階段清單。

2. **工作階段邊界時儲存**（必要）：在活躍工作流程期間結束 AI 工作階段之前，儲存目前狀態以便下次工作階段恢復。

3. **重要決策時儲存**（建議）：做出重要設計決策時，將其記錄在狀態檔案的 `decisions` 清單和事件日誌中。

### 狀態載入規則

1. **工作階段開始時檢查**（必要）：在 AI 工作階段開始時，檢查 `.workflow-state/` 中是否有 `in-progress` 或 `paused` 的工作流程。如有，通知使用者並提供恢復選項。

2. **工作流程命令時載入**（必要）：當使用者呼叫工作流程命令（例如 `/sdd implement SPEC-042`）時，檢查現有狀態並載入，而非重新開始。

3. **驗證狀態新鮮度**（建議）：如果狀態檔案的 `updated` 時間戳超過 7 天，警告使用者狀態可能已過時。

---

## 目錄結構

```
project-root/
├── .workflow-state/           # 工作流程狀態目錄
│   ├── sdd-SPEC-042.yaml     # 活躍的 SDD 工作流程狀態
│   ├── sdd-SPEC-042.log.yaml # SPEC-042 的事件日誌
│   ├── sdd-SPEC-038.yaml     # 已完成的工作流程（status: completed）
│   └── feature-dev-auth.yaml  # 功能開發工作流程狀態
├── .gitignore                 # 應包含 .workflow-state/
└── ...
```

### Gitignore 建議

加入 `.gitignore`：
```
# Workflow state (session-specific, not for version control)
.workflow-state/
```

**理由**：工作流程狀態是特定於工作階段的，包含暫態的執行資料。不應進行版本控制，因為它可能包含敏感上下文或變得過時。

**例外**：希望跨開發者共享工作流程狀態的團隊可以選擇將其納入版本控制，但應定期清理已完成的工作流程。

---

## 與 SDD 整合

與規格驅動開發搭配使用時：

| SDD 階段 | 狀態動作 |
|----------|----------|
| 討論 | 建立狀態檔案，記錄灰色地帶和範圍決策 |
| 提案 | 更新規格產物路徑 |
| 審查 | 記錄審查意見和迭代次數 |
| 實作 | 追蹤 AC 進度、記錄 commits |
| 驗證 | 記錄迭代計數（用於迴圈上限）、記錄結果 |
| 歸檔 | 將狀態設為 `completed`，最終事件日誌條目 |

---

## 與上下文重置整合

開始新的 AI 工作階段時：

1. 檢查 `.workflow-state/` 中是否有活躍的工作流程
2. 如有，載入狀態檔案的 `progress_summary`、`next_steps` 和 `open_questions`
3. 僅載入與目前階段相關的標準（透過 context-aware-loading）
4. 從上次工作階段中斷的地方繼續

這提供了高效的上下文恢復，無需載入整個對話歷史。

---

## 最佳實踐

### 應該做的

- 在每次階段轉換時儲存狀態
- 保持 `progress_summary` 簡潔且最新
- 記錄決策及其理由
- 定期清理已完成的工作流程

### 不應該做的

- 不要在狀態檔案中儲存大型產物（改用路徑引用）
- 不要僅依賴狀態檔案來保存關鍵資料（以規格和程式碼為事實來源）
- 預設不要將狀態檔案納入版本控制
- 不要修改事件日誌（僅附加）

---

## 相關標準

- [規格驅動開發](spec-driven-development.md) — 使用狀態協議的主要工作流程
- [專案上下文記憶](project-context-memory.md) — `.project-context/` 中的持久決策
- [上下文感知載入](context-aware-loading.md) — 基於階段的標準載入
- [結構化任務定義](structured-task-definition.md) — 工作流程步驟中的任務結構

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|------|------|----------|
| 1.0.0 | 2026-03-17 | 初始標準：狀態檔案格式、事件日誌、儲存/載入規則 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
