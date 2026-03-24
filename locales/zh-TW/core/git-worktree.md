---
source: ../../../core/git-worktree.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
---

# Git Worktree 隔離

> **語言**: [English](../../../core/git-worktree.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-20
**適用性**: 所有使用 Git 進行版本控制的專案
**範圍**: 通用 (Universal)
**靈感來源**: [Superpowers](https://github.com/obra/superpowers) — using-git-worktrees (MIT)

---

## 目的

定義 Git Worktree 的完整生命週期管理標準，確保環境乾淨、安全合併與適當清理。Worktree 允許在多個分支上並行工作，無需 stash 或切換。

---

## 術語表

| 術語 | 定義 |
|------|------|
| Worktree | Git 儲存庫在不同分支上的鏈接工作副本 |
| 基準測試 (Baseline Test) | 在新建 worktree 上執行的測試，用於驗證環境是乾淨的 |
| Worktree 目錄 | worktree 被建立的檔案系統路徑 |

---

## 核心原則 — 隔離與責任

> **每個 worktree 必須以乾淨狀態開始（基準測試）、在隔離環境中工作、以合併或明確清理結束。**

---

## 生命週期階段

### 階段 1：建立

```bash
# 建立新的 worktree
git worktree add ../project-feature-name feature/feature-name
```

| 步驟 | 說明 |
|------|------|
| 1. 建立 worktree | 指定路徑和分支名稱 |
| 2. 安裝依賴 | 在新 worktree 中執行 `npm install` 等 |
| 3. 基準測試 | 執行測試確認環境乾淨 |

### 階段 2：工作

- 在 worktree 中正常開發
- 各 worktree 之間完全隔離
- 不影響主工作目錄

### 階段 3：完成

| 選項 | 指令 |
|------|------|
| 合併 | 在主目錄中執行 `git merge feature/name` |
| 丟棄 | 執行清理流程 |

### 階段 4：清理

```bash
# 移除 worktree
git worktree remove ../project-feature-name

# 列出所有 worktree
git worktree list

# 清理過時的 worktree 參考
git worktree prune
```

## 命名慣例

| 元素 | 格式 | 範例 |
|------|------|------|
| Worktree 目錄 | `../project-feature-name` | `../myapp-login-fix` |
| 分支名稱 | `feature/name` 或 `fix/name` | `feature/user-auth` |

## 最佳實踐

| 實踐 | 原因 |
|------|------|
| 建立後立即執行基準測試 | 確認環境乾淨 |
| 完成後立即清理 | 避免 worktree 累積 |
| 不要在 worktree 之間共享未提交的變更 | 防止衝突 |
| 定期執行 `git worktree prune` | 清理過時參考 |

## 相關標準

- [分支完成工作流程](branch-completion.md)
- [代理派遣與並行協調](agent-dispatch.md)
- [Git 工作流](git-workflow.md)
