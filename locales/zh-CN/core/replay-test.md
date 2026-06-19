---
source: ../../../core/replay-test.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 888dadd74668
status: current
---

# Replay 测试标准

> **语言**: [English](../../../core/replay-test.md) | [繁體中文](../../zh-TW/core/replay-test.md) | 简体中文

---

## 概述

AI 代理系统通过复杂的多步骤管道与用户交互。当客户反馈非预期行为时，重现确切的失败场景往往相当困难——模型输出可能是非确定性的、环境可能已发生变化，或确切的输入内容可能不明确。黄金 fixture replay 通过在发现问题时序列化确切的输入与预期输出，解决了这个问题，从而实现确定性的回归测试。

## Fixture 格式

```json
{
  "meta": {
    "recorded": "2026-05-05",
    "source": "customer-report | ci-regression | red-team | incident",
    "description": "Human-readable description of what this tests"
  },
  "input": { /* exact component input */ },
  "expected": { /* expected output fields to assert */ }
}
```

## Fixture 命名规则

`<component>-<outcome>-<description>.json`

| 好的命名 | 不好的命名 |
|---------|----------|
| `guardian-deny-prod-drop-table.json` | `test1.json` |
| `guardian-allow-dev-npm-test.json` | `fixture.json` |
| `guardian-hitl-prod-irreversible.json` | `scenario_3.json` |

## Replay 测试实现（Vitest）

```typescript
// SPDX-License-Identifier: AGPL-3.0-only
import { readdirSync, readFileSync } from "fs"
import { join } from "path"
import { describe, it, expect } from "vitest"
import { scoreReviewable } from "../scoring/risk-engine.js"

const FIXTURES_DIR = join(__dirname, "..", "__fixtures__")

interface ReplayFixture {
  meta: { recorded: string; source: string; description: string }
  input: Parameters<typeof scoreReviewable>[0]
  expected: { decision: string }
}

function deriveDecision(score: number): string {
  if (score >= 76) return "DENY"
  if (score >= 51) return "REQUIRE_HITL"
  return "ALLOW"
}

describe("Guardian replay fixtures", () => {
  const fixtures = readdirSync(FIXTURES_DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => ({
      name: f,
      fixture: JSON.parse(readFileSync(join(FIXTURES_DIR, f), "utf-8")) as ReplayFixture,
    }))

  for (const { name, fixture } of fixtures) {
    it(`[${fixture.meta.source}] ${fixture.meta.description}`, () => {
      const result = scoreReviewable(fixture.input)
      const decision = deriveDecision(result.score)
      expect(decision).toBe(fixture.expected.decision)
    })
  }
})
```

## 缺陷回归工作流程

1. 客户反馈非预期的 Guardian 判定
2. 捕获确切的 `Reviewable` 输入（来自审计日志）
3. 创建 fixture 文件：`guardian-<outcome>-<description>.json`
4. 在本地重现失败（测试应当失败）
5. 修复缺陷
6. 确认测试通过
7. 该 fixture 现在永久防止回归

## 相关标准

- [对抗性测试标准](../../../core/adversarial-test.md) — 红队语料库
- [验证证据标准](../../../core/verification-evidence.md) — AC 可追溯性
- [测试标准](../../../core/testing-standards.md) — 整体测试金字塔


**Scope**: universal
