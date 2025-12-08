# Git Workflow Standards
# Git 工作流程標準

**Version**: 1.1.0
**Last Updated**: 2025-12-08
**Applicability**: All projects using Git for version control
**適用範圍**: 所有使用 Git 版本控制的專案

---

## Purpose | 目的

This standard defines Git branching strategies and workflows to ensure consistent, predictable collaboration patterns across teams and projects.

本標準定義 Git 分支策略與工作流程，確保團隊與專案間的一致、可預測的協作模式。

---

## Workflow Strategy Selection | 工作流程策略選擇

**PROJECT MUST CHOOSE ONE** workflow strategy and document it clearly.

**專案必須選擇一種**工作流程策略並明確記錄。

---

## Strategy A: GitFlow

**Best For | 最適合**:
- Scheduled releases (monthly, quarterly)
- Multiple production versions maintained simultaneously
- Clear distinction between development and production
- Large teams with formal release processes

**定期發布（每月、每季）、同時維護多個正式版本、開發與正式環境明確分離、大型團隊與正式發布流程**

### Branch Structure | 分支結構

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

### Branch Types | 分支類型

| Branch Type | Purpose | Base Branch | Merge Target | Lifetime |
|-------------|---------|-------------|--------------|----------|
| `main` | Production code | - | - | Permanent |
| `develop` | Integration branch | - | - | Permanent |
| `feature/*` | New features | `develop` | `develop` | Temporary |
| `release/*` | Release prep | `develop` | `main` + `develop` | Temporary |
| `hotfix/*` | Urgent fixes | `main` | `main` + `develop` | Temporary |

### Workflow Steps | 工作流程步驟

#### 1. Feature Development | 功能開發

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

#### 2. Release Preparation | 發布準備

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Prepare release (version bump, changelog, etc.)
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

#### 3. Hotfix | 緊急修復

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

## Strategy B: GitHub Flow

**Best For | 最適合**:
- Continuous deployment
- Web applications
- Small to medium teams
- Fast iteration cycles

**持續部署、Web 應用程式、中小型團隊、快速迭代週期**

### Branch Structure | 分支結構

```
main      ────●─────────●──────●── (Always deployable)
               ╲         ╱      ╱
feature/*       ●───●───●      ╱  (Feature + PR)
                              ╱
bugfix/*                 ────●  (Bug fixes)
```

### Branch Types | 分支類型

| Branch Type | Purpose | Base Branch | Merge Target | Lifetime |
|-------------|---------|-------------|--------------|----------|
| `main` | Production code | - | - | Permanent |
| `feature/*` | New features | `main` | `main` | Temporary |
| `bugfix/*` | Bug fixes | `main` | `main` | Temporary |
| `hotfix/*` | Urgent fixes | `main` | `main` | Temporary |

### Workflow Steps | 工作流程步驟

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

### Key Principles | 關鍵原則

1. **`main` is always deployable** | `main` 永遠可部署
2. **Branch from `main`** | 從 `main` 分支
3. **Merge to `main` via PR** | 透過 PR 合併到 `main`
4. **Deploy immediately after merge** | 合併後立即部署

---

## Strategy C: Trunk-Based Development

**Best For | 最適合**:
- Mature CI/CD pipelines
- High-trust, experienced teams
- Frequent integration (multiple times per day)
- Feature flags for incomplete features

**成熟的 CI/CD 管道、高信任度且經驗豐富的團隊、頻繁整合（每天多次）、使用功能開關控制未完成功能**

### Branch Structure | 分支結構

```
main  ────●─●─●─●─●─●─●──► (Single long-lived branch)
           ╲│╱ ╲│╱ ╲│╱
feature/*   ●   ●   ●  (Very short-lived, ≤2 days)
```

### Branch Types | 分支類型

| Branch Type | Purpose | Base Branch | Merge Target | Lifetime |
|-------------|---------|-------------|--------------|----------|
| `main` | Trunk | - | - | Permanent |
| `feature/*` | Small changes | `main` | `main` | ≤2 days |

### Workflow Steps | 工作流程步驟

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

### Key Principles | 關鍵原則

1. **Integrate frequently** (multiple times per day) | 頻繁整合（每天多次）
2. **Keep branches short-lived** (≤2 days) | 保持分支短命（≤2 天）
3. **Use feature flags** for incomplete features | 使用功能開關控制未完成功能
4. **Automate everything** (tests, builds, deployments) | 自動化一切（測試、建置、部署）

---

## Pre-branch Checklist | 開新分支前檢查清單

Before creating a new branch, complete these checks to prevent common issues.

開始新功能開發前，完成以下檢查以避免常見問題。

### For GitFlow and GitHub Flow | 適用於 GitFlow 和 GitHub Flow

#### 1. Check for Unmerged Branches | 確認無未合併分支

```bash
git branch --no-merged main
# For GitFlow, also check:
git branch --no-merged develop
```

- **If unmerged branches exist, handle them first** (merge or close)
- **Do NOT create new feature branches with unmerged work pending**

**如有未合併分支，必須先處理**（合併或關閉），**禁止在有未合併分支的情況下開新功能分支**

