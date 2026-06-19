---
name: migration-assistant
source: ../../../../skills/migration-assistant/SKILL.md
source_version: 1.0.0
source_hash: 67b6f33f825e
translation_version: 1.0.0
last_synced: 2026-06-01
status: current
description: "[UDS] 引導程式碼遷移、框架升級與技術現代化"
---

# 遷移助手

> **語言**: [English](../../../../skills/migration-assistant/SKILL.md) | 繁體中文

引導系統性程式碼遷移、框架升級與技術現代化。

## 使用方式

| 命令 | 用途 |
|------|------|
| `/migrate` | 啟動互動式遷移引導 |
| `/migrate --assess` | 僅風險評估 |
| `/migrate "Vue 2 to 3"` | 引導特定遷移 |
| `/migrate --deps` | 相依升級分析 |
| `/migrate --rollback` | 規劃回滾策略 |

## 遷移類型

| 類型 | 範例 | 風險 |
|------|------|------|
| **框架升級** | React 17→18, Vue 2→3, Angular 15→17 | 中高 |
| **語言遷移** | JS→TS, Python 2→3, Java 8→17 | 高 |
| **API 版本** | REST v1→v2, GraphQL schema 更新 | 中 |
| **資料庫遷移** | MySQL→PostgreSQL, SQL→NoSQL | 極高 |
| **建構工具** | Webpack→Vite, Grunt→ESBuild | 低中 |
| **套件管理器** | npm→pnpm, pip→poetry | 低 |

## 風險評估矩陣

| | 低影響 | 中影響 | 高影響 |
|---|--------|--------|--------|
| **低複雜度** | 安全（直接進行） | 謹慎 | 仔細規劃 |
| **中複雜度** | 謹慎 | 規劃 + 測試 | 分階段發布 |
| **高複雜度** | 規劃 + 測試 | 分階段發布 | 完整 SDD 規格 |

## 工作流程

1. **評估** - 評估現狀、識別破壞性變更
2. **規劃** - 建立含相依關係的遷移清單
3. **準備** - 設定 codemods、相容層、功能旗標
4. **遷移** - 分階段執行遷移並測試
5. **驗證** - 執行完整測試套件、檢查回歸
6. **清理** - 移除相容層、舊相依

## API 遷移合約測試

當 API endpoint 從一個技術棧遷至另一個（PHP → .NET、Express → Spring、Python → Go），對**新**實作的單元測試只驗證**新 DTO**——無法捕捉「舊版有但新版漏掉的欄位」。欄位缺漏、欄位 rename、型別漂移，以及頂層 vs nested 層級漂移等問題會靜默流入生產，導致仍預期舊版 shape 的既有前端失靈。

**僅靠單元測試、整合測試或 code review 無法防止**。2026-05-24 真實 PROD 事故：67/67 測試全綠流入正式環境，由客戶發現缺漏。

### 強制規則

每個被遷移的 API endpoint **必須**至少有一份 contract test，比對新實作的 response 與從 legacy 實作捕獲的 fixture。驗證的是結構性等價（keys、type、層級位置），而非值等價。

### Fixture 捕獲協議

**Legacy 仍運行（典型遷移窗口）：**

```bash
# 1. Capture ≥3 representative inputs (happy path, edge case, empty result)
curl -X POST $LEGACY_BASE/endpoint -d @input1.json \
  > tests/fixtures/migration/endpoint/scenario1.json
curl -X POST $LEGACY_BASE/endpoint -d @input2_empty.json \
  > tests/fixtures/migration/endpoint/scenario2_empty.json
curl -X POST $LEGACY_BASE/endpoint -d @input3_edge.json \
  > tests/fixtures/migration/endpoint/scenario3_edge.json

# 2. Scrub PII and volatile values (timestamps, generated IDs)
jq 'walk(if type == "string" and test("@") then "redacted@example.com" else . end)' \
  tests/fixtures/migration/endpoint/scenario1.json > tmp && mv tmp ...

# 3. Commit fixtures
git add tests/fixtures/migration/endpoint/
```

