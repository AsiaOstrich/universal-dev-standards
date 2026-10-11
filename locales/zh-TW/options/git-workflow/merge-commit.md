---
source: ../../../../options/git-workflow/merge-commit.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 375d47889710
status: current
---

# Merge Commit 合併策略

> **語言**: [English](../../../../options/git-workflow/merge-commit.md) | 繁體中文

**上層標準**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

Merge commit（也稱為「true merge」或「merge with merge commit」）透過建立結合兩個分支的合併 commit，保留功能分支的完整歷史。這維護了完整的開發歷史，並顯示分支合併的確切時間點。

## 適用情境

- 重視完整歷史保留的團隊
- 需要審計軌跡的專案
- 長期執行的功能分支
- 個別 commit 有意義訊息時
- 使用 `git bisect` 除錯時

## 運作方式

```
Before merge:                After merge commit:
main:    A---B---C           A---B---C---------M (merge commit)
              \                       \       /
feature:       D---E---F               D---E---F
```

合併 commit `M` 有兩個父節點：`C`（來自 main）和 `F`（來自 feature）。

## 工作流程

### 標準 Merge Commit

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Merge feature branch with merge commit
git merge feature/user-auth --no-ff

# This opens editor for merge commit message
# Or specify inline:
git merge feature/user-auth --no-ff -m "Merge feature/user-auth: Add OAuth support"

# Push
git push origin main
```

### `--no-ff` 旗標

`--no-ff`（no fast-forward）旗標確保永遠建立合併 commit：

```bash
# Without --no-ff (may fast-forward if possible)
git merge feature-branch
# Result: May or may not create merge commit

# With --no-ff (always creates merge commit)
git merge --no-ff feature-branch
# Result: Always creates merge commit
```

### 透過 GitHub Pull Request

1. 開啟 Pull Request
2. 點選「Create a merge commit」（或「Merge pull request」）
3. 視需要編輯合併 commit 訊息
4. 確認合併

## 合併 Commit 訊息

### 預設格式

```
Merge branch 'feature/user-auth' into main
```

### 強化格式（建議）

```
Merge feature/user-auth: Implement OAuth authentication

This merge adds:
- Google OAuth integration
- GitHub OAuth integration
- Token refresh mechanism
- Session management

PR #123
Reviewed-by: @teammate
```

## 優點

| 優點 | 說明 |
|------|------|
| 完整歷史 | 所有 commit 保留可見 |
| 清楚的合併點 | 容易看出功能整合時間 |
| 容易歸屬 | 每個 commit 顯示作者 |
| 有效的 bisect | `git bisect` 有完整細節 |
| 還原彈性 | 可還原合併或個別 commit |

## 缺點

| 缺點 | 說明 |
|------|------|
| 非線性歷史 | 分支結構可能複雜 |
| 更多 commit | 主分支累積許多 commit |
| 較難閱讀 | `git log` 顯示交錯 commit |
| 合併衝突 | 衝突在合併 commit 解決 |

## 檢視合併歷史

### 只顯示合併 Commit

```bash
# List only merge commits
git log --merges --oneline

# Show merge commits with their parents
git log --merges --format="%h %s (%p)"
```

### 視覺化分支結構

```bash
# ASCII graph of branches
git log --oneline --graph

# Simplified graph
git log --oneline --graph --first-parent
```

### 檢視合併內容

```bash
# Show what was merged
git show <merge-commit-sha>

# Show changes from first parent (main)
git diff <merge-commit>^1 <merge-commit>

# Show changes from second parent (feature)
git diff <merge-commit>^2 <merge-commit>
```

## 還原合併

```bash
# Revert the entire merge
git revert -m 1 <merge-commit-sha>

# -m 1 means keep first parent (main branch)
# -m 2 would keep second parent (feature branch)
```

## 設定

### 儲存庫設定（GitHub）

```yaml
# In repository settings > Pull Requests
Allow merge commits: ✓
Default commit message: Pull request title and description
```

### Git 設定

```bash
# Always use --no-ff for merges
git config --global merge.ff false

# Or per-repository
git config merge.ff false
```

### Git 別名

```bash
# Add to ~/.gitconfig
[alias]
    mg = merge --no-ff
    mgm = "!f() { git merge --no-ff -m \"Merge $1\" $1; }; f"
```

## 處理合併衝突

合併過程中發生衝突時：

```bash
# Start merge
git merge feature-branch

# If conflicts:
# 1. Edit conflicted files
# 2. Mark as resolved
git add <resolved-files>

# 3. Complete merge
git commit
# Merge commit message will include conflict info
```

## 最佳實踐

1. **使用有意義的合併訊息** - 描述該功能新增了什麼
2. **保持分支更新** - 定期將 main 合併到功能分支
3. **使用 `--no-ff`** - 確保永遠建立合併 commit
4. **清理分支** - 合併後刪除功能分支
5. **引用 issue** - 在合併訊息中包含 issue/PR 編號

## 相關選項

- [Squash Merge](./squash-merge.md) - 將所有 commit 合併為一個
- [Rebase and Fast-Forward](./rebase-ff.md) - 無合併 commit 的線性歷史

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
