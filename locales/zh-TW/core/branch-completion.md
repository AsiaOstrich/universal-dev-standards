---
source: ../../../core/branch-completion.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
---

# 分支完成工作流程

> **語言**: [English](../../../core/branch-completion.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-20
**適用性**: 所有使用 Git 分支工作流的專案
**範圍**: 通用 (Universal)
**靈感來源**: [Superpowers](https://github.com/obra/superpowers) — finishing-a-development-branch (MIT)

---

## 目的

定義分支完成的標準化工作流，包含前置檢查、四個完成選項與安全丟棄流程。防止過早合併、遺忘分支與意外資料遺失。

---

## 術語表

| 術語 | 定義 |
|------|------|
| 分支完成 (Branch Completion) | 完成功能/修復分支工作的過程 |
| 前置條件 (Prerequisites) | 分支被視為完成前必須滿足的條件 |
| 丟棄確認 (Discard Confirmation) | 刪除工作前需要明確輸入的安全機制 |

---

## 核心原則 — 先測試再討論

> **所有測試必須通過，才能討論完成選項。**

---

## 前置條件

在選擇任何完成選項之前，必須通過以下檢查：

| 檢查項目 | 說明 |
|----------|------|
| 所有測試通過 | `npm test` 或專案對應的測試指令 |
| 無未提交的變更 | `git status` 顯示乾淨的工作目錄 |
| 分支已與目標分支同步 | 已 rebase 或 merge 最新的目標分支 |
| 程式碼品質通過 | linting、type check 等品質門檻 |

## 四個完成選項

| 選項 | 適用場景 | 指令 |
|------|----------|------|
| **Merge** | 功能完成，準備合併到目標分支 | `git merge` 或建立 PR |
| **Squash Merge** | 多個小提交需要壓縮為一個 | `git merge --squash` |
| **Rebase** | 保持線性歷史 | `git rebase target-branch` |
| **Discard** | 放棄此分支的工作 | 需丟棄確認 |

## 安全丟棄流程

丟棄分支前必須：

1. **確認** — 明確輸入分支名稱確認丟棄意圖
2. **備份** — 建立標籤保留最後狀態：`git tag archive/branch-name`
3. **清理** — 刪除本地和遠端分支

## 相關標準

- [Git Worktree 隔離](git-worktree.md)
- [代理派遣與並行協調](agent-dispatch.md)
- [提交規範](checkin-standards.md)
- [Git 工作流](git-workflow.md)
