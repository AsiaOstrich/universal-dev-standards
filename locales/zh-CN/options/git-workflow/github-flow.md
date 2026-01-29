---
source: ../../../options/git-workflow/github-flow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# GitHub Flow 工作流程

> **语言**: [English](../../../options/git-workflow/github-flow.md) | 繁体中文

**上层标准**: [Git 工作流程](../../core/git-workflow.md)

---

## 概述

GitHub Flow 是一个轻量级、以分支为基础的工作流程，支援定期部署的团队和专案。它强调简单性，只使用一个长期分支（main），并搭配短期功能分支。

## 适用情境

- 持续部署环境
- 小型到中型团队
- Web 应用程式和 SaaS 产品
- 需要频繁发布的专案

## 核心原则

| 原则 | 说明 |
|------|------|
| Main 随时可部署 | `main` 分支永远处于可发布状态 |
| 功能分支 | 所有工作在功能分支上进行 |
| Pull Request | 透过 PR 进行程式码审查 |
| 合并后立即部署 | 合并到 main 即触发部署 |

## 工作流程步骤

### 1. 从 main 建立分支

```bash
git checkout main
git pull origin main
git checkout -b feature/user-authentication
```

### 2. 进行变更并提交

```bash
# 进行变更
git add .
git commit -m "feat(auth): add login form component"

# 持续提交
git commit -m "feat(auth): add form validation"
git commit -m "test(auth): add login form tests"
```

### 3. 推送并建立 Pull Request

```bash
git push origin feature/user-authentication
# 在 GitHub 上建立 Pull Request
```

### 4. 讨论与审查

- 团队成员审查程式码
- 讨论变更
- 进行必要的修改
- CI/CD 自动执行测试

### 5. 合并并部署

```bash
# 审查通过后，透过 GitHub 介面合并
# 或使用命令列：
git checkout main
git merge --no-ff feature/user-authentication
git push origin main

# 删除功能分支
git branch -d feature/user-authentication
git push origin --delete feature/user-authentication
```

## 分支命名惯例

| 类型 | 格式 | 范例 |
|------|------|------|
| 功能 | `feature/<描述>` | `feature/user-profile` |
| 错误修复 | `fix/<描述>` | `fix/login-redirect` |
| 热修复 | `hotfix/<描述>` | `hotfix/security-patch` |
| 文件 | `docs/<描述>` | `docs/api-reference` |

## 优点

| 优点 | 说明 |
|------|------|
| 简单易学 | 只需记住一个流程 |
| 快速迭代 | 支援持续部署 |
| 清晰的审查流程 | PR 确保程式码品质 |
| 自动化友善 | 易于整合 CI/CD |

## 缺点

| 缺点 | 说明 |
|------|------|
| 无发布分支 | 不适合需要版本控制的专案 |
| 需要可靠的测试 | main 必须随时可部署 |
| 不适合多版本维护 | 难以同时维护多个生产版本 |

## 相关选项

- [GitFlow](./gitflow.md) - 适合有排程发布的专案
- [Trunk-Based](./trunk-based.md) - 更简化的持续整合流程

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
