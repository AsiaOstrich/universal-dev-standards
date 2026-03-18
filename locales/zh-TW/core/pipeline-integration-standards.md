---
source: ../../../core/pipeline-integration-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-18
status: current
---

# Pipeline 整合標準

> **語言**: [English](../../../core/pipeline-integration-standards.md) | 繁體中文

**適用範圍**: 所有使用自動化開發 Pipeline 的軟體專案
**Scope**: universal

---

## 概述

Pipeline 整合標準定義自動化開發 Pipeline 應如何讀取專案設定、執行開發階段，以及根據專案情境調整行為。本標準為 AI 輔助及 CI/CD 驅動的開發工作流程提供一套與語言、框架無關的通用模型。

## 參考資料

| 標準／來源 | 內容 |
|-----------|------|
| ISO/IEC 12207 | 軟體生命週期流程 |
| ISO/IEC 15504 (SPICE) | 流程評估 |
| Continuous Delivery（Jez Humble） | Pipeline 設計原則 |
| DORA Metrics | 部署頻率、前置時間、MTTR、變更失敗率 |

---

## 設定契約

### UDS 設定區塊

使用自動化 Pipeline 的專案必須在標準設定區塊中宣告其 Pipeline 偏好。設定區塊通常放置於專案的 manifest 檔案中（例如 `manifest.json`、`uds.config.json` 或等效檔案）。

### 標準開關名稱

| 開關 | 型別 | 預設值 | 描述 |
|------|------|--------|------|
| `autoSpecGeneration` | boolean | false | 自動從 PRD／使用者故事產生 SDD 規格 |
| `autoDerive` | boolean | false | 規格核准後自動衍生 BDD／TDD／ATDD |
| `autoTDD` | boolean | false | 衍生完成後自動進入 TDD RED 階段 |
| `autoCheckin` | boolean | false | 所有品質關卡通過後自動提交 |
| `autoBatch` | boolean | false | 自動批次累積待提交的變更 |

### 開關語意

每個開關控制特定的 Pipeline 行為：

| 開關 | 開啟時 | 關閉時 |
|------|--------|--------|
| `autoSpecGeneration` | Pipeline 從輸入產生規格草稿並提交審查 | 需手動建立規格 |
| `autoDerive` | 規格核准後 Pipeline 自動執行衍生（BDD／TDD／ATDD） | 透過指令手動衍生 |
| `autoTDD` | 衍生完成後 Pipeline 設定 RED 狀態並建立測試骨架 | 開發者手動進入 TDD |
| `autoCheckin` | 所有關卡通過（測試、lint、覆蓋率）後 Pipeline 自動提交 | 開發者手動提交 |
| `autoBatch` | Pipeline 累積變更並在達到閾值時合併 | 每次變更個別提交 |

### 設定範例

```json
{
  "pipeline": {
    "autoSpecGeneration": true,
    "autoDerive": true,
    "autoTDD": true,
    "autoCheckin": false,
    "autoBatch": false,
    "context": "greenfield"
  }
}
```

### 設定讀取規則

1. **安全預設值**：所有開關預設為 OFF（手動模式）
2. **明確宣告**：Pipeline 必須在讀取設定後才能確定開關狀態，不得假設
3. **執行期覆寫**：CLI flag 或環境變數可覆寫檔案式設定
4. **驗證**：Pipeline 在執行前必須驗證設定值

---

## Pipeline 階段模型

### 標準六階段 Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  1.PLAN  │───▶│  2.SPEC  │───▶│ 3.DERIVE │───▶│ 4.BUILD  │───▶│ 5.REVIEW │───▶│6.CHECKIN │
│ 需求分析  │    │ 規格撰寫  │    │ 測試衍生  │    │ 實作建置  │    │ 審查驗證  │    │ 提交簽入  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### 階段定義

| 階段 | 輸入 | 輸出 | 品質關卡 |
|------|------|------|---------|
| **Plan（規劃）** | PRD、使用者故事、需求 | 結構化需求文件 | 需求已審查 |
| **Spec（規格）** | 需求 | 含驗收條件的 SDD 規格 | 規格已核准 |
| **Derive（衍生）** | 已核准的規格 | BDD 情境、TDD 骨架、ATDD 表格 | 1:1 驗收條件對應已驗證 |
| **Build（建置）** | 測試骨架 ＋ 規格 | 實作程式碼 | 測試通過（RED→GREEN） |
| **Review（審查）** | 實作 ＋ 測試 | 審查意見 | 審查已核准 |
| **Checkin（簽入）** | 已核准的變更 | 已提交的程式碼 | 所有品質關卡通過 |

### 階段相依性

- 每個階段的輸出為下一階段的輸入
- 未經明確設定不得跳過任何階段
- 品質關卡失敗必須阻擋進入下一階段

---

## 開發情境分類

### 情境類型

| 情境 | 描述 | 典型場景 |
|------|------|---------|
| **Greenfield** | 全新專案或功能，無既有程式碼 | 新增模組、新服務、新產品 |
| **Brownfield** | 需修改的既有程式碼庫 | 為舊有程式碼新增功能、重構 |
| **Adhoc** | 小型、獨立的變更 | Bug 修復、設定變更、Hotfix |

