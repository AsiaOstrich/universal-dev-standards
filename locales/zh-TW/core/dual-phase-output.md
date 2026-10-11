---
source: ../../../core/dual-phase-output.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 6a2398bdff72
status: current
---

# 雙階段 LLM 輸出標準

> **語言**: [English](../../../core/dual-phase-output.md) | 繁體中文

> **來源**: XSPEC-035 | **借鑑自**: claude-code-book Ch.7 AutoCompact

## 概述

雙階段 LLM 輸出模式要求 LLM 審查 Agent 在單一回應中產出兩個 XML 區塊：`<analysis>` 思考草稿（處理後丟棄）與 `<summary>` 結構化結論（保留）。如此能讓模型充分推理，同時避免思考過程累積在對話上下文中。

## 問題

審查 Agent（Judge、Evaluator、Guardian）通常產生 2000–5000 token 的回應，其中 50–70% 是會累積在對話歷史中的推理內容。在重複審查情境（Fix Loop 重試 3 次）下，每個任務會浪費 3000–10500 token。

## 格式

```xml
<analysis>
[Reasoning scratchpad — DISCARDED after processing]
- Step-by-step evaluation
- Edge case considerations
- Alternative comparisons
</analysis>

<summary>
decision: approved | rejected | needs_revision
confidence: high | medium | low
findings:
  - [type] description
next_action: [recommended follow-up action]
</summary>
```

## 後處理規則

1. 擷取 `<summary>` 內容 → 持久化至上下文
2. 丟棄 `<analysis>` 內容 → 絕不寫入對話歷史
3. 若缺少 `<summary>` 標籤 → 降級處理：將完整回應視為 summary，並記錄 `[WARN] dual-phase format missing`

## 擴充欄位

各應用可在 `<summary>` 內新增欄位，但不得刪除核心欄位：
- **安全（Guardian）**：`severity: critical | high | medium | low`、`cwe_ids: [CWE-NNN]`
- **品質（Evaluator）**：`test_coverage: number`、`tech_debt_score: number`

## Token 影響

| 情境 | 節省量 |
|------|--------|
| 單次審查 | 1000–3500 token |
| Fix Loop（重試 3 次） | 3000–10500 token |
| 多 Agent 管線（evaluator + guardian；採用層） | 每次執行 2000–7000 token |

## 參考資料

- AI 最佳化版：[ai/standards/dual-phase-output.ai.yaml](../../../ai/standards/dual-phase-output.ai.yaml)
- XSPEC-035：跨專案規格
- 借鑑自：[claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.7 `formatCompactSummary`


**Scope**: universal
