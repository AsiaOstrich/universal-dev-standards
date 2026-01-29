---
source: ../../../options/git-workflow/github-flow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# GitHub Flow 工作流程

> **語言**: [English](../../../options/git-workflow/github-flow.md) | 繁體中文

**上層標準**: [Git 工作流程](../../core/git-workflow.md)

---

## 概述

GitHub Flow 是一個輕量級、以分支為基礎的工作流程，支援定期部署的團隊和專案。它強調簡單性，只使用一個長期分支（main），並搭配短期功能分支。

## 適用情境

- 持續部署環境
- 小型到中型團隊
- Web 應用程式和 SaaS 產品
- 需要頻繁發布的專案

## 核心原則

| 原則 | 說明 |
|------|------|
| Main 隨時可部署 | `main` 分支永遠處於可發布狀態 |
| 功能分支 | 所有工作在功能分支上進行 |
| Pull Request | 透過 PR 進行程式碼審查 |
| 合併後立即部署 | 合併到 main 即觸發部署 |

## 工作流程步驟

### 1. 從 main 建立分支

```bash
git checkout main
git pull origin main
git checkout -b feature/user-authentication
```

### 2. 進行變更並提交

```bash
# 進行變更
git add .
git commit -m "feat(auth): add login form component"

# 持續提交
git commit -m "feat(auth): add form validation"
git commit -m "test(auth): add login form tests"
```

### 3. 推送並建立 Pull Request

```bash
git push origin feature/user-authentication
# 在 GitHub 上建立 Pull Request
```

### 4. 討論與審查

- 團隊成員審查程式碼
- 討論變更
- 進行必要的修改
- CI/CD 自動執行測試

### 5. 合併並部署

```bash
# 審查通過後，透過 GitHub 介面合併
# 或使用命令列：
git checkout main
git merge --no-ff feature/user-authentication
git push origin main

# 刪除功能分支
git branch -d feature/user-authentication
git push origin --delete feature/user-authentication
```

## 分支命名慣例

| 類型 | 格式 | 範例 |
|------|------|------|
| 功能 | `feature/<描述>` | `feature/user-profile` |
| 錯誤修復 | `fix/<描述>` | `fix/login-redirect` |
| 熱修復 | `hotfix/<描述>` | `hotfix/security-patch` |
| 文件 | `docs/<描述>` | `docs/api-reference` |

## 優點

| 優點 | 說明 |
|------|------|
| 簡單易學 | 只需記住一個流程 |
| 快速迭代 | 支援持續部署 |
| 清晰的審查流程 | PR 確保程式碼品質 |
| 自動化友善 | 易於整合 CI/CD |

## 缺點

| 缺點 | 說明 |
|------|------|
| 無發布分支 | 不適合需要版本控制的專案 |
| 需要可靠的測試 | main 必須隨時可部署 |
| 不適合多版本維護 | 難以同時維護多個生產版本 |

## 相關選項

- [GitFlow](./gitflow.md) - 適合有排程發布的專案
- [Trunk-Based](./trunk-based.md) - 更簡化的持續整合流程

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
