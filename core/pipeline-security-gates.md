# Pipeline Security Gates（CI Pipeline 安全檢查點）

**Version**: 1.1.0
**Last Updated**: 2026-10-07

## 概述

本標準定義嵌入 CI pipeline 各階段的安全檢查點，涵蓋 SAST、DAST、SCA（含 SBOM）、機密掃描，以及發布前的供應鏈簽章驗證，並明確規定各類發現的阻斷（Block）、警告（Warn）、記錄（Log）行為。

---

## 核心原則

- **機密掃描在 pre-commit**：所有包含機密的提交都必須被阻擋，不得例外
- **機密掃描器自己的行為也要寫明**：輸出不得印出被匹配到的機密值；掃描器跑不起來視同閘門失敗（見 1.1 節）
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

### 1.1 掃描器自己的三個行為（1.1.0 新增）

上表講「掃什麼、什麼時候阻斷」；本節講**掃描器本身**必須怎麼表現。以下三條都以本標準既有的兩條原則為前提：
「安全閘門失敗 = pipeline 失敗」與「禁止靜默跳過安全閘門」。

| 編號 | 強度 | 要求 |
|------|------|------|
| **PSG-1** | 必須（MUST） | 掃描的輸出——終端機、CI 紀錄、報告檔——**不得包含被匹配到的機密值本身**，只能指出檔案、行號與規則名稱 |
| **PSG-2** | 必須（MUST） | 掃描器**無法執行**視同閘門失敗，**必須阻斷**提交／pipeline，不得放行 |
| **PSG-3** | 建議（SHOULD） | 團隊**自己撰寫**的偵測規則，每一條都有一個該被抓到（紅）與一個不該被誤報（綠）的測試樣本，樣本在測試中執行 |

#### PSG-1　輸出不得印出被匹配到的機密值

理由：掃描紀錄會被貼進聊天室與工單。閘門把機密值印在輸出裡，等於把已被擋下的機密再洩漏一次。

工具註記（只寫已查證的）：

| 工具 | 註記 | 依據 |
|------|------|------|
| gitleaks | 官方 README 的範例輸出（`gitleaks git -v`，未加 `--redact`）含 `Secret:` 一行，印出被匹配到的值全文；`--redact` 旗標的說明為「redact secrets from logs and stdout」。README 未說明 `--redact` 是否也涵蓋 `--report-path` 產生的報告檔，**採用者須自行確認** | gitleaks 官方 README，2026-10-07 讀取 |
| detect-secrets | 預設輸出行為**本標準未查證，採用者須自行確認** | — |
| trufflehog | 預設輸出行為**本標準未查證，採用者須自行確認** | — |

判定程序（示意，三行）：

1. 建一個含**假**密鑰的檔案（示意記法：`FAKE-SECRET-DO-NOT-USE-0000`；實際樣本須是**你自己的閘門會匹配的格式**——例如自寫一條 canary 規則，或工具文件列出的測試樣式——且必須是假值，不得是任何真實服務的有效憑證），加入 staging 後執行閘門，**先確認閘門確實阻斷**。
2. 沒阻斷代表樣本沒被匹配，第 3 步不算數——此時輸出裡當然找不到它，結果是「綠得虛假」。
3. 在終端機、CI 紀錄、報告檔的**全部輸出**搜尋該假密鑰字串；找到任何一處即不合規。

#### PSG-2　掃描器跑不起來視為閘門失敗

「跑不起來」包含：執行檔不存在、設定檔無法讀取或無效、逾時、非預期的結束。這些情況必須阻斷，**不得**以 `|| true`、`2>/dev/null` 等方式吞掉，也不得讓閘門輸出「掃描通過」。

UDS 自己的先例：`uds init` 為非 Node 專案寫的原生 `.git/hooks/pre-commit`，曾把每個檢查接上 `2>/dev/null || true` 後印出「Pre-commit checks passed」——檢查壞掉也照樣放行，且藏起自己的錯誤。6.14.0-beta.4 修正（見 CHANGELOG 該版〈Fixed〉）。

工具註記：gitleaks 官方 README 的〈Exit Codes〉一節寫 `1 - leaks or error encountered`——找到洩漏與發生錯誤是**同一個結束碼**，所以**區分原因要靠輸出，不靠結束碼**；對阻斷與否，兩者的結論相同。README 另說明 `--exit-code` 旗標可改寫「找到洩漏時」的結束碼（2026-10-07 讀取）：把它設成 0 會讓閘門在找到洩漏時放行，不得這樣設定。detect-secrets、trufflehog 的結束碼行為**本標準未查證，採用者須自行確認**。

判定程序（示意，三行）：

1. 把掃描器執行檔改名或移走，或把它的設定檔改成無效內容。
2. 對一個**不含任何機密**的提交執行閘門（此時若被阻斷，原因只可能是掃描器跑不起來）。
3. 提交被阻斷（結束碼非 0），且輸出說明是掃描器無法執行；若提交被放行，或輸出看起來像「掃描通過」，即不合規。

#### PSG-3　自己寫的偵測規則，每條要有紅綠樣本

適用於團隊**自己撰寫**的規則，包含 `secret-management-standards` 的 REQ-003 所列的最低四種：AWS access key、PEM 私鑰標頭、一般 API token、含密碼的連線字串。只用工具內建規則、不自己寫規則的團隊不適用。

道理與 `open-work-tracking` 的 OWT-015 相同：沒見過失敗的檢查不算證據。一條從沒被紅樣本匹配過的規則，無法證明它抓得到東西；一條沒有綠樣本的規則，無法證明它不會把正常程式碼全擋下來。

判定程序（示意，三行）：

1. 列出團隊自寫的全部偵測規則。
2. 逐條找對應的一個紅樣本（必被匹配）與一個綠樣本（不得匹配）；樣本須是假值。
3. 確認樣本在測試中真的執行；缺任一個即列為缺口（本條為建議，缺口不阻斷）。

#### 範圍的誠實註明

UDS **不出貨掃描器**。上面三段是採用者在**自己的閘門**上自行驗證的程序。UDS 自己的 repo 目前也沒有機密掃描（CI 與 hook 都沒有用到上述三種工具）。

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
