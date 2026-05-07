# SPEC-AGENT-COMM-001: Agent Communication Protocol

| 欄位 | 值 |
|------|-----|
| **SPEC-ID** | SPEC-AGENT-COMM-001 |
| **狀態** | Archived |
| **版本** | 1.0.0 |
| **作者** | AsiaOstrich Team |
| **建立日期** | 2026-03-30 |
| **最後更新** | 2026-03-30 |
| **適用範圍** | 跨採用層（UDS + 採用層） |
| **相關標準** | `core/agent-dispatch.md`, `core/model-selection.md` |

---

## 1. 摘要

定義 UDS 與採用層之間的統一 Agent 通訊協定。本規格解決各採用層各自演化導致的狀態碼不相容、訊息格式分歧、上下文傳遞方式不一致等問題，建立可跨採用層組合的 Agent 通訊基礎。

本規格只定義協定標準（What），不定義各專案實作方式（How）。

## 2. 動機

### 2.1 現有痛點

| 痛點 | 影響 | 嚴重度 |
|------|------|--------|
| **狀態碼不相容** | UDS 4 種、採用層各有差異，無法直接映射 | 高 |
| **訊息格式分歧** | UDS 用 prompt injection，採用層格式各異（TaskResult、JSON 等） | 高 |
| **上下文傳遞隱式** | agent 間的上下文靠 prompt 拼接，無結構化 handoff | 高 |
| **無協定版本管理** | 各專案獨立修改格式，無向後相容保證 | 中 |

### 2.2 設計目標

1. **統一**：三個專案的 agent 用同一套協定溝通
2. **最小化**：只定義必要欄位，避免過度設計
3. **可演進**：內建版本機制，支援漸進式擴展
4. **授權隔離**：協定定義在 UDS（MIT），各專案各自實作

## 3. Requirements

### Requirement 1: Status Superset Protocol

系統 SHALL 定義統一的 agent 狀態碼超集，涵蓋三個專案現有的所有狀態。

#### Scenario: 狀態碼映射

- **GIVEN** 三個專案各自有不同的 agent 狀態碼定義
- **WHEN** 任一專案的 agent 回報執行結果
- **THEN** 該結果 SHALL 能映射到統一狀態碼，不遺失語義

#### Scenario: 未知狀態處理

- **GIVEN** 某專案新增了協定未定義的狀態碼
- **WHEN** 其他專案收到此未知狀態
- **THEN** SHALL 將其視為 `unknown` 並記錄警告，不得中斷執行

### Requirement 2: Agent Envelope Protocol

系統 SHALL 定義統一的訊息信封格式，包含所有 agent 間通訊的必要元資料。

#### Scenario: 訊息建立

- **GIVEN** 一個 agent 需要將結果傳遞給下游 agent
- **WHEN** agent 建立回應訊息
- **THEN** 訊息 SHALL 包含信封必要欄位（envelope_version, message_id, source, target, status, timestamp, payload）

#### Scenario: 訊息驗證

- **GIVEN** 一個 orchestrator 收到 agent 的訊息
- **WHEN** 訊息缺少必要欄位
- **THEN** orchestrator SHALL 拒絕該訊息並回報 `INVALID_ENVELOPE` 錯誤

#### Scenario: 版本不相容

- **GIVEN** 訊息的 `envelope_version` 高於接收端支援的版本
- **WHEN** 接收端解析訊息
- **THEN** SHALL 嘗試解析已知欄位（向前相容），未知欄位 SHALL 被忽略但保留

### Requirement 3: Structured Handoff

系統 SHALL 定義結構化的上下文傳遞格式，取代隱式 prompt injection。

#### Scenario: 上下文傳遞

- **GIVEN** Agent A 完成任務並產出 artifacts
- **WHEN** orchestrator 需要將結果傳遞給 Agent B
- **THEN** SHALL 使用 handoff 物件傳遞，包含 artifacts 引用、決策記錄、待處理事項

#### Scenario: 選擇性上下文

- **GIVEN** Agent A 產出了大量 artifacts
- **WHEN** 下游 Agent B 只需要部分上下文
- **THEN** handoff 物件 SHALL 支援選擇性引用（by artifact ID），避免 context 膨脹

#### Scenario: 上下文鏈追溯

