---
source: ../../../core/data-contract.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-07-23
source_hash: 013be9325b53
status: current
---

# Data Contract 標準

> **Language**: [English](../../../core/data-contract.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/data-contract.ai.yaml`
> **規格**: XSPEC-068（cross-project/specs/XSPEC-068-uds-data-engineering-pack.md）

## 概觀

本標準定義資料生產者與消費者之間如何建立、版本化與強制 **data contract**。data
contract 是一份正式協議，明定某資料集或資料流的 schema、品質保證、SLA 與所有權。
涵蓋 contract 規格格式、freshness 與品質 SLO、破壞性變更治理、消費者註冊／通知，
以及自動化 contract 測試。可降低因未被發現的上游變更所致的管線失敗。

本標準屬於**資料工程標準包**（XSPEC-068），並為既有 `contract-test-assistant`
skill 的**錨點標準**（資料側 contract）。

> **範圍**：本標準定義 *contract 產物*（格式、SLO、治理、註冊）。具體資料品質引擎
> （Great Expectations）與目錄（DataHub/Amundsen）屬採用者的選擇。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | Data contract 規格格式 | MUST |
| REQ-002 | 資料品質 SLO | MUST |
| REQ-003 | Contract 版本化與破壞性變更治理 | MUST |
| REQ-004 | 自動化 contract 測試 | MUST |
| REQ-005 | 消費者註冊與通知 | MUST |
| REQ-006 | Contract 可發現性 | SHOULD |

### REQ-001 — Data Contract 規格格式

每個共享資料集或資料流 MUST 具備機器可讀 YAML 檔（`data-contract.yaml`）的 data
contract，與生產者程式碼一同提交版控。contract MUST 包含：`contract_id`、
`version`、`owner`（team + 聯絡窗口）、description、`schema`（欄位名、型別、
nullability）、`data_quality` SLO（completeness、freshness、uniqueness）、`sla`
（交付時間）與消費者清單。

### REQ-002 — 資料品質 SLO

每個 contract MUST 定義跨下列維度的明確資料品質 SLO：**completeness**（必填欄位
非 null 比例 ≥ 門檻）、**freshness**（來源後 N 分鐘／小時內更新）、**uniqueness**
（關鍵欄位 distinct 比例）與 **validity**（符合所定義格式／範圍的比例）。品質 SLO
違規 MUST 同時告警生產者與已註冊消費者。

### REQ-003 — Contract 版本化與破壞性變更治理

contract MUST 使用語意版本。**PATCH**（向後相容新增、文件）僅需生產者核准。
**MINOR**（新可選欄位、放寬限制）需提前 7 天通知消費者。**MAJOR**（欄位移除、
型別／語意變更）需消費者核准，且在所有已註冊消費者確認就緒前 MUST NOT 部署。

### REQ-004 — 自動化 Contract 測試

contract 合規 MUST 自動驗證。生產者 MUST 在每次管線執行時跑 contract 測試，以所
宣告 schema 與品質 SLO 驗證輸出：schema 一致性（無非預期 null、型別正確）、
freshness 在 SLO 窗內、關鍵欄位 uniqueness，以及 row count 在範圍內。contract 測試
失敗 MUST 中止管線並呼叫（page）資料 owner。

### REQ-005 — 消費者註冊與通知

消費共享資料集的團隊 MUST 在生產者的 `data-contract.yaml` 中註冊為消費者，含團隊
名稱、聯絡方式、用例描述與所消費欄位。已註冊消費者 MUST 在下列情況收到自動通知：
contract 被修改、品質 SLO 被違反、資料集被棄用，或計劃性維護將影響可用性。

### REQ-006 — Contract 可發現性

組織內所有 data contract SHOULD 可透過中央資料目錄發現，目錄 SHOULD 提供：依
team／domain 的可搜尋索引、目前健康狀態（SLO 合規）、schema 瀏覽、血緣視覺化
（哪些管線生產／消費各資料集），以及自助式消費者註冊工作流程。

## 與既有標準的整合

- **`contract-test-assistant`（skill）**——本標準為其資料側錨點；該 skill 的 data
  contract 指引引用這些需求。
- **`data-pipeline`**——管線在每次執行時跑 contract 測試（REQ-004）。
- **`schema-evolution`**——MAJOR contract 版本對應由 expand-contract 治理的破壞性
  schema 變更。
- **`audit-trail` / `pii-classification`**——contract 保留與欄位層級敏感度對齊合規
  標準包（XSPEC-066）。

## 相關規格

- XSPEC-068 — UDS 資料工程標準包（本標準來源）
- XSPEC-066 — 合規與稽核標準包（保留、PII 分級）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~006：規格格式、品質 SLO、版本化／治理、自動化測試、消費者註冊、可發現性（XSPEC-068） |
