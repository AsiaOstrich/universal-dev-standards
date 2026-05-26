---
name: migrate
scope: universal
description: "[UDS] Guide code migration, framework upgrades, and technology modernization"
allowed-tools: Read, Grep, Glob, Bash(npm:*, git:*)
argument-hint: "[migration target or framework | 遷移目標或框架]"
---

# Migration Assistant | 遷移助手

Guide systematic code migration, framework upgrades, and technology modernization.

引導系統性程式碼遷移、框架升級與技術現代化。

## Usage | 使用方式

| Command | Purpose | 用途 |
|---------|---------|------|
| `/migrate` | Start interactive migration guide | 啟動互動式遷移引導 |
| `/migrate --assess` | Risk assessment only | 僅風險評估 |
| `/migrate "Vue 2 to 3"` | Guide specific migration | 引導特定遷移 |
| `/migrate --deps` | Dependency upgrade analysis | 依賴升級分析 |
| `/migrate --rollback` | Plan rollback strategy | 規劃回滾策略 |

## Migration Types | 遷移類型

| Type | Examples | Risk | 風險 |
|------|----------|------|------|
| **Framework Upgrade** | React 17→18, Vue 2→3, Angular 15→17 | Medium-High | 中高 |
| **Language Migration** | JS→TS, Python 2→3, Java 8→17 | High | 高 |
| **API Version** | REST v1→v2, GraphQL schema update | Medium | 中 |
| **Database Migration** | MySQL→PostgreSQL, SQL→NoSQL | Very High | 極高 |
| **Build Tool** | Webpack→Vite, Grunt→ESBuild | Low-Medium | 低中 |
| **Package Manager** | npm→pnpm, pip→poetry | Low | 低 |

## Risk Assessment Matrix | 風險評估矩陣

| | Low Impact | Medium Impact | High Impact |
|---|-----------|---------------|-------------|
| **Low Complexity** | Safe (proceed) | Caution | Plan carefully |
| **Medium Complexity** | Caution | Plan + test | Staged rollout |
| **High Complexity** | Plan + test | Staged rollout | Full SDD spec |

| | 低影響 | 中影響 | 高影響 |
|---|--------|--------|--------|
| **低複雜度** | 安全（直接進行） | 謹慎 | 仔細規劃 |
| **中複雜度** | 謹慎 | 規劃 + 測試 | 分階段發布 |
| **高複雜度** | 規劃 + 測試 | 分階段發布 | 完整 SDD 規格 |

## Workflow | 工作流程

1. **ASSESS** - Evaluate current state, identify breaking changes
2. **PLAN** - Create migration checklist with dependencies
3. **PREPARE** - Set up codemods, compatibility layers, feature flags
4. **MIGRATE** - Execute migration in phases with tests
5. **VERIFY** - Run full test suite, check for regressions
6. **CLEANUP** - Remove compatibility shims, old dependencies

---

1. **評估** - 評估現狀、識別破壞性變更
2. **規劃** - 建立含依賴關係的遷移清單
3. **準備** - 設定 codemods、相容層、功能旗標
4. **遷移** - 分階段執行遷移並測試
5. **驗證** - 執行完整測試套件、檢查回歸
6. **清理** - 移除相容層、舊依賴

## API Migration Contract Tests | API 遷移合約測試

When migrating an API endpoint from one tech stack to another (PHP → .NET, Express → Spring, Python → Go), unit tests on the **new** implementation verify against the **new DTO** — they cannot catch fields that the legacy returned but the new implementation forgot. Missing fields, renamed fields, type drift, and top-level vs nested placement drift will silently survive into production and break the existing frontend that still expects the legacy shape.

This is **NOT** caught by unit tests, integration tests, or code review alone. A real 2026-05-24 production incident shipped with 67/67 green tests and was discovered by the customer.

當 API endpoint 從一個技術棧遷至另一個（PHP → .NET、Express → Spring 等），對**新**實作的單元測試只驗證**新 DTO**——無法捕捉「舊版有但新版漏掉」「欄位 rename」「型別漂移」「頂層 vs nested 層級漂移」等問題。這些缺陷會靜默流入生產，導致前端（仍預期舊版回應 shape）失靈。

