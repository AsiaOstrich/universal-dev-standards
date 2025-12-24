---
source: ../../../../../skills/claude-code/git-workflow-guide/git-workflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# Git 工作流程策略

> **語言**: [English](../../../../../skills/claude-code/git-workflow-guide/git-workflow.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供 Git 工作流程策略（GitFlow、GitHub Flow、Trunk-Based）的詳細指南。

---

## 策略選擇矩陣

| 因素 | GitFlow | GitHub Flow | Trunk-Based |
|------|---------|-------------|-------------|
| **發布頻率** | 每月以上 | 每週 | 每天多次 |
| **團隊規模** | 大型 (10+) | 中型 (5-15) | 小到中型 (3-10) |
| **CI/CD 成熟度** | 基本 | 中等 | 進階 |
| **功能旗標** | 可選 | 可選 | 必需 |
| **複雜度** | 高 | 低 | 中 |

---

## 策略 A: GitFlow

**最適合**: 定期發布、多個正式版本、大型團隊

### 分支結構

```
main          ─●────────●─────────●── (Production: v1.0, v2.0)
               ╱          ╲         ╲
develop   ────●────●──────●─────────●── (Development)
             ╱      ╲      ╲
feature/*  ─●────────●      ╲  (Features)
                              ╲
release/*                      ●───● (Release prep)
                                   ╱
hotfix/*                      ────● (Emergency fixes)
```

### 分支類型

| 分支 | 目的 | 基礎 | 合併至 | 生命週期 |
|------|------|------|--------|---------|
| `main` | 正式程式碼 | - | - | 永久 |
| `develop` | 整合 | - | - | 永久 |
| `feature/*` | 新功能 | `develop` | `develop` | 暫時 |
| `release/*` | 發布準備 | `develop` | `main` + `develop` | 暫時 |
| `hotfix/*` | 緊急修復 | `main` | `main` + `develop` | 暫時 |

### 功能開發流程

```bash
# 從 develop 建立
git checkout develop
git pull origin develop
git checkout -b feature/oauth-login

# 工作並提交
git add .
git commit -m "feat(auth): add OAuth2 login"
git push -u origin feature/oauth-login

# PR 核准後，合併至 develop
git checkout develop
git merge --no-ff feature/oauth-login
git push origin develop

# 刪除功能分支
git branch -d feature/oauth-login
git push origin --delete feature/oauth-login
```

### 發布流程

```bash
# 建立發布分支
git checkout develop
git checkout -b release/v1.2.0

# 準備發布（提升版本、更新變更日誌）
npm version 1.2.0
git add package.json CHANGELOG.md
git commit -m "chore(release): prepare v1.2.0"

# 合併至 main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags

# 合併回 develop
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop

# 刪除發布分支
git branch -d release/v1.2.0
```

### 緊急修復流程

```bash
# 從 main 建立
git checkout main
git checkout -b hotfix/critical-fix

# 修復並提交
git add .
git commit -m "fix(security): patch vulnerability"

# 合併至 main
git checkout main
git merge --no-ff hotfix/critical-fix
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push origin main --tags

# 合併至 develop
git checkout develop
git merge --no-ff hotfix/critical-fix
git push origin develop
```

---

## 策略 B: GitHub Flow

**最適合**: 持續部署、網頁應用程式、小到中型團隊

### 分支結構

```
main      ────●─────────●──────●── (Always deployable)
               ╲         ╱      ╱
feature/*       ●───●───●      ╱
                              ╱
bugfix/*                 ────●
```

### 分支類型

| 分支 | 目的 | 基礎 | 合併至 | 生命週期 |
|------|------|------|--------|---------|
| `main` | 正式版本 | - | - | 永久 |
| `feature/*` | 功能 | `main` | `main` | 暫時 |
| `bugfix/*` | 錯誤修復 | `main` | `main` | 暫時 |

### 工作流程

```bash
# 1. 從 main 建立
git checkout main
git pull origin main
git checkout -b feature/user-profile

# 2. 工作並推送
git add .
git commit -m "feat(profile): add avatar"
git push -u origin feature/user-profile

# 3. 透過 GitHub/GitLab UI 開啟 PR 至 main

# 4. 核准且 CI 通過後，合併（建議使用 squash）

# 5. 將 main 部署至正式環境

# 6. 刪除分支（自動或手動）
```

### 關鍵原則

1. `main` **永遠可部署**
2. 從 `main` 分支
3. 透過 PR 合併至 `main`
4. 合併後立即部署

---

## 策略 C: Trunk-Based Development

**最適合**: 成熟的 CI/CD、高度信任的團隊、頻繁整合

### 分支結構

```
main  ────●─●─●─●─●─●─●──► (Single trunk)
           ╲│╱ ╲│╱ ╲│╱
feature/*   ●   ●   ●  (Very short-lived, ≤2 days)
```

### 分支類型

| 分支 | 目的 | 基礎 | 合併至 | 生命週期 |
|------|------|------|--------|---------|
| `main` | 主幹 | - | - | 永久 |
| `feature/*` | 小變更 | `main` | `main` | ≤2 天 |

### 工作流程

```bash
# 1. 建立短期分支
git checkout main
git pull origin main
git checkout -b feature/add-validation

# 2. 小型、原子性變更
git add .
git commit -m "feat(validation): add email check"
git push -u origin feature/add-validation

# 3. 快速 PR 並合併（當天完成）
git checkout main
git pull origin main
git rebase main feature/add-validation
git checkout main
git merge --ff-only feature/add-validation
git push origin main

# 4. 立即刪除
git branch -d feature/add-validation
```

### 關鍵原則

1. **每天整合多次**
2. 分支生命週期 **≤2 天**
3. 使用 **功能旗標** 處理未完成的功能
4. **一切自動化**

---

## 合併策略比較

### Merge Commit (`--no-ff`)

```bash
git merge --no-ff feature/user-auth
```

**優點**: 完整歷史、易於還原功能
**缺點**: 複雜的 git log
**最適合**: GitFlow、長期功能

### Squash Merge

```bash
git merge --squash feature/user-auth
git commit -m "feat(auth): add user authentication"
```

**優點**: 乾淨歷史、每個功能一個 commit
**缺點**: 失去詳細歷史
**最適合**: GitHub Flow、功能 PR

### Rebase + Fast-Forward

```bash
git rebase main feature/user-auth
git checkout main
git merge --ff-only feature/user-auth
```

**優點**: 線性歷史、保留 commit
**缺點**: 重寫歷史
**最適合**: Trunk-Based、短期分支

---

## 受保護分支建議

### 針對 `main`

- ✅ 需要 pull request 審查（1-2 人）
- ✅ 需要狀態檢查（CI、測試、lint）
- ✅ 需要分支保持最新
- ❌ 不允許強制推送
- ❌ 不允許刪除

### 針對 `develop` (GitFlow)

- ✅ 需要 pull request 審查（1 人）
- ✅ 需要狀態檢查
- ❌ 不允許強制推送

---

## 相關標準

- [Git Workflow](../../../../../core/git-workflow.md)
- [分支命名參考](./branch-naming.md)
- [Commit 訊息指南](../../../../../core/commit-message-guide.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：標準章節（目的、相關標準、版本歷史、授權） |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
