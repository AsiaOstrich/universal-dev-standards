---
name: migration-assistant
source: ../../../../skills/migration-assistant/SKILL.md
source_version: 1.4.0
source_hash: 5d58f55f3f68
translation_version: 1.4.0
last_synced: 2026-07-30
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

## Cutover 後生產資料對帳

> **實作**：XSPEC-284 R2（軸③持久化資料語義）／關閉 UDS issue [#134](https://github.com/AsiaOstrich/universal-dev-standards/issues/134)。

Contract test 與 `behavior-snapshot`只能捕捉**介面**分歧，對**持久化資料語義**分歧視而不見。兩者共有兩個盲區：(1) 你只能驗證你想得到要列舉的規則——真正出包的永遠是沒人寫下來的隱含規則（某欄位何時非零、何時被覆寫）；(2) per-request parity ≠ data-at-rest parity——由**非同步**程序（DR sync、結算批次、狀態對帳器）對 live 外部供應商寫入的欄位，不是可重放的確定性請求，其正確性只在**真實生產量的聚合**中浮現。

### 事故指紋（#134）

某企業 SMS 平台 PHP→.NET 重寫：每筆金額由**非同步** DR sync 覆寫（`record.Cost = gatewayDr.Cost`）。legacy 對 carrier-failure 仍計費，rewrite 寫 gateway 回報的 `0` → cutover 邊界兩側同一失敗狀態的金額分歧。**所有既有 gate 全部漏接**（response shape 相同 → contract test 過；無人 curated「失敗仍計費」場景；欄位由背景作業對 live gateway 寫入 → 不可重放）。最後靠 ops 跑生產 `SUM(cost) GROUP BY status, day` 跨邊界彙總才發現。**單日抽樣甚至誤判「失敗不計費＝正常」**——只有跨 cutover 邊界的多週聚合才揭露真相。

### 強制規則

當 migration 將 legacy 資料載入與 new 相同的**儲存**，新舊邊界即是**免費差分神諭**。對每個 business-critical 持久化欄位**必須**：定義聚合對帳不變量（比對 legacy-origin vs new-origin 列沿關鍵維度的分佈）、對生產**排程執行**並於分歧超過宣告容差時告警、以跨 cutover 的**多週窗口**調查（切忌單日抽樣，抽樣可能坐實錯誤結論）。

### 對帳 SQL 模板

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

### 容差與告警指引

| 面向 | 指引 |
|------|------|
| **不變量類型** | 每維度的非零比率 / 聚合相等 / checksum |
| **容差** | 逐欄宣告；硬會計不變量 0%，僅已知合法漂移容許小 ε |
| **窗口** | 多週、橫跨 cutover；以 `period` 分桶定位邊界 |
| **排程** | post-cutover 排程（每日）直到邊界列退出活躍報表 |
| **告警** | 分歧超過容差即告警；經 `observability-assistant` 告警規則路由 |

### Gate 0 — 隱含規則擷取

遷移任何寫入持久化業務欄位的功能前，**針對每個此類欄位明確回答**三個問題，並將答案鎖定為快照場景**或**對帳不變量：

> 1. **何時設值？**
> 2. **何時被覆寫？**（尤其非同步路徑）
> 3. **何時歸零／清空？**

**高風險隱含規則檢查清單**——經驗反覆出現的指紋：

- [ ] **計費語義**——提交時計費 vs 送達時計費；失敗退費？
- [ ] **列舉／狀態碼對映**——每個 legacy 碼都對映；「成功集合」定義一致
- [ ] **空值處理**——空字串 vs null vs 不存在；缺值預設
- [ ] **欄位命名大小寫／序列化**——snake_case vs camelCase 綁定
- [ ] **時區**——存 UTC vs local；報表邊界
- [ ] **四捨五入／型別強轉**——`"2.00"`（文字）被當 int 解析 → 掉成 0

### 3-gate 定位表

明確劃出各 gate 之間的邊界，讓每個軸都有負責方、不落入縫隙：

| Gate | 範圍 | 時機 |
|------|------|------|
| [`behavior-snapshot`](../../../../core/behavior-snapshot.md) | per-request、人工 curated 場景 | pre-UAT CI |
| Contract tests（上方／#112） | response **shape**（keys／型別／層級） | 單元／整合 |
| **本節（#134）** | **非同步寫入欄位的聚合、靜態資料語義，跨真實量** | **post-cutover，排程，生產** |

> 交叉參照：[`behavior-snapshot`](../../../../core/behavior-snapshot.md)（curated golden masters），[`observability-assistant`](../observability-assistant/SKILL.md)（對帳排程 + 告警範本）。

## 背景作業／副作用完整性

> **實作**：XSPEC-284 R3（軸⑤）。

遷移清單與副作用 grep 只是**標注**背景作業——標注本身不證明任何事。背景作業可能在 manifest 列出、程式碼存在，卻在新系統**從未真正執行**。

### 強制規則

對每條由 legacy 帶過來的背景副作用，須驗證**兩件事**（標注不夠）：(a) **存在**——cron／queue consumer／webhook／寄信點在新系統實際實作（source grep + 註冊檢查）；(b) **已執行**——post-cutover 已被**觸發／執行至少一次**且有可觀測證據（log、heartbeat、queue depth 排空、telemetry counter）。任一不過即標 `not_implemented`（XSPEC-199）並 **block UAT／cutover**——絕不把沉默、從未觸發的作業當「完成」。

> 交叉參照：結構化日誌強制事件 `heartbeat` / `business_event`（logging-standards）提供檢查 (b) 的可觀測執行證據。

## 狀態機與時序對等

> **實作**：XSPEC-284 R8（軸⑧）→ 拆分為 **XSPEC-287**。

legacy 的狀態轉移規則與時序前提多為**隱性**：單筆記錄的快照「看起來合法」，違規只在一連串操作的**轉移序列**中浮現，因此 per-request 功能對等與 behavior-snapshot 對等都抓不到（與「per-request ≠ data-at-rest」「per-request ≠ 並發」同源盲區）。`feature-manifest` 只有 `status` 欄，**不**驗證轉移合法性。

### Step 1 — 狀態機清單來源

legacy 狀態轉移散落於 controller／service／DB trigger。以**三方交叉**機械化擷取狀態列舉 + 合法轉移集（不靠人腦回憶）：

| 來源 | 產出 |
|------|------|
| **(1) enum 定義**——status enum ／查找表 | 完整的已宣告狀態集合 |
| **(2) 狀態更新點**——grep 每個 `status = ...` ／`UPDATE ... SET status` ／trigger | 程式碼*可以*執行哪些轉移 |
| **(3) 生產實際序列**——生產歷史／稽核中觀察到的相異 `(from_status → to_status)` 對 | *實際*發生哪些轉移 |

> **權威性**：三者不一致時，以**生產實際出現過的轉移為 legacy 真實行為基準**（呼應 #134「以生產為準」）。程式碼允許但生產從未產生的轉移是潛在路徑；生產出現過但新 enum 禁止的轉移是回歸。

### Step 2 — 合法轉移驗證

依萃取出的轉移圖，斷言**新系統禁止 legacy 禁止的非法轉移**。當新系統**允許 legacy 禁止的轉移**即 block（重寫常放寬隱性護欄）：

- `cancelled → pending`（復活已取消的訂單）
- `refunded → paid`（反退款）
- `shipped → draft`（倒退回不可逆點之前）

**Gate 時機**：pre-UAT。

### Step 3 — 時序不變量偵測

斷言單筆快照無法揭露的時序不變量；違反即告警：

- `created_at ≤ updated_at`（記錄不會在存在之前被更新）
- 無**未來時間戳**（clock skew／預設值錯誤）
- 狀態時間戳**單調**遞進（`paid_at ≤ shipped_at ≤ delivered_at`）
- 事件排序保證被保留（事件日誌不重排）

**Gate 時機**：pre-UAT **與** post-cutover（與上方軸③ Post-Cutover 對帳共用排程）。

### Step 4 — 序列／順序對等

驗證新系統保留**冪等性**（重複操作不產生重複狀態變更）與**關鍵事件順序**，避免重寫引入順序敏感 bug：

- [ ] 重放同一事件／訊息兩次只產生一次狀態變更，而非兩次
- [ ] 亂序遞送會被拒絕或對帳處理，而非靜默套用
- [ ] 冪等鍵／去重窗口與 legacy 語義一致

### 與 XSPEC-286 軸⑥邊界

**287（本節，軸⑧）**負責**轉移合法性 + 時序正確性**（領域問題）；**[XSPEC-286](../../../../core/performance-standards.md) 軸⑥**負責**並發競態／隔離**（效能/競爭問題）。重疊案例（並發導致非法轉移）的並發面歸 286、轉移合法性面歸本節；落地時依主導失敗模式指派主責。

## 錯誤路徑完整性

> **實作**：XSPEC-284 R9（軸⑨）→ 拆分為 **XSPEC-288**。

最常見的遷移遺漏是「happy path 移了、錯誤／降級／fallback 分支整批被漏」。happy path 有明確需求，錯誤分支散落（try/catch 階層、自訂例外階層、特定錯誤碼）而被靜默遺失。本 skill 負責**遷移 derive + 降級對等**（R1/R3）；**系統性遺漏分支 gap 分析 + 錯誤回應差分**（R2/R4）落在 [full-coverage-testing](../../../../core/full-coverage-testing.md)「Migration Error-Path Completeness」。

### Step 1 — 機械化 legacy 例外/錯誤碼清單

**機械化**列舉 legacy 錯誤面（不靠回憶）：grep `catch`／`except`／`rescue` 區塊、自訂例外/錯誤類階層、所有錯誤/狀態碼、錯誤回應形狀（serializer／DTO）。此清單即交給 full-coverage-testing gap 分析的錯誤路徑待驗清單。

### Step 2 — 降級／Fallback 對等

legacy 降級模式只在失敗時執行，容易被漏。驗證新系統保留——對等上 fail closed，而非「正常路徑一致、失敗時行為迥異」：

- [ ] 外部服務失敗 **fallback** 與 legacy 一致
- [ ] **重試**策略（次數／backoff／放棄）與 legacy 一致
- [ ] **部分結果**處理與 legacy 一致
- [ ] **斷路器／逾時**降級與 legacy 一致

> **重要性分級**：依**生產實際觸發頻率**排序（#134「以生產為準」）。高頻生產錯誤分支無對映即硬 block；從未觸發的潛在分支仍列入但較低優先。

> 交叉參照：[full-coverage-testing](../../../../core/full-coverage-testing.md) Migration Error-Path Completeness（gap 報告 + 錯誤回應差分，R2/R4）；[behavior-snapshot](../../../../core/behavior-snapshot.md)（錯誤回應對等）。

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

## 附錄：9 軸完整性矩陣

> **來源**：XSPEC-284 Legacy Refactor Completeness Framework。「確保沒有遺漏」無法用列舉證明——你只能驗證你想得到要列舉的東西。策略＝兩條腿：(1) 從 legacy 真實 artifact **機械化推導**待辦清單；(2) **差分神諭**讓分歧自報。

每個遷移針對每一軸宣告三件事：**derive**（清單來源）· **detect**（oracle）· **gate 時機**。標為已覆蓋者對映既有 UDS 標準——勿重複造輪子。

| 軸 | Derive（清單來源） | Detect（oracle） | Gate | 覆蓋來源 |
|------|----------------------|-----------------|------|------------|
| ① Feature | route table／controller／menu／permissions | inventory diff（legacy vs new） | pre-flight | XSPEC-200 feature-manifest + `/vo-inventory`；XSPEC-206 |
| ② Behavior | curated 場景 + prod-log 擷取 | behavior-snapshot 對等 | pre-UAT | XSPEC-201 behavior-snapshot；**contract tests**（本 skill） |
| ③ **持久化語義** | DB schema 全欄語義簽核（Gate 0） | **cutover-boundary 聚合對帳** | **post-cutover** | **本 skill — Cutover 後生產資料對帳（#134）** |
| ④ 隱含規則 | cron／queue／計算欄／middleware source 掃描 | 每欄 3 問題 + 非 HTTP Devil's Advocate | pre-flight | 本 skill Gate 0（HTTP 層：XSPEC-201 Step 7）；XSPEC-284 R4（非 HTTP，未來） |
| ⑤ **背景副作用** | crontab／queue config／webhook 註冊表／郵件點 | **逐 job「存在 + 已觸發」** | pre-flight + **post-cutover** | **本 skill — 背景作業／副作用完整性** |
| ⑥ 非功能性 | legacy 效能基線 + 並發清單 | 延遲/吞吐回歸 + 隔離 | pre-UAT | XSPEC-286（拆分） |
| ⑦ 資料完整性 | schema 型別／編碼／時區清單 | 列數 + checksum + 編碼位元組 + 聚合相等 | post-migration + post-cutover | XSPEC-172 data-migration-testing；XSPEC-206；XSPEC-284 R6（未來） |
| ⑧ **狀態機** | legacy 轉移圖（enum + 更新點 + 生產序列） | **合法轉移 + 時序不變量（`created ≤ updated`）** | pre-UAT + **post-cutover** | **本 skill — 狀態機與時序對等**（XSPEC-287） |
| ⑨ **錯誤路徑** | legacy 例外階層／錯誤碼（本 skill derive + 降級） | **錯誤路徑快照 + 系統性 gap 分析 + 錯誤回應差分** | pre-UAT + cutover before/after | **本 skill — 錯誤路徑完整性**（R1/R3）+ **full-coverage-testing** Migration Error-Path Completeness（R2/R4）；XSPEC-288 |
| **跨軸** | — | **shadow run**（鏡射生產至兩端）／**replay**（重放 legacy 請求） | cutover before/after | XSPEC-284 R5（泛化 `/vo-snapshot` 對等，未來） |

每軸宣告〔清單來源 derive｜oracle detect｜gate 時機〕；標為已覆蓋者對映既有 UDS 標準，**勿重複造輪子**。未宣告的軸視為**已知遺漏風險**。本框架 P0 落地＝軸③④⑤（本 skill）；軸⑥已拆 XSPEC-286（落地於 performance-standards）、**軸⑧已落地於本 skill 狀態機與時序對等（XSPEC-287）**、**軸⑨已落地（XSPEC-288）＝本 skill 錯誤路徑完整性（R1/R3 derive + 降級）+ full-coverage-testing（R2/R4 系統性 gap 分析 + 錯誤回應差分）**。

## 參考

- 核心規範：[refactoring-standards.md](../../../../core/refactoring-standards.md)
- 相關：[contract-test-assistant](../contract-test-assistant/SKILL.md) — 遷移後持續合約驗證的策略
- 相關：[behavior-snapshot](../../../../core/behavior-snapshot.md) — Curated golden-master 對等（3-gate 軸②）
- 相關：[observability-assistant](../observability-assistant/SKILL.md) — Post-cutover oracle 的對帳排程 + 告警規則
- 框架：XSPEC-284 Legacy Refactor Completeness Framework — 9 軸 SSOT

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.4.0 | 2026-06-17 | 新增錯誤路徑完整性（軸⑨，XSPEC-288）：機械化例外/錯誤碼 derive（R1）+ 降級對等清單（R3）+ 生產頻率重要性分級；系統性 gap 分析 + 錯誤回應差分（R2/R4）委由 full-coverage-testing |
| 1.3.0 | 2026-06-17 | 新增狀態機與時序對等（軸⑧，XSPEC-287）：三方轉移圖萃取、合法轉移驗證、時序不變量、序列/冪等對等、與 XSPEC-286 軸⑥邊界 |
| 1.2.0 | 2026-06-17 | 新增 Post-Cutover 生產資料對帳、背景作業完整性驗證、9 軸完整性矩陣附錄 |
| 1.1.0 | 2026-05-26 | 新增：API 遷移合約測試章節——強制 fixture 捕獲協議、C#/TS 範本、逐欄位稽核清單（XSPEC-233 / closes #112） |
| 1.0.0 | 2026-03-24 | 初始版本 |

## AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/migrate`](../../../../skills/commands/migrate.md#ai-agent-behavior--ai-代理行為)

## 授權

CC BY 4.0
