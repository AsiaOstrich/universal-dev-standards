---
source: ../../../../options/git-workflow/rebase-ff.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Rebase and Fast-Forward 策略

> **語言**: [English](../../../../options/git-workflow/rebase-ff.md) | 繁體中文

**上層標準**: [Git 工作流程](../../../../core/git-workflow.md)

---

## 概述

Rebase and fast-forward 是一種合併策略，透過將功能分支的 commit 重新播放到目標分支上方，建立完全線性的歷史。結果是乾淨、直線的歷史，所有 commit 看起來像是在單一分支上依序完成的。

## 適用情境

- 偏好線性歷史的團隊
- 大量依賴 `git bisect` 的專案
- 想要乾淨、可讀日誌的開發者
- 有高程式碼品質標準的開源專案

## 運作方式

```
rebase 前：              rebase + fast-forward 後：
main:    A---B---C       A---B---C---D'---E'---F'
              \                         (rebased commits)
feature:       D---E---F
```

Commit D、E、F 被「重新播放」為 D'、E'、F' 在 C 之上。

## 工作流程

### 合併前的互動式 Rebase

```bash
# 在功能分支上開始
git checkout feature/user-profile

# 取得最新變更
git fetch origin

# Rebase 到 main 上
git rebase origin/main

# 如有衝突，解決後繼續
git add <resolved-files>
git rebase --continue

# 或需要時中止
git rebase --abort
```

### Fast-Forward 合併

```bash
# 切換到 main
git checkout main
git pull origin main

# Fast-forward 合併（只在 feature 領先時有效）
git merge --ff-only feature/user-profile

# 推送
git push origin main

# 清理
git branch -d feature/user-profile
```

### Rebase 後的 Force Push

當你 rebase 了已推送的分支：

```bash
# rebase 後
git push --force-with-lease origin feature/user-profile

# --force-with-lease 比 --force 安全
# 如果其他人推送到該分支會失敗
```

## 互動式 Rebase

合併前清理 commit：

```bash
# 互動式 rebase 最近 4 個 commit
git rebase -i HEAD~4

# 或從分支點 rebase
git rebase -i main
```

### 常用清理模式

```
pick abc1234 feat: add user model
fixup def5678 fix typo in user model
fixup ghi9012 another fix

# 結果：單一乾淨的 commit
```

## 優點

| 優點 | 說明 |
|------|------|
| 線性歷史 | 容易閱讀和理解 |
| 乾淨日誌 | `git log` 顯示直線 |
| 有效的 bisect | 清楚的變更進程 |
| 原子 commit | 每個 commit 獨立完整 |
| 無合併 commit | 更乾淨的儲存庫 |

## 缺點

| 缺點 | 說明 |
|------|------|
| 重寫歷史 | Commit SHA 在 rebase 後改變 |
| 需要 force push | rebase 已推送的分支後 |
| 衝突解決 | 可能需要多次解決衝突 |
| 失去合併脈絡 | 無分支合併時間記錄 |
| 共享時危險 | 可能對協作者造成問題 |

## Rebase 的黃金法則

**永遠不要 rebase 已推送到共享分支的 commit。**

```bash
# 安全：rebase 本地 commit
git rebase main  # 如果功能分支未推送

# 注意：rebase 已推送的功能分支
git rebase main
git push --force-with-lease  # 只有在你是唯一工作者時

# 危險：永遠不要這樣做
git checkout main
git rebase feature  # 永遠不要 rebase main/master！
```

## 相關選項

- [Squash Merge](./squash-merge.md) - 單一 commit，更簡單的工作流程
- [Merge Commit](./merge-commit.md) - 保留分支歷史

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
