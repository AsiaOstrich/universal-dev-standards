---
source: ../../../core/secret-management-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-17
source_hash: 1bb70238135b
status: current
---

# 機密管理與憑證衛生標準

> **Language**: [English](../../../core/secret-management-standards.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/secret-management-standards.ai.yaml`
> **規格**: XSPEC-065（cross-project/specs/XSPEC-065-uds-infrastructure-pack.md）

## 概觀

本標準定義團隊如何在開發與生產環境中儲存、注入、輪替與稽核機密（secret）與憑證。
涵蓋三個核准的機密來源層級（Vault 動態機密、Cloud KMS、SOPS+Git）、依憑證類型的
輪替政策、透過 pre-commit 與 CI 掃描自動防止硬編碼機密，以及安全的機密注入模式。
設計目標為消除原始碼與 CI 日誌中的憑證，同時在各種團隊規模下維持營運實務性。

本標準屬於 **IaC 標準包**（XSPEC-065），並作為機密處理的橫切*主要負責者*：被容器
映像建構（`container-image-standards`）、合規稽核（`audit-trail`）以及存放憑證的
SRE runbook 多處引用。

> **範圍**：本標準定義機密的*核准來源*、*輪替頻率*、*防護層*與*注入模式*。在
> Vault／Cloud KMS／SOPS 之間的選擇以及特定掃描工具屬採用者的選擇。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | 機密來源三選項（Vault／Cloud KMS／SOPS+Git） | MUST |
| REQ-002 | 依類型的輪替政策 | MUST |
| REQ-003 | 硬編碼機密防護（pre-commit + CI 掃描） | MUST |
| REQ-004 | 機密注入（僅限環境變數或掛載檔案） | MUST |

### REQ-001 — 機密來源三選項

團隊 MUST 依營運情境使用三個核准的機密來源層級之一：(1) **HashiCorp Vault 動態
機密**（生產與多團隊環境首選）——機密以短 TTL 隨需生成，任何地方皆不儲存靜態憑證；
(2) **Cloud KMS 搭配原生 secret manager**（AWS Secrets Manager／GCP Secret
Manager／Azure Key Vault）——適合雲原生部署，機密於執行期透過受 IAM 控制的 API
呼叫取得；(3) **SOPS + Git 加密**——適合小團隊與 GitOps 流程，機密以 `age` 或 KMS
金鑰加密後再 commit，僅於受信任的執行環境解密。在任何其他位置（env 檔、wiki、聊天）
儲存未加密機密為 **PROHIBITED**。

### REQ-002 — 依類型的輪替政策

所有機密 MUST 具備由自動化工具或行事曆提醒強制執行的輪替政策。各類型最低輪替
頻率：**資料庫憑證**——每 90 天；**API 金鑰**（第三方服務）——每 180 天；**簽章
金鑰**（JWT、程式碼簽章）——每 365 天；**一次性 token 與 session 憑證**——使用後
立即撤銷，MUST NOT 重用；**TLS 憑證**——至少於到期前 30 天輪替，盡可能以
ACME／Let's Encrypt 或 cert-manager 自動化。輪替事件 MUST 記錄於稽核軌跡。

### REQ-003 — 硬編碼機密防護

團隊 MUST 實作自動掃描，以在硬編碼機密進入儲存庫前偵測並封鎖。REQUIRED 兩層：
(1) **Pre-commit hook** 使用 `detect-secrets`、`gitleaks` 或 `truffleHog`——掃描
staged 檔案，偵測到 pattern 即封鎖 commit；(2) **CI 管線掃描**——於每個 PR 重掃所有
變更檔案，若發現機密則封鎖合併。最低偵測 pattern：AWS access key 格式
（`AKIA[0-9A-Z]{16}`）、PEM 私鑰標頭（`-----BEGIN .* PRIVATE KEY`）、通用 API token
pattern（`api[_-]?key\s*[:=]\s*\S{16,}`），以及含密碼的連線字串。

### REQ-004 — 機密注入

機密 MUST 僅透過環境變數或掛載檔案注入應用程式程序。透過命令列參數傳遞機密為
**PROHIBITED**（於程序清單可見）。透過 URL 查詢參數傳遞機密為 **PROHIBITED**（被
proxy 與伺服器記錄）。環境變數注入應使用平台原生機密注入（Kubernetes Secrets、ECS
task definition secrets、GitHub Actions secrets）。檔案式注入則將機密掛載為唯讀
volume，並使用限制性檔案權限（0400 或 0600）。

## 反模式

- 將憑證直接硬編碼於原始碼或設定檔。
- 未加密即將機密存於 CI/CD 環境變數（UI 中明文）。
- 跨多環境共用憑證（dev／staging／prod 使用相同機密）。
- 長期靜態憑證且無輪替排程。
- 將含真實機密的 `.env` 檔提交至版本控制。

## 與既有標準的整合

- **`iac-design-principles`**——機密後端（Vault／KMS 狀態）本身即是版本化、受存取
  控制的基礎設施。
- **`audit-trail`**——輪替、存取與注入事件為可稽核操作（REQ-002 要求記錄輪替事件）。
- **`pii-classification`**——守護 TIER-1 PII 的憑證承襲最嚴格的處理控制。
- **`security-standards`**——本標準是更廣安全基線的憑證衛生面向。

## 相關規格

- XSPEC-065 — UDS 基礎設施（IaC）標準包（本標準來源）
- DEC-043 — UDS 覆蓋完整性路線圖（Wave 4 範圍；D1 橫切負責者）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~004：機密來源選項、輪替政策、硬編碼機密防護、機密注入（XSPEC-065） |
