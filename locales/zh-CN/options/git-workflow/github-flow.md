---
source: ../../../../options/git-workflow/github-flow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: b19d6c2614d2
status: current
---

# GitHub Flow

> **语言**: [English](../../../../options/git-workflow/github-flow.md) | 简体中文

**上层标准**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

GitHub Flow 是一种轻量级、基于分支的工作流程，专为定期部署的团队而设计。它易于理解和实施，非常适合持续部署环境。

## 适用场景

- 持续部署（从每天多次到每周一次）
- Web 应用和 SaaS 产品
- 中小型团队（5-15 名开发者）
- 具备完善 CI/CD 流水线的项目

## 分支结构

| 分支 | 用途 | 生命周期 |
|------|------|----------|
| `main` | 始终可部署的生产代码 | 永久 |
| `feature/*` | 新功能或修复 | 短期（理想为 1-3 天） |

## 核心原则

1. **main 始终可部署** - main 分支应始终处于可部署状态
2. **一切工作都建分支** - 任何新工作都要创建分支
3. **使用描述性名称** - 分支名称应描述所做的工作
4. **尽早开启 PR** - 通过 pull request 尽早获得反馈
5. **合并后即部署** - 合并到 main 后立即部署

## 工作流程步骤

### 1. 创建功能分支

```bash
# Start from latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/user-authentication
```

### 2. 进行变更并提交

```bash
# Make your changes
git add .
git commit -m "feat(auth): add login form component"

# Continue making commits...
git commit -m "feat(auth): add authentication service"
git commit -m "test(auth): add login tests"
```

### 3. 推送并创建 Pull Request

```bash
# Push branch to remote
git push -u origin feature/user-authentication

# Create PR via GitHub/GitLab UI
# - Add description
# - Request reviewers
# - Link related issues
```

### 4. 审查与合并

- 获得代码审查批准
- 确保 CI 检查通过
- 通过 GitHub 界面合并（squash 或 merge commit）

### 5. 部署与清理

```bash
# After merge, update local main
git checkout main
git pull origin main

# Delete feature branch
git branch -d feature/user-authentication
```

## 分支命名约定

```
<type>/<short-description>

Examples:
feature/oauth-login
fix/memory-leak
docs/api-reference
refactor/user-service
```

## 合并策略建议

| 合并类型 | 使用时机 |
|----------|----------|
| **Squash Merge** | 大多数功能分支（历史记录整洁） |
| **Merge Commit** | 需要保留提交历史时 |
| **Rebase + FF** | 生命周期极短的分支 |

## 优点

- 易于理解和实施
- 与 CI/CD 配合良好
- 鼓励频繁集成
- 分支管理开销极小

## 缺点

- 没有独立的开发分支用于集成
- 所有功能直接进入 main
- 不太适合按计划发布

## 相关选项

- [GitFlow](./gitflow.md) - 适用于按计划发布
- [Trunk-Based Development](./trunk-based.md) - 适用于更频繁的集成

---

## 许可

本文档采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
