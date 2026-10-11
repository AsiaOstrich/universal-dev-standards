---
source: ../../../core/privacy-standards.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 2f216c008c09
status: current
---

# 隱私標準

> **語言**: [English](../../../core/privacy-standards.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-06-18
**適用範圍**: 所有處理個人資料的軟體專案
**Scope**: universal
**業界標準**: GDPR、CCPA、Privacy by Design（Ann Cavoukian）
**參考資料**: [gdpr.eu](https://gdpr.eu/)、[ipc.on.ca](https://www.ipc.on.ca/)

---

## 概述

本文件定義在軟體生命週期中保護使用者資料的隱私標準，基於 Privacy by Design 原則與國際資料保護法規。

---

## Privacy by Design 原則

七大基礎原則（Ann Cavoukian，2009）：

| # | 原則 | 說明 |
|---|------|------|
| 1 | **主動而非被動** | 在隱私問題發生前預見並預防 |
| 2 | **預設隱私保護** | 個人資料自動受到保護；使用者無須採取任何動作 |
| 3 | **隱私嵌入設計** | 隱私是系統架構不可或缺的一部分，而非附加元件 |
| 4 | **完整功能 — 正和** | 隱私「與」功能兼得，而非隱私「或」功能二擇一 |
| 5 | **端到端安全** | 資料在整個生命週期（從收集到刪除）中都受到保護 |
| 6 | **可見性與透明度** | 所有實踐皆有文件記錄、可驗證，並接受檢視 |
| 7 | **尊重使用者隱私 — 以使用者為中心** | 使用者利益至上；提供強預設值與明確選項 |

---

## 資料分類

依敏感程度為所有資料分類：

| 等級 | 說明 | 處理要求 |
|------|------|---------|
| **公開** | 可自由分享（行銷內容、文件） | 無限制 |
| **內部** | 僅供內部使用（內部報告、會議記錄） | 存取控制，不得公開分享 |
| **機密** | 敏感商業資料（財務、策略） | 靜態／傳輸加密、稽核日誌、需知原則存取 |
| **受限** | 高度敏感的 PII、健康、財務資料（身分證號、病歷） | 最強加密、嚴格存取、資料遮罩、法規合規 |

---

## 資料保護影響評估（DPIA）

### 觸發條件

在以下情況必須執行 DPIA：
- **大規模**處理個人資料（見下方量化準則）
- 系統性監控公共區域
- 具法律效力的自動化決策
- 處理特殊類別資料（健康、生物識別、基因）
- 合併不同來源的資料集
- 處理弱勢族群資料（兒童、員工）

> **「大規模」— 量化準則** _（來源：GDPR 第 35 條；WP29 DPIA
> 指引 WP248rev.01）_。「大規模」沒有單一的硬性數字定義；請依四項因素評估：
> (1) 資料主體人數 — 絕對數量或佔相關母體的比例；(2) 資料項目的數量與範圍；
> (3) 處理的持續時間或永久性；(4) 地理範圍。當處理在**兩項以上**因素達顯著
> 程度時，即視為大規模。
> **例外**：一次性處理、單一個人的資料，或個別執業者的紀錄不屬於「大規模」，
> 不會僅因此一理由觸發 DPIA（但上方其他觸發條件仍可能適用）。

### 簡化 DPIA 範本

```markdown
## DPIA: [Project/Feature Name]

### 1. Data Processing Description
- What data is collected?
- Why is it collected?
- How is it processed?
- Who has access?

### 2. Necessity Assessment
- Is all collected data necessary for the stated purpose?
- Can the purpose be achieved with less data?

### 3. Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| [Risk description] | High/Med/Low | High/Med/Low | [Mitigation measure] |

### 4. Decision
- [ ] Proceed as planned
- [ ] Proceed with mitigations
- [ ] Redesign required
- [ ] Do not proceed
```

---

## 資料最小化

### 核心原則

| 原則 | 說明 |
|------|------|
| **僅收集必要資料** | 每個資料欄位須有文件化的用途 |
| **定義保留期限** | 每種資料類型須有明確的保留期限 |
| **到期自動刪除** | 超過保留期限的資料須自動刪除或匿名化 |
| **目的限制** | 為某目的收集的資料，未經同意不得用於其他目的 |
| **儲存限制** | 資料保存時間不得超過其用途所需 |

### 保留期限指南

| 資料類型 | 建議保留期限 | 理由 |
|---------|------------|------|
| Session 資料 | Session 期間 | 登出後即不再需要 |
| 活動日誌 | 90 天 | 除錯與支援 |
| 帳號資料 | 帳號刪除後 + 30 天 | 復原的寬限期 |
| 交易記錄 | 7 年 | 稅務／稽核合規 |
| 行銷偏好 | 直到撤回同意 | 以同意為基礎 |

---

## 使用者權利

支援以下 5 項基本使用者權利：

| 權利 | 說明 | 實作方式 |
|------|------|---------|
| **存取** | 使用者可請求取得其個人資料副本 | 匯出端點，機器可讀格式（JSON/CSV） |
| **更正** | 使用者可更正不正確的個人資料 | 編輯個人檔案；非自助欄位提供支援管道 |
| **刪除**（被遺忘權） | 使用者可請求刪除其資料 | 帳號刪除流程，30 天內連帶刪除備份 |
| **資料可攜** | 使用者可以可攜格式接收其資料 | 標準格式匯出（JSON、CSV），提供批次匯出 API |
| **反對** | 使用者可反對特定處理活動 | Opt-out 機制、細粒度的同意管理 |

---

## 隱私檢查清單

在推出處理個人資料的新功能前，請確認：

- [ ] **資料盤點**：所有個人資料欄位皆已文件化用途與法律依據
- [ ] **最小化**：僅收集必要資料；不收集「有了也不錯」的欄位
- [ ] **同意**：在需要時取得使用者同意（opt-in，不可預先勾選）
- [ ] **保留**：已定義保留期限並設定自動刪除
- [ ] **存取控制**：僅授權人員可存取資料
- [ ] **加密**：資料於靜止與傳輸中皆已加密
- [ ] **使用者權利**：使用者可存取、更正、刪除與匯出其資料
- [ ] **第三方**：與第三方的資料共享已文件化且合法
- [ ] **DPIA**：已完成影響評估（如符合觸發條件）
- [ ] **外洩計畫**：資料外洩通知流程已就位

---

## Quick Reference Card

### 資料處理決策
```
Is it personal data?
├─ No → Standard handling
└─ Yes
   ├─ Is it special category (health, biometric)?
   │  └─ Yes → Restricted + DPIA required
   └─ No
      ├─ Is it identifiable (name, email)?
      │  └─ Yes → Confidential
      └─ No (anonymized/aggregated) → Internal
```

---

## 參考資料

- [GDPR 全文](https://gdpr.eu/) — 歐盟資料保護法規
- [Privacy by Design — 七大基礎原則](https://www.ipc.on.ca/) — Ann Cavoukian
- [CCPA](https://oag.ca.gov/privacy/ccpa) — 加州消費者隱私法
- [OWASP Privacy Risks](https://owasp.org/www-project-top-10-privacy-risks/) — 十大隱私風險

---

**相關標準：**
- [安全標準](security-standards.md) — 資料保護的安全控制
- [日誌標準](logging-standards.md) — 日誌中的 PII 處理
- [環境標準](environment-standards.md) — 機密管理
- [測試資料標準](test-data-standards.md) — 測試用資料匿名化

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|------|------|---------|
| 1.1.0 | 2026-06-18 | 新增：量化的「大規模」DPIA 觸發準則（GDPR 第 35 條／WP29 WP248）＋ 例外條款（XSPEC-292 T8） |
| 1.0.0 | 2026-04-01 | 初始版本 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。
