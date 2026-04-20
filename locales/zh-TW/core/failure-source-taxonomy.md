---
source: ../../../core/failure-source-taxonomy.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 失敗來源分類法標準

> **語言**: [English](../../../core/failure-source-taxonomy.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-16
**適用範圍**: 所有 Agent 執行結果的失敗分類
**Scope**: universal
**來源**: XSPEC-045（claw-code ROADMAP Phase 2 Failure Taxonomy，DEC-035）

---

## 目的

失敗來源分類法：在 `TaskStatus`（what）之上新增 `failureSource`（why）維度，提供 8 類結構化失敗來源。

現有的 `TaskStatus` 只回答「發生了什麼」，`failureSource` 補充「為什麼失敗」。結構化的失敗來源使下游恢復機制（Recovery Recipe Registry，XSPEC-046）能精準匹配策略，避免用同一套重試邏輯處理本質不同的失敗類型。

---

## 核心規範

- 所有失敗結果應攜帶 `failureSource`，使恢復策略可精準匹配
- `failureSource` 為 optional 欄位，不得破壞現有不含此欄位的程式碼
- 在同一失敗事件中，選擇最根本的來源作為 `failureSource`（例如 `branch_divergence` 比 `compilation` 更根本）
- `failureSource` 應由偵測到失敗的元件設定（QualityGate / Adapter / SafetyHook / BranchDriftChecker）
- 跨專案（DevAP / VibeOps）各自獨立定義 `FailureSource` type，語義保持一致

---

## 8 類失敗來源

### `prompt_delivery`

- **描述**：Prompt 未正確傳遞給 LLM（API 4xx、空回應、格式解析失敗）
- **偵測提示**：API 回傳 4xx / 空回應 / JSON 解析失敗
- **建議恢復**：重試或 `model_switch`
- **嚴重度範圍**：critical, high

### `model_degradation`

- **描述**：LLM 降智或回應品質明顯下降（重複輸出、無關回應、品質驟降）
- **偵測提示**：輸出品質評分低於基準線 / 連續重複輸出 / 評估分數 < 30
- **建議恢復**：`model_switch`
- **嚴重度範圍**：critical, high, medium

### `branch_divergence`

- **描述**：工作分支落後基底分支，可能導致合併衝突或假回歸
- **偵測提示**：`git rev-list --count HEAD..origin/{baseBranch} > 0`
- **建議恢復**：`rebase_and_retry`
- **嚴重度範圍**：critical, high, medium
- **備註**：severity 由落後 commit 數決定：1-5 為 medium，6+ 為 high/critical

### `compilation`

- **描述**：編譯或型別檢查錯誤（TypeScript tsc、Go build、Rust cargo 等）
- **偵測提示**：build / tsc / compile 指令 exit code != 0
- **建議恢復**：`fix_loop`
- **嚴重度範圍**：high, medium, low

### `test_failure`

- **描述**：測試失敗（unit / integration / system / e2e 任一層級）
- **偵測提示**：test 指令 exit code != 0
- **建議恢復**：`fix_loop`
- **嚴重度範圍**：high, medium, low

### `tool_failure`

- **描述**：工具層失敗（MCP server 無回應、Plugin 載入失敗、CLI 工具不存在）
- **偵測提示**：MCP / Plugin / shell 工具執行失敗或 timeout
- **建議恢復**：circuit_breaker 保護後重試，或降級模式繼續
- **嚴重度範圍**：critical, high, medium

### `policy_violation`

- **描述**：安全或治理策略攔截（Guardian deny、SafetyHook 阻擋、Fail-Closed 觸發）
- **偵測提示**：`SecurityDecision` 為 deny / Guardian verdict 為 `blocking: true`
- **建議恢復**：`human_checkpoint`（不自動重試，需人工審查）
- **嚴重度範圍**：critical, high

### `resource_exhaustion`

- **描述**：資源耗盡（token 預算超限、時間 timeout、美元預算耗盡）
- **偵測提示**：`error_max_turns` / `error_max_budget_usd` / token zone BLOCKING
- **建議恢復**：`degraded_mode` 或 `human_checkpoint`
- **嚴重度範圍**：critical, high

---

## 類型定義

### FailureSource

8 類失敗來源的 union type：

```
prompt_delivery | model_degradation | branch_divergence | compilation |
test_failure | tool_failure | policy_violation | resource_exhaustion
```

### FailureDetail

| 欄位 | 類型 | 說明 |
|------|------|------|
| `source` | `FailureSource` | 失敗來源 |
| `raw_error` | `string` | 原始錯誤訊息 |
| `detected_by` | `string` | 偵測元件名稱（quality-gate / claude-adapter / safety-hook / branch-drift） |
| `timestamp` | `string` | ISO 8601 格式 |

---

## 優先級規則

當多個失敗來源並存時：

| 規則 | 說明 |
|------|------|
| `branch_divergence` > `compilation` | 分支漂移通常是 compilation 失敗的根因 |
| `policy_violation` > 其他 | 安全優先，不嘗試繞過 |
| `resource_exhaustion` > 其他 | 資源耗盡時無意義重試 |
| 其他情況 | 取最先偵測到的來源 |

---

## 整合點

### DevAP

- `packages/core/src/types.ts` — `TaskResult.failureSource` / `FailureSource` type
- `packages/core/src/quality-gate.ts` — `QualityGateResult.failureSource` 推斷
- `packages/adapter-claude/src/claude-adapter.ts` — `resource_exhaustion` 映射

### VibeOps

- `src/types/index.ts` — `IterationRecord.failureSource`（獨立定義，AGPL 隔離）
- `src/runner/pipeline-runner.ts` — `agent:error` 事件 payload
