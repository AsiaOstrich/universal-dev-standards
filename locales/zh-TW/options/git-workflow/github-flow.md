---
source: ../../../../options/git-workflow/github-flow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: b19d6c2614d2
status: current
---

# GitHub Flow 工作流程

> **語言**: [English](../../../../options/git-workflow/github-flow.md) | 繁體中文

**上層標準**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

GitHub Flow 是一種輕量級、以分支為基礎的工作流程，專為定期部署的團隊設計。它易於理解與實施，非常適合持續部署環境。

## 適用情境

- 持續部署（每天多次到每週一次）
- Web 應用程式與 SaaS 產品
- 小型到中型團隊（5-15 位開發者）
- 具備完善 CI/CD 管線的專案

## 分支架構

| 分支 | 用途 | 生命週期 |
|------|------|----------|
| `main` | 隨時可部署的生產程式碼 | 永久 |
| `feature/*` | 新功能或修復 | 短期（理想為 1-3 天） |

## 核心原則

1. **Main 隨時可部署** - main 分支應始終處於可部署狀態
2. **所有工作都開分支** - 任何新工作都建立分支
3. **使用具描述性的名稱** - 分支名稱應描述該項工作
4. **及早開啟 PR** - 透過 pull request 及早取得回饋
5. **合併後部署** - 合併到 main 後立即部署

## 工作流程步驟

### 1. 建立功能分支

```bash
# Start from latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/user-authentication
```

### 2. 進行變更並提交

```bash
# Make your changes
git add .
git commit -m "feat(auth): add login form component"

# Continue making commits...
git commit -m "feat(auth): add authentication service"
git commit -m "test(auth): add login tests"
```

### 3. 推送並建立 Pull Request

```bash
# Push branch to remote
git push -u origin feature/user-authentication

# Create PR via GitHub/GitLab UI
# - Add description
# - Request reviewers
# - Link related issues
```

### 4. 審查與合併

- 取得程式碼審查核准
- 確保 CI 檢查通過
- 透過 GitHub 介面合併（squash 或 merge commit）

### 5. 部署與清理

```bash
# After merge, update local main
git checkout main
git pull origin main

# Delete feature branch
git branch -d feature/user-authentication
```

## 分支命名慣例

```
<type>/<short-description>

Examples:
feature/oauth-login
fix/memory-leak
docs/api-reference
refactor/user-service
```

## 合併策略建議

| 合併類型 | 使用時機 |
|----------|----------|
| **Squash Merge** | 大多數功能分支（乾淨的歷史） |
| **Merge Commit** | 需要保留 commit 歷史時 |
| **Rebase + FF** | 生命週期極短的分支 |

## 優點

- 易於理解與實施
- 與 CI/CD 搭配良好
- 鼓勵頻繁整合
- 分支管理負擔最小

## 缺點

- 沒有獨立的開發整合分支
- 所有功能直接進入 main
- 較不適合排程發布

## 相關選項

- [GitFlow](./gitflow.md) - 適用於排程發布
- [Trunk-Based Development](./trunk-based.md) - 適用於更頻繁的整合

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