**僅靠單元測試、整合測試或 code review 無法防止**。2026-05-24 真實 PROD 事故：67/67 測試全綠流入正式環境，由客戶發現缺漏。

### Mandatory rule | 強制規則

Every migrated API endpoint **MUST** ship with at least one contract test that compares the new implementation's response against a fixture captured from the legacy implementation. Structural equivalence (keys, types, placement), not value equality, is verified.

每個被遷移的 API endpoint **必須**至少有一份 contract test，比對新實作的 response 與從 legacy 捕獲的 fixture。驗證的是結構性等價（keys、type、層級位置），而非值等價。

### Fixture capture protocol | Fixture 捕獲協議

**While legacy is still running (typical migration window) | Legacy 仍運行（典型遷移窗口）:**

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

**When legacy is already retired but source-readable | Legacy 已退役但 source 可讀:**

- Trace through legacy source code, manually construct the expected response shape
- Document each field's origin (SQL column, computed expression, hardcoded) in a sibling `.notes.md` file
- 從 legacy source code 推導預期 response shape；每個欄位來源（SQL 欄位 / 計算式 / hardcoded）記錄於同位置 `.notes.md`

### Contract test template

**C# / xUnit:**

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

**TypeScript / Jest:**

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

`structuralEquivalence` / `StructuralEquivalence.Assert` rule: same set of keys at each level (no missing, no extra unless explicitly opted in), same primitive type per key, same placement (top-level vs nested). Values can differ (timestamps, IDs); types and structure cannot.

### Field-by-field migration audit checklist

Before merging any migrated endpoint:

- [ ] All legacy response fields mapped to new DTO (no silent drops)
- [ ] Naming preserved where possible (avoid `TotalX` rename that drops the "per-member" semantic)
- [ ] Top-level vs nested placement preserved
- [ ] Type compatibility verified (string→int conversions explicit, not coincidental)
- [ ] Error path return codes match legacy (`509` not `506`; `404` not `400`)
- [ ] Contract test fixture committed under `tests/fixtures/migration/`
- [ ] Cross-link to [contract-test-assistant](../contract-test-assistant/SKILL.md) for ongoing consumer-side verification

合併前必確認：
- [ ] 所有 legacy response 欄位 mapping 至新 DTO（無 silent drop）
- [ ] 命名儘量保留
- [ ] 頂層 vs nested 層級保留
- [ ] 型別相容性已明確驗證
- [ ] Error path return code 與 legacy 一致
- [ ] Contract test fixture 已 commit
- [ ] Cross-link 至 contract-test-assistant 做持續消費端驗證

## Rollback Strategy | 回滾策略

| Approach | When to Use | 使用時機 |
|----------|-------------|---------|
| **Git revert** | Small, atomic changes | 小型、原子性變更 |
| **Feature flag** | Gradual rollout needed | 需要逐步發布 |
| **Dual-run** | Critical systems, zero downtime | 關鍵系統、零停機 |
| **Branch freeze** | Full migration in one go | 一次性完整遷移 |

## Usage Examples | 使用範例

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

## Next Steps Guidance | 下一步引導

After `/migrate` completes, the AI assistant should suggest:

> **遷移分析完成。建議下一步 / Migration analysis complete. Suggested next steps:**
> - 執行 `/reverse` 深入理解現有程式碼 — Understand current codebase
> - 執行 `/testing` 確保遷移後測試通過 ⭐ **Recommended / 推薦** — Verify post-migration tests
> - 執行 `/commit` 提交遷移變更 — Commit migration changes

## Reference | 參考

- Core standard: [refactoring-standards.md](../../core/refactoring-standards.md)
- Related: [contract-test-assistant](../contract-test-assistant/SKILL.md) — Strategy for ongoing contract verification post-migration

## Version History | 版本歷史

| Version | Date | Changes | 變更 |
|---------|------|---------|------|
| 1.1.0 | 2026-05-26 | Added: API Migration Contract Tests section — mandatory fixture capture protocol, C#/TS templates, field-by-field audit checklist (XSPEC-233 / closes #112) | 新增 API 遷移合約測試章節 |
| 1.0.0 | 2026-03-24 | Initial release | 初始版本 |


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/migrate`](../commands/migrate.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/migrate`](../commands/migrate.md#ai-agent-behavior--ai-代理行為)

## License | 授權

CC BY 4.0