#### 2. Sync Latest Code | 同步最新程式碼

```bash
git checkout main  # or develop for GitFlow
git pull origin main
```

#### 3. Verify Tests Pass | 確認測試通過

```bash
# Run your project's test suite
npm test        # Node.js
pytest          # Python
./gradlew test  # Java/Kotlin
```

#### 4. Create Branch | 建立分支

```bash
git checkout -b feature/description
```

### Why This Matters | 為什麼重要

| Consequence of Skipping | Impact |
|------------------------|--------|
| Fixes scattered across branches | `main` still has bugs |
| Features depend on each other | New branch missing previous feature's code |
| Merge order confusion | More conflicts, harder to track history |
| Incomplete testing | Each branch only tests its own part |

| 跳過檢查的後果 | 影響 |
|--------------|------|
| 修復散落各處 | `main` 仍有 bug |
| 功能互相依賴 | 新分支缺少前一個功能的程式碼 |
| 合併順序混亂 | 衝突變多、歷史難追蹤 |
| 測試不完整 | 每個分支只測自己的部分 |

### For Trunk-Based Development | 適用於 Trunk-Based Development

Trunk-Based Development has **different requirements** due to its short-lived branch nature (≤2 days):

Trunk-Based Development 因其短命分支特性（≤2 天）有**不同的要求**：

| Check | Applicability | Notes |
|-------|--------------|-------|
| Check unmerged branches | ⚠️ **Less relevant** | Branches should not exist >2 days by design |
| Sync latest code | ✅ **Critical** | Even more important due to frequent integration |
| Verify tests pass | ✅ **Critical** | Automation is core to this workflow |

| 檢查項目 | 適用性 | 說明 |
|---------|-------|------|
| 確認無未合併分支 | ⚠️ **較不適用** | 設計上分支不應存在超過 2 天 |
| 同步最新程式碼 | ✅ **關鍵** | 因頻繁整合，更為重要 |
| 確認測試通過 | ✅ **關鍵** | 自動化是此工作流程的核心 |

**Key difference**: If you have unmerged branches older than 2 days in Trunk-Based Development, this itself violates the workflow principles. Focus on **frequent integration** rather than checking for unmerged branches.

**關鍵差異**：若在 Trunk-Based Development 中有超過 2 天的未合併分支，這本身就違反了工作流程原則。重點應放在**頻繁整合**而非檢查未合併分支。

---

## Branch Naming Conventions | 分支命名慣例

### Standard Format | 標準格式

```
<type>/<short-description>
```

### Types | 類型

| Type | Usage | Example |
|------|-------|---------|
| `feature/` | New functionality | `feature/oauth-login` |
| `fix/` or `bugfix/` | Bug fixes | `fix/memory-leak` |
| `hotfix/` | Urgent production fixes | `hotfix/security-patch` |
| `refactor/` | Code refactoring | `refactor/extract-service` |
| `docs/` | Documentation only | `docs/api-reference` |
| `test/` | Test additions | `test/integration-tests` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `release/` | Release preparation (GitFlow only) | `release/v1.2.0` |

### Naming Rules | 命名規則

1. **Use lowercase** | 使用小寫
2. **Use hyphens for spaces** | 使用連字號分隔單詞
3. **Be descriptive but concise** | 具描述性但簡潔
4. **Avoid issue numbers as only identifier** | 避免僅用 issue 編號

**Good Examples | 良好範例**:
```
feature/user-authentication
fix/null-pointer-in-payment
hotfix/critical-data-loss
refactor/database-connection-pool
docs/update-installation-guide
```

**Bad Examples | 不良範例**:
```
feature/123                    # ❌ Not descriptive
Fix-Bug                        # ❌ Not lowercase, vague
feature/add_new_feature        # ❌ Underscores, too vague
myFeature                      # ❌ camelCase, no type prefix
```

---

## Merge Strategies | 合併策略

**PROJECT MUST CHOOSE ONE** for each branch type.

**專案必須為每種分支類型選擇一種**。

### Option 1: Merge Commit (--no-ff)

**Preserves branch history** | 保留分支歷史

```bash
git merge --no-ff feature/user-auth
```

**Pros | 優點**:
- ✅ Complete history preserved
- ✅ Easy to revert entire feature
- ✅ Clear feature boundaries

**Cons | 缺點**:
- ❌ Cluttered git log
- ❌ Complex graph visualization

**Best For**: GitFlow, long-lived features

---

### Option 2: Squash Merge

**Combines all commits into one** | 將所有提交合併為一個

```bash
git merge --squash feature/user-auth
git commit -m "feat(auth): add user authentication"
```

**Pros | 優點**:
- ✅ Clean, linear history
- ✅ One commit per feature
- ✅ Easy to read git log

**Cons | 缺點**:
- ❌ Loses detailed history
- ❌ Can't cherry-pick individual commits

**Best For**: GitHub Flow, feature branches

---

### Option 3: Rebase and Fast-Forward

**Replays commits on top of target** | 在目標分支上重播提交

```bash
git rebase main feature/user-auth
git checkout main
git merge --ff-only feature/user-auth
```

