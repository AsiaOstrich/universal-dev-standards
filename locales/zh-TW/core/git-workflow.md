# Git 工作流程標準

> **語言**: English | [繁體中文](locales/zh-TW/core/git-workflow.md)

**版本**: 1.3.0
**最後更新**: 2026-01-29
**適用性**: 所有軟體專案
**範圍**: 通用 (Universal)

---

## 目的

本標準定義 Git 分支策略、合併規則和 PR 工作流程的強制性規則。關於詳細的教學、決策樹和不同工作流程的比較（如 GitFlow vs Trunk-Based），請參閱 **[Git 工作流程指南](guides/git-workflow-guide.md)**。

---

## 分支命名慣例

| 分支類型 | 前綴 | 範例 | 目的 |
|----------|------|------|------|
| **Feature** | `feature/` | `feature/user-login` | 新功能開發 |
| **Fix** | `fix/` | `fix/login-error` | Bug 修復 |
| **Documentation** | `docs/` | `docs/api-update` | 文件變更 |
| **Chore** | `chore/` | `chore/dep-update` | 維護任務 |
| **Refactor** | `refactor/` | `refactor/auth-module` | 程式碼重構 |
| **Test** | `test/` | `test/e2e-suite` | 新增或修復測試 |

**規則**:
1. 使用小寫和 kebab-case
2. 包含票號 (如果適用): `feature/JIRA-123-user-login`
3. 嚴禁使用通用名稱如 `dev`, `wip`, `temp`

---

## 合併策略 (Merge Strategy)

| 策略 | 命令 | 使用時機 | 結果 |
|------|------|----------|------|
| **Squash Merge** | `git merge --squash` | Feature/Fix 分支合併回主幹 | 保持主幹歷史乾淨，單一提交代表一個功能 |
| **Rebase Merge** | `git rebase` + `merge` | 本地同步上游變更 | 線性歷史，無額外合併提交 |
| **Merge Commit** | `git merge --no-ff` | 發布分支 (Release) | 保留發布歷史節點 |

**預設規則**: 對於 PR/MR，預設使用 **Squash Merge**，除非專案另有規定。

---

## Commit 訊息規範

遵循 [Commit 訊息指南](commit-message-guide.md)。

格式: `<type>(<scope>): <subject>`

範例: `feat(auth): implement jwt validation`

---

## 核心工作流程規則

1. **永遠不要直接提交到 `main` 或 `master`** (除非是單人專案且有把握)。
2. **提交前執行測試**: `npm test` 或對應指令。
3. **保持分支生命週期短**: Feature 分支不應存活超過 2-3 天。
4. **同步更新**: 在合併前，先 rebase 或 merge `main` 的最新變更。

---

## 相關標準

- [Git 工作流程指南](guides/git-workflow-guide.md) - 詳細教學與比較
- [Commit 訊息指南](commit-message-guide.md)
- [程式碼簽入標準](checkin-standards.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.3.0 | 2026-01-29 | **重大重構**：拆分為規則（本文件）和指南（git-workflow-guide.md）。 |
| 1.2.0 | 2025-12-20 | 更新合併策略說明 |

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
