---
source: ../../../../options/git-workflow/squash-merge.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Squash Merge 合并策略

> **语言**: [English](../../../options/git-workflow/squash-merge.md) | 繁体中文

**上层标准**: [Git 工作流程](../../core/git-workflow.md)

---

## 概述

Squash merge 在合并时将功能分支的所有 commit 压缩成单一 commit。这在主分支上建立干净、线性的历史，每个合并代表一个完整的功能或变更。

## 适用情境

- 重视主分支历史整洁的团队
- 开发过程中有许多小型 commit 的专案
- 程式码审查流程中最终结果比过程重要
- 接受外部贡献的开源专案

## 运作方式

```
功能分支：              合并后的 main 分支：
A---B---C---D            X---Y---Z（单一压缩 commit）
    \                        |
     E---F---G---H    →      S（包含 E+F+G+H）
    （功能 commits）
```

## 工作流程

### 透过 CLI 进行 Squash Merge

```bash
# 切到 main 分支
git checkout main
git pull origin main

# Squash merge
git merge --squash feature/user-profile

# 建立有意义的单一 commit
git commit -m "feat(users): add user profile with avatar upload

- Add profile page component
- Implement avatar upload functionality
- Add comprehensive test coverage

Closes #123"

# 推送并清理
git push origin main
git branch -d feature/user-profile
git push origin --delete feature/user-profile
```

### 透过 GitHub 进行

1. 开启 Pull Request
2. 点击「Squash and merge」按钮
3. 编辑 commit 讯息使其有意义
4. 确认合并
5. 删除功能分支

## Commit 讯息最佳实践

进行 squash merge 时，撰写完整的 commit 讯息：

```
feat(scope): 简洁描述

- 主要变更 1
- 主要变更 2
- 主要变更 3

Closes #issue-number
Co-authored-by: Name <email@example.com>
```

## 优点

| 优点 | 说明 |
|------|------|
| 干净的历史 | 主分支每个功能一个 commit |
| 容易还原 | 单一 commit 还原整个功能 |
| 简化 bisect | 较少 commit 需要搜寻 |
| 自由提交 | 开发者可频繁提交不会杂乱 |

## 缺点

| 缺点 | 说明 |
|------|------|
| 失去细节 | 个别 commit 历史遗失 |
| 难以追踪 | 无法追溯特定行到原始 commit |
| 大型 diff | 单一 commit 可能有大量变更 |
| 失去脉络 | 开发过程不被保留 |

## 相关选项

- [Merge Commit](./merge-commit.md) - 保留所有 commit 历史
- [Rebase and Fast-Forward](./rebase-ff.md) - 线性历史保留所有 commit

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
