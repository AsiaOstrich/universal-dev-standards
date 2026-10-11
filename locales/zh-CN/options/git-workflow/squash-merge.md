---
source: ../../../../options/git-workflow/squash-merge.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 9a4b55eed66f
status: current
---

# Squash Merge 合并策略

> **语言**: [English](../../../../options/git-workflow/squash-merge.md) | 简体中文

**上层标准**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

Squash merge 在合并时将功能分支的所有 commit 合并为单个 commit。这会在主分支上形成干净、线性的历史，其中每次合并代表一个完整的功能或变更。

## 适用场景

- 重视主分支历史整洁的团队
- 开发过程中有大量小型 commit 的项目
- 更看重最终结果而非过程的代码审查工作流程
- 接受外部贡献的开源项目

## 工作原理

```
Feature branch:          Main branch after squash merge:
A---B---C---D            X---Y---Z (single squashed commit)
    \                        |
     E---F---G---H    →      S (contains E+F+G+H)
     (feature commits)
```

## 工作流程

### 创建 Pull Request

```bash
# Create feature branch
git checkout -b feature/user-profile
git checkout main
git pull origin main

# Make multiple commits during development
git commit -m "wip: start user profile"
git commit -m "add avatar upload"
git commit -m "fix styling"
git commit -m "add tests"
git commit -m "fix test failure"

# Push and create PR
git push origin feature/user-profile
```

### Squash 合并（通过 CLI）

```bash
# On main branch
git checkout main
git pull origin main

# Squash merge
git merge --squash feature/user-profile

# Create single commit with meaningful message
git commit -m "feat(users): add user profile with avatar upload

- Add profile page component
- Implement avatar upload functionality
- Add comprehensive test coverage

Closes #123"

# Push and clean up
git push origin main
git branch -d feature/user-profile
git push origin --delete feature/user-profile
```

### Squash 合并（通过 GitHub）

1. 打开 Pull Request
2. 点击“Squash and merge”按钮
3. 将 commit 信息编辑为有意义的内容
4. 确认合并
5. 删除功能分支

## Commit 信息最佳实践

进行 squash 合并时，请编写完整的 commit 信息：

```
feat(scope): concise description

- Key change 1
- Key change 2
- Key change 3

Closes #issue-number
Co-authored-by: Name <email@example.com>
```

### 好的示例

```
feat(auth): implement OAuth2 login flow

- Add Google and GitHub OAuth providers
- Create secure token storage
- Implement automatic token refresh
- Add logout functionality

Closes #456
Reviewed-by: @teammate
```

### 不好的示例

```
Squashed commit of the following:
- wip
- more wip
- fix stuff
- actually fix stuff
```

## 优点

| 优点 | 说明 |
|------|------|
| 干净的历史 | 主分支上每个功能只显示一个 commit |
| 易于回滚 | 回滚单个 commit 即可撤销整个功能 |
| 简化 bisect | 需要搜索的 commit 更少 |
| 自由提交 | 开发者可以频繁提交而不会弄乱历史 |

## 缺点

| 缺点 | 说明 |
|------|------|
| 丢失粒度 | 单个 commit 的历史会丢失 |
| blame 更困难 | 无法将特定代码行追溯到原始 commit |
| diff 较大 | 单个 commit 可能包含大量变更 |
| 丢失上下文 | 开发过程不会被保留 |

## 何时不应使用

- 单个 commit 的历史很重要时
- 对于带有有价值 commit 信息的长期分支
- 之后需要 cherry-pick 特定变更时
- 对于有多位作者且需要署名的分支

## 配置

### GitHub 仓库设置

```yaml
# In repository settings > Pull Requests
Allow squash merging: ✓
Allow merge commits: ✗ (optional, for enforcement)
Allow rebase merging: ✗ (optional, for enforcement)

# Default commit message
Default to pull request title and description
```

### Git 别名

```bash
# Add to ~/.gitconfig
[alias]
    squash = merge --squash
    sm = "!f() { git merge --squash $1 && git commit; }; f"
```

## 保留共同作者

当多人为同一分支做出贡献时：

```bash
git commit -m "feat: implement feature

Co-authored-by: Alice <alice@example.com>
Co-authored-by: Bob <bob@example.com>"
```

## 相关选项

- [Merge Commit](./merge-commit.md) - 保留所有 commit 历史
- [Rebase and Fast-Forward](./rebase-ff.md) - 保留所有 commit 的线性历史

---

## 许可

本文档采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