- **GIVEN** 一個 agent 需要了解上游決策的原因
- **WHEN** agent 讀取 handoff 的 decision_log
- **THEN** SHALL 能追溯到做出該決策的原始 agent 和時間點

### Requirement 4: Protocol Versioning

系統 SHALL 內建版本管理機制，支援協定的漸進式演進。

#### Scenario: 版本宣告

- **GIVEN** 一個訊息被建立
- **WHEN** 填寫 envelope_version 欄位
- **THEN** SHALL 使用語意化版本號（MAJOR.MINOR），MAJOR 變更表示不向後相容

#### Scenario: 向後相容

- **GIVEN** 接收端支援 protocol v1.0
- **WHEN** 收到 v1.1 的訊息（同 MAJOR）
- **THEN** SHALL 能正常解析所有 v1.0 欄位，忽略 v1.1 新增欄位

#### Scenario: 不相容版本

- **GIVEN** 接收端支援 protocol v1.x
- **WHEN** 收到 v2.0 的訊息
- **THEN** SHALL 回報 `VERSION_INCOMPATIBLE` 錯誤，附帶支援的版本範圍

## 4. Technical Design

### 4.1 Unified Status Code

以現有採用層狀態碼為參考，擴展為 8 狀態超集：

```
┌──────────────────────────────────────────────────────────────┐
│                   Unified Status Protocol                    │
├──────────────────┬──────────┬──────────────────┬────────────┤
│ Unified          │ UDS      │ Adapter Example A │ Example B  │
├──────────────────┼──────────┼──────────────────┼────────────┤
│ success          │ DONE     │ success          │ success    │
│ success_partial  │ DONE*    │ done_w_c         │ partial    │
│ failed           │ -        │ failed           │ failure    │
│ blocked          │ BLOCKED  │ blocked          │ -          │
│ needs_context    │ NEEDS_CTX│ needs_ctx        │ -          │
│ skipped          │ -        │ skipped          │ -          │
│ timeout          │ -        │ timeout          │ -          │
│ unknown          │ -        │ -                │ -          │
└──────────────────┴──────────┴──────────────────┴────────────┘

* UDS DONE_WITH_CONCERNS → success_partial
```

狀態轉換規則：

```
pending → running → success
                  → success_partial
                  → failed → (retry) → running
                  → blocked → (escalate) → running
                  → needs_context → (inject) → running
                  → timeout → (retry) → running
                  → skipped
```

### 4.2 Agent Envelope Schema

```yaml
# Protocol v1.0 — 必要欄位 (8 個)
envelope_version: "1.0"          # 協定版本（MAJOR.MINOR）
message_id: "msg-uuid-v4"       # 訊息唯一 ID
source:                          # 發送者
  agent_id: "builder-001"       # agent 實例 ID
  agent_type: "builder"         # agent 類型
  project: "adapter_example_a"  # 來源專案（uds / 採用層自訂識別碼）
target:                          # 接收者（可選，broadcast 時省略）
  agent_id: "reviewer-001"
  agent_type: "reviewer"
status: "success"                # 統一狀態碼
timestamp: "2026-03-30T10:00:00Z"  # ISO 8601
payload:                         # 承載資料（格式由 artifact_type 決定）
  artifact_type: "code"          # spec | code | test | review | plan | design
  artifact_id: "art-uuid"
  content: {}                    # 實際內容，schema 由 artifact_type 定義

# Protocol v1.0 — 可選欄位
correlation_id: "corr-uuid"     # 關聯 ID（追蹤同一任務鏈）
parent_message_id: "msg-uuid"   # 父訊息（回應時填寫）
metadata:                        # 擴展元資料
  model_tier: "standard"         # fast | standard | capable
  token_usage:
    input: 12500
    output: 3200
  duration_ms: 4500
  retry_count: 0
concerns: []                     # success_partial 時附帶的疑慮列表
```

### 4.3 Structured Handoff Schema

