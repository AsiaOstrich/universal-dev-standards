---
source: ../../../core/iac-design-principles.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-07-23
source_hash: beecfddec375
status: current
---

# 基礎設施即程式碼設計原則

> **Language**: [English](../../../core/iac-design-principles.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/iac-design-principles.ai.yaml`
> **規格**: XSPEC-065（cross-project/specs/XSPEC-065-uds-infrastructure-pack.md）

## 概觀

本標準定義基礎設施即程式碼（IaC）撰寫的四項基礎原則：**可重現、不可變、冪等、
版本化**。涵蓋狀態管理要求（含鎖定的遠端狀態）、漂移偵測類別，以及 CI/CD 整合。
設計目標為確保基礎設施變更可追溯、可逆，並可重複套用而無非預期副作用。

本標準屬於 **IaC 標準包**（XSPEC-065），並作為 `container-image-standards` 與
`secret-management-standards` 所立基的工具無關基礎（映像與機密後端本身即是版本化、
可重現的基礎設施）。

> **範圍**：本標準定義*撰寫原則*、*狀態管理*規則與*漂移處理分類*。特定 IaC 工具
> （Terraform／Pulumi／CloudFormation）與後端屬採用者的選擇，不在本標準範圍內。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | IaC 四原則（可重現、不可變、冪等、版本化） | MUST |
| REQ-002 | 狀態管理（遠端後端、鎖定、加密、VCS 不存本地狀態） | MUST |
| REQ-003 | 漂移偵測（PR 上執行 plan；三類分類） | MUST |

### REQ-001 — IaC 四原則

所有基礎設施定義 MUST 遵循四項基礎原則：(1) **可重現**——在相同輸入與狀態下，套用
IaC 產生相同的基礎設施；(2) **不可變**——基礎設施變更以取代資源的方式套用，而非
就地變更；blue/green 或滾動取代模式優於就地變更；(3) **冪等**——多次套用相同 IaC
設定產生相同結果，無錯誤或非預期副作用；(4) **版本化**——所有 IaC 定義儲存於版本
控制並具備有意義的 commit message；不在 VCS 流程外進行任何基礎設施變更。

### REQ-002 — 狀態管理

IaC 狀態 MUST 儲存於啟用鎖定的遠端後端，以防止並行修改。本地狀態檔 MUST NOT 提交
至版本控制或用於 CI/CD 管線。建議後端：Terraform Cloud／S3+DynamoDB（Terraform）、
Pulumi Service／S3（Pulumi）、CloudFormation 原生 stack 狀態。狀態存取 MUST 透過 IAM
或同等機制限制為獲授權主體。狀態靜態加密為 REQUIRED。

### REQ-003 — 漂移偵測

團隊 MUST 在每個 pull request 於 CI 執行 `plan`（或同等）以偵測設定漂移。漂移結果
MUST 分類為三類之一並據以處理：(1) **rollback-to-code**——實際基礎設施因手動變更而
偏離程式碼；於下次 apply 將實際還原以符合程式碼；(2) **update-code-from-actual**——
實際反映尚未編碼的有意變更；更新 IaC 以符合，然後 apply；(3) **manual-reconcile**——
漂移需人為判斷（例如資料 volume 變更）；以文件化決策上呈基礎設施負責人。漂移報告
SHOULD 依排定節奏（例如每日）發布至團隊頻道。

## 反模式

- 將本地狀態檔（`terraform.tfstate`）提交至版本控制。
- 套用可變的就地變更（例如以 sed patch 執行中的 VM）而非取代資源。
- 進行手動 console 變更而未更新對應的 IaC 定義。
- 不使用遠端鎖定，允許並行 apply 而損毀狀態。
- pin 至 `latest` provider 或 module 版本，破壞可重現性。

## 與既有標準的整合

- **`container-image-standards`**——容器映像是依相同原則產生的版本化、可重現產物。
- **`secret-management-standards`**——機密後端（Vault／KMS）作為具遠端狀態、受存取
  控制的基礎設施管理。
- **`deployment-standards` / `cd-deployment-strategies`**——不可變取代（REQ-001）
  支撐 blue/green 與滾動部署模式。
- **`no-cicd-deployment`**——即使無 CI/CD 平台，四原則與狀態管理規則仍適用於腳本化
  的基礎設施變更。

## 相關規格

- XSPEC-065 — UDS 基礎設施（IaC）標準包（本標準來源）
- DEC-043 — UDS 覆蓋完整性路線圖（Wave 4 範圍）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~003：IaC 四原則、狀態管理、漂移偵測（XSPEC-065） |
