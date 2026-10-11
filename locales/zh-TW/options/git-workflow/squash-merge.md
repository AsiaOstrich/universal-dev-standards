---
source: ../../../../options/git-workflow/squash-merge.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 9a4b55eed66f
status: current
---

# Squash Merge 合併策略

> **語言**: [English](../../../../options/git-workflow/squash-merge.md) | 繁體中文

**上層標準**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

Squash merge 在合併時將功能分支的所有 commit 壓縮成單一 commit。這在主分支上建立乾淨、線性的歷史，每個合併代表一個完整的功能或變更。

## 適用情境

- 重視主分支歷史整潔的團隊
- 開發過程中有許多小型 commit 的專案
- 程式碼審查流程中最終結果比過程重要
- 接受外部貢獻的開源專案

## 運作方式

```
Feature branch:          Main branch after squash merge:
A---B---C---D            X---Y---Z (single squashed commit)
    \                        |
     E---F---G---H    →      S (contains E+F+G+H)
     (feature commits)
```

## 工作流程

### 建立 Pull Request

```bash
# Create feature branch
git checkout -b feature/user-profile
git checkout main
git pull origin main

# Make multiple commits during development
git commit -m "wip: start user profile"
git commit -m "add avatar upload"
git commit -m "fix styling"
git commit -m "add tests"
git commit -m "fix test failure"

# Push and create PR
git push origin feature/user-profile
```

### 透過 CLI 進行 Squash Merge

```bash
# On main branch
git checkout main
git pull origin main

# Squash merge
git merge --squash feature/user-profile

# Create single commit with meaningful message
git commit -m "feat(users): add user profile with avatar upload

- Add profile page component
- Implement avatar upload functionality
- Add comprehensive test coverage

Closes #123"

# Push and clean up
git push origin main
git branch -d feature/user-profile
git push origin --delete feature/user-profile
```

### 透過 GitHub 進行 Squash Merge

1. 開啟 Pull Request
2. 點擊「Squash and merge」按鈕
3. 編輯 commit 訊息使其有意義
4. 確認合併
5. 刪除功能分支

## Commit 訊息最佳實踐

進行 squash merge 時，撰寫完整的 commit 訊息：

```
feat(scope): concise description

- Key change 1
- Key change 2
- Key change 3

Closes #issue-number
Co-authored-by: Name <email@example.com>
```

### 良好範例

```
feat(auth): implement OAuth2 login flow

- Add Google and GitHub OAuth providers
- Create secure token storage
- Implement automatic token refresh
- Add logout functionality

Closes #456
Reviewed-by: @teammate
```

### 不良範例

```
Squashed commit of the following:
- wip
- more wip
- fix stuff
- actually fix stuff
```

## 優點

| 優點 | 說明 |
|------|------|
| 乾淨的歷史 | 主分支每個功能一個 commit |
| 容易還原 | 單一 commit 還原整個功能 |
| 簡化 bisect | 較少 commit 需要搜尋 |
| 自由提交 | 開發者可頻繁提交而不會讓歷史雜亂 |

## 缺點

| 缺點 | 說明 |
|------|------|
| 失去細節 | 個別 commit 歷史遺失 |
| 難以追蹤 | 無法用 blame 追溯特定行到原始 commit |
| 大型 diff | 單一 commit 可能有大量變更 |
| 失去脈絡 | 開發過程不被保留 |

## 不適用的情況

- 個別 commit 歷史很重要時
- 長期存在且 commit 訊息具有價值的分支
- 之後需要 cherry-pick 特定變更時
- 有多位作者且需要標註貢獻的分支

## 設定

### GitHub 儲存庫設定

```yaml
# In repository settings > Pull Requests
Allow squash merging: ✓
Allow merge commits: ✗ (optional, for enforcement)
Allow rebase merging: ✗ (optional, for enforcement)

# Default commit message
Default to pull request title and description
```

### Git 別名

```bash
# Add to ~/.gitconfig
[alias]
    squash = merge --squash
    sm = "!f() { git merge --squash $1 && git commit; }; f"
```

## 保留共同作者

當有多人參與同一分支的開發時：

```bash
git commit -m "feat: implement feature

Co-authored-by: Alice <alice@example.com>
Co-authored-by: Bob <bob@example.com>"
```

## 相關選項

- [Merge Commit](./merge-commit.md) - 保留所有 commit 歷史
- [Rebase and Fast-Forward](./rebase-ff.md) - 線性歷史保留所有 commit

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
