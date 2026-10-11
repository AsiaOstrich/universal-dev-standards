---
source: ../../../core/failure-source-taxonomy.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 56c9d4057405
status: current
---

# 失敗來源分類法標準

> **語言**: [English](../../../core/failure-source-taxonomy.md) | 繁體中文

> **來源**: XSPEC-045 | **借鑑自**: ultraworkers/claw-code ROADMAP Phase 2 Failure Taxonomy

## 概述

失敗來源分類法在既有的 `TaskStatus`（what）之上新增 `failureSource`（why）維度。結構化的失敗來源讓下游恢復機制（Recovery Recipe Registry，XSPEC-046）能精準匹配策略，避免以同一套重試邏輯處理本質不同的失敗類型。

## 8 類失敗來源

| 來源 | 說明 | 建議恢復方式 |
|------|------|--------------|
| `prompt_delivery` | Prompt 未傳遞給 LLM（API 4xx、空回應、解析錯誤） | retry 或 model_switch |
| `model_degradation` | LLM 品質下降（重複輸出、無關回應） | model_switch |
| `branch_divergence` | 工作分支落後基底分支 | rebase_and_retry |
| `compilation` | 編譯或型別檢查錯誤（tsc、cargo、go build） | fix_loop |
| `test_failure` | 測試失敗（unit / integration / system / e2e） | fix_loop |
| `tool_failure` | 工具層失敗（MCP server 無回應、Plugin 載入失敗） | 先 circuit_breaker 再 retry |
| `policy_violation` | 安全／治理策略攔截（Guardian deny、SafetyHook） | human_checkpoint |
| `resource_exhaustion` | 資源耗盡（token 預算超限、逾時、美元預算） | degraded_mode 或 human_checkpoint |

## 優先級規則

當多個失敗來源並存時，依下列規則處理：

1. `branch_divergence` > `compilation` — 分支漂移通常是編譯失敗的根因
2. `policy_violation` > 其他 — 安全優先，不嘗試繞過
3. `resource_exhaustion` > 其他 — 資源耗盡時重試沒有意義
4. 其他情況：採用最先偵測到的來源

## 型別

```typescript
type FailureSource =
  | "prompt_delivery"
  | "model_degradation"
  | "branch_divergence"
  | "compilation"
  | "test_failure"
  | "tool_failure"
  | "policy_violation"
  | "resource_exhaustion";

interface FailureDetail {
  source: FailureSource;
  raw_error: string;
  detected_by: string;  // quality-gate / claude-adapter / safety-hook / branch-drift
  timestamp: string;    // ISO 8601
}
```

## 指引

- 所有失敗結果都應攜帶 `failureSource`，以便精準匹配恢復策略
- `failureSource` 為**選填**欄位 — 不得破壞既有不含此欄位的程式碼
- 在單一失敗事件中，選擇最根本的來源作為 `failureSource`
- `failureSource` 應由偵測到失敗的元件設定
- 各採用層各自獨立定義自己的 `FailureSource` 型別（授權隔離）

## 適用情境

- Quality Gate（採用層）失敗結果的資訊補充
- Pipeline Runner（採用層）`agent:error` 事件 payload
- Recovery Recipe Registry（XSPEC-046）匹配鍵
- 遙測失敗分析維度

## 參考資料

- AI 最佳化版：[ai/standards/failure-source-taxonomy.ai.yaml](../../../ai/standards/failure-source-taxonomy.ai.yaml)
- XSPEC-045：跨專案規格
- 相依於：Recovery Recipe Registry（XSPEC-046）
- 借鑑自：[ultraworkers/claw-code](https://github.com/ultraworkers/claw-code) ROADMAP Phase 2 Failure Taxonomy


**Scope**: universal
