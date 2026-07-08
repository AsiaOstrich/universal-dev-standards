---
source: ../../../core/security-testing.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-07-08
source_hash: 242e9016416c
status: current
---

# 資安測試標準

> **Language**: [English](../../../core/security-testing.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-06-19
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

## 發現事項修復生命週期

上述各層負責偵測發現，CVE 政策則設定解決時限（SLA），但一個發現事項還需要一個**有負責人的生命週期**——否則「阻擋 merge」就是唯一定義好的動作，偵測之後的一切都沒有定義。每個資安發現（SAST / DAST / 機密 / 相依套件 CVE）都遵循以下狀態機。

| 狀態 | 意義 | 負責人 | 結束條件 |
|-------|---------|-------|----------------|
| **Detected（已偵測）** | 由某一層（SAST/DAST/機密/稽核）提出 | 掃描閘門（CI） | 已指派嚴重度 |
| **Triaged（已分診）** | 已確認嚴重度與有效性（真實 vs 誤判） | 資安審查者 | 真實 → 轉為 In-Progress；誤判 → 標記為 `suppressed` 並記錄理由 |
| **In-Progress（處理中）** | 修復正在實作 | 受影響元件的程式碼負責人 | 修復已提交 |
| **Resolved（已解決）** | 修復已合併 | 程式碼負責人 | 原掃描重新執行後乾淨無發現 |
| **Verified（已驗證）** | 重新掃描確認發現已消失 | 掃描閘門（CI） | 發現事項關閉 |

- **閘門**：任何 Critical/High 發現若狀態非 `Verified`（或 `Triaged → suppressed` 且附有理由），皆**阻擋發布**，與上述 CVE 回應政策的 SLA 一致。
- **不得靜默關閉**：發現事項只能透過 `Verified`（重新掃描乾淨）或資安審查者明確記錄的 `suppressed` 決定離開此生命週期——絕不可透過刪除，也不可由修復作者自行核准關閉。

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
