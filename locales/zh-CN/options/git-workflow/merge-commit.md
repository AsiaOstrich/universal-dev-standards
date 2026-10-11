---
source: ../../../../options/git-workflow/merge-commit.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 375d47889710
status: current
---

# Merge Commit 合并策略

> **语言**: [English](../../../../options/git-workflow/merge-commit.md) | 简体中文

**上层标准**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

Merge commit（也称为“true merge”或“merge with merge commit”）通过创建一个合并两个分支的合并 commit 来保留功能分支的完整历史。这样可以维护完整的开发历史，并准确显示分支合并的时间点。

## 适用场景

- 重视完整保留历史的团队
- 需要审计轨迹的项目
- 长期存在的功能分支
- 各个 commit 都有有意义的提交信息时
- 使用 `git bisect` 调试时

## 工作原理

```
Before merge:                After merge commit:
main:    A---B---C           A---B---C---------M (merge commit)
              \                       \       /
feature:       D---E---F               D---E---F
```

合并 commit `M` 有两个父提交：`C`（来自 main）和 `F`（来自 feature）。

## 工作流程

### 标准 Merge Commit

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

### `--no-ff` 参数

`--no-ff`（no fast-forward）参数确保总是创建合并 commit：

```bash
# Without --no-ff (may fast-forward if possible)
git merge feature-branch
# Result: May or may not create merge commit

# With --no-ff (always creates merge commit)
git merge --no-ff feature-branch
# Result: Always creates merge commit
```

### 通过 GitHub Pull Request

1. 打开 Pull Request
2. 点击“Create a merge commit”（或“Merge pull request”）
3. 可选择编辑合并 commit 信息
4. 确认合并

## 合并 Commit 信息

### 默认格式

```
Merge branch 'feature/user-auth' into main
```

### 增强格式（推荐）

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

## 优点

| 优点 | 说明 |
|------|------|
| 完整历史 | 所有 commit 均被保留且可见 |
| 清晰的合并点 | 容易看出功能何时被集成 |
| 易于追溯作者 | 每个 commit 都显示其作者 |
| 高效的 bisect | `git bisect` 可以按完整粒度工作 |
| 灵活的回滚 | 可以回滚整个合并或单个 commit |

## 缺点

| 缺点 | 说明 |
|------|------|
| 非线性历史 | 分支结构可能很复杂 |
| commit 更多 | 主分支会累积大量 commit |
| 较难阅读 | `git log` 显示交错的 commit |
| 合并冲突 | 冲突在合并 commit 中解决 |

## 查看合并历史

### 仅显示合并 Commit

```bash
# List only merge commits
git log --merges --oneline

# Show merge commits with their parents
git log --merges --format="%h %s (%p)"
```

### 可视化分支结构

```bash
# ASCII graph of branches
git log --oneline --graph

# Simplified graph
git log --oneline --graph --first-parent
```

### 查看合并的内容

```bash
# Show what was merged
git show <merge-commit-sha>

# Show changes from first parent (main)
git diff <merge-commit>^1 <merge-commit>

# Show changes from second parent (feature)
git diff <merge-commit>^2 <merge-commit>
```

## 回滚合并

```bash
# Revert the entire merge
git revert -m 1 <merge-commit-sha>

# -m 1 means keep first parent (main branch)
# -m 2 would keep second parent (feature branch)
```

## 配置

### 仓库设置（GitHub）

```yaml
# In repository settings > Pull Requests
Allow merge commits: ✓
Default commit message: Pull request title and description
```

### Git 配置

```bash
# Always use --no-ff for merges
git config --global merge.ff false

# Or per-repository
git config merge.ff false
```

### Git 别名

```bash
# Add to ~/.gitconfig
[alias]
    mg = merge --no-ff
    mgm = "!f() { git merge --no-ff -m \"Merge $1\" $1; }; f"
```

## 处理合并冲突

合并过程中发生冲突时：

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

## 最佳实践

1. **使用有意义的合并信息** - 描述该功能新增了什么
2. **保持分支最新** - 定期将 main 合并到功能分支
3. **使用 `--no-ff`** - 确保总是创建合并 commit
4. **清理分支** - 合并后删除功能分支
5. **引用 issue** - 在合并信息中包含 issue/PR 编号

## 相关选项

- [Squash Merge](./squash-merge.md) - 将所有 commit 合并为一个
- [Rebase and Fast-Forward](./rebase-ff.md) - 无合并 commit 的线性历史

---

## 许可

本文档采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
