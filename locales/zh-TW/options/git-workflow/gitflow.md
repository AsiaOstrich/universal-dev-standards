---
source: ../../../../options/git-workflow/gitflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 4770d4d33ca8
status: current
---

# GitFlow 工作流程

> **語言**: [English](../../../../options/git-workflow/gitflow.md) | 繁體中文

**上層標準**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

GitFlow 是一種專為排程發布專案設計的分支模型。它為管理具有多條平行開發線的大型專案提供了穩健的框架。

## 適用情境

- 排程發布（每月或更長的週期）
- 多版本維護
- 大型團隊（10 位以上開發者）
- 具有正式發布流程的企業環境

## 分支架構

| 分支 | 用途 | 生命週期 | 基底 | 合併至 |
|------|------|----------|------|--------|
| `main` | 生產版本 | 永久 | - | - |
| `develop` | 整合分支 | 永久 | main | - |
| `feature/*` | 新功能 | 短期 | develop | develop |
| `release/*` | 發布準備 | 中期（1-2 週） | develop | main, develop |
| `hotfix/*` | 緊急修復 | 極短 | main | main, develop |

## 分支圖

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

## 核心原則

1. **絕不直接提交到 main** - 使用 release 或 hotfix 分支
2. **Develop 是整合分支** - 所有功能先合併到這裡
3. **Release 分支凍結功能** - 只允許錯誤修復
4. **Hotfix 同時合併到 main 與 develop** - 保持分支同步

## 工作流程：功能開發

### 1. 開始功能

```bash
git checkout develop
git pull origin develop
git checkout -b feature/user-dashboard
```

### 2. 開發功能

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

## 工作流程：發布

### 1. 建立 Release 分支

```bash
git checkout develop
git checkout -b release/v1.2.0
```

### 2. 準備發布

```bash
# Update version numbers
# Update CHANGELOG
# Bug fixes only - no new features!
git commit -m "chore: bump version to 1.2.0"
```

### 3. 完成發布

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

## 工作流程：緊急修復

### 1. 建立 Hotfix

```bash
git checkout main
git checkout -b hotfix/security-patch
```

### 2. 修復並完成

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

## 優點

- 開發與生產環境明確分離
- 支援功能的平行開發
- 非常適合排程發布
- 易於維護多個版本

## 缺點

- 分支結構複雜
- 對小型團隊而言負擔較重
- 可能導致長期存在的功能分支
- 較容易發生合併衝突

## 相關選項

- [GitHub Flow](./github-flow.md) - 適用於持續部署的較簡單替代方案
- [Trunk-Based Development](./trunk-based.md) - 適用於具備成熟 CI/CD 的團隊

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
