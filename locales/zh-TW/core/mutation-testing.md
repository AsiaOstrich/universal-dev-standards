---
source: ../../../core/mutation-testing.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-08-14
source_hash: 8eeaea8d9cc3
status: current
---

# 突變測試標準

> **Language**: [English](../../../core/mutation-testing.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-08-14
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

## 歸因：kill 記給第一個失敗的測試

「Killed」代表這一輪執行中**有某個**測試對該突變體斷言失敗——大多數工具不會記錄是**哪一個**測試殺死了它，更不會記錄是**哪一層**。因此 7/7 的 kill score 驗證的是**對該突變體執行過的整套測試**，不是任何單一測試，也不是任何單一測試層級（unit vs. integration vs. property）。

**後果**：「property suite 驗證了 X」這句話，並不是一次聚合的 mutation run 所能支持的主張。要支持它，必須**只啟用 property suite** 重跑 mutation testing：

```bash
npx stryker run --mutate 'src/module/**' -- --project=property
```

若隔離執行殺死的突變體比聚合執行少，這個差距正是 unit/integration 測試原本悄悄替它涵蓋掉的部分。

**規則**：高風險模組（與 80% 門檻適用的同一集合——auth/license/payment/security）在宣稱「已被 property 驗證」之前，必須先單獨對 property suite 重跑一次突變。

---

## 單邊不變式抓不到 fail-closed 缺陷

像「輸出永不超過上限」這種性質是單邊的：它結構上抓不到讓程式碼**fail closed**（拒絕一切，包含合法輸入）的突變體——因為 fail-closed 的突變體永遠不會產生超過上限的輸出。Mutation score 看起來毫髮無傷，而一整類缺陷（阻斷服務、錯誤拒絕合法請求）對這套測試完全隱形。

**修法**：每個單邊不變式都要配一個相反邊界的性質——「永不超過上限」需要一個搭檔性質，例如「上限以下的都會被接受」——讓過度寬鬆與過度嚴格的突變體都各自有一條被抓到的路徑。

---

## Equivalent mutant 不是要追殺的存活者

一個存活的突變體不會自動等於測試缺口。有些突變體與原始程式碼**語意等價**——沒有任何輸入能區分兩者的行為——不管測試怎麼寫都殺不死它。用一個只為了推高分數而存在的斷言（例如對一個無關緊要的值加 `toBeDefined()`）硬殺，只會製造一個空心測試，沒有真的補上任何缺口。

**每個被審查過的存活者都必須被分類**：
- **真缺口** → 寫一個能觸發那個可區分行為的測試。
- **`equivalent, because <理由>`** → 連同為了得出此結論而檢查過的輸入一併記錄。

未分類的存活者，不等於已分類為 equivalent 的存活者。只有已分類為 equivalent 的突變體，才可以從分母中排除。

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
- 用一次聚合（非隔離）的 mutation run 就宣稱「property suite 驗證了 X」
- 對有 fail-closed 失效模式的性質，只用單邊不變式
- 對語意等價的突變體硬殺，而不是分類為「equivalent, because <理由>」

---

## 與其他標準的關係

- `test-completeness-dimensions`：維度 8（AI 測試品質）引用 mutation score
- `mock-boundary`：空心測試會讓許多突變存活；mock 邊界規則防止空心測試
- `testing`：突變測試是測試金字塔頂端的品質閘門
