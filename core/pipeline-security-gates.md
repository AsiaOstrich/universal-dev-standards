# Pipeline Security Gates（CI Pipeline 安全檢查點）

## 概述

本標準定義嵌入 CI pipeline 各階段的安全檢查點，涵蓋 SAST、DAST、SCA（含 SBOM）、機密掃描，以及發布前的供應鏈簽章驗證，並明確規定各類發現的阻斷（Block）、警告（Warn）、記錄（Log）行為。

---

## 核心原則

- **機密掃描在 pre-commit**：所有包含機密的提交都必須被阻擋，不得例外
- **SAST 在建置後**：Critical 和 High 等級發現阻斷 pipeline
- **SCA + SBOM 在封包階段**：追蹤相依套件風險並產生物料清單
- **Attestation 驗證在發布前**：封包後、部署前 MUST 驗證 artifact 的 checksum、簽章與 SLSA provenance（消費 supply-chain-attestation 標準的產出，不得「產生 SBOM 卻不驗」）
- **DAST 在 staging 部署後**：對運行中的應用進行動態掃描
- **安全閘門失敗 = pipeline 失敗**：不得視為可忽略的警告
- **任何繞過都需審計軌跡**：禁止靜默跳過安全閘門

---

## 安全閘門位置與配置

### 1. Pre-Commit — 機密掃描

| 項目 | 說明 |
|------|------|
| 掃描範圍 | 所有 staged 檔案 |
| 推薦工具 | gitleaks、trufflehog、detect-secrets |
| 阻斷條件 | 任何機密模式匹配 |
| 可跳過 | 否（`never_skip: true`） |

**重要**：此閘門必須在程式碼進入版本控制前執行，一旦機密進入 git 歷史便需要完整的機密輪換程序。

---

### 2. Post-Build — SAST（靜態應用安全測試）

| 項目 | 說明 |
|------|------|
| 掃描範圍 | 原始碼 + 建置產出物 |
| 推薦工具 | semgrep、codeql、sonarqube |
| 阻斷條件 | Critical、High |
| 警告條件 | Medium |
| 僅記錄 | Low、Info |

---

### 3. Package Stage — SCA + SBOM

| 項目 | 說明 |
|------|------|
| 掃描範圍 | 相依套件 + 容器映像 |
| 推薦工具 | trivy、syft、grype、dependabot |
| 阻斷條件 | Critical CVE（有可用修復版本） |
| 警告條件 | High CVE、過時相依套件 |
| SBOM 格式 | SPDX、CycloneDX |

**SBOM 用途**：上傳至 dependency-track 或 grype-db 進行持續監控。

---

### 4. Pre-Deploy — Artifact Attestation Verification（供應鏈簽章驗證）

| 項目 | 說明 |
|------|------|
| 驗證範圍 | 已封包的發布 artifact（檔案壓縮檔 / 容器映像）|
| 推薦工具 | cosign（`verify-blob` / `verify`）、sha256sum、slsa-verifier |
| 阻斷條件 | 簽章驗證失敗、checksum 不符、SLSA provenance 缺失 |
| 警告條件 | SLSA 等級低於目標（公開發布建議 ≥ L2）|

封包階段（gate 3）產生 SBOM 後，**部署/發布前 MUST 驗證** artifact 的完整性與來源證明，
避免「產生了 SBOM/簽章卻從不驗證」的假保證：比對 `checksums.txt` 的 SHA256、以
`cosign verify-blob` 驗 SBOM 與 provenance 簽章、確認 SLSA provenance 存在。完整的
產生與驗證指令、Release Bundle 結構見
[supply-chain-attestation.md](supply-chain-attestation.md)。

---

### 5. Post-Staging Deploy — DAST（動態應用安全測試）

| 項目 | 說明 |
|------|------|
| 掃描範圍 | 運行中的 staging 應用程式 |
| 推薦工具 | ZAP、nuclei、BurpSuite Enterprise |
| 阻斷條件 | Critical |
| 需審核批准 | High |
| 警告條件 | Medium |

---

## 嚴重性回應矩陣

| 嚴重性 | 動作 | 通知對象 | SLA |
|--------|------|---------|-----|
| Critical | 阻斷 pipeline | 資安團隊 | 立即 |
| High | 阻斷 pipeline | 團隊主管 | 當日 |
| Medium | 警告 + 需審核批准 | 開發者 | 下個 Sprint |
| Low | 僅記錄 | 無 | Backlog |

---

## 繞過政策

**預設禁止繞過**。

若有特殊情況：
- **例外流程**：需書面資安審核 + 審計日誌記錄
- **緊急繞過**：時效性令牌（time-limited token）+ 強制事後審查

---

## 整合點

| 整合項目 | 說明 |
|---------|------|
| 機密管理 | 整合 HashiCorp Vault 或 AWS Secrets Manager 進行機密注入 |
| SBOM 註冊表 | 上傳 SBOM 至 dependency-track 或 grype-db 持續監控 |
| Artifact 簽章 | 發布前以 cosign 驗證 SBOM/provenance 簽章與 checksum（見 supply-chain-attestation）|
| 事故回應 | Critical 發現自動建立事故單 |

---

## 相關標準

- [security-standards.md](security-standards.md) — 應用安全基礎標準
- [pipeline-integration-standards.md](pipeline-integration-standards.md) — CI 管線整合標準
- [deployment-standards.md](deployment-standards.md) — 部署基礎原則
- [supply-chain-attestation.md](supply-chain-attestation.md) — SBOM / SLSA provenance / cosign 簽章的產生與驗證（gate 4 消費）
- AI 格式：[../ai/standards/pipeline-security-gates.ai.yaml](../ai/standards/pipeline-security-gates.ai.yaml)


**Scope**: universal
