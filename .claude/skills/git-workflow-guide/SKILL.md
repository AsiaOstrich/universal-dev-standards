---
source: ../../../../skills/git-workflow-guide/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-10-12
source_hash: a1438a0fe0f2
status: current
name: git-workflow-guide
scope: universal
description: |
  引導 Git 分支策略、分支命名與合併操作。
  Use when: 建立分支、合併、pull request、Git 工作流程相關問題。
  Not for: 撰寫 commit message——請用 /commit；推送前的安全檢查——請用 /push。
  Keywords: branch, merge, PR, pull request, GitFlow, GitHub Flow, 分支, 合併, 工作流程, 分支命名.
---

# Git 工作流程指南

> **語言**: [English](../../../../skills/git-workflow-guide/SKILL.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

> **核心規範**：本技能實作 [Git 工作流程](../../core/git-workflow.md)。完整的方法論文件請參閱核心規範。

## 目的

本技能提供 Git 分支策略、分支命名慣例與合併操作的指導。

## 快速參考

### 工作流程策略選擇

| 部署頻率 | 建議策略 |
|---------|---------|
| 每日多次 | Trunk-Based Development |
| 每週至雙週 | GitHub Flow |
| 每月或更長 | GitFlow |

### 分支命名慣例

```
<type>/<short-description>
```

| 類型 | 用途 | 範例 |
|------|------|------|
| `feature/` | 新功能 | `feature/oauth-login` |
| `fix/` 或 `bugfix/` | 錯誤修復 | `fix/memory-leak` |
| `hotfix/` | 緊急生產環境修復 | `hotfix/security-patch` |
| `refactor/` | 程式碼重構 | `refactor/extract-service` |
| `docs/` | 僅文件變更 | `docs/api-reference` |
| `test/` | 測試新增 | `test/integration-tests` |
| `chore/` | 維護任務 | `chore/update-dependencies` |
| `release/` | 發布準備 | `release/v1.2.0` |

### 命名規則

1. **使用小寫**
2. **使用連字號分隔單字**
3. **描述性但簡潔**

## 詳細指南

完整標準請參閱：
- [Git 工作流程策略](./git-workflow.md)
- [分支命名參考](./branch-naming.md)

### AI 優化格式（節省 Token）

AI 助手可使用 YAML 格式檔案以減少 Token 使用量：
- 基礎標準：`ai/standards/git-workflow.ai.yaml`
- 工作流程選項：
  - GitHub Flow：`ai/options/git-workflow/github-flow.ai.yaml`
  - GitFlow：`ai/options/git-workflow/gitflow.ai.yaml`
  - Trunk-Based：`ai/options/git-workflow/trunk-based.ai.yaml`
- 合併策略選項：
  - Squash Merge：`ai/options/git-workflow/squash-merge.ai.yaml`
  - Merge Commit：`ai/options/git-workflow/merge-commit.ai.yaml`
  - Rebase + FF：`ai/options/git-workflow/rebase-ff.ai.yaml`

## 建立分支前檢查清單

建立新分支前：

1. **檢查未合併的分支**
   ```bash
   git branch --no-merged main
   ```

2. **同步最新程式碼**
   ```bash
   git checkout main
   git pull origin main
   ```

3. **驗證測試通過**
   ```bash
   npm test  # 或您專案的測試指令
   ```

4. **使用正確命名建立分支**
   ```bash
   git checkout -b feature/description
   ```

## 合併策略快速指南

| 策略 | 使用時機 |
|------|---------|
| **Merge Commit** (`--no-ff`) | 長期功能、GitFlow 發布 |
| **Squash Merge** | 功能分支、乾淨歷史 |
| **Rebase + FF** | Trunk-Based、短期分支 |

## 範例

### 建立功能分支

```bash
# 良好範例
git checkout -b feature/user-authentication
git checkout -b fix/null-pointer-in-payment
git checkout -b hotfix/critical-data-loss

# 不良範例
git checkout -b 123              # 缺乏描述性
git checkout -b Fix-Bug          # 非小寫
git checkout -b myFeature        # 缺少類型前綴
```

### 合併工作流程 (GitHub Flow)

```bash
# 1. 從 main 建立分支
git checkout main
git pull origin main
git checkout -b feature/user-profile

# 2. 進行變更並提交
git add .
git commit -m "feat(profile): add avatar upload"
git push -u origin feature/user-profile

# 3. 透過 GitHub/GitLab UI 建立 PR 並合併

# 4. 合併後刪除分支
git checkout main
git pull origin main
git branch -d feature/user-profile
```

### 處理合併衝突

```bash
# 1. 使用 main 更新您的分支
git checkout feature/my-feature
git fetch origin
git merge origin/main

# 2. 在檔案中解決衝突
# <<<<<<< HEAD
# 您的變更
# =======
# 傳入的變更
# >>>>>>> origin/main

# 3. 暫存已解決的檔案
git add resolved-file.js

# 4. 完成合併
git commit -m "chore: resolve merge conflicts with main"

# 5. 測試並推送
npm test
git push origin feature/my-feature
```

---

## 組態偵測

本技能支援專案特定的工作流程組態。

### 偵測順序

1. 檢查 `CONTRIBUTING.md` 是否有「Git Workflow」或「Branching Strategy」章節
2. 若找到，使用指定的策略（GitFlow / GitHub Flow / Trunk-Based）
3. 若未找到，**預設使用 GitHub Flow** 以保持簡單

### 首次設定

若未找到組態：

1. 詢問使用者：「本專案尚未設定 Git 工作流程策略。您偏好哪一種？（GitFlow / GitHub Flow / Trunk-Based）」
2. 選擇後，建議在 `CONTRIBUTING.md` 中記錄：

```markdown
## Git 工作流程

### 分支策略
本專案使用 **[所選選項]**。

### 分支命名
格式：`<type>/<description>`
範例：`feature/oauth-login`、`fix/memory-leak`

### 合併策略
- 功能分支：**[Squash / Merge commit / Rebase]**
```

---

## 下一步引導

`/git-flow` 完成後，AI 助手應建議：

> **Git 工作流程已設定。建議下一步：**
> - 執行 `git checkout -b feature/<描述>` 建立功能分支開始開發 ⭐ **推薦** — 立即套用所選的分支策略
> - 執行 `/commit` 學習提交訊息規範 — 確保提交訊息格式一致
> - 執行 `/checkin` 了解簽入品質門檻 — 在提交前確保程式碼品質

---

## 相關標準

- [Git 工作流程](../../core/git-workflow.md) - 核心 Git 工作流程標準
- [提交訊息指南](../../core/commit-message-guide.md) - 提交訊息慣例
- [簽入標準](../../core/checkin-standards.md) - 提交前品質關卡

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 新增：標準章節（目的、相關標準、版本歷史、授權） |

---

## 授權

本技能採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)

