---
source: ../../../../options/git-workflow/rebase-ff.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: b0c321db93d1
status: current
---

# Rebase and Fast-Forward 策略

> **语言**: [English](../../../../options/git-workflow/rebase-ff.md) | 简体中文

**上层标准**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

Rebase and fast-forward 是一种合并策略，它将功能分支的 commit 重放到目标分支之上，从而形成完全线性的历史。结果是一条干净、笔直的历史线，所有 commit 看起来就像是在同一个分支上依次提交的。

## 适用场景

- 偏好线性历史的团队
- 高度依赖 `git bisect` 的项目
- 希望日志干净、易读的开发者
- 代码质量标准较高的开源项目

## 工作原理

```
Before rebase:               After rebase + fast-forward:
main:    A---B---C           A---B---C---D'---E'---F'
              \                              (rebased commits)
feature:       D---E---F
```

commit D、E、F 被“重放”为 C 之上的 D'、E'、F'。

## 工作流程

### 合并前的交互式 Rebase

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

### Fast-Forward 合并

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

### Rebase 后强制推送

当你对一个已经推送过的分支执行 rebase 时：

```bash
# After rebasing
git push --force-with-lease origin feature/user-profile

# --force-with-lease is safer than --force
# It fails if someone else pushed to the branch
```

## 交互式 Rebase

在合并前整理 commit：

```bash
# Rebase last 4 commits interactively
git rebase -i HEAD~4

# Or rebase from branch point
git rebase -i main
```

### 交互式 Rebase 命令

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

### 常用整理模式

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

## 优点

| 优点 | 说明 |
|------|------|
| 线性历史 | 易于阅读和理解 |
| 干净的日志 | `git log` 呈现一条直线 |
| 高效的 bisect | 变更的演进清晰明了 |
| 原子化 commit | 每个 commit 都是自包含的 |
| 没有合并 commit | 仓库更整洁 |

## 缺点

| 缺点 | 说明 |
|------|------|
| 改写历史 | rebase 后 commit SHA 会改变 |
| 需要强制推送 | 对已推送的分支执行 rebase 后 |
| 冲突解决 | 可能需要多次解决冲突 |
| 丢失合并上下文 | 没有记录分支何时合并 |
| 共享时有风险 | 可能给协作者带来问题 |

## 安全规则

### Rebase 的黄金法则

**永远不要对已推送到共享分支的 commit 执行 rebase。**

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

## 配置

### 仓库设置（GitHub）

```yaml
# In repository settings > Pull Requests
Allow rebase merging: ✓
Allow merge commits: ✗ (for enforcement)
Allow squash merging: ✗ (for enforcement)
```

### Git 配置

```bash
# Default to rebase when pulling
git config --global pull.rebase true

# Auto-stash before rebase
git config --global rebase.autoStash true

# Auto-squash fixup commits
git config --global rebase.autoSquash true
```

### Git 别名

```bash
# Add to ~/.gitconfig
[alias]
    rb = rebase
    rbi = rebase -i
    rbc = rebase --continue
    rba = rebase --abort
    fpush = push --force-with-lease
```

## Rebase 过程中处理冲突

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

使用 commit 信息前缀实现自动压缩：

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

## 相关选项

- [Squash Merge](./squash-merge.md) - 单一 commit，工作流程更简单
- [Merge Commit](./merge-commit.md) - 保留分支历史

---

## 许可

本文档采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
