---
source: ../../../core/verification-oracle.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-17
source_hash: 16e45bd68616
status: current
---

# 驗證 Oracle 標準

> **Language**: [English](../../../core/verification-oracle.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/verification-oracle.ai.yaml`
> **規格**: XSPEC-256 (cross-project/specs/XSPEC-256-verification-oracle.md)

## 概述

**測試 oracle（test oracle，測試神諭）** 是判斷軟體輸出是否「對」的基準來源。沒有 oracle
的軟體無法被稱為「對」——你連「它對不對」都說不出口。本標準把 **ground-truth oracle 升為
一級工件**，並把「對」從一次性的驗收狀態，變成 **每次變更都重新驗證的不變量**（DEC-077）。

它是治理閘門家族中的 **正確性（correctness）** 成員——與 `license-compliance`
（XSPEC-193，*授權*）、`model-provenance`（XSPEC-255，*來源*）並列——三者共用同一形狀：
**登錄/檢查 → fail-closed 閘門 → 稽核證據 → 升級給人的天花板**。三者是同一機制在三條軸上的
profile：**授權 / 來源 / 正確性**。

> **範圍**：本標準定義 *正確性 oracle 機制*（登錄、分級、閘門時機、再驗證、證據、升級）以及
> 它產出的驗收證據。**oracle 內容（正確答案）歸客戶**——那是他的業務、他的 ground truth
> （DEC-075 中立機制 / DEC-063 產出物責任歸客戶）。執行引擎接線（如 VibeOps pipeline 閘門）
> 屬下游採用議題，不在本標準範圍。

## Oracle-ability 光譜

並非每個需求都有現成 oracle。依「oracle 現成度」對每個高賭注功能分級——這驅動成本、beachhead
選案，以及何時必須由人介入。

| 級 | oracle 長相 | 現成度 / 成本 |
|----|-------------|---------------|
| 1 | 舊系統的已知正確輸出（legacy） | 最現成、最便宜（可證明等價 parity） |
| 2 | 一批手算 / 既有正確輸出 | 現成（複現 + 規模化） |
| 3 | 法規 / 公式（有規則、缺範例） | 需共同推導 worked examples + 簽核（ATDD） |
| 4 | 模糊需求（oracle 得從訪談「挖」出來） | 最貴——即「翻譯題」 |

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | Ground-truth registry 為一級工件、綁定 AC | MUST |
| REQ-002 | 對每個高賭注功能標 oracle-ability 分級（1–4 級） | MUST |
| REQ-003 | 出貨前 fail-closed 驗證閘門 | MUST |
| REQ-004 | 每次變更持續再驗證（正確性即 CI 不變量） | MUST |
| REQ-005 | 可稽核的驗證證據（N/N 複現、無 drift、軌跡） | MUST |
| REQ-006 | 自助前沿天花板——無 oracle / 不可驗高賭注則升級 | MUST |
| REQ-007 | oracle 內容主權——內容歸客戶、機制中立 | SHOULD |

### REQ-001 — Ground-Truth Registry

客戶提供的正確答案成為一級工件。每筆案例含 **輸入情境 + 期望正確輸出**，並 **綁定到它所證明
的驗收條件**（`acceptance-criteria-traceability`）。機制至少 MUST 支援數值與結構化輸出比對，
並支援逐欄豁免（如對 timestamps/ids 的 `ignore_fields`）。期望輸出是 **正確結果**，而非僅
「端點回 HTTP 200」。

### REQ-002 — Oracle-ability 分級

每個高賭注功能 MUST 標記其 oracle 級別（1–4 級，見上表）。**第 4 級（需挖）功能 MUST 有一個
定義好的掛接點**，接到 oracle 製造流程（訪談 / Prototype Probe；XSPEC-252），把貴端往 1–2 級
拉。beachhead 選案 SHOULD 優先挑 oracle 已現成的 1–2 級功能。

### REQ-003 — Fail-Closed 驗證閘門（出貨前）

系統進入 UAT/出貨前，MUST **精確複現 registry 全部 ground-truth 案例**。未複現 MUST
**block 出貨或升級**——絕不靜默放行（比照 `license-compliance` blocklist 與 `model-provenance`
denylist）。閘門接既有 reviewer/QA 閘門與稽核 logger。

### REQ-004 — 持續再驗證（正確性即 CI 不變量，本標準的靈魂）

**每次變更 / 重生成都 MUST 重跑** 全部 oracle 套件，把「對」變成 **CI 級不變量**，而非一次性
驗收。**drift**（曾經對、改完不對）MUST 被偵測並 **block**。這是 DEC-077「改了還對、且能證明
一直都對」的機制化——也是「生成一次不驗證」的對手做不到的差異點。

### REQ-005 — 稽核證據

每次驗證 MUST 產出可稽核報告：*「本交付複現 N/N 筆 ground-truth、無 drift、附軌跡」*。它接
稽核 logger / hash chain、`model-provenance` 來源證據（XSPEC-255）與 telemetry 白名單
（DEC-066）。**此報告＝正確性/治理護城河的對外證物**，也是客戶的合規證物。

### REQ-006 — 自助前沿天花板

**無 oracle**（測不出對錯）或 **高賭注但不可驗** 之處，系統 MUST NOT 讓自助靜默通過。MUST
標示「此處需人裁決 / 需補 oracle」並 **升級**（DEC-076 天花板）。正確性定義與驗收簽核是 **人
（客戶 / 法遵 / 監管）的判斷行為**——產品強制的治理閘門，非顧問陷阱。

### REQ-007 — oracle 內容主權

驗證 *機制* 領域中立（DEC-075）；*正確答案* 歸客戶（DEC-063）。採用者 SHOULD 讓 registry
維持客戶範圍且隔離（參見 `model-provenance` / `license-compliance` 的逐客戶 salt 模式，
DEC-064）。

## 原則

| ID | 原則 |
|----|------|
| P-1 | Oracle First——無 oracle 即無「對」；宣稱正確前先分級 oracle-ability |
| P-2 | 被維持的不變量——每次變更重新驗證；drift 是 block 事件（DEC-077） |
| P-3 | Fail-Closed——未複現則 block 或升級；絕不靜默放行 |
| P-4 | 證據導向——每個判定附可複現軌跡（N/N + diff + 稽核 id） |
| P-5 | 人的天花板——不可驗高賭注升級給人（DEC-076） |
| P-6 | 內容主權——機制中立，正確答案歸客戶 |

## 閘門時機

```
規格(SDD) → 生成 → [oracle 驗證閘門]  ← REQ-003 fail-closed、出貨前
                          │
        每次變更 ─────────┤ → 重跑全部 oracle 套件  ← REQ-004 drift block
                          ↓
                  稽核證據報告  ← REQ-005（對外護城河證物）
                          │
   無 oracle / 不可驗 ─────┴──→ 升級給人  ← REQ-006 天花板
```

## 與治理閘門家族的關係

| Profile | 標準 | 軸 | 登錄/檢查 | block 觸發 |
|---------|------|----|-----------|------------|
| 授權 | `license-compliance`（XSPEC-193） | legal | blocklist/allowlist/greylist | 禁用授權 |
| 來源 | model-provenance（XSPEC-255，規劃中的姊妹） | source | 模型來源政策 | 禁用來源 |
| **正確性** | **`verification-oracle`（XSPEC-256）** | **correct** | **ground-truth registry** | **未複現 / drift** |

三者皆：fail-closed + 稽核證據 + 客戶覆寫上報 telemetry + 升級給人的天花板。

## 與既有標準的整合

- **`acceptance-criteria-traceability`** — oracle 案例綁 AC；複現成為 AC 覆蓋的一種。
- **`verification-evidence`** — oracle 報告是一種驗證證據（N/N 複現 + 無 drift + 軌跡）。
- **`test-governance`** — oracle 套件是受治理的測試政策；閘門是受治理的閘門。
- **`behavior-snapshot`** — parity/snapshot 閘門是 REQ-003/REQ-004 在「重構/移植」情境的實例
  （snapshot 本身就是一種 oracle，可共用骨架）。

## 相關規格

- XSPEC-256 — Verification Oracle 完整規格（本標準來源）
- DEC-077 — 對＝被維持的不變量（母決策）
- DEC-075 — VibeOps 領域中立定位（中立機制）
- DEC-076 — 自助客製北極星（oracle＝自助天花板）
- DEC-063 — 法律與合規策略（產出物責任歸客戶 / 高賭注）
- DEC-066 — Telemetry 驅動產品演進（稽核/telemetry）
- XSPEC-193 / XSPEC-255 — 姊妹治理閘門 profile（授權 / 來源）
- XSPEC-252 — Domain pack 需求翻譯（oracle 製造、第 4 級掛接）
- XSPEC-188 — UAT Ship 決策儀表板（業務級 UAT 錨點）
- XSPEC-201 — 重構/移植完整性（behavior-snapshot＝oracle 既有實例）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~007：ground-truth registry、oracle-ability 分級、fail-closed 閘門、持續再驗證、稽核證據、自助天花板、內容主權（XSPEC-256） |