**Pros | 優點**:
- ✅ Linear, clean history
- ✅ Preserves individual commits
- ✅ No merge commits

**Cons | 缺點**:
- ❌ Rewrites history (don't use on shared branches)
- ❌ Resolving conflicts can be tedious

**Best For**: Trunk-Based Development, short-lived branches

---

## Conflict Resolution | 衝突解決

### Prevention | 預防

1. **Sync frequently** | 頻繁同步
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/my-feature
   git merge main  # or git rebase main
   ```

2. **Keep branches small** | 保持分支小型化
   - Avoid long-lived feature branches
   - Break large features into smaller PRs

3. **Communicate** | 溝通
   - Announce major refactoring
   - Coordinate on shared files

### Resolution Steps | 解決步驟

```bash
# 1. Attempt merge
git checkout main
git pull origin main
git checkout feature/my-feature
git merge main

# 2. Conflicts occur - Git marks them in files
# Open files and resolve conflicts:
# <<<<<<< HEAD
# Current branch changes
# =======
# Incoming changes
# >>>>>>> main

# 3. After resolving, stage files
git add resolved-file.js

# 4. Complete the merge
git commit -m "chore: resolve merge conflicts with main"

# 5. Test thoroughly
npm test

# 6. Push
git push origin feature/my-feature
```

---

## Tagging and Releases | 標籤與發布

### Semantic Versioning | 語義化版本

Follow [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH

例如: v2.3.1
```

- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backward-compatible)
- **PATCH**: Bug fixes (backward-compatible)

### Creating Tags | 建立標籤

```bash
# Annotated tag (recommended)
git tag -a v1.2.0 -m "Release version 1.2.0: Add OAuth2 support"

# Push tag to remote
git push origin v1.2.0

# Push all tags
git push origin --tags

# List tags
git tag -l
```

### Pre-release Versions | 預發布版本

```
v1.2.0-alpha.1      # Alpha release
v1.2.0-beta.2       # Beta release
v1.2.0-rc.1         # Release candidate
```

---

## Protected Branches | 保護分支

Configure branch protection rules:

### Recommended Protection for `main`/`develop`:

- ✅ **Require pull request reviews** (1-2 reviewers)
- ✅ **Require status checks to pass** (CI tests, linting)
- ✅ **Require branches to be up to date** before merging
- ✅ **Include administrators** in restrictions
- ❌ **Do not allow force pushes**
- ❌ **Do not allow deletions**

**Configuration Example (GitHub)**:
```
Settings → Branches → Branch protection rules

Rule: main
☑ Require pull request before merging
  ☑ Require approvals: 1
☑ Require status checks before merging
  ☑ Require branches to be up to date
  ☑ Status checks: CI/Build, Lint, Tests
☑ Do not allow bypassing the above settings
☐ Allow force pushes
☐ Allow deletions
```

---

## Pull Request Workflow | Pull Request 工作流程

### PR Creation Checklist | PR 建立檢查清單

- [ ] **Title follows commit convention** (e.g., `feat(auth): add OAuth2`)
- [ ] **Description explains why** (not just what)
- [ ] **Linked to issue** (e.g., "Closes #123")
- [ ] **Tests included** for new functionality
- [ ] **Documentation updated** if needed
- [ ] **Breaking changes highlighted** in description
- [ ] **Screenshots/GIFs** for UI changes

### PR Description Template | PR 描述範本

```markdown
## What

[Brief description of what this PR does]

## Why

[Explanation of why this change is needed]

## Changes

- [Bullet list of main changes]
- [Mark breaking changes with ⚠️]

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing performed

## Screenshots (if applicable)

[Add screenshots for UI changes]

## Related Issues

Closes #123
Refs #456
```

---

## Git Commands Reference | Git 指令參考

### Daily Operations | 日常操作

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

### Branch Operations | 分支操作

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

### Advanced Operations | 進階操作

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

## Project Configuration Template | 專案設定範本

Document your workflow in `CONTRIBUTING.md`:

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

## Troubleshooting | 疑難排解

### Accidentally Committed to Wrong Branch

```bash
# Undo last commit but keep changes
git reset --soft HEAD~1

# Switch to correct branch
git checkout correct-branch

# Commit changes
git add .
git commit -m "feat: add feature"
```

### Need to Update Branch from Main

```bash
# Option 1: Merge (preserves history)
git checkout feature/my-feature
git merge main

# Option 2: Rebase (cleaner history)
git checkout feature/my-feature
git rebase main
```

### Accidentally Force Pushed to Protected Branch

```bash
# ⚠️ Contact team immediately
# ⚠️ Check if branch protection was enabled
# ⚠️ Restore from reflog if needed:
git reflog
git reset --hard <previous-commit-hash>
```

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2025-12-08 | Add pre-branch checklist section with workflow-specific guidance |
| 1.0.0 | 2025-11-12 | Initial Git workflow standard |

---

## References | 參考資料

- [GitFlow Original Article](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Trunk-Based Development](https://trunkbaseddevelopment.com/)
- [Semantic Versioning](https://semver.org/)

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
