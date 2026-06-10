---
source: ../../../core/property-based-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 13f5eba04aef
status: current
---

# Property-Based Testing 标准

> **语言**: [English](../../../core/property-based-testing.md) | [繁體中文](../../zh-TW/core/property-based-testing.md) | 简体中文

## 概述

基于示例的测试只能验证开发者想得到的用例。Property-based testing 反转了这一思路：你定义一个不变量（"分数永远介于 0 到 100 之间"），框架会生成数百个输入来尝试推翻它。当找到失败的输入时，框架会将其收缩（shrink）为最小反例。

## 使用时机

| 使用 Property 测试 | 使用示例测试 |
|-------------------|------------------|
| 纯数学函数 | 复杂业务逻辑 |
| 解析器 / 序列化器 | 集成路径 |
| 分数截断 / 四舍五入 | UI 行为 |
| 哈希 / 编码 | 数据库操作 |
| 安全验证器 | 外部 API 调用 |

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

## Guardian scoreReviewable 属性

需要测试的关键不变量：

| 属性 | 说明 |
|----------|-------------|
| **范围截断** | `score` 永远在 `[0, 100]` 范围内 |
| **确定性** | 相同输入永远产生相同分数 |
| **单调性** | 对相同操作，prod > staging > dev |
| **非负性** | `breakdown` 的值全部 >= 0 |

## 反例收缩（Counterexample Shrinking）

当 fast-check 找到失败用例时，会自动收缩：

```
Original failure: { target_env: "prod", command: "rm -rf /tmp/xyz123...", ... }
Shrunk to:        { target_env: "prod", command: "rm", ... }
```

从错误消息中保存 seed 以便复现：
```typescript
fc.assert(property, { seed: 1234567890 })
```

## 相关标准

- [Mutation Testing 标准](mutation-testing.md) — PBT 的互补
- [测试标准](testing-standards.md) — 整体测试金字塔
- [Adversarial Test 标准](adversarial-test.md) — 以安全为导向的 fuzzing


**Scope**: universal
