---
source: ../../../core/mutation-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 6a5286d76274
status: current
---

# 突變測試標準

> **Language**: [English](../../../core/mutation-testing.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-05-04
**適用範圍**: 所有具備單元/整合測試的軟體專案
**Scope**: universal
**產業標準**: ISTQB Foundation Syllabus（測試有效性指標）
**參考資料**: "Introduction to Software Testing"（Ammann & Offutt）, Stryker Mutator 文件

---

## 目的

突變測試（mutation testing）藉由注入人工 bug 並檢查測試是否能偵測它們，來評估測試套件的有效性。它回答了行覆蓋率無法回答的問題：**「我的測試真的有驗證正確行為嗎？」**

---

## 核心概念：Mutation Score

```
Mutation Score = Killed Mutants / (Killed + Survived) × 100%
```

- **Killed**：測試套件偵測到人工 bug（測試失敗）✅
- **Survived**：測試套件漏掉了 bug（測試仍通過）❌

一個只有 `expect(x).toBeDefined()` 的測試可以達到 100% 行覆蓋率，卻會讓許多突變存活（因為 `x` 是 `null`、`0` 或 `"wrong"` 都滿足 `.toBeDefined()`）。

---

## 工具

| 語言 | 工具 | 指令 |
|------|------|------|
| TypeScript/JS | Stryker Mutator | `npx stryker run` |
| Python | mutmut | `mutmut run` |
| Java | PIT (Pitest) | `mvn pitest:mutationCoverage` |

---

## 閾值

| 模組類型 | 最低分數 | 強制程度 |
|---------|---------|---------|
| Auth/License/Payment/Security | 80% | 封鎖 release |
| 標準業務邏輯 | 70% | 警告；下次 release 前解決 |
| AI 生成的測試 | 50% | 必要；低於即拒絕 |
| 整體專案 | 60% | 追蹤趨勢；回歸時告警 |

---

## 何時執行

| 觸發條件 | 指令 | 強制程度 |
|---------|------|---------|
| Pre-release 閘門 | `npm run test:mutation` | 整體 ≥ 60% |
| 關鍵模組變更 | `npx stryker run --mutate 'src/auth/**'` | ≥ 80% |
| AI 生成測試審查 | `npx stryker run` | ≥ 50% |

**絕不**把突變測試加入 commit hook——它太慢了（10-60 分鐘）。

---

## Stryker 快速上手（TypeScript + Vitest）

```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
```

```json
// stryker.config.json
{
  "testRunner": "vitest",
  "coverageAnalysis": "perTest",
  "mutate": ["src/license/**/*.ts", "!src/**/*.test.ts"],
  "thresholds": { "high": 80, "low": 60, "break": 50 }
}
```

---

## 反模式

- 把行覆蓋率當作測試有效性的替代指標
- 在每個 PR 的 CI 中都加入突變測試（太慢）
- 未經 mutation score 驗證就接受 AI 生成的測試
- 靠加 `toBeDefined()` 斷言來殺死突變

---

## 與其他標準的關係

- `test-completeness-dimensions`：維度 8（AI 測試品質）引用 mutation score
- `mock-boundary`：空心測試會讓許多突變存活；mock 邊界規則防止空心測試
- `testing`：突變測試是測試金字塔頂端的品質閘門
