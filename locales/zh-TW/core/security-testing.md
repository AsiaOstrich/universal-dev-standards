---
source: ../../../core/security-testing.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: fa53a8627f24
status: stale
---

# 資安測試標準

> **Language**: [English](../../../core/security-testing.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-05-04
**適用範圍**: 所有軟體專案
**Scope**: universal
**產業標準**: OWASP Testing Guide v4, NIST SP 800-115, ISO/IEC 27001
**參考資料**: OWASP Top 10, CWE/SANS Top 25

---

## 目的

本文件定義軟體專案的資安測試方法論。它與 `security-standards.md`（架構層級的資安設計）互補，提供執行層級的指引：該執行哪些工具、何時執行、以及如何回應發現的問題。

---

## 四個資安測試層

### 1. SAST — 靜態分析

在不執行程式碼的情況下分析原始碼。於 pre-commit 與 CI 中執行。

| 語言 | 工具 | 偵測項目 |
|----------|------|---------|
| TypeScript/JS | eslint-plugin-security | eval 注入、regex DoS、路徑遍歷 |
| Python | bandit | SQL 注入、硬編碼憑證 |
| Java | SpotBugs + FindSecBugs | SQL 注入、XSS |

**閘門**: High/Critical → 阻擋 merge

### 2. 相依套件稽核

掃描第三方套件的已知 CVE。於 pre-push 與每週執行。

| 生態系 | 工具 | 指令 |
|-----------|------|---------|
| Node.js | npm audit | `npm audit --audit-level=high` |
| Python | pip-audit | `pip-audit` |

**閘門**: High/Critical CVE → 阻擋發布（例外須記錄並附到期日）

### 3. 機密掃描

偵測不慎提交的機密資訊。於每次 commit 時執行。

工具: gitleaks、truffleHog

**閘門**: 偵測到任何機密 → 立即阻擋 commit

### 4. DAST — 動態分析

透過 HTTP 測試運行中的應用程式。於 staging 部署後執行。

工具: OWASP ZAP、Nuclei

**閘門**: High/Critical 發現 → 阻擋晉升至 production

---

## CVE 回應政策

| 嚴重度 | 回應 |
|----------|----------|
| Critical | 24 小時內修補；阻擋所有部署 |
| High | 下次發布前解決 |
| Moderate | 14 天內解決 |
| Low | 追蹤；於維護時段解決 |

---

## 反模式

- 將所有 CVE 視為同等緊急
- 對 production 執行 DAST（應使用 staging）
- 無限期忽略 `npm audit`
- 在測試中 mock 身分驗證 middleware（見 mock-boundary.md）

---

## 與其他標準的關係

- `security-standards`: 架構層級的控制措施（輸入驗證、身分驗證設計）
- `mock-boundary`: 測試中絕不 mock 資安控制
- `deployment-standards`: DAST 作為部署管線的一部分執行
