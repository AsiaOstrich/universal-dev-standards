---
source: ../../../core/cost-budget-test.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 19cf2a8cd706
status: current
---

# 成本预算测试标准

> **Language**: [English](../../../core/cost-budget-test.md) | [繁體中文](../../zh-TW/core/cost-budget-test.md) | 简体中文

---

## 概述

调用 LLM API 的 AI 代理系统，若 pipeline 陷入失控循环、遭遇非预期的 token 爆炸，或预算阈值配置错误，成本可能迅速累积。成本预算测试用于验证 zone 分类器、阈值常量与 pipeline 预算保护机制在每个边界上的正确性。

## Zone 分类

大多数 AI 代理 token 预算系统将使用率比例划分为多个 zone。zone 之间的边界是差一错误（off-by-one error）风险最高的地方。

```typescript
// 使用 TOKEN_BUDGET 常量（而非魔术数字）进行 Vitest 边界测试
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

## Pipeline 预算配置测试

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

## 测试项目

| 测试类别 | 原因 |
|---------|------|
| 精确边界值（WARNING/DANGER/BLOCKING） | 差一错误容易潜藏于此 |
| 每个边界以下的值 | 确认低一级的 zone 正确 |
| 使用率为零 | 干净初始状态 |
| 比例 > 1.0 | 超出预算时仍应触发阻断 |
| 所有 TOKEN_BUDGET 常量均被引用 | 防止突变测试存活 |

## 相关标准

- [突变测试标准](../../../core/mutation-testing.md) — 未有测试覆盖的常量容易在突变测试中存活
- [测试标准](../../../core/testing-standards.md) — 整体测试金字塔
- [LLM 输出验证](../../../core/llm-output-validation.md) — 输出层预算约束

---

**Scope**: universal
