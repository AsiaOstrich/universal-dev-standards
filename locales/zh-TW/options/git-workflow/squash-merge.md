# Squash Merge 合併策略

> **語言**: [English](../../../../options/git-workflow/squash-merge.md) | 繁體中文

**上層標準**: [Git 工作流程](../../core/git-workflow.md)

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
功能分支：              合併後的 main 分支：
A---B---C---D            X---Y---Z（單一壓縮 commit）
    \                        |
     E---F---G---H    →      S（包含 E+F+G+H）
    （功能 commits）
```

## 工作流程

### 透過 CLI 進行 Squash Merge

```bash
# 切到 main 分支
git checkout main
git pull origin main

# Squash merge
git merge --squash feature/user-profile

# 建立有意義的單一 commit
git commit -m "feat(users): add user profile with avatar upload

- Add profile page component
- Implement avatar upload functionality
- Add comprehensive test coverage

Closes #123"

# 推送並清理
git push origin main
git branch -d feature/user-profile
git push origin --delete feature/user-profile
```

### 透過 GitHub 進行

1. 開啟 Pull Request
2. 點擊「Squash and merge」按鈕
3. 編輯 commit 訊息使其有意義
4. 確認合併
5. 刪除功能分支

## Commit 訊息最佳實踐

進行 squash merge 時，撰寫完整的 commit 訊息：

```
feat(scope): 簡潔描述

- 主要變更 1
- 主要變更 2
- 主要變更 3

Closes #issue-number
Co-authored-by: Name <email@example.com>
```

## 優點

| 優點 | 說明 |
|------|------|
| 乾淨的歷史 | 主分支每個功能一個 commit |
| 容易還原 | 單一 commit 還原整個功能 |
| 簡化 bisect | 較少 commit 需要搜尋 |
| 自由提交 | 開發者可頻繁提交不會雜亂 |

## 缺點

| 缺點 | 說明 |
|------|------|
| 失去細節 | 個別 commit 歷史遺失 |
| 難以追蹤 | 無法追溯特定行到原始 commit |
| 大型 diff | 單一 commit 可能有大量變更 |
| 失去脈絡 | 開發過程不被保留 |

## 相關選項

- [Merge Commit](./merge-commit.md) - 保留所有 commit 歷史
- [Rebase and Fast-Forward](./rebase-ff.md) - 線性歷史保留所有 commit

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