### 情境策略矩陣

| 階段 | Greenfield | Brownfield | Adhoc |
|------|-----------|------------|-------|
| **Plan** | 完整需求分析 | 優先進行影響分析 | 快速評估 |
| **Spec** | 完整 SDD | Delta SDD（僅變更部分） | 可選（重大變更才需要） |
| **Derive** | 完整衍生 | 針對性衍生 | 跳過（除非複雜） |
| **Build** | 從零開始 TDD | 修改既有程式碼 ＋ 新測試 | 直接修復 |
| **Review** | 完整審查 | 聚焦於變更的審查 | 快速審查 |
| **Checkin** | 標準簽入 | 標準簽入 | 標準簽入 |

### 情境自動偵測啟發式規則

Pipeline 應使用下列訊號自動偵測情境：

| 訊號 | Greenfield 指標 | Brownfield 指標 | Adhoc 指標 |
|------|----------------|----------------|-----------|
| 檔案數量 | 無檔案或極少檔案 | 已建立的程式碼庫 | 不適用 |
| 變更範圍 | 新目錄／模組 | 修改既有檔案 | 變更 1–3 個檔案 |
| 測試覆蓋率 | 無既有測試 | 既有測試套件 | 既有測試已涵蓋該區域 |
| 規格是否存在 | 無規格 | 既有規格 | 可能有也可能沒有 |

### 情境覆寫

開發者可在設定中明確指定情境：

```json
{
  "pipeline": {
    "context": "brownfield"
  }
}
```

或透過 CLI flag 指定：
```bash
pipeline run --context=greenfield
```

---

## 整合驗證

### Pipeline 實作者檢查清單

實作本標準的整合者必須驗證以下項目：

| 檢查項目 | 要求 | 驗證方式 |
|---------|------|---------|
| 設定讀取 | Pipeline 從設定中讀取所有開關 | 單元測試：模擬設定 → 驗證行為 |
| 預設值處理 | 未設定的開關預設為 OFF | 單元測試：空設定 → 手動模式 |
| 階段執行 | 6 個階段依序執行 | 整合測試：完整 Pipeline 執行 |
| 關卡強制執行 | 失敗的關卡阻擋下一階段 | 整合測試：注入失敗 → 驗證阻擋 |
| 情境感知 | Pipeline 根據情境類型調整 | 整合測試：各情境 → 驗證階段 |
| 覆寫支援 | CLI flag 覆寫檔案設定 | 單元測試：檔案 ＋ flag → flag 優先 |

### 驗證規則

1. **設定 Schema 驗證**：對照已知開關名稱進行驗證；對未知鍵值發出警告
2. **開關型別安全**：所有開關必須為 boolean；拒絕非 boolean 值
3. **情境列舉值**：情境必須為以下其中之一：`greenfield`、`brownfield`、`adhoc`
4. **階段完整性**：Pipeline 必須回報哪些階段已執行、哪些已跳過

---

## 反模式

| 反模式 | 影響 | 正確做法 |
|--------|------|---------|
| 硬編碼 Pipeline 行為 | 無法適應專案需求 | 在執行期讀取設定 |
| 忽略情境類型 | 執行錯誤的階段 | 偵測或讀取情境設定 |
| 跳過品質關卡 | 有問題的程式碼進入程式碼庫 | 在每個階段強制執行關卡 |
| 全有或全無的自動化 | 使用者完全迴避 Pipeline | 允許逐開關的細粒度控制 |
| 靜默跳過階段 | 失去可追蹤性 | 記錄並回報所有跳過決策 |

---

## 最佳實踐

### 應做事項

- ✅ 在執行任何階段前先讀取設定
- ✅ 所有開關預設為 OFF（安全預設值）
- ✅ 在 Pipeline 啟動時記錄哪些開關為啟用狀態
- ✅ 回報階段執行狀態（已執行／已跳過／失敗）
- ✅ 允許逐階段的細粒度開關控制
- ✅ 在使用前驗證設定 Schema
- ✅ 支援透過 CLI 覆寫設定

### 不應做事項

- ❌ 未讀取設定即假設開關狀態
- ❌ 靜默跳過階段而不記錄
- ❌ 忽略品質關卡失敗
- ❌ 硬編碼 Pipeline 行為
- ❌ 混用情境策略（例如：Greenfield 規格 ＋ Adhoc 建置）

---

## 相關標準

- [規格驅動開發（Spec-Driven Development）](spec-driven-development.md) — Spec 階段工作流程
- [正向衍生標準（Forward Derivation Standards）](forward-derivation-standards.md) — Derive 階段實作
- [簽入標準（Check-in Standards）](checkin-standards.md) — Checkin 階段品質關卡
- [變更批次標準（Change Batching Standards）](change-batching-standards.md) — 簽入前的批次合併
- [驗收條件追蹤（Acceptance Criteria Traceability）](acceptance-criteria-traceability.md) — 跨階段驗收條件追蹤

---

## 版本歷程

| 版本 | 日期 | 變更內容 |
|------|------|---------|
| 1.0.0 | 2026-03-18 | 初始版本 — 設定契約、六階段 Pipeline 模型、情境分類 |
