---
source: ../../../../../skills/claude-code/git-workflow-guide/git-workflow.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# Git 工作流程策略

> **语言**: [English](../../../../../skills/claude-code/git-workflow-guide/git-workflow.md) | 繁体中文

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

## 目的

本文件提供 Git 工作流程策略（GitFlow、GitHub Flow、Trunk-Based）的详细指南。

---

## 策略选择矩阵

| 因素 | GitFlow | GitHub Flow | Trunk-Based |
|------|---------|-------------|-------------|
| **发布频率** | 每月以上 | 每周 | 每天多次 |
| **团队规模** | 大型 (10+) | 中型 (5-15) | 小到中型 (3-10) |
| **CI/CD 成熟度** | 基本 | 中等 | 进阶 |
| **功能旗标** | 可选 | 可选 | 必需 |
| **复杂度** | 高 | 低 | 中 |

---

## 策略 A: GitFlow

**最适合**: 定期发布、多个正式版本、大型团队

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

| 分支 | 目的 | 基础 | 合并至 | 生命周期 |
|------|------|------|--------|---------|
| `main` | 正式程式码 | - | - | 永久 |
| `develop` | 整合 | - | - | 永久 |
| `feature/*` | 新功能 | `develop` | `develop` | 暂时 |
| `release/*` | 发布准备 | `develop` | `main` + `develop` | 暂时 |
| `hotfix/*` | 紧急修复 | `main` | `main` + `develop` | 暂时 |

### 功能开发流程

```bash
# 从 develop 建立
git checkout develop
git pull origin develop
git checkout -b feature/oauth-login

# 工作并提交
git add .
git commit -m "feat(auth): add OAuth2 login"
git push -u origin feature/oauth-login

# PR 核准后，合并至 develop
git checkout develop
git merge --no-ff feature/oauth-login
git push origin develop

# 删除功能分支
git branch -d feature/oauth-login
git push origin --delete feature/oauth-login
```

### 发布流程

```bash
# 建立发布分支
git checkout develop
git checkout -b release/v1.2.0

# 准备发布（提升版本、更新变更日志）
npm version 1.2.0
git add package.json CHANGELOG.md
git commit -m "chore(release): prepare v1.2.0"

# 合并至 main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin main --tags

# 合并回 develop
git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop

# 删除发布分支
git branch -d release/v1.2.0
```

### 紧急修复流程

```bash
# 从 main 建立
git checkout main
git checkout -b hotfix/critical-fix

# 修复并提交
git add .
git commit -m "fix(security): patch vulnerability"

# 合并至 main
git checkout main
git merge --no-ff hotfix/critical-fix
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push origin main --tags

# 合并至 develop
git checkout develop
git merge --no-ff hotfix/critical-fix
git push origin develop
```

---

## 策略 B: GitHub Flow

**最适合**: 持续部署、网页应用程式、小到中型团队

### 分支结构

```
main      ────●─────────●──────●── (Always deployable)
               ╲         ╱      ╱
feature/*       ●───●───●      ╱
                              ╱
bugfix/*                 ────●
```

### 分支类型

| 分支 | 目的 | 基础 | 合并至 | 生命周期 |
|------|------|------|--------|---------|
| `main` | 正式版本 | - | - | 永久 |
| `feature/*` | 功能 | `main` | `main` | 暂时 |
| `bugfix/*` | 错误修复 | `main` | `main` | 暂时 |

### 工作流程

```bash
# 1. 从 main 建立
git checkout main
git pull origin main
git checkout -b feature/user-profile

# 2. 工作并推送
git add .
git commit -m "feat(profile): add avatar"
git push -u origin feature/user-profile

# 3. 透过 GitHub/GitLab UI 开启 PR 至 main

# 4. 核准且 CI 通过后，合并（建议使用 squash）

# 5. 将 main 部署至正式环境

# 6. 删除分支（自动或手动）
```

### 关键原则

1. `main` **永远可部署**
2. 从 `main` 分支
3. 透过 PR 合并至 `main`
4. 合并后立即部署

---

## 策略 C: Trunk-Based Development

**最适合**: 成熟的 CI/CD、高度信任的团队、频繁整合

### 分支结构

```
main  ────●─●─●─●─●─●─●──► (Single trunk)
           ╲│╱ ╲│╱ ╲│╱
feature/*   ●   ●   ●  (Very short-lived, ≤2 days)
```

### 分支类型

| 分支 | 目的 | 基础 | 合并至 | 生命周期 |
|------|------|------|--------|---------|
| `main` | 主干 | - | - | 永久 |
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

# 3. 快速 PR 并合并（当天完成）
git checkout main
git pull origin main
git rebase main feature/add-validation
git checkout main
git merge --ff-only feature/add-validation
git push origin main

# 4. 立即删除
git branch -d feature/add-validation
```

### 关键原则

1. **每天整合多次**
2. 分支生命周期 **≤2 天**
3. 使用 **功能旗标** 处理未完成的功能
4. **一切自动化**

---

## 合并策略比较

### Merge Commit (`--no-ff`)

```bash
git merge --no-ff feature/user-auth
```

**优点**: 完整历史、易于还原功能
**缺点**: 复杂的 git log
**最适合**: GitFlow、长期功能

### Squash Merge

```bash
git merge --squash feature/user-auth
git commit -m "feat(auth): add user authentication"
```

**优点**: 干净历史、每个功能一个 commit
**缺点**: 失去详细历史
**最适合**: GitHub Flow、功能 PR

### Rebase + Fast-Forward

```bash
git rebase main feature/user-auth
git checkout main
git merge --ff-only feature/user-auth
```

**优点**: 线性历史、保留 commit
**缺点**: 重写历史
**最适合**: Trunk-Based、短期分支

---

## 受保护分支建议

### 针对 `main`

- ✅ 需要 pull request 审查（1-2 人）
- ✅ 需要状态检查（CI、测试、lint）
- ✅ 需要分支保持最新
- ❌ 不允许强制推送
- ❌ 不允许删除

### 针对 `develop` (GitFlow)

- ✅ 需要 pull request 审查（1 人）
- ✅ 需要状态检查
- ❌ 不允许强制推送

---

## 相关标准

- [Git Workflow](../../../../../core/git-workflow.md)
- [分支命名参考](./branch-naming.md)
- [Commit 讯息指南](../../../../../core/commit-message-guide.md)

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：标准章节（目的、相关标准、版本历史、授权） |

---

## 授权

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
