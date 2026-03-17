---
source: ../../../docs/DEV-WORKFLOW-MAPPING.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-17
status: current
---

# UDS 開發工作流程對照表

> 將軟體開發生命週期階段對應到 UDS 指令與功能。

**Language**: [English](../../../docs/DEV-WORKFLOW-MAPPING.md) | 繁體中文

---

## 概覽

Universal Development Standards (UDS) 提供 **20+ 斜線指令**，涵蓋整個軟體開發生命週期。本文件將每個開發階段對應到對應的 UDS 指令，幫助開發者快速找到適合目前任務的工具。

### 快速存取

- **互動式指南**：在 Claude Code 中使用 `/dev-workflow`
- **日常工作流程**：參見 [DAILY-WORKFLOW-GUIDE.md](../../../adoption/DAILY-WORKFLOW-GUIDE.md)

---

## 軟體開發生命週期 × UDS 指令

### 完整對照表

| # | 階段 | UDS 指令 | 說明 |
|---|------|----------|------|
| I | **需求與設計** | `/brainstorm` `/requirement` `/sdd` `/reverse` | 從構想到規格 |
| II | **測試驅動開發** | `/bdd` `/atdd` `/tdd` `/coverage` `/derive` | 先設計測試再寫程式 |
| III | **程式碼開發** | `/refactor` `/reverse` | 撰寫與改善程式碼 |
| IV | **品質保證** | `/checkin` `/review` | 提交前與程式碼審查 |
| V | **版本與提交** | `/commit` `/changelog` `/release` | 版本管理、提交、發布 |
| VI | **文件與架構** | `/docs` `/docgen` `/struct` | 文件與專案結構 |
| VII | **工具與標準參考** | `/discover` `/guide` | 健康檢查與參考資料 |
| VIII | **進階系統分析** | `/methodology` | 跨方法論工作流程 |

---

## 階段詳解

### I. 需求與設計

將構想轉化為可執行的規格。

| 指令 | 功能說明 | 輸入 | 輸出 |
|------|----------|------|------|
| `/brainstorm` | 結構化創意發想，支援 HMW、SCAMPER、六頂思考帽 | 模糊的想法或問題 | 附建議的評估提案 |
| `/requirement` | 撰寫符合 INVEST 的使用者故事 | 功能概念 | 含驗收條件的使用者故事 |
| `/sdd` | 建立規格文件 | 需求 | 含 API、資料模型、AC 的技術規格 |
| `/reverse` | 逆向工程現有程式碼 | 程式碼路徑或模組 | 規格、圖表或覆蓋率地圖 |

### II. 測試驅動開發

在撰寫正式程式碼之前先設計與建構測試。

| 指令 | 功能說明 | 輸入 | 輸出 |
|------|----------|------|------|
| `/bdd` | 行為驅動開發 | 使用者故事 | Gherkin Given/When/Then 場景 |
| `/atdd` | 驗收測試驅動開發 | 驗收條件 | 結構化驗收測試表 |
| `/tdd` | 測試驅動開發 | 要實作的功能 | Red-Green-Refactor 引導式工作流程 |
| `/coverage` | 分析測試覆蓋率 | 測試套件 | 含差距分析的覆蓋率報告 |
| `/derive` | 從規格自動衍生測試 | SDD 規格 | BDD、TDD 或 ATDD 測試結構 |

### III. 程式碼開發

撰寫與改善正式程式碼。

| 指令 | 功能說明 | 輸入 | 輸出 |
|------|----------|------|------|
| `/refactor` | 引導式重構策略 | 要改善的程式碼 | 含安全檢查的重構計畫 |
| `/reverse` | 在修改前理解程式碼 | 程式碼路徑 | 資料流、執行期行為分析 |

### IV. 品質保證

確保提交前的程式碼品質。

| 指令 | 功能說明 | 輸入 | 輸出 |
|------|----------|------|------|
| `/checkin` | 提交前品質驗證 | 暫存的變更 | 通過/失敗檢查清單（建置、測試、密碼、風格） |
| `/review` | 系統化程式碼審查（10 個面向） | 程式碼差異或 PR | 含嚴重性前綴的審查意見 |

### V. 版本與提交

建立有意義的提交並管理版本發布。

| 指令 | 功能說明 | 輸入 | 輸出 |
|------|----------|------|------|
| `/commit` | Conventional Commits 格式 | 暫存的變更 | 格式化的提交訊息 |
| `/changelog` | 產生變更日誌項目 | 版本範圍 | CHANGELOG.md 項目 |
| `/release` | 版本發布流程管理 | 版本號 | 發布檢查清單與自動化 |

### VI. 文件與架構

維護專案文件與結構。

| 指令 | 功能說明 | 輸入 | 輸出 |
|------|----------|------|------|
| `/docs` | 文件管理 | 文件需求 | 結構化文件 |
| `/docgen` | 自動產生使用文件 | 原始碼 | API 文件、使用參考 |
| `/struct` | 專案結構指南 | 專案類型 | 目錄慣例 |