```yaml
handoff:
  from:
    agent_id: "architect-001"
    agent_type: "architect"
    message_id: "msg-001"        # 關聯的 envelope message_id
  to:
    agent_type: "builder"        # 目標 agent 類型（實例由 orchestrator 決定）

  # 產出物引用（by artifact_id，避免複製大量資料）
  artifacts:
    - artifact_id: "art-001"
      artifact_type: "spec"
      summary: "API 設計文件，包含 3 個 endpoint"
    - artifact_id: "art-002"
      artifact_type: "design"
      summary: "資料模型，包含 5 個 entity"

  # 決策記錄（讓下游 agent 理解「為什麼」）
  decision_log:
    - decision: "選擇 REST 而非 GraphQL"
      reason: "目標使用者為行動端，REST 快取較好"
      agent_id: "architect-001"
      timestamp: "2026-03-30T09:55:00Z"

  # 待處理事項（上游 agent 標記的注意事項）
  pending_items:
    - item: "OAuth 流程需確認第三方 provider"
      priority: "high"
      context: "Client 尚未確認使用 Google 或 GitHub OAuth"

  # 約束條件（必須遵守）
  constraints:
    - "API response time SHALL < 200ms (P95)"
    - "資料庫 migration SHALL 支援 rollback"
```

### 4.4 Protocol Version Roadmap

| 版本 | 內容 | 時程 |
|------|------|------|
| **v1.0** | Status mapping + Envelope + Handoff | Phase 1（本規格） |
| **v1.1** | Typed Artifact Schema（spec / code / test / review 的 JSON Schema） | Phase 2 |
| **v1.2** | Incremental Checkpoint 格式 | Phase 2 |
| **v2.0** | Agent Capability Registry + DAG 排程協定 | Phase 3 |

### 4.5 各專案實作責任

| 專案 | 實作範圍 | 說明 |
|------|----------|------|
| **UDS** | 標準定義 + AI YAML | `core/agent-communication-protocol.md` + `.standards/agent-communication.ai.yaml` |
| **採用層** | Adapter 實作 | 各採用層自行實作內部格式 ↔ Envelope 轉換層 |

## 5. Acceptance Criteria

### AC-1: Status Mapping Completeness

- **GIVEN** UDS 及各採用層各自的 agent 狀態碼
- **WHEN** 執行映射轉換
- **THEN** 所有現有狀態碼 SHALL 能映射到統一狀態碼，映射表無遺漏

### AC-2: Envelope Validation

- **GIVEN** 一個符合 v1.0 schema 的 envelope 訊息
- **WHEN** 驗證必要欄位
- **THEN** 8 個必要欄位（envelope_version, message_id, source, target, status, timestamp, payload.artifact_type, payload.artifact_id）全部存在

### AC-3: Envelope Forward Compatibility

- **GIVEN** 一個 v1.1 的 envelope 訊息（包含 v1.0 未定義的額外欄位）
- **WHEN** v1.0 接收端解析
- **THEN** SHALL 成功解析所有 v1.0 欄位，額外欄位被忽略但不報錯

### AC-4: Handoff Artifact Reference

- **GIVEN** Agent A 產出 3 個 artifacts
- **WHEN** 建立 handoff 給 Agent B，只引用其中 1 個
- **THEN** handoff.artifacts 長度 SHALL 為 1，且包含正確的 artifact_id

### AC-5: Handoff Decision Traceability

- **GIVEN** 一個包含 decision_log 的 handoff
- **WHEN** 下游 agent 讀取 decision_log
- **THEN** 每筆 decision SHALL 包含 decision, reason, agent_id, timestamp 四個欄位

### AC-6: Version Incompatibility Detection

- **GIVEN** 接收端支援 v1.x
- **WHEN** 收到 v2.0 的訊息
- **THEN** SHALL 回報 VERSION_INCOMPATIBLE 錯誤，錯誤訊息包含支援的版本範圍

### AC-7: Unknown Status Resilience

- **GIVEN** 收到一個狀態碼為 `custom_status`（不在統一狀態碼列表中）
- **WHEN** 解析該訊息
- **THEN** SHALL 將其映射為 `unknown`，記錄警告日誌，不中斷執行流程

### AC-8: Cross-Adoption-Layer Round Trip

- **GIVEN** 一個採用層 orchestrator 派遣一個任務給另一個採用層的 agent
- **WHEN** 目標 agent 完成並回報
- **THEN** 回報訊息 SHALL 符合 Envelope v1.0 schema，發送方 SHALL 能正確解析 status 和 payload

## 6. Test Plan

