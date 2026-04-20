---
source: ../../../core/dual-phase-output.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# 雙階段 LLM 輸出標準

> **語言**: [English](../../../core/dual-phase-output.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-15
**適用範圍**: 所有需要 LLM 審查的場景（Judge、Evaluator、Guardian、AutoCompact）
**Scope**: universal
**來源**: XSPEC-035（claude-code-book Ch.7 formatCompactSummary dual-phase output）

---

## 目的

雙階段 LLM 輸出模式：`<analysis>` 思考丟棄，`<summary>` 結構化保留。

讓 LLM 充分推理的同時，避免思考過程累積在上下文中消耗 token 預算。

---

## 核心規範

- 所有 LLM 審查 Agent 必須要求雙階段輸出格式（`<analysis>` + `<summary>`）
- `<analysis>` 在後處理時必須丟棄，不得寫入持久化上下文或對話歷史
- `<summary>` 必須包含結構化結論欄位（`decision`、`confidence`、`findings`、`next_action`）
- 若回應缺少雙階段格式，後處理器必須降級相容（完整回應視為 summary）並記錄警告
- `summary` 欄位命名需遵循本標準，各應用場景可擴充但不可刪減核心欄位

---

## 輸出格式

### `<analysis>` 標籤

- **用途**：LLM 思考草稿 — 後處理時丟棄
- **內容指引**：
  - 逐條審查邏輯
  - 邊界情境考量
  - 替代方案比較

### `<summary>` 標籤

- **用途**：結構化結論 — 後處理時保留

**核心欄位**（必填）：

| 欄位 | 類型 | 值 |
|------|------|-----|
| `decision` | enum | `approved \| rejected \| needs_revision` |
| `confidence` | enum | `high \| medium \| low` |
| `findings` | array | `[type] description` 格式 |
| `next_action` | string | 建議的後續行動 |

**擴充欄位**（依場景新增，不可刪減核心欄位）：

| 場景 | 額外欄位範例 |
|------|------------|
| 安全審查 | `severity: critical \| high \| medium \| low`, `cwe_ids: [CWE-NNN]` |
| 品質審查 | `test_coverage: number`, `tech_debt_score: number` |

---

## Prompt 模板

```
You MUST respond using EXACTLY this two-phase XML structure:

<analysis>
[Your reasoning process — will be DISCARDED after processing]
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

IMPORTANT: The <analysis> block is your scratchpad. Only <summary> persists.
```

---

## 後處理規則

| 步驟 | 動作 |
|------|------|
| 提取 summary | 用正則 `<summary>([\s\S]*?)</summary>` 擷取 |
| 丟棄 analysis | 用正則 `<analysis>([\s\S]*?)</analysis>` 移除 |
| 降級相容 | 若缺少 `<summary>` 標籤，完整回應視為 summary 內容，記錄 `warn` 日誌 |

---

## Token 節省估算

| 指標 | 數值 |
|------|------|
| `<analysis>` 佔一般審查回應比例 | 50–70% |
| 每次審查節省 token | 1,000–3,500 |
| Fix Loop 3 輪累計節省 | 3,000–10,500 |
| 備註 | 節省效果在重複審查場景（Fix Loop、Feedback Loop）中累積 |

---

## 適用 Agent

- DevAP Judge Agent
- VibeOps Evaluator Agent
- VibeOps Guardian Agent
- 任何 LLM 驅動的 AutoCompact／摘要組件

---

## 錯誤碼

| 代碼 | 說明 |
|------|------|
| `DPO-001` | `summary` 標籤缺失 — 降級相容已啟用 |
| `DPO-002` | `analysis` 標籤缺失 — 完整回應照常處理 |
| `DPO-003` | `summary` 必填欄位缺失 — 解析錯誤 |
