---
source: ../../../../options/git-workflow/rebase-ff.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: b0c321db93d1
status: current
---

# Rebase and Fast-Forward 策略

> **語言**: [English](../../../../options/git-workflow/rebase-ff.md) | 繁體中文

**上層標準**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

Rebase and fast-forward 是一種合併策略，透過將功能分支的 commit 重新播放到目標分支上方，建立完全線性的歷史。結果是乾淨、直線的歷史，所有 commit 看起來像是在單一分支上依序完成的。

## 適用情境

- 偏好線性歷史的團隊
- 大量依賴 `git bisect` 的專案
- 想要乾淨、可讀日誌的開發者
- 有高程式碼品質標準的開源專案

## 運作方式

```
Before rebase:               After rebase + fast-forward:
main:    A---B---C           A---B---C---D'---E'---F'
              \                              (rebased commits)
feature:       D---E---F
```

Commit D、E、F 被「重新播放」為 D'、E'、F' 在 C 之上。

## 工作流程

### 合併前的互動式 Rebase

```bash
# Start on feature branch
git checkout feature/user-profile

# Fetch latest changes
git fetch origin

# Rebase onto main
git rebase origin/main

# If conflicts occur, resolve and continue
git add <resolved-files>
git rebase --continue

# Or abort if needed
git rebase --abort
```

### Fast-Forward 合併

```bash
# Switch to main
git checkout main
git pull origin main

# Fast-forward merge (only works if feature is ahead)
git merge --ff-only feature/user-profile

# Push
git push origin main

# Clean up
git branch -d feature/user-profile
```

### Rebase 後的 Force Push

當你 rebase 了已推送的分支：

```bash
# After rebasing
git push --force-with-lease origin feature/user-profile

# --force-with-lease is safer than --force
# It fails if someone else pushed to the branch
```

## 互動式 Rebase

合併前清理 commit：

```bash
# Rebase last 4 commits interactively
git rebase -i HEAD~4

# Or rebase from branch point
git rebase -i main
```

### 互動式 Rebase 指令

```
pick   abc1234 feat: add user model
squash def5678 fix typo
reword ghi9012 add user service
drop   jkl3456 wip - remove this

# Commands:
# p, pick   = use commit
# r, reword = use commit, but edit message
# e, edit   = use commit, but stop for amending
# s, squash = meld into previous commit
# f, fixup  = like squash, but discard message
# d, drop   = remove commit
```

### 常用清理模式

```bash
# Combine fixup commits
pick abc1234 feat: add user model
fixup def5678 fix typo in user model
fixup ghi9012 another fix

# Result: single clean commit

# Reorder and edit
pick abc1234 feat: add user model
reword def5678 feat: add user validation
pick ghi9012 test: add user tests
```

## 優點

| 優點 | 說明 |
|------|------|
| 線性歷史 | 容易閱讀和理解 |
| 乾淨日誌 | `git log` 顯示直線 |
| 有效的 bisect | 清楚的變更進程 |
| 原子 commit | 每個 commit 獨立完整 |
| 無合併 commit | 更乾淨的儲存庫 |

## 缺點

| 缺點 | 說明 |
|------|------|
| 重寫歷史 | Commit SHA 在 rebase 後改變 |
| 需要 force push | rebase 已推送的分支後 |
| 衝突解決 | 可能需要多次解決衝突 |
| 失去合併脈絡 | 無分支合併時間記錄 |
| 共享時危險 | 可能對協作者造成問題 |

## 安全規則

### Rebase 的黃金法則

**永遠不要 rebase 已推送到共享分支的 commit。**

```bash
# SAFE: Rebase local-only commits
git rebase main  # If feature branch is not pushed

# CAUTION: Rebase pushed feature branch
git rebase main
git push --force-with-lease  # Only if you're the only one working on it

# DANGEROUS: Never do this
git checkout main
git rebase feature  # Never rebase main/master!
```

### 使用 `--force-with-lease`

```bash
# Safer than --force
git push --force-with-lease origin feature-branch

# Fails if remote has commits you don't have locally
# Prevents overwriting others' work
```

## 設定

### 儲存庫設定（GitHub）

```yaml
# In repository settings > Pull Requests
Allow rebase merging: ✓
Allow merge commits: ✗ (for enforcement)
Allow squash merging: ✗ (for enforcement)
```

### Git 設定

```bash
# Default to rebase when pulling
git config --global pull.rebase true

# Auto-stash before rebase
git config --global rebase.autoStash true

# Auto-squash fixup commits
git config --global rebase.autoSquash true
```

### Git 別名

```bash
# Add to ~/.gitconfig
[alias]
    rb = rebase
    rbi = rebase -i
    rbc = rebase --continue
    rba = rebase --abort
    fpush = push --force-with-lease
```

## Rebase 期間處理衝突

```bash
# Start rebase
git rebase main

# When conflict occurs:
# 1. Edit conflicted files
# 2. Stage resolved files
git add <resolved-files>

# 3. Continue rebase
git rebase --continue

# Repeat for each conflicting commit

# If you want to skip a commit
git rebase --skip

# If you want to abort entirely
git rebase --abort
```

## Autosquash 工作流程

使用 commit 訊息前綴進行自動 squash：

```bash
# Original commit
git commit -m "feat: add user model"

# Later fixup (will auto-squash)
git commit --fixup=<original-sha>
# Creates: "fixup! feat: add user model"

# Or squash with custom message
git commit --squash=<original-sha>
# Creates: "squash! feat: add user model"

# Auto-squash during rebase
git rebase -i --autosquash main
```

## 相關選項

- [Squash Merge](./squash-merge.md) - 單一 commit，更簡單的工作流程
- [Merge Commit](./merge-commit.md) - 保留分支歷史

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
