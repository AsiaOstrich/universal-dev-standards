---
source: ../../../../options/git-workflow/merge-commit.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Merge Commit 合併策略

> **語言**: [English](../../../options/git-workflow/merge-commit.md) | 繁體中文

**上層標準**: [Git 工作流程](../../core/git-workflow.md)

---

## 概述

Merge commit（也稱為「true merge」或「merge with merge commit」）透過建立合併 commit 來保留功能分支的完整歷史。這維護了完整的開發歷史，並顯示分支合併的確切時間點。

## 適用情境

- 重視完整歷史保留的團隊
- 需要審計軌跡的專案
- 長期執行的功能分支
- 個別 commit 有意義訊息時
- 使用 `git bisect` 除錯時

## 運作方式

```
合併前：                合併後：
main:    A---B---C      A---B---C---------M（合併 commit）
              \                   \       /
feature:       D---E---F           D---E---F
```

合併 commit `M` 有兩個父節點：`C`（來自 main）和 `F`（來自 feature）。

## 工作流程

### 標準 Merge Commit

```bash
# 確保 main 是最新的
git checkout main
git pull origin main

# 使用 merge commit 合併功能分支
git merge feature/user-auth --no-ff

# 這會開啟編輯器撰寫合併訊息
# 或指定訊息：
git merge feature/user-auth --no-ff -m "Merge feature/user-auth: Add OAuth support"

# 推送
git push origin main
```

### `--no-ff` 旗標

`--no-ff`（no fast-forward）旗標確保永遠建立合併 commit：

```bash
# 不使用 --no-ff（可能會 fast-forward）
git merge feature-branch
# 結果：可能會或不會建立合併 commit

# 使用 --no-ff（永遠建立合併 commit）
git merge --no-ff feature-branch
# 結果：永遠建立合併 commit
```

## 優點

| 優點 | 說明 |
|------|------|
| 完整歷史 | 所有 commit 保留可見 |
| 清楚的合併點 | 容易看出功能整合時間 |
| 容易歸屬 | 每個 commit 顯示作者 |
| 有效的 bisect | `git bisect` 有完整細節 |
| 還原彈性 | 可還原合併或個別 commit |

## 缺點

| 缺點 | 說明 |
|------|------|
| 非線性歷史 | 分支結構可能複雜 |
| 更多 commit | 主分支累積許多 commit |
| 較難閱讀 | `git log` 顯示交錯 commit |
| 合併衝突 | 衝突在合併 commit 解決 |

## 檢視合併歷史

```bash
# 只列出合併 commit
git log --merges --oneline

# 視覺化分支結構
git log --oneline --graph
```

## 還原合併

```bash
# 還原整個合併
git revert -m 1 <merge-commit-sha>

# -m 1 表示保留第一個父節點（main 分支）
# -m 2 會保留第二個父節點（feature 分支）
```

## 相關選項

- [Squash Merge](./squash-merge.md) - 將所有 commit 合併為一個
- [Rebase and Fast-Forward](./rebase-ff.md) - 無合併 commit 的線性歷史

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
