---
source: ../../../core/token-budget.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 72030e8c343a
status: current
---

# Token 預算區間標準

> **語言**: [English](../../../core/token-budget.md) | 繁體中文

> **來源**: XSPEC-036 | **借鑑自**: claude-code-book Ch.7

## 概述

Token 預算區間模型將 token 使用量劃分為四個漸進的區間，每個區間觸發強度逐步升高的保護策略。這可避免「一切正常直到突然崩潰」的失效模式，讓系統在撞到硬上限之前有時間優雅降級。

## 區間

| 區間 | 範圍 | 行動 | 日誌等級 |
|------|------|------|---------|
| **SAFE**（安全） | 0–84% | 正常執行 | — |
| **WARNING**（警告） | 85–89% | 發出事件，通知 Coordinator | info |
| **DANGER**（危險） | 90–94% | 觸發輕量壓縮（Snip） | warn |
| **BLOCKING**（阻塞） | 95–100% | 拒絕新請求，回傳錯誤 | error |

## 常數

```typescript
const TOKEN_BUDGET_ZONE = {
  WARNING_THRESHOLD: 0.85,
  DANGER_THRESHOLD: 0.90,
  BLOCKING_THRESHOLD: 0.95,
} as const;

type TokenBudgetZone = "safe" | "warning" | "danger" | "blocking";
```

## DANGER 區行動

進入 DANGER 區（90–94%）時：
1. **Tool Result Snip**：截斷超大工具輸出，保留摘要
2. **縮減 maxToolRounds**：後續 Agent 降低 20%
3. **持久化到磁碟**：將重要輸出移出上下文

## 壓縮後預算

壓縮操作本身需要輸出空間才能成功。保留常數：

| 常數 | 值 | 用途 |
|------|-----|------|
| `MAX_FILES_TO_RESTORE` | 5 | 壓縮後最多還原的檔案數 |
| `TOTAL_TOKEN_BUDGET` | 50,000 | 壓縮後的總 token 預算 |
| `MAX_TOKENS_PER_FILE` | 5,000 | 每個檔案的 token 上限 |

## 適用場景

- Task 執行的 token 監控（採用層）
- 多 Agent Pipeline 的累積上下文管理（採用層）
- PipelineMemory Snip 觸發條件（採用層）
- 任何有 `maxTotalTokens` 限制的環境

## 參考資料

- AI 最佳化版本：[ai/standards/token-budget.ai.yaml](../../../ai/standards/token-budget.ai.yaml)
- XSPEC-036：跨專案規格
- 借鑑自：[claude-code-book](https://github.com/lintsinghua/claude-code-book) Ch.7 四區上下文管理


**Scope**: universal