### VII. 工具與標準參考

存取參考指南與專案健康檢查。

| 指令 | 功能說明 | 輸入 | 輸出 |
|------|----------|------|------|
| `/discover` | 專案健康評估 | 專案路徑 | 含風險的健康分數（0-10） |
| `/guide [topic]` | 存取任何 UDS 標準 | 主題名稱 | 標準參考內容 |

可用的 `/guide` 主題：`testing`、`error-codes`、`logging`、`git`、`ai-collab`、`ai-instruction`、`ai-arch`

### VIII. 進階系統分析

適用於複雜專案的跨方法論工作流程。

| 指令 | 功能說明 | 輸入 | 輸出 |
|------|----------|------|------|
| `/methodology` | 編排多方法論流程 | 工作流程類型 | 引導式 ATDD→SDD→BDD→TDD 管線 |

---

## 場景化工作流程

### 1. 完整新功能開發

從構想到發布的完整 15 步工作流程：

```
步驟 1:  /brainstorm         探索想法與方法
步驟 2:  /requirement        撰寫使用者故事
步驟 3:  /sdd               建立規格文件
步驟 4:  /derive-bdd        從規格產生 BDD 場景
步驟 5:  /derive-tdd        從規格產生 TDD 骨架
步驟 6:  /bdd               精煉 BDD 場景
步驟 7:  /tdd               以 Red-Green-Refactor 實作
步驟 8:  /coverage           檢查測試覆蓋率
步驟 9:  /refactor           提升程式碼品質
步驟 10: /checkin            驗證品質關卡
步驟 11: /commit             建立 Conventional Commit
步驟 12: /review             程式碼審查（若有 PR）
步驟 13: /docs               更新文件
步驟 14: /changelog          更新 CHANGELOG
步驟 15: /release            發布版本
```

### 2. 修復錯誤

```
步驟 1:  /discover           評估受影響範圍
步驟 2:  /reverse            理解現有行為
步驟 3:  /tdd               撰寫失敗測試 → 修復 → 驗證
步驟 4:  /checkin            驗證品質關卡
步驟 5:  /commit             以 "fix(...)" 前綴提交
```

### 3. 程式碼重構

```
步驟 1:  /discover           評估專案健康狀態
步驟 2:  /reverse            記錄目前行為
步驟 3:  /coverage           確保測試安全網
步驟 4:  /refactor           套用重構策略
步驟 5:  /checkin            驗證無破壞性變更
步驟 6:  /commit             以 "refactor(...)" 前綴提交
```

### 4. 既有專案新增功能

```
步驟 1:  /discover           評估專案健康狀態與風險
步驟 2:  /reverse spec       將現有程式碼逆向工程為規格
步驟 3:  /sdd               為新功能撰寫規格
步驟 4:  /derive             從規格產生測試
步驟 5:  /tdd               以測試保護實作
步驟 6:  /checkin            驗證品質關卡
步驟 7:  /commit             建立 Conventional Commit
```

---

## 與其他指南的關係

| 文件 | 重點 | 適用對象 |
|------|------|----------|
| **本文件**（DEV-WORKFLOW-MAPPING.md） | 階段與指令對照，快速參考 | 尋找合適指令的開發者 |
| [DAILY-WORKFLOW-GUIDE.md](../../../adoption/DAILY-WORKFLOW-GUIDE.md) | 詳細的日常工作流程與決策樹 | 學習 UDS 採用模式的開發者 |
| [CHEATSHEET.md](../../../docs/CHEATSHEET.md) | 所有 UDS 功能一頁總覽 | 快速查閱 |
| `/dev-workflow` skill | Claude Code 中的互動式指南 | AI 輔助開發 |

---

## 快速決策指南

**「我需要...」**

| 需求 | 指令 |
|------|------|
| 從模糊的想法開始 | `/brainstorm` |
| 撰寫需求 | `/requirement` |
| 建立技術規格 | `/sdd` |
| 理解現有程式碼 | `/reverse` 或 `/discover` |
| 從規格產生測試 | `/derive` |
| 撰寫測試（BDD 風格） | `/bdd` |
| 撰寫測試（TDD 風格） | `/tdd` |
| 檢查測試覆蓋率 | `/coverage` |
| 改善程式碼結構 | `/refactor` |
| 提交前檢查 | `/checkin` |
| 建立提交訊息 | `/commit` |
| 審查程式碼品質 | `/review` |
| 更新文件 | `/docs` 或 `/docgen` |
| 準備發布版本 | `/changelog` 然後 `/release` |
| 查詢標準 | `/guide [topic]` |
| 執行完整方法論 | `/methodology` |

---

[完整功能參考](../../../docs/FEATURE-REFERENCE.md) | [GitHub](https://github.com/AsiaOstrich/universal-dev-standards)
