---
source: ../../../core/security-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: a9d69cc6a3a7
status: current
---

# 安全標準

> **語言**: [English](../../../core/security-standards.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-01-29
**適用性**: 所有軟體專案
**範圍**: 通用 (Universal)
**業界標準**: OWASP Top 10 (2021)、OWASP ASVS v4.0、NIST SP 800-53
**參考**: [owasp.org](https://owasp.org/Top10/)、[owasp.org](https://owasp.org/www-project-application-security-verification-standard/)

> **詳細說明與範例，請參閱 [安全指南](../../../core/guides/security-guide.md)**

---

## 目的

本標準定義軟體開發的完整安全指南，涵蓋安全程式設計實踐、弱點預防、認證/授權和安全測試。

**參考標準**：
- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [OWASP ASVS v4.0](https://owasp.org/www-project-application-security-verification-standard/)
- [NIST SP 800-53](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)

---

## 核心安全原則

| 原則 | 實作 |
|------|------|
| **最小權限** | 基於角色的存取控制、限時 token |
| **安全失敗** | 認證錯誤時拒絕存取、不暴露堆疊追蹤 |
| **職責分離** | 開發/部署/管理使用不同角色 |
| **縱深防禦** | 不依賴單一控制措施 |
| **預設安全** | 安全預設值、明確選擇較不安全的選項 |
| **零信任** | 驗證每個請求、假設已被入侵 |

---

## OWASP Top 10 預防清單

| 弱點 | 預防措施 |
|------|----------|
| **A01: 權限控制失效** | 預設拒絕、伺服器端檢查、驗證資源擁有權 |
| **A02: 加密失敗** | 加密個人識別資訊（PII）、使用 TLS 1.3、使用機密管理 |
| **A03: 注入攻擊** | 參數化查詢、輸入驗證、使用 ORM |
| **A04: 不安全設計** | 威脅建模、在規格中納入安全需求 |
| **A05: 安全設定錯誤** | 移除預設值、停用未使用功能、安全標頭 |
| **A06: 易受攻擊的元件** | 維護 SBOM、以 npm audit/Snyk 掃描、迅速修補 |
| **A07: 認證失敗** | 強密碼、MFA、安全的會話管理 |
| **A08: 完整性失敗** | 程式碼簽章、驗證 checksum、安全的 CI/CD |
| **A09: 日誌記錄失敗** | 記錄安全事件、保護日誌完整性 |
| **A10: SSRF** | URL 白名單、封鎖內部 IP |

---

## 必要安全標頭

```http
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

---

## 密碼學要求

### 演算法選擇

| 用途 | 必須使用 | 避免使用 |
|------|----------|----------|
| **對稱加密** | AES-256-GCM | DES、3DES、AES-ECB |
| **非對稱加密** | RSA-2048+、ECDSA P-256+ | RSA-1024 |
| **雜湊** | SHA-256、SHA-3、BLAKE3 | MD5、SHA-1 |
| **密碼雜湊** | Argon2id、bcrypt、scrypt | SHA-256、PBKDF2 |
| **TLS 版本** | TLS 1.3、TLS 1.2 | TLS 1.0、TLS 1.1、SSL |

### 密碼雜湊設定

| 演算法 | 設定 |
|--------|------|
| **Argon2id** | 記憶體：64 MB、迭代次數：3、平行度：4、Salt：16 bytes |
| **bcrypt** | 成本因子 ≥ 12 |
| **scrypt** | N=2^17, r=8, p=1 |

---

## 認證要求

### 密碼政策

| 要求 | 最低 | 建議 |
|------|------|------|
| **長度** | 8 個字元 | 12 個字元以上 |
| **外洩密碼檢查** | 必須 | HaveIBeenPwned API |
| **歷史紀錄** | 最近 5 組密碼 | 最近 10 組密碼 |

### 會話管理

| 參數 | 建議值 |
|------|--------|
| **Session ID 長度** | ≥ 128 bits |
| **會話逾時（閒置）** | 15-30 分鐘 |
| **會話逾時（絕對）** | 8-24 小時 |
| **Cookie 旗標** | `Secure; HttpOnly; SameSite=Strict` |

### MFA 要求

- **必須用於**：管理員存取、敏感操作、帳號復原
- **建議用於**：所有使用者帳號
- **優先採用**：WebAuthn（可抵抗網路釣魚）

---

## 授權檢查清單

- [ ] 在伺服器端實作授權（絕不信任用戶端）
- [ ] 每個請求都檢查權限
- [ ] 採用預設拒絕
- [ ] 記錄授權失敗
- [ ] 依使用者/角色實作速率限制
- [ ] 定期審查權限

---

## 輸入驗證規則

| 資料類型 | 驗證方式 |
|----------|----------|
| **Email** | RFC 5322 正規表達式 + 網域檢查 |
| **URL** | 通訊協定白名單、不得為內部 IP |
| **電話** | E.164 格式 |
| **日期** | ISO 8601、合理範圍 |
| **整數** | 型別檢查、最小/最大值界限 |
| **字串** | 長度限制、字元白名單 |
| **檔案** | 類型、大小、magic bytes |

---

## API 安全要求

### 速率限制

| 端點類型 | 限制 | 時間窗口 |
|----------|------|----------|
| **登入** | 5 次嘗試 | 15 分鐘 |
| **API（已認證）** | 1000 個請求 | 1 小時 |
| **API（未認證）** | 100 個請求 | 1 小時 |
| **密碼重設** | 3 個請求 | 1 小時 |

---

## 安全測試要求

| 測試類型 | 頻率 | 目的 |
|----------|------|------|
| **SAST** | 每次提交 | 找出原始碼中的弱點 |
| **DAST** | 每週/每次發布 | 測試執行中的應用程式 |
| **SCA** | 每日 | 檢查相依套件弱點 |
| **滲透測試** | 每季/每年 | 人工安全測試 |
| **安全程式碼審查** | 關鍵變更 | 人工程式碼審查 |

### 建議工具

| 類別 | 工具 |
|------|------|
| **SAST** | SonarQube、Semgrep、CodeQL |
| **DAST** | OWASP ZAP、Burp Suite |
| **SCA** | Snyk、npm audit、Dependabot |
| **機密掃描** | GitLeaks、TruffleHog |

---

## 事件回應嚴重度

| 等級 | 說明 | 回應時間 |
|------|------|----------|
| **P1 嚴重** | 正在發生的入侵、資料外洩 | < 15 分鐘 |
| **P2 高** | 弱點已被利用，無資料遺失 | < 1 小時 |
| **P3 中** | 發現弱點，尚未被利用 | < 24 小時 |
| **P4 低** | 輕微安全問題 | < 1 週 |

---

## 部署前安全檢查清單

### 認證與授權
- [ ] 密碼以 Argon2id/bcrypt 雜湊
- [ ] 所有使用者皆可使用 MFA
- [ ] 會話管理安全（HttpOnly、Secure、SameSite）
- [ ] 每個請求都在伺服器端檢查授權

### 輸入/輸出
- [ ] 所有輸入皆在伺服器端驗證
- [ ] 依情境進行輸出編碼（HTML、JS、URL）
- [ ] 所有資料庫操作使用參數化查詢
- [ ] 檔案上傳經過驗證（類型、大小、內容）

### 密碼學
- [ ] 全面強制 TLS 1.2+
- [ ] 使用強演算法（AES-256、RSA-2048+）
- [ ] 程式碼或版本控制中沒有機密
- [ ] 金鑰存放於機密管理器

### 設定
- [ ] 已設定安全標頭
- [ ] CORS 限制為允許的來源
- [ ] 正式環境已停用除錯模式
- [ ] 已更改預設帳密

### 監控
- [ ] 記錄安全事件
- [ ] 已針對可疑活動設定告警
- [ ] 已文件化事件回應計畫

---

## 相關標準

- [程式碼審查檢查清單](code-review-checklist.md) - 安全審查章節
- [測試標準](testing-standards.md) - 安全測試整合
- [日誌標準](logging-standards.md) - 安全日誌
- [錯誤碼標準](error-code-standards.md) - AUTH 錯誤碼
- [部署標準](deployment-standards.md) - 部署前安全檢查清單

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.1.0 | 2026-01-29 | 重構：拆分為規則 + 指南，將說明移至指南 |
| 1.0.0 | 2026-01-29 | 初始版本 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
