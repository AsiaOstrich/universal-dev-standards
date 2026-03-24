---
source: ../../../../skills/dev-workflow-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
description: "[UDS] 將軟體開發階段對應到 UDS 指令與功能的指南"
name: dev-workflow
allowed-tools: Read, Grep, Glob
scope: universal
argument-hint: "[phase name | scenario | 階段名稱 | 場景]"
---

# 開發工作流程指南

> **語言**: [English](../../../../skills/dev-workflow-guide/SKILL.md) | 繁體中文

將你目前的軟體開發階段對應到正確的 UDS 指令與技能。即時了解在開發的每個階段應該使用哪些工具。

> **相關**：如需選擇或切換開發方法論（SDD、BDD、TDD），請改用 `/methodology`。

## 軟體開發階段總覽

```
I. 規劃設計 ──► II. 測試驅動開發 ──► III. 程式碼開發 ──► IV. 品質保證

V. 版本提交 ──► VI. 文件與架構 ──► VII. 工具與標準 ──► VIII. 進階分析
```

### 快速對照表

| 階段 | UDS 指令 | 用途 |
|------|----------|------|
| **I. 規劃與設計** | `/brainstorm` `/requirement` `/sdd` `/reverse` | 需求、規格、逆向工程 |
| **II. 測試驅動開發** | `/bdd` `/atdd` `/tdd` `/coverage` `/derive` | 先寫測試再寫程式 |
| **III. 實作** | `/refactor` `/reverse` | 撰寫與改善程式碼 |
| **IV. 品質關卡** | `/checkin` `/review` | 提交前檢查與程式碼審查 |
| **V. 發布與提交** | `/commit` `/changelog` `/release` | 版本、提交、發布 |
| **VI. 文件** | `/docs` `/docgen` `/struct` | 文件與專案結構 |
| **VII. 工具與標準** | `/discover` `/testing` `/guide` `/git` | 參考指南 |
| **VIII. 進階分析** | `/methodology` | 跨方法論工作流程 |

## 常見場景

### 場景 1：新功能開發

從零開始建立新功能的推薦流程：

```
/brainstorm → /requirement → /sdd → /derive → /tdd → /checkin → /commit
```

| 步驟 | 指令 | 做什麼 |
|------|------|--------|
| 1 | `/brainstorm` | 探索想法與方法 |
| 2 | `/requirement` | 撰寫使用者故事（INVEST 準則） |
| 3 | `/sdd` | 建立規格文件 |
| 4 | `/derive` | 從規格產生測試骨架 |
| 5 | `/tdd` | 用紅綠重構循環實作 |
| 6 | `/checkin` | 驗證品質關卡 |
| 7 | `/commit` | 建立規範化提交 |

### 場景 2：修復錯誤

修復既有程式碼錯誤的推薦流程：

```
/discover → /reverse → /tdd → /checkin → /commit
```

| 步驟 | 指令 | 做什麼 |
|------|------|--------|
| 1 | `/discover` | 評估受影響區域健康度 |
| 2 | `/reverse` | 理解現有程式碼結構 |
| 3 | `/tdd` | 先寫失敗測試，再修復 |
| 4 | `/checkin` | 驗證品質關卡 |
| 5 | `/commit` | 建立規範化提交 |

### 場景 3：重構

程式碼重構的推薦流程：

```
/discover → /reverse → /coverage → /refactor → /checkin → /commit
```

| 步驟 | 指令 | 做什麼 |
|------|------|--------|
| 1 | `/discover` | 評估專案健康度與風險 |
| 2 | `/reverse` | 記錄目前行為 |
| 3 | `/coverage` | 確保測試安全網存在 |
| 4 | `/refactor` | 套用重構策略 |
| 5 | `/checkin` | 驗證品質關卡 |
| 6 | `/commit` | 建立規範化提交 |

## 使用方式

```bash
/dev-workflow                    # 顯示完整階段總覽
/dev-workflow planning           # 取得第 I 階段指引
/dev-workflow testing            # 取得第 II 階段指引
/dev-workflow new-feature        # 取得新功能工作流程
/dev-workflow bug-fix            # 取得修復錯誤工作流程
/dev-workflow refactoring        # 取得重構工作流程
```

### 支援的參數

| 參數 | 說明 |
|------|------|
| `planning` | 第 I 階段：規劃與設計 |
| `testing` | 第 II 階段：測試驅動開發 |
| `implementation` | 第 III 階段：程式碼開發 |
| `quality` | 第 IV 階段：品質保證 |
| `release` | 第 V 階段：版本與提交 |
| `docs` | 第 VI 階段：文件與架構 |
| `standards` | 第 VII 階段：工具與標準 |
| `advanced` | 第 VIII 階段：進階系統分析 |
| `new-feature` | 場景：新功能開發 |
| `bug-fix` | 場景：修復錯誤 |
| `refactoring` | 場景：重構 |

## 工作流程行為

呼叫時：

1. **無參數**：顯示完整的階段總覽表，詢問使用者目前在哪個階段
2. **階段參數**：顯示該階段的詳細指引，包含所有相關指令與範例
3. **場景參數**：顯示該場景的推薦逐步工作流程

## 下一步引導

`/dev-workflow` 完成後，AI 助手應根據使用者情況建議：

> **工作流程已顯示。建議下一步：**
> - 新功能開發 → 執行 `/brainstorm` 探索想法
> - 修復錯誤 → 執行 `/discover` 評估受影響區域
> - 重構程式碼 → 執行 `/discover` 評估健康度
> - 遺留系統 → 執行 `/reverse` 進行系統考古

## 參考

- 詳細階段指引：[workflow-phases.md](../../../../skills/dev-workflow-guide/workflow-phases.md)
- 每日工作流程指南：[DAILY-WORKFLOW-GUIDE.md](../../../../adoption/DAILY-WORKFLOW-GUIDE.md)
