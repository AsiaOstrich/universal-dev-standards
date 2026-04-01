# [SPEC-ENV-001] Feature: Environment Management Standards

- **Status**: Archived
- **Created**: 2026-03-31
- **Author**: AI-assisted
- **Priority**: High (P1)
- **Scope**: universal
- **Related**: `core/deployment-standards.md` (互補), `core/security-standards.md` (銜接), SPEC-RUNBOOK-001

## Overview

新增 `core/environment-standards.md` 核心標準，定義環境層級、配置策略、環境同等性原則、Secret 管理和環境驗證清單。統一不同環境間的管理方式，減少「在我的機器上可以跑」的問題。

## Motivation

### 問題陳述

1. **環境定義不一** — 各團隊對 dev/staging/production 的定義和用途不同
2. **配置散落** — 環境配置在 .env、config 檔、環境變數、硬編碼中散落
3. **Secret 外洩風險** — .env 檔被提交到 Git，API key 寫在程式碼中
4. **環境不一致** — staging 與 production 差異大，導致部署後才發現問題
5. **新環境建置困難** — 沒有標準化的建置流程，靠口耳相傳

### 與現有標準的關係

| 現有標準 | 本規格的關係 |
|----------|-------------|
| `deployment-standards` | **互補**：deployment 定義如何部署，environment 定義部署到哪裡 |
| `security-standards` | **銜接**：Secret 管理是安全標準的延伸 |
| SPEC-RUNBOOK-001 | **銜接**：環境操作需要 Runbook |
| SPEC-OBS-001 | **銜接**：每個環境需要可觀測性配置 |
| `checkin-standards` | **擴展**：禁止提交 .env 和 secret |

## Requirements

### REQ-1: 標準環境層級

系統 SHALL 定義標準化的環境層級及其用途。

#### Scenario: 查閱環境層級定義
- **GIVEN** 團隊規劃環境架構
- **WHEN** 查閱環境層級標準
- **THEN** 看到以下定義：

| 層級 | 名稱 | 用途 | 資料 | 存取 |
|------|------|------|------|------|
| **Local** | 開發者本機 | 個人開發和單元測試 | Mock/Seed 資料 | 僅開發者 |
| **Dev** | 共享開發環境 | 整合開發和初步測試 | 測試資料 | 開發團隊 |
| **Staging** | 預生產環境 | QA 測試、UAT、效能測試 | 匿名化生產資料副本 | 開發+QA 團隊 |
| **Production** | 生產環境 | 面向用戶的正式服務 | 真實資料 | 受限存取 |

#### Scenario: 可選環境
- **GIVEN** 團隊有特殊需求
- **WHEN** 需要額外環境
- **THEN** 可選擇新增：

| 環境 | 用途 | 何時需要 |
|------|------|----------|
| **Preview** | PR 預覽環境 | 前端專案，每個 PR 一個臨時環境 |
| **Sandbox** | 第三方整合測試 | 對接外部 API 時 |
| **DR** | 災難復原 | 高可用性需求 |

### REQ-2: 配置管理策略

系統 SHALL 定義環境配置的優先級層次和管理方式。

#### Scenario: 配置優先級層次
- **GIVEN** 應用程式需要讀取配置
- **WHEN** 多個來源存在相同配置
- **THEN** 按以下優先級（高→低）：

| 優先級 | 來源 | 範例 | 適用 |
|--------|------|------|------|
| 1（最高） | 環境變數 | `DATABASE_URL=...` | 環境特定、Secret |
| 2 | 命令列參數 | `--port 3000` | 啟動時覆寫 |
| 3 | 環境配置檔 | `config.production.yaml` | 環境特定非機密 |
| 4 | 應用配置檔 | `config.yaml` | 應用預設值 |
| 5（最低） | 硬編碼預設 | `const DEFAULT_PORT = 3000` | 最終降級值 |

#### Scenario: 配置分類
- **GIVEN** 開發者需要管理配置
- **WHEN** 決定配置的存放方式
- **THEN** 按以下分類：

| 類別 | 存放方式 | 版本控制 | 範例 |
|------|---------|---------|------|
| **Secret** | 環境變數/Secret Manager | ❌ 不入 Git | API key, DB 密碼 |
| **環境特定** | 環境配置檔或環境變數 | ✅ 範本入 Git | API URL, 日誌等級 |
| **應用配置** | 應用配置檔 | ✅ 入 Git | 分頁大小, 超時設定 |
| **建置配置** | 建置工具配置 | ✅ 入 Git | Webpack, Vite 設定 |

### REQ-3: 環境同等性原則 (Parity)

系統 SHALL 定義環境間應保持一致的面向和例外。

#### Scenario: 同等性要求
- **GIVEN** 團隊維護多個環境
- **WHEN** 評估環境一致性
- **THEN** 按以下面向要求同等性：

| 面向 | 要求 | 說明 |
|------|------|------|
| **技術棧** | MUST 相同 | 同版本的 runtime、framework、DB |
| **架構拓撲** | SHOULD 相同 | 相同的服務數、佈局 |
| **配置結構** | MUST 相同 | 相同的配置 key，不同的 value |
| **資料結構** | MUST 相同 | 相同的 schema/migration |
| **規模** | MAY 不同 | staging 可較小，但結構相同 |
| **資料內容** | MUST 不同 | staging 不可用生產真實資料（需匿名化） |

#### Scenario: 環境差異檢測
- **GIVEN** staging 和 production 可能不一致
- **WHEN** 部署前進行環境差異檢查
- **THEN** 檢查以下項目：
  - 技術棧版本是否一致
  - 環境變數 key 清單是否一致（值可不同）
  - 資料庫 migration 版本是否一致
  - 第三方服務版本是否一致

