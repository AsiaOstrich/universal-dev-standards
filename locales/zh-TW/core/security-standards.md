---
source: ../../../core/security-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-24
status: current
---

# 安全標準

> **語言**: [English](../../../core/security-standards.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-01-29
**適用性**: 所有軟體專案
**範圍**: 通用 (Universal)
**業界標準**: OWASP Top 10 (2021)、OWASP ASVS v4.0、NIST SP 800-53
**參考**: [owasp.org](https://owasp.org/Top10/)

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

## OWASP Top 10 預防清單

| # | 風險 | 預防措施 |
|---|------|----------|
| A01 | 權限控制失效 | RBAC、最小權限、伺服器端驗證 |
| A02 | 加密失敗 | TLS 1.2+、AES-256、安全金鑰管理 |
| A03 | 注入攻擊 | 參數化查詢、輸入驗證、ORM |
| A04 | 不安全設計 | 威脅模型、安全設計審查 |
| A05 | 安全設定錯誤 | 安全預設值、最小化安裝 |
| A06 | 易受攻擊的元件 | 依賴掃描、定期更新 |
| A07 | 認證失敗 | MFA、密碼策略、會話管理 |
| A08 | 資料完整性失敗 | 數位簽章、CI/CD 管線安全 |
| A09 | 記錄與監控不足 | 集中式日誌、告警、SIEM |
| A10 | SSRF | 白名單、網路分區、輸入驗證 |

## 安全測試

| 測試類型 | 工具 | 頻率 |
|----------|------|------|
| SAST（靜態分析） | SonarQube、Semgrep | 每次提交 |
| DAST（動態分析） | OWASP ZAP、Burp Suite | 每次發布 |
| SCA（軟體組成分析） | Snyk、npm audit | 每日 |
| 滲透測試 | 手動/自動化 | 每季 |

## 相關標準

- [部署標準](deployment-standards.md)
- [效能標準](performance-standards.md)
- [測試標準](testing-standards.md)
