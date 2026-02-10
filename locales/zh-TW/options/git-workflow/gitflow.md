---
source: ../../../../options/git-workflow/gitflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# GitFlow 工作流程

> **語言**: [English](../../../options/git-workflow/gitflow.md) | 繁體中文

**上層標準**: [Git 工作流程](../../core/git-workflow.md)

---

## 概述

GitFlow 是一個嚴謹的分支模型，專為有排程發布週期的專案設計。它定義了功能開發、發布準備和維護的具體分支角色。

## 適用情境

- 有排程發布週期的專案
- 需要同時維護多個版本的軟體
- 企業級應用程式
- 需要嚴格品質控管的團隊

## 分支架構

```
main ────●────────●────────●──────── (生產版本)
         │        │        │
         │   release/1.0   │
         │   ┌────●────┐   │
         │   │         │   │
develop ─●───●─────────●───●──────── (開發主線)
         │             │
    feature/a     feature/b
    ┌────●────┐   ┌────●────┐
```

## 分支類型

| 分支 | 用途 | 生命週期 |
|------|------|----------|
| `main` | 生產版本，每個 commit 都是發布 | 永久 |
| `develop` | 開發整合分支 | 永久 |
| `feature/*` | 新功能開發 | 臨時 |
| `release/*` | 發布準備 | 臨時 |
| `hotfix/*` | 緊急生產修復 | 臨時 |

## 工作流程

### 功能開發

```bash
# 從 develop 建立功能分支
git checkout develop
git pull origin develop
git checkout -b feature/shopping-cart

# 開發完成後合併回 develop
git checkout develop
git merge --no-ff feature/shopping-cart
git push origin develop
git branch -d feature/shopping-cart
```

### 發布準備

```bash
# 從 develop 建立發布分支
git checkout develop
git checkout -b release/1.2.0

# 進行發布準備（版本號更新、文件等）
git commit -m "chore: bump version to 1.2.0"

# 發布就緒後，合併到 main 和 develop
git checkout main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release 1.2.0"

git checkout develop
git merge --no-ff release/1.2.0

git branch -d release/1.2.0
```

### 緊急修復

```bash
# 從 main 建立 hotfix 分支
git checkout main
git checkout -b hotfix/security-fix

# 修復後合併到 main 和 develop
git checkout main
git merge --no-ff hotfix/security-fix
git tag -a v1.2.1 -m "Hotfix 1.2.1"

git checkout develop
git merge --no-ff hotfix/security-fix

git branch -d hotfix/security-fix
```

## 版本標籤

```bash
# 建立標籤
git tag -a v1.0.0 -m "版本 1.0.0"

# 推送標籤
git push origin v1.0.0
git push origin --tags  # 推送所有標籤
```

## 優點

| 優點 | 說明 |
|------|------|
| 清晰的分支角色 | 每種分支有明確用途 |
| 支援多版本維護 | 可同時維護多個生產版本 |
| 發布流程可控 | 有專門的發布準備階段 |
| 適合大型團隊 | 結構化的協作流程 |

## 缺點

| 缺點 | 說明 |
|------|------|
| 複雜度較高 | 需要維護多個長期分支 |
| 分支管理開銷 | 需要頻繁合併 |
| 不適合持續部署 | 發布週期較長 |

## 相關選項

- [GitHub Flow](./github-flow.md) - 更簡單的持續部署流程
- [Trunk-Based](./trunk-based.md) - 最簡化的持續整合流程

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