**Legacy 已退役但 source 可讀：**

- 追蹤 legacy source code，手動建構預期的 response shape
- 將每個欄位的來源（SQL 欄位、計算式、hardcoded）記錄於同位置的 `.notes.md` 檔案

### Contract test 範本

**C# / xUnit：**

```csharp
[Theory]
[InlineData("scenario1")]
[InlineData("scenario2_empty")]
[InlineData("scenario3_edge")]
public async Task Endpoint_ResponseShape_MatchesLegacyFixture(string scenario)
{
    var fixture = LoadFixture($"migration/endpoint/{scenario}");
    var response = await CallNewImpl(fixture.Input);
    // StructuralEquivalence checks keys + types + placement, ignores values
    StructuralEquivalence.Assert(response, fixture.ExpectedShape);
}
```

**TypeScript / Jest：**

```typescript
import { structuralEquivalence } from "./test-utils/structural-equivalence";

describe.each([
  ["scenario1"],
  ["scenario2_empty"],
  ["scenario3_edge"],
])("Endpoint response shape vs legacy fixture (%s)", (scenario) => {
  test("matches", async () => {
    const fixture = loadFixture(`migration/endpoint/${scenario}.json`);
    const response = await callNewImpl(fixture.input);
    structuralEquivalence(response, fixture.expectedShape);
  });
});
```

`structuralEquivalence` / `StructuralEquivalence.Assert` 規則：每一層具備相同的 key 集合（不可缺漏、不可多出，除非明確 opt in）、每個 key 具相同的基本型別、相同的層級位置（頂層 vs nested）。值可以不同（timestamps、IDs）；型別與結構不可不同。

### 逐欄位遷移稽核清單

合併任何被遷移的 endpoint 前：

- [ ] 所有 legacy response 欄位皆 mapping 至新 DTO（無 silent drop）
- [ ] 儘量保留命名（避免將 `TotalX` rename 而丟失「per-member」語意）
- [ ] 保留頂層 vs nested 層級位置
- [ ] 已驗證型別相容性（string→int 轉換為明確而非巧合）
- [ ] Error path return code 與 legacy 一致（`509` 而非 `506`；`404` 而非 `400`）
- [ ] Contract test fixture 已 commit 至 `tests/fixtures/migration/`
- [ ] Cross-link 至 [contract-test-assistant](../contract-test-assistant/SKILL.md) 做持續的消費端驗證

## 回滾策略

| 方式 | 使用時機 |
|------|---------|
| **Git revert** | 小型、原子性變更 |
| **功能旗標** | 需要逐步發布 |
| **雙運行** | 關鍵系統、零停機 |
| **分支凍結** | 一次性完整遷移 |

## 使用範例

```
User: /migrate "Vue 2 to 3"
AI: Migration Assessment: Vue 2 → Vue 3
    Breaking changes found: 12
    - Options API → Composition API (47 components)
    - Filters removed (8 usages)
    - Event bus removed (3 usages)
    Risk: Medium-High
    Estimated effort: 2-3 weeks
    Recommended: Staged migration with @vue/compat
```

## 下一步引導

`/migrate` 完成後，AI 助手應建議：

> **遷移分析完成。建議下一步：**
> - 執行 `/reverse` 深入理解現有程式碼
> - 執行 `/testing` 確保遷移後測試通過 ⭐ **推薦**
> - 執行 `/commit` 提交遷移變更

## 參考

- 核心規範：[refactoring-standards.md](../../../../core/refactoring-standards.md)
- 相關：[contract-test-assistant](../contract-test-assistant/SKILL.md) — 遷移後持續合約驗證的策略

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.1.0 | 2026-05-26 | 新增：API 遷移合約測試章節——強制 fixture 捕獲協議、C#/TS 範本、逐欄位稽核清單（XSPEC-233 / closes #112） |
| 1.0.0 | 2026-03-24 | 初始版本 |

## AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/migrate`](../../../../skills/commands/migrate.md#ai-agent-behavior--ai-代理行為)

## 授權

CC BY 4.0
