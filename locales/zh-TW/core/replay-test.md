---
source: ../../../core/replay-test.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 888dadd74668
status: current
---

# Replay 測試標準

> **語言**: [English](../../../core/replay-test.md) | 繁體中文

---

## 概述

AI 代理系統透過複雜的多步驟管線與使用者互動。當客戶回報非預期行為時，重現確切的失敗情境往往相當困難——模型輸出可能是非確定性的、環境可能已發生變化，或確切的輸入內容可能不明確。黃金 fixture replay 透過在發現問題時序列化確切的輸入與預期輸出，解決了這個問題，從而實現確定性的回歸測試。

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

## Fixture 命名規則

`<component>-<outcome>-<description>.json`

| 好的命名 | 不好的命名 |
|---------|----------|
| `guardian-deny-prod-drop-table.json` | `test1.json` |
| `guardian-allow-dev-npm-test.json` | `fixture.json` |
| `guardian-hitl-prod-irreversible.json` | `scenario_3.json` |

## Replay 測試實作（Vitest）

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

## 錯誤回歸工作流程

1. 客戶回報非預期的 Guardian 判定
2. 擷取確切的 `Reviewable` 輸入（來自稽核日誌）
3. 建立 fixture 檔案：`guardian-<outcome>-<description>.json`
4. 在本地重現失敗（測試應當失敗）
5. 修復錯誤
6. 確認測試通過
7. 此 fixture 現在永久防止回歸

## 相關標準

- [對抗性測試標準](../../../core/adversarial-test.md) — 紅隊語料庫
- [驗證證據標準](../../../core/verification-evidence.md) — AC 可追溯性
- [測試標準](../../../core/testing-standards.md) — 整體測試金字塔


**Scope**: universal
