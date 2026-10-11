---
source: ../../../../options/commit-message/english.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 9c2d5e760869
status: current
---

# 英文 Commit 訊息

> **語言**: [English](../../../../options/commit-message/english.md) | 繁體中文

**上層標準**: [Commit 訊息指南](../../../../core/commit-message-guide.md)

---

## 概述

此選項定義完全使用英文撰寫 commit 訊息的標準。英文是軟體開發中使用最廣泛的語言，使 commit 對全球開發者社群都可理解。

## 適用情境

- 國際團隊
- 開源專案
- 有外部貢獻者的專案
- 以英文為公司語言的組織
- 追求最大可及性的專案

## 格式

### 基本結構

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 組成元素

| 元素 | 必填 | 說明 |
|------|------|------|
| type | 是 | 變更類別（feat、fix、docs 等）|
| scope | 否 | 影響的模組或元件 |
| subject | 是 | 簡短描述（祈使語氣）|
| body | 否 | 詳細說明 |
| footer | 否 | 參考連結、重大變更 |

## Commit 類型

| 類型 | 說明 | 範例 |
|------|------|------|
| `feat` | 新功能 | `feat: add user authentication` |
| `fix` | 錯誤修復 | `fix: resolve login timeout issue` |
| `docs` | 文件更新 | `docs: update API reference` |
| `style` | 格式調整 | `style: fix indentation in utils` |
| `refactor` | 程式碼重構 | `refactor: simplify validation logic` |
| `perf` | 效能優化 | `perf: optimize database queries` |
| `test` | 測試相關 | `test: add unit tests for auth module` |
| `chore` | 維護作業 | `chore: update dependencies` |
| `ci` | CI/CD 變更 | `ci: add GitHub Actions workflow` |
| `build` | 建置系統 | `build: configure webpack for production` |

## 撰寫指南

### 主題行

1. **使用祈使語氣**：「Add feature」而非「Added feature」
2. **冒號後不大寫**：「add feature」而非「Add feature」
3. **結尾不加句號**：「add feature」而非「add feature.」
4. **保持 50 字元以內**：簡潔扼要
5. **具體明確**：「fix null pointer in user service」而非「fix bug」

### 內文

1. **每行 72 字元**：在終端機中保持可讀性
2. **說明「什麼」和「為什麼」**：而非「如何」（程式碼會顯示如何）
3. **使用項目符號**：多項變更時
4. **與主題分隔**：使用空行

### 頁尾

1. **參照議題**：`Closes #123`、`Fixes #456`
2. **標註重大變更**：`BREAKING CHANGE: description`
3. **加入共同作者**：`Co-authored-by: Name <email>`

## 範例

### 簡單功能

```
feat(auth): add password strength indicator

- Display strength bar during password input
- Show requirements as user types
- Prevent submission of weak passwords

Closes #234
```

### 錯誤修復

```
fix(api): handle null response from payment gateway

The payment gateway occasionally returns null instead of an error
object when the service is degraded. This caused unhandled exceptions
in the checkout flow.

Added null check and appropriate error handling to gracefully
handle this edge case.

Fixes #567
```

### 重大變更

```
feat(api): change authentication to JWT tokens

BREAKING CHANGE: Session-based authentication is removed.
All API clients must now use JWT tokens for authentication.

Migration guide:
1. Obtain JWT token from /auth/token endpoint
2. Include token in Authorization header
3. Remove session cookie handling

Closes #789
```

### 文件

```
docs(readme): add installation instructions for Windows

- Add PowerShell commands
- Include WSL setup guide
- Add troubleshooting section
```

### 重構

```
refactor(core): extract validation into separate module

Move validation logic from UserService to dedicated
ValidationService for better separation of concerns and reusability.

No functional changes.
```

## 反模式

### 不良範例

```
# Too vague
fix: fix bug

# Past tense
fixed: fixed the login issue

# Too long
feat: add a new feature that allows users to upload their profile pictures and automatically resize them to multiple dimensions

# No type
update user service

# Meaningless
wip
misc changes
asdf
```

### 良好替代寫法

```
# Specific
fix(auth): prevent session timeout during file upload

# Imperative
fix(auth): resolve login redirect loop

# Concise with body for details
feat(users): add profile picture upload

Support JPEG, PNG, and WebP formats. Images are automatically
resized to 100x100, 200x200, and 400x400 pixels.

# With type
refactor(users): simplify service layer

# Clear purpose
feat(cache): add Redis support for session storage
```

## 設定

### Git Commit 範本

建立 `~/.gitmessage`：

```
# <type>(<scope>): <subject>
# |<----  Using a maximum of 50 characters  ---->|

# Explain why this change is being made
# |<----   Try to limit each line to 72 characters   ---->|

# Provide links or keys to any relevant issues or PRs
# Example: Closes #23
```

設定 git：

```bash
git config --global commit.template ~/.gitmessage
```

### Commitlint 設定

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 72],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build']
    ],
    'subject-case': [2, 'always', 'lower-case']
  }
};
```

## 相關選項

- [繁體中文](./traditional-chinese.md) - 繁體中文 Commit 訊息
- [雙語](./bilingual.md) - 中英雙語格式

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
