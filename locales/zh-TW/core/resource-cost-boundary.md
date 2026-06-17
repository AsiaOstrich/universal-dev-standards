---
source: ../../../core/resource-cost-boundary.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-17
source_hash: a9be6a420041
status: current
---

# 資源／成本邊界宣告標準

> **Language**: [English](../../../core/resource-cost-boundary.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/resource-cost-boundary.ai.yaml`
> **規格**: XSPEC-277 (cross-project/specs/XSPEC-277-resource-cost-boundary-standard.md)

## 概述

agentic / LLM 執行單元（pipeline run、agent、role）的資源消耗 **往往是隱性的**：token 用量、
迴圈/迭代次數、重試次數、單次成本上限、wall-clock、呼叫頻率。當這些邊界未被 **顯式宣告與
強制** 時，失控迴圈與 token 燒錢就是已知的 LLM-native 失敗模式——**cost burn**。

本標準把 **資源/成本邊界做成顯式、機器可讀、fail-closed 的宣告**。任何 LLM 執行單元 MUST
宣告其資源 budget；執行期 breach MUST 依宣告 fail-closed。它是邊界物質化（XSPEC-276）的
**成本維度**：UDS 唯一沒有對應標準、又夠具體可做成 AI-executable 的那一維——故抽出為窄標準，
而非塞進更廣（且重疊）的邊界框架。

> **範圍**：本標準定義 *宣告機制*（budget 分類法、機器可讀的 `resource_budget:` 區塊、
> fail-closed 閘門）。**budget 數值歸採用者/客戶**——那是專案決策。它規範的是「邊界*有沒有*
> 被宣告與強制」，而非「該設*多少*數字」。執行引擎接線（如 VibeOps 主動成本治理執行器）屬
> 下游採用議題；本標準是「宣告要哪些邊界」那一半，XSPEC-285 是「強制／治理」那一半。

## 為何要做成標準（而非逐單元設定）

VibeOps 已有成本機制，但 **分散且未標準化**——各自是點狀機制，沒有一份標準說「每個 LLM
執行單元都 MUST 宣告其資源邊界、且 breach MUST fail-closed」。新單元（新 agent/role）很容易
漏掉某個 budget → 無上限。本標準把這些點狀機制收斂到一份宣告。

| 既有機制（成為參考實作）| budget 類別 |
|---|---|
| orchestrator quality profile `max_retries` / `max_retry_budget_usd`（per-task fix-loop）| retry / cost_usd |
| BudgetGuard / PoC abort `max_cost_per_session_usd` / `min_cache_hit_ratio`（XSPEC-191）| cost_usd / rate |
| Pareto Evolution Gate token-cost 維度（DEC-024）| token / cost_usd |
| agent-loop `maxToolRounds` / `maxTotalTokens` | iteration / token |

## 資源 Budget 分類法

| 類別 | 邊界 | 典型 breach |
|------|------|-------------|
| `token` | input / output / total token 上限 | prompt/輸出爆量 |
| `iteration` | 迴圈 / 迭代 / tool-round 上限 | 失控迴圈 |
| `retry` | 重試上限 | 無上限重試 |
| `cost_usd` | 單次 / 單 run / 單 session 成本天花板 | 靜默燒預算 |
| `wallclock` | 逾時 | 卡死的 run |
| `rate` | 呼叫頻率 | 呼叫風暴 |

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | 資源 budget 分類法——從一組標準類別宣告邊界 | MUST |
| REQ-002 | 機器可讀的 `resource_budget:` 宣告（類別 + 上限 + breach 行為）| MUST |
| REQ-003 | fail-closed 強制閘門（未宣告→warn/block；執行期 breach→abort）| MUST |
| REQ-004 | 既有機制收斂為參考實作（不重造）| SHOULD |
| REQ-005 | budget 數值主權——機制標準化、數值歸採用者 | SHOULD |

### REQ-001 — 資源 Budget 分類法

每個 LLM 執行單元的資源邊界 MUST 能從一組標準類別表達：`token`（input/output/total）、
`iteration`（迴圈/迭代/tool-round 上限）、`retry`（重試上限）、`cost_usd`（單次 / 單 run /
單 session 天花板）、`wallclock`（逾時）、`rate`（呼叫頻率）。單元不必宣告每個類別，但它**為
安全而依賴**的類別 MUST 被宣告（被依賴卻無上限的類別＝違規）。

### REQ-002 — 機器可讀宣告

`resource_budget:` 區塊 MUST 可被宣告（內嵌於 plan / agent / role config），每筆含 **類別 +
上限值 + breach 行為**（`warn` / `abort`）。它是生成器/runtime 可讀的一級工件——非散落設定、
非事後 review 註記。

```yaml
resource_budget:
  - kind: cost_usd        # 單 run 成本天花板
    scope: per_run
    limit: 3.00
    on_breach: abort
  - kind: iteration       # tool-round / 迴圈上限
    limit: 60
    on_breach: abort
  - kind: retry
    limit: 3
    on_breach: warn
  - kind: token
    scope: total
    limit: 400000
    on_breach: abort
```

### REQ-003 — Fail-Closed 強制閘門

quality gate `check-resource-budget` MUST：(a) 標出任何 **未宣告** budget 的 LLM 執行單元——
預設 `warn`、嚴格模式 `block`；(b) 執行期 **breach** 時依宣告的 `on_breach` fail-closed
（`abort` 中止該單元、`warn` 記錄並續行）。比照 `capability-declaration`（XSPEC-037）與治理
閘門家族的 fail-closed 姿態——絕不靜默放行無上限。

### REQ-004 — 收斂既有機制

既有點狀機制（orchestrator `max_retries` / `max_retry_budget_usd`、XSPEC-191 BudgetGuard、
DEC-024 Pareto token gate、XSPEC-270 right-sizing router）SHOULD **對映為本標準的參考實作**——
統一、不重造。新單元繼承「宣告」習慣，而非重新發明 budget 旋鈕。

### REQ-005 — Budget 數值主權

宣告 *機制* 已標準化；*budget 數值*（實際天花板）歸採用者/客戶（專案/經濟決策）。標準規範的
是「邊界*有沒有*被宣告與強制」，而非「該設*多少*數字」。

## 原則

| ID | 原則 |
|----|------|
| P-1 | 邊界顯式——資源 budget 被宣告，而非藏在某人腦中 |
| P-2 | 機器可讀——生成器/runtime 可一級讀取 `resource_budget:` 區塊 |
| P-3 | Fail-Closed——被依賴卻未宣告、或執行期 breach，則 block/abort；絕不靜默 |
| P-4 | 不重造——既有點狀機制收斂為參考實作 |
| P-5 | 數值主權——機制標準化，天花板數值歸採用者 |

## 閘門時機

```
plan / agent / role config（resource_budget: 區塊）
        │
        ├─→ [check-resource-budget — 宣告檢查]  ← REQ-003(a)、run 前
        │         被依賴卻未宣告 ──→ warn（嚴格：block）
        ↓
   run（token / iteration / retry / cost / wallclock / rate 量測）
        │
        └─→ 執行期 breach ──→ 依 on_breach fail-closed  ← REQ-003(b)（abort / warn）
                                        │
                                  記錄 breach 供稽核 / 成本治理執行器（XSPEC-285）
```

## 與鄰近標準的邊界（admission 條件 3）

本標準 **只收成本/資源維度**，以避開讓更廣的邊界框架（XSPEC-276）無法進標準庫的重疊問題。

| 鄰近標準 | 它的角度 | 為何不同（<30% 重疊）|
|---|---|---|
| `performance-standards` | 延遲 / 吞吐 *目標* | 目標，非 fail-closed 成本天花板 |
| `model-selection` | 選模型 *tier* | tier 選擇，非 budget 強制 |
| `capability-declaration`（XSPEC-037）| 顯式能力 + fail-closed | 能力面，非資源 budget |

## 與既有標準的整合

- **`performance-standards`** — performance 設延遲/吞吐目標；本標準設 fail-closed 資源天花板。
  鄰接、互補、不同。
- **`model-selection`** — right-sizing 選模型 tier；`cost_usd` breach 可 *驅動* 降級
  （XSPEC-270 router），但 budget 宣告是本標準的職責。
- **`test-governance`** — `check-resource-budget` 是受治理閘門；budget 宣告是受治理政策。
- **`verification-evidence`** — breach/no-breach 的 run 報告是一種驗證證據（budget 守住 + 軌跡）。

## 相關規格

- XSPEC-277 — Resource / Cost Boundary 宣告標準完整規格（本標準來源）
- XSPEC-276 — LLM-native 邊界物質化（母透鏡；成本為抽出的維度）
- XSPEC-285 — VibeOps 主動成本治理（本標準的強制/執行器面）
- XSPEC-191 — Unit-economics PoC / BudgetGuard（參考實作）
- XSPEC-270 — 模型 right-sizing router（成本驅動降級）
- XSPEC-037 — Capability declaration（本標準比照的 fail-closed 姿態）
- DEC-024 — Pareto evolution token-cost gate（參考實作）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~005：資源 budget 分類法、機器可讀的 `resource_budget:` 宣告、fail-closed `check-resource-budget` 閘門、既有機制收斂為參考實作、budget 數值主權（XSPEC-277） |
