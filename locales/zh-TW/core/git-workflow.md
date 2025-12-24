---
source: ../../../core/git-workflow.md
source_version: 1.2.1
translation_version: 1.2.1
last_synced: 2025-12-25
status: current
---

# Git 工作流程標準

> **語言**: [English](../../../core/git-workflow.md) | 繁體中文

**版本**: 1.2.1
**最後更新**: 2025-12-24
**適用範圍**: 所有使用 Git 版本控制的專案

---

## 目的

本標準定義 Git 分支策略與工作流程，確保團隊與專案間的一致、可預測的協作模式。

---

## 工作流程策略選擇

**專案必須選擇一種**工作流程策略並明確記錄。

### 決策樹

使用此流程圖來選擇適當的工作流程：

```
                    ┌─────────────────────────────────────┐
                    │ How often do you deploy to         │
                    │ production?                        │
                    │ 您多常部署到正式環境？                │
                    └───────────────┬─────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
   │ Multiple times │    │ Weekly to      │    │ Monthly or     │
   │ per day        │    │ bi-weekly      │    │ longer         │
   │ 每天多次        │    │ 每週或雙週      │    │ 每月或更久      │
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

---

## 策略 A: GitFlow

**最適合**:
定期發布（每月、每季）、同時維護多個正式版本、開發與正式環境明確分離、大型團隊與正式發布流程

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

### 分支類型

| 分支類型 | 目的 | 基礎分支 | 合併目標 | 生命週期 |
|---------|------|---------|----------|---------|
| `main` | 正式環境程式碼 | - | - | 永久 |
| `develop` | 整合分支 | - | - | 永久 |
| `feature/*` | 新功能 | `develop` | `develop` | 暫時 |
| `release/*` | 發布準備 | `develop` | `main` + `develop` | 暫時 |
| `hotfix/*` | 緊急修復 | `main` | `main` + `develop` | 暫時 |

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

> **變更日誌更新**：將 `[Unreleased]` 的條目移至新版本區段並加上發布日期。詳細指南請參閱 [changelog-standards.md](../../../core/changelog-standards.md)。

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

## 策略 B: GitHub Flow

**最適合**:
持續部署、Web 應用程式、中小型團隊、快速迭代週期

### 分支結構

```
main      ────●─────────●──────●── (Always deployable)
               ╲         ╱      ╱
feature/*       ●───●───●      ╱  (Feature + PR)
                              ╱
bugfix/*                 ────●  (Bug fixes)
```

### 分支類型

| 分支類型 | 目的 | 基礎分支 | 合併目標 | 生命週期 |
|---------|------|---------|----------|---------|
| `main` | 正式環境程式碼 | - | - | 永久 |
| `feature/*` | 新功能 | `main` | `main` | 暫時 |
| `bugfix/*` | Bug 修復 | `main` | `main` | 暫時 |
| `hotfix/*` | 緊急修復 | `main` | `main` | 暫時 |

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

## 策略 C: Trunk-Based Development

**最適合**:
成熟的 CI/CD 管道、高信任度且經驗豐富的團隊、頻繁整合（每天多次）、使用功能開關控制未完成功能

### 分支結構

```
main  ────●─●─●─●─●─●─●──► (Single long-lived branch)
           ╲│╱ ╲│╱ ╲│╱
feature/*   ●   ●   ●  (Very short-lived, ≤2 days)
```

### 分支類型

| 分支類型 | 目的 | 基礎分支 | 合併目標 | 生命週期 |
|---------|------|---------|----------|---------|
| `main` | 主幹 | - | - | 永久 |
| `feature/*` | 小型變更 | `main` | `main` | ≤2 天 |

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

## 開新分支前檢查清單

開始新功能開發前，完成以下檢查以避免常見問題。

### 適用於 GitFlow 和 GitHub Flow

#### 1. 確認無未合併分支

```bash
git branch --no-merged main
# For GitFlow, also check:
git branch --no-merged develop
```

- **如有未合併分支，必須先處理**（合併或關閉）
- **禁止在有未合併分支的情況下開新功能分支**

#### 2. 同步最新程式碼

```bash
git checkout main  # or develop for GitFlow
git pull origin main
```

#### 3. 確認測試通過

```bash
# Run your project's test suite
npm test        # Node.js
pytest          # Python
./gradlew test  # Java/Kotlin
```

#### 4. 建立分支

```bash
git checkout -b feature/description
```

### 為什麼重要

| 跳過檢查的後果 | 影響 |
|--------------|------|
| 修復散落各處 | `main` 仍有 bug |
| 功能互相依賴 | 新分支缺少前一個功能的程式碼 |
| 合併順序混亂 | 衝突變多、歷史難追蹤 |
| 測試不完整 | 每個分支只測自己的部分 |

### 適用於 Trunk-Based Development

Trunk-Based Development 因其短命分支特性（≤2 天）有**不同的要求**：

| 檢查項目 | 適用性 | 說明 |
|---------|-------|------|
| 確認無未合併分支 | ⚠️ **較不適用** | 設計上分支不應存在超過 2 天 |
| 同步最新程式碼 | ✅ **關鍵** | 因頻繁整合，更為重要 |
| 確認測試通過 | ✅ **關鍵** | 自動化是此工作流程的核心 |

**關鍵差異**：若在 Trunk-Based Development 中有超過 2 天的未合併分支，這本身就違反了工作流程原則。重點應放在**頻繁整合**而非檢查未合併分支。

---

## 分支命名慣例

### 標準格式

```
<type>/<short-description>
```

### 類型

| 類型 | 用途 | 範例 |
|------|------|------|
| `feature/` | 新功能 | `feature/oauth-login` |
| `fix/` 或 `bugfix/` | Bug 修復 | `fix/memory-leak` |
| `hotfix/` | 緊急正式環境修復 | `hotfix/security-patch` |
| `refactor/` | 程式碼重構 | `refactor/extract-service` |
| `docs/` | 僅文件更新 | `docs/api-reference` |
| `test/` | 測試新增 | `test/integration-tests` |
| `chore/` | 維護任務 | `chore/update-dependencies` |
| `release/` | 發布準備 (僅 GitFlow) | `release/v1.2.0` |

### 命名規則

1. **使用小寫**
2. **使用連字號分隔單詞**
3. **具描述性但簡潔**
4. **避免僅用 issue 編號**

**良好範例**:
```
feature/user-authentication
fix/null-pointer-in-payment
hotfix/critical-data-loss
refactor/database-connection-pool
docs/update-installation-guide
```

**不良範例**:
```
feature/123                    # ❌ 沒有描述性
Fix-Bug                        # ❌ 非小寫，過於籠統
feature/add_new_feature        # ❌ 使用底線，過於籠統
myFeature                      # ❌ 駝峰式命名，無類型前綴
```

---

## 合併策略

**專案必須為每種分支類型選擇一種**。

### 選項 1: 合併提交 (--no-ff)

**保留分支歷史**

```bash
git merge --no-ff feature/user-auth
```

**優點**:
- ✅ 完整保留歷史
- ✅ 易於還原整個功能
- ✅ 清楚的功能邊界

**缺點**:
- ❌ Git 日誌雜亂
- ❌ 複雜的圖形視覺化

**最適合**: GitFlow、長期功能分支

---

### 選項 2: 壓縮合併

**將所有提交合併為一個**

```bash
git merge --squash feature/user-auth
git commit -m "feat(auth): add user authentication"
```

**優點**:
- ✅ 乾淨、線性的歷史
- ✅ 每個功能一個提交
- ✅ 易於閱讀的 git 日誌

**缺點**:
- ❌ 失去詳細歷史
- ❌ 無法精選個別提交

**最適合**: GitHub Flow、功能分支

---

### 選項 3: 變基與快轉

**在目標分支上重播提交**

```bash
git rebase main feature/user-auth
git checkout main
git merge --ff-only feature/user-auth
```

**優點**:
- ✅ 線性、乾淨的歷史
- ✅ 保留個別提交
- ✅ 無合併提交

**缺點**:
- ❌ 改寫歷史（不要用於共享分支）
- ❌ 解決衝突可能繁瑣

**最適合**: Trunk-Based Development、短期分支

---

## 衝突解決

### 預防

1. **頻繁同步**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/my-feature
   git merge main  # or git rebase main
   ```

2. **保持分支小型化**
   - 避免長期功能分支
   - 將大型功能拆分為小型 PR

3. **溝通**
   - 宣告重大重構
   - 協調共享檔案的修改

### 解決步驟

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

## 標籤與發布

### 語義化版本

遵循 [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH

例如: v2.3.1
```

- **MAJOR**: 重大變更（不相容的 API 變更）
- **MINOR**: 新功能（向後相容）
- **PATCH**: Bug 修復（向後相容）

### 建立標籤

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

### 預發布版本

```
v1.2.0-alpha.1      # Alpha release
v1.2.0-beta.2       # Beta release
v1.2.0-rc.1         # Release candidate
```

---

## 保護分支

設定分支保護規則：

### 建議的 `main`/`develop` 保護:

- ✅ **需要 pull request 審查** (1-2 位審查者)
- ✅ **需要狀態檢查通過** (CI 測試、linting)
- ✅ **需要分支保持最新** 才能合併
- ✅ **管理員也受限制**
- ❌ **不允許強制推送**
- ❌ **不允許刪除**

**設定範例 (GitHub)**:
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

## Pull Request 工作流程

### PR 建立檢查清單

- [ ] **標題遵循提交慣例** (例如 `feat(auth): add OAuth2`)
- [ ] **描述說明原因** (不只是做了什麼)
- [ ] **連結到 issue** (例如 "Closes #123")
- [ ] **新功能包含測試**
- [ ] **必要時更新文件**
- [ ] **在描述中標示重大變更**
- [ ] **UI 變更包含截圖/GIF**

### PR 描述範本

```markdown
## What

[簡短描述此 PR 做了什麼]

## Why

[說明為什麼需要此變更]

## Changes

- [主要變更的條列清單]
- [用 ⚠️ 標記重大變更]

## Testing

- [ ] 已新增/更新單元測試
- [ ] 整合測試通過
- [ ] 已執行手動測試

## Screenshots (if applicable)

[為 UI 變更新增截圖]

## Related Issues

Closes #123
Refs #456
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

## 疑難排解

### 不小心提交到錯誤的分支

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

### 不小心強制推送到保護分支

```bash
# ⚠️ Contact team immediately
# ⚠️ Check if branch protection was enabled
# ⚠️ Restore from reflog if needed:
git reflog
git reset --hard <previous-commit-hash>
```

---

## 相關標準

- [Commit Message Guide](../../../core/commit-message-guide.md) - Commit 訊息規範
- [Code Check-in Standards](../../../core/checkin-standards.md) - 程式碼簽入標準
- [Versioning Standard](../../../core/versioning.md) - 語義化版本標準
- [Changelog Standards](../../../core/changelog-standards.md) - 變更日誌標準

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.2.1 | 2025-12-24 | 新增：相關標準區段 |
| 1.2.0 | 2025-12-16 | 新增：工作流程策略決策樹、選擇矩陣和快速選擇指南 |
| 1.1.0 | 2025-12-08 | 新增：開分支前檢查清單區段，含工作流程特定指引 |
| 1.0.0 | 2025-11-12 | 初始 Git 工作流程標準 |

---

## 參考資料

- [GitFlow Original Article](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Trunk-Based Development](https://trunkbaseddevelopment.com/)
- [Semantic Versioning](https://semver.org/)

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
