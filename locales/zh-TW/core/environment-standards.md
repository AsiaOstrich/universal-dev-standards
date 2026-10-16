---
source: ../../../core/environment-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: d96f447e1080
status: current
---

# 環境管理標準

> **語言**: [English](../../../core/environment-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-31
**適用範圍**: 所有軟體專案
**範圍**: 通用
**產業標準**: The Twelve-Factor App, NIST SP 800-123, CIS Benchmarks
**參考資料**: [12factor.net](https://12factor.net/), [NIST](https://csrc.nist.gov/)

---

## 概述

本文件定義應用程式環境在整個生命週期中的管理標準——從本地開發到生產部署。涵蓋環境層級、配置管理、環境一致性、機密處理及驗證程序。

---

## 1. 環境層級

### 1.1 標準層級（MUST）

每個專案必須（MUST）定義至少四個標準環境層級：

| 層級 | 用途 | 對象 | 資料 |
|------|------|------|------|
| **Local** | 個人開發者工作站 | 單一開發者 | 合成 / 種子資料 |
| **Dev** | 共享開發與整合 | 開發團隊 | 合成測試資料 |
| **Staging** | 上線前驗證與 QA | QA 團隊、利害關係人 | 匿名化的類生產資料 |
| **Production** | 服務終端使用者的線上正式系統 | 終端使用者 | 真實使用者資料 |

### 1.2 可選層級（MAY）

專案可以（MAY）針對特殊需求定義額外層級：

| 層級 | 用途 | 生命週期 |
|------|------|-----------|
| **Preview** | 每個 PR 用於審查的臨時環境 | PR 開啟時建立，PR 合併時自動清理 |
| **Sandbox** | 隔離的實驗環境 | 隨需建立，手動或依排程清理 |
| **DR** (災難復原) | 業務連續性容錯移轉環境 | 常溫備援或冷備援，發生事故時啟用 |

---

## 2. 配置優先順序階層

### 2.1 五層優先順序（MUST）

配置值必須（MUST）依以下優先順序解析（由高至低）：

| 優先順序 | 來源 | 描述 | 範例 |
|----------|--------|-------------|---------|
| 1 (最高) | **環境變數 (Environment Variables)** | 執行時期環境變數 | `DATABASE_URL=postgres://...` |
| 2 | **命令列參數 (Command-line Arguments)** | CLI 旗標與參數 | `--port 3000` |
| 3 | **環境配置檔 (Environment Config Files)** | 各環境配置檔 | `.env.staging`, `config/staging.yaml` |
| 4 | **應用配置檔 (Application Config Files)** | 共享應用程式預設值 | `config/default.yaml`, `application.yml` |
| 5 (最低) | **硬編碼預設值 (Hardcoded Defaults)** | 程式碼內後備預設值 | `const PORT = config.port ?? 3000` |

### 2.2 解析規則

- 較高優先順序的來源必須（MUST）覆寫較低優先順序的來源
- 較高層級缺少的數值必須（MUST）落入下一層級繼續查找
- 應用程式應該（SHOULD）在啟動時記錄使用了哪個配置來源（不記錄機密值）

---

## 3. 環境一致性

### 3.1 六大一致性面向

為盡量減少「在我的電腦上可以跑」的問題，各環境必須（MUST）在以下面向維持一致性：

| 面向 | 要求 | 原理依據 |
|--------|-------------|-----------|
| **技術棧 (Tech Stack)** | **必須 (MUST)** 相同 | 所有層級使用相同的語言版本、框架與執行時期環境 |
| **架構拓撲 (Architecture Topology)** | **應該 (SHOULD)** 相同 | 相同的服務拓撲；若有偏差必須（MUST）記錄於文件中 |
| **配置結構 (Configuration Structure)** | **必須 (MUST)** 相同 | 相同的配置鍵值與 schema；各環境的數值有所不同 |
| **資料結構 (Data Structure)** | **必須 (MUST)** 相同 | 相同的資料庫 schema，所有層級皆套用遷移（migrations） |
| **規模 (Scale)** | **可以 (MAY)** 不同 | 生產環境可能擁有更多複本、更大規格的執行個體 |
| **資料內容 (Data Content)** | **必須 (MUST)** 不同 | 非生產環境必須（MUST）使用匿名化或合成資料；絕不可複製未經處理的原始生產資料 |

### 3.2 一致性驗證

團隊應該（SHOULD）將一致性檢查自動化，作為 CI/CD 的一部分：

- Staging 與 Production 之間的 Schema 比對
- 基礎設施即程式碼（IaC）差異報告
- 跨層級依賴套件版本稽核

---

## 4. 機密管理

### 4.1 核心原則

所有專案必須（MUST）遵循以下五大機密管理原則：

#### 原則 1：不入版控 (No Version Control)

機密絕不可提交至版本控制。這包括 API 金鑰、密碼、權杖、憑證與連線字串。

#### 原則 2：範本化 (Template-Based)

專案必須（MUST）提供 `.env.example` 範本檔案，記載所有必要的環境變數，且不包含實際機密值：

```bash
# .env.example — commit this file
DATABASE_URL=postgres://user:password@localhost:5432/mydb
API_KEY=your-api-key-here
SECRET_KEY=generate-with-openssl-rand-hex-32
```

#### 原則 3：集中管理 (Centralized Management)

生產環境機密應該（SHOULD）儲存於集中式機密管理器中：

- AWS Secrets Manager / SSM Parameter Store
- HashiCorp Vault
- Azure Key Vault
- Google Cloud Secret Manager
- 1Password / Doppler（適用於較小型團隊）

#### 原則 4：最小權限 (Least Privilege)

機密存取必須（MUST）遵循最小權限原則：

- 每個服務僅取得其所需的機密
- 各環境使用獨立的憑證
- 避免使用共用的服務帳戶

#### 原則 5：定期輪替 (Regular Rotation)

機密必須（MUST）按定期排程輪替：

| 機密類型 | 輪替頻率 |
|-------------|-------------------|
| API Keys | 每 90 天 |
| 資料庫密碼 | 每 90 天 |
| TLS 憑證 | 到期前（使用 ACME 自動化） |
| 服務帳戶金鑰 | 每 180 天 |

---

## 5. 機密相關 .gitignore 規則

### 5.1 基本必要規則（MUST）

每個專案必須（MUST）在 `.gitignore` 中至少包含以下模式，以防止機密意外洩漏：

```gitignore
# Environment files
.env
.env.local
.env.*.local

# Certificates and keys
*.pem
*.key

# Cloud credentials
credentials.json
service-account.json
```

### 5.2 額外建議規則（SHOULD）

```gitignore
# Additional secret patterns
*.p12
*.pfx
*.jks
.env.production
.env.staging
*-secret.yaml
*-secret.json
```

---

## 6. 環境驗證檢查清單

### 6.1 八大驗證檢查類別

在將部署晉級至新環境之前，團隊必須（MUST）驗證以下八個類別：

| # | 類別 | 檢查項目 |
|---|----------|-------------|
| 1 | **連接性 (Connectivity)** | 資料庫連線、API 端點可連通、訊息佇列連線、快取可用性 |
| 2 | **認證 (Authentication)** | SSO/OAuth 流程運作正常、API 金鑰有效性、服務對服務認證、憑證到期日 |
| 3 | **資料 (Data)** | Schema 遷移已套用、種子資料已載入、資料完整性條件約束有效 |
| 4 | **監控 (Monitoring)** | 指標收集運作中、日誌聚合正常、告警規則已部署、儀表板可存取 |
| 5 | **安全 (Security)** | TLS 已配置、CORS 政策已設定、速率限制運作中、WAF 規則已套用 |
| 6 | **存取 (Access)** | 團隊存取權限、部署憑證、管理主控台存取、VPN 連線能力 |
| 7 | **備份 (Backup)** | 備份排程已配置、還原程序已測試、保留政策已設定 |
| 8 | **DNS** | 網域記錄正確、SSL 憑證有效、CDN 配置、健康檢查端點 |

### 6.2 驗證自動化

團隊應該（SHOULD）建立自動化驗證指令碼（冒煙測試）來驗證每個類別：

```bash
# Example: verify-environment.sh
./checks/connectivity.sh   # Test all service endpoints
./checks/auth.sh           # Validate authentication flows
./checks/data.sh           # Run schema validation
./checks/monitoring.sh     # Confirm metrics pipeline
./checks/security.sh       # TLS and policy checks
./checks/access.sh         # Permission validation
./checks/backup.sh         # Backup system health
./checks/dns.sh            # DNS resolution checks
```

---

## 7. 臨時環境生命週期

### 7.1 Preview 環境管理

Preview 環境（每個 PR）**必須**實作自動清理（automatic cleanup）機制：

```
PR Opened → Build Preview Env → Run Checks → Review
                                                 │
PR Merged ──────────────────────────────────────►│
                                                 ▼
                                     Auto-Destroy Preview Env
```

**要求：**

- 當 PR 合併或關閉時，Preview 環境**必須**自動銷毀
- 清理**必須**包含所有佈建的資源（運算、儲存、DNS 記錄）
- 清理失敗**必須**向基礎設施團隊發送告警
- **應該**設定最大 TTL（例如 7 天）作為安全防線

### 7.2 基礎設施即程式碼 (Infrastructure as Code)

所有環境佈建**必須**透過基礎設施即程式碼（IaC）進行記錄：

- **建置文件 (Build Documentation)**：基礎設施定義**必須**納入版本控制
- **驗證清單 (Verification Checklist)**：每個環境**必須**具備對應的驗證檢查清單
- 環境**必須**能僅憑 IaC 定義重現

---

## 8. 基礎設施即程式碼（IaC）原則

### 8.1 核心原則

所有基礎設施佈建**必須**遵循以下六大 IaC 核心原則：

| # | 原則 | 說明 |
|---|------|------|
| 1 | **Declarative-First (聲明式優先)** | 描述期望的最終狀態而非程序性步驟。聲明式定義使基礎設施可預測且可稽核。 |
| 2 | **Idempotency (冪等性)** | 套用相同配置多次**必須**產生相同結果。重複執行不會產生副作用。 |
| 3 | **Version Control (版本控制)** | 所有 IaC 程式碼**必須**存放在 Git 中。透過提交歷史追蹤、審查並稽核變更。 |
| 4 | **Modularity (模組化)** | 基礎設施**應該**由可重用的模組組成。避免跨環境的複製貼上重複。 |
| 5 | **Environment Parameterization (環境參數化)** | 跨環境使用相同模組並搭配不同的參數值。環境特定值透過變數注入，而非硬編碼。 |
| 6 | **Immutable Infrastructure (不可變基礎設施)** | 更新基礎設施時，應替換資源而非就地修改。這能確保一致性並簡化回滾。 |

### 8.2 IaC 程式碼審查檢查清單

當 PR 包含 IaC 變更時，審查者**必須**評估以下四個面向：

| # | 面向 | 檢查項目 |
|---|------|----------|
| 1 | **Security (安全性)** | 套用最小權限、無硬編碼機密、IAM 政策範圍正確、網路暴露最小化 |
| 2 | **Cost Impact (成本影響)** | 新資源已識別、執行個體規格合理、預估每月成本變動已記錄 |
| 3 | **Rollback Feasibility (回滾可行性)** | 變更可逆、破壞性操作已標記、具備有狀態資源的備份／快照策略 |
| 4 | **Environment Consistency (環境一致性)** | 變更維持各層級一致性、環境特定覆寫已記錄、未引入配置漂移 |

### 8.3 漂移偵測 (Drift Detection)

基礎設施漂移是指資源的實際狀態與 IaC 定義的狀態產生偏差（例如：透過主控台進行手動變更）。團隊**必須**實作漂移偵測實踐：

**偵測：**
- 定期排程執行漂移偵測掃描（例如：`terraform plan`、`pulumi preview`）（**建議**：正式生產環境每日執行）
- 比較實際基礎設施狀態與 IaC 定義的期望狀態
- 將漂移檢查整合至 CI/CD 管線

**通知：**
- 偵測到漂移**必須**觸發對負責團隊的通知（透過 Slack、電子郵件或告警系統）
- 漂移報告**應該**包含：受影響的資源、偵測到的差異以及時間戳記

**修復：**
- 團隊**必須**使用以下兩種方法之一來解決漂移：
  - **更新 IaC**：若手動變更為刻意為之，更新 IaC 程式碼以反映新的期望狀態
  - **還原基礎設施**：若手動變更未經授權或屬意外，還原基礎設施以符合 IaC 定義
- 漂移修復**應該**作為工單進行追蹤，並在定義的 SLA 內解決

---

## 參考資料

- [The Twelve-Factor App — Config](https://12factor.net/config) — 基於環境的配置原則
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) — 機密處理最佳實踐
- [NIST SP 800-123](https://csrc.nist.gov/publications/detail/sp/800-123/final) — 通用伺服器安全指南

---

**相關標準：**
- [日誌標準](logging-standards.md) — 各環境的結構化日誌
- [部署標準](deployment-standards.md) — CI/CD 與部署管線
- [安全標準](security-standards.md) — 安全控制與合規性
- [可觀測性標準](observability-standards.md) — 監控與告警

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-03-31 | 初始版本：環境層級、配置階層、環境一致性、機密管理、驗證檢查清單、臨時環境 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
