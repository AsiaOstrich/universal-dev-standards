---
source: ../../../../options/git-workflow/merge-commit.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Merge Commit 合并策略

> **语言**: [English](../../../../options/git-workflow/merge-commit.md) | 繁体中文

**上层标准**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

Merge commit（也称为「true merge」或「merge with merge commit」）透过建立合并 commit 来保留功能分支的完整历史。这维护了完整的开发历史，并显示分支合并的确切时间点。

## 适用情境

- 重视完整历史保留的团队
- 需要审计轨迹的专案
- 长期执行的功能分支
- 个别 commit 有意义讯息时
- 使用 `git bisect` 除错时

## 运作方式

```
合并前：                合并后：
main:    A---B---C      A---B---C---------M（合并 commit）
              \                   \       /
feature:       D---E---F           D---E---F
```

合并 commit `M` 有两个父节点：`C`（来自 main）和 `F`（来自 feature）。

## 工作流程

### 标准 Merge Commit

```bash
# 确保 main 是最新的
git checkout main
git pull origin main

# 使用 merge commit 合并功能分支
git merge feature/user-auth --no-ff

# 这会开启编辑器撰写合并讯息
# 或指定讯息：
git merge feature/user-auth --no-ff -m "Merge feature/user-auth: Add OAuth support"

# 推送
git push origin main
```

### `--no-ff` 旗标

`--no-ff`（no fast-forward）旗标确保永远建立合并 commit：

```bash
# 不使用 --no-ff（可能会 fast-forward）
git merge feature-branch
# 结果：可能会或不会建立合并 commit

# 使用 --no-ff（永远建立合并 commit）
git merge --no-ff feature-branch
# 结果：永远建立合并 commit
```

## 优点

| 优点 | 说明 |
|------|------|
| 完整历史 | 所有 commit 保留可见 |
| 清楚的合并点 | 容易看出功能整合时间 |
| 容易归属 | 每个 commit 显示作者 |
| 有效的 bisect | `git bisect` 有完整细节 |
| 还原弹性 | 可还原合并或个别 commit |

## 缺点

| 缺点 | 说明 |
|------|------|
| 非线性历史 | 分支结构可能复杂 |
| 更多 commit | 主分支累积许多 commit |
| 较难阅读 | `git log` 显示交错 commit |
| 合并冲突 | 冲突在合并 commit 解决 |

## 检视合并历史

```bash
# 只列出合并 commit
git log --merges --oneline

# 视觉化分支结构
git log --oneline --graph
```

## 还原合并

```bash
# 还原整个合并
git revert -m 1 <merge-commit-sha>

# -m 1 表示保留第一个父节点（main 分支）
# -m 2 会保留第二个父节点（feature 分支）
```

## 相关选项

- [Squash Merge](./squash-merge.md) - 将所有 commit 合并为一个
- [Rebase and Fast-Forward](./rebase-ff.md) - 无合并 commit 的线性历史

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
