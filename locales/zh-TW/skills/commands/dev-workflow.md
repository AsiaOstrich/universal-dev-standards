---
source: ../../../../skills/commands/dev-workflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 9803ce2cc49f
status: current
---

---
name: dev-workflow
description: "[UDS] 將軟體開發階段對應到 UDS 指令與功能的指南"
argument-hint: "[phase name | scenario | 階段名稱 | 場景]"
---

# 開發工作流程指南

> **Language**: [English](../../../../skills/commands/dev-workflow.md) | 繁體中文

將你目前的開發階段對應到 UDS 指令。了解在每個階段應該使用哪些工具。

## 情境感知啟動

當調用 `/dev-workflow` 時，AI 助手必須先檢查專案的工作流程狀態：

### 步驟 1：檢查進行中的工作流程

```bash
ls .workflow-state/*.yaml .workflow-state/*.json 2>/dev/null
```

**如果有進行中的工作流程：**

1. 顯示進行中的工作流程摘要（名稱、階段、進度）
2. 建議繼續：「你有一個進行中的 **{workflow}**，目前在 **{phase}** 階段。要用 `/{command}` 繼續嗎？」
3. 根據目前階段顯示適當的下一步指令

**階段 → 下一步指令對應：**

| 工作流程 | 目前階段 | 建議的下一步指令 |
|----------|----------|------------------|
| SDD | discuss | `/sdd create` |
| SDD | create | `/sdd review` |
| SDD | review | `/sdd approve` |
| SDD | approve | `/sdd implement` |
| SDD | implement | `/sdd verify` |
| TDD | red | 撰寫失敗測試，然後執行測試 |
| TDD | green | 撰寫最少程式碼使測試通過 |
| TDD | refactor | 清理程式碼，然後 `/tdd` 進入下一輪 |
| BDD | discovery | `/bdd` 制定場景 |
| BDD | formulation | 撰寫 `.feature` 檔案 |
| BDD | automation | 實作步驟定義 |

**如果沒有進行中的工作流程：**

繼續顯示下方的標準階段總覽。

### 步驟 2：檢查活躍規格

```bash
ls docs/specs/SPEC-*.md 2>/dev/null
```

如果有活躍規格存在，標示出來並建議適當的工作流程階段。

---

## 用法

```bash
/dev-workflow                    # 顯示完整階段總覽
/dev-workflow planning           # Phase I：規劃與設計
/dev-workflow testing            # Phase II：測試驅動開發
/dev-workflow implementation     # Phase III：實作
/dev-workflow quality            # Phase IV：品質關卡
/dev-workflow release            # Phase V：發布與提交
/dev-workflow docs               # Phase VI：文件
/dev-workflow standards          # Phase VII：工具與規範
/dev-workflow advanced           # Phase VIII：進階分析
/dev-workflow new-feature        # 場景：新功能工作流程
/dev-workflow bug-fix            # 場景：修復錯誤工作流程
/dev-workflow refactoring        # 場景：重構工作流程
```

## 快速對照表

| 階段 | UDS 指令 | 用途 |
|------|----------|------|
| **I. 規劃** | `/brainstorm` `/requirement` `/sdd` `/reverse` `/api-design` `/database` | 需求、規格、API/DB 設計 |
| **II. 測試** | `/bdd` `/atdd` `/tdd` `/coverage` `/derive` `/ac-coverage` | 先寫測試再寫程式 |
| **III. 實作** | `/refactor` `/reverse` `/migrate` `/durable` | 撰寫、改善與遷移程式碼 |
| **IV. 品質** | `/checkin` `/code-review` `/security` `/scan` `/incident` | 品質、安全、事故回應 |
| **V. 發布** | `/commit` `/changelog` `/release` `/pr` `/ci-cd` | 版本、提交、PR、CI/CD |
| **VI. 文件** | `/docs` `/docgen` | 文件與專案結構 |
| **VII. 規範** | `/discover` `/guide` `/metrics` `/audit` | 參考指南、指標、稽核 |
| **VIII. 進階** | `/methodology` | 跨方法論工作流程 |

## 常見場景

### 新功能

```
/brainstorm → /requirement → /sdd → /derive → /tdd → /checkin → /commit
```

### 修復錯誤

```
/discover → /reverse → /tdd → /checkin → /commit
```

### 重構

```
/discover → /reverse → /coverage → /refactor → /checkin → /commit
```

### 安全審查

```
/scan → /security → /checkin → /commit
```

### API 設計

```
/brainstorm → /api-design → /sdd → /derive → /tdd → /pr
```

## AI 代理行為

> 遵循 [AI 命令行為標準](../../core/ai-command-behavior.md)

### 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/dev-workflow` | 先檢查 `.workflow-state/`，有活躍工作流程則顯示狀態，否則展示全階段總覽 |
| `/dev-workflow <phase>` | 展示指定階段的詳細指令和說明 |
| `/dev-workflow <scenario>` | 展示指定場景的推薦工作流程（new-feature / bug-fix / refactoring） |

### 互動腳本

1. 檢查 `.workflow-state/` 和 `docs/specs/` 的活躍狀態
2. 依據結果決定展示內容

**決策：活躍工作流程**
- IF 有進行中的 workflow → 顯示狀態摘要，建議 resume 命令
- IF 有活躍 spec → 提示 spec 進度，建議下一步
- ELSE → 展示完整階段總覽或指定內容

**決策：場景模式**
- IF 指定場景（new-feature / bug-fix / refactoring） → 展示該場景的推薦命令序列
- ELSE → 展示總覽表

### 停止點

此命令為純查詢/導引，無需停止點。

### 錯誤處理

| 錯誤情況 | AI 動作 |
|----------|---------|
| 指定的 phase/scenario 不存在 | 列出可用的 phase 和 scenario |
| `.workflow-state/` 目錄不存在 | 跳過活躍工作流程檢查，直接展示總覽 |

## 參考

- [開發工作流程技能](../dev-workflow-guide/SKILL.md)
- [詳細階段指南](../../../../skills/dev-workflow-guide/workflow-phases.md)
- [每日工作流程指南](../../adoption/DAILY-WORKFLOW-GUIDE.md)
