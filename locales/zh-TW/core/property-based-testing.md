---
source: ../../../core/property-based-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 13f5eba04aef
status: current
---

# Property-Based Testing 標準

> **Language**: [English](../../../core/property-based-testing.md) | 繁體中文

## 概述

基於範例的測試只能驗證開發者想得到的案例。Property-based testing 反轉了這個思路：你定義一個不變量（「分數永遠介於 0 到 100 之間」），框架會產生數百個輸入來嘗試推翻它。當找到失敗的輸入時，框架會將其縮減（shrink）為最小反例。

## 使用時機

| 使用 Property 測試 | 使用範例測試 |
|-------------------|------------------|
| 純數學函式 | 複雜業務邏輯 |
| 解析器 / 序列化器 | 整合路徑 |
| 分數截斷 / 四捨五入 | UI 行為 |
| 雜湊 / 編碼 | 資料庫操作 |
| 安全驗證器 | 外部 API 呼叫 |

## 工具：fast-check（TypeScript）

```bash
npm install --save-dev fast-check
```

```typescript
import fc from "fast-check"
import { describe, it, expect } from "vitest"
import { classifyTokenZone, TOKEN_BUDGET } from "../types/index.js"

describe("classifyTokenZone property: result is always a valid zone", () => {
  it("for any ratio in [0, 2], returns a valid TokenBudgetZone", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 2, noNaN: true }),
        (ratio) => {
          const zone = classifyTokenZone(ratio)
          return ["safe", "warning", "danger", "blocking"].includes(zone)
        }
      ),
      { numRuns: 1000 }
    )
  })
})
```

## Guardian scoreReviewable 屬性

需要測試的關鍵不變量：

| 屬性 | 說明 |
|----------|-------------|
| **範圍截斷** | `score` 永遠在 `[0, 100]` 範圍內 |
| **確定性** | 相同輸入永遠產生相同分數 |
| **單調性** | 對相同操作，prod > staging > dev |
| **非負性** | `breakdown` 的值全部 >= 0 |

## 反例縮減（Counterexample Shrinking）

當 fast-check 找到失敗案例時，會自動縮減：

```
Original failure: { target_env: "prod", command: "rm -rf /tmp/xyz123...", ... }
Shrunk to:        { target_env: "prod", command: "rm", ... }
```

從錯誤訊息中儲存 seed 以便重現：
```typescript
fc.assert(property, { seed: 1234567890 })
```

## 相關標準

- [Mutation Testing 標準](mutation-testing.md) — PBT 的互補
- [測試標準](testing-standards.md) — 整體測試金字塔
- [Adversarial Test 標準](adversarial-test.md) — 以安全為導向的 fuzzing


**Scope**: universal
