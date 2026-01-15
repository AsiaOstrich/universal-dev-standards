---
source: ../../../../../skills/claude-code/git-workflow-guide/git-workflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# Git 工作流程策略

> **语言**: [English](../../../../../skills/claude-code/git-workflow-guide/git-workflow.md) | 简体中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供 Git 工作流程策略（GitFlow、GitHub Flow、Trunk-Based）的详细指南。

---

## 策略选择矩陣

| 因素 | GitFlow | GitHub Flow | Trunk-Based |
|------|---------|-------------|-------------|
| **發布頻率** | 每月以上 | 每周 | 每天多次 |
| **团队規模** | 大型 (10+) | 中型 (5-15) | 小到中型 (3-10) |
| **CI/CD 成熟度** | 基本 | 中等 | 进阶 |
| **功能旗標** | 可選 | 可選 | 必需 |
| **複雜度** | 高 | 低 | 中 |

---

## 策略 A: GitFlow

**最適合**: 定期發布、多个正式版本、大型团队

### 分支结构

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

### 分支类型

| 分支 | 目的 | 基礎 | 合併至 | 生命周期 |
|------|------|------|--------|---------|
| `main` | 正式程序码 | - | - | 永久 |
| `develop` | 集成 | - | - | 永久 |
| `feature/*` | 新功能 | `develop` | `develop` | 暫时 |
| `release/*` | 發布准备 | `develop` | `main` + `develop` | 暫时 |
| `hotfix/*` | 緊急修復 | `main` | `main` + `develop` | 暫时 |

### 功能开发流程

```bash
# 從 develop 建立
git checkout develop
git pull origin develop
git checkout -b feature/oauth-login

# 工作并提交
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

# 准备發布（提升版本、更新变更日誌）
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

# 修復并提交
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

**最適合**: 持續部署、网页应用程序、小到中型团队

### 分支结构

```
main      ────●─────────●──────●── (Always deployable)
               ╲         ╱      ╱
feature/*       ●───●───●      ╱
                              ╱
bugfix/*                 ────●
```

### 分支类型

| 分支 | 目的 | 基礎 | 合併至 | 生命周期 |
|------|------|------|--------|---------|
| `main` | 正式版本 | - | - | 永久 |
| `feature/*` | 功能 | `main` | `main` | 暫时 |
| `bugfix/*` | 错误修復 | `main` | `main` | 暫时 |

### 工作流程

```bash
# 1. 從 main 建立
git checkout main
git pull origin main
git checkout -b feature/user-profile

# 2. 工作并推送
git add .
git commit -m "feat(profile): add avatar"
git push -u origin feature/user-profile

# 3. 透過 GitHub/GitLab UI 開啟 PR 至 main

# 4. 核准且 CI 通過後，合併（建议使用 squash）

# 5. 將 main 部署至正式環境

# 6. 刪除分支（自动或手动）
```

### 关鍵原則

1. `main` **永遠可部署**
2. 從 `main` 分支
3. 透過 PR 合併至 `main`
4. 合併後立即部署

---

## 策略 C: Trunk-Based Development

**最適合**: 成熟的 CI/CD、高度信任的团队、頻繁集成

### 分支结构

```
main  ────●─●─●─●─●─●─●──► (Single trunk)
           ╲│╱ ╲│╱ ╲│╱
feature/*   ●   ●   ●  (Very short-lived, ≤2 days)
```

### 分支类型

| 分支 | 目的 | 基礎 | 合併至 | 生命周期 |
|------|------|------|--------|---------|
| `main` | 主幹 | - | - | 永久 |
| `feature/*` | 小变更 | `main` | `main` | ≤2 天 |

### 工作流程

```bash
# 1. 建立短期分支
git checkout main
git pull origin main
git checkout -b feature/add-validation

# 2. 小型、原子性变更
git add .
git commit -m "feat(validation): add email check"
git push -u origin feature/add-validation

# 3. 快速 PR 并合併（當天完成）
git checkout main
git pull origin main
git rebase main feature/add-validation
git checkout main
git merge --ff-only feature/add-validation
git push origin main

# 4. 立即刪除
git branch -d feature/add-validation
```

### 关鍵原則

1. **每天集成多次**
2. 分支生命周期 **≤2 天**
3. 使用 **功能旗標** 处理未完成的功能
4. **一切自动化**

---

## 合併策略比較

### Merge Commit (`--no-ff`)

```bash
git merge --no-ff feature/user-auth
```

**優点**: 完整历史、易於还原功能
**缺点**: 複雜的 git log
**最適合**: GitFlow、長期功能

### Squash Merge

```bash
git merge --squash feature/user-auth
git commit -m "feat(auth): add user authentication"
```

**優点**: 乾淨历史、每个功能一个 commit
**缺点**: 失去详细历史
**最適合**: GitHub Flow、功能 PR

### Rebase + Fast-Forward

```bash
git rebase main feature/user-auth
git checkout main
git merge --ff-only feature/user-auth
```

**優点**: 线性历史、保留 commit
**缺点**: 重写历史
**最適合**: Trunk-Based、短期分支

---

## 受保護分支建议

### 針对 `main`

- ✅ 需要 pull request 审查（1-2 人）
- ✅ 需要状态检查（CI、测试、lint）
- ✅ 需要分支保持最新
- ❌ 不允許強制推送
- ❌ 不允許刪除

### 針对 `develop` (GitFlow)

- ✅ 需要 pull request 审查（1 人）
- ✅ 需要状态检查
- ❌ 不允許強制推送

---

## 相关标准

- [Git Workflow](../../../../../core/git-workflow.md)
- [分支命名參考](./branch-naming.md)
- [Commit 消息指南](../../../../../core/commit-message-guide.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权） |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
