---
source: ../../../../options/git-workflow/rebase-ff.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Rebase and Fast-Forward 策略

> **语言**: [English](../../../../options/git-workflow/rebase-ff.md) | 繁体中文

**上层标准**: [Git 工作流程](../../core/git-workflow.md)

---

## 概述

Rebase and fast-forward 是一种合并策略，透过将功能分支的 commit 重新播放到目标分支上方，建立完全线性的历史。结果是干净、直线的历史，所有 commit 看起来像是在单一分支上依序完成的。

## 适用情境

- 偏好线性历史的团队
- 大量依赖 `git bisect` 的专案
- 想要干净、可读日志的开发者
- 有高程式码品质标准的开源专案

## 运作方式

```
rebase 前：              rebase + fast-forward 后：
main:    A---B---C       A---B---C---D'---E'---F'
              \                         (rebased commits)
feature:       D---E---F
```

Commit D、E、F 被「重新播放」为 D'、E'、F' 在 C 之上。

## 工作流程

### 合并前的互动式 Rebase

```bash
# 在功能分支上开始
git checkout feature/user-profile

# 取得最新变更
git fetch origin

# Rebase 到 main 上
git rebase origin/main

# 如有冲突，解决后继续
git add <resolved-files>
git rebase --continue

# 或需要时中止
git rebase --abort
```

### Fast-Forward 合并

```bash
# 切换到 main
git checkout main
git pull origin main

# Fast-forward 合并（只在 feature 领先时有效）
git merge --ff-only feature/user-profile

# 推送
git push origin main

# 清理
git branch -d feature/user-profile
```

### Rebase 后的 Force Push

当你 rebase 了已推送的分支：

```bash
# rebase 后
git push --force-with-lease origin feature/user-profile

# --force-with-lease 比 --force 安全
# 如果其他人推送到该分支会失败
```

## 互动式 Rebase

合并前清理 commit：

```bash
# 互动式 rebase 最近 4 个 commit
git rebase -i HEAD~4

# 或从分支点 rebase
git rebase -i main
```

### 常用清理模式

```
pick abc1234 feat: add user model
fixup def5678 fix typo in user model
fixup ghi9012 another fix

# 结果：单一干净的 commit
```

## 优点

| 优点 | 说明 |
|------|------|
| 线性历史 | 容易阅读和理解 |
| 干净日志 | `git log` 显示直线 |
| 有效的 bisect | 清楚的变更进程 |
| 原子 commit | 每个 commit 独立完整 |
| 无合并 commit | 更干净的储存库 |

## 缺点

| 缺点 | 说明 |
|------|------|
| 重写历史 | Commit SHA 在 rebase 后改变 |
| 需要 force push | rebase 已推送的分支后 |
| 冲突解决 | 可能需要多次解决冲突 |
| 失去合并脉络 | 无分支合并时间记录 |
| 共享时危险 | 可能对协作者造成问题 |

## Rebase 的黄金法则

**永远不要 rebase 已推送到共享分支的 commit。**

```bash
# 安全：rebase 本地 commit
git rebase main  # 如果功能分支未推送

# 注意：rebase 已推送的功能分支
git rebase main
git push --force-with-lease  # 只有在你是唯一工作者时

# 危险：永远不要这样做
git checkout main
git rebase feature  # 永远不要 rebase main/master！
```

## 相关选项

- [Squash Merge](./squash-merge.md) - 单一 commit，更简单的工作流程
- [Merge Commit](./merge-commit.md) - 保留分支历史

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
