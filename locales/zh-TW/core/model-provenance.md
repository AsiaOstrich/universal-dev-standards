---
source: ../../../core/model-provenance.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-17
source_hash: 62e6b25a38dd
status: current
---

# 模型來源政策標準

> **Language**: [English](../../../core/model-provenance.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/model-provenance.ai.yaml`
> **規格**: XSPEC-255 (cross-project/specs/XSPEC-255-model-provenance-policy.md)

## 概述

模型選擇不只是「成本 × 品質」——還有 **第三軸：模型的*來源*是否被客戶接受**（地緣政治 /
資料主權 / 法規）。受監管或地緣敏感的買家（如台灣金融/政府客戶）可能無法使用某司法管轄區的
模型；最嚴格者連 **本地跑的開源權重** 都拒用。本標準把 **模型的來源（provenance）升為一級、
可強制、可稽核的屬性**：宣告可接受來源政策、對不合規的模型選擇 **fail-closed block**、並產出
可稽核證據（「本交付未使用任何被禁來源的模型」）。

它是治理閘門家族中的 **來源（provenance）** 成員——與 `license-compliance`（XSPEC-193，
*授權*）、`verification-oracle`（XSPEC-256，*正確性*）並列——三者共用同一形狀：
**登錄/檢查 → fail-closed 閘門 → 稽核證據 → 升級給人的天花板**。三者是同一機制在三條軸上的
profile：**授權 / 來源 / 正確性**。

> **範圍**：本標準定義 *來源機制*（來源登錄、政策 schema、在每個模型選擇點的 fail-closed
> 強制、稽核證據、天花板）。**政策內容（具體的 allow/deny 清單）歸客戶或合規 pack**——那是他
> 的業務決策（DEC-075 中立機制 / DEC-063 合規姿態歸客戶）。執行引擎接線（如 VibeOps provider
> 抽象層 / 路由閘門）屬下游採用議題，不在本標準範圍。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | Model Origin Registry 為一級工件（模型 → 廠商 → 司法管轄/來源類別） | MUST |
| REQ-002 | Provenance Policy schema（allow/deny 來源、本地權重區分、mode、unknown-origin） | MUST |
| REQ-003 | 在每個模型選擇點 fail-closed 強制 | MUST |
| REQ-004 | 可稽核的來源證據（每次生成記錄模型 + 來源；合規報告） | MUST |
| REQ-005 | 示範機制的參考政策 pack（內容歸客戶/pack） | SHOULD |
| REQ-006 | 未知來源模型 → fail-closed block/升級（不靜默放行） | MUST |
| REQ-007 | 來源政策內容主權——機制中立、政策歸客戶 | SHOULD |

### REQ-001 — Model Origin Registry

每個已知模型 MUST 依 **廠商 → 司法管轄 → 來源類別** 分類。如同 `license-compliance` 的授權 DB，
此 registry 可維護、可由生態/客戶擴充。來源類別至少要能區分 western-frontier、western-open
與其他來源，政策才能針對它們表達。例：

| 模型 | 廠商 | 司法管轄 | 來源類別 |
|------|------|----------|----------|
| Claude | Anthropic | US | western-frontier |
| GPT / o-series | OpenAI | US | western-frontier |
| Gemini | Google | US | western-frontier |
| Llama | Meta | US | western-open |
| Mistral | Mistral | EU | western-open |
| Gemma | Google | US | western-open |
| DeepSeek | DeepSeek | CN | china-origin |
| MiniMax | MiniMax | CN | china-origin |
| Qwen | Alibaba | CN | china-origin |

### REQ-002 — Provenance Policy Schema

per-project/per-customer 政策 MUST 至少能表達：`allow_origins` / `deny_origins`（依來源類別）、
一個 **本地權重區分**（透過外國 API 存取的模型——資料外送——vs 同一模型的開源權重本地跑——資料
留本地但權重是外國的）、強制 `mode`（`block` / `warn` / `require_human`），以及預設 **fail-closed**
的 `unknown_origin` 行為。

```jsonc
{
  "allow_origins": ["western-frontier", "western-open"],
  "deny_origins": ["china-origin"],
  "china_local_weights": "deny",   // deny | allow_local_only —— 嚴格者連本地外國權重都 deny
  "mode": "block",                 // block | warn | require_human
  "unknown_origin": "block"        // fail-closed
}
```

### REQ-003 — Fail-Closed 強制

在 **每個模型選擇點**（per-agent config / 路由決策 / BYOK），所選模型的來源 MUST 對照啟用中的
政策。違規 MUST **fail-closed block（或升級）**——絕不靜默放行（比照 `license-compliance`
blocklist 與 `verification-oracle` 未複現 block）。強制在路由 *之前* 接線，使不被允許的來源被
換成可接受的模型，而非被使用。

### REQ-004 — 稽核證據

每次生成 MUST 記錄 **使用的模型 + 其來源類別**，使其可產出合規報告，如：*「本交付未使用任何
被禁來源的模型」*。證據接稽核 logger / hash chain、`verification-oracle` 正確性證據（XSPEC-256）
與 telemetry 白名單（DEC-066）。**此報告＝來源/治理護城河的對外證物**，也是客戶的合規證物。

### REQ-005 — 參考政策 pack

機制 SHOULD ship 少量 **參考政策 pack** 來示範它（例如一個 deny 某來源含本地權重的 pack）。
機制領域中立；**具體政策內容由客戶或合規夥伴擁有**（比照合規 domain pack 的參考 pack 定位）。

### REQ-006 — 未知來源 fail-closed

來源 **不在 registry**（未知來源）的模型 MUST NOT 被靜默允許。系統 MUST 把未知來源當成
**fail-closed block 或升級**（REQ-002 `unknown_origin`），與治理閘門「不靜默放行」規則一致。

### REQ-007 — 來源政策內容主權

來源 *機制* 領域中立（DEC-075）；*政策內容*（哪些來源可接受）歸客戶（DEC-063）。採用者
SHOULD 讓政策維持客戶範圍且隔離（參見 `license-compliance` / `verification-oracle` 的逐客戶
模式，DEC-064）。

## 原則

| ID | 原則 |
|----|------|
| P-1 | 來源是第三軸——模型選擇＝成本 × 品質 × *可接受來源* |
| P-2 | Registry First——每個模型先帶廠商/司法管轄/來源類別，政策才能作用 |
| P-3 | Fail-Closed——被禁或未知來源則 block 或升級；絕不靜默放行 |
| P-4 | 證據導向——每次生成記錄模型 + 來源；可產合規報告 |
| P-5 | 人的天花板——模糊/`require_human` 來源升級給人（DEC-076） |
| P-6 | 內容主權——機制中立，可接受來源政策歸客戶 |

## 閘門時機

```
模型選擇點（per-agent config / 路由 / BYOK）
        │
        ├─→ [來源政策檢查]  ← REQ-003 fail-closed、路由前
        │         │
        │   被禁 / 未知 ──→ block 或升級給人  ← REQ-006 / P-5 天花板
        │         │
        │   允許 ──→ 繼續；記錄模型 + 來源  ← REQ-004
        ↓
   來源稽核 / 合規報告  ← REQ-004（對外護城河證物）
```

## 與治理閘門家族的關係

| Profile | 標準 | 軸 | 登錄/檢查 | block 觸發 |
|---------|------|----|-----------|------------|
| 授權 | `license-compliance`（XSPEC-193） | legal | blocklist/allowlist/greylist | 禁用授權 |
| **來源** | **`model-provenance`（XSPEC-255）** | **source** | **模型來源 registry + 政策** | **被禁 / 未知來源** |
| 正確性 | `verification-oracle`（XSPEC-256） | correct | ground-truth registry | 未複現 / drift |

三者皆：fail-closed + 稽核證據 + 客戶覆寫上報 telemetry + 升級給人的天花板。

## 與既有標準的整合

- **`license-compliance`** — 姊妹 profile；共用 allowlist/denylist + fail-closed + 稽核 +
  覆寫骨架（評估兩者是否為同一治理子系統）。
- **`verification-oracle`** — 姊妹 profile；來源稽核證據與正確性證據並列於同一稽核/報告工件。
- **`model-selection`** — 來源是套在 `model-selection` 成本/品質 right-sizing *之前* 的約束；
  不可接受的來源先從候選集移除。
- **`security-standards`** — 資料外送顧慮（外國 API 存取）對齊資料處理/安全；本地權重區分
  （REQ-002）是資料主權控制。
- **`verification-evidence`** — 來源報告是一種驗證證據（模型 + 來源 + 無被禁來源軌跡）。

## 相關規格

- XSPEC-255 — Model Provenance Policy 完整規格（本標準來源）
- XSPEC-193 / XSPEC-256 — 姊妹治理閘門 profile（授權 / 正確性）
- DEC-075 — VibeOps 領域中立定位（中立機制 / 政策歸生態）
- DEC-063 — 法律與合規策略（受監管 / 主權敏感客戶）
- DEC-064 — 客戶 IP 隔離策略（逐客戶政策範圍）
- DEC-066 — Telemetry 驅動產品演進（稽核/telemetry 白名單）
- DEC-076 — 自助北極星（來源＝自助天花板）
- XSPEC-254 — 定位 pre-mortem（§7 #5 成本結構 / token 經濟——來源軸）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~007：模型來源 registry、來源政策 schema、在每個模型選擇點 fail-closed 強制、稽核證據、參考政策 pack、未知來源 fail-closed、政策內容主權（XSPEC-255） |
