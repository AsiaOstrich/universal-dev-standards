---
source: ../../../core/cost-budget-test.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 19cf2a8cd706
status: current
---

# 成本預算測試標準

> **Language**: [English](../../../core/cost-budget-test.md) | 繁體中文

---

## 概述

呼叫 LLM API 的 AI 代理系統，若 pipeline 陷入失控迴圈、遭遇非預期的 token 爆炸，或預算閾值配置錯誤，成本可能迅速累積。成本預算測試用於驗證 zone 分類器、閾值常數與 pipeline 預算保護機制在每個邊界上的正確性。

## Zone 分類

大多數 AI 代理 token 預算系統將使用率比例劃分為多個 zone。zone 之間的邊界是差一錯誤（off-by-one error）風險最高的地方。

```typescript
// 使用 TOKEN_BUDGET 常數（而非魔術數字）進行 Vitest 邊界測試
import { classifyTokenZone, TOKEN_BUDGET } from "../types/index.js"
import { describe, it, expect } from "vitest"

describe("TokenBudgetZone classification boundaries", () => {
  it.each([
    [0.0,                                  "safe",     "zero usage"],
    [TOKEN_BUDGET.WARNING_THRESHOLD - 0.01, "safe",     "just below WARNING"],
    [TOKEN_BUDGET.WARNING_THRESHOLD,        "warning",  "exactly at WARNING"],
    [TOKEN_BUDGET.DANGER_THRESHOLD - 0.01,  "warning",  "just below DANGER"],
    [TOKEN_BUDGET.DANGER_THRESHOLD,         "danger",   "exactly at DANGER"],
    [TOKEN_BUDGET.BLOCKING_THRESHOLD - 0.01,"danger",   "just below BLOCKING"],
    [TOKEN_BUDGET.BLOCKING_THRESHOLD,       "blocking", "exactly at BLOCKING"],
    [1.0,                                  "blocking", "fully exhausted"],
  ])("ratio=%f → %s (%s)", (ratio, expected) => {
    expect(classifyTokenZone(ratio)).toBe(expected)
  })

  it("returns 'blocking' for ratio > 1.0 (over-budget)", () => {
    expect(classifyTokenZone(1.5)).toBe("blocking")
  })
})
```

## Pipeline 預算配置測試

```typescript
import type { PipelineBudgetConfig } from "../types/index.js"

describe("PipelineBudgetConfig semantics", () => {
  it("warningThreshold defaults should be 0-1 range", () => {
    const config: PipelineBudgetConfig = {
      maxCostPerRun: 1.0,
      maxCostPerDay: 10.0,
      warningThreshold: 0.8,
      autoDowngrade: true,
    }
    expect(config.warningThreshold).toBeGreaterThan(0)
    expect(config.warningThreshold).toBeLessThan(1)
  })
})
```

## 測試項目

| 測試類別 | 原因 |
|---------|------|
| 精確邊界值（WARNING/DANGER/BLOCKING） | 差一錯誤容易潛藏於此 |
| 每個邊界以下的值 | 確認低一級的 zone 正確 |
| 使用率為零 | 乾淨初始狀態 |
| 比例 > 1.0 | 超出預算時仍應觸發阻斷 |
| 所有 TOKEN_BUDGET 常數均被引用 | 防止突變測試存活 |

## 相關標準

- [突變測試標準](../../../core/mutation-testing.md) — 未有測試覆蓋的常數容易在突變測試中存活
- [測試標準](../../../core/testing.md) — 整體測試金字塔
- [LLM 輸出驗證](../../../core/llm-output-validation.md) — 輸出層預算約束

---

**Scope**: universal
