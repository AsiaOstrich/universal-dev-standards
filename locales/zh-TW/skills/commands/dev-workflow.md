---
source: ../../../../skills/commands/dev-workflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
name: dev-workflow
description: "[UDS] Guide for mapping software development phases to UDS commands and features"
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
| **I. 規劃** | `/brainstorm` `/requirement` `/sdd` `/reverse` | 需求、規格、逆向工程 |
| **II. 測試** | `/bdd` `/atdd` `/tdd` `/coverage` `/derive` | 先寫測試再寫程式 |
| **III. 實作** | `/refactor` `/reverse` | 撰寫與改善程式碼 |
| **IV. 品質** | `/checkin` `/review` | 提交前檢查與審查 |
| **V. 發布** | `/commit` `/changelog` `/release` | 版本、提交、發布 |
| **VI. 文件** | `/docs` `/docgen` `/struct` | 文件與專案結構 |
| **VII. 規範** | `/discover` `/guide` | 參考指南 |
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

## 參考

- [開發工作流程技能](../dev-workflow-guide/SKILL.md)
- [詳細階段指南](../dev-workflow-guide/workflow-phases.md)
- [每日工作流程指南](../../adoption/DAILY-WORKFLOW-GUIDE.md)
