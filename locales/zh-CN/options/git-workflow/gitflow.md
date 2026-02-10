---
source: ../../../../options/git-workflow/gitflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# GitFlow 工作流程

> **语言**: [English](../../../../options/git-workflow/gitflow.md) | 繁体中文

**上层标准**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

GitFlow 是一个严谨的分支模型，专为有排程发布周期的专案设计。它定义了功能开发、发布准备和维护的具体分支角色。

## 适用情境

- 有排程发布周期的专案
- 需要同时维护多个版本的软体
- 企业级应用程式
- 需要严格品质控管的团队

## 分支架构

```
main ────●────────●────────●──────── (生产版本)
         │        │        │
         │   release/1.0   │
         │   ┌────●────┐   │
         │   │         │   │
develop ─●───●─────────●───●──────── (开发主线)
         │             │
    feature/a     feature/b
    ┌────●────┐   ┌────●────┐
```

## 分支类型

| 分支 | 用途 | 生命周期 |
|------|------|----------|
| `main` | 生产版本，每个 commit 都是发布 | 永久 |
| `develop` | 开发整合分支 | 永久 |
| `feature/*` | 新功能开发 | 临时 |
| `release/*` | 发布准备 | 临时 |
| `hotfix/*` | 紧急生产修复 | 临时 |

## 工作流程

### 功能开发

```bash
# 从 develop 建立功能分支
git checkout develop
git pull origin develop
git checkout -b feature/shopping-cart

# 开发完成后合并回 develop
git checkout develop
git merge --no-ff feature/shopping-cart
git push origin develop
git branch -d feature/shopping-cart
```

### 发布准备

```bash
# 从 develop 建立发布分支
git checkout develop
git checkout -b release/1.2.0

# 进行发布准备（版本号更新、文件等）
git commit -m "chore: bump version to 1.2.0"

# 发布就绪后，合并到 main 和 develop
git checkout main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release 1.2.0"

git checkout develop
git merge --no-ff release/1.2.0

git branch -d release/1.2.0
```

### 紧急修复

```bash
# 从 main 建立 hotfix 分支
git checkout main
git checkout -b hotfix/security-fix

# 修复后合并到 main 和 develop
git checkout main
git merge --no-ff hotfix/security-fix
git tag -a v1.2.1 -m "Hotfix 1.2.1"

git checkout develop
git merge --no-ff hotfix/security-fix

git branch -d hotfix/security-fix
```

## 版本标签

```bash
# 建立标签
git tag -a v1.0.0 -m "版本 1.0.0"

# 推送标签
git push origin v1.0.0
git push origin --tags  # 推送所有标签
```

## 优点

| 优点 | 说明 |
|------|------|
| 清晰的分支角色 | 每种分支有明确用途 |
| 支援多版本维护 | 可同时维护多个生产版本 |
| 发布流程可控 | 有专门的发布准备阶段 |
| 适合大型团队 | 结构化的协作流程 |

## 缺点

| 缺点 | 说明 |
|------|------|
| 复杂度较高 | 需要维护多个长期分支 |
| 分支管理开销 | 需要频繁合并 |
| 不适合持续部署 | 发布周期较长 |

## 相关选项

- [GitHub Flow](./github-flow.md) - 更简单的持续部署流程
- [Trunk-Based](./trunk-based.md) - 最简化的持续整合流程

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
