---
source: ../../../core/token-budget.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# Token 預算區間標準

> **語言**: [English](../../../core/token-budget.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-15
**適用範圍**: 所有有 token 預算限制的 Agent 執行環境
**Scope**: universal
**來源**: XSPEC-036（claude-code-book Ch.7 four-zone threshold model）

---

## 目的

Token 閾值四區模型：以使用率百分比劃分四個運作區間，漸進觸發不同強度的保護策略。

比「打到上限才停」更優雅，為使用者提供早期預警和自動降級機會。

---

## 核心規範

- 所有有 token 預算限制的執行環境必須使用四區模型監控使用率
- WARNING 區必須記錄日誌並發出可觀測事件，不得靜默
- DANGER 區必須觸發輕量保護策略（如截斷工具結果、縮減輸出預算）
- BLOCKING 區必須拒絕新請求，回傳 `TOKEN_BUDGET_EXCEEDED` 而非讓請求超時崩潰
- 壓縮操作本身需保留足夠的輸出空間（否則壓縮本身也可能失敗）

---

## 四區模型

| 區間 | 使用率範圍 | 行動 | 日誌等級 |
|------|----------|------|---------|
| **SAFE**（安全） | 0% – 84% | 正常執行 | — |
| **WARNING**（警告） | 85% – 89% | 發出 `TOKEN_BUDGET_WARNING` 事件，通知 Coordinator／使用者 | `info` |
| **DANGER**（危險） | 90% – 94% | 觸發輕量壓縮策略 | `warn` |
| **BLOCKING**（阻塞） | 95% – 100% | 拒絕新請求，回傳 `TOKEN_BUDGET_EXCEEDED` | `error` |

### WARNING 區可選行動

- 降低 `model_tier`（capable → standard）
- 提示使用者考慮分割任務

### DANGER 區必要行動

- 截斷超大工具結果（Tool Result Snip）
- 縮減後續 Agent 的 `maxToolRounds`（建議降低 20%）

### DANGER 區可選行動

- 將重要輸出持久化到磁碟，上下文只保留摘要

---

## 閾值常數

| 常數 | 值 |
|------|-----|
| `WARNING_THRESHOLD` | `0.85` |
| `DANGER_THRESHOLD` | `0.90` |
| `BLOCKING_THRESHOLD` | `0.95` |

---

## 類型定義

### TokenBudgetZone

```
safe | warning | danger | blocking
```

### TokenBudgetStatus

| 欄位 | 類型 |
|------|------|
| `current_tokens` | `number` |
| `max_tokens` | `number` |
| `usage_ratio` | `number` |
| `zone` | `TokenBudgetZone` |

### TokenBudgetExceededError

| 欄位 | 類型 |
|------|------|
| `code` | `"TOKEN_BUDGET_EXCEEDED"` |
| `current_tokens` | `number` |
| `max_tokens` | `number` |
| `usage_ratio` | `number` |
| `zone` | `"blocking"` |

---

## 壓縮後預算常數參考

| 常數 | 值 |
|------|-----|
| `MAX_FILES_TO_RESTORE` | `5` |
| `TOTAL_TOKEN_BUDGET` | `50000` |
| `MAX_TOKENS_PER_FILE` | `5000` |
| `MAX_TOKENS_PER_SKILL` | `5000` |

---

## 遙測事件

**`token_budget_zone_change`**

| 欄位 | 類型 |
|------|------|
| `from_zone` | `TokenBudgetZone` |
| `to_zone` | `TokenBudgetZone` |
| `usage_ratio` | `number` |
| `agent_name` | `string` |
| `timestamp` | `string` |

---

## 適用場景

- Task 執行（Token 預算監控；採用層）
- 多 Agent Pipeline（跨 Agent 累積上下文監控；採用層）
- PipelineMemory Snip 觸發條件（採用層）
- 任何有 `maxTotalTokens` 限制的 Agent 執行環境

---

## 錯誤碼

| 代碼 | 說明 |
|------|------|
| `TB-001` | `TOKEN_BUDGET_EXCEEDED` — 已進入 BLOCKING 區，拒絕新請求 |
| `TB-002` | `TOKEN_BUDGET_WARNING` — 已進入 WARNING 區，建議採取行動 |
| `TB-003` | `SNIP_FAILED` — 輕量壓縮失敗，仍在 DANGER 區 |
