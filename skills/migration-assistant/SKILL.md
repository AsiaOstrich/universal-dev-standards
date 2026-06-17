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

## Post-Cutover Data Reconciliation | Cutover 後生產資料對帳

> **Implements**: XSPEC-284 R2 (axis ③ persisted-data semantics) / closes UDS issue [#134](https://github.com/AsiaOstrich/universal-dev-standards/issues/134).

Contract tests (above) and `behavior-snapshot` catch **interface** divergence but are blind to **persisted-data semantic** divergence. Two blind spots both share:

1. **You can only assert what you thought to enumerate.** The rules that actually ship broken are the *implicit, undocumented* ones — especially the semantics of a persisted field (when is it non-zero? when is it overwritten?). Nobody writes a scenario for a rule they don't know exists.
2. **Per-request parity ≠ data-at-rest parity.** A field written by an **asynchronous** process (delivery-receipt sync, settlement job, status reconciler) against a live external provider is not a deterministic request you can replay. Its correctness only emerges in **aggregate over real production volume**, not in a single happy-path snapshot.

Contract test 與 `behavior-snapshot`只能捕捉**介面**分歧，對**持久化資料語義**分歧視而不見。兩者共有兩個盲區：(1) 你只能驗證你想得到要列舉的規則——真正出包的永遠是沒人寫下來的隱含規則（某欄位何時非零、何時被覆寫）；(2) per-request parity ≠ data-at-rest parity——由**非同步**程序（DR sync、結算批次、狀態對帳器）對 live 外部供應商寫入的欄位，不是可重放的確定性請求，其正確性只在**真實生產量的聚合**中浮現。

### Failure fingerprint | 事故指紋（#134）

某企業 SMS 平台 PHP→.NET 重寫：每筆金額由**非同步** DR sync 覆寫（`record.Cost = gatewayDr.Cost`）。legacy 對 carrier-failure 仍計費，rewrite 寫 gateway 回報的 `0` → cutover 邊界兩側同一失敗狀態的金額分歧。**所有既有 gate 全部漏接**（response shape 相同 → contract test 過；無人 curated「失敗仍計費」場景；欄位由背景作業對 live gateway 寫入 → 不可重放）。最後靠 ops 跑生產 `SUM(cost) GROUP BY status, day` 跨邊界彙總才發現。**單日抽樣甚至誤判「失敗不計費＝正常」**——只有跨 cutover 邊界的多週聚合才揭露真相。

### Mandatory rule | 強制規則

When a migration loads legacy data into the **same store** as new data, the old/new boundary is a **free differential oracle**. For each business-critical persisted field you **MUST**:

- Define **aggregate reconciliation invariants** comparing the distribution of **legacy-origin vs new-origin** rows along key dimensions (e.g. `SUM(money) / COUNT(*) GROUP BY status, period`).
- Run them **on a schedule against production** and alert when divergence exceeds a declared tolerance.
- Investigate over a **multi-week window spanning the cutover** — never a single-day sample (a sampled check can confirm a *wrong* conclusion).

當 migration 將 legacy 資料載入與 new 相同的**儲存**，新舊邊界即是**免費差分神諭**。對每個 business-critical 持久化欄位**必須**：定義聚合對帳不變量（比對 legacy-origin vs new-origin 列沿關鍵維度的分佈）、對生產**排程執行**並於分歧超過宣告容差時告警、以跨 cutover 的**多週窗口**調查（切忌單日抽樣，抽樣可能坐實錯誤結論）。

### Cutover-boundary reconciliation SQL template | 對帳 SQL 模板

```sql
-- Reconcile a money/state field across the migration cutover boundary.
SELECT status,
       SUM(CASE WHEN created < @cutover THEN 1 ELSE 0 END)                          AS legacy_rows,
       SUM(CASE WHEN created < @cutover AND money_field > 0 THEN 1 ELSE 0 END)      AS legacy_nonzero,
       SUM(CASE WHEN created >= @cutover THEN 1 ELSE 0 END)                         AS new_rows,
       SUM(CASE WHEN created >= @cutover AND money_field > 0 THEN 1 ELSE 0 END)     AS new_nonzero
FROM records GROUP BY status;
-- Invariant: nonzero-ratio per status must not differ across the boundary beyond tolerance.
```

### Tolerance & alerting guidance | 容差與告警指引

| Aspect | Guidance | 指引 |
|--------|----------|------|
| **Invariant type** | nonzero-ratio / `SUM` / `COUNT` / `DISTINCT` / checksum per `GROUP BY status, period` | 每維度的非零比率 / 聚合相等 / checksum |
| **Tolerance** | Declare per field; 0% for hard accounting invariants, a small ε only for known legitimate drift (e.g. rounding) | 逐欄宣告；硬會計不變量 0%，僅已知合法漂移容許小 ε |
| **Window** | Multi-week, spanning cutover; bucket by `period` to localise the boundary | 多週、橫跨 cutover；以 `period` 分桶定位邊界 |
| **Schedule** | Standing post-cutover cron (daily) until boundary rows age out of active reporting | post-cutover 排程（每日）直到邊界列退出活躍報表 |
| **Alert** | Page on divergence > tolerance; route via `observability-assistant` alert rules | 分歧超過容差即告警；經 `observability-assistant` 告警規則路由 |

### Gate 0 — Implicit-rule capture for persisted business fields | 隱含規則擷取

Before migrating any feature that writes a persisted business field, **explicitly answer for each such field** three questions, then lock the answer as a snapshot scenario **or** a reconciliation invariant:

> 1. **When is this value SET?** 何時設值？
> 2. **When is it OVERWRITTEN?** 何時被覆寫？（尤其非同步路徑）
> 3. **When is it ZEROED / nulled?** 何時歸零／清空？

**High-risk implicit-rule checklist** — empirically recurring fingerprints | 高風險隱含規則檢查清單（經驗反覆出現的指紋）：

- [ ] **Billing / charge semantics** — charged on submit vs on delivery; refund-on-failure? | 計費語義（提交時計費 vs 送達時計費；失敗退費？）
- [ ] **Enum / status-code mapping** — every legacy code mapped; "success set" defined identically | 列舉／狀態碼對映（每個 legacy 碼都對映；「成功集合」定義一致）
- [ ] **Null / empty handling** — empty string vs null vs absent; default-on-missing | 空值處理（空字串 vs null vs 不存在；缺值預設）
- [ ] **Field-name casing / serialization** — snake_case vs camelCase binding | 欄位命名大小寫／序列化（snake_case vs camelCase 綁定）
- [ ] **Timezone** — stored UTC vs local; report boundaries | 時區（存 UTC vs local；報表邊界）
- [ ] **Rounding / type coercion** — `"2.00"` (text) parsed as int → dropped to 0 | 四捨五入／型別強轉（`"2.00"` 文字被當 int 解析 → 掉成 0）

### 3-gate positioning | 3-gate 定位表

Make the boundary between gates explicit so each axis has an owner and nothing falls into the seam:

| Gate | Scope | When | 範圍 / 時機 |
|------|-------|------|------|
| [`behavior-snapshot`](../../core/behavior-snapshot.md) | per-request, **curated** scenarios | pre-UAT CI | per-request、人工 curated 場景；pre-UAT CI |
| Contract tests (above / #112) | response **shape** (keys / types / placement) | unit / integration | response shape（keys/型別/層級）；單元/整合 |
| **This section (#134)** | **aggregate, data-at-rest semantics of async-written fields, over real volume** | **post-cutover, scheduled, production** | **非同步寫入欄位的聚合、靜態資料語義，跨真實量；post-cutover 排程生產** |

> Cross-ref: [`behavior-snapshot`](../../core/behavior-snapshot.md) (curated golden masters), [`observability-assistant`](../observability-assistant/SKILL.md) (reconciliation schedule + alert templates).

## Background Job / Side-Effect Completeness | 背景作業／副作用完整性

> **Implements**: XSPEC-284 R3 (axis ⑤).

Migration inventories (`/vo-inventory`, XSPEC-200 `type:background_job`) and Devil's-Advocate grep (XSPEC-201 Step 4) **annotate** cron / queue consumers / scheduled batches / webhooks / mail-send points — but annotation alone proves nothing. A background job can be listed in the manifest, exist in code, and still **never actually run** in the new system.

遷移清單與副作用 grep 只是**標注**背景作業——標注本身不證明任何事。背景作業可能在 manifest 列出、程式碼存在，卻在新系統**從未真正執行**。

### Mandatory rule | 強制規則

For every background side-effect carried over from legacy, verify **two** things — annotation is not enough:

| Check | Pre-flight | Post-cutover |
|-------|-----------|--------------|
| **(a) Exists** — the cron / queue consumer / webhook / mail point is implemented in the new system | source grep + registration check | — |
| **(b) Executed** — it has actually been **triggered / run at least once**, with observable evidence (log line, heartbeat, queue-depth drain, telemetry counter) | — | observability evidence required |

If either check fails, mark the feature `not_implemented` (XSPEC-199) and **block UAT / cutover** — do not treat a silent, never-fired job as "done".

對每條由 legacy 帶過來的背景副作用，須驗證**兩件事**（標注不夠）：(a) **存在**——cron／queue consumer／webhook／寄信點在新系統實際實作（source grep + 註冊檢查）；(b) **已執行**——post-cutover 已被**觸發／執行至少一次**且有可觀測證據（log、heartbeat、queue depth 排空、telemetry counter）。任一不過即標 `not_implemented`（XSPEC-199）並 **block UAT／cutover**——絕不把沉默、從未觸發的作業當「完成」。

> Cross-ref: structured-log mandatory events `heartbeat` / `business_event` (logging-standards) provide the observable execution evidence for check (b).

## State-Machine & Temporal Parity | 狀態機與時序對等

> **Implements**: XSPEC-284 R8 (axis ⑧) → split out as **XSPEC-287**.

Legacy state-transition rules and temporal preconditions are **implicit**: a single-record snapshot "looks legal", and a violation only surfaces across a **sequence** of operations. So per-request functional parity and behavior-snapshot parity both miss them (same blind-spot class as "per-request ≠ data-at-rest" / "per-request ≠ concurrency"). `feature-manifest` has only a `status` field — it does **not** validate transition legality.

legacy 的狀態轉移規則與時序前提多為**隱性**：單筆記錄的快照「看起來合法」，違規只在一連串操作的**轉移序列**中浮現，因此 per-request 功能對等與 behavior-snapshot 對等都抓不到（與「per-request ≠ data-at-rest」「per-request ≠ 並發」同源盲區）。`feature-manifest` 只有 `status` 欄，**不**驗證轉移合法性。

### Step 1 — State-machine list source (derive, R3) | 狀態機清單來源

Legacy transitions are scattered across controllers / services / DB triggers. Derive the state enumeration + legal-transition set **mechanically** via three-way cross-reference (do not rely on memory):

legacy 狀態轉移散落於 controller／service／DB trigger。以**三方交叉**機械化擷取狀態列舉 + 合法轉移集（不靠人腦回憶）：

| Source | Yields |
|--------|--------|
| **(1) enum definition** — status enum / lookup table | the full set of declared states |
| **(2) state-update points** — grep every `status = ...` / `UPDATE ... SET status` / trigger | which transitions the code *can* perform |
| **(3) production actual sequences** — distinct `(from_status → to_status)` pairs observed in prod history/audit | which transitions *actually* occur |

> **Authority on conflict**: when the three disagree, treat **production-observed transitions as the legacy ground truth** (echoes #134 "production is the oracle"). A transition the code allows but production never produced is a latent path; a production transition the new enum forbids is a regression.

> **權威性**：三者不一致時，以**生產實際出現過的轉移為 legacy 真實行為基準**（呼應 #134「以生產為準」）。程式碼允許但生產從未產生的轉移是潛在路徑；生產出現過但新 enum 禁止的轉移是回歸。

### Step 2 — Legal-transition validation (oracle, R1) | 合法轉移驗證

From the derived transition graph, assert the **new system forbids illegal transitions** that legacy forbade. Block when the new system **allows a transition legacy prohibited** (a rewrite routinely loosens implicit guards):

依萃取出的轉移圖，斷言**新系統禁止 legacy 禁止的非法轉移**。當新系統**允許 legacy 禁止的轉移**即 block（重寫常放寬隱性護欄）：

- `cancelled → pending` (reviving a cancelled order)
- `refunded → paid` (un-refunding)
- `shipped → draft` (backward past a point-of-no-return)

**Gate timing**: pre-UAT.

### Step 3 — Temporal invariant detection (oracle, R2) | 時序不變量偵測

Assert temporal invariants that a single-row snapshot cannot reveal; violation → alert:

斷言單筆快照無法揭露的時序不變量；違反即告警：

- `created_at ≤ updated_at` (no record updated before it existed)
- no **future timestamps** (clock skew / bad default)
- **monotonic** status-timestamp progression (`paid_at ≤ shipped_at ≤ delivered_at`)
- event-ordering guarantees preserved (no reordered event log)

**Gate timing**: pre-UAT **and** post-cutover (shares the reconciliation schedule of axis ③ Post-Cutover Data Reconciliation above).

**Gate 時機**：pre-UAT **與** post-cutover（與上方軸③ Post-Cutover 對帳共用排程）。

### Step 4 — Sequence / ordering parity (R4) | 序列／順序對等

Verify the new system preserves **idempotency** (a repeated operation does not produce a duplicate state change) and **critical event ordering**, so the rewrite does not introduce order-sensitive bugs:

驗證新系統保留**冪等性**（重複操作不產生重複狀態變更）與**關鍵事件順序**，避免重寫引入順序敏感 bug：

- [ ] Replaying the same event/message twice yields one state change, not two
- [ ] Out-of-order delivery is rejected or reconciled, not silently applied
- [ ] Idempotency keys / dedup windows match legacy semantics

### Boundary with XSPEC-286 axis ⑥ | 與 XSPEC-286 軸⑥ 邊界

**287 (this section, axis ⑧)** owns **transition legality + temporal correctness** (a domain question). **[XSPEC-286](../../core/performance-standards.md) axis ⑥** owns **concurrency race / isolation** (a performance/contention question). An overlap case — a *concurrent* operation causing an *illegal* transition — has its concurrency aspect in 286 and its transition-legality aspect here; assign the primary owner per the dominant failure mode at landing time.

**287（本節，軸⑧）**負責**轉移合法性 + 時序正確性**（領域問題）；**[XSPEC-286](../../core/performance-standards.md) 軸⑥**負責**並發競態／隔離**（效能/競爭問題）。重疊案例（並發導致非法轉移）的並發面歸 286、轉移合法性面歸本節；落地時依主導失敗模式指派主責。

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

## Appendix — 9-Axis Completeness Matrix | 附錄：9 軸完整性矩陣

> **Source**: XSPEC-284 Legacy Refactor Completeness Framework. "Ensuring nothing is missing cannot be proven by enumeration" — you can only verify what you thought to enumerate. Strategy = two legs: **(1) mechanically derive** the to-do list from real legacy artifacts (schema / routes / cron config / prod logs), and **(2) differential oracles** (shadow run / replay / cutover-boundary reconciliation) that make divergence self-report.
>
> 「確保沒有遺漏」無法用列舉證明——你只能驗證你想得到要列舉的東西。策略＝兩條腿：(1) 從 legacy 真實 artifact **機械化推導**待辦清單；(2) **差分神諭**讓分歧自報。

Each migration declares, per axis, three things: **derive** (list source) · **detect** (oracle) · **gate timing**. Axes marked here as covered map to existing UDS standards — do not re-invent.

| Axis | Derive (list source) | Detect (oracle) | Gate | Covered by |
|------|----------------------|-----------------|------|------------|
| ① Feature | route table / controller / menu / permissions | inventory diff (legacy vs new) | pre-flight | XSPEC-200 feature-manifest + `/vo-inventory`; XSPEC-206 |
| ② Behavior | curated scenarios + prod-log extraction | behavior-snapshot parity | pre-UAT | XSPEC-201 behavior-snapshot; **contract tests** (this skill) |
| ③ **Persisted semantics** | DB schema full-column semantic sign-off (Gate 0) | **cutover-boundary aggregate reconciliation** | **post-cutover** | **This skill — Post-Cutover Data Reconciliation (#134)** |
| ④ Implicit rules | cron / queue / computed-column / middleware source scan | per-field 3 questions + non-HTTP Devil's Advocate | pre-flight | This skill Gate 0 (HTTP layer: XSPEC-201 Step 7); XSPEC-284 R4 (non-HTTP, future) |
| ⑤ **Background side-effects** | crontab / queue config / webhook registry / mail points | **per-job "exists + has fired"** | pre-flight + **post-cutover** | **This skill — Background Job / Side-Effect Completeness** |
| ⑥ Non-functional | legacy perf baseline + concurrency list | latency/throughput regression + isolation | pre-UAT | XSPEC-286 (split out) |
| ⑦ Data integrity | schema type / encoding / timezone list | row count + checksum + encoding bytes + aggregate equality | post-migration + post-cutover | XSPEC-172 data-migration-testing; XSPEC-206; XSPEC-284 R6 (future) |
| ⑧ **State machine** | legacy transition graph (enum + update-points + prod sequences) | **legal transitions + temporal invariants (`created ≤ updated`)** | pre-UAT + **post-cutover** | **This skill — State-Machine & Temporal Parity** (XSPEC-287) |
| ⑨ Error paths | legacy exception hierarchy / error codes | error-path snapshot + systematic gap analysis | pre-UAT | XSPEC-288 (split out); full-coverage-testing |
| **Cross-axis** | — | **shadow run** (mirror prod to both) / **replay** (replay legacy requests) | cutover before/after | XSPEC-284 R5 (generalises `/vo-snapshot` parity, future) |

每軸宣告〔清單來源 derive｜oracle detect｜gate 時機〕；標為已覆蓋者對映既有 UDS 標準，**勿重複造輪子**。未宣告的軸視為**已知遺漏風險**。本框架 P0 落地＝軸③④⑤（本 skill）；軸⑥已拆 XSPEC-286（落地於 performance-standards）、**軸⑧已落地於本 skill State-Machine & Temporal Parity（XSPEC-287）**、軸⑨拆 XSPEC-288。

## Reference | 參考

- Core standard: [refactoring-standards.md](../../core/refactoring-standards.md)
- Related: [contract-test-assistant](../contract-test-assistant/SKILL.md) — Strategy for ongoing contract verification post-migration
- Related: [behavior-snapshot](../../core/behavior-snapshot.md) — Curated golden-master parity (3-gate axis ②)
- Related: [observability-assistant](../observability-assistant/SKILL.md) — Reconciliation schedule + alert rules for post-cutover oracle
- Framework: XSPEC-284 Legacy Refactor Completeness Framework — 9-axis SSOT

## Version History | 版本歷史

| Version | Date | Changes | 變更 |
|---------|------|---------|------|
| 1.3.0 | 2026-06-17 | Added: State-Machine & Temporal Parity (axis ⑧, XSPEC-287) — three-way transition-graph derive (enum + update-points + prod sequences), legal-transition validation, temporal invariants (`created ≤ updated` / no future / monotonic), sequence/idempotency parity, boundary with XSPEC-286 axis ⑥; matrix row ⑧ now owned by this skill | 新增狀態機與時序對等（軸⑧，XSPEC-287）：三方轉移圖萃取、合法轉移驗證、時序不變量、序列/冪等對等、與 XSPEC-286 軸⑥邊界 |
| 1.2.0 | 2026-06-17 | Added: Post-Cutover Data Reconciliation (cutover-boundary SQL + tolerance/alerting + Gate-0 implicit-rule checklist + 3-gate positioning), Background Job / Side-Effect Completeness (exists + has-fired), 9-axis Completeness Matrix appendix; cross-ref behavior-snapshot/observability-assistant (XSPEC-284 P0 R2/R3 / closes #134) | 新增 Post-Cutover 生產資料對帳、背景作業完整性驗證、9 軸完整性矩陣附錄 |
| 1.1.0 | 2026-05-26 | Added: API Migration Contract Tests section — mandatory fixture capture protocol, C#/TS templates, field-by-field audit checklist (XSPEC-233 / closes #112) | 新增 API 遷移合約測試章節 |
| 1.0.0 | 2026-03-24 | Initial release | 初始版本 |


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/migrate`](../commands/migrate.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/migrate`](../commands/migrate.md#ai-agent-behavior--ai-代理行為)

## License | 授權

CC BY 4.0
