---
source: options/testing/security-testing.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---
# 安全測試（Security Testing）

> **語言**: [English](../../../../options/testing/security-testing.md) | 繁體中文

**上層標準**: [測試完整性（Testing Completeness）](../../core/test-completeness-dimensions.md)

---

## 概觀

安全測試（security testing）在弱點被利用之前，先找出應用程式中的漏洞。它涵蓋靜態分析（static analysis）、動態測試（dynamic testing）、相依套件掃描（dependency scanning）與滲透測試（penetration testing），以確保全面的安全覆蓋。

## 最適用於

- 處理敏感資料的應用程式
- 金融服務
- 醫療照護應用程式
- 電子商務平台
- 任何對外公開的應用程式

## 測試類型

### 靜態應用程式安全測試（SAST）

不執行程式的情況下分析原始碼。

| 面向 | 細節 |
|--------|---------|
| **何時使用** | 開發早期、CI/CD pipeline |

**工具：**

| 工具 | 語言 |
|------|-----------|
| SonarQube | 多語言 |
| Semgrep | 多語言 |
| CodeQL | 多語言 |
| Bandit | Python |
| Brakeman | Ruby |
| ESLint security plugins | JavaScript/TypeScript |

### 動態應用程式安全測試（DAST）

針對運行中的應用程式測試漏洞。

| 面向 | 細節 |
|--------|---------|
| **何時使用** | Staging 環境、預備上線（pre-production） |

**工具：**

| 工具 | 類型 |
|------|------|
| OWASP ZAP | 開源 |
| Burp Suite | 商業 |
| Nuclei | 開源 |
| Nikto | 開源 |

### 軟體組成分析（SCA）

檢查相依套件是否存在已知漏洞。

| 面向 | 細節 |
|--------|---------|
| **何時使用** | 每次建置、持續監控 |

**工具：**

| 工具 | 類型 |
|------|------|
| Snyk | SaaS/CLI |
| Dependabot | GitHub 整合 |
| npm audit | CLI |
| OWASP Dependency-Check | 開源 |

### 滲透測試（Penetration Testing）

由安全專業人員執行的模擬攻擊。

| 面向 | 細節 |
|--------|---------|
| **何時使用** | 重大發布前、每年一次 |

**類型：**
- **黑箱（Black box）：** 無事先資訊
- **白箱（White box）：** 完整存取權限
- **灰箱（Grey box）：** 部分資訊

### 機密掃描（Secret Scanning）

偵測外洩的憑證與機密資訊。

**工具：**

| 工具 | 類型 |
|------|------|
| GitLeaks | 開源 |
| TruffleHog | 開源 |
| GitHub Secret Scanning | GitHub 整合 |

## OWASP Top 10（2021）

| ID | 風險 | 測試重點 |
|----|------|------------|
| A01 | 失效的存取控制（Broken Access Control） | 授權檢查、權限提升 |
| A02 | 加密失效（Cryptographic Failures） | 加密、金鑰管理、資料外洩 |
| A03 | 注入（Injection） | SQL、NoSQL、OS、LDAP injection |
| A04 | 不安全的設計（Insecure Design） | 安全需求、威脅建模（threat modeling） |
| A05 | 安全設定錯誤（Security Misconfiguration） | 預設設定、不必要的功能 |
| A06 | 易受攻擊的元件（Vulnerable Components） | 過時的相依套件、已知 CVE |
| A07 | 身分驗證失效（Authentication Failures） | Session 管理、憑證填充（credential stuffing） |
| A08 | 軟體與資料完整性失效（Software and Data Integrity Failures） | CI/CD pipeline 安全、序列化（serialization） |
| A09 | 安全日誌與監控失效（Security Logging and Monitoring Failures） | 稽核日誌、警示 |
| A10 | 伺服器端請求偽造（Server-Side Request Forgery） | URL 驗證、網路分段（network segmentation） |

## CI 整合

### GitHub Actions 範例

```yaml
name: Security Scan
on: [push, pull_request]
jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1

  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk
        uses: snyk/actions/node@master

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
```

## 規則

| 規則 | 描述 | 優先級 |
|------|-------------|----------|
| CI 中的 SAST | 在每條建置 pipeline 中納入 SAST | 必要 |
| 相依套件掃描 | 掃描所有相依套件的漏洞 | 必要 |
| 機密掃描 | 在 push 之前掃描外洩的機密資訊 | 必要 |
| DAST staging | 針對 staging 環境執行 DAST | 建議 |
| 年度滲透測試 | 至少每年進行一次滲透測試 | 建議 |
| OWASP 檢查清單 | 在測試計畫中涵蓋所有 OWASP Top 10 風險 | 必要 |

## 快速參考

| 類型 | 縮寫 | 何時 | 工具 |
|------|--------------|------|-------|
| 靜態分析 | SAST | CI/CD | SonarQube, Semgrep |
| 動態分析 | DAST | Staging | OWASP ZAP, Burp |
| 相依套件掃描 | SCA | 每次建置 | Snyk, Dependabot |
| 滲透測試 | Pentest | 每年 | 手動／專業人員 |
| 機密掃描 | - | Pre-commit | GitLeaks, TruffleHog |

## 相關選項

- [效能測試（Performance Testing）](./performance-testing.md) - 效能測試實踐
- [單元測試（Unit Testing）](./unit-testing.md) - 單元測試實踐

---

## 參考資料

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST SP 800-115](https://csrc.nist.gov/publications/detail/sp/800-115/final)

---

## 授權

本文件依 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
