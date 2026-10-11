---
source: ../../../core/knowledge-transfer-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 7d994f996240
status: current
---

# 知識傳承標準

> **語言**: [English](../../../core/knowledge-transfer-standards.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-31
**適用性**: 所有軟體專案
**範圍**: universal（通用）
**參考資料**: [Atlassian Knowledge Transfer](https://www.atlassian.com/work-management/knowledge-sharing), [Google re:Work](https://rework.withgoogle.com/)

---

## 概述

本文件定義知識傳承標準，涵蓋 Onboarding、Handoff、Bus Factor 評估及 Code Tour 機制。目標是確保關鍵知識不會因團隊成員離職或角色轉換而消失。

---

## Onboarding 路線圖

結構化的 30 天 Onboarding 流程，幫助新成員快速發揮生產力。

### 4 週路線圖

| 週次 | 主題 | 目標 | 交付物 |
|------|-------|------|-------------|
| **第 1 週** | 環境與文化 | 完成開發環境設定；理解團隊規範與慣例 | 成功建置並執行專案 |
| **第 2 週** | 架構與程式碼 | 理解系統架構與關鍵路徑 | 完成 Code Tour |
| **第 3 週** | 流程與工具 | 理解 CI/CD、部署與監控流程 | 完成第一個 PR |
| **第 4 週** | 獨立貢獻 | 獨立完成一個小型任務 | 通過 Buddy 評估 |

### Onboarding 檢查清單

每位新成員應在到職第一天及第一週內完成以下檢查清單：

| 類別 | 項目 |
|----------|-------|
| **帳號存取** | Git 儲存庫、CI/CD 平台、監控工具、雲端控制台、通訊工具（Slack/Teams） |
| **環境設定** | 開發環境、IDE 設定、VPN 存取、資料庫存取、本地建置驗證 |
| **文件** | README、架構文件、API 文件、CLAUDE.md 或等效的 AI 脈絡檔案 |
| **會議** | 與 Buddy 1:1、團隊介紹、架構概覽說明會 |
| **首要任務** | 指派 Good First Issue、完成 Code Tour、提交第一個小型 PR |

---

## Handoff 流程

當團隊成員即將離職或轉換角色時，使用此結構化 Handoff 流程以防止知識流失。

### Handoff 檢查清單

| 項目 | 說明 | 時程 |
|------|-------------|----------|
| **負責清單** | 列出此人負責的所有模組、服務與流程 | 離職前 4 週 |
| **隱性知識記錄** | 使用下方的知識記錄格式，記錄所有「只有我知道」的操作、技巧與陷阱 | 離職前 3 週 |
| **WIP 交接** | 移交所有進行中的任務、開啟中的 PR 與事件追蹤項目 | 離職前 2 週 |
| **Buddy 配對** | 指定繼任者，並針對複雜領域進行 Pair Programming | 離職前 2 週 |
| **帳號與權限移交** | 移交 owner 權限、輪換 API 金鑰、更新存取控制 | 離職前 1 週 |
| **Runbook 更新** | 審查並更新所有相關 Runbook，確保內容為最新且完整 | 離職前 1 週 |

### 知識記錄格式

記錄隱性知識時，每筆記錄**應該**包含以下 5 個欄位：

| 欄位 | 說明 | 範例 |
|-------|-------------|---------|
| **主題** | 要捕捉的是什麼知識 | 「支付閘道重試邏輯」 |
| **情境** | 在什麼情況下需要此知識 | 「支付因逾時錯誤而失敗時」 |
| **步驟** | 應遵循的具體程序 | 「1. 檢查閘道狀態頁 2. 檢視重試佇列 3. ...」 |
| **陷阱** | 常見錯誤與注意事項 | 「絕不重試 4xx 錯誤；僅在 5xx 或逾時時重試」 |
| **資源** | 程式碼、文件、Runbook 連結 | 「參見 `src/payment/retry.js`，Runbook：payment-recovery」 |

---

## Bus Factor 評估

Bus Factor 衡量需要有多少團隊成員「被公車撞到」（意外離開），關鍵知識才會流失。Bus Factor 為 1 代表只要一個人離開，就可能使某個系統領域癱瘓。

### 評估指標

針對每個關鍵領域或系統區域，評估以下 3 項指標：

| 指標 | 定義 | 風險等級 |
|--------|-----------|------------|
| **知識人數** | 能獨立處理該領域的人數 | 1 人 = **高**風險、2 人 = **中**、3+ 人 = **低** |
| **文件覆蓋率** | 該領域有書面文件覆蓋的百分比 | < 30% = **高**風險、30-70% = **中**、> 70% = **低** |
| **最近知識分享** | 最近一次有人學習該領域距今多久 | > 6 個月 = **高**風險、3-6 個月 = **中**、< 3 個月 = **低** |

### 知識擴散策略

當發現 Bus Factor = 1 的領域時，使用以下一種或多種策略擴散知識：

| 策略 | 說明 | 最適用於 |
|----------|-------------|----------|
| **Pair Programming** | 專家與學習者一起處理實際任務 | 複雜邏輯、特殊技巧 |
| **Tech Talk** | 專家以結構化場次向團隊分享 | 架構決策、設計理由 |
| **文件化** | 將隱性知識轉換為書面文件或 Runbook | 操作程序、部署步驟 |
| **Code Review 輪調** | 輪換審查者，讓不同人審查不同領域 | 程式碼理解、發現知識孤島 |
| **On-call 輪調** | 在不同服務之間輪換值班 | 維運知識、事件回應 |

---

## Code Tour

Code Tour 提供貫穿程式碼庫的結構化導覽路線，幫助新人不必閱讀每個檔案就能理解系統。

### 導覽路線

每個程式碼庫**應該**至少定義以下導覽路線：

| 路線 | 涵蓋內容 | 目標對象 |
|-------|--------|-----------------|
| **Quick Start** | 進入點、主要設定、啟動流程 | 所有新人 |
| **Request Flow** | 請求從進入到回應的完整路徑 | 後端開發者 |
| **Data Flow** | 資料從建立、儲存到擷取的路徑 | 資料相關開發者 |
| **Deploy Flow** | 從 PR 到正式環境的完整路徑 | 需要部署的人 |
| **Key Decisions** | 重要架構決策及其 ADR | 需要理解「為什麼」的人 |

### Code Tour 維護

程式碼變更時，評估 Code Tour 是否需要更新：

| 變更類型 | 動作 | 理由 |
|-------------|--------|-----------|
| 進入點或路由變更 | **必須**更新導覽 | 導覽中的參照會失效或產生誤導 |
| 內部重構（介面不變） | **不需更新** | 導覽描述的是流程，而非實作細節 |
| 新增重大功能 | **應該**新增導覽路線 | 新功能可能值得擁有專屬的導覽路徑 |

---

## 參考資料

- [Atlassian Knowledge Transfer Guide](https://www.atlassian.com/work-management/knowledge-sharing) — 知識分享最佳實踐
- [Google re:Work — Onboarding](https://rework.withgoogle.com/guides/hiring-shape-the-candidate-experience/steps/make-onboarding-a-great-experience/) — 以證據為基礎的 Onboarding 實踐
- [Bus Factor on Wikipedia](https://en.wikipedia.org/wiki/Bus_factor) — 概念定義與緩解方式

---

**相關標準：**
- [文件生命週期](documentation-lifecycle.md) — 文件維護與審查週期
- [Runbook 標準](runbook-standards.md) — 維運 Runbook 格式與要求

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2026-03-31 | 初始版本：Onboarding 路線圖、Handoff 流程、Bus Factor 評估、Code Tour |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
