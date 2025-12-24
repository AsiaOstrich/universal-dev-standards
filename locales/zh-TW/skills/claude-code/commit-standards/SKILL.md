---
source: skills/claude-code/commit-standards/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
name: commit-standards
description: |
  遵循約定式提交標準格式化提交訊息。
  使用時機：撰寫提交訊息、git commit、檢視提交歷史。
  關鍵字：commit、git、message、conventional、feat、fix、refactor。
---

# 提交訊息標準

> **語言**: [English](../../../../../skills/claude-code/commit-standards/SKILL.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

此技能確保遵循約定式提交標準，撰寫一致且有意義的提交訊息。

## 快速參考

### 基本格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 提交類型

| English | 使用時機 |
|---------|----------|
| `feat` | 新功能 |
| `fix` | 錯誤修正 |
| `refactor` | 程式碼重構（無功能變更） |
| `docs` | 僅文件變更 |
| `style` | 格式調整（無程式碼邏輯變更） |
| `test` | 新增或更新測試 |
| `perf` | 效能改善 |
| `build` | 建置系統或依賴項目 |
| `ci` | CI/CD 流程變更 |
| `chore` | 維護任務 |
| `revert` | 還原先前的提交 |
| `security` | 安全漏洞修正 |

### 主旨行規則

1. **長度**: ≤72 字元（50 為理想）
2. **時態**: 祈使語氣（使用 "Add feature" 而非 "Added feature"）
3. **大小寫**: 首字母大寫
4. **無句點**: 結尾不加句點

## 詳細指南

完整標準請參考：
- [約定式提交指南](./conventional-commits.md)
- [語言選項](./language-options.md)

## 範例

### ✅ 良好範例

```
feat(auth): Add OAuth2 Google login support
fix(api): Resolve memory leak in user session cache
refactor(database): Extract query builder to separate class
docs(readme): Update installation instructions for Node 20
```

### ❌ 不良範例

```
fixed bug                    # 太模糊，無範圍
feat(auth): added google login  # 過去式
Update stuff.                # 有句點，模糊
WIP                          # 不具描述性
```

## 主體內容指南

使用主體內容說明變更的**原因（WHY）**：

```
fix(api): Resolve race condition in concurrent user updates

Why this occurred:
- Two simultaneous PUT requests could overwrite each other
- No optimistic locking implemented

What this fix does:
- Add version field to User model
- Return 409 Conflict if version mismatch

Fixes #789
```

## 破壞性變更

務必在頁腳記錄破壞性變更：

```
feat(api): Change user endpoint response format

BREAKING CHANGE: User API response format changed

Migration guide:
1. Update API clients to remove .data wrapper
2. Use created_at instead of createdAt
```

## 議題參照

```
Closes #123    # 自動關閉議題
Fixes #456     # 自動關閉議題
Refs #789      # 連結但不關閉
```

---

## 配置檢測

此技能支援專案特定的語言配置。

### 檢測順序

1. 檢查 `CONTRIBUTING.md` 中的「Commit Message Language」區段
2. 若找到，使用指定的選項（English / Traditional Chinese / Bilingual）
3. 若未找到，**預設使用 English** 以獲得最大工具相容性

### 首次設定

若未找到配置且情境不明確：

1. 詢問使用者：「此專案尚未配置提交訊息語言偏好。您想使用哪個選項？（English / 中文 / Bilingual）」
2. 使用者選擇後，建議記錄於 `CONTRIBUTING.md`：

```markdown
## Commit Message Language

This project uses **[chosen option]** commit types.
<!-- Options: English | Traditional Chinese | Bilingual -->
```

### 配置範例

在專案的 `CONTRIBUTING.md` 中：

```markdown
## Commit Message Language

This project uses **English** commit types.

### Allowed Types
feat, fix, refactor, docs, style, test, perf, build, ci, chore, revert, security
```

---

## 相關標準

- [提交訊息指南](../../../../../core/commit-message-guide.md)
- [Git 工作流程](../../../../../core/git-workflow.md)
- [變更日誌標準](../../../../../core/changelog-standards.md)

---

## 版本歷史

| 版本 | 日期 | 變更內容 |
|------|------|----------|
| 1.0.0 | 2025-12-24 | 新增：標準區段（目的、相關標準、版本歷史、授權） |

---

## 授權

此技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