- [ ] Status mapping 單元測試：每個現有狀態碼 → 統一碼的正向映射
- [ ] Status mapping 邊界測試：未知狀態碼 → `unknown` 的降級行為
- [ ] Envelope schema 驗證測試：必要欄位缺失 → 拒絕
- [ ] Envelope 向前相容測試：v1.1 訊息在 v1.0 解析器中不報錯
- [ ] Handoff 建構測試：選擇性 artifact 引用
- [ ] Handoff 完整性測試：decision_log 必要欄位檢查
- [ ] 版本不相容測試：v2.0 訊息在 v1.x 解析器中報錯
- [ ] 跨採用層整合測試：Adapter A → Adapter B round trip（需採用層配合）

## 7. Migration Strategy

### 7.1 漸進式導入

```
Phase 1a: UDS 發布標準（core/ + .standards/）
Phase 1b: 各採用層各自實作 Envelope adapter（內部格式 ↔ Envelope）
Phase 1c: 跨採用層整合測試
```

### 7.2 向後相容

- 各專案的內部格式**不需要改變**
- 只需要在邊界（cross-project 呼叫）加上 adapter 層
- adapter 負責 internal format ↔ Envelope 的雙向轉換

### 7.3 Opt-in 機制

- 各採用層在自身配置中加入 `envelope_protocol: true` 啟用
- 預設 `false`，不影響現有行為

---

## Appendix A: JSON Schema（參考實作）

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/AsiaOstrich/universal-dev-standards/schemas/agent-envelope-v1.0.json",
  "title": "Agent Envelope v1.0",
  "type": "object",
  "required": ["envelope_version", "message_id", "source", "status", "timestamp", "payload"],
  "properties": {
    "envelope_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+$"
    },
    "message_id": {
      "type": "string",
      "format": "uuid"
    },
    "source": {
      "type": "object",
      "required": ["agent_id", "agent_type", "project"],
      "properties": {
        "agent_id": { "type": "string" },
        "agent_type": { "type": "string" },
        "project": { "type": "string", "description": "Source project identifier (uds or adoption-layer-defined string)" }
      }
    },
    "target": {
      "type": "object",
      "properties": {
        "agent_id": { "type": "string" },
        "agent_type": { "type": "string" }
      }
    },
    "status": {
      "type": "string",
      "enum": ["success", "success_partial", "failed", "blocked", "needs_context", "skipped", "timeout", "unknown"]
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "payload": {
      "type": "object",
      "required": ["artifact_type", "artifact_id"],
      "properties": {
        "artifact_type": {
          "type": "string",
          "enum": ["spec", "code", "test", "review", "plan", "design"]
        },
        "artifact_id": { "type": "string" },
        "content": { "type": "object" }
      }
    },
    "correlation_id": { "type": "string" },
    "parent_message_id": { "type": "string" },
    "metadata": { "type": "object" },
    "concerns": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "additionalProperties": true
}
```

## Appendix B: Handoff JSON Schema（參考實作）

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/AsiaOstrich/universal-dev-standards/schemas/agent-handoff-v1.0.json",
  "title": "Agent Handoff v1.0",
  "type": "object",
  "required": ["from", "to", "artifacts"],
  "properties": {
    "from": {
      "type": "object",
      "required": ["agent_id", "agent_type", "message_id"],
      "properties": {
        "agent_id": { "type": "string" },
        "agent_type": { "type": "string" },
        "message_id": { "type": "string" }
      }
    },
    "to": {
      "type": "object",
      "required": ["agent_type"],
      "properties": {
        "agent_type": { "type": "string" }
      }
    },
    "artifacts": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["artifact_id", "artifact_type", "summary"],
        "properties": {
          "artifact_id": { "type": "string" },
          "artifact_type": { "type": "string" },
          "summary": { "type": "string" }
        }
      }
    },
    "decision_log": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["decision", "reason", "agent_id", "timestamp"],
        "properties": {
          "decision": { "type": "string" },
          "reason": { "type": "string" },
          "agent_id": { "type": "string" },
          "timestamp": { "type": "string", "format": "date-time" }
        }
      }
    },
    "pending_items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["item", "priority"],
        "properties": {
          "item": { "type": "string" },
          "priority": { "type": "string", "enum": ["high", "medium", "low"] },
          "context": { "type": "string" }
        }
      }
    },
    "constraints": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```
