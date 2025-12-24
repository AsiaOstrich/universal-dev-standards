---
source: /skills/claude-code/commit-standards/language-options.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# Commit Message 語言選項

> **語言**: [English](../../../../../skills/claude-code/commit-standards/language-options.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: Claude Code Skills

---

## 目的

本文件提供 commit message 類型的語言選項（英文、繁體中文或雙語）。

---

## 選項 A：英文（國際化）

適用於國際團隊和最大化工具相容性。

| 類型 | 使用時機 |
|------|----------|
| `feat` | 新功能 |
| `fix` | Bug 修復 |
| `refactor` | 程式碼重構 |
| `docs` | 文件更新 |
| `style` | 格式化 |
| `test` | 測試 |
| `perf` | 效能改進 |
| `build` | 建置系統 |
| `ci` | CI/CD 變更 |
| `chore` | 維護任務 |
| `revert` | 回退提交 |
| `security` | 安全修復 |

**範例**:
```
feat(auth): Add OAuth2 Google login support
```

---

## 選項 B：繁體中文（台灣團隊）

適用於偏好使用母語的本地團隊。

| 類型 | 使用時機 | English |
|------|----------|------|
| `新增` | 新功能 | feat |
| `修正` | Bug 修復 | fix |
| `重構` | 重構 | refactor |
| `文件` | 文件更新 | docs |
| `樣式` | 格式化 | style |
| `測試` | 測試 | test |
| `效能` | 效能改進 | perf |
| `建置` | 建置系統 | build |
| `整合` | CI/CD | ci |
| `維護` | 維護任務 | chore |
| `回退` | 回退提交 | revert |
| `安全` | 安全修復 | security |

**範例**:
```
新增(認證): 實作 OAuth2 Google 登入支援
```

---

## 選項 C：雙語模式（雙語對照）

使用英文 `type`/`scope` 以獲得工具相容性，搭配雙語 subject/body。

**格式**:
```
<type>(<scope>): <English subject>. <中文主旨>。

<English body>

<中文主體>

<footer>
```

**範例**:
```
feat(auth): Add OAuth2 Google login support. 新增 OAuth2 Google 登入支援。

Implement Google OAuth2 authentication flow for user login.

- Add Google OAuth2 SDK integration
- Create callback endpoint for OAuth flow
- Store refresh tokens securely

實作 Google OAuth2 認證流程供使用者登入。

- 整合 Google OAuth2 SDK
- 建立 OAuth 流程回呼端點
- 安全儲存更新權杖

Closes #123
```

---

## 語言選擇指南

| 因素 | English | 中文 | Bilingual |
|--------|---------|------|----------|
| **團隊** | 國際化 | 本地 | 混合 |
| **工具相容性** | ✅ 最佳 | ⚠️ 有限 | ✅ 良好 |
| **Changelog 自動化** | ✅ 完整 | ⚠️ 需客製化 | ✅ 支援 |
| **開源專案** | ✅ 推薦 | ❌ 不推薦 | ✅ 良好 |

### 快速選擇

- **開源專案** → English（選項 A）
- **本地團隊、內部專案** → 中文（選項 B）
- **本地團隊但有國際協作** → Bilingual（選項 C）

**重要**: 一旦選定，請保持一致。不要混用語言。

---

## 專案配置

在 `CONTRIBUTING.md` 中記錄你的選擇：

```markdown
## Commit Message 語言

本專案使用 **[English / Traditional Chinese / Bilingual]** commit 類型。

### 允許的類型
[根據你的選擇列出類型]

### 允許的範圍
- auth: 認證模組
- api: API 層
- ui: 使用者介面
[新增專案特定的範圍]
```

---

## 相關標準

- [Commit Message Guide](../../../../../core/commit-message-guide.md)
- [Conventional Commits Guide](./conventional-commits.md)

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：標準章節（目的、相關標準、版本歷史、授權） |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
