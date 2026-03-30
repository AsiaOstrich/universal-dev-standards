---
source: ../../../core/agent-communication-protocol.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-30
status: current
---

# Agent 通訊協定

> **語言**: [English](../../../core/agent-communication-protocol.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-30
**適用性**: 跨專案 AI Agent 編排（UDS / DevAP / VibeOps）
**範圍**: 通用 (Universal)
**相關標準**: [代理派遣](./agent-dispatch.md)、[AI 模型選擇策略](./model-selection.md)
**規格**: [SPEC-AGENT-COMM-001](../../../docs/specs/SPEC-AGENT-COMM-001-agent-communication-protocol.md)

---

## 目的

定義跨 AsiaOstrich 產品線的統一 AI Agent 通訊協定。建立可互通的狀態碼、訊息 Envelope 格式、結構化 Handoff 與協定版本管理，讓不同專案的 Agent 無需自訂轉接器即可溝通。

---

## 術語表

| 術語 | 定義 |
|------|------|
| Envelope | 包含中繼資料與酬載的標準化訊息封裝 |
| Handoff | Agent 之間的結構化上下文傳遞物件 |
| Status Protocol | Agent 完成狀態的統一集合 |
| Artifact | Agent 產出的具型別輸出（spec、code、test、review、plan、design） |
| Correlation ID | 連結同一任務鏈中訊息的共享識別碼 |

---

## 核心原則 — 協定優先於慣例

> **Agent 間的互通性透過明確的協定合約實現，而非隱式的 prompt 慣例。**

---

## 1. 統一狀態協定

### 1.1 狀態碼

八個標準化狀態碼構成所有專案特定狀態的超集：

| 狀態 | 說明 |
|------|------|
| `success` | 任務成功完成 |
| `success_partial` | 完成但有疑慮需記錄 |
| `failed` | 任務執行失敗 |
| `blocked` | 無法繼續，需升級處理 |
| `needs_context` | 需要更多上下文（重新派遣） |
| `skipped` | 任務被有意略過 |
| `timeout` | 任務超時 |
| `unknown` | 無法識別的狀態（降級） |

### 1.2 跨專案映射

跨專案狀態碼映射表：

| 統一狀態 | UDS | DevAP | VibeOps |
|----------|-----|-------|---------|
| `success` | DONE | success | success |
| `success_partial` | DONE_WITH_CONCERNS | done_with_concerns | partial |
| `failed` | — | failed | failure |
| `blocked` | BLOCKED | blocked | — |
| `needs_context` | NEEDS_CONTEXT | needs_context | — |
| `skipped` | — | skipped | — |
| `timeout` | — | timeout | — |
| `unknown` | — | — | — |

### 1.3 規則

1. **無損映射**：每個專案特定狀態必須映射到恰好一個統一狀態。
2. **Unknown 降級**：無法識別的狀態碼必須映射到 `unknown` 並記錄警告。
3. **不中斷**：接收到 `unknown` 不得中斷執行流程。

---

## 2. Agent Envelope 協定

### 2.1 必要欄位（8 個）

每個 Agent 訊息必須包含以下欄位：

| 欄位 | 型別 | 說明 |
|------|------|------|
| `envelope_version` | string | 協定版本（MAJOR.MINOR） |
| `message_id` | string (UUID) | 唯一訊息識別碼 |
| `source` | object | 發送方：`{ agent_id, agent_type, project }` |
| `target` | object | 接收方：`{ agent_id?, agent_type }`（廣播時可選） |
| `status` | string | 統一狀態碼 |
| `timestamp` | string (ISO 8601) | 訊息建立時間 |
| `payload.artifact_type` | string | 以下之一：spec、code、test、review、plan、design |
| `payload.artifact_id` | string | 唯一 Artifact 識別碼 |

### 2.2 可選欄位

| 欄位 | 型別 | 說明 |
|------|------|------|
| `correlation_id` | string | 連結同一任務鏈中的訊息 |
| `parent_message_id` | string | 參照父訊息（用於回應） |
| `metadata` | object | 可擴展中繼資料（model_tier、token_usage、duration_ms） |
| `concerns` | string[] | 狀態為 `success_partial` 時記錄的問題 |

### 2.3 驗證規則

1. 缺少必要欄位的訊息必須以 `INVALID_ENVELOPE` 錯誤拒絕。
2. 錯誤訊息必須指出哪些欄位缺失。
3. 具有無效 `status` 值的訊息必須被拒絕。

### 2.4 向前相容性

1. 接收方必須解析所有已知欄位並忽略未知欄位。
2. 轉發時必須保留（不移除）未知欄位。
3. 相同 MAJOR 版本保證向後相容。

---

## 3. 結構化 Handoff

### 3.1 目的

以明確的上下文傳遞取代隱式的 prompt 拼接。

### 3.2 Handoff 結構

| 欄位 | 必要 | 說明 |
|------|------|------|
| `from` | 是 | 發送方：`{ agent_id, agent_type, message_id }` |
| `to` | 是 | 接收方：`{ agent_type }`（實例由編排器分配） |
| `artifacts` | 是 | `{ artifact_id, artifact_type, summary }` 陣列 |
| `decision_log` | 否 | `{ decision, reason, agent_id, timestamp }` 陣列 |
| `pending_items` | 否 | `{ item, priority, context? }` 陣列 |
| `constraints` | 否 | 約束條件字串陣列 |

### 3.3 規則

1. **選擇性參照**：Handoff 應透過 ID 參照 Artifact，而非嵌入完整內容。
2. **決策可追溯性**：每個 `decision_log` 項目必須包含所有四個欄位。
3. **上下文鏈**：下游 Agent 可追溯決策至原始 Agent 與時間戳。

---

## 4. 協定版本管理

### 4.1 版本格式

`MAJOR.MINOR`，採用語意化版本原則：

- **MAJOR** 遞增：破壞性變更（新增必要欄位、移除欄位、語意變更）
- **MINOR** 遞增：向後相容的新增（新增可選欄位、新增 Artifact 類型）

### 4.2 相容性規則

| 情境 | 行為 |
|------|------|
| 相同 MAJOR，較高 MINOR | 解析已知欄位，忽略未知欄位 |
| 不同 MAJOR | 回傳 `VERSION_INCOMPATIBLE` 錯誤，附帶支援範圍 |

### 4.3 版本路線圖

| 版本 | 內容 |
|------|------|
| **v1.0** | 狀態映射、Envelope、Handoff（本標準） |
| **v1.1** | 具型別 Artifact Schema（每種 artifact_type 的 JSON Schema） |
| **v1.2** | 增量 Checkpoint 格式 |
| **v2.0** | Agent 能力註冊表、DAG 排程協定 |

---

## 快速參考

```
┌─────────────────────── Envelope ───────────────────────┐
│ envelope_version: "1.0"                                 │
│ message_id: "msg-uuid"                                  │
│ source: { agent_id, agent_type, project }               │
│ target: { agent_type }                                  │
│ status: success | success_partial | failed | blocked    │
│         | needs_context | skipped | timeout | unknown   │
│ timestamp: "ISO 8601"                                   │
│ payload: { artifact_type, artifact_id, content }        │
│ ── optional ──                                          │
│ correlation_id, parent_message_id, metadata, concerns   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────── Handoff ────────────────────────┐
│ from: { agent_id, agent_type, message_id }              │
│ to: { agent_type }                                      │
│ artifacts: [{ artifact_id, artifact_type, summary }]    │
│ ── optional ──                                          │
│ decision_log: [{ decision, reason, agent_id, ts }]      │
│ pending_items: [{ item, priority, context? }]           │
│ constraints: [string]                                   │
└─────────────────────────────────────────────────────────┘
```