### REQ-4: Secret 管理

系統 SHALL 定義 Secret 的管理原則和最佳實踐。

#### Scenario: Secret 管理原則
- **GIVEN** 應用程式使用 Secret（密碼、API key）
- **WHEN** 遵循 Secret 管理標準
- **THEN** 滿足以下原則：

| 原則 | 說明 | 違反後果 |
|------|------|---------|
| **不入版控** | Secret 永不提交到 Git | 資料外洩、帳號被盜 |
| **範本化** | 提供 `.env.example` 列出所有需要的 key | 新成員知道需設定什麼 |
| **集中管理** | 使用 Secret Manager 或 Vault | 可審計、可輪替 |
| **最小權限** | 每個環境/服務有自己的 Secret | 洩漏影響範圍最小化 |
| **定期輪替** | Secret 有過期時間，定期更換 | 洩漏後的持續風險 |

#### Scenario: .gitignore 必要項目
- **GIVEN** 專案使用 Git 版本控制
- **WHEN** 設定 .gitignore
- **THEN** MUST 包含以下項目：
  ```
  .env
  .env.local
  .env.*.local
  *.pem
  *.key
  credentials.json
  service-account.json
  ```

#### Scenario: .env.example 範本
- **GIVEN** 專案使用環境變數配置
- **WHEN** 建立範本
- **THEN** `.env.example` 包含所有 key 但不含真實值：
  ```env
  # Database
  DATABASE_URL=postgresql://user:password@localhost:5432/dbname

  # API Keys
  STRIPE_SECRET_KEY=sk_test_...
  SENDGRID_API_KEY=SG...

  # Application
  NODE_ENV=development
  PORT=3000
  LOG_LEVEL=debug
  ```

### REQ-5: 環境驗證清單

系統 SHALL 定義新環境建置或環境變更後的驗證清單。

#### Scenario: 新環境建置驗證
- **GIVEN** 團隊建置新環境
- **WHEN** 使用環境驗證清單
- **THEN** 逐項確認：

| 類別 | 檢查項 |
|------|--------|
| **連接性** | 所有服務間可通訊 |
| **認證** | Secret 已設定且有效 |
| **資料** | 資料庫 migration 已執行 |
| **監控** | 日誌收集、Metrics、告警已設定 |
| **安全** | HTTPS 設定、防火牆規則正確 |
| **存取** | 正確的人有正確的存取權限 |
| **備份** | 備份機制已設定（production） |
| **DNS** | 網域指向正確 |

### REQ-6: 環境生命週期

系統 SHALL 定義臨時環境（如 Preview、Sandbox）的生命週期管理。

#### Scenario: Preview 環境自動清理
- **GIVEN** PR 建立了 Preview 環境
- **WHEN** PR 合併或關閉
- **THEN** Preview 環境自動銷毀，釋放資源

#### Scenario: 環境建置文件化
- **GIVEN** 團隊需要重建環境
- **WHEN** 查閱環境建置文件
- **THEN** 文件包含：
  - 所有必要的基礎設施元件
  - 配置設定步驟
  - 驗證清單
  - 預估建置時間

## Acceptance Criteria

- **AC-1**: Given 團隊規劃環境, when 查閱標準, then 能找到 4 個標準層級（Local/Dev/Staging/Production）的完整定義
- **AC-2**: Given 管理配置, when 查閱優先級, then 能找到 5 層配置優先級（環境變數→命令列→環境配置→應用配置→硬編碼）
- **AC-3**: Given 評估一致性, when 查閱同等性原則, then 有 6 個面向的 MUST/SHOULD/MAY 要求
- **AC-4**: Given 管理 Secret, when 查閱原則, then 有 5 個核心原則（不入版控/範本化/集中/最小權限/輪替）
- **AC-5**: Given .gitignore, when 查閱必要項目, then 有至少 7 個 Secret 相關的 ignore 規則
- **AC-6**: Given 新環境建置, when 使用驗證清單, then 有 8 個檢查類別
- **AC-7**: Given 臨時環境, when 查閱生命週期, then 有 PR 合併後自動清理的機制定義

## Technical Design

### 文件結構

```
core/
├── environment-standards.md      ← 新建
├── deployment-standards.md       ← 現有，新增交叉引用
├── security-standards.md         ← 現有，新增交叉引用
```

### 章節結構

```markdown
# Environment Standards
## Overview
## Standard Environment Tiers
  ### Local / Dev / Staging / Production
  ### Optional Environments (Preview, Sandbox, DR)
## Configuration Management
  ### Priority Hierarchy
  ### Configuration Categories
  ### Configuration File Patterns
## Environment Parity
  ### Parity Requirements (MUST/SHOULD/MAY)
  ### Drift Detection
## Secret Management
  ### Core Principles
  ### .gitignore Requirements
  ### .env.example Template
  ### Secret Rotation
## Environment Verification Checklist
## Environment Lifecycle
  ### Ephemeral Environments
  ### Environment Documentation
## Quick Reference Card
## References
```

## Test Plan

- [ ] 4 個標準環境層級有完整定義
- [ ] 配置優先級有 5 層定義
- [ ] 環境同等性有 6 個面向的要求
- [ ] Secret 管理有 5 個核心原則
- [ ] .gitignore 有至少 7 個 ignore 規則
- [ ] 驗證清單有 8 個檢查類別
- [ ] 臨時環境生命週期有定義
- [ ] `check-standards-sync.sh` 通過

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-31 | 初始草稿 |
