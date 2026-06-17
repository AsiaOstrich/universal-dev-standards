---
source: ../../../core/schema-evolution.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-17
source_hash: 0e8f6242bf38
status: current
---

# Schema 演進標準

> **Language**: [English](../../../core/schema-evolution.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/schema-evolution.ai.yaml`
> **規格**: XSPEC-068（cross-project/specs/XSPEC-068-uds-data-engineering-pack.md）

## 概觀

本標準定義資料庫與資料儲存的 schema 如何**安全演進**而不破壞既有消費者。涵蓋向後
相容變更樣態、禁止的破壞性變更、expand-contract 遷移策略、schema 版本化與 registry、
CI 中的自動相容性檢查，以及回滾程序。適用於關聯式資料庫、文件儲存、事件 schema
（Avro/Protobuf）與 API request/response schema。

本標準屬於**資料工程標準包**（XSPEC-068），以安全演進規則延伸 `database-standards`
的靜態 schema 定義。

> **範圍**：本標準定義*相容性分類*、*expand-contract* 部署紀律與 CI 閘控。具體遷移
> 工具（Flyway/Liquibase）與 schema registry（Confluent）屬採用者的選擇。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | 向後相容變更樣態 | MUST |
| REQ-002 | 無遷移計劃禁止破壞性變更 | MUST |
| REQ-003 | Expand-contract 遷移策略 | MUST |
| REQ-004 | Schema 版本化與 registry | MUST |
| REQ-005 | CI 中的自動 schema 相容性檢查 | MUST |
| REQ-006 | Schema 變更回滾程序 | MUST |

### REQ-001 — 向後相容變更樣態

所有 schema 變更 MUST 向後相容，除非遵循正式的破壞性變更流程。向後相容變更包含：
新增帶預設值的可空欄位、新增表／collection、新增可選訊息欄位、新增 enum 值（含
未知處理）、放寬資料型別（INT → BIGINT），以及新增索引。這些變更 MUST 可在不協調
消費者更新的情況下部署。

### REQ-002 — 無遷移計劃禁止破壞性變更

下列分類為 **BREAKING**，未經正式 expand-contract 遷移計劃與消費者協調 MUST NOT
部署：重新命名或刪除欄位、不相容地變更資料型別、對既有欄位加上無預設值的 NOT
NULL、變更主鍵／外鍵定義、移除 enum 值，以及變更欄位語意（將欄位挪作他用）。

### REQ-003 — Expand-Contract 遷移策略

破壞性變更 MUST 使用 **expand-contract**（平行變更）樣態：**Phase 1（Expand）**在舊
結構旁新增新結構；**Phase 2（Migrate）**將舊資料回填至新結構並更新所有 writer；
**Phase 3（Contract）**將所有 reader 更新至新結構；**Phase 4（Cleanup）**在所有
消費者更新後移除舊結構。每階段 MUST 為獨立且經驗證的部署。階段間最短等待：一個
完整部署週期。

### REQ-004 — Schema 版本化與 Registry

事件驅動與 API schema（Avro、Protobuf、JSON Schema）MUST 以明確版號註冊於 schema
registry，並遵循語意版本：PATCH 用於向後相容新增、MINOR 用於新可選欄位、MAJOR 用於
破壞性變更。每次 schema 變更 MUST 在註冊前審查核准。消費者 MUST 指定其消費的 schema
版本。

### REQ-005 — CI 中的自動 Schema 相容性檢查

每個修改 schema 定義的 PR MUST 在 CI 觸發自動相容性檢查。對關聯式 schema，遷移腳本
MUST 在 CI 對 production-snapshot 資料庫執行以在合併前偵測錯誤。對事件 schema，
MUST 針對所有已註冊消費者版本檢查相容性。相容性失敗 MUST 阻擋 PR 合併。

### REQ-006 — Schema 變更回滾程序

每個遷移腳本 MUST 具備對應的回滾（down）腳本。回滾腳本 MUST 在 CI 與正向遷移一同
測試。對破壞性變更（drop、型別變更），MUST 在執行前進行並驗證資料備份。回滾計劃
MUST 記載於遷移 PR 並在部署 runbook 中引用。

## 與既有標準的整合

- **`database-standards`**——本標準在靜態 schema 定義之上加入*演進*紀律。
- **`data-contract`**——MAJOR schema 版本對映 contract 破壞性變更治理與消費者簽核。
- **`data-pipeline`**——管線須依 REQ-001 容忍來源的向後相容變更。
- **`deployment-standards`**——expand-contract 各階段為獨立部署；回滾計劃置於部署
  runbook。

## 相關規格

- XSPEC-068 — UDS 資料工程標準包（本標準來源）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~006：向後相容樣態、禁止破壞性變更、expand-contract、版本化／registry、CI 相容性檢查、回滾（XSPEC-068） |
