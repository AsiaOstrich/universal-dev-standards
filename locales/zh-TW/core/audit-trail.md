---
source: ../../../core/audit-trail.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-07-16
source_hash: cd5490e92df9
status: current
---

# 稽核軌跡標準

> **Language**: [English](../../../core/audit-trail.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/audit-trail.ai.yaml`
> **規格**: XSPEC-066（cross-project/specs/XSPEC-066-uds-compliance-audit-pack.md）

## 概觀

本標準定義在處理敏感資料、金融交易、權限變更與合規相關操作的系統中，如何建立、
儲存與管理**不可變稽核軌跡（immutable audit trail）**。涵蓋必備事件類型、稽核紀錄
結構、防篡改要求、保留期、查詢／匯出能力，以及 SIEM 整合。設計目標為滿足 SOC 2、
ISO 27001、GDPR 與金融法規要求。

本標準屬於**合規與稽核標準包**（XSPEC-066）。稽核軌跡是 EU AI Act 可稽核性
（DEC-041）與 VibeOps Governance Agent 介入紀錄（DEC-042）的核心載體，並與治理閘門
家族——`license-compliance`（XSPEC-193）、`verification-oracle`（XSPEC-256）、
`model-provenance`（XSPEC-255）——組合：這些閘門的裁決會寫入符合本標準的稽核軌跡。

> **範圍**：本標準定義「該稽核什麼」、「紀錄結構」以及「不可變／保留／存取」規則。
> 具體儲存引擎（S3 Object Lock、append-only DB、雜湊鏈函式庫）與 SIEM 產品屬採用者
> 的選擇，不在本標準範圍內。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | 必備可稽核事件類型（認證、授權、資料存取、設定、金融、合規） | MUST |
| REQ-002 | 稽核紀錄結構（必備 + 建議欄位） | MUST |
| REQ-003 | 不可變性與防篡改（append-only + 雜湊鏈） | MUST |
| REQ-004 | 各類別的稽核日誌保留期 | MUST |
| REQ-005 | 查詢與匯出能力（可篩選、可匯出、查詢動作本身亦記錄） | MUST |
| REQ-006 | SIEM 整合與告警 | SHOULD |

### REQ-001 — 必備可稽核事件類型

系統 MUST 無例外地為下列事件記錄稽核紀錄：(1) **認證**——登入成功／失敗、登出、
MFA 事件、密碼變更；(2) **授權**——存取核准／拒絕、權限提升、角色變更；
(3) **資料存取**——TIER-1 與 TIER-2 PII（見 `pii-classification`）的讀／寫／刪、
大量資料匯出；(4) **設定變更**——系統設定、安全政策變更、使用者／角色管理；
(5) **金融交易**——付款處理、退款、餘額變動；(6) **合規相關操作**——同意變更、
資料刪除請求、法律保留（legal hold）。

### REQ-002 — 稽核紀錄結構

每筆稽核紀錄 MUST 包含：`event_id`（UUID v4）、`event_type`（列舉字串）、
`timestamp`（含毫秒的 ISO 8601 UTC）、`actor_id`（使用者或服務帳號）、`actor_ip`
（使用者操作時）、`resource_type`、`resource_id`、`action`、`outcome`（成功／失敗）
與 `environment`（production／staging）。SHOULD 另含 `session_id`、用於關聯的
`request_id`、變更操作的前後狀態，以及地理區域。

### REQ-003 — 不可變性與防篡改

稽核日誌 MUST 寫入 **append-only** 儲存體，防止應用層主體修改或刪除。每筆紀錄
MUST 包含前一筆紀錄的密碼學雜湊（**鏈接**）以偵測篡改。稽核儲存體的寫入權限
MUST 僅限稽核服務本身——任何工程師或應用服務皆不得直接寫入。日誌完整性 MUST
可隨選驗證。

### REQ-004 — 稽核日誌保留期

稽核日誌 MUST 依類別至少保留：認證／授權——熱儲存 1 年、冷儲存 6 年（SOC 2 /
ISO 27001）；金融交易——7 年（金融法規）；PII 存取——3 年；設定變更——3 年；
其餘稽核事件——1 年。在保留期屆滿前刪除稽核紀錄為 **PROHIBITED**。接近到期的
日誌 MUST 自動封存至冷儲存。

### REQ-005 — 稽核日誌查詢與匯出能力

稽核系統 MUST 支援以 `event_type`、`actor_id`、`resource_id`、時間範圍與 `outcome`
篩選。結果 MUST 可匯出為 JSON 與 CSV。回傳 PII 的查詢 MUST 自身亦記錄為稽核事件
（查詢的查詢）。稽核資料 MUST 在請求後 4 小時內供獲授權的合規／安全團隊存取，
並在 24 小時內供監管機關存取。

### REQ-006 — SIEM 整合與告警

稽核日誌 SHOULD 即時轉送至 SIEM 系統。SIEM SHOULD 具備自動偵測規則：暴力登入樣態
（5 分鐘內 >5 次失敗）、營業時間外的權限提升、大量 PII 匯出（1 小時內 >1000 筆）、
以及來自新地理區域的存取。高嚴重度偵測 SHOULD 觸發 on-call 通知。

## 與既有標準的整合

- **`pii-classification`**——資料存取稽核以所觸及欄位的 PII 等級為依據（TIER-1／
  TIER-2 讀取為必備稽核事件）。
- **`logging-standards`**——稽核紀錄是凌駕一般應用日誌之上、獨立且不可變的類別；
  `pii-classification` 的遮罩規則仍適用。
- **`license-compliance` / `verification-oracle` / `model-provenance`**——治理閘門
  裁決（封鎖／override）會寫入稽核軌跡。
- **`execution-history`**——一般執行紀錄無法取代合規等級、防篡改的稽核軌跡。

## 相關規格

- XSPEC-066 — UDS 合規與稽核標準包（本標準來源）
- DEC-041 — EU AI Act 2026 合規（稽核軌跡作為可稽核性載體）
- DEC-042 — Guardian / Governance Agent 模式（介入可稽核性）
- DEC-020 — VibeOps 商業雙授權（授權合規稽核）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~006：事件類型、紀錄結構、不可變性／防篡改、保留期、查詢／匯出、SIEM 整合（XSPEC-066） |
