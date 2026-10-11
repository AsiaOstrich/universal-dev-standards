---
source: ../../../../options/git-workflow/gitflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 4770d4d33ca8
status: current
---

# GitFlow

> **语言**: [English](../../../../options/git-workflow/gitflow.md) | 简体中文

**上层标准**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

GitFlow 是一种为按计划发布的项目而设计的分支模型。它为管理具有多条并行开发线的大型项目提供了稳健的框架。

## 适用场景

- 按计划发布（每月或更长的周期）
- 需要维护多个版本
- 大型团队（10 名以上开发者）
- 具有正式发布流程的企业环境

## 分支结构

| 分支 | 用途 | 生命周期 | 基于 | 合并到 |
|------|------|----------|------|--------|
| `main` | 生产发布 | 永久 | - | - |
| `develop` | 集成分支 | 永久 | main | - |
| `feature/*` | 新功能 | 短期 | develop | develop |
| `release/*` | 发布准备 | 中期（1-2 周） | develop | main, develop |
| `hotfix/*` | 紧急修复 | 极短 | main | main, develop |

## 分支示意图

```
main     ─────●─────────────●─────────●─────
              │             │         │
              │    release/1.0        │
              │     ┌───●───┐        hotfix/fix
              │     │       │         ┌─●─┐
develop ──●───●─────●───────●─────────●───●──
          │                           │
       feature/A                   feature/B
        ┌──●──┐                     ┌──●──┐
```

## 核心原则

1. **永远不要直接提交到 main** - 使用 release 或 hotfix 分支
2. **develop 是集成分支** - 所有功能都先合并到这里
3. **release 分支冻结功能** - 只允许修复缺陷
4. **hotfix 同时合并到 main 和 develop** - 保持分支同步

## 工作流程：功能开发

### 1. 开始功能

```bash
git checkout develop
git pull origin develop
git checkout -b feature/user-dashboard
```

### 2. 开发功能

```bash
# Make commits
git commit -m "feat(dashboard): add widget system"
git commit -m "feat(dashboard): add chart component"
```

### 3. 完成功能

```bash
git checkout develop
git merge --no-ff feature/user-dashboard
git branch -d feature/user-dashboard
git push origin develop
```

## 工作流程：发布

### 1. 创建发布分支

```bash
git checkout develop
git checkout -b release/v1.2.0
```

### 2. 准备发布

```bash
# Update version numbers
# Update CHANGELOG
# Bug fixes only - no new features!
git commit -m "chore: bump version to 1.2.0"
```

### 3. 完成发布

```bash
# Merge to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"

# Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0

# Cleanup
git branch -d release/v1.2.0
git push origin main develop --tags
```

## 工作流程：紧急修复

### 1. 创建 hotfix 分支

```bash
git checkout main
git checkout -b hotfix/security-patch
```

### 2. 修复并完成

```bash
# Make fix
git commit -m "fix: patch XSS vulnerability"

# Merge to main
git checkout main
git merge --no-ff hotfix/security-patch
git tag -a v1.2.1 -m "Hotfix v1.2.1"

# Merge to develop
git checkout develop
git merge --no-ff hotfix/security-patch

# Cleanup
git branch -d hotfix/security-patch
```

## 优点

- 开发与生产之间界限清晰
- 支持功能的并行开发
- 非常适合按计划发布
- 易于维护多个版本

## 缺点

- 分支结构复杂
- 对小型团队而言开销较大
- 可能导致长期存在的功能分支
- 更容易出现合并冲突

## 相关选项

- [GitHub Flow](./github-flow.md) - 适用于持续部署的更简单替代方案
- [Trunk-Based Development](./trunk-based.md) - 适用于 CI/CD 成熟的团队

---

## 许可

本文档采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
