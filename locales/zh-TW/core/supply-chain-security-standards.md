---
source: ../../../core/supply-chain-security-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
---

# 供應鏈安全標準

> 版本: 1.0.0 | 最後更新: 2026-04-01

## 概述

本文件定義供應鏈安全標準，涵蓋軟體物料清單（SBOM）、相依性稽核、SLSA 成熟度等級、授權合規與相依性健康評估。

## 軟體物料清單（SBOM）

### 格式比較

| 面向 | SPDX | CycloneDX |
|------|------|-----------|
| **維護者** | Linux Foundation | OWASP |
| **主要焦點** | 授權合規 + 安全 | 安全 + 元件分析 |
| **格式** | JSON, RDF, YAML, Tag-Value | JSON, XML, Protobuf |
| **ISO 標準** | ISO/IEC 5962:2021 | ECMA-424 |

### 需求

- 每次發布必須包含 SBOM，列出所有直接與間接相依性
- SBOM 必須包含：元件名稱、版本、供應商、授權、已知漏洞
- SBOM 應作為 CI/CD Pipeline 的一部分自動產生

## 相依性稽核

### 四大稽核維度

| 維度 | 檢查項目 | 嚴重性 |
|------|---------|--------|
| **已知漏洞** | CVE 資料庫（NVD, OSV, GitHub Advisory） | Critical: 阻擋, High: 警告 |
| **授權合規** | 授權與專案授權的相容性 | 不相容: 阻擋 |
| **維護狀態** | 最後提交日期、開放 Issue、維護者數量 | 超過 2 年未維護: 警告 |
| **版本時效** | 落後最新版本多少個 Major/Minor | 落後 Major > 2: 警告 |

## SLSA 等級

| 等級 | 需求 | 適用情境 |
|------|------|---------|
| **L1 — Provenance** | 建構流程文件化；產生 SBOM | 所有專案（最低基準） |
| **L2 — Build Service** | 在託管服務上建構；簽署 Provenance | 有 CI/CD Pipeline 的專案 |
| **L3 — Hardened Builds** | 隔離、短暫的建構環境；不可偽造的 Provenance | 安全關鍵應用 |
| **L4 — Two-Party Review** | 所有變更需兩人審查；密封式建構 | 基礎設施、金融系統 |

## 授權合規

### 授權類別矩陣

| 類別 | 範例 | 相容性 | 風險 |
|------|------|--------|------|
| **寬鬆式** | MIT, Apache-2.0, BSD | 幾乎與所有授權相容 | 低 |
| **弱 Copyleft** | LGPL-2.1, MPL-2.0 | 作為函式庫使用時相容 | 中 |
| **強 Copyleft** | GPL-2.0, GPL-3.0 | 衍生作品須使用相同授權 | 高 |
| **網路 Copyleft** | AGPL-3.0 | Copyleft 延伸至網路互動 | 極高 |
| **專有** | 自訂、無授權 | 未經明確許可不得使用 | 阻擋 |

## 相依性更新策略

| 更新類型 | 策略 | 自動化 |
|---------|------|--------|
| **Patch** (x.y.Z) | CI 通過後自動合併 | 全自動 |
| **Minor** (x.Y.0) | 自動建立 PR，人工審查 | 半自動 |
| **Major** (X.0.0) | 人工評估，遷移計畫 | 手動 |

## 快速參考卡

```
新增相依性？ → 檢查：授權相容？無 CVE？有維護？夠普及？
CI 建構？    → 自動掃描漏洞 + 授權
發布？      → 產生 SBOM，審查所有警告
Critical CVE？ → 48 小時內修補
```

---

**相關標準：**
- [安全標準](security-standards.md) - 應用程式安全
- [容器化標準](containerization-standards.md) - 映像檔漏洞掃描

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
