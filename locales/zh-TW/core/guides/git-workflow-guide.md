---
source: ../../../../core/guides/git-workflow-guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: f27182c48509
status: current
---

# Git 工作流程指南

> **語言**: [English](../../../../core/guides/git-workflow-guide.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-29
**相關標準**: [Git 工作流程標準](../git-workflow.md)

---

## 目的

本指南提供 Git 工作流程策略的詳細說明、教學與範例。有關可執行的規則與檢查清單，請參閱 [Git 工作流程標準](../git-workflow.md)。

---

## 目錄

1. [工作流程選擇指南](#workflow-selection-guide)
2. [GitFlow 詳細教學](#gitflow-detailed-tutorial)
3. [GitHub Flow 詳細教學](#github-flow-detailed-tutorial)
4. [Trunk-Based Development 教學](#trunk-based-development-tutorial)
5. [功能開關實作](#feature-flags-implementation)
6. [Ship/Show/Ask 決策模型](#shipshowask-decision-model)
7. [堆疊式 PR 工作流程](#stacked-prs-workflow)
8. [傳統式 PR 標題指南](#conventional-pr-titles-guide)
9. [Git 指令參考](#git-commands-reference)
10. [疑難排解指南](#troubleshooting-guide)

---

## 工作流程選擇指南

### 決策樹

使用此流程圖來選擇適當的工作流程：

```
                    ┌─────────────────────────────────────┐
                    │ How often do you deploy to         │
                    │ production?                        │
                    └───────────────┬─────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
   │ Multiple times │    │ Weekly to      │    │ Monthly or     │
   │ per day        │    │ bi-weekly      │    │ longer         │
   └───────┬────────┘    └───────┬────────┘    └───────┬────────┘
           │                     │                     │
           ▼                     ▼                     ▼
   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
   │ Trunk-Based    │    │ GitHub Flow    │    │ GitFlow        │
   │ Development    │    │                │    │                │
   └────────────────┘    └────────────────┘    └────────────────┘
```

### 選擇矩陣

| 因素 | GitFlow | GitHub Flow | Trunk-Based |
|------|---------|-------------|-------------|
| **發布頻率** | 每月以上 | 每週 | 每天多次 |
| **團隊規模** | 大型 (10+) | 中型 (5-15) | 小到中型 (3-10) |
| **CI/CD 成熟度** | 基礎 | 中等 | 進階 |
| **功能開關** | 選用 | 選用 | 必需 |
| **緊急修復流程** | 專用分支 | 與功能相同 | 與功能相同 |
| **複雜度** | 高 | 低 | 中 |

### 快速選擇指南

**選擇 GitFlow 當**:
- 您有固定的發布週期（每月、每季）
- 您同時維護多個正式版本
- 您有獨立的開發團隊和發布管理團隊

**選擇 GitHub Flow 當**:
- 您每週或按需部署到正式環境
- 您只有單一正式版本
- 您想要簡單且有良好追溯性的流程

**選擇 Trunk-Based 當**:
- 您有成熟的 CI/CD 和自動化測試
- 您的團隊實踐持續整合
- 您習慣使用功能開關控制未完成的功能

### 工作流程選擇流程

**誰來決定**：技術主管或工程經理，與團隊協商。

**何時決定**：

| 專案階段 | 動作 |
|---------|------|
| 專案啟動 | 根據團隊規模和發布計畫選擇初始工作流程 |
| 第一次發布 | 審查並確認選擇；鎖定至少一個發布週期 |
| 重大團隊變動 | 如果團隊規模翻倍或減半，重新評估 |
| 發布節奏變更 | 如果從每月改為每週或反之，重新評估 |

**如何記錄**：

1. **記錄在專案 README** 或 CONTRIBUTING.md 中：
   ```markdown
   ## Git Workflow
   This project uses **GitHub Flow**.
   - Decision date: 2025-01-15
   - Decision maker: @techlead
   - Rationale: Weekly deployments, single production version
   ```

2. **設定分支保護**規則以強制執行所選的工作流程。

3. **更新新人入職文件**以參考工作流程選擇。

**變更工作流程**：工作流程變更應視為破壞性變更。至少提前一個衝刺週期宣布，並提供遷移文件。

---

## GitFlow 詳細教學

**最適合**:
- 定期發布（每月、每季）
- 同時維護多個正式版本
- 開發與正式環境明確分離
- 擁有正式發布流程的大型團隊

### 分支結構

```
main          ─●────────●─────────●── (Production releases: v1.0, v2.0)
               ╱          ╲         ╲
develop   ────●────●──────●─────────●── (Development mainline)
             ╱      ╲      ╲
feature/*  ─●────────●      ╲  (Feature branches)
                              ╲
release/*                      ●───● (Release preparation)
                                   ╱
hotfix/*                      ────● (Emergency fixes)
```

### 工作流程步驟

#### 1. 功能開發

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/oauth-login

# Work on feature
git add .
git commit -m "feat(auth): add OAuth2 login"

# Push to remote
git push -u origin feature/oauth-login

# Create pull request to develop
# After review approval, merge to develop
git checkout develop
git merge --no-ff feature/oauth-login
git push origin develop

# Delete feature branch
git branch -d feature/oauth-login
git push origin --delete feature/oauth-login
```

#### 2. 發布準備

> **CHANGELOG 更新**：將條目從 `[Unreleased]` 移至新版本區段並加上發布日期。詳細指南請參閱 [changelog-standards.md](../changelog-standards.md)。

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Prepare release (version bump, changelog, etc.)
# 1. Update CHANGELOG.md: move [Unreleased] to [1.2.0] - YYYY-MM-DD
# 2. Update version in package.json (or equivalent)
npm version 1.2.0
git add package.json CHANGELOG.md
git commit -m "chore(release): prepare v1.2.0"

# Merge to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop

# Delete release branch
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

#### 3. 緊急修復

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Fix the issue
git add .
git commit -m "fix(security): patch SQL injection vulnerability"

# Merge to main
git checkout main
git merge --no-ff hotfix/critical-security-fix
git tag -a v1.2.1 -m "Hotfix version 1.2.1"
git push origin main --tags

# Merge to develop
git checkout develop
git merge --no-ff hotfix/critical-security-fix
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-security-fix
git push origin --delete hotfix/critical-security-fix
```

---

## GitHub Flow 詳細教學

**最適合**:
- 持續部署
- Web 應用程式
- 中小型團隊
- 快速迭代週期

### 分支結構

```
main      ────●─────────●──────●── (Always deployable)
               ╲         ╱      ╱
feature/*       ●───●───●      ╱  (Feature + PR)
                              ╱
bugfix/*                 ────●  (Bug fixes)
```

### 工作流程步驟

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/user-profile

# 2. Work and commit frequently
git add .
git commit -m "feat(profile): add avatar upload"
git push -u origin feature/user-profile

# 3. Open pull request to main
# Use GitHub/GitLab UI to create PR

# 4. After CI passes and review approval, merge to main
# (Usually done via GitHub/GitLab UI with "Squash and merge")

# 5. Deploy main to production
git checkout main
git pull origin main
# Trigger deployment pipeline

# 6. Delete feature branch (auto-deleted by GitHub/GitLab)
```

### 關鍵原則

1. **`main` 永遠可部署**
2. **從 `main` 分支**
3. **透過 PR 合併到 `main`**
4. **合併後立即部署**

---

## Trunk-Based Development 教學

**最適合**:
- 成熟的 CI/CD 管線
- 高信任度且經驗豐富的團隊
- 頻繁整合（每天多次）
- 使用功能開關控制未完成功能

### 分支結構

```
main  ────●─●─●─●─●─●─●──► (Single long-lived branch)
           ╲│╱ ╲│╱ ╲│╱
feature/*   ●   ●   ●  (Very short-lived, ≤2 days)
```

### 工作流程步驟

```bash
# 1. Create short-lived branch
git checkout main
git pull origin main
git checkout -b feature/add-validation

# 2. Make small, atomic change
git add .
git commit -m "feat(validation): add email format check"

# 3. Push and create PR (same day)
git push -u origin feature/add-validation

# 4. Merge quickly after review (within hours)
# Prefer rebase to keep linear history
git checkout main
git pull origin main
git rebase main feature/add-validation
git checkout main
git merge --ff-only feature/add-validation
git push origin main

# 5. Delete branch immediately
git branch -d feature/add-validation
git push origin --delete feature/add-validation
```

### 關鍵原則

1. **頻繁整合**（每天多次）
2. **保持分支短命**（≤2 天）
3. **使用功能開關**控制未完成功能
4. **自動化一切**（測試、建置、部署）

---

## 功能開關實作

### 為何功能開關不可或缺

功能開關使 trunk-based development 能夠將**部署**與**發布**解耦：

```
┌─────────────────────────────────────────────────────────────────┐
│                    Code Lifecycle                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Merge to main    Deploy to Prod    Enable for Users           │
│        │                │                   │                    │
│        ▼                ▼                   ▼                    │
│   ┌─────────┐      ┌─────────┐        ┌─────────┐              │
│   │ Commit  │─────►│ Deploy  │───────►│ Release │              │
│   │ (Code)  │      │ (Binary)│        │ (Users) │              │
│   └─────────┘      └─────────┘        └─────────┘              │
│                         │                   │                    │
│                         │    Feature Flag   │                    │
│                         └───────────────────┘                    │
│                              (Decoupled)                         │
└─────────────────────────────────────────────────────────────────┘
```

### 實作模式

**基本切換**：

```javascript
// Simple on/off flag
if (featureFlags.isEnabled('new-checkout-flow')) {
  return newCheckoutFlow(cart);
} else {
  return legacyCheckoutFlow(cart);
}
```

**逐步推出**：

```javascript
// Percentage-based rollout
const flag = featureFlags.get('new-checkout-flow');
if (flag.isEnabledForPercentage(user.id, 10)) {
  // 10% of users see new flow
  return newCheckoutFlow(cart);
}
```

**使用者分群鎖定**：

```javascript
// Target specific user segments
if (featureFlags.isEnabledFor('new-checkout-flow', {
  userId: user.id,
  plan: user.plan,        // e.g., 'enterprise'
  region: user.region,    // e.g., 'asia-pacific'
  betaTester: user.isBetaTester
})) {
  return newCheckoutFlow(cart);
}
```

### 功能開關生命週期

| 階段 | 開關狀態 | 動作 |
|------|---------|------|
| 開發 | 關閉 | 程式碼已合併但隱藏 |
| 內部測試 | 對團隊開啟 | QA 和 dogfooding |
| Beta | 對 beta 使用者開啟 | 收集回饋 |
| 逐步推出 | 1% → 10% → 50% → 100% | 監控指標 |
| 完整發布 | 對所有人開啟 | 預設行為 |
| 清理 | 移除開關 | 技術債清理 |

### 開關衛生最佳實踐

1. **具描述性地命名開關**：`enable-new-checkout-v2` 而非 `flag-123`
2. **設定到期日**：審查並移除陳舊開關
3. **限制使用中開關數量**：過多開關 = 複雜度
4. **記錄開關用途**：內容、原因以及何時移除

```javascript
// Flag metadata example
{
  "name": "enable-new-checkout-v2",
  "description": "New checkout flow with improved UX",
  "owner": "checkout-team",
  "createdAt": "2026-01-15",
  "targetRemovalDate": "2026-03-15",
  "status": "gradual-rollout"
}
```

---

## Ship/Show/Ask 決策模型

### 概述

並非所有變更都需要相同的審查流程。Ship/Show/Ask 模型幫助團隊決定：

```
┌─────────────────────────────────────────────────────────────────┐
│                    Ship / Show / Ask                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   SHIP                SHOW                ASK                    │
│   ────                ────                ───                    │
│   Push directly       Merge, then         Open PR, wait          │
│   to main            notify team         for approval            │
│                                                                  │
│   Low risk           Medium risk         High risk               │
│   High confidence    Need awareness      Need discussion         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 何時 Ship（直接推送）

**準則**：
- 小型、低風險變更
- 對正確性具有高度信心
- 若出錯容易還原
- 健全的測試覆蓋率

**範例**：
- 文件中的錯字修正
- 新增除錯日誌
- 更新依賴（CI 通過時）
- 設定變更（非破壞性）
- 明顯的 bug 修復（有測試）

```bash
# Ship: Direct push to main
git checkout main
git pull origin main
# Make small change
git add .
git commit -m "fix: correct typo in error message"
git push origin main
```

### 何時 Show（合併後通知）

**準則**：
- 團隊應該知悉
- 程式碼審查是可有可無（錦上添花），不具阻塞性
- 變更單純直接
- 希望獲得回饋但非阻塞式核准

**範例**：
- 改善程式碼品質的重構
- 為既有功能新增測試
- 非關鍵的功能增強
- 更新內部文件

```bash
# Show: Merge and notify
git checkout -b refactor/extract-validation
# Make changes
git add .
git commit -m "refactor: extract validation logic"
git push origin refactor/extract-validation

# Create PR and immediately merge (no blocking review)
gh pr create --title "refactor: extract validation logic" --body "FYI: Extracting validation for reuse"
gh pr merge --auto --squash

# Notify team in Slack/Teams
```

### 何時 Ask（PR 加阻塞審查）

**準則**：
- 架構決策
- 重大變更
- 安全敏感程式碼
- 新模式或慣例
- 您不確定的變更

**範例**：
- 新 API 端點
- 資料庫 schema 變更
- 身分驗證／授權變更
- 共用函式庫的變更
- 效能關鍵程式碼

```bash
# Ask: Full PR process
git checkout -b feature/new-auth-flow
# Make changes
git push origin feature/new-auth-flow

# Create PR and request review
gh pr create --title "feat(auth): implement OAuth2 PKCE flow" \
  --body "## What\nNew authentication flow\n\n## Why\nImproved security" \
  --reviewer security-team,backend-team
```

### 決策流程圖

```
┌────────────────────────────────────────┐
│ Is this change risky or complex?       │
└────────────────────┬───────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
        YES                      NO
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌────────────────────────┐
│ Does it need    │    │ Should team be aware?  │
│ discussion?     │    └───────────┬────────────┘
└────────┬────────┘                │
         │                ┌────────┴────────┐
    ┌────┴────┐           ▼                 ▼
    ▼         ▼          YES                NO
   YES        NO          │                 │
    │         │           ▼                 ▼
    ▼         ▼     ┌──────────┐      ┌──────────┐
┌───────┐ ┌───────┐ │   SHOW   │      │   SHIP   │
│  ASK  │ │  ASK  │ │ (notify) │      │ (direct) │
│(review)│ │(review)│ └──────────┘      └──────────┘
└───────┘ └───────┘
```

---

## 堆疊式 PR 工作流程

### 什麼是堆疊式 PR？

堆疊式 PR 將大型功能拆分為可漸進審查的較小、相依的 pull request：

```
┌─────────────────────────────────────────────────────────────────┐
│                    Stacked PRs Structure                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   main ────●─────────────────────────────────────────►          │
│             ╲                                                    │
│              PR #1 (Database schema) ────●                       │
│                                           ╲                      │
│                                            PR #2 (API) ────●     │
│                                                            ╲     │
│                                                      PR #3 (UI) ●│
│                                                                  │
│   Review: PR #1 first, then #2, then #3                         │
│   Merge: PR #1 → PR #2 → PR #3                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 何時使用堆疊式 PR

| 情境 | 推薦使用堆疊式 PR |
|------|-----------------|
| 功能 > 500 行 | 是 |
| 多個邏輯元件 | 是 |
| 需要早期回饋 | 是 |
| 簡單 bug 修復 | 否，使用單一 PR |
| 獨立變更 | 否，使用平行 PR |

### 建立堆疊式 PR

**步驟 1：規劃堆疊**

```
Feature: User Authentication
├── PR #1: Database schema for users table
├── PR #2: User service and repository
├── PR #3: REST API endpoints
└── PR #4: Frontend login form
```

**步驟 2：建立基礎分支**

```bash
# Start from main
git checkout main
git pull origin main

# Create first PR branch
git checkout -b feature/auth-1-schema
# Make database changes
git add .
git commit -m "feat(db): add users table schema"
git push origin feature/auth-1-schema
```

**步驟 3：堆疊下一個分支**

```bash
# Branch from previous, NOT from main
git checkout -b feature/auth-2-service feature/auth-1-schema
# Make service changes
git add .
git commit -m "feat(auth): add user service"
git push origin feature/auth-2-service
```

**步驟 4：建立連結的 PR**

```bash
# PR #1: Against main
gh pr create --base main --head feature/auth-1-schema \
  --title "feat(db): add users table schema" \
  --body "Part 1/4 of user authentication feature"

# PR #2: Against PR #1's branch
gh pr create --base feature/auth-1-schema --head feature/auth-2-service \
  --title "feat(auth): add user service" \
  --body "Part 2/4 - depends on #1"
```

### 處理基礎 PR 的更新

當 PR #1 在 PR #2 建立後發生變更時：

```bash
# Rebase PR #2 on updated PR #1
git checkout feature/auth-2-service
git fetch origin
git rebase origin/feature/auth-1-schema
git push --force-with-lease origin feature/auth-2-service
```

### 合併堆疊式 PR

```bash
# Merge in order
# 1. Merge PR #1 to main (squash or merge commit)
gh pr merge 1 --squash

# 2. Update PR #2 base to main (GitHub auto-updates)
# 3. Merge PR #2 to main
gh pr merge 2 --squash

# Continue for remaining PRs...
```

### 堆疊式 PR 的工具

| 工具 | 說明 |
|------|------|
| [Graphite](https://graphite.dev/) | 專為堆疊式 PR 打造 |
| [ghstack](https://github.com/ezyang/ghstack) | 用於堆疊 PR 的 CLI |
| [git-branchless](https://github.com/arxanas/git-branchless) | 進階 Git 工作流程 |
| 手動 | 使用 git rebase 和 gh CLI |

---

## 傳統式 PR 標題指南

### 格式

PR 標題應遵循與 commit 訊息相同的格式：

```
<type>(<scope>): <subject>
```

### 類型參考

| 類型 | 用途 | 範例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): add OAuth2 login` |
| `fix` | Bug 修復 | `fix(api): handle null response` |
| `docs` | 文件 | `docs(readme): update install steps` |
| `refactor` | 程式碼重構 | `refactor(utils): extract validation` |
| `test` | 新增測試 | `test(auth): add login unit tests` |
| `chore` | 維護 | `chore(deps): update lodash to 4.17.21` |
| `perf` | 效能 | `perf(query): optimize user lookup` |
| `style` | 程式碼風格 | `style(lint): fix eslint warnings` |
| `ci` | CI/CD 變更 | `ci(actions): add caching step` |
| `build` | 建置系統 | `build(webpack): upgrade to v5` |

### 重大變更

在類型後加上 `!` 表示重大變更：

```
feat(api)!: change response format for users endpoint
```

### PR 標題最佳實踐

**良好範例**：
```
feat(checkout): add Apple Pay support
fix(auth): prevent session fixation attack
refactor(orders): extract shipping calculator
docs(api): document rate limiting headers
chore(deps): update security patches
```

**不良範例**：
```
❌ Update code                    (too vague)
❌ fix bug                        (not descriptive)
❌ WIP: working on auth          (WIP shouldn't be in title)
❌ JIRA-1234                      (no description)
❌ Final fixes                    (meaningless)
```

### 自動化強制執行

設定 GitHub Actions 來驗證 PR 標題：

```yaml
# .github/workflows/pr-title.yml
name: PR Title Check
on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            docs
            refactor
            test
            chore
            perf
            style
            ci
            build
          requireScope: false
          subjectPattern: ^[A-Z].+$
          subjectPatternError: |
            Subject must start with uppercase letter
```

---

## Git 指令參考

### 日常操作

```bash
# Check status
git status

# View changes
git diff
git diff --staged

# Stage changes
git add file.js
git add .

# Commit
git commit -m "feat: add feature"

# Push
git push origin feature/my-feature

# Pull latest
git pull origin main

# View history
git log --oneline --graph --all
```

### 分支操作

```bash
# List branches
git branch -a

# Create branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature

# Rename branch
git branch -m old-name new-name
```

### 進階操作

```bash
# Stash changes
git stash
git stash pop

# Cherry-pick commit
git cherry-pick <commit-hash>

# Revert commit
git revert <commit-hash>

# Reset to previous commit (dangerous!)
git reset --hard <commit-hash>

# Amend last commit
git commit --amend

# Interactive rebase (clean up commits)
git rebase -i HEAD~3
```

---

## 疑難排解指南

### 不小心提交到錯誤分支

```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Switch to correct branch
git checkout correct-branch

# Commit changes
git add .
git commit -m "feat: add feature"
```

### 需要從 main 更新分支

```bash
# Option 1: Merge (preserves history)
git checkout feature/my-feature
git merge main

# Option 2: Rebase (cleaner history)
git checkout feature/my-feature
git rebase main
```

### 不小心強制推送到受保護分支

```bash
# ⚠️ Contact team immediately
# ⚠️ Check if branch protection was enabled
# ⚠️ Restore from reflog if needed:
git reflog
git reset --hard <previous-commit-hash>
```

---

## 專案設定範本

在 `CONTRIBUTING.md` 中記錄您的工作流程：

```markdown
## Git Workflow

### Branching Strategy
This project uses **[GitFlow / GitHub Flow / Trunk-Based Development]**.

### Branch Types
- `main`: Production code
- `develop`: Development mainline (GitFlow only)
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Branch Naming
Format: `<type>/<description>`
Example: `feature/oauth-login`, `fix/memory-leak`

### Merge Strategy
- Feature branches: **[Squash / Merge commit / Rebase]**
- Release branches: Merge commit (--no-ff)
- Hotfix branches: Merge commit (--no-ff)

### Protected Branches
- `main`: Requires 1 review, CI must pass
- `develop`: Requires 1 review (if using GitFlow)

### Pull Request Process
1. Create branch from `[main/develop]`
2. Make changes and push
3. Open PR with description
4. Wait for review approval
5. Ensure CI passes
6. Merge using **[strategy]**
```

---

## 參考資料

- [GitFlow 原始文章](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow 指南](https://guides.github.com/introduction/flow/)
- [Trunk-Based Development](https://trunkbaseddevelopment.com/)
- [Semantic Versioning](https://semver.org/)
- [Ship/Show/Ask](https://martinfowler.com/articles/ship-show-ask.html) - Rouan Wilsenach 的程式碼變更決策模型
- [Feature Flags 最佳實踐](https://launchdarkly.com/blog/best-practices-feature-flags/) - LaunchDarkly 的完整指南
- [Stacked Diffs](https://graphite.dev/guides/stacked-diffs) - Graphite 的堆疊式 PR 工作流程指南
- [Conventional Commits](https://www.conventionalcommits.org/) - commit 訊息規範

---

## 授權條款

本指南採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。
